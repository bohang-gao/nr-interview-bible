<script setup>
// 掌握度仪表盘：纯客户端只读聚合各处 localStorage 数据，绝不写入。
// 数据源（只读）：
//   nrb-srs-v1     → utils/srs.ts loadSrs/dueCards/srsStats
//   nrb-selftest-v1 → SelfTest 自测错题/掌握集合
//   nrb-mock-v1    → MockInterview 历史场次
//   nrb-notes-v1   → utils/notes.ts loadNotes
// SSR 构建期只渲染骨架，onMounted 后再取数，全部 try/catch。
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress/client'
import questions from '../generated/questions.json'
import { dueCards, isDue, loadSrs, SRS_MAX_STAGE } from '../utils/srs'
import { loadNotes } from '../utils/notes'

const ready = ref(false)

// ---------- 只读取数（一次聚合，全 try/catch） ----------
const data = ref({
  // srs
  srsCards: {},
  dueCount: 0,
  newBudget: 0,
  dailyBudget: 3,
  // selftest
  wrongCount: 0,
  masteredCount: 0,
  // mock
  mockRecent: [],
  // notes
  notesCount: 0
})

function loadSelftest() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null
    const raw = window.localStorage.getItem('nrb-selftest-v1')
    if (!raw) return null
    const d = JSON.parse(raw)
    if (!d || typeof d !== 'object' || Array.isArray(d)) return null
    return {
      wrong: Array.isArray(d.wrong) ? d.wrong.filter((x) => typeof x === 'string') : [],
      mastered: Array.isArray(d.mastered) ? d.mastered.filter((x) => typeof x === 'string') : []
    }
  } catch {
    return null
  }
}

function loadMockHistory() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return []
    const raw = window.localStorage.getItem('nrb-mock-v1')
    if (!raw) return []
    const d = JSON.parse(raw)
    if (!Array.isArray(d)) return []
    return d.slice(0, 5).map((h) => ({
      at: typeof h?.at === 'string' ? h.at : '',
      track: typeof h?.track === 'string' ? h.track : '',
      total: Number(h?.total) || 0,
      yes: Number(h?.yes) || 0,
      rate: Math.min(100, Math.max(0, Number(h?.rate) || 0))
    }))
  } catch {
    return []
  }
}

function collect() {
  const now = Date.now()
  let srsCards = {}
  let dueCount = 0
  let newBudget = 0
  let dailyBudget = 3
  try {
    srsCards = loadSrs()
    const info = dueCards(now)
    dueCount = info.due.length
    newBudget = info.newBudget
    dailyBudget = info.dailyBudget
  } catch {
    /* srs 数据损坏按空状态使用 */
  }
  let wrongCount = 0
  let masteredCount = 0
  try {
    const st = loadSelftest()
    if (st) {
      wrongCount = st.wrong.length
      masteredCount = st.mastered.length
    }
  } catch {
    /* selftest 数据损坏按空状态使用 */
  }
  let mockRecent = []
  try {
    mockRecent = loadMockHistory()
  } catch {
    /* mock 历史损坏按空状态使用 */
  }
  let notesCount = 0
  try {
    notesCount = Object.keys(loadNotes()).length
  } catch {
    /* notes 数据损坏按空状态使用 */
  }
  data.value = { srsCards, dueCount, newBudget, dailyBudget, wrongCount, masteredCount, mockRecent, notesCount }
  ready.value = true
}

onMounted(collect)

// ---------- 指标卡 ----------
const TOTAL_QUESTIONS = questions.length

const learnedCount = computed(() =>
  Object.values(data.value.srsCards).filter((c) => c && c.stage > 0).length
)
// 复习队列中：已入队（stage>0）且未毕业（stage<6）
const reviewingCount = computed(() =>
  Object.values(data.value.srsCards).filter((c) => c && c.stage > 0 && c.stage < 6).length
)
// 已毕业：stage 达到 6 及以上（含 7/8 封顶）
const graduatedCount = computed(() =>
  Object.values(data.value.srsCards).filter((c) => c && c.stage >= 6).length
)
const wrongCount = computed(() => data.value.wrongCount)
const notesCount = computed(() => data.value.notesCount)

