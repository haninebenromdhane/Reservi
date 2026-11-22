import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterAgentDto {
  @ApiProperty({
    example: 'Ahmed',
  })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({
    example: 'Ben Ali',
  })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({
    example: 'ahmed@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    example: '22123456',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: '66d123456789abcdef123456',
    description: 'Identifiant MongoDB de la profession choisie.',
  })
  @IsMongoId()
  professionId: string;

  @ApiProperty({
    example: 'Sousse',
  })
  @IsString()
  @MinLength(2)
  city: string;

  @ApiPropertyOptional({
    example: 'Dr. Ahmed Ben Ali',
  })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional({
    example: '12 Rue de la République, Sousse',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: 'Médecin généraliste avec 10 ans d’expérience.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'MED-2026-12345',
    description:
      'Numéro professionnel ou numéro de licence de l’agent.',
  })
  @IsString()
  @MinLength(2)
  licenseNumber: string;
}