import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../users/user.entity';
import { Project, ProjectStatus } from '../projects/project.entity';
import { Workspace } from '../workspace/workspace.entity';
import { KanbanColumn } from '../workspace/kanban-column.entity';
import { KanbanCard, CardPriority } from '../workspace/kanban-card.entity';

@Injectable()
export class SeedsService {
  private readonly logger = new Logger(SeedsService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Project) private readonly projectRepo: Repository<Project>,
    @InjectRepository(Workspace) private readonly workspaceRepo: Repository<Workspace>,
    @InjectRepository(KanbanColumn) private readonly columnRepo: Repository<KanbanColumn>,
    @InjectRepository(KanbanCard) private readonly cardRepo: Repository<KanbanCard>,
  ) {}

  async run() {
    this.logger.log('Starting database seeding...');

    const existingAdmin = await this.userRepo.findOne({ where: { email: 'r.ntagungir@alustudent.com' } });
    if (existingAdmin) {
      this.logger.warn('Seed records already exist (Admin user found). Skipping seeding to prevent duplicates.');
      return;
    }

    const password = await bcrypt.hash('Password123!', 10);

    // 1. Create Users
    this.logger.log('Seeding users...');
    const admin = await this.userRepo.save(this.userRepo.create({
      fullName: 'Ali Admin',
      email: 'r.ntagungir@alustudent.com',
      passwordHash: password,
      role: UserRole.ADMIN,
      isActive: true,
    }));

    const mentor = await this.userRepo.save(this.userRepo.create({
      fullName: 'Ali Mentor',
      email: 'a.ntagungira@irembo.com',
      passwordHash: password,
      role: UserRole.MENTOR,
      isActive: true,
      skills: ['React', 'Node.js', 'PostgreSQL', 'System Design', 'Cloud Computing'],
      bio: 'Senior Software Engineering Mentor specializing in distributed systems and modern web architectures.',
    }));

    const student = await this.userRepo.save(this.userRepo.create({
      fullName: 'Ali Ntagungira',
      email: 'ntagungiraali@gmail.com',
      passwordHash: password,
      role: UserRole.STUDENT,
      isActive: true,
    }));

    // 2. Create Projects
    this.logger.log('Seeding projects and Kanban boards...');
    const projects = [
      {
        title: 'Smart Agriculture Monitoring System',
        abstract: 'An IoT-based system to monitor soil moisture, temperature, and humidity for optimized irrigation cycles and crop health management.',
        tags: ['IoT', 'React', 'Node.js', 'Hardware'],
      },
      {
        title: 'AI-Powered Resume Screener',
        abstract: 'Automating the recruitment process using NLP to rank and filter resumes based on job descriptions and core competencies.',
        tags: ['AI', 'Python', 'NLP', 'Data Science'],
      }
    ];

    for (const pData of projects) {
      const project = await this.projectRepo.save(this.projectRepo.create({
        ...pData,
        status: ProjectStatus.ACTIVE,
        ownerId: student.id,
      }));

      // 3. Create Workspace
      const workspace = await this.workspaceRepo.save(this.workspaceRepo.create({
        name: `${project.title} Board`,
        projectId: project.id,
      }));

      // 4. Create Kanban Columns
      const columns = await Promise.all([
        this.columnRepo.save(this.columnRepo.create({ title: 'To Do', position: 0, workspaceId: workspace.id })),
        this.columnRepo.save(this.columnRepo.create({ title: 'In Progress', position: 1, workspaceId: workspace.id })),
        this.columnRepo.save(this.columnRepo.create({ title: 'Code Review', position: 2, workspaceId: workspace.id })),
        this.columnRepo.save(this.columnRepo.create({ title: 'Done', position: 3, workspaceId: workspace.id })),
      ]);

      // 5. Create Kanban Cards
      const cards = [
        { title: 'Project Initialization', description: 'Configure boilerplate, install essential dependencies, and setup Git tracking.', priority: CardPriority.HIGH, columnId: columns[3].id, position: 0 },
        { title: 'Database Schema Design', description: 'Define entities, relations, and initial migrations for the core modules.', priority: CardPriority.HIGH, columnId: columns[3].id, position: 1 },
        { title: 'User Authentication Flow', description: 'Implement JWT login, registration, and role-based access control.', priority: CardPriority.MEDIUM, columnId: columns[1].id, position: 0 },
        { title: 'Figma UI Mockups', description: 'Create high-fidelity designs for the dashboard and project overview screens.', priority: CardPriority.LOW, columnId: columns[0].id, position: 0 },
        { title: 'Swagger API Documentation', description: 'Configure Swagger UI and document all REST endpoints.', priority: CardPriority.MEDIUM, columnId: columns[0].id, position: 1 },
      ];

      for (const cData of cards) {
        await this.cardRepo.save(this.cardRepo.create({
          ...cData,
          assigneeId: student.id,
        }));
      }
    }

    this.logger.log('Seeding completed successfully!');
  }
}
