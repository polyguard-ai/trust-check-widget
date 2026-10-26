// A response verifies once. The plugin sends it to siteverify unless another
// field failed validation, so reset the widget in every other case.
document.addEventListener( 'wpcf7submit', function ( event ) {
	var detail = event.detail || {};
	var api = detail.apiResponse || {};
	var invalid = api.invalid_fields || [];
	var ours = invalid.some( function ( field ) {
		return field && field.field === 'pg-trust-check-response';
	} );
	if ( detail.status === 'validation_failed' && ! ours ) {
		return;
	}
	if ( ! window.Polyguard || ! window.Polyguard.TrustCheck ) {
		return;
	}
	event.target.querySelectorAll( '.pg-trust-check' ).forEach( function ( el ) {
		window.Polyguard.TrustCheck.reset( el );
	} );
} );
