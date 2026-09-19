import type { RefObject, ReactNode } from 'react';
import type { StateEffect } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';
import type { WebShellAtProvider, WebShellAtProviderTab, WebShellBuiltinAtProvidersConfig, WebShellComposerTag } from '../customization';
import type { AtMentionItem, AtMentionWorkspaceActions } from './useAtMentionSources';
export { FILE_PROVIDER_ID, MCP_RESOURCES_PROVIDER_ID, fileReferenceInsertText, sanitizeDisplayText, } from './useAtMentionSources';
export type { AtMentionItem, AtMentionWorkspaceActions, } from './useAtMentionSources';
export interface AtMentionProviderView {
    id: string;
    provider: WebShellAtProvider;
    label: ReactNode;
    textValue: string;
    description?: string;
    tabs?: readonly WebShellAtProviderTab[];
    selectedTabId?: string;
    renderItem?: WebShellAtProvider['renderItem'];
}
export interface AtMentionMenuState {
    from: number;
    to: number;
    query: string;
    level: 'categories' | 'items';
    selectedProviderId?: string;
    selectedIndex: number;
    providers: AtMentionProviderView[];
    items: AtMentionItem[];
    loading: boolean;
    itemMode?: 'default' | 'mcpServers' | 'mcpResources';
    mcpServerName?: string;
    fileDirectory?: string;
    inputMode?: 'search' | 'context';
    validateMcpServer?: boolean;
    tabs?: readonly WebShellAtProviderTab[];
    selectedTabId?: string;
}
export interface UseAtMentionMenuOptions {
    viewRef: RefObject<EditorView | null>;
    disabledRef: RefObject<boolean>;
    shellModeRef: RefObject<boolean>;
    workspaceActionsRef: RefObject<AtMentionWorkspaceActions | undefined>;
    workspaceKey?: string;
    builtinProviders?: WebShellBuiltinAtProvidersConfig;
    providers?: readonly WebShellAtProvider[];
    createInlineTagEffect?: (range: {
        from: number;
        to: number;
        tag: WebShellComposerTag;
    }) => StateEffect<unknown>;
    /**
     * Invoked when the user selects the synthetic "Upload file" item in the
     * file provider. Receives the directory currently being browsed and a
     * callback that re-inserts the mention query removed before the picker
     * opened — call it when the picker closes without an upload so the typed
     * text is not lost. When absent (upload unsupported), the item is hidden.
     */
    onUploadRequest?: (targetDir: string, restoreQuery?: () => void) => void;
}
export declare function useAtMentionMenu({ viewRef, disabledRef, shellModeRef, workspaceActionsRef, workspaceKey, builtinProviders, providers, createInlineTagEffect, onUploadRequest, }: UseAtMentionMenuOptions): {
    state: AtMentionMenuState | null;
    close: (options?: {
        preserveProviderSelection?: boolean;
    }) => void;
    closeIfOpen: () => false | "categories" | "closed";
    refreshForView: (view: EditorView | null) => boolean;
    moveSelection: (direction: "up" | "down") => boolean;
    select: (index: number) => boolean;
    accept: (index?: number) => boolean;
    enterCategory: (index?: number) => boolean;
    selectTab: (tabId: string) => boolean;
    backToCategories: () => false | "items" | "categories";
    updateSearch: (query: string) => boolean;
};
