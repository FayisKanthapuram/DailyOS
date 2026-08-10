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
    const exceptions = await this.prisma.dailyTaskException.findMany({
      where: { userId, date: today },
    });
    const skippedTemplateIds = new Set(
      exceptions.filter((e) => e.type === 'SKIP').map((e) => e.templateId),
    );

    // Active (non-skipped) instances for today
    const activeInstances = instances.filter((i) => !skippedTemplateIds.has(i.templateId));

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
        total: activeInstances.length,
        completed: activeInstances.filter((i) => i.isCompleted).length,
        skipped: skippedTemplateIds.size,
      },
      overdueTasksCount: overdueCount,
      streak,
    };
  }

  /**
   * Computes recurring task statistics for a given period: today | week | month | 30days
   */
  async getRecurringStats(userId: string, periodStr = 'today') {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const userTimezone = user.timezone;
    const today = getTodayInTimezone(userTimezone);
    const todayDt = DateTime.fromISO(today, { zone: userTimezone });

    let startDate = today;
    let endDate = today;

    if (periodStr === 'week') {
      startDate = todayDt.startOf('week').toISODate()!;
      endDate = todayDt.endOf('week').toISODate()!;
    } else if (periodStr === 'month') {
      startDate = todayDt.startOf('month').toISODate()!;
      endDate = todayDt.endOf('month').toISODate()!;
    } else if (periodStr === '30days') {
      startDate = todayDt.minus({ days: 29 }).toISODate()!;
      endDate = today;
    }

    // 1. Fetch completed instances in range
    const instances = await this.prisma.dailyTaskInstance.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    // 2. Fetch exceptions in range
    const exceptions = await this.prisma.dailyTaskException.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    const completedCounts = { DAILY: 0, WEEKLY: 0, MONTHLY: 0 };
    for (const inst of instances) {
      if (inst.isCompleted) {
        const freq = inst.frequencySnapshot || 'DAILY';
        completedCounts[freq] = (completedCounts[freq] || 0) + 1;
      }
    }

    const skippedCounts = { DAILY: 0, WEEKLY: 0, MONTHLY: 0 };
    for (const exc of exceptions) {
      if (exc.type === 'SKIP') {
        const freq = exc.frequencySnapshot || 'DAILY';
        skippedCounts[freq] = (skippedCounts[freq] || 0) + 1;
      }
    }

    // 3. Tally pending occurrences
    const templates = await this.prisma.dailyTaskTemplate.findMany({
      where: { userId },
      include: {
        frequencyHistory: { orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }] },
        lifecycleHistory: { orderBy: [{ effectiveDate: 'desc' }, { createdAt: 'desc' }] },
        instances: { where: { date: { gte: startDate, lte: endDate } } },
        exceptions: { where: { date: { gte: startDate, lte: endDate } } },
      },
    });

    const pendingCounts = { DAILY: 0, WEEKLY: 0, MONTHLY: 0 };

    for (const t of templates) {
      // Loop over dates in [startDate, min(endDate, today)]
      const maxDate = endDate < today ? endDate : today;
      let curr = DateTime.fromISO(startDate, { zone: userTimezone });
      const maxDt = DateTime.fromISO(maxDate, { zone: userTimezone });

      const evaluatedPeriodKeys = new Set<string>();

      while (curr <= maxDt) {
        const dateStr = curr.toISODate()!;

        // Resolve lifecycle state on dateStr
        const validLc = t.lifecycleHistory.filter((l) => l.effectiveDate <= dateStr);
        const activeState =
          validLc.length > 0 ? validLc[0].state : t.isActive ? 'ACTIVE' : 'INACTIVE';

        if (activeState === 'ACTIVE') {
          // Resolve frequency on dateStr
          const validFreq = t.frequencyHistory.filter((f) => f.effectiveDate <= dateStr);
          const freq = validFreq.length > 0 ? validFreq[0].frequency : t.frequency;

          let periodKey = dateStr;
          if (freq === 'WEEKLY') {
            periodKey = curr.startOf('week').toISODate()!;
          } else if (freq === 'MONTHLY') {
            periodKey = curr.startOf('month').toISODate()!;
          }

          const uniqueKey = `${freq}_${periodKey}`;
          if (!evaluatedPeriodKeys.has(uniqueKey)) {
            evaluatedPeriodKeys.add(uniqueKey);

            // Check if completed instance or skip exception exists
            const hasInstance = t.instances.some(
              (i) => i.isCompleted && (freq === 'DAILY' ? i.date === dateStr : true),
            );
            const hasException = t.exceptions.some(
              (e) => e.type === 'SKIP' && (freq === 'DAILY' ? e.date === dateStr : true),
            );

            if (!hasInstance && !hasException) {
              pendingCounts[freq] = (pendingCounts[freq] || 0) + 1;
            }
          }
        }

        curr = curr.plus({ days: 1 });
      }
    }

    const calcStat = (freq: 'DAILY' | 'WEEKLY' | 'MONTHLY') => {
      const c = completedCounts[freq] || 0;
      const s = skippedCounts[freq] || 0;
      const p = pendingCounts[freq] || 0;
      const total = c + s + p;
      const rate = total > 0 ? Math.round((c / total) * 100) : 0;
      return { total, completed: c, skipped: s, pending: p, completionRate: rate };
    };

    return {
      period: periodStr,
      timezone: userTimezone,
      daily: calcStat('DAILY'),
      weekly: calcStat('WEEKLY'),
      monthly: calcStat('MONTHLY'),
    };
  }

  /**
   * Computes the user's current streak.
   */
  private async computeStreak(userId: string, today: string): Promise<number> {
    const cutoff = DateTime.fromISO(today).minus({ days: 366 }).toISODate()!;

    const [instances, exceptions] = await Promise.all([
      this.prisma.dailyTaskInstance.findMany({
        where: { userId, date: { gte: cutoff } },
        select: { templateId: true, date: true, isCompleted: true },
        orderBy: { date: 'desc' },
      }),
      this.prisma.dailyTaskException.findMany({
        where: { userId, date: { gte: cutoff } },
        select: { templateId: true, date: true, type: true },
      }),
    ]);

    const skippedSet = new Set(
      exceptions.filter((e) => e.type === 'SKIP').map((e) => `${e.templateId}_${e.date}`),
    );

    const byDate = new Map<string, { total: number; completed: number }>();
    for (const inst of instances) {
      if (skippedSet.has(`${inst.templateId}_${inst.date}`)) continue;

      const entry = byDate.get(inst.date) ?? { total: 0, completed: 0 };
      entry.total++;
      if (inst.isCompleted) entry.completed++;
      byDate.set(inst.date, entry);
    }

    let streak = 0;

    const todayEntry = byDate.get(today);
    if (todayEntry && todayEntry.completed > 0) {
      streak++;
    }

    let cursor = DateTime.fromISO(today).minus({ days: 1 });
    for (let i = 0; i < 365; i++) {
      const dateStr = cursor.toISODate()!;
      const entry = byDate.get(dateStr);

      if (!entry || entry.total === 0) {
        cursor = cursor.minus({ days: 1 });
        continue;
      }

      if (entry.completed > 0) {
        streak++;
        cursor = cursor.minus({ days: 1 });
      } else {
        break;
      }
    }

    return streak;
  }
}