// ---------- 9 章热力图 ----------
// 每章：已学占比（0-1）与平均 stage（0-8）→ 五档色阶
const chapterHeat = computed(() => {
  const byCh = new Map()
  for (const q of questions) {
    let rec = byCh.get(q.chapter)
    if (!rec) {
      rec = { chapter: q.chapter, name: q.chapterName, total: 0, learned: 0, stageSum: 0 }
      byCh.set(q.chapter, rec)
    }
    rec.total++
    const c = data.value.srsCards[q.id]
    if (c && c.stage > 0) {
      rec.learned++
      rec.stageSum += c.stage
    }
  }
  return [...byCh.values()]
    .sort((a, b) => a.chapter - b.chapter)
    .map((rec) => {
      const ratio = rec.total ? rec.learned / rec.total : 0
      const avgStage = rec.learned ? rec.stageSum / rec.learned : 0
      // 五档：0 未学=灰；1-4 由「已学占比 × 平均 stage 归一」映射到浅→深绿
      let level = 0
      if (rec.learned > 0) {
        const mastery = ratio * 0.6 + (avgStage / SRS_MAX_STAGE) * 0.4
        level = Math.min(4, 1 + Math.floor(mastery * 4))
      }
      return { ...rec, ratio, avgStage, level, pct: Math.round(ratio * 100) }
    })
})

const heatClass = ['h0', 'h1', 'h2', 'h3', 'h4']
const heatText = ['未学', '起步', '入门', '熟悉', '扎实']

const bankPath = withBase('/bank')

// ---------- 今日该学什么 ----------
const todayTasks = computed(() => {
  const d = data.value
  const tasks = []
  if (d.dueCount > 0)
    tasks.push({
      key: 'review',
      text: `复习 ${d.dueCount} 张到期卡`,
      link: '/daily',
      cta: '去复习'
    })
  if (d.wrongCount > 0)
    tasks.push({
      key: 'wrong',
      text: `错题重练 ${d.wrongCount} 题`,
      link: '/selftest',
      cta: '练错题'
    })
  if (d.newBudget > 0)
    tasks.push({
      key: 'new',
      text: `领取新题 ${d.newBudget}/${d.dailyBudget} 张`,
      link: '/daily',
      cta: '学新题'
    })
  return tasks
})
const allDone = computed(
  () => ready.value && todayTasks.value.length === 0
)
// 是否有数据可引导：完全空白时各区块显示「如何产生数据」
const hasAnyData = computed(
  () =>
    learnedCount.value > 0 ||
    wrongCount.value > 0 ||
    masteredCount.value > 0 ||
    data.value.mockRecent.length > 0 ||
    notesCount.value > 0
)

// ---------- 最近活动 ----------
const mockRecent = computed(() => data.value.mockRecent)

// 最近 7 天复习量：由卡 last 近似推算（last 落在近 7 天的卡数；每卡近 7 天复习次数无法精确，按 ≥1 计）
const last7 = computed(() => {
  const now = Date.now()
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000
  let touched = 0
  for (const c of Object.values(data.value.srsCards)) {
    if (!c || !c.last || c.last < weekAgo) continue
    touched++
  }
  return { touched, reviewTimes: touched }
})

// 时间格式 MM-DD
function fmtDay(ts) {
  try {
    const d = new Date(ts)
    const p = (n) => String(n).padStart(2, '0')
    return `${p(d.getMonth() + 1)}-${p(d.getDate())}`
  } catch {
    return ''
  }
}
</script>

