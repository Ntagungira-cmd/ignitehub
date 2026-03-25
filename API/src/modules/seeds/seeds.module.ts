import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Workspace } from '../workspace/workspace.entity';
import { KanbanColumn } from '../workspace/kanban-column.entity';
import { KanbanCard } from '../workspace/kanban-card.entity';
import { SeedsService } from './seeds.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Project,
      Workspace,
      KanbanColumn,
      KanbanCard,
    ]),
  ],
  providers: [SeedsService],
  exports: [SeedsService],
})
export class SeedsModule {}
