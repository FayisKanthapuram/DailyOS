import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { TagsService } from './tags.service.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';

@ApiTags('Tags')
@Controller('tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List all tags for current user' })
  findAll(@CurrentUser('userId') userId: string) {
    return this.tagsService.findAll(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a tag' })
  create(@CurrentUser('userId') userId: string, @Body() dto: CreateTagDto) {
    return this.tagsService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  update(
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTagDto,
  ) {
    return this.tagsService.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a tag' })
  async remove(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    await this.tagsService.remove(userId, id);
  }
}
