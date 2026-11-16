<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactReceived;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;

class ContactController extends Controller
{
    private const MAX_SENDS_PER_HOUR = 5;

    /**
     * POST /api/contact
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email:rfc', 'max:255'],
            'company' => ['nullable', 'string', 'max:100'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            // ハニーポット: 人間には見えない入力欄。値が入っていたら bot とみなす
            'website' => ['nullable', 'string', 'max:0'],
        ], [
            'website.max' => '送信に失敗しました。',
        ]);

        $to = config('portfolio.contact_to');
        if (! $to) {
            Log::error('CONTACT_TO_ADDRESS is not configured');

            return response()->json(['message' => '現在お問い合わせを受け付けできません。'], 503);
        }

        // 入力ミスで弾かれた分は数えず、実際に送信した件数だけを IP ごとに制限する
        $sent = RateLimiter::attempt(
            key: 'contact:'.$request->ip(),
            maxAttempts: self::MAX_SENDS_PER_HOUR,
            callback: fn () => Mail::to($to)->send(new ContactReceived(
                senderName: $validated['name'],
                senderEmail: $validated['email'],
                body: $validated['message'],
                company: $validated['company'] ?? null,
            )),
            decaySeconds: 3600,
        );

        if ($sent === false) {
            return response()->json(['message' => '送信回数の上限に達しました。時間をおいて再度お試しください。'], 429);
        }

        return response()->json(['message' => 'お問い合わせを受け付けました。'], 202);
    }
}
