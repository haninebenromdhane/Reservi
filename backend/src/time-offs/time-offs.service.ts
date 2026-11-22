import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { TimeOff, TimeOffDocument } from './schemas/time-off.schema';

import { CreateTimeOffDto } from './dto/create-time-off.dto';

import { UpdateTimeOffDto } from './dto/update-time-off.dto';

@Injectable()
export class TimeOffsService {
  constructor(
    @InjectModel(TimeOff.name)
    private readonly timeOffModel: Model<TimeOffDocument>,
  ) {}

  async create(professionalId: string, dto: CreateTimeOffDto) {
    this.validateProfessionalId(professionalId);

    this.validateTimes(dto.startTime, dto.endTime);

    const date = this.parseDate(dto.date);

    const existing = await this.timeOffModel
      .findOne({
        professional: new Types.ObjectId(professionalId),
        date,
      })
      .exec();

    if (existing) {
      throw new BadRequestException(
        'Une indisponibilité existe déjà pour cette date.',
      );
    }

    const timeOff = new this.timeOffModel({
      professional: new Types.ObjectId(professionalId),
      date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
    });

    return timeOff.save();
  }

  async findMine(professionalId: string) {
    this.validateProfessionalId(professionalId);

    return this.timeOffModel
      .find({
        professional: new Types.ObjectId(professionalId),
      })
      .sort({
        date: 1,
        startTime: 1,
      })
      .exec();
  }

  async findOne(professionalId: string, id: string) {
    this.validateProfessionalId(professionalId);

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        'Identifiant de l’indisponibilité invalide.',
      );
    }

    const timeOff = await this.timeOffModel
      .findOne({
        _id: new Types.ObjectId(id),
        professional: new Types.ObjectId(professionalId),
      })
      .exec();

    if (!timeOff) {
      throw new NotFoundException('Indisponibilité introuvable.');
    }

    return timeOff;
  }

  async update(professionalId: string, id: string, dto: UpdateTimeOffDto) {
    const timeOff = await this.findOne(professionalId, id);

    const date = dto.date ? this.parseDate(dto.date) : timeOff.date;

    const startTime =
      dto.startTime !== undefined ? dto.startTime : timeOff.startTime;

    const endTime = dto.endTime !== undefined ? dto.endTime : timeOff.endTime;

    this.validateTimes(startTime, endTime);

    if (dto.date !== undefined && date.getTime() !== timeOff.date.getTime()) {
      const duplicate = await this.timeOffModel
        .findOne({
          _id: {
            $ne: timeOff._id,
          },
          professional: new Types.ObjectId(professionalId),
          date,
        })
        .exec();

      if (duplicate) {
        throw new BadRequestException(
          'Une indisponibilité existe déjà pour cette date.',
        );
      }
    }

    timeOff.date = date;

    if (dto.startTime !== undefined) {
      timeOff.startTime = dto.startTime;
    }

    if (dto.endTime !== undefined) {
      timeOff.endTime = dto.endTime;
    }

    if (dto.reason !== undefined) {
      timeOff.reason = dto.reason;
    }

    return timeOff.save();
  }

  async remove(professionalId: string, id: string) {
    const timeOff = await this.findOne(professionalId, id);

    await this.timeOffModel
      .deleteOne({
        _id: timeOff._id,
      })
      .exec();

    return {
      message: 'Indisponibilité supprimée avec succès.',
    };
  }

  async isUnavailable(
    professionalId: string,
    date: Date,
    startTime?: string,
    endTime?: string,
  ) {
    this.validateProfessionalId(professionalId);

    const timeOffs = await this.timeOffModel
      .find({
        professional: new Types.ObjectId(professionalId),
        date,
      })
      .exec();

    if (timeOffs.length === 0) {
      return false;
    }

    for (const timeOff of timeOffs) {
      if (!timeOff.startTime || !timeOff.endTime) {
        return true;
      }

      if (!startTime || !endTime) {
        return true;
      }

      if (startTime < timeOff.endTime && endTime > timeOff.startTime) {
        return true;
      }
    }

    return false;
  }

  private validateProfessionalId(professionalId: string) {
    if (!Types.ObjectId.isValid(professionalId)) {
      throw new BadRequestException('Identifiant du professionnel invalide.');
    }
  }

  private parseDate(value: string): Date {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Date invalide.');
    }

    date.setUTCHours(0, 0, 0, 0);

    return date;
  }

  private validateTimes(startTime?: string, endTime?: string) {
    if (!startTime && !endTime) {
      return;
    }

    if (!startTime || !endTime) {
      throw new BadRequestException(
        'Les heures de début et de fin doivent être renseignées ensemble.',
      );
    }

    if (startTime >= endTime) {
      throw new BadRequestException(
        "L'heure de fin doit être après l'heure de début.",
      );
    }
  }
}