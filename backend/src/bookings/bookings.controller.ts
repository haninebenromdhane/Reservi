import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import {
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';

import {
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';

import {
  RolesGuard,
} from '../auth/guards/roles.guard';

import {
  Roles,
} from '../auth/decorators/roles.decorator';

import {
  UserRole,
} from '../users/schemas/user.schema';

import {
  BookingsService,
} from './bookings.service';

import {
  CreateBookingDto,
} from './dto/create-booking.dto';

import {
  UpdateBookingStatusDto,
} from './dto/update-booking-status.dto';

import {
  BookingStatus,
} from './schemas/booking.schema';

@ApiTags('Bookings')
@ApiBearerAuth('bearer')
@Controller('bookings')
@UseGuards(
  JwtAuthGuard,
  RolesGuard,
)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
  ) {}

  @Post()
  @Roles(UserRole.CLIENT)
  create(
    @Req() request: Request,
    @Body() dto: CreateBookingDto,
  ) {
    const user =
      request.user as {
        id: string;
      };

    return this.bookingsService.create(
      user.id,
      dto,
    );
  }

  @Get('me')
  @Roles(UserRole.CLIENT)
  findMyBookings(
    @Req() request: Request,
  ) {
    const user =
      request.user as {
        id: string;
      };

    return this.bookingsService.findMyBookings(
      user.id,
    );
  }

  @Get('professional/me')
  @Roles(UserRole.AGENT)
  findMyProfessionalBookings(
    @Req() request: Request,
  ) {
    const user =
      request.user as {
        id: string;
      };

    return this.bookingsService
      .findMyProfessionalBookingsByUser(
        user.id,
      );
  }

  @Get(':id')
  @Roles(UserRole.CLIENT)
  findOne(
    @Req() request: Request,
    @Param('id') id: string,
  ) {
    const user =
      request.user as {
        id: string;
      };

    return this.bookingsService
      .findOneForClient(
        user.id,
        id,
      );
  }

  @Patch(':id/status')
  @Roles(
    UserRole.CLIENT,
    UserRole.AGENT,
  )
  updateStatus(
    @Req() request: Request,
    @Param('id') id: string,
    @Body()
    dto: UpdateBookingStatusDto,
  ) {
    const user =
      request.user as {
        id: string;
        role: UserRole;
      };

    if (
      user.role ===
      UserRole.CLIENT
    ) {
      if (
        dto.status !==
        BookingStatus.CANCELLED
      ) {
        throw new BadRequestException(
          'Un client peut uniquement annuler une réservation.',
        );
      }

      return this.bookingsService
        .cancelByClient(
          user.id,
          id,
        );
    }

    switch (dto.status) {
      case BookingStatus.CONFIRMED:
        return this.bookingsService
          .confirmByUser(
            user.id,
            id,
          );

      case BookingStatus.REJECTED:
        return this.bookingsService
          .rejectByUser(
            user.id,
            id,
          );

      case BookingStatus.COMPLETED:
        return this.bookingsService
          .completeByUser(
            user.id,
            id,
          );

      case BookingStatus.NO_SHOW:
        return this.bookingsService
          .noShowByUser(
            user.id,
            id,
          );

      default:
        throw new BadRequestException(
          'Statut de réservation invalide.',
        );
    }
  }
}