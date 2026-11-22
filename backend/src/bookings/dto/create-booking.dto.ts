import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';
export class CreateBookingDto {
 @IsString() @IsNotEmpty() professionalId:string;
 @IsDateString() date:string;
 @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) startTime:string;
 @Matches(/^([01]\d|2[0-3]):[0-5]\d$/) endTime:string;
 @IsOptional() @IsString() @MaxLength(200) reason?:string;
 @IsOptional() @IsString() @MaxLength(1000) clientNote?:string;
 @IsOptional() @IsMongoId() serviceId?:string;
 @IsOptional() @IsNumber() @Min(0) servicePrice?:number;
 @IsOptional() @IsNumber() @Min(1) serviceDuration?:number;
 @IsOptional() @IsString() serviceName?:string;
}
