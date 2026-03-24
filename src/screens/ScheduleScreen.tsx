import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, List, Plus, Repeat, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  addDays,
  addMonths,
  categoryBar,
  categoryDot,
  dateKey,
  daysInMonth,
  formatDayHeading,
  formatDuration,
  formatMonthYear,
  fromTimeInput,
  getDayRows,
  newId,
  type OneOffBlock,
  parseMinutes,
  type RecurringBlock,
  repeatLabel,
  startOfDay,
  startOfMonth,
  toTimeInput,
} from '../lib/schedule'

type Category = OneOffBlock['category']

type Props = {
  blocksByDate: Record<string, OneOffBlock[]>
  setBlocksByDate: React.Dispatch<React.SetStateAction<Record<string, OneOffBlock[]>>>
  recurring: RecurringBlock[]
  setRecurring: React.Dispatch<React.SetStateAction<RecurringBlock[]>>
  openAddOnMount?: boolean
  onAddMounted?: () => void
}

export function ScheduleScreen({
  blocksByDate,
  setBlocksByDate,
  recurring,
  setRecurring,
  openAddOnMount,
  onAddMounted,
}: Props) {
  const now = useMemo(() => new Date(), [])
  const today = useMemo(() => startOfDay(now), [now])
  const todayKey = dateKey(today)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const [day, setDay] = useState<Date>(() => today)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => startOfMonth(today))
  const [calDir, setCalDir] = useState(0)
  const [selectedCalDay, setSelectedCalDay] = useState<Date>(() => today)

  const [openId, setOpenId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [dayDir, setDayDir] = useState(0)

  const [draft, setDraft] = useState({
    title: '',
    start: '09:00',
    end: '10:00',
    notes: '',
    category: 'Personal' as Category,
    repeat: 'none' as 'none' | 'daily' | 'weekdays' | 'weekly',
    priority: false,
  })

  // FAB scroll-aware: hide label on scroll down, show on scroll up
  const [fabCompact, setFabCompact] = useState(false)
  const lastScrollY = useRef(0)
  const listRef = useRef<HTMLDivElement>(null)

  const touchRef = useRef<{ x: number; y: number } | null>(null)

  const key = dateKey(day)
  const isToday = key === todayKey

  const rows = useMemo(() => getDayRows(blocksByDate, recurring, day), [blocksByDate, recurring, day])

  const selectedCalRows = useMemo(
    () => getDayRows(blocksByDate, recurring, selectedCalDay),
    [blocksByDate, recurring, selectedCalDay],
  )

  // Open add sheet if requested by parent
  useEffect(() => {
    if (openAddOnMount) {
      setDraft({ title: '', start: '09:00', end: '10:00', notes: '', category: 'Personal', repeat: 'none', priority: false })
      setAddOpen(true)
      onAddMounted?.()
    }
  }, [openAddOnMount, onAddMounted])

  // Scroll tracking for FAB compact mode
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const handler = () => {
      const y = el.scrollTop
      if (y > lastScrollY.current + 12) setFabCompact(true)
      if (y < lastScrollY.current - 8) setFabCompact(false)
      lastScrollY.current = y
    }
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [viewMode])

  const goPrevDay = useCallback(() => {
    setDayDir(-1)
    setDay((d) => addDays(d, -1))
    setOpenId(null)
  }, [])

  const goNextDay = useCallback(() => {
    setDayDir(1)
    setDay((d) => addDays(d, 1))
    setOpenId(null)
  }, [])

  const goToday = useCallback(() => {
    setDayDir(0)
    setDay(startOfDay(new Date()))
    setOpenId(null)
  }, [])

  const prevCalMonth = useCallback(() => {
    setCalDir(-1)
    setCalendarMonth((d) => addMonths(d, -1))
  }, [])

  const nextCalMonth = useCallback(() => {
    setCalDir(1)
    setCalendarMonth((d) => addMonths(d, 1))
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
    setDraft({ title: '', start: '09:00', end: '10:00', notes: '', category: 'Personal', repeat: 'none', priority: false })
    setAddOpen(true)
  }

  const saveNew = () => {
    const title = draft.title.trim() || 'Untitled block'
    const start = fromTimeInput(draft.start)
    const end = fromTimeInput(draft.end)
    if (draft.repeat === 'none') {
      const block: OneOffBlock = { id: newId('blk'), title, start, end, notes: draft.notes, category: draft.category, priority: draft.priority }
      setBlocksByDate((prev) => ({ ...prev, [key]: [...(prev[key] ?? []), block] }))
    } else {
      const block: RecurringBlock = {
        id: newId('rec'), title, start, end, notes: draft.notes, category: draft.category, priority: draft.priority,
        repeat: draft.repeat, weeklyDay: day.getDay(),
      }
      setRecurring((prev) => [...prev, block])
    }
    setAddOpen(false)
  }

  // Calendar grid cells
  const calCells = useMemo(() => {
    const y = calendarMonth.getFullYear()
    const m = calendarMonth.getMonth()
    const firstDow = startOfMonth(calendarMonth).getDay()
    const days = daysInMonth(y, m)
    const cells: (number | null)[] = Array(firstDow).fill(null)
    for (let d = 1; d <= days; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [calendarMonth])

  // Category dots for a calendar cell
  const getCellDots = useCallback(
    (dom: number) => {
      const d = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dom)
      const cellRows = getDayRows(blocksByDate, recurring, d)
      const cats = [...new Set(cellRows.map((r) => r.block.category))].slice(0, 3)
      return cats
    },
    [blocksByDate, recurring, calendarMonth],
  )

  // "Now" indicator insert index for list view
  const nowIndex = useMemo(() => {
    if (!isToday) return null
    for (let i = 0; i < rows.length; i++) {
      if (nowMinutes < parseMinutes(rows[i].block.start)) return i
    }
    if (rows.length > 0 && nowMinutes > parseMinutes(rows[rows.length - 1].block.end)) return rows.length
    return null
  }, [rows, nowMinutes, isToday])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Schedule</h2>
            <p className="mt-1 text-sm text-rize-muted">Swipe left or right to change days.</p>
          </div>
          <div className="flex shrink-0 rounded-2xl border border-rize-border bg-[#0a0c14]/90 p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition touch-manipulation ${
                viewMode === 'list' ? 'bg-rize-accent/20 text-rize-accent' : 'text-rize-muted hover:text-white'
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
                viewMode === 'calendar' ? 'bg-rize-accent/20 text-rize-accent' : 'text-rize-muted hover:text-white'
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

      {/* ── Calendar view ──────────────────────────────────────────── */}
      {viewMode === 'calendar' && (
        <div className="mt-4 flex-1 overflow-y-auto px-4 pb-28" ref={listRef}>
          <div className="rounded-[24px] border border-rize-border bg-rize-card/90 p-4">
            {/* Month nav */}
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={prevCalMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-rize-border bg-[#0a0c14] text-rize-muted hover:text-white touch-manipulation"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="text-sm font-semibold text-white">{formatMonthYear(calendarMonth)}</p>
              <button
                type="button"
                onClick={nextCalMonth}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-rize-border bg-[#0a0c14] text-rize-muted hover:text-white touch-manipulation"
                aria-label="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-rize-muted">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => (
                <span key={`dow-${idx}`}>{d}</span>
              ))}
            </div>

            {/* Animated grid */}
            <AnimatePresence mode="wait" custom={calDir} initial={false}>
              <motion.div
                key={formatMonthYear(calendarMonth)}
                custom={calDir}
                initial={{ x: calDir > 0 ? 40 : -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: calDir > 0 ? -40 : 40, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-7 gap-1"
              >
                {calCells.map((dom, i) => {
                  if (dom == null) return <div key={`e-${i}`} className="aspect-square" />
                  const cellDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dom)
                  const cellKey = dateKey(startOfDay(cellDate))
                  const selected = cellKey === dateKey(selectedCalDay)
                  const isCellToday = cellKey === todayKey
                  const isPast = cellDate < today
                  const dots = getCellDots(dom)

                  return (
                    <button
                      key={cellKey}
                      type="button"
                      onClick={() => setSelectedCalDay(startOfDay(cellDate))}
                      className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-sm font-medium transition touch-manipulation ${
                        selected
                          ? 'bg-rize-accent text-white shadow-[0_8px_24px_-8px_rgba(157,78,221,0.6)]'
                          : isCellToday
                            ? 'border border-rize-accent/50 text-rize-accent'
                            : isPast
                              ? 'text-rize-muted/50'
                              : 'text-white/90 hover:bg-white/5'
                      }`}
                    >
                      <span>{dom}</span>
                      {dots.length > 0 && (
                        <div className="flex gap-0.5">
                          {dots.map((cat, di) => (
                            <span
                              key={di}
                              className={`h-1 w-1 rounded-full ${categoryDot[cat]} ${selected ? 'opacity-70' : ''}`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Selected day panel */}
          <motion.div
            key={dateKey(selectedCalDay)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-rize-muted">
              {formatDayHeading(selectedCalDay)}
            </p>
            {selectedCalRows.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-rize-border px-4 py-5 text-center text-sm text-rize-muted">
                Tap a day to see its blocks.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedCalRows.map((row) => {
                  const b = row.block
                  const bar = categoryBar[b.category]
                  return (
                    <div key={b.id} className="flex gap-3 rounded-2xl border border-rize-border bg-rize-card/90 p-3.5">
                      <div className={`w-1.5 shrink-0 self-stretch rounded-full ${bar}`} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white">{b.title}</p>
                        <p className="mt-0.5 text-xs text-rize-muted">{b.start} – {b.end}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ── List view ──────────────────────────────────────────────── */}
      {viewMode === 'list' && (
        <div className="mt-4 flex-1 overflow-hidden" ref={listRef}>
          <AnimatePresence mode="wait" custom={dayDir} initial={false}>
            <motion.div
              key={key}
              custom={dayDir}
              initial={{ x: (dayDir > 0 ? 60 : dayDir < 0 ? -60 : 0), opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: (dayDir > 0 ? -60 : 60), opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full overflow-y-auto px-4 pb-28"
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
                  const rowKey = row.kind === 'once' ? `once:${b.id}` : `rec:${b.id}`
                  const expanded = openId === rowKey
                  const bar = categoryBar[b.category]

                  return (
                    <div key={rowKey}>
                      {/* "Now" time indicator */}
                      {isToday && nowIndex === i && (
                        <div className="my-2 flex items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rize-accent shadow-[0_0_8px_2px_rgba(157,78,221,0.5)]" />
                          <div className="flex-1 border-t border-rize-accent/50" />
                          <span className="text-[10px] font-semibold text-rize-accent">Now</span>
                        </div>
                      )}
                      <motion.article
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.025 * i, duration: 0.28 }}
                        className="overflow-hidden rounded-2xl border border-rize-border bg-rize-card/90 shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() => setOpenId((o) => (o === rowKey ? null : rowKey))}
                          className="flex w-full gap-3 p-4 text-left touch-manipulation"
                        >
                          <div className={`w-1.5 shrink-0 self-stretch rounded-full ${bar}${b.priority ? ' shadow-[0_0_8px_2px_rgba(157,78,221,0.35)]' : ''}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <h3 className="font-semibold text-white">
                                {b.priority && <span className="mr-1.5 text-rize-accent">★</span>}
                                {b.title}
                              </h3>
                              <span className="text-xs text-rize-muted">{formatDuration(b.start, b.end)}</span>
                            </div>
                            <p className="mt-1 text-sm text-rize-muted">{b.start} – {b.end}</p>
                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
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
                            className={`mt-1 h-5 w-5 shrink-0 text-rize-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                            aria-hidden
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
                                  />
                                </label>

                                <div className="grid grid-cols-2 gap-3">
                                  <label className="block">
                                    <span className="text-xs font-medium text-rize-muted">Start</span>
                                    <input
                                      type="time"
                                      value={toTimeInput(b.start)}
                                      onChange={(e) => {
                                        const v = fromTimeInput(e.target.value)
                                        row.kind === 'once' ? updateOneOff(b.id, { start: v }) : updateRecurring(b.id, { start: v })
                                      }}
                                      className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                                    />
                                  </label>
                                  <label className="block">
                                    <span className="text-xs font-medium text-rize-muted">End</span>
                                    <input
                                      type="time"
                                      value={toTimeInput(b.end)}
                                      onChange={(e) => {
                                        const v = fromTimeInput(e.target.value)
                                        row.kind === 'once' ? updateOneOff(b.id, { end: v }) : updateRecurring(b.id, { end: v })
                                      }}
                                      className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                                    />
                                  </label>
                                </div>

                                <label className="block">
                                  <span className="text-xs font-medium text-rize-muted">Category</span>
                                  <div className="mt-1.5 flex gap-2">
                                    {(['Health', 'Work', 'Personal', 'Other'] as Category[]).map((cat) => (
                                      <button
                                        key={cat}
                                        type="button"
                                        onClick={() =>
                                          row.kind === 'once'
                                            ? updateOneOff(b.id, { category: cat })
                                            : updateRecurring(b.id, { category: cat })
                                        }
                                        className={`flex flex-1 flex-col items-center gap-1 rounded-xl border py-2 text-[10px] font-medium transition touch-manipulation ${
                                          b.category === cat
                                            ? 'border-rize-accent/50 bg-rize-accent/10 text-white'
                                            : 'border-rize-border bg-[#0a0c14] text-rize-muted hover:border-rize-accent/30'
                                        }`}
                                      >
                                        <span className={`h-2 w-2 rounded-full ${categoryDot[cat]}`} />
                                        {cat}
                                      </button>
                                    ))}
                                  </div>
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
                                          weeklyDay: next === 'weekly'
                                            ? row.block.repeat === 'weekly' ? row.block.weeklyDay : day.getDay()
                                            : row.block.weeklyDay,
                                        })
                                      }}
                                      className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                                    >
                                      <option value="daily">Daily</option>
                                      <option value="weekdays">Weekdays (Mon–Fri)</option>
                                      <option value="weekly">Weekly (same weekday)</option>
                                    </select>
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
                                    rows={2}
                                    className="mt-1.5 w-full resize-none rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white placeholder:text-rize-muted focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() => row.kind === 'once' ? removeOneOff(b.id) : removeRecurring(b.id)}
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
                    </div>
                  )
                })}

                {/* "Now" indicator after last block */}
                {isToday && nowIndex === rows.length && rows.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rize-accent shadow-[0_0_8px_2px_rgba(157,78,221,0.5)]" />
                    <div className="flex-1 border-t border-rize-accent/50" />
                    <span className="text-[10px] font-semibold text-rize-accent">Now</span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ── FAB ────────────────────────────────────────────────────── */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={openAdd}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24, delay: 0.1 }}
        className="fixed z-30 flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rize-accent-dim to-rize-accent text-white shadow-[0_12px_40px_-6px_rgba(157,78,221,0.55)] touch-manipulation"
        style={{
          bottom: `calc(5.5rem + env(safe-area-inset-bottom) + 1.25rem)`,
          right: '1rem',
          padding: fabCompact ? '0.75rem' : '0.75rem 1.25rem',
          transition: 'padding 0.2s ease',
        }}
        aria-label="Add block"
      >
        <Plus className="h-5 w-5 shrink-0" strokeWidth={2.5} />
        <AnimatePresence>
          {!fabCompact && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden whitespace-nowrap text-sm font-semibold"
            >
              Add block
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── New Block bottom sheet ──────────────────────────────────── */}
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
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.25 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80) setAddOpen(false)
              }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[88dvh] overflow-y-auto rounded-t-[28px] border border-white/[0.08] bg-[#0b0d16] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-24px_80px_-20px_rgba(0,0,0,0.6)]"
            >
              <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-white/20 cursor-grab" />
              <h3 id="add-block-title" className="text-lg font-semibold text-white">New block</h3>
              <p className="mt-1 text-sm text-rize-muted">
                For {formatDayHeading(day)}. Repeats apply on every matching day.
              </p>

              <div className="mt-6 space-y-4">
                {/* Title */}
                <label className="block">
                  <span className="text-xs font-medium text-rize-muted">Title</span>
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white placeholder:text-rize-muted focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                    placeholder="e.g. Focus sprint"
                    autoComplete="off"
                  />
                </label>

                {/* Time pickers */}
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-xs font-medium text-rize-muted">Start</span>
                    <input
                      type="time"
                      value={draft.start}
                      onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))}
                      className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-rize-muted">End</span>
                    <input
                      type="time"
                      value={draft.end}
                      onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))}
                      className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                    />
                  </label>
                </div>

                {/* Category with colour preview */}
                <div>
                  <span className="text-xs font-medium text-rize-muted">Category</span>
                  <div className="mt-1.5 flex gap-2">
                    {(['Health', 'Work', 'Personal', 'Other'] as Category[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, category: cat }))}
                        className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-2.5 text-[10px] font-semibold transition touch-manipulation ${
                          draft.category === cat
                            ? 'border-rize-accent/50 bg-rize-accent/10 text-white'
                            : 'border-rize-border bg-[#0a0c14] text-rize-muted hover:border-rize-accent/30'
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${categoryDot[cat]}`} />
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority toggle */}
                <div className="flex items-center justify-between rounded-xl border border-rize-border bg-[#0a0c14] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">Priority block</p>
                    <p className="text-xs text-rize-muted">Gets a brighter border and ★ in the list</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draft.priority}
                    onClick={() => setDraft((d) => ({ ...d, priority: !d.priority }))}
                    className={`relative h-7 w-12 rounded-full transition-colors touch-manipulation ${
                      draft.priority ? 'bg-rize-accent' : 'bg-rize-border'
                    }`}
                  >
                    <motion.span
                      layout
                      className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow"
                      animate={{ x: draft.priority ? 20 : 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Repeat */}
                <label className="block">
                  <span className="text-xs font-medium text-rize-muted">Repeat</span>
                  <select
                    value={draft.repeat}
                    onChange={(e) => setDraft((d) => ({ ...d, repeat: e.target.value as typeof d.repeat }))}
                    className="mt-1.5 w-full rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                  >
                    <option value="none">Once — only this day</option>
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays (Mon–Fri)</option>
                    <option value="weekly">
                      Weekly — every {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}
                    </option>
                  </select>
                </label>

                {/* Notes */}
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
