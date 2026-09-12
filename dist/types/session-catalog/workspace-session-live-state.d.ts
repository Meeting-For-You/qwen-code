import type { DaemonClient, DaemonSessionGroupCatalog } from '@qwen-code/sdk/daemon';
export declare const SESSION_LIVE_STATE_POLL_MS = 2000;
export declare const SESSION_LIVE_STATE_ERROR_RETRY_MS = 30000;
export declare const SESSION_LIVE_STATE_RECONCILE_COOLDOWN_MS = 10000;
interface WorkspaceSessionLiveStateOptions {
    enabled: boolean;
    workspaceCwds: readonly string[];
    groupWorkspaceCwds: readonly string[];
}
export declare function useWorkspaceSessionLiveState(client: DaemonClient, { enabled, workspaceCwds, groupWorkspaceCwds, }: WorkspaceSessionLiveStateOptions): ReadonlyMap<string, DaemonSessionGroupCatalog>;
export {};
