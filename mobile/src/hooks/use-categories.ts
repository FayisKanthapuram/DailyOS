import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api/tasks.api';

export const categoryKeys = {
  all: ['categories'] as const,
};

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: () => categoriesApi.getAll(),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}
