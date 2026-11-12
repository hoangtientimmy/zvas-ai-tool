import path from 'path';
import { defineConfig } from 'vite';
import type { HtmlTagDescriptor, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import dotenv from 'dotenv';

// Vite không tự nạp .env.local/.env vào process.env cho chính file config này
// (chỉ dùng để build import.meta.env phía client) — phải nạp thủ công để đọc
// SENTRY_ORG/SENTRY_PROJECT/SENTRY_AUTH_TOKEN ở dưới.
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Thông tin riêng của từng nơi deploy — không hardcode trong index.html:
 * - VITE_SITE_URL: domain public (vd. https://app.example.com) → canonical, og:url, og:image.
 * - VITE_GA_MEASUREMENT_ID: GA4 (vd. G-XXXXXXXXXX) → nạp gtag.js. Thiếu thì không có GA.
 */
function siteMetaPlugin(): Plugin {
  const escapeAttr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return {
    name: 'site-meta',
    transformIndexHtml() {
      const tags: HtmlTagDescriptor[] = [];
      const siteUrl = process.env.VITE_SITE_URL?.trim().replace(/\/+$/, '');
      if (siteUrl) {
        const url = `${siteUrl}/`;
        const image = `${siteUrl}/og-image.jpeg`;
        tags.push(
          { tag: 'link', attrs: { rel: 'canonical', href: url }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:url', content: url }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'og:image', content: image }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'twitter:url', content: url }, injectTo: 'head' },
          { tag: 'meta', attrs: { property: 'twitter:image', content: image }, injectTo: 'head' }
        );
      }
      const gaId = process.env.VITE_GA_MEASUREMENT_ID?.trim();
      if (gaId) {
        if (!/^G-[A-Z0-9]+$/.test(gaId)) throw new Error(`VITE_GA_MEASUREMENT_ID không hợp lệ: ${escapeAttr(gaId)}`);
        tags.push(
          {
            tag: 'script',
            attrs: { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${gaId}` },
            injectTo: 'head',
          },
          {
            tag: 'script',
            children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`,
            injectTo: 'head',
          }
        );
      }
      return tags;
    },
  };
}

export default defineConfig(() => {
    // Chỉ upload source maps khi có đủ config (CI/build release) — build local không cần.
    const canUploadSourceMaps = Boolean(
      process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
    );

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          port: 24679,
          clientPort: 24679,
          host: 'localhost',
        },
      },
      plugins: [
        react(),
        siteMetaPlugin(),
        tailwindcss(),
        // Phải là plugin cuối cùng để thấy được output final của các plugin khác.
        canUploadSourceMaps &&
          sentryVitePlugin({
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            sourcemaps: {
              filesToDeleteAfterUpload: ['./dist/**/*.map'],
            },
          }),
      ],
      optimizeDeps: {
        include: ['p-retry'],
        exclude: ['@google/genai', 'firebase', 'gaxios', 'node-fetch', 'formdata-polyfill', 'whatwg-fetch', 'isomorphic-fetch', 'cross-fetch', 'unfetch', 'isomorphic-unfetch', 'isomorphic-form-data', 'form-data']
      },
      build: {
        // Chỉ sinh source maps khi thực sự upload lên Sentry — tránh .map bị serve công khai ở build local.
        sourcemap: canUploadSourceMaps ? 'hidden' : false,
        // Firebase + Firestore SDK ~560 kB minified — split sub-chunks to avoid single >500 kB warning.
        chunkSizeWarningLimit: 600,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (/node_modules\/(react\/|react-dom\/|scheduler\/)/.test(id)) {
                return 'react-vendor';
              }
              if (
                id.includes('node_modules/@firebase/firestore') ||
                id.includes('node_modules/firebase/firestore')
              ) {
                return 'firebase-firestore-vendor';
              }
              if (
                id.includes('node_modules/@firebase/auth') ||
                id.includes('node_modules/firebase/auth')
              ) {
                return 'firebase-auth-vendor';
              }
              if (
                id.includes('node_modules/@firebase/app') ||
                id.includes('node_modules/firebase/app')
              ) {
                return 'firebase-app-vendor';
              }
              if (id.includes('node_modules/@firebase/') || id.includes('node_modules/firebase/')) {
                return 'firebase-misc-vendor';
              }
              if (id.includes('node_modules/lucide-react/')) {
                return 'lucide-vendor';
              }
              if (id.includes('node_modules/recharts/')) {
                return 'recharts-vendor';
              }
              if (id.includes('node_modules/sonner/')) {
                return 'sonner-vendor';
              }
              if (id.includes('node_modules/@sentry/')) {
                return 'sentry-vendor';
              }
              return undefined;
            },
          },
        },
      },
      resolve: {
        alias: [
          { find: '@', replacement: path.resolve(__dirname, '.') },
          { find: 'p-retry', replacement: path.resolve(__dirname, './shims/p-retry-shim.ts') },
          { find: 'formdata-polyfill/esm.min.js', replacement: path.resolve(__dirname, './shims/formdata-shim.js') },
          { find: 'formdata-polyfill/FormData.js', replacement: path.resolve(__dirname, './shims/formdata-shim.js') },
          { find: /formdata-polyfill/, replacement: path.resolve(__dirname, './shims/formdata-shim.js') },
          { find: /isomorphic-form-data/, replacement: path.resolve(__dirname, './shims/formdata-shim.js') },
          { find: /form-data/, replacement: path.resolve(__dirname, './shims/formdata-shim.js') },
          { find: /node-fetch/, replacement: path.resolve(__dirname, './shims/node-fetch-shim.js') },
          { find: /whatwg-fetch/, replacement: path.resolve(__dirname, './shims/whatwg-fetch-shim.js') },
          { find: /isomorphic-fetch/, replacement: path.resolve(__dirname, './shims/whatwg-fetch-shim.js') },
          { find: /cross-fetch/, replacement: path.resolve(__dirname, './shims/whatwg-fetch-shim.js') },
          { find: /unfetch/, replacement: path.resolve(__dirname, './shims/whatwg-fetch-shim.js') },
          { find: /isomorphic-unfetch/, replacement: path.resolve(__dirname, './shims/whatwg-fetch-shim.js') },
        ]
      }
    };
});
