<script setup lang="ts">
/**
 * 东方同心锁 · 3D 金石见证组件
 *
 * 核心功能：
 * 1. 真实豆包场景背景图 + 国风光影氛围渲染
 * 2. 完美居中与精致缩放（Three.js 精确包围盒与视口自适应）
 * 3. 锁面文字镌刻：顶部「同心锁」标题 + 左右竖排可替换文字 + 中央交叉双心（姓名入心），
 *    透明 Canvas 贴图严格贴合锁面，正面/背面独立、无边框无底色
 * 4. 确认刻印时播放逐笔镌刻动画（正面 → 背面逐行显现，模拟现场刻字），打字可实时预览
 * 5. 点击锁体平滑飞入页面正中央全屏放大（平滑自转飞升 + 360° 沉浸式把玩）
 * 6. 双方确认播放关锁动画（GLTF 骨骼动画：锁梁从开锁位落回锁孔）
 */
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ElMessage } from 'element-plus'
import { useAppStateStore } from '@/stores/appState'

const appStore = useAppStateStore()

// 铭文专色配置
const COLOR_GOLD = '#D9A441' // 暖金：未牵线 / 等待确认
const COLOR_PINK = '#E592A2' // 柔美粉色底色（参考图中的内嵌柔粉）
const COLOR_PINK_BORDER = '#f5c678' // 细金边描边
const COLOR_GRAY = '#8D8998' // 灰紫银灰：已婉拒

type Decision = 'pending' | 'confirmed' | 'rejected'
type LockStatus = 'open' | 'confirming' | 'locked'

// ---- 业务状态 ----
const lockState = reactive({
  ownerName: '',
  matchedName: '',
  ownerDecision: 'pending' as Decision,
  matchedDecision: 'pending' as Decision,
  lockStatus: 'open' as LockStatus
})

const inscriptions = reactive({
  left: '心心相印',
  right: '永结同心',
  back: '永结同心'
})

// 快捷誓词选项
const quickPhrases = ['永结同心', '白首成约', '琴瑟和鸣', '两情相悦', '执子之手', '天赐良缘']

// 姓名由应用状态提供，避免在锁面上出现与当前配对关系不一致的手动铭文。
const currentUserName = computed(() =>
  appStore.currentUser?.role === 'client' ? appStore.currentUser.name?.trim() || '' : ''
)
const matchedUserName = computed(() => appStore.tongxinMatch?.name?.trim() || '')

const displayLeft = computed(() => currentUserName.value || '等待登录')
const displayRight = computed(() => matchedUserName.value || '等待牵线')

// 铭牌文字随名字长度自适应字号，避免长名被截断
function nameFontSize(name: string) {
  const len = name?.length || 0
  if (len > 4) return '12px'
  if (len > 2) return '14px'
  return '16px'
}

// 模型加载完成标记（须在下方 immediate watch 之前声明，避免 TDZ 报错）
const loaded = ref(false)

watch(
  [currentUserName, matchedUserName],
  ([ownerName, matchedName]) => {
    lockState.ownerName = ownerName
    lockState.matchedName = matchedName
    if (loaded.value) renderTextTextures()
  },
  { immediate: true }
)

// ---- 状态徽章与文案 ----
const statusLabel = computed(() => {
  const s = lockState.lockStatus
  if (s === 'locked') return '永结同心 · 已镌锁'
  if (lockState.matchedDecision === 'rejected') return '缘浅 · 各自安好'
  if (lockState.ownerDecision === 'confirmed' && lockState.matchedDecision === 'confirmed') return '双方确认 · 共结同心'
  if (lockState.ownerDecision === 'confirmed') return '缘定 · 静候佳音'
  return '同心锁 · 待镌刻'
})

const statusClass = computed(() => {
  const s = lockState.lockStatus
  if (s === 'locked') return 'is-locked'
  if (lockState.matchedDecision === 'rejected') return 'is-rejected'
  if (lockState.ownerDecision === 'confirmed' && lockState.matchedDecision === 'confirmed') return 'is-paired'
  if (lockState.ownerDecision === 'confirmed') return 'is-confirmed'
  return 'is-open'
})

const statusColor = computed(() => {
  if (lockState.matchedDecision === 'rejected') return COLOR_GRAY
  if (lockState.ownerDecision === 'confirmed' || lockState.lockStatus === 'locked') return COLOR_PINK
  return COLOR_GOLD
})

const leftColor = computed(() =>
  lockState.ownerDecision === 'rejected' ? COLOR_GRAY : lockState.ownerDecision === 'confirmed' ? COLOR_PINK : COLOR_GOLD
)

const rightColor = computed(() => {
  if (lockState.matchedDecision === 'rejected') return COLOR_GRAY
  if (lockState.matchedDecision === 'confirmed') return COLOR_PINK
  return COLOR_GOLD
})

// ---- 3D 渲染核心变量 ----
const cardStage = ref<HTMLElement>()
const editStage = ref<HTMLElement>()

const progress = ref(0)
const editing = ref(false)
const saving = ref(false)
const isHovered = ref(false)

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let mixer: THREE.AnimationMixer | null = null
let closeAction: THREE.AnimationAction | null = null
let lockGroup: THREE.Group | null = null
let isClosing = false
let isOpening = false
let clock = new THREE.Clock()
let rafId = 0
let resizeObserver: ResizeObserver | null = null
let isAnimatingFly = false
let modelHeight = 1
let modelWidth = 1

function fitLockToViewport() {
  if (!lockGroup || !camera || modelHeight <= 0) return
  const viewHeight = 2 * Math.abs(camera.position.z) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  const viewWidth = viewHeight * camera.aspect
  const targetRatio = editing.value ? 0.82 : 0.68
  const hScale = (viewHeight * targetRatio) / modelHeight
  const wScale = (viewWidth * 0.9) / Math.max(modelWidth, 0.001)
  lockGroup.scale.setScalar(Math.min(hScale, wScale))
  lockGroup.position.set(0, 0, 0)
}

// 纹理材质与 Canvas 映射（正面整幅 / 背面整幅，各自独立）
const textMeshes: { front?: THREE.Mesh; back?: THREE.Mesh } = {}
const textCanvases: { front?: HTMLCanvasElement; back?: HTMLCanvasElement } = {}

// ---- 缓动函数 ----
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
function easeOutBack(x: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

// ---- Canvas 动态绘制铭文（正面整幅 + 背面整幅，透明背景、无边框无底色） ----
// 标准饱满圆润东方爱心（以 x, y 为几何中心，四段对称三阶贝塞尔曲线）
function heartPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.beginPath()
  // 顶部内凹点
  ctx.moveTo(x, y - h * 0.22)
  // 左心瓣上弧（圆润外展，肩部饱满圆润）
  ctx.bezierCurveTo(x - w * 0.14, y - h * 0.52, x - w * 0.5, y - h * 0.44, x - w * 0.5, y - h * 0.1)
  // 左心瓣下弧（圆润顺滑收拢至底部中心尖角）
  ctx.bezierCurveTo(x - w * 0.5, y + h * 0.2, x - w * 0.24, y + h * 0.38, x, y + h * 0.5)
  // 右心瓣下弧（对称至右侧）
  ctx.bezierCurveTo(x + w * 0.24, y + h * 0.38, x + w * 0.5, y + h * 0.2, x + w * 0.5, y - h * 0.1)
  // 右心瓣上弧（对称至顶部内凹点）
  ctx.bezierCurveTo(x + w * 0.5, y - h * 0.44, x + w * 0.14, y - h * 0.52, x, y - h * 0.22)
  ctx.closePath()
}

