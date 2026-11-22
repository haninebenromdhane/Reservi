import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectProfessionalDto {
  @ApiPropertyOptional({ example: 'Documents professionnels incomplets.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}