import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument } from 'mongoose';

export type ProfessionDocument = HydratedDocument<Profession>;

@Schema({
  timestamps: true,
})
export class Profession {
  @Prop({
    required: true,
    unique: true,
    trim: true,
  })
  name: string;

  @Prop({
    trim: true,
  })
  description?: string;

  @Prop({
    trim: true,
  })
  icon?: string;

  @Prop({ default: true, index: true })
  active: boolean;
}

export const ProfessionSchema = SchemaFactory.createForClass(Profession);