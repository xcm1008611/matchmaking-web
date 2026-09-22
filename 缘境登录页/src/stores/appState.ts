import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  MOCK_USERS,
  MOCK_MEMBERS,
  MOCK_STAFF,
  MOCK_STORIES,
  MOCK_LEADS,
  MOCK_SESSIONS,
  MOCK_APPOINTMENTS,
  MOCK_COUNSELING_CASES
} from '@/mock'
import type {
  UserAccount,
  UserRole,
  MemberProfile,
  LeadItem,
  ChatSession,
  ChatMessage,
  AppointmentItem,
  CounselingCase
} from '@/types'
import { ElMessage } from 'element-plus'

export const useAppStateStore = defineStore('appState', () => {
  // 1. 当前登录/演示角色
  const currentRole = ref<UserRole>('visitor')
  const currentUser = computed<UserAccount>(() => {
    return MOCK_USERS[currentRole.value] || MOCK_USERS.visitor
  })

  // 2. 核心业务数据集（支持在原型中动态增删改）
  const members = ref<MemberProfile[]>([...MOCK_MEMBERS])
  const staffList = ref([...MOCK_STAFF])
  const stories = ref([...MOCK_STORIES])
  const leads = ref<LeadItem[]>([...MOCK_LEADS])
  const chatSessions = ref<ChatSession[]>([...MOCK_SESSIONS])
  const appointments = ref<AppointmentItem[]>([...MOCK_APPOINTMENTS])
  const counselingCases = ref<CounselingCase[]>([...MOCK_COUNSELING_CASES])

  // 当前登录会员最近一次主动表达意向的牵线对象
  const tongxinMatch = ref<MemberProfile | null>(null)

  // 3. 用户前台在线客服浮窗状态
  const isChatDrawerOpen = ref(false)
  const clientActiveChatCategory = ref<string>('找对象')

  // 4. 角色切换动作
  function switchRole(role: UserRole) {
    currentRole.value = role
    ElMessage.success({
      message: `已无缝切换到演示身份：${MOCK_USERS[role]?.name}（${MOCK_USERS[role]?.roleName}）`,
      duration: 2500
    })
  }

  // 5. 业务操作：提交相亲/婚恋意向（请红娘牵线）
  function submitMemberInterest(memberId: string, remark = '') {
    const target = members.value.find((m) => m.id === memberId)
    if (!target) return

    // 自动为红娘生成一条高意向线索/任务
    const newLead: LeadItem = {
      id: `lead_${Date.now()}`,
      leadNo: `LD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${leads.value.length + 1}`,
      clientName: currentUser.value.role === 'client' ? currentUser.value.name : '林书雅 (会员)',
      gender: 'female',
      age: 28,
      phone: '13812346821',
      serviceType: 'match',
      source: '会员申请',
      storeId: 'store_sh_01',
      storeName: '上海静安旗舰店',
      status: 'following',
      handlerId: target.matchmakerId || 'staff_mm_01',
      handlerName: target.matchmakerName || '苏婉宁',
      handlerRole: 'matchmaker',
      intentLevel: 'high',
      notes: `客户对会员 ${target.memberNo}（${target.name}）表达了牵线好感。附言：${remark || '期望红娘老师协助牵线'}`,
      createdAt: new Date().toLocaleString(),
      followLogs: [
        {
          id: `fl_${Date.now()}`,
          operatorName: '系统自动流转',
          time: new Date().toLocaleTimeString(),
          type: '系统流转',
          content: `客户在前台发起对【${target.name} · ${target.occupation}】的牵线意向，指派红娘【${target.matchmakerName}】跟进`
        }
      ]
    }

    leads.value.unshift(newLead)
    tongxinMatch.value = target
    ElMessage.success(`牵线意向已提交！已通知红娘【${target.matchmakerName}】为您评估并征询对方意向`)
  }

  // 6. 业务操作：提交预约到店/咨询
  function submitAppointment(payload: {
    name: string
    phone: string
    serviceType: 'match' | 'counseling' | 'consult'
    date: string
    timeSlot: string
    storeName: string
    notes?: string
  }) {
    const newLead: LeadItem = {
      id: `lead_${Date.now()}`,
      leadNo: `LD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${leads.value.length + 1}`,
      clientName: payload.name,
      gender: 'female',
      age: 28,
      phone: payload.phone,
      serviceType: payload.serviceType,
      source: '前台预约',
      storeId: 'store_sh_01',
      storeName: payload.storeName,
      status: 'appointed',
      handlerId: payload.serviceType === 'counseling' ? 'staff_cs_01' : 'staff_mm_01',
      handlerName: payload.serviceType === 'counseling' ? '沈清墨' : '苏婉宁',
      handlerRole: payload.serviceType === 'counseling' ? 'counselor' : 'matchmaker',
      intentLevel: 'high',
      notes: `预约时间：${payload.date} ${payload.timeSlot}。需求说明：${payload.notes || '无'}`,
      createdAt: new Date().toLocaleString(),
      nextFollowUpAt: `${payload.date} ${payload.timeSlot}`,
      followLogs: [
        {
          id: `fl_${Date.now()}`,
          operatorName: '在线预约系统',
          time: new Date().toLocaleTimeString(),
          type: '系统流转',
          content: `客户自主提交预约到店申请（${payload.storeName}，${payload.date} ${payload.timeSlot}）`
        }
      ]
    }

    leads.value.unshift(newLead)
    ElMessage.success('预约成功！门店顾问将在2小时内致电与您核对到店详情')
  }

  // 7. 客服发消息
  function sendChatMessage(sessionId: string, text: string, sender: 'user' | 'agent' = 'user') {
    const session = chatSessions.value.find((s) => s.id === sessionId)
    if (!session) return

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender,
      senderName: sender === 'user' ? session.userName : (session.agentName || '在线客服'),
      avatar: sender === 'user' ? session.userAvatar : undefined,
      time: new Date().toLocaleTimeString().slice(0, 5),
      type: 'text',
      content: text
    }

    session.messages.push(newMsg)
    session.lastMessage = text
    session.lastTime = newMsg.time
  }

  // 8. 红娘创建新约见
  function createMeetingAppointment(payload: {
    clientName: string
    targetMemberName: string
    date: string
    timeSlot: string
    roomName: string
    notes?: string
  }) {
    const newApt: AppointmentItem = {
      id: `apt_${Date.now()}`,
      title: `${payload.clientName} & ${payload.targetMemberName} · 线下约见`,
      serviceType: 'match_meeting',
      clientName: payload.clientName,
      targetMemberName: payload.targetMemberName,
      matchmakerId: currentUser.value.id,
      matchmakerName: currentUser.value.name,
      storeName: '上海静安旗舰店',
      roomName: payload.roomName,
      date: payload.date,
      timeSlot: payload.timeSlot,
      status: 'confirmed',
      notes: payload.notes || '已完成双方意向征询，红娘安排茶室破冰'
    }

    appointments.value.unshift(newApt)
    ElMessage.success(`约见排期成功！已发送短信提醒双方并锁定【${payload.roomName}】`)
  }

  // 9. 更新线索状态
  function updateLeadStatus(leadId: string, newStatus: any, operatorNote: string) {
    const lead = leads.value.find((l) => l.id === leadId)
    if (!lead) return
    lead.status = newStatus
    lead.lastFollowUpAt = new Date().toLocaleString()
    lead.followLogs.push({
      id: `fl_${Date.now()}`,
      operatorName: currentUser.value.name,
      time: new Date().toLocaleTimeString(),
      type: '系统流转',
      content: `状态变更为【${newStatus}】，备注：${operatorNote}`
    })
    ElMessage.success('线索状态更新成功！')
  }

  return {
    currentRole,
    currentUser,
    tongxinMatch,
    members,
    staffList,
    stories,
    leads,
    chatSessions,
    appointments,
    counselingCases,
    isChatDrawerOpen,
    clientActiveChatCategory,
    switchRole,
    submitMemberInterest,
    submitAppointment,
    sendChatMessage,
    createMeetingAppointment,
    updateLeadStatus
  }
})
