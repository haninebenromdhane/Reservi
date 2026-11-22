import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  User,
  UserDocument,
  UserRole,
  UserStatus,
} from '../../users/schemas/user.schema';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey:
        configService.getOrThrow<string>(
          'JWT_ACCESS_SECRET',
        ),
    });
  }

  async validate(payload: JwtPayload) {
    const user =
      await this.userModel
        .findOne({
          _id: payload.sub,
          deleted: false,
          status: UserStatus.ACTIVE,
        })
        .select('email role status')
        .exec();

    if (!user) {
      throw new UnauthorizedException(
        'Compte non disponible.',
      );
    }

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };
  }
}