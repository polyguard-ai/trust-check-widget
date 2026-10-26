<?php
/**
 * Settings > postcaptcha.
 *
 * @package Postcaptcha
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings page, built with the Settings API.
 */
class Postcaptcha_Settings {

	const PAGE  = 'postcaptcha';
	const GROUP = 'postcaptcha';

	/**
	 * Add the admin hooks.
	 */
	public static function init() {
		add_action( 'admin_menu', array( __CLASS__, 'add_page' ) );
		add_action( 'admin_init', array( __CLASS__, 'register' ) );
		add_filter( 'plugin_action_links_' . plugin_basename( POSTCAPTCHA_FILE ), array( __CLASS__, 'action_links' ) );
	}

	/**
	 * Form toggles, keyed by setting.
	 *
	 * @return array<string, array{label: string, description: string}>
	 */
	private static function forms() {
		$forms = array(
			'login'        => array(
				'label'       => __( 'Login', 'postcaptcha' ),
				'description' => __( 'wp-login.php, wp_login_form() and the WooCommerce My Account login. Complete a Trust Check on another form before you turn this on.', 'postcaptcha' ),
			),
			'register'     => array(
				'label'       => __( 'Registration', 'postcaptcha' ),
				'description' => __( 'The registration form on wp-login.php.', 'postcaptcha' ),
			),
			'lostpassword' => array(
				'label'       => __( 'Lost password', 'postcaptcha' ),
				'description' => __( 'wp-login.php and the WooCommerce My Account lost password form.', 'postcaptcha' ),
			),
			'comment'      => array(
				'label'       => __( 'Comments', 'postcaptcha' ),
				'description' => __( 'Comments from visitors who are not logged in.', 'postcaptcha' ),
			),
		);
		if ( self::woocommerce_active() ) {
			$forms['wc_register'] = array(
				'label'       => __( 'WooCommerce registration', 'postcaptcha' ),
				'description' => __( 'The My Account registration form.', 'postcaptcha' ),
			);
			$forms['wc_checkout'] = array(
				'label'       => __( 'WooCommerce checkout', 'postcaptcha' ),
				'description' => __( 'The classic checkout ([woocommerce_checkout] shortcode). The checkout block is not covered.', 'postcaptcha' ),
			);
		}
		return $forms;
	}

	/**
	 * Whether WooCommerce is loaded.
	 *
	 * @return bool
	 */
	private static function woocommerce_active() {
		return class_exists( 'WooCommerce' );
	}

	/**
	 * Add Settings > postcaptcha.
	 */
	public static function add_page() {
		add_options_page(
			__( 'postcaptcha', 'postcaptcha' ),
			__( 'postcaptcha', 'postcaptcha' ),
			'manage_options',
			self::PAGE,
			array( __CLASS__, 'render_page' )
		);
	}

	/**
	 * Register the option, its sections and fields.
	 */
	public static function register() {
		register_setting(
			self::GROUP,
			Postcaptcha::OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize' ),
				'default'           => Postcaptcha::defaults(),
			)
		);

		add_settings_section( 'postcaptcha_forms', __( 'Forms', 'postcaptcha' ), array( __CLASS__, 'render_forms_intro' ), self::PAGE );
		foreach ( self::forms() as $key => $form ) {
			add_settings_field(
				'postcaptcha_' . $key,
				$form['label'],
				array( __CLASS__, 'render_checkbox' ),
				self::PAGE,
				'postcaptcha_forms',
				array(
					'key'         => $key,
					'description' => $form['description'],
					'label_for'   => 'postcaptcha_' . $key,
				)
			);
		}

		add_settings_section( 'postcaptcha_widget', __( 'Widget', 'postcaptcha' ), '__return_false', self::PAGE );
		add_settings_field( 'postcaptcha_theme', __( 'Theme', 'postcaptcha' ), array( __CLASS__, 'render_theme' ), self::PAGE, 'postcaptcha_widget', array( 'label_for' => 'postcaptcha_theme' ) );

