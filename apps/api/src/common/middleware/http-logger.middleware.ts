import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');
  private readonly logsDir = path.resolve(process.cwd(), 'logs/common');

  constructor() {
    // Tự động tạo thư mục /logs/common ở gốc dự án nếu chưa có
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip, headers } = req;
    const startTime = Date.now();

    // Lấy thông tin user nếu đã được xác thực (JWT Guard đính kèm req.user)
    const user = (req as any).user ? JSON.stringify((req as any).user) : 'Anonymous';

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      const dateStr = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      const logFileName = `backend-${dateStr}.log`;
      const logFilePath = path.join(this.logsDir, logFileName);

      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${method} ${originalUrl} ${statusCode} - ${duration}ms | User: ${user} | IP: ${ip} | User-Agent: ${headers['user-agent'] || ''}\n`;

      // Ghi log ra file theo ngày
      fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
          this.logger.error(`Không thể ghi log vào file ${logFileName}`, err.stack);
        }
      });

      // Hiển thị console
      if (statusCode >= 400) {
        this.logger.error(`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
      } else {
        this.logger.log(`${method} ${originalUrl} ${statusCode} - ${duration}ms`);
      }
    });

    next();
  }
}
