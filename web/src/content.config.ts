import { defineCollection, z, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';

/** owner/repo 形式、または https://github.com/owner/repo の URL を受け付け、owner/repo に揃える */
const repo = z
  .string()
  .transform((v) => v.trim().replace(/^https?:\/\/github\.com\//, '').replace(/(\.git)?\/?$/, ''))
  .pipe(z.string().regex(/^[\w.-]+\/[\w.-]+$/, 'owner/repo 形式か GitHub の URL で指定してください'))
  .optional();

/**
 * サムネイル画像。記事の .md からの相対パスで指定する（例: ./images/hr-bot.png）。
 * 省略すると、プラットフォーム名などから自動生成した画像が表示される。
 */
const thumbnail = ({ image }: SchemaContext) => ({
  thumbnail: image().optional(),
  /** 画像の説明（読み上げ用）。省略時はタイトルを使う */
  thumbnailAlt: z.string().optional(),
});

const MONTH_ONLY = /^\d{4}-\d{2}$/;

/** 日付。日付が分からなければ 2026-03 のように月までで書ける（「2026/03」と表示） */
const flexibleDate = z.union([
  z.date(),
  z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'YYYY-MM-DD か YYYY-MM で指定してください'),
]);

/** flexibleDate の pubDate を Date に揃え、月までの指定かどうかを pubMonthOnly に残す */
const normalizePubDate = <T extends { pubDate: Date | string }>(d: T) => ({
  ...d,
  pubDate: d.pubDate instanceof Date ? d.pubDate : new Date(d.pubDate),
  pubMonthOnly: typeof d.pubDate === 'string' && MONTH_ONLY.test(d.pubDate),
});

/**
 * 順位。「1654/7011」（順位/参加者数）、「1654」、数値のいずれかで書ける。
 * 上位何 % かは参加者数があるときだけ計算して表示する。
 */
const rank = z
  .union([
    z.number().int().positive(),
    z.string().regex(/^\s*\d[\d,]*\s*(\/\s*\d[\d,]*\s*)?$/, '「順位/参加者数」か「順位」で指定してください（例: 1654/7011）'),
  ])
  .transform((v) => {
    const [position, total] = String(v)
      .split('/')
      .map((s) => Number(s.replace(/[\s,]/g, '')));
    return { position, total: total || undefined };
  })
  .refine((r) => r.total === undefined || r.position <= r.total, '順位が参加者数を超えています');

/** 自作 bot のコード紹介 */
const bots = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/bots' }),
  schema: (ctx) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        /** 最終更新日 */
        pubDate: flexibleDate,
        updatedDate: z.coerce.date().optional(),
        /** 対象のゲーム名（ゲーム用 bot の場合のみ） */
        game: z.string().optional(),
        /** 動作プラットフォーム（Slack, Mattermost, Discord など） */
        platform: z.string(),
        status: z.enum(['稼働中', '開発中', '停止中']).default('稼働中'),
        tech: z.array(z.string()).default([]),
        /** GitHub リポジトリ（owner/repo）。指定するとスター数などを API から取得して表示 */
        repo,
        ...thumbnail(ctx),
        draft: z.boolean().default(false),
      })
      .transform(normalizePubDate),
});

/** 競技プログラミング・AI コンテストの参加記録 */
const competitive = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/competitive_programming' }),
  schema: (ctx) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        /** コンテストの開催日（終了日） */
        pubDate: flexibleDate,
        updatedDate: z.coerce.date().optional(),
        /** コンテストのサイト（CodinGame, AtCoder など） */
        platform: z.string().optional(),
        /** コンテストのページの URL */
        url: z.string().url().optional(),
        /** 最終順位（例: 1654/7011） */
        rank: rank.optional(),
        /**
         * 到達したランク帯・リーグ・メダル（例: silver, gold, legend, 水色）。
         * CodinGame のリーグと AtCoder の色は、対応する色のバッジで表示する
         */
        award: z.string().optional(),
        tech: z.array(z.string()).default([]),
        repo,
        ...thumbnail(ctx),
        draft: z.boolean().default(false),
      })
      .transform(normalizePubDate),
});

/** レビュー記事（OSS に限らない） */
const reviews = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/reviews' }),
  schema: (ctx) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      /** レビュー対象の名前（OSS・製品・サービスなど）。省略可 */
      oss: z.string().optional(),
      /** 試したバージョン */
      version: z.string().optional(),
      repo,
      /** 5 段階評価。省略すると評価は表示しない */
      rating: z.number().int().min(1).max(5).optional(),
      tags: z.array(z.string()).default([]),
      /** 良かった点 / 気になった点（一覧と記事冒頭に表示） */
      pros: z.array(z.string()).default([]),
      cons: z.array(z.string()).default([]),
      ...thumbnail(ctx),
      draft: z.boolean().default(false),
    }),
});

/** 技術検証（PoC）。画面上は OSS レビューと同じ欄に表示する */
const poc = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/PoC' }),
  schema: (ctx) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        /** 作成日 */
        pubDate: flexibleDate,
        updatedDate: z.coerce.date().optional(),
        tech: z.array(z.string()).default([]),
        repo,
        ...thumbnail(ctx),
        draft: z.boolean().default(false),
      })
      .transform(normalizePubDate),
});

export const collections = { bots, reviews, competitive, poc };
