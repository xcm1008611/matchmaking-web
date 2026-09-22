<template>
  <div class="login-page" @pointermove="handlePointerMove" @pointerleave="handlePointerLeave">
    <!-- 背景层：桃花树与粒子画布 -->
    <div ref="backdropRef" class="scene-backdrop" aria-hidden="true">
      <canvas ref="treeCanvasRef" class="tree-canvas"></canvas>
    </div>
    <!-- 苹果级多层动态光晕（景深弥散光） -->
    <div class="ambient-glow glow-1" aria-hidden="true"></div>
    <div class="ambient-glow glow-2" aria-hidden="true"></div>
    <canvas ref="petalCanvasRef" class="petal-canvas" aria-hidden="true"></canvas>

    <!-- 主交互区域：双翼立体磨砂交互卡片 -->
    <main class="login-container">
      <div class="login-wrapper animate-fade-up">
        <!-- 左侧：新中式唯美心动卡片（品牌与浪漫叙事） -->
        <aside class="narrative-panel animate-stagger-1">
          <div class="narrative-header">
            <div class="seal-badge">
              <span class="seal-char">緣</span>
            </div>
            <div class="brand-text">
              <span class="brand-sub">A LA · RED MATCHMAKER</span>
              <h2 class="brand-title">阿拉小红娘</h2>
            </div>
          </div>

          <div class="narrative-body">
            <div class="quote-card">
              <div class="quote-mark">“</div>
              <p class="quote-text">众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。</p>
              <div class="quote-author">—— 经典宋词 · 缘起今朝</div>
            </div>

            <!-- 动态心动数据指标 (Apple Metrics 风格) -->
            <div class="metrics-grid">
              <div class="metric-item">
                <span class="metric-num">98.6<small>%</small></span>
                <span class="metric-label">真实验证率</span>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <span class="metric-num">12,800<small>+</small></span>
                <span class="metric-label">成功牵手良缘</span>
              </div>
              <div class="metric-divider"></div>
              <div class="metric-item">
                <span class="metric-num">1v1</span>
                <span class="metric-label">红娘全程定制</span>
              </div>
            </div>

            <!-- 实时匹配心动动态播报 -->
            <div class="live-ticker">
              <span class="ticker-dot"></span>
              <span class="ticker-text">刚刚：会员 <strong>林*雅</strong> 与 <strong>顾*洲</strong> 成功完成红娘初见约会</span>
            </div>
          </div>

          <div class="narrative-footer">
            <div class="trust-tags">
              <span class="trust-tag">实名脱敏保护</span>
              <span class="trust-tag">三重身份验真</span>
              <span class="trust-tag">专属隐私加密</span>
            </div>
          </div>
        </aside>

        <!-- 右侧：Apple 级超感磨砂玻璃登录面板 -->
        <section class="auth-panel animate-stagger-2" aria-labelledby="login-title">
          <header class="auth-header">
            <div class="header-top">
              <h1 id="login-title" class="auth-title">开启良缘之旅</h1>
              <span class="status-pill">系统运行中</span>
            </div>
            <p class="auth-subtitle">在繁华都市里，为您寻觅灵魂契合的另一半</p>
          </header>

          <!-- 苹果级胶囊药丸滑动 Tab (Sliding Pill Tab) -->
          <nav class="pill-tabs" role="tablist">
            <div 
              class="pill-indicator" 
              :style="{ transform: `translateX(${activeTab === 'quick' ? '0%' : activeTab === 'account' ? '100%' : '200%'})` }"
            ></div>
            <button 
              type="button" 
              role="tab" 
              :aria-selected="activeTab === 'quick'"
              :class="['pill-tab-item', { active: activeTab === 'quick' }]" 
              @click="activeTab = 'quick'"
            >
              <span class="tab-icon">⚡</span> 原型免密通
            </button>
            <button 
              type="button" 
              role="tab" 
              :aria-selected="activeTab === 'account'"
              :class="['pill-tab-item', { active: activeTab === 'account' }]" 
              @click="activeTab = 'account'"
            >
              <span class="tab-icon">👤</span> 账号密码
            </button>
            <button 
              type="button" 
              role="tab" 
              :aria-selected="activeTab === 'code'"
              :class="['pill-tab-item', { active: activeTab === 'code' }]" 
              @click="activeTab = 'code'"
            >
              <span class="tab-icon">📱</span> 手机免密
            </button>
          </nav>

          <!-- Tab 1: 原型专属多角色一键免密进入 (极度精致的角色卡片) -->
          <div v-if="activeTab === 'quick'" class="tab-content quick-login-content animate-stagger-3">
            <div class="role-cards-grid">
              <!-- 管理员角色 -->
              <div class="role-card admin-card" @click="quickLoginAs('admin')">
                <div class="role-avatar admin-av">总</div>
                <div class="role-info">
                  <div class="role-row">
                    <strong class="role-name">张总 (总管/运营)</strong>
                    <span class="role-badge badge-admin">管理权限</span>
                  </div>
                  <p class="role-desc">查看全局运营驾驶舱、脱敏审核与财务报表</p>
                </div>
                <div class="role-arrow">→</div>
              </div>

              <!-- 金牌红娘 -->
              <div class="role-card matchmaker-card" @click="quickLoginAs('matchmaker')">
                <div class="role-avatar match-av">苏</div>
                <div class="role-info">
                  <div class="role-row">
                    <strong class="role-name">苏婉宁 (金牌红娘)</strong>
                    <span class="role-badge badge-matchmaker">红娘工作台</span>
                  </div>
                  <p class="role-desc">智能人选撮合、跟进约见、八字/星座命理配对</p>
                </div>
                <div class="role-arrow">→</div>
              </div>

              <!-- 情感顾问 -->
              <div class="role-card counselor-card" @click="quickLoginAs('counselor')">
                <div class="role-avatar counsel-av">沈</div>
                <div class="role-info">
                  <div class="role-row">
                    <strong class="role-name">沈清墨 (专家顾问)</strong>
                    <span class="role-badge badge-counselor">心理咨询</span>
                  </div>
                  <p class="role-desc">深度情感测评、亲密关系辅导、量表诊断评估</p>
                </div>
                <div class="role-arrow">→</div>
              </div>

              <!-- VIP 会员 -->
              <div class="role-card client-card" @click="quickLoginAs('client')">
                <div class="role-avatar client-av">林</div>
                <div class="role-info">
                  <div class="role-row">
                    <strong class="role-name">林书雅 (优质单身会员)</strong>
                    <span class="role-badge badge-client">会员中心</span>
                  </div>
                  <p class="role-desc">心动推荐、脱敏档案管理、红线约会邀请</p>
                </div>
                <div class="role-arrow">→</div>
              </div>

              <!-- 访客直接进入 -->
              <div class="role-card visitor-card" @click="quickLoginAs('visitor')">
                <div class="role-avatar visitor-av">客</div>
                <div class="role-info">
                  <div class="role-row">
                    <strong class="role-name">游客/访客通道</strong>
                    <span class="role-badge badge-visitor">公开首页</span>
                  </div>
                  <p class="role-desc">免登录直接浏览阿拉小红娘官网精选成功案例与活动</p>
                </div>
                <div class="role-arrow">→</div>
              </div>
            </div>
          </div>

          <!-- Tab 2: 账号密码登录 -->
          <div v-else-if="activeTab === 'account'" class="tab-content account-form-content animate-stagger-3">
            <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              size="large"
              class="apple-form"
              @keyup.enter="handleLogin"
            >
              <div class="input-group">
                <label class="input-label" for="login-username">账号 / 手机号 / 邮箱</label>
                <el-form-item prop="username">
                  <el-input
                    id="login-username"
                    v-model="form.username"
                    autocomplete="username"
                    placeholder="请输入账号 (可任意输入体验)"
                    :prefix-icon="User"
                    clearable
                  />
                </el-form-item>
              </div>

              <div class="input-group">
                <div class="label-row">
                  <label class="input-label" for="login-password">登录密码</label>
                  <button type="button" class="text-link-btn" @click="handleForgotPassword">忘记密码？</button>
                </div>
                <el-form-item prop="password">
                  <el-input
                    id="login-password"
                    v-model="form.password"
                    type="password"
                    autocomplete="current-password"
                    placeholder="请输入密码 (原型免校验)"
                    :prefix-icon="Lock"
                    show-password
                  />
                </el-form-item>
              </div>

              <div class="form-util-row">
                <el-checkbox v-model="rememberAccount" class="apple-checkbox">7天内免登录</el-checkbox>
                <span class="privacy-hint">登录即代表同意 <a href="javascript:void(0)" class="link">《用户服务协议》</a></span>
              </div>

              <el-form-item class="submit-action">
                <el-button type="primary" class="apple-primary-btn" :loading="loading" @click="handleLogin">
                  <span>立即安全登录</span>
                  <el-icon v-if="!loading" class="btn-arrow"><ArrowRight /></el-icon>
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- Tab 3: 手机验证码快捷登录 -->
          <div v-else class="tab-content phone-form-content animate-stagger-3">
            <div class="input-group">
              <label class="input-label">手机号码</label>
              <el-input v-model="phoneForm.phone" size="large" placeholder="请输入常用手机号码" :prefix-icon="User" clearable />
            </div>
            <div class="input-group" style="margin-top: 14px;">
              <label class="input-label">短信验证码</label>
              <div class="code-input-row">
                <el-input v-model="phoneForm.code" size="large" placeholder="6位验证码" :prefix-icon="Lock" />
                <el-button class="send-code-btn" :disabled="countdown > 0" @click="sendSmsCode">
                  {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
                </el-button>
              </div>
            </div>
            <div class="form-util-row" style="margin-top: 16px;">
              <span class="privacy-hint">未注册手机号验证后将自动创建新会员账号</span>
            </div>
            <el-button type="primary" class="apple-primary-btn" style="margin-top: 18px;" :loading="loading" @click="handleLogin">
              <span>进入阿拉小红娘</span>
              <el-icon v-if="!loading" class="btn-arrow"><ArrowRight /></el-icon>
            </el-button>
          </div>

          <!-- 底部版权与背书 -->
          <footer class="auth-footer">
            <div class="safe-seal">
              <span class="safe-icon">🔒</span>
              <span>256-Bit SSL 婚恋数据脱敏加密传输保护</span>
            </div>
          </footer>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ArrowRight, Lock, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAppStateStore } from '@/stores/appState'
