import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { Review, ReviewDocument } from './schemas/review.schema';

import { CreateReviewDto } from './dto/create-review.dto';

import {
  Booking,
  BookingDocument,
  BookingStatus,
} from '../bookings/schemas/booking.schema';

import {
  Professional,
  ProfessionalDocument,
} from '../professionals/schemas/professional.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,

    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,

    @InjectModel(Professional.name)
    private readonly professionalModel: Model<ProfessionalDocument>,
  ) {}

  async create(clientId: string, bookingId: string, dto: CreateReviewDto) {
    if (
      !Types.ObjectId.isValid(clientId) ||
      !Types.ObjectId.isValid(bookingId)
    ) {
      throw new BadRequestException('Identifiant invalide.');
    }

    const booking = await this.bookingModel
      .findOne({
        _id: new Types.ObjectId(bookingId),
        client: new Types.ObjectId(clientId),
      })
      .exec();

    if (!booking) {
      throw new NotFoundException('Rendez-vous introuvable.');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'Vous pouvez laisser un avis uniquement après un rendez-vous terminé.',
      );
    }

    const existing = await this.reviewModel
      .findOne({
        booking: booking._id,
      })
      .exec();

    if (existing) {
      throw new ConflictException(
        'Vous avez déjà laissé un avis pour ce rendez-vous.',
      );
    }

    const review = new this.reviewModel({
      booking: booking._id,
      client: new Types.ObjectId(clientId),
      professional: booking.professional,
      rating: dto.rating,
      comment: dto.comment,
      /*
       * En attente de modération : l'avis n'apparaît sur la
       * plateforme qu'une fois publié par un administrateur.
       */
      visible: false,
    });

    const savedReview = await review.save();

    await this.updateProfessionalRating(booking.professional.toString());

    return savedReview.populate([
      {
        path: 'client',
        select: 'firstName lastName',
      },
      {
        path: 'professional',
        populate: {
          path: 'profession',
        },
      },
    ]);
  }

  async findForProfessional(professionalId: string) {
    this.validateId(professionalId);

    return this.reviewModel
      .find({
        professional: new Types.ObjectId(professionalId),
        visible: true,
      })
      .populate('client', 'firstName lastName avatarUrl')
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  async findForClient(clientId: string) {
    this.validateId(clientId);

    return this.reviewModel
      .find({
        client: new Types.ObjectId(clientId),
      })
      .populate('professional', 'displayName city imageUrl')
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  async findOne(id: string) {
    this.validateId(id);

    const review = await this.reviewModel
      .findOne({
        _id: new Types.ObjectId(id),
        visible: true,
      })
      .populate('client', 'firstName lastName avatarUrl')
      .populate({
        path: 'professional',
        populate: {
          path: 'profession',
        },
      })
      .exec();

    if (!review) {
      throw new NotFoundException('Avis introuvable.');
    }

    return review;
  }

  private async updateProfessionalRating(professionalId: string) {
    const objectId = new Types.ObjectId(professionalId);

    const result = (await this.reviewModel
      .aggregate([
        {
          $match: {
            professional: objectId,
            visible: true,
          },
        },
        {
          $group: {
            _id: '$professional',
            averageRating: {
              $avg: '$rating',
            },
            totalReviews: {
              $sum: 1,
            },
          },
        },
      ])
      .exec()) as Array<{ averageRating: number; totalReviews: number }>;

    const averageRating =
      result.length > 0
        ? Number(Number(result[0].averageRating).toFixed(1))
        : 0;

    const totalReviews = result.length > 0 ? Number(result[0].totalReviews) : 0;

    await this.professionalModel
      .findByIdAndUpdate(objectId, {
        rating: averageRating,
        reviews: totalReviews,
      })
      .exec();
  }

  private validateId(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant invalide.');
    }
  }
}