import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  ArrowRight,
  CheckCircle2,
  CalendarDays,
  Repeat2,
  BarChart3,
  Smartphone,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { usePageMeta } from '@/lib/use-page-meta';
import { analytics } from '@/lib/analytics';

const features = [
  {
    icon: Repeat2,
    title: 'Recurring Habit Engine',
    description:
      'Build routines that stick. Set habits as Daily, Weekly, or Monthly — DailyOS tracks each occurrence and adapts when you skip or complete them.',
    badge: 'Daily · Weekly · Monthly',
  },
  {
    icon: CalendarDays,
    title: 'Visual Calendar Planning',
    description:
      'See your entire schedule at a glance. Month, week, and day views show tasks and recurring habits together so nothing slips through.',
    badge: 'Month · Week · Day',
  },
  {
    icon: CheckCircle2,
    title: 'Smart Task Management',
    description:
      'Create one-off or recurring tasks with priorities, categories, tags, subtasks, and due times. Filter, sort, and focus on what matters today.',
    badge: 'Priority · Tags · Subtasks',
  },
  {
    icon: BarChart3,
    title: 'Progress & Statistics',
    description:
      'Understand your productivity patterns with completion rates, streak tracking, and recurring habit stats across daily, weekly, and monthly views.',
    badge: 'Completion · Streaks',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First Experience',
    description:
      'A fully responsive layout built for every screen. Bottom navigation, swipeable calendar strip, and an installable PWA for your home screen.',
    badge: 'PWA · Installable',
  },
  {
    icon: ShieldCheck,
    title: 'Private & Secure',
    description:
      'Your tasks never leave your account. Passwords are hashed with bcrypt, sessions use HttpOnly cookies, and JWT refresh tokens rotate on every use.',
    badge: 'Auth · Encryption',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create your tasks',
    description:
      'Add one-time tasks or set up recurring habits. Choose from Daily, Weekly, or Monthly recurrence with a single click.',
  },
  {
    number: '02',
    title: 'Plan your calendar',
    description:
      'See everything in month, week, or day view. Drag and drop tasks, navigate dates, and get a clear picture of your schedule.',
  },
  {
    number: '03',
    title: 'Track your progress',
    description:
      'Complete tasks, skip when needed, and watch your completion rates grow. DailyOS handles the streak logic automatically.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' as const },
};

export function LandingPage() {
  usePageMeta({
    title: 'DailyOS — Plan Your Day. Build Better Habits.',
    description:
      'Organize tasks, build recurring daily, weekly, and monthly habits, plan your calendar, and track your productivity. A free task and habit planner.',
    robots: 'index, follow',
  });

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.85)] backdrop-blur-md"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
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

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[hsl(var(--foreground-secondary))] transition-colors hover:text-[hsl(var(--foreground))]"
            >
              Log in
            </Link>
            <Link
              to="/register"
              onClick={() => analytics.track('landing_cta_click', { location: 'navbar' })}
              className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section
          className="mx-auto max-w-6xl px-4 pb-12 pt-20 text-center md:pb-16 md:pt-28"
          aria-labelledby="hero-heading"
        >
          <motion.div {...fadeUp}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background-secondary))] px-4 py-1.5 text-xs font-medium text-[hsl(var(--foreground-secondary))]">
              <Repeat2 size={13} className="text-[hsl(var(--primary))]" aria-hidden="true" />
              Daily · Weekly · Monthly recurring tasks
            </div>

            <h1
              id="hero-heading"
              className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] md:text-6xl"
            >
              Plan your day.{' '}
              <span className="text-[hsl(var(--primary))]">Build better habits.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[hsl(var(--foreground-secondary))]">
              DailyOS combines task management, recurring habit tracking, and a visual calendar into
              one fast, private, and beautifully designed workspace.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                onClick={() => analytics.track('landing_cta_click', { location: 'hero_primary' })}
                className="group inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-7 py-3.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-all hover:opacity-90 hover:shadow-lg"
              >
                Start for free
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-7 py-3.5 text-sm font-semibold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--background-secondary))]"
              >
                Sign in
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[hsl(var(--foreground-muted))]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[hsl(var(--primary))]" aria-hidden="true" />
                Free to use
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[hsl(var(--primary))]" aria-hidden="true" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[hsl(var(--primary))]" aria-hidden="true" />
                Installable on any device
              </span>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-16" aria-labelledby="features-heading">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-12 text-center"
          >
            <h2
              id="features-heading"
              className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] md:text-3xl"
            >
              Everything you need to stay on track
            </h2>
            <p className="mt-3 text-[hsl(var(--foreground-secondary))]">
              Built around how you actually work — not how productivity apps think you work.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.06 * index }}
                className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)]">
                  <feature.icon
                    size={20}
                    className="text-[hsl(var(--primary))]"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-[hsl(var(--foreground))]">
                  {feature.title}
                </h3>
                <p className="mb-3 text-sm leading-relaxed text-[hsl(var(--foreground-secondary))]">
                  {feature.description}
                </p>
                <span className="inline-block rounded-full bg-[hsl(var(--primary)/0.08)] px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--primary))]">
                  {feature.badge}
                </span>
              </motion.article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background-secondary))] py-16"
          aria-labelledby="how-it-works-heading"
        >
          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mb-12 text-center"
            >
              <h2
                id="how-it-works-heading"
                className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] md:text-3xl"
              >
                How DailyOS works
              </h2>
              <p className="mt-3 text-[hsl(var(--foreground-secondary))]">
                Get started in minutes. No complicated setup.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="flex flex-col items-start"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-lg font-bold text-[hsl(var(--primary-foreground))]">
                    {step.number}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-[hsl(var(--foreground))]">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[hsl(var(--foreground-secondary))]">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-20 text-center" aria-labelledby="cta-heading">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2
              id="cta-heading"
              className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] md:text-3xl"
            >
              Ready to take control of your day?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[hsl(var(--foreground-secondary))]">
              Start building better habits today. DailyOS is free, fast, and works on any device.
            </p>
            <Link
              to="/register"
              onClick={() => analytics.track('landing_cta_click', { location: 'bottom_cta' })}
              className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-8 py-3.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-all hover:opacity-90 hover:shadow-lg"
            >
              Get started for free
              <ChevronRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] py-10" role="contentinfo">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link to="/" className="flex items-center gap-2" aria-label="DailyOS home">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[hsl(var(--primary))]">
                <span
                  className="text-xs font-bold text-[hsl(var(--primary-foreground))]"
                  aria-hidden="true"
                >
                  D
                </span>
              </div>
              <span className="text-sm font-semibold text-[hsl(var(--foreground))]">DailyOS</span>
            </Link>

            <nav
              aria-label="Footer navigation"
              className="flex items-center gap-5 text-sm text-[hsl(var(--foreground-muted))]"
            >
              <Link to="/privacy" className="transition-colors hover:text-[hsl(var(--foreground))]">
                Privacy Policy
              </Link>
              <Link to="/terms" className="transition-colors hover:text-[hsl(var(--foreground))]">
                Terms of Service
              </Link>
            </nav>

            <p className="text-xs text-[hsl(var(--foreground-muted))]">
              &copy; {new Date().getFullYear()} DailyOS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
