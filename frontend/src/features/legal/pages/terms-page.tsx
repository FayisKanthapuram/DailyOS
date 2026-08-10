import { Link } from 'react-router';
import { usePageMeta } from '@/lib/use-page-meta';

export function TermsPage() {
  usePageMeta({
    title: 'Terms of Service — DailyOS',
    description:
      'Terms and conditions for using DailyOS. Acceptable use policy, data ownership, and service limitations.',
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
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--foreground-muted))]">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="prose prose-sm max-w-none space-y-8 text-[hsl(var(--foreground-secondary))]">
          <section aria-labelledby="acceptance-heading">
            <h2
              id="acceptance-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Acceptance of Terms
            </h2>
            <p>
              By creating an account or using DailyOS, you agree to these Terms of Service. If you
              do not agree, please do not use the service. These terms apply to all users of
              DailyOS.
            </p>
          </section>

          <section aria-labelledby="service-heading">
            <h2
              id="service-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              The Service
            </h2>
            <p>
              DailyOS is a personal productivity application for managing tasks, recurring habits,
              and calendar planning. The service is currently provided free of charge. We reserve
              the right to introduce paid plans, change features, or discontinue the service with
              reasonable notice.
            </p>
          </section>

          <section aria-labelledby="your-account-heading">
            <h2
              id="your-account-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Your Account
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>You are responsible for keeping your account credentials secure.</li>
              <li>You must be at least 13 years of age to create an account.</li>
              <li>You may only create one account per person.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
            </ul>
          </section>

          <section aria-labelledby="your-data-heading">
            <h2
              id="your-data-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Your Data
            </h2>
            <p>
              You retain full ownership of the content you create in DailyOS — your tasks, habits,
              categories, and notes. We do not claim any intellectual property rights over your
              data. You may delete your account and all associated data at any time.
            </p>
          </section>

          <section aria-labelledby="acceptable-use-heading">
            <h2
              id="acceptable-use-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Use DailyOS for any unlawful purpose.</li>
              <li>Attempt to gain unauthorized access to other users' accounts or data.</li>
              <li>
                Reverse-engineer, decompile, or attempt to extract the source code of the service.
              </li>
              <li>Use automated tools to scrape or overload the service.</li>
              <li>
                Transmit any malicious code, viruses, or other harmful material through the service.
              </li>
            </ul>
          </section>

          <section aria-labelledby="no-warranty-heading">
            <h2
              id="no-warranty-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              No Warranty
            </h2>
            <p>
              DailyOS is provided "as is" and "as available" without warranties of any kind, express
              or implied. We do not warrant that the service will be uninterrupted, error-free, or
              free of harmful components. Use of the service is at your own risk.
            </p>
          </section>

          <section aria-labelledby="limitation-heading">
            <h2
              id="limitation-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, DailyOS shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including loss of data,
              arising from your use of or inability to use the service.
            </p>
          </section>

          <section aria-labelledby="termination-heading">
            <h2
              id="termination-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Termination
            </h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms. You
              may delete your account at any time. Upon termination, your data will be removed from
              our systems in accordance with our Privacy Policy.
            </p>
          </section>

          <section aria-labelledby="changes-heading">
            <h2
              id="changes-heading"
              className="mb-3 text-lg font-semibold text-[hsl(var(--foreground))]"
            >
              Changes to These Terms
            </h2>
            <p>
              We may revise these Terms of Service from time to time. Continued use of DailyOS after
              changes constitutes acceptance of the updated terms. The "Last updated" date will
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
            <Link to="/privacy" className="transition-colors hover:text-[hsl(var(--foreground))]">
              Privacy Policy
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
