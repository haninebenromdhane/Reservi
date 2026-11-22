import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';

import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from '../users/schemas/user.schema';

import { LoginDto } from './dto/login.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { RegisterAgentDto } from './dto/register-agent.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import {
  Professional,
  ProfessionalDocument,
  ProfessionalStatus,
} from '../professionals/schemas/professional.schema';

import {
  Profession,
  ProfessionDocument,
} from '../professions/schemas/profession.schema';
import { MailService } from '../mail/mail.service';

type RegistrationDocument = {
  originalname: string;
  filename: string;
  mimetype: string;
  size: number;
};

interface RefreshPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Professional.name)
    private readonly professionalModel: Model<ProfessionalDocument>,

    @InjectModel(Profession.name)
    private readonly professionModel: Model<ProfessionDocument>,

    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async registerClient(
    dto: RegisterClientDto,
  ) {
    const email =
      dto.email.trim().toLowerCase();

    await this.ensureEmailAvailable(email);

    const user =
      await this.userModel.create({
        email,

        password:
          await bcrypt.hash(
            dto.password,
            12,
          ),

        firstName:
          dto.firstName.trim(),

        lastName:
          dto.lastName.trim(),

        role:
          UserRole.CLIENT,

        status:
          UserStatus.ACTIVE,

        emailVerified: false,
      });

    return this.createTokens(user);
  }

  async registerAgent(
    dto: RegisterAgentDto,
    documents: RegistrationDocument[],
  ) {
    const email =
      dto.email.trim().toLowerCase();

    await this.ensureEmailAvailable(email);

    if (
      !Types.ObjectId.isValid(
        dto.professionId,
      )
    ) {
      throw new BadRequestException(
        'Profession invalide.',
      );
    }

    if (
      !documents ||
      documents.length === 0
    ) {
      throw new BadRequestException(
        'Au moins un document justificatif est obligatoire.',
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
      throw new BadRequestException(
        'Profession introuvable ou inactive.',
      );
    }

    const user =
      await this.userModel.create({
        email,

        password:
          await bcrypt.hash(
            dto.password,
            12,
          ),

        firstName:
          dto.firstName.trim(),

        lastName:
          dto.lastName.trim(),

        phone:
          dto.phone?.trim(),

        role:
          UserRole.AGENT,

        status:
          UserStatus.PENDING,

        emailVerified: false,
      });

    await this.professionalModel.create({
      user:
        new Types.ObjectId(
          user._id,
        ),

      profession:
        new Types.ObjectId(
          dto.professionId,
        ),

      displayName:
        dto.displayName?.trim() ||
        `${user.firstName} ${user.lastName}`,

      city:
        dto.city.trim(),

      address:
        dto.address?.trim(),

      phone:
        dto.phone?.trim(),

      description:
        dto.description?.trim(),

      licenseNumber:
        dto.licenseNumber?.trim(),

      status:
        ProfessionalStatus.PENDING,

      rating: 0,

      reviews: 0,

      isVisible: false,

      services: [],

      documents:
        documents.map((file) => ({
          name:
            file.originalname,

          url:
            `/uploads/professional-documents/${file.filename}`,

          mimeType:
            file.mimetype,

          size:
            file.size,

          uploadedAt:
            new Date(),
        })),
    });

    return {
      message:
        'Votre compte agent et votre dossier justificatif ont été créés. Votre fiche doit être validée par un administrateur avant activation.',

      user:
        this.publicUser(user),
    };
  }

  async login(dto: LoginDto) {
    const email =
      dto.email.trim().toLowerCase();

    const user =
      await this.userModel
        .findOne({
          email,
          deleted: false,
        })
        .select('+password')
        .exec();

    if (
      !user ||
      !user.password ||
      !(await bcrypt.compare(
        dto.password,
        user.password,
      ))
    ) {
      throw new UnauthorizedException(
        'Email ou mot de passe incorrect.',
      );
    }

    if (
      user.status ===
      UserStatus.SUSPENDED
    ) {
      throw new UnauthorizedException(
        'Ce compte est suspendu.',
      );
    }

    if (
      user.status ===
      UserStatus.PENDING
    ) {
      throw new UnauthorizedException(
        'Votre compte est en attente de validation par un administrateur.',
      );
    }

    if (
      user.status !==
      UserStatus.ACTIVE
    ) {
      throw new UnauthorizedException(
        'Compte non disponible.',
      );
    }

    return this.createTokens(user);
  }

  async refresh(
    refreshToken: string,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token manquant.',
      );
    }

    let payload: RefreshPayload;

    try {
      payload =
        await this.jwtService.verifyAsync<RefreshPayload>(
          refreshToken,
          {
            secret:
              process.env.JWT_REFRESH_SECRET,
          },
        );
    } catch {
      throw new UnauthorizedException(
        'Refresh token invalide ou expiré.',
      );
    }

    const user =
      await this.userModel
        .findOne({
          _id: payload.sub,
          deleted: false,
          status: UserStatus.ACTIVE,
        })
        .exec();

    if (!user) {
      throw new UnauthorizedException(
        'Compte non disponible.',
      );
    }

    return this.createTokens(user);
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
  ) {
    const email =
      dto.email.trim().toLowerCase();

    const user =
      await this.userModel
        .findOne({
          email,
          deleted: false,
        })
        .select(
          '+passwordResetTokenHash +passwordResetExpiresAt',
        )
        .exec();

    if (!user) {
      return {
        message:
          'Si cette adresse existe, un lien de réinitialisation sera envoyé.',
      };
    }

    const token =
      randomBytes(32).toString('hex');

    user.passwordResetTokenHash =
      this.hashToken(token);

    user.passwordResetExpiresAt =
      new Date(
        Date.now() +
          60 * 60 * 1000,
      );

    await user.save();

    const origin =
      (process.env.FRONTEND_URL ??
        'http://localhost:3000'
      ).split(',')[0].trim();

    const resetUrl =
      `${origin}/reinitialiser-mot-de-passe?token=${token}`;

    await this.mailService.sendPasswordResetLink(
      user.email,
      resetUrl,
    );

    return {
      message:
        'Si cette adresse existe, un lien de réinitialisation sera envoyé.',

      resetToken:
        process.env.NODE_ENV ===
        'production'
          ? undefined
          : token,
    };
  }

  async resetPassword(
    dto: ResetPasswordDto,
  ) {
    const hash =
      this.hashToken(
        dto.token,
      );

    const user =
      await this.userModel
        .findOne({
          passwordResetTokenHash:
            hash,

          passwordResetExpiresAt: {
            $gt: new Date(),
          },

          deleted: false,
        })
        .select(
          '+password +passwordResetTokenHash +passwordResetExpiresAt',
        )
        .exec();

    if (!user) {
      throw new BadRequestException(
        'Token de réinitialisation invalide ou expiré.',
      );
    }

    user.password =
      await bcrypt.hash(
        dto.newPassword,
        12,
      );

    user.passwordResetTokenHash =
      undefined;

    user.passwordResetExpiresAt =
      undefined;

    await user.save();

    return {
      message:
        'Mot de passe réinitialisé avec succès.',
    };
  }

  private async ensureEmailAvailable(
    email: string,
  ) {
    const existingUser =
      await this.userModel
        .findOne({
          email,
        })
        .exec();

    if (existingUser) {
      throw new ConflictException(
        'Cette adresse email est déjà utilisée.',
      );
    }
  }

  private publicUser(
    user: UserDocument,
  ) {
    return {
      id:
        user._id.toString(),

      firstName:
        user.firstName,

      lastName:
        user.lastName,

      email:
        user.email,

      role:
        user.role,

      profileImage:
        user.avatarUrl,
    };
  }

  private async createTokens(
    user: UserDocument,
  ) {
    const payload = {
      sub:
        user._id.toString(),

      email:
        user.email,

      role:
        user.role,
    };

    const accessToken =
      await this.jwtService.signAsync(
        payload,
        {
          secret:
            process.env.JWT_ACCESS_SECRET,

          expiresIn:
            '15m',
        },
      );

    const refreshToken =
      await this.jwtService.signAsync(
        payload,
        {
          secret:
            process.env.JWT_REFRESH_SECRET,

          expiresIn:
            '7d',
        },
      );

    return {
      accessToken,

      refreshToken,

      user:
        this.publicUser(user),
    };
  }

  private hashToken(
    token: string,
  ) {
    return createHash(
      'sha256',
    )
      .update(token)
      .digest('hex');
  }
}
