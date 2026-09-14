import * as fs from 'fs';
import * as path from 'path';

const RETENTION_DAYS = 30;
const logsBaseDir = path.resolve(process.cwd(), 'logs');

function cleanDirectoryLogs(dirPath: string) {
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);
  const now = Date.now();
  const maxAgeMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      cleanDirectoryLogs(filePath);
    } else if (file.endsWith('.log')) {
      const fileAgeMs = now - stat.mtimeMs;
      if (fileAgeMs > maxAgeMs) {
        fs.unlinkSync(filePath);
        console.log(`[Clean Logs] Đã xóa file log cũ (> ${RETENTION_DAYS} ngày): ${filePath}`);
      }
    }
  });
}

console.log(`[Clean Logs] Bắt đầu kiểm tra và dọn dẹp log quá ${RETENTION_DAYS} ngày...`);
cleanDirectoryLogs(logsBaseDir);
console.log(`[Clean Logs] Hoàn tất dọn dẹp log!`);
