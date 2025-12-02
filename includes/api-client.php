<?php

if ( ! defined( 'ABSPATH' ) ) exit;

class WP_GS_Api_Client {

    protected $endpoint;
    protected $api_key;

    public function __construct() {
        // Example: public LanguageTool endpoint
        $this->endpoint = 'https://api.languagetool.org/v2/check';
        $this->api_key  = ''; // if you use a paid LT server, set here
    }

    public function check_text( $text, $language = 'en-US' ) {
        $args = [
            'body' => [
                'text'     => $text,
                'language' => $language,
            ],
            'timeout' => 20,
        ];

        // Add key if you have a private LanguageTool
        if ( ! empty( $this->api_key ) ) {
            $args['body']['apiKey'] = $this->api_key;
        }

        $response = wp_remote_post( $this->endpoint, $args );

        if ( is_wp_error( $response ) ) {
            error_log( 'WPGS LanguageTool error: ' . $response->get_error_message() );
            return [];
        }

        $code = wp_remote_retrieve_response_code( $response );
        $body = wp_remote_retrieve_body( $response );

        if ( $code !== 200 || empty( $body ) ) {
            error_log( 'WPGS LanguageTool HTTP code: ' . $code . ' body: ' . $body );
            return [];
        }

        $data = json_decode( $body, true );
        if ( ! isset( $data['matches'] ) || ! is_array( $data['matches'] ) ) {
            return [];
        }

        return $data['matches'];
    }
}
// ⬆️ **NO closing PHP tag** here
