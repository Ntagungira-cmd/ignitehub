import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MentorshipSession, SessionStatus } from './session.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { GoogleCalendarService } from './google-calendar.service';
import { UsersService } from '../users/users.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(MentorshipSession)
    private readonly sessionRepo: Repository<MentorshipSession>,
    private readonly notificationsService: NotificationsService,
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    studentId: string,
    dto: CreateSessionDto,
  ): Promise<MentorshipSession> {
    const mentor = await this.usersService.findById(dto.mentorId);

    const session = this.sessionRepo.create({
      ...dto,
      studentId,
      status: SessionStatus.PENDING,
    });
    const saved = await this.sessionRepo.save(session);

    if (mentor.email) {
      const student = await this.usersService.findById(studentId);
      await this.notificationsService
        .sendSessionInvite(mentor.email, {
          scheduledAt: saved.scheduledAt,
          durationMinutes: saved.durationMinutes,
          notes: saved.notes,
        })
        .catch(() => null);

      if (student.email) {
        await this.notificationsService
          .sendSessionInvite(student.email, {
            scheduledAt: saved.scheduledAt,
            durationMinutes: saved.durationMinutes,
            notes: saved.notes,
          })
          .catch(() => null);
      }
    }

    return saved;
  }

  async findAll(userId: string): Promise<MentorshipSession[]> {
    return this.sessionRepo.find({
      where: [{ mentorId: userId }, { studentId: userId }],
      relations: ['mentor', 'student', 'project'],
      order: { scheduledAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<MentorshipSession> {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['mentor', 'student', 'project'],
    });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return session;
  }

  async confirm(
    sessionId: string,
    mentorId: string,
  ): Promise<MentorshipSession> {
    const session = await this.findOne(sessionId);

    if (session.mentorId !== mentorId) {
      throw new ForbiddenException(
        'Only the assigned mentor can confirm this session',
      );
    }

    if (session.status !== SessionStatus.PENDING) {
      throw new BadRequestException(
        `Session cannot be confirmed (current status: ${session.status})`,
      );
    }

    session.status = SessionStatus.CONFIRMED;

    const endTime = new Date(
      session.scheduledAt.getTime() + session.durationMinutes * 60 * 1000,
    );

    const attendeeEmails = [
      session.mentor?.email,
      session.student?.email,
    ].filter((e): e is string => Boolean(e));

    const calendarEventId = await this.googleCalendarService.createEvent({
      summary: 'IgniteHub Mentorship Session',
      description: session.notes ?? undefined,
      startTime: session.scheduledAt,
      endTime,
      attendeeEmails,
    });

    if (calendarEventId) {
      session.googleCalendarEventId = calendarEventId;
    }

    const saved = await this.sessionRepo.save(session);

    for (const email of attendeeEmails) {
      await this.notificationsService
        .sendSessionConfirmed(email, {
          scheduledAt: saved.scheduledAt,
          durationMinutes: saved.durationMinutes,
        })
        .catch(() => null);
    }

    return saved;
  }

  async cancel(sessionId: string, userId: string): Promise<MentorshipSession> {
    const session = await this.findOne(sessionId);

    const isParticipant =
      session.mentorId === userId || session.studentId === userId;
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant of this session');
    }

    if (
      session.status === SessionStatus.COMPLETED ||
      session.status === SessionStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Session is already ${session.status} and cannot be cancelled`,
      );
    }

    if (session.googleCalendarEventId) {
      await this.googleCalendarService
        .deleteEvent(session.googleCalendarEventId)
        .catch(() => null);
    }

    session.status = SessionStatus.CANCELLED;
    return this.sessionRepo.save(session);
  }
}
