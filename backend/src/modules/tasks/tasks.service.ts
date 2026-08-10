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

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
  ) {}

  private async getUserTimezone(userId: string): Promise<string> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return user.timezone;
  }

  async findAll(userId: string, filters: TaskFiltersDto) {
    const limit = Math.min(filters.limit ?? 50, 200);
    const today = getTodayInTimezone(await this.getUserTimezone(userId));

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
        dueDate: { lt: today },
        status: { notIn: [TaskStatus.COMPLETED, TaskStatus.ARCHIVED] },
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
}
