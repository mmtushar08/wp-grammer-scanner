<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class WP_GS_Admin {

    public function __construct() {
        add_action( 'admin_menu', [ $this, 'add_menu_page' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );
    }

    public function add_menu_page() {
        add_menu_page(
            'WP Grammar Scanner',
            'Grammar Scanner',
            'manage_options',
            'wp-grammar-scanner',
            [ $this, 'render_app' ],
            'dashicons-search',
            58
        );
    }

    public function enqueue_assets( $hook ) {
        if ( $hook !== 'toplevel_page_wp-grammar-scanner' ) {
            return;
        }

        // JS: built by webpack as admin/build/index.js
        wp_enqueue_script(
            'wp-gs-admin-js',
            WP_GS_URL . 'admin/build/index.js',
            [ 'wp-element' ], // for React in WP
            WP_GS_VERSION,
            true
        );

        // If your webpack injects CSS via JS (using style-loader, which your log shows),
        // you DON'T need to enqueue a separate CSS file.
        // Remove the CSS enqueue for now:
        // wp_enqueue_style(...)

        wp_localize_script( 'wp-gs-admin-js', 'WP_GS_DATA', [
            'restUrl' => esc_url_raw( rest_url( 'wp-gs/v1/' ) ),
            'nonce'   => wp_create_nonce( 'wp_rest' ),
        ] );
    }



    public function render_app() {
        echo '<div class="wrap">';
        echo '<h1>WP Grammar Scanner</h1>';
        echo '<div id="wp-gs-admin-app"></div>';
        echo '</div>';
    }
}

new WP_GS_Admin();
