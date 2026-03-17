import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MatchStatus } from '../match.entity';

export class UpdateMatchStatusDto {
  @ApiProperty({ enum: [MatchStatus.ACCEPTED, MatchStatus.REJECTED] })
  @IsEnum(MatchStatus)
  status: MatchStatus.ACCEPTED | MatchStatus.REJECTED;
}
