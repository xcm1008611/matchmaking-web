<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStateStore } from '@/stores/appState'
import {
  Document,
  FirstAidKit,
  CoffeeCup,
  Service,
  Search,
  Filter,
  View,
  Edit,
  Check,
  Close,
  Download,
  Plus,
  Refresh,
  ChatDotRound,
  Calendar,
  User,
  WarningFilled,
  StarFilled,
  Coordinate,
  CircleCheck,
  Promotion,
  Clock
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CounselingCase, AppointmentItem, ChatSession } from '@/types'

const appStore = useAppStateStore()

// 当前激活的档案类别 Tab
const activeTab = ref<'counseling' | 'appointments' | 'sessions' | 'supervision'>('counseling')

// 搜索与筛选条件
const searchKeyword = ref('')
const selectedCounselor = ref('all')
const selectedStatus = ref('all')
const selectedStore = ref('all')

// 1. 情感调解个案档案列表
const filteredCounselingCases = computed(() => {
  return appStore.counselingCases.filter((c) => {
    const matchKw =
      !searchKeyword.value.trim() ||
      c.caseNo.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      c.clientName.includes(searchKeyword.value) ||
      c.counselorName.includes(searchKeyword.value) ||
      c.issueType.includes(searchKeyword.value)

    const matchCounselor =
      selectedCounselor.value === 'all' || c.counselorName === selectedCounselor.value

    const matchStatus =
      selectedStatus.value === 'all' || c.status === selectedStatus.value

    return matchKw && matchCounselor && matchStatus
  })
})

// 2. 红娘茶室约见与见面复盘记录
const filteredAppointments = computed(() => {
  return appStore.appointments.filter((a) => {
    const matchKw =
      !searchKeyword.value.trim() ||
      a.title.includes(searchKeyword.value) ||
      a.clientName.includes(searchKeyword.value) ||
      (a.targetMemberName && a.targetMemberName.includes(searchKeyword.value)) ||
      a.matchmakerName.includes(searchKeyword.value)

    const matchStatus =
      selectedStatus.value === 'all' || a.status === selectedStatus.value

    return matchKw && matchStatus
  })
})

// 3. 客服在线接待会话质检列表
const filteredSessions = computed(() => {
  return appStore.chatSessions.filter((s) => {
    const matchKw =
      !searchKeyword.value.trim() ||
      s.userName.includes(searchKeyword.value) ||
      s.category.includes(searchKeyword.value) ||
      s.lastMessage.includes(searchKeyword.value)

    return matchKw
  })
})

// 抽屉详情弹窗状态
const drawerVisible = ref(false)
const selectedCase = ref<CounselingCase | null>(null)
const selectedAppointment = ref<AppointmentItem | null>(null)
const selectedSession = ref<ChatSession | null>(null)
const drawerType = ref<'case' | 'appointment' | 'session'>('case')

// 查看情感个案详情
function viewCaseDetail(c: CounselingCase) {
  selectedCase.value = c
  drawerType.value = 'case'
  drawerVisible.value = true
}

// 查看约见复盘详情
function viewAppointmentDetail(a: AppointmentItem) {
  selectedAppointment.value = a
  drawerType.value = 'appointment'
  drawerVisible.value = true
}

// 查看客服会话质检详情
function viewSessionDetail(s: ChatSession) {
  selectedSession.value = s
  drawerType.value = 'session'
  drawerVisible.value = true
}

// 新增督导评语
const newSupervisorNote = ref('')
function submitSupervisorAudit() {
  if (!newSupervisorNote.value.trim()) {
    ElMessage.warning('请输入督导/复盘审核评语！')
    return
  }
  ElMessage.success('督导批注与质检意见已归档并同步至相关员工工作台！')
  newSupervisorNote.value = ''
}

// 模拟导出档案记录
function exportRecords() {
  ElMessage.success('已导出《员工服务个案与客户约见全景档案.xlsx》！')
}

// 质检抽检评分记录 (督导看板)
const auditMetrics = [
  { label: '情感咨询归档合规率', val: '98.5%', target: '95.0%', status: 'success' },
  { label: '红娘茶室复盘录入时效', val: '2.4小时内', target: '4小时内', status: 'success' },
  { label: '客服接待标准话术执行率', val: '99.1%', target: '98.0%', status: 'success' },
  { label: '敏感词与客资泄露拦截', val: '0 起事故', target: '0 起', status: 'success' }
]
</script>

