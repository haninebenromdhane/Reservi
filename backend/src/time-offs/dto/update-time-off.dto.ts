import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateTimeOffDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "L'heure doit être au format HH:mm.",
  })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: "L'heure doit être au format HH:mm.",
  })
  endTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}