// 笔记存取工具：localStorage key 'nrb-notes-v1'，结构 { [questionId]: {text, updatedAt} }
// 所有调用方需在客户端环境（onMounted 之后）使用；函数内部已做 SSR 防护与 try/catch。

import questions from '../generated/questions.json'

export const NOTES_STORAGE_KEY = 'nrb-notes-v1'

// 从页面路径解析题目 id（三段式 chNN-qMMM），不匹配返回 null
export function parseQuestionId(filePath) {
  if (!filePath) return null
  const m = filePath.match(/ch(\d{2})-q(\d{3})/)
  if (!m) return null
  return `ch${m[1]}-q${m[2]}`
}

export function loadNotes() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {}
    const raw = window.localStorage.getItem(NOTES_STORAGE_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
    const out = {}
    for (const [id, v] of Object.entries(data)) {
      if (v && typeof v === 'object' && typeof v.text === 'string') {
        out[id] = { text: v.text, updatedAt: Number(v.updatedAt) || 0 }
      }
    }
    return out
  } catch {
    /* 数据损坏按空状态使用 */
    return {}
  }
}

export function saveNotes(notes) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes))
  } catch {
    /* 隐私模式/超额写入失败，不影响交互 */
  }
}

// questionId → { title, url, chapterName }；题库中查不到也能用（返回 null）
export function questionMeta(id) {
  return questions.find((q) => q.id === id) || null
}

// MM-DD HH:mm
export function formatTime(ts) {
  if (!ts) return ''
  try {
    const d = new Date(ts)
    const p = (n) => String(n).padStart(2, '0')
    return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
  } catch {
    return ''
  }
}
