import type { DaemonClient, DaemonSessionArchiveState, DaemonSessionSummary } from '@qwen-code/sdk/daemon';
import { type SessionCatalogQuery, type SessionCatalogSnapshot } from './session-catalog-store';
interface SessionCatalogHookOptions {
    autoLoad?: boolean;
    enabled?: boolean;
    maxAgeMs?: number;
    pollIntervalMs?: number;
}
export interface WebShellSessionsOptions extends SessionCatalogHookOptions {
    pageSize?: number;
    cursor?: string;
    archiveState?: DaemonSessionArchiveState;
    view?: 'organized';
    group?: string;
    sourceType?: string;
    sourceId?: string;
    parentSessionId?: string;
}
export declare function useSessionCatalogQuery(client: DaemonClient, query: SessionCatalogQuery | undefined, options?: SessionCatalogHookOptions): {
    sessions: DaemonSessionSummary[];
    nextCursor: string | undefined;
    liveMergeFailed: boolean;
    truncated: boolean;
    reload: (options?: {
        interactive?: boolean;
    }) => Promise<undefined> | Promise<import("@qwen-code/sdk/daemon").DaemonSessionListPage>;
    page?: import("@qwen-code/sdk/daemon").DaemonSessionListPage;
    loading: boolean;
    stale: boolean;
    error?: Error;
    updatedAt?: number;
};
export declare function useSessionCatalogQueries(client: DaemonClient, queries: readonly SessionCatalogQuery[], options?: SessionCatalogHookOptions): readonly SessionCatalogSnapshot[];
export declare function useSessionHasActivePrompt(client: DaemonClient, workspaceCwd: string | undefined, sessionId: string | undefined): boolean;
export declare function useSessionCatalogPolling(client: DaemonClient, query: SessionCatalogQuery | undefined, pollIntervalMs: number | undefined): void;
export declare function useSessionCatalogController(client: DaemonClient): {
    refreshQueries(queries: readonly SessionCatalogQuery[]): void;
    invalidateWorkspace(workspaceCwd: string): void;
    refreshWorkspace(workspaceCwd: string): void;
    sessionCreated(workspaceCwd: string, _sessionId: string): void;
    promptAdmitted(workspaceCwd: string, sessionId: string): void;
    promptAdmissionUncertain(workspaceCwd: string): void;
    renamed(workspaceCwd: string, sessionId: string, displayName: string): void;
    toggleSessionPinned(workspaceCwd: string, session: DaemonSessionSummary, toggle: {
        pinned: boolean;
        pinnedAt?: string;
    }): void;
    turnCompleted(workspaceCwd: string, sessionId: string): void;
};
export declare function useWebShellSessions(options?: WebShellSessionsOptions): {
    data: DaemonSessionSummary[] | undefined;
    sessions: DaemonSessionSummary[];
    loading: boolean;
    error: Error | undefined;
    reload: (reloadOptions?: {
        interactive?: boolean;
    }) => Promise<DaemonSessionSummary[] | undefined>;
    nextCursor: string | undefined;
    liveMergeFailed: boolean;
    truncated: boolean;
    loadSession: ((sessionId: string, options?: {
        workspaceCwd?: string;
    }) => Promise<void>) | undefined;
    resumeSession: ((sessionId: string, options?: {
        workspaceCwd?: string;
    }) => Promise<void>) | undefined;
    newSession: (() => Promise<void>) | undefined;
    releaseSession: ((sessionId: string) => Promise<void>) | undefined;
    releaseSessionAction: ((sessionId: string) => Promise<void>) | undefined;
    deleteSession: (sessionId: string) => Promise<boolean>;
    deleteSessions: (sessionIds: string[]) => Promise<{
        removed: string[];
        notFound: string[];
        errors: Array<{
            sessionId: string;
            error: string;
        }>;
    }>;
    exportSession: (sessionId: string, format?: import("@qwen-code/sdk/daemon").DaemonSessionExportFormat) => Promise<import("@qwen-code/sdk/daemon").DaemonSessionExportResult>;
    archiveSession: (sessionId: string) => Promise<boolean>;
    unarchiveSession: (sessionId: string) => Promise<boolean>;
    catalogQuery: SessionCatalogQuery | undefined;
};
export {};
