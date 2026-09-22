<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStateStore } from '@/stores/appState'
import { useUserStore } from '@/stores/user'
import { MOCK_USERS, MOCK_MEMBERS, MOCK_STAFF } from '@/mock'
import type { UserRole } from '@/types'
import { ElMessage } from 'element-plus'
import {
  User,
  Lock,
  Iphone,
  Key,
  Right,
  Check,
  House,
  CircleCheck,
  Star,
  Service,
  UserFilled,
  View,
  Hide,
  CollectionTag,
  CircleCheckFilled,
  Opportunity
} from '@element-plus/icons-vue'

const router = useRouter()
const appStore = useAppStateStore()
const userStore = useUserStore()

// 登录 Tab：'account' 账号密码 | 'sms' 验证码登录 | 'quick' 角色秒通
const activeTab = ref<'account' | 'sms' | 'quick'>('quick')

// 表单数据
const form = reactive({
  account: '',
  password: '',
  phone: '',
  smsCode: '',
  remember: true,
  agree: true
})

// 密码可见性
const showPassword = ref(false)

// 验证码倒计时
const countdown = ref(0)
let timer: any = null

function sendSmsCode() {
  if (!form.phone || !/^1[3-9]\d{9}$/.test(form.phone)) {
    ElMessage.warning('请输入正确的11位大陆手机号码')
    return
  }
  if (countdown.value > 0) return

  countdown.value = 60
  form.smsCode = '888888'
  ElMessage.success('验证码已发送至手机（演示环境已自动填入：888888）')
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 登录中状态
const isSubmitting = ref(false)

// 演示角色快捷列表
const quickRoles = [
  {
    role: 'admin' as UserRole,
    name: '张总',
    roleLabel: '总店长 · 经营总控',
    desc: '全盘经营大盘、全生命周期线索与员工组织架构管理',
    badge: '管理端',
    badgeType: 'danger',
    targetPath: '/admin/dashboard',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    color: '#9b1c2e'
  },
  {
    role: 'matchmaker' as UserRole,
    name: '苏婉宁',
    roleLabel: '金牌红娘 · 8年资深',
    desc: '客户画像建档、严选会员库精准匹配与线下茶室排期',
    badge: '红娘工作台',
    badgeType: 'warning',
    targetPath: '/workbench/matchmaker',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    color: '#c5a059'
  },
  {
    role: 'counselor' as UserRole,
    name: '沈清墨',
    roleLabel: '情感顾问 · 心理专家',
    desc: '亲密关系调解、婚前心理评估与咨询个案闭环跟进',
    badge: '顾问工作台',
    badgeType: 'success',
    targetPath: '/workbench/counselor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    color: '#2d7a6e'
  },
  {
    role: 'receptionist' as UserRole,
    name: '李晓萌',
    roleLabel: '客服主管 · 咨询首接',
    desc: '全网多渠道来访接待、诉求意向摸排与线索分流指派',
    badge: '客服接待台',
    badgeType: 'info',
    targetPath: '/workbench/reception',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    color: '#4f46e5'
  },
  {
    role: 'client' as UserRole,
    name: '林书雅',
    roleLabel: '严选会员 · 高级分析师',
    desc: '浏览脱敏会员大厅、提交牵线意向与跟进专属红娘服务',
    badge: '会员中心',
    badgeType: 'primary',
    targetPath: '/user/center',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    color: '#9b1c2e'
  }
]

// 一键免密角色登录
function handleQuickLogin(item: typeof quickRoles[0]) {
  isSubmitting.value = true
  appStore.switchRole(item.role)
  
  userStore.setLogin({
    token: `mock_token_${item.role}_${Date.now()}`,
    user: {
      id: MOCK_USERS[item.role].id,
      username: MOCK_USERS[item.role].username,
      name: MOCK_USERS[item.role].name,
      role: item.role,
      avatar: MOCK_USERS[item.role].avatar
    }
  })

  setTimeout(() => {
    isSubmitting.value = false
    ElMessage.success(`欢迎进入【阿拉小红娘】· 已切换为 ${item.name} (${item.roleLabel})`)
    router.push(item.targetPath)
  }, 400)
}

// 表单常规登录
function handleFormSubmit() {
  if (!form.agree) {
    ElMessage.warning('请阅读并勾选《用户服务协议》与《隐私政策》')
    return
  }

  if (activeTab.value === 'account') {
    if (!form.account.trim()) {
      ElMessage.warning('请输入登录账号 / 手机号')
      return
    }
    if (!form.password.trim()) {
      ElMessage.warning('请输入登录密码')
      return
    }
  } else if (activeTab.value === 'sms') {
    if (!form.phone || !/^1[3-9]\d{9}$/.test(form.phone)) {
      ElMessage.warning('请输入正确的手机号码')
      return
    }
    if (!form.smsCode) {
      ElMessage.warning('请输入短信验证码')
      return
    }
  }

  isSubmitting.value = true

  // 默认根据账号判断或以注册会员/管理员登录
  const isAdm = form.account.toLowerCase().includes('admin') || form.account === '18888888888'
  const matchedRole: UserRole = isAdm ? 'admin' : 'client'

  setTimeout(() => {
    isSubmitting.value = false
    appStore.switchRole(matchedRole)
    userStore.setLogin({
      token: `token_${Date.now()}`,
      user: {
        id: MOCK_USERS[matchedRole].id,
        username: form.account || form.phone,
        name: MOCK_USERS[matchedRole].name,
        role: matchedRole,
        avatar: MOCK_USERS[matchedRole].avatar
      }
    })
    ElMessage.success('登录成功，正在进入系统...')
    router.push(matchedRole === 'admin' ? '/admin/dashboard' : '/user/center')
  }, 500)
}

// 快速以游客身份继续浏览前台
function handleVisitorEnter() {
  appStore.switchRole('visitor')
  router.push('/')
}

// 左侧轮播展示真实严选会员与红娘专家
const showcaseMembers = computed(() => MOCK_MEMBERS.slice(0, 3))
const activeShowcaseIndex = ref(0)
setInterval(() => {
  activeShowcaseIndex.value = (activeShowcaseIndex.value + 1) % showcaseMembers.value.length
}, 4500)
</script>

<template>
  <div class="luxury-login-page">
    <!-- 顶部极简导航 -->
    <header class="top-nav-bar">
      <div class="brand-identity" @click="router.push('/')">
        <div class="seal-mark">緣</div>
        <div class="brand-titles">
          <span class="main-title">阿拉小红娘</span>
          <span class="sub-title">一对一东方雅致高端婚恋与情感咨询</span>
        </div>
      </div>
      
      <div class="nav-right-actions">
        <button class="back-home-btn" @click="router.push('/')">
          <el-icon><House /></el-icon>
          <span>返回官网首页</span>
        </button>
      </div>
    </header>

    <!-- 主展示区 -->
    <div class="login-stage-container">
      <div class="login-stage-card">
        <!-- 左侧：东方美学与高品质会员展示看板 -->
        <div class="stage-left-panel">
          <!-- 雅致纹理与光晕 -->
          <div class="panel-bg-texture"></div>
          <div class="ambient-ruby-glow"></div>

          <div class="left-content-wrapper">
            <!-- 标语 -->
            <div class="oriental-badge">
              <span class="gold-dot"></span>
              <span>东方温润美学 · 终身良缘之约</span>
            </div>

            <h1 class="hero-slogan">
              严选真实心动<br />
              <span class="highlight-text">共赴温润此生</span>
            </h1>

            <p class="hero-subtext">
              100% 实名学历资产多重核验，资深红娘一对一深度洞察，打造高净值精英专属的私密婚恋体验。
            </p>

            <!-- 动态严选会员卡片轮播 (展示系统真实会员画像) -->
            <div class="vip-showcase-box">
              <div class="showcase-header">
                <div class="showcase-tag">
                  <el-icon><Star /></el-icon>
                  <span>本周严选嘉宾画像</span>
                </div>
                <div class="showcase-dots">
                  <span
                    v-for="(_, idx) in showcaseMembers"
                    :key="idx"
                    class="dot"
                    :class="{ active: idx === activeShowcaseIndex }"
                    @click="activeShowcaseIndex = idx"
                  ></span>
                </div>
              </div>

              <div
                v-for="(member, idx) in showcaseMembers"
                :key="member.id"
                class="member-preview-card"
                :class="{ visible: idx === activeShowcaseIndex }"
              >
                <img :src="member.avatar" :alt="member.name" class="member-avatar" />
                <div class="member-info">
                  <div class="member-name-row">
                    <span class="name">{{ member.name }}</span>
                    <span class="age">{{ member.age }}岁 · {{ member.height }}cm</span>
                    <span class="verified-pill">
                      <el-icon><CircleCheckFilled /></el-icon>
                      已实名认证
                    </span>
                  </div>
                  <div class="member-career">{{ member.education }} · {{ member.occupation }}</div>
                  <div class="member-tags">
                    <span v-for="tag in member.personalityTags.slice(0, 3)" :key="tag" class="tag-pill">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 核心数据背调指标 -->
            <div class="trust-stats-row">
              <div class="stat-col">
                <div class="stat-num">100<small>%</small></div>
                <div class="stat-label">实名学历背调</div>
              </div>
              <div class="stat-sep"></div>
              <div class="stat-col">
                <div class="stat-num">1v1</div>
                <div class="stat-label">红娘顾问全程陪伴</div>
              </div>
              <div class="stat-sep"></div>
              <div class="stat-col">
                <div class="stat-num">85.6<small>%</small></div>
                <div class="stat-label">初见双向好感率</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：现代轻奢交互登录/体验面板 -->
        <div class="stage-right-panel">
          <div class="login-card-inner">
            <!-- 头部欢迎词 -->
            <div class="login-header">
              <div class="welcome-row">
                <h2 class="login-title">欢迎登录</h2>
                <span class="secure-tag">
                  <el-icon><CircleCheck /></el-icon>
                  金融级隐私保护
                </span>
              </div>
              <p class="login-subtitle">请选择演示角色秒通或使用账号/手机验证码登录</p>
            </div>

            <!-- Tab 切换 -->
            <div class="custom-tabs-nav">
              <button
                class="tab-item"
                :class="{ active: activeTab === 'quick' }"
                @click="activeTab = 'quick'"
              >
                <el-icon><Opportunity /></el-icon>
                <span>演示角色免密直达</span>
                <span class="recommend-badge">推荐体验</span>
              </button>
              <button
                class="tab-item"
                :class="{ active: activeTab === 'account' }"
                @click="activeTab = 'account'"
              >
                <el-icon><User /></el-icon>
                <span>账号密码</span>
              </button>
              <button
                class="tab-item"
                :class="{ active: activeTab === 'sms' }"
                @click="activeTab = 'sms'"
              >
                <el-icon><Iphone /></el-icon>
                <span>验证码登录</span>
              </button>
            </div>

            <!-- TAB 1: 角色免密直达（让评审/老板一目了然体验系统各端） -->
            <div v-if="activeTab === 'quick'" class="quick-role-panel animate-fade-in">
              <div class="role-hint-banner">
                点击下方预设角色，立即免密进入对应管理后台、工作台或会员中心：
              </div>

              <div class="role-grid-list">
                <div
                  v-for="item in quickRoles"
                  :key="item.role"
                  class="role-card-item"
                  @click="handleQuickLogin(item)"
                >
                  <img :src="item.avatar" :alt="item.name" class="role-avatar" />
                  <div class="role-main">
                    <div class="role-header">
                      <span class="role-name">{{ item.name }}</span>
                      <span class="role-badge" :class="item.badgeType">{{ item.badge }}</span>
                    </div>
                    <div class="role-title-text">{{ item.roleLabel }}</div>
                    <div class="role-desc-text">{{ item.desc }}</div>
                  </div>
                  <div class="role-action-arrow">
                    <el-icon><Right /></el-icon>
                  </div>
                </div>
              </div>

              <!-- 游客快速入口 -->
              <div class="visitor-foot-row">
                <button class="btn-visitor" @click="handleVisitorEnter">
                  以普通访客身份直接浏览前台
                  <el-icon><Right /></el-icon>
                </button>
              </div>
            </div>

            <!-- TAB 2: 账号密码登录 -->
            <div v-else-if="activeTab === 'account'" class="form-panel animate-fade-in">
              <form @submit.prevent="handleFormSubmit" class="login-form">
                <div class="form-group">
                  <label class="form-label">登录账号 / 手机号</label>
                  <div class="input-wrapper">
                    <el-icon class="input-icon"><User /></el-icon>
                    <input
                      v-model="form.account"
                      type="text"
                      placeholder="请输入用户名（管理端输入 admin）"
                      class="custom-input"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <div class="label-with-action">
                    <label class="form-label">登录密码</label>
                    <a href="javascript:;" class="forget-link" @click="ElMessage.info('演示环境任意密码即可直接登录')">
                      忘记密码？
                    </a>
                  </div>
                  <div class="input-wrapper">
                    <el-icon class="input-icon"><Lock /></el-icon>
                    <input
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="请输入密码（演示环境任意输入）"
                      class="custom-input"
                    />
                    <button
                      type="button"
                      class="toggle-pwd-btn"
                      @click="showPassword = !showPassword"
                    >
                      <el-icon v-if="showPassword"><View /></el-icon>
                      <el-icon v-else><Hide /></el-icon>
                    </button>
                  </div>
                </div>

                <div class="form-options">
                  <label class="checkbox-label">
                    <input v-model="form.remember" type="checkbox" />
                    <span>30天内保持登录状态</span>
                  </label>
                </div>

                <button
                  type="submit"
                  class="submit-login-btn"
                  :disabled="isSubmitting"
                >
                  <span v-if="!isSubmitting">立即登录</span>
                  <span v-else>正在验证安全登录...</span>
                  <el-icon v-if="!isSubmitting"><Right /></el-icon>
                </button>
              </form>
            </div>

            <!-- TAB 3: 手机验证码登录 -->
            <div v-else-if="activeTab === 'sms'" class="form-panel animate-fade-in">
              <form @submit.prevent="handleFormSubmit" class="login-form">
                <div class="form-group">
                  <label class="form-label">手机号码</label>
                  <div class="input-wrapper">
                    <el-icon class="input-icon"><Iphone /></el-icon>
                    <input
                      v-model="form.phone"
                      type="tel"
                      maxlength="11"
                      placeholder="请输入11位大陆手机号码"
                      class="custom-input"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">短信验证码</label>
                  <div class="input-wrapper code-wrapper">
                    <el-icon class="input-icon"><Key /></el-icon>
                    <input
                      v-model="form.smsCode"
                      type="text"
                      maxlength="6"
                      placeholder="请输入6位验证码"
                      class="custom-input"
                    />
                    <button
                      type="button"
                      class="send-code-btn"
                      :disabled="countdown > 0"
                      @click="sendSmsCode"
                    >
                      {{ countdown > 0 ? `${countdown}s 后重新获取` : '获取验证码' }}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  class="submit-login-btn"
                  :disabled="isSubmitting"
                >
                  <span v-if="!isSubmitting">验证并登录</span>
                  <span v-else>正在验证手机号...</span>
                  <el-icon v-if="!isSubmitting"><Right /></el-icon>
                </button>
              </form>
            </div>

            <!-- 底部协议与声明 -->
            <div class="login-footer">
              <label class="agreement-label">
                <input v-model="form.agree" type="checkbox" />
                <span>
                  我已阅读并同意
                  <a href="javascript:;" class="text-link" @click="ElMessage.info('已遵守《阿拉小红娘用户服务协议》')">《用户服务协议》</a>
                  与
                  <a href="javascript:;" class="text-link" @click="ElMessage.info('已遵守《隐私保护政策及脱敏守则》')">《隐私保护政策》</a>
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.luxury-login-page {
  min-height: 100vh;
  background-color: #f7f8fa;
  background-image: 
    radial-gradient(circle at 10% 15%, rgba(155, 28, 46, 0.04) 0%, transparent 40%),
    radial-gradient(circle at 90% 85%, rgba(197, 160, 89, 0.05) 0%, transparent 45%);
  display: flex;
  flex-direction: column;
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

/* 顶部导航 */
.top-nav-bar {
  height: 68px;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  position: sticky;
  top: 0;
  z-index: 50;
}

.brand-identity {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  user-select: none;
}

.seal-mark {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #9b1c2e, #78101e);
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(155, 28, 46, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.brand-titles {
  display: flex;
  flex-direction: column;
}

.brand-titles .main-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #1d1d1f;
  font-family: "Noto Serif SC", "Songti SC", serif;
}

.brand-titles .sub-title {
  font-size: 11px;
  color: #86868b;
  letter-spacing: 0.5px;
}

.back-home-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e5e5ea;
  background: #ffffff;
  color: #48484a;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.back-home-btn:hover {
  background: #fdf2f4;
  border-color: #9b1c2e;
  color: #9b1c2e;
  transform: translateY(-1px);
}

/* 主舞台区 */
.login-stage-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
}

.login-stage-card {
  width: 100%;
  max-width: 1180px;
  min-height: 640px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: grid;
  grid-template-columns: 1.15fr 1.35fr;
  overflow: hidden;
}

/* 左侧品牌与会员展示面板 */
.stage-left-panel {
  background: linear-gradient(145deg, #181516 0%, #261f22 60%, #1c1417 100%);
  color: #ffffff;
  padding: 48px 44px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.panel-bg-texture {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background-image: radial-gradient(#fff 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

.ambient-ruby-glow {
  position: absolute;
  top: -20%;
  left: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(155, 28, 46, 0.35) 0%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
}

.left-content-wrapper {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.oriental-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(197, 160, 89, 0.15);
  border: 1px solid rgba(197, 160, 89, 0.3);
  color: #e5c382;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
  margin-bottom: 24px;
}

.gold-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e5c382;
  box-shadow: 0 0 8px #e5c382;
}

.hero-slogan {
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 34px;
  line-height: 1.35;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 14px;
}

.highlight-text {
  background: linear-gradient(135deg, #e5c382 0%, #ff8a99 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtext {
  font-size: 13.5px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 32px;
}

/* 严选会员展示看板 */
.vip-showcase-box {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 32px;
  position: relative;
  min-height: 130px;
}

.showcase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.showcase-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #e5c382;
  font-weight: 500;
}

.showcase-dots {
  display: flex;
  gap: 6px;
}

.showcase-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.25);
  cursor: pointer;
  transition: all 0.3s ease;
}

.showcase-dots .dot.active {
  width: 16px;
  background: #e5c382;
}

.member-preview-card {
  display: none;
  align-items: center;
  gap: 16px;
  animation: fadeIn 0.4s ease forwards;
}

.member-preview-card.visible {
  display: flex;
}

.member-avatar {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5c382;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.member-info {
  flex: 1;
}

.member-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.member-name-row .name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.member-name-row .age {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.verified-pill {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: rgba(45, 122, 110, 0.3);
  border: 1px solid rgba(45, 122, 110, 0.6);
  color: #72dac9;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
}

.member-career {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 6px;
}

.member-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-pill {
  font-size: 10.5px;
  padding: 2px 7px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
}

/* 核心背调数据 */
.trust-stats-row {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-col {
  text-align: center;
}

.stat-num {
  font-size: 20px;
  font-weight: 700;
  color: #e5c382;
  font-family: "Noto Serif SC", serif;
}

.stat-num small {
  font-size: 13px;
  font-weight: 400;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.stat-sep {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
}

/* 右侧登录与角色面板 */
.stage-right-panel {
  padding: 44px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-card-inner {
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}

.login-header {
  margin-bottom: 24px;
}

.welcome-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.login-title {
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 26px;
  font-weight: 700;
  color: #1d1d1f;
}

.secure-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  color: #2d7a6e;
  background: #eef7f5;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.login-subtitle {
  font-size: 13px;
  color: #86868b;
}

/* Tab 切换栏 */
.custom-tabs-nav {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr;
  background: #f2f2f7;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
  margin-bottom: 24px;
}

.tab-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 9px 8px;
  border: none;
  background: transparent;
  color: #636366;
  font-size: 13px;
  font-weight: 500;
  border-radius: 9px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.tab-item:hover {
  color: #1d1d1f;
}

.tab-item.active {
  background: #ffffff;
  color: #9b1c2e;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.recommend-badge {
  position: absolute;
  top: -6px;
  right: 2px;
  background: linear-gradient(135deg, #9b1c2e, #d82b43);
  color: #fff;
  font-size: 9px;
  padding: 1px 5px;
  border-radius: 8px;
  transform: scale(0.88);
  font-weight: 600;
}

/* 角色秒通网格 */
.role-hint-banner {
  font-size: 12px;
  color: #86868b;
  margin-bottom: 14px;
  padding-left: 2px;
}

.role-grid-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 330px;
  overflow-y: auto;
  padding-right: 4px;
}

.role-card-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background: #fafafa;
  border: 1px solid #e5e5ea;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.role-card-item:hover {
  background: #ffffff;
  border-color: #9b1c2e;
  box-shadow: 0 6px 20px rgba(155, 28, 46, 0.08);
  transform: translateY(-2px);
}

.role-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #e5e5ea;
}

.role-main {
  flex: 1;
  min-width: 0;
}

.role-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.role-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.role-badge {
  font-size: 10.5px;
  padding: 1px 7px;
  border-radius: 6px;
  font-weight: 600;
}

.role-badge.danger {
  background: #fdf2f4;
  color: #9b1c2e;
  border: 1px solid rgba(155, 28, 46, 0.2);
}

.role-badge.warning {
  background: #fcf8ee;
  color: #8c6a2b;
  border: 1px solid rgba(197, 160, 89, 0.3);
}

.role-badge.success {
  background: #eef7f5;
  color: #2d7a6e;
  border: 1px solid rgba(45, 122, 110, 0.3);
}

.role-badge.info {
  background: #eef2ff;
  color: #4f46e5;
  border: 1px solid rgba(79, 70, 229, 0.2);
}

.role-badge.primary {
  background: #fdf2f4;
  color: #9b1c2e;
  border: 1px solid rgba(155, 28, 46, 0.2);
}

.role-title-text {
  font-size: 11.5px;
  color: #48484a;
  margin-bottom: 2px;
}

.role-desc-text {
  font-size: 11px;
  color: #86868b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-action-arrow {
  color: #c7c7cc;
  font-size: 16px;
  transition: transform 0.2s ease;
}

.role-card-item:hover .role-action-arrow {
  color: #9b1c2e;
  transform: translateX(4px);
}

.visitor-foot-row {
  margin-top: 14px;
  text-align: center;
}

.btn-visitor {
  background: transparent;
  border: none;
  color: #86868b;
  font-size: 12.5px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.btn-visitor:hover {
  color: #9b1c2e;
}

/* 表单输入模式 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
}

.label-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forget-link {
  font-size: 12px;
  color: #86868b;
  text-decoration: none;
}

.forget-link:hover {
  color: #9b1c2e;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #86868b;
  font-size: 16px;
  pointer-events: none;
}

.custom-input {
  width: 100%;
  height: 46px;
  padding: 0 42px 0 40px;
  border-radius: 12px;
  border: 1px solid #e5e5ea;
  background: #fafafa;
  font-size: 14px;
  color: #1d1d1f;
  outline: none;
  transition: all 0.2s ease;
}

.custom-input:focus {
  background: #ffffff;
  border-color: #9b1c2e;
  box-shadow: 0 0 0 3px rgba(155, 28, 46, 0.1);
}

.toggle-pwd-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #86868b;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.code-wrapper .custom-input {
  padding-right: 120px;
}

.send-code-btn {
  position: absolute;
  right: 8px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  background: #fdf2f4;
  border: 1px solid rgba(155, 28, 46, 0.2);
  color: #9b1c2e;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.send-code-btn:disabled {
  background: #f2f2f7;
  color: #86868b;
  border-color: #e5e5ea;
  cursor: not-allowed;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: #636366;
  cursor: pointer;
}

.checkbox-label input {
  accent-color: #9b1c2e;
}

.submit-login-btn {
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #9b1c2e, #7c1120);
  color: #ffffff;
  border: none;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(155, 28, 46, 0.25);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  margin-top: 8px;
}

.submit-login-btn:hover {
  background: linear-gradient(135deg, #b82337, #9b1c2e);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(155, 28, 46, 0.35);
}

.submit-login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 底部协议与声明 */
.login-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f2f2f7;
  text-align: center;
}

.agreement-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #86868b;
}

.agreement-label input {
  accent-color: #9b1c2e;
}

.text-link {
  color: #9b1c2e;
  text-decoration: none;
}

.text-link:hover {
  text-decoration: underline;
}

/* 动效 */
.animate-fade-in {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式适配 */
@media (max-width: 960px) {
  .login-stage-card {
    grid-template-columns: 1fr;
  }
  .stage-left-panel {
    display: none;
  }
  .stage-right-panel {
    padding: 32px 24px;
  }
}
</style>
