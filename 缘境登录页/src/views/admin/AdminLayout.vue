<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStateStore } from '@/stores/appState'
import {
  DataAnalysis,
  Tickets,
  OfficeBuilding,
  DocumentChecked,
  User,
  Setting,
  ArrowRight,
  Location,
  Collection
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStateStore()

const currentPath = computed(() => route.path)

const adminNavs = [
  {
    name: '经营数据大盘',
    path: '/admin/dashboard',
    icon: DataAnalysis
  },
  {
    name: '全生命周期线索',
    path: '/admin/leads',
    icon: Tickets
  },
  {
    name: '组织架构与门店',
    path: '/admin/organization',
    icon: OfficeBuilding
  },
  {
    name: '服务记录与调解档案',
    path: '/admin/records',
    icon: Collection
  },
  {
    name: '内容与脱敏审核',
    path: '/admin/content',
    icon: DocumentChecked
  }
]
</script>

<template>
  <div class="admin-layout">
    <!-- 侧边导航栏 -->
    <aside class="admin-sidebar">
      <div class="admin-brand">
        <span class="logo-icon">🏮</span>
        <div class="brand-text">
          <h2>阿拉小红娘 · 管理决策后台</h2>
          <span class="sub">MANAGEMENT ADMIN</span>
        </div>
      </div>

      <!-- 当前登录管理者 -->
      <div class="admin-user-card">
        <img :src="appStore.currentUser.avatar" class="admin-head" />
        <div class="meta">
          <strong>{{ appStore.currentUser.name }}</strong>
          <span class="role-pill">{{ appStore.currentUser.roleName }}</span>
        </div>
      </div>

      <!-- 菜单 -->
      <nav class="admin-nav-list">
        <router-link
          v-for="nav in adminNavs"
          :key="nav.path"
          :to="nav.path"
          class="admin-nav-item"
          :class="{ active: currentPath.startsWith(nav.path) }"
        >
          <el-icon class="nav-icon"><component :is="nav.icon" /></el-icon>
          <span>{{ nav.name }}</span>
        </router-link>
      </nav>

      <!-- 底部跳转 -->
      <div class="admin-sidebar-bottom">
        <button class="btn-goto-portal" @click="router.push('/')">
          <span>前台门户</span>
          <el-icon><ArrowRight /></el-icon>
        </button>
        <button class="btn-goto-wb" @click="router.push('/workbench/matchmaker')">
          <span>员工工作台</span>
          <el-icon><ArrowRight /></el-icon>
        </button>
      </div>
    </aside>

    <!-- 右侧管理主屏 -->
    <main class="admin-main-pane">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: calc(100vh - 44px);
  background: #f0f2f5;
}

.admin-sidebar {
  width: 250px;
  background: #1a1e28;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.admin-brand {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.logo-icon {
  font-size: 26px;
}
.brand-text h2 {
  font-size: 15px;
  color: #ffffff;
  font-weight: 700;
  font-family: var(--font-song), serif;
}
.sub {
  font-size: 9px;
  color: var(--color-gold);
  letter-spacing: 1px;
  font-weight: 700;
}

.admin-user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.04);
  margin: 14px;
  border-radius: 10px;
}
.admin-head {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.meta strong {
  display: block;
  font-size: 13px;
  color: #ffffff;
}
.role-pill {
  font-size: 10px;
  background: rgba(194, 147, 83, 0.2);
  color: var(--color-gold);
  padding: 1px 6px;
  border-radius: 4px;
}

.admin-nav-list {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #a0aec0;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}
.admin-nav-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
}
.admin-nav-item.active {
  background: var(--color-crimson);
  color: #ffffff;
  font-weight: 600;
}
.nav-icon {
  font-size: 18px;
}

.admin-sidebar-bottom {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.btn-goto-portal, .btn-goto-wb {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e0;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-goto-portal:hover, .btn-goto-wb:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.admin-main-pane {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>
