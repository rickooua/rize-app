import { motion } from 'framer-motion'
import { Calendar, ChevronRight, LogOut } from 'lucide-react'
import { useState } from 'react'

type Props = {
  onLogout?: () => void
}

export function ProfileScreen({ onLogout }: Props) {
  const [goal, setGoal] = useState('Show up for 20 minutes of focus before noon')
  const [notifications, setNotifications] = useState(true)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pb-28 pt-2">
      <div className="flex flex-col items-center text-center">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-rize-accent to-violet-600 p-[3px] shadow-[0_16px_48px_-12px_rgba(157,78,221,0.5)]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0c0d18] text-3xl font-bold text-rize-muted/60">
            ?
          </div>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-white">Could be you</h2>
        <p className="text-sm text-rize-muted">Morning person in progress</p>
      </div>

      <div className="rounded-[28px] border border-white/[0.06] bg-rize-card/90 p-5">
        <label htmlFor="daily-goal" className="text-xs font-medium uppercase tracking-wider text-rize-muted">
          Daily intention
        </label>
        <textarea
          id="daily-goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          rows={3}
          className="mt-3 w-full resize-none rounded-2xl border border-rize-border bg-[#0a0c14] px-4 py-3 text-sm text-white placeholder:text-rize-muted focus:border-rize-accent/50 focus:outline-none focus:ring-1 focus:ring-rize-accent/40"
        />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-rize-border bg-[#0a0c14]/80 px-4 py-4">
        <div>
          <p className="font-medium text-white">Gentle reminders</p>
          <p className="text-sm text-rize-muted">Nudges, not nagging</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={notifications}
          onClick={() => setNotifications((n) => !n)}
          className={`relative h-8 w-14 rounded-full transition-colors touch-manipulation ${
            notifications ? 'bg-rize-accent' : 'bg-rize-border'
          }`}
        >
          <motion.span
            layout
            className="absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow"
            animate={{ x: notifications ? 24 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        </button>
      </div>

      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rize-border bg-rize-card/80 px-4 py-4 text-sm font-semibold text-rize-muted transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300 touch-manipulation"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      )}

      <div>
        <h3 className="mb-3 text-sm font-semibold text-rize-muted">Calendars</h3>
        <div className="space-y-2">
          {[
            { name: 'Google Calendar', connected: true },
            { name: 'Apple Calendar', connected: false },
          ].map((cal) => (
            <button
              key={cal.name}
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-rize-border bg-rize-card/80 px-4 py-4 text-left transition hover:border-rize-accent/30 touch-manipulation"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                  <Calendar className="h-5 w-5 text-rize-accent" />
                </span>
                <span>
                  <span className="block font-medium text-white">{cal.name}</span>
                  <span className="text-xs text-rize-muted">
                    {cal.connected ? 'Connected' : 'Not connected'}
                  </span>
                </span>
              </span>
              <ChevronRight className="h-5 w-5 text-rize-muted" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
