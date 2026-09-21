import type { DaemonInputAnnotation } from '@qwen-code/sdk/daemon';
import type { ComposerTagClickHandler, ComposerTagRenderer, WebShellComposerTag, WebShellComposerTagIconMap } from '../../customization';
import type { AttachmentPreviewRequest } from '../../adapters/messageTypes';
interface UserMessageImage {
    data: string;
    mimeType: string;
}
interface UserMessageFile {
    name: string;
    mimeType: string;
    data?: Blob;
    text?: string;
    attachmentId?: string;
}
interface UserMessageProps {
    content: string;
    images?: UserMessageImage[];
    files?: UserMessageFile[];
    inputAnnotations?: readonly DaemonInputAnnotation[];
    isLocateFlashing?: boolean;
    sendFailed?: boolean;
    onRetrySend?: () => void;
    /** Click an uploaded image to preview it in the right panel. */
    onImagePreview?: (src: string, alt?: string) => void;
    onAttachmentPreview?: (file: AttachmentPreviewRequest) => void;
}
export declare const UserMessage: import("react").NamedExoticComponent<UserMessageProps>;
export declare function ReadonlyComposerTag({ tag, composerTagIcons, renderComposerTag, renderComposerTagTooltip, onComposerTagClick, title, preserveCustomKindLabel, }: {
    tag: WebShellComposerTag;
    composerTagIcons: WebShellComposerTagIconMap | undefined;
    renderComposerTag: ComposerTagRenderer | undefined;
    renderComposerTagTooltip: ComposerTagRenderer | undefined;
    onComposerTagClick: ComposerTagClickHandler | undefined;
    title?: string;
    preserveCustomKindLabel?: boolean;
}): import("react/jsx-runtime").JSX.Element;
export {};
