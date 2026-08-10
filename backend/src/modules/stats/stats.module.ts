import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller.js';
import { StatsService } from './stats.service.js';
import { TasksModule } from '../tasks/tasks.module.js';

@Module({
  imports: [TasksModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
