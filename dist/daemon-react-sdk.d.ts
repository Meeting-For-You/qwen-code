import { CreateSessionRequest } from '@qwen-code/sdk/daemon';
import { DAEMON_APPROVAL_MODES } from '@qwen-code/sdk/daemon';
import { DaemonAgentMutationResult } from '@qwen-code/sdk/daemon';
import { DaemonApprovalMode } from '@qwen-code/sdk/daemon';
import { DaemonApprovalModeResult } from '@qwen-code/sdk/daemon';
import { DaemonAuthProviderBaseUrlOption } from '@qwen-code/sdk/daemon';
import { DaemonAuthProviderCatalog } from '@qwen-code/sdk/daemon';
import { DaemonAuthProviderDescriptor } from '@qwen-code/sdk/daemon';
import { DaemonAuthProviderId } from '@qwen-code/sdk/daemon';
import { DaemonAuthProviderInstallRequest } from '@qwen-code/sdk/daemon';
import { DaemonAuthProviderInstallResult } from '@qwen-code/sdk/daemon';
import { DaemonAuthProviderModel } from '@qwen-code/sdk/daemon';
import { DaemonAuthProviderStatus } from '@qwen-code/sdk/daemon';
import { DaemonAuthStatusSnapshot } from '@qwen-code/sdk/daemon';
import { DaemonAvailableCommand } from '@qwen-code/sdk/daemon';
import { DaemonCapabilities } from '@qwen-code/sdk/daemon';
import { DaemonChannelConfigEnumFieldDescriptor } from '@qwen-code/sdk/daemon';
import { DaemonChannelConfigFieldDescriptor } from '@qwen-code/sdk/daemon';
import { DaemonChannelConfigFieldKind } from '@qwen-code/sdk/daemon';
import { DaemonChannelConfigNestedFieldDescriptor } from '@qwen-code/sdk/daemon';
import { DaemonChannelConfigNumberFieldDescriptor } from '@qwen-code/sdk/daemon';
import { DaemonChannelConfigObjectFieldDescriptor } from '@qwen-code/sdk/daemon';
import { DaemonChannelConfigPlainValueFieldDescriptor } from '@qwen-code/sdk/daemon';
import { DaemonChannelConfigValueFieldDescriptor } from '@qwen-code/sdk/daemon';
import { DaemonChannelInstanceSnapshot } from '@qwen-code/sdk/daemon';
import { DaemonChannelMutationResult } from '@qwen-code/sdk/daemon';
import { DaemonChannelPairingApprovalRequest } from '@qwen-code/sdk/daemon';
import { DaemonChannelPairingApprovalResult } from '@qwen-code/sdk/daemon';
import { DaemonChannelPairingApprovalsSnapshot } from '@qwen-code/sdk/daemon';
import { DaemonChannelPairingRequest } from '@qwen-code/sdk/daemon';
import { DaemonChannelPairingRequestsSnapshot } from '@qwen-code/sdk/daemon';
import { DaemonChannelPairingRevocationRequest } from '@qwen-code/sdk/daemon';
import { DaemonChannelPairingRevocationResult } from '@qwen-code/sdk/daemon';
import { DaemonChannelPairingSubject } from '@qwen-code/sdk/daemon';
import { DaemonChannelRuntimeState } from '@qwen-code/sdk/daemon';
import { DaemonChannelSecretState } from '@qwen-code/sdk/daemon';
import { DaemonChannelSecretUpdate } from '@qwen-code/sdk/daemon';
import { DaemonChannelsSnapshot } from '@qwen-code/sdk/daemon';
import { DaemonChannelStartupRequest } from '@qwen-code/sdk/daemon';
import { DaemonChannelTypeCatalog } from '@qwen-code/sdk/daemon';
import { DaemonChannelTypeDescriptor } from '@qwen-code/sdk/daemon';
import { DaemonChannelUpsertRequest } from '@qwen-code/sdk/daemon';
import { DaemonClient } from '@qwen-code/sdk/daemon';
import { DaemonContextCategoryBreakdown } from '@qwen-code/sdk/daemon';
import { DaemonContextFileScope } from '@qwen-code/sdk/daemon';
import { DaemonContextMemoryDetail } from '@qwen-code/sdk/daemon';
import { DaemonContextSkillDetail } from '@qwen-code/sdk/daemon';
import { DaemonContextToolDetail } from '@qwen-code/sdk/daemon';
import { DaemonCreateAgentRequest } from '@qwen-code/sdk/daemon';
import { DaemonDeviceFlowStartResult } from '@qwen-code/sdk/daemon';
import { DaemonDeviceFlowState } from '@qwen-code/sdk/daemon';
import { DaemonForkSessionResult } from '@qwen-code/sdk/daemon';
import { DaemonGeneratedAgentContent } from '@qwen-code/sdk/daemon';
import { DaemonInitWorkspaceResult } from '@qwen-code/sdk/daemon';
import { DaemonInputAnnotation } from '@qwen-code/sdk/daemon';
import { DaemonMcpManageAction } from '@qwen-code/sdk/daemon';
import { DaemonMcpManageResult } from '@qwen-code/sdk/daemon';
import { DaemonMcpRestartResult } from '@qwen-code/sdk/daemon';
import { DaemonMetricsSeriesBucket } from '@qwen-code/sdk/daemon';
import { DaemonMidTurnMessageInjectedData } from '@qwen-code/sdk/daemon';
import { DaemonMidTurnMessageResult } from '@qwen-code/sdk/daemon';
import { DaemonMidTurnMessagesResult } from '@qwen-code/sdk/daemon';
import { DaemonModelDeleteRequest } from '@qwen-code/sdk/daemon';
import { DaemonModelDeleteResult } from '@qwen-code/sdk/daemon';
import { DaemonPendingPromptAddedEvent } from '@qwen-code/sdk/daemon';
import { DaemonPendingPromptCompletedEvent } from '@qwen-code/sdk/daemon';
import { DaemonPendingPromptsResult } from '@qwen-code/sdk/daemon';
import { DaemonPendingPromptStartedEvent } from '@qwen-code/sdk/daemon';
import { DaemonPermissionTranscriptBlock } from '@qwen-code/sdk/daemon';
import { DaemonRemoveMidTurnMessageResult } from '@qwen-code/sdk/daemon';
import { DaemonRemovePendingPromptResult } from '@qwen-code/sdk/daemon';
import { DaemonRevisionRequest } from '@qwen-code/sdk/daemon';
import { DaemonRewindResult } from '@qwen-code/sdk/daemon';
import { DaemonRewindSnapshotInfo } from '@qwen-code/sdk/daemon';
import { DaemonRuntimeMcpAddRequest } from '@qwen-code/sdk/daemon';
import { DaemonRuntimeMcpAddResult } from '@qwen-code/sdk/daemon';
import { DaemonRuntimeMcpRemoveResult } from '@qwen-code/sdk/daemon';
import { DaemonSession } from '@qwen-code/sdk/daemon';
import { DaemonSessionArchiveState } from '@qwen-code/sdk/daemon';
import { DaemonSessionArtifactsEnvelope } from '@qwen-code/sdk/daemon';
import { DaemonSessionAttachmentData } from '@qwen-code/sdk/daemon';
import { DaemonSessionAttachmentReference } from '@qwen-code/sdk/daemon';
import { DaemonSessionBtwResult } from '@qwen-code/sdk/daemon';
import { DaemonSessionContextStatus } from '@qwen-code/sdk/daemon';
import { DaemonSessionContextUsage } from '@qwen-code/sdk/daemon';
import { DaemonSessionContextUsageStatus } from '@qwen-code/sdk/daemon';
import { DaemonSessionExportFormat } from '@qwen-code/sdk/daemon';
import { DaemonSessionExportResult } from '@qwen-code/sdk/daemon';
import { DaemonSessionGenerationEvent } from '@qwen-code/sdk/daemon';
import { DaemonSessionGroup } from '@qwen-code/sdk/daemon';
import { DaemonSessionGroupCatalog } from '@qwen-code/sdk/daemon';
import { DaemonSessionGroupInput } from '@qwen-code/sdk/daemon';
import { DaemonSessionGroupUpdate } from '@qwen-code/sdk/daemon';
import { DaemonSessionListPage } from '@qwen-code/sdk/daemon';
import { DaemonSessionListPageOptions } from '@qwen-code/sdk/daemon';
import { DaemonSessionOrganizationResult } from '@qwen-code/sdk/daemon';
import { DaemonSessionOrganizationUpdate } from '@qwen-code/sdk/daemon';
import { DaemonSessionRecapResult } from '@qwen-code/sdk/daemon';
import { DaemonSessionStatsModelMetrics } from '@qwen-code/sdk/daemon';
import { DaemonSessionStatsSource } from '@qwen-code/sdk/daemon';
import { DaemonSessionStatsStatus } from '@qwen-code/sdk/daemon';
import { DaemonSessionStatsToolByName } from '@qwen-code/sdk/daemon';
import { DaemonSessionSummary } from '@qwen-code/sdk/daemon';
import { DaemonSessionSupportedCommandsStatus } from '@qwen-code/sdk/daemon';
import { DaemonSessionTasksStatus } from '@qwen-code/sdk/daemon';
import { DaemonSessionTaskStatus } from '@qwen-code/sdk/daemon';
import { DaemonSettingDescriptor } from '@qwen-code/sdk/daemon';
import { DaemonSettingUpdateResult } from '@qwen-code/sdk/daemon';
import { DaemonShellCommandResult } from '@qwen-code/sdk/daemon';
import { DaemonShellTranscriptBlock } from '@qwen-code/sdk/daemon';
import { DaemonSkillInstallRequest } from '@qwen-code/sdk/daemon';
import { DaemonSkillMutationResult } from '@qwen-code/sdk/daemon';
import { DaemonSkillScope } from '@qwen-code/sdk/daemon';
import { DaemonSkillToggleMutation } from '@qwen-code/sdk/daemon';
import { DaemonSkillToggleResult } from '@qwen-code/sdk/daemon';
import { DaemonStatusReport } from '@qwen-code/sdk/daemon';
import { DaemonStatusReportDetail } from '@qwen-code/sdk/daemon';
import { DaemonStatusReportIssue } from '@qwen-code/sdk/daemon';
import { DaemonStatusReportLevel } from '@qwen-code/sdk/daemon';
import { DaemonStatusReportSection } from '@qwen-code/sdk/daemon';
import { DaemonStatusReportSession } from '@qwen-code/sdk/daemon';
import { DaemonStatusTranscriptBlock } from '@qwen-code/sdk/daemon';
import { DaemonTextTranscriptBlock } from '@qwen-code/sdk/daemon';
import { DaemonToolTranscriptBlock } from '@qwen-code/sdk/daemon';
import { DaemonTranscriptBlock } from '@qwen-code/sdk/daemon';
import { DaemonTranscriptBlockKind } from '@qwen-code/sdk/daemon';
import { DaemonTranscriptQuestion } from '@qwen-code/sdk/daemon';
import { DaemonTranscriptQuestionOption } from '@qwen-code/sdk/daemon';
import { DaemonTranscriptReducerOptions } from '@qwen-code/sdk/daemon';
import { DaemonTranscriptSidechannelState } from '@qwen-code/sdk/daemon';
import { DaemonTranscriptState } from '@qwen-code/sdk/daemon';
import { DaemonTranscriptStore } from '@qwen-code/sdk/daemon';
import { DaemonTransport } from '@qwen-code/sdk/daemon';
import { DaemonTurnCompleteEvent } from '@qwen-code/sdk/daemon';
import { DaemonTurnErrorEvent } from '@qwen-code/sdk/daemon';
import { DaemonUpdateAgentRequest } from '@qwen-code/sdk/daemon';
import { DaemonUsageDailyPoint } from '@qwen-code/sdk/daemon';
import { DaemonUsageDashboard } from '@qwen-code/sdk/daemon';
import { DaemonUsageDashboardTotals } from '@qwen-code/sdk/daemon';
import { DaemonUsageHeatmapDay } from '@qwen-code/sdk/daemon';
import { DaemonUsageModelShare } from '@qwen-code/sdk/daemon';
import { DaemonUsageRange } from '@qwen-code/sdk/daemon';
import { DaemonUsageSkillCall } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceAcpPreheatResult } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceAgentDetail } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceAgentsStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceAgentSummary } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceCapability } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceEnvStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceExtensionsStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceFile } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceFileBytes } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceFileEditRequest } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceFileEditResult } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceFileWriteRequest } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceFileWriteResult } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceGenerationEvent } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceGitStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceMcpInitializeResult } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceMcpResourcesStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceMcpResourceStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceMcpServerStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceMcpStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceMcpToolsStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceMcpToolStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceMemoryFile } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceMemoryStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspacePreflightStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceProviderCurrent } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceProviderModel } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceProvidersStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceProviderStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceRemovalResult } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceSettingsStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceSkillsStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceSkillStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceToolsStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceToolStatus } from '@qwen-code/sdk/daemon';
import { DaemonWorkspaceUpdate } from '@qwen-code/sdk/daemon';
import { DaemonWriteMemoryRequest } from '@qwen-code/sdk/daemon';
import { DaemonWriteMemoryResult } from '@qwen-code/sdk/daemon';
import { ExtensionActiveOperations } from '@qwen-code/sdk/daemon';
import { ExtensionArchiveInstallRequest } from '@qwen-code/sdk/daemon';
import { ExtensionInstallRequest } from '@qwen-code/sdk/daemon';
import { ExtensionInstallResponse } from '@qwen-code/sdk/daemon';
import { ExtensionInteractionResponse } from '@qwen-code/sdk/daemon';
import { ExtensionInteractionResponseResult } from '@qwen-code/sdk/daemon';
import { ExtensionMutationResponse } from '@qwen-code/sdk/daemon';
import { ExtensionOperationStatus } from '@qwen-code/sdk/daemon';
import { ExtensionRefreshResponse } from '@qwen-code/sdk/daemon';
import { ExtensionScopeRequest } from '@qwen-code/sdk/daemon';
import { ExtensionUpdateCheckResponse } from '@qwen-code/sdk/daemon';
import { GoalControlRequest } from '@qwen-code/sdk/daemon';
import { GoalSnapshotV2 } from '@qwen-code/sdk/daemon';
import { GoalStateResponse } from '@qwen-code/sdk/daemon';
import { HeartbeatResult } from '@qwen-code/sdk/daemon';
import { JSX } from 'react/jsx-runtime';
import { PermissionResponse } from '@qwen-code/sdk/daemon';
import { PromptContentBlock } from '@qwen-code/sdk/daemon';
import { PromptResult } from '@qwen-code/sdk/daemon';
import { ReactNode } from 'react';
import { SessionMetadataResult } from '@qwen-code/sdk/daemon';
import { SetModelResult } from '@qwen-code/sdk/daemon';

