import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BookingDocument = HydratedDocument<Booking>;

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

@Schema({
  timestamps: true,
})
export class Booking {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  client: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Professional',
    required: true,
    index: true,
  })
  professional: Types.ObjectId;

  @Prop({
    required: true,
    type: Date,
    index: true,
  })
  date: Date;

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

  @Prop({
    trim: true,
  })
  reason?: string;

  @Prop({
    trim: true,
  })
  clientNote?: string;

  @Prop({
    type: Types.ObjectId,
    required: false,
  })
  serviceId?: Types.ObjectId;

  @Prop({
    trim: true,
    required: false,
  })
  serviceName?: string;

  @Prop({
    type: Number,
    min: 0,
    required: false,
  })
  servicePrice?: number;

  @Prop({
    type: Number,
    min: 1,
    required: false,
  })
  serviceDuration?: number;

  @Prop({
    enum: BookingStatus,
    default: BookingStatus.PENDING,
    index: true,
  })
  status: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

/*
 * Prevent double booking for active reservations.
 *
 * A professional cannot have two PENDING/CONFIRMED
 * reservations at the exact same date/time.
 */
BookingSchema.index(
  {
    professional: 1,
    date: 1,
    startTime: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: [
          BookingStatus.PENDING,
          BookingStatus.CONFIRMED,
        ],
      },
    },
  },
);

/*
 * Useful indexes for "Mes rendez-vous"
 * and professional agenda queries.
 */
BookingSchema.index({
  client: 1,
  date: -1,
});

BookingSchema.index({
  professional: 1,
  date: 1,
});