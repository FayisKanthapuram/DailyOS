import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller.js';
import { CalendarService } from './calendar.service.js';
import { TasksModule } from '../tasks/tasks.module.js';

@Module({
  imports: [TasksModule],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
