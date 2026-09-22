<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStateStore } from '@/stores/appState'
import {
  ChatDotRound,
  StarFilled,
  Calendar,
  User,
  Right,
  Present
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { SuccessStory } from '@/types'

const appStore = useAppStateStore()

const currentCategory = ref<'all' | 'match' | 'counseling'>('all')

const filteredStories = computed(() => {
  return appStore.stories.filter((s) => {
    if (currentCategory.value === 'all') return true
    return s.type === currentCategory.value
  })
})

// 案例详情查看抽屉/弹窗
const detailVisible = ref(false)
const activeStory = ref<SuccessStory | null>(null)
const blessingsCount = ref(128)
const isBlessed = ref(false)

function openStoryDetail(s: SuccessStory) {
  activeStory.value = s
  isBlessed.value = false
  blessingsCount.value = Math.floor(Math.random() * 80) + 120
  detailVisible.value = true
}

function handleSendBlessing() {
  if (isBlessed.value) {
    ElMessage.info('您已经为这对璧人送过祝福啦~')
    return
  }
  isBlessed.value = true
  blessingsCount.value++
  ElMessage.success('🏮 感谢您的真挚祝福！愿天下有情人终成眷属')
}
</script>

<template>
  <div class="story-cases-page">
    <!-- 头部横幅 -->
    <section class="cases-hero">
      <div class="hero-inner">
        <span class="badge">TESTIMONIALS & STORIES</span>
        <h1 class="hero-title">见证每一场<span class="gradient-text">奔赴与破镜重圆</span></h1>
        <p class="hero-desc">
          在阿拉小红娘，已有超过 12,000 对伴侣在此相遇或重修旧好。真实的故事，温暖的见证，
          无论你是在等待良缘，还是在守护当下的爱，愿这里的温情给你前行的底气。
        </p>
      </div>
    </section>

    <!-- 分类过滤与统计 -->
    <div class="filter-bar">
      <div class="category-tabs">
        <button
          class="cat-btn"
          :class="{ active: currentCategory === 'all' }"
          @click="currentCategory = 'all'"
        >
          全部幸福案例 ({{ appStore.stories.length }})
        </button>
        <button
          class="cat-btn"
          :class="{ active: currentCategory === 'match' }"
          @click="currentCategory = 'match'"
        >
          良缘牵线 · 喜结连理 ({{ appStore.stories.filter((s) => s.type === 'match').length }})
        </button>
        <button
          class="cat-btn"
          :class="{ active: currentCategory === 'counseling' }"
          @click="currentCategory = 'counseling'"
        >
          情感调解 · 破镜重圆 ({{ appStore.stories.filter((s) => s.type === 'counseling').length }})
        </button>
      </div>
    </div>

    <!-- 故事卡片瀑布网格 -->
    <div class="stories-grid">
      <div
        v-for="story in filteredStories"
        :key="story.id"
        class="story-card"
        @click="openStoryDetail(story)"
      >
        <div class="story-cover-box">
          <img :src="story.coverImage" :alt="story.title" class="story-cover" />
          <span class="type-pill" :class="story.type">
            {{ story.type === 'match' ? '金牌牵线' : '情感调解' }}
          </span>
          <span class="date-pill">{{ story.marriedDate || story.createdAt }}</span>
        </div>

        <div class="story-content">
          <div class="tags-row">
            <span v-for="(t, idx) in story.tags" :key="idx" class="tag-item">
              #{{ t }}
            </span>
          </div>

          <h3 class="story-title">{{ story.title }}</h3>
          <p class="story-quote">“{{ story.quote }}”</p>

          <div class="pair-info-row">
            <span class="pair-name">{{ story.maleName }} & {{ story.femaleName }}</span>
            <span class="mentor-credit">导师：{{ story.matchmakerName }}</span>
          </div>

          <div class="card-footer">
            <span class="read-more">阅读完整心路历程 →</span>
            <div class="bless-stat">
              <el-icon><StarFilled /></el-icon>
              <span>{{ story.likesCount || 99 }}+ 祝福</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 故事深度详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      width="720px"
      append-to-body
      class="oriental-dialog story-detail-dialog"
    >
      <div v-if="activeStory" class="story-dialog-body">
        <div class="detail-header-img">
          <img :src="activeStory.coverImage" class="dh-img" />
          <div class="dh-overlay">
            <span class="dh-tag">{{ activeStory.type === 'match' ? '良缘牵线' : '情感修护' }}</span>
            <h2>{{ activeStory.title }}</h2>
            <p>{{ activeStory.maleName }} & {{ activeStory.femaleName }} · {{ activeStory.marriedDate }}</p>
          </div>
        </div>

        <div class="detail-body-inner">
          <div class="quote-banner">
            <el-icon class="quote-star"><StarFilled /></el-icon>
            <p>“ {{ activeStory.quote }} ”</p>
          </div>

          <div class="mentor-note-card">
            <div class="mn-avatar">🏮</div>
            <div class="mn-text">
              <strong>主理导师 · {{ activeStory.matchmakerName }} 结缘手记：</strong>
              <p>
                在整个服务周期内，我们见证了从最初的矜持与顾虑，到彼此敞开心扉、学会同频共振的每一步。
                爱情不是寻找一个毫无瑕疵的完美人选，而是在彼此真诚注视中，互相成就更好的自己。
              </p>
            </div>
          </div>

          <div class="story-narrative">
            <h4>💡 相识与心路转折</h4>
            <p>{{ activeStory.summary }}</p>
            <p style="margin-top: 10px; color: var(--color-ink-muted); font-size: 14px; line-height: 1.8;">
              回顾这一段相知相守的历程，红娘老师从初期的精准画像匹配，到茶室约见前的心理铺垫与破冰助攻，
              再到相处初期的两地作息协调，每一步的温暖守护，最终让爱开花结果。
            </p>
          </div>

          <div class="blessing-action-area">
            <button
              class="btn-bless"
              :class="{ blessed: isBlessed }"
              @click="handleSendBlessing"
            >
              <el-icon><StarFilled /></el-icon>
              <span>{{ isBlessed ? '已送上诚挚祝福' : '为他们点亮真诚祝福' }} ({{ blessingsCount }})</span>
            </button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.story-cases-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.cases-hero {
  text-align: center;
  margin-bottom: 40px;
}
.badge {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(201, 75, 98, 0.1);
  color: var(--color-crimson);
  font-size: 12px;
  font-weight: 700;
  border-radius: 14px;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}
.hero-title {
  font-size: 36px;
  color: var(--color-ink);
  font-family: var(--font-song), serif;
  font-weight: 700;
  margin-bottom: 14px;
}
.gradient-text {
  background: linear-gradient(120deg, var(--color-crimson), var(--color-gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-desc {
  font-size: 15px;
  color: var(--color-ink-muted);
  max-width: 760px;
  margin: 0 auto;
  line-height: 1.8;
}

.filter-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 36px;
}
.category-tabs {
  position: relative;
  isolation: isolate;
  display: flex;
  gap: 8px;
  background: #ffffff;
  padding: 6px;
  border-radius: 30px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}
.cat-btn {
  position: relative;
  z-index: 1;
  padding: 10px 24px;
  border-radius: 24px;
  border: none;
  background: transparent;
  color: var(--color-ink);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  cursor: pointer;
  transition: color 0.25s var(--ease-apple), background-color 0.25s var(--ease-apple), box-shadow 0.25s var(--ease-apple) !important;
}
.cat-btn.active {
  background: var(--color-crimson);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(201, 75, 98, 0.3);
}
.cat-btn:active {
  transform: none !important;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}
.story-card {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.07);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s;
}
.story-card:hover {
  transform: translateY(-6px);
  border-color: rgba(201, 75, 98, 0.3);
  box-shadow: 0 16px 36px rgba(201, 75, 98, 0.12);
}
.story-cover-box {
  height: 220px;
  position: relative;
  overflow: hidden;
}
.story-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}
.story-card:hover .story-cover {
  transform: scale(1.05);
}
.type-pill {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
}
.type-pill.match {
  background: linear-gradient(135deg, var(--color-crimson), #e65c78);
}
.type-pill.counseling {
  background: linear-gradient(135deg, var(--color-gold), #d4a66a);
}
.date-pill {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #ffffff;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 8px;
  backdrop-filter: blur(4px);
}

.story-content {
  padding: 22px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.tag-item {
  font-size: 11px;
  color: var(--color-gold);
  font-weight: 600;
}
.story-title {
  font-size: 18px;
  color: var(--color-ink);
  font-family: var(--font-song), serif;
  font-weight: 700;
  margin-bottom: 10px;
  line-height: 1.4;
}
.story-quote {
  font-size: 13px;
  color: var(--color-ink-muted);
  font-style: italic;
  line-height: 1.6;
  margin-bottom: 16px;
  flex: 1;
}
.pair-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--color-ink-muted);
  padding: 10px 0;
  border-top: 1px dashed rgba(0, 0, 0, 0.08);
}
.pair-name {
  font-weight: 700;
  color: var(--color-ink);
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 13px;
}
.read-more {
  color: var(--color-crimson);
  font-weight: 600;
}
.bless-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-ink-muted);
  font-size: 12px;
}

