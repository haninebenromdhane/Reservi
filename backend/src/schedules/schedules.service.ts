import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import { Schedule, ScheduleDocument } from './schemas/schedule.schema';

import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(Schedule.name)
    private readonly scheduleModel: Model<ScheduleDocument>,
  ) {}

  /**
   * Récupérer le planning hebdomadaire d'un professionnel.
   */
  async findMySchedules(professionalId: string) {
    if (!Types.ObjectId.isValid(professionalId)) {
      throw new BadRequestException('Identifiant du professionnel invalide.');
    }

    return this.scheduleModel
      .find({
        professional: new Types.ObjectId(professionalId),
      })
      .sort({
        dayOfWeek: 1,
      })
      .exec();
  }

  /**
   * Créer ou modifier l'horaire d'un jour.
   */
  async upsert(professionalId: string, dto: UpdateScheduleDto) {
    if (!Types.ObjectId.isValid(professionalId)) {
      throw new BadRequestException('Identifiant du professionnel invalide.');
    }

    const professionalObjectId = new Types.ObjectId(professionalId);
    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException(
        "L'heure de fin doit être après l'heure de début.",
      );
    }

    /*
     * Si le jour est désactivé, on peut quand même
     * conserver l'horaire en base avec active = false.
     */
    const existingSchedule = await this.scheduleModel
      .findOne({
        professional: professionalObjectId,
        dayOfWeek: dto.dayOfWeek,
      })
      .exec();

    if (existingSchedule) {
      if (dto.startTime !== undefined) {
        existingSchedule.startTime = dto.startTime;
      }

      if (dto.endTime !== undefined) {
        existingSchedule.endTime = dto.endTime;
      }

      if (dto.active !== undefined) existingSchedule.active = dto.active;
      if (dto.slotDuration !== undefined)
        existingSchedule.slotDuration = dto.slotDuration;
      if (dto.bufferTime !== undefined)
        existingSchedule.bufferTime = dto.bufferTime;

      return existingSchedule.save();
    }

    const schedule = new this.scheduleModel({
      professional: professionalObjectId,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      active: dto.active ?? true,
      slotDuration: dto.slotDuration ?? 30,
      bufferTime: dto.bufferTime ?? 0,
    });

    return schedule.save();
  }

  /**
   * Supprimer l'horaire d'un jour.
   */
  async remove(professionalId: string, dayOfWeek: number) {
    if (!Types.ObjectId.isValid(professionalId)) {
      throw new BadRequestException('Identifiant du professionnel invalide.');
    }

    if (dayOfWeek < 1 || dayOfWeek > 7) {
      throw new BadRequestException('Le jour doit être compris entre 1 et 7.');
    }

    const deletedSchedule = await this.scheduleModel
      .findOneAndDelete({
        professional: new Types.ObjectId(professionalId),
        dayOfWeek,
      })
      .exec();

    if (!deletedSchedule) {
      throw new NotFoundException('Aucun horaire trouvé pour ce jour.');
    }

    return {
      message: 'Horaire supprimé avec succès.',
    };
  }
}