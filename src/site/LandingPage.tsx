import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, BarChart3, CalendarDays, Heart, Sun } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SITE } from './config'
import { SiteFooter } from './SiteFooter'

const features = [
  {
    title: 'Morning flow',
    body: 'Quotes, sleep check-in, and priorities — start without overwhelm.',
    icon: Sun,
  },
  {
    title: 'Schedule your own',
    body: 'Day list, calendar, repeats, and swipe between days — your rhythm.',
    icon: CalendarDays,
  },
  {
    title: 'Honest stats',
    body: 'See your week without judgment — habits and wins in one place.',
    icon: BarChart3,
  },
  {
    title: 'Kind by design',
    body: 'Built for real life: progress over perfection, always.',
    icon: Heart,
  },
] as const

function FeaturesCarousel() {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(0)

  const go = (next: number) => {
    setDir(next)
    setIndex((i) => (i + next + features.length) % features.length)
  }

  const f = features[index]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.5 }}
      className="mx-auto mt-16 w-full max-w-5xl lg:mt-20 lg:max-w-6xl xl:max-w-7xl"
    >
      <p className="mb-8 text-center text-sm font-medium text-rize-muted sm:text-base lg:text-lg">
        What you&apos;ll find inside
      </p>
      <div className="relative flex items-stretch gap-4 px-12 sm:px-16">
        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute -left-2 top-1/2 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0c14]/95 text-white shadow-lg transition hover:border-rize-accent/40 hover:bg-rize-accent/15 focus:outline-none focus:ring-2 focus:ring-rize-accent/50 sm:-left-4 sm:h-16 sm:w-16"
          aria-label="Previous feature"
        >
          <ArrowLeft className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>

        <div className="min-h-[260px] flex-1 overflow-hidden sm:min-h-[300px] lg:min-h-[340px]">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={index}
              custom={dir}
              initial={{ x: dir >= 0 ? 120 : -120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: dir >= 0 ? -120 : 120, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="h-full rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-[#15162a]/95 to-[#0a0b14] p-8 shadow-[0_32px_80px_-32px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.04] sm:p-10 lg:p-12"
            >
              <motion.span
                className="mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rize-accent/15 text-rize-accent ring-1 ring-rize-accent/25 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem]"
                layout
              >
                <f.icon className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10" aria-hidden />
              </motion.span>
              <h2 className="text-xl font-semibold text-white sm:text-2xl lg:text-3xl">{f.title}</h2>
              <p className="mt-4 text-base leading-relaxed text-rize-muted sm:text-lg lg:text-xl">{f.body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          className="absolute -right-2 top-1/2 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0c14]/95 text-white shadow-lg transition hover:border-rize-accent/40 hover:bg-rize-accent/15 focus:outline-none focus:ring-2 focus:ring-rize-accent/50 sm:-right-4 sm:h-16 sm:w-16"
          aria-label="Next feature"
        >
          <ArrowRight className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        {features.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              if (i === index) return
              setDir(i > index ? 1 : -1)
              setIndex(i)
            }}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index ? 'true' : undefined}
            className={`h-2 rounded-full transition-all touch-manipulation ${
              i === index
                ? 'w-8 bg-rize-accent'
                : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </motion.div>
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
              Open app
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="mx-auto w-full max-w-7xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-4xl text-center lg:max-w-5xl xl:max-w-6xl"
          >
            <p className="text-base text-rize-muted/90 sm:text-lg lg:text-xl">
              Self-improvement, without the guilt trip.
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.1] lg:text-6xl xl:text-7xl xl:leading-[1.08]">
              {SITE.name}: your pocket coach for calmer days
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-rize-muted sm:text-xl lg:text-2xl lg:leading-relaxed">
              {SITE.tagline}
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Link
                to="/app"
                className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-rize-accent px-10 py-4 text-base font-semibold text-white shadow-[0_20px_50px_-12px_rgba(157,78,221,0.55)] transition hover:bg-[#a855f0] sm:w-auto sm:px-12 sm:py-5 sm:text-lg"
              >
                Try the app
                <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <a
                href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent('Question about Rize')}`}
                className="inline-flex w-full max-w-sm items-center justify-center rounded-2xl border border-rize-border bg-white/[0.03] px-10 py-4 text-base font-semibold text-white transition hover:border-rize-accent/40 hover:bg-white/[0.06] sm:w-auto sm:px-12 sm:py-5 sm:text-lg"
              >
                Contact
              </a>
            </div>
          </motion.div>

          <FeaturesCarousel />

          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mx-auto mt-20 max-w-3xl text-center lg:mt-24 lg:max-w-4xl xl:max-w-5xl"
          >
            <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl xl:text-5xl">Built for real life</h2>
            <p className="mt-4 text-base text-rize-muted sm:text-lg lg:text-xl">
              {SITE.name} is designed as a supportive tool — not a scoreboard. Use it to show up,
              reflect, and move forward at your pace.
            </p>
          </motion.section>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
