import type { DaemonRewindSnapshotInfo, DaemonTranscriptBlock } from '@qwen-code/sdk/daemon';
interface RewindDialogProps {
    blocks: readonly DaemonTranscriptBlock[];
    loadSnapshots: () => Promise<{
        snapshots: DaemonRewindSnapshotInfo[];
    }>;
    rewind: (promptId: string) => Promise<void>;
    onError: (error: unknown) => void;
    onClose: () => void;
}
export declare function RewindDialog({ blocks, loadSnapshots, rewind, onError, onClose, }: RewindDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
