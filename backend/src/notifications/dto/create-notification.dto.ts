import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  title: string;

  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  message: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;
}