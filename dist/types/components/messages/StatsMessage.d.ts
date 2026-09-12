import type { DaemonSessionStatsStatus } from '@qwen-code/webui/daemon-react-sdk';
export type StatsView = 'overview' | 'model' | 'tools';
interface ParsedStats {
    view: StatsView;
    status: DaemonSessionStatsStatus;
}
export declare function serializeStatsMessage(status: DaemonSessionStatsStatus, view?: StatsView): string;
export declare function parseStatsMessage(content: string): ParsedStats | null;
export declare function formatDuration(ms: number): string;
export declare function StatsMessage({ view, status, }: {
    view: StatsView;
    status: DaemonSessionStatsStatus;
}): import("react/jsx-runtime").JSX.Element;
export {};
