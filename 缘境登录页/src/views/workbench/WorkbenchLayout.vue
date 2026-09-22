<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStateStore } from '@/stores/appState'
import {
  ChatDotRound,
  User,
  FirstAidKit,
  Bell,
  Switch,
  Location,
  Clock,
  ArrowRight,
  Avatar
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStateStore()

const currentPath = computed(() => route.path)

const workbenchNavs = [
  {
    name: '客服接待台',
    path: '/workbench/reception',
    icon: ChatDotRound,
    badge: computed(() => appStore.chatSessions.filter((s) => s.unreadCount > 0).length),
    roleReq: 'receptionist'
  },
  {
    name: '红娘工作台',
    path: '/workbench/matchmaker',
    icon: User,
    badge: computed(() => appStore.leads.filter((l) => l.handlerRole === 'matchmaker' && l.status === 'following').length),
    roleReq: 'matchmaker'
  },
  {
    name: '情感顾问台',
    path: '/workbench/counselor',
    icon: FirstAidKit,
    badge: computed(() => appStore.counselingCases.filter((c) => c.status === 'in_progress').length),
    roleReq: 'counselor'
  }
]
</script>

<template>
  <div class="workbench-layout">
    <!-- 侧边导航栏 -->
    <aside class="wb-sidebar">
      <div class="wb-brand">
        <span class="wb-logo-mark">🏮</span>
        <div class="wb-brand-text">
          <h2>阿拉小红娘 · 员工工作台</h2>
          <span class="wb-sub">STAFF WORKBENCH</span>
        </div>
      </div>

      <!-- 当前登录员工卡片 -->
      <div class="wb-staff-badge">
        <div class="wb-avatar-wrap">
          <img :src="appStore.currentUser.avatar" class="staff-head" />
          <span class="online-indicator"></span>
        </div>
        <div class="wb-staff-meta">
          <strong>{{ appStore.currentUser.name }}</strong>
          <span class="staff-role-pill">{{ appStore.currentUser.roleName }}</span>
        </div>
      </div>

      <!-- 导航列表 -->
      <nav class="wb-nav-list">
        <router-link
          v-for="nav in workbenchNavs"
          :key="nav.path"
          :to="nav.path"
          class="wb-nav-item"
          :class="{ active: currentPath.startsWith(nav.path) }"
        >
          <div class="nav-left">
            <el-icon class="nav-icon"><component :is="nav.icon" /></el-icon>
            <span>{{ nav.name }}</span>
          </div>
          <span v-if="nav.badge.value > 0" class="nav-badge-pill">
            {{ nav.badge.value }}
          </span>
        </router-link>
      </nav>

      <!-- 底部快捷操作 -->
      <div class="wb-sidebar-bottom">
        <div class="store-badge">
          <el-icon><Location /></el-icon>
          <span>上海静安旗舰店 · 营业中</span>
        </div>
        <button class="btn-switch-client" @click="router.push('/')">
          <span>返回前台门户</span>
          <el-icon><ArrowRight /></el-icon>
        </button>
      </div>
    </aside>

    <!-- 右侧工作台主体容器 -->
    <main class="wb-main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.workbench-layout {
  display: flex;
  min-height: calc(100vh - 44px);
  background: #f4f6f9;
}

/* 侧边导航 */
.wb-sidebar {
  width: 250px;
  background: #ffffff;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.02);
}

.wb-brand {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.wb-logo-mark {
  font-size: 26px;
}
.wb-brand-text h2 {
  font-size: 16px;
  color: var(--color-ink);
  font-family: var(--font-song), serif;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.wb-sub {
  font-size: 9px;
  color: var(--color-gold);
  font-weight: 700;
  letter-spacing: 1px;
}

.wb-staff-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px;
  margin: 16px 14px;
  background: #fbf9f8;
  border-radius: 12px;
  border: 1px solid rgba(201, 75, 98, 0.12);
}
.wb-avatar-wrap {
  position: relative;
}
.staff-head {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffffff;
}
.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: #27ae60;
  border: 2px solid #ffffff;
  border-radius: 50%;
}
.wb-staff-meta strong {
  display: block;
  font-size: 14px;
  color: var(--color-ink);
}
.staff-role-pill {
  display: inline-block;
  font-size: 11px;
  color: var(--color-crimson);
  background: rgba(201, 75, 98, 0.1);
  padding: 2px 8px;
  border-radius: 6px;
  margin-top: 4px;
  font-weight: 600;
}

.wb-nav-list {
  flex: 1;
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.wb-nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 10px;
  color: var(--color-ink-muted);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}
.wb-nav-item:hover {
  background: #f5f5f5;
  color: var(--color-ink);
}
.wb-nav-item.active {
  background: rgba(201, 75, 98, 0.09);
  color: var(--color-crimson);
  font-weight: 700;
}
.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.nav-icon {
  font-size: 18px;
}
.nav-badge-pill {
  background: var(--color-crimson);
  color: #ffffff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 700;
}

.wb-sidebar-bottom {
  padding: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.store-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-ink-muted);
  margin-bottom: 12px;
}
.btn-switch-client {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 9px 14px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  font-size: 12px;
  color: var(--color-ink);
  cursor: pointer;
  transition: all 0.2s;
}
.btn-switch-client:hover {
  border-color: var(--color-crimson);
  color: var(--color-crimson);
}

/* 主内容 */
.wb-main-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
</style>