<template>
  <div class="dashboard">
    <!-- 骨架（SSR/加载中） -->
    <div v-if="!ready" class="skeleton panel">
      <p class="muted">正在读取本机学习数据…</p>
    </div>

    <template v-else>
      <!-- 顶部指标卡 -->
      <div class="metrics">
        <div class="metric">
          <p class="m-label">已学题数</p>
          <p class="m-value">
            {{ learnedCount }}<span class="m-sub"> / {{ TOTAL_QUESTIONS }}</span>
          </p>
        </div>
        <div class="metric">
          <p class="m-label">复习队列中</p>
          <p class="m-value">{{ reviewingCount }}</p>
          <p class="m-hint">未毕业（阶段&lt;6）</p>
        </div>
        <div class="metric">
          <p class="m-label">已毕业</p>
          <p class="m-value">{{ graduatedCount }}</p>
          <p class="m-hint">阶段≥6</p>
        </div>
        <div class="metric">
          <p class="m-label">错题本</p>
          <p class="m-value" :class="{ warn: wrongCount > 0 }">{{ wrongCount }}</p>
          <p class="m-hint">自测标记「不会」</p>
        </div>
      </div>

      <!-- 章节热力图 -->
      <section class="panel">
        <h2>章节掌握度</h2>
        <div class="heat">
          <a
            v-for="ch in chapterHeat"
            :key="ch.chapter"
            class="heat-cell"
            :href="bankPath"
            :class="heatClass[ch.level]"
          >
            <span class="cell-title">第{{ ch.chapter }}章 {{ ch.name }}</span>
            <span class="cell-nums">已学 {{ ch.learned }}/{{ ch.total }}</span>
            <span class="cell-bar">
              <span class="cell-bar-fill" :style="{ width: `${ch.pct}%` }"></span>
            </span>
            <span class="cell-level">{{ heatText[ch.level] }}</span>
          </a>
        </div>
        <p class="legend">
          <span class="lg h0">未学</span>
          <span class="lg h1">起步</span>
          <span class="lg h2">入门</span>
          <span class="lg h3">熟悉</span>
          <span class="lg h4">扎实</span>
        </p>
        <p class="foot-note">
          点击格子进入题库（按章节筛选在第 1 步选择）；色深 = 已学占比 × 平均掌握阶段
        </p>
      </section>

      <!-- 今日该学什么 -->
      <section class="panel">
        <h2>今日该学什么</h2>
        <div v-if="allDone" class="done-line">今日任务完成，明天再来！</div>
        <template v-else>
          <ul class="task-list">
            <li v-for="t in todayTasks" :key="t.key" class="task-row">
              <span class="task-text">{{ t.text }}</span>
              <a :href="withBase(t.link)" class="btn primary small">{{ t.cta }}</a>
            </li>
          </ul>
          <p v-if="!hasAnyData" class="empty-tip">
            还没有学习记录：去「每日复习」领取新题即可开始，数据将自动产生并保存在本机。
          </p>
        </template>
      </section>

      <!-- 最近活动 -->
      <section class="panel">
        <h2>最近活动</h2>

        <h3>模拟面试 · 最近 {{ mockRecent.length }} 场</h3>
        <div v-if="mockRecent.length" class="trend">
          <div v-for="(h, i) in mockRecent" :key="i" class="trend-row">
            <span class="trend-label">{{ h.at }} · {{ h.track }}</span>
            <span class="trend-bar">
              <span class="trend-fill" :style="{ width: `${h.rate}%` }"></span>
            </span>
            <span class="trend-rate">{{ h.rate }}%</span>
          </div>
        </div>
        <p v-else class="empty-tip">
          完成一场模拟面试后，这里会显示最近 5 场的正确率趋势。
        </p>

        <h3>最近 7 天复习</h3>
        <p v-if="last7.touched > 0" class="kv-line">
          触达 <strong>{{ last7.touched }}</strong> 张卡
          <span class="muted">（按卡片最近自评时间近似统计）</span>
        </p>
        <p v-else class="empty-tip">
          近 7 天没有复习记录；到「每日复习」完成当天到期卡后会自动累计。
        </p>
      </section>

      <!-- 空态引导 -->
      <section v-if="!hasAnyData" class="panel">
        <h2>如何产生数据</h2>
        <ul class="guide-list">
          <li><strong>每日复习</strong>：领取新题并自评，形成 SRS 掌握度与到期队列。</li>
          <li><strong>自测</strong>：标记「不会」进入错题本，「会」计入已掌握。</li>
          <li><strong>模拟面试</strong>：完成一场后计入正确率趋势。</li>
          <li><strong>题目页脚</strong>：随手写笔记，自动保存到笔记中心。</li>
        </ul>
        <p class="muted">全部数据仅保存在浏览器本机，不上传。</p>
      </section>
    </template>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 860px;
  margin: 0 auto;
}
.panel {
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  margin-bottom: 1.25rem;
}
.panel h2 {
  border: none;
  margin: 0 0 1rem;
  font-size: 1.2rem;
}
.panel h3 {
  border: none;
  font-size: 0.95rem;
  margin: 1rem 0 0.5rem;
}
.muted {
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}

