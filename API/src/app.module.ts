import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { MatchesModule } from './modules/matches/matches.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SeedsModule } from './modules/seeds/seeds.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USER', 'ignitehub'),
        password: config.get<string>('DB_PASSWORD', 'ignitehub_secret'),
        database: config.get<string>('DB_NAME', 'ignitehub_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('DB_LOGGING') === 'true',
      }),
    }),

    // ── Feature Modules ───────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    ProjectsModule,
    WorkspaceModule,
    MatchesModule,
    SessionsModule,
    ResourcesModule,
    NotificationsModule,
    SeedsModule,
  ],
})
export class AppModule {}
