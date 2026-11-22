import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsMilitaryTime,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import { DayOfWeek } from '../schemas/schedule.schema';

export class CreateScheduleDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsMilitaryTime()
  startTime: string;

  @IsMilitaryTime()
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