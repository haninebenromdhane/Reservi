import { IsEmail, IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RegisterClientDto {
  @ApiProperty({
    example: 'Hanine',
    description: 'Prénom du client',
  })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({
    example: 'Ben Romdhane',
    description: 'Nom du client',
  })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({
    example: 'client@example.com',
    description: 'Adresse email du client',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Test1234!',
    description: 'Mot de passe du client',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
