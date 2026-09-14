import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import {
  I18nModule,
  HeaderResolver,
  QueryResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import * as fs from 'fs';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { DataSourceModule } from './modules/datasource/datasource.module';

/**
 * Hàm tìm kiếm đường dẫn thư mục i18n/api một cách triệt để
 * Đảm bảo tìm thấy đúng thư mục bất kể khởi động từ Root, apps/api hay dist/
 */
function getI18nApiPath(): string {
  const candidates = [
    path.join(process.cwd(), 'i18n/api'),
    path.join(process.cwd(), '../../i18n/api'),
    path.join(process.cwd(), '../i18n/api'),
    path.resolve(__dirname, '../../../../i18n/api'),
    path.resolve(__dirname, '../../../i18n/api'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return path.join(process.cwd(), 'i18n/api');
}

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 10,
      },
    ]),

    // Multi-language i18n cho Backend - đường dẫn an toàn tuyệt đối
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loaderOptions: {
        path: getI18nApiPath(),
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
    AdminModule,
    DataSourceModule,
  ],
})
export class AppModule {}
