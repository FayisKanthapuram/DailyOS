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

  async findAllTemplates(userId: string, includeInactive = true) {
    return this.prisma.dailyTaskTemplate.findMany({
      where: {
        userId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: [{ isActive: 'desc' }, { order: 'asc' }],
    });
  }

  async createTemplate(userId: string, dto: CreateDailyTaskDto) {
    if (dto.categoryId) {
      await this.categoriesService.validateOwnership(userId, dto.categoryId);
    }
    if (dto.tagIds?.length) {
      await this.tagsService.validateOwnership(userId, dto.tagIds);
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const effectiveDate = getTodayInTimezone(user.timezone);
    const frequency = dto.frequency ?? 'DAILY';

    return this.prisma.$transaction(async (tx) => {
      const template = await tx.dailyTaskTemplate.create({
        data: {
          userId,
          title: dto.title,
          description: dto.description,
          priority: dto.priority ?? 'NONE',
          frequency,
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

      await tx.recurringTaskFrequencyHistory.create({
        data: {
          templateId: template.id,
          userId,
          frequency,
          effectiveDate,
        },
      });

      await tx.recurringTaskLifecycleHistory.create({
        data: {
          templateId: template.id,
          userId,
          state: 'ACTIVE',
          effectiveDate,
        },
      });

      return template;
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

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const effectiveDate = getTodayInTimezone(user.timezone);

    return this.prisma.$transaction(async (tx) => {
      if (dto.tagIds !== undefined) {
        await tx.dailyTaskTemplateTag.deleteMany({ where: { templateId } });
        if (dto.tagIds.length > 0) {
          await tx.dailyTaskTemplateTag.createMany({
            data: dto.tagIds.map((tagId) => ({ templateId, tagId })),
          });
        }
      }

      const updatedTemplate = await tx.dailyTaskTemplate.update({
        where: { id: templateId },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.priority !== undefined && { priority: dto.priority }),
          ...(dto.frequency !== undefined && { frequency: dto.frequency }),
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

      if (dto.frequency !== undefined && dto.frequency !== template.frequency) {
        await tx.recurringTaskFrequencyHistory.create({
          data: {
            templateId,
            userId,
            frequency: dto.frequency,
            effectiveDate,
          },
        });
      }

      if (dto.isActive !== undefined && dto.isActive !== template.isActive) {
        await tx.recurringTaskLifecycleHistory.create({
          data: {
            templateId,
            userId,
            state: dto.isActive ? 'ACTIVE' : 'INACTIVE',
            effectiveDate,
          },
        });
      }

      return updatedTemplate;
    });
  }

  async deactivateTemplate(userId: string, templateId: string) {
    const template = await this.prisma.dailyTaskTemplate.findFirst({
      where: { id: templateId, userId },
    });
    if (!template) throw new NotFoundException('Daily task not found');

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const effectiveDate = getTodayInTimezone(user.timezone);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.dailyTaskTemplate.update({
        where: { id: templateId },
        data: { isActive: false },
      });

      await tx.recurringTaskLifecycleHistory.create({
        data: {
          templateId,
          userId,
          state: 'INACTIVE',
          effectiveDate,
        },
      });

      return updated;
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

    const upserts = templates.map((t) =>
      this.prisma.dailyTaskInstance.upsert({
        where: { templateId_date: { templateId: t.id, date } },
        create: {
          templateId: t.id,
          userId,
          date,
          snapshotTitle: t.title,
          isCompleted: false,
          frequencySnapshot: t.frequency,
        },
        update: {},
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

  async createException(userId: string, templateId: string, date: string, type: 'SKIP' = 'SKIP') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('date parameter must be in YYYY-MM-DD format');
    }

    const template = await this.prisma.dailyTaskTemplate.findFirst({
      where: { id: templateId, userId },
    });
    if (!template) throw new NotFoundException('Daily task not found');

    return this.prisma.dailyTaskException.upsert({
      where: { templateId_date: { templateId, date } },
      create: { templateId, userId, date, type, frequencySnapshot: template.frequency },
      update: { type },
    });
  }

  async deleteException(userId: string, templateId: string, date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('date parameter must be in YYYY-MM-DD format');
    }

    const template = await this.prisma.dailyTaskTemplate.findFirst({
      where: { id: templateId, userId },
    });
    if (!template) throw new NotFoundException('Daily task not found');

    const exception = await this.prisma.dailyTaskException.findUnique({
      where: { templateId_date: { templateId, date } },
    });
    if (!exception) throw new NotFoundException('Exception not found');

    await this.prisma.dailyTaskException.delete({
      where: { templateId_date: { templateId, date } },
    });
  }
}
