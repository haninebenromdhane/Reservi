import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import {
  Professional,
  ProfessionalSchema,
} from '../professionals/schemas/professional.schema';
import { ProfessionalsModule } from '../professionals/professionals.module';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import {
  Reclamation,
  ReclamationSchema,
} from '../reclamations/schemas/reclamation.schema';
import { AuditModule } from '../audit/audit.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Professional.name, schema: ProfessionalSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Reclamation.name, schema: ReclamationSchema },
    ]),
    ProfessionalsModule,
    UsersModule,
    AuditModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}