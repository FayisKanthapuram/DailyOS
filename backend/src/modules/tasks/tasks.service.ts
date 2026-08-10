import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CategoriesService } from '../categories/categories.service.js';
import { TagsService } from '../tags/tags.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { CreateSubtaskDto } from './dto/create-subtask.dto.js';
import { UpdateSubtaskDto } from './dto/update-subtask.dto.js';
import { ReorderSubtasksDto } from './dto/reorder-subtasks.dto.js';
import { TaskFiltersDto } from './dto/task-filters.dto.js';
import { getTodayInTimezone } from '../../common/utils/timezone.js';
import { Prisma, TaskStatus } from '@prisma/client';
import { DateTime } from 'luxon';

import { DailyTasksService } from './daily-tasks.service.js';

export interface UnifiedTaskItem {
  id: string;
  source: 'NORMAL' | 'DAILY';
  title: string;
  description?: string | null;
  status: string;
  completed: boolean;
  skipped: boolean;
  priority: string;
  frequency?: string;
  category?: Record<string, unknown> | null;
  tags: Record<string, unknown>[];
  dueDate?: string | null;
  dueTime?: string | null;
  subtasks?: Record<string, unknown>[];
  templateId?: string | null;
  instanceId?: string | null;
  isFutureProjection?: boolean;
  isOverdue?: boolean;
  originalTask?: Record<string, unknown>;
  originalInstance?: Record<string, unknown>;
  originalTemplate?: Record<string, unknown>;
}

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
    private readonly dailyTasksService: DailyTasksService,
  ) {}

  private async getUserTimezone(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return user.timezone;
  }

  async findAll(userId: string, filters: TaskFiltersDto) {
    const limit = Math.min(filters.limit ?? 50, 200);
    const userTimezone = await this.getUserTimezone(userId);
    const today = getTodayInTimezone(userTimezone);
    const currentTime = DateTime.now().setZone(userTimezone).toFormat('HH:mm');

    const where: Prisma.TaskWhereInput = {
      userId,
      ...(filters.status && { status: filters.status }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.tagId && { tags: { some: { tagId: filters.tagId } } }),
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters.overdue && {
        status: { notIn: [TaskStatus.COMPLETED, TaskStatus.ARCHIVED] },
        OR: [{ dueDate: { lt: today } }, { dueDate: today, dueTime: { lt: currentTime } }],
      }),
    };

    return this.prisma.task.findMany({
      where,
      include: {
        category: true,
        tags: { include: { tag: true } },
        subtasks: { orderBy: { order: 'asc' } },
      },
      orderBy: [{ createdAt: 'desc' }],
      take: limit,
      ...(filters.cursor && { cursor: { id: filters.cursor }, skip: 1 }),
    });
  }

  async create(userId: string, dto: CreateTaskDto) {
    if (dto.categoryId) {
      await this.categoriesService.validateOwnership(userId, dto.categoryId);
    }
    if (dto.tagIds?.length) {
      await this.tagsService.validateOwnership(userId, dto.tagIds);
    }

    return this.prisma.task.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 'NONE',
        status: dto.status ?? 'TODO',
        categoryId: dto.categoryId,
        dueDate: dto.dueDate,
        dueTime: dto.dueTime,
        tags: dto.tagIds?.length ? { create: dto.tagIds.map((tagId) => ({ tagId })) } : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        subtasks: { orderBy: { order: 'asc' } },
      },
    });
  }

  async findOne(userId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
      include: {
        category: true,
        tags: { include: { tag: true } },
        subtasks: { orderBy: { order: 'asc' } },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new NotFoundException('Task not found');

    if (dto.categoryId) {
      await this.categoriesService.validateOwnership(userId, dto.categoryId);
    }
    if (dto.tagIds) {
      await this.tagsService.validateOwnership(userId, dto.tagIds);
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.tagIds !== undefined) {
        await tx.taskTag.deleteMany({ where: { taskId } });
        if (dto.tagIds.length > 0) {
          await tx.taskTag.createMany({
            data: dto.tagIds.map((tagId) => ({ taskId, tagId })),
          });
        }
      }

      const isCompleting =
        dto.status === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED;
      const isUncompleting =
        dto.status && dto.status !== TaskStatus.COMPLETED && task.status === TaskStatus.COMPLETED;

      return tx.task.update({
        where: { id: taskId },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.priority !== undefined && { priority: dto.priority }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.dueDate !== undefined && { dueDate: dto.dueDate }),
          ...(dto.dueTime !== undefined && { dueTime: dto.dueTime }),
          ...(isCompleting && { completedAt: new Date() }),
          ...(isUncompleting && { completedAt: null }),
        },
        include: {
          category: true,
          tags: { include: { tag: true } },
          subtasks: { orderBy: { order: 'asc' } },
        },
      });
    });
  }

  async remove(userId: string, taskId: string): Promise<void> {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new NotFoundException('Task not found');
    await this.prisma.task.delete({ where: { id: taskId } });
  }

  // ── Subtasks ──────────────────────────────────────────────────────────────

  private async findTaskAndVerifyOwnership(userId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async addSubtask(userId: string, taskId: string, dto: CreateSubtaskDto) {
    await this.findTaskAndVerifyOwnership(userId, taskId);

    return this.prisma.subtask.create({
      data: {
        taskId,
        title: dto.title,
        order: dto.order ?? 0,
      },
    });
  }

  async updateSubtask(userId: string, taskId: string, subtaskId: string, dto: UpdateSubtaskDto) {
    await this.findTaskAndVerifyOwnership(userId, taskId);

    const subtask = await this.prisma.subtask.findFirst({
      where: { id: subtaskId, taskId },
    });
    if (!subtask) throw new NotFoundException('Subtask not found');

    return this.prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.isCompleted !== undefined && { isCompleted: dto.isCompleted }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  async removeSubtask(userId: string, taskId: string, subtaskId: string): Promise<void> {
    await this.findTaskAndVerifyOwnership(userId, taskId);

    const subtask = await this.prisma.subtask.findFirst({
      where: { id: subtaskId, taskId },
    });
    if (!subtask) throw new NotFoundException('Subtask not found');

    await this.prisma.subtask.delete({ where: { id: subtaskId } });
  }

  async reorderSubtasks(userId: string, taskId: string, dto: ReorderSubtasksDto) {
    await this.findTaskAndVerifyOwnership(userId, taskId);

    await this.prisma.$transaction(
      dto.subtasks.map((s) =>
        this.prisma.subtask.updateMany({
          where: { id: s.id, taskId },
          data: { order: s.order },
        }),
      ),
    );
  }

  async getUnifiedTasksForDate(userId: string, dateOverride?: string) {
    const userTimezone = await this.getUserTimezone(userId);
    const today = getTodayInTimezone(userTimezone);
    const date = dateOverride ?? today;

    // 1. Fetch normal tasks due on `date`
    const normalTasks = await this.prisma.task.findMany({
      where: {
        userId,
        OR: [
          { dueDate: date },
          ...(date === today
            ? [
                {
                  dueDate: { lt: today },
                  status: { notIn: [TaskStatus.COMPLETED, TaskStatus.ARCHIVED] },
                },
              ]
            : []),
        ],
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        subtasks: { orderBy: { order: 'asc' } },
      },
      orderBy: [{ priority: 'desc' }, { dueTime: 'asc' }],
    });

    // 2. Fetch daily instances & exceptions
    let dailyInstances: Awaited<ReturnType<DailyTasksService['getTodayInstances']>> = [];
    if (date <= today) {
      dailyInstances = await this.dailyTasksService.getTodayInstances(userId, date);
    }

    const exceptions = await this.prisma.dailyTaskException.findMany({
      where: { userId, date },
    });
    const exceptionMap = new Map(exceptions.map((e) => [e.templateId, e]));

    // 3. Fetch future templates if date > today
    let futureTemplates: Awaited<ReturnType<DailyTasksService['findAllTemplates']>> = [];
    if (date > today) {
      futureTemplates = await this.dailyTasksService.findAllTemplates(userId, false);
    }

    const currentTime = DateTime.now().setZone(userTimezone).toFormat('HH:mm');

    // 4. Map to UnifiedTask structures
    const unifiedTasks: UnifiedTaskItem[] = [];

    // Map Normal Tasks
    for (const t of normalTasks) {
      const isOverdue =
        t.status !== 'COMPLETED' &&
        t.status !== 'ARCHIVED' &&
        (t.dueDate! < today || (t.dueDate === today && !!t.dueTime && t.dueTime < currentTime));

      unifiedTasks.push({
        id: `task-${t.id}`,
        source: 'NORMAL',
        title: t.title,
        description: t.description,
        status: t.status,
        completed: t.status === 'COMPLETED',
        skipped: false,
        priority: t.priority,
        category: t.category,
        tags: t.tags,
        dueDate: t.dueDate,
        dueTime: t.dueTime,
        subtasks: t.subtasks,
        isOverdue,
        originalTask: t,
      });
    }

    const dateDt = DateTime.fromISO(date, { zone: userTimezone });
    const weekStart = dateDt.startOf('week').toISODate()!;
    const monthStart = dateDt.startOf('month').toISODate()!;
    const monthEnd = dateDt.endOf('month').toISODate()!;

    // Fetch instances and exceptions in week/month for template period checks
    const [periodInstances, periodExceptions] = await Promise.all([
      this.prisma.dailyTaskInstance.findMany({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
      }),
      this.prisma.dailyTaskException.findMany({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
      }),
    ]);

    // Map Past/Today Daily Instances
    for (const inst of dailyInstances) {
      const freq = inst.template.frequency || 'DAILY';

      if (freq === 'WEEKLY') {
        const earlierCompletedInWeek = periodInstances.some(
          (i) =>
            i.templateId === inst.templateId &&
            i.date >= weekStart &&
            i.date < date &&
            i.isCompleted,
        );
        const earlierSkippedInWeek = periodExceptions.some(
          (e) =>
            e.templateId === inst.templateId &&
            e.date >= weekStart &&
            e.date < date &&
            e.type === 'SKIP',
        );
        if (earlierCompletedInWeek || earlierSkippedInWeek) continue;
      } else if (freq === 'MONTHLY') {
        const earlierCompletedInMonth = periodInstances.some(
          (i) =>
            i.templateId === inst.templateId &&
            i.date >= monthStart &&
            i.date < date &&
            i.isCompleted,
        );
        const earlierSkippedInMonth = periodExceptions.some(
          (e) =>
            e.templateId === inst.templateId &&
            e.date >= monthStart &&
            e.date < date &&
            e.type === 'SKIP',
        );
        if (earlierCompletedInMonth || earlierSkippedInMonth) continue;
      }

      const exception = exceptionMap.get(inst.templateId);
      const isSkipped = exception?.type === 'SKIP';

      unifiedTasks.push({
        id: `inst-${inst.id}`,
        source: 'DAILY',
        title: inst.snapshotTitle,
        description: inst.template.description,
        status: inst.isCompleted ? 'COMPLETED' : 'TODO',
        completed: inst.isCompleted,
        skipped: isSkipped,
        priority: inst.template.priority,
        frequency: freq,
        category: inst.template.category,
        tags: inst.template.tags,
        dueDate: inst.date,
        dueTime: inst.template.time ?? null,
        templateId: inst.templateId,
        instanceId: inst.id,
        isFutureProjection: false,
        originalInstance: inst,
      });
    }

    // Map Future Templates (date > today)
    for (const template of futureTemplates) {
      const freq = template.frequency || 'DAILY';
      const templateCreatedDate =
        DateTime.fromISO(template.createdAt.toISOString(), { zone: userTimezone }).toISODate() ||
        '';
      const exception = exceptionMap.get(template.id);

      if (freq === 'WEEKLY') {
        const earlierCompletedInWeek = periodInstances.some(
          (i) =>
            i.templateId === template.id && i.date >= weekStart && i.date < date && i.isCompleted,
        );
        const earlierSkippedInWeek = periodExceptions.some(
          (e) =>
            e.templateId === template.id &&
            e.date >= weekStart &&
            e.date < date &&
            e.type === 'SKIP',
        );
        if (earlierCompletedInWeek || earlierSkippedInWeek) continue;
      } else if (freq === 'MONTHLY') {
        const earlierCompletedInMonth = periodInstances.some(
          (i) =>
            i.templateId === template.id && i.date >= monthStart && i.date < date && i.isCompleted,
        );
        const earlierSkippedInMonth = periodExceptions.some(
          (e) =>
            e.templateId === template.id &&
            e.date >= monthStart &&
            e.date < date &&
            e.type === 'SKIP',
        );
        if (earlierCompletedInMonth || earlierSkippedInMonth) continue;
      }

      if (date >= templateCreatedDate && exception?.type !== 'SKIP') {
        unifiedTasks.push({
          id: `proj-${template.id}-${date}`,
          source: 'DAILY',
          title: template.title,
          description: template.description,
          status: 'TODO',
          completed: false,
          skipped: false,
          priority: template.priority,
          frequency: freq,
          category: template.category,
          tags: template.tags,
          dueDate: date,
          dueTime: template.time ?? null,
          templateId: template.id,
          isFutureProjection: true,
          originalTemplate: template,
        });
      }
    }

    // Sort: Overdue items first, then by priority (URGENT > HIGH > MEDIUM > LOW > NONE), then by dueTime
    const priorityWeight: Record<string, number> = {
      URGENT: 5,
      HIGH: 4,
      MEDIUM: 3,
      LOW: 2,
      NONE: 1,
    };

    unifiedTasks.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;

      const pA = priorityWeight[a.priority] || 0;
      const pB = priorityWeight[b.priority] || 0;
      if (pA !== pB) return pB - pA;

      if (a.dueTime && !b.dueTime) return -1;
      if (!a.dueTime && b.dueTime) return 1;
      if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
      return 0;
    });

    // Summary statistics
    const activeTasks = unifiedTasks.filter((t) => !t.skipped && !t.isFutureProjection);
    const completedCount = activeTasks.filter((t) => t.completed).length;
    const skippedCount = unifiedTasks.filter((t) => t.skipped).length;
    const overdueCount = unifiedTasks.filter((t) => t.isOverdue).length;

    return {
      date,
      today,
      userTimezone,
      tasks: unifiedTasks,
      stats: {
        total: activeTasks.length,
        completed: completedCount,
        skipped: skippedCount,
        overdue: overdueCount,
      },
    };
  }
}
