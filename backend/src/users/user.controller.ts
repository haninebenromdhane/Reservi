import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

mkdirSync('uploads/avatars', { recursive: true });

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Récupérer mon profil' })
  getMe(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Modifier mon profil' })
  updateMe(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const user = req.user as { id: string };
    return this.usersService.updateProfile(user.id, dto);
  }

  @Post('me/avatar')
  @ApiOperation({ summary: 'Mettre à jour ma photo de profil' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads/avatars',
        filename: (_req, file, cb) =>
          cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`,
          ),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } },
  })
  updateAvatar(
    @Req() req: Request,
    @UploadedFile()
    file: { filename: string; mimetype: string; size: number } | undefined,
  ) {
    if (!file) {
      throw new BadRequestException('Image JPG, PNG, WEBP ou GIF requise (5 Mo maximum).');
    }

    const user = req.user as { id: string };
    return this.usersService.updateAvatar(user.id, `/uploads/avatars/${file.filename}`);
  }

  @Patch('me/password')
  @ApiOperation({
    summary:
      'Demander un changement de mot de passe (envoie un e-mail de confirmation)',
  })
  updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    const user = req.user as { id: string };
    const origin = (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',')[0].trim();
    return this.usersService.requestPasswordChange(user.id, dto, origin);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Supprimer mon compte' })
  deleteMe(@Req() req: Request) {
    const user = req.user as { id: string };
    return this.usersService.removeAccount(user.id);
  }

  @Get('admin/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lister les utilisateurs' })
  listAll() {
    return this.usersService.listForAdmin();
  }
}