# Portfolio

ゲーム bot のコード紹介と OSS レビューを載せるポートフォリオサイトです。

| ディレクトリ | 技術 | デプロイ先 |
| --- | --- | --- |
| [web/](web/) | Astro 5（静的サイト） | GitHub Pages |
| [api/](api/) | Laravel 12 + Bref 3（PHP 8.4） | AWS Lambda + API Gateway (HTTP API) |

```
ブラウザ ──▶ GitHub Pages (Astro の静的 HTML)
   │
   └─ fetch ─▶ API Gateway ─▶ Lambda (Laravel)
                                 ├─ GET  /api/repos    GitHub API → DynamoDB にキャッシュ
                                 └─ POST /api/contact  SES でメール送信
```

記事は Markdown で管理するので DB は不要です。Laravel は、静的サイトだけではできない処理を受け持ちます。

- **GitHub 統計の取得**: 記事に `repo: owner/repo` と書くと、スター数・言語・最終更新日を表示します。GitHub API のレート制限を避けるため、結果を 1 時間キャッシュします。
- **お問い合わせフォーム**: バリデーション、IP ごとのレート制限（1 時間 5 回）、ハニーポットによる bot 対策をしたうえで SES から送信します。

API が落ちていても、未設定でも、サイトの表示はそのまま動きます（統計が出ないだけです）。

## 記事の追加

| 種類 | 置き場所 |
| --- | --- |
| bot 紹介 | `web/src/content/bots/<slug>.md` |
| 競技プログラミング | `web/src/content/competitive_programming/<slug>.md` |
| OSS レビュー | `web/src/content/reviews/<slug>.md` |
| 技術検証（PoC） | `web/src/content/PoC/<slug>.md`（画面上は OSS レビューと同じ「Reviews & PoC」欄に表示） |

どの欄に表示するかは [web/src/lib/sections.ts](web/src/lib/sections.ts) の `groups` で決めています。PoC とレビューを統合するときや、別の欄に分けるときは、ここを書き換えます。

frontmatter の項目は [web/src/content.config.ts](web/src/content.config.ts) で定義しています。間違いがあるとビルド時にエラーになります。書き方は既存の記事を参考にしてください。`draft: true` にすると、本番ビルドで非公開になります。

### 競技プログラミングの順位・ランク帯

```yaml
platform: CodinGame   # 任意。コンテストのサイト
rank: 1654/7011       # 任意。「順位/参加者数」または「順位」だけ
award: silver         # 任意。到達したランク帯・リーグ
```

- `rank` に参加者数まで書くと、「上位 23.6%」のように上位何 % かも表示します。
- `award` は、次の値なら対応する色のバッジで表示します。大文字・小文字は区別しません。それ以外の値は、書いた文字をそのまま表示します。
  - CodinGame: `wood` / `bronze` / `silver` / `gold` / `legend`
  - AtCoder: `gray` / `brown` / `green` / `cyan` / `blue` / `yellow` / `orange` / `red`（`灰`・`茶`・`緑`・`水色` など日本語でも可）

### サムネイル画像

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

名前・経歴・スキルは [web/src/data/profile.ts](web/src/data/profile.ts) で編集します。

## ローカル開発

### Docker でまとめて起動

```bash
docker compose up
# Web: http://localhost:4321
# API: http://localhost:8088
```

### 個別に起動

```bash
# API（PHP 8.4 のコンテナ内で実行）
cp api/.env.example api/.env
docker compose run --rm api php artisan key:generate
docker compose up api

# Web（Node.js 20 以上）
cd web
cp .env.example .env
npm install
npm run dev
```

ローカルでは、お問い合わせメールを送信せず `api/storage/logs/laravel.log` に出力します。

### テスト

```bash
docker compose run --rm api php artisan test
docker compose run --rm api vendor/bin/pint   # コード整形
```

## 本番デプロイ

`main` に push すると、GitHub Actions が変更のあった側をデプロイします。

| ワークフロー | 内容 |
| --- | --- |
| [deploy-web.yml](.github/workflows/deploy-web.yml) | Astro をビルドして GitHub Pages に公開 |
| [deploy-api.yml](.github/workflows/deploy-api.yml) | テストと Lint のあと、Lambda にデプロイ |

### 初回のみ: AWS 側の準備（リージョン: ap-northeast-1）

1. **SES** で送信元メールアドレスを検証します。SES がサンドボックスのうちは、送信先のアドレスも検証が必要です。

2. **SSM パラメータストア**に秘密情報を登録します。

   ```bash
   aws ssm put-parameter --type SecureString --name /portfolio-api/prod/app-key \
     --value "base64:$(openssl rand -base64 32)"
   aws ssm put-parameter --type String --name /portfolio-api/prod/mail-from  --value no-reply@your-domain.example
   aws ssm put-parameter --type String --name /portfolio-api/prod/contact-to --value you@example.com
   # 任意: GitHub API のレート制限を 5000 req/h に緩和
   aws ssm put-parameter --type SecureString --name /portfolio-api/prod/github-token --value ghp_xxx
   ```

3. **GitHub Actions 用の IAM ロール**を OIDC で作成します。アクセスキーは発行しません。
   - ID プロバイダ: `token.actions.githubusercontent.com`（audience: `sts.amazonaws.com`）
   - 信頼ポリシーの条件: `repo:<ユーザー名>/<リポジトリ名>:environment:production`
   - 権限: CloudFormation / Lambda / API Gateway / DynamoDB / IAM（ロール作成）/ S3（デプロイ用バケット）/ SSM 読み取り / CloudWatch Logs

4. [api/serverless.yml](api/serverless.yml) の `params.prod` を書き換えます。
   - `corsOrigins`: `https://<ユーザー名>.github.io`
   - `githubOwners`: 自分の GitHub ユーザー名など、統計を出してよいオーナー

### 初回のみ: GitHub 側の準備

1. **Settings > Pages > Source** を「GitHub Actions」にします。
2. **Settings > Secrets and variables > Actions** で次を登録します。
   - Secret `AWS_DEPLOY_ROLE_ARN`: 上で作った IAM ロールの ARN
   - Variable `PUBLIC_API_URL`: API のデプロイ後に表示される URL（例: `https://xxxx.execute-api.ap-northeast-1.amazonaws.com`）
3. **Settings > Environments** で `production` を作成します。必要なら承認ルールも付けられます。

最初は API を先にデプロイし、表示された URL を `PUBLIC_API_URL` に設定してから Web をデプロイしてください。

### 手元から API をデプロイする場合

```bash
cd api
composer install --no-dev --optimize-autoloader
npm install
npx osls deploy --stage prod
```

### 料金の目安

アクセスが少ないポートフォリオなら、Lambda・API Gateway・DynamoDB（オンデマンド）・SES は、ほぼ無料枠か月数十円程度に収まる想定です。念のため AWS Budgets でアラートを設定しておくと安心です。
