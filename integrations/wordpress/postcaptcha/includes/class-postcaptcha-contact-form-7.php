<?php
/**
 * Contact Form 7 form tag: [postcaptcha] or [postcaptcha action:quote].
 *
 * @package Postcaptcha
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Contact Form 7 hooks. They do nothing when Contact Form 7 is not active.
 */
class Postcaptcha_Contact_Form_7 {

	const TAG            = 'postcaptcha';
	const DEFAULT_ACTION = 'contact';
	const SCRIPT_HANDLE  = 'postcaptcha-contact-form-7';

	/**
	 * Register the form tag and its validation.
	 */
	public static function init() {
		add_action( 'wpcf7_init', array( __CLASS__, 'add_form_tag' ) );
		add_filter( 'wpcf7_validate', array( __CLASS__, 'validate' ), 20, 2 );
	}

	/**
	 * Register [postcaptcha].
	 */
	public static function add_form_tag() {
		wpcf7_add_form_tag( self::TAG, array( __CLASS__, 'render' ), array( 'display-block' => true ) );
	}

	/**
	 * The action for a tag: its action: option, or "contact".
	 *
	 * @param WPCF7_FormTag $tag Form tag.
	 * @return string
	 */
	private static function action_for( $tag ) {
		$action = $tag->get_option( 'action', '[A-Za-z0-9_-]{1,32}', true );
		return is_string( $action ) && '' !== $action ? $action : self::DEFAULT_ACTION;
	}

	/**
	 * Tag markup. The wrapper's data-name lets Contact Form 7 place the
	 * validation message next to the widget.
	 *
	 * @param WPCF7_FormTag $tag Form tag.
	 * @return string
	 */
	public static function render( $tag ) {
		wp_enqueue_script(
			self::SCRIPT_HANDLE,
			plugins_url( 'assets/js/contact-form-7.js', POSTCAPTCHA_FILE ),
			array( Postcaptcha::SCRIPT_HANDLE ),
			POSTCAPTCHA_VERSION,
			true
		);
		return sprintf(
			'<span class="wpcf7-form-control-wrap" data-name="%1$s">%2$s</span>',
			esc_attr( Postcaptcha::RESPONSE_FIELD ),
			Postcaptcha::widget( self::action_for( $tag ) )
		);
	}

	/**
	 * Runs after the per-field checks, and only when they all pass, so a
	 * mistake in another field does not use up the response.
	 *
	 * @param WPCF7_Validation $result Validation result.
	 * @param WPCF7_FormTag[]  $tags   Tags in the submitted form.
	 * @return WPCF7_Validation
	 */
	public static function validate( $result, $tags ) {
		if ( ! $result->is_valid() ) {
			return $result;
		}
		foreach ( $tags as $tag ) {
			if ( self::TAG !== $tag->type ) {
				continue;
			}
			$verified = Postcaptcha::verify( self::action_for( $tag ) );
			if ( is_wp_error( $verified ) ) {
				$result->invalidate(
					array(
						'type' => self::TAG,
						'name' => Postcaptcha::RESPONSE_FIELD,
					),
					$verified->get_error_message()
				);
			}
			break;
		}
		return $result;
	}
}