import type { UserRole } from '@/types'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStateStore()

const activeTab = ref<'quick' | 'account' | 'code'>('quick')
const countdown = ref(0)
const phoneForm = reactive({ phone: '13888888888', code: '888888' })

function sendSmsCode() {
  countdown.value = 60
  ElMessage.success('验证码已发送至手机（原型验证码：888888）')
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}

function quickLoginAs(role: UserRole) {
  const roleNames: Partial<Record<UserRole, { name: string; title: string }>> = {
    admin: { name: '张总', title: '集团管理/运营总监' },
    store_manager: { name: '何店长', title: '旗舰店店长' },
    matchmaker: { name: '苏婉宁', title: '金牌红娘' },
    counselor: { name: '沈清墨', title: '高级情感咨询师' },
    receptionist: { name: '王小敏', title: '前台接待' },
    client: { name: '林书雅', title: 'VIP单身会员' },
    visitor: { name: '游客访客', title: '访客体验' }
  }

  const selected = roleNames[role] || { name: '用户', title: '普通身份' }

  userStore.setLogin({
    token: 'mock_prototype_token_' + Date.now(),
    user: {
      id: 'usr_' + role,
      username: role + '_demo',
      name: `${selected.name} (${selected.title})`,
      role: role
    }
  })
  appStore.switchRole(role)
  ElMessage.success({
    message: `欢迎！已以【${selected.name} · ${selected.title}】身份进入系统`,
    duration: 2500
  })

  if (role === 'admin') {
    router.push('/admin/dashboard')
  } else if (['matchmaker', 'counselor', 'receptionist'].includes(role)) {
    if (role === 'matchmaker') router.push('/workbench/matchmaker')
    else if (role === 'counselor') router.push('/workbench/counselor')
    else router.push('/workbench/reception')
  } else if (role === 'client') {
    router.push('/user/center')
  } else {
    router.push('/')
  }
}

