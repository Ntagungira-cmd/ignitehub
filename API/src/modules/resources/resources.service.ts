import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './resource.entity';
import { UserRole } from '../users/user.entity';
import { CreateResourceDto } from './dto/create-resource.dto';
import { QueryResourcesDto } from './dto/query-resources.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: Repository<Resource>,
  ) {}

  async create(
    authorId: string,
    dto: CreateResourceDto,
    fileUrl?: string,
  ): Promise<Resource> {
    const resource = this.resourceRepo.create({ ...dto, authorId, fileUrl });
    return this.resourceRepo.save(resource);
  }

  async findAll(
    query: QueryResourcesDto,
  ): Promise<{ data: Resource[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, category, tags } = query;

    const qb = this.resourceRepo
      .createQueryBuilder('resource')
      .leftJoinAndSelect('resource.author', 'author');

    if (category) {
      qb.andWhere('resource.category = :category', { category });
    }

    if (tags && tags.length > 0) {
      const conditions = tags.map((_, i) => `resource.tags LIKE :tag${i}`);
      const params = tags.reduce(
        (acc, tag, i) => ({ ...acc, [`tag${i}`]: `%${tag}%` }),
        {},
      );
      qb.andWhere(`(${conditions.join(' OR ')})`, params);
    }

    const [data, total] = await qb
      .orderBy('resource.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Resource> {
    const resource = await this.resourceRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!resource) throw new NotFoundException(`Resource ${id} not found`);
    return resource;
  }

  async remove(
    id: string,
    userId: string,
    role: UserRole,
  ): Promise<{ message: string }> {
    const resource = await this.findOne(id);

    if (role !== UserRole.ADMIN && resource.authorId !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this resource',
      );
    }

    await this.resourceRepo.remove(resource);
    return { message: 'Resource deleted' };
  }
}
