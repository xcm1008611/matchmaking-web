<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStateStore } from '@/stores/appState'
import {
  User,
  Select,
  Compass,
  Service,
  ChatDotRound,
  CircleCheckFilled,
  Right,
  Avatar,
  Lock,
  TrendCharts
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const appStore = useAppStateStore()

// 匹配意向模拟评测弹窗
const assessmentVisible = ref(false)
const assessStep = ref(1)
const assessForm = ref({
  gender: 'female',
  ageRange: '25-30岁',
  education: '本科及以上',
  incomeRange: '30-50万',
  vitalPoints: ['价值观契合', '三观品性', '生活节奏相近'],
  characterPreference: '温和沉稳'
})

const isSubmitting = ref(false)
const matchScoreResult = ref<number | null>(null)

function startAssessment() {
  assessmentVisible.value = true
  assessStep.value = 1
  matchScoreResult.value = null
}

function nextStep() {
  if (assessStep.value < 3) {
    assessStep.value++
  } else {
    isSubmitting.value = true
    setTimeout(() => {
      isSubmitting.value = false
      matchScoreResult.value = 94.6
      assessStep.value = 4
    }, 900)
  }
}

function handleBookNow() {
  assessmentVisible.value = false
  appStore.submitAppointment({
    name: '林书雅 (匹配测评)',
    phone: '13812346821',
    serviceType: 'match',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    timeSlot: '14:00 - 15:30',
    storeName: '上海静安旗舰店',
    notes: `完成意向测评，AI匹配度高达94.6%，意向特征：${assessForm.value.vitalPoints.join('、')}`
  })
}

// 服务的六维体系
const servicePillars = [
  {
    title: '100% 真人实名多维核验',
    desc: '公安身份核验、学信网学历认证、征信报告核准、房产车产实名备案，杜绝虚假与杀猪盘。',
    icon: '🛡️'
  },
  {
    title: '金牌红娘 1对1 深度建档',
    desc: '2小时面对面深度破冰访谈，构建包含家庭观念、生活习惯、消费观与沟通模式的动态择偶模型。',
    icon: '📜'
  },
  {
    title: '东方审美与现代心理契合度算法',
    desc: '不仅看硬性背景匹配，更看性格互补度、心智成熟度与共情能力，让每一次相见都有温度。',
    icon: '🏮'
  },
  {
    title: '私密茶室约见与破冰主持',
    desc: '沉浸式宋韵中式茶空间，专属红娘前15分钟优雅破冰，消除初见尴尬，营造舒适安全沟通场域。',
    icon: '🍵'
  },
  {
    title: '全程恋爱督导与交往跟进',
    desc: '约见后双方双向复盘，及时解开误会；在推进关系的关键节点提供专业交往策略支持。',
    icon: '🕊️'
  },
  {
    title: '不成功按契约保障权益',
    desc: '正规婚介合同签约，明码标价无隐形消费，服务进度可追踪，随时可查约见档案。',
    icon: '⚖️'
  }
]

// 流程步骤
const matchFlowSteps = [
  { step: '01', name: '需求沟通与实名审核', detail: '到店面谈了解成长背景与择偶诉求，核验四项实名资质' },
  { step: '02', name: '心理画像与择偶建模', detail: '性格色彩测评与情感预期梳理，建立精准择偶维度权重' },
  { step: '03', name: '全库人工筛选与征询', detail: '红娘团队联席会诊，人工逐一征询双方意见并交换脱敏卡片' },
  { step: '04', name: '私密空间约见破冰', detail: '安排静安/新天地中式茶室约见，红娘陪伴破冰，全程暖心守护' },
  { step: '05', name: '双向复盘与情感助攻', detail: '会后24小时内获取双方真实反馈，纠偏沟通误区，推进深度相处' }
]

// 会员等级与套餐
const packages = [
  {
    name: '雅致佳缘 · 季度约见计划',
    level: 'Silver',
    badge: '入门优选',
    price: '9,800',
    period: '服务期 3 个月',
    features: [
      '专属资深红娘 1v1 服务',
      '精选推荐 6-8 位优质人选',
      '包含 4 次私密茶室约见',
      '基础约见复盘指导',
      '实名及财产初级核验'
    ],
    hot: false
  },
  {
    name: '阿拉小红娘尊享 · 半年深度牵线',
    level: 'Gold',
    badge: '最受欢迎 · 85% 脱单率',
    price: '18,800',
    period: '服务期 6 个月',
    features: [
      '首席红娘 + 情感心理顾问双师护航',
      '全库无限次智能初筛 + 12次精准牵线',
      '8 次中式雅致茶室专属约见',
      '形象美学改造与穿搭定制建议',
      '恋爱交往期无限次电话答疑',
      '未达成协议保障条款'
    ],
    hot: true
  },
  {
    name: '锦瑟至臻 · 年度私享定制',
    level: 'VIP',
    badge: '高净值专享',
    price: '38,800',
    period: '服务期 12 个月',
    features: [
      '专家委员会首席导师团队全程跟进',
      '全国跨城高净值/世家精英精准寻访',
      '不限次约见与全程沉浸式恋爱督导',
      '双方家族背景与深度资产核查',
      '亲密关系与婚前财产规划咨询',
      '签订专属VIP隐私保密协议'
    ],
    hot: false
  }
]
</script>

<template>
  <div class="match-service-page">
    <!-- Hero 区域 -->
    <section class="service-hero">
      <div class="hero-inner">
        <div class="hero-tag">一对一专属红娘牵线 · 追寻相濡以沫的东方浪漫</div>
        <h1 class="hero-title">
          以诚相见，<span class="gradient-text">择一人而白首</span>
        </h1>
        <p class="hero-desc">
          阿拉小红娘摒弃快餐式交友，通过四重严格实名资质核验、金牌红娘深度访谈与东方审美性格契合模型，
          让每一次相见都充满期待，每一份托付都有回响。
        </p>

        <div class="hero-actions">
          <button class="btn-primary" @click="startAssessment">
            <span>✨ 免费进行意向匹配测评 (30秒)</span>
          </button>
          <button class="btn-secondary" @click="router.push('/members')">
            <span>浏览精选会员大厅</span>
            <el-icon><Right /></el-icon>
          </button>
        </div>

        <div class="hero-stats">
          <div class="stat-card">
            <span class="num">86.4%</span>
            <span class="lbl">半年内牵线成功率</span>
          </div>
          <div class="stat-line"></div>
          <div class="stat-card">
            <span class="num">100%</span>
            <span class="lbl">公安与学信网实名</span>
          </div>
          <div class="stat-line"></div>
          <div class="stat-card">
            <span class="num">12,000+</span>
            <span class="lbl">累计见证幸福良缘</span>
          </div>
          <div class="stat-line"></div>
          <div class="stat-card">
            <span class="num">4.98</span>
            <span class="lbl">服务满意度评分</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 六维服务体系 -->
    <section class="pillars-section">
      <div class="section-head">
        <span class="sub-title">SERVICE STANDARD</span>
        <h2 class="main-title">六维严选服务标准 · 守护纯粹婚恋</h2>
        <div class="deco-line"></div>
      </div>

      <div class="pillars-grid">
        <div v-for="(item, idx) in servicePillars" :key="idx" class="pillar-card">
          <div class="pillar-icon">{{ item.icon }}</div>
          <h3 class="pillar-title">{{ item.title }}</h3>
          <p class="pillar-desc">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 牵线服务流程 -->
    <section class="flow-section">
      <div class="section-head">
        <span class="sub-title">MATCHMAKING PROCESS</span>
        <h2 class="main-title">严谨而温暖的五步牵线旅程</h2>
        <div class="deco-line"></div>
      </div>

      <div class="flow-container">
        <div v-for="(step, idx) in matchFlowSteps" :key="idx" class="flow-card">
          <div class="step-badge">{{ step.step }}</div>
          <h4 class="step-name">{{ step.name }}</h4>
          <p class="step-detail">{{ step.detail }}</p>
        </div>
      </div>
    </section>

    <!-- 会员服务方案 -->
    <section class="packages-section">
      <div class="section-head">
        <span class="sub-title">MEMBERSHIP TIERS</span>
        <h2 class="main-title">透明定制方案 · 满足不同阶段的托付</h2>
        <div class="deco-line"></div>
      </div>

      <div class="packages-grid">
        <div
          v-for="(pkg, idx) in packages"
          :key="idx"
          class="package-card"
          :class="{ 'is-hot': pkg.hot }"
        >
          <div v-if="pkg.hot" class="hot-ribbon">{{ pkg.badge }}</div>
          <div class="pkg-header">
            <span class="pkg-level">{{ pkg.level }}</span>
            <h3 class="pkg-name">{{ pkg.name }}</h3>
            <div class="pkg-price-box">
              <span class="currency">¥</span>
              <span class="price-val">{{ pkg.price }}</span>
              <span class="period">/ {{ pkg.period }}</span>
            </div>
          </div>

          <div class="pkg-features">
            <div v-for="(feat, fIdx) in pkg.features" :key="fIdx" class="feat-item">
              <el-icon class="check-icon"><CircleCheckFilled /></el-icon>
              <span>{{ feat }}</span>
            </div>
          </div>

          <button
            class="pkg-action-btn"
            :class="pkg.hot ? 'btn-hot' : 'btn-normal'"
            @click="appStore.submitAppointment({
              name: '林书雅 (' + pkg.name + ')',
              phone: '13812346821',
              serviceType: 'match',
              date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
              timeSlot: '14:00 - 15:30',
              storeName: '上海静安旗舰店',
              notes: '咨询套餐：' + pkg.name
            })"
          >
            立即预约到店详询
          </button>
        </div>
      </div>
    </section>

    <!-- 意向评测交互弹窗 -->
    <el-dialog
      v-model="assessmentVisible"
      title="阿拉小红娘 · 智能择偶匹配度在线测评"
      width="680px"
      append-to-body
      class="oriental-dialog"
    >
      <div class="assess-modal-content">
        <!-- 步骤进度指示 -->
        <div class="assess-stepper">
          <div class="step-dot" :class="{ active: assessStep >= 1 }">1. 基础偏好</div>
          <div class="step-bar" :class="{ filled: assessStep >= 2 }"></div>
          <div class="step-dot" :class="{ active: assessStep >= 2 }">2. 核心三观</div>
          <div class="step-bar" :class="{ filled: assessStep >= 3 }"></div>
          <div class="step-dot" :class="{ active: assessStep >= 3 }">3. 性格契合</div>
          <div class="step-bar" :class="{ filled: assessStep >= 4 }"></div>
          <div class="step-dot" :class="{ active: assessStep >= 4 }">4. 匹配报告</div>
        </div>

        <!-- 步骤 1 -->
        <div v-if="assessStep === 1" class="step-panel animate-fadeIn">
          <h3 class="panel-title">请问您心目中理想另一半的年龄与学历期望？</h3>
          <div class="form-group">
            <label>期望年龄范围：</label>
            <el-radio-group v-model="assessForm.ageRange" size="large">
              <el-radio-button label="23-27岁" value="23-27岁" />
              <el-radio-button label="28-33岁" value="28-33岁" />
              <el-radio-button label="34-40岁" value="34-40岁" />
              <el-radio-button label="不限" value="不限" />
            </el-radio-group>
          </div>
          <div class="form-group" style="margin-top: 20px;">
            <label>期望学历底线：</label>
            <el-radio-group v-model="assessForm.education" size="large">
              <el-radio-button label="全日制本科" value="全日制本科" />
              <el-radio-button label="硕士及以上" value="硕士及以上" />
              <el-radio-button label="海外名校/海归" value="海外名校/海归" />
              <el-radio-button label="不限" value="不限" />
            </el-radio-group>
          </div>
        </div>

        <!-- 步骤 2 -->
        <div v-if="assessStep === 2" class="step-panel animate-fadeIn">
          <h3 class="panel-title">您在长期亲密关系中最看重哪些维度？（多选）</h3>
          <el-checkbox-group v-model="assessForm.vitalPoints" size="large" class="vital-checkboxes">
            <el-checkbox-button label="价值观契合" value="价值观契合" />
            <el-checkbox-button label="家庭相处和谐" value="家庭相处和谐" />
            <el-checkbox-button label="情绪稳定包容" value="情绪稳定包容" />
            <el-checkbox-button label="共同消费理念" value="共同消费理念" />
            <el-checkbox-button label="事业上进心" value="事业上进心" />
            <el-checkbox-button label="生活情趣与审美" value="生活情趣与审美" />
          </el-checkbox-group>
        </div>

        <!-- 步骤 3 -->
        <div v-if="assessStep === 3" class="step-panel animate-fadeIn">
          <h3 class="panel-title">您希望对方更偏向哪种性格特质？</h3>
          <div class="character-cards">
            <div
              class="char-choice"
              :class="{ selected: assessForm.characterPreference === '温和沉稳' }"
              @click="assessForm.characterPreference = '温和沉稳'"
            >
              <div class="char-icon">🍵</div>
              <h4>温润沉稳 · 细水长流</h4>
              <p>情绪极度稳定，处事周全妥帖，善于倾听与支持</p>
            </div>
            <div
              class="char-choice"
              :class="{ selected: assessForm.characterPreference === '阳光幽默' }"
              @click="assessForm.characterPreference = '阳光幽默'"
            >
              <div class="char-icon">☀️</div>
              <h4>阳光开朗 · 热爱生活</h4>
              <p>热爱户外探索与运动，充满活力，幽默风趣</p>
            </div>
            <div
              class="char-choice"
              :class="{ selected: assessForm.characterPreference === '睿智博学' }"
              @click="assessForm.characterPreference = '睿智博学'"
            >
              <div class="char-icon">📚</div>
              <h4>知性博学 · 深度共鸣</h4>
              <p>思想深刻，逻辑清晰，能在认知与事业上共同成长</p>
            </div>
          </div>
        </div>

        <!-- 步骤 4：评测结果 -->
        <div v-if="assessStep === 4" class="step-panel result-panel animate-fadeIn">
          <div class="score-circle">
            <div class="score-num">{{ matchScoreResult }}<span class="unit">%</span></div>
            <div class="score-lbl">全库潜在契合度</div>
          </div>
          <h3 class="result-title">🎉 恭喜！全库已为您预筛选出 18 位高契合会员</h3>
          <p class="result-desc">
            根据您的择偶模型（看重【{{ assessForm.vitalPoints.join('、') }}】，倾向【{{ assessForm.characterPreference }}】），
            阿拉小红娘高级红娘【苏婉宁】已为您调取匹配候选人档案，期待为您安排专属深度面询！
          </p>

          <div class="matched-preview-list">
            <div class="preview-mini-card">
              <span class="avatar">👨‍💼</span>
              <div class="info">
                <strong>顾言深 · 31岁</strong>
                <span>复旦大学硕士 · 人工智能研发总监</span>
              </div>
              <span class="match-tag">契合度 96.2%</span>
            </div>
            <div class="preview-mini-card">
              <span class="avatar">👨‍⚕️</span>
              <div class="info">
                <strong>陆清衡 · 30岁</strong>
                <span>上海交大医学院博士 · 三甲医院外科医生</span>
              </div>
              <span class="match-tag">契合度 93.8%</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="assessStep > 1 && assessStep < 4" @click="assessStep--">上一步</el-button>
          <el-button
            v-if="assessStep < 4"
            type="primary"
            class="btn-oriental"
            :loading="isSubmitting"
            @click="nextStep"
          >
            {{ assessStep === 3 ? '生成专属匹配报告' : '下一步' }}
          </el-button>
          <el-button
            v-if="assessStep === 4"
            type="primary"
            class="btn-oriental-hot"
            @click="handleBookNow"
          >
            一键预约红娘 · 查看完整候选人资料
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.match-service-page {
  padding-bottom: 60px;
}

