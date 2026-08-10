import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CalendarService } from './calendar.service.js';
import { CalendarQueryDto } from './dto/calendar-query.dto.js';

@ApiTags('Calendar')
@Controller('calendar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  @ApiOperation({ summary: 'Get unified calendar data for a date range' })
  @ApiResponse({ status: 200, description: 'Calendar data for range' })
  getCalendarData(@CurrentUser('userId') userId: string, @Query() query: CalendarQueryDto) {
    return this.calendarService.getCalendarData(userId, query);
  }
}
