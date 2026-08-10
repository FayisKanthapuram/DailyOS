import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { DailyTasksService } from '../tasks/daily-tasks.service.js';
import { getTodayInTimezone } from '../../common/utils/timezone.js';
import { DateTime } from 'luxon';

@Injectable()
export class StatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dailyTasksService: DailyTasksService,
  ) {}

  async getTodaySummary(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const today = getTodayInTimezone(user.timezone);

    // Auto-ensure today's daily task instances are generated so stats are 100% accurate
    const instances = await this.dailyTasksService.getTodayInstances(userId, today);

    // Overdue normal tasks
    const overdueCount = await this.prisma.task.count({
      where: {
        userId,
        dueDate: { lt: today },
        status: { notIn: ['COMPLETED', 'ARCHIVED'] },
      },
    });

    const streak = await this.computeStreak(userId, today);

    return {
      date: today,
      timezone: user.timezone,
      dailyTasks: {
        total: instances.length,
        completed: instances.filter((i) => i.isCompleted).length,
      },
      overdueTasksCount: overdueCount,
      streak,
    };
  }

  /**
   * Computes the user's current streak.
   *
   * Rules:
   * - Walk backwards from yesterday (up to 365 days)
   * - Days with no instances are neutral (does not break streak)
   * - Days with instances but 0 completed → streak broken
   * - Days with ≥1 completed instance → streak increments
   * - Today's completions are added if any exist
   */
  private async computeStreak(userId: string, today: string): Promise<number> {
    // Fetch all instances for this user, ordered by date desc, limit to last 365+1 days
    const cutoff = DateTime.fromISO(today).minus({ days: 366 }).toISODate()!;

    const instances = await this.prisma.dailyTaskInstance.findMany({
      where: {
        userId,
        date: { gte: cutoff },
      },
      select: { date: true, isCompleted: true },
      orderBy: { date: 'desc' },
    });

    // Group by date
    const byDate = new Map<string, { total: number; completed: number }>();
    for (const inst of instances) {
      const entry = byDate.get(inst.date) ?? { total: 0, completed: 0 };
      entry.total++;
      if (inst.isCompleted) entry.completed++;
      byDate.set(inst.date, entry);
    }

    let streak = 0;

    // Add today's contribution first
    const todayEntry = byDate.get(today);
    if (todayEntry && todayEntry.completed > 0) {
      streak++;
    }

    // Walk backwards from yesterday
    let cursor = DateTime.fromISO(today).minus({ days: 1 });
    for (let i = 0; i < 365; i++) {
      const dateStr = cursor.toISODate()!;
      const entry = byDate.get(dateStr);

      if (!entry) {
        // Neutral day — no instances, keep going
        cursor = cursor.minus({ days: 1 });
        continue;
      }

      if (entry.completed > 0) {
        streak++;
        cursor = cursor.minus({ days: 1 });
      } else {
        // Had tasks but completed none → break
        break;
      }
    }

    return streak;
  }
}
