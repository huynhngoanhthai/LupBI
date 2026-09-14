import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("AllExceptionsFilter");
  private readonly logsDir = path.resolve(process.cwd(), 'logs/common');

  constructor() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as Error)?.message || "Internal Server Error" };

    const user = (request as any).user
      ? JSON.stringify((request as any).user)
      : "Anonymous";
    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split("T")[0]; // YYYY-MM-DD
    const logFileName = `backend-${dateStr}.log`;
    const logFilePath = path.join(this.logsDir, logFileName);

    const errorLogMessage = `[ERROR] [${timestamp}] ${request.method} ${request.url} ${status} | User: ${user} | Payload Sent/Response: ${JSON.stringify(exceptionResponse)} | Stack: ${(exception as Error)?.stack || "N/A"}\n`;

    // Ghi log chi tiết lỗi ra file theo ngày
    fs.appendFile(logFilePath, errorLogMessage, (err) => {
      if (err) {
        this.logger.error(
          `Không thể ghi log lỗi vào file ${logFileName}`,
          err.stack,
        );
      }
    });

    this.logger.error(
      `${request.method} ${request.url} ${status} - Error: ${JSON.stringify(exceptionResponse)}`,
    );

    response.status(status).json({
      statusCode: status,
      timestamp,
      path: request.url,
      ...(typeof exceptionResponse === "object"
        ? exceptionResponse
        : { message: exceptionResponse }),
    });
  }
}
