import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

export enum AuditLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  actor?: Types.ObjectId;
  
  @Prop({ trim: true })
  actorLabel?: string;

  @Prop({ trim: true })
  actorRole?: string;

  @Prop({ required: true, trim: true, index: true })
  action: string;

  @Prop({ trim: true })
  targetType?: string;

  @Prop({ trim: true })
  targetId?: string;

  @Prop({ trim: true })
  details?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  @Prop({ enum: AuditLevel, default: AuditLevel.INFO, index: true })
  level: AuditLevel;

  @Prop({ trim: true })
  ip?: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ createdAt: -1 });
