import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProfessionDto } from './dto/create-profession.dto';
import { UpdateProfessionDto } from './dto/update-profession.dto';
import { Profession, ProfessionDocument } from './schemas/profession.schema';

@Injectable()
export class ProfessionsService {
  constructor(
    @InjectModel(Profession.name)
    private readonly professionModel: Model<ProfessionDocument>,
  ) {}

  async create(dto: CreateProfessionDto) {
    try {
      return await this.professionModel.create({
        name: dto.name.trim(),
        description: dto.description?.trim(),
        icon: dto.icon?.trim(),
        active: true,
      });
    } catch (error) {
      if (this.isDuplicateKey(error))
        throw new ConflictException('Cette profession existe déjà.');
      throw error;
    }
  }

  async findAll() {
    return this.professionModel.find({ active: true }).sort({ name: 1 }).exec();
  }

  async findAllForAdmin() {
    return this.professionModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string) {
    this.validateId(id);
    const profession = await this.professionModel.findById(id).exec();
    if (!profession) throw new NotFoundException('Profession introuvable.');
    return profession;
  }

  async update(id: string, dto: UpdateProfessionDto) {
    this.validateId(id);
    const profession = await this.findOne(id);
    if (dto.name !== undefined) profession.name = dto.name.trim();
    if (dto.description !== undefined)
      profession.description = dto.description.trim();
    if (dto.icon !== undefined) profession.icon = dto.icon.trim();
    if (dto.active !== undefined) profession.active = dto.active;
    try {
      return await profession.save();
    } catch (error) {
      if (this.isDuplicateKey(error))
        throw new ConflictException('Cette profession existe déjà.');
      throw error;
    }
  }

  async activate(id: string) {
    return this.setActive(id, true);
  }

  async deactivate(id: string) {
    return this.setActive(id, false);
  }

  async remove(id: string) {
    this.validateId(id);
    const profession = await this.professionModel.findByIdAndDelete(id).exec();
    if (!profession) throw new NotFoundException('Profession introuvable.');
    return { message: 'Profession supprimée avec succès.' };
  }

  private async setActive(id: string, active: boolean) {
    this.validateId(id);
    const profession = await this.professionModel
      .findByIdAndUpdate(id, { active }, { new: true })
      .exec();
    if (!profession) throw new NotFoundException('Profession introuvable.');
    return profession;
  }

  private validateId(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Profession introuvable.');
  }

  private isDuplicateKey(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }
}