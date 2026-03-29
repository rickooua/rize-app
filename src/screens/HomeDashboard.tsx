import { AnimatePresence, motion, useAnimate } from 'framer-motion'
import {
  BarChart2, Check, ChevronRight, Flame, ListChecks,
  Minus, Plus, Sparkles, X,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import {
  categoryBar,
  getDayRows,
  type OneOffBlock,
  parseMinutes,
  type RecurringBlock,
  startOfDay,
  type TaskItem,
} from '../lib/schedule'

type Props = {
  streakDays: number
  blocksByDate: Record<string, OneOffBlock[]>
  recurring: RecurringBlock[]
  onAddBlock: () => void
}

type ProofTarget = { blockId: string; taskId: string; label: string }
type StandaloneTask = { id: string; label: string; scope: 'daily' | 'situational' }

// ── Constants ────────────────────────────────────────────────────────────────

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

type HabitDef = { id: string; emoji: string; label: string; target: string }

const DEFAULT_HABITS: HabitDef[] = [
  { id: 'water',    emoji: '💧', label: '2.5L water',   target: 'Drink 2.5 litres of water today' },
  { id: 'run',      emoji: '🏃', label: '3km run',      target: 'Run or walk 3 kilometres' },
  { id: 'read',     emoji: '📖', label: '15 min read',  target: 'Read for 15 minutes' },
  { id: 'sleep',    emoji: '😴', label: '8h sleep',     target: 'Get 8 hours of quality sleep' },
  { id: 'meditate', emoji: '🧘', label: 'Meditate',     target: '10 minutes of mindfulness' },
  { id: 'veggies',  emoji: '🥗', label: 'Eat greens',   target: 'At least 1 serving of vegetables' },
  { id: 'noscreen', emoji: '📵', label: 'Screen-free',  target: '1 hour no screens before bed' },
]

const DEMO_WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DEMO_WEEK_COMPLETIONS = [6, 5, 7, 4, 6, 3, 0] // last value = today (overridden live)
const DEMO_MONTH_ACTIVE_DAYS = [1,2,3,5,6,7,8,9,11,12,14,15,16,17,18,20,21,22,23,24]

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
function isEveningPrompt(): boolean { return new Date().getHours() >= 17 }

// ── HabitCard ────────────────────────────────────────────────────────────────

function HabitCard({ habit, streakCount, done, onToggle }: {
  habit: HabitDef; streakCount: number; done: boolean; onToggle: () => void
}) {
  const [scope, animate] = useAnimate()
  const handleTap = useCallback(async () => {
    if (!done) await animate(scope.current, { scale: [1, 0.95, 1.05, 1] }, { duration: 0.2 })
    onToggle()
  }, [done, animate, scope, onToggle])

  return (
    <motion.button
      ref={scope} type="button" onClick={handleTap}
      className="relative flex h-[90px] w-[100px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 pb-3 pt-3 touch-manipulation"
      animate={{
        backgroundColor: done ? 'rgba(124,92,191,0.25)' : 'rgba(18,20,31,0.9)',
        borderColor:     done ? 'rgba(124,92,191,0.6)'  : 'rgba(255,255,255,0.08)',
      }}
      transition={{ duration: 0.18 }}
    >
      <AnimatePresence>
        {done && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
            className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-white"
          >
            <Check className="h-2.5 w-2.5 text-rize-accent" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
      <span className="text-[28px] leading-none">{habit.emoji}</span>
      <span className="text-[13px] font-medium leading-tight text-white">{habit.label}</span>
      <motion.span className="text-[11px] leading-tight" animate={{ color: done ? 'rgba(157,78,221,1)' : 'rgba(139,144,165,1)' }}>
        {streakCount > 0 ? `${streakCount} day streak` : 'Start streak'}
      </motion.span>
    </motion.button>
  )
}

// ── TaskBox (shared checkbox appearance) ─────────────────────────────────────

type TaskState = 'done' | 'failed' | undefined

function TaskBox({ state }: { state: TaskState }) {
  return (
    <motion.div
      animate={{
        backgroundColor:
          state === 'done'   ? 'rgba(157,78,221,0.22)' :
          state === 'failed' ? 'rgba(255,255,255,0.05)' : 'transparent',
        borderColor:
          state === 'done'   ? 'rgba(157,78,221,0.55)' :
          state === 'failed' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.18)',
      }}
      transition={{ duration: 0.18 }}
      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2"
    >
      <AnimatePresence mode="wait">
        {state === 'done' && (
          <motion.div key="done"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
          >
            <Check className="h-3 w-3 text-rize-accent" strokeWidth={3} />
          </motion.div>
        )}
        {state === 'failed' && (
          <motion.div key="failed"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
          >
            <Minus className="h-3 w-3 text-rize-muted/60" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── TaskProofModal ────────────────────────────────────────────────────────────

function TaskProofModal({ target, onConfirm, onFail, onClose }: {
  target: ProofTarget
  onConfirm: (proof: string) => void
  onFail: () => void
  onClose: () => void
}) {
  const [proof, setProof] = useState('')

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/75 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          key="card"
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 10 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="w-full max-w-sm rounded-[28px] border border-white/[0.1] bg-[#0e1020] p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="mb-1 flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rize-accent/15">
              <Check className="h-5 w-5 text-rize-accent" />
            </div>
            <button type="button" onClick={onClose} className="mt-1 text-rize-muted/50 hover:text-rize-muted touch-manipulation">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-rize-accent/70">Mark complete</p>
          <p className="mt-1 text-base font-semibold text-white leading-snug">{target.label}</p>
          <p className="mt-1.5 text-sm text-rize-muted/80">Add a quick note if you want — totally optional.</p>

          {/* Proof textarea */}
          <textarea
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            placeholder="What did you do? (optional)"
            rows={3}
            className="mt-4 w-full resize-none rounded-xl border border-rize-border bg-[#0a0c14] px-3 py-2.5 text-sm text-white placeholder:text-rize-muted/50 focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
          />

          {/* Photo placeholder */}
          <button
            type="button"
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] py-2.5 text-sm text-rize-muted/60 transition hover:border-rize-accent/30 hover:text-rize-muted touch-manipulation"
          >
            <span className="text-base">📷</span>
            <span>Add photo proof <span className="text-[11px] text-rize-muted/40">(coming soon)</span></span>
          </button>

          {/* Actions */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => onConfirm(proof)}
            className="mt-4 w-full rounded-xl bg-rize-accent py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(157,78,221,0.5)] transition hover:bg-[#a855f0] touch-manipulation"
          >
            Mark done ✓
          </motion.button>
          <button
            type="button"
            onClick={onFail}
            className="mt-2.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 text-[13px] text-rize-muted/60 transition hover:bg-white/[0.05] hover:text-rize-muted touch-manipulation"
          >
            Mark as unfinished
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── StatsSheet ───────────────────────────────────────────────────────────────

type StatsProps = {
  streakDays: number
  habitsCompletedToday: number
  totalHabits: number
  habitsDone: Record<string, boolean>
  tasksCompletedToday: number
  totalTasks: number
  taskRows: Array<{ block: OneOffBlock }>
  tasksDone: Record<string, 'done' | 'failed'>
  scheduleBlocksToday: number
  checkInDone: string | null
  onClose: () => void
}

function StatsSheet(props: StatsProps) {
  const [tab, setTab] = useState<'today' | 'week' | 'month'>('today')
  const { onClose } = props

  const todayStr = useMemo(() =>
    new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
    []
  )
  const monthStr = useMemo(() =>
    new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
    []
  )

  const weekData = useMemo(() => {
    const today = new Date().getDay() // 0=Sun
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return DEMO_WEEK_DAYS.map((d, i) => {
      const isToday = days[today] === d
      return { day: d, done: isToday ? props.habitsCompletedToday : DEMO_WEEK_COMPLETIONS[i] }
    })
  }, [props.habitsCompletedToday])

  return (
    <>
      {/* Backdrop */}
      <motion.button
        type="button" aria-label="Close statistics"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        role="dialog" aria-modal="true" aria-label="My Statistics"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        drag="y" dragConstraints={{ top: 0 }} dragElastic={{ top: 0, bottom: 0.12 }}
        onDragEnd={(_, info) => { if (info.offset.y > window.innerHeight * 0.3) onClose() }}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[28px] border-t border-white/[0.08] bg-[#0b0d16] shadow-[0_-32px_80px_-16px_rgba(0,0,0,0.7)]"
      >
        {/* Fixed header */}
        <div className="shrink-0 px-6 pb-3 pt-5">
          <div className="mx-auto mb-4 h-1 w-10 cursor-grab rounded-full bg-white/20" />
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">My Statistics</h2>
            <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-rize-border text-rize-muted transition hover:text-white touch-manipulation">
              <X className="h-4 w-4" />
            </button>
          </div>
          {/* Tabs */}
          <div className="mt-4 flex rounded-xl border border-rize-border bg-[#0a0c14]/90 p-1">
            {(['today', 'week', 'month'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition touch-manipulation ${
                  tab === t ? 'bg-rize-accent text-white shadow-sm' : 'text-rize-muted hover:text-white'
                }`}
              >
                {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-10">
          <AnimatePresence mode="wait" initial={false}>
            {tab === 'today' && (
              <motion.div key="today" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <StatsTodayContent {...props} todayStr={todayStr} />
              </motion.div>
            )}
            {tab === 'week' && (
              <motion.div key="week" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <StatsWeekContent streakDays={props.streakDays} weekData={weekData} habitsCompletedToday={props.habitsCompletedToday} />
              </motion.div>
            )}
            {tab === 'month' && (
              <motion.div key="month" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <StatsMonthContent monthStr={monthStr} habitsCompletedToday={props.habitsCompletedToday} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  )
}

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-rize-border bg-rize-card/80 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-rize-muted">{label}</p>
      <p className={`mt-1.5 text-2xl font-bold ${accent ? 'text-rize-accent' : 'text-white'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-rize-muted/80">{sub}</p>}
    </div>
  )
}

function StatsTodayContent({ todayStr, streakDays, habitsCompletedToday, totalHabits, habitsDone,
  tasksCompletedToday, totalTasks, taskRows, tasksDone, scheduleBlocksToday, checkInDone }: StatsProps & { todayStr: string }) {
  const pct = totalHabits > 0 ? Math.round((habitsCompletedToday / totalHabits) * 100) : 0

  return (
    <div className="space-y-5 pt-4">
      {/* Date pill */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">{todayStr}</p>
        <span className="flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-400">
          <Flame className="h-3.5 w-3.5" /> {streakDays} day streak
        </span>
      </div>

      {/* Check-in status */}
      <div className="rounded-2xl border border-rize-border bg-rize-card/80 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-rize-muted">Daily check-in</p>
        <div className="mt-2">
          {checkInDone ? (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-white">Done — {isEveningPrompt() ? 'win logged' : 'morning mood recorded'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full border-2 border-dashed border-rize-border" />
              <span className="text-sm text-rize-muted">Not completed yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Habits progress */}
      <div className="rounded-2xl border border-rize-border bg-rize-card/80 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-rize-muted">Habits today</p>
          <span className="text-xs font-bold text-rize-accent">{habitsCompletedToday}/{totalHabits}</span>
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-rize-accent"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-1.5 text-xs text-rize-muted">{pct}% complete</p>
        {/* Habit rows */}
        <div className="mt-3 space-y-2 border-t border-white/[0.05] pt-3">
          {DEFAULT_HABITS.map((h) => {
            const done = habitsDone[h.id] ?? false
            return (
              <div key={h.id} className="flex items-center gap-2">
                <span className="text-base leading-none">{h.emoji}</span>
                <span className={`flex-1 text-sm ${done ? 'text-white' : 'text-rize-muted/70'}`}>{h.label}</span>
                {done
                  ? <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Done</span>
                  : <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-rize-muted/60">Pending</span>
                }
              </div>
            )
          })}
        </div>
      </div>

        {/* Tasks */}
        {totalTasks > 0 && (
          <div className="rounded-2xl border border-rize-border bg-rize-card/80 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-rize-muted">Tasks</p>
              <span className="text-xs font-bold text-rize-accent">{tasksCompletedToday}/{totalTasks}</span>
            </div>
          <div className="mt-3 space-y-2">
            {taskRows.map((r) => {
              const tasks: TaskItem[] = r.block.tasks ?? []
              return tasks.map((t) => {
                const done = tasksDone[`${r.block.id}-${t.id}`] === 'done'
                return (
                  <div key={t.id} className="flex items-center gap-2">
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${done ? 'bg-rize-accent/20' : 'border border-white/20'}`}>
                      {done && <Check className="h-3 w-3 text-rize-accent" />}
                    </div>
                    <span className={`text-sm ${done ? 'text-rize-muted/50 line-through' : 'text-white/90'}`}>{t.label}</span>
                  </div>
                )
              })
            })}
          </div>
        </div>
      )}

      {/* Schedule summary */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Blocks today" value={scheduleBlocksToday} sub="time blocks scheduled" />
        <StatCard label="Habits done" value={`${habitsCompletedToday}/${totalHabits}`} sub="of daily habits" accent />
      </div>
    </div>
  )
}

function StatsWeekContent({ streakDays, weekData, habitsCompletedToday }: {
  streakDays: number; weekData: { day: string; done: number }[]; habitsCompletedToday: number
}) {
  const totalThisWeek = weekData.slice(0, 6).reduce((s, d) => s + d.done, 0) + habitsCompletedToday
  const bestDay = weekData.reduce((best, d) => d.done > best.done ? d : best, weekData[0])

  return (
    <div className="space-y-5 pt-4">
      {/* Streak highlight */}
      <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-transparent p-5 text-center">
        <Flame className="mx-auto h-8 w-8 text-amber-400" />
        <p className="mt-2 text-4xl font-bold text-white">{streakDays}</p>
        <p className="text-sm text-rize-muted">day streak 🔥</p>
        <p className="mt-2 text-xs text-amber-400/80">Keep going — don't break it!</p>
      </div>

      {/* 7-day habit grid */}
      <div className="rounded-2xl border border-rize-border bg-rize-card/80 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-rize-muted">Habits per day</p>
        <div className="flex items-end gap-1.5">
          {weekData.map(({ day, done }) => {
            const h = Math.max(8, Math.round((done / 7) * 52))
            const isToday = day === DEMO_WEEK_DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
            return (
              <div key={day} className="flex flex-1 flex-col items-center gap-1.5">
                <p className="text-[10px] font-bold text-rize-accent">{done > 0 ? done : ''}</p>
                <div
                  className={`w-full rounded-t-md ${isToday ? 'bg-rize-accent' : done > 0 ? 'bg-rize-accent/40' : 'bg-white/[0.06]'}`}
                  style={{ height: h }}
                />
                <p className="text-[9px] text-rize-muted">{day}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Habits this week" value={totalThisWeek} sub="total completions" accent />
        <StatCard label="Best day" value={bestDay.day} sub={`${bestDay.done} habits done`} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Wins logged" value={4} sub="wins this week" accent />
        <StatCard label="Days active" value={5} sub="out of 7 days" />
      </div>

      {/* Category breakdown */}
      <div className="rounded-2xl border border-rize-border bg-rize-card/80 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-rize-muted">Time by category</p>
        {[
          { label: 'Health', pct: 40, color: 'bg-emerald-400' },
          { label: 'Work', pct: 35, color: 'bg-violet-400' },
          { label: 'Personal', pct: 25, color: 'bg-amber-400' },
        ].map(({ label, pct, color }) => (
          <div key={label} className="mb-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-rize-muted">{label}</span>
              <span className="text-rize-muted/70">{pct}%</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div className={`h-full rounded-full ${color}`}
                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatsMonthContent({ monthStr, habitsCompletedToday }: { monthStr: string; habitsCompletedToday: number }) {
  const daysInThisMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const activeDays = DEMO_MONTH_ACTIVE_DAYS.length + (habitsCompletedToday > 0 ? 1 : 0)
  const totalCompletions = 89 + habitsCompletedToday

  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">{monthStr}</p>
        <span className="rounded-full bg-rize-accent/15 px-3 py-1 text-xs font-semibold text-rize-accent">
          {activeDays}/{daysInThisMonth} active days
        </span>
      </div>

      {/* Activity heatmap (simplified dot grid) */}
      <div className="rounded-2xl border border-rize-border bg-rize-card/80 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-rize-muted">Daily activity</p>
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: daysInThisMonth }, (_, i) => i + 1).map((d) => {
            const today = new Date().getDate()
            const active = DEMO_MONTH_ACTIVE_DAYS.includes(d) || (d === today && habitsCompletedToday > 0)
            const isToday = d === today
            return (
              <div
                key={d}
                title={`${d} ${monthStr}`}
                className={`h-5 w-5 rounded-md text-[9px] flex items-center justify-center
                  ${isToday ? 'ring-1 ring-rize-accent' : ''}
                  ${active ? 'bg-rize-accent/50' : 'bg-white/[0.05]'}`}
              >
                <span className="text-[8px] text-white/60">{d}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total completions" value={totalCompletions} sub="habits this month" accent />
        <StatCard label="Active days" value={activeDays} sub={`of ${daysInThisMonth} this month`} />
      </div>

      {/* Top habits */}
      <div className="rounded-2xl border border-rize-border bg-rize-card/80 p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-rize-muted">Habit consistency</p>
        {[
          { emoji: '💧', label: '2.5L water',  pct: 93 },
          { emoji: '😴', label: '8h sleep',    pct: 81 },
          { emoji: '📖', label: '15 min read', pct: 74 },
          { emoji: '🧘', label: 'Meditate',    pct: 68 },
          { emoji: '🏃', label: '3km run',     pct: 55 },
          { emoji: '🥗', label: 'Eat greens',  pct: 48 },
          { emoji: '📵', label: 'Screen-free', pct: 39 },
        ].map(({ emoji, label, pct }) => (
          <div key={label} className="mb-2.5 flex items-center gap-3">
            <span className="text-base leading-none">{emoji}</span>
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rize-muted">{label}</span>
                <span className="font-medium text-white">{pct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-rize-accent' : 'bg-amber-400'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-rize-muted">Achievements</p>
        <div className="flex flex-wrap gap-2">
          {[
            { emoji: '🔥', label: '7-day streak' },
            { emoji: '💧', label: 'Hydration hero' },
            { emoji: '📚', label: 'Bookworm' },
            { emoji: '🌅', label: 'Early riser' },
          ].map((a) => (
            <div key={a.label} className="flex items-center gap-1.5 rounded-full border border-rize-accent/20 bg-rize-accent/10 px-3 py-1.5">
              <span className="text-sm">{a.emoji}</span>
              <span className="text-xs font-medium text-rize-accent">{a.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function HomeDashboard({ streakDays, blocksByDate, recurring, onAddBlock }: Props) {
  const today = useMemo(() => startOfDay(new Date()), [])
  const todayRows = useMemo(() => getDayRows(blocksByDate, recurring, today), [blocksByDate, recurring, today])
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

  const upcomingRows = useMemo(
    () => todayRows.filter((r) => parseMinutes(r.block.end) >= nowMinutes).slice(0, 4),
    [todayRows, nowMinutes],
  )

  // Check-in state
  const [checkInDone, setCheckInDone] = useState<string | null>(null)
  const [checkInDismissed, setCheckInDismissed] = useState(false)
  const [selectedWin, setSelectedWin] = useState<string | null>(null)
  const [showWinInput, setShowWinInput] = useState(false)
  const evening = isEveningPrompt()

  // Habits state
  const [habitsDone, setHabitsDone] = useState<Record<string, boolean>>({})
  const [habitStreaks] = useState<Record<string, number>>({ water: 5, run: 3, read: 1, sleep: 0, meditate: 2, veggies: 4, noscreen: 1 })

  // Task completion state
  const [tasksDone, setTasksDone] = useState<Record<string, 'done' | 'failed'>>({})
  const [proofTarget, setProofTarget] = useState<ProofTarget | null>(null)

  // Standalone tasks (not tied to a schedule block) — declared before taskRows memos
  const [standaloneTasks, setStandaloneTasks] = useState<StandaloneTask[]>([
    { id: 'st1', label: 'Reply to pending messages', scope: 'daily' },
    { id: 'st2', label: "Review today's notes", scope: 'daily' },
  ])

  // Task rows from today's schedule (after standaloneTasks is declared)
  const taskRows = useMemo(
    () => todayRows
      .filter((r) => r.block.blockType === 'task' && r.block.tasks && r.block.tasks.length > 0)
      .map((r) => ({ block: r.block })),
    [todayRows],
  )
  const totalTasks = useMemo(
    () => taskRows.reduce((s, r) => s + (r.block.tasks?.length ?? 0), 0) + standaloneTasks.length,
    [taskRows, standaloneTasks],
  )
  const [standaloneDone, setStandaloneDone] = useState<Record<string, 'done' | 'failed'>>({})
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskInput, setNewTaskInput] = useState('')
  const [newTaskScope, setNewTaskScope] = useState<'daily' | 'situational'>('daily')

  // Block expand
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null)

  // Insight
  const [insightDismissed, setInsightDismissed] = useState(false)

  // Stats sheet
  const [statsOpen, setStatsOpen] = useState(false)

  // Derived stats
  const habitsCompletedToday = useMemo(() => Object.values(habitsDone).filter(Boolean).length, [habitsDone])
  const tasksCompletedToday = useMemo(
    () => Object.values(tasksDone).filter((v) => v === 'done').length + Object.values(standaloneDone).filter((v) => v === 'done').length,
    [tasksDone, standaloneDone],
  )
  const dailyTasks = useMemo(
    () => standaloneTasks.filter((task) => task.scope === 'daily'),
    [standaloneTasks],
  )
  const situationalTasks = useMemo(
    () => standaloneTasks.filter((task) => task.scope === 'situational'),
    [standaloneTasks],
  )
  const upcomingTaskRows = useMemo(
    () => upcomingRows
      .filter((r) => r.block.blockType === 'task' && r.block.tasks && r.block.tasks.length > 0)
      .map((r) => ({ block: r.block })),
    [upcomingRows],
  )

  // Daily line
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 864e5)
  const dailyLine = DAILY_LINES[dayOfYear % DAILY_LINES.length]

  const todayLabel = today.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

  const isActiveBlock = (start: string, end: string) => {
    const s = parseMinutes(start); const e = parseMinutes(end)
    return nowMinutes >= s && nowMinutes < e
  }

  const handleWinSelect = useCallback((win: string) => {
    setSelectedWin(win)
    setTimeout(() => setCheckInDone('win'), 800)
  }, [])

  const handleTaskCheck = useCallback((blockId: string, taskId: string, label: string) => {
    setProofTarget({ blockId, taskId, label })
  }, [])

  const confirmTaskDone = useCallback((proof: string) => {
    if (!proofTarget) return
    setTasksDone((prev) => ({ ...prev, [`${proofTarget.blockId}-${proofTarget.taskId}`]: 'done' }))
    void proof
    setProofTarget(null)
  }, [proofTarget])

  const failTaskDone = useCallback(() => {
    if (!proofTarget) return
    setTasksDone((prev) => ({ ...prev, [`${proofTarget.blockId}-${proofTarget.taskId}`]: 'failed' }))
    setProofTarget(null)
  }, [proofTarget])

  return (
    <>
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
              <motion.div key="done" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5"
              >
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">
                  {evening ? 'Win logged' : 'Morning done'}
                </span>
              </motion.div>
            ) : !checkInDismissed ? (
              <motion.div key="checkin" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="relative mt-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white">
                    {evening ? 'What was your win today?' : "How'd you sleep?"}
                  </p>
                  <button type="button" onClick={() => setCheckInDismissed(true)}
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-rize-muted/50 transition hover:text-rize-muted touch-manipulation"
                    aria-label="Dismiss check-in"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {!evening ? (
                  <div className="mt-3 flex gap-2">
                    {MOODS.map((m) => (
                      <motion.button key={m.id} type="button" whileTap={{ scale: 0.9 }}
                        onClick={() => setCheckInDone(m.id)}
                        className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-rize-border bg-[#0a0c14]/80 py-2.5 transition hover:border-rize-accent/40 hover:bg-rize-accent/5 touch-manipulation"
                      >
                        <span className="text-base leading-none">{m.emoji}</span>
                        <span className="text-[9px] font-medium text-rize-muted">{m.label}</span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {!showWinInput ? (
                      <motion.div key="pills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {WIN_OPTIONS.map((win) => (
                            <motion.button key={win} type="button" whileTap={{ scale: 0.95 }}
                              onClick={() => handleWinSelect(win)}
                              animate={selectedWin ? { opacity: selectedWin === win ? 1 : 0.3, scale: selectedWin === win ? 1 : 0.97 } : { opacity: 1, scale: 1 }}
                              transition={{ duration: 0.15 }}
                              className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition touch-manipulation ${
                                selectedWin === win ? 'border-rize-accent bg-rize-accent text-white' : 'border-white/12 bg-transparent text-white/90 hover:border-white/25'
                              }`}
                            >
                              {win}
                            </motion.button>
                          ))}
                        </div>
                        <button type="button" onClick={() => setShowWinInput(true)}
                          className="text-[12px] text-rize-muted/70 underline-offset-2 hover:text-rize-muted hover:underline touch-manipulation"
                        >
                          Something else…
                        </button>
                      </motion.div>
                    ) : (
                      <motion.input key="input" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                        type="text" placeholder="Type your win and press Enter…" autoFocus
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
                <motion.div key={bKey} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.28 }}
                  className={`overflow-hidden rounded-2xl border bg-rize-card/90 transition-shadow ${
                    active ? 'border-rize-accent/40 shadow-[0_0_20px_-4px_rgba(157,78,221,0.3)]' : 'border-rize-border'
                  }`}
                >
                  <button type="button" onClick={() => setExpandedBlock(expanded ? null : bKey)}
                    className="flex w-full gap-3 p-3.5 text-left touch-manipulation"
                  >
                    <div className={`w-1.5 shrink-0 self-stretch rounded-full ${bar}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-medium text-white">
                          {b.tasks && b.tasks.length > 0 && <ListChecks className="mr-1.5 inline h-3.5 w-3.5 text-rize-accent/60" aria-hidden />}
                          {b.title}
                        </p>
                        {active && <span className="shrink-0 rounded-full bg-rize-accent/20 px-2 py-0.5 text-[10px] font-semibold text-rize-accent">Now</span>}
                      </div>
                      <p className="mt-0.5 text-xs text-rize-muted">{b.start} – {b.end}</p>
                    </div>
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && b.notes && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden border-t border-white/[0.06]"
                      >
                        <div className="px-4 py-3">
                          <p className="text-xs leading-relaxed text-rize-muted">{b.notes}</p>
                          <span className="mt-2 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-rize-muted ring-1 ring-white/10">{b.category}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
          <button type="button" onClick={onAddBlock}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-rize-border/80 py-3 text-sm text-rize-muted transition hover:border-rize-accent/40 hover:text-rize-accent touch-manipulation"
          >
            <Plus className="h-4 w-4" />
            Add block
          </button>
        </div>

        {/* ── Tasks ────────────────────────────────────────────────── */}
        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-rize-muted">Tasks</p>
            {totalTasks > 0 && (
              <span className="text-xs text-rize-muted/50">{tasksCompletedToday}/{totalTasks}</span>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-rize-card/80">
            {/* Daily tasks */}
            <div className="border-b border-white/[0.05] px-4 py-2 bg-white/[0.025]">
              <span className="text-[11px] font-medium text-rize-muted/80">Daily tasks</span>
            </div>
           {dailyTasks.map((task) => {
             const state: TaskState = standaloneDone[task.id]
             return (
               <motion.button
                 key={task.id} type="button"
                 onClick={() => {
                   if (standaloneDone[task.id]) {
                     setStandaloneDone((p) => { const n = { ...p }; delete n[task.id]; return n })
                   } else {
                     setStandaloneDone((p) => ({ ...p, [task.id]: 'done' }))
                   }
                 }}
                 className="flex w-full items-center gap-3 border-b border-white/[0.05] px-4 py-3.5 text-left touch-manipulation"
                 animate={{ backgroundColor: state ? 'rgba(157,78,221,0.04)' : 'rgba(0,0,0,0)' }}
                 transition={{ duration: 0.18 }}
               >
                 <TaskBox state={state} />
                 <span className={`flex-1 text-sm ${state ? 'text-rize-muted/40 line-through' : 'text-white/90'}`}>
                   {task.label}
                 </span>
                 {state && (
                   <span className="shrink-0 text-[10px] text-rize-muted/30">tap to undo</span>
                 )}
               </motion.button>
             )
           })}

            {/* Upcoming situational tasks */}
            <div className={`flex items-center justify-between px-4 py-2 ${(dailyTasks.length > 0) ? 'border-t border-white/[0.06]' : ''} bg-white/[0.025]`}>
              <span className="text-[11px] font-medium text-rize-muted/80">Upcoming / situational</span>
              {(upcomingTaskRows.length + situationalTasks.length) > 0 && (
                <span className="text-[10px] text-rize-muted/40">time-specific</span>
              )}
            </div>

            {/* User-added situational tasks */}
            {situationalTasks.map((task) => {
              const state: TaskState = standaloneDone[task.id]
              return (
                <motion.button
                  key={task.id} type="button"
                  onClick={() => {
                    if (standaloneDone[task.id]) {
                      setStandaloneDone((p) => { const n = { ...p }; delete n[task.id]; return n })
                    } else {
                      setStandaloneDone((p) => ({ ...p, [task.id]: 'done' }))
                    }
                  }}
                  className="flex w-full items-center gap-3 border-b border-white/[0.05] px-4 py-3.5 text-left touch-manipulation"
                  animate={{ backgroundColor: state ? 'rgba(157,78,221,0.04)' : 'rgba(0,0,0,0)' }}
                  transition={{ duration: 0.18 }}
                >
                  <TaskBox state={state} />
                  <span className={`flex-1 text-sm ${state ? 'text-rize-muted/40 line-through' : 'text-white/90'}`}>
                    {task.label}
                  </span>
                  {state && (
                    <span className="shrink-0 text-[10px] text-rize-muted/30">tap to undo</span>
                  )}
                </motion.button>
              )
            })}

            {/* Block-attached task groups (upcoming only) */}
            {upcomingTaskRows.map(({ block: b }, blockIdx) => (
              <div key={b.id}>
                {/* Subtle group divider with block name + time */}
                <div className={`flex items-center justify-between px-4 py-2 ${(blockIdx > 0 || dailyTasks.length > 0 || situationalTasks.length > 0) ? 'border-t border-white/[0.06]' : ''} bg-white/[0.025]`}>
                  <div className="flex items-center gap-1.5">
                    <ListChecks className="h-3.5 w-3.5 text-rize-accent/50" aria-hidden />
                    <span className="text-[11px] font-medium text-rize-muted/80">{b.title}</span>
                  </div>
                  <span className="text-[10px] text-rize-muted/40">{b.start} – {b.end}</span>
                </div>
                {(b.tasks ?? []).map((task) => {
                  const key = `${b.id}-${task.id}`
                  const state: TaskState = tasksDone[key]
                  return (
                    <motion.button
                      key={task.id} type="button"
                      onClick={() => {
                        if (state) {
                          // undo: clear the state
                          setTasksDone((prev) => {
                            const next = { ...prev }
                            delete next[key]
                            return next
                          })
                        } else {
                          handleTaskCheck(b.id, task.id, task.label)
                        }
                      }}
                      className="flex w-full items-center gap-3 border-b border-white/[0.04] px-4 py-3.5 text-left touch-manipulation"
                      animate={{ backgroundColor: state ? 'rgba(157,78,221,0.04)' : 'rgba(0,0,0,0)' }}
                      transition={{ duration: 0.18 }}
                    >
                      <TaskBox state={state} />
                      <span className={`flex-1 text-sm ${state ? 'text-rize-muted/40 line-through' : 'text-white/90'}`}>
                        {task.label}
                      </span>
                      {state && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                          className={`shrink-0 text-[10px] ${state === 'done' ? 'text-rize-accent/50' : 'text-rize-muted/40'}`}
                        >
                          {state === 'done' ? 'done' : 'unfinished'} · undo
                        </motion.span>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            ))}
            {dailyTasks.length === 0 && situationalTasks.length === 0 && upcomingTaskRows.length === 0 && (
              <div className="px-4 py-4 text-center text-xs text-rize-muted/60">
                No tasks yet. Add a daily or situational task below.
              </div>
            )}

            {/* Add task row */}
            {showAddTask ? (
              <div className="border-t border-white/[0.05] px-4 py-3">
                <div className="mb-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTaskScope('daily')}
                    className={`rounded-full px-2.5 py-1 text-[11px] transition ${
                      newTaskScope === 'daily'
                        ? 'bg-rize-accent/20 text-rize-accent'
                        : 'bg-white/[0.04] text-rize-muted hover:text-white'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTaskScope('situational')}
                    className={`rounded-full px-2.5 py-1 text-[11px] transition ${
                      newTaskScope === 'situational'
                        ? 'bg-rize-accent/20 text-rize-accent'
                        : 'bg-white/[0.04] text-rize-muted hover:text-white'
                    }`}
                  >
                    Situational
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 shrink-0 rounded-md border-2 border-white/10" />
                  <input
                    value={newTaskInput}
                    onChange={(e) => setNewTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTaskInput.trim()) {
                        setStandaloneTasks((t) => [...t, {
                          id: `st-${Date.now()}`,
                          label: newTaskInput.trim(),
                          scope: newTaskScope,
                        }])
                        setNewTaskInput('')
                        setShowAddTask(false)
                        setNewTaskScope('daily')
                      }
                      if (e.key === 'Escape') {
                        setShowAddTask(false)
                        setNewTaskInput('')
                        setNewTaskScope('daily')
                      }
                    }}
                    autoFocus
                    placeholder="New task... press Enter to add"
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-rize-muted/40 focus:outline-none"
                  />
                  <button type="button" onClick={() => { setShowAddTask(false); setNewTaskInput(''); setNewTaskScope('daily') }}
                    className="flex h-6 w-6 shrink-0 items-center justify-center text-rize-muted/40 hover:text-rize-muted touch-manipulation"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddTask(true)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-sm text-rize-muted/50 transition hover:text-rize-muted/80 touch-manipulation ${(standaloneTasks.length > 0 || upcomingTaskRows.length > 0) ? 'border-t border-white/[0.05]' : ''}`}
              >
                <Plus className="h-4 w-4" />
                Add a task
              </button>
            )}
          </div>
        </div>

        {/* ── Habits strip ──────────────────────────────────────────── */}
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-rize-muted">Today&apos;s habits</p>
          <div className="flex gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {DEFAULT_HABITS.map((habit) => {
              const done = habitsDone[habit.id] ?? false
              const streak = (habitStreaks[habit.id] ?? 0) + (done ? 1 : 0)
              return (
                <HabitCard key={habit.id} habit={habit} streakCount={streak} done={done}
                  onToggle={() => setHabitsDone((h) => ({ ...h, [habit.id]: !h[habit.id] }))}
                />
              )
            })}
            <button type="button"
              className="flex h-[90px] w-[100px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-white/[0.12] px-2 text-rize-muted/60 transition hover:border-rize-accent/40 hover:text-rize-accent touch-manipulation"
            >
              <span className="text-2xl leading-none">+</span>
              <span className="text-[12px] font-medium">New habit</span>
            </button>
          </div>
        </div>

        {/* ── Streak banner ─────────────────────────────────────────── */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-rize-accent/20 bg-gradient-to-r from-rize-accent/10 to-transparent px-4 py-3">
          <Flame className="h-5 w-5 shrink-0 text-amber-400" aria-hidden />
          <p className="text-sm font-semibold text-white">{streakDays} days in a row</p>
          <span className="ml-auto text-xs font-medium text-rize-muted">streak 🔥</span>
        </div>

        {/* ── Statistics button ─────────────────────────────────────── */}
        <motion.button
          type="button"
          onClick={() => setStatsOpen(true)}
          whileTap={{ scale: 0.985 }}
          className="mt-4 w-full rounded-[24px] border border-rize-accent/20 bg-gradient-to-br from-rize-accent/[0.12] to-rize-accent/[0.04] p-5 text-left shadow-[0_8px_32px_-12px_rgba(157,78,221,0.2)] transition hover:border-rize-accent/35 touch-manipulation"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rize-accent/20">
                <BarChart2 className="h-5 w-5 text-rize-accent" />
              </div>
              <div>
                <p className="font-semibold text-white">My Statistics</p>
                <p className="text-xs text-rize-muted/80">Habits, tasks, streaks & more</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-rize-accent/60" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'day streak', value: streakDays, accent: false },
              { label: 'habits today', value: `${habitsCompletedToday}/${DEFAULT_HABITS.length}`, accent: true },
              { label: 'tasks done', value: tasksCompletedToday, accent: false },
            ].map(({ label, value, accent }) => (
              <div key={label} className="rounded-xl bg-white/[0.04] px-2 py-2 text-center">
                <p className={`text-lg font-bold leading-tight ${accent ? 'text-rize-accent' : 'text-white'}`}>{value}</p>
                <p className="text-[10px] text-rize-muted/70">{label}</p>
              </div>
            ))}
          </div>
        </motion.button>

        {/* ── Weekly insight ────────────────────────────────────────── */}
        <AnimatePresence>
          {!insightDismissed && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.22 }}
              className="mt-4 flex items-start gap-3 rounded-2xl border border-rize-accent/20 bg-rize-accent/[0.08] px-4 py-3.5"
            >
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-rize-accent" aria-hidden />
              <p className="flex-1 text-xs leading-relaxed text-rize-muted">
                You tend to complete more habits on days you check in before 8am.
              </p>
              <button type="button" onClick={() => setInsightDismissed(true)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-rize-muted/50 transition hover:text-rize-muted touch-manipulation"
                aria-label="Dismiss insight"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Proof modal ───────────────────────────────────────────────── */}
      {proofTarget && (
        <TaskProofModal
          target={proofTarget}
          onConfirm={confirmTaskDone}
          onFail={failTaskDone}
          onClose={() => setProofTarget(null)}
        />
      )}

      {/* ── Stats sheet ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {statsOpen && (
          <StatsSheet
            streakDays={streakDays}
            habitsCompletedToday={habitsCompletedToday}
            totalHabits={DEFAULT_HABITS.length}
            habitsDone={habitsDone}
            tasksCompletedToday={tasksCompletedToday}
            totalTasks={totalTasks}
            taskRows={taskRows}
            tasksDone={tasksDone}
            scheduleBlocksToday={todayRows.length}
            checkInDone={checkInDone}
            onClose={() => setStatsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
