<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress/client'
import quiz from '../generated/quiz.json'
import { loadNotes, saveNotes } from '../utils/notes'

const difficulties = ['易', '中', '难']
const difficultyClass = { 易: 'easy', 中: 'mid', 难: 'hard' }
const frequencyClass = { 高: 'high', 中: 'mid', 低: 'low' }
const counts = [5, 10, 20]
const STORAGE_KEY = 'nrb-selftest-v1'

// 抽题与判分仅客户端进行（SSR 构建期只渲染配置面板）
const phase = ref('config') // config | quiz | result
const selectedChapters = ref([])
const selectedDifficulties = ref([...difficulties])
const countChoice = ref(10)
const skipMastered = ref(false)

// 默答模式：先自己写要点再对照答案，输入内容不判分，对照时沉淀为笔记
const blankMode = ref(true)
const BLANK_MODE_KEY = 'nrb-selftest-blank-mode-v1'

// ---------- 错题本 / 统计（仅客户端，localStorage 持久化） ----------
const storageReady = ref(false)
const wrongBook = ref(new Set()) // 不会的题 id（去重）
const mastered = ref(new Set()) // 答会的题 id
const stats = ref({ sessions: 0, correct: 0, wrong: 0, lastAt: '' })

function safeStorage() {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null
  }
}

function loadStore() {
  const ls = safeStorage()
  if (!ls) return
  try {
    const raw = ls.getItem(STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw)
    if (data && typeof data === 'object') {
      if (Array.isArray(data.wrong)) wrongBook.value = new Set(data.wrong)
      if (Array.isArray(data.mastered)) mastered.value = new Set(data.mastered)
      if (typeof data.blankMode === 'boolean') blankMode.value = data.blankMode
      if (data.stats && typeof data.stats === 'object') {
        stats.value = {
          sessions: Number(data.stats.sessions) || 0,
          correct: Number(data.stats.correct) || 0,
          wrong: Number(data.stats.wrong) || 0,
          lastAt: typeof data.stats.lastAt === 'string' ? data.stats.lastAt : ''
        }
      }
    }
  } catch {
    /* 数据损坏则忽略，按空状态使用 */
  }
}

function saveStore() {
  const ls = safeStorage()
  if (!ls) return
  try {
    ls.setItem(
      STORAGE_KEY,
      JSON.stringify({
        wrong: [...wrongBook.value],
        mastered: [...mastered.value],
        blankMode: blankMode.value,
        stats: stats.value
      })
    )
  } catch {
    /* 写入失败（隐私模式/超额）不影响交互 */
  }
}

const allChapters = computed(() => {
  const map = new Map()
  for (const q of quiz.items) {
    if (!map.has(q.chapter)) map.set(q.chapter, q.chapterName)
  }
  return [...map.entries()].map(([id, name]) => ({ id, name }))
})

const matchedCount = computed(() => pool.value.length)

const pool = computed(() =>
  quiz.items.filter(
    (q) =>
      selectedChapters.value.includes(q.chapter) &&
      selectedDifficulties.value.includes(q.difficulty)
  )
)

// 错题重练抽题范围 = 错题本 ∩ 当前章节/难度筛选
const wrongPool = computed(() =>
  pool.value.filter((q) => wrongBook.value.has(q.id))
)

function toggleChapter(id) {
  const i = selectedChapters.value.indexOf(id)
  if (i >= 0) selectedChapters.value.splice(i, 1)
  else selectedChapters.value.push(id)
}

function toggleDifficulty(d) {
  const i = selectedDifficulties.value.indexOf(d)
  if (i >= 0) selectedDifficulties.value.splice(i, 1)
  else selectedDifficulties.value.push(d)
}

// ---------- 作答状态 ----------
const questions = ref([])
const index = ref(0)
const revealed = ref([])
const marks = ref([]) // true=会, false=不会, null=未作答
const blankInput = ref('') // 当前题默答输入（不判分）
const blankFocused = ref(false) // 获焦自动展开（textarea 增高）

