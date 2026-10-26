# postcaptcha for WordPress

`postcaptcha/` is the WordPress plugin, laid out for the wordpress.org plugin
directory. It adds a Polyguard Trust Check to the login, registration, lost
password and comment forms, the WooCommerce My Account registration form and
classic checkout, and Contact Form 7 (`[postcaptcha]`). Each form is switched
on under **Settings > postcaptcha**. `postcaptcha/readme.txt` is the directory
listing.

## License

The plugin directory (`integrations/wordpress/postcaptcha/`) is licensed
GPL-2.0-or-later, as the wordpress.org directory requires. The rest of this
repository is MIT.

## How it verifies

On submit the plugin posts `pg-trust-check-response`, the visitor's IP
address and the optional secret to `https://api.polyguard.ai/v2/siteverify`
with `wp_remote_post` and a 5 second timeout. It accepts the form only when
`success` is `true`, `hostname` is the host of `home_url()` or `site_url()`,
and `action` matches the form (`login`, `register`, `lostpassword`,
`comment`, `wc_register`, `wc_checkout`, or the Contact Form 7 tag's
`action:` option, default `contact`). A network error or a reply that is not
JSON rejects the form.

Login, registration and lost password are checked only for POSTs to
wp-login.php and the WooCommerce My Account forms; comments only for
`wp-comments-post.php` from visitors who are not logged in. XML-RPC, REST and
WP-CLI requests are skipped.

## Development

```bash
cd integrations/wordpress
composer install          # WordPress Coding Standards and PHPCompatibilityWP
composer lint             # phpcs
npx @wordpress/env start  # WordPress, WooCommerce and Contact Form 7 on http://localhost:8890 (admin / password)
```

Without a local PHP, run Composer in Docker:

```bash
docker run --rm -v "$PWD":/app -w /app composer:2 composer install
docker run --rm -v "$PWD":/app -w /app composer:2 composer lint
```

A Trust Check from `localhost` uses Polyguard's local development app,
limited to 100 Trust Checks a day per IP address.

## Release

Copy the contents of `postcaptcha/` to the plugin's SVN `trunk/`, and tag
the version from the `Stable tag` line in `readme.txt`. Submitting the plugin
to wordpress.org needs the Polyguard wordpress.org account, whose username
goes in the `Contributors` line.
