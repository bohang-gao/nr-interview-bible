<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { withBase } from 'vitepress/client'
import quiz from '../generated/quiz.json'

const STORAGE_KEY = 'nrb-mock-v1'

// 岗位方向（quiz.json 无独立 tags 字段，以章节归属作为 tag 权重依据）
const tracks = [
  { id: 'rd', name: '研发', desc: '侧重物理层 / MIMO / 空口协议栈 / 信令流程' },
  { id: 'opt', name: '网优', desc: '侧重组网架构 / 射频网优 / KPI / 投诉处理' },
  { id: 'all', name: '通用', desc: '全库均衡抽取，各章节等概率' }
]
const trackWeights = {
  rd: { 1: 1, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  opt: { 1: 2, 2: 1, 3: 1, 4: 1, 5: 2, 6: 3, 7: 3, 8: 2, 9: 1 },
  all: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1 }
}
const durations = [15, 30]
const suggestedSeconds = { 易: 90, 中: 120, 难: 180 }
const difficultyClass = { 易: 'easy', 中: 'mid', 难: 'hard' }
const frequencyClass = { 高: 'high', 中: 'mid', 低: 'low' }
const statusText = { yes: '答上', no: '没答', skip: '跳过', timeout: '超时' }

// 抽题、计时与随机数仅客户端进行（SSR 构建期只渲染配置面板）
const phase = ref('config') // config | interview | result
const track = ref('all')
const durationChoice = ref(15)

const queue = ref([])
const index = ref(0)
const results = ref([]) // 'yes' | 'no' | 'skip' | 'timeout' | null
const revealed = ref([])
const totalLeft = ref(0) // 本场剩余秒数
const qLeft = ref(0) // 当前题剩余秒数
const qSuggested = ref(0)
const endedBy = ref('manual') // time | manual | done
const elapsed = ref(0)

// ---------- 历史场次（仅客户端，localStorage 持久化，最多 20 条） ----------
const storageReady = ref(false)
const history = ref([])

function safeStorage() {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null
  }
}

function loadHistory() {
  const ls = safeStorage()
  if (!ls) return
  try {
    const raw = ls.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (Array.isArray(data)) history.value = data.slice(0, 20)
  } catch {
    /* 数据损坏则忽略，按空状态使用 */
  }
}

function saveHistory() {
  const ls = safeStorage()
  if (!ls) return
  try {
    ls.setItem(STORAGE_KEY, JSON.stringify(history.value.slice(0, 20)))
  } catch {
    /* 写入失败（隐私模式/超额）不影响交互 */
  }
}

const recent = computed(() => history.value.slice(0, 5))

// ---------- 抽题（按岗位权重无放回随机排序，Fisher–Yates 变体） ----------
function weightedShuffle(items, weights) {
  const arr = items.map((q) => ({ q, w: weights[q.chapter] ?? 1 }))
  const out = []
  while (arr.length) {
    const total = arr.reduce((s, x) => s + x.w, 0)
    let r = Math.random() * total
    let idx = arr.length - 1
    for (let i = 0; i < arr.length; i++) {
      r -= arr[i].w
      if (r <= 0) {
        idx = i
        break
      }
    }
    out.push(arr[idx].q)
    arr.splice(idx, 1)
  }
  return out
}

const current = computed(() => queue.value[index.value] || null)
const yesCount = computed(
  () => results.value.filter((r) => r === 'yes').length
)

function start() {
  const weights = trackWeights[track.value] || trackWeights.all
  queue.value = weightedShuffle(quiz.items, weights)
  index.value = 0
  results.value = queue.value.map(() => null)
  revealed.value = queue.value.map(() => false)
  totalLeft.value = durationChoice.value * 60
  endedBy.value = 'manual'
  beginQuestion()
  phase.value = 'interview'
}

function beginQuestion() {
  const q = queue.value[index.value]
  qSuggested.value = suggestedSeconds[q.difficulty] || 120
  qLeft.value = qSuggested.value
}

// ---------- 计时（每秒 tick，仅面试进行中运行） ----------
let timer = null

