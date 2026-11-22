import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class UpdateProfessionalDto {
  @ApiPropertyOptional({
    example: 'Dr. Ahmed Ben Ali',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  displayName?: string;

  @ApiPropertyOptional({
    example: 'Sousse',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  city?: string;

  @ApiPropertyOptional({
    example: '12 Rue de la République, Sousse',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: '22123456',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: 'Médecin généraliste avec 10 ans d’expérience.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/photo.jpg',
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'MED-2026-12345',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  licenseNumber?: string;

  @ApiPropertyOptional({
    example: true,
    description:
      'Permet à l’agent de désactiver temporairement sa visibilité.',
  })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}