import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Thư mục lưu log console
const consoleLogsDir = path.resolve(process.cwd(), 'logs/console');
if (!fs.existsSync(consoleLogsDir)) {
  fs.mkdirSync(consoleLogsDir, { recursive: true });
}

// Định dạng ngày d-m-y (VD: 14-09-2026)
const now = new Date();
const day = String(now.getDate()).padStart(2, '0');
const month = String(now.getMonth() + 1).padStart(2, '0');
const year = now.getFullYear();
const dateStr = `${day}-${month}-${year}`;

const logFilePath = path.join(consoleLogsDir, `${dateStr}.log`);
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Chạy lệnh Turbo được truyền qua arguments (VD: turbo run dev)
const args = process.argv.slice(2);
const command = args[0] || 'turbo';
const commandArgs = args.slice(1);

console.log(`[Logger Wrapper] Đang ghi log console vào: ${logFilePath}`);

const child = spawn(command, commandArgs, {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
});

child.stdout?.on('data', (data) => {
  process.stdout.write(data);
  logStream.write(data);
});

child.stderr?.on('data', (data) => {
  process.stderr.write(data);
  logStream.write(data);
});

child.on('close', (code) => {
  logStream.end();
  process.exit(code ?? 0);
});
