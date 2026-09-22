<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStateStore } from '@/stores/appState'
import {
  User,
  Calendar,
  Lock,
  Tickets,
  Bell,
  Setting,
  Clock,
  Location,
  CircleCheckFilled,
  Promotion,
  Switch,
  ChatDotRound
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const appStore = useAppStateStore()

const activeTab = ref('profile')

// 模拟当前客户自己的资料
const myProfile = ref({
  memberNo: 'YJ-2024-F8821',
  name: '林书雅',
  gender: 'female',
  age: 28,
  height: 168,
  education: '英国伦敦大学学院硕士 (UCL)',
  occupation: '投行高级行业分析师',
  income: '50-80万',
  maritalStatus: '未婚',
  hometown: '江苏苏州',
  currentCity: '上海市静安区',
  housing: '上海独立购房 (无贷)',
  car: '已购车',
  hobbies: ['古琴', '普洱茶道', '当代艺术策展', '普拉提'],
  selfIntro: '性格温婉独立，喜静亦爱探寻世界之美。期待在快节奏的都市里，与一位价值观同频、情绪稳定且有担当的伴侣相遇。',
  partnerCriteria: {
    ageRange: '29-35岁',
    heightRange: '175cm以上',
    education: '全日制硕士或名校本科',
    income: '50万以上',
    housing: '上海有婚房或具备购房能力',
    character: '情绪稳定、幽默有担当、热爱生活'
  },
  verificationStatus: {
    identity: true,
    education: true,
    property: true,
    credit: true
  },
  contractInfo: {
    packageName: '阿拉小红娘尊享 · 半年深度牵线',
    serviceEndAt: '2025-06-30',
    assignedMatchmaker: '苏婉宁 (高级婚恋规划师)',
    remainingMeetings: 6,
    totalMeetings: 8
  }
})

// 约见记录筛选
const myAppointments = computed(() => {
  return appStore.appointments.filter(
    (a) => a.clientName.includes('林书雅') || a.clientName.includes('会员')
  )
})

// 推荐给我的候选人列表
const recommendedCandidates = computed(() => {
  return appStore.members.filter((m) => m.gender === 'male').slice(0, 3)
})

function handleSaveProfile() {
  ElMessage.success('个人档案与择偶偏好已保存！专属红娘将据此优化推荐池')
}

function handleAcceptMeeting(apt: any) {
  apt.status = 'confirmed'
  ElMessage.success(`已确认约见！红娘将为您与对方锁定【${apt.roomName}】并提供出行礼仪提示`)
}
</script>

<template>
  <div class="user-center-page">
    <!-- 用户顶部总览横幅 -->
    <div class="uc-header-card">
      <div class="uc-user-meta">
        <div class="uc-avatar-box">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
            class="uc-avatar"
          />
          <span class="auth-tag">四重已认证</span>
        </div>
        <div class="uc-details">
          <div class="name-row">
            <h2>{{ myProfile.name }}</h2>
            <span class="member-no">{{ myProfile.memberNo }}</span>
            <span class="vip-badge">尊享VIP会员</span>
          </div>
          <p class="summary-line">
            {{ myProfile.age }}岁 · {{ myProfile.height }}cm · {{ myProfile.education }} · {{ myProfile.occupation }}
          </p>
          <div class="verif-row">
            <span class="verif-item"><el-icon><CircleCheckFilled /></el-icon> 公安实名已核验</span>
            <span class="verif-item"><el-icon><CircleCheckFilled /></el-icon> 学信网硕士认证</span>
            <span class="verif-item"><el-icon><CircleCheckFilled /></el-icon> 房产/资产认证</span>
            <span class="verif-item"><el-icon><CircleCheckFilled /></el-icon> 央行征信无瑕疵</span>
          </div>
        </div>
      </div>

      <div class="uc-matchmaker-card">
        <div class="mm-label">专属服务红娘</div>
        <div class="mm-info">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
            class="mm-avatar"
          />
          <div>
            <strong>苏婉宁</strong>
            <span>{{ myProfile.contractInfo.packageName }}</span>
          </div>
        </div>
        <button
          class="btn-call-mm"
          @click="
            appStore.clientActiveChatCategory = '找对象';
            appStore.isChatDrawerOpen = true;
          "
        >
          <el-icon><ChatDotRound /></el-icon>
          <span>联系我的专属红娘</span>
        </button>
      </div>
    </div>

    <!-- 主体多标签管理面板 -->
    <div class="uc-main-layout">
      <!-- 侧边导航 -->
      <div class="uc-sidebar">
        <div
          class="sidebar-item"
          :class="{ active: activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          <el-icon><User /></el-icon>
          <span>我的档案与择偶偏好</span>
        </div>
        <div
          class="sidebar-item"
          :class="{ active: activeTab === 'appointments' }"
          @click="activeTab = 'appointments'"
        >
          <el-icon><Calendar /></el-icon>
          <span>我的约见排期与进度</span>
          <span class="count-badge">{{ myAppointments.length }}</span>
        </div>
        <div
          class="sidebar-item"
          :class="{ active: activeTab === 'recommend' }"
          @click="activeTab = 'recommend'"
        >
          <el-icon><Promotion /></el-icon>
          <span>红娘为我精选的人选</span>
          <span class="count-badge new">3</span>
        </div>
        <div
          class="sidebar-item"
          :class="{ active: activeTab === 'contract' }"
          @click="activeTab = 'contract'"
        >
          <el-icon><Tickets /></el-icon>
          <span>服务合同与权益明细</span>
        </div>
      </div>

      <!-- 右侧主体内容 -->
      <div class="uc-content-pane">
        <!-- 1. 我的档案与偏好 -->
        <div v-if="activeTab === 'profile'" class="tab-pane animate-fadeIn">
          <div class="pane-header">
            <h3>个人基本信息与生活画卷</h3>
            <button class="btn-save" @click="handleSaveProfile">保存更新</button>
          </div>

          <el-form label-position="top" class="profile-form">
            <div class="form-row-2">
              <el-form-item label="真实姓名">
                <el-input v-model="myProfile.name" disabled />
              </el-form-item>
              <el-form-item label="出生年月 / 年龄">
                <el-input :value="`${myProfile.age} 岁 (1996年10月)`" disabled />
              </el-form-item>
            </div>

            <div class="form-row-3">
              <el-form-item label="身高 (cm)">
                <el-input v-model="myProfile.height" />
              </el-form-item>
              <el-form-item label="常住区域">
                <el-input v-model="myProfile.currentCity" />
              </el-form-item>
              <el-form-item label="籍贯">
                <el-input v-model="myProfile.hometown" />
              </el-form-item>
            </div>

            <div class="form-row-2">
              <el-form-item label="最高学历与院校">
                <el-input v-model="myProfile.education" />
              </el-form-item>
              <el-form-item label="职业与岗位">
                <el-input v-model="myProfile.occupation" />
              </el-form-item>
            </div>

            <div class="form-row-2">
              <el-form-item label="年收入区间">
                <el-select v-model="myProfile.income" style="width: 100%;">
                  <el-option label="30-50万" value="30-50万" />
                  <el-option label="50-80万" value="50-80万" />
                  <el-option label="80-120万" value="80-120万" />
                  <el-option label="120万以上" value="120万以上" />
                </el-select>
              </el-form-item>
              <el-form-item label="房产车辆情况">
                <el-input v-model="myProfile.housing" />
              </el-form-item>
            </div>

            <el-form-item label="自我内心独白与生活态度">
              <el-input
                v-model="myProfile.selfIntro"
                type="textarea"
                :rows="3"
              />
            </el-form-item>

            <div class="sub-divider">
              <h4>🎯 择偶期望维度（红娘智能匹配权值依据）</h4>
            </div>

            <div class="form-row-3">
              <el-form-item label="期望年龄跨度">
                <el-input v-model="myProfile.partnerCriteria.ageRange" />
              </el-form-item>
              <el-form-item label="期望身高要求">
                <el-input v-model="myProfile.partnerCriteria.heightRange" />
              </el-form-item>
              <el-form-item label="最低学历要求">
                <el-input v-model="myProfile.partnerCriteria.education" />
              </el-form-item>
            </div>

            <el-form-item label="核心性格与三观偏好">
              <el-input
                v-model="myProfile.partnerCriteria.character"
                placeholder="例如：情绪稳定、温润包容、有担当、热爱家庭生活"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 2. 约见排期与进度 -->
        <div v-if="activeTab === 'appointments'" class="tab-pane animate-fadeIn">
          <div class="pane-header">
            <h3>线下约见记录与排期列表</h3>
            <span class="sub-tip">剩余可约见次数：<strong>{{ myProfile.contractInfo.remainingMeetings }}</strong> / {{ myProfile.contractInfo.totalMeetings }} 次</span>
          </div>

          <div v-if="myAppointments.length > 0" class="appointment-list">
            <div
              v-for="apt in myAppointments"
              :key="apt.id"
              class="apt-card"
            >
              <div class="apt-header">
                <span class="apt-title">{{ apt.title }}</span>
                <span class="apt-status-tag" :class="apt.status">
                  {{ apt.status === 'confirmed' ? '已确认准时赴约' : (apt.status === 'pending' ? '待双方确认' : '已顺利完成') }}
                </span>
              </div>
              <div class="apt-body">
                <div class="apt-detail-row">
                  <el-icon><Calendar /></el-icon>
                  <span>约见时间：<strong>{{ apt.date }} {{ apt.timeSlot }}</strong></span>
                </div>
                <div class="apt-detail-row">
                  <el-icon><Location /></el-icon>
                  <span>约见地点：{{ apt.storeName }} · <strong>{{ apt.roomName }}</strong>（私密茶空间）</span>
                </div>
                <div class="apt-detail-row">
                  <el-icon><User /></el-icon>
                  <span>主持红娘：{{ apt.matchmakerName }}（提前15分钟提供破冰茶道主持）</span>
                </div>
                <p class="apt-notes">💡 专属提示：{{ apt.notes }}</p>
              </div>

              <div class="apt-footer">
                <button
                  v-if="apt.status === 'pending'"
                  class="btn-confirm-apt"
                  @click="handleAcceptMeeting(apt)"
                >
                  确认应约此排期
                </button>
                <span v-else class="done-lbl">✨ 专属红娘苏婉宁将提前为您备好定制茶饮与点心</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 精选人选推荐池 -->
        <div v-if="activeTab === 'recommend'" class="tab-pane animate-fadeIn">
          <div class="pane-header">
            <h3>专属红娘为您初筛的高契合人选</h3>
            <span class="sub-tip">双向征询中 · 双方确认后即安排私密茶室约见</span>
          </div>

          <div class="rec-grid">
            <div v-for="cand in recommendedCandidates" :key="cand.id" class="rec-card">
              <div class="rec-img-box">
                <img :src="cand.avatar" class="rec-avatar" />
                <span class="match-score">契合度 {{ cand.matchScore }}%</span>
              </div>
              <div class="rec-info">
                <h4>{{ cand.name }} · {{ cand.age }}岁</h4>
                <p class="rec-job">{{ cand.education }} · {{ cand.occupation }}</p>
                <p class="rec-income">年收入：{{ cand.income }} · {{ cand.housing }}</p>
                <p class="rec-motto">“{{ (cand.selfIntro || '愿得一人心，白首不相离。').slice(0, 42) }}...”</p>
                <button
                  class="btn-express-interest"
                  @click="appStore.submitMemberInterest(cand.id, '非常符合我的择偶标准，请红娘老师协助引荐')"
                >
                  对Ta有意 · 请红娘推进约见
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. 合同与权益 -->
        <div v-if="activeTab === 'contract'" class="tab-pane animate-fadeIn">
          <div class="pane-header">
            <h3>服务合同与保障条款</h3>
          </div>

          <div class="contract-card">
            <div class="c-row">
              <span class="c-lbl">服务方案：</span>
              <strong class="c-val">{{ myProfile.contractInfo.packageName }}</strong>
            </div>
            <div class="c-row">
              <span class="c-lbl">签约门店：</span>
              <span class="c-val">上海静安旗舰店（静安区南京西路1788号）</span>
            </div>
            <div class="c-row">
              <span class="c-lbl">有效服务期限：</span>
              <span class="c-val">2024-12-15 至 {{ myProfile.contractInfo.serviceEndAt }}</span>
            </div>
            <div class="c-row">
              <span class="c-lbl">签约主理红娘：</span>
              <span class="c-val">{{ myProfile.contractInfo.assignedMatchmaker }}</span>
            </div>
            <div class="c-row">
              <span class="c-lbl">权益保障：</span>
              <span class="c-val">签署正规民政部推荐版婚介合同、严格客户隐私保密协议、服务期未履约承诺退款条款。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-center-page {
  max-width: 1200px;
  margin: 30px auto 80px;
  padding: 0 24px;
}

/* 顶部概览卡片 */
.uc-header-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 30px 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(0, 0, 0, 0.07);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.03);
  margin-bottom: 30px;
}
.uc-user-meta {
  display: flex;
  align-items: center;
  gap: 24px;
}
.uc-avatar-box {
  position: relative;
}
.uc-avatar {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(201, 75, 98, 0.2);
}
.auth-tag {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-crimson);
  color: #ffffff;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
}
.name-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 6px;
}
.name-row h2 {
  font-size: 24px;
  color: var(--color-ink);
  font-family: var(--font-song), serif;
  font-weight: 700;
}
.member-no {
  font-size: 13px;
  color: var(--color-ink-muted);
}
.vip-badge {
  background: linear-gradient(135deg, var(--color-gold), #d4a66a);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}
.summary-line {
  font-size: 14px;
  color: var(--color-ink-muted);
  margin-bottom: 10px;
}
.verif-row {
  display: flex;
  gap: 16px;
}
.verif-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #27ae60;
  font-weight: 500;
}

.uc-matchmaker-card {
  background: #fbf8f5;
  padding: 18px 24px;
  border-radius: 14px;
  border: 1px solid rgba(201, 75, 98, 0.12);
  text-align: left;
}
.mm-label {
  font-size: 11px;
  color: var(--color-ink-muted);
  margin-bottom: 8px;
}
.mm-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.mm-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
}
.mm-info strong {
  display: block;
  font-size: 14px;
  color: var(--color-ink);
}
.mm-info span {
  font-size: 11px;
  color: var(--color-crimson);
}
.btn-call-mm {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px 16px;
  background: var(--color-crimson);
  color: #ffffff;
  border-radius: 18px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-call-mm:hover {
  background: var(--color-crimson-hover);
}

/* 主体布局 */
.uc-main-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 28px;
}
.uc-sidebar {
  background: #ffffff;
  border-radius: 18px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  height: fit-content;
}
.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  font-size: 14px;
  color: var(--color-ink);
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 6px;
  transition: all 0.2s;
  position: relative;
}
.sidebar-item:hover {
  background: #f8f8f8;
}
.sidebar-item.active {
  background: rgba(201, 75, 98, 0.08);
  color: var(--color-crimson);
  font-weight: 700;
}
.count-badge {
  position: absolute;
  right: 14px;
  background: #eee;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 10px;
  color: var(--color-ink-muted);
}
.count-badge.new {
  background: var(--color-crimson);
  color: #ffffff;
}

