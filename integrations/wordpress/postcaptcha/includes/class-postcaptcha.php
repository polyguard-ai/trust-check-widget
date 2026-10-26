<?php
/**
 * Settings, widget markup and server-side verification.
 *
 * @package Postcaptcha
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared helpers used by every form integration.
 */
class Postcaptcha {

	const OPTION          = 'postcaptcha_settings';
	const SCRIPT_URL      = 'https://cdn.polyguard.ai/sdk/latest/trust-check.js';
	const SITEVERIFY_URL  = 'https://api.polyguard.ai/v2/siteverify';
	const RESPONSE_FIELD  = 'pg-trust-check-response';
	const SCRIPT_HANDLE   = 'postcaptcha-trust-check';
	const REQUEST_TIMEOUT = 5;

	/**
	 * Default settings. Login is off until the site owner has tried a Trust
	 * Check on another form, so activating the plugin cannot lock them out.
	 *
	 * @return array
	 */
	public static function defaults() {
		return array(
			'login'        => false,
			'register'     => true,
			'lostpassword' => true,
			'comment'      => true,
			'wc_register'  => false,
			'wc_checkout'  => false,
			'theme'        => 'auto',
			'secret'       => '',
		);
	}

	/**
	 * Saved settings merged over the defaults.
	 *
	 * @return array
	 */
	public static function settings() {
		$saved = get_option( self::OPTION, array() );
		return array_merge( self::defaults(), is_array( $saved ) ? $saved : array() );
	}

	/**
	 * Whether protection for a form is switched on.
	 *
	 * @param string $form Settings key.
	 * @return bool
	 */
	public static function enabled( $form ) {
		$settings = self::settings();
		return ! empty( $settings[ $form ] );
	}

	/**
	 * The siteverify secret: the POSTCAPTCHA_SECRET constant if defined, else the saved setting.
	 *
	 * @return string
	 */
	public static function secret() {
		if ( defined( 'POSTCAPTCHA_SECRET' ) ) {
			return (string) POSTCAPTCHA_SECRET;
		}
		$settings = self::settings();
		return (string) $settings['secret'];
	}

	/**
	 * Register the widget script so integrations can enqueue it or depend on it.
	 */
	public static function register_script() {
		// The CDN path carries the version; a ?ver= query would only split the cache.
		wp_register_script(
			self::SCRIPT_HANDLE,
			self::SCRIPT_URL,
			array(),
			null, // phpcs:ignore WordPress.WP.EnqueuedResourceParameters.MissingVersion
			array(
				'strategy'  => 'defer',
				'in_footer' => true,
			)
		);
	}

	/**
	 * Widget markup. Enqueues the script, which prints in the footer.
	 *
	 * @param string $action Echoed back by siteverify; up to 32 characters of [A-Za-z0-9_-].
	 * @param string $size   normal, compact or flexible.
	 * @return string
	 */
	public static function widget( $action, $size = 'normal' ) {
		wp_enqueue_script( self::SCRIPT_HANDLE );
		$settings = self::settings();
		return sprintf(
			'<div class="pg-trust-check" data-action="%1$s" data-theme="%2$s" data-size="%3$s"></div>',
			esc_attr( $action ),
			esc_attr( $settings['theme'] ),
			esc_attr( $size )
		);
	}

	/**
	 * Hostnames a valid result may carry: the hosts of home_url() and site_url().
	 *
	 * @return string[]
	 */
	public static function expected_hostnames() {
		$hosts = array();
		foreach ( array( home_url(), site_url() ) as $url ) {
			$host = wp_parse_url( $url, PHP_URL_HOST );
			if ( is_string( $host ) && '' !== $host ) {
				$hosts[] = strtolower( $host );
			}
		}
		return array_values( array_unique( $hosts ) );
	}

	/**
	 * Requests that cannot carry a widget response: XML-RPC, REST and WP-CLI.
	 *
	 * @return bool
	 */
	public static function is_non_form_request() {
		return ( defined( 'XMLRPC_REQUEST' ) && XMLRPC_REQUEST )
			|| ( defined( 'REST_REQUEST' ) && REST_REQUEST )
			|| ( defined( 'WP_CLI' ) && WP_CLI );
	}

	/**
	 * The widget response posted with the current request.
	 *
	 * The calling form handler (wp-login.php, wp-comments-post.php, WooCommerce,
	 * Contact Form 7) has already checked its own nonce where it uses one.
	 *
	 * @return string
	 */
	public static function posted_response() {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( ! isset( $_POST[ self::RESPONSE_FIELD ] ) || ! is_string( $_POST[ self::RESPONSE_FIELD ] ) ) {
			return '';
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		return sanitize_text_field( wp_unslash( $_POST[ self::RESPONSE_FIELD ] ) );
	}

	/**
	 * Verify the posted response with Polyguard.
	 *
	 * Fails closed: a network error or a reply that is not JSON is a failure.
	 *
	 * @param string $action The data-action the widget was rendered with.
	 * @return true|WP_Error
	 */
	public static function verify( $action ) {
		$token = self::posted_response();
		if ( '' === $token ) {
			return new WP_Error( 'postcaptcha_missing', self::message( 'postcaptcha_missing' ) );
		}

		$body = array( 'response' => $token );
		$ip   = isset( $_SERVER['REMOTE_ADDR'] ) ? filter_var( wp_unslash( $_SERVER['REMOTE_ADDR'] ), FILTER_VALIDATE_IP ) : false;
		if ( $ip ) {
			$body['remoteip'] = $ip;
		}
		$secret = self::secret();
		if ( '' !== $secret ) {
			$body['secret'] = $secret;
		}

		$reply = wp_remote_post(
			self::SITEVERIFY_URL,
			array(
				'timeout' => self::REQUEST_TIMEOUT,
				'body'    => $body,
			)
		);
		if ( is_wp_error( $reply ) ) {
			return new WP_Error( 'postcaptcha_failed', self::message( 'postcaptcha_failed' ) );
		}

		$result = json_decode( wp_remote_retrieve_body( $reply ), true );
		$passed = is_array( $result )
			&& isset( $result['success'], $result['hostname'], $result['action'] )
			&& true === $result['success']
			&& is_string( $result['hostname'] )
			&& in_array( strtolower( $result['hostname'] ), self::expected_hostnames(), true )
			&& $action === $result['action'];

		return $passed ? true : new WP_Error( 'postcaptcha_failed', self::message( 'postcaptcha_failed' ) );
	}

	/**
	 * Visitor-facing text for an error code.
	 *
	 * @param string $code postcaptcha_missing or postcaptcha_failed.
	 * @return string
	 */
	public static function message( $code ) {
		if ( 'postcaptcha_missing' === $code ) {
			return __( 'Complete the Trust Check before you submit the form.', 'postcaptcha' );
		}
		return __( 'The Trust Check could not be verified. Complete it again and resubmit the form.', 'postcaptcha' );
	}
}

add_action( 'init', array( 'Postcaptcha', 'register_script' ) );
