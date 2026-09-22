<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppStateStore } from '@/stores/appState'
import {
  ChatDotRound,
  Phone,
  Location,
  User,
  Calendar,
  Close,
  Promotion,
  ArrowRight,
  Service
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const appStore = useAppStateStore()

// 预约弹窗
const appointmentModalVisible = ref(false)
const appointmentForm = ref({
  name: '',
  phone: '',
  serviceType: 'match' as 'match' | 'counseling' | 'consult',
  storeName: '上海静安旗舰店',
  date: '2026-02-22',
  timeSlot: '14:00 - 16:00',
  notes: ''
})

function openAppointment(type: 'match' | 'counseling' | 'consult' = 'match') {
  appointmentForm.value.serviceType = type
  if (appStore.currentUser.role === 'client') {
    appointmentForm.value.name = appStore.currentUser.name
    appointmentForm.value.phone = '13812346821'
  }
  appointmentModalVisible.value = true
}

function handleConfirmAppointment() {
  if (!appointmentForm.value.name || !appointmentForm.value.phone) {
    ElMessage.warning('请填写您的称呼与联系电话')
    return
  }
  appStore.submitAppointment({
    ...appointmentForm.value
  })
  appointmentModalVisible.value = false
}

// 在线客服浮窗输入
const chatInputText = ref('')
const currentSession = computed(() => appStore.chatSessions[0])

function sendUserMsg() {
  if (!chatInputText.value.trim()) return
  appStore.sendChatMessage(currentSession.value.id, chatInputText.value.trim(), 'user')
  chatInputText.value = ''
  
  // 模拟客服3秒后自动回复
  setTimeout(() => {
    appStore.sendChatMessage(
      currentSession.value.id,
      '您好！已收到您的咨询。我们的专属顾问苏老师正在为您调取匹配信息，稍后将通过电话或在线会话与您详聊。',
      'agent'
    )
  }, 2000)
}
</script>

<template>
  <div class="client-portal-wrapper">
    <!-- 东方雅致顶栏 Header -->
    <header class="portal-header">
      <div class="header-inner">
        <!-- Logo -->
        <div class="brand-logo" @click="router.push('/')">
          <div class="seal-badge">红</div>
          <div class="brand-text">
            <span class="main-title">阿拉小红娘</span>
            <span class="sub-title">高端婚恋 · 情感咨询</span>
          </div>
        </div>

        <!-- 导航链接 -->
        <nav class="nav-links">
          <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">首页</router-link>
          <router-link to="/services/match" class="nav-item" :class="{ active: route.path === '/services/match' }">婚恋介绍</router-link>
          <router-link to="/services/counseling" class="nav-item" :class="{ active: route.path === '/services/counseling' }">情感调解</router-link>
          <router-link to="/members" class="nav-item" :class="{ active: route.path === '/members' }">严选会员</router-link>
          <router-link to="/staff" class="nav-item" :class="{ active: route.path === '/staff' }">红娘顾问</router-link>
          <router-link to="/cases" class="nav-item" :class="{ active: route.path === '/cases' }">幸福案例</router-link>
        </nav>

        <!-- 快捷操作区 -->
        <div class="header-actions">
          <el-button class="btn-appoint" @click="openAppointment('match')">
            <el-icon><Calendar /></el-icon>
            预约到店体验
          </el-button>

          <template v-if="appStore.currentUser.role === 'visitor'">
            <el-button class="btn-login" text @click="router.push('/login')">
              登录 / 注册
            </el-button>
          </template>
          <template v-else>
            <div class="user-pill" @click="router.push('/user/center')">
              <img :src="appStore.currentUser.avatar" class="user-avatar" />
              <span class="user-name">{{ appStore.currentUser.name }}</span>
            </div>
          </template>
        </div>
      </div>
    </header>

    <!-- 页面内容路由插槽 -->
    <main class="portal-main-body">
      <router-view />
    </main>

    <!-- 东方温润页脚 Footer -->
    <footer class="portal-footer">
      <div class="footer-inner">
        <div class="footer-col brand-col">
          <div class="brand-logo footer-logo">
            <div class="seal-badge">红</div>
            <div class="brand-text">
              <span class="main-title">阿拉小红娘</span>
              <span class="sub-title">东方雅致 · 终生之约</span>
            </div>
          </div>
          <p class="slogan">
            执子之手，与子偕老。以东方美学智慧与现代心理学，为每一位追寻幸福的灵魂构建高品质相遇桥梁。
          </p>
          <div class="contact-line">
            <el-icon><Phone /></el-icon>
            <span>贵宾专属热线：400-820-5200 (09:00 - 21:00)</span>
          </div>
        </div>

        <div class="footer-col">
          <h4>婚恋介绍服务</h4>
          <ul>
            <li><router-link to="/services/match">一对一定制牵线</router-link></li>
            <li><router-link to="/members">海归与名校专区</router-link></li>
            <li><router-link to="/members">高知高管精英库</router-link></li>
            <li><router-link to="/services/match">隐私保护与背调说明</router-link></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>情感调解专区</h4>
          <ul>
            <li><router-link to="/services/counseling">婚前评估与迷茫梳理</router-link></li>
            <li><router-link to="/services/counseling">夫妻沟通与冷战化解</router-link></li>
            <li><router-link to="/services/counseling">家庭界限与婆媳关系</router-link></li>
            <li><router-link to="/staff">心理咨询师资质公示</router-link></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>直营旗舰门店</h4>
          <ul>
            <li><strong>上海静安旗舰店：</strong>南京西路1788号静安中心28F</li>
            <li><strong>上海浦东中心店：</strong>世纪大道88号金茂大厦16F</li>
            <li><strong>北京国贸会馆：</strong>朝阳区建国门外大街1号</li>
            <li><strong>杭州西湖公馆：</strong>西湖区南山路清波门8号</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 阿拉小红娘婚恋服务有限公司 · 沪ICP备20260218号-1 · 婚恋中介服务规范认证企业</p>
      </div>
    </footer>

    <!-- 右下角常驻悬浮挂件：在线客服 / 预约入口 -->
    <div class="floating-widget-group">
      <div class="float-btn chat-trigger" @click="appStore.isChatDrawerOpen = !appStore.isChatDrawerOpen">
        <el-icon><ChatDotRound /></el-icon>
        <span class="badge-num" v-if="currentSession.unreadCount > 0">{{ currentSession.unreadCount }}</span>
        <span class="text">在线咨询</span>
      </div>
      <div class="float-btn appoint-trigger" @click="openAppointment('match')">
        <el-icon><Calendar /></el-icon>
        <span class="text">预约红娘</span>
      </div>
    </div>

    <!-- 侧边抽屉式在线咨询客服浮窗 -->
    <el-drawer
      v-model="appStore.isChatDrawerOpen"
      title="阿拉小红娘专属在线客服"
      direction="rtl"
      size="380px"
      :with-header="false"
      custom-class="portal-chat-drawer"
    >
      <div class="chat-drawer-container">
        <!-- 抽屉顶栏 -->
        <div class="chat-drawer-header">
          <div class="agent-profile">
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80" class="agent-avatar" />
            <div class="agent-info">
              <div class="name">李晓萌 · 客服主管</div>
              <div class="status"><span class="dot"></span> 热情在线，平均30秒内响应</div>
            </div>
          </div>
          <el-icon class="close-icon" @click="appStore.isChatDrawerOpen = false"><Close /></el-icon>
        </div>

        <!-- 快捷场景标签 -->
        <div class="quick-category-tags">
          <span
            v-for="cat in ['找对象', '红娘服务', '费用咨询', '预约到店', '情感调解']"
            :key="cat"
            class="cat-chip"
            :class="{ active: appStore.clientActiveChatCategory === cat }"
            @click="appStore.clientActiveChatCategory = cat"
          >
            {{ cat }}
          </span>
        </div>

        <!-- 消息列表 -->
        <div class="chat-messages-area">
          <div
            v-for="msg in currentSession.messages"
            :key="msg.id"
            class="message-row"
            :class="msg.sender"
          >
            <div class="bubble-wrap">
              <div class="sender-label" v-if="msg.sender !== 'user'">{{ msg.senderName }} · {{ msg.time }}</div>
              <div class="bubble-content">{{ msg.content }}</div>
            </div>
          </div>
        </div>

        <!-- 底部输入栏 -->
        <div class="chat-input-bar">
          <input
            v-model="chatInputText"
            placeholder="输入您想咨询的问题或择偶期望..."
            @keyup.enter="sendUserMsg"
          />
          <el-button type="primary" class="send-btn" @click="sendUserMsg">
            <el-icon><Promotion /></el-icon>
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 预约到店弹窗 Modal -->
    <el-dialog
      v-model="appointmentModalVisible"
      title="预约一对一专属私密面谈"
      width="540px"
      custom-class="appointment-dialog"
      destroy-on-close
    >
      <div class="appoint-intro">
        <div class="seal-badge small">礼</div>
        <p>我们承诺为您安排独立茶室包厢，专属资深红娘全程一对一沟通，严格保障隐私。</p>
      </div>

      <el-form label-position="top" :model="appointmentForm" class="appoint-form">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="您的称呼" required>
              <el-input v-model="appointmentForm.name" placeholder="如：林女士 / 张先生" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" required>
              <el-input v-model="appointmentForm.phone" placeholder="用于接收预约短信确认" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="期望咨询服务类型">
          <el-radio-group v-model="appointmentForm.serviceType">
            <el-radio-button value="match">一对一定制婚恋牵线</el-radio-button>
            <el-radio-button value="counseling">情感关系调解与咨询</el-radio-button>
            <el-radio-button value="consult">到店考察与会员评估</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="意向门店">
              <el-select v-model="appointmentForm.storeName" style="width: 100%">
                <el-option label="上海静安旗舰店（静安中心28F）" value="上海静安旗舰店" />
                <el-option label="上海浦东中心店（金茂大厦16F）" value="上海浦东中心店" />
                <el-option label="北京国贸会馆" value="北京国贸会馆" />
                <el-option label="杭州西湖公馆" value="杭州西湖公馆" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预约时段">
              <el-select v-model="appointmentForm.timeSlot" style="width: 100%">
                <el-option label="上午 10:00 - 12:00" value="10:00 - 12:00" />
                <el-option label="下午 14:00 - 16:00 (推荐)" value="14:00 - 16:00" />
                <el-option label="傍晚 16:30 - 18:30" value="16:30 - 18:30" />
                <el-option label="晚上 19:00 - 20:30" value="19:00 - 20:30" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="主要期望与备注（选填）">
          <el-input
            v-model="appointmentForm.notes"
            type="textarea"
            :rows="2"
            placeholder="例如：期望寻找30-35岁海归男士 / 想要咨询婚前沟通问题等"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="appointmentModalVisible = false">取消</el-button>
          <el-button type="primary" class="confirm-btn" @click="handleConfirmAppointment">
            立即确认预约
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.client-portal-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-base);
}

