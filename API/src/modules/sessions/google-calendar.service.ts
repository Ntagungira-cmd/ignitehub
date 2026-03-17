import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, calendar_v3 } from 'googleapis';

export interface CalendarEventInput {
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendeeEmails: string[];
}

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private calendar: calendar_v3.Calendar;

  constructor(private readonly config: ConfigService) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.config.get<string>(
      'GOOGLE_REDIRECT_URI',
      'http://localhost:3001/api/v1/auth/google/callback',
    );

    if (clientId && clientSecret) {
      const auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      this.calendar = google.calendar({ version: 'v3', auth });
    } else {
      this.logger.warn(
        'Google Calendar credentials not configured — calendar events will be skipped',
      );
    }
  }

  async createEvent(input: CalendarEventInput): Promise<string | null> {
    if (!this.calendar) {
      this.logger.warn(
        'Google Calendar not configured; skipping event creation',
      );
      return null;
    }

    try {
      const event: calendar_v3.Schema$Event = {
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.startTime.toISOString(), timeZone: 'UTC' },
        end: { dateTime: input.endTime.toISOString(), timeZone: 'UTC' },
        attendees: input.attendeeEmails.map((email) => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        sendUpdates: 'all',
      });

      return response.data.id ?? null;
    } catch (err) {
      this.logger.error('Failed to create Google Calendar event', err);
      return null;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.calendar) return;
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all',
      });
    } catch (err) {
      this.logger.error(
        `Failed to delete Google Calendar event ${eventId}`,
        err,
      );
    }
  }
}