// 绘制具有金石凹刻与金属切面光影的爱心（矢量渲染，无半透明阴影噪点）
function drawEngravedHeart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rotation: number,
  strokeColor = '#f0c265'
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)

  // 彻底关闭半透明阴影，避免 WebGL 采样产生斑点杂质
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // 1. 深色凹槽底线（下移 1.2px，清晰矢量凹刻）
  ctx.strokeStyle = '#3a1408'
  ctx.lineWidth = Math.max(3.6, w * 0.04)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.save()
  ctx.translate(0, 1.2)
  heartPath(ctx, 0, 0, w, h)
  ctx.stroke()
  ctx.restore()

  // 2. 主线线条
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = Math.max(3.0, w * 0.034)
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  heartPath(ctx, 0, 0, w, h)
  ctx.stroke()

  // 3. 上沿高光切面（上移 0.8px）
  ctx.strokeStyle = '#fff8e7'
  ctx.lineWidth = Math.max(1.2, w * 0.015)
  ctx.save()
  ctx.translate(0, -0.8)
  heartPath(ctx, 0, 0, w, h)
  ctx.stroke()
  ctx.restore()

  ctx.restore()
}

// 单字金属凹刻：矢量清晰刻痕，零阴影噪点
function engraveChar(
  ctx: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  size: number,
  color: string,
  angle = 0
) {
  ctx.save()
  ctx.translate(x, y)
  if (angle !== 0) ctx.rotate(angle)
  ctx.font = `800 ${size}px "STKaiti", "KaiTi", "SimSun", serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // 1. 深色凹槽底层（下移 1.2px）
  ctx.fillStyle = '#3a1408'
  ctx.fillText(ch, 0, 1.2)

  // 2. 主填充文字
  ctx.fillStyle = color
  ctx.fillText(ch, 0, 0)

  // 3. 顶部细亮高光（上移 0.8px）
  ctx.globalAlpha = 0.4
  ctx.fillStyle = '#fff8e8'
  ctx.fillText(ch, 0, -0.8)

  ctx.restore()
}

// 姓名专属铭刻（温润柔粉填色 + 金边勾线 + 矢量凹槽，零阴影杂质）
function engraveNameChar(
  ctx: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  size: number,
  fillColor: string,
  isAccepted: boolean,
  angle = 0
) {
  ctx.save()
  ctx.translate(x, y)
  if (angle !== 0) ctx.rotate(angle)
  ctx.font = `bold ${size}px "STKaiti", "KaiTi", "SimSun", "Noto Serif SC", serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  if (isAccepted) {
    // 1. 凹槽深色底层（矢量下移 1.2px）
    ctx.fillStyle = '#3a1408'
    ctx.fillText(ch, 0, 1.2)

    // 2. 外缘细金边描边（金石镶嵌效果）
    ctx.strokeStyle = COLOR_PINK_BORDER
    ctx.lineWidth = Math.max(2.2, size * 0.08)
    ctx.lineJoin = 'round'
    ctx.strokeText(ch, 0, 0)

    // 3. 内部柔粉填色
    ctx.fillStyle = fillColor
    ctx.fillText(ch, 0, 0)

    // 4. 顶部柔和微光高光
    ctx.globalAlpha = 0.4
    ctx.fillStyle = '#fff6e5'
    ctx.fillText(ch, 0, -0.8)
  } else {
    // 未接受/未确认状态：矢量金属刻印
    ctx.fillStyle = '#3a1408'
    ctx.fillText(ch, 0, 1.2)

    ctx.fillStyle = fillColor
    ctx.fillText(ch, 0, 0)

    ctx.globalAlpha = 0.4
    ctx.fillStyle = '#fff8e8'
    ctx.fillText(ch, 0, -0.8)
  }

  ctx.restore()
}

// 沿爱心左/右侧内壁弧度从下向上流动排列姓名（贴合爱心侧面内弧走向向上延伸）
function drawCurvedHeartName(
  ctx: CanvasRenderingContext2D,
  name: string,
  centerX: number,
  centerY: number,
  w: number,
  h: number,
  heartRotation: number,
  side: 'left' | 'right',
  size: number,
  fillColor: string,
  isAccepted: boolean
) {
  const chars = Array.from(name)
  const n = chars.length
  if (n === 0) return

  const sign = side === 'left' ? -1 : 1

  for (let i = 0; i < n; i++) {
    const ratio = n === 1 ? 0.5 : i / (n - 1)
    // 采样点分布：从下往上沿着爱心侧内弧延伸（i=0 在中下方，后续字向上方延伸）
    const t = n <= 2 ? 0.28 + ratio * 0.44 : 0.14 + ratio * 0.72

    // 控制点：P0 (底部内侧) -> P1 (侧壁最凸处) -> P2 (顶部内瓣)
    const p0x = sign * 0.16 * w
    const p0y = 0.26 * h
    const p1x = sign * 0.36 * w
    const p1y = -0.04 * h
    const p2x = sign * 0.16 * w
    const p2y = -0.28 * h

    const u = 1 - t
    const lx = u * u * p0x + 2 * u * t * p1x + t * t * p2x
    const ly = u * u * p0y + 2 * u * t * p1y + t * t * p2y

    // 计算切线方向，导出字态倾斜角（顺着弧线向上延伸）
    const dlx = 2 * (u * (p1x - p0x) + t * (p2x - p1x))
    const dly = 2 * (u * (p1y - p0y) + t * (p2y - p1y))
    const localAngle = Math.atan2(dly, dlx)

    // 换算至 Canvas 全局坐标
    const cosR = Math.cos(heartRotation)
    const sinR = Math.sin(heartRotation)
    const gx = centerX + (lx * cosR - ly * sinR)
    const gy = centerY + (lx * sinR + ly * cosR)

    // 汉字随爱心左/右侧弧度轻微倾斜，保持端正与弧线顺应感
    const tiltAngle = (localAngle + Math.PI / 2) * 0.28 + heartRotation

    engraveNameChar(ctx, chars[i], gx, gy, size, fillColor, isAccepted, tiltAngle)
  }
}

// 顺应锁身心瓣边缘弧度的文字排版（离爱心更远，贴合外心瓣侧缘）
function drawCurvedSideText(
  ctx: CanvasRenderingContext2D,
  text: string,
  side: 'left' | 'right',
  W: number,
  H: number,
  size: number,
  color: string
) {
  const chars = Array.from(text)
  const n = chars.length
  if (n === 0) return

  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1)
    // 外移弧度，让文字更靠近左右锁瓣外侧，远离中央双心
    const baseArcX = 0.165 - 0.055 * Math.sin(t * Math.PI) + 0.035 * t
    const xRatio = side === 'left' ? baseArcX : 1 - baseArcX
    const yRatio = 0.32 + 0.44 * t
    const angle = side === 'left' ? (-0.18 + 0.36 * t) : (0.18 - 0.36 * t)

    engraveChar(ctx, chars[i], W * xRatio, H * yRatio, size, color, angle)
  }
}

// 竖向文字（带字距，用于背面排版）
function drawVerticalText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  startY: number,
  size: number,
  color: string,
  spacing = size * 0.15
) {
  const chars = Array.from(text)
  chars.forEach((ch, i) => {
    engraveChar(ctx, ch, x, startY + i * (size + spacing), size, color)
  })
}

// 横向文字（带字距，用于顶部标题）
function drawHorizontalText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  color: string,
  spacing = 0
) {
  const chars = Array.from(text)
  const totalW = chars.length * size + (chars.length - 1) * spacing
  let cx = x - totalW / 2 + size / 2
  chars.forEach((ch) => {
    engraveChar(ctx, ch, cx, y, size, color)
    cx += size + spacing
  })
}

