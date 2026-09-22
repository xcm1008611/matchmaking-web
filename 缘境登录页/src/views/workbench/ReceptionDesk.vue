<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStateStore } from '@/stores/appState'
import {
  ChatDotRound,
  User,
  Phone,
  Search,
  Check,
  Promotion,
  Plus,
  ArrowRight,
  Service
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { ChatSession } from '@/types'

const appStore = useAppStateStore()

const searchKeyword = ref('')
const activeSessionId = ref<string>(appStore.chatSessions[0]?.id || '')
const replyInput = ref('')

const activeSession = computed(() => {
  return appStore.chatSessions.find((s) => s.id === activeSessionId.value)
})

const filteredSessions = computed(() => {
  return appStore.chatSessions.filter((s) => {
    if (!searchKeyword.value.trim()) return true
    const kw = searchKeyword.value.trim().toLowerCase()
    return (
      s.userName.toLowerCase().includes(kw) ||
      s.category.toLowerCase().includes(kw) ||
      s.lastMessage.toLowerCase().includes(kw)
    )
  })
})

function selectSession(s: ChatSession) {
  activeSessionId.value = s.id
  s.unreadCount = 0
}

function sendReply() {
  if (!replyInput.value.trim()) return
  appStore.sendChatMessage(activeSessionId.value, replyInput.value.trim(), 'agent')
  replyInput.value = ''
}

// 快速快捷回复语料
const quickReplies = [
  '您好！我是阿拉小红娘在线客服小萌，请问是想了解一对一红娘牵线，还是情感修复咨询呢？',
  '阿拉小红娘所有注册会员均通过公安实名、学信网学历以及房产资产严格核验，100%保证信息真实。',
  '我们可以为您预约到静安旗舰店私密中式茶室进行免费的深度择偶画像评测，您看这周六方便吗？',
  '已为您记录需求，我马上将您的档案转交给红娘主管苏婉宁老师！'
]

function useQuickReply(text: string) {
  replyInput.value = text
}

// 线索转交红娘/顾问弹窗
const dispatchModalVisible = ref(false)
const dispatchTargetRole = ref<'matchmaker' | 'counselor'>('matchmaker')
const dispatchTargetStaff = ref('staff_mm_01')
const dispatchNotes = ref('')

function openDispatchModal() {
  if (!activeSession.value) return
  dispatchNotes.value = `客户意向分类：${activeSession.value.category}，最新诉求：${activeSession.value.lastMessage}`
  dispatchModalVisible.value = true
}

function handleConfirmDispatch() {
  if (!activeSession.value) return
  const staff = appStore.staffList.find((s) => s.id === dispatchTargetStaff.value)

  appStore.leads.unshift({
    id: `lead_${Date.now()}`,
    leadNo: `LD-${Date.now().toString().slice(-6)}`,
    clientName: activeSession.value.userName,
    gender: 'female',
    age: 28,
    phone: activeSession.value.phone || '13812346821',
    serviceType: dispatchTargetRole.value === 'matchmaker' ? 'match' : 'counseling',
    source: '在线客服转交',
    storeId: 'store_sh_01',
    storeName: '上海静安旗舰店',
    status: 'following',
    handlerId: dispatchTargetStaff.value,
    handlerName: staff?.name || '苏婉宁',
    handlerRole: dispatchTargetRole.value,
    intentLevel: 'high',
    notes: dispatchNotes.value,
    createdAt: new Date().toLocaleString(),
    followLogs: [
      {
        id: `fl_${Date.now()}`,
        operatorName: '客服接待 · 李晓萌',
        time: new Date().toLocaleTimeString(),
        type: '线索转交',
        content: `在线客服接待完毕，识别高意向，转交${dispatchTargetRole.value === 'matchmaker' ? '红娘' : '情感顾问'}【${staff?.name}】跟进`
      }
    ]
  })

  dispatchModalVisible.value = false
  ElMessage.success(`已成功将【${activeSession.value.userName}】转交给【${staff?.name}】！`)
}
</script>

<template>
  <div class="reception-desk-page">
    <!-- 顶部状态条 -->
    <div class="desk-topbar">
      <div class="desk-title">
        <h2>客服在线接待中心 · 实时会话与线索分流</h2>
        <span class="desk-sub">当前接待员：李晓萌 · 状态：在线接听中 · 今日接待量：28人</span>
      </div>
      <div class="desk-actions">
        <el-tag type="success" effect="dark">接入通道正常</el-tag>
      </div>
    </div>

    <!-- 主体聊天与线索工作区 -->
    <div class="desk-workspace">
      <!-- 左侧：会话列表 -->
      <div class="session-list-pane">
        <div class="session-search">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索客户姓名 / 诉求标签..."
            :prefix-icon="Search"
            clearable
            size="small"
          />
        </div>

        <div class="session-items">
          <div
            v-for="s in filteredSessions"
            :key="s.id"
            class="session-item"
            :class="{ active: s.id === activeSessionId }"
            @click="selectSession(s)"
          >
            <div class="session-avatar-box">
              <img :src="s.userAvatar" class="user-avatar" />
              <span v-if="s.unreadCount > 0" class="unread-badge">{{ s.unreadCount }}</span>
            </div>

            <div class="session-meta">
              <div class="meta-top">
                <strong class="user-name">{{ s.userName }}</strong>
                <span class="msg-time">{{ s.lastTime }}</span>
              </div>
              <p class="last-msg">{{ s.lastMessage }}</p>
              <div class="meta-bottom">
                <span class="cat-tag">{{ s.category }}</span>
                <span class="source-tag">{{ s.source }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中间：当前会话聊天窗 -->
      <div v-if="activeSession" class="chat-main-pane">
        <!-- 聊天头部 -->
        <div class="chat-header">
          <div class="ch-user">
            <img :src="activeSession.userAvatar" class="ch-avatar" />
            <div>
              <h3>{{ activeSession.userName }} <span class="phone">({{ activeSession.phone }})</span></h3>
              <p>来源：{{ activeSession.source }} · 诉求：{{ activeSession.category }}</p>
            </div>
          </div>

          <div class="ch-actions">
            <button class="btn-dispatch" @click="openDispatchModal">
              <el-icon><Promotion /></el-icon>
              <span>转交红娘/顾问跟进</span>
            </button>
          </div>
        </div>

        <!-- 消息流 -->
        <div class="chat-message-list">
          <div
            v-for="msg in activeSession.messages"
            :key="msg.id"
            class="msg-bubble-wrap"
            :class="msg.sender === 'agent' ? 'is-agent' : 'is-user'"
          >
            <div class="msg-bubble">
              <span class="sender-name">{{ msg.senderName }} ({{ msg.time }})</span>
              <div class="bubble-content">{{ msg.content }}</div>
            </div>
          </div>
        </div>

        <!-- 快捷回复工具栏 -->
        <div class="quick-reply-bar">
          <span class="qr-lbl">快捷话术：</span>
          <div class="qr-chips">
            <span
              v-for="(qr, idx) in quickReplies"
              :key="idx"
              class="qr-chip"
              @click="useQuickReply(qr)"
            >
              {{ qr.slice(0, 16) }}...
            </span>
          </div>
        </div>

        <!-- 输入区域 -->
        <div class="chat-input-area">
          <textarea
            v-model="replyInput"
            placeholder="输入回复内容（Enter 发送）..."
            rows="3"
            @keydown.enter.prevent="sendReply"
          ></textarea>
          <div class="input-actions">
            <span class="hint">按 Enter 发送</span>
            <button class="btn-send" @click="sendReply">发送回复</button>
          </div>
        </div>
      </div>

      <!-- 右侧：客户画像侧边栏 -->
      <div v-if="activeSession" class="customer-info-pane">
        <div class="info-head">
          <h4>客户档案与跟进建议</h4>
        </div>

        <div class="info-section">
          <div class="info-row">
            <span class="lbl">客户姓名：</span>
            <strong>{{ activeSession.userName }}</strong>
          </div>
          <div class="info-row">
            <span class="lbl">联系电话：</span>
            <span>{{ activeSession.phone }}</span>
          </div>
          <div class="info-row">
            <span class="lbl">意向分类：</span>
            <span class="highlight">{{ activeSession.category }}</span>
          </div>
          <div class="info-row">
            <span class="lbl">咨询渠道：</span>
            <span>{{ activeSession.source }}</span>
          </div>
        </div>

        <div class="guide-box">
          <h5>💡 AI 接待智能建议</h5>
          <p>
            该客户表现出较强的找对象明确意愿，建议重点介绍“四重实名认证体系”与“私密茶室约见”模式，引导预约本周末静安旗舰店到店面询，并转派给红娘【苏婉宁】。
          </p>
        </div>
      </div>
    </div>

    <!-- 转交分流弹窗 -->
    <el-dialog
      v-model="dispatchModalVisible"
      title="将客户线索转交给专业红娘 / 情感顾问"
      width="540px"
      append-to-body
      class="oriental-dialog"
    >
      <el-form label-position="top">
        <el-form-item label="分流业务方向">
          <el-radio-group v-model="dispatchTargetRole" size="large">
            <el-radio-button label="matchmaker" value="matchmaker">婚恋牵线 (转红娘)</el-radio-button>
            <el-radio-button label="counselor" value="counselor">情感调解 (转顾问)</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="指派接收人员">
          <el-select v-model="dispatchTargetStaff" style="width: 100%;">
            <el-option
              v-for="s in appStore.staffList.filter((st) => st.role === dispatchTargetRole)"
              :key="s.id"
              :label="`${s.name}（${s.title} · ${s.storeName}）`"
              :value="s.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="接待交接要点与客户诉求">
          <el-input
            v-model="dispatchNotes"
            type="textarea"
            :rows="3"
            placeholder="填写客户在沟通中透露的择偶或调解关键信息..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dispatchModalVisible = false">取消</el-button>
          <el-button type="primary" class="btn-oriental-hot" @click="handleConfirmDispatch">
            确认转交建档
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.reception-desk-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px);
}

