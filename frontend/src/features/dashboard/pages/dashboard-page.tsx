import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import { useTodayStats, useRecurringStats } from '@/features/tasks/hooks/use-stats';
import { Link } from 'react-router';
import { usePageMeta } from '@/lib/use-page-meta';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage() {
  usePageMeta({ title: 'Dashboard — DailyOS', robots: 'noindex, nofollow' });
  const { data: stats, isLoading } = useTodayStats();

  const statCards = [
    {
      label: 'Daily Tasks',
      value: isLoading
        ? '—'
        : stats
          ? `${stats.dailyTasks.completed}/${stats.dailyTasks.total}`
          : '0/0',
      subtext:
        !isLoading && stats && stats.dailyTasks.total > 0
          ? `${Math.round((stats.dailyTasks.completed / stats.dailyTasks.total) * 100)}% complete`
          : 'No tasks today',
      icon: CheckCircle2,
      color: 'var(--success)',
      href: '/tasks',
    },
    {
      label: 'Overdue Tasks',
      value: isLoading ? '—' : stats ? String(stats.overdueTasksCount) : '0',
      subtext: stats?.overdueTasksCount === 0 ? 'All caught up!' : 'Needs attention',
      icon: AlertCircle,
      color: stats?.overdueTasksCount ? 'var(--destructive)' : 'var(--success)',
      href: '/tasks',
    },
    {
      label: 'Current Streak',
      value: isLoading ? '—' : stats ? `${stats.streak}d` : '0d',
      subtext: stats?.streak === 0 ? 'Start a streak today' : `${stats?.streak} day streak 🔥`,
      icon: TrendingUp,
      color: 'var(--warning)',
      href: '/tasks',
    },
  ];

  const [recurringPeriod, setRecurringPeriod] = useState<'today' | 'week' | 'month' | '30days'>(
    'today',
  );
  const { data: recStats, isLoading: isRecLoading } = useRecurringStats(recurringPeriod);

  return (
    <div className="mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          {getGreeting()}
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--foreground-secondary))]">
          {stats
            ? `Today is ${new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`
            : 'Loading your overview...'}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
          >
            <Link
              to={stat.href}
              className="block rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all duration-200 hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-[hsl(var(--foreground-secondary))]">
                  {stat.label}
                </span>
                <stat.icon
                  size={18}
                  className={`text-[hsl(${stat.color})]`}
                  style={{ color: `hsl(${stat.color})` }}
                />
              </div>
              <p className="mt-2 text-2xl font-bold text-[hsl(var(--foreground))]">{stat.value}</p>
              <p className="mt-1 text-xs text-[hsl(var(--foreground-muted))]">{stat.subtext}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recurring Task Statistics Section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mt-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-[hsl(var(--foreground))]">
              Recurring Task Statistics
            </h2>
            <p className="text-xs text-[hsl(var(--foreground-muted))]">
              Occurrences breakdown by recurrence frequency
            </p>
          </div>

          <div className="flex rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background-secondary))] p-1">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: '30days', label: 'Last 30 Days' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setRecurringPeriod(p.id as 'today' | 'week' | 'month' | '30days')}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  recurringPeriod === p.id
                    ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-xs'
                    : 'text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { key: 'daily', title: 'Daily Habits', data: recStats?.daily },
            { key: 'weekly', title: 'Weekly Habits', data: recStats?.weekly },
            { key: 'monthly', title: 'Monthly Habits', data: recStats?.monthly },
          ].map((item) => (
            <div
              key={item.key}
              className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[hsl(var(--foreground-secondary))] uppercase tracking-wider">
                  {item.title}
                </span>
                <span className="text-xs font-bold text-[hsl(var(--primary))]">
                  {isRecLoading ? '—' : `${item.data?.completionRate ?? 0}%`}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center border-t border-[hsl(var(--border))] pt-3">
                <div>
                  <p className="text-xs text-[hsl(var(--foreground-muted))]">Done</p>
                  <p className="text-base font-semibold text-[hsl(var(--foreground))]">
                    {isRecLoading ? '—' : (item.data?.completed ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--foreground-muted))]">Skipped</p>
                  <p className="text-base font-semibold text-[hsl(var(--foreground-muted))]">
                    {isRecLoading ? '—' : (item.data?.skipped ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[hsl(var(--foreground-muted))]">Pending</p>
                  <p className="text-base font-semibold text-[hsl(var(--warning))]">
                    {isRecLoading ? '—' : (item.data?.pending ?? 0)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="mt-6"
      >
        <h2 className="mb-3 text-sm font-semibold text-[hsl(var(--foreground-secondary))]">
          Quick access
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Link
            to="/tasks"
            className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-all duration-200 hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary)/0.1)]">
              <CheckCircle2 size={20} className="text-[hsl(var(--primary))]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Today's Tasks</p>
              <p className="text-xs text-[hsl(var(--foreground-muted))]">
                {isLoading
                  ? 'Loading...'
                  : stats
                    ? `${stats.dailyTasks.completed} of ${stats.dailyTasks.total} daily tasks done`
                    : 'View and manage your tasks'}
              </p>
            </div>
          </Link>

          <Link
            to="/tasks"
            className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-all duration-200 hover:border-[hsl(var(--primary)/0.3)] hover:shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--warning)/0.1)]">
              <TrendingUp size={20} className="text-[hsl(var(--warning))]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">Streak Tracker</p>
              <p className="text-xs text-[hsl(var(--foreground-muted))]">
                {isLoading
                  ? 'Loading...'
                  : stats?.streak
                    ? `🔥 ${stats.streak} day streak`
                    : 'Start your streak today'}
              </p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
