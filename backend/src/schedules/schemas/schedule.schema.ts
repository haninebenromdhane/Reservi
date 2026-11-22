import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { Professional } from '../../professionals/schemas/professional.schema';

export type ScheduleDocument = HydratedDocument<Schedule>;

export enum DayOfWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

@Schema({
  timestamps: true,
})
export class Schedule {
  @Prop({
    type: Types.ObjectId,
    ref: Professional.name,
    required: true,
  })
  professional: Types.ObjectId;

  @Prop({
    required: true,
    enum: DayOfWeek,
  })
  dayOfWeek: DayOfWeek;

  @Prop({
    required: true,
    trim: true,
  })
  startTime: string;

  @Prop({
    required: true,
    trim: true,
  })
  endTime: string;

  @Prop({ default: true })
  active: boolean;

  @Prop({ default: 30, min: 15 })
  slotDuration: number;

  @Prop({ default: 0, min: 0 })
  bufferTime: number;
}

export const ScheduleSchema = SchemaFactory.createForClass(Schedule);

ScheduleSchema.index(
  {
    professional: 1,
    dayOfWeek: 1,
  },
  {
    unique: true,
  },
);