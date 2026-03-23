import { Link } from 'react-router-dom'
import { SITE } from './config'
import { SiteFooter } from './SiteFooter'

export function TermsPage() {
  return (
    <div className="min-h-dvh bg-rize-bg text-[#f4f4f8]">
      <header className="border-b border-white/[0.06] bg-[#05060d]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-sm font-semibold uppercase tracking-[0.2em] text-rize-accent/90">
            {SITE.name}
          </Link>
          <Link to="/app" className="text-sm font-medium text-rize-muted hover:text-white">
            Open app
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-rize-muted">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-10 max-w-none space-y-6 text-sm leading-relaxed text-rize-muted [&_a]:text-rize-accent [&_a]:hover:underline [&_strong]:text-white">
          <p>
            These Terms govern your use of the {SITE.name} website and application (the “Service”) provided
            by <strong>{SITE.legalEntity}</strong>. By using the Service, you agree to these Terms. This is a
            starter template — have it reviewed before launch.
          </p>

          <h2 className="text-lg font-semibold text-white">The Service</h2>
          <p>
            {SITE.name} is provided for personal productivity and wellbeing support. It is not medical or
            mental health treatment and is not a substitute for professional care.
          </p>

          <h2 className="text-lg font-semibold text-white">Accounts</h2>
          <p>You are responsible for keeping your login credentials secure and for activity under your account.</p>

          <h2 className="text-lg font-semibold text-white">Acceptable use</h2>
          <p>You agree not to misuse the Service, attempt unauthorized access, or use it in violation of law.</p>

          <h2 className="text-lg font-semibold text-white">Disclaimer</h2>
          <p>
            The Service is provided “as is” without warranties of any kind. To the fullest extent permitted by
            law, we are not liable for indirect or consequential damages arising from your use of the Service.
          </p>

          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p>
            <a href={`mailto:${SITE.contactEmail}`} className="text-rize-accent hover:underline">
              {SITE.contactEmail}
            </a>
          </p>
        </div>

        <p className="mt-10 text-xs text-rize-muted/80">
          <Link to="/" className="text-rize-accent hover:underline">
            ← Back to home
          </Link>
        </p>
      </article>

      <SiteFooter />
    </div>
  )
}
