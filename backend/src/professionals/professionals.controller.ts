import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ProfessionalsService } from './professionals.service';
import { CreateProfessionalDto } from './dto/create-professional.dto';
import { UpdateProfessionalDto } from './dto/update-professional.dto';
import { ServiceDto } from './dto/service.dto';

mkdirSync('uploads/professional-documents', { recursive: true });

@ApiTags('Professionals')
@ApiBearerAuth('bearer')
@Controller('professionals')
export class ProfessionalsController {
  constructor(private readonly professionalsService: ProfessionalsService) {}

  @Get() findAll(@Req() req: Request) { const q=req.query as Record<string,string|undefined>; return this.professionalsService.findAll(q.profession,q.city,q.keyword,q.sort,q.page?Number(q.page):undefined,q.pageSize?Number(q.pageSize):undefined); }
  @Get('me') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.AGENT) findMe(@Req() req: Request) { return this.professionalsService.findMyProfile((req.user as {id:string}).id); }
  @Patch('me') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.AGENT) updateMe(@Req() req: Request,@Body() dto:UpdateProfessionalDto){return this.professionalsService.updateMyProfile((req.user as {id:string}).id,dto);}
  @Post('me/services') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.AGENT) addService(@Req() req:Request,@Body() dto:ServiceDto){return this.professionalsService.addService((req.user as {id:string}).id,dto);}
  @Patch('me/services/:serviceId') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.AGENT) updateService(@Req() req:Request,@Param('serviceId') serviceId:string,@Body() dto:ServiceDto){return this.professionalsService.updateService((req.user as {id:string}).id,serviceId,dto);}
  @Delete('me/services/:serviceId') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.AGENT) deleteService(@Req() req:Request,@Param('serviceId') serviceId:string){return this.professionalsService.deleteService((req.user as {id:string}).id,serviceId);}
  @Post('me/documents') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.AGENT) @UseInterceptors(FileInterceptor('file',{storage:diskStorage({destination:'uploads/professional-documents',filename:(_r,file,cb)=>cb(null,`${Date.now()}-${Math.round(Math.random()*1e9)}${extname(file.originalname)}`)}),limits:{fileSize:10*1024*1024},fileFilter:(_r,file,cb)=>{const allowed=['application/pdf','image/jpeg','image/png']; cb(null,allowed.includes(file.mimetype));}})) @ApiConsumes('multipart/form-data') @ApiBody({schema:{type:'object',properties:{file:{type:'string',format:'binary'}}}}) async addDocument(@Req() req:Request,@UploadedFile() file: {originalname:string;filename:string;mimetype:string;size:number}|undefined){if(!file) throw new BadRequestException('Fichier PDF, JPG ou PNG requis.'); return this.professionalsService.addDocument((req.user as {id:string}).id,file);}
  @Delete('me/documents/:documentId') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.AGENT) deleteDocument(@Req() req:Request,@Param('documentId') documentId:string){return this.professionalsService.deleteDocument((req.user as {id:string}).id,documentId);}
  @Get(':id/details') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.CLIENT, UserRole.ADMIN) findDetails(@Param('id') id:string){return this.professionalsService.findDetails(id);}
  @Get(':id') findOne(@Param('id') id:string){return this.professionalsService.findOne(id);}
  @Post() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.AGENT) create(@Req() req:Request,@Body() dto:CreateProfessionalDto){return this.professionalsService.create((req.user as {id:string}).id,dto);}
  @Patch(':id/approve') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) approve(@Param('id') id:string){return this.professionalsService.approve(id);}
  @Patch(':id/reject') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) reject(@Param('id') id:string,@Body() body:{reason?:string}){return this.professionalsService.reject(id,body.reason);}
  @Get('admin/pending') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) pending(){return this.professionalsService.findPending();}
  @Get('admin/all') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.ADMIN) all(){return this.professionalsService.findAllForAdmin();}
}
