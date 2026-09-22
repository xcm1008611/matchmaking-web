<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStateStore } from '@/stores/appState'
import {
  Search,
  Filter,
  Refresh,
  User,
  Phone,
  Location,
  Calendar,
  Clock,
  View,
  Edit,
  CircleCheck,
  Close,
  Promotion
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { LeadItem } from '@/types'

const appStore = useAppStateStore()

// 搜索与过滤条件
const searchKeyword = ref('')
const selectedServiceType = ref('')
const selectedStatus = ref('')
const selectedStore = ref('')
const selectedIntent = ref('')

// 抽屉详情弹窗状态
const drawerVisible = ref(false)
const activeLead = ref<LeadItem | null>(null)

// 跟踪回访操作表单
const followDialogVisible = ref(false)
const followForm = ref({
  type: '电话回访',
  newStatus: '',
  content: '',
  nextTime: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(8)

// 过滤后的线索列表
const filteredLeads = computed(() => {
  return appStore.leads.filter((lead) => {
    const matchKeyword =
      !searchKeyword.value ||
      lead.clientName.includes(searchKeyword.value) ||
      lead.phone.includes(searchKeyword.value) ||
      lead.leadNo.includes(searchKeyword.value) ||
      (lead.notes && lead.notes.includes(searchKeyword.value))

    const matchType = !selectedServiceType.value || lead.serviceType === selectedServiceType.value
    const matchStatus = !selectedStatus.value || lead.status === selectedStatus.value
    const matchStore = !selectedStore.value || lead.storeName.includes(selectedStore.value)
    const matchIntent = !selectedIntent.value || lead.intentLevel === selectedIntent.value

    return matchKeyword && matchType && matchStatus && matchStore && matchIntent
  })
})

const paginatedLeads = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredLeads.value.slice(start, start + pageSize.value)
})

// 状态映射字典
const statusMap: Record<string, { label: string; type: string; color: string }> = {
  new: { label: '新线索待分配', type: 'danger', color: '#ff4d4f' },
  assigned: { label: '已指派跟进中', type: 'warning', color: '#fa8c16' },
  following: { label: '持续沟通建联', type: 'primary', color: '#1890ff' },
  appointed: { label: '已排期到店', type: 'success', color: '#52c41a' },
  signed: { label: '已签约转化', type: 'success', color: '#82111f' },
  closed: { label: '已结案/归档', type: 'info', color: '#8c8c8c' },
  lost: { label: '无效/流失', type: 'info', color: '#bfbfbf' }
}

const intentMap: Record<string, { label: string; color: string }> = {
  high: { label: '高意向 S级', color: '#f5222d' },
  medium: { label: '中意向 A级', color: '#fa8c16' },
  low: { label: '低意向 B级', color: '#8c8c8c' }
}

// 打开详情抽屉
function handleViewDetails(lead: LeadItem) {
  activeLead.value = lead
  drawerVisible.value = true
}

// 打开记录跟进弹窗
function handleAddFollow(lead: LeadItem) {
  activeLead.value = lead
  followForm.value = {
    type: '电话回访',
    newStatus: lead.status,
    content: '',
    nextTime: ''
  }
  followDialogVisible.value = true
}

// 提交回访记录
function submitFollowUp() {
  if (!activeLead.value) return
  if (!followForm.value.content.trim()) {
    ElMessage.warning('请填写本次跟进纪要内容')
    return
  }

  const lead = appStore.leads.find((l) => l.id === activeLead.value?.id)
  if (lead) {
    lead.status = (followForm.value.newStatus as any) || lead.status
    lead.lastFollowUpAt = new Date().toLocaleString()
    if (followForm.value.nextTime) {
      lead.nextFollowUpAt = followForm.value.nextTime
    }
    lead.followLogs.push({
      id: `fl_${Date.now()}`,
      operatorName: appStore.currentUser.name,
      time: new Date().toLocaleString(),
      type: followForm.value.type as any,
      content: followForm.value.content
    })
  }

  ElMessage.success('跟进记录已成功添加！')
  followDialogVisible.value = false
}

// 快捷指派人员
function handleReassign(lead: LeadItem) {
  ElMessageBox.prompt('请输入转派目标顾问/红娘姓名：', '线索流转派单', {
    confirmButtonText: '确认转派',
    cancelButtonText: '取消',
    inputValue: lead.handlerName || '陈雅心'
  })
    .then(({ value }) => {
      if (value) {
        lead.handlerName = value
        lead.status = 'assigned'
        lead.followLogs.push({
          id: `fl_${Date.now()}`,
          operatorName: appStore.currentUser.name,
          time: new Date().toLocaleString(),
          type: '线索转交',
          content: `管理员将该线索指派移交给【${value}】`
        })
        ElMessage.success(`已成功指派给 ${value}`)
      }
    })
    .catch(() => {})
}

// 重置过滤
function resetFilters() {
  searchKeyword.value = ''
  selectedServiceType.value = ''
  selectedStatus.value = ''
  selectedStore.value = ''
  selectedIntent.value = ''
  currentPage.value = 1
}
</script>

<template>
  <div class="leads-manage-page">
    <!-- 顶部标题栏与快捷数据 -->
    <div class="page-header">
      <div>
        <h2>全生命周期线索与客户池</h2>
        <span class="sub-desc">
          聚合前台预约、在线咨询、红娘牵线申请等多触点商机，贯穿“公海-初访-到店-签约-撮合-结缘”全流程
        </span>
      </div>
      <div class="header-stats">
        <div class="stat-badge">
          <span class="num">{{ appStore.leads.length }}</span>
          <span class="lbl">全量线索</span>
        </div>
        <div class="stat-badge high-intent">
          <span class="num">{{ appStore.leads.filter((l) => l.intentLevel === 'high').length }}</span>
          <span class="lbl">S级高意向</span>
        </div>
        <div class="stat-badge pending">
          <span class="num">{{ appStore.leads.filter((l) => l.status === 'new' || l.status === 'assigned').length }}</span>
          <span class="lbl">待跟进/待初访</span>
        </div>
      </div>
    </div>

    <!-- 筛选过滤栏 -->
    <div class="filter-card">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索客户姓名 / 手机号 / 线索单号 / 意向备注..."
          clearable
          style="width: 320px;"
          :prefix-icon="Search"
        />

        <el-select v-model="selectedServiceType" placeholder="业务类型" clearable style="width: 140px;">
          <el-option label="婚恋介绍" value="match" />
          <el-option label="情感咨询" value="counseling" />
          <el-option label="综合咨询" value="consult" />
        </el-select>

        <el-select v-model="selectedStatus" placeholder="线索状态" clearable style="width: 150px;">
          <el-option
            v-for="(st, key) in statusMap"
            :key="key"
            :label="st.label"
            :value="key"
          />
        </el-select>

        <el-select v-model="selectedIntent" placeholder="意向等级" clearable style="width: 130px;">
          <el-option label="高意向 S级" value="high" />
          <el-option label="中意向 A级" value="medium" />
          <el-option label="低意向 B级" value="low" />
        </el-select>

        <el-select v-model="selectedStore" placeholder="所属门店" clearable style="width: 160px;">
          <el-option label="上海静安旗舰店" value="静安" />
          <el-option label="上海新天地高级会所" value="新天地" />
          <el-option label="杭州西湖体验馆" value="杭州" />
        </el-select>

        <div class="filter-btns">
          <el-button @click="resetFilters" :icon="Refresh">重置</el-button>
        </div>
      </div>
    </div>

    <!-- 线索表格 -->
    <div class="table-card">
      <el-table :data="paginatedLeads" stripe style="width: 100%" row-key="id">
        <el-table-column prop="leadNo" label="线索编号" width="160">
          <template #default="{ row }">
            <span class="lead-no-text">{{ row.leadNo }}</span>
          </template>
        </el-table-column>

        <el-table-column label="客户信息" width="180">
          <template #default="{ row }">
            <div class="client-cell">
              <strong>{{ row.clientName }}</strong>
              <span class="gender-age">{{ row.gender === 'female' ? '女' : '男' }} · {{ row.age }}岁</span>
              <span class="phone-text">{{ row.phone }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="业务诉求" width="140">
          <template #default="{ row }">
            <el-tag
              :type="row.serviceType === 'match' ? 'danger' : 'warning'"
              effect="plain"
              size="small"
            >
              {{ row.serviceType === 'match' ? '婚恋牵线' : (row.serviceType === 'counseling' ? '情感调解' : '综合咨询') }}
            </el-tag>
            <div class="source-sub">{{ row.source }}</div>
          </template>
        </el-table-column>

        <el-table-column label="意向级别" width="120">
          <template #default="{ row }">
            <span
              class="intent-badge"
              :style="{ color: intentMap[row.intentLevel]?.color, borderColor: intentMap[row.intentLevel]?.color }"
            >
              {{ intentMap[row.intentLevel]?.label || '普通' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="当前状态" width="130">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'" size="small">
              {{ statusMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="所属门店 / 责任人" min-width="180">
          <template #default="{ row }">
            <div class="store-handler">
              <span>{{ row.storeName }}</span>
              <div class="handler-tag">
                <el-icon><User /></el-icon>
                <span>{{ row.handlerName || '未指派' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="最新跟进与诉求摘要" min-width="220">
          <template #default="{ row }">
            <div class="notes-truncate" :title="row.notes">
              {{ row.notes || '暂无详细意向备注' }}
            </div>
            <div class="time-sub">
              创建：{{ row.createdAt }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-button link type="primary" size="small" @click="handleViewDetails(row)">
                详情/轨迹
              </el-button>
              <el-button link type="success" size="small" @click="handleAddFollow(row)">
                写跟进
              </el-button>
              <el-button link type="warning" size="small" @click="handleReassign(row)">
                指派
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部分页 -->
      <div class="pagination-row">
        <span class="total-text">共 {{ filteredLeads.length }} 条商机线索</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          layout="prev, pager, next"
          :total="filteredLeads.length"
        />
      </div>
    </div>

    <!-- 侧边详情与轨迹抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      title="线索客户全景档案 & 全生命周期跟进日志"
      size="540px"
      direction="rtl"
      destroy-on-close
    >
      <div v-if="activeLead" class="lead-drawer-content">
        <!-- 基础信息卡 -->
        <div class="drawer-header-card">
          <div class="avatar-box">
            <span class="big-icon">{{ activeLead.gender === 'female' ? '🌸' : '🌲' }}</span>
          </div>
          <div class="dh-meta">
            <div class="title-row">
              <h3>{{ activeLead.clientName }}</h3>
              <el-tag size="small" :type="statusMap[activeLead.status]?.type">
                {{ statusMap[activeLead.status]?.label }}
              </el-tag>
            </div>
            <p class="phone-loc">
              <span>{{ activeLead.phone }}</span> ·
              <span>{{ activeLead.gender === 'female' ? '女' : '男' }} {{ activeLead.age }}岁</span> ·
              <span>{{ activeLead.storeName }}</span>
            </p>
          </div>
        </div>

        <!-- 诉求细节 -->
        <div class="detail-section">
          <h4>📋 客户诉求与意向画像</h4>
          <div class="spec-grid">
            <div class="spec-item">
              <span class="lbl">业务诉求：</span>
              <span class="val">{{ activeLead.serviceType === 'match' ? '婚恋红娘牵线' : '情感调解咨询' }}</span>
            </div>
            <div class="spec-item">
              <span class="lbl">商机来源：</span>
              <span class="val">{{ activeLead.source }}</span>
            </div>
            <div class="spec-item">
              <span class="lbl">预算范围：</span>
              <span class="val">{{ activeLead.budget || '待核算' }}</span>
            </div>
            <div class="spec-item">
              <span class="lbl">责任顾问：</span>
              <span class="val">{{ activeLead.handlerName }} ({{ activeLead.handlerRole === 'matchmaker' ? '红娘' : '情感顾问' }})</span>
            </div>
          </div>
          <div class="notes-box">
            <strong>意向备注：</strong>
            <p>{{ activeLead.notes }}</p>
          </div>
        </div>

        <!-- 跟进时间轴 -->
        <div class="detail-section">
          <div class="section-title-row">
            <h4>⏱️ 全链路跟进与履约轨迹 ({{ activeLead.followLogs.length }}条)</h4>
            <el-button size="small" type="primary" plain @click="handleAddFollow(activeLead)">
              + 增加跟进
            </el-button>
          </div>

          <el-timeline class="lead-timeline">
            <el-timeline-item
              v-for="log in activeLead.followLogs"
              :key="log.id"
              :timestamp="log.time"
              placement="top"
              type="primary"
            >
              <div class="log-card">
                <div class="log-top">
                  <span class="log-operator">{{ log.operatorName }}</span>
                  <el-tag size="small" effect="plain">{{ log.type }}</el-tag>
                </div>
                <div class="log-content">{{ log.content }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-drawer>

    <!-- 写跟进弹窗 -->
    <el-dialog
      v-model="followDialogVisible"
      title="记录跟进纪要与推进生命周期状态"
      width="480px"
      append-to-body
    >
      <el-form label-position="top">
        <el-form-item label="跟进方式">
          <el-radio-group v-model="followForm.type" size="small">
            <el-radio-button label="电话回访" value="电话回访" />
            <el-radio-button label="微信/在线沟通" value="在线沟通" />
            <el-radio-button label="到店面谈" value="到店面谈" />
            <el-radio-button label="茶室约见" value="茶室约见" />
          </el-radio-group>
        </el-form-item>

        <el-form-item label="变更线索生命周期状态">
          <el-select v-model="followForm.newStatus" style="width: 100%;">
            <el-option
              v-for="(st, key) in statusMap"
              :key="key"
              :label="st.label"
              :value="key"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="跟进纪要与客户最新反馈 *" required>
          <el-input
            v-model="followForm.content"
            type="textarea"
            :rows="4"
            placeholder="详细记录沟通重点（如对人选的评价、到店意向、价格异议、排期协调等）..."
          />
        </el-form-item>

        <el-form-item label="下次跟进/预约提醒时间">
          <el-date-picker
            v-model="followForm.nextTime"
            type="datetime"
            placeholder="选择下次联系或约见时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            style="width: 100%;"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="followDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFollowUp">提交记录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.leads-manage-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.page-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1a1e28;
  font-family: var(--font-song), serif;
  margin-bottom: 4px;
}
.sub-desc {
  font-size: 13px;
  color: #64748b;
}

.header-stats {
  display: flex;
  gap: 12px;
}
.stat-badge {
  background: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-badge .num {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}
.stat-badge .lbl {
  font-size: 11px;
  color: #64748b;
}
.stat-badge.high-intent .num {
  color: #e11d48;
}
.stat-badge.pending .num {
  color: #d97706;
}

.filter-card {
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.filter-btns {
  margin-left: auto;
}

.table-card {
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  padding: 16px 20px;
}

.lead-no-text {
  font-family: monospace;
  font-size: 12px;
  color: #475569;
}

.client-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.client-cell strong {
  font-size: 14px;
  color: #1e293b;
}
.gender-age {
  font-size: 12px;
  color: #64748b;
}
.phone-text {
  font-size: 11px;
  color: #94a3b8;
  font-family: monospace;
}

.source-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.intent-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
  border: 1px solid;
}

.store-handler {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #334155;
}
.handler-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #82111f;
  font-weight: 600;
}

.notes-truncate {
  font-size: 12px;
  color: #334155;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.time-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}

.action-btns {
  display: flex;
  gap: 8px;
}

.pagination-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}
.total-text {
  font-size: 13px;
  color: #64748b;
}

/* 抽屉内部样式 */
.lead-drawer-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drawer-header-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.avatar-box {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.dh-meta {
  flex: 1;
}
.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.title-row h3 {
  font-size: 16px;
  color: #0f172a;
}
.phone-loc {
  font-size: 12px;
  color: #64748b;
}

.detail-section {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 14px;
}
.detail-section h4 {
  font-size: 14px;
  color: #1e293b;
  margin-bottom: 12px;
}
.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.section-title-row h4 {
  margin-bottom: 0;
}

.spec-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  font-size: 13px;
  margin-bottom: 12px;
}
.spec-item .lbl {
  color: #64748b;
}
.spec-item .val {
  color: #0f172a;
  font-weight: 500;
}

.notes-box {
  background: #fffbeb;
  border: 1px solid #fde68a;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #92400e;
}
.notes-box p {
  margin-top: 4px;
  line-height: 1.5;
}

.lead-timeline {
  margin-top: 10px;
  padding-left: 6px;
}
.log-card {
  background: #f8fafc;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}
.log-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.log-operator {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
}
.log-content {
  font-size: 13px;
  color: #334155;
  line-height: 1.4;
}
</style>
