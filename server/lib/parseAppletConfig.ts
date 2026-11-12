import vm from 'vm';

/**
 * Đọc nội dung FIREBASE_APPLET_CONFIG một cách "dễ tính".
 *
 * Chấp nhận:
 *  - JSON chuẩn: { "projectId": "...", ... }
 *  - Ngoặc kép/nháy cong “ ” ‘ ’ (do copy qua Notes/Word/Slack) → tự đổi thành ngoặc thẳng
 *  - Object JS: { projectId: '...', apiKey: "...", }  (khoá không ngoặc kép, nháy đơn, dấu phẩy cuối)
 *  - Nguyên đoạn code Firebase Console gợi ý (import ..., // comment, const firebaseConfig = {...};)
 *
 * Thiếu firestoreDatabaseId → dùng "(default)".
 * Nội dung đến từ biến môi trường do chủ project đặt (không phải input người dùng).
 */
export function parseAppletConfig(raw: string): Record<string, string> {
  const text = raw
    .trim()
    .replace(/^﻿/, '')
    .replace(/[“”„‟″]/g, '"')
    .replace(/[‘’‚‛′]/g, "'")
    .replace(/ /g, ' ');
  let obj: unknown;
  try {
    obj = JSON.parse(text);
  } catch {
    const literal = extractObjectLiteral(text);
    if (!literal) {
      throw new Error(
        'FIREBASE_APPLET_CONFIG không hợp lệ: không tìm thấy object { ... }. ' +
          'Dán JSON theo mẫu firebase-applet-config.example.json.'
      );
    }
    try {
      obj = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 });
    } catch (err) {
      throw new Error(
        `FIREBASE_APPLET_CONFIG không hợp lệ (${(err as Error).message}). ` +
          'Dán JSON theo mẫu firebase-applet-config.example.json.'
      );
    }
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('FIREBASE_APPLET_CONFIG phải là một object { ... }.');
  }
  const config: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v !== undefined && v !== null) config[k] = String(v);
  }
  if (!config.projectId) throw new Error('FIREBASE_APPLET_CONFIG thiếu "projectId".');
  if (!config.firestoreDatabaseId) config.firestoreDatabaseId = '(default)';
  return config;
}

/** Lấy đoạn {...} — ưu tiên ngay sau "firebaseConfig =", không thì dấu { đầu tiên. Bỏ qua ngoặc trong chuỗi/comment. */
function extractObjectLiteral(text: string): string | null {
  const named = /firebaseConfig\s*=\s*\{/.exec(text);
  const start = named ? named.index + named[0].length - 1 : firstBrace(text);
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') i = skipString(text, i);
    else if (c === '/' && text[i + 1] === '/') i = skipLine(text, i);
    else if (c === '/' && text[i + 1] === '*') i = skipBlock(text, i);
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

function firstBrace(text: string): number {
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"' || c === "'" || c === '`') i = skipString(text, i);
    else if (c === '/' && text[i + 1] === '/') i = skipLine(text, i);
    else if (c === '/' && text[i + 1] === '*') i = skipBlock(text, i);
    else if (c === '{') return i;
  }
  return -1;
}

function skipString(text: string, i: number): number {
  const q = text[i];
  for (let j = i + 1; j < text.length; j++) {
    if (text[j] === '\\') j++;
    else if (text[j] === q) return j;
  }
  return text.length;
}

function skipLine(text: string, i: number): number {
  const end = text.indexOf('\n', i);
  return end < 0 ? text.length : end;
}

function skipBlock(text: string, i: number): number {
  const end = text.indexOf('*/', i + 2);
  return end < 0 ? text.length : end + 1;
}
