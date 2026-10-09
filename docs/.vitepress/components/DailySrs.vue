<script setup>
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress/client'
import quiz from '../generated/quiz.json'
import {
  addNewCards,
  answerCard,
  dueCards,
  isDue,
  loadSrs,
  srsStats,
  SRS_INTERVAL_DAYS,
  SRS_MAX_STAGE
} from '../utils/srs'

const difficultyClass = { 易: 'easy', 中: 'mid', 难: 'hard' }

// 抽题/自评/时间均在客户端（SSR 只渲染占位，onMounted 后进入真实状态）
const ready = ref(false)
const phase = ref('idle') // idle | review | done
const queue = ref([]) // 待复习卡 id 队列（due 最早优先）
const newQueue = ref([]) // 今日新题 id 队列
const mode = ref('review') // review | new
const revealed = ref(false)

// 会话内统计（完成页展示）
const session = ref({ reviewed: 0, correct: 0 })

const cardIndex = ref(0) // 当前队列位置（用于进度展示）

const quizMap = computed(() => {
  const map = new Map()
  for (const item of quiz.items) map.set(item.id, item)
  return map
})

const currentId = computed(() => {
  const list = mode.value === 'review' ? queue.value : newQueue.value
  return list[0] || null
})
const currentCard = computed(() => (currentId.value ? quizMap.value.get(currentId.value) || null : null))
const srsCard = computed(() => {
  if (!currentId.value) return null
  return loadSrs()[currentId.value] || null
})

const dueCount = computed(() => queue.value.length + (mode.value === 'review' && currentId.value ? 1 : 0))
const newCount = computed(() => newQueue.value.length + (mode.value === 'new' && currentId.value ? 1 : 0))

const progressTotal = computed(() => session.value.reviewed + dueCount.value + newCount.value)
const progressDone = computed(() => session.value.reviewed)
const progressPct = computed(() =>
  progressTotal.value > 0 ? Math.round((progressDone.value / progressTotal.value) * 100) : 0
)

const correctRate = computed(() =>
  session.value.reviewed > 0 ? Math.round((session.value.correct / session.value.reviewed) * 100) : 0
)

const stageLabel = computed(() => {
  const c = srsCard.value
  if (!c) return '新题'
  return `阶段 ${c.stage}/${SRS_MAX_STAGE}`
})

// 完成页：未来几天的到期分布一句话
const nextScheduleLine = computed(() => {
  const now = Date.now()
  const cards = Object.values(loadSrs()).filter((c) => !isDue(c, now) && c.due > 0)
  const byDay = new Map()
  for (const c of cards) {
    const d = new Date(c.due)
    d.setHours(0, 0, 0, 0)
    const key = Math.round((d.getTime() - new Date(new Date(now).setHours(0, 0, 0, 0)).getTime()) / 86400000)
    byDay.set(key, (byDay.get(key) || 0) + 1)
  }
  const parts = [...byDay.entries()]
    .sort((a, b) => a[0] - b[0])
    .slice(0, 3)
    .map(([days, n]) => (days <= 1 ? `明天 ${n} 题` : `${days} 天后 ${n} 题`))
  return parts.length ? parts.join('，') : '暂无后续复习安排，先学几题吧'
})

function refreshQueues() {
  const info = dueCards()
  queue.value = info.due.map((c) => c.id)
  if (info.newBudget > 0) {
    const picked = addNewCards(info.newBudget)
    newQueue.value = picked.map((c) => c.id)
  } else {
    newQueue.value = []
  }
}

function start() {
  session.value = { reviewed: 0, correct: 0 }
  refreshQueues()
  cardIndex.value = 0
  revealed.value = false
  mode.value = queue.value.length > 0 ? 'review' : 'new'
  phase.value = currentId.value ? 'review' : 'done'
}

function advance() {
  const list = mode.value === 'review' ? queue.value : newQueue.value
  list.shift()
  revealed.value = false
  cardIndex.value++
  // 复习清完自动切新题
  if (mode.value === 'review' && queue.value.length === 0 && newQueue.value.length > 0) {
    mode.value = 'new'
  }
  if (!currentId.value) phase.value = 'done'
}

