import { IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
export class ServiceDto {
  @IsString() @MinLength(2) name: string;
  @IsNumber() @Min(1) duration: number;
  @IsNumber() @Min(0) price: number;
  @IsOptional() @IsString() currency?: string;
}
