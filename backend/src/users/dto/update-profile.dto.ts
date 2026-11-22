import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
export class UpdateProfileDto { @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) firstName?:string; @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) lastName?:string; @ApiPropertyOptional() @IsOptional() @IsEmail() email?:string; @ApiPropertyOptional() @IsOptional() @IsString() phone?:string; @ApiPropertyOptional() @IsOptional() @IsUrl() avatarUrl?:string; }
