<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStateStore } from '@/stores/appState'
import {
  Search,
  Filter,
  Location,
  CircleCheckFilled,
  StarFilled,
  View,
  Star,
  Close,
  Promotion
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { MemberProfile } from '@/types'

const appStore = useAppStateStore()

// 筛选状态
const searchKeyword = ref('')
const selectedGender = ref<'all' | 'female' | 'male'>('all')
const selectedEdu = ref<string>('all')
const selectedAgeRange = ref<string>('all')
const selectedIncome = ref<string>('all')

// 会员详情抽屉弹窗
const activeMember = ref<MemberProfile | null>(null)
const detailDrawerVisible = ref(false)
const interestRemark = ref('')

function openMemberDetail(m: MemberProfile) {
  activeMember.value = m
  interestRemark.value = ''
  detailDrawerVisible.value = true
}

function submitInterest() {
  if (!activeMember.value) return
  appStore.submitMemberInterest(activeMember.value.id, interestRemark.value)
  detailDrawerVisible.value = false
}

// 动态筛选计算
const filteredMembers = computed(() => {
  return appStore.members.filter((m) => {
    // 性别
    if (selectedGender.value !== 'all' && m.gender !== selectedGender.value) return false
    // 学历
    if (selectedEdu.value !== 'all' && m.education !== selectedEdu.value) return false
    // 关键词
    if (searchKeyword.value.trim()) {
      const kw = searchKeyword.value.trim().toLowerCase()
      const match =
        m.name.toLowerCase().includes(kw) ||
        m.occupation.toLowerCase().includes(kw) ||
        m.industry.toLowerCase().includes(kw) ||
        m.memberNo.toLowerCase().includes(kw) ||
        m.hobbies.some((h) => h.toLowerCase().includes(kw))
      if (!match) return false
    }
    return true
  })
})
</script>

<template>
  <div class="members-view-container">
    <!-- 头部 Banner -->
    <div class="members-header-banner">
      <div class="inner">
        <div class="seal-badge">鉴</div>
        <h1 class="page-title">脱敏严选会员大厅</h1>
        <p class="page-desc">
          所有候选会员均已通过“身份证、学历学位、无犯罪记录、人脸动态核验”。资料均脱敏保护，请红娘协助发起双向意向征询。
        </p>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-panel-card">
      <div class="filter-row">
        <span class="filter-label">意向性别：</span>
        <div class="filter-options">
          <button
            class="pill-btn"
            :class="{ active: selectedGender === 'all' }"
            @click="selectedGender = 'all'"
          >
            全部
          </button>
          <button
            class="pill-btn"
            :class="{ active: selectedGender === 'female' }"
            @click="selectedGender = 'female'"
          >
            女士 ({{ appStore.members.filter(m => m.gender === 'female').length }})
          </button>
          <button
            class="pill-btn"
            :class="{ active: selectedGender === 'male' }"
            @click="selectedGender = 'male'"
          >
            男士 ({{ appStore.members.filter(m => m.gender === 'male').length }})
          </button>
        </div>
      </div>

      <div class="filter-row">
        <span class="filter-label">学历要求：</span>
        <div class="filter-options">
          <button
            class="pill-btn"
            :class="{ active: selectedEdu === 'all' }"
            @click="selectedEdu = 'all'"
          >
            不限
          </button>
          <button
            v-for="edu in ['本科', '硕士', '博士']"
            :key="edu"
            class="pill-btn"
            :class="{ active: selectedEdu === edu }"
            @click="selectedEdu = edu"
          >
            {{ edu }}
          </button>
        </div>
      </div>

      <div class="filter-row search-row">
        <span class="filter-label">精准搜索：</span>
        <div class="search-input-wrap">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索职业、行业、兴趣爱好（如：金融、AI架构师、阅读）..."
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="result-count">
          找到 <strong>{{ filteredMembers.length }}</strong> 位符合条件的认证会员
        </div>
      </div>
    </div>

    <!-- 会员卡片瀑布流网格 -->
    <div class="members-grid-container">
      <div
        v-for="m in filteredMembers"
        :key="m.id"
        class="member-card-deluxe hover-rise"
        @click="openMemberDetail(m)"
      >
        <div class="photo-box">
          <img :src="m.avatar" />
          <div class="gender-pill" :class="m.gender">
            {{ m.gender === 'female' ? '女' : '男' }} · {{ m.age }}岁 · {{ m.height }}cm
          </div>
          <div class="sincerity-pill">
            <span class="score">{{ m.sincerityScore }}</span>
            <span class="lbl">诚意分</span>
          </div>
          <div class="verified-tag">
            <el-icon><CircleCheckFilled /></el-icon>
            <span>四重实名认证</span>
          </div>
        </div>

        <div class="info-box">
          <div class="top-meta">
            <h3 class="name">{{ m.name }}</h3>
            <span class="m-no">{{ m.memberNo }}</span>
          </div>

          <div class="tag-chips">
            <span class="chip primary">{{ m.education }}</span>
            <span class="chip">{{ m.occupation }}</span>
            <span class="chip">{{ m.city }}·{{ m.district }}</span>
          </div>

          <p class="bio-text">{{ m.bio }}</p>

          <div class="partner-expectation-box">
            <div class="exp-title">期望另一半：</div>
            <div class="exp-content">
              {{ m.partnerExpectations.ageRange[0] }}-{{ m.partnerExpectations.ageRange[1] }}岁 · {{ m.partnerExpectations.educationMin }}及以上 · {{ m.partnerExpectations.topPriorities.join('/') }}
            </div>
          </div>

          <div class="card-action-bar">
            <div class="matchmaker-info">
              <span class="lbl">负责红娘：</span>
              <strong>{{ m.matchmakerName }}</strong>
            </div>
            <el-button
              type="primary"
              size="small"
              class="btn-detail-action"
              @click.stop="openMemberDetail(m)"
            >
              查看完整档案
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 完整档案抽屉弹窗 Drawer -->
    <el-drawer
      v-model="detailDrawerVisible"
      size="620px"
      :with-header="false"
      custom-class="member-detail-drawer"
    >
      <div v-if="activeMember" class="detail-drawer-content">
        <!-- 抽屉头部 -->
        <div class="drawer-header-hero">
          <div class="user-hero-info">
            <img :src="activeMember.avatar" class="hero-avatar" />
            <div class="hero-text">
              <div class="name-line">
                <h2>{{ activeMember.name }}</h2>
                <span class="no-tag">{{ activeMember.memberNo }}</span>
                <span class="verified-badge">已实名背调</span>
              </div>
              <div class="base-meta">
                {{ activeMember.gender === 'female' ? '女士' : '男士' }} · {{ activeMember.age }}岁 · {{ activeMember.height }}cm · {{ activeMember.maritalStatus }} · {{ activeMember.city }}
              </div>
            </div>
          </div>
          <el-icon class="close-btn" @click="detailDrawerVisible = false"><Close /></el-icon>
        </div>

        <!-- 抽屉正文 -->
        <div class="drawer-body-scroll">
          <!-- 核心资产与职业背景 -->
          <div class="detail-section">
            <h4 class="sec-title"><div class="sec-dot"></div> 教育与职业背景</h4>
            <div class="info-grid-2">
              <div class="grid-cell"><span class="k">最高学历：</span><span class="v">{{ activeMember.education }}</span></div>
              <div class="grid-cell"><span class="k">所属行业：</span><span class="v">{{ activeMember.industry }}</span></div>
              <div class="grid-cell"><span class="k">从事职业：</span><span class="v">{{ activeMember.occupation }}</span></div>
              <div class="grid-cell"><span class="k">收入区间：</span><span class="v">{{ activeMember.incomeRange }}</span></div>
              <div class="grid-cell"><span class="k">房产情况：</span><span class="v">{{ activeMember.housing }}</span></div>
              <div class="grid-cell"><span class="k">车辆情况：</span><span class="v">{{ activeMember.vehicle }}</span></div>
            </div>
          </div>

          <!-- 性格与生活画像 -->
          <div class="detail-section">
            <h4 class="sec-title"><div class="sec-dot"></div> 个人独白与生活画像</h4>
            <div class="text-card-box">
              <p>{{ activeMember.bio }}</p>
            </div>
            <div class="tags-group-section">
              <div class="group-label">性格标签：</div>
              <div class="group-tags">
                <span v-for="tag in activeMember.personalityTags" :key="tag" class="detail-chip">{{ tag }}</span>
              </div>
            </div>
            <div class="tags-group-section">
              <div class="group-label">兴趣爱好：</div>
              <div class="group-tags">
                <span v-for="h in activeMember.hobbies" :key="h" class="detail-chip gold">{{ h }}</span>
              </div>
            </div>
          </div>

          <!-- 择偶期望 -->
          <div class="detail-section">
            <h4 class="sec-title"><div class="sec-dot"></div> 深度择偶期望</h4>
            <div class="expectation-deluxe-card">
              <div class="exp-row"><span class="k">年龄范围：</span><span class="v">{{ activeMember.partnerExpectations.ageRange[0] }} - {{ activeMember.partnerExpectations.ageRange[1] }} 岁</span></div>
              <div class="exp-row"><span class="k">学历底线：</span><span class="v">{{ activeMember.partnerExpectations.educationMin }} 及以上</span></div>
              <div class="exp-row"><span class="k">身高范围：</span><span class="v">{{ activeMember.partnerExpectations.heightRange[0] }} - {{ activeMember.partnerExpectations.heightRange[1] }} cm</span></div>
              <div class="exp-row"><span class="k">核心看重：</span><span class="v highlight">{{ activeMember.partnerExpectations.topPriorities.join('、') }}</span></div>
              <div class="exp-row"><span class="k">原则底线：</span><span class="v danger">{{ activeMember.partnerExpectations.dealBreakers.join('、') }}</span></div>
            </div>
          </div>

          <!-- 红娘点评 -->
          <div class="detail-section matchmaker-comment-section">
            <div class="mm-header">
              <div class="mm-left">
                <span class="seal-badge mini">荐</span>
                <strong>专属红娘 {{ activeMember.matchmakerName }} 点评</strong>
              </div>
              <span class="rating">诚意指数：{{ activeMember.sincerityScore }}分</span>
            </div>
            <p class="mm-text">
              “该会员资料真实可靠，日常沟通真诚有礼貌，家庭氛围融洽。择偶心态端正，非常适合寻找以结婚为目的、长久发展的优秀伴侣。”
            </p>
          </div>

          <!-- 请红娘牵线申请区域 -->
          <div class="detail-section submit-box">
            <h4 class="sec-title"><div class="sec-dot"></div> 对该会员心动？请红娘发起意向征询</h4>
            <el-input
              v-model="interestRemark"
              type="textarea"
              :rows="2"
              placeholder="可填写您的简要情况或想对红娘说的补充说明（如：我的工作在静安，希望周末能与该会员在静安茶室见面）"
            />
            <div class="submit-action-bar">
              <el-button
                type="primary"
                class="btn-submit-large"
                @click="submitInterest"
              >
                <el-icon><StarFilled /></el-icon>
                确认提交心动意向（通知红娘介入）
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style scoped>
.members-view-container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.members-header-banner {
  background: linear-gradient(135deg, #FFF 0%, #FDF4F6 100%);
  padding: 32px 40px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-base);
  box-shadow: var(--shadow-card);
  margin-bottom: 24px;
}

.members-header-banner .inner {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 28px;
  color: #27222B;
}

.page-desc {
  font-size: 14px;
  color: var(--color-text-regular);
  line-height: 1.6;
  max-width: 800px;
}

/* 筛选面板 */
.filter-panel-card {
  background: #FFF;
  padding: 20px 24px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-base);
  box-shadow: var(--shadow-card);
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-main);
  min-width: 70px;
}