/**
 * Canonical name of the Agent (sub-agent) tool as it appears on the wire
 * (`_meta.toolName`), mirroring core's `ToolNames.AGENT`.
 *
 * This is a runtime wire-protocol string, so it cannot be compile-time linked
 * to core across the daemon boundary. Centralizing it here gives the frontend
 * consumers (permission prompts in webui + web-shell) a single source of truth
 * for the match instead of three independent `'agent'` literals.
 */
export declare const AGENT_TOOL_NAME = "agent";

export declare function consumePendingPromptEvents(handled: readonly PendingPromptSidechannelEvent[]): void;

export { DAEMON_APPROVAL_MODES }

export declare const DAEMON_SESSION_DEFAULT_MAX_BLOCKS = 50000;

declare interface DaemonAddWorkspaceResult {
    id: string;
    cwd: string;
    displayName?: string;
    primary: boolean;
    trusted: boolean;
    persisted?: boolean;
}

export { DaemonApprovalMode }

export { DaemonAuthProviderBaseUrlOption }

export { DaemonAuthProviderCatalog }

export { DaemonAuthProviderDescriptor }

export { DaemonAuthProviderInstallRequest }

export { DaemonAuthProviderInstallResult }

export { DaemonAuthProviderModel }

export { DaemonChannelConfigEnumFieldDescriptor }

export { DaemonChannelConfigFieldDescriptor }

export { DaemonChannelConfigFieldKind }

export { DaemonChannelConfigNestedFieldDescriptor }

export { DaemonChannelConfigNumberFieldDescriptor }

export { DaemonChannelConfigObjectFieldDescriptor }

export { DaemonChannelConfigPlainValueFieldDescriptor }

export { DaemonChannelConfigValueFieldDescriptor }

export { DaemonChannelInstanceSnapshot }

export { DaemonChannelMutationResult }

export declare interface DaemonChannelPairingActions {
    list(name: string): Promise<DaemonChannelPairingRequestsSnapshot>;
    approve(name: string, code: string): Promise<DaemonChannelPairingApprovalResult>;
    approvals(name: string): Promise<DaemonChannelPairingApprovalsSnapshot>;
    revoke(name: string, request: DaemonChannelPairingRevocationRequest): Promise<DaemonChannelPairingRevocationResult>;
}

export { DaemonChannelPairingApprovalRequest }

export { DaemonChannelPairingApprovalResult }

export { DaemonChannelPairingApprovalsSnapshot }

export { DaemonChannelPairingRequest }

export { DaemonChannelPairingRequestsSnapshot }

export { DaemonChannelPairingRevocationRequest }

export { DaemonChannelPairingRevocationResult }

export { DaemonChannelPairingSubject }

export { DaemonChannelRuntimeState }

export { DaemonChannelSecretState }

export { DaemonChannelSecretUpdate }

declare interface DaemonChannelsOptions extends DaemonResourceOptions {
    workspaceCwd?: string;
}

export declare interface DaemonChannelsResource {
    catalog: DaemonChannelTypeCatalog;
    snapshot: DaemonChannelsSnapshot;
}

export { DaemonChannelsSnapshot }

export { DaemonChannelStartupRequest }

export { DaemonChannelTypeCatalog }

export { DaemonChannelTypeDescriptor }