/* Hero 区域 */
.service-hero {
  background: linear-gradient(135deg, rgba(201, 75, 98, 0.08) 0%, rgba(194, 147, 83, 0.08) 100%), #FAF7F5;
  padding: 80px 24px 60px;
  text-align: center;
  border-bottom: 1px solid rgba(201, 75, 98, 0.12);
}
.hero-inner {
  max-width: 900px;
  margin: 0 auto;
}
.hero-tag {
  display: inline-block;
  padding: 6px 18px;
  background: rgba(201, 75, 98, 0.1);
  color: var(--color-crimson);
  font-size: 13px;
  font-weight: 600;
  border-radius: 20px;
  margin-bottom: 16px;
  letter-spacing: 1px;
}
.hero-title {
  font-size: 42px;
  color: var(--color-ink);
  font-family: var(--font-song), serif;
  font-weight: 700;
  margin-bottom: 18px;
}
.gradient-text {
  background: linear-gradient(120deg, var(--color-crimson), var(--color-gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-desc {
  font-size: 16px;
  color: var(--color-ink-muted);
  line-height: 1.8;
  max-width: 760px;
  margin: 0 auto 36px;
}
.hero-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 48px;
}
.btn-primary {
  padding: 14px 32px;
  background: linear-gradient(135deg, var(--color-crimson), var(--color-crimson-hover));
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 28px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(201, 75, 98, 0.35);
  transition: all 0.3s;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(201, 75, 98, 0.45);
}
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: #ffffff;
  color: var(--color-ink);
  font-size: 15px;
  font-weight: 600;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 28px;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-secondary:hover {
  border-color: var(--color-crimson);
  color: var(--color-crimson);
}
.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 36px;
  padding: 24px 32px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}
.stat-card {
  display: flex;
  flex-direction: column;
}
.stat-card .num {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-crimson);
  font-family: var(--font-song), serif;
}
.stat-card .lbl {
  font-size: 13px;
  color: var(--color-ink-muted);
  margin-top: 4px;
}
.stat-line {
  width: 1px;
  height: 36px;
  background: rgba(0, 0, 0, 0.08);
}

