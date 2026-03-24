import { motion, useAnimationControls } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useCallback, useRef } from 'react'

type Props = {
  onContinue: () => void
}

export function MorningQuote({ onContinue }: Props) {
  const controls = useAnimationControls()
  const busy = useRef(false)

  const handleTap = useCallback(async () => {
    if (busy.current) return
    busy.current = true
    await controls.start({
      rotateY: -72,
      rotateZ: 6,
      x: 120,
      opacity: 0,
      transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
    })
    onContinue()
  }, [controls, onContinue])

  return (
    <div
      className="flex min-h-0 flex-1 flex-col px-4 pt-2"
      style={{ perspective: 1200 }}
    >
      <motion.button
        type="button"
        onClick={handleTap}
        animate={controls}
        initial={{ rotateY: 0, rotateZ: 0, x: 0, opacity: 1 }}
        style={{ transformStyle: 'preserve-3d' }}
        whileTap={{ scale: 0.985 }}
        className="group relative flex min-h-0 flex-1 w-full flex-col overflow-hidden rounded-[28px] border border-white/[0.06] bg-gradient-to-br from-[#141528] via-[#0c0d18] to-[#06070f] p-8 text-left shadow-[0_24px_80px_-20px_rgba(0,0,0,0.65)] touch-manipulation"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(157,78,221,0.12),transparent_50%)]" />
        <div className="pointer-events-none absolute -right-20 top-20 h-48 w-48 rounded-full bg-rize-accent/10 blur-3xl" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center gap-8">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center rounded-2xl bg-rize-accent/15 px-4 py-3 ring-1 ring-rize-accent/30">
              <Sparkles className="h-7 w-7 text-rize-accent" aria-hidden />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-center text-[1.65rem] font-semibold leading-snug tracking-tight text-white md:text-3xl">
              Small steps every day lead to big changes over time.
            </p>
            <p className="text-center text-lg italic text-rize-accent">— You&apos;ve got this</p>
          </div>

          <p className="text-center text-sm text-rize-muted/90">
            Tap anywhere to begin your morning
          </p>
        </div>
      </motion.button>
    </div>
  )
}