// 正面整幅排版：精准复刻参考图（顶部居中「同心锁」+ 左右随弧远离中央镌刻铭文 + 中央交叉双心上移 + 姓名沿爱心内壁弧度流动）
function drawFrontContent(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const leftText = inscriptions.left || '心心相印'
  const rightText = inscriptions.right || '永结同心'

  // 1. 顶部居中标题「同心锁」（横向，字态端庄大气）
  drawHorizontalText(ctx, '同心锁', W * 0.5, H * 0.185, H * 0.088, COLOR_GOLD, H * 0.016)

  // 2. 左右两侧随心瓣弧度镌刻文字（保持传统金石凹刻，离中央爱心更远）
  const sideSize = H * 0.062
  drawCurvedSideText(ctx, leftText, 'left', W, H, sideSize, leftColor.value)
  drawCurvedSideText(ctx, rightText, 'right', W, H, sideSize, rightColor.value)

  // 3. 中央交叉双心雕刻图案（适当上移至 H * 0.54，饱满圆润相扣）
  const heartW = W * 0.36
  const heartH = heartW * 0.9
  const cy = H * 0.54
  const offset = W * 0.082
  const cxL = W * 0.5 - offset
  const cxR = W * 0.5 + offset
  const rotAngle = 0.14 // 约 8 度自然倾斜

  // 绘制左心（向左倾斜）
  drawEngravedHeart(ctx, cxL, cy, heartW, heartH, -rotAngle, leftColor.value)
  // 绘制右心（向右倾斜，与左心交织相扣）
  drawEngravedHeart(ctx, cxR, cy, heartW, heartH, rotAngle, rightColor.value)

  // 4. 若双方已录入姓名，在两心正中沿爱心内部壁面弧度排列姓名
  if (lockState.ownerName) {
    const isAccepted = lockState.ownerDecision === 'confirmed' || lockState.lockStatus === 'locked'
    const nameSize = H * 0.054
    drawCurvedHeartName(ctx, lockState.ownerName, cxL, cy, heartW, heartH, -rotAngle, 'left', nameSize, leftColor.value, isAccepted)
  }

  if (lockState.matchedName) {
    const isAccepted = lockState.matchedDecision === 'confirmed' || lockState.lockStatus === 'locked'
    const nameSize = H * 0.054
    drawCurvedHeartName(ctx, lockState.matchedName, cxR, cy, heartW, heartH, rotAngle, 'right', nameSize, rightColor.value, isAccepted)
  }
}

// 背面整幅排版：左右两列竖排可替换文字（誓词等分两列），文字正向可读
function drawBackContent(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const chars = Array.from((inscriptions.back || '永结同心').trim())
  const half = Math.ceil(chars.length / 2)
  const leftChars = chars.slice(0, half).join('')
  const rightChars = chars.slice(half).join('')
  const size = H * 0.075
  // 背面网格已绕 Y 轴翻转 180°，画布右半显示在观者左侧，故首段文字绘制在 x=0.78
  if (leftChars) drawVerticalText(ctx, leftChars, W * 0.78, H * 0.2, size, COLOR_GOLD)
  if (rightChars) drawVerticalText(ctx, rightChars, W * 0.22, H * 0.2, size, COLOR_GOLD)
}

function renderTextTextures() {
  const fc = textCanvases.front
  if (fc) {
    const ctx = fc.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, fc.width, fc.height)
      drawFrontContent(ctx, fc.width, fc.height)
    }
  }
  const bc = textCanvases.back
  if (bc) {
    const ctx = bc.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, bc.width, bc.height)
      drawBackContent(ctx, bc.width, bc.height)
    }
  }
  const fm = textMeshes.front?.material as THREE.MeshBasicMaterial | undefined
  const bm = textMeshes.back?.material as THREE.MeshBasicMaterial | undefined
  if (fm?.map) fm.map.needsUpdate = true
  if (bm?.map) bm.map.needsUpdate = true
}

// 逐笔镌刻动画：先在离屏画布绘制完整文字，再以「刻刀扫描」方式逐行显现，
// 模拟现实里在金属锁面上刻字的过程；动画完成后文字固定显示在锁面。
function engraveCanvas(canvas: HTMLCanvasElement, tex: THREE.CanvasTexture) {
  return new Promise<void>((resolve) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return resolve()
    const W = canvas.width
    const H = canvas.height
    const off = document.createElement('canvas')
    off.width = W
    off.height = H
    const octx = off.getContext('2d')
    if (!octx) return resolve()
    if (canvas === textCanvases.front) drawFrontContent(octx, W, H)
    else drawBackContent(octx, W, H)

    const dur = 2200
    const start = performance.now()
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / dur)
      const sweep = easeInOutCubic(k) * H
      ctx.clearRect(0, 0, W, H)
      ctx.drawImage(off, 0, 0, W, sweep, 0, 0, W, sweep)
      if (k < 1) {
        // 刻刀高光前缘 + 金色亮点
        const band = ctx.createLinearGradient(0, sweep - 44, 0, sweep)
        band.addColorStop(0, 'rgba(255, 220, 150, 0)')
        band.addColorStop(1, 'rgba(255, 228, 165, 0.5)')
        ctx.fillStyle = band
        ctx.fillRect(0, sweep - 44, W, 44)
        ctx.beginPath()
        ctx.arc(W * 0.5 + Math.sin(now * 0.022) * W * 0.16, sweep, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#ffecbe'
        ctx.shadowColor = 'rgba(255, 206, 120, 0.95)'
        ctx.shadowBlur = 16
        ctx.fill()
        ctx.shadowBlur = 0
      }
      tex.needsUpdate = true
      if (k < 1) requestAnimationFrame(step)
      else resolve()
    }
    requestAnimationFrame(step)
  })
}

// 确认刻印：先正面逐笔显现，再背面逐笔显现
async function engraveAll() {
  if (textCanvases.front && textMeshes.front) {
    const tex = (textMeshes.front.material as THREE.MeshBasicMaterial).map as THREE.CanvasTexture
    await engraveCanvas(textCanvases.front, tex)
  }
  if (textCanvases.back && textMeshes.back) {
    const tex = (textMeshes.back.material as THREE.MeshBasicMaterial).map as THREE.CanvasTexture
    await engraveCanvas(textCanvases.back, tex)
  }
}

// 快捷选择誓言
function applyQuickPhrase(phrase: string) {
  inscriptions.back = phrase
  renderTextTextures()
  ElMessage.success(`已选用誓词「${phrase}」`)
}

// ---- Three.js 场景初始化 ----
function initThree() {
  const canvas = document.createElement('canvas')
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  renderer.setClearColor(0x000000, 0)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.25
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  cardStage.value?.appendChild(canvas)

  scene = new THREE.Scene()

  // 相机设置：适度拉开距离，保证锁体完整居中且比例适中
  camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100)
  camera.position.set(0, 0, 2.45)
  camera.lookAt(0, 0, 0)

  // 环境贴图反射
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()

  // 东方温润金石光影：提高环境基线，避免深铜贴图在背光面发黑
  const keyLight = new THREE.DirectionalLight(0xffecd0, 5.2)
  keyLight.position.set(2.8, 3.8, 3.2)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xffb8cb, 1.8)
  fillLight.position.set(-3.2, 1.2, 2.2)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffd36b, 2.2)
  rimLight.position.set(0, 4.0, -2.5)
  scene.add(rimLight)

  const bottomLight = new THREE.PointLight(0xffb36b, 1.8, 5)
  bottomLight.position.set(0, -1.8, 1.4)
  scene.add(bottomLight)

  scene.add(new THREE.HemisphereLight(0xfff6ea, 0x8f4f45, 1.7))

  // 轨道控制器（仅在全屏编辑模式下启用）
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = true
  controls.minDistance = 1.3
  controls.maxDistance = 3.6
  controls.enablePan = false
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.autoRotate = false
  controls.autoRotateSpeed = 1.8
  controls.target.set(0, 0, 0)
  controls.minPolarAngle = Math.PI * 0.15
  controls.maxPolarAngle = Math.PI * 0.85
  controls.enabled = false

  resizeObserver = new ResizeObserver(resize)
  if (cardStage.value) resizeObserver.observe(cardStage.value)
  if (editStage.value) resizeObserver.observe(editStage.value)
  resize()

  const animate = () => {
    rafId = requestAnimationFrame(animate)
    const delta = clock.getDelta()
    if (mixer && !isClosing && !isOpening) mixer.update(delta)

    // 卡片展示态的微妙浮动与呼吸微摆（非飞行动画与非全屏拖拽时）
    if (!editing.value && !isAnimatingFly && lockGroup) {
      const t = performance.now() * 0.0015
      // 微微上下起伏与轻柔左右微晃
      lockGroup.position.y = Math.sin(t) * 0.02
      lockGroup.rotation.y = Math.sin(t * 0.7) * 0.08
      lockGroup.rotation.x = Math.cos(t * 0.5) * 0.025
    }

    controls?.update()
    if (renderer && scene && camera) renderer.render(scene, camera)
  }
  animate()
}

