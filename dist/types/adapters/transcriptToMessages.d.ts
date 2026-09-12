/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DaemonTranscriptBlock } from '@qwen-code/sdk/daemon';
import type { DaemonMessage } from './messageTypes.js';
interface TranscriptMessageLabels {
    promptCancelled?: string;
    branchSuccess?: (name: string) => string;
    modelStreamInterrupted?: string;
    loopDetected?: string;
}
interface TranscriptMessageOptions {
    labels?: TranscriptMessageLabels;
}
export declare function isRetryableTurnErrorKind(errorKind: string | undefined): boolean;
export declare function transcriptBlocksToDaemonMessages(blocks: readonly DaemonTranscriptBlock[], options?: TranscriptMessageOptions): DaemonMessage[];
export {};
