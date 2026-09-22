<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStateStore } from '@/stores/appState'
import {
  TrendCharts,
  UserFilled,
  Money,
  Promotion,
  Calendar,
  CircleCheckFilled,
  Top,
  Bottom,
  Trophy,
  OfficeBuilding,
  DataAnalysis,
  Opportunity,
  View,
  CoffeeCup,
  WarningFilled,
  Download,
  Refresh,
  Filter,
  User,
  StarFilled,
  Share,
  Medal
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const appStore = useAppStateStore()

// 周期与门店筛选
const currentPeriod = ref<'week' | 'month' | 'quarter' | 'year'>('month')
const selectedStore = ref<string>('all')

// 核心经营 KPI 指标
const kpiCards = [
  {
    title: '本月签约总流水',
    val: '3,842,000',
    prefix: '¥',
    unit: '元',
    trend: '+24.5%',
    isUp: true,
    target: '¥ 4,500,000',
    progress: 85.3,
    sub: '尊享半年期/年度套餐占 68%'
  },
  {
    title: '全渠道新增线索',
    val: '1,428',
    prefix: '',
    unit: '条',
    trend: '+18.4%',
    isUp: true,
    target: '1,600 条',
    progress: 89.2,
    sub: '线上转介绍与名企联谊占比高'
  },
  {
    title: '茶室到店约见场次',
    val: '386',
    prefix: '',
    unit: '场',
    trend: '+12.6%',
    isUp: true,
    target: '400 场',
    progress: 96.5,
    sub: '私享茶室平均上座率 88.5%'
  },
  {
    title: '成功牵线脱单结缘',
    val: '42',
    prefix: '',
    unit: '对',
    trend: '+8.1%',
    isUp: true,
    target: '50 对',
    progress: 84.0,
    sub: '好评致谢锦旗/礼盒 19 份'
  },
  {
    title: '客户综合满意度 CSAT',
    val: '99.2',
    prefix: '',
    unit: '%',
    trend: '+0.8%',
    isUp: true,
    target: '98.5%',
    progress: 100,
    sub: '五星好评与红娘专业度'
  },
  {
    title: '红娘单兵月均人效',
    val: '128,060',
    prefix: '¥',
    unit: '元/人',
    trend: '+15.2%',
    isUp: true,
    target: '¥ 120,000',
    progress: 100,
    sub: '人均在跟客户 19.4 位'
  }
]

// 1. 营收与签约双轴趋势数据（1-12月）
const trendMonths = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const trendRevenue = [210, 185, 290, 320, 310, 380, 410, 384, 430, 470, 520, 580] // 万元
const trendDeals = [32, 28, 45, 48, 46, 58, 62, 59, 65, 71, 78, 88] // 签约单数
const trendAvgPrice = [6.5, 6.6, 6.4, 6.6, 6.7, 6.5, 6.6, 6.5, 6.6, 6.6, 6.6, 6.6] // 万元均价

const hoveredMonthIdx = ref<number | null>(7) // 默认高亮8月

// 2. 六阶全链路转化漏斗
const funnelData = [
  { stage: '1. 意向线索初入池', count: 1428, rate: '100%', drop: '-', time: '即时', color: '#C94B62' },
  { stage: '2. 客服建档与有效初筛', count: 1120, rate: '78.4%', drop: '21.6%', time: '0.5天', color: '#d55f74' },
  { stage: '3. 邀约到店与红娘深访', count: 520, rate: '36.4%', drop: '53.5%', time: '2.3天', color: '#e07689' },
  { stage: '4. 方案签约与实名认证', count: 218, rate: '15.3%', drop: '58.0%', time: '4.5天', color: '#C29353' },
  { stage: '5. 私享茶室撮合与相亲', count: 186, rate: '13.0%', drop: '14.6%', time: '7.2天', color: '#cca36b' },
  { stage: '6. 确立恋爱与幸福领证', count: 42, rate: '2.94%', drop: '77.4%', time: '48天', color: '#27ae60' }
]

// 3. 直营门店多维经营 PK 榜
const storePkList = [
  {
    rank: 1,
    name: '上海静安旗舰总店',
    city: '上海市静安区南京西路1788号',
    rooms: '6间东方茶室',
    staffCount: 18,
    monthlyRev: 1820000,
    targetRev: 2000000,
    leads: 680,
    deals: 102,
    successPairs: 20,
    csat: 99.6,
    tags: ['金牌示范门店', '茶室复约率最高']
  },
  {
    rank: 2,
    name: '上海新天地高级会所',
    city: '上海市黄浦区马当路245号',
    rooms: '4间私密雅室',
    staffCount: 14,
    monthlyRev: 1240000,
    targetRev: 1500000,
    leads: 420,
    deals: 74,
    successPairs: 14,
    csat: 98.9,
    tags: ['高净值海归专区', '客单价TOP1']
  },
  {
    rank: 3,
    name: '杭州西湖私享体验馆',
    city: '杭州市西湖区南山路108号',
    rooms: '3间临湖茶室',
    staffCount: 10,
    monthlyRev: 782000,
    targetRev: 1000000,
    leads: 328,
    deals: 42,
    successPairs: 8,
    csat: 99.1,
    tags: ['江南雅致风格', '口碑转介绍突出']
  }
]

// 4. 金牌红娘业绩与脱单龙虎榜
const topMatchmakers = [
  {
    rank: 1,
    name: '苏婉清',
    workNo: 'HN-8001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    title: '首席金牌红娘 / 国家婚恋咨询师',
    storeName: '静安旗舰店',
    monthlySales: 486000,
    dealsCount: 26,
    successPairs: 9,
    clientsInHand: 28,
    csat: 99.8,
    badge: '🏆 月度销冠'
  },
  {
    rank: 2,
    name: '叶知秋',
    workNo: 'HN-8003',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200',
    title: '资深情感调解专家 / 心理学硕士',
    storeName: '新天地会所',
    monthlySales: 392000,
    dealsCount: 21,
    successPairs: 7,
    clientsInHand: 24,
    csat: 99.5,
    badge: '🥈 撮合能手'
  },
  {
    rank: 3,
    name: '林语堂',
    workNo: 'HN-8005',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    title: '高净值客群婚恋总监',
    storeName: '静安旗舰店',
    monthlySales: 345000,
    dealsCount: 18,
    successPairs: 6,
    clientsInHand: 22,
    csat: 99.2,
    badge: '🥉 卓越导师'
  },
  {
    rank: 4,
    name: '周雅琴',
    workNo: 'HN-8008',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
    title: '金牌红娘 / 优雅仪态顾问',
    storeName: '杭州西湖馆',
    monthlySales: 288000,
    dealsCount: 16,
    successPairs: 5,
    clientsInHand: 19,
    csat: 99.0,
    badge: '🌟 潜力新星'
  }
]

// 5. 高端会员画像结构分析
const ageDistribution = [
  { label: '22-27岁 (青年菁英)', percent: 24, color: '#C94B62', count: '1,420人' },
  { label: '28-35岁 (黄金主力)', percent: 48, color: '#C29353', count: '2,840人' },
  { label: '36-45岁 (成熟稳健)', percent: 21, color: '#2b3a4a', count: '1,240人' },
  { label: '45岁以上 (名仕雅集)', percent: 7, color: '#718096', count: '414人' }
]

const educationDistribution = [
  { label: '海归硕博 / 海外名校', percent: 36, color: '#C94B62' },
  { label: '国内985 / 211名校', percent: 42, color: '#C29353' },
  { label: '重点本科 / 双一流', percent: 18, color: '#27ae60' },
  { label: '长江/中欧 EMBA', percent: 4, color: '#2b3a4a' }
]

const incomeDistribution = [
  { label: '年薪 30-50 万 (新锐骨干)', percent: 28 },
  { label: '年薪 50-100 万 (企业中高层)', percent: 43 },
  { label: '年薪 100-300 万 (金领/合伙人)', percent: 21 },
  { label: '300 万以上 (独角兽/家族实控)', percent: 8 }
]

// 6. 获客渠道与 ROI 转化率
const leadChannels = [
  { name: '官方网站与品牌搜索', leads: 480, deals: 82, rate: '17.1%', cost: '¥ 120', roi: '8.4x' },
  { name: '老客户/成功会员转介绍', leads: 340, deals: 78, rate: '22.9%', cost: '¥ 0', roi: '∞' },
  { name: '小红书/微信高质内容', leads: 320, deals: 34, rate: '10.6%', cost: '¥ 180', roi: '5.2x' },
  { name: '名企联谊/高净值品鉴沙龙', leads: 188, deals: 21, rate: '11.2%', cost: '¥ 350', roi: '4.8x' },
  { name: '高端商圈户外与异业合作', leads: 100, deals: 3, rate: '3.0%', cost: '¥ 620', roi: '2.1x' }
]

// 7. 智能经营预警与策略建议
const smartAlerts = [
  {
    type: 'success',
    title: '【静安旗舰店】茶室二面复约率突破 88.5%',
    desc: '东方美学茶室的沉浸式约见体验有效降低了初次见面的尴尬感，二面复约转化率环比提升 14%，建议在新天地和西湖馆推行标准化宋代点茶破冰流程。'
  },
  {
    type: 'warning',
    title: '【线索配额预警】苏婉清、叶知秋等 3 位红娘名下在跟客户数已达 95% 上限',
    desc: '高负荷可能导致跟进频率下降，建议启动“师徒协同制”，将部分意向较初期的客户分流至储备红娘，或在组织架构中调高该资深红娘的配额上限。'
  },
  {
    type: 'info',
    title: '【客群结构洞察】本月 28-32 岁海归高知女性会员环比增长 31%',
    desc: '对“金融/科技/创业背景、谈吐教养、共同审美”的择偶需求集中，建议在匹配库中增加对应的男士精准邀约与专题私享沙龙。'
  }
]

// 刷新大盘数据
function refreshDashboard() {
  ElMessage.success('已拉取阿拉小红娘集团最新实时经营数据！')
}

// 导出大盘报告
function exportReport() {
  ElMessage.success('正在生成《阿拉小红娘经营多维分析看板月报.xlsx》，已加入下载队列！')
}

// 跳转至员工管理
function gotoOrgManage() {
  router.push('/admin/organization')
}
</script>

<template>
  <div class="admin-dashboard-page">
    <!-- 顶部状态栏与控制面板 -->
    <div class="dash-topbar">
      <div class="dash-brand-block">
        <div class="title-row">
          <span class="icon">🏮</span>
          <h2>阿拉小红娘 · 集团全景经营数据驾驶舱</h2>
          <span class="status-live">
            <span class="live-dot"></span>
            实时数据已同步
          </span>
        </div>
        <p class="sub">
          融合东方雅致婚恋撮合与数字化运营 · 覆盖上海静安、新天地、杭州西湖 3 大直营会所及全域服务链路
        </p>
      </div>

      <div class="dash-actions">
        <!-- 门店快速切片 -->
        <el-select v-model="selectedStore" placeholder="全部直营门店" size="default" style="width: 170px;">
          <el-option label="🏮 全部直营门店" value="all" />
          <el-option label="🏯 上海静安旗舰店" value="store-1" />
          <el-option label="🏛️ 上海新天地会所" value="store-2" />
          <el-option label="🍵 杭州西湖体验馆" value="store-3" />
        </el-select>

        <!-- 周期切片 -->
        <el-radio-group v-model="currentPeriod" size="default">
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="month">本月</el-radio-button>
          <el-radio-button label="quarter">本季度</el-radio-button>
          <el-radio-button label="year">年度</el-radio-button>
        </el-radio-group>

        <!-- 操作按钮 -->
        <el-button :icon="Refresh" @click="refreshDashboard">刷新</el-button>
        <el-button type="primary" :icon="Download" class="btn-gold" @click="exportReport">导出经营报表</el-button>
      </div>
    </div>

    <!-- 1. 六大核心 KPI 指标看板 -->
    <div class="kpi-grid">
      <div v-for="(kpi, idx) in kpiCards" :key="idx" class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-title">{{ kpi.title }}</span>
          <span class="trend" :class="{ 'is-up': kpi.isUp }">
            <el-icon><Top v-if="kpi.isUp" /><Bottom v-else /></el-icon>
            {{ kpi.trend }}
          </span>
        </div>

        <div class="kpi-val-row">
          <span v-if="kpi.prefix" class="kpi-prefix">{{ kpi.prefix }}</span>
          <span class="kpi-val">{{ kpi.val }}</span>
          <span v-if="kpi.unit" class="kpi-unit">{{ kpi.unit }}</span>
        </div>

        <!-- 目标完成进度条 -->
        <div class="kpi-progress-wrap">
          <div class="progress-info">
            <span>月目标: {{ kpi.target }}</span>
            <strong>{{ kpi.progress }}%</strong>
          </div>
          <div class="progress-bar-bg">
            <div
              class="progress-bar-fill"
              :style="{ width: `${Math.min(kpi.progress, 100)}%` }"
              :class="{ 'fill-gold': idx === 0 || idx === 3, 'fill-green': kpi.progress >= 100 }"
            ></div>
          </div>
        </div>

        <div class="kpi-sub-text">{{ kpi.sub }}</div>
      </div>
    </div>

    <!-- 2. 核心图表区域 1：营收与成交双轴趋势图 + 客户全链路六阶转化漏斗 -->
    <div class="dash-grid-2">
      <!-- 营收与签约走势双轴可视化图表 -->
      <div class="panel chart-panel">
        <div class="panel-header">
          <div class="p-title">
            <el-icon class="icon-title"><TrendCharts /></el-icon>
            <h3>2026年度签约流水与成交单数走势 (双轴趋势分析)</h3>
          </div>
          <div class="legend-group">
            <span class="legend-item"><span class="dot dot-rev"></span>签约流水(万元)</span>
            <span class="legend-item"><span class="dot dot-deals"></span>成交单数(单)</span>
            <span class="legend-item"><span class="dot dot-avg"></span>平均客单价(万元)</span>
          </div>
        </div>

        <!-- 交互式双轴 SVG 趋势柱状/面积图 -->
        <div class="custom-chart-container">
          <div class="chart-y-axis">
            <span>600万</span>
            <span>450万</span>
            <span>300万</span>
            <span>150万</span>
            <span>0</span>
          </div>

          <div class="chart-main-body">
            <!-- 走势背景网格线 -->
            <div class="grid-lines">
              <div class="grid-line"></div>
              <div class="grid-line"></div>
              <div class="grid-line"></div>
              <div class="grid-line"></div>
            </div>

            <!-- 月份数据列与柱状/折线点 -->
            <div class="bars-wrapper">
              <div
                v-for="(m, i) in trendMonths"
                :key="m"
                class="month-bar-col"
                :class="{ active: hoveredMonthIdx === i }"
                @mouseenter="hoveredMonthIdx = i"
              >
                <!-- 柱状图：营收金额 -->
                <div class="bar-track">
                  <div
                    class="bar-fill-rev"
                    :style="{ height: `${(trendRevenue[i] / 600) * 100}%` }"
                  >
                    <span v-if="hoveredMonthIdx === i" class="bar-tooltip">
                      ¥{{ trendRevenue[i] }}万 / {{ trendDeals[i] }}单
                    </span>
                  </div>
                  <!-- 成交单数标记点 -->
                  <div
                    class="deal-dot-mark"
                    :style="{ bottom: `${(trendDeals[i] / 100) * 100}%` }"
                  ></div>
                </div>

                <span class="month-label">{{ m }}</span>
              </div>
            </div>
          </div>

          <div class="chart-y-axis right">
            <span>100单</span>
            <span>75单</span>
            <span>50单</span>
            <span>25单</span>
            <span>0</span>
          </div>
        </div>

        <!-- 趋势下方亮点摘要 -->
        <div class="chart-footer-stats">
          <div class="stat-pill">
            <span class="label">年度累计总营收：</span>
            <strong>¥ 4,407 万元</strong>
          </div>
          <div class="stat-pill">
            <span class="label">平均客单价：</span>
            <strong>¥ 6.58 万元/单</strong>
          </div>
          <div class="stat-pill">
            <span class="label">最高峰值月：</span>
            <strong>12月 (预期破580万)</strong>
          </div>
          <div class="stat-pill">
            <span class="label">季度环比增长：</span>
            <strong class="text-green">+21.8% ↑</strong>
          </div>
        </div>
      </div>

      <!-- 六阶全链路转化漏斗 -->
      <div class="panel funnel-panel">
        <div class="panel-header">
          <div class="p-title">
            <el-icon class="icon-title"><Opportunity /></el-icon>
            <h3>全生命周期客户转化漏斗分析</h3>
          </div>
          <span class="badge-tag">端到端流转监控</span>
        </div>

        <div class="funnel-container">
          <div
            v-for="(f, idx) in funnelData"
            :key="idx"
            class="funnel-step-item"
          >
            <div class="step-meta">
              <span class="step-title">{{ f.stage }}</span>
              <div class="step-data">
                <span class="step-count"><strong>{{ f.count }}</strong> 人</span>
                <span class="step-rate">{{ f.rate }}</span>
              </div>
            </div>

            <!-- 漏斗梯形渐变进度条 -->
            <div class="funnel-bar-wrapper">
              <div
                class="funnel-bar-fill"
                :style="{
                  width: f.rate,
                  background: `linear-gradient(90deg, ${f.color}dd, ${f.color})`
                }"
              >
                <span class="inner-rate">转化率 {{ f.rate }}</span>
              </div>
            </div>

            <div class="step-footer">
              <span class="time-cost">⏱️ 平均停留周期: {{ f.time }}</span>
              <span v-if="f.drop !== '-'" class="drop-rate">⚠️ 环节流失率: {{ f.drop }}</span>
            </div>
          </div>
        </div>

        <div class="funnel-insight">
          <p>
            💡 <strong>漏斗瓶颈诊断：</strong> 到店深访至签约环节流失率达 58.0%，分析表明“首面方案定制透明度”是决定签约的核心杠杆。当前已引入《中式命盘与专属匹配报告》，签约率已回升 7.2%。
          </p>
        </div>
      </div>
    </div>

    <!-- 3. 图表区域 2：直营门店多维 PK 矩阵 + 金牌红娘业绩与脱单龙虎榜 -->
    <div class="dash-grid-2">
      <!-- 门店经营与茶室网络 PK -->
      <div class="panel store-panel">
        <div class="panel-header">
          <div class="p-title">
            <el-icon class="icon-title"><OfficeBuilding /></el-icon>
            <h3>全国直营会所经营战报与茶室上座率</h3>
          </div>
          <el-button link type="primary" @click="gotoOrgManage">管理门店资产 →</el-button>
        </div>

        <div class="store-pk-cards">
          <div v-for="st in storePkList" :key="st.name" class="store-card">
            <div class="store-card-header">
              <div class="store-main">
                <span class="rank-badge" :class="`rank-${st.rank}`">{{ st.rank }}</span>
                <div>
                  <h4>{{ st.name }}</h4>
                  <p class="addr">{{ st.city }} · {{ st.rooms }} · {{ st.staffCount }}名顾问</p>
                </div>
              </div>
              <div class="store-rev-num">
                <span class="num">¥{{ (st.monthlyRev / 10000).toFixed(1) }}万</span>
                <span class="rate">达成率 {{ ((st.monthlyRev / st.targetRev) * 100).toFixed(1) }}%</span>
              </div>
            </div>

            <!-- 指标四宫格 -->
            <div class="store-metrics-row">
              <div class="metric-box">
                <span class="lbl">新增线索</span>
                <strong>{{ st.leads }} 条</strong>
              </div>
              <div class="metric-box">
                <span class="lbl">签约成交</span>
                <strong>{{ st.deals }} 单</strong>
              </div>
              <div class="metric-box">
                <span class="lbl">成功脱单</span>
                <strong class="text-gold">{{ st.successPairs }} 对</strong>
              </div>
              <div class="metric-box">
                <span class="lbl">客户满意度</span>
                <strong class="text-green">{{ st.csat }}%</strong>
              </div>
            </div>

            <div class="store-tags-row">
              <span v-for="tag in st.tags" :key="tag" class="store-tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 金牌红娘与顾问龙虎榜 (带员工跳转) -->
      <div class="panel staff-rank-panel">
        <div class="panel-header">
          <div class="p-title">
            <el-icon class="icon-title"><Trophy /></el-icon>
            <h3>金牌红娘与情感顾问脱单龙虎榜 (本月榜首)</h3>
          </div>
          <el-button link type="primary" @click="gotoOrgManage">员工组织架构 →</el-button>
        </div>

        <div class="staff-hero-list">
          <div v-for="staff in topMatchmakers" :key="staff.workNo" class="staff-hero-card">
            <div class="staff-rank-col">
              <span class="rank-tag" :class="`rank-${staff.rank}`">{{ staff.rank }}</span>
            </div>

            <img :src="staff.avatar" class="staff-avatar" />

            <div class="staff-main-info">
              <div class="name-row">
                <strong>{{ staff.name }}</strong>
                <span class="work-no">{{ staff.workNo }}</span>
                <span class="badge-award">{{ staff.badge }}</span>
              </div>
              <span class="role-desc">{{ staff.storeName }} · {{ staff.title }}</span>
              <div class="staff-mini-stats">
                <span>名下客户: <strong>{{ staff.clientsInHand }}</strong> 位</span>
                <span>成功脱单: <strong class="text-gold">{{ staff.successPairs }}</strong> 对</span>
                <span>好评率: <strong class="text-green">{{ staff.csat }}%</strong></span>
              </div>
            </div>

            <div class="staff-sales-col">
              <div class="sales-val">¥{{ (staff.monthlySales / 10000).toFixed(1) }}万</div>
              <span class="deals-count">签约 {{ staff.dealsCount }} 单</span>
            </div>
          </div>
        </div>

        <div class="staff-quota-notice">
          <span>👥 <strong>红娘团队整体效能：</strong> 全员平均转化率 15.3%，脱单结缘成功率稳居华东高端婚恋前列。</span>
        </div>
      </div>
    </div>

    <!-- 4. 图表区域 3：会员客群画像多维分布 + 全域获客渠道 ROI 产出 -->
    <div class="dash-grid-2">
      <!-- 高端严选会员客群结构与画像分布 -->
      <div class="panel persona-panel">
        <div class="panel-header">
          <div class="p-title">
            <el-icon class="icon-title"><UserFilled /></el-icon>
            <h3>高端严选会员画像与学历/年薪结构分布</h3>
          </div>
          <span class="badge-tag">在册会员 5,914 位</span>
        </div>

        <div class="persona-content-grid">
          <!-- 年龄构成环形与进度条 -->
          <div class="persona-block">
            <h4>🎂 年龄梯队分布</h4>
            <div class="dist-list">
              <div v-for="age in ageDistribution" :key="age.label" class="dist-row">
                <div class="dist-header">
                  <span class="dist-label">{{ age.label }}</span>
                  <span class="dist-val">{{ age.percent }}% ({{ age.count }})</span>
                </div>
                <div class="dist-bar-bg">
                  <div
                    class="dist-bar-fill"
                    :style="{ width: `${age.percent}%`, background: age.color }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 学历背景构成 -->
          <div class="persona-block">
            <h4>🎓 学历与学术背景</h4>
            <div class="dist-list">
              <div v-for="edu in educationDistribution" :key="edu.label" class="dist-row">
                <div class="dist-header">
                  <span class="dist-label">{{ edu.label }}</span>
                  <span class="dist-val">{{ edu.percent }}%</span>
                </div>
                <div class="dist-bar-bg">
                  <div
                    class="dist-bar-fill"
                    :style="{ width: `${edu.percent}%`, background: edu.color }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 收入层级与资产概况 -->
        <div class="income-tier-row">
          <div v-for="inc in incomeDistribution" :key="inc.label" class="income-chip">
            <span class="inc-name">{{ inc.label }}</span>
            <strong class="inc-pct">{{ inc.percent }}%</strong>
          </div>
        </div>
      </div>

      <!-- 全渠道获客来源转化与 ROI 矩阵表格 -->
      <div class="panel channel-panel">
        <div class="panel-header">
          <div class="p-title">
            <el-icon class="icon-title"><Share /></el-icon>
            <h3>全域获客渠道商机质量与 ROI 投产比矩阵</h3>
          </div>
          <span class="badge-tag">月均线索 1,428 条</span>
        </div>

        <div class="channel-table-wrapper">
          <table class="custom-admin-table">
            <thead>
              <tr>
                <th>获客渠道来源</th>
                <th>线索量</th>
                <th>签约单数</th>
                <th>线索转化率</th>
                <th>获客CAC</th>
                <th>投产比 ROI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ch in leadChannels" :key="ch.name">
                <td class="ch-name"><strong>{{ ch.name }}</strong></td>
                <td>{{ ch.leads }} 条</td>
                <td>{{ ch.deals }} 单</td>
                <td>
                  <span class="rate-badge">{{ ch.rate }}</span>
                </td>
                <td class="text-muted">{{ ch.cost }}</td>
                <td>
                  <strong :class="{ 'text-gold': ch.roi === '∞' || ch.roi.startsWith('8') }">{{ ch.roi }}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="channel-summary-note">
          <p>📌 <strong>渠道策略建议：</strong> “老客户转介绍”与“高净值名企联谊”具备最高的终生价值(LTV)和几乎为零的获客成本，下月建议加大《红娘带你品宋韵雅集》线下圈层活动的举办频次。</p>
        </div>
      </div>
    </div>

    <!-- 5. 底部：AI 智能经营诊断与风险预警通知 -->
    <div class="panel alerts-panel">
      <div class="panel-header">
        <div class="p-title">
          <el-icon class="icon-title"><WarningFilled /></el-icon>
          <h3>阿拉小红娘 · 智能经营诊断与业务协同预警</h3>
        </div>
        <span class="badge-tag">AI 辅助决策中枢</span>
      </div>

      <div class="alerts-grid">
        <div
          v-for="(alert, idx) in smartAlerts"
          :key="idx"
          class="alert-card"
          :class="`alert-${alert.type}`"
        >
          <div class="alert-head">
            <span class="alert-tag-type">
              {{ alert.type === 'success' ? '✅ 经营增长' : alert.type === 'warning' ? '⚠️ 配额警报' : '💡 客群洞察' }}
            </span>
            <h4>{{ alert.title }}</h4>
          </div>
          <p class="alert-desc">{{ alert.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 顶部状态栏 */
.dash-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
}

.dash-brand-block .title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dash-brand-block .icon {
  font-size: 24px;
}
.dash-brand-block h2 {
  font-size: 20px;
  font-family: var(--font-song), serif;
  font-weight: 700;
  color: var(--color-ink);
  margin: 0;
}
.status-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 600;
}
.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #27ae60;
  box-shadow: 0 0 6px #27ae60;
}
.dash-brand-block .sub {
  font-size: 12px;
  color: var(--color-ink-muted);
  margin-top: 4px;
}

