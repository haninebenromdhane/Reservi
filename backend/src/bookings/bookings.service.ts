import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';

import {
  Booking,
  BookingDocument,
  BookingStatus,
} from './schemas/booking.schema';

import { CreateBookingDto } from './dto/create-booking.dto';

import {
  Professional,
  ProfessionalDocument,
  ProfessionalStatus,
} from '../professionals/schemas/professional.schema';

import {
  Schedule,
  ScheduleDocument,
} from '../schedules/schemas/schedule.schema';

import {
  TimeOff,
  TimeOffDocument,
} from '../time-offs/schemas/time-off.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,

    @InjectModel(Professional.name)
    private readonly professionalModel: Model<ProfessionalDocument>,

    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,

    @InjectModel(TimeOff.name)
    private readonly timeOffModel: Model<TimeOffDocument>,

    private readonly configService: ConfigService,
  ) {}

  async create(
    clientId: string,
    dto: CreateBookingDto,
  ) {
    this.validateId(
      clientId,
      'Identifiant du client invalide.',
    );

    this.validateId(
      dto.professionalId,
      'Identifiant du professionnel invalide.',
    );

    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException(
        "L'heure de fin doit être après l'heure de début.",
      );
    }

    const professional =
      await this.professionalModel
        .findOne({
          _id: dto.professionalId,
          status:
            ProfessionalStatus.APPROVED,
          isVisible: true,
        })
        .exec();

    if (!professional) {
      throw new NotFoundException(
        'Professionnel introuvable ou non validé.',
      );
    }

    const bookingDate =
      this.parseDateOnly(dto.date);

    const now = new Date();

    if (
      this.atUtc(
        bookingDate,
        this.minutes(dto.startTime),
      ) <= now
    ) {
      throw new BadRequestException(
        'La date du rendez-vous doit être future.',
      );
    }

    const horizonDays =
      Number(
        this.configService.get<string>(
          'BOOKING_HORIZON_DAYS',
          '60',
        ),
      );

    const maxDate =
      new Date(
        now.getTime() +
          horizonDays *
            86400000,
      );

    if (
      this.atUtc(
        bookingDate,
        this.minutes(dto.startTime),
      ) > maxDate
    ) {
      throw new BadRequestException(
        `Une réservation ne peut pas être créée au-delà de ${horizonDays} jours.`,
      );
    }

    const dayOfWeek =
      bookingDate.getUTCDay() === 0
        ? 7
        : bookingDate.getUTCDay();

    const schedule =
      await this.scheduleModel
        .findOne({
          professional:
            professional._id,
          dayOfWeek,
          active: true,
        })
        .exec();

    if (!schedule) {
      throw new BadRequestException(
        'Le professionnel n’est pas disponible ce jour.',
      );
    }

    const start =
      this.minutes(dto.startTime);

    const end =
      this.minutes(dto.endTime);

    const scheduleStart =
      this.minutes(
        schedule.startTime,
      );

    const scheduleEnd =
      this.minutes(
        schedule.endTime,
      );

    const duration =
      dto.serviceDuration ??
      schedule.slotDuration ??
      30;

    const buffer =
      schedule.bufferTime ?? 0;

    if (
      dto.serviceId &&
      !professional.services.some(
        (service) =>
          service._id?.toString() ===
          dto.serviceId,
      )
    ) {
      throw new BadRequestException(
        'Service professionnel introuvable.',
      );
    }

    if (
      start < scheduleStart ||
      end > scheduleEnd
    ) {
      throw new BadRequestException(
        'Le créneau choisi est en dehors des horaires disponibles.',
      );
    }

    if (
      end - start !== duration ||
      (start - scheduleStart) %
        ((schedule.slotDuration ??
          30) +
          buffer) !==
        0
    ) {
      throw new BadRequestException(
        'Le créneau choisi ne correspond pas au planning du professionnel.',
      );
    }

    const dayTimeOffs =
      await this.timeOffModel
        .find({
          professional:
            professional._id,
          date: bookingDate,
        })
        .exec();

    if (
      dayTimeOffs.some(
        (item) =>
          !item.startTime ||
          !item.endTime ||
          (start <
            this.minutes(
              item.endTime,
            ) &&
            end >
              this.minutes(
                item.startTime,
              )),
      )
    ) {
      throw new ConflictException(
        'Ce créneau est indisponible.',
      );
    }

    const existingBookings =
      await this.bookingModel
        .find({
          professional:
            professional._id,

          date: bookingDate,

          status: {
            $in: [
              BookingStatus.PENDING,
              BookingStatus.CONFIRMED,
            ],
          },
        })
        .exec();

    if (
      existingBookings.some(
        (booking) =>
          start <
            this.minutes(
              booking.endTime,
            ) &&
          end >
            this.minutes(
              booking.startTime,
            ),
      )
    ) {
      throw new ConflictException(
        'Ce créneau est déjà réservé.',
      );
    }

    try {
      const saved =
        await this.bookingModel.create({
          client:
            new Types.ObjectId(
              clientId,
            ),

          professional:
            professional._id,

          date: bookingDate,

          startTime:
            dto.startTime,

          endTime:
            dto.endTime,

          reason:
            dto.serviceName?.trim() ||
            dto.reason?.trim(),

          clientNote:
            dto.clientNote?.trim(),

          serviceId:
            dto.serviceId
              ? new Types.ObjectId(
                  dto.serviceId,
                )
              : undefined,

          serviceName:
            dto.serviceName?.trim(),

          servicePrice:
            dto.servicePrice,

          serviceDuration:
            dto.serviceDuration,

          /*
           * Client request starts as PENDING.
           */
          status:
            BookingStatus.PENDING,
        });

      return saved.populate([
        {
          path: 'client',
          select:
            'firstName lastName email phone',
        },
        {
          path: 'professional',
          populate: {
            path: 'profession',
          },
        },
      ]);
    } catch (error) {
      if (
        this.isDuplicateKey(error)
      ) {
        throw new ConflictException(
          'Ce créneau est déjà réservé.',
        );
      }

      throw error;
    }
  }

  /*
   * CLIENT
   *
   * REJECTED bookings are intentionally
   * excluded from the client's list.
   */
  async findMyBookings(
    clientId: string,
  ) {
    this.validateId(
      clientId,
      'Identifiant du client invalide.',
    );

    return this.bookingModel
      .find({
        client: new Types.ObjectId(
          clientId,
        ),

        status: {
          $ne: BookingStatus.REJECTED,
        },
      })

      .populate(
        'professional',
        'displayName city imageUrl rating reviews services',
      )

      .populate({
        path: 'professional',
        populate: {
          path: 'profession',
        },
      })

      .sort({
        date: -1,
        startTime: -1,
      })

      .exec();
  }

  async findOneForClient(
    clientId: string,
    bookingId: string,
  ) {
    this.validateId(
      clientId,
      'Identifiant invalide.',
    );

    this.validateId(
      bookingId,
      'Identifiant invalide.',
    );

    const booking =
      await this.bookingModel
        .findOne({
          _id: new Types.ObjectId(
            bookingId,
          ),
          client: new Types.ObjectId(
            clientId,
          ),

          status: {
            $ne: BookingStatus.REJECTED,
          },
        })

        .populate(
          'professional',
          'displayName city imageUrl rating reviews services',
        )

        .populate({
          path: 'professional',
          populate: {
            path: 'profession',
          },
        })

        .exec();

    if (!booking) {
      throw new NotFoundException(
        'Rendez-vous introuvable.',
      );
    }

    return booking;
  }

  async cancelByClient(
    clientId: string,
    bookingId: string,
  ) {
    this.validateId(
      clientId,
      'Identifiant invalide.',
    );

    this.validateId(
      bookingId,
      'Identifiant invalide.',
    );

    const booking =
      await this.bookingModel
        .findOne({
          _id: bookingId,
          client: clientId,
        })
        .exec();

    if (!booking) {
      throw new NotFoundException(
        'Rendez-vous introuvable.',
      );
    }

    if (
      [
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
        BookingStatus.REJECTED,
        BookingStatus.NO_SHOW,
      ].includes(
        booking.status,
      )
    ) {
      throw new BadRequestException(
        'Ce rendez-vous ne peut plus être annulé.',
      );
    }

    const cancellationHours =
      Number(
        this.configService.get<string>(
          'CANCELLATION_HOURS',
          '24',
        ),
      );

    const appointment =
      this.atUtc(
        booking.date,
        this.minutes(
          booking.startTime,
        ),
      );

    if (
      appointment.getTime() -
        Date.now() <
      cancellationHours *
        3600000
    ) {
      throw new BadRequestException(
        `L'annulation doit être effectuée au moins ${cancellationHours} heures avant le rendez-vous.`,
      );
    }

    booking.status =
      BookingStatus.CANCELLED;

    return booking.save();
  }

  /*
   * PROFESSIONAL
   *
   * Find the professional fiche from
   * the authenticated user's ID.
   */
  async findMyProfessionalBookingsByUser(
    userId: string,
  ) {
    this.validateId(
      userId,
      'Identifiant utilisateur invalide.',
    );

    const professional =
      await this.professionalModel
        .findOne({
          user:
            new Types.ObjectId(
              userId,
            ),
        })
        .exec();

    if (!professional) {
      throw new NotFoundException(
        'Fiche professionnelle introuvable.',
      );
    }

    return this.findMyProfessionalBookings(
      professional._id.toString(),
    );
  }

  async findMyProfessionalBookings(
    professionalId: string,
  ) {
    this.validateId(
      professionalId,
      'Identifiant du professionnel invalide.',
    );

    return this.bookingModel
      .find({
        professional:
          new Types.ObjectId(
            professionalId,
          ),

        /*
         * Rejected requests disappear from
         * the professional's active agenda.
         */
        status: {
          $ne: BookingStatus.REJECTED,
        },
      })

      .populate(
        'client',
        'firstName lastName email phone',
      )

      .sort({
        date: 1,
        startTime: 1,
      })

      .exec();
  }

  async confirmByUser(
    userId: string,
    bookingId: string,
  ) {
    return this.updateStatusByUser(
      userId,
      bookingId,
      BookingStatus.CONFIRMED,
    );
  }

  async rejectByUser(
    userId: string,
    bookingId: string,
  ) {
    return this.updateStatusByUser(
      userId,
      bookingId,
      BookingStatus.REJECTED,
    );
  }

  async completeByUser(
    userId: string,
    bookingId: string,
  ) {
    return this.updateStatusByUser(
      userId,
      bookingId,
      BookingStatus.COMPLETED,
    );
  }

  async noShowByUser(
    userId: string,
    bookingId: string,
  ) {
    return this.updateStatusByUser(
      userId,
      bookingId,
      BookingStatus.NO_SHOW,
    );
  }

  private async updateStatusByUser(
    userId: string,
    bookingId: string,
    status: BookingStatus,
  ) {
    this.validateId(
      userId,
      'Identifiant utilisateur invalide.',
    );

    this.validateId(
      bookingId,
      'Identifiant invalide.',
    );

    const professional =
      await this.professionalModel
        .findOne({
          user:
            new Types.ObjectId(
              userId,
            ),
        })
        .exec();

    if (!professional) {
      throw new NotFoundException(
        'Fiche professionnelle introuvable.',
      );
    }

    const booking =
      await this.bookingModel
        .findOne({
          _id: bookingId,
          professional:
            professional._id,
        })
        .exec();

    if (!booking) {
      throw new NotFoundException(
        'Rendez-vous introuvable.',
      );
    }

    if (
      [
        BookingStatus.CANCELLED,
        BookingStatus.REJECTED,
        BookingStatus.COMPLETED,
        BookingStatus.NO_SHOW,
      ].includes(
        booking.status,
      )
    ) {
      throw new BadRequestException(
        'Ce rendez-vous ne peut plus être modifié.',
      );
    }

    if (
      status ===
        BookingStatus.CONFIRMED &&
      booking.status !==
        BookingStatus.PENDING
    ) {
      throw new BadRequestException(
        'Seul un rendez-vous en attente peut être confirmé.',
      );
    }

    if (
      status ===
        BookingStatus.COMPLETED &&
      booking.status !==
        BookingStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        'Seul un rendez-vous confirmé peut être terminé.',
      );
    }

    if (
      status ===
      BookingStatus.NO_SHOW
    ) {
      if (
        booking.status !==
        BookingStatus.CONFIRMED
      ) {
        throw new BadRequestException(
          'Seul un rendez-vous confirmé peut être marqué comme absent.',
        );
      }

      if (
        this.atUtc(
          booking.date,
          this.minutes(
            booking.endTime,
          ),
        ) > new Date()
      ) {
        throw new BadRequestException(
          'Un rendez-vous ne peut être marqué absent qu’après son heure de fin.',
        );
      }
    }

    booking.status =
      status;

    return booking.save();
  }

  private parseDateOnly(
    value: string,
  ) {
    const match =
      /^(\d{4})-(\d{2})-(\d{2})/.exec(
        value,
      );

    if (!match) {
      throw new BadRequestException(
        'Date de rendez-vous invalide.',
      );
    }

    const date =
      new Date(
        Date.UTC(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
        ),
      );

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      throw new BadRequestException(
        'Date de rendez-vous invalide.',
      );
    }

    return date;
  }

  private minutes(
    value: string,
  ) {
    const [
      hours,
      minutes,
    ] = value
      .split(':')
      .map(Number);

    return (
      hours * 60 +
      minutes
    );
  }

  private atUtc(
    day: Date,
    minutes: number,
  ) {
    const date =
      new Date(day);

    date.setUTCHours(
      Math.floor(
        minutes / 60,
      ),
      minutes % 60,
      0,
      0,
    );

    return date;
  }

  private validateId(
    id: string,
    message: string,
  ) {
    if (
      !Types.ObjectId.isValid(id)
    ) {
      throw new BadRequestException(
        message,
      );
    }
  }

  private isDuplicateKey(
    error: unknown,
  ) {
    return (
      typeof error ===
        'object' &&
      error !== null &&
      'code' in error &&
      (
        error as {
          code?: number;
        }
      ).code === 11000
    );
  }
}