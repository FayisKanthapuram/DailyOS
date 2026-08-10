import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CategoriesService } from '../categories/categories.service.js';
import { TagsService } from '../tags/tags.service.js';
import { CreateDailyTaskDto } from './dto/create-daily-task.dto.js';
import { UpdateDailyTaskDto } from './dto/update-daily-task.dto.js';
import { UpdateDailyInstanceDto } from './dto/update-daily-instance.dto.js';
import { getTodayInTimezone } from '../../common/utils/timezone.js';

@Injectable()
export class DailyTasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
    private readonly tagsService: TagsService,
  ) {}

  async findAllTemplates(userId: string) {
    return this.prisma.dailyTaskTemplate.findMany({
      where: { userId, isActive: true },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { order: 'asc' },
    });
  }

  async createTemplate(userId: string, dto: CreateDailyTaskDto) {
    if (dto.categoryId) {
      await this.categoriesService.validateOwnership(userId, dto.categoryId);
    }
    if (dto.tagIds?.length) {
      await this.tagsService.validateOwnership(userId, dto.tagIds);
    }

    return this.prisma.dailyTaskTemplate.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? 'NONE',
        categoryId: dto.categoryId,
        time: dto.time,
        order: dto.order ?? 0,
        tags: dto.tagIds?.length ? { create: dto.tagIds.map((tagId) => ({ tagId })) } : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
  }

  async updateTemplate(userId: string, templateId: string, dto: UpdateDailyTaskDto) {
    const template = await this.prisma.dailyTaskTemplate.findFirst({
      where: { id: templateId, userId },
    });
    if (!template) throw new NotFoundException('Daily task not found');

    if (dto.categoryId) {
      await this.categoriesService.validateOwnership(userId, dto.categoryId);
    }
    if (dto.tagIds) {
      await this.tagsService.validateOwnership(userId, dto.tagIds);
    }

    return this.prisma.$transaction(async (tx) => {
      if (dto.tagIds !== undefined) {
        await tx.dailyTaskTemplateTag.deleteMany({ where: { templateId } });
        if (dto.tagIds.length > 0) {
          await tx.dailyTaskTemplateTag.createMany({
            data: dto.tagIds.map((tagId) => ({ templateId, tagId })),
          });
        }
      }

      return tx.dailyTaskTemplate.update({
        where: { id: templateId },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.priority !== undefined && { priority: dto.priority }),
          ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
          ...(dto.time !== undefined && { time: dto.time }),
          ...(dto.order !== undefined && { order: dto.order }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      });
    });
  }

  async deactivateTemplate(userId: string, templateId: string) {
    const template = await this.prisma.dailyTaskTemplate.findFirst({
      where: { id: templateId, userId },
    });
    if (!template) throw new NotFoundException('Daily task not found');

    return this.prisma.dailyTaskTemplate.update({
      where: { id: templateId },
      data: { isActive: false },
    });
  }

  async deleteTemplatePermanently(userId: string, templateId: string): Promise<void> {
    const template = await this.prisma.dailyTaskTemplate.findFirst({
      where: { id: templateId, userId },
    });
    if (!template) throw new NotFoundException('Daily task not found');

    await this.prisma.dailyTaskTemplate.delete({ where: { id: templateId } });
  }

  /**
   * Get today's instances, lazily creating them for all active templates.
   * Uses the user's stored timezone to compute "today" if no date is provided.
   */
  async getTodayInstances(userId: string, dateOverride?: string) {
    if (dateOverride && !/^\d{4}-\d{2}-\d{2}$/.test(dateOverride)) {
      throw new BadRequestException('date parameter must be in YYYY-MM-DD format');
    }
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const date = dateOverride ?? getTodayInTimezone(user.timezone);

    const templates = await this.prisma.dailyTaskTemplate.findMany({
      where: { userId, isActive: true },
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: { order: 'asc' },
    });

    // Upsert one instance per active template — snapshotTitle is only set on create
    const upserts = templates.map((t) =>
      this.prisma.dailyTaskInstance.upsert({
        where: { templateId_date: { templateId: t.id, date } },
        create: {
          templateId: t.id,
          userId,
          date,
          snapshotTitle: t.title,
          isCompleted: false,
        },
        update: {}, // intentionally empty — do NOT overwrite snapshotTitle
        include: { template: { include: { category: true, tags: { include: { tag: true } } } } },
      }),
    );

    return Promise.all(upserts);
  }

  async updateInstance(userId: string, instanceId: string, dto: UpdateDailyInstanceDto) {
    const instance = await this.prisma.dailyTaskInstance.findFirst({
      where: { id: instanceId, userId },
    });
    if (!instance) throw new NotFoundException('Daily task instance not found');

    return this.prisma.dailyTaskInstance.update({
      where: { id: instanceId },
      data: {
        ...(dto.isCompleted !== undefined && {
          isCompleted: dto.isCompleted,
          completedAt: dto.isCompleted ? new Date() : null,
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: { template: { include: { category: true, tags: { include: { tag: true } } } } },
    });
  }

  async getTemplateHistory(userId: string, templateId: string, limit = 30) {
    const template = await this.prisma.dailyTaskTemplate.findFirst({
      where: { id: templateId, userId },
    });
    if (!template) throw new NotFoundException('Daily task not found');

    return this.prisma.dailyTaskInstance.findMany({
      where: { templateId, userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }
}
