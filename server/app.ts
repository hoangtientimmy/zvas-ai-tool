// Express app dùng chung cho mọi môi trường chạy:
// - server.ts (dev + Cloud Run/Docker): thêm Vite dev middleware hoặc serve dist/, rồi listen.
// - server/vercelHandler.ts (Vercel): export app làm serverless function; static do CDN Vercel serve.
import * as Sentry from '@sentry/node';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import type { HelmetOptions } from 'helmet';
import { registerApiRoutes } from './routes/index';

/** CSP production — dùng cho Express và cho header static trên Vercel (scripts/build-vercel.ts). */
export const PROD_CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  // 'unsafe-inline' required for Vite module preload injections; tighten with hashes if needed
  scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],
  scriptSrcElem: ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],
  styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  styleSrcElem: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
  connectSrc: [
    "'self'",
    'https://*.googleapis.com',
    'https://*.google.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'https://api.openai.com',
    'https://*.bytepluses.com',
    'https://api.seedance.com',
    // Sentry error/tracing beacons (ingest host phụ thuộc region của DSN).
    'https://*.sentry.io',
  ],
  fontSrc: ["'self'", 'data:', 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
  frameSrc: ["'none'"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
};

export function helmetOptions(isProd: boolean): HelmetOptions {
  return {
    contentSecurityPolicy: isProd ? { directives: PROD_CSP_DIRECTIVES } : false,
  };
}

export function createApp(): express.Express {
  const app = express();
  const isProd = process.env.NODE_ENV === 'production';

  app.use(helmet(helmetOptions(isProd)));

  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  if (isProd && !allowedOriginsEnv) {
    console.warn(
      '[WARN] ALLOWED_ORIGINS is not set — all cross-origin requests are blocked in production. ' +
        'Set ALLOWED_ORIGINS=https://your-domain.com to allow browser clients.'
    );
  }
  app.use(
    cors({
      origin: allowedOriginsEnv
        ? (origin, cb) => {
            const list = allowedOriginsEnv.split(',').map((o) => o.trim());
            cb(null, !origin || list.includes(origin));
          }
        : isProd
          ? false
          : true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    const entityErr = err as { type?: string };
    if (entityErr?.type === 'entity.too.large') {
      return res.status(413).json({
        error: 'Request payload too large. Please use a smaller image or compress before upload.',
      });
    }
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ error: 'Invalid JSON payload.' });
    }
    return next(err);
  });

  app.get('/_health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  registerApiRoutes(app);

  // Phải đăng ký sau routes để bắt được lỗi từ chúng, và trước fallback SPA/static.
  Sentry.setupExpressErrorHandler(app);

  return app;
}