type PetalMotion = 'upRight' | 'right' | 'downRight' | 'pass' | 'screenDive'

interface PetalSprite {
  sharp: HTMLCanvasElement
  soft: HTMLCanvasElement
  blurred: HTMLCanvasElement
}

interface Petal {
  x: number
  y: number
  depth: number
  baseDepth: number
  originX: number
  originY: number
  age: number
  lifetime: number
  approach: boolean
  motion: PetalMotion
  offsetX: number
  offsetY: number
  impulseX: number
  impulseY: number
  angle: number
  spin: number
  phase: number
  size: number
  tint: number
  seed: number
  exitSide: 'left' | 'above'
  targetX: number
  targetY: number
  spriteIndex: number
  transient: boolean
}

interface TreeScene {
  source: string
  maskSource: string
  region: { left: number; top: number; right: number; bottom: number }
  canopyBottom: number
  rootY: number
  positionY: number
}

const backdropRef = ref<HTMLElement>()
const treeCanvasRef = ref<HTMLCanvasElement>()
const petalCanvasRef = ref<HTMLCanvasElement>()
const formRef = ref<FormInstance>()
const loading = ref(false)
const rememberAccount = ref(true)
const form = reactive({ username: 'member_shuya', password: 'password123' })

const rules: FormRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

let animationFrame = 0
let canvasWidth = 0
let canvasHeight = 0
let canvasDpr = 1
let petals: Petal[] = []
let petalSprites: PetalSprite[] = []
let lastFrameTime = 0
let reduceMotion = false
let basePetalCount = 0
let petalBurstUntil = 0
let lastBurstSpawn = 0
let treeImage: HTMLImageElement | null = null
let treeImageSource = ''
let treeMaskImage: HTMLImageElement | null = null
let treeMaskSource = ''
let treeGust = 0
let treeSwayX = 0
let treeSwayVelocityX = 0
let lastTreeFrameTimestamp = 0
let lastPointerX = 0
let lastPointerY = 0
let lastPointerTime = 0

const desktopTreeScene: TreeScene = {
  source: '/assets/romance-tree-bg-v3.jpg',
  maskSource: '/assets/romance-tree-motion-mask-v5.png',
  region: { left: 232, top: 540, right: 894, bottom: 1060 },
  canopyBottom: 850,
  rootY: 1052,
  positionY: 0.38
}

const mobileTreeScene: TreeScene = {
  source: '/assets/romance-tree-mobile-v3.jpg',
  maskSource: '/assets/romance-tree-motion-mask-mobile-v5.png',
  region: { left: 96, top: 224, right: 378, bottom: 448 },
  canopyBottom: 359,
  rootY: 445,
  positionY: 0.5
}

const pointer = {
  x: -1000,
  y: -1000,
  active: false
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number) {
  const inverse = 1 - t
  return (
    inverse * inverse * inverse * p0 +
    3 * inverse * inverse * t * p1 +
    3 * inverse * t * t * p2 +
    t * t * t * p3
  )
}

function chooseMotion(): PetalMotion {
  const roll = Math.random()
  if (roll < 0.22) return 'upRight'
  if (roll < 0.4) return 'right'
  if (roll < 0.58) return 'downRight'
  if (roll < 0.7) return 'pass'
  return 'screenDive'
}

function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
}

function createPetal(initial = true, transient = false): Petal {
  const isMobile = canvasWidth <= 820
  const motion = chooseMotion()
  const depthRoll = Math.random()
  const baseDepth =
    depthRoll < 0.78
      ? randomBetween(0.025, 0.16)
      : depthRoll < 0.95
        ? randomBetween(0.16, 0.34)
        : randomBetween(0.34, 0.48)
  const clusterCenters = isMobile ? [0.14, 0.24, 0.34, 0.45] : [0.12, 0.22, 0.33, 0.44]
  const clusterCenter = clusterCenters[Math.floor(Math.random() * clusterCenters.length)]
  const originX = canvasWidth * (clusterCenter + randomBetween(-0.045, 0.045))
  const originY = canvasHeight * (isMobile
    ? randomBetween(0.2, 0.46)
    : randomBetween(0.43, 0.66))
  const lifetimeByMotion: Record<PetalMotion, [number, number]> = {
    upRight: [8.5, 14],
    right: [7, 12],
    downRight: [7.5, 12.5],
    pass: [4.5, 8],
    screenDive: [5.5, 9]
  }
  const [lifetimeMin, lifetimeMax] = lifetimeByMotion[motion]

  const petal: Petal = {
    x: originX,
    y: originY,
    depth: baseDepth,
    baseDepth,
    originX,
    originY,
    age: initial ? randomBetween(0, 0.98) : 0,
    lifetime: randomBetween(lifetimeMin, lifetimeMax),
    approach: true,
    motion,
    offsetX: 0,
    offsetY: 0,
    impulseX: 0,
    impulseY: 0,
    angle: randomBetween(0, Math.PI * 2),
    spin: randomBetween(-0.0045, 0.0045),
    phase: randomBetween(0, Math.PI * 2),
    size: randomBetween(6.5, 13.5),
    tint: randomBetween(-8, 10),
    seed: randomBetween(0, 1000),
    exitSide: Math.random() < 0.56 ? 'above' : 'left',
    targetX: randomBetween(canvasWidth * 0.34, canvasWidth * 1.02),
    targetY: randomBetween(canvasHeight * 0.1, canvasHeight * 0.9),
    spriteIndex: Math.floor(Math.random() * 16),
    transient
  }

  updatePetalPosition(petal)
  return petal
}

function seedPetals() {
  const area = canvasWidth * canvasHeight
  const count = Math.max(60, Math.min(112, Math.round(area / 15000)))
  basePetalCount = reduceMotion ? Math.round(count * 0.5) : count
  petals = Array.from({ length: basePetalCount }, () => createPetal())
}

