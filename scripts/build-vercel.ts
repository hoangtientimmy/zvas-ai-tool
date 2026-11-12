/**
 * Build cho Vercel theo Build Output API v3 (https://vercel.com/docs/build-output-api/v3).
 * Chạy bởi `npm run vercel-build` (Vercel tự gọi script này khi build).
 *
 * Kết quả trong .vercel/output/:
 *   static/              ← dist/ của Vite, serve qua CDN
 *   functions/api.func/  ← Express API (server/vercelHandler.ts) bundle bằng esbuild,
 *                          node_modules cần thiết lấy bằng @vercel/nft
 *   config.json          ← routes: /api/* và /_health → function; còn lại SPA fallback
 *
 * Tự viết bundle thay vì để Vercel build thư mục api/ vì server dùng ESM với import
 * không đuôi .js — @vercel/node transpile từng file sẽ lỗi ERR_MODULE_NOT_FOUND lúc chạy.
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';
import { nodeFileTrace } from '@vercel/nft';
import helmet from 'helmet';
import { parseAppletConfig } from '../server/lib/parseAppletConfig';
// Không import tĩnh '../server/app': ESM hoist import lên trước mọi code, kéo theo
// server/firebaseAdmin.ts đọc firebase-applet-config.json TRƯỚC khi bước 1 kịp ghi file
// → ENOENT. Import động ở bước 4, sau khi config đã sẵn sàng.

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, '.vercel/output');
const funcDir = path.join(outDir, 'functions/api.func');
const tmpDir = path.join(root, '.vercel/fn-build');

/** Thời gian tối đa của function (giây). Gemini có budget 240s (server/lib/geminiGenerate.ts). */
const MAX_DURATION_S = 300;

function step(msg: string) {
  console.log(`\n[build-vercel] ${msg}`);
}

// 1) firebase-applet-config.json không có trong Git — frontend import lúc build.
const configPath = path.join(root, 'firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  const fromEnv = process.env.FIREBASE_APPLET_CONFIG?.trim();
  if (!fromEnv) {
    console.error(
      '[build-vercel] Thiếu firebase-applet-config.json và biến môi trường FIREBASE_APPLET_CONFIG.\n' +
        'Vercel → Project Settings → Environment Variables → thêm FIREBASE_APPLET_CONFIG = nội dung file JSON.'
    );
    process.exit(1);
  }
  // Chấp nhận JSON, ngoặc cong, hoặc nguyên đoạn code Firebase Console; ghi lại thành JSON chuẩn.
  fs.writeFileSync(configPath, JSON.stringify(parseAppletConfig(fromEnv), null, 2));
  step('Đã ghi firebase-applet-config.json từ FIREBASE_APPLET_CONFIG');
}

// 2) Frontend
step('vite build');
execSync('npx vite build', { cwd: root, stdio: 'inherit' });

fs.rmSync(outDir, { recursive: true, force: true });
fs.rmSync(tmpDir, { recursive: true, force: true });
fs.mkdirSync(funcDir, { recursive: true });
fs.cpSync(path.join(root, 'dist'), path.join(outDir, 'static'), { recursive: true });

// 3) API function: bundle code của mình, giữ node_modules bên ngoài.
step('esbuild server/vercelHandler.ts');
const bundlePath = path.join(tmpDir, 'index.mjs');
await build({
  entryPoints: [path.join(root, 'server/vercelHandler.ts')],
  outfile: bundlePath,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  packages: 'external',
  sourcemap: false,
  logLevel: 'warning',
});

step('nft trace node_modules');
const { fileList } = await nodeFileTrace([bundlePath], { base: root });
let copied = 0;
for (const rel of fileList) {
  const abs = path.join(root, rel);
  if (abs === bundlePath || rel.startsWith('.vercel/')) continue;
  if (!fs.statSync(abs).isFile()) continue;
  const dest = path.join(funcDir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(abs, dest);
  copied++;
}
fs.copyFileSync(bundlePath, path.join(funcDir, 'index.mjs'));
fs.rmSync(tmpDir, { recursive: true, force: true });
console.log(`[build-vercel] function: ${copied} file phụ thuộc`);

fs.writeFileSync(
  path.join(funcDir, '.vc-config.json'),
  JSON.stringify(
    {
      runtime: 'nodejs22.x',
      handler: 'index.mjs',
      launcherType: 'Nodejs',
      shouldAddHelpers: false,
      supportsResponseStreaming: true,
      maxDuration: MAX_DURATION_S,
      environment: { NODE_ENV: 'production' },
    },
    null,
    2
  )
);

// 4) Header bảo mật cho file static — lấy đúng header helmet set cho Express production.
const { helmetOptions } = await import('../server/app');
const securityHeaders: Record<string, string> = {};
helmet(helmetOptions(true))(
  {} as never,
  {
    setHeader: (k: string, v: string) => {
      securityHeaders[k.toLowerCase()] = String(v);
    },
    removeHeader: (k: string) => {
      delete securityHeaders[k.toLowerCase()];
    },
  } as never,
  () => {}
);

fs.writeFileSync(
  path.join(outDir, 'config.json'),
  JSON.stringify(
    {
      version: 3,
      routes: [
        { src: '^/(api(?:/.*)?|_health)$', dest: '/api' },
        {
          src: '^/assets/(.*)$',
          headers: { 'cache-control': 'public, max-age=31536000, immutable' },
          continue: true,
        },
        { src: '^/(.*)$', headers: securityHeaders, continue: true },
        { handle: 'filesystem' },
        { src: '^/(.*)$', dest: '/index.html' },
      ],
    },
    null,
    2
  )
);

step(`Xong → ${path.relative(root, outDir)}`);
