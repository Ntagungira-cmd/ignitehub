import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './project.entity';
import { WorkspaceService } from '../workspace/workspace.service';
import { UserRole } from '../users/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectsDto } from './dto/query-projects.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async create(ownerId: string, dto: CreateProjectDto): Promise<Project> {
    const project = this.projectRepo.create({ ...dto, ownerId });
    const saved = await this.projectRepo.save(project);
    await this.workspaceService.initializeDefaultWorkspace(saved.id);
    return this.findOne(saved.id);
  }

  async findAll(
    query: QueryProjectsDto,
  ): Promise<{ data: Project[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 20, status, tags } = query;

    const qb = this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .where('project.status != :archived', {
        archived: ProjectStatus.ARCHIVED,
      });

    if (status) {
      qb.andWhere('project.status = :status', { status });
    }

    if (tags && tags.length > 0) {
      const conditions = tags.map((_, i) => `project.tags LIKE :tag${i}`);
      const params = tags.reduce(
        (acc, tag, i) => ({ ...acc, [`tag${i}`]: `%${tag}%` }),
        {},
      );
      qb.andWhere(`(${conditions.join(' OR ')})`, params);
    }

    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: ['owner', 'workspace'],
    });
    if (!project) throw new NotFoundException(`Project ${id} not found`);
    return project;
  }

  async findByOwner(ownerId: string): Promise<Project[]> {
    return this.projectRepo.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findOne(id);
    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the project owner can edit this project',
      );
    }
    Object.assign(project, dto);
    return this.projectRepo.save(project);
  }

  async remove(
    id: string,
    userId: string,
    role: UserRole,
  ): Promise<{ message: string }> {
    const project = await this.findOne(id);

    if (role === UserRole.ADMIN) {
      await this.projectRepo.remove(project);
      return { message: 'Project permanently deleted' };
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'Only the project owner can archive this project',
      );
    }

    project.status = ProjectStatus.ARCHIVED;
    await this.projectRepo.save(project);
    return { message: 'Project archived' };
  }
}
