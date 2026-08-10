import { api } from '@/lib/api';
import type { Tag, CreateTagPayload, UpdateTagPayload } from '../types/task.types';

export const tagsApi = {
  async list(): Promise<Tag[]> {
    const { data } = await api.get<Tag[]>('/tags');
    return data;
  },

  async create(payload: CreateTagPayload): Promise<Tag> {
    const { data } = await api.post<Tag>('/tags', payload);
    return data;
  },

  async update(id: string, payload: UpdateTagPayload): Promise<Tag> {
    const { data } = await api.patch<Tag>(`/tags/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/tags/${id}`);
  },
};
