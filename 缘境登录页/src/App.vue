<script setup lang="ts">
import PrototypeTopBar from '@/components/PrototypeTopBar.vue'
</script>

<template>
  <div class="app-root">
    <!-- 全局原型控制条 -->
    <PrototypeTopBar />
    <!-- 页面主体路由视图 -->
    <div class="app-main-viewport">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-base);
}

.app-main-viewport {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>
