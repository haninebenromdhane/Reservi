import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';
import { ReclamationsService } from './reclamations.service';

@ApiTags('Reclamations')
@ApiBearerAuth('bearer')
@Controller('reclamations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReclamationsController {
  constructor(private readonly reclamationsService: ReclamationsService) {}

  @Post()
  @Roles(UserRole.CLIENT, UserRole.AGENT)
  @ApiOperation({ summary: 'Créer une réclamation (client ↔ agent)' })
  create(@Req() req: Request, @Body() dto: CreateReclamationDto) {
    const user = req.user as { id: string };
    return this.reclamationsService.create(user.id, dto);
  }

  @Get('me')
  @Roles(UserRole.CLIENT, UserRole.AGENT)
  findMine(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.reclamationsService.findMine(user.id);
  }

  @Get('me/:id')
  @Roles(UserRole.CLIENT, UserRole.AGENT)
  findOneForUser(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string };
    return this.reclamationsService.findOneForUser(user.id, id);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.reclamationsService.findAll();
  }

  @Patch('admin/:id')
  @Roles(UserRole.ADMIN)
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateReclamationDto,
  ) {
    const user = req.user as { id: string };
    return this.reclamationsService.update(id, user.id, dto);
  }
}