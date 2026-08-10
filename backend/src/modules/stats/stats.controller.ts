import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { StatsService } from './stats.service.js';

@ApiTags('Stats')
@Controller('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('today')
  @ApiOperation({ summary: "Get today's productivity summary and streak" })
  @ApiResponse({ status: 200, description: 'Today summary' })
  getToday(@CurrentUser('userId') userId: string) {
    return this.statsService.getTodaySummary(userId);
  }
}
