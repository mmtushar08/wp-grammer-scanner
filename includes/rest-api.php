<?php

if ( ! defined( 'ABSPATH' ) ) exit;

// Make sure scanner is loaded
require_once WP_GS_PATH . 'includes/scanner.php';

// Endpoints
require_once WP_GS_PATH . 'includes/endpoints/scan-endpoint.php';
require_once WP_GS_PATH . 'includes/endpoints/settings-endpoint.php';
require_once WP_GS_PATH . 'includes/endpoints/report-endpoint.php';

add_action( 'rest_api_init', function () {
    ( new WP_GS_Scan_Endpoint() )->register_routes();
    ( new WP_GS_Settings_Endpoint() )->register_routes();
    ( new WP_GS_Report_Endpoint() )->register_routes();
} );