function resetPetal(petal: Petal) {
  Object.assign(petal, createPetal(false, petal.transient))
}

function resizeCanvas() {
  const canvas = petalCanvasRef.value
  if (!canvas) return


  canvasWidth = window.innerWidth
  canvasHeight = window.innerHeight
  canvasDpr = 1
  canvas.width = Math.round(canvasWidth * canvasDpr)
  canvas.height = Math.round(canvasHeight * canvasDpr)
  canvas.style.width = `${canvasWidth}px`
  canvas.style.height = `${canvasHeight}px`
  if (!petalSprites.length) buildPetalSprites()
  seedPetals()
  resizeTreeCanvas()

  if (reduceMotion) drawFrame()
}

function getTreeScene() {
  return canvasWidth <= 820 ? mobileTreeScene : desktopTreeScene
}

function loadTreeImage() {
  const scene = getTreeScene()
  if (
    treeImageSource === scene.source
    && treeMaskSource === scene.maskSource
    && treeImage
    && treeMaskImage
  ) return

  const image = new Image()
  const mask = new Image()
  treeImage = image
  treeMaskImage = mask
  treeImageSource = scene.source
  treeMaskSource = scene.maskSource
  image.src = scene.source
  mask.src = scene.maskSource
  void Promise.all([image.decode(), mask.decode()])
    .then(() => drawTreeFrame(performance.now()))
    .catch(() => undefined)
}

function resizeTreeCanvas() {
  const canvas = treeCanvasRef.value
  const backdrop = backdropRef.value
  if (!canvas || !backdrop) return

  const width = Math.round(backdrop.clientWidth)
  const height = Math.round(backdrop.clientHeight)
  canvas.width = width
  canvas.height = height
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  loadTreeImage()
}

function drawTreeFrame(timestamp: number) {
  const canvas = treeCanvasRef.value
  const image = treeImage
  const mask = treeMaskImage
  if (
    !canvas
    || !image?.complete
    || !mask?.complete
    || image.naturalWidth === 0
    || mask.naturalWidth === 0
  ) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (reduceMotion) return

  const scene = getTreeScene()
  const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight)
  const renderedWidth = image.naturalWidth * scale
  const renderedHeight = image.naturalHeight * scale
  const offsetX = (canvas.width - renderedWidth) * 0.5
  const offsetY = (canvas.height - renderedHeight) * scene.positionY
  const frameDelta = lastTreeFrameTimestamp
    ? Math.min(2, Math.max(0.5, (timestamp - lastTreeFrameTimestamp) / 16.67))
    : 1
  lastTreeFrameTimestamp = timestamp
  const idleSway = Math.sin(timestamp * 0.0004) * 1.5 + Math.sin(timestamp * 0.00018 + 1.2) * 0.65
  const pointerTarget = pointer.active
    ? Math.max(-1.6, Math.min(1.6, (pointer.x / canvasWidth - 0.5) * 3.2))
    : 0
  treeGust *= Math.pow(0.99, frameDelta)
  const swayTarget = Math.max(-5.8, Math.min(5.8, idleSway + pointerTarget + treeGust))
  treeSwayVelocityX += (swayTarget - treeSwayX) * 0.014 * frameDelta
  treeSwayVelocityX *= Math.pow(0.965, frameDelta)
  treeSwayVelocityX = Math.max(-0.1, Math.min(0.1, treeSwayVelocityX))
  treeSwayX += treeSwayVelocityX * frameDelta
  const wind = Math.max(-6.2, Math.min(6.2, treeSwayX))
  const bandHeight = canvasWidth <= 820 ? 5 : 8
  const regionWidth = scene.region.right - scene.region.left
  const segmentCount = canvasWidth <= 820 ? 8 : 12
  const segmentWidth = regionWidth / segmentCount

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  for (let sourceY = scene.region.top; sourceY < scene.region.bottom; sourceY += bandHeight) {
    const sourceHeight = Math.min(bandHeight + 1, scene.region.bottom - sourceY)
    const centerY = sourceY + sourceHeight * 0.5
    const canopyProgress = Math.max(0, Math.min(1, (scene.canopyBottom - centerY) / (scene.canopyBottom - scene.region.top)))
    const trunkProgress = Math.max(0, Math.min(1, (scene.rootY - centerY) / (scene.rootY - scene.canopyBottom)))
    const bend = centerY <= scene.canopyBottom
      ? 0.82 + canopyProgress * 0.18
      : trunkProgress * 0.82
    for (let segment = 0; segment < segmentCount; segment += 1) {
      const sourceX = scene.region.left + segment * segmentWidth
      const sourceWidth = Math.min(segmentWidth + 1, scene.region.right - sourceX)
      const horizontalPosition = ((segment + 0.5) / segmentCount) * 2 - 1
      const movingSide = Math.max(0, Math.sign(wind) * horizontalPosition)
      const verticalDrop = movingSide * (Math.abs(wind) / 5.2) * 1.8 * bend
      const destinationX = offsetX + sourceX * scale + wind * bend
      const destinationY = offsetY + sourceY * scale + verticalDrop

      ctx.drawImage(
        image,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destinationX,
        destinationY,
        sourceWidth * scale + 0.65,
        sourceHeight * scale + 0.7
      )
    }
  }

  ctx.globalCompositeOperation = 'destination-in'
  ctx.drawImage(mask, offsetX, offsetY, renderedWidth, renderedHeight)
  ctx.globalCompositeOperation = 'source-over'
}

