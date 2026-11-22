import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth('bearer')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  findMine(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.notificationsService.findMine(user.id);
  }

  @Patch('me/read-all')
  markAllRead(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.notificationsService.markAllRead(user.id);
  }

  @Patch('me/:id/read')
  markRead(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string };
    return this.notificationsService.markRead(user.id, id);
  }
}