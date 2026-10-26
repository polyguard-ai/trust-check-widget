<?php
/**
 * WooCommerce My Account registration and classic checkout.
 *
 * @package Postcaptcha
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * WooCommerce hooks. They do nothing when WooCommerce is not active.
 */
class Postcaptcha_WooCommerce {

	const CHECKOUT_HANDLE = 'postcaptcha-woocommerce-checkout';

	/**
	 * Set once the checkout response has been sent to siteverify, after which
	 * it cannot be used again.
	 *
	 * @var bool
	 */
	private static $response_used = false;

	/**
	 * Add the hooks for the enabled WooCommerce forms.
	 */
	public static function init() {
		add_action( 'before_woocommerce_init', array( __CLASS__, 'declare_compatibility' ) );

		if ( Postcaptcha::enabled( 'wc_register' ) ) {
			add_action( 'woocommerce_register_form', array( __CLASS__, 'echo_register_widget' ) );
			add_filter( 'woocommerce_process_registration_errors', array( __CLASS__, 'check_register' ) );
		}

		if ( Postcaptcha::enabled( 'wc_checkout' ) ) {
			add_action( 'woocommerce_checkout_after_customer_details', array( __CLASS__, 'echo_checkout_widget' ) );
			add_action( 'woocommerce_after_checkout_validation', array( __CLASS__, 'check_checkout' ), 999, 2 );
			add_filter( 'woocommerce_add_error', array( __CLASS__, 'mark_error' ) );
		}
	}

	/**
	 * The plugin does not touch orders, so it works with HPOS. The checkout
	 * block submits through the Store API, which these hooks do not cover.
	 */
	public static function declare_compatibility() {
		if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', POSTCAPTCHA_FILE, true );
			\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'cart_checkout_blocks', POSTCAPTCHA_FILE, false );
		}
	}

	/**
	 * My Account registration form.
	 */
	public static function echo_register_widget() {
		echo Postcaptcha::widget( 'wc_register' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * My Account registration. Not called for accounts created at checkout.
	 *
	 * @param WP_Error $errors Validation errors so far.
	 * @return WP_Error
	 */
	public static function check_register( $errors ) {
		$result = Postcaptcha::verify( 'wc_register' );
		if ( is_wp_error( $result ) ) {
			$errors->add( $result->get_error_code(), $result->get_error_message() );
		}
		return $errors;
	}

	/**
	 * Classic checkout. Placed outside the order review, which WooCommerce
	 * replaces on every checkout update.
	 */
	public static function echo_checkout_widget() {
		wp_enqueue_script(
			self::CHECKOUT_HANDLE,
			plugins_url( 'assets/js/woocommerce-checkout.js', POSTCAPTCHA_FILE ),
			array( 'jquery', Postcaptcha::SCRIPT_HANDLE ),
			POSTCAPTCHA_VERSION,
			true
		);
		echo Postcaptcha::widget( 'wc_checkout' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * Runs last, and only when the other fields are valid, so a typo in an
	 * address does not use up the response.
	 *
	 * @param array    $data   Posted checkout data.
	 * @param WP_Error $errors Validation errors so far.
	 */
	public static function check_checkout( $data, $errors ) {
		if ( $errors->has_errors() ) {
			return;
		}
		self::$response_used = true;
		$result              = Postcaptcha::verify( 'wc_checkout' );
		if ( is_wp_error( $result ) ) {
			$errors->add( $result->get_error_code(), $result->get_error_message() );
		}
	}

	/**
	 * Tags checkout errors added after the response was used, including payment
	 * failures, so the checkout script knows to reset the widget.
	 *
	 * @param string $message Error notice markup.
	 * @return string
	 */
	public static function mark_error( $message ) {
		if ( self::$response_used ) {
			$message .= '<span class="postcaptcha-reset"></span>';
		}
		return $message;
	}
}
