<?php

if ( ! defined( 'ABSPATH' ) ) exit;

// Hook the daily event (scheduled in main plugin file)
add_action( 'wp_gs_daily_event', 'wp_gs_handle_daily_event' );

function wp_gs_handle_daily_event() {
    $settings = get_option( 'wp_gs_settings', [] );
    $auto     = isset( $settings['auto_scan'] ) ? (bool) $settings['auto_scan'] : true;
    $interval = isset( $settings['scan_interval_days'] ) ? (int) $settings['scan_interval_days'] : 30;

    if ( ! $auto ) {
        return;
    }

    $last_run = get_option( 'wp_gs_last_scan', 0 );
    $now      = time();

    if ( ! $last_run || ( ( $now - $last_run ) >= ( $interval * DAY_IN_SECONDS ) ) ) {
        $scanner = new WP_GS_Scanner();
        $scanner->run_scan();
        update_option( 'wp_gs_last_scan', $now );
    }
}