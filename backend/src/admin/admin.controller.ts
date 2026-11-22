import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminService } from './admin.service';
import { ValidateProfessionalDto } from './dto/validate-professional.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

@ApiTags('Admin')
@ApiBearerAuth('bearer')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private actor(req: Request) {
    const user = req.user as { id: string; email?: string };
    return { id: user.id, email: user.email, ip: req.ip };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques globales' })
  stats() {
    return this.adminService.stats();
  }

  @Get('agents')
  @ApiOperation({ summary: 'Gestion des agents — tous statuts confondus' })
  listAgents() {
    return this.adminService.listAgents();
  }

  @Get('agents/:id')
  getAgent(@Param('id') id: string) {
    return this.adminService.getAgent(id);
  }

  @Patch('agents/:id/validate')
  validateAgent(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: ValidateProfessionalDto,
  ) {
    return this.adminService.validateAgent(
      this.actor(req),
      id,
      dto.action,
      dto.reason,
    );
  }

  @Patch('agents/:id/suspend')
  @ApiOperation({ summary: "Suspendre un agent — retiré de la plateforme" })
  suspendAgent(@Req() req: Request, @Param('id') id: string) {
    return this.adminService.suspendAgent(this.actor(req), id);
  }

  @Patch('agents/:id/reactivate')
  @ApiOperation({
    summary:
      "Réactiver un agent suspendu ou revenir sur un refus de validation",
  })
  reactivateAgent(@Req() req: Request, @Param('id') id: string) {
    return this.adminService.reactivateAgent(this.actor(req), id);
  }

  @Delete('agents/:id')
  deleteAgent(@Req() req: Request, @Param('id') id: string) {
    return this.adminService.deleteAgent(this.actor(req), id);
  }

  @Get('users')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Get('clients')
  @ApiOperation({ summary: 'Gestion des clients uniquement (rôle CLIENT)' })
  listClients() {
    return this.adminService.listClients();
  }

  @Patch('users/:id/status')
  updateUserStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(this.actor(req), id, dto.status);
  }

  @Delete('users/:id')
  deleteUser(@Req() req: Request, @Param('id') id: string) {
    return this.adminService.deleteUser(this.actor(req), id);
  }

  @Get('bookings')
  listBookings() {
    return this.adminService.listBookings();
  }

  @Patch('bookings/:id/cancel')
  cancelBooking(@Req() req: Request, @Param('id') id: string) {
    return this.adminService.cancelBooking(this.actor(req), id);
  }

  @Get('reviews')
  listReviews() {
    return this.adminService.listReviews();
  }

  @Delete('reviews/:id')
  deleteReview(@Req() req: Request, @Param('id') id: string) {
    return this.adminService.deleteReview(this.actor(req), id);
  }

  @Patch('reviews/:id/publish')
  @ApiOperation({ summary: "Publier un avis en attente de modération" })
  publishReview(@Req() req: Request, @Param('id') id: string) {
    return this.adminService.publishReview(this.actor(req), id);
  }

  @Patch('reviews/:id/visibility')
  setReviewVisibility(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('visible') visible: boolean,
  ) {
    return this.adminService.setReviewVisibility(this.actor(req), id, visible);
  }
}
