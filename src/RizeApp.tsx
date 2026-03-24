import { useCallback, useMemo, useState } from 'react'
import { BottomNav, type TabId } from './components/BottomNav'
import { dateKey, defaultBlocks, type OneOffBlock, type RecurringBlock, startOfDay } from './lib/schedule'
import { HomeDashboard } from './screens/HomeDashboard'
import { ProfileScreen } from './screens/ProfileScreen'
import { ScheduleScreen } from './screens/ScheduleScreen'

export default function RizeApp() {
  const [tab, setTab] = useState<TabId>('home')

  // Schedule state lifted so HomeDashboard can read today's blocks
  const today = useMemo(() => startOfDay(new Date()), [])
  const todayKey = dateKey(today)

  const [blocksByDate, setBlocksByDate] = useState<Record<string, OneOffBlock[]>>(() => ({
    [todayKey]: defaultBlocks.map((b) => ({ ...b })),
  }))
  const [recurring, setRecurring] = useState<RecurringBlock[]>([])

  // When user taps "+ Add block" on home, switch to Schedule and open the sheet
  const [scheduleAddOpen, setScheduleAddOpen] = useState(false)

  const handleAddBlock = useCallback(() => {
    setScheduleAddOpen(true)
    setTab('schedule')
  }, [])

  const handleAddMounted = useCallback(() => {
    setScheduleAddOpen(false)
  }, [])

  const handleLogout = useCallback(() => {
    setTab('home')
  }, [])

  const renderTab = () => {
    switch (tab) {
      case 'home':
        return (
          <HomeDashboard
            streakDays={7}
            blocksByDate={blocksByDate}
            recurring={recurring}
            onAddBlock={handleAddBlock}
          />
        )
      case 'schedule':
        return (
          <ScheduleScreen
            blocksByDate={blocksByDate}
            setBlocksByDate={setBlocksByDate}
            recurring={recurring}
            setRecurring={setRecurring}
            openAddOnMount={scheduleAddOpen}
            onAddMounted={handleAddMounted}
          />
        )
      case 'profile':
        return <ProfileScreen onLogout={handleLogout} />
      default:
        return null
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-rize-bg bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(157,78,221,0.12),transparent)]">
      <header
        className="shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2"
        style={{
          paddingLeft: 'max(1rem, env(safe-area-inset-left))',
          paddingRight: 'max(1rem, env(safe-area-inset-right))',
        }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rize-accent/90">Rize</p>
          <p className="text-sm text-rize-muted">Coach in your pocket</p>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col">{renderTab()}</main>

      <div className="h-[calc(5.5rem+env(safe-area-inset-bottom))] shrink-0" aria-hidden />
      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