function resize() {
  const host = editing.value ? editStage.value : cardStage.value
  if (!host || !renderer || !camera) return
  const rect = host.getBoundingClientRect()
  const w = Math.max(1, Math.round(rect.width || window.innerWidth))
  const h = Math.max(1, Math.round(rect.height || window.innerHeight))

  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(w, h, false)
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
}

// ---- 加载 3D 同心锁模型 ----
function loadModel() {
  const loader = new GLTFLoader()
  loader.manager.onProgress = (_url, loadedCount, total) => {
    progress.value = Math.round((loadedCount / total) * 100)
  }
  loader.load(
    '/assets/concentric_lock_copper_gold.glb',
    (gltf) => {
      setupModel(gltf)
      loaded.value = true
    },
    undefined,
    (err) => {
      console.error('同心锁模型加载失败', err)
      ElMessage.error('同心锁模型加载失败，请刷新页面重试')
    }
  )
}

function setupModel(gltf: { scene: THREE.Group; animations: THREE.AnimationClip[] }) {
  const model = gltf.scene
  lockGroup = new THREE.Group()
  lockGroup.add(model)
  scene?.add(lockGroup)

  let body: THREE.Object3D | null = null
  let shackle: THREE.Object3D | null = null
  model.traverse((o) => {
    if (o.name === 'LockBody') body = o
    if (o.name === 'Shackle') shackle = o
    const mesh = o as THREE.Mesh
    if (mesh.isMesh) {
      mesh.castShadow = true
      mesh.receiveShadow = true
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials.forEach((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return

        // 锁梁：保持银白金属本色，只做质感微调，绝不染金
        if (o.name === 'Shackle') {
          material.metalness = Math.max(material.metalness, 0.92)
          material.roughness = Math.min(material.roughness, 0.16)
          material.envMapIntensity = 1.25
          material.emissive.setRGB(0, 0, 0)
          material.emissiveIntensity = 0
          material.needsUpdate = true
          return
        }

        // 锁体：暖铜金渐变处理（保留贴图细节）
        const originalColor = material.color.clone()
        const luminance = THREE.MathUtils.clamp(
          originalColor.r * 0.2126 + originalColor.g * 0.7152 + originalColor.b * 0.0722,
          0,
          1
        )
        const warmCopper = new THREE.Color('#6e321d')
        const brightGold = new THREE.Color('#f4c765')
        material.color.copy(warmCopper).lerp(brightGold, 0.26 + luminance * 0.64)
        material.emissive.copy(warmCopper).lerp(brightGold, 0.18 + luminance * 0.28)
        material.emissiveIntensity = material.map ? 0.16 : 0.09
        material.roughness = Math.min(material.roughness, 0.34)
        material.metalness = Math.max(material.metalness, 0.82)
        material.envMapIntensity = material.map ? 1.75 : 1.45
        material.needsUpdate = true
      })
    }
  })
  if (!body) body = model

  // 1. 精确几何中心对齐
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  model.position.sub(center)

  // 2. 朝向矫正：厚度轴对齐世界 +Z 轴，锁梁朝正上方 (+Y)
  let tAxis = new THREE.Vector3()
  if (size.x <= size.y && size.x <= size.z) tAxis.set(1, 0, 0)
  else if (size.y <= size.x && size.y <= size.z) tAxis.set(0, 1, 0)
  else tAxis.set(0, 0, 1)

  if (tAxis.z === 0) {
    model.quaternion.premultiply(new THREE.Quaternion().setFromUnitVectors(tAxis, new THREE.Vector3(0, 0, 1)))
  }

  if (shackle) {
    const shCenter = new THREE.Box3().setFromObject(shackle).getCenter(new THREE.Vector3())
    if (shCenter.y < 0) model.rotateZ(Math.PI)
  }

  // 3. 初始展示姿态 = 动画末帧：锁梁保持「抬升 + 旋转 30°」的开锁状态。
  //    缩放基准取动画全程最大尺寸，保证关锁/开锁动画中锁梁不溢出视口。
  if (gltf.animations.length) {
    mixer = new THREE.AnimationMixer(model)
    const clip = gltf.animations[0]
    closeAction = mixer.clipAction(clip)
    closeAction.play()
    closeAction.paused = true
    closeAction.setLoop(THREE.LoopOnce, 1)
    closeAction.clampWhenFinished = true

    const SAMPLES = 48
    let maxH = 0
    let maxW = 0
    for (let i = 0; i <= SAMPLES; i++) {
      closeAction.time = (clip.duration * i) / SAMPLES
      mixer.update(0)
      const s = new THREE.Box3().setFromObject(lockGroup).getSize(new THREE.Vector3())
      maxH = Math.max(maxH, s.y)
      maxW = Math.max(maxW, s.x)
    }
    // 回到末帧：锁梁保持抬升并旋转 30°（开锁状态）
    closeAction.time = clip.duration
    mixer.update(0)
    modelHeight = Math.max(maxH, 0.001)
    modelWidth = Math.max(maxW, 0.001)
  } else {
    const endBox = new THREE.Box3().setFromObject(lockGroup)
    const endSize = endBox.getSize(new THREE.Vector3())
    modelHeight = Math.max(endSize.y, 0.001)
    modelWidth = Math.max(endSize.x, 0.001)
  }
  lockGroup.scale.setScalar(1)
  fitLockToViewport()

  // 4. 文字贴面挂载（正面左心、正面右心、背面誓言）
  const bodyBox = new THREE.Box3().setFromObject(body)
  const bSize = bodyBox.getSize(new THREE.Vector3())
  const bCenter = bodyBox.getCenter(new THREE.Vector3())
  const w = bSize.x
  const h = bSize.y
  const d = bSize.z
  // 贴图严格贴合锁面：偏移极小，不漂浮
  const zFront = bCenter.z + d / 2 + d * 0.02
  const zBack = bCenter.z - d / 2 - d * 0.02

  const mkTexture = (aspect: number) => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = Math.max(128, Math.round(512 * aspect))
    const tex = new THREE.CanvasTexture(c)
    tex.anisotropy = 8
    return { c, tex }
  }

  const mkMat = (tex: THREE.CanvasTexture) =>
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false
    })

  // 正面、背面各一张独立整幅纹理（画布宽高比与锁面一致，避免拉伸）
  const f = mkTexture(h / w)
  const bk = mkTexture(h / w)
  textCanvases.front = f.c
  textCanvases.back = bk.c

  const faceW = w * 0.94
  const faceH = h * 0.92

  const frontMesh = new THREE.Mesh(new THREE.PlaneGeometry(faceW, faceH), mkMat(f.tex))
  frontMesh.position.set(bCenter.x, bCenter.y, zFront)

  const backMesh = new THREE.Mesh(new THREE.PlaneGeometry(faceW, faceH), mkMat(bk.tex))
  backMesh.position.set(bCenter.x, bCenter.y, zBack)
  // 背面绕 Y 轴翻转 180°，从背面观察时文字正向可读、不镜像
  backMesh.rotation.y = Math.PI

  lockGroup.add(frontMesh, backMesh)
  textMeshes.front = frontMesh
  textMeshes.back = backMesh

  // 初始渲染文字（打字实时预览用；确认刻印时才播放逐笔镌刻动画）
  renderTextTextures()
}

