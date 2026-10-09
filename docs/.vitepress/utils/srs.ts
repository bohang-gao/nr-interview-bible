// 间隔重复（SRS）调度工具：localStorage key 'nrb-srs-v1'
// 结构 { cards: {[id]: SrsCard}, meta: {lastReview, dailyBudget} }
// 纯函数 + 类型 + 存储读写，全部 try/catch，SSR 安全（无 window 直接返回默认值）。

import questions from '../generated/questions.json'

export const SRS_STORAGE_KEY = 'nrb-srs-v1'

// 简化 SM-2：stage 0-8，stage 1-6 的答对间隔（天），stage 0→1 固定 1 天，stage 7/8 视为毕业封顶
export const SRS_INTERVAL_DAYS = [1, 3, 7, 16, 35, 70]
export const SRS_MAX_STAGE = 8
export const SRS_DEFAULT_BUDGET = 3

/** 一张复习卡片 */
export interface SrsCard {
  id: string
  /** 0-8：0=未学/重置，1=刚学，逐级进阶 */
  stage: number
  /** 下次到期时间戳（ms） */
  due: number
  /** 最近一次自评时间戳（ms） */
  last: number
  /** 累计答错次数 */
  lapses: number
  /** 累计复习次数 */
  reps: number
}

interface SrsMeta {
  lastReview: number
  dailyBudget: number
}

interface SrsStore {
  cards: Record<string, SrsCard>
  meta: SrsMeta
}

const DAY_MS = 24 * 60 * 60 * 1000

function emptyStore(): SrsStore {
  return { cards: {}, meta: { lastReview: 0, dailyBudget: SRS_DEFAULT_BUDGET } }
}

function normalizeCard(raw: unknown, id: string): SrsCard | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const stage = Number(r.stage)
  const due = Number(r.due)
  return {
    id,
    stage: Number.isFinite(stage) ? Math.min(SRS_MAX_STAGE, Math.max(0, Math.floor(stage))) : 0,
    due: Number.isFinite(due) ? due : 0,
    last: Number(r.last) || 0,
    lapses: Number(r.lapses) || 0,
    reps: Number(r.reps) || 0
  }
}

/** 读取存储；SSR/损坏数据返回默认空状态 */
export function loadSrsStore(): SrsStore {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return emptyStore()
    const raw = window.localStorage.getItem(SRS_STORAGE_KEY)
    if (!raw) return emptyStore()
    const data = JSON.parse(raw)
    if (!data || typeof data !== 'object' || Array.isArray(data)) return emptyStore()
    const out = emptyStore()
    const cards = (data as Record<string, unknown>).cards
    if (cards && typeof cards === 'object' && !Array.isArray(cards)) {
      for (const [id, v] of Object.entries(cards)) {
        const card = normalizeCard(v, id)
        if (card) out.cards[id] = card
      }
    }
    const meta = (data as Record<string, unknown>).meta
    if (meta && typeof meta === 'object') {
      const m = meta as Record<string, unknown>
      if (Number(m.dailyBudget) > 0) out.meta.dailyBudget = Math.floor(Number(m.dailyBudget))
      out.meta.lastReview = Number(m.lastReview) || 0
    }
    return out
  } catch {
    return emptyStore()
  }
}

/** 写入存储；SSR/隐私模式静默失败 */
export function saveSrsStore(store: SrsStore): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    window.localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(store))
  } catch {
    /* 写入失败不影响交互 */
  }
}

/** 简化读取入口：仅卡片表 */
export function loadSrs(): Record<string, SrsCard> {
  return loadSrsStore().cards
}

/** 到期判定：due <= now（首次写入前 due=0 视为未入队，不算到期） */
export function isDue(card: SrsCard, now: number = Date.now()): boolean {
  return card.due > 0 && card.due <= now
}

/** 答对：stage+1（封顶 8），due = now + 间隔天数；答错：stage 退 2（可到 0），due = now+1 天 */
export function answerCard(
  id: string,
  correct: boolean,
  now: number = Date.now()
): SrsCard | null {
  if (!id) return null
  const store = loadSrsStore()
  const prev = store.cards[id]
  const card: SrsCard = prev
    ? { ...prev }
    : { id, stage: 0, due: 0, last: 0, lapses: 0, reps: 0 }

  if (correct) {
    card.stage = Math.min(SRS_MAX_STAGE, card.stage + 1)
    // stage 0 答对 → stage 1，间隔 1 天；stage n 答对 → 间隔取 days 序列
    const days =
      card.stage === 1 ? 1 : SRS_INTERVAL_DAYS[Math.min(card.stage, SRS_INTERVAL_DAYS.length) - 1]
    card.due = now + days * DAY_MS
  } else {
    card.stage = Math.max(0, card.stage - 2)
    card.due = now + DAY_MS
    card.lapses += 1
  }
  card.last = now
  card.reps += 1
  store.cards[id] = card
  store.meta.lastReview = now
  saveSrsStore(store)
  return { ...card }
}

