# 記事の書き方

サイトに載せる記事（Markdown）の追加方法です。

## 置き場所

| 種類 | 置き場所 |
| --- | --- |
| bot 紹介 | `web/src/content/bots/<slug>.md` |
| 競技プログラミング | `web/src/content/competitive_programming/<slug>.md` |
| OSS レビュー | `web/src/content/reviews/<slug>.md` |
| 技術検証（PoC） | `web/src/content/PoC/<slug>.md`（画面上は OSS レビューと同じ「Reviews & PoC」欄に表示） |

どの欄に表示するかは [web/src/lib/sections.ts](../web/src/lib/sections.ts) の `groups` で決めています。PoC とレビューを統合するときや、別の欄に分けるときは、ここを書き換えます。

frontmatter の項目は [web/src/content.config.ts](../web/src/content.config.ts) で定義しています。間違いがあるとビルド時にエラーになります。書き方は既存の記事を参考にしてください。`draft: true` にすると、本番ビルドで非公開になります。

## 競技プログラミングの順位・ランク帯

```yaml
platform: CodinGame   # 任意。コンテストのサイト
rank: 1654/7011       # 任意。「順位/参加者数」または「順位」だけ
award: silver         # 任意。到達したランク帯・リーグ
```

- `rank` に参加者数まで書くと、「上位 23.6%」のように上位何 % かも表示します。
- `award` は、次の値なら対応する色のバッジで表示します。大文字・小文字は区別しません。それ以外の値は、書いた文字をそのまま表示します。
  - CodinGame: `wood` / `bronze` / `silver` / `gold` / `legend`
  - AtCoder: `gray` / `brown` / `green` / `cyan` / `blue` / `yellow` / `orange` / `red`（`灰`・`茶`・`緑`・`水色` など日本語でも可）

## サムネイル画像

記事と同じフォルダの `images/` に、**記事の .md と同じ名前** で画像を置くだけで、自動でサムネイルになります（frontmatter への記述は不要）。

```
web/src/content/bots/hr-bot.md
web/src/content/bots/images/hr-bot.png   ← 自動で使われる
```

- 対応している拡張子は png / jpg / jpeg / webp / avif / gif です。ファイル名の大文字・小文字は区別しません。
- 別の名前の画像を使いたいときは、frontmatter で指定します。指定した画像が優先されます。

```yaml
thumbnail: ./images/other.png
thumbnailAlt: bot との DM 画面   # 任意。画像の説明（省略時はタイトル）
```

- 横長（16:9、1600×900 px 程度）の画像を推奨します。比率が違う場合は、中央を基準に切り抜いて表示します。
- 画像は、ビルド時に自動で縮小・WebP 変換されます。
- 指定すると、一覧のカード、記事の冒頭、SNS でシェアしたときの画像（OGP）に使われます。
- 指定しない場合は、プラットフォーム名（OSS レビューなら OSS 名）から色分けした代わりの画像を表示します。

名前・経歴・スキルは [web/src/data/profile.ts](../web/src/data/profile.ts) で編集します。
