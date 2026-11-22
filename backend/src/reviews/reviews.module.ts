import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { ReviewsController } from './reviews.controller';

import { ReviewsService } from './reviews.service';

import { Review, ReviewSchema } from './schemas/review.schema';

import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';

import {
  Professional,
  ProfessionalSchema,
} from '../professionals/schemas/professional.schema';

import { ProfessionalsModule } from '../professionals/professionals.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Review.name,
        schema: ReviewSchema,
      },
      {
        name: Booking.name,
        schema: BookingSchema,
      },
      {
        name: Professional.name,
        schema: ProfessionalSchema,
      },
    ]),
    ProfessionalsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}