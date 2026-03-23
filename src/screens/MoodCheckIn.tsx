import { motion } from 'framer-motion'

const moods = [
  { id: 'rough', label: 'Rough', emoji: '😮‍💨' },
  { id: 'meh', label: 'Meh', emoji: '😐' },
  { id: 'fine', label: 'Fine', emoji: '🙂' },
  { id: 'good', label: 'Good', emoji: '😊' },
  { id: 'amazing', label: 'Amazing', emoji: '🤩' },
] as const

type Props = {
  onSelect: () => void
}

export function MoodCheckIn({ onSelect }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex min-h-0 flex-1 flex-col px-4 pt-2"
    >
      <div className="rounded-[28px] border border-white/[0.06] bg-rize-card/90 p-6 text-center shadow-[0_20px_60px_-24px_rgba(0,0,0,0.55)] backdrop-blur-sm">
        <h2 className="text-xl font-semibold tracking-tight text-white">How&apos;d you sleep?</h2>
        <p className="mt-1 text-sm text-rize-muted">Let&apos;s see how you&apos;re feeling today.</p>

        <div className="mt-8 flex w-full justify-center">
          <div className="grid w-full max-w-[min(100%,22rem)] grid-cols-5 gap-1.5 sm:gap-2.5">
            {moods.map((m, i) => (
              <motion.button
                key={m.id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.35 }}
                whileTap={{ scale: 0.94 }}
                onClick={onSelect}
                className="flex flex-col items-center gap-1.5 rounded-2xl border border-rize-border bg-[#0a0c14] px-0.5 py-3 transition-colors hover:border-rize-accent/40 hover:bg-rize-accent/5 touch-manipulation sm:gap-2"
              >
                <span className="text-xl leading-none sm:text-2xl" aria-hidden>
                  {m.emoji}
                </span>
                <span className="text-[10px] font-medium leading-tight text-rize-muted sm:text-[11px]">{m.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
