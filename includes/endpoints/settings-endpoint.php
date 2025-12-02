<?php

if ( ! defined( 'ABSPATH' ) ) exit;

class WP_GS_Settings_Endpoint {

    public function register_routes() {
        register_rest_route( 'wp-gs/v1', '/settings', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_settings' ],
                'permission_callback' => function () {
                    return current_user_can( 'manage_options' );
                },
            ],
            [
                'methods'             => 'POST',
                'callback'            => [ $this, 'update_settings' ],
                'permission_callback' => function () {
                    return current_user_can( 'manage_options' );
                },
            ],
        ] );
    }

    public function get_settings() {
        $settings = get_option( 'wp_gs_settings', [
            'auto_scan'          => true,
            'scan_interval_days' => 30,
        ] );

        return new WP_REST_Response( $settings, 200 );
    }

    public function update_settings( WP_REST_Request $request ) {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new WP_REST_Response( [ 'error' => 'Invalid nonce' ], 403 );
        }

        $params = $request->get_json_params();

        $settings = [
            'auto_scan'          => ! empty( $params['auto_scan'] ),
            'scan_interval_days' => isset( $params['scan_interval_days'] )
                ? (int) $params['scan_interval_days']
                : 30,
        ];

        update_option( 'wp_gs_settings', $settings );

        return new WP_REST_Response( [
            'success'  => true,
            'settings' => $settings,
        ], 200 );
    }
}