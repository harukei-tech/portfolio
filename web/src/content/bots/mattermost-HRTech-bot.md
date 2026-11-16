---
title: Mattermost 人事サポート bot
description: HR領域での業務サポートを想定したAI bot
pubDate: 2026-10-20
platform: Mattermost
status: 停止中
tech: [TypeScript, Node.js, PostgreSQL, Drizzle ORM, OpenAI / Gemini / Ollama, Docker]
thumbnail: ./images/mattermost-HRTech-bot.png
repo: https://github.com/harukei-tech/mattermost_HRTechAI
---

MattermostのDMで質問すると、LLMが社内の人事データを調べて答えるbot。
あるHRTech企業への提案用デモとして、約3週間で試作。

```
あなた: 有給あと何日残ってる？
bot   : 現在の有給残日数は 33.5 日です。申請中の 1 日を差し引くと 32.5 日です。
あなた: Java 経験者を来週から 2 週間ほしい        ← マネージャー・人事のみ
bot   : （スキルと期間中の空き状況から、候補者を一覧で回答）
```

## 作ったきっかけ

HR領域の情報は、様々なRoleの従業員が継続的にデータを確認する必要があり、少しずつ時間コストを消費している。
この時間を低減することには需要があると考え、クローズドなDMで相談するだけで情報を取得・操作してくれるbotをデモ用として作成した。

## 構成

```
Mattermost ⇄ (WebSocket) ⇄ HR bot (Node.js) ─┬─▶ LLM (OpenAI / Gemini / Ollama)
                                               └─▶ PostgreSQL（人事データ・監査ログ）
```

LLMには「有給残日数の取得」「人材検索」などのツール(Function Calling)を渡します。LLMは質問に応じてツール(Function Calling)を選び、データを調べてから回答する。
Docker Composeで動かしており、デモ用のためMattermostのみTailscaleで外部からアクセスできるようにしていた。

## ポイント

### 1. 権限の判定はFunction Calling内で行う

LLMにデータは埋め込んでいないため、
LLMがtools(Function Calling)を介して追加情報を取得するようにしている。

RAG等でデータを埋め込んでしまうとプロンプトインジェクションのリスクが常に付きまとってしまうが、
このtools内に権限チェックを入れることでセキュリティを確保している。

```ts
// src/core/hr/service.ts（説明用に簡略化）
private async resolveTarget(action: string, employeeCode?: string) {
  const target = !employeeCode ? this.self : await this.repo.findEmployeeByCode(employeeCode);
  const allowed = !!target && this.scope.canView(target.id);
  await this.repo.writeAudit({ action, targetEmployeeId: target?.id ?? null, allowed });
  if (!allowed) throw new NotFoundOrForbiddenError(); // 「存在しない」と「権限なし」を区別させない
  return target;
}
```

### 2. LLMのアクセス部分を抽象クラス化

開発中に、OpenAIやGeminiの利用枠・無料枠切れから、LLMを2回乗り換える必要が生じた。
LLMを共通インターフェースで抽象化しておいたことで、追加実装はスムーズに行うことができ、
現在ではモデルの切り替えが設定値の変更のみで行えるようになっている。

```ts
function createLlmProvider(config: Config): LlmProvider {
  const build = (model: string, retryPolicy?: RetryPolicy): LlmProvider => {
    switch (config.LLM_PROVIDER) {
      case "openai":
        return new OpenAiProvider({
          apiKey: config.OPENAI_API_KEY!,
          model,
          reasoningEffort: config.OPENAI_REASONING_EFFORT,
          retryPolicy,
        });
      case "gemini":
        return new GeminiProvider({
          apiKey: config.GEMINI_API_KEY!,
          model,
          thinkingLevel: config.GEMINI_THINKING_LEVEL,
          retryPolicy,
        });
      ...
```


### 3. UXの向上

回答の待機時間中、実行中であるのか停止してしまっているのか不明な状況があったり、
レート制限でモデルが使えないという状況が発生した。
ユーザー体験向上のため、実行状況を定期的に投稿したり、モデルを自動で切り替えるよう実装した。

- 回答が遅いときは「確認しています…」と表示させ、実行中であることがわかるように
- 最新モデルが使用できなくなったら「モデルを変更します」と表示し自動で予備モデルに切り替えるように


## 苦労した点

AIのレート制限が思ったより早く、変更が必要になった。
初めGPT系を使っていたが、制限が入ってしまったため無料で使用できるGemini 3.8 flashに変更、
それもレート制限が入ってしまったため、最終的にローカルLLMでGemma4:e2bを動かすよう変更した。

AIの切り替えは早期から想定していたため、
この処理は早い段階からStrategyパターン・Factoryパターンで変更容易な実装にしていた。

## 今後の改善

機能としてはデータソースを増やしたり外部サービスのAPIと連携することで
botをより多機能化することができる想定。

セキュリティとしては、複数の顧客企業を想定したときのパターンを堅牢にする必要があり
PostgreSQLのDBにRLSを入れる等のガード対応をしてみたいと考えている。