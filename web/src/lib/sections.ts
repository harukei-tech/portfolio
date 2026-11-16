import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { published } from './utils';

/**
 * コンテンツの種類（コレクション）ごとの設定。記事ページ・カードはここを参照する。
 * group は、どの欄（一覧ページ・ナビ）に表示するか。
 */
export const sections = {
  bots: {
    /** 記事ページの URL の親パス */
    path: '/bots',
    /** 記事の日付の意味 */
    dateLabel: '最終更新',
    /** 代わりのサムネイルに表示する種別 */
    kind: 'BOT',
    group: 'bots',
  },
  competitive: {
    path: '/competitive-programming',
    dateLabel: '開催',
    kind: 'CONTEST',
    group: 'competitive',
  },
  reviews: {
    path: '/reviews',
    dateLabel: '公開',
    kind: 'OSS REVIEW',
    group: 'reviews',
  },
  poc: {
    path: '/poc',
    dateLabel: '作成',
    kind: 'PoC',
    group: 'reviews',
  },
} as const satisfies Record<CollectionKey, { group: string }>;

/**
 * 画面上の欄（ナビ・一覧ページ・トップページのブロック）。
 * 1 つの欄に複数のコレクションをまとめて表示できる。
 */
export const groups = {
  bots: {
    path: '/bots',
    title: 'Bots',
    intro: '業務効率化や趣味で作った bot の設計とコードを紹介します。',
    collections: ['bots'],
  },
  competitive: {
    path: '/competitive-programming',
    title: 'Competitive Programming',
    intro: '競技プログラミングや AI コンテストへの参加記録です。',
    collections: ['competitive'],
  },
  reviews: {
    path: '/reviews',
    title: 'Reviews & PoC',
    intro: '実際に手を動かして試した OSS のレビューや、技術検証（PoC）の記録です。',
    collections: ['reviews', 'poc'],
  },
} as const satisfies Record<string, { collections: readonly CollectionKey[] }>;

export type GroupKey = keyof typeof groups;

/** ナビゲーション・トップページに並べる順番 */
export const groupOrder: GroupKey[] = ['bots', 'competitive', 'reviews'];

export type AnyEntry = CollectionEntry<CollectionKey>;

/** 欄に属するすべてのコレクションの記事を、新しい順にまとめて返す（draft は除外） */
export async function getGroupEntries(key: GroupKey): Promise<AnyEntry[]> {
  const lists = await Promise.all(groups[key].collections.map((c) => getCollection(c)));
  return published<AnyEntry>(lists.flat());
}

/** 記事が属する欄 */
export function groupOf(entry: AnyEntry) {
  return groups[sections[entry.collection].group];
}
