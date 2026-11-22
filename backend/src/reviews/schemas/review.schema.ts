import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument, Types } from 'mongoose';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({
  timestamps: true,
})
export class Review {
  @Prop({
    type: Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true,
  })
  booking: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  client: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Professional',
    required: true,
  })
  professional: Types.ObjectId;

  @Prop({
    required: true,
    min: 1,
    max: 5,
  })
  rating: number;

  @Prop({
    required: true,
    trim: true,
  })
  comment: string;

  /*
   * Un avis doit être validé (publié) par un administrateur
   * avant d'être visible sur la plateforme.
   */
  @Prop({
    default: false,
  })
  visible: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({
  professional: 1,
  createdAt: -1,
});