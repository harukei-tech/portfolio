# Portfolio

harukei のポートフォリオサイトのソースコードです。
自作の bot、競技プログラミング・AI コンテストの参加記録、技術検証（PoC）などを紹介しています。

**サイト：https://harukei-tech.github.io/portfolio/**

## 主な特徴

- **記事は Markdown で管理**：DB は使わず、Astro の Content Collections で型チェックします。frontmatter の書き間違いはビルド時にエラーになります。
- **静的サイトとして配信**：ビルドした HTML を GitHub Pages で公開しています。サーバーの運用は不要です。
- **画像の自動最適化**：サムネイル画像はビルド時に縮小と WebP への変換を行います。画像が無い記事には、プラットフォーム名から色分けした代わりの画像を表示します。
- **競技プログラミングの成績表示**：順位から「上位何 %」を計算し、CodinGame のリーグや AtCoder の色をバッジで表示します。

## 技術スタック

| ディレクトリ | 技術 | デプロイ先 |
| --- | --- | --- |
| [web/](web/) | Astro 5 / TypeScript | GitHub Pages |
| [api/](api/) | Laravel 12 + Bref 3（PHP 8.4） | AWS Lambda（現在は停止中） |

CI/CD は GitHub Actions です。`main` に push すると、サイトをビルドして GitHub Pages に公開します（[deploy-web.yml](.github/workflows/deploy-web.yml)）。

### API について（現在は停止中）

[api/](api/) は、静的サイトだけではできない機能を受け持つ Laravel 製の API です。AWS Lambda 上でサーバーレスに動かす構成で、次の機能を実装しています。

- GitHub リポジトリの統計（スター数・言語・最終更新日）の取得。GitHub API のレート制限を避けるため、DynamoDB に結果をキャッシュします。
- お問い合わせフォーム。IP ごとのレート制限とハニーポットで bot を防いだうえで、SES からメールを送ります。

現在は公開を停止しており、サイト側の呼び出しもコメントアウトしています。詳細は [api/README.md](api/README.md) を参照してください。

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

## ローカルで動かす

Node.js 20 以上が必要です。

```bash
cd web
npm install
npm run dev
# http://localhost:4321
```

Docker でも起動できます（`docker compose up`。API も一緒に起動します）。

記事の追加方法は [docs/writing.md](docs/writing.md) にまとめています。

## ライセンス

Copyright (c) 2026 harukei. All rights reserved.

このリポジトリは閲覧用に公開しています。ソースコード、記事の文章、画像などのすべての内容について、複製・改変・再配布・転載を許可していません。
