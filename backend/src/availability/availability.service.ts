import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from '../bookings/schemas/booking.schema';
import {
  Professional,
  ProfessionalDocument,
  ProfessionalStatus,
} from '../professionals/schemas/professional.schema';
import {
  Schedule,
  ScheduleDocument,
} from '../schedules/schemas/schedule.schema';
import { TimeOff, TimeOffDocument } from '../time-offs/schemas/time-off.schema';
import { AvailabilityQueryDto } from './dto/availability-query.dto';

export interface AvailableSlot {
  date: string;
  startTime: string;
  endTime: string;
}

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(Professional.name)
    private readonly professionalModel: Model<ProfessionalDocument>,
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,
    @InjectModel(TimeOff.name)
    private readonly timeOffModel: Model<TimeOffDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
  ) {}

  async getAvailability(
    professionalId: string,
    query: AvailabilityQueryDto,
  ): Promise<AvailableSlot[]> {
    if (!Types.ObjectId.isValid(professionalId))
      throw new BadRequestException('Identifiant professionnel invalide.');
    const professional = await this.professionalModel
      .findOne({
        _id: professionalId,
        status: ProfessionalStatus.APPROVED,
        isVisible: true,
      })
      .select('_id')
      .exec();
    if (!professional)
      throw new NotFoundException(
        'Professionnel introuvable ou non disponible.',
      );

    const from = this.parseDateOnly(query.from);
    const to = this.parseDateOnly(query.to);
    if (to < from)
      throw new BadRequestException(
        'La date de fin doit être postérieure ou égale à la date de début.',
      );
    const days = Math.floor((to.getTime() - from.getTime()) / 86400000) + 1;
    if (days > 60)
      throw new BadRequestException(
        'La période de disponibilité ne peut pas dépasser 60 jours.',
      );

    const periodEnd = new Date(to.getTime() + 86400000);
    const [schedules, timeOffs, bookings] = await Promise.all([
      this.scheduleModel
        .find({ professional: professional._id, active: true })
        .exec(),
      this.timeOffModel
        .find({
          professional: professional._id,
          date: { $gte: from, $lt: periodEnd },
        })
        .exec(),
      this.bookingModel
        .find({
          professional: professional._id,
          date: { $gte: from, $lt: periodEnd },
          status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        })
        .exec(),
    ]);

    const slots: AvailableSlot[] = [];
    const now = new Date();
    const scheduleByDay = new Map<number, ScheduleDocument>();
    for (const schedule of schedules)
      scheduleByDay.set(schedule.dayOfWeek, schedule);

    for (
      let day = new Date(from);
      day < periodEnd;
      day = new Date(day.getTime() + 86400000)
    ) {
      const dayOfWeek = day.getUTCDay() === 0 ? 7 : day.getUTCDay();
      const schedule = scheduleByDay.get(dayOfWeek);
      if (!schedule) continue;

      const duration = query.duration ?? schedule.slotDuration ?? 30;
      const step = schedule.slotDuration ?? 30;
      const buffer = schedule.bufferTime ?? 0;
      const scheduleStart = this.minutes(schedule.startTime);
      const scheduleEnd = this.minutes(schedule.endTime);
      if (scheduleEnd <= scheduleStart || duration <= 0) continue;

      const dayKey = this.dateKey(day);
      const dayTimeOffs = timeOffs.filter(
        (item) => this.dateKey(item.date) === dayKey,
      );
      const dayBookings = bookings.filter(
        (item) => this.dateKey(item.date) === dayKey,
      );

      for (
        let start = scheduleStart;
        start + duration <= scheduleEnd;
        start += step + buffer
      ) {
        const end = start + duration;
        const startTime = this.formatMinutes(start);
        const endTime = this.formatMinutes(end);
        const slotStart = this.atUtc(day, start);
        if (slotStart <= now) continue;

        const unavailable = dayTimeOffs.some((item) => {
          if (!item.startTime || !item.endTime) return true;
          return (
            start < this.minutes(item.endTime) &&
            end > this.minutes(item.startTime)
          );
        });
        if (unavailable) continue;

        const booked = dayBookings.some(
          (item) =>
            start < this.minutes(item.endTime) &&
            end > this.minutes(item.startTime),
        );
        if (!booked) slots.push({ date: dayKey, startTime, endTime });
      }
    }
    return slots;
  }

  private parseDateOnly(value: string): Date {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!match) throw new BadRequestException('Date invalide.');
    const date = new Date(
      Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
    );
    if (Number.isNaN(date.getTime()))
      throw new BadRequestException('Date invalide.');
    return date;
  }

  private dateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private minutes(value: string): number {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (!match) return -1;
    return Number(match[1]) * 60 + Number(match[2]);
  }

  private formatMinutes(value: number): string {
    return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  }

  private atUtc(day: Date, minutes: number): Date {
    const result = new Date(day);
    result.setUTCHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return result;
  }
}