/* 详情弹窗 */
.detail-header-img {
  height: 260px;
  position: relative;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
}
.dh-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dh-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.85) 100%);
  color: #ffffff;
}
.dh-tag {
  display: inline-block;
  padding: 2px 10px;
  background: var(--color-crimson);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 6px;
}
.dh-overlay h2 {
  font-size: 22px;
  font-family: var(--font-song), serif;
  margin-bottom: 4px;
}
.dh-overlay p {
  font-size: 13px;
  opacity: 0.85;
}

.detail-body-inner {
  padding: 24px;
}
.quote-banner {
  display: flex;
  gap: 12px;
  background: #fbf8f5;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid var(--color-crimson);
  margin-bottom: 20px;
}
.quote-star {
  color: var(--color-gold);
  font-size: 20px;
  margin-top: 2px;
}
.quote-banner p {
  font-size: 14px;
  color: var(--color-ink);
  font-weight: 600;
  font-style: italic;
  line-height: 1.6;
}
.mentor-note-card {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: #fdf6f7;
  border-radius: 12px;
  margin-bottom: 20px;
}
.mn-avatar {
  font-size: 24px;
}
.mn-text strong {
  display: block;
  font-size: 13px;
  color: var(--color-crimson);
  margin-bottom: 4px;
}
.mn-text p {
  font-size: 13px;
  color: var(--color-ink-muted);
  line-height: 1.6;
}
.story-narrative h4 {
  font-size: 16px;
  color: var(--color-ink);
  margin-bottom: 8px;
}
.story-narrative p {
  font-size: 14px;
  color: var(--color-ink);
  line-height: 1.8;
}
.blessing-action-area {
  margin-top: 28px;
  text-align: center;
}
.btn-bless {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 32px;
  border-radius: 28px;
  border: 1px solid var(--color-crimson);
  background: rgba(201, 75, 98, 0.08);
  color: var(--color-crimson);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-bless:hover, .btn-bless.blessed {
  background: var(--color-crimson);
  color: #ffffff;
  box-shadow: 0 6px 20px rgba(201, 75, 98, 0.35);
}
</style>
