import { motion } from 'framer-motion';
import { CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">
          Good evening
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--foreground-secondary))]">
          Here&apos;s your productivity overview for today.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { label: 'Tasks Completed', value: '0', icon: CheckCircle2, color: 'var(--success)' },
          { label: 'Focus Time', value: '0h', icon: Clock, color: 'var(--info)' },
          { label: 'Streak', value: '0 days', icon: TrendingUp, color: 'var(--warning)' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 * index }}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-[hsl(var(--foreground-secondary))]">{stat.label}</span>
              <stat.icon size={18} className={`text-[hsl(${stat.color})]`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-[hsl(var(--foreground))]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Placeholder content */}
      <div className="mt-8 rounded-xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 text-center">
        <p className="text-sm text-[hsl(var(--foreground-muted))]">
          Your tasks and calendar will appear here once implemented.
        </p>
      </div>
    </div>
  );
}