.filter-options {
  display: flex;
  gap: 8px;
}

.pill-btn {
  border: 1px solid var(--color-border-base);
  background: #FFF;
  color: var(--color-text-regular);
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.pill-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.pill-btn.active {
  background: var(--color-primary);
  color: #FFF;
  border-color: var(--color-primary);
  font-weight: 500;
}

.search-row {
  border-top: 1px solid var(--color-border-light);
  padding-top: 16px;
}

.search-input-wrap {
  flex: 1;
  max-width: 460px;
}

.result-count {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-left: auto;
}

.result-count strong {
  color: var(--color-primary);
}

/* 会员网格 */
.members-grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
}

.member-card-deluxe {
  background: #FFF;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-base);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.photo-box {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.photo-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.member-card-deluxe:hover .photo-box img {
  transform: scale(1.04);
}

.gender-pill {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(4px);
  color: #FFF;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
}

.gender-pill.female {
  background: rgba(201, 75, 98, 0.85);
}

.gender-pill.male {
  background: rgba(59, 126, 140, 0.85);
}

.sincerity-pill {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  padding: 3px 8px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sincerity-pill .score {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-primary);
}

.sincerity-pill .lbl {
  font-size: 9px;
  color: var(--color-text-secondary);
}

.verified-tag {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  color: #FFF;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 4px;
}

