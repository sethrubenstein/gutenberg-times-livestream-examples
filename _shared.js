/**
 * WordPress Dependencies
 */
import { has } from 'underscore';
import { __ } from '@wordpress/i18n';
import { Button, DropZone } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { uploadMedia } from '@wordpress/media-utils';

const DEFAULT_IMAGE_SIZE = 'full';

function MediaDropZone({
    attachmentId = false,
    onUpdate = (attachment) => {
        console.warn(
            'Media DropZone Attachment, use onUpdate prop when using <MediaDropZone/>: ',
            attachment,
        );
    },
    onClear = false,
    mediaType = ['image'],
    mediaSize = DEFAULT_IMAGE_SIZE,
    label = __('Set Image'),
}) {
    const [id, setId] = useState(attachmentId);
    const [isUploading, setIsUploading] = useState(false);

    /**
     * When id (attachmentId) changes update the media and get its src, dimensions, and type.
     */
    const { media, src, width, height, type } = useSelect(
        (select) => {
            const m = id ? select('core').getMedia(id) : false;
            if (undefined === m || false === m) {
                return {
                    media: false,
                    src: false,
                    width: false,
                    height: false,
                    type: false,
                };
            }

            let mediaSourceUrl = false;
            let mediaWidth = false;
            let mediaHeight = false;

            if (has(m, ['media_details', 'sizes', mediaSize])) {
                // use mediaSize when available
                mediaWidth = m.media_details.sizes[mediaSize].width;
                mediaHeight = m.media_details.sizes[mediaSize].height;
                mediaSourceUrl = m.media_details.sizes[mediaSize].source_url;
            } else {
                // get fallbackMediaSize if mediaSize is not available
                const fallbackMediaSize = DEFAULT_IMAGE_SIZE;
                if (has(m, ['media_details', 'sizes', fallbackMediaSize])) {
                    // use fallbackMediaSize when mediaSize is not available
                    mediaWidth = m.media_details.sizes[fallbackMediaSize].width;
                    mediaHeight = m.media_details.sizes[fallbackMediaSize].height;
                    mediaSourceUrl = m.media_details.sizes[fallbackMediaSize].source_url;
                } else {
                    // use full image size when mediaFallbackSize and mediaSize are not available
                    mediaWidth = m.media_details.width;
                    mediaHeight = m.media_details.height;
                    mediaSourceUrl = m.source_url;
                }
            }

            return {
                media: m,
                src: mediaSourceUrl,
                width: mediaWidth,
                height: mediaHeight,
                type: false !== m ? m.type : false,
            };
        },
        [id],
    );

    const onMediaUpdate = (media) => {
        if (media.id !== id) {
            setId(media.id);
            onUpdate(media);
        }
        setIsUploading(false);
    };

    const onDropImage = (filesList) => {
        uploadMedia({
            allowedTypes: mediaType,
            filesList,
            onFileChange([image]) {
                if (!image.id) {
                    setIsUploading(true);
                } else {
                    image.sizes = image.media_details.sizes;
                    onMediaUpdate(image);
                }
            },
            onError(message) {
                console.error(message);
            },
        });
    };

    const displayImage =
        false !== id && false !== media && false !== src && false === isUploading;

    return (
        <MediaUploadCheck fallback={__(`Fallback Instructions Should Go Here`)}>
            <MediaUpload
                title={__(`Media Upload`)}
                onSelect={onMediaUpdate}
                allowedTypes={mediaType}
                value={id}
                render={({ open }) => (
                    <div>
                        {displayImage && (
                            <button
                                type="button"
                                onClick={open}
                                style={{
                                    cursor: 'pointer',
                                    background: 'none',
                                    border: 'none',
                                }}
                            >
                                <img
                                    alt="Drop an image here, or click to replace."
                                    src={src}
                                    width={`${width}px`}
                                    height={`${height}px`}
                                />
                            </button>
                        )}
                        {false !== onClear && displayImage && (
                            <Button
                                variant="link"
                                isSmall
                                onClick={() => {
                                    onClear();
                                    setId(false);
                                }}
                            >
                                Clear Image
                            </Button>
                        )}
                        {((false !== id && false === media) || isUploading) && (
                            <Button variant="secondary" isBusy onClick={open}>
                                {__(` Loading...`)}
                            </Button>
                        )}
                        {false === id && (
                            <Button variant="secondary" onClick={open}>
                                {label}
                            </Button>
                        )}
                        <DropZone onFilesDrop={onDropImage} />
                    </div>
                )}
            />
        </MediaUploadCheck>
    );
}

export { 
    MediaDropZone,
}
