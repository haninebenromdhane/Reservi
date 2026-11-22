import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';

import {
  Professional,
  ProfessionalDocument,
  ProfessionalStatus,
} from './schemas/professional.schema';

import {
  Profession,
  ProfessionDocument,
} from '../professions/schemas/profession.schema';

import {
  User,
  UserDocument,
  UserStatus,
} from '../users/schemas/user.schema';

import { ServiceDto } from './dto/service.dto';

@Injectable()
export class ProfessionalsService {
  constructor(
    @InjectModel(Professional.name)
    private readonly professionalModel: Model<ProfessionalDocument>,

    @InjectModel(Profession.name)
    private readonly professionModel: Model<ProfessionDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(userId: string, dto: CreateProfessionalDto) {
    this.validateId(
      userId,
      'Identifiant utilisateur invalide.',
    );

    this.validateId(
      dto.professionId,
      'Identifiant profession invalide.',
    );

    const existingProfile =
      await this.professionalModel
        .findOne({
          user: new Types.ObjectId(userId),
        })
        .exec();

    if (existingProfile) {
      throw new ConflictException(
        'Vous avez déjà une fiche professionnelle.',
      );
    }

    const profession =
      await this.professionModel
        .findOne({
          _id: dto.professionId,
          active: true,
        })
        .exec();

    if (!profession) {
      throw new NotFoundException(
        'Profession introuvable ou inactive.',
      );
    }

    const professional =
      await this.professionalModel.create({
        user: new Types.ObjectId(userId),

        profession:
          new Types.ObjectId(dto.professionId),

        displayName:
          dto.displayName.trim(),

        city:
          dto.city.trim(),

        address:
          dto.address?.trim(),

        phone:
          dto.phone?.trim(),

        description:
          dto.description?.trim(),

        imageUrl:
          dto.imageUrl,

        status:
          ProfessionalStatus.PENDING,

        rating: 0,
        reviews: 0,

        isVisible: false,

        services: [],

        documents: [],
      });

    return professional.populate('profession');
  }

  async findAll(
    profession?: string,
    city?: string,
    keyword?: string,
    sort?: string,
    page?: number,
    pageSize?: number,
  ) {
    const isPaginated =
      page !== undefined ||
      pageSize !== undefined;

    const safePage =
      Math.max(1, page ?? 1);

    const safePageSize =
      Math.min(
        100,
        Math.max(1, pageSize ?? 20),
      );

    const filter: Record<string, unknown> = {
      status: ProfessionalStatus.APPROVED,
      isVisible: true,
    };

    if (profession) {
      if (Types.ObjectId.isValid(profession)) {
        filter.profession =
          new Types.ObjectId(profession);
      } else {
        const professionDoc =
          await this.professionModel
            .findOne({
              name: {
                $regex: `^${this.escapeRegex(
                  profession,
                )}$`,
                $options: 'i',
              },
              active: true,
            })
            .select('_id')
            .exec();

        if (!professionDoc) {
          return isPaginated
            ? {
                items: [],
                total: 0,
                page: safePage,
                pageSize: safePageSize,
                totalPages: 0,
              }
            : [];
        }

        filter.profession =
          professionDoc._id;
      }
    }

    if (city) {
      filter.city = {
        $regex: this.escapeRegex(city),
        $options: 'i',
      };
    }

    if (keyword) {
      const regex = {
        $regex: this.escapeRegex(keyword),
        $options: 'i',
      };

      filter.$or = [
        {
          displayName: regex,
        },
        {
          description: regex,
        },
      ];
    }

    const query =
      this.professionalModel
        .find(filter)
        .select(
          'displayName city description imageUrl rating reviews profession services documents',
        )
        .populate('profession')
        .skip(
          (safePage - 1) *
            safePageSize,
        )
        .limit(safePageSize);

    if (sort === 'reviews') {
      query.sort({
        reviews: -1,
        rating: -1,
      });
    } else if (sort === 'name') {
      query.sort({
        displayName: 1,
      });
    } else {
      query.sort({
        rating: -1,
        reviews: -1,
      });
    }

    if (!isPaginated) {
      return query.exec();
    }

    const [items, total] =
      await Promise.all([
        query.exec(),
        this.professionalModel
          .countDocuments(filter)
          .exec(),
      ]);

    return {
      items,
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages:
        Math.ceil(
          total / safePageSize,
        ),
    };
  }

  async findOne(id: string) {
    this.validateId(
      id,
      'Identifiant professionnel invalide.',
    );

    const professional =
      await this.professionalModel
        .findOne({
          _id: id,
          status:
            ProfessionalStatus.APPROVED,
          isVisible: true,
        })
        .select(
          'displayName city description imageUrl rating reviews profession services documents',
        )
        .populate('profession')
        .exec();

    if (!professional) {
      throw new NotFoundException(
        'Professionnel introuvable.',
      );
    }

    return professional;
  }

  async findAdminDetails(id: string) {
    this.validateId(
      id,
      'Identifiant professionnel invalide.',
    );

    const professional =
      await this.professionalModel
        .findById(id)
        .populate('profession')
        .populate(
          'user',
          'firstName lastName email phone avatarUrl role status',
        )
        .exec();

    if (!professional) {
      throw new NotFoundException(
        'Professionnel introuvable.',
      );
    }

    return professional;
  }

  async findDetails(id: string) {
    this.validateId(
      id,
      'Identifiant professionnel invalide.',
    );

    const professional =
      await this.professionalModel
        .findOne({
          _id: id,
          status:
            ProfessionalStatus.APPROVED,
          isVisible: true,
        })
        .populate('profession')
        .populate(
          'user',
          'firstName lastName email phone avatarUrl role status',
        )
        .exec();

    if (!professional) {
      throw new NotFoundException(
        'Professionnel introuvable.',
      );
    }

    return professional;
  }

  /*
   * IMPORTANT:
   * This is the canonical lookup used by:
   * - Ma fiche
   * - Mes services
   * - Mon agenda
   * - Documents
   * - Profile update
   *
   * The professional is linked to the authenticated
   * User through Professional.user.
   */
  async findMyProfile(userId: string) {
    this.validateId(
      userId,
      'Identifiant utilisateur invalide.',
    );

    const objectUserId =
      new Types.ObjectId(userId);

    let professional =
      await this.professionalModel
        .findOne({
          user: objectUserId,
        })
        .populate('profession')
        .exec();

    /*
     * Fallback:
     * if an old fiche was created with a slightly
     * inconsistent user reference, resolve the user
     * first and retry with its real _id.
     */
    if (!professional) {
      const user =
        await this.userModel
          .findById(objectUserId)
          .select('_id email')
          .exec();

      if (user) {
        professional =
          await this.professionalModel
            .findOne({
              user: user._id,
            })
            .populate('profession')
            .exec();
      }
    }

    if (!professional) {
      throw new NotFoundException(
        "Vous n'avez pas encore de fiche professionnelle.",
      );
    }

    return professional;
  }

  async updateMyProfile(
    userId: string,
    dto: UpdateProfessionalDto,
  ) {
    const professional =
      await this.findMyProfile(userId);

    if (dto.displayName !== undefined) {
      professional.displayName =
        dto.displayName.trim();
    }

    if (dto.city !== undefined) {
      professional.city =
        dto.city.trim();
    }

    if (dto.address !== undefined) {
      professional.address =
        dto.address.trim();
    }

    if (dto.phone !== undefined) {
      professional.phone =
        dto.phone.trim();
    }

    if (dto.description !== undefined) {
      professional.description =
        dto.description.trim();
    }

    if (dto.licenseNumber !== undefined) {
      professional.licenseNumber =
        dto.licenseNumber.trim();
    }

    if (dto.imageUrl !== undefined) {
      professional.imageUrl =
        dto.imageUrl;
    }

    if (dto.isVisible !== undefined) {
      professional.isVisible =
        dto.isVisible;
    }

    return professional.save();
  }

  async addService(
    userId: string,
    dto: ServiceDto,
  ) {
    const professional =
      await this.findMyProfile(userId);

    professional.services.push({
      name: dto.name.trim(),
      duration: dto.duration,
      price: dto.price,
      currency:
        dto.currency?.trim() || 'DT',
    });

    await professional.save();

    return professional.populate(
      'profession',
    );
  }

  async updateService(
    userId: string,
    serviceId: string,
    dto: ServiceDto,
  ) {
    const professional =
      await this.findMyProfile(userId);

    const service =
      professional.services.find(
        (item) =>
          item._id?.toString() ===
          serviceId,
      );

    if (!service) {
      throw new NotFoundException(
        'Service introuvable.',
      );
    }

    service.name =
      dto.name.trim();

    service.duration =
      dto.duration;

    service.price =
      dto.price;

    service.currency =
      dto.currency?.trim() || 'DT';

    await professional.save();

    return professional.populate(
      'profession',
    );
  }

  async deleteService(
    userId: string,
    serviceId: string,
  ) {
    const professional =
      await this.findMyProfile(userId);

    const service =
      professional.services.find(
        (item) =>
          item._id?.toString() ===
          serviceId,
      );

    if (!service) {
      throw new NotFoundException(
        'Service introuvable.',
      );
    }

    professional.services =
      professional.services.filter(
        (item) =>
          item._id?.toString() !==
          serviceId,
      );

    await professional.save();

    return professional.populate(
      'profession',
    );
  }

  async addDocument(
    userId: string,
    file: {
      originalname: string;
      filename: string;
      mimetype: string;
      size: number;
    },
  ) {
    const professional =
      await this.findMyProfile(userId);

    professional.documents.push({
      name: file.originalname,
      url: `/uploads/professional-documents/${file.filename}`,
      mimeType: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    } as never);

    await professional.save();

    return professional.populate(
      'profession',
    );
  }

  async deleteDocument(
    userId: string,
    documentId: string,
  ) {
    const professional =
      await this.findMyProfile(userId);

    const before =
      professional.documents.length;

    professional.documents =
      professional.documents.filter(
        (item) =>
          item._id?.toString() !==
          documentId,
      );

    if (
      professional.documents.length ===
      before
    ) {
      throw new NotFoundException(
        'Document introuvable.',
      );
    }

    await professional.save();

    return professional.populate(
      'profession',
    );
  }

  async findPending() {
    return this.professionalModel
      .find({
        status:
          ProfessionalStatus.PENDING,
      })
      .populate('profession')
      .populate(
        'user',
        'firstName lastName email phone',
      )
      .sort({
        createdAt: 1,
      })
      .exec();
  }

  async findAllForAdmin() {
    return this.professionalModel
      .find()
      .populate('profession')
      .populate(
        'user',
        'firstName lastName email phone role status',
      )
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  async approve(id: string) {
    const professional =
      await this.findPendingById(id);

    const user =
      await this.userModel
        .findById(
          professional.user,
        )
        .exec();

    if (!user) {
      throw new NotFoundException(
        'Utilisateur associé à cette fiche introuvable.',
      );
    }

    user.status =
      UserStatus.ACTIVE;

    await user.save();

    professional.status =
      ProfessionalStatus.APPROVED;

    professional.isVisible =
      true;

    professional.rejectionReason =
      undefined;

    await professional.save();

    return this.findDetails(
      professional._id.toString(),
    );
  }

  async reject(
    id: string,
    reason?: string,
  ) {
    const professional =
      await this.findPendingById(id);

    professional.status =
      ProfessionalStatus.REJECTED;

    professional.isVisible =
      false;

    professional.rejectionReason =
      reason?.trim();

    await professional.save();

    return professional;
  }

  async suspend(id: string) {
    this.validateId(
      id,
      'Identifiant professionnel invalide.',
    );

    const professional =
      await this.professionalModel
        .findById(id)
        .exec();

    if (!professional) {
      throw new NotFoundException(
        'Professionnel introuvable.',
      );
    }

    if (
      professional.status !==
      ProfessionalStatus.APPROVED
    ) {
      throw new BadRequestException(
        'Seul un agent actif peut être suspendu.',
      );
    }

    professional.isVisible =
      false;

    await professional.save();

    await this.userModel
      .findByIdAndUpdate(
        professional.user,
        {
          status:
            UserStatus.SUSPENDED,
        },
      )
      .exec();

    return professional;
  }

  /*
   * Réactive un agent :
   * - lève une suspension (compte redevient ACTIVE, fiche revisible)
   * - ou revient sur un refus de validation (REJECTED -> APPROVED)
   *
   * Dans les deux cas l'agent redevient visible sur la plateforme.
   */
  async reactivate(id: string) {
    this.validateId(
      id,
      'Identifiant professionnel invalide.',
    );

    const professional =
      await this.professionalModel
        .findById(id)
        .exec();

    if (!professional) {
      throw new NotFoundException(
        'Professionnel introuvable.',
      );
    }

    if (
      professional.status ===
      ProfessionalStatus.PENDING
    ) {
      throw new BadRequestException(
        'Cette fiche est en attente de sa première validation.',
      );
    }

    professional.status =
      ProfessionalStatus.APPROVED;

    professional.isVisible =
      true;

    professional.rejectionReason =
      undefined;

    await professional.save();

    await this.userModel
      .findByIdAndUpdate(
        professional.user,
        {
          status:
            UserStatus.ACTIVE,
        },
      )
      .exec();

    return this.findAdminDetails(
      professional._id.toString(),
    );
  }

  async delete(id: string) {
    this.validateId(
      id,
      'Identifiant professionnel invalide.',
    );

    const professional =
      await this.professionalModel
        .findByIdAndDelete(id)
        .exec();

    if (!professional) {
      throw new NotFoundException(
        'Professionnel introuvable.',
      );
    }

    return {
      message:
        'Fiche professionnelle supprimée avec succès.',
    };
  }

  private async findPendingById(
    id: string,
  ) {
    this.validateId(
      id,
      'Identifiant professionnel invalide.',
    );

    const professional =
      await this.professionalModel
        .findOne({
          _id: id,
          status:
            ProfessionalStatus.PENDING,
        })
        .exec();

    if (!professional) {
      throw new NotFoundException(
        'Fiche professionnelle en attente introuvable.',
      );
    }

    return professional;
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

  private escapeRegex(
    value: string,
  ) {
    return value.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
  }
}