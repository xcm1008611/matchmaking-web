<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStateStore } from '@/stores/appState'
import {
  FirstAidKit,
  Calendar,
  Clock,
  User,
  ChatDotRound,
  CircleCheckFilled,
  WarningFilled,
  Plus
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { CounselingCase } from '@/types'

const appStore = useAppStateStore()

const myCases = computed(() => appStore.counselingCases)
const activeCaseId = ref<string>(myCases.value[0]?.id || '')

const activeCase = computed(() => {
  return myCases.value.find((c) => c.id === activeCaseId.value)
})

// 新增干预方案记录
const interventionRecord = ref('')

function addIntervention() {
  if (!interventionRecord.value.trim() || !activeCase.value) return
  activeCase.value.sessionsCount = (activeCase.value.sessionsCount || 0) + 1
  ElMessage.success(`第 ${activeCase.value.sessionsCount} 次调解干预记录已归档！`)
  interventionRecord.value = ''
}

// 结案或调整方案
function markAsResolved() {
  if (!activeCase.value) return
  activeCase.value.status = 'resolved'
  ElMessage.success('个案已标记为【成功化解·达成和解公约】！')
}
</script>

<template>
  <div class="counselor-desk-page">
    <!-- 顶部状态栏 -->
    <div class="desk-topbar">
      <div class="desk-title">
        <h2>情感顾问个案调解工作台 · 心理评估与关系修复</h2>
        <span class="desk-sub">主理导师：沈清墨（国家二级心理咨询师）· 在管危机个案：{{ myCases.filter(c => c.status === 'in_progress').length }}起</span>
      </div>

      <div class="desk-stats">
        <div class="stat-pill">
          <span class="lbl">正在调解</span>
          <strong class="val">{{ myCases.filter(c => c.status === 'in_progress').length }}</strong>
        </div>
        <div class="stat-pill">
          <span class="lbl">成功和解率</span>
          <strong class="val">92.4%</strong>
        </div>
      </div>
    </div>

    <!-- 主工作区 -->
    <div class="desk-grid">
      <!-- 1. 个案档案列表 -->
      <div class="panel case-list-pane">
        <div class="pane-header">
          <h3>个案咨询列表 ({{ myCases.length }})</h3>
        </div>

        <div class="case-items">
          <div
            v-for="c in myCases"
            :key="c.id"
            class="case-item"
            :class="{ active: c.id === activeCaseId }"
            @click="activeCaseId = c.id"
          >
            <div class="c-top">
              <strong class="c-name">{{ c.clientName }} & {{ c.partnerName }}</strong>
              <span class="c-status" :class="c.status">
                {{ c.status === 'in_progress' ? '进行中' : '已化解' }}
              </span>
            </div>
            <div class="c-meta">
              <span class="cat">{{ c.category }}</span>
              <span class="sess">已完成 {{ c.sessionsCount }} 次调解</span>
            </div>
            <p class="c-brief">{{ c.brief }}</p>
          </div>
        </div>
      </div>

      <!-- 2. 个案深度诊断与干预方案 -->
      <div v-if="activeCase" class="panel case-detail-pane">
        <div class="detail-header">
          <div>
            <h2>{{ activeCase.clientName }} 与 {{ activeCase.partnerName }} · 婚姻关系修护</h2>
            <span class="case-no">{{ activeCase.caseNo }} · 建档日期：{{ activeCase.createdAt }}</span>
          </div>

          <div class="dh-actions">
            <el-button
              v-if="activeCase.status === 'in_progress'"
              type="success"
              @click="markAsResolved"
            >
              达和解协议 · 结案归档
            </el-button>
            <el-tag v-else type="success" size="large">已成功和解结案</el-tag>
          </div>
        </div>

        <!-- 矛盾归因与诊断 -->
        <div class="diag-card">
          <h4>🔍 专家系统评估与底层矛盾归因</h4>
          <p class="diag-text">
            <strong>核心困扰：</strong>{{ activeCase.brief }}
          </p>
          <p class="diag-text">
            <strong>心理诊断：</strong>双方存在明显的【回避-焦虑】依恋对抗模式。男方遇到分歧习惯冷处理退缩，加剧女方被抛弃的恐慌焦虑；女方的指责又强化了男方的逃避，形成死循环恶性防御机制。
          </p>
        </div>

        <!-- 阶段性干预方案 -->
        <div class="intervention-plan">
          <h4>📋 四阶段调解排期规划</h4>
          <div class="plan-steps">
            <div class="p-step done">
              <span class="step-lbl">第 1 次 · 单独访谈</span>
              <p>各自情绪疏导宣泄，梳理深层未被看见的委屈（已完成）</p>
            </div>
            <div class="p-step done">
              <span class="step-lbl">第 2 次 · 破冰同场</span>
              <p>在静心茶室打破冷战防御，签署《家庭安全沟通三不原则》（已完成）</p>
            </div>
            <div class="p-step current">
              <span class="step-lbl">第 3 次 · 契约建立</span>
              <p>对齐经济分配与原生家庭探望公约，建立良性互动仪式（进行中）</p>
            </div>
            <div class="p-step pending">
              <span class="step-lbl">第 4 次 · 巩固复盘</span>
              <p>跟踪相处反馈，巩固新沟通模式并随访结案</p>
            </div>
          </div>
        </div>

        <!-- 写入本次调解随访 -->
        <div class="new-session-box">
          <h4>✍️ 录入本次调解干预记录与作业布置</h4>
          <el-input
            v-model="interventionRecord"
            type="textarea"
            :rows="3"
            placeholder="记录本次咨询双方的情绪转折、双方达成的具体共识，以及布置的家庭心理作业..."
          />
          <div class="box-footer">
            <button class="btn-save-record" @click="addIntervention">保存本次调解档案</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.counselor-desk-page {
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
  border: 1px solid rgba(194, 147, 83, 0.2);
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
  color: var(--color-gold);
  font-family: var(--font-song), serif;
  font-weight: 700;
}

.desk-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
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

.pane-header {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.pane-header h3 {
  font-size: 15px;
  color: var(--color-ink);
}

.case-items {
  flex: 1;
  overflow-y: auto;
}
.case-item {
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.2s;
}
.case-item:hover {
  background: #fbf9f8;
}
.case-item.active {
  background: rgba(194, 147, 83, 0.08);
  border-left: 3px solid var(--color-gold);
}
.c-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.c-name {
  font-size: 14px;
  color: var(--color-ink);
}
.c-status {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}
.c-status.in_progress {
  background: #fff3e0;
  color: #ef6c00;
}
.c-status.resolved {
  background: #e8f5e9;
  color: #2e7d32;
}
.c-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-ink-muted);
  margin-bottom: 6px;
}
.c-brief {
  font-size: 12px;
  color: var(--color-ink-muted);
  line-height: 1.5;
}