/* 顶部导航 Header */
.portal-header {
  position: sticky;
  top: 48px; /* 留出可交互原型全局顶部条高度 */
  z-index: 1000;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border-light);
  box-shadow: 0 2px 12px rgba(90, 50, 60, 0.03);
}

.header-inner {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-text .main-title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: bold;
  color: #27222B;
  letter-spacing: 1.5px;
  white-space: nowrap;
}

.brand-text .sub-title {
  font-size: 10px;
  color: var(--color-accent-gold);
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-item {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-regular);
  padding: 6px 0 9px;
  transition: color 0.25s var(--ease-apple) !important;
}

.nav-item:hover,
.nav-item.active {
  color: var(--color-primary);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  z-index: 0;
  pointer-events: none;
  bottom: 2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--color-primary);
  border-radius: 2px;
}

.nav-item {
  text-shadow: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.btn-appoint {
  background: linear-gradient(135deg, #C94B62, #B33D53);
  color: #FFF;
  border: none;
  padding: 8px 18px;
  border-radius: var(--radius-full);
  font-weight: 500;
  box-shadow: 0 3px 10px rgba(201, 75, 98, 0.3);
}

.btn-appoint:hover {
  background: linear-gradient(135deg, #D96076, #C94B62);
  color: #FFF;
}

.btn-login {
  color: var(--color-text-regular);
  font-weight: 500;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-primary-light);
  padding: 4px 12px 4px 6px;
  border-radius: var(--radius-full);
  cursor: pointer;
  border: 1px solid rgba(201, 75, 98, 0.2);
  transition: all 0.2s;
}

.user-pill:hover {
  background: #FCE8EC;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary-active);
}

.portal-main-body {
  flex: 1;
}

/* 页脚 Footer */
.portal-footer {
  background: #201D24;
  color: #D6D0DB;
  padding: 60px 0 24px;
  margin-top: 60px;
  border-top: 3px solid var(--color-accent-gold);
}

.footer-inner {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 40px;
}

.footer-logo .main-title {
  color: #FFF;
}

.brand-col .slogan {
  font-size: 13px;
  line-height: 1.8;
  color: #A39BAA;
  margin: 16px 0;
}

.contact-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #F3B5C1;
  font-weight: 500;
}

.footer-col h4 {
  font-size: 15px;
  color: #FFF;
  margin-bottom: 16px;
  font-weight: 600;
}

.footer-col ul {
  list-style: none;
}

.footer-col ul li {
  margin-bottom: 10px;
  font-size: 13px;
  color: #A39BAA;
}

.footer-col ul li strong {
  color: #E2DCDE;
}

.footer-col ul li a {
  color: #A39BAA;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-col ul li a:hover {
  color: #FFF;
}

.footer-bottom {
  max-width: 1240px;
  margin: 40px auto 0;
  padding: 20px 24px 0;
  border-top: 1px solid #332E38;
  text-align: center;
  font-size: 12px;
  color: #797180;
}

/* 浮窗组 */
.floating-widget-group {
  position: fixed;
  right: 24px;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 990;
}

.float-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--shadow-floating);
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.float-btn:hover {
  transform: translateY(-4px) scale(1.05);
}

