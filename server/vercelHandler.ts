// Entry của serverless function trên Vercel — scripts/build-vercel.ts bundle file
// này thành .vercel/output/functions/api.func/index.mjs.
// instrument phải import đầu tiên để Sentry.init chạy trước khi app được tạo.
import './instrument';
import { createApp } from './app';

const app = createApp();

export default app;
