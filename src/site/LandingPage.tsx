import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, CalendarDays, Heart, Sparkles, Sun } from 'lucide-react'
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
    title: 'Schedule you own',
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
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
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
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-rize-muted ring-1 ring-white/[0.06]">
              <Sparkles className="h-3.5 w-3.5 text-rize-accent" aria-hidden />
              Self-improvement, without the guilt trip
            </p>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl sm:leading-[1.1]">
              {SITE.name}: your pocket coach for calmer days
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-rize-muted sm:text-xl">{SITE.tagline}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                to="/app"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rize-accent px-8 py-4 text-base font-semibold text-white shadow-[0_20px_50px_-12px_rgba(157,78,221,0.55)] transition hover:bg-[#a855f0] sm:w-auto"
              >
                Try the app
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href={`mailto:${SITE.contactEmail}?subject=${encodeURIComponent('Question about Rize')}`}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-rize-border bg-white/[0.03] px-8 py-4 text-base font-semibold text-white transition hover:border-rize-accent/40 hover:bg-white/[0.06] sm:w-auto"
              >
                Contact
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="mx-auto mt-16 max-w-4xl rounded-[32px] border border-white/[0.08] bg-gradient-to-br from-[#15162a]/95 to-[#0a0b14] p-1 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.65)]"
          >
            <div className="rounded-[28px] border border-white/[0.05] bg-[#0c0d18]/90 p-8 sm:p-10">
              <p className="text-center text-sm font-medium text-rize-muted">
                What you&apos;ll find inside
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {features.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    className="flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left ring-1 ring-white/[0.04]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rize-accent/15 text-rize-accent ring-1 ring-rize-accent/25">
                      <f.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h2 className="font-semibold text-white">{f.title}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-rize-muted">{f.body}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="mx-auto mt-20 max-w-2xl text-center"
          >
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Built for real life</h2>
            <p className="mt-4 text-rize-muted">
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
