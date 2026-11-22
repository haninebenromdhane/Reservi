import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ReviewsService } from './reviews.service';

import { CreateReviewDto } from './dto/create-review.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import { UserRole } from '../users/schemas/user.schema';

import { ProfessionalsService } from '../professionals/professionals.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,

    private readonly professionalsService: ProfessionalsService,
  ) {}

  @Get('professional/:id')
  @ApiOperation({
    summary: 'Lister les avis publics d’un professionnel',
  })
  findForProfessional(@Param('id') id: string) {
    return this.reviewsService.findForProfessional(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Voir un avis',
  })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Get('me/client')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer mes avis',
  })
  findMineAsClient(@Req() request: Request) {
    const user = request.user as {
      id: string;
    };

    return this.reviewsService.findForClient(user.id);
  }

  @Get('me/professional')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.AGENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Récupérer les avis reçus',
  })
  async findMineAsProfessional(@Req() request: Request) {
    const user = request.user as {
      id: string;
    };

    const professional = await this.professionalsService.findMyProfile(user.id);

    return this.reviewsService.findForProfessional(professional._id.toString());
  }

  @Post('booking/:bookingId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Laisser un avis après un rendez-vous',
  })
  create(
    @Req() request: Request,
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateReviewDto,
  ) {
    const user = request.user as {
      id: string;
    };

    return this.reviewsService.create(user.id, bookingId, dto);
  }
}