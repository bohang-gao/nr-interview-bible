<script setup>
import { computed, onMounted, ref } from 'vue'
import questions from '../generated/questions.json'

const difficultyClass = { 易: 'easy', 中: 'mid', 难: 'hard' }
const frequencyClass = { 高: 'high', 中: 'mid', 低: 'low' }

function hashDate(str) {
  let h = 0
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h
}

function localDateStr() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// 每日一题：本地日期字符串 hash 对 300 取模，同一天所有人同题。
// 首渲染在 SSR/客户端均以 questions[0] 占位，onMounted 后才绑定真实每日题，
// 避免构建期与运行时日期不一致导致 hydration mismatch。
const daily = ref(questions[0])

const today = ref('')

onMounted(() => {
  const str = localDateStr()
  today.value = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }).format(new Date(`${str}T00:00:00`))
  daily.value = questions[hashDate(str) % questions.length] || questions[0]
})

const randomQuestion = ref(null)
const current = computed(() => randomQuestion.value || daily.value)

function shuffle() {
  if (questions.length === 0) return
  randomQuestion.value =
    questions[Math.floor(Math.random() * questions.length)]
}
</script>

<template>
  <div class="daily-question">
    <p v-if="!current" class="empty">题库生成中</p>
    <template v-else>
      <p class="date-line">{{ today || '\u00a0' }}</p>
      <p class="mode-line">
        <span class="badge mode">{{ randomQuestion ? '随机一题' : '每日一题' }}</span>
        <span class="badge chapter">{{ current.chapterName }}</span>
      </p>
      <h2 class="qtitle">
        <a :href="current.url">{{ current.title }}</a>
      </h2>
      <div class="badges">
        <span :class="['badge', difficultyClass[current.difficulty]]"
          >难度 {{ current.difficulty }}</span
        >
        <span :class="['badge', frequencyClass[current.frequency]]"
          >频率 {{ current.frequency }}</span
        >
        <span v-for="t in current.tags" :key="t" class="badge tag">{{ t }}</span>
      </div>
      <p class="actions">
        <a :href="current.url" class="btn primary">查看完整解析</a>
        <button type="button" class="btn" @click="shuffle">随机一题</button>
      </p>
    </template>
  </div>
</template>

<style scoped>
.daily-question {
  max-width: 640px;
  margin: 1.5rem auto 0;
  padding: 1.5rem 2rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  text-align: center;
}
.date-line {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}
.mode-line {
  display: flex;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}
.qtitle {
  border: none;
  margin: 0 0 0.9rem;
  font-size: 1.35rem;
  line-height: 1.45;
}
.qtitle a {
  color: var(--vp-c-text-1);
}
.qtitle a:hover {
  color: var(--vp-c-brand-1);
}
.badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 1.1rem;
}
.badge {
  font-size: 0.78rem;
  padding: 0.08rem 0.55rem;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  white-space: nowrap;
}
.badge.mode {
  background: var(--vp-c-brand-soft);
  border-color: transparent;
  color: var(--vp-c-brand-1);
  font-weight: 600;
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
.badge.tag {
  background: var(--vp-c-bg);
}
.actions {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0;
}
.btn {
  display: inline-block;
  padding: 0.35rem 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: border-color 0.25s, color 0.25s;
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
</style>
