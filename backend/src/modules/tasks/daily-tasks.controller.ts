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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { DailyTasksService } from './daily-tasks.service.js';
import { CreateDailyTaskDto } from './dto/create-daily-task.dto.js';
import { UpdateDailyTaskDto } from './dto/update-daily-task.dto.js';
import { UpdateDailyInstanceDto } from './dto/update-daily-instance.dto.js';

@ApiTags('Daily Tasks')
@Controller('tasks/daily')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class DailyTasksController {
  constructor(private readonly dailyTasksService: DailyTasksService) {}

  @Get()
  @ApiOperation({ summary: 'List all active daily task templates' })
  findAll(@CurrentUser('userId') userId: string) {
    return this.dailyTasksService.findAllTemplates(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a daily task template' })
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateDailyTaskDto) {
    return this.dailyTasksService.createTemplate(userId, dto);
  }

  @Get('today')
  @ApiOperation({ summary: "Get today's daily task instances (lazy-creates using user timezone)" })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Override date YYYY-MM-DD (for testing/history)',
  })
  getToday(@CurrentUser('userId') userId: string, @Query('date') date?: string) {
    return this.dailyTasksService.getTodayInstances(userId, date);
  }

  @Patch('instances/:instanceId')
  @ApiOperation({ summary: 'Toggle completion or add notes on a daily task instance' })
  updateInstance(
    @CurrentUser('userId') userId: string,
    @Param('instanceId') instanceId: string,
    @Body() dto: UpdateDailyInstanceDto,
  ) {
    return this.dailyTasksService.updateInstance(userId, instanceId, dto);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get historical instances for a daily task template' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getHistory(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    return this.dailyTasksService.getTemplateHistory(userId, id, limit ? Number(limit) : 30);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a daily task template' })
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDailyTaskDto,
  ) {
    return this.dailyTasksService.updateTemplate(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate a daily task (soft delete, preserves history)' })
  async deactivate(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    await this.dailyTasksService.deactivateTemplate(userId, id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a daily task and all its history' })
  async deletePermanent(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    await this.dailyTasksService.deleteTemplatePermanently(userId, id);
  }
}
