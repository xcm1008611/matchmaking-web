// 婚恋红娘服务平台 - 统一业务类型定义

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface LoginResult {
  token: string
  user: UserInfo
}

export interface UserInfo {
  id: string
  username: string
  name?: string
  nickname?: string
  realName?: string
  avatar?: string
  roles?: string[]
  role?: string
  roleName?: string
  phone?: string
}

export type StaffMember = StaffProfile
export type SuccessStory = StoryCase

export type UserRole = 'visitor' | 'client' | 'matchmaker' | 'counselor' | 'receptionist' | 'store_manager' | 'admin'

export interface UserAccount {
  id: string
  username: string
  name: string
  avatar: string
  role: UserRole
  roleName: string
  phone?: string
  storeId?: string
  storeName?: string
  title?: string
  unreadCount?: number
}

// 用户婚恋档案
export interface MemberProfile {
  id: string
  memberNo: string // 如 YJ-M-2026001
  name: string // 脱敏称呼，如 林女士 / 张先生
  gender: 'female' | 'male'
  age: number
  birthYearMonth: string
  height: number // cm
  weight?: number // kg
  city: string
  district?: string
  hometown: string
  education: '大专' | '本科' | '硕士' | '博士' | '其他'
  occupation: string // 职业，如 投资分析师
  industry: string // 行业
  incomeRange: '5000元以下' | '5000-10000元' | '10000-20000元' | '20000-50000元' | '50000元以上'
  income?: string
  housing: '已购房(有贷款)' | '已购房(无贷款)' | '计划购房' | '租房' | '暂不透露'
  vehicle: '已购车' | '计划购车' | '未购车' | '暂不透露'
  maritalStatus: '未婚' | '离异' | '丧偶'
  children: '无子女' | '有子女归自己' | '有子女归对方'
  livingStatus?: '独居' | '与父母同住' | '合租'
  smoking: '从不' | '偶尔' | '经常'
  drinking: '从不' | '偶尔' | '经常'
  hobbies: string[]
  personalityTags: string[]
  bio: string
  selfIntro?: string
  idealPartnerDesc: string
  avatar: string // 照片或形象
  photos: string[] // 公开生活照
  verified: boolean // 是否资料核验
  sincerityScore: number // 诚意指数 1-100
  matchScore?: number // 契合度推荐分数
  matchmakerId?: string
  matchmakerName?: string
  createdAt: string
  status: 'draft' | 'submitted' | 'approved' | 'matching' | 'closed'
  // 择偶期望
  partnerExpectations: {
    ageRange: [number, number]
    heightRange: [number, number]
    educationMin: string
    incomeMin: string
    city: string
    acceptLongDistance: boolean
    maritalStatus: string[]
    acceptChildren: boolean
    requireHouse: boolean
    topPriorities: string[] // 最看重的3个条件
    dealBreakers: string[] // 不能接受的条件
  }
}

// 红娘与顾问
export interface StaffProfile {
  id: string
  name: string
  role: 'matchmaker' | 'counselor' | 'receptionist'
  title: string // 资深婚恋红娘 / 高级情感督导
  experienceYears: number
  storeId: string
  storeName: string
  avatar: string
  specialties: string[] // 擅长领域
  philosophy: string // 服务理念
  intro: string
  rating: number // 评分 如 4.9
  successCount: number // 成功牵线/调解数
  currentClients: number // 当前服务中客户数
  availableSlots: string[] // 可预约时段
  reviewsCount?: number
  motto?: string
  matchedPairs?: number
  successRate?: number
}

// 成功案例
export interface StoryCase {
  id: string
  title: string
  type: 'match' | 'counseling' // 婚恋牵线 or 情感调解
  tag: string
  tags?: string[]
  coverImage: string
  coupleName: string // 如：陈先生 & 许女士
  maleName?: string
  femaleName?: string
  marriedDate?: string
  background: string // 初始困境/背景
  target: string // 诉求目标
  processNodes: {
    title: string
    date: string
    desc: string
  }[]
  result: string
  testimonial: string // 用户感言
  quote?: string
  summary?: string
  staffName: string
  staffRole: string
  staffAvatar: string
  matchmakerName?: string
  likesCount?: number
  date: string
  createdAt?: string
}

