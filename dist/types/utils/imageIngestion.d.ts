import type { PromptFile, PromptImage } from '../adapters/promptTypes';
export type ImageIngestionRejectionReason = 'unavailable' | 'too-large' | 'read-failed';
export interface ImageIngestionRejection {
    name?: string;
    reason: ImageIngestionRejectionReason;
}
export interface ImageFileCandidate {
    file: File;
    mediaType: string;
}
export interface AttachmentFileCandidate {
    file: File;
    mediaType: string;
}
export interface ExtractedFileTransfer {
    claimed: boolean;
    imageCandidates: ImageFileCandidate[];
    fileCandidates: AttachmentFileCandidate[];
    rejected: ImageIngestionRejection[];
}
export interface ImageIngestionBatchResult {
    accepted: PromptImage[];
    rejected: ImageIngestionRejection[];
}
export interface FileIngestionBatchResult {
    accepted: PromptFile[];
    rejected: ImageIngestionRejection[];
}
interface ReaderLifecycle {
    onReaderCreated?: (reader: FileReader) => void;
    onReaderSettled?: (reader: FileReader) => void;
    maxBytes?: number;
}
export declare const MAX_IMAGE_ATTACHMENT_DATA_BYTES: number;
export declare const MAX_FILE_ATTACHMENT_DATA_BYTES: number;
export declare function normalizeImageMediaType(mediaType: string, fileName?: string): string | undefined;
export declare function normalizeTextMediaType(mediaType: string, fileName?: string): string | undefined;
export declare function sanitizeAttachmentName(name: string): string;
export declare function dedupeAttachmentName(name: string, taken: ReadonlySet<string>): string;
export declare function hasFileTransferPayload(dataTransfer: DataTransfer): boolean;
export declare function extractFiles(files: readonly File[]): ExtractedFileTransfer;
export declare function extractFileTransfer(dataTransfer: DataTransfer, source: 'paste' | 'drop'): ExtractedFileTransfer;
export declare function readImageTransfer(imageCandidates: readonly ImageFileCandidate[], lifecycle?: ReaderLifecycle): Promise<ImageIngestionBatchResult>;
export declare function readFileTransfer(fileCandidates: readonly AttachmentFileCandidate[], options?: {
    maxBytes?: number;
}): Promise<FileIngestionBatchResult>;
export {};