.dash-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-gold {
  background: var(--color-gold) !important;
  border-color: var(--color-gold) !important;
  color: #ffffff !important;
}

/* 1. 六大 KPI 指标 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

@media (max-width: 1400px) {
  .kpi-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.kpi-card {
  background: #ffffff;
  padding: 18px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s, box-shadow 0.2s;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
}

.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.kpi-title {
  font-size: 12px;
  color: var(--color-ink-muted);
  font-weight: 500;
}
.trend {
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  color: #c62828;
}
.trend.is-up {
  color: #c62828;
}

.kpi-val-row {
  display: flex;
  align-items: baseline;
  margin: 10px 0;
}
.kpi-prefix {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-ink);
  margin-right: 2px;
}
.kpi-val {
  font-size: 24px;
  font-weight: 700;
  font-family: var(--font-song), serif;
  color: var(--color-ink);
}
.kpi-unit {
  font-size: 12px;
  color: var(--color-ink-muted);
  margin-left: 4px;
}

.kpi-progress-wrap {
  margin-bottom: 8px;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-ink-muted);
  margin-bottom: 4px;
}
.progress-info strong {
  color: var(--color-ink);
}
.progress-bar-bg {
  height: 6px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--color-crimson);
  border-radius: 4px;
  transition: width 0.6s ease;
}
.progress-bar-fill.fill-gold {
  background: var(--color-gold);
}
.progress-bar-fill.fill-green {
  background: #27ae60;
}

.kpi-sub-text {
  font-size: 11px;
  color: var(--color-ink-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 两列网格 */
