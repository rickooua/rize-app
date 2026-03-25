import { AnimatePresence, motion, useAnimate } from 'framer-motion'
import { Check, Flame, Plus, Sparkles, X } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import {
  categoryBar,
  getDayRows,
  type OneOffBlock,
  parseMinutes,
  type RecurringBlock,
  startOfDay,
} from '../lib/schedule'

type Props = {
  streakDays: number
  blocksByDate: Record<string, OneOffBlock[]>
  recurring: RecurringBlock[]
  onAddBlock: () => void
}

const DAILY_LINES = [
  "Consistency isn't perfection — it's showing up again today.",
  'Your future self is built in moments just like this one.',
  'Progress is made one quiet decision at a time.',
  'Rest is part of the work.',
  "You don't need to fix everything. Just keep going.",
  'The small things you do consistently are the big things.',
  'Gentle momentum beats occasional perfection.',
]

const MOODS = [
  { id: 'rough', label: 'Rough', emoji: '😮‍💨' },
  { id: 'meh', label: 'Meh', emoji: '😐' },
  { id: 'fine', label: 'Fine', emoji: '🙂' },
  { id: 'good', label: 'Good', emoji: '😊' },
  { id: 'amazing', label: 'Amazing', emoji: '🤩' },
] as const

const WIN_OPTIONS = [
  'Showed up consistently',
  'Finished something hard',
  'Took care of myself',
  'Just made it through',
] as const

type HabitDef = { id: string; emoji: string; label: string }
const DEFAULT_HABITS: HabitDef[] = [
  { id: 'water', emoji: '💧', label: 'Water' },
  { id: 'move', emoji: '🏃', label: 'Move' },
  { id: 'read', emoji: '📖', label: 'Read' },
  { id: 'sleep', emoji: '😴', label: 'Sleep' },
  { id: 'journal', emoji: '✏️', label: 'Journal' },
]

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function isEveningPrompt(): boolean {
  return new Date().getHours() >= 17
}

