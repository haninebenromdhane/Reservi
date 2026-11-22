import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReclamationStatus } from '../schemas/reclamation.schema';

export class UpdateReclamationDto {
  @ApiProperty({ enum: ReclamationStatus })
  @IsEnum(ReclamationStatus)
  status: ReclamationStatus;

  @ApiPropertyOptional({ example: 'Votre demande a été traitée.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminResponse?: string;
}