const current = computed(() => questions.value[index.value] || null)
const mode = ref('normal') // normal | wrong
const wrongModeAvailable = computed(
  () => storageReady.value && wrongBook.value.size > 0
)
const progress = computed(() => `${index.value + 1}/${questions.value.length}`)
const answered = computed(
  () => marks.value[index.value] === true || marks.value[index.value] === false
)

function start() {
  let source = pool.value
  if (mode.value === 'wrong') source = wrongPool.value
  else if (skipMastered.value)
    source = source.filter((q) => !mastered.value.has(q.id))
  const poolCopy = [...source]
  // Fisher–Yates 无放回随机抽题
  for (let i = poolCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]]
  }
  questions.value = poolCopy.slice(0, Math.min(countChoice.value, poolCopy.length))
  index.value = 0
  revealed.value = questions.value.map(() => false)
  marks.value = questions.value.map(() => null)
  blankInput.value = ''
  phase.value = 'quiz'
}

function setMark(v, next = true) {
  marks.value[index.value] = v
  // 错题本 / 已掌握实时更新并持久化
  const q = questions.value[index.value]
  if (q) {
    if (v === false) {
      wrongBook.value.add(q.id)
      mastered.value.delete(q.id)
    } else {
      mastered.value.add(q.id)
      wrongBook.value.delete(q.id)
    }
    saveStore()
  }
  if (next && index.value < questions.value.length - 1) index.value++
}

function showAnswer() {
  revealed.value[index.value] = true
}

// ---------- 默答模式 ----------
function todayStr() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function saveBlankToNotes() {
  const q = questions.value[index.value]
  const content = blankInput.value.trim()
  if (!q || !content) return
  const tag = `【默答 ${todayStr()}】`
  const notes = loadNotes()
  const cur = notes[q.id]
  // 去重：同一题当天已存过默答则跳过
  if (cur && cur.text.includes(tag)) return
  const entry = `${tag}${content}\n`
  notes[q.id] = {
    text: cur ? `${cur.text}${cur.text.endsWith('\n') ? '' : '\n'}${entry}` : entry,
    updatedAt: Date.now()
  }
  saveNotes(notes)
}

function confirmBlank() {
  saveBlankToNotes()
  showAnswer()
}

function loadBlankInput() {
  blankInput.value = ''
  blankFocused.value = false
}

function prev() {
  if (index.value > 0) {
    index.value--
    loadBlankInput()
  }
}

function next() {
  if (index.value < questions.value.length - 1) {
    index.value++
    loadBlankInput()
  }
}

const score = computed(() => marks.value.filter((m) => m === true).length)
// 结束页错题列表：本次标记「不会」的题（错题重练中答会者已实时移出错题本，也不会出现在此）
const wrongList = computed(() =>
  questions.value
    .map((q, i) => ({ q, i }))
    .filter(({ i }) => marks.value[i] === false)
)

function finish() {
  // 累计统计并持久化
  stats.value = {
    sessions: stats.value.sessions + 1,
    correct: stats.value.correct + score.value,
    wrong: stats.value.wrong + (questions.value.length - score.value),
    lastAt: new Date().toLocaleString()
  }
  saveStore()
  phase.value = 'result'
}

function clearWrongBook() {
  if (typeof window !== 'undefined' && !window.confirm('确定清空全部错题吗？')) return
  wrongBook.value = new Set()
  saveStore()
}

function restart() {
  phase.value = 'config'
}

onMounted(() => {
  loadStore()
  storageReady.value = true
})

// 开关「跳过已掌握」变更时持久化
watch(skipMastered, saveStore)
</script>

