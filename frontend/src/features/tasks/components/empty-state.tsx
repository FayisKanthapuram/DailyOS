import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] px-6 py-14 text-center',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--background-secondary))] text-[hsl(var(--foreground-muted))]">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-[hsl(var(--foreground))]">{title}</h3>
      <p className="mt-1.5 max-w-xs text-sm text-[hsl(var(--foreground-muted))]">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
