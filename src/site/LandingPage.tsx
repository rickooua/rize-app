import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowLeft, ArrowRight, BarChart3, CalendarDays, Heart, Sun } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// Variants defined outside so they're never recreated.
// dir > 0 = right arrow (next): exits left, enters from right
// dir < 0 = left arrow (prev): exits right, enters from left
const featureSlideVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir >= 0 ? -120 : 120, opacity: 0 }),
}
import { Link } from 'react-router-dom'
import { SITE } from './config'
import { SiteFooter } from './SiteFooter'

const features = [
  {
    title: 'Morning flow',
    body: 'Start with a quiet moment, a quick sleep check-in, and three priorities for the day. No overwhelm — just a calm way to orient before everything starts.',
    icon: Sun,
  },
  {
    title: 'Schedule your own',
    body: 'A day list you actually control. Add blocks, set repeats, swipe between days, and switch to calendar view. Your rhythm, your rules.',
    icon: CalendarDays,
  },
  {
    title: 'Honest stats',
    body: 'See your week — habits, check-ins, wins — without guilt. We show the shape of your effort, not a score that punishes you for missing a day.',
    icon: BarChart3,
  },
  {
    title: 'Kind by design',
    body: 'Built for real life: progress over perfection. The app nudges, it doesn’t nag. You show up when you can, and that’s enough.',
    icon: Heart,
  },
] as const

