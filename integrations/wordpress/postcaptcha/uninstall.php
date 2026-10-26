<?php
/**
 * Delete the plugin's settings when it is deleted from the Plugins screen.
 *
 * @package Postcaptcha
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

if ( is_multisite() ) {
	$postcaptcha_site_ids = get_sites(
		array(
			'fields' => 'ids',
			'number' => 0,
		)
	);
	foreach ( $postcaptcha_site_ids as $postcaptcha_site_id ) {
		switch_to_blog( $postcaptcha_site_id );
		delete_option( 'postcaptcha_settings' );
		restore_current_blog();
	}
} else {
	delete_option( 'postcaptcha_settings' );
}
