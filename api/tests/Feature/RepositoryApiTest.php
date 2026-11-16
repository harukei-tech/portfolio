<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RepositoryApiTest extends TestCase
{
    private function fakeGitHub(): void
    {
        Http::fake([
            'api.github.com/repos/octocat/hello-world' => Http::response([
                'full_name' => 'octocat/Hello-World',
                'description' => 'My first repository',
                'html_url' => 'https://github.com/octocat/Hello-World',
                'homepage' => '',
                'language' => 'PHP',
                'stargazers_count' => 42,
                'forks_count' => 7,
                'open_issues_count' => 1,
                'topics' => ['bot'],
                'license' => ['spdx_id' => 'MIT'],
                'archived' => false,
                'pushed_at' => '2026-01-01T00:00:00Z',
            ]),
            'api.github.com/*' => Http::response(['message' => 'Not Found'], 404),
        ]);
    }

    public function test_returns_repository_stats(): void
    {
        $this->fakeGitHub();

        $this->getJson('/api/repos?names=octocat/hello-world')
            ->assertOk()
            ->assertJsonPath('data.octocat/hello-world.stars', 42)
            ->assertJsonPath('data.octocat/hello-world.license', 'MIT')
            ->assertJsonPath('data.octocat/hello-world.homepage', null);
    }

    public function test_missing_repository_returns_null(): void
    {
        $this->fakeGitHub();

        $this->getJson('/api/repos?names=octocat/nope')
            ->assertOk()
            ->assertJsonPath('data.octocat/nope', null);
    }

    public function test_results_are_cached(): void
    {
        $this->fakeGitHub();

        $this->getJson('/api/repos?names=octocat/hello-world')->assertOk();
        $this->getJson('/api/repos?names=octocat/hello-world')->assertOk();

        Http::assertSentCount(1);
    }

    public function test_rejects_invalid_names(): void
    {
        $this->getJson('/api/repos?names=../../etc/passwd')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('names');
    }

    public function test_rejects_owners_not_in_allow_list(): void
    {
        config(['portfolio.github.allowed_owners' => ['octocat']]);
        $this->fakeGitHub();

        $this->getJson('/api/repos?names=someone/else')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('names');
    }

    public function test_requires_names(): void
    {
        $this->getJson('/api/repos')->assertUnprocessable();
    }
}
