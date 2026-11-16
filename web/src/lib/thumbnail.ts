import type { ImageMetadata } from 'astro';
import type { AnyEntry } from './sections';

/**
 * 各コンテンツフォルダの images/ にある画像（ビルド時に読み込み、最適化の対象になる）。
 * キーは /src/content/bots/images/foo.png のようなパス。
 */
const images = import.meta.glob<ImageMetadata>('/src/content/*/images/*.{png,jpg,jpeg,webp,avif,gif}', {
  eager: true,
  import: 'default',
});

// 大文字・小文字を区別せずに探せるよう、「フォルダ/images/拡張子なしのファイル名」で引けるようにしておく
const byName = new Map<string, ImageMetadata>();
for (const [path, image] of Object.entries(images)) {
  byName.set(path.replace(/\.[^.]+$/, '').toLowerCase(), image);
}

/**
 * 記事のサムネイル画像を返す。
 * 1. frontmatter の thumbnail があればそれを使う
 * 2. なければ、記事と同じフォルダの images/ にある「.md と同じ名前」の画像を使う
 *    （例: bots/hr-bot.md → bots/images/hr-bot.png）
 * 3. どちらもなければ undefined（代わりの画像を表示する）
 */
export function resolveThumbnail(entry: AnyEntry): ImageMetadata | undefined {
  if (entry.data.thumbnail) return entry.data.thumbnail;
  if (!entry.filePath) return undefined;

  // filePath は src/content/bots/hr-bot.md のような、プロジェクトからの相対パス
  const match = entry.filePath.replace(/\\/g, '/').match(/^(.*)\/([^/]+)\.mdx?$/);
  if (!match) return undefined;
  const [, dir, name] = match;
  return byName.get(`/${dir}/images/${name}`.toLowerCase());
}
