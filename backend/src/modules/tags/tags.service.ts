import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';
import { Tag } from '@prisma/client';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<Tag[]> {
    return this.prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async create(userId: string, dto: CreateTagDto): Promise<Tag> {
    const existing = await this.prisma.tag.findFirst({
      where: { userId, name: dto.name },
    });
    if (existing) throw new ConflictException(`Tag '${dto.name}' already exists`);

    return this.prisma.tag.create({
      data: {
        userId,
        name: dto.name,
        color: dto.color ?? '#64748b',
      },
    });
  }

  async update(userId: string, tagId: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.prisma.tag.findFirst({ where: { id: tagId, userId } });
    if (!tag) throw new NotFoundException('Tag not found');

    return this.prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
  }

  async remove(userId: string, tagId: string): Promise<void> {
    const tag = await this.prisma.tag.findFirst({ where: { id: tagId, userId } });
    if (!tag) throw new NotFoundException('Tag not found');
    await this.prisma.tag.delete({ where: { id: tagId } });
  }

  async validateOwnership(userId: string, tagIds: string[]): Promise<void> {
    if (!tagIds || tagIds.length === 0) return;
    const uniqueTagIds = Array.from(new Set(tagIds));
    const count = await this.prisma.tag.count({
      where: { id: { in: uniqueTagIds }, userId },
    });
    if (count !== uniqueTagIds.length) {
      throw new NotFoundException('One or more tags not found');
    }
  }
}
