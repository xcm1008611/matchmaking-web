<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStateStore } from '@/stores/appState'
import {
  Search,
  Filter,
  Medal,
  Star,
  ChatDotRound,
  Calendar,
  CircleCheckFilled,
  Location
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { StaffMember } from '@/types'

const appStore = useAppStateStore()

const activeTab = ref<'all' | 'matchmaker' | 'counselor'>('all')
const searchKeyword = ref('')

const filteredStaff = computed(() => {
  return appStore.staffList.filter((s) => {
    if (activeTab.value !== 'all' && s.role !== activeTab.value) return false
    if (searchKeyword.value.trim()) {
      const kw = searchKeyword.value.trim().toLowerCase()
      return (
        s.name.toLowerCase().includes(kw) ||
        s.title.toLowerCase().includes(kw) ||
        s.specialties.some((spec) => spec.toLowerCase().includes(kw))
      )
    }
    return true
  })
})

// 预约指定红娘/顾问弹窗
const appointmentModalVisible = ref(false)
const targetStaff = ref<StaffMember | null>(null)
const bookingForm = ref({
  userName: '林书雅',
  userPhone: '13812346821',
  date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  timeSlot: '14:00 - 15:30',
  notes: ''
})

function openBookingModal(staff: StaffMember) {
  targetStaff.value = staff
  bookingForm.value.notes = `指定预约【${staff.name}（${staff.title}）】`
  appointmentModalVisible.value = true
}

function handleConfirmBooking() {
  if (!targetStaff.value) return
  appStore.submitAppointment({
    name: bookingForm.value.userName,
    phone: bookingForm.value.userPhone,
    serviceType: targetStaff.value.role === 'matchmaker' ? 'match' : 'counseling',
    date: bookingForm.value.date,
    timeSlot: bookingForm.value.timeSlot,
    storeName: targetStaff.value.storeName,
    notes: bookingForm.value.notes
  })
  appointmentModalVisible.value = false
}
</script>

<template>
  <div class="staff-team-page">
    <!-- 头部横幅 -->
    <section class="team-hero">
      <div class="hero-inner">
        <span class="badge">PROFESSIONAL MENTORS</span>
        <h1 class="hero-title">遇见懂得你的<span class="gradient-text">引路人与摆渡人</span></h1>
        <p class="hero-desc">
          阿拉小红娘拥有数十位平均从业8年以上的国家级心理咨询师、金牌婚恋红娘与形象管理专家。
          秉持“以诚相待、审慎牵线、温暖赋能”的职业操守，做您终身幸福的忠实守护者。
        </p>
      </div>
    </section>

    <!-- 筛选与搜索工具条 -->
    <div class="filter-container">
      <div class="role-tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'all' }"
          @click="activeTab = 'all'"
        >
          全部专家 ({{ appStore.staffList.length }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'matchmaker' }"
          @click="activeTab = 'matchmaker'"
        >
          金牌红娘 ({{ appStore.staffList.filter((s) => s.role === 'matchmaker').length }})
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'counselor' }"
          @click="activeTab = 'counselor'"
        >
          情感调解导师 ({{ appStore.staffList.filter((s) => s.role === 'counselor').length }})
        </button>
      </div>

      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索专家姓名、特长、证书或方向..."
          :prefix-icon="Search"
          clearable
          class="oriental-search"
        />
      </div>
    </div>

    <!-- 导师列表卡片网格 -->
    <div class="staff-grid">
      <div v-for="staff in filteredStaff" :key="staff.id" class="staff-card">
        <div class="staff-img-box">
          <img :src="staff.avatar" :alt="staff.name" class="staff-avatar" />
          <span class="role-badge" :class="staff.role">
            {{ staff.role === 'matchmaker' ? '金牌红娘' : '情感顾问' }}
          </span>
          <div class="rating-box">
            <el-icon class="star-icon"><Star /></el-icon>
            <span>{{ staff.rating }} ({{ staff.reviewsCount }}条好评)</span>
          </div>
        </div>

        <div class="staff-body">
          <div class="name-row">
            <h3 class="staff-name">{{ staff.name }}</h3>
            <span class="staff-title">{{ staff.title }}</span>
          </div>

          <div class="store-row">
            <el-icon><Location /></el-icon>
            <span>常驻门店：{{ staff.storeName }} · 从业 {{ staff.experienceYears }} 年</span>
          </div>

          <div class="spec-tags">
            <span v-for="(sp, idx) in staff.specialties" :key="idx" class="spec-tag">
              {{ sp }}
            </span>
          </div>

          <p class="staff-motto">“ {{ staff.motto }} ”</p>

          <div class="staff-stats-row">
            <div class="stat-col">
              <span class="val">{{ staff.matchedPairs }}</span>
              <span class="lbl">{{ staff.role === 'matchmaker' ? '成功牵线' : '化解案例' }}</span>
            </div>
            <div class="stat-col">
              <span class="val">{{ staff.successRate }}%</span>
              <span class="lbl">好评满意率</span>
            </div>
            <div class="stat-col">
              <span class="val">{{ staff.experienceYears }}年</span>
              <span class="lbl">专业资历</span>
            </div>
          </div>

          <div class="staff-actions">
            <button class="btn-book" @click="openBookingModal(staff)">
              <el-icon><Calendar /></el-icon>
              <span>指定预约Ta</span>
            </button>
            <button
              class="btn-chat"
              @click="
                appStore.clientActiveChatCategory = staff.role === 'matchmaker' ? '找对象' : '情感咨询';
                appStore.isChatDrawerOpen = true;
              "
            >
              <el-icon><ChatDotRound /></el-icon>
              <span>在线咨询</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约弹窗 -->
    <el-dialog
      v-model="appointmentModalVisible"
      :title="`预约专家面询 · ${targetStaff?.name}（${targetStaff?.title}）`"
      width="560px"
      append-to-body
      class="oriental-dialog"
    >
      <div v-if="targetStaff" class="booking-dialog-content">
        <div class="staff-preview-header">
          <img :src="targetStaff.avatar" class="mini-avatar" />
          <div>
            <strong>{{ targetStaff.name }} · {{ targetStaff.title }}</strong>
            <p>{{ targetStaff.storeName }} · 专属私密茶室面谈</p>
          </div>
        </div>

        <el-form label-position="top" class="booking-form">
          <el-form-item label="您的姓名">
            <el-input v-model="bookingForm.userName" placeholder="请输入您的姓名" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="bookingForm.userPhone" placeholder="请输入手机号码" />
          </el-form-item>
          <el-form-item label="期望到店日期">
            <el-date-picker
              v-model="bookingForm.date"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="期望时段">
            <el-select v-model="bookingForm.timeSlot" style="width: 100%;">
              <el-option label="10:00 - 11:30 (上午茶歇)" value="10:00 - 11:30" />
              <el-option label="14:00 - 15:30 (午后静心)" value="14:00 - 15:30" />
              <el-option label="16:00 - 17:30 (傍晚专场)" value="16:00 - 17:30" />
              <el-option label="19:00 - 20:30 (晚间专享)" value="19:00 - 20:30" />
            </el-select>
          </el-form-item>
          <el-form-item label="补充说明与主要诉求">
            <el-input
              v-model="bookingForm.notes"
              type="textarea"
              :rows="3"
              placeholder="请简述您的择偶偏好或目前面临的情感困惑..."
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="appointmentModalVisible = false">取消</el-button>
          <el-button type="primary" class="btn-oriental-hot" @click="handleConfirmBooking">
            确认预约
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.staff-team-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.team-hero {
  text-align: center;
  margin-bottom: 40px;
}
.badge {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(194, 147, 83, 0.12);
  color: var(--color-gold);
  font-size: 12px;
  font-weight: 700;
  border-radius: 14px;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}
.hero-title {
  font-size: 36px;
  color: var(--color-ink);
  font-family: var(--font-song), serif;
  font-weight: 700;
  margin-bottom: 14px;
}
.gradient-text {
  background: linear-gradient(120deg, var(--color-crimson), var(--color-gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-desc {
  font-size: 15px;
  color: var(--color-ink-muted);
  max-width: 760px;
  margin: 0 auto;
  line-height: 1.8;
}

.filter-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  background: #ffffff;
  padding: 16px 20px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}
.role-tabs {
  display: flex;
  gap: 10px;
}
.tab-btn {
  padding: 8px 18px;
  border-radius: 20px;
  border: 1px solid transparent;
  background: #f5f5f5;
  color: var(--color-ink);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn.active {
  background: var(--color-crimson);
  color: #ffffff;
}
.search-box {
  width: 320px;
}

.staff-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}
.staff-card {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.07);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}
.staff-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 36px rgba(201, 75, 98, 0.1);
  border-color: rgba(201, 75, 98, 0.3);
}
.staff-img-box {
  height: 260px;
  position: relative;
  overflow: hidden;
  background: #eae5e1;
}
.staff-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}
.staff-card:hover .staff-avatar {
  transform: scale(1.04);
}
.role-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
}
.role-badge.matchmaker {
  background: linear-gradient(135deg, var(--color-crimson), #e65c78);
}
.role-badge.counselor {
  background: linear-gradient(135deg, var(--color-gold), #d4a66a);
}
.rating-box {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.star-icon {
  color: #ffd21e;
}

.staff-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.name-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}
.staff-name {
  font-size: 20px;
  color: var(--color-ink);
  font-family: var(--font-song), serif;
  font-weight: 700;
}
.staff-title {
  font-size: 12px;
  color: var(--color-gold);
  font-weight: 600;
}
.store-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-ink-muted);
  margin-bottom: 14px;
}
.spec-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}
.spec-tag {
  font-size: 11px;
  background: #faf4f5;
  color: var(--color-crimson);
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid rgba(201, 75, 98, 0.15);
}
.staff-motto {
  font-size: 13px;
  color: var(--color-ink-muted);
  font-style: italic;
  line-height: 1.5;
  margin-bottom: 18px;
  flex: 1;
}
.staff-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  text-align: center;
  padding: 12px 0;
  background: #fcf9f7;
  border-radius: 10px;
  margin-bottom: 18px;
}
.stat-col .val {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-crimson);
  font-family: var(--font-song), serif;
}
.stat-col .lbl {
  font-size: 11px;
  color: var(--color-ink-muted);
}
.staff-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.btn-book {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  background: var(--color-crimson);
  color: #ffffff;
  border-radius: 20px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-book:hover {
  background: var(--color-crimson-hover);
}
.btn-chat {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  background: #ffffff;
  color: var(--color-ink);
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.15);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-chat:hover {
  border-color: var(--color-crimson);
  color: var(--color-crimson);
}

/* 预约弹窗 */
.staff-preview-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #fbf8f5;
  border-radius: 12px;
  margin-bottom: 20px;
}
.mini-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}
.staff-preview-header strong {
  font-size: 15px;
  color: var(--color-ink);
}
.staff-preview-header p {
  font-size: 12px;
  color: var(--color-ink-muted);
  margin-top: 2px;
}
.btn-oriental-hot {
  background: linear-gradient(135deg, var(--color-crimson), var(--color-gold)) !important;
  border: none !important;
  color: #fff !important;
  padding: 10px 22px !important;
}
</style>
