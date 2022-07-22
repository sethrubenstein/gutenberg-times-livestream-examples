<?php

add_action( 'enqueue_block_editor_assets', function(){
    // Enqueue your script.
} );

/**
 * Register additional attributes for heading block.
 * @param mixed $metadata
 * @return mixed
 */
function heading_block_add_chapter_attributes( $metadata ) {
    if ( 'core/heading' !== $metadata['name'] ) {
        return $metadata;
    }

    if ( ! array_key_exists( 'isChapter', $metadata['attributes'] ) ) {
        $metadata['attributes']['isChapter'] = array(
            'type'    => 'boolean',
            'default' => false,
        );
    }

    return $metadata;
}

add_filter( 'block_type_metadata', 'heading_block_add_chapter_attributes', 100, 1 );

function heading_block_render( $block_content, $block ) {
    if ( 'core/heading' !== $block['blockName'] ) {
        return $block_content;
    }

    // If this is a chapter heading, add a data-attribute to the heading.
    if ( array_key_exists('isChapter', $block['attrs']) && true === $block['attrs']['isChapter'] ) {
        $block_content = preg_replace( '/<h([1-6])/', '<h$1 data-is-chapter="true"', $block_content );
    }

    return $block_content;
}

add_filter( 'render_block', 'heading_block_render', 10, 2 );