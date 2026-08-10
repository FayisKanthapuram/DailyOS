import { cn } from '@/lib/utils';
import type { Priority } from '../types/task.types';

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  NONE: { label: 'None', className: 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground-muted))]' },
  LOW: { label: 'Low', className: 'bg-[hsl(207,90%,92%)] text-[hsl(207,90%,35%)]' },
  MEDIUM: { label: 'Medium', className: 'bg-[hsl(38,92%,88%)] text-[hsl(38,92%,32%)]' },
  HIGH: { label: 'High', className: 'bg-[hsl(0,85%,90%)] text-[hsl(0,75%,40%)]' },
  URGENT: { label: 'Urgent', className: 'bg-[hsl(280,75%,90%)] text-[hsl(280,65%,38%)]' },
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  if (priority === 'NONE') return null;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
