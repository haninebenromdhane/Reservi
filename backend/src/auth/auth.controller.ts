import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterClientDto } from './dto/register-client.dto';
import { RegisterAgentDto } from './dto/register-agent.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from '../users/schemas/user.schema';

type RegistrationFile = { originalname: string; filename: string; mimetype: string; size: number };
mkdirSync('uploads/professional-documents', { recursive: true });

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register/client')
  @ApiOperation({ summary: 'Créer un compte client' })
  registerClient(@Body() dto: RegisterClientDto) { return this.authService.registerClient(dto); }

  @Post('register/agent')
  @ApiOperation({ summary: 'Créer un compte agent avec dossier justificatif' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('documents', 10, {
    storage: diskStorage({
      destination: 'uploads/professional-documents',
      filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`),
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => cb(null, ['application/pdf','image/jpeg','image/png'].includes(file.mimetype)),
  }))
  async registerAgent(@Body() dto: RegisterAgentDto, @UploadedFiles() files: RegistrationFile[]) {
    if (!files?.length) throw new BadRequestException('Au moins un document justificatif est obligatoire.');
    return this.authService.registerAgent(dto, files);
  }

  @Post('login')
  @ApiOperation({ summary: 'Se connecter' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(response, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.refreshToken;
    const result = await this.authService.refresh(refreshToken ?? '');
    this.setRefreshCookie(response, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/auth' });
    return { message: 'Déconnexion réussie.' };
  }

  @Post('forgot-password') forgotPassword(@Body() dto: ForgotPasswordDto) { return this.authService.forgotPassword(dto); }
  @Post('reset-password') resetPassword(@Body() dto: ResetPasswordDto) { return this.authService.resetPassword(dto); }

  @Post('confirm-password-change')
  @ApiOperation({
    summary:
      "Confirmer, via le lien reçu par e-mail, un changement de mot de passe demandé depuis l'espace personnel",
  })
  confirmPasswordChange(@Body('token') token: string) {
    return this.usersService.confirmPasswordChange(token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  me(@Req() request: Request) { return request.user; }

  @Get('test/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('bearer')
  testAdmin() { return { message: 'Accès administrateur autorisé.' }; }

  private setRefreshCookie(response: Response, refreshToken: string) {
    response.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/auth' });
  }
}
