import { IsEmail, IsString, MinLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'client@example.com',
    description: 'Adresse email du compte',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Test1234!',
    description: 'Mot de passe du compte',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