/* 六维标准 */
.pillars-section, .flow-section, .packages-section {
  max-width: 1200px;
  margin: 70px auto 0;
  padding: 0 24px;
}
.section-head {
  text-align: center;
  margin-bottom: 48px;
}
.sub-title {
  font-size: 12px;
  color: var(--color-gold);
  letter-spacing: 2px;
  font-weight: 700;
}
.main-title {
  font-size: 32px;
  color: var(--color-ink);
  font-family: var(--font-song), serif;
  margin-top: 6px;
}
.deco-line {
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, var(--color-crimson), var(--color-gold));
  margin: 14px auto 0;
  border-radius: 2px;
}

.pillars-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.pillar-card {
  background: #ffffff;
  padding: 32px 28px;
  border-radius: 16px;
  border: 1px solid rgba(201, 75, 98, 0.08);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.02);
  transition: all 0.3s;
}
.pillar-card:hover {
  transform: translateY(-4px);
  border-color: rgba(201, 75, 98, 0.3);
  box-shadow: 0 12px 30px rgba(201, 75, 98, 0.08);
}
.pillar-icon {
  font-size: 34px;
  margin-bottom: 16px;
}
.pillar-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 10px;
}
.pillar-desc {
  font-size: 14px;
  color: var(--color-ink-muted);
  line-height: 1.7;
}