export { DaemonChannelUpsertRequest }

export declare interface DaemonCommandInfo {
    name: string;
    description: string;
    argumentHint?: string;
    source?: string;
    raw: DaemonAvailableCommand;
}

export declare interface DaemonConnectionState {
    status: DaemonConnectionStatus;
    sessionId?: string;
    /**
     * Daemon-confirmed client identity bound to this session (the value sent as
     * `X-Qwen-Client-Id`). Consumers use it to recognize their OWN
     * originator-stamped legacy frames. Stable-id mid-turn queues are shared by
     * the session and do not use this id as an ownership boundary.
     */
    clientId?: string;
    workspaceCwd?: string;
    /** Current Git branch, short detached-HEAD hash, or undefined outside Git. */
    gitBranch?: string;
    /**
     * Last enriched working-tree summary for the current workspace, pushed by
     * the daemon via `git_status_changed` (only set when the event's
     * workspaceCwd matches this connection's workspace).
     */
    gitStatus?: DaemonWorkspaceGitStatus;
    commands?: DaemonCommandInfo[];
    skills?: string[];
    models?: DaemonModelInfo[];
    currentModel?: string;
    reasoning?: DaemonReasoningControls;
    currentMode?: string;
    displayName?: string;
    /** Latest main-conversation model usage event. */
    tokenUsage?: DaemonTokenUsage;
    /** Authoritative Goal v2 state for the current session. */
    goalState?: GoalSnapshotV2;
    /** Current context-window occupancy, used with contextWindow for percentages. */
    tokenCount?: number;
    contextWindow?: number;
    providers?: DaemonWorkspaceProvidersStatus;
    supportedCommands?: DaemonSessionSupportedCommandsStatus;
    context?: DaemonSessionContextStatus;
    capabilities?: DaemonCapabilities;
    /** True while the current session transcript is being loaded. */
    loadingTranscript?: boolean;
    /** True while replaying buffered events after a reconnect. */
    catchingUp?: boolean;
    error?: string;
    /** Latest HTTP error status kept for diagnostics; use missingSession for UI. */
    errorStatus?: number;
    /** True only when the server confirmed the current session is missing. */
    missingSession?: boolean;
}

export declare type DaemonConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export { DaemonContextCategoryBreakdown }

export { DaemonContextFileScope }

export { DaemonContextMemoryDetail }

export { DaemonContextSkillDetail }

export { DaemonContextToolDetail }

export declare interface DaemonCreateScheduledTaskRequest {
    cron: string;
    prompt: string;
    /** Omit or null for an unnamed task. */
    name?: string | null;
    /** Defaults to true (fire on every match until deleted/expired). */
    recurring?: boolean;
    /** Defaults to true. */
    enabled?: boolean;
    /** Reuse an existing live, idle session instead of creating one. */
    sessionId?: string | null;
}

export declare interface DaemonDirectoryEntry {
    name: string;
    kind: 'file' | 'directory' | 'symlink' | 'other';
    ignored: boolean;
}

export declare interface DaemonDirectoryListing {
    kind: 'list';
    path: string;
    entries: DaemonDirectoryEntry[];
    truncated: boolean;
}

export declare interface DaemonFileStat {
    kind: 'stat';
    path: string;
    type: 'file' | 'directory' | 'symlink' | 'other';
    sizeBytes: number;
    modifiedMs: number;
}

export declare interface DaemonGlobOptions {
    maxResults?: number;
    includeIgnored?: boolean;
    cwd?: string;
}

export declare interface DaemonGlobResult {
    matches: string[];
}

/**
 * One session's active `/goal`. Goals live in the owning session's memory and
 * only advance while it is resident, so this list covers exactly the goals that
 * are actually running — a session that isn't loaded contributes nothing.
 */
export declare interface DaemonGoal {
    /** The session driving this goal; its transcript is the goal's history. */
    sessionId: string;
    /** The session's label, or null — the UI falls back to the id. */
    displayName: string | null;
    condition: string;
    /** Judge turns completed; 0 before the first stop-hook evaluation. */
    iterations: number;
    setAt: number;
    /** The judge's verdict on the most recent turn, when it has run. */
    lastReason?: string;
    /**
     * The owning session is mid-turn. For a goal session that is almost always
     * the loop working, but a manual prompt in the same session sets it too.
     */
    hasActivePrompt: boolean;
    /** Canonical lifecycle state; UI controls must use its goalId/revision. */
    snapshot: GoalSnapshotV2;
}

/** The `GET /goals` payload. */
export declare interface DaemonGoalList {
    goals: DaemonGoal[];
    /**
     * Sessions whose goal could not be probed (wedged or dying child). Their
     * goals are missing from `goals`, so a non-zero count means this list is
     * incomplete rather than empty.
     */
    droppedCount: number;
}

export { DaemonMetricsSeriesBucket }

export { DaemonModelDeleteRequest }

export { DaemonModelDeleteResult }

export declare interface DaemonModelInfo {
    id: string;
    baseModelId?: string;
    label: string;
    authType?: string;
    contextWindow?: number;
    modalities?: {
        image?: boolean;
        pdf?: boolean;
        audio?: boolean;
        video?: boolean;
    };
    baseUrl?: string;
    envKey?: string;
    isRuntime?: boolean;
    reasoningPreview?: DaemonReasoningControls;
}

export declare type DaemonNoticeCategory = 'validation' | 'user_action' | 'connection' | 'protocol' | 'lifecycle' | 'system';

export declare type DaemonNoticeOperation = 'send_prompt' | 'send_shell_command' | 'switch_model' | 'set_reasoning_effort' | 'set_approval_mode' | 'submit_permission' | 'cancel_prompt' | 'attach_session' | 'load_session' | 'resume_session' | 'create_session' | 'close_session' | 'rename_session' | 'release_session' | 'list_sessions' | 'load_context' | 'load_context_usage' | 'load_tasks' | 'load_artifacts' | 'read_attachment' | 'remove_attachment' | 'cancel_task' | 'load_goal' | 'control_goal' | 'clear_goal' | 'load_stats' | 'rewind_snapshots' | 'rewind_session' | 'refresh_commands' | 'recap_session' | 'generate_session_content' | 'btw_session' | 'branch_session' | 'fork_session' | 'record_session' | 'stream' | 'normalize_event';

export declare type DaemonNoticeSeverity = 'info' | 'warning' | 'error';

export declare interface DaemonPromptFile {
    name: string;
    data?: Blob;
    text?: string;
    mimeType?: string;
    mediaType?: string;
    media_type?: string;
}

export declare interface DaemonPromptImage {
    data: string;
    mimeType?: string;
    mediaType?: string;
    media_type?: string;
}

export declare type DaemonPromptStatus = 'idle' | 'waiting' | 'streaming';

export declare interface DaemonReasoningControls {
    enabled: boolean;
    effort: string;
    efforts: string[];
}

export declare interface DaemonResourceOptions {
    autoLoad?: boolean;
    enabled?: boolean;
}

export { DaemonRevisionRequest }

export declare interface DaemonScheduledTask {
    id: string;
    name: string | null;
    cron: string;
    prompt: string;
    recurring: boolean;
    enabled: boolean;
    createdAt: number;
    lastFiredAt: number | null;
    /** Next scheduled fire (epoch ms), or null for a disabled task. A GET-time
     * snapshot the UI counts down against; it advances on the next reload. */
    nextRunAt: number | null;
    /** Id of the dedicated session this task is bound to — its transcript is the
     * task's run history. Null for unbound tool-created/legacy tasks. */
    sessionId: string | null;
    /** Bounded, newest-last history of recent fires. Empty for tasks that have
     * not fired (and, by nature, for one-shots — they are deleted on fire). */
    runs: DaemonScheduledTaskRun[];
    /** The registered workspace this task belongs to, when the aggregated
     * multi-workspace view tagged it client-side. Absent (single-workspace) means
     * the primary workspace. `workspaceId` targets its workspace-qualified route;
     * `workspaceCwd` labels the card. The daemon never sends these — they are
     * attached by the client after a per-workspace fetch. */
    workspaceId?: string;
    workspaceCwd?: string;
}

/** A durable scheduled task as returned by the daemon. `name`/`enabled` are
 * normalized (never undefined): `name: null` = unnamed, `enabled` defaults to
 * true for tasks created before the field existed. */
/** One recorded fire of a recurring scheduled task, newest last in
 * {@link DaemonScheduledTask.runs}. Mirrors the daemon's wire shape. */
export declare interface DaemonScheduledTaskRun {
    /** Fire time (epoch ms). */
    at: number;
    /** `'scheduled'` (on-time), `'catch-up'` (fired late), or `'manual'` (user
     * "run now"); absent = scheduled. */
    kind?: 'scheduled' | 'catch-up' | 'manual';
    /** The session the fire ran in, when the task is bound to one. Mirrors the
     * daemon's `CronTaskRun.sessionId` so run-attribution isn't silently dropped
     * on the client (not surfaced in the UI yet). */
    sessionId?: string;
    /** READ-ONLY legacy compat: a pre-removal version stamped this on a fire whose
     * precondition withheld the prompt. Never written now, but kept so the UI can
     * still mark such stored entries "skipped" instead of showing them as ordinary
     * successful runs. Absent = a real dispatched run. */
    withheld?: boolean;
}

