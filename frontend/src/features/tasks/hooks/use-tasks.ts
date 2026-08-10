import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks.api';
import type {
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilters,
  CreateSubtaskPayload,
  UpdateSubtaskPayload,
  ReorderSubtasksPayload,
} from '../types/task.types';

export const TASK_KEYS = {
  all: ['tasks'] as const,
  list: (filters: TaskFilters) => ['tasks', 'list', filters] as const,
  detail: (id: string) => ['tasks', 'detail', id] as const,
};

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: TASK_KEYS.list(filters),
    queryFn: () => tasksApi.list(filters),
  });
}

export function useUnifiedTasks(date?: string) {
  return useQuery({
    queryKey: ['tasks', 'unified', date],
    queryFn: () => tasksApi.getUnified(date),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: TASK_KEYS.detail(id),
    queryFn: () => tasksApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_KEYS.all }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      tasksApi.update(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      qc.invalidateQueries({ queryKey: TASK_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TASK_KEYS.all });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// Subtasks
export function useAddSubtask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubtaskPayload) => tasksApi.addSubtask(taskId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_KEYS.detail(taskId) }),
  });
}

export function useUpdateSubtask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subtaskId, payload }: { subtaskId: string; payload: UpdateSubtaskPayload }) =>
      tasksApi.updateSubtask(taskId, subtaskId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_KEYS.detail(taskId) }),
  });
}

export function useDeleteSubtask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subtaskId: string) => tasksApi.removeSubtask(taskId, subtaskId),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_KEYS.detail(taskId) }),
  });
}

export function useReorderSubtasks(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReorderSubtasksPayload) => tasksApi.reorderSubtasks(taskId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASK_KEYS.detail(taskId) }),
  });
}
