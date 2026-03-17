import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Between, Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { MentorshipSession, SessionStatus } from '../sessions/session.entity';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(MentorshipSession)
    private readonly sessionRepo: Repository<MentorshipSession>,
  ) {}

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendMatchAlert(to: string, matcherName: string): Promise<void> {
    await this.send({
      to,
      subject: '🔗 New Match Request on IgniteHub',
      html: `
        <h2>You have a new match request!</h2>
        <p><strong>${matcherName}</strong> wants to connect with you on IgniteHub.</p>
        <p>Log in to review and respond to the request.</p>
      `,
    });
  }

  async sendMatchAccepted(to: string, mentorName: string): Promise<void> {
    await this.send({
      to,
      subject: '✅ Match Request Accepted on IgniteHub',
      html: `
        <h2>Great news! Your match request was accepted.</h2>
        <p><strong>${mentorName}</strong> has accepted your connection request.</p>
        <p>You can now schedule a mentorship session.</p>
      `,
    });
  }

  async sendSessionInvite(
    to: string,
    session: { scheduledAt: Date; durationMinutes: number; notes?: string },
  ): Promise<void> {
    const date = new Date(session.scheduledAt).toLocaleString('en-US', {
      timeZone: 'UTC',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    await this.send({
      to,
      subject: '📅 New Mentorship Session Proposed on IgniteHub',
      html: `
        <h2>A mentorship session has been proposed</h2>
        <p><strong>Date & Time:</strong> ${date} UTC</p>
        <p><strong>Duration:</strong> ${session.durationMinutes} minutes</p>
        ${session.notes ? `<p><strong>Notes:</strong> ${session.notes}</p>` : ''}
        <p>Please log in to confirm or cancel.</p>
      `,
    });
  }

  async sendSessionConfirmed(
    to: string,
    session: { scheduledAt: Date; durationMinutes: number },
  ): Promise<void> {
    const date = new Date(session.scheduledAt).toLocaleString('en-US', {
      timeZone: 'UTC',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    await this.send({
      to,
      subject: '✅ Mentorship Session Confirmed on IgniteHub',
      html: `
        <h2>Your mentorship session is confirmed!</h2>
        <p><strong>Date & Time:</strong> ${date} UTC</p>
        <p><strong>Duration:</strong> ${session.durationMinutes} minutes</p>
      `,
    });
  }

  async sendSessionReminder(session: MentorshipSession): Promise<void> {
    const emails = [session.mentor?.email, session.student?.email].filter(
      Boolean,
    );
    const date = new Date(session.scheduledAt).toLocaleString('en-US', {
      timeZone: 'UTC',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    for (const email of emails) {
      await this.send({
        to: email,
        subject: '⏰ Reminder: Mentorship Session Tomorrow',
        html: `
          <h2>Reminder: You have a mentorship session tomorrow</h2>
          <p><strong>Date & Time:</strong> ${date} UTC</p>
          <p><strong>Duration:</strong> ${session.durationMinutes} minutes</p>
        `,
      });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async sendDailyReminders(): Promise<void> {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingSessions = await this.sessionRepo.find({
      where: {
        status: SessionStatus.CONFIRMED,
        scheduledAt: Between(now, in24h),
      },
      relations: ['mentor', 'student'],
    });

    this.logger.log(
      `Sending reminders for ${upcomingSessions.length} upcoming session(s)`,
    );

    for (const session of upcomingSessions) {
      await this.sendSessionReminder(session).catch((err) =>
        this.logger.error(
          `Failed to send reminder for session ${session.id}`,
          err,
        ),
      );
    }
  }

  private async send(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const from = this.config.get<string>(
      'MAIL_FROM',
      'IgniteHub <no-reply@ignitehub.io>',
    );
    try {
      await this.transporter.sendMail({ from, ...options });
    } catch (err) {
      this.logger.error(`Failed to send email to ${options.to}`, err);
    }
  }
}