export declare interface DaemonSessionActions {
    sendPrompt(text: string, options?: SendPromptOptions): Promise<PromptResult>;
    /**
     * Non-blocking prompt submission. POSTs to the daemon and returns
     * immediately with the `promptId`. The daemon queues the prompt in its
     * FIFO if a turn is already running. Use this during streaming to
     * enqueue prompts without waiting for the current turn to complete.
     */
    submitPrompt(text: string, options?: SubmitPromptOptions): Promise<SubmitPromptResult>;
    cancel(): Promise<void>;
    setModel(modelId: string): Promise<SetModelResult>;
    setReasoningEffort(value: string): Promise<void>;
    setApprovalMode(mode: DaemonApprovalMode, opts?: {
        persist?: boolean;
    }): Promise<DaemonApprovalModeResult>;
    respondToPermission(requestId: string, response: PermissionResponse): Promise<boolean>;
    respondToGlobalPermission(requestId: string, response: PermissionResponse): Promise<boolean>;
    submitPermission(requestId: string, optionId?: string, answers?: Record<string, string>): Promise<boolean>;
    heartbeat(): Promise<HeartbeatResult | undefined>;
    listSessions(options?: {
        pageSize?: number;
    }): Promise<DaemonSessionSummary[]>;
    loadSession(sessionId: string, options?: {
        workspaceCwd?: string;
    }): Promise<void>;
    /** `memory` replay is reserved for the provider's live-journal repair. */
    reloadSession(signal: AbortSignal, options?: {
        replaySource?: 'configured' | 'memory';
    }): Promise<void>;
    resumeSession(sessionId: string, options?: {
        workspaceCwd?: string;
    }): Promise<void>;
    /**
     * Create a daemon session and update local session state. Callers that need
     * transcript/event streaming must follow with `attachSession()`.
     *
     * `options.workspaceCwd` targets a specific registered workspace runtime for
     * this call only (multi-workspace daemons). Omit it to keep the provider's
     * active workspace / primary fallback.
     *
     * `options.approvalMode` seeds the session's approval mode in the create
     * request itself, so the daemon applies it atomically at spawn instead of
     * requiring a follow-up `setApprovalMode` call.
     *
     * `options.sourceType` records immutable creator attribution.
     */
    createSession(options?: {
        workspaceCwd?: string;
        approvalMode?: DaemonApprovalMode;
        sourceType?: string;
        worktree?: {
            slug?: string;
        };
        branch?: {
            name: string;
        };
    }): Promise<DaemonSession>;
    attachSession(): Promise<void>;
    clearSession(): Promise<void>;
    newSession(): Promise<void>;
    releaseSession(sessionId: string): Promise<void>;
    closeSession(): Promise<void>;
    refreshCommands(): Promise<void>;
    getContext(): Promise<DaemonSessionContextStatus>;
    getContextUsage(opts?: {
        detail?: boolean;
    }): Promise<DaemonSessionContextUsageStatus>;
    renameSession(displayName: string): Promise<SessionMetadataResult>;
    recapSession(): Promise<DaemonSessionRecapResult>;
    generateSessionContent(prompt: string, opts?: {
        signal?: AbortSignal;
    }): AsyncGenerator<DaemonSessionGenerationEvent>;
    getRewindSnapshots(): Promise<{
        snapshots: DaemonRewindSnapshotInfo[];
    }>;
    rewindSession(promptId: string, opts?: {
        rewindFiles?: boolean;
    }): Promise<DaemonRewindResult>;
    btwSession(question: string, opts?: {
        signal?: AbortSignal;
    }): Promise<DaemonSessionBtwResult>;
    uploadAttachment(attachment: DaemonPromptImage | DaemonPromptFile, opts?: {
        signal?: AbortSignal;
        sessionId?: string;
    }): Promise<DaemonSessionAttachmentReference>;
    readAttachment(attachmentId: string): Promise<DaemonSessionAttachmentData>;
    removeAttachment(attachmentId: string, opts?: {
        sessionId?: string;
    }): Promise<boolean>;
    /**
     * Queue a message typed while a turn is running. Calls without an id support
     * old daemons and are best-effort; calls with a stable `messageId` may reject
     * on an ambiguous transport failure so the caller can reconcile. `content`
     * carries attachment blocks — pre-flight the daemon's
     * `session_attachments` capability before attaching references.
     */
    enqueueMidTurnMessage(message: string, opts?: {
        signal?: AbortSignal;
        messageId?: string;
        content?: PromptContentBlock[];
        onAdmissionStarted?: () => void;
    }): Promise<DaemonMidTurnMessageResult>;
    removeMidTurnMessage(messageId: string, opts?: PendingPromptActionOptions): Promise<DaemonRemoveMidTurnMessageResult>;
    /**
     * Best-effort reconciliation snapshot (queue + delivery-state rings) from the
     * daemon. Resolves `undefined` (never throws/raises a notice) when there
     * is no session or the query fails — callers preserve current state.
     * Pre-flight the
     * `session_mid_turn_message_query` capability before relying on it: older
     * daemons lack the route.
     */
    getMidTurnMessages(opts?: {
        signal?: AbortSignal;
    }): Promise<DaemonMidTurnMessagesResult | undefined>;
    getPendingPrompts(opts?: PendingPromptActionOptions): Promise<DaemonPendingPromptsResult>;
    removePendingPrompt(promptId: string, opts?: PendingPromptActionOptions): Promise<DaemonRemovePendingPromptResult>;
    sendShellCommand(command: string): Promise<DaemonShellCommandResult>;
    getTasks(opts?: GetTasksActionOptions): Promise<DaemonSessionTasksStatus>;
    cancelTask(taskId: string, kind: DaemonSessionTaskStatus['kind']): Promise<{
        cancelled: boolean;
    }>;
    getGoal(): Promise<GoalStateResponse>;
    controlGoal(request: GoalControlRequest): Promise<GoalStateResponse>;
    /**
     * Install a Goal snapshot obtained outside the session action layer — a
     * workspace-scoped control against the session this connection is attached
     * to — reconciled like any other snapshot. A no-op once the connection has
     * moved to another session.
     */
    applyGoalSnapshot(sessionId: string, snapshot: GoalSnapshotV2): void;
    clearGoal(): Promise<{
        cleared: boolean;
        condition?: string;
    }>;
    getStats(): Promise<DaemonSessionStatsStatus>;
    loadArtifacts(): Promise<DaemonSessionArtifactsEnvelope>;
    branchSession(name?: string, atRecordId?: string): Promise<{
        sessionId: string;
        displayName: string;
        switchStarted: boolean;
    }>;
    forkSession(directive: string): Promise<DaemonForkSessionResult>;
}

export { DaemonSessionContextUsage }

export { DaemonSessionContextUsageStatus }

export declare interface DaemonSessionContextValue {
    store: DaemonTranscriptStore;
    connection: DaemonConnectionState;
    promptStatus: DaemonPromptStatus;
    actions: DaemonSessionActions;
}

export declare interface DaemonSessionNotice {
    id: string;
    severity: DaemonNoticeSeverity;
    category: DaemonNoticeCategory;
    operation?: DaemonNoticeOperation;
    code: string;
    message: string;
    debugMessage?: string;
    recoverable?: boolean;
    createdAt: number;
}

export declare interface DaemonSessionOwnerGuard {
    capture(): DaemonSessionOwnerSnapshot;
}

export declare interface DaemonSessionOwnerSnapshot {
    isCurrent(): boolean;
}

export declare function DaemonSessionProvider(props: DaemonSessionProviderProps): JSX.Element;

export declare interface DaemonSessionProviderProps {
    /** Daemon base URL. Optional when nested inside DaemonWorkspaceProvider (inherited). */
    baseUrl?: string;
    /** Bearer token. Optional when nested inside DaemonWorkspaceProvider (inherited). */
    token?: string;
    /** Workspace cwd used when creating, loading, or resuming daemon sessions. */
    workspaceCwd?: string;
    /** Session id to load. Undefined keeps the page empty until a prompt creates one. */
    sessionId?: string;
    /** Stable client identity to reuse for session-scoped daemon requests. */
    clientId?: string;
    /** Extra create-session options, excluding workspaceCwd which is owned by the provider. */
    createSessionRequest?: Omit<CreateSessionRequest, 'workspaceCwd'>;
    /** Maximum queued SSE events requested from the daemon per subscription. */
    maxQueued?: number;
    /** Maximum normalized transcript blocks retained in memory. */
    maxBlocks?: number;
    /**
     * Maximum estimated bytes of transcript blocks retained in memory.
     * Trimming evicts oldest blocks until the estimate is back under this
     * budget; a block-count window alone is not a memory ceiling because
     * blocks can carry large raw tool payloads. Defaults to the transcript
     * store's built-in budget.
     */
    maxRetainedBytes?: number;
    /** Latest persisted records requested during an existing-session load. */
    historyPageSize?: number;
    /** Keep the full subagent transcript, or retain only bounded root summaries. */
    subagentTranscriptMode?: 'full' | 'summary';
    /** Hide this client's own user prompt echo when the daemon replays events. */
    suppressOwnUserEcho?: boolean;
    /** Attach raw daemon events to normalized transcript blocks for debugging. */
    includeRawEvent?: boolean;
    /** Connect to the daemon automatically on mount. */
    autoConnect?: boolean;
    /** Reconnect automatically after recoverable daemon/session failures. */
    autoReconnect?: boolean;
    /**
     * Restart a live SSE event stream after each accepted prompt. A stream that
     * is already down is always rebuilt immediately on prompt admission,
     * regardless of this flag.
     */
    restartEventStreamOnPrompt?: boolean;
    /** Initial reconnect delay in milliseconds. */
    reconnectDelayMs?: number;
    /** Maximum reconnect delay in milliseconds after backoff. */
    maxReconnectDelayMs?: number;
    /** Interval in milliseconds for client heartbeat checks. */
    heartbeatIntervalMs?: number;
    /** Consecutive heartbeat failures before marking the session disconnected. */
    heartbeatFailureThreshold?: number;
    /** Optional user-facing fallback warnings for partial session load failures. */
    loadWarnings?: {
        /** Warning shown when model/provider status cannot be loaded. */
        models?: string;
        /** Warning shown when supported command metadata cannot be loaded. */
        commands?: string;
        /** Warning shown when session context metadata cannot be loaded. */
        context?: string;
    };
    /** React children rendered inside the daemon session contexts. */
    children: ReactNode;
}

