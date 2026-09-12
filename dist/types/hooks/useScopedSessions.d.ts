import type { DaemonSessionArchiveState } from '@qwen-code/sdk/daemon';
import type { SessionCatalogQuery } from '../session-catalog/session-catalog-store';
interface ScopedSessionsOptions {
    autoLoad?: boolean;
    enabled?: boolean;
    maxAgeMs?: number;
    pageSize?: number;
    archiveState?: DaemonSessionArchiveState;
    view?: 'organized';
    group?: string;
    pollIntervalMs?: number;
}
export declare function useScopedSessions(workspaceCwd: string | undefined, options?: ScopedSessionsOptions): {
    data: import("@qwen-code/sdk/daemon").DaemonSessionSummary[] | undefined;
    sessions: import("@qwen-code/sdk/daemon").DaemonSessionSummary[];
    loading: boolean;
    error: Error | undefined;
    reload: (reloadOptions?: {
        interactive?: boolean;
    }) => Promise<import("@qwen-code/sdk/daemon").DaemonSessionSummary[] | undefined>;
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
} | {
    data: import("@qwen-code/sdk/daemon").DaemonSessionSummary[] | undefined;
    sessions: import("@qwen-code/sdk/daemon").DaemonSessionSummary[];
    loading: boolean;
    error: Error | undefined;
    reload: () => Promise<import("@qwen-code/sdk/daemon").DaemonSessionSummary[]>;
    deleteSession: (sessionId: string) => Promise<boolean>;
    deleteSessions: (sessionIds: string[]) => Promise<{
        removed: string[];
        notFound: string[];
        errors: Array<{
            sessionId: string;
            error: string;
        }>;
    }>;
    releaseSession: ((sessionId: string) => Promise<void | undefined>) | undefined;
};
export {};
