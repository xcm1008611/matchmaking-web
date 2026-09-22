<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStateStore } from '@/stores/appState'
import {
  DocumentChecked,
  Picture,
  View,
  Check,
  Close,
  Plus,
  Edit,
  Delete,
  Lock,
  Search,
  Filter,
  Calendar,
  Opportunity,
  Location,
  User,
  Star
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { MemberProfile, StoryCase } from '@/types'

const appStore = useAppStateStore()

const activeTab = ref<'members' | 'stories' | 'activities'>('members')

// 搜索
const searchMember = ref('')
const selectedMemberStatus = ref('')

// 过滤会员
const filteredMembers = computed(() => {
  return appStore.members.filter(m => {
    const matchKey = !searchMember.value || 
      m.name.includes(searchMember.value) || 
      m.memberNo.includes(searchMember.value) ||
      m.occupation.includes(searchMember.value)
    const matchStatus = !selectedMemberStatus.value || m.status === selectedMemberStatus.value
    return matchKey && matchStatus
  })
})

// 审核通过 / 驳回会员资料
function handleApproveMember(member: MemberProfile) {
  member.verified = true
  member.status = 'matching'
  ElMessage.success(`会员【${member.memberNo} · ${member.name}】实名与脱敏资料已审核通过，已上架前台大厅！`)
}

function handleRejectMember(member: MemberProfile) {
  ElMessageBox.prompt('请输入驳回修改原因（如：照片不合规、房产证明需补正等）：', '资料审核驳回', {
    confirmButtonText: '确认驳回',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    if (value) {
      member.verified = false
      member.status = 'draft'
      ElMessage.warning(`已驳回会员资料修改，原因：${value}`)
    }
  }).catch(() => {})
}

// 成功案例发布状态
function toggleStoryPublish(story: StoryCase) {
  ElMessage.success(`成功案例《${story.title}》发布状态已更新！`)
}

// 新增案例弹窗
const storyDialogVisible = ref(false)
const storyForm = ref({
  title: '',
  type: 'match' as 'match' | 'counseling',
  tag: '',
  coupleName: '',
  background: '',
  target: '',
  result: '',
  testimonial: '',
  staffName: '苏婉宁',
  coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
})

function handleAddStory() {
  storyForm.value = {
    title: '',
    type: 'match',
    tag: '知性高知 · 灵魂伴侣',
    coupleName: '王先生 & 赵女士',
    background: '相亲多次未果，因性格内敛错过多次良缘...',
    target: '寻找懂生活、有共同审美的知己伴侣',
    result: '在红娘精准撮合下，相识半年后甜蜜登记领证',
    testimonial: '非常感谢阿拉小红娘团队的用心与专业！',
    staffName: '苏婉宁',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
  }
  storyDialogVisible.value = true
}

function submitStory() {
  if (!storyForm.value.title || !storyForm.value.coupleName) {
    ElMessage.warning('请填写案例标题与新人称呼')
    return
  }

  const newStory: StoryCase = {
    id: `case_${Date.now()}`,
    title: storyForm.value.title,
    type: storyForm.value.type,
    tag: storyForm.value.tag,
    coverImage: storyForm.value.coverImage,
    coupleName: storyForm.value.coupleName,
    background: storyForm.value.background,
    target: storyForm.value.target,
    processNodes: [
      { title: '初见破冰', date: '第1周', desc: '在静安店安排静谧茶室深度畅谈。' },
      { title: '情感升温', date: '第1个月', desc: '红娘全程跟进提供相处建议。' }
    ],
    result: storyForm.value.result,
    testimonial: storyForm.value.testimonial,
    staffName: storyForm.value.staffName,
    staffRole: storyForm.value.type === 'match' ? '金牌红娘' : '情感顾问',
    staffAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    date: new Date().toISOString().slice(0, 10)
  }

  appStore.stories.unshift(newStory)
  ElMessage.success('成功故事已审核并发布至前台案例库！')
  storyDialogVisible.value = false
}

// 模拟活动审核数据
const activitiesList = ref([
  {
    id: 'act_001',
    title: '【春日雅聚】静安旗舰店·高知海归品茗冷餐交友会',
    storeName: '静安旗舰店',
    date: '2026-04-18 14:30',
    quota: '30人（男女各15）',
    status: 'published',
    reviewStatus: 'approved'
  },
  {
    id: 'act_002',
    title: '【周日沙龙】亲密关系工作坊：如何读懂彼此的爱语',
    storeName: '徐汇滨江店',
    date: '2026-04-26 15:00',
    quota: '20人',
    status: 'pending_review',
    reviewStatus: 'pending'
  }
])

function approveActivity(act: any) {
  act.reviewStatus = 'approved'
  act.status = 'published'
  ElMessage.success(`活动【${act.title}】已审核通过并发布！`)
}
</script>

<template>
  <div class="content-manage-page animate-fade-up">
    <!-- 顶部标题与切换Tab -->
    <div class="page-top">
      <div>
        <h2>内容与脱敏审核</h2>
        <p class="sub-desc">严格审核前台会员脱敏档案、结缘故事、活动文案，确保信息真实、合规与隐私安全</p>
      </div>

      <div class="tab-pill-group">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'members' }"
          @click="activeTab = 'members'"
        >
          <el-icon><DocumentChecked /></el-icon>
          <span>会员脱敏档案 ({{ appStore.members.length }})</span>
        </button>

        <button
          class="tab-btn"
          :class="{ active: activeTab === 'stories' }"
          @click="activeTab = 'stories'"
        >
          <el-icon><Picture /></el-icon>
          <span>成功结缘故事 ({{ appStore.stories.length }})</span>
        </button>

        <button
          class="tab-btn"
          :class="{ active: activeTab === 'activities' }"
          @click="activeTab = 'activities'"
        >
          <el-icon><Calendar /></el-icon>
          <span>线下活动与沙龙 ({{ activitiesList.length }})</span>
        </button>
      </div>
    </div>

    <!-- TAB 1: 会员脱敏档案审核 -->
    <div v-if="activeTab === 'members'" class="tab-pane">
      <div class="filter-bar apple-glass-card">
        <div class="filter-left">
          <el-input
            v-model="searchMember"
            placeholder="搜索会员编号、脱敏化名或职业..."
            :prefix-icon="Search"
            clearable
            style="width: 280px;"
          />
          <el-select v-model="selectedMemberStatus" placeholder="审核/上架状态" clearable style="width: 160px;">
            <el-option label="全部状态" value="" />
            <el-option label="待审核/草稿" value="draft" />
            <el-option label="已审核·推荐中" value="matching" />
            <el-option label="服务完成" value="closed" />
          </el-select>
        </div>
        <div class="filter-right">
          <span class="safe-tag"><el-icon><Lock /></el-icon> 已开启多重实名脱敏保护</span>
        </div>
      </div>

      <div class="member-review-table-card apple-glass-card">
        <el-table :data="filteredMembers" stripe style="width: 100%;">
          <el-table-column label="编号/化名" width="160">
            <template #default="{ row }">
              <div class="member-identity-cell">
                <img :src="row.avatar" class="mini-avatar" />
                <div>
                  <div class="member-name">{{ row.name }}</div>
                  <div class="member-no">{{ row.memberNo }}</div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="基本脱敏信息" min-width="200">
            <template #default="{ row }">
              <div class="meta-row">
                <span>{{ row.age }}岁 · {{ row.height }}cm</span>
                <span>{{ row.education }} · {{ row.city }}</span>
              </div>
              <div class="job-row">{{ row.occupation }} ({{ row.incomeRange }})</div>
            </template>
          </el-table-column>

          <el-table-column label="资产与择偶意向" min-width="220">
            <template #default="{ row }">
              <div class="asset-tags">
                <el-tag size="small" effect="plain" type="info">{{ row.housing }}</el-tag>
                <el-tag size="small" effect="plain" type="info">{{ row.vehicle }}</el-tag>
              </div>
              <div class="partner-desc" :title="row.idealPartnerDesc">
                望择：{{ row.idealPartnerDesc }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="认证状态" width="130" align="center">
            <template #default="{ row }">
              <el-tag :type="row.verified ? 'success' : 'warning'" size="small">
                {{ row.verified ? '✓ 真实核验' : '待补充核验' }}
              </el-tag>
              <div class="score-sub">诚意分: {{ row.sincerityScore }}</div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <div class="action-btn-group">
                <el-button
                  v-if="!row.verified"
                  type="success"
                  size="small"
                  @click="handleApproveMember(row)"
                >
                  审核上架
                </el-button>
                <el-button
                  v-else
                  type="warning"
                  size="small"
                  plain
                  @click="handleRejectMember(row)"
                >
                  下架/重审
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- TAB 2: 成功故事审核与管理 -->
    <div v-if="activeTab === 'stories'" class="tab-pane">
      <div class="pane-action-bar">
        <p class="pane-intro">前台成功结缘案例与情感调解案例展示库管理</p>
        <el-button type="primary" :icon="Plus" @click="handleAddStory">发布新故事案例</el-button>
      </div>

      <div class="stories-grid">
        <div v-for="story in appStore.stories" :key="story.id" class="story-item-card apple-glass-card">
          <div class="story-img-wrap">
            <img :src="story.coverImage" :alt="story.title" />
            <span class="story-tag">{{ story.tag }}</span>
          </div>

          <div class="story-item-body">
            <div class="story-type-row">
              <el-tag size="small" :type="story.type === 'match' ? 'danger' : 'warning'">
                {{ story.type === 'match' ? '婚恋牵线' : '婚姻修复' }}
              </el-tag>
              <span class="story-couple">{{ story.coupleName }}</span>
            </div>

            <h4>{{ story.title }}</h4>
            <p class="story-desc">{{ story.result }}</p>

            <div class="story-staff-foot">
              <span>执导老师：{{ story.staffName }} ({{ story.staffRole }})</span>
              <el-button size="small" type="primary" link @click="toggleStoryPublish(story)">
                已上线展示
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: 线下活动审核与管理 -->
    <div v-if="activeTab === 'activities'" class="tab-pane">
      <div class="pane-action-bar">
        <p class="pane-intro">管理各直营门店与合作场馆发布的相亲派对、单身沙龙与情感工作坊</p>
        <el-button type="primary" :icon="Plus" @click="ElMessage.info('可由门店店长发起活动草案，由总部审核后一键同步前台！')">
          新建活动方案
        </el-button>
      </div>

      <div class="activity-table-card apple-glass-card">
        <el-table :data="activitiesList" stripe style="width: 100%;">
          <el-table-column label="活动主题" min-width="260">
            <template #default="{ row }">
              <strong>{{ row.title }}</strong>
            </template>
          </el-table-column>
          <el-table-column label="承办门店" prop="storeName" width="160" />
          <el-table-column label="活动时间" prop="date" width="180" />
          <el-table-column label="名额限制" prop="quota" width="160" />
          <el-table-column label="审核状态" width="140" align="center">
            <template #default="{ row }">
              <el-tag :type="row.reviewStatus === 'approved' ? 'success' : 'warning'" size="small">
                {{ row.reviewStatus === 'approved' ? '已发布上线' : '待总部审核' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" align="center">
            <template #default="{ row }">
              <el-button
                v-if="row.reviewStatus !== 'approved'"
                type="success"
                size="small"
                @click="approveActivity(row)"
              >
                审核发布
              </el-button>
              <span v-else style="font-size: 12px; color: #10b981;">展示中</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 发布新故事弹窗 -->
    <el-dialog v-model="storyDialogVisible" title="发布成功结缘 / 情感调解案例" width="540px">
      <el-form label-position="top">
        <el-form-item label="案例标题 *" required>
          <el-input v-model="storyForm.title" placeholder="如：从两次相亲失利到8个月领证..." />
        </el-form-item>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <el-form-item label="案例类型">
            <el-select v-model="storyForm.type" style="width: 100%;">
              <el-option label="婚恋牵线" value="match" />
              <el-option label="婚姻与情感调解" value="counseling" />
            </el-select>
          </el-form-item>
          <el-form-item label="案例特色标签">
            <el-input v-model="storyForm.tag" placeholder="如：知性高知 · 灵魂共鸣" />
          </el-form-item>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <el-form-item label="新人/客户化名 *" required>
            <el-input v-model="storyForm.coupleName" placeholder="如：陈先生 & 许女士" />
          </el-form-item>
          <el-form-item label="指导红娘/顾问">
            <el-input v-model="storyForm.staffName" placeholder="如：苏婉宁" />
          </el-form-item>
        </div>
        <el-form-item label="结缘/调解最终成果">
          <el-input v-model="storyForm.result" placeholder="如：相识5个月确立婚约，第8个月登记领证..." />
        </el-form-item>
        <el-form-item label="客户感言 (Testimonial)">
          <el-input v-model="storyForm.testimonial" type="textarea" :rows="2" placeholder="客户亲笔寄语..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="storyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStory">发布上线</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.content-manage-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.page-top h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1e28;
  font-family: var(--font-song), serif;
  margin-bottom: 4px;
}
.sub-desc {
  font-size: 13px;
  color: #64748b;
}

.tab-pill-group {
  display: flex;
  background: #e2e8f0;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
}
.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.tab-btn:hover {
  color: #1e293b;
}
.tab-btn.active {
  background: #ffffff;
  color: #9b1c2e;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
}
.filter-left {
  display: flex;
  gap: 12px;
  align-items: center;
}
.safe-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #10b981;
  background: #ecfdf5;
  padding: 6px 12px;
  border-radius: 20px;
}

.member-review-table-card, .activity-table-card {
  padding: 16px;
  overflow: hidden;
}

.member-identity-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.mini-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
}
.member-name {
  font-weight: 600;
  color: #1e293b;
  font-size: 13px;
}
.member-no {
  font-size: 11px;
  color: #94a3b8;
}

.meta-row {
  font-size: 13px;
  color: #334155;
  margin-bottom: 2px;
}
.job-row {
  font-size: 12px;
  color: #64748b;
}

.asset-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 4px;
}
.partner-desc {
  font-size: 12px;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

.score-sub {
  font-size: 11px;
  color: #c5a059;
  font-weight: 600;
  margin-top: 2px;
}

.pane-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}
.pane-intro {
  font-size: 13px;
  color: #64748b;
}

.stories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.story-item-card {
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.story-img-wrap {
  position: relative;
  height: 180px;
  width: 100%;
}
.story-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.story-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
}

.story-item-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}
.story-type-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.story-couple {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}
.story-item-body h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}
.story-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.story-staff-foot {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #94a3b8;
}
</style>
