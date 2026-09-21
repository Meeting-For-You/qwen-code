import type { DaemonTranscriptBlock, DaemonTranscriptBlockChangeSummary } from '@qwen-code/sdk/daemon';
interface AnimationFrameTranscriptSnapshot {
    blocks: readonly DaemonTranscriptBlock[];
    blockChangeSummary?: DaemonTranscriptBlockChangeSummary;
}
interface AnimationFrameTranscriptSnapshotOptions {
    structuralOnly?: boolean;
}
export declare function useAnimationFrameTranscriptSnapshot(options?: AnimationFrameTranscriptSnapshotOptions): AnimationFrameTranscriptSnapshot;
export {};
