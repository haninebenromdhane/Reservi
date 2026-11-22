import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsNumber, Min } from 'class-validator'; import { Type } from 'class-transformer';
export class AvailabilityQueryDto { @ApiProperty({example:'2026-09-01'}) @IsDateString() from:string; @ApiProperty({example:'2026-09-07'}) @IsDateString() to:string; @ApiPropertyOptional({example:30}) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) duration?:number; }
