// Force strict mode and setup for ESM
"use strict";
import {
  BridgeClient,
  CANCEL_VOTE_SENTINEL,
  KNOWN_APPROVAL_MODES,
  MultiClientPermissionMediator,
  SessionAttachmentReferenceError,
  SessionAttachmentStore,
  createNoOpPermissionAuditPublisher,
  isSessionAttachmentReference,
  withAttachmentDegradationMarker,
  writeStderrLine
} from "./chunk-ZGXYO7DY.js";
import {
  DEFAULT_RING_SIZE,
  EVENT_SCHEMA_VERSION,
  EventBus,
  logEventSizingFailed,
  serializedBridgeEventByteLength
} from "./chunk-7U5G6JXI.js";
import {
  JOURNAL_GROWTH_HARD_CAP_BYTES,
  normalizeCompactedReplayMaxBytes,
  normalizeJournalGrowthPoolBytes,
  normalizeMaxJournalBytes,
  normalizeMaxJournalEvents
} from "./chunk-WCCLLK7X.js";
import {
  MCP_RESTART_SERVER_DEADLINE_MS
} from "./chunk-OCPBI7J5.js";
import {
  defaultSpawnChannelFactory
} from "./chunk-RUGNCYNO.js";
import {
  BridgeChannelClosedError,
  BridgeTimeoutError,
  SERVE_CONTROL_EXT_METHODS,
  SERVE_STATUS_EXT_METHODS,
  STATUS_SCHEMA_VERSION,
  SessionRestoreTimeoutError,
  createIdleWorkspaceExtensionsStatus,
  createIdleWorkspaceHooksStatus
} from "./chunk-JHS74YAB.js";
import {
  ACTIVE_WORK_CLOSE_IF_UNHELD_PARAM,
  ACTIVE_WORK_CLOSE_TIMEOUT_MS,
  ACTIVE_WORK_HEARTBEAT_INTERVAL_MS,
  ACTIVE_WORK_HEARTBEAT_META_KEY,
  ACTIVE_WORK_HEARTBEAT_VERSION,
  ACTIVE_WORK_HOLD_CATEGORIES,
  ACTIVE_WORK_MAX_SESSION_HOLDS,
  ACTIVE_WORK_STALE_INTERVALS,
  CHANNEL_LIVENESS_META_KEY,
  CHANNEL_LIVENESS_VERSION,
  CHANNEL_PROMPT_META_KEY,
  CHANNEL_STARTUP_PROFILE_META_KEY,
  CHANNEL_STARTUP_PROFILE_VERSION,
  DAEMON_ATTACHMENT_REFERENCES_META_KEY,
  DAEMON_CHANNEL_DELIVERY_META_KEY,
  DAEMON_MODEL_PROMPT_META_KEY,
  DAEMON_PROMPT_DISPLAY_TEXT_META_KEY,
  DAEMON_RESTORE_ASK_USER_QUESTION_META_KEY,
  DAEMON_SUPPRESS_RESTORE_ASK_USER_QUESTION_META_KEY,
  LOAD_REPLAY_BULK_MODE,
  LOAD_REPLAY_HIDE_INHERITED_META_KEY,
  LOAD_REPLAY_MAX_UPDATES,
  LOAD_REPLAY_META_KEY,
  LOAD_REPLAY_MODE_META_KEY,
  LOAD_REPLAY_PAGE_SIZE_META_KEY,
  LOAD_REPLAY_VERSION,
  MID_TURN_RECONCILIATION_RING_SIZE,
  PROMPT_CANCEL_METHOD,
  REQUESTED_SESSION_ID_META_KEY,
  TODO_STOP_GUARD_QUEUE_RELEASE_METHOD,
  WORKTREE_MCP_DEFER_META_KEY,
  clampActiveWorkIntervalMs,
  isValidTrustedModelPrompt,
  sessionCloseDrainBudgetMs
} from "./chunk-OZ6KS6KW.js";
import {
  BranchWhilePromptActiveError,
  BridgeChannelQuarantinedError,
  CdWhilePromptActiveError,
  InvalidClientIdError,
  InvalidPermissionOptionError,
  InvalidRewindTargetError,
  InvalidSessionMetadataError,
  InvalidSessionScopeError,
  PermissionForbiddenError,
  PromptDeadlineExceededError,
  PromptQueueFullError,
  RestoreInProgressError,
  SessionBusyError,
  SessionLimitExceededError,
  SessionNotFoundError,
  SessionShellClientRequiredError,
  SessionShellDisabledError,
  StandaloneSessionSpawnError,
  WorkspaceMismatchError,
  isNotCurrentlyGeneratingCancelError
} from "./chunk-ERFDKH32.js";
import {
  canonicalizeWorkspace,
  translateAndCheckAbsoluteWorkspacePath
} from "./chunk-6PLDPT2C.js";
import {
  EXTERNAL_TOOL_GUARD_READY_META_KEY,
  EXTERNAL_TOOL_GUARD_REQUIRED_VALUE
} from "./chunk-3VUENPWF.js";
import {
  ClientSideConnection,
  PROTOCOL_VERSION,
  RequestError
} from "./chunk-IW6RQPQB.js";
import {
  MAX_DIRECTORY_ARTIFACT_DEPTH,
  MAX_DIRECTORY_ARTIFACT_FILES,
  collectRecordableWorkspaceFiles,
  isOfficeDocumentExtension,
  isRecordableDerivedChild,
  pathHasSkippedDirectoryComponent
} from "./chunk-6IUNAPLR.js";
import {
  SESSION_ARTIFACT_PERSISTENCE_VERSION,
  SESSION_PR_LIST_LIMIT,
  SESSION_PR_URL_MAX_LENGTH,
  SESSION_TRANSCRIPT_MAX_LIMIT,
  ShellExecutionService,
  TURN_RESULT_CODE_TEXT_TRUNCATED,
  TURN_RESULT_TEXT_MAX_CHARS,
  TrustGateError,
  WORKSPACE_CONTENT_MTIME_MS_METADATA_KEY,
  WORKSPACE_CONTENT_SHA256_METADATA_KEY,
  isPrototypeMetadataKey,
  isReservedWorkspaceMetadataKey,
  metadataBudgetBytes,
  normalizeSnapshotPayload,
  normalizeTurnResultError,
  stableSessionArtifactId
} from "./chunk-E4A5G5YB.js";
import {
  DAEMON_TRACEPARENT_META_KEY,
  DAEMON_TRACESTATE_META_KEY
} from "./chunk-HVEYF6VT.js";
import {
  INVOCATION_CONTEXT_META_KEY,
  PRIVATE_ACP_CAPABILITY_ENV,
  PRIVATE_PARENT_CAPABILITY_META_KEY
} from "./chunk-7RHAVFGI.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/acp-bridge/src/bridge.ts
init_esbuild_shims();
import { randomBytes, randomUUID } from "node:crypto";
import * as path2 from "node:path";
import { inspect } from "node:util";

// packages/acp-bridge/src/compactionEngine.ts
init_esbuild_shims();
var TURN_BOUNDARY_TYPES = /* @__PURE__ */ new Set(["turn_complete", "turn_error"]);
var TRANSIENT_TYPES = /* @__PURE__ */ new Set([
  "history_truncated",
  "slow_client_warning",
  "client_evicted",
  "replay_complete",
  "stream_error"
]);
var LATEST_WINS_UPDATES = /* @__PURE__ */ new Set([
  "available_commands_update",
  "current_mode_update"
]);
var REPLAY_SEGMENT_COMPACT_THRESHOLD = 64;
var LIVE_JOURNAL_TEXT_CHUNKS_PER_EVENT = 256;
function createLiveJournalState() {
  return {
    entries: [],
    entryBytes: [],
    entryEvents: [],
    totalBytes: 0,
    totalEvents: 0,
    truncatedEvents: 0
  };
}
__name(createLiveJournalState, "createLiveJournalState");
function replayRecordId(event) {
  if (event.type !== "session_update") return void 0;
  const data = event.data;
  if (!data || typeof data !== "object" || Array.isArray(data))
    return void 0;
  const update = data["update"];
  if (!update || typeof update !== "object" || Array.isArray(update)) {
    return void 0;
  }
  const meta = update["_meta"];
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    return void 0;
  }
  const recordId = meta["qwen.session.recordId"];
  return typeof recordId === "string" ? recordId : void 0;
}
__name(replayRecordId, "replayRecordId");
function lastRecordIdIn(events) {
  for (let i = events.length - 1; i >= 0; i--) {
    const id = replayRecordId(events[i]);
    if (id !== void 0) return id;
  }
  return void 0;
}
__name(lastRecordIdIn, "lastRecordIdIn");
function lastSummaryRecordIdIn(events) {
  for (let i = events.length - 1; i >= 0; i--) {
    if (!isSummaryLiveJournalEvent(events[i])) continue;
    const id = replayRecordId(events[i]);
    if (id !== void 0) return id;
  }
  return void 0;
}
__name(lastSummaryRecordIdIn, "lastSummaryRecordIdIn");
var JOURNAL_GROWTH_REASK_INTERVAL_MS = 1e4;
var JOURNAL_GROWTH_MAX_GRANTS_PER_BREACH = 64;
var TurnBoundaryCompactionEngine = class {
  static {
    __name(this, "TurnBoundaryCompactionEngine");
  }
  maxReplayBytes;
  // Mutable: adaptive growth (see `maybeGrowJournalLimits`) raises these
  // in place when the advisor grants headroom.
  maxJournalEvents;
  maxJournalBytes;
  onJournalGrowth;
  now;
  journalGrowthDeniedAt;
  onReplayWindowEviction;
  replaySegments = [];
  replaySegmentStart = 0;
  replayBytes = 0;
  fullJournal = createLiveJournalState();
  summaryJournal = createLiveJournalState();
  lastEventId = 0;
  closed = false;
  truncatedEvents = 0;
  truncatedTurns = 0;
  // Most recent `qwen.session.recordId` observed on an ingested or seeded
  // `session_update`. Surfaced on the `history_truncated` marker emitted by
  // `snapshot()` so clients that lost every turn-boundary event from their
  // retained window (e.g. a live-journal truncation during a single long
  // in-flight turn) still have an anchor for `beforeRecordId` transcript
  // pagination. Undefined until at least one recordId has been observed;
  // omitted from the marker in that case.
  activeRecordId;
  summaryRecordId;
  // Pagination anchor for the replay-path `history_truncated` marker,
  // frozen at the first replay-window eviction. Prefers the first
  // retained recordId (the eviction boundary, so `beforeRecordId`
  // fetches exactly the dropped records with no overlap); falls back to
  // the last dropped recordId when the retained window carries no
  // recordId. Deliberately NOT `activeRecordId` — that one is advanced
  // by `ingest()` on every turn boundary and, when a retained segment
  // carries the last seed recordId, would place the anchor inside the
  // retained window and re-fetch records the client already displays.
  replayAnchorRecordId;
  slots = [];
  toolSlotIndex = /* @__PURE__ */ new Map();
  textSlotIndex = {
    text: /* @__PURE__ */ new Map(),
    thought: /* @__PURE__ */ new Map()
  };
  constructor(opts = {}) {
    this.maxReplayBytes = normalizeCompactedReplayMaxBytes(opts.maxReplayBytes);
    this.maxJournalEvents = normalizeMaxJournalEvents(opts.maxJournalEvents);
    this.maxJournalBytes = normalizeMaxJournalBytes(opts.maxJournalBytes);
    this.onJournalGrowth = opts.onJournalGrowth;
    this.now = opts.now ?? (() => performance.now());
    this.onReplayWindowEviction = opts.onReplayWindowEviction;
  }
  /** Current journal caps — may have grown past the configured baseline. */
  journalLimits() {
    return { maxEvents: this.maxJournalEvents, maxBytes: this.maxJournalBytes };
  }
  ingest(event, byteLength) {
    if (this.closed) return;
    if (event.id !== void 0) {
      this.lastEventId = event.id;
    }
    if (TRANSIENT_TYPES.has(event.type)) return;
    const summaryEvent = isSummaryLiveJournalEvent(event);
    const seenRecordId = replayRecordId(event);
    if (seenRecordId !== void 0) {
      this.activeRecordId = seenRecordId;
      if (summaryEvent) this.summaryRecordId = seenRecordId;
    }
    this.appendLiveJournal(this.fullJournal, event, byteLength);
    if (summaryEvent) {
      this.appendLiveJournal(this.summaryJournal, event, byteLength);
    }
    if (TURN_BOUNDARY_TYPES.has(event.type)) {
      this.compactCurrentTurn(event);
      return;
    }
    if (event.type === "session_update") {
      this.classifySessionUpdate(event);
      return;
    }
    this.slots.push({ kind: "misc", event });
  }
  snapshot(liveReplayMode = "full") {
    const compactedTurns = this.flattenReplaySegments();
    if (this.truncatedEvents > 0) {
      compactedTurns.unshift(
        this.makeHistoryTruncatedEvent(compactedTurns.length)
      );
    }
    return {
      compactedTurns,
      liveJournal: this.liveJournalSnapshot(liveReplayMode),
      lastEventId: this.lastEventId
    };
  }
  /**
   * Snapshot of only the in-flight live journal — the events ingested
   * since the last turn boundary (a boundary folds its turn into the
   * replay window and resets the journal). Cheaper than `snapshot()`:
   * no replay-window flatten.
   */
  liveJournalSnapshot(liveReplayMode = "full") {
    const journal = liveReplayMode === "summary" ? this.summaryJournal : this.fullJournal;
    const journalRecordId = liveReplayMode === "summary" ? this.summaryRecordId : this.activeRecordId;
    const liveJournal = journal.entries.map(
      (entry) => isLiveJournalTextSegment(entry) ? mergeLiveJournalTextEvent(
        entry.firstEvent,
        entry.lastEvent,
        entry.chunks
      ) : entry
    );
    if (journal.truncatedEvents > 0) {
      liveJournal.unshift({
        v: EVENT_SCHEMA_VERSION,
        type: "history_truncated",
        data: {
          reason: "replay_window_exceeded",
          scope: "live_journal",
          truncatedEvents: journal.truncatedEvents,
          retainedEvents: journal.totalEvents,
          maxBytes: this.maxJournalBytes,
          maxEvents: this.maxJournalEvents,
          // Pagination anchor — see makeHistoryTruncatedEvent.
          ...journalRecordId !== void 0 ? { recordId: journalRecordId } : {},
          fullTranscriptAvailable: true
        }
      });
    }
    return liveJournal;
  }
  seed(snapshot) {
    if (this.closed) return;
    this.resetReplayWindow();
    this.lastEventId = snapshot.lastEventId;
    this.activeRecordId = void 0;
    this.summaryRecordId = void 0;
    this.activeRecordId = lastRecordIdIn(snapshot.compactedTurns);
    this.summaryRecordId = lastSummaryRecordIdIn(snapshot.compactedTurns);
    for (const event of snapshot.compactedTurns) {
      if (TRANSIENT_TYPES.has(event.type)) continue;
      this.addReplaySegment([event], 0);
    }
    this.resetJournal();
    this.slots = [];
    this.toolSlotIndex.clear();
    this.clearTextSlotIndex();
  }
  seedReplayEvents(events) {
    if (this.closed) return;
    this.resetReplayWindow();
    this.activeRecordId = void 0;
    this.summaryRecordId = void 0;
    this.activeRecordId = lastRecordIdIn(events);
    this.summaryRecordId = lastSummaryRecordIdIn(events);
    let recordEvents = [];
    let recordId;
    const flushRecord = /* @__PURE__ */ __name(() => {
      this.addReplaySegment(recordEvents, 0);
      recordEvents = [];
      recordId = void 0;
    }, "flushRecord");
    for (const event of events) {
      this.recordLastEventId(event);
      if (TRANSIENT_TYPES.has(event.type)) continue;
      const nextRecordId = replayRecordId(event);
      if (nextRecordId === void 0) {
        flushRecord();
        this.addReplaySegment([event], 0);
        continue;
      }
      if (recordId !== void 0 && recordId !== nextRecordId) {
        flushRecord();
      }
      recordId = nextRecordId;
      recordEvents.push(event);
    }
    flushRecord();
    this.resetJournal();
    this.slots = [];
    this.toolSlotIndex.clear();
    this.clearTextSlotIndex();
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.resetReplayWindow();
    this.resetJournal();
    this.activeRecordId = void 0;
    this.summaryRecordId = void 0;
    this.slots = [];
    this.toolSlotIndex.clear();
    this.clearTextSlotIndex();
  }
  appendLiveJournal(journal, event, byteLength) {
    const bytes = byteLength ?? serializedBridgeEventByteLength(event) ?? 0;
    const textChunk = liveJournalTextChunk(event);
    const current = journal.textSegment;
    const currentIndex = journal.entries.length - 1;
    if (textChunk && current && journal.entries[currentIndex] === current && current.chunks.length < LIVE_JOURNAL_TEXT_CHUNKS_PER_EVENT && journal.entryBytes[currentIndex] + bytes <= this.maxJournalBytes && current.sessionUpdate === textChunk.sessionUpdate && current.parentToolCallId === textChunk.parentToolCallId && stringArraysEqual(current.sourceRecordIds, textChunk.sourceRecordIds) && current.promptId === event.promptId && current.originatorClientId === event.originatorClientId && current.sessionId === captureSessionId(event) && hasOnlyTimestampEnvelopeMeta(current.lastEvent._meta) && hasOnlyTimestampEnvelopeMeta(event._meta)) {
      current.chunks.push(textChunk.text);
      current.lastEvent = event;
      journal.entryBytes[currentIndex] += bytes;
      journal.entryEvents[currentIndex] += 1;
      journal.totalBytes += bytes;
      journal.totalEvents += 1;
    } else {
      let entry = event;
      if (textChunk) {
        const segment = {
          sessionUpdate: textChunk.sessionUpdate,
          chunks: [textChunk.text],
          sourceRecordIds: textChunk.sourceRecordIds,
          parentToolCallId: textChunk.parentToolCallId,
          promptId: event.promptId,
          originatorClientId: event.originatorClientId,
          sessionId: captureSessionId(event),
          firstEvent: event,
          lastEvent: event
        };
        entry = segment;
        journal.textSegment = segment;
      } else {
        journal.textSegment = void 0;
      }
      journal.entries.push(entry);
      journal.entryBytes.push(bytes);
      journal.entryEvents.push(1);
      journal.totalBytes += bytes;
      journal.totalEvents += 1;
    }
    if (!TURN_BOUNDARY_TYPES.has(event.type) && (journal.entries.length > this.maxJournalEvents || journal.totalBytes > this.maxJournalBytes && journal.entries.length > 1)) {
      this.maybeGrowJournalLimits(journal);
    }
    while (journal.entries.length > this.maxJournalEvents || journal.totalBytes > this.maxJournalBytes && journal.entries.length > 1) {
      const dropped = journal.entries.shift();
      journal.totalBytes -= journal.entryBytes.shift() ?? 0;
      const droppedEvents = journal.entryEvents.shift() ?? 0;
      journal.totalEvents -= droppedEvents;
      journal.truncatedEvents += droppedEvents;
      if (dropped === journal.textSegment) {
        journal.textSegment = void 0;
      }
    }
  }
  /**
   * Consults the growth advisor once the journal breaches its caps and
   * applies a grant in place, so the eviction loop below only drops what
   * still exceeds the (possibly raised) caps. An intermediate grant that
   * does not yet retain an extra entry is still applied tentatively —
   * each applied cap is what the next ask reports and is charged for —
   * and the walk continues until a grant retains strictly more than the
   * pre-breach caps, the advisor refuses, or the step budget runs out. A
   * walk that never improves retention rolls back to the original caps
   * and counts as a refusal, so the pool is never charged for growth that
   * preserves no replay. Never throws: a misbehaving advisor degrades to
   * plain eviction, matching the engine's best-effort contract.
   */
  maybeGrowJournalLimits(journal) {
    const advisor = this.onJournalGrowth;
    if (!advisor || this.closed) return;
    const now = this.now();
    if (this.journalGrowthDeniedAt !== void 0) {
      const sinceDenialMs = now - this.journalGrowthDeniedAt;
      if (sinceDenialMs >= 0 && sinceDenialMs < JOURNAL_GROWTH_REASK_INTERVAL_MS) {
        return;
      }
    }
    const originalEvents = this.maxJournalEvents;
    const originalBytes = this.maxJournalBytes;
    const originalRetained = this.retainedTailCount(
      journal,
      originalEvents,
      originalBytes
    );
    for (let step = 0; step < JOURNAL_GROWTH_MAX_GRANTS_PER_BREACH; step++) {
      let grant;
      try {
        grant = advisor({
          maxEvents: this.maxJournalEvents,
          maxBytes: this.maxJournalBytes
        });
      } catch {
        grant = void 0;
      }
      if (!grant || !Number.isSafeInteger(grant.maxBytes) || !Number.isSafeInteger(grant.maxEvents) || grant.maxBytes <= this.maxJournalBytes || grant.maxEvents < this.maxJournalEvents) {
        break;
      }
      this.maxJournalBytes = grant.maxBytes;
      this.maxJournalEvents = grant.maxEvents;
      if (this.retainedTailCount(journal, grant.maxEvents, grant.maxBytes) > originalRetained) {
        this.journalGrowthDeniedAt = void 0;
        return;
      }
    }
    this.maxJournalEvents = originalEvents;
    this.maxJournalBytes = originalBytes;
    this.journalGrowthDeniedAt = now;
  }
  /** Entries of the newest-first tail the eviction loop would retain. */
  retainedTailCount(journal, maxEvents, maxBytes) {
    let count = 0;
    let bytes = 0;
    for (let i = journal.entries.length - 1; i >= 0; i--) {
      const entryBytes = journal.entryBytes[i] ?? 0;
      if (count + 1 > maxEvents) break;
      if (count >= 1 && bytes + entryBytes > maxBytes) break;
      count += 1;
      bytes += entryBytes;
    }
    return count;
  }
  classifySessionUpdate(event) {
    const data = event.data;
    const updateType = data?.update?.sessionUpdate;
    if (!updateType) {
      this.slots.push({ kind: "misc", event });
      return;
    }
    switch (updateType) {
      case "agent_message_chunk": {
        if (hasDiscreteMessageMeta(data?.update?._meta)) {
          this.slots.push({ kind: "misc", event });
          break;
        }
        this.mergeTextSlot("text", event, data);
        break;
      }
      case "agent_thought_chunk": {
        if (hasDiscreteMessageMeta(data?.update?._meta)) {
          this.slots.push({ kind: "misc", event });
          break;
        }
        this.mergeTextSlot("thought", event, data);
        break;
      }
      case "tool_call":
      case "tool_call_update": {
        const toolCallId = data?.update?.toolCallId;
        if (!toolCallId) {
          this.slots.push({ kind: "misc", event });
          break;
        }
        const existingIdx = this.toolSlotIndex.get(toolCallId);
        if (existingIdx !== void 0) {
          const slot = this.slots[existingIdx];
          slot.event = mergeToolCallEvent(slot.event, event);
        } else {
          const normalizedEvent = normalizeToolCallType(event);
          this.toolSlotIndex.set(toolCallId, this.slots.length);
          this.slots.push({
            kind: "tool",
            toolCallId,
            event: normalizedEvent
          });
          const toolParent = extractParentToolCallIdFromMeta(
            data?.update?._meta
          );
          if (toolParent) {
            this.textSlotIndex.text.delete(toolParent);
            this.textSlotIndex.thought.delete(toolParent);
          }
        }
        break;
      }
      default: {
        if (LATEST_WINS_UPDATES.has(updateType)) {
          const existingIdx = this.slots.findIndex(
            (s) => s.kind === "latestWins" && s.key === updateType
          );
          if (existingIdx !== -1) {
            this.slots[existingIdx].event = event;
          } else {
            this.slots.push({ kind: "latestWins", key: updateType, event });
          }
        } else {
          this.slots.push({ kind: "misc", event });
        }
        break;
      }
    }
  }
  mergeTextSlot(kind, event, data) {
    const text = data?.update?.content?.text ?? "";
    const meta = data?.update?._meta;
    const parentToolCallId = extractParentToolCallIdFromMeta(meta);
    const sourceRecordIds = extractSourceRecordIdsFromMeta(meta);
    if (parentToolCallId != null) {
      const entries = this.textSlotIndex[kind].get(parentToolCallId) ?? [];
      const existingIdx = entries.find(
        (entry) => stringArraysEqual(entry.sourceRecordIds, sourceRecordIds)
      )?.index;
      if (existingIdx !== void 0) {
        const slot = this.slots[existingIdx];
        slot.chunks.push(text);
        if (event.id !== void 0) slot.lastEventId = event.id;
        slot.lastMeta = mergeTranscriptUpdateMeta(slot.lastMeta, meta);
        slot.lastEnvelopeMeta = event._meta ?? slot.lastEnvelopeMeta;
        slot.lastTurn = captureTurnFields(event, slot.lastTurn);
        slot.lastSessionId = captureSessionId(event) ?? slot.lastSessionId;
      } else {
        entries.push({ sourceRecordIds, index: this.slots.length });
        this.textSlotIndex[kind].set(parentToolCallId, entries);
        this.slots.push({
          kind,
          parentToolCallId,
          chunks: [text],
          sourceRecordIds,
          lastEventId: event.id ?? 0,
          lastMeta: meta,
          lastEnvelopeMeta: event._meta,
          lastTurn: captureTurnFields(event),
          lastSessionId: captureSessionId(event)
        });
      }
    } else {
      const lastSlot = this.slots[this.slots.length - 1];
      if (lastSlot && lastSlot.kind === kind && lastSlot.parentToolCallId == null && stringArraysEqual(lastSlot.sourceRecordIds, sourceRecordIds)) {
        lastSlot.chunks.push(text);
        if (event.id !== void 0) lastSlot.lastEventId = event.id;
        lastSlot.lastMeta = mergeTranscriptUpdateMeta(lastSlot.lastMeta, meta);
        lastSlot.lastEnvelopeMeta = event._meta ?? lastSlot.lastEnvelopeMeta;
        lastSlot.lastTurn = captureTurnFields(event, lastSlot.lastTurn);
        lastSlot.lastSessionId = captureSessionId(event) ?? lastSlot.lastSessionId;
      } else {
        this.slots.push({
          kind,
          parentToolCallId: void 0,
          chunks: [text],
          sourceRecordIds,
          lastEventId: event.id ?? 0,
          lastMeta: meta,
          lastEnvelopeMeta: event._meta,
          lastTurn: captureTurnFields(event),
          lastSessionId: captureSessionId(event)
        });
      }
    }
  }
  compactCurrentTurn(boundaryEvent) {
    const compacted = [];
    for (const slot of this.slots) {
      switch (slot.kind) {
        case "text":
        case "thought":
          compacted.push(
            makeMergedSessionUpdateEvent(
              slot.kind === "text" ? "agent_message_chunk" : "agent_thought_chunk",
              slot.chunks.join(""),
              slot.lastEventId,
              slot.lastMeta,
              slot.lastEnvelopeMeta,
              slot.lastTurn,
              slot.lastSessionId
            )
          );
          break;
        case "tool":
        case "misc":
        case "latestWins":
          compacted.push(slot.event);
          break;
        default:
          break;
      }
    }
    compacted.push(boundaryEvent);
    this.addReplaySegment(compacted, 1);
    this.resetJournal();
    this.slots = [];
    this.toolSlotIndex.clear();
    this.clearTextSlotIndex();
  }
  recordLastEventId(event) {
    if (event.id !== void 0) {
      this.lastEventId = event.id;
    }
  }
  resetJournal() {
    this.fullJournal = createLiveJournalState();
    this.summaryJournal = createLiveJournalState();
    this.journalGrowthDeniedAt = void 0;
  }
  addReplaySegment(events, turnCount) {
    if (events.length === 0) return;
    const bytes = events.reduce(
      // Live events passed the publish-time serializability gate, but the
      // seed paths (persisted transcripts) bypass it — log a diagnostic
      // and count 0 so a single unserializable record can't wedge the
      // replay-window accounting.
      (sum, event) => {
        const size = serializedBridgeEventByteLength(event);
        if (size === void 0) {
          logEventSizingFailed(event.type);
          return sum;
        }
        return sum + size;
      },
      0
    );
    this.replaySegments.push({ events: events.slice(), bytes, turnCount });
    this.replayBytes += bytes;
    this.enforceReplayWindow();
  }
  enforceReplayWindow() {
    let droppedSegmentCount = 0;
    let droppedBytes = 0;
    let droppedEvents = 0;
    let droppedTurns = 0;
    let lastDroppedRecordId;
    while (this.replayBytes > this.maxReplayBytes && this.activeReplaySegmentCount() > 1) {
      const dropped = this.replaySegments[this.replaySegmentStart];
      this.replaySegmentStart += 1;
      droppedSegmentCount += 1;
      droppedBytes += dropped.bytes;
      droppedEvents += dropped.events.length;
      droppedTurns += dropped.turnCount;
      this.replayBytes -= dropped.bytes;
      this.truncatedEvents += dropped.events.length;
      this.truncatedTurns += dropped.turnCount;
      const droppedRecordId = lastRecordIdIn(dropped.events);
      if (droppedRecordId !== void 0) {
        lastDroppedRecordId = droppedRecordId;
      }
    }
    if (droppedSegmentCount > 0) {
      this.replayAnchorRecordId ??= this.firstRetainedReplayRecordId() ?? lastDroppedRecordId;
      this.compactReplaySegmentQueueIfNeeded();
      this.notifyReplayWindowEviction({
        droppedBytes,
        droppedEvents,
        droppedSegments: droppedSegmentCount,
        droppedTurns,
        maxBytes: this.maxReplayBytes,
        retainedBytes: this.replayBytes,
        retainedEvents: this.flattenReplaySegments().length
      });
    }
  }
  firstRetainedReplayRecordId() {
    for (let i = this.replaySegmentStart; i < this.replaySegments.length; i++) {
      const recordId = lastRecordIdIn(this.replaySegments[i].events);
      if (recordId !== void 0) return recordId;
    }
    return void 0;
  }
  flattenReplaySegments() {
    return this.replaySegments.slice(this.replaySegmentStart).flatMap((segment) => segment.events);
  }
  activeReplaySegmentCount() {
    return this.replaySegments.length - this.replaySegmentStart;
  }
  compactReplaySegmentQueueIfNeeded() {
    if (this.replaySegmentStart < REPLAY_SEGMENT_COMPACT_THRESHOLD) return;
    this.replaySegments.splice(0, this.replaySegmentStart);
    this.replaySegmentStart = 0;
  }
  notifyReplayWindowEviction(eviction) {
    try {
      this.onReplayWindowEviction?.(eviction);
    } catch {
    }
  }
  makeHistoryTruncatedEvent(retainedEvents) {
    return {
      v: EVENT_SCHEMA_VERSION,
      type: "history_truncated",
      data: {
        reason: "replay_window_exceeded",
        truncatedEvents: this.truncatedEvents,
        retainedEvents,
        maxBytes: this.maxReplayBytes,
        ...this.truncatedTurns > 0 ? { truncatedTurns: this.truncatedTurns } : {},
        // Pagination anchor for clients whose retained window lost every
        // turn-boundary event (e.g. live-journal truncation during one
        // long in-flight turn). Uses the eviction-time anchor, not
        // `activeRecordId`, so a post-seed `ingest()` can't push it past
        // records the client already displays. Undefined when no recordId
        // was observed before the first eviction — the field is
        // intentionally omitted in that case so old clients continue to
        // validate the marker shape.
        ...this.replayAnchorRecordId !== void 0 ? { recordId: this.replayAnchorRecordId } : {},
        fullTranscriptAvailable: true
      }
    };
  }
  resetReplayWindow() {
    this.replaySegments = [];
    this.replaySegmentStart = 0;
    this.replayBytes = 0;
    this.truncatedEvents = 0;
    this.truncatedTurns = 0;
    this.replayAnchorRecordId = void 0;
  }
  clearTextSlotIndex() {
    this.textSlotIndex.text.clear();
    this.textSlotIndex.thought.clear();
  }
};
function isLiveJournalTextSegment(entry) {
  return "firstEvent" in entry;
}
__name(isLiveJournalTextSegment, "isLiveJournalTextSegment");
function liveJournalTextChunk(event) {
  if (event.type !== "session_update") return void 0;
  const data = event.data;
  const sessionUpdate = data?.update?.sessionUpdate;
  if (sessionUpdate !== "agent_message_chunk" && sessionUpdate !== "agent_thought_chunk") {
    return void 0;
  }
  if (!hasOnlyModeledChunkKeys(data)) {
    return void 0;
  }
  if (hasDiscreteMessageMeta(data?.update?._meta) || hasUnmodeledTextMeta(data?.update?._meta)) {
    return void 0;
  }
  const content = data?.update?.content;
  if (content?.type !== "text" || typeof content.text !== "string") {
    return void 0;
  }
  return {
    sessionUpdate,
    text: content.text,
    sourceRecordIds: extractSourceRecordIdsFromMeta(data?.update?._meta),
    parentToolCallId: extractParentToolCallIdFromMeta(data?.update?._meta)
  };
}
__name(liveJournalTextChunk, "liveJournalTextChunk");
function hasOnlyModeledChunkKeys(data) {
  if (!data || !data.update) return false;
  const content = data.update.content;
  return Object.keys(data).every((key) => key === "sessionId" || key === "update") && Object.keys(data.update).every(
    (key) => key === "sessionUpdate" || key === "content" || key === "_meta"
  ) && (content === void 0 || typeof content === "object" && content !== null && Object.keys(content).every((key) => key === "type" || key === "text"));
}
__name(hasOnlyModeledChunkKeys, "hasOnlyModeledChunkKeys");
function mergeLiveJournalTextEvent(existing, incoming, chunks) {
  const existingData = existing.data;
  const incomingData = incoming.data;
  return {
    ...existing,
    ...incoming,
    data: {
      ...existingData,
      ...incomingData,
      update: {
        ...existingData.update,
        ...incomingData.update,
        content: { type: "text", text: chunks.join("") }
      }
    }
  };
}
__name(mergeLiveJournalTextEvent, "mergeLiveJournalTextEvent");
function makeMergedSessionUpdateEvent(sessionUpdate, text, eventId, meta, envelopeMeta, turn, sessionId) {
  return {
    id: eventId || void 0,
    v: EVENT_SCHEMA_VERSION,
    type: "session_update",
    // Re-stamp prompt/originator attribution captured from the source
    // chunks — clients rebuilding state from a compacted snapshot need
    // them for prompt correlation and originator filtering. Present only
    // when the source events carried them ("present only if set" style).
    ...turn?.promptId !== void 0 ? { promptId: turn.promptId } : {},
    ...turn?.originatorClientId !== void 0 ? { originatorClientId: turn.originatorClientId } : {},
    ...envelopeMeta !== void 0 ? { _meta: envelopeMeta } : {},
    data: {
      ...sessionId !== void 0 ? { sessionId } : {},
      update: {
        sessionUpdate,
        content: { type: "text", text },
        ...meta != null ? { _meta: meta } : {}
      }
    }
  };
}
__name(makeMergedSessionUpdateEvent, "makeMergedSessionUpdateEvent");
function captureTurnFields(event, previous) {
  const promptId = event.promptId ?? previous?.promptId;
  const originatorClientId = event.originatorClientId ?? previous?.originatorClientId;
  if (promptId === void 0 && originatorClientId === void 0) {
    return void 0;
  }
  return {
    ...promptId !== void 0 ? { promptId } : {},
    ...originatorClientId !== void 0 ? { originatorClientId } : {}
  };
}
__name(captureTurnFields, "captureTurnFields");
function captureSessionId(event) {
  const sessionId = event.data?.sessionId;
  return typeof sessionId === "string" ? sessionId : void 0;
}
__name(captureSessionId, "captureSessionId");
function normalizeToolCallType(event) {
  const data = event.data;
  if (data?.update?.sessionUpdate === "tool_call_update") {
    return {
      ...event,
      data: {
        ...data,
        update: { ...data.update, sessionUpdate: "tool_call" }
      }
    };
  }
  return event;
}
__name(normalizeToolCallType, "normalizeToolCallType");
function extractParentToolCallIdFromMeta(meta) {
  if (typeof meta === "object" && meta !== null) {
    const val = meta["parentToolCallId"];
    return typeof val === "string" && val.length > 0 ? val : void 0;
  }
  return void 0;
}
__name(extractParentToolCallIdFromMeta, "extractParentToolCallIdFromMeta");
function isSummaryLiveJournalEvent(event) {
  if (event.type !== "session_update") return true;
  const data = event.data;
  const meta = data?.update?._meta;
  const parentToolCallId = extractParentToolCallIdFromMeta(meta);
  if (parentToolCallId === void 0) return true;
  if (parentToolCallId === data?.update?.toolCallId) return true;
  if (data?.update?.sessionUpdate !== "agent_message_chunk") return false;
  if (typeof meta !== "object" || meta === null) return false;
  const usage = meta["usage"];
  if (typeof usage !== "object" || usage === null) return false;
  const fields = usage;
  return typeof fields["inputTokens"] === "number" || typeof fields["outputTokens"] === "number";
}
__name(isSummaryLiveJournalEvent, "isSummaryLiveJournalEvent");
function extractSourceRecordIdsFromMeta(meta) {
  if (typeof meta !== "object" || meta === null) return void 0;
  const transcript = meta["qwenTranscript"];
  if (typeof transcript !== "object" || transcript === null) return void 0;
  const ids = transcript["sourceRecordIds"];
  if (!Array.isArray(ids)) return void 0;
  const normalized = [
    ...new Set(ids.filter((id) => typeof id === "string"))
  ];
  return normalized.length > 0 ? normalized : void 0;
}
__name(extractSourceRecordIdsFromMeta, "extractSourceRecordIdsFromMeta");
function stringArraysEqual(left, right) {
  if (left === right) return true;
  if (!left || !right || left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}
__name(stringArraysEqual, "stringArraysEqual");
function hasDiscreteMessageMeta(meta) {
  return typeof meta === "object" && meta !== null && meta["qwenDiscreteMessage"] === true;
}
__name(hasDiscreteMessageMeta, "hasDiscreteMessageMeta");
function hasOnlyTimestampEnvelopeMeta(meta) {
  if (meta === void 0) return true;
  if (typeof meta !== "object" || meta === null) return false;
  return Object.keys(meta).every(
    (key) => key === "timestamp" || key === "serverTimestamp"
  );
}
__name(hasOnlyTimestampEnvelopeMeta, "hasOnlyTimestampEnvelopeMeta");
function hasUnmodeledTextMeta(meta) {
  if (meta === void 0) return false;
  if (typeof meta !== "object" || meta === null) return true;
  const record = meta;
  for (const [key, value] of Object.entries(record)) {
    if (key === "timestamp" || key === "serverTimestamp") {
      continue;
    }
    if (key === "parentToolCallId") {
      if (typeof value !== "string") return true;
      continue;
    }
    if (key === "subagentType") {
      if (typeof value !== "string") return true;
      continue;
    }
    if (key === "qwenTranscript") {
      if (typeof value !== "object" || value === null) return true;
      const transcript = value;
      for (const [field, fieldValue] of Object.entries(transcript)) {
        if (field === "sourceRecordIds") {
          if (!Array.isArray(fieldValue) || fieldValue.some((id) => typeof id !== "string")) {
            return true;
          }
          continue;
        }
        if (field === "planToolCallId") {
          if (typeof fieldValue !== "string") return true;
          continue;
        }
        return true;
      }
      continue;
    }
    return true;
  }
  return false;
}
__name(hasUnmodeledTextMeta, "hasUnmodeledTextMeta");
function mergeToolCallEvent(existing, incoming) {
  const existingData = existing.data;
  const incomingData = incoming.data;
  const existingUpdate = existingData?.update ?? {};
  const incomingUpdate = incomingData?.update ?? {};
  const merged = { ...existingUpdate };
  for (const [key, value] of Object.entries(incomingUpdate)) {
    if (value !== void 0 && value !== null) {
      merged[key] = value;
    }
  }
  const updateMeta = mergeTranscriptUpdateMeta(
    existingUpdate["_meta"],
    incomingUpdate["_meta"]
  );
  if (updateMeta !== void 0) merged["_meta"] = updateMeta;
  merged["sessionUpdate"] = "tool_call";
  const mergedMeta = existing._meta || incoming._meta ? { ...existing._meta ?? {}, ...incoming._meta ?? {} } : void 0;
  const promptId = incoming.promptId ?? existing.promptId;
  const originatorClientId = incoming.originatorClientId ?? existing.originatorClientId;
  return {
    id: incoming.id ?? existing.id,
    v: EVENT_SCHEMA_VERSION,
    type: "session_update",
    ...promptId !== void 0 ? { promptId } : {},
    ...originatorClientId !== void 0 ? { originatorClientId } : {},
    ...mergedMeta ? { _meta: mergedMeta } : {},
    data: {
      ...existingData,
      ...incomingData,
      update: merged
    }
  };
}
__name(mergeToolCallEvent, "mergeToolCallEvent");
function mergeTranscriptUpdateMeta(existing, incoming) {
  const existingRecord = typeof existing === "object" && existing !== null ? existing : void 0;
  const incomingRecord = typeof incoming === "object" && incoming !== null ? incoming : void 0;
  if (!existingRecord && !incomingRecord) return void 0;
  const sourceRecordIds = [
    .../* @__PURE__ */ new Set([
      ...extractSourceRecordIdsFromMeta(existingRecord) ?? [],
      ...extractSourceRecordIdsFromMeta(incomingRecord) ?? []
    ])
  ];
  const existingTranscript = extractTranscriptMeta(existingRecord);
  const incomingTranscript = extractTranscriptMeta(incomingRecord);
  return {
    ...existingRecord ?? {},
    ...incomingRecord ?? {},
    ...existingTranscript || incomingTranscript || sourceRecordIds.length > 0 ? {
      qwenTranscript: {
        ...existingTranscript ?? {},
        ...incomingTranscript ?? {},
        ...sourceRecordIds.length > 0 ? { sourceRecordIds } : {}
      }
    } : {}
  };
}
__name(mergeTranscriptUpdateMeta, "mergeTranscriptUpdateMeta");
function extractTranscriptMeta(meta) {
  const transcript = meta?.["qwenTranscript"];
  return typeof transcript === "object" && transcript !== null ? transcript : void 0;
}
__name(extractTranscriptMeta, "extractTranscriptMeta");

// packages/acp-bridge/src/journalGrowthPolicy.ts
init_esbuild_shims();
function createJournalGrowthPolicy(opts) {
  const hardCapEvents = Math.min(
    Number.MAX_SAFE_INTEGER,
    Math.max(
      opts.baselineEvents,
      Math.ceil(opts.hardCapBytes / opts.baselineBytes * opts.baselineEvents)
    )
  );
  return {
    grant(request) {
      if (request.currentMaxBytes >= opts.hardCapBytes) return void 0;
      const extraGranted = request.allSessionLimits.reduce(
        (sum, session) => sum + Math.max(0, session.limitBytes - session.baselineBytes),
        0
      );
      const available = opts.poolBytes - extraGranted;
      if (available <= 0) return void 0;
      const maxBytes = Math.min(
        request.currentMaxBytes * 2,
        request.currentMaxBytes + available,
        opts.hardCapBytes
      );
      if (maxBytes <= request.currentMaxBytes) return void 0;
      const maxEvents = Math.min(
        Math.max(
          request.currentMaxEvents,
          Math.ceil(maxBytes / opts.baselineBytes * opts.baselineEvents)
        ),
        hardCapEvents
      );
      return { maxBytes, maxEvents };
    }
  };
}
__name(createJournalGrowthPolicy, "createJournalGrowthPolicy");

// packages/acp-bridge/src/session-restore-timeout.ts
init_esbuild_shims();
var DEFAULT_SESSION_RESTORE_TIMEOUT_MS = 6e4;
var MAX_SESSION_RESTORE_TIMEOUT_MS = 2147483647;
var MIN_RESTORE_RETRY_AFTER_SECONDS = 5;
var MAX_RESTORE_RETRY_AFTER_SECONDS = 120;
function restoreRetryAfterSeconds(timeoutMs) {
  return Math.min(
    MAX_RESTORE_RETRY_AFTER_SECONDS,
    Math.max(MIN_RESTORE_RETRY_AFTER_SECONDS, Math.ceil(timeoutMs / 1e3))
  );
}
__name(restoreRetryAfterSeconds, "restoreRetryAfterSeconds");
function assertValidTimeoutMs(field, timeoutMs) {
  if (!Number.isFinite(timeoutMs) || !Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > MAX_SESSION_RESTORE_TIMEOUT_MS) {
    throw new TypeError(
      `Invalid ${field}: ${timeoutMs}. Must be a positive integer no greater than ${MAX_SESSION_RESTORE_TIMEOUT_MS}.`
    );
  }
}
__name(assertValidTimeoutMs, "assertValidTimeoutMs");
function resolveSessionRestoreTimeoutMs(opts) {
  if (opts.sessionRestoreTimeoutMs !== void 0) {
    assertValidTimeoutMs(
      "sessionRestoreTimeoutMs",
      opts.sessionRestoreTimeoutMs
    );
    return opts.sessionRestoreTimeoutMs;
  }
  if (opts.initializeTimeoutMs !== void 0) {
    assertValidTimeoutMs("initializeTimeoutMs", opts.initializeTimeoutMs);
    return Math.max(
      opts.initializeTimeoutMs,
      DEFAULT_SESSION_RESTORE_TIMEOUT_MS
    );
  }
  return DEFAULT_SESSION_RESTORE_TIMEOUT_MS;
}
__name(resolveSessionRestoreTimeoutMs, "resolveSessionRestoreTimeoutMs");

// packages/acp-bridge/src/session-source.ts
init_esbuild_shims();
var SESSION_SOURCE_META_KEY = "qwen.session.source";
var SESSION_SOURCE_TYPE_PATTERN = /^[a-z][a-z0-9_-]{0,63}$/;
var MAX_SESSION_SOURCE_ID_LENGTH = 256;
var STANDALONE_SESSION_SOURCE_TYPE = "standalone";
var DAEMON_OWNED_STANDALONE_CREATION_KEY = "daemonOwnedStandaloneCreation";
function isReservedStandaloneSessionSourceType(sourceType) {
  return sourceType === STANDALONE_SESSION_SOURCE_TYPE;
}
__name(isReservedStandaloneSessionSourceType, "isReservedStandaloneSessionSourceType");
function parseSessionSource(sourceType, sourceId) {
  if (sourceType === void 0 && sourceId === void 0) return {};
  if (typeof sourceType !== "string" || !SESSION_SOURCE_TYPE_PATTERN.test(sourceType)) {
    return {
      error: "`sourceType` must match [a-z][a-z0-9_-]{0,63} when provided"
    };
  }
  if (sourceId === void 0) return { sourceType };
  if (typeof sourceId !== "string" || sourceId.length === 0 || sourceId.length > MAX_SESSION_SOURCE_ID_LENGTH || [...sourceId].some((character) => {
    const code = character.charCodeAt(0);
    return code <= 31 || code === 127;
  })) {
    return {
      error: `\`sourceId\` must be a non-empty string of at most ${MAX_SESSION_SOURCE_ID_LENGTH} characters without control characters`
    };
  }
  return { sourceType, sourceId };
}
__name(parseSessionSource, "parseSessionSource");

// packages/acp-bridge/src/channel-liveness.ts
init_esbuild_shims();
import { performance as performance2 } from "node:perf_hooks";
var CHANNEL_LIVENESS_INTERVAL_MS = 15e3;
var CHANNEL_LIVENESS_PROBE_TIMEOUT_MS = 1e4;
var CHANNEL_LIVENESS_FAILURE_THRESHOLD = 2;
var CHANNEL_LIVENESS_TIMER_LATE_TOLERANCE_MS = 1e3;
var CHANNEL_LIVENESS_TIMEOUT_CODE = "acp_channel_liveness_timeout";
var CHANNEL_LIVENESS_PROTOCOL_ERROR_CODE = "acp_channel_liveness_protocol_error";
var ChannelLivenessFailure = class extends Error {
  constructor(code) {
    super(
      code === CHANNEL_LIVENESS_TIMEOUT_CODE ? "ACP channel failed consecutive liveness probes" : "ACP channel returned an invalid liveness response"
    );
    this.code = code;
    this.name = "ChannelLivenessFailure";
  }
  static {
    __name(this, "ChannelLivenessFailure");
  }
};
function isValidResponse(response, nonce) {
  return typeof response === "object" && response !== null && !Array.isArray(response) && response["v"] === CHANNEL_LIVENESS_VERSION && response["nonce"] === nonce;
}
__name(isValidResponse, "isValidResponse");
function startChannelLivenessMonitor(options) {
  const now = options.now ?? (() => performance2.now());
  let stopped = false;
  let timer;
  let consecutiveTimeouts = 0;
  let nextNonce = 0;
  let resolveStopped;
  const stoppedOutcome = new Promise((resolve) => {
    resolveStopped = resolve;
  });
  const isActive = /* @__PURE__ */ __name(() => !stopped && options.isActive(), "isActive");
  const stop = /* @__PURE__ */ __name(() => {
    stopped = true;
    if (timer !== void 0) {
      clearTimeout(timer);
      timer = void 0;
    }
    resolveStopped({ kind: "stopped" });
  }, "stop");
  const fail = /* @__PURE__ */ __name((error) => {
    if (!isActive()) return;
    stop();
    options.onFailure(error);
  }, "fail");
  const timerWasLate = /* @__PURE__ */ __name((expectedAt) => now() > expectedAt + CHANNEL_LIVENESS_TIMER_LATE_TOLERANCE_MS, "timerWasLate");
  const runProbe = /* @__PURE__ */ __name(async () => {
    if (!isActive()) return;
    const nonce = nextNonce;
    nextNonce = nonce === Number.MAX_SAFE_INTEGER ? 0 : Math.max(0, nonce + 1);
    const response = Promise.resolve().then(() => options.probe(nonce)).then(
      (value) => ({ kind: "response", response: value }),
      () => ({ kind: "rejected" })
    );
    let outcome;
    while (true) {
      const expectedAt = now() + CHANNEL_LIVENESS_PROBE_TIMEOUT_MS;
      const timeout = new Promise((resolve) => {
        timer = setTimeout(() => {
          timer = void 0;
          resolve(
            timerWasLate(expectedAt) ? { kind: "local_delay" } : { kind: "timeout" }
          );
        }, CHANNEL_LIVENESS_PROBE_TIMEOUT_MS);
        timer.unref();
      });
      outcome = await Promise.race([response, timeout, stoppedOutcome]);
      if (timer !== void 0) {
        clearTimeout(timer);
        timer = void 0;
      }
      if (outcome.kind === "stopped" || !isActive()) return;
      if (outcome.kind !== "local_delay") break;
      consecutiveTimeouts = 0;
    }
    if (outcome.kind === "response") {
      if (!isValidResponse(outcome.response, nonce)) {
        fail(new ChannelLivenessFailure(CHANNEL_LIVENESS_PROTOCOL_ERROR_CODE));
        return;
      }
      consecutiveTimeouts = 0;
      schedule(CHANNEL_LIVENESS_INTERVAL_MS);
      return;
    }
    if (outcome.kind === "rejected") {
      await Promise.resolve();
      fail(new ChannelLivenessFailure(CHANNEL_LIVENESS_PROTOCOL_ERROR_CODE));
      return;
    }
    consecutiveTimeouts++;
    if (consecutiveTimeouts >= CHANNEL_LIVENESS_FAILURE_THRESHOLD) {
      fail(new ChannelLivenessFailure(CHANNEL_LIVENESS_TIMEOUT_CODE));
      return;
    }
    void runProbe();
  }, "runProbe");
  function schedule(delayMs) {
    if (!isActive()) return;
    const expectedAt = now() + delayMs;
    timer = setTimeout(() => {
      timer = void 0;
      if (!isActive()) return;
      if (timerWasLate(expectedAt)) {
        consecutiveTimeouts = 0;
        schedule(CHANNEL_LIVENESS_INTERVAL_MS);
        return;
      }
      void runProbe();
    }, delayMs);
    timer.unref();
  }
  __name(schedule, "schedule");
  schedule(CHANNEL_LIVENESS_INTERVAL_MS);
  return { stop };
}
__name(startChannelLivenessMonitor, "startChannelLivenessMonitor");

// packages/acp-bridge/src/channel-startup-profile.ts
init_esbuild_shims();
var MAX_PROFILE_DURATION_MS = 6e5;
var ATTRIBUTE_PREFIX = "qwen-code.daemon.acp_startup";
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
__name(isRecord, "isRecord");
function readDuration(source, key) {
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= MAX_PROFILE_DURATION_MS ? value : void 0;
}
__name(readDuration, "readDuration");
function readDurations(source, keys) {
  if (!isRecord(source)) {
    return { values: {}, complete: false };
  }
  const values = {};
  let complete = true;
  for (const key of keys) {
    const value = readDuration(source, key);
    if (value === void 0) {
      complete = false;
    } else {
      values[key] = value;
    }
  }
  return { values, complete };
}
__name(readDurations, "readDurations");
function addDurationAttributes(attributes, group, values) {
  for (const [key, value] of Object.entries(values)) {
    if (group === "phase" && key === "unattributedMs") continue;
    const attributeKey = key.replace(
      /[A-Z]/g,
      (letter) => `_${letter.toLowerCase()}`
    );
    attributes[`${ATTRIBUTE_PREFIX}.${group}.${attributeKey}`] = value;
  }
}
__name(addDurationAttributes, "addDurationAttributes");
var PHASE_KEYS = [
  "processToProfilerReadyMs",
  "geminiImportMs",
  "argsParseMs",
  "settingsLoadMs",
  "configConstructionMs",
  "appInitializationMs",
  "acpImportMs",
  "bootstrapConfigInitializationMs",
  "transportSetupMs",
  "initializeHandlerMs",
  "unattributedMs"
];
var CONFIG_KEYS = [
  "extensionsInitialMs",
  "hooksMs",
  "skillsMs",
  "extensionsFinalMs",
  "hierarchicalMemoryMs",
  "toolRegistryMs",
  "ripgrepProbeMs",
  "toolWarmupMs",
  "otherMs"
];
function getChannelStartupProfileAttributes(response, receivedAtEpochMs, initializeTimeoutMs) {
  if (!isRecord(response) || !isRecord(response["_meta"])) {
    return void 0;
  }
  const profile = response["_meta"][CHANNEL_STARTUP_PROFILE_META_KEY];
  if (!isRecord(profile) || profile["v"] !== CHANNEL_STARTUP_PROFILE_VERSION) {
    return void 0;
  }
  const phases = readDurations(profile["phases"], PHASE_KEYS);
  const config = readDurations(profile["config"], CONFIG_KEYS);
  const processToResponseMs = readDuration(profile, "processToResponseMs");
  const responseBuiltAtEpochMs = profile["responseBuiltAtEpochMs"];
  const childComplete = profile["complete"] === true;
  const validResponseEpoch = typeof responseBuiltAtEpochMs === "number" && Number.isFinite(responseBuiltAtEpochMs) && responseBuiltAtEpochMs >= 0;
  const effectiveComplete = childComplete && phases.complete && config.complete && processToResponseMs !== void 0 && validResponseEpoch;
  const attributes = {
    [`${ATTRIBUTE_PREFIX}.profile.version`]: CHANNEL_STARTUP_PROFILE_VERSION,
    [`${ATTRIBUTE_PREFIX}.profile.complete`]: effectiveComplete
  };
  if (processToResponseMs !== void 0) {
    attributes[`${ATTRIBUTE_PREFIX}.child.process_to_response_ms`] = processToResponseMs;
  }
  if (phases.values["unattributedMs"] !== void 0) {
    attributes[`${ATTRIBUTE_PREFIX}.child.unattributed_ms`] = phases.values["unattributedMs"];
  }
  addDurationAttributes(attributes, "phase", phases.values);
  addDurationAttributes(attributes, "config", config.values);
  if (validResponseEpoch) {
    const transportMs = receivedAtEpochMs - responseBuiltAtEpochMs;
    if (Number.isFinite(transportMs) && transportMs >= 0 && transportMs <= initializeTimeoutMs) {
      attributes[`${ATTRIBUTE_PREFIX}.response_transport_ms`] = transportMs;
    }
  }
  return attributes;
}
__name(getChannelStartupProfileAttributes, "getChannelStartupProfileAttributes");

// packages/acp-bridge/src/generation-stream.ts
init_esbuild_shims();
var GenerationStreamQueue = class {
  constructor(capacity) {
    this.capacity = capacity;
  }
  static {
    __name(this, "GenerationStreamQueue");
  }
  values = [];
  waiter;
  closed = false;
  failure;
  push(value) {
    if (this.closed) return false;
    if (this.waiter) {
      const waiter = this.waiter;
      this.waiter = void 0;
      waiter.resolve({ value, done: false });
      return true;
    }
    if (this.values.length >= this.capacity) return false;
    this.values.push(value);
    return true;
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.settleWaiter();
  }
  fail(error) {
    if (this.closed) return;
    this.failure = error;
    this.closed = true;
    this.settleWaiter();
  }
  settleWaiter() {
    if (!this.waiter) return;
    const waiter = this.waiter;
    this.waiter = void 0;
    if (this.failure !== void 0) waiter.reject(this.failure);
    else waiter.resolve({ value: void 0, done: true });
  }
  next() {
    if (this.values.length > 0) {
      return Promise.resolve({ value: this.values.shift(), done: false });
    }
    if (this.failure !== void 0) return Promise.reject(this.failure);
    if (this.closed) {
      return Promise.resolve({ value: void 0, done: true });
    }
    if (this.waiter) {
      return Promise.reject(
        new Error("GenerationStreamQueue supports only one pending reader")
      );
    }
    return new Promise((resolve, reject) => {
      this.waiter = { resolve, reject };
    });
  }
  [Symbol.asyncIterator]() {
    return {
      next: /* @__PURE__ */ __name(() => this.next(), "next"),
      return: /* @__PURE__ */ __name(async () => {
        this.close();
        return { value: void 0, done: true };
      }, "return")
    };
  }
};

// packages/acp-bridge/src/sessionArtifacts.ts
init_esbuild_shims();
import { createHash } from "node:crypto";
import { constants as fsConstants, promises as fs } from "node:fs";
import path from "node:path";
var SOURCE_RESERVATIONS = {
  tool: 100,
  client: 50,
  hook: 50
};
var WORKSPACE_STATUS_REFRESH_TTL_MS = 5e3;
var WORKSPACE_STATUS_REFRESH_BATCH_SIZE = 20;
var SNAPSHOT_AFTER_DURABLE_EVENTS = 50;
var MAX_SNAPSHOT_BACKOFF_MULTIPLIER = 4;
var MAX_TOMBSTONED_IDS = 500;
var MAX_STICKY_EPHEMERAL_IDS = 500;
var MAX_WORKSPACE_HASH_BYTES = 100 * 1024 * 1024;
var SECRET_TOKEN_VALUE_PATTERN = /(?:^|\s)(?:bearer\s+\S{8,}|sk-[A-Za-z0-9_-]{12,}|(?:gh[pousr]|github_pat)_[A-Za-z0-9_/-]{12,}|[a-f0-9]{40,}|[A-Za-z0-9+/]{48,}={0,2})(?:$|\s)/i;
var RESTORE_FAILED_WARNING_PREFIX = "artifact snapshot restore failed";
var RESTORE_PARTIAL_FAILED_WARNING_PREFIX = "artifact snapshot restore partially failed";
function isArtifactRestoreFailureWarning(warning) {
  return warning.startsWith(RESTORE_FAILED_WARNING_PREFIX) || warning.startsWith(RESTORE_PARTIAL_FAILED_WARNING_PREFIX);
}
__name(isArtifactRestoreFailureWarning, "isArtifactRestoreFailureWarning");
var SessionArtifactValidationError = class extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
    this.name = "SessionArtifactValidationError";
  }
  static {
    __name(this, "SessionArtifactValidationError");
  }
  code = "VALIDATION_FAILED";
};
var SessionArtifactAuthorizationError = class extends Error {
  constructor(sessionId, artifactId, ownerClientId, requesterClientId) {
    super(`artifact ${artifactId} is owned by a different client`);
    this.sessionId = sessionId;
    this.artifactId = artifactId;
    this.ownerClientId = ownerClientId;
    this.requesterClientId = requesterClientId;
    this.name = "SessionArtifactAuthorizationError";
  }
  static {
    __name(this, "SessionArtifactAuthorizationError");
  }
  code = "SESSION_ARTIFACT_FORBIDDEN";
};
var SessionArtifactStore = class {
  static {
    __name(this, "SessionArtifactStore");
  }
  sessionId;
  workspaceCwd;
  maxArtifacts;
  persistence;
  artifacts = /* @__PURE__ */ new Map();
  receivedSeq = 0;
  insertSeq = 0;
  persistenceSeq = 0;
  durableEventsSinceSnapshot = 0;
  consecutiveSnapshotFailures = 0;
  realWorkspaceCwdPromise;
  operationQueue = Promise.resolve();
  tombstonedIds = /* @__PURE__ */ new Set();
  tombstonedClientIds = /* @__PURE__ */ new Map();
  stickyEphemeralIds = /* @__PURE__ */ new Set();
  markerArtifacts = /* @__PURE__ */ new Map();
  lastRestoreWarnings = [];
  lastRestoreWarningDetails = [];
  constructor(options) {
    this.sessionId = options.sessionId;
    this.workspaceCwd = options.workspaceCwd;
    this.maxArtifacts = options.maxArtifacts ?? 200;
    this.persistence = options.persistence;
  }
  inputBatchLimit() {
    return this.maxArtifacts * 2;
  }
  resetWorkspaceResolutionCache() {
    this.realWorkspaceCwdPromise = void 0;
  }
  async list() {
    return this.enqueue(async () => {
      await this.refreshWorkspaceStatuses();
      return {
        v: 1,
        sessionId: this.sessionId,
        artifacts: Array.from(this.artifacts.values()).sort((a, b) => a.insertSeq - b.insertSeq).map(toPublicArtifact),
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        limits: { maxArtifacts: this.maxArtifacts },
        ...this.lastRestoreWarnings.length > 0 ? { warnings: [...this.lastRestoreWarnings] } : {},
        ...this.lastRestoreWarningDetails.length > 0 ? { warningDetails: [...this.lastRestoreWarningDetails] } : {}
      };
    });
  }
  async get(artifactId) {
    return this.enqueue(async () => {
      const artifact = this.artifacts.get(artifactId);
      if (!artifact) return void 0;
      if (artifact.workspacePath && shouldRefreshWorkspaceStatus(artifact, Date.now())) {
        await this.refreshWorkspaceStatus(artifact, { onError: "missing" });
      }
      return toPublicArtifact(artifact);
    });
  }
  async upsertMany(inputs, options = {}) {
    return this.enqueue(async () => {
      const validationStrict = options.validationStrict ?? options.strict;
      const persistenceStrict = options.persistenceStrict ?? options.strict;
      const before = this.cloneState();
      const normalizedResults = [];
      const warnings = [];
      const warningDetails = [];
      for (const input of inputs) {
        try {
          const expanded = await this.expandWorkspaceDirectoryInput(input);
          for (const item of expanded.inputs) {
            try {
              normalizedResults.push(
                await this.normalizeInput(
                  item,
                  ++this.receivedSeq,
                  options.trustedPublisher === true
                )
              );
            } catch (error) {
              if (validationStrict) {
                throw error;
              }
              const message = error instanceof Error ? error.message : String(error);
              writeStderrLine(
                `[artifacts] session=${this.sessionId} action=dropped reason=${JSON.stringify(
                  message
                )}`
              );
            }
          }
          if (expanded.warning) {
            warnings.push(expanded.warning);
          }
        } catch (error) {
          if (validationStrict) {
            throw error;
          }
          const message = error instanceof Error ? error.message : String(error);
          writeStderrLine(
            `[artifacts] session=${this.sessionId} action=dropped reason=${JSON.stringify(
              message
            )}`
          );
        }
      }
      const changes = [];
      try {
        for (const normalized of coalesceByIdentity(normalizedResults)) {
          const artifact = this.applyStickyEphemeralOverride(normalized);
          if (this.shouldSuppressTombstonedUpsert(artifact)) {
            writeStderrLine(
              `[artifacts] session=${this.sessionId} action=tombstone_replay_suppressed artifactId=${artifact.id}`
            );
            continue;
          }
          const existing = this.artifacts.get(artifact.id) ?? this.findPublishedUpgradeTarget(artifact) ?? this.findPublishedWorkspaceTarget(artifact);
          if (!existing) {
            const stored = {
              ...artifact,
              insertSeq: ++this.insertSeq
            };
            this.artifacts.set(stored.id, stored);
            changes.push({
              action: "created",
              artifactId: stored.id,
              artifact: toPublicArtifact(stored)
            });
            continue;
          }
          try {
            this.denyCrossClientMutation("upsert", existing.id, existing, {
              clientId: artifact.clientId
            });
          } catch (error) {
            if (validationStrict) {
              throw error;
            }
            if (error instanceof SessionArtifactAuthorizationError) {
              warnings.push(error.message);
              continue;
            }
            throw error;
          }
          const updated = mergeArtifact(existing, artifact);
          if (updated.changed) {
            if (updated.artifact.id !== existing.id) {
              const removeChange = {
                action: "removed",
                artifactId: existing.id,
                artifact: toPublicArtifact(existing),
                reason: "explicit",
                durableTombstoneRequired: existing.durableTombstoneRequired || existing.persistedAt !== void 0,
                removedClientId: existing.clientId
              };
              changes.push(removeChange);
              this.artifacts.delete(existing.id);
            } else if (shouldRecordEphemeralUnpin(existing, artifact)) {
              changes.push({
                action: "removed",
                artifactId: existing.id,
                artifact: toPublicArtifact(existing),
                reason: "unpin_to_ephemeral",
                durableTombstoneRequired: true
              });
            }
            this.artifacts.set(updated.artifact.id, updated.artifact);
            changes.push({
              action: "updated",
              artifactId: updated.artifact.id,
              artifact: toPublicArtifact(updated.artifact)
            });
          }
        }
        const createdIds = new Set(
          changes.filter((change) => change.action === "created").map((change) => change.artifactId)
        );
        const overflowRemoved = await this.evictOverflow(
          createdIds,
          changes,
          persistenceStrict
        );
        changes.push(...overflowRemoved.removed);
        if (overflowRemoved.droppedCreated > 0) {
          warnings.push(
            `dropped ${overflowRemoved.droppedCreated} newly created artifacts because the store is full`
          );
        }
        const hasStrictDurableTransition = changes.some(
          shouldCommitBeforeDurablePersistence
        );
        let persistenceWarnings;
        if (hasStrictDurableTransition && !persistenceStrict) {
          try {
            persistenceWarnings = await this.persistChanges(changes, true);
          } catch (error) {
            this.restoreState(before);
            const artifactIds = changes.filter(shouldCommitBeforeDurablePersistence).map((change) => change.artifactId);
            const warning = "artifact durable removal not persisted; live changes rolled back";
            writeStderrLine(
              `[artifacts] session=${this.sessionId} action=upsert_rollback warning=${JSON.stringify(
                warning
              )} artifactIds=${JSON.stringify(artifactIds)} error=${JSON.stringify(
                error instanceof Error ? error.message : String(error)
              )}`
            );
            return {
              v: 1,
              sessionId: this.sessionId,
              changes: [],
              warnings: [warning],
              warningDetails: [
                persistenceFailureDetail({
                  message: warning,
                  operation: "upsert",
                  artifactIds,
                  error
                })
              ]
            };
          }
        } else {
          persistenceWarnings = await this.persistChanges(
            changes,
            persistenceStrict
          );
        }
        warnings.push(...persistenceWarnings);
        warningDetails.push(
          ...detailsForPersistenceWarnings(
            persistenceWarnings,
            changes,
            "upsert"
          )
        );
        stripDurableTombstoneMarkers(changes);
      } catch (error) {
        if (validationStrict || persistenceStrict || error instanceof SessionArtifactAuthorizationError) {
          this.restoreState(before);
        }
        throw error;
      }
      return {
        v: 1,
        sessionId: this.sessionId,
        changes,
        ...warnings.length > 0 ? { warnings } : {},
        ...warningDetails.length > 0 ? { warningDetails } : {}
      };
    });
  }
  findPublishedUpgradeTarget(artifact) {
    if (artifact.storage !== "published" || !artifact.trustedPublisher || !artifact.managedId || !artifact.url) {
      return void 0;
    }
    const byUrl = this.artifacts.get(
      stableSessionArtifactId(this.sessionId, `url:${artifact.url}`)
    );
    if (byUrl && (byUrl.storage !== "published" || byUrl.managedId === artifact.managedId)) {
      return byUrl;
    }
    for (const existing of this.artifacts.values()) {
      if (existing.storage === "workspace" && existing.workspacePath && artifact.managedId === managedIdForWorkspacePath(
        this.workspaceCwd,
        existing.workspacePath
      ) || existing.storage === "published" && existing.managedId === artifact.managedId) {
        return existing;
      }
    }
    return void 0;
  }
  findPublishedWorkspaceTarget(artifact) {
    if (artifact.storage !== "workspace" || !artifact.workspacePath) {
      return void 0;
    }
    const managedId = managedIdForWorkspacePath(
      this.workspaceCwd,
      artifact.workspacePath
    );
    for (const existing of this.artifacts.values()) {
      if (existing.storage === "published" && existing.managedId === managedId) {
        return existing;
      }
    }
    return void 0;
  }
  async remove(artifactId, options) {
    return this.enqueue(async () => {
      const existing = this.artifacts.get(artifactId);
      if (!existing) {
        return { v: 1, sessionId: this.sessionId, changes: [] };
      }
      this.denyCrossClientMutation("remove", artifactId, existing, options);
      const removeChange = {
        action: "removed",
        artifactId,
        artifact: toPublicArtifact(existing),
        reason: "explicit",
        durableTombstoneRequired: existing.durableTombstoneRequired || existing.retention !== "ephemeral" ? true : void 0,
        removedClientId: existing.clientId
      };
      const changes = [removeChange];
      const needsDurableTombstone = removeChange.durableTombstoneRequired === true;
      if (needsDurableTombstone) {
        const before = this.cloneState();
        this.artifacts.delete(artifactId);
        try {
          await this.persistChanges(changes, true);
        } catch (error) {
          this.restoreState(before);
          const warning = "artifact removal not persisted; live artifact kept";
          return {
            v: 1,
            sessionId: this.sessionId,
            changes: [],
            warnings: [warning],
            warningDetails: [
              persistenceFailureDetail({
                message: warning,
                operation: "remove",
                artifactIds: [artifactId],
                error
              })
            ]
          };
        }
      }
      if (!needsDurableTombstone) {
        this.artifacts.delete(artifactId);
      }
      const warnings = needsDurableTombstone ? [] : await this.persistChanges(changes, false);
      stripDurableTombstoneMarkers(changes);
      const warningDetails = detailsForPersistenceWarnings(
        warnings,
        changes,
        "remove"
      );
      return {
        v: 1,
        sessionId: this.sessionId,
        changes,
        ...warnings.length > 0 ? { warnings } : {},
        ...warningDetails.length > 0 ? { warningDetails } : {}
      };
    });
  }
  async restore(snapshot, options = {}) {
    if (!snapshot) return [];
    return this.enqueue(async () => {
      const warnings = [...snapshot?.warnings ?? []];
      const baselineWarnings = [...warnings];
      const previousState = this.cloneState();
      const preservedLiveEphemeralArtifacts = options.preserveLiveEphemeral ? Array.from(this.artifacts.values()).filter((artifact) => artifact.retention === "ephemeral").map(cloneStoredArtifact) : [];
      let restoredCount = 0;
      this.artifacts.clear();
      this.tombstonedIds.clear();
      this.tombstonedClientIds.clear();
      this.stickyEphemeralIds.clear();
      this.markerArtifacts.clear();
      if (snapshot) {
        this.insertSeq = 0;
        this.persistenceSeq = snapshot.sequence;
        this.durableEventsSinceSnapshot = 0;
        this.consecutiveSnapshotFailures = 0;
        for (const id of snapshot.tombstonedIds) {
          this.tombstonedIds.add(id);
        }
        for (const id of snapshot.stickyEphemeralIds.slice(
          -MAX_STICKY_EPHEMERAL_IDS
        )) {
          this.stickyEphemeralIds.add(id);
        }
        const markerIds = /* @__PURE__ */ new Set([
          ...this.tombstonedIds,
          ...this.stickyEphemeralIds
        ]);
        for (const artifact of snapshot.markerArtifacts ?? []) {
          if (!markerIds.has(artifact.id)) continue;
          const markerArtifact = await this.normalizeRestoredMarkerArtifact(
            artifact,
            warnings,
            options.workspaceAccess === "metadata-only"
          );
          if (markerArtifact)
            this.markerArtifacts.set(artifact.id, markerArtifact);
        }
      }
      for (const artifact of snapshot?.artifacts ?? []) {
        try {
          const input = persistedArtifactToInput(artifact);
          if (input.retention === "pinned") {
            input.retention = "restorable";
            warnings.push(
              `pinned artifact ${artifact.id} downgraded to restorable; runtime does not support pinned retention`
            );
          }
          let normalized = await this.normalizeInput(
            input,
            ++this.receivedSeq,
            artifact.storage === "published" && !isFileArtifactUrl(artifact.url),
            {
              metadataBudget: "persisted",
              workspaceExpected: workspaceExpectedFromArtifact(artifact),
              hashWorkspaceContent: false,
              ...options.workspaceAccess === "metadata-only" ? {
                workspaceAccess: "metadata-only",
                workspaceStatus: artifact.status
              } : {}
            }
          );
          if (this.stickyEphemeralIds.has(normalized.id) && normalized.retention !== "ephemeral") {
            normalized = {
              ...normalized,
              retention: "ephemeral",
              persistenceWarning: "sticky_override_active"
            };
          }
          const stickyApplied = normalized.persistenceWarning === "sticky_override_active";
          if (normalized.id !== artifact.id) {
            warnings.push(`skipped artifact with mismatched id ${artifact.id}`);
            continue;
          }
          const retention = normalized.retention;
          let persistenceWarning;
          if (stickyApplied) {
            persistenceWarning = "sticky_override_active";
          } else if (normalized.status !== "available") {
            persistenceWarning = "metadata_only_restore";
          }
          const stored = {
            ...normalized,
            retention,
            clientRetained: artifact.clientRetained,
            createdAt: artifact.createdAt,
            updatedAt: artifact.updatedAt,
            persistedAt: artifact.persistedAt,
            status: normalized.status,
            restoreState: "restored",
            persistenceWarning,
            durableTombstoneRequired: retention !== "ephemeral" ? true : void 0,
            insertSeq: ++this.insertSeq
          };
          this.artifacts.set(stored.id, stored);
          restoredCount++;
        } catch (error) {
          warnings.push(
            `skipped artifact restore: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
      if (snapshot.artifacts.length > 0 && restoredCount === 0) {
        this.restoreState(previousState);
        const rollbackWarnings = [
          ...baselineWarnings,
          `${RESTORE_FAILED_WARNING_PREFIX}; kept existing live artifacts`
        ];
        this.setLastRestoreWarnings(rollbackWarnings);
        return rollbackWarnings;
      }
      if (previousState.artifacts.size > 0 && baselineWarnings.some(isArtifactSnapshotCompletenessWarning)) {
        this.restoreState(previousState);
        const rollbackWarnings = [
          ...baselineWarnings,
          restoredCount === 0 ? `${RESTORE_FAILED_WARNING_PREFIX}; kept existing live artifacts` : `${RESTORE_PARTIAL_FAILED_WARNING_PREFIX}; kept existing live artifacts`
        ];
        this.setLastRestoreWarnings(rollbackWarnings);
        return rollbackWarnings;
      }
      for (const artifact of preservedLiveEphemeralArtifacts) {
        if (this.artifacts.has(artifact.id) || this.tombstonedIds.has(artifact.id)) {
          continue;
        }
        this.artifacts.set(artifact.id, {
          ...artifact,
          insertSeq: ++this.insertSeq
        });
      }
      const evicted = await this.evictOverflow(/* @__PURE__ */ new Set(), []);
      if (evicted.removed.length > 0) {
        warnings.push("restored artifact list pruned to live limit");
        warnings.push(...await this.persistChanges(evicted.removed, false));
      }
      this.setLastRestoreWarnings(warnings);
      return warnings;
    });
  }
  async recordSnapshot() {
    const persistence = this.persistence;
    if (!persistence) {
      return [
        "artifact persistence unavailable; restored artifacts not snapshotted"
      ];
    }
    return this.enqueue(async () => {
      const recordedAt = (/* @__PURE__ */ new Date()).toISOString();
      const sequence = this.persistenceSeq + 1;
      try {
        await persistence.recordSnapshot(
          this.buildSnapshotPayload(recordedAt, sequence)
        );
        this.persistenceSeq = sequence;
        this.durableEventsSinceSnapshot = 0;
        this.consecutiveSnapshotFailures = 0;
        return [];
      } catch (error) {
        writeStderrLine(
          `[artifacts] session=${this.sessionId} action=snapshot_failed reason=${JSON.stringify(
            error instanceof Error ? error.message : String(error)
          )}`
        );
        return ["artifact snapshot not persisted"];
      }
    });
  }
  async normalizeRestoredMarkerArtifact(artifact, warnings, metadataOnly = false) {
    try {
      const input = persistedArtifactToInput(artifact);
      if (input.retention === "pinned") {
        input.retention = "restorable";
        warnings.push(
          `pinned marker artifact ${artifact.id} downgraded to restorable; runtime does not support pinned retention`
        );
      }
      const normalized = await this.normalizeInput(
        input,
        ++this.receivedSeq,
        artifact.storage === "published" && !isFileArtifactUrl(artifact.url),
        {
          metadataBudget: "persisted",
          workspaceExpected: workspaceExpectedFromArtifact(artifact),
          hashWorkspaceContent: false,
          ...metadataOnly ? {
            workspaceAccess: "metadata-only",
            workspaceStatus: artifact.status
          } : {}
        }
      );
      if (normalized.id !== artifact.id) {
        warnings.push(
          `skipped marker artifact with mismatched id ${artifact.id}`
        );
        return void 0;
      }
      return toPersistedArtifact(
        {
          ...normalized,
          clientRetained: artifact.clientRetained,
          createdAt: artifact.createdAt,
          updatedAt: artifact.updatedAt,
          persistedAt: artifact.persistedAt
        },
        artifact.persistedAt ?? artifact.updatedAt
      );
    } catch (error) {
      warnings.push(
        `skipped marker artifact ${artifact.id}: ${error instanceof Error ? error.message : String(error)}`
      );
      return void 0;
    }
  }
  cloneState() {
    return {
      artifacts: new Map(
        Array.from(this.artifacts.entries()).map(([id, artifact]) => [
          id,
          cloneStoredArtifact(artifact)
        ])
      ),
      receivedSeq: this.receivedSeq,
      insertSeq: this.insertSeq,
      persistenceSeq: this.persistenceSeq,
      durableEventsSinceSnapshot: this.durableEventsSinceSnapshot,
      consecutiveSnapshotFailures: this.consecutiveSnapshotFailures,
      tombstonedIds: new Set(this.tombstonedIds),
      tombstonedClientIds: new Map(this.tombstonedClientIds),
      stickyEphemeralIds: new Set(this.stickyEphemeralIds),
      markerArtifacts: new Map(this.markerArtifacts),
      lastRestoreWarnings: [...this.lastRestoreWarnings],
      lastRestoreWarningDetails: [...this.lastRestoreWarningDetails]
    };
  }
  restoreState(state) {
    this.artifacts.clear();
    for (const [id, artifact] of state.artifacts) {
      this.artifacts.set(id, cloneStoredArtifact(artifact));
    }
    this.receivedSeq = state.receivedSeq;
    this.insertSeq = state.insertSeq;
    this.persistenceSeq = state.persistenceSeq;
    this.durableEventsSinceSnapshot = state.durableEventsSinceSnapshot;
    this.consecutiveSnapshotFailures = state.consecutiveSnapshotFailures;
    this.tombstonedIds.clear();
    for (const id of state.tombstonedIds) {
      this.tombstonedIds.add(id);
    }
    this.tombstonedClientIds.clear();
    for (const [id, clientId] of state.tombstonedClientIds) {
      this.tombstonedClientIds.set(id, clientId);
    }
    this.stickyEphemeralIds.clear();
    for (const id of state.stickyEphemeralIds) {
      this.stickyEphemeralIds.add(id);
    }
    this.markerArtifacts.clear();
    for (const [id, artifact] of state.markerArtifacts) {
      this.markerArtifacts.set(id, artifact);
    }
    this.setLastRestoreWarnings(state.lastRestoreWarnings);
    this.lastRestoreWarningDetails = [...state.lastRestoreWarningDetails];
  }
  async persistChanges(changes, strict = false) {
    const durableChanges = changes.filter(isDurablePersistenceChange);
    if (durableChanges.length === 0) {
      return [];
    }
    if (!this.persistence) {
      if (strict) {
        throw new SessionArtifactValidationError(
          "artifact persistence is unavailable",
          "retention"
        );
      }
      const warnings = this.downgradeDurableChanges(durableChanges);
      this.applyDurableMarkers(durableChanges);
      return warnings;
    }
    const recordedAt = (/* @__PURE__ */ new Date()).toISOString();
    for (const change of durableChanges) {
      if (change.action === "removed") continue;
      const stored = this.artifacts.get(change.artifactId);
      if (!stored) continue;
      const artifact = {
        ...toPublicArtifact(stored),
        persistedAt: recordedAt
      };
      change.artifact = artifact;
    }
    const sequence = this.persistenceSeq + 1;
    const payload = {
      v: SESSION_ARTIFACT_PERSISTENCE_VERSION,
      sessionId: this.sessionId,
      sequence,
      recordedAt,
      changes: durableChanges.map(
        (change) => toPersistedChange(change, recordedAt)
      )
    };
    try {
      await this.persistence.recordEvent(payload);
      this.persistenceSeq = sequence;
      for (const change of durableChanges) {
        if (change.action === "removed") continue;
        const stored = this.artifacts.get(change.artifactId);
        if (!stored) continue;
        stored.persistedAt = recordedAt;
        stored.durableTombstoneRequired = true;
        change.artifact = toPublicArtifact(stored);
      }
      this.applyDurableMarkers(durableChanges);
      await this.maybeRecordSnapshot(recordedAt);
      return [];
    } catch (error) {
      if (strict) {
        throw error;
      }
      const reason = error instanceof Error ? error.message : String(error);
      const artifactIds = durableChanges.map((change) => change.artifactId);
      writeStderrLine(
        `[artifacts] session=${this.sessionId} action=persist_failed sequence=${payload.sequence} artifactIds=${JSON.stringify(
          artifactIds
        )} reason=${JSON.stringify(reason)}`
      );
      const warnings = this.downgradeDurableChanges(durableChanges);
      this.applyDurableMarkers(durableChanges);
      return warnings;
    }
  }
  async maybeRecordSnapshot(recordedAt) {
    if (!this.persistence) return;
    this.durableEventsSinceSnapshot++;
    const snapshotThreshold = SNAPSHOT_AFTER_DURABLE_EVENTS * Math.min(
      MAX_SNAPSHOT_BACKOFF_MULTIPLIER,
      2 ** this.consecutiveSnapshotFailures
    );
    if (this.durableEventsSinceSnapshot < snapshotThreshold) {
      return;
    }
    const sequence = this.persistenceSeq + 1;
    try {
      await this.persistence.recordSnapshot(
        this.buildSnapshotPayload(recordedAt, sequence)
      );
      this.persistenceSeq = sequence;
      this.durableEventsSinceSnapshot = 0;
      this.consecutiveSnapshotFailures = 0;
    } catch (error) {
      this.consecutiveSnapshotFailures = Math.min(
        this.consecutiveSnapshotFailures + 1,
        Math.log2(MAX_SNAPSHOT_BACKOFF_MULTIPLIER)
      );
      writeStderrLine(
        `[artifacts] session=${this.sessionId} action=snapshot_failed reason=${JSON.stringify(
          error instanceof Error ? error.message : String(error)
        )}`
      );
    }
  }
  buildSnapshotPayload(recordedAt, sequence) {
    const artifacts = Array.from(this.artifacts.values()).filter((artifact) => artifact.retention !== "ephemeral").sort((a, b) => a.insertSeq - b.insertSeq).map((artifact) => toPersistedArtifact(artifact, recordedAt));
    const stickyEphemeralIds = Array.from(this.stickyEphemeralIds).filter(
      (id) => this.artifacts.has(id) || this.markerArtifacts.has(id)
    );
    const markerArtifacts = this.buildMarkerArtifacts(
      recordedAt,
      stickyEphemeralIds
    );
    return {
      v: SESSION_ARTIFACT_PERSISTENCE_VERSION,
      sessionId: this.sessionId,
      sequence,
      recordedAt,
      artifacts,
      tombstonedIds: Array.from(this.tombstonedIds),
      stickyEphemeralIds,
      ...markerArtifacts.length > 0 ? { markerArtifacts } : {}
    };
  }
  buildMarkerArtifacts(recordedAt, stickyEphemeralIds) {
    const markerIds = [...this.tombstonedIds, ...stickyEphemeralIds];
    const artifacts = [];
    const seen = /* @__PURE__ */ new Set();
    for (const id of markerIds) {
      if (seen.has(id)) continue;
      seen.add(id);
      const live = this.artifacts.get(id);
      if (live) {
        artifacts.push(toPersistedArtifact(toPublicArtifact(live), recordedAt));
        continue;
      }
      const markerArtifact = this.markerArtifacts.get(id);
      if (markerArtifact) {
        artifacts.push(markerArtifact);
      }
    }
    return artifacts;
  }
  downgradeDurableChanges(changes) {
    let downgraded = false;
    let removalNotPersisted = false;
    for (const change of changes) {
      if (change.action === "removed") {
        removalNotPersisted = true;
        if (change.reason === "explicit") {
          this.rememberTombstone(change);
          this.stickyEphemeralIds.delete(change.artifactId);
        }
        continue;
      }
      const stored = this.artifacts.get(change.artifactId);
      if (!stored) continue;
      stored.retention = "ephemeral";
      stored.persistenceWarning = "persistence_unavailable";
      stored.durableTombstoneRequired = stored.durableTombstoneRequired || stored.persistedAt !== void 0;
      delete stored.persistedAt;
      change.artifact = toPublicArtifact(stored);
      downgraded = true;
    }
    const warnings = [];
    if (downgraded) {
      warnings.push(
        "artifact persistence unavailable; durable artifacts kept ephemeral"
      );
    }
    if (removalNotPersisted) {
      warnings.push("artifact removal not persisted; live removal kept");
    }
    return warnings;
  }
  applyDurableMarkers(changes) {
    for (const change of changes) {
      if (change.action === "removed") {
        if (change.reason === "explicit") {
          this.rememberTombstone(change);
          this.stickyEphemeralIds.delete(change.artifactId);
        } else if (change.reason === "eviction") {
          this.stickyEphemeralIds.delete(change.artifactId);
          this.markerArtifacts.delete(change.artifactId);
        } else if (change.reason === "unpin_to_ephemeral") {
          this.rememberStickyEphemeral(change);
        }
        continue;
      }
      if (change.artifact && change.artifact.retention !== "ephemeral") {
        this.tombstonedIds.delete(change.artifactId);
        this.tombstonedClientIds.delete(change.artifactId);
        this.stickyEphemeralIds.delete(change.artifactId);
        this.markerArtifacts.delete(change.artifactId);
      }
    }
  }
  rememberStickyEphemeral(change) {
    const artifactId = change.artifactId;
    this.stickyEphemeralIds.delete(artifactId);
    this.stickyEphemeralIds.add(artifactId);
    if (change.artifact) {
      this.markerArtifacts.set(
        artifactId,
        toPersistedArtifact(change.artifact, change.artifact.updatedAt)
      );
    }
    while (this.stickyEphemeralIds.size > MAX_STICKY_EPHEMERAL_IDS) {
      const oldest2 = this.stickyEphemeralIds.values().next().value;
      if (oldest2 === void 0) break;
      this.stickyEphemeralIds.delete(oldest2);
      this.markerArtifacts.delete(oldest2);
    }
  }
  rememberTombstone(change) {
    this.tombstonedIds.delete(change.artifactId);
    this.tombstonedIds.add(change.artifactId);
    this.tombstonedClientIds.set(
      change.artifactId,
      change.removedClientId ?? this.artifacts.get(change.artifactId)?.clientId
    );
    if (change.artifact) {
      this.markerArtifacts.set(
        change.artifactId,
        toPersistedArtifact(change.artifact, change.artifact.updatedAt)
      );
    }
    while (this.tombstonedIds.size > MAX_TOMBSTONED_IDS) {
      const oldest2 = this.tombstonedIds.values().next().value;
      if (oldest2 === void 0) break;
      writeStderrLine(
        `[artifacts] session=${this.sessionId} action=tombstone_evicted artifactId=${JSON.stringify(
          oldest2
        )} limit=${MAX_TOMBSTONED_IDS}`
      );
      this.tombstonedIds.delete(oldest2);
      this.tombstonedClientIds.delete(oldest2);
      this.markerArtifacts.delete(oldest2);
    }
  }
  setLastRestoreWarnings(warnings) {
    this.lastRestoreWarnings = [...warnings];
    this.lastRestoreWarningDetails = detailsForRestoreWarnings(warnings);
  }
  enqueue(operation) {
    const result = this.operationQueue.then(operation, operation);
    this.operationQueue = result.then(
      () => void 0,
      () => void 0
    );
    return result;
  }
  denyCrossClientMutation(action, artifactId, existing, options) {
    if (existing.source !== "client" || existing.clientId === void 0 || existing.clientId === options?.clientId) {
      return;
    }
    writeStderrLine(
      `[artifacts] session=${this.sessionId} action=${action}_denied artifactId=${artifactId} owner=${existing.clientId} requester=${options?.clientId ?? "<anonymous>"}`
    );
    throw new SessionArtifactAuthorizationError(
      this.sessionId,
      artifactId,
      existing.clientId,
      options?.clientId
    );
  }
  async expandWorkspaceDirectoryInput(input) {
    const workspacePath = typeof input.workspacePath === "string" ? input.workspacePath.trim() : void 0;
    if (!workspacePath) {
      return { inputs: [input] };
    }
    const realWorkspace = await this.getRealWorkspaceCwdForValidation();
    const normalizedPath = normalizeWorkspacePath(workspacePath, realWorkspace);
    const absolutePath = path.resolve(realWorkspace, normalizedPath);
    let stat;
    try {
      stat = await fs.lstat(absolutePath);
    } catch (error) {
      if (isNotFoundError(error)) {
        return { inputs: [input] };
      }
      const reason = error instanceof Error ? error.message : String(error);
      throw new SessionArtifactValidationError(
        `workspacePath could not be inspected: ${reason}`,
        "workspacePath"
      );
    }
    let walkDir = absolutePath;
    let walkRelative = normalizedPath;
    if (stat.isSymbolicLink()) {
      let realPath;
      try {
        realPath = await fs.realpath(absolutePath);
      } catch {
        return { inputs: [input] };
      }
      let realStat;
      try {
        realStat = await fs.lstat(realPath);
      } catch (error) {
        if (isNotFoundError(error)) {
          return { inputs: [input] };
        }
        const reason = error instanceof Error ? error.message : String(error);
        throw new SessionArtifactValidationError(
          `workspacePath could not be inspected: ${reason}`,
          "workspacePath"
        );
      }
      if (!realStat.isDirectory()) {
        return { inputs: [input] };
      }
      walkDir = realPath;
      walkRelative = normalizedPath;
    } else if (!stat.isDirectory()) {
      return { inputs: [input] };
    } else {
      try {
        walkDir = await fs.realpath(absolutePath);
      } catch (error) {
        if (isNotFoundError(error)) {
          return { inputs: [input] };
        }
        const reason = error instanceof Error ? error.message : String(error);
        throw new SessionArtifactValidationError(
          `workspacePath could not be inspected: ${reason}`,
          "workspacePath"
        );
      }
    }
    const resolvedRelative = path.relative(realWorkspace, walkDir);
    if (!resolvedRelative || isOutsidePath(resolvedRelative)) {
      throw new SessionArtifactValidationError(
        "workspacePath must stay inside the workspace",
        "workspacePath"
      );
    }
    if (pathHasSkippedDirectoryComponent(
      resolvedRelative.split(path.sep).join("/")
    ) || walkRelative && pathHasSkippedDirectoryComponent(walkRelative)) {
      throw new SessionArtifactValidationError(
        "workspacePath is a skipped directory and cannot be recorded",
        "workspacePath"
      );
    }
    if (input.metadata !== void 0 && !isPlainMetadataObject(input.metadata)) {
      throw new SessionArtifactValidationError(
        "metadata must be an object",
        "metadata"
      );
    }
    const childMetadata = {
      ...isPlainMetadataObject(input.metadata) ? input.metadata : {},
      expandedFromDirectory: true
    };
    if (Buffer.byteLength(JSON.stringify(childMetadata), "utf8") > 4096) {
      throw new SessionArtifactValidationError(
        "metadata is too large to expand a directory",
        "metadata"
      );
    }
    const parentTitle = normalizeString(input.title, "title", 200, true);
    const parentDescription = normalizeString(
      input.description,
      "description",
      1e3,
      false
    );
    let collected;
    try {
      collected = await collectRecordableWorkspaceFiles(
        walkDir,
        walkRelative,
        realWorkspace,
        (filePath) => isRecordableDerivedChild(path.posix.basename(filePath), filePath)
      );
    } catch (error) {
      if (isNotFoundError(error)) {
        return { inputs: [input] };
      }
      const reason = error instanceof Error ? error.message : String(error);
      throw new SessionArtifactValidationError(
        `workspacePath could not be inspected: ${reason}`,
        "workspacePath"
      );
    }
    if (collected.files.length === 0) {
      throw new SessionArtifactValidationError(
        collected.depthLimited ? `workspacePath is a directory whose recordable files are deeper than ${MAX_DIRECTORY_ARTIFACT_DEPTH} levels` : "workspacePath is a directory with no recordable files",
        "workspacePath"
      );
    }
    const warnings = [];
    if (collected.truncated) {
      warnings.push(
        `workspacePath "${normalizedPath}" contained more than ${MAX_DIRECTORY_ARTIFACT_FILES} files; recorded the first ${collected.files.length}`
      );
    }
    if (collected.depthLimited) {
      warnings.push(
        `workspacePath "${normalizedPath}" exceeded ${MAX_DIRECTORY_ARTIFACT_DEPTH} directory levels; some files were not recorded`
      );
    }
    if (collected.unreadable) {
      warnings.push(
        `workspacePath "${normalizedPath}" contained subdirectories that could not be read`
      );
    }
    if (collected.skippedUnrecordable > 0) {
      warnings.push(
        `workspacePath "${normalizedPath}" skipped ${collected.skippedUnrecordable} files whose names cannot be recorded as artifact titles`
      );
    }
    return {
      inputs: collected.files.map((filePath) => {
        const title = path.posix.basename(filePath).trim();
        const description = parentDescription || (parentTitle && parentTitle !== title ? parentTitle : void 0);
        return {
          ...input,
          title,
          workspacePath: filePath,
          kind: void 0,
          mimeType: void 0,
          sizeBytes: void 0,
          metadata: childMetadata,
          ...description ? { description } : { description: void 0 }
        };
      }),
      ...warnings.length > 0 ? { warning: warnings.join("; ") } : {}
    };
  }
  async normalizeInput(input, receivedSeq, trustedPublisherFromCaller, options = {}) {
    if (!input || typeof input !== "object") {
      throw new SessionArtifactValidationError("Artifact must be an object");
    }
    const title = normalizeString(input.title, "title", 200, true);
    const description = normalizeString(
      input.description,
      "description",
      1e3,
      false
    );
    const source = input.source ?? "tool";
    if (source !== "tool" && source !== "hook" && source !== "client") {
      throw new SessionArtifactValidationError(
        "source must be tool, hook, or client",
        "source"
      );
    }
    const trustedPublisher = trustedPublisherFromCaller;
    const workspacePath = input.workspacePath ? normalizeWorkspacePath(
      input.workspacePath,
      options.workspaceAccess === "metadata-only" ? this.workspaceCwd : await this.getRealWorkspaceCwdForValidation()
    ) : void 0;
    const managedId = normalizeManagedId(input.managedId);
    const rawStorage = input.storage;
    const storage = inferStorage(rawStorage, {
      workspacePath,
      managedId,
      url: input.url,
      trustedPublisher
    });
    const url = input.url ? normalizeArtifactUrl(input.url, trustedPublisher) : void 0;
    validateLocator(storage, {
      workspacePath,
      managedId,
      url,
      trustedPublisher
    });
    const retention = normalizeRetention(input.retention, {
      persistenceAvailable: this.persistence !== void 0
    });
    const workspaceStatus = workspacePath ? options.workspaceAccess === "metadata-only" ? {
      status: options.workspaceStatus ?? "missing",
      ...options.workspaceExpected?.sizeBytes !== void 0 ? { sizeBytes: options.workspaceExpected.sizeBytes } : {}
    } : await this.getInitialWorkspaceStatus(
      workspacePath,
      options.workspaceExpected,
      { hashContent: options.hashWorkspaceContent !== false }
    ) : void 0;
    if (workspaceStatus?.escaped) {
      throw new SessionArtifactValidationError(
        "workspacePath must stay inside the workspace",
        "workspacePath"
      );
    }
    const metadata = withWorkspaceContentHashMetadata(
      normalizeMetadata(input.metadata, {
        budget: options.metadataBudget ?? "user"
      }),
      workspaceStatus
    );
    const kind = normalizeKind(
      input.kind ?? inferKind({ storage, workspacePath, url })
    );
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const identityKey = buildIdentityKey({
      storage,
      workspacePath,
      managedId,
      url
    });
    const id = stableSessionArtifactId(this.sessionId, identityKey);
    return {
      id,
      identityKey,
      receivedSeq,
      retentionExplicit: input.retention !== void 0,
      retentionSource: source,
      trustedPublisher,
      kind,
      storage,
      source,
      status: workspaceStatus?.status ?? "available",
      ...workspacePath && options.workspaceAccess !== "metadata-only" ? { lastStatAt: Date.now() } : {},
      title,
      description,
      workspacePath,
      managedId,
      url,
      mimeType: normalizeString(input.mimeType, "mimeType", 120, false),
      sizeBytes: workspaceStatus?.sizeBytes !== void 0 ? workspaceStatus.sizeBytes : input.sizeBytes !== void 0 ? normalizeSizeBytes(input.sizeBytes) : void 0,
      metadata,
      retention,
      restoreState: "live",
      ...this.persistence === void 0 && retention !== "ephemeral" ? { persistenceWarning: "persistence_unavailable" } : {},
      clientRetained: source === "client" && (input.clientRetained !== void 0 ? input.clientRetained === true : true),
      createdAt: now,
      updatedAt: now,
      toolCallId: normalizeString(input.toolCallId, "toolCallId", 200, false),
      toolName: normalizeString(input.toolName, "toolName", 200, false),
      hookEventName: normalizeString(
        input.hookEventName,
        "hookEventName",
        200,
        false
      ),
      clientId: normalizeString(input.clientId, "clientId", 200, false)
    };
  }
  shouldSuppressTombstonedUpsert(artifact) {
    if (!this.tombstonedIds.has(artifact.id)) {
      return false;
    }
    const tombstonedClientId = this.tombstonedClientIds.get(artifact.id);
    if (artifact.source !== "client") {
      return false;
    }
    return !(artifact.retentionExplicit && artifact.clientId !== void 0 && artifact.clientId === tombstonedClientId);
  }
  async refreshWorkspaceStatuses() {
    const now = Date.now();
    const staleWorkspaceArtifacts = Array.from(this.artifacts.values()).filter((artifact) => artifact.workspacePath).filter((artifact) => shouldRefreshWorkspaceStatus(artifact, now));
    await runInBatches(
      staleWorkspaceArtifacts,
      WORKSPACE_STATUS_REFRESH_BATCH_SIZE,
      (artifact) => this.refreshWorkspaceStatus(artifact, {
        onError: "missing",
        now
      })
    );
  }
  applyStickyEphemeralOverride(artifact) {
    if (!this.stickyEphemeralIds.has(artifact.id) || artifact.retentionExplicit || artifact.retention === "ephemeral") {
      return artifact;
    }
    return {
      ...artifact,
      retention: "ephemeral",
      retentionExplicit: true,
      persistenceWarning: "sticky_override_active"
    };
  }
  async getInitialWorkspaceStatus(workspacePath, expected, options = { hashContent: true }) {
    try {
      return await getWorkspaceStatus(
        workspacePath,
        this.getRealWorkspaceCwd(),
        expected,
        options
      );
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new SessionArtifactValidationError(
        `workspacePath could not be inspected: ${reason}`,
        "workspacePath"
      );
    }
  }
  async refreshWorkspaceStatus(artifact, options) {
    if (!artifact.workspacePath) {
      return;
    }
    try {
      const status = await getWorkspaceStatus(
        artifact.workspacePath,
        this.getRealWorkspaceCwd(),
        {
          sizeBytes: artifact.sizeBytes,
          mtimeMs: artifact.metadata?.[WORKSPACE_CONTENT_MTIME_MS_METADATA_KEY],
          sha256: artifact.metadata?.[WORKSPACE_CONTENT_SHA256_METADATA_KEY]
        }
      );
      const changed = isWorkspaceContentChanged(artifact, status);
      artifact.status = changed ? "changed" : status.status;
      if (!changed) {
        artifact.sizeBytes = status.sizeBytes;
      }
      if (status.escaped) {
        artifact.status = "missing";
        artifact.sizeBytes = void 0;
        artifact.hideWorkspacePath = true;
      }
      artifact.lastStatAt = options.now ?? Date.now();
    } catch (error) {
      writeStderrLine(
        `[artifacts] session=${this.sessionId} action=status_refresh_failed artifactId=${artifact.id} reason=${JSON.stringify(
          error instanceof Error ? error.message : String(error)
        )}`
      );
      if (options.onError === "missing") {
        artifact.status = "missing";
        artifact.sizeBytes = void 0;
        artifact.lastStatAt = options.now ?? Date.now();
      }
      return;
    }
  }
  getRealWorkspaceCwd() {
    if (!this.realWorkspaceCwdPromise) {
      const promise = fs.realpath(this.workspaceCwd).catch((error) => {
        if (this.realWorkspaceCwdPromise === promise) {
          this.realWorkspaceCwdPromise = void 0;
        }
        throw error;
      });
      this.realWorkspaceCwdPromise = promise;
    }
    return this.realWorkspaceCwdPromise;
  }
  async getRealWorkspaceCwdForValidation() {
    try {
      return await this.getRealWorkspaceCwd();
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new SessionArtifactValidationError(
        `workspacePath could not be inspected: ${reason}`,
        "workspacePath"
      );
    }
  }
  async evictOverflow(createdIds, changes, strict = false) {
    const removed = [];
    if (this.artifacts.size <= this.maxArtifacts) {
      return { removed, droppedCreated: 0 };
    }
    const createdInThisBatch = new Set(createdIds);
    const candidates = Array.from(this.artifacts.values()).filter(
      (artifact) => !createdInThisBatch.has(artifact.id)
    );
    const now = Date.now();
    const staleWorkspaceCandidates = candidates.filter((artifact) => artifact.workspacePath).filter((artifact) => shouldRefreshWorkspaceStatus(artifact, now));
    await runInBatches(
      staleWorkspaceCandidates,
      WORKSPACE_STATUS_REFRESH_BATCH_SIZE,
      (artifact) => this.refreshWorkspaceStatus(artifact, { onError: "preserve", now })
    );
    const sourceCounts = countByRetentionSource(this.artifacts.values());
    while (this.artifacts.size > this.maxArtifacts) {
      const artifact = selectEvictionCandidate(candidates, sourceCounts);
      if (!artifact) break;
      this.artifacts.delete(artifact.id);
      candidates.splice(candidates.indexOf(artifact), 1);
      sourceCounts[artifact.retentionSource]--;
      removePriorChange(changes, artifact.id);
      removed.push({
        action: "removed",
        artifactId: artifact.id,
        artifact: toPublicArtifact(artifact),
        durableTombstoneRequired: artifact.durableTombstoneRequired,
        reason: "eviction"
      });
    }
    const overflowCreated = Array.from(this.artifacts.values()).filter((artifact) => createdInThisBatch.has(artifact.id)).sort((a, b) => b.receivedSeq - a.receivedSeq);
    if (strict && overflowCreated.length > 0 && this.artifacts.size > this.maxArtifacts) {
      throw new SessionArtifactValidationError(
        "artifact store is full; no eviction candidate is available",
        "artifactId"
      );
    }
    let droppedCreated = 0;
    for (const artifact of overflowCreated) {
      if (this.artifacts.size <= this.maxArtifacts) {
        break;
      }
      this.artifacts.delete(artifact.id);
      droppedCreated++;
      writeStderrLine(
        `[artifacts] session=${this.sessionId} action=dropped reason="max artifacts exceeded" artifactId=${artifact.id}`
      );
      removePriorChange(changes, artifact.id);
    }
    return { removed, droppedCreated };
  }
};
function coalesceByIdentity(artifacts) {
  const byId = /* @__PURE__ */ new Map();
  for (const artifact of artifacts) {
    const existing = byId.get(artifact.id);
    if (!existing) {
      byId.set(artifact.id, artifact);
      continue;
    }
    byId.set(artifact.id, mergeBatchArtifact(existing, artifact));
  }
  return Array.from(byId.values()).sort(
    (a, b) => a.receivedSeq - b.receivedSeq
  );
}
__name(coalesceByIdentity, "coalesceByIdentity");
function mergeBatchArtifact(existing, next) {
  const publishedUpgrade = existing.storage !== "published" && next.storage === "published" && next.trustedPublisher;
  if (publishedUpgrade) {
    const merged = {
      ...existing,
      id: next.id,
      identityKey: next.identityKey,
      kind: next.kind,
      storage: "published",
      status: next.status,
      title: next.title,
      description: next.description,
      managedId: next.managedId ?? existing.managedId,
      url: next.url ?? existing.url,
      mimeType: next.mimeType ?? existing.mimeType,
      sizeBytes: next.sizeBytes ?? existing.sizeBytes,
      metadata: mergeMetadata(existing, next),
      trustedPublisher: true,
      createdAt: existing.createdAt,
      receivedSeq: existing.receivedSeq,
      retentionExplicit: existing.retentionExplicit || next.retentionExplicit,
      retentionSource: existing.retentionSource,
      retention: mergeRetention(existing, next),
      restoreState: "live",
      persistenceWarning: existing.persistenceWarning ?? next.persistenceWarning,
      persistedAt: existing.persistedAt ?? next.persistedAt,
      clientRetained: existing.clientRetained || next.clientRetained,
      lastStatAt: void 0
    };
    delete merged.workspacePath;
    return merged;
  }
  const refreshDisplay = existing.storage === "workspace" && next.storage === "workspace" && shouldRefreshWorkspaceDisplay(next, existing);
  const metadata = mergeMetadata(existing, next);
  return {
    ...existing,
    title: refreshDisplay ? next.title : existing.title,
    description: refreshDisplay ? next.description ?? existing.description : existing.description,
    toolName: refreshDisplay ? next.toolName : existing.toolName,
    source: refreshDisplay ? next.source : existing.source,
    hookEventName: refreshDisplay ? next.hookEventName : existing.hookEventName,
    toolCallId: refreshDisplay ? next.toolCallId : existing.toolCallId,
    status: next.status,
    sizeBytes: mergeSizeBytes(existing, next),
    metadata: refreshDisplay ? stripExpandedFromDirectoryMarker(metadata) : metadata,
    clientRetained: existing.clientRetained || next.clientRetained,
    trustedPublisher: existing.trustedPublisher || next.trustedPublisher,
    retentionExplicit: existing.retentionExplicit || next.retentionExplicit,
    retention: mergeRetention(existing, next),
    lastStatAt: next.lastStatAt ?? existing.lastStatAt
  };
}
__name(mergeBatchArtifact, "mergeBatchArtifact");
function mergeArtifact(existing, incoming) {
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const publishedUpgrade = existing.storage !== "published" && incoming.storage === "published" && incoming.trustedPublisher;
  const publishedRefresh = existing.storage === "published" && incoming.storage === "published" && incoming.trustedPublisher && incoming.managedId !== void 0 && incoming.managedId === existing.managedId;
  const publishedUpdate = publishedUpgrade || publishedRefresh;
  const next = {
    ...existing,
    id: publishedUpdate ? incoming.id : existing.id,
    identityKey: publishedUpdate ? incoming.identityKey : existing.identityKey,
    kind: publishedUpdate ? incoming.kind : existing.kind,
    storage: publishedUpgrade ? "published" : existing.storage,
    status: existing.storage === "published" && !publishedUpdate ? existing.status : incoming.status,
    managedId: publishedUpdate ? incoming.managedId ?? existing.managedId : existing.managedId,
    url: publishedUpdate ? incoming.url ?? existing.url : existing.url,
    workspacePath: publishedUpdate || existing.storage === "published" ? void 0 : existing.workspacePath ?? incoming.workspacePath,
    hideWorkspacePath: publishedUpdate || existing.storage === "published" || incoming.workspacePath ? void 0 : existing.hideWorkspacePath,
    mimeType: publishedUpdate ? incoming.mimeType ?? existing.mimeType : existing.mimeType,
    sizeBytes: existing.storage === "published" && !publishedUpdate ? existing.sizeBytes : mergeSizeBytes(existing, incoming),
    metadata: existing.storage === "published" && !publishedUpdate ? existing.metadata : mergeMetadata(existing, incoming),
    retention: mergeRetention(existing, incoming),
    restoreState: "live",
    persistenceWarning: incoming.retentionExplicit && incoming.retention !== "ephemeral" ? incoming.persistenceWarning : existing.persistenceWarning ?? incoming.persistenceWarning,
    persistedAt: incoming.retentionExplicit && incoming.retention === "ephemeral" ? void 0 : existing.persistedAt ?? incoming.persistedAt,
    source: existing.source,
    retentionSource: existing.retentionSource,
    trustedPublisher: existing.trustedPublisher || incoming.trustedPublisher,
    clientRetained: existing.clientRetained || incoming.clientRetained,
    lastStatAt: publishedUpdate || existing.storage === "published" ? void 0 : incoming.lastStatAt ?? existing.lastStatAt,
    updatedAt: existing.updatedAt
  };
  if (publishedUpdate) {
    next.title = incoming.title;
    next.description = incoming.description;
    delete next.workspacePath;
    delete next.hideWorkspacePath;
  } else if (existing.storage === "workspace" && incoming.storage === "workspace" && shouldRefreshWorkspaceDisplay(incoming, existing)) {
    next.title = incoming.title;
    next.description = incoming.description ?? existing.description;
    next.toolCallId = incoming.toolCallId;
    next.toolName = incoming.toolName;
    next.source = incoming.source;
    next.hookEventName = incoming.hookEventName;
    next.metadata = stripExpandedFromDirectoryMarker(next.metadata);
  }
  const changed = !publicArtifactsEqual(
    toPublicArtifact(existing),
    toPublicArtifact(next)
  );
  if (changed) {
    next.updatedAt = now;
  }
  return { artifact: changed ? next : existing, changed };
}
__name(mergeArtifact, "mergeArtifact");
function shouldRecordEphemeralUnpin(existing, incoming) {
  return incoming.retentionExplicit && incoming.retention === "ephemeral" && (existing.retention !== "ephemeral" || existing.persistedAt !== void 0 || existing.durableTombstoneRequired === true);
}
__name(shouldRecordEphemeralUnpin, "shouldRecordEphemeralUnpin");
function stripExpandedFromDirectoryMarker(metadata) {
  if (metadata?.["expandedFromDirectory"] !== true) {
    return metadata;
  }
  const { expandedFromDirectory: _dropped, ...rest } = metadata;
  return Object.keys(rest).length > 0 ? rest : void 0;
}
__name(stripExpandedFromDirectoryMarker, "stripExpandedFromDirectoryMarker");
function shouldRefreshWorkspaceDisplay(incoming, existing) {
  if (incoming.metadata?.["expandedFromDirectory"] === true) {
    return false;
  }
  if (incoming.toolName === "record_artifact" && incoming.source !== "hook") {
    return true;
  }
  if (!incoming.toolName) {
    return true;
  }
  return incoming.toolName === existing.toolName && incoming.source === existing.source && incoming.hookEventName === existing.hookEventName;
}
__name(shouldRefreshWorkspaceDisplay, "shouldRefreshWorkspaceDisplay");
function publicArtifactsEqual(a, b) {
  return a.id === b.id && a.kind === b.kind && a.storage === b.storage && a.source === b.source && a.status === b.status && a.title === b.title && a.description === b.description && a.workspacePath === b.workspacePath && a.managedId === b.managedId && a.url === b.url && a.mimeType === b.mimeType && a.sizeBytes === b.sizeBytes && metadataEqual(a.metadata, b.metadata) && a.retention === b.retention && a.restoreState === b.restoreState && a.persistenceWarning === b.persistenceWarning && a.persistedAt === b.persistedAt && a.clientRetained === b.clientRetained && a.createdAt === b.createdAt && a.updatedAt === b.updatedAt && a.toolCallId === b.toolCallId && a.toolName === b.toolName && a.hookEventName === b.hookEventName && a.clientId === b.clientId;
}
__name(publicArtifactsEqual, "publicArtifactsEqual");
function metadataEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => Object.hasOwn(b, key) && a[key] === b[key]);
}
__name(metadataEqual, "metadataEqual");
function mergeSizeBytes(existing, incoming) {
  if (incoming.sizeBytes !== void 0) {
    return incoming.sizeBytes;
  }
  if (incoming.workspacePath && incoming.status === "missing") {
    return void 0;
  }
  return existing.sizeBytes;
}
__name(mergeSizeBytes, "mergeSizeBytes");
function strongestRetention(a, b) {
  const rank = {
    ephemeral: 0,
    restorable: 1
  };
  return rank[b] > rank[a] ? b : a;
}
__name(strongestRetention, "strongestRetention");
function mergeRetention(existing, incoming) {
  if (incoming.retentionExplicit && incoming.retention === "ephemeral") {
    return "ephemeral";
  }
  if (existing.retentionExplicit && existing.retention === "ephemeral" && !incoming.retentionExplicit) {
    return "ephemeral";
  }
  return strongestRetention(existing.retention, incoming.retention);
}
__name(mergeRetention, "mergeRetention");
function mergeMetadata(existing, incoming) {
  if (!incoming.metadata || incoming.source === "hook" || incoming.source !== existing.source) {
    return existing.metadata;
  }
  const merged = { ...existing.metadata ?? {} };
  let changed = false;
  for (const [key, value] of Object.entries(incoming.metadata)) {
    if ((key === WORKSPACE_CONTENT_SHA256_METADATA_KEY || key === WORKSPACE_CONTENT_MTIME_MS_METADATA_KEY) && merged[key] !== value) {
      merged[key] = value;
      changed = true;
    } else if (!Object.hasOwn(merged, key)) {
      merged[key] = value;
      changed = true;
    }
  }
  if (!changed) {
    return existing.metadata;
  }
  if (!isMetadataWithinLimit(merged)) {
    writeStderrLine(
      `[artifacts] action=metadata_merge_dropped artifactId=${incoming.id} reason="metadata limit exceeded"`
    );
    return existing.metadata;
  }
  return merged;
}
__name(mergeMetadata, "mergeMetadata");
function isMetadataWithinLimit(metadata) {
  return metadataBudgetBytes(metadata, "persisted") <= 4096;
}
__name(isMetadataWithinLimit, "isMetadataWithinLimit");
function countByRetentionSource(artifacts) {
  const counts = {
    tool: 0,
    client: 0,
    hook: 0
  };
  for (const artifact of artifacts) {
    counts[artifact.retentionSource]++;
  }
  return counts;
}
__name(countByRetentionSource, "countByRetentionSource");
function shouldRefreshWorkspaceStatus(artifact, now) {
  return artifact.lastStatAt === void 0 || now - artifact.lastStatAt >= WORKSPACE_STATUS_REFRESH_TTL_MS;
}
__name(shouldRefreshWorkspaceStatus, "shouldRefreshWorkspaceStatus");
function selectEvictionCandidate(candidates, sourceCounts) {
  return oldest(
    candidates,
    (artifact) => artifact.status === "missing" && !artifact.clientRetained
  ) ?? oldest(
    candidates,
    (artifact) => !artifact.clientRetained && sourceCounts[artifact.retentionSource] > SOURCE_RESERVATIONS[artifact.retentionSource]
  ) ?? oldest(candidates, (artifact) => !artifact.clientRetained) ?? oldest(candidates);
}
__name(selectEvictionCandidate, "selectEvictionCandidate");
function oldest(artifacts, predicate = () => true) {
  let selected;
  for (const artifact of artifacts) {
    if (!predicate(artifact)) {
      continue;
    }
    if (!selected || compareOldest(artifact, selected) < 0) {
      selected = artifact;
    }
  }
  return selected;
}
__name(oldest, "oldest");
function compareOldest(a, b) {
  const created = a.createdAt.localeCompare(b.createdAt);
  if (created !== 0) return created;
  return a.insertSeq - b.insertSeq;
}
__name(compareOldest, "compareOldest");
function removePriorChange(changes, artifactId) {
  const index = changes.findIndex((change) => change.artifactId === artifactId);
  if (index >= 0) {
    changes.splice(index, 1);
  }
}
__name(removePriorChange, "removePriorChange");
function toPublicArtifact(artifact) {
  const hideWorkspacePath = "hideWorkspacePath" in artifact && artifact.hideWorkspacePath === true;
  const {
    id,
    kind,
    storage,
    source,
    status,
    title,
    description,
    workspacePath,
    managedId,
    url,
    mimeType,
    sizeBytes,
    metadata,
    retention,
    restoreState,
    persistenceWarning,
    persistedAt,
    clientRetained,
    createdAt,
    updatedAt,
    toolCallId,
    toolName,
    hookEventName
  } = artifact;
  return {
    id,
    kind,
    storage,
    source,
    status,
    title,
    ...description ? { description } : {},
    ...workspacePath && !hideWorkspacePath ? { workspacePath } : {},
    ...managedId ? { managedId } : {},
    ...url ? { url } : {},
    ...mimeType ? { mimeType } : {},
    ...sizeBytes !== void 0 ? { sizeBytes } : {},
    ...metadata ? { metadata } : {},
    retention,
    ...restoreState ? { restoreState } : {},
    ...persistenceWarning ? { persistenceWarning } : {},
    ...persistedAt ? { persistedAt } : {},
    clientRetained,
    createdAt,
    updatedAt,
    ...toolCallId ? { toolCallId } : {},
    ...toolName ? { toolName } : {},
    ...hookEventName ? { hookEventName } : {}
  };
}
__name(toPublicArtifact, "toPublicArtifact");
function persistedArtifactToInput(artifact) {
  return {
    title: artifact.title,
    kind: artifact.kind,
    storage: artifact.storage,
    description: artifact.description,
    workspacePath: artifact.workspacePath,
    managedId: artifact.managedId,
    url: artifact.url,
    mimeType: artifact.mimeType,
    sizeBytes: artifact.sizeBytes,
    metadata: artifact.metadata,
    source: artifact.source,
    retention: artifact.retention,
    clientRetained: artifact.clientRetained,
    toolCallId: artifact.toolCallId,
    toolName: artifact.toolName,
    hookEventName: artifact.hookEventName
  };
}
__name(persistedArtifactToInput, "persistedArtifactToInput");
function workspaceExpectedFromArtifact(artifact) {
  if (!artifact.workspacePath) {
    return void 0;
  }
  return {
    sizeBytes: artifact.sizeBytes,
    mtimeMs: artifact.metadata?.[WORKSPACE_CONTENT_MTIME_MS_METADATA_KEY],
    sha256: artifact.metadata?.[WORKSPACE_CONTENT_SHA256_METADATA_KEY]
  };
}
__name(workspaceExpectedFromArtifact, "workspaceExpectedFromArtifact");
function toPersistedChange(change, recordedAt) {
  return {
    action: change.action,
    artifactId: change.artifactId,
    ...change.artifact ? { artifact: toPersistedArtifact(change.artifact, recordedAt) } : {},
    ...change.reason ? { reason: change.reason } : {}
  };
}
__name(toPersistedChange, "toPersistedChange");
function toPersistedArtifact(artifact, recordedAt) {
  return {
    id: artifact.id,
    kind: artifact.kind,
    storage: artifact.storage,
    source: artifact.source,
    status: artifact.status === "changed" ? "available" : artifact.status,
    title: artifact.title,
    ...artifact.description ? { description: artifact.description } : {},
    ...artifact.workspacePath ? { workspacePath: artifact.workspacePath } : {},
    ...artifact.managedId ? { managedId: artifact.managedId } : {},
    ...artifact.url ? { url: artifact.url } : {},
    ...artifact.mimeType ? { mimeType: artifact.mimeType } : {},
    ...artifact.sizeBytes !== void 0 ? { sizeBytes: artifact.sizeBytes } : {},
    ...artifact.metadata ? { metadata: artifact.metadata } : {},
    retention: artifact.retention,
    clientRetained: artifact.clientRetained,
    createdAt: artifact.createdAt,
    updatedAt: artifact.updatedAt,
    persistedAt: artifact.persistedAt ?? recordedAt,
    ...artifact.toolCallId ? { toolCallId: artifact.toolCallId } : {},
    ...artifact.toolName ? { toolName: artifact.toolName } : {},
    ...artifact.hookEventName ? { hookEventName: artifact.hookEventName } : {}
  };
}
__name(toPersistedArtifact, "toPersistedArtifact");
function isFileArtifactUrl(raw) {
  if (typeof raw !== "string") return false;
  try {
    return new URL(raw).protocol === "file:";
  } catch {
    return false;
  }
}
__name(isFileArtifactUrl, "isFileArtifactUrl");
function isArtifactSnapshotCompletenessWarning(warning) {
  if (warning.startsWith("skipped stale event sequence ")) return false;
  return warning.startsWith("skipped ") || warning.includes(" list truncated to ");
}
__name(isArtifactSnapshotCompletenessWarning, "isArtifactSnapshotCompletenessWarning");
function shouldCommitBeforeDurablePersistence(change) {
  return change.action === "removed" && change.durableTombstoneRequired === true;
}
__name(shouldCommitBeforeDurablePersistence, "shouldCommitBeforeDurablePersistence");
function isDurablePersistenceChange(change) {
  if (change.action === "removed" && change.durableTombstoneRequired === true) {
    return true;
  }
  if (!change.artifact) return false;
  return change.artifact.retention !== "ephemeral" || change.artifact.persistenceWarning === "persistence_unavailable";
}
__name(isDurablePersistenceChange, "isDurablePersistenceChange");
function stripDurableTombstoneMarkers(changes) {
  for (const change of changes) {
    delete change.durableTombstoneRequired;
    delete change.removedClientId;
  }
}
__name(stripDurableTombstoneMarkers, "stripDurableTombstoneMarkers");
function detailsForRestoreWarnings(warnings) {
  return warnings.map((warning) => {
    if (warning.startsWith(RESTORE_FAILED_WARNING_PREFIX)) {
      return {
        code: "ARTIFACT_RESTORE_FAILED",
        operation: "restore",
        durability: "unavailable",
        retryable: true,
        message: warning
      };
    }
    if (warning.startsWith(RESTORE_PARTIAL_FAILED_WARNING_PREFIX)) {
      return {
        code: "ARTIFACT_RESTORE_PARTIAL_FAILED",
        operation: "restore",
        durability: "live_only",
        retryable: true,
        message: warning
      };
    }
    return {
      code: "ARTIFACT_WARNING",
      operation: "restore",
      message: warning
    };
  });
}
__name(detailsForRestoreWarnings, "detailsForRestoreWarnings");
function detailsForPersistenceWarnings(warnings, changes, operation) {
  if (warnings.length === 0) return [];
  const artifactIds = changes.filter(isDurablePersistenceChange).map((change) => change.artifactId);
  return warnings.map((warning) => {
    if (warning === "artifact persistence unavailable; durable artifacts kept ephemeral") {
      return {
        code: "ARTIFACT_PERSISTENCE_UNAVAILABLE",
        operation,
        artifactIds,
        durability: "live_only",
        retryable: false,
        message: warning
      };
    }
    if (warning === "artifact removal not persisted; live removal kept") {
      return {
        code: "ARTIFACT_REMOVAL_NOT_PERSISTED",
        operation,
        artifactIds,
        durability: "live_only",
        retryable: true,
        message: warning
      };
    }
    return {
      code: "ARTIFACT_WARNING",
      operation,
      artifactIds,
      message: warning
    };
  });
}
__name(detailsForPersistenceWarnings, "detailsForPersistenceWarnings");
function persistenceFailureDetail(options) {
  const unavailable = options.error instanceof SessionArtifactValidationError && options.error.message === "artifact persistence is unavailable";
  return {
    code: unavailable ? "ARTIFACT_PERSISTENCE_UNAVAILABLE" : "ARTIFACT_PERSISTENCE_WRITE_FAILED",
    operation: options.operation,
    artifactIds: options.artifactIds,
    durability: "unavailable",
    retryable: !unavailable,
    message: options.message
  };
}
__name(persistenceFailureDetail, "persistenceFailureDetail");
function cloneStoredArtifact(artifact) {
  return {
    ...artifact,
    ...artifact.metadata ? { metadata: { ...artifact.metadata } } : {}
  };
}
__name(cloneStoredArtifact, "cloneStoredArtifact");
function inferStorage(requested, locators) {
  if (requested !== void 0 && typeof requested !== "string") {
    throw new SessionArtifactValidationError(
      "storage must be a string",
      "storage"
    );
  }
  if (requested) {
    if (requested !== "workspace" && requested !== "external_url" && requested !== "managed" && requested !== "published") {
      throw new SessionArtifactValidationError(
        "storage must be workspace, external_url, managed, or published",
        "storage"
      );
    }
    return requested;
  }
  if (locators.workspacePath) return "workspace";
  if (locators.managedId) return "managed";
  if (locators.url && locators.trustedPublisher) return "published";
  return "external_url";
}
__name(inferStorage, "inferStorage");
function normalizeKind(kind) {
  if (kind === "file" || kind === "link" || kind === "html" || kind === "image" || kind === "video" || kind === "audio" || kind === "pdf" || kind === "notebook" || kind === "document" || kind === "other") {
    return kind;
  }
  throw new SessionArtifactValidationError(
    "kind must be a supported artifact kind",
    "kind"
  );
}
__name(normalizeKind, "normalizeKind");
function validateLocator(storage, locators) {
  if (storage === "published") {
    if (!locators.trustedPublisher) {
      throw new SessionArtifactValidationError(
        "published artifacts are reserved for trusted publishers",
        "storage"
      );
    }
    if (!locators.url) {
      throw new SessionArtifactValidationError(
        "published artifacts require url",
        "url"
      );
    }
    if (locators.workspacePath) {
      throw new SessionArtifactValidationError(
        "published artifacts cannot include workspacePath",
        "workspacePath"
      );
    }
    return;
  }
  const locatorCount = [
    locators.workspacePath,
    locators.managedId,
    locators.url
  ].filter(Boolean).length;
  if (locatorCount !== 1) {
    throw new SessionArtifactValidationError(
      "provide exactly one of workspacePath, managedId, or url"
    );
  }
  if (storage === "workspace" && !locators.workspacePath) {
    throw new SessionArtifactValidationError(
      "workspace storage requires workspacePath",
      "workspacePath"
    );
  }
  if (storage === "managed" && !locators.managedId) {
    throw new SessionArtifactValidationError(
      "managed storage requires managedId",
      "managedId"
    );
  }
  if (storage === "external_url" && !locators.url) {
    throw new SessionArtifactValidationError(
      "external_url storage requires url",
      "url"
    );
  }
}
__name(validateLocator, "validateLocator");
function buildIdentityKey(input) {
  if (input.workspacePath) return `workspace:${input.workspacePath}`;
  if (input.managedId) return `managed:${input.managedId}`;
  if (input.url) return `url:${input.url}`;
  throw new SessionArtifactValidationError(
    "artifact identity requires workspacePath, managedId, or url"
  );
}
__name(buildIdentityKey, "buildIdentityKey");
function managedIdForWorkspacePath(workspaceCwd, workspacePath) {
  return createHash("sha1").update(path.resolve(workspaceCwd, workspacePath)).digest("hex").slice(0, 16);
}
__name(managedIdForWorkspacePath, "managedIdForWorkspacePath");
function normalizeString(value, field, maxLength, required) {
  if (value === void 0 || value === null) {
    if (required) {
      throw new SessionArtifactValidationError(`${field} is required`, field);
    }
    return void 0;
  }
  if (typeof value !== "string") {
    throw new SessionArtifactValidationError(
      `${field} must be a string`,
      field
    );
  }
  const trimmed = value.trim();
  if (!trimmed) {
    if (required) {
      throw new SessionArtifactValidationError(`${field} is required`, field);
    }
    return void 0;
  }
  if (trimmed.length > maxLength) {
    throw new SessionArtifactValidationError(
      `${field} exceeds ${maxLength} characters`,
      field
    );
  }
  if (hasControlCharacter(trimmed, field === "description")) {
    throw new SessionArtifactValidationError(
      `${field} contains control characters`,
      field
    );
  }
  if (isDisplayField(field) && hasUnsafeDisplayPayload(trimmed)) {
    throw new SessionArtifactValidationError(
      `${field} contains unsafe markup`,
      field
    );
  }
  return trimmed;
}
__name(normalizeString, "normalizeString");
function normalizeManagedId(value) {
  const managedId = normalizeString(value, "managedId", 200, false);
  if (!managedId) return void 0;
  if (managedId.includes("/") || managedId.includes("\\") || managedId.includes("..") || path.isAbsolute(managedId) || path.win32.isAbsolute(managedId)) {
    throw new SessionArtifactValidationError(
      "managedId must be an opaque managed resource id",
      "managedId"
    );
  }
  return managedId;
}
__name(normalizeManagedId, "normalizeManagedId");
function isDisplayField(field) {
  return field === "title" || field === "description" || field === "mimeType" || field === "workspacePath" || field === "managedId";
}
__name(isDisplayField, "isDisplayField");
function hasControlCharacter(value, allowLineWhitespace = false) {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (allowLineWhitespace && (code === 9 || code === 10 || code === 13)) {
      continue;
    }
    if (code <= 31 || code === 127 || code >= 8203 && code <= 8207 || code === 8232 || code === 8233 || code >= 8234 && code <= 8238 || code >= 8294 && code <= 8297 || code === 65279) {
      return true;
    }
  }
  return false;
}
__name(hasControlCharacter, "hasControlCharacter");
function hasUnsafeDisplayPayload(value) {
  return /<\s*\/?[a-z!]|&(?:#[0-9]+|#x[0-9a-f]+|[a-z][a-z0-9]+);|javascript\s*:|data\s*:\s*(?:text\/(?:html|javascript)|application\/javascript|image\/svg\+xml)/i.test(
    value
  ) || /(?:^|[\s"'`<])on[a-z][a-z0-9-]*\s*=/i.test(value);
}
__name(hasUnsafeDisplayPayload, "hasUnsafeDisplayPayload");
function normalizeWorkspacePath(raw, workspaceCwd) {
  const trimmed = normalizeString(raw, "workspacePath", 500, true);
  if (path.isAbsolute(trimmed)) {
    throw new SessionArtifactValidationError(
      "workspacePath must be relative to the workspace",
      "workspacePath"
    );
  }
  const absolute = path.resolve(workspaceCwd, trimmed);
  const relative = path.relative(workspaceCwd, absolute);
  if (!relative || isOutsidePath(relative)) {
    throw new SessionArtifactValidationError(
      "workspacePath must stay inside the workspace",
      "workspacePath"
    );
  }
  return relative.split(path.sep).join("/");
}
__name(normalizeWorkspacePath, "normalizeWorkspacePath");
function normalizeArtifactUrl(raw, allowFile) {
  const trimmed = normalizeString(raw, "url", 2048, true);
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new SessionArtifactValidationError("url must be valid", "url");
  }
  if (parsed.username || parsed.password) {
    throw new SessionArtifactValidationError(
      "url must not include credentials",
      "url"
    );
  }
  if (hasSecretLikeUrlComponent(parsed)) {
    throw new SessionArtifactValidationError(
      "url must not include secret-like components",
      "url"
    );
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:" && !(allowFile && parsed.protocol === "file:")) {
    throw new SessionArtifactValidationError(
      allowFile ? "url must use http, https, or file" : "url must use http or https",
      "url"
    );
  }
  return parsed.href;
}
__name(normalizeArtifactUrl, "normalizeArtifactUrl");
function hasSecretLikeUrlComponent(parsed) {
  for (const [key, value] of parsed.searchParams) {
    if (isSecretLikeUrlText(key) || isSecretLikeUrlValue(value)) {
      return true;
    }
  }
  for (const segment of parsed.pathname.split("/").filter(Boolean)) {
    let decodedSegment = segment;
    try {
      decodedSegment = decodeURIComponent(segment);
    } catch {
    }
    if (isSecretLikeUrlValue(decodedSegment)) {
      return true;
    }
  }
  const fragment = parsed.hash.slice(1);
  return hasSecretLikeUrlFragment(fragment);
}
__name(hasSecretLikeUrlComponent, "hasSecretLikeUrlComponent");
function hasSecretLikeUrlFragment(fragment) {
  if (!fragment) return false;
  const candidates = /* @__PURE__ */ new Set([fragment]);
  try {
    candidates.add(decodeURIComponent(fragment));
  } catch {
  }
  for (const candidate of candidates) {
    if (isSecretLikeUrlText(candidate) || isSecretLikeUrlValue(candidate)) {
      return true;
    }
    for (const [key, value] of new URLSearchParams(candidate)) {
      if (isSecretLikeUrlText(key) || isSecretLikeUrlValue(value)) {
        return true;
      }
    }
  }
  return false;
}
__name(hasSecretLikeUrlFragment, "hasSecretLikeUrlFragment");
function isSecretLikeUrlText(value) {
  const normalized = value.replace(/([a-z])([A-Z])/g, "$1-$2");
  return /(?:^|[-_.])(token|secret|password|passwd|pwd|cookie|authorization|credential|signature|sig|api[-_]?key|access[-_]?key)(?:$|[-_.=&#])/i.test(
    normalized
  );
}
__name(isSecretLikeUrlText, "isSecretLikeUrlText");
function isSecretLikeUrlValue(value) {
  return SECRET_TOKEN_VALUE_PATTERN.test(value.trim());
}
__name(isSecretLikeUrlValue, "isSecretLikeUrlValue");
function isSecretLikeMetadataValue(value) {
  return /^(?:bearer\s+\S{8,}|sk-[A-Za-z0-9_-]{12,}|(?:gh[pousr]|github_pat)_[A-Za-z0-9_/-]{12,})$/i.test(
    value.trim()
  );
}
__name(isSecretLikeMetadataValue, "isSecretLikeMetadataValue");
function normalizeMetadata(metadata, options = {}) {
  if (metadata === void 0) {
    return void 0;
  }
  if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
    throw new SessionArtifactValidationError(
      "metadata must be an object",
      "metadata"
    );
  }
  const normalized = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (isPrototypeMetadataKey(key)) {
      continue;
    }
    if (options.budget !== "persisted" && isReservedWorkspaceMetadataKey(key)) {
      continue;
    }
    if (!key) {
      throw new SessionArtifactValidationError(
        "metadata keys must not be empty",
        "metadata"
      );
    }
    if (key.length > 120) {
      throw new SessionArtifactValidationError(
        "metadata keys must be 120 characters or fewer",
        "metadata"
      );
    }
    if (hasControlCharacter(key) || hasUnsafeDisplayPayload(key)) {
      throw new SessionArtifactValidationError(
        "metadata keys contain unsafe content",
        "metadata"
      );
    }
    if (isSecretLikeUrlText(key)) {
      throw new SessionArtifactValidationError(
        "metadata keys must not contain secret-like names",
        "metadata"
      );
    }
    if (value !== null && typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
      throw new SessionArtifactValidationError(
        "metadata values must be primitive",
        "metadata"
      );
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
      throw new SessionArtifactValidationError(
        "metadata numbers must be finite",
        "metadata"
      );
    }
    if (typeof value === "string" && (hasControlCharacter(value) || hasUnsafeDisplayPayload(value))) {
      throw new SessionArtifactValidationError(
        "metadata string values contain unsafe content",
        "metadata"
      );
    }
    if (typeof value === "string" && !isReservedWorkspaceMetadataKey(key) && isSecretLikeMetadataValue(value)) {
      throw new SessionArtifactValidationError(
        "metadata string values must not contain secret-like tokens",
        "metadata"
      );
    }
    normalized[key] = value;
  }
  if (Object.keys(normalized).length === 0) {
    return void 0;
  }
  if (metadataBudgetBytes(normalized, options.budget ?? "user") > 4096) {
    throw new SessionArtifactValidationError(
      "metadata must be 4096 bytes or fewer",
      "metadata"
    );
  }
  return normalized;
}
__name(normalizeMetadata, "normalizeMetadata");
function normalizeRetention(value, options) {
  if (value === void 0) {
    return options.persistenceAvailable ? "restorable" : "ephemeral";
  }
  if (value === "ephemeral" || value === "restorable") {
    return value;
  }
  if (value === "pinned") {
    throw new SessionArtifactValidationError(
      "pinned retention is not supported by session_artifacts_persistence",
      "retention"
    );
  }
  throw new SessionArtifactValidationError(
    "retention must be ephemeral or restorable",
    "retention"
  );
}
__name(normalizeRetention, "normalizeRetention");
function normalizeSizeBytes(value) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new SessionArtifactValidationError(
      "sizeBytes must be a non-negative safe integer",
      "sizeBytes"
    );
  }
  return value;
}
__name(normalizeSizeBytes, "normalizeSizeBytes");
function inferKind(input) {
  if (input.storage === "published") return "html";
  if (input.url) return "link";
  const ext = input.workspacePath ? path.extname(input.workspacePath).toLowerCase() : "";
  if (ext === ".html" || ext === ".htm") return "html";
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(ext)) {
    return "image";
  }
  if ([".mp4", ".mov", ".webm"].includes(ext)) return "video";
  if ([".mp3", ".wav", ".m4a", ".ogg"].includes(ext)) return "audio";
  if (ext === ".pdf") return "pdf";
  if (ext === ".ipynb") return "notebook";
  if (isOfficeDocumentExtension(ext)) return "document";
  return input.workspacePath ? "file" : "other";
}
__name(inferKind, "inferKind");
async function getWorkspaceStatus(workspacePath, realWorkspaceCwd, expected, options = { hashContent: true }) {
  const realWorkspace = await realWorkspaceCwd;
  const absolutePath = path.resolve(realWorkspace, workspacePath);
  try {
    const realPath = await fs.realpath(absolutePath);
    const relative = path.relative(realWorkspace, realPath);
    if (!relative || isOutsidePath(relative)) {
      return { status: "missing", escaped: true };
    }
    const preOpenStat = await fs.lstat(realPath);
    const handle = await fs.open(
      realPath,
      fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW
    );
    try {
      const stat = await handle.stat();
      if (!isSameFile(preOpenStat, stat)) {
        return { status: "missing", escaped: true };
      }
      if (!stat.isFile()) {
        throw new Error("path is not a regular file");
      }
      const expectedMtimeMs = typeof expected?.mtimeMs === "number" ? expected.mtimeMs : void 0;
      const expectedSha256 = typeof expected?.sha256 === "string" ? expected.sha256 : void 0;
      const unchanged = expected?.sizeBytes === stat.size && expectedMtimeMs === stat.mtimeMs;
      const sizeChanged = expected?.sizeBytes !== void 0 && expected.sizeBytes !== stat.size;
      if (sizeChanged) {
        return {
          status: "changed",
          sizeBytes: stat.size,
          mtimeMs: stat.mtimeMs
        };
      }
      if (unchanged) {
        return {
          status: "available",
          sizeBytes: stat.size,
          mtimeMs: stat.mtimeMs
        };
      }
      if (stat.size > MAX_WORKSPACE_HASH_BYTES) {
        return {
          status: expectedSha256 ? "changed" : "available",
          sizeBytes: stat.size,
          mtimeMs: stat.mtimeMs
        };
      }
      if (!options.hashContent) {
        return {
          status: expectedSha256 ? "changed" : "available",
          sizeBytes: stat.size,
          mtimeMs: stat.mtimeMs
        };
      }
      const sha256 = await hashFile(handle);
      if (expectedSha256 && sha256 !== expectedSha256) {
        return {
          status: "changed",
          sizeBytes: stat.size,
          mtimeMs: stat.mtimeMs
        };
      }
      return {
        status: "available",
        sizeBytes: stat.size,
        mtimeMs: stat.mtimeMs,
        sha256
      };
    } finally {
      await handle.close();
    }
  } catch (error) {
    if (isNoFollowSymlinkError(error)) {
      return { status: "missing", escaped: true };
    }
    if (!isNotFoundError(error)) {
      throw error;
    }
    if (await danglingSymlinkEscapesWorkspace(absolutePath, realWorkspace)) {
      return { status: "missing", escaped: true };
    }
    return { status: "missing" };
  }
}
__name(getWorkspaceStatus, "getWorkspaceStatus");
function isSameFile(before, after) {
  return before.dev === after.dev && before.ino === after.ino;
}
__name(isSameFile, "isSameFile");
async function hashFile(handle) {
  const hash = createHash("sha256");
  for await (const chunk of handle.createReadStream({ start: 0 })) {
    hash.update(chunk);
  }
  return hash.digest("hex");
}
__name(hashFile, "hashFile");
function withWorkspaceContentHashMetadata(metadata, workspaceStatus) {
  if (workspaceStatus?.status !== "available" || !workspaceStatus.sha256) {
    return metadata;
  }
  const next = {
    ...metadata ?? {},
    [WORKSPACE_CONTENT_SHA256_METADATA_KEY]: workspaceStatus.sha256,
    ...workspaceStatus.mtimeMs !== void 0 ? { [WORKSPACE_CONTENT_MTIME_MS_METADATA_KEY]: workspaceStatus.mtimeMs } : {}
  };
  return next;
}
__name(withWorkspaceContentHashMetadata, "withWorkspaceContentHashMetadata");
function isWorkspaceContentChanged(artifact, status) {
  if (status.status !== "available") {
    return false;
  }
  const expectedSha256 = artifact.metadata?.[WORKSPACE_CONTENT_SHA256_METADATA_KEY];
  if (artifact.sizeBytes !== void 0 && status.sizeBytes !== void 0 && status.sizeBytes !== artifact.sizeBytes) {
    return true;
  }
  return typeof expectedSha256 === "string" && status.sha256 !== void 0 && status.sha256 !== expectedSha256;
}
__name(isWorkspaceContentChanged, "isWorkspaceContentChanged");
async function danglingSymlinkEscapesWorkspace(absolutePath, realWorkspace) {
  try {
    const stat = await fs.lstat(absolutePath);
    if (!stat.isSymbolicLink()) {
      return false;
    }
    const target = await fs.readlink(absolutePath);
    const parent = await fs.realpath(path.dirname(absolutePath));
    const targetPath = path.resolve(parent, target);
    return isOutsidePath(path.relative(realWorkspace, targetPath));
  } catch (error) {
    if (isNotFoundError(error)) {
      return false;
    }
    throw error;
  }
}
__name(danglingSymlinkEscapesWorkspace, "danglingSymlinkEscapesWorkspace");
async function runInBatches(items, batchSize, fn) {
  for (let index = 0; index < items.length; index += batchSize) {
    await Promise.all(items.slice(index, index + batchSize).map(fn));
  }
}
__name(runInBatches, "runInBatches");
function isNotFoundError(error) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }
  const code = error.code;
  return code === "ENOENT" || code === "ENOTDIR";
}
__name(isNotFoundError, "isNotFoundError");
function isPlainMetadataObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
__name(isPlainMetadataObject, "isPlainMetadataObject");
function isNoFollowSymlinkError(error) {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }
  return error.code === "ELOOP";
}
__name(isNoFollowSymlinkError, "isNoFollowSymlinkError");
function isOutsidePath(relative) {
  return relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);
}
__name(isOutsidePath, "isOutsidePath");

// packages/acp-bridge/src/bridge.ts
var NOOP_BRIDGE_TELEMETRY = {
  captureContext: /* @__PURE__ */ __name(() => void 0, "captureContext"),
  runWithContext(_captured, fn) {
    return fn();
  },
  withSpan(_operation, _attributes, fn) {
    return fn();
  },
  event() {
  },
  injectPromptContext(request) {
    const meta = request._meta;
    if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
      return request;
    }
    const record = meta;
    if (!(DAEMON_TRACEPARENT_META_KEY in record) && !(DAEMON_TRACESTATE_META_KEY in record)) {
      return request;
    }
    const nextMeta = { ...record };
    delete nextMeta[DAEMON_TRACEPARENT_META_KEY];
    delete nextMeta[DAEMON_TRACESTATE_META_KEY];
    return { ...request, _meta: nextMeta };
  }
};
var KNOWN_SESSION_UPDATE_TYPES = /* @__PURE__ */ new Set([
  "user_message_chunk",
  "agent_message_chunk",
  "agent_thought_chunk",
  "tool_call",
  "tool_call_update",
  "plan",
  "available_commands_update",
  "current_mode_update",
  "config_option_update",
  "session_info_update",
  "usage_update"
]);
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
__name(isRecord2, "isRecord");
function annotateAttachmentReferences(sessionId, dispatchBlocks, resolvedBlocks) {
  if (!process.env["AGENT_ATTACHMENT_LABELING"]) return [...resolvedBlocks];
  const out = [];
  for (let i = 0; i < resolvedBlocks.length; i++) {
    const resolved = resolvedBlocks[i];
    out.push(resolved);
    const original = dispatchBlocks[i];
    if (resolved?.type === "image" && original && isSessionAttachmentReference(original) && original.type === "image") {
      out.push({
        type: "text",
        text: `[attachment_id: ${original.attachmentId}, session_id: ${sessionId}]`
      });
    }
  }
  return out;
}
__name(annotateAttachmentReferences, "annotateAttachmentReferences");
function safeTransportFailureCode(error) {
  if (!isRecord2(error)) return void 0;
  const code = error["code"];
  return typeof code === "string" && /^[a-z0-9_.-]{1,64}$/iu.test(code) ? code : void 0;
}
__name(safeTransportFailureCode, "safeTransportFailureCode");
function sessionSourceRequestMeta(sourceType, sourceId, daemonOwnedStandaloneCreation = false) {
  return sourceType ? {
    [SESSION_SOURCE_META_KEY]: {
      sourceType,
      ...sourceId !== void 0 ? { sourceId } : {},
      ...daemonOwnedStandaloneCreation ? { [DAEMON_OWNED_STANDALONE_CREATION_KEY]: true } : {}
    }
  } : {};
}
__name(sessionSourceRequestMeta, "sessionSourceRequestMeta");
function sameConversationDirectoryExpectation(left, right) {
  return left.canonicalSessionId === right.canonicalSessionId && left.root.canonicalPath === right.root.canonicalPath && left.root.device === right.root.device && left.root.inode === right.root.inode && left.child.name === right.child.name && left.child.canonicalPath === right.child.canonicalPath && left.child.device === right.child.device && left.child.inode === right.child.inode;
}
__name(sameConversationDirectoryExpectation, "sameConversationDirectoryExpectation");
function standaloneWorkingDirectoryMissingError() {
  return new RequestError(
    -32004,
    "The standalone working directory is missing.",
    { errorKind: "working_directory_missing" }
  );
}
__name(standaloneWorkingDirectoryMissingError, "standaloneWorkingDirectoryMissingError");
function getChannelPromptDisplayText(entry, displayText) {
  return entry.sourceType === "channel" && typeof displayText === "string" ? displayText : void 0;
}
__name(getChannelPromptDisplayText, "getChannelPromptDisplayText");
function isDefinitiveAcpRequestError(error) {
  if (error instanceof RequestError) return true;
  if (!isRecord2(error)) return false;
  return typeof error["code"] === "number" && Number.isInteger(error["code"]) && typeof error["message"] === "string";
}
__name(isDefinitiveAcpRequestError, "isDefinitiveAcpRequestError");
var LogSafeAcpRequestError = class extends RequestError {
  constructor(code, message, data, reservePreparedResponse) {
    super(code, message, data);
    this.reservePreparedResponse = reservePreparedResponse;
  }
  static {
    __name(this, "LogSafeAcpRequestError");
  }
  toResult() {
    const result = super.toResult();
    if ("error" in result) {
      Object.defineProperty(result.error, inspect.custom, {
        configurable: true,
        value: /* @__PURE__ */ __name(() => ({ code: result.error.code, payloadOmitted: true }), "value")
      });
      try {
        this.reservePreparedResponse?.(result.error);
      } catch {
      }
    }
    return result;
  }
};
var MAX_LOG_SAFE_ACP_ERROR_DETAILS_CHARS = 1024;
var MAX_LOG_SAFE_ACP_ERROR_KIND_CHARS = 128;
var MAX_LOG_SAFE_ACP_ERROR_HINT_CHARS = 512;
function logSafeAcpErrorDetails(error) {
  const details = error instanceof Error ? error.message : isRecord2(error) && typeof error["message"] === "string" ? error["message"] : void 0;
  if (!details) return void 0;
  return {
    details: details.length <= MAX_LOG_SAFE_ACP_ERROR_DETAILS_CHARS ? details : `${details.slice(0, MAX_LOG_SAFE_ACP_ERROR_DETAILS_CHARS)}\u2026`
  };
}
__name(logSafeAcpErrorDetails, "logSafeAcpErrorDetails");
function boundedAcpErrorString(value, maxChars) {
  return value.length <= maxChars ? value : `${value.slice(0, maxChars)}\u2026`;
}
__name(boundedAcpErrorString, "boundedAcpErrorString");
function logSafeRequestErrorMessage(code) {
  switch (code) {
    case -32700:
      return "Parse error";
    case -32600:
      return "Invalid request";
    case -32601:
      return "Method not found";
    case -32602:
      return "Invalid params";
    case -32603:
      return "Internal error";
    case -32e3:
      return "Authentication required";
    case -32002:
      return "Resource not found";
    default:
      return "ACP client request failed";
  }
}
__name(logSafeRequestErrorMessage, "logSafeRequestErrorMessage");
function logSafeRequestErrorData(data) {
  if (!isRecord2(data) || typeof data["errorKind"] !== "string") {
    return void 0;
  }
  const status = data["status"];
  const hint = data["hint"];
  return {
    errorKind: boundedAcpErrorString(
      data["errorKind"],
      MAX_LOG_SAFE_ACP_ERROR_KIND_CHARS
    ),
    ...typeof status === "number" && Number.isFinite(status) ? { status } : {},
    ...typeof hint === "string" ? {
      hint: boundedAcpErrorString(hint, MAX_LOG_SAFE_ACP_ERROR_HINT_CHARS)
    } : {}
  };
}
__name(logSafeRequestErrorData, "logSafeRequestErrorData");
var AcpInboundHandlerLimitError = class extends Error {
  constructor(maxActiveHandlers, maxActiveHandlerBytes, requiredBytes, availableBytes) {
    super("ACP inbound handler capacity exceeded");
    this.maxActiveHandlers = maxActiveHandlers;
    this.maxActiveHandlerBytes = maxActiveHandlerBytes;
    this.requiredBytes = requiredBytes;
    this.availableBytes = availableBytes;
    this.name = "AcpInboundHandlerLimitError";
  }
  static {
    __name(this, "AcpInboundHandlerLimitError");
  }
  code = "acp_handler_limit_exceeded";
};
function estimateAcpHandlerBytes(value, limitBytes) {
  let bytes = 0;
  const stack = [value];
  const seen = /* @__PURE__ */ new WeakSet();
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === null) {
      bytes += 4;
    } else if (typeof current === "string") {
      bytes += Buffer.byteLength(current) + 2;
    } else if (typeof current === "number") {
      bytes += 24;
    } else if (typeof current === "boolean") {
      bytes += 5;
    } else if (Array.isArray(current)) {
      if (seen.has(current)) return limitBytes + 1;
      seen.add(current);
      bytes += 2 + Math.max(0, current.length - 1);
      if (bytes + current.length > limitBytes) return limitBytes + 1;
      for (let index = current.length - 1; index >= 0; index--) {
        stack.push(current[index]);
      }
    } else if (isRecord2(current)) {
      if (seen.has(current)) return limitBytes + 1;
      seen.add(current);
      const entries = Object.entries(current);
      bytes += 2 + Math.max(0, entries.length - 1);
      for (const [key, entryValue] of entries) {
        bytes += Buffer.byteLength(key) + 3;
        stack.push(entryValue);
      }
    } else {
      bytes += 4;
    }
    if (bytes > limitBytes) return limitBytes + 1;
  }
  return Math.max(1, bytes);
}
__name(estimateAcpHandlerBytes, "estimateAcpHandlerBytes");
var AcpInboundHandlerAdmission = class {
  constructor(guard) {
    this.guard = guard;
  }
  static {
    __name(this, "AcpInboundHandlerAdmission");
  }
  activeHandlers = 0;
  activeBytes = 0;
  async run(params, operation) {
    const envelopeBytes = Math.min(2048, this.guard.maxActiveHandlerBytes);
    const requiredBytes = envelopeBytes + estimateAcpHandlerBytes(
      params,
      Math.max(0, this.guard.maxActiveHandlerBytes - envelopeBytes)
    );
    const availableBytes = Math.max(
      0,
      this.guard.maxActiveHandlerBytes - this.activeBytes
    );
    if (this.activeHandlers >= this.guard.maxActiveHandlers || requiredBytes > availableBytes) {
      const error = new AcpInboundHandlerLimitError(
        this.guard.maxActiveHandlers,
        this.guard.maxActiveHandlerBytes,
        requiredBytes,
        availableBytes
      );
      this.guard.fail(error);
      throw error;
    }
    this.activeHandlers++;
    this.activeBytes += requiredBytes;
    try {
      return await operation();
    } finally {
      this.activeHandlers--;
      this.activeBytes -= requiredBytes;
    }
  }
};
async function withLogSafeAcpError(operation, reservePreparedResponse) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof RequestError) {
      const code = Number.isFinite(error.code) ? error.code : -32603;
      throw new LogSafeAcpRequestError(
        code,
        logSafeRequestErrorMessage(code),
        logSafeRequestErrorData(error.data),
        reservePreparedResponse
      );
    }
    throw new LogSafeAcpRequestError(
      -32603,
      "Internal error",
      logSafeAcpErrorDetails(error),
      reservePreparedResponse
    );
  }
}
__name(withLogSafeAcpError, "withLogSafeAcpError");
function createLogSafeAcpClient(client, transportGuard) {
  const admission = new AcpInboundHandlerAdmission(transportGuard);
  const runNotification = /* @__PURE__ */ __name((params, operation) => withLogSafeAcpError(() => admission.run(params, operation)), "runNotification");
  const runRequest = /* @__PURE__ */ __name((params, operation) => withLogSafeAcpError(
    () => admission.run(params, async () => {
      const result = await operation();
      transportGuard.reservePreparedResponse(result ?? null);
      return result;
    }),
    transportGuard.reservePreparedResponse
  ), "runRequest");
  return {
    requestPermission: /* @__PURE__ */ __name((params) => runRequest(params, () => client.requestPermission(params)), "requestPermission"),
    sessionUpdate: /* @__PURE__ */ __name((params) => runNotification(params, () => client.sessionUpdate(params)), "sessionUpdate"),
    writeTextFile: client.writeTextFile ? (params) => runRequest(params, () => client.writeTextFile(params)) : void 0,
    readTextFile: client.readTextFile ? (params) => runRequest(params, () => client.readTextFile(params)) : void 0,
    createTerminal: client.createTerminal ? (params) => runRequest(params, () => client.createTerminal(params)) : void 0,
    terminalOutput: client.terminalOutput ? (params) => runRequest(params, () => client.terminalOutput(params)) : void 0,
    releaseTerminal: client.releaseTerminal ? (params) => runRequest(
      params,
      async () => await client.releaseTerminal(params) ?? {}
    ) : void 0,
    waitForTerminalExit: client.waitForTerminalExit ? (params) => runRequest(params, () => client.waitForTerminalExit(params)) : void 0,
    killTerminal: client.killTerminal ? (params) => runRequest(
      params,
      async () => await client.killTerminal(params) ?? {}
    ) : void 0,
    extMethod: client.extMethod ? (method, params) => runRequest(params, () => client.extMethod(method, params)) : void 0,
    extNotification: client.extNotification ? (method, params) => runNotification(params, () => client.extNotification(method, params)) : void 0
  };
}
__name(createLogSafeAcpClient, "createLogSafeAcpClient");
var OUTBOUND_GUARDED_CONNECTION_METHODS = /* @__PURE__ */ new Set([
  "initialize",
  "newSession",
  "loadSession",
  "unstable_forkSession",
  "unstable_listSessions",
  "unstable_resumeSession",
  "setSessionMode",
  "unstable_setSessionModel",
  "setSessionConfigOption",
  "authenticate",
  "prompt",
  "cancel",
  "extMethod",
  "extNotification"
]);
function createOutboundGuardedConnection(connection, transportGuard) {
  const wrappers = /* @__PURE__ */ new Map();
  return new Proxy(connection, {
    get(target, property) {
      const value = Reflect.get(target, property, target);
      if (typeof value !== "function" || !OUTBOUND_GUARDED_CONNECTION_METHODS.has(property)) {
        return value;
      }
      let wrapper = wrappers.get(property);
      if (!wrapper) {
        wrapper = /* @__PURE__ */ __name(async (...args) => {
          const release = transportGuard.reserveOutboundOperation(args);
          try {
            return await Reflect.apply(value, target, args);
          } finally {
            release();
          }
        }, "wrapper");
        wrappers.set(property, wrapper);
      }
      return wrapper;
    }
  });
}
__name(createOutboundGuardedConnection, "createOutboundGuardedConnection");
function getCanonicalModelId(response, fallback) {
  if (!isRecord2(response) || !isRecord2(response["_meta"])) return fallback;
  const modelSwitch = response["_meta"]["qwenModelSwitch"];
  if (!isRecord2(modelSwitch)) return fallback;
  const modelId = modelSwitch["modelId"];
  return typeof modelId === "string" ? modelId : fallback;
}
__name(getCanonicalModelId, "getCanonicalModelId");
function isBulkReplayUpdate(value) {
  if (!isRecord2(value)) return false;
  const updateType = value["sessionUpdate"];
  return typeof updateType === "string" && KNOWN_SESSION_UPDATE_TYPES.has(updateType);
}
__name(isBulkReplayUpdate, "isBulkReplayUpdate");
function describeLoadReplayValue(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}
__name(describeLoadReplayValue, "describeLoadReplayValue");
function extractLoadReplayResponse(state) {
  const meta = isRecord2(state._meta) ? state._meta : void 0;
  const replay = meta?.[LOAD_REPLAY_META_KEY];
  if (replay === void 0) return { state, updates: [] };
  if (!isRecord2(replay) || replay["v"] !== LOAD_REPLAY_VERSION) {
    const version = isRecord2(replay) ? replay["v"] : void 0;
    throw new Error(
      `Invalid qwen.session.loadReplay payload (type=${describeLoadReplayValue(replay)}, version=${JSON.stringify(version)})`
    );
  }
  const rawUpdates = replay["updates"];
  if (!Array.isArray(rawUpdates)) {
    throw new Error(
      `Invalid qwen.session.loadReplay updates (version=${LOAD_REPLAY_VERSION}, count=not-array)`
    );
  }
  if (rawUpdates.length > LOAD_REPLAY_MAX_UPDATES) {
    throw new Error(
      `qwen.session.loadReplay updates exceed limit (${rawUpdates.length} > ${LOAD_REPLAY_MAX_UPDATES})`
    );
  }
  const partial = replay["partial"];
  if (partial !== void 0 && partial !== true) {
    throw new Error(
      `Invalid qwen.session.loadReplay partial (version=${LOAD_REPLAY_VERSION}, partial=${JSON.stringify(partial)})`
    );
  }
  const replayError = replay["replayError"];
  if (replayError !== void 0 && typeof replayError !== "string") {
    throw new Error(
      `Invalid qwen.session.loadReplay replayError (version=${LOAD_REPLAY_VERSION}, replayError=${describeLoadReplayValue(replayError)})`
    );
  }
  const hasMore = replay["hasMore"];
  if (hasMore !== void 0 && typeof hasMore !== "boolean") {
    throw new Error(
      `Invalid qwen.session.loadReplay hasMore (version=${LOAD_REPLAY_VERSION}, hasMore=${describeLoadReplayValue(hasMore)})`
    );
  }
  const anchorRecordId = replay["anchorRecordId"];
  if (anchorRecordId !== void 0 && typeof anchorRecordId !== "string") {
    throw new Error(
      `Invalid qwen.session.loadReplay anchorRecordId (version=${LOAD_REPLAY_VERSION}, anchorRecordId=${describeLoadReplayValue(anchorRecordId)})`
    );
  }
  const invalidUpdateIndex = rawUpdates.findIndex(
    (update) => !isBulkReplayUpdate(update)
  );
  if (invalidUpdateIndex !== -1) {
    const invalidUpdate = rawUpdates[invalidUpdateIndex];
    const discriminator = isRecord2(invalidUpdate) ? invalidUpdate["sessionUpdate"] : void 0;
    throw new Error(
      `Invalid qwen.session.loadReplay update at index ${invalidUpdateIndex} (version=${LOAD_REPLAY_VERSION}, count=${rawUpdates.length}, sessionUpdate=${JSON.stringify(discriminator)})`
    );
  }
  const nextMeta = { ...meta ?? {} };
  delete nextMeta[LOAD_REPLAY_META_KEY];
  const cleanState = { ...state };
  if (Object.keys(nextMeta).length > 0) {
    cleanState._meta = nextMeta;
  } else {
    delete cleanState._meta;
  }
  return {
    state: cleanState,
    updates: rawUpdates,
    ...typeof anchorRecordId === "string" ? { anchorRecordId } : {},
    ...partial === true ? { partial: true } : {},
    ...typeof replayError === "string" ? { replayError } : {},
    ...hasMore === true ? { hasMore: true } : {}
  };
}
__name(extractLoadReplayResponse, "extractLoadReplayResponse");
function takeRestoreAskUserQuestionHint(state) {
  const meta = isRecord2(state._meta) ? state._meta : void 0;
  const hint = meta?.[DAEMON_RESTORE_ASK_USER_QUESTION_META_KEY] === true;
  if (!hint || !meta) return { hint: false, state };
  const nextMeta = { ...meta };
  delete nextMeta[DAEMON_RESTORE_ASK_USER_QUESTION_META_KEY];
  const next = { ...state };
  if (Object.keys(nextMeta).length > 0) {
    next._meta = nextMeta;
  } else {
    delete next._meta;
  }
  return { hint: true, state: next };
}
__name(takeRestoreAskUserQuestionHint, "takeRestoreAskUserQuestionHint");
function isServeDebugLoggingEnabled() {
  const value = process.env["QWEN_SERVE_DEBUG"];
  if (!value) return false;
  return !["0", "false", "off", "no"].includes(value.trim().toLowerCase());
}
__name(isServeDebugLoggingEnabled, "isServeDebugLoggingEnabled");
function writeServeDebugLine(message) {
  if (!isServeDebugLoggingEnabled()) return;
  writeStderrLine(`qwen serve debug: ${message}`);
}
__name(writeServeDebugLine, "writeServeDebugLine");
var MAX_DISPLAY_NAME_LENGTH = 256;
var MAX_ECHO_CONTENT_BLOCKS = 256;
function extractPermissionResponseMetadata(response) {
  if (response === null || typeof response !== "object") return void 0;
  const answers = response.answers;
  if (answers !== null && typeof answers === "object" && !Array.isArray(answers)) {
    const entries = Object.entries(answers);
    if (entries.every(([, v]) => typeof v === "string")) {
      return { answers };
    }
  }
  return void 0;
}
__name(extractPermissionResponseMetadata, "extractPermissionResponseMetadata");
function parseWorkspaceMemoryRememberResult(response) {
  if (response === null || typeof response !== "object" || Array.isArray(response)) {
    throw new Error("Malformed workspace memory remember response");
  }
  const record = response;
  const summary = record["summary"];
  const filesTouched = record["filesTouched"];
  const touchedScopes = record["touchedScopes"];
  if (summary !== void 0 && typeof summary !== "string" || !Array.isArray(filesTouched) || !filesTouched.every((file) => typeof file === "string") || !Array.isArray(touchedScopes) || !touchedScopes.every((scope) => scope === "user" || scope === "project")) {
    throw new Error("Malformed workspace memory remember response");
  }
  return {
    ...summary === void 0 ? {} : { summary },
    filesTouched,
    touchedScopes
  };
}
__name(parseWorkspaceMemoryRememberResult, "parseWorkspaceMemoryRememberResult");
function isBridgeAutoMemoryTopic(value) {
  return value === "user" || value === "feedback" || value === "project" || value === "reference";
}
__name(isBridgeAutoMemoryTopic, "isBridgeAutoMemoryTopic");
function touchedScopesFromTopics(topics) {
  const scopes = /* @__PURE__ */ new Set();
  for (const topic of topics) {
    scopes.add(topic === "user" || topic === "feedback" ? "user" : "project");
  }
  return ["user", "project"].filter((scope) => scopes.has(scope));
}
__name(touchedScopesFromTopics, "touchedScopesFromTopics");
function isBridgeMemoryScope(value) {
  return value === "user" || value === "project";
}
__name(isBridgeMemoryScope, "isBridgeMemoryScope");
function parseWorkspaceMemoryForgetMatch(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const record = value;
  if (!isBridgeAutoMemoryTopic(record["topic"]) || typeof record["summary"] !== "string" || typeof record["filePath"] !== "string") {
    return null;
  }
  return {
    topic: record["topic"],
    summary: record["summary"],
    filePath: record["filePath"]
  };
}
__name(parseWorkspaceMemoryForgetMatch, "parseWorkspaceMemoryForgetMatch");
function parseWorkspaceMemoryForgetResult(response) {
  if (response === null || typeof response !== "object" || Array.isArray(response)) {
    throw new Error("Malformed workspace memory forget response");
  }
  const record = response;
  const summary = record["summary"];
  const removedEntries = record["removedEntries"];
  const touchedTopics = record["touchedTopics"];
  const touchedScopes = record["touchedScopes"];
  const parsedRemovedEntries = Array.isArray(removedEntries) ? removedEntries.map(parseWorkspaceMemoryForgetMatch) : [];
  if (summary !== void 0 && typeof summary !== "string" || !Array.isArray(removedEntries) || parsedRemovedEntries.some((entry) => entry === null) || !Array.isArray(touchedTopics) || !touchedTopics.every(isBridgeAutoMemoryTopic) || touchedScopes !== void 0 && (!Array.isArray(touchedScopes) || !touchedScopes.every(isBridgeMemoryScope))) {
    throw new Error("Malformed workspace memory forget response");
  }
  const parsedTouchedTopics = touchedTopics;
  return {
    ...summary === void 0 ? {} : { summary },
    removedEntries: parsedRemovedEntries,
    touchedTopics: parsedTouchedTopics,
    touchedScopes: touchedScopes === void 0 ? touchedScopesFromTopics(parsedTouchedTopics) : touchedScopes
  };
}
__name(parseWorkspaceMemoryForgetResult, "parseWorkspaceMemoryForgetResult");
function parseWorkspaceMemoryDreamResult(response) {
  if (response === null || typeof response !== "object" || Array.isArray(response)) {
    throw new Error("Malformed workspace memory dream response");
  }
  const record = response;
  const summary = record["summary"];
  const touchedTopics = record["touchedTopics"];
  const dedupedEntries = record["dedupedEntries"];
  if (summary !== void 0 && typeof summary !== "string" || !Array.isArray(touchedTopics) || !touchedTopics.every(isBridgeAutoMemoryTopic) || typeof dedupedEntries !== "number" || !Number.isFinite(dedupedEntries)) {
    throw new Error("Malformed workspace memory dream response");
  }
  return {
    ...summary === void 0 ? {} : { summary },
    touchedTopics,
    dedupedEntries
  };
}
__name(parseWorkspaceMemoryDreamResult, "parseWorkspaceMemoryDreamResult");
function pickUserInputEchoMeta(meta) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return {};
  const inputAnnotations = meta["inputAnnotations"];
  return Array.isArray(inputAnnotations) ? { inputAnnotations } : {};
}
__name(pickUserInputEchoMeta, "pickUserInputEchoMeta");
function echoPromptToSessionBus(entry, req, promptId, originatorClientId, displayText) {
  const prompt = req.prompt;
  if (!Array.isArray(prompt) || prompt.length === 0) return;
  let displayTextPublished = false;
  const serverTimestamp = Date.now();
  const echoPrompt = prompt.slice(0, MAX_ECHO_CONTENT_BLOCKS);
  if (displayText && !echoPrompt.some((part) => isRecord2(part) && part["type"] === "text")) {
    const textPart = prompt.slice(MAX_ECHO_CONTENT_BLOCKS).find((part) => isRecord2(part) && part["type"] === "text");
    if (textPart) echoPrompt[echoPrompt.length - 1] = textPart;
  }
  const blockCount = echoPrompt.length;
  for (let i = 0; i < blockCount; i += 1) {
    const part = echoPrompt[i];
    if (!part || typeof part !== "object" || Array.isArray(part)) continue;
    let displayPart = part;
    if (displayText !== void 0 && part.type === "text") {
      if (displayTextPublished) continue;
      displayTextPublished = true;
      if (!displayText) continue;
      displayPart = { ...part, text: displayText };
    }
    try {
      entry.events.publish({
        type: "session_update",
        promptId,
        data: {
          sessionId: req.sessionId,
          update: {
            sessionUpdate: "user_message_chunk",
            content: displayPart,
            // `_meta` lives inside the `update` object rather than at
            // envelope level. `_meta` is a standard JSON-RPC/MCP extension
            // field permitted alongside spec fields, the SDK normalizer
            // reads it from `update._meta`/`data._meta`, and every other
            // agent-emitted session_update carries `_meta` the same way.
            _meta: {
              ...pickUserInputEchoMeta(req._meta),
              serverTimestamp,
              source: "bridge-echo"
            }
          }
        },
        ...originatorClientId ? { originatorClientId } : {}
      });
    } catch {
    }
  }
}
__name(echoPromptToSessionBus, "echoPromptToSessionBus");
function broadcastPromptCancelled(entry, sessionId, promptId, originatorClientId, reason) {
  try {
    entry.events.publish({
      type: "prompt_cancelled",
      ...promptId ? { promptId } : {},
      data: { sessionId, ...reason ? { reason } : {} },
      ...originatorClientId ? { originatorClientId } : {}
    });
  } catch {
  }
}
__name(broadcastPromptCancelled, "broadcastPromptCancelled");
function broadcastPromptCancelledOnce(entry, sessionId, promptId, originatorClientId, reason) {
  if (promptId !== void 0 && entry.cancelBroadcastPromptId === promptId || promptId === void 0 && entry.cancelBroadcastWithoutPrompt === true) {
    writeStderrLine(
      `broadcastPromptCancelledOnce: suppressed duplicate cancel for session ${sessionId} prompt=${promptId ?? "none"}`
    );
    return;
  }
  if (promptId === void 0) {
    entry.cancelBroadcastWithoutPrompt = true;
  } else {
    entry.cancelBroadcastPromptId = promptId;
  }
  broadcastPromptCancelled(
    entry,
    sessionId,
    promptId,
    originatorClientId,
    reason
  );
}
__name(broadcastPromptCancelledOnce, "broadcastPromptCancelledOnce");
function broadcastTurnComplete(entry, sessionId, promptResult, promptId, originatorClientId, mutateTurnState) {
  try {
    const meta = promptResult["_meta"] && typeof promptResult["_meta"] === "object" ? promptResult["_meta"] : void 0;
    const rawBranchPoint = meta?.["qwen.branchPoint"] && typeof meta["qwen.branchPoint"] === "object" ? meta["qwen.branchPoint"] : void 0;
    const branchPoint = promptResult.stopReason === "end_turn" && typeof rawBranchPoint?.["assistantRecordUuid"] === "string" && CHAT_RECORD_UUID_RE.test(rawBranchPoint["assistantRecordUuid"]) && typeof rawBranchPoint["checkpointUuid"] === "string" && CHAT_RECORD_UUID_RE.test(rawBranchPoint["checkpointUuid"]) ? {
      assistantRecordUuid: rawBranchPoint["assistantRecordUuid"],
      checkpointUuid: rawBranchPoint["checkpointUuid"]
    } : void 0;
    const published = entry.events.publish({
      type: "turn_complete",
      ...promptId ? { promptId } : {},
      data: {
        sessionId,
        stopReason: promptResult.stopReason ?? "end_turn",
        ...promptId ? { promptId } : {},
        ...branchPoint ? { branchPoint } : {}
      },
      ...originatorClientId ? { originatorClientId } : {}
    });
    if (mutateTurnState && published !== void 0)
      entry.turnErrorEvent = void 0;
  } catch {
  }
}
__name(broadcastTurnComplete, "broadcastTurnComplete");
function extractErrorMessage(err) {
  if (err instanceof Error) {
    const data = err.data;
    const detail = extractJsonRpcErrorDetail(data);
    return detail ?? err.message;
  }
  if (typeof err === "object" && err !== null) {
    const obj = err;
    const detail = extractJsonRpcErrorDetail(obj["data"]);
    if (detail) return detail;
    const msg = obj["message"];
    if (typeof msg === "string") return msg;
  }
  return String(err);
}
__name(extractErrorMessage, "extractErrorMessage");
function extractJsonRpcErrorDetail(data) {
  if (typeof data === "string" && data.length > 0) return data;
  if (typeof data === "object" && data !== null) {
    const details = data["details"];
    if (typeof details === "string" && details.length > 0) return details;
    const message = data["message"];
    if (typeof message === "string" && message.length > 0) return message;
  }
  return void 0;
}
__name(extractJsonRpcErrorDetail, "extractJsonRpcErrorDetail");
function extractJsonRpcErrorField(err, field) {
  if (typeof err !== "object" || err === null) return void 0;
  const data = err.data;
  if (typeof data !== "object" || data === null) return void 0;
  const value = data[field];
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
__name(extractJsonRpcErrorField, "extractJsonRpcErrorField");
function extractErrorCode(err) {
  if (typeof err !== "object" || err === null || !("code" in err))
    return void 0;
  const raw = err["code"];
  if (typeof raw === "string") return raw;
  if (typeof raw === "number") return String(raw);
  return void 0;
}
__name(extractErrorCode, "extractErrorCode");
var REFRESH_APPEND_BOOKKEEPING_EVENT_TYPES = /* @__PURE__ */ new Set([
  "pending_prompt_added",
  "pending_prompt_completed",
  "prompt_cancelled",
  "model_switched",
  "model_switch_failed",
  "approval_mode_changed",
  "language_changed",
  "session_metadata_updated",
  "session_cwd_changed",
  "artifact_changed",
  "settings_changed",
  "extensions_changed",
  "mcp_server_changed",
  "mcp_server_added",
  "mcp_server_removed",
  "user_shell_command",
  "user_shell_result",
  // Workspace-level fan-out (workspace service, git watcher, memory /
  // agent CRUD, device-flow registry) reaches every session bus via
  // `publishWorkspaceEvent` while idle. The `auth_device_flow_*` members
  // mirror the closed `DeviceFlowEventEmission` union — audit that union
  // when it grows.
  "tool_toggled",
  "workspace_initialized",
  "mcp_server_restarted",
  "mcp_server_restart_refused",
  "settings_reloaded",
  "trust_change_requested",
  "memory_changed",
  "agent_changed",
  "git_status_changed",
  "git_branch_changed",
  "github_setup_completed",
  "auth_device_flow_started",
  "auth_device_flow_throttled",
  "auth_device_flow_authorized",
  "auth_device_flow_failed",
  "auth_device_flow_cancelled"
]);
function isIdleBookkeepingSessionUpdate(event) {
  if (event.type !== "session_update") return false;
  const data = event.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const update = data["update"];
  if (!update || typeof update !== "object" || Array.isArray(update))
    return false;
  const updateRecord = update;
  const subtype = updateRecord["sessionUpdate"];
  if (subtype === "available_commands_update" || subtype === "current_mode_update") {
    return true;
  }
  const meta = updateRecord["_meta"];
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return false;
  return meta["source"] === "user-shell";
}
__name(isIdleBookkeepingSessionUpdate, "isIdleBookkeepingSessionUpdate");
function isRefreshAppendTurnContent(event) {
  if (event.type === "history_truncated") return false;
  if (REFRESH_APPEND_BOOKKEEPING_EVENT_TYPES.has(event.type)) return false;
  return !isIdleBookkeepingSessionUpdate(event);
}
__name(isRefreshAppendTurnContent, "isRefreshAppendTurnContent");
function classifyTurnErrorKind(message) {
  return message.trim().toLowerCase() === "terminated" ? "model_stream_interrupted" : void 0;
}
__name(classifyTurnErrorKind, "classifyTurnErrorKind");
function broadcastTurnError(entry, sessionId, err, promptId, originatorClientId, mutateTurnState) {
  const message = extractErrorMessage(err);
  const structuredErrorKind = extractJsonRpcErrorField(err, "errorKind");
  const errorKind = structuredErrorKind ?? classifyTurnErrorKind(message);
  const code = structuredErrorKind !== void 0 ? extractJsonRpcErrorField(err, "code") ?? extractErrorCode(err) : extractErrorCode(err);
  const loopType = extractJsonRpcErrorField(err, "loopType");
  if (errorKind) {
    writeServeDebugLine(
      `turn_error classified session=${JSON.stringify(sessionId)} message=${JSON.stringify(message)} errorKind=${JSON.stringify(errorKind)}` + (code ? ` code=${JSON.stringify(code)}` : "") + (promptId ? ` promptId=${JSON.stringify(promptId)}` : "")
    );
  }
  if (mutateTurnState) {
    entry.retryAllowed = true;
    entry.turnError = {
      message,
      ...code ? { code } : {},
      ...errorKind ? { errorKind } : {}
    };
  }
  try {
    const published = entry.events.publish({
      type: "turn_error",
      ...promptId ? { promptId } : {},
      data: {
        sessionId,
        message,
        ...code ? { code } : {},
        ...errorKind ? { errorKind } : {},
        ...loopType ? { loopType } : {},
        ...promptId ? { promptId } : {}
      },
      ...originatorClientId ? { originatorClientId } : {}
    });
    if (mutateTurnState) {
      entry.turnErrorEvent = published;
    }
  } catch {
  }
}
__name(broadcastTurnError, "broadcastTurnError");
var TERMINAL_TURN_STATUS_OVERLAY_LIMIT = 64;
function truncateTurnText(text) {
  const truncated = text.length > TURN_RESULT_TEXT_MAX_CHARS;
  return {
    text: truncated ? text.slice(0, TURN_RESULT_TEXT_MAX_CHARS) : text,
    truncated
  };
}
__name(truncateTurnText, "truncateTurnText");
function rememberTerminalTurnStatus(entry, pending, terminal) {
  const promptText = truncateTurnText(pending.text);
  const shared = {
    sessionId: entry.sessionId,
    promptId: pending.promptId,
    promptText: promptText.text,
    ...promptText.truncated ? { promptTextTruncated: true } : {},
    queuedAt: pending.queuedAt,
    ...pending.startedAt !== void 0 ? { startedAt: pending.startedAt } : {},
    endedAt: Date.now(),
    ...pending.originatorClientId !== void 0 ? { originatorClientId: pending.originatorClientId } : {}
  };
  const status = terminal.kind === "complete" ? {
    ...shared,
    state: terminal.result.stopReason === "cancelled" ? "cancelled" : "completed",
    ...terminal.result.stopReason !== void 0 ? { stopReason: terminal.result.stopReason } : {}
  } : terminal.kind === "cancelled" ? { ...shared, state: "cancelled", stopReason: "cancelled" } : {
    ...shared,
    state: "error",
    error: normalizeTurnResultError(terminal.err)
  };
  entry.terminalTurnStatuses.set(pending.promptId, status);
  entry.enrichedTerminalPromptIds.delete(pending.promptId);
  while (entry.terminalTurnStatuses.size > TERMINAL_TURN_STATUS_OVERLAY_LIMIT) {
    const oldest2 = entry.terminalTurnStatuses.keys().next().value;
    if (oldest2 === void 0) break;
    entry.terminalTurnStatuses.delete(oldest2);
    entry.enrichedTerminalPromptIds.delete(oldest2);
  }
}
__name(rememberTerminalTurnStatus, "rememberTerminalTurnStatus");
function rememberEnrichedTerminalTurnStatus(entry, promptId, status) {
  entry.terminalTurnStatuses.set(promptId, status);
  entry.enrichedTerminalPromptIds.add(promptId);
  while (entry.terminalTurnStatuses.size > TERMINAL_TURN_STATUS_OVERLAY_LIMIT) {
    const oldest2 = entry.terminalTurnStatuses.keys().next().value;
    if (oldest2 === void 0) break;
    entry.terminalTurnStatuses.delete(oldest2);
    entry.enrichedTerminalPromptIds.delete(oldest2);
  }
}
__name(rememberEnrichedTerminalTurnStatus, "rememberEnrichedTerminalTurnStatus");
function advanceTurnActivity(entry) {
  const createdAtMs = Date.parse(entry.createdAt);
  const previous = entry.lastTurnEndedAtMs ?? (Number.isFinite(createdAtMs) ? createdAtMs : void 0);
  entry.lastTurnEndedAtMs = previous === void 0 ? Date.now() : Math.max(Date.now(), previous + 1);
}
__name(advanceTurnActivity, "advanceTurnActivity");
function appendPromptLedgerBestEffort(entry, record) {
  const ledger = entry.promptLedger;
  if (!ledger) return;
  try {
    ledger.appendSync(entry.sessionId, record);
  } catch (error) {
    writeStderrLine(
      `qwen serve: prompt ledger append failed for session=${entry.sessionId} promptId=${record.promptId}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
__name(appendPromptLedgerBestEffort, "appendPromptLedgerBestEffort");
function promptLedgerTerminalRecord(pendingEntry, terminal) {
  const at = Date.now();
  if (terminal.kind === "complete") {
    if (terminal.result.stopReason === "cancelled") {
      return {
        v: 1,
        promptId: pendingEntry.promptId,
        terminal: "cancelled",
        at
      };
    }
    return {
      v: 1,
      promptId: pendingEntry.promptId,
      terminal: "completed",
      ...terminal.result.stopReason !== void 0 ? { stopReason: terminal.result.stopReason } : {},
      at
    };
  }
  if (terminal.kind === "cancelled") {
    return { v: 1, promptId: pendingEntry.promptId, terminal: "cancelled", at };
  }
  const normalized = normalizeTurnResultError(terminal.err);
  return {
    v: 1,
    promptId: pendingEntry.promptId,
    terminal: "error",
    ...normalized.code !== void 0 ? { code: normalized.code } : {},
    at
  };
}
__name(promptLedgerTerminalRecord, "promptLedgerTerminalRecord");
function publishPromptTerminal(entry, pendingEntry, terminal) {
  if (pendingEntry.terminalPublished) {
    writeServeDebugLine(
      `publishPromptTerminal: suppressed duplicate ${terminal.kind} terminal for prompt ${pendingEntry.promptId} (session ${entry.sessionId})`
    );
    return;
  }
  pendingEntry.terminalPublished = true;
  appendPromptLedgerBestEffort(
    entry,
    promptLedgerTerminalRecord(pendingEntry, terminal)
  );
  rememberTerminalTurnStatus(entry, pendingEntry, terminal);
  const originatorClientId = pendingEntry.originatorClientId;
  const mutateTurnState = pendingEntry.state === "running";
  if (mutateTurnState) {
    advanceTurnActivity(entry);
  }
  if (!mutateTurnState && entry.turnErrorEvent) {
    const journal = entry.events.liveJournalSnapshot() ?? [];
    if (journal.some(isRefreshAppendTurnContent)) {
      entry.turnErrorEvent = void 0;
    }
  }
  if (terminal.kind === "complete") {
    broadcastTurnComplete(
      entry,
      entry.sessionId,
      terminal.result,
      pendingEntry.promptId,
      originatorClientId,
      mutateTurnState
    );
  } else if (terminal.kind === "cancelled") {
    broadcastTurnComplete(
      entry,
      entry.sessionId,
      { stopReason: "cancelled" },
      pendingEntry.promptId,
      originatorClientId,
      mutateTurnState
    );
  } else {
    broadcastTurnError(
      entry,
      entry.sessionId,
      terminal.err,
      pendingEntry.promptId,
      originatorClientId,
      mutateTurnState
    );
  }
}
__name(publishPromptTerminal, "publishPromptTerminal");
function flushPromptTerminals(entry, code, message) {
  for (const pending of [...entry.pendingPromptList]) {
    publishPromptTerminal(entry, pending, {
      kind: "error",
      err: { code, message }
    });
    try {
      pending.abortController.abort(
        new DOMException("Prompt aborted", "AbortError")
      );
    } catch {
    }
  }
}
__name(flushPromptTerminals, "flushPromptTerminals");
function hasControlCharacter2(value) {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 31 || code === 127) {
      return true;
    }
  }
  return false;
}
__name(hasControlCharacter2, "hasControlCharacter");
function extractPromptText(prompt) {
  if (!Array.isArray(prompt)) return "";
  let hasImage = false;
  for (const block of prompt) {
    const record = block;
    if (record["type"] === "image") {
      hasImage = true;
    }
    if (record["type"] === "text" && typeof record["text"] === "string" && record["text"].length > 0) {
      return record["text"];
    }
  }
  return hasImage ? "[image]" : "";
}
__name(extractPromptText, "extractPromptText");
function liveTurnStatus(sessionId, pending) {
  const promptText = truncateTurnText(pending.text);
  return {
    sessionId,
    state: pending.state === "running" ? "running" : "queued",
    promptId: pending.promptId,
    promptText: promptText.text,
    ...promptText.truncated ? { promptTextTruncated: true } : {},
    queuedAt: pending.queuedAt,
    ...pending.startedAt !== void 0 ? { startedAt: pending.startedAt } : {},
    ...pending.originatorClientId !== void 0 ? { originatorClientId: pending.originatorClientId } : {}
  };
}
__name(liveTurnStatus, "liveTurnStatus");
function findLiveTurnStatus(entry, promptId) {
  const live = entry.pendingPromptList.filter(
    (pending) => !pending.terminalPublished && (!pending.removed || pending.state === "running")
  );
  if (promptId !== void 0) {
    const match = live.find((pending) => pending.promptId === promptId);
    return match ? liveTurnStatus(entry.sessionId, match) : void 0;
  }
  const running = live.find((pending) => pending.state === "running");
  if (running) return liveTurnStatus(entry.sessionId, running);
  const queued = live.find((pending) => pending.state === "queued");
  return queued ? liveTurnStatus(entry.sessionId, queued) : void 0;
}
__name(findLiveTurnStatus, "findLiveTurnStatus");
function settledTurnStatus(sessionId, record) {
  return {
    sessionId,
    state: record.state,
    promptId: record.promptId,
    ...record.stopReason !== void 0 ? { stopReason: record.stopReason } : {},
    ...record.error !== void 0 ? { error: record.error } : {},
    ...record.startedAt !== void 0 ? { startedAt: record.startedAt } : {},
    endedAt: record.endedAt,
    ...record.promptText !== void 0 ? { promptText: record.promptText } : {},
    ...record.promptTextTruncated !== void 0 ? { promptTextTruncated: record.promptTextTruncated } : {},
    ...record.resultText !== void 0 ? { resultText: record.resultText } : {},
    ...record.resultTruncated !== void 0 ? { resultTruncated: record.resultTruncated } : {},
    ...record.resultTruncated === true ? { resultCode: record.resultCode ?? TURN_RESULT_CODE_TEXT_TRUNCATED } : {},
    ...record.originatorClientId !== void 0 ? { originatorClientId: record.originatorClientId } : {}
  };
}
__name(settledTurnStatus, "settledTurnStatus");
function enrichTerminalTurnStatus(terminal, persisted) {
  return {
    ...terminal,
    // The bridge's display projection is trusted; the child-recorded text
    // only backfills when the terminal has none, so hidden channel context
    // the child derived from raw blocks never replaces it.
    ...terminal.promptText === void 0 && persisted.promptText !== void 0 ? { promptText: persisted.promptText } : {},
    ...terminal.promptTextTruncated === void 0 && persisted.promptTextTruncated !== void 0 ? { promptTextTruncated: persisted.promptTextTruncated } : {},
    ...persisted.resultText !== void 0 ? { resultText: persisted.resultText } : {},
    ...persisted.resultTruncated !== void 0 ? { resultTruncated: persisted.resultTruncated } : {},
    ...persisted.resultCode !== void 0 ? { resultCode: persisted.resultCode } : {},
    ...terminal.originatorClientId === void 0 && persisted.originatorClientId !== void 0 ? { originatorClientId: persisted.originatorClientId } : {}
  };
}
__name(enrichTerminalTurnStatus, "enrichTerminalTurnStatus");
function mergeTerminalWithPersisted(terminal, persisted) {
  if (terminal.state === "error" && persisted.state !== "error") {
    return {
      ...persisted,
      ...terminal.promptText !== void 0 ? { promptText: terminal.promptText } : {},
      ...terminal.promptTextTruncated !== void 0 ? { promptTextTruncated: terminal.promptTextTruncated } : {}
    };
  }
  return enrichTerminalTurnStatus(terminal, persisted);
}
__name(mergeTerminalWithPersisted, "mergeTerminalWithPersisted");
function latestTerminalTurnStatus(entry) {
  let latest;
  for (const status of entry.terminalTurnStatuses.values()) {
    if ((status.endedAt ?? 0) >= (latest?.endedAt ?? 0)) latest = status;
  }
  return latest;
}
__name(latestTerminalTurnStatus, "latestTerminalTurnStatus");
function extractMediaBlocks(prompt) {
  if (!Array.isArray(prompt)) return void 0;
  const media = [];
  for (const block of prompt) {
    if (!block || typeof block !== "object") continue;
    if (block.type === "image" || block.type === "audio" || block.type === "resource" && "attachmentId" in block) {
      media.push(block);
    }
  }
  return media.length > 0 ? media : void 0;
}
__name(extractMediaBlocks, "extractMediaBlocks");
var DEFAULT_INIT_TIMEOUT_MS = 1e4;
var PERSIST_TIMEOUT_MS = 5e3;
var MAX_PARENT_PERSIST_ATTEMPTS = 3;
var MCP_RESTART_TIMEOUT_MS = 3e5;
var WORKSPACE_MEMORY_REMEMBER_TIMEOUT_MS = 3e5;
var MCP_OAUTH_TIMEOUT_MS = 6e5;
var DAEMON_RETRY_META_KEY = "qwen.daemon.retry";
var DAEMON_CONTINUE_META_KEY = "qwen.daemon.continueLastTurn";
var SESSION_RECAP_TIMEOUT_MS = 6e4;
var SESSION_GENERATION_TIMEOUT_MS = 65e3;
var GENERATION_STREAM_QUEUE_CAPACITY = 128;
var SESSION_BTW_TIMEOUT_MS = 6e4;
var SESSION_TRANSCRIPT_TIMEOUT_MS = 6e4;
var MAX_EMPTY_TRANSCRIPT_PAGES = 20;
var SHELL_COMMAND_TIMEOUT_MS = 12e4;
var MAX_SHELL_OUTPUT_FOR_HISTORY = 1e4;
var MAX_MID_TURN_QUEUE_DEPTH = 20;
var MAX_QUEUED_INLINE_ATTACHMENT_BYTES = 100 * 1024 * 1024;
function inlineAttachmentBlockBytes(blocks) {
  let total = 0;
  for (const block of blocks) {
    if (block.type === "image" && "data" in block) {
      total += Buffer.byteLength(block.data);
      continue;
    }
    if (block.type !== "resource" || !("resource" in block)) continue;
    const resource = block.resource;
    if ("blob" in resource) total += Buffer.byteLength(resource.blob);
    else if ("text" in resource) total += Buffer.byteLength(resource.text);
  }
  return total;
}
__name(inlineAttachmentBlockBytes, "inlineAttachmentBlockBytes");
var DEFAULT_MAX_SESSIONS = 32;
var DEFAULT_MAX_PENDING_PROMPTS_PER_SESSION = 5;
var CHAT_RECORD_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
var MAX_EVENT_RING_SIZE = 1e6;
var DEFAULT_PERMISSION_TIMEOUT_MS = 0;
var DEFAULT_MAX_PENDING_PER_SESSION = 64;
var DEFAULT_SESSION_REAP_INTERVAL_MS = 6e4;
var DEFAULT_SESSION_IDLE_TIMEOUT_MS = 30 * 6e4;
function createAcpSessionBridge(opts) {
  let liveScreenContextCaptureHandler;
  let liveTaskToolRequestHandler;
  let liveSpeakToUserHandler;
  const defaultSessionScope = opts.sessionScope ?? "single";
  const delegateReadTextFileToClient = opts.delegateReadTextFileToClient ?? true;
  let maxSessions;
  if (opts.maxSessions === void 0) {
    maxSessions = DEFAULT_MAX_SESSIONS;
  } else if (Number.isNaN(opts.maxSessions)) {
    throw new TypeError(
      `Invalid maxSessions: NaN. Must be a number >= 0 (0 / Infinity = unlimited).`
    );
  } else if (opts.maxSessions < 0) {
    throw new TypeError(
      `Invalid maxSessions: ${opts.maxSessions}. Must be >= 0 (0 / Infinity = unlimited).`
    );
  } else if (opts.maxSessions === 0 || opts.maxSessions === Infinity) {
    maxSessions = Infinity;
  } else {
    maxSessions = opts.maxSessions;
  }
  const freshSessionBlocker = /* @__PURE__ */ __name(() => {
    for (const ci of aliveChannels) {
      if (ci.isDying) continue;
      if (ci.isQuarantined) {
        return { channel: ci, reason: "restore_cleanup_failed" };
      }
      if (ci.restoreSettlementOverdue) {
        return { channel: ci, reason: "restore_settlement_overdue" };
      }
    }
    return void 0;
  }, "freshSessionBlocker");
  const assertFreshSessionsAvailable = /* @__PURE__ */ __name(() => {
    const blocker = freshSessionBlocker();
    if (blocker) {
      throw new BridgeChannelQuarantinedError(
        blocker.reason,
        abandonedRestoreRetryAfterSeconds
      );
    }
  }, "assertFreshSessionsAvailable");
  const reserveFreshSession = /* @__PURE__ */ __name((context) => {
    assertFreshSessionsAvailable();
    return opts.freshSessionAdmission?.(context);
  }, "reserveFreshSession");
  const releaseFreshSessionReservation = /* @__PURE__ */ __name((reservation) => {
    if (!reservation) return;
    try {
      reservation.release();
    } catch (err) {
      opts.onDiagnosticLine?.(
        `qwen serve: fresh session admission release failed: ${err instanceof Error ? err.message : String(err)}`,
        "warn"
      );
    }
  }, "releaseFreshSessionReservation");
  const sessionCatalogGeneration = randomUUID();
  let sessionCatalogRevision = 0;
  const getSessionCatalogVersion = /* @__PURE__ */ __name(() => ({
    generation: sessionCatalogGeneration,
    revision: sessionCatalogRevision
  }), "getSessionCatalogVersion");
  const markSessionCatalogChanged = /* @__PURE__ */ __name(() => {
    sessionCatalogRevision += 1;
  }, "markSessionCatalogChanged");
  const emitSessionLifecycle = /* @__PURE__ */ __name((event) => {
    markSessionCatalogChanged();
    try {
      opts.sessionLifecycle?.(event);
    } catch (err) {
      const message = `qwen serve: session lifecycle callback failed: ${err instanceof Error ? err.message : String(err)}`;
      opts.onDiagnosticLine?.(message, "warn");
      writeStderrLine(message);
    }
  }, "emitSessionLifecycle");
  if (defaultSessionScope !== "single" && defaultSessionScope !== "thread") {
    throw new TypeError(
      `Invalid sessionScope: ${JSON.stringify(defaultSessionScope)}. Expected 'single' or 'thread'.`
    );
  }
  const eventRingSize = opts.eventRingSize ?? DEFAULT_RING_SIZE;
  if (!Number.isInteger(eventRingSize) || eventRingSize < 1 || eventRingSize > MAX_EVENT_RING_SIZE) {
    throw new TypeError(
      `Invalid eventRingSize: ${opts.eventRingSize}. Must be a positive integer in [1, ${MAX_EVENT_RING_SIZE}].`
    );
  }
  const compactedReplayMaxBytes = normalizeCompactedReplayMaxBytes(
    opts.compactedReplayMaxBytes
  );
  const maxJournalEvents = normalizeMaxJournalEvents(opts.maxJournalEvents);
  const maxJournalBytes = normalizeMaxJournalBytes(opts.maxJournalBytes);
  const journalGrowthPoolBytes = normalizeJournalGrowthPoolBytes(
    opts.journalGrowthPoolBytes
  );
  const journalGrowthPolicy = journalGrowthPoolBytes !== void 0 ? createJournalGrowthPolicy({
    baselineEvents: maxJournalEvents,
    baselineBytes: maxJournalBytes,
    poolBytes: journalGrowthPoolBytes,
    hardCapBytes: JOURNAL_GROWTH_HARD_CAP_BYTES
  }) : void 0;
  const journalGrowthSessionLimits = opts.journalGrowthSessionLimits;
  const channelFactory = opts.channelFactory ?? defaultSpawnChannelFactory;
  const childEnvOverrides = opts.childEnvOverrides ? Object.freeze({ ...opts.childEnvOverrides }) : Object.freeze({});
  const initTimeoutMs = opts.initializeTimeoutMs ?? DEFAULT_INIT_TIMEOUT_MS;
  if (initTimeoutMs <= 0) {
    throw new TypeError(
      `Invalid initializeTimeoutMs: ${initTimeoutMs}. Must be > 0.`
    );
  }
  const sessionRestoreTimeoutMs = resolveSessionRestoreTimeoutMs(opts);
  const restoreSettlementGraceMs = sessionRestoreTimeoutMs;
  const abandonedRestoreRetryAfterSeconds = restoreRetryAfterSeconds(
    sessionRestoreTimeoutMs
  );
  const permissionTimeoutRaw = opts.permissionResponseTimeoutMs ?? DEFAULT_PERMISSION_TIMEOUT_MS;
  const permissionTimeoutMs = permissionTimeoutRaw > 0 && Number.isFinite(permissionTimeoutRaw) ? (
    // Clamp to 2^31-1: Node treats setTimeout delays larger than
    // this as 1ms (TimeoutOverflowWarning), which would make a
    // huge "effectively never" timeout cancel prompts almost
    // immediately — the opposite of intent. Mirrors the sibling
    // `resolvePositiveFiniteMs` / `resolvedChannelIdleTimeoutMs`.
    Math.min(permissionTimeoutRaw, 2147483647)
  ) : 0;
  const maxPendingRaw = opts.maxPendingPermissionsPerSession ?? DEFAULT_MAX_PENDING_PER_SESSION;
  const maxPendingPerSession = maxPendingRaw > 0 && Number.isFinite(maxPendingRaw) ? maxPendingRaw : Infinity;
  const maxPendingPromptsRaw = opts.maxPendingPromptsPerSession ?? DEFAULT_MAX_PENDING_PROMPTS_PER_SESSION;
  let maxPendingPromptsPerSession;
  if (maxPendingPromptsRaw === 0 || maxPendingPromptsRaw === Number.POSITIVE_INFINITY) {
    maxPendingPromptsPerSession = Infinity;
  } else if (!Number.isInteger(maxPendingPromptsRaw) || maxPendingPromptsRaw < 0) {
    throw new TypeError(
      `Invalid maxPendingPromptsPerSession: ${maxPendingPromptsRaw}. Must be a non-negative integer (0 / Infinity = unlimited).`
    );
  } else {
    maxPendingPromptsPerSession = maxPendingPromptsRaw;
  }
  if (!path2.isAbsolute(opts.boundWorkspace)) {
    throw new TypeError(
      `Invalid boundWorkspace: "${opts.boundWorkspace}". Must be an absolute path.`
    );
  }
  const boundWorkspace = opts.boundWorkspace;
  const persistApprovalMode = opts.persistApprovalMode;
  const telemetry = opts.telemetry ?? NOOP_BRIDGE_TELEMETRY;
  let defaultEntry;
  let channelInfo;
  let workspaceMcpStatusCache;
  const workspaceMcpToolsCache = /* @__PURE__ */ new Map();
  const workspaceMcpResourcesCache = /* @__PURE__ */ new Map();
  let idleTimer;
  const sessionReapIntervalMs = resolvePositiveFiniteMs(
    opts.sessionReapIntervalMs,
    DEFAULT_SESSION_REAP_INTERVAL_MS
  );
  const sessionIdleTimeoutMs = resolvePositiveFiniteMs(
    opts.sessionIdleTimeoutMs,
    DEFAULT_SESSION_IDLE_TIMEOUT_MS
  );
  let sessionReaper;
  let lastActivityTimestamp = null;
  let activePromptCounter = 0;
  function touchActivity() {
    lastActivityTimestamp = Date.now();
  }
  __name(touchActivity, "touchActivity");
  function entryHasLocalWork(entry) {
    return entry.pendingPromptCount > 0 || entry.pendingAgentNotificationCount > 0;
  }
  __name(entryHasLocalWork, "entryHasLocalWork");
  function childHoldsAreFresh(entry, capability) {
    if (entry.childHoldsAt === null) return false;
    return Date.now() - entry.childHoldsAt <= capability.intervalMs * ACTIVE_WORK_STALE_INTERVALS;
  }
  __name(childHoldsAreFresh, "childHoldsAreFresh");
  function childReportsHeldWork(entry) {
    const owner = channelInfoForEntry(entry);
    if (!owner?.activeWork) return false;
    if (!childHoldsAreFresh(entry, owner.activeWork)) return false;
    return entry.childHolds !== null && entry.childHolds.size > 0;
  }
  __name(childReportsHeldWork, "childReportsHeldWork");
  function childWorkIsUnknown(entry) {
    const owner = channelInfoForEntry(entry);
    if (!owner?.activeWork) return false;
    return !childHoldsAreFresh(entry, owner.activeWork);
  }
  __name(childWorkIsUnknown, "childWorkIsUnknown");
  function entryHasActiveWork(entry) {
    return entryHasLocalWork(entry) || childReportsHeldWork(entry) || childWorkIsUnknown(entry);
  }
  __name(entryHasActiveWork, "entryHasActiveWork");
  function entryIsAutoCloseCandidate(entry) {
    if (byId.get(entry.sessionId) !== entry) return false;
    if (isClosingOrAuthorizingClose(entry)) return false;
    if (entry.events.subscriberCount > 0) return false;
    if (entryHasLocalWork(entry)) return false;
    const owner = channelInfoForEntry(entry);
    if (owner?.pendingRestoreIds.has(entry.sessionId)) return false;
    const capability = owner?.activeWork;
    if (capability && !owner.isQuarantined && !owner.restoreSettlementOverdue && ACTIVE_WORK_HOLD_CATEGORIES.some(
      (category) => !capability.categories.includes(category)
    )) {
      return false;
    }
    return !childReportsHeldWork(entry);
  }
  __name(entryIsAutoCloseCandidate, "entryIsAutoCloseCandidate");
  function isClosingOrAuthorizingClose(entry) {
    return entry.closing || entry.activeWorkCloseInFlight;
  }
  __name(isClosingOrAuthorizingClose, "isClosingOrAuthorizingClose");
  async function maybeCloseIdleSession(entry, reason) {
    if (byId.get(entry.sessionId) === entry && !isClosingOrAuthorizingClose(entry) && entry.spawnOwnerWantedKill && entry.attachCount === 0) {
      writeStderrLine(
        `qwen serve: completing deferred kill of session ${JSON.stringify(entry.sessionId)} (${reason})`
      );
      await bridgeApi.killSession(entry.sessionId).catch(() => {
      });
      return;
    }
    if (!entryIsAutoCloseCandidate(entry)) return;
    if (entry.clientIds.size > 0) return;
    await closeIfChildUnheld(entry, {
      trigger: reason,
      closeReason: "last_client_detached"
    });
  }
  __name(maybeCloseIdleSession, "maybeCloseIdleSession");
  async function closeIfChildUnheld(entry, opts2) {
    entry.activeWorkCloseInFlight = true;
    try {
      if (!await confirmChildUnheld(entry)) return;
      if (byId.get(entry.sessionId) !== entry) return;
      const condemnedOwner = channelInfoForEntry(entry);
      const agentCloseTimeoutMs = condemnedOwner?.isQuarantined === true || condemnedOwner?.restoreSettlementOverdue === true ? ACTIVE_WORK_CLOSE_TIMEOUT_MS : void 0;
      await closeSessionImpl(entry.sessionId, void 0, {
        reason: opts2.closeReason,
        ...agentCloseTimeoutMs !== void 0 ? { agentCloseTimeoutMs } : {}
      }).catch((err) => {
        writeStderrLine(
          `qwen serve: deferred close (${opts2.trigger}) failed for ${JSON.stringify(entry.sessionId)}: ${err instanceof Error ? err.stack ?? err.message : String(err)}`
        );
      });
    } finally {
      entry.activeWorkCloseInFlight = false;
    }
  }
  __name(closeIfChildUnheld, "closeIfChildUnheld");
  async function confirmChildUnheld(entry) {
    const info = channelInfoForEntry(entry);
    if (!info?.activeWork) return true;
    if (info.isDying) return false;
    if (info.isQuarantined || info.restoreSettlementOverdue) return true;
    try {
      const response = await withTimeout(
        entry.connection.extMethod(SERVE_CONTROL_EXT_METHODS.sessionClose, {
          sessionId: entry.sessionId,
          [ACTIVE_WORK_CLOSE_IF_UNHELD_PARAM]: true,
          drainTimeoutMs: sessionCloseDrainBudgetMs(
            ACTIVE_WORK_CLOSE_TIMEOUT_MS
          )
        }),
        ACTIVE_WORK_CLOSE_TIMEOUT_MS,
        SERVE_CONTROL_EXT_METHODS.sessionClose
      );
      if (response["closed"] === true) {
        return true;
      }
      const holds = response["holds"];
      if (Array.isArray(holds) && holds.length <= ACTIVE_WORK_MAX_SESSION_HOLDS) {
        const adopted = /* @__PURE__ */ new Map();
        for (const hold of holds) {
          if (typeof hold !== "object" || hold === null) continue;
          const record = hold;
          const id = record["id"];
          const category = record["category"];
          if (typeof id === "string" && typeof category === "string" && ACTIVE_WORK_HOLD_CATEGORIES.includes(
            category
          )) {
            adopted.set(id, category);
          }
        }
        entry.childHolds = adopted;
        entry.childHoldsAt = Date.now();
      }
      return false;
    } catch (err) {
      writeStderrLine(
        `qwen serve: close-if-unheld for session ${JSON.stringify(entry.sessionId)} did not resolve (${err instanceof Error ? err.message : String(err)}); leaving it in place for the next snapshot to settle`
      );
      return false;
    }
  }
  __name(confirmChildUnheld, "confirmChildUnheld");
  function applyActiveWorkSnapshot(info, snapshot) {
    if (!info.activeWork || info.isDying) return;
    if (snapshot.seq <= info.activeWork.seq) return;
    info.activeWork.seq = snapshot.seq;
    const now = Date.now();
    const reported = /* @__PURE__ */ new Map();
    for (const session of snapshot.sessions) {
      const holds = /* @__PURE__ */ new Map();
      for (const hold of session.holds) holds.set(hold.id, hold.category);
      reported.set(session.sessionId, holds);
    }
    for (const sessionId of Array.from(info.sessionIds)) {
      const entry = byId.get(sessionId);
      if (!entry || entry.channel !== info.channel) continue;
      const holds = reported.get(sessionId) ?? /* @__PURE__ */ new Map();
      const previouslyHeld = entry.childHolds ? entry.childHolds.size > 0 : void 0;
      entry.childHolds = holds;
      entry.childHoldsAt = now;
      if (previouslyHeld !== void 0 && previouslyHeld !== holds.size > 0) {
        touchActivity();
      }
      if (holds.size === 0) {
        void maybeCloseIdleSession(
          entry,
          reported.has(sessionId) ? "child_idle" : "child_dropped"
        );
      }
    }
  }
  __name(applyActiveWorkSnapshot, "applyActiveWorkSnapshot");
  function settleActivePromptState(entry, promptId) {
    if (entry.activePromptId !== promptId) return;
    delete entry.activePromptId;
    delete entry.activePromptOriginatorClientId;
    if (entry.promptActive) {
      entry.promptActive = false;
      activePromptCounter--;
      entry.sessionLastSeenAt = Date.now();
      touchActivity();
    }
  }
  __name(settleActivePromptState, "settleActivePromptState");
  function resolvePositiveFiniteMs(raw, fallback) {
    if (raw === void 0) return fallback;
    return raw > 0 && Number.isFinite(raw) ? Math.min(raw, 2147483647) : 0;
  }
  __name(resolvePositiveFiniteMs, "resolvePositiveFiniteMs");
  function cancelIdleTimer() {
    if (idleTimer !== void 0) {
      clearTimeout(idleTimer);
      idleTimer = void 0;
    }
  }
  __name(cancelIdleTimer, "cancelIdleTimer");
  function channelUnavailableReject(channel, context) {
    const unavailable = channel.transportFailed ? Promise.race([channel.exited, channel.transportFailed]) : channel.exited;
    const reject = /* @__PURE__ */ __name(() => {
      throw new BridgeChannelClosedError(context);
    }, "reject");
    return unavailable.then(reject, reject);
  }
  __name(channelUnavailableReject, "channelUnavailableReject");
  async function killChannelWithLog(ci, context) {
    ci.isDying = true;
    ci.channelLiveness?.stop();
    await ci.channel.kill().catch((err) => {
      writeStderrLine(
        `qwen serve: channel kill failed${context ? ` (${context})` : ""}: ${String(err)}`
      );
    });
  }
  __name(killChannelWithLog, "killChannelWithLog");
  function resolvedChannelIdleTimeoutMs() {
    const raw = opts.channelIdleTimeoutMs;
    return raw !== void 0 && Number.isFinite(raw) && raw > 0 ? Math.min(raw, 2147483647) : 0;
  }
  __name(resolvedChannelIdleTimeoutMs, "resolvedChannelIdleTimeoutMs");
  async function startIdleTimer(ci, context) {
    const timeoutMs = resolvedChannelIdleTimeoutMs();
    if (timeoutMs <= 0) {
      await killChannelWithLog(ci, context);
      return;
    }
    cancelIdleTimer();
    idleTimer = setTimeout(() => {
      idleTimer = void 0;
      if (hasNoChannelWork(ci)) {
        writeStderrLine(
          `qwen serve: idle timeout (${timeoutMs}ms) expired, killing channel`
        );
        void killChannelWithLog(ci, "idle timeout");
      }
    }, timeoutMs);
    idleTimer.unref();
  }
  __name(startIdleTimer, "startIdleTimer");
  function hasNoChannelWork(ci, opts2) {
    const inFlightSpawnCount = ci.sessionSpawnsInFlight - (opts2?.ignoreCurrentSessionSpawn === true ? 1 : 0);
    const pendingRestoreCount = ci.pendingRestoreIds.size - (opts2?.ignoreRestoreId !== void 0 && ci.pendingRestoreIds.has(opts2.ignoreRestoreId) ? 1 : 0);
    return ci.sessionIds.size === 0 && pendingRestoreCount === 0 && ci.workspaceControlInFlight === 0 && !ci.workspaceMcpDiscoveryInFlight && ci.workspaceMcpAuthenticationServerNames.size === 0 && inFlightSpawnCount === 0;
  }
  __name(hasNoChannelWork, "hasNoChannelWork");
  function beginWorkspaceMcpDiscovery(ci) {
    workspaceMcpStatusCache = void 0;
    workspaceMcpToolsCache.clear();
    workspaceMcpResourcesCache.clear();
    ci.workspaceMcpDiscoveryInFlight = true;
    if (ci.workspaceMcpDiscoveryTimer) {
      clearTimeout(ci.workspaceMcpDiscoveryTimer);
    }
    ci.workspaceMcpDiscoveryTimer = setTimeout(() => {
      ci.workspaceMcpDiscoveryTimer = void 0;
      ci.workspaceMcpDiscoveryInFlight = false;
      ci.workspaceMcpDiscoveryRequested = false;
      if (hasNoChannelWork(ci)) {
        void startIdleTimer(ci, "workspace MCP discovery timeout");
      }
    }, MCP_RESTART_TIMEOUT_MS);
    ci.workspaceMcpDiscoveryTimer.unref();
  }
  __name(beginWorkspaceMcpDiscovery, "beginWorkspaceMcpDiscovery");
  function finishWorkspaceMcpDiscovery(ci) {
    ci.workspaceMcpDiscoveryInFlight = false;
    if (ci.workspaceMcpDiscoveryTimer) {
      clearTimeout(ci.workspaceMcpDiscoveryTimer);
      ci.workspaceMcpDiscoveryTimer = void 0;
    }
  }
  __name(finishWorkspaceMcpDiscovery, "finishWorkspaceMcpDiscovery");
  function invalidateWorkspaceMcpDetailCache(serverName) {
    workspaceMcpToolsCache.delete(serverName);
    workspaceMcpResourcesCache.delete(serverName);
  }
  __name(invalidateWorkspaceMcpDetailCache, "invalidateWorkspaceMcpDetailCache");
  function channelShouldReapWhenIdle(ci) {
    return ci.emptyReapPending || ci.unsettledAbandonedRestores.size > 0 || ci.isQuarantined;
  }
  __name(channelShouldReapWhenIdle, "channelShouldReapWhenIdle");
  function armRestoreSettlementGrace(ci, sessionId, action) {
    if (ci.restoreSettlementTimers.has(sessionId)) return;
    const timer = setTimeout(() => {
      ci.restoreSettlementTimers.delete(sessionId);
      if (!ci.unsettledAbandonedRestores.has(sessionId)) return;
      if (ci.isDying || !aliveChannels.has(ci)) return;
      ci.restoreSettlementOverdue = true;
      writeStderrLine(
        `qwen serve: abandoned session/${action} for ${JSON.stringify(sessionId)} has not settled ${restoreSettlementGraceMs}ms after its deadline; refusing fresh sessions on channel ${ci.id} until it drains`
      );
      telemetry.event("session.restore.settlement_overdue", {
        "qwen-code.daemon.session_restore.action": action,
        "qwen-code.daemon.session_restore.timeout_ms": sessionRestoreTimeoutMs,
        "qwen-code.daemon.session_restore.settlement_grace_ms": restoreSettlementGraceMs,
        "qwen-code.daemon.acp_channel.id": ci.id,
        "session.id": sessionId
      });
      void reapPendingEmptyChannel(ci);
    }, restoreSettlementGraceMs);
    timer.unref();
    ci.restoreSettlementTimers.set(sessionId, timer);
  }
  __name(armRestoreSettlementGrace, "armRestoreSettlementGrace");
  async function reapPendingEmptyChannel(ci) {
    if (!channelShouldReapWhenIdle(ci) || !hasNoChannelWork(ci)) return;
    ci.emptyReapPending = false;
    ci.isDying = true;
    ci.channelLiveness?.stop();
    await ci.channel.kill().catch(() => {
    });
  }
  __name(reapPendingEmptyChannel, "reapPendingEmptyChannel");
  async function withWorkspaceControl(ci, fn) {
    ci.workspaceControlInFlight++;
    try {
      return await fn();
    } finally {
      ci.workspaceControlInFlight = Math.max(
        0,
        ci.workspaceControlInFlight - 1
      );
      await reapPendingEmptyChannel(ci);
    }
  }
  __name(withWorkspaceControl, "withWorkspaceControl");
  function startSessionReaper() {
    if (sessionReapIntervalMs <= 0) return;
    writeStderrLine(
      `qwen serve: session reaper started (interval ${sessionReapIntervalMs}ms, idle threshold ${sessionIdleTimeoutMs}ms)`
    );
    sessionReaper = setInterval(() => {
      if (shuttingDown) return;
      const now = Date.now();
      for (const [id, entry] of byId) {
        if (sessionIdleTimeoutMs <= 0) break;
        if (!entryIsAutoCloseCandidate(entry)) continue;
        const lastActive = entry.sessionLastSeenAt ?? Date.parse(entry.createdAt);
        const idle = now - lastActive;
        if (idle < sessionIdleTimeoutMs) continue;
        writeStderrLine(
          `qwen serve: reaping idle session ${JSON.stringify(id)} (idle for ${Math.round(idle / 1e3)}s, threshold ${Math.round(sessionIdleTimeoutMs / 1e3)}s)`
        );
        void closeIfChildUnheld(entry, {
          trigger: "idle_timeout",
          closeReason: "idle_timeout"
        });
      }
    }, sessionReapIntervalMs);
    sessionReaper.unref();
  }
  __name(startSessionReaper, "startSessionReaper");
  function stopSessionReaper() {
    if (sessionReaper !== void 0) {
      clearInterval(sessionReaper);
      sessionReaper = void 0;
    }
  }
  __name(stopSessionReaper, "stopSessionReaper");
  const aliveChannels = /* @__PURE__ */ new Set();
  let inFlightChannelSpawn;
  const byId = /* @__PURE__ */ new Map();
  const forwardRunningPromptCancel = /* @__PURE__ */ __name(async (entry, pending, notification) => {
    if (pending.cancelForwardInitial) {
      return pending.cancelForwardInitial;
    }
    const initial = (async () => {
      try {
        const extension = entry.connection.extMethod(PROMPT_CANCEL_METHOD, notification).then((result2) => ({ kind: "result", result: result2 }));
        const outcome = await Promise.race([
          extension,
          getTransportClosedReject(entry),
          ...pending.cancelForwardDeadline ? [
            pending.cancelForwardDeadline.then(() => ({
              kind: "deadline"
            }))
          ] : []
        ]);
        if (outcome.kind === "deadline") return;
        const { result } = outcome;
        if (typeof result["cancelled"] !== "boolean") {
          throw new Error(
            `${PROMPT_CANCEL_METHOD} returned an invalid acknowledgement`
          );
        }
      } catch (error) {
        if (typeof error === "object" && error !== null && "code" in error && error.code === -32601 || isNotCurrentlyGeneratingCancelError(error)) {
          await Promise.race([
            entry.connection.cancel(notification),
            getTransportClosedReject(entry),
            ...pending.cancelForwardDeadline ? [pending.cancelForwardDeadline] : []
          ]);
          return;
        }
        throw error;
      }
    })().catch((error) => {
      if (pending.cancelForwardInitial === initial) {
        delete pending.cancelForwardInitial;
      }
      throw error;
    });
    pending.cancelForwardInitial = initial;
    pending.cancelForwardDrain = initial;
    void initial.catch(() => {
    });
    return initial;
  }, "forwardRunningPromptCancel");
  const generationRequests = /* @__PURE__ */ new Map();
  const workspaceGenerationRequests = /* @__PURE__ */ new Map();
  const inFlightExtensionRefreshes = /* @__PURE__ */ new Map();
  const clearInFlightExtensionRefreshes = /* @__PURE__ */ __name((connection) => {
    for (const [sessionId, refresh] of inFlightExtensionRefreshes) {
      if (refresh.connection === connection) {
        refresh.rejectUnavailable();
        inFlightExtensionRefreshes.delete(sessionId);
      }
    }
  }, "clearInFlightExtensionRefreshes");
  const toSessionSummary = /* @__PURE__ */ __name((entry) => {
    let isWaitingForPermission = false;
    let isWaitingForUserQuestion = false;
    for (const interaction of entry.pendingInteractions.values()) {
      if (interaction.kind === "user_question") {
        isWaitingForUserQuestion = true;
      } else {
        isWaitingForPermission = true;
      }
    }
    return {
      sessionId: entry.sessionId,
      workspaceCwd: entry.workspaceCwd,
      createdAt: entry.createdAt,
      ...entry.lastTurnEndedAtMs !== void 0 ? { updatedAt: new Date(entry.lastTurnEndedAtMs).toISOString() } : {},
      displayName: entry.displayName,
      ...entry.parentSessionId ? { parentSessionId: entry.parentSessionId } : {},
      ...entry.sourceType ? { sourceType: entry.sourceType } : {},
      ...entry.sourceId !== void 0 ? { sourceId: entry.sourceId } : {},
      clientCount: entry.clientIds.size,
      hasActivePrompt: entry.promptActive || entry.goalTurnActive === true,
      isWaitingForPermission,
      isWaitingForUserQuestion,
      pendingInteractionCount: entry.pendingInteractions.size,
      hasTurnError: entry.turnError !== void 0,
      ...entry.turnError !== void 0 ? { turnError: entry.turnError } : {},
      pendingInteractions: [...entry.pendingInteractions.values()],
      ...entry.worktree ? { worktree: entry.worktree } : {},
      ...entry.branch ? { branch: entry.branch } : {},
      ...entry.prs && entry.prs.length > 0 ? { prs: entry.prs } : {}
    };
  }, "toSessionSummary");
  const permissionConsensusQuorum = opts.permissionConsensusQuorum;
  if (permissionConsensusQuorum !== void 0 && (!Number.isInteger(permissionConsensusQuorum) || permissionConsensusQuorum < 1)) {
    throw new Error(
      `BridgeOptions.permissionConsensusQuorum must be a positive integer; got ${String(permissionConsensusQuorum)}`
    );
  }
  const permissionAudit = opts.permissionAudit ?? createNoOpPermissionAuditPublisher();
  const permissionMediator = new MultiClientPermissionMediator(
    opts.permissionPolicy ?? "first-responder",
    {
      emit: /* @__PURE__ */ __name((sessionId, event) => {
        const sessionEntry = byId.get(sessionId);
        sessionEntry?.events.publish(event);
      }, "emit"),
      audit: permissionAudit,
      ...permissionConsensusQuorum !== void 0 ? { consensusQuorum: permissionConsensusQuorum } : {},
      now: /* @__PURE__ */ __name(() => Date.now(), "now"),
      votersForSession: /* @__PURE__ */ __name((sessionId) => {
        const sessionEntry = byId.get(sessionId);
        if (!sessionEntry) return /* @__PURE__ */ new Set();
        return new Set(sessionEntry.clientIds.keys());
      }, "votersForSession")
    }
  );
  let shuttingDown = false;
  let shutdownPromise;
  const teeServeDebugLine = /* @__PURE__ */ __name((message) => {
    writeServeDebugLine(message);
    if (opts.onDiagnosticLine && isServeDebugLoggingEnabled()) {
      opts.onDiagnosticLine(`qwen serve debug: ${message}`, "info");
    }
  }, "teeServeDebugLine");
  const inFlightSpawns = /* @__PURE__ */ new Map();
  const inFlightRequestedSessionSpawns = /* @__PURE__ */ new Map();
  const inFlightRestores = /* @__PURE__ */ new Map();
  const pendingRestoreEvents = /* @__PURE__ */ new Map();
  const journalSessionLimits = /* @__PURE__ */ __name(() => {
    const limits = [...byId.values()].map((entry) => ({
      limitBytes: entry.events.journalLimitBytes() ?? maxJournalBytes,
      baselineBytes: maxJournalBytes
    }));
    for (const [restoreId, bus] of pendingRestoreEvents) {
      if (!byId.has(restoreId)) {
        limits.push({
          limitBytes: bus.journalLimitBytes() ?? maxJournalBytes,
          baselineBytes: maxJournalBytes
        });
      }
    }
    return limits;
  }, "journalSessionLimits");
  const unregisterJournalGrowthSessionLimits = journalGrowthPolicy !== void 0 && opts.registerJournalGrowthSessionLimits !== void 0 ? opts.registerJournalGrowthSessionLimits(journalSessionLimits) : void 0;
  const createClientId = /* @__PURE__ */ __name(() => `client_${randomUUID()}`, "createClientId");
  const registerClient = /* @__PURE__ */ __name((entry, requestedClientId) => {
    if (requestedClientId && entry.clientIds.has(requestedClientId)) {
      entry.clientIds.set(
        requestedClientId,
        (entry.clientIds.get(requestedClientId) ?? 0) + 1
      );
      return requestedClientId;
    }
    const clientId = createClientId();
    entry.clientIds.set(clientId, 1);
    return clientId;
  }, "registerClient");
  const unregisterClient = /* @__PURE__ */ __name((entry, clientId) => {
    if (clientId === void 0) return;
    const count = entry.clientIds.get(clientId);
    if (count === void 0) return;
    if (count <= 1) {
      entry.clientIds.delete(clientId);
      entry.clientLastSeenAt.delete(clientId);
    } else {
      entry.clientIds.set(clientId, count - 1);
    }
  }, "unregisterClient");
  const recordAttachRef = /* @__PURE__ */ __name((entry, clientId) => {
    entry.attachRefs.set(clientId, (entry.attachRefs.get(clientId) ?? 0) + 1);
  }, "recordAttachRef");
  const releaseAttachRef = /* @__PURE__ */ __name((entry, clientId) => {
    const refs = entry.attachRefs.get(clientId);
    if (refs === void 0 || refs <= 0) return false;
    if (refs === 1) {
      entry.attachRefs.delete(clientId);
    } else {
      entry.attachRefs.set(clientId, refs - 1);
    }
    return true;
  }, "releaseAttachRef");
  const rollbackAttachRegistration = /* @__PURE__ */ __name(async (entry, clientId, attachCountDelta = 1) => {
    const released = releaseAttachRef(entry, clientId) ? 1 : 0;
    entry.attachCount = Math.max(
      0,
      entry.attachCount - (released + (attachCountDelta - 1))
    );
    unregisterClient(entry, clientId);
    await maybeCloseIdleSession(entry, "attach_rollback");
  }, "rollbackAttachRegistration");
  const resolveTrustedClientId = /* @__PURE__ */ __name((entry, clientId) => {
    if (clientId === void 0) return void 0;
    if (!entry.clientIds.has(clientId)) {
      throw new InvalidClientIdError(entry.sessionId, clientId);
    }
    return clientId;
  }, "resolveTrustedClientId");
  async function ensureChannel() {
    cancelIdleTimer();
    if (channelInfo && !channelInfo.isDying) return channelInfo;
    if (inFlightChannelSpawn) return await inFlightChannelSpawn;
    const promise = (async () => {
      const privateParentCapability = randomBytes(32).toString("base64url");
      const acpChannelId = randomUUID();
      const channel = await telemetry.withSpan(
        "channel.spawn",
        {
          "qwen-code.daemon.bridge.operation": "channel.spawn",
          "qwen-code.daemon.channel.reused": false,
          "qwen-code.daemon.acp_channel.id": acpChannelId
        },
        async () => await channelFactory(boundWorkspace, {
          ...childEnvOverrides,
          [PRIVATE_ACP_CAPABILITY_ENV]: privateParentCapability
        })
      );
      const sessionIds = /* @__PURE__ */ new Set();
      const infoRef = {};
      let client;
      let connection;
      try {
        client = new BridgeClient(
          // BfFut: ACP today carries a sessionId on every per-session
          // notification / request, so the no-sessionId branch is
          // technically unreachable. But the channel is multi-session
          // (Stage 1.5 multiplex), so if ACP ever grows a no-sessionId
          // call we'd silently drop it on a multi-session channel
          // instead of throwing. Surface that ambiguity loudly.
          (sessionId) => {
            if (sessionId) return byId.get(sessionId);
            if (channelInfo && channelInfo.sessionIds.size > 1) {
              throw new Error(
                "BridgeClient: ACP call without sessionId on a multi-session channel cannot be routed \u2014 workspace=" + boundWorkspace
              );
            }
            return void 0;
          },
          (sessionId) => sessionId ? pendingRestoreEvents.get(sessionId) : void 0,
          permissionMediator,
          permissionTimeoutMs,
          maxPendingPerSession,
          // Forward the optional `BridgeFileSystem` injection so
          // production `qwen serve` can wire the `WorkspaceFileSystem`
          // adapter into BridgeClient's fs proxy methods. Tests + Mode A
          // consumers + channels / IDE companion omit it; BridgeClient
          // falls back to its inline fs proxy.
          opts.fileSystem,
          // §2.3: centralised model_switched publish — keeps cache + generation
          // update atomic. BridgeClient calls this instead of inlining publish.
          (entry, modelId, originator) => publishModelSwitched(entry, modelId, originator),
          // A2: centralised approval_mode_changed publish on in-session mode
          // promotion. `previous` is read from the bridge state cache.
          (entry, modeId, originator) => {
            const se = entry;
            publishApprovalModeChanged(
              se,
              {
                previous: se.currentApprovalMode ?? "default",
                next: modeId,
                persisted: false
              },
              originator
            );
          },
          // Reverse tool channel (issue #5626, Phase 2): forward the optional
          // client-hosted-MCP sender lookup so `BridgeClient.extMethod` can
          // answer `qwen/control/client_mcp/message` from the child by reaching
          // the per-WS-connection `ClientMcpRegistrar`. Omitted callers (tests,
          // Mode A) never host a client MCP server, so the method stays
          // unreachable.
          opts.clientMcpSender,
          (sessionId) => sessionIds.has(sessionId),
          // Daemon token-burn accounting: forward per-round token usage observed
          // at the session/update fan-in to the daemon host's metrics ring via
          // the telemetry seam. Optional-chained so non-daemon callers (tests,
          // Mode A) that wire no `tokenUsage` metric are a silent no-op.
          (inputTokens, outputTokens, durationMs, apiErrors, apiRetries) => telemetry.metrics?.tokenUsage?.(
            inputTokens,
            outputTokens,
            durationMs,
            apiErrors,
            apiRetries
          ),
          // `create_sub_session` tool: forward the request/response hook so a child
          // tool can ask the daemon to spawn a sub-session and (for 'first-turn')
          // return its result. Omitted → the method reports daemon-only.
          opts.onCreateSubSession,
          (sessionId, event) => {
            const request = generationRequests.get(event.requestId);
            if (!request || request.sessionId !== sessionId) return;
            if (request.queue.push(event)) return;
            request.settled = true;
            generationRequests.delete(event.requestId);
            request.queue.fail(
              new Error("Generation stream consumer too slow")
            );
            void request.connection.extMethod(SERVE_CONTROL_EXT_METHODS.sessionGenerationCancel, {
              sessionId,
              requestId: event.requestId
            }).catch(() => void 0);
          },
          (event) => {
            const request = workspaceGenerationRequests.get(event.requestId);
            if (!request) return;
            if (request.queue.push(event)) return;
            request.settled = true;
            workspaceGenerationRequests.delete(event.requestId);
            request.queue.fail(
              new Error("Generation stream consumer too slow")
            );
            void request.connection?.extMethod(SERVE_CONTROL_EXT_METHODS.workspaceGenerationCancel, {
              requestId: event.requestId
            }).catch(() => void 0);
          },
          opts.onChannelDelivery,
          () => channelInfo?.sessionIds === sessionIds && channelInfo.sessionSpawnsInFlight > 0,
          () => liveScreenContextCaptureHandler,
          () => liveTaskToolRequestHandler,
          () => liveSpeakToUserHandler,
          opts.externalToolGuard,
          (snapshot) => {
            const currentInfo = infoRef.current;
            if (!currentInfo) return;
            applyActiveWorkSnapshot(currentInfo, snapshot);
          },
          // Child-side automatic title updates change persisted catalog
          // metadata the bridge never sees; forward the catalog-clock mark.
          markSessionCatalogChanged,
          // A Goal turn drains the mid-turn queue but owns no prompt slot, so
          // nothing else would settle what its last drain missed.
          settleMidTurnQueueAfterGoalTurn,
          opts.onCreateCurrentSessionScheduledTask
        );
        const rawConnection = new ClientSideConnection(
          () => channel.transportGuard ? createLogSafeAcpClient(client, channel.transportGuard) : client,
          channel.stream
        );
        connection = channel.transportGuard ? createOutboundGuardedConnection(
          rawConnection,
          channel.transportGuard
        ) : rawConnection;
      } catch (error) {
        try {
          channel.killSync();
        } catch {
        }
        try {
          await Promise.race([
            channel.exited.then(() => void 0),
            channel.kill()
          ]);
        } catch (teardownError) {
          throw new AggregateError(
            [error, teardownError],
            "ACP channel construction and teardown failed"
          );
        }
        throw error;
      }
      const info = {
        id: acpChannelId,
        channel,
        connection,
        client,
        sessionIds,
        pendingRestoreIds: /* @__PURE__ */ new Set(),
        sessionSpawnsInFlight: 0,
        workspaceControlInFlight: 0,
        workspaceMcpDiscoveryInFlight: false,
        workspaceMcpDiscoveryRequested: false,
        workspaceMcpAuthenticationServerNames: /* @__PURE__ */ new Set(),
        workspaceMcpAuthenticationTimers: /* @__PURE__ */ new Map(),
        emptyReapPending: false,
        unsettledAbandonedRestores: /* @__PURE__ */ new Set(),
        restoreSettlementOverdue: false,
        restoreSettlementTimers: /* @__PURE__ */ new Map(),
        transportFailed: false,
        transportFailureInitiatedTeardown: false,
        isDying: false,
        isQuarantined: false,
        handshakeComplete: false
      };
      infoRef.current = info;
      const markTransportFailed = /* @__PURE__ */ __name((error) => {
        if (!info.isDying) {
          info.transportFailureInitiatedTeardown = true;
        }
        info.transportFailed = true;
        info.transportFailureCode = safeTransportFailureCode(error);
        info.isDying = true;
        info.channelLiveness?.stop();
        clearInFlightExtensionRefreshes(info.connection);
      }, "markTransportFailed");
      void channel.transportFailed?.then(
        markTransportFailed,
        markTransportFailed
      );
      aliveChannels.add(info);
      if (aliveChannels.size > 2) {
        writeStderrLine(
          `qwen serve: WARNING aliveChannels.size=${aliveChannels.size} (expected 1, max 2 during killSession-then-spawnOrAttach overlap) \u2014 possible channel leak; check that prior channels' channel.exited fired and the handler ran cleanup.`
        );
      }
      void channel.exited.then((exitInfo) => {
        info.channelLiveness?.stop();
        clearInFlightExtensionRefreshes(info.connection);
        if (channelInfo === info) cancelIdleTimer();
        if (info.workspaceMcpDiscoveryTimer) {
          clearTimeout(info.workspaceMcpDiscoveryTimer);
          info.workspaceMcpDiscoveryTimer = void 0;
        }
        for (const timer of info.workspaceMcpAuthenticationTimers.values()) {
          clearTimeout(timer);
        }
        info.workspaceMcpAuthenticationTimers.clear();
        info.workspaceMcpAuthenticationServerNames.clear();
        for (const timer of info.restoreSettlementTimers.values()) {
          clearTimeout(timer);
        }
        info.restoreSettlementTimers.clear();
        aliveChannels.delete(info);
        if (channelInfo === info) channelInfo = void 0;
        const sessions = Array.from(info.sessionIds);
        info.sessionIds.clear();
        const channelExitExpected = shuttingDown || info.isDying && !info.transportFailureInitiatedTeardown;
        if (info.handshakeComplete) {
          telemetry.metrics?.channelLifecycle("exit", channelExitExpected);
        }
        if (!shuttingDown) {
          telemetry.event("channel.exited", {
            "qwen-code.daemon.channel.exit_code": exitInfo?.exitCode ?? -1,
            "qwen-code.daemon.channel.session_count": sessions.length,
            "qwen-code.daemon.channel.transport_failed": info.transportFailed,
            "qwen-code.daemon.channel.transport_failure_initiated_teardown": info.transportFailureInitiatedTeardown,
            ...info.transportFailureCode ? {
              "qwen-code.daemon.channel.transport_error_code": info.transportFailureCode
            } : {},
            ...exitInfo?.signalCode ? { "qwen-code.daemon.channel.signal": exitInfo.signalCode } : {}
          });
          writeStderrLine(
            `qwen serve: channel exited (code=${exitInfo?.exitCode ?? "none"}, signal=${exitInfo?.signalCode ?? "none"}, transport=${info.transportFailed ? info.transportFailureCode ?? "failed" : "ok"}, ${sessions.length} session(s) torn down)`
          );
        }
        for (const sid of sessions) {
          const sessEntry = byId.get(sid);
          if (!sessEntry) continue;
          cancelPendingForSession(sid);
          flushPromptTerminals(
            sessEntry,
            "channel_closed",
            "agent channel exited before the prompt completed"
          );
          try {
            sessEntry.events.publish({
              type: "session_died",
              data: {
                sessionId: sid,
                reason: "channel_closed",
                // BX9_P: thread exitCode/signalCode through.
                exitCode: exitInfo?.exitCode ?? null,
                signalCode: exitInfo?.signalCode ?? null
              }
            });
          } catch {
          }
          if (sessEntry.promptActive) {
            sessEntry.promptActive = false;
            activePromptCounter--;
            touchActivity();
          }
          byId.delete(sid);
          void sessEntry.attachments.close().catch((error) => {
            writeStderrLine(
              `qwen serve: failed to close attachments for closed channel session ${JSON.stringify(sid)}: ${error instanceof Error ? error.message : String(error)}`
            );
          });
          telemetry.metrics?.sessionLifecycle("die");
          emitSessionLifecycle({
            type: "removed",
            sessionId: sid,
            workspaceCwd: sessEntry.workspaceCwd,
            reason: "channel_closed"
          });
          info.client.markSessionClosed(sid);
          if (defaultEntry === sessEntry) defaultEntry = void 0;
          sessEntry.events.close();
        }
      });
      let channelLivenessNegotiated = false;
      try {
        await telemetry.withSpan(
          "channel.initialize",
          {
            "qwen-code.daemon.bridge.operation": "channel.initialize",
            "qwen-code.daemon.acp_channel.id": acpChannelId
          },
          async () => {
            const response = await withTimeout(
              Promise.race([
                connection.initialize({
                  protocolVersion: PROTOCOL_VERSION,
                  _meta: {
                    [ACTIVE_WORK_HEARTBEAT_META_KEY]: {
                      v: ACTIVE_WORK_HEARTBEAT_VERSION,
                      intervalMs: ACTIVE_WORK_HEARTBEAT_INTERVAL_MS,
                      categories: [...ACTIVE_WORK_HOLD_CATEGORIES]
                    },
                    [CHANNEL_STARTUP_PROFILE_META_KEY]: {
                      v: CHANNEL_STARTUP_PROFILE_VERSION
                    },
                    [CHANNEL_LIVENESS_META_KEY]: {
                      v: CHANNEL_LIVENESS_VERSION
                    },
                    [PRIVATE_PARENT_CAPABILITY_META_KEY]: privateParentCapability
                  },
                  clientCapabilities: {
                    fs: {
                      readTextFile: delegateReadTextFileToClient,
                      writeTextFile: true
                    }
                  },
                  clientInfo: { name: "qwen-serve-bridge", version: "0" }
                }),
                channelUnavailableReject(channel, "during initialize")
              ]),
              initTimeoutMs,
              "initialize"
            );
            if (opts.externalToolGuard) {
              const guardAck = response._meta?.[EXTERNAL_TOOL_GUARD_READY_META_KEY];
              if (guardAck !== EXTERNAL_TOOL_GUARD_REQUIRED_VALUE) {
                throw new Error(
                  `ACP child did not acknowledge the required external tool guard (received: ${JSON.stringify(guardAck)}).`
                );
              }
            }
            const activeWorkCapability = isRecord2(response._meta) ? response._meta[ACTIVE_WORK_HEARTBEAT_META_KEY] : void 0;
            if (isRecord2(activeWorkCapability) && activeWorkCapability["v"] === ACTIVE_WORK_HEARTBEAT_VERSION) {
              const advertised = activeWorkCapability["categories"];
              info.activeWork = {
                intervalMs: clampActiveWorkIntervalMs(
                  activeWorkCapability["intervalMs"]
                ),
                categories: Array.isArray(advertised) ? ACTIVE_WORK_HOLD_CATEGORIES.filter(
                  (category) => advertised.includes(category)
                ) : [],
                seq: 0
              };
            }
            const channelLivenessCapability = isRecord2(response._meta) ? response._meta[CHANNEL_LIVENESS_META_KEY] : void 0;
            channelLivenessNegotiated = isRecord2(channelLivenessCapability) && channelLivenessCapability["v"] === CHANNEL_LIVENESS_VERSION;
            try {
              const attributes = getChannelStartupProfileAttributes(
                response,
                Date.now(),
                initTimeoutMs
              );
              if (attributes && telemetry.setActiveSpanAttributes) {
                telemetry.setActiveSpanAttributes(attributes);
              }
            } catch {
            }
            return response;
          }
        );
      } catch (err) {
        info.isDying = true;
        await channel.kill().catch(() => {
        });
        throw err;
      }
      if (info.isDying) {
        await channel.kill().catch(() => {
        });
        throw new BridgeChannelClosedError("during initialize");
      }
      if (shuttingDown) {
        info.isDying = true;
        await channel.kill().catch(() => {
        });
        throw new Error("AcpSessionBridge is shutting down");
      }
      channelInfo = info;
      info.handshakeComplete = true;
      if (channelLivenessNegotiated) {
        const failChannelLiveness = /* @__PURE__ */ __name((error) => {
          if (info.isDying || !aliveChannels.has(info)) return;
          markTransportFailed(error);
          telemetry.event("channel.liveness_failed", {
            "qwen-code.daemon.acp_channel.id": info.id,
            "qwen-code.daemon.channel.session_count": info.sessionIds.size,
            "qwen-code.daemon.channel.transport_error_code": error.code
          });
          writeStderrLine(
            `qwen serve: channel liveness failed (${error.code}); killing channel`
          );
          if (info.channel.transportGuard) {
            info.channel.transportGuard.fail(error);
          } else {
            void killChannelWithLog(info, "channel liveness failure");
          }
        }, "failChannelLiveness");
        info.channelLiveness = startChannelLivenessMonitor({
          probe: /* @__PURE__ */ __name((nonce) => info.connection.extMethod(SERVE_STATUS_EXT_METHODS.channelPing, {
            v: CHANNEL_LIVENESS_VERSION,
            nonce
          }), "probe"),
          onFailure: failChannelLiveness,
          isActive: /* @__PURE__ */ __name(() => channelInfo === info && aliveChannels.has(info) && !info.isDying && !shuttingDown, "isActive")
        });
      }
      telemetry.metrics?.channelLifecycle("spawn");
      return info;
    })();
    inFlightChannelSpawn = promise;
    try {
      return await promise;
    } finally {
      inFlightChannelSpawn = void 0;
    }
  }
  __name(ensureChannel, "ensureChannel");
  async function doSpawn(modelServiceId, effectiveScope, approvalMode, requestedClientId, onSessionRegistered, parentSessionId, sourceType, sourceId, worktree, branch, requestedSessionId, daemonOwnedStandaloneCreation = false, onNewSessionDispatch) {
    const channelPath = channelInfo && !channelInfo.isDying ? "reused" : inFlightChannelSpawn ? "joined" : "spawned_on_request";
    const ci = await telemetry.withSpan(
      "channel.wait",
      {
        "qwen-code.daemon.bridge.operation": "channel.wait",
        "qwen-code.daemon.channel.path": channelPath
      },
      ensureChannel
    );
    if (ci.isDying) {
      throw new BridgeChannelClosedError("before newSession");
    }
    ci.sessionSpawnsInFlight++;
    if (requestedSessionId !== void 0) {
      ci.client.markSessionRegistrationInFlight(requestedSessionId);
    }
    let sessionRegistered = false;
    let sessionRemovedDuringInitialization = false;
    let initializedSessionId;
    let newSessionResp;
    try {
      try {
        newSessionResp = await telemetry.withSpan(
          "session.new",
          {
            "qwen-code.daemon.bridge.operation": "session.new",
            "qwen-code.daemon.session_scope": effectiveScope,
            "qwen-code.daemon.channel.path": channelPath,
            "qwen-code.daemon.acp_channel.id": ci.id
          },
          async () => {
            const request = telemetry.injectPromptContext({
              cwd: boundWorkspace,
              mcpServers: [],
              ...requestedSessionId || sourceType ? {
                _meta: {
                  ...sessionSourceRequestMeta(
                    sourceType,
                    sourceId,
                    daemonOwnedStandaloneCreation
                  ),
                  ...requestedSessionId ? {
                    [REQUESTED_SESSION_ID_META_KEY]: requestedSessionId
                  } : {}
                }
              } : {}
            });
            const newSessionRequest = worktree ? {
              ...request,
              _meta: {
                ...isRecord2(request._meta) ? request._meta : {},
                [WORKTREE_MCP_DEFER_META_KEY]: true
              }
            } : request;
            onNewSessionDispatch?.();
            const response = await withTimeout(
              Promise.race([
                ci.connection.newSession(newSessionRequest),
                channelUnavailableReject(ci.channel, "during newSession")
              ]),
              initTimeoutMs,
              "newSession"
            );
            telemetry.event("session.new.completed", {
              "session.id": response.sessionId,
              "qwen-code.daemon.acp_channel.id": ci.id
            });
            return response;
          }
        );
      } catch (err) {
        if (hasNoChannelWork(ci, { ignoreCurrentSessionSpawn: true })) {
          ci.isDying = true;
          ci.channelLiveness?.stop();
          await ci.channel.kill().catch(() => {
          });
        } else {
          ci.emptyReapPending = true;
        }
        throw err;
      }
      await Promise.resolve();
      if (ci.isDying) {
        throw new BridgeChannelClosedError("after newSession");
      }
      if (shuttingDown) {
        throw new Error("AcpSessionBridge is shutting down");
      }
      const entry = createSessionEntry(
        ci,
        newSessionResp.sessionId,
        boundWorkspace,
        void 0,
        { parentSessionId, sourceType, sourceId, worktree, branch }
      );
      initializedSessionId = entry.sessionId;
      sessionRegistered = true;
      onSessionRegistered?.();
      seedSnapshotCaches(entry, newSessionResp);
      const clientId = registerClient(entry, requestedClientId);
      let parentSessionPersisted;
      if (entry.parentSessionId) {
        const parentDeadline = Date.now() + initTimeoutMs;
        let lastParentErr;
        for (let attempt = 1; attempt <= MAX_PARENT_PERSIST_ATTEMPTS; attempt++) {
          const remaining = parentDeadline - Date.now();
          if (remaining <= 0) {
            parentSessionPersisted = false;
            lastParentErr = "deadline exceeded";
            break;
          }
          try {
            const parentResult = await Promise.race([
              withTimeout(
                entry.connection.extMethod(
                  SERVE_CONTROL_EXT_METHODS.sessionParent,
                  {
                    sessionId: entry.sessionId,
                    parentSessionId: entry.parentSessionId
                  }
                ),
                remaining,
                "sessionParent"
              ),
              getTransportClosedReject(entry)
            ]);
            parentSessionPersisted = parentResult?.persisted === true;
            break;
          } catch (err) {
            lastParentErr = err instanceof Error ? err.message : String(err);
            const terminal = err instanceof BridgeTimeoutError || err instanceof BridgeChannelClosedError || attempt === MAX_PARENT_PERSIST_ATTEMPTS;
            if (terminal) {
              parentSessionPersisted = false;
              break;
            }
          }
        }
        if (parentSessionPersisted === false) {
          writeStderrLine(
            `qwen serve: parentSessionId for ${entry.sessionId} was not persisted (${lastParentErr ?? "unknown"}) \u2014 the parent link is live-only until restart (reported to the caller via parentSessionPersisted=false)`
          );
        }
      }
      let sourcePersisted;
      if (entry.sourceType) {
        try {
          const sourceResult = await Promise.race([
            withTimeout(
              entry.connection.extMethod(
                SERVE_CONTROL_EXT_METHODS.sessionSource,
                {
                  sessionId: entry.sessionId,
                  sourceType: entry.sourceType,
                  ...entry.sourceId !== void 0 ? { sourceId: entry.sourceId } : {},
                  ...daemonOwnedStandaloneCreation ? { [DAEMON_OWNED_STANDALONE_CREATION_KEY]: true } : {}
                }
              ),
              initTimeoutMs,
              "sessionSource"
            ),
            getTransportClosedReject(entry)
          ]);
          sourcePersisted = sourceResult?.persisted === true;
        } catch (err) {
          sourcePersisted = false;
          writeStderrLine(
            `qwen serve: source metadata for ${entry.sessionId} was not persisted (${err instanceof Error ? err.message : String(err)}) \u2014 the source is live-only until restart (reported to the caller via sourcePersisted=false)`
          );
        }
      }
      if (modelServiceId) {
        await applyModelServiceId(
          entry,
          modelServiceId,
          initTimeoutMs,
          clientId
        ).catch(() => {
        });
      }
      if (approvalMode) {
        try {
          await applyApprovalMode(entry, approvalMode, false, clientId);
        } catch (err) {
          try {
            await closeSessionImpl(entry.sessionId, void 0, {
              reason: "approval_mode_initialization_failed"
            });
            sessionRemovedDuringInitialization = true;
          } catch {
          }
          throw err;
        }
      }
      if (!byId.has(entry.sessionId)) {
        throw new Error(
          `Session ${entry.sessionId} died during session initialization`
        );
      }
      if (effectiveScope === "single" && !defaultEntry) defaultEntry = entry;
      return {
        sessionId: entry.sessionId,
        workspaceCwd: entry.workspaceCwd,
        attached: false,
        clientId,
        createdAt: entry.createdAt,
        ...entry.sourceType ? { sourceType: entry.sourceType } : {},
        ...entry.sourceId !== void 0 ? { sourceId: entry.sourceId } : {},
        ...entry.sourceType ? { sourcePersisted: sourcePersisted === true } : {},
        ...entry.parentSessionId ? { parentSessionPersisted: parentSessionPersisted === true } : {},
        ...entry.worktree ? { worktree: entry.worktree } : {},
        ...entry.branch ? { branch: entry.branch } : {}
      };
    } finally {
      if (requestedSessionId !== void 0) {
        ci.client.clearSessionRegistrationInFlight(requestedSessionId);
        if (initializedSessionId !== requestedSessionId && !byId.has(requestedSessionId)) {
          ci.client.markSessionClosed(requestedSessionId);
        }
      }
      ci.sessionSpawnsInFlight = Math.max(0, ci.sessionSpawnsInFlight - 1);
      if (!sessionRegistered) {
        await reapPendingEmptyChannel(ci);
      } else if (sessionRemovedDuringInitialization && hasNoChannelWork(ci)) {
        await reapPendingEmptyChannel(ci);
        if (!ci.isDying) {
          await startIdleTimer(
            ci,
            `approval-mode initialization failure "${initializedSessionId}"`
          );
        }
      } else if (sessionRegistered && hasNoChannelWork(ci) && !ci.isDying) {
        await startIdleTimer(
          ci,
          `session orphaned during initialization "${initializedSessionId}"`
        );
      }
    }
  }
  __name(doSpawn, "doSpawn");
  async function applyModelServiceId(entry, modelId, timeoutMs, originatorClientId) {
    const conn = entry.connection;
    const transportClosed = getTransportClosedReject(entry);
    const work = entry.modelChangeQueue.then(async () => {
      entry.modelRoundtripInFlight = true;
      let succeeded = false;
      try {
        const result = await Promise.race([
          withTimeout(
            conn.unstable_setSessionModel({
              sessionId: entry.sessionId,
              modelId
            }),
            timeoutMs,
            "setSessionModel"
          ),
          transportClosed
        ]);
        publishModelSwitched(entry, modelId, originatorClientId);
        if (!isReservedStandaloneSessionSourceType(entry.sourceType)) {
          broadcastWorkspaceEvent({
            type: "settings_changed",
            data: {
              key: "model.name",
              value: getCanonicalModelId(result, modelId)
            },
            ...originatorClientId ? { originatorClientId } : {}
          });
        }
        succeeded = true;
      } catch (err) {
        entry.events.publish({
          type: "model_switch_failed",
          data: {
            sessionId: entry.sessionId,
            requestedModelId: modelId,
            error: err instanceof Error ? err.message : String(err)
          },
          ...originatorClientId ? { originatorClientId } : {}
        });
        throw err;
      } finally {
        entry.modelRoundtripInFlight = false;
        if (succeeded) {
          void reconcileAfterRoundtrip(entry, "model");
        } else {
          writeStderrLine(
            `[reconcile] session=${entry.sessionId} target=model action=skipped reason=roundtrip_failed`
          );
        }
      }
    });
    entry.modelChangeQueue = work.then(
      () => void 0,
      () => void 0
    );
    return work;
  }
  __name(applyModelServiceId, "applyModelServiceId");
  async function applyApprovalMode(entry, mode, persist, originatorClientId) {
    if (persist && !persistApprovalMode) {
      throw new Error(
        "setSessionApprovalMode called with `persist: true` but no `persistApprovalMode` callback wired in BridgeOptions. runQwenServe wires the production callback; direct embeds and tests must opt in or omit `persist`."
      );
    }
    const approvalWork = entry.approvalModeQueue.then(async () => {
      entry.approvalModeRoundtripInFlight = true;
      let succeeded = false;
      try {
        const response = await Promise.race([
          withTimeout(
            entry.connection.extMethod(
              SERVE_CONTROL_EXT_METHODS.sessionApprovalMode,
              { sessionId: entry.sessionId, mode }
            ),
            initTimeoutMs,
            SERVE_CONTROL_EXT_METHODS.sessionApprovalMode
          ),
          getTransportClosedReject(entry)
        ]);
        if (typeof response.current !== "string" || !KNOWN_APPROVAL_MODES.has(response.current)) {
          throw new Error(
            `Agent returned unknown approval mode: ${JSON.stringify(response.current)}`
          );
        }
        let persisted = false;
        if (persist) {
          try {
            await withTimeout(
              persistApprovalMode?.(boundWorkspace, mode) ?? Promise.resolve(),
              PERSIST_TIMEOUT_MS,
              "persistApprovalMode"
            );
            persisted = persistApprovalMode !== void 0;
          } catch (err) {
            writeStderrLine(
              `setSessionApprovalMode: persist failed: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
        publishApprovalModeChanged(
          entry,
          {
            previous: response.previous,
            next: response.current,
            persisted
          },
          originatorClientId
        );
        if (persisted) {
          broadcastWorkspaceEvent(
            {
              type: "approval_mode_changed",
              data: {
                sessionId: entry.sessionId,
                previous: response.previous,
                next: response.current,
                persisted
              },
              ...originatorClientId ? { originatorClientId } : {}
            },
            entry.sessionId
          );
          for (const peer of byId.values()) {
            if (peer.sessionId === entry.sessionId) {
              continue;
            }
            peer.currentApprovalMode = response.current;
          }
        }
        succeeded = true;
        return {
          sessionId: entry.sessionId,
          mode: response.current,
          previous: response.previous,
          persisted
        };
      } finally {
        entry.approvalModeRoundtripInFlight = false;
        if (succeeded) {
          void reconcileAfterRoundtrip(entry, "approvalMode");
        } else {
          writeStderrLine(
            `[reconcile] session=${entry.sessionId} target=approvalMode action=skipped reason=roundtrip_failed`
          );
        }
      }
    });
    entry.approvalModeQueue = approvalWork.then(
      () => void 0,
      () => void 0
    );
    try {
      return await approvalWork;
    } catch (err) {
      const data = err?.data;
      if (data && typeof data === "object" && "errorKind" in data && data.errorKind === "trust_gate") {
        const rawMessage = err?.message;
        const message = typeof rawMessage === "string" ? rawMessage : "Trust-gate rejection from ACP child";
        throw new TrustGateError(message);
      }
      throw err;
    }
  }
  __name(applyApprovalMode, "applyApprovalMode");
  async function applyApprovalModeForAttach(entry, mode, clientId) {
    try {
      const result = await applyApprovalMode(entry, mode, false, clientId);
      return result.previous;
    } catch (err) {
      await rollbackAttachRegistration(entry, clientId);
      throw err;
    }
  }
  __name(applyApprovalModeForAttach, "applyApprovalModeForAttach");
  async function rollbackApprovalModeForRejectedAttach(entry, previous, clientId) {
    if (byId.get(entry.sessionId) !== entry) return;
    try {
      await applyApprovalMode(entry, previous, false, clientId);
    } catch (err) {
      writeStderrLine(
        `attach: failed to restore approval mode for session ${entry.sessionId}: ${extractErrorMessage(err)}`
      );
    }
  }
  __name(rollbackApprovalModeForRejectedAttach, "rollbackApprovalModeForRejectedAttach");
  const cancelPendingForSession = /* @__PURE__ */ __name((sessionId) => {
    permissionMediator.forgetSession(sessionId);
    byId.get(sessionId)?.pendingPermissionIds.clear();
    byId.get(sessionId)?.pendingInteractions.clear();
  }, "cancelPendingForSession");
  const getTransportClosedReject = /* @__PURE__ */ __name((entry) => {
    if (!entry.transportClosedReject) {
      entry.transportClosedReject = channelUnavailableReject(
        entry.channel,
        `mid-request (session ${entry.sessionId})`
      );
    }
    return entry.transportClosedReject;
  }, "getTransportClosedReject");
  const resolveWorkspaceKey = /* @__PURE__ */ __name((rawWorkspaceCwd) => {
    const workspaceCwd = translateAndCheckAbsoluteWorkspacePath(rawWorkspaceCwd);
    if (workspaceCwd === null) {
      throw new Error(
        `workspaceCwd must be an absolute path; got "${rawWorkspaceCwd}"`
      );
    }
    const workspaceKey = workspaceCwd === boundWorkspace ? boundWorkspace : canonicalizeWorkspace(workspaceCwd);
    if (workspaceKey !== boundWorkspace) {
      throw new WorkspaceMismatchError(boundWorkspace, workspaceKey);
    }
    return workspaceKey;
  }, "resolveWorkspaceKey");
  const liveChannelInfo = /* @__PURE__ */ __name(() => {
    if (!channelInfo || channelInfo.isDying) return void 0;
    return channelInfo;
  }, "liveChannelInfo");
  const channelInfoForEntry = /* @__PURE__ */ __name((entry) => {
    if (channelInfo?.channel === entry.channel) return channelInfo;
    for (const info of aliveChannels) {
      if (info.channel === entry.channel) return info;
    }
    return void 0;
  }, "channelInfoForEntry");
  const assertAttachableSessionEntry = /* @__PURE__ */ __name((sessionId, entry) => {
    if (byId.get(sessionId) !== entry) {
      throw new SessionNotFoundError(
        sessionId,
        "The session channel is unavailable; retry after teardown completes"
      );
    }
    if (isClosingOrAuthorizingClose(entry)) {
      throw new SessionNotFoundError(
        sessionId,
        "The session is closing; retry after close completes",
        "session_closing"
      );
    }
    const owner = channelInfoForEntry(entry);
    if (!owner || owner.isDying) {
      throw new SessionNotFoundError(
        sessionId,
        "The session channel is unavailable; retry after teardown completes"
      );
    }
  }, "assertAttachableSessionEntry");
  const assertLivePromptEntry = /* @__PURE__ */ __name((sessionId, entry) => {
    const info = channelInfoForEntry(entry);
    if (byId.get(sessionId) !== entry || !info || info.isDying) {
      throw new SessionNotFoundError(sessionId);
    }
  }, "assertLivePromptEntry");
  const getChannelClosedReject = /* @__PURE__ */ __name((info) => {
    if (!info.statusClosedReject) {
      info.statusClosedReject = channelUnavailableReject(
        info.channel,
        "mid-request (workspace status)"
      );
    }
    return info.statusClosedReject;
  }, "getChannelClosedReject");
  const cacheWorkspaceMcpDetails = /* @__PURE__ */ __name(async (info, status) => {
    if (!Array.isArray(status.servers)) return;
    const serverNames = status.servers.flatMap(
      (server) => isRecord2(server) && typeof server["name"] === "string" && server["mcpStatus"] === "connected" ? [server["name"]] : []
    );
    const cacheDetail = /* @__PURE__ */ __name(async (serverName, method, cache) => {
      try {
        const result = await withTimeout(
          Promise.race([
            info.connection.extMethod(method, {
              serverName,
              cwd: boundWorkspace
            }),
            getChannelClosedReject(info)
          ]),
          initTimeoutMs,
          method
        );
        cache.set(serverName, result);
      } catch {
      }
    }, "cacheDetail");
    await Promise.all(
      serverNames.flatMap((serverName) => [
        cacheDetail(
          serverName,
          SERVE_STATUS_EXT_METHODS.workspaceMcpTools,
          workspaceMcpToolsCache
        ),
        cacheDetail(
          serverName,
          SERVE_STATUS_EXT_METHODS.workspaceMcpResources,
          workspaceMcpResourcesCache
        )
      ])
    );
  }, "cacheWorkspaceMcpDetails");
  const mergeManagedWorkspaceMcpStatus = /* @__PURE__ */ __name((serverNames, previous, current) => {
    if (Array.isArray(current.servers) && previous?.discoveryState === "completed" && current.discoveryState === "not_started") {
      if (current.servers.length === 0) return previous;
      const currentServers = new Map(
        current.servers.map((server) => [server.name, server])
      );
      const previousNames = new Set(
        previous.servers.map((server) => server.name)
      );
      const servers = previous.servers.map(
        (server) => serverNames.has(server.name) ? currentServers.get(server.name) ?? server : server
      );
      for (const server of current.servers) {
        if (serverNames.has(server.name) && !previousNames.has(server.name)) {
          servers.push(server);
        }
      }
      return {
        ...previous,
        discoveryState: "completed",
        servers
      };
    }
    return current;
  }, "mergeManagedWorkspaceMcpStatus");
  const requestWorkspaceStatus = /* @__PURE__ */ __name(async (method, idle, params = {}, managedServerNames) => {
    const info = liveChannelInfo();
    if (!info) {
      if (method === SERVE_STATUS_EXT_METHODS.workspaceMcp && workspaceMcpStatusCache) {
        return workspaceMcpStatusCache;
      }
      return idle();
    }
    let response = await withTimeout(
      Promise.race([
        info.connection.extMethod(method, { ...params, cwd: boundWorkspace }),
        getChannelClosedReject(info)
      ]),
      initTimeoutMs,
      method
    );
    if (method === SERVE_STATUS_EXT_METHODS.workspaceMcp) {
      const rawStatus = response;
      if (!Array.isArray(rawStatus.servers)) {
        return response;
      }
      const rawServers = rawStatus.servers;
      const effectiveManagedServerNames = /* @__PURE__ */ new Set([
        ...info.workspaceMcpAuthenticationServerNames,
        ...managedServerNames ?? []
      ]);
      if (effectiveManagedServerNames.size > 0 || workspaceMcpStatusCache?.discoveryState === "completed" && rawStatus.discoveryState === "not_started" && rawServers.length === 0) {
        response = mergeManagedWorkspaceMcpStatus(
          effectiveManagedServerNames,
          workspaceMcpStatusCache,
          rawStatus
        );
      }
      const status = response;
      if (status.discoveryState === "completed") {
        await cacheWorkspaceMcpDetails(
          info,
          effectiveManagedServerNames.size > 0 ? {
            servers: rawServers.filter(
              (server) => effectiveManagedServerNames.has(server.name)
            )
          } : status
        );
      }
      if (info.workspaceMcpDiscoveryInFlight && (status.discoveryState === "completed" || Array.isArray(status.errors) && status.errors.length > 0)) {
        finishWorkspaceMcpDiscovery(info);
        if (hasNoChannelWork(info)) {
          await startIdleTimer(info, "workspace MCP discovery complete");
        }
      }
      if (status.discoveryState === "completed") {
        info.workspaceMcpDiscoveryRequested = true;
      } else if (status.discoveryState === "in_progress") {
        info.workspaceMcpDiscoveryRequested = true;
      } else if (Array.isArray(status.errors) && status.errors.length > 0) {
        info.workspaceMcpDiscoveryRequested = false;
      }
      let authenticationCompleted = false;
      for (const serverName of info.workspaceMcpAuthenticationServerNames) {
        const server = rawServers.find(
          (candidate) => candidate.name === serverName
        );
        if (server?.authenticationState !== "pending" && (server !== void 0 || rawStatus.discoveryState === "completed")) {
          info.workspaceMcpAuthenticationServerNames.delete(serverName);
          const timer = info.workspaceMcpAuthenticationTimers.get(serverName);
          if (timer) clearTimeout(timer);
          info.workspaceMcpAuthenticationTimers.delete(serverName);
          authenticationCompleted = true;
        }
      }
      if (authenticationCompleted) {
        if (hasNoChannelWork(info)) {
          await startIdleTimer(info, "workspace MCP authentication complete");
        }
      }
      workspaceMcpStatusCache = response;
    }
    return response;
  }, "requestWorkspaceStatus");
  const MAX_CHILD_HEAP_UNCLASSIFIED_NAMES = 64;
  const MAX_CHILD_HEAP_SPACE_NAME_LENGTH = 64;
  const parseChildHeapReport = /* @__PURE__ */ __name((value) => {
    if (typeof value !== "object" || value === null) return void 0;
    const raw = value;
    const counts = [
      "peakOldGenerationBytes",
      "peakLiveSetBytes",
      "peakTotalHeapBytes",
      "majorGcCount",
      "majorGcMs"
    ];
    const parsed = {};
    for (const key of counts) {
      const n = raw[key];
      if (typeof n !== "number" || !Number.isFinite(n) || n < 0) {
        return void 0;
      }
      parsed[key] = n;
    }
    const names = raw["unclassifiedSpaceNames"];
    if (!Array.isArray(names) || names.length > MAX_CHILD_HEAP_UNCLASSIFIED_NAMES || names.some(
      (name) => typeof name !== "string" || name.length > MAX_CHILD_HEAP_SPACE_NAME_LENGTH
    )) {
      return void 0;
    }
    return {
      peakOldGenerationBytes: parsed["peakOldGenerationBytes"],
      peakLiveSetBytes: parsed["peakLiveSetBytes"],
      peakTotalHeapBytes: parsed["peakTotalHeapBytes"],
      majorGcCount: parsed["majorGcCount"],
      majorGcMs: parsed["majorGcMs"],
      unclassifiedSpaceNames: names
    };
  }, "parseChildHeapReport");
  const STALE_CHILD_RESOURCE_MS = 3e4;
  let childResourceRefreshing = false;
  const refreshChildResource = /* @__PURE__ */ __name(async () => {
    if (childResourceRefreshing) return;
    const info = liveChannelInfo();
    if (!info) return;
    childResourceRefreshing = true;
    try {
      const res = await requestWorkspaceStatus(SERVE_STATUS_EXT_METHODS.workspaceResource, () => ({}));
      if (liveChannelInfo() !== info) return;
      if (typeof res.rssBytes === "number" && Number.isFinite(res.rssBytes)) {
        info.childRssBytes = res.rssBytes;
      }
      if (typeof res.cpuPercent === "number" && Number.isFinite(res.cpuPercent)) {
        info.childCpuPercent = Math.min(100, Math.max(0, res.cpuPercent));
      }
      const heap = parseChildHeapReport(res.heap);
      if (heap) info.childHeap = heap;
      info.childResourceAt = Date.now();
    } catch (err) {
      teeServeDebugLine(
        `child-resource refresh failed: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      childResourceRefreshing = false;
    }
  }, "refreshChildResource");
  const getChildResourceSnapshot = /* @__PURE__ */ __name(() => {
    const info = liveChannelInfo();
    if (!info || info.childResourceAt === void 0) return void 0;
    const ageMs = Date.now() - info.childResourceAt;
    if (ageMs > STALE_CHILD_RESOURCE_MS) {
      return void 0;
    }
    return {
      rssBytes: info.childRssBytes ?? 0,
      cpuPercent: info.childCpuPercent ?? 0,
      // Deliberately not defaulted. Unlike rss/cpu, where 0 is a plausible
      // reading, a zeroed heap report would assert the child needed no old
      // generation — the one conclusion that must never be manufactured.
      heap: info.childHeap,
      // Bounded by the guard above, so a caller summing several children's
      // readings can say how far apart they were taken. Without it a sum of
      // readings up to `STALE_CHILD_RESOURCE_MS` apart looks instantaneous.
      ageMs
    };
  }, "getChildResourceSnapshot");
  const requestSessionStatus = /* @__PURE__ */ __name(async (sessionId, method, params = {}, timeoutMs = initTimeoutMs) => {
    const entry = byId.get(sessionId);
    if (!entry) throw new SessionNotFoundError(sessionId);
    const info = channelInfoForEntry(entry);
    if (!info || info.isDying) throw new SessionNotFoundError(sessionId);
    const response = await Promise.race([
      withTimeout(
        entry.connection.extMethod(method, { ...params, sessionId }),
        timeoutMs,
        method
      ),
      getTransportClosedReject(entry)
    ]);
    return response;
  }, "requestSessionStatus");
  const notifyAgentSessionClose = /* @__PURE__ */ __name(async (entry, ci, label, opts2) => {
    if (!ci || ci.channel !== entry.channel) {
      if (opts2?.throwOnFailure === true) {
        writeStderrLine(
          `qwen serve: ${label} ACP session close channel unavailable for session ${JSON.stringify(entry.sessionId)}; agent close skipped`
        );
        throw new Error(
          `ACP session close channel unavailable for ${entry.sessionId}`
        );
      }
      return false;
    }
    try {
      const closeRequest = entry.connection.extMethod(
        SERVE_CONTROL_EXT_METHODS.sessionClose,
        {
          sessionId: entry.sessionId,
          drainTimeoutMs: sessionCloseDrainBudgetMs(
            opts2?.timeoutMs ?? initTimeoutMs
          ),
          ...opts2?.requireFlush === true ? { requireFlush: true } : {}
        }
      );
      const observedCloseRequest = opts2?.timeoutMs ? withTimeout(closeRequest, opts2.timeoutMs, label) : closeRequest;
      const response = await Promise.race([
        opts2?.throwOnFailure === true ? observedCloseRequest : withTimeout(
          observedCloseRequest,
          initTimeoutMs,
          SERVE_CONTROL_EXT_METHODS.sessionClose
        ),
        getTransportClosedReject(entry)
      ]);
      return response["closed"] === true;
    } catch (err) {
      writeStderrLine(
        `qwen serve: ${label} ACP session close notification failed for session ${JSON.stringify(entry.sessionId)}: ${String(
          err instanceof Error ? err.message : err
        )}`
      );
      if (opts2?.throwOnFailure === true) {
        throw err;
      }
      return false;
    }
  }, "notifyAgentSessionClose");
  const broadcastWorkspaceEvent = /* @__PURE__ */ __name((envelope, skipSessionId) => {
    const sessions = Array.from(byId.values());
    let successCount = 0;
    let failureCount = 0;
    let skippedCount = 0;
    for (const entry of sessions) {
      if (skipSessionId !== void 0 && entry.sessionId === skipSessionId) {
        skippedCount += 1;
        continue;
      }
      try {
        const published = entry.events.publish(envelope);
        if (published === void 0) {
          failureCount += 1;
          teeServeDebugLine(
            `broadcastWorkspaceEvent: publish on session ${entry.sessionId} no-op (bus closed or unserializable)`
          );
        } else {
          successCount += 1;
        }
      } catch (err) {
        failureCount += 1;
        const detail = `broadcastWorkspaceEvent: bus publish failed for session ${JSON.stringify(entry.sessionId)} (type=${envelope.type}): ${err instanceof Error ? err.message : String(err)}`;
        if (shuttingDown) {
          teeServeDebugLine(detail);
        } else {
          writeStderrLine(`qwen serve: ${detail}`);
        }
      }
    }
    const eligible = sessions.length - skippedCount;
    if (eligible > 0 && successCount === 0 && !shuttingDown) {
      writeStderrLine(
        `qwen serve: broadcastWorkspaceEvent type=${envelope.type} dropped on ALL ${failureCount} session bus(es); SSE subscribers will miss this event (GET fallback still authoritative)`
      );
    }
  }, "broadcastWorkspaceEvent");
  const createSessionEventBus = /* @__PURE__ */ __name((sessionId) => new EventBus(
    eventRingSize,
    void 0,
    new TurnBoundaryCompactionEngine({
      maxReplayBytes: compactedReplayMaxBytes,
      maxJournalEvents,
      maxJournalBytes,
      onReplayWindowEviction: /* @__PURE__ */ __name((eviction) => {
        teeServeDebugLine(
          `replay window evicted ${JSON.stringify(eviction)}`
        );
      }, "onReplayWindowEviction"),
      // Adaptive growth: the engine asks before evicting past its caps.
      // The policy accounts growth across this bridge's live sessions
      // from every session's CURRENT journal cap (stateless — no ledger
      // to reconcile when a session is reaped), so granted headroom dies
      // with its session.
      ...journalGrowthPolicy ? {
        onJournalGrowth: /* @__PURE__ */ __name((current) => {
          const allSessionLimits = journalGrowthSessionLimits ? [...journalGrowthSessionLimits()] : journalSessionLimits();
          if (!byId.has(sessionId) && !pendingRestoreEvents.has(sessionId)) {
            allSessionLimits.push({
              limitBytes: current.maxBytes,
              baselineBytes: maxJournalBytes
            });
          }
          const grant = journalGrowthPolicy.grant({
            currentMaxEvents: current.maxEvents,
            currentMaxBytes: current.maxBytes,
            allSessionLimits
          });
          if (grant) {
            teeServeDebugLine(
              `live journal growth session=${JSON.stringify(sessionId)}: ${current.maxBytes} -> ${grant.maxBytes} bytes, ${current.maxEvents} -> ${grant.maxEvents} entries`
            );
          }
          return grant;
        }, "onJournalGrowth")
      } : {}
    }),
    {
      // Fired once, on the FIRST ingest/seed failure (the bus keeps the
      // degraded flag set silently afterwards). The bus doesn't know its
      // session, so the sessionId context is injected here.
      onCompactionError: /* @__PURE__ */ __name((err) => {
        writeStderrLine(
          `qwen serve: compaction degraded for session=${JSON.stringify(sessionId)}; replay snapshot may lag behind live events: ${err instanceof Error ? err.message : String(err)}`
        );
      }, "onCompactionError")
    }
  ), "createSessionEventBus");
  const publishModelSwitched = /* @__PURE__ */ __name((entry, modelId, originatorClientId) => {
    entry.currentModelId = modelId;
    entry.modelPublishGeneration++;
    entry.events.publish({
      type: "model_switched",
      ...entry.activePromptId ? { promptId: entry.activePromptId } : {},
      data: { sessionId: entry.sessionId, modelId },
      ...originatorClientId ? { originatorClientId } : {}
    });
  }, "publishModelSwitched");
  const publishApprovalModeChanged = /* @__PURE__ */ __name((entry, payload, originatorClientId) => {
    entry.currentApprovalMode = payload.next;
    entry.approvalModePublishGeneration++;
    entry.events.publish({
      type: "approval_mode_changed",
      ...entry.activePromptId ? { promptId: entry.activePromptId } : {},
      data: {
        sessionId: entry.sessionId,
        previous: payload.previous,
        next: payload.next,
        persisted: payload.persisted
      },
      ...originatorClientId ? { originatorClientId } : {}
    });
  }, "publishApprovalModeChanged");
  const reconcileAfterRoundtrip = /* @__PURE__ */ __name(async (entry, target) => {
    const flagKey = target === "model" ? "modelReconciliationInFlight" : "approvalModeReconciliationInFlight";
    const genOf = /* @__PURE__ */ __name(() => target === "model" ? entry.modelPublishGeneration : entry.approvalModePublishGeneration, "genOf");
    if (entry[flagKey]) return;
    entry[flagKey] = true;
    const genBefore = genOf();
    let rerun = false;
    try {
      const status = await requestSessionStatus(
        entry.sessionId,
        SERVE_STATUS_EXT_METHODS.sessionContext
      );
      if (genOf() !== genBefore) {
        rerun = true;
        writeStderrLine(
          `[reconcile] session=${entry.sessionId} target=${target} action=skipped reason=generation_changed genBefore=${genBefore} genAfter=${genOf()}`
        );
        return;
      }
      if (target === "model") {
        const actual = status?.state?.models?.currentModelId;
        if (typeof actual === "string" && actual && actual !== entry.currentModelId) {
          writeStderrLine(
            `[reconcile] session=${entry.sessionId} target=model action=corrected cached=${entry.currentModelId ?? "<unset>"} actual=${actual}`
          );
          publishModelSwitched(entry, actual, void 0);
        }
      } else {
        const actual = status?.state?.modes?.currentModeId;
        if (actual && !KNOWN_APPROVAL_MODES.has(actual)) {
          writeStderrLine(
            `[reconcile] session=${entry.sessionId} target=approvalMode action=dropped reason=unknown_mode mode=${actual}`
          );
        } else if (actual && actual !== entry.currentApprovalMode) {
          writeStderrLine(
            `[reconcile] session=${entry.sessionId} target=approvalMode action=corrected cached=${entry.currentApprovalMode ?? "<unset>"} actual=${actual}`
          );
          publishApprovalModeChanged(
            entry,
            {
              previous: entry.currentApprovalMode ?? "default",
              next: actual,
              persisted: false
            },
            void 0
          );
        }
      }
    } catch (err) {
      writeStderrLine(
        `[reconcile] session=${entry.sessionId} target=${target} action=failed error=${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      entry[flagKey] = false;
      if (rerun) void reconcileAfterRoundtrip(entry, target);
    }
  }, "reconcileAfterRoundtrip");
  const createSessionEntry = /* @__PURE__ */ __name((ci, sessionId, workspaceCwd, events = createSessionEventBus(sessionId), options = {}) => {
    const entry = {
      sessionId,
      workspaceCwd,
      effectiveCwd: workspaceCwd,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      ...options.parentSessionId ? { parentSessionId: options.parentSessionId } : {},
      ...options.sourceType ? { sourceType: options.sourceType } : {},
      ...options.sourceId !== void 0 ? { sourceId: options.sourceId } : {},
      ...options.worktree ? { worktree: options.worktree } : {},
      ...options.branch ? { branch: options.branch } : {},
      channel: ci.channel,
      connection: ci.connection,
      events,
      artifacts: new SessionArtifactStore({
        sessionId,
        workspaceCwd,
        persistence: createSessionArtifactPersistence(ci.connection, sessionId)
      }),
      artifactWorkspaceCwd: workspaceCwd,
      artifactWorkspaceReady: !isReservedStandaloneSessionSourceType(
        options.sourceType
      ),
      deferredArtifactBatches: [],
      deferredArtifactInputCount: 0,
      attachments: new SessionAttachmentStore(
        opts.sessionAttachmentsRoot,
        sessionId
      ),
      recordingDegraded: false,
      closing: false,
      cwdChangeQueue: Promise.resolve(),
      promptQueue: Promise.resolve(),
      pendingPromptCount: 0,
      pendingAgentNotificationCount: 0,
      ...opts.promptLedger ? { promptLedger: opts.promptLedger } : {},
      pendingPromptList: [],
      terminalTurnStatuses: /* @__PURE__ */ new Map(),
      enrichedTerminalPromptIds: /* @__PURE__ */ new Set(),
      rewindGeneration: 0,
      midTurnMessageQueue: [],
      settledMidTurnMessageIds: [],
      promotedMidTurnMessageIds: [],
      modelChangeQueue: Promise.resolve(),
      approvalModeQueue: Promise.resolve(),
      modelPublishGeneration: 0,
      approvalModePublishGeneration: 0,
      pendingPermissionIds: /* @__PURE__ */ new Set(),
      pendingInteractions: /* @__PURE__ */ new Map(),
      clientIds: /* @__PURE__ */ new Map(),
      clientLastSeenAt: /* @__PURE__ */ new Map(),
      attachCount: 0,
      attachRefs: /* @__PURE__ */ new Map(),
      spawnOwnerWantedKill: false,
      promptActive: false,
      childHolds: null,
      childHoldsAt: null,
      activeWorkCloseInFlight: false,
      retryAllowed: false
    };
    if (isReservedStandaloneSessionSourceType(options.sourceType)) {
      entry.prepareArtifactWorkspace = () => prepareStandaloneArtifactWorkspace(entry);
    }
    ci.sessionIds.add(entry.sessionId);
    byId.set(entry.sessionId, entry);
    ci.client.clearAbandonedRestoreFence(entry.sessionId);
    touchActivity();
    telemetry.metrics?.sessionLifecycle("spawn");
    emitSessionLifecycle({
      type: "registered",
      sessionId: entry.sessionId,
      workspaceCwd: entry.workspaceCwd,
      reason: options.lifecycleReason ?? "spawn"
    });
    if (options.drainEarlyEvents !== false) {
      ci.client.drainEarlyEvents(entry.sessionId, entry);
    }
    return entry;
  }, "createSessionEntry");
  const prepareStandaloneArtifactWorkspace = /* @__PURE__ */ __name(async (entry) => {
    if (!entry.artifactWorkspaceReady) {
      throw standaloneWorkingDirectoryMissingError();
    }
    if (entry.artifactWorkspacePreparation) {
      return entry.artifactWorkspacePreparation;
    }
    const owner = channelInfoForEntry(entry);
    if (!owner) throw standaloneWorkingDirectoryMissingError();
    const preparation = (async () => {
      const pending = entry.pendingArtifactRestore;
      if (pending) {
        delete entry.pendingArtifactRestore;
        try {
          await owner.client.ingestSessionUpdateArtifactsReady(
            entry,
            pending.replayUpdates
          );
        } catch (error) {
          entry.pendingArtifactRestore = pending;
          throw error;
        }
      }
      await owner.client.drainDeferredSessionArtifacts(entry);
    })();
    entry.artifactWorkspacePreparation = preparation;
    try {
      await preparation;
    } finally {
      if (entry.artifactWorkspacePreparation === preparation) {
        entry.artifactWorkspacePreparation = void 0;
      }
    }
  }, "prepareStandaloneArtifactWorkspace");
  const publishArtifactChanges = /* @__PURE__ */ __name((entry, changes, originatorClientId) => {
    for (const change of changes) {
      entry.events.publish({
        type: "artifact_changed",
        data: { sessionId: entry.sessionId, change },
        ...originatorClientId ? { originatorClientId } : {}
      });
    }
  }, "publishArtifactChanges");
  const artifactReseedChanges = /* @__PURE__ */ __name((before, after) => {
    const beforeById = new Map(
      before.map((artifact) => [artifact.id, artifact])
    );
    const afterById = new Map(after.map((artifact) => [artifact.id, artifact]));
    const changes = [];
    for (const artifact of before) {
      if (!afterById.has(artifact.id)) {
        changes.push({
          action: "removed",
          artifactId: artifact.id,
          artifact,
          reason: "eviction"
        });
      }
    }
    for (const artifact of after) {
      const previous = beforeById.get(artifact.id);
      if (!previous) {
        changes.push({
          action: "created",
          artifactId: artifact.id,
          artifact
        });
        continue;
      }
      if (!publicArtifactsEqual(previous, artifact)) {
        changes.push({
          action: "updated",
          artifactId: artifact.id,
          artifact
        });
      }
    }
    return changes;
  }, "artifactReseedChanges");
  const makeClientArtifactInput = /* @__PURE__ */ __name((artifact, clientId) => {
    const input = {
      title: artifact.title,
      kind: artifact.kind,
      storage: artifact.storage,
      description: artifact.description,
      workspacePath: artifact.workspacePath,
      managedId: artifact.managedId,
      url: artifact.url,
      mimeType: artifact.mimeType,
      sizeBytes: artifact.sizeBytes,
      metadata: artifact.metadata,
      retention: artifact.retention,
      clientRetained: artifact.clientRetained,
      source: "client"
    };
    if (clientId) {
      input.clientId = clientId;
    }
    return input;
  }, "makeClientArtifactInput");
  function createSessionArtifactPersistence(connection, sessionId) {
    return {
      recordEvent: /* @__PURE__ */ __name(async (payload) => {
        await connection.extMethod(
          SERVE_CONTROL_EXT_METHODS.sessionArtifactsPersist,
          {
            sessionId,
            kind: "event",
            payload
          }
        );
      }, "recordEvent"),
      recordSnapshot: /* @__PURE__ */ __name(async (payload) => {
        await connection.extMethod(
          SERVE_CONTROL_EXT_METHODS.sessionArtifactsPersist,
          {
            sessionId,
            kind: "snapshot",
            payload
          }
        );
      }, "recordSnapshot")
    };
  }
  __name(createSessionArtifactPersistence, "createSessionArtifactPersistence");
  const seedSnapshotCaches = /* @__PURE__ */ __name((entry, resp) => {
    const model = resp.models?.currentModelId;
    if (typeof model === "string" && model.length > 0) {
      entry.currentModelId = model;
    } else if (model != null) {
      writeStderrLine(
        `[seed] session=${entry.sessionId} target=model action=dropped value=${JSON.stringify(model)} reason=invalid_type`
      );
    }
    const mode = resp.modes?.currentModeId;
    if (typeof mode === "string" && KNOWN_APPROVAL_MODES.has(mode)) {
      entry.currentApprovalMode = mode;
    } else if (mode != null) {
      writeStderrLine(
        `[seed] session=${entry.sessionId} target=approvalMode action=dropped value=${JSON.stringify(mode)} reason=${typeof mode !== "string" ? "invalid_type" : "unknown_mode"}`
      );
    }
  }, "seedSnapshotCaches");
  const isAcpSessionResourceNotFound = /* @__PURE__ */ __name((err, sessionId) => {
    if (!err || typeof err !== "object") return false;
    const maybe = err;
    if (maybe.code !== -32002) return false;
    const expectedUri = `session:${sessionId}`;
    if (maybe.data && typeof maybe.data === "object" && maybe.data.uri === expectedUri) {
      return true;
    }
    return typeof maybe.message === "string" && maybe.message === `Resource not found: ${expectedUri}`;
  }, "isAcpSessionResourceNotFound");
  const replayFieldsFor = /* @__PURE__ */ __name((entry, action, liveReplayMode = "full") => {
    const replayStatus = action === "load" && entry.restoreReplayPartial === true ? {
      partial: true,
      ...typeof entry.restoreReplayError === "string" ? { replayError: entry.restoreReplayError } : {}
    } : {};
    const eventEpoch = entry.events.epoch;
    const snapshot = entry.events.snapshotReplay(liveReplayMode);
    if (!snapshot) {
      return {
        lastEventId: entry.events.lastEventId,
        eventEpoch,
        ...replayStatus,
        ...action === "load" && entry.restoreHistoryAnchorRecordId !== void 0 ? { historyAnchorRecordId: entry.restoreHistoryAnchorRecordId } : {}
      };
    }
    if (action === "load") {
      const liveJournal = snapshot.liveJournal.map((event) => {
        if (!entry.activePromptId || event.type !== "history_truncated" || !event.data || typeof event.data !== "object" || event.data.scope !== "live_journal") {
          return event;
        }
        return { ...event, promptId: entry.activePromptId };
      });
      return {
        compactedReplay: snapshot.compactedTurns,
        liveJournal,
        lastEventId: snapshot.lastEventId,
        eventEpoch,
        ...replayStatus,
        ...snapshot.degraded ? { replayDegraded: true } : {},
        ...entry.restoreHistoryHasMore === true ? { historyHasMore: true } : {},
        ...entry.restoreHistoryAnchorRecordId !== void 0 ? { historyAnchorRecordId: entry.restoreHistoryAnchorRecordId } : {}
      };
    }
    return { lastEventId: snapshot.lastEventId, eventEpoch, ...replayStatus };
  }, "replayFieldsFor");
  const restoredArtifactSnapshotFromState = /* @__PURE__ */ __name((state) => {
    const candidate = state.artifactSnapshot;
    const warnings = [];
    const snapshot = normalizeSnapshotPayload(candidate, warnings);
    if (!snapshot) return void 0;
    const snapshotWarnings = isRecord2(candidate) && Array.isArray(candidate["warnings"]) ? candidate["warnings"].filter(
      (warning) => typeof warning === "string" && warning.length <= 1e3
    ).slice(-500) : [];
    return {
      v: SESSION_ARTIFACT_PERSISTENCE_VERSION,
      sessionId: snapshot.sessionId,
      sequence: snapshot.sequence,
      artifacts: snapshot.artifacts,
      ...snapshot.markerArtifacts ? { markerArtifacts: snapshot.markerArtifacts } : {},
      tombstonedIds: snapshot.tombstonedIds ?? [],
      stickyEphemeralIds: snapshot.stickyEphemeralIds ?? [],
      warnings: [...warnings, ...snapshotWarnings]
    };
  }, "restoredArtifactSnapshotFromState");
  const artifactSnapshotUnavailableReason = /* @__PURE__ */ __name((state) => {
    const reason = state.artifactSnapshotUnavailable;
    return typeof reason === "string" && reason ? reason : void 0;
  }, "artifactSnapshotUnavailableReason");
  const publicRestoreState = /* @__PURE__ */ __name((state) => {
    const {
      artifactSnapshot: _artifactSnapshot,
      artifactSnapshotUnavailable: _artifactSnapshotUnavailable,
      ...publicState
    } = state;
    return publicState;
  }, "publicRestoreState");
  async function requestSessionTranscriptPage(req) {
    const info = await ensureChannel();
    try {
      const response = await withWorkspaceControl(
        info,
        () => withTimeout(
          Promise.race([
            info.connection.extMethod(
              SERVE_STATUS_EXT_METHODS.sessionTranscript,
              { ...req, cwd: boundWorkspace }
            ),
            getChannelClosedReject(info)
          ]),
          Math.max(initTimeoutMs, SESSION_TRANSCRIPT_TIMEOUT_MS),
          SERVE_STATUS_EXT_METHODS.sessionTranscript
        )
      );
      return response;
    } catch (err) {
      if (isAcpSessionResourceNotFound(err, req.sessionId)) {
        throw new SessionNotFoundError(req.sessionId);
      }
      throw err;
    } finally {
      if (hasNoChannelWork(info)) {
        await startIdleTimer(info, "session transcript");
      }
    }
  }
  __name(requestSessionTranscriptPage, "requestSessionTranscriptPage");
  async function refreshedReplayFieldsFor(entry, historyPageSize, liveReplayMode) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const lastEventId = entry.events.lastEventId;
        const eventEpoch = entry.events.epoch;
        const seenCursors = /* @__PURE__ */ new Set();
        let emptyPageCount = 0;
        let cursor;
        let page;
        do {
          page = await requestSessionTranscriptPage({
            sessionId: entry.sessionId,
            ...cursor ? { cursor } : { direction: "backward" },
            limit: historyPageSize
          });
          const nextCursor = page.nextCursor;
          if (page.events.length === 0 && page.hasMore && (nextCursor === void 0 || seenCursors.has(nextCursor))) {
            throw new Error("Transcript cursor did not advance");
          }
          if (page.events.length === 0 && page.hasMore && ++emptyPageCount >= MAX_EMPTY_TRANSCRIPT_PAGES) {
            throw new Error("Transcript empty-page limit exceeded");
          }
          cursor = nextCursor;
          if (cursor !== void 0) seenCursors.add(cursor);
        } while (page.events.length === 0 && page.hasMore && cursor !== void 0 && page.partial !== true && page.replayError === void 0);
        if (byId.get(entry.sessionId) === entry && !entry.promptActive && entry.events.epoch === eventEpoch && entry.events.lastEventId === lastEventId) {
          let compactedReplay = page.events;
          const turnErrorEvent = entry.turnErrorEvent;
          if (turnErrorEvent) {
            const journal = entry.events.liveJournalSnapshot() ?? [];
            const hasNewerTurnContent = journal.some(
              isRefreshAppendTurnContent
            );
            if (!hasNewerTurnContent) {
              compactedReplay = [...page.events, turnErrorEvent];
            }
          }
          return {
            compactedReplay,
            liveJournal: [],
            lastEventId,
            eventEpoch,
            ...page.partial === true ? { partial: true } : {},
            ...page.replayError !== void 0 ? { replayError: page.replayError } : {},
            ...page.hasMore ? { historyHasMore: true } : {}
          };
        }
      } catch {
        break;
      }
    }
    return replayFieldsFor(entry, "load", liveReplayMode);
  }
  __name(refreshedReplayFieldsFor, "refreshedReplayFieldsFor");
  function transcriptEventRecordId(event) {
    if (event.type !== "session_update") return void 0;
    const data = event.data;
    if (!data || typeof data !== "object" || Array.isArray(data))
      return void 0;
    const rec = data;
    const update = rec["update"];
    const meta = update && typeof update === "object" && !Array.isArray(update) ? update["_meta"] : rec["_meta"];
    if (!meta || typeof meta !== "object" || Array.isArray(meta))
      return void 0;
    const recordId = meta["qwen.session.recordId"];
    return typeof recordId === "string" ? recordId : void 0;
  }
  __name(transcriptEventRecordId, "transcriptEventRecordId");
  async function resolveHistoryAnchorRecordId(entry, replayFields) {
    const events = [
      ...replayFields.compactedReplay ?? [],
      ...replayFields.liveJournal ?? []
    ];
    const hasMarker = events.some((e) => e.type === "history_truncated");
    if (!hasMarker) return void 0;
    const hasRecordId = events.some(
      (e) => transcriptEventRecordId(e) !== void 0 || e.type === "history_truncated" && isRecord2(e.data) && typeof e.data["recordId"] === "string"
    );
    if (hasRecordId) return void 0;
    try {
      const page = await requestSessionTranscriptPage({
        sessionId: entry.sessionId,
        direction: "backward",
        limit: 50
      });
      for (const event of page.events) {
        const recordId = transcriptEventRecordId(event);
        if (recordId !== void 0) return recordId;
      }
    } catch {
    }
    return void 0;
  }
  __name(resolveHistoryAnchorRecordId, "resolveHistoryAnchorRecordId");
  const sendTrackedPrompt = { fn: void 0 };
  const maybeFireRestoreAskUserQuestionPrompt = /* @__PURE__ */ __name((entry, restoreAskUserQuestionHint, requestedClientId, registeredClientId, options) => {
    if (opts.restoreAskUserQuestion !== true || restoreAskUserQuestionHint !== true || // Nobody can answer the re-hung question without an attached client;
    // internal restores (boot rehydrate, keepalive, sub-session resume)
    // pass no clientId and must not fabricate an unbounded permission wait.
    requestedClientId === void 0 || options.suppressRestorePrompt === true || // Admission-time busy check: pendingPromptCount flips synchronously
    // when a prompt is accepted, before the queue callback sets
    // promptActive; Goal turns never set promptActive at all.
    entry.promptActive || entry.pendingPromptCount > 0 || entry.goalTurnActive === true) {
      return false;
    }
    let restorePrompt;
    try {
      restorePrompt = sendTrackedPrompt.fn?.(
        entry.sessionId,
        { sessionId: entry.sessionId, prompt: [] },
        void 0,
        { clientId: registeredClientId, restoreAskUserQuestion: true }
      );
    } catch (err) {
      teeServeDebugLine(
        `restoreAskUserQuestion: restore prompt admission failed for ${entry.sessionId}: ${err instanceof Error ? err.message : String(err)}`
      );
      return false;
    }
    restorePrompt?.catch((err) => {
      teeServeDebugLine(
        `restoreAskUserQuestion: restore prompt failed for ${entry.sessionId}: ${err instanceof Error ? err.message : String(err)}`
      );
    });
    return true;
  }, "maybeFireRestoreAskUserQuestionPrompt");
  async function restoreSession(action, req, options = {}) {
    if (shuttingDown) {
      throw new Error("AcpSessionBridge is shutting down");
    }
    const daemonOwnedStandaloneRestore = options.daemonOwnedStandaloneRestore === true;
    if (isReservedStandaloneSessionSourceType(req.sourceType) && !daemonOwnedStandaloneRestore) {
      throw new InvalidSessionMetadataError(
        "sourceType",
        "`standalone` is reserved for daemon-owned session restore"
      );
    }
    const workspaceKey = resolveWorkspaceKey(req.workspaceCwd);
    if (req.approvalMode !== void 0 && !KNOWN_APPROVAL_MODES.has(req.approvalMode)) {
      throw new Error(
        `Invalid approvalMode: ${JSON.stringify(req.approvalMode)}`
      );
    }
    const historyReplay = action === "load" ? req.historyReplay ?? "stream" : "stream";
    const historyPageSize = action === "load" && historyReplay === "response" ? req.historyPageSize : void 0;
    const requestedLiveReplayMode = req.liveReplayMode;
    if (requestedLiveReplayMode !== void 0 && requestedLiveReplayMode !== "full" && requestedLiveReplayMode !== "summary") {
      throw new Error(
        `Invalid liveReplayMode: ${JSON.stringify(requestedLiveReplayMode)}`
      );
    }
    const liveReplayMode = action === "load" ? requestedLiveReplayMode ?? "full" : "full";
    if (historyPageSize !== void 0 && (!Number.isSafeInteger(historyPageSize) || historyPageSize < 1 || historyPageSize > SESSION_TRANSCRIPT_MAX_LIMIT)) {
      throw new Error(
        `Invalid historyPageSize; expected 1..${SESSION_TRANSCRIPT_MAX_LIMIT}`
      );
    }
    const hideInheritedHistory = action === "load" && req.hideInheritedHistory === true;
    const existing = byId.get(req.sessionId);
    if (existing) {
      assertAttachableSessionEntry(req.sessionId, existing);
      const replayFields = historyPageSize !== void 0 ? await refreshedReplayFieldsFor(
        existing,
        historyPageSize,
        liveReplayMode
      ) : replayFieldsFor(existing, action, liveReplayMode);
      const historyAnchorRecordId = action === "load" ? await resolveHistoryAnchorRecordId(existing, replayFields) : void 0;
      assertAttachableSessionEntry(req.sessionId, existing);
      existing.attachCount++;
      const clientId = registerClient(existing, req.clientId);
      recordAttachRef(existing, clientId);
      if (req.approvalMode) {
        const previousApprovalMode = await applyApprovalModeForAttach(
          existing,
          req.approvalMode,
          clientId
        );
        try {
          assertAttachableSessionEntry(req.sessionId, existing);
        } catch (error) {
          await rollbackApprovalModeForRejectedAttach(
            existing,
            previousApprovalMode,
            clientId
          );
          await rollbackAttachRegistration(existing, clientId);
          throw error;
        }
      }
      return {
        sessionId: existing.sessionId,
        workspaceCwd: existing.workspaceCwd,
        ...existing.effectiveCwd !== existing.workspaceCwd ? { currentCwd: existing.effectiveCwd } : {},
        attached: true,
        clientId,
        createdAt: existing.createdAt,
        ...existing.sourceType ? { sourceType: existing.sourceType } : {},
        ...existing.sourceId !== void 0 ? { sourceId: existing.sourceId } : {},
        // Late attachers get the same ACP state the original restore
        // caller saw; spawn-only sessions don't carry a state payload.
        state: existing.restoreState ?? {},
        hasActivePrompt: existing.promptActive || existing.goalTurnActive === true,
        ...replayFields,
        ...historyAnchorRecordId !== void 0 ? { historyAnchorRecordId } : {}
      };
    }
    if (inFlightRequestedSessionSpawns.has(req.sessionId)) {
      throw new RestoreInProgressError(req.sessionId, "spawn", action);
    }
    const inFlight = inFlightRestores.get(req.sessionId);
    if (inFlight) {
      if (inFlight.lifecycle.phase === "abandoned" || action !== inFlight.action || historyReplay !== inFlight.historyReplay || historyPageSize !== inFlight.historyPageSize || inFlight.liveReplayMode === "summary" && liveReplayMode === "full" || hideInheritedHistory !== inFlight.hideInheritedHistory) {
        const abandoned = inFlight.lifecycle.phase === "abandoned";
        throw new RestoreInProgressError(
          req.sessionId,
          inFlight.action,
          action,
          abandoned ? {
            reason: "awaiting_abandoned_cleanup",
            retryAfterSeconds: abandonedRestoreRetryAfterSeconds
          } : void 0
        );
      }
      inFlight.coalesceState.count++;
      let restored;
      try {
        restored = await inFlight.publicPromise;
      } catch (err) {
        inFlight.coalesceState.count--;
        throw err;
      }
      const entry = byId.get(restored.sessionId);
      if (!entry) {
        inFlight.coalesceState.count--;
        throw new SessionNotFoundError(
          restored.sessionId,
          "the agent child likely crashed during session restore \u2014 retry to restore the session"
        );
      }
      try {
        assertAttachableSessionEntry(restored.sessionId, entry);
      } catch (error) {
        inFlight.coalesceState.count--;
        entry.attachCount = Math.max(0, entry.attachCount - 1);
        throw error;
      }
      const waiterReplayFields = liveReplayMode !== inFlight.liveReplayMode ? historyPageSize !== void 0 ? await refreshedReplayFieldsFor(
        entry,
        historyPageSize,
        liveReplayMode
      ) : replayFieldsFor(entry, action, liveReplayMode) : void 0;
      try {
        assertAttachableSessionEntry(restored.sessionId, entry);
      } catch (error) {
        inFlight.coalesceState.count--;
        entry.attachCount = Math.max(0, entry.attachCount - 1);
        throw error;
      }
      const clientId = registerClient(entry, req.clientId);
      recordAttachRef(entry, clientId);
      if (req.approvalMode) {
        const previousApprovalMode = await applyApprovalModeForAttach(
          entry,
          req.approvalMode,
          clientId
        );
        try {
          assertAttachableSessionEntry(restored.sessionId, entry);
        } catch (error) {
          await rollbackApprovalModeForRejectedAttach(
            entry,
            previousApprovalMode,
            clientId
          );
          await rollbackAttachRegistration(entry, clientId);
          throw error;
        }
      }
      return {
        ...restored,
        attached: true,
        clientId,
        createdAt: entry.createdAt,
        hasActivePrompt: entry.promptActive || entry.goalTurnActive === true,
        ...waiterReplayFields ?? {}
      };
    }
    assertFreshSessionsAvailable();
    if (byId.size + inFlightSpawns.size + inFlightRestores.size >= maxSessions) {
      throw new SessionLimitExceededError(maxSessions);
    }
    const restoreEvents = createSessionEventBus(req.sessionId);
    let registeredEntry;
    let ci;
    const coalesceState = { count: 0 };
    const admission = options.skipFreshSessionAdmission === true ? void 0 : reserveFreshSession({
      operation: action,
      workspaceCwd: workspaceKey,
      sessionId: req.sessionId
    });
    let admissionReleased = false;
    const releaseAdmissionOnce = /* @__PURE__ */ __name(() => {
      if (admissionReleased) return;
      admissionReleased = true;
      releaseFreshSessionReservation(admission);
    }, "releaseAdmissionOnce");
    let resolveSettlement;
    const settlementPromise = new Promise((resolve) => {
      resolveSettlement = resolve;
    });
    const restoreLifecycle = {
      phase: "active"
    };
    const settleAbandonedRestore = /* @__PURE__ */ __name(async (channel, lateResult) => {
      telemetry.event("session.restore.late_result", {
        "qwen-code.daemon.session_restore.action": action,
        "qwen-code.daemon.session_restore.result": lateResult,
        "qwen-code.daemon.session_restore.timeout_ms": sessionRestoreTimeoutMs,
        "qwen-code.daemon.acp_channel.id": channel.id,
        "session.id": req.sessionId
      });
      const usurper = byId.get(req.sessionId);
      if (usurper) {
        writeStderrLine(
          `qwen serve: skipping abandoned session/${action} cleanup for ${JSON.stringify(req.sessionId)}: the id is now owned by a live session`
        );
        telemetry.event("session.restore.cleanup", {
          "qwen-code.daemon.session_restore.action": action,
          "qwen-code.daemon.session_restore.cleanup_result": "id_reclaimed",
          "qwen-code.daemon.session_restore.timeout_ms": sessionRestoreTimeoutMs,
          "qwen-code.daemon.acp_channel.id": channel.id,
          "session.id": req.sessionId
        });
        channel.unsettledAbandonedRestores.delete(req.sessionId);
        const reclaimedTimer = channel.restoreSettlementTimers.get(
          req.sessionId
        );
        if (reclaimedTimer !== void 0) {
          clearTimeout(reclaimedTimer);
          channel.restoreSettlementTimers.delete(req.sessionId);
        }
        if (channel.unsettledAbandonedRestores.size === 0) {
          channel.restoreSettlementOverdue = false;
        }
        releaseAdmissionOnce();
        resolveSettlement();
        return;
      }
      try {
        if (channel.isDying || !aliveChannels.has(channel)) {
          await channel.channel.exited;
          telemetry.event("session.restore.cleanup", {
            "qwen-code.daemon.session_restore.action": action,
            "qwen-code.daemon.session_restore.cleanup_result": "transport_closed",
            "qwen-code.daemon.session_restore.timeout_ms": sessionRestoreTimeoutMs,
            "qwen-code.daemon.acp_channel.id": channel.id,
            "session.id": req.sessionId
          });
          return;
        }
        try {
          await Promise.race([
            withTimeout(
              channel.connection.extMethod(
                SERVE_CONTROL_EXT_METHODS.sessionClose,
                {
                  sessionId: req.sessionId,
                  drainTimeoutMs: sessionCloseDrainBudgetMs(initTimeoutMs)
                }
              ),
              initTimeoutMs,
              "abandonedRestoreClose"
            ),
            getChannelClosedReject(channel)
          ]);
          telemetry.event("session.restore.cleanup", {
            "qwen-code.daemon.session_restore.action": action,
            "qwen-code.daemon.session_restore.cleanup_result": "closed",
            "qwen-code.daemon.session_restore.timeout_ms": sessionRestoreTimeoutMs,
            "qwen-code.daemon.acp_channel.id": channel.id,
            "session.id": req.sessionId
          });
        } catch (error) {
          if (isAcpSessionResourceNotFound(error, req.sessionId)) {
            telemetry.event("session.restore.cleanup", {
              "qwen-code.daemon.session_restore.action": action,
              "qwen-code.daemon.session_restore.cleanup_result": "not_found",
              "qwen-code.daemon.session_restore.timeout_ms": sessionRestoreTimeoutMs,
              "qwen-code.daemon.acp_channel.id": channel.id,
              "session.id": req.sessionId
            });
            return;
          }
          if (channel.isDying || !aliveChannels.has(channel)) {
            await channel.channel.exited;
            telemetry.event("session.restore.cleanup", {
              "qwen-code.daemon.session_restore.action": action,
              "qwen-code.daemon.session_restore.cleanup_result": "transport_closed",
              "qwen-code.daemon.session_restore.timeout_ms": sessionRestoreTimeoutMs,
              "qwen-code.daemon.acp_channel.id": channel.id,
              "session.id": req.sessionId
            });
            return;
          }
          channel.isQuarantined = true;
          writeStderrLine(
            `qwen serve: quarantining ACP channel after timed-out session/${action} cleanup failed for ${JSON.stringify(req.sessionId)}: ${extractErrorMessage(error)}`
          );
          telemetry.event("session.restore.cleanup", {
            "qwen-code.daemon.session_restore.action": action,
            "qwen-code.daemon.session_restore.cleanup_result": "quarantined",
            "qwen-code.daemon.session_restore.timeout_ms": sessionRestoreTimeoutMs,
            "qwen-code.daemon.acp_channel.id": channel.id,
            "session.id": req.sessionId
          });
          if (hasNoChannelWork(channel)) {
            void killChannelWithLog(
              channel,
              `abandoned session/${action} cleanup`
            );
          }
          await channel.channel.exited;
        }
      } finally {
        channel.client.markSessionClosed(req.sessionId);
        channel.unsettledAbandonedRestores.delete(req.sessionId);
        const graceTimer = channel.restoreSettlementTimers.get(req.sessionId);
        if (graceTimer !== void 0) {
          clearTimeout(graceTimer);
          channel.restoreSettlementTimers.delete(req.sessionId);
        }
        if (channel.unsettledAbandonedRestores.size === 0) {
          channel.restoreSettlementOverdue = false;
        }
        releaseAdmissionOnce();
        resolveSettlement();
      }
    }, "settleAbandonedRestore");
    const promise = (async () => {
      pendingRestoreEvents.set(req.sessionId, restoreEvents);
      const restoreChannel = await ensureChannel();
      if (restoreChannel.isDying) {
        throw new BridgeChannelClosedError(`before session/${action}`);
      }
      ci = restoreChannel;
      restoreChannel.pendingRestoreIds.add(req.sessionId);
      restoreChannel.client.markRestoreInFlight(req.sessionId);
      const transportClosed = channelUnavailableReject(
        restoreChannel.channel,
        `during session/${action}`
      );
      transportClosed.catch(() => {
      });
      let state;
      let replayUpdates = [];
      let replayPartial;
      let replayError;
      let replayHasMore;
      let replayAnchorRecordId;
      let restoreAskUserQuestionHint = false;
      try {
        const rawRestore = telemetry.withSpan(
          "session.restore",
          {
            "qwen-code.daemon.bridge.operation": `session.${action}`,
            "qwen-code.daemon.session_restore.action": action,
            "qwen-code.daemon.acp_channel.id": restoreChannel.id,
            "qwen-code.daemon.session_restore.timeout_ms": sessionRestoreTimeoutMs,
            "session.id": req.sessionId
          },
          async () => {
            if (action === "load") {
              const request2 = telemetry.injectPromptContext({
                sessionId: req.sessionId,
                cwd: workspaceKey,
                // Restore path drops per-request `mcpServers` (matches
                // `doSpawn`); daemon-wide MCP comes from settings on
                // the agent side. The SDK's `RestoreSessionRequest`
                // intentionally has no `mcpServers` field for the
                // same reason.
                mcpServers: [],
                _meta: {
                  ...sessionSourceRequestMeta(
                    req.sourceType,
                    req.sourceId,
                    daemonOwnedStandaloneRestore
                  ),
                  // Decline decisions known before the child RPC: keep the
                  // child's replay finalize-skip aligned with the re-hang.
                  ...opts.restoreAskUserQuestion === true && (req.clientId === void 0 || options.suppressRestorePrompt === true) ? {
                    [DAEMON_SUPPRESS_RESTORE_ASK_USER_QUESTION_META_KEY]: true
                  } : {},
                  ...historyReplay === "response" ? {
                    [LOAD_REPLAY_MODE_META_KEY]: LOAD_REPLAY_BULK_MODE,
                    ...historyPageSize !== void 0 ? {
                      [LOAD_REPLAY_PAGE_SIZE_META_KEY]: historyPageSize
                    } : {}
                  } : {},
                  ...hideInheritedHistory ? { [LOAD_REPLAY_HIDE_INHERITED_META_KEY]: true } : {}
                }
              });
              return await restoreChannel.connection.loadSession(request2);
            }
            const request = telemetry.injectPromptContext({
              sessionId: req.sessionId,
              cwd: workspaceKey,
              mcpServers: [],
              _meta: {
                ...sessionSourceRequestMeta(
                  req.sourceType,
                  req.sourceId,
                  daemonOwnedStandaloneRestore
                ),
                ...opts.restoreAskUserQuestion === true && (req.clientId === void 0 || options.suppressRestorePrompt === true) ? {
                  [DAEMON_SUPPRESS_RESTORE_ASK_USER_QUESTION_META_KEY]: true
                } : {}
              }
            });
            return await restoreChannel.connection.unstable_resumeSession(
              request
            );
          }
        );
        const observedRestore = Promise.race([rawRestore, transportClosed]);
        state = await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            if (restoreLifecycle.phase !== "active") return;
            restoreLifecycle.phase = "abandoned";
            restoreChannel.pendingRestoreIds.delete(req.sessionId);
            restoreChannel.client.markRestoreAbandoned(req.sessionId);
            pendingRestoreEvents.delete(req.sessionId);
            restoreEvents.close();
            restoreChannel.unsettledAbandonedRestores.add(req.sessionId);
            const channelWasEmpty = hasNoChannelWork(restoreChannel);
            telemetry.event("session.restore.public_result", {
              "qwen-code.daemon.session_restore.action": action,
              "qwen-code.daemon.session_restore.result": "timeout",
              "qwen-code.daemon.session_restore.timeout_ms": sessionRestoreTimeoutMs,
              "qwen-code.daemon.acp_channel.id": restoreChannel.id,
              "qwen-code.daemon.session_restore.channel_was_empty": channelWasEmpty,
              "session.id": req.sessionId
            });
            writeStderrLine(
              `qwen serve: session/${action} timed out after ${sessionRestoreTimeoutMs}ms for ${JSON.stringify(req.sessionId)} on channel ${restoreChannel.id}; decision=${channelWasEmpty ? "kill_empty" : "fence_shared"}`
            );
            if (channelWasEmpty) {
              void killChannelWithLog(
                restoreChannel,
                `timed-out session/${action} on empty channel`
              );
            } else {
              armRestoreSettlementGrace(restoreChannel, req.sessionId, action);
            }
            reject(
              new SessionRestoreTimeoutError(
                req.sessionId,
                action,
                sessionRestoreTimeoutMs
              )
            );
          }, sessionRestoreTimeoutMs);
          timer.unref();
          void observedRestore.then(
            (value) => {
              if (restoreLifecycle.phase === "active") {
                clearTimeout(timer);
                resolve(value);
                return;
              }
              void settleAbandonedRestore(restoreChannel, "success");
            },
            (error) => {
              if (restoreLifecycle.phase === "active") {
                clearTimeout(timer);
                reject(error);
                return;
              }
              void settleAbandonedRestore(restoreChannel, "failure");
            }
          );
        });
        if (action === "load" && historyReplay === "response") {
          const extracted = extractLoadReplayResponse(state);
          state = extracted.state;
          replayUpdates = extracted.updates;
          replayPartial = extracted.partial;
          replayError = extracted.replayError;
          replayHasMore = extracted.hasMore === true ? true : void 0;
          replayAnchorRecordId = extracted.anchorRecordId;
        }
        const restoreHint = takeRestoreAskUserQuestionHint(state);
        restoreAskUserQuestionHint = restoreHint.hint;
        state = restoreHint.state;
      } catch (err) {
        if (err instanceof SessionRestoreTimeoutError) throw err;
        restoreEvents.close();
        if (isAcpSessionResourceNotFound(err, req.sessionId)) {
          throw new SessionNotFoundError(req.sessionId);
        }
        ci.emptyReapPending = hasNoChannelWork(ci, {
          ignoreRestoreId: req.sessionId
        });
        if (ci.emptyReapPending) {
          ci.isDying = true;
        }
        throw err;
      }
      if (shuttingDown) {
        restoreEvents.close();
        throw new Error("AcpSessionBridge is shutting down");
      }
      if (ci.isDying || !aliveChannels.has(ci)) {
        restoreEvents.close();
        throw new Error(
          `Session ${req.sessionId} restored on a closed agent channel`
        );
      }
      const racedEntry = byId.get(req.sessionId);
      if (racedEntry) {
        restoreEvents.close();
        assertAttachableSessionEntry(req.sessionId, racedEntry);
        racedEntry.attachCount += 1 + coalesceState.count;
        const clientId2 = registerClient(racedEntry, req.clientId);
        recordAttachRef(racedEntry, clientId2);
        if (req.approvalMode) {
          let previousApprovalMode;
          try {
            const result = await applyApprovalMode(
              racedEntry,
              req.approvalMode,
              false,
              clientId2
            );
            previousApprovalMode = result.previous;
          } catch (err) {
            await rollbackAttachRegistration(
              racedEntry,
              clientId2,
              1 + coalesceState.count
            );
            throw err;
          }
          try {
            assertAttachableSessionEntry(req.sessionId, racedEntry);
          } catch (error) {
            await rollbackApprovalModeForRejectedAttach(
              racedEntry,
              previousApprovalMode,
              clientId2
            );
            await rollbackAttachRegistration(
              racedEntry,
              clientId2,
              1 + coalesceState.count
            );
            throw error;
          }
        }
        const restorePromptAdmitted2 = maybeFireRestoreAskUserQuestionPrompt(
          racedEntry,
          restoreAskUserQuestionHint,
          req.clientId,
          clientId2,
          options
        );
        return {
          sessionId: racedEntry.sessionId,
          workspaceCwd: racedEntry.workspaceCwd,
          ...racedEntry.effectiveCwd !== racedEntry.workspaceCwd ? { currentCwd: racedEntry.effectiveCwd } : {},
          attached: true,
          clientId: clientId2,
          createdAt: racedEntry.createdAt,
          ...racedEntry.sourceType ? { sourceType: racedEntry.sourceType } : {},
          ...racedEntry.sourceId !== void 0 ? { sourceId: racedEntry.sourceId } : {},
          state: racedEntry.restoreState ?? {},
          hasActivePrompt: restorePromptAdmitted2 || racedEntry.promptActive || racedEntry.goalTurnActive === true,
          ...replayFieldsFor(racedEntry, action, liveReplayMode)
        };
      }
      const entry = createSessionEntry(
        ci,
        req.sessionId,
        workspaceKey,
        restoreEvents,
        {
          drainEarlyEvents: replayUpdates.length === 0,
          lifecycleReason: action,
          // Re-seed the persisted parent lineage the caller recovered from the
          // transcript, so a restored sub-session's status reports its parent.
          ...req.parentSessionId ? { parentSessionId: req.parentSessionId } : {},
          ...req.sourceType ? { sourceType: req.sourceType } : {},
          ...req.sourceId !== void 0 ? { sourceId: req.sourceId } : {}
        }
      );
      releaseAdmissionOnce();
      const restoredArtifactSnapshot = restoredArtifactSnapshotFromState(state);
      const publicState = publicRestoreState(state);
      entry.restoreState = publicState;
      if (replayPartial === true) {
        entry.restoreReplayPartial = true;
      }
      if (replayError !== void 0) {
        entry.restoreReplayError = replayError;
      }
      if (replayHasMore === true) {
        entry.restoreHistoryHasMore = true;
      }
      if (replayAnchorRecordId !== void 0) {
        entry.restoreHistoryAnchorRecordId = replayAnchorRecordId;
      }
      seedSnapshotCaches(entry, publicState);
      const deferArtifactWorkspace = isReservedStandaloneSessionSourceType(
        entry.sourceType
      );
      const artifactRestoreWarnings = [];
      if (deferArtifactWorkspace) {
        artifactRestoreWarnings.push(
          ...await entry.artifacts.restore(restoredArtifactSnapshot, {
            workspaceAccess: "metadata-only"
          })
        );
        const artifactRestoreFailed2 = artifactRestoreWarnings.some(
          (warning) => isArtifactRestoreFailureWarning(warning)
        );
        entry.pendingArtifactRestore = {
          ...restoredArtifactSnapshot !== void 0 ? { snapshot: restoredArtifactSnapshot } : {},
          replayUpdates: restoredArtifactSnapshot === void 0 || artifactRestoreFailed2 ? replayUpdates : [],
          warnings: artifactRestoreWarnings
        };
      } else {
        artifactRestoreWarnings.push(
          ...await entry.artifacts.restore(restoredArtifactSnapshot)
        );
      }
      for (const warning of artifactRestoreWarnings) {
        writeStderrLine(
          `[artifacts] session=${entry.sessionId} action=restore_warning warning=${JSON.stringify(
            warning
          )}`
        );
      }
      const artifactRestoreFailed = artifactRestoreWarnings.some(
        (warning) => isArtifactRestoreFailureWarning(warning)
      );
      if (replayUpdates.length > 0) {
        await ci.client.seedSessionUpdates(entry, replayUpdates, {
          ingestArtifacts: !deferArtifactWorkspace && (restoredArtifactSnapshot === void 0 || artifactRestoreFailed)
        });
        if (historyPageSize !== void 0 && entry.events.snapshotReplay()?.compactedTurns.some((event) => event.type === "history_truncated")) {
          entry.restoreHistoryHasMore = true;
        }
        ci.client.drainEarlyEvents(entry.sessionId, entry);
      }
      assertAttachableSessionEntry(req.sessionId, entry);
      const clientId = registerClient(entry, req.clientId);
      if (req.approvalMode) {
        await applyApprovalModeForAttach(entry, req.approvalMode, clientId);
        assertAttachableSessionEntry(req.sessionId, entry);
      }
      entry.attachCount = coalesceState.count;
      registeredEntry = entry;
      const restorePromptAdmitted = maybeFireRestoreAskUserQuestionPrompt(
        entry,
        restoreAskUserQuestionHint,
        req.clientId,
        clientId,
        options
      );
      return {
        sessionId: entry.sessionId,
        workspaceCwd: entry.workspaceCwd,
        attached: false,
        clientId,
        createdAt: entry.createdAt,
        ...entry.sourceType ? { sourceType: entry.sourceType } : {},
        ...entry.sourceId !== void 0 ? { sourceId: entry.sourceId } : {},
        state: publicState,
        ...deferArtifactWorkspace || artifactRestoreWarnings.length > 0 ? { artifactWarnings: artifactRestoreWarnings } : {},
        hasActivePrompt: restorePromptAdmitted || entry.promptActive || entry.goalTurnActive === true,
        ...replayFieldsFor(entry, action, liveReplayMode)
      };
    })().finally(async () => {
      if (restoreLifecycle.phase === "abandoned") return;
      releaseAdmissionOnce();
      ci?.pendingRestoreIds.delete(req.sessionId);
      ci?.client.clearRestoreInFlight(req.sessionId);
      pendingRestoreEvents.delete(req.sessionId);
      if (!registeredEntry) {
        restoreEvents.close();
        let removedRestoreEntry = false;
        const restoreEntry = byId.get(req.sessionId);
        if (restoreEntry?.events === restoreEvents) {
          byId.delete(req.sessionId);
          await restoreEntry.attachments.close().catch((error) => {
            writeStderrLine(
              `qwen serve: failed to close attachments after restoring session ${JSON.stringify(req.sessionId)}: ${error instanceof Error ? error.message : String(error)}`
            );
          });
          ci?.sessionIds.delete(req.sessionId);
          emitSessionLifecycle({
            type: "removed",
            sessionId: req.sessionId,
            workspaceCwd: restoreEntry.workspaceCwd,
            reason: "restore_failed"
          });
          removedRestoreEntry = true;
        }
        if (removedRestoreEntry && ci && hasNoChannelWork(ci)) {
          ci.emptyReapPending = true;
          ci.isDying = true;
        }
        ci?.client.markSessionClosed(req.sessionId);
      }
      if (ci) {
        await reapPendingEmptyChannel(ci);
      }
    });
    void promise.then(
      () => {
        if (restoreLifecycle.phase === "active") {
          telemetry.event("session.restore.public_result", {
            "qwen-code.daemon.session_restore.action": action,
            "qwen-code.daemon.session_restore.result": "success",
            "qwen-code.daemon.session_restore.timeout_ms": sessionRestoreTimeoutMs,
            ...ci ? { "qwen-code.daemon.acp_channel.id": ci.id } : {},
            "session.id": req.sessionId
          });
          resolveSettlement();
        }
      },
      () => {
        if (restoreLifecycle.phase === "active") {
          telemetry.event("session.restore.public_result", {
            "qwen-code.daemon.session_restore.action": action,
            "qwen-code.daemon.session_restore.result": "failure",
            "qwen-code.daemon.session_restore.timeout_ms": sessionRestoreTimeoutMs,
            ...ci ? { "qwen-code.daemon.acp_channel.id": ci.id } : {},
            "session.id": req.sessionId
          });
          resolveSettlement();
        }
      }
    );
    inFlightRestores.set(req.sessionId, {
      action,
      historyReplay,
      ...historyPageSize !== void 0 ? { historyPageSize } : {},
      liveReplayMode,
      hideInheritedHistory,
      publicPromise: promise,
      settlementPromise,
      lifecycle: restoreLifecycle,
      coalesceState
    });
    void settlementPromise.finally(() => {
      const current = inFlightRestores.get(req.sessionId);
      if (current?.settlementPromise === settlementPromise) {
        inFlightRestores.delete(req.sessionId);
      }
    });
    return await promise;
  }
  __name(restoreSession, "restoreSession");
  async function closeSessionImpl(sessionId, context, closeOpts) {
    const entry = byId.get(sessionId);
    if (!entry) throw new SessionNotFoundError(sessionId);
    if (entry.closing) {
      throw new SessionNotFoundError(
        sessionId,
        "The session is already closing",
        "session_closing"
      );
    }
    let originatorClientId;
    if (context?.clientId !== void 0) {
      originatorClientId = resolveTrustedClientId(entry, context.clientId);
    }
    entry.closing = true;
    const reason = closeOpts?.reason ?? "client_close";
    writeStderrLine(
      `qwen serve: closing session ${JSON.stringify(sessionId)} (reason: ${reason})` + (originatorClientId ? ` by client ${JSON.stringify(originatorClientId)}` : "")
    );
    telemetry.event("session.close", {
      "qwen-code.daemon.bridge.operation": "session.close",
      "session.id": sessionId,
      "session.close.reason": reason
    });
    const ci = channelInfoForEntry(entry);
    if (!ci) {
      writeStderrLine(
        `qwen serve: closeSession channelInfoForEntry returned undefined for session ${JSON.stringify(sessionId)} \u2014 channel cleanup skipped (entry's channel already torn down)`
      );
    }
    let agentSessionClosed = false;
    try {
      permissionMediator.forgetSession(sessionId);
      entry.pendingPermissionIds.clear();
      entry.pendingInteractions.clear();
      agentSessionClosed = await notifyAgentSessionClose(
        entry,
        ci,
        "closeSession",
        {
          throwOnFailure: true,
          requireFlush: closeOpts?.requireAgentClose === true,
          ...closeOpts?.agentCloseTimeoutMs !== void 0 ? { timeoutMs: closeOpts.agentCloseTimeoutMs } : {}
        }
      );
    } catch (error) {
      if (isDefinitiveAcpRequestError(error)) {
        entry.closing = false;
      } else if (ci) {
        await killChannelWithLog(
          ci,
          `recover unknown close outcome for session ${JSON.stringify(sessionId)}`
        );
      } else {
        entry.closing = false;
      }
      throw error;
    }
    if (defaultEntry === entry) defaultEntry = void 0;
    if (ci && ci.channel === entry.channel) {
      ci.sessionIds.delete(sessionId);
    }
    if (entry.promptActive) {
      entry.promptActive = false;
      activePromptCounter--;
      touchActivity();
    }
    byId.delete(sessionId);
    telemetry.metrics?.sessionLifecycle("close");
    emitSessionLifecycle({
      type: "removed",
      sessionId,
      workspaceCwd: entry.workspaceCwd,
      reason
    });
    ci?.client.markSessionClosed(sessionId);
    flushPromptTerminals(
      entry,
      "session_closed",
      "session closed before the prompt completed"
    );
    try {
      entry.events.publish({
        type: "session_closed",
        data: {
          sessionId,
          reason,
          // `data.closedBy` is kept for back-compat with existing
          // wire consumers; new code should read envelope-level
          // `originatorClientId` (matches `session_metadata_updated`,
          // `model_switched`, `approval_mode_changed`, etc.).
          ...originatorClientId ? { closedBy: originatorClientId } : {}
        },
        ...originatorClientId ? { originatorClientId } : {}
      });
    } catch {
    }
    entry.events.close();
    await entry.attachments.close().catch((error) => {
      writeStderrLine(
        `qwen serve: failed to close attachments for session ${JSON.stringify(sessionId)}: ${error instanceof Error ? error.message : String(error)}`
      );
    });
    if (!agentSessionClosed) {
      try {
        await telemetry.withSpan(
          "session.close.cancel_active_prompt",
          {
            "qwen-code.daemon.bridge.operation": "session.close.cancel_active_prompt",
            "session.id": sessionId
          },
          async () => await entry.connection.cancel({ sessionId })
        );
      } catch {
      }
    }
    if (ci && hasNoChannelWork(ci)) {
      await reapPendingEmptyChannel(ci);
      if (!ci.isDying) {
        await startIdleTimer(ci, `closeSession "${sessionId}"`);
      }
    }
  }
  __name(closeSessionImpl, "closeSessionImpl");
  startSessionReaper();
  const rememberMidTurnId = /* @__PURE__ */ __name((ring, messageId) => {
    ring.push(messageId);
    if (ring.length > MID_TURN_RECONCILIATION_RING_SIZE) {
      ring.splice(0, ring.length - MID_TURN_RECONCILIATION_RING_SIZE);
    }
  }, "rememberMidTurnId");
  const promoteMidTurnMessage = /* @__PURE__ */ __name((entry, messageId, text, originatorClientId, content) => {
    const resolvableBlocks = [];
    let degraded = 0;
    for (const block of content ?? []) {
      try {
        entry.attachments.assertReference(block);
        resolvableBlocks.push(block);
      } catch (error) {
        if (!(error instanceof SessionAttachmentReferenceError)) throw error;
        degraded += 1;
      }
    }
    let prompt = [
      ...text ? [{ type: "text", text }] : [],
      ...resolvableBlocks
    ];
    if (degraded > 0) {
      prompt = withAttachmentDegradationMarker(prompt);
    }
    const context = {
      promptId: messageId,
      promotedMidTurn: { originatorClientId },
      onPromptAdmitted: /* @__PURE__ */ __name(() => {
        rememberMidTurnId(entry.promotedMidTurnMessageIds, messageId);
      }, "onPromptAdmitted")
    };
    const sendFallback = /* @__PURE__ */ __name(() => bridgeApi.sendPrompt(
      entry.sessionId,
      {
        sessionId: entry.sessionId,
        prompt: withAttachmentDegradationMarker(
          text ? [{ type: "text", text }] : []
        )
      },
      void 0,
      context
    ), "sendFallback");
    let result;
    try {
      result = bridgeApi.sendPrompt(
        entry.sessionId,
        {
          sessionId: entry.sessionId,
          prompt
        },
        void 0,
        context
      );
    } catch (error) {
      try {
        if (!(error instanceof SessionAttachmentReferenceError)) throw error;
        result = sendFallback();
      } catch (fallbackError) {
        writeStderrLine(
          `[mid-turn] session=${JSON.stringify(entry.sessionId)} failed to run promoted message ${JSON.stringify(messageId)}: ${JSON.stringify(fallbackError instanceof Error ? fallbackError.message : String(fallbackError))}`
        );
        return;
      }
    }
    void result.catch((error) => {
      writeStderrLine(
        `[mid-turn] session=${JSON.stringify(entry.sessionId)} failed to run promoted message ${JSON.stringify(messageId)}: ${JSON.stringify(error instanceof Error ? error.message : String(error))}`
      );
    });
  }, "promoteMidTurnMessage");
  const settleUndrainedMidTurnMessages = /* @__PURE__ */ __name((entry, messages) => {
    for (const message of messages) {
      if (message.queueOnly) {
        try {
          message.onSettledWithoutDrain?.();
        } catch (error) {
          writeStderrLine(
            `[mid-turn] session=${JSON.stringify(entry.sessionId)} failed to hand undrained queue-only message ${JSON.stringify(message.messageId)} back to its caller: ${JSON.stringify(error instanceof Error ? error.message : String(error))}`
          );
        }
        continue;
      }
      promoteMidTurnMessage(
        entry,
        message.messageId,
        message.text,
        message.originatorClientId,
        message.content
      );
    }
  }, "settleUndrainedMidTurnMessages");
  const settleMidTurnQueueAfterGoalTurn = /* @__PURE__ */ __name((sessionId) => {
    const entry = byId.get(sessionId);
    if (!entry) return;
    if (entry.goalTurnActive === true || entry.pendingPromptCount > 0 || entry.closing) {
      return;
    }
    const undrained = entry.midTurnMessageQueue.splice(0);
    if (undrained.length === 0) return;
    settleUndrainedMidTurnMessages(entry, undrained);
  }, "settleMidTurnQueueAfterGoalTurn");
  const trustedStandaloneSpawnRequests = /* @__PURE__ */ new WeakMap();
  const bridgeApi = {
    setLiveScreenContextCaptureHandler(handler) {
      liveScreenContextCaptureHandler = handler;
    },
    setLiveTaskToolRequestHandler(handler) {
      liveTaskToolRequestHandler = handler;
    },
    setLiveSpeakToUserHandler(handler) {
      liveSpeakToUserHandler = handler;
    },
    getDaemonStatusSnapshot() {
      return {
        limits: {
          maxSessions: maxSessions === Infinity ? null : maxSessions,
          maxPendingPromptsPerSession: maxPendingPromptsPerSession === Infinity ? null : maxPendingPromptsPerSession,
          eventRingSize,
          compactedReplayMaxBytes,
          maxJournalEvents,
          maxJournalBytes,
          journalGrowth: journalGrowthPoolBytes !== void 0 ? {
            poolBytes: journalGrowthPoolBytes,
            hardCapBytes: JOURNAL_GROWTH_HARD_CAP_BYTES
          } : null,
          channelIdleTimeoutMs: resolvedChannelIdleTimeoutMs(),
          sessionIdleTimeoutMs
        },
        sessionCount: byId.size,
        pendingPermissionCount: permissionMediator.pendingCount,
        channelLive: !!liveChannelInfo(),
        permissionPolicy: permissionMediator.policy,
        sessions: [...byId.values()].map((entry) => {
          const journalLimits = entry.events.journalLimits();
          return {
            sessionId: entry.sessionId,
            workspaceCwd: entry.workspaceCwd,
            createdAt: entry.createdAt,
            ...entry.displayName ? { displayName: entry.displayName } : {},
            clientCount: entry.clientIds.size,
            subscriberCount: entry.events.subscriberCount,
            attachCount: entry.attachCount,
            pendingPromptCount: entry.pendingPromptCount,
            pendingPermissionCount: entry.pendingPermissionIds.size,
            hasActivePrompt: entry.promptActive || entry.goalTurnActive === true,
            lastEventId: entry.events.lastEventId,
            ...entry.sessionLastSeenAt !== void 0 ? { lastSeenAt: entry.sessionLastSeenAt } : {},
            ...entry.currentModelId ? { currentModelId: entry.currentModelId } : {},
            ...entry.currentApprovalMode ? { currentApprovalMode: entry.currentApprovalMode } : {},
            maxJournalEvents: journalLimits?.maxEvents ?? maxJournalEvents,
            maxJournalBytes: journalLimits?.maxBytes ?? maxJournalBytes
          };
        })
      };
    },
    get sessionCount() {
      return byId.size;
    },
    get pendingPromptTotal() {
      let total = 0;
      for (const entry of byId.values()) {
        for (const pending of entry.pendingPromptList) {
          if (pending.state === "queued") total += 1;
        }
      }
      return total;
    },
    // Daemon Status child-resource: sync cache read for the sampler + the async
    // refresh it fires each tick to update that cache.
    getChildResourceSnapshot,
    refreshChildResource,
    get activePromptCount() {
      return activePromptCounter;
    },
    get activeWork() {
      for (const entry of byId.values()) {
        if (entryHasActiveWork(entry)) return true;
      }
      return false;
    },
    /**
     * Raw coverage counts rather than a pre-collapsed grade.
     *
     * The grade has to be computed over the whole daemon, not per runtime and
     * then combined: a runtime with zero Sessions is vacuously `full`, and
     * folding that in as evidence made a deployment whose only real Sessions
     * were unreported aggregate to `partial`. Counts compose; grades do not.
     */
    get activeWorkCoverage() {
      let covered = 0;
      let onNegotiatedChannel = 0;
      let total = 0;
      let oldestCoveredReportAt = null;
      for (const entry of byId.values()) {
        total++;
        const owner = channelInfoForEntry(entry);
        const capability = owner?.activeWork;
        if (!capability) continue;
        onNegotiatedChannel++;
        if (ACTIVE_WORK_HOLD_CATEGORIES.some(
          (category) => !capability.categories.includes(category)
        )) {
          continue;
        }
        if (!childHoldsAreFresh(entry, capability)) continue;
        covered++;
        if (entry.childHoldsAt !== null && (oldestCoveredReportAt === null || entry.childHoldsAt < oldestCoveredReportAt)) {
          oldestCoveredReportAt = entry.childHoldsAt;
        }
      }
      return { total, covered, onNegotiatedChannel, oldestCoveredReportAt };
    },
    get lastActivityAt() {
      return lastActivityTimestamp;
    },
    get idleSinceMs() {
      return lastActivityTimestamp !== null ? Date.now() - lastActivityTimestamp : null;
    },
    isChannelLive() {
      return !!liveChannelInfo();
    },
    get pendingPermissionCount() {
      return permissionMediator.pendingCount;
    },
    get permissionPolicy() {
      return permissionMediator.policy;
    },
    async loadSession(req) {
      return restoreSession("load", req);
    },
    async resumeSession(req) {
      return restoreSession("resume", req);
    },
    async spawnStandaloneSession(req) {
      const spawnRequest = {
        workspaceCwd: req.workspaceCwd,
        sessionId: req.sessionId,
        sessionScope: "thread",
        sourceType: STANDALONE_SESSION_SOURCE_TYPE,
        ...req.parentSessionId !== void 0 ? { parentSessionId: req.parentSessionId } : {},
        ...req.modelServiceId !== void 0 ? { modelServiceId: req.modelServiceId } : {},
        ...req.approvalMode !== void 0 ? { approvalMode: req.approvalMode } : {}
      };
      const state = { dispatched: false };
      trustedStandaloneSpawnRequests.set(spawnRequest, state);
      try {
        return await bridgeApi.spawnOrAttach(spawnRequest);
      } catch (error) {
        throw new StandaloneSessionSpawnError(state.dispatched, error);
      }
    },
    async restoreStandaloneSession(action, req) {
      return restoreSession(
        action,
        {
          ...req,
          sourceType: STANDALONE_SESSION_SOURCE_TYPE
        },
        { daemonOwnedStandaloneRestore: true }
      );
    },
    async spawnOrAttach(req) {
      if (shuttingDown) {
        throw new Error("AcpSessionBridge is shutting down");
      }
      const workspaceKey = resolveWorkspaceKey(req.workspaceCwd);
      const trustedStandaloneSpawn = trustedStandaloneSpawnRequests.get(req);
      trustedStandaloneSpawnRequests.delete(req);
      const daemonOwnedStandaloneCreation = trustedStandaloneSpawn !== void 0;
      if (req.sessionScope !== void 0 && req.sessionScope !== "single" && req.sessionScope !== "thread") {
        throw new InvalidSessionScopeError(req.sessionScope);
      }
      const effectiveScope = req.sessionId !== void 0 ? "thread" : req.sessionScope ?? defaultSessionScope;
      const source = parseSessionSource(req.sourceType, req.sourceId);
      if ("error" in source) {
        throw new InvalidSessionMetadataError("sourceType", source.error);
      }
      if (isReservedStandaloneSessionSourceType(source.sourceType) && !daemonOwnedStandaloneCreation) {
        throw new InvalidSessionMetadataError(
          "sourceType",
          "`standalone` is reserved for daemon-owned session creation"
        );
      }
      if (req.approvalMode !== void 0 && !KNOWN_APPROVAL_MODES.has(req.approvalMode)) {
        throw new Error(
          `Invalid approvalMode: ${JSON.stringify(req.approvalMode)}`
        );
      }
      if (effectiveScope === "single") {
        const existing = defaultEntry;
        if (existing) {
          assertAttachableSessionEntry(existing.sessionId, existing);
          existing.attachCount++;
          const clientId = registerClient(existing, req.clientId);
          recordAttachRef(existing, clientId);
          if (req.modelServiceId) {
            await applyModelServiceId(
              existing,
              req.modelServiceId,
              initTimeoutMs,
              clientId
            ).catch(() => {
            });
          }
          let previousApprovalMode;
          if (req.approvalMode) {
            previousApprovalMode = await applyApprovalModeForAttach(
              existing,
              req.approvalMode,
              clientId
            );
          }
          try {
            assertAttachableSessionEntry(existing.sessionId, existing);
          } catch (error) {
            if (previousApprovalMode !== void 0) {
              await rollbackApprovalModeForRejectedAttach(
                existing,
                previousApprovalMode,
                clientId
              );
            }
            await rollbackAttachRegistration(existing, clientId);
            throw error;
          }
          return {
            sessionId: existing.sessionId,
            workspaceCwd: existing.workspaceCwd,
            ...existing.effectiveCwd !== existing.workspaceCwd ? { currentCwd: existing.effectiveCwd } : {},
            attached: true,
            clientId,
            createdAt: existing.createdAt,
            ...existing.sourceType ? { sourceType: existing.sourceType } : {},
            ...existing.sourceId !== void 0 ? { sourceId: existing.sourceId } : {},
            hasActivePrompt: existing.promptActive || existing.goalTurnActive === true
          };
        }
        const inFlight = inFlightSpawns.get(workspaceKey);
        if (inFlight) {
          const session = await inFlight;
          const attachedEntry = byId.get(session.sessionId);
          if (!attachedEntry) {
            throw new SessionNotFoundError(
              session.sessionId,
              "the agent child likely crashed during initialization \u2014 retry to spawn a new session"
            );
          }
          assertAttachableSessionEntry(session.sessionId, attachedEntry);
          attachedEntry.attachCount++;
          const clientId = registerClient(attachedEntry, req.clientId);
          recordAttachRef(attachedEntry, clientId);
          if (req.modelServiceId) {
            await applyModelServiceId(
              attachedEntry,
              req.modelServiceId,
              initTimeoutMs,
              clientId
            ).catch(() => {
            });
          }
          let previousApprovalMode;
          if (req.approvalMode) {
            previousApprovalMode = await applyApprovalModeForAttach(
              attachedEntry,
              req.approvalMode,
              clientId
            );
          }
          try {
            assertAttachableSessionEntry(session.sessionId, attachedEntry);
          } catch (error) {
            if (previousApprovalMode !== void 0) {
              await rollbackApprovalModeForRejectedAttach(
                attachedEntry,
                previousApprovalMode,
                clientId
              );
            }
            await rollbackAttachRegistration(attachedEntry, clientId);
            throw error;
          }
          return {
            ...session,
            attached: true,
            clientId,
            hasActivePrompt: attachedEntry.promptActive || attachedEntry.goalTurnActive === true
          };
        }
      }
      if (req.sessionId !== void 0) {
        const restoreOwner = inFlightRestores.get(req.sessionId);
        if (restoreOwner) {
          const abandoned = restoreOwner.lifecycle.phase === "abandoned";
          throw new RestoreInProgressError(
            req.sessionId,
            restoreOwner.action,
            "spawn",
            abandoned ? {
              reason: "awaiting_abandoned_cleanup",
              retryAfterSeconds: abandonedRestoreRetryAfterSeconds
            } : void 0
          );
        }
        if (inFlightRequestedSessionSpawns.has(req.sessionId)) {
          throw new RestoreInProgressError(req.sessionId, "spawn", "spawn");
        }
      }
      assertFreshSessionsAvailable();
      if (byId.size + inFlightSpawns.size + inFlightRestores.size >= maxSessions) {
        throw new SessionLimitExceededError(maxSessions);
      }
      const requestedSessionRegistrationOwner = req.sessionId !== void 0 ? Symbol(req.sessionId) : void 0;
      if (req.sessionId !== void 0 && requestedSessionRegistrationOwner !== void 0) {
        inFlightRequestedSessionSpawns.set(
          req.sessionId,
          requestedSessionRegistrationOwner
        );
      }
      const releaseRequestedSessionRegistration = /* @__PURE__ */ __name(() => {
        if (req.sessionId !== void 0 && requestedSessionRegistrationOwner !== void 0 && inFlightRequestedSessionSpawns.get(req.sessionId) === requestedSessionRegistrationOwner) {
          inFlightRequestedSessionSpawns.delete(req.sessionId);
        }
      }, "releaseRequestedSessionRegistration");
      let admission;
      try {
        admission = reserveFreshSession({
          operation: "spawn",
          workspaceCwd: workspaceKey,
          ...req.sessionId !== void 0 ? { sessionId: req.sessionId } : {}
        });
      } catch (error) {
        releaseRequestedSessionRegistration();
        throw error;
      }
      let admissionReleased = false;
      const releaseAdmissionOnce = /* @__PURE__ */ __name(() => {
        if (admissionReleased) return;
        admissionReleased = true;
        releaseFreshSessionReservation(admission);
      }, "releaseAdmissionOnce");
      const promise = doSpawn(
        req.modelServiceId,
        effectiveScope,
        req.approvalMode,
        req.clientId,
        releaseAdmissionOnce,
        req.parentSessionId,
        source.sourceType,
        source.sourceId,
        req.worktree,
        req.branch,
        req.sessionId,
        daemonOwnedStandaloneCreation,
        trustedStandaloneSpawn ? () => {
          trustedStandaloneSpawn.dispatched = true;
        } : void 0
      );
      const tracker = effectiveScope === "single" ? workspaceKey : `${workspaceKey}#${randomUUID()}`;
      inFlightSpawns.set(tracker, promise);
      try {
        return await promise;
      } finally {
        releaseAdmissionOnce();
        inFlightSpawns.delete(tracker);
        releaseRequestedSessionRegistration();
      }
    },
    // Keep this method non-async: admission failures must throw before
    // HTTP routes return 202.
    sendPrompt(sessionId, req, signal, context) {
      opts.onDiagnosticLine?.(
        `qwen serve: bridge sendPrompt for session=${sessionId}`,
        "info"
      );
      const capturedContext = telemetry.captureContext();
      const queuedAt = Date.now();
      const entry = byId.get(sessionId);
      if (!entry) return Promise.reject(new SessionNotFoundError(sessionId));
      if (isClosingOrAuthorizingClose(entry)) {
        return Promise.reject(
          new SessionNotFoundError(
            sessionId,
            "The session is closing; retry after close completes",
            "session_closing"
          )
        );
      }
      if (isReservedStandaloneSessionSourceType(entry.sourceType) && entry.managedConversationBinding?.released !== true) {
        return Promise.reject(standaloneWorkingDirectoryMissingError());
      }
      if (!Array.isArray(req.prompt)) {
        return Promise.reject(
          RequestError.invalidParams(void 0, "Prompt must be an array")
        );
      }
      const promotedMidTurn = context?.promotedMidTurn;
      const isPromotedMidTurn = promotedMidTurn !== void 0;
      const originatorClientId = promotedMidTurn ? promotedMidTurn.originatorClientId : resolveTrustedClientId(entry, context?.clientId);
      entry.attachments.assertReferences(req.prompt);
      const modelPrompt = context?.modelPrompt;
      if (modelPrompt !== void 0 && !isValidTrustedModelPrompt(modelPrompt)) {
        throw new TypeError(
          "Bridge modelPrompt must be a non-empty bounded string."
        );
      }
      if (signal?.aborted) {
        throw new DOMException("Prompt aborted", "AbortError");
      }
      if (!isPromotedMidTurn && entry.pendingPromptCount >= maxPendingPromptsPerSession) {
        throw new PromptQueueFullError(
          maxPendingPromptsPerSession,
          entry.pendingPromptCount,
          sessionId
        );
      }
      entry.pendingPromptCount += 1;
      let promptSlotReleased = false;
      const releasePromptSlot = /* @__PURE__ */ __name(() => {
        if (promptSlotReleased) return;
        promptSlotReleased = true;
        entry.pendingPromptCount = Math.max(0, entry.pendingPromptCount - 1);
      }, "releasePromptSlot");
      const promptId = context?.promptId ?? randomUUID();
      const invocationContext = Object.freeze({
        version: 1,
        sessionId,
        promptId,
        ...originatorClientId ? { originatorClientId } : {}
      });
      const isQueued = entry.pendingPromptCount > 1;
      const pendingAbort = new AbortController();
      if (signal) {
        if (signal.aborted) {
          pendingAbort.abort(signal.reason);
        } else {
          signal.addEventListener(
            "abort",
            () => pendingAbort.abort(signal.reason),
            { once: true }
          );
        }
      }
      const channelDisplayText = getChannelPromptDisplayText(
        entry,
        context?.promptDisplayText
      );
      const pendingText = channelDisplayText === void 0 ? extractPromptText(req.prompt) : channelDisplayText || (req.prompt.some(
        (block) => isRecord2(block) && block["type"] === "image"
      ) ? "[image]" : "");
      const pendingEntry = {
        promptId,
        queuedAt,
        ...originatorClientId !== void 0 ? { originatorClientId } : {},
        ...isPromotedMidTurn ? { promotedMidTurn: true } : {},
        text: pendingText,
        content: extractMediaBlocks(req.prompt),
        abortController: pendingAbort,
        state: isQueued ? "queued" : "running"
      };
      entry.pendingPromptList.push(pendingEntry);
      let tailUuid;
      try {
        tailUuid = entry.promptLedger?.transcriptTailUuid?.(sessionId);
      } catch (error) {
        opts.onDiagnosticLine?.(
          `qwen serve: prompt ledger dispatch marker failed for session=${sessionId}: ${error instanceof Error ? error.message : String(error)}`,
          "warn"
        );
      }
      appendPromptLedgerBestEffort(entry, {
        v: 1,
        promptId,
        state: "in_flight",
        ...tailUuid !== void 0 ? { tailUuid } : {},
        at: queuedAt
      });
      try {
        context?.onPromptAdmitted?.();
      } catch (error) {
        opts.onDiagnosticLine?.(
          `qwen serve: prompt admission observer failed for session=${sessionId}: ${error instanceof Error ? error.message : String(error)}`,
          "warn"
        );
      }
      const deadlineMs = context?.deadlineMs;
      const hasDeadline = typeof deadlineMs === "number" && Number.isFinite(deadlineMs) && deadlineMs > 0;
      let deadlineReject;
      let deadlinePromise;
      let deadlineTimer;
      if (hasDeadline) {
        deadlinePromise = new Promise((_resolve, reject) => {
          deadlineReject = reject;
        });
        deadlinePromise.catch(() => {
        });
        pendingEntry.cancelForwardDeadline = deadlinePromise.then(
          () => void 0,
          () => void 0
        );
        const onDeadline = /* @__PURE__ */ __name(() => {
          if (pendingEntry.terminalPublished) return;
          const deadlineErr = new PromptDeadlineExceededError(deadlineMs);
          writeStderrLine(
            `sendPrompt: prompt ${promptId} exceeded ${deadlineMs}ms deadline for session ${sessionId}; agent may still be executing`
          );
          publishPromptTerminal(entry, pendingEntry, {
            kind: "error",
            err: {
              code: "prompt_deadline_exceeded",
              message: deadlineErr.message
            }
          });
          settleActivePromptState(entry, pendingEntry.promptId);
          deadlineReject?.(deadlineErr);
          pendingAbort.abort(deadlineErr);
        }, "onDeadline");
        deadlineTimer = setTimeout(onDeadline, deadlineMs);
        deadlineTimer.unref();
      }
      if (isQueued) {
        pendingAbort.signal.addEventListener(
          "abort",
          () => {
            if (pendingEntry.state !== "queued") return;
            const waitingOwnerPromptId = entry.todoStopGuardAwaitingQueuedPromptOwnerPromptId;
            if (!waitingOwnerPromptId) return;
            const hasAnotherQueuedPrompt = entry.pendingPromptList.some(
              (candidate) => candidate !== pendingEntry && candidate.state === "queued" && !candidate.abortController.signal.aborted
            );
            if (hasAnotherQueuedPrompt) return;
            delete entry.todoStopGuardAwaitingQueuedPromptOwnerPromptId;
            void entry.connection.extMethod(TODO_STOP_GUARD_QUEUE_RELEASE_METHOD, {
              sessionId,
              promptId: waitingOwnerPromptId
            }).catch((error) => {
              writeStderrLine(
                `qwen serve: Todo Stop Guard queued-prompt release failed for ${JSON.stringify(sessionId)}: ${error instanceof Error ? error.message : String(error)}`
              );
            });
          },
          { once: true }
        );
        entry.events.publish({
          type: "pending_prompt_added",
          promptId: pendingEntry.promptId,
          data: {
            sessionId,
            promptId: pendingEntry.promptId,
            text: pendingEntry.text,
            queuedAt: pendingEntry.queuedAt
          },
          ...originatorClientId ? { originatorClientId } : {}
        });
      }
      const result = entry.promptQueue.then(
        () => telemetry.runWithContext(capturedContext, async () => {
          const queueWaitMs = Date.now() - queuedAt;
          telemetry.metrics?.promptQueueWait(queueWaitMs);
          if (pendingAbort.signal.aborted) {
            if (pendingAbort.signal.reason instanceof PromptDeadlineExceededError) {
              throw pendingAbort.signal.reason;
            }
            throw new DOMException("Prompt aborted", "AbortError");
          }
          if (isReservedStandaloneSessionSourceType(entry.sourceType) && entry.managedConversationBinding?.released !== true) {
            throw standaloneWorkingDirectoryMissingError();
          }
          pendingEntry.startedAt = Date.now();
          if (pendingEntry.state === "queued" || isPromotedMidTurn) {
            if (pendingEntry.state === "queued") {
              delete entry.todoStopGuardAwaitingQueuedPromptOwnerPromptId;
              pendingEntry.state = "running";
            }
            entry.events.publish({
              type: "pending_prompt_started",
              promptId: pendingEntry.promptId,
              data: {
                sessionId,
                promptId: pendingEntry.promptId,
                text: pendingEntry.text
              },
              ...originatorClientId ? { originatorClientId } : {}
            });
          }
          const dispatchStartMs = Date.now();
          try {
            return await telemetry.withSpan(
              "prompt.dispatch",
              {
                "qwen-code.daemon.bridge.operation": "prompt.dispatch",
                "session.id": sessionId,
                "qwen-code.daemon.prompt.queue_wait_ms": queueWaitMs,
                ...context?.clientId ? { "qwen-code.client_id": context.clientId } : {}
              },
              async () => {
                let dispatchBlocks = req.prompt;
                let resolvedPrompt;
                try {
                  resolvedPrompt = annotateAttachmentReferences(
                    sessionId,
                    dispatchBlocks,
                    await entry.attachments.resolveContent(dispatchBlocks)
                  );
                } catch (error) {
                  if (!isPromotedMidTurn || !(error instanceof SessionAttachmentReferenceError)) {
                    throw error;
                  }
                  const perBlock = await entry.attachments.resolveContentDegrading(
                    dispatchBlocks
                  );
                  dispatchBlocks = perBlock.retainedBlocks;
                  resolvedPrompt = withAttachmentDegradationMarker(
                    annotateAttachmentReferences(
                      sessionId,
                      perBlock.retainedBlocks,
                      perBlock.resolvedBlocks
                    )
                  );
                }
                const normalized = telemetry.injectPromptContext(
                  {
                    ...req,
                    sessionId,
                    prompt: resolvedPrompt
                  }
                );
                assertLivePromptEntry(sessionId, entry);
                const requestedRetry = req.retry === true;
                const isRetry = requestedRetry && entry.retryAllowed;
                entry.retryAllowed = false;
                const isContinue = context?.continue === true;
                const isRestoreAskUserQuestion = context?.restoreAskUserQuestion === true;
                const promptRequest = (() => {
                  const copy = {
                    ...normalized
                  };
                  delete copy.retry;
                  delete copy.delivery;
                  const meta = copy._meta && typeof copy._meta === "object" ? { ...copy._meta } : {};
                  const promptDisplayText = channelDisplayText;
                  delete meta[DAEMON_RETRY_META_KEY];
                  delete meta[INVOCATION_CONTEXT_META_KEY];
                  delete meta[PRIVATE_PARENT_CAPABILITY_META_KEY];
                  delete meta[DAEMON_CONTINUE_META_KEY];
                  delete meta[DAEMON_RESTORE_ASK_USER_QUESTION_META_KEY];
                  delete meta[DAEMON_CHANNEL_DELIVERY_META_KEY];
                  delete meta[DAEMON_PROMPT_DISPLAY_TEXT_META_KEY];
                  delete meta[DAEMON_MODEL_PROMPT_META_KEY];
                  delete meta[DAEMON_ATTACHMENT_REFERENCES_META_KEY];
                  delete meta[CHANNEL_PROMPT_META_KEY];
                  if (isRetry) {
                    meta[DAEMON_RETRY_META_KEY] = true;
                  }
                  if (isContinue) {
                    meta[DAEMON_CONTINUE_META_KEY] = true;
                  }
                  if (isRestoreAskUserQuestion) {
                    meta[DAEMON_RESTORE_ASK_USER_QUESTION_META_KEY] = true;
                  }
                  if (context?.channelDelivery) {
                    meta[DAEMON_CHANNEL_DELIVERY_META_KEY] = context.channelDelivery;
                  }
                  if (promptDisplayText !== void 0) {
                    meta[DAEMON_PROMPT_DISPLAY_TEXT_META_KEY] = promptDisplayText;
                  }
                  if (modelPrompt !== void 0) {
                    meta[DAEMON_MODEL_PROMPT_META_KEY] = modelPrompt;
                  }
                  const attachmentReferences = dispatchBlocks.filter(
                    isSessionAttachmentReference
                  );
                  if (attachmentReferences.length > 0) {
                    meta[DAEMON_ATTACHMENT_REFERENCES_META_KEY] = attachmentReferences;
                  }
                  if (context?.channelPrompt === true) {
                    meta[CHANNEL_PROMPT_META_KEY] = true;
                  }
                  meta[INVOCATION_CONTEXT_META_KEY] = invocationContext;
                  if (Object.keys(meta).length > 0) {
                    copy._meta = meta;
                  } else {
                    delete copy._meta;
                  }
                  return copy;
                })();
                entry.promptActive = true;
                entry.goalTurnActive = false;
                entry.activePromptId = pendingEntry.promptId;
                delete entry.cancelBroadcastWithoutPrompt;
                delete entry.turnError;
                delete entry.turnErrorEvent;
                activePromptCounter++;
                entry.sessionLastSeenAt = Date.now();
                touchActivity();
                if (originatorClientId === void 0) {
                  delete entry.activePromptOriginatorClientId;
                } else {
                  entry.activePromptOriginatorClientId = originatorClientId;
                }
                try {
                  if (!isRetry && !isContinue && !isRestoreAskUserQuestion) {
                    echoPromptToSessionBus(
                      entry,
                      {
                        ...promptRequest,
                        prompt: dispatchBlocks
                      },
                      pendingEntry.promptId,
                      originatorClientId,
                      channelDisplayText
                    );
                  }
                } catch (echoErr) {
                  settleActivePromptState(entry, pendingEntry.promptId);
                  throw echoErr;
                }
                pendingEntry.dispatched = true;
                const promptPromise = entry.connection.prompt(promptRequest).finally(() => {
                  settleActivePromptState(entry, pendingEntry.promptId);
                });
                const racedPromise = deadlinePromise ? Promise.race([
                  promptPromise,
                  getTransportClosedReject(entry),
                  deadlinePromise
                ]) : Promise.race([
                  promptPromise,
                  getTransportClosedReject(entry)
                ]);
                void racedPromise.then(
                  () => {
                  },
                  (err) => {
                    if (err instanceof PromptDeadlineExceededError) {
                      return;
                    }
                    if (err instanceof DOMException && err.name === "AbortError" && pendingEntry.state === "queued") {
                      writeStderrLine(
                        `sendPrompt: queued prompt removed before agent forward for session ${sessionId}`
                      );
                      return;
                    }
                    if (extractJsonRpcErrorField(err, "errorKind")) {
                      cancelPendingForSession(sessionId);
                      return;
                    }
                    writeStderrLine(
                      `sendPrompt: forward failed for session ${sessionId}: ${extractErrorMessage(err)}`
                    );
                    broadcastPromptCancelledOnce(
                      entry,
                      sessionId,
                      pendingEntry.promptId,
                      originatorClientId,
                      "forward_failed"
                    );
                    cancelPendingForSession(sessionId);
                  }
                ).catch(() => {
                });
                const abortSignal = pendingAbort.signal;
                const onAbort = /* @__PURE__ */ __name(() => {
                  broadcastPromptCancelledOnce(
                    entry,
                    sessionId,
                    pendingEntry.promptId,
                    originatorClientId
                  );
                  cancelPendingForSession(sessionId);
                  if (byId.get(sessionId) === entry) {
                    void forwardRunningPromptCancel(entry, pendingEntry, {
                      sessionId
                    }).catch((err) => {
                      writeStderrLine(
                        `[pending-prompt] cancel forward failed after removePendingPrompt session=${sessionId}: ${extractErrorMessage(err)}`
                      );
                    });
                  }
                }, "onAbort");
                if (abortSignal.aborted) {
                  onAbort();
                } else {
                  abortSignal.addEventListener("abort", onAbort, {
                    once: true
                  });
                  if (abortSignal.aborted) onAbort();
                  racedPromise.finally(
                    () => abortSignal.removeEventListener("abort", onAbort)
                  ).catch(() => {
                  });
                }
                return racedPromise;
              }
            );
          } finally {
            telemetry.metrics?.promptDuration(Date.now() - dispatchStartMs);
          }
        })
      );
      result.then(
        (promptResult) => {
          publishPromptTerminal(entry, pendingEntry, {
            kind: "complete",
            result: promptResult
          });
        },
        (err) => {
          if (err instanceof DOMException && err.name === "AbortError") {
            publishPromptTerminal(entry, pendingEntry, { kind: "cancelled" });
            return;
          }
          publishPromptTerminal(entry, pendingEntry, { kind: "error", err });
        }
      );
      const drainCancelForwarding = /* @__PURE__ */ __name(async () => {
        try {
          await pendingEntry.cancelForwardDrain;
        } catch {
        }
      }, "drainCancelForwarding");
      entry.promptQueue = result.then(
        drainCancelForwarding,
        drainCancelForwarding
      );
      result.finally(() => {
        if (deadlineTimer !== void 0) clearTimeout(deadlineTimer);
        const listIdx = entry.pendingPromptList.indexOf(pendingEntry);
        if (listIdx !== -1) {
          entry.pendingPromptList.splice(listIdx, 1);
          if (isQueued && !pendingEntry.removed) {
            try {
              entry.events.publish({
                type: "pending_prompt_completed",
                promptId: pendingEntry.promptId,
                data: {
                  sessionId,
                  promptId: pendingEntry.promptId,
                  state: "completed"
                },
                ...originatorClientId ? { originatorClientId } : {}
              });
            } catch {
            }
          }
        }
        const shouldSettleMidTurnQueue = entry.pendingPromptCount === 1 && !entry.closing && byId.get(entry.sessionId) === entry;
        const undrainedMessages = shouldSettleMidTurnQueue ? entry.midTurnMessageQueue.splice(0) : [];
        releasePromptSlot();
        settleUndrainedMidTurnMessages(entry, undrainedMessages);
        void maybeCloseIdleSession(entry, "prompt_settled");
      }).catch(() => {
      });
      return result;
    },
    async cancelSession(sessionId, req, context) {
      opts.onDiagnosticLine?.(
        `qwen serve: bridge cancelSession for session=${sessionId}`,
        "info"
      );
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const cancelOriginatorClientId = resolveTrustedClientId(
        entry,
        context?.clientId
      );
      const runningPrompt = entry.pendingPromptList.find(
        (pending) => pending.state === "running" && !pending.terminalPublished
      );
      broadcastPromptCancelledOnce(
        entry,
        sessionId,
        entry.activePromptId ?? runningPrompt?.promptId,
        cancelOriginatorClientId
      );
      cancelPendingForSession(sessionId);
      const notif = req ? { ...req, sessionId } : { sessionId };
      telemetry.metrics?.cancelled();
      await telemetry.withSpan(
        "session.cancel",
        {
          "qwen-code.daemon.bridge.operation": "session.cancel",
          "session.id": sessionId
        },
        async () => {
          if (runningPrompt) {
            const forwarding = runningPrompt.dispatched === true && entry.activePromptId === runningPrompt.promptId ? forwardRunningPromptCancel(entry, runningPrompt, notif) : Promise.resolve();
            runningPrompt.abortController.abort(
              new DOMException(
                "Prompt cancelled before dispatch",
                "AbortError"
              )
            );
            await forwarding;
            return;
          }
          try {
            await entry.connection.cancel(notif);
          } catch (err) {
            if (isNotCurrentlyGeneratingCancelError(err)) return;
            throw err;
          }
        }
      );
    },
    subscribeEvents(sessionId, subOpts) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const raw = entry.events.subscribe(subOpts);
      if (!subOpts?.snapshot) return raw;
      const snapshotFrame = /* @__PURE__ */ __name(() => ({
        v: EVENT_SCHEMA_VERSION,
        type: "session_snapshot",
        data: {
          sessionId: entry.sessionId,
          currentModelId: entry.currentModelId ?? null,
          currentApprovalMode: entry.currentApprovalMode ?? null,
          recordingDegraded: entry.recordingDegraded
        }
      }), "snapshotFrame");
      async function* withSnapshot() {
        let injected = false;
        if (subOpts?.lastEventId === void 0) {
          yield snapshotFrame();
          injected = true;
        }
        for await (const event of raw) {
          yield event;
          if (!injected && event.type === "replay_complete") {
            yield snapshotFrame();
            injected = true;
          }
        }
      }
      __name(withSnapshot, "withSnapshot");
      return withSnapshot();
    },
    getSessionLastEventId(sessionId) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      return entry.events.lastEventId;
    },
    getSessionEventEpoch(sessionId) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      return entry.events.epoch;
    },
    getSessionCurrentCwd(sessionId) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      return entry.effectiveCwd;
    },
    getSessionReplaySnapshot(sessionId) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      return entry.events.snapshotReplay();
    },
    respondToPermission(requestId, response, context) {
      const sessionId = permissionMediator.peekSessionFor(requestId);
      if (sessionId === void 0 || !byId.has(sessionId)) {
        writeStderrLine(
          `qwen serve: legacy permission vote ${JSON.stringify(requestId)} has no live session (peek returned ${JSON.stringify(sessionId)}); returning 404.`
        );
        return false;
      }
      return this.respondToSessionPermission(
        sessionId,
        requestId,
        response,
        context
      );
    },
    respondToSessionPermission(sessionId, requestId, response, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const actualSessionId = permissionMediator.peekSessionFor(requestId);
      if (actualSessionId !== void 0 && actualSessionId !== sessionId) {
        teeServeDebugLine(
          `rejected permission vote ${JSON.stringify(requestId)} for session ${JSON.stringify(sessionId)}; request belongs to session ${JSON.stringify(actualSessionId)}.`
        );
        return false;
      }
      if (actualSessionId === void 0) {
        writeStderrLine(
          `qwen serve: rejected permission vote ${JSON.stringify(requestId)} for session ${JSON.stringify(sessionId)}; mediator has no pending or resolved record (unknown / timed out / LRU-evicted).`
        );
        return false;
      }
      const trustedClientId = resolveTrustedClientId(entry, context?.clientId);
      if (response.outcome.outcome === "selected" && response.outcome.optionId === CANCEL_VOTE_SENTINEL) {
        throw new InvalidPermissionOptionError(requestId, CANCEL_VOTE_SENTINEL);
      }
      const optionId = response.outcome.outcome === "selected" ? response.outcome.optionId : CANCEL_VOTE_SENTINEL;
      const voterMetadata = extractPermissionResponseMetadata(response);
      const outcome = permissionMediator.vote({
        requestId,
        sessionId,
        clientId: trustedClientId,
        optionId,
        receivedAtMs: Date.now(),
        fromLoopback: context?.fromLoopback ?? false,
        ...voterMetadata ? { metadata: voterMetadata } : {}
      });
      switch (outcome.kind) {
        case "resolved":
        case "recorded":
          return true;
        case "already_resolved":
          return false;
        case "unknown_request":
          teeServeDebugLine(
            `rejected permission vote ${JSON.stringify(requestId)} for session ${JSON.stringify(sessionId)}; mediator has no pending or resolved record.`
          );
          return false;
        case "forbidden":
          throw new PermissionForbiddenError(
            requestId,
            sessionId,
            outcome.reason
          );
        default: {
          const _exhaustive = outcome;
          throw new Error(
            `unreachable PermissionVoteOutcome: ${JSON.stringify(_exhaustive)}`
          );
        }
      }
    },
    async branchSession(sessionId, req, context) {
      if (shuttingDown) throw new Error("AcpSessionBridge is shutting down");
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      if (isClosingOrAuthorizingClose(entry)) {
        throw new SessionNotFoundError(sessionId, "The session is closing");
      }
      if (isReservedStandaloneSessionSourceType(entry.sourceType)) {
        throw new InvalidSessionMetadataError(
          "sourceType",
          "Standalone sessions cannot be branched through the generic session API"
        );
      }
      const source = parseSessionSource(req.sourceType, req.sourceId);
      if ("error" in source) {
        throw new InvalidSessionMetadataError("sourceType", source.error);
      }
      if (isReservedStandaloneSessionSourceType(source.sourceType)) {
        throw new InvalidSessionMetadataError(
          "sourceType",
          "`standalone` is reserved for daemon-owned session creation"
        );
      }
      const isSideTask = source.sourceType === "side_task";
      const restoreBranch = isSideTask || req.atRecordId === void 0;
      if (context?.clientId !== void 0) {
        resolveTrustedClientId(entry, context.clientId);
      }
      const concurrentSideTask = isSideTask && entry.promptActive;
      if (!isSideTask && (entry.pendingPromptCount > 0 || entry.promptActive)) {
        throw new BranchWhilePromptActiveError(sessionId);
      }
      const branchResult = (concurrentSideTask ? Promise.resolve() : entry.promptQueue).then(async () => {
        if (isClosingOrAuthorizingClose(entry) || byId.get(sessionId) !== entry) {
          throw new SessionNotFoundError(sessionId, "The session is closing");
        }
        assertFreshSessionsAvailable();
        let admission;
        if (restoreBranch) {
          if (byId.size + inFlightSpawns.size + inFlightRestores.size >= maxSessions) {
            throw new SessionLimitExceededError(maxSessions);
          }
          admission = reserveFreshSession({
            operation: "branch",
            workspaceCwd: boundWorkspace,
            sourceSessionId: sessionId
          });
        }
        let admissionReleased = false;
        const releaseAdmissionOnce = /* @__PURE__ */ __name(() => {
          if (admissionReleased || !admission) return;
          admissionReleased = true;
          releaseFreshSessionReservation(admission);
        }, "releaseAdmissionOnce");
        try {
          const mutation = entry.connection.extMethod(
            isSideTask ? SERVE_CONTROL_EXT_METHODS.sessionSideTask : SERVE_CONTROL_EXT_METHODS.sessionBranch,
            {
              sessionId,
              cwd: boundWorkspace,
              name: req.name,
              ...req.atRecordId !== void 0 ? { atRecordId: req.atRecordId } : {}
            }
          );
          let result;
          try {
            result = await Promise.race([
              mutation,
              getTransportClosedReject(entry)
            ]);
          } catch (err) {
            const data = err?.data;
            if (!isSideTask && data && typeof data === "object" && data.errorKind === "session_busy") {
              const msg = err?.message ?? "Branch failed";
              throw new SessionBusyError(sessionId, msg);
            }
            throw err;
          }
          if (!result || typeof result.newSessionId !== "string") {
            throw new Error(
              `branchSession: agent returned invalid response: ${JSON.stringify(result)}`
            );
          }
          markSessionCatalogChanged();
          if (opts.sessionAttachmentsRoot) {
            const branchAttachments = new SessionAttachmentStore(
              opts.sessionAttachmentsRoot,
              result.newSessionId
            );
            try {
              await branchAttachments.copyFrom(entry.attachments);
            } catch (error) {
              writeStderrLine(
                `qwen serve: failed to copy attachments for branched session ${result.newSessionId}: ${error instanceof Error ? error.message : String(error)}`
              );
            } finally {
              await branchAttachments.close();
            }
          }
          const rawBranchName = result.displayName ?? result.title;
          const branchDisplayName = typeof rawBranchName === "string" ? rawBranchName : result.newSessionId.slice(0, 8);
          if (!restoreBranch) {
            return {
              sessionId: result.newSessionId,
              displayName: branchDisplayName,
              forkedFrom: {
                sessionId,
                displayName: entry.displayName ?? sessionId.slice(0, 8)
              }
            };
          }
          const ci = await ensureChannel();
          let restored;
          try {
            const hideInheritedHistory = req.replayInheritedHistory === false;
            restored = await restoreSession(
              "load",
              {
                sessionId: result.newSessionId,
                workspaceCwd: boundWorkspace,
                clientId: context?.clientId,
                ...hideInheritedHistory ? {
                  historyReplay: "response",
                  hideInheritedHistory: true
                } : {},
                ...source
              },
              {
                skipFreshSessionAdmission: true,
                // A fork inherits the parent's dangling ask_user_question
                // tail, but forks cannot run that tool — never fire a
                // restore prompt into a brand-new branch.
                suppressRestorePrompt: true
              }
            );
            releaseAdmissionOnce();
          } catch (restoreErr) {
            writeStderrLine(
              `qwen serve: branchSession load failed for ${result.newSessionId}; closing partial live state while preserving the committed session...`
            );
            try {
              if (!ci.isDying) {
                await withTimeout(
                  Promise.race([
                    ci.connection.extMethod(
                      SERVE_CONTROL_EXT_METHODS.sessionClose,
                      {
                        sessionId: result.newSessionId,
                        cwd: boundWorkspace,
                        drainTimeoutMs: sessionCloseDrainBudgetMs(initTimeoutMs)
                      }
                    ),
                    channelUnavailableReject(
                      ci.channel,
                      "during branchSession cleanup"
                    )
                  ]),
                  initTimeoutMs,
                  "branchSession cleanup"
                );
              }
            } catch (cleanupErr) {
              writeStderrLine(
                `qwen serve: branchSession live-state close for ${result.newSessionId} failed: ${cleanupErr instanceof Error ? cleanupErr.message : cleanupErr}`
              );
            }
            throw restoreErr;
          }
          const newEntry = byId.get(result.newSessionId);
          if (newEntry && !opts.sessionAttachmentsRoot) {
            try {
              await newEntry.attachments.copyFrom(entry.attachments);
            } catch (error) {
              writeStderrLine(
                `qwen serve: failed to copy attachments for branched session ${result.newSessionId}: ${error instanceof Error ? error.message : String(error)}`
              );
            }
          }
          if (newEntry) newEntry.displayName = branchDisplayName;
          let sourcePersisted;
          if (newEntry?.sourceType) {
            try {
              const sourceResult = await withTimeout(
                newEntry.connection.extMethod(
                  SERVE_CONTROL_EXT_METHODS.sessionSource,
                  {
                    sessionId: newEntry.sessionId,
                    sourceType: newEntry.sourceType,
                    ...newEntry.sourceId !== void 0 ? { sourceId: newEntry.sourceId } : {}
                  }
                ),
                initTimeoutMs,
                "sessionSource"
              );
              sourcePersisted = sourceResult?.persisted === true;
            } catch (error) {
              sourcePersisted = false;
              writeStderrLine(
                `qwen serve: source metadata for branched session ${result.newSessionId} was not persisted: ${error instanceof Error ? error.message : String(error)}`
              );
            }
          }
          return {
            ...restored,
            displayName: branchDisplayName,
            forkedFrom: {
              sessionId,
              displayName: entry.displayName ?? sessionId.slice(0, 8)
            },
            ...sourcePersisted !== void 0 ? { sourcePersisted } : {}
          };
        } finally {
          releaseAdmissionOnce();
        }
      });
      if (!concurrentSideTask) {
        entry.promptQueue = branchResult.then(
          () => void 0,
          () => void 0
        );
      }
      return branchResult;
    },
    async createSideTaskSession(sessionId, req, context) {
      const result = await this.branchSession(
        sessionId,
        {
          name: req.name,
          sourceType: "side_task",
          sourceId: sessionId,
          replayInheritedHistory: false
        },
        context
      );
      const restoredResult = result;
      const { forkedFrom: _forkedFrom, ...sideTask } = restoredResult;
      return {
        ...sideTask,
        parentSessionId: sessionId
      };
    },
    async changeSessionCwd(sessionId, req, context) {
      if (shuttingDown) throw new Error("AcpSessionBridge is shutting down");
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      if (isReservedStandaloneSessionSourceType(entry.sourceType) && (req.managedRelocation !== "live-conversation" || req.conversationDirectoryExpectation === void 0)) {
        throw standaloneWorkingDirectoryMissingError();
      }
      const originatorClientId = resolveTrustedClientId(
        entry,
        context?.clientId
      );
      const cdPromise = entry.promptQueue.then(async () => {
        if (entry.promptActive) {
          throw new CdWhilePromptActiveError(sessionId);
        }
        assertLivePromptEntry(sessionId, entry);
        const raw = await Promise.race([
          entry.connection.extMethod(SERVE_CONTROL_EXT_METHODS.sessionCd, {
            sessionId,
            path: req.path,
            ...req.allowedRoots ? { allowedRoots: req.allowedRoots } : {},
            ...req.managedRelocation ? { managedRelocation: req.managedRelocation } : {},
            ...req.conversationDirectoryExpectation ? {
              conversationDirectoryExpectation: req.conversationDirectoryExpectation
            } : {}
          }),
          getTransportClosedReject(entry)
        ]);
        const extResult = raw;
        if (typeof extResult?.previousCwd !== "string" || typeof extResult?.newCwd !== "string" || !Array.isArray(extResult?.warnings)) {
          throw new Error(
            `changeSessionCwd: unexpected response shape from agent: ${JSON.stringify(raw)}`
          );
        }
        if (isReservedStandaloneSessionSourceType(entry.sourceType) && (req.conversationDirectoryExpectation === void 0 || extResult.newCwd !== req.conversationDirectoryExpectation.child.canonicalPath)) {
          throw standaloneWorkingDirectoryMissingError();
        }
        entry.effectiveCwd = extResult.newCwd;
        if (isReservedStandaloneSessionSourceType(entry.sourceType) && req.conversationDirectoryExpectation !== void 0) {
          entry.artifactWorkspaceReady = false;
          entry.managedConversationBinding = {
            expectation: req.conversationDirectoryExpectation,
            released: false
          };
        }
        if (extResult.previousCwd !== extResult.newCwd) {
          entry.events.publish({
            type: "session_cwd_changed",
            data: {
              sessionId,
              previousCwd: extResult.previousCwd,
              newCwd: extResult.newCwd
            },
            ...originatorClientId ? { originatorClientId } : {}
          });
        }
        return extResult;
      });
      entry.promptQueue = cdPromise.then(
        () => void 0,
        () => void 0
      );
      entry.cwdChangeQueue = cdPromise.then(
        () => void 0,
        () => void 0
      );
      const result = await withTimeout(
        cdPromise,
        Math.max(initTimeoutMs, 3e4),
        "changeSessionCwd"
      );
      writeStderrLine(
        `qwen serve: session ${sessionId} cwd changed: ${result.previousCwd} -> ${result.newCwd}` + (result.warnings.length > 0 ? ` (warnings: ${result.warnings.join("; ")})` : "")
      );
      return { sessionId, ...result };
    },
    async commitManagedConversationBinding(sessionId, expectation) {
      let entry = byId.get(sessionId);
      if (!entry) throw standaloneWorkingDirectoryMissingError();
      await entry.cwdChangeQueue;
      if (byId.get(sessionId) !== entry) {
        throw standaloneWorkingDirectoryMissingError();
      }
      const binding = entry.managedConversationBinding;
      if (!isReservedStandaloneSessionSourceType(entry.sourceType) || !binding || !sameConversationDirectoryExpectation(binding.expectation, expectation)) {
        throw standaloneWorkingDirectoryMissingError();
      }
      const response = await withTimeout(
        Promise.race([
          entry.connection.extMethod(
            SERVE_CONTROL_EXT_METHODS.sessionManagedConversationBindingCommit,
            {
              sessionId,
              conversationDirectoryExpectation: expectation
            }
          ),
          getTransportClosedReject(entry)
        ]),
        initTimeoutMs,
        "commitManagedConversationBinding"
      );
      if (response?.committed !== true) {
        throw new Error(
          "commitManagedConversationBinding returned an invalid acknowledgement"
        );
      }
      entry = byId.get(sessionId);
      if (!entry || entry.managedConversationBinding !== binding || !sameConversationDirectoryExpectation(binding.expectation, expectation)) {
        throw standaloneWorkingDirectoryMissingError();
      }
      if (entry.artifactWorkspaceCwd !== expectation.child.canonicalPath) {
        const artifacts = new SessionArtifactStore({
          sessionId,
          workspaceCwd: expectation.child.canonicalPath,
          persistence: createSessionArtifactPersistence(
            entry.connection,
            sessionId
          )
        });
        const pending = entry.pendingArtifactRestore;
        if (pending) {
          const warnings = await artifacts.restore(pending.snapshot, {
            workspaceAccess: "metadata-only"
          });
          for (const warning of warnings) {
            if (!pending.warnings.includes(warning)) {
              pending.warnings.push(warning);
              writeStderrLine(
                `[artifacts] session=${entry.sessionId} action=restore_warning warning=${JSON.stringify(
                  warning
                )}`
              );
            }
          }
        }
        entry.artifacts = artifacts;
        entry.artifactWorkspaceCwd = expectation.child.canonicalPath;
      } else {
        entry.artifacts.resetWorkspaceResolutionCache();
      }
    },
    async releaseManagedConversationBinding(sessionId, expectation) {
      let entry = byId.get(sessionId);
      if (!entry) throw standaloneWorkingDirectoryMissingError();
      await entry.cwdChangeQueue;
      if (byId.get(sessionId) !== entry) {
        throw standaloneWorkingDirectoryMissingError();
      }
      const binding = entry.managedConversationBinding;
      if (!isReservedStandaloneSessionSourceType(entry.sourceType) || !binding || !sameConversationDirectoryExpectation(binding.expectation, expectation)) {
        throw standaloneWorkingDirectoryMissingError();
      }
      const response = await withTimeout(
        Promise.race([
          entry.connection.extMethod(
            SERVE_CONTROL_EXT_METHODS.sessionManagedConversationBindingRelease,
            {
              sessionId,
              conversationDirectoryExpectation: expectation
            }
          ),
          getTransportClosedReject(entry)
        ]),
        initTimeoutMs,
        "releaseManagedConversationBinding"
      );
      if (response?.released !== true) {
        throw new Error(
          "releaseManagedConversationBinding returned an invalid acknowledgement"
        );
      }
      entry = byId.get(sessionId);
      if (!entry || entry.managedConversationBinding !== binding || !sameConversationDirectoryExpectation(binding.expectation, expectation)) {
        throw standaloneWorkingDirectoryMissingError();
      }
      binding.released = true;
      entry.artifactWorkspaceReady = true;
    },
    setSessionWorktree(sessionId, worktree) {
      const entry = byId.get(sessionId);
      if (entry) {
        entry.worktree = worktree;
        markSessionCatalogChanged();
      }
    },
    async closeSession(sessionId, context, closeOpts) {
      return closeSessionImpl(sessionId, context, closeOpts);
    },
    async ensureDefaultSessionPersisted(sessionId) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const result = await withTimeout(
        Promise.race([
          entry.connection.extMethod(SERVE_CONTROL_EXT_METHODS.sessionSource, {
            sessionId,
            sourceType: "default"
          }),
          getTransportClosedReject(entry)
        ]),
        initTimeoutMs,
        "ensureDefaultSessionPersisted"
      );
      if (result?.persisted !== true) {
        throw new Error(`Session '${sessionId}' could not be persisted`);
      }
    },
    updateSessionMetadata(sessionId, metadata, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const metadataOriginatorClientId = context?.clientId !== void 0 ? resolveTrustedClientId(entry, context.clientId) : void 0;
      if (metadata.pr !== void 0) {
        const pr = metadata.pr;
        if (pr === null || typeof pr !== "object" || typeof pr.number !== "number" || !Number.isInteger(pr.number) || pr.number <= 0 || typeof pr.url !== "string" || pr.url.length > SESSION_PR_URL_MAX_LENGTH || !/^https?:\/\//i.test(pr.url) || // The url is interpolated into the stderr audit line — control
        // characters would let a client forge log lines (the displayName
        // branch rejects them for the same reason).
        hasControlCharacter2(pr.url)) {
          throw new InvalidSessionMetadataError(
            "pr",
            `must be an object with a positive integer \`number\` and an http(s) \`url\` of at most ${SESSION_PR_URL_MAX_LENGTH} characters, without control characters`
          );
        }
      }
      if (metadata.displayName !== void 0) {
        if (typeof metadata.displayName !== "string" || metadata.displayName.length > MAX_DISPLAY_NAME_LENGTH) {
          throw new InvalidSessionMetadataError(
            "displayName",
            `must be a string of at most ${MAX_DISPLAY_NAME_LENGTH} characters`
          );
        }
        if (hasControlCharacter2(metadata.displayName)) {
          throw new InvalidSessionMetadataError(
            "displayName",
            "must not contain control characters"
          );
        }
        const nextDisplayName = metadata.displayName || void 0;
        if (entry.displayName !== nextDisplayName) {
          entry.displayName = nextDisplayName;
          markSessionCatalogChanged();
          writeStderrLine(
            `qwen serve: updated session metadata ${JSON.stringify(sessionId)} displayName=${entry.displayName === void 0 ? "cleared" : "set"}` + (context?.clientId ? ` by client ${JSON.stringify(context.clientId)}` : "")
          );
          if (nextDisplayName) {
            entry.connection.extMethod(SERVE_CONTROL_EXT_METHODS.sessionTitle, {
              sessionId,
              displayName: nextDisplayName,
              titleSource: "manual"
            }).then((res) => {
              const r = res;
              if (r && r.persisted === false) {
                writeStderrLine(
                  `qwen serve: displayName for ${sessionId} was not persisted`
                );
              }
            }).catch((err) => {
              writeStderrLine(
                `qwen serve: failed to persist displayName for ${sessionId}: ${err instanceof Error ? err.message : String(err)}`
              );
            });
          }
          try {
            entry.events.publish({
              type: "session_metadata_updated",
              data: { sessionId, displayName: entry.displayName },
              ...metadataOriginatorClientId ? { originatorClientId: metadataOriginatorClientId } : {}
            });
          } catch {
          }
        }
      }
      if (metadata.pr !== void 0) {
        const bound = metadata.pr;
        const existing = entry.prs ?? [];
        const latest = existing[existing.length - 1];
        if (latest?.number === bound.number && latest.url === bound.url) {
        } else {
          entry.prs = [
            ...existing.filter((p) => p.number !== bound.number),
            { number: bound.number, url: bound.url }
          ].slice(-SESSION_PR_LIST_LIMIT);
          markSessionCatalogChanged();
          writeStderrLine(
            `qwen serve: updated session metadata ${JSON.stringify(sessionId)} pr=${bound.number} bound (${bound.url})` + (context?.clientId ? ` by client ${JSON.stringify(context.clientId)}` : "")
          );
          try {
            entry.events.publish({
              type: "session_metadata_updated",
              // Echo the current name: SDK folds treat an absent displayName
              // as "cleared", so a pr-only event must not blank the title.
              data: {
                sessionId,
                ...entry.displayName !== void 0 ? { displayName: entry.displayName } : {},
                prs: entry.prs
              },
              ...metadataOriginatorClientId ? { originatorClientId: metadataOriginatorClientId } : {}
            });
          } catch {
          }
        }
      }
      return {
        displayName: entry.displayName,
        ...entry.prs && entry.prs.length > 0 ? { prs: entry.prs } : {}
      };
    },
    seedSessionPrs(sessionId, prs) {
      const entry = byId.get(sessionId);
      if (!entry || entry.prs && entry.prs.length > 0) return;
      entry.prs = prs.map(({ number, url }) => ({ number, url })).slice(-SESSION_PR_LIST_LIMIT);
    },
    async getSessionArtifacts(sessionId, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      if (isReservedStandaloneSessionSourceType(entry.sourceType) && entry.managedConversationBinding?.released !== true) {
        throw standaloneWorkingDirectoryMissingError();
      }
      resolveTrustedClientId(entry, context?.clientId);
      await entry.prepareArtifactWorkspace?.();
      return entry.artifacts.list();
    },
    async addSessionArtifact(sessionId, artifact, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      if (isReservedStandaloneSessionSourceType(entry.sourceType) && entry.managedConversationBinding?.released !== true) {
        throw standaloneWorkingDirectoryMissingError();
      }
      const clientId = resolveTrustedClientId(entry, context?.clientId);
      await entry.prepareArtifactWorkspace?.();
      const input = makeClientArtifactInput(artifact, clientId);
      const result = await entry.artifacts.upsertMany([input], {
        validationStrict: true,
        persistenceStrict: false
      });
      publishArtifactChanges(entry, result.changes, clientId);
      const warnings = [...result.warnings ?? []];
      return warnings.length > 0 ? { ...result, warnings } : result;
    },
    async removeSessionArtifact(sessionId, artifactId, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      if (isReservedStandaloneSessionSourceType(entry.sourceType) && entry.managedConversationBinding?.released !== true) {
        throw standaloneWorkingDirectoryMissingError();
      }
      const clientId = resolveTrustedClientId(entry, context?.clientId);
      await entry.prepareArtifactWorkspace?.();
      const result = await entry.artifacts.remove(artifactId, { clientId });
      publishArtifactChanges(entry, result.changes, clientId);
      const warnings = [...result.warnings ?? []];
      return warnings.length > 0 ? { ...result, warnings } : result;
    },
    listWorkspaceSessions(workspaceCwd) {
      if (!path2.isAbsolute(workspaceCwd)) return [];
      const key = workspaceCwd === boundWorkspace ? boundWorkspace : canonicalizeWorkspace(workspaceCwd);
      if (key !== boundWorkspace) return [];
      const out = [];
      for (const entry of byId.values()) {
        if (entry.workspaceCwd === key) {
          out.push(toSessionSummary(entry));
        }
      }
      return out;
    },
    getSessionCatalogVersion,
    markSessionCatalogChanged,
    getSessionSummary(sessionId) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      return toSessionSummary(entry);
    },
    recordHeartbeat(sessionId, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const clientId = resolveTrustedClientId(entry, context?.clientId);
      const lastSeenAt = Date.now();
      entry.sessionLastSeenAt = lastSeenAt;
      if (clientId !== void 0) {
        entry.clientLastSeenAt.set(clientId, lastSeenAt);
      }
      return {
        sessionId: entry.sessionId,
        ...clientId !== void 0 ? { clientId } : {},
        lastSeenAt
      };
    },
    getHeartbeatState(sessionId) {
      const entry = byId.get(sessionId);
      if (!entry) return void 0;
      return {
        ...entry.sessionLastSeenAt !== void 0 ? { sessionLastSeenAt: entry.sessionLastSeenAt } : {},
        clientLastSeenAt: new Map(entry.clientLastSeenAt)
      };
    },
    publishWorkspaceEvent(event) {
      const sessions = Array.from(byId.values());
      let successCount = 0;
      let failureCount = 0;
      for (const entry of sessions) {
        try {
          const published = entry.events.publish(event);
          if (published === void 0) {
            failureCount += 1;
            teeServeDebugLine(
              `publishWorkspaceEvent: publish on session ${entry.sessionId} no-op (bus closed or unserializable)`
            );
          } else {
            successCount += 1;
          }
        } catch (err) {
          failureCount += 1;
          const detail = `publishWorkspaceEvent: bus publish failed for session ${JSON.stringify(entry.sessionId)} (type=${event.type}): ${err instanceof Error ? err.message : String(err)}`;
          if (shuttingDown) {
            teeServeDebugLine(detail);
          } else {
            writeStderrLine(`qwen serve: ${detail}`);
          }
        }
      }
      if (sessions.length > 0 && successCount === 0 && !shuttingDown) {
        writeStderrLine(
          `qwen serve: publishWorkspaceEvent type=${event.type} dropped on ALL ${failureCount} session bus(es); SSE subscribers will miss this event (GET fallback still authoritative)`
        );
      }
    },
    knownClientIds() {
      const out = /* @__PURE__ */ new Set();
      for (const entry of byId.values()) {
        for (const id of entry.clientIds.keys()) out.add(id);
      }
      return out;
    },
    async queryWorkspaceStatus(method, idle) {
      return requestWorkspaceStatus(method, idle);
    },
    async invokeWorkspaceCommand(method, params, invokeOpts) {
      const startsWorkspaceChannel = method === SERVE_CONTROL_EXT_METHODS.workspaceMcpRestart;
      const info = startsWorkspaceChannel ? await ensureChannel() : liveChannelInfo();
      if (!info) throw new SessionNotFoundError(`workspace-command:${method}`);
      try {
        const timeout = invokeOpts?.timeoutMs ?? initTimeoutMs;
        const invoke = /* @__PURE__ */ __name(() => withTimeout(
          Promise.race([
            info.connection.extMethod(method, params ?? {}),
            getChannelClosedReject(info)
          ]),
          timeout,
          method
        ), "invoke");
        const response = startsWorkspaceChannel ? await withWorkspaceControl(info, invoke) : await invoke();
        if (method === SERVE_CONTROL_EXT_METHODS.workspaceMcpRestart && typeof params?.["serverName"] === "string") {
          invalidateWorkspaceMcpDetailCache(params["serverName"]);
          await requestWorkspaceStatus(
            SERVE_STATUS_EXT_METHODS.workspaceMcp,
            () => {
              throw new BridgeChannelClosedError(
                "workspace MCP restart status refresh"
              );
            },
            {},
            /* @__PURE__ */ new Set([params["serverName"]])
          );
        }
        return response;
      } finally {
        if (startsWorkspaceChannel && hasNoChannelWork(info)) {
          await startIdleTimer(info, "workspace MCP restart");
        }
      }
    },
    async isWorkspaceMemoryRememberAvailable() {
      const info = await ensureChannel();
      try {
        const response = await withWorkspaceControl(
          info,
          () => withTimeout(
            Promise.race([
              info.connection.extMethod(
                SERVE_CONTROL_EXT_METHODS.workspaceMemoryRememberAvailability,
                { cwd: boundWorkspace }
              ),
              getChannelClosedReject(info)
            ]),
            initTimeoutMs,
            SERVE_CONTROL_EXT_METHODS.workspaceMemoryRememberAvailability
          )
        );
        return response !== null && typeof response === "object" && response["available"] === true;
      } finally {
        if (hasNoChannelWork(info)) {
          await startIdleTimer(info, "workspace memory remember availability");
        }
      }
    },
    async runWorkspaceMemoryRemember(request) {
      const info = await ensureChannel();
      try {
        const response = await withWorkspaceControl(
          info,
          () => withTimeout(
            Promise.race([
              info.connection.extMethod(
                SERVE_CONTROL_EXT_METHODS.workspaceMemoryRemember,
                { ...request, cwd: boundWorkspace }
              ),
              getChannelClosedReject(info)
            ]),
            WORKSPACE_MEMORY_REMEMBER_TIMEOUT_MS,
            SERVE_CONTROL_EXT_METHODS.workspaceMemoryRemember
          )
        );
        return parseWorkspaceMemoryRememberResult(response);
      } finally {
        if (hasNoChannelWork(info)) {
          await startIdleTimer(info, "workspace memory remember");
        }
      }
    },
    async runWorkspaceMemoryForget(request) {
      const info = await ensureChannel();
      try {
        const response = await withWorkspaceControl(
          info,
          () => withTimeout(
            Promise.race([
              info.connection.extMethod(
                SERVE_CONTROL_EXT_METHODS.workspaceMemoryForget,
                { ...request, cwd: boundWorkspace }
              ),
              getChannelClosedReject(info)
            ]),
            WORKSPACE_MEMORY_REMEMBER_TIMEOUT_MS,
            SERVE_CONTROL_EXT_METHODS.workspaceMemoryForget
          )
        );
        return parseWorkspaceMemoryForgetResult(response);
      } finally {
        if (hasNoChannelWork(info)) {
          await startIdleTimer(info, "workspace memory forget");
        }
      }
    },
    async runWorkspaceMemoryDream() {
      const info = await ensureChannel();
      try {
        const response = await withWorkspaceControl(
          info,
          () => withTimeout(
            Promise.race([
              info.connection.extMethod(
                SERVE_CONTROL_EXT_METHODS.workspaceMemoryDream,
                { cwd: boundWorkspace }
              ),
              getChannelClosedReject(info)
            ]),
            WORKSPACE_MEMORY_REMEMBER_TIMEOUT_MS,
            SERVE_CONTROL_EXT_METHODS.workspaceMemoryDream
          )
        );
        return parseWorkspaceMemoryDreamResult(response);
      } finally {
        if (hasNoChannelWork(info)) {
          await startIdleTimer(info, "workspace memory dream");
        }
      }
    },
    async getWorkspaceMcpToolsStatus(serverName) {
      const result = await requestWorkspaceStatus(
        SERVE_STATUS_EXT_METHODS.workspaceMcpTools,
        () => {
          const cached = workspaceMcpToolsCache.get(serverName);
          return cached ? { ...cached, acpChannelLive: false } : {
            v: STATUS_SCHEMA_VERSION,
            workspaceCwd: boundWorkspace,
            serverName,
            initialized: false,
            acpChannelLive: false,
            tools: [],
            errors: [
              {
                kind: "mcp_tools",
                status: "not_started",
                hint: "initialize MCP discovery to populate"
              }
            ]
          };
        },
        { serverName }
      );
      if (result.acpChannelLive) {
        workspaceMcpToolsCache.set(serverName, result);
      }
      return result;
    },
    async getWorkspaceMcpResourcesStatus(serverName) {
      const result = await requestWorkspaceStatus(
        SERVE_STATUS_EXT_METHODS.workspaceMcpResources,
        () => {
          const cached = workspaceMcpResourcesCache.get(serverName);
          return cached ? { ...cached, acpChannelLive: false } : {
            v: STATUS_SCHEMA_VERSION,
            workspaceCwd: boundWorkspace,
            serverName,
            initialized: false,
            acpChannelLive: false,
            resources: [],
            errors: [
              {
                kind: "mcp_resources",
                status: "not_started",
                hint: "initialize MCP discovery to populate"
              }
            ]
          };
        },
        { serverName }
      );
      if (result.acpChannelLive) {
        workspaceMcpResourcesCache.set(serverName, result);
      }
      return result;
    },
    async getWorkspaceToolsStatus() {
      return requestWorkspaceStatus(
        SERVE_STATUS_EXT_METHODS.workspaceTools,
        () => ({
          v: STATUS_SCHEMA_VERSION,
          workspaceCwd: boundWorkspace,
          initialized: true,
          acpChannelLive: false,
          tools: [],
          errors: [
            {
              kind: "tools",
              status: "not_started",
              hint: "spawn a session to populate"
            }
          ]
        })
      );
    },
    async getSessionContextStatus(sessionId) {
      return requestSessionStatus(
        sessionId,
        SERVE_STATUS_EXT_METHODS.sessionContext
      );
    },
    async getSessionContextUsageStatus(sessionId, opts2) {
      return requestSessionStatus(
        sessionId,
        SERVE_STATUS_EXT_METHODS.sessionContextUsage,
        { detail: opts2?.detail === true }
      );
    },
    async getSessionSupportedCommandsStatus(sessionId) {
      return requestSessionStatus(
        sessionId,
        SERVE_STATUS_EXT_METHODS.sessionSupportedCommands
      );
    },
    async getSessionTasksStatus(sessionId) {
      return requestSessionStatus(
        sessionId,
        SERVE_STATUS_EXT_METHODS.sessionTasks
      );
    },
    async getSessionLspStatus(sessionId) {
      return requestSessionStatus(
        sessionId,
        SERVE_STATUS_EXT_METHODS.sessionLspStatus
      );
    },
    async getSessionTranscriptPage(req) {
      return requestSessionTranscriptPage(req);
    },
    async cancelSessionTask(sessionId, taskId, taskKind) {
      return requestSessionStatus(
        sessionId,
        SERVE_CONTROL_EXT_METHODS.sessionTaskCancel,
        { taskId, taskKind }
      );
    },
    async controlSessionGoal(sessionId, request, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const info = channelInfoForEntry(entry);
      if (!info || info.isDying) throw new SessionNotFoundError(sessionId);
      resolveTrustedClientId(entry, context?.clientId);
      return requestSessionStatus(
        sessionId,
        SERVE_CONTROL_EXT_METHODS.sessionGoalControl,
        { request }
      );
    },
    async clearSessionGoal(sessionId) {
      return requestSessionStatus(
        sessionId,
        SERVE_CONTROL_EXT_METHODS.sessionGoalClear
      );
    },
    async getSessionGoal(sessionId) {
      return requestSessionStatus(
        sessionId,
        SERVE_CONTROL_EXT_METHODS.sessionGoalGet
      );
    },
    async continueSession(sessionId, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      resolveTrustedClientId(entry, context?.clientId);
      const decision = await requestSessionStatus(sessionId, SERVE_CONTROL_EXT_METHODS.sessionContinue);
      if (!decision.accepted) {
        return decision;
      }
      const liveEntry = byId.get(sessionId);
      if (!liveEntry) throw new SessionNotFoundError(sessionId);
      const lastEventId = liveEntry.events.lastEventId;
      const eventEpoch = liveEntry.events.epoch;
      const promptId = context?.promptId;
      const promptPromise = bridgeApi.sendPrompt(
        sessionId,
        { sessionId, prompt: [] },
        void 0,
        {
          ...context?.clientId !== void 0 ? { clientId: context.clientId } : {},
          ...promptId !== void 0 ? { promptId } : {},
          continue: true
        }
      );
      promptPromise.catch((err) => {
        teeServeDebugLine(
          `continueSession: continuation turn failed for ${sessionId}: ${err instanceof Error ? err.message : String(err)}`
        );
      });
      return {
        ...decision,
        ...promptId !== void 0 ? { promptId } : {},
        lastEventId,
        eventEpoch
      };
    },
    async getSessionStatsStatus(sessionId) {
      return requestSessionStatus(
        sessionId,
        SERVE_STATUS_EXT_METHODS.sessionStats
      );
    },
    async getWorkspaceHooksStatus() {
      return requestWorkspaceStatus(
        SERVE_STATUS_EXT_METHODS.workspaceHooks,
        () => createIdleWorkspaceHooksStatus(boundWorkspace)
      );
    },
    async getSessionHooksStatus(sessionId) {
      return requestSessionStatus(
        sessionId,
        SERVE_STATUS_EXT_METHODS.sessionHooks
      );
    },
    async getWorkspaceExtensionsStatus() {
      return requestWorkspaceStatus(
        SERVE_STATUS_EXT_METHODS.workspaceExtensions,
        () => createIdleWorkspaceExtensionsStatus(boundWorkspace)
      );
    },
    async refreshExtensionsForAllSessions(data) {
      const sessions = Array.from(byId.values());
      const bootstrapRefreshConnections = /* @__PURE__ */ new Set();
      const refreshSession = /* @__PURE__ */ __name(async (entry, refreshBootstrap) => {
        let inFlight = inFlightExtensionRefreshes.get(entry.sessionId);
        let created = false;
        if (!inFlight || inFlight.connection !== entry.connection || refreshBootstrap && !inFlight.refreshBootstrap) {
          const promise = (async () => {
            await entry.connection.extMethod(
              SERVE_CONTROL_EXT_METHODS.workspaceExtensionsRefresh,
              {
                sessionId: entry.sessionId,
                ...refreshBootstrap ? {} : { refreshBootstrap: false }
              }
            );
          })();
          let rejectUnavailable;
          const unavailable = new Promise((_resolve, reject) => {
            rejectUnavailable = /* @__PURE__ */ __name(() => reject(
              new BridgeChannelClosedError("refreshExtensionsForAllSessions")
            ), "rejectUnavailable");
          });
          inFlight = {
            connection: entry.connection,
            promise,
            wait: Promise.race([
              withTimeout(
                promise,
                3e4,
                SERVE_CONTROL_EXT_METHODS.workspaceExtensionsRefresh
              ),
              unavailable
            ]),
            rejectUnavailable,
            refreshBootstrap
          };
          inFlightExtensionRefreshes.set(entry.sessionId, inFlight);
          created = true;
        }
        const clear = /* @__PURE__ */ __name(() => {
          if (inFlightExtensionRefreshes.get(entry.sessionId) === inFlight) {
            inFlightExtensionRefreshes.delete(entry.sessionId);
          }
        }, "clear");
        if (created) void inFlight.promise.then(clear, clear);
        await inFlight.wait;
      }, "refreshSession");
      const results = await Promise.all(
        sessions.map(async (entry) => {
          const info = channelInfoForEntry(entry);
          if (!info || info.isDying) {
            return {
              refreshed: 0,
              failed: 0,
              entry,
              refreshBootstrap: false
            };
          }
          const refreshBootstrap = !bootstrapRefreshConnections.has(
            entry.connection
          );
          bootstrapRefreshConnections.add(entry.connection);
          try {
            await refreshSession(entry, refreshBootstrap);
            return { refreshed: 1, failed: 0, entry, refreshBootstrap };
          } catch (err) {
            writeServeDebugLine(
              `refreshExtensions: session ${entry.sessionId} failed: ${err instanceof Error ? err.message : String(err)}`
            );
            return { refreshed: 0, failed: 1, entry, refreshBootstrap };
          }
        })
      );
      await Promise.all(
        results.filter((result) => result.failed > 0 && result.refreshBootstrap).map(async (failedBootstrap) => {
          const retry = results.find(
            (result) => result.refreshed > 0 && result.entry.connection === failedBootstrap.entry.connection
          );
          if (!retry) return;
          try {
            await refreshSession(retry.entry, true);
          } catch (err) {
            writeServeDebugLine(
              `refreshExtensions: bootstrap retry via session ${retry.entry.sessionId} failed: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        })
      );
      const refreshed = results.reduce(
        (sum, result) => sum + result.refreshed,
        0
      );
      const failed = results.reduce((sum, result) => sum + result.failed, 0);
      if (refreshed > 0 || failed > 0 || data?.status !== void 0) {
        broadcastWorkspaceEvent({
          type: "extensions_changed",
          data: { ...data, refreshed, failed }
        });
      }
      return { refreshed, failed };
    },
    broadcastExtensionsChanged(data) {
      broadcastWorkspaceEvent({
        type: "extensions_changed",
        data
      });
    },
    async setSessionModel(sessionId, req, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const originatorClientId = resolveTrustedClientId(
        entry,
        context?.clientId
      );
      const normalized = { ...req, sessionId };
      const conn = entry.connection;
      const transportClosed = getTransportClosedReject(entry);
      const work = entry.modelChangeQueue.then(async () => {
        entry.modelRoundtripInFlight = true;
        let succeeded = false;
        try {
          const result = await Promise.race([
            withTimeout(
              conn.unstable_setSessionModel(normalized),
              initTimeoutMs,
              "setSessionModel"
            ),
            transportClosed
          ]);
          publishModelSwitched(entry, req.modelId, originatorClientId);
          if (!isReservedStandaloneSessionSourceType(entry.sourceType)) {
            broadcastWorkspaceEvent({
              type: "settings_changed",
              data: {
                key: "model.name",
                value: getCanonicalModelId(result, req.modelId)
              },
              ...originatorClientId ? { originatorClientId } : {}
            });
          }
          succeeded = true;
          return result;
        } finally {
          entry.modelRoundtripInFlight = false;
          if (succeeded) {
            void reconcileAfterRoundtrip(entry, "model");
          } else {
            writeStderrLine(
              `[reconcile] session=${entry.sessionId} target=model action=skipped reason=roundtrip_failed`
            );
          }
        }
      });
      entry.modelChangeQueue = work.then(
        () => void 0,
        () => void 0
      );
      let response;
      try {
        response = await work;
      } catch (err) {
        entry.events.publish({
          type: "model_switch_failed",
          data: {
            sessionId: entry.sessionId,
            requestedModelId: req.modelId,
            error: err instanceof Error ? err.message : String(err)
          },
          ...originatorClientId ? { originatorClientId } : {}
        });
        throw err;
      }
      return response;
    },
    async setSessionConfigOption(sessionId, req) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const info = channelInfoForEntry(entry);
      if (!info || info.isDying) throw new SessionNotFoundError(sessionId);
      const normalized = { ...req, sessionId };
      const transportClosed = getTransportClosedReject(entry);
      const work = entry.modelChangeQueue.then(
        () => Promise.race([
          withTimeout(
            entry.connection.setSessionConfigOption(normalized),
            initTimeoutMs,
            "setSessionConfigOption"
          ),
          transportClosed
        ])
      );
      entry.modelChangeQueue = work.then(
        () => void 0,
        () => void 0
      );
      return await work;
    },
    async setSessionLanguage(sessionId, params, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const info = channelInfoForEntry(entry);
      if (!info || info.isDying) throw new SessionNotFoundError(sessionId);
      const originatorClientId = resolveTrustedClientId(
        entry,
        context?.clientId
      );
      const result = await Promise.race([
        withTimeout(
          entry.connection.extMethod(
            SERVE_CONTROL_EXT_METHODS.sessionLanguage,
            {
              sessionId,
              language: params.language,
              syncOutputLanguage: params.syncOutputLanguage
            }
          ),
          initTimeoutMs,
          SERVE_CONTROL_EXT_METHODS.sessionLanguage
        ),
        getTransportClosedReject(entry)
      ]);
      try {
        entry.events.publish({
          type: "language_changed",
          data: {
            sessionId: entry.sessionId,
            language: result.language,
            outputLanguage: result.outputLanguage ?? null,
            refreshed: result.refreshed ?? false
          },
          ...originatorClientId ? { originatorClientId } : {}
        });
      } catch (err) {
        writeServeDebugLine(
          `language_changed event publish failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
      return {
        language: result.language,
        outputLanguage: result.outputLanguage ?? null,
        refreshed: result.refreshed ?? false
      };
    },
    async setSessionLiveConversationActive(sessionId, active) {
      await requestSessionStatus(
        sessionId,
        SERVE_CONTROL_EXT_METHODS.sessionLiveConversation,
        { active }
      );
    },
    async appendSessionLiveTranscript(sessionId, entries, model) {
      await requestSessionStatus(
        sessionId,
        SERVE_CONTROL_EXT_METHODS.sessionLiveTranscript,
        { entries, model }
      );
    },
    async setSessionApprovalMode(sessionId, mode, opts2, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      if (opts2.persist && isReservedStandaloneSessionSourceType(entry.sourceType)) {
        throw new InvalidSessionMetadataError(
          "persist",
          "Standalone approval mode changes are session-scoped"
        );
      }
      const info = channelInfoForEntry(entry);
      if (!info || info.isDying) throw new SessionNotFoundError(sessionId);
      const originatorClientId = resolveTrustedClientId(
        entry,
        context?.clientId
      );
      return await applyApprovalMode(
        entry,
        mode,
        opts2.persist,
        originatorClientId
      );
    },
    async generateSessionRecap(sessionId, _context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const info = channelInfoForEntry(entry);
      if (!info || info.isDying) throw new SessionNotFoundError(sessionId);
      opts.onDiagnosticLine?.(
        `qwen serve: bridge generateSessionRecap dispatching ext-method for session=${sessionId}`,
        "info"
      );
      const response = await Promise.race([
        withTimeout(
          entry.connection.extMethod(SERVE_CONTROL_EXT_METHODS.sessionRecap, {
            sessionId
          }),
          SESSION_RECAP_TIMEOUT_MS,
          SERVE_CONTROL_EXT_METHODS.sessionRecap
        ),
        getTransportClosedReject(entry)
      ]);
      opts.onDiagnosticLine?.(
        `qwen serve: bridge generateSessionRecap completed for session=${sessionId} recap=${response.recap ? `len=${response.recap.length}` : "null"}`,
        "info"
      );
      return {
        sessionId: entry.sessionId,
        recap: response.recap ?? null
      };
    },
    generateSessionContent(sessionId, prompt, signal, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const info = channelInfoForEntry(entry);
      if (!info || info.isDying) throw new SessionNotFoundError(sessionId);
      resolveTrustedClientId(entry, context?.clientId);
      const requestId = randomUUID();
      const queue = new GenerationStreamQueue(
        GENERATION_STREAM_QUEUE_CAPACITY
      );
      const request = {
        sessionId,
        connection: entry.connection,
        queue,
        settled: false
      };
      generationRequests.set(requestId, request);
      const cancel = /* @__PURE__ */ __name(() => {
        if (request.settled) return;
        request.settled = true;
        generationRequests.delete(requestId);
        queue.close();
        void entry.connection.extMethod(SERVE_CONTROL_EXT_METHODS.sessionGenerationCancel, {
          sessionId,
          requestId
        }).catch(() => void 0);
      }, "cancel");
      signal.addEventListener("abort", cancel, { once: true });
      if (signal.aborted) {
        cancel();
        return queue;
      }
      void Promise.race([
        withTimeout(
          entry.connection.extMethod(
            SERVE_CONTROL_EXT_METHODS.sessionGenerationStart,
            { sessionId, requestId, prompt }
          ),
          SESSION_GENERATION_TIMEOUT_MS,
          SERVE_CONTROL_EXT_METHODS.sessionGenerationStart
        ),
        getTransportClosedReject(entry)
      ]).then((raw) => {
        if (request.settled) return;
        const response = raw;
        const model = response["model"];
        const modelSource = response["modelSource"];
        if (typeof model !== "string" || modelSource !== "fast" && modelSource !== "main") {
          throw new Error("Malformed generation completion");
        }
        const accepted = queue.push({
          type: "done",
          requestId,
          model,
          modelSource,
          ...typeof response["inputTokens"] === "number" ? { inputTokens: response["inputTokens"] } : {},
          ...typeof response["outputTokens"] === "number" ? { outputTokens: response["outputTokens"] } : {}
        });
        if (accepted) queue.close();
        else queue.fail(new Error("Generation stream consumer too slow"));
      }).catch((error) => {
        if (!request.settled) queue.fail(error);
      }).finally(() => {
        request.settled = true;
        signal.removeEventListener("abort", cancel);
        generationRequests.delete(requestId);
      });
      return queue;
    },
    getPendingPrompts(sessionId, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      resolveTrustedClientId(entry, context?.clientId);
      return entry.pendingPromptList.filter((p) => !p.removed && !p.terminalPublished).map((p) => ({
        promptId: p.promptId,
        text: p.text,
        ...p.content ? { content: p.content } : {},
        queuedAt: p.queuedAt,
        state: p.state,
        ...p.originatorClientId !== void 0 ? { originatorClientId: p.originatorClientId } : {}
      }));
    },
    async getSessionTurnStatus(sessionId, context, promptId) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      resolveTrustedClientId(entry, context?.clientId);
      const liveBeforeRead = findLiveTurnStatus(entry, promptId);
      if (liveBeforeRead) return liveBeforeRead;
      if (promptId !== void 0 && entry.enrichedTerminalPromptIds.has(promptId)) {
        const enrichedTerminal = entry.terminalTurnStatuses.get(promptId);
        if (enrichedTerminal) return enrichedTerminal;
      }
      const rewindGenerationBeforeRead = entry.rewindGeneration;
      let result;
      try {
        result = await requestSessionStatus(
          sessionId,
          SERVE_CONTROL_EXT_METHODS.sessionTurnStatus,
          { ...promptId !== void 0 ? { promptId } : {} },
          // Transcript scans of large histories exceed the 10s init default;
          // give the read the same budget as other transcript reads.
          SESSION_TRANSCRIPT_TIMEOUT_MS
        );
      } catch (error) {
        const liveAfterFailure = findLiveTurnStatus(entry, promptId);
        if (liveAfterFailure) return liveAfterFailure;
        const terminalAfterFailure = promptId !== void 0 ? entry.terminalTurnStatuses.get(promptId) : latestTerminalTurnStatus(entry);
        if (terminalAfterFailure) return terminalAfterFailure;
        throw error;
      }
      const liveAfterRead = findLiveTurnStatus(entry, promptId);
      if (liveAfterRead) return liveAfterRead;
      const terminal = promptId !== void 0 ? entry.terminalTurnStatuses.get(promptId) : latestTerminalTurnStatus(entry);
      const persisted = result.turnResult && entry.rewindGeneration === rewindGenerationBeforeRead ? settledTurnStatus(sessionId, result.turnResult) : void 0;
      if (promptId !== void 0) {
        if (terminal && persisted) {
          const merged = mergeTerminalWithPersisted(terminal, persisted);
          rememberEnrichedTerminalTurnStatus(entry, promptId, merged);
          return merged;
        }
        if (terminal) return terminal;
        if (persisted) {
          rememberEnrichedTerminalTurnStatus(entry, promptId, persisted);
          return persisted;
        }
      } else {
        if (terminal && persisted && terminal.promptId === persisted.promptId) {
          return mergeTerminalWithPersisted(terminal, persisted);
        }
        if (terminal && persisted) {
          return (terminal.endedAt ?? 0) >= (persisted.endedAt ?? 0) ? terminal : persisted;
        }
        if (terminal) return terminal;
        if (persisted) return persisted;
      }
      if (promptId !== void 0) {
        return void 0;
      }
      return { sessionId, state: "idle" };
    },
    async storeSessionAttachment(sessionId, data, mimeType, context, name) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      resolveTrustedClientId(entry, context?.clientId);
      return await entry.attachments.putAttachment(data, mimeType, name);
    },
    async readSessionAttachment(sessionId, attachmentId, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      resolveTrustedClientId(entry, context?.clientId);
      return await entry.attachments.read(attachmentId);
    },
    async removeSessionAttachment(sessionId, attachmentId, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      resolveTrustedClientId(entry, context?.clientId);
      return await entry.attachments.remove(attachmentId);
    },
    async deleteSessionAttachments(sessionId, options) {
      const store = byId.get(sessionId)?.attachments ?? new SessionAttachmentStore(opts.sessionAttachmentsRoot, sessionId);
      await store.delete(options);
    },
    removePendingPrompt(sessionId, promptId, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      resolveTrustedClientId(entry, context?.clientId);
      const idx = entry.pendingPromptList.findIndex(
        (p) => p.promptId === promptId
      );
      if (idx === -1) return { removed: false };
      const target = entry.pendingPromptList[idx];
      if (target.removed) return { removed: false };
      writeStderrLine(
        `[pending-prompt] session=${sessionId} removing promptId=${promptId} state=${target.state}`
      );
      target.abortController.abort(
        new DOMException("Prompt removed by user", "AbortError")
      );
      if (target.state === "queued") {
        entry.pendingPromptList.splice(idx, 1);
      } else {
        target.removed = true;
      }
      try {
        entry.events.publish({
          type: "pending_prompt_completed",
          promptId,
          data: { sessionId, promptId, state: "removed" },
          ...target.originatorClientId ? { originatorClientId: target.originatorClientId } : {}
        });
      } catch {
      }
      if (target.state === "queued") {
        publishPromptTerminal(entry, target, { kind: "cancelled" });
      }
      return { removed: true };
    },
    enqueueMidTurnMessage(sessionId, message, context, requestedMessageId, options) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const originatorClientId = resolveTrustedClientId(
        entry,
        context?.clientId
      );
      const trimmed = message.trim();
      const mediaBlocks = (options?.content ?? []).filter(
        (block) => block.type === "image" || block.type === "resource"
      );
      if (trimmed.length === 0 && mediaBlocks.length === 0) {
        writeStderrLine(
          `[mid-turn] session=${entry.sessionId} rejected: empty`
        );
        return { accepted: false };
      }
      if (requestedMessageId !== void 0) {
        const existing = entry.midTurnMessageQueue.find(
          (queued) => queued.messageId === requestedMessageId
        );
        if (existing) {
          const sameMedia = JSON.stringify(existing.content ?? []) === JSON.stringify(mediaBlocks);
          if (existing.text === trimmed && sameMedia) {
            return { accepted: true, messageId: requestedMessageId };
          }
          writeStderrLine(
            `[mid-turn] session=${JSON.stringify(entry.sessionId)} rejected id ${JSON.stringify(requestedMessageId)}: text or content mismatch`
          );
          return { accepted: false };
        }
        const promoted = entry.pendingPromptList.find(
          (pending) => pending.promptId === requestedMessageId
        );
        if (promoted) {
          const promotedMedia = (promoted.content ?? []).filter(
            (block) => block.type === "image" || block.type === "resource"
          );
          const sameMedia = JSON.stringify(promotedMedia) === JSON.stringify(mediaBlocks);
          const promotedText = promoted.text === "[image]" && trimmed.length === 0 ? "" : promoted.text;
          if (promotedText === trimmed && sameMedia) {
            return { accepted: true, messageId: requestedMessageId };
          }
          writeStderrLine(
            `[mid-turn] session=${JSON.stringify(entry.sessionId)} rejected promoted id ${JSON.stringify(requestedMessageId)}: text or content mismatch`
          );
          return { accepted: false };
        }
        if (entry.settledMidTurnMessageIds.includes(requestedMessageId)) {
          return { accepted: true, messageId: requestedMessageId };
        }
        if (entry.promotedMidTurnMessageIds.includes(requestedMessageId)) {
          return { accepted: true, messageId: requestedMessageId };
        }
      }
      if (isClosingOrAuthorizingClose(entry)) {
        writeStderrLine(
          `[mid-turn] session=${JSON.stringify(entry.sessionId)} rejected: session closing`
        );
        return { accepted: false };
      }
      entry.attachments.assertReferences(mediaBlocks);
      const inlineBytes = inlineAttachmentBlockBytes(mediaBlocks);
      if (inlineBytes > 0) {
        const queuedInlineBytes = entry.midTurnMessageQueue.reduce(
          (total, queued) => total + inlineAttachmentBlockBytes(queued.content ?? []),
          0
        );
        if (queuedInlineBytes + inlineBytes > MAX_QUEUED_INLINE_ATTACHMENT_BYTES) {
          writeStderrLine(
            `[mid-turn] session=${entry.sessionId} rejected: queued inline attachments exceed the ${MAX_QUEUED_INLINE_ATTACHMENT_BYTES}-byte session budget`
          );
          return { accepted: false };
        }
      }
      const messageId = requestedMessageId ?? randomUUID();
      if (entry.pendingPromptCount === 0 && entry.goalTurnActive !== true) {
        if (options?.queueOnly || options?.rejectIfIdle) {
          writeStderrLine(
            `[mid-turn] session=${JSON.stringify(entry.sessionId)} rejected id ${JSON.stringify(messageId)}: session idle`
          );
          return { accepted: false };
        }
        promoteMidTurnMessage(
          entry,
          messageId,
          trimmed,
          originatorClientId,
          mediaBlocks.length > 0 ? mediaBlocks : void 0
        );
        return { accepted: true, messageId };
      }
      if (entry.midTurnMessageQueue.length >= MAX_MID_TURN_QUEUE_DEPTH) {
        writeStderrLine(
          `[mid-turn] session=${entry.sessionId} rejected: queue full (depth ${entry.midTurnMessageQueue.length} >= ${MAX_MID_TURN_QUEUE_DEPTH})`
        );
        return { accepted: false };
      }
      const queuedMessage = {
        messageId,
        text: trimmed,
        ...mediaBlocks.length > 0 ? { content: mediaBlocks } : {},
        originatorClientId,
        ...options?.queueOnly ? {
          queueOnly: true,
          onSettledWithoutDrain: options.onSettledWithoutDrain
        } : {}
      };
      entry.midTurnMessageQueue.push(queuedMessage);
      if (originatorClientId) {
        try {
          entry.events.publish({
            type: "pending_prompt_added",
            promptId: messageId,
            data: {
              sessionId,
              promptId: messageId,
              text: trimmed,
              queuedAt: Date.now()
            },
            originatorClientId
          });
        } catch {
        }
      }
      return { accepted: true, messageId };
    },
    removeMidTurnMessage(sessionId, messageId, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      resolveTrustedClientId(entry, context?.clientId);
      const index = entry.midTurnMessageQueue.findIndex(
        (message) => message.messageId === messageId
      );
      if (index === -1) {
        const isPromoted = entry.pendingPromptList.some(
          (pending) => pending.promptId === messageId && pending.promotedMidTurn === true
        );
        if (!isPromoted) {
          writeStderrLine(
            `[mid-turn] session=${JSON.stringify(entry.sessionId)} remove missed messageId=${JSON.stringify(messageId)} (already drained or completed)`
          );
          return { removed: false };
        }
        const promoted = bridgeApi.removePendingPrompt(
          sessionId,
          messageId,
          context
        );
        if (promoted.removed) {
          rememberMidTurnId(entry.settledMidTurnMessageIds, messageId);
          return promoted;
        }
        writeStderrLine(
          `[mid-turn] session=${JSON.stringify(entry.sessionId)} remove missed messageId=${JSON.stringify(messageId)} (already drained or completed)`
        );
        return { removed: false };
      }
      const [removed] = entry.midTurnMessageQueue.splice(index, 1);
      rememberMidTurnId(entry.settledMidTurnMessageIds, messageId);
      if (removed) {
        try {
          entry.events.publish({
            type: "pending_prompt_completed",
            promptId: messageId,
            data: { sessionId, promptId: messageId, state: "removed" },
            ...removed.originatorClientId ? { originatorClientId: removed.originatorClientId } : {}
          });
        } catch {
        }
      }
      return { removed: true };
    },
    async enqueueBackgroundNotification(sessionId, notification) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const info = channelInfoForEntry(entry);
      if (!info || info.isDying) throw new SessionNotFoundError(sessionId);
      entry.pendingAgentNotificationCount++;
      try {
        const response = await Promise.race([
          withTimeout(
            entry.connection.extMethod(
              SERVE_CONTROL_EXT_METHODS.sessionBackgroundNotification,
              { sessionId, ...notification }
            ),
            initTimeoutMs,
            SERVE_CONTROL_EXT_METHODS.sessionBackgroundNotification
          ),
          getTransportClosedReject(entry)
        ]);
        return { sessionId, accepted: response["accepted"] === true };
      } finally {
        entry.pendingAgentNotificationCount = Math.max(
          0,
          entry.pendingAgentNotificationCount - 1
        );
        void maybeCloseIdleSession(entry, "agent_notification_settled");
      }
    },
    getMidTurnMessages(sessionId, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      resolveTrustedClientId(entry, context?.clientId);
      return {
        // Anonymous enqueues (live steering) stay off the shared surface:
        // their delegation text is not a user message other attached clients
        // should restore into their queue views.
        messages: entry.midTurnMessageQueue.filter((message) => message.originatorClientId !== void 0).map((message) => ({
          messageId: message.messageId,
          text: message.text,
          // Carry the media blocks so a refreshed client can rebuild the
          // queued row with its attachments (the snapshot is the only
          // recovery source once the client's in-memory copy is gone).
          ...message.content ? { content: message.content } : {}
        })),
        settledMessageIds: [...entry.settledMidTurnMessageIds],
        promotedMessageIds: [...entry.promotedMidTurnMessageIds]
      };
    },
    async generateSessionBtw(sessionId, question, signal, _context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const info = channelInfoForEntry(entry);
      if (!info || info.isDying) throw new SessionNotFoundError(sessionId);
      if (signal?.aborted) return { sessionId, answer: null };
      const races = [
        withTimeout(
          entry.connection.extMethod(SERVE_CONTROL_EXT_METHODS.sessionBtw, {
            sessionId,
            question
          }),
          SESSION_BTW_TIMEOUT_MS,
          SERVE_CONTROL_EXT_METHODS.sessionBtw
        ),
        getTransportClosedReject(entry)
      ];
      let cleanupAbort;
      if (signal) {
        races.push(
          new Promise((_, reject) => {
            const handler = /* @__PURE__ */ __name(() => reject(new DOMException("Aborted", "AbortError")), "handler");
            signal.addEventListener("abort", handler, { once: true });
            cleanupAbort = /* @__PURE__ */ __name(() => signal.removeEventListener("abort", handler), "cleanupAbort");
          })
        );
      }
      let response;
      try {
        response = await Promise.race(races);
      } finally {
        cleanupAbort?.();
      }
      return {
        sessionId: entry.sessionId,
        answer: response.answer ?? null
      };
    },
    async launchSessionForkAgent(sessionId, directive, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const info = channelInfoForEntry(entry);
      if (!info || info.isDying) throw new SessionNotFoundError(sessionId);
      resolveTrustedClientId(entry, context?.clientId);
      const trimmed = directive.trim();
      if (!trimmed) {
        throw new Error("Fork directive is required");
      }
      if (entry.pendingPromptCount > 0 || entry.promptActive) {
        throw new SessionBusyError(
          sessionId,
          "Cannot fork while a response or tool call is in progress"
        );
      }
      return entry.promptQueue.then(async () => {
        if (entry.pendingPromptCount > 0 || entry.promptActive) {
          throw new SessionBusyError(
            sessionId,
            "Cannot fork while a response or tool call is in progress"
          );
        }
        opts.onDiagnosticLine?.(
          `qwen serve: launchSessionForkAgent requested for session=${sessionId}`,
          "info"
        );
        let response;
        try {
          response = await Promise.race([
            withTimeout(
              entry.connection.extMethod(
                SERVE_CONTROL_EXT_METHODS.sessionForkAgent,
                {
                  sessionId,
                  directive: trimmed
                }
              ),
              initTimeoutMs,
              SERVE_CONTROL_EXT_METHODS.sessionForkAgent
            ),
            getTransportClosedReject(entry)
          ]);
        } catch (error) {
          opts.onDiagnosticLine?.(
            `qwen serve: launchSessionForkAgent failed for session=${sessionId}: ${error instanceof Error ? error.message : String(error)}`,
            "warn"
          );
          throw error;
        }
        const result = {
          sessionId: entry.sessionId,
          description: response.description ?? trimmed.slice(0, 60),
          launched: response.launched === true
        };
        opts.onDiagnosticLine?.(
          `qwen serve: launchSessionForkAgent completed for session=${sessionId} launched=${result.launched}`,
          "info"
        );
        return result;
      });
    },
    async executeShellCommand(sessionId, command, signal, context) {
      opts.onDiagnosticLine?.(
        `qwen serve: bridge executeShellCommand for session=${sessionId}`,
        "info"
      );
      if (opts.sessionShellCommandEnabled !== true) {
        throw new SessionShellDisabledError();
      }
      if (context?.clientId === void 0) {
        throw new SessionShellClientRequiredError();
      }
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      const originatorClientId = resolveTrustedClientId(
        entry,
        context.clientId
      );
      if (signal?.aborted) {
        return { exitCode: null, output: "", aborted: true };
      }
      let abortResolve;
      const onAbort = /* @__PURE__ */ __name(() => abortResolve?.(), "onAbort");
      try {
        await Promise.race([
          entry.cwdChangeQueue,
          new Promise((resolve) => {
            abortResolve = resolve;
            if (signal?.aborted) return resolve();
            signal?.addEventListener("abort", onAbort, { once: true });
          })
        ]);
      } finally {
        signal?.removeEventListener("abort", onAbort);
      }
      if (signal?.aborted) {
        return { exitCode: null, output: "", aborted: true };
      }
      const cwd = entry.effectiveCwd;
      entry.events.publish({
        type: "user_shell_command",
        data: { sessionId, command, cwd },
        ...originatorClientId ? { originatorClientId } : {}
      });
      const outputChunks = [];
      const abort = new AbortController();
      const onSignalAbort = /* @__PURE__ */ __name(() => abort.abort(), "onSignalAbort");
      signal?.addEventListener("abort", onSignalAbort, { once: true });
      try {
        const handle = await ShellExecutionService.execute(
          command,
          cwd,
          (event) => {
            if (event.type === "data") {
              const chunk = typeof event.chunk === "string" ? event.chunk : event.chunk.map(
                (line) => line.map((t) => t.text).join("")
              ).join("\n");
              outputChunks.push(chunk);
              entry.events.publish({
                type: "session_update",
                data: {
                  sessionId,
                  update: {
                    sessionUpdate: "shell_output",
                    output: chunk,
                    _meta: {
                      serverTimestamp: Date.now(),
                      source: "user-shell"
                    }
                  }
                },
                ...originatorClientId ? { originatorClientId } : {}
              });
            }
          },
          abort.signal,
          false,
          { terminalWidth: 120, terminalHeight: 40 },
          { streamStdout: true }
        );
        const timeoutId = setTimeout(
          () => abort.abort(),
          SHELL_COMMAND_TIMEOUT_MS
        );
        timeoutId.unref();
        const result = await handle.result;
        clearTimeout(timeoutId);
        const exitCode = result.exitCode;
        const aborted = result.aborted;
        const output = outputChunks.join("") || result.output;
        entry.events.publish({
          type: "user_shell_result",
          data: {
            sessionId,
            exitCode,
            signal: result.signal,
            aborted,
            _meta: { serverTimestamp: Date.now() }
          },
          ...originatorClientId ? { originatorClientId } : {}
        });
        const historyOutput = output.length > MAX_SHELL_OUTPUT_FOR_HISTORY ? output.substring(0, MAX_SHELL_OUTPUT_FOR_HISTORY) + "\n... (truncated)" : output;
        try {
          await withTimeout(
            Promise.race([
              entry.connection.extMethod(
                SERVE_CONTROL_EXT_METHODS.sessionShellHistory,
                { sessionId, command, output: historyOutput, exitCode }
              ),
              getTransportClosedReject(entry)
            ]),
            initTimeoutMs,
            "sessionShellHistory"
          );
        } catch (err) {
          writeServeDebugLine(
            `shell history injection failed for session ${sessionId}: ${err instanceof Error ? err.message : String(err)}`
          );
        }
        return { exitCode, output, aborted };
      } catch (err) {
        entry.events.publish({
          type: "user_shell_result",
          data: {
            sessionId,
            exitCode: null,
            signal: null,
            aborted: false,
            error: err instanceof Error ? err.message : String(err),
            _meta: { serverTimestamp: Date.now() }
          },
          ...originatorClientId ? { originatorClientId } : {}
        });
        throw err;
      } finally {
        signal?.removeEventListener("abort", onSignalAbort);
      }
    },
    async getRewindSnapshots(sessionId) {
      return requestSessionStatus(
        sessionId,
        SERVE_STATUS_EXT_METHODS.sessionRewindSnapshots
      );
    },
    async rewindSession(sessionId, req, context) {
      const entry = byId.get(sessionId);
      if (!entry) throw new SessionNotFoundError(sessionId);
      if (isClosingOrAuthorizingClose(entry)) {
        throw new SessionNotFoundError(
          sessionId,
          "The session is closing; retry after close completes",
          "session_closing"
        );
      }
      const info = channelInfoForEntry(entry);
      if (!info || info.isDying) throw new SessionNotFoundError(sessionId);
      const originatorClientId = resolveTrustedClientId(
        entry,
        context?.clientId
      );
      if (entry.pendingPromptCount > 0 || entry.promptActive) {
        throw new SessionBusyError(
          sessionId,
          "Cannot rewind while a prompt is running"
        );
      }
      const rewindResult = entry.promptQueue.then(async () => {
        if (entry.closing) {
          throw new SessionNotFoundError(sessionId, "The session is closing");
        }
        let response;
        try {
          response = await Promise.race([
            entry.connection.extMethod(
              SERVE_CONTROL_EXT_METHODS.sessionRewind,
              {
                sessionId,
                promptId: req.promptId,
                rewindFiles: req.rewindFiles !== false
              }
            ),
            getTransportClosedReject(entry)
          ]);
        } catch (err) {
          const data = err?.data;
          if (data && typeof data === "object" && "errorKind" in data) {
            const kind = data.errorKind;
            const msg = err?.message ?? "Rewind failed";
            if (kind === "session_busy") {
              throw new SessionBusyError(sessionId, msg);
            }
            if (kind === "invalid_rewind_target") {
              throw new InvalidRewindTargetError(sessionId, msg);
            }
          }
          throw err;
        }
        entry.terminalTurnStatuses.clear();
        entry.enrichedTerminalPromptIds.clear();
        entry.rewindGeneration += 1;
        const targetTurnIndex = response["targetTurnIndex"] ?? 0;
        const filesChanged = response["filesChanged"] ?? [];
        const filesFailed = response["filesFailed"] ?? [];
        const artifactSnapshot = restoredArtifactSnapshotFromState(
          response
        );
        const artifactSnapshotUnavailable = artifactSnapshotUnavailableReason(
          response
        );
        const beforeArtifacts = (await entry.artifacts.list()).artifacts;
        const shouldRestoreArtifactSnapshot = artifactSnapshot !== void 0 && artifactSnapshotUnavailable === void 0;
        const artifactRestoreWarnings = artifactSnapshotUnavailable !== void 0 ? [
          `artifact snapshot rebuild unavailable during rewind: ${artifactSnapshotUnavailable}`
        ] : shouldRestoreArtifactSnapshot ? await entry.artifacts.restore(artifactSnapshot, {
          preserveLiveEphemeral: true
        }) : [];
        const artifactRestoreFailed = artifactRestoreWarnings.some(
          isArtifactRestoreFailureWarning
        );
        const shouldRecordArtifactSnapshot = shouldRestoreArtifactSnapshot && !artifactRestoreFailed;
        const artifactSnapshotWarnings = shouldRecordArtifactSnapshot ? await entry.artifacts.recordSnapshot() : [];
        const artifactWarnings = [
          ...artifactRestoreWarnings,
          ...artifactSnapshotWarnings
        ];
        for (const warning of artifactRestoreWarnings) {
          writeStderrLine(
            `[artifacts] session=${entry.sessionId} action=rewind_restore_warning warning=${JSON.stringify(
              warning
            )}`
          );
        }
        for (const warning of artifactSnapshotWarnings) {
          writeStderrLine(
            `[artifacts] session=${entry.sessionId} action=rewind_snapshot_warning warning=${JSON.stringify(
              warning
            )}`
          );
        }
        const afterArtifacts = (await entry.artifacts.list()).artifacts;
        publishArtifactChanges(
          entry,
          artifactReseedChanges(beforeArtifacts, afterArtifacts),
          originatorClientId
        );
        try {
          entry.events.publish({
            type: "session_rewound",
            data: {
              sessionId,
              promptId: req.promptId,
              targetTurnIndex,
              filesChanged,
              filesFailed,
              ...artifactWarnings.length > 0 ? { warnings: artifactWarnings } : {}
            },
            ...originatorClientId ? { originatorClientId } : {}
          });
        } catch {
        }
        return {
          rewound: filesFailed.length === 0,
          targetTurnIndex,
          filesChanged,
          filesFailed,
          ...artifactWarnings.length > 0 ? { warnings: artifactWarnings } : {}
        };
      });
      entry.promptQueue = rewindResult.then(
        () => void 0,
        () => void 0
      );
      return rewindResult;
    },
    async manageMcpServer(serverName, action, originatorClientId) {
      const info = await ensureChannel();
      try {
        return await withWorkspaceControl(info, async () => {
          const timeout = action === "authenticate" ? MCP_OAUTH_TIMEOUT_MS : MCP_RESTART_TIMEOUT_MS;
          const response = await Promise.race([
            withTimeout(
              info.connection.extMethod(
                SERVE_CONTROL_EXT_METHODS.workspaceMcpManage,
                { serverName, action, originatorClientId }
              ),
              timeout,
              SERVE_CONTROL_EXT_METHODS.workspaceMcpManage
            ),
            getChannelClosedReject(info)
          ]);
          if (action === "authenticate" && response.pending) {
            info.workspaceMcpAuthenticationServerNames.add(serverName);
            const previousTimer = info.workspaceMcpAuthenticationTimers.get(serverName);
            if (previousTimer) clearTimeout(previousTimer);
            const timer = setTimeout(() => {
              info.workspaceMcpAuthenticationServerNames.delete(serverName);
              info.workspaceMcpAuthenticationTimers.delete(serverName);
              if (hasNoChannelWork(info)) {
                void startIdleTimer(
                  info,
                  "workspace MCP authentication timeout"
                );
              }
            }, MCP_OAUTH_TIMEOUT_MS);
            timer.unref();
            info.workspaceMcpAuthenticationTimers.set(serverName, timer);
          }
          invalidateWorkspaceMcpDetailCache(serverName);
          await requestWorkspaceStatus(
            SERVE_STATUS_EXT_METHODS.workspaceMcp,
            () => {
              throw new BridgeChannelClosedError(
                "workspace MCP management status refresh"
              );
            },
            {},
            /* @__PURE__ */ new Set([serverName])
          );
          broadcastWorkspaceEvent({
            type: "mcp_server_changed",
            data: {
              serverName: response.serverName,
              action: response.action,
              originatorClientId
            },
            ...originatorClientId ? { originatorClientId } : {}
          });
          return response;
        });
      } finally {
        if (hasNoChannelWork(info)) {
          await startIdleTimer(info, "workspace MCP management");
        }
      }
    },
    async initializeWorkspaceMcp() {
      const info = await ensureChannel();
      info.workspaceMcpDiscoveryRequested = true;
      try {
        const result = await Promise.race([
          withTimeout(
            info.connection.extMethod(
              SERVE_CONTROL_EXT_METHODS.workspaceMcpInitialize,
              { cwd: boundWorkspace }
            ),
            initTimeoutMs,
            SERVE_CONTROL_EXT_METHODS.workspaceMcpInitialize
          ),
          getChannelClosedReject(info)
        ]);
        if (result.accepted) {
          beginWorkspaceMcpDiscovery(info);
        }
        return result;
      } finally {
        if (hasNoChannelWork(info)) {
          await startIdleTimer(info, "workspace MCP initialization");
        }
      }
    },
    async reloadWorkspaceMcp(options) {
      const info = await ensureChannel();
      info.workspaceMcpDiscoveryRequested = true;
      try {
        const result = await Promise.race([
          withTimeout(
            info.connection.extMethod(
              SERVE_CONTROL_EXT_METHODS.workspaceMcpReload,
              { cwd: boundWorkspace, ...options }
            ),
            initTimeoutMs,
            SERVE_CONTROL_EXT_METHODS.workspaceMcpReload
          ),
          getChannelClosedReject(info)
        ]);
        if (result.accepted) {
          beginWorkspaceMcpDiscovery(info);
        }
        return result;
      } finally {
        if (hasNoChannelWork(info)) {
          await startIdleTimer(info, "workspace MCP reload");
        }
      }
    },
    async generateWorkspaceAgent(description, _originatorClientId) {
      const info = liveChannelInfo();
      if (!info) {
        throw new SessionNotFoundError("agents:generate");
      }
      return await Promise.race([
        withTimeout(
          info.connection.extMethod(
            SERVE_CONTROL_EXT_METHODS.workspaceAgentGenerate,
            { description }
          ),
          MCP_RESTART_TIMEOUT_MS,
          SERVE_CONTROL_EXT_METHODS.workspaceAgentGenerate
        ),
        getChannelClosedReject(info)
      ]);
    },
    generateWorkspaceContent(prompt, signal, _originatorClientId) {
      const requestId = randomUUID();
      const queue = new GenerationStreamQueue(
        GENERATION_STREAM_QUEUE_CAPACITY
      );
      const request = {
        connection: void 0,
        queue,
        settled: false
      };
      const cancel = /* @__PURE__ */ __name(() => {
        if (request.settled) return;
        request.settled = true;
        workspaceGenerationRequests.delete(requestId);
        queue.close();
        void request.connection?.extMethod(SERVE_CONTROL_EXT_METHODS.workspaceGenerationCancel, {
          requestId
        }).catch(() => void 0);
      }, "cancel");
      signal.addEventListener("abort", cancel, { once: true });
      if (signal.aborted) {
        cancel();
        return queue;
      }
      void (async () => {
        let info;
        try {
          const channelInfo2 = await ensureChannel();
          info = channelInfo2;
          request.connection = channelInfo2.connection;
          await withWorkspaceControl(channelInfo2, async () => {
            if (request.settled) return;
            workspaceGenerationRequests.set(requestId, request);
            const raw = await Promise.race([
              withTimeout(
                channelInfo2.connection.extMethod(
                  SERVE_CONTROL_EXT_METHODS.workspaceGenerationStart,
                  {
                    requestId,
                    prompt,
                    purpose: "text"
                  }
                ),
                SESSION_GENERATION_TIMEOUT_MS,
                SERVE_CONTROL_EXT_METHODS.workspaceGenerationStart
              ),
              getChannelClosedReject(channelInfo2)
            ]);
            if (request.settled) return;
            const response = raw;
            const model = response["model"];
            const modelSource = response["modelSource"];
            if (typeof model !== "string" || modelSource !== "fast" && modelSource !== "main") {
              throw new Error("Malformed workspace generation completion");
            }
            const accepted = queue.push({
              type: "done",
              requestId,
              model,
              modelSource,
              ...typeof response["inputTokens"] === "number" ? { inputTokens: response["inputTokens"] } : {},
              ...typeof response["outputTokens"] === "number" ? { outputTokens: response["outputTokens"] } : {}
            });
            if (accepted) queue.close();
            else queue.fail(new Error("Generation stream consumer too slow"));
          });
        } catch (error) {
          if (!request.settled) queue.fail(error);
        } finally {
          request.settled = true;
          signal.removeEventListener("abort", cancel);
          workspaceGenerationRequests.delete(requestId);
          if (info && hasNoChannelWork(info) && !info.isDying) {
            await startIdleTimer(info, "workspace generation");
          }
        }
      })().catch(() => void 0);
      return queue;
    },
    async addRuntimeMcpServer(name, config, originatorClientId) {
      const info = liveChannelInfo();
      if (!info) {
        throw Object.assign(
          new Error(`No live ACP channel for runtime MCP add: ${name}`),
          { data: { errorKind: "acp_channel_unavailable" } }
        );
      }
      const response = await Promise.race([
        withTimeout(
          info.connection.extMethod(
            SERVE_CONTROL_EXT_METHODS.workspaceMcpRuntimeAdd,
            { name, config, originatorClientId }
          ),
          MCP_RESTART_SERVER_DEADLINE_MS,
          SERVE_CONTROL_EXT_METHODS.workspaceMcpRuntimeAdd
        ),
        getChannelClosedReject(info)
      ]);
      const addSkipped = response.skipped === true;
      if (!addSkipped) {
        const ok = response;
        broadcastWorkspaceEvent({
          type: "mcp_server_added",
          data: {
            name: ok.name,
            transport: ok.transport,
            replaced: ok.replaced,
            shadowedSettings: ok.shadowedSettings,
            toolCount: ok.toolCount,
            originatorClientId: ok.originatorClientId
          },
          ...originatorClientId ? { originatorClientId } : {}
        });
      }
      return response;
    },
    async removeRuntimeMcpServer(name, originatorClientId) {
      const info = liveChannelInfo();
      if (!info) {
        throw Object.assign(
          new Error(`No live ACP channel for runtime MCP remove: ${name}`),
          { data: { errorKind: "acp_channel_unavailable" } }
        );
      }
      const response = await Promise.race([
        withTimeout(
          info.connection.extMethod(
            SERVE_CONTROL_EXT_METHODS.workspaceMcpRuntimeRemove,
            { name, originatorClientId }
          ),
          MCP_RESTART_SERVER_DEADLINE_MS,
          SERVE_CONTROL_EXT_METHODS.workspaceMcpRuntimeRemove
        ),
        getChannelClosedReject(info)
      ]);
      const removeSkipped = response.skipped === true;
      if (!removeSkipped) {
        const ok = response;
        broadcastWorkspaceEvent({
          type: "mcp_server_removed",
          data: {
            name: ok.name,
            wasShadowingSettings: ok.wasShadowingSettings,
            originatorClientId: ok.originatorClientId
          },
          ...originatorClientId ? { originatorClientId } : {}
        });
      }
      return response;
    },
    async addSessionRuntimeMcpServer(sessionId, name, config, originatorClientId) {
      return requestSessionStatus(
        sessionId,
        SERVE_CONTROL_EXT_METHODS.sessionMcpRuntimeAdd,
        { name, config, originatorClientId },
        MCP_RESTART_SERVER_DEADLINE_MS
      );
    },
    async removeSessionRuntimeMcpServer(sessionId, name, originatorClientId) {
      return requestSessionStatus(
        sessionId,
        SERVE_CONTROL_EXT_METHODS.sessionMcpRuntimeRemove,
        { name, originatorClientId },
        MCP_RESTART_SERVER_DEADLINE_MS
      );
    },
    async killSession(sessionId, opts2) {
      const entry = byId.get(sessionId);
      if (!entry) return false;
      if (opts2?.requireZeroAttaches && entry.attachCount > 0) {
        entry.spawnOwnerWantedKill = true;
        return false;
      }
      if (entry.closing) {
        const closingChannel = channelInfoForEntry(entry);
        if (!closingChannel) return false;
        await killChannelWithLog(
          closingChannel,
          `force kill closing session ${JSON.stringify(sessionId)}`
        );
        await entry.attachments.close().catch((releaseError) => {
          writeStderrLine(
            `qwen serve: failed to close attachments for killed session ${JSON.stringify(sessionId)}: ${releaseError instanceof Error ? releaseError.message : String(releaseError)}`
          );
        });
        return true;
      }
      entry.closing = true;
      const ci = channelInfoForEntry(entry);
      if (!ci) {
        writeStderrLine(
          `qwen serve: killSession channelInfoForEntry returned undefined for session ${JSON.stringify(sessionId)} \u2014 channel cleanup skipped (entry's channel already torn down)`
        );
      }
      permissionMediator.forgetSession(sessionId);
      entry.pendingPermissionIds.clear();
      entry.pendingInteractions.clear();
      try {
        await notifyAgentSessionClose(entry, ci, "killSession", {
          throwOnFailure: true,
          timeoutMs: initTimeoutMs
        });
      } catch (error) {
        if (isDefinitiveAcpRequestError(error)) {
          entry.closing = false;
          return false;
        }
        if (ci) {
          await killChannelWithLog(
            ci,
            `force kill session ${JSON.stringify(sessionId)}`
          );
          return true;
        }
        entry.closing = false;
        throw error;
      }
      if (entry.promptActive) {
        entry.promptActive = false;
        activePromptCounter--;
        touchActivity();
      }
      if (defaultEntry === entry) defaultEntry = void 0;
      byId.delete(sessionId);
      telemetry.metrics?.sessionLifecycle("die");
      emitSessionLifecycle({
        type: "removed",
        sessionId,
        workspaceCwd: entry.workspaceCwd,
        reason: "killed"
      });
      if (ci && ci.channel === entry.channel) {
        ci.sessionIds.delete(sessionId);
      }
      ci?.client.markSessionClosed(sessionId);
      flushPromptTerminals(
        entry,
        "session_killed",
        "session killed before the prompt completed"
      );
      try {
        entry.events.publish({
          type: "session_died",
          data: { sessionId, reason: "killed" }
        });
      } catch {
      }
      entry.events.close();
      await entry.attachments.close().catch((error) => {
        writeStderrLine(
          `qwen serve: failed to close attachments for killed session ${JSON.stringify(sessionId)}: ${error instanceof Error ? error.message : String(error)}`
        );
      });
      if (ci && hasNoChannelWork(ci)) {
        await reapPendingEmptyChannel(ci);
        if (!ci.isDying) {
          await startIdleTimer(ci, `killSession "${sessionId}"`);
        }
      }
      return true;
    },
    async detachClient(sessionId, clientId) {
      const entry = byId.get(sessionId);
      if (!entry) return;
      if (clientId !== void 0 && releaseAttachRef(entry, clientId)) {
        if (entry.attachCount > 0) entry.attachCount--;
      }
      unregisterClient(entry, clientId);
      await maybeCloseIdleSession(entry, "last_client_detached");
    },
    killAllSync() {
      shuttingDown = true;
      cancelIdleTimer();
      stopSessionReaper();
      const channels = Array.from(aliveChannels);
      const entries = Array.from(byId.values());
      defaultEntry = void 0;
      byId.clear();
      for (const entry of entries) {
        emitSessionLifecycle({
          type: "removed",
          sessionId: entry.sessionId,
          workspaceCwd: entry.workspaceCwd,
          reason: "kill_all"
        });
      }
      for (const info of channels) {
        info.channelLiveness?.stop();
        try {
          info.channel.killSync();
        } catch {
        }
      }
    },
    shutdown(options) {
      if (shutdownPromise) return shutdownPromise;
      const shutdownReason = options?.reason ?? "daemon_shutdown";
      let resolveShutdown;
      let rejectShutdown;
      shutdownPromise = new Promise((resolve, reject) => {
        resolveShutdown = resolve;
        rejectShutdown = reject;
      });
      void (async () => {
        shuttingDown = true;
        unregisterJournalGrowthSessionLimits?.();
        cancelIdleTimer();
        stopSessionReaper();
        const entries = Array.from(byId.values());
        const channels = Array.from(aliveChannels);
        for (const ci of channels) {
          ci.isDying = true;
          ci.channelLiveness?.stop();
        }
        for (const e of entries) {
          permissionMediator.forgetSession(e.sessionId);
          e.pendingPermissionIds.clear();
          e.pendingInteractions.clear();
        }
        defaultEntry = void 0;
        byId.clear();
        for (const e of entries) {
          telemetry.metrics?.sessionLifecycle("die");
          emitSessionLifecycle({
            type: "removed",
            sessionId: e.sessionId,
            workspaceCwd: e.workspaceCwd,
            reason: shutdownReason
          });
          flushPromptTerminals(
            e,
            "daemon_shutdown",
            "daemon shut down before the prompt completed"
          );
          try {
            e.events.publish({
              type: "session_died",
              data: { sessionId: e.sessionId, reason: shutdownReason }
            });
          } catch {
          }
          e.events.close();
        }
        const inFlightSessionAwaits = Array.from(inFlightSpawns.values()).map(
          (p) => p.then(
            () => void 0,
            () => void 0
          )
        );
        const inFlightRestoreAwaits = Array.from(inFlightRestores.values()).map(
          (restore) => restore.settlementPromise.then(
            () => void 0,
            () => void 0
          )
        );
        const inFlightChannelAwait = inFlightChannelSpawn ? inFlightChannelSpawn.then(
          () => void 0,
          () => void 0
        ) : Promise.resolve();
        const teardownResults = await Promise.allSettled([
          ...channels.map((ci) => ci.channel.kill()),
          ...[...byId.values()].map((entry) => entry.attachments.close()),
          ...inFlightSessionAwaits,
          ...inFlightRestoreAwaits,
          inFlightChannelAwait
        ]);
        const teardownFailures = teardownResults.flatMap(
          (result) => result.status === "rejected" ? [result.reason] : []
        );
        if (teardownFailures.length === 1) throw teardownFailures[0];
        if (teardownFailures.length > 1) {
          throw new AggregateError(
            teardownFailures,
            "ACP bridge shutdown failed"
          );
        }
      })().then(resolveShutdown, rejectShutdown);
      return shutdownPromise;
    },
    async preheat() {
      if (shuttingDown) return;
      await telemetry.withSpan(
        "channel.preheat",
        { "qwen-code.daemon.bridge.operation": "channel.preheat" },
        async () => {
          const ci = await ensureChannel();
          const idleMs = resolvedChannelIdleTimeoutMs();
          if (idleMs > 0 && hasNoChannelWork(ci)) {
            await startIdleTimer(ci);
          }
        }
      );
    }
  };
  sendTrackedPrompt.fn = bridgeApi.sendPrompt.bind(bridgeApi);
  return bridgeApi;
}
__name(createAcpSessionBridge, "createAcpSessionBridge");
async function withTimeout(p, ms, label) {
  let timer;
  const timeoutP = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new BridgeTimeoutError(label, ms)), ms);
  });
  try {
    return await Promise.race([p, timeoutP]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
__name(withTimeout, "withTimeout");
var createHttpAcpBridge = createAcpSessionBridge;

export {
  SessionArtifactValidationError,
  SessionArtifactAuthorizationError,
  parseSessionSource,
  extractErrorMessage,
  extractErrorCode,
  classifyTurnErrorKind,
  createAcpSessionBridge,
  createHttpAcpBridge
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