function startTick() {
  stopTick()
  timer = setInterval(tick, 1000)
}

function stopTick() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function tick() {
  if (totalLeft.value > 0) totalLeft.value--
  if (qLeft.value > 0) qLeft.value--
  if (totalLeft.value <= 0) {
    if (results.value[index.value] == null) results.value[index.value] = 'timeout'
    finish('time')
    return
  }
  if (qLeft.value <= 0) {
    results.value[index.value] = 'timeout'
    advance()
  }
}

function advance() {
  if (index.value < queue.value.length - 1) {
    index.value++
    beginQuestion()
  } else {
    finish('done')
  }
}

function answer(v) {
  results.value[index.value] = v
  advance()
}

function toggleHint() {
  revealed.value[index.value] = !revealed.value[index.value]
}

const endedText = computed(() =>
  endedBy.value === 'time' ? '时间到' : endedBy.value === 'done' ? '题目已答完' : '手动结束'
)

// ---------- 结束统计 ----------
const presented = computed(() => {
  if (!queue.value.length) return 0
  return Math.min(index.value + 1, queue.value.length)
})
const counts = computed(() => {
  const res = results.value.slice(0, presented.value)
  const c = { yes: 0, no: 0, skip: 0, timeout: 0 }
  for (const r of res) if (r && c[r] !== undefined) c[r]++
  return c
})
const total = computed(() => presented.value)
const rate = computed(() =>
  total.value ? Math.round((counts.value.yes / total.value) * 100) : 0
)
const reviewList = computed(() =>
  queue.value
    .slice(0, presented.value)
    .map((q, i) => ({ q, status: results.value[i] }))
    .filter(({ status }) => status === 'no' || status === 'timeout')
)

const encourage = computed(() => {
  const r = rate.value
  if (!total.value) return '还没来得及作答，再开一场试试。'
  if (r >= 90) return '表现出色，面试官都要点头了，保持手感！'
  if (r >= 70) return '发挥稳健，把没答上的题补一补就更好了。'
  if (r >= 50) return '有基础也有短板，针对性复习后再来一场。'
  return '别灰心，先过一遍参考要点，下一场会更好。'
})

function finish(kind) {
  stopTick()
  if (results.value[index.value] == null) results.value[index.value] = 'timeout'
  endedBy.value = kind
  elapsed.value = Math.max(durationChoice.value * 60 - Math.max(totalLeft.value, 0), 0)
  if (total.value > 0) {
    history.value.unshift({
      at: new Date().toLocaleString(),
      track: (tracks.find((t) => t.id === track.value) || tracks[2]).name,
      total: total.value,
      yes: counts.value.yes,
      rate: rate.value
    })
    history.value = history.value.slice(0, 20)
    saveHistory()
  }
  phase.value = 'result'
}

function restart() {
  phase.value = 'config'
}

function fmt(s) {
  const m = Math.floor(Math.max(s, 0) / 60)
  const ss = Math.max(s, 0) % 60
  return `${m}:${String(ss).padStart(2, '0')}`
}

watch(phase, (p) => {
  if (p === 'interview') startTick()
  else stopTick()
})

onMounted(() => {
  loadHistory()
  storageReady.value = true
})

onUnmounted(stopTick)
</script>

