import { Link } from 'react-router';
import { usePageMeta } from '@/lib/use-page-meta';

export function PrivacyPage() {
  usePageMeta({
    title: 'Privacy Policy — DailyOS',
    description:
      'Learn how DailyOS collects, uses, and protects your personal data. We believe in privacy by design.',
    robots: 'index, follow',
  });

  const lastUpdated = 'August 10, 2026';

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.85)] backdrop-blur-md"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5" aria-label="DailyOS home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
              <span
                className="text-sm font-bold text-[hsl(var(--primary-foreground))]"
                aria-hidden="true"
              >
                D
              </span>
            </div>
            <span className="text-lg font-semibold tracking-tight">DailyOS</span>
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--foreground-muted))]">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="prose prose-sm max-w-none space-y-8 text-[hsl(var(--foreground-secondary))]">
          <section aria-labelledby="overview-heading">
            <h2
              id="overview-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Overview
            </h2>
            <p>
              DailyOS is a personal productivity application. We take your privacy seriously. This
              policy explains what data we collect, why we collect it, and how we protect it. We
              collect only what is necessary to provide the service.
            </p>
          </section>

          <section aria-labelledby="data-collected-heading">
            <h2
              id="data-collected-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Data We Collect
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-[hsl(var(--foreground))]">Account information:</strong> Your
                name and email address, provided when you register or sign in with Google.
              </li>
              <li>
                <strong className="text-[hsl(var(--foreground))]">Task and habit data:</strong> The
                tasks, recurring habits, categories, and tags you create within the app. This data
                belongs to you.
              </li>
              <li>
                <strong className="text-[hsl(var(--foreground))]">Timezone:</strong> Your IANA
                timezone (e.g. America/New_York), used to correctly calculate daily, weekly, and
                monthly recurring tasks.
              </li>
              <li>
                <strong className="text-[hsl(var(--foreground))]">Authentication tokens:</strong>{' '}
                Securely stored session tokens (refresh tokens in HttpOnly cookies, access tokens in
                JavaScript memory only — never in localStorage).
              </li>
            </ul>
          </section>

          <section aria-labelledby="data-not-collected-heading">
            <h2
              id="data-not-collected-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Data We Do Not Collect
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>We do not collect payment information. DailyOS is currently free.</li>
              <li>We do not sell your data to third parties.</li>
              <li>We do not share your task content or personal data with advertisers.</li>
              <li>We do not track your location.</li>
            </ul>
          </section>

          <section aria-labelledby="data-use-heading">
            <h2
              id="data-use-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              How We Use Your Data
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>To provide and operate the DailyOS service.</li>
              <li>To authenticate your account securely.</li>
              <li>To generate recurring task occurrences based on your timezone.</li>
              <li>To display your productivity statistics and completion history.</li>
            </ul>
          </section>

          <section aria-labelledby="security-heading">
            <h2
              id="security-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Security
            </h2>
            <p>
              Passwords are hashed using bcrypt. Authentication uses JWT access tokens (short-lived,
              in-memory only) and refresh tokens (long-lived, HttpOnly cookies — inaccessible to
              JavaScript). Refresh tokens are rotated on every use and invalidated on logout.
            </p>
          </section>

          <section aria-labelledby="google-oauth-heading">
            <h2
              id="google-oauth-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Google Sign-In
            </h2>
            <p>
              If you sign in with Google, we receive your Google account name and email address. We
              do not receive or store your Google password. We do not request access to your Google
              Drive, Gmail, or any other Google services.
            </p>
          </section>

          <section aria-labelledby="your-rights-heading">
            <h2
              id="your-rights-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Your Rights
            </h2>
            <p>
              You can delete your account and all associated data at any time. You own the content
              you create in DailyOS. If you have questions or requests regarding your data, please
              contact us.
            </p>
          </section>

          <section aria-labelledby="changes-heading">
            <h2
              id="changes-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy to reflect changes in our practices or for other
              operational or legal reasons. The "Last updated" date at the top of this page will
              reflect any changes.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-[hsl(var(--border))] py-8" role="contentinfo">
        <div className="mx-auto max-w-3xl px-4">
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center justify-center gap-5 text-sm text-[hsl(var(--foreground-muted))]"
          >
            <Link to="/" className="transition-colors hover:text-[hsl(var(--foreground))]">
              Home
            </Link>
            <Link to="/terms" className="transition-colors hover:text-[hsl(var(--foreground))]">
              Terms of Service
            </Link>
          </nav>
          <p className="mt-4 text-center text-xs text-[hsl(var(--foreground-muted))]">
            &copy; {new Date().getFullYear()} DailyOS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