.desk-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 16px 24px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.desk-title h2 {
  font-size: 18px;
  color: var(--color-ink);
  font-weight: 700;
}
.desk-sub {
  font-size: 12px;
  color: var(--color-ink-muted);
  margin-top: 4px;
  display: block;
}

.desk-workspace {
  display: grid;
  grid-template-columns: 280px 1fr 280px;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

/* 左侧会话 */
.session-list-pane {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.session-search {
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.session-items {
  flex: 1;
  overflow-y: auto;
}
.session-item {
  display: flex;
  gap: 12px;
  padding: 14px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s;
}
.session-item:hover {
  background: #fbf9f8;
}
.session-item.active {
  background: rgba(201, 75, 98, 0.08);
  border-left: 3px solid var(--color-crimson);
}
.session-avatar-box {
  position: relative;
}
.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}
.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--color-crimson);
  color: #ffffff;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 700;
}
.session-meta {
  flex: 1;
  min-width: 0;
}
.meta-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}
.user-name {
  font-size: 14px;
  color: var(--color-ink);
}
.msg-time {
  font-size: 11px;
  color: var(--color-ink-muted);
}
.last-msg {
  font-size: 12px;
  color: var(--color-ink-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
}
.meta-bottom {
  display: flex;
  gap: 6px;
}
.cat-tag {
  font-size: 10px;
  color: var(--color-crimson);
  background: rgba(201, 75, 98, 0.1);
  padding: 1px 6px;
  border-radius: 4px;
}
.source-tag {
  font-size: 10px;
  color: var(--color-ink-muted);
  background: #eee;
  padding: 1px 6px;
  border-radius: 4px;
}

/* 中间聊天 */
.chat-main-pane {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.ch-user {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ch-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}
.ch-user h3 {
  font-size: 16px;
  color: var(--color-ink);
}
.ch-user .phone {
  font-size: 12px;
  color: var(--color-ink-muted);
  font-weight: normal;
}
.ch-user p {
  font-size: 12px;
  color: var(--color-ink-muted);
}
.btn-dispatch {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--color-crimson), var(--color-gold));
  color: #ffffff;
  border: none;
  border-radius: 18px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(201, 75, 98, 0.3);
}

