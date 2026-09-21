export type GoalStatusKind = 'set' | 'achieved' | 'cleared' | 'failed' | 'aborted' | 'paused' | 'checking';
export interface SerializedGoalStatusMessage {
    kind: GoalStatusKind;
    condition: string;
    iterations?: number;
    durationMs?: number;
    setAt?: number;
    lastReason?: string;
}
declare const serializeGoalStatusMessage: (data: SerializedGoalStatusMessage) => string;
declare function parseGoalStatusMessage(content: unknown): SerializedGoalStatusMessage | null;
export { serializeGoalStatusMessage, parseGoalStatusMessage };
export declare function GoalStatusMessage({ status, }: {
    status: SerializedGoalStatusMessage;
}): import("react/jsx-runtime").JSX.Element;
