import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ example: 'uuid-of-mentor' })
  @IsUUID()
  mentorId: string;

  @ApiProperty({ example: '2026-04-15T10:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  scheduledAt: Date;

  @ApiPropertyOptional({ example: 60, minimum: 15 })
  @IsOptional()
  @IsInt()
  @Min(15)
  durationMinutes?: number;

  @ApiPropertyOptional({ example: 'uuid-of-project' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiPropertyOptional({
    example: 'I need help with my NLP pipeline architecture.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
