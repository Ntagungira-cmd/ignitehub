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
import { MatchesService } from './matches.service';
import { RequestMatchDto } from './dto/request-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';

@ApiTags('Matches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('recommendations')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Get mentor recommendations based on project tags (Student only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Sorted list of mentor recommendations with Jaccard scores',
  })
  getRecommendations(@CurrentUser() user: User) {
    return this.matchesService.getRecommendations(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all matches for the current user' })
  @ApiResponse({ status: 200, description: 'Match list' })
  getMyMatches(@CurrentUser() user: User) {
    return this.matchesService.getMyMatches(user.id);
  }

  @Post('request/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Send a mentorship/collaboration request (Student only)',
  })
  @ApiResponse({ status: 201, description: 'Match request created' })
  requestMatch(
    @CurrentUser() user: User,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @Body() dto: RequestMatchDto,
  ) {
    return this.matchesService.requestMatch(user.id, targetUserId, dto);
  }

  @Patch(':matchId/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiOperation({ summary: 'Accept or reject a match request (Mentor only)' })
  @ApiResponse({ status: 200, description: 'Match status updated' })
  @ApiResponse({ status: 403, description: 'Not the matched user' })
  updateStatus(
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateMatchStatusDto,
  ) {
    return this.matchesService.updateStatus(matchId, user.id, dto);
  }
}
