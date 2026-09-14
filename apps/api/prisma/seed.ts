/**
 * Prisma seed script - tạo dữ liệu mẫu cho development
 * Chạy: pnpm db:seed (trong apps/api)
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@lupbi/shared-types';

const prisma = new PrismaClient();

async function main() {
  const SALT_ROUNDS = 12;

  const seedUsers = [
    {
      email: 'admin@lupbi.com',
      password: 'Admin@123!',
      fullName: 'LupBI Administrator',
      role: UserRole.ADMIN,
    },
    {
      email: 'creator@lupbi.com',
      password: 'Creator@123!',
      fullName: 'Dashboard Creator',
      role: UserRole.CREATOR,
    },
    {
      email: 'viewer@lupbi.com',
      password: 'Viewer@123!',
      fullName: 'Report Viewer',
      role: UserRole.VIEWER,
    },
  ];

  console.log('🌱 Seeding users...');

  for (const u of seedUsers) {
    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        fullName: u.fullName,
        role: u.role,
      },
    });
    console.log(`  ✅ Upserted user: ${u.email}`);
  }

  console.log('✨ Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
