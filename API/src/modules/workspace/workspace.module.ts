import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { Workspace } from './workspace.entity';
import { KanbanColumn } from './kanban-column.entity';
import { KanbanCard } from './kanban-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, KanbanColumn, KanbanCard])],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