/* 流程 */
.flow-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}
.flow-card {
  background: #ffffff;
  padding: 24px 20px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  position: relative;
  transition: all 0.3s;
}
.flow-card:hover {
  border-color: var(--color-gold);
  box-shadow: 0 8px 24px rgba(194, 147, 83, 0.12);
}
.step-badge {
  font-size: 26px;
  font-family: var(--font-song), serif;
  font-weight: 700;
  color: var(--color-crimson);
  opacity: 0.85;
  margin-bottom: 8px;
}
.step-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 8px;
}
.step-detail {
  font-size: 13px;
  color: var(--color-ink-muted);
  line-height: 1.6;
}

/* 套餐方案 */
.packages-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  align-items: stretch;
}
.package-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 36px 32px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
  transition: all 0.3s;
}
.package-card.is-hot {
  border: 2px solid var(--color-crimson);
  box-shadow: 0 16px 40px rgba(201, 75, 98, 0.15);
  transform: scale(1.03);
}
.hot-ribbon {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--color-crimson), #e65c78);
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(201, 75, 98, 0.4);
}
.pkg-level {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-gold);
  letter-spacing: 1.5px;
}
.pkg-name {
  font-size: 20px;
  color: var(--color-ink);
  font-weight: 700;
  margin: 6px 0 16px;
}
.pkg-price-box {
  display: flex;
  align-items: baseline;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.currency {
  font-size: 20px;
  color: var(--color-crimson);
  font-weight: 600;
}
.price-val {
  font-size: 38px;
  font-weight: 700;
  color: var(--color-crimson);
  font-family: var(--font-song), serif;
  margin-left: 2px;
}
.period {
  font-size: 13px;
  color: var(--color-ink-muted);
  margin-left: 8px;
}
.pkg-features {
  margin: 24px 0;
  flex: 1;
}
.feat-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: var(--color-ink);
  margin-bottom: 14px;
  line-height: 1.5;
}
.check-icon {
  color: var(--color-crimson);
  font-size: 16px;
  margin-top: 2px;
}
.pkg-action-btn {
  width: 100%;
  padding: 13px 0;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-hot {
  background: linear-gradient(135deg, var(--color-crimson), var(--color-crimson-hover));
  color: #ffffff;
  border: none;
  box-shadow: 0 6px 20px rgba(201, 75, 98, 0.35);
}
.btn-hot:hover {
  box-shadow: 0 10px 24px rgba(201, 75, 98, 0.45);
}
.btn-normal {
  background: rgba(201, 75, 98, 0.08);
  color: var(--color-crimson);
  border: 1px solid rgba(201, 75, 98, 0.2);
}
.btn-normal:hover {
  background: rgba(201, 75, 98, 0.15);
}

/* 测评弹窗 */
.assess-stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding: 0 10px;
}
.step-dot {
  font-size: 13px;
  color: var(--color-ink-muted);
  font-weight: 600;
}
.step-dot.active {
  color: var(--color-crimson);
}
.step-bar {
  flex: 1;
  height: 2px;
  background: rgba(0, 0, 0, 0.08);
  margin: 0 12px;
}
.step-bar.filled {
  background: var(--color-crimson);
}
.panel-title {
  font-size: 18px;
  color: var(--color-ink);
  margin-bottom: 20px;
  font-family: var(--font-song), serif;
}
.form-group label {
  display: block;
  font-size: 14px;
  color: var(--color-ink-muted);
  margin-bottom: 10px;
}
.vital-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.character-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.char-choice {
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 20px 16px;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}
.char-choice.selected {
  border-color: var(--color-crimson);
  background: rgba(201, 75, 98, 0.05);
}
.char-icon {
  font-size: 28px;
  margin-bottom: 10px;
}
.char-choice h4 {
  font-size: 15px;
  color: var(--color-ink);
  margin-bottom: 6px;
}
.char-choice p {
  font-size: 12px;
  color: var(--color-ink-muted);
  line-height: 1.5;
}

