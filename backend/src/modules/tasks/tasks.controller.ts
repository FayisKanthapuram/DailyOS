import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { TasksService } from './tasks.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { CreateSubtaskDto } from './dto/create-subtask.dto.js';
import { UpdateSubtaskDto } from './dto/update-subtask.dto.js';
import { ReorderSubtasksDto } from './dto/reorder-subtasks.dto.js';
import { TaskFiltersDto } from './dto/task-filters.dto.js';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('unified')
  @ApiOperation({
    summary: 'Get unified task list (one-time tasks + daily occurrences) for a specific date',
  })
  getUnifiedTasks(@CurrentUser('userId') userId: string, @Query('date') date?: string) {
    return this.tasksService.getUnifiedTasksForDate(userId, date);
  }

  @Get()
  @ApiOperation({ summary: 'List normal tasks (with filters)' })
  findAll(@CurrentUser('userId') userId: string, @Query() filters: TaskFiltersDto) {
    return this.tasksService.findAll(userId, filters);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a task' })
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task with subtasks and tags' })
  findOne(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.tasksService.findOne(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  async remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    await this.tasksService.remove(userId, id);
  }

  // Subtasks
  @Post(':id/subtasks')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a subtask' })
  addSubtask(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateSubtaskDto,
  ) {
    return this.tasksService.addSubtask(userId, id, dto);
  }

  @Patch(':id/subtasks/reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reorder subtasks' })
  async reorderSubtasks(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: ReorderSubtasksDto,
  ) {
    await this.tasksService.reorderSubtasks(userId, id, dto);
  }

  @Patch(':id/subtasks/:subtaskId')
  @ApiOperation({ summary: 'Update a subtask' })
  updateSubtask(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
    @Body() dto: UpdateSubtaskDto,
  ) {
    return this.tasksService.updateSubtask(userId, id, subtaskId, dto);
  }

  @Delete(':id/subtasks/:subtaskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a subtask' })
  async removeSubtask(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
  ) {
    await this.tasksService.removeSubtask(userId, id, subtaskId);
  }
}
