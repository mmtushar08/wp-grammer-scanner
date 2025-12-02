<?php

if ( ! defined( 'ABSPATH' ) ) exit;

function wp_gs_create_reports_table() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'wp_gs_reports';

    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE IF NOT EXISTS $table_name (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        created_at DATETIME NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'completed',
        total_posts INT(11) NOT NULL DEFAULT 0,
        total_issues INT(11) NOT NULL DEFAULT 0,
        csv_path TEXT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta( $sql );
}

function wp_gs_get_reports() {
    global $wpdb;
    $table_name = $wpdb->prefix . 'wp_gs_reports';
    return $wpdb->get_results( "SELECT * FROM $table_name ORDER BY created_at DESC LIMIT 50", ARRAY_A );
}

function wp_gs_insert_report( $data ) {
    global $wpdb;
    $table_name = $wpdb->prefix . 'wp_gs_reports';

    $wpdb->insert( $table_name, [
        'created_at'  => current_time( 'mysql' ),
        'status'      => isset( $data['status'] ) ? $data['status'] : 'completed',
        'total_posts' => isset( $data['total_posts'] ) ? (int) $data['total_posts'] : 0,
        'total_issues'=> isset( $data['total_issues'] ) ? (int) $data['total_issues'] : 0,
        'csv_path'    => isset( $data['csv_path'] ) ? $data['csv_path'] : '',
    ] );

    return $wpdb->insert_id;
}