		add_settings_section( 'postcaptcha_account', __( 'Account', 'postcaptcha' ), array( __CLASS__, 'render_account_intro' ), self::PAGE );
		add_settings_field( 'postcaptcha_secret', __( 'Secret', 'postcaptcha' ), array( __CLASS__, 'render_secret' ), self::PAGE, 'postcaptcha_account', array( 'label_for' => 'postcaptcha_secret' ) );
	}

	/**
	 * Keep only known keys and values.
	 *
	 * @param mixed $input Submitted values.
	 * @return array
	 */
	public static function sanitize( $input ) {
		$input    = is_array( $input ) ? $input : array();
		$previous = Postcaptcha::settings();
		$clean    = Postcaptcha::defaults();

		foreach ( array( 'login', 'register', 'lostpassword', 'comment', 'wc_register', 'wc_checkout' ) as $key ) {
			$clean[ $key ] = ! empty( $input[ $key ] );
		}
		// The WooCommerce fields are not on the page while WooCommerce is inactive.
		if ( ! self::woocommerce_active() ) {
			$clean['wc_register'] = (bool) $previous['wc_register'];
			$clean['wc_checkout'] = (bool) $previous['wc_checkout'];
		}

		$theme          = isset( $input['theme'] ) ? sanitize_key( $input['theme'] ) : 'auto';
		$clean['theme'] = in_array( $theme, array( 'auto', 'light', 'dark' ), true ) ? $theme : 'auto';

		$clean['secret'] = isset( $input['secret'] ) ? trim( sanitize_text_field( $input['secret'] ) ) : '';

		return $clean;
	}

	/**
	 * Settings link on the Plugins screen.
	 *
	 * @param string[] $links Existing links.
	 * @return string[]
	 */
	public static function action_links( $links ) {
		$url = admin_url( 'options-general.php?page=' . self::PAGE );
		array_unshift( $links, '<a href="' . esc_url( $url ) . '">' . esc_html__( 'Settings', 'postcaptcha' ) . '</a>' );
		return $links;
	}

	/**
	 * Text above the form toggles.
	 */
	public static function render_forms_intro() {
		echo '<p>' . esc_html__( 'Visitors complete a Trust Check with their phone before these forms are accepted. They do not need to install an app.', 'postcaptcha' ) . '</p>';
		if ( class_exists( 'WPCF7' ) ) {
			echo '<p>' . esc_html__( 'Contact Form 7: add the [postcaptcha] tag to a form. [postcaptcha action:quote] sets the action Polyguard returns.', 'postcaptcha' ) . '</p>';
		}
	}

	/**
	 * Text above the secret field.
	 */
	public static function render_account_intro() {
		$hosts = implode( ', ', Postcaptcha::expected_hostnames() );
		echo '<p>';
		printf(
			/* translators: %s: comma-separated hostnames. */
			esc_html__( 'Polyguard accepts a Trust Check result only when its hostname is %s.', 'postcaptcha' ),
			'<code>' . esc_html( $hosts ) . '</code>'
		);
		echo ' ';
		esc_html_e( 'The first Trust Check from a new hostname creates a free Polyguard account for it, limited to 1,000 Trust Checks a week.', 'postcaptcha' );
		echo '</p><p>';
		printf(
			/* translators: %s: link to the claim instructions. */
			esc_html__( 'To manage that account, claim the hostname (%s), then paste the App API key below. The plugin sends it to Polyguard with every verification.', 'postcaptcha' ),
			'<a href="https://postcaptcha.com/#claim" target="_blank" rel="noopener">postcaptcha.com/#claim</a>'
		);
		echo '</p>';
	}

	/**
	 * One form toggle.
	 *
	 * @param array $args Field arguments.
	 */
	public static function render_checkbox( $args ) {
		$settings = Postcaptcha::settings();
		$key      = $args['key'];
		printf(
			'<label><input type="checkbox" id="postcaptcha_%1$s" name="%2$s[%1$s]" value="1" %3$s> %4$s</label>',
			esc_attr( $key ),
			esc_attr( Postcaptcha::OPTION ),
			checked( ! empty( $settings[ $key ] ), true, false ),
			esc_html( $args['description'] )
		);
	}

	/**
	 * Widget theme.
	 */
	public static function render_theme() {
		$settings = Postcaptcha::settings();
		$themes   = array(
			'auto'  => __( 'Match the visitor\'s system setting', 'postcaptcha' ),
			'light' => __( 'Light', 'postcaptcha' ),
			'dark'  => __( 'Dark', 'postcaptcha' ),
		);
		printf( '<select id="postcaptcha_theme" name="%s[theme]">', esc_attr( Postcaptcha::OPTION ) );
		foreach ( $themes as $value => $label ) {
			printf(
				'<option value="%1$s" %2$s>%3$s</option>',
				esc_attr( $value ),
				selected( $settings['theme'], $value, false ),
				esc_html( $label )
			);
		}
		echo '</select>';
	}

	/**
	 * Optional siteverify secret, unless POSTCAPTCHA_SECRET is defined.
	 */
	public static function render_secret() {
		if ( defined( 'POSTCAPTCHA_SECRET' ) ) {
			echo '<p>' . esc_html__( 'Set by the POSTCAPTCHA_SECRET constant in wp-config.php.', 'postcaptcha' ) . '</p>';
			return;
		}
		$settings = Postcaptcha::settings();
		printf(
			'<input type="password" class="regular-text" id="postcaptcha_secret" name="%1$s[secret]" value="%2$s" autocomplete="off" spellcheck="false">',
			esc_attr( Postcaptcha::OPTION ),
			esc_attr( $settings['secret'] )
		);
		echo '<p class="description">' . esc_html__( 'Optional. Leave empty until the hostname is claimed.', 'postcaptcha' ) . '</p>';
	}

	/**
	 * The settings page.
	 */
	public static function render_page() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		echo '<div class="wrap"><h1>' . esc_html( get_admin_page_title() ) . '</h1>';
		echo '<form action="options.php" method="post">';
		settings_fields( self::GROUP );
		do_settings_sections( self::PAGE );
		submit_button();
		echo '</form></div>';
	}
}
