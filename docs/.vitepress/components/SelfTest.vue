<script setup>
import { computed, ref } from 'vue'
import quiz from '../generated/quiz.json'

const difficulties = ['易', '中', '难']
const difficultyClass = { 易: 'easy', 中: 'mid', 难: 'hard' }
const frequencyClass = { 高: 'high', 中: 'mid', 低: 'low' }
const counts = [5, 10, 20]

// 抽题与判分仅客户端进行（SSR 构建期只渲染配置面板）
const phase = ref('config') // config | quiz | result
const selectedChapters = ref([])
const selectedDifficulties = ref([...difficulties])
const countChoice = ref(10)

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

const current = computed(() => questions.value[index.value] || null)
const progress = computed(() => `${index.value + 1}/${questions.value.length}`)
const answered = computed(
  () => marks.value[index.value] === true || marks.value[index.value] === false
)

function start() {
  const poolCopy = [...pool.value]
  // Fisher–Yates 无放回随机抽题
  for (let i = poolCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]]
  }
  questions.value = poolCopy.slice(0, Math.min(countChoice.value, poolCopy.length))
  index.value = 0
  revealed.value = questions.value.map(() => false)
  marks.value = questions.value.map(() => null)
  phase.value = 'quiz'
}

function setMark(v, next = true) {
  marks.value[index.value] = v
  if (next && index.value < questions.value.length - 1) index.value++
}

function prev() {
  if (index.value > 0) index.value--
}

function next() {
  if (index.value < questions.value.length - 1) index.value++
}

function showAnswer() {
  revealed.value[index.value] = true
}

const score = computed(() => marks.value.filter((m) => m === true).length)
const wrongList = computed(() =>
  questions.value
    .map((q, i) => ({ q, i }))
    .filter(({ i }) => marks.value[i] === false)
)

function finish() {
  phase.value = 'result'
}

function restart() {
  phase.value = 'config'
}
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

      <p class="matched">
        符合条件：<strong>{{ matchedCount }}</strong> 题
      </p>
      <p class="actions">
        <button
          type="button"
          class="btn primary"
          :disabled="matchedCount === 0"
          @click="start"
        >
          开始自测
        </button>
      </p>
      <p v-if="matchedCount === 0" class="warn">当前筛选无题目，请调整章节或难度</p>
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
          完整页面：<a :href="current.url">{{ current.url }}</a>
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
        <h3>错题（标记「不会」）</h3>
        <ul class="wrong">
          <li v-for="{ q } in wrongList" :key="q.id">
            <span :class="['badge', difficultyClass[q.difficulty]]">{{ q.difficulty }}</span>
            <a :href="q.url">{{ q.title }}</a>
            <span class="chapter-name">{{ q.chapterName }}</span>
          </li>
        </ul>
      </template>
      <p v-else class="perfect">全部掌握，太棒了！</p>

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
@media print {
  .self-test {
    display: none;
  }
}
</style>
