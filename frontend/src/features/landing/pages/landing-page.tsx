import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowRight, CheckCircle2, Zap, Shield, Smartphone } from 'lucide-react';

const features = [
  {
    icon: CheckCircle2,
    title: 'Smart Task Management',
    description: 'Organize daily and long-term tasks with intelligent prioritization.',
  },
  {
    icon: Zap,
    title: 'Focus & Productivity',
    description: 'Built-in Pomodoro timer and focus modes to maximize deep work.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and never shared. Privacy by design.',
  },
  {
    icon: Smartphone,
    title: 'Works Everywhere',
    description: 'Seamless experience across desktop, tablet, and mobile.',
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
              <span className="text-sm font-bold text-[hsl(var(--primary-foreground))]">D</span>
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
              className="rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-colors hover:opacity-90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-24 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background-secondary))] px-4 py-1.5 text-sm text-[hsl(var(--foreground-secondary))]">
            <Zap size={14} className="text-[hsl(var(--primary))]" />
            Your personal productivity operating system
          </div>

          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-[hsl(var(--foreground))] md:text-6xl">
            Organize your life,{' '}
            <span className="text-[hsl(var(--primary))]">one day at a time</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-[hsl(var(--foreground-secondary))]">
            DailyOS brings together tasks, calendar, focus tools, and smart reminders into one
            beautiful, fast, and private workspace.
          </p>

          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-all hover:opacity-90"
            >
              Start for free
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-6 py-3 text-sm font-semibold text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--background-secondary))]"
            >
              Log in
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index, ease: 'easeOut' }}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)]">
                <feature.icon size={20} className="text-[hsl(var(--primary))]" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-[hsl(var(--foreground))]">
                {feature.title}
              </h3>
              <p className="text-sm text-[hsl(var(--foreground-secondary))]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] py-8 text-center text-sm text-[hsl(var(--foreground-muted))]">
        <p>&copy; {new Date().getFullYear()} DailyOS. All rights reserved.</p>
      </footer>
    </div>
  );
}
