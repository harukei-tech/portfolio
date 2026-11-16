# Portfolio

harukei のポートフォリオサイトのソースコードです。
自作の bot、競技プログラミング・AI コンテストの参加記録、技術検証（PoC）などを紹介しています。

**サイト：https://harukei-tech.github.io/portfolio/**

## 技術スタック

| ディレクトリ | 技術 | デプロイ先 |
| --- | --- | --- |
| [web/](web/) | Astro 5 / TypeScript | GitHub Pages |
| [api/](api/) | Laravel 12 + Bref 3（PHP 8.4） | AWS Lambda（現在は停止中） |

CI/CD は GitHub Actions です。`main` に push すると、サイトをビルドして GitHub Pages に公開します（[deploy-web.yml](.github/workflows/deploy-web.yml)）。

## ディレクトリ構成

```
.
├── web/                     # Astro のサイト
│   └── src/
│       ├── content/         # 記事（Markdown）
│       ├── components/      # UI コンポーネント
│       ├── pages/           # ルーティング
│       ├── data/profile.ts  # プロフィール情報
│       └── content.config.ts # 記事の frontmatter の定義
├── api/                     # Laravel API（停止中）
├── docs/                    # 記事の書き方など
└── .github/workflows/       # GitHub Actions
```

## ライセンス

Copyright (c) 2026 harukei. All rights reserved.

このリポジトリは閲覧用に公開しています。ソースコード、記事の文章、画像などのすべての内容について、複製・改変・再配布・転載を許可していません。
