<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStateStore } from '@/stores/appState'
import {
  StarFilled,
  Compass,
  ArrowRight,
  CircleCheckFilled
} from '@element-plus/icons-vue'
import TongxinLock3D from '@/components/TongxinLock3D.vue'

const router = useRouter()
const appStore = useAppStateStore()

// 樱花粒子微动效
const petals = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  left: Math.random() * 95 + '%',
  delay: Math.random() * 6 + 's',
  duration: Math.random() * 5 + 6 + 's',
  size: Math.random() * 8 + 8 + 'px'
}))

// 快速牵线意向
function onQuickInterest(memberId: string) {
  appStore.submitMemberInterest(memberId, '首页精选会员意向提交')
}
</script>

<template>
  <div class="home-view">
    <!-- Hero 东方雅致主视觉区 -->
    <section class="hero-section">
      <!-- 飘落樱花装饰 -->
      <div class="sakura-container">
        <div
          v-for="p in petals"
          :key="p.id"
          class="sakura-petal"
          :style="{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size
          }"
        ></div>
      </div>

      <div class="hero-container">
        <div class="hero-content">
          <div class="hero-tag">
            <span class="seal-badge mini">红</span>
            <span>东方雅致 · 私享婚恋顾问与情感调解中心</span>
          </div>

          <h1 class="hero-title">
            愿得一心人 · 白首不相离<br />
            <span class="gradient-text">严选当代知己 · 守护亲密关系</span>
          </h1>

          <p class="hero-desc">
            融汇传统中式温情与现代心理学科学评估。100%
            实名认证高净值会员库，由国家注册资深红娘与专业心理咨询师提供一对一私密定制牵线与情感修复服务。
          </p>

          <div class="hero-actions">
            <el-button
              type="primary"
              size="large"
              class="btn-hero-primary"
              @click="router.push('/services/match')"
            >
              开启婚恋定制
              <el-icon><ArrowRight /></el-icon>
            </el-button>
            <el-button
              size="large"
              class="btn-hero-secondary"
              @click="router.push('/services/counseling')"
            >
              情感调解咨询
            </el-button>
          </div>

          <!-- 核心保障徽章 -->
          <div class="trust-metrics">
            <div class="metric-item">
              <div class="num">100%</div>
              <div class="label">实名学历背调</div>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <div class="num">85%+</div>
              <div class="label">初见良好回访率</div>
            </div>
            <div class="metric-divider"></div>
            <div class="metric-item">
              <div class="num">3000+</div>
              <div class="label">幸福牵线见证</div>
            </div>
          </div>
        </div>

        <!-- 右侧：【东方同心锁 · 3D 金石见证】专属组件 -->
        <TongxinLock3D />
      </div>
    </section>

    <!-- 核心双轨业务矩阵 -->
    <section class="section-container dual-service-section">
      <div class="section-header">
        <div class="sub-header">双轨协同 · 全生命周期守护</div>
        <h2 class="main-header">专业婚恋介绍 与 深度情感调解</h2>
        <div class="header-line"></div>
      </div>

      <div class="service-grid">
        <!-- 婚恋介绍专区 -->
        <div class="service-box match-box hover-rise">
          <div class="box-badge">高端相亲定制</div>
          <div class="box-icon"><el-icon><StarFilled /></el-icon></div>
          <h3 class="box-title">一对一定制婚恋牵线</h3>
          <p class="box-desc">
            从深层价值观、家庭背景、生活习惯到审美取向，量身定制相亲画像。杜绝流水线式推诿，每次推荐均经红娘严审。
          </p>
          <ul class="feature-list">
            <li><el-icon color="#C94B62"><CircleCheckFilled /></el-icon> 真实身份、学历、房产多维核验</li>
            <li><el-icon color="#C94B62"><CircleCheckFilled /></el-icon> 专属私密茶室约见，红娘破冰指导</li>
            <li><el-icon color="#C94B62"><CircleCheckFilled /></el-icon> 约后双向复盘，动态调整推荐策略</li>
          </ul>
          <el-button class="box-btn" @click="router.push('/services/match')">
            查看定制方案
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>

        <!-- 情感调解专区 -->
        <div class="service-box counsel-box hover-rise">
          <div class="box-badge gold">心理学督导</div>
          <div class="box-icon gold"><el-icon><Compass /></el-icon></div>
          <h3 class="box-title">亲密关系与婚姻家庭调解</h3>
          <p class="box-desc">
            专业心理咨询师与婚姻家庭顾问坐镇。化解沟通冷战、婚前迷茫、原生家庭介入与信任危机，重筑爱与理解的安全岛。
          </p>
          <ul class="feature-list">
            <li><el-icon color="#C29353"><CircleCheckFilled /></el-icon> 单人情绪梳理 + 结构化双人面对面会谈</li>
            <li><el-icon color="#C29353"><CircleCheckFilled /></el-icon> 原生家庭依恋模式与沟通盲区拆解</li>
            <li><el-icon color="#C29353"><CircleCheckFilled /></el-icon> 危机干预与长期亲密关系维护机制</li>
          </ul>
          <el-button class="box-btn gold" @click="router.push('/services/counseling')">
            预约情感专家
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
      </div>
    </section>

    <!-- 精选高端会员库轮播/展示 -->
    <section class="section-container">
      <div class="section-header">
        <div class="sub-header">严选知己 · 见证同频灵魂</div>
        <h2 class="main-header">本周推荐真实优质单身会员</h2>
        <div class="header-line"></div>
      </div>

      <div class="members-grid">
        <div
          v-for="m in appStore.members.slice(0, 4)"
          :key="m.id"
          class="member-card hover-rise"
        >
          <div class="avatar-wrap">
            <img :src="m.avatar" :alt="m.name" />
            <span class="auth-tag">已实名核验</span>
            <div class="match-rate-pill">契合度 {{ m.matchScore || 95 }}%</div>
          </div>
          <div class="card-info">
            <div class="name-row">
              <span class="name">{{ m.name }}</span>
              <span class="age">{{ m.age }}岁 · {{ m.city }}</span>
            </div>
            <div class="career-row">{{ m.occupation }} · {{ m.education }}</div>
            <div class="tags-row">
              <span v-for="t in (m.personalityTags || m.hobbies || ['温文尔雅', '热爱生活'])" :key="t" class="tag-pill">{{ t }}</span>
            </div>
            <p class="intro-line">{{ m.idealPartnerDesc || '愿得一心人，相濡以沫携手白首。' }}</p>
            <el-button
              type="primary"
              class="btn-interest"
              @click="onQuickInterest(m.id)"
            >
              表达心仪意向
            </el-button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  padding-bottom: 80px;
  background-color: var(--color-bg-base);
}

