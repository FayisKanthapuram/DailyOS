import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyTasksApi } from '../api/daily-tasks.api';
import type {
  CreateDailyTaskPayload,
  UpdateDailyTaskPayload,
  UpdateDailyInstancePayload,
} from '../types/task.types';

export const DAILY_TASK_KEYS = {
  templates: ['daily-tasks', 'templates'] as const,
  today: (date?: string) => ['daily-tasks', 'today', date ?? 'default'] as const,
  history: (templateId: string) => ['daily-tasks', 'history', templateId] as const,
};

export function useDailyTaskTemplates() {
  return useQuery({
    queryKey: DAILY_TASK_KEYS.templates,
    queryFn: () => dailyTasksApi.listTemplates(),
  });
}

export function useTodayInstances(date?: string) {
  return useQuery({
    queryKey: DAILY_TASK_KEYS.today(date),
    queryFn: () => dailyTasksApi.getToday(date),
    staleTime: 2 * 60 * 1000, // 2 min — today's view is fairly fresh
  });
}

export function useDailyTaskHistory(templateId: string, limit = 30) {
  return useQuery({
    queryKey: DAILY_TASK_KEYS.history(templateId),
    queryFn: () => dailyTasksApi.getHistory(templateId, limit),
    enabled: !!templateId,
  });
}

export function useCreateDailyTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDailyTaskPayload) => dailyTasksApi.createTemplate(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['calendar'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateDailyTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDailyTaskPayload }) =>
      dailyTasksApi.updateTemplate(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['calendar'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeactivateDailyTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dailyTasksApi.deactivateTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['calendar'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteDailyTaskPermanently() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dailyTasksApi.deleteTemplatePermanently(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily-tasks'] });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['calendar'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUpdateDailyInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      instanceId,
      payload,
    }: {
      instanceId: string;
      payload: UpdateDailyInstancePayload;
    }) => dailyTasksApi.updateInstance(instanceId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['daily-tasks', 'today'] });
      qc.invalidateQueries({ queryKey: ['calendar'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useCreateDailyException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, date, type }: { templateId: string; date: string; type?: 'SKIP' }) =>
      dailyTasksApi.createException(templateId, date, type),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['calendar'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useDeleteDailyException() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, date }: { templateId: string; date: string }) =>
      dailyTasksApi.deleteException(templateId, date),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['calendar'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
