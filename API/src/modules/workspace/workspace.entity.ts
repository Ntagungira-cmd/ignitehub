import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Project } from '../projects/project.entity';
import { KanbanColumn } from './kanban-column.entity';

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Project Board' })
  name: string;

  // ── Project (1:1) ───────────────────────────────────────────────────────────
  @Column({ name: 'project_id' })
  projectId: string;

  @OneToOne(() => Project, (project) => project.workspace, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  // ── Kanban Columns ──────────────────────────────────────────────────────────
  @OneToMany(() => KanbanColumn, (col) => col.workspace, { cascade: true })
  columns: KanbanColumn[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
