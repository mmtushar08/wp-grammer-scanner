<?php

if ( ! defined( 'ABSPATH' ) ) exit;

class WP_GS_Scan_Endpoint {

    public function register_routes() {
        register_rest_route( 'wp-gs/v1', '/scan', [
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'handle_scan' ],
                // For now, open during dev. We'll lock it later.
                'permission_callback' => function () {
                    return current_user_can( 'manage_options' );
                },
            ],
        ] );
    }

    public function handle_scan( WP_REST_Request $request ) {
        if ( ! class_exists( 'WP_GS_Scanner' ) ) {
            return new WP_REST_Response( [ 'error' => 'Scanner class missing' ], 500 );
        }

        $scanner = new WP_GS_Scanner();
        $result  = $scanner->run_scan();

        // Optionally update last run time
        update_option( 'wp_gs_last_scan', time() );

        return new WP_REST_Response( [
            'success'      => true,
            'report_id'    => $result['report_id'],
            'issues'       => $result['issues'],
            'issues_count' => count( $result['issues'] ),
        ], 200 );
    }
}
