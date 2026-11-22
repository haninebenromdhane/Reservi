import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { TimeOffsController } from './time-offs.controller';

import { TimeOffsService } from './time-offs.service';

import { TimeOff, TimeOffSchema } from './schemas/time-off.schema';

import { ProfessionalsModule } from '../professionals/professionals.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TimeOff.name,
        schema: TimeOffSchema,
      },
    ]),
    ProfessionalsModule,
  ],
  controllers: [TimeOffsController],
  providers: [TimeOffsService],
  exports: [TimeOffsService],
})
export class TimeOffsModule {}