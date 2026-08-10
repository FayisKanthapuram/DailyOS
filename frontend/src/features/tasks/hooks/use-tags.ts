import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagsApi } from '../api/tags.api';
import type { CreateTagPayload, UpdateTagPayload } from '../types/task.types';

export const TAGS_KEY = ['tags'] as const;

export function useTags() {
  return useQuery({
    queryKey: TAGS_KEY,
    queryFn: () => tagsApi.list(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTagPayload) => tagsApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: TAGS_KEY }),
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTagPayload }) =>
      tagsApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: TAGS_KEY }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tagsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: TAGS_KEY }),
  });
}
