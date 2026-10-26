<?php
/**
 * Login, registration, lost password and comment forms, including the
 * WooCommerce My Account copies of login and lost password.
 *
 * @package Postcaptcha
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Hooks for the forms WordPress ships with.
 */
class Postcaptcha_Core_Forms {

	/**
	 * Add the hooks for every enabled form.
	 */
	public static function init() {
		add_action( 'login_enqueue_scripts', array( __CLASS__, 'login_styles' ) );

		if ( Postcaptcha::enabled( 'login' ) ) {
			add_action( 'login_form', array( __CLASS__, 'echo_login_widget' ) );
			add_filter( 'login_form_middle', array( __CLASS__, 'append_login_widget' ) );
			add_action( 'woocommerce_login_form', array( __CLASS__, 'echo_login_widget_normal' ) );
			add_filter( 'authenticate', array( __CLASS__, 'check_login' ), 30 );
			add_filter( 'woocommerce_process_login_errors', array( __CLASS__, 'check_woocommerce_login' ) );
		}

		if ( Postcaptcha::enabled( 'register' ) ) {
			add_action( 'register_form', array( __CLASS__, 'echo_register_widget' ) );
			add_filter( 'registration_errors', array( __CLASS__, 'check_register' ) );
		}

		if ( Postcaptcha::enabled( 'lostpassword' ) ) {
			add_action( 'lostpassword_form', array( __CLASS__, 'echo_lostpassword_widget' ) );
			add_action( 'woocommerce_lostpassword_form', array( __CLASS__, 'echo_lostpassword_widget_normal' ) );
			add_action( 'lostpassword_post', array( __CLASS__, 'check_lostpassword' ) );
		}

		if ( Postcaptcha::enabled( 'comment' ) ) {
			add_action( 'comment_form_after_fields', array( __CLASS__, 'echo_comment_widget' ) );
			add_filter( 'preprocess_comment', array( __CLASS__, 'check_comment' ) );
		}
	}

	/**
	 * Space below the widget on wp-login.php.
	 */
	public static function login_styles() {
		wp_add_inline_style( 'login', '.login .pg-trust-check { margin: 0 0 16px; }' );
	}

	/**
	 * The login form on wp-login.php is narrower than the widget's normal size.
	 */
	public static function echo_login_widget() {
		echo Postcaptcha::widget( 'login', 'flexible' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * WooCommerce My Account login form.
	 */
	public static function echo_login_widget_normal() {
		echo Postcaptcha::widget( 'login' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Forms printed by wp_login_form(), which post to wp-login.php.
	 *
	 * @param string $content Markup between the password field and the remember-me checkbox.
	 * @return string
	 */
	public static function append_login_widget( $content ) {
		return $content . Postcaptcha::widget( 'login' );
	}

	/**
	 * Registration form on wp-login.php.
	 */
	public static function echo_register_widget() {
		echo Postcaptcha::widget( 'register', 'flexible' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Lost password form on wp-login.php.
	 */
	public static function echo_lostpassword_widget() {
		echo Postcaptcha::widget( 'lostpassword', 'flexible' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * WooCommerce My Account lost password form.
	 */
	public static function echo_lostpassword_widget_normal() {
		echo Postcaptcha::widget( 'lostpassword' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Comment form, for visitors who are not logged in.
	 */
	public static function echo_comment_widget() {
		echo Postcaptcha::widget( 'comment' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Whether the current request is a form POST to wp-login.php. Other code
	 * that calls wp_signon(), register_new_user() or retrieve_password() is
	 * left alone.
	 *
	 * @return bool
	 */
	private static function is_login_post() {
		return ! Postcaptcha::is_non_form_request()
			&& isset( $_SERVER['REQUEST_METHOD'] )
			&& 'POST' === $_SERVER['REQUEST_METHOD']
			&& is_login();
	}

	/**
	 * Runs after the password check, and replaces its result when the Trust
	 * Check fails, so a wrong password reveals nothing without a Trust Check.
	 *
	 * @param WP_User|WP_Error|null $user Result of earlier authenticate callbacks.
	 * @return WP_User|WP_Error|null
	 */
	public static function check_login( $user ) {
		if ( ! self::is_login_post() ) {
			return $user;
		}
		$result = Postcaptcha::verify( 'login' );
		return is_wp_error( $result ) ? $result : $user;
	}

	/**
	 * WooCommerce My Account login. WooCommerce applies this filter before it
	 * checks the password.
	 *
	 * @param WP_Error $errors Validation errors so far.
	 * @return WP_Error
	 */
	public static function check_woocommerce_login( $errors ) {
		$result = Postcaptcha::verify( 'login' );
		if ( is_wp_error( $result ) ) {
			$errors->add( $result->get_error_code(), $result->get_error_message() );
		}
		return $errors;
	}

	/**
	 * Registration on wp-login.php.
	 *
	 * @param WP_Error $errors Registration errors so far.
	 * @return WP_Error
	 */
	public static function check_register( $errors ) {
		if ( ! self::is_login_post() ) {
			return $errors;
		}
		$result = Postcaptcha::verify( 'register' );
		if ( is_wp_error( $result ) ) {
			$errors->add( $result->get_error_code(), $result->get_error_message() );
		}
		return $errors;
	}

	/**
	 * Lost password, on wp-login.php or WooCommerce. Runs before WordPress
	 * looks up the account.
	 *
	 * @param WP_Error $errors Errors so far.
	 */
	public static function check_lostpassword( $errors ) {
		// WooCommerce processes its form only when wc_reset_password is posted, after checking its nonce.
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		$woocommerce_form = ! Postcaptcha::is_non_form_request() && ! is_admin() && isset( $_POST['wc_reset_password'] );
		if ( ! self::is_login_post() && ! $woocommerce_form ) {
			return;
		}
		$result = Postcaptcha::verify( 'lostpassword' );
		if ( is_wp_error( $result ) ) {
			$errors->add( $result->get_error_code(), $result->get_error_message() );
		}
	}

	/**
	 * Comments posted through wp-comments-post.php by visitors who are not logged in.
	 *
	 * @param array $commentdata Comment data.
	 * @return array
	 */
	public static function check_comment( $commentdata ) {
		global $pagenow;

		if ( is_user_logged_in() || Postcaptcha::is_non_form_request() || 'wp-comments-post.php' !== $pagenow ) {
			return $commentdata;
		}
		$type = isset( $commentdata['comment_type'] ) ? $commentdata['comment_type'] : '';
		if ( in_array( $type, array( 'pingback', 'trackback' ), true ) ) {
			return $commentdata;
		}

		$result = Postcaptcha::verify( 'comment' );
		if ( is_wp_error( $result ) ) {
			wp_die(
				esc_html( $result->get_error_message() ),
				esc_html__( 'Comment not posted', 'postcaptcha' ),
				array(
					'response'  => 403,
					'back_link' => true,
				)
			);
		}
		return $commentdata;
	}
}
