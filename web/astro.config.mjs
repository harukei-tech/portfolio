// @ts-check
import process from 'node:process';
import { defineConfig } from 'astro/config';

// GitHub Pages 用の設定。GitHub Actions から SITE / BASE_PATH が渡される。
// - ユーザーサイト (https://<user>.github.io)        → BASE_PATH は空
// - プロジェクトサイト (https://<user>.github.io/<repo>) → BASE_PATH=/<repo>
export default defineConfig({
  site: process.env.SITE ?? 'http://localhost:4321',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: false,
    },
  },
  vite: {
    server: {
      // Windows のフォルダを Docker にマウントするとファイル変更通知が届かないため、
      // コンテナ内ではポーリングで変更を検知してホットリロードする（compose.yaml で有効化）
      watch: process.env.WATCH_POLLING === 'true' ? { usePolling: true, interval: 500 } : undefined,
    },
  },
});