<template>
  <div class="mock-interview">
    <!-- 配置面板 -->
    <div v-if="phase === 'config'" class="panel">
      <h2>模拟面试配置</h2>

      <div class="field">
        <p class="label">面试岗位方向</p>
        <div class="chips" role="group" aria-label="岗位方向单选">
          <button
            v-for="t in tracks"
            :key="t.id"
            type="button"
            class="chip"
            :class="{ active: track === t.id }"
            @click="track = t.id"
          >
            {{ t.name }}
          </button>
        </div>
        <p class="track-desc">{{ (tracks.find((t) => t.id === track) || tracks[2]).desc }}</p>
      </div>

      <div class="field">
        <p class="label">面试时长</p>
        <div class="chips" role="group" aria-label="时长单选">
          <button
            v-for="n in durations"
            :key="n"
            type="button"
            class="chip"
            :class="{ active: durationChoice === n }"
            @click="durationChoice = n"
          >
            {{ n }} 分钟
          </button>
        </div>
      </div>

      <p class="matched">
        题库共 <strong>{{ quiz.items.length }}</strong> 题，按方向加权随机抽取；
        建议用时：易 90 秒 / 中 120 秒 / 难 180 秒，超时自动进入下一题
      </p>
      <p class="actions">
        <button type="button" class="btn primary" @click="start">开始模拟面试</button>
      </p>
    </div>

    <!-- 面试进行中 -->
    <div v-else-if="phase === 'interview' && current" class="panel quiz">
      <p class="progress">
        第 <strong>{{ index + 1 }}</strong> 题 · 剩余
        <strong :class="{ urgent: totalLeft <= 60 }">{{ fmt(totalLeft) }}</strong>
        <span class="score-hint">已答上 {{ yesCount }} 题</span>
      </p>
      <div class="bar">
        <div
          class="bar-fill"
          :style="{ width: `${(totalLeft / (durationChoice * 60)) * 100}%` }"
        ></div>
      </div>

      <div class="badges">
        <span class="badge chapter">{{ current.chapterName }}</span>
        <span :class="['badge', difficultyClass[current.difficulty]]">
          难度 {{ current.difficulty }}
        </span>
        <span :class="['badge', frequencyClass[current.frequency]]">
          频率 {{ current.frequency }}
        </span>
      </div>

      <h2 class="qtitle">{{ current.title }}</h2>

      <p class="q-timer">
        本题建议 {{ qSuggested }} 秒 · 剩余 <strong :class="{ urgent: qLeft / qSuggested < 0.2 }">{{ fmt(qLeft) }}</strong>
      </p>
      <div class="bar q">
        <div
          class="bar-fill"
          :class="{ urgent: qLeft / qSuggested < 0.2 }"
          :style="{ width: `${(qLeft / qSuggested) * 100}%` }"
        ></div>
      </div>

      <p class="hint-toggle">
        <button type="button" class="mini" @click="toggleHint">
          参考要点 {{ revealed[index] ? '（收起）' : '（点开查看）' }}
        </button>
      </p>
      <section v-if="revealed[index]" class="hint" v-html="current.sections.brief"></section>

      <p class="actions">
        <button type="button" class="btn yes" @click="answer('yes')">答上来了 ✓</button>
        <button type="button" class="btn no" @click="answer('no')">没答上 ✗</button>
        <button type="button" class="btn" @click="answer('skip')">跳过</button>
        <button type="button" class="btn danger" @click="finish('manual')">结束面试</button>
      </p>
    </div>

    <!-- 结束页 -->
    <div v-else-if="phase === 'result'" class="panel result">
      <h2>模拟面试结果</h2>
      <p class="ended-line">
        结束方式：{{ endedText }} ｜ 用时 {{ fmt(elapsed) }} ｜ 方向：{{ (tracks.find((t) => t.id === track) || tracks[2]).name }}
      </p>

      <p class="score-line">
        答上 <strong class="big">{{ counts.yes }}</strong> / {{ total }}
        <span v-if="total" class="rate">正确率 {{ rate }}%</span>
        <span v-else class="rate">正确率 —</span>
      </p>
      <p class="counts-line">
        没答 <strong>{{ counts.no }}</strong> ｜ 跳过 <strong>{{ counts.skip }}</strong> ｜
        超时 <strong>{{ counts.timeout }}</strong>
      </p>

      <p class="encourage">{{ encourage }}</p>

      <template v-if="reviewList.length">
        <h3>没答上 / 超时题目（点击回顾）</h3>
        <ul class="wrong">
          <li v-for="{ q, status } in reviewList" :key="q.id">
            <span
              :class="['badge', status === 'timeout' ? 'hard' : 'mid']"
            >{{ statusText[status] }}</span>
            <a :href="withBase(q.url)">{{ q.title }}</a>
            <span class="chapter-name">{{ q.chapterName }}</span>
          </li>
        </ul>
      </template>
      <p v-else-if="total" class="perfect">本次全部答上，太棒了！</p>

      <template v-if="recent.length">
        <h3>最近 {{ recent.length }} 场趋势</h3>
        <div class="trend">
          <div v-for="(h, i) in recent" :key="i" class="trend-row">
            <span class="trend-label">{{ h.at }} · {{ h.track }}</span>
            <span class="trend-bar">
              <span class="trend-fill" :style="{ width: `${h.rate}%` }"></span>
            </span>
            <span class="trend-rate">{{ h.rate }}%</span>
          </div>
        </div>
      </template>

      <p class="actions">
        <button type="button" class="btn primary" @click="restart">再模拟一场</button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.mock-interview {
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
.field {
  margin-bottom: 1rem;
}
.label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  margin: 0 0 0.4rem;
}
.mini {
  border: none;
  background: none;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font-size: 0.78rem;
  padding: 0;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.chip {
  padding: 0.18rem 0.7rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.82rem;
  line-height: 1.5;
}
.chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.chip.active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.track-desc {
  margin: 0.4rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}
.matched {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}
.matched strong {
  color: var(--vp-c-text-1);
  font-size: 1.1em;
}
.progress {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  margin: 0 0 0.4rem;
}
.progress strong.urgent {
  color: var(--vp-c-red-1);
}
.score-hint {
  font-size: 0.8rem;
}
.bar {
  height: 4px;
  border-radius: 2px;
  background: var(--vp-c-divider);
  overflow: hidden;
  margin-bottom: 1rem;
}
.bar.q {
  margin-bottom: 0.75rem;
}
.bar-fill {
  display: block;
  height: 100%;
  background: var(--vp-c-brand-1);
  transition: width 0.25s linear;
}
.bar-fill.urgent {
  background: var(--vp-c-red-1);
}
.q-timer {
  margin: 0 0 0.3rem;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
}
.q-timer strong.urgent {
  color: var(--vp-c-red-1);
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
.badge.hard,
.badge.high {
  color: var(--vp-c-red-1);
  border-color: var(--vp-c-red-1);
}
.qtitle {
  border: none;
  margin: 0 0 0.75rem;
  font-size: 1.3rem;
  line-height: 1.45;
}
.hint-toggle {
  margin: 0 0 0.4rem;
}
.hint {
  padding: 0.75rem 1rem;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}
.hint :first-child {
  margin-top: 0;
}
.hint :last-child {
  margin-bottom: 0;
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
.btn.danger {
  border-color: var(--vp-c-red-1);
  color: var(--vp-c-red-1);
  font-size: 0.8rem;
}
.btn.danger:hover:not(:disabled) {
  border-color: var(--vp-c-red-1);
  color: var(--vp-c-red-1);
  opacity: 0.8;
}
.result {
  text-align: center;
}
.ended-line {
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  margin: 0 0 0.75rem;
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
.counts-line {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}
.counts-line strong {
  color: var(--vp-c-text-1);
}
.encourage {
  margin: 0.9rem 0 0;
  color: var(--vp-c-text-1);
  font-weight: 600;
}
.result h3 {
  border: none;
  font-size: 1rem;
  text-align: left;
  margin: 1.25rem 0 0.5rem;
}
.wrong {
  list-style: none;
  padding: 0;
  text-align: left;
}
.wrong li {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.4rem 0;
  border-bottom: 1px dashed var(--vp-c-divider);
}
.chapter-name {
  margin-left: auto;
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
  white-space: nowrap;
}
.perfect {
  color: var(--vp-c-green-1);
  font-weight: 600;
}
.trend {
  text-align: left;
}
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
  min-width: 0;
}
.trend-rate {
  width: 3.2em;
  text-align: right;
  color: var(--vp-c-text-1);
  font-weight: 600;
  flex-shrink: 0;
}
@media print {
  .mock-interview {
    display: none;
  }
}
</style>
