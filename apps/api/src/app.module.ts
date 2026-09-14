import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  I18nModule,
  HeaderResolver,
  QueryResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // Rate Limiting global - chống Brute Force (5 req / 60s tại /login)
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 10,
      },
    ]),

    // Multi-language i18n cho Backend - mặc định: vi
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loaderOptions: {
        path: path.join(process.cwd(), 'i18n/api/'),
        watch: true,
      },
      resolvers: [
        new QueryResolver(['lang', 'l']),
        new HeaderResolver(['x-lang', 'accept-language']),
        new AcceptLanguageResolver(),
      ],
    }),

    PrismaModule,
    AuthModule,
    AdminModule, // Module quản lý RBAC AUTH-02
  ],
})
export class AppModule {}