<template>
  <div class="self-test">
    <!-- 配置面板 -->
    <div v-if="phase === 'config'" class="panel">
      <h2>自测配置</h2>

      <div class="field">
        <p class="label">
          章节
          <button
            type="button"
            class="mini"
            @click="
              selectedChapters =
                selectedChapters.length === allChapters.length
                  ? []
                  : allChapters.map((c) => c.id)
            "
          >
            {{ selectedChapters.length === allChapters.length ? '全不选' : '全选' }}
          </button>
        </p>
        <div class="chips" role="group" aria-label="章节多选">
          <button
            v-for="c in allChapters"
            :key="c.id"
            type="button"
            class="chip"
            :class="{ active: selectedChapters.includes(c.id) }"
            @click="toggleChapter(c.id)"
          >
            第{{ c.id }}章 {{ c.name }}
          </button>
        </div>
      </div>

      <div class="field">
        <p class="label">
          难度
          <button
            type="button"
            class="mini"
            @click="
              selectedDifficulties =
                selectedDifficulties.length === difficulties.length
                  ? []
                  : [...difficulties]
            "
          >
            {{ selectedDifficulties.length === difficulties.length ? '全不选' : '全选' }}
          </button>
        </p>
        <div class="chips" role="group" aria-label="难度多选">
          <button
            v-for="d in difficulties"
            :key="d"
            type="button"
            class="chip"
            :class="{ active: selectedDifficulties.includes(d) }"
            @click="toggleDifficulty(d)"
          >
            {{ d }}
          </button>
        </div>
      </div>

      <div class="field">
        <p class="label">题量</p>
        <div class="chips" role="group" aria-label="题量单选">
          <button
            v-for="n in counts"
            :key="n"
            type="button"
            class="chip"
            :class="{ active: countChoice === n }"
            @click="countChoice = n"
          >
            {{ n }} 题
          </button>
        </div>
      </div>

      <div class="field">
        <p class="label">练习方式</p>
        <div class="chips" role="group" aria-label="练习方式单选">
          <button
            type="button"
            class="chip"
            :class="{ active: mode === 'normal' }"
            @click="mode = 'normal'"
          >
            随机抽题
          </button>
          <button
            v-if="wrongModeAvailable"
            type="button"
            class="chip"
            :class="{ active: mode === 'wrong' }"
            @click="mode = 'wrong'"
          >
            错题重练（{{ wrongBook.size }}）
          </button>
        </div>
      </div>

      <div v-if="mode === 'normal'" class="field toggle-field">
        <label class="toggle">
          <input v-model="skipMastered" type="checkbox" />
          跳过已掌握（已答「会」{{ mastered.size }} 题不再抽到）
        </label>
      </div>

      <p class="matched">
        符合条件：<strong>{{ mode === 'wrong' ? wrongPool.length : matchedCount }}</strong> 题
      </p>
      <p class="actions">
        <button
          type="button"
          class="btn primary"
          :disabled="mode === 'wrong' ? wrongPool.length === 0 : matchedCount === 0"
          @click="start"
        >
          {{ mode === 'wrong' ? '开始错题重练' : '开始自测' }}
        </button>
      </p>
      <p v-if="mode === 'normal' && matchedCount === 0" class="warn">
        当前筛选无题目，请调整章节或难度
      </p>
      <p v-else-if="mode === 'wrong' && wrongPool.length === 0" class="warn">
        当前筛选下错题本为空，请调整章节或难度
      </p>
    </div>

    <!-- 逐题作答 -->
    <div v-else-if="phase === 'quiz' && current" class="panel quiz">
      <p class="progress">
        第 <strong>{{ index + 1 }}</strong> / {{ questions.length }} 题
        <span class="score-hint">已记「会」{{ score }} 题</span>
      </p>
      <div class="bar">
        <div
          class="bar-fill"
          :style="{ width: `${((index + 1) / questions.length) * 100}%` }"
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

      <template v-if="revealed[index]">
        <section v-html="current.sections.brief"></section>
        <section v-html="current.sections.detail"></section>
        <section v-html="current.sections.followups"></section>
        <p class="more">
          完整页面：<a :href="withBase(current.url)">{{ current.title }}</a>
        </p>
      </template>
      <p v-else class="actions">
        <button type="button" class="btn primary" @click="showAnswer">
          显示答案
        </button>
      </p>

      <p v-if="revealed[index]" class="actions">
        <button type="button" class="btn yes" @click="setMark(true)">会 ✓</button>
        <button type="button" class="btn no" @click="setMark(false)">不会 ✗</button>
        <span v-if="answered" :class="['mark-state', marks[index] ? 'ok' : 'bad']">
          已标记：{{ marks[index] ? '会' : '不会' }}
        </span>
      </p>

      <p class="nav-row">
        <button type="button" class="btn" :disabled="index === 0" @click="prev">
          上一题
        </button>
        <button
          type="button"
          class="btn"
          :disabled="index === questions.length - 1"
          @click="next"
        >
          下一题
        </button>
        <button type="button" class="btn primary" @click="finish">查看结果</button>
      </p>
    </div>

    <!-- 结束页 -->
    <div v-else-if="phase === 'result'" class="panel result">
      <h2>自测结果</h2>
      <p class="score-line">
        得分 <strong class="big">{{ score }}</strong> / {{ questions.length }}
        <span v-if="questions.length" class="rate">
          正确率 {{ Math.round((score / questions.length) * 100) }}%
        </span>
      </p>

      <template v-if="wrongList.length">
        <h3>{{ mode === 'wrong' ? '本次仍不会（保留在错题本）' : '错题（标记「不会」）' }}</h3>
        <ul class="wrong">
          <li v-for="{ q } in wrongList" :key="q.id">
            <span :class="['badge', difficultyClass[q.difficulty]]">{{ q.difficulty }}</span>
            <a :href="withBase(q.url)">{{ q.title }}</a>
            <span class="chapter-name">{{ q.chapterName }}</span>
          </li>
        </ul>
      </template>
      <p v-else class="perfect">
        {{ mode === 'wrong' ? '本次错题全部攻克，已移出错题本！' : '全部掌握，太棒了！' }}
      </p>

      <div class="persist-row">
        <p class="stats-line">
          错题本 <strong>{{ wrongBook.size }}</strong> 题
          <template v-if="storageReady">
            ｜累计练习 {{ stats.sessions }} 次（对 {{ stats.correct }} / 错 {{ stats.wrong }}）
            <template v-if="stats.lastAt">｜最近练习：{{ stats.lastAt }}</template>
          </template>
        </p>
        <button
          v-if="wrongBook.size > 0"
          type="button"
          class="btn danger"
          @click="clearWrongBook"
        >
          清空错题本
        </button>
      </div>

      <p class="actions">
        <button type="button" class="btn primary" @click="restart">再来一轮</button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.self-test {
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
.matched {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}
.matched strong {
  color: var(--vp-c-text-1);
  font-size: 1.1em;
}
.warn {
  color: var(--vp-c-red-1);
  font-size: 0.85rem;
}
.progress {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  margin: 0 0 0.4rem;
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
.badge.hard,
.badge.high {
  color: var(--vp-c-red-1);
  border-color: var(--vp-c-red-1);
}
.qtitle {
  border: none;
  margin: 0 0 1rem;
  font-size: 1.3rem;
  line-height: 1.45;
}
.more {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
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
.mark-state {
  font-size: 0.85rem;
}
.mark-state.ok {
  color: var(--vp-c-green-1);
}
.mark-state.bad {
  color: var(--vp-c-red-1);
}
.nav-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--vp-c-divider);
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
.toggle-field {
  font-size: 0.88rem;
}
.toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  color: var(--vp-c-text-2);
}
.toggle input {
  cursor: pointer;
}
.persist-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--vp-c-divider);
}
.stats-line {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}
.stats-line strong {
  color: var(--vp-c-text-1);
}
.btn.danger {
  border-color: var(--vp-c-red-1);
  color: var(--vp-c-red-1);
  font-size: 0.8rem;
  padding: 0.25rem 0.8rem;
}
.btn.danger:hover:not(:disabled) {
  border-color: var(--vp-c-red-1);
  color: var(--vp-c-red-1);
  opacity: 0.8;
}
@media print {
  .self-test {
    display: none;
  }
}
</style>
