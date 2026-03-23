import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, List, Plus, Repeat, Trash2 } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'

type Category = 'Health' | 'Work' | 'Personal' | 'Other'

type OneOffBlock = {
  id: string
  start: string
  end: string
  title: string
  notes: string
  category: Category
}

type RecurringBlock = OneOffBlock & {
  repeat: 'daily' | 'weekdays' | 'weekly'
  /** 0 = Sunday … 6 = Saturday (matches Date#getDay) */
  weeklyDay: number
}

const categoryBar: Record<Category, string> = {
  Health: 'bg-emerald-400',
  Work: 'bg-violet-400',
  Personal: 'bg-amber-400',
  Other: 'bg-sky-400',
}

const defaultBlocks: OneOffBlock[] = [
  {
    id: 'b1',
    start: '6:30',
    end: '7:15',
    title: 'Wake + hydrate',
    notes: 'Glass of water, open the blinds, no phone for 10 min.',
    category: 'Health',
  },
  {
    id: 'b2',
    start: '7:30',
    end: '8:00',
    title: 'Stretch & light walk',
    notes: '10 min mobility, optional loop outside.',
    category: 'Health',
  },
  {
    id: 'b3',
    start: '9:00',
    end: '11:30',
    title: 'Deep work — milestone',
    notes: 'Focus on the one milestone; notifications off.',
    category: 'Work',
  },
  {
    id: 'b4',
    start: '12:30',
    end: '13:15',
    title: 'Lunch + reset',
    notes: 'Step away from the desk.',
    category: 'Personal',
  },
  {
    id: 'b5',
    start: '14:00',
    end: '16:00',
    title: 'Collaboration block',
    notes: 'Meetings & async replies.',
    category: 'Work',
  },
  {
    id: 'b6',
    start: '18:00',
    end: '19:00',
    title: 'Gym / movement',
    notes: '',
    category: 'Health',
  },
  {
    id: 'b7',
    start: '21:00',
    end: '21:30',
    title: 'Wind-down journal',
    notes: "Three lines: win, tension, tomorrow's first step.",
    category: 'Personal',
  },
]

function dateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addMonths(d: Date, n: number): Date {
  const x = new Date(d)
  x.setMonth(x.getMonth() + n)
  return x
}

function daysInMonth(y: number, m0: number): number {
  return new Date(y, m0 + 1, 0).getDate()
}

