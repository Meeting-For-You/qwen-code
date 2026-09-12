import type { GoalSnapshotV2 } from '@qwen-code/sdk/daemon';
export interface GoalStatusStripProps {
    snapshot: GoalSnapshotV2;
    busy?: boolean;
    onEdit: () => void;
    onPause: () => void;
    onResume: () => void;
    onClear: () => void;
}
export declare function getGoalActiveTimeMs(snapshot: GoalSnapshotV2, now: number): number;
export declare function GoalStatusStrip({ snapshot, busy, onEdit, onPause, onResume, onClear, }: GoalStatusStripProps): import("react/jsx-runtime").JSX.Element | null;