/** Styled mockup of each feature for card fill — flat CSS, no images. */
function FeatureMock({ featureIndex }: { featureIndex: number }) {
  return (
    <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#13152a]/80 p-4">
      {featureIndex === 0 && (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed text-rize-muted/90 italic">
            &ldquo;Small steps compound.&rdquo;
          </p>
          <div className="flex gap-1.5">
            {['😴', '😐', '🙂', '😊', '🌟'].map((e, i) => (
              <span
                key={i}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-sm"
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      )}
      {featureIndex === 1 && (
        <div className="space-y-2">
          {[
            { time: '6:30', title: 'Wake + hydrate', bar: 'w-full' },
            { time: '9:00', title: 'Deep work', bar: 'w-3/4' },
            { time: '12:30', title: 'Lunch', bar: 'w-1/2' },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-10 shrink-0 text-[10px] text-rize-muted">{row.time}</span>
              <div
                className={`h-6 rounded-md bg-rize-accent/20 ${row.bar}`}
                style={{ minWidth: 60 }}
              />
            </div>
          ))}
        </div>
      )}
      {featureIndex === 2 && (
        <div className="flex items-end justify-between gap-1">
          {[
            { d: 'M', h: 20 },
            { d: 'T', h: 28 },
            { d: 'W', h: 14 },
            { d: 'T', h: 32 },
            { d: 'F', h: 24 },
            { d: 'S', h: 36 },
            { d: 'S', h: 22 },
          ].map(({ d, h }) => (
            <div key={d} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full min-w-[6px] rounded-t bg-rize-accent/40"
                style={{ height: h }}
              />
              <span className="text-[9px] text-rize-muted">{d}</span>
            </div>
          ))}
        </div>
      )}
      {featureIndex === 3 && (
        <div className="rounded-2xl border border-rize-accent/20 bg-rize-accent/5 px-4 py-3">
          <p className="text-[11px] leading-relaxed text-rize-muted">
            You showed up 4 days this week. That&apos;s enough.
          </p>
        </div>
      )}
    </div>
  )
}

function FeaturesCarousel() {
  // dir and index are ONE atomic state update — always in sync on the same render.
  const [slide, setSlide] = useState({ index: 0, dir: 0 })

  const go = useCallback((delta: number) => {
    setSlide((prev) => ({
      dir: delta,
      index: (prev.index + delta + features.length) % features.length,
    }))
  }, [])

  const goTo = useCallback((i: number) => {
    setSlide((prev) => {
      if (i === prev.index) return prev
      return { dir: i > prev.index ? 1 : -1, index: i }
    })
  }, [])

  const f = features[slide.index]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.5 }}
      className="mx-auto mt-16 w-full max-w-5xl lg:mt-20 lg:max-w-6xl xl:max-w-7xl"
    >
      <h2 className="mb-8 text-center text-base font-semibold text-rize-muted sm:text-lg">
        What you&apos;ll find inside
      </h2>

      {/* Card + side arrows — arrows only on sm+ so the card fills full width on mobile */}
      <div className="relative flex items-stretch sm:gap-4 sm:px-16">
        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute -left-2 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0c14]/95 text-white shadow-lg transition hover:border-rize-accent/40 hover:bg-rize-accent/15 focus:outline-none focus:ring-2 focus:ring-rize-accent/50 sm:-left-4 sm:flex sm:h-16 sm:w-16"
          aria-label="Previous feature"
        >
          <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>

        <div className="min-h-[300px] flex-1 overflow-hidden sm:min-h-[320px] lg:min-h-[360px]">
          <AnimatePresence mode="wait" custom={slide.dir} initial={false}>
            <motion.div
              key={slide.index}
              custom={slide.dir}
              variants={featureSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="h-full rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-[#15162a]/95 to-[#0a0b14] p-7 shadow-[0_32px_80px_-32px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.04] sm:p-10 lg:p-12"
            >
              <motion.span
                className="mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rize-accent/15 text-rize-accent ring-1 ring-rize-accent/25 sm:mb-6 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem]"
                layout
              >
                <f.icon className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10" aria-hidden />
              </motion.span>
              <h2 className="text-2xl font-semibold text-white sm:text-2xl lg:text-3xl">{f.title}</h2>
              <p className="mt-3 text-base leading-relaxed text-rize-muted sm:mt-4 sm:text-lg lg:text-xl">{f.body}</p>
              <FeatureMock featureIndex={slide.index} />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          className="absolute -right-2 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0c14]/95 text-white shadow-lg transition hover:border-rize-accent/40 hover:bg-rize-accent/15 focus:outline-none focus:ring-2 focus:ring-rize-accent/50 sm:-right-4 sm:flex sm:h-16 sm:w-16"
          aria-label="Next feature"
        >
          <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      </div>

      {/* Dots + mobile prev/next arrows in one row */}
      <div className="mt-7 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0a0c14]/95 text-white transition hover:border-rize-accent/40 hover:bg-rize-accent/15 focus:outline-none touch-manipulation sm:hidden"
          aria-label="Previous feature"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
        {features.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === slide.index ? 'true' : undefined}
            className={`h-2 rounded-full transition-all touch-manipulation ${
              i === slide.index
                ? 'w-8 bg-rize-accent'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#0a0c14]/95 text-white transition hover:border-rize-accent/40 hover:bg-rize-accent/15 focus:outline-none touch-manipulation sm:hidden"
          aria-label="Next feature"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  )
}

function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  // Cursor-tracking spring values — desktop (pointer: fine) only
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const springX = useSpring(rawX, { stiffness: 60, damping: 22, mass: 0.5 })
  const springY = useSpring(rawY, { stiffness: 60, damping: 22, mass: 0.5 })

  // Title moves a bit, subtitle less, glow follows more
  const titleX   = useTransform(springX, [-0.5, 0.5], ['-6px',  '6px'])
  const titleY   = useTransform(springY, [-0.5, 0.5], ['-4px',  '4px'])
  const subX     = useTransform(springX, [-0.5, 0.5], ['-3px',  '3px'])
  const subY     = useTransform(springY, [-0.5, 0.5], ['-2px',  '2px'])
  const glowX    = useTransform(springX, [-0.5, 0.5], ['-20px', '20px'])
  const glowY    = useTransform(springY, [-0.5, 0.5], ['-12px', '12px'])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      rawX.set((e.clientX - r.left) / r.width - 0.5)
      rawY.set((e.clientY - r.top) / r.height - 0.5)
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [rawX, rawY])

  return (
    <div ref={sectionRef} className="relative mx-auto max-w-4xl text-center lg:max-w-5xl xl:max-w-6xl">
      {/* Cursor-following ambient glow */}
      <motion.div
        aria-hidden
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none absolute inset-0 -z-10 mx-auto h-full w-3/4 rounded-full bg-rize-accent/10 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-base text-rize-muted/90 sm:text-lg lg:text-xl">
          Self-improvement, without the guilt trip.
        </p>
      </motion.div>

      <motion.h1
        style={{ x: titleX, y: titleY }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.07, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.1] lg:text-6xl xl:text-7xl xl:leading-[1.08]"
      >
        {SITE.name}: your pocket coach for calmer days
      </motion.h1>

      <motion.p
        style={{ x: subX, y: subY }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        className="mt-6 text-lg leading-relaxed text-rize-muted sm:text-xl lg:text-2xl lg:leading-relaxed"
      >
        {SITE.tagline}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row sm:flex-wrap sm:gap-6"
      >
        <Link
          to="/app"
          className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-rize-accent px-10 py-4 text-base font-semibold text-white shadow-[0_20px_50px_-12px_rgba(157,78,221,0.55)] transition hover:bg-[#a855f0] sm:w-auto sm:px-12 sm:py-5 sm:text-lg"
        >
          Try the app
          <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={SITE.appStoreUrl}
            className="inline-flex h-12 items-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white/95 transition hover:bg-white/10 hover:border-white/30"
            aria-label="Download on the App Store"
          >
            Download on the App Store
          </a>
          <a
            href={SITE.googlePlayUrl}
            className="inline-flex h-12 items-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white/95 transition hover:bg-white/10 hover:border-white/30"
            aria-label="Get it on Google Play"
          >
            Get it on Google Play
          </a>
        </div>
      </motion.div>
    </div>
  )
}

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-rize-bg bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(157,78,221,0.14),transparent)] text-[#f4f4f8]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-rize-accent focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#05060d]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:px-12">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-rize-accent/90">
              {SITE.name}
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/privacy" className="hidden text-rize-muted transition hover:text-white sm:inline">
              Privacy
            </Link>
            <Link to="/terms" className="hidden text-rize-muted transition hover:text-white sm:inline">
              Terms
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-rize-accent/15 px-4 py-2 text-sm font-semibold text-rize-accent ring-1 ring-rize-accent/35 transition hover:bg-rize-accent/25"
            >
              Try Rize
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24 xl:px-12">
          <HeroSection />

          <p className="mt-12 text-center text-sm text-[#888] sm:text-base">
            ★★★★★ {SITE.appStoreRating} on the App Store · &ldquo;{SITE.socialProof}&rdquo;
          </p>

          <FeaturesCarousel />

          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mx-auto mt-12 max-w-3xl text-center lg:mt-14 lg:max-w-4xl xl:max-w-5xl"
          >
            <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl xl:text-5xl">Built for real life</h2>
            <p className="mt-4 text-base text-rize-muted sm:text-lg lg:text-xl">
              {SITE.name} is designed as a supportive tool — not a scoreboard. Use it to show up,
              reflect, and move forward at your pace.
            </p>
            <Link
              to="/app"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-rize-accent/15 px-6 py-3 text-sm font-semibold text-rize-accent ring-1 ring-rize-accent/35 transition hover:bg-rize-accent/25"
            >
              Try Rize
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.section>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
