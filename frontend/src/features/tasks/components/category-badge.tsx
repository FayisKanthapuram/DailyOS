import { cn } from '@/lib/utils';
import type { Category } from '../types/task.types';

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        className,
      )}
      style={{
        backgroundColor: `${category.color}22`,
        color: category.color,
        border: `1px solid ${category.color}44`,
      }}
    >
      {category.icon && <span className="text-[10px]">{category.icon}</span>}
      {category.name}
    </span>
  );
}
