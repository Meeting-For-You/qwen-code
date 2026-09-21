interface SystemMessageProps {
    content: string;
    variant: 'info' | 'error' | 'warning';
    source?: string;
    data?: unknown;
    images?: Array<{
        data: string;
        mimeType: string;
    }>;
    files?: Array<{
        name: string;
        mimeType: string;
        attachmentId?: string;
    }>;
    /** Run /context detail, exactly like typing it (context-usage panels). */
    onShowContextDetail?: () => void;
    /** Click an image to preview it in the right panel. */
    onImagePreview?: (src: string, alt?: string) => void;
    onAttachmentPreview?: (file: {
        name: string;
        mimeType?: string;
        attachmentId?: string;
    }) => void;
    showRetryHint?: boolean;
    onRetryClick?: () => void;
}
export declare const SystemMessage: import("react").NamedExoticComponent<SystemMessageProps>;
export {};
