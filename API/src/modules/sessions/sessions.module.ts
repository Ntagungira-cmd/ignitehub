import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { MentorshipSession } from './session.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { GoogleCalendarService } from './google-calendar.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MentorshipSession]),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [SessionsController],
  providers: [SessionsService, GoogleCalendarService],
  exports: [SessionsService],
})
export class SessionsModule {}
