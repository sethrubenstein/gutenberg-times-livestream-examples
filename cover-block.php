<?php

add_action( 'enqueue_block_editor_assets', function(){
    // Enqueue your script.
} );

function cover_block_render( $block_content, $block ) {
    if ( 'core/cover' !== $block['blockName'] || is_admin() ) {
        return $block_content;
    }

    if ( function_exists('jetpack_is_mobile') ) {
        $mobile_image_id = array_key_exists('mobileId', $block['attrs']) ? $block['attrs']['mobileId'] : false;
        $mobile_image = $mobile_image_id ? wp_get_attachment_image_src( $mobile_image_id, 'full' ) : false;
        $mobile_image = $mobile_image ? $mobile_image[0] : false;

        // Replace the image with the mobile image if we're on a mobile device.
        $image_attrs = null;
        if ( jetpack_is_mobile() && preg_match( '/<img(.*?)>/', $block_content, $matches ) && false !== $mobile_image ) {
            $image_attrs = $matches[1];
            $image_attrs = preg_replace( '/src=".*?"/', 'src="' . $mobile_image . '"', $image_attrs );
            $block_content = preg_replace( '/<img(.*?)>/', '<img' . $image_attrs . '>', $block_content );
        }
    }

    return $block_content;
}
add_filter( 'render_block', array( $this, 'cover_block_render' ), 10, 2 );

/**
 * Register additional attributes for group block.
 * @param mixed $metadata
 * @return mixed
 */
function cover_block_add_attributes( $metadata ) {
    if ( 'core/cover' !== $metadata['name'] ) {
        return $metadata;
    }

    if ( ! array_key_exists( 'mobileId', $metadata['attributes'] ) ) {
        $metadata['attributes']['mobileId'] = array(
            'type'    => 'number',
        );
    }

    return $metadata;
}
add_filter( 'block_type_metadata', array( $this, 'add_attributes' ), 100, 1 );