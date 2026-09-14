import * as fs from 'fs';
import * as path from 'path';

/**
 * Script tự động đọc file translate.csv từ ./i18n/api và ./i18n/web,
 * sau đó tách các cột ngôn ngữ (vi, en, cn,...) thành các tệp JSON tương ứng.
 */

// Đơn giản hóa hàm parse CSV hỗ trợ dấu phẩy và ngoặc kép
function parseCSV(content: string): string[][] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.map((line) => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
}

// Gán giá trị vào object theo dot notation (ví dụ: "auth.login" -> { auth: { login: "..." } })
function setDeepValue(obj: Record<string, any>, keyPath: string, value: string) {
  const keys = keyPath.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!current[k] || typeof current[k] !== 'object') {
      current[k] = {};
    }
    current = current[k];
  }

  current[keys[keys.length - 1]] = value;
}

function processDirectory(dirPath: string) {
  const csvPath = path.join(dirPath, 'translate.csv');

  if (!fs.existsSync(csvPath)) {
    console.log(`⚠️ Không tìm thấy ${csvPath}, bỏ qua.`);
    return;
  }

  console.log(`📄 Đang xử lý: ${csvPath}`);
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);

  if (rows.length < 2) {
    console.log(`⚠️ ${csvPath} không đủ dòng dữ liệu.`);
    return;
  }

  const header = rows[0]; // [ 'key', 'vi', 'en', 'cn', ... ]
  if (header[0].toLowerCase() !== 'key') {
    console.error(`❌ Cột đầu tiên trong ${csvPath} phải là "key"`);
    return;
  }

  const languages = header.slice(1); // [ 'vi', 'en', 'cn', ... ]
  const langMaps: Record<string, Record<string, any>> = {};

  languages.forEach((lang) => {
    langMaps[lang.toLowerCase()] = {};
  });

  // Duyệt qua từng dòng dữ liệu
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const key = row[0];
    if (!key) continue;

    for (let c = 1; c < header.length; c++) {
      const lang = header[c].toLowerCase();
      const val = row[c] ?? '';
      if (langMaps[lang]) {
        setDeepValue(langMaps[lang], key, val);
      }
    }
  }

  // Ghi các file JSON (vi.json, en.json, cn.json,...)
  languages.forEach((lang) => {
    const langCode = lang.toLowerCase();
    const jsonPath = path.join(dirPath, `${langCode}.json`);
    const jsonContent = JSON.stringify(langMaps[langCode], null, 2);
    fs.writeFileSync(jsonPath, jsonContent, 'utf-8');
    console.log(`  ✅ Đã xuất: ${jsonPath}`);
  });
}

function main() {
  const rootDir = process.cwd();
  const targets = [
    path.join(rootDir, 'i18n', 'api'),
    path.join(rootDir, 'i18n', 'web'),
  ];

  console.log('🌐 Bắt đầu tách tệp đa ngôn ngữ (i18n)...');
  targets.forEach((target) => processDirectory(target));
  console.log('✨ Tách tệp i18n hoàn tất thành công!');
}

main();
