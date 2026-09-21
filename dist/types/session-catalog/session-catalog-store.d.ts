import type { DaemonClient, DaemonSessionLiveState, DaemonSessionListPage, DaemonSessionListPageOptions, DaemonSessionSummary } from '@qwen-code/sdk/daemon';
export type SessionCatalogRouteKind = 'legacy' | 'qualified';
export interface SessionCatalogQuery {
    routeKind: SessionCatalogRouteKind;
    workspaceCwd: string;
    options: DaemonSessionListPageOptions;
}
export interface SessionCatalogSnapshot {
    page?: DaemonSessionListPage;
    loading: boolean;
    stale: boolean;
    error?: Error;
    updatedAt?: number;
}
export interface SessionCatalogSubscriptionOptions {
    autoLoad?: boolean;
    maxAgeMs?: number;
    pollIntervalMs?: number;
}
interface StagedCatalogPage {
    key: string;
    revision: number;
    page: DaemonSessionListPage;
}
export interface StagedWorkspaceSessionCatalog {
    workspaceCwd: string;
    pages: StagedCatalogPage[];
    complete: boolean;
}
export declare const SESSION_CATALOG_ERROR_RETRY_MS = 30000;
export declare const SESSION_CATALOG_RETENTION_MS = 30000;
export declare const SESSION_CATALOG_TRAILING_REFRESH_MS = 2000;
export declare function getSessionCatalogQueryKey(query: SessionCatalogQuery): string;
export declare class SessionCatalogStore {
    private readonly client;
    private readonly entries;
    private readonly queue;
    private readonly trailingRefreshTimers;
    private readonly liveStateWorkspaceUsers;
    private readonly liveStateWorkspaceRefreshRequests;
    private readonly liveStateWakeHandlers;
    private liveStateActivitySequence;
    private readonly liveStatePendingActivity;
    private readonly liveSessionsByWorkspace;
    private readonly liveSessionListeners;
    private activeRequests;
    private activeBackgroundRequests;
    private queueSequence;
    private visibilityListening;
    constructor(client: DaemonClient);
    getSnapshot(query: SessionCatalogQuery): SessionCatalogSnapshot;
    getEmptySnapshot(): SessionCatalogSnapshot;
    retainWorkspaceLiveState(workspaceCwd: string): () => void;
    isWorkspaceLiveStateEnabled(workspaceCwd: string): boolean;
    consumeWorkspaceLiveStateRefreshRequest(workspaceCwd: string): 'interactive' | 'invalidated' | undefined;
    onLiveStateWake(handler: (workspaceCwd: string, bypassRetry?: boolean) => void): () => void;
    requestWorkspaceLiveStateRefresh(workspaceCwd: string): void;
    recordSessionActivity(workspaceCwd: string, sessionId: string): void;
    snapshotSessionActivity(workspaceCwd: string): ReadonlyMap<string, number> | undefined;
    resolveSessionActivity(workspaceCwd: string, sessionId: string, sequence: number): void;
    private requestLiveStateRefresh;
    subscribe(query: SessionCatalogQuery, listener: () => void, options?: SessionCatalogSubscriptionOptions): () => void;
    refresh(query: SessionCatalogQuery, options?: {
        interactive?: boolean;
    }): Promise<DaemonSessionListPage>;
    loadOnce(query: SessionCatalogQuery, options?: {
        fresh?: boolean;
    }): Promise<DaemonSessionListPage>;
    invalidateWorkspace(workspaceCwd: string, options?: {
        background?: boolean;
        interactive?: boolean;
    }): void;
    patchSession(workspaceCwd: string, sessionId: string, patch: Partial<Omit<DaemonSessionSummary, 'sessionId' | 'workspaceCwd'>>): void;
    /**
     * Apply a pin toggle optimistically to every loaded page of the workspace,
     * so the store owns the optimistic state's lifetime (the R5-1 fix
     * direction). Pinned-view pages gain or lose the row; every other page
     * patches it in place. Because the toggle lands in the page data itself,
     * later local writes (`patchSession`, `applyLiveState`) churn around it
     * without dropping it, and only an authoritative refetch replaces it.
     * Rolling back is the same operation with the opposite target.
     */
    applySessionPinToggle(workspaceCwd: string, session: DaemonSessionSummary, toggle: {
        pinned: boolean;
        pinnedAt?: string;
    }): void;
    getLiveSession(workspaceCwd: string, sessionId: string): DaemonSessionLiveState | undefined;
    hasLiveSessions(workspaceCwd: string): boolean;
    subscribeLiveSessions(workspaceCwd: string, listener: () => void): () => void;
    applyLiveState(workspaceCwd: string, liveSessions: readonly DaemonSessionLiveState[]): ReadonlySet<string>;
    private recordLiveSessions;
    private clearLiveSessions;
    stageWorkspaceRefresh(workspaceCwd: string): Promise<StagedWorkspaceSessionCatalog>;
    commitWorkspaceRefresh(staged: StagedWorkspaceSessionCatalog): boolean;
    scheduleWorkspaceRefresh(workspaceCwd: string, delayMs?: number): void;
    dispose(): void;
    private getOrCreateEntry;
    private requestFresh;
    private createWaiter;
    private requestBackground;
    private ensureScheduled;
    private sortQueue;
    private drainQueue;
    private startJob;
    private finishJob;
    private fetchStagedPage;
    private fetchPage;
    private resolveWaiters;
    private rejectWaiters;
    private setSnapshot;
    private resetPollSchedule;
    private schedulePollFromNow;
    private scheduleEntryTimer;
    private clearPollTimer;
    private removeQueuedJob;
    private scheduleCleanup;
    private isHidden;
    private updateVisibilityListener;
    private removeVisibilityListener;
    private readonly onVisibilityChange;
}
export declare function getSessionCatalogStore(client: DaemonClient): SessionCatalogStore;
export declare function loadSessionCatalogOnce(client: DaemonClient, query: SessionCatalogQuery, options?: {
    fresh?: boolean;
}): Promise<DaemonSessionListPage>;
export {};
