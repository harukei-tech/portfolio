<?php

use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\RepositoryController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ['status' => 'ok']);

// GitHub リポジトリの統計情報（スター数など）。結果はキャッシュされる
Route::get('/repos', [RepositoryController::class, 'index'])
    ->middleware('throttle:60,1');

// お問い合わせフォーム。連打対策の緩い制限（送信件数の制限はコントローラー側）
Route::post('/contact', ContactController::class)
    ->middleware('throttle:30,1');
