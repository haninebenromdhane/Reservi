import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfessionDto {
  @ApiPropertyOptional({ example: 'Médecin' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional({ example: 'Profession médicale' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'stethoscope' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