// ── Habit card ──────────────────────────────────────────────────────────────
function HabitCard({ habit, streakCount, done, onToggle }: {
  habit: HabitDef
  streakCount: number
  done: boolean
  onToggle: () => void
}) {
  const [scope, animate] = useAnimate()

  const handleTap = useCallback(async () => {
    if (!done) {
      // Scale pulse on mark-done
      await animate(scope.current, { scale: [1, 0.95, 1.05, 1] }, { duration: 0.2 })
    }
    onToggle()
  }, [done, animate, scope, onToggle])

  return (
    <motion.button
      ref={scope}
      type="button"
      onClick={handleTap}
      className="relative flex h-[90px] w-[100px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 pb-3 pt-3 touch-manipulation"
      animate={{
        backgroundColor: done ? 'rgba(124,92,191,0.25)' : 'rgba(18,20,31,0.9)',
        borderColor: done ? 'rgba(124,92,191,0.6)' : 'rgba(255,255,255,0.08)',
      }}
      transition={{ duration: 0.18 }}
    >
      {/* Checkmark badge */}
      <AnimatePresence>
        {done && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
            className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white"
          >
            <Check className="h-2.5 w-2.5 text-rize-accent" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>

      <span className="text-[28px] leading-none">{habit.emoji}</span>
      <span className="text-[13px] font-medium leading-tight text-white">{habit.label}</span>
      <motion.span
        className="text-[11px] leading-tight"
        animate={{ color: done ? 'rgba(157,78,221,1)' : 'rgba(139,144,165,1)' }}
      >
        {streakCount > 0 ? `${streakCount} day streak` : 'Start your streak'}
      </motion.span>
    </motion.button>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export function HomeDashboard({ streakDays, blocksByDate, recurring, onAddBlock }: Props) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const todayRows = useMemo(
    () => getDayRows(blocksByDate, recurring, today),
    [blocksByDate, recurring, today],
  )

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

  const upcomingRows = useMemo(
    () => todayRows.filter((r) => parseMinutes(r.block.end) >= nowMinutes).slice(0, 4),
    [todayRows, nowMinutes],
  )

  // Check-in
  const [checkInDone, setCheckInDone] = useState<string | null>(null)
  const [checkInDismissed, setCheckInDismissed] = useState(false)
  const [selectedWin, setSelectedWin] = useState<string | null>(null)
  const [showWinInput, setShowWinInput] = useState(false)
  const evening = isEveningPrompt()

  // Habits — track streaks as counts (demo data)
  const [habitsDone, setHabitsDone] = useState<Record<string, boolean>>({})
  const [habitStreaks] = useState<Record<string, number>>({
    water: 5, move: 3, read: 1, sleep: 0, journal: 2,
  })

  // Block expand
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null)

  // Insight
  const [insightDismissed, setInsightDismissed] = useState(false)

  // Daily line
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 864e5,
  )
  const dailyLine = DAILY_LINES[dayOfYear % DAILY_LINES.length]

  const isActiveBlock = (start: string, end: string) => {
    const s = parseMinutes(start)
    const e = parseMinutes(end)
    return nowMinutes >= s && nowMinutes < e
  }

  const todayLabel = today.toLocaleDateString(undefined, {
    weekday: 'long', month: 'short', day: 'numeric',
  })

  const handleWinSelect = useCallback((win: string) => {
    setSelectedWin(win)
    setTimeout(() => setCheckInDone('win'), 800)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-8 pt-2"
    >
      {/* ── Greeting card ──────────────────────────────────────────── */}
      <div className="rounded-[28px] border border-white/[0.06] bg-gradient-to-br from-[#15162a]/90 to-[#0a0b12] p-5 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.55)]">
        <p className="text-sm font-medium text-rize-accent">{getGreeting()}</p>
        <p className="mt-1 text-[15px] font-semibold leading-snug text-white">{dailyLine}</p>

        <AnimatePresence mode="wait">
          {checkInDone !== null ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5"
            >
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">
                {evening ? 'Win logged' : 'Morning done'}
              </span>
            </motion.div>
          ) : !checkInDismissed ? (
            <motion.div
              key="checkin"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="relative mt-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-white">
                  {evening ? 'What was your win today?' : "How'd you sleep?"}
                </p>
                <button
                  type="button"
                  onClick={() => setCheckInDismissed(true)}
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-rize-muted/50 transition hover:text-rize-muted touch-manipulation"
                  aria-label="Dismiss check-in"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {!evening ? (
                /* Morning: 5 emoji mood chips */
                <div className="mt-3 flex gap-2">
                  {MOODS.map((m) => (
                    <motion.button
                      key={m.id}
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setCheckInDone(m.id)}
                      className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-rize-border bg-[#0a0c14]/80 py-2.5 transition hover:border-rize-accent/40 hover:bg-rize-accent/5 touch-manipulation"
                    >
                      <span className="text-base leading-none">{m.emoji}</span>
                      <span className="text-[9px] font-medium text-rize-muted">{m.label}</span>
                    </motion.button>
                  ))}
                </div>
              ) : (
                /* Evening: tap-to-select win pills */
                <AnimatePresence mode="wait">
                  {!showWinInput ? (
                    <motion.div
                      key="pills"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-3 space-y-2"
                    >
                      <div className="flex flex-wrap gap-2">
                        {WIN_OPTIONS.map((win) => (
                          <motion.button
                            key={win}
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleWinSelect(win)}
                            animate={
                              selectedWin
                                ? { opacity: selectedWin === win ? 1 : 0.3, scale: selectedWin === win ? 1 : 0.97 }
                                : { opacity: 1, scale: 1 }
                            }
                            transition={{ duration: 0.15 }}
                            className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition touch-manipulation ${
                              selectedWin === win
                                ? 'border-rize-accent bg-rize-accent text-white'
                                : 'border-white/12 bg-transparent text-white/90 hover:border-white/25'
                            }`}
                          >
                            {win}
                          </motion.button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowWinInput(true)}
                        className="text-[12px] text-rize-muted/70 underline-offset-2 hover:text-rize-muted hover:underline touch-manipulation"
                      >
                        Something else…
                      </button>
                    </motion.div>
                  ) : (
                    <motion.input
                      key="input"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      type="text"
                      placeholder="Type your win and press Enter…"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') setCheckInDone('win') }}
                      className="mt-3 w-full rounded-xl border border-rize-border bg-[#0a0c14]/80 px-3 py-2.5 text-sm text-white placeholder:text-rize-muted/60 focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
                    />
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── Today's schedule ──────────────────────────────────────── */}
      <div className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-rize-muted">Today</p>
          <span className="text-xs text-rize-muted/70">{todayLabel}</span>
        </div>

        <div className="space-y-2">
          {upcomingRows.length === 0 && (
            <div className="rounded-2xl border border-dashed border-rize-border bg-rize-card/40 px-4 py-6 text-center">
              <p className="text-sm text-rize-muted">Nothing left scheduled today.</p>
            </div>
          )}
          {upcomingRows.map((row, i) => {
            const b = row.block
            const bKey = row.kind === 'once' ? `once:${b.id}` : `rec:${b.id}`
            const expanded = expandedBlock === bKey
            const active = isActiveBlock(b.start, b.end)
            const bar = categoryBar[b.category]

            return (
              <motion.div
                key={bKey}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.28 }}
                className={`overflow-hidden rounded-2xl border bg-rize-card/90 transition-shadow ${
                  active
                    ? 'border-rize-accent/40 shadow-[0_0_20px_-4px_rgba(157,78,221,0.3)]'
                    : 'border-rize-border'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedBlock(expanded ? null : bKey)}
                  className="flex w-full gap-3 p-3.5 text-left touch-manipulation"
                >
                  <div className={`w-1.5 shrink-0 self-stretch rounded-full ${bar}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-medium text-white">{b.title}</p>
                      {active && (
                        <span className="shrink-0 rounded-full bg-rize-accent/20 px-2 py-0.5 text-[10px] font-semibold text-rize-accent">
                          Now
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-rize-muted">{b.start} – {b.end}</p>
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden border-t border-white/[0.06]"
                    >
                      <div className="px-4 py-3">
                        {b.notes ? (
                          <p className="text-xs leading-relaxed text-rize-muted">{b.notes}</p>
                        ) : (
                          <p className="text-xs italic text-rize-muted/50">No notes.</p>
                        )}
                        <span className="mt-2 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-rize-muted ring-1 ring-white/10">
                          {b.category}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={onAddBlock}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-rize-border/80 py-3 text-sm text-rize-muted transition hover:border-rize-accent/40 hover:text-rize-accent touch-manipulation"
        >
          <Plus className="h-4 w-4" />
          Add block
        </button>
      </div>

      {/* ── Habits strip ──────────────────────────────────────────── */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-rize-muted">
          Today&apos;s habits
        </p>
        <div className="flex gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DEFAULT_HABITS.map((habit) => {
            const done = habitsDone[habit.id] ?? false
            const streak = (habitStreaks[habit.id] ?? 0) + (done ? 1 : 0)
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                streakCount={streak}
                done={done}
                onToggle={() => setHabitsDone((h) => ({ ...h, [habit.id]: !h[habit.id] }))}
              />
            )
          })}

          {/* + New habit */}
          <button
            type="button"
            className="flex h-[90px] w-[100px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/[0.12] px-2 text-rize-muted/60 transition hover:border-rize-accent/40 hover:text-rize-accent touch-manipulation"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="text-[12px] font-medium">New habit</span>
          </button>
        </div>
      </div>

      {/* ── Streak + stats ────────────────────────────────────────── */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-rize-accent/20 bg-gradient-to-r from-rize-accent/10 to-transparent px-4 py-3">
          <Flame className="h-5 w-5 shrink-0 text-amber-400" aria-hidden />
          <p className="text-sm font-semibold text-white">{streakDays} days in a row</p>
          <span className="ml-auto text-xs font-medium text-rize-muted">streak 🔥</span>
        </div>
        <div className="grid w-full grid-cols-2 gap-3">
          <div className="flex-1 rounded-2xl border border-rize-border bg-rize-card/80 p-4">
            <p className="text-xs uppercase tracking-wider text-rize-muted">Today</p>
            <p className="mt-1.5 text-2xl font-bold text-white">3</p>
            <p className="text-xs text-rize-muted">priorities lined up</p>
          </div>
          <div className="flex-1 rounded-2xl border border-rize-border bg-rize-card/80 p-4">
            <p className="text-xs uppercase tracking-wider text-rize-muted">This week</p>
            <p className="mt-1.5 text-2xl font-bold text-rize-accent">12</p>
            <p className="text-xs text-rize-muted">habit &amp; focus wins</p>
          </div>
        </div>
      </div>

      {/* ── Weekly insight ─────────────────────────────────────────── */}
      <AnimatePresence>
        {!insightDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="mt-4 flex items-start gap-3 rounded-2xl border border-rize-accent/20 bg-rize-accent/[0.08] px-4 py-3.5"
          >
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-rize-accent" aria-hidden />
            <p className="flex-1 text-xs leading-relaxed text-rize-muted">
              You tend to complete more habits on days you check in before 8am.
            </p>
            <button
              type="button"
              onClick={() => setInsightDismissed(true)}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-rize-muted/50 transition hover:text-rize-muted touch-manipulation"
              aria-label="Dismiss insight"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
