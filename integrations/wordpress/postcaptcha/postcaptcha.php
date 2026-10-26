<?php
/**
 * Plugin Name:       postcaptcha
 * Plugin URI:        https://postcaptcha.com
 * Description:       Protects login, registration, lost password and comment forms with a Polyguard Trust Check. No site key or account needed.
 * Version:           1.0.0
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            Polyguard
 * Author URI:        https://polyguard.ai
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       postcaptcha
 *
 * @package Postcaptcha
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'POSTCAPTCHA_VERSION', '1.0.0' );
define( 'POSTCAPTCHA_FILE', __FILE__ );
define( 'POSTCAPTCHA_DIR', plugin_dir_path( __FILE__ ) );

require_once POSTCAPTCHA_DIR . 'includes/class-postcaptcha.php';
require_once POSTCAPTCHA_DIR . 'includes/class-postcaptcha-core-forms.php';
require_once POSTCAPTCHA_DIR . 'includes/class-postcaptcha-woocommerce.php';
require_once POSTCAPTCHA_DIR . 'includes/class-postcaptcha-contact-form-7.php';

if ( is_admin() ) {
	require_once POSTCAPTCHA_DIR . 'includes/class-postcaptcha-settings.php';
	Postcaptcha_Settings::init();
}

Postcaptcha_Core_Forms::init();
Postcaptcha_WooCommerce::init();
Postcaptcha_Contact_Form_7::init();
