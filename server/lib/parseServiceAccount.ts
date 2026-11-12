import type { ServiceAccount } from 'firebase-admin/app';

/**
 * Đọc FIREBASE_SERVICE_ACCOUNT (JSON thô hoặc base64), chịu được lỗi copy/paste hay gặp:
 *  - ngoặc kép cong “ ” (Notes/Word/Slack trên Mac)
 *  - private_key có "\n" dạng chữ thay vì xuống dòng thật (bị escape 2 lần)
 * Ném lỗi mô tả rõ nếu thiếu field bắt buộc — tránh lỗi khó hiểu "Failed to parse private key".
 */
export function parseServiceAccount(raw: string): ServiceAccount {
  let text = raw.trim().replace(/^\uFEFF/, '');
  if (!text.startsWith('{') && !/^[\u201C\u201D"]/.test(text)) {
    text = Buffer.from(text, 'base64').toString('utf8').trim();
  }
  text = text
    .replace(/^\uFEFF/, '')
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u00A0/g, ' ');
  // Bị bọc thêm 1 lớp ngoặc kép (dán dạng chuỗi JSON) → bóc ra
  if (text.startsWith('"')) text = JSON.parse(text) as string;

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch (err) {
    throw new Error(`không phải JSON (${(err as Error).message})`);
  }

  const projectId = data.project_id ?? data.projectId;
  const clientEmail = data.client_email ?? data.clientEmail;
  let privateKey = data.private_key ?? data.privateKey;
  const missing = [
    !projectId && 'project_id',
    !clientEmail && 'client_email',
    !privateKey && 'private_key',
  ].filter(Boolean);
  if (missing.length) throw new Error(`thiếu ${missing.join(', ')}`);

  privateKey = String(privateKey).replace(/\\n/g, '\n').replace(/\r/g, '');
  if (!String(privateKey).includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error('private_key không đúng định dạng (thiếu -----BEGIN PRIVATE KEY-----)');
  }

  return {
    projectId: String(projectId),
    clientEmail: String(clientEmail),
    privateKey: String(privateKey),
  };
}