declare interface DaemonSessionsOptions extends DaemonResourceOptions {
    pageSize?: number;
    cursor?: string;
    /** Which session directory to list. Defaults to the daemon's `active`. */
    archiveState?: DaemonSessionArchiveState;
    view?: 'organized';
    group?: string;
    sourceType?: string;
}

export { DaemonSessionStatsModelMetrics }

export { DaemonSessionStatsSource }

export { DaemonSessionStatsStatus }

export { DaemonSessionStatsToolByName }

export { DaemonSessionSummary }

export { DaemonSettingDescriptor }

export { DaemonSettingUpdateResult }

export { DaemonShellTranscriptBlock }

export { DaemonStatusReport }

export { DaemonStatusReportDetail }

export { DaemonStatusReportIssue }

export { DaemonStatusReportLevel }

export { DaemonStatusReportSection }

export { DaemonStatusReportSession }

export { DaemonStatusTranscriptBlock }

export declare type DaemonStreamingState = 'idle' | 'waiting' | 'responding' | 'thinking';

export { DaemonTextTranscriptBlock }

export declare interface DaemonTodoItem {
    id: string;
    content: string;
    status: DaemonTodoStatus;
    priority?: DaemonTodoPriority;
    blockedBy?: string[];
}

export declare interface DaemonTodoList {
    blockId: string;
    toolCallId: string;
    title: string;
    status: string;
    planId?: string;
    sourceCallId?: string;
    items: DaemonTodoItem[];
    raw: Extract<DaemonTranscriptBlock, {
        kind: 'tool';
    }>;
}

export declare type DaemonTodoPriority = 'low' | 'medium' | 'high';

export declare type DaemonTodoStatus = 'pending' | 'in_progress' | 'completed';

export declare interface DaemonTokenUsage {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    thoughtTokens?: number;
    cachedReadTokens?: number;
}

export { DaemonToolTranscriptBlock }

export { DaemonTranscriptBlock }

export { DaemonTranscriptBlockKind }

export declare interface DaemonTranscriptHistory {
    hasMore: boolean;
    loading: boolean;
    capacityReached: boolean;
    paginationError: boolean;
    loadMore(options?: {
        force?: boolean;
    }): Promise<void>;
}

export { DaemonTranscriptQuestion }

export { DaemonTranscriptQuestionOption }

export { DaemonTranscriptReducerOptions }

export { DaemonTranscriptSidechannelState }

export { DaemonTranscriptState }

export { DaemonTranscriptStore }

/** Partial update. `name: null` (or '') clears the name. Omitted fields are
 * left unchanged. */
export declare interface DaemonUpdateScheduledTaskRequest {
    cron?: string;
    prompt?: string;
    name?: string | null;
    recurring?: boolean;
    enabled?: boolean;
}

export { DaemonUsageDailyPoint }

export { DaemonUsageDashboard }

export { DaemonUsageDashboardTotals }

export { DaemonUsageHeatmapDay }

export { DaemonUsageModelShare }

export { DaemonUsageRange }

export { DaemonUsageSkillCall }

