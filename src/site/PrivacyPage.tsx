import { Link } from 'react-router-dom'
import { SITE } from './config'
import { SiteFooter } from './SiteFooter'

export function PrivacyPage() {
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
        <h1 className="text-3xl font-bold tracking-tight text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-rize-muted">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-10 max-w-none space-y-6 text-sm leading-relaxed text-rize-muted [&_a]:text-rize-accent [&_a]:hover:underline [&_strong]:text-white">
          <p>
            This policy describes how <strong>{SITE.legalEntity}</strong> (“we”, “us”) handles information
            when you use the {SITE.name} website and application (the “Service”). This is a starter
            template — review with a lawyer before handling real user data or payments.
          </p>

          <h2 className="text-lg font-semibold text-white">Information we may collect</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Account details you provide (such as email) if you sign up.</li>
            <li>Content you enter in the app (for example schedules, notes, or preferences).</li>
            <li>Technical data such as device type, approximate region, and diagnostics to run the Service.</li>
          </ul>

          <h2 className="text-lg font-semibold text-white">How we use information</h2>
          <p>We use information to provide and improve the Service, secure accounts, and communicate with you about the product.</p>

          <h2 className="text-lg font-semibold text-white">Sharing</h2>
          <p>
            We may use trusted infrastructure providers (for example hosting or database services) to operate
            the Service. We do not sell your personal information.
          </p>

          <h2 className="text-lg font-semibold text-white">Payments</h2>
          <p>
            If we offer paid features, payment processing may be handled by a third party such as Stripe.
            We typically do not store full card numbers on our servers.
          </p>

          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p>
            Questions about this policy:{' '}
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
