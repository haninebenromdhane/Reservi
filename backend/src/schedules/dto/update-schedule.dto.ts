import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

import { DayOfWeek } from '../schemas/schedule.schema';

export class UpdateScheduleDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'startTime doit être au format HH:mm.',
  })
  startTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'endTime doit être au format HH:mm.',
  })
  endTime: string;

  @IsBoolean()
  active: boolean;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(60)
  slotDuration?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(120)
  bufferTime?: number;
}