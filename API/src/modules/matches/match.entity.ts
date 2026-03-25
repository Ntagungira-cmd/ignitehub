import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';

export enum MatchType {
  MENTOR = 'mentor',
  COLLABORATOR = 'collaborator',
}

export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MatchType })
  type: MatchType;

  @Column({ type: 'float' })
  score: number;

  @Column({ name: 'matching_tags', type: 'simple-array', nullable: true })
  matchingTags: string[];

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.PENDING,
  })
  status: MatchStatus;

  // ── Student (initiating user) ───────────────────────────────────────────────
  @Column({ name: 'student_id' })
  studentId: string;

  @ManyToOne(() => User, (user) => user.sentMatches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  // ── Matched User (mentor or collaborator) ───────────────────────────────────
  @Column({ name: 'matched_user_id' })
  matchedUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'matched_user_id' })
  matchedUser: User;

  // ── Project (optional) ──────────────────────────────────────────────────────
  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @ManyToOne(() => Project, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
