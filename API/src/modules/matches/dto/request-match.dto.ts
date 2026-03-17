import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { MatchType } from '../match.entity';

export class RequestMatchDto {
  @ApiProperty({ enum: MatchType, example: MatchType.MENTOR })
  @IsEnum(MatchType)
  type: MatchType;

  @ApiPropertyOptional({ example: 'uuid-of-project' })
  @IsOptional()
  @IsUUID()
  projectId?: string;
}