.dash-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 1200px) {
  .dash-grid-2 {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 22px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.p-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon-title {
  font-size: 18px;
  color: var(--color-crimson);
}
.panel-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-ink);
  margin: 0;
}

.badge-tag {
  font-size: 11px;
  background: rgba(201, 75, 98, 0.1);
  color: var(--color-crimson);
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.legend-group {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--color-ink-muted);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.dot-rev { background: var(--color-crimson); }
.dot-deals { background: var(--color-gold); }
.dot-avg { background: #2b3a4a; }

/* 趋势图表 */
.custom-chart-container {
  display: flex;
  height: 220px;
  position: relative;
  margin: 10px 0;
}
.chart-y-axis {
  width: 45px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 10px;
  color: var(--color-ink-muted);
  text-align: right;
  padding-right: 8px;
}
.chart-y-axis.right {
  text-align: left;
  padding-left: 8px;
  padding-right: 0;
}

.chart-main-body {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
}
.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}
.grid-line {
  border-bottom: 1px dashed rgba(0, 0, 0, 0.06);
  width: 100%;
}

.bars-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.month-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  cursor: pointer;
  padding: 0 4px;
}
.bar-track {
  width: 100%;
  max-width: 18px;
  height: calc(100% - 24px);
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
.bar-fill-rev {
  width: 100%;
  background: linear-gradient(180deg, var(--color-crimson) 0%, rgba(201, 75, 98, 0.6) 100%);
  border-radius: 4px 4px 0 0;
  position: relative;
  transition: all 0.3s;
}
.month-bar-col:hover .bar-fill-rev,
.month-bar-col.active .bar-fill-rev {
  background: var(--color-crimson);
  box-shadow: 0 0 10px rgba(201, 75, 98, 0.4);
}
.deal-dot-mark {
  position: absolute;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-gold);
  border: 2px solid #ffffff;
  box-shadow: 0 0 4px rgba(0,0,0,0.2);
  transform: translateX(-50%);
  left: 50%;
}
.bar-tooltip {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(26, 30, 40, 0.9);
  color: #ffffff;
  font-size: 10px;
  padding: 3px 6px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
}
.month-label {
  font-size: 11px;
  color: var(--color-ink-muted);
  margin-top: 6px;
  height: 18px;
}
.month-bar-col.active .month-label {
  color: var(--color-crimson);
  font-weight: 700;
}