/** 章节轮转取新卡：按 chapter 分组后从各章轮转取题，避免新题扎堆同一章 */
function pickRounds(ids: string[], n: number): string[] {
  const byChapter = new Map<number, string[]>()
  for (const id of ids) {
    const q = questions.find((x) => x.id === id)
    if (!q) continue
    const list = byChapter.get(q.chapter) || []
    list.push(id)
    byChapter.set(q.chapter, list)
  }
  const chapters = [...byChapter.keys()].sort((a, b) => a - b)
  const out: string[] = []
  let round = 0
  while (out.length < n) {
    let pickedThisRound = false
    for (const ch of chapters) {
      const list = byChapter.get(ch)!
      if (round < list.length) {
        out.push(list[round])
        pickedThisRound = true
        if (out.length >= n) break
      }
    }
    if (!pickedThisRound) break
    round++
  }
  return out
}

/**
 * 领取 n 张新卡（未学过的题）：写入 stage=1、due=now+1 天。
 * 传入的 candidates 为题库全量 id（由调用方给），默认用题库全量。
 */
export function addNewCards(n: number, now: number = Date.now()): SrsCard[] {
  if (n <= 0) return []
  const store = loadSrsStore()
  const seen = new Set(Object.keys(store.cards))
  const fresh = questions.map((q) => q.id).filter((id) => !seen.has(id))
  if (fresh.length === 0) return []
  const picked = pickRounds(fresh, Math.min(n, fresh.length))
  const out: SrsCard[] = []
  for (const id of picked) {
    const card: SrsCard = { id, stage: 1, due: now + DAY_MS, last: now, lapses: 0, reps: 0 }
    store.cards[id] = card
    out.push({ ...card })
  }
  store.meta.lastReview = now
  saveSrsStore(store)
  return out
}

export interface SrsDueInfo {
  /** 到期卡（按 due 最早优先） */
  due: SrsCard[]
  /** 今日还可学的新题名额 */
  newBudget: number
  /** 今日预算上限（meta.dailyBudget，默认 3） */
  dailyBudget: number
  /** 今日已领的新题数（今日 last 落在当天且 reps<=1 视为今日新学） */
  newToday: number
}

function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** 今日到期队列 + 新题预算（预算 = 每日预算 - 今日已学新题数，最小 0） */
export function dueCards(now: number = Date.now()): SrsDueInfo {
  const store = loadSrsStore()
  const dayStart = startOfDay(now)
  const due = Object.values(store.cards)
    .filter((c) => isDue(c, now))
    .sort((a, b) => a.due - b.due)
  let newToday = 0
  for (const c of Object.values(store.cards)) {
    // 今日领取的新卡：last 在今天之后且尚未做过一次正式复习
    if (c.last >= dayStart && c.stage === 1 && c.reps === 0) newToday++
  }
  const dailyBudget = store.meta.dailyBudget || SRS_DEFAULT_BUDGET
  return {
    due,
    newBudget: Math.max(0, dailyBudget - newToday),
    dailyBudget,
    newToday
  }
}

export interface SrsStats {
  total: number
  due: number
  learned: number
  lapses: number
  reps: number
  /** stage 分布 {[stage]: count} */
  stages: Record<number, number>
  meta: SrsMeta
}

/** 全局统计（题库页徽标/完成页复用） */
export function srsStats(now: number = Date.now()): SrsStats {
  const store = loadSrsStore()
  const cards = Object.values(store.cards)
  const stages: Record<number, number> = {}
  let lapses = 0
  let reps = 0
  for (const c of cards) {
    stages[c.stage] = (stages[c.stage] || 0) + 1
    lapses += c.lapses
    reps += c.reps
  }
  return {
    total: cards.length,
    due: cards.filter((c) => isDue(c, now)).length,
    learned: cards.filter((c) => c.stage > 0).length,
    lapses,
    reps,
    stages,
    meta: { ...store.meta }
  }
}

/** 手动改每日新题预算 */
export function setDailyBudget(n: number): void {
  if (!Number.isFinite(n) || n <= 0) return
  const store = loadSrsStore()
  store.meta.dailyBudget = Math.floor(n)
  saveSrsStore(store)
}
