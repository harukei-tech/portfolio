/**
 * ランク帯・リーグ・メダルの表示名と色。
 * 文字と背景のコントラスト比はどれも 4.5:1 以上にしている。
 */
type AwardStyle = { label: string; bg: string; fg: string };

const STYLES: Record<string, AwardStyle> = {
  // CodinGame のリーグ
  wood: { label: 'Wood', bg: '#ece1d3', fg: '#664627' },
  bronze: { label: 'Bronze', bg: '#f1dfcf', fg: '#7a4020' },
  silver: { label: 'Silver', bg: '#e5e8eb', fg: '#475059' },
  gold: { label: 'Gold', bg: '#f3e7c0', fg: '#665010' },
  legend: { label: 'Legend', bg: '#f3dad6', fg: '#8a2f24' },
  // AtCoder の色
  gray: { label: '灰色', bg: '#e7e7e7', fg: '#525252' },
  brown: { label: '茶色', bg: '#eedfd0', fg: '#6e4520' },
  green: { label: '緑色', bg: '#dcebdc', fg: '#2d662d' },
  cyan: { label: '水色', bg: '#d8edef', fg: '#1d5f68' },
  blue: { label: '青色', bg: '#dee5f3', fg: '#2b4a8a' },
  yellow: { label: '黄色', bg: '#f2ebc6', fg: '#665510' },
  orange: { label: '橙色', bg: '#f6e0c9', fg: '#844610' },
  red: { label: '赤色', bg: '#f4d7d7', fg: '#8c2424' },
};

// 日本語での書き方も受け付ける
const ALIASES: Record<string, string> = {
  木: 'wood', ブロンズ: 'bronze', 銅: 'bronze', シルバー: 'silver', 銀: 'silver',
  ゴールド: 'gold', 金: 'gold', レジェンド: 'legend',
  灰: 'gray', 灰色: 'gray', grey: 'gray', 茶: 'brown', 茶色: 'brown', 緑: 'green', 緑色: 'green',
  水: 'cyan', 水色: 'cyan', 青: 'blue', 青色: 'blue', 黄: 'yellow', 黄色: 'yellow',
  橙: 'orange', 橙色: 'orange', 赤: 'red', 赤色: 'red',
};

/** 未知の値は、テーマ色のバッジでそのままの文字列を表示する */
export function awardStyle(value: string): AwardStyle {
  const key = value.trim().toLowerCase();
  const style = STYLES[ALIASES[key] ?? key];
  return style ?? { label: value.trim(), bg: 'var(--accent-soft)', fg: 'var(--accent)' };
}

/** 例: { position: 1654, total: 7011 } → 「1,654 位 / 7,011 人」「上位 23.6%」 */
export function formatRank(rank: { position: number; total?: number }) {
  const position = `${rank.position.toLocaleString('ja-JP')} 位`;
  if (!rank.total) return { text: position, top: undefined };
  const percent = (rank.position / rank.total) * 100;
  return {
    text: `${position} / ${rank.total.toLocaleString('ja-JP')} 人`,
    // 1% 未満は小数第 2 位まで、それ以外は第 1 位まで
    top: `上位 ${percent < 1 ? percent.toFixed(2) : percent.toFixed(1)}%`,
  };
}
