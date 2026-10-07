<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress/client'
import {
  formatTime,
  loadNotes,
  questionMeta,
  saveNotes
} from '../utils/notes'

const mounted = ref(false)
const notes = ref({}) // { [id]: {text, updatedAt} }
const keyword = ref('')
const editingId = ref('')
const editText = ref('')
const savedFlash = ref('') // 刚保存的题目 id，闪一下「已自动保存」

let saveTimer = null
let flashTimer = null

onMounted(() => {
  mounted.value = true
  notes.value = loadNotes()
})

onBeforeUnmount(() => {
  if (saveTimer) clearTimeout(saveTimer)
  if (flashTimer) clearTimeout(flashTimer)
})

const entries = computed(() =>
  Object.entries(notes.value)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
)

const filtered = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return entries.value
  return entries.value.filter(({ id, text }) => {
    const meta = questionMeta(id)
    return (
      (meta && meta.title.toLowerCase().includes(kw)) ||
      text.toLowerCase().includes(kw)
    )
  })
})

// 按章分组（组内按更新时间倒序）
const grouped = computed(() => {
  const map = new Map()
  for (const e of filtered.value) {
    const meta = questionMeta(e.id)
    const key = meta ? `ch${String(meta.chapter).padStart(2, '0')} ${meta.chapterName}` : '其他题目'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(e)
  }
  return [...map.entries()].map(([chapter, items]) => ({ chapter, items }))
})

const lastUpdated = computed(() =>
  entries.value.length ? entries.value[0].updatedAt : 0
)

function startEdit(e) {
  editingId.value = e.id
  editText.value = e.text
}

function cancelEdit() {
  editingId.value = ''
  editText.value = ''
}

function onEditInput() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(persistEdit, 800)
}

function persistEdit() {
  const id = editingId.value
  if (!id) return
  const next = loadNotes()
  const trimmed = editText.value.trim()
  if (trimmed) {
    next[id] = { text: editText.value, updatedAt: Date.now() }
  } else {
    delete next[id]
  }
  saveNotes(next)
  notes.value = next
  if (!trimmed) editingId.value = ''
  savedFlash.value = id
  if (flashTimer) clearTimeout(flashTimer)
  flashTimer = setTimeout(() => (savedFlash.value = ''), 2000)
}

function removeNote(id) {
  if (typeof window !== 'undefined' && !window.confirm('确定删除这条笔记吗？')) return
  if (saveTimer) clearTimeout(saveTimer)
  const next = loadNotes()
  delete next[id]
  saveNotes(next)
  notes.value = next
  if (editingId.value === id) cancelEdit()
}

// ---------- 导出 / 导入 ----------
function exportNotes() {
  try {
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), notes: notes.value }, null, 2)],
      { type: 'application/json' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nrb-notes-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    /* 导出失败不影响页面 */
  }
}

const fileInput = ref(null)

function pickImport() {
  fileInput.value?.click()
}