<template>
  <div class="service-records-manage-page">
    <!-- 顶部状态栏与 Tab 切换 -->
    <div class="page-topbar">
      <div class="brand-block">
        <div class="title-row">
          <span class="icon">📋</span>
          <h2>员工工作台服务记录与个案档案监管</h2>
          <span class="status-badge">全景服务流转审计</span>
        </div>
        <p class="sub">
          集中查看与监管各员工（情感顾问、金牌红娘、在线客服）在工作台产生的个案调解档案、茶室约见复盘、客户回访记录与服务质量质检
        </p>
      </div>

      <div class="topbar-actions">
        <el-button :icon="Download" @click="exportRecords">导出服务档案</el-button>
        <el-button type="primary" :icon="Refresh" class="btn-gold" @click="ElMessage.success('服务档案数据已刷新！')">
          同步最新记录
        </el-button>
      </div>
    </div>

    <!-- 顶部核心质检 KPI -->
    <div class="audit-kpi-grid">
      <div v-for="k in auditMetrics" :key="k.label" class="audit-kpi-card">
        <div class="kpi-info">
          <span class="lbl">{{ k.label }}</span>
          <strong class="val">{{ k.val }}</strong>
        </div>
        <span class="tag-target">达标基准: {{ k.target }}</span>
      </div>
    </div>

    <!-- 核心业务分类 Tabs -->
    <div class="records-content-panel">
      <div class="panel-nav-row">
        <div class="custom-tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'counseling' }"
            @click="activeTab = 'counseling'"
          >
            <el-icon><FirstAidKit /></el-icon>
            <span>情感顾问 · 个案调解档案 ({{ appStore.counselingCases.length }})</span>
          </button>

          <button
            class="tab-btn"
            :class="{ active: activeTab === 'appointments' }"
            @click="activeTab = 'appointments'"
          >
            <el-icon><CoffeeCup /></el-icon>
            <span>红娘工作台 · 茶室约见与复盘 ({{ appStore.appointments.length }})</span>
          </button>

          <button
            class="tab-btn"
            :class="{ active: activeTab === 'sessions' }"
            @click="activeTab = 'sessions'"
          >
            <el-icon><Service /></el-icon>
            <span>客服接待台 · 在线会话与初筛 ({{ appStore.chatSessions.length }})</span>
          </button>

          <button
            class="tab-btn"
            :class="{ active: activeTab === 'supervision' }"
            @click="activeTab = 'supervision'"
          >
            <el-icon><StarFilled /></el-icon>
            <span>业务总监 · 质检督导与风险预警</span>
          </button>
        </div>

        <!-- 筛选与搜索工具条 -->
        <div class="filter-toolbar">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索案号/客户名/负责员工/关键词..."
            :prefix-icon="Search"
            clearable
            style="width: 260px;"
          />

          <el-select
            v-if="activeTab === 'counseling'"
            v-model="selectedCounselor"
            placeholder="负责咨询师"
            style="width: 140px;"
          >
            <el-option label="全部咨询师" value="all" />
            <el-option label="沈清墨" value="沈清墨" />
            <el-option label="顾一舟" value="顾一舟" />
          </el-select>

          <el-select
            v-if="activeTab === 'counseling' || activeTab === 'appointments'"
            v-model="selectedStatus"
            placeholder="状态筛选"
            style="width: 130px;"
          >
            <el-option label="全部状态" value="all" />
            <el-option v-if="activeTab === 'counseling'" label="咨询中" value="in_consulting" />
            <el-option v-if="activeTab === 'counseling'" label="待初访" value="new" />
            <el-option v-if="activeTab === 'appointments'" label="已确认" value="confirmed" />
            <el-option v-if="activeTab === 'appointments'" label="已完成" value="completed" />
          </el-select>
        </div>
      </div>

      <!-- 1. 情感顾问：个案调解档案表格与记录 -->
      <div v-if="activeTab === 'counseling'" class="table-container">
        <el-table :data="filteredCounselingCases" style="width: 100%" stripe>
          <el-table-column prop="caseNo" label="个案档案编号" width="140">
            <template #default="{ row }">
              <span class="case-no-tag">{{ row.caseNo }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="clientName" label="委托客户 / 当事人" width="160">
            <template #default="{ row }">
              <div class="client-cell">
                <strong>{{ row.clientName }}</strong>
                <span class="rel-tag">{{ row.relationshipStatus }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="issueType" label="问题类型" width="130">
            <template #default="{ row }">
              <span class="issue-badge">{{ row.issueType }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="severity" label="危机等级" width="110">
            <template #default="{ row }">
              <el-tag
                :type="row.severity === 'high' ? 'danger' : 'warning'"
                effect="light"
                size="small"
              >
                {{ row.severity === 'high' ? '高危 / 紧迫' : '中度 / 沟通' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="counselorName" label="负责情感专家" width="140">
            <template #default="{ row }">
              <div class="staff-cell">
                <el-icon><User /></el-icon>
                <span>{{ row.counselorName }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="咨询阶段进度" width="160">
            <template #default="{ row }">
              <div class="session-progress">
                <span>已完成 <strong>{{ row.sessionCount }}</strong> / {{ row.totalPlanSessions }} 次</span>
                <el-progress
                  :percentage="Math.round((row.sessionCount / row.totalPlanSessions) * 100)"
                  :status="row.sessionCount === row.totalPlanSessions ? 'success' : undefined"
                  :stroke-width="6"
                />
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="targetGoal" label="核心调解目标" min-width="200" show-overflow-tooltip />

          <el-table-column prop="createdAt" label="建档日期" width="120" />

          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link :icon="View" @click="viewCaseDetail(row)">
                查看全案记录
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 2. 红娘工作台：茶室约见与见面复盘看板 -->
      <div v-if="activeTab === 'appointments'" class="table-container">
        <el-table :data="filteredAppointments" style="width: 100%" stripe>
          <el-table-column prop="date" label="约见时间" width="180">
            <template #default="{ row }">
              <div class="time-cell">
                <strong>{{ row.date }}</strong>
                <span class="slot">{{ row.timeSlot }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="title" label="约见主题 / 服务类型" min-width="200">
            <template #default="{ row }">
              <div class="apt-title-row">
                <span class="type-pill" :class="row.serviceType">
                  {{ row.serviceType === 'match_meeting' ? '🏮 双人见面' : '🍵 深度面谈' }}
                </span>
                <strong class="title-text">{{ row.title }}</strong>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="参与客户" width="180">
            <template #default="{ row }">
              <div>{{ row.clientName }}</div>
              <div v-if="row.targetMemberName" class="target-member">配对：{{ row.targetMemberName }}</div>
            </template>
          </el-table-column>

          <el-table-column prop="roomName" label="所在门店与茶室" width="190">
            <template #default="{ row }">
              <div class="room-cell">
                <span>{{ row.storeName }}</span>
                <span class="room-tag">{{ row.roomName }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="matchmakerName" label="主持红娘" width="120">
            <template #default="{ row }">
              <el-tag effect="plain" size="small">{{ row.matchmakerName }}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="当前状态" width="110">
            <template #default="{ row }">
              <el-tag
                :type="row.status === 'completed' ? 'success' : row.status === 'confirmed' ? 'primary' : 'info'"
                size="small"
              >
                {{ row.status === 'completed' ? '已完成复盘' : row.status === 'confirmed' ? '已排期确认' : row.status }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="复盘反馈" width="160">
            <template #default="{ row }">
              <div v-if="row.clientFeedback" class="feedback-snippet">
                <span class="score text-gold">满意度 {{ row.clientFeedback.impressionScore }}分</span>
                <span class="status-yes">愿意深入接触</span>
              </div>
              <span v-else class="text-muted">待履约后复盘</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link :icon="View" @click="viewAppointmentDetail(row)">
                查看复盘单
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 3. 客服接待台：在线会话与线索流转质检 -->
      <div v-if="activeTab === 'sessions'" class="table-container">
        <el-table :data="filteredSessions" style="width: 100%" stripe>
          <el-table-column label="咨询访客 / 意向会员" width="180">
            <template #default="{ row }">
              <div class="visitor-cell">
                <img :src="row.userAvatar" class="v-avatar" />
                <div>
                  <strong>{{ row.userName }}</strong>
                  <span class="phone">{{ row.userPhone }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="category" label="咨询诉求" width="120">
            <template #default="{ row }">
              <span class="cat-badge">{{ row.category }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="sourcePage" label="来源页面" width="180" show-overflow-tooltip />

          <el-table-column prop="lastMessage" label="最新对话内容摘要" min-width="260" show-overflow-tooltip>
            <template #default="{ row }">
              <div class="last-msg">
                <span>{{ row.lastMessage }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="agentName" label="接待客服" width="130">
            <template #default="{ row }">
              <span class="agent-tag">{{ row.agentName || '待认领' }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="lastTime" label="最后交互" width="110" />

          <el-table-column label="质检抽查" width="130" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link :icon="ChatDotRound" @click="viewSessionDetail(row)">
                调阅会话流
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 4. 业务总监：质检督导与风险预警面板 -->
      <div v-if="activeTab === 'supervision'" class="supervision-container">
        <div class="supervision-grid">
          <!-- 督导预警 1 -->
          <div class="super-card alert-warning">
            <div class="card-head">
              <el-icon class="icon"><WarningFilled /></el-icon>
              <h4>【情感调解案例抽检】个案 CS-2026-001 第二阶段家庭作业跟进督导</h4>
            </div>
            <p class="desc">
              当事人双方情绪已有明显缓和，但《家庭核心决策表》尚未上传双方签字原件扫描件。建议沈清墨老师在周五前进行回访并上传督导闭环附件。
            </p>
            <div class="card-foot">
              <span class="author">督导总监: 林语堂</span>
              <el-button size="small" type="warning" plain>催办归档</el-button>
            </div>
          </div>

          <!-- 督导预警 2 -->
          <div class="super-card alert-success">
            <div class="card-head">
              <el-icon class="icon"><CircleCheck /></el-icon>
              <h4>【红娘约见质检通报】静安店 2 月茶室破冰满意度达 99.2%</h4>
            </div>
            <p class="desc">
              抽检苏婉宁、陈雅心老师名下的 12 场初次约见复盘报告，话题破冰卡与双向反馈收集完整，未发现违规私下索取联系方式等风险行为。
            </p>
            <div class="card-foot">
              <span class="author">督导总监: 林语堂</span>
              <el-tag size="small" type="success">评级：S级合规</el-tag>
            </div>
          </div>
        </div>

        <!-- 督导批注快速录入框 -->
        <div class="supervisor-input-box">
          <h4>📝 录入管理层督导意见与服务质量批注</h4>
          <el-input
            v-model="newSupervisorNote"
            type="textarea"
            :rows="3"
            placeholder="输入针对员工服务记录、调解档案或客服接待的督导指示，将自动归档并推送到对应员工工作台..."
          />
          <div class="input-actions">
            <el-button type="primary" class="btn-gold" @click="submitSupervisorAudit">发布督导审核意见</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 抽屉详情弹窗：全景个案/约见/会话深度调阅 -->
    <el-drawer
      v-model="drawerVisible"
      :title="drawerType === 'case' ? '📋 情感咨询个案全景档案与会谈记录' : drawerType === 'appointment' ? '🍵 茶室约见全流程与复盘反馈' : '💬 在线客服会话与初筛质检'"
      size="600px"
      destroy-on-close
    >
      <!-- 1. 情感个案调解详情 -->
      <div v-if="drawerType === 'case' && selectedCase" class="case-detail-drawer">
        <div class="detail-header-card">
          <div class="head-top">
            <span class="case-badge">{{ selectedCase.caseNo }}</span>
            <el-tag :type="selectedCase.severity === 'high' ? 'danger' : 'warning'">
              {{ selectedCase.severity === 'high' ? '高危紧急' : '常规个案' }}
            </el-tag>
          </div>
          <h3>{{ selectedCase.clientName }} · {{ selectedCase.issueType }}</h3>
          <p class="desc-text">{{ selectedCase.description }}</p>

          <div class="meta-row">
            <span>负责咨询师：<strong>{{ selectedCase.counselorName }}</strong></span>
            <span>所在门店：<strong>{{ selectedCase.storeName }}</strong></span>
            <span>已咨询：<strong>{{ selectedCase.sessionCount }} 次</strong></span>
          </div>
        </div>

        <!-- 调解目标 -->
        <div class="section-box">
          <h4>🎯 阶段调解核心目标</h4>
          <div class="goal-content">{{ selectedCase.targetGoal }}</div>
        </div>

        <!-- 历次会谈详细记录与咨询日志时间线 -->
        <div class="section-box">
          <h4>📖 咨询师历次会谈日志与作业跟进</h4>
          <div v-if="selectedCase.counselingLogs && selectedCase.counselingLogs.length > 0" class="logs-timeline">
            <div v-for="log in selectedCase.counselingLogs" :key="log.id" class="log-card">
              <div class="log-top">
                <span class="log-date">📅 {{ log.date }}</span>
                <strong class="log-topic">{{ log.topic }}</strong>
              </div>
              <div class="log-body">
                <p><strong>会谈纪要：</strong>{{ log.summary }}</p>
                <p v-if="log.homework" class="homework"><strong>家庭作业：</strong>{{ log.homework }}</p>
                <p class="assessment"><strong>状态评估：</strong>{{ log.statusAssessment }}</p>
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无历史会谈记录，处于待初访阶段" />
        </div>
      </div>

      <!-- 2. 约见复盘详情 -->
      <div v-if="drawerType === 'appointment' && selectedAppointment" class="apt-detail-drawer">
        <div class="detail-header-card">
          <h3>{{ selectedAppointment.title }}</h3>
          <div class="meta-row">
            <span>约见日期：<strong>{{ selectedAppointment.date }} {{ selectedAppointment.timeSlot }}</strong></span>
            <span>主持红娘：<strong>{{ selectedAppointment.matchmakerName }}</strong></span>
          </div>
          <div class="meta-row">
            <span>约见茶室：<strong>{{ selectedAppointment.storeName }} · {{ selectedAppointment.roomName }}</strong></span>
          </div>
        </div>

        <div class="section-box">
          <h4>📝 红娘会面准备与备注</h4>
          <p>{{ selectedAppointment.notes || '暂无备注' }}</p>
        </div>

        <div v-if="selectedAppointment.clientFeedback" class="section-box">
          <h4>🌟 客户双向约见复盘反馈</h4>
          <div class="feedback-card">
            <div class="fb-score">
              <span>初次印象契合分：</span>
              <strong class="text-gold">{{ selectedAppointment.clientFeedback.impressionScore }} 分</strong>
            </div>
            <div class="fb-willing">
              <span>后续交往意愿：</span>
              <el-tag type="success">愿意继续深入了解</el-tag>
            </div>
            <div class="fb-remarks">
              <span>客户真实心声：</span>
              <p>“{{ selectedAppointment.clientFeedback.remarks }}”</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 客服会话调阅详情 -->
      <div v-if="drawerType === 'session' && selectedSession" class="session-detail-drawer">
        <div class="session-user-bar">
          <img :src="selectedSession.userAvatar" class="head" />
          <div>
            <strong>{{ selectedSession.userName }}</strong>
            <span>{{ selectedSession.userRole }} · {{ selectedSession.category }}</span>
          </div>
        </div>

        <div class="chat-flow-box">
          <div
            v-for="msg in selectedSession.messages"
            :key="msg.id"
            class="chat-bubble-row"
            :class="msg.sender === 'agent' ? 'is-agent' : msg.sender === 'system' ? 'is-system' : 'is-user'"
          >
            <div v-if="msg.sender === 'system'" class="system-bubble">
              {{ msg.content }}
            </div>
            <div v-else class="bubble-content">
              <span class="sender-name">{{ msg.senderName }} · {{ msg.time }}</span>
              <div class="bubble-text">{{ msg.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
.service-records-manage-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 顶部状态栏 */
.page-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}

.brand-block .title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-block .icon {
  font-size: 24px;
}
.brand-block h2 {
  font-size: 19px;
  font-family: var(--font-song), serif;
  font-weight: 700;
  color: var(--color-ink);
  margin: 0;
}
.status-badge {
  background: rgba(201, 75, 98, 0.1);
  color: var(--color-crimson);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}
.brand-block .sub {
  font-size: 12px;
  color: var(--color-ink-muted);
  margin-top: 4px;
}

.topbar-actions {
  display: flex;
  gap: 10px;
}
.btn-gold {
  background: var(--color-gold) !important;
  border-color: var(--color-gold) !important;
  color: #ffffff !important;
}

/* KPI 质检指标 */
.audit-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1200px) {
  .audit-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.audit-kpi-card {
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.kpi-info {
  display: flex;
  flex-direction: column;
}
.kpi-info .lbl {
  font-size: 12px;
  color: var(--color-ink-muted);
}
.kpi-info .val {
  font-size: 20px;
  color: var(--color-ink);
  font-family: var(--font-song), serif;
  margin-top: 4px;
}
.tag-target {
  font-size: 11px;
  color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
}

/* 主面板与 Tabs */
.records-content-panel {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}

.panel-nav-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  gap: 16px;
}

.custom-tabs {
  display: flex;
  gap: 8px;
}
.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: var(--color-ink-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover {
  background: #f1f5f9;
  color: var(--color-ink);
}
.tab-btn.active {
  background: var(--color-crimson);
  border-color: var(--color-crimson);
  color: #ffffff;
  font-weight: 600;
}

.filter-toolbar {
  display: flex;
  gap: 10px;
}

/* 表格内自定义样式 */
.case-no-tag {
  font-family: monospace;
  font-weight: 700;
  color: var(--color-crimson);
}
.client-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.rel-tag {
  font-size: 10px;
  background: #edf2f7;
  padding: 1px 6px;
  border-radius: 4px;
  color: #4a5568;
}
.issue-badge {
  background: rgba(194, 147, 83, 0.12);
  color: var(--color-gold);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
.staff-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-ink);
}
.session-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
}

.time-cell {
  display: flex;
  flex-direction: column;
}
.time-cell .slot {
  font-size: 11px;
  color: var(--color-ink-muted);
}
.apt-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.type-pill {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}
.type-pill.match_meeting {
  background: rgba(201, 75, 98, 0.1);
  color: var(--color-crimson);
}
.type-pill.store_consult {
  background: rgba(194, 147, 83, 0.1);
  color: var(--color-gold);
}
.target-member {
  font-size: 11px;
  color: var(--color-crimson);
}
.room-cell {
  display: flex;
  flex-direction: column;
}
.room-tag {
  font-size: 11px;
  color: var(--color-ink-muted);
}
.feedback-snippet {
  display: flex;
  flex-direction: column;
  font-size: 11px;
}
.status-yes {
  color: #27ae60;
  font-weight: 600;
}

.visitor-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.v-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.cat-badge {
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}
.agent-tag {
  font-size: 12px;
  color: var(--color-ink);
  font-weight: 600;
}

/* 督导面板 */
.supervision-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.supervision-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.super-card {
  padding: 16px 20px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.super-card.alert-warning {
  background: #fdfaf4;
  border: 1px solid rgba(230, 126, 34, 0.2);
}
.super-card.alert-success {
  background: #f4faf6;
  border: 1px solid rgba(39, 174, 96, 0.2);
}
.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card-head h4 {
  font-size: 14px;
  margin: 0;
  color: var(--color-ink);
}
.super-card .desc {
  font-size: 12px;
  color: var(--color-ink-muted);
  line-height: 1.5;
  margin: 0;
}
.card-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 11px;
  color: var(--color-ink-muted);
}

.supervisor-input-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px 20px;
}
.supervisor-input-box h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: var(--color-ink);
}
.input-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

/* 抽屉弹窗 */
.detail-header-card {
  background: #fdfaf6;
  border: 1px solid rgba(194, 147, 83, 0.2);
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 20px;
}
.head-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.case-badge {
  font-family: monospace;
  font-weight: 700;
  color: var(--color-crimson);
}
.detail-header-card h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--color-ink);
}
.desc-text {
  font-size: 12px;
  color: var(--color-ink-muted);
  line-height: 1.5;
  margin-bottom: 12px;
}
.meta-row {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--color-ink);
}

.section-box {
  margin-bottom: 20px;
}
.section-box h4 {
  font-size: 14px;
  color: var(--color-ink);
  margin-bottom: 10px;
}
.goal-content {
  background: #f8f9fa;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--color-ink);
  border-left: 3px solid var(--color-crimson);
}

.logs-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.log-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 14px;
}
.log-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
}
.log-date {
  color: var(--color-ink-muted);
}
.log-body p {
  margin: 4px 0;
  font-size: 12px;
  line-height: 1.4;
}
.homework {
  color: var(--color-gold);
}
.assessment {
  color: #27ae60;
}

.feedback-card {
  background: #f8fafc;
  padding: 14px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
}
.fb-score {
  display: flex;
  align-items: center;
  gap: 6px;
}
.fb-score strong {
  font-size: 16px;
}

.session-user-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}
.session-user-bar .head {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.chat-flow-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
}
.chat-bubble-row {
  display: flex;
}
.chat-bubble-row.is-agent {
  justify-content: flex-end;
}
.chat-bubble-row.is-system {
  justify-content: center;
}
.system-bubble {
  font-size: 11px;
  background: #f1f5f9;
  color: var(--color-ink-muted);
  padding: 4px 12px;
  border-radius: 12px;
}
.bubble-content {
  max-width: 80%;
  display: flex;
  flex-direction: column;
}
.is-agent .bubble-content {
  align-items: flex-end;
}
.sender-name {
  font-size: 10px;
  color: var(--color-ink-muted);
  margin-bottom: 2px;
}
.bubble-text {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
  background: #f1f5f9;
  color: var(--color-ink);
}
.is-agent .bubble-text {
  background: var(--color-crimson);
  color: #ffffff;
}
</style>
