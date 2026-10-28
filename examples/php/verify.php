<?php
// Verify a postcaptcha check before handling a form POST. Requires ext-curl.

const POLYGUARD_SITEVERIFY_URL = 'https://api.polyguard.ai/v2/siteverify';

function polyguard_siteverify(string $token, ?string $remoteIp = null, ?string $secret = null): array
{
    $fields = ['response' => $token];
    if ($remoteIp) {
        $fields['remoteip'] = $remoteIp;
    }
    if ($secret) {
        $fields['secret'] = $secret;
    }

    $ch = curl_init(POLYGUARD_SITEVERIFY_URL);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => http_build_query($fields),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
    ]);
    $body = curl_exec($ch);
    curl_close($ch);

    $result = is_string($body) ? json_decode($body, true) : null;
    return is_array($result) ? $result : ['success' => false, 'error-codes' => ['internal-error']];
}

// The hostname your form is served from, exactly as visitors load it.
$expectedHostname = getenv('SITE_HOSTNAME') ?: 'www.example.com';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['pg-trust-check-response'] ?? '';
    if ($token === '') {
        http_response_code(400);
        exit('missing-input-response');
    }

    $result = polyguard_siteverify(
        $token,
        $_SERVER['REMOTE_ADDR'] ?? null,
        getenv('POLYGUARD_SITEVERIFY_SECRET') ?: null
    );

    if (($result['success'] ?? false) !== true || ($result['hostname'] ?? '') !== $expectedHostname) {
        http_response_code(403);
        exit('postcaptcha check failed: ' . implode(', ', $result['error-codes'] ?? []));
    }

    // The check passed: handle $_POST['email'] here.
    echo 'Account created';
}