.chart-footer-stats {
  display: flex;
  justify-content: space-around;
  background: #fdfaf6;
  border: 1px solid rgba(194, 147, 83, 0.15);
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 14px;
}
.stat-pill {
  font-size: 12px;
  color: var(--color-ink);
}
.stat-pill .label {
  color: var(--color-ink-muted);
}
.stat-pill strong {
  color: var(--color-ink);
  font-family: var(--font-song), serif;
}
.text-green { color: #27ae60 !important; }
.text-gold { color: var(--color-gold) !important; }

/* 转化漏斗 */
.funnel-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.funnel-step-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.step-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.step-title {
  font-weight: 600;
  color: var(--color-ink);
}
.step-data {
  display: flex;
  gap: 10px;
  align-items: baseline;
}
.step-count {
  font-size: 12px;
  color: var(--color-ink-muted);
}
.step-count strong {
  color: var(--color-ink);
}
.step-rate {
  font-weight: 700;
  color: var(--color-crimson);
  font-size: 12px;
}
.funnel-bar-wrapper {
  height: 20px;
  background: #f0f2f5;
  border-radius: 6px;
  overflow: hidden;
}
.funnel-bar-fill {
  height: 100%;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  transition: width 0.8s ease;
}
.inner-rate {
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
}
.step-footer {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-ink-muted);
}
.drop-rate {
  color: #e67e22;
  font-weight: 600;
}

