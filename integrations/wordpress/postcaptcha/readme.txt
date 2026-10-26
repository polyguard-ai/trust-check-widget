=== postcaptcha ===
Contributors: polyguard
Tags: captcha, recaptcha alternative, turnstile, hcaptcha, spam
Requires at least: 6.3
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Protect login, registration, lost password and comment forms with a Polyguard Trust Check. No site key, secret or account needed.

== Description ==

postcaptcha adds a Polyguard Trust Check to WordPress forms, in place of reCAPTCHA, hCaptcha or Cloudflare Turnstile. The visitor clicks the box and scans a code with their phone. Polyguard confirms with PG-Presence that a real phone captured the code from the screen, and the plugin verifies the result on your server before WordPress accepts the form.

There is no site key to create. The first Trust Check from your site's hostname creates a free Polyguard account for it, limited to 1,000 Trust Checks a week. You can claim the hostname later to manage the account.

Forms you can protect, each switched on or off under Settings > postcaptcha:

* Login (wp-login.php, wp_login_form() and the WooCommerce My Account login)
* Registration
* Lost password (wp-login.php and WooCommerce)
* Comments from visitors who are not logged in
* WooCommerce My Account registration
* WooCommerce classic checkout
* Contact Form 7, with the `[postcaptcha]` form tag

Visitors need a phone. They do not need to install an app: on an iPhone the Trust Check runs in an App Clip, and on Android it runs in the browser.

The plugin source, and examples for other stacks, are at [github.com/polyguard-ai/trust-check-widget](https://github.com/polyguard-ai/trust-check-widget).

== External services ==

This plugin uses the Polyguard Trust Check service, run by Polyguard, to confirm that a person with a phone submitted the form.

* On pages with a protected form, the visitor's browser loads the widget script from `https://cdn.polyguard.ai/sdk/latest/trust-check.js`.
* When the visitor clicks the widget, the script sends the page's hostname and path and the form's action name to Polyguard (`api.polyguard.ai`) to start a Trust Check. The visitor's phone then connects to Polyguard to complete it.
* When the form is submitted, your server sends the Trust Check response, the visitor's IP address and, if you set one, your secret to `https://api.polyguard.ai/v2/siteverify`. Polyguard returns whether the Trust Check passed, the hostname and the action.

Polyguard [terms of service](https://polyguard.ai/terms) and [privacy policy](https://polyguard.ai/privacy).

== Installation ==

1. Install and activate the plugin.
2. Open Settings > postcaptcha. Registration, lost password and comments are on by default.
3. Complete a Trust Check on one of those forms, for example a comment while logged out.
4. Turn on Login, and the WooCommerce forms if you use them.
5. For Contact Form 7, add `[postcaptcha]` to a form where the widget should appear.

== Frequently Asked Questions ==

= Do I need a Polyguard account or keys? =

No. The first Trust Check from your hostname creates a free account limited to 1,000 Trust Checks a week. To manage it, claim the hostname as described at https://postcaptcha.com/#claim, then paste the App API key into the Secret field. You can define `POSTCAPTCHA_SECRET` in wp-config.php instead.

= Which hostname must the result carry? =

The host of your Site Address (home_url) or WordPress Address (site_url). `www.example.com` and `example.com` are different hostnames, so set those addresses to the hostname visitors load.

= I am locked out of wp-admin. =

Rename `wp-content/plugins/postcaptcha` over SFTP, or run `wp plugin deactivate postcaptcha`. The plugin rejects a form when it cannot reach Polyguard.

= Does it protect XML-RPC or the REST API? =

No. Requests to XML-RPC, the REST API and WP-CLI do not carry a widget response, so the plugin does not check them. If you do not use XML-RPC, turn it off with a security plugin or at the web server.

= Does it work with other login or registration forms? =

The plugin checks login, registration and lost password requests sent to wp-login.php, and the WooCommerce My Account forms. Forms from other plugins that call WordPress directly are not checked, and do not show the widget.

= Does it work with the WooCommerce checkout block? =

No. The checkout block submits through the Store API, which the plugin does not check. Use the `[woocommerce_checkout]` shortcode for the checkout page if you want the Trust Check there.

= Does it work on multisite? =

Each site has its own settings. The network signup page (wp-signup.php) is not covered.

= Can I use the widget on other forms? =

Yes. Print `Postcaptcha::widget( 'your-action' )` inside the form, which also loads the script, and call `Postcaptcha::verify( 'your-action' )` when the form is submitted. It returns `true` or a `WP_Error`. The action is up to 32 letters, digits, `_` or `-`.

== Changelog ==

= 1.0.0 =
* First release: login, registration, lost password, comments, WooCommerce registration and classic checkout, Contact Form 7.