// 线索与客户全流程
export type LeadStatus = 
  | 'new'            // 新线索
  | 'pending_assign' // 待分配
  | 'assigned'       // 已分配
  | 'following'      // 跟进中
  | 'appointed'      // 已预约
  | 'visited'        // 已到店
  | 'pending_sign'   // 待签约
  | 'signed'         // 已签约
  | 'in_service'     // 服务中
  | 'completed'      // 已完成
  | 'suspended'      // 暂缓跟进
  | 'invalid'        // 无效线索

export interface LeadItem {
  id: string
  leadNo: string
  clientName: string
  gender: 'female' | 'male'
  age: number
  phone: string // 界面根据权限脱敏显示
  serviceType: 'match' | 'counseling' | 'consult' // 婚恋介绍 | 情感调解 | 综合咨询
  source: '前台预约' | '在线客服' | '会员申请' | '活动线索' | '转介绍' | '在线客服转交'
  storeId: string
  storeName: string
  status: LeadStatus
  handlerId?: string
  handlerName?: string
  handlerRole?: 'matchmaker' | 'counselor' | 'receptionist'
  intentLevel: 'high' | 'medium' | 'low' // 意向等级
  budget?: string
  notes: string
  createdAt: string
  lastFollowUpAt?: string
  nextFollowUpAt?: string
  followLogs: {
    id: string
    operatorName: string
    time: string
    type: '电话' | '在线会话' | '到店沟通' | '系统流转' | '电话跟进' | '线索转交'
    content: string
  }[]
}

// 在线咨询会话
export interface ChatMessage {
  id: string
  sender: 'user' | 'agent' | 'system'
  senderName: string
  avatar?: string
  time: string
  content: string
  type: 'text' | 'card' | 'quick_reply'
  cardData?: any
}

export interface ChatSession {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userPhone: string
  phone?: string
  userRole: string
  category: '找对象' | '红娘服务' | '费用咨询' | '预约到店' | '情感调解' | '其他' | '情感咨询'
  status: 'queue' | 'active' | 'waiting_user' | 'transferred' | 'closed'
  agentId?: string
  agentName?: string
  lastMessage: string
  lastTime: string
  unreadCount: number
  sourcePage: string
  source?: string
  messages: ChatMessage[]
}

// 约见与排班日程
export interface AppointmentItem {
  id: string
  title: string
  serviceType: 'match_meeting' | 'store_consult' | 'counseling_session'
  clientName: string
  targetMemberName?: string // 若是双人见面
  matchmakerId: string
  matchmakerName: string
  storeName: string
  roomName: string // 如：暖心包厢A
  date: string
  timeSlot: string
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'canceled' | 'feedback_done'
  notes?: string
  clientFeedback?: {
    impressionScore: number
    willingToContinue: boolean
    remarks: string
  }
}

// 情感个案
export interface CounselingCase {
  id: string
  caseNo: string
  clientName: string
  phone: string
  partnerName?: string
  category?: string
  brief?: string
  relationshipStatus: '恋爱中' | '已婚' | '分居/冷静期' | '离异重组' | '分手挽回'
  issueType: '沟通冷战' | '信任危机' | '家庭婆媳' | '婚前迷茫' | '性格磨合' | '外力干涉'
  severity: 'low' | 'medium' | 'high' // 紧迫程度
  counselorId: string
  counselorName: string
  storeName: string
  status: 'new' | 'assigned' | 'in_consulting' | 'pending_review' | 'completed' | 'closed' | 'in_progress' | 'resolved'
  sessionCount: number // 已完成会谈次数
  sessionsCount?: number
  totalPlanSessions: number
  description: string
  targetGoal: string
  counselingLogs: {
    id: string
    date: string
    topic: string
    summary: string
    homework: string
    statusAssessment: string
  }[]
  createdAt: string
}
