import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { KanbanColumn } from './kanban-column.entity';
import { User } from '../users/user.entity';

export enum CardPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('kanban_cards')
export class KanbanCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: CardPriority, default: CardPriority.MEDIUM })
  priority: CardPriority;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  // ── Column FK ───────────────────────────────────────────────────────────────
  @Column({ name: 'column_id' })
  columnId: string;

  @ManyToOne(() => KanbanColumn, (col) => col.cards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'column_id' })
  column: KanbanColumn;

  // ── Assignee FK ─────────────────────────────────────────────────────────────
  @Column({ name: 'assignee_id', nullable: true })
  assigneeId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @Column({ type: 'int', default: 0 })
  position: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
