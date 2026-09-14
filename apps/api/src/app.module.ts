import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // Rate Limiting global - chống Brute Force
    // Mặc định: 10 req / 60s. Riêng /login sẽ override chặt hơn (5 req / 60s)
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 60 giây (milliseconds)
        limit: 10,
      },
    ]),

    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {}
