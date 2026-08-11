import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks.api';
import type {
  UnifiedTaskItem,
  CreateNormalTaskDto,
  UpdateNormalTaskDto,
  CreateRecurringTaskDto,
  UpdateRecurringTaskDto,
} from '../types/task.types';

// ── Query Keys ─────────────────────────────────────────────────────────────────

export const taskKeys = {
  all: ['tasks'] as const,
  unified: (date: string) => ['tasks', 'unified', date] as const,
  templates: () => ['tasks', 'daily', 'templates'] as const,
};

// ── Unified Tasks Query ────────────────────────────────────────────────────────

export function useUnifiedTasks(date: string) {
  return useQuery({
    queryKey: taskKeys.unified(date),
    queryFn: () => tasksApi.getUnified(date),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

// ── Normal Task Mutations ──────────────────────────────────────────────────────

export function useCreateTask(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateNormalTaskDto) => tasksApi.createTask(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.unified(date) });
    },
  });
}

export function useUpdateTask(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, dto }: { taskId: string; dto: UpdateNormalTaskDto }) =>
      tasksApi.updateTask(taskId, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.unified(date) });
    },
  });
}

export function useCompleteTask(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskItem }: { taskItem: UnifiedTaskItem }) => {
      // Normal task: toggle status
      const rawId = taskItem.id.replace('task-', '');
      const newStatus = taskItem.completed ? 'TODO' : 'COMPLETED';
      return tasksApi.updateTask(rawId, { status: newStatus as 'TODO' | 'COMPLETED' });
    },
    onMutate: async ({ taskItem }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: taskKeys.unified(date) });
      const previous = queryClient.getQueryData(taskKeys.unified(date));
      queryClient.setQueryData(taskKeys.unified(date), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((t: UnifiedTaskItem) =>
            t.id === taskItem.id
              ? { ...t, completed: !t.completed, status: t.completed ? 'TODO' : 'COMPLETED' }
              : t,
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(taskKeys.unified(date), ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.unified(date) });
    },
  });
}

export function useCompleteInstance(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskItem }: { taskItem: UnifiedTaskItem }) => {
      if (!taskItem.instanceId) throw new Error('No instanceId on this task');
      return tasksApi.updateInstance(taskItem.instanceId, !taskItem.completed);
    },
    onMutate: async ({ taskItem }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.unified(date) });
      const previous = queryClient.getQueryData(taskKeys.unified(date));
      queryClient.setQueryData(taskKeys.unified(date), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((t: UnifiedTaskItem) =>
            t.id === taskItem.id
              ? { ...t, completed: !t.completed, status: t.completed ? 'TODO' : 'COMPLETED' }
              : t,
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(taskKeys.unified(date), ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.unified(date) });
    },
  });
}

export function useDeleteTask(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => tasksApi.deleteTask(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.unified(date) });
    },
  });
}

// ── Skip / Undo Skip Mutations ─────────────────────────────────────────────────

export function useSkipOccurrence(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId }: { templateId: string }) =>
      tasksApi.skipOccurrence(templateId, date),
    onMutate: async ({ templateId }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.unified(date) });
      const previous = queryClient.getQueryData(taskKeys.unified(date));
      queryClient.setQueryData(taskKeys.unified(date), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((t: UnifiedTaskItem) =>
            t.templateId === templateId ? { ...t, skipped: true } : t,
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(taskKeys.unified(date), ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.unified(date) });
    },
  });
}

export function useUndoSkip(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId }: { templateId: string }) =>
      tasksApi.undoSkip(templateId, date),
    onMutate: async ({ templateId }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.unified(date) });
      const previous = queryClient.getQueryData(taskKeys.unified(date));
      queryClient.setQueryData(taskKeys.unified(date), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((t: UnifiedTaskItem) =>
            t.templateId === templateId ? { ...t, skipped: false } : t,
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(taskKeys.unified(date), ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.unified(date) });
    },
  });
}

// ── Recurring Template Mutations ──────────────────────────────────────────────

export function useCreateTemplate(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateRecurringTaskDto) => tasksApi.createTemplate(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.unified(date) });
      void queryClient.invalidateQueries({ queryKey: taskKeys.templates() });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, dto }: { templateId: string; dto: UpdateRecurringTaskDto }) =>
      tasksApi.updateTemplate(templateId, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useDeactivateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => tasksApi.deactivateTemplate(templateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useDeleteTemplatePermanently() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => tasksApi.deleteTemplatePermanently(templateId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

// ── Templates List Query ───────────────────────────────────────────────────────

export function useTemplates(includeInactive = true) {
  return useQuery({
    queryKey: taskKeys.templates(),
    queryFn: () => tasksApi.getTemplates(includeInactive),
    staleTime: 60_000,
  });
}
