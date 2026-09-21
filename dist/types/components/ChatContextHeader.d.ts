import type { ReactNode } from 'react';
interface ChatContextHeaderProps {
    content: ReactNode;
    environmentOpen: boolean;
    environmentAvailable: boolean;
    rightPanelOpen: boolean;
    rightPanelAvailable: boolean;
    onToggleEnvironment: () => void;
    onToggleRightPanel: () => void;
    /** Opens the session token-usage panel; hidden when omitted. */
    onOpenTokenUsage?: () => void;
}
export declare function ChatContextHeader({ content, environmentOpen, environmentAvailable, rightPanelOpen, rightPanelAvailable, onToggleEnvironment, onToggleRightPanel, onOpenTokenUsage, }: ChatContextHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
