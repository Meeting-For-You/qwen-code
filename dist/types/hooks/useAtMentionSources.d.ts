import type { WebShellAtItem, WebShellAtProvider, WebShellBuiltinAtProviderId, WebShellComposerTag } from '../customization';
type GlobWorkspaceFn = (pattern: string, opts?: {
    maxResults?: number;
    signal?: AbortSignal;
}) => Promise<{
    matches: string[];
}>;
interface ExtensionEntry {
    name: string;
    displayName?: string;
    description?: string;
    isActive: boolean;
}
type LoadExtensionsStatusFn = () => Promise<{
    extensions: ExtensionEntry[];
}>;
interface DirectoryEntry {
    name: string;
    kind: 'file' | 'directory' | 'symlink' | 'other';
    ignored: boolean;
}
type ListDirectoryFn = (dirPath: string, options?: {
    signal?: AbortSignal;
}) => Promise<{
    kind: 'list';
    path: string;
    entries: DirectoryEntry[];
    truncated: boolean;
}>;
interface McpServerEntry {
    kind: 'mcp_server';
    name: string;
    disabled: boolean;
    mcpStatus?: string;
    resourceCount?: number;
    description?: string;
}
type LoadMcpStatusFn = () => Promise<{
    servers: McpServerEntry[];
}>;
type LoadMcpResourcesFn = (serverName: string, options?: {
    signal?: AbortSignal;
}) => Promise<{
    resources: Array<{
        uri: string;
        name?: string;
        title?: string;
        description?: string;
        mimeType?: string;
        size?: number;
    }>;
}>;
type DirectoryListing = Awaited<ReturnType<ListDirectoryFn>>;
type GlobWorkspaceResult = Awaited<ReturnType<GlobWorkspaceFn>>;
type ExtensionsStatus = Awaited<ReturnType<LoadExtensionsStatusFn>>;
export type McpStatus = Awaited<ReturnType<LoadMcpStatusFn>>;
type McpResources = Awaited<ReturnType<LoadMcpResourcesFn>>;
export interface BuiltinProviderCache {
    directories: Map<string, Promise<DirectoryListing>>;
    globResults: Map<string, Promise<GlobWorkspaceResult>>;
    extensionsStatus?: Promise<ExtensionsStatus>;
    mcpStatus?: Promise<McpStatus>;
    mcpResources: Map<string, Promise<McpResources>>;
}
export declare function createBuiltinProviderCache(): BuiltinProviderCache;
export declare function getCached<K, V>(cache: Map<K, Promise<V>>, key: K, load: () => Promise<V>): Promise<V>;
export interface AtMentionWorkspaceActions {
    globWorkspace?: GlobWorkspaceFn;
    loadExtensionsStatus?: LoadExtensionsStatusFn;
    listDirectory?: ListDirectoryFn;
    loadMcpStatus?: LoadMcpStatusFn;
    loadMcpResources?: LoadMcpResourcesFn;
}
export interface AtMentionItem extends WebShellAtItem {
    kind?: 'insert' | 'directory' | 'mcp-server' | 'upload';
    fileKind?: DirectoryEntry['kind'];
    targetPath?: string;
    serverName?: string;
}
export declare const ITEM_LIMIT = 50;
export declare const FILE_ROOT_ITEM_LIMIT: number;
export declare const FILE_PROVIDER_ID = "files";
export declare const EXTENSIONS_PROVIDER_ID = "extensions";
export declare const MCP_RESOURCES_PROVIDER_ID = "mcp-resources";
export declare const BUILTIN_PROVIDER_IDS: readonly WebShellBuiltinAtProviderId[];
export declare const SAFE_DISPLAY_FALLBACK = "[invalid]";
export declare function normalizeDirectoryPath(path: string): string;
export declare function escapeGlobQuery(query: string): string;
export declare function fileSearchGlobPattern(query: string): string;
export declare function matchesQuery(query: string, ...values: Array<string | undefined>): boolean;
export declare function escapeAtReferenceText(ref: string): string;
export declare function unescapeAtReferenceText(ref: string): string;
export declare function splitFileQuery(query: string, fallbackDir: string): {
    dirPath: string;
    entryQuery: string;
};
export declare function sanitizeDisplayText(raw: string): string | undefined;
export declare function sanitizeInsertText(raw: string): string;
/**
 * Build the composer insert text for a workspace file reference, e.g.
 * `@path/to/file `. Shared by the @ file provider and the file-upload flow so
 * both escape identically (filenames with spaces / non-ASCII / `%` are common).
 */
export declare function fileReferenceInsertText(filePath: string): string;
export declare function safeDisplayText(raw: string | undefined): string;
export declare function sanitizeAtMentionItem(item: AtMentionItem, options?: {
    customProvider?: boolean;
}): AtMentionItem;
export declare function createComposerTagForItem(providerId: string | undefined, item: AtMentionItem, insert: string): WebShellComposerTag | null;
export declare function createFileProvider(getActions: () => AtMentionWorkspaceActions | undefined, getCurrentDir: () => string, getCache: () => BuiltinProviderCache, label: string, description: string, getUploadItem: () => AtMentionItem | null, browseDirectories?: boolean): WebShellAtProvider;
export declare function createExtensionProvider(getActions: () => AtMentionWorkspaceActions | undefined, getCache: () => BuiltinProviderCache, label: string, description: string): WebShellAtProvider;
export declare function createMcpResourcesProvider(getActions: () => AtMentionWorkspaceActions | undefined, getCache: () => BuiltinProviderCache, label: string, description: string, formatResourceCount: (count: number) => string): WebShellAtProvider;
export {};
