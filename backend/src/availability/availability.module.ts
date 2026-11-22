import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import {
  Professional,
  ProfessionalSchema,
} from '../professionals/schemas/professional.schema';
import { Schedule, ScheduleSchema } from '../schedules/schemas/schedule.schema';
import { TimeOff, TimeOffSchema } from '../time-offs/schemas/time-off.schema';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Professional.name, schema: ProfessionalSchema },
      { name: Schedule.name, schema: ScheduleSchema },
      { name: TimeOff.name, schema: TimeOffSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}