/* 结果面板 */
.result-panel {
  text-align: center;
  padding: 10px 0;
}
.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(201, 75, 98, 0.1) 0%, rgba(201, 75, 98, 0.02) 70%);
  border: 3px solid var(--color-crimson);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}
.score-num {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-crimson);
  font-family: var(--font-song), serif;
}
.score-num .unit {
  font-size: 16px;
}
.score-lbl {
  font-size: 11px;
  color: var(--color-ink-muted);
}
.result-title {
  font-size: 20px;
  color: var(--color-ink);
  margin-bottom: 10px;
}
.result-desc {
  font-size: 14px;
  color: var(--color-ink-muted);
  line-height: 1.7;
  max-width: 540px;
  margin: 0 auto 24px;
}
.matched-preview-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.preview-mini-card {
  display: flex;
  align-items: center;
  padding: 12px 18px;
  background: #fcf9f7;
  border-radius: 10px;
  border: 1px solid rgba(201, 75, 98, 0.12);
}
.preview-mini-card .avatar {
  font-size: 26px;
  margin-right: 12px;
}
.preview-mini-card .info {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
}
.preview-mini-card .info strong {
  font-size: 14px;
  color: var(--color-ink);
}
.preview-mini-card .info span {
  font-size: 12px;
  color: var(--color-ink-muted);
}
.match-tag {
  background: rgba(201, 75, 98, 0.1);
  color: var(--color-crimson);
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}
.btn-oriental {
  background: var(--color-crimson) !important;
  border-color: var(--color-crimson) !important;
  color: #fff !important;
}
.btn-oriental-hot {
  background: linear-gradient(135deg, var(--color-crimson), var(--color-gold)) !important;
  border: none !important;
  color: #fff !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
}
</style>