function onImportFile(ev) {
  const file = ev.target.files && ev.target.files[0]
  ev.target.value = '' // 允许重复选择同一文件
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result))
      const incoming = data && typeof data === 'object' && data.notes ? data.notes : data
      if (!incoming || typeof incoming !== 'object' || Array.isArray(incoming)) {
        window.alert('文件格式不正确：需要笔记导出 JSON')
        return
      }
      const current = loadNotes()
      let merged = 0
      for (const [id, v] of Object.entries(incoming)) {
        if (!v || typeof v !== 'object' || typeof v.text !== 'string') continue
        const cur = current[id]
        // 同 id 以更新时间新者胜；导入条目无时间戳视为最新
        if (!cur || (Number(v.updatedAt) || Infinity) >= cur.updatedAt) {
          current[id] = { text: v.text, updatedAt: Number(v.updatedAt) || Date.now() }
          merged++
        }
      }
      if (
        typeof window !== 'undefined' &&
        !window.confirm(`将合并 ${merged} 条笔记（同题以更新时间新者胜），继续吗？`)
      ) {
        return
      }
      saveNotes(current)
      notes.value = current
    } catch {
      window.alert('导入失败：文件不是有效的 JSON')
    }
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="notes-center">
    <template v-if="mounted">
      <p v-if="entries.length" class="stats">
        共 <strong>{{ entries.length }}</strong> 条笔记
        <template v-if="lastUpdated">｜最近更新 {{ formatTime(lastUpdated) }}</template>
      </p>

      <input
        v-if="entries.length"
        v-model="keyword"
        class="search"
        type="search"
        placeholder="搜索题目标题或笔记内容…"
        aria-label="搜索笔记"
      />

      <p v-if="entries.length === 0" class="empty">
        还没有笔记。在任意题目页底部写笔记，会汇总到这里。
      </p>

      <template v-else>
        <p v-if="filtered.length === 0" class="empty">无匹配笔记</p>

        <div v-for="g in grouped" :key="g.chapter" class="group">
          <h2>{{ g.chapter }}<span class="group-count">{{ g.items.length }} 条</span></h2>
          <ul>
            <li v-for="e in g.items" :key="e.id">
              <template v-if="editingId === e.id">
                <textarea
                  v-model="editText"
                  class="edit-area"
                  rows="4"
                  @input="onEditInput"
                ></textarea>
                <div class="edit-footer">
                  <span v-if="savedFlash === e.id" class="saved">已自动保存</span>
                  <span class="edit-count">{{ editText.replace(/\s/g, '').length }} 字</span>
                  <button type="button" class="btn" @click="cancelEdit">收起</button>
                  <button type="button" class="btn danger" @click="removeNote(e.id)">删除</button>
                </div>
              </template>
              <template v-else>
                <div class="row">
                  <a
                    v-if="questionMeta(e.id)"
                    :href="withBase(questionMeta(e.id).url)"
                    class="qtitle"
                  >{{ questionMeta(e.id).title }}</a>
                  <span v-else class="qtitle">{{ e.id }}</span>
                  <span class="time">{{ formatTime(e.updatedAt) }}</span>
                </div>
                <p class="excerpt">{{ e.text }}</p>
                <div class="row actions">
                  <button type="button" class="btn" @click="startEdit(e)">编辑</button>
                  <button type="button" class="btn danger" @click="removeNote(e.id)">删除</button>
                </div>
              </template>
            </li>
          </ul>
        </div>
      </template>

      <div class="io">
        <button type="button" class="btn" :disabled="entries.length === 0" @click="exportNotes">
          导出 JSON
        </button>
        <button type="button" class="btn" @click="pickImport">导入 JSON</button>
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="io-file"
          @change="onImportFile"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.notes-center {
  max-width: 760px;
}
.stats {
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}
.stats strong {
  color: var(--vp-c-text-1);
  font-size: 1.1em;
}
.search {
  width: 100%;
  box-sizing: border-box;
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}
.search:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.empty {
  color: var(--vp-c-text-2);
  text-align: center;
  padding: 2rem 0;
}
.group h2 {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  border: none;
  margin-top: 1.5rem;
  font-size: 1.05rem;
}
.group-count {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--vp-c-text-2);
}
.group ul {
  list-style: none;
  padding: 0;
}
.group li {
  padding: 0.6rem 0;
  border-bottom: 1px dashed var(--vp-c-divider);
}
.row {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.row.actions {
  margin-top: 0.35rem;
}
.qtitle {
  font-weight: 500;
}
.time {
  margin-left: auto;
  color: var(--vp-c-text-2);
  font-size: 0.78rem;
  white-space: nowrap;
}
.excerpt {
  margin: 0.3rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.edit-area {
  width: 100%;
  box-sizing: border-box;
  min-height: 5.5rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.88rem;
  line-height: 1.6;
  font-family: inherit;
  resize: vertical;
}
.edit-area:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.edit-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}
.saved {
  color: var(--vp-c-green-1);
}
.edit-count {
  margin-left: auto;
}
.btn {
  padding: 0.2rem 0.75rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 0.8rem;
  transition: border-color 0.25s, color 0.25s;
}
.btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn.danger {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-red-1);
}
.btn.danger:hover:not(:disabled) {
  border-color: var(--vp-c-red-1);
  color: var(--vp-c-red-1);
}
.io {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--vp-c-divider);
}
.io-file {
  display: none;
}
</style>
