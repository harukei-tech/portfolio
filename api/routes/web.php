<?php

use Illuminate\Support\Facades\Route;

// API 専用アプリのため、ルートは簡単なサービス情報だけを返す
Route::get('/', fn () => response()->json([
    'name' => config('app.name'),
    'endpoints' => ['/api/health', '/api/repos', '/api/contact'],
]));
