# Portfolio API

ポートフォリオサイト用の Laravel 12 API です。Bref で AWS Lambda 上で動かします。
セットアップ・デプロイ手順は [ルートの README](../README.md) を参照してください。

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
