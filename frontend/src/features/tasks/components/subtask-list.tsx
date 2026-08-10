'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateSubtask, useDeleteSubtask, useAddSubtask } from '../hooks/use-tasks';
import type { Subtask } from '../types/task.types';

interface SubtaskListProps {
  taskId: string;
  subtasks: Subtask[];
}

export function SubtaskList({ taskId, subtasks }: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const updateSubtask = useUpdateSubtask(taskId);
  const deleteSubtask = useDeleteSubtask(taskId);
  const addSubtask = useAddSubtask(taskId);

  const handleToggle = (subtaskId: string, current: boolean) => {
    updateSubtask.mutate({ subtaskId, payload: { isCompleted: !current } });
  };

  const handleDelete = (subtaskId: string) => {
    deleteSubtask.mutate(subtaskId);
  };

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;
    await addSubtask.mutateAsync({
      title,
      order: subtasks.length,
    });
    setNewTitle('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-1.5 rounded-lg bg-[hsl(var(--background-secondary))] p-2.5">
      {subtasks.map((subtask) => (
        <div key={subtask.id} className="group flex items-center gap-2">
          <button
            onClick={() => handleToggle(subtask.id, subtask.isCompleted)}
            className={cn(
              'flex-shrink-0 transition-colors',
              subtask.isCompleted
                ? 'text-[hsl(var(--primary))]'
                : 'text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--primary))]',
            )}
          >
            {subtask.isCompleted ? <CheckCircle2 size={15} /> : <Circle size={15} />}
          </button>
          <span
            className={cn(
              'flex-1 text-xs',
              subtask.isCompleted
                ? 'text-[hsl(var(--foreground-muted))] line-through'
                : 'text-[hsl(var(--foreground-secondary))]',
            )}
          >
            {subtask.title}
          </span>
          <button
            onClick={() => handleDelete(subtask.id)}
            className="flex-shrink-0 text-[hsl(var(--foreground-muted))] opacity-0 transition-all group-hover:opacity-100 hover:text-[hsl(var(--destructive))]"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}

      {/* Add subtask */}
      {isAdding ? (
        <div className="flex items-center gap-2 pt-1">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') {
                setIsAdding(false);
                setNewTitle('');
              }
            }}
            placeholder="Subtask title..."
            className="flex-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1 text-xs text-[hsl(var(--foreground))] placeholder-[hsl(var(--foreground-muted))] outline-none focus:border-[hsl(var(--primary))]"
          />
          <button
            onClick={handleAdd}
            disabled={!newTitle.trim() || addSubtask.isPending}
            className="rounded bg-[hsl(var(--primary))] px-2 py-1 text-xs font-medium text-[hsl(var(--primary-foreground))] disabled:opacity-50"
          >
            Add
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 rounded px-1 py-0.5 text-xs text-[hsl(var(--foreground-muted))] transition-colors hover:text-[hsl(var(--primary))]"
        >
          <Plus size={12} />
          Add subtask
        </button>
      )}
    </div>
  );
}
