import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reclamation, ReclamationSchema } from './schemas/reclamation.schema';
import { ReclamationsController } from './reclamations.controller';
import { ReclamationsService } from './reclamations.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reclamation.name, schema: ReclamationSchema },
    ]),
    AuditModule,
  ],
  controllers: [ReclamationsController],
  providers: [ReclamationsService],
  exports: [ReclamationsService],
})
export class ReclamationsModule {}