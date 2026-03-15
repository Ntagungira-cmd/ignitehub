import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Workspace } from './workspace.entity';
import { KanbanCard } from './kanban-card.entity';

@Entity('kanban_columns')
export class KanbanColumn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'int', default: 0 })
  position: number;

  // ── Workspace FK ────────────────────────────────────────────────────────────
  @Column({ name: 'workspace_id' })
  workspaceId: string;

  @ManyToOne(() => Workspace, (ws) => ws.columns, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  // ── Cards ───────────────────────────────────────────────────────────────────
  @OneToMany(() => KanbanCard, (card) => card.column, { cascade: true })
  cards: KanbanCard[];
}
