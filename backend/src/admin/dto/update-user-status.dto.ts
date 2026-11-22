import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserStatus } from '../../users/schemas/user.schema';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status: UserStatus;
}