/** 复习自评：记得 → stage+1；忘了 → stage-2 重排（明天再见） */
function selfAssess(correct) {
  if (!currentId.value) return
  answerCard(currentId.value, correct)
  session.value.reviewed++
  if (correct) session.value.correct++
  // 答错的卡排到队尾，本轮内隔题重现
  if (!correct && mode.value === 'review') {
    const i = queue.value.indexOf(currentId.value)
    if (i >= 0) {
      queue.value.splice(i, 1)
      queue.value.push(currentId.value)
    }
  }
  advance()
}

/** 新题：已学 → stage=1（due 明天）；跳过 → 从队列移除不建卡 */
function learnNew(learned) {
  if (!currentId.value) return
  if (learned) answerCard(currentId.value, true)
  advance()
}

/** 手动加学（突破预算）：从题库领 3 张未学新卡 */
function learnMore() {
  const picked = addNewCards(3)
  newQueue.value.push(...picked.map((c) => c.id))
  mode.value = 'new'
  phase.value = newQueue.value.length > 0 ? 'review' : 'done'
}

const dueInfo = ref(null)

onMounted(() => {
  dueInfo.value = dueCards()
  ready.value = true
})
</script>

<template>
  <div class="daily-srs">
    <p v-if="!ready" class="empty">加载中…</p>

    <!-- 任务概览 / 开始页 -->
    <div v-else-if="phase === 'idle'" class="panel">
      <h2>今日复习</h2>
      <p class="overview">
        待复习 <strong>{{ dueInfo.due.length }}</strong> 题
        ｜今日新题 <strong>{{ dueInfo.newBudget }}</strong> / {{ dueInfo.dailyBudget }} 题
      </p>
      <p v-if="dueInfo.due.length === 0 && dueInfo.newBudget === 0" class="all-done">
        今日任务完成 🎉
      </p>
      <p v-else-if="dueInfo.due.length === 0" class="hint-line">
        没有到期卡片，今天先学 {{ dueInfo.newBudget }} 道新题
      </p>
      <p v-else class="hint-line">
        先清到期卡（按计划时间最早优先），再学新题
      </p>
      <p class="actions">
        <button
          type="button"
          class="btn primary"
          :disabled="dueInfo.due.length === 0 && dueInfo.newBudget === 0"
          @click="start"
        >
          {{ dueInfo.due.length === 0 ? '开始学习新题' : '开始复习' }}
        </button>
      </p>
      <p v-if="dueInfo.due.length === 0 && dueInfo.newBudget === 0" class="actions">
        <button type="button" class="btn" @click="learnMore">多学几题</button>
      </p>
    </div>

    <!-- 逐题复习/学习 -->
    <div v-else-if="phase === 'review' && currentCard" class="panel quiz">
      <p class="progress">
        {{ mode === 'review' ? '复习' : '新题' }}
        第 <strong>{{ progressDone + 1 }}</strong> / {{ progressTotal }} 题
        <span class="stage-hint">{{ stageLabel }}</span>
      </p>
      <div class="bar">
        <div class="bar-fill" :style="{ width: `${progressPct}%` }"></div>
      </div>

      <div class="badges">
        <span class="badge chapter">{{ currentCard.chapterName }}</span>
        <span :class="['badge', difficultyClass[currentCard.difficulty]]">
          难度 {{ currentCard.difficulty }}
        </span>
      </div>

      <h2 class="qtitle">{{ currentCard.title }}</h2>
      <p v-if="!revealed" class="recall-hint">先在脑子里回忆一下要点，再翻答案 ✋</p>

      <template v-if="revealed">
        <section class="brief" v-html="currentCard.sections.brief"></section>
        <p class="more">
          <a :href="withBase(currentCard.url)">查看完整解析 →</a>
        </p>
      </template>
      <p v-else class="actions">
        <button type="button" class="btn primary" @click="revealed = true">显示答案</button>
      </p>

      <p v-if="revealed" class="actions">
        <template v-if="mode === 'review'">
          <button type="button" class="btn yes" @click="selfAssess(true)">记得 ✓</button>
          <button type="button" class="btn no" @click="selfAssess(false)">忘了 ✗</button>
        </template>
        <template v-else>
          <button type="button" class="btn yes" @click="learnNew(true)">已学 ✓</button>
          <button type="button" class="btn" @click="learnNew(false)">跳过</button>
        </template>
      </p>
    </div>

    <!-- 完成页 -->
    <div v-else-if="phase === 'done'" class="panel result">
      <h2>今日任务完成 🎉</h2>
      <template v-if="session.reviewed > 0">
        <p class="score-line">
          今日复习 <strong class="big">{{ session.reviewed }}</strong> 题
          <span class="rate">答对率 {{ correctRate }}%</span>
        </p>
      </template>
      <template v-else>
        <p class="score-line">本轮没有需要复习或学习的题目</p>
      </template>
      <p class="schedule-line">下次复习：{{ nextScheduleLine }}</p>
      <p class="actions">
        <button type="button" class="btn" @click="phase = 'idle'; dueInfo = dueCards()">返回概览</button>
        <button type="button" class="btn primary" @click="learnMore">多学几题</button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.daily-srs {
  max-width: 760px;
  margin: 0 auto;
}
.panel {
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.panel h2 {
  border: none;
  margin: 0 0 1rem;
  font-size: 1.2rem;
}
.empty {
  text-align: center;
  color: var(--vp-c-text-2);
}
.overview {
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
}
.overview strong {
  color: var(--vp-c-text-1);
  font-size: 1.15em;
}
.hint-line {
  color: var(--vp-c-text-2);
  font-size: 0.88rem;
}
.all-done {
  color: var(--vp-c-green-1);
  font-weight: 600;
}
.progress {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  margin: 0 0 0.4rem;
}
.stage-hint {
  font-size: 0.8rem;
}
.bar {
  height: 4px;
  border-radius: 2px;
  background: var(--vp-c-divider);
  overflow: hidden;
  margin-bottom: 1rem;
}
.bar-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.25s;
}
.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
}
.badge {
  font-size: 0.75rem;
  padding: 0.05rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  white-space: nowrap;
}
.badge.chapter {
  background: var(--vp-c-indigo-soft);
  border-color: transparent;
  color: var(--vp-c-indigo-1);
}
.badge.easy {
  color: var(--vp-c-green-1);
  border-color: var(--vp-c-green-1);
}
.badge.mid {
  color: var(--vp-c-yellow-1);
  border-color: var(--vp-c-yellow-1);
}
.badge.hard {
  color: var(--vp-c-red-1);
  border-color: var(--vp-c-red-1);
}
.qtitle {
  border: none;
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
  line-height: 1.45;
}
.recall-hint {
  color: var(--vp-c-text-2);
  font-size: 0.88rem;
  background: var(--vp-c-bg);
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.8rem;
}
.brief {
  font-size: 0.95rem;
}
.more {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  margin: 0.75rem 0 0;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin: 1rem 0 0;
}
.btn {
  padding: 0.35rem 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: border-color 0.25s, color 0.25s, opacity 0.25s;
}
.btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn.primary {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}
.btn.primary:hover:not(:disabled) {
  opacity: 0.9;
  color: var(--vp-c-white);
}
.btn.yes {
  border-color: var(--vp-c-green-1);
  color: var(--vp-c-green-1);
}
.btn.no {
  border-color: var(--vp-c-red-1);
  color: var(--vp-c-red-1);
}
.result {
  text-align: center;
}
.score-line {
  font-size: 1.05rem;
}
.score-line .big {
  font-size: 2rem;
  color: var(--vp-c-brand-1);
}
.rate {
  margin-left: 0.5rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}
.schedule-line {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  margin-top: 0.75rem;
}
@media print {
  .daily-srs {
    display: none;
  }
}
</style>
