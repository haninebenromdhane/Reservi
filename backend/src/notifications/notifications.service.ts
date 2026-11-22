import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(userId: string, dto: CreateNotificationDto) {
    this.validateId(userId);
    return this.notificationModel.create({
      user: new Types.ObjectId(userId),
      title: dto.title.trim(),
      message: dto.message.trim(),
      type: dto.type?.trim(),
    });
  }

  async findMine(userId: string) {
    this.validateId(userId);
    return this.notificationModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markRead(userId: string, id: string) {
    this.validateId(userId);
    this.validateId(id);
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: id, user: userId },
        { read: true },
        { new: true },
      )
      .exec();
    if (!notification) throw new NotFoundException('Notification introuvable.');
    return notification;
  }

  async markAllRead(userId: string) {
    this.validateId(userId);
    await this.notificationModel
      .updateMany({ user: userId, read: false }, { read: true })
      .exec();
    return { message: 'Notifications marquées comme lues.' };
  }

  private validateId(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Identifiant invalide.');
  }
}

