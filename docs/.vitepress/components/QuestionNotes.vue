<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import {
  formatTime,
  loadNotes,
  parseQuestionId,
  questionMeta,
  saveNotes
} from '../utils/notes'

const { page } = useData()

const questionId = computed(() => parseQuestionId(page.value.filePath))
const meta = computed(() =>
  questionId.value ? questionMeta(questionId.value) : null
)
const title = computed(() => meta.value?.title || questionId.value || '')

// 仅客户端渲染（SSR 构建期不输出）
const mounted = ref(false)
const expanded = ref(false)
const text = ref('')
const savedAt = ref(0) // 当前笔记的 updatedAt
const justSaved = ref(false)
const noteCount = ref(0) // 含空文本的历史，用于折叠行

let saveTimer = null
let savedHintTimer = null

const charCount = computed(() => text.value.replace(/\s/g, '').length)

// 费曼三段模板：点击在光标处（或末尾）插入前缀占位
const TEMPLATES = [
  { label: '用我的话解释', prefix: '【我的解释】\n' },
  { label: '关键数字', prefix: '【关键数字】\n' },
  { label: '易错点', prefix: '【易错点】\n' }
]
const textareaRef = ref(null)
const hasFeynman = computed(() => text.value.includes('【'))

function insertTemplate(prefix) {
  const el = textareaRef.value
  if (!el) {
    text.value += prefix
    onInput()
    return
  }
  const start = el.selectionStart ?? text.value.length
  const end = el.selectionEnd ?? start
  text.value = text.value.slice(0, start) + prefix + text.value.slice(end)
  onInput()
  // 插入后把光标移到占位行尾，方便直接续写
  nextTick(() => {
    const pos = start + prefix.length
    el.focus()
    el.setSelectionRange(pos, pos)
  })
}

onMounted(() => {
  mounted.value = true
  const notes = loadNotes()
  const cur = questionId.value ? notes[questionId.value] : null
  if (cur) {
    text.value = cur.text
    savedAt.value = cur.updatedAt
  }
})

onBeforeUnmount(() => {
  if (saveTimer) clearTimeout(saveTimer)
  if (savedHintTimer) clearTimeout(savedHintTimer)
})

function persist() {
  if (!questionId.value) return
  const notes = loadNotes()
  const trimmed = text.value.trim()
  if (trimmed) {
    notes[questionId.value] = { text: text.value, updatedAt: Date.now() }
  } else {
    delete notes[questionId.value]
  }
  saveNotes(notes)
  const cur = notes[questionId.value]
  savedAt.value = cur ? cur.updatedAt : 0
  noteCount.value = trimmed ? text.value.length : 0
  justSaved.value = true
  if (savedHintTimer) clearTimeout(savedHintTimer)
  savedHintTimer = setTimeout(() => (justSaved.value = false), 2000)
}

function onInput() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(persist, 800)
}

function removeNote() {
  if (typeof window !== 'undefined' && !window.confirm('确定删除这条笔记吗？')) return
  if (saveTimer) clearTimeout(saveTimer)
  text.value = ''
  justSaved.value = false
  if (!questionId.value) return
  const notes = loadNotes()
  delete notes[questionId.value]
  saveNotes(notes)
  savedAt.value = 0
  noteCount.value = 0
}
</script>

<template>
  <div v-if="mounted && questionId" class="question-notes">
    <button
      type="button"
      class="qn-toggle"
      :aria-expanded="expanded"
      @click="expanded = !expanded"
    >
      <span class="qn-title">📝 笔记</span>
      <span v-if="hasFeynman" class="qn-feynman" title="包含【】结构标记">✓ 用了费曼结构</span>
      <span v-if="!expanded && charCount > 0" class="qn-meta">
        · {{ noteCount || text.length }} 字
        <template v-if="savedAt">· {{ formatTime(savedAt) }}</template>
      </span>
      <span class="qn-arrow">{{ expanded ? '▾' : '▸' }}</span>
    </button>

    <div v-if="expanded" class="qn-body">
      <p class="qn-question">{{ title }}</p>
      <div v-if="!text" class="qn-templates">
        <button
          v-for="t in TEMPLATES"
          :key="t.prefix"
          type="button"
          class="qn-template-btn"
          @click="insertTemplate(t.prefix)"
        >
          {{ t.label }}
        </button>
      </div>
      <p class="qn-hint">写不出来=还没懂。试试先口述再落笔</p>
      <textarea
        ref="textareaRef"
        v-model="text"
        class="qn-textarea"
        rows="4"
        placeholder="写下你的理解、易错点、面试官追问……（自动保存）"
        @input="onInput"
      ></textarea>
      <div class="qn-footer">
        <span v-if="justSaved" class="qn-saved">已自动保存</span>
        <span v-else-if="savedAt" class="qn-time">更新于 {{ formatTime(savedAt) }}</span>
        <span class="qn-count">{{ charCount }} 字</span>
        <button type="button" class="qn-delete" @click="removeNote">删除</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.question-notes {
  margin: 1rem 0 0;
  padding: 0.75rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
}
.qn-toggle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  text-align: left;
}
.qn-title {
  font-weight: 600;
}
.qn-feynman {
  font-size: 0.75rem;
  color: var(--vp-c-green-1);
  white-space: nowrap;
}
.qn-meta {
  color: var(--vp-c-text-2);
  font-size: 0.8rem;
}
.qn-arrow {
  margin-left: auto;
  color: var(--vp-c-text-2);
  font-size: 0.75rem;
}
.qn-body {
  margin-top: 0.6rem;
}
.qn-question {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
.qn-templates {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}
.qn-template-btn {
  padding: 0.15rem 0.65rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 0.78rem;
  line-height: 1.5;
}
.qn-template-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.qn-hint {
  margin: 0 0 0.4rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.qn-textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 6rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  line-height: 1.6;
  font-family: inherit;
  resize: vertical;
}
.qn-textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.qn-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}
.qn-saved {
  color: var(--vp-c-green-1);
}
.qn-count {
  margin-left: auto;
}
.qn-delete {
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-red-1);
  cursor: pointer;
  font-size: 0.78rem;
  padding: 0.15rem 0.6rem;
}
.qn-delete:hover {
  border-color: var(--vp-c-red-1);
}
</style>
