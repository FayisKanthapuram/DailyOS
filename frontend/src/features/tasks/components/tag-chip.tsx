import { cn } from '@/lib/utils';
import type { Tag } from '../types/task.types';

interface TagChipProps {
  tag: Tag;
  className?: string;
}

export function TagChip({ tag, className }: TagChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium',
        className,
      )}
      style={{
        backgroundColor: `${tag.color}22`,
        color: tag.color,
        border: `1px solid ${tag.color}44`,
      }}
    >
      {tag.name}
    </span>
  );
}