.funnel-insight {
  background: #fdfaf7;
  border-left: 3px solid var(--color-gold);
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--color-ink);
  line-height: 1.5;
  margin-top: 14px;
}

/* 门店 PK 列表 */
.store-pk-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.store-card {
  background: #fcfcfc;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  padding: 14px 16px;
  transition: all 0.2s;
}
.store-card:hover {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.store-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.store-main {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rank-badge {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  color: #ffffff;
  background: #a0aec0;
}
.rank-badge.rank-1 { background: var(--color-crimson); }
.rank-badge.rank-2 { background: var(--color-gold); }
.rank-badge.rank-3 { background: #4a5568; }

.store-main h4 {
  margin: 0;
  font-size: 14px;
  color: var(--color-ink);
}
.store-main .addr {
  font-size: 11px;
  color: var(--color-ink-muted);
  margin: 2px 0 0 0;
}
.store-rev-num {
  text-align: right;
}
.store-rev-num .num {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-crimson);
  font-family: var(--font-song), serif;
  display: block;
}
.store-rev-num .rate {
  font-size: 11px;
  color: var(--color-ink-muted);
}

.store-metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 8px;
}
.metric-box {
  display: flex;
  flex-direction: column;
}
.metric-box .lbl {
  font-size: 10px;
  color: var(--color-ink-muted);
}
.metric-box strong {
  font-size: 12px;
  color: var(--color-ink);
}
.store-tags-row {
  display: flex;
  gap: 6px;
}
.store-tag {
  font-size: 10px;
  background: rgba(194, 147, 83, 0.1);
  color: var(--color-gold);
  padding: 1px 6px;
  border-radius: 4px;
}

/* 红娘龙虎榜 */
.staff-hero-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.staff-hero-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fcfcfc;
  border: 1px solid rgba(0, 0, 0, 0.05);
  padding: 10px 14px;
  border-radius: 10px;
  transition: all 0.2s;
}
.staff-hero-card:hover {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.staff-rank-col {
  width: 24px;
  text-align: center;
}
.rank-tag {
  font-size: 14px;
  font-weight: 700;
  color: #a0aec0;
}
.rank-tag.rank-1 { color: var(--color-crimson); font-size: 18px; }
.rank-tag.rank-2 { color: var(--color-gold); font-size: 16px; }
.rank-tag.rank-3 { color: #2b3a4a; font-size: 15px; }

.staff-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(194, 147, 83, 0.3);
}
.staff-main-info {
  flex: 1;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.name-row strong {
  font-size: 14px;
  color: var(--color-ink);
}
.work-no {
  font-size: 10px;
  color: var(--color-ink-muted);
}
.badge-award {
  font-size: 10px;
  background: rgba(201, 75, 98, 0.1);
  color: var(--color-crimson);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}
.role-desc {
  display: block;
  font-size: 11px;
  color: var(--color-ink-muted);
  margin-top: 2px;
}
.staff-mini-stats {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: var(--color-ink);
  margin-top: 4px;
}

.staff-sales-col {
  text-align: right;
}
.sales-val {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-crimson);
  font-family: var(--font-song), serif;
}
.deals-count {
  font-size: 11px;
  color: var(--color-ink-muted);
}
.staff-quota-notice {
  background: #f8f9fa;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--color-ink-muted);
  margin-top: 12px;
}

/* 会员画像 */
.persona-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.persona-block h4 {
  font-size: 13px;
  color: var(--color-ink);
  margin-bottom: 10px;
}
.dist-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.dist-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-ink);
}
.dist-bar-bg {
  height: 6px;
  background: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 2px;
}
.dist-bar-fill {
  height: 100%;
  border-radius: 4px;
}

