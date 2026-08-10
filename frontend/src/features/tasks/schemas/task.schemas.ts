import { z } from 'zod';

const PRIORITY_OPTIONS = ['NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'] as const;
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

// ─────────────────────────────────────────────
// Daily Task Template
// ─────────────────────────────────────────────

export const createDailyTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000).optional().or(z.literal('')),
  priority: z.enum(PRIORITY_OPTIONS),
  categoryId: z.string().optional(),
  time: z.string().regex(TIME_REGEX, 'Time must be in HH:MM format').optional().or(z.literal('')),
  tagIds: z.array(z.string()).optional(),
  order: z.number().optional(),
});

export type CreateDailyTaskFormValues = z.infer<typeof createDailyTaskSchema>;

export const updateDailyTaskSchema = createDailyTaskSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdateDailyTaskFormValues = z.infer<typeof updateDailyTaskSchema>;

// ─────────────────────────────────────────────
// Normal Task
// ─────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000).optional().or(z.literal('')),
  priority: z.enum(PRIORITY_OPTIONS),
  status: z.enum(STATUS_OPTIONS),
  categoryId: z.string().optional(),
  dueDate: z.string().regex(DATE_REGEX, 'Date must be YYYY-MM-DD').optional().or(z.literal('')),
  dueTime: z.string().regex(TIME_REGEX, 'Time must be HH:MM').optional().or(z.literal('')),
  tagIds: z.array(z.string()).optional(),
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskFormValues = z.infer<typeof updateTaskSchema>;

// ─────────────────────────────────────────────
// Subtask
// ─────────────────────────────────────────────

export const createSubtaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
});

export type CreateSubtaskFormValues = z.infer<typeof createSubtaskSchema>;

// ─────────────────────────────────────────────
// Category
// ─────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  color: z.string().regex(HEX_COLOR_REGEX, 'Must be a valid hex color'),
  icon: z.string().max(50).optional().or(z.literal('')),
});

export type CreateCategoryFormValues = z.infer<typeof createCategorySchema>;
export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategoryFormValues = z.infer<typeof updateCategorySchema>;

// ─────────────────────────────────────────────
// Tag
// ─────────────────────────────────────────────

export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  color: z.string().regex(HEX_COLOR_REGEX, 'Must be a valid hex color'),
});

export type CreateTagFormValues = z.infer<typeof createTagSchema>;
export const updateTagSchema = createTagSchema.partial();
export type UpdateTagFormValues = z.infer<typeof updateTagSchema>;
