import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfessionsService } from './professions.service';
import { CreateProfessionDto } from './dto/create-profession.dto';
import { UpdateProfessionDto } from './dto/update-profession.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('Professions')
@Controller('professions')
export class ProfessionsController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Get()
  findAll() {
    return this.professionsService.findAll();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer')
  findAllForAdmin() {
    return this.professionsService.findAllForAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.professionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Créer une profession' })
  create(@Body() dto: CreateProfessionDto) {
    return this.professionsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer')
  update(@Param('id') id: string, @Body() dto: UpdateProfessionDto) {
    return this.professionsService.update(id, dto);
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer')
  activate(@Param('id') id: string) {
    return this.professionsService.activate(id);
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer')
  deactivate(@Param('id') id: string) {
    return this.professionsService.deactivate(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer')
  remove(@Param('id') id: string) {
    return this.professionsService.remove(id);
  }
}