export declare interface DaemonWorkspaceActions {
    listSessions(options?: DaemonSessionListPageOptions): Promise<DaemonSessionSummary[]>;
    listSessionsPage(options?: DaemonSessionListPageOptions): Promise<DaemonSessionListPage>;
    listSessionGroups(): Promise<DaemonSessionGroupCatalog>;
    createSessionGroup(input: DaemonSessionGroupInput): Promise<DaemonSessionGroup>;
    updateSessionGroup(groupId: string, update: DaemonSessionGroupUpdate): Promise<DaemonSessionGroup>;
    deleteSessionGroup(groupId: string): Promise<{
        deleted: boolean;
    }>;
    updateSessionOrganization(sessionId: string, update: DaemonSessionOrganizationUpdate): Promise<DaemonSessionOrganizationResult>;
    deleteSession(sessionId: string): Promise<boolean>;
    deleteSessions(sessionIds: string[]): Promise<{
        removed: string[];
        notFound: string[];
        errors: Array<{
            sessionId: string;
            error: string;
        }>;
    }>;
    exportSession(sessionId: string, format?: DaemonSessionExportFormat): Promise<DaemonSessionExportResult>;
    /**
     * Move a session to the archived directory. Idempotent: an
     * already-archived session resolves `true`. Rejects if the daemon
     * reports a per-session error (e.g. an archive/unarchive conflict).
     */
    archiveSession(sessionId: string): Promise<boolean>;
    /** Restore an archived session to the active directory. Idempotent. */
    unarchiveSession(sessionId: string): Promise<boolean>;
    loadChannels(): Promise<DaemonChannelsResource>;
    upsertChannel(name: string, request: DaemonChannelUpsertRequest): Promise<DaemonChannelMutationResult>;
    removeChannel(name: string, request: DaemonRevisionRequest): Promise<DaemonChannelMutationResult>;
    setChannelStartup(name: string, request: DaemonChannelStartupRequest): Promise<DaemonChannelMutationResult>;
    startChannel(name: string): Promise<DaemonChannelMutationResult>;
    stopChannel(name: string): Promise<DaemonChannelMutationResult>;
    restartChannel(name: string): Promise<DaemonChannelMutationResult>;
    channelPairing: DaemonChannelPairingActions;
    loadMcpStatus(): Promise<DaemonWorkspaceMcpStatus>;
    initializeMcp(): Promise<DaemonWorkspaceMcpInitializeResult>;
    reloadMcp(): Promise<DaemonWorkspaceMcpInitializeResult>;
    loadMcpTools(serverName: string): Promise<DaemonWorkspaceMcpToolsStatus>;
    loadMcpResources(serverName: string): Promise<DaemonWorkspaceMcpResourcesStatus>;
    restartMcpServer(serverName: string): Promise<DaemonMcpRestartResult>;
    manageMcpServer(serverName: string, action: DaemonMcpManageAction): Promise<DaemonMcpManageResult>;
    addRuntimeMcpServer(request: DaemonRuntimeMcpAddRequest): Promise<DaemonRuntimeMcpAddResult>;
    removeRuntimeMcpServer(name: string): Promise<DaemonRuntimeMcpRemoveResult>;
    loadDaemonStatus(detail?: DaemonStatusReportDetail): Promise<DaemonStatusReport>;
    loadUsageDashboard(opts?: {
        range?: DaemonUsageRange;
        heatmapDays?: number;
    }): Promise<DaemonUsageDashboard>;
    loadSkillsStatus(): Promise<DaemonWorkspaceSkillsStatus>;
    setWorkspaceSkillEnabled(skillName: string, enabled: boolean): Promise<DaemonSkillToggleResult>;
    installWorkspaceSkill(request: DaemonSkillInstallRequest): Promise<DaemonSkillMutationResult>;
    deleteWorkspaceSkill(skillName: string, scope: DaemonSkillScope): Promise<DaemonSkillMutationResult>;
    loadExtensionsStatus(): Promise<DaemonWorkspaceExtensionsStatus>;
    preheatAcp(timeoutMs?: number): Promise<DaemonWorkspaceAcpPreheatResult>;
    loadToolsStatus(): Promise<DaemonWorkspaceToolsStatus>;
    setWorkspaceToolEnabled(toolName: string, enabled: boolean): Promise<unknown>;
    loadSettingsStatus(): Promise<DaemonWorkspaceSettingsStatus>;
    setWorkspaceSetting(scope: 'workspace' | 'user', key: string, value: unknown, options?: {
        mcpServerMutation?: {
            operation: 'set' | 'remove';
            name: string;
        };
    }): Promise<DaemonSettingUpdateResult>;
    loadMemoryStatus(): Promise<DaemonWorkspaceMemoryStatus>;
    readWorkspaceFile(filePath: string): Promise<DaemonWorkspaceFile>;
    writeMemory(req: DaemonWriteMemoryRequest): Promise<DaemonWriteMemoryResult>;
    generateContent(prompt: string, opts?: {
        signal?: AbortSignal;
    }): AsyncGenerator<DaemonWorkspaceGenerationEvent>;
    listAgents(): Promise<DaemonWorkspaceAgentsStatus>;
    getAgent(agentType: string, scope?: 'workspace' | 'global'): Promise<DaemonWorkspaceAgentDetail>;
    createAgent(req: DaemonCreateAgentRequest): Promise<DaemonAgentMutationResult>;
    generateAgent(description: string): Promise<DaemonGeneratedAgentContent>;
    deleteAgent(agentType: string, scope?: 'workspace' | 'global'): Promise<void>;
    globWorkspace(pattern: string, opts?: DaemonGlobOptions): Promise<DaemonGlobResult>;
    readFileBytes(filePath: string, opts?: {
        offset?: number;
        maxBytes?: number;
    }): Promise<DaemonWorkspaceFileBytes>;
    writeFile(req: DaemonWorkspaceFileWriteRequest): Promise<DaemonWorkspaceFileWriteResult>;
    editFile(req: DaemonWorkspaceFileEditRequest): Promise<DaemonWorkspaceFileEditResult>;
    stat(filePath: string): Promise<DaemonFileStat>;
    listDirectory(dirPath: string): Promise<DaemonDirectoryListing>;
    listScheduledTasks(workspaceId?: string): Promise<DaemonScheduledTask[]>;
    createScheduledTask(req: DaemonCreateScheduledTaskRequest, workspaceId?: string): Promise<DaemonScheduledTask>;
    updateScheduledTask(id: string, patch: DaemonUpdateScheduledTaskRequest, workspaceId?: string): Promise<DaemonScheduledTask>;
    /** Record a manual run (updates lastFiredAt + appends a 'manual' run). The
     * prompt itself is executed by the caller in the task's bound session. */
    runScheduledTask(id: string, workspaceId?: string): Promise<DaemonScheduledTask>;
    deleteScheduledTask(id: string, workspaceId?: string): Promise<void>;
    listGoals(): Promise<DaemonGoalList>;
    controlGoal(sessionId: string, request: GoalControlRequest): Promise<GoalStateResponse>;
    /** Drop a session's goal hook. No-op when that session has no active goal. */
    clearGoal(sessionId: string): Promise<{
        cleared: boolean;
    }>;
    loadProviders(): Promise<DaemonWorkspaceProvidersStatus>;
    loadEnv(): Promise<DaemonWorkspaceEnvStatus>;
    loadPreflight(): Promise<DaemonWorkspacePreflightStatus>;
    initWorkspace(opts?: {
        force?: boolean;
    }): Promise<DaemonInitWorkspaceResult>;
    updateAgent(agentType: string, req: DaemonUpdateAgentRequest, scope?: 'workspace' | 'global'): Promise<DaemonAgentMutationResult>;
    installExtension(params: ExtensionInstallRequest, clientId?: string): Promise<ExtensionInstallResponse>;
    installExtensionArchive(params: ExtensionArchiveInstallRequest, clientId?: string): Promise<ExtensionInstallResponse>;
    extensionOperationStatus(operationId: string): Promise<ExtensionOperationStatus>;
    activeExtensionOperations(): Promise<ExtensionActiveOperations>;
    respondToExtensionInteraction(operationId: string, interactionId: string, response: ExtensionInteractionResponse, clientId?: string): Promise<ExtensionInteractionResponseResult>;
    checkExtensionUpdates(clientId?: string): Promise<ExtensionUpdateCheckResponse>;
    refreshExtensions(clientId?: string): Promise<ExtensionRefreshResponse>;
    enableExtension(name: string, params: ExtensionScopeRequest, clientId?: string): Promise<ExtensionMutationResponse>;
    disableExtension(name: string, params: ExtensionScopeRequest, clientId?: string): Promise<ExtensionMutationResponse>;
    updateExtension(name: string, clientId?: string): Promise<ExtensionMutationResponse>;
    uninstallExtension(name: string, clientId?: string): Promise<ExtensionMutationResponse>;
    startDeviceFlow(providerId: DaemonAuthProviderId): Promise<DaemonDeviceFlowStartResult>;
    getDeviceFlow(deviceFlowId: string, opts?: {
        signal?: AbortSignal;
    }): Promise<DaemonDeviceFlowState>;
    cancelDeviceFlow(deviceFlowId: string): Promise<void>;
    getAuthStatus(): Promise<DaemonAuthStatusSnapshot>;
    getAuthProviders(): Promise<DaemonAuthProviderCatalog>;
    installAuthProvider(req: DaemonAuthProviderInstallRequest): Promise<DaemonAuthProviderInstallResult>;
    deleteModel(target: DaemonModelDeleteRequest): Promise<DaemonModelDeleteResult>;
    addWorkspace(cwd: string, options?: {
        persist?: boolean;
        displayName?: string;
    }): Promise<DaemonAddWorkspaceResult>;
    addScratchWorkspace(): Promise<DaemonAddWorkspaceResult>;
    suggestWorkspacePaths(prefix: string): Promise<DaemonWorkspacePathSuggestions>;
    pickWorkspaceDirectory(): Promise<DaemonWorkspaceDirectoryPickerResult>;
    updateWorkspace(workspaceSelector: string, update: DaemonWorkspaceUpdate): Promise<DaemonWorkspaceCapability>;
    removeWorkspace(workspaceId: string, options?: {
        force?: boolean;
        timeoutMs?: number;
    }): Promise<DaemonWorkspaceRemovalResult>;
}

export { DaemonWorkspaceAgentDetail }

export { DaemonWorkspaceAgentSummary }

export declare interface DaemonWorkspaceContextValue {
    client: DaemonClient;
    token?: string;
    baseUrl: string;
    workspaceCwd?: string;
    status: DaemonWorkspaceStatus;
    error?: Error;
    capabilities?: DaemonCapabilities;
    getCapabilities?: () => Promise<DaemonCapabilities>;
    /**
     * Force a fresh `/capabilities` fetch and push the result into the
     * provider's `capabilities` state so consumers re-render. Unlike
     * `getCapabilities` — which memoizes its first in-flight promise for the
     * lifetime of the connection and never calls `setCapabilities` outside the
     * initial mount — this bypasses that cache. Use it after a mutation that
     * changes capabilities (e.g. registering a workspace) so the new state
     * shows without a full page reload.
     */
    refreshCapabilities?: () => Promise<DaemonCapabilities>;
    actions: DaemonWorkspaceActions;
}

declare type DaemonWorkspaceDirectoryPickerResult = {
    kind: 'workspace-directory-picker';
    selected: true;
    path: string;
} | {
    kind: 'workspace-directory-picker';
    selected: false;
};

declare interface DaemonWorkspaceEventSignals {
    memoryVersion: number;
    agentsVersion: number;
    toolsVersion: number;
    settingsVersion: number;
    skillsVersion: number;
    lastSkillMutation?: DaemonSkillToggleMutation;
    skillMutationsByCwd?: Record<string, DaemonSkillToggleMutation[]>;
    mcpVersion: number;
    extensionsVersion: number;
    artifactsVersion: number;
    lastExtensionChange?: {
        status?: 'installed' | 'enabled' | 'disabled' | 'updated' | 'uninstalled' | 'failed';
        source?: string;
        name?: string;
        version?: string;
        error?: string;
        refreshed: number;
        failed: number;
    };
    initVersion: number;
    authVersion: number;
}

export { DaemonWorkspaceGenerationEvent }

export { DaemonWorkspaceMcpResourcesStatus }

export { DaemonWorkspaceMcpResourceStatus }

export { DaemonWorkspaceMcpServerStatus }

export { DaemonWorkspaceMcpToolsStatus }

export { DaemonWorkspaceMcpToolStatus }

export { DaemonWorkspaceMemoryFile }

declare interface DaemonWorkspacePathSuggestion {
    name: string;
    path: string;
}

declare interface DaemonWorkspacePathSuggestions {
    kind: 'workspace-path-suggestions';
    /** Directory the suggestions were listed from. */
    dir: string;
    /** Path separator of the daemon host, for appending on accept. */
    sep: string;
    suggestions: DaemonWorkspacePathSuggestion[];
    truncated: boolean;
}

export declare function DaemonWorkspaceProvider({ baseUrl, token, workspaceCwd, autoConnect, transport, children, }: DaemonWorkspaceProviderProps): JSX.Element;

export { DaemonWorkspaceProviderModel }

export declare interface DaemonWorkspaceProviderProps {
    baseUrl: string;
    token?: string;
    workspaceCwd?: string;
    autoConnect?: boolean;
    /**
     * Optional pluggable transport forwarded to `DaemonClient`. When
     * omitted the client uses the default REST+SSE transport.
     */
    transport?: DaemonTransport;
    children: ReactNode;
}

export { DaemonWorkspaceProvidersStatus }

export { DaemonWorkspaceProviderStatus }

export { DaemonWorkspaceSettingsStatus }

