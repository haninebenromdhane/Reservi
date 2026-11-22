import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TimeOffDocument = HydratedDocument<TimeOff>;

@Schema({
  timestamps: true,
})
export class TimeOff {
  @Prop({
    type: Types.ObjectId,
    ref: 'Professional',
    required: true,
  })
  professional: Types.ObjectId;

  @Prop({
    required: true,
  })
  date: Date;

  @Prop({
    trim: true,
  })
  startTime?: string;

  @Prop({
    trim: true,
  })
  endTime?: string;

  @Prop({
    trim: true,
  })
  reason?: string;
}

export const TimeOffSchema = SchemaFactory.createForClass(TimeOff);

TimeOffSchema.index({
  professional: 1,
  date: 1,
});