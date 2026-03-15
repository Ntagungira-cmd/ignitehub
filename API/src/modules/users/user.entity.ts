import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../projects/project.entity';
import { MentorshipSession } from '../sessions/session.entity';
import { Match } from '../matches/match.entity';
import { Resource } from '../resources/resource.entity';

export enum UserRole {
  STUDENT = 'student',
  MENTOR = 'mentor',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // ── Relations ───────────────────────────────────────────────────────────────
  @OneToMany(() => Project, (project) => project.owner)
  ownedProjects: Project[];

  @OneToMany(() => MentorshipSession, (session) => session.mentor)
  mentorSessions: MentorshipSession[];

  @OneToMany(() => MentorshipSession, (session) => session.student)
  studentSessions: MentorshipSession[];

  @OneToMany(() => Match, (match) => match.student)
  sentMatches: Match[];

  @OneToMany(() => Resource, (resource) => resource.author)
  resources: Resource[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