export { DaemonWorkspaceSkillStatus }

export declare type DaemonWorkspaceStatus = 'idle' | 'connecting' | 'connected' | 'error';

export { DaemonWorkspaceToolStatus }

/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
declare interface FollowupState {
    suggestion: string | null;
    isVisible: boolean;
    shownAt: number;
}

export declare function getPendingPromptEvents(): readonly PendingPromptSidechannelEvent[];

export declare function getPendingPromptVersion(): number;

declare interface GetTasksActionOptions {
    silent?: boolean;
}

/** Whether a tool name identifies the Agent (sub-agent) tool. */
export declare function isAgentTool(toolName: string | undefined): boolean;

export declare function isMissingSessionHttpStatus(status: number | undefined): boolean;

export declare interface PendingPromptActionOptions {
    sessionId?: string;
}

declare type PendingPromptSidechannelEvent = DaemonPendingPromptAddedEvent | DaemonPendingPromptStartedEvent | DaemonPendingPromptCompletedEvent | DaemonTurnCompleteEvent | DaemonTurnErrorEvent;

export declare interface ResourceResult<T> extends ResourceState<T> {
    reload: () => Promise<T | undefined>;
}

export declare interface ResourceState<T> {
    data: T | undefined;
    loading: boolean;
    error: Error | undefined;
}

export declare interface SendPromptOptions {
    optimisticUserMessage?: boolean;
    images?: DaemonPromptImage[];
    files?: DaemonPromptFile[];
    inputAnnotations?: DaemonInputAnnotation[];
    /**
     * When true, the daemon strips orphaned user entries from the chat
     * history before re-sending, and skips recording a duplicate user
     * message in the JSONL transcript. Used by Ctrl+Y retry.
     */
    retry?: boolean;
    /** Fired after local validation, immediately before dispatch to the daemon. */
    onAdmissionStarted?: () => void;
    /**
     * Fired once the daemon has ACCEPTED the prompt (admission), before the turn
     * runs to completion. Lets a caller act on "the prompt reached the session"
     * without waiting for the whole turn — e.g. the scheduled-tasks "run now",
     * which records the run at admission so a long/stalled turn or a closed tab
     * can't lose the record.
     */
    onAdmitted?: () => void;
}

export declare interface StatusReportOptions extends DaemonResourceOptions {
    /** Detail level to request; defaults to the cheap `summary` view. */
    detail?: DaemonStatusReportDetail;
}

export declare interface SubmitPromptOptions extends SendPromptOptions {
    sessionId?: string;
    signal?: AbortSignal;
}

export declare interface SubmitPromptResult {
    promptId: string;
    removedAfterAbort?: true;
}

export declare function subscribePendingPromptEvents(listener: () => void): () => void;

export declare function subscribePendingPromptVersion(listener: () => void): () => void;

export declare interface UsageDashboardOptions extends DaemonResourceOptions {
    /** Summary window: `today` (default) / `week` (7D) / `month` (30D). */
    range?: DaemonUsageRange;
    /** Trailing days for the heatmap; the server default (~6 months) is used
     * when omitted. Clamped server-side to 1..366. */
    heatmapDays?: number;
}

export declare function useActions(): DaemonSessionActions;

export declare function useActiveTodoList(): DaemonTodoList | undefined;

export declare function useAgents(options?: DaemonResourceOptions): {
    status: DaemonWorkspaceAgentsStatus | undefined;
    agents: DaemonWorkspaceAgentSummary[];
    getAgent: (agentType: string, scope?: "workspace" | "global") => Promise<DaemonWorkspaceAgentDetail>;
    createAgent: (req: DaemonCreateAgentRequest) => Promise<DaemonAgentMutationResult>;
    generateAgent: (description: string) => Promise<DaemonGeneratedAgentContent>;
    generateContent: (prompt: string, opts?: {
        signal?: AbortSignal;
    }) => AsyncGenerator<DaemonWorkspaceGenerationEvent>;
    deleteAgent: (agentType: string, scope?: "workspace" | "global") => Promise<void>;
    updateAgent: (agentType: string, req: DaemonUpdateAgentRequest, scope?: "workspace" | "global") => Promise<DaemonAgentMutationResult>;
    reload: () => Promise<DaemonWorkspaceAgentsStatus | undefined>;
    data: DaemonWorkspaceAgentsStatus | undefined;
    loading: boolean;
    error: Error | undefined;
};

export declare function useAuth(options?: DaemonResourceOptions): {
    status: DaemonAuthStatusSnapshot | undefined;
    providers: DaemonAuthProviderStatus[];
    pendingDeviceFlows: {
        deviceFlowId: string;
        providerId: DaemonAuthProviderId;
        expiresAt: number;
    }[];
    startDeviceFlow: (providerId: DaemonAuthProviderId) => Promise<DaemonDeviceFlowStartResult>;
    getDeviceFlow: (deviceFlowId: string, opts?: {
        signal?: AbortSignal;
    }) => Promise<DaemonDeviceFlowState>;
    cancelDeviceFlow: (deviceFlowId: string) => Promise<void>;
    reload: () => Promise<DaemonAuthStatusSnapshot | undefined>;
    data: DaemonAuthStatusSnapshot | undefined;
    loading: boolean;
    error: Error | undefined;
};

export declare function useChannels(options?: DaemonChannelsOptions): {
    data: {
        catalog: DaemonChannelTypeCatalog;
        snapshot: DaemonChannelsSnapshot;
    } | undefined;
    loading: boolean;
    error: Error | undefined;
    reload: () => Promise<WorkspaceChannelsResource | undefined>;
    catalog: DaemonChannelTypeCatalog;
    snapshot: DaemonChannelsSnapshot | undefined;
    channels: Record<string, DaemonChannelInstanceSnapshot>;
    createOrUpdate: (name: string, request: DaemonChannelUpsertRequest) => Promise<DaemonChannelMutationResult>;
    remove: (name: string, request: DaemonRevisionRequest) => Promise<DaemonChannelMutationResult>;
    setStartup: (name: string, request: DaemonChannelStartupRequest) => Promise<DaemonChannelMutationResult>;
    start: (name: string) => Promise<DaemonChannelMutationResult>;
    stop: (name: string) => Promise<DaemonChannelMutationResult>;
    restart: (name: string) => Promise<DaemonChannelMutationResult>;
    pairing: DaemonChannelPairingActions;
};

export declare function useConnection(): DaemonConnectionState;

/**
 * Wire the daemon's server-pushed `followup_suggestion` event into the
 * webui's `<InputForm>`. Consumers:
 *
 *   1. Render `<InputForm followupState={...} onAcceptFollowup={...}
 *      onDismissFollowup={...} />` with the three values returned here.
 *   2. Call `clear()` from the hook just before `actions.sendPrompt(...)`
 *      so the prior turn's ghost-text disappears immediately.
 *
 * The hook subscribes to daemon follow-up sidechannels and drives a
 * daemon-local accept/dismiss controller. The controller is the source
 * of truth for what the input renders; the store/sidechannel is the
 * source of truth for what the daemon last sent for this session.
 *
 * Wiring `onAccept` and `onOutcome` propagates straight to the
 * daemon-local controller.
 *
 * Must be called within a `<DaemonSessionProvider>` — throws via
 * `useDaemonTranscriptStore` otherwise.
 */
export declare function useDaemonFollowupSuggestion(opts?: UseDaemonFollowupSuggestionOptions): UseDaemonFollowupSuggestionReturn;

declare interface UseDaemonFollowupSuggestionOptions {
    enabled?: boolean;
    onAccept?: (suggestion: string) => void;
    onOutcome?: (params: {
        outcome: 'accepted' | 'ignored';
        accept_method?: 'tab' | 'enter' | 'right';
        time_ms: number;
        suggestion_length: number;
    }) => void;
}

export declare interface UseDaemonFollowupSuggestionReturn {
    /**
     * Current follow-up suggestion display state — pass directly to
     * `<InputForm followupState={...} />`. Reflects the controller's
     * post-debounce visible state, not the raw daemon push.
     */
    followupState: FollowupState;
    /**
     * Accept the visible suggestion. Wire to `<InputForm onAcceptFollowup={...} />`.
     * Calls the underlying controller's accept (which invokes the
     * consumer-provided `onAccept` from options) AND clears the daemon
     * store's `lastFollowupSuggestion` so the same suggestion does not
     * re-push into the controller on the next render.
     */
    onAcceptFollowup: (method?: 'tab' | 'enter' | 'right', options?: {
        skipOnAccept?: boolean;
    }) => void;
    /**
     * Dismiss the visible suggestion. Wire to `<InputForm onDismissFollowup={...} />`.
     * Same store-clear semantics as `onAcceptFollowup`.
     */
    onDismissFollowup: () => void;
    /**
     * Explicit invalidation hook. Adapters call this just before invoking
     * `actions.sendPrompt(...)` so the prior turn's ghost-text disappears
     * synchronously — no wire round-trip needed (the daemon does not
     * emit a "suggestion cleared" event on prompt boundaries; clients
     * self-invalidate).
     */
    clear: () => void;
}

