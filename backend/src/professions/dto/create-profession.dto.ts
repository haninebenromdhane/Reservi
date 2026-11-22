import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProfessionDto {
  @ApiProperty({
    example: 'Médecin',
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example:
      'Professionnels de santé spécialisés dans le diagnostic et le traitement.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'doctor',
    required: false,
  })
  @IsOptional()
  @IsString()
  icon?: string;
}
