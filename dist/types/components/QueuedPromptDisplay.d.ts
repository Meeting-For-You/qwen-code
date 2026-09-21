/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
import type { PromptFile, PromptImage } from '../adapters/promptTypes';
import type { AttachmentPreviewRequest } from '../adapters/messageTypes';
import type { DaemonInputAnnotation } from '@qwen-code/sdk/daemon';
import type { getTranslator } from '../i18n';
export interface QueuedPrompt {
    id: number;
    sessionId?: string;
    text: string;
    images?: PromptImage[];
    files?: PromptFile[];
    inputAnnotations?: DaemonInputAnnotation[];
    onComplete?: () => void;
    onAdmitted?: () => void;
    serverPromptId?: string;
    serverState?: 'submitting' | 'queued' | 'running';
    midTurnState?: 'submitting' | 'queued';
    midTurnMessageId?: string;
    midTurnFailedAction?: 'delete' | 'edit';
    isInserting?: boolean;
    isEditing?: boolean;
    isRemoving?: boolean;
    payloadCompleteness?: 'complete' | 'summary-only';
}
export declare function QueuedPromptDisplay({ prompts, t, canMutateMidTurn, canInsertMidTurn, onDelete, onInsert, onEdit, onImagePreview, onAttachmentPreview, }: {
    prompts: readonly QueuedPrompt[];
    t: ReturnType<typeof getTranslator>;
    canMutateMidTurn?: boolean;
    canInsertMidTurn?: boolean;
    onDelete: (id: number) => void;
    onInsert: (id: number) => void;
    onEdit: (id: number) => void;
    onImagePreview?: (src: string, alt?: string) => void;
    onAttachmentPreview?: (file: AttachmentPreviewRequest) => void;
}): import("react/jsx-runtime").JSX.Element | null;
