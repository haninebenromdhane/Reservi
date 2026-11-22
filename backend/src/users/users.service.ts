import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from './schemas/user.schema';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly mailService: MailService,
  ) {}

  async findById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Utilisateur introuvable.');
    const user = await this.userModel
      .findOne({ _id: id, deleted: false })
      .exec();
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return user;
  }

  async findPublicSafeById(id: string) {
    const user = await this.userModel
      .findOne({ _id: id, deleted: false, status: UserStatus.ACTIVE })
      .select('firstName lastName avatarUrl role status')
      .exec();
    if (!user) throw new NotFoundException('Utilisateur introuvable.');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.findById(userId);
    if (dto.email !== undefined) { const email=dto.email.trim().toLowerCase(); const existing=await this.userModel.findOne({email,_id:{$ne:user._id},deleted:false}).exec(); if(existing) throw new ConflictException('Cette adresse email est déjà utilisée.'); user.email=email; }
    if (dto.firstName !== undefined) user.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) user.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone.trim();
    if (dto.avatarUrl !== undefined) user.avatarUrl = dto.avatarUrl;
    return user.save();
  }

  /*
   * Met à jour la photo de profil à partir d'un fichier réellement
   * uploadé (voir POST /users/me/avatar) et persiste l'URL renvoyée
   * par le serveur de fichiers statiques, contrairement à l'ancien
   * comportement qui ne stockait l'image qu'en mémoire côté client.
   */
  async updateAvatar(userId: string, avatarUrl: string) {
    const user = await this.findById(userId);
    user.avatarUrl = avatarUrl;
    return user.save();
  }

  /*
   * Étape 1/2 du changement de mot de passe (utilisateur connecté) :
   * vérifie le mot de passe actuel, met le nouveau mot de passe "en
   * attente" (haché, non appliqué), et envoie un e-mail de
   * confirmation. Le mot de passe n'est réellement changé qu'après
   * confirmation du lien (voir confirmPasswordChange).
   */
  async requestPasswordChange(
    userId: string,
    dto: UpdatePasswordDto,
    origin: string,
  ) {
    const user = await this.userModel
      .findOne({ _id: userId, deleted: false })
      .select('+password')
      .exec();
    if (!user) throw new NotFoundException('Utilisateur introuvable.');

    const valid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!valid)
      throw new UnauthorizedException('Mot de passe actuel incorrect.');

    const token = randomBytes(32).toString('hex');

    user.pendingPasswordHash = await bcrypt.hash(dto.newPassword, 12);
    user.passwordChangeTokenHash = this.hashToken(token);
    user.passwordChangeExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    const confirmUrl = `${origin}/confirmer-mot-de-passe?token=${token}`;
    await this.mailService.sendPasswordChangeVerification(
      user.email,
      user.firstName,
      confirmUrl,
    );

    return {
      message:
        'Un e-mail de confirmation vous a été envoyé. Cliquez sur le lien reçu pour finaliser le changement de mot de passe.',
    };
  }

  /*
   * Étape 2/2 : applique le nouveau mot de passe une fois le lien
   * reçu par e-mail confirmé. Volontairement accessible sans être
   * connecté (le lien peut être ouvert depuis un autre appareil/
   * navigateur que celui utilisé pour la demande), à l'image du flux
   * "mot de passe oublié".
   */
  async confirmPasswordChange(token: string) {
    if (!token) {
      throw new BadRequestException('Lien de confirmation invalide.');
    }

    const hash = this.hashToken(token);

    const user = await this.userModel
      .findOne({
        passwordChangeTokenHash: hash,
        passwordChangeExpiresAt: { $gt: new Date() },
        deleted: false,
      })
      .select('+pendingPasswordHash +passwordChangeTokenHash +passwordChangeExpiresAt')
      .exec();

    if (!user || !user.pendingPasswordHash) {
      throw new BadRequestException(
        'Lien de confirmation invalide ou expiré.',
      );
    }

    user.password = user.pendingPasswordHash;
    user.pendingPasswordHash = undefined;
    user.passwordChangeTokenHash = undefined;
    user.passwordChangeExpiresAt = undefined;
    await user.save();

    return { message: 'Mot de passe modifié avec succès.' };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async updateStatus(id: string, status: UserStatus) {
    const user = await this.findById(id);
    if (user.role === UserRole.ADMIN && status === UserStatus.SUSPENDED) {
      throw new ConflictException(
        'Un compte administrateur ne peut pas être suspendu.',
      );
    }
    user.status = status;
    return user.save();
  }

  async removeAccount(userId: string) {
    const user = await this.findById(userId);
    user.firstName = 'Utilisateur';
    user.lastName = 'Supprimé';
    user.email = `deleted-${user._id.toString()}@reservi.invalid`;
    user.phone = undefined;
    user.avatarUrl = undefined;
    user.password = await bcrypt.hash(
      `${user._id.toString()}-${Date.now()}`,
      12,
    );
    user.deleted = true;
    user.status = UserStatus.SUSPENDED;
    await user.save();
    return { message: 'Compte supprimé avec succès.' };
  }

  async listForAdmin() {
    return this.userModel
      .find({ deleted: false })
      .select(
        'firstName lastName email phone avatarUrl role status emailVerified createdAt updatedAt',
      )
      .sort({ createdAt: -1 })
      .exec();
  }

  /*
   * Gestion clients (admin) : uniquement les comptes de rôle CLIENT,
   * distincts des agents qui ont leur propre gestion.
   */
  async listClients() {
    return this.userModel
      .find({ deleted: false, role: UserRole.CLIENT })
      .select(
        'firstName lastName email phone avatarUrl role status emailVerified createdAt updatedAt',
      )
      .sort({ createdAt: -1 })
      .exec();
  }
}
