import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { RolesGuard } from '../auth/guards/roles.guard';

import { Roles } from '../auth/decorators/roles.decorator';

import { UserRole } from '../users/schemas/user.schema';

import { ProfessionalsService } from '../professionals/professionals.service';

import { SchedulesService } from './schedules.service';

import { UpdateScheduleDto } from './dto/update-schedule.dto';

@ApiTags('Schedules')
@ApiBearerAuth()
@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AGENT)
export class SchedulesController {
  constructor(
    private readonly schedulesService: SchedulesService,

    private readonly professionalsService: ProfessionalsService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Récupérer mon planning hebdomadaire',
  })
  async findMine(@Req() request: Request) {
    const user = request.user as {
      id: string;
    };

    const professional = await this.professionalsService.findMyProfile(user.id);

    return this.schedulesService.findMySchedules(professional._id.toString());
  }

  @Put('me')
  @ApiOperation({
    summary: 'Créer ou modifier un jour du planning',
  })
  async upsert(@Req() request: Request, @Body() dto: UpdateScheduleDto) {
    const user = request.user as {
      id: string;
    };

    const professional = await this.professionalsService.findMyProfile(user.id);

    return this.schedulesService.upsert(professional._id.toString(), dto);
  }

  @Delete('me/:dayOfWeek')
  @ApiOperation({
    summary: 'Supprimer un jour du planning',
  })
  async remove(@Req() request: Request, @Param('dayOfWeek') dayOfWeek: string) {
    const user = request.user as {
      id: string;
    };

    const professional = await this.professionalsService.findMyProfile(user.id);

    return this.schedulesService.remove(
      professional._id.toString(),
      Number(dayOfWeek),
    );
  }
}
