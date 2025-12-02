<?php

if ( ! defined( 'ABSPATH' ) ) exit;

class WP_GS_Report_Endpoint {

    public function register_routes() {
        register_rest_route( 'wp-gs/v1', '/reports', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'get_reports' ],
                'permission_callback' => function () {
                    return current_user_can( 'manage_options' );
                },
            ],
        ] );

        register_rest_route( 'wp-gs/v1', '/reports/(?P<id>\d+)/download', [
            [
                'methods'             => 'GET',
                'callback'            => [ $this, 'download_report' ],
                'permission_callback' => function () {
                    return current_user_can( 'manage_options' );
                },
            ],
        ] );
    }

    public function get_reports() {
        $reports = wp_gs_get_reports();

        // Convert file path to URL
        $upload_dir = wp_upload_dir();
        $base_dir   = $upload_dir['basedir'];
        $base_url   = $upload_dir['baseurl'];

        foreach ( $reports as &$report ) {
            if ( ! empty( $report['csv_path'] ) && strpos( $report['csv_path'], $base_dir ) === 0 ) {
                $relative = str_replace( $base_dir, '', $report['csv_path'] );
                $report['csv_url'] = $base_url . $relative;
            } else {
                $report['csv_url'] = '';
            }
        }

        return new WP_REST_Response( $reports, 200 );
    }

    public function download_report( WP_REST_Request $request ) {
        $id = (int) $request['id'];

        global $wpdb;
        $table_name = $wpdb->prefix . 'wp_gs_reports';
        $report = $wpdb->get_row( $wpdb->prepare(
            "SELECT * FROM $table_name WHERE id = %d",
            $id
        ), ARRAY_A );

        if ( ! $report || empty( $report['csv_path'] ) || ! file_exists( $report['csv_path'] ) ) {
            return new WP_REST_Response( [ 'error' => 'Report not found' ], 404 );
        }

        // Just return URL
        $upload_dir = wp_upload_dir();
        $csv_path   = $report['csv_path'];
        $csv_url    = str_replace( $upload_dir['basedir'], $upload_dir['baseurl'], $csv_path );

        return new WP_REST_Response( [
            'url' => $csv_url,
        ], 200 );
    }
}