.uc-content-pane {
  background: #ffffff;
  border-radius: 18px;
  padding: 32px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}
.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 26px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.pane-header h3 {
  font-size: 20px;
  color: var(--color-ink);
  font-family: var(--font-song), serif;
  font-weight: 700;
}
.sub-tip {
  font-size: 13px;
  color: var(--color-ink-muted);
}
.sub-tip strong {
  color: var(--color-crimson);
}
.btn-save {
  padding: 8px 24px;
  background: var(--color-crimson);
  color: #ffffff;
  border-radius: 20px;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.form-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}
.sub-divider {
  margin: 30px 0 20px;
  padding-top: 20px;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}
.sub-divider h4 {
  font-size: 16px;
  color: var(--color-crimson);
  font-weight: 700;
}

/* 约见排期列表 */
.appointment-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.apt-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 14px;
  padding: 24px;
  background: #fdfcfa;
}
.apt-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.apt-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-ink);
}
.apt-status-tag {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
}
.apt-status-tag.confirmed {
  background: #e8f5e9;
  color: #2e7d32;
}
.apt-status-tag.pending {
  background: #fff3e0;
  color: #ef6c00;
}
.apt-detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-ink);
  margin-bottom: 10px;
}
.apt-notes {
  font-size: 13px;
  color: var(--color-ink-muted);
  margin-top: 12px;
  padding: 10px 14px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px dashed rgba(0, 0, 0, 0.08);
}
.apt-footer {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.btn-confirm-apt {
  padding: 8px 24px;
  background: var(--color-crimson);
  color: #ffffff;
  border: none;
  border-radius: 18px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.done-lbl {
  font-size: 12px;
  color: var(--color-gold);
  font-weight: 600;
}

/* 推荐池 */
.rec-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.rec-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}
.rec-img-box {
  height: 180px;
  position: relative;
}
.rec-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.match-score {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: var(--color-crimson);
  color: #ffffff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
}
.rec-info {
  padding: 16px;
}
.rec-info h4 {
  font-size: 16px;
  color: var(--color-ink);
  margin-bottom: 6px;
}
.rec-job, .rec-income {
  font-size: 12px;
  color: var(--color-ink-muted);
  margin-bottom: 4px;
}
.rec-motto {
  font-size: 12px;
  color: var(--color-ink);
  font-style: italic;
  margin: 10px 0 14px;
  line-height: 1.5;
}
.btn-express-interest {
  width: 100%;
  padding: 8px 0;
  background: rgba(201, 75, 98, 0.1);
  color: var(--color-crimson);
  border: 1px solid rgba(201, 75, 98, 0.2);
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-express-interest:hover {
  background: var(--color-crimson);
  color: #ffffff;
}

/* 合同 */
.contract-card {
  background: #fdfcfa;
  padding: 24px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
.c-row {
  margin-bottom: 16px;
  font-size: 14px;
}
.c-lbl {
  color: var(--color-ink-muted);
  display: inline-block;
  width: 140px;
}
.c-val {
  color: var(--color-ink);
}
</style>
