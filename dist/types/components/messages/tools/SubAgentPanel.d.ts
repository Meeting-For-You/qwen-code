import type { ACPToolCall } from '../../../adapters/types';
interface SubAgentPanelProps {
    tool: ACPToolCall;
    defaultExpanded?: boolean;
    hideHeader?: boolean;
    inline?: boolean;
}
export declare function SubAgentPanel({ tool, defaultExpanded, hideHeader, inline, }: SubAgentPanelProps): import("react/jsx-runtime").JSX.Element;
export {};
