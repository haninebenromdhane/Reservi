import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminModule } from './admin/admin.module';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { AvailabilityModule } from './availability/availability.module';
import { BookingsModule } from './bookings/bookings.module';
import { MailModule } from './mail/mail.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { ProfessionsModule } from './professions/professions.module';
import { ReclamationsModule } from './reclamations/reclamations.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SchedulesModule } from './schedules/schedules.module';
import { TimeOffsModule } from './time-offs/time-offs.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI') ??
          'mongodb://127.0.0.1:27017/reservi',
      }),
    }),
    MailModule,
    UsersModule,
    AuthModule,
    ProfessionsModule,
    ProfessionalsModule,
    SchedulesModule,
    TimeOffsModule,
    BookingsModule,
    ReviewsModule,
    AvailabilityModule,
    AdminModule,
    AuditModule,
    ReclamationsModule,
    NotificationsModule,
  ],
})
export class AppModule {}