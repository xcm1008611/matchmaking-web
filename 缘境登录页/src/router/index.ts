import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // 登录页
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '账号登录' }
    },
    // 用户前台（C端）
    {
      path: '/',
      component: () => import('@/views/client/ClientLayout.vue'),
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/client/Home.vue'),
          meta: { title: '首页 · 阿拉小红娘高端婚恋与情感咨询' }
        },
        {
          path: 'services/match',
          name: 'MatchService',
          component: () => import('@/views/client/MatchService.vue'),
          meta: { title: '婚恋介绍服务 · 一对一专属牵线' }
        },
        {
          path: 'services/counseling',
          name: 'CounselingService',
          component: () => import('@/views/client/CounselingService.vue'),
          meta: { title: '情感调解专区 · 亲密关系改善' }
        },
        {
          path: 'members',
          name: 'Members',
          component: () => import('@/views/client/Members.vue'),
          meta: { title: '严选会员 · 脱敏资料大厅' }
        },
        {
          path: 'staff',
          name: 'StaffTeam',
          component: () => import('@/views/client/StaffTeam.vue'),
          meta: { title: '红娘与顾问团队' }
        },
        {
          path: 'cases',
          name: 'StoryCases',
          component: () => import('@/views/client/StoryCases.vue'),
          meta: { title: '幸福牵线与调解案例' }
        },
        {
          path: 'user/center',
          name: 'UserCenter',
          component: () => import('@/views/client/UserCenter.vue'),
          meta: { title: '会员个人中心 · 资料与进度' }
        }
      ]
    },
    // 员工工作台（B端）
    {
      path: '/workbench',
      component: () => import('@/views/workbench/WorkbenchLayout.vue'),
      children: [
        {
          path: 'reception',
          name: 'WorkbenchReception',
          component: () => import('@/views/workbench/ReceptionDesk.vue'),
          meta: { title: '客服接待台 · 在线会话与线索分流' }
        },
        {
          path: 'matchmaker',
          name: 'WorkbenchMatchmaker',
          component: () => import('@/views/workbench/MatchmakerDesk.vue'),
          meta: { title: '红娘工作台 · 客户档案与人选匹配' }
        },
        {
          path: 'counselor',
          name: 'WorkbenchCounselor',
          component: () => import('@/views/workbench/CounselorDesk.vue'),
          meta: { title: '情感顾问台 · 个案调解与排期' }
        }
      ]
    },
    // 管理后台（M端）
    {
      path: '/admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
          meta: { title: '经营数据大盘 · 转化漏斗' }
        },
        {
          path: 'leads',
          name: 'AdminLeads',
          component: () => import('@/views/admin/LeadsManage.vue'),
          meta: { title: '全生命周期线索与客户' }
        },
        {
          path: 'organization',
          name: 'AdminOrg',
          component: () => import('@/views/admin/OrgManage.vue'),
          meta: { title: '门店与员工组织架构' }
        },
        {
          path: 'records',
          name: 'AdminServiceRecords',
          component: () => import('@/views/admin/ServiceRecordsManage.vue'),
          meta: { title: '服务记录与调解档案监管' }
        },
        {
          path: 'content',
          name: 'AdminContent',
          component: () => import('@/views/admin/ContentManage.vue'),
          meta: { title: '网站内容与脱敏审核' }
        }
      ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.afterEach((to) => {
  document.title = (to.meta.title as string) || '阿拉小红娘 · 婚恋相亲服务平台'
})

export default router