.chat-message-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #fcfbfa;
}
.msg-bubble-wrap {
  display: flex;
}
.msg-bubble-wrap.is-agent {
  justify-content: flex-end;
}
.msg-bubble {
  max-width: 70%;
}
.sender-name {
  font-size: 11px;
  color: var(--color-ink-muted);
  display: block;
  margin-bottom: 4px;
}
.msg-bubble-wrap.is-agent .sender-name {
  text-align: right;
}
.bubble-content {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
}
.msg-bubble-wrap.is-user .bubble-content {
  background: #ffffff;
  color: var(--color-ink);
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.msg-bubble-wrap.is-agent .bubble-content {
  background: var(--color-crimson);
  color: #ffffff;
}

.quick-reply-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f8f8;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 12px;
}
.qr-lbl {
  color: var(--color-ink-muted);
  white-space: nowrap;
}
.qr-chips {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}
.qr-chip {
  background: #ffffff;
  padding: 3px 10px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: var(--color-ink);
  cursor: pointer;
  white-space: nowrap;
}
.qr-chip:hover {
  border-color: var(--color-crimson);
  color: var(--color-crimson);
}

.chat-input-area {
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}
.chat-input-area textarea {
  width: 100%;
  border: none;
  resize: none;
  font-size: 13px;
  outline: none;
  font-family: inherit;
}
.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}
.hint {
  font-size: 11px;
  color: var(--color-ink-muted);
}
.btn-send {
  padding: 6px 18px;
  background: var(--color-crimson);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

/* 右侧画像 */
.customer-info-pane {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 18px;
}
.info-head h4 {
  font-size: 15px;
  color: var(--color-ink);
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.info-row {
  font-size: 13px;
  margin-bottom: 12px;
}
.info-row .lbl {
  color: var(--color-ink-muted);
  display: inline-block;
  width: 80px;
}
.info-row .highlight {
  color: var(--color-crimson);
  font-weight: 700;
}
.guide-box {
  margin-top: 24px;
  background: #fbf8f5;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(194, 147, 83, 0.2);
}
.guide-box h5 {
  font-size: 13px;
  color: var(--color-gold);
  margin-bottom: 6px;
}
.guide-box p {
  font-size: 12px;
  color: var(--color-ink);
  line-height: 1.6;
}
.btn-oriental-hot {
  background: linear-gradient(135deg, var(--color-crimson), var(--color-gold)) !important;
  border: none !important;
  color: #fff !important;
}
</style>