/* 指标卡 */
.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.metric {
  padding: 0.9rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.m-label {
  margin: 0;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}
.m-value {
  margin: 0.25rem 0 0;
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  line-height: 1.2;
}
.m-value.warn {
  color: var(--vp-c-red-1);
}
.m-sub {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
.m-hint {
  margin: 0.15rem 0 0;
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}

/* 热力图 */
.heat {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}
.heat-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.7rem 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  text-decoration: none;
  transition: transform 0.15s, border-color 0.15s;
}
.heat-cell:hover {
  transform: translateY(-2px);
  border-color: var(--vp-c-brand-1);
}
.heat-cell.h0 {
  background: var(--vp-c-bg);
}
.heat-cell.h1 {
  background: color-mix(in srgb, var(--vp-c-green-1) 12%, var(--vp-c-bg));
}
.heat-cell.h2 {
  background: color-mix(in srgb, var(--vp-c-green-1) 28%, var(--vp-c-bg));
}
.heat-cell.h3 {
  background: color-mix(in srgb, var(--vp-c-green-1) 50%, var(--vp-c-bg));
}
.heat-cell.h4 {
  background: color-mix(in srgb, var(--vp-c-green-1) 72%, var(--vp-c-bg));
}
.cell-title {
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--vp-c-text-1);
}
.cell-nums {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}
.cell-bar {
  display: block;
  height: 5px;
  border-radius: 3px;
  background: var(--vp-c-divider);
  overflow: hidden;
}
.cell-bar-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  background: var(--vp-c-brand-1);
}
.cell-level {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.9rem 0 0;
}
.lg {
  font-size: 0.72rem;
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
}
.lg.h0 {
  background: var(--vp-c-bg);
}
.lg.h1 {
  background: color-mix(in srgb, var(--vp-c-green-1) 12%, var(--vp-c-bg));
}
.lg.h2 {
  background: color-mix(in srgb, var(--vp-c-green-1) 28%, var(--vp-c-bg));
}
.lg.h3 {
  background: color-mix(in srgb, var(--vp-c-green-1) 50%, var(--vp-c-bg));
}
.lg.h4 {
  background: color-mix(in srgb, var(--vp-c-green-1) 72%, var(--vp-c-bg));
}
.foot-note {
  margin: 0.6rem 0 0;
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}

/* 今日任务 */
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.task-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6rem;
  padding: 0.5rem 0;
  border-bottom: 1px dashed var(--vp-c-divider);
}
.task-row:last-child {
  border-bottom: none;
}
.task-text {
  font-size: 0.92rem;
}
.done-line {
  color: var(--vp-c-green-1);
  font-weight: 700;
  font-size: 1rem;
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
  text-decoration: none;
  display: inline-block;
  transition: border-color 0.25s, color 0.25s, opacity 0.25s;
}
.btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.btn.primary {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}
.btn.primary:hover {
  opacity: 0.9;
  color: var(--vp-c-white);
}
.btn.small {
  padding: 0.25rem 0.85rem;
  font-size: 0.82rem;
}
.empty-tip {
  margin: 0.5rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}

/* 最近活动 */
.trend-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.25rem 0;
  font-size: 0.82rem;
}
.trend-label {
  width: 14em;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}
.trend-bar {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: var(--vp-c-divider);
  overflow: hidden;
}
.trend-fill {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: var(--vp-c-brand-1);
}
.trend-rate {
  width: 3.2em;
  text-align: right;
  color: var(--vp-c-text-1);
  font-weight: 600;
  flex-shrink: 0;
}
.kv-line {
  margin: 0;
  font-size: 0.9rem;
}
.kv-line strong {
  color: var(--vp-c-brand-1);
}
.guide-list {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.9rem;
  line-height: 1.8;
}

@media print {
  .dashboard {
    display: none;
  }
}
</style>