function createPetalShape(seed: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 180
  canvas.height = 220
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas

  const size = 72
  const phase = seededNoise(seed) * Math.PI * 2
  const denseCenters = [-0.82, -0.28, 0.28, 0.82]
  const sparsePositions = [-0.55, 0, 0.55, -0.04, 0.04]
  const filamentPositions = denseCenters.flatMap((center, clusterIndex) =>
    Array.from({ length: 9 }, (_, strandIndex) => {
      const spread = (strandIndex / 8 - 0.5) * 0.3
      const jitter = (seededNoise(seed + clusterIndex * 97 + strandIndex * 7.31) - 0.5) * 0.035
      return center + spread + jitter
    })
  ).concat(sparsePositions)
  ctx.translate(90, 150)
  ctx.lineCap = 'round'
  ctx.shadowColor = 'rgba(255, 217, 239, 0.34)'
  ctx.shadowBlur = 1.35

  ctx.beginPath()
  ctx.moveTo(0, size * 0.72)
  ctx.quadraticCurveTo(-size * 0.025, size * 0.32, 0, 0)
  ctx.strokeStyle = 'rgba(244, 190, 219, 0.76)'
  ctx.lineWidth = Math.max(0.5, size * 0.021)
  ctx.stroke()

  for (let filament = 0; filament < filamentPositions.length; filament += 1) {
    const normalized = Math.max(-0.985, Math.min(0.985, filamentPositions[filament]))
    const angle = normalized * Math.PI * 0.495
    const density = Math.min(...denseCenters.map(center => Math.abs(normalized - center))) < 0.18
      ? 0.76 + seededNoise(seed + filament * 5.17) * 0.24
      : 0.2 + seededNoise(seed + filament * 5.17) * 0.18
    const radius = size * (0.76 + seededNoise(seed + filament * 19.43) * 0.24)
    const endX = Math.sin(angle) * radius
    const endY = -Math.cos(angle) * radius
    const curveAngle = angle * 0.82 + Math.sin(phase + filament * 0.7) * 0.09
    const controlRadius = radius * (0.42 + seededNoise(seed + filament * 23.7) * 0.08)
    const controlX = Math.sin(curveAngle) * controlRadius
    const controlY = -Math.cos(curveAngle) * controlRadius
    const filamentGradient = ctx.createLinearGradient(0, 0, endX, endY)

    if (density > 0.48) {
      filamentGradient.addColorStop(0, 'rgba(255, 222, 240, 0.9)')
      filamentGradient.addColorStop(0.42, 'rgba(255, 244, 250, 0.98)')
      filamentGradient.addColorStop(0.76, 'rgba(255, 248, 252, 0.96)')
      filamentGradient.addColorStop(1, 'rgba(246, 177, 215, 0.88)')
    } else {
      filamentGradient.addColorStop(0, 'rgba(250, 195, 223, 0.82)')
      filamentGradient.addColorStop(0.52, 'rgba(255, 222, 239, 0.9)')
      filamentGradient.addColorStop(1, 'rgba(229, 119, 178, 0.84)')
    }

    ctx.beginPath()
    ctx.moveTo(Math.sin(angle) * size * 0.018, -Math.cos(angle) * size * 0.018)
    ctx.quadraticCurveTo(controlX, controlY, endX, endY)
    ctx.save()
    ctx.globalAlpha = 0.24
    ctx.strokeStyle = filamentGradient
    ctx.lineWidth = Math.max(1.1, size * (0.026 + density * 0.012))
    ctx.shadowColor = 'rgba(255, 206, 233, 0.52)'
    ctx.shadowBlur = 3.2
    ctx.stroke()
    ctx.restore()
    ctx.strokeStyle = filamentGradient
    ctx.lineWidth = Math.max(0.35, size * (0.012 + density * 0.009))
    ctx.stroke()
  }

  ctx.beginPath()
  ctx.arc(0, 0, Math.max(0.8, size * 0.045), 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(244, 181, 214, 0.82)'
  ctx.fill()
  return canvas
}

function blurPetalShape(source: HTMLCanvasElement, amount: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  ctx.filter = `blur(${amount}px)`
  ctx.drawImage(source, 0, 0)
  ctx.filter = 'none'
  return canvas
}

function buildPetalSprites() {
  petalSprites = Array.from({ length: 16 }, (_, index) => {
    const sharp = createPetalShape(41.7 + index * 17.13)
    return {
      sharp,
      soft: blurPetalShape(sharp, 0.65),
      blurred: blurPetalShape(sharp, 1.6)
    }
  })
}

function drawFeatherPetal(ctx: CanvasRenderingContext2D, petal: Petal) {
  const sprite = petalSprites[petal.spriteIndex]
  if (!sprite) return
  const depthCurve = Math.pow(petal.depth, 2.18)
  const diveScale = petal.motion === 'screenDive' ? 1.2 : 1
  const size = petal.size * diveScale * (0.18 + depthCurve * 4.45)
  const scale = size / 72
  const opacity = Math.min(1, 0.045 + petal.depth * 0.78)
  const exitProgress = Math.max(0, (petal.age - 0.84) / 0.16)
  const exitFade = petal.motion === 'screenDive' ? 1 - exitProgress * exitProgress : 1
  const source = petal.depth < 0.16 ? sprite.blurred : petal.depth < 0.28 ? sprite.soft : sprite.sharp

  ctx.save()
  ctx.translate(petal.x, petal.y)
  ctx.rotate(petal.angle)
  ctx.globalAlpha = opacity * exitFade
  ctx.drawImage(
    source,
    -source.width * scale * 0.5,
    -source.height * scale * 0.68,
    source.width * scale,
    source.height * scale
  )
  ctx.restore()
}

function updatePetalPosition(petal: Petal) {
  const t = Math.min(1, Math.max(0, petal.age))
  const pathT = Math.pow(t, 1.28)
  let pathX = petal.originX
  let pathY = petal.originY

  if (petal.motion === 'upRight') {
    pathX = cubicBezier(
      petal.originX,
      petal.originX + canvasWidth * 0.18,
      canvasWidth * 0.68,
      canvasWidth * (1.08 + seededNoise(petal.seed + 1) * 0.12),
      pathT
    )
    pathY = cubicBezier(
      petal.originY,
      petal.originY - canvasHeight * 0.04,
      canvasHeight * 0.2,
      -canvasHeight * (0.08 + seededNoise(petal.seed + 2) * 0.1),
      pathT
    )
  } else if (petal.motion === 'right') {
    pathX = cubicBezier(
      petal.originX,
      petal.originX + canvasWidth * 0.2,
      canvasWidth * 0.72,
      canvasWidth * (1.1 + seededNoise(petal.seed + 1) * 0.1),
      pathT
    )
    pathY = cubicBezier(
      petal.originY,
      petal.originY - canvasHeight * 0.02,
      petal.originY + (seededNoise(petal.seed + 2) - 0.5) * canvasHeight * 0.08,
      petal.originY + (seededNoise(petal.seed + 3) - 0.5) * canvasHeight * 0.12,
      pathT
    )
  } else if (petal.motion === 'downRight') {
    pathX = cubicBezier(
      petal.originX,
      petal.originX + canvasWidth * 0.18,
      canvasWidth * 0.7,
      canvasWidth * (1.08 + seededNoise(petal.seed + 4) * 0.12),
      pathT
    )
    pathY = cubicBezier(
      petal.originY,
      petal.originY + canvasHeight * 0.1,
      canvasHeight * 0.72,
      canvasHeight * (0.92 + seededNoise(petal.seed + 5) * 0.1),
      pathT
    )
  } else if (petal.motion === 'screenDive') {
    pathX = cubicBezier(
      petal.originX,
      petal.originX + canvasWidth * 0.16,
      petal.targetX - canvasWidth * 0.16,
      petal.targetX,
      pathT
    )
    pathY = cubicBezier(
      petal.originY,
      petal.originY + canvasHeight * 0.02,
      petal.targetY + canvasHeight * 0.08,
      petal.targetY,
      pathT
    )
  } else if (petal.exitSide === 'above') {
    pathX = cubicBezier(
      petal.originX,
      petal.originX + canvasWidth * 0.26,
      canvasWidth * 0.64,
      canvasWidth * (1.06 + seededNoise(petal.seed + 6) * 0.08),
      pathT
    )
    pathY = cubicBezier(
      petal.originY,
      petal.originY - canvasHeight * 0.12,
      canvasHeight * 0.2,
      -canvasHeight * (0.04 + seededNoise(petal.seed + 7) * 0.1),
      pathT
    )
  } else {
    pathX = cubicBezier(
      petal.originX,
      petal.originX + canvasWidth * 0.28,
      canvasWidth * 0.08,
      -canvasWidth * (0.1 + seededNoise(petal.seed + 8) * 0.1),
      pathT
    )
    pathY = cubicBezier(
      petal.originY,
      petal.originY - canvasHeight * 0.04,
      canvasHeight * 0.32,
      canvasHeight * (0.12 + seededNoise(petal.seed + 9) * 0.52),
      pathT
    )
  }

  const smooth = t * t * (3 - 2 * t)
  const targetDepth = petal.motion === 'screenDive'
    ? 1.12 + seededNoise(petal.seed + 3) * 0.08
    : 0.94 + seededNoise(petal.seed + 3) * 0.05
  petal.depth = petal.approach
    ? Math.min(petal.motion === 'screenDive' ? 1.2 : 0.99, petal.baseDepth + smooth * (targetDepth - petal.baseDepth))
    : Math.min(0.5, petal.baseDepth + smooth * 0.07)
  petal.x = pathX + petal.offsetX
  petal.y = pathY + petal.offsetY
}

function drawFrame() {
  const canvas = petalCanvasRef.value
  const ctx = canvas?.getContext('2d')
  if (!canvas || !ctx) return

  ctx.setTransform(canvasDpr, 0, 0, canvasDpr, 0, 0)
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  for (const petal of petals) drawFeatherPetal(ctx, petal)
}

function animatePetals(timestamp: number) {
  if (document.hidden || reduceMotion) return

  const delta = Math.min(2.1, Math.max(0.45, (timestamp - lastFrameTime) / 16.67 || 1))
  lastFrameTime = timestamp

  if (timestamp < petalBurstUntil && timestamp - lastBurstSpawn > 46 && petals.length < basePetalCount + 34) {
    petals.push(createPetal(false, true), createPetal(false, true))
    lastBurstSpawn = timestamp
  }

  for (let index = petals.length - 1; index >= 0; index -= 1) {
    const petal = petals[index]
    petal.age += delta / (petal.lifetime * 60)
    petal.phase += 0.0045 * delta

    if (pointer.active) {
      const dx = petal.x - pointer.x
      const dy = petal.y - pointer.y
      const distance = Math.hypot(dx, dy)
      const radius = 145 + petal.depth * 55
      if (distance > 0.5 && distance < radius) {
        const force = (1 - distance / radius) * (0.13 + petal.depth * 0.34)
        petal.impulseX += (dx / distance) * force
        petal.impulseY += (dy / distance) * force
      }
    }

    petal.impulseX *= 0.962
    petal.impulseY *= 0.962
    petal.offsetX += petal.impulseX * delta
    petal.offsetY += petal.impulseY * delta
    petal.offsetX *= 0.997
    petal.offsetY *= 0.997
    petal.angle += (petal.spin + Math.sin(petal.phase) * 0.001) * delta
    updatePetalPosition(petal)

    if (
      petal.age >= 1 ||
      petal.x > canvasWidth + 100 ||
      petal.x < -canvasWidth * 0.18 ||
      petal.y > canvasHeight + 100 ||
      petal.y < -canvasHeight * 0.16
    ) {
      if (petal.transient && timestamp >= petalBurstUntil) {
        petals.splice(index, 1)
      } else {
        resetPetal(petal)
      }
    }
  }

  drawTreeFrame(timestamp)
  drawFrame()
  animationFrame = window.requestAnimationFrame(animatePetals)
}

function handlePointerMove(event: PointerEvent) {
  pointer.x = event.clientX
  pointer.y = event.clientY
  const isOverPanel = event.target instanceof Element && Boolean(event.target.closest('.login-wrapper'))
  pointer.active = event.pointerType === 'mouse' && !isOverPanel

  const now = performance.now()
  if (pointer.active && lastPointerTime > 0) {
    const elapsed = Math.max(8, now - lastPointerTime)
    const movementX = event.clientX - lastPointerX
    const movementY = event.clientY - lastPointerY
    const velocity = Math.hypot(movementX, movementY) / elapsed
    if (velocity > 0.55) {
      const gustStrength = Math.min(4.4, Math.max(1.2, Math.abs(movementX) * 0.045 + velocity * 0.88))
      const direction = Math.abs(movementX) > 1 ? Math.sign(movementX) : 1
      treeGust = Math.max(-4.4, Math.min(4.4, treeGust + gustStrength * direction))
      petalBurstUntil = Math.max(petalBurstUntil, now + 1150)
    }
  }
  lastPointerX = event.clientX
  lastPointerY = event.clientY
  lastPointerTime = now
}

function handlePointerLeave() {
  pointer.active = false
  pointer.x = -1000
  pointer.y = -1000
  lastPointerTime = 0
}

function handleVisibilityChange() {
  window.cancelAnimationFrame(animationFrame)
  if (!document.hidden && !reduceMotion) {
    lastFrameTime = performance.now()
    animationFrame = window.requestAnimationFrame(animatePetals)
  }
}

function handleForgotPassword() {
  ElMessage.info('已开启绿色重置通道，请联系微信专属红娘协助重置')
}

async function handleLogin() {
  loading.value = true
  try {
    userStore.setLogin({
      token: 'mock_prototype_token_' + Date.now(),
      user: {
        id: 'usr_01',
        username: form.username || 'member_shuya',
        name: '林书雅 (VIP会员)',
        role: 'client'
      }
    })
    appStore.switchRole('client')
    ElMessage.success('登录成功，欢迎回到阿拉小红娘！')
    const redirect = (route.query.redirect as string) || '/user/center'
    router.push(redirect)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const rememberedUsername = localStorage.getItem('remembered_username')
  if (rememberedUsername) form.username = rememberedUsername
  rememberAccount.value = Boolean(rememberedUsername)
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  await nextTick()
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas, { passive: true })
  document.addEventListener('visibilitychange', handleVisibilityChange)

  if (!reduceMotion) {
    lastFrameTime = performance.now()
    animationFrame = window.requestAnimationFrame(animatePetals)
  }
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationFrame)
  window.removeEventListener('resize', resizeCanvas)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  overflow-x: hidden;
  overflow-y: auto;
  color: #1d1d1f;
  background: #2b1b24;
  display: flex;
  align-items: center;
  justify-content: center;
  isolation: isolate;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

/* 桃花树背景 */
.scene-backdrop {
  position: absolute;
  inset: -10px;
  z-index: -4;
  background-image: url('/assets/romance-tree-bg-v3.jpg');
  background-position: center 38%;
  background-size: cover;
  filter: brightness(0.92) saturate(1.05) contrast(1.02);
  transform: scale(1.01);
}

.tree-canvas,
.petal-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.petal-canvas {
  z-index: -1;
}

/* 苹果级多层动态光晕 */
.ambient-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: -2;
  opacity: 0.45;
  animation: pulseGlow 8s ease-in-out infinite alternate;
}

