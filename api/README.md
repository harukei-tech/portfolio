# Portfolio API

ポートフォリオサイト用の Laravel 12 API です。Bref で AWS Lambda 上で動かします。
現在は公開を停止しています。再開するときのデプロイ手順は、このファイル下部の「本番デプロイ」を参照してください。

## エンドポイント

| メソッド | パス | 内容 |
| --- | --- | --- |
| GET | `/api/health` | ヘルスチェック |
| GET | `/api/repos?names=owner/repo,owner/repo2` | GitHub リポジトリの統計（最大 20 件、1 時間キャッシュ、60 req/分） |
| POST | `/api/contact` | お問い合わせ送信（`name`, `email`, `company`, `message`。1 時間 5 回まで） |

## 主なファイル

| ファイル | 役割 |
| --- | --- |
| [app/Services/GitHubRepositoryService.php](app/Services/GitHubRepositoryService.php) | GitHub API の呼び出しとキャッシュ（失敗時も短時間キャッシュ） |
| [app/Http/Controllers/Api/RepositoryController.php](app/Http/Controllers/Api/RepositoryController.php) | 入力の検証（形式・件数・許可オーナー） |
| [app/Http/Controllers/Api/ContactController.php](app/Http/Controllers/Api/ContactController.php) | お問い合わせの検証とメール送信 |
| [config/portfolio.php](config/portfolio.php) | アプリ固有の設定 |
| [serverless.yml](serverless.yml) | Lambda、DynamoDB キャッシュテーブル、IAM 権限 |
| [tests/Feature/](tests/Feature/) | Feature テスト |

## 本番デプロイ

[deploy-api.yml](../.github/workflows/deploy-api.yml) が、テストと Lint のあと Lambda にデプロイします。
停止中は手動実行（Actions タブの Run workflow）のみ有効です。再開するときは、ワークフローの `push` / `pull_request` のコメントを外し、サイト側の「API 停止中」のコメントアウトも戻してください。

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

4. [serverless.yml](serverless.yml) の `params.prod` を書き換えます。
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
