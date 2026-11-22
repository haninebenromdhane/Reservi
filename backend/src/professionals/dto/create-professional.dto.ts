import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateProfessionalDto {
  @ApiProperty({
    example: '66d123456789abcdef123456',
    description: 'ID de la profession sélectionnée',
  })
  @IsMongoId()
  professionId: string;

  @ApiProperty({
    example: 'Dr. Ahmed Ben Ali',
    description: 'Nom affiché sur la fiche professionnelle',
  })
  @IsString()
  @MinLength(2)
  displayName: string;

  @ApiProperty({
    example: 'TN-MED-123456',
    description: 'Numéro professionnel / numéro de licence',
  })
  @IsString()
  @MinLength(2)
  licenseNumber: string;

  @ApiProperty({
    example: 'Sousse',
    description: 'Ville d’exercice',
  })
  @IsString()
  @MinLength(2)
  city: string;

  @ApiPropertyOptional({
    example: 'Avenue Habib Bourguiba',
    description: 'Adresse professionnelle',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    example: '22123456',
    description: 'Téléphone professionnel',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example:
      "Médecin généraliste avec plusieurs années d'expérience.",
    description: 'Description / biographie professionnelle',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'URL de la photo professionnelle',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}