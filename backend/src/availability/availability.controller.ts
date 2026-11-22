import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AvailabilityService } from './availability.service';
import { AvailabilityQueryDto } from './dto/availability-query.dto';

@ApiTags('Availability')
@Controller('agents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CLIENT, UserRole.ADMIN)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get(':id/availability')
  @ApiOperation({ summary: 'Calculer les créneaux réellement disponibles' })
  getAvailability(
    @Param('id') id: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    return this.availabilityService.getAvailability(id, query);
  }
}