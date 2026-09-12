/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
/** A voice-transcription model option for the `/model --voice` picker. */
export interface VoiceModelOption {
    /** Raw model id (no auth suffix) — what gets persisted as `voiceModel`. */
    id: string;
    label?: string;
    authType?: string;
    baseUrl?: string;
    contextWindow?: number;
    modalities?: {
        audio?: boolean;
    };
}
/**
 * Mirror of the CLI's `resolveVoiceTransport` id patterns (voice-model.ts): true
 * for ids the daemon has an ASR transport for. Kept in sync by hand because the
 * Web Shell can't import the CLI's voice modules.
 */
export declare function isVoiceModelId(id: string): boolean;
interface ProvidersStatusLike {
    providers?: Array<{
        authType?: string;
        models?: Array<{
            baseModelId?: string;
            modelId?: string;
            name?: string;
            baseUrl?: string;
            contextLimit?: number;
            isRuntime?: boolean;
        }>;
    }>;
}
/**
 * Extract selectable voice models from a `/workspace/providers` status. Voice
 * models are hidden from the session's main model list (`voiceOnly`), so the
 * picker sources them from the providers surface instead.
 */
export declare function extractVoiceModels(status: ProvidersStatusLike | undefined): VoiceModelOption[];
export {};
