import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { DailyTasksService } from '../tasks/daily-tasks.service.js';
import { getTodayInTimezone } from '../../common/utils/timezone.js';
import { CalendarQueryDto } from './dto/calendar-query.dto.js';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class CalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dailyTasksService: DailyTasksService,
  ) {}

  async getCalendarData(userId: string, query: CalendarQueryDto) {
    const { startDate, endDate } = query;

    if (startDate > endDate) {
      throw new BadRequestException('startDate cannot be after endDate');
    }

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const today = getTodayInTimezone(user.timezone);

    // Auto-ensure today's daily task instances are generated if today is within range
    if (today >= startDate && today <= endDate) {
      await this.dailyTasksService.getTodayInstances(userId, today);
    }

    // 1. Normal tasks scheduled within [startDate, endDate]
    const normalTasks = await this.prisma.task.findMany({
      where: {
        userId,
        dueDate: { gte: startDate, lte: endDate },
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        subtasks: { orderBy: { order: 'asc' } },
      },
      orderBy: [{ dueDate: 'asc' }, { dueTime: 'asc' }],
    });

    // 2. Unscheduled normal tasks (no dueDate, not COMPLETED or ARCHIVED)
    const unscheduledTasks = await this.prisma.task.findMany({
      where: {
        userId,
        dueDate: null,
        status: { notIn: [TaskStatus.COMPLETED, TaskStatus.ARCHIVED] },
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        subtasks: { orderBy: { order: 'asc' } },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    // 3. Persisted/generated daily task instances for date <= today and date >= startDate
    const maxInstanceDate = endDate < today ? endDate : today;
    const dailyInstances =
      startDate <= maxInstanceDate
        ? await this.prisma.dailyTaskInstance.findMany({
            where: {
              userId,
              date: { gte: startDate, lte: maxInstanceDate },
            },
            include: {
              template: {
                include: {
                  category: true,
                  tags: { include: { tag: true } },
                },
              },
            },
            orderBy: { date: 'asc' },
          })
        : [];

    // 4. Active daily task templates (used by frontend to project on future dates > today)
    const dailyTemplates = await this.prisma.dailyTaskTemplate.findMany({
      where: { userId, isActive: true },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { order: 'asc' },
    });

    return {
      startDate,
      endDate,
      today,
      userTimezone: user.timezone,
      normalTasks,
      dailyInstances,
      dailyTemplates,
      unscheduledTasks,
    };
  }
}