.glow-1 {
  width: 500px;
  height: 500px;
  top: 10%;
  right: 15%;
  background: radial-gradient(circle, rgba(155, 28, 46, 0.4), rgba(197, 160, 89, 0.2), transparent 70%);
}

.glow-2 {
  width: 450px;
  height: 450px;
  bottom: 10%;
  left: 20%;
  background: radial-gradient(circle, rgba(197, 160, 89, 0.35), rgba(155, 28, 46, 0.2), transparent 70%);
  animation-delay: -4s;
}

/* 主容器布局：宽屏居中，双翼形态 */
.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1080px;
  margin: auto;
  padding: 40px 24px;
}

.login-wrapper {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.85);
  border-radius: 28px;
  box-shadow: 
    0 30px 70px rgba(43, 27, 36, 0.25),
    0 4px 20px rgba(155, 28, 46, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  overflow: hidden;
}

/* 左侧：叙事叙情面板 */
.narrative-panel {
  padding: 44px 40px;
  background: linear-gradient(145deg, rgba(253, 242, 244, 0.85), rgba(255, 255, 255, 0.5));
  border-right: 1px solid rgba(229, 229, 234, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.narrative-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.seal-badge {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #9b1c2e, #6e101d);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(155, 28, 46, 0.35);
  border: 1px solid rgba(197, 160, 89, 0.6);
  position: relative;
}

.seal-char {
  color: #fff;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 24px;
  font-weight: 700;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-sub {
  font-size: 10px;
  letter-spacing: 2px;
  color: #8c6a2b;
  font-weight: 600;
}

.brand-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1d1d1f;
  font-family: "Noto Serif SC", "Songti SC", serif;
}

.narrative-body {
  margin: 32px 0;
}

.quote-card {
  position: relative;
  padding: 20px 22px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  border: 1px solid rgba(197, 160, 89, 0.25);
  margin-bottom: 24px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
}

.quote-mark {
  position: absolute;
  top: 8px;
  right: 14px;
  font-size: 36px;
  color: rgba(197, 160, 89, 0.3);
  font-family: serif;
  line-height: 1;
}

.quote-text {
  font-size: 14px;
  line-height: 1.7;
  color: #3a3a3c;
  font-family: "Noto Serif SC", "Songti SC", serif;
  margin-bottom: 8px;
}

.quote-author {
  font-size: 11px;
  color: #8c6a2b;
  text-align: right;
}

.metrics-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 14px;
  border: 1px solid rgba(229, 229, 234, 0.6);
  margin-bottom: 20px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.metric-num {
  font-size: 20px;
  font-weight: 700;
  color: #9b1c2e;
  letter-spacing: -0.5px;
}

.metric-num small {
  font-size: 12px;
  margin-left: 2px;
}

.metric-label {
  font-size: 11px;
  color: #86868b;
  margin-top: 2px;
}

.metric-divider {
  width: 1px;
  height: 28px;
  background: rgba(229, 229, 234, 0.8);
}

.live-ticker {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #636366;
  padding: 8px 12px;
  background: rgba(155, 28, 46, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(155, 28, 46, 0.1);
}

.ticker-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34c759;
  box-shadow: 0 0 6px #34c759;
}

.ticker-text strong {
  color: #9b1c2e;
}

.trust-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.trust-tag {
  font-size: 11px;
  color: #636366;
  background: rgba(255, 255, 255, 0.6);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid rgba(229, 229, 234, 0.6);
}

/* 右侧：登录认证面板 */
.auth-panel {
  padding: 44px 44px;
  display: flex;
  flex-direction: column;
}

.auth-header {
  margin-bottom: 22px;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auth-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  letter-spacing: -0.3px;
}

.status-pill {
  font-size: 11px;
  color: #2d7a6e;
  background: #eef7f5;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.auth-subtitle {
  margin: 6px 0 0;
  font-size: 13px;
  color: #86868b;
}

/* 苹果级胶囊药丸滑动 Tab */
.pill-tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: #f2f2f7;
  padding: 4px;
  border-radius: 14px;
  margin-bottom: 24px;
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.pill-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc((100% - 8px) / 3);
  height: calc(100% - 8px);
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1;
}

.pill-tab-item {
  position: relative;
  z-index: 2;
  border: none;
  background: transparent;
  padding: 9px 0;
  font-size: 12px;
  font-weight: 600;
  color: #636366;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: color 0.2s ease;
}

.pill-tab-item.active {
  color: #9b1c2e;
}

/* 覆盖 global.css 的全局按钮过渡，避免 !important 干扰 Tab 微交互 */
.pill-tabs button {
  transition: color 0.25s var(--ease-apple) !important;
}

.pill-tabs button:active {
  transform: none !important;
}

.tab-icon {
  font-size: 13px;
}

/* 角色卡片列表 (原型专属快速通道) */
.role-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 4px;
}

