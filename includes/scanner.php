<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class WP_GS_Scanner {

    protected $api;

    public function __construct() {
        $this->api = new WP_GS_Api_Client();
    }

    /**
     * Scan all posts/pages and create a CSV report.
     * Returns [ 'report_id' => int, 'issues' => array ] on success.
     */
    public function run_scan() {

        $args = [
            'post_type'      => [ 'post', 'page' ],
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'fields'         => 'ids',
        ];

        $post_ids = get_posts( $args );

        error_log( 'WPGS: run_scan scanning ' . count( $post_ids ) . ' posts.' );

        $issues       = [];
        $total_issues = 0;

        foreach ( $post_ids as $post_id ) {
            $post = get_post( $post_id );
            if ( ! $post ) {
                continue;
            }

            $text = $post->post_title . "\n\n" . wp_strip_all_tags( $post->post_content );

            $matches = $this->api->check_text( $text );

            if ( ! is_array( $matches ) ) {
                error_log( 'WPGS: Post ' . $post_id . ' (' . $post->post_title . ') matches is not array.' );
                continue;
            }

            $post_issue_count = 0;

            foreach ( $matches as $match ) {
                $context    = isset( $match['context']['text'] ) ? $match['context']['text'] : '';
                $message    = isset( $match['message'] ) ? $match['message'] : '';
                $rule       = isset( $match['rule']['id'] ) ? $match['rule']['id'] : '';
                $sentence   = isset( $match['sentence'] ) ? $match['sentence'] : $context;

                // Build suggestions string from replacements
                $suggestions = '';
                if ( ! empty( $match['replacements'] ) && is_array( $match['replacements'] ) ) {
                    $suggest_values = [];
                    foreach ( $match['replacements'] as $rep ) {
                        if ( ! empty( $rep['value'] ) ) {
                            $suggest_values[] = $rep['value'];
                        }
                    }
                    if ( ! empty( $suggest_values ) ) {
                        // e.g. "word1 | word2 | word3"
                        $suggestions = implode( ' | ', $suggest_values );
                    }
                }

                $issues[] = [
                    'post_id'     => $post_id,
                    'post_title'  => $post->post_title,
                    'url'         => get_permalink( $post_id ),
                    'message'     => $message,
                    'rule'        => $rule,
                    'sentence'    => $sentence,
                    'context'     => $context,
                    'suggestions' => $suggestions,
                ];

                $total_issues++;
                $post_issue_count++;
            }

            error_log( 'WPGS: Post ' . $post_id . ' (' . $post->post_title . ') matches: ' . $post_issue_count );
        }

        // Create CSV report with the new columns
        $csv_path = $this->generate_csv( $issues );

        if ( ! function_exists( 'wp_gs_insert_report' ) ) {
            error_log( 'WPGS: wp_gs_insert_report() not found.' );
            return [
                'report_id' => 0,
                'issues'    => $issues,
            ];
        }

        $report_id = wp_gs_insert_report( [
            'status'       => 'completed',
            'total_posts'  => count( $post_ids ),
            'total_issues' => $total_issues,
            'csv_path'     => $csv_path,
        ] );

        return [
            'report_id' => $report_id,
            'issues'    => $issues,
        ];
    }

    /**
     * Generate CSV with extended columns:
     * Post ID, Title, URL, Message, Rule, Sentence, Context, Suggestions
     */
    protected function generate_csv( $rows ) {
        if ( empty( $rows ) ) {
            $rows = [];
        }

        $upload_dir = wp_upload_dir();
        $dir        = trailingslashit( $upload_dir['basedir'] ) . 'wp-grammar-scanner/';

        if ( ! file_exists( $dir ) ) {
            wp_mkdir_p( $dir );
        }

        $filename = 'grammar-report-' . date( 'Y-m-d-H-i-s' ) . '.csv';
        $filepath = $dir . $filename;

        $fh = fopen( $filepath, 'w' );

        // CSV header
        fputcsv( $fh, [
            'Post ID',
            'Title',
            'URL',
            'Message',
            'Rule',
            'Sentence',
            'Context',
            'Suggestions',
        ] );

        foreach ( $rows as $row ) {
            fputcsv( $fh, [
                $row['post_id'],
                $row['post_title'],
                $row['url'],
                $row['message'],
                $row['rule'],
                $row['sentence'],
                $row['context'],
                $row['suggestions'],
            ] );
        }

        fclose( $fh );

        return $filepath;
    }
}