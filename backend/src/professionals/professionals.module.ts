import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { ProfessionalsController } from './professionals.controller';

import { ProfessionalsService } from './professionals.service';

import {
  Professional,
  ProfessionalSchema,
} from './schemas/professional.schema';

import {
  Profession,
  ProfessionSchema,
} from '../professions/schemas/profession.schema';

import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Professional.name,
        schema: ProfessionalSchema,
      },

      {
        name: Profession.name,
        schema: ProfessionSchema,
      },

      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],

  controllers: [ProfessionalsController],

  providers: [ProfessionalsService],

  exports: [ProfessionalsService],
})
export class ProfessionalsModule {}