// ---- 飞行动画：从卡片平滑飞入页面中央全屏放大 ----
function runFlyAnimation(isEnter: boolean) {
  return new Promise<void>((resolve) => {
    isAnimatingFly = true
    const duration = isEnter ? 900 : 700
    const start = performance.now()

    const startPos = camera ? camera.position.clone() : new THREE.Vector3(0, 0, 2.45)
    const targetPos = isEnter ? new THREE.Vector3(0, 0, 1.85) : new THREE.Vector3(0, 0, 2.45)

    const startRotY = lockGroup ? lockGroup.rotation.y : 0
    const targetRotY = isEnter ? Math.PI * 2 : 0

    const step = (now: number) => {
      const k = Math.min(1, (now - start) / duration)
      const t = isEnter ? easeOutBack(k) : easeInOutCubic(k)

      if (camera) {
        camera.position.lerpVectors(startPos, targetPos, easeInOutCubic(k))
        camera.lookAt(0, 0, 0)
      }

      if (lockGroup) {
        lockGroup.rotation.y = THREE.MathUtils.lerp(startRotY, targetRotY, t)
        lockGroup.position.set(0, 0, 0)
      }

      if (k < 1) {
        requestAnimationFrame(step)
      } else {
        if (lockGroup) {
          lockGroup.rotation.set(0, targetRotY % (Math.PI * 2), 0)
        }
        isAnimatingFly = false
        resolve()
      }
    }
    requestAnimationFrame(step)
  })
}

// ---- 进入/退出全屏把玩与刻印模式 ----
async function enterEdit() {
  if (editing.value || !loaded.value) return
  editing.value = true
  await nextTick()

  // 先把画布挂入真正的全屏绝对定位容器，再以容器尺寸重算相机。
  if (editStage.value && renderer) {
    editStage.value.appendChild(renderer.domElement)
  }
  resize()

  await runFlyAnimation(true)
  fitLockToViewport()

  if (controls) {
    controls.enabled = true
    controls.target.set(0, 0, 0)
    controls.update()
  }
}

async function exitEdit() {
  if (!editing.value) return
  if (controls) controls.enabled = false

  // 退出飞行动画
  await runFlyAnimation(false)

  editing.value = false
  await nextTick()

  // 将 WebGL Canvas 放回主卡片舞台
  if (cardStage.value && renderer) {
    cardStage.value.appendChild(renderer.domElement)
  }
  resize()

  if (camera) {
    camera.position.set(0, 0, 2.45)
    camera.lookAt(0, 0, 0)
  }
  fitLockToViewport()

  if (lockGroup) {
    lockGroup.rotation.set(0, 0, 0)
    lockGroup.position.set(0, 0, 0)
  }
}

// 点击卡片 3D 舞台区域触发飞入放大
function onStageClick(e: MouseEvent) {
  if (!loaded.value || editing.value) return
  void enterEdit()
}

// ---- 保存刻印 ----
async function saveEngrave() {
  const left = currentUserName.value
  const right = matchedUserName.value
  if (!left) {
    ElMessage.warning('当前登录用户暂无姓名，暂时无法刻印同心锁')
    return
  }
  if (!right) {
    ElMessage.warning('当前尚未牵线到对方，暂时无法完成刻印')
    return
  }

  saving.value = true
  lockState.ownerName = left
  lockState.matchedName = right
  lockState.ownerDecision = 'confirmed'
  lockState.lockStatus = 'confirming'
  await nextTick()
  // 播放逐笔镌刻动画（正面 → 背面），模拟现场刻字过程
  await engraveAll()
  ElMessage.success('同心锁已完成刻印，静候对方心有灵犀')
  saving.value = false
  await exitEdit()
}

function cancelEdit() {
  void exitEdit()
}

// ---- 模拟对方确认/婉拒流程（演示按钮始终可点，方便直接查看关锁效果） ----
const canSimulateConfirm = computed(
  () =>
    lockState.matchedDecision === 'pending' &&
    lockState.lockStatus !== 'locked' &&
    !isClosing &&
    !isOpening
)
const canSimulateReject = computed(
  () =>
    lockState.matchedDecision === 'pending' &&
    lockState.lockStatus !== 'locked' &&
    !isClosing &&
    !isOpening
)
const canSimulateOpen = computed(
  () => lockState.lockStatus === 'locked' && !isClosing && !isOpening
)

// 播放锁梁动画：from -> to（duration 为末帧旋转 30° 开锁位，0 为锁梁落回锁孔）
function playShackleAnim(from: number, to: number, dur = 2200) {
  return new Promise<void>((resolve) => {
    if (!mixer || !closeAction) return resolve()
    closeAction.paused = false
    closeAction.time = from
    const start = performance.now()
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / dur)
      closeAction!.time = THREE.MathUtils.lerp(from, to, easeInOutCubic(k))
      mixer!.update(0)
      if (k < 1) {
        requestAnimationFrame(step)
      } else {
        closeAction!.time = to
        closeAction!.paused = true
        resolve()
      }
    }
    requestAnimationFrame(step)
  })
}

async function simulatePartner(decision: 'confirmed' | 'rejected') {
  if (lockState.matchedDecision !== 'pending') return
  if (isClosing || isOpening) return
  // 若尚未刻印，自动补足己方确认状态，保证流程可演示
  if (lockState.ownerDecision !== 'confirmed') {
    lockState.ownerDecision = 'confirmed'
    lockState.lockStatus = 'confirming'
  }
  lockState.matchedDecision = decision
  renderTextTextures()

  if (decision === 'rejected') {
    lockState.lockStatus = 'open'
    ElMessage.info('对方婉拒，同心锁保持开启，愿各自安好')
    return
  }

  // 双方确认 -> 播放关锁动画：锁梁从旋转 30° 开锁位落回锁孔
  lockState.lockStatus = 'locked'
  ElMessage.success('双方确认 · 同心锁闭合，永结同心！')
  isClosing = true
  await playShackleAnim(closeAction?.getClip().duration || 0, 0)
  isClosing = false
}

// 模拟打开：锁梁从锁孔抬起，重新回到旋转 30° 的开锁状态
async function simulateOpen() {
  if (!canSimulateOpen.value) return
  lockState.matchedDecision = 'pending'
  lockState.lockStatus = lockState.ownerDecision === 'confirmed' ? 'confirming' : 'open'
  renderTextTextures()
  ElMessage.info('同心锁已重新打开')
  isOpening = true
  await playShackleAnim(0, closeAction?.getClip().duration || 0)
  isOpening = false
}

  // 监听背面誓词输入，即时同步 3D
watch(
  () => inscriptions.back,
  () => {
    if (loaded.value) renderTextTextures()
  }
)

// ---- 生命周期 ----
onMounted(() => {
  initThree()
  loadModel()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
  controls?.dispose()
  mixer?.stopAllAction()
  renderer?.dispose()
  renderer?.domElement.remove()
  renderer = null
})
</script>

