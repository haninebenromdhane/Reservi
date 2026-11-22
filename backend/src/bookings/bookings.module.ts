import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

import {
  Booking,
  BookingSchema,
} from './schemas/booking.schema';

import {
  Professional,
  ProfessionalSchema,
} from '../professionals/schemas/professional.schema';

import {
  Schedule,
  ScheduleSchema,
} from '../schedules/schemas/schedule.schema';

import {
  TimeOff,
  TimeOffSchema,
} from '../time-offs/schemas/time-off.schema';

import { ProfessionalsModule } from '../professionals/professionals.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Booking.name,
        schema: BookingSchema,
      },
      {
        name: Professional.name,
        schema: ProfessionalSchema,
      },
      {
        name: Schedule.name,
        schema: ScheduleSchema,
      },
      {
        name: TimeOff.name,
        schema: TimeOffSchema,
      },
    ]),

    ProfessionalsModule,
  ],

  controllers: [
    BookingsController,
  ],

  providers: [
    BookingsService,
  ],

  exports: [
    BookingsService,
  ],
})
export class BookingsModule {}