/**
 * WordPress Dependencies
 */
import { __ } from '@wordpress/i18n';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import {
    registerBlockVariation,
} from '@wordpress/blocks';
import {
    BlockControls
} from '@wordpress/block-editor';
import {
    ToolbarGroup,
    ToolbarButton,
} from '@wordpress/components';
import { addFilter } from '@wordpress/hooks';

// Add toolbar to core/heading block with toggle for isChapter attribute.
const HeadingBlockFilter = createHigherOrderComponent(
    (BlockEdit) =>
        function (props) {
            const { name, attributes, setAttributes } = props;
            if ('core/heading' !== name) {
                return <BlockEdit {...props} />;
            }
            const { isChapter, content } = attributes;
            return (
                <Fragment>
                    <BlockControls>
                        <ToolbarGroup>
                            <ToolbarButton
                                icon="book-alt"
                                label={isChapter ? 'Remove Chapter' : 'Make Chapter'}
                                isActive={isChapter}
                                onClick={() => {
                                    const attrs = {
                                        isChapter: !isChapter,
                                    };
                                    setAttributes({ ...attrs });
                                }}
                            />
                        </ToolbarGroup>
                    </BlockControls>
                    <BlockEdit {...props} />
                </Fragment>
            );
        },
    'withChapterControls',
);
addFilter('editor.BlockEdit', 'prc-block/heading', HeadingBlockFilter, 21);

/**
 * Modify default settings on core/heading block. Sometimes defining attributes via PHP is not enough.
 *
 * @param {*} settings
 * @param {*} name
 * @returns
 */
function modifyDefaultSettings(settings, name) {
    if ('core/heading' !== name) {
        return settings;
    }
    settings.attributes.isChapter = {
        type: 'boolean',
        default: false,
    };
    return settings;
}

addFilter(
    'blocks.registerBlockType',
    'prc-block-library/heading',
    modifyDefaultSettings,
);

registerBlockVariation('core/heading', {
    name: 'chapter',
    title: __('Chapter'),
    description: __('A chapter heading.'),
    icon: 'editor-ol',
    attributes: {
        isChapter: true,
        level: 3,
    },
});
