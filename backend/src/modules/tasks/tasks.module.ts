import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller.js';
import { TasksService } from './tasks.service.js';
import { DailyTasksController } from './daily-tasks.controller.js';
import { DailyTasksService } from './daily-tasks.service.js';
import { CategoriesModule } from '../categories/categories.module.js';
import { TagsModule } from '../tags/tags.module.js';

@Module({
  imports: [CategoriesModule, TagsModule],
  controllers: [TasksController, DailyTasksController],
  providers: [TasksService, DailyTasksService],
  exports: [DailyTasksService],
})
export class TasksModule {}
