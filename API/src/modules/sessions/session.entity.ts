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

export enum SessionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('mentorship_sessions')
export class MentorshipSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'scheduled_at', type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ name: 'duration_minutes', type: 'int', default: 60 })
  durationMinutes: number;

  @Column({ name: 'google_calendar_event_id', type: 'text', nullable: true })
  googleCalendarEventId: string;

  @Column({ name: 'google_calendar_event_url', type: 'text', nullable: true })
  googleCalendarEventUrl: string | null;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.PENDING })
  status: SessionStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // ── Mentor FK ───────────────────────────────────────────────────────────────
  @Column({ name: 'mentor_id' })
  mentorId: string;

  @ManyToOne(() => User, (user) => user.mentorSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mentor_id' })
  mentor: User;

  // ── Student FK ──────────────────────────────────────────────────────────────
  @Column({ name: 'student_id' })
  studentId: string;

  @ManyToOne(() => User, (user) => user.studentSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student: User;

  // ── Project (optional) ──────────────────────────────────────────────────────
  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.mentorshipSessions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
