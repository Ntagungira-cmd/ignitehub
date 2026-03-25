import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { CardPriority } from '../kanban-card.entity';

export class CreateCardDto {
  @ApiProperty({ example: 'Design login UI' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Include OAuth and email/password flows.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: CardPriority, default: CardPriority.MEDIUM })
  @IsOptional()
  @IsEnum(CardPriority)
  priority?: CardPriority;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'uuid-of-assignee' })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional({ example: 0, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
