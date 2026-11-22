import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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

import { TimeOffsService } from './time-offs.service';

import { CreateTimeOffDto } from './dto/create-time-off.dto';

import { UpdateTimeOffDto } from './dto/update-time-off.dto';

@ApiTags('Time Offs')
@ApiBearerAuth()
@Controller('time-offs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.AGENT)
export class TimeOffsController {
  constructor(
    private readonly timeOffsService: TimeOffsService,

    private readonly professionalsService: ProfessionalsService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Récupérer mes indisponibilités',
  })
  async findMine(@Req() request: Request) {
    const user = request.user as {
      id: string;
    };

    const professional = await this.professionalsService.findMyProfile(user.id);

    return this.timeOffsService.findMine(professional._id.toString());
  }

  @Post('me')
  @ApiOperation({
    summary: 'Créer une indisponibilité',
  })
  async create(@Req() request: Request, @Body() dto: CreateTimeOffDto) {
    const user = request.user as {
      id: string;
    };

    const professional = await this.professionalsService.findMyProfile(user.id);

    return this.timeOffsService.create(professional._id.toString(), dto);
  }

  @Put('me/:id')
  @ApiOperation({
    summary: 'Modifier une indisponibilité',
  })
  async update(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() dto: UpdateTimeOffDto,
  ) {
    const user = request.user as {
      id: string;
    };

    const professional = await this.professionalsService.findMyProfile(user.id);

    return this.timeOffsService.update(professional._id.toString(), id, dto);
  }

  @Delete('me/:id')
  @ApiOperation({
    summary: 'Supprimer une indisponibilité',
  })
  async remove(@Req() request: Request, @Param('id') id: string) {
    const user = request.user as {
      id: string;
    };

    const professional = await this.professionalsService.findMyProfile(user.id);

    return this.timeOffsService.remove(professional._id.toString(), id);
  }
}