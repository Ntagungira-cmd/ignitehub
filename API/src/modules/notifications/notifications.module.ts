import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { MentorshipSession } from '../sessions/session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MentorshipSession])],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