/**
 * Subscribe to injected mid-turn batches. Unlike a latest-wins signal, this
 * accumulates every batch so multi-batch turns (one frame per tool batch) are
 * all reconciled; the consumer calls `consume(handled)` with the batches it
 * processed.
 */
export declare function useDaemonMidTurnInjected(): UseDaemonMidTurnInjectedResult;

declare interface UseDaemonMidTurnInjectedResult {
    /**
     * All injected mid-turn batches accumulated since the last `consume()`, in
     * arrival order. The array reference changes on every publish/consume, so a
     * consumer can run an effect keyed on it to reconcile every batch (not just
     * the newest) against its pending queue.
     */
    batches: readonly DaemonMidTurnMessageInjectedData[];
    /**
     * Drop exactly the batches passed in (by identity) — the consumer passes the
     * subset it actually reconciled (its active session's batches). Batches for
     * OTHER sessions, and frames that arrived after the snapshot, are not in that
     * subset and stay buffered for their own reconcile, so neither a session
     * switch nor a late frame can wipe an un-reconciled batch (= double delivery).
     */
    consume: (handled: readonly DaemonMidTurnMessageInjectedData[]) => void;
}

export declare function useDaemonSessionOwnerGuard(): DaemonSessionOwnerGuard;

export declare function useDiagnostics(options?: DaemonResourceOptions): {
    env: ResourceResult<DaemonWorkspaceEnvStatus>;
    preflight: ResourceResult<DaemonWorkspacePreflightStatus>;
};

export declare function useFiles(): Pick<DaemonWorkspaceActions, 'globWorkspace' | 'readFileBytes' | 'writeFile' | 'editFile' | 'stat' | 'listDirectory'> & {
    glob: DaemonWorkspaceActions['globWorkspace'];
};

/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
export declare function useGlob(): {
    globWorkspace: (pattern: string, opts?: DaemonGlobOptions) => Promise<DaemonGlobResult>;
};

export declare function useMcp(options?: DaemonResourceOptions): {
    status: DaemonWorkspaceMcpStatus | undefined;
    initialize: () => Promise<DaemonWorkspaceMcpInitializeResult>;
    reloadConfig: () => Promise<DaemonWorkspaceMcpInitializeResult>;
    loadTools: (serverName: string) => Promise<DaemonWorkspaceMcpToolsStatus>;
    loadResources: (serverName: string) => Promise<DaemonWorkspaceMcpResourcesStatus>;
    restartServer: (serverName: string) => Promise<DaemonMcpRestartResult>;
    manageServer: (serverName: string, action: DaemonMcpManageAction) => Promise<DaemonMcpManageResult>;
    addServer: (request: DaemonRuntimeMcpAddRequest) => Promise<DaemonRuntimeMcpAddResult>;
    removeServer: (name: string) => Promise<DaemonRuntimeMcpRemoveResult>;
    reload: () => Promise<DaemonWorkspaceMcpStatus | undefined>;
    data: DaemonWorkspaceMcpStatus | undefined;
    loading: boolean;
    error: Error | undefined;
};

export declare function useMemory(options?: DaemonResourceOptions): {
    status: DaemonWorkspaceMemoryStatus | undefined;
    files: DaemonWorkspaceMemoryFile[];
    readFile: (filePath: string) => Promise<DaemonWorkspaceFile>;
    writeMemory: (req: DaemonWriteMemoryRequest) => Promise<DaemonWriteMemoryResult>;
    reload: () => Promise<DaemonWorkspaceMemoryStatus | undefined>;
    data: DaemonWorkspaceMemoryStatus | undefined;
    loading: boolean;
    error: Error | undefined;
};

/**
 * Returns the workspace context if available, or undefined if no ancestor
 * `DaemonWorkspaceProvider` exists. Useful for optional integration.
 */
export declare function useOptionalWorkspace(): DaemonWorkspaceContextValue | undefined;

export declare function usePendingPermissions(): readonly DaemonPermissionTranscriptBlock[];

export declare function usePromptStatus(): DaemonPromptStatus;

/**
 * Loads the configured model providers (`GET /workspace/providers`) and reloads
 * whenever a settings change is broadcast — installing or deleting a model both
 * bump the settings version, so the model list stays in sync.
 */
export declare function useProviders(options?: DaemonResourceOptions): {
    status: DaemonWorkspaceProvidersStatus | undefined;
    providers: DaemonWorkspaceProviderStatus[];
    current: DaemonWorkspaceProviderCurrent | undefined;
    reload: () => Promise<DaemonWorkspaceProvidersStatus | undefined>;
    data: DaemonWorkspaceProvidersStatus | undefined;
    loading: boolean;
    error: Error | undefined;
};

export declare function useResource<T>(load: () => Promise<T>, options: DaemonResourceOptions): ResourceResult<T>;

export declare function useSession(): DaemonSessionContextValue;

export declare function useSessionNotices(): {
    notices: readonly DaemonSessionNotice[];
    dismissNotice(id: string): void;
    clearNotices(): void;
};

export declare function useSessions(options?: DaemonSessionsOptions): {
    data: DaemonSessionSummary[] | undefined;
    reload: () => Promise<DaemonSessionSummary[] | undefined>;
    sessions: DaemonSessionSummary[];
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
    deleteSession: (sessionId: string) => Promise<boolean>;
    deleteSessions: (sessionIds: string[]) => Promise<{
        removed: string[];
        notFound: string[];
        errors: Array<{
            sessionId: string;
            error: string;
        }>;
    }>;
    exportSession: (sessionId: string, format?: DaemonSessionExportFormat) => Promise<DaemonSessionExportResult>;
    archiveSession: (sessionId: string) => Promise<boolean>;
    unarchiveSession: (sessionId: string) => Promise<boolean>;
    loading: boolean;
    error: Error | undefined;
};

export declare function useSettings(options?: DaemonResourceOptions): {
    status: DaemonWorkspaceSettingsStatus | undefined;
    settings: DaemonSettingDescriptor[];
    setValue: (scope: "workspace" | "user", key: string, value: unknown, options?: {
        mcpServerMutation?: {
            operation: "set" | "remove";
            name: string;
        };
    }) => Promise<DaemonSettingUpdateResult>;
    reload: () => Promise<DaemonWorkspaceSettingsStatus | undefined>;
    data: DaemonWorkspaceSettingsStatus | undefined;
    loading: boolean;
    error: Error | undefined;
};

export declare function useSkills(options?: DaemonResourceOptions): {
    status: DaemonWorkspaceSkillsStatus | undefined;
    skills: DaemonWorkspaceSkillStatus[];
    setEnabled: (skillName: string, enabled: boolean) => Promise<DaemonSkillToggleResult>;
    install: (request: DaemonSkillInstallRequest) => Promise<DaemonSkillMutationResult>;
    remove: (skillName: string, scope: DaemonSkillScope) => Promise<DaemonSkillMutationResult>;
    reload: () => Promise<DaemonWorkspaceSkillsStatus | undefined>;
    data: DaemonWorkspaceSkillsStatus | undefined;
    loading: boolean;
    error: Error | undefined;
};

export declare function useStatusReport(options?: StatusReportOptions): {
    report: DaemonStatusReport | undefined;
    reload: () => Promise<DaemonStatusReport | undefined>;
    data: DaemonStatusReport | undefined;
    loading: boolean;
    error: Error | undefined;
};

export declare function useStreamingState(): DaemonStreamingState;

export declare function useTools(options?: DaemonResourceOptions): {
    status: DaemonWorkspaceToolsStatus | undefined;
    tools: DaemonWorkspaceToolStatus[];
    preheat: (timeoutMs?: number) => Promise<DaemonWorkspaceAcpPreheatResult>;
    setEnabled: (toolName: string, enabled: boolean) => Promise<unknown>;
    reload: () => Promise<DaemonWorkspaceToolsStatus | undefined>;
    data: DaemonWorkspaceToolsStatus | undefined;
    loading: boolean;
    error: Error | undefined;
};

export declare function useTranscriptBlocks(): readonly DaemonTranscriptBlock[];

export declare function useTranscriptHistory(): DaemonTranscriptHistory;

export declare function useTranscriptState(): DaemonTranscriptState;

export declare function useTranscriptStore(): DaemonTranscriptStore;

/**
 * Loads the aggregate token-usage dashboard (`GET /usage/dashboard`) behind the
 * Daemon Status "统计 / Usage" tab. Like {@link useDaemonStatusReport}, this is a
 * read-only resource; callers typically fetch on open + manual refresh rather
 * than polling, since the underlying aggregation can be I/O heavy.
 */
export declare function useUsageDashboard(options?: UsageDashboardOptions): {
    dashboard: DaemonUsageDashboard | undefined;
    reload: () => Promise<DaemonUsageDashboard | undefined>;
    data: DaemonUsageDashboard | undefined;
    loading: boolean;
    error: Error | undefined;
};

export declare function useWorkspace(): DaemonWorkspaceContextValue;

export declare function useWorkspaceActions(): DaemonWorkspaceActions;

export declare function useWorkspaceEventSignals(): DaemonWorkspaceEventSignals | undefined;

declare interface WorkspaceChannelsResource extends DaemonChannelsResource {
    workspaceCwd: string;
}

export { }
