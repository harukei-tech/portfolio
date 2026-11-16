/** base パスを考慮した内部リンクを生成する（GitHub Pages のプロジェクトサイト対策） */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** monthOnly のときは「2026/03」のように月までで表示する */
export function formatDate(date: Date, monthOnly = false): string {
  return date.toLocaleDateString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    ...(monthOnly ? {} : { day: '2-digit' }),
  });
}

/** エントリの日付表示（bot は月までの指定に対応） */
export function entryDate(data: { pubDate: Date; pubMonthOnly?: boolean }): string {
  return formatDate(data.pubDate, data.pubMonthOnly ?? false);
}

/** draft を除外し、新しい順に並べる */
export function published<T extends { data: { draft: boolean; pubDate: Date } }>(entries: T[]): T[] {
  return entries
    .filter((e) => import.meta.env.DEV || !e.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

// バックエンド API は一旦停止中。再開するときはコメントを外す
// export const apiUrl: string = (import.meta.env.PUBLIC_API_URL ?? '').replace(/\/$/, '');
