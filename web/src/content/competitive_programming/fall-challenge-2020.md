---
title: CodinGame-Fall-Challenge-2020
description: 素材・レシピ・製品生成を効率よく行い高得点を目指すbot構築
pubDate: 2020-11-26
tech: [Java]
rank: 1654/7011
award: silver
repo: https://github.com/harukei-tech/harukei-tech-fall-challenge-2020
url: https://www.codingame.com/contests/fall-challenge-2020
---

bot vs botの対戦ゲーム。

毎ターン下記いずれかの行動を行うことができる。
- 素材生成/変換
- 素材生成/変換レシピの購入
- 素材を複数消費し製品を生成

どちらかのプレイヤーが製品を6つ作成するか、一定ターン経過でゲーム終了。
ポイントの高い側の勝利となる。


## ポイント

### 1. 序盤・中盤・終盤により戦略を変える
ゲームの進行状況に合わせ[3つの戦略スタイル](https://github.com/harukei-tech/harukei-tech-fall-challenge-2020/blob/master/src/Player.java#L644-L648)をとる。

序盤は黄色の素材をいかに効率よく作れるようにするかを重視。
素材は、青<緑<橙<黄と価値が決まってるため、レシピをなるべく多く獲得し素材づくりを効率化。
中盤戦の選択肢拡大を目指す。

中盤はコスパの良い製品づくりに徹底。
現在[何をするのが最適かを計算](https://github.com/harukei-tech/harukei-tech-fall-challenge-2020/blob/master/src/Player.java#L444-481)し、素材の作成・コスパの良い製品の作成を行う。

終盤は6個目の製品を先に作った方が有利のため[重み付け順位を変更
](https://github.com/harukei-tech/harukei-tech-fall-challenge-2020/blob/master/src/Player.java#L346-360)。
ゲームの終了を目指す。
