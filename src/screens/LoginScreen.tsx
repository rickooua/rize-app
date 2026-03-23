import { motion } from 'framer-motion'
import { ArrowRight, Lock, Mail } from 'lucide-react'
import { type FormEvent, useState } from 'react'

type Props = {
  onLoggedIn: () => void
}

export function LoginScreen({ onLoggedIn }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onLoggedIn()
  }

  return (
    <div className="flex min-h-dvh flex-col bg-rize-bg bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(157,78,221,0.14),transparent)] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto flex w-full max-w-md flex-1 flex-col"
      >
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rize-accent/90">Rize</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm leading-relaxed text-rize-muted">
            Sign in to pick up where you left off. (Layout preview — no real account yet.)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-rize-muted">Email</span>
            <div className="relative mt-2">
              <Mail
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rize-muted"
                aria-hidden
              />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-rize-border bg-[#0a0c14] py-3.5 pr-4 pl-11 text-sm text-white placeholder:text-rize-muted/80 focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-rize-muted">Password</span>
            <div className="relative mt-2">
              <Lock
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rize-muted"
                aria-hidden
              />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-rize-border bg-[#0a0c14] py-3.5 pr-4 pl-11 text-sm text-white placeholder:text-rize-muted/80 focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
              />
            </div>
          </label>

          <button
            type="button"
            className="mt-1 self-start text-sm font-medium text-rize-accent/90 underline-offset-4 hover:underline"
          >
            Forgot password?
          </button>

          <div className="mt-auto flex flex-col gap-4 pt-8">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rize-accent px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_40px_-12px_rgba(157,78,221,0.55)] transition hover:bg-[#a855f0] touch-manipulation"
            >
              Log in
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-center text-sm text-rize-muted">
              New here?{' '}
              <button type="button" className="font-semibold text-white underline-offset-4 hover:underline">
                Create an account
              </button>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