<template>
  <div class="lock3d-card-wrapper">
    <!-- 主卡片 -->
    <div class="lock3d-card" :class="{ 'is-hovered': isHovered }">
      <!-- 场景背景图层（豆包场景图 + 氛围红晕） -->
      <div class="scene-bg-layer">
        <img src="/assets/doubao-scene-bg.png" alt="东方缘境同心场景" class="scene-bg-img" />
        <div class="scene-bg-mask"></div>
        <div class="scene-ambient-glow"></div>
      </div>

      <!-- 顶部标题栏 -->
      <div class="lock-card-header">
        <div class="header-left">
          <span class="knot-icon">🏮</span>
          <span class="title">东方同心锁 · 两心相印见证</span>
        </div>
        <div class="lock-seal-tag">
          <span class="seal-icon">✦</span>
          <span>金石为开 · 永结连理</span>
        </div>
      </div>

      <!-- 3D 舞台主区域 -->
      <div
        ref="cardStage"
        class="lock3d-stage"
        @click="onStageClick"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <!-- 加载进度 -->
        <div v-if="!loaded" class="lock3d-loading">
          <div class="loading-spin">🏮</div>
          <div class="loading-bar"><i :style="{ width: progress + '%' }"></i></div>
          <span class="loading-text">同心锁苏醒中 · {{ progress }}%</span>
        </div>

        <Transition name="fade-up">
          <div v-if="loaded" class="lock3d-hud">
            <!-- 状态徽章 -->
            <div class="lock3d-badge" :class="statusClass">
              <span class="badge-dot"></span>{{ statusLabel }}
            </div>

            <!-- 左侧浮空铭牌：左心名讳 -->
            <div class="lock-wing-badge wing-left" :style="{ borderColor: leftColor }">
              <div class="wing-tag">左心 · 己方</div>
              <div class="wing-name" :style="{ color: leftColor, fontSize: nameFontSize(displayLeft) }">{{ displayLeft }}</div>
              <div class="wing-sub">{{ currentUserName ? '心之所向' : '等待登录' }}</div>
            </div>

            <!-- 右侧浮空铭牌：右心名讳 -->
            <div class="lock-wing-badge wing-right" :style="{ borderColor: rightColor }">
              <div class="wing-tag">右心 · 对方</div>
              <div class="wing-name" :style="{ color: rightColor, fontSize: nameFontSize(displayRight) }">{{ displayRight }}</div>
              <div class="wing-sub">{{ matchedUserName ? '情之所钟' : '待红娘牵线' }}</div>
            </div>

            <!-- 底部交互提示与放大把玩按钮 -->
            <div class="lock3d-bottom-prompt">
              <button class="btn-play-zoom" @click.stop="enterEdit">
                <span class="btn-icon">🔍</span>
                <span>轻触同心锁 · 飞入中央放大把玩</span>
                <span class="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- 卡片下方：直观双心实时输入与铭刻区（无需进入全屏也可直接打字实时更新） -->
      <div class="lock-quick-engrave">
        <div class="engrave-title-row">
          <span class="engrave-icon">✍️</span>
          <span class="engrave-title">锁面铭文与誓言实时雕刻</span>
          <span class="engrave-badge">打字即时同步 3D 锁面</span>
        </div>

        <div class="engrave-inputs-grid">
          <div class="engrave-field">
            <label class="field-label">
              <span class="dot left-dot"></span>左侧 · 铭文祝福
            </label>
            <el-input
              v-model="inscriptions.left"
              maxlength="6"
              placeholder="如：心心相印"
              clearable
              @input="renderTextTextures"
            />
          </div>

          <div class="engrave-field">
            <label class="field-label">
              <span class="dot right-dot"></span>右侧 · 铭文祝福
            </label>
            <el-input
              v-model="inscriptions.right"
              maxlength="6"
              placeholder="如：永结同心"
              clearable
              @input="renderTextTextures"
            />
          </div>

          <div class="engrave-field full-width">
            <label class="field-label">
              <span class="dot gold-dot"></span>背面 · 金石誓词
            </label>
            <el-input
              v-model="inscriptions.back"
              maxlength="8"
              placeholder="如：白首成约、天赐良缘"
              clearable
              @input="renderTextTextures"
            />
          </div>
        </div>

        <!-- 快捷誓词标签 -->
        <div class="quick-phrase-row">
          <span class="phrase-label">经典誓言：</span>
          <div class="phrase-tags">
            <button
              v-for="phrase in quickPhrases"
              :key="phrase"
              class="phrase-btn"
              :class="{ 'is-active': inscriptions.back === phrase }"
              @click="applyQuickPhrase(phrase)"
            >
              {{ phrase }}
            </button>
          </div>
        </div>

        <!-- 底部快捷结锁与放大按钮 -->
        <div class="card-bottom-actions">
          <button class="btn-card-zoom" @click="enterEdit">
            <span>全屏 360° 把玩与鉴赏</span>
          </button>
          <button class="btn-card-lock" :class="{ 'is-busy': saving }" @click="saveEngrave">
            <span>{{ saving ? '正在镌刻…' : '即刻结锁 · 铭刻良缘' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 全屏沉浸式放大把玩与编辑层 -->
  <Teleport to="body">
    <Transition name="overlay-fade">
      <div v-if="editing" class="lock3d-overlay">
        <!-- 3D 渲染画布挂载区（锁体位于页面正中央放大展示） -->
        <div ref="editStage" class="lock3d-edit-stage"></div>

        <!-- 顶部控制栏 -->
        <div class="edit-topbar">
          <div class="edit-title">
            <span class="title-knot">🏮</span>
            <span>东方同心锁 · 360° 沉浸式把玩与镌刻</span>
          </div>
          <div class="edit-status" :style="{ color: statusColor }">
            <span class="badge-dot"></span>{{ statusLabel }}
          </div>
          <button class="edit-close" title="退出全屏" @click="cancelEdit">✕</button>
        </div>

        <!-- 中央操作提示 -->
        <div class="edit-hint-row">
          <span class="hint-sparkle">✦</span>
          <span>按住鼠标左键自由旋转锁体 · 滚轮缩放 · 翻转查看背面誓词</span>
          <span class="hint-sparkle">✦</span>
        </div>

        <!-- 左右双心名讳铭牌 -->
        <div class="edit-wing-badge wing-left" :style="{ borderColor: leftColor }">
          <div class="wing-tag">左心 · 己方</div>
          <div class="wing-name" :style="{ color: leftColor, fontSize: nameFontSize(displayLeft) }">{{ displayLeft }}</div>
          <div class="wing-sub">{{ currentUserName ? '心之所向' : '等待登录' }}</div>
        </div>
        <div class="edit-wing-badge wing-right" :style="{ borderColor: rightColor }">
          <div class="wing-tag">右心 · 对方</div>
          <div class="wing-name" :style="{ color: rightColor, fontSize: nameFontSize(displayRight) }">{{ displayRight }}</div>
          <div class="wing-sub">{{ matchedUserName ? '情之所钟' : '待红娘牵线' }}</div>
        </div>

        <!-- 底部浮空雕刻与确认控制台 -->
        <div class="edit-panel">
          <div class="edit-fields">
            <div class="field">
              <label>左侧 · 铭文祝福</label>
              <el-input
                v-model="inscriptions.left"
                maxlength="6"
                placeholder="如：心心相印"
                clearable
                @input="renderTextTextures"
              />
            </div>

            <div class="field">
              <label>右侧 · 铭文祝福</label>
              <el-input
                v-model="inscriptions.right"
                maxlength="6"
                placeholder="如：永结同心"
                clearable
                @input="renderTextTextures"
              />
            </div>

            <div class="field">
              <label>背面 · 誓言铭文</label>
              <el-input
                v-model="inscriptions.back"
                maxlength="8"
                placeholder="如：白首成约"
                clearable
                @input="renderTextTextures"
              />
            </div>
          </div>

          <div class="edit-actions">
            <button class="btn-cancel" @click="cancelEdit">返回首页</button>
            <button class="btn-engrave" :class="{ 'is-busy': saving }" @click="saveEngrave">
              {{ saving ? '正在镌刻…' : '刻印上锁 · 永结同心' }}
            </button>
          </div>

          <!-- 模拟确认演示区 -->
          <div class="demo-zone">
            <span class="demo-label">流程演示（正式由后端状态驱动）：</span>
            <div class="demo-actions">
              <button
                class="demo-btn confirm"
                :disabled="!canSimulateConfirm"
                @click="simulatePartner('confirmed')"
              >
                模拟对方确认（触发关锁）
              </button>
              <button
                class="demo-btn reject"
                :disabled="!canSimulateReject"
                @click="simulatePartner('rejected')"
              >
                模拟对方婉拒
              </button>
              <button
                class="demo-btn open"
                :disabled="!canSimulateOpen"
                @click="simulateOpen"
              >
                模拟打开（重新开锁）
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ============ 主卡片容器 ============ */
.lock3d-card-wrapper {
  position: relative;
  width: 100%;
}

.lock3d-card {
  background: rgba(255, 248, 245, 0.28);
  border-radius: 24px;
  box-shadow:
    0 24px 60px rgba(168, 54, 75, 0.14),
    0 6px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(201, 75, 98, 0.22);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.lock3d-card.is-hovered {
  box-shadow:
    0 30px 70px rgba(168, 54, 75, 0.2),
    0 8px 24px rgba(0, 0, 0, 0.06);
}

/* ============ 场景背景图层 ============ */
.scene-bg-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.scene-bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 35%;
  opacity: 0.88;
  filter: saturate(1.1) brightness(0.98);
  transition: transform 0.6s ease;
}

.lock3d-card:hover .scene-bg-img {
  transform: scale(1.03);
}

.scene-bg-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(255, 248, 245, 0.18) 0%,
    rgba(255, 245, 242, 0.08) 48%,
    rgba(255, 245, 242, 0.3) 100%
  );
  backdrop-filter: none;
}

