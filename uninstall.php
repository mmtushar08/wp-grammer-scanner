<?php

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

global $wpdb;

// Remove table
$table_name = $wpdb->prefix . 'wp_gs_reports';
$wpdb->query( "DROP TABLE IF EXISTS $table_name" );

// Remove options
delete_option( 'wp_gs_settings' );
delete_option( 'wp_gs_last_scan' );
