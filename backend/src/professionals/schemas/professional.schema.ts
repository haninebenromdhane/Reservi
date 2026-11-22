import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Profession } from '../../professions/schemas/profession.schema';

export type ProfessionalDocument = HydratedDocument<Professional>;

export enum ProfessionalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ _id: true })
export class ProfessionalService {
  _id?: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
    minlength: 2,
  })
  name: string;

  @Prop({
    required: true,
    min: 1,
  })
  duration: number;

  @Prop({
    required: true,
    min: 0,
  })
  price: number;

  @Prop({
    default: 'DT',
    trim: true,
  })
  currency: string;
}

export const ProfessionalServiceSchema =
  SchemaFactory.createForClass(ProfessionalService);

@Schema({ _id: true })
export class ProfessionalDocumentFile {
  _id?: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    trim: true,
  })
  url: string;

  @Prop({
    required: true,
    trim: true,
  })
  mimeType: string;

  @Prop({
    required: true,
    min: 0,
  })
  size: number;

  @Prop({
    default: Date.now,
  })
  uploadedAt: Date;
}

export const ProfessionalDocumentFileSchema =
  SchemaFactory.createForClass(ProfessionalDocumentFile);

@Schema({ timestamps: true })
export class Professional {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    required: true,
    unique: true,
    index: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Profession.name,
    required: true,
    index: true,
  })
  profession: Types.ObjectId;

  @Prop({
    required: true,
    trim: true,
  })
  displayName: string;

  @Prop({
    required: true,
    trim: true,
  })
  city: string;

  @Prop({
    trim: true,
  })
  address?: string;

  @Prop({
    trim: true,
  })
  phone?: string;

  @Prop({
    trim: true,
  })
  description?: string;

  /*
   * Numéro de licence professionnelle.
   * Il est utilisé lors de l'inscription et dans
   * "Ma fiche" / "Modifier mon profil".
   */
  @Prop({
    trim: true,
  })
  licenseNumber?: string;

  @Prop({
    trim: true,
  })
  imageUrl?: string;

  @Prop({
    enum: ProfessionalStatus,
    default: ProfessionalStatus.PENDING,
    index: true,
  })
  status: ProfessionalStatus;

  @Prop({
    default: 0,
  })
  rating: number;

  @Prop({
    default: 0,
  })
  reviews: number;

  /*
   * Un agent nouvellement inscrit ne doit pas être
   * visible avant validation administrative.
   */
  @Prop({
    default: false,
    index: true,
  })
  isVisible: boolean;

  @Prop({
    trim: true,
  })
  rejectionReason?: string;

  /*
   * Services proposés par le professionnel.
   */
  @Prop({
    type: [ProfessionalServiceSchema],
    default: [],
  })
  services: ProfessionalService[];

  /*
   * Documents justificatifs envoyés lors de l'inscription
   * ou ajoutés ensuite depuis le profil professionnel.
   */
  @Prop({
    type: [ProfessionalDocumentFileSchema],
    default: [],
  })
  documents: ProfessionalDocumentFile[];
}

export const ProfessionalSchema =
  SchemaFactory.createForClass(Professional);