/* 详情 */
.case-detail-pane {
  padding: 24px;
  overflow-y: auto;
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}
.detail-header h2 {
  font-size: 20px;
  color: var(--color-ink);
  font-family: var(--font-song), serif;
  margin-bottom: 4px;
}
.case-no {
  font-size: 12px;
  color: var(--color-ink-muted);
}

.diag-card {
  background: #fcf9f7;
  padding: 16px 20px;
  border-radius: 10px;
  border: 1px solid rgba(194, 147, 83, 0.15);
  margin-bottom: 24px;
}
.diag-card h4 {
  font-size: 14px;
  color: var(--color-gold);
  margin-bottom: 10px;
}
.diag-text {
  font-size: 13px;
  color: var(--color-ink);
  line-height: 1.7;
  margin-bottom: 8px;
}

.intervention-plan {
  margin-bottom: 24px;
}
.intervention-plan h4 {
  font-size: 14px;
  color: var(--color-ink);
  margin-bottom: 14px;
}
.plan-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.p-step {
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  font-size: 12px;
}
.p-step.done {
  background: #f1f8e9;
  border-color: #c5e1a5;
}
.p-step.current {
  background: #fff8e1;
  border-color: #ffe082;
}
.p-step.pending {
  background: #fafafa;
  color: var(--color-ink-muted);
}
.step-lbl {
  font-weight: 700;
  display: block;
  margin-bottom: 6px;
}
.p-step.done .step-lbl { color: #33691e; }
.p-step.current .step-lbl { color: #f57f17; }

.new-session-box {
  background: #fdfdfd;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 16px;
}
.new-session-box h4 {
  font-size: 14px;
  color: var(--color-ink);
  margin-bottom: 10px;
}
.box-footer {
  margin-top: 10px;
  text-align: right;
}
.btn-save-record {
  padding: 8px 24px;
  background: var(--color-crimson);
  color: #ffffff;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
</style>
