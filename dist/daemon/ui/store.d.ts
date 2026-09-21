/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DaemonTranscriptReducerOptions, DaemonTranscriptState, DaemonTranscriptStore } from './types.js';
export declare function createDaemonTranscriptStore(seed?: Partial<DaemonTranscriptState> & Pick<DaemonTranscriptReducerOptions, 'onTruncation'>): DaemonTranscriptStore;
