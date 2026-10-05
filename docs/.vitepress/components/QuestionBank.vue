<script setup>
import { computed, ref } from 'vue'
import questions from '../generated/questions.json'

const difficultyClass = { 易: 'easy', 中: 'mid', 难: 'hard' }
const frequencyClass = { 高: 'high', 中: 'mid', 低: 'low' }
const difficulties = ['易', '中', '难']
const frequencies = ['高', '中', '低']

const selectedChapter = ref(0)
const selectedDifficulty = ref('')
const selectedFrequency = ref('')
const selectedTags = ref([])

// tags 按出现频次降序
const allTags = computed(() => {
  const count = new Map()
  for (const q of questions) {
    for (const t of q.tags) count.set(t, (count.get(t) || 0) + 1)
  }
  return [...count.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([t]) => t)
})

const chapters = computed(() => {
  const map = new Map()
  for (const q of questions) {
    if (!map.has(q.chapter)) map.set(q.chapter, q.chapterName)
  }
  return [...map.entries()].map(([id, name]) => ({ id, name }))
})

const filtered = computed(() =>
  questions.filter(
    (q) =>
      (!selectedChapter.value || q.chapter === selectedChapter.value) &&
      (!selectedDifficulty.value || q.difficulty === selectedDifficulty.value) &&
      (!selectedFrequency.value || q.frequency === selectedFrequency.value) &&
      (selectedTags.value.length === 0 ||
        selectedTags.value.every((t) => q.tags.includes(t)))
  )
)

// 仅展示有匹配题目的章节
const grouped = computed(() =>
  chapters.value
    .map((c) => ({
      ...c,
      items: filtered.value.filter((q) => q.chapter === c.id)
    }))
    .filter((c) => c.items.length > 0)
)

function toggleTag(t) {
  const i = selectedTags.value.indexOf(t)
  if (i >= 0) selectedTags.value.splice(i, 1)
  else selectedTags.value.push(t)
}
</script>

<template>
  <div class="question-bank">
    <p v-if="questions.length === 0" class="empty">题库生成中</p>
    <template v-else>
      <div class="filters">
        <select v-model.number="selectedChapter" aria-label="章节筛选">
          <option :value="0">全部章节</option>
          <option v-for="c in chapters" :key="c.id" :value="c.id">
            第{{ c.id }}章 {{ c.name }}
          </option>
        </select>

        <div class="segment" role="group" aria-label="难度筛选">
          <button
            type="button"
            :class="{ active: selectedDifficulty === '' }"
            @click="selectedDifficulty = ''"
          >
            难度全部
          </button>
          <button
            v-for="d in difficulties"
            :key="d"
            type="button"
            :class="{ active: selectedDifficulty === d }"
            @click="selectedDifficulty = selectedDifficulty === d ? '' : d"
          >
            难度{{ d }}
          </button>
        </div>

        <div class="segment" role="group" aria-label="频率筛选">
          <button
            type="button"
            :class="{ active: selectedFrequency === '' }"
            @click="selectedFrequency = ''"
          >
            频率全部
          </button>
          <button
            v-for="f in frequencies"
            :key="f"
            type="button"
            :class="{ active: selectedFrequency === f }"
            @click="selectedFrequency = selectedFrequency === f ? '' : f"
          >
            频率{{ f }}
          </button>
        </div>
      </div>

      <div class="tag-bar" role="group" aria-label="标签筛选">
        <button
          type="button"
          class="tag-chip reset"
          :class="{ active: selectedTags.length === 0 }"
          @click="selectedTags = []"
        >
          全部
        </button>
        <button
          v-for="t in allTags"
          :key="t"
          type="button"
          class="tag-chip"
          :class="{ active: selectedTags.includes(t) }"
          @click="toggleTag(t)"
        >
          {{ t }}
        </button>
      </div>

      <p class="count">共 {{ filtered.length }} 题</p>

      <p v-if="filtered.length === 0" class="empty">无匹配题目</p>

      <div v-for="c in grouped" :key="c.id" class="chapter-group">
        <h2 :id="`ch${String(c.id).padStart(2, '0')}`" tabindex="-1">
          第{{ c.id }}章 {{ c.name }}
          <span class="chapter-count">{{ c.items.length }} 题</span>
          <a class="header-anchor" :href="`#ch${String(c.id).padStart(2, '0')}`"
            >#</a
          >
        </h2>
        <ul>
          <li v-for="q in c.items" :key="q.id">
            <span class="qnum">{{ q.qnum }}</span>
            <a :href="q.url" class="qtitle">{{ q.title }}</a>
            <span class="badges">
              <span :class="['badge', difficultyClass[q.difficulty]]"
                >{{ q.difficulty }}</span
              >
              <span :class="['badge', frequencyClass[q.frequency]]"
                >{{ q.frequency }}</span
              >
              <span v-for="t in q.tags" :key="t" class="badge tag">{{ t }}</span>
            </span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
.empty {
  color: var(--vp-c-text-2);
  font-size: 1.1em;
  text-align: center;
  padding: 3rem 0;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.filters select {
  padding: 0.3rem 0.6rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.segment {
  display: inline-flex;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
}
.segment button {
  padding: 0.3rem 0.65rem;
  border: none;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.85rem;
  line-height: 1.4;
}
.segment button + button {
  border-left: 1px solid var(--vp-c-divider);
}
.segment button.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
.tag-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
}
.tag-chip {
  padding: 0.1rem 0.55rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.78rem;
  line-height: 1.5;
}
.tag-chip:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.tag-chip.active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}
.count {
  color: var(--vp-c-text-2);
}
.chapter-group h2 {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  border: none;
  margin-top: 1.5rem;
}
.chapter-count {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--vp-c-text-2);
}
.chapter-group ul {
  list-style: none;
  padding: 0;
}
.chapter-group li {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  border-bottom: 1px dashed var(--vp-c-divider);
}
.qnum {
  flex: none;
  min-width: 2.2em;
  color: var(--vp-c-text-2);
  font-variant-numeric: tabular-nums;
  font-size: 0.85rem;
}
.qtitle {
  flex: 1 1 auto;
  min-width: 12rem;
  font-weight: 500;
}
.badges {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-left: auto;
}
.badge {
  font-size: 0.75rem;
  padding: 0.05rem 0.45rem;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  white-space: nowrap;
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
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
}
</style>
