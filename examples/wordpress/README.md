# WordPress (notes)

There is no WordPress plugin yet. These notes show where the widget and the
server-side check go if you add them to a theme or a small site plugin.

## Load the script

```php
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_script(
        'polyguard-trust-check',
        'https://cdn.polyguard.ai/sdk/latest/trust-check.js',
        [],
        null,
        ['strategy' => 'defer', 'in_footer' => true]
    );
});
```

WordPress does not run `wp_enqueue_scripts` on the login page; use
`login_enqueue_scripts` there.

## Place the widget

```php
add_action('comment_form_after_fields', function () {
    echo '<div class="pg-trust-check" data-action="comment"></div>';
});
add_action('login_form', function () {
    echo '<div class="pg-trust-check" data-action="login"></div>';
});
```

The widget adds a hidden `pg-trust-check-response` input to the enclosing form
when the visitor completes the Trust Check.

## Verify on the server

Use `wp_remote_post` so WordPress's HTTP settings apply:

```php
function polyguard_trust_check_passed(string $action): bool {
    $token = sanitize_text_field(wp_unslash($_POST['pg-trust-check-response'] ?? ''));
    if ($token === '') {
        return false;
    }
    $response = wp_remote_post('https://api.polyguard.ai/v2/siteverify', [
        'timeout' => 5,
        'body' => [
            'response' => $token,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ],
    ]);
    if (is_wp_error($response)) {
        return false;
    }
    $result = json_decode(wp_remote_retrieve_body($response), true);
    return is_array($result)
        && ($result['success'] ?? false) === true
        && ($result['hostname'] ?? '') === wp_parse_url(home_url(), PHP_URL_HOST)
        && ($result['action'] ?? '') === $action;
}
```

Hook it where WordPress accepts the form:

- Comments: `preprocess_comment`, calling `wp_die()` when the check fails.
- Login: the `authenticate` filter at priority 30, returning a `WP_Error`.
- Registration: `registration_errors`, adding an error.

Skip the check for requests that do not come from the form (XML-RPC, REST,
WP-CLI) or they will all fail.

## Things to know

- Visitors need a phone. They do not need to install an app.
- `home_url()` must match the hostname visitors load. `www.example.com` and
  `example.com` are different hostnames.
- Polyguard accepts each response once. Responses expire after 300 seconds.
