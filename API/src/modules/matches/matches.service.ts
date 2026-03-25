import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match, MatchStatus } from './match.entity';
import { ProjectsService } from '../projects/projects.service';
import { NotificationsService } from '../notifications/notifications.service';
import { User, UserRole } from '../users/user.entity';
import { RequestMatchDto } from './dto/request-match.dto';
import { UpdateMatchStatusDto } from './dto/update-match-status.dto';

export interface MatchRecommendation {
  mentor: User;
  score: number;
  matchingTags: string[];
}

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepo: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly projectsService: ProjectsService,
    private readonly notificationsService: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  async getRecommendations(studentId: string): Promise<MatchRecommendation[]> {
    const threshold = this.config.get<number>('MATCH_SCORE_THRESHOLD', 0.1);

    const studentProjects = await this.projectsService.findByOwner(studentId);
    const allProjectTags = [
      ...new Set(studentProjects.flatMap((p) => p.tags ?? [])),
    ];

    const mentors = await this.userRepo.find({
      where: { role: UserRole.MENTOR, isActive: true },
    });

    const existingMatches = await this.matchRepo.find({
      where: { studentId },
    });
    const matchedUserIds = new Set(existingMatches.map((m) => m.matchedUserId));

    const recommendations: MatchRecommendation[] = mentors
      .filter((m) => !matchedUserIds.has(m.id) && m.id !== studentId)
      .map((mentor) => {
        const mentorSkills = mentor.skills ?? [];
        const { score, intersection } = this.jaccard(
          allProjectTags,
          mentorSkills,
        );
        return { mentor, score, matchingTags: intersection };
      })
      .filter((r) => r.score >= threshold)
      .sort((a, b) => b.score - a.score);

    return recommendations;
  }

  async requestMatch(
    studentId: string,
    targetUserId: string,
    dto: RequestMatchDto,
  ): Promise<Match> {
    if (studentId === targetUserId) {
      throw new BadRequestException('Cannot send a match request to yourself');
    }

    const target = await this.userRepo.findOne({ where: { id: targetUserId } });
    if (!target) throw new NotFoundException(`User ${targetUserId} not found`);

    const student = await this.userRepo.findOne({ where: { id: studentId } });

    let matchingTags: string[] = [];
    let score = 0;

    if (dto.projectId) {
      const project = await this.projectsService.findOne(dto.projectId);
      const { intersection, score: s } = this.jaccard(
        project.tags ?? [],
        target.skills ?? [],
      );
      matchingTags = intersection;
      score = s;
    }

    const match = this.matchRepo.create({
      studentId,
      matchedUserId: targetUserId,
      type: dto.type,
      status: MatchStatus.PENDING,
      score,
      matchingTags,
      projectId: dto.projectId,
    });
    const saved = await this.matchRepo.save(match);

    if (target.email) {
      await this.notificationsService
        .sendMatchAlert(target.email, student?.fullName ?? 'A student')
        .catch(() => null);
    }

    return saved;
  }

  async updateStatus(
    matchId: string,
    userId: string,
    dto: UpdateMatchStatusDto,
  ): Promise<Match> {
    const match = await this.matchRepo.findOne({
      where: { id: matchId },
      relations: ['student', 'matchedUser'],
    });
    if (!match) throw new NotFoundException(`Match ${matchId} not found`);

    if (match.matchedUserId !== userId) {
      throw new ForbiddenException(
        'Only the matched user can accept or reject this request',
      );
    }

    if (match.status !== MatchStatus.PENDING) {
      throw new BadRequestException(
        'This match request has already been resolved',
      );
    }

    match.status = dto.status;
    const saved = await this.matchRepo.save(match);

    if (
      dto.status === MatchStatus.ACCEPTED &&
      match.student?.email &&
      match.matchedUser
    ) {
      await this.notificationsService
        .sendMatchAccepted(match.student.email, match.matchedUser.fullName)
        .catch(() => null);
    }

    return saved;
  }

  async getMyMatches(userId: string): Promise<Match[]> {
    return this.matchRepo.find({
      where: [{ studentId: userId }, { matchedUserId: userId }],
      relations: ['student', 'matchedUser'],
      order: { createdAt: 'DESC' },
    });
  }

  private jaccard(
    setA: string[],
    setB: string[],
  ): { score: number; intersection: string[] } {
    const a = new Set(setA.map((s) => s.toLowerCase().trim()));
    const b = new Set(setB.map((s) => s.toLowerCase().trim()));

    const intersection = [...a].filter((item) => b.has(item));
    const union = new Set([...a, ...b]);

    const score = union.size === 0 ? 0 : intersection.length / union.size;
    return { score, intersection };
  }
}
