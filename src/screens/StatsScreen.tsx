import { motion } from 'framer-motion'

/** Mock week: daily “pulse” from mood check-ins + priorities + habits — UI only. */
const week = [
  { day: 'M', mood: 3, emoji: '😐', label: 'Meh' },
  { day: 'T', mood: 4, emoji: '🙂', label: 'Good' },
  { day: 'W', mood: 5, emoji: '🌟', label: 'Amazing' },
  { day: 'T', mood: 4, emoji: '🙂', label: 'Good' },
  { day: 'F', mood: 5, emoji: '🌟', label: 'Amazing' },
  { day: 'S', mood: 4, emoji: '🙂', label: 'Good' },
  { day: 'S', mood: 5, emoji: '🌟', label: 'Amazing' },
]

function barGradient(mood: number): string {
  if (mood <= 3) return 'from-slate-600 to-slate-400'
  if (mood === 4) return 'from-cyan-800 to-cyan-400'
  return 'from-violet-700 via-fuchsia-600 to-amber-400'
}

function MoodBar({ level }: { level: number }) {
  const h = [28, 40, 52, 68, 84][level - 1] ?? 40
  return (
    <motion.div
      className={`w-full rounded-t-lg bg-gradient-to-t ${barGradient(level)}`}
      initial={{ height: 0 }}
      animate={{ height: h }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
    />
  )
}

export function StatsScreen() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-28 pt-2">
      <div>
        <h2 className="text-xl font-semibold text-white">Your week</h2>
        <p className="mt-1 text-sm text-rize-muted">
          Habits, priorities, and check-ins — how much you invested in yourself each day.
        </p>
      </div>

      <div className="rounded-[28px] border border-white/[0.06] bg-rize-card/90 p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-rize-muted">Weekly rhythm</p>
        <p className="mt-1 text-sm text-rize-muted/90">
          Bar height blends your mood check-in with completed priorities &amp; habits (preview data).
        </p>
        <div className="mt-6 flex h-36 items-end justify-between gap-2">
          {week.map((d, i) => (
            <div key={`${d.day}-${i}`} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-28 w-full max-w-[40px] flex-col justify-end">
                <MoodBar level={d.mood} />
              </div>
              <span className="text-[11px] font-medium text-rize-muted">{d.day}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {week.map((d, i) => (
            <span
              key={`pill-${i}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-rize-muted ring-1 ring-white/10"
            >
              <span className="text-[13px] leading-none" aria-hidden>
                {d.emoji}
              </span>
              {d.label}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-rize-border bg-[#0a0c14]/80 p-5">
        <p className="text-sm text-rize-muted">Wins logged this week</p>
        <p className="mt-1 text-3xl font-bold text-white">24</p>
        <p className="mt-3 text-sm leading-relaxed text-rize-muted">
          Priorities done, habits checked, reflections saved — more than last week. Small wins compound.
        </p>
      </div>
    </div>
  )
}
