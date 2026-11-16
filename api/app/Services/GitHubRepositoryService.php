<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * GitHub REST API からリポジトリの公開情報を取得し、キャッシュする。
 */
class GitHubRepositoryService
{
    /** 取得に失敗したリポジトリをキャッシュする秒数（GitHub への連打防止） */
    private const NEGATIVE_CACHE_TTL = 300;

    public function __construct(
        private readonly ?string $token,
        private readonly int $cacheTtl,
    ) {}

    /**
     * @return array<string, mixed>|null 取得できなかった場合は null
     */
    public function find(string $fullName): ?array
    {
        $key = 'github:repo:'.strtolower($fullName);

        $cached = Cache::get($key);
        if ($cached !== null) {
            return $cached ?: null;
        }

        $repo = $this->fetch($fullName);

        Cache::put($key, $repo ?? [], $repo ? $this->cacheTtl : self::NEGATIVE_CACHE_TTL);

        return $repo;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function fetch(string $fullName): ?array
    {
        try {
            $response = Http::baseUrl('https://api.github.com')
                ->withHeaders([
                    'Accept' => 'application/vnd.github+json',
                    'X-GitHub-Api-Version' => '2022-11-28',
                    'User-Agent' => 'portfolio-api',
                ])
                ->when($this->token, fn ($http) => $http->withToken($this->token))
                ->timeout(5)
                ->get("/repos/{$fullName}");
        } catch (ConnectionException $e) {
            Log::warning('GitHub API connection failed', ['repo' => $fullName, 'error' => $e->getMessage()]);

            return null;
        }

        if (! $response->successful()) {
            Log::info('GitHub API returned non-2xx', ['repo' => $fullName, 'status' => $response->status()]);

            return null;
        }

        $data = $response->json();

        return [
            'full_name' => $data['full_name'],
            'description' => $data['description'] ?? null,
            'html_url' => $data['html_url'],
            'homepage' => ($data['homepage'] ?? null) ?: null,
            'language' => $data['language'] ?? null,
            'stars' => $data['stargazers_count'] ?? 0,
            'forks' => $data['forks_count'] ?? 0,
            'open_issues' => $data['open_issues_count'] ?? 0,
            'topics' => $data['topics'] ?? [],
            'license' => $data['license']['spdx_id'] ?? null,
            'archived' => $data['archived'] ?? false,
            'pushed_at' => $data['pushed_at'] ?? null,
        ];
    }
}