/* 樱花漂落背景 */
.sakura-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.sakura-petal {
  position: absolute;
  top: -20px;
  background: radial-gradient(circle, #fbcfe8 20%, #f472b6 100%);
  border-radius: 12px 1px 12px 1px;
  opacity: 0.7;
  animation: fall linear infinite;
}

@keyframes fall {
  0% {
    transform: translateY(0) rotate(0deg) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translateY(800px) rotate(360deg) scale(1.1);
    opacity: 0;
  }
}

/* Hero Section 主体 */
.hero-section {
  position: relative;
  background: linear-gradient(180deg, #fdf7f5 0%, #f5eae7 100%);
  padding: 50px 0 70px;
  border-bottom: 1px solid var(--color-border-base);
  overflow: hidden;
}

.hero-container {
  max-width: 1260px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1.05fr 1.15fr;
  gap: 40px;
  align-items: center;
  position: relative;
  z-index: 2;
}

@media (max-width: 1100px) {
  .hero-container {
    grid-template-columns: 1fr;
  }
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(201, 75, 98, 0.08);
  border: 1px solid rgba(201, 75, 98, 0.2);
  padding: 4px 14px;
  border-radius: 999px;
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 500;
  margin-bottom: 20px;
}

.seal-badge.mini {
  width: 18px;
  height: 18px;
  font-size: 10px;
  background: var(--color-primary);
  color: #fff;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.hero-title {
  font-family: var(--font-display);
  font-size: 40px;
  line-height: 1.35;
  color: #27222b;
  font-weight: bold;
  margin-bottom: 20px;
}

.gradient-text {
  background: linear-gradient(135deg, #c94b62 0%, #c29353 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-desc {
  font-size: 15px;
  line-height: 1.8;
  color: var(--color-text-regular);
  margin-bottom: 32px;
  max-width: 540px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  margin-bottom: 36px;
}

.btn-hero-primary {
  background: linear-gradient(135deg, #c94b62, #a8364b);
  border: none;
  padding: 12px 28px;
  font-size: 15px;
  border-radius: var(--radius-full);
  box-shadow: 0 4px 16px rgba(201, 75, 98, 0.35);
}

.btn-hero-secondary {
  border: 1px solid var(--color-accent-gold);
  color: var(--color-accent-gold);
  background: #fff;
  padding: 12px 24px;
  font-size: 15px;
  border-radius: var(--radius-full);
}

.trust-metrics {
  display: flex;
  align-items: center;
  gap: 28px;
  background: rgba(255, 255, 255, 0.75);
  padding: 14px 20px;
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.9);
  width: fit-content;
  backdrop-filter: blur(8px);
}

.metric-item .num {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: bold;
  color: var(--color-primary);
}

.metric-item .label {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.metric-divider {
  width: 1px;
  height: 28px;
  background: var(--color-border-base);
}

/* ==========================================================================
   业务板块通用样式
   ========================================================================== */
.section-container {
  max-width: 1240px;
  margin: 70px auto 0;
  padding: 0 24px;
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.sub-header {
  font-size: 13px;
  letter-spacing: 2px;
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.main-header {
  font-family: var(--font-display);
  font-size: 30px;
  color: #27222b;
  font-weight: bold;
}

.header-line {
  width: 48px;
  height: 3px;
  background: linear-gradient(90deg, #c94b62, #c29353);
  margin: 12px auto 0;
  border-radius: 2px;
}

/* 双轨业务网格 */
.service-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

@media (max-width: 800px) {
  .service-grid {
    grid-template-columns: 1fr;
  }
}

.service-box {
  background: #fff;
  border-radius: var(--radius-lg);
  padding: 36px;
  position: relative;
  box-shadow: var(--shadow-floating);
  border: 1px solid var(--color-border-base);
}

.service-box.match-box {
  border-top: 4px solid var(--color-primary);
}

.service-box.counsel-box {
  border-top: 4px solid var(--color-accent-gold);
}

.box-badge {
  position: absolute;
  top: 24px;
  right: 24px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  background: rgba(201, 75, 98, 0.08);
  padding: 3px 10px;
  border-radius: 999px;
}

.box-badge.gold {
  color: var(--color-accent-gold);
  background: rgba(194, 147, 83, 0.1);
}

.box-icon {
  width: 48px;
  height: 48px;
  background: rgba(201, 75, 98, 0.1);
  color: var(--color-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 20px;
}

.box-icon.gold {
  background: rgba(194, 147, 83, 0.12);
  color: var(--color-accent-gold);
}

.box-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: bold;
  color: #27222b;
  margin-bottom: 12px;
}

.box-desc {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text-regular);
  margin-bottom: 24px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #443c4a;
}

.box-btn {
  width: 100%;
  padding: 12px 0;
  border-radius: var(--radius-md);
  font-weight: 600;
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.box-btn.gold {
  border-color: var(--color-accent-gold);
  color: var(--color-accent-gold);
}

.box-btn:hover {
  background: var(--color-primary);
  color: #fff;
}

.box-btn.gold:hover {
  background: var(--color-accent-gold);
  color: #fff;
}

/* 会员展示网格 */
.members-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

@media (max-width: 1024px) {
  .members-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .members-grid {
    grid-template-columns: 1fr;
  }
}

.member-card {
  background: #fff;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
}

.avatar-wrap {
  position: relative;
  width: 100%;
  height: 220px;
}

.avatar-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auth-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  backdrop-filter: blur(4px);
}

.match-rate-pill {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: linear-gradient(135deg, #c94b62, #a8364b);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
}

.card-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.name-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.name-row .name {
  font-size: 16px;
  font-weight: bold;
  color: #27222b;
}

.name-row .age {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.career-row {
  font-size: 12px;
  color: var(--color-text-regular);
  margin-bottom: 10px;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.tag-pill {
  font-size: 10px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: 2px 6px;
  border-radius: 4px;
}

.intro-line {
  font-size: 12px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin: 0 0 16px 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.btn-interest {
  width: 100%;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, #c94b62, #a8364b);
  border: none;
  font-size: 12px;
}

.hover-rise {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.hover-rise:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}
</style>