.income-tier-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
.income-chip {
  background: #fcfaf7;
  border: 1px solid rgba(194, 147, 83, 0.2);
  padding: 8px 10px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}
.inc-name {
  font-size: 10px;
  color: var(--color-ink-muted);
}
.inc-pct {
  font-size: 15px;
  color: var(--color-gold);
  font-family: var(--font-song), serif;
  margin-top: 2px;
}

/* 渠道表格 */
.channel-table-wrapper {
  overflow-x: auto;
}
.custom-admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.custom-admin-table th {
  background: #f8f9fa;
  color: var(--color-ink-muted);
  font-weight: 600;
  text-align: left;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.custom-admin-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  color: var(--color-ink);
}
.ch-name {
  color: var(--color-ink);
}
.rate-badge {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
}
.text-muted {
  color: var(--color-ink-muted);
}
.channel-summary-note {
  background: #f8f9fa;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 11px;
  color: var(--color-ink-muted);
  line-height: 1.5;
  margin-top: 12px;
}

/* 智能预警卡片 */
.alerts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 1000px) {
  .alerts-grid {
    grid-template-columns: 1fr;
  }
}
.alert-card {
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.alert-card.alert-success {
  background: #f4faf6;
  border-color: rgba(39, 174, 96, 0.2);
}
.alert-card.alert-warning {
  background: #fdfaf4;
  border-color: rgba(230, 126, 34, 0.2);
}
.alert-card.alert-info {
  background: #f5f8fb;
  border-color: rgba(43, 58, 74, 0.15);
}

.alert-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.alert-tag-type {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.05);
}
.alert-head h4 {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-ink);
  margin: 0;
}
.alert-desc {
  font-size: 11px;
  color: var(--color-ink-muted);
  line-height: 1.5;
  margin: 0;
}
</style>
