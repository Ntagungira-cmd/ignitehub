import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum ResourceCategory {
  TEMPLATE = 'template',
  WORKSHOP = 'workshop',
  INVENTION = 'invention',
  ARTICLE = 'article',
}

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ResourceCategory })
  category: ResourceCategory;

  @Column({ name: 'file_url', nullable: true })
  fileUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // ── Author FK ───────────────────────────────────────────────────────────────
  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => User, (user) => user.resources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
