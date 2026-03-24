import { Link } from 'react-router-dom'
import { SITE } from './config'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#05060d]/90">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-12">
        <div>
          <p className="text-base font-semibold text-white sm:text-lg">{SITE.name}</p>
          <p className="mt-1 text-sm text-rize-muted sm:text-base">{SITE.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm sm:text-base">
          <a
            href={`mailto:${SITE.contactEmail}`}
            className="text-rize-muted transition hover:text-white"
          >
            {SITE.contactEmail}
          </a>
          <Link to="/privacy" className="text-rize-muted transition hover:text-white">
            Privacy
          </Link>
          <Link to="/terms" className="text-rize-muted transition hover:text-white">
            Terms
          </Link>
        </div>
      </div>
      <div className="border-t border-white/[0.04] py-4 text-center text-xs text-rize-muted/80">
        © {new Date().getFullYear()} {SITE.name}. All rights reserved.
      </div>
    </footer>
  )
}
