import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import type { AppOptions, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(serverDir, '..');

// Serverless (Vercel) không có file config cạnh code đã bundle → ưu tiên biến môi
// trường FIREBASE_APPLET_CONFIG (nội dung JSON y hệt file), fallback đọc file.
const firebaseConfig = JSON.parse(
  process.env.FIREBASE_APPLET_CONFIG?.trim() ||
    fs.readFileSync(path.join(projectRoot, 'firebase-applet-config.json'), 'utf8')
) as { projectId: string; firestoreDatabaseId: string };

/**
 * Service account dạng JSON trong biến môi trường (Vercel, hoặc host ngoài GCP
 * không mount được file). Chấp nhận JSON thô hoặc base64 của JSON.
 */
function serviceAccountFromEnv(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) return null;
  const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  return JSON.parse(json) as ServiceAccount;
}

/** Tìm service account JSON (dev local). Hỗ trợ tên file có khoảng trắng đầu do lỗi copy. */
function resolveServiceAccountPath(): string | null {
  const fromEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;

  const candidates = [
    path.join(projectRoot, 'service-account.json'),
    path.join(projectRoot, ' service-account.json'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const envServiceAccount = serviceAccountFromEnv();
const serviceAccountPath = envServiceAccount ? null : resolveServiceAccountPath();
const initOptions: AppOptions = { projectId: firebaseConfig.projectId };

if (envServiceAccount) {
  initOptions.credential = cert(envServiceAccount);
} else if (serviceAccountPath) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8')) as ServiceAccount;
  initOptions.credential = cert(serviceAccount);
} else if (process.env.NODE_ENV !== 'production') {
  console.warn(
    '[firebaseAdmin] No service account file found. Set GOOGLE_APPLICATION_CREDENTIALS or add service-account.json at project root.',
  );
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(initOptions);

export const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(firebaseApp);
