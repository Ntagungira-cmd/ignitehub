import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ResourceCategory } from '../resource.entity';

export class CreateResourceDto {
  @ApiProperty({ example: 'NestJS Starter Template' })
  @IsString()
  title: string;

  @ApiProperty({ enum: ResourceCategory, example: ResourceCategory.TEMPLATE })
  @IsEnum(ResourceCategory)
  category: ResourceCategory;

  @ApiPropertyOptional({ example: 'A production-ready NestJS boilerplate.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['NestJS', 'TypeScript', 'Backend'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
