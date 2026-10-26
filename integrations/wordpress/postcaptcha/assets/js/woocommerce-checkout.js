/* global jQuery */
// A response verifies once. When checkout fails after the plugin sent the
// response to siteverify, the error carries a postcaptcha-reset marker.
( function ( $ ) {
	$( document.body ).on( 'checkout_error', function ( event, message ) {
		if ( String( message ).indexOf( 'postcaptcha-reset' ) === -1 ) {
			return;
		}
		if ( ! window.Polyguard || ! window.Polyguard.TrustCheck ) {
			return;
		}
		document.querySelectorAll( 'form.checkout .pg-trust-check' ).forEach( function ( el ) {
			window.Polyguard.TrustCheck.reset( el );
		} );
	} );
} )( jQuery );
