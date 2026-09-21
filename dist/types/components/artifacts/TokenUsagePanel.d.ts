import type { DaemonSessionActions } from '@qwen-code/webui/daemon-react-sdk';
interface TokenUsagePanelProps {
    sessionActions?: DaemonSessionActions;
    sessionId?: string;
}
export declare function TokenUsagePanel({ sessionActions, sessionId, }: TokenUsagePanelProps): import("react/jsx-runtime").JSX.Element;
export {};
