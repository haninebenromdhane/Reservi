import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  CLIENT = 'CLIENT',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Schema({ timestamps: true })
export class User {
  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true, minlength: 8, select: false })
  password: string;

  @Prop({ required: true, enum: UserRole, index: true })
  role: UserRole;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ trim: true })
  phone?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({
    required: true,
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    index: true,
  })
  status: UserStatus;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ select: false })
  passwordResetTokenHash?: string;

  @Prop({ select: false })
  passwordResetExpiresAt?: Date;

  /*
   * Changement de mot de passe depuis l'espace personnel (utilisateur
   * connecté) : le nouveau mot de passe n'est appliqué qu'après
   * confirmation du lien reçu par e-mail. `pendingPasswordHash`
   * stocke le hash du futur mot de passe en attente de confirmation.
   */
  @Prop({ select: false })
  passwordChangeTokenHash?: string;

  @Prop({ select: false })
  passwordChangeExpiresAt?: Date;

  @Prop({ select: false })
  pendingPasswordHash?: string;

  @Prop({ default: false, index: true })
  deleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);