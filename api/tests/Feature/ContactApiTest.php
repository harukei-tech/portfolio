<?php

namespace Tests\Feature;

use App\Mail\ContactReceived;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class ContactApiTest extends TestCase
{
    private array $payload = [
        'name' => '山田 太郎',
        'email' => 'taro@example.com',
        'company' => 'Example Inc.',
        'message' => 'ポートフォリオを拝見しました。ぜひ一度お話しさせてください。',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        config(['portfolio.contact_to' => 'me@example.com']);
        Mail::fake();
    }

    public function test_sends_contact_mail(): void
    {
        $this->postJson('/api/contact', $this->payload)->assertAccepted();

        Mail::assertSent(ContactReceived::class, function (ContactReceived $mail) {
            return $mail->hasTo('me@example.com')
                && $mail->hasReplyTo('taro@example.com')
                && $mail->senderName === '山田 太郎';
        });
    }

    public function test_validates_input(): void
    {
        $this->postJson('/api/contact', ['email' => 'not-an-email'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'message']);

        Mail::assertNothingSent();
    }

    public function test_honeypot_blocks_bots(): void
    {
        $this->postJson('/api/contact', $this->payload + ['website' => 'http://spam.example'])
            ->assertUnprocessable();

        Mail::assertNothingSent();
    }

    public function test_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/contact', $this->payload)->assertAccepted();
        }

        $this->postJson('/api/contact', $this->payload)->assertTooManyRequests();
        Mail::assertSentCount(5);
    }

    public function test_validation_errors_do_not_consume_the_send_limit(): void
    {
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/contact', ['name' => 'x'])->assertUnprocessable();
        }

        $this->postJson('/api/contact', $this->payload)->assertAccepted();
    }

    public function test_validation_messages_are_japanese(): void
    {
        $this->postJson('/api/contact', [])
            ->assertJsonPath('errors.name.0', 'お名前を入力してください。');
    }

    public function test_returns_503_when_recipient_is_not_configured(): void
    {
        config(['portfolio.contact_to' => null]);

        $this->postJson('/api/contact', $this->payload)->assertServiceUnavailable();
    }

    public function test_cors_allows_configured_origin(): void
    {
        $this->call('OPTIONS', '/api/contact', server: [
            'HTTP_ORIGIN' => 'http://localhost:4321',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
        ])->assertHeader('Access-Control-Allow-Origin', 'http://localhost:4321');
    }
}