function formatDayHeading(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

function parseMinutes(t: string): number {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return 0
  const h = Math.min(23, Math.max(0, parseInt(m[1], 10)))
  const min = Math.min(59, Math.max(0, parseInt(m[2], 10)))
  return h * 60 + min
}

function formatDuration(start: string, end: string): string {
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

function appliesRecurring(r: RecurringBlock, d: Date): boolean {
  const dow = d.getDay()
  if (r.repeat === 'daily') return true
  if (r.repeat === 'weekdays') return dow >= 1 && dow <= 5
  if (r.repeat === 'weekly') return dow === r.weeklyDay
  return false
}

function repeatLabel(r: RecurringBlock): string {
  if (r.repeat === 'daily') return 'Daily'
  if (r.repeat === 'weekdays') return 'Weekdays'
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return `Weekly · ${names[r.weeklyDay] ?? '?'}`
}

type DisplayRow =
  | { kind: 'once'; block: OneOffBlock }
  | { kind: 'recurring'; block: RecurringBlock }

let idSeq = 100

function newId(prefix: string) {
  idSeq += 1
  return `${prefix}-${idSeq}`
}

export function ScheduleScreen() {
  const today = useMemo(() => startOfDay(new Date()), [])
  const todayKey = dateKey(today)

  const [day, setDay] = useState<Date>(() => today)
  const [blocksByDate, setBlocksByDate] = useState<Record<string, OneOffBlock[]>>(() => ({
    [todayKey]: defaultBlocks.map((b) => ({ ...b })),
  }))
  const [recurring, setRecurring] = useState<RecurringBlock[]>([])

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => startOfMonth(today))

  const [openId, setOpenId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [draft, setDraft] = useState({
    title: '',
    start: '9:00',
    end: '10:00',
    notes: '',
    category: 'Personal' as Category,
    repeat: 'none' as 'none' | 'daily' | 'weekdays' | 'weekly',
  })

  const touchRef = useRef<{ x: number; y: number } | null>(null)

  const key = dateKey(day)

  const rows: DisplayRow[] = useMemo(() => {
    const once = (blocksByDate[key] ?? []).map((block) => ({ kind: 'once' as const, block }))
    const rec = recurring
      .filter((r) => appliesRecurring(r, day))
      .map((block) => ({ kind: 'recurring' as const, block }))
    const merged = [...rec, ...once]
    merged.sort((a, b) => parseMinutes(a.block.start) - parseMinutes(b.block.start))
    return merged
  }, [blocksByDate, recurring, day, key])

  const goPrevDay = useCallback(() => {
    setDay((d) => addDays(d, -1))
    setOpenId(null)
  }, [])

  const goNextDay = useCallback(() => {
    setDay((d) => addDays(d, 1))
    setOpenId(null)
  }, [])

  const goToday = useCallback(() => {
    setDay(startOfDay(new Date()))
    setOpenId(null)
  }, [])

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchRef.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchRef.current.x
    const dy = t.clientY - touchRef.current.y
    touchRef.current = null
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.15) {
      if (dx > 0) goPrevDay()
      else goNextDay()
    }
  }

  const updateOneOff = (id: string, patch: Partial<OneOffBlock>) => {
    setBlocksByDate((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }))
  }

  const updateRecurring = (id: string, patch: Partial<RecurringBlock>) => {
    setRecurring((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  const removeOneOff = (id: string) => {
    setBlocksByDate((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((b) => b.id !== id),
    }))
    setOpenId((o) => (o === `once:${id}` ? null : o))
  }

  const removeRecurring = (id: string) => {
    setRecurring((prev) => prev.filter((b) => b.id !== id))
    setOpenId((o) => (o === `rec:${id}` ? null : o))
  }

  const openAdd = () => {
    setDraft({
      title: '',
      start: '9:00',
      end: '10:00',
      notes: '',
      category: 'Personal',
      repeat: 'none',
    })
    setAddOpen(true)
  }

  const saveNew = () => {
    const title = draft.title.trim() || 'Untitled block'
    if (draft.repeat === 'none') {
      const block: OneOffBlock = {
        id: newId('blk'),
        title,
        start: draft.start,
        end: draft.end,
        notes: draft.notes,
        category: draft.category,
      }
      setBlocksByDate((prev) => ({
        ...prev,
        [key]: [...(prev[key] ?? []), block],
      }))
    } else {
      const block: RecurringBlock = {
        id: newId('rec'),
        title,
        start: draft.start,
        end: draft.end,
        notes: draft.notes,
        category: draft.category,
        repeat: draft.repeat,
        weeklyDay: day.getDay(),
      }
      setRecurring((prev) => [...prev, block])
    }
    setAddOpen(false)
  }

  const isToday = dateKey(day) === dateKey(startOfDay(new Date()))

  const calCells = useMemo(() => {
    const y = calendarMonth.getFullYear()
    const m = calendarMonth.getMonth()
    const firstDow = new Date(y, m, 1).getDay()
    const dim = daysInMonth(y, m)
    const cells: (number | null)[] = []
    for (let i = 0; i < firstDow; i++) cells.push(null)
    for (let d = 1; d <= dim; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    while (cells.length < 42) cells.push(null)
    return cells
  }, [calendarMonth])

  const selectCalendarDay = (dom: number) => {
    const y = calendarMonth.getFullYear()
    const m = calendarMonth.getMonth()
    setDay(startOfDay(new Date(y, m, dom)))
    setViewMode('list')
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="px-4 pt-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Schedule</h2>
            <p className="mt-1 text-sm text-rize-muted">
              Swipe left or right on the list to change days.
            </p>
          </div>
          <div className="flex shrink-0 rounded-2xl border border-rize-border bg-[#0a0c14]/90 p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition touch-manipulation ${
                viewMode === 'list'
                  ? 'bg-rize-accent/20 text-rize-accent'
                  : 'text-rize-muted hover:text-white'
              }`}
              aria-pressed={viewMode === 'list'}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition touch-manipulation ${
                viewMode === 'calendar'
                  ? 'bg-rize-accent/20 text-rize-accent'
                  : 'text-rize-muted hover:text-white'
              }`}
              aria-pressed={viewMode === 'calendar'}
            >
              <CalendarDays className="h-4 w-4" />
              Calendar
            </button>
          </div>
        </div>

        {viewMode === 'list' && (
          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={goPrevDay}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rize-border bg-rize-card/80 text-rize-muted transition hover:text-white touch-manipulation"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-base font-semibold text-white">{formatDayHeading(day)}</p>
              {!isToday && (
                <button
                  type="button"
                  onClick={goToday}
                  className="mt-1 text-xs font-medium text-rize-accent hover:underline"
                >
                  Jump to today
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={goNextDay}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rize-border bg-rize-card/80 text-rize-muted transition hover:text-white touch-manipulation"
              aria-label="Next day"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {viewMode === 'calendar' && (
        <div className="mt-4 flex-1 overflow-y-auto px-4 pb-28">
          <div className="rounded-[24px] border border-rize-border bg-rize-card/90 p-4">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCalendarMonth((d) => addMonths(d, -1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-rize-border bg-[#0a0c14] text-rize-muted hover:text-white touch-manipulation"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="text-sm font-semibold text-white">{formatMonthYear(calendarMonth)}</p>
              <button
                type="button"
                onClick={() => setCalendarMonth((d) => addMonths(d, 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-rize-border bg-[#0a0c14] text-rize-muted hover:text-white touch-manipulation"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-rize-muted">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                <span key={`dow-${idx}`}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calCells.map((dom, i) => {
                if (dom == null) {
                  return <div key={`e-${i}`} className="aspect-square" />
                }
                const cellDate = new Date(
                  calendarMonth.getFullYear(),
                  calendarMonth.getMonth(),
                  dom,
                )
                const cellKey = dateKey(startOfDay(cellDate))
                const selected = cellKey === key
                const isCellToday = cellKey === dateKey(startOfDay(new Date()))
                return (
                  <button
                    key={cellKey}
                    type="button"
                    onClick={() => selectCalendarDay(dom)}
                    className={`flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition touch-manipulation ${
                      selected
                        ? 'bg-rize-accent text-white shadow-[0_8px_24px_-8px_rgba(157,78,221,0.6)]'
                        : isCellToday
                          ? 'bg-white/10 text-white ring-1 ring-rize-accent/40'
                          : 'text-rize-muted hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {dom}
                  </button>
                )
              })}
            </div>
            <p className="mt-4 text-center text-xs text-rize-muted">
              Tap a day to open it in list view.
            </p>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <motion.div
          key={key}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="mt-4 flex-1 overflow-y-auto px-4 pb-28"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="space-y-3">
            {rows.length === 0 && (
              <p className="rounded-2xl border border-dashed border-rize-border bg-rize-card/40 px-4 py-8 text-center text-sm text-rize-muted">
                Nothing on this day yet. Add a block or set up a repeating activity.
              </p>
            )}
            {rows.map((row, i) => {
              const b = row.block
              const expanded =
                openId === (row.kind === 'once' ? `once:${b.id}` : `rec:${b.id}`)
              const bar = categoryBar[b.category]
              const rowKey = row.kind === 'once' ? `once:${b.id}` : `rec:${b.id}`

              return (
                <motion.article
                  key={rowKey}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.3 }}
                  className="overflow-hidden rounded-2xl border border-rize-border bg-rize-card/90 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId((o) => (o === rowKey ? null : rowKey))}
                    className="flex w-full gap-3 p-4 text-left touch-manipulation"
                  >
                    <div className={`w-1.5 shrink-0 self-stretch rounded-full ${bar}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-white">{b.title}</h3>
                        <span className="text-xs text-rize-muted">{formatDuration(b.start, b.end)}</span>
                      </div>
                      <p className="mt-1 text-sm text-rize-muted">
                        {b.start} – {b.end}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-block rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-medium text-rize-muted ring-1 ring-white/10">
                          {b.category}
                        </span>
                        {row.kind === 'recurring' && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rize-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-rize-accent ring-1 ring-rize-accent/25">
                            <Repeat className="h-3 w-3" aria-hidden />
                            {repeatLabel(row.block)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronDown
                      className={`mt-1 h-5 w-5 shrink-0 text-rize-muted transition-transform ${
                        expanded ? 'rotate-180' : ''
                      }`}
                      aria-hidden
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="border-t border-white/[0.06]"
                      >
                        <div className="space-y-4 p-4 pt-3">
                          <label className="block">
                            <span className="text-xs font-medium text-rize-muted">Title</span>
                            <input
                              value={b.title}
                              onChange={(e) =>
                                row.kind === 'once'
                                  ? updateOneOff(b.id, { title: e.target.value })
                                  : updateRecurring(b.id, { title: e.target.value })
                              }
                              className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white placeholder:text-rize-muted focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                              placeholder="What is this block for?"
                            />
                          </label>

                          <div className="grid grid-cols-2 gap-3">
                            <label className="block">
                              <span className="text-xs font-medium text-rize-muted">Start</span>
                              <input
                                value={b.start}
                                onChange={(e) =>
                                  row.kind === 'once'
                                    ? updateOneOff(b.id, { start: e.target.value })
                                    : updateRecurring(b.id, { start: e.target.value })
                                }
                                className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                                placeholder="6:30"
                                inputMode="numeric"
                              />
                            </label>
                            <label className="block">
                              <span className="text-xs font-medium text-rize-muted">End</span>
                              <input
                                value={b.end}
                                onChange={(e) =>
                                  row.kind === 'once'
                                    ? updateOneOff(b.id, { end: e.target.value })
                                    : updateRecurring(b.id, { end: e.target.value })
                                }
                                className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                                placeholder="7:15"
                                inputMode="numeric"
                              />
                            </label>
                          </div>

                          <label className="block">
                            <span className="text-xs font-medium text-rize-muted">Category</span>
                            <select
                              value={b.category}
                              onChange={(e) =>
                                row.kind === 'once'
                                  ? updateOneOff(b.id, { category: e.target.value as Category })
                                  : updateRecurring(b.id, { category: e.target.value as Category })
                              }
                              className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                            >
                              <option value="Health">Health</option>
                              <option value="Work">Work</option>
                              <option value="Personal">Personal</option>
                              <option value="Other">Other</option>
                            </select>
                          </label>

                          {row.kind === 'recurring' && (
                            <label className="block">
                              <span className="text-xs font-medium text-rize-muted">Repeat</span>
                              <select
                                value={row.block.repeat}
                                onChange={(e) => {
                                  const next = e.target.value as RecurringBlock['repeat']
                                  updateRecurring(b.id, {
                                    repeat: next,
                                    weeklyDay:
                                      next === 'weekly'
                                        ? row.block.repeat === 'weekly'
                                          ? row.block.weeklyDay
                                          : day.getDay()
                                        : row.block.weeklyDay,
                                  })
                                }}
                                className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekdays">Weekdays (Mon–Fri)</option>
                                <option value="weekly">Weekly (same weekday)</option>
                              </select>
                              <p className="mt-1 text-[11px] text-rize-muted">
                                Weekly uses the weekday you&apos;re viewing when you save changes to
                                repeat mode.
                              </p>
                            </label>
                          )}

                          <label className="block">
                            <span className="text-xs font-medium text-rize-muted">Notes</span>
                            <textarea
                              value={b.notes}
                              onChange={(e) =>
                                row.kind === 'once'
                                  ? updateOneOff(b.id, { notes: e.target.value })
                                  : updateRecurring(b.id, { notes: e.target.value })
                              }
                              rows={3}
                              className="mt-1.5 w-full resize-none rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white placeholder:text-rize-muted focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                              placeholder="Details, links, energy level…"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              row.kind === 'once' ? removeOneOff(b.id) : removeRecurring(b.id)
                            }
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 py-2.5 text-sm font-medium text-red-300/90 transition hover:bg-red-500/15 touch-manipulation"
                          >
                            <Trash2 className="h-4 w-4" />
                            {row.kind === 'once' ? 'Remove block' : 'Remove repeating rule'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              )
            })}
          </div>
        </motion.div>
      )}

      {viewMode === 'list' && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={openAdd}
          className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rize-accent-dim to-rize-accent text-white shadow-[0_12px_40px_-6px_rgba(157,78,221,0.55)] touch-manipulation"
          aria-label="Add block"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </motion.button>
      )}

      <AnimatePresence>
        {addOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              aria-label="Close"
              onClick={() => setAddOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-block-title"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-[28px] border border-white/[0.08] bg-[#0b0d16] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-24px_80px_-20px_rgba(0,0,0,0.6)]"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15" />
              <h3 id="add-block-title" className="text-lg font-semibold text-white">
                New block
              </h3>
              <p className="mt-1 text-sm text-rize-muted">
                For this day ({formatDayHeading(day)}). Repeats apply on every matching day.
              </p>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-xs font-medium text-rize-muted">Title</span>
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white placeholder:text-rize-muted focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                    placeholder="e.g. Focus sprint"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-rize-muted">Start</span>
                    <input
                      value={draft.start}
                      onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))}
                      className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                      placeholder="9:00"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-rize-muted">End</span>
                    <input
                      value={draft.end}
                      onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))}
                      className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                      placeholder="10:30"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-medium text-rize-muted">Category</span>
                  <select
                    value={draft.category}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, category: e.target.value as Category }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                  >
                    <option value="Health">Health</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-rize-muted">Repeat</span>
                  <select
                    value={draft.repeat}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        repeat: e.target.value as typeof draft.repeat,
                      }))
                    }
                    className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                  >
                    <option value="none">Once — only this day</option>
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays (Mon–Fri)</option>
                    <option value="weekly">Weekly — every {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}</option>
                  </select>
                  <p className="mt-1 text-[11px] text-rize-muted">
                    Repeating blocks show on every day that matches the rule. Edit or remove them from
                    any day.
                  </p>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-rize-muted">Notes</span>
                  <textarea
                    value={draft.notes}
                    onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                    rows={2}
                    className="mt-1.5 w-full resize-none rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white placeholder:text-rize-muted focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                    placeholder="Optional"
                  />
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAddOpen(false)}
                  className="flex-1 rounded-2xl border border-rize-border py-3 text-sm font-semibold text-rize-muted transition hover:bg-white/5 touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveNew}
                  className="flex-1 rounded-2xl bg-rize-accent py-3 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(157,78,221,0.5)] transition hover:bg-[#a855f0] touch-manipulation"
                >
                  {draft.repeat === 'none' ? 'Add to day' : 'Save repeat'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
