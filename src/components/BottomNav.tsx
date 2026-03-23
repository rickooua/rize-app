import { CalendarDays, Home, User, BarChart3 } from 'lucide-react'

export type TabId = 'home' | 'schedule' | 'stats' | 'profile'

type Props = {
  active: TabId
  onChange: (tab: TabId) => void
}

const tabs: { id: TabId; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'schedule', label: 'Schedule', Icon: CalendarDays },
  { id: 'stats', label: 'Stats', Icon: BarChart3 },
  { id: 'profile', label: 'Profile', Icon: User },
]

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-rize-border/80 bg-[#070814]/95 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around gap-1 px-2 pt-2">
        {tabs.map(({ id, label, Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-colors touch-manipulation"
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`flex h-10 w-14 items-center justify-center rounded-2xl transition-colors ${
                  isActive ? 'bg-rize-accent/20 text-rize-accent' : 'text-rize-muted'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
              </span>
              <span
                className={`text-[11px] font-medium tracking-wide ${
                  isActive ? 'text-rize-accent' : 'text-rize-muted'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
