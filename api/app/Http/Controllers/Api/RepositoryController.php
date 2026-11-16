<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GitHubRepositoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class RepositoryController extends Controller
{
    private const MAX_REPOS = 20;

    private const NAME_PATTERN = '#^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$#';

    /**
     * GET /api/repos?names=owner/repo,owner/repo2
     */
    public function index(Request $request, GitHubRepositoryService $github): JsonResponse
    {
        $request->validate([
            'names' => ['required', 'string', 'max:2000'],
        ]);

        $names = $this->parseNames((string) $request->string('names'));

        $repos = $names->mapWithKeys(fn (string $name) => [$name => $github->find($name)]);

        return response()
            ->json(['data' => $repos])
            // ブラウザ側でも 10 分キャッシュ
            ->header('Cache-Control', 'public, max-age=600');
    }

    /**
     * @return Collection<int, string>
     */
    private function parseNames(string $raw): Collection
    {
        $names = collect(explode(',', $raw))
            ->map(fn (string $name) => trim($name))
            ->filter()
            ->unique()
            ->values();

        if ($names->count() > self::MAX_REPOS) {
            throw ValidationException::withMessages([
                'names' => '一度に指定できるリポジトリは '.self::MAX_REPOS.' 件までです。',
            ]);
        }

        $invalid = $names->reject(fn (string $name) => preg_match(self::NAME_PATTERN, $name) === 1);
        if ($invalid->isNotEmpty()) {
            throw ValidationException::withMessages([
                'names' => 'owner/repo 形式で指定してください: '.$invalid->implode(', '),
            ]);
        }

        $allowedOwners = array_map('strtolower', config('portfolio.github.allowed_owners'));
        if ($allowedOwners !== []) {
            $forbidden = $names->reject(
                fn (string $name) => in_array(strtolower(explode('/', $name)[0]), $allowedOwners, true)
            );
            if ($forbidden->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'names' => '許可されていないオーナーです: '.$forbidden->implode(', '),
                ]);
            }
        }

        return $names;
    }
}
