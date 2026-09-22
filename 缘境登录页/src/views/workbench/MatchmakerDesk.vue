<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppStateStore } from '@/stores/appState'
import {
  Search,
  Filter,
  User,
  Calendar,
  Location,
  Promotion,
  Plus,
  CircleCheckFilled,
  WarningFilled,
  Clock,
  ChatDotRound
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { LeadItem, MemberProfile } from '@/types'

const appStore = useAppStateStore()

// 当前选中的我负责的客户线索/会员
const myLeads = computed(() => {
  return appStore.leads.filter((l) => l.handlerRole === 'matchmaker')
})

const activeLeadId = ref<string>(myLeads.value[0]?.id || '')
const activeLead = computed(() => {
  return myLeads.value.find((l) => l.id === activeLeadId.value) || myLeads.value[0]
})

watch(myLeads, (leads) => {
  if (!leads.length) {
    activeLeadId.value = ''
    return
  }
  if (!leads.some((lead) => lead.id === activeLeadId.value)) {
    activeLeadId.value = leads[0].id
  }
}, { immediate: true })

const activeFollowLogs = computed(() => activeLead.value?.followLogs || [])

function getCandidateIntro(candidate: MemberProfile) {
  const intro = candidate.bio || candidate.idealPartnerDesc || '资料完善中，红娘将结合双方画像持续补充匹配建议。'
  return intro.slice(0, 36)
}

// 智能匹配人选池（根据当前客户性别推荐异性）
const candidateList = computed(() => {
  const targetGender = activeLead.value?.gender === 'female' ? 'male' : 'female'
  return appStore.members.filter((m) => m.gender === targetGender)
})

// 约见排期弹窗
const appointmentModalVisible = ref(false)
const selectedCandidate = ref<MemberProfile | null>(null)
const aptForm = ref({
  date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  timeSlot: '15:00 - 16:30',
  roomName: '静安旗舰店 · 【听竹】中式私密茶室',
  notes: '双方初步已看脱敏资料，红娘苏婉宁主持破冰并准备武夷肉桂茶'
})

function openAppointmentModal(cand: MemberProfile) {
  selectedCandidate.value = cand
  appointmentModalVisible.value = true
}

function handleCreateAppointment() {
  if (!activeLead.value || !selectedCandidate.value) return

  appStore.createMeetingAppointment({
    clientName: activeLead.value.clientName,
    targetMemberName: selectedCandidate.value.name,
    date: aptForm.value.date,
    timeSlot: aptForm.value.timeSlot,
    roomName: aptForm.value.roomName,
    notes: aptForm.value.notes
  })

  // 更新当前线索状态
  appStore.updateLeadStatus(
    activeLead.value.id,
    'appointed',
    `成功为客户与候选人【${selectedCandidate.value.name}】安排约见（${aptForm.value.date} ${aptForm.value.timeSlot}）`
  )

  appointmentModalVisible.value = false
}

// 快速添加跟进记录
const newLogContent = ref('')
function addFollowLog() {
  if (!newLogContent.value.trim() || !activeLead.value) return
  activeLead.value.followLogs.unshift({
    id: `fl_${Date.now()}`,
    operatorName: '红娘 · 苏婉宁',
    time: new Date().toLocaleTimeString(),
    type: '电话跟进',
    content: newLogContent.value.trim()
  })
  newLogContent.value = ''
  ElMessage.success('跟进记录已更新！')
}
</script>

<template>
  <div class="matchmaker-desk-page">
    <!-- 顶部状态栏 -->
    <div class="desk-topbar">
      <div class="desk-title">
        <h2>金牌红娘工作台 · 客户画像与智能人选匹配</h2>
        <span class="desk-sub">主理红娘：苏婉宁 · 负责客户：{{ myLeads.length }}位 · 今日待约见：2场</span>
      </div>

      <div class="desk-stats">
        <div class="stat-pill">
          <span class="lbl">高意向客户</span>
          <strong class="val">8</strong>
        </div>
        <div class="stat-pill">
          <span class="lbl">本周待跟进</span>
          <strong class="val">14</strong>
        </div>
        <div class="stat-pill">
          <span class="lbl">本月成功牵线</span>
          <strong class="val">5对</strong>
        </div>
      </div>
    </div>

    <!-- 主工作区：左客户列表，中客户深度画像与跟进，右AI人选推荐 -->
    <div class="desk-grid">
      <!-- 1. 客户线索列表 -->
      <div class="panel client-list-pane">
        <div class="pane-header">
          <h3>我的客户列表 ({{ myLeads.length }})</h3>
        </div>

        <div class="client-items">
          <div
            v-for="lead in myLeads"
            :key="lead.id"
            class="client-item"
            :class="{ active: lead.id === activeLeadId }"
            @click="activeLeadId = lead.id"
          >
            <div class="c-top">
              <strong class="c-name">{{ lead.clientName }}</strong>
              <span class="c-status" :class="lead.status">{{ lead.status }}</span>
            </div>
            <div class="c-meta">
              <span>{{ lead.gender === 'female' ? '女' : '男' }} · {{ lead.age }}岁</span>
              <span>{{ lead.phone }}</span>
            </div>
            <p class="c-note">{{ lead.notes }}</p>
          </div>
        </div>
      </div>

      <!-- 2. 客户深度画像与服务跟进 -->
      <div v-if="activeLead" class="panel client-profile-pane">
        <div class="profile-header">
          <div class="ph-meta">
            <h2>{{ activeLead.clientName }}</h2>
            <span class="lead-no">{{ activeLead.leadNo }}</span>
            <span class="intent-tag high">高意向客户</span>
          </div>

          <div class="ph-actions">
            <el-button
              size="small"
              type="success"
              @click="appStore.updateLeadStatus(activeLead.id, 'signed', '客户完成意向协议签署与实名认证')"
            >
              标记为已签约
            </el-button>
          </div>
        </div>

        <!-- 择偶模型标签 -->
        <div class="model-tags-box">
          <h4>🎯 择偶核心特征画像模型</h4>
          <div class="tags-row">
            <span class="m-tag">年龄偏好：29-35岁</span>
            <span class="m-tag">学历偏好：硕士/985本科</span>
            <span class="m-tag">经济偏好：50万以上/独立购房</span>
            <span class="m-tag">三观偏好：情绪稳定、热爱生活</span>
          </div>
        </div>

        <!-- 跟进记录流 -->
        <div class="followup-section">
          <div class="sec-head">
            <h4>📝 客户服务轨迹与跟进记录</h4>
          </div>

          <div class="new-log-input">
            <el-input
              v-model="newLogContent"
              placeholder="填写本次沟通情况、对方择偶诉求变化或约见反馈..."
              :rows="2"
              type="textarea"
            />
            <button class="btn-add-log" @click="addFollowLog">添加跟进</button>
          </div>

          <div class="log-timeline">
            <div v-for="log in activeLead.followLogs" :key="log.id" class="log-item">
              <div class="log-top">
                <span class="op-name">{{ log.operatorName }}</span>
                <span class="log-time">{{ log.time }}</span>
                <span class="log-type">{{ log.type }}</span>
              </div>
              <p class="log-text">{{ log.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. AI智能候选人人选匹配池 -->
      <div class="panel match-pool-pane">
        <div class="pane-header">
          <h3>⚡ AI 推荐契合候选人 ({{ candidateList.length }})</h3>
          <span class="sub">基于价值观模型综合打分排序</span>
        </div>

        <div class="candidate-cards">
          <div v-for="cand in candidateList" :key="cand.id" class="cand-card">
            <div class="cand-top">
              <img :src="cand.avatar" class="cand-avatar" />
              <div class="cand-meta">
                <div class="name-row">
                  <strong>{{ cand.name }}</strong>
                  <span class="age">{{ cand.age }}岁 · {{ cand.height }}cm</span>
                </div>
                <span class="job">{{ cand.education }} · {{ cand.occupation }}</span>
                <span class="income">年薪 {{ cand.income }} · {{ cand.housing }}</span>
              </div>
              <div class="score-badge">
                <span class="val">{{ cand.matchScore }}%</span>
                <span class="lbl">匹配度</span>
              </div>
            </div>

            <p class="cand-intro">“{{ getCandidateIntro(cand) }}...”</p>

            <div class="cand-actions">
              <button class="btn-invite" @click="openAppointmentModal(cand)">
                <el-icon><Calendar /></el-icon>
                <span>安排私密茶室约见</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 约见排期弹窗 -->
    <el-dialog
      v-model="appointmentModalVisible"
      title="安排线下私密茶室约见 · 红娘主持"
      width="580px"
      append-to-body
      class="oriental-dialog"
    >
      <div v-if="activeLead && selectedCandidate" class="apt-modal-content">
        <div class="pair-banner">
          <div class="side">
            <strong>{{ activeLead.clientName }}</strong>
            <span>{{ activeLead.gender === 'female' ? '女士' : '先生' }}</span>
          </div>
          <div class="heart-center">🏮 牵线约见 🏮</div>
          <div class="side">
            <strong>{{ selectedCandidate.name }}</strong>
            <span>{{ selectedCandidate.occupation }}</span>
          </div>
        </div>

        <el-form label-position="top">
          <el-form-item label="约见日期">
            <el-date-picker
              v-model="aptForm.date"
              type="date"
              value-format="YYYY-MM-DD"
              style="width: 100%;"
            />
          </el-form-item>

          <el-form-item label="约见时段">
            <el-select v-model="aptForm.timeSlot" style="width: 100%;">
              <el-option label="10:30 - 12:00 (上午早茶)" value="10:30 - 12:00" />
              <el-option label="15:00 - 16:30 (午后静心茶室)" value="15:00 - 16:30" />
              <el-option label="18:30 - 20:00 (晚间温馨茶聚)" value="18:30 - 20:00" />
            </el-select>
          </el-form-item>

          <el-form-item label="约见中式茶室">
            <el-select v-model="aptForm.roomName" style="width: 100%;">
              <el-option label="静安旗舰店 · 【听竹】中式私密茶室" value="静安旗舰店 · 【听竹】中式私密茶室" />
              <el-option label="静安旗舰店 · 【临水】雅致茶空间" value="静安旗舰店 · 【临水】雅致茶空间" />
              <el-option label="新天地会所 · 【见山】私享茶轩" value="新天地会所 · 【见山】私享茶轩" />
            </el-select>
          </el-form-item>

          <el-form-item label="约见重点提示与破冰策略">
            <el-input
              v-model="aptForm.notes"
              type="textarea"
              :rows="3"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="appointmentModalVisible = false">取消</el-button>
          <el-button type="primary" class="btn-oriental-hot" @click="handleCreateAppointment">
            确认排期并发送通知
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.matchmaker-desk-page {
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

.desk-stats {
  display: flex;
  gap: 16px;
}
.stat-pill {
  background: #fbf9f8;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid rgba(201, 75, 98, 0.12);
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.stat-pill .lbl {
  font-size: 11px;
  color: var(--color-ink-muted);
}
.stat-pill .val {
  font-size: 16px;
  color: var(--color-crimson);
  font-family: var(--font-song), serif;
  font-weight: 700;
}

.desk-grid {
  display: grid;
  grid-template-columns: 280px 1fr 340px;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.panel {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 客户列表 */
.pane-header {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.pane-header h3 {
  font-size: 15px;
  color: var(--color-ink);
}
.pane-header .sub {
  font-size: 11px;
  color: var(--color-ink-muted);
}
.client-items {
  flex: 1;
  overflow-y: auto;
}
.client-item {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s;
}
.client-item:hover {
  background: #fbf9f8;
}
.client-item.active {
  background: rgba(201, 75, 98, 0.08);
  border-left: 3px solid var(--color-crimson);
}
.c-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.c-name {
  font-size: 14px;
  color: var(--color-ink);
}
.c-status {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #eee;
  color: var(--color-ink-muted);
}
.c-status.following {
  background: rgba(201, 75, 98, 0.1);
  color: var(--color-crimson);
}
.c-meta {
  font-size: 11px;
  color: var(--color-ink-muted);
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}
.c-note {
  font-size: 11px;
  color: var(--color-ink-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 客户画像主体 */
.client-profile-pane {
  padding: 20px;
  overflow-y: auto;
}
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}
.ph-meta {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.ph-meta h2 {
  font-size: 20px;
  color: var(--color-ink);
  font-family: var(--font-song), serif;
}
.lead-no {
  font-size: 12px;
  color: var(--color-ink-muted);
}
.intent-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 700;
}
.intent-tag.high {
  background: #ffebee;
  color: #c62828;
}

.model-tags-box {
  background: #fbf9f8;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(201, 75, 98, 0.12);
  margin-bottom: 20px;
}
.model-tags-box h4 {
  font-size: 13px;
  color: var(--color-crimson);
  margin-bottom: 8px;
}
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.m-tag {
  font-size: 12px;
  background: #ffffff;
  color: var(--color-ink);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.followup-section {
  flex: 1;
}
.sec-head h4 {
  font-size: 14px;
  color: var(--color-ink);
  margin-bottom: 10px;
}
.new-log-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}
.btn-add-log {
  align-self: flex-end;
  padding: 6px 18px;
  background: var(--color-crimson);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.log-timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.log-item {
  background: #fcfbfa;
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid var(--color-gold);
}
.log-top {
  display: flex;
  gap: 8px;
  font-size: 11px;
  margin-bottom: 4px;
}
.op-name {
  font-weight: 700;
  color: var(--color-ink);
}
.log-time {
  color: var(--color-ink-muted);
}
.log-type {
  color: var(--color-crimson);
}
.log-text {
  font-size: 12px;
  color: var(--color-ink);
  line-height: 1.5;
}

/* 推荐候选人池 */
.match-pool-pane {
  display: flex;
  flex-direction: column;
}
.candidate-cards {
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.cand-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 14px;
  background: #fdfcfa;
}
.cand-top {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}
.cand-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}
.cand-meta {
  flex: 1;
}
.cand-meta strong {
  font-size: 13px;
  color: var(--color-ink);
}
.cand-meta .age {
  font-size: 11px;
  color: var(--color-ink-muted);
  margin-left: 6px;
}
.cand-meta .job, .cand-meta .income {
  display: block;
  font-size: 11px;
  color: var(--color-ink-muted);
}
.score-badge {
  text-align: center;
  background: rgba(201, 75, 98, 0.1);
  padding: 4px 8px;
  border-radius: 8px;
  height: fit-content;
}
.score-badge .val {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-crimson);
  display: block;
}
.score-badge .lbl {
  font-size: 9px;
  color: var(--color-ink-muted);
}
.cand-intro {
  font-size: 11px;
  color: var(--color-ink);
  font-style: italic;
  margin-bottom: 10px;
}
.btn-invite {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 7px 0;
  background: var(--color-crimson);
  color: #ffffff;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-invite:hover {
  background: var(--color-crimson-hover);
}

/* 约见弹窗 */
.pair-banner {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: #fbf8f5;
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 18px;
  border: 1px solid rgba(201, 75, 98, 0.15);
}
.pair-banner .side strong {
  display: block;
  font-size: 15px;
  color: var(--color-ink);
}
.pair-banner .side span {
  font-size: 11px;
  color: var(--color-ink-muted);
}
.heart-center {
  color: var(--color-crimson);
  font-weight: 700;
  font-size: 13px;
}
.btn-oriental-hot {
  background: linear-gradient(135deg, var(--color-crimson), var(--color-gold)) !important;
  border: none !important;
  color: #fff !important;
}
</style>
