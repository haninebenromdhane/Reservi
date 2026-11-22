import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Schedule, ScheduleSchema } from './schemas/schedule.schema';

import { SchedulesService } from './schedules.service';

import { SchedulesController } from './schedules.controller';

import { ProfessionalsModule } from '../professionals/professionals.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Schedule.name,
        schema: ScheduleSchema,
      },
    ]),

    ProfessionalsModule,
  ],

  controllers: [SchedulesController],

  providers: [SchedulesService],

  exports: [SchedulesService],
})
export class SchedulesModule {}
