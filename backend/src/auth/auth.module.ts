import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Professional, ProfessionalSchema } from '../professionals/schemas/professional.schema';
import { Profession, ProfessionSchema } from '../professions/schemas/profession.schema';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Professional.name, schema: ProfessionalSchema },
      { name: Profession.name, schema: ProfessionSchema },
    ]),
    PassportModule,
    JwtModule.register({}),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}