.scene-ambient-glow {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  height: 220px;
  background: radial-gradient(circle, rgba(217, 164, 65, 0.35) 0%, rgba(201, 75, 98, 0.2) 50%, transparent 80%);
  filter: blur(28px);
  pointer-events: none;
  animation: glow-pulse 4s ease-in-out infinite alternate;
}

@keyframes glow-pulse {
  0% { opacity: 0.6; transform: translateX(-50%) scale(0.95); }
  100% { opacity: 1; transform: translateX(-50%) scale(1.08); }
}

/* ============ 顶部标题栏 ============ */
.lock-card-header {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(201, 75, 98, 0.12);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left .knot-icon {
  font-size: 18px;
  filter: drop-shadow(0 2px 4px rgba(201, 75, 98, 0.3));
}

.header-left .title {
  font-size: 15px;
  font-weight: 800;
  font-family: var(--font-display), 'STKaiti', serif;
  color: #27222b;
  letter-spacing: 0.5px;
}

.lock-seal-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #a87328;
  background: rgba(217, 164, 65, 0.16);
  border: 1px solid rgba(217, 164, 65, 0.38);
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.seal-icon {
  font-size: 10px;
  color: #d9a441;
}

/* ============ 3D 展示舞台 ============ */
.lock3d-stage {
  position: relative;
  z-index: 2;
  height: 300px;
  margin: 10px 16px 0;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  /* 背景保持透明，透出下方豆包场景图 */
  background: transparent;
  border: 1px solid rgba(217, 164, 65, 0.2);
  box-shadow: inset 0 0 30px rgba(201, 75, 98, 0.05);
}

.lock3d-stage canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100% !important;
  height: 100% !important;
  display: block;
}

/* 加载动画 */
.lock3d-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 5;
  background: rgba(255, 250, 248, 0.88);
  backdrop-filter: blur(6px);
}

.loading-spin {
  font-size: 28px;
  animation: spin-pulse 2s infinite ease-in-out;
}

@keyframes spin-pulse {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(15deg); }
}

.loading-bar {
  width: 180px;
  height: 6px;
  background: rgba(194, 147, 83, 0.2);
  border-radius: 999px;
  overflow: hidden;
}

.loading-bar i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #c29353, #c94b62);
  transition: width 0.3s ease;
}

.loading-text {
  font-size: 12px;
  color: #8c2638;
  font-weight: 700;
  letter-spacing: 1px;
}

/* 3D HUD 浮层 */
.lock3d-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 3;
}

/* 状态徽章 */
.lock3d-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 999px;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  animation: pulse-dot 1.6s infinite;
}

.lock3d-badge.is-open {
  color: #9b6b12;
  border: 1px solid rgba(217, 164, 65, 0.5);
}
.lock3d-badge.is-open .badge-dot {
  background: #d9a441;
  box-shadow: 0 0 8px #d9a441;
}

.lock3d-badge.is-confirmed,
.lock3d-badge.is-paired,
.lock3d-badge.is-locked {
  color: #9d5267;
  border: 1px solid rgba(201, 130, 145, 0.55);
}
.lock3d-badge.is-confirmed .badge-dot,
.lock3d-badge.is-paired .badge-dot,
.lock3d-badge.is-locked .badge-dot {
  background: #c98291;
  box-shadow: 0 0 8px #c98291;
}

.lock3d-badge.is-rejected {
  color: #686477;
  border: 1px solid rgba(141, 137, 152, 0.55);
}
.lock3d-badge.is-rejected .badge-dot {
  background: #8d8998;
  box-shadow: 0 0 8px #8d8998;
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.5; }
}

/* 左右两翼浮空名讳铭牌 */
.lock-wing-badge {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.88);
  border: 1.5px solid;
  border-radius: 12px;
  padding: 8px 12px;
  text-align: center;
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  min-width: 76px;
  transition: all 0.3s ease;
  pointer-events: auto;
}

.wing-left {
  left: 12px;
  border-left-width: 4px;
}

.wing-right {
  right: 12px;
  border-right-width: 4px;
}

.wing-tag {
  font-size: 10px;
  color: #8c766e;
  font-weight: 700;
  margin-bottom: 2px;
}

