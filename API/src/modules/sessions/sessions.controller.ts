import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../users/user.entity';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Propose a new mentorship session (Student only)' })
  @ApiResponse({ status: 201, description: 'Session proposal created' })
  create(@CurrentUser() user: User, @Body() dto: CreateSessionDto) {
    return this.sessionsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List upcoming sessions for the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'Session list' })
  findAll(@CurrentUser() user: User) {
    return this.sessionsService.findAll(user.id);
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Get session details by ID' })
  @ApiResponse({ status: 200, description: 'Session details' })
  findOne(@Param('sessionId', ParseUUIDPipe) sessionId: string) {
    return this.sessionsService.findOne(sessionId);
  }

  @Patch(':sessionId/confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({
    summary: 'Confirm a session and create Google Calendar event (Mentor only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Session confirmed, calendar event created',
  })
  @ApiResponse({ status: 403, description: 'Not the assigned mentor' })
  confirm(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser() user: User,
  ) {
    return this.sessionsService.confirm(sessionId, user.id);
  }

  @Patch(':sessionId/cancel')
  @ApiOperation({ summary: 'Cancel a session (either participant)' })
  @ApiResponse({ status: 200, description: 'Session cancelled' })
  @ApiResponse({ status: 403, description: 'Not a participant' })
  cancel(
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @CurrentUser() user: User,
  ) {
    return this.sessionsService.cancel(sessionId, user.id);
  }
}
