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
  private readonly clientId: string | undefined;
  private readonly clientSecret: string | undefined;
  private readonly redirectUri: string;

  constructor(private readonly config: ConfigService) {
    this.clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    this.clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    this.redirectUri = this.config.get<string>(
      'GOOGLE_REDIRECT_URI',
      'http://localhost:3001/api/v1/auth/google/callback',
    );
  }

  private getAuthClient(refreshToken: string) {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Google Calendar credentials not configured');
    }
    const auth = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri,
    );
    auth.setCredentials({ refresh_token: refreshToken });
    return auth;
  }

  async createEvent(
    refreshToken: string,
    input: CalendarEventInput,
  ): Promise<{ id: string; url: string | null } | null> {
    try {
      const auth = this.getAuthClient(refreshToken);
      const calendar = google.calendar({ version: 'v3', auth });

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

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          ...event,
          conferenceData: {
            createRequest: {
              requestId: Math.random().toString(36).substring(7),
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          },
        },
        conferenceDataVersion: 1,
        sendUpdates: 'all',
      });
 
      if (!response.data.id) return null;
 
      return {
        id: response.data.id,
        url: response.data.htmlLink ?? null,
      };
    } catch (err) {
      this.logger.error('Failed to create Google Calendar event', err);
      return null;
    }
  }

  async deleteEvent(refreshToken: string, eventId: string): Promise<void> {
    try {
      const auth = this.getAuthClient(refreshToken);
      const calendar = google.calendar({ version: 'v3', auth });

      await calendar.events.delete({
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
