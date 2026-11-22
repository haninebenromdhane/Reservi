import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { Profession, ProfessionSchema } from './schemas/profession.schema';

import { ProfessionsController } from './professions.controller';

import { ProfessionsService } from './professions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Profession.name,
        schema: ProfessionSchema,
      },
    ]),
  ],

  controllers: [ProfessionsController],

  providers: [ProfessionsService],

  exports: [MongooseModule, ProfessionsService],
})
export class ProfessionsModule {}
