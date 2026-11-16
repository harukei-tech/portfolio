<?php

return [
    // お問い合わせの通知先メールアドレス
    'contact_to' => env('CONTACT_TO_ADDRESS'),

    'github' => [
        // 任意。設定するとレート制限が 60 → 5000 req/h に緩和される
        'token' => env('GITHUB_TOKEN'),
        // 取得を許可するオーナー（カンマ区切り）。空なら制限なし
        'allowed_owners' => array_filter(array_map('trim', explode(',', (string) env('GITHUB_ALLOWED_OWNERS', '')))),
        'cache_ttl' => (int) env('GITHUB_CACHE_TTL', 3600),
    ],
];
