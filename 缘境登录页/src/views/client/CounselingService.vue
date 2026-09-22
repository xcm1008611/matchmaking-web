<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStateStore } from '@/stores/appState'
import {
  FirstAidKit,
  ChatLineRound,
  Lock,
  CircleCheckFilled,
  Calendar,
  Right,
  Service
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const appStore = useAppStateStore()

// 自测与排查弹窗
const testModalVisible = ref(false)
const testStep = ref(1)
const testAnswers = ref({
  issueType: '沟通冷战',
  duration: '1-3个月',
  attitude: '双方疲惫但仍想挽回',
  severity: 3
})
const testResultScore = ref(78)

function openCrisisTest() {
  testModalVisible.value = true
  testStep.value = 1
}

function handleTestSubmit() {
  testStep.value = 2
}

function handleBookCounseling(expertName = '沈清墨') {
  testModalVisible.value = false
  appStore.submitAppointment({
    name: '林书雅 (情感咨询)',
    phone: '13812346821',
    serviceType: 'counseling',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    timeSlot: '15:30 - 17:00',
    storeName: '上海静安旗舰店',
    notes: `预约咨询专家【${expertName}】，调解诉求：${testAnswers.value.issueType}，持续时长：${testAnswers.value.duration}`
  })
}

// 调解四大核心领域
const domains = [
  {
    title: '婚姻危机干预与关系挽救',
    desc: '针对长期冷战、缺乏共同话题、信任危机、家庭重大分歧等，由注册心理咨询师进行系统家庭干预。',
    tag: '深度个案',
    icon: '❤️‍🩹'
  },
  {
    title: '婆媳与多代家庭系统调停',
    desc: '理顺家庭成员边界感，建立有效沟通公约，化解两代人因带娃观念、消费观念引发的长期家庭内耗。',
    tag: '系统调解',
    icon: '🏡'
  },
  {
    title: '婚前心理辅导与深度对齐',
    desc: '梳理婚前焦虑、恐婚情绪，深度对齐生育观、消费观、家庭财产公约与危机应对共识。',
    tag: '预防护航',
    icon: '💍'
  },
  {
    title: '个人依恋模式与情商提升',
    desc: '解析焦虑型/回避型依恋根源，提升共情沟通、情绪自控与亲密关系经营心智。',
    tag: '心智成长',
    icon: '🌱'
  }
]

// 调解方法论
const methodology = [
  {
    title: '1. 单独访谈 · 情绪降温',
    desc: '分别与双方建立安全信任空间，宣泄积压负面情绪，梳理各自未被看见的心理诉求与委屈。'
  },
  {
    title: '2. 联合会谈 · 重建对话',
    desc: '在专家主持的中立安全场域中，引导双方打破防御机制，学会非暴力沟通与真实脆弱表达。'
  },
  {
    title: '3. 根源破译 · 契约共建',
    desc: '剖析底层依恋障碍与原生家庭投射，共同制定家庭行为边界与切实可行的改善契约。'
  },
  {
    title: '4. 跟踪陪伴 · 巩固复盘',
    desc: '调解后1-3个月内定期电话回访与复盘，防范矛盾复发，让新的良性相处模式固化成习惯。'
  }
]

// 专家顾问名单（沈清墨、陆思远等）
const counselors = [
  {
    name: '沈清墨',
    title: '首席家庭情感疗愈导师',
    tags: ['国家二级心理咨询师', '萨提亚家庭治疗师', '12年婚恋咨询经验'],
    desc: '擅长处理婚姻深层危机、冷战破冰与亲密关系创伤修复，风格温润而有穿透力。',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    solvedCases: '1,200+'
  },
  {
    name: '陆思远',
    title: '资深亲密关系与依恋导师',
    tags: ['中科院心理所硕士', 'CBT认知行为治疗', '8年婚恋咨询经验'],
    desc: '专注依恋模式重构、两性沟通障碍与婚前恐惧疏导，善于运用逻辑与温柔化解对抗。',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    solvedCases: '860+'
  }
]
</script>

<template>
  <div class="counseling-page">
    <!-- Hero 区域 -->
    <section class="counsel-hero">
      <div class="hero-inner">
        <div class="hero-tag">东方心学智慧 · 现代亲密关系心理干预 · 100% 严守隐私保密</div>
        <h1 class="hero-title">
          修补心之缝隙，<span class="gradient-text">唤醒如初深情</span>
        </h1>
        <p class="hero-desc">
          一段健康的亲密关系，不仅需要相遇的缘分，更需要相处的心智与修补的智慧。
          阿拉小红娘情感调解中心由资深国家级心理咨询师与家庭系统治疗师领衔，为您提供中立、温暖、科学的关系修复服务。
        </p>

        <div class="hero-actions">
          <button class="btn-primary" @click="openCrisisTest">
            <span>🛡️ 30秒亲密关系健康自测</span>
          </button>
          <button class="btn-secondary" @click="handleBookCounseling('沈清墨')">
            <span>预约资深专家 1v1 调解</span>
            <el-icon><Right /></el-icon>
          </button>
        </div>

        <div class="guarantee-bar">
          <div class="g-item">
            <el-icon class="g-icon"><Lock /></el-icon>
            <span>签署严格隐私保密协议</span>
          </div>
          <div class="g-item">
            <el-icon class="g-icon"><CircleCheckFilled /></el-icon>
            <span>国家二级/三级认证心理专家</span>
          </div>
          <div class="g-item">
            <el-icon class="g-icon"><Service /></el-icon>
            <span>独立私密中式静心咨询室</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 业务板块 -->
    <section class="domains-section">
      <div class="section-head">
        <span class="sub-title">CORE DOMAINS</span>
        <h2 class="main-title">四大关系修护维度 · 拨云见日</h2>
        <div class="deco-line"></div>
      </div>

      <div class="domains-grid">
        <div v-for="(item, idx) in domains" :key="idx" class="domain-card">
          <div class="domain-top">
            <span class="icon">{{ item.icon }}</span>
            <span class="domain-tag">{{ item.tag }}</span>
          </div>
          <h3 class="domain-title">{{ item.title }}</h3>
          <p class="domain-desc">{{ item.desc }}</p>
          <div class="domain-footer">
            <a class="action-link" @click="handleBookCounseling('沈清墨')">
              预约该项服务专项调解 →
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 方法论 -->
    <section class="method-section">
      <div class="section-head">
        <span class="sub-title">SCIENTIFIC WORKFLOW</span>
        <h2 class="main-title">四阶科学调解路径 · 让爱重回正轨</h2>
        <div class="deco-line"></div>
      </div>

      <div class="method-cards">
        <div v-for="(m, idx) in methodology" :key="idx" class="m-card">
          <div class="m-step-num">STEP {{ idx + 1 }}</div>
          <h4 class="m-title">{{ m.title }}</h4>
          <p class="m-desc">{{ m.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 专家顾问 -->
    <section class="counselors-section">
      <div class="section-head">
        <span class="sub-title">EXPERT COUNSELORS</span>
        <h2 class="main-title">阿拉小红娘资深心理与情感调解专家</h2>
        <div class="deco-line"></div>
      </div>

      <div class="counselors-grid">
        <div v-for="(c, idx) in counselors" :key="idx" class="counselor-card">
          <img :src="c.avatar" class="c-avatar" alt="counselor avatar" />
          <div class="c-info">
            <div class="c-header">
              <h3 class="c-name">{{ c.name }}</h3>
              <span class="c-title">{{ c.title }}</span>
            </div>
            <div class="c-tags">
              <span v-for="(t, tIdx) in c.tags" :key="tIdx" class="c-tag">{{ t }}</span>
            </div>
            <p class="c-desc">{{ c.desc }}</p>
            <div class="c-bottom">
              <div class="stat">
                <span class="val">{{ c.solvedCases }}</span>
                <span class="lbl">累计成功调解案例</span>
              </div>
              <button class="btn-book-c" @click="handleBookCounseling(c.name)">
                指定预约该专家
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 关系危机自测弹窗 -->
    <el-dialog
      v-model="testModalVisible"
      title="阿拉小红娘 · 亲密关系健康度快速排查"
      width="640px"
      append-to-body
      class="oriental-dialog"
    >
      <div class="test-modal-body">
        <div v-if="testStep === 1">
          <div class="form-item">
            <label class="item-lbl">当前您遇到的主要困扰是什么？</label>
            <el-radio-group v-model="testAnswers.issueType" size="large">
              <el-radio-button label="沟通冷战" value="沟通冷战" />
              <el-radio-button label="信任与安全感破裂" value="信任与安全感破裂" />
              <el-radio-button label="婆媳/原生家庭干涉" value="婆媳/原生家庭干涉" />
              <el-radio-button label="婚前纠结与焦虑" value="婚前纠结与焦虑" />
            </el-radio-group>
          </div>

          <div class="form-item" style="margin-top: 24px;">
            <label class="item-lbl">该困扰持续了多长时间？</label>
            <el-radio-group v-model="testAnswers.duration" size="large">
              <el-radio-button label="1个月以内" value="1个月以内" />
              <el-radio-button label="1-3个月" value="1-3个月" />
              <el-radio-button label="半年以上" value="半年以上" />
              <el-radio-button label="1年以上" value="1年以上" />
            </el-radio-group>
          </div>

          <div class="form-item" style="margin-top: 24px;">
            <label class="item-lbl">双方目前对待关系的沟通意愿：</label>
            <el-radio-group v-model="testAnswers.attitude" size="large">
              <el-radio-button label="双方疲惫但仍想挽回" value="双方疲惫但仍想挽回" />
              <el-radio-button label="一方冷漠一方焦虑" value="一方冷漠一方焦虑" />
              <el-radio-button label="濒临离婚/分手边缘" value="濒临离婚/分手边缘" />
            </el-radio-group>
          </div>
        </div>

        <div v-if="testStep === 2" class="test-result-box animate-fadeIn">
          <div class="result-badge-circle">
            <span class="res-score">78</span>
            <span class="res-lbl">关系修复潜能分</span>
          </div>
          <h3>专家初步评估结论：处于【黄金修补期】</h3>
          <p class="res-text">
            您填写的【{{ testAnswers.issueType }}】且持续【{{ testAnswers.duration }}】，
            主要属于两性沟通模式失衡与未满足的情感期待累积所致。只要引入中立且专业的系统家庭干预，打破彼此的防御心理，关系完全有极高概率重燃温情。
          </p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button v-if="testStep === 1" type="primary" class="btn-oriental" @click="handleTestSubmit">
            查看专家排查评估
          </el-button>
          <el-button v-if="testStep === 2" type="primary" class="btn-oriental-hot" @click="handleBookCounseling('沈清墨')">
            立即预约沈清墨老师一对一深度调解
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.counseling-page {
  padding-bottom: 60px;
}

.counsel-hero {
  background: linear-gradient(135deg, rgba(201, 75, 98, 0.06) 0%, rgba(194, 147, 83, 0.08) 100%), #FAF7F5;
  padding: 80px 24px 50px;
  text-align: center;
  border-bottom: 1px solid rgba(201, 75, 98, 0.1);
}
.hero-inner {
  max-width: 900px;
  margin: 0 auto;
}
.hero-tag {
  display: inline-block;
  padding: 6px 18px;
  background: rgba(194, 147, 83, 0.15);
  color: var(--color-gold);
  font-size: 13px;
  font-weight: 700;
  border-radius: 20px;
  margin-bottom: 16px;
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
  margin-bottom: 40px;
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
.guarantee-bar {
  display: flex;
  justify-content: center;
  gap: 36px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.g-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-ink);
  font-weight: 500;
}
.g-icon {
  color: var(--color-crimson);
  font-size: 16px;
}

/* 板块 */
.domains-section, .method-section, .counselors-section {
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

.domains-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
}
.domain-card {
  background: #ffffff;
  padding: 32px 30px;
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.02);
  transition: all 0.3s;
}
.domain-card:hover {
  transform: translateY(-4px);
  border-color: rgba(201, 75, 98, 0.3);
  box-shadow: 0 12px 32px rgba(201, 75, 98, 0.08);
}
.domain-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.domain-top .icon {
  font-size: 32px;
}
.domain-tag {
  font-size: 12px;
  color: var(--color-crimson);
  background: rgba(201, 75, 98, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
}
.domain-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 12px;
}
.domain-desc {
  font-size: 14px;
  color: var(--color-ink-muted);
  line-height: 1.7;
  margin-bottom: 20px;
}
.action-link {
  font-size: 14px;
  color: var(--color-crimson);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.action-link:hover {
  text-decoration: underline;
}

/* 方法论 */
.method-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.m-card {
  background: #ffffff;
  padding: 26px 20px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.m-step-num {
  font-size: 12px;
  color: var(--color-gold);
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 8px;
}
.m-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 10px;
}
.m-desc {
  font-size: 13px;
  color: var(--color-ink-muted);
  line-height: 1.6;
}

/* 专家顾问 */
.counselors-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}
.counselor-card {
  background: #ffffff;
  padding: 28px;
  border-radius: 20px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
}
.c-avatar {
  width: 140px;
  height: 180px;
  border-radius: 14px;
  object-fit: cover;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}
.c-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.c-header {
  margin-bottom: 8px;
}
.c-name {
  font-size: 22px;
  color: var(--color-ink);
  font-weight: 700;
  font-family: var(--font-song), serif;
}
.c-title {
  font-size: 13px;
  color: var(--color-gold);
  font-weight: 600;
  margin-left: 8px;
}
.c-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
.c-tag {
  font-size: 11px;
  background: #f5f5f5;
  color: var(--color-ink-muted);
  padding: 2px 8px;
  border-radius: 4px;
}
.c-desc {
  font-size: 13px;
  color: var(--color-ink-muted);
  line-height: 1.6;
  flex: 1;
  margin-bottom: 16px;
}
.c-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.stat .val {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-crimson);
  font-family: var(--font-song), serif;
}
.stat .lbl {
  font-size: 11px;
  color: var(--color-ink-muted);
  margin-left: 4px;
}
.btn-book-c {
  padding: 8px 18px;
  background: var(--color-crimson);
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-book-c:hover {
  background: var(--color-crimson-hover);
}

/* 弹窗 */
.form-item .item-lbl {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  margin-bottom: 10px;
}
.test-result-box {
  text-align: center;
  padding: 20px 0;
}
.result-badge-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(201, 75, 98, 0.1);
  border: 2px solid var(--color-crimson);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.res-score {
  font-size: 30px;
  font-weight: 700;
  color: var(--color-crimson);
  font-family: var(--font-song), serif;
}
.res-lbl {
  font-size: 11px;
  color: var(--color-ink-muted);
}
.res-text {
  font-size: 14px;
  color: var(--color-ink-muted);
  line-height: 1.7;
  max-width: 500px;
  margin: 12px auto 0;
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
