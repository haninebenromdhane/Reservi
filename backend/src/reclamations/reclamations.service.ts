import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';
import {
  Reclamation,
  ReclamationDocument,
  ReclamationStatus,
} from './schemas/reclamation.schema';
import { AuditService } from '../audit/audit.service';
import { AuditLevel } from '../audit/schemas/audit-log.schema';

@Injectable()
export class ReclamationsService {
  constructor(
    @InjectModel(Reclamation.name)
    private readonly reclamationModel: Model<ReclamationDocument>,
    private readonly auditService: AuditService,
  ) {}

  async create(userId: string, dto: CreateReclamationDto) {
    this.validateId(userId);
    const reclamation = await this.reclamationModel.create({
      user: new Types.ObjectId(userId),
      subject: dto.subject.trim(),
      message: dto.message.trim(),
      targetUser: dto.targetUserId ? new Types.ObjectId(dto.targetUserId) : undefined,
      booking: dto.bookingId ? new Types.ObjectId(dto.bookingId) : undefined,
      type: dto.type?.trim(),
    });

    await this.auditService.record({
      actorId: userId,
      action: 'SIGNALEMENT_CREE',
      targetType: 'Reclamation',
      targetId: reclamation._id.toString(),
      details: `Signalement soumis : ${dto.subject.trim()}`,
      level: AuditLevel.WARNING,
    });

    return reclamation;
  }

  async findMine(userId: string) {
    this.validateId(userId);
    return this.reclamationModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOneForUser(userId: string, id: string) {
    this.validateId(userId);
    this.validateId(id);
    const item = await this.reclamationModel
      .findOne({ _id: id, user: userId })
      .exec();
    if (!item) throw new NotFoundException('Réclamation introuvable.');
    return item;
  }

  findAll() {
    return this.reclamationModel
      .find()
      .populate('user', 'firstName lastName email role')
      .populate('targetUser', 'firstName lastName email role')
      .populate('booking')
      .populate('handledBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, adminId: string, dto: UpdateReclamationDto) {
    this.validateId(id);
    this.validateId(adminId);
    const item = await this.reclamationModel.findById(id).exec();
    if (!item) throw new NotFoundException('Réclamation introuvable.');
    item.status = dto.status;
    item.adminResponse = dto.adminResponse?.trim();
    item.handledBy = new Types.ObjectId(adminId);
    if (
      dto.status === ReclamationStatus.RESOLVED ||
      dto.status === ReclamationStatus.CLOSED
    )
      item.resolvedAt = new Date();
    else item.resolvedAt = undefined;
    return item.save();
  }

  private validateId(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Identifiant invalide.');
  }
}