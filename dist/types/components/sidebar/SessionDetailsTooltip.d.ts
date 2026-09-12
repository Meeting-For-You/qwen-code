import { type ReactElement } from 'react';
import type { DaemonSessionSummary } from '@qwen-code/sdk/daemon';
interface SessionDetailsTooltipProps {
    session: DaemonSessionSummary;
    label: string;
    time: string;
    completedUnread: boolean;
    children: ReactElement;
}
export declare function SessionDetailsTooltip({ session, label, time, completedUnread, children, }: SessionDetailsTooltipProps): import("react/jsx-runtime").JSX.Element;
export {};
