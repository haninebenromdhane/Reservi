import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { User, UserDocument, UserRole, UserStatus } from '../users/schemas/user.schema';
import { Profession, ProfessionDocument } from '../professions/schemas/profession.schema';

async function seed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule);
  const users = app.get<Model<UserDocument>>(getModelToken(User.name));
  const professions = app.get<Model<ProfessionDocument>>(getModelToken(Profession.name));

  const professionNames = ['Médecin', 'Dentiste', 'Avocat', 'Architecte', 'Coiffeur', 'Comptable', 'Jardinier', 'Plombier'];
  for (const name of professionNames) await professions.updateOne({ name }, { $setOnInsert: { name, active: true } }, { upsert: true }).exec();

  const email = process.env.ADMIN_EMAIL ?? 'admin@reservi.local';
  const password = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const existing = await users.findOne({ email }).select('+password').exec();
  if (!existing) {
    await users.create({ email, password: await bcrypt.hash(password, 12), firstName: 'Admin', lastName: 'Reservi', role: UserRole.ADMIN, status: UserStatus.ACTIVE, emailVerified: true });
  }

  console.log(`Seed complete. Admin: ${email}`);
  await app.close();
}

void seed();
