import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useState } from 'react'
import { BottomNav, type TabId } from './components/BottomNav'
import { HomeDashboard } from './screens/HomeDashboard'
import { LoginScreen } from './screens/LoginScreen'
import { MoodCheckIn } from './screens/MoodCheckIn'
import { MorningQuote } from './screens/MorningQuote'
import { PrioritiesScreen } from './screens/PrioritiesScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { ScheduleScreen } from './screens/ScheduleScreen'
import { StatsScreen } from './screens/StatsScreen'

type HomePhase = 'quote' | 'sleep' | 'priorities' | 'dashboard'

/** Full in-app experience (behind /app). */
export default function RizeApp() {
  const [session, setSession] = useState<'login' | 'app'>('login')
  const [tab, setTab] = useState<TabId>('home')
  const [homePhase, setHomePhase] = useState<HomePhase>('quote')

  const goQuoteToSleep = useCallback(() => {
    setHomePhase('sleep')
  }, [])

  const goSleepToPriorities = useCallback(() => {
    setHomePhase('priorities')
  }, [])

  const completeMorning = useCallback(() => {
    setHomePhase('dashboard')
  }, [])

  const replayMorning = useCallback(() => {
    setHomePhase('quote')
  }, [])

  const renderHome = () => {
    return (
      <AnimatePresence mode="wait">
        {homePhase === 'quote' && (
          <motion.div
            key="quote"
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MorningQuote onContinue={goQuoteToSleep} />
          </motion.div>
        )}
        {homePhase === 'sleep' && (
          <motion.div
            key="sleep"
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MoodCheckIn onSelect={goSleepToPriorities} />
          </motion.div>
        )}
        {homePhase === 'priorities' && (
          <motion.div
            key="priorities"
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <PrioritiesScreen onStartDay={completeMorning} />
          </motion.div>
        )}
        {homePhase === 'dashboard' && (
          <motion.div
            key="dashboard"
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <HomeDashboard streakDays={7} onReplayMorning={replayMorning} />
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  const renderTab = () => {
    switch (tab) {
      case 'home':
        return renderHome()
      case 'schedule':
        return <ScheduleScreen />
      case 'stats':
        return <StatsScreen />
      case 'profile':
        return <ProfileScreen onLogout={() => setSession('login')} />
      default:
        return null
    }
  }

  if (session === 'login') {
    return <LoginScreen onLoggedIn={() => setSession('app')} />
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-rize-bg bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(157,78,221,0.12),transparent)]">
      <header
        className="shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2"
        style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rize-accent/90">Rize</p>
            <p className="text-sm text-rize-muted">Coach in your pocket</p>
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">{renderTab()}</main>

      <div className="h-[calc(5.25rem+env(safe-area-inset-bottom))] shrink-0" aria-hidden />
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
