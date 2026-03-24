export type Category = 'Health' | 'Work' | 'Personal' | 'Other'

export type OneOffBlock = {
  id: string
  start: string
  end: string
  title: string
  notes: string
  category: Category
  priority?: boolean
}

export type RecurringBlock = OneOffBlock & {
  repeat: 'daily' | 'weekdays' | 'weekly'
  weeklyDay: number
}

export type DisplayRow =
  | { kind: 'once'; block: OneOffBlock }
  | { kind: 'recurring'; block: RecurringBlock }

export const categoryBar: Record<Category, string> = {
  Health: 'bg-emerald-400',
  Work: 'bg-violet-400',
  Personal: 'bg-amber-400',
  Other: 'bg-sky-400',
}

export const categoryDot: Record<Category, string> = {
  Health: 'bg-emerald-400',
  Work: 'bg-violet-400',
  Personal: 'bg-amber-400',
  Other: 'bg-sky-400',
}

export const categoryLabel: Record<Category, string> = {
  Health: '🟢 Health',
  Work: '🟣 Work',
  Personal: '🟡 Personal',
  Other: '🔵 Other',
}

export const defaultBlocks: OneOffBlock[] = [
  { id: 'b1', start: '6:30', end: '7:15', title: 'Wake + hydrate', notes: 'Glass of water, open the blinds, no phone for 10 min.', category: 'Health' },
  { id: 'b2', start: '7:30', end: '8:00', title: 'Stretch & light walk', notes: '10 min mobility, optional loop outside.', category: 'Health' },
  { id: 'b3', start: '9:00', end: '11:30', title: 'Deep work — milestone', notes: 'Focus on the one milestone; notifications off.', category: 'Work' },
  { id: 'b4', start: '12:30', end: '13:15', title: 'Lunch + reset', notes: 'Step away from the desk.', category: 'Personal' },
  { id: 'b5', start: '14:00', end: '16:00', title: 'Collaboration block', notes: 'Meetings & async replies.', category: 'Work' },
  { id: 'b6', start: '18:00', end: '19:00', title: 'Gym / movement', notes: '', category: 'Health' },
  { id: 'b7', start: '21:00', end: '21:30', title: 'Wind-down journal', notes: "Three lines: win, tension, tomorrow's first step.", category: 'Personal' },
]

export function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function addMonths(d: Date, n: number): Date {
  const x = new Date(d)
  x.setMonth(x.getMonth() + n)
  return x
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function daysInMonth(y: number, m0: number): number {
  return new Date(y, m0 + 1, 0).getDate()
}

export function parseMinutes(t: string): number {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return 0
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)))
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)))
  return h * 60 + min
}

export function formatDuration(start: string, end: string): string {
  let a = parseMinutes(start)
  let b = parseMinutes(end)
  if (a === 0 && b === 0) return '—'
  if (b <= a) b += 24 * 60
  const diff = b - a
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h && m) return `${h}h ${m}m`
  if (h) return `${h}h`
  return `${m}m`
}

export function appliesRecurring(r: RecurringBlock, d: Date): boolean {
  const dow = d.getDay()
  if (r.repeat === 'daily') return true
  if (r.repeat === 'weekdays') return dow >= 1 && dow <= 5
  if (r.repeat === 'weekly') return dow === r.weeklyDay
  return false
}

export function repeatLabel(r: RecurringBlock): string {
  if (r.repeat === 'daily') return 'Daily'
  if (r.repeat === 'weekdays') return 'Weekdays'
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return `Weekly · ${names[r.weeklyDay] ?? '?'}`
}

let idSeq = 100
export function newId(prefix: string): string {
  idSeq += 1
  return `${prefix}-${idSeq}`
}

export function getDayRows(
  blocksByDate: Record<string, OneOffBlock[]>,
  recurring: RecurringBlock[],
  d: Date,
): DisplayRow[] {
  const key = dateKey(d)
  const once = (blocksByDate[key] ?? []).map((block) => ({ kind: 'once' as const, block }))
  const rec = recurring
    .filter((r) => appliesRecurring(r, d))
    .map((block) => ({ kind: 'recurring' as const, block }))
  const merged = [...rec, ...once]
  merged.sort((a, b) => parseMinutes(a.block.start) - parseMinutes(b.block.start))
  return merged
}

export function formatDayHeading(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

export function formatMonthYear(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function toTimeInput(t: string): string {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return '09:00'
  return `${String(parseInt(m[1])).padStart(2, '0')}:${m[2]}`
}

export function fromTimeInput(v: string): string {
  if (!v) return '9:00'
  const [h, m] = v.split(':')
  return `${parseInt(h, 10)}:${m ?? '00'}`
}