.chat-trigger {
  background: linear-gradient(135deg, #C94B62, #A8364B);
  color: #FFF;
}

.appoint-trigger {
  background: linear-gradient(135deg, #C29353, #9E7336);
  color: #FFF;
}

.float-btn .text {
  font-size: 10px;
  margin-top: 2px;
  font-weight: 500;
}

.badge-num {
  position: absolute;
  top: -2px;
  right: -2px;
  background: #DC2626;
  color: #FFF;
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 10px;
  font-weight: bold;
}

/* 聊天抽屉 */
.chat-drawer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-drawer-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #C94B62, #A8364B);
  color: #FFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.agent-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.agent-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.6);
}

.agent-info .name {
  font-weight: 600;
  font-size: 14px;
}

.agent-info .status {
  font-size: 11px;
  color: #FDF2F4;
  display: flex;
  align-items: center;
  gap: 4px;
}

.agent-info .dot {
  width: 6px;
  height: 6px;
  background: #22C55E;
  border-radius: 50%;
}

.close-icon {
  font-size: 20px;
  cursor: pointer;
}

.quick-category-tags {
  padding: 10px 16px;
  background: #FAF5F2;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-bottom: 1px solid var(--color-border-base);
}

.cat-chip {
  font-size: 12px;
  background: #FFF;
  padding: 3px 10px;
  border-radius: 12px;
  color: var(--color-text-regular);
  cursor: pointer;
  border: 1px solid var(--color-border-base);
}

.cat-chip.active {
  background: var(--color-primary);
  color: #FFF;
  border-color: var(--color-primary);
}

.chat-messages-area {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #FDFBF9;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.message-row {
  display: flex;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.agent,
.message-row.system {
  justify-content: flex-start;
}

.bubble-wrap {
  max-width: 80%;
}

.sender-label {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

.bubble-content {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.5;
}

.message-row.user .bubble-content {
  background: var(--color-primary);
  color: #FFF;
  border-bottom-right-radius: 2px;
}

.message-row.agent .bubble-content {
  background: #FFF;
  color: var(--color-text-main);
  border: 1px solid var(--color-border-base);
  border-bottom-left-radius: 2px;
}

.message-row.system .bubble-content {
  background: #F3ECE7;
  color: var(--color-text-secondary);
  font-size: 12px;
  border-radius: 8px;
}

.chat-input-bar {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border-base);
  background: #FFF;
  display: flex;
  gap: 8px;
}

.chat-input-bar input {
  flex: 1;
  border: 1px solid var(--color-border-base);
  border-radius: 20px;
  padding: 8px 14px;
  outline: none;
  font-size: 13px;
}

.chat-input-bar input:focus {
  border-color: var(--color-primary);
}

.send-btn {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 预约弹窗 */
.appoint-intro {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--color-primary-light);
  padding: 12px 16px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.appoint-intro p {
  font-size: 13px;
  color: var(--color-primary-active);
  line-height: 1.5;
}

.seal-badge.small {
  width: 24px;
  height: 24px;
  font-size: 12px;
}

.confirm-btn {
  background: linear-gradient(135deg, #C94B62, #A8364B);
  border: none;
}
</style>
