<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStateStore } from '@/stores/appState'
import type { UserRole } from '@/types'
import {
  User,
  Avatar,
  Service,
  House,
  Tools,
  Document,
  Switch,
  ChatDotRound
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStateStore()

const rolesList: { role: UserRole; name: string; tag: string; path: string }[] = [
  { role: 'visitor', name: '访客视角', tag: '普通浏览', path: '/' },
  { role: 'client', name: '林书雅 (注册会员)', tag: 'C端个人中心', path: '/user/center' },
  { role: 'matchmaker', name: '苏婉宁 (金牌红娘)', tag: 'B端红娘台', path: '/workbench/matchmaker' },
  { role: 'counselor', name: '沈清墨 (情感顾问)', tag: 'B端顾问台', path: '/workbench/counselor' },
  { role: 'receptionist', name: '李晓萌 (客服主管)', tag: 'B端接待台', path: '/workbench/reception' },
  { role: 'admin', name: '张总 (超级管理员)', tag: 'M端数据大盘', path: '/admin/dashboard' }
]

function onSelectRole(roleItem: typeof rolesList[0]) {
  appStore.switchRole(roleItem.role)
  // 无论当前在哪个页面，点击角色立即跳转到对应角色的专属界面体验
  router.push(roleItem.path)
}

const currentTermLabel = computed(() => {
  if (route.path.startsWith('/admin')) return '管理后台 (M端)'
  if (route.path.startsWith('/workbench')) return '员工工作台 (B端)'
  return '用户前台门户 (C端)'
})
</script>

<template>
  <div class="prototype-top-bar">
    <div class="bar-left">
      <div class="badge-proto">
        <span class="pulse-dot"></span>
        <span>可交互原型演示环境</span>
      </div>
      <div class="current-term">
        当前视图：<strong>{{ currentTermLabel }}</strong>
      </div>
    </div>

    <!-- 快捷端路由切换 -->
    <div class="quick-navs">
      <RouterLink
        to="/"
        class="nav-pill-btn"
        :class="{ active: !route.path.startsWith('/workbench') && !route.path.startsWith('/admin') }"
      >
        <el-icon><House /></el-icon>
        用户前台
      </RouterLink>
      <RouterLink
        to="/workbench/matchmaker"
        class="nav-pill-btn"
        :class="{ active: route.path.startsWith('/workbench') }"
      >
        <el-icon><Service /></el-icon>
        员工工作台
      </RouterLink>
      <RouterLink
        to="/admin/dashboard"
        class="nav-pill-btn"
        :class="{ active: route.path.startsWith('/admin') }"
      >
        <el-icon><Tools /></el-icon>
        管理后台
      </RouterLink>
    </div>

    <!-- 演示身份无缝切换器 -->
    <div class="role-switcher-wrap">
      <span class="label">模拟身份：</span>
      <el-dropdown trigger="click">
        <div class="current-role-card">
          <img :src="appStore.currentUser.avatar" class="role-avatar" />
          <div class="role-info">
            <span class="name">{{ appStore.currentUser.name }}</span>
            <span class="tag">{{ appStore.currentUser.roleName }}</span>
          </div>
          <el-icon class="icon-down"><Switch /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="role-dropdown-menu">
            <div class="menu-header">点击即时切换不同角色体验全链路闭环：</div>
            <el-dropdown-item
              v-for="r in rolesList"
              :key="r.role"
              :class="{ 'is-active': appStore.currentRole === r.role }"
              @click="onSelectRole(r)"
            >
              <div class="role-menu-item">
                <span class="role-item-name">{{ r.name }}</span>
                <span class="role-item-tag">{{ r.tag }}</span>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.prototype-top-bar {
  height: 48px;
  background: #1C1917;
  color: #E7E5E4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 13px;
  z-index: 99999;
  position: sticky;
  top: 0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.4);
  border-bottom: 1px solid #44403C;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.badge-proto {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(201, 75, 98, 0.2);
  color: #F3B5C1;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(201, 75, 98, 0.4);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  background-color: #22C55E;
  border-radius: 50%;
  box-shadow: 0 0 8px #22C55E;
}

.current-term strong {
  color: #FDF2F4;
  font-weight: 600;
}

.quick-navs {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #292524;
  padding: 3px;
  border-radius: 8px;
}

.nav-pill-btn {
  border: none;
  background: transparent;
  color: #A8A29E;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  white-space: nowrap;
}

.nav-pill-btn:hover {
  color: #FFF;
}

.nav-pill-btn.active {
  background: #C94B62;
  color: #FFF;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(201, 75, 98, 0.4);
}

.role-switcher-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: #A8A29E;
  font-size: 12px;
}

.current-role-card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #292524;
  padding: 3px 10px 3px 6px;
  border-radius: 20px;
  cursor: pointer;
  border: 1px solid #44403C;
  transition: all 0.2s;
}

.current-role-card:hover {
  background: #383330;
  border-color: #C94B62;
}

.role-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.role-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.role-info .name {
  color: #F5F5F4;
  font-size: 12px;
  font-weight: 500;
}

.role-info .tag {
  font-size: 10px;
  background: rgba(194, 147, 83, 0.2);
  color: #E5C38D;
  padding: 1px 6px;
  border-radius: 4px;
}

.icon-down {
  color: #A8A29E;
  font-size: 12px;
}

.role-dropdown-menu {
  min-width: 260px;
}

.menu-header {
  padding: 8px 16px;
  font-size: 12px;
  color: #78716C;
  border-bottom: 1px solid #F5F5F4;
}

.role-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0;
}

.role-item-name {
  font-size: 13px;
  color: #292524;
}

.role-item-tag {
  font-size: 11px;
  color: #C94B62;
  background: #FDF2F4;
  padding: 2px 6px;
  border-radius: 4px;
}

.is-active .role-item-name {
  font-weight: bold;
  color: #C94B62;
}
</style>