.role-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.65);
  border: 1px solid rgba(229, 229, 234, 0.8);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.role-card:hover {
  transform: translateY(-2px);
  background: #ffffff;
  border-color: rgba(155, 28, 46, 0.3);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.role-card:active {
  transform: scale(0.98);
}

.role-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.admin-av { background: #fee2e2; color: #991b1b; }
.match-av { background: #fef3c7; color: #92400e; }
.counsel-av { background: #e0e7ff; color: #3730a3; }
.client-av { background: #fce7f3; color: #9d174d; }
.visitor-av { background: #f3f4f6; color: #4b5563; }

.role-info {
  flex: 1;
  min-width: 0;
}

.role-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.role-name {
  font-size: 13px;
  color: #1d1d1f;
}

.role-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.badge-admin { background: #fee2e2; color: #991b1b; }
.badge-matchmaker { background: #fef3c7; color: #92400e; }
.badge-counselor { background: #e0e7ff; color: #3730a3; }
.badge-client { background: #fce7f3; color: #9d174d; }
.badge-visitor { background: #f3f4f6; color: #4b5563; }

.role-desc {
  font-size: 11px;
  color: #86868b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.role-arrow {
  color: #c7c7cc;
  font-size: 15px;
  transition: transform 0.2s ease, color 0.2s ease;
}

.role-card:hover .role-arrow {
  transform: translateX(3px);
  color: #9b1c2e;
}

/* 账号表单与输入框设计 */
.apple-form {
  display: flex;
  flex-direction: column;
}

.input-group {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #48484a;
  margin-bottom: 6px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.label-row .input-label {
  margin-bottom: 0;
}

.text-link-btn {
  border: none;
  background: transparent;
  color: #9b1c2e;
  font-size: 11px;
  cursor: pointer;
  padding: 0;
}

.text-link-btn:hover {
  text-decoration: underline;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 0 1px rgba(229, 229, 234, 0.9) inset;
  padding: 6px 14px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

:deep(.el-input__wrapper:hover) {
  background: #ffffff;
  box-shadow: 0 0 0 1px rgba(155, 28, 46, 0.3) inset;
}

:deep(.el-input__wrapper.is-focus) {
  background: #ffffff;
  box-shadow: 0 0 0 2px #9b1c2e inset, 0 0 12px rgba(155, 28, 46, 0.15) !important;
}

.form-util-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 11px;
}

.privacy-hint {
  color: #86868b;
}

.privacy-hint .link {
  color: #9b1c2e;
  text-decoration: none;
}

.privacy-hint .link:hover {
  text-decoration: underline;
}

/* 苹果级主按钮 */
.apple-primary-btn {
  width: 100%;
  height: 46px;
  background: linear-gradient(135deg, #9b1c2e, #7a1221);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 8px 20px rgba(155, 28, 46, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.apple-primary-btn:hover {
  background: linear-gradient(135deg, #b82337, #8c1426);
  box-shadow: 0 10px 24px rgba(155, 28, 46, 0.36);
  transform: translateY(-1px);
}

.apple-primary-btn:active {
  transform: scale(0.97);
}

.btn-arrow {
  font-size: 14px;
  transition: transform 0.2s ease;
}

.apple-primary-btn:hover .btn-arrow {
  transform: translateX(3px);
}

/* 手机验证码行 */
.code-input-row {
  display: flex;
  gap: 10px;
}

.send-code-btn {
  border-radius: 12px;
  height: 40px;
  font-size: 12px;
  font-weight: 600;
  border-color: rgba(155, 28, 46, 0.3);
  color: #9b1c2e;
}

.send-code-btn:hover {
  background: rgba(155, 28, 46, 0.05);
  border-color: #9b1c2e;
}

/* 底部安全背书 */
.auth-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(229, 229, 234, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.safe-seal {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #86868b;
}

.safe-icon {
  font-size: 12px;
}

/* 响应式适配 */
@media (max-width: 900px) {
  .login-wrapper {
    grid-template-columns: 1fr;
    max-width: 480px;
    margin: 0 auto;
  }
  
  .narrative-panel {
    display: none;
  }
  
  .auth-panel {
    padding: 32px 24px;
  }
}
</style>
