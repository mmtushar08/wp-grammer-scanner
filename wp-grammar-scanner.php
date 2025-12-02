<?php
/**
 * Plugin Name: WP Grammar Scanner
 * Description: Scans site content for grammar & spelling issues and generates monthly reports.
 * Version:     0.1.0
 * Author:      Tushar
 * Text Domain: wp-grammar-scanner
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'WP_GS_VERSION', '0.1.0' );
define( 'WP_GS_PATH', plugin_dir_path( __FILE__ ) );
define( 'WP_GS_URL', plugin_dir_url( __FILE__ ) );

// Includes
require_once WP_GS_PATH . 'includes/helpers.php';
require_once WP_GS_PATH . 'includes/api-client.php';
require_once WP_GS_PATH . 'includes/scanner.php';
require_once WP_GS_PATH . 'includes/cron.php';
require_once WP_GS_PATH . 'includes/rest-api.php';
require_once WP_GS_PATH . 'admin/admin-loader.php';

// Activation / deactivation
register_activation_hook( __FILE__, 'wp_gs_activate' );
register_deactivation_hook( __FILE__, 'wp_gs_deactivate' );

function wp_gs_activate() {
    // Create DB table for reports
    wp_gs_create_reports_table();

    // Default settings
    if ( ! get_option( 'wp_gs_settings' ) ) {
        update_option( 'wp_gs_settings', [
            'auto_scan' => true,
            'scan_interval_days' => 30, // monthly
        ] );
    }

    // Schedule cron if not already
    if ( ! wp_next_scheduled( 'wp_gs_daily_event' ) ) {
        wp_schedule_event( time(), 'daily', 'wp_gs_daily_event' );
    }
}

function wp_gs_deactivate() {
    wp_clear_scheduled_hook( 'wp_gs_daily_event' );
}
