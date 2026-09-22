<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useAppStateStore } from '@/stores/appState'
import {
  OfficeBuilding,
  User,
  Plus,
  Edit,
  Delete,
  Check,
  Close,
  Location,
  Phone,
  StarFilled,
  CoffeeCup,
  Setting,
  Search,
  Filter,
  Download,
  Upload,
  Refresh,
  Calendar,
  DocumentChecked,
  Money,
  Timer,
  Share,
  Avatar,
  CircleCheckFilled,
  WarningFilled,
  TrendCharts
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { StaffProfile, UserRole } from '@/types'

const appStore = useAppStateStore()

// 激活的 Tab：'staff' 员工花名册与绩效 | 'stores' 门店与茶室网络 | 'roster' 员工排班与值班 | 'roles' RBAC权限配置
const activeTab = ref<'staff' | 'stores' | 'roster' | 'roles'>('staff')

// ==================== 1. 员工管理核心逻辑 ====================
const searchKeyword = ref('')
const selectedRole = ref('')
const selectedStore = ref('')
const selectedStatus = ref('')
const staffViewMode = ref<'table' | 'cards'>('table')

// 员工扩展模型
interface StaffEmployee {
  id: string
  name: string
  workNo: string
  gender: 'female' | 'male'
  avatar: string
  role: 'matchmaker' | 'counselor' | 'receptionist' | 'manager'
  roleName: string
  storeId: string
  storeName: string
  phone: string
  email: string
  status: 'active' | 'probation' | 'leave' | 'resigned'
  experienceYears: number
  title: string
  baseSalary: number
  commissionRate: number // 提成比例 %
  monthlySales: number // 本月成交额
  activeClientsCount: number // 名下活跃客户
  clientQuota: number // 线索配额上限
  successPairs: number // 成功脱单
  csatRating: number // 满意度
  joinDate: string
  specialties: string[]
  philosophy: string
}

// 模拟完整员工花名册
const staffList = ref<StaffEmployee[]>([
  {
    id: 'staff_001',
    name: '苏婉宁',
    workNo: 'HN-SH-0801',
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    role: 'matchmaker',
    roleName: '金牌红娘',
    storeId: 'store_sh_01',
    storeName: '上海静安旗舰店',
    phone: '138-1823-9901',
    email: 'su.wanning@alahn.com',
    status: 'active',
    experienceYears: 8,
    title: '资深金牌婚恋规划师',
    baseSalary: 12000,
    commissionRate: 15,
    monthlySales: 480000,
    activeClientsCount: 42,
    clientQuota: 50,
    successPairs: 86,
    csatRating: 4.98,
    joinDate: '2021-03-15',
    specialties: ['体制内高干', '金融精英', '海归硕士', '高知家庭'],
    philosophy: '以真心换真情，用专业与敏锐洞察成人之美。'
  },
  {
    id: 'staff_002',
    name: '沈清墨',
    workNo: 'GW-SH-0802',
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    role: 'counselor',
    roleName: '首席情感顾问',
    storeId: 'store_sh_01',
    storeName: '上海静安旗舰店',
    phone: '139-1662-8877',
    email: 'shen.qingmo@alahn.com',
    status: 'active',
    experienceYears: 10,
    title: '国家二级心理咨询师 · 首席顾问',
    baseSalary: 15000,
    commissionRate: 18,
    monthlySales: 320000,
    activeClientsCount: 28,
    clientQuota: 35,
    successPairs: 124,
    csatRating: 5.0,
    joinDate: '2020-08-01',
    specialties: ['婚前心理评估', '亲密关系修复', '原生家庭疏导', '信任重建'],
    philosophy: '解开执念与心结，让爱在理性与包容中自然流淌。'
  },
  {
    id: 'staff_003',
    name: '陆子谦',
    workNo: 'HN-SH-0803',
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    role: 'matchmaker',
    roleName: '资深红娘',
    storeId: 'store_sh_02',
    storeName: '上海新天地高级会所',
    phone: '137-0182-3344',
    email: 'lu.ziqian@alahn.com',
    status: 'active',
    experienceYears: 6,
    title: '高净值客群婚恋专家',
    baseSalary: 10000,
    commissionRate: 14,
    monthlySales: 390000,
    activeClientsCount: 35,
    clientQuota: 45,
    successPairs: 68,
    csatRating: 4.92,
    joinDate: '2022-05-10',
    specialties: ['外企高管', '创业新贵', '艺术海归'],
    philosophy: '精准的人性洞察是最高效的姻缘催化剂。'
  },
  {
    id: 'staff_004',
    name: '李晓萌',
    workNo: 'KF-SH-0804',
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    role: 'receptionist',
    roleName: '客服主管',
    storeId: 'store_sh_01',
    storeName: '上海静安旗舰店',
    phone: '136-2188-4455',
    email: 'li.xiaomeng@alahn.com',
    status: 'active',
    experienceYears: 4,
    title: '高级客服接待主管',
    baseSalary: 8500,
    commissionRate: 5,
    monthlySales: 160000,
    activeClientsCount: 80,
    clientQuota: 100,
    successPairs: 32,
    csatRating: 4.89,
    joinDate: '2023-02-18',
    specialties: ['首访暖心接待', '需求精准初筛', '线索智能分流'],
    philosophy: '温润真诚的第一声问候，开启一生的美好信赖。'
  },
  {
    id: 'staff_005',
    name: '周雅欣',
    workNo: 'HN-HZ-0805',
    gender: 'female',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    role: 'matchmaker',
    roleName: '金牌红娘',
    storeId: 'store_hz_01',
    storeName: '杭州西湖私享体验馆',
    phone: '135-8812-7722',
    email: 'zhou.yaxin@alahn.com',
    status: 'active',
    experienceYears: 5,
    title: '杭城名门婚恋顾问',
    baseSalary: 9500,
    commissionRate: 14,
    monthlySales: 280000,
    activeClientsCount: 30,
    clientQuota: 40,
    successPairs: 54,
    csatRating: 4.95,
    joinDate: '2022-11-01',
    specialties: ['大厂高P', '浙商二代', '高校教师'],
    philosophy: '西湖水暖，良缘天成；用严谨态度护航每一场奔赴。'
  },
  {
    id: 'staff_006',
    name: '赵子豪',
    workNo: 'GW-HZ-0806',
    gender: 'male',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    role: 'counselor',
    roleName: '情感顾问',
    storeId: 'store_hz_01',
    storeName: '杭州西湖私享体验馆',
    phone: '138-5711-9988',
    email: 'zhao.zihao@alahn.com',
    status: 'probation',
    experienceYears: 3,
    title: '婚姻家庭咨询师（试用期）',
    baseSalary: 8000,
    commissionRate: 10,
    monthlySales: 120000,
    activeClientsCount: 15,
    clientQuota: 25,
    successPairs: 18,
    csatRating: 4.82,
    joinDate: '2026-01-10',
    specialties: ['青年恋爱焦虑', '情侣沟通障碍', '相亲模拟脱敏'],
    philosophy: '帮助年轻人看清自我，学会勇敢去爱。'
  }
])

// 过滤员工列表
const filteredStaff = computed(() => {
  return staffList.value.filter((emp) => {
    const matchKey =
      !searchKeyword.value ||
      emp.name.includes(searchKeyword.value) ||
      emp.workNo.includes(searchKeyword.value) ||
      emp.phone.includes(searchKeyword.value) ||
      emp.title.includes(searchKeyword.value)

    const matchRole = !selectedRole.value || emp.role === selectedRole.value
    const matchStore = !selectedStore.value || emp.storeId === selectedStore.value
    const matchStatus = !selectedStatus.value || emp.status === selectedStatus.value

    return matchKey && matchRole && matchStore && matchStatus
  })
})

// 员工汇总 KPI 数据
const staffSummaryKpis = computed(() => {
  const total = staffList.value.length
  const activeCount = staffList.value.filter((e) => e.status === 'active').length
  const totalMonthlySales = staffList.value.reduce((acc, curr) => acc + curr.monthlySales, 0)
  const totalPairs = staffList.value.reduce((acc, curr) => acc + curr.successPairs, 0)
  const avgCsat = (
    staffList.value.reduce((acc, curr) => acc + curr.csatRating, 0) / (total || 1)
  ).toFixed(2)

  return {
    total,
    activeCount,
    totalMonthlySales: `¥ ${(totalMonthlySales / 10000).toFixed(1)}万`,
    totalPairs,
    avgCsat
  }
})

// 员工增改弹窗与表单
const staffDialogVisible = ref(false)
const isEditingStaff = ref(false)
const staffForm = reactive({
  id: '',
  name: '',
  gender: 'female' as 'female' | 'male',
  role: 'matchmaker' as 'matchmaker' | 'counselor' | 'receptionist' | 'manager',
  title: '',
  storeId: 'store_sh_01',
  phone: '',
  email: '',
  baseSalary: 10000,
  commissionRate: 15,
  clientQuota: 45,
  experienceYears: 5,
  status: 'active' as 'active' | 'probation' | 'leave' | 'resigned',
  specialties: '',
  philosophy: ''
})

function handleOpenAddStaff() {
  isEditingStaff.value = false
  staffForm.id = ''
  staffForm.name = ''
  staffForm.gender = 'female'
  staffForm.role = 'matchmaker'
  staffForm.title = '资深金牌红娘'
  staffForm.storeId = 'store_sh_01'
  staffForm.phone = ''
  staffForm.email = ''
  staffForm.baseSalary = 10000
  staffForm.commissionRate = 15
  staffForm.clientQuota = 45
  staffForm.experienceYears = 5
  staffForm.status = 'active'
  staffForm.specialties = '高知客群, 金融精英, 体制内'
  staffForm.philosophy = '以真心待人，促成美满良缘。'
  staffDialogVisible.value = true
}

function handleOpenEditStaff(emp: StaffEmployee) {
  isEditingStaff.value = true
  staffForm.id = emp.id
  staffForm.name = emp.name
  staffForm.gender = emp.gender
  staffForm.role = emp.role
  staffForm.title = emp.title
  staffForm.storeId = emp.storeId
  staffForm.phone = emp.phone
  staffForm.email = emp.email
  staffForm.baseSalary = emp.baseSalary
  staffForm.commissionRate = emp.commissionRate
  staffForm.clientQuota = emp.clientQuota
  staffForm.experienceYears = emp.experienceYears
  staffForm.status = emp.status
  staffForm.specialties = emp.specialties.join(', ')
  staffForm.philosophy = emp.philosophy
  staffDialogVisible.value = true
}

function saveStaff() {
  if (!staffForm.name || !staffForm.phone) {
    ElMessage.warning('请填写完整的员工姓名与联系电话')
    return
  }

  const storeMap: Record<string, string> = {
    store_sh_01: '上海静安旗舰店',
    store_sh_02: '上海新天地高级会所',
    store_hz_01: '杭州西湖私享体验馆'
  }
  const roleNameMap: Record<string, string> = {
    matchmaker: '金牌红娘',
    counselor: '情感顾问',
    receptionist: '客服主管',
    manager: '店长/管理层'
  }

  if (isEditingStaff.value) {
    const idx = staffList.value.findIndex((e) => e.id === staffForm.id)
    if (idx !== -1) {
      staffList.value[idx] = {
        ...staffList.value[idx],
        name: staffForm.name,
        gender: staffForm.gender,
        role: staffForm.role,
        roleName: roleNameMap[staffForm.role] || '专业顾问',
        title: staffForm.title,
        storeId: staffForm.storeId,
        storeName: storeMap[staffForm.storeId] || '上海静安旗舰店',
        phone: staffForm.phone,
        email: staffForm.email || `${staffForm.name.toLowerCase()}@alahn.com`,
        baseSalary: Number(staffForm.baseSalary),
        commissionRate: Number(staffForm.commissionRate),
        clientQuota: Number(staffForm.clientQuota),
        experienceYears: Number(staffForm.experienceYears),
        status: staffForm.status,
        specialties: staffForm.specialties.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
        philosophy: staffForm.philosophy
      }
      ElMessage.success(`员工【${staffForm.name}】档案与绩效提成方案已更新！`)
    }
  } else {
    const newId = `staff_${Date.now()}`
    staffList.value.unshift({
      id: newId,
      name: staffForm.name,
      workNo: `HN-${staffForm.storeId.includes('hz') ? 'HZ' : 'SH'}-${Math.floor(1000 + Math.random() * 9000)}`,
      gender: staffForm.gender,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role: staffForm.role,
      roleName: roleNameMap[staffForm.role] || '专业顾问',
      storeId: staffForm.storeId,
      storeName: storeMap[staffForm.storeId] || '上海静安旗舰店',
      phone: staffForm.phone,
      email: staffForm.email || `staff_${Date.now()}@alahn.com`,
      status: staffForm.status,
      experienceYears: Number(staffForm.experienceYears),
      title: staffForm.title,
      baseSalary: Number(staffForm.baseSalary),
      commissionRate: Number(staffForm.commissionRate),
      monthlySales: 0,
      activeClientsCount: 0,
      clientQuota: Number(staffForm.clientQuota),
      successPairs: 0,
      csatRating: 5.0,
      joinDate: new Date().toISOString().split('T')[0],
      specialties: staffForm.specialties.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
      philosophy: staffForm.philosophy
    })
    ElMessage.success(`新员工【${staffForm.name}】已成功录入，已分配线索配额与员工账号！`)
  }
  staffDialogVisible.value = false
}

// 办理离职与客户交接
function handleResignStaff(emp: StaffEmployee) {
  ElMessageBox.confirm(
    `确认办理员工【${emp.name}】的离职手续？其名下当前服务的 ${emp.activeClientsCount} 位会员与历史线索将自动转入【公海客户池】等待二次分配。`,
    '员工离职与资产交接提醒',
    {
      confirmButtonText: '确认交接并归档',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    emp.status = 'resigned'
    emp.activeClientsCount = 0
    ElMessage.success(`已为【${emp.name}】办理离职归档，相关客户已成功交接入公海池！`)
  })
}

// ==================== 2. 直营门店数据 ====================
const stores = ref([
  {
    id: 'store_sh_01',
    name: '上海静安旗舰店',
    city: '上海市 静安区',
    address: '南京西路1266号 恒隆广场写字楼二座 2801室',
    phone: '021-6288-9988',
    teaRooms: 6,
    staffCount: 14,
    activeClients: 128,
    monthlyRevenue: '¥ 1,820,000',
    manager: '张总 (店长)',
    cover: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    tags: ['集团总部', '禅茶美学', '高知客群']
  },
  {
    id: 'store_sh_02',
    name: '上海新天地高级会所',
    city: '上海市 黄浦区',
    address: '马当路245号 新天地时尚二期 L3 私享独栋',
    phone: '021-5386-7766',
    teaRooms: 4,
    staffCount: 8,
    activeClients: 86,
    monthlyRevenue: '¥ 1,240,000',
    manager: '王经理 (执行店长)',
    cover: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
    tags: ['海归专场', '隐秘私享', '外企精英']
  },
  {
    id: 'store_hz_01',
    name: '杭州西湖私享体验馆',
    city: '浙江省 杭州市',
    address: '西湖区 南山路182号 临湖独栋中式茶室',
    phone: '0571-8706-5522',
    teaRooms: 5,
    staffCount: 9,
    activeClients: 72,
    monthlyRevenue: '¥ 782,000',
    manager: '宋经理 (区域店长)',
    cover: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=600&q=80',
    tags: ['湖景茶歇', '体制内高管', '江南雅致']
  }
])

// ==================== 3. 员工值班与排班表 ====================
const weeklySchedule = ref([
  { day: '周一 (08-24)', dutyMatchmaker: '苏婉宁、陆子谦', dutyCounselor: '沈清墨', roomStatus: '6/6 空闲预订中', note: '全员早例会与客资复盘' },
  { day: '周二 (08-25)', dutyMatchmaker: '周雅欣、苏婉宁', dutyCounselor: '赵子豪', roomStatus: '5/6 茶室预约', note: '海归专场个案沟通' },
  { day: '周三 (08-26)', dutyMatchmaker: '陆子谦、李晓萌', dutyCounselor: '沈清墨', roomStatus: '4/6 茶室预约', note: '体制内专场初访' },
  { day: '周四 (08-27)', dutyMatchmaker: '苏婉宁、周雅欣', dutyCounselor: '赵子豪', roomStatus: '5/6 茶室预约', note: '红娘深度双向匹配日' },
  { day: '周五 (08-28)', dutyMatchmaker: '陆子谦、苏婉宁', dutyCounselor: '沈清墨', roomStatus: '6/6 约满', note: '周末初见约见预案会' },
  { day: '周六 (08-29) ★高峰', dutyMatchmaker: '全员在岗 (苏/陆/周)', dutyCounselor: '沈清墨、赵子豪', roomStatus: '6/6 全部约满 (18场)', note: '线下中式茶室牵线峰值日' },
  { day: '周日 (08-30) ★高峰', dutyMatchmaker: '全员在岗 (苏/陆/周)', dutyCounselor: '沈清墨、赵子豪', roomStatus: '6/6 全部约满 (16场)', note: '线下牵线与心动复盘' }
])

// ==================== 4. RBAC 权限矩阵 ====================
const rolePermissions = [
  { module: '前台门户/脱敏大厅浏览', visitor: '脱敏只读', client: '认证完全查看', matchmaker: '完全浏览', counselor: '完全浏览', admin: '全域管理' },
  { module: '会员真实身份与联系方式', visitor: '不可见', client: '仅本人', matchmaker: '仅名下签约会员', counselor: '仅调解中客户', admin: '解密全览+日志审计' },
  { module: '智能人选撮合与约见排期', visitor: '无权', client: '自主提交申请', matchmaker: '全库撮合+排期', counselor: '建议撮合', admin: '排期审批与调配' },
  { module: '全生命周期线索与客户池', visitor: '无权', client: '无权', matchmaker: '分配线索跟进', counselor: '分配线索跟进', admin: '全池分配/流转/回收' },
  { module: '员工薪酬提成与绩效考核', visitor: '无权', client: '无权', matchmaker: '个人业绩流水', counselor: '个人业绩流水', admin: '全盘提成核算与发放' },
  { module: '直营门店与茶室网络运营', visitor: '前台展示', client: '预约导航', matchmaker: '茶室锁台使用', counselor: '咨询室锁台', admin: '门店增设与店长任命' },
  { module: '成功案例与活动内容审核', visitor: '只读文章', client: '评价投稿', matchmaker: '撰写草稿案例', counselor: '撰写咨询案例', admin: '终审一键发布' }
]
</script>

<template>
  <div class="org-manage-container">
    <!-- 顶部主看板 -->
    <div class="org-top-header">
      <div>
        <div class="title-with-badge">
          <h2>集团员工管理、组织架构与经营实体中台</h2>
          <span class="org-status-pill">
            <el-icon><CircleCheckFilled /></el-icon>
            全域数字化组织在轨
          </span>
        </div>
        <p class="header-desc">
          覆盖红娘/顾问全生命周期人事档案、绩效提成核算、线索配额分配、全国直营门店茶室排班与 RBAC 权限控制
        </p>
      </div>

      <div class="top-nav-tabs">
        <button
          class="nav-tab-btn"
          :class="{ active: activeTab === 'staff' }"
          @click="activeTab = 'staff'"
        >
          <el-icon><User /></el-icon>
          <span>员工花名册与绩效 ({{ staffList.length }})</span>
        </button>
        <button
          class="nav-tab-btn"
          :class="{ active: activeTab === 'stores' }"
          @click="activeTab = 'stores'"
        >
          <el-icon><OfficeBuilding /></el-icon>
          <span>直营分店与茶室 ({{ stores.length }})</span>
        </button>
        <button
          class="nav-tab-btn"
          :class="{ active: activeTab === 'roster' }"
          @click="activeTab = 'roster'"
        >
          <el-icon><Calendar /></el-icon>
          <span>排班与茶室值班</span>
        </button>
        <button
          class="nav-tab-btn"
          :class="{ active: activeTab === 'roles' }"
          @click="activeTab = 'roles'"
        >
          <el-icon><Setting /></el-icon>
          <span>RBAC 权限策略</span>
        </button>
      </div>
    </div>

    <!-- 1. TAB: 员工花名册与绩效大盘 -->
    <div v-if="activeTab === 'staff'" class="tab-content-pane">
      <!-- 员工数据看板指标卡 -->
      <div class="staff-kpi-row">
        <div class="kpi-metric-card">
          <div class="metric-top">
            <span class="lbl">在职专家团队</span>
            <el-icon class="icon" color="#9b1c2e"><User /></el-icon>
          </div>
          <div class="metric-val">
            <span class="num">{{ staffSummaryKpis.activeCount }}</span>
            <span class="unit">/ {{ staffSummaryKpis.total }} 人</span>
          </div>
          <div class="metric-sub">包含金牌红娘、情感专家与客服</div>
        </div>

        <div class="kpi-metric-card">
          <div class="metric-top">
            <span class="lbl">本月红娘创收总额</span>
            <el-icon class="icon" color="#c5a059"><Money /></el-icon>
          </div>
          <div class="metric-val">
            <span class="num gold">{{ staffSummaryKpis.totalMonthlySales }}</span>
          </div>
          <div class="metric-sub">平均每位顾问创收 ¥ 29.1 万</div>
        </div>

        <div class="kpi-metric-card">
          <div class="metric-top">
            <span class="lbl">累计撮合成功脱单</span>
            <el-icon class="icon" color="#e11d48"><StarFilled /></el-icon>
          </div>
          <div class="metric-val">
            <span class="num ruby">{{ staffSummaryKpis.totalPairs }}</span>
            <span class="unit">对佳偶</span>
          </div>
          <div class="metric-sub">全网真实领证结婚与双向奔赴</div>
        </div>

        <div class="kpi-metric-card">
          <div class="metric-top">
            <span class="lbl">客户服务满意度 (CSAT)</span>
            <el-icon class="icon" color="#2d7a6e"><CircleCheckFilled /></el-icon>
          </div>
          <div class="metric-val">
            <span class="num green">{{ staffSummaryKpis.avgCsat }}</span>
            <span class="unit">/ 5.00</span>
          </div>
          <div class="metric-sub">好评率高达 99.2%</div>
        </div>
      </div>

      <!-- 员工管理操作过滤栏 -->
      <div class="action-filter-card">
        <div class="filter-left">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索员工姓名 / 工号 / 手机号 / 职称..."
            clearable
            style="width: 280px;"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>

          <el-select v-model="selectedRole" placeholder="岗位角色" clearable style="width: 140px;">
            <el-option label="全部岗位" value="" />
            <el-option label="金牌红娘" value="matchmaker" />
            <el-option label="情感顾问" value="counselor" />
            <el-option label="客服主管" value="receptionist" />
          </el-select>

          <el-select v-model="selectedStore" placeholder="所属门店" clearable style="width: 170px;">
            <el-option label="全部门店" value="" />
            <el-option label="上海静安旗舰店" value="store_sh_01" />
            <el-option label="上海新天地高级会所" value="store_sh_02" />
            <el-option label="杭州西湖私享体验馆" value="store_hz_01" />
          </el-select>

          <el-select v-model="selectedStatus" placeholder="员工状态" clearable style="width: 120px;">
            <el-option label="全部状态" value="" />
            <el-option label="在职正式" value="active" />
            <el-option label="试用期" value="probation" />
            <el-option label="休假中" value="leave" />
            <el-option label="已离职" value="resigned" />
          </el-select>
        </div>

        <div class="filter-right">
          <el-radio-group v-model="staffViewMode" size="small">
            <el-radio-button label="table" value="table">表格大盘</el-radio-button>
            <el-radio-button label="cards" value="cards">名片阵列</el-radio-button>
          </el-radio-group>

          <el-button type="primary" :icon="Plus" @click="handleOpenAddStaff">
            录入新员工
          </el-button>
        </div>
      </div>

      <!-- 员工列表：表格视图 -->
      <div v-if="staffViewMode === 'table'" class="table-container-card">
        <el-table :data="filteredStaff" stripe style="width: 100%">
          <el-table-column label="员工基本信息" min-width="220">
            <template #default="{ row }">
              <div class="employee-cell">
                <img :src="row.avatar" :alt="row.name" class="table-avatar" />
                <div class="cell-info">
                  <div class="name-line">
                    <strong class="emp-name">{{ row.name }}</strong>
                    <span class="emp-workno">{{ row.workNo }}</span>
                  </div>
                  <div class="emp-title-sub">{{ row.title }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="岗位与归属门店" min-width="180">
            <template #default="{ row }">
              <div class="store-role-cell">
                <span class="role-pill" :class="row.role">{{ row.roleName }}</span>
                <span class="store-text">{{ row.storeName }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.status === 'active'" type="success" size="small">在职正式</el-tag>
              <el-tag v-else-if="row.status === 'probation'" type="warning" size="small">试用期</el-tag>
              <el-tag v-else-if="row.status === 'leave'" type="info" size="small">休假中</el-tag>
              <el-tag v-else type="danger" size="small">已离职</el-tag>
            </template>
          </el-table-column>

          <el-table-column label="本月创收业绩" width="140" align="right">
            <template #default="{ row }">
              <div class="sales-cell">
                <span class="sales-num">¥ {{ (row.monthlySales / 10000).toFixed(1) }}万</span>
                <span class="commission-sub">提成 {{ row.commissionRate }}%</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="名下客户与配额" width="160">
            <template #default="{ row }">
              <div class="quota-cell">
                <div class="quota-text">
                  <span>在跟 <strong>{{ row.activeClientsCount }}</strong> 人</span>
                  <span class="max-quota">/ 上限 {{ row.clientQuota }}</span>
                </div>
                <el-progress
                  :percentage="Math.min(100, Math.round((row.activeClientsCount / row.clientQuota) * 100))"
                  :color="row.activeClientsCount >= row.clientQuota ? '#e11d48' : '#c5a059'"
                  :show-text="false"
                  :stroke-width="6"
                />
              </div>
            </template>
          </el-table-column>

          <el-table-column label="结缘与满意度" width="140">
            <template #default="{ row }">
              <div class="reputation-cell">
                <span class="pair-text">成就 <strong>{{ row.successPairs }}</strong> 对</span>
                <div class="rating-text">
                  <el-icon color="#c5a059"><StarFilled /></el-icon>
                  <span>{{ row.csatRating }}</span>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="联系方式" width="150">
            <template #default="{ row }">
              <div class="contact-sub">
                <div>{{ row.phone }}</div>
                <div class="email-sub">{{ row.email }}</div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="管理操作" width="150" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button link type="primary" size="small" @click="handleOpenEditStaff(row)">
                  编辑档案
                </el-button>
                <el-button
                  v-if="row.status !== 'resigned'"
                  link
                  type="danger"
                  size="small"
                  @click="handleResignStaff(row)"
                >
                  交接离职
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 员工列表：名片阵列视图 -->
      <div v-else class="cards-grid-container">
        <div v-for="emp in filteredStaff" :key="emp.id" class="staff-profile-card">
          <div class="card-head">
            <img :src="emp.avatar" :alt="emp.name" class="card-avatar" />
            <div class="card-title-group">
              <div class="top-name-row">
                <h4>{{ emp.name }}</h4>
                <span class="role-badge" :class="emp.role">{{ emp.roleName }}</span>
              </div>
              <p class="work-title">{{ emp.title }} · 从业{{ emp.experienceYears }}年</p>
              <p class="store-label"><el-icon><OfficeBuilding /></el-icon> {{ emp.storeName }}</p>
            </div>
          </div>

          <div class="card-specialties">
            <span v-for="tag in emp.specialties" :key="tag" class="spec-chip">{{ tag }}</span>
          </div>

          <p class="card-philosophy">“{{ emp.philosophy }}”</p>

          <div class="card-metrics-grid">
            <div class="m-item">
              <span class="m-val">¥ {{ (emp.monthlySales / 10000).toFixed(1) }}w</span>
              <span class="m-lbl">本月创收</span>
            </div>
            <div class="m-item">
              <span class="m-val">{{ emp.activeClientsCount }}/{{ emp.clientQuota }}</span>
              <span class="m-lbl">客资负荷</span>
            </div>
            <div class="m-item">
              <span class="m-val">{{ emp.successPairs }} 对</span>
              <span class="m-lbl">成功牵线</span>
            </div>
            <div class="m-item">
              <span class="m-val gold">{{ emp.csatRating }}</span>
              <span class="m-lbl">好评得分</span>
            </div>
          </div>

          <div class="card-footer-btns">
            <button class="btn-edit" @click="handleOpenEditStaff(emp)">
              <el-icon><Edit /></el-icon> 编辑绩效与配额
            </button>
            <button
              v-if="emp.status !== 'resigned'"
              class="btn-resign"
              @click="handleResignStaff(emp)"
            >
              离职交接
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. TAB: 直营门店管理 -->
    <div v-else-if="activeTab === 'stores'" class="tab-content-pane">
      <div class="stores-layout-grid">
        <div v-for="st in stores" :key="st.id" class="store-flag-card">
          <div class="store-banner">
            <img :src="st.cover" :alt="st.name" class="store-img" />
            <div class="banner-overlay">
              <span class="store-badge">{{ st.city }}</span>
              <h3>{{ st.name }}</h3>
            </div>
          </div>

          <div class="store-detail-body">
            <div class="store-info-line">
              <el-icon><Location /></el-icon>
              <span>{{ st.address }}</span>
            </div>
            <div class="store-info-line">
              <el-icon><Phone /></el-icon>
              <span>{{ st.phone }}</span>
            </div>
            <div class="store-info-line">
              <el-icon><Avatar /></el-icon>
              <span>责任店长：<strong>{{ st.manager }}</strong></span>
            </div>

            <div class="store-stats-four">
              <div class="s-box">
                <span class="v">{{ st.teaRooms }} 间</span>
                <span class="k">中式私密茶室</span>
              </div>
              <div class="s-box">
                <span class="v">{{ st.staffCount }} 人</span>
                <span class="k">在职顾问团队</span>
              </div>
              <div class="s-box">
                <span class="v">{{ st.activeClients }} 位</span>
                <span class="k">在约会员</span>
              </div>
              <div class="s-box highlight">
                <span class="v">{{ st.monthlyRevenue }}</span>
                <span class="k">本月总创收</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. TAB: 员工排班与中式茶室值班表 -->
    <div v-else-if="activeTab === 'roster'" class="tab-content-pane">
      <div class="roster-card">
        <div class="roster-header">
          <div>
            <h3>全国直营门店茶室排班与红娘值班表</h3>
            <p class="sub">确保每周 7 天无缝轮班，高峰周末全员在岗，保障 18 间高端茶室满负荷约见</p>
          </div>
          <el-button type="primary" :icon="Download" @click="ElMessage.success('已导出本周茶室排班与值班通告！')">
            导出本周排班表
          </el-button>
        </div>

        <el-table :data="weeklySchedule" stripe style="width: 100%">
          <el-table-column prop="day" label="日期与时段" width="160">
            <template #default="{ row }">
              <strong :style="{ color: row.day.includes('高峰') ? '#9b1c2e' : '#1d1d1f' }">
                {{ row.day }}
              </strong>
            </template>
          </el-table-column>
          <el-table-column prop="dutyMatchmaker" label="值班红娘团队" min-width="180" />
          <el-table-column prop="dutyCounselor" label="心理与情感顾问" width="160" />
          <el-table-column prop="roomStatus" label="茶室预约负荷" width="180">
            <template #default="{ row }">
              <el-tag :type="row.roomStatus.includes('全部约满') ? 'danger' : 'success'" size="small">
                {{ row.roomStatus }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="note" label="重点业务事项" min-width="200" />
        </el-table>
      </div>
    </div>

    <!-- 4. TAB: RBAC 权限矩阵 -->
    <div v-else-if="activeTab === 'roles'" class="tab-content-pane">
      <div class="roles-card">
        <div class="roles-header">
          <h3>企业级多端数据隔离与 RBAC 角色访问控制策略</h3>
          <p class="sub">严格遵循《个人信息保护法》与婚恋行业隐私脱敏合规标准</p>
        </div>

        <el-table :data="rolePermissions" stripe style="width: 100%">
          <el-table-column prop="module" label="核心业务功能模块" min-width="200">
            <template #default="{ row }">
              <strong>{{ row.module }}</strong>
            </template>
          </el-table-column>
          <el-table-column prop="visitor" label="普通访客 (游客)" width="130" />
          <el-table-column prop="client" label="已认证会员 (C端)" width="140" />
          <el-table-column prop="matchmaker" label="金牌红娘 (B端)" width="160">
            <template #default="{ row }">
              <span class="role-text-matchmaker">{{ row.matchmaker }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="counselor" label="情感顾问 (B端)" width="160">
            <template #default="{ row }">
              <span class="role-text-counselor">{{ row.counselor }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="admin" label="总店长/管理员 (M端)" min-width="160">
            <template #default="{ row }">
              <el-tag type="danger" size="small">{{ row.admin }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 新增 / 编辑员工档案弹窗 -->
    <el-dialog
      v-model="staffDialogVisible"
      :title="isEditingStaff ? '编辑员工档案与绩效配额' : '录入新员工与红娘专家'"
      width="640px"
    >
      <el-form label-position="top" class="staff-edit-form">
        <div class="form-row-2">
          <el-form-item label="员工姓名 *" required>
            <el-input v-model="staffForm.name" placeholder="如：苏婉宁" />
          </el-form-item>
          <el-form-item label="性别">
            <el-radio-group v-model="staffForm.gender">
              <el-radio value="female">女性</el-radio>
              <el-radio value="male">男性</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="岗位角色 *" required>
            <el-select v-model="staffForm.role" style="width: 100%;">
              <el-option label="金牌红娘 (负责撮合与线下约见)" value="matchmaker" />
              <el-option label="情感顾问 (负责心理咨询与调解)" value="counselor" />
              <el-option label="客服主管 (负责接待与初筛)" value="receptionist" />
              <el-option label="店长/管理层 (全面统筹)" value="manager" />
            </el-select>
          </el-form-item>
          <el-form-item label="归属直营门店">
            <el-select v-model="staffForm.storeId" style="width: 100%;">
              <el-option label="上海静安旗舰店" value="store_sh_01" />
              <el-option label="上海新天地高级会所" value="store_sh_02" />
              <el-option label="杭州西湖私享体验馆" value="store_hz_01" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="对外专业职称">
            <el-input v-model="staffForm.title" placeholder="如：资深金牌婚恋规划师" />
          </el-form-item>
          <el-form-item label="从业年限 (年)">
            <el-input-number v-model="staffForm.experienceYears" :min="1" :max="30" style="width: 100%;" />
          </el-form-item>
        </div>

        <div class="form-row-2">
          <el-form-item label="联系电话 *" required>
            <el-input v-model="staffForm.phone" placeholder="11位手机号码" />
          </el-form-item>
          <el-form-item label="员工状态">
            <el-select v-model="staffForm.status" style="width: 100%;">
              <el-option label="在职正式" value="active" />
              <el-option label="试用期考核" value="probation" />
              <el-option label="休假中" value="leave" />
              <el-option label="已离职归档" value="resigned" />
            </el-select>
          </el-form-item>
        </div>

        <div class="form-divider-title">薪酬提成与线索配额控制</div>

        <div class="form-row-3">
          <el-form-item label="基本底薪 (元/月)">
            <el-input-number v-model="staffForm.baseSalary" :step="1000" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="成单提成比例 (%)">
            <el-input-number v-model="staffForm.commissionRate" :min="1" :max="50" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="线索配额上限 (人)">
            <el-input-number v-model="staffForm.clientQuota" :min="10" :max="200" style="width: 100%;" />
          </el-form-item>
        </div>

        <el-form-item label="擅长客群与专业标签 (逗号分隔)">
          <el-input v-model="staffForm.specialties" placeholder="如：体制内, 金融海归, 信任危机修复, 高净值家庭" />
        </el-form-item>

        <el-form-item label="专业服务理念名言">
          <el-input
            v-model="staffForm.philosophy"
            type="textarea"
            :rows="2"
            placeholder="展示于前台专家主页的一句话理念..."
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="staffDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveStaff">确认保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.org-manage-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 顶部标题与 Tab 栏 */
.org-top-header {
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-with-badge h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  font-family: "Noto Serif SC", "Songti SC", serif;
}

.org-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #2d7a6e;
  background: #eef7f5;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.header-desc {
  font-size: 13px;
  color: #86868b;
  margin-top: 4px;
}

.top-nav-tabs {
  display: flex;
  background: #f2f2f7;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
}

.nav-tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #636366;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-tab-btn:hover {
  color: #1d1d1f;
}

.nav-tab-btn.active {
  background: #ffffff;
  color: #9b1c2e;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* KPI 指标卡 */
.staff-kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-metric-card {
  background: #ffffff;
  padding: 18px 20px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
}

.metric-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-top .lbl {
  font-size: 12.5px;
  color: #86868b;
  font-weight: 500;
}

.metric-top .icon {
  font-size: 18px;
}

.metric-val {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.metric-val .num {
  font-size: 26px;
  font-weight: 700;
  color: #1d1d1f;
  font-family: "Noto Serif SC", serif;
}

.metric-val .num.gold {
  color: #c5a059;
}

.metric-val .num.ruby {
  color: #9b1c2e;
}

.metric-val .num.green {
  color: #2d7a6e;
}

.metric-val .unit {
  font-size: 13px;
  color: #86868b;
}

.metric-sub {
  font-size: 11.5px;
  color: #a1a1a6;
}

/* 过滤与操作栏 */
.action-filter-card {
  background: #ffffff;
  padding: 14px 20px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 表格卡片 */
.table-container-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 16px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
}

.employee-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid #e5e5ea;
}

.cell-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name-line {
  display: flex;
  align-items: center;
  gap: 6px;
}

.emp-name {
  font-size: 14px;
  color: #1d1d1f;
}

.emp-workno {
  font-size: 11px;
  color: #86868b;
  background: #f2f2f7;
  padding: 1px 5px;
  border-radius: 4px;
}

.emp-title-sub {
  font-size: 12px;
  color: #636366;
}

.store-role-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.role-pill {
  display: inline-block;
  width: fit-content;
  font-size: 11px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: 6px;
}

.role-pill.matchmaker {
  background: #fdf2f4;
  color: #9b1c2e;
  border: 1px solid rgba(155, 28, 46, 0.2);
}

.role-pill.counselor {
  background: #eef7f5;
  color: #2d7a6e;
  border: 1px solid rgba(45, 122, 110, 0.3);
}

.role-pill.receptionist {
  background: #eef2ff;
  color: #4f46e5;
  border: 1px solid rgba(79, 70, 229, 0.2);
}

.role-pill.manager {
  background: #fcf8ee;
  color: #8c6a2b;
  border: 1px solid rgba(197, 160, 89, 0.3);
}

.store-text {
  font-size: 12px;
  color: #86868b;
}

.sales-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.sales-num {
  font-size: 14px;
  font-weight: 700;
  color: #9b1c2e;
  font-family: "Noto Serif SC", serif;
}

.commission-sub {
  font-size: 11px;
  color: #86868b;
}

.quota-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quota-text {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #1d1d1f;
}

.max-quota {
  color: #86868b;
  font-size: 11px;
}

.reputation-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.rating-text {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #8c6a2b;
  font-weight: 600;
}

.contact-sub {
  font-size: 12px;
  color: #1d1d1f;
}

.email-sub {
  font-size: 11px;
  color: #86868b;
}

/* 卡片阵列视图 */
.cards-grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.staff-profile-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
  transition: all 0.25s ease;
}

.staff-profile-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  border-color: rgba(155, 28, 46, 0.2);
}

.card-head {
  display: flex;
  gap: 14px;
  align-items: center;
}

.card-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5c382;
}

.card-title-group {
  flex: 1;
}

.top-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-name-row h4 {
  font-size: 16px;
  color: #1d1d1f;
  font-weight: 600;
}

.work-title {
  font-size: 12px;
  color: #636366;
  margin-top: 2px;
}

.store-label {
  font-size: 11.5px;
  color: #86868b;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}

.card-specialties {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.spec-chip {
  background: #f2f2f7;
  color: #636366;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 6px;
}

.card-philosophy {
  font-size: 12px;
  color: #48484a;
  font-style: italic;
  line-height: 1.5;
  background: #fafafc;
  padding: 8px 10px;
  border-radius: 8px;
  border-left: 2px solid #c5a059;
}

.card-metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: #f7f8fa;
  padding: 10px;
  border-radius: 10px;
  text-align: center;
}

.m-item .m-val {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #1d1d1f;
}

.m-item .m-val.gold {
  color: #c5a059;
}

.m-item .m-lbl {
  font-size: 10px;
  color: #86868b;
}

.card-footer-btns {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid #f2f2f7;
}

.btn-edit {
  flex: 1;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e5e5ea;
  background: #ffffff;
  color: #1d1d1f;
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-edit:hover {
  background: #fdf2f4;
  border-color: #9b1c2e;
  color: #9b1c2e;
}

.btn-resign {
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #e11d48;
  font-size: 12px;
  cursor: pointer;
}

.btn-resign:hover {
  background: #fee2e2;
}

/* 门店网格 */
.stores-layout-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.store-flag-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
}

.store-banner {
  height: 180px;
  position: relative;
}

.store-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, transparent 60%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  color: #ffffff;
}

.store-badge {
  font-size: 11px;
  background: #c5a059;
  padding: 2px 8px;
  border-radius: 4px;
  width: fit-content;
  margin-bottom: 4px;
}

.banner-overlay h3 {
  font-size: 18px;
  font-weight: 700;
  font-family: "Noto Serif SC", serif;
}

.store-detail-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.store-info-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #636366;
}

.store-stats-four {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: #f7f8fa;
  padding: 12px 8px;
  border-radius: 10px;
  text-align: center;
  margin-top: 6px;
}

.s-box .v {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #1d1d1f;
}

.s-box .k {
  font-size: 10px;
  color: #86868b;
}

.s-box.highlight .v {
  color: #9b1c2e;
}

/* 排班与RBAC卡片 */
.roster-card, .roles-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 20px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.02);
}

.roster-header, .roles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.roster-header h3, .roles-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1d1d1f;
}

.roster-header .sub, .roles-header .sub {
  font-size: 12px;
  color: #86868b;
  margin-top: 2px;
}

.role-text-matchmaker {
  color: #9b1c2e;
  font-weight: 600;
  font-size: 12px;
}

.role-text-counselor {
  color: #2d7a6e;
  font-weight: 600;
  font-size: 12px;
}

/* 弹窗表单 */
.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-row-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.form-divider-title {
  font-size: 13px;
  font-weight: 700;
  color: #9b1c2e;
  margin: 12px 0 8px 0;
  padding-bottom: 4px;
  border-bottom: 1px dashed #e5e5ea;
}
</style>
