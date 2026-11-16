---
title: CodinGame-Summer-Challenge-2024
description: 4つのゲームを同時操作し総合得点の最大化を目指すbot構築
pubDate: 2024-04-22
tech: [TypeScript]
rank: 653/1066
award: gold
repo: https://github.com/harukei-tech/CodinGame-Summer-Challenge-2024
url: https://www.codingame.com/multiplayer/bot-programming/summer-challenge-2024-olymbits
---

bot vs bot vs botの3人対戦ゲーム。

下記4つのゲームが同時進行するため、UP, LEFT, DOWN, RIGHTのいずれかの操作を1つ返して操作を行う。
100ターン経過時、4ゲームそれぞれの金メダル・銀メダル数の掛け算により計算される総合得点により勝敗を決する。

- ハードル走:
  - UP: ジャンプ
  - LEFT: 1マス進む
  - DOWN: 2マス進む
  - RIGHT: 3マス進む
- アーチェリー
  - 操作: 狙う位置を調整
- ローラースピードスケート
  - 操作: 毎ターン、各コマンドにリスク値・移動値が与えられる。他プレイヤーより早くゴールまで移動すると勝利
- ダイビング
  - 操作: 予め正解のコマンド順序が公開される。連続正解すると獲得ポイントが増加。


  
## ポイント

### 総合得点は掛け算により算出される
例えばハードル走・アーチェリー・ローラースピードスケートで高得点を出しても、ダイビングでメダルが0であると、総合得点は0になってしまう。

つまり終盤のラウンドでは、0メダルである競技が1つでもある場合、そのメダル獲得に全力になる必要がある。

また高得点を取るうえでそれぞれバランスよくメダルを取ることが必須である。
