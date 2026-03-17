import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ProjectStatus } from '../project.entity';

export class CreateProjectDto {
  @ApiProperty({ example: 'EduMatch AI' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'An AI-driven platform that matches tutors with students.',
  })
  @IsString()
  abstract: string;

  @ApiPropertyOptional({ type: [String], example: ['AI', 'Education', 'NLP'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.DRAFT })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
