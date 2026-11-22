import { Injectable, NotFoundException } from '@nestjs/common';
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
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from '../users/schemas/user.schema';
import {
  Reclamation,
  ReclamationDocument,
  ReclamationStatus,
} from '../reclamations/schemas/reclamation.schema';
import { ProfessionalsService } from '../professionals/professionals.service';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { AuditLevel } from '../audit/schemas/audit-log.schema';

export interface ActingAdmin {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  ip?: string;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Professional.name)
    private readonly professionalModel: Model<ProfessionalDocument>,
    @InjectModel(Booking.name)
    private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
    @InjectModel(Reclamation.name)
    private readonly reclamationModel: Model<ReclamationDocument>,
    private readonly professionalsService: ProfessionalsService,
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  async stats() {
    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    const [
      users,
      clients,
      agents,
      pendingAgents,
      approvedAgents,
      bookings,
      bookingsThisMonth,
      reviews,
      pendingReviews,
      reclamations,
    ] = await Promise.all([
      this.userModel.countDocuments({ deleted: false }).exec(),
      this.userModel
        .countDocuments({ role: UserRole.CLIENT, deleted: false })
        .exec(),
      this.userModel
        .countDocuments({ role: UserRole.AGENT, deleted: false })
        .exec(),
      this.professionalModel
        .countDocuments({ status: ProfessionalStatus.PENDING })
        .exec(),
      this.professionalModel
        .countDocuments({ status: ProfessionalStatus.APPROVED })
        .exec(),
      this.bookingModel.countDocuments().exec(),
      this.bookingModel
        .countDocuments({ createdAt: { $gte: startOfMonth } })
        .exec(),
      this.reviewModel.countDocuments({ visible: true }).exec(),
      this.reviewModel.countDocuments({ visible: false }).exec(),
      this.reclamationModel
        .countDocuments({
          status: {
            $nin: [ReclamationStatus.RESOLVED, ReclamationStatus.CLOSED],
          },
        })
        .exec(),
    ]);
    return {
      users,
      clients,
      agents,
      pendingAgents,
      approvedAgents,
      bookings,
      bookingsThisMonth,
      reviews,
      pendingReviews,
      openReclamations: reclamations,
    };
  }

  listAgents() {
    return this.professionalModel
      .find()
      .populate('profession')
      .populate('user', 'firstName lastName email phone role status')
      .sort({ createdAt: -1 })
      .exec();
  }

  getAgent(id: string) {
    return this.professionalsService.findAdminDetails(id);
  }

  async validateAgent(
    admin: ActingAdmin,
    id: string,
    action: 'APPROVE' | 'REJECT',
    reason?: string,
  ) {
    const result =
      action === 'APPROVE'
        ? await this.professionalsService.approve(id)
        : await this.professionalsService.reject(id, reason);

    await this.auditService.record({
      actorId: admin.id,
      actorLabel: this.adminLabel(admin),
      actorRole: 'ADMIN',
      action: action === 'APPROVE' ? 'AGENT_VALIDE' : 'AGENT_REJETE',
      targetType: 'Professional',
      targetId: id,
      details:
        action === 'APPROVE'
          ? `Fiche professionnelle validée (${result.displayName ?? id}).`
          : `Fiche professionnelle rejetée${reason ? ` — motif : ${reason}` : ''}.`,
      level: action === 'APPROVE' ? AuditLevel.INFO : AuditLevel.WARNING,
      ip: admin.ip,
    });

    return result;
  }

  async suspendAgent(admin: ActingAdmin, id: string) {
    const result = await this.professionalsService.suspend(id);

    await this.auditService.record({
      actorId: admin.id,
      actorLabel: this.adminLabel(admin),
      actorRole: 'ADMIN',
      action: 'AGENT_SUSPENDU',
      targetType: 'Professional',
      targetId: id,
      details: `Compte agent suspendu (${result.displayName ?? id}), retiré de la plateforme.`,
      level: AuditLevel.WARNING,
      ip: admin.ip,
    });

    return result;
  }

  async reactivateAgent(admin: ActingAdmin, id: string) {
    const result = await this.professionalsService.reactivate(id);

    await this.auditService.record({
      actorId: admin.id,
      actorLabel: this.adminLabel(admin),
      actorRole: 'ADMIN',
      action: 'AGENT_REACTIVE',
      targetType: 'Professional',
      targetId: id,
      details: `Compte agent réactivé (${result.displayName ?? id}).`,
      level: AuditLevel.INFO,
      ip: admin.ip,
    });

    return result;
  }

  async deleteAgent(admin: ActingAdmin, id: string) {
    const result = await this.professionalsService.delete(id);

    await this.auditService.record({
      actorId: admin.id,
      actorLabel: this.adminLabel(admin),
      actorRole: 'ADMIN',
      action: 'AGENT_SUPPRIME',
      targetType: 'Professional',
      targetId: id,
      details: 'Fiche professionnelle supprimée définitivement.',
      level: AuditLevel.WARNING,
      ip: admin.ip,
    });

    return result;
  }

  listUsers() {
    return this.usersService.listForAdmin();
  }

  listClients() {
    return this.usersService.listClients();
  }

  async updateUserStatus(admin: ActingAdmin, id: string, status: UserStatus) {
    const result = await this.usersService.updateStatus(id, status);

    await this.auditService.record({
      actorId: admin.id,
      actorLabel: this.adminLabel(admin),
      actorRole: 'ADMIN',
      action:
        status === UserStatus.SUSPENDED ? 'CLIENT_SUSPENDU' : 'CLIENT_REACTIVE',
      targetType: 'User',
      targetId: id,
      details:
        status === UserStatus.SUSPENDED
          ? `Compte suspendu (${result.firstName} ${result.lastName}) — accès révoqué.`
          : `Compte réactivé (${result.firstName} ${result.lastName}).`,
      level:
        status === UserStatus.SUSPENDED ? AuditLevel.WARNING : AuditLevel.INFO,
      ip: admin.ip,
    });

    return result;
  }

  async deleteUser(admin: ActingAdmin, id: string) {
    const result = await this.usersService.removeAccount(id);

    await this.auditService.record({
      actorId: admin.id,
      actorLabel: this.adminLabel(admin),
      actorRole: 'ADMIN',
      action: 'CLIENT_SUPPRIME',
      targetType: 'User',
      targetId: id,
      details: 'Compte client supprimé (anonymisation des données personnelles).',
      level: AuditLevel.WARNING,
      ip: admin.ip,
    });

    return result;
  }

  async listBookings() {
    return this.bookingModel
      .find()
      .populate('client', 'firstName lastName email')
      .populate({ path: 'professional', populate: { path: 'profession' } })
      .sort({ date: -1, startTime: -1 })
      .exec();
  }

  async cancelBooking(admin: ActingAdmin, id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Réservation introuvable.');
    const booking = await this.bookingModel.findById(id).exec();
    if (!booking) throw new NotFoundException('Réservation introuvable.');
    booking.status = BookingStatus.CANCELLED;
    const saved = await booking.save();

    await this.auditService.record({
      actorId: admin.id,
      actorLabel: this.adminLabel(admin),
      actorRole: 'ADMIN',
      action: 'RESERVATION_ANNULEE_FORCE',
      targetType: 'Booking',
      targetId: id,
      details: 'Réservation annulée par un administrateur.',
      level: AuditLevel.WARNING,
      ip: admin.ip,
    });

    return saved;
  }

  async listReviews() {
    return this.reviewModel
      .find()
      .populate('client', 'firstName lastName')
      .populate('professional', 'displayName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async deleteReview(admin: ActingAdmin, id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Avis introuvable.');
    const review = await this.reviewModel.findByIdAndDelete(id).exec();
    if (!review) throw new NotFoundException('Avis introuvable.');

    await this.auditService.record({
      actorId: admin.id,
      actorLabel: this.adminLabel(admin),
      actorRole: 'ADMIN',
      action: 'AVIS_SUPPRIME',
      targetType: 'Review',
      targetId: id,
      details: 'Avis supprimé par un administrateur.',
      level: AuditLevel.WARNING,
      ip: admin.ip,
    });

    return { message: 'Avis supprimé avec succès.' };
  }

  async setReviewVisibility(admin: ActingAdmin, id: string, visible: boolean) {
    if (!Types.ObjectId.isValid(id))
      throw new NotFoundException('Avis introuvable.');
    const review = await this.reviewModel
      .findByIdAndUpdate(id, { visible }, { new: true })
      .exec();
    if (!review) throw new NotFoundException('Avis introuvable.');

    await this.auditService.record({
      actorId: admin.id,
      actorLabel: this.adminLabel(admin),
      actorRole: 'ADMIN',
      action: visible ? 'AVIS_PUBLIE' : 'AVIS_MASQUE',
      targetType: 'Review',
      targetId: id,
      details: visible
        ? 'Avis publié sur la plateforme.'
        : 'Avis masqué de la plateforme.',
      level: AuditLevel.INFO,
      ip: admin.ip,
    });

    return review;
  }

  publishReview(admin: ActingAdmin, id: string) {
    return this.setReviewVisibility(admin, id, true);
  }

  private adminLabel(admin: ActingAdmin) {
    const name = [admin.firstName, admin.lastName].filter(Boolean).join(' ');
    return name || admin.email || 'Administrateur';
  }
}
