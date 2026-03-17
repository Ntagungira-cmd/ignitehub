import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({ example: 'In Review' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 3, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
