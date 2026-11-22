import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ProfessionalValidationAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ValidateProfessionalDto {
  @ApiProperty({ enum: ProfessionalValidationAction })
  @IsEnum(ProfessionalValidationAction)
  action: ProfessionalValidationAction;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}