import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState } from 'react'

const priorityTasks = [
  { id: '1', title: 'Morning movement', time: '7:30 – 8:00', n: 1 },
  { id: '2', title: 'Deep work: project milestone', time: '9:00 – 11:30', n: 2 },
  { id: '3', title: 'Call mentor + journal', time: '6:00 – 6:45', n: 3 },
]

type Props = {
  onStartDay: () => void
}

export function PrioritiesScreen({ onStartDay }: Props) {
  const [done, setDone] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => {
    setDone((d) => ({ ...d, [id]: !d[id] }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-0 flex-1 flex-col px-4 pt-2"
    >
      <div className="flex min-h-0 flex-1 flex-col rounded-[28px] border border-white/[0.06] bg-rize-card/90 p-6 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.55)] backdrop-blur-sm">
        <h2 className="text-xl font-semibold tracking-tight text-white">Today&apos;s Priorities</h2>
        <p className="mt-1 text-sm text-rize-muted">Focus on what matters most.</p>

        <ul className="mt-8 flex flex-col gap-3">
          {priorityTasks.map((task, i) => {
            const isDone = done[task.id]
            return (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.06 * i, duration: 0.35 }}
                className="flex items-start gap-3 rounded-2xl border border-rize-border/80 bg-[#0a0c14]/80 p-4"
              >
                <button
                  type="button"
                  onClick={() => toggle(task.id)}
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-rize-border bg-white/[0.03] ring-1 ring-inset ring-white/15 transition-colors touch-manipulation"
                  style={{
                    borderColor: isDone ? 'var(--color-rize-accent)' : undefined,
                    background: isDone ? 'rgba(157, 78, 221, 0.2)' : undefined,
                  }}
                  aria-pressed={isDone}
                  aria-label={isDone ? 'Mark incomplete' : 'Mark complete'}
                >
                  <AnimatePresence mode="wait">
                    {isDone && (
                      <motion.span
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      >
                        <Check className="h-4 w-4 text-rize-accent" strokeWidth={3} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                <button
                  type="button"
                  onClick={() => toggle(task.id)}
                  className="min-w-0 flex-1 text-left touch-manipulation"
                >
                  <motion.span
                    layout
                    className={`block font-semibold text-white ${isDone ? 'text-rize-muted' : ''}`}
                    animate={{ opacity: isDone ? 0.65 : 1 }}
                  >
                    <span className={isDone ? 'line-through decoration-rize-muted' : ''}>
                      {task.title}
                    </span>
                  </motion.span>
                  <span className="mt-1 block text-sm text-rize-muted">{task.time}</span>
                </button>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rize-accent/25 text-sm font-bold text-rize-accent ring-1 ring-rize-accent/40">
                  {task.n}
                </div>
              </motion.li>
            )
          })}
        </ul>

        <div className="mt-auto shrink-0 border-t border-white/[0.06] pt-4">
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={onStartDay}
            className="w-full rounded-2xl bg-gradient-to-r from-rize-accent-dim to-rize-accent py-4 text-center text-base font-semibold text-white shadow-[0_12px_40px_-8px_rgba(157,78,221,0.55)] transition hover:brightness-110 touch-manipulation"
          >
            Start Your Day
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