.wing-name {
  font-size: 14px;
  font-weight: 900;
  font-family: var(--font-display), 'STKaiti', serif;
  letter-spacing: 1px;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wing-sub {
  font-size: 9px;
  color: #b59f97;
  margin-top: 2px;
}

/* 底部交互飞入把玩按钮 */
.lock3d-bottom-prompt {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: auto;
}

.btn-play-zoom {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #8c2638;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(201, 75, 98, 0.35);
  padding: 6px 16px;
  border-radius: 999px;
  box-shadow: 0 4px 14px rgba(201, 75, 98, 0.15);
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.btn-play-zoom:hover {
  background: #c94b62;
  color: #ffffff;
  border-color: #c94b62;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(201, 75, 98, 0.35);
}

.btn-play-zoom .btn-icon {
  font-size: 12px;
}

.btn-play-zoom .btn-arrow {
  font-size: 12px;
  transition: transform 0.25s ease;
}

.btn-play-zoom:hover .btn-arrow {
  transform: translateX(3px);
}

/* ============ 卡片下方：直观双心雕刻区 ============ */
.lock-quick-engrave {
  position: relative;
  z-index: 2;
  padding: 16px 20px 20px;
  background: rgba(255, 255, 255, 0.72);
  border-top: 1px solid rgba(201, 75, 98, 0.1);
  backdrop-filter: blur(8px);
}

.engrave-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.engrave-icon {
  font-size: 14px;
}

.engrave-title {
  font-size: 13px;
  font-weight: 800;
  color: #27222b;
  font-family: var(--font-display), 'STKaiti', serif;
}

.engrave-badge {
  margin-left: auto;
  font-size: 10px;
  color: #c29353;
  background: rgba(194, 147, 83, 0.12);
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
}

.engrave-inputs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.engrave-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.engrave-field.full-width {
  grid-column: 1 / -1;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: #5a4b4f;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.left-dot { background: #d9a441; }
.right-dot { background: #c98291; }
.gold-dot { background: #c29353; }

.engrave-field :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 0 0 1px rgba(201, 75, 98, 0.2) inset;
  border-radius: 8px;
  transition: all 0.2s;
}

.engrave-field :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1.5px #c94b62 inset !important;
}

.engrave-field :deep(.el-input__inner) {
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-display), 'STKaiti', serif;
  color: #27222b;
}

/* 快捷誓词 */
.quick-phrase-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.phrase-label {
  font-size: 11px;
  color: #8c766e;
  font-weight: 700;
}

.phrase-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.phrase-btn {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid rgba(217, 164, 65, 0.3);
  background: rgba(255, 255, 255, 0.8);
  color: #8c6a5c;
  cursor: pointer;
  transition: all 0.2s;
}

.phrase-btn:hover,
.phrase-btn.is-active {
  background: rgba(201, 75, 98, 0.12);
  border-color: #c94b62;
  color: #c94b62;
  font-weight: 700;
}

/* 底部按钮组 */
.card-bottom-actions {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 10px;
}

.btn-card-zoom,
.btn-card-lock {
  height: 40px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  letter-spacing: 0.5px;
}

.btn-card-zoom {
  background: rgba(255, 255, 255, 0.9);
  color: #8c6a5c;
  border: 1px solid rgba(194, 147, 83, 0.35);
}

.btn-card-zoom:hover {
  background: #fff6ee;
  border-color: #c29353;
  color: #a87328;
}

.btn-card-lock {
  background: linear-gradient(135deg, #c94b62, #a8364b);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(201, 75, 98, 0.35);
}

.btn-card-lock:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(201, 75, 98, 0.45);
}

.btn-card-lock.is-busy {
  opacity: 0.7;
  pointer-events: none;
}

/* ============ 全屏编辑与把玩层 ============ */
.lock3d-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: radial-gradient(
    circle at 50% 45%,
    rgba(64, 26, 38, 0.94) 0%,
    rgba(28, 12, 20, 0.97) 60%,
    rgba(14, 5, 10, 0.99) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock3d-edit-stage {
  position: absolute;
  inset: 0;
}

.lock3d-edit-stage canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.edit-topbar {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(36, 14, 24, 0.7);
  border: 1px solid rgba(217, 164, 65, 0.35);
  backdrop-filter: blur(16px);
  border-radius: 999px;
  padding: 8px 16px 8px 20px;
  z-index: 5;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.edit-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f7ece2;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 1px;
  font-family: var(--font-display), 'STKaiti', serif;
}

.edit-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  padding-left: 14px;
}

.edit-close {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: #f5eae0;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-close:hover {
  background: rgba(201, 75, 98, 0.6);
  border-color: #c94b62;
  transform: rotate(90deg);
}

.edit-hint-row {
  position: absolute;
  top: 86px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(245, 235, 225, 0.75);
  font-size: 12px;
  letter-spacing: 1px;
  z-index: 4;
  background: rgba(0, 0, 0, 0.35);
  padding: 5px 18px;
  border-radius: 999px;
  border: 1px solid rgba(217, 164, 65, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.hint-sparkle {
  color: #d9a441;
  font-size: 10px;
}

/* 全屏模式下的左右双心名讳铭牌 */
.edit-wing-badge {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(34, 13, 23, 0.68);
  border: 1.5px solid;
  border-radius: 14px;
  padding: 10px 16px;
  text-align: center;
  backdrop-filter: blur(14px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  min-width: 96px;
  z-index: 5;
}

.edit-wing-badge.wing-left {
  left: max(20px, 3vw);
  border-left-width: 4px;
}

.edit-wing-badge.wing-right {
  right: max(20px, 3vw);
  border-right-width: 4px;
}

.edit-wing-badge .wing-tag {
  font-size: 10px;
  color: rgba(229, 195, 163, 0.75);
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 3px;
}

.edit-wing-badge .wing-name {
  font-size: 16px;
  font-weight: 900;
  font-family: var(--font-display), 'STKaiti', serif;
  letter-spacing: 1px;
  max-width: 96px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-wing-badge .wing-sub {
  font-size: 10px;
  color: rgba(240, 228, 218, 0.55);
  margin-top: 3px;
}

/* 全屏底部浮空控制面板 */
.edit-panel {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: min(720px, calc(100vw - 32px));
  background: rgba(42, 18, 30, 0.82);
  border: 1px solid rgba(217, 164, 65, 0.35);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 18px 22px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  z-index: 5;
}

.edit-fields {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 11px;
  color: #e5c3a3;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.field :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 1px rgba(217, 164, 65, 0.3) inset;
  border-radius: 8px;
}

.field :deep(.el-input__inner) {
  color: #f7ede4;
  font-family: var(--font-display), 'STKaiti', serif;
  font-weight: 800;
  letter-spacing: 1px;
}

.field :deep(.el-input__inner::placeholder) {
  color: rgba(240, 228, 218, 0.4);
}

.edit-actions {
  display: flex;
  gap: 12px;
  margin-top: 14px;
}

.btn-cancel,
.btn-engrave {
  flex: 1;
  height: 44px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.25s;
  border: none;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.08);
  color: #d8c8bd;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.16);
}

.btn-engrave {
  background: linear-gradient(135deg, #c94b62, #a8364b);
  color: #fff;
  box-shadow: 0 6px 20px rgba(201, 75, 98, 0.45);
}

.btn-engrave:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 28px rgba(201, 75, 98, 0.6);
}

.btn-engrave.is-busy {
  opacity: 0.7;
  pointer-events: none;
}

.demo-zone {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  border-top: 1px dashed rgba(217, 164, 65, 0.25);
  padding-top: 12px;
}

.demo-label {
  font-size: 11px;
  color: rgba(240, 228, 218, 0.6);
}

.demo-actions {
  display: flex;
  gap: 8px;
}

.demo-btn {
  font-size: 11px;
  padding: 5px 14px;
  border-radius: 999px;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(255, 255, 255, 0.08);
  color: #e8dcd2;
  transition: all 0.2s;
}

.demo-btn.confirm:not(:disabled):hover {
  border-color: #c98291;
  color: #f2c9d2;
  background: rgba(201, 130, 145, 0.22);
}

.demo-btn.reject:not(:disabled):hover {
  border-color: #8d8998;
  color: #c6c2d0;
  background: rgba(141, 137, 152, 0.22);
}

.demo-btn.open:not(:disabled):hover {
  border-color: #d9a441;
  color: #f0d9a8;
  background: rgba(217, 164, 65, 0.22);
}

.demo-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* 过渡动画 */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.4s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.fade-up-enter-active {
  transition: all 0.6s ease 0.2s;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

/* 响应式适配 */
@media (max-width: 720px) {
  .lock3d-stage {
    height: 250px;
  }
  .lock-wing-badge {
    padding: 4px 8px;
    min-width: 60px;
  }
  .wing-name {
    font-size: 12px;
    max-width: 50px;
  }
  .engrave-inputs-grid {
    grid-template-columns: 1fr;
  }
  .edit-fields {
    grid-template-columns: 1fr;
  }
  .card-bottom-actions {
    grid-template-columns: 1fr;
  }
  .edit-topbar {
    top: 14px;
    padding: 6px 12px;
    gap: 8px;
  }
  .edit-title {
    font-size: 12px;
  }
  .edit-status {
    display: none;
  }
  .edit-hint-row {
    top: 64px;
    font-size: 11px;
  }
  .edit-wing-badge {
    padding: 6px 10px;
    min-width: 72px;
  }
  .edit-wing-badge.wing-left {
    left: 10px;
  }
  .edit-wing-badge.wing-right {
    right: 10px;
  }
  .edit-wing-badge .wing-name {
    max-width: 72px;
  }
  .edit-panel {
    bottom: 12px;
    padding: 12px;
  }
}
</style>
