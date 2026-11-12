// Entry của serverless function trên Vercel — scripts/build-vercel.ts bundle file
// này thành .vercel/output/functions/api.func/index.mjs.
// instrument phải import đầu tiên để Sentry.init chạy trước khi app được tạo.
import './instrument';
import type { IncomingMessage, ServerResponse } from 'http';

// Import động: nếu khởi tạo lỗi (thường do biến môi trường Firebase sai) thì vẫn trả
// JSON mô tả lỗi thay vì Vercel báo 500 FUNCTION_INVOCATION_FAILED trống trơn.
const appPromise = import('./app').then((m) => m.createApp());
appPromise.catch((err) => console.error('[vercel] Khởi tạo server thất bại:', err));

/** Chỉ lộ thông báo cấu hình do code tự viết; bỏ phần trong ngoặc (có thể chứa trích đoạn giá trị biến). */
function safeInitMessage(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/^FIREBASE_[A-Z_]+ /.test(msg)) return msg.replace(/\s*\([^)]*\)/g, '');
  return 'Khởi tạo server thất bại — xem Vercel → Logs để biết chi tiết.';
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  let app: Awaited<typeof appPromise>;
  try {
    app = await appPromise;
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ error: 'server_misconfigured', message: safeInitMessage(err) }));
    return;
  }
  return app(req as never, res as never);
}