.info-box {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.top-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.top-meta .name {
  font-size: 18px;
  font-weight: bold;
}

.top-meta .m-no {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.tag-chips .chip {
  font-size: 11px;
  background: var(--color-bg-base);
  color: var(--color-text-regular);
  padding: 2px 8px;
  border-radius: 4px;
}

.tag-chips .chip.primary {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.bio-text {
  font-size: 13px;
  color: var(--color-text-regular);
  line-height: 1.6;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.partner-expectation-box {
  background: var(--color-accent-gold-light);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  margin-bottom: 16px;
}

.exp-title {
  font-weight: bold;
  color: var(--color-accent-gold);
  margin-bottom: 2px;
}

.exp-content {
  color: #6C542B;
}

.card-action-bar {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--color-border-light);
  padding-top: 14px;
}

.matchmaker-info {
  font-size: 12px;
}

.matchmaker-info .lbl {
  color: var(--color-text-secondary);
}

.matchmaker-info strong {
  color: var(--color-primary);
}

.btn-detail-action {
  background: linear-gradient(135deg, #C94B62, #B33D53);
  border: none;
}

/* 抽屉样式 */
.detail-drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header-hero {
  padding: 24px;
  background: linear-gradient(135deg, #C94B62 0%, #A8364B 100%);
  color: #FFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-hero-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.7);
  object-fit: cover;
}

.hero-text .name-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.hero-text h2 {
  font-size: 20px;
}

.no-tag {
  font-size: 11px;
  background: rgba(255,255,255,0.2);
  padding: 2px 6px;
  border-radius: 4px;
}

.verified-badge {
  font-size: 10px;
  background: #22C55E;
  color: #FFF;
  padding: 2px 6px;
  border-radius: 4px;
}

.base-meta {
  font-size: 12px;
  color: #FDF2F4;
}

.close-btn {
  font-size: 24px;
  cursor: pointer;
}

.drawer-body-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-section {
  background: #FFF;
  border-radius: var(--radius-md);
  padding: 18px;
  border: 1px solid var(--color-border-light);
}

.sec-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #27222B;
}

.sec-dot {
  width: 4px;
  height: 14px;
  background: var(--color-primary);
  border-radius: 2px;
}

.info-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  font-size: 13px;
}

.grid-cell .k {
  color: var(--color-text-secondary);
}

.grid-cell .v {
  font-weight: 500;
  color: var(--color-text-main);
}

.text-card-box {
  background: var(--color-bg-base);
  padding: 12px 14px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.7;
  color: #4A4350;
  margin-bottom: 12px;
}

.tags-group-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.group-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.group-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.detail-chip {
  font-size: 11px;
  background: #FDF2F4;
  color: var(--color-primary);
  padding: 2px 8px;
  border-radius: 4px;
}

.detail-chip.gold {
  background: #FDF8EF;
  color: var(--color-accent-gold);
}

.expectation-deluxe-card {
  background: #FDFBF9;
  border: 1px solid #F0E8E2;
  padding: 14px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
}

.exp-row .k {
  color: var(--color-text-secondary);
}

.exp-row .highlight {
  color: var(--color-primary);
  font-weight: bold;
}

.exp-row .danger {
  color: var(--color-danger);
}

.matchmaker-comment-section {
  background: var(--color-primary-light);
  border-color: rgba(201, 75, 98, 0.2);
}

.mm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.mm-left {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-primary-active);
}

.rating {
  font-size: 12px;
  font-weight: bold;
  color: var(--color-primary);
}

.mm-text {
  font-size: 12px;
  color: #5A474D;
  line-height: 1.6;
}

.submit-box {
  border-top: 2px solid var(--color-primary);
}

.submit-action-bar {
  margin-top: 14px;
}

.btn-submit-large {
  width: 100%;
  background: linear-gradient(135deg, #C94B62, #A8364B);
  border: none;
  padding: 12px 0;
  font-size: 14px;
}
</style>
