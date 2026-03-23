import { motion } from 'framer-motion'
import { ArrowRight, Flame, Sparkles } from 'lucide-react'

type Props = {
  streakDays: number
  onReplayMorning: () => void
}

export function HomeDashboard({ streakDays, onReplayMorning }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-0 flex-1 flex-col gap-4 px-4 pt-2"
    >
      <div className="rounded-[28px] border border-white/[0.06] bg-gradient-to-br from-[#15162a]/90 to-[#0a0b12] p-6 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.55)]">
        <p className="text-sm font-medium text-rize-accent">Good morning</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Ready when you are.</h1>
        <p className="mt-2 text-sm leading-relaxed text-rize-muted">
          Consistency isn&apos;t perfection — it&apos;s showing up again today.
        </p>
        <button
          type="button"
          onClick={onReplayMorning}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-rize-accent/15 px-4 py-3 text-sm font-semibold text-rize-accent ring-1 ring-rize-accent/35 transition hover:bg-rize-accent/25 touch-manipulation"
        >
          <Sparkles className="h-4 w-4" />
          Run morning flow
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-[24px] border border-rize-accent/25 bg-gradient-to-br from-rize-accent/12 to-transparent p-5 ring-1 ring-rize-accent/20"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rize-accent/15 ring-1 ring-rize-accent/30">
            <Flame className="h-7 w-7 text-amber-400" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-rize-muted">
              {streakDays}-day streak
            </p>
            <p className="mt-0.5 text-2xl font-bold text-white">{streakDays} days in a row</p>
            <p className="mt-1 text-sm text-rize-muted">Priorities, check-ins, and habits — keep the chain going.</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-rize-border bg-rize-card/80 p-4">
          <p className="text-xs uppercase tracking-wider text-rize-muted">Today</p>
          <p className="mt-2 text-2xl font-bold text-white">3</p>
          <p className="text-xs text-rize-muted">priorities lined up</p>
        </div>
        <div className="rounded-2xl border border-rize-border bg-rize-card/80 p-4">
          <p className="text-xs uppercase tracking-wider text-rize-muted">This week</p>
          <p className="mt-2 text-2xl font-bold text-rize-accent">12</p>
          <p className="text-xs text-rize-muted">habit &amp; focus wins</p>
        </div>
      </div>
    </motion.div>
  )
}
