<?php

namespace App\Providers;

use App\Services\GitHubRepositoryService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(GitHubRepositoryService::class, fn () => new GitHubRepositoryService(
            token: config('portfolio.github.token'),
            cacheTtl: config('portfolio.github.cache_ttl'),
        ));
    }

    public function boot(): void
    {
        //
    }
}
