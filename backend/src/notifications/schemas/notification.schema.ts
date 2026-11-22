import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  user: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({ default: false, index: true })
  read: boolean;

  @Prop({ trim: true })
  type?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ user: 1, createdAt: -1 });
