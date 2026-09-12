// Force strict mode and setup for ESM
"use strict";
import {
  sanitizeTerminalText
} from "./chunk-E7REAOTN.js";
import {
  formatHistoryGapNotice
} from "./chunk-XDLEZ5HX.js";
import {
  loadUndici
} from "./chunk-TXASDT2M.js";
import {
  LOAD_REPLAY_META_KEY
} from "./chunk-OZ6KS6KW.js";
import {
  projectGoalStateToLegacy
} from "./chunk-JIF7PTWO.js";
import {
  observeToolResultBoundary,
  toolResultBoundaryArtifact
} from "./chunk-IDRL5XVK.js";
import {
  parseGoalSnapshotV2,
  parseGoalStateCause,
  projectUserTranscriptForDisplay
} from "./chunk-WKK5BQNP.js";
import {
  formatVisionBridgeNoticeDisplay,
  isVisionBridgeNoticeDisplay
} from "./chunk-7RHAVFGI.js";
import {
  ToolNames
} from "./chunk-UTLCH2FK.js";
import {
  createDebugLogger
} from "./chunk-UHQFIS7N.js";
import {
  writeStderrLine,
  writeStderrLineSafe
} from "./chunk-KGJGEEVR.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/cli/src/nonInteractive/tool-result-boundary-diagnostics.ts
init_esbuild_shims();
var acpUpdateArtifacts = /* @__PURE__ */ new WeakMap();
var projectedAcpUpdates = /* @__PURE__ */ new WeakMap();
var projectedHeadlessMessages = /* @__PURE__ */ new WeakMap();
function associateAcpToolResultArtifact(update, artifact) {
  if (isObject(update)) acpUpdateArtifacts.set(update, artifact);
}
__name(associateAcpToolResultArtifact, "associateAcpToolResultArtifact");
function observeAcpToolResultProjection(input, output, sessionId, wireUpdate = output) {
  try {
    if (isObject(wireUpdate) && projectedAcpUpdates.has(wireUpdate)) return;
    const mutated = input !== output;
    const artifact = acpUpdateArtifacts.get(input) ?? {
      state: "undecided",
      kinds: []
    };
    const common = { sessionId, toolCallId: toolCallId(input) };
    const inputEligible = observeToolResultBoundary({
      stage: "acp_projection_input",
      ...common,
      mutated,
      artifacts: [artifact],
      values: /* @__PURE__ */ __name(() => acpToolResultValues(input), "values")
    });
    const outputEligible = observeToolResultBoundary({
      stage: "acp_projection_output",
      ...common,
      mutated,
      artifacts: [artifact],
      values: /* @__PURE__ */ __name(() => acpToolResultValues(output), "values")
    });
    if ((inputEligible || outputEligible) && isObject(wireUpdate)) {
      projectedAcpUpdates.set(wireUpdate, { mutated, artifact, sessionId });
    }
  } catch {
  }
}
__name(observeAcpToolResultProjection, "observeAcpToolResultProjection");
function observeAcpToolResultWire(message, payloadUtf8Bytes) {
  try {
    const record = asRecord(message);
    if (!record) return;
    const updates = acpWireUpdates(record).flatMap((update) => {
      const projection = projectedAcpUpdates.get(update);
      return projection ? [{ update, projection }] : [];
    });
    if (updates.length === 0) return;
    const params = asRecord(record["params"]);
    const projectionSessionIds = new Set(
      updates.map(({ projection }) => projection.sessionId)
    );
    const toolCallIds = updates.flatMap(({ update }) => {
      const id = toolCallId(update);
      return id === void 0 ? [] : [id];
    });
    observeToolResultBoundary({
      stage: "acp_wire",
      sessionId: typeof params?.["sessionId"] === "string" ? params["sessionId"] : projectionSessionIds.size === 1 ? projectionSessionIds.values().next().value : void 0,
      toolCallId: updates.length === 1 ? toolCallId(updates[0].update) : void 0,
      ...updates.length > 1 ? { toolCallIds } : {},
      wireUtf8Bytes: payloadUtf8Bytes + 1,
      mutated: updates.some(({ projection }) => projection.mutated),
      artifacts: updates.map(({ projection }) => projection.artifact),
      values: /* @__PURE__ */ __name(() => updates.flatMap(
        ({ update }) => acpToolResultValues(update)
      ), "values")
    });
    for (const { update } of updates) projectedAcpUpdates.delete(update);
  } catch {
  }
}
__name(observeAcpToolResultWire, "observeAcpToolResultWire");
function observeHeadlessToolResultProjection(message, inputContent, outputContent, toolCallId2, artifact) {
  try {
    const mutated = inputContent !== outputContent;
    const inputEligible = observeToolResultBoundary({
      stage: "headless_projection_input",
      sessionId: message.session_id,
      toolCallId: toolCallId2,
      mutated,
      artifacts: [artifact],
      values: [{ representation: "headless_content", value: inputContent }]
    });
    const outputEligible = observeToolResultBoundary({
      stage: "headless_projection_output",
      sessionId: message.session_id,
      toolCallId: toolCallId2,
      mutated,
      artifacts: [artifact],
      values: [{ representation: "headless_content", value: outputContent }]
    });
    if (inputEligible || outputEligible) {
      projectedHeadlessMessages.set(message, {
        mutated,
        artifact,
        sessionId: message.session_id
      });
    }
  } catch {
  }
}
__name(observeHeadlessToolResultProjection, "observeHeadlessToolResultProjection");
function observeHeadlessToolResultWire(message, frame) {
  try {
    if (!projectedHeadlessMessages.has(message)) return;
    const projection = projectedHeadlessMessages.get(message);
    const toolResults = headlessToolResults(message);
    const values = toolResults.flatMap(toolResultValues);
    observeToolResultBoundary({
      stage: "headless_wire",
      sessionId: message.session_id,
      toolCallId: toolResults.length === 1 && typeof toolResults[0].tool_use_id === "string" ? toolResults[0].tool_use_id : void 0,
      ...toolResults.length > 1 ? {
        toolCallIds: toolResults.map(
          (toolResult) => toolResult.tool_use_id
        )
      } : {},
      wireUtf8Bytes: Buffer.byteLength(frame, "utf8"),
      mutated: projection.mutated,
      artifacts: [projection.artifact],
      values
    });
    projectedHeadlessMessages.delete(message);
  } catch {
  }
}
__name(observeHeadlessToolResultWire, "observeHeadlessToolResultWire");
function observeHeadlessJsonToolResultWire(messages, frame) {
  try {
    const observedMessages = messages.filter(
      (message) => projectedHeadlessMessages.has(message)
    );
    if (observedMessages.length === 0) return;
    const toolResults = observedMessages.flatMap(headlessToolResults);
    const values = toolResults.flatMap(toolResultValues);
    observeToolResultBoundary({
      stage: "headless_wire",
      sessionId: new Set(observedMessages.map((message) => message.session_id)).size === 1 ? observedMessages[0].session_id : void 0,
      toolCallId: toolResults.length === 1 ? toolResults[0].tool_use_id : void 0,
      ...toolResults.length > 1 ? {
        toolCallIds: toolResults.map(
          (toolResult) => toolResult.tool_use_id
        )
      } : {},
      wireUtf8Bytes: Buffer.byteLength(frame, "utf8"),
      mutated: observedMessages.some(
        (message) => projectedHeadlessMessages.get(message)?.mutated === true
      ),
      artifacts: observedMessages.map(
        (message) => projectedHeadlessMessages.get(message).artifact
      ),
      values
    });
    for (const message of observedMessages) {
      projectedHeadlessMessages.delete(message);
    }
  } catch {
  }
}
__name(observeHeadlessJsonToolResultWire, "observeHeadlessJsonToolResultWire");
function acpToolResultValues(update) {
  const record = update;
  if (record["sessionUpdate"] !== "tool_call_update") return [];
  const values = [];
  const content = record["content"];
  if (Array.isArray(content)) {
    for (const block of content) {
      const text = asRecord(asRecord(block)?.["content"])?.["text"];
      if (typeof text === "string") {
        values.push({ representation: "acp_content", value: text });
      }
    }
  }
  if (typeof record["rawOutput"] === "string") {
    values.push({
      representation: "acp_raw_output",
      value: record["rawOutput"]
    });
  }
  return values;
}
__name(acpToolResultValues, "acpToolResultValues");
function toolCallId(value) {
  const id = asRecord(value)?.["toolCallId"];
  return typeof id === "string" ? id : void 0;
}
__name(toolCallId, "toolCallId");
function acpWireUpdates(message) {
  if (message["method"] === "session/update") {
    const update = asRecord(asRecord(message["params"])?.["update"]);
    return update ? [update] : [];
  }
  const result = asRecord(message["result"]);
  const replay = asRecord(asRecord(result?.["_meta"])?.[LOAD_REPLAY_META_KEY]);
  const candidates = replay?.["updates"] ?? result?.["updates"];
  if (Array.isArray(candidates)) return candidates.filter(isObject);
  const events = result?.["events"];
  return Array.isArray(events) ? events.flatMap((event) => {
    const update = asRecord(event)?.["data"];
    return isObject(update) ? [update] : [];
  }) : [];
}
__name(acpWireUpdates, "acpWireUpdates");
function headlessToolResults(message) {
  if (message.type !== "user" || !Array.isArray(message.message.content)) {
    return [];
  }
  return message.message.content.flatMap(
    (block) => block.type === "tool_result" ? [block] : []
  );
}
__name(headlessToolResults, "headlessToolResults");
function toolResultValues(toolResult) {
  return typeof toolResult.content === "string" ? [{ representation: "headless_content", value: toolResult.content }] : [];
}
__name(toolResultValues, "toolResultValues");
function asRecord(value) {
  return isObject(value) ? value : void 0;
}
__name(asRecord, "asRecord");
function isObject(value) {
  return typeof value === "object" && value !== null;
}
__name(isObject, "isObject");

// packages/cli/src/acp-integration/session/history-replayer.ts
init_esbuild_shims();

// packages/acp-bridge/src/transcript-replay.ts
init_esbuild_shims();

// packages/core/dist/src/goals/goal-wire.js
init_esbuild_shims();

// packages/core/dist/src/goals/goal-protocol.js
init_esbuild_shims();
var GOAL_STATE_VERSION = 2;
var GOAL_CHECKPOINT_CLAIM_LIMIT = 32;
var GOAL_CHECKPOINT_CLAIM_MAX_CHARACTERS = 2e3;
var GOAL_CHECKPOINT_CLAIM_MAX_BYTES = 16e3;
var GOAL_CHECKPOINT_SOURCE_REFERENCE_LIMIT = 32;
function isGoalLimitKind(value) {
  return value === "evidence_catalog" || value === "checkpoint_request" || value === "token_budget";
}
__name(isGoalLimitKind, "isGoalLimitKind");
function isGoalEvidenceProofKind(value) {
  return value === "user_input" || value === "delivered_output" || value === "external_fact";
}
__name(isGoalEvidenceProofKind, "isGoalEvidenceProofKind");

// packages/core/dist/src/goals/goal-reducer.js
init_esbuild_shims();
var MAX_BLOCKED_AUDIT_COUNT = 3;
function parseGoalStateRecordPayloadV2(value) {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    "v",
    "cause",
    "snapshot",
    "checkpointPending",
    "blockedAudit"
  ]) || value["v"] !== GOAL_STATE_VERSION || !isGoalStateCause(value["cause"]) || !isCheckpointPending(value["checkpointPending"]) || !isBlockedAudit(value["blockedAudit"])) {
    return void 0;
  }
  const parsedSnapshot = parseGoalSnapshotV22(value["snapshot"]);
  if (parsedSnapshot?.activity !== "idle")
    return void 0;
  const checkpointPending = value["checkpointPending"];
  if (checkpointPending && (parsedSnapshot.goal?.status !== "active" || checkpointPending.permit.goalId !== parsedSnapshot.goal.goalId || checkpointPending.permit.revision !== parsedSnapshot.goal.revision || checkpointPending.recordUuid === parsedSnapshot.goal.evidenceCursor.recordId || value["cause"] !== "turn_finished" && value["cause"] !== "verifier_reject")) {
    return void 0;
  }
  return {
    v: GOAL_STATE_VERSION,
    cause: value["cause"],
    snapshot: parsedSnapshot,
    ...checkpointPending ? { checkpointPending: structuredClone(checkpointPending) } : {},
    ...value["blockedAudit"] ? { blockedAudit: structuredClone(value["blockedAudit"]) } : {}
  };
}
__name(parseGoalStateRecordPayloadV2, "parseGoalStateRecordPayloadV2");
function parseGoalSnapshotV22(value) {
  if (!isRecord(value) || !hasOnlyKeys(value, ["v", "goal", "activity", "clearedGoal"]) || value["v"] !== GOAL_STATE_VERSION || !isGoalActivity(value["activity"])) {
    return void 0;
  }
  if (value["goal"] === null) {
    const clearedGoal = parseGoalOrder(value["clearedGoal"]);
    if (value["clearedGoal"] !== void 0 && !clearedGoal)
      return void 0;
    return {
      v: GOAL_STATE_VERSION,
      goal: null,
      activity: value["activity"],
      ...clearedGoal ? { clearedGoal } : {}
    };
  }
  if (value["clearedGoal"] !== void 0)
    return void 0;
  const goal = parseGoalRecord(value["goal"]);
  return goal ? { v: GOAL_STATE_VERSION, goal, activity: value["activity"] } : void 0;
}
__name(parseGoalSnapshotV22, "parseGoalSnapshotV2");
function parseGoalOrder(value) {
  if (!isRecord(value) || !hasOnlyKeys(value, ["goalId", "revision", "updatedAt"]) || typeof value["goalId"] !== "string" || !value["goalId"] || !isNonNegativeInteger(value["revision"]) || value["revision"] === 0 || !isFiniteNumber(value["updatedAt"])) {
    return void 0;
  }
  return {
    goalId: value["goalId"],
    revision: value["revision"],
    updatedAt: value["updatedAt"]
  };
}
__name(parseGoalOrder, "parseGoalOrder");
function parseGoalStateCause2(value) {
  return isGoalStateCause(value) ? value : void 0;
}
__name(parseGoalStateCause2, "parseGoalStateCause");
function copyCursor(cursor) {
  return { recordId: cursor.recordId };
}
__name(copyCursor, "copyCursor");
function parseGoalRecord(value) {
  if (!isRecord(value) || !hasOnlyKeys(value, [
    "goalId",
    "revision",
    "objective",
    "status",
    "evidenceCursor",
    "turnCount",
    "activeTimeMs",
    "tokensUsed",
    "tokenBudget",
    "windDownTurnId",
    "createdAt",
    "updatedAt",
    "evidenceCheckpoint",
    "checkpointStalls",
    "lastReason",
    "limitKind"
  ]) || typeof value["goalId"] !== "string" || !value["goalId"] || !isNonNegativeInteger(value["revision"]) || value["revision"] === 0 || typeof value["objective"] !== "string" || !value["objective"].trim() || !isGoalStatus(value["status"]) || !isTranscriptCursor(value["evidenceCursor"]) || !isNonNegativeInteger(value["turnCount"]) || !isNonNegativeNumber(value["activeTimeMs"]) || value["tokensUsed"] !== void 0 && !isNonNegativeNumber(value["tokensUsed"]) || value["tokenBudget"] !== void 0 && !isNonNegativeNumber(value["tokenBudget"]) || value["windDownTurnId"] !== void 0 && (typeof value["windDownTurnId"] !== "string" || !value["windDownTurnId"]) || !isFiniteNumber(value["createdAt"]) || !isFiniteNumber(value["updatedAt"]) || !isGoalEvidenceCheckpoint(value["evidenceCheckpoint"]) || value["checkpointStalls"] !== void 0 && !isNonNegativeInteger(value["checkpointStalls"]) || value["lastReason"] !== void 0 && typeof value["lastReason"] !== "string" || value["limitKind"] !== void 0 && (!isGoalLimitKind(value["limitKind"]) || value["status"] !== "usage_limited")) {
    return void 0;
  }
  if (value["evidenceCheckpoint"] && value["evidenceCursor"].recordId !== value["evidenceCheckpoint"].checkpointId) {
    return void 0;
  }
  return {
    goalId: value["goalId"],
    revision: value["revision"],
    objective: value["objective"],
    status: value["status"],
    evidenceCursor: copyCursor(value["evidenceCursor"]),
    turnCount: value["turnCount"],
    activeTimeMs: value["activeTimeMs"],
    // Goals persisted before `tokensUsed` existed carry no spend to restore.
    tokensUsed: value["tokensUsed"] ?? 0,
    // And no budget: a Goal from before budgets existed stays unbounded.
    ...value["tokenBudget"] === void 0 ? {} : { tokenBudget: value["tokenBudget"] },
    ...value["windDownTurnId"] === void 0 ? {} : { windDownTurnId: value["windDownTurnId"] },
    createdAt: value["createdAt"],
    updatedAt: value["updatedAt"],
    ...value["evidenceCheckpoint"] === void 0 ? {} : {
      evidenceCheckpoint: structuredClone(value["evidenceCheckpoint"])
    },
    // Zero is spelled as no field; a persisted 0 restores the same way.
    ...value["checkpointStalls"] ? { checkpointStalls: value["checkpointStalls"] } : {},
    ...value["lastReason"] === void 0 ? {} : { lastReason: value["lastReason"] },
    ...value["limitKind"] === void 0 ? {} : { limitKind: value["limitKind"] }
  };
}
__name(parseGoalRecord, "parseGoalRecord");
function isTranscriptCursor(value) {
  return isRecord(value) && hasOnlyKeys(value, ["recordId"]) && (typeof value["recordId"] === "string" || value["recordId"] === null);
}
__name(isTranscriptCursor, "isTranscriptCursor");
function isGoalStatus(value) {
  return value === "active" || value === "paused" || value === "blocked" || value === "usage_limited" || value === "complete";
}
__name(isGoalStatus, "isGoalStatus");
function isGoalActivity(value) {
  return value === "idle" || value === "running" || value === "verifying";
}
__name(isGoalActivity, "isGoalActivity");
function isGoalStateCause(value) {
  return value === "create" || value === "replace" || value === "edit" || value === "pause" || value === "resume" || value === "turn_finished" || value === "checkpoint" || value === "verifier_accept" || value === "verifier_reject" || value === "complete" || value === "blocked" || value === "usage_limited" || value === "clear" || value === "migrated";
}
__name(isGoalStateCause, "isGoalStateCause");
function isGoalEvidenceCheckpoint(value) {
  if (value === void 0)
    return true;
  if (!isRecord(value) || !hasOnlyKeys(value, ["checkpointId", "createdAt", "claims"]) || typeof value["checkpointId"] !== "string" || value["checkpointId"].length === 0 || !isFiniteNumber(value["createdAt"]) || !Array.isArray(value["claims"]) || value["claims"].length === 0 || value["claims"].length > GOAL_CHECKPOINT_CLAIM_LIMIT) {
    return false;
  }
  let checkpointBytes = 0;
  for (const [index, claim] of value["claims"].entries()) {
    if (!isRecord(claim) || !hasOnlyKeys(claim, ["id", "proofKind", "claim", "sourceRefs"]) || claim["id"] !== `${value["checkpointId"]}:${index + 1}` || !isGoalEvidenceProofKind(claim["proofKind"]) || typeof claim["claim"] !== "string" || claim["claim"].trim().length === 0 || [...claim["claim"]].length > GOAL_CHECKPOINT_CLAIM_MAX_CHARACTERS || !Array.isArray(claim["sourceRefs"]) || claim["sourceRefs"].length === 0 || claim["sourceRefs"].length > GOAL_CHECKPOINT_SOURCE_REFERENCE_LIMIT || new Set(claim["sourceRefs"]).size !== claim["sourceRefs"].length || claim["sourceRefs"].some((reference) => typeof reference !== "string" || reference.length === 0)) {
      return false;
    }
    checkpointBytes += new TextEncoder().encode(claim["claim"]).byteLength;
    if (checkpointBytes > GOAL_CHECKPOINT_CLAIM_MAX_BYTES)
      return false;
  }
  return true;
}
__name(isGoalEvidenceCheckpoint, "isGoalEvidenceCheckpoint");
function isCheckpointPending(value) {
  return value === void 0 || isRecord(value) && hasOnlyKeys(value, ["permit", "recordUuid"]) && isGoalTurnPermit(value["permit"]) && typeof value["recordUuid"] === "string" && value["recordUuid"].length > 0;
}
__name(isCheckpointPending, "isCheckpointPending");
function isGoalTurnPermit(value) {
  return isRecord(value) && hasOnlyKeys(value, ["goalId", "revision", "turnId"]) && typeof value["goalId"] === "string" && value["goalId"].length > 0 && isNonNegativeInteger(value["revision"]) && value["revision"] > 0 && typeof value["turnId"] === "string" && value["turnId"].length > 0;
}
__name(isGoalTurnPermit, "isGoalTurnPermit");
function isBlockedAudit(value) {
  return value === void 0 || isRecord(value) && hasOnlyKeys(value, ["fingerprint", "count", "turnIds"]) && typeof value["fingerprint"] === "string" && value["fingerprint"].length > 0 && isNonNegativeInteger(value["count"]) && value["count"] > 0 && value["count"] <= MAX_BLOCKED_AUDIT_COUNT && Array.isArray(value["turnIds"]) && value["turnIds"].length === value["count"] && value["turnIds"].every((turnId) => typeof turnId === "string" && turnId.length > 0);
}
__name(isBlockedAudit, "isBlockedAudit");
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
__name(isRecord, "isRecord");
function hasOnlyKeys(value, keys) {
  return Object.keys(value).every((key) => keys.includes(key));
}
__name(hasOnlyKeys, "hasOnlyKeys");
function isNonNegativeInteger(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
__name(isNonNegativeInteger, "isNonNegativeInteger");
function isNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
__name(isNonNegativeNumber, "isNonNegativeNumber");
function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}
__name(isFiniteNumber, "isFiniteNumber");

// packages/core/dist/src/goals/goal-legacy-projection.js
init_esbuild_shims();
function projectGoalStateToLegacy2(payload, previousGoal = null) {
  const snapshotGoal = payload.snapshot.goal;
  const displayGoal = snapshotGoal ?? previousGoal;
  const kind = legacyStatusKind(payload);
  const goalStatus = {
    type: "goal_status",
    kind,
    condition: displayGoal?.objective ?? "",
    ...displayGoal ? { iterations: displayGoal.turnCount } : {},
    ...displayGoal ? { setAt: displayGoal.createdAt } : {},
    ...displayGoal ? { durationMs: displayGoal.activeTimeMs } : {},
    ...displayGoal?.lastReason === void 0 ? {} : { lastReason: displayGoal.lastReason }
  };
  const terminalKind = kind === "achieved" || kind === "failed" || kind === "aborted" ? kind : void 0;
  return {
    activeGoal: snapshotGoal?.status === "active" ? {
      condition: snapshotGoal.objective,
      iterations: snapshotGoal.turnCount,
      setAt: snapshotGoal.createdAt,
      ...snapshotGoal.lastReason === void 0 ? {} : { lastReason: snapshotGoal.lastReason }
    } : null,
    goalStatus,
    goalTerminal: terminalKind && displayGoal ? {
      kind: terminalKind,
      condition: displayGoal.objective,
      iterations: displayGoal.turnCount,
      durationMs: displayGoal.activeTimeMs,
      ...displayGoal.lastReason === void 0 ? {} : { lastReason: displayGoal.lastReason }
    } : null
  };
}
__name(projectGoalStateToLegacy2, "projectGoalStateToLegacy");
function isGoalCheckpointBookkeepingTransition(previous, next) {
  const previousGoal = previous?.goal;
  const nextGoal = next.goal;
  if (!previousGoal || !nextGoal)
    return false;
  return previousGoal.goalId === nextGoal.goalId && previousGoal.revision === nextGoal.revision && previousGoal.objective === nextGoal.objective && previousGoal.status === nextGoal.status && previousGoal.turnCount === nextGoal.turnCount && previousGoal.createdAt === nextGoal.createdAt && previousGoal.lastReason === nextGoal.lastReason;
}
__name(isGoalCheckpointBookkeepingTransition, "isGoalCheckpointBookkeepingTransition");
function isGoalCheckpointBookkeepingCause(cause, previousCause) {
  if (cause === "checkpoint")
    return true;
  return cause === "verifier_reject" && (previousCause === "verifier_reject" || previousCause === "checkpoint");
}
__name(isGoalCheckpointBookkeepingCause, "isGoalCheckpointBookkeepingCause");
function isGoalCheckpointBookkeepingRecord(input) {
  return isGoalCheckpointBookkeepingTransition(input.previous, input.next) && isGoalCheckpointBookkeepingCause(input.cause, input.previousCause);
}
__name(isGoalCheckpointBookkeepingRecord, "isGoalCheckpointBookkeepingRecord");
function legacyStatusKind(payload) {
  switch (payload.cause) {
    case "create":
    case "replace":
    case "edit":
    case "resume":
      return "set";
    case "complete":
      return "achieved";
    case "clear":
      return "cleared";
    // A migrated goal is always persisted `paused` (`createMigratedGoalState`),
    // and nothing drives a paused goal. Projecting it as `set` would re-assert
    // "active" to every client that derives the live goal from the newest card,
    // leaving a phantom running goal behind a resumed pre-v2 transcript.
    case "migrated":
    case "pause":
      return "paused";
    case "blocked":
    case "usage_limited":
      return "aborted";
    case "turn_finished":
    case "checkpoint":
    case "verifier_accept":
    case "verifier_reject":
      return payload.snapshot.goal?.status === "complete" ? "achieved" : payload.snapshot.goal?.status === "blocked" || payload.snapshot.goal?.status === "usage_limited" ? "aborted" : "checking";
    default:
      return assertNever(payload.cause);
  }
}
__name(legacyStatusKind, "legacyStatusKind");
function assertNever(value) {
  throw new Error(`Unsupported Goal state cause: ${String(value)}`);
}
__name(assertNever, "assertNever");

// packages/acp-bridge/src/transcript-replay.ts
var MISSING_TRANSCRIPT_TOOL_RESULT_MESSAGE = "Tool result missing from saved history; the previous run likely ended before this tool completed.";
var TRANSCRIPT_GOAL_STATUS_KINDS = /* @__PURE__ */ new Set([
  "set",
  "achieved",
  "cleared",
  "failed",
  "aborted",
  // A paused goal is not running, and dropping the card here is not neutral:
  // the replay stream is what feeds the goal renderer, so the older `set` card
  // stays newest and every surface keeps claiming autonomous work is under way.
  // Kept in step with `GOAL_STATUS_KINDS`, which the daemon-side reader
  // (`parseGoalStatusItem`) validates the same on-disk cards against.
  "paused",
  "checking"
]);
function isObjectRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
__name(isObjectRecord, "isObjectRecord");
function replaceTextPartsForDisplay(parts, displayText) {
  const projected = [];
  let replacedText = false;
  for (const part of parts ?? []) {
    if (isObjectRecord(part) && typeof part["text"] === "string") {
      if (!replacedText && displayText.length > 0) {
        projected.push({ text: displayText });
      }
      replacedText = true;
    } else {
      projected.push(part);
    }
  }
  if (!replacedText && displayText.length > 0) {
    projected.push({ text: displayText });
  }
  return projected;
}
__name(replaceTextPartsForDisplay, "replaceTextPartsForDisplay");
function stripGeneratedAttachmentTokens(displayText, payload) {
  const references = payload?.["attachmentReferences"];
  if (!Array.isArray(references)) return displayText;
  const tokens = references.flatMap((reference) => {
    if (!isObjectRecord(reference) || reference["type"] !== "resource" || typeof reference["attachmentId"] !== "string") {
      return [];
    }
    return [`@attachment:///${encodeURIComponent(reference["attachmentId"])}`];
  });
  if (tokens.length === 0) return displayText;
  const tokenText = tokens.join("\n");
  if (displayText === tokenText) return "";
  const suffix = `

${tokenText}`;
  return displayText.endsWith(suffix) ? displayText.slice(0, -suffix.length) : displayText;
}
__name(stripGeneratedAttachmentTokens, "stripGeneratedAttachmentTokens");
function toTranscriptEpochMs(timestamp) {
  if (typeof timestamp === "number") {
    return Number.isFinite(timestamp) ? timestamp : void 0;
  }
  if (typeof timestamp !== "string") return void 0;
  const epochMs = new Date(timestamp).getTime();
  return Number.isFinite(epochMs) ? epochMs : void 0;
}
__name(toTranscriptEpochMs, "toTranscriptEpochMs");
function buildUpdateMeta(options) {
  const timestamp = toTranscriptEpochMs(options.timestamp);
  const sourceRecordIds = dedupeStrings(options.sourceRecordIds ?? []);
  const qwenTranscript = {
    ...sourceRecordIds.length > 0 ? { sourceRecordIds } : {},
    ...options.planToolCallId ? { planToolCallId: options.planToolCallId } : {}
  };
  const meta = {
    ...options.extra ?? {},
    ...timestamp !== void 0 ? { timestamp } : {},
    ...Object.keys(qwenTranscript).length > 0 ? { qwenTranscript } : {}
  };
  return Object.keys(meta).length > 0 ? meta : void 0;
}
__name(buildUpdateMeta, "buildUpdateMeta");
function createTranscriptMessageUpdate(options) {
  const meta = buildUpdateMeta(options);
  return {
    sessionUpdate: options.role === "user" ? "user_message_chunk" : options.thought ? "agent_thought_chunk" : "agent_message_chunk",
    content: { type: "text", text: options.text },
    ...meta ? { _meta: meta } : {}
  };
}
__name(createTranscriptMessageUpdate, "createTranscriptMessageUpdate");
function createTranscriptImageUpdate(options) {
  const meta = buildUpdateMeta(options);
  return {
    sessionUpdate: "user_message_chunk",
    content: { type: "image", data: options.data, mimeType: options.mimeType },
    ...meta ? { _meta: meta } : {}
  };
}
__name(createTranscriptImageUpdate, "createTranscriptImageUpdate");
function createTranscriptAttachmentReferenceUpdate(reference, options) {
  if (reference["type"] !== "image" && reference["type"] !== "resource" || typeof reference["attachmentId"] !== "string" || typeof reference["mimeType"] !== "string" || typeof reference["size"] !== "number") {
    return void 0;
  }
  const meta = buildUpdateMeta(options);
  return {
    sessionUpdate: "user_message_chunk",
    content: {
      type: reference["type"],
      attachmentId: reference["attachmentId"],
      mimeType: reference["mimeType"],
      size: reference["size"]
    },
    ...meta ? { _meta: meta } : {}
  };
}
__name(createTranscriptAttachmentReferenceUpdate, "createTranscriptAttachmentReferenceUpdate");
function createTranscriptUsageUpdate(usageMetadata, options = {}) {
  const usage = {
    inputTokens: finiteNumber(usageMetadata.promptTokenCount) ?? 0,
    outputTokens: finiteNumber(usageMetadata.candidatesTokenCount) ?? 0,
    totalTokens: finiteNumber(usageMetadata.totalTokenCount) ?? 0,
    ...finiteNumber(usageMetadata.thoughtsTokenCount) !== void 0 ? { thoughtTokens: finiteNumber(usageMetadata.thoughtsTokenCount) } : {},
    ...finiteNumber(usageMetadata.cachedContentTokenCount) !== void 0 ? {
      cachedReadTokens: finiteNumber(usageMetadata.cachedContentTokenCount)
    } : {}
  };
  const meta = buildUpdateMeta({
    ...options,
    extra: { usage, ...options.extra ?? {} }
  });
  return {
    sessionUpdate: "agent_message_chunk",
    content: { type: "text", text: options.text ?? "" },
    _meta: meta
  };
}
__name(createTranscriptUsageUpdate, "createTranscriptUsageUpdate");
function createTranscriptToolCallStartUpdate(options) {
  const provenance = resolveToolProvenance(options.toolName);
  return {
    sessionUpdate: options.asUpdate ? "tool_call_update" : "tool_call",
    toolCallId: options.callId,
    status: options.status ?? "pending",
    title: options.metadata.title,
    content: [],
    locations: [...options.metadata.locations],
    kind: options.metadata.kind,
    rawInput: options.args ?? {},
    _meta: buildUpdateMeta({
      ...options,
      extra: {
        toolName: options.toolName,
        provenance: provenance.provenance,
        ...provenance.serverId ? { serverId: provenance.serverId } : {},
        ...options.extra ?? {}
      }
    })
  };
}
__name(createTranscriptToolCallStartUpdate, "createTranscriptToolCallStartUpdate");
function createTranscriptToolCallResultUpdate(options) {
  const provenance = resolveToolProvenance(options.toolName);
  const content = buildToolResultContent(options);
  const update = {
    sessionUpdate: "tool_call_update",
    toolCallId: options.callId,
    status: options.success ? "completed" : "failed",
    content,
    _meta: buildUpdateMeta({
      ...options,
      extra: {
        toolName: options.toolName,
        provenance: provenance.provenance,
        ...provenance.serverId ? { serverId: provenance.serverId } : {},
        ...options.artifacts && options.artifacts.length > 0 ? { artifacts: options.artifacts } : {},
        ...options.extra ?? {}
      }
    })
  };
  if (options.resultDisplay !== void 0 && !isTruncatedSessionDiffDisplay(options.resultDisplay)) {
    update["rawOutput"] = options.resultDisplay;
  }
  return update;
}
__name(createTranscriptToolCallResultUpdate, "createTranscriptToolCallResultUpdate");
function createTranscriptPlanUpdate(todos, cumulativeUsage, options = {}) {
  const meta = buildUpdateMeta({
    ...options,
    extra: {
      ...cumulativeUsage ? { stats: { ...cumulativeUsage } } : {},
      ...options.todoPlanId ? { qwenTodoPlan: { id: options.todoPlanId } } : {},
      ...options.extra ?? {}
    }
  });
  return {
    sessionUpdate: "plan",
    entries: todos.map((todo) => ({
      content: todo.content,
      priority: "medium",
      status: todo.status,
      ...todo.id || todo.blockedBy ? {
        _meta: {
          qwenTodo: {
            ...todo.id ? { id: todo.id } : {},
            ...todo.blockedBy ? { blockedBy: [...todo.blockedBy] } : {}
          }
        }
      } : {}
    })),
    ...meta ? { _meta: meta } : {}
  };
}
__name(createTranscriptPlanUpdate, "createTranscriptPlanUpdate");
function extractTranscriptTodoPlan(resultDisplay, args) {
  const fromDisplay = extractTodoPlanFromDisplay(resultDisplay);
  if (fromDisplay) return fromDisplay;
  if (resultDisplay !== null && resultDisplay !== void 0) return null;
  return args && Array.isArray(args["todos"]) ? { todos: normalizeTodos(args["todos"]) } : null;
}
__name(extractTranscriptTodoPlan, "extractTranscriptTodoPlan");
function createTranscriptReplayMachine(options = {}) {
  return new DefaultTranscriptReplayMachine(options);
}
__name(createTranscriptReplayMachine, "createTranscriptReplayMachine");
var DefaultTranscriptReplayMachine = class {
  constructor(options) {
    this.options = options;
    const initialState = parseInitialState(
      options.initialState,
      options.onDiagnostic
    );
    this.usage = { ...initialState.cumulativeUsage };
    this.goalState = initialState.goalState;
    this.goalCause = initialState.goalCause;
    for (const pending of initialState.pendingToolCalls) {
      this.pendingToolCalls.set(pending.callId, pending);
      this.usedToolCallIds.add(pending.callId);
    }
    for (const gap of options.gaps ?? []) {
      if (!this.gapByChild.has(gap.childUuid)) {
        this.gapByChild.set(gap.childUuid, gap);
      }
    }
  }
  static {
    __name(this, "DefaultTranscriptReplayMachine");
  }
  pendingToolCalls = /* @__PURE__ */ new Map();
  usedToolCallIds = /* @__PURE__ */ new Set();
  gapByChild = /* @__PURE__ */ new Map();
  usage;
  finalized = false;
  goalState;
  goalCause;
  *project(record) {
    if (this.finalized) {
      throw new Error(
        "Cannot project records after transcript replay finalize."
      );
    }
    let ordinal = 0;
    const emit = /* @__PURE__ */ __name((update) => ({
      sourceRecordId: record.uuid,
      ...record.timestamp ? { sourceTimestamp: record.timestamp } : {},
      emissionOrdinal: ordinal++,
      update
    }), "emit");
    const meta = {
      timestamp: record.timestamp,
      sourceRecordIds: [record.uuid],
      ...record.subtype === "realtime_message" ? {
        extra: {
          source: "realtime_voice",
          qwenDiscreteMessage: true
        }
      } : {}
    };
    const gap = this.gapByChild.get(record.uuid);
    if (gap) {
      yield emit(
        createTranscriptMessageUpdate({
          role: "assistant",
          text: this.formatGap(gap),
          ...meta,
          extra: { qwenDiscreteMessage: true }
        })
      );
    }
    switch (record.type) {
      case "user":
        yield* this.projectUserRecord(record, emit, meta);
        break;
      case "assistant":
        yield* this.projectAssistantRecord(record, emit, meta);
        break;
      case "tool_result":
        yield* this.projectToolResult(record, emit, meta);
        break;
      case "system":
        yield* this.projectSystemRecord(record, emit, meta);
        break;
      default:
        this.report(
          "unknown_record_or_part",
          "Skipped an unknown transcript record type.",
          record.uuid
        );
    }
  }
  *finalize() {
    if (this.finalized) return;
    this.finalized = true;
    const skip = this.options.skipFinalizeCallIds;
    let ordinal = 0;
    for (const pending of [...this.pendingToolCalls.values()]) {
      if (skip && (skip.has(pending.callId) || pending.rawCallId !== void 0 && skip.has(pending.rawCallId)))
        continue;
      this.pendingToolCalls.delete(pending.callId);
      this.report(
        "missing_tool_result",
        "A transcript tool call has no persisted result.",
        pending.sourceRecordId
      );
      yield {
        sourceRecordId: pending.sourceRecordId,
        ...pending.sourceTimestamp ? { sourceTimestamp: pending.sourceTimestamp } : {},
        emissionOrdinal: ordinal++,
        update: createTranscriptToolCallResultUpdate({
          toolName: pending.toolName,
          callId: pending.callId,
          success: false,
          errorMessage: MISSING_TRANSCRIPT_TOOL_RESULT_MESSAGE,
          timestamp: pending.sourceTimestamp,
          sourceRecordIds: [pending.sourceRecordId]
        })
      };
    }
  }
  snapshot() {
    return {
      v: 1,
      pendingToolCalls: [...this.pendingToolCalls.values()].map((pending) => ({
        ...pending
      })),
      cumulativeUsage: { ...this.usage },
      ...this.goalState ? { goalState: this.goalState } : {},
      ...this.goalCause ? { goalCause: this.goalCause } : {}
    };
  }
  *projectUserRecord(record, emit, meta) {
    const payload = isObjectRecord(record.systemPayload) ? record.systemPayload : void 0;
    const replayMeta = record.subtype === "mid_turn_user_message" ? {
      ...meta,
      extra: {
        ...meta.extra,
        source: "mid_turn_message_injected",
        qwenDiscreteMessage: true
      }
    } : meta;
    if (record.subtype === "goal_runtime" || record.subtype === "notification" || record.subtype === "cron" || record.subtype === "mid_turn_user_message") {
      const displayText = payload && typeof payload["displayText"] === "string" ? stripGeneratedAttachmentTokens(payload["displayText"], payload) : void 0;
      if (record.subtype === "mid_turn_user_message" && displayText === "") {
        const media = [
          ...this.projectUserAttachmentReferences(payload, emit, replayMeta)
        ];
        if (media.length > 0) {
          yield* media;
          return;
        }
      }
      if (displayText) {
        const isNotification = record.subtype === "notification";
        const backgroundTask = payload && isObjectRecord(payload["backgroundTask"]) ? payload["backgroundTask"] : void 0;
        yield emit(
          createTranscriptMessageUpdate({
            role: "user",
            text: displayText,
            ...replayMeta,
            ...isNotification ? {
              extra: {
                source: "background_notification",
                qwenDiscreteMessage: true,
                ...backgroundTask ? { backgroundTask } : {}
              }
            } : record.subtype === "cron" ? { extra: { source: "cron" } } : {}
          })
        );
        yield* this.projectUserAttachmentReferences(payload, emit, replayMeta);
        return;
      }
      if (record.subtype !== "mid_turn_user_message") return;
    }
    const projection = projectUserTranscriptForDisplay(record);
    if (projection.displayText !== void 0) {
      const displayText = stripGeneratedAttachmentTokens(
        projection.displayText,
        payload
      );
      yield* this.projectMessageParts(
        record,
        "user",
        emit,
        replayMeta,
        void 0,
        replaceTextPartsForDisplay(record.message?.parts, displayText)
      );
      yield* this.projectUserAttachmentReferences(payload, emit, replayMeta);
      return;
    }
    yield* this.projectMessageParts(
      record,
      "user",
      emit,
      replayMeta,
      void 0,
      projection.parts
    );
    yield* this.projectUserAttachmentReferences(payload, emit, replayMeta);
  }
  *projectUserAttachmentReferences(payload, emit, meta) {
    const references = payload?.["attachmentReferences"];
    if (!Array.isArray(references)) return;
    for (const reference of references) {
      if (!isObjectRecord(reference)) continue;
      const update = createTranscriptAttachmentReferenceUpdate(reference, meta);
      if (update) yield emit(update);
    }
  }
  *projectAssistantRecord(record, emit, meta) {
    const usageMetadata = isObjectRecord(record.usageMetadata) ? record.usageMetadata : void 0;
    let usageEmitted = false;
    const takeUsageUpdate = /* @__PURE__ */ __name(() => {
      if (!usageMetadata || usageEmitted) return void 0;
      usageEmitted = true;
      this.addUsage(usageMetadata);
      return createTranscriptUsageUpdate(usageMetadata, meta);
    }, "takeUsageUpdate");
    yield* this.projectMessageParts(
      record,
      "assistant",
      emit,
      meta,
      takeUsageUpdate
    );
    const trailingUsage = takeUsageUpdate();
    if (trailingUsage) yield emit(trailingUsage);
  }
  *projectMessageParts(record, role, emit, meta, beforeToolCall, partsOverride) {
    const parts = partsOverride ?? record.message?.parts;
    if (!parts) return;
    for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
      const part = parts[partIndex];
      if (!isObjectRecord(part)) {
        this.report(
          "malformed_part",
          "Skipped a malformed transcript message part.",
          record.uuid,
          `message.parts[${partIndex}]`
        );
        continue;
      }
      let recognized = false;
      if (typeof part["text"] === "string" && part["text"].length > 0) {
        recognized = true;
        yield emit(
          createTranscriptMessageUpdate({
            role,
            text: part["text"],
            thought: role === "assistant" && part["thought"] === true,
            ...meta
          })
        );
      }
      const inlineData = isObjectRecord(part["inlineData"]) ? part["inlineData"] : void 0;
      if (inlineData) {
        recognized = true;
        const data = inlineData["data"];
        const mimeType = inlineData["mimeType"];
        if (role === "user" && typeof data === "string" && typeof mimeType === "string" && mimeType.startsWith("image/")) {
          yield emit(createTranscriptImageUpdate({ data, mimeType, ...meta }));
        } else {
          this.report(
            "malformed_part",
            "Skipped an unsupported or malformed inline transcript part.",
            record.uuid,
            `message.parts[${partIndex}].inlineData`
          );
        }
      }
      const functionCall = isObjectRecord(part["functionCall"]) ? part["functionCall"] : void 0;
      if (functionCall) {
        recognized = true;
        const toolName = typeof functionCall["name"] === "string" ? functionCall["name"] : "";
        const args = isObjectRecord(functionCall["args"]) ? functionCall["args"] : {};
        if (!toolName) {
          this.report(
            "malformed_part",
            "Skipped a tool call without a tool name.",
            record.uuid,
            `message.parts[${partIndex}].functionCall`
          );
          continue;
        }
        const preToolUpdate = beforeToolCall?.();
        if (preToolUpdate) yield emit(preToolUpdate);
        if (toolName === "todo_write") continue;
        const explicitId = typeof functionCall["id"] === "string" && functionCall["id"].length > 0 ? functionCall["id"] : void 0;
        const callId = this.allocateToolCallId(
          explicitId ?? `qwen-replay-tool:${record.uuid}:${partIndex}`
        );
        const update = createTranscriptToolCallStartUpdate({
          toolName,
          callId,
          args,
          status: "in_progress",
          metadata: this.resolveToolMetadata(toolName, args, record.uuid),
          ...meta
        });
        yield emit(update);
        if (role === "assistant") {
          this.pendingToolCalls.set(callId, {
            callId,
            toolName,
            sourceRecordId: record.uuid,
            ...record.timestamp ? { sourceTimestamp: record.timestamp } : {},
            ...explicitId !== void 0 && explicitId !== callId ? { rawCallId: explicitId } : {}
          });
        }
      }
      if (!recognized && !("functionResponse" in part)) {
        this.report(
          "unknown_record_or_part",
          "Skipped an unknown transcript message part.",
          record.uuid,
          `message.parts[${partIndex}]`
        );
      }
    }
  }
  *projectToolResult(record, emit, meta) {
    const result = isObjectRecord(record.toolCallResult) ? record.toolCallResult : void 0;
    const toolName = extractToolName(record);
    if (!toolName) {
      this.report(
        "malformed_part",
        "A transcript tool result has no tool name.",
        record.uuid,
        "message.parts"
      );
    }
    const explicitCallId = extractToolResultCallId(record, result);
    const callId = explicitCallId ? this.allocateToolCallId(explicitCallId, true) : this.correlateResultCallId(toolName, record.uuid);
    this.pendingToolCalls.delete(callId);
    const resultDisplay = result?.["resultDisplay"];
    if (toolName === "todo_write") {
      const plan = extractTranscriptTodoPlan(resultDisplay);
      if (plan) {
        yield emit(
          createTranscriptPlanUpdate(plan.todos, this.usage, {
            ...meta,
            planToolCallId: callId,
            todoPlanId: plan.planId
          })
        );
      }
      return;
    }
    yield emit(
      createTranscriptToolCallResultUpdate({
        toolName,
        callId,
        success: result?.["status"] === void 0 ? !result?.["error"] : result["status"] === "success" && !result["error"],
        errorMessage: extractErrorMessage(result?.["error"]),
        message: record.message?.parts,
        resultDisplay,
        artifacts: Array.isArray(result?.["artifacts"]) ? result["artifacts"] : void 0,
        contentPrefix: this.buildToolResultContentPrefix(
          resultDisplay,
          record.uuid
        ),
        ...meta
      })
    );
    if (isTaskExecutionDisplay(resultDisplay)) {
      const usage = usageFromTaskExecution(resultDisplay);
      if (Object.keys(usage).length > 0) {
        this.addUsage(usage);
        yield emit(createTranscriptUsageUpdate(usage, meta));
      }
    }
  }
  *projectSystemRecord(record, emit, meta) {
    if (record.subtype === "goal_state") {
      const payload2 = parseGoalStateRecordPayloadV2(record.systemPayload);
      if (!payload2) {
        this.report(
          "malformed_goal_state",
          "Skipped a malformed Goal state transcript record.",
          record.uuid,
          "systemPayload"
        );
        return;
      }
      const bookkeepingOnly = isGoalCheckpointBookkeepingRecord({
        cause: payload2.cause,
        previousCause: this.goalCause,
        previous: this.goalState,
        next: payload2.snapshot
      });
      const projection = projectGoalStateToLegacy2(
        payload2,
        this.goalState?.goal ?? null
      );
      const goalControlCommand = projectGoalControlCommand(
        payload2.cause,
        payload2.snapshot
      );
      this.goalState = payload2.snapshot;
      this.goalCause = payload2.cause;
      if (bookkeepingOnly) return;
      if (goalControlCommand) {
        yield emit(
          createTranscriptMessageUpdate({
            role: "user",
            text: goalControlCommand,
            ...meta,
            extra: {
              source: "goal_control",
              "qwen.session.recordId": record.uuid
            }
          })
        );
      }
      const { type: _type, ...goalStatus } = projection.goalStatus;
      yield emit(
        createTranscriptMessageUpdate({
          role: "assistant",
          text: "",
          ...meta,
          extra: {
            goalState: payload2.snapshot,
            goalStatus,
            ...projection.goalTerminal ? { goalTerminal: projection.goalTerminal } : {},
            "qwen.session.recordId": record.uuid
          }
        })
      );
      return;
    }
    if (record.subtype !== "slash_command") return;
    const payload = isObjectRecord(record.systemPayload) ? record.systemPayload : void 0;
    if (payload?.["phase"] !== "result") return;
    const items = Array.isArray(payload["outputHistoryItems"]) ? payload["outputHistoryItems"] : [];
    for (const item of items) {
      const goalStatus = parseTranscriptGoalStatus(item);
      if (goalStatus) {
        if (goalStatus.condition.length === 0) {
          this.report(
            "malformed_part",
            "Skipped replay of a goal card whose condition is empty.",
            record.uuid,
            "systemPayload.outputHistoryItems.goalStatus.condition"
          );
        } else if (goalStatus.kind !== "checking") {
          yield emit(
            createTranscriptMessageUpdate({
              role: "assistant",
              text: "",
              ...meta,
              extra: { goalStatus }
            })
          );
        }
        continue;
      }
      if (!isObjectRecord(item) || typeof item["text"] !== "string") continue;
      yield emit(
        createTranscriptMessageUpdate({
          role: "assistant",
          text: item["text"].replace(/\n/g, "  \n"),
          ...meta,
          extra: { source: "slash_command" }
        })
      );
    }
  }
  addUsage(metadata) {
    this.usage.promptTokens += finiteNumber(metadata["promptTokenCount"]) ?? 0;
    this.usage.candidateTokens += finiteNumber(metadata["candidatesTokenCount"]) ?? 0;
    this.usage.cachedTokens += finiteNumber(metadata["cachedContentTokenCount"]) ?? 0;
  }
  correlateResultCallId(toolName, recordId) {
    const candidates = [...this.pendingToolCalls.values()].filter(
      (pending) => pending.toolName === toolName
    );
    if (candidates.length === 1) return candidates[0].callId;
    this.report(
      "ambiguous_tool_call_correlation",
      "A tool result could not be matched to exactly one pending tool call.",
      recordId
    );
    return this.allocateToolCallId(`qwen-replay-tool:${recordId}:result`);
  }
  allocateToolCallId(candidate, reuse = false) {
    if (reuse && this.pendingToolCalls.has(candidate)) {
      this.usedToolCallIds.add(candidate);
      return candidate;
    }
    if (!this.usedToolCallIds.has(candidate)) {
      this.usedToolCallIds.add(candidate);
      return candidate;
    }
    let occurrence = 2;
    while (this.usedToolCallIds.has(`${candidate}:${occurrence}`)) {
      occurrence += 1;
    }
    const id = `${candidate}:${occurrence}`;
    this.usedToolCallIds.add(id);
    return id;
  }
  resolveToolMetadata(toolName, args, recordId) {
    try {
      return this.options.presentation?.resolveToolMetadata(toolName, args) ?? fallbackToolMetadata(toolName, args);
    } catch {
      this.report(
        "presentation_fallback",
        "Tool presentation metadata fell back to deterministic defaults.",
        recordId,
        void 0,
        false
      );
      return fallbackToolMetadata(toolName, args);
    }
  }
  formatGap(gap) {
    try {
      return this.options.presentation?.formatHistoryGap(gap) ?? "Some earlier messages are unavailable because the saved history is incomplete.";
    } catch {
      this.report(
        "presentation_fallback",
        "History gap presentation fell back to deterministic defaults.",
        gap.childUuid,
        void 0,
        false
      );
      return "Some earlier messages are unavailable because the saved history is incomplete.";
    }
  }
  buildToolResultContentPrefix(resultDisplay, recordId) {
    try {
      return this.options.presentation?.buildToolResultContentPrefix?.(
        resultDisplay
      ) ?? defaultToolResultContentPrefix(resultDisplay);
    } catch {
      this.report(
        "presentation_fallback",
        "Tool result content presentation fell back to deterministic defaults.",
        recordId,
        void 0,
        false
      );
      return defaultToolResultContentPrefix(resultDisplay);
    }
  }
  report(code, message, recordId, path2, affectsCompleteness = true) {
    this.options.onDiagnostic?.({
      code,
      severity: affectsCompleteness ? "warning" : "info",
      message,
      affectsCompleteness,
      ...recordId ? { recordId } : {},
      ...path2 ? { path: path2 } : {}
    });
  }
};
function projectGoalControlCommand(cause, snapshot) {
  switch (cause) {
    case "create":
    case "replace":
      return snapshot.goal ? `/goal ${snapshot.goal.objective}` : void 0;
    case "edit":
      return snapshot.goal ? `/goal edit ${snapshot.goal.objective}` : void 0;
    case "pause":
    case "resume":
    case "clear":
      return `/goal ${cause}`;
    case "turn_finished":
    case "checkpoint":
    case "verifier_accept":
    case "verifier_reject":
    case "complete":
    case "blocked":
    case "usage_limited":
    case "migrated":
      return void 0;
    default:
      return assertNever2(cause);
  }
}
__name(projectGoalControlCommand, "projectGoalControlCommand");
function assertNever2(value) {
  throw new Error(`Unsupported Goal state cause: ${String(value)}`);
}
__name(assertNever2, "assertNever");
function parseTranscriptGoalStatus(value) {
  if (!isObjectRecord(value) || value["type"] !== "goal_status") {
    return void 0;
  }
  const kind = value["kind"];
  const condition = value["condition"];
  if (typeof kind !== "string" || !TRANSCRIPT_GOAL_STATUS_KINDS.has(kind) || typeof condition !== "string") {
    return void 0;
  }
  const iterations = finiteNumber(value["iterations"]);
  const setAt = finiteNumber(value["setAt"]);
  const durationMs = finiteNumber(value["durationMs"]);
  const lastReason = typeof value["lastReason"] === "string" ? value["lastReason"] : void 0;
  return {
    kind,
    condition,
    ...iterations !== void 0 ? { iterations } : {},
    ...setAt !== void 0 ? { setAt } : {},
    ...durationMs !== void 0 ? { durationMs } : {},
    ...lastReason !== void 0 ? { lastReason } : {}
  };
}
__name(parseTranscriptGoalStatus, "parseTranscriptGoalStatus");
function defaultToolResultContentPrefix(resultDisplay) {
  if (!isObjectRecord(resultDisplay) || resultDisplay["type"] !== "vision_bridge_notice" || typeof resultDisplay["summary"] !== "string" || typeof resultDisplay["notice"] !== "string") {
    return [];
  }
  return [
    {
      type: "content",
      content: {
        type: "text",
        text: `${resultDisplay["summary"]}
${resultDisplay["notice"]}`
      }
    }
  ];
}
__name(defaultToolResultContentPrefix, "defaultToolResultContentPrefix");
function parseInitialState(value, onDiagnostic) {
  const empty = {
    v: 1,
    pendingToolCalls: [],
    cumulativeUsage: emptyUsage()
  };
  if (value === void 0) return empty;
  if (!isObjectRecord(value)) {
    throw new TypeError("Invalid transcript replay state.");
  }
  if ("v" in value && value["v"] !== 1) {
    throw new TypeError("Unsupported transcript replay state version.");
  }
  const rawPending = Array.isArray(value["pendingToolCalls"]) ? value["pendingToolCalls"] : [];
  const pendingToolCalls = rawPending.flatMap(
    (pending) => {
      if (!isObjectRecord(pending) || typeof pending["callId"] !== "string" || typeof pending["toolName"] !== "string" || typeof pending["sourceRecordId"] !== "string") {
        onDiagnostic?.({
          code: "invalid_replay_state",
          severity: "warning",
          message: "Dropped a malformed pending tool call from replay state.",
          affectsCompleteness: true
        });
        return [];
      }
      return [
        {
          callId: pending["callId"],
          toolName: pending["toolName"],
          sourceRecordId: pending["sourceRecordId"],
          ...typeof pending["sourceTimestamp"] === "string" ? { sourceTimestamp: pending["sourceTimestamp"] } : {}
        }
      ];
    }
  );
  const rawUsage = value.cumulativeUsage;
  const usage = isObjectRecord(rawUsage) ? rawUsage : {};
  const validUsage = finiteNumber(usage["promptTokens"]) !== void 0 && finiteNumber(usage["cachedTokens"]) !== void 0 && finiteNumber(usage["candidateTokens"]) !== void 0 && finiteNumber(usage["apiTimeMs"]) !== void 0;
  if (!validUsage) {
    onDiagnostic?.({
      code: "invalid_replay_state",
      severity: "warning",
      message: "Reset invalid cumulative usage in transcript replay state.",
      affectsCompleteness: true
    });
  }
  const rawGoalState = value["goalState"];
  const goalState = rawGoalState === void 0 ? void 0 : parseGoalSnapshotV22(rawGoalState);
  if (rawGoalState !== void 0 && !goalState) {
    onDiagnostic?.({
      code: "invalid_replay_state",
      severity: "warning",
      message: "Dropped a malformed Goal state from replay state.",
      affectsCompleteness: true
    });
  }
  const rawGoalCause = value["goalCause"];
  const goalCause = rawGoalCause === void 0 ? void 0 : parseGoalStateCause2(rawGoalCause);
  if (rawGoalCause !== void 0 && !goalCause) {
    onDiagnostic?.({
      code: "invalid_replay_state",
      severity: "warning",
      message: "Dropped a malformed Goal cause from replay state.",
      affectsCompleteness: true
    });
  }
  return {
    v: 1,
    pendingToolCalls,
    cumulativeUsage: validUsage ? {
      promptTokens: usage["promptTokens"],
      cachedTokens: usage["cachedTokens"],
      candidateTokens: usage["candidateTokens"],
      apiTimeMs: usage["apiTimeMs"]
    } : emptyUsage(),
    ...goalState ? { goalState } : {},
    ...goalCause ? { goalCause } : {}
  };
}
__name(parseInitialState, "parseInitialState");
function emptyUsage() {
  return {
    promptTokens: 0,
    cachedTokens: 0,
    candidateTokens: 0,
    apiTimeMs: 0
  };
}
__name(emptyUsage, "emptyUsage");
function fallbackToolMetadata(toolName, args) {
  const description = typeof args["description"] === "string" ? args["description"].trim() : "";
  return {
    title: description ? `${toolName}: ${description}` : toolName,
    locations: [],
    kind: "other"
  };
}
__name(fallbackToolMetadata, "fallbackToolMetadata");
function resolveToolProvenance(toolName) {
  if (toolName.startsWith("mcp__")) {
    const parts = toolName.split("__");
    if (parts.length >= 3 && parts[1]) {
      return { provenance: "mcp", serverId: parts[1] };
    }
  }
  return { provenance: "builtin" };
}
__name(resolveToolProvenance, "resolveToolProvenance");
function buildToolResultContent(options) {
  const prefix = [...options.contentPrefix ?? []];
  const diff = extractDiffContent(options.resultDisplay);
  if (diff) return [...prefix, diff];
  if (options.errorMessage) {
    return [
      ...prefix,
      {
        type: "content",
        content: { type: "text", text: options.errorMessage }
      }
    ];
  }
  const content = [...prefix];
  for (const part of options.message ?? []) {
    if (!isObjectRecord(part)) continue;
    if (typeof part["text"] === "string" && part["text"]) {
      content.push({
        type: "content",
        content: { type: "text", text: part["text"] }
      });
    }
    const response = isObjectRecord(part["functionResponse"]) ? part["functionResponse"] : void 0;
    const payload = response && isObjectRecord(response["response"]) ? response["response"] : void 0;
    if (!payload) continue;
    try {
      const output = payload["output"];
      const error = payload["error"];
      const text = typeof output === "string" ? output : typeof error === "string" ? error : JSON.stringify(payload);
      content.push({
        type: "content",
        content: { type: "text", text }
      });
    } catch {
    }
  }
  return content;
}
__name(buildToolResultContent, "buildToolResultContent");
function extractDiffContent(resultDisplay) {
  if (!isObjectRecord(resultDisplay)) return null;
  if (!("fileName" in resultDisplay) || !("newContent" in resultDisplay)) {
    return null;
  }
  if (isTruncatedSessionDiffDisplay(resultDisplay)) {
    return {
      type: "content",
      content: {
        type: "text",
        text: buildTruncatedDiffPreviewText(resultDisplay)
      }
    };
  }
  return {
    type: "diff",
    path: typeof resultDisplay["fileName"] === "string" ? resultDisplay["fileName"] : "",
    oldText: typeof resultDisplay["originalContent"] === "string" ? resultDisplay["originalContent"] : "",
    newText: typeof resultDisplay["newContent"] === "string" ? resultDisplay["newContent"] : ""
  };
}
__name(extractDiffContent, "extractDiffContent");
function isTruncatedSessionDiffDisplay(value) {
  return isObjectRecord(value) && value["truncatedForSession"] === true && "fileName" in value && "newContent" in value;
}
__name(isTruncatedSessionDiffDisplay, "isTruncatedSessionDiffDisplay");
function buildTruncatedDiffPreviewText(display) {
  const fileName = typeof display["fileName"] === "string" ? display["fileName"] : "the edited file";
  const fileDiffLength = typeof display["fileDiffLength"] === "number" ? ` Original fileDiff length: ${display["fileDiffLength"]} chars.` : "";
  return display["fileDiffTruncated"] === true ? `Full diff omitted from saved session history for ${fileName}.${fileDiffLength}` : `Saved session preview only for ${fileName}; full original and new file contents are unavailable.`;
}
__name(buildTruncatedDiffPreviewText, "buildTruncatedDiffPreviewText");
function extractToolName(record) {
  for (const part of record.message?.parts ?? []) {
    if (!isObjectRecord(part) || !isObjectRecord(part["functionResponse"])) {
      continue;
    }
    const name = part["functionResponse"]["name"];
    if (typeof name === "string") return name;
  }
  return "";
}
__name(extractToolName, "extractToolName");
function extractToolResultCallId(record, result) {
  if (typeof result?.["callId"] === "string" && result["callId"].length > 0) {
    return result["callId"];
  }
  for (const part of record.message?.parts ?? []) {
    if (!isObjectRecord(part) || !isObjectRecord(part["functionResponse"])) {
      continue;
    }
    const id = part["functionResponse"]["id"];
    if (typeof id === "string" && id.length > 0) return id;
  }
  return void 0;
}
__name(extractToolResultCallId, "extractToolResultCallId");
function extractTodoPlanFromDisplay(value) {
  if (isObjectRecord(value) && value["type"] === "todo_list") {
    return Array.isArray(value["todos"]) ? {
      ...typeof value["planId"] === "string" ? { planId: value["planId"] } : {},
      todos: normalizeTodos(value["todos"])
    } : null;
  }
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    return isObjectRecord(parsed) && parsed["type"] === "todo_list" && Array.isArray(parsed["todos"]) ? {
      ...typeof parsed["planId"] === "string" ? { planId: parsed["planId"] } : {},
      todos: normalizeTodos(parsed["todos"])
    } : null;
  } catch {
    return null;
  }
}
__name(extractTodoPlanFromDisplay, "extractTodoPlanFromDisplay");
function normalizeTodos(values) {
  return values.flatMap((value) => {
    if (!isObjectRecord(value) || typeof value["content"] !== "string")
      return [];
    const status = value["status"];
    if (status !== "pending" && status !== "in_progress" && status !== "completed") {
      return [];
    }
    return [
      {
        ...typeof value["id"] === "string" ? { id: value["id"] } : {},
        content: value["content"],
        status,
        ...Array.isArray(value["blockedBy"]) && value["blockedBy"].every((dependency) => typeof dependency === "string") ? { blockedBy: value["blockedBy"] } : {}
      }
    ];
  });
}
__name(normalizeTodos, "normalizeTodos");
function isTaskExecutionDisplay(value) {
  return isObjectRecord(value) && value["type"] === "task_execution";
}
__name(isTaskExecutionDisplay, "isTaskExecutionDisplay");
function usageFromTaskExecution(display) {
  const summary = isObjectRecord(display["executionSummary"]) ? display["executionSummary"] : void 0;
  if (!summary) return {};
  return {
    ...finiteNumber(summary["inputTokens"]) !== void 0 ? { promptTokenCount: summary["inputTokens"] } : {},
    ...finiteNumber(summary["outputTokens"]) !== void 0 ? { candidatesTokenCount: summary["outputTokens"] } : {},
    ...finiteNumber(summary["thoughtTokens"]) !== void 0 ? { thoughtsTokenCount: summary["thoughtTokens"] } : {},
    ...finiteNumber(summary["cachedTokens"]) !== void 0 ? { cachedContentTokenCount: summary["cachedTokens"] } : {},
    ...finiteNumber(summary["totalTokens"]) !== void 0 ? { totalTokenCount: summary["totalTokens"] } : {}
  };
}
__name(usageFromTaskExecution, "usageFromTaskExecution");
function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
__name(finiteNumber, "finiteNumber");
function extractErrorMessage(value) {
  if (value instanceof Error) return value.message;
  if (!isObjectRecord(value)) return void 0;
  return typeof value["message"] === "string" ? value["message"] : void 0;
}
__name(extractErrorMessage, "extractErrorMessage");
function dedupeStrings(values) {
  return [...new Set(values.filter((value) => value.length > 0))];
}
__name(dedupeStrings, "dedupeStrings");

// packages/cli/src/acp-integration/session/emitters/tool-call-emitter.ts
init_esbuild_shims();

// packages/cli/src/acp-integration/session/emitters/base-emitter.ts
init_esbuild_shims();
var BaseEmitter = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  static {
    __name(this, "BaseEmitter");
  }
  /**
   * Converts an ISO timestamp string or epoch ms to epoch ms number.
   * Returns undefined if the input is not a valid timestamp.
   */
  static toEpochMs(ts) {
    if (typeof ts === "number") {
      return Number.isFinite(ts) ? ts : void 0;
    }
    if (typeof ts === "string") {
      const ms = new Date(ts).getTime();
      return Number.isFinite(ms) ? ms : void 0;
    }
    return void 0;
  }
  /**
   * Sends a session update to the ACP client.
   * If a message rewriter is configured, updates pass through it first
   * (original messages are sent as-is, rewritten versions are appended).
   */
  async sendUpdate(update) {
    if (this.ctx.messageRewriter) {
      return this.ctx.messageRewriter.interceptUpdate(update);
    }
    return this.ctx.sendUpdate(update);
  }
  /**
   * Gets the session ID.
   */
  get sessionId() {
    return this.ctx.sessionId;
  }
};

// packages/cli/src/acp-integration/session/emitters/PlanEmitter.ts
init_esbuild_shims();
var PlanEmitter = class extends BaseEmitter {
  static {
    __name(this, "PlanEmitter");
  }
  /**
   * Emits a plan update with the given todo items.
   *
   * @param plan - Plan identity and todo items to send as plan entries
   */
  async emitPlan(plan, sourceCallId) {
    const cumulative = this.ctx.cumulativeUsage;
    await this.sendUpdate(
      createTranscriptPlanUpdate(plan.todos, cumulative, {
        planToolCallId: sourceCallId,
        todoPlanId: plan.planId
      })
    );
  }
  /**
   * Extracts todos from tool result display or args.
   * Tries multiple sources in priority order:
   * 1. Result display object with type 'todo_list'
   * 2. Result display as JSON string
   * 3. Args with 'todos' array when no result display is available
   *
   * @param resultDisplay - The tool result display (object, string, or undefined)
   * @param args - The tool call arguments (fallback source)
   * @returns Plan snapshot if found, null otherwise
   */
  extractPlan(resultDisplay, args) {
    const plan = extractTranscriptTodoPlan(resultDisplay, args);
    if (!plan) return null;
    return {
      ...plan.planId ? { planId: plan.planId } : {},
      todos: plan.todos.map((todo, index) => ({
        id: todo.id ?? String(index),
        content: todo.content,
        status: todo.status,
        ...todo.blockedBy ? { blockedBy: [...todo.blockedBy] } : {}
      }))
    };
  }
};

// packages/cli/src/acp-integration/session/types.ts
init_esbuild_shims();
function hasFullSessionContext(context) {
  return "config" in context;
}
__name(hasFullSessionContext, "hasFullSessionContext");

// packages/cli/src/acp-integration/session/emitters/tool-call-emitter.ts
var KIND_MAP = {
  ["read" /* Read */]: "read",
  ["edit" /* Edit */]: "edit",
  ["delete" /* Delete */]: "delete",
  ["move" /* Move */]: "move",
  ["search" /* Search */]: "search",
  ["execute" /* Execute */]: "execute",
  ["think" /* Think */]: "think",
  ["fetch" /* Fetch */]: "fetch",
  // ACP defines no 'agent' ToolKind (verified through @agentclientprotocol/sdk
  // 0.25.1). The daemon's ClientSideConnection Zod-validates every session/update
  // and session/request_permission from the `qwen --acp` child before fanning out
  // to SSE clients, so emitting 'agent' is rejected at that hop and the frame is
  // dropped. Map the internal Kind.Agent to 'other' on the wire to stay
  // protocol-valid; dedicated agent UI is delivered out-of-band (via _meta.toolName)
  // in a follow-up rather than via a kind the protocol can't carry.
  ["agent" /* Agent */]: "other",
  ["other" /* Other */]: "other"
};
function stripBoundaryArtifactsFromRawOutput(resultDisplay) {
  if (typeof resultDisplay !== "object" || resultDisplay === null || !("type" in resultDisplay) || resultDisplay.type !== "task_execution" || !("toolCalls" in resultDisplay) || !Array.isArray(resultDisplay.toolCalls)) {
    return resultDisplay;
  }
  let changed = false;
  const toolCalls = resultDisplay.toolCalls.map((toolCall) => {
    if (typeof toolCall !== "object" || toolCall === null || !("boundaryArtifact" in toolCall)) {
      return toolCall;
    }
    const rawOutputToolCall = { ...toolCall };
    delete rawOutputToolCall["boundaryArtifact"];
    changed = true;
    return rawOutputToolCall;
  });
  return changed ? { ...resultDisplay, toolCalls } : resultDisplay;
}
__name(stripBoundaryArtifactsFromRawOutput, "stripBoundaryArtifactsFromRawOutput");
var ToolCallEmitter = class _ToolCallEmitter extends BaseEmitter {
  static {
    __name(this, "ToolCallEmitter");
  }
  planEmitter;
  preparedCallIds = /* @__PURE__ */ new Set();
  constructor(ctx) {
    super(ctx);
    this.planEmitter = new PlanEmitter(ctx);
  }
  /**
   * Emits a tool call start event.
   *
   * @param params - Tool call start parameters
   * @returns true if event was emitted, false if skipped (e.g., TodoWriteTool)
   */
  async emitStart(params) {
    if (this.isTodoWriteTool(params.toolName)) {
      return false;
    }
    if (params.phase === "preparing" && this.preparedCallIds.has(params.callId)) {
      return false;
    }
    const { title, locations, kind } = this.resolveToolMetadata(
      params.toolName,
      params.args
    );
    const provenance = _ToolCallEmitter.resolveToolProvenance(
      params.toolName,
      params.subagentMeta
    );
    const updatesPreparedCall = params.phase !== "preparing" && this.preparedCallIds.delete(params.callId);
    await this.sendUpdate(
      createTranscriptToolCallStartUpdate({
        toolName: params.toolName,
        callId: params.callId,
        status: params.status || "pending",
        args: params.args,
        metadata: { title, locations, kind },
        timestamp: params.timestamp,
        asUpdate: updatesPreparedCall,
        extra: {
          ...params.phase ? { phase: params.phase } : {},
          ...params.subagentMeta,
          provenance: provenance.provenance,
          ...provenance.serverId ? { serverId: provenance.serverId } : {}
        }
      })
    );
    if (params.phase === "preparing") {
      this.preparedCallIds.add(params.callId);
    }
    return true;
  }
  /**
   * Emits a terminal frame when a prepared tool call is discarded before
   * execution. TodoWrite remains represented exclusively by plan updates.
   *
   * @param callId - ID of the prepared tool call
   * @param toolName - Name of the prepared tool
   */
  async emitPreparationDiscarded(callId, toolName) {
    if (this.isTodoWriteTool(toolName)) return;
    this.preparedCallIds.delete(callId);
    const provenance = _ToolCallEmitter.resolveToolProvenance(toolName);
    await this.sendUpdate({
      sessionUpdate: "tool_call_update",
      toolCallId: callId,
      status: "failed",
      content: [],
      _meta: {
        toolName,
        phase: "preparing",
        preparationDiscarded: true,
        provenance: provenance.provenance,
        ...provenance.serverId ? { serverId: provenance.serverId } : {}
      }
    });
  }
  /**
   * Emits a tool call result event.
   * Handles TodoWriteTool specially by routing to plan updates.
   *
   * @param params - Tool call result parameters
   */
  async emitResult(params) {
    if (this.isTodoWriteTool(params.toolName)) {
      if (params.subagentMeta) return;
      if (!params.success) return;
      const plan = this.planEmitter.extractPlan(
        params.resultDisplay,
        params.args
      );
      if (plan && (plan.todos.length > 0 || params.args && Array.isArray(params.args["todos"]))) {
        await this.planEmitter.emitPlan(plan, params.callId);
      }
      return;
    }
    this.preparedCallIds.delete(params.callId);
    const provenance = _ToolCallEmitter.resolveToolProvenance(
      params.toolName,
      params.subagentMeta
    );
    const update = createTranscriptToolCallResultUpdate({
      toolName: params.toolName,
      callId: params.callId,
      success: params.success,
      message: params.message,
      resultDisplay: stripBoundaryArtifactsFromRawOutput(params.resultDisplay),
      errorMessage: params.error?.message,
      artifacts: params.artifacts,
      contentPrefix: buildToolResultContentPrefix(params.resultDisplay),
      timestamp: params.timestamp,
      extra: {
        ...params.subagentMeta,
        provenance: provenance.provenance,
        ...provenance.serverId ? { serverId: provenance.serverId } : {}
      }
    });
    associateAcpToolResultArtifact(
      update,
      params.boundaryArtifact ?? toolResultBoundaryArtifact(
        params.persistedOutputFiles,
        params.artifacts
      )
    );
    await this.sendUpdate(update);
  }
  /**
   * Emits a tool call error event.
   * Use this for explicit error handling when not using emitResult.
   *
   * @param callId - The tool call ID
   * @param toolName - The tool name
   * @param error - The error that occurred
   * @param subagentMeta - Optional subagent metadata
   */
  async emitError(callId, toolName, error, subagentMeta) {
    this.preparedCallIds.delete(callId);
    const provenance = _ToolCallEmitter.resolveToolProvenance(
      toolName,
      subagentMeta
    );
    await this.sendUpdate(
      createTranscriptToolCallResultUpdate({
        toolName,
        callId,
        success: false,
        errorMessage: error.message,
        extra: {
          ...subagentMeta,
          provenance: provenance.provenance,
          ...provenance.serverId ? { serverId: provenance.serverId } : {}
        }
      })
    );
  }
  /**
   * Resolve a tool's provenance for UI dispatch on tool_call events.
   * The SDK reads `_meta.
   * provenance` + `_meta.serverId` to render builtin / MCP-server-badge /
   * subagent-block differently. Without this stamping, the SDK falls
   * back to string-matching the toolName which can't reliably
   * distinguish builtin from subagent.
   *
   * Resolution rules:
   *   - `subagentMeta` present → `'subagent'` (a Task tool / Codex
   *     subagent / etc. wrapping its own tool calls)
   *   - toolName matches `mcp__<server>__<tool>` → `'mcp'` with
   *     `serverId: <server>`. Naming convention from
   *     `packages/core/src/tools/mcp-tool.ts` in the
   *     `@qwen-code/qwen-code-core` package — mirrors the SDK's same
   *     heuristic fallback so SDK consumers stay consistent with
   *     daemon classification.
   *   - everything else → `'builtin'`
   *
   * Static + pure so it can be unit-tested without an emitter
   * instance. Exported via `ToolCallEmitter.resolveToolProvenance`.
   */
  static resolveToolProvenance(toolName, subagentMeta) {
    if (subagentMeta !== void 0) {
      return { provenance: "subagent" };
    }
    if (toolName.startsWith("mcp__")) {
      const parts = toolName.split("__");
      if (parts.length >= 3 && parts[1] && parts[1].length > 0) {
        return { provenance: "mcp", serverId: parts[1] };
      }
    }
    return { provenance: "builtin" };
  }
  // ==================== Public Utilities ====================
  /**
   * Checks if a tool name is the TodoWriteTool.
   * Exposed for external use in components that need to check this.
   */
  isTodoWriteTool(toolName) {
    return toolName === ToolNames.TODO_WRITE;
  }
  /**
   * Checks if a tool name is the ExitPlanModeTool.
   */
  isExitPlanModeTool(toolName) {
    return toolName === ToolNames.EXIT_PLAN_MODE;
  }
  /**
   * Checks if a tool name is the EnterPlanModeTool.
   */
  isEnterPlanModeTool(toolName) {
    return toolName === ToolNames.ENTER_PLAN_MODE;
  }
  /**
   * Resolves tool metadata from the registry.
   * Falls back to defaults if tool not found or build fails.
   *
   * @param toolName - Name of the tool
   * @param args - Tool call arguments (used to build invocation)
   */
  resolveToolMetadata(toolName, args) {
    if (!hasFullSessionContext(this.ctx)) {
      const description = typeof args?.["description"] === "string" ? args["description"].trim() : "";
      return {
        title: description ? `${toolName}: ${description}` : toolName,
        locations: [],
        kind: "other"
      };
    }
    const toolRegistry = this.ctx.config.getToolRegistry();
    const tool = toolRegistry.getTool(toolName);
    let title = tool?.displayName ?? toolName;
    let locations = [];
    let kind = "other";
    if (tool && args) {
      try {
        const invocation = tool.build(args);
        title = `${title}: ${invocation.getDescription()}`;
        locations = invocation.toolLocations().map((loc) => ({
          path: loc.path,
          line: loc.line ?? null
        }));
        kind = this.mapToolKind(tool.kind, toolName);
      } catch {
        if (typeof args["description"] === "string") {
          title = `${title}: ${args["description"]}`;
        }
        if (tool.kind) {
          kind = this.mapToolKind(tool.kind, toolName);
        }
      }
    }
    return { title, locations, kind };
  }
  /**
   * Maps core Tool Kind enum to ACP ToolKind string literals.
   *
   * @param kind - The core Kind enum value
   * @param toolName - Optional tool name to handle special cases like exit_plan_mode
   */
  mapToolKind(kind, toolName) {
    if (toolName && (this.isExitPlanModeTool(toolName) || this.isEnterPlanModeTool(toolName))) {
      return "switch_mode";
    }
    return KIND_MAP[kind] ?? "other";
  }
};
function buildToolResultContentPrefix(resultDisplay) {
  if (!isVisionBridgeNoticeDisplay(resultDisplay)) return [];
  return [
    {
      type: "content",
      content: {
        type: "text",
        text: sanitizeTerminalText(
          formatVisionBridgeNoticeDisplay(resultDisplay)
        )
      }
    }
  ];
}
__name(buildToolResultContentPrefix, "buildToolResultContentPrefix");

// packages/cli/src/acp-integration/session/history-replayer.ts
var HistoryReplayer = class {
  constructor(ctx) {
    this.ctx = ctx;
    this.toolCallEmitter = new ToolCallEmitter(ctx);
    this.machine = this.createMachine();
  }
  static {
    __name(this, "HistoryReplayer");
  }
  toolCallEmitter;
  machine;
  async replay(records, gaps, options = {}) {
    try {
      if (options.goalBootstrap) {
        const update = {
          sessionUpdate: "agent_message_chunk",
          content: { type: "text", text: "" },
          _meta: {
            ...options.goalBootstrap.goalState ? { goalState: options.goalBootstrap.goalState } : {},
            goalStatus: options.goalBootstrap.goalStatus
          }
        };
        await this.sendUpdate(update);
      }
      await this.replayPage(records, {
        finalizeDangling: options.finalizeDangling ?? true,
        gaps,
        ...options.skipFinalizeCallIds ? { skipFinalizeCallIds: options.skipFinalizeCallIds } : {},
        ...options.initialGoalState ? { goalState: options.initialGoalState } : {},
        ...options.initialGoalCause ? { goalCause: options.initialGoalCause } : {}
      });
    } finally {
      this.setActiveRecordId(null);
    }
  }
  static v2GoalBootstrap(rawGoalState, rawGoalCause) {
    const goalState = parseGoalSnapshotV2(rawGoalState);
    const goalCause = parseGoalStateCause(rawGoalCause);
    if (!goalState?.goal || goalState.goal.status !== "active" || !goalCause) {
      return void 0;
    }
    const projection = projectGoalStateToLegacy({
      v: 2,
      cause: goalCause,
      snapshot: goalState
    });
    const { type: _type, kind, ...goalStatus } = projection.goalStatus;
    if (kind !== "set" && kind !== "checking") {
      return void 0;
    }
    return { goalStatus: { ...goalStatus, kind }, goalState };
  }
  async replayPage(records, options = {}) {
    this.machine = this.createMachine(options);
    let replayError;
    try {
      for (const record of records) {
        for (const emission of this.machine.project(record)) {
          this.setActiveRecordId(
            emission.sourceRecordId,
            emission.sourceTimestamp
          );
          await this.sendUpdate(emission.update);
        }
      }
    } catch (error) {
      replayError = error;
    }
    let danglingError;
    if (options.finalizeDangling === true) {
      for (const emission of this.machine.finalize()) {
        this.setActiveRecordId(
          emission.sourceRecordId,
          emission.sourceTimestamp
        );
        try {
          await this.sendUpdate(emission.update);
        } catch (error) {
          danglingError ??= error;
        }
      }
    }
    const replay = this.machine.snapshot();
    this.copyCumulativeUsage(replay);
    const state = {
      pendingToolCalls: replay.pendingToolCalls.map(toLegacyPendingToolCall),
      replay
    };
    this.setActiveRecordId(null);
    if (replayError && danglingError) {
      throw new AggregateError(
        [replayError, danglingError],
        "Replay and dangling-cleanup both failed"
      );
    }
    if (replayError) throw replayError;
    if (danglingError) throw danglingError;
    return state;
  }
  getPendingToolCalls() {
    return this.machine.snapshot().pendingToolCalls.map(toLegacyPendingToolCall);
  }
  getReplayState() {
    return this.machine.snapshot();
  }
  createMachine(options = {}) {
    const cumulative = this.ctx.cumulativeUsage;
    const initialState = {
      v: 1,
      pendingToolCalls: (options.pendingToolCalls ?? []).map(
        toPendingTranscriptToolCall
      ),
      cumulativeUsage: cumulative ? { ...cumulative } : {
        promptTokens: 0,
        cachedTokens: 0,
        candidateTokens: 0,
        apiTimeMs: 0
      },
      ...options.goalState ? { goalState: options.goalState } : {},
      ...options.goalCause ? { goalCause: options.goalCause } : {}
    };
    return createTranscriptReplayMachine({
      initialState,
      gaps: options.gaps,
      presentation: this.presentationAdapter(),
      ...options.skipFinalizeCallIds ? { skipFinalizeCallIds: options.skipFinalizeCallIds } : {},
      onDiagnostic: /* @__PURE__ */ __name((diagnostic) => {
        if (diagnostic.code === "malformed_part" && diagnostic.path === "systemPayload.outputHistoryItems.goalStatus.condition") {
          writeStderrLineSafe(`qwen: ${diagnostic.message}`);
        }
      }, "onDiagnostic")
    });
  }
  presentationAdapter() {
    return {
      resolveToolMetadata: /* @__PURE__ */ __name((toolName, args) => this.toolCallEmitter.resolveToolMetadata(toolName, { ...args }), "resolveToolMetadata"),
      formatHistoryGap: /* @__PURE__ */ __name((gap) => formatHistoryGapNotice(gap), "formatHistoryGap"),
      buildToolResultContentPrefix
    };
  }
  async sendUpdate(update) {
    if (this.ctx.messageRewriter) {
      await this.ctx.messageRewriter.interceptUpdate(update);
      return;
    }
    await this.ctx.sendUpdate(update);
  }
  copyCumulativeUsage(state) {
    const cumulative = this.ctx.cumulativeUsage;
    if (!cumulative) return;
    cumulative.promptTokens = state.cumulativeUsage.promptTokens;
    cumulative.cachedTokens = state.cumulativeUsage.cachedTokens;
    cumulative.candidateTokens = state.cumulativeUsage.candidateTokens;
    cumulative.apiTimeMs = state.cumulativeUsage.apiTimeMs;
  }
  setActiveRecordId(recordId, timestamp) {
    this.ctx.setActiveRecordId?.(recordId, timestamp);
  }
};
function toPendingTranscriptToolCall(pending) {
  return {
    callId: pending.callId,
    toolName: pending.toolName,
    sourceRecordId: pending.recordId,
    ...pending.timestamp ? { sourceTimestamp: pending.timestamp } : {}
  };
}
__name(toPendingTranscriptToolCall, "toPendingTranscriptToolCall");
function toLegacyPendingToolCall(pending) {
  return {
    callId: pending.callId,
    toolName: pending.toolName,
    recordId: pending.sourceRecordId,
    ...pending.sourceTimestamp ? { timestamp: pending.sourceTimestamp } : {}
  };
}
__name(toLegacyPendingToolCall, "toLegacyPendingToolCall");

// packages/cli/src/services/setup-github.ts
init_esbuild_shims();
import { promises as fsp } from "node:fs";
import * as path from "node:path";

// packages/cli/src/utils/gitUtils.ts
init_esbuild_shims();
import * as childProcess from "node:child_process";
var debugLogger = createDebugLogger("GIT");
async function runGit(args, opts = {}) {
  return await new Promise((resolve2, reject) => {
    childProcess.execFile(
      "git",
      args,
      {
        encoding: "utf-8",
        ...opts.cwd ? { cwd: opts.cwd } : {}
      },
      (err, stdout) => {
        if (err) {
          reject(err);
          return;
        }
        resolve2(String(stdout ?? "").trim());
      }
    );
  });
}
__name(runGit, "runGit");
var isGitHubRepositoryAsync = /* @__PURE__ */ __name(async (opts = {}) => {
  try {
    const remotes = await runGit(["remote", "-v"], opts);
    return remotes.split("\n").some((line) => {
      const remoteUrl = line.trim().split(/\s+/)[1];
      return remoteUrl ? isGitHubRemoteUrl(remoteUrl) : false;
    });
  } catch (_error) {
    debugLogger.debug(`Failed to get git remote:`, _error);
    return false;
  }
}, "isGitHubRepositoryAsync");
function isGitHubRemoteUrl(remoteUrl) {
  if (remoteUrl.startsWith("git@github.com:")) {
    return true;
  }
  if (remoteUrl.startsWith("git@")) {
    return false;
  }
  try {
    return new URL(remoteUrl).hostname === "github.com";
  } catch {
    return false;
  }
}
__name(isGitHubRemoteUrl, "isGitHubRemoteUrl");
var getGitRepoRootAsync = /* @__PURE__ */ __name(async (opts = {}) => {
  const gitRepoRoot = await runGit(["rev-parse", "--show-toplevel"], opts);
  if (!gitRepoRoot) {
    throw new Error(`Git repo returned empty value`);
  }
  return gitRepoRoot;
}, "getGitRepoRootAsync");
var getLatestGitHubRelease = /* @__PURE__ */ __name(async (proxy) => {
  try {
    const controller = new AbortController();
    const endpoint = `https://api.github.com/repos/QwenLM/qwen-code-action/releases/latest`;
    const dispatcher = proxy ? new (await loadUndici()).ProxyAgent(proxy) : void 0;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28"
      },
      dispatcher,
      signal: AbortSignal.any([AbortSignal.timeout(3e4), controller.signal])
    });
    if (!response.ok) {
      throw new Error(
        `Invalid response code: ${response.status} - ${response.statusText}`
      );
    }
    const releaseTag = (await response.json()).tag_name;
    if (!releaseTag) {
      throw new Error(`Response did not include tag_name field`);
    }
    return releaseTag;
  } catch (_error) {
    debugLogger.debug(
      `Failed to determine latest qwen-code-action release:`,
      _error
    );
    throw new Error(
      `Unable to determine the latest qwen-code-action release on GitHub.`
    );
  }
}, "getLatestGitHubRelease");
async function getGitHubRepoInfoAsync(opts = {}) {
  return parseGitHubRepoInfo(
    await runGit(["remote", "get-url", "origin"], opts)
  );
}
__name(getGitHubRepoInfoAsync, "getGitHubRepoInfoAsync");
function parseGitHubRepoInfo(remoteUrl) {
  let urlToParse = remoteUrl;
  if (remoteUrl.startsWith("git@github.com:")) {
    urlToParse = remoteUrl.replace("git@github.com:", "");
  } else if (remoteUrl.startsWith("git@")) {
    throw new Error(
      `Owner & repo could not be extracted from remote URL: ${remoteUrl}`
    );
  }
  let parsedUrl;
  try {
    parsedUrl = new URL(urlToParse, "https://github.com");
  } catch {
    throw new Error(
      `Owner & repo could not be extracted from remote URL: ${remoteUrl}`
    );
  }
  if (parsedUrl.hostname !== "github.com") {
    throw new Error(
      `Owner & repo could not be extracted from remote URL: ${remoteUrl}`
    );
  }
  const parts = parsedUrl.pathname.split("/").filter((part) => part !== "");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      `Owner & repo could not be extracted from remote URL: ${remoteUrl}`
    );
  }
  return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
}
__name(parseGitHubRepoInfo, "parseGitHubRepoInfo");

// packages/cli/src/services/setup-github.ts
var debugLogger2 = createDebugLogger("SETUP_GITHUB");
var GITHUB_WORKFLOW_PATHS = [
  "qwen-dispatch/qwen-dispatch.yml",
  "qwen-assistant/qwen-invoke.yml",
  "issue-triage/qwen-triage.yml",
  "issue-triage/qwen-scheduled-triage.yml",
  "pr-review/qwen-review.yml"
];
var GITIGNORE_ENTRIES = [".qwen/", "gha-creds-*.json"];
var MAX_WORKFLOW_DOWNLOAD_BYTES = 5 * 1024 * 1024;
var SetupGithubError = class extends Error {
  static {
    __name(this, "SetupGithubError");
  }
  code;
  status;
  partial;
  partialResult;
  constructor(code, message, status, partialResult) {
    super(message);
    this.name = "SetupGithubError";
    this.code = code;
    this.status = status;
    this.partial = partialResult !== void 0;
    this.partialResult = partialResult;
  }
};
function isWorkspaceGenerationClosed(error) {
  return Boolean(
    error && typeof error === "object" && "code" in error && error.code === "workspace_generation_closed"
  );
}
__name(isWorkspaceGenerationClosed, "isWorkspaceGenerationClosed");
var nodeFileOps = {
  assertCanWrite() {
  },
  async ensureWorkflowDirectory(gitRepoRoot) {
    await fsp.mkdir(path.join(gitRepoRoot, ".github", "workflows"), {
      recursive: true
    });
  },
  async writeTextFile(gitRepoRoot, relativePath, content) {
    const target = path.join(gitRepoRoot, relativePath);
    await fsp.writeFile(target, content, { mode: 420 });
    return { sizeBytes: Buffer.byteLength(content, "utf8") };
  },
  async readTextFile(gitRepoRoot, relativePath) {
    try {
      return await fsp.readFile(path.join(gitRepoRoot, relativePath), "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        return void 0;
      }
      throw error;
    }
  }
};
async function setupGithub(options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const fileOps = options.fileOps ?? nodeFileOps;
  if (!await isGitHubRepositoryAsync({ cwd })) {
    throw new SetupGithubError(
      "github_repository_not_found",
      "Unable to determine the GitHub repository. /setup-github must be run from a git repository.",
      400
    );
  }
  let gitRepoRoot;
  try {
    gitRepoRoot = await getGitRepoRootAsync({ cwd });
  } catch (error) {
    debugLogger2.debug("Failed to get git repo root:", error);
    throw new SetupGithubError(
      "github_repository_not_found",
      "Unable to determine the GitHub repository. /setup-github must be run from a git repository.",
      400
    );
  }
  if (options.workspaceRoot) {
    const [gitRootReal, workspaceReal] = await Promise.all([
      realpathOrResolve(gitRepoRoot),
      realpathOrResolve(options.workspaceRoot)
    ]);
    if (gitRootReal !== workspaceReal) {
      throw new SetupGithubError(
        "github_git_root_mismatch",
        "The Git repository root must match the daemon workspace root.",
        400
      );
    }
  }
  fileOps.assertCanWrite?.();
  let releaseTag;
  try {
    releaseTag = await getLatestGitHubRelease(options.proxy);
  } catch (error) {
    writeStderrLine(
      `qwen setup-github: failed to determine latest qwen-code-action release: ${error instanceof Error ? error.message : String(error)}`
    );
    debugLogger2.debug(
      "Failed to determine latest qwen-code-action release:",
      error
    );
    throw new SetupGithubError(
      "github_release_lookup_failed",
      "Unable to determine the latest qwen-code-action release on GitHub.",
      502
    );
  }
  const readmeUrl = `https://github.com/QwenLM/qwen-code-action/blob/${releaseTag}/README.md#quick-start`;
  const secretsUrl = await resolveSecretsUrl(cwd);
  const downloads = await downloadWorkflows({
    releaseTag,
    proxy: options.proxy,
    abortSignal: options.abortSignal,
    fetchImpl: options.fetchImpl ?? fetch
  });
  const result = {
    kind: "github_setup",
    workspaceCwd: options.workspaceRoot ?? gitRepoRoot,
    gitRepoRoot,
    releaseTag,
    readmeUrl,
    ...secretsUrl ? { secretsUrl } : {},
    workflows: [],
    gitignore: { path: ".gitignore", status: "skipped" },
    warnings: []
  };
  result.gitignore = await updateGitignore(gitRepoRoot, fileOps);
  if (result.gitignore.status === "failed") {
    result.warnings.push("Failed to update .gitignore.");
  }
  try {
    await fileOps.ensureWorkflowDirectory(gitRepoRoot);
    for (const workflow of downloads) {
      const relativePath = path.posix.join(
        ".github",
        "workflows",
        path.posix.basename(workflow.sourcePath)
      );
      try {
        const write = await fileOps.writeTextFile(
          gitRepoRoot,
          relativePath,
          workflow.content
        );
        result.workflows.push({
          sourcePath: workflow.sourcePath,
          path: relativePath,
          status: "written",
          sizeBytes: write.sizeBytes
        });
      } catch (error) {
        if (isWorkspaceGenerationClosed(error)) throw error;
        result.partial = true;
        result.workflows.push({
          sourcePath: workflow.sourcePath,
          path: relativePath,
          status: "failed",
          error: error instanceof Error ? error.message : String(error)
        });
        throw new SetupGithubError(
          "github_workflow_write_failed",
          `Unable to write ${relativePath}.`,
          500,
          result
        );
      }
    }
  } catch (error) {
    if (isWorkspaceGenerationClosed(error)) throw error;
    if (error instanceof SetupGithubError) throw error;
    throw new SetupGithubError(
      "github_workflow_write_failed",
      "Unable to create .github/workflows.",
      500,
      result
    );
  }
  return result;
}
__name(setupGithub, "setupGithub");
async function updateGitignore(gitRepoRoot, fileOps = nodeFileOps) {
  try {
    const existingContent = await fileOps.readTextFile(
      gitRepoRoot,
      ".gitignore"
    );
    if (existingContent === void 0) {
      const content = GITIGNORE_ENTRIES.join("\n") + "\n";
      await fileOps.writeTextFile(gitRepoRoot, ".gitignore", content);
      return {
        path: ".gitignore",
        status: "created",
        added: [...GITIGNORE_ENTRIES]
      };
    }
    const missingEntries = GITIGNORE_ENTRIES.filter(
      (entry) => !existingContent.split(/\r?\n/).some((line) => line.split("#")[0].trim() === entry)
    );
    if (missingEntries.length === 0) {
      return { path: ".gitignore", status: "unchanged" };
    }
    const nextContent = existingContent + "\n" + missingEntries.join("\n") + "\n";
    await fileOps.writeTextFile(gitRepoRoot, ".gitignore", nextContent);
    return {
      path: ".gitignore",
      status: "updated",
      added: missingEntries
    };
  } catch (error) {
    if (isWorkspaceGenerationClosed(error)) throw error;
    debugLogger2.debug("Failed to update .gitignore:", error);
    return {
      path: ".gitignore",
      status: "failed",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
__name(updateGitignore, "updateGitignore");
async function downloadWorkflows(options) {
  const internalAbort = new AbortController();
  try {
    const dispatcher = options.proxy ? new (await loadUndici()).ProxyAgent(options.proxy) : void 0;
    return await Promise.all(
      GITHUB_WORKFLOW_PATHS.map(async (workflow) => {
        const endpoint = `https://raw.githubusercontent.com/QwenLM/qwen-code-action/refs/tags/${options.releaseTag}/examples/workflows/${workflow}`;
        const response = await options.fetchImpl(endpoint, {
          method: "GET",
          dispatcher,
          signal: AbortSignal.any([
            AbortSignal.timeout(3e4),
            internalAbort.signal,
            ...options.abortSignal ? [options.abortSignal] : []
          ])
        });
        if (!response.ok) {
          throw new Error(
            `Invalid response code downloading ${endpoint}: ${response.status} - ${response.statusText}`
          );
        }
        return {
          sourcePath: workflow,
          content: await readResponseTextWithLimit(response, workflow)
        };
      })
    );
  } catch (error) {
    internalAbort.abort();
    const message = error instanceof Error ? error.message : String(error);
    debugLogger2.debug("Failed to download qwen-code-action workflows:", error);
    throw new SetupGithubError(
      "github_workflow_download_failed",
      `Unable to download qwen-code-action workflows from GitHub. ${message}`,
      502
    );
  }
}
__name(downloadWorkflows, "downloadWorkflows");
async function readResponseTextWithLimit(response, sourcePath) {
  const contentLength = response.headers.get("content-length");
  if (contentLength !== null) {
    const parsedLength = Number(contentLength);
    if (Number.isFinite(parsedLength) && parsedLength > MAX_WORKFLOW_DOWNLOAD_BYTES) {
      throw new Error(
        `${sourcePath} exceeds download limit of ${MAX_WORKFLOW_DOWNLOAD_BYTES} bytes`
      );
    }
  }
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_WORKFLOW_DOWNLOAD_BYTES) {
        await reader.cancel().catch(() => {
        });
        throw new Error(
          `${sourcePath} exceeds download limit of ${MAX_WORKFLOW_DOWNLOAD_BYTES} bytes`
        );
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}
__name(readResponseTextWithLimit, "readResponseTextWithLimit");
async function resolveSecretsUrl(cwd) {
  try {
    const repoInfo = await getGitHubRepoInfoAsync({ cwd });
    return `https://github.com/${repoInfo.owner}/${repoInfo.repo}/settings/secrets/actions`;
  } catch {
    return void 0;
  }
}
__name(resolveSecretsUrl, "resolveSecretsUrl");
async function realpathOrResolve(input) {
  try {
    return await fsp.realpath(input);
  } catch {
    return path.resolve(input);
  }
}
__name(realpathOrResolve, "realpathOrResolve");

// packages/cli/src/ui/utils/export/collect.ts
init_esbuild_shims();
import { randomUUID } from "node:crypto";

// packages/cli/src/utils/chat-record-tool-call-id.ts
init_esbuild_shims();
function getToolResultCallId(record) {
  return getExplicitToolResultCallId(record) ?? record.uuid;
}
__name(getToolResultCallId, "getToolResultCallId");
function getExplicitToolResultCallId(record) {
  const resultCallId = record.toolCallResult?.callId;
  if (typeof resultCallId === "string" && resultCallId.length > 0) {
    return resultCallId;
  }
  return extractFunctionResponseId(record);
}
__name(getExplicitToolResultCallId, "getExplicitToolResultCallId");
function extractFunctionResponseId(record) {
  if (!record.message?.parts) {
    return void 0;
  }
  for (const part of record.message.parts) {
    const id = "functionResponse" in part ? part.functionResponse?.id : void 0;
    if (typeof id === "string" && id.length > 0) {
      return id;
    }
  }
  return void 0;
}
__name(extractFunctionResponseId, "extractFunctionResponseId");

// packages/cli/src/ui/utils/export/collect.ts
function extractToolNameFromRecord(record) {
  if (!record.message?.parts) {
    return void 0;
  }
  for (const part of record.message.parts) {
    if ("functionResponse" in part && part.functionResponse?.name) {
      return part.functionResponse.name;
    }
  }
  return void 0;
}
__name(extractToolNameFromRecord, "extractToolNameFromRecord");
function normalizeFunctionCallArgs(args) {
  if (args && typeof args === "object") {
    return args;
  }
  if (typeof args === "string") {
    try {
      const parsed = JSON.parse(args);
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
    }
  }
  return void 0;
}
__name(normalizeFunctionCallArgs, "normalizeFunctionCallArgs");
function buildToolCallArgsIndex(records) {
  const byId = /* @__PURE__ */ new Map();
  const byName = /* @__PURE__ */ new Map();
  for (const record of records) {
    if (record.type !== "assistant" || !record.message?.parts) continue;
    for (const part of record.message.parts) {
      if (!("functionCall" in part) || !part.functionCall?.name) continue;
      const normalizedArgs = normalizeFunctionCallArgs(part.functionCall.args);
      if (!normalizedArgs) continue;
      const toolName = part.functionCall.name;
      const callId = typeof part.functionCall.id === "string" ? part.functionCall.id : null;
      if (callId) {
        byId.set(callId, normalizedArgs);
      }
      const queue = byName.get(toolName) ?? [];
      queue.push(normalizedArgs);
      byName.set(toolName, queue);
    }
  }
  return { byId, byName };
}
__name(buildToolCallArgsIndex, "buildToolCallArgsIndex");
function calculateFileStats(records) {
  const argsIndex = buildToolCallArgsIndex(records);
  const byNameCursor = /* @__PURE__ */ new Map();
  const stats = {
    filesWritten: 0,
    linesAdded: 0,
    linesRemoved: 0,
    writtenFilePaths: /* @__PURE__ */ new Set()
  };
  for (const record of records) {
    if (record.type !== "tool_result" || !record.toolCallResult) continue;
    const toolName = extractToolNameFromRecord(record);
    const callId = getExplicitToolResultCallId(record);
    const argsFromId = callId && argsIndex.byId.has(callId) ? argsIndex.byId.get(callId) : void 0;
    let args = argsFromId;
    if (!args && toolName) {
      const queue = argsIndex.byName.get(toolName);
      if (queue && queue.length > 0) {
        const cursor = byNameCursor.get(toolName) ?? 0;
        args = queue[cursor];
        byNameCursor.set(toolName, cursor + 1);
      }
    }
    const { resultDisplay } = record.toolCallResult;
    if (resultDisplay && typeof resultDisplay === "object" && "fileName" in resultDisplay) {
      const display = resultDisplay;
      const hasOriginalContent = "originalContent" in display;
      const hasNewContent = "newContent" in display;
      let filePath;
      if (typeof display.fileName === "string") {
        filePath = args?.["file_path"] || display.fileName;
      } else {
        filePath = "unknown";
      }
      if (hasOriginalContent || hasNewContent) {
        stats.filesWritten++;
        stats.writtenFilePaths.add(filePath);
        if (display.diffStat) {
          stats.linesAdded += display.diffStat.model_added_lines ?? 0;
          stats.linesRemoved += display.diffStat.model_removed_lines ?? 0;
        } else if (!display.truncatedForSession) {
          const oldText = String(display.originalContent ?? "");
          const newText = String(display.newContent ?? "");
          const oldLines = oldText.split("\n").filter((line) => line.length > 0).length;
          const newLines = newText.split("\n").filter((line) => line.length > 0).length;
          stats.linesAdded += newLines;
          stats.linesRemoved += oldLines;
        }
      }
    }
  }
  return stats;
}
__name(calculateFileStats, "calculateFileStats");
function extractTaskToolTokens(record) {
  if (record.type !== "tool_result" || !record.toolCallResult?.resultDisplay) {
    return 0;
  }
  const { resultDisplay } = record.toolCallResult;
  if (typeof resultDisplay === "object" && "type" in resultDisplay && resultDisplay.type === "task_execution" && "executionSummary" in resultDisplay) {
    const summary = resultDisplay.executionSummary;
    if (typeof summary.totalTokens === "number") {
      return summary.totalTokens;
    }
    return (summary.inputTokens ?? 0) + (summary.outputTokens ?? 0) + (summary.thoughtTokens ?? 0) + (summary.cachedTokens ?? 0);
  }
  return 0;
}
__name(extractTaskToolTokens, "extractTaskToolTokens");
function calculateTokenStats(records) {
  let totalTokens = 0;
  let lastValidRecord = null;
  for (const record of records) {
    if (record.type === "assistant") {
      if (record.usageMetadata) {
        totalTokens += record.usageMetadata.totalTokenCount ?? 0;
      }
      if (record.usageMetadata?.totalTokenCount !== void 0 && record.contextWindowSize !== void 0) {
        lastValidRecord = {
          totalTokenCount: record.usageMetadata.totalTokenCount,
          contextWindowSize: record.contextWindowSize
        };
      }
    }
    const taskTokens = extractTaskToolTokens(record);
    if (taskTokens > 0) {
      totalTokens += taskTokens;
    }
  }
  if (lastValidRecord) {
    const percent = lastValidRecord.totalTokenCount / lastValidRecord.contextWindowSize * 100;
    return {
      totalTokens,
      contextUsagePercent: Math.round(percent * 10) / 10,
      contextWindowSize: lastValidRecord.contextWindowSize
    };
  }
  const lastAssistantRecord = [...records].reverse().find((r) => r.type === "assistant" && r.contextWindowSize !== void 0);
  return {
    totalTokens,
    contextWindowSize: lastAssistantRecord?.contextWindowSize
  };
}
__name(calculateTokenStats, "calculateTokenStats");
function createExportSessionConfig(config) {
  const supportedConfig = {
    ...config,
    getToolRegistry: /* @__PURE__ */ __name(() => {
      const registry = config.getToolRegistry?.();
      return {
        getTool: /* @__PURE__ */ __name((toolName) => registry?.getTool?.(toolName) ?? null, "getTool")
      };
    }, "getToolRegistry")
  };
  return new Proxy(supportedConfig, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      if (typeof prop === "symbol") {
        return void 0;
      }
      throw new Error(
        `Export session replay config does not implement ${prop}`
      );
    }
  });
}
__name(createExportSessionConfig, "createExportSessionConfig");
async function extractMetadata(conversation, config) {
  const { sessionId, startTime, messages } = conversation;
  const firstRecord = messages[0];
  const cwd = firstRecord?.cwd ?? "";
  const gitBranch = firstRecord?.gitBranch;
  let gitRepo;
  if (cwd) {
    const { getGitRepoName } = await import("./deferred-core-runtime-V3IR2YMV.js");
    gitRepo = getGitRepoName(cwd);
  }
  let model;
  for (const record of messages) {
    if (record.type === "assistant" && record.model) {
      model = record.model;
      break;
    }
  }
  const channel = config.getChannel?.();
  const promptCount = messages.filter((m) => m.type === "user").length;
  const fileStats = calculateFileStats(messages);
  const tokenStats = calculateTokenStats(messages);
  return {
    sessionId,
    startTime,
    exportTime: (/* @__PURE__ */ new Date()).toISOString(),
    cwd,
    gitRepo,
    gitBranch,
    model,
    channel,
    promptCount,
    contextUsagePercent: tokenStats.contextUsagePercent,
    contextWindowSize: tokenStats.contextWindowSize,
    totalTokens: tokenStats.totalTokens,
    filesWritten: fileStats.writtenFilePaths.size,
    linesAdded: fileStats.linesAdded,
    linesRemoved: fileStats.linesRemoved,
    uniqueFiles: Array.from(fileStats.writtenFilePaths)
  };
}
__name(extractMetadata, "extractMetadata");
var ExportSessionContext = class {
  static {
    __name(this, "ExportSessionContext");
  }
  sessionId;
  config;
  messages = [];
  currentMessage = null;
  activeRecordId = null;
  activeRecordTimestamp = null;
  toolCallMap = /* @__PURE__ */ new Map();
  constructor(sessionId, config) {
    this.sessionId = sessionId;
    this.config = createExportSessionConfig(config);
  }
  async sendUpdate(update) {
    switch (update.sessionUpdate) {
      case "user_message_chunk":
        this.handleMessageChunk("user", update.content);
        break;
      case "agent_message_chunk": {
        const usageMeta = update._meta;
        const usageMetadata = usageMeta?.usage ? {
          promptTokenCount: usageMeta.usage.inputTokens,
          candidatesTokenCount: usageMeta.usage.outputTokens,
          totalTokenCount: usageMeta.usage.totalTokens,
          thoughtsTokenCount: usageMeta.usage.thoughtTokens,
          cachedContentTokenCount: usageMeta.usage.cachedReadTokens
        } : void 0;
        this.handleMessageChunk(
          "assistant",
          update.content,
          "assistant",
          usageMetadata
        );
        break;
      }
      case "agent_thought_chunk":
        this.handleMessageChunk("assistant", update.content, "thinking");
        break;
      case "tool_call":
        this.flushCurrentMessage();
        this.handleToolCallStart(update);
        break;
      case "tool_call_update":
        this.handleToolCallUpdate(update);
        break;
      case "plan":
        this.flushCurrentMessage();
        this.handlePlanUpdate(update);
        break;
      default:
        break;
    }
  }
  setActiveRecordId(recordId, timestamp) {
    this.activeRecordId = recordId;
    this.activeRecordTimestamp = timestamp ?? null;
  }
  getMessageTimestamp() {
    return this.activeRecordTimestamp ?? (/* @__PURE__ */ new Date()).toISOString();
  }
  getMessageUuid() {
    return this.activeRecordId ?? randomUUID();
  }
  handleMessageChunk(role, content, messageRole = role, usageMetadata) {
    if (content.type !== "text" || !content.text) return;
    if (this.currentMessage && (this.currentMessage.type !== role || this.currentMessage.role !== messageRole)) {
      this.flushCurrentMessage();
    }
    if (this.currentMessage && this.currentMessage.type === role && this.currentMessage.role === messageRole) {
      this.currentMessage.parts.push({ text: content.text });
      if (usageMetadata && role === "assistant") {
        this.currentMessage.usageMetadata = usageMetadata;
      }
    } else {
      this.currentMessage = {
        type: role,
        role: messageRole,
        parts: [{ text: content.text }],
        timestamp: Date.now(),
        ...usageMetadata && role === "assistant" ? { usageMetadata } : {}
      };
    }
  }
  handleToolCallStart(update) {
    const toolCall = {
      toolCallId: update.toolCallId,
      kind: update.kind || "other",
      title: typeof update.title === "string" ? update.title : update.title || "",
      status: update.status || "pending",
      rawInput: update.rawInput,
      locations: update.locations,
      timestamp: Date.now()
    };
    this.toolCallMap.set(update.toolCallId, toolCall);
    const uuid = this.getMessageUuid();
    this.messages.push({
      uuid,
      sessionId: this.sessionId,
      timestamp: this.getMessageTimestamp(),
      type: "tool_call",
      toolCall
    });
  }
  handleToolCallUpdate(update) {
    const toolCall = this.toolCallMap.get(update.toolCallId);
    if (toolCall) {
      if (update.status) toolCall.status = update.status;
      if (update.content) toolCall.content = update.content;
      if (update.title)
        toolCall.title = typeof update.title === "string" ? update.title : "";
    }
  }
  handlePlanUpdate(update) {
    const uuid = this.getMessageUuid();
    const timestamp = this.getMessageTimestamp();
    const todoText = update.entries.map((entry) => {
      const checkbox = entry.status === "completed" ? "[x]" : entry.status === "in_progress" ? "[-]" : "[ ]";
      return `- ${checkbox} ${entry.content}`;
    }).join("\n");
    const todoContent = [
      {
        type: "content",
        content: {
          type: "text",
          text: todoText
        }
      }
    ];
    this.messages.push({
      uuid,
      sessionId: this.sessionId,
      timestamp,
      type: "tool_call",
      toolCall: {
        toolCallId: uuid,
        // Use the same uuid as toolCallId for plan updates
        kind: "todowrite",
        title: "TodoList",
        status: "completed",
        content: todoContent,
        timestamp: Date.parse(timestamp)
      }
    });
  }
  flushCurrentMessage() {
    if (!this.currentMessage) return;
    const uuid = this.getMessageUuid();
    const exportMessage = {
      uuid,
      sessionId: this.sessionId,
      timestamp: this.getMessageTimestamp(),
      type: this.currentMessage.type,
      message: {
        role: this.currentMessage.role,
        parts: this.currentMessage.parts
      }
    };
    if (this.currentMessage.type === "assistant" && this.currentMessage.usageMetadata) {
      exportMessage.usageMetadata = this.currentMessage.usageMetadata;
    }
    this.messages.push(exportMessage);
    this.currentMessage = null;
  }
  flushMessages() {
    this.flushCurrentMessage();
  }
  getMessages() {
    return this.messages;
  }
};
async function collectSessionData(conversation, config) {
  const exportContext = new ExportSessionContext(
    conversation.sessionId,
    config
  );
  const replayer = new HistoryReplayer(exportContext);
  await replayer.replay(conversation.messages);
  exportContext.flushMessages();
  const messages = exportContext.getMessages();
  const metadata = await extractMetadata(conversation, config);
  return {
    sessionId: conversation.sessionId,
    startTime: conversation.startTime,
    messages,
    metadata
  };
}
__name(collectSessionData, "collectSessionData");

// packages/cli/src/ui/utils/export/normalize.ts
init_esbuild_shims();

// packages/cli/src/utils/truncatedDiffPreview.ts
init_esbuild_shims();
function buildTruncatedDiffPreviewText2(display) {
  const fileName = typeof display["fileName"] === "string" ? display["fileName"] : "the edited file";
  const fileDiffLength = typeof display["fileDiffLength"] === "number" ? ` Original fileDiff length: ${display["fileDiffLength"]} chars.` : "";
  if (display["fileDiffTruncated"] === true) {
    return `Full diff omitted from saved session history for ${fileName}.${fileDiffLength}`;
  }
  return `Saved session preview only for ${fileName}; full original and new file contents are unavailable.`;
}
__name(buildTruncatedDiffPreviewText2, "buildTruncatedDiffPreviewText");

// packages/cli/src/ui/utils/export/normalize.ts
function normalizeSessionData(sessionData, originalRecords, config) {
  const normalized = [...sessionData.messages];
  const toolCallIndexById = /* @__PURE__ */ new Map();
  normalized.forEach((message, index) => {
    if (message.type === "tool_call" && message.toolCall?.toolCallId) {
      toolCallIndexById.set(message.toolCall.toolCallId, index);
    }
  });
  const assistantMessageIndexByUuid = /* @__PURE__ */ new Map();
  normalized.forEach((message, index) => {
    if (message.type === "assistant") {
      assistantMessageIndexByUuid.set(message.uuid, index);
    }
  });
  for (const record of originalRecords) {
    if (record.type !== "tool_result") continue;
    const toolCallMessage = buildToolCallMessageFromResult(record, config);
    if (!toolCallMessage?.toolCall) continue;
    const existingIndex = toolCallIndexById.get(
      toolCallMessage.toolCall.toolCallId
    );
    if (existingIndex === void 0) {
      toolCallIndexById.set(
        toolCallMessage.toolCall.toolCallId,
        normalized.length
      );
      normalized.push(toolCallMessage);
      continue;
    }
    const existingMessage = normalized[existingIndex];
    if (existingMessage.type !== "tool_call" || !existingMessage.toolCall) {
      continue;
    }
    mergeToolCallData(existingMessage.toolCall, toolCallMessage.toolCall);
  }
  for (const record of originalRecords) {
    if (record.type !== "assistant") continue;
    if (!record.usageMetadata) continue;
    const existingIndex = assistantMessageIndexByUuid.get(record.uuid);
    if (existingIndex !== void 0) {
      if (!normalized[existingIndex].usageMetadata) {
        normalized[existingIndex].usageMetadata = record.usageMetadata;
      }
    }
  }
  return {
    ...sessionData,
    messages: normalized
  };
}
__name(normalizeSessionData, "normalizeSessionData");
function mergeToolCallData(existing, incoming) {
  if (!existing.content || existing.content.length === 0) {
    existing.content = incoming.content;
  }
  if (existing.status === "pending" || existing.status === "in_progress") {
    existing.status = incoming.status;
  }
  if (!existing.rawInput && incoming.rawInput) {
    existing.rawInput = incoming.rawInput;
  }
  if (!existing.kind || existing.kind === "other") {
    existing.kind = incoming.kind;
  }
  if ((!existing.title || existing.title === "") && incoming.title) {
    existing.title = incoming.title;
  }
  if ((!existing.locations || existing.locations.length === 0) && incoming.locations && incoming.locations.length > 0) {
    existing.locations = incoming.locations;
  }
}
__name(mergeToolCallData, "mergeToolCallData");
function buildToolCallMessageFromResult(record, config) {
  const toolCallResult = record.toolCallResult;
  const toolName = extractToolNameFromRecord2(record);
  if (toolName === ToolNames.TODO_WRITE) {
    return null;
  }
  const toolCallId2 = getToolResultCallId(record);
  const functionCallArgs = extractFunctionCallArgs(record);
  const { kind, title, locations } = resolveToolMetadata(
    config,
    toolName,
    functionCallArgs ?? toolCallResult?.args
  );
  const rawInput = normalizeRawInput(
    functionCallArgs ?? toolCallResult?.args
  );
  const resultContent = extractDiffContent2(toolCallResult?.resultDisplay) ?? transformPartsToToolCallContent(record.message?.parts ?? []);
  const content = isVisionBridgeNoticeDisplay(toolCallResult?.resultDisplay) ? [
    {
      type: "content",
      content: {
        type: "text",
        text: sanitizeTerminalText(
          formatVisionBridgeNoticeDisplay(toolCallResult.resultDisplay)
        )
      }
    },
    ...resultContent
  ] : resultContent;
  return {
    uuid: record.uuid,
    parentUuid: record.parentUuid,
    sessionId: record.sessionId,
    timestamp: record.timestamp,
    type: "tool_call",
    toolCall: {
      toolCallId: toolCallId2,
      kind,
      title,
      status: toolCallResult?.error ? "failed" : "completed",
      rawInput,
      content,
      locations,
      timestamp: Date.parse(record.timestamp)
    }
  };
}
__name(buildToolCallMessageFromResult, "buildToolCallMessageFromResult");
function extractToolNameFromRecord2(record) {
  if (!record.message?.parts) {
    return "";
  }
  for (const part of record.message.parts) {
    if ("functionResponse" in part && part.functionResponse?.name) {
      return part.functionResponse.name;
    }
  }
  return "";
}
__name(extractToolNameFromRecord2, "extractToolNameFromRecord");
function extractFunctionCallArgs(record) {
  if (!record.message?.parts) {
    return void 0;
  }
  for (const part of record.message.parts) {
    if ("functionCall" in part && part.functionCall?.args) {
      return part.functionCall.args;
    }
  }
  return void 0;
}
__name(extractFunctionCallArgs, "extractFunctionCallArgs");
function resolveToolMetadata(config, toolName, args) {
  const toolRegistry = config.getToolRegistry?.();
  const tool = toolName ? toolRegistry?.getTool?.(toolName) : void 0;
  let title = tool?.displayName ?? toolName ?? "tool_call";
  let locations;
  const kind = mapToolKind(tool?.kind, toolName);
  if (tool?.build && args) {
    try {
      const invocation = tool.build(args);
      title = `${title}: ${invocation.getDescription()}`;
      locations = invocation.toolLocations().map((loc) => ({
        path: loc.path,
        line: loc.line ?? null
      }));
    } catch {
    }
  }
  return { kind, title, locations };
}
__name(resolveToolMetadata, "resolveToolMetadata");
function mapToolKind(kind, toolName) {
  if (toolName && (toolName === ToolNames.EXIT_PLAN_MODE || toolName === ToolNames.ENTER_PLAN_MODE)) {
    return "switch_mode";
  }
  if (toolName && toolName === ToolNames.TODO_WRITE) {
    return "todowrite";
  }
  const allowedKinds = /* @__PURE__ */ new Set([
    "read",
    "edit",
    "delete",
    "move",
    "search",
    "execute",
    "think",
    "fetch",
    "other"
  ]);
  if (kind && allowedKinds.has(kind)) {
    return kind;
  }
  return "other";
}
__name(mapToolKind, "mapToolKind");
function extractDiffContent2(resultDisplay) {
  if (!resultDisplay || typeof resultDisplay !== "object") {
    return null;
  }
  const display = resultDisplay;
  if ("fileName" in display && "newContent" in display) {
    if (display["truncatedForSession"] === true) {
      return [
        {
          type: "content",
          content: {
            type: "text",
            text: buildTruncatedDiffPreviewText2(display)
          }
        }
      ];
    }
    return [
      {
        type: "diff",
        path: display["fileName"],
        oldText: display["originalContent"] ?? "",
        newText: display["newContent"]
      }
    ];
  }
  return null;
}
__name(extractDiffContent2, "extractDiffContent");
function normalizeRawInput(value) {
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) return value;
  return void 0;
}
__name(normalizeRawInput, "normalizeRawInput");
function transformPartsToToolCallContent(parts) {
  const content = [];
  for (const part of parts) {
    if ("text" in part && part.text) {
      content.push({
        type: "content",
        content: { type: "text", text: part.text }
      });
      continue;
    }
    if ("functionResponse" in part && part.functionResponse) {
      const response = part.functionResponse.response;
      const outputField = response?.["output"];
      const errorField = response?.["error"];
      const responseText = typeof outputField === "string" ? outputField : typeof errorField === "string" ? errorField : JSON.stringify(response);
      content.push({
        type: "content",
        content: { type: "text", text: responseText }
      });
    }
  }
  return content;
}
__name(transformPartsToToolCallContent, "transformPartsToToolCallContent");

// packages/cli/src/ui/utils/export/formatters/markdown.ts
init_esbuild_shims();
function toMarkdown(sessionData) {
  const lines = [];
  const metadata = sessionData.metadata;
  lines.push("# Chat Session Export\n");
  lines.push(`- **Session ID**: \`${sanitizeText(sessionData.sessionId)}\``);
  lines.push(`- **Start Time**: ${sanitizeText(sessionData.startTime)}`);
  lines.push(
    `- **Exported**: ${sanitizeText(metadata?.exportTime ?? (/* @__PURE__ */ new Date()).toISOString())}`
  );
  lines.push("");
  if (metadata?.cwd) {
    lines.push(`- **Working Directory**: \`${sanitizeText(metadata.cwd)}\``);
  }
  if (metadata?.gitRepo) {
    lines.push(`- **Git Repository**: ${sanitizeText(metadata.gitRepo)}`);
  }
  if (metadata?.gitBranch) {
    lines.push(`- **Git Branch**: \`${sanitizeText(metadata.gitBranch)}\``);
  }
  lines.push("");
  if (metadata?.model) {
    lines.push(`- **Model**: ${sanitizeText(metadata.model)}`);
  }
  if (metadata?.channel) {
    lines.push(`- **Channel**: ${sanitizeText(metadata.channel)}`);
  }
  if (metadata?.promptCount !== void 0) {
    lines.push(`- **Prompt Count**: ${metadata.promptCount}`);
  }
  lines.push("");
  if (metadata?.totalTokens !== void 0) {
    lines.push(`- **Total Tokens**: ${metadata.totalTokens}`);
  }
  if (metadata?.contextWindowSize !== void 0) {
    lines.push(`- **Context Window Size**: ${metadata.contextWindowSize}`);
  }
  if (metadata?.contextUsagePercent !== void 0) {
    lines.push(`- **Context Usage**: ${metadata.contextUsagePercent}%`);
  }
  lines.push("");
  if (metadata?.filesWritten !== void 0) {
    lines.push(`- **Files Written**: ${metadata.filesWritten}`);
  }
  if (metadata?.linesAdded !== void 0) {
    lines.push(`- **Lines Added**: ${metadata.linesAdded}`);
  }
  if (metadata?.linesRemoved !== void 0) {
    lines.push(`- **Lines Removed**: ${metadata.linesRemoved}`);
  }
  if (metadata?.uniqueFiles && metadata.uniqueFiles.length > 0) {
    lines.push("");
    lines.push("<details>");
    lines.push(
      `<summary><strong>Unique Files Referenced (${metadata.uniqueFiles.length})</strong></summary>`
    );
    lines.push("");
    for (const file of metadata.uniqueFiles) {
      lines.push(`- \`${sanitizeText(file)}\``);
    }
    lines.push("</details>");
  }
  lines.push("\n---\n");
  for (const message of sessionData.messages) {
    if (message.type === "user") {
      lines.push("## User\n");
      lines.push(formatMessageContent(message));
    } else if (message.type === "assistant") {
      lines.push("## Assistant\n");
      lines.push(formatMessageContent(message));
    } else if (message.type === "tool_call") {
      lines.push(formatToolCall(message));
    } else if (message.type === "system") {
      lines.push("### System\n");
      const text = formatMessageContent(message);
      lines.push(`> ${text.replace(/\n/g, "\n> ")}`);
    }
    lines.push("\n");
  }
  return lines.join("\n");
}
__name(toMarkdown, "toMarkdown");
function formatMessageContent(message) {
  const text = extractTextFromMessage(message);
  const processedText = text.replace(
    /--- Content from referenced files ---\n([\s\S]*?)\n--- End of content ---/g,
    (match, content) => `
> **Referenced Files:**

${createCodeBlock(content)}
`
  );
  return processedText;
}
__name(formatMessageContent, "formatMessageContent");
function formatToolCall(message) {
  if (!message.toolCall) return "";
  const lines = [];
  const { title, status, rawInput, content, locations } = message.toolCall;
  const titleStr = typeof title === "string" ? title : JSON.stringify(title);
  lines.push(`### Tool: ${sanitizeText(titleStr)}`);
  lines.push(`**Status**: ${sanitizeText(status)}
`);
  if (rawInput) {
    lines.push("**Input:**");
    const inputStr = typeof rawInput === "string" ? rawInput : JSON.stringify(rawInput, null, 2);
    lines.push(createCodeBlock(inputStr, "json"));
    lines.push("");
  }
  if (locations && locations.length > 0) {
    lines.push("**Affected Files:**");
    for (const loc of locations) {
      const lineSuffix = loc.line ? `:${loc.line}` : "";
      lines.push(`- \`${sanitizeText(loc.path)}${lineSuffix}\``);
    }
    lines.push("");
  }
  if (content && content.length > 0) {
    lines.push("**Output:**");
    for (const item of content) {
      if (item.type === "content" && item["content"]) {
        const contentData = item["content"];
        if (contentData.type === "text" && contentData.text) {
          let language = "";
          if (locations && locations.length === 1 && locations[0].path) {
            language = getLanguageFromPath(locations[0].path);
          }
          lines.push(createCodeBlock(contentData.text, language));
        }
      } else if (item.type === "diff") {
        const path2 = item["path"];
        const diffText = item["newText"];
        lines.push(`
*Diff for \`${sanitizeText(path2)}\`:*`);
        lines.push(createCodeBlock(diffText, "diff"));
      }
    }
  }
  return lines.join("\n");
}
__name(formatToolCall, "formatToolCall");
function extractTextFromMessage(message) {
  if (!message.message?.parts) return "";
  const textParts = [];
  for (const part of message.message.parts) {
    if ("text" in part) {
      textParts.push(part.text);
    }
  }
  return textParts.join("\n");
}
__name(extractTextFromMessage, "extractTextFromMessage");
function createCodeBlock(content, language = "") {
  const fence = buildFence(content);
  return `${fence}${language}
${content}
${fence}`;
}
__name(createCodeBlock, "createCodeBlock");
function sanitizeText(value) {
  return (value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
}
__name(sanitizeText, "sanitizeText");
function buildFence(value) {
  const matches = (value ?? "").match(/`+/g);
  const maxRun = matches ? Math.max(...matches.map((match) => match.length)) : 0;
  const fenceLength = Math.max(3, maxRun + 1);
  return "`".repeat(fenceLength);
}
__name(buildFence, "buildFence");
function getLanguageFromPath(path2) {
  const ext = path2.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
    case "mjs":
    case "cjs":
      return "javascript";
    case "py":
      return "python";
    case "rb":
      return "ruby";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "java":
      return "java";
    case "c":
    case "cpp":
    case "h":
    case "hpp":
      return "cpp";
    case "cs":
      return "csharp";
    case "html":
      return "html";
    case "css":
      return "css";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "sh":
    case "bash":
    case "zsh":
      return "bash";
    case "yaml":
    case "yml":
      return "yaml";
    case "xml":
      return "xml";
    case "sql":
      return "sql";
    default:
      return "";
  }
}
__name(getLanguageFromPath, "getLanguageFromPath");

// packages/cli/src/ui/utils/export/formatters/html.ts
init_esbuild_shims();

// packages/web-templates/src/index.ts
init_esbuild_shims();

// packages/web-templates/src/generated/insightTemplate.ts
init_esbuild_shims();
var INSIGHT_JS = '(function(e,O){"use strict";function J({data:t}){const{totalMessages:n=0,totalLinesAdded:l=0,totalLinesRemoved:r=0,totalFiles:a=0}=t,s=Object.keys(t.heatmap||{});let o=0;if(s.length>0){const c=s.map(x=>new Date(x)).map(x=>x.getTime()),d=new Date(Math.min(...c)),g=new Date(Math.max(...c)),E=Math.abs(g.getTime()-d.getTime());o=Math.ceil(E/(1e3*60*60*24))+1}const i=o>0?Math.round(n/o):0;return e.createElement("div",{className:"stats-row"},e.createElement("div",{className:"stat"},e.createElement("div",{className:"stat-value"},n),e.createElement("div",{className:"stat-label"},"Messages")),e.createElement("div",{className:"stat"},e.createElement("div",{className:"stat-value"},"+",l,"/-",r),e.createElement("div",{className:"stat-label"},"Lines")),e.createElement("div",{className:"stat"},e.createElement("div",{className:"stat-value"},a),e.createElement("div",{className:"stat-label"},"Files")),e.createElement("div",{className:"stat"},e.createElement("div",{className:"stat-value"},o),e.createElement("div",{className:"stat-label"},"Days")),e.createElement("div",{className:"stat"},e.createElement("div",{className:"stat-value"},i),e.createElement("div",{className:"stat-label"},"Msgs/Day")))}/**\n * @license\n * Copyright 2026 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */function D(t){const n=t.getFullYear(),l=String(t.getMonth()+1).padStart(2,"0"),r=String(t.getDate()).padStart(2,"0");return`${n}-${l}-${r}`}function Y(t){const[n,l,r]=t.split("-").map(Number);return new Date(n,l-1,r)}function V({insights:t}){return e.createElement("div",{className:"grid gap-4 md:grid-cols-2 md:gap-6"},e.createElement(X,{activeHours:t.activeHours,cardClass:"glass-card p-6",sectionTitleClass:"text-lg font-semibold tracking-tight text-slate-900"}))}function X({activeHours:t,cardClass:n,sectionTitleClass:l}){const a=[{label:"Morning",time:"06:00 - 12:00",hours:[6,7,8,9,10,11],color:"#fbbf24"},{label:"Afternoon",time:"12:00 - 18:00",hours:[12,13,14,15,16,17],color:"#0ea5e9"},{label:"Evening",time:"18:00 - 22:00",hours:[18,19,20,21],color:"#6366f1"},{label:"Night",time:"22:00 - 06:00",hours:[22,23,0,1,2,3,4,5],color:"#475569"}].map(o=>{const i=o.hours.reduce((m,c)=>m+(t[c]||0),0);return{...o,total:i}}),s=Math.max(...a.map(o=>o.total));return e.createElement("div",{className:`${n} h-full flex flex-col min-h-[320px]`},e.createElement("div",{className:"flex items-center justify-between mb-4"},e.createElement("h3",{className:l},"Active Hours")),e.createElement("div",{className:"flex-1 flex flex-col justify-center gap-4"},a.map(o=>e.createElement("div",{key:o.label,className:"space-y-2"},e.createElement("div",{className:"flex justify-between items-center text-sm"},e.createElement("div",{className:"flex items-center gap-2"},e.createElement("span",{className:"rounded-full",style:{width:"12px",height:"12px",backgroundColor:o.color}}),e.createElement("span",{className:"font-medium text-slate-700"},o.label),e.createElement("span",{className:"text-xs text-slate-400 hidden xl:inline"},o.time)),e.createElement("span",{className:"font-semibold text-slate-900"},o.total)),e.createElement("div",{className:"w-full rounded-full overflow-hidden",style:{height:"12px",backgroundColor:"#e2e8f0"}},e.createElement("div",{className:"h-full rounded-full",style:{width:`${s>0?o.total/s*100:0}%`,backgroundColor:o.color}}))))))}function Z({heatmap:t}){return e.createElement("div",{className:"glass-card p-6 mt-4 md:mt-6"},e.createElement("div",{className:"mb-3"},e.createElement("h3",{className:"text-lg font-semibold tracking-tight text-slate-900"},"Activity Heatmap"),e.createElement("p",{className:"text-xs text-slate-500"},"Showing past year of activity")),e.createElement("div",{className:"heatmap-container"},e.createElement("div",{className:"min-w-[720px] rounded-xl bg-white/70"},e.createElement(R,{heatmapData:t}))),e.createElement(ee,null))}function R({heatmapData:t}){const s=new Date,o=new Date(s);o.setFullYear(s.getFullYear()-1);const i=[],m=new Date(o);for(;m<=s;)i.push(new Date(m)),m.setDate(m.getDate()+1);const c=[0,2,4,10,20],d=["#ebedf0","#9be9a8","#40c463","#30a14e","#216e39"];function g(u){if(u===0)return d[0];for(let f=c.length-1;f>=1;f--)if(u>=c[f])return d[f];return d[1]}const E=50,x=20,A=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],w=o.getDay(),j=[];let h=-1,T=-100;return i.forEach((u,f)=>{const C=f+w,_=Math.floor(C/7),v=E+_*16,N=u.getMonth();N!==h&&(v-T>30&&(j.push({x:v,text:A[N]}),T=v),h=N)}),e.createElement("svg",{className:"heatmap-svg",width:1e3,height:130,viewBox:"0 0 1000 130"},i.map((u,f)=>{const C=f+w,_=Math.floor(C/7),v=u.getDay(),N=E+_*16,q=x+v*16,k=D(u),S=t[k]||0,I=g(S);return e.createElement("rect",{key:k,className:"heatmap-day",x:N,y:q,width:14,height:14,rx:"2",fill:I,"data-date":k,"data-count":S},e.createElement("title",null,k,": ",S," activities"))}),j.map((u,f)=>e.createElement("text",{key:f,x:u.x,y:"15",fontSize:"12",fill:"#64748b"},u.text)))}function ee(){const t=["#ebedf0","#9be9a8","#40c463","#30a14e","#216e39"];return e.createElement("div",{className:"flex items-center gap-2 mt-4"},e.createElement("span",{className:"text-xs text-slate-500"},"Less"),t.map((n,l)=>e.createElement("span",{key:l,className:"inline-block rounded",style:{width:"10px",height:"10px",backgroundColor:n}})),e.createElement("span",{className:"text-xs text-slate-500"},"More"))}function p({children:t}){if(!t||typeof t!="string")return t;const n=t.split(/(\\*\\*.*?\\*\\*)/g);return e.createElement(e.Fragment,null,n.map((l,r)=>l.startsWith("**")&&l.endsWith("**")&&l.length>=4?e.createElement("strong",{key:r},l.slice(2,-2)):l))}function H({text:t,label:n="Copy"}){const[l,r]=e.useState(!1),a=()=>{navigator.clipboard.writeText(t).then(()=>{r(!0),setTimeout(()=>r(!1),2e3)})};return e.createElement("button",{className:"copy-btn",onClick:a},l?"Copied!":n)}function te(t){return typeof t=="string"&&t.trim().length>0}function ne({qualitative:t,targetSections:n}){const{atAGlance:l}=t;if(!l)return null;const r=[{key:"wins",label:"What\'s working:",body:l.whats_working,href:"#section-wins",link:"Impressive Things You Did \u2192",showLink:n.wins},{key:"friction",label:"What\'s hindering you:",body:l.whats_hindering,href:"#section-friction",link:"Where Things Go Wrong \u2192",showLink:n.friction},{key:"features",label:"Quick wins to try:",body:l.quick_wins,href:"#section-features",link:"Features to Try \u2192",showLink:n.features},{key:"horizon",label:"Ambitious workflows:",body:l.ambitious_workflows,href:"#section-horizon",link:"On the Horizon \u2192",showLink:n.horizon}].filter(a=>te(a.body));return r.length===0?null:e.createElement("div",{className:"at-a-glance"},e.createElement("div",{className:"glance-title"},"At a Glance"),e.createElement("div",{className:"glance-sections"},r.map(a=>e.createElement("div",{key:a.key,className:"glance-section"},e.createElement("strong",null,a.label)," ",e.createElement(p,null,a.body),a.showLink&&e.createElement("a",{href:a.href,className:"see-more"},a.link)))))}function le({sections:t}){return t.length===0?null:e.createElement("nav",{className:"nav-toc"},t.map(n=>e.createElement("a",{key:n.href,href:n.href},n.label)))}function re({qualitative:t,topGoals:n,topTools:l}){const{projectAreas:r}=t,a=Array.isArray(l)?Object.fromEntries(l):l;return e.createElement(e.Fragment,null,e.createElement("h2",{id:"section-work",className:"text-xl font-semibold text-slate-900 mt-8 mb-4"},"What You Work On"),Array.isArray(r==null?void 0:r.areas)&&r.areas.length>0&&e.createElement("div",{className:"project-areas mb-6"},r.areas.map((s,o)=>e.createElement("div",{key:o,className:"project-area"},e.createElement("div",{className:"area-header"},e.createElement("span",{className:"area-name"},s.name),e.createElement("span",{className:"area-count"},"~",s.session_count," sessions")),e.createElement("div",{className:"area-desc"},e.createElement(p,null,s.description))))),e.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:"24px",marginBottom:"24px"}},n&&Object.keys(n).length>0&&e.createElement(M,{data:n,title:"What You Wanted",color:"#0ea5e9"}),a&&Object.keys(a).length>0&&e.createElement(M,{data:a,title:"Top Tools Used",color:"#6366f1"})))}function ae({qualitative:t,insights:n}){const{interactionStyle:l}=t;return l?e.createElement(e.Fragment,null,e.createElement("h2",{id:"section-usage",className:"text-xl font-semibold text-slate-900 mt-8 mb-4"},"How You Use Qwen Code"),e.createElement("div",{className:"narrative"},e.createElement("p",null,e.createElement(p,null,l.narrative)),l.key_pattern&&e.createElement("div",{className:"key-insight"},e.createElement("strong",null,"Key pattern:")," ",e.createElement(p,null,l.key_pattern))),e.createElement(V,{insights:n}),e.createElement(Z,{heatmap:n.heatmap})):null}function se({qualitative:t,primarySuccess:n,outcomes:l}){const r=t==null?void 0:t.impressiveWorkflows;return e.createElement(e.Fragment,null,e.createElement("h2",{id:"section-wins",className:"text-xl font-semibold text-slate-900 mt-8 mb-4"},"Impressive Things You Did"),(r==null?void 0:r.intro)&&e.createElement("p",{className:"section-intro"},e.createElement(p,null,r.intro)),r&&e.createElement("div",{className:"big-wins"},Array.isArray(r.impressive_workflows)&&r.impressive_workflows.map((a,s)=>e.createElement("div",{key:s,className:"big-win"},e.createElement("div",{className:"big-win-title"},a.title),e.createElement("div",{className:"big-win-desc"},e.createElement(p,null,a.description))))),e.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:"24px",marginTop:"24px",marginBottom:"24px"}},n&&Object.keys(n).length>0&&e.createElement(M,{data:n,title:"What Helped Most (Qwen\'s Capabilities)",color:"#3b82f6",allowedKeys:["fast_accurate_search","correct_code_edits","good_explanations","proactive_help","multi_file_changes","good_debugging"]}),l&&Object.keys(l).length>0&&e.createElement(M,{data:l,title:"Outcomes",color:"#8b5cf6",allowedKeys:["fully_achieved","mostly_achieved","partially_achieved","not_achieved","unclear_from_transcript"]})))}function oe(t){return t==="unclear_from_transcript"?"Unclear":t.split("_").map(n=>n.charAt(0).toUpperCase()+n.slice(1)).join(" ")}function M({data:t,title:n,color:l="#3b82f6",allowedKeys:r=null}){if(!t||Object.keys(t).length===0)return null;let a=Object.entries(t).filter(([,o])=>Number.isFinite(o)&&o!==0);if(r&&(a=a.filter(([o])=>r.includes(o))),a.sort((o,i)=>i[1]-o[1]),a=a.slice(0,10),a.length===0)return null;const s=Math.max(...a.map(([,o])=>o));return e.createElement("div",{className:"bar-chart-card",style:{flex:1,minWidth:0,backgroundColor:"#ffffff",borderRadius:"12px",padding:"20px",boxShadow:"0 1px 3px rgba(0, 0, 0, 0.08)",border:"1px solid #e2e8f0"}},e.createElement("h3",{style:{fontSize:"13px",fontWeight:700,color:"#64748b",marginTop:0,marginBottom:"16px",textTransform:"uppercase",letterSpacing:"0.5px"}},n),e.createElement("div",{className:"bar-chart",style:{display:"flex",flexDirection:"column",gap:"10px"}},a.map(([o,i])=>{const m=s>0?i/s*100:0;return e.createElement("div",{key:o,className:"bar-row",style:{display:"flex",alignItems:"center",gap:"12px"}},e.createElement("div",{className:"bar-label",style:{width:"130px",fontSize:"13px",color:"#475569",textAlign:"left",flexShrink:0,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}},oe(o)),e.createElement("div",{className:"bar-wrapper",style:{flex:1,display:"flex",alignItems:"center",gap:"10px",minWidth:0}},e.createElement("div",{className:"bar-bg",style:{flex:1,height:"8px",backgroundColor:"#f1f5f9",borderRadius:"4px",overflow:"hidden"}},e.createElement("div",{className:"bar-fill",style:{width:`${m}%`,height:"100%",backgroundColor:l,borderRadius:"4px",transition:"width 0.3s ease"}})),e.createElement("span",{className:"bar-value",style:{fontSize:"13px",fontWeight:600,color:"#475569",minWidth:"24px",textAlign:"right"}},i)))})))}function ie({qualitative:t,satisfaction:n,friction:l}){const r=t==null?void 0:t.frictionPoints;return e.createElement(e.Fragment,null,e.createElement("h2",{id:"section-friction",className:"text-xl font-semibold text-slate-900 mt-8 mb-4"},"Where Things Go Wrong"),(r==null?void 0:r.intro)&&e.createElement("p",{className:"section-intro"},e.createElement(p,null,r.intro)),r&&e.createElement("div",{className:"friction-categories"},Array.isArray(r.categories)&&r.categories.map((a,s)=>e.createElement("div",{key:s,className:"friction-category"},e.createElement("div",{className:"friction-title"},a.category),e.createElement("div",{className:"friction-desc"},e.createElement(p,null,a.description)),Array.isArray(a.examples)&&a.examples.length>0&&e.createElement("ul",{className:"friction-examples"},a.examples.map((o,i)=>e.createElement("li",{key:i},e.createElement(p,null,o))))))),e.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(2, 1fr)",gap:"24px",marginTop:"24px",marginBottom:"24px"}},l&&Object.keys(l).length>0&&e.createElement(M,{data:l,title:"Primary Friction Types",color:"#ef4444",allowedKeys:["misunderstood_request","wrong_approach","buggy_code","user_rejected_action","excessive_changes"]}),n&&Object.keys(n).length>0&&e.createElement(M,{data:n,title:"Inferred Satisfaction (model-estimated)",color:"#10b981",allowedKeys:["happy","satisfied","likely_satisfied","dissatisfied","frustrated"]})))}function me({additions:t}){const[n,l]=e.useState(new Array(t.length).fill(!0)),[r,a]=e.useState(!1),s=m=>{const c=n.map((d,g)=>g===m?!d:d);l(c)},o=()=>{const m=t.filter((c,d)=>n[d]).map(c=>c.addition).join(`\n\n`);m&&navigator.clipboard.writeText(m).then(()=>{a(!0),setTimeout(()=>a(!1),2e3)})},i=n.filter(Boolean).length;return e.createElement("div",{className:"qwen-md-section"},e.createElement("h3",null,"Suggested QWEN.md Additions"),e.createElement("p",{className:"text-xs text-slate-500 mb-3"},"Just copy this into Qwen Code to add it to your QWEN.md."),e.createElement("div",{className:"qwen-md-actions",style:{marginBottom:"12px"}},e.createElement("button",{className:`copy-all-btn ${r?"copied":""}`,onClick:o,disabled:i===0},r?"Copied All!":`Copy All Checked (${i})`)),t.map((m,c)=>e.createElement("div",{key:c,className:"qwen-md-item"},e.createElement("input",{type:"checkbox",checked:n[c],onChange:()=>s(c),className:"cmd-checkbox"}),e.createElement("div",{style:{flex:1}},e.createElement("code",{className:"cmd-code"},m.addition),e.createElement("div",{className:"cmd-why"},e.createElement(p,null,m.why))),e.createElement(H,{text:m.addition}))))}function ce({qualitative:t}){const{improvements:n}=t;if(!n)return null;const l=Array.isArray(n.Qwen_md_additions)&&n.Qwen_md_additions.length>0||Array.isArray(n.features_to_try)&&n.features_to_try.length>0,r=Array.isArray(n.usage_patterns)&&n.usage_patterns.length>0;return!l&&!r?null:e.createElement(e.Fragment,null,l&&e.createElement(e.Fragment,null,e.createElement("h2",{id:"section-features",className:"text-xl font-semibold text-slate-900 mt-8 mb-4"},"Existing Qwen Code Features to Try"),Array.isArray(n.Qwen_md_additions)&&n.Qwen_md_additions.length>0&&e.createElement(me,{additions:n.Qwen_md_additions}),e.createElement("p",{className:"text-xs text-slate-500 mb-3"},"Just copy this into Qwen Code and it\'ll set it up for you."),e.createElement("div",{className:"features-section"},Array.isArray(n.features_to_try)&&n.features_to_try.map((a,s)=>e.createElement("div",{key:s,className:"feature-card"},e.createElement("div",{className:"feature-title"},a.feature),e.createElement("div",{className:"feature-oneliner"},e.createElement(p,null,a.one_liner)),e.createElement("div",{className:"feature-why"},e.createElement("strong",null,"Why for you:")," ",e.createElement(p,null,a.why_for_you)),e.createElement("div",{className:"feature-examples"},e.createElement("div",{className:"feature-example"},e.createElement("div",{className:"example-code-row"},e.createElement("code",{className:"example-code"},a.example_code),e.createElement(H,{text:a.example_code})))))))),r&&e.createElement(e.Fragment,null,e.createElement("h2",{id:"section-patterns",className:"text-xl font-semibold text-slate-900 mt-8 mb-4"},"New Ways to Use Qwen Code"),e.createElement("p",{className:"text-xs text-slate-500 mb-3"},"Just copy this into Qwen Code and it\'ll walk you through it."),e.createElement("div",{className:"patterns-section"},Array.isArray(n.usage_patterns)&&n.usage_patterns.map((a,s)=>e.createElement("div",{key:s,className:"pattern-card"},e.createElement("div",{className:"pattern-title"},a.title),e.createElement("div",{className:"pattern-summary"},e.createElement(p,null,a.suggestion)),e.createElement("div",{className:"pattern-detail"},e.createElement(p,null,a.detail)),e.createElement("div",{className:"copyable-prompt-section"},e.createElement("div",{className:"prompt-label"},"Paste into Qwen Code:"),e.createElement("div",{className:"copyable-prompt-row"},e.createElement("code",{className:"copyable-prompt"},a.copyable_prompt),e.createElement(H,{text:a.copyable_prompt}))))))))}function de({qualitative:t}){const{futureOpportunities:n}=t;return n?e.createElement(e.Fragment,null,e.createElement("h2",{id:"section-horizon",className:"text-xl font-semibold text-slate-900 mt-8 mb-4"},"On the Horizon"),n.intro&&e.createElement("p",{className:"section-intro"},e.createElement(p,null,n.intro)),e.createElement("div",{className:"horizon-section"},Array.isArray(n.opportunities)&&n.opportunities.map((l,r)=>e.createElement("div",{key:r,className:"horizon-card"},e.createElement("div",{className:"horizon-title"},l.title),e.createElement("div",{className:"horizon-possible"},e.createElement(p,null,l.whats_possible)),e.createElement("div",{className:"horizon-tip"},e.createElement("strong",null,"Getting started:")," ",e.createElement(p,null,l.how_to_try)),e.createElement("div",{className:"pattern-prompt"},e.createElement("div",{className:"prompt-label"},"Paste into Qwen Code:"),e.createElement("div",{style:{display:"flex",alignItems:"flex-start",gap:"8px"}},e.createElement("code",{style:{flex:1}},l.copyable_prompt),e.createElement(H,{text:l.copyable_prompt}))))))):null}function pe({qualitative:t}){const{memorableMoment:n}=t;return n?e.createElement("div",{className:"fun-ending"},e.createElement("div",{className:"fun-headline"},\'"\',n.headline,\'"\'),e.createElement("div",{className:"fun-detail"},e.createElement(p,null,n.detail))):null}const ue={light:{background:"linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",textPrimary:"#0f172a",textSecondary:"#475569",textMuted:"#64748b",cardBackground:"rgba(255,255,255,0.7)",cardBackgroundSecondary:"rgba(255,255,255,0.5)",borderColor:"#e2e8f0",heatmapColors:["#9be9a8","#40c463","#30a14e","#216e39"],heatmapEmpty:"#ebedf0"},dark:{background:"linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",textPrimary:"#f8fafc",textSecondary:"#e2e8f0",textMuted:"#94a3b8",cardBackground:"rgba(255,255,255,0.05)",cardBackgroundSecondary:"rgba(255,255,255,0.04)",borderColor:"rgba(255,255,255,0.08)",heatmapColors:["#0e4429","#006d32","#26a641","#39d353"],heatmapEmpty:"#2d333b"}};function fe({data:t,theme:n="light"}){var h,T,u,f,C,_;const l=ue[n],{totalMessages:r=0,totalSessions:a=0,totalLinesAdded:s=0,totalLinesRemoved:o=0,totalFiles:i=0,currentStreak:m=0,longestStreak:c=0,activeHours:d={}}=t,g=Object.keys(t.heatmap||{});let E=0,x="";if(g.length>0){E=g.length;const v=g.map(S=>Y(S).getTime()),N=new Date(Math.min(...v)),q=new Date(Math.max(...v)),k=S=>D(S);x=`${k(N)} \u2014 ${k(q)}`}const A=(u=(T=(h=t.qualitative)==null?void 0:h.interactionStyle)==null?void 0:T.key_pattern)!=null?u:null,w=(_=(C=(f=t.qualitative)==null?void 0:f.memorableMoment)==null?void 0:C.headline)!=null?_:null,j=ge(t.heatmap||{},l);return e.createElement("div",{id:"share-card",style:{width:"1200px",background:l.background,color:l.textPrimary,fontFamily:\'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"\',display:"flex",flexDirection:"column",padding:"48px 56px",position:"absolute",left:"-9999px",top:"-9999px",overflow:"hidden",boxSizing:"border-box"}},e.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"32px"}},e.createElement("div",null,e.createElement("div",{style:{fontSize:"32px",fontWeight:700,letterSpacing:"-0.02em",lineHeight:1.2}},"Qwen Code Insights"),e.createElement("div",{style:{fontSize:"14px",color:l.textMuted,marginTop:"6px"}},x)),e.createElement("div",{style:{fontSize:"11px",color:l.textMuted,textTransform:"uppercase",letterSpacing:"0.15em",paddingTop:"8px"}},"qwen.ai")),e.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(6, 1fr)",gap:"16px",marginBottom:"32px"}},e.createElement(z,{value:String(r),label:"Messages",theme:l}),e.createElement(z,{value:String(a),label:"Sessions",theme:l}),e.createElement(z,{value:`+${s}/-${o}`,label:"Lines Changed",small:!0,theme:l}),e.createElement(z,{value:String(i),label:"Files",theme:l}),e.createElement(z,{value:`${m}d`,label:"Streak",theme:l}),e.createElement(z,{value:`${c}d`,label:"Best Streak",theme:l})),e.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"24px",marginBottom:"16px"}},e.createElement("div",{style:{background:l.cardBackground,borderRadius:"12px",padding:"20px",display:"flex",flexDirection:"column"}},e.createElement("div",{style:{fontSize:"12px",fontWeight:600,color:l.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"12px"}},"Activity \xB7 ",E," active days"),e.createElement("div",{style:{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}},e.createElement(xe,{cells:j})),e.createElement(Ee,{theme:l})),e.createElement("div",{style:{display:"flex",flexDirection:"column",gap:"16px"}},e.createElement("div",{style:{background:l.cardBackground,borderRadius:"12px",padding:"20px",display:"flex",flexDirection:"column"}},e.createElement("div",{style:{fontSize:"12px",fontWeight:600,color:l.textMuted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"12px"}},"Active Hours"),e.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:"10px"}},e.createElement(he,{activeHours:d,theme:l}))),e.createElement("div",{style:{background:l.cardBackgroundSecondary,borderRadius:"12px",padding:"16px 16px",position:"relative"}},e.createElement("div",{style:{position:"absolute",left:"12px",fontSize:"64px",fontWeight:700,color:n==="light"?"rgba(99,102,241,0.15)":"rgba(99,102,241,0.2)",lineHeight:1,fontFamily:\'Georgia, "Times New Roman", serif\',userSelect:"none",pointerEvents:"none"}},"\u201C"),e.createElement("div",{style:{paddingLeft:"40px",position:"relative"}},A&&e.createElement("div",{style:{fontSize:"13px",color:l.textSecondary,lineHeight:1.6,marginBottom:w?"8px":0}},A),w&&e.createElement("div",{style:{fontSize:"12px",color:l.textMuted,lineHeight:1.5,fontStyle:"italic"}},w))))),e.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"auto",paddingTop:"24px",borderTop:`1px solid ${l.borderColor}`,flexShrink:0}},e.createElement("div",{style:{fontSize:"12px",color:l.textMuted}},"Generated by Qwen Code \xB7 ",D(new Date)),e.createElement("div",{style:{fontSize:"12px",color:l.textMuted}},"github.com/QwenLM/qwen-code")))}function z({value:t,label:n,small:l,theme:r}){return e.createElement("div",{style:{textAlign:"center"}},e.createElement("div",{style:{fontSize:l?"18px":"28px",fontWeight:700,color:r.textPrimary,lineHeight:1.2}},t),e.createElement("div",{style:{fontSize:"11px",color:r.textMuted,textTransform:"uppercase",letterSpacing:"0.05em",marginTop:"4px"}},n))}function he({activeHours:t,theme:n}){const r=[{label:"Morning",time:"06\u201312",hours:[6,7,8,9,10,11],color:"#fbbf24"},{label:"Afternoon",time:"12\u201318",hours:[12,13,14,15,16,17],color:"#0ea5e9"},{label:"Evening",time:"18\u201322",hours:[18,19,20,21],color:"#6366f1"},{label:"Night",time:"22\u201306",hours:[22,23,0,1,2,3,4,5],color:"#475569"}].map(s=>({...s,total:s.hours.reduce((o,i)=>o+(t[i]||0),0)})),a=Math.max(...r.map(s=>s.total),1);return e.createElement(e.Fragment,null,r.map(s=>{const o=a>0?s.total/a*100:0;return e.createElement("div",{key:s.label},e.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:"12px",marginBottom:"4px"}},e.createElement("div",{style:{display:"flex",alignItems:"center",gap:"6px"}},e.createElement("span",{style:{width:"8px",height:"8px",borderRadius:"50%",backgroundColor:s.color,display:"inline-block",flexShrink:0}}),e.createElement("span",{style:{color:n.textSecondary,fontWeight:500}},s.label),e.createElement("span",{style:{color:n.textMuted,fontSize:"11px"}},s.time)),e.createElement("span",{style:{color:n.textMuted,fontWeight:600}},s.total)),e.createElement("div",{style:{height:"6px",background:n.borderColor,borderRadius:"3px",overflow:"hidden"}},e.createElement("div",{style:{width:`${o}%`,height:"100%",backgroundColor:s.color,borderRadius:"3px"}})))}))}function ge(t,n){const l=new Date,a=26*7,s=new Date(l);s.setDate(s.getDate()-a+1),s.setDate(s.getDate()-s.getDay());const o=[],i=new Date(l);i.setDate(i.getDate()+(6-i.getDay()));const m=new Date(s);for(;m<=i;){const c=D(m),d=t[c]||0;o.push({color:ye(d,n)}),m.setDate(m.getDate()+1)}return o}function ye(t,n){return t===0?n.heatmapEmpty:t<2?n.heatmapColors[0]:t<4?n.heatmapColors[1]:t<10?n.heatmapColors[2]:n.heatmapColors[3]}function xe({cells:t}){const l=Math.ceil(t.length/7),r=14,a=3,s=l*(r+a),o=7*(r+a);return e.createElement("svg",{width:s,height:o,viewBox:`0 0 ${s} ${o}`},t.map((i,m)=>{const c=Math.floor(m/7),d=m%7;return e.createElement("rect",{key:m,x:c*(r+a),y:d*(r+a),width:r,height:r,rx:2,fill:i.color})}))}function Ee({theme:t}){return e.createElement("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginTop:"12px"}},e.createElement("span",{style:{fontSize:"11px",color:t.textMuted}},"Less"),[t.heatmapEmpty,t.heatmapColors[0],t.heatmapColors[1],t.heatmapColors[2],t.heatmapColors[3]].map((n,l)=>e.createElement("span",{key:l,style:{width:"10px",height:"10px",borderRadius:"2px",backgroundColor:n,display:"inline-block"}})),e.createElement("span",{style:{fontSize:"11px",color:t.textMuted}},"More"))}function b(t){return typeof t=="string"?t.trim().length>0:typeof t=="number"?Number.isFinite(t)&&t!==0:typeof t=="boolean"?t:Array.isArray(t)?t.some(n=>b(n)):t&&typeof t=="object"?Object.values(t).some(n=>b(n)):!1}function W(t){return Array.isArray(t)?t.some(([,n])=>Number.isFinite(n)&&n!==0):!!t&&Object.values(t).some(n=>Number.isFinite(n)&&n!==0)}function $(t){return Array.isArray(t)&&t.some(n=>b(n))}function ve({data:t}){var u,f,C,_,v,N,q,k,S,I,K,U;const[n,l]=e.useState("dark"),r=e.useRef(!1),a=async()=>{const F=document.getElementById("share-card");if(!F||!window.html2canvas){alert("Export functionality is not available.");return}try{const y=F.cloneNode(!0);y.style.position="fixed",y.style.left="-9999px",y.style.top="0",y.style.pointerEvents="none",document.body.appendChild(y);const P=await window.html2canvas(y,{scale:2,useCORS:!0,logging:!1,width:1200,height:y.scrollHeight});document.body.removeChild(y);const G=P.toDataURL("image/png"),L=document.createElement("a");L.href=G,L.download=`qwen-insights-card-${D(new Date)}.png`,L.click()}catch(y){console.error("Export card error:",y),alert("Failed to export card. Please try again.")}};e.useEffect(()=>{r.current&&(r.current=!1,a())},[n]);const s=F=>{F===n?a():(r.current=!0,l(F))};if(!t)return e.createElement("div",{className:"text-center text-slate-600"},"No insight data available");const o=Object.keys(t.heatmap||{});let i="";if(o.length>0){const y=o.map(B=>Y(B)).map(B=>B.getTime()),P=new Date(Math.min(...y)),G=new Date(Math.max(...y)),L=B=>D(B);i=`${L(P)} to ${L(G)}`}const m=b((u=t.qualitative)==null?void 0:u.atAGlance),c=!!t.qualitative&&(b(t.qualitative.projectAreas)||W(t.topGoals)||W(t.topTools)),d=b((f=t.qualitative)==null?void 0:f.interactionStyle),g=!!t.qualitative&&(b(t.qualitative.impressiveWorkflows)||W(t.primarySuccess)||W(t.outcomes)),E=!!t.qualitative&&(b(t.qualitative.frictionPoints)||W(t.satisfaction)||W(t.friction)),x=!!t.qualitative&&($((C=t.qualitative.improvements)==null?void 0:C.Qwen_md_additions)||$((_=t.qualitative.improvements)==null?void 0:_.features_to_try)),A=!!t.qualitative&&$((v=t.qualitative.improvements)==null?void 0:v.usage_patterns),w=b((N=t.qualitative)==null?void 0:N.futureOpportunities),j=b((q=t.qualitative)==null?void 0:q.memorableMoment),h=[];c&&h.push({href:"#section-work",label:"What You Work On"}),d&&h.push({href:"#section-usage",label:"How You Use Qwen Code"}),g&&h.push({href:"#section-wins",label:"Impressive Things"}),E&&h.push({href:"#section-friction",label:"Where Things Go Wrong"}),x&&h.push({href:"#section-features",label:"Features to Try"}),A&&h.push({href:"#section-patterns",label:"New Usage Patterns"}),w&&h.push({href:"#section-horizon",label:"On the Horizon"});const T={wins:g,friction:E,features:x,horizon:w};return e.createElement("div",null,e.createElement("header",{className:"insights-header"},e.createElement("div",{className:"header-content"},e.createElement("div",{className:"header-title-section"},e.createElement("h1",{className:"header-title"},"Qwen Code Insights"),e.createElement("p",{className:"header-subtitle"},t.totalMessages?`${t.totalMessages.toLocaleString()} messages across ${(k=t.totalSessions)==null?void 0:k.toLocaleString()} sessions`:"Your personalized coding journey and patterns",i&&` \xB7 ${i}`)),e.createElement(be,{onExport:s}))),m&&t.qualitative&&e.createElement(ne,{qualitative:t.qualitative,targetSections:T}),h.length>0&&e.createElement(le,{sections:h}),e.createElement(J,{data:t}),c&&t.qualitative&&e.createElement(re,{qualitative:t.qualitative,topGoals:t.topGoals,topTools:t.topTools}),d&&t.qualitative&&e.createElement(ae,{qualitative:t.qualitative,insights:t}),g&&e.createElement(se,{qualitative:t.qualitative,primarySuccess:(S=t.primarySuccess)!=null?S:{},outcomes:(I=t.outcomes)!=null?I:{}}),E&&e.createElement(ie,{qualitative:t.qualitative,satisfaction:(K=t.satisfaction)!=null?K:{},friction:(U=t.friction)!=null?U:{}}),(x||A)&&t.qualitative&&e.createElement(ce,{qualitative:t.qualitative}),w&&t.qualitative&&e.createElement(de,{qualitative:t.qualitative}),j&&t.qualitative&&e.createElement(pe,{qualitative:t.qualitative}),e.createElement(fe,{data:t,theme:n}))}function be({onExport:t}){const[n,l]=e.useState(!1),r=e.useRef(null);e.useEffect(()=>{if(!n)return;const s=o=>{r.current&&!r.current.contains(o.target)&&l(!1)};return document.addEventListener("mousedown",s),()=>document.removeEventListener("mousedown",s)},[n]);const a=s=>{l(!1),t(s)};return e.createElement("div",{className:"export-dropdown-wrapper",ref:r},e.createElement("button",{className:"export-card-btn",onClick:()=>l(!n)},e.createElement("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},e.createElement("path",{d:"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"}),e.createElement("polyline",{points:"16 6 12 2 8 6"}),e.createElement("line",{x1:"12",y1:"2",x2:"12",y2:"15"})),e.createElement("span",null,"Export Card"),e.createElement("svg",{width:"12",height:"12",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:`export-chevron ${n?"open":""}`},e.createElement("polyline",{points:"6 9 12 15 18 9"}))),n&&e.createElement("div",{className:"export-dropdown"},e.createElement("button",{className:"export-dropdown-item",onClick:()=>a("light")},e.createElement("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},e.createElement("circle",{cx:"12",cy:"12",r:"5"}),e.createElement("line",{x1:"12",y1:"1",x2:"12",y2:"3"}),e.createElement("line",{x1:"12",y1:"21",x2:"12",y2:"23"}),e.createElement("line",{x1:"4.22",y1:"4.22",x2:"5.64",y2:"5.64"}),e.createElement("line",{x1:"18.36",y1:"18.36",x2:"19.78",y2:"19.78"}),e.createElement("line",{x1:"1",y1:"12",x2:"3",y2:"12"}),e.createElement("line",{x1:"21",y1:"12",x2:"23",y2:"12"}),e.createElement("line",{x1:"4.22",y1:"19.78",x2:"5.64",y2:"18.36"}),e.createElement("line",{x1:"18.36",y1:"5.64",x2:"19.78",y2:"4.22"})),e.createElement("span",null,"Light Theme")),e.createElement("button",{className:"export-dropdown-item",onClick:()=>a("dark")},e.createElement("svg",{width:"14",height:"14",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"},e.createElement("path",{d:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"})),e.createElement("span",null,"Dark Theme"))))}const Q=document.getElementById("react-root");Q&&window.INSIGHT_DATA&&O?O.createRoot(Q).render(e.createElement(ve,{data:window.INSIGHT_DATA})):console.error("Failed to mount React app:",{container:!!Q,data:!!window.INSIGHT_DATA,ReactDOM:!!O})})(React,ReactDOM);';
var INSIGHT_CSS = '*,:before,:after,::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: #3b82f680;--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }*,:before,:after{box-sizing:border-box;border:0 solid #e5e7eb}:before,:after{--tw-content: ""}html,:host{-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";line-height:1.5}body{line-height:inherit;margin:0;background-image:linear-gradient(to bottom right,var(--tw-gradient-stops));--tw-gradient-from: #f8fafc var(--tw-gradient-from-position);--tw-gradient-to: #f1f5f9 var(--tw-gradient-to-position);--tw-gradient-stops: var(--tw-gradient-from), #fff var(--tw-gradient-via-position), var(--tw-gradient-to);--tw-text-opacity: 1;min-height:100vh;color:rgb(15 23 42 / var(--tw-text-opacity, 1));-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.glass-card{--tw-border-opacity: 1;border-width:1px;border-color:rgb(226 232 240 / var(--tw-border-opacity, 1));--tw-shadow: 0 10px 40px #0f172a14;--tw-shadow-colored: 0 10px 40px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow);--tw-backdrop-blur: blur(8px);backdrop-filter:var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);background-color:#fff9;border-radius:1rem}.col-span-2{grid-column:span 2 / span 2}.mx-auto{margin-left:auto;margin-right:auto}.mb-8{margin-bottom:2rem}.ml-2{margin-left:.5rem}.mt-1{margin-top:.25rem}.mt-2{margin-top:.5rem}.mt-4{margin-top:1rem}.mt-6{margin-top:1.5rem}.block{display:block}.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.h-56{height:14rem}.h-full{height:100%}.min-h-screen{min-height:100vh}.w-full{width:100%}.min-w-\\[720px\\]{min-width:720px}.max-w-6xl{max-width:72rem}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.flex-col{flex-direction:column}.items-start{align-items:flex-start}.items-center{align-items:center}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-1{gap:.25rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.space-y-3>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(.75rem * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.75rem * var(--tw-space-y-reverse))}.space-y-4>:not([hidden])~:not([hidden]){--tw-space-y-reverse: 0;margin-top:calc(1rem * calc(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1rem * var(--tw-space-y-reverse))}.divide-y>:not([hidden])~:not([hidden]){--tw-divide-y-reverse: 0;border-top-width:calc(1px * calc(1 - var(--tw-divide-y-reverse)));border-bottom-width:calc(1px * var(--tw-divide-y-reverse))}.divide-slate-200>:not([hidden])~:not([hidden]){--tw-divide-opacity: 1;border-color:rgb(226 232 240 / var(--tw-divide-opacity, 1))}.overflow-x-auto{overflow-x:auto}.rounded-full{border-radius:9999px}.rounded-xl{border-radius:1.25rem}.border{border-width:1px}.border-slate-100{--tw-border-opacity: 1;border-color:rgb(241 245 249 / var(--tw-border-opacity, 1))}.bg-emerald-50{--tw-bg-opacity: 1;background-color:rgb(236 253 245 / var(--tw-bg-opacity, 1))}.bg-slate-100{--tw-bg-opacity: 1;background-color:rgb(241 245 249 / var(--tw-bg-opacity, 1))}.bg-slate-50{--tw-bg-opacity: 1;background-color:rgb(248 250 252 / var(--tw-bg-opacity, 1))}.bg-slate-900{--tw-bg-opacity: 1;background-color:rgb(15 23 42 / var(--tw-bg-opacity, 1))}.bg-white\\/70{background-color:#ffffff73}.bg-gradient-to-br{background-image:linear-gradient(to bottom right,var(--tw-gradient-stops))}.from-slate-50{--tw-gradient-from: #f8fafc var(--tw-gradient-from-position);--tw-gradient-to: #f8fafc00 var(--tw-gradient-to-position);--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to)}.via-white{--tw-gradient-to: #ffffff00 var(--tw-gradient-to-position);--tw-gradient-stops: var(--tw-gradient-from), #ffffff var(--tw-gradient-via-position), var(--tw-gradient-to)}.to-slate-100{--tw-gradient-to: #f1f5f9 var(--tw-gradient-to-position)}.p-4{padding:1rem}.p-6{padding:1.5rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-4{padding-left:1rem;padding-right:1rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.px-8{padding-left:2rem;padding-right:2rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-10{padding-top:2.5rem;padding-bottom:2.5rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.py-6{padding-top:1.5rem;padding-bottom:1.5rem}.text-left{text-align:left}.text-center{text-align:center}.text-2xl{font-size:1.5rem;line-height:2rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-xs{font-size:.75rem;line-height:1rem}.font-bold{font-weight:700}.font-medium{font-weight:500}.font-semibold{font-weight:600}.uppercase{text-transform:uppercase}.tracking-\\[0\\.2em\\]{letter-spacing:.2em}.tracking-tight{letter-spacing:-.025em}.tracking-wide{letter-spacing:.025em}.text-emerald-700{--tw-text-opacity: 1;color:rgb(4 120 87 / var(--tw-text-opacity, 1))}.text-rose-700{--tw-text-opacity: 1;color:rgb(190 18 60 / var(--tw-text-opacity, 1))}.text-slate-200{--tw-text-opacity: 1;color:rgb(226 232 240 / var(--tw-text-opacity, 1))}.text-slate-400{--tw-text-opacity: 1;color:rgb(148 163 184 / var(--tw-text-opacity, 1))}.text-slate-500{--tw-text-opacity: 1;color:rgb(100 116 139 / var(--tw-text-opacity, 1))}.text-slate-600{--tw-text-opacity: 1;color:rgb(71 85 105 / var(--tw-text-opacity, 1))}.text-slate-700{--tw-text-opacity: 1;color:rgb(51 65 85 / var(--tw-text-opacity, 1))}.text-slate-900{--tw-text-opacity: 1;color:rgb(15 23 42 / var(--tw-text-opacity, 1))}.text-white{--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity, 1))}.shadow-inner{--tw-shadow: inset 0 2px 4px 0 #0000000d;--tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.shadow-soft{--tw-shadow: 0 10px 40px #0f172a14;--tw-shadow-colored: 0 10px 40px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.shadow-slate-100{--tw-shadow-color: #f1f5f9;--tw-shadow: var(--tw-shadow-colored)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-duration:.15s;transition-timing-function:cubic-bezier(.4,0,.2,1)}.hover\\:-translate-y-\\[1px\\]:hover{--tw-translate-y: -1px;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.hover\\:shadow-lg:hover{--tw-shadow: 0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a;--tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.focus-visible\\:outline:focus-visible{outline-style:solid}.focus-visible\\:outline-2:focus-visible{outline-width:2px}.focus-visible\\:outline-offset-2:focus-visible{outline-offset:2px}.focus-visible\\:outline-slate-400:focus-visible{outline-color:#94a3b8}.active\\:translate-y-\\[1px\\]:active{--tw-translate-y: 1px;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.group:hover .group-hover\\:translate-x-0\\.5{--tw-translate-x: .125rem;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}@media (min-width: 768px){.md\\:mt-6{margin-top:1.5rem}.md\\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.md\\:gap-6{gap:1.5rem}.md\\:py-12{padding-top:3rem;padding-bottom:3rem}.md\\:text-4xl{font-size:2.25rem;line-height:2.5rem}}.heatmap-container{width:100%;overflow-x:auto}.heatmap-svg{min-width:720px}.heatmap-day{cursor:pointer}.heatmap-day:hover{stroke:#00000024;stroke-width:1px}.heatmap-legend{display:flex;align-items:center;gap:4px;font-size:12px;color:#64748b;margin-top:8px}.heatmap-legend-item{width:10px;height:10px;border-radius:2px}.nav-toc{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 32px;padding:16px;background:#fff;border-radius:8px;border:1px solid #e2e8f0}.nav-toc a{font-size:12px;color:#64748b;text-decoration:none;padding:6px 12px;border-radius:6px;background:#f1f5f9;transition:all .15s}.nav-toc a:hover{background:#e2e8f0;color:#334155}.at-a-glance{background:linear-gradient(135deg,#fef3c7,#fde68a);border:1px solid #f59e0b;border-radius:12px;padding:20px 24px;margin-bottom:32px}.glance-title{font-size:16px;font-weight:700;color:#92400e;margin-bottom:16px}.glance-sections{display:flex;flex-direction:column;gap:12px}.glance-section{font-size:14px;color:#78350f;line-height:1.6}.glance-section strong{color:#92400e;font-weight:700}.see-more{color:#b45309;text-decoration:none;font-size:13px;white-space:nowrap;margin-left:4px}.see-more:hover{text-decoration:underline}.project-areas{display:flex;flex-direction:column;gap:12px;margin-bottom:32px}.project-area{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px}.area-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.area-name{font-weight:600;font-size:15px;color:#0f172a}.area-count{font-size:12px;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:4px}.area-desc{font-size:14px;color:#475569;line-height:1.5}.narrative{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:24px}.narrative p{margin-top:0;margin-bottom:12px;font-size:14px;color:#475569;line-height:1.7}.key-insight{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin-top:12px;font-size:14px;color:#166534}.section-intro{font-size:14px;color:#64748b;margin-bottom:16px}.big-wins{display:flex;flex-direction:column;gap:12px;margin-bottom:24px}.big-win{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px}.big-win-title{font-weight:600;font-size:15px;color:#166534;margin-bottom:8px}.big-win-desc{font-size:14px;color:#15803d;line-height:1.5}.friction-categories{display:flex;flex-direction:column;gap:16px;margin-bottom:24px}.friction-category{background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:16px}.friction-title{font-weight:600;font-size:15px;color:#991b1b;margin-bottom:6px}.friction-desc{font-size:13px;color:#7f1d1d;margin-bottom:10px}.friction-examples{margin:0 0 0 10px;padding:0;font-size:13px;color:#334155;list-style-type:disc}.friction-examples li{margin-bottom:4px}.qwen-md-section{background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;margin-bottom:20px}.qwen-md-section h3{font-size:13px;font-weight:600;color:#1e40af;margin:0 0 8px}.qwen-md-actions{margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #dbeafe}.copy-all-btn{background:#2563eb;color:#fff;border:none;border-radius:4px;padding:4px 10px;font-size:11px;cursor:pointer;font-weight:500;transition:all .2s}.copy-all-btn:hover{background:#1d4ed8}.copy-all-btn.copied{background:#16a34a}.qwen-md-item{display:flex;flex-wrap:wrap;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid #dbeafe}.qwen-md-item:last-child{border-bottom:none}.cmd-checkbox{margin-top:2px}.cmd-code{background:#fff;padding:6px 10px;border-radius:4px;font-size:11px;color:#1e40af;border:1px solid #bfdbfe;font-family:monospace;display:block;white-space:pre-wrap;word-break:break-word;flex:1}.cmd-why{font-size:11px;color:#64748b;width:100%;padding-left:20px;margin-top:4px}.features-section,.patterns-section{display:flex;flex-direction:column;gap:12px;margin:16px 0}.feature-card{background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px}.pattern-card{background:#f0f9ff;border:1px solid #7dd3fc;border-radius:8px;padding:16px}.feature-title,.pattern-title{font-weight:600;font-size:15px;color:#0f172a;margin-bottom:6px}.feature-oneliner,.pattern-summary{font-size:14px;color:#475569;margin-bottom:8px}.feature-why,.pattern-detail{font-size:13px;color:#334155;line-height:1.5}.feature-examples{margin-top:12px}.feature-example{padding:8px 0;border-top:1px solid #d1fae5}.feature-example:first-child{border-top:none}.example-code-row,.copyable-prompt-row{display:flex;align-items:flex-start;gap:8px}.example-code{flex:1;background:#f1f5f9;padding:8px 12px;border-radius:4px;font-family:monospace;font-size:12px;color:#334155;overflow-x:auto;white-space:pre-wrap}.copyable-prompt-section{margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0}.copyable-prompt{flex:1;background:#f8fafc;padding:10px 12px;border-radius:4px;font-family:monospace;font-size:12px;color:#334155;border:1px solid #e2e8f0;white-space:pre-wrap;line-height:1.5}.prompt-label{font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;margin-bottom:6px}.copy-btn{background:#e2e8f0;border:none;border-radius:4px;padding:4px 8px;font-size:11px;cursor:pointer;color:#475569;flex-shrink:0;transition:all .2s}.copy-btn:hover{background:#cbd5e1}.horizon-section{display:flex;flex-direction:column;gap:16px}.horizon-card{background:linear-gradient(135deg,#faf5ff,#f5f3ff);border:1px solid #c4b5fd;border-radius:8px;padding:16px}.horizon-title{font-weight:600;font-size:15px;color:#5b21b6;margin-bottom:8px}.horizon-possible{font-size:14px;color:#334155;margin-bottom:10px;line-height:1.5}.horizon-tip{font-size:13px;color:#6b21a8;background:#fff9;padding:8px 12px;border-radius:4px}.pattern-prompt{background:#f8fafc;padding:12px;border-radius:6px;margin-top:12px;border:1px solid #e2e8f0;display:flex;flex-direction:column;gap:8px}.pattern-prompt code{font-family:monospace;font-size:12px;color:#334155;display:block;white-space:pre-wrap}.fun-ending{background:linear-gradient(135deg,#fef3c7,#fde68a);border:1px solid #fbbf24;border-radius:12px;padding:24px;margin-top:40px;text-align:center}.fun-headline{font-size:18px;font-weight:600;color:#78350f;margin-bottom:8px}.fun-detail{font-size:14px;color:#92400e}.stats-row{display:flex;gap:24px;margin-bottom:40px;padding:20px 0;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;flex-wrap:wrap}.stat{text-align:center}.stat-value{font-size:24px;font-weight:700;color:#0f172a}.stat-label{font-size:11px;color:#64748b;text-transform:uppercase}@media (max-width: 640px){.stats-row{justify-content:center}}.header-with-action{position:relative}.insights-header{margin-bottom:2rem;padding:1.5rem 0;border-bottom:1px solid #e2e8f0}.header-content{display:flex;justify-content:space-between;align-items:center;gap:1.5rem;flex-wrap:wrap}.header-title-section{flex:1;min-width:0}.header-title{font-size:1.75rem;font-weight:700;color:#0f172a;letter-spacing:-.02em;margin:0 0 .375rem;line-height:1.2}.header-subtitle{font-size:.875rem;color:#64748b;margin:0;font-weight:400}.export-dropdown-wrapper{position:relative}.export-card-btn{display:inline-flex;align-items:center;gap:.5rem;height:36px;padding:0 .875rem;border:1px solid #e2e8f0;border-radius:8px;background:#fff;color:#334155;font-size:.8125rem;font-weight:500;cursor:pointer;transition:all .15s ease}.export-card-btn:hover{background:#f8fafc;border-color:#cbd5e1}.export-card-btn:active{background:#f1f5f9}.export-chevron{transition:transform .15s ease;opacity:.5}.export-chevron.open{transform:rotate(180deg)}.export-dropdown{position:absolute;top:calc(100% + 4px);right:0;min-width:160px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 4px 16px #00000014;padding:4px;z-index:50}.export-dropdown-item{display:flex;align-items:center;gap:.5rem;width:100%;padding:.5rem .75rem;border:none;border-radius:6px;background:none;color:#334155;font-size:.8125rem;font-weight:400;cursor:pointer;transition:background .1s ease}.export-dropdown-item:hover{background:#f1f5f9}.export-dropdown-item:active{background:#e2e8f0}@media (max-width: 640px){.header-content{flex-direction:column;align-items:flex-start;gap:1rem}.header-title{font-size:1.5rem}}';

// packages/web-templates/src/generated/exportHtmlTemplate.ts
init_esbuild_shims();
var HTML_TEMPLATE = '<!doctype html>\n<html lang="en" class="dark">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <link\n      rel="icon"\n      type="image/svg+xml"\n      href="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20141.38%20140%22%3E%0A%20%20%3Cpath%0A%20%20%20%20fill%3D%22%23000000%22%0A%20%20%20%20d%3D%22m140.93%2085-16.35-28.33-1.93-3.34%208.66-15a3.323%203.323%200%200%200%200-3.34l-9.62-16.67c-.3-.51-.72-.93-1.22-1.22s-1.07-.45-1.67-.45H82.23l-8.66-15a3.33%203.33%200%200%200-2.89-1.67H51.43c-.59%200-1.17.16-1.66.45-.5.29-.92.71-1.22%201.22L32.19%2029.98l-1.92%203.33H12.96c-.59%200-1.17.16-1.66.45-.5.29-.93.71-1.22%201.22L.45%2051.66a3.323%203.323%200%200%200%200%203.34l18.28%2031.67-8.66%2015a3.32%203.32%200%200%200%200%203.34l9.62%2016.67c.3.51.72.93%201.22%201.22s1.07.45%201.67.45h36.56l8.66%2015a3.35%203.35%200%200%200%202.89%201.67h19.25a3.34%203.34%200%200%200%202.89-1.67l18.28-31.67h17.32c.6%200%201.17-.16%201.67-.45s.92-.71%201.22-1.22l9.62-16.67a3.323%203.323%200%200%200%200-3.34ZM51.44%203.33%2061.07%2020l-9.63%2016.66h76.98l-9.62%2016.66H45.67l-11.54-20zM57.21%20120H22.58l9.63-16.67h19.25l-38.5-66.67h19.25l9.62%2016.67L68.78%20100l-11.55%2020Zm61.59-33.34-9.62-16.67-38.49%2066.67-9.63-16.67%209.63-16.66%2026.94-46.67h23.1l17.32%2030z%22%0A%20%20%2F%3E%0A%3C%2Fsvg%3E"\n    />\n    <script\n      crossorigin\n      src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"\n    ></script>\n    <script\n      crossorigin\n      src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"\n    ></script>\n    <script>\n      const withKey = (props, key) =>\n        key == null ? props : Object.assign({}, props, { key });\n      const jsx = (type, props, key) =>\n        React.createElement(type, withKey(props, key));\n      const jsxRuntime = {\n        Fragment: React.Fragment,\n        jsx,\n        jsxs: jsx,\n        jsxDEV: jsx,\n      };\n      window.ReactJSXRuntime = jsxRuntime;\n      window[\'react/jsx-runtime\'] = jsxRuntime;\n      window[\'react/jsx-dev-runtime\'] = jsxRuntime;\n    </script>\n    <script>\n      (function(x,a){typeof exports=="object"&&typeof module<"u"?a(exports,require("react/jsx-runtime"),require("react")):typeof define=="function"&&define.amd?define(["exports","react/jsx-runtime","react"],a):(x=typeof globalThis<"u"?globalThis:x||self,a(x.QwenCodeWebUI={},x.ReactJSXRuntime,x.React))})(this,function(x,a,C){"use strict";const Sr={platform:"web",postMessage:()=>{},onMessage:()=>()=>{}},Ve=C.createContext(Sr);function re(){return C.useContext(Ve)}function Tr({children:e,value:u}){return a.jsx(Ve.Provider,{value:u,children:e})}/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const Ne=C.createContext(null);function Ir(){return C.useContext(Ne)}function ne(e=!1){const u=C.useContext(Ne),t=(u==null?void 0:u.signal)??0,[r,n]=C.useState(()=>u&&t>0?u.expanded:e),[o,c]=C.useState(t);return t!==o&&(c(t),u&&t>0&&n(u.expanded)),[r,n]}/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const Mr=({children:e,className:u=""})=>a.jsx("div",{className:`container mx-auto px-4 ${u}`,children:e});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const Lr=()=>a.jsx("header",{children:"Header Component Placeholder"});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const $r=()=>a.jsx("aside",{children:"Sidebar Component Placeholder"});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const Pr=()=>a.jsx("main",{children:"Main Component Placeholder"});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const Br=()=>a.jsx("footer",{children:"Footer Component Placeholder"});function Or(e){const u=e.split(/[/\\\\]/);return u[u.length-1]||e}function _u(e,u,t){let r=e;return u!=null&&(r+=`:${u}`,t!=null&&(r+=`:${t}`)),r}const j=({path:e,line:u,column:t,showFullPath:r=!1,className:n="",disableClick:o=!1})=>{var f;const c=re(),s=((f=c.features)==null?void 0:f.canOpenFile)!==!1,l=o||!s,i=()=>{if(l)return;const v=_u(e,u,t);c.openFile?c.openFile(v):c.postMessage({type:"openFile",data:{path:v}})},d=v=>{v.preventDefault(),l||(v.stopPropagation(),i())},p=v=>{l||(v.key===" "||v.key==="Enter")&&(v.preventDefault(),v.stopPropagation(),i())},b=r?e:Or(e),h=_u(e,u,t);return a.jsxs("button",{type:"button",className:["file-link","bg-transparent border-none p-0 m-0 font-inherit","inline-flex items-center leading-none",l?"cursor-default opacity-60":"cursor-pointer hover:underline","text-[11px] no-underline","text-[var(--app-primary-foreground)]","transition-colors duration-100 ease-in-out","focus:outline focus:outline-1 focus:outline-[var(--vscode-focusBorder)] focus:outline-offset-2 focus:rounded-[2px]",!l&&"active:opacity-80",n].filter(Boolean).join(" "),onClick:d,onKeyDown:p,title:h,"aria-label":`Open file: ${h}`,"aria-disabled":l,disabled:l,children:[a.jsx("span",{className:"file-link-path",children:b}),u!=null&&a.jsxs("span",{className:"file-link-location opacity-70 text-[0.9em] font-normal dark:opacity-60",children:[":",u,t!=null&&a.jsxs(a.Fragment,{children:[":",t]})]})]})};/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Navigation and action icons\n */const Cu=({size:e=20,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{fillRule:"evenodd",d:"M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z",clipRule:"evenodd"})}),zr=e=>{switch(e){case"up":return 180;case"down":return 0;case"left":return 90;case"right":return-90;default:return 0}},jr=({size:e=12,className:u,direction:t="down",style:r,...n})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 12 12",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:e,height:e,className:u,"aria-hidden":"true",style:{...r,transform:`rotate(${zr(t)}deg)`,transition:"transform 0.15s ease-in-out"},...n,children:a.jsx("path",{d:"M3 4.5L6 7.5L9 4.5"})}),Eu=({size:e=20,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"})}),qr=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M8 2a.5.5 0 0 1 .5.5V5h2.5a.5.5 0 0 1 0 1H8.5v2.5a.5.5 0 0 1-1 0V6H5a.5.5 0 0 1 0-1h2.5V2.5A.5.5 0 0 1 8 2Z"})}),Du=({size:e=20,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{fillRule:"evenodd",d:"M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z",clipRule:"evenodd"})}),Hr=({size:e=14,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 14 14",fill:"none",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M1 1L13 13M1 13L13 1",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})}),Au=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708Z"})}),Fu=({size:e=20,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{fillRule:"evenodd",d:"M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z",clipRule:"evenodd"})}),Zr=({size:e=16,className:u,...t})=>a.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:e,height:e,className:u,"aria-hidden":"true",...t,children:[a.jsx("path",{d:"M13.3333 8C13.3333 10.9455 10.9455 13.3333 8 13.3333C5.05451 13.3333 2.66663 10.9455 2.66663 8C2.66663 5.05451 5.05451 2.66663 8 2.66663"}),a.jsx("path",{d:"M10.6666 8L13.3333 8M13.3333 8L13.3333 5.33333M13.3333 8L10.6666 10.6667"})]}),Vr=({currentSessionTitle:e,onLoadSessions:u,onNewSession:t})=>a.jsxs("div",{className:"chat-header flex items-center select-none w-full border-b border-[var(--app-primary-border-color)] bg-[var(--app-header-background)] py-1.5 px-2.5",style:{borderBottom:"1px solid var(--app-primary-border-color)"},children:[a.jsxs("button",{type:"button",className:"flex items-center gap-1.5 py-0.5 px-2 bg-transparent border-none rounded cursor-pointer outline-none min-w-0 max-w-[300px] overflow-hidden text-[var(--vscode-chat-font-size,13px)] font-[var(--vscode-chat-font-family)] text-[var(--app-primary-foreground)] hover:bg-[var(--app-ghost-button-hover-background)] focus:bg-[var(--app-ghost-button-hover-background)]",onClick:u,title:"Past conversations",children:[a.jsx("span",{className:"whitespace-nowrap overflow-hidden text-ellipsis min-w-0 font-medium text-[var(--app-primary-foreground)]",children:e}),a.jsx(Cu,{className:"w-4 h-4 flex-shrink-0 text-[var(--app-primary-foreground)]"})]}),a.jsx("div",{className:"flex-1 min-w-0"}),a.jsx("button",{type:"button",className:"flex items-center justify-center p-1 bg-transparent border-none rounded cursor-pointer outline-none text-[var(--app-primary-foreground)] hover:bg-[var(--app-ghost-button-hover-background)]",onClick:t,title:"New Session","aria-label":"New session",style:{padding:"4px"},children:a.jsx(Eu,{className:"w-4 h-4 text-[var(--app-primary-foreground)]"})})]});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const Nu=({children:e,content:u,position:t="top"})=>a.jsx("div",{className:"relative inline-block",children:a.jsxs("div",{className:"group relative",children:[e,a.jsxs("div",{className:`\n          absolute z-50 px-2 py-1 text-xs rounded-md shadow-lg\n          bg-[var(--app-primary-background,#1f2937)] border border-[var(--app-input-border,#374151)]\n          text-[var(--app-primary-foreground,#f9fafb)] whitespace-nowrap\n          opacity-0 group-hover:opacity-100 transition-opacity duration-150\n          -translate-x-1/2 left-1/2\n          ${t==="top"?"-translate-y-1 bottom-full mb-1":t==="bottom"?"translate-y-1 top-full mt-1":t==="left"?"-translate-x-full left-0 translate-y-[-50%] top-1/2":"translate-x-0 right-0 translate-y-[-50%] top-1/2"}\n          pointer-events-none\n        `,children:[u,a.jsx("div",{className:`\n            absolute w-2 h-2 bg-[var(--app-primary-background,#1f2937)] border-l border-b border-[var(--app-input-border,#374151)]\n            -rotate-45\n            ${t==="top"?"top-full left-1/2 -translate-x-1/2 -translate-y-1/2":t==="bottom"?"bottom-full left-1/2 -translate-x-1/2 translate-y-1/2":t==="left"?"right-full top-1/2 translate-x-1/2 -translate-y-1/2":"left-full top-1/2 -translate-x-1/2 -translate-y-1/2"}\n          `})]})]})}),Se=e=>e>=1e3?`${(Math.round(e/1e3*10)/10).toFixed(1)}k`:Math.round(e).toLocaleString(),Su=({contextUsage:e})=>{if(!e)return null;const u=Math.max(0,Math.min(100,100-e.percentLeft)),t=Math.round(u),r=9,n=2*Math.PI*r,o=(100-u)/100*n,c=a.jsx("div",{className:"flex flex-col gap-1",children:a.jsxs("div",{className:"font-medium",children:[t,"% \u2022 ",Se(e.usedTokens)," /"," ",Se(e.tokenLimit)," context used"]})}),s=`${t}% \u2022 ${Se(e.usedTokens)} / ${Se(e.tokenLimit)} context used`;return a.jsx(Nu,{content:c,position:"top",children:a.jsx("button",{type:"button",className:"btn-icon-compact","aria-label":s,children:a.jsxs("svg",{viewBox:"0 0 24 24","aria-hidden":"true",role:"presentation",children:[a.jsx("circle",{className:"context-indicator__track",cx:"12",cy:"12",r,fill:"none",stroke:"currentColor",opacity:"0.2"}),a.jsx("circle",{className:"context-indicator__progress",cx:"12",cy:"12",r,fill:"none",stroke:"currentColor",strokeWidth:"2",strokeDasharray:n,strokeDashoffset:o,style:{transform:"rotate(-90deg)",transformOrigin:"50% 50%"}})]})})})},Ur=e=>{const u=new Map;for(const t of e){const r=t.group||null;u.has(r)||u.set(r,[]),u.get(r).push(t)}return Array.from(u.entries()).map(([t,r])=>({group:t,items:r}))},Tu=({items:e,onSelect:u,onFill:t,onClose:r,title:n,selectedIndex:o=0})=>{const c=C.useRef(null),s=C.useRef(null),[l,i]=C.useState(o),[d,p]=C.useState(!1),b=C.useRef(!1),h=C.useMemo(()=>Ur(e),[e]),f=h.some(m=>m.group!==null);if(C.useEffect(()=>{if(!e.length)return;const m=Math.min(Math.max(o,0),e.length-1);i(m)},[e.length,o]),C.useEffect(()=>p(!0),[]),C.useEffect(()=>{const m=w=>{c.current&&!c.current.contains(w.target)&&r()},D=w=>{switch(w.key){case"ArrowDown":w.preventDefault(),b.current=!0,i(g=>Math.min(g+1,e.length-1));break;case"ArrowUp":w.preventDefault(),b.current=!0,i(g=>Math.max(g-1,0));break;case"Enter":w.preventDefault(),e[l]&&u(e[l]);break;case"Tab":w.preventDefault(),e[l]&&(t??u)(e[l]);break;case"Escape":w.preventDefault(),r();break}};return document.addEventListener("mousedown",m),document.addEventListener("keydown",D),()=>{document.removeEventListener("mousedown",m),document.removeEventListener("keydown",D)}},[e,l,u,t,r]),C.useEffect(()=>{var D;if(!b.current)return;b.current=!1;const m=(D=s.current)==null?void 0:D.querySelector(`[data-index="${l}"]`);if(m&&s.current){const w=s.current.getBoundingClientRect(),g=m.getBoundingClientRect();g.top<w.top?m.scrollIntoView({block:"start",behavior:"instant"}):g.bottom>w.bottom&&m.scrollIntoView({block:"end",behavior:"instant"})}},[l]),!e.length)return null;let v=0;return a.jsxs("div",{ref:c,role:"listbox","aria-label":n?`${n} suggestions`:"Suggestions",className:["completion-menu","absolute bottom-full left-0 right-0 mb-2 flex flex-col overflow-hidden","rounded-large border bg-[var(--app-menu-background)]","border-[var(--app-input-border)] max-h-[50vh] z-[1000]",d?"animate-completion-menu-enter":""].join(" "),children:[a.jsx("div",{className:"h-1"}),a.jsxs("div",{ref:s,className:["completion-menu-list","flex max-h-[300px] flex-col overflow-y-auto","p-[var(--app-list-padding)] pb-2"].join(" "),children:[n&&!f&&a.jsx("div",{className:"completion-menu-section-label px-3 py-1 text-[var(--app-primary-foreground)] opacity-50 text-[0.9em]",children:n}),h.map((m,D)=>a.jsxs("div",{className:"completion-menu-group",children:[f&&m.group&&a.jsx("div",{className:"completion-menu-section-label px-3 py-1.5 text-[var(--app-secondary-foreground)] text-[0.8em] uppercase tracking-wider",children:m.group}),a.jsx("div",{className:"flex flex-col gap-[var(--app-list-gap)]",children:m.items.map(w=>{const g=v++,k=g===l;return a.jsx("div",{"data-index":g,role:"option","aria-selected":k,onClick:()=>u(w),onMouseEnter:()=>i(g),className:["completion-menu-item","mx-1 cursor-pointer rounded-[var(--app-list-border-radius)]","p-[var(--app-list-item-padding)]",k?"bg-[var(--app-list-active-background)]":""].join(" "),children:a.jsxs("div",{className:"completion-menu-item-row flex items-center justify-between gap-2",children:[w.icon&&a.jsx("span",{className:"completion-menu-item-icon inline-flex h-4 w-4 items-center justify-center text-[var(--vscode-symbolIcon-fileForeground,#cccccc)]",children:w.icon}),a.jsx("span",{className:["completion-menu-item-label flex-1 truncate",k?"text-[var(--app-list-active-foreground)]":"text-[var(--app-primary-foreground)]"].join(" "),children:w.label}),w.description&&a.jsx("span",{className:"completion-menu-item-desc max-w-[50%] truncate text-[0.9em] text-[var(--app-secondary-foreground)] opacity-70",title:w.description,children:w.description})]})},w.id)})})]},m.group||`ungrouped-${D}`))]})]})};/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Session grouping utilities\n * Functions for organizing sessions by date and formatting time ago\n */const Iu=e=>{const u=new Date,t=new Date(u.getFullYear(),u.getMonth(),u.getDate()),r=new Date(t);r.setDate(r.getDate()-1);const n={Today:[],Yesterday:[],"This Week":[],Older:[]};return e.forEach(o=>{const c=o.lastUpdated||o.startTime||"";if(!c){n.Older.push(o);return}const s=new Date(c),l=new Date(s.getFullYear(),s.getMonth(),s.getDate());l.getTime()===t.getTime()?n.Today.push(o):l.getTime()===r.getTime()?n.Yesterday.push(o):l.getTime()>t.getTime()-7*864e5?n["This Week"].push(o):n.Older.push(o)}),Object.entries(n).filter(([,o])=>o.length>0).map(([o,c])=>({label:o,sessions:c}))},Mu=e=>{if(!e)return"";const u=new Date().getTime(),t=new Date(e).getTime(),r=u-t,n=Math.floor(r/6e4),o=Math.floor(r/36e5),c=Math.floor(r/864e5);return n<1?"now":n<60?`${n}m`:o<24?`${o}h`:c===1?"Yesterday":c<7?`${c}d`:new Date(e).toLocaleDateString()},Wr=({visible:e,sessions:u,currentSessionId:t,searchQuery:r,onSearchChange:n,onSelectSession:o,onRenameSession:c,onDeleteSession:s,onClose:l,hasMore:i=!1,isLoading:d=!1,onLoadMore:p})=>{const[b,h]=C.useState(null),[f,v]=C.useState(""),[m,D]=C.useState(""),[w,g]=C.useState(null),k=C.useRef(null),y=C.useRef(!1);C.useEffect(()=>{b&&k.current&&(k.current.focus(),k.current.select())},[b]);const _=F=>{const E=f.trim();E&&E!==m&&c&&c(F,E),h(null),v(""),D("")};if(!e)return null;const S=u.length===0;return a.jsxs(a.Fragment,{children:[a.jsx("div",{className:"session-selector-backdrop fixed top-0 left-0 right-0 bottom-0 z-[999] bg-transparent",onClick:l}),a.jsxs("div",{className:"session-dropdown fixed bg-[var(--app-menu-background)] rounded-[var(--corner-radius-small)] w-[min(400px,calc(100vw-32px))] max-h-[min(500px,50vh)] flex flex-col shadow-[0_4px_16px_rgba(0,0,0,0.1)] z-[1000] outline-none text-[var(--vscode-chat-font-size,13px)] font-[var(--vscode-chat-font-family)]",tabIndex:-1,style:{top:"30px",left:"10px"},onClick:F=>F.stopPropagation(),children:[a.jsxs("div",{className:"session-search p-2 flex items-center gap-2",children:[a.jsx(Fu,{className:"session-search-icon w-4 h-4 opacity-50 flex-shrink-0 text-[var(--app-primary-foreground)]"}),a.jsx("input",{type:"text",className:"session-search-input flex-1 bg-transparent border-none outline-none text-[var(--app-menu-foreground)] text-[var(--vscode-chat-font-size,13px)] font-[var(--vscode-chat-font-family)] p-0 placeholder:text-[var(--app-input-placeholder-foreground)] placeholder:opacity-60",placeholder:"Search sessions\u2026","aria-label":"Search sessions",value:r,onChange:F=>n(F.target.value)})]}),a.jsxs("div",{className:"session-list-content overflow-y-auto flex-1 select-none p-2",onScroll:F=>{const E=F.currentTarget;E.scrollHeight-(E.scrollTop+E.clientHeight)<48&&i&&!d&&(p==null||p())},children:[S?a.jsx("div",{className:"p-5 text-center text-[var(--app-secondary-foreground)]",style:{padding:"20px",textAlign:"center",color:"var(--app-secondary-foreground)"},children:r?"No matching sessions":"No sessions available"}):Iu(u).map(F=>a.jsxs(C.Fragment,{children:[a.jsx("div",{className:"session-group-label p-1 px-2 text-[var(--app-primary-foreground)] opacity-50 text-[0.9em] font-medium [&:not(:first-child)]:mt-2",children:F.label}),a.jsx("div",{className:"session-group flex flex-col gap-[2px]",children:F.sessions.map(E=>{const A=E.id||E.sessionId||"",N=E.title||E.name||"Untitled",T=E.lastUpdated||E.startTime||"",L=A===t;return b===A?a.jsx("div",{className:"session-item flex items-center py-1.5 px-2 rounded-md",children:a.jsx("input",{ref:k,type:"text",maxLength:200,className:"flex-1 bg-[var(--vscode-input-background,var(--app-input-background))] text-[var(--vscode-input-foreground,var(--app-primary-foreground))] border-2 border-[var(--vscode-focusBorder)] rounded px-2 py-1 text-[var(--vscode-chat-font-size,13px)] font-[var(--vscode-chat-font-family)] outline-none min-w-0 shadow-[0_0_0_1px_var(--vscode-focusBorder)]",value:f,onChange:I=>v(I.target.value),onKeyDown:I=>{I.key==="Enter"?_(A):I.key==="Escape"&&(y.current=!0,h(null),v(""),D(""))},onBlur:()=>{if(y.current){y.current=!1;return}_(A)}})},A):a.jsxs("div",{className:`session-item group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-colors duration-100 hover:bg-[var(--app-list-hover-background)] ${L?"active bg-[var(--app-list-active-background)] text-[var(--app-list-active-foreground)] font-[600]":"text-[var(--app-primary-foreground)]"}`,onClick:()=>{o(A),l()},children:[a.jsx("span",{className:"session-item-title flex-1 overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-[var(--vscode-chat-font-size,13px)] font-[var(--vscode-chat-font-family)]",children:N}),a.jsxs("span",{className:"flex items-center gap-1 flex-shrink-0 ml-2",children:[(c||s)&&a.jsxs("span",{className:`items-center gap-0.5 ${w===A?"flex":"hidden group-hover:flex"}`,children:[c&&a.jsx("button",{type:"button",className:"p-0.5 bg-transparent border-none cursor-pointer opacity-50 hover:opacity-100 text-[var(--app-primary-foreground)] rounded",title:"Rename",onClick:I=>{I.stopPropagation(),h(A),v(N),D(N)},children:a.jsx("svg",{width:"14",height:"14",viewBox:"0 0 16 16",fill:"currentColor",children:a.jsx("path",{d:"M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z"})})}),s&&!L&&(w===A?a.jsx("button",{type:"button",className:"px-1.5 py-0.5 bg-[var(--vscode-inputValidation-errorBackground,#5a1d1d)] border border-[var(--vscode-inputValidation-errorBorder,#be1100)] cursor-pointer text-[var(--vscode-errorForeground,#f48771)] rounded text-[11px] leading-tight",title:"Click to confirm delete",onClick:I=>{I.stopPropagation(),g(null),s(A)},onBlur:()=>g(null),children:"Delete?"}):a.jsx("button",{type:"button",className:"p-0.5 bg-transparent border-none cursor-pointer opacity-50 hover:opacity-100 text-[var(--app-primary-foreground)] rounded",title:"Delete",onClick:I=>{I.stopPropagation(),g(A)},children:a.jsx("svg",{width:"14",height:"14",viewBox:"0 0 16 16",fill:"currentColor",children:a.jsx("path",{d:"M10 3h3v1h-1v9l-1 1H5l-1-1V4H3V3h3V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1zM9 2H7v1h2V2zM5 4v9h6V4H5zm2 2h1v5H7V6zm3 0h-1v5h1V6z"})})}))]}),a.jsx("span",{className:"session-item-time opacity-60 text-[0.9em]",children:Mu(T)})]})]},A)})})]},F.label)),i&&a.jsx("div",{className:"p-2 text-center opacity-60 text-[0.9em]",children:d?"Loading\u2026":""})]})]})]})},Gr=({isAuthenticated:e=!1,loadingMessage:u,logoUrl:t,appName:r="Qwen Code"})=>{var s;const n=re(),o=t??((s=n.getResourceUrl)==null?void 0:s.call(n,"icon.png")),c=u?`Preparing ${r}\u2026`:e?"What would you like to do? Ask about this codebase or we can start writing code.":`Welcome! Please log in to start using ${r}.`;return a.jsx("div",{className:"flex flex-col items-center justify-center h-full p-5 md:p-10",children:a.jsx("div",{className:"flex flex-col items-center gap-8 w-full",children:a.jsxs("div",{className:"flex flex-col items-center gap-6",children:[o?a.jsx("img",{src:o,alt:`${r} Logo`,className:"w-[60px] h-[60px] object-contain",onError:l=>{const i=l.target;i.style.display="none";const d=i.parentElement;if(d){const p=document.createElement("div");p.className="w-[60px] h-[60px] flex items-center justify-center text-2xl font-bold",p.textContent=r.charAt(0).toUpperCase(),d.appendChild(p)}}}):a.jsx("div",{className:"w-[60px] h-[60px] flex items-center justify-center text-2xl font-bold bg-gray-200 rounded",children:r.charAt(0).toUpperCase()}),a.jsx("div",{className:"text-center",children:a.jsx("div",{className:"text-[15px] text-app-primary-foreground leading-normal font-normal max-w-[400px]",children:c})})]})})})};/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Edit mode related icons\n */const Ue=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{fillRule:"evenodd",d:"M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L6.226 12.25a2.751 2.751 0 0 1-.892.596l-2.047.848a.75.75 0 0 1-.98-.98l.848-2.047a2.75 2.75 0 0 1 .596-.892l7.262-7.261Z",clipRule:"evenodd"})}),Lu=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M2.53 3.956A1 1 0 0 0 1 4.804v6.392a1 1 0 0 0 1.53.848l5.113-3.196c.16-.1.279-.233.357-.383v2.73a1 1 0 0 0 1.53.849l5.113-3.196a1 1 0 0 0 0-1.696L9.53 3.956A1 1 0 0 0 8 4.804v2.731a.992.992 0 0 0-.357-.383L2.53 3.956Z"})}),$u=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M4.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-1ZM10.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-1Z"})}),Pu=({size:e=20,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{fillRule:"evenodd",d:"M6.28 5.22a.75.75 0 0 1 0 1.06L2.56 10l3.72 3.72a.75.75 0 0 1-1.06 1.06L.97 10.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Zm7.44 0a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 0 1 0-1.06ZM11.377 2.011a.75.75 0 0 1 .612.867l-2.5 14.5a.75.75 0 0 1-1.478-.255l2.5-14.5a.75.75 0 0 1 .866-.612Z",clipRule:"evenodd"})}),Bu=({size:e=20,className:u,...t})=>a.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:[a.jsx("path",{fillRule:"evenodd",d:"M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z",clipRule:"evenodd"}),a.jsx("path",{d:"m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z"})]}),Ou=({size:e=20,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{fillRule:"evenodd",d:"M12.528 3.047a.75.75 0 0 1 .449.961L8.433 16.504a.75.75 0 1 1-1.41-.512l4.544-12.496a.75.75 0 0 1 .961-.449Z",clipRule:"evenodd"})}),zu=({size:e=20,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{fillRule:"evenodd",d:"M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z",clipRule:"evenodd"})}),Xr=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M13.5 7l-4-4v3h-6v2h6v3l4-4z"})}),Jr=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"none",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M9 10.6667L12.3333 14L9 17.3333M12.3333 14H4.66667C3.56112 14 2.66667 13.1056 2.66667 12V4.66667C2.66667 3.56112 3.56112 2.66667 4.66667 2.66667H13.3333C14.4389 2.66667 15.3333 3.56112 15.3333 4.66667V8.66667",stroke:"currentColor",strokeWidth:"1.33333",strokeLinecap:"round",strokeLinejoin:"round"})}),Kr=({size:e=16,className:u,...t})=>a.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"none",width:e,height:e,className:u,"aria-hidden":"true",...t,children:[a.jsx("rect",{x:"4.6665",y:"4",width:"8",height:"8",rx:"1.33333",stroke:"currentColor",strokeWidth:"1.33333"}),a.jsx("path",{d:"M6 6H5.33333C4.04767 6 3 7.04767 3 8.33333V10.6667C3 11.9523 4.04767 13 5.33333 13H7.66667C8.95233 13 10 11.9523 10 10.6667V10",stroke:"currentColor",strokeWidth:"1.33333",strokeLinecap:"round"})]});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Stop icon for canceling operations\n */const ju=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("rect",{x:"4",y:"4",width:"8",height:"8",rx:"1"})});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const Qr="\u200B";function Te(e){return e.replace(/\\u200B/g,"")}const Yr=e=>{switch(e){case"edit":return a.jsx(Ue,{});case"auto":case"yolo":return a.jsx(Lu,{});case"plan":return a.jsx($u,{});default:return null}},Rr=({inputText:e,inputFieldRef:u,isStreaming:t,isWaitingForResponse:r,isComposing:n,editModeInfo:o,activeFileName:c,activeSelection:s,skipAutoActiveContext:l,contextUsage:i,onInputChange:d,onCompositionStart:p,onCompositionEnd:b,onKeyDown:h,onSubmit:f,onCancel:v,onToggleEditMode:m,onToggleSkipAutoActiveContext:D,onShowCommandMenu:w,onAttachContext:g,completionIsOpen:k,completionItems:y,onCompletionSelect:_,onCompletionFill:S,onCompletionClose:F,onPaste:E,extraContent:A,placeholder:N="Ask Qwen Code \u2026",canSubmit:T,followupState:L,onAcceptFollowup:I,onDismissFollowup:z})=>{const pe=t||r,tc=T??Te(e).trim().length>0,Ar=y??[],Ae=k&&Ar.length>0&&!!_&&!!F,Ze=L!=null&&L.isVisible&&L.suggestion?L.suggestion:null,he=!!Ze,rc=he&&!e?Ze:N,nc=$=>{if(Ae&&$.key==="Escape"){$.preventDefault(),$.stopPropagation(),F==null||F();return}if($.key==="Escape"){$.preventDefault(),v();return}if($.key==="Tab"&&he&&I&&!e&&!Ae){$.preventDefault(),$.stopPropagation(),I("tab");return}if($.key==="ArrowRight"&&he&&I&&!e&&!Ae){$.preventDefault(),I==null||I("right");return}if($.key==="Enter"&&!$.shiftKey&&!n){if(Ae)return;if(he&&!e&&Ze){$.preventDefault(),I==null||I("enter",{skipOnAccept:!0}),f($,Ze);return}$.preventDefault(),f($)}h($)},wu=s?Math.max(1,s.endLine-s.startLine+1):0,Fe=wu>0?`${wu} ${wu===1?"line":"lines"} selected`:"",Fr=c?l?Fe?`Active selection will NOT be auto-loaded into context: ${Fe}`:`Active file will NOT be auto-loaded into context: ${c}`:Fe?`Showing your current selection: ${Fe}`:`Showing your current file: ${c}`:"";return a.jsx("div",{className:"p-1 px-4 pb-4 absolute bottom-0 left-0 right-0 bg-gradient-to-b from-transparent to-[var(--app-primary-background)] pointer-events-none",children:a.jsx("div",{className:"block pointer-events-auto",children:a.jsxs("form",{className:"composer-form",onSubmit:f,children:[a.jsx("div",{className:"composer-overlay"}),a.jsx("div",{className:"input-banner"}),a.jsxs("div",{className:"relative flex z-[1]",children:[Ae&&_&&F&&a.jsx(Tu,{items:Ar,onSelect:_,onFill:S,onClose:F,title:void 0}),a.jsx("div",{ref:u,contentEditable:"plaintext-only",className:"composer-input",role:"textbox","aria-label":"Message input","aria-multiline":"true","data-placeholder":rc,"data-has-suggestion":he?"true":"false","data-empty":Te(e).trim().length===0?"true":"false",onInput:$=>{const oc=$.target,Nr=Te(oc.textContent??"");d(Nr),he&&!e&&Nr&&(z==null||z())},onCompositionStart:p,onCompositionEnd:b,onKeyDown:nc,onPaste:E,suppressContentEditableWarning:!0})]}),A?a.jsx("div",{className:"relative z-[1]",children:A}):null,a.jsxs("div",{className:"composer-actions",children:[a.jsxs("button",{type:"button",className:"btn-text-compact btn-text-compact--primary",title:o.title,"aria-label":o.label,onClick:m,children:[o.icon,a.jsx("span",{className:"hidden sm:inline",children:o.label})]}),c&&a.jsxs("button",{type:"button",className:"btn-text-compact btn-text-compact--primary",title:Fr,"aria-label":Fr,onClick:D,children:[l?a.jsx(Bu,{}):a.jsx(Pu,{}),a.jsx("span",{className:"hidden sm:inline",children:Fe||c})]}),a.jsx("div",{className:"flex-1 min-w-0"}),a.jsx(Su,{contextUsage:i}),a.jsx("button",{type:"button",className:"btn-icon-compact hover:text-[var(--app-primary-foreground)]",title:"Show command menu (/)","aria-label":"Show command menu",onClick:w,children:a.jsx(Ou,{})}),a.jsx("button",{type:"button",className:"btn-icon-compact hover:text-[var(--app-primary-foreground)]",title:"Attach context (Cmd/Ctrl + /)","aria-label":"Attach context",onClick:g,children:a.jsx(zu,{})}),t||r?a.jsx("button",{type:"button",className:"btn-send-compact [&>svg]:w-5 [&>svg]:h-5",onClick:v,title:"Stop generation","aria-label":"Stop generation",children:a.jsx(ju,{})}):a.jsx("button",{type:"submit",className:"btn-send-compact [&>svg]:w-5 [&>svg]:h-5",disabled:pe||!tc,"aria-label":"Send message",children:a.jsx(Du,{})})]})]})})})};/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Onboarding component - Pure UI welcome screen\n * Platform-specific logic (icon URL) passed via props\n */const en=({iconUrl:e,onGetStarted:u,appName:t="Qwen Code",subtitle:r="Unlock the power of AI to understand, navigate, and transform your codebase faster than ever before.",buttonText:n="Get Started with Qwen Code"})=>a.jsx("div",{className:"flex flex-col items-center justify-center h-full p-5 md:p-10",children:a.jsx("div",{className:"flex flex-col items-center gap-8 w-full max-w-md mx-auto",children:a.jsxs("div",{className:"flex flex-col items-center gap-6",children:[e&&a.jsx("div",{className:"relative",children:a.jsx("img",{src:e,alt:`${t} Logo`,className:"w-[80px] h-[80px] object-contain"})}),a.jsxs("div",{className:"text-center",children:[a.jsxs("h1",{className:"text-2xl font-bold text-[var(--app-primary-foreground)] mb-2",children:["Welcome to ",t]}),a.jsx("p",{className:"text-[var(--app-secondary-foreground)] max-w-sm",children:r})]}),a.jsx("button",{onClick:u,className:"w-full px-4 py-3 bg-[var(--app-primary,var(--app-button-background))] text-[var(--app-button-foreground,#ffffff)] font-medium rounded-lg shadow-sm hover:bg-[var(--app-primary-hover,var(--app-button-hover-background))] transition-colors duration-200",children:n})]})})});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const un=({content:e,sender:u,timestamp:t,className:r=""})=>{const n=u==="user"?"justify-end":"justify-start",o=u==="user"?"bg-blue-500":"bg-gray-200";return a.jsx("div",{className:`flex ${n} mb-4 ${r}`,children:a.jsxs("div",{className:`${o} text-white rounded-lg px-4 py-2 max-w-xs md:max-w-md lg:max-w-lg`,children:[e,t&&a.jsx("div",{className:"text-xs opacity-70 mt-1",children:t.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})})]})})};/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const tn=()=>a.jsx("div",{children:"MessageInput Component Placeholder"});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const rn=()=>a.jsx("div",{children:"MessageList Component Placeholder"}),nn=3e3,on=["Processing...","Working on it...","Just a moment...","Loading...","Hold tight...","Almost there..."],an=({loadingMessage:e})=>{const u=C.useMemo(()=>{const n=new Set,o=[];e&&e.trim()&&(o.push(e),n.add(e));for(const c of on)n.has(c)||o.push(c);return o},[e]),[t,r]=C.useState(0);return C.useEffect(()=>{r(0)},[u]),C.useEffect(()=>{if(u.length<=1)return;const n=setInterval(()=>{r(o=>{let c=Math.floor(Math.random()*u.length);if(u.length>1){let s=0;for(;c===o&&s<5;)c=Math.floor(Math.random()*u.length),s++}return c})},nn);return()=>clearInterval(n)},[u]),a.jsx("div",{className:"waiting-message-outer flex gap-0 items-start text-left py-2 flex-col opacity-85",children:a.jsx("div",{className:"assistant-message-container assistant-message-loading waiting-message-inner w-full items-start pl-[30px] relative",children:a.jsx("span",{className:"waiting-message-text opacity-70 italic loading-text-shimmer",children:u[t]})})})};/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const cn=({text:e="Interrupted"})=>a.jsx("div",{className:"flex gap-0 items-start text-left py-2 flex-col opacity-85",children:a.jsx("div",{className:"interrupted-item w-full relative",children:a.jsx("span",{className:"opacity-70 italic",children:e})})}),qu={};function sn(e){let u=qu[e];if(u)return u;u=qu[e]=[];for(let t=0;t<128;t++){const r=String.fromCharCode(t);u.push(r)}for(let t=0;t<e.length;t++){const r=e.charCodeAt(t);u[r]="%"+("0"+r.toString(16).toUpperCase()).slice(-2)}return u}function ae(e,u){typeof u!="string"&&(u=ae.defaultChars);const t=sn(u);return e.replace(/(%[a-f0-9]{2})+/gi,function(r){let n="";for(let o=0,c=r.length;o<c;o+=3){const s=parseInt(r.slice(o+1,o+3),16);if(s<128){n+=t[s];continue}if((s&224)===192&&o+3<c){const l=parseInt(r.slice(o+4,o+6),16);if((l&192)===128){const i=s<<6&1984|l&63;i<128?n+="\uFFFD\uFFFD":n+=String.fromCharCode(i),o+=3;continue}}if((s&240)===224&&o+6<c){const l=parseInt(r.slice(o+4,o+6),16),i=parseInt(r.slice(o+7,o+9),16);if((l&192)===128&&(i&192)===128){const d=s<<12&61440|l<<6&4032|i&63;d<2048||d>=55296&&d<=57343?n+="\uFFFD\uFFFD\uFFFD":n+=String.fromCharCode(d),o+=6;continue}}if((s&248)===240&&o+9<c){const l=parseInt(r.slice(o+4,o+6),16),i=parseInt(r.slice(o+7,o+9),16),d=parseInt(r.slice(o+10,o+12),16);if((l&192)===128&&(i&192)===128&&(d&192)===128){let p=s<<18&1835008|l<<12&258048|i<<6&4032|d&63;p<65536||p>1114111?n+="\uFFFD\uFFFD\uFFFD\uFFFD":(p-=65536,n+=String.fromCharCode(55296+(p>>10),56320+(p&1023))),o+=9;continue}}n+="\uFFFD"}return n})}ae.defaultChars=";/?:@&=+$,#",ae.componentChars="";const Hu={};function ln(e){let u=Hu[e];if(u)return u;u=Hu[e]=[];for(let t=0;t<128;t++){const r=String.fromCharCode(t);/^[0-9a-z]$/i.test(r)?u.push(r):u.push("%"+("0"+t.toString(16).toUpperCase()).slice(-2))}for(let t=0;t<e.length;t++)u[e.charCodeAt(t)]=e[t];return u}function be(e,u,t){typeof u!="string"&&(t=u,u=be.defaultChars),typeof t>"u"&&(t=!0);const r=ln(u);let n="";for(let o=0,c=e.length;o<c;o++){const s=e.charCodeAt(o);if(t&&s===37&&o+2<c&&/^[0-9a-f]{2}$/i.test(e.slice(o+1,o+3))){n+=e.slice(o,o+3),o+=2;continue}if(s<128){n+=r[s];continue}if(s>=55296&&s<=57343){if(s>=55296&&s<=56319&&o+1<c){const l=e.charCodeAt(o+1);if(l>=56320&&l<=57343){n+=encodeURIComponent(e[o]+e[o+1]),o++;continue}}n+="%EF%BF%BD";continue}n+=encodeURIComponent(e[o])}return n}be.defaultChars=";/?:@&=+$,-_.!~*\'()#",be.componentChars="-_.!~*\'()";function We(e){let u="";return u+=e.protocol||"",u+=e.slashes?"//":"",u+=e.auth?e.auth+"@":"",e.hostname&&e.hostname.indexOf(":")!==-1?u+="["+e.hostname+"]":u+=e.hostname||"",u+=e.port?":"+e.port:"",u+=e.pathname||"",u+=e.search||"",u+=e.hash||"",u}function Ie(){this.protocol=null,this.slashes=null,this.auth=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.pathname=null}const dn=/^([a-z0-9.+-]+:)/i,fn=/:[0-9]*$/,pn=/^(\\/\\/?(?!\\/)[^\\?\\s]*)(\\?[^\\s]*)?$/,hn=["<",">",\'"\',"`"," ","\\r",`\n`,"	"],bn=["{","}","|","\\\\","^","`"].concat(hn),xn=["\'"].concat(bn),Zu=["%","/","?",";","#"].concat(xn),Vu=["/","?","#"],gn=255,Uu=/^[+a-z0-9A-Z_-]{0,63}$/,mn=/^([+a-z0-9A-Z_-]{0,63})(.*)$/,Wu={javascript:!0,"javascript:":!0},Gu={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0};function Ge(e,u){if(e&&e instanceof Ie)return e;const t=new Ie;return t.parse(e,u),t}Ie.prototype.parse=function(e,u){let t,r,n,o=e;if(o=o.trim(),!u&&e.split("#").length===1){const i=pn.exec(o);if(i)return this.pathname=i[1],i[2]&&(this.search=i[2]),this}let c=dn.exec(o);if(c&&(c=c[0],t=c.toLowerCase(),this.protocol=c,o=o.substr(c.length)),(u||c||o.match(/^\\/\\/[^@\\/]+@[^@\\/]+/))&&(n=o.substr(0,2)==="//",n&&!(c&&Wu[c])&&(o=o.substr(2),this.slashes=!0)),!Wu[c]&&(n||c&&!Gu[c])){let i=-1;for(let f=0;f<Vu.length;f++)r=o.indexOf(Vu[f]),r!==-1&&(i===-1||r<i)&&(i=r);let d,p;i===-1?p=o.lastIndexOf("@"):p=o.lastIndexOf("@",i),p!==-1&&(d=o.slice(0,p),o=o.slice(p+1),this.auth=d),i=-1;for(let f=0;f<Zu.length;f++)r=o.indexOf(Zu[f]),r!==-1&&(i===-1||r<i)&&(i=r);i===-1&&(i=o.length),o[i-1]===":"&&i--;const b=o.slice(0,i);o=o.slice(i),this.parseHost(b),this.hostname=this.hostname||"";const h=this.hostname[0]==="["&&this.hostname[this.hostname.length-1]==="]";if(!h){const f=this.hostname.split(/\\./);for(let v=0,m=f.length;v<m;v++){const D=f[v];if(D&&!D.match(Uu)){let w="";for(let g=0,k=D.length;g<k;g++)D.charCodeAt(g)>127?w+="x":w+=D[g];if(!w.match(Uu)){const g=f.slice(0,v),k=f.slice(v+1),y=D.match(mn);y&&(g.push(y[1]),k.unshift(y[2])),k.length&&(o=k.join(".")+o),this.hostname=g.join(".");break}}}}this.hostname.length>gn&&(this.hostname=""),h&&(this.hostname=this.hostname.substr(1,this.hostname.length-2))}const s=o.indexOf("#");s!==-1&&(this.hash=o.substr(s),o=o.slice(0,s));const l=o.indexOf("?");return l!==-1&&(this.search=o.substr(l),o=o.slice(0,l)),o&&(this.pathname=o),Gu[t]&&this.hostname&&!this.pathname&&(this.pathname=""),this},Ie.prototype.parseHost=function(e){let u=fn.exec(e);u&&(u=u[0],u!==":"&&(this.port=u.substr(1)),e=e.substr(0,e.length-u.length)),e&&(this.hostname=e)};const yn=Object.freeze(Object.defineProperty({__proto__:null,decode:ae,encode:be,format:We,parse:Ge},Symbol.toStringTag,{value:"Module"})),Xu=/[\\0-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]/,Ju=/[\\0-\\x1F\\x7F-\\x9F]/,vn=/[\\xAD\\u0600-\\u0605\\u061C\\u06DD\\u070F\\u0890\\u0891\\u08E2\\u180E\\u200B-\\u200F\\u202A-\\u202E\\u2060-\\u2064\\u2066-\\u206F\\uFEFF\\uFFF9-\\uFFFB]|\\uD804[\\uDCBD\\uDCCD]|\\uD80D[\\uDC30-\\uDC3F]|\\uD82F[\\uDCA0-\\uDCA3]|\\uD834[\\uDD73-\\uDD7A]|\\uDB40[\\uDC01\\uDC20-\\uDC7F]/,Xe=/[!-#%-\\*,-\\/:;\\?@\\[-\\]_\\{\\}\\xA1\\xA7\\xAB\\xB6\\xB7\\xBB\\xBF\\u037E\\u0387\\u055A-\\u055F\\u0589\\u058A\\u05BE\\u05C0\\u05C3\\u05C6\\u05F3\\u05F4\\u0609\\u060A\\u060C\\u060D\\u061B\\u061D-\\u061F\\u066A-\\u066D\\u06D4\\u0700-\\u070D\\u07F7-\\u07F9\\u0830-\\u083E\\u085E\\u0964\\u0965\\u0970\\u09FD\\u0A76\\u0AF0\\u0C77\\u0C84\\u0DF4\\u0E4F\\u0E5A\\u0E5B\\u0F04-\\u0F12\\u0F14\\u0F3A-\\u0F3D\\u0F85\\u0FD0-\\u0FD4\\u0FD9\\u0FDA\\u104A-\\u104F\\u10FB\\u1360-\\u1368\\u1400\\u166E\\u169B\\u169C\\u16EB-\\u16ED\\u1735\\u1736\\u17D4-\\u17D6\\u17D8-\\u17DA\\u1800-\\u180A\\u1944\\u1945\\u1A1E\\u1A1F\\u1AA0-\\u1AA6\\u1AA8-\\u1AAD\\u1B5A-\\u1B60\\u1B7D\\u1B7E\\u1BFC-\\u1BFF\\u1C3B-\\u1C3F\\u1C7E\\u1C7F\\u1CC0-\\u1CC7\\u1CD3\\u2010-\\u2027\\u2030-\\u2043\\u2045-\\u2051\\u2053-\\u205E\\u207D\\u207E\\u208D\\u208E\\u2308-\\u230B\\u2329\\u232A\\u2768-\\u2775\\u27C5\\u27C6\\u27E6-\\u27EF\\u2983-\\u2998\\u29D8-\\u29DB\\u29FC\\u29FD\\u2CF9-\\u2CFC\\u2CFE\\u2CFF\\u2D70\\u2E00-\\u2E2E\\u2E30-\\u2E4F\\u2E52-\\u2E5D\\u3001-\\u3003\\u3008-\\u3011\\u3014-\\u301F\\u3030\\u303D\\u30A0\\u30FB\\uA4FE\\uA4FF\\uA60D-\\uA60F\\uA673\\uA67E\\uA6F2-\\uA6F7\\uA874-\\uA877\\uA8CE\\uA8CF\\uA8F8-\\uA8FA\\uA8FC\\uA92E\\uA92F\\uA95F\\uA9C1-\\uA9CD\\uA9DE\\uA9DF\\uAA5C-\\uAA5F\\uAADE\\uAADF\\uAAF0\\uAAF1\\uABEB\\uFD3E\\uFD3F\\uFE10-\\uFE19\\uFE30-\\uFE52\\uFE54-\\uFE61\\uFE63\\uFE68\\uFE6A\\uFE6B\\uFF01-\\uFF03\\uFF05-\\uFF0A\\uFF0C-\\uFF0F\\uFF1A\\uFF1B\\uFF1F\\uFF20\\uFF3B-\\uFF3D\\uFF3F\\uFF5B\\uFF5D\\uFF5F-\\uFF65]|\\uD800[\\uDD00-\\uDD02\\uDF9F\\uDFD0]|\\uD801\\uDD6F|\\uD802[\\uDC57\\uDD1F\\uDD3F\\uDE50-\\uDE58\\uDE7F\\uDEF0-\\uDEF6\\uDF39-\\uDF3F\\uDF99-\\uDF9C]|\\uD803[\\uDEAD\\uDF55-\\uDF59\\uDF86-\\uDF89]|\\uD804[\\uDC47-\\uDC4D\\uDCBB\\uDCBC\\uDCBE-\\uDCC1\\uDD40-\\uDD43\\uDD74\\uDD75\\uDDC5-\\uDDC8\\uDDCD\\uDDDB\\uDDDD-\\uDDDF\\uDE38-\\uDE3D\\uDEA9]|\\uD805[\\uDC4B-\\uDC4F\\uDC5A\\uDC5B\\uDC5D\\uDCC6\\uDDC1-\\uDDD7\\uDE41-\\uDE43\\uDE60-\\uDE6C\\uDEB9\\uDF3C-\\uDF3E]|\\uD806[\\uDC3B\\uDD44-\\uDD46\\uDDE2\\uDE3F-\\uDE46\\uDE9A-\\uDE9C\\uDE9E-\\uDEA2\\uDF00-\\uDF09]|\\uD807[\\uDC41-\\uDC45\\uDC70\\uDC71\\uDEF7\\uDEF8\\uDF43-\\uDF4F\\uDFFF]|\\uD809[\\uDC70-\\uDC74]|\\uD80B[\\uDFF1\\uDFF2]|\\uD81A[\\uDE6E\\uDE6F\\uDEF5\\uDF37-\\uDF3B\\uDF44]|\\uD81B[\\uDE97-\\uDE9A\\uDFE2]|\\uD82F\\uDC9F|\\uD836[\\uDE87-\\uDE8B]|\\uD83A[\\uDD5E\\uDD5F]/,Ku=/[\\$\\+<->\\^`\\|~\\xA2-\\xA6\\xA8\\xA9\\xAC\\xAE-\\xB1\\xB4\\xB8\\xD7\\xF7\\u02C2-\\u02C5\\u02D2-\\u02DF\\u02E5-\\u02EB\\u02ED\\u02EF-\\u02FF\\u0375\\u0384\\u0385\\u03F6\\u0482\\u058D-\\u058F\\u0606-\\u0608\\u060B\\u060E\\u060F\\u06DE\\u06E9\\u06FD\\u06FE\\u07F6\\u07FE\\u07FF\\u0888\\u09F2\\u09F3\\u09FA\\u09FB\\u0AF1\\u0B70\\u0BF3-\\u0BFA\\u0C7F\\u0D4F\\u0D79\\u0E3F\\u0F01-\\u0F03\\u0F13\\u0F15-\\u0F17\\u0F1A-\\u0F1F\\u0F34\\u0F36\\u0F38\\u0FBE-\\u0FC5\\u0FC7-\\u0FCC\\u0FCE\\u0FCF\\u0FD5-\\u0FD8\\u109E\\u109F\\u1390-\\u1399\\u166D\\u17DB\\u1940\\u19DE-\\u19FF\\u1B61-\\u1B6A\\u1B74-\\u1B7C\\u1FBD\\u1FBF-\\u1FC1\\u1FCD-\\u1FCF\\u1FDD-\\u1FDF\\u1FED-\\u1FEF\\u1FFD\\u1FFE\\u2044\\u2052\\u207A-\\u207C\\u208A-\\u208C\\u20A0-\\u20C0\\u2100\\u2101\\u2103-\\u2106\\u2108\\u2109\\u2114\\u2116-\\u2118\\u211E-\\u2123\\u2125\\u2127\\u2129\\u212E\\u213A\\u213B\\u2140-\\u2144\\u214A-\\u214D\\u214F\\u218A\\u218B\\u2190-\\u2307\\u230C-\\u2328\\u232B-\\u2426\\u2440-\\u244A\\u249C-\\u24E9\\u2500-\\u2767\\u2794-\\u27C4\\u27C7-\\u27E5\\u27F0-\\u2982\\u2999-\\u29D7\\u29DC-\\u29FB\\u29FE-\\u2B73\\u2B76-\\u2B95\\u2B97-\\u2BFF\\u2CE5-\\u2CEA\\u2E50\\u2E51\\u2E80-\\u2E99\\u2E9B-\\u2EF3\\u2F00-\\u2FD5\\u2FF0-\\u2FFF\\u3004\\u3012\\u3013\\u3020\\u3036\\u3037\\u303E\\u303F\\u309B\\u309C\\u3190\\u3191\\u3196-\\u319F\\u31C0-\\u31E3\\u31EF\\u3200-\\u321E\\u322A-\\u3247\\u3250\\u3260-\\u327F\\u328A-\\u32B0\\u32C0-\\u33FF\\u4DC0-\\u4DFF\\uA490-\\uA4C6\\uA700-\\uA716\\uA720\\uA721\\uA789\\uA78A\\uA828-\\uA82B\\uA836-\\uA839\\uAA77-\\uAA79\\uAB5B\\uAB6A\\uAB6B\\uFB29\\uFBB2-\\uFBC2\\uFD40-\\uFD4F\\uFDCF\\uFDFC-\\uFDFF\\uFE62\\uFE64-\\uFE66\\uFE69\\uFF04\\uFF0B\\uFF1C-\\uFF1E\\uFF3E\\uFF40\\uFF5C\\uFF5E\\uFFE0-\\uFFE6\\uFFE8-\\uFFEE\\uFFFC\\uFFFD]|\\uD800[\\uDD37-\\uDD3F\\uDD79-\\uDD89\\uDD8C-\\uDD8E\\uDD90-\\uDD9C\\uDDA0\\uDDD0-\\uDDFC]|\\uD802[\\uDC77\\uDC78\\uDEC8]|\\uD805\\uDF3F|\\uD807[\\uDFD5-\\uDFF1]|\\uD81A[\\uDF3C-\\uDF3F\\uDF45]|\\uD82F\\uDC9C|\\uD833[\\uDF50-\\uDFC3]|\\uD834[\\uDC00-\\uDCF5\\uDD00-\\uDD26\\uDD29-\\uDD64\\uDD6A-\\uDD6C\\uDD83\\uDD84\\uDD8C-\\uDDA9\\uDDAE-\\uDDEA\\uDE00-\\uDE41\\uDE45\\uDF00-\\uDF56]|\\uD835[\\uDEC1\\uDEDB\\uDEFB\\uDF15\\uDF35\\uDF4F\\uDF6F\\uDF89\\uDFA9\\uDFC3]|\\uD836[\\uDC00-\\uDDFF\\uDE37-\\uDE3A\\uDE6D-\\uDE74\\uDE76-\\uDE83\\uDE85\\uDE86]|\\uD838[\\uDD4F\\uDEFF]|\\uD83B[\\uDCAC\\uDCB0\\uDD2E\\uDEF0\\uDEF1]|\\uD83C[\\uDC00-\\uDC2B\\uDC30-\\uDC93\\uDCA0-\\uDCAE\\uDCB1-\\uDCBF\\uDCC1-\\uDCCF\\uDCD1-\\uDCF5\\uDD0D-\\uDDAD\\uDDE6-\\uDE02\\uDE10-\\uDE3B\\uDE40-\\uDE48\\uDE50\\uDE51\\uDE60-\\uDE65\\uDF00-\\uDFFF]|\\uD83D[\\uDC00-\\uDED7\\uDEDC-\\uDEEC\\uDEF0-\\uDEFC\\uDF00-\\uDF76\\uDF7B-\\uDFD9\\uDFE0-\\uDFEB\\uDFF0]|\\uD83E[\\uDC00-\\uDC0B\\uDC10-\\uDC47\\uDC50-\\uDC59\\uDC60-\\uDC87\\uDC90-\\uDCAD\\uDCB0\\uDCB1\\uDD00-\\uDE53\\uDE60-\\uDE6D\\uDE70-\\uDE7C\\uDE80-\\uDE88\\uDE90-\\uDEBD\\uDEBF-\\uDEC5\\uDECE-\\uDEDB\\uDEE0-\\uDEE8\\uDEF0-\\uDEF8\\uDF00-\\uDF92\\uDF94-\\uDFCA]/,Qu=/[ \\xA0\\u1680\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000]/,kn=Object.freeze(Object.defineProperty({__proto__:null,Any:Xu,Cc:Ju,Cf:vn,P:Xe,S:Ku,Z:Qu},Symbol.toStringTag,{value:"Module"})),wn=new Uint16Array(\'\u1D41<\xD5\u0131\u028A\u049D\u057B\u05D0\u0675\u06DE\u07A2\u07D6\u080F\u0A4A\u0A91\u0DA1\u0E6D\u0F09\u0F26\u10CA\u1228\u12E1\u1415\u149D\u14C3\u14DF\u1525\\0\\0\\0\\0\\0\\0\u156B\u16CD\u198D\u1C12\u1DDD\u1F7E\u2060\u21B0\u228D\u23C0\u23FB\u2442\u2824\u2912\u2D08\u2E48\u2FCE\u3016\u32BA\u3639\u37AC\u38FE\u3A28\u3A71\u3AE0\u3B2E\u0800EMabcfglmnoprstu\\\\bfms\x7F\x84\x8B\x90\x95\x98\xA6\xB3\xB9\xC8\xCFlig\u803B\xC6\u40C6P\u803B&\u4026cute\u803B\xC1\u40C1reve;\u4102\u0100iyx}rc\u803B\xC2\u40C2;\u4410r;\uC000\u{1D504}rave\u803B\xC0\u40C0pha;\u4391acr;\u4100d;\u6A53\u0100gp\x9D\xA1on;\u4104f;\uC000\u{1D538}plyFunction;\u6061ing\u803B\xC5\u40C5\u0100cs\xBE\xC3r;\uC000\u{1D49C}ign;\u6254ilde\u803B\xC3\u40C3ml\u803B\xC4\u40C4\u0400aceforsu\xE5\xFB\xFE\u0117\u011C\u0122\u0127\u012A\u0100cr\xEA\xF2kslash;\u6216\u0176\xF6\xF8;\u6AE7ed;\u6306y;\u4411\u0180crt\u0105\u010B\u0114ause;\u6235noullis;\u612Ca;\u4392r;\uC000\u{1D505}pf;\uC000\u{1D539}eve;\u42D8c\xF2\u0113mpeq;\u624E\u0700HOacdefhilorsu\u014D\u0151\u0156\u0180\u019E\u01A2\u01B5\u01B7\u01BA\u01DC\u0215\u0273\u0278\u027Ecy;\u4427PY\u803B\xA9\u40A9\u0180cpy\u015D\u0162\u017Aute;\u4106\u0100;i\u0167\u0168\u62D2talDifferentialD;\u6145leys;\u612D\u0200aeio\u0189\u018E\u0194\u0198ron;\u410Cdil\u803B\xC7\u40C7rc;\u4108nint;\u6230ot;\u410A\u0100dn\u01A7\u01ADilla;\u40B8terDot;\u40B7\xF2\u017Fi;\u43A7rcle\u0200DMPT\u01C7\u01CB\u01D1\u01D6ot;\u6299inus;\u6296lus;\u6295imes;\u6297o\u0100cs\u01E2\u01F8kwiseContourIntegral;\u6232eCurly\u0100DQ\u0203\u020FoubleQuote;\u601Duote;\u6019\u0200lnpu\u021E\u0228\u0247\u0255on\u0100;e\u0225\u0226\u6237;\u6A74\u0180git\u022F\u0236\u023Aruent;\u6261nt;\u622FourIntegral;\u622E\u0100fr\u024C\u024E;\u6102oduct;\u6210nterClockwiseContourIntegral;\u6233oss;\u6A2Fcr;\uC000\u{1D49E}p\u0100;C\u0284\u0285\u62D3ap;\u624D\u0580DJSZacefios\u02A0\u02AC\u02B0\u02B4\u02B8\u02CB\u02D7\u02E1\u02E6\u0333\u048D\u0100;o\u0179\u02A5trahd;\u6911cy;\u4402cy;\u4405cy;\u440F\u0180grs\u02BF\u02C4\u02C7ger;\u6021r;\u61A1hv;\u6AE4\u0100ay\u02D0\u02D5ron;\u410E;\u4414l\u0100;t\u02DD\u02DE\u6207a;\u4394r;\uC000\u{1D507}\u0100af\u02EB\u0327\u0100cm\u02F0\u0322ritical\u0200ADGT\u0300\u0306\u0316\u031Ccute;\u40B4o\u0174\u030B\u030D;\u42D9bleAcute;\u42DDrave;\u4060ilde;\u42DCond;\u62C4ferentialD;\u6146\u0470\u033D\\0\\0\\0\u0342\u0354\\0\u0405f;\uC000\u{1D53B}\u0180;DE\u0348\u0349\u034D\u40A8ot;\u60DCqual;\u6250ble\u0300CDLRUV\u0363\u0372\u0382\u03CF\u03E2\u03F8ontourIntegra\xEC\u0239o\u0274\u0379\\0\\0\u037B\xBB\u0349nArrow;\u61D3\u0100eo\u0387\u03A4ft\u0180ART\u0390\u0396\u03A1rrow;\u61D0ightArrow;\u61D4e\xE5\u02CAng\u0100LR\u03AB\u03C4eft\u0100AR\u03B3\u03B9rrow;\u67F8ightArrow;\u67FAightArrow;\u67F9ight\u0100AT\u03D8\u03DErrow;\u61D2ee;\u62A8p\u0241\u03E9\\0\\0\u03EFrrow;\u61D1ownArrow;\u61D5erticalBar;\u6225n\u0300ABLRTa\u0412\u042A\u0430\u045E\u047F\u037Crrow\u0180;BU\u041D\u041E\u0422\u6193ar;\u6913pArrow;\u61F5reve;\u4311eft\u02D2\u043A\\0\u0446\\0\u0450ightVector;\u6950eeVector;\u695Eector\u0100;B\u0459\u045A\u61BDar;\u6956ight\u01D4\u0467\\0\u0471eeVector;\u695Fector\u0100;B\u047A\u047B\u61C1ar;\u6957ee\u0100;A\u0486\u0487\u62A4rrow;\u61A7\u0100ct\u0492\u0497r;\uC000\u{1D49F}rok;\u4110\u0800NTacdfglmopqstux\u04BD\u04C0\u04C4\u04CB\u04DE\u04E2\u04E7\u04EE\u04F5\u0521\u052F\u0536\u0552\u055D\u0560\u0565G;\u414AH\u803B\xD0\u40D0cute\u803B\xC9\u40C9\u0180aiy\u04D2\u04D7\u04DCron;\u411Arc\u803B\xCA\u40CA;\u442Dot;\u4116r;\uC000\u{1D508}rave\u803B\xC8\u40C8ement;\u6208\u0100ap\u04FA\u04FEcr;\u4112ty\u0253\u0506\\0\\0\u0512mallSquare;\u65FBerySmallSquare;\u65AB\u0100gp\u0526\u052Aon;\u4118f;\uC000\u{1D53C}silon;\u4395u\u0100ai\u053C\u0549l\u0100;T\u0542\u0543\u6A75ilde;\u6242librium;\u61CC\u0100ci\u0557\u055Ar;\u6130m;\u6A73a;\u4397ml\u803B\xCB\u40CB\u0100ip\u056A\u056Fsts;\u6203onentialE;\u6147\u0280cfios\u0585\u0588\u058D\u05B2\u05CCy;\u4424r;\uC000\u{1D509}lled\u0253\u0597\\0\\0\u05A3mallSquare;\u65FCerySmallSquare;\u65AA\u0370\u05BA\\0\u05BF\\0\\0\u05C4f;\uC000\u{1D53D}All;\u6200riertrf;\u6131c\xF2\u05CB\u0600JTabcdfgorst\u05E8\u05EC\u05EF\u05FA\u0600\u0612\u0616\u061B\u061D\u0623\u066C\u0672cy;\u4403\u803B>\u403Emma\u0100;d\u05F7\u05F8\u4393;\u43DCreve;\u411E\u0180eiy\u0607\u060C\u0610dil;\u4122rc;\u411C;\u4413ot;\u4120r;\uC000\u{1D50A};\u62D9pf;\uC000\u{1D53E}eater\u0300EFGLST\u0635\u0644\u064E\u0656\u065B\u0666qual\u0100;L\u063E\u063F\u6265ess;\u62DBullEqual;\u6267reater;\u6AA2ess;\u6277lantEqual;\u6A7Eilde;\u6273cr;\uC000\u{1D4A2};\u626B\u0400Aacfiosu\u0685\u068B\u0696\u069B\u069E\u06AA\u06BE\u06CARDcy;\u442A\u0100ct\u0690\u0694ek;\u42C7;\u405Eirc;\u4124r;\u610ClbertSpace;\u610B\u01F0\u06AF\\0\u06B2f;\u610DizontalLine;\u6500\u0100ct\u06C3\u06C5\xF2\u06A9rok;\u4126mp\u0144\u06D0\u06D8ownHum\xF0\u012Fqual;\u624F\u0700EJOacdfgmnostu\u06FA\u06FE\u0703\u0707\u070E\u071A\u071E\u0721\u0728\u0744\u0778\u078B\u078F\u0795cy;\u4415lig;\u4132cy;\u4401cute\u803B\xCD\u40CD\u0100iy\u0713\u0718rc\u803B\xCE\u40CE;\u4418ot;\u4130r;\u6111rave\u803B\xCC\u40CC\u0180;ap\u0720\u072F\u073F\u0100cg\u0734\u0737r;\u412AinaryI;\u6148lie\xF3\u03DD\u01F4\u0749\\0\u0762\u0100;e\u074D\u074E\u622C\u0100gr\u0753\u0758ral;\u622Bsection;\u62C2isible\u0100CT\u076C\u0772omma;\u6063imes;\u6062\u0180gpt\u077F\u0783\u0788on;\u412Ef;\uC000\u{1D540}a;\u4399cr;\u6110ilde;\u4128\u01EB\u079A\\0\u079Ecy;\u4406l\u803B\xCF\u40CF\u0280cfosu\u07AC\u07B7\u07BC\u07C2\u07D0\u0100iy\u07B1\u07B5rc;\u4134;\u4419r;\uC000\u{1D50D}pf;\uC000\u{1D541}\u01E3\u07C7\\0\u07CCr;\uC000\u{1D4A5}rcy;\u4408kcy;\u4404\u0380HJacfos\u07E4\u07E8\u07EC\u07F1\u07FD\u0802\u0808cy;\u4425cy;\u440Cppa;\u439A\u0100ey\u07F6\u07FBdil;\u4136;\u441Ar;\uC000\u{1D50E}pf;\uC000\u{1D542}cr;\uC000\u{1D4A6}\u0580JTaceflmost\u0825\u0829\u082C\u0850\u0863\u09B3\u09B8\u09C7\u09CD\u0A37\u0A47cy;\u4409\u803B<\u403C\u0280cmnpr\u0837\u083C\u0841\u0844\u084Dute;\u4139bda;\u439Bg;\u67EAlacetrf;\u6112r;\u619E\u0180aey\u0857\u085C\u0861ron;\u413Ddil;\u413B;\u441B\u0100fs\u0868\u0970t\u0500ACDFRTUVar\u087E\u08A9\u08B1\u08E0\u08E6\u08FC\u092F\u095B\u0390\u096A\u0100nr\u0883\u088FgleBracket;\u67E8row\u0180;BR\u0899\u089A\u089E\u6190ar;\u61E4ightArrow;\u61C6eiling;\u6308o\u01F5\u08B7\\0\u08C3bleBracket;\u67E6n\u01D4\u08C8\\0\u08D2eeVector;\u6961ector\u0100;B\u08DB\u08DC\u61C3ar;\u6959loor;\u630Aight\u0100AV\u08EF\u08F5rrow;\u6194ector;\u694E\u0100er\u0901\u0917e\u0180;AV\u0909\u090A\u0910\u62A3rrow;\u61A4ector;\u695Aiangle\u0180;BE\u0924\u0925\u0929\u62B2ar;\u69CFqual;\u62B4p\u0180DTV\u0937\u0942\u094CownVector;\u6951eeVector;\u6960ector\u0100;B\u0956\u0957\u61BFar;\u6958ector\u0100;B\u0965\u0966\u61BCar;\u6952ight\xE1\u039Cs\u0300EFGLST\u097E\u098B\u0995\u099D\u09A2\u09ADqualGreater;\u62DAullEqual;\u6266reater;\u6276ess;\u6AA1lantEqual;\u6A7Dilde;\u6272r;\uC000\u{1D50F}\u0100;e\u09BD\u09BE\u62D8ftarrow;\u61DAidot;\u413F\u0180npw\u09D4\u0A16\u0A1Bg\u0200LRlr\u09DE\u09F7\u0A02\u0A10eft\u0100AR\u09E6\u09ECrrow;\u67F5ightArrow;\u67F7ightArrow;\u67F6eft\u0100ar\u03B3\u0A0Aight\xE1\u03BFight\xE1\u03CAf;\uC000\u{1D543}er\u0100LR\u0A22\u0A2CeftArrow;\u6199ightArrow;\u6198\u0180cht\u0A3E\u0A40\u0A42\xF2\u084C;\u61B0rok;\u4141;\u626A\u0400acefiosu\u0A5A\u0A5D\u0A60\u0A77\u0A7C\u0A85\u0A8B\u0A8Ep;\u6905y;\u441C\u0100dl\u0A65\u0A6FiumSpace;\u605Flintrf;\u6133r;\uC000\u{1D510}nusPlus;\u6213pf;\uC000\u{1D544}c\xF2\u0A76;\u439C\u0480Jacefostu\u0AA3\u0AA7\u0AAD\u0AC0\u0B14\u0B19\u0D91\u0D97\u0D9Ecy;\u440Acute;\u4143\u0180aey\u0AB4\u0AB9\u0ABEron;\u4147dil;\u4145;\u441D\u0180gsw\u0AC7\u0AF0\u0B0Eative\u0180MTV\u0AD3\u0ADF\u0AE8ediumSpace;\u600Bhi\u0100cn\u0AE6\u0AD8\xEB\u0AD9eryThi\xEE\u0AD9ted\u0100GL\u0AF8\u0B06reaterGreate\xF2\u0673essLes\xF3\u0A48Line;\u400Ar;\uC000\u{1D511}\u0200Bnpt\u0B22\u0B28\u0B37\u0B3Areak;\u6060BreakingSpace;\u40A0f;\u6115\u0680;CDEGHLNPRSTV\u0B55\u0B56\u0B6A\u0B7C\u0BA1\u0BEB\u0C04\u0C5E\u0C84\u0CA6\u0CD8\u0D61\u0D85\u6AEC\u0100ou\u0B5B\u0B64ngruent;\u6262pCap;\u626DoubleVerticalBar;\u6226\u0180lqx\u0B83\u0B8A\u0B9Bement;\u6209ual\u0100;T\u0B92\u0B93\u6260ilde;\uC000\u2242\u0338ists;\u6204reater\u0380;EFGLST\u0BB6\u0BB7\u0BBD\u0BC9\u0BD3\u0BD8\u0BE5\u626Fqual;\u6271ullEqual;\uC000\u2267\u0338reater;\uC000\u226B\u0338ess;\u6279lantEqual;\uC000\u2A7E\u0338ilde;\u6275ump\u0144\u0BF2\u0BFDownHump;\uC000\u224E\u0338qual;\uC000\u224F\u0338e\u0100fs\u0C0A\u0C27tTriangle\u0180;BE\u0C1A\u0C1B\u0C21\u62EAar;\uC000\u29CF\u0338qual;\u62ECs\u0300;EGLST\u0C35\u0C36\u0C3C\u0C44\u0C4B\u0C58\u626Equal;\u6270reater;\u6278ess;\uC000\u226A\u0338lantEqual;\uC000\u2A7D\u0338ilde;\u6274ested\u0100GL\u0C68\u0C79reaterGreater;\uC000\u2AA2\u0338essLess;\uC000\u2AA1\u0338recedes\u0180;ES\u0C92\u0C93\u0C9B\u6280qual;\uC000\u2AAF\u0338lantEqual;\u62E0\u0100ei\u0CAB\u0CB9verseElement;\u620CghtTriangle\u0180;BE\u0CCB\u0CCC\u0CD2\u62EBar;\uC000\u29D0\u0338qual;\u62ED\u0100qu\u0CDD\u0D0CuareSu\u0100bp\u0CE8\u0CF9set\u0100;E\u0CF0\u0CF3\uC000\u228F\u0338qual;\u62E2erset\u0100;E\u0D03\u0D06\uC000\u2290\u0338qual;\u62E3\u0180bcp\u0D13\u0D24\u0D4Eset\u0100;E\u0D1B\u0D1E\uC000\u2282\u20D2qual;\u6288ceeds\u0200;EST\u0D32\u0D33\u0D3B\u0D46\u6281qual;\uC000\u2AB0\u0338lantEqual;\u62E1ilde;\uC000\u227F\u0338erset\u0100;E\u0D58\u0D5B\uC000\u2283\u20D2qual;\u6289ilde\u0200;EFT\u0D6E\u0D6F\u0D75\u0D7F\u6241qual;\u6244ullEqual;\u6247ilde;\u6249erticalBar;\u6224cr;\uC000\u{1D4A9}ilde\u803B\xD1\u40D1;\u439D\u0700Eacdfgmoprstuv\u0DBD\u0DC2\u0DC9\u0DD5\u0DDB\u0DE0\u0DE7\u0DFC\u0E02\u0E20\u0E22\u0E32\u0E3F\u0E44lig;\u4152cute\u803B\xD3\u40D3\u0100iy\u0DCE\u0DD3rc\u803B\xD4\u40D4;\u441Eblac;\u4150r;\uC000\u{1D512}rave\u803B\xD2\u40D2\u0180aei\u0DEE\u0DF2\u0DF6cr;\u414Cga;\u43A9cron;\u439Fpf;\uC000\u{1D546}enCurly\u0100DQ\u0E0E\u0E1AoubleQuote;\u601Cuote;\u6018;\u6A54\u0100cl\u0E27\u0E2Cr;\uC000\u{1D4AA}ash\u803B\xD8\u40D8i\u016C\u0E37\u0E3Cde\u803B\xD5\u40D5es;\u6A37ml\u803B\xD6\u40D6er\u0100BP\u0E4B\u0E60\u0100ar\u0E50\u0E53r;\u603Eac\u0100ek\u0E5A\u0E5C;\u63DEet;\u63B4arenthesis;\u63DC\u0480acfhilors\u0E7F\u0E87\u0E8A\u0E8F\u0E92\u0E94\u0E9D\u0EB0\u0EFCrtialD;\u6202y;\u441Fr;\uC000\u{1D513}i;\u43A6;\u43A0usMinus;\u40B1\u0100ip\u0EA2\u0EADncareplan\xE5\u069Df;\u6119\u0200;eio\u0EB9\u0EBA\u0EE0\u0EE4\u6ABBcedes\u0200;EST\u0EC8\u0EC9\u0ECF\u0EDA\u627Aqual;\u6AAFlantEqual;\u627Cilde;\u627Eme;\u6033\u0100dp\u0EE9\u0EEEuct;\u620Fortion\u0100;a\u0225\u0EF9l;\u621D\u0100ci\u0F01\u0F06r;\uC000\u{1D4AB};\u43A8\u0200Ufos\u0F11\u0F16\u0F1B\u0F1FOT\u803B"\u4022r;\uC000\u{1D514}pf;\u611Acr;\uC000\u{1D4AC}\u0600BEacefhiorsu\u0F3E\u0F43\u0F47\u0F60\u0F73\u0FA7\u0FAA\u0FAD\u1096\u10A9\u10B4\u10BEarr;\u6910G\u803B\xAE\u40AE\u0180cnr\u0F4E\u0F53\u0F56ute;\u4154g;\u67EBr\u0100;t\u0F5C\u0F5D\u61A0l;\u6916\u0180aey\u0F67\u0F6C\u0F71ron;\u4158dil;\u4156;\u4420\u0100;v\u0F78\u0F79\u611Cerse\u0100EU\u0F82\u0F99\u0100lq\u0F87\u0F8Eement;\u620Builibrium;\u61CBpEquilibrium;\u696Fr\xBB\u0F79o;\u43A1ght\u0400ACDFTUVa\u0FC1\u0FEB\u0FF3\u1022\u1028\u105B\u1087\u03D8\u0100nr\u0FC6\u0FD2gleBracket;\u67E9row\u0180;BL\u0FDC\u0FDD\u0FE1\u6192ar;\u61E5eftArrow;\u61C4eiling;\u6309o\u01F5\u0FF9\\0\u1005bleBracket;\u67E7n\u01D4\u100A\\0\u1014eeVector;\u695Dector\u0100;B\u101D\u101E\u61C2ar;\u6955loor;\u630B\u0100er\u102D\u1043e\u0180;AV\u1035\u1036\u103C\u62A2rrow;\u61A6ector;\u695Biangle\u0180;BE\u1050\u1051\u1055\u62B3ar;\u69D0qual;\u62B5p\u0180DTV\u1063\u106E\u1078ownVector;\u694FeeVector;\u695Cector\u0100;B\u1082\u1083\u61BEar;\u6954ector\u0100;B\u1091\u1092\u61C0ar;\u6953\u0100pu\u109B\u109Ef;\u611DndImplies;\u6970ightarrow;\u61DB\u0100ch\u10B9\u10BCr;\u611B;\u61B1leDelayed;\u69F4\u0680HOacfhimoqstu\u10E4\u10F1\u10F7\u10FD\u1119\u111E\u1151\u1156\u1161\u1167\u11B5\u11BB\u11BF\u0100Cc\u10E9\u10EEHcy;\u4429y;\u4428FTcy;\u442Ccute;\u415A\u0280;aeiy\u1108\u1109\u110E\u1113\u1117\u6ABCron;\u4160dil;\u415Erc;\u415C;\u4421r;\uC000\u{1D516}ort\u0200DLRU\u112A\u1134\u113E\u1149ownArrow\xBB\u041EeftArrow\xBB\u089AightArrow\xBB\u0FDDpArrow;\u6191gma;\u43A3allCircle;\u6218pf;\uC000\u{1D54A}\u0272\u116D\\0\\0\u1170t;\u621Aare\u0200;ISU\u117B\u117C\u1189\u11AF\u65A1ntersection;\u6293u\u0100bp\u118F\u119Eset\u0100;E\u1197\u1198\u628Fqual;\u6291erset\u0100;E\u11A8\u11A9\u6290qual;\u6292nion;\u6294cr;\uC000\u{1D4AE}ar;\u62C6\u0200bcmp\u11C8\u11DB\u1209\u120B\u0100;s\u11CD\u11CE\u62D0et\u0100;E\u11CD\u11D5qual;\u6286\u0100ch\u11E0\u1205eeds\u0200;EST\u11ED\u11EE\u11F4\u11FF\u627Bqual;\u6AB0lantEqual;\u627Dilde;\u627FTh\xE1\u0F8C;\u6211\u0180;es\u1212\u1213\u1223\u62D1rset\u0100;E\u121C\u121D\u6283qual;\u6287et\xBB\u1213\u0580HRSacfhiors\u123E\u1244\u1249\u1255\u125E\u1271\u1276\u129F\u12C2\u12C8\u12D1ORN\u803B\xDE\u40DEADE;\u6122\u0100Hc\u124E\u1252cy;\u440By;\u4426\u0100bu\u125A\u125C;\u4009;\u43A4\u0180aey\u1265\u126A\u126Fron;\u4164dil;\u4162;\u4422r;\uC000\u{1D517}\u0100ei\u127B\u1289\u01F2\u1280\\0\u1287efore;\u6234a;\u4398\u0100cn\u128E\u1298kSpace;\uC000\u205F\u200ASpace;\u6009lde\u0200;EFT\u12AB\u12AC\u12B2\u12BC\u623Cqual;\u6243ullEqual;\u6245ilde;\u6248pf;\uC000\u{1D54B}ipleDot;\u60DB\u0100ct\u12D6\u12DBr;\uC000\u{1D4AF}rok;\u4166\u0AE1\u12F7\u130E\u131A\u1326\\0\u132C\u1331\\0\\0\\0\\0\\0\u1338\u133D\u1377\u1385\\0\u13FF\u1404\u140A\u1410\u0100cr\u12FB\u1301ute\u803B\xDA\u40DAr\u0100;o\u1307\u1308\u619Fcir;\u6949r\u01E3\u1313\\0\u1316y;\u440Eve;\u416C\u0100iy\u131E\u1323rc\u803B\xDB\u40DB;\u4423blac;\u4170r;\uC000\u{1D518}rave\u803B\xD9\u40D9acr;\u416A\u0100di\u1341\u1369er\u0100BP\u1348\u135D\u0100ar\u134D\u1350r;\u405Fac\u0100ek\u1357\u1359;\u63DFet;\u63B5arenthesis;\u63DDon\u0100;P\u1370\u1371\u62C3lus;\u628E\u0100gp\u137B\u137Fon;\u4172f;\uC000\u{1D54C}\u0400ADETadps\u1395\u13AE\u13B8\u13C4\u03E8\u13D2\u13D7\u13F3rrow\u0180;BD\u1150\u13A0\u13A4ar;\u6912ownArrow;\u61C5ownArrow;\u6195quilibrium;\u696Eee\u0100;A\u13CB\u13CC\u62A5rrow;\u61A5own\xE1\u03F3er\u0100LR\u13DE\u13E8eftArrow;\u6196ightArrow;\u6197i\u0100;l\u13F9\u13FA\u43D2on;\u43A5ing;\u416Ecr;\uC000\u{1D4B0}ilde;\u4168ml\u803B\xDC\u40DC\u0480Dbcdefosv\u1427\u142C\u1430\u1433\u143E\u1485\u148A\u1490\u1496ash;\u62ABar;\u6AEBy;\u4412ash\u0100;l\u143B\u143C\u62A9;\u6AE6\u0100er\u1443\u1445;\u62C1\u0180bty\u144C\u1450\u147Aar;\u6016\u0100;i\u144F\u1455cal\u0200BLST\u1461\u1465\u146A\u1474ar;\u6223ine;\u407Ceparator;\u6758ilde;\u6240ThinSpace;\u600Ar;\uC000\u{1D519}pf;\uC000\u{1D54D}cr;\uC000\u{1D4B1}dash;\u62AA\u0280cefos\u14A7\u14AC\u14B1\u14B6\u14BCirc;\u4174dge;\u62C0r;\uC000\u{1D51A}pf;\uC000\u{1D54E}cr;\uC000\u{1D4B2}\u0200fios\u14CB\u14D0\u14D2\u14D8r;\uC000\u{1D51B};\u439Epf;\uC000\u{1D54F}cr;\uC000\u{1D4B3}\u0480AIUacfosu\u14F1\u14F5\u14F9\u14FD\u1504\u150F\u1514\u151A\u1520cy;\u442Fcy;\u4407cy;\u442Ecute\u803B\xDD\u40DD\u0100iy\u1509\u150Drc;\u4176;\u442Br;\uC000\u{1D51C}pf;\uC000\u{1D550}cr;\uC000\u{1D4B4}ml;\u4178\u0400Hacdefos\u1535\u1539\u153F\u154B\u154F\u155D\u1560\u1564cy;\u4416cute;\u4179\u0100ay\u1544\u1549ron;\u417D;\u4417ot;\u417B\u01F2\u1554\\0\u155BoWidt\xE8\u0AD9a;\u4396r;\u6128pf;\u6124cr;\uC000\u{1D4B5}\u0BE1\u1583\u158A\u1590\\0\u15B0\u15B6\u15BF\\0\\0\\0\\0\u15C6\u15DB\u15EB\u165F\u166D\\0\u1695\u169B\u16B2\u16B9\\0\u16BEcute\u803B\xE1\u40E1reve;\u4103\u0300;Ediuy\u159C\u159D\u15A1\u15A3\u15A8\u15AD\u623E;\uC000\u223E\u0333;\u623Frc\u803B\xE2\u40E2te\u80BB\xB4\u0306;\u4430lig\u803B\xE6\u40E6\u0100;r\xB2\u15BA;\uC000\u{1D51E}rave\u803B\xE0\u40E0\u0100ep\u15CA\u15D6\u0100fp\u15CF\u15D4sym;\u6135\xE8\u15D3ha;\u43B1\u0100ap\u15DFc\u0100cl\u15E4\u15E7r;\u4101g;\u6A3F\u0264\u15F0\\0\\0\u160A\u0280;adsv\u15FA\u15FB\u15FF\u1601\u1607\u6227nd;\u6A55;\u6A5Clope;\u6A58;\u6A5A\u0380;elmrsz\u1618\u1619\u161B\u161E\u163F\u164F\u1659\u6220;\u69A4e\xBB\u1619sd\u0100;a\u1625\u1626\u6221\u0461\u1630\u1632\u1634\u1636\u1638\u163A\u163C\u163E;\u69A8;\u69A9;\u69AA;\u69AB;\u69AC;\u69AD;\u69AE;\u69AFt\u0100;v\u1645\u1646\u621Fb\u0100;d\u164C\u164D\u62BE;\u699D\u0100pt\u1654\u1657h;\u6222\xBB\xB9arr;\u637C\u0100gp\u1663\u1667on;\u4105f;\uC000\u{1D552}\u0380;Eaeiop\u12C1\u167B\u167D\u1682\u1684\u1687\u168A;\u6A70cir;\u6A6F;\u624Ad;\u624Bs;\u4027rox\u0100;e\u12C1\u1692\xF1\u1683ing\u803B\xE5\u40E5\u0180cty\u16A1\u16A6\u16A8r;\uC000\u{1D4B6};\u402Amp\u0100;e\u12C1\u16AF\xF1\u0288ilde\u803B\xE3\u40E3ml\u803B\xE4\u40E4\u0100ci\u16C2\u16C8onin\xF4\u0272nt;\u6A11\u0800Nabcdefiklnoprsu\u16ED\u16F1\u1730\u173C\u1743\u1748\u1778\u177D\u17E0\u17E6\u1839\u1850\u170D\u193D\u1948\u1970ot;\u6AED\u0100cr\u16F6\u171Ek\u0200ceps\u1700\u1705\u170D\u1713ong;\u624Cpsilon;\u43F6rime;\u6035im\u0100;e\u171A\u171B\u623Dq;\u62CD\u0176\u1722\u1726ee;\u62BDed\u0100;g\u172C\u172D\u6305e\xBB\u172Drk\u0100;t\u135C\u1737brk;\u63B6\u0100oy\u1701\u1741;\u4431quo;\u601E\u0280cmprt\u1753\u175B\u1761\u1764\u1768aus\u0100;e\u010A\u0109ptyv;\u69B0s\xE9\u170Cno\xF5\u0113\u0180ahw\u176F\u1771\u1773;\u43B2;\u6136een;\u626Cr;\uC000\u{1D51F}g\u0380costuvw\u178D\u179D\u17B3\u17C1\u17D5\u17DB\u17DE\u0180aiu\u1794\u1796\u179A\xF0\u0760rc;\u65EFp\xBB\u1371\u0180dpt\u17A4\u17A8\u17ADot;\u6A00lus;\u6A01imes;\u6A02\u0271\u17B9\\0\\0\u17BEcup;\u6A06ar;\u6605riangle\u0100du\u17CD\u17D2own;\u65BDp;\u65B3plus;\u6A04e\xE5\u1444\xE5\u14ADarow;\u690D\u0180ako\u17ED\u1826\u1835\u0100cn\u17F2\u1823k\u0180lst\u17FA\u05AB\u1802ozenge;\u69EBriangle\u0200;dlr\u1812\u1813\u1818\u181D\u65B4own;\u65BEeft;\u65C2ight;\u65B8k;\u6423\u01B1\u182B\\0\u1833\u01B2\u182F\\0\u1831;\u6592;\u65914;\u6593ck;\u6588\u0100eo\u183E\u184D\u0100;q\u1843\u1846\uC000=\u20E5uiv;\uC000\u2261\u20E5t;\u6310\u0200ptwx\u1859\u185E\u1867\u186Cf;\uC000\u{1D553}\u0100;t\u13CB\u1863om\xBB\u13CCtie;\u62C8\u0600DHUVbdhmptuv\u1885\u1896\u18AA\u18BB\u18D7\u18DB\u18EC\u18FF\u1905\u190A\u1910\u1921\u0200LRlr\u188E\u1890\u1892\u1894;\u6557;\u6554;\u6556;\u6553\u0280;DUdu\u18A1\u18A2\u18A4\u18A6\u18A8\u6550;\u6566;\u6569;\u6564;\u6567\u0200LRlr\u18B3\u18B5\u18B7\u18B9;\u655D;\u655A;\u655C;\u6559\u0380;HLRhlr\u18CA\u18CB\u18CD\u18CF\u18D1\u18D3\u18D5\u6551;\u656C;\u6563;\u6560;\u656B;\u6562;\u655Fox;\u69C9\u0200LRlr\u18E4\u18E6\u18E8\u18EA;\u6555;\u6552;\u6510;\u650C\u0280;DUdu\u06BD\u18F7\u18F9\u18FB\u18FD;\u6565;\u6568;\u652C;\u6534inus;\u629Flus;\u629Eimes;\u62A0\u0200LRlr\u1919\u191B\u191D\u191F;\u655B;\u6558;\u6518;\u6514\u0380;HLRhlr\u1930\u1931\u1933\u1935\u1937\u1939\u193B\u6502;\u656A;\u6561;\u655E;\u653C;\u6524;\u651C\u0100ev\u0123\u1942bar\u803B\xA6\u40A6\u0200ceio\u1951\u1956\u195A\u1960r;\uC000\u{1D4B7}mi;\u604Fm\u0100;e\u171A\u171Cl\u0180;bh\u1968\u1969\u196B\u405C;\u69C5sub;\u67C8\u016C\u1974\u197El\u0100;e\u1979\u197A\u6022t\xBB\u197Ap\u0180;Ee\u012F\u1985\u1987;\u6AAE\u0100;q\u06DC\u06DB\u0CE1\u19A7\\0\u19E8\u1A11\u1A15\u1A32\\0\u1A37\u1A50\\0\\0\u1AB4\\0\\0\u1AC1\\0\\0\u1B21\u1B2E\u1B4D\u1B52\\0\u1BFD\\0\u1C0C\u0180cpr\u19AD\u19B2\u19DDute;\u4107\u0300;abcds\u19BF\u19C0\u19C4\u19CA\u19D5\u19D9\u6229nd;\u6A44rcup;\u6A49\u0100au\u19CF\u19D2p;\u6A4Bp;\u6A47ot;\u6A40;\uC000\u2229\uFE00\u0100eo\u19E2\u19E5t;\u6041\xEE\u0693\u0200aeiu\u19F0\u19FB\u1A01\u1A05\u01F0\u19F5\\0\u19F8s;\u6A4Don;\u410Ddil\u803B\xE7\u40E7rc;\u4109ps\u0100;s\u1A0C\u1A0D\u6A4Cm;\u6A50ot;\u410B\u0180dmn\u1A1B\u1A20\u1A26il\u80BB\xB8\u01ADptyv;\u69B2t\u8100\xA2;e\u1A2D\u1A2E\u40A2r\xE4\u01B2r;\uC000\u{1D520}\u0180cei\u1A3D\u1A40\u1A4Dy;\u4447ck\u0100;m\u1A47\u1A48\u6713ark\xBB\u1A48;\u43C7r\u0380;Ecefms\u1A5F\u1A60\u1A62\u1A6B\u1AA4\u1AAA\u1AAE\u65CB;\u69C3\u0180;el\u1A69\u1A6A\u1A6D\u42C6q;\u6257e\u0261\u1A74\\0\\0\u1A88rrow\u0100lr\u1A7C\u1A81eft;\u61BAight;\u61BB\u0280RSacd\u1A92\u1A94\u1A96\u1A9A\u1A9F\xBB\u0F47;\u64C8st;\u629Birc;\u629Aash;\u629Dnint;\u6A10id;\u6AEFcir;\u69C2ubs\u0100;u\u1ABB\u1ABC\u6663it\xBB\u1ABC\u02EC\u1AC7\u1AD4\u1AFA\\0\u1B0Aon\u0100;e\u1ACD\u1ACE\u403A\u0100;q\xC7\xC6\u026D\u1AD9\\0\\0\u1AE2a\u0100;t\u1ADE\u1ADF\u402C;\u4040\u0180;fl\u1AE8\u1AE9\u1AEB\u6201\xEE\u1160e\u0100mx\u1AF1\u1AF6ent\xBB\u1AE9e\xF3\u024D\u01E7\u1AFE\\0\u1B07\u0100;d\u12BB\u1B02ot;\u6A6Dn\xF4\u0246\u0180fry\u1B10\u1B14\u1B17;\uC000\u{1D554}o\xE4\u0254\u8100\xA9;s\u0155\u1B1Dr;\u6117\u0100ao\u1B25\u1B29rr;\u61B5ss;\u6717\u0100cu\u1B32\u1B37r;\uC000\u{1D4B8}\u0100bp\u1B3C\u1B44\u0100;e\u1B41\u1B42\u6ACF;\u6AD1\u0100;e\u1B49\u1B4A\u6AD0;\u6AD2dot;\u62EF\u0380delprvw\u1B60\u1B6C\u1B77\u1B82\u1BAC\u1BD4\u1BF9arr\u0100lr\u1B68\u1B6A;\u6938;\u6935\u0270\u1B72\\0\\0\u1B75r;\u62DEc;\u62DFarr\u0100;p\u1B7F\u1B80\u61B6;\u693D\u0300;bcdos\u1B8F\u1B90\u1B96\u1BA1\u1BA5\u1BA8\u622Arcap;\u6A48\u0100au\u1B9B\u1B9Ep;\u6A46p;\u6A4Aot;\u628Dr;\u6A45;\uC000\u222A\uFE00\u0200alrv\u1BB5\u1BBF\u1BDE\u1BE3rr\u0100;m\u1BBC\u1BBD\u61B7;\u693Cy\u0180evw\u1BC7\u1BD4\u1BD8q\u0270\u1BCE\\0\\0\u1BD2re\xE3\u1B73u\xE3\u1B75ee;\u62CEedge;\u62CFen\u803B\xA4\u40A4earrow\u0100lr\u1BEE\u1BF3eft\xBB\u1B80ight\xBB\u1BBDe\xE4\u1BDD\u0100ci\u1C01\u1C07onin\xF4\u01F7nt;\u6231lcty;\u632D\u0980AHabcdefhijlorstuwz\u1C38\u1C3B\u1C3F\u1C5D\u1C69\u1C75\u1C8A\u1C9E\u1CAC\u1CB7\u1CFB\u1CFF\u1D0D\u1D7B\u1D91\u1DAB\u1DBB\u1DC6\u1DCDr\xF2\u0381ar;\u6965\u0200glrs\u1C48\u1C4D\u1C52\u1C54ger;\u6020eth;\u6138\xF2\u1133h\u0100;v\u1C5A\u1C5B\u6010\xBB\u090A\u016B\u1C61\u1C67arow;\u690Fa\xE3\u0315\u0100ay\u1C6E\u1C73ron;\u410F;\u4434\u0180;ao\u0332\u1C7C\u1C84\u0100gr\u02BF\u1C81r;\u61CAtseq;\u6A77\u0180glm\u1C91\u1C94\u1C98\u803B\xB0\u40B0ta;\u43B4ptyv;\u69B1\u0100ir\u1CA3\u1CA8sht;\u697F;\uC000\u{1D521}ar\u0100lr\u1CB3\u1CB5\xBB\u08DC\xBB\u101E\u0280aegsv\u1CC2\u0378\u1CD6\u1CDC\u1CE0m\u0180;os\u0326\u1CCA\u1CD4nd\u0100;s\u0326\u1CD1uit;\u6666amma;\u43DDin;\u62F2\u0180;io\u1CE7\u1CE8\u1CF8\u40F7de\u8100\xF7;o\u1CE7\u1CF0ntimes;\u62C7n\xF8\u1CF7cy;\u4452c\u026F\u1D06\\0\\0\u1D0Arn;\u631Eop;\u630D\u0280lptuw\u1D18\u1D1D\u1D22\u1D49\u1D55lar;\u4024f;\uC000\u{1D555}\u0280;emps\u030B\u1D2D\u1D37\u1D3D\u1D42q\u0100;d\u0352\u1D33ot;\u6251inus;\u6238lus;\u6214quare;\u62A1blebarwedg\xE5\xFAn\u0180adh\u112E\u1D5D\u1D67ownarrow\xF3\u1C83arpoon\u0100lr\u1D72\u1D76ef\xF4\u1CB4igh\xF4\u1CB6\u0162\u1D7F\u1D85karo\xF7\u0F42\u026F\u1D8A\\0\\0\u1D8Ern;\u631Fop;\u630C\u0180cot\u1D98\u1DA3\u1DA6\u0100ry\u1D9D\u1DA1;\uC000\u{1D4B9};\u4455l;\u69F6rok;\u4111\u0100dr\u1DB0\u1DB4ot;\u62F1i\u0100;f\u1DBA\u1816\u65BF\u0100ah\u1DC0\u1DC3r\xF2\u0429a\xF2\u0FA6angle;\u69A6\u0100ci\u1DD2\u1DD5y;\u445Fgrarr;\u67FF\u0900Dacdefglmnopqrstux\u1E01\u1E09\u1E19\u1E38\u0578\u1E3C\u1E49\u1E61\u1E7E\u1EA5\u1EAF\u1EBD\u1EE1\u1F2A\u1F37\u1F44\u1F4E\u1F5A\u0100Do\u1E06\u1D34o\xF4\u1C89\u0100cs\u1E0E\u1E14ute\u803B\xE9\u40E9ter;\u6A6E\u0200aioy\u1E22\u1E27\u1E31\u1E36ron;\u411Br\u0100;c\u1E2D\u1E2E\u6256\u803B\xEA\u40EAlon;\u6255;\u444Dot;\u4117\u0100Dr\u1E41\u1E45ot;\u6252;\uC000\u{1D522}\u0180;rs\u1E50\u1E51\u1E57\u6A9Aave\u803B\xE8\u40E8\u0100;d\u1E5C\u1E5D\u6A96ot;\u6A98\u0200;ils\u1E6A\u1E6B\u1E72\u1E74\u6A99nters;\u63E7;\u6113\u0100;d\u1E79\u1E7A\u6A95ot;\u6A97\u0180aps\u1E85\u1E89\u1E97cr;\u4113ty\u0180;sv\u1E92\u1E93\u1E95\u6205et\xBB\u1E93p\u01001;\u1E9D\u1EA4\u0133\u1EA1\u1EA3;\u6004;\u6005\u6003\u0100gs\u1EAA\u1EAC;\u414Bp;\u6002\u0100gp\u1EB4\u1EB8on;\u4119f;\uC000\u{1D556}\u0180als\u1EC4\u1ECE\u1ED2r\u0100;s\u1ECA\u1ECB\u62D5l;\u69E3us;\u6A71i\u0180;lv\u1EDA\u1EDB\u1EDF\u43B5on\xBB\u1EDB;\u43F5\u0200csuv\u1EEA\u1EF3\u1F0B\u1F23\u0100io\u1EEF\u1E31rc\xBB\u1E2E\u0269\u1EF9\\0\\0\u1EFB\xED\u0548ant\u0100gl\u1F02\u1F06tr\xBB\u1E5Dess\xBB\u1E7A\u0180aei\u1F12\u1F16\u1F1Als;\u403Dst;\u625Fv\u0100;D\u0235\u1F20D;\u6A78parsl;\u69E5\u0100Da\u1F2F\u1F33ot;\u6253rr;\u6971\u0180cdi\u1F3E\u1F41\u1EF8r;\u612Fo\xF4\u0352\u0100ah\u1F49\u1F4B;\u43B7\u803B\xF0\u40F0\u0100mr\u1F53\u1F57l\u803B\xEB\u40EBo;\u60AC\u0180cip\u1F61\u1F64\u1F67l;\u4021s\xF4\u056E\u0100eo\u1F6C\u1F74ctatio\xEE\u0559nential\xE5\u0579\u09E1\u1F92\\0\u1F9E\\0\u1FA1\u1FA7\\0\\0\u1FC6\u1FCC\\0\u1FD3\\0\u1FE6\u1FEA\u2000\\0\u2008\u205Allingdotse\xF1\u1E44y;\u4444male;\u6640\u0180ilr\u1FAD\u1FB3\u1FC1lig;\u8000\uFB03\u0269\u1FB9\\0\\0\u1FBDg;\u8000\uFB00ig;\u8000\uFB04;\uC000\u{1D523}lig;\u8000\uFB01lig;\uC000fj\u0180alt\u1FD9\u1FDC\u1FE1t;\u666Dig;\u8000\uFB02ns;\u65B1of;\u4192\u01F0\u1FEE\\0\u1FF3f;\uC000\u{1D557}\u0100ak\u05BF\u1FF7\u0100;v\u1FFC\u1FFD\u62D4;\u6AD9artint;\u6A0D\u0100ao\u200C\u2055\u0100cs\u2011\u2052\u03B1\u201A\u2030\u2038\u2045\u2048\\0\u2050\u03B2\u2022\u2025\u2027\u202A\u202C\\0\u202E\u803B\xBD\u40BD;\u6153\u803B\xBC\u40BC;\u6155;\u6159;\u615B\u01B3\u2034\\0\u2036;\u6154;\u6156\u02B4\u203E\u2041\\0\\0\u2043\u803B\xBE\u40BE;\u6157;\u615C5;\u6158\u01B6\u204C\\0\u204E;\u615A;\u615D8;\u615El;\u6044wn;\u6322cr;\uC000\u{1D4BB}\u0880Eabcdefgijlnorstv\u2082\u2089\u209F\u20A5\u20B0\u20B4\u20F0\u20F5\u20FA\u20FF\u2103\u2112\u2138\u0317\u213E\u2152\u219E\u0100;l\u064D\u2087;\u6A8C\u0180cmp\u2090\u2095\u209Dute;\u41F5ma\u0100;d\u209C\u1CDA\u43B3;\u6A86reve;\u411F\u0100iy\u20AA\u20AErc;\u411D;\u4433ot;\u4121\u0200;lqs\u063E\u0642\u20BD\u20C9\u0180;qs\u063E\u064C\u20C4lan\xF4\u0665\u0200;cdl\u0665\u20D2\u20D5\u20E5c;\u6AA9ot\u0100;o\u20DC\u20DD\u6A80\u0100;l\u20E2\u20E3\u6A82;\u6A84\u0100;e\u20EA\u20ED\uC000\u22DB\uFE00s;\u6A94r;\uC000\u{1D524}\u0100;g\u0673\u061Bmel;\u6137cy;\u4453\u0200;Eaj\u065A\u210C\u210E\u2110;\u6A92;\u6AA5;\u6AA4\u0200Eaes\u211B\u211D\u2129\u2134;\u6269p\u0100;p\u2123\u2124\u6A8Arox\xBB\u2124\u0100;q\u212E\u212F\u6A88\u0100;q\u212E\u211Bim;\u62E7pf;\uC000\u{1D558}\u0100ci\u2143\u2146r;\u610Am\u0180;el\u066B\u214E\u2150;\u6A8E;\u6A90\u8300>;cdlqr\u05EE\u2160\u216A\u216E\u2173\u2179\u0100ci\u2165\u2167;\u6AA7r;\u6A7Aot;\u62D7Par;\u6995uest;\u6A7C\u0280adels\u2184\u216A\u2190\u0656\u219B\u01F0\u2189\\0\u218Epro\xF8\u209Er;\u6978q\u0100lq\u063F\u2196les\xF3\u2088i\xED\u066B\u0100en\u21A3\u21ADrtneqq;\uC000\u2269\uFE00\xC5\u21AA\u0500Aabcefkosy\u21C4\u21C7\u21F1\u21F5\u21FA\u2218\u221D\u222F\u2268\u227Dr\xF2\u03A0\u0200ilmr\u21D0\u21D4\u21D7\u21DBrs\xF0\u1484f\xBB\u2024il\xF4\u06A9\u0100dr\u21E0\u21E4cy;\u444A\u0180;cw\u08F4\u21EB\u21EFir;\u6948;\u61ADar;\u610Firc;\u4125\u0180alr\u2201\u220E\u2213rts\u0100;u\u2209\u220A\u6665it\xBB\u220Alip;\u6026con;\u62B9r;\uC000\u{1D525}s\u0100ew\u2223\u2229arow;\u6925arow;\u6926\u0280amopr\u223A\u223E\u2243\u225E\u2263rr;\u61FFtht;\u623Bk\u0100lr\u2249\u2253eftarrow;\u61A9ightarrow;\u61AAf;\uC000\u{1D559}bar;\u6015\u0180clt\u226F\u2274\u2278r;\uC000\u{1D4BD}as\xE8\u21F4rok;\u4127\u0100bp\u2282\u2287ull;\u6043hen\xBB\u1C5B\u0AE1\u22A3\\0\u22AA\\0\u22B8\u22C5\u22CE\\0\u22D5\u22F3\\0\\0\u22F8\u2322\u2367\u2362\u237F\\0\u2386\u23AA\u23B4cute\u803B\xED\u40ED\u0180;iy\u0771\u22B0\u22B5rc\u803B\xEE\u40EE;\u4438\u0100cx\u22BC\u22BFy;\u4435cl\u803B\xA1\u40A1\u0100fr\u039F\u22C9;\uC000\u{1D526}rave\u803B\xEC\u40EC\u0200;ino\u073E\u22DD\u22E9\u22EE\u0100in\u22E2\u22E6nt;\u6A0Ct;\u622Dfin;\u69DCta;\u6129lig;\u4133\u0180aop\u22FE\u231A\u231D\u0180cgt\u2305\u2308\u2317r;\u412B\u0180elp\u071F\u230F\u2313in\xE5\u078Ear\xF4\u0720h;\u4131f;\u62B7ed;\u41B5\u0280;cfot\u04F4\u232C\u2331\u233D\u2341are;\u6105in\u0100;t\u2338\u2339\u621Eie;\u69DDdo\xF4\u2319\u0280;celp\u0757\u234C\u2350\u235B\u2361al;\u62BA\u0100gr\u2355\u2359er\xF3\u1563\xE3\u234Darhk;\u6A17rod;\u6A3C\u0200cgpt\u236F\u2372\u2376\u237By;\u4451on;\u412Ff;\uC000\u{1D55A}a;\u43B9uest\u803B\xBF\u40BF\u0100ci\u238A\u238Fr;\uC000\u{1D4BE}n\u0280;Edsv\u04F4\u239B\u239D\u23A1\u04F3;\u62F9ot;\u62F5\u0100;v\u23A6\u23A7\u62F4;\u62F3\u0100;i\u0777\u23AElde;\u4129\u01EB\u23B8\\0\u23BCcy;\u4456l\u803B\xEF\u40EF\u0300cfmosu\u23CC\u23D7\u23DC\u23E1\u23E7\u23F5\u0100iy\u23D1\u23D5rc;\u4135;\u4439r;\uC000\u{1D527}ath;\u4237pf;\uC000\u{1D55B}\u01E3\u23EC\\0\u23F1r;\uC000\u{1D4BF}rcy;\u4458kcy;\u4454\u0400acfghjos\u240B\u2416\u2422\u2427\u242D\u2431\u2435\u243Bppa\u0100;v\u2413\u2414\u43BA;\u43F0\u0100ey\u241B\u2420dil;\u4137;\u443Ar;\uC000\u{1D528}reen;\u4138cy;\u4445cy;\u445Cpf;\uC000\u{1D55C}cr;\uC000\u{1D4C0}\u0B80ABEHabcdefghjlmnoprstuv\u2470\u2481\u2486\u248D\u2491\u250E\u253D\u255A\u2580\u264E\u265E\u2665\u2679\u267D\u269A\u26B2\u26D8\u275D\u2768\u278B\u27C0\u2801\u2812\u0180art\u2477\u247A\u247Cr\xF2\u09C6\xF2\u0395ail;\u691Barr;\u690E\u0100;g\u0994\u248B;\u6A8Bar;\u6962\u0963\u24A5\\0\u24AA\\0\u24B1\\0\\0\\0\\0\\0\u24B5\u24BA\\0\u24C6\u24C8\u24CD\\0\u24F9ute;\u413Amptyv;\u69B4ra\xEE\u084Cbda;\u43BBg\u0180;dl\u088E\u24C1\u24C3;\u6991\xE5\u088E;\u6A85uo\u803B\xAB\u40ABr\u0400;bfhlpst\u0899\u24DE\u24E6\u24E9\u24EB\u24EE\u24F1\u24F5\u0100;f\u089D\u24E3s;\u691Fs;\u691D\xEB\u2252p;\u61ABl;\u6939im;\u6973l;\u61A2\u0180;ae\u24FF\u2500\u2504\u6AABil;\u6919\u0100;s\u2509\u250A\u6AAD;\uC000\u2AAD\uFE00\u0180abr\u2515\u2519\u251Drr;\u690Crk;\u6772\u0100ak\u2522\u252Cc\u0100ek\u2528\u252A;\u407B;\u405B\u0100es\u2531\u2533;\u698Bl\u0100du\u2539\u253B;\u698F;\u698D\u0200aeuy\u2546\u254B\u2556\u2558ron;\u413E\u0100di\u2550\u2554il;\u413C\xEC\u08B0\xE2\u2529;\u443B\u0200cqrs\u2563\u2566\u256D\u257Da;\u6936uo\u0100;r\u0E19\u1746\u0100du\u2572\u2577har;\u6967shar;\u694Bh;\u61B2\u0280;fgqs\u258B\u258C\u0989\u25F3\u25FF\u6264t\u0280ahlrt\u2598\u25A4\u25B7\u25C2\u25E8rrow\u0100;t\u0899\u25A1a\xE9\u24F6arpoon\u0100du\u25AF\u25B4own\xBB\u045Ap\xBB\u0966eftarrows;\u61C7ight\u0180ahs\u25CD\u25D6\u25DErrow\u0100;s\u08F4\u08A7arpoon\xF3\u0F98quigarro\xF7\u21F0hreetimes;\u62CB\u0180;qs\u258B\u0993\u25FAlan\xF4\u09AC\u0280;cdgs\u09AC\u260A\u260D\u261D\u2628c;\u6AA8ot\u0100;o\u2614\u2615\u6A7F\u0100;r\u261A\u261B\u6A81;\u6A83\u0100;e\u2622\u2625\uC000\u22DA\uFE00s;\u6A93\u0280adegs\u2633\u2639\u263D\u2649\u264Bppro\xF8\u24C6ot;\u62D6q\u0100gq\u2643\u2645\xF4\u0989gt\xF2\u248C\xF4\u099Bi\xED\u09B2\u0180ilr\u2655\u08E1\u265Asht;\u697C;\uC000\u{1D529}\u0100;E\u099C\u2663;\u6A91\u0161\u2669\u2676r\u0100du\u25B2\u266E\u0100;l\u0965\u2673;\u696Alk;\u6584cy;\u4459\u0280;acht\u0A48\u2688\u268B\u2691\u2696r\xF2\u25C1orne\xF2\u1D08ard;\u696Bri;\u65FA\u0100io\u269F\u26A4dot;\u4140ust\u0100;a\u26AC\u26AD\u63B0che\xBB\u26AD\u0200Eaes\u26BB\u26BD\u26C9\u26D4;\u6268p\u0100;p\u26C3\u26C4\u6A89rox\xBB\u26C4\u0100;q\u26CE\u26CF\u6A87\u0100;q\u26CE\u26BBim;\u62E6\u0400abnoptwz\u26E9\u26F4\u26F7\u271A\u272F\u2741\u2747\u2750\u0100nr\u26EE\u26F1g;\u67ECr;\u61FDr\xEB\u08C1g\u0180lmr\u26FF\u270D\u2714eft\u0100ar\u09E6\u2707ight\xE1\u09F2apsto;\u67FCight\xE1\u09FDparrow\u0100lr\u2725\u2729ef\xF4\u24EDight;\u61AC\u0180afl\u2736\u2739\u273Dr;\u6985;\uC000\u{1D55D}us;\u6A2Dimes;\u6A34\u0161\u274B\u274Fst;\u6217\xE1\u134E\u0180;ef\u2757\u2758\u1800\u65CAnge\xBB\u2758ar\u0100;l\u2764\u2765\u4028t;\u6993\u0280achmt\u2773\u2776\u277C\u2785\u2787r\xF2\u08A8orne\xF2\u1D8Car\u0100;d\u0F98\u2783;\u696D;\u600Eri;\u62BF\u0300achiqt\u2798\u279D\u0A40\u27A2\u27AE\u27BBquo;\u6039r;\uC000\u{1D4C1}m\u0180;eg\u09B2\u27AA\u27AC;\u6A8D;\u6A8F\u0100bu\u252A\u27B3o\u0100;r\u0E1F\u27B9;\u601Arok;\u4142\u8400<;cdhilqr\u082B\u27D2\u2639\u27DC\u27E0\u27E5\u27EA\u27F0\u0100ci\u27D7\u27D9;\u6AA6r;\u6A79re\xE5\u25F2mes;\u62C9arr;\u6976uest;\u6A7B\u0100Pi\u27F5\u27F9ar;\u6996\u0180;ef\u2800\u092D\u181B\u65C3r\u0100du\u2807\u280Dshar;\u694Ahar;\u6966\u0100en\u2817\u2821rtneqq;\uC000\u2268\uFE00\xC5\u281E\u0700Dacdefhilnopsu\u2840\u2845\u2882\u288E\u2893\u28A0\u28A5\u28A8\u28DA\u28E2\u28E4\u0A83\u28F3\u2902Dot;\u623A\u0200clpr\u284E\u2852\u2863\u287Dr\u803B\xAF\u40AF\u0100et\u2857\u2859;\u6642\u0100;e\u285E\u285F\u6720se\xBB\u285F\u0100;s\u103B\u2868to\u0200;dlu\u103B\u2873\u2877\u287Bow\xEE\u048Cef\xF4\u090F\xF0\u13D1ker;\u65AE\u0100oy\u2887\u288Cmma;\u6A29;\u443Cash;\u6014asuredangle\xBB\u1626r;\uC000\u{1D52A}o;\u6127\u0180cdn\u28AF\u28B4\u28C9ro\u803B\xB5\u40B5\u0200;acd\u1464\u28BD\u28C0\u28C4s\xF4\u16A7ir;\u6AF0ot\u80BB\xB7\u01B5us\u0180;bd\u28D2\u1903\u28D3\u6212\u0100;u\u1D3C\u28D8;\u6A2A\u0163\u28DE\u28E1p;\u6ADB\xF2\u2212\xF0\u0A81\u0100dp\u28E9\u28EEels;\u62A7f;\uC000\u{1D55E}\u0100ct\u28F8\u28FDr;\uC000\u{1D4C2}pos\xBB\u159D\u0180;lm\u2909\u290A\u290D\u43BCtimap;\u62B8\u0C00GLRVabcdefghijlmoprstuvw\u2942\u2953\u297E\u2989\u2998\u29DA\u29E9\u2A15\u2A1A\u2A58\u2A5D\u2A83\u2A95\u2AA4\u2AA8\u2B04\u2B07\u2B44\u2B7F\u2BAE\u2C34\u2C67\u2C7C\u2CE9\u0100gt\u2947\u294B;\uC000\u22D9\u0338\u0100;v\u2950\u0BCF\uC000\u226B\u20D2\u0180elt\u295A\u2972\u2976ft\u0100ar\u2961\u2967rrow;\u61CDightarrow;\u61CE;\uC000\u22D8\u0338\u0100;v\u297B\u0C47\uC000\u226A\u20D2ightarrow;\u61CF\u0100Dd\u298E\u2993ash;\u62AFash;\u62AE\u0280bcnpt\u29A3\u29A7\u29AC\u29B1\u29CCla\xBB\u02DEute;\u4144g;\uC000\u2220\u20D2\u0280;Eiop\u0D84\u29BC\u29C0\u29C5\u29C8;\uC000\u2A70\u0338d;\uC000\u224B\u0338s;\u4149ro\xF8\u0D84ur\u0100;a\u29D3\u29D4\u666El\u0100;s\u29D3\u0B38\u01F3\u29DF\\0\u29E3p\u80BB\xA0\u0B37mp\u0100;e\u0BF9\u0C00\u0280aeouy\u29F4\u29FE\u2A03\u2A10\u2A13\u01F0\u29F9\\0\u29FB;\u6A43on;\u4148dil;\u4146ng\u0100;d\u0D7E\u2A0Aot;\uC000\u2A6D\u0338p;\u6A42;\u443Dash;\u6013\u0380;Aadqsx\u0B92\u2A29\u2A2D\u2A3B\u2A41\u2A45\u2A50rr;\u61D7r\u0100hr\u2A33\u2A36k;\u6924\u0100;o\u13F2\u13F0ot;\uC000\u2250\u0338ui\xF6\u0B63\u0100ei\u2A4A\u2A4Ear;\u6928\xED\u0B98ist\u0100;s\u0BA0\u0B9Fr;\uC000\u{1D52B}\u0200Eest\u0BC5\u2A66\u2A79\u2A7C\u0180;qs\u0BBC\u2A6D\u0BE1\u0180;qs\u0BBC\u0BC5\u2A74lan\xF4\u0BE2i\xED\u0BEA\u0100;r\u0BB6\u2A81\xBB\u0BB7\u0180Aap\u2A8A\u2A8D\u2A91r\xF2\u2971rr;\u61AEar;\u6AF2\u0180;sv\u0F8D\u2A9C\u0F8C\u0100;d\u2AA1\u2AA2\u62FC;\u62FAcy;\u445A\u0380AEadest\u2AB7\u2ABA\u2ABE\u2AC2\u2AC5\u2AF6\u2AF9r\xF2\u2966;\uC000\u2266\u0338rr;\u619Ar;\u6025\u0200;fqs\u0C3B\u2ACE\u2AE3\u2AEFt\u0100ar\u2AD4\u2AD9rro\xF7\u2AC1ightarro\xF7\u2A90\u0180;qs\u0C3B\u2ABA\u2AEAlan\xF4\u0C55\u0100;s\u0C55\u2AF4\xBB\u0C36i\xED\u0C5D\u0100;r\u0C35\u2AFEi\u0100;e\u0C1A\u0C25i\xE4\u0D90\u0100pt\u2B0C\u2B11f;\uC000\u{1D55F}\u8180\xAC;in\u2B19\u2B1A\u2B36\u40ACn\u0200;Edv\u0B89\u2B24\u2B28\u2B2E;\uC000\u22F9\u0338ot;\uC000\u22F5\u0338\u01E1\u0B89\u2B33\u2B35;\u62F7;\u62F6i\u0100;v\u0CB8\u2B3C\u01E1\u0CB8\u2B41\u2B43;\u62FE;\u62FD\u0180aor\u2B4B\u2B63\u2B69r\u0200;ast\u0B7B\u2B55\u2B5A\u2B5Flle\xEC\u0B7Bl;\uC000\u2AFD\u20E5;\uC000\u2202\u0338lint;\u6A14\u0180;ce\u0C92\u2B70\u2B73u\xE5\u0CA5\u0100;c\u0C98\u2B78\u0100;e\u0C92\u2B7D\xF1\u0C98\u0200Aait\u2B88\u2B8B\u2B9D\u2BA7r\xF2\u2988rr\u0180;cw\u2B94\u2B95\u2B99\u619B;\uC000\u2933\u0338;\uC000\u219D\u0338ghtarrow\xBB\u2B95ri\u0100;e\u0CCB\u0CD6\u0380chimpqu\u2BBD\u2BCD\u2BD9\u2B04\u0B78\u2BE4\u2BEF\u0200;cer\u0D32\u2BC6\u0D37\u2BC9u\xE5\u0D45;\uC000\u{1D4C3}ort\u026D\u2B05\\0\\0\u2BD6ar\xE1\u2B56m\u0100;e\u0D6E\u2BDF\u0100;q\u0D74\u0D73su\u0100bp\u2BEB\u2BED\xE5\u0CF8\xE5\u0D0B\u0180bcp\u2BF6\u2C11\u2C19\u0200;Ees\u2BFF\u2C00\u0D22\u2C04\u6284;\uC000\u2AC5\u0338et\u0100;e\u0D1B\u2C0Bq\u0100;q\u0D23\u2C00c\u0100;e\u0D32\u2C17\xF1\u0D38\u0200;Ees\u2C22\u2C23\u0D5F\u2C27\u6285;\uC000\u2AC6\u0338et\u0100;e\u0D58\u2C2Eq\u0100;q\u0D60\u2C23\u0200gilr\u2C3D\u2C3F\u2C45\u2C47\xEC\u0BD7lde\u803B\xF1\u40F1\xE7\u0C43iangle\u0100lr\u2C52\u2C5Ceft\u0100;e\u0C1A\u2C5A\xF1\u0C26ight\u0100;e\u0CCB\u2C65\xF1\u0CD7\u0100;m\u2C6C\u2C6D\u43BD\u0180;es\u2C74\u2C75\u2C79\u4023ro;\u6116p;\u6007\u0480DHadgilrs\u2C8F\u2C94\u2C99\u2C9E\u2CA3\u2CB0\u2CB6\u2CD3\u2CE3ash;\u62ADarr;\u6904p;\uC000\u224D\u20D2ash;\u62AC\u0100et\u2CA8\u2CAC;\uC000\u2265\u20D2;\uC000>\u20D2nfin;\u69DE\u0180Aet\u2CBD\u2CC1\u2CC5rr;\u6902;\uC000\u2264\u20D2\u0100;r\u2CCA\u2CCD\uC000<\u20D2ie;\uC000\u22B4\u20D2\u0100At\u2CD8\u2CDCrr;\u6903rie;\uC000\u22B5\u20D2im;\uC000\u223C\u20D2\u0180Aan\u2CF0\u2CF4\u2D02rr;\u61D6r\u0100hr\u2CFA\u2CFDk;\u6923\u0100;o\u13E7\u13E5ear;\u6927\u1253\u1A95\\0\\0\\0\\0\\0\\0\\0\\0\\0\\0\\0\\0\\0\u2D2D\\0\u2D38\u2D48\u2D60\u2D65\u2D72\u2D84\u1B07\\0\\0\u2D8D\u2DAB\\0\u2DC8\u2DCE\\0\u2DDC\u2E19\u2E2B\u2E3E\u2E43\u0100cs\u2D31\u1A97ute\u803B\xF3\u40F3\u0100iy\u2D3C\u2D45r\u0100;c\u1A9E\u2D42\u803B\xF4\u40F4;\u443E\u0280abios\u1AA0\u2D52\u2D57\u01C8\u2D5Alac;\u4151v;\u6A38old;\u69BClig;\u4153\u0100cr\u2D69\u2D6Dir;\u69BF;\uC000\u{1D52C}\u036F\u2D79\\0\\0\u2D7C\\0\u2D82n;\u42DBave\u803B\xF2\u40F2;\u69C1\u0100bm\u2D88\u0DF4ar;\u69B5\u0200acit\u2D95\u2D98\u2DA5\u2DA8r\xF2\u1A80\u0100ir\u2D9D\u2DA0r;\u69BEoss;\u69BBn\xE5\u0E52;\u69C0\u0180aei\u2DB1\u2DB5\u2DB9cr;\u414Dga;\u43C9\u0180cdn\u2DC0\u2DC5\u01CDron;\u43BF;\u69B6pf;\uC000\u{1D560}\u0180ael\u2DD4\u2DD7\u01D2r;\u69B7rp;\u69B9\u0380;adiosv\u2DEA\u2DEB\u2DEE\u2E08\u2E0D\u2E10\u2E16\u6228r\xF2\u1A86\u0200;efm\u2DF7\u2DF8\u2E02\u2E05\u6A5Dr\u0100;o\u2DFE\u2DFF\u6134f\xBB\u2DFF\u803B\xAA\u40AA\u803B\xBA\u40BAgof;\u62B6r;\u6A56lope;\u6A57;\u6A5B\u0180clo\u2E1F\u2E21\u2E27\xF2\u2E01ash\u803B\xF8\u40F8l;\u6298i\u016C\u2E2F\u2E34de\u803B\xF5\u40F5es\u0100;a\u01DB\u2E3As;\u6A36ml\u803B\xF6\u40F6bar;\u633D\u0AE1\u2E5E\\0\u2E7D\\0\u2E80\u2E9D\\0\u2EA2\u2EB9\\0\\0\u2ECB\u0E9C\\0\u2F13\\0\\0\u2F2B\u2FBC\\0\u2FC8r\u0200;ast\u0403\u2E67\u2E72\u0E85\u8100\xB6;l\u2E6D\u2E6E\u40B6le\xEC\u0403\u0269\u2E78\\0\\0\u2E7Bm;\u6AF3;\u6AFDy;\u443Fr\u0280cimpt\u2E8B\u2E8F\u2E93\u1865\u2E97nt;\u4025od;\u402Eil;\u6030enk;\u6031r;\uC000\u{1D52D}\u0180imo\u2EA8\u2EB0\u2EB4\u0100;v\u2EAD\u2EAE\u43C6;\u43D5ma\xF4\u0A76ne;\u660E\u0180;tv\u2EBF\u2EC0\u2EC8\u43C0chfork\xBB\u1FFD;\u43D6\u0100au\u2ECF\u2EDFn\u0100ck\u2ED5\u2EDDk\u0100;h\u21F4\u2EDB;\u610E\xF6\u21F4s\u0480;abcdemst\u2EF3\u2EF4\u1908\u2EF9\u2EFD\u2F04\u2F06\u2F0A\u2F0E\u402Bcir;\u6A23ir;\u6A22\u0100ou\u1D40\u2F02;\u6A25;\u6A72n\u80BB\xB1\u0E9Dim;\u6A26wo;\u6A27\u0180ipu\u2F19\u2F20\u2F25ntint;\u6A15f;\uC000\u{1D561}nd\u803B\xA3\u40A3\u0500;Eaceinosu\u0EC8\u2F3F\u2F41\u2F44\u2F47\u2F81\u2F89\u2F92\u2F7E\u2FB6;\u6AB3p;\u6AB7u\xE5\u0ED9\u0100;c\u0ECE\u2F4C\u0300;acens\u0EC8\u2F59\u2F5F\u2F66\u2F68\u2F7Eppro\xF8\u2F43urlye\xF1\u0ED9\xF1\u0ECE\u0180aes\u2F6F\u2F76\u2F7Approx;\u6AB9qq;\u6AB5im;\u62E8i\xED\u0EDFme\u0100;s\u2F88\u0EAE\u6032\u0180Eas\u2F78\u2F90\u2F7A\xF0\u2F75\u0180dfp\u0EEC\u2F99\u2FAF\u0180als\u2FA0\u2FA5\u2FAAlar;\u632Eine;\u6312urf;\u6313\u0100;t\u0EFB\u2FB4\xEF\u0EFBrel;\u62B0\u0100ci\u2FC0\u2FC5r;\uC000\u{1D4C5};\u43C8ncsp;\u6008\u0300fiopsu\u2FDA\u22E2\u2FDF\u2FE5\u2FEB\u2FF1r;\uC000\u{1D52E}pf;\uC000\u{1D562}rime;\u6057cr;\uC000\u{1D4C6}\u0180aeo\u2FF8\u3009\u3013t\u0100ei\u2FFE\u3005rnion\xF3\u06B0nt;\u6A16st\u0100;e\u3010\u3011\u403F\xF1\u1F19\xF4\u0F14\u0A80ABHabcdefhilmnoprstux\u3040\u3051\u3055\u3059\u30E0\u310E\u312B\u3147\u3162\u3172\u318E\u3206\u3215\u3224\u3229\u3258\u326E\u3272\u3290\u32B0\u32B7\u0180art\u3047\u304A\u304Cr\xF2\u10B3\xF2\u03DDail;\u691Car\xF2\u1C65ar;\u6964\u0380cdenqrt\u3068\u3075\u3078\u307F\u308F\u3094\u30CC\u0100eu\u306D\u3071;\uC000\u223D\u0331te;\u4155i\xE3\u116Emptyv;\u69B3g\u0200;del\u0FD1\u3089\u308B\u308D;\u6992;\u69A5\xE5\u0FD1uo\u803B\xBB\u40BBr\u0580;abcfhlpstw\u0FDC\u30AC\u30AF\u30B7\u30B9\u30BC\u30BE\u30C0\u30C3\u30C7\u30CAp;\u6975\u0100;f\u0FE0\u30B4s;\u6920;\u6933s;\u691E\xEB\u225D\xF0\u272El;\u6945im;\u6974l;\u61A3;\u619D\u0100ai\u30D1\u30D5il;\u691Ao\u0100;n\u30DB\u30DC\u6236al\xF3\u0F1E\u0180abr\u30E7\u30EA\u30EEr\xF2\u17E5rk;\u6773\u0100ak\u30F3\u30FDc\u0100ek\u30F9\u30FB;\u407D;\u405D\u0100es\u3102\u3104;\u698Cl\u0100du\u310A\u310C;\u698E;\u6990\u0200aeuy\u3117\u311C\u3127\u3129ron;\u4159\u0100di\u3121\u3125il;\u4157\xEC\u0FF2\xE2\u30FA;\u4440\u0200clqs\u3134\u3137\u313D\u3144a;\u6937dhar;\u6969uo\u0100;r\u020E\u020Dh;\u61B3\u0180acg\u314E\u315F\u0F44l\u0200;ips\u0F78\u3158\u315B\u109Cn\xE5\u10BBar\xF4\u0FA9t;\u65AD\u0180ilr\u3169\u1023\u316Esht;\u697D;\uC000\u{1D52F}\u0100ao\u3177\u3186r\u0100du\u317D\u317F\xBB\u047B\u0100;l\u1091\u3184;\u696C\u0100;v\u318B\u318C\u43C1;\u43F1\u0180gns\u3195\u31F9\u31FCht\u0300ahlrst\u31A4\u31B0\u31C2\u31D8\u31E4\u31EErrow\u0100;t\u0FDC\u31ADa\xE9\u30C8arpoon\u0100du\u31BB\u31BFow\xEE\u317Ep\xBB\u1092eft\u0100ah\u31CA\u31D0rrow\xF3\u0FEAarpoon\xF3\u0551ightarrows;\u61C9quigarro\xF7\u30CBhreetimes;\u62CCg;\u42DAingdotse\xF1\u1F32\u0180ahm\u320D\u3210\u3213r\xF2\u0FEAa\xF2\u0551;\u600Foust\u0100;a\u321E\u321F\u63B1che\xBB\u321Fmid;\u6AEE\u0200abpt\u3232\u323D\u3240\u3252\u0100nr\u3237\u323Ag;\u67EDr;\u61FEr\xEB\u1003\u0180afl\u3247\u324A\u324Er;\u6986;\uC000\u{1D563}us;\u6A2Eimes;\u6A35\u0100ap\u325D\u3267r\u0100;g\u3263\u3264\u4029t;\u6994olint;\u6A12ar\xF2\u31E3\u0200achq\u327B\u3280\u10BC\u3285quo;\u603Ar;\uC000\u{1D4C7}\u0100bu\u30FB\u328Ao\u0100;r\u0214\u0213\u0180hir\u3297\u329B\u32A0re\xE5\u31F8mes;\u62CAi\u0200;efl\u32AA\u1059\u1821\u32AB\u65B9tri;\u69CEluhar;\u6968;\u611E\u0D61\u32D5\u32DB\u32DF\u332C\u3338\u3371\\0\u337A\u33A4\\0\\0\u33EC\u33F0\\0\u3428\u3448\u345A\u34AD\u34B1\u34CA\u34F1\\0\u3616\\0\\0\u3633cute;\u415Bqu\xEF\u27BA\u0500;Eaceinpsy\u11ED\u32F3\u32F5\u32FF\u3302\u330B\u330F\u331F\u3326\u3329;\u6AB4\u01F0\u32FA\\0\u32FC;\u6AB8on;\u4161u\xE5\u11FE\u0100;d\u11F3\u3307il;\u415Frc;\u415D\u0180Eas\u3316\u3318\u331B;\u6AB6p;\u6ABAim;\u62E9olint;\u6A13i\xED\u1204;\u4441ot\u0180;be\u3334\u1D47\u3335\u62C5;\u6A66\u0380Aacmstx\u3346\u334A\u3357\u335B\u335E\u3363\u336Drr;\u61D8r\u0100hr\u3350\u3352\xEB\u2228\u0100;o\u0A36\u0A34t\u803B\xA7\u40A7i;\u403Bwar;\u6929m\u0100in\u3369\xF0nu\xF3\xF1t;\u6736r\u0100;o\u3376\u2055\uC000\u{1D530}\u0200acoy\u3382\u3386\u3391\u33A0rp;\u666F\u0100hy\u338B\u338Fcy;\u4449;\u4448rt\u026D\u3399\\0\\0\u339Ci\xE4\u1464ara\xEC\u2E6F\u803B\xAD\u40AD\u0100gm\u33A8\u33B4ma\u0180;fv\u33B1\u33B2\u33B2\u43C3;\u43C2\u0400;deglnpr\u12AB\u33C5\u33C9\u33CE\u33D6\u33DE\u33E1\u33E6ot;\u6A6A\u0100;q\u12B1\u12B0\u0100;E\u33D3\u33D4\u6A9E;\u6AA0\u0100;E\u33DB\u33DC\u6A9D;\u6A9Fe;\u6246lus;\u6A24arr;\u6972ar\xF2\u113D\u0200aeit\u33F8\u3408\u340F\u3417\u0100ls\u33FD\u3404lsetm\xE9\u336Ahp;\u6A33parsl;\u69E4\u0100dl\u1463\u3414e;\u6323\u0100;e\u341C\u341D\u6AAA\u0100;s\u3422\u3423\u6AAC;\uC000\u2AAC\uFE00\u0180flp\u342E\u3433\u3442tcy;\u444C\u0100;b\u3438\u3439\u402F\u0100;a\u343E\u343F\u69C4r;\u633Ff;\uC000\u{1D564}a\u0100dr\u344D\u0402es\u0100;u\u3454\u3455\u6660it\xBB\u3455\u0180csu\u3460\u3479\u349F\u0100au\u3465\u346Fp\u0100;s\u1188\u346B;\uC000\u2293\uFE00p\u0100;s\u11B4\u3475;\uC000\u2294\uFE00u\u0100bp\u347F\u348F\u0180;es\u1197\u119C\u3486et\u0100;e\u1197\u348D\xF1\u119D\u0180;es\u11A8\u11AD\u3496et\u0100;e\u11A8\u349D\xF1\u11AE\u0180;af\u117B\u34A6\u05B0r\u0165\u34AB\u05B1\xBB\u117Car\xF2\u1148\u0200cemt\u34B9\u34BE\u34C2\u34C5r;\uC000\u{1D4C8}tm\xEE\xF1i\xEC\u3415ar\xE6\u11BE\u0100ar\u34CE\u34D5r\u0100;f\u34D4\u17BF\u6606\u0100an\u34DA\u34EDight\u0100ep\u34E3\u34EApsilo\xEE\u1EE0h\xE9\u2EAFs\xBB\u2852\u0280bcmnp\u34FB\u355E\u1209\u358B\u358E\u0480;Edemnprs\u350E\u350F\u3511\u3515\u351E\u3523\u352C\u3531\u3536\u6282;\u6AC5ot;\u6ABD\u0100;d\u11DA\u351Aot;\u6AC3ult;\u6AC1\u0100Ee\u3528\u352A;\u6ACB;\u628Alus;\u6ABFarr;\u6979\u0180eiu\u353D\u3552\u3555t\u0180;en\u350E\u3545\u354Bq\u0100;q\u11DA\u350Feq\u0100;q\u352B\u3528m;\u6AC7\u0100bp\u355A\u355C;\u6AD5;\u6AD3c\u0300;acens\u11ED\u356C\u3572\u3579\u357B\u3326ppro\xF8\u32FAurlye\xF1\u11FE\xF1\u11F3\u0180aes\u3582\u3588\u331Bppro\xF8\u331Aq\xF1\u3317g;\u666A\u0680123;Edehlmnps\u35A9\u35AC\u35AF\u121C\u35B2\u35B4\u35C0\u35C9\u35D5\u35DA\u35DF\u35E8\u35ED\u803B\xB9\u40B9\u803B\xB2\u40B2\u803B\xB3\u40B3;\u6AC6\u0100os\u35B9\u35BCt;\u6ABEub;\u6AD8\u0100;d\u1222\u35C5ot;\u6AC4s\u0100ou\u35CF\u35D2l;\u67C9b;\u6AD7arr;\u697Bult;\u6AC2\u0100Ee\u35E4\u35E6;\u6ACC;\u628Blus;\u6AC0\u0180eiu\u35F4\u3609\u360Ct\u0180;en\u121C\u35FC\u3602q\u0100;q\u1222\u35B2eq\u0100;q\u35E7\u35E4m;\u6AC8\u0100bp\u3611\u3613;\u6AD4;\u6AD6\u0180Aan\u361C\u3620\u362Drr;\u61D9r\u0100hr\u3626\u3628\xEB\u222E\u0100;o\u0A2B\u0A29war;\u692Alig\u803B\xDF\u40DF\u0BE1\u3651\u365D\u3660\u12CE\u3673\u3679\\0\u367E\u36C2\\0\\0\\0\\0\\0\u36DB\u3703\\0\u3709\u376C\\0\\0\\0\u3787\u0272\u3656\\0\\0\u365Bget;\u6316;\u43C4r\xEB\u0E5F\u0180aey\u3666\u366B\u3670ron;\u4165dil;\u4163;\u4442lrec;\u6315r;\uC000\u{1D531}\u0200eiko\u3686\u369D\u36B5\u36BC\u01F2\u368B\\0\u3691e\u01004f\u1284\u1281a\u0180;sv\u3698\u3699\u369B\u43B8ym;\u43D1\u0100cn\u36A2\u36B2k\u0100as\u36A8\u36AEppro\xF8\u12C1im\xBB\u12ACs\xF0\u129E\u0100as\u36BA\u36AE\xF0\u12C1rn\u803B\xFE\u40FE\u01EC\u031F\u36C6\u22E7es\u8180\xD7;bd\u36CF\u36D0\u36D8\u40D7\u0100;a\u190F\u36D5r;\u6A31;\u6A30\u0180eps\u36E1\u36E3\u3700\xE1\u2A4D\u0200;bcf\u0486\u36EC\u36F0\u36F4ot;\u6336ir;\u6AF1\u0100;o\u36F9\u36FC\uC000\u{1D565}rk;\u6ADA\xE1\u3362rime;\u6034\u0180aip\u370F\u3712\u3764d\xE5\u1248\u0380adempst\u3721\u374D\u3740\u3751\u3757\u375C\u375Fngle\u0280;dlqr\u3730\u3731\u3736\u3740\u3742\u65B5own\xBB\u1DBBeft\u0100;e\u2800\u373E\xF1\u092E;\u625Cight\u0100;e\u32AA\u374B\xF1\u105Aot;\u65ECinus;\u6A3Alus;\u6A39b;\u69CDime;\u6A3Bezium;\u63E2\u0180cht\u3772\u377D\u3781\u0100ry\u3777\u377B;\uC000\u{1D4C9};\u4446cy;\u445Brok;\u4167\u0100io\u378B\u378Ex\xF4\u1777head\u0100lr\u3797\u37A0eftarro\xF7\u084Fightarrow\xBB\u0F5D\u0900AHabcdfghlmoprstuw\u37D0\u37D3\u37D7\u37E4\u37F0\u37FC\u380E\u381C\u3823\u3834\u3851\u385D\u386B\u38A9\u38CC\u38D2\u38EA\u38F6r\xF2\u03EDar;\u6963\u0100cr\u37DC\u37E2ute\u803B\xFA\u40FA\xF2\u1150r\u01E3\u37EA\\0\u37EDy;\u445Eve;\u416D\u0100iy\u37F5\u37FArc\u803B\xFB\u40FB;\u4443\u0180abh\u3803\u3806\u380Br\xF2\u13ADlac;\u4171a\xF2\u13C3\u0100ir\u3813\u3818sht;\u697E;\uC000\u{1D532}rave\u803B\xF9\u40F9\u0161\u3827\u3831r\u0100lr\u382C\u382E\xBB\u0957\xBB\u1083lk;\u6580\u0100ct\u3839\u384D\u026F\u383F\\0\\0\u384Arn\u0100;e\u3845\u3846\u631Cr\xBB\u3846op;\u630Fri;\u65F8\u0100al\u3856\u385Acr;\u416B\u80BB\xA8\u0349\u0100gp\u3862\u3866on;\u4173f;\uC000\u{1D566}\u0300adhlsu\u114B\u3878\u387D\u1372\u3891\u38A0own\xE1\u13B3arpoon\u0100lr\u3888\u388Cef\xF4\u382Digh\xF4\u382Fi\u0180;hl\u3899\u389A\u389C\u43C5\xBB\u13FAon\xBB\u389Aparrows;\u61C8\u0180cit\u38B0\u38C4\u38C8\u026F\u38B6\\0\\0\u38C1rn\u0100;e\u38BC\u38BD\u631Dr\xBB\u38BDop;\u630Eng;\u416Fri;\u65F9cr;\uC000\u{1D4CA}\u0180dir\u38D9\u38DD\u38E2ot;\u62F0lde;\u4169i\u0100;f\u3730\u38E8\xBB\u1813\u0100am\u38EF\u38F2r\xF2\u38A8l\u803B\xFC\u40FCangle;\u69A7\u0780ABDacdeflnoprsz\u391C\u391F\u3929\u392D\u39B5\u39B8\u39BD\u39DF\u39E4\u39E8\u39F3\u39F9\u39FD\u3A01\u3A20r\xF2\u03F7ar\u0100;v\u3926\u3927\u6AE8;\u6AE9as\xE8\u03E1\u0100nr\u3932\u3937grt;\u699C\u0380eknprst\u34E3\u3946\u394B\u3952\u395D\u3964\u3996app\xE1\u2415othin\xE7\u1E96\u0180hir\u34EB\u2EC8\u3959op\xF4\u2FB5\u0100;h\u13B7\u3962\xEF\u318D\u0100iu\u3969\u396Dgm\xE1\u33B3\u0100bp\u3972\u3984setneq\u0100;q\u397D\u3980\uC000\u228A\uFE00;\uC000\u2ACB\uFE00setneq\u0100;q\u398F\u3992\uC000\u228B\uFE00;\uC000\u2ACC\uFE00\u0100hr\u399B\u399Fet\xE1\u369Ciangle\u0100lr\u39AA\u39AFeft\xBB\u0925ight\xBB\u1051y;\u4432ash\xBB\u1036\u0180elr\u39C4\u39D2\u39D7\u0180;be\u2DEA\u39CB\u39CFar;\u62BBq;\u625Alip;\u62EE\u0100bt\u39DC\u1468a\xF2\u1469r;\uC000\u{1D533}tr\xE9\u39AEsu\u0100bp\u39EF\u39F1\xBB\u0D1C\xBB\u0D59pf;\uC000\u{1D567}ro\xF0\u0EFBtr\xE9\u39B4\u0100cu\u3A06\u3A0Br;\uC000\u{1D4CB}\u0100bp\u3A10\u3A18n\u0100Ee\u3980\u3A16\xBB\u397En\u0100Ee\u3992\u3A1E\xBB\u3990igzag;\u699A\u0380cefoprs\u3A36\u3A3B\u3A56\u3A5B\u3A54\u3A61\u3A6Airc;\u4175\u0100di\u3A40\u3A51\u0100bg\u3A45\u3A49ar;\u6A5Fe\u0100;q\u15FA\u3A4F;\u6259erp;\u6118r;\uC000\u{1D534}pf;\uC000\u{1D568}\u0100;e\u1479\u3A66at\xE8\u1479cr;\uC000\u{1D4CC}\u0AE3\u178E\u3A87\\0\u3A8B\\0\u3A90\u3A9B\\0\\0\u3A9D\u3AA8\u3AAB\u3AAF\\0\\0\u3AC3\u3ACE\\0\u3AD8\u17DC\u17DFtr\xE9\u17D1r;\uC000\u{1D535}\u0100Aa\u3A94\u3A97r\xF2\u03C3r\xF2\u09F6;\u43BE\u0100Aa\u3AA1\u3AA4r\xF2\u03B8r\xF2\u09EBa\xF0\u2713is;\u62FB\u0180dpt\u17A4\u3AB5\u3ABE\u0100fl\u3ABA\u17A9;\uC000\u{1D569}im\xE5\u17B2\u0100Aa\u3AC7\u3ACAr\xF2\u03CEr\xF2\u0A01\u0100cq\u3AD2\u17B8r;\uC000\u{1D4CD}\u0100pt\u17D6\u3ADCr\xE9\u17D4\u0400acefiosu\u3AF0\u3AFD\u3B08\u3B0C\u3B11\u3B15\u3B1B\u3B21c\u0100uy\u3AF6\u3AFBte\u803B\xFD\u40FD;\u444F\u0100iy\u3B02\u3B06rc;\u4177;\u444Bn\u803B\xA5\u40A5r;\uC000\u{1D536}cy;\u4457pf;\uC000\u{1D56A}cr;\uC000\u{1D4CE}\u0100cm\u3B26\u3B29y;\u444El\u803B\xFF\u40FF\u0500acdefhiosw\u3B42\u3B48\u3B54\u3B58\u3B64\u3B69\u3B6D\u3B74\u3B7A\u3B80cute;\u417A\u0100ay\u3B4D\u3B52ron;\u417E;\u4437ot;\u417C\u0100et\u3B5D\u3B61tr\xE6\u155Fa;\u43B6r;\uC000\u{1D537}cy;\u4436grarr;\u61DDpf;\uC000\u{1D56B}cr;\uC000\u{1D4CF}\u0100jn\u3B85\u3B87;\u600Dj;\u600C\'.split("").map(e=>e.charCodeAt(0))),_n=new Uint16Array("\u0200aglq	\\x1B\u026D\\0\\0p;\u4026os;\u4027t;\u403Et;\u403Cuot;\u4022".split("").map(e=>e.charCodeAt(0)));var Je;const Cn=new Map([[0,65533],[128,8364],[130,8218],[131,402],[132,8222],[133,8230],[134,8224],[135,8225],[136,710],[137,8240],[138,352],[139,8249],[140,338],[142,381],[145,8216],[146,8217],[147,8220],[148,8221],[149,8226],[150,8211],[151,8212],[152,732],[153,8482],[154,353],[155,8250],[156,339],[158,382],[159,376]]),En=(Je=String.fromCodePoint)!==null&&Je!==void 0?Je:function(e){let u="";return e>65535&&(e-=65536,u+=String.fromCharCode(e>>>10&1023|55296),e=56320|e&1023),u+=String.fromCharCode(e),u};function Dn(e){var u;return e>=55296&&e<=57343||e>1114111?65533:(u=Cn.get(e))!==null&&u!==void 0?u:e}var P;(function(e){e[e.NUM=35]="NUM",e[e.SEMI=59]="SEMI",e[e.EQUALS=61]="EQUALS",e[e.ZERO=48]="ZERO",e[e.NINE=57]="NINE",e[e.LOWER_A=97]="LOWER_A",e[e.LOWER_F=102]="LOWER_F",e[e.LOWER_X=120]="LOWER_X",e[e.LOWER_Z=122]="LOWER_Z",e[e.UPPER_A=65]="UPPER_A",e[e.UPPER_F=70]="UPPER_F",e[e.UPPER_Z=90]="UPPER_Z"})(P||(P={}));const An=32;var R;(function(e){e[e.VALUE_LENGTH=49152]="VALUE_LENGTH",e[e.BRANCH_LENGTH=16256]="BRANCH_LENGTH",e[e.JUMP_TABLE=127]="JUMP_TABLE"})(R||(R={}));function Ke(e){return e>=P.ZERO&&e<=P.NINE}function Fn(e){return e>=P.UPPER_A&&e<=P.UPPER_F||e>=P.LOWER_A&&e<=P.LOWER_F}function Nn(e){return e>=P.UPPER_A&&e<=P.UPPER_Z||e>=P.LOWER_A&&e<=P.LOWER_Z||Ke(e)}function Sn(e){return e===P.EQUALS||Nn(e)}var B;(function(e){e[e.EntityStart=0]="EntityStart",e[e.NumericStart=1]="NumericStart",e[e.NumericDecimal=2]="NumericDecimal",e[e.NumericHex=3]="NumericHex",e[e.NamedEntity=4]="NamedEntity"})(B||(B={}));var Y;(function(e){e[e.Legacy=0]="Legacy",e[e.Strict=1]="Strict",e[e.Attribute=2]="Attribute"})(Y||(Y={}));class Tn{constructor(u,t,r){this.decodeTree=u,this.emitCodePoint=t,this.errors=r,this.state=B.EntityStart,this.consumed=1,this.result=0,this.treeIndex=0,this.excess=1,this.decodeMode=Y.Strict}startEntity(u){this.decodeMode=u,this.state=B.EntityStart,this.result=0,this.treeIndex=0,this.excess=1,this.consumed=1}write(u,t){switch(this.state){case B.EntityStart:return u.charCodeAt(t)===P.NUM?(this.state=B.NumericStart,this.consumed+=1,this.stateNumericStart(u,t+1)):(this.state=B.NamedEntity,this.stateNamedEntity(u,t));case B.NumericStart:return this.stateNumericStart(u,t);case B.NumericDecimal:return this.stateNumericDecimal(u,t);case B.NumericHex:return this.stateNumericHex(u,t);case B.NamedEntity:return this.stateNamedEntity(u,t)}}stateNumericStart(u,t){return t>=u.length?-1:(u.charCodeAt(t)|An)===P.LOWER_X?(this.state=B.NumericHex,this.consumed+=1,this.stateNumericHex(u,t+1)):(this.state=B.NumericDecimal,this.stateNumericDecimal(u,t))}addToNumericResult(u,t,r,n){if(t!==r){const o=r-t;this.result=this.result*Math.pow(n,o)+parseInt(u.substr(t,o),n),this.consumed+=o}}stateNumericHex(u,t){const r=t;for(;t<u.length;){const n=u.charCodeAt(t);if(Ke(n)||Fn(n))t+=1;else return this.addToNumericResult(u,r,t,16),this.emitNumericEntity(n,3)}return this.addToNumericResult(u,r,t,16),-1}stateNumericDecimal(u,t){const r=t;for(;t<u.length;){const n=u.charCodeAt(t);if(Ke(n))t+=1;else return this.addToNumericResult(u,r,t,10),this.emitNumericEntity(n,2)}return this.addToNumericResult(u,r,t,10),-1}emitNumericEntity(u,t){var r;if(this.consumed<=t)return(r=this.errors)===null||r===void 0||r.absenceOfDigitsInNumericCharacterReference(this.consumed),0;if(u===P.SEMI)this.consumed+=1;else if(this.decodeMode===Y.Strict)return 0;return this.emitCodePoint(Dn(this.result),this.consumed),this.errors&&(u!==P.SEMI&&this.errors.missingSemicolonAfterCharacterReference(),this.errors.validateNumericCharacterReference(this.result)),this.consumed}stateNamedEntity(u,t){const{decodeTree:r}=this;let n=r[this.treeIndex],o=(n&R.VALUE_LENGTH)>>14;for(;t<u.length;t++,this.excess++){const c=u.charCodeAt(t);if(this.treeIndex=In(r,n,this.treeIndex+Math.max(1,o),c),this.treeIndex<0)return this.result===0||this.decodeMode===Y.Attribute&&(o===0||Sn(c))?0:this.emitNotTerminatedNamedEntity();if(n=r[this.treeIndex],o=(n&R.VALUE_LENGTH)>>14,o!==0){if(c===P.SEMI)return this.emitNamedEntityData(this.treeIndex,o,this.consumed+this.excess);this.decodeMode!==Y.Strict&&(this.result=this.treeIndex,this.consumed+=this.excess,this.excess=0)}}return-1}emitNotTerminatedNamedEntity(){var u;const{result:t,decodeTree:r}=this,n=(r[t]&R.VALUE_LENGTH)>>14;return this.emitNamedEntityData(t,n,this.consumed),(u=this.errors)===null||u===void 0||u.missingSemicolonAfterCharacterReference(),this.consumed}emitNamedEntityData(u,t,r){const{decodeTree:n}=this;return this.emitCodePoint(t===1?n[u]&~R.VALUE_LENGTH:n[u+1],r),t===3&&this.emitCodePoint(n[u+2],r),r}end(){var u;switch(this.state){case B.NamedEntity:return this.result!==0&&(this.decodeMode!==Y.Attribute||this.result===this.treeIndex)?this.emitNotTerminatedNamedEntity():0;case B.NumericDecimal:return this.emitNumericEntity(0,2);case B.NumericHex:return this.emitNumericEntity(0,3);case B.NumericStart:return(u=this.errors)===null||u===void 0||u.absenceOfDigitsInNumericCharacterReference(this.consumed),0;case B.EntityStart:return 0}}}function Yu(e){let u="";const t=new Tn(e,r=>u+=En(r));return function(n,o){let c=0,s=0;for(;(s=n.indexOf("&",s))>=0;){u+=n.slice(c,s),t.startEntity(o);const i=t.write(n,s+1);if(i<0){c=s+t.end();break}c=s+i,s=i===0?c+1:c}const l=u+n.slice(c);return u="",l}}function In(e,u,t,r){const n=(u&R.BRANCH_LENGTH)>>7,o=u&R.JUMP_TABLE;if(n===0)return o!==0&&r===o?t:-1;if(o){const l=r-o;return l<0||l>=n?-1:e[t+l]-1}let c=t,s=c+n-1;for(;c<=s;){const l=c+s>>>1,i=e[l];if(i<r)c=l+1;else if(i>r)s=l-1;else return e[l+n]}return-1}const Ru=Yu(wn);Yu(_n);function Mn(e,u=Y.Legacy){return Ru(e,u)}function Ln(e){return Ru(e,Y.Strict)}function $n(e){return Object.prototype.toString.call(e)}function Qe(e){return $n(e)==="[object String]"}const Pn=Object.prototype.hasOwnProperty;function Bn(e,u){return Pn.call(e,u)}function Me(e){return Array.prototype.slice.call(arguments,1).forEach(function(t){if(t){if(typeof t!="object")throw new TypeError(t+"must be object");Object.keys(t).forEach(function(r){e[r]=t[r]})}}),e}function et(e,u,t){return[].concat(e.slice(0,u),t,e.slice(u+1))}function Ye(e){return!(e>=55296&&e<=57343||e>=64976&&e<=65007||(e&65535)===65535||(e&65535)===65534||e>=0&&e<=8||e===11||e>=14&&e<=31||e>=127&&e<=159||e>1114111)}function xe(e){if(e>65535){e-=65536;const u=55296+(e>>10),t=56320+(e&1023);return String.fromCharCode(u,t)}return String.fromCharCode(e)}const ut=/\\\\([!"#$%&\'()*+,\\-./:;<=>?@[\\\\\\]^_`{|}~])/g,On=/&([a-z#][a-z0-9]{1,31});/gi,zn=new RegExp(ut.source+"|"+On.source,"gi"),jn=/^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;function qn(e,u){if(u.charCodeAt(0)===35&&jn.test(u)){const r=u[1].toLowerCase()==="x"?parseInt(u.slice(2),16):parseInt(u.slice(1),10);return Ye(r)?xe(r):e}const t=Mn(e);return t!==e?t:e}function Hn(e){return e.indexOf("\\\\")<0?e:e.replace(ut,"$1")}function ce(e){return e.indexOf("\\\\")<0&&e.indexOf("&")<0?e:e.replace(zn,function(u,t,r){return t||qn(u,r)})}const Zn=/[&<>"]/,Vn=/[&<>"]/g,Un={"&":"&amp;","<":"&lt;",">":"&gt;",\'"\':"&quot;"};function Wn(e){return Un[e]}function ee(e){return Zn.test(e)?e.replace(Vn,Wn):e}const Gn=/[.?*+^$[\\]\\\\(){}|-]/g;function Xn(e){return e.replace(Gn,"\\\\$&")}function M(e){switch(e){case 9:case 32:return!0}return!1}function ge(e){if(e>=8192&&e<=8202)return!0;switch(e){case 9:case 10:case 11:case 12:case 13:case 32:case 160:case 5760:case 8239:case 8287:case 12288:return!0}return!1}function tt(e){return Xe.test(e)||Ku.test(e)}function me(e){return tt(xe(e))}function ye(e){switch(e){case 33:case 34:case 35:case 36:case 37:case 38:case 39:case 40:case 41:case 42:case 43:case 44:case 45:case 46:case 47:case 58:case 59:case 60:case 61:case 62:case 63:case 64:case 91:case 92:case 93:case 94:case 95:case 96:case 123:case 124:case 125:case 126:return!0;default:return!1}}function Le(e){return e=e.trim().replace(/\\s+/g," "),"\u1E9E".toLowerCase()==="\u1E7E"&&(e=e.replace(/\u1E9E/g,"\xDF")),e.toLowerCase().toUpperCase()}function rt(e){return e===32||e===9||e===10||e===13}function $e(e){let u=0;for(;u<e.length&&rt(e.charCodeAt(u));u++);let t=e.length-1;for(;t>=u&&rt(e.charCodeAt(t));t--);return e.slice(u,t+1)}const Jn=Object.freeze(Object.defineProperty({__proto__:null,arrayReplaceAt:et,asciiTrim:$e,assign:Me,escapeHtml:ee,escapeRE:Xn,fromCodePoint:xe,has:Bn,isMdAsciiPunct:ye,isPunctChar:tt,isPunctCharCode:me,isSpace:M,isString:Qe,isValidEntityCode:Ye,isWhiteSpace:ge,lib:{mdurl:yn,ucmicro:kn},normalizeReference:Le,unescapeAll:ce,unescapeMd:Hn},Symbol.toStringTag,{value:"Module"}));function Kn(e,u,t){let r,n,o,c;const s=e.posMax,l=e.pos;for(e.pos=u+1,r=1;e.pos<s;){if(o=e.src.charCodeAt(e.pos),o===93&&(r--,r===0)){n=!0;break}if(c=e.pos,e.md.inline.skipToken(e),o===91){if(c===e.pos-1)r++;else if(t)return e.pos=l,-1}}let i=-1;return n&&(i=e.pos),e.pos=l,i}function Qn(e,u,t){let r,n=u;const o={ok:!1,pos:0,str:""};if(e.charCodeAt(n)===60){for(n++;n<t;){if(r=e.charCodeAt(n),r===10||r===60)return o;if(r===62)return o.pos=n+1,o.str=ce(e.slice(u+1,n)),o.ok=!0,o;if(r===92&&n+1<t){n+=2;continue}n++}return o}let c=0;for(;n<t&&(r=e.charCodeAt(n),!(r===32||r<32||r===127));){if(r===92&&n+1<t){if(e.charCodeAt(n+1)===32)break;n+=2;continue}if(r===40&&(c++,c>32))return o;if(r===41){if(c===0)break;c--}n++}return u===n||c!==0||(o.str=ce(e.slice(u,n)),o.pos=n,o.ok=!0),o}function Yn(e,u,t,r){let n,o=u;const c={ok:!1,can_continue:!1,pos:0,str:"",marker:0};if(r)c.str=r.str,c.marker=r.marker;else{if(o>=t)return c;let s=e.charCodeAt(o);if(s!==34&&s!==39&&s!==40)return c;u++,o++,s===40&&(s=41),c.marker=s}for(;o<t;){if(n=e.charCodeAt(o),n===c.marker)return c.pos=o+1,c.str+=ce(e.slice(u,o)),c.ok=!0,c;if(n===40&&c.marker===41)return c;n===92&&o+1<t&&o++,o++}return c.can_continue=!0,c.str+=ce(e.slice(u,o)),c}const Rn=Object.freeze(Object.defineProperty({__proto__:null,parseLinkDestination:Qn,parseLinkLabel:Kn,parseLinkTitle:Yn},Symbol.toStringTag,{value:"Module"})),X={};X.code_inline=function(e,u,t,r,n){const o=e[u];return"<code"+n.renderAttrs(o)+">"+ee(o.content)+"</code>"},X.code_block=function(e,u,t,r,n){const o=e[u];return"<pre"+n.renderAttrs(o)+"><code>"+ee(e[u].content)+`</code></pre>\n`},X.fence=function(e,u,t,r,n){const o=e[u],c=o.info?ce(o.info).trim():"";let s="",l="";if(c){const d=c.split(/(\\s+)/g);s=d[0],l=d.slice(2).join("")}let i;if(t.highlight?i=t.highlight(o.content,s,l)||ee(o.content):i=ee(o.content),i.indexOf("<pre")===0)return i+`\n`;if(c){const d=o.attrIndex("class"),p=o.attrs?o.attrs.slice():[];d<0?p.push(["class",t.langPrefix+s]):(p[d]=p[d].slice(),p[d][1]+=" "+t.langPrefix+s);const b={attrs:p};return`<pre><code${n.renderAttrs(b)}>${i}</code></pre>\n`}return`<pre><code${n.renderAttrs(o)}>${i}</code></pre>\n`},X.image=function(e,u,t,r,n){const o=e[u];return o.attrs[o.attrIndex("alt")][1]=n.renderInlineAsText(o.children,t,r),n.renderToken(e,u,t)},X.hardbreak=function(e,u,t){return t.xhtmlOut?`<br />\n`:`<br>\n`},X.softbreak=function(e,u,t){return t.breaks?t.xhtmlOut?`<br />\n`:`<br>\n`:`\n`},X.text=function(e,u){return ee(e[u].content)},X.html_block=function(e,u){return e[u].content},X.html_inline=function(e,u){return e[u].content};function se(){this.rules=Me({},X)}se.prototype.renderAttrs=function(u){let t,r,n;if(!u.attrs)return"";for(n="",t=0,r=u.attrs.length;t<r;t++)n+=" "+ee(u.attrs[t][0])+\'="\'+ee(u.attrs[t][1])+\'"\';return n},se.prototype.renderToken=function(u,t,r){const n=u[t];let o="";if(n.hidden)return"";n.block&&n.nesting!==-1&&t&&u[t-1].hidden&&(o+=`\n`),o+=(n.nesting===-1?"</":"<")+n.tag,o+=this.renderAttrs(n),n.nesting===0&&r.xhtmlOut&&(o+=" /");let c=!1;if(n.block&&(c=!0,n.nesting===1&&t+1<u.length)){const s=u[t+1];(s.type==="inline"||s.hidden||s.nesting===-1&&s.tag===n.tag)&&(c=!1)}return o+=c?`>\n`:">",o},se.prototype.renderInline=function(e,u,t){let r="";const n=this.rules;for(let o=0,c=e.length;o<c;o++){const s=e[o].type;typeof n[s]<"u"?r+=n[s](e,o,u,t,this):r+=this.renderToken(e,o,u)}return r},se.prototype.renderInlineAsText=function(e,u,t){let r="";for(let n=0,o=e.length;n<o;n++)switch(e[n].type){case"text":r+=e[n].content;break;case"image":r+=this.renderInlineAsText(e[n].children,u,t);break;case"html_inline":case"html_block":r+=e[n].content;break;case"softbreak":case"hardbreak":r+=`\n`;break}return r},se.prototype.render=function(e,u,t){let r="";const n=this.rules;for(let o=0,c=e.length;o<c;o++){const s=e[o].type;s==="inline"?r+=this.renderInline(e[o].children,u,t):typeof n[s]<"u"?r+=n[s](e,o,u,t,this):r+=this.renderToken(e,o,u,t)}return r};function q(){this.__rules__=[],this.__cache__=null}q.prototype.__find__=function(e){for(let u=0;u<this.__rules__.length;u++)if(this.__rules__[u].name===e)return u;return-1},q.prototype.__compile__=function(){const e=this,u=[""];e.__rules__.forEach(function(t){t.enabled&&t.alt.forEach(function(r){u.indexOf(r)<0&&u.push(r)})}),e.__cache__={},u.forEach(function(t){e.__cache__[t]=[],e.__rules__.forEach(function(r){r.enabled&&(t&&r.alt.indexOf(t)<0||e.__cache__[t].push(r.fn))})})},q.prototype.at=function(e,u,t){const r=this.__find__(e),n=t||{};if(r===-1)throw new Error("Parser rule not found: "+e);this.__rules__[r].fn=u,this.__rules__[r].alt=n.alt||[],this.__cache__=null},q.prototype.before=function(e,u,t,r){const n=this.__find__(e),o=r||{};if(n===-1)throw new Error("Parser rule not found: "+e);this.__rules__.splice(n,0,{name:u,enabled:!0,fn:t,alt:o.alt||[]}),this.__cache__=null},q.prototype.after=function(e,u,t,r){const n=this.__find__(e),o=r||{};if(n===-1)throw new Error("Parser rule not found: "+e);this.__rules__.splice(n+1,0,{name:u,enabled:!0,fn:t,alt:o.alt||[]}),this.__cache__=null},q.prototype.push=function(e,u,t){const r=t||{};this.__rules__.push({name:e,enabled:!0,fn:u,alt:r.alt||[]}),this.__cache__=null},q.prototype.enable=function(e,u){Array.isArray(e)||(e=[e]);const t=[];return e.forEach(function(r){const n=this.__find__(r);if(n<0){if(u)return;throw new Error("Rules manager: invalid rule name "+r)}this.__rules__[n].enabled=!0,t.push(r)},this),this.__cache__=null,t},q.prototype.enableOnly=function(e,u){Array.isArray(e)||(e=[e]),this.__rules__.forEach(function(t){t.enabled=!1}),this.enable(e,u)},q.prototype.disable=function(e,u){Array.isArray(e)||(e=[e]);const t=[];return e.forEach(function(r){const n=this.__find__(r);if(n<0){if(u)return;throw new Error("Rules manager: invalid rule name "+r)}this.__rules__[n].enabled=!1,t.push(r)},this),this.__cache__=null,t},q.prototype.getRules=function(e){return this.__cache__===null&&this.__compile__(),this.__cache__[e]||[]};function U(e,u,t){this.type=e,this.tag=u,this.attrs=null,this.map=null,this.nesting=t,this.level=0,this.children=null,this.content="",this.markup="",this.info="",this.meta=null,this.block=!1,this.hidden=!1}U.prototype.attrIndex=function(u){if(!this.attrs)return-1;const t=this.attrs;for(let r=0,n=t.length;r<n;r++)if(t[r][0]===u)return r;return-1},U.prototype.attrPush=function(u){this.attrs?this.attrs.push(u):this.attrs=[u]},U.prototype.attrSet=function(u,t){const r=this.attrIndex(u),n=[u,t];r<0?this.attrPush(n):this.attrs[r]=n},U.prototype.attrGet=function(u){const t=this.attrIndex(u);let r=null;return t>=0&&(r=this.attrs[t][1]),r},U.prototype.attrJoin=function(u,t){const r=this.attrIndex(u);r<0?this.attrPush([u,t]):this.attrs[r][1]=this.attrs[r][1]+" "+t};function nt(e,u,t){this.src=e,this.env=t,this.tokens=[],this.inlineMode=!1,this.md=u}nt.prototype.Token=U;const e0=/\\r\\n?|\\n/g,u0=/\\0/g;function t0(e){let u;u=e.src.replace(e0,`\n`),u=u.replace(u0,"\uFFFD"),e.src=u}function r0(e){let u;e.inlineMode?(u=new e.Token("inline","",0),u.content=e.src,u.map=[0,1],u.children=[],e.tokens.push(u)):e.md.block.parse(e.src,e.md,e.env,e.tokens)}function n0(e){const u=e.tokens;for(let t=0,r=u.length;t<r;t++){const n=u[t];n.type==="inline"&&e.md.inline.parse(n.content,e.md,e.env,n.children)}}function o0(e){return/^<a[>\\s]/i.test(e)}function a0(e){return/^<\\/a\\s*>/i.test(e)}function c0(e){const u=e.tokens;if(e.md.options.linkify)for(let t=0,r=u.length;t<r;t++){if(u[t].type!=="inline"||!e.md.linkify.pretest(u[t].content))continue;let n=u[t].children,o=0;for(let c=n.length-1;c>=0;c--){const s=n[c];if(s.type==="link_close"){for(c--;n[c].level!==s.level&&n[c].type!=="link_open";)c--;continue}if(s.type==="html_inline"&&(o0(s.content)&&o>0&&o--,a0(s.content)&&o++),!(o>0)&&s.type==="text"&&e.md.linkify.test(s.content)){const l=s.content;let i=e.md.linkify.match(l);const d=[];let p=s.level,b=0;i.length>0&&i[0].index===0&&c>0&&n[c-1].type==="text_special"&&(i=i.slice(1));for(let h=0;h<i.length;h++){const f=i[h].url,v=e.md.normalizeLink(f);if(!e.md.validateLink(v))continue;let m=i[h].text;i[h].schema?i[h].schema==="mailto:"&&!/^mailto:/i.test(m)?m=e.md.normalizeLinkText("mailto:"+m).replace(/^mailto:/,""):m=e.md.normalizeLinkText(m):m=e.md.normalizeLinkText("http://"+m).replace(/^http:\\/\\//,"");const D=i[h].index;if(D>b){const y=new e.Token("text","",0);y.content=l.slice(b,D),y.level=p,d.push(y)}const w=new e.Token("link_open","a",1);w.attrs=[["href",v]],w.level=p++,w.markup="linkify",w.info="auto",d.push(w);const g=new e.Token("text","",0);g.content=m,g.level=p,d.push(g);const k=new e.Token("link_close","a",-1);k.level=--p,k.markup="linkify",k.info="auto",d.push(k),b=i[h].lastIndex}if(b<l.length){const h=new e.Token("text","",0);h.content=l.slice(b),h.level=p,d.push(h)}u[t].children=n=et(n,c,d)}}}}const ot=/\\+-|\\.\\.|\\?\\?\\?\\?|!!!!|,,|--/,s0=/\\((c|tm|r)\\)/i,l0=/\\((c|tm|r)\\)/ig,i0={c:"\xA9",r:"\xAE",tm:"\u2122"};function d0(e,u){return i0[u.toLowerCase()]}function f0(e){let u=0;for(let t=e.length-1;t>=0;t--){const r=e[t];r.type==="text"&&!u&&(r.content=r.content.replace(l0,d0)),r.type==="link_open"&&r.info==="auto"&&u--,r.type==="link_close"&&r.info==="auto"&&u++}}function p0(e){let u=0;for(let t=e.length-1;t>=0;t--){const r=e[t];r.type==="text"&&!u&&ot.test(r.content)&&(r.content=r.content.replace(/\\+-/g,"\xB1").replace(/\\.{2,}/g,"\u2026").replace(/([?!])\u2026/g,"$1..").replace(/([?!]){4,}/g,"$1$1$1").replace(/,{2,}/g,",").replace(/(^|[^-])---(?=[^-]|$)/mg,"$1\u2014").replace(/(^|\\s)--(?=\\s|$)/mg,"$1\u2013").replace(/(^|[^-\\s])--(?=[^-\\s]|$)/mg,"$1\u2013")),r.type==="link_open"&&r.info==="auto"&&u--,r.type==="link_close"&&r.info==="auto"&&u++}}function h0(e){let u;if(e.md.options.typographer)for(u=e.tokens.length-1;u>=0;u--)e.tokens[u].type==="inline"&&(s0.test(e.tokens[u].content)&&f0(e.tokens[u].children),ot.test(e.tokens[u].content)&&p0(e.tokens[u].children))}const b0=/[\'"]/,at=/[\'"]/g,ct="\u2019";function Pe(e,u,t,r){e[u]||(e[u]=[]),e[u].push({pos:t,ch:r})}function x0(e,u){let t="",r=0;u.sort((n,o)=>n.pos-o.pos);for(let n=0;n<u.length;n++){const o=u[n];t+=e.slice(r,o.pos)+o.ch,r=o.pos+1}return t+e.slice(r)}function g0(e,u){let t;const r=[],n={};for(let o=0;o<e.length;o++){const c=e[o],s=e[o].level;for(t=r.length-1;t>=0&&!(r[t].level<=s);t--);if(r.length=t+1,c.type!=="text")continue;const l=c.content;let i=0;const d=l.length;e:for(;i<d;){at.lastIndex=i;const p=at.exec(l);if(!p)break;let b=!0,h=!0;i=p.index+1;const f=p[0]==="\'";let v=32;if(p.index-1>=0)v=l.charCodeAt(p.index-1);else for(t=o-1;t>=0&&!(e[t].type==="softbreak"||e[t].type==="hardbreak");t--)if(e[t].content){v=e[t].content.charCodeAt(e[t].content.length-1);break}let m=32;if(i<d)m=l.charCodeAt(i);else for(t=o+1;t<e.length&&!(e[t].type==="softbreak"||e[t].type==="hardbreak");t++)if(e[t].content){m=e[t].content.charCodeAt(0);break}const D=ye(v)||me(v),w=ye(m)||me(m),g=ge(v),k=ge(m);if(k?b=!1:w&&(g||D||(b=!1)),g?h=!1:D&&(k||w||(h=!1)),m===34&&p[0]===\'"\'&&v>=48&&v<=57&&(h=b=!1),b&&h&&(b=D,h=w),!b&&!h){f&&Pe(n,o,p.index,ct);continue}if(h)for(t=r.length-1;t>=0;t--){let y=r[t];if(r[t].level<s)break;if(y.single===f&&r[t].level===s){y=r[t];let _,S;f?(_=u.md.options.quotes[2],S=u.md.options.quotes[3]):(_=u.md.options.quotes[0],S=u.md.options.quotes[1]),Pe(n,o,p.index,S),Pe(n,y.token,y.pos,_),r.length=t;continue e}}b?r.push({token:o,pos:p.index,single:f,level:s}):h&&f&&Pe(n,o,p.index,ct)}}Object.keys(n).forEach(function(o){e[o].content=x0(e[o].content,n[o])})}function m0(e){if(e.md.options.typographer)for(let u=e.tokens.length-1;u>=0;u--)e.tokens[u].type!=="inline"||!b0.test(e.tokens[u].content)||g0(e.tokens[u].children,e)}function y0(e){let u,t;const r=e.tokens,n=r.length;for(let o=0;o<n;o++){if(r[o].type!=="inline")continue;const c=r[o].children,s=c.length;for(u=0;u<s;u++)c[u].type==="text_special"&&(c[u].type="text");for(u=t=0;u<s;u++)c[u].type==="text"&&u+1<s&&c[u+1].type==="text"?c[u+1].content=c[u].content+c[u+1].content:(u!==t&&(c[t]=c[u]),t++);u!==t&&(c.length=t)}}const Re=[["normalize",t0],["block",r0],["inline",n0],["linkify",c0],["replacements",h0],["smartquotes",m0],["text_join",y0]];function eu(){this.ruler=new q;for(let e=0;e<Re.length;e++)this.ruler.push(Re[e][0],Re[e][1])}eu.prototype.process=function(e){const u=this.ruler.getRules("");for(let t=0,r=u.length;t<r;t++)u[t](e)},eu.prototype.State=nt;function J(e,u,t,r){this.src=e,this.md=u,this.env=t,this.tokens=r,this.bMarks=[],this.eMarks=[],this.tShift=[],this.sCount=[],this.bsCount=[],this.blkIndent=0,this.line=0,this.lineMax=0,this.tight=!1,this.ddIndent=-1,this.listIndent=-1,this.parentType="root",this.level=0;const n=this.src;for(let o=0,c=0,s=0,l=0,i=n.length,d=!1;c<i;c++){const p=n.charCodeAt(c);if(!d)if(M(p)){s++,p===9?l+=4-l%4:l++;continue}else d=!0;(p===10||c===i-1)&&(p!==10&&c++,this.bMarks.push(o),this.eMarks.push(c),this.tShift.push(s),this.sCount.push(l),this.bsCount.push(0),d=!1,s=0,l=0,o=c+1)}this.bMarks.push(n.length),this.eMarks.push(n.length),this.tShift.push(0),this.sCount.push(0),this.bsCount.push(0),this.lineMax=this.bMarks.length-1}J.prototype.push=function(e,u,t){const r=new U(e,u,t);return r.block=!0,t<0&&this.level--,r.level=this.level,t>0&&this.level++,this.tokens.push(r),r},J.prototype.isEmpty=function(u){return this.bMarks[u]+this.tShift[u]>=this.eMarks[u]},J.prototype.skipEmptyLines=function(u){for(let t=this.lineMax;u<t&&!(this.bMarks[u]+this.tShift[u]<this.eMarks[u]);u++);return u},J.prototype.skipSpaces=function(u){for(let t=this.src.length;u<t;u++){const r=this.src.charCodeAt(u);if(!M(r))break}return u},J.prototype.skipSpacesBack=function(u,t){if(u<=t)return u;for(;u>t;)if(!M(this.src.charCodeAt(--u)))return u+1;return u},J.prototype.skipChars=function(u,t){for(let r=this.src.length;u<r&&this.src.charCodeAt(u)===t;u++);return u},J.prototype.skipCharsBack=function(u,t,r){if(u<=r)return u;for(;u>r;)if(t!==this.src.charCodeAt(--u))return u+1;return u},J.prototype.getLines=function(u,t,r,n){if(u>=t)return"";const o=new Array(t-u);for(let c=0,s=u;s<t;s++,c++){let l=0;const i=this.bMarks[s];let d=i,p;for(s+1<t||n?p=this.eMarks[s]+1:p=this.eMarks[s];d<p&&l<r;){const b=this.src.charCodeAt(d);if(M(b))b===9?l+=4-(l+this.bsCount[s])%4:l++;else if(d-i<this.tShift[s])l++;else break;d++}l>r?o[c]=new Array(l-r+1).join(" ")+this.src.slice(d,p):o[c]=this.src.slice(d,p)}return o.join("")},J.prototype.Token=U;const v0=65536;function uu(e,u){const t=e.bMarks[u]+e.tShift[u],r=e.eMarks[u];return e.src.slice(t,r)}function st(e){const u=[],t=e.length;let r=0,n=e.charCodeAt(r),o=!1,c=0,s="";for(;r<t;)n===124&&(o?(s+=e.substring(c,r-1),c=r):(u.push(s+e.substring(c,r)),s="",c=r+1)),o=n===92,r++,n=e.charCodeAt(r);return u.push(s+e.substring(c)),u}function k0(e,u,t,r){if(u+2>t)return!1;let n=u+1;if(e.sCount[n]<e.blkIndent||e.sCount[n]-e.blkIndent>=4)return!1;let o=e.bMarks[n]+e.tShift[n];if(o>=e.eMarks[n])return!1;const c=e.src.charCodeAt(o++);if(c!==124&&c!==45&&c!==58||o>=e.eMarks[n])return!1;const s=e.src.charCodeAt(o++);if(s!==124&&s!==45&&s!==58&&!M(s)||c===45&&M(s))return!1;for(;o<e.eMarks[n];){const k=e.src.charCodeAt(o);if(k!==124&&k!==45&&k!==58&&!M(k))return!1;o++}let l=uu(e,u+1),i=l.split("|");const d=[];for(let k=0;k<i.length;k++){const y=i[k].trim();if(!y){if(k===0||k===i.length-1)continue;return!1}if(!/^:?-+:?$/.test(y))return!1;y.charCodeAt(y.length-1)===58?d.push(y.charCodeAt(0)===58?"center":"right"):y.charCodeAt(0)===58?d.push("left"):d.push("")}if(l=uu(e,u).trim(),l.indexOf("|")===-1||e.sCount[u]-e.blkIndent>=4)return!1;i=st(l),i.length&&i[0]===""&&i.shift(),i.length&&i[i.length-1]===""&&i.pop();const p=i.length;if(p===0||p!==d.length)return!1;if(r)return!0;const b=e.parentType;e.parentType="table";const h=e.md.block.ruler.getRules("blockquote"),f=e.push("table_open","table",1),v=[u,0];f.map=v;const m=e.push("thead_open","thead",1);m.map=[u,u+1];const D=e.push("tr_open","tr",1);D.map=[u,u+1];for(let k=0;k<i.length;k++){const y=e.push("th_open","th",1);d[k]&&(y.attrs=[["style","text-align:"+d[k]]]);const _=e.push("inline","",0);_.content=i[k].trim(),_.children=[],e.push("th_close","th",-1)}e.push("tr_close","tr",-1),e.push("thead_close","thead",-1);let w,g=0;for(n=u+2;n<t&&!(e.sCount[n]<e.blkIndent);n++){let k=!1;for(let _=0,S=h.length;_<S;_++)if(h[_](e,n,t,!0)){k=!0;break}if(k||(l=uu(e,n).trim(),!l)||e.sCount[n]-e.blkIndent>=4||(i=st(l),i.length&&i[0]===""&&i.shift(),i.length&&i[i.length-1]===""&&i.pop(),g+=p-i.length,g>v0))break;if(n===u+2){const _=e.push("tbody_open","tbody",1);_.map=w=[u+2,0]}const y=e.push("tr_open","tr",1);y.map=[n,n+1];for(let _=0;_<p;_++){const S=e.push("td_open","td",1);d[_]&&(S.attrs=[["style","text-align:"+d[_]]]);const F=e.push("inline","",0);F.content=i[_]?i[_].trim():"",F.children=[],e.push("td_close","td",-1)}e.push("tr_close","tr",-1)}return w&&(e.push("tbody_close","tbody",-1),w[1]=n),e.push("table_close","table",-1),v[1]=n,e.parentType=b,e.line=n,!0}function w0(e,u,t){if(e.sCount[u]-e.blkIndent<4)return!1;let r=u+1,n=r;for(;r<t;){if(e.isEmpty(r)){r++;continue}if(e.sCount[r]-e.blkIndent>=4){r++,n=r;continue}break}e.line=n;const o=e.push("code_block","code",0);return o.content=e.getLines(u,n,4+e.blkIndent,!1)+`\n`,o.map=[u,e.line],!0}function _0(e,u,t,r){let n=e.bMarks[u]+e.tShift[u],o=e.eMarks[u];if(e.sCount[u]-e.blkIndent>=4||n+3>o)return!1;const c=e.src.charCodeAt(n);if(c!==126&&c!==96)return!1;let s=n;n=e.skipChars(n,c);let l=n-s;if(l<3)return!1;const i=e.src.slice(s,n),d=e.src.slice(n,o);if(c===96&&d.indexOf(String.fromCharCode(c))>=0)return!1;if(r)return!0;let p=u,b=!1;for(;p++,!(p>=t||(n=s=e.bMarks[p]+e.tShift[p],o=e.eMarks[p],n<o&&e.sCount[p]<e.blkIndent));)if(e.src.charCodeAt(n)===c&&!(e.sCount[p]-e.blkIndent>=4)&&(n=e.skipChars(n,c),!(n-s<l)&&(n=e.skipSpaces(n),!(n<o)))){b=!0;break}l=e.sCount[u],e.line=p+(b?1:0);const h=e.push("fence","code",0);return h.info=d,h.content=e.getLines(u+1,p,l,!0),h.markup=i,h.map=[u,e.line],!0}function C0(e,u,t,r){let n=e.bMarks[u]+e.tShift[u],o=e.eMarks[u];const c=e.lineMax;if(e.sCount[u]-e.blkIndent>=4||e.src.charCodeAt(n)!==62)return!1;if(r)return!0;const s=[],l=[],i=[],d=[],p=e.md.block.ruler.getRules("blockquote"),b=e.parentType;e.parentType="blockquote";let h=!1,f;for(f=u;f<t;f++){const g=e.sCount[f]<e.blkIndent;if(n=e.bMarks[f]+e.tShift[f],o=e.eMarks[f],n>=o)break;if(e.src.charCodeAt(n++)===62&&!g){let y=e.sCount[f]+1,_,S;e.src.charCodeAt(n)===32?(n++,y++,S=!1,_=!0):e.src.charCodeAt(n)===9?(_=!0,(e.bsCount[f]+y)%4===3?(n++,y++,S=!1):S=!0):_=!1;let F=y;for(s.push(e.bMarks[f]),e.bMarks[f]=n;n<o;){const E=e.src.charCodeAt(n);if(M(E))E===9?F+=4-(F+e.bsCount[f]+(S?1:0))%4:F++;else break;n++}h=n>=o,l.push(e.bsCount[f]),e.bsCount[f]=e.sCount[f]+1+(_?1:0),i.push(e.sCount[f]),e.sCount[f]=F-y,d.push(e.tShift[f]),e.tShift[f]=n-e.bMarks[f];continue}if(h)break;let k=!1;for(let y=0,_=p.length;y<_;y++)if(p[y](e,f,t,!0)){k=!0;break}if(k){e.lineMax=f,e.blkIndent!==0&&(s.push(e.bMarks[f]),l.push(e.bsCount[f]),d.push(e.tShift[f]),i.push(e.sCount[f]),e.sCount[f]-=e.blkIndent);break}s.push(e.bMarks[f]),l.push(e.bsCount[f]),d.push(e.tShift[f]),i.push(e.sCount[f]),e.sCount[f]=-1}const v=e.blkIndent;e.blkIndent=0;const m=e.push("blockquote_open","blockquote",1);m.markup=">";const D=[u,0];m.map=D,e.md.block.tokenize(e,u,f);const w=e.push("blockquote_close","blockquote",-1);w.markup=">",e.lineMax=c,e.parentType=b,D[1]=e.line;for(let g=0;g<d.length;g++)e.bMarks[g+u]=s[g],e.tShift[g+u]=d[g],e.sCount[g+u]=i[g],e.bsCount[g+u]=l[g];return e.blkIndent=v,!0}function E0(e,u,t,r){const n=e.eMarks[u];if(e.sCount[u]-e.blkIndent>=4)return!1;let o=e.bMarks[u]+e.tShift[u];const c=e.src.charCodeAt(o++);if(c!==42&&c!==45&&c!==95)return!1;let s=1;for(;o<n;){const i=e.src.charCodeAt(o++);if(i!==c&&!M(i))return!1;i===c&&s++}if(s<3)return!1;if(r)return!0;e.line=u+1;const l=e.push("hr","hr",0);return l.map=[u,e.line],l.markup=Array(s+1).join(String.fromCharCode(c)),!0}function lt(e,u){const t=e.eMarks[u];let r=e.bMarks[u]+e.tShift[u];const n=e.src.charCodeAt(r++);if(n!==42&&n!==45&&n!==43)return-1;if(r<t){const o=e.src.charCodeAt(r);if(!M(o))return-1}return r}function it(e,u){const t=e.bMarks[u]+e.tShift[u],r=e.eMarks[u];let n=t;if(n+1>=r)return-1;let o=e.src.charCodeAt(n++);if(o<48||o>57)return-1;for(;;){if(n>=r)return-1;if(o=e.src.charCodeAt(n++),o>=48&&o<=57){if(n-t>=10)return-1;continue}if(o===41||o===46)break;return-1}return n<r&&(o=e.src.charCodeAt(n),!M(o))?-1:n}function D0(e,u){const t=e.level+2;for(let r=u+2,n=e.tokens.length-2;r<n;r++)e.tokens[r].level===t&&e.tokens[r].type==="paragraph_open"&&(e.tokens[r+2].hidden=!0,e.tokens[r].hidden=!0,r+=2)}function A0(e,u,t,r){let n,o,c,s,l=u,i=!0;if(e.sCount[l]-e.blkIndent>=4||e.listIndent>=0&&e.sCount[l]-e.listIndent>=4&&e.sCount[l]<e.blkIndent)return!1;let d=!1;r&&e.parentType==="paragraph"&&e.sCount[l]>=e.blkIndent&&(d=!0);let p,b,h;if((h=it(e,l))>=0){if(p=!0,c=e.bMarks[l]+e.tShift[l],b=Number(e.src.slice(c,h-1)),d&&b!==1)return!1}else if((h=lt(e,l))>=0)p=!1;else return!1;if(d&&e.skipSpaces(h)>=e.eMarks[l])return!1;if(r)return!0;const f=e.src.charCodeAt(h-1),v=e.tokens.length;p?(s=e.push("ordered_list_open","ol",1),b!==1&&(s.attrs=[["start",b]])):s=e.push("bullet_list_open","ul",1);const m=[l,0];s.map=m,s.markup=String.fromCharCode(f);let D=!1;const w=e.md.block.ruler.getRules("list"),g=e.parentType;for(e.parentType="list";l<t;){o=h,n=e.eMarks[l];const k=e.sCount[l]+h-(e.bMarks[l]+e.tShift[l]);let y=k;for(;o<n;){const z=e.src.charCodeAt(o);if(z===9)y+=4-(y+e.bsCount[l])%4;else if(z===32)y++;else break;o++}const _=o;let S;_>=n?S=1:S=y-k,S>4&&(S=1);const F=k+S;s=e.push("list_item_open","li",1),s.markup=String.fromCharCode(f);const E=[l,0];s.map=E,p&&(s.info=e.src.slice(c,h-1));const A=e.tight,N=e.tShift[l],T=e.sCount[l],L=e.listIndent;if(e.listIndent=e.blkIndent,e.blkIndent=F,e.tight=!0,e.tShift[l]=_-e.bMarks[l],e.sCount[l]=y,_>=n&&e.isEmpty(l+1)?e.line=Math.min(e.line+2,t):e.md.block.tokenize(e,l,t,!0),(!e.tight||D)&&(i=!1),D=e.line-l>1&&e.isEmpty(e.line-1),e.blkIndent=e.listIndent,e.listIndent=L,e.tShift[l]=N,e.sCount[l]=T,e.tight=A,s=e.push("list_item_close","li",-1),s.markup=String.fromCharCode(f),l=e.line,E[1]=l,l>=t||e.sCount[l]<e.blkIndent||e.sCount[l]-e.blkIndent>=4)break;let I=!1;for(let z=0,pe=w.length;z<pe;z++)if(w[z](e,l,t,!0)){I=!0;break}if(I)break;if(p){if(h=it(e,l),h<0)break;c=e.bMarks[l]+e.tShift[l]}else if(h=lt(e,l),h<0)break;if(f!==e.src.charCodeAt(h-1))break}return p?s=e.push("ordered_list_close","ol",-1):s=e.push("bullet_list_close","ul",-1),s.markup=String.fromCharCode(f),m[1]=l,e.line=l,e.parentType=g,i&&D0(e,v),!0}function F0(e,u,t,r){let n=e.bMarks[u]+e.tShift[u],o=e.eMarks[u],c=u+1;if(e.sCount[u]-e.blkIndent>=4||e.src.charCodeAt(n)!==91)return!1;function s(w){const g=e.lineMax;if(w>=g||e.isEmpty(w))return null;let k=!1;if(e.sCount[w]-e.blkIndent>3&&(k=!0),e.sCount[w]<0&&(k=!0),!k){const S=e.md.block.ruler.getRules("reference"),F=e.parentType;e.parentType="reference";let E=!1;for(let A=0,N=S.length;A<N;A++)if(S[A](e,w,g,!0)){E=!0;break}if(e.parentType=F,E)return null}const y=e.bMarks[w]+e.tShift[w],_=e.eMarks[w];return e.src.slice(y,_+1)}let l=e.src.slice(n,o+1);o=l.length;let i=-1;for(n=1;n<o;n++){const w=l.charCodeAt(n);if(w===91)return!1;if(w===93){i=n;break}else if(w===10){const g=s(c);g!==null&&(l+=g,o=l.length,c++)}else if(w===92&&(n++,n<o&&l.charCodeAt(n)===10)){const g=s(c);g!==null&&(l+=g,o=l.length,c++)}}if(i<0||l.charCodeAt(i+1)!==58)return!1;for(n=i+2;n<o;n++){const w=l.charCodeAt(n);if(w===10){const g=s(c);g!==null&&(l+=g,o=l.length,c++)}else if(!M(w))break}const d=e.md.helpers.parseLinkDestination(l,n,o);if(!d.ok)return!1;const p=e.md.normalizeLink(d.str);if(!e.md.validateLink(p))return!1;n=d.pos;const b=n,h=c,f=n;for(;n<o;n++){const w=l.charCodeAt(n);if(w===10){const g=s(c);g!==null&&(l+=g,o=l.length,c++)}else if(!M(w))break}let v=e.md.helpers.parseLinkTitle(l,n,o);for(;v.can_continue;){const w=s(c);if(w===null)break;l+=w,n=o,o=l.length,c++,v=e.md.helpers.parseLinkTitle(l,n,o,v)}let m;for(n<o&&f!==n&&v.ok?(m=v.str,n=v.pos):(m="",n=b,c=h);n<o;){const w=l.charCodeAt(n);if(!M(w))break;n++}if(n<o&&l.charCodeAt(n)!==10&&m)for(m="",n=b,c=h;n<o;){const w=l.charCodeAt(n);if(!M(w))break;n++}if(n<o&&l.charCodeAt(n)!==10)return!1;const D=Le(l.slice(1,i));return D?(r||(typeof e.env.references>"u"&&(e.env.references={}),typeof e.env.references[D]>"u"&&(e.env.references[D]={title:m,href:p}),e.line=c),!0):!1}const N0=["address","article","aside","base","basefont","blockquote","body","caption","center","col","colgroup","dd","details","dialog","dir","div","dl","dt","fieldset","figcaption","figure","footer","form","frame","frameset","h1","h2","h3","h4","h5","h6","head","header","hr","html","iframe","legend","li","link","main","menu","menuitem","nav","noframes","ol","optgroup","option","p","param","search","section","summary","table","tbody","td","tfoot","th","thead","title","tr","track","ul"],S0="[a-zA-Z_:][a-zA-Z0-9:._-]*",T0="(?:"+"[^\\"\'=<>`\\\\x00-\\\\x20]+"+"|"+"\'[^\']*\'"+"|"+\'"[^"]*"\'+")",dt="<[A-Za-z][A-Za-z0-9\\\\-]*"+("(?:\\\\s+"+S0+"(?:\\\\s*=\\\\s*"+T0+")?)")+"*\\\\s*\\\\/?>",ft="<\\\\/[A-Za-z][A-Za-z0-9\\\\-]*\\\\s*>",I0="<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->",M0="<[?][\\\\s\\\\S]*?[?]>",L0="<![A-Za-z][^>]*>",$0="<!\\\\[CDATA\\\\[[\\\\s\\\\S]*?\\\\]\\\\]>",P0=new RegExp("^(?:"+dt+"|"+ft+"|"+I0+"|"+M0+"|"+L0+"|"+$0+")"),B0=new RegExp("^(?:"+dt+"|"+ft+")"),oe=[[/^<(script|pre|style|textarea)(?=(\\s|>|$))/i,/<\\/(script|pre|style|textarea)>/i,!0],[/^<!--/,/-->/,!0],[/^<\\?/,/\\?>/,!0],[/^<![A-Z]/,/>/,!0],[/^<!\\[CDATA\\[/,/\\]\\]>/,!0],[new RegExp("^</?("+N0.join("|")+")(?=(\\\\s|/?>|$))","i"),/^$/,!0],[new RegExp(B0.source+"\\\\s*$"),/^$/,!1]];function O0(e,u,t,r){let n=e.bMarks[u]+e.tShift[u],o=e.eMarks[u];if(e.sCount[u]-e.blkIndent>=4||!e.md.options.html||e.src.charCodeAt(n)!==60)return!1;let c=e.src.slice(n,o),s=0;for(;s<oe.length&&!oe[s][0].test(c);s++);if(s===oe.length)return!1;if(r)return oe[s][2];let l=u+1;const i=oe[s][1].test("");if(!oe[s][1].test(c)){for(;l<t&&!(e.sCount[l]<e.blkIndent&&(i||!e.isEmpty(l)));l++)if(n=e.bMarks[l]+e.tShift[l],o=e.eMarks[l],c=e.src.slice(n,o),oe[s][1].test(c)){c.length!==0&&l++;break}}e.line=l;const d=e.push("html_block","",0);return d.map=[u,l],d.content=e.getLines(u,l,e.blkIndent,!0),!0}function z0(e,u,t,r){let n=e.bMarks[u]+e.tShift[u],o=e.eMarks[u];if(e.sCount[u]-e.blkIndent>=4)return!1;let c=e.src.charCodeAt(n);if(c!==35||n>=o)return!1;let s=1;for(c=e.src.charCodeAt(++n);c===35&&n<o&&s<=6;)s++,c=e.src.charCodeAt(++n);if(s>6||n<o&&!M(c))return!1;if(r)return!0;o=e.skipSpacesBack(o,n);const l=e.skipCharsBack(o,35,n);l>n&&M(e.src.charCodeAt(l-1))&&(o=l),e.line=u+1;const i=e.push("heading_open","h"+String(s),1);i.markup="########".slice(0,s),i.map=[u,e.line];const d=e.push("inline","",0);d.content=$e(e.src.slice(n,o)),d.map=[u,e.line],d.children=[];const p=e.push("heading_close","h"+String(s),-1);return p.markup="########".slice(0,s),!0}function j0(e,u,t){const r=e.md.block.ruler.getRules("paragraph");if(e.sCount[u]-e.blkIndent>=4)return!1;const n=e.parentType;e.parentType="paragraph";let o=0,c,s=u+1;for(;s<t&&!e.isEmpty(s);s++){if(e.sCount[s]-e.blkIndent>3)continue;if(e.sCount[s]>=e.blkIndent){let h=e.bMarks[s]+e.tShift[s];const f=e.eMarks[s];if(h<f&&(c=e.src.charCodeAt(h),(c===45||c===61)&&(h=e.skipChars(h,c),h=e.skipSpaces(h),h>=f))){o=c===61?1:2;break}}if(e.sCount[s]<0)continue;let b=!1;for(let h=0,f=r.length;h<f;h++)if(r[h](e,s,t,!0)){b=!0;break}if(b)break}if(!o)return e.parentType=n,!1;const l=$e(e.getLines(u,s,e.blkIndent,!1));e.line=s+1;const i=e.push("heading_open","h"+String(o),1);i.markup=String.fromCharCode(c),i.map=[u,e.line];const d=e.push("inline","",0);d.content=l,d.map=[u,e.line-1],d.children=[];const p=e.push("heading_close","h"+String(o),-1);return p.markup=String.fromCharCode(c),e.parentType=n,!0}function q0(e,u,t){const r=e.md.block.ruler.getRules("paragraph"),n=e.parentType;let o=u+1;for(e.parentType="paragraph";o<t&&!e.isEmpty(o);o++){if(e.sCount[o]-e.blkIndent>3||e.sCount[o]<0)continue;let i=!1;for(let d=0,p=r.length;d<p;d++)if(r[d](e,o,t,!0)){i=!0;break}if(i)break}const c=$e(e.getLines(u,o,e.blkIndent,!1));e.line=o;const s=e.push("paragraph_open","p",1);s.map=[u,e.line];const l=e.push("inline","",0);return l.content=c,l.map=[u,e.line],l.children=[],e.push("paragraph_close","p",-1),e.parentType=n,!0}const Be=[["table",k0,["paragraph","reference"]],["code",w0],["fence",_0,["paragraph","reference","blockquote","list"]],["blockquote",C0,["paragraph","reference","blockquote","list"]],["hr",E0,["paragraph","reference","blockquote","list"]],["list",A0,["paragraph","reference","blockquote"]],["reference",F0],["html_block",O0,["paragraph","reference","blockquote"]],["heading",z0,["paragraph","reference","blockquote"]],["lheading",j0],["paragraph",q0]];function Oe(){this.ruler=new q;for(let e=0;e<Be.length;e++)this.ruler.push(Be[e][0],Be[e][1],{alt:(Be[e][2]||[]).slice()})}Oe.prototype.tokenize=function(e,u,t){const r=this.ruler.getRules(""),n=r.length,o=e.md.options.maxNesting;let c=u,s=!1;for(;c<t&&(e.line=c=e.skipEmptyLines(c),!(c>=t||e.sCount[c]<e.blkIndent));){if(e.level>=o){e.line=t;break}const l=e.line;let i=!1;for(let d=0;d<n;d++)if(i=r[d](e,c,t,!1),i){if(l>=e.line)throw new Error("block rule didn\'t increment state.line");break}if(!i)throw new Error("none of the block rules matched");e.tight=!s,e.isEmpty(e.line-1)&&(s=!0),c=e.line,c<t&&e.isEmpty(c)&&(s=!0,c++,e.line=c)}},Oe.prototype.parse=function(e,u,t,r){if(!e)return;const n=new this.State(e,u,t,r);this.tokenize(n,n.line,n.lineMax)},Oe.prototype.State=J;function ve(e,u,t,r){this.src=e,this.env=t,this.md=u,this.tokens=r,this.tokens_meta=Array(r.length),this.pos=0,this.posMax=this.src.length,this.level=0,this.pending="",this.pendingLevel=0,this.cache={},this.delimiters=[],this._prev_delimiters=[],this.backticks={},this.backticksScanned=!1,this.linkLevel=0}ve.prototype.pushPending=function(){const e=new U("text","",0);return e.content=this.pending,e.level=this.pendingLevel,this.tokens.push(e),this.pending="",e},ve.prototype.push=function(e,u,t){this.pending&&this.pushPending();const r=new U(e,u,t);let n=null;return t<0&&(this.level--,this.delimiters=this._prev_delimiters.pop()),r.level=this.level,t>0&&(this.level++,this._prev_delimiters.push(this.delimiters),this.delimiters=[],n={delimiters:this.delimiters}),this.pendingLevel=this.level,this.tokens.push(r),this.tokens_meta.push(n),r},ve.prototype.scanDelims=function(e,u){const t=this.posMax,r=this.src.charCodeAt(e);let n;if(e===0)n=32;else if(e===1)n=this.src.charCodeAt(0),(n&63488)===55296&&(n=65533);else if(n=this.src.charCodeAt(e-1),(n&64512)===56320){const m=this.src.charCodeAt(e-2);n=(m&64512)===55296?65536+(m-55296<<10)+(n-56320):65533}else(n&64512)===55296&&(n=65533);let o=e;for(;o<t&&this.src.charCodeAt(o)===r;)o++;const c=o-e;let s=o<t?this.src.charCodeAt(o):32;if((s&64512)===55296){const m=this.src.charCodeAt(o+1);s=(m&64512)===56320?65536+(s-55296<<10)+(m-56320):65533}else(s&64512)===56320&&(s=65533);const l=ye(n)||me(n),i=ye(s)||me(s),d=ge(n),p=ge(s),b=!p&&(!i||d||l),h=!d&&(!l||p||i);return{can_open:b&&(u||!h||l),can_close:h&&(u||!b||i),length:c}},ve.prototype.Token=U;function H0(e){switch(e){case 10:case 33:case 35:case 36:case 37:case 38:case 42:case 43:case 45:case 58:case 60:case 61:case 62:case 64:case 91:case 92:case 93:case 94:case 95:case 96:case 123:case 125:case 126:return!0;default:return!1}}function Z0(e,u){let t=e.pos;for(;t<e.posMax&&!H0(e.src.charCodeAt(t));)t++;return t===e.pos?!1:(u||(e.pending+=e.src.slice(e.pos,t)),e.pos=t,!0)}const V0=/(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;function U0(e,u){if(!e.md.options.linkify||e.linkLevel>0)return!1;const t=e.pos,r=e.posMax;if(t+3>r||e.src.charCodeAt(t)!==58||e.src.charCodeAt(t+1)!==47||e.src.charCodeAt(t+2)!==47)return!1;const n=e.pending.match(V0);if(!n)return!1;const o=n[1],c=e.md.linkify.matchAtStart(e.src.slice(t-o.length));if(!c)return!1;let s=c.url;if(s.length<=o.length)return!1;let l=s.length;for(;l>0&&s.charCodeAt(l-1)===42;)l--;l!==s.length&&(s=s.slice(0,l));const i=e.md.normalizeLink(s);if(!e.md.validateLink(i))return!1;if(!u){e.pending=e.pending.slice(0,-o.length);const d=e.push("link_open","a",1);d.attrs=[["href",i]],d.markup="linkify",d.info="auto";const p=e.push("text","",0);p.content=e.md.normalizeLinkText(s);const b=e.push("link_close","a",-1);b.markup="linkify",b.info="auto"}return e.pos+=s.length-o.length,!0}function W0(e,u){let t=e.pos;if(e.src.charCodeAt(t)!==10)return!1;const r=e.pending.length-1,n=e.posMax;if(!u)if(r>=0&&e.pending.charCodeAt(r)===32)if(r>=1&&e.pending.charCodeAt(r-1)===32){let o=r-1;for(;o>=1&&e.pending.charCodeAt(o-1)===32;)o--;e.pending=e.pending.slice(0,o),e.push("hardbreak","br",0)}else e.pending=e.pending.slice(0,-1),e.push("softbreak","br",0);else e.push("softbreak","br",0);for(t++;t<n&&M(e.src.charCodeAt(t));)t++;return e.pos=t,!0}const tu=[];for(let e=0;e<256;e++)tu.push(0);"\\\\!\\"#$%&\'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(e){tu[e.charCodeAt(0)]=1});function G0(e,u){let t=e.pos;const r=e.posMax;if(e.src.charCodeAt(t)!==92||(t++,t>=r))return!1;let n=e.src.charCodeAt(t);if(n===10){for(u||e.push("hardbreak","br",0),t++;t<r&&(n=e.src.charCodeAt(t),!!M(n));)t++;return e.pos=t,!0}let o=e.src[t];if(n>=55296&&n<=56319&&t+1<r){const s=e.src.charCodeAt(t+1);s>=56320&&s<=57343&&(o+=e.src[t+1],t++)}const c="\\\\"+o;if(!u){const s=e.push("text_special","",0);n<256&&tu[n]!==0?s.content=o:s.content=c,s.markup=c,s.info="escape"}return e.pos=t+1,!0}function X0(e,u){let t=e.pos;if(e.src.charCodeAt(t)!==96)return!1;const n=t;t++;const o=e.posMax;for(;t<o&&e.src.charCodeAt(t)===96;)t++;const c=e.src.slice(n,t),s=c.length;if(e.backticksScanned&&(e.backticks[s]||0)<=n)return u||(e.pending+=c),e.pos+=s,!0;let l=t,i;for(;(i=e.src.indexOf("`",l))!==-1;){for(l=i+1;l<o&&e.src.charCodeAt(l)===96;)l++;const d=l-i;if(d===s){if(!u){const p=e.push("code_inline","code",0);p.markup=c,p.content=e.src.slice(t,i).replace(/\\n/g," ").replace(/^ (.+) $/,"$1")}return e.pos=l,!0}e.backticks[d]=i}return e.backticksScanned=!0,u||(e.pending+=c),e.pos+=s,!0}function J0(e,u){const t=e.pos,r=e.src.charCodeAt(t);if(u||r!==126)return!1;const n=e.scanDelims(e.pos,!0);let o=n.length;const c=String.fromCharCode(r);if(o<2)return!1;let s;o%2&&(s=e.push("text","",0),s.content=c,o--);for(let l=0;l<o;l+=2)s=e.push("text","",0),s.content=c+c,e.delimiters.push({marker:r,length:0,token:e.tokens.length-1,end:-1,open:n.can_open,close:n.can_close});return e.pos+=n.length,!0}function pt(e,u){let t;const r=[],n=u.length;for(let o=0;o<n;o++){const c=u[o];if(c.marker!==126||c.end===-1)continue;const s=u[c.end];t=e.tokens[c.token],t.type="s_open",t.tag="s",t.nesting=1,t.markup="~~",t.content="",t=e.tokens[s.token],t.type="s_close",t.tag="s",t.nesting=-1,t.markup="~~",t.content="",e.tokens[s.token-1].type==="text"&&e.tokens[s.token-1].content==="~"&&r.push(s.token-1)}for(;r.length;){const o=r.pop();let c=o+1;for(;c<e.tokens.length&&e.tokens[c].type==="s_close";)c++;c--,o!==c&&(t=e.tokens[c],e.tokens[c]=e.tokens[o],e.tokens[o]=t)}}function K0(e){const u=e.tokens_meta,t=e.tokens_meta.length;pt(e,e.delimiters);for(let r=0;r<t;r++)u[r]&&u[r].delimiters&&pt(e,u[r].delimiters)}const ht={tokenize:J0,postProcess:K0};function Q0(e,u){const t=e.pos,r=e.src.charCodeAt(t);if(u||r!==95&&r!==42)return!1;const n=e.scanDelims(e.pos,r===42);for(let o=0;o<n.length;o++){const c=e.push("text","",0);c.content=String.fromCharCode(r),e.delimiters.push({marker:r,length:n.length,token:e.tokens.length-1,end:-1,open:n.can_open,close:n.can_close})}return e.pos+=n.length,!0}function bt(e,u){const t=u.length;for(let r=t-1;r>=0;r--){const n=u[r];if(n.marker!==95&&n.marker!==42||n.end===-1)continue;const o=u[n.end],c=r>0&&u[r-1].end===n.end+1&&u[r-1].marker===n.marker&&u[r-1].token===n.token-1&&u[n.end+1].token===o.token+1,s=String.fromCharCode(n.marker),l=e.tokens[n.token];l.type=c?"strong_open":"em_open",l.tag=c?"strong":"em",l.nesting=1,l.markup=c?s+s:s,l.content="";const i=e.tokens[o.token];i.type=c?"strong_close":"em_close",i.tag=c?"strong":"em",i.nesting=-1,i.markup=c?s+s:s,i.content="",c&&(e.tokens[u[r-1].token].content="",e.tokens[u[n.end+1].token].content="",r--)}}function Y0(e){const u=e.tokens_meta,t=e.tokens_meta.length;bt(e,e.delimiters);for(let r=0;r<t;r++)u[r]&&u[r].delimiters&&bt(e,u[r].delimiters)}const xt={tokenize:Q0,postProcess:Y0};function R0(e,u){let t,r,n,o,c="",s="",l=e.pos,i=!0;if(e.src.charCodeAt(e.pos)!==91)return!1;const d=e.pos,p=e.posMax,b=e.pos+1,h=e.md.helpers.parseLinkLabel(e,e.pos,!0);if(h<0)return!1;let f=h+1;if(f<p&&e.src.charCodeAt(f)===40){for(i=!1,f++;f<p&&(t=e.src.charCodeAt(f),!(!M(t)&&t!==10));f++);if(f>=p)return!1;if(l=f,n=e.md.helpers.parseLinkDestination(e.src,f,e.posMax),n.ok){for(c=e.md.normalizeLink(n.str),e.md.validateLink(c)?f=n.pos:c="",l=f;f<p&&(t=e.src.charCodeAt(f),!(!M(t)&&t!==10));f++);if(n=e.md.helpers.parseLinkTitle(e.src,f,e.posMax),f<p&&l!==f&&n.ok)for(s=n.str,f=n.pos;f<p&&(t=e.src.charCodeAt(f),!(!M(t)&&t!==10));f++);}(f>=p||e.src.charCodeAt(f)!==41)&&(i=!0),f++}if(i){if(typeof e.env.references>"u")return!1;if(f<p&&e.src.charCodeAt(f)===91?(l=f+1,f=e.md.helpers.parseLinkLabel(e,f),f>=0?r=e.src.slice(l,f++):f=h+1):f=h+1,r||(r=e.src.slice(b,h)),o=e.env.references[Le(r)],!o)return e.pos=d,!1;c=o.href,s=o.title}if(!u){e.pos=b,e.posMax=h;const v=e.push("link_open","a",1),m=[["href",c]];v.attrs=m,s&&m.push(["title",s]),e.linkLevel++,e.md.inline.tokenize(e),e.linkLevel--,e.push("link_close","a",-1)}return e.pos=f,e.posMax=p,!0}function eo(e,u){let t,r,n,o,c,s,l,i,d="";const p=e.pos,b=e.posMax;if(e.src.charCodeAt(e.pos)!==33||e.src.charCodeAt(e.pos+1)!==91)return!1;const h=e.pos+2,f=e.md.helpers.parseLinkLabel(e,e.pos+1,!1);if(f<0)return!1;if(o=f+1,o<b&&e.src.charCodeAt(o)===40){for(o++;o<b&&(t=e.src.charCodeAt(o),!(!M(t)&&t!==10));o++);if(o>=b)return!1;for(i=o,s=e.md.helpers.parseLinkDestination(e.src,o,e.posMax),s.ok&&(d=e.md.normalizeLink(s.str),e.md.validateLink(d)?o=s.pos:d=""),i=o;o<b&&(t=e.src.charCodeAt(o),!(!M(t)&&t!==10));o++);if(s=e.md.helpers.parseLinkTitle(e.src,o,e.posMax),o<b&&i!==o&&s.ok)for(l=s.str,o=s.pos;o<b&&(t=e.src.charCodeAt(o),!(!M(t)&&t!==10));o++);else l="";if(o>=b||e.src.charCodeAt(o)!==41)return e.pos=p,!1;o++}else{if(typeof e.env.references>"u")return!1;if(o<b&&e.src.charCodeAt(o)===91?(i=o+1,o=e.md.helpers.parseLinkLabel(e,o),o>=0?n=e.src.slice(i,o++):o=f+1):o=f+1,n||(n=e.src.slice(h,f)),c=e.env.references[Le(n)],!c)return e.pos=p,!1;d=c.href,l=c.title}if(!u){r=e.src.slice(h,f);const v=[];e.md.inline.parse(r,e.md,e.env,v);const m=e.push("image","img",0),D=[["src",d],["alt",""]];m.attrs=D,m.children=v,m.content=r,l&&D.push(["title",l])}return e.pos=o,e.posMax=b,!0}const uo=/^([a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/,to=/^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\\x00-\\x20]*)$/;function ro(e,u){let t=e.pos;if(e.src.charCodeAt(t)!==60)return!1;const r=e.pos,n=e.posMax;for(;;){if(++t>=n)return!1;const c=e.src.charCodeAt(t);if(c===60)return!1;if(c===62)break}const o=e.src.slice(r+1,t);if(to.test(o)){const c=e.md.normalizeLink(o);if(!e.md.validateLink(c))return!1;if(!u){const s=e.push("link_open","a",1);s.attrs=[["href",c]],s.markup="autolink",s.info="auto";const l=e.push("text","",0);l.content=e.md.normalizeLinkText(o);const i=e.push("link_close","a",-1);i.markup="autolink",i.info="auto"}return e.pos+=o.length+2,!0}if(uo.test(o)){const c=e.md.normalizeLink("mailto:"+o);if(!e.md.validateLink(c))return!1;if(!u){const s=e.push("link_open","a",1);s.attrs=[["href",c]],s.markup="autolink",s.info="auto";const l=e.push("text","",0);l.content=e.md.normalizeLinkText(o);const i=e.push("link_close","a",-1);i.markup="autolink",i.info="auto"}return e.pos+=o.length+2,!0}return!1}function no(e){return/^<a[>\\s]/i.test(e)}function oo(e){return/^<\\/a\\s*>/i.test(e)}function ao(e){const u=e|32;return u>=97&&u<=122}function co(e,u){if(!e.md.options.html)return!1;const t=e.posMax,r=e.pos;if(e.src.charCodeAt(r)!==60||r+2>=t)return!1;const n=e.src.charCodeAt(r+1);if(n!==33&&n!==63&&n!==47&&!ao(n))return!1;const o=e.src.slice(r).match(P0);if(!o)return!1;if(!u){const c=e.push("html_inline","",0);c.content=o[0],no(c.content)&&e.linkLevel++,oo(c.content)&&e.linkLevel--}return e.pos+=o[0].length,!0}const so=/^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i,lo=/^&([a-z][a-z0-9]{1,31});/i;function io(e,u){const t=e.pos,r=e.posMax;if(e.src.charCodeAt(t)!==38||t+1>=r)return!1;if(e.src.charCodeAt(t+1)===35){const o=e.src.slice(t).match(so);if(o){if(!u){const c=o[1][0].toLowerCase()==="x"?parseInt(o[1].slice(1),16):parseInt(o[1],10),s=e.push("text_special","",0);s.content=Ye(c)?xe(c):xe(65533),s.markup=o[0],s.info="entity"}return e.pos+=o[0].length,!0}}else{const o=e.src.slice(t).match(lo);if(o){const c=Ln(o[0]);if(c!==o[0]){if(!u){const s=e.push("text_special","",0);s.content=c,s.markup=o[0],s.info="entity"}return e.pos+=o[0].length,!0}}}return!1}function gt(e){const u={},t=e.length;if(!t)return;let r=0,n=-2;const o=[];for(let c=0;c<t;c++){const s=e[c];if(o.push(0),(e[r].marker!==s.marker||n!==s.token-1)&&(r=c),n=s.token,s.length=s.length||0,!s.close)continue;u.hasOwnProperty(s.marker)||(u[s.marker]=[-1,-1,-1,-1,-1,-1]);const l=u[s.marker][(s.open?3:0)+s.length%3];let i=r-o[r]-1,d=i;for(;i>l;i-=o[i]+1){const p=e[i];if(p.marker===s.marker&&p.open&&p.end<0){let b=!1;if((p.close||s.open)&&(p.length+s.length)%3===0&&(p.length%3!==0||s.length%3!==0)&&(b=!0),!b){const h=i>0&&!e[i-1].open?o[i-1]+1:0;o[c]=c-i+h,o[i]=h,s.open=!1,p.end=c,p.close=!1,d=-1,n=-2;break}}}d!==-1&&(u[s.marker][(s.open?3:0)+(s.length||0)%3]=d)}}function fo(e){const u=e.tokens_meta,t=e.tokens_meta.length;gt(e.delimiters);for(let r=0;r<t;r++)u[r]&&u[r].delimiters&&gt(u[r].delimiters)}function po(e){let u,t,r=0;const n=e.tokens,o=e.tokens.length;for(u=t=0;u<o;u++)n[u].nesting<0&&r--,n[u].level=r,n[u].nesting>0&&r++,n[u].type==="text"&&u+1<o&&n[u+1].type==="text"?n[u+1].content=n[u].content+n[u+1].content:(u!==t&&(n[t]=n[u]),t++);u!==t&&(n.length=t)}const ru=[["text",Z0],["linkify",U0],["newline",W0],["escape",G0],["backticks",X0],["strikethrough",ht.tokenize],["emphasis",xt.tokenize],["link",R0],["image",eo],["autolink",ro],["html_inline",co],["entity",io]],nu=[["balance_pairs",fo],["strikethrough",ht.postProcess],["emphasis",xt.postProcess],["fragments_join",po]];function ke(){this.ruler=new q;for(let e=0;e<ru.length;e++)this.ruler.push(ru[e][0],ru[e][1]);this.ruler2=new q;for(let e=0;e<nu.length;e++)this.ruler2.push(nu[e][0],nu[e][1])}ke.prototype.skipToken=function(e){const u=e.pos,t=this.ruler.getRules(""),r=t.length,n=e.md.options.maxNesting,o=e.cache;if(typeof o[u]<"u"){e.pos=o[u];return}let c=!1;if(e.level<n){for(let s=0;s<r;s++)if(e.level++,c=t[s](e,!0),e.level--,c){if(u>=e.pos)throw new Error("inline rule didn\'t increment state.pos");break}}else e.pos=e.posMax;c||e.pos++,o[u]=e.pos},ke.prototype.tokenize=function(e){const u=this.ruler.getRules(""),t=u.length,r=e.posMax,n=e.md.options.maxNesting;for(;e.pos<r;){const o=e.pos;let c=!1;if(e.level<n){for(let s=0;s<t;s++)if(c=u[s](e,!1),c){if(o>=e.pos)throw new Error("inline rule didn\'t increment state.pos");break}}if(c){if(e.pos>=r)break;continue}e.pending+=e.src[e.pos++]}e.pending&&e.pushPending()},ke.prototype.parse=function(e,u,t,r){const n=new this.State(e,u,t,r);this.tokenize(n);const o=this.ruler2.getRules(""),c=o.length;for(let s=0;s<c;s++)o[s](n)},ke.prototype.State=ve;function ho(e){const u={};e=e||{},u.src_Any=Xu.source,u.src_Cc=Ju.source,u.src_Z=Qu.source,u.src_P=Xe.source,u.src_ZPCc=[u.src_Z,u.src_P,u.src_Cc].join("|"),u.src_ZCc=[u.src_Z,u.src_Cc].join("|");const t="[><\uFF5C]";return u.src_pseudo_letter=`(?:(?!${t}|${u.src_ZPCc})${u.src_Any})`,u.src_ip4="(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)",u.src_auth=`(?:(?:(?!${u.src_ZCc}|[@/\\\\[\\\\]()]).){1,50}@)?`,u.src_port="(?::(?:6(?:[0-4]\\\\d{3}|5(?:[0-4]\\\\d{2}|5(?:[0-2]\\\\d|3[0-5])))|[1-5]?\\\\d{1,4}))?",u.src_host_terminator=`(?=$|${t}|${u.src_ZPCc})(?!${e["---"]?"-(?!--)|":"-|"}_|:\\\\d|\\\\.-|\\\\.(?!$|${u.src_ZPCc}))`,u.src_path=`(?:[/?#](?:(?!${u.src_ZCc}|${t}|[()[\\\\]{}.,"\'?!\\\\-;]).|\\\\[(?:(?!${u.src_ZCc}|\\\\]).)*\\\\]|\\\\((?:(?!${u.src_ZCc}|[)]).)*\\\\)|\\\\{(?:(?!${u.src_ZCc}|[}]).)*\\\\}|\\\\"(?:(?!${u.src_ZCc}|["]).)+\\\\"|\\\\\'(?:(?!${u.src_ZCc}|[\']).)+\\\\\'|\\\\\'(?=${u.src_pseudo_letter}|[-])|\\\\.{2,}[a-zA-Z0-9%/&]|\\\\.(?!${u.src_ZCc}|[.]|$)|`+(e["---"]?"\\\\-(?!--(?:[^-]|$))(?:-*)|":"\\\\-+|")+`,(?!${u.src_ZCc}|$)|;(?!${u.src_ZCc}|$)|\\\\!+(?!${u.src_ZCc}|[!]|$)|\\\\?(?!${u.src_ZCc}|[?]|$))+|\\\\/)?`,u.src_email_name=\'[\\\\-;:&=\\\\+\\\\$,\\\\.a-zA-Z0-9_][\\\\-;:&=\\\\+\\\\$,\\\\"\\\\.a-zA-Z0-9_]{0,63}\',u.src_xn="xn--[a-z0-9\\\\-]{1,59}",u.src_domain_root="(?:"+u.src_xn+`|${u.src_pseudo_letter}{1,63})`,u.src_domain="(?:"+u.src_xn+`|(?:${u.src_pseudo_letter})|(?:${u.src_pseudo_letter}(?:-|${u.src_pseudo_letter}){0,61}${u.src_pseudo_letter}))`,u.src_host=`(?:(?:(?:(?:${u.src_domain})\\\\.)*${u.src_domain}))`,u.tpl_host_fuzzy="(?:"+u.src_ip4+`|(?:(?:(?:${u.src_domain})\\\\.)+(?:%TLDS%)))`,u.tpl_host_no_ip_fuzzy=`(?:(?:(?:${u.src_domain})\\\\.)+(?:%TLDS%))`,u.src_host_strict=u.src_host+u.src_host_terminator,u.tpl_host_fuzzy_strict=u.tpl_host_fuzzy+u.src_host_terminator,u.src_host_port_strict=u.src_host+u.src_port+u.src_host_terminator,u.tpl_host_port_fuzzy_strict=u.tpl_host_fuzzy+u.src_port+u.src_host_terminator,u.tpl_host_port_no_ip_fuzzy_strict=u.tpl_host_no_ip_fuzzy+u.src_port+u.src_host_terminator,u.tpl_host_fuzzy_test=`localhost|www\\\\.|\\\\.\\\\d{1,3}\\\\.|(?:\\\\.(?:%TLDS%)(?:${u.src_ZPCc}|>|$))`,u.tpl_email_fuzzy=`(^|${t}|"|\\\\(|${u.src_ZCc})(${u.src_email_name}@${u.tpl_host_fuzzy_strict})`,u.tpl_link_fuzzy=`(^|(?![.:/\\\\-_@])(?:[$+<=>^\\`|\uFF5C]|${u.src_ZPCc}))((?![$+<=>^\\`|\uFF5C])${u.tpl_host_port_fuzzy_strict}${u.src_path})`,u.tpl_link_no_ip_fuzzy=`(^|(?![.:/\\\\-_@])(?:[$+<=>^\\`|\uFF5C]|${u.src_ZPCc}))((?![$+<=>^\\`|\uFF5C])${u.tpl_host_port_no_ip_fuzzy_strict}${u.src_path})`,u}function ou(e){return Array.prototype.slice.call(arguments,1).forEach(function(t){t&&Object.keys(t).forEach(function(r){e[r]=t[r]})}),e}function ze(e){return Object.prototype.toString.call(e)}function bo(e){return ze(e)==="[object String]"}function xo(e){return ze(e)==="[object Object]"}function go(e){return ze(e)==="[object RegExp]"}function mt(e){return ze(e)==="[object Function]"}function mo(e){return e.replace(/[.?*+^$[\\]\\\\(){}|-]/g,"\\\\$&")}const yt={fuzzyLink:!0,fuzzyEmail:!0,fuzzyIP:!1};function yo(e){return Object.keys(e||{}).reduce(function(u,t){return u||yt.hasOwnProperty(t)},!1)}const vo={"http:":{validate:function(e,u,t){const r=e.slice(u);return t.re.http||(t.re.http=new RegExp(`^\\\\/\\\\/${t.re.src_auth}${t.re.src_host_port_strict}${t.re.src_path}`,"i")),t.re.http.test(r)?r.match(t.re.http)[0].length:0}},"https:":"http:","ftp:":"http:","//":{validate:function(e,u,t){const r=e.slice(u);return t.re.no_http||(t.re.no_http=new RegExp("^"+t.re.src_auth+`(?:localhost|(?:(?:${t.re.src_domain})\\\\.)+${t.re.src_domain_root})`+t.re.src_port+t.re.src_host_terminator+t.re.src_path,"i")),t.re.no_http.test(r)?u>=3&&e[u-3]===":"||u>=3&&e[u-3]==="/"?0:r.match(t.re.no_http)[0].length:0}},"mailto:":{validate:function(e,u,t){const r=e.slice(u);return t.re.mailto||(t.re.mailto=new RegExp(`^${t.re.src_email_name}@${t.re.src_host_strict}`,"i")),t.re.mailto.test(r)?r.match(t.re.mailto)[0].length:0}}},ko="a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]",wo="biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|\u0440\u0444".split("|");function _o(e){return function(u,t){const r=u.slice(t);return e.test(r)?r.match(e)[0].length:0}}function vt(){return function(e,u){u.normalize(e)}}function je(e){const u=e.re=ho(e.__opts__),t=e.__tlds__.slice();e.onCompile(),e.__tlds_replaced__||t.push(ko),t.push(u.src_xn),u.src_tlds=t.join("|");function r(s){return s.replace("%TLDS%",u.src_tlds)}u.email_fuzzy=RegExp(r(u.tpl_email_fuzzy),"i"),u.email_fuzzy_global=RegExp(r(u.tpl_email_fuzzy),"ig"),u.link_fuzzy=RegExp(r(u.tpl_link_fuzzy),"i"),u.link_fuzzy_global=RegExp(r(u.tpl_link_fuzzy),"ig"),u.link_no_ip_fuzzy=RegExp(r(u.tpl_link_no_ip_fuzzy),"i"),u.link_no_ip_fuzzy_global=RegExp(r(u.tpl_link_no_ip_fuzzy),"ig"),u.host_fuzzy_test=RegExp(r(u.tpl_host_fuzzy_test),"i");const n=[];e.__compiled__={};function o(s,l){throw new Error(`(LinkifyIt) Invalid schema "${s}": ${l}`)}Object.keys(e.__schemas__).forEach(function(s){const l=e.__schemas__[s];if(l===null)return;const i={validate:null,link:null};if(e.__compiled__[s]=i,xo(l)){go(l.validate)?i.validate=_o(l.validate):mt(l.validate)?i.validate=l.validate:o(s,l),mt(l.normalize)?i.normalize=l.normalize:l.normalize?o(s,l):i.normalize=vt();return}if(bo(l)){n.push(s);return}o(s,l)}),n.forEach(function(s){e.__compiled__[e.__schemas__[s]]&&(e.__compiled__[s].validate=e.__compiled__[e.__schemas__[s]].validate,e.__compiled__[s].normalize=e.__compiled__[e.__schemas__[s]].normalize)}),e.__compiled__[""]={validate:null,normalize:vt()};const c=Object.keys(e.__compiled__).filter(function(s){return s.length>0&&e.__compiled__[s]}).map(mo).join("|");e.re.schema_test=RegExp(`(^|(?!_)(?:[><\uFF5C]|${u.src_ZPCc}))(${c})`,"i"),e.re.schema_search=RegExp(`(^|(?!_)(?:[><\uFF5C]|${u.src_ZPCc}))(${c})`,"ig"),e.re.schema_at_start=RegExp(`^${e.re.schema_search.source}`,"i"),e.re.pretest=RegExp(`(${e.re.schema_test.source})|(${e.re.host_fuzzy_test.source})|@`,"i")}function kt(e,u,t,r){const n=e.slice(t,r);this.schema=u.toLowerCase(),this.index=t,this.lastIndex=r,this.raw=n,this.text=n,this.url=n}function H(e,u){if(!(this instanceof H))return new H(e,u);u||yo(e)&&(u=e,e={}),this.__opts__=ou({},yt,u),this.__schemas__=ou({},vo,e),this.__compiled__={},this.__tlds__=wo,this.__tlds_replaced__=!1,this.re={},je(this)}H.prototype.add=function(u,t){return this.__schemas__[u]=t,je(this),this},H.prototype.set=function(u){return this.__opts__=ou(this.__opts__,u),this},H.prototype.test=function(u){if(!u.length)return!1;let t,r;if(this.re.schema_test.test(u)){for(r=this.re.schema_search,r.lastIndex=0;(t=r.exec(u))!==null;)if(this.testSchemaAt(u,t[2],r.lastIndex))return!0}return!!(this.__opts__.fuzzyLink&&this.__compiled__["http:"]&&u.search(this.re.host_fuzzy_test)>=0&&u.match(this.__opts__.fuzzyIP?this.re.link_fuzzy:this.re.link_no_ip_fuzzy)!==null||this.__opts__.fuzzyEmail&&this.__compiled__["mailto:"]&&u.indexOf("@")>=0&&u.match(this.re.email_fuzzy)!==null)},H.prototype.pretest=function(u){return this.re.pretest.test(u)},H.prototype.testSchemaAt=function(u,t,r){return this.__compiled__[t.toLowerCase()]?this.__compiled__[t.toLowerCase()].validate(u,r,this):0},H.prototype.match=function(u){const t=[],r=[],n=[],o=[];let c,s,l;function i(b,h){return b?h?b.index!==h.index?b.index<h.index?b:h:b.lastIndex>=h.lastIndex?b:h:b:h}if(!u.length)return null;if(this.re.schema_test.test(u))for(l=this.re.schema_search,l.lastIndex=0;(c=l.exec(u))!==null;)s=this.testSchemaAt(u,c[2],l.lastIndex),s&&r.push({schema:c[2],index:c.index+c[1].length,lastIndex:c.index+c[0].length+s});if(this.__opts__.fuzzyLink&&this.__compiled__["http:"])for(l=this.__opts__.fuzzyIP?this.re.link_fuzzy_global:this.re.link_no_ip_fuzzy_global,l.lastIndex=0;(c=l.exec(u))!==null;)n.push({schema:"",index:c.index+c[1].length,lastIndex:c.index+c[0].length});if(this.__opts__.fuzzyEmail&&this.__compiled__["mailto:"])for(l=this.re.email_fuzzy_global,l.lastIndex=0;(c=l.exec(u))!==null;)o.push({schema:"mailto:",index:c.index+c[1].length,lastIndex:c.index+c[0].length});const d=[0,0,0];let p=0;for(;;){const b=[r[d[0]],o[d[1]],n[d[2]]],h=i(i(b[0],b[1]),b[2]);if(!h)break;if(h===b[0]?d[0]++:h===b[1]?d[1]++:d[2]++,h.index<p)continue;const f=new kt(u,h.schema,h.index,h.lastIndex);this.__compiled__[f.schema].normalize(f,this),t.push(f),p=h.lastIndex}return t.length?t:null},H.prototype.matchAtStart=function(u){if(!u.length)return null;const t=this.re.schema_at_start.exec(u);if(!t)return null;const r=this.testSchemaAt(u,t[2],t[0].length);if(!r)return null;const n=new kt(u,t[2],t.index+t[1].length,t.index+t[0].length+r);return this.__compiled__[n.schema].normalize(n,this),n},H.prototype.tlds=function(u,t){return u=Array.isArray(u)?u:[u],t?(this.__tlds__=this.__tlds__.concat(u).sort().filter(function(r,n,o){return r!==o[n-1]}).reverse(),je(this),this):(this.__tlds__=u.slice(),this.__tlds_replaced__=!0,je(this),this)},H.prototype.normalize=function(u){u.schema||(u.url=`http://${u.url}`),u.schema==="mailto:"&&!/^mailto:/i.test(u.url)&&(u.url=`mailto:${u.url}`)},H.prototype.onCompile=function(){};const le=2147483647,K=36,au=1,we=26,Co=38,Eo=700,wt=72,_t=128,Ct="-",Do=/^xn--/,Ao=/[^\\0-\\x7F]/,Fo=/[\\x2E\\u3002\\uFF0E\\uFF61]/g,No={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},cu=K-au,Q=Math.floor,su=String.fromCharCode;function ue(e){throw new RangeError(No[e])}function So(e,u){const t=[];let r=e.length;for(;r--;)t[r]=u(e[r]);return t}function Et(e,u){const t=e.split("@");let r="";t.length>1&&(r=t[0]+"@",e=t[1]),e=e.replace(Fo,".");const n=e.split("."),o=So(n,u).join(".");return r+o}function Dt(e){const u=[];let t=0;const r=e.length;for(;t<r;){const n=e.charCodeAt(t++);if(n>=55296&&n<=56319&&t<r){const o=e.charCodeAt(t++);(o&64512)==56320?u.push(((n&1023)<<10)+(o&1023)+65536):(u.push(n),t--)}else u.push(n)}return u}const To=e=>String.fromCodePoint(...e),Io=function(e){return e>=48&&e<58?26+(e-48):e>=65&&e<91?e-65:e>=97&&e<123?e-97:K},At=function(e,u){return e+22+75*(e<26)-((u!=0)<<5)},Ft=function(e,u,t){let r=0;for(e=t?Q(e/Eo):e>>1,e+=Q(e/u);e>cu*we>>1;r+=K)e=Q(e/cu);return Q(r+(cu+1)*e/(e+Co))},Nt=function(e){const u=[],t=e.length;let r=0,n=_t,o=wt,c=e.lastIndexOf(Ct);c<0&&(c=0);for(let s=0;s<c;++s)e.charCodeAt(s)>=128&&ue("not-basic"),u.push(e.charCodeAt(s));for(let s=c>0?c+1:0;s<t;){const l=r;for(let d=1,p=K;;p+=K){s>=t&&ue("invalid-input");const b=Io(e.charCodeAt(s++));b>=K&&ue("invalid-input"),b>Q((le-r)/d)&&ue("overflow"),r+=b*d;const h=p<=o?au:p>=o+we?we:p-o;if(b<h)break;const f=K-h;d>Q(le/f)&&ue("overflow"),d*=f}const i=u.length+1;o=Ft(r-l,i,l==0),Q(r/i)>le-n&&ue("overflow"),n+=Q(r/i),r%=i,u.splice(r++,0,n)}return String.fromCodePoint(...u)},St=function(e){const u=[];e=Dt(e);const t=e.length;let r=_t,n=0,o=wt;for(const l of e)l<128&&u.push(su(l));const c=u.length;let s=c;for(c&&u.push(Ct);s<t;){let l=le;for(const d of e)d>=r&&d<l&&(l=d);const i=s+1;l-r>Q((le-n)/i)&&ue("overflow"),n+=(l-r)*i,r=l;for(const d of e)if(d<r&&++n>le&&ue("overflow"),d===r){let p=n;for(let b=K;;b+=K){const h=b<=o?au:b>=o+we?we:b-o;if(p<h)break;const f=p-h,v=K-h;u.push(su(At(h+f%v,0))),p=Q(f/v)}u.push(su(At(p,0))),o=Ft(n,i,s===c),n=0,++s}++n,++r}return u.join("")},Tt={version:"2.3.1",ucs2:{decode:Dt,encode:To},decode:Nt,encode:St,toASCII:function(e){return Et(e,function(u){return Ao.test(u)?"xn--"+St(u):u})},toUnicode:function(e){return Et(e,function(u){return Do.test(u)?Nt(u.slice(4).toLowerCase()):u})}},Mo={default:{options:{html:!1,xhtmlOut:!1,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"\u201C\u201D\u2018\u2019",highlight:null,maxNesting:100},components:{core:{},block:{},inline:{}}},zero:{options:{html:!1,xhtmlOut:!1,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"\u201C\u201D\u2018\u2019",highlight:null,maxNesting:20},components:{core:{rules:["normalize","block","inline","text_join"]},block:{rules:["paragraph"]},inline:{rules:["text"],rules2:["balance_pairs","fragments_join"]}}},commonmark:{options:{html:!0,xhtmlOut:!0,breaks:!1,langPrefix:"language-",linkify:!1,typographer:!1,quotes:"\u201C\u201D\u2018\u2019",highlight:null,maxNesting:20},components:{core:{rules:["normalize","block","inline","text_join"]},block:{rules:["blockquote","code","fence","heading","hr","html_block","lheading","list","reference","paragraph"]},inline:{rules:["autolink","backticks","emphasis","entity","escape","html_inline","image","link","newline","text"],rules2:["balance_pairs","emphasis","fragments_join"]}}}},Lo=/^(vbscript|javascript|file|data):/,$o=/^data:image\\/(gif|png|jpeg|webp);/;function Po(e){const u=e.trim().toLowerCase();return Lo.test(u)?$o.test(u):!0}const It=["http:","https:","mailto:"];function Bo(e){const u=Ge(e,!0);if(u.hostname&&(!u.protocol||It.indexOf(u.protocol)>=0))try{u.hostname=Tt.toASCII(u.hostname)}catch{}return be(We(u))}function Oo(e){const u=Ge(e,!0);if(u.hostname&&(!u.protocol||It.indexOf(u.protocol)>=0))try{u.hostname=Tt.toUnicode(u.hostname)}catch{}return ae(We(u),ae.defaultChars+"%")}function V(e,u){if(!(this instanceof V))return new V(e,u);u||Qe(e)||(u=e||{},e="default"),this.inline=new ke,this.block=new Oe,this.core=new eu,this.renderer=new se,this.linkify=new H,this.validateLink=Po,this.normalizeLink=Bo,this.normalizeLinkText=Oo,this.utils=Jn,this.helpers=Me({},Rn),this.options={},this.configure(e),u&&this.set(u)}V.prototype.set=function(e){return Me(this.options,e),this},V.prototype.configure=function(e){const u=this;if(Qe(e)){const t=e;if(e=Mo[t],!e)throw new Error(\'Wrong `markdown-it` preset "\'+t+\'", check name\')}if(!e)throw new Error("Wrong `markdown-it` preset, can\'t be empty");return e.options&&u.set(e.options),e.components&&Object.keys(e.components).forEach(function(t){e.components[t].rules&&u[t].ruler.enableOnly(e.components[t].rules),e.components[t].rules2&&u[t].ruler2.enableOnly(e.components[t].rules2)}),this},V.prototype.enable=function(e,u){let t=[];Array.isArray(e)||(e=[e]),["core","block","inline"].forEach(function(n){t=t.concat(this[n].ruler.enable(e,!0))},this),t=t.concat(this.inline.ruler2.enable(e,!0));const r=e.filter(function(n){return t.indexOf(n)<0});if(r.length&&!u)throw new Error("MarkdownIt. Failed to enable unknown rule(s): "+r);return this},V.prototype.disable=function(e,u){let t=[];Array.isArray(e)||(e=[e]),["core","block","inline"].forEach(function(n){t=t.concat(this[n].ruler.disable(e,!0))},this),t=t.concat(this.inline.ruler2.disable(e,!0));const r=e.filter(function(n){return t.indexOf(n)<0});if(r.length&&!u)throw new Error("MarkdownIt. Failed to disable unknown rule(s): "+r);return this},V.prototype.use=function(e){const u=[this].concat(Array.prototype.slice.call(arguments,1));return e.apply(e,u),this},V.prototype.parse=function(e,u){if(typeof e!="string")throw new Error("Input data should be a String");const t=new this.core.State(e,this,u);return this.core.process(t),t.tokens},V.prototype.render=function(e,u){return u=u||{},this.renderer.render(this.parse(e,u),this.options,u)},V.prototype.parseInline=function(e,u){const t=new this.core.State(e,this,u);return t.inlineMode=!0,this.core.process(t),t.tokens},V.prototype.renderInline=function(e,u){return u=u||{},this.renderer.render(this.parseInline(e,u),this.options,u)};const lu=/(?:[a-zA-Z]:)?[/\\\\](?:[\\w\\-. ]+[/\\\\])+[\\w\\-. ]+\\.(tsx?|jsx?|css|scss|json|md|py|java|go|rs|c|cpp|h|hpp|sh|yaml|yml|toml|xml|html|vue|svelte)/gi,iu=/(?:[a-zA-Z]:)?[/\\\\](?:[\\w\\-. ]+[/\\\\])+[\\w\\-. ]+\\.(tsx?|jsx?|css|scss|json|md|py|java|go|rs|c|cpp|h|hpp|sh|yaml|yml|toml|xml|html|vue|svelte)#(\\d+)(?:-(\\d+))?/gi,zo=/\\.(tsx?|jsx?|css|scss|json|md|py|java|go|rs|c|cpp|h|hpp|sh|ya?ml|toml|xml|html|vue|svelte)$/i,_e=/^file:\\/\\//i,jo=/file:\\/\\//i,qo=/^(?:https?|mailto|ftp|data):/i,du=e=>{const u=e.indexOf("#");if(u<0)return{filePath:e};const r=e.slice(u+1).match(/^L?(\\d+)(?:-\\d+)?$/i);return{filePath:e.slice(0,u),line:r?parseInt(r[1],10):void 0}},fu=(e,u)=>u===void 0?e:e+":"+u,Mt=e=>{try{return decodeURIComponent(e)}catch{return e}},Lt=e=>{if(!_e.test(e))return;const{filePath:u,line:t}=du(e);let r;try{r=new URL(u)}catch{return}if(r.protocol.toLowerCase()!=="file:")return;const n=r.hostname.toLowerCase();if(n!==""&&n!=="localhost")return;const o=Mt(r.pathname).replace(/\\\\/g,"/"),c=r.pathname.replace(/%2f/gi,"/").replace(/%5c/gi,"\\\\").replace(/\\\\/g,"/");return o.startsWith("//")||c.startsWith("//")?void 0:{filePath:o.length>1&&/^[a-zA-Z]:\\//.test(o.slice(1))?o.slice(1):o,line:t}},$t=e=>Lt(e)!==void 0,Pt=e=>qo.test(e)||_e.test(e),Bt=e=>{const u=Lt(e);if(u)return fu(u.filePath,u.line);const{filePath:t,line:r}=du(e),n=Mt(t).replace(/\\\\/g,"/");return fu(n,r)},Ho=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/\'/g,"&#039;"),Zo=()=>{const e=new V({html:!1,xhtmlOut:!1,breaks:!0,linkify:!0,typographer:!0}),u=e.validateLink;return e.validateLink=t=>_e.test(t)?$t(t):u(t),e},Ce=({content:e,onFileClick:u,enableFileLinks:t=!0})=>{const r=C.useMemo(()=>Zo(),[]),n=l=>{if(typeof document>"u")return l;const i=new RegExp(lu.source,lu.flags.replace("g","")),d=new RegExp(iu.source,iu.flags.replace("g","")),p=/[\\w\\-. ]+\\.(tsx?|jsx?|css|scss|json|md|py|java|go|rs|c|cpp|h|hpp|sh|ya?ml|toml|xml|html|vue|svelte)/i,b=document.createElement("div");b.innerHTML=l;const h=new RegExp(`${iu.source}|${lu.source}|${p.source}`,"gi"),f=g=>{const{filePath:k,line:y}=du(g);return{displayText:g,dataPath:y===void 0?g:fu(k,y)}},v=g=>{const k=document.createElement("a"),{dataPath:y}=f(g);return k.className="file-path-link",k.textContent=g,k.setAttribute("href","#"),k.setAttribute("title",`Open ${g}`),k.setAttribute("data-file-path",y),k},m=g=>p.test(g)||/[/\\\\]/.test(g)?!1:/^[a-zA-Z_$][\\w$]*(\\.[a-zA-Z_$][\\w$]*)+$/.test(g),D=g=>{const k=g.getAttribute("href")||"",y=(g.textContent||"").trim();if(k.match(/^https?:\\/\\/(.+)$/i))try{const F=new URL(k),E=F.hostname||"",A=F.pathname||"",N=A===""||A==="/";if(N&&p.test(y)&&E.toLowerCase()===y.toLowerCase()){const{dataPath:T}=f(y);g.classList.add("file-path-link"),g.setAttribute("href","#"),g.setAttribute("title",`Open ${y}`),g.setAttribute("data-file-path",T);return}if(N&&p.test(E)){const{dataPath:T}=f(E);g.classList.add("file-path-link"),g.setAttribute("href","#"),g.setAttribute("title",`Open ${y||E}`),g.setAttribute("data-file-path",T);return}}catch{}if(Pt(k))return;const S=k||y;if(!m(S)){if(d.test(S)||i.test(S)){const{dataPath:F}=f(S);g.classList.add("file-path-link"),g.setAttribute("href","#"),g.setAttribute("title",`Open ${y||k}`),g.setAttribute("data-file-path",F);return}if(p.test(S)){const{dataPath:F}=f(S);g.classList.add("file-path-link"),g.setAttribute("href","#"),g.setAttribute("title",`Open ${y||k}`),g.setAttribute("data-file-path",F)}}},w=g=>{if(g.nodeType===Node.ELEMENT_NODE){const k=g;if(k.tagName.toLowerCase()==="a"){D(k);return}const y=k.tagName.toLowerCase();if(y==="code"||y==="pre")return}for(let k=g.firstChild;k;){const y=k.nextSibling;if(k.nodeType===Node.TEXT_NODE){const _=k.nodeValue||"";if(jo.test(_)){k=y;continue}h.lastIndex=0;const S=h.test(_);if(h.lastIndex=0,S){const F=document.createDocumentFragment();let E=0,A;for(;A=h.exec(_);){const N=A[0],T=A.index;if(m(N)){T>E&&F.appendChild(document.createTextNode(_.slice(E,T))),F.appendChild(document.createTextNode(N)),E=T+N.length;continue}T>E&&F.appendChild(document.createTextNode(_.slice(E,T))),F.appendChild(v(N)),E=T+N.length}E<_.length&&F.appendChild(document.createTextNode(_.slice(E))),g.replaceChild(F,k)}}else k.nodeType===Node.ELEMENT_NODE&&w(k);k=y}};return w(b),b.innerHTML},o=l=>{if(typeof document>"u"||!l.toLowerCase().includes("file:"))return l;const i=document.createElement("div");i.innerHTML=l;for(const d of Array.from(i.querySelectorAll("img")))_e.test(d.getAttribute("src")||"")&&d.replaceWith(document.createTextNode(d.alt));return i.innerHTML},c=C.useMemo(()=>{try{let l=o(r.render(e));return t&&(l=n(l)),l}catch(l){return console.error("Error rendering markdown:",l),Ho(e)}},[e,t,r]),s=C.useCallback(l=>{const i=l.target;if(!i)return;const d=i.closest&&i.closest("a.file-path-link");if(d){const D=d.getAttribute("data-file-path");if(!D)return;l.preventDefault(),l.stopPropagation(),u==null||u(D);return}const p=i.closest&&i.closest("a");if(!p)return;const b=p.getAttribute("href")||"";if(_e.test(b)){l.preventDefault(),l.stopPropagation(),$t(b)&&(u==null||u(Bt(b)));return}if(Pt(b))return;const h=(p.textContent||"").trim(),f=Bt(b||h),v=/^(?:[a-zA-Z]:[/\\\\]|[/\\\\])/i.test(f),m=!v&&zo.test(f.replace(/:\\d+(?::\\d+)?$/,""));(v||m)&&u&&(l.preventDefault(),l.stopPropagation(),u(f))},[u]);return a.jsx("div",{className:"markdown-content",onClick:s,dangerouslySetInnerHTML:{__html:c},style:{wordWrap:"break-word",overflowWrap:"break-word",whiteSpace:"normal"}})},Ot=({content:e,onFileClick:u,enableFileLinks:t})=>a.jsx(Ce,{content:e,onFileClick:u,enableFileLinks:t});Ot.displayName="MessageContent";const ie=C.memo(Ot),pu="--- Content from referenced files ---",zt="--- End of content ---",Vo=/^Content from @([^\\n:]+):\\n?/m;function jt(e){const u=[],t=e.indexOf(pu),r=e.indexOf(zt);if(t===-1)return[{type:"text",content:e}];const n=e.substring(0,t).trim();n&&u.push({type:"text",content:n});const c=(r!==-1?e.substring(t+pu.length,r):e.substring(t+pu.length)).split(/(?=\\nContent from @)/);for(const s of c){const l=s.trim();if(!l)continue;const i=l.match(Vo);if(i){const d=i[1].trim(),p=d.split("/").pop()||d,b=l.substring(i[0].length);u.push({type:"file_reference",content:b.trim(),filePath:d,fileName:p})}else l&&!l.startsWith("Content from @")&&u.push({type:"file_reference",content:l})}if(r!==-1){const s=e.substring(r+zt.length).trim();s&&u.push({type:"text",content:s})}return u}const Uo=({segment:e,onFileClick:u,defaultExpanded:t=!1})=>{const[r,n]=ne(t),o=C.useMemo(()=>e.content.split(`\n`).length,[e.content]),c=()=>{n(!r)},s=()=>{e.filePath&&u&&u(e.filePath)};return a.jsxs("div",{className:"rounded-md overflow-hidden",style:{border:"1px solid var(--app-input-border)",backgroundColor:"var(--app-secondary-background)"},children:[a.jsxs("button",{type:"button",className:"flex items-center gap-1.5 w-full py-1.5 px-2.5 bg-transparent border-none cursor-pointer text-left text-xs transition-colors duration-150 hover:bg-black/5",style:{color:"var(--app-secondary-foreground)"},onClick:c,"aria-expanded":r,children:[a.jsx("span",{className:"text-[8px] flex-shrink-0 transition-transform duration-200",style:{color:"var(--app-secondary-foreground)",transform:r?"rotate(90deg)":"rotate(0deg)"},children:"\u25B6"}),a.jsx("span",{className:"text-sm flex-shrink-0",children:"\u{1F4C4}"}),a.jsx("span",{className:"font-medium cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0 hover:underline",style:{color:"var(--app-link-color, #0066cc)"},onClick:l=>{l.stopPropagation(),s()},title:e.filePath,children:e.fileName||"Referenced file"}),a.jsxs("span",{className:"text-[11px] flex-shrink-0 ml-auto",style:{color:"var(--app-tertiary-foreground, #999)"},children:[o," ",o===1?"line":"lines"]})]}),r&&a.jsx("div",{className:"py-2 px-2.5 max-h-[300px] overflow-y-auto text-xs leading-normal",style:{borderTop:"1px solid var(--app-input-border)",backgroundColor:"var(--app-primary-background)"},children:a.jsx(ie,{content:e.content,onFileClick:u,enableFileLinks:!0})})]})},qt=({content:e,onFileClick:u,enableFileLinks:t=!1})=>{const r=C.useMemo(()=>jt(e),[e]);return r.length===1&&r[0].type==="text"?a.jsx(ie,{content:e,onFileClick:u,enableFileLinks:t}):a.jsx("div",{className:"flex flex-col gap-2",children:r.map((n,o)=>n.type==="text"?a.jsx("div",{children:a.jsx(ie,{content:n.content,onFileClick:u,enableFileLinks:t})},o):a.jsx(Uo,{segment:n,onFileClick:u,defaultExpanded:!1},o))})};/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Status and state related icons\n */const Wo=({size:e=14,className:u,...t})=>a.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 14 14",fill:"none",width:e,height:e,className:u,"aria-hidden":"true",...t,children:[a.jsx("circle",{cx:"7",cy:"7",r:"6",fill:"currentColor",opacity:"0.2"}),a.jsx("path",{d:"M4 7.5L6 9.5L10 4.5",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})]}),Go=({size:e=14,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 14 14",fill:"none",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("circle",{cx:"7",cy:"7",r:"5",fill:"none",stroke:"currentColor",strokeWidth:"2.5"})}),Xo=({size:e=14,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 14 14",fill:"none",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("circle",{cx:"7",cy:"7",r:"5.5",fill:"none",stroke:"currentColor",strokeWidth:"1"})}),Jo=({size:e=20,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{fillRule:"evenodd",d:"M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",clipRule:"evenodd"})}),Ko=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"})}),Qo=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M8 1a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 7.293V1.5A.5.5 0 0 1 8 1Z"})}),Yo=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5Z"})}),Ro=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{fillRule:"evenodd",d:"M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z",clipRule:"evenodd"})});function Ht(e){return typeof e!="number"||!Number.isFinite(e)||e<=0?null:new Date(e)}function ea(e){const u=Ht(e);return u?u.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):null}function ua(e){const u=Ht(e);if(!u)return;const t=u.getHours().toString().padStart(2,"0"),r=u.getMinutes().toString().padStart(2,"0");return`${t}:${r}`}const Zt=({timestamp:e,copyText:u,onEdit:t,editDisabled:r=!1,editIcon:n})=>{var f;const o=re(),c=o.copyToClipboard,[s,l]=C.useState(!1),i=C.useRef(null),d=ea(e),p=((f=o.features)==null?void 0:f.canCopy)!==!1&&u.length>0,b=ua(e);C.useEffect(()=>()=>{i.current!==null&&window.clearTimeout(i.current)},[]);const h=C.useCallback(async v=>{if(v.stopPropagation(),!!p)try{c?await c(u):await navigator.clipboard.writeText(u),l(!0),i.current!==null&&window.clearTimeout(i.current),i.current=window.setTimeout(()=>{l(!1),i.current=null},1400)}catch(m){console.error("Failed to copy message:",m)}},[p,u,c]);return!d&&!p&&!t?null:a.jsxs("div",{className:"mt-1 flex min-h-6 items-center gap-1 text-xs text-[var(--app-secondary-foreground)]",children:[d&&a.jsx("time",{className:"select-none opacity-60",dateTime:b,children:d}),a.jsxs("div",{className:`flex items-center gap-0.5 transition-opacity focus-within:opacity-100 ${s?"opacity-100":"opacity-0 group-hover:opacity-70"}`,children:[p&&a.jsx("button",{type:"button",className:`inline-flex h-6 w-6 items-center justify-center rounded-sm border border-transparent bg-transparent transition-colors hover:bg-[var(--app-ghost-button-hover-background)] hover:opacity-100 focus:opacity-100 ${s?"text-[#74c991] opacity-100":""}`,title:s?"Copied":"Copy message","aria-label":s?"Copied":"Copy message",onClick:h,children:s?a.jsx(Ro,{size:14}):a.jsx(Kr,{size:14})}),t&&a.jsx("button",{type:"button",className:"inline-flex h-6 w-6 items-center justify-center rounded-sm border border-transparent bg-transparent transition-colors hover:bg-[var(--app-ghost-button-hover-background)] hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-30",title:"Edit message","aria-label":"Edit message",onClick:t,disabled:r,children:n})]})]})},Vt=({content:e,timestamp:u,onFileClick:t,fileContext:r,onEdit:n,editDisabled:o=!1})=>{const s=(()=>{if(!r)return null;const{fileName:l,startLine:i,endLine:d}=r;return i!=null?d!=null&&d!==i?`${l}#${i}-${d}`:`${l}#${i}`:l})();return a.jsxs("div",{className:"qwen-message user-message-container group flex gap-0 my-1 items-start text-left flex-col relative",style:{position:"relative"},children:[a.jsx("div",{className:"inline-block relative whitespace-pre-wrap rounded-md max-w-full overflow-x-auto overflow-y-hidden select-text leading-[1.5]",style:{border:"1px solid var(--app-input-border)",borderRadius:"var(--corner-radius-medium)",backgroundColor:"var(--app-input-background)",padding:"4px 6px",color:"var(--app-primary-foreground)"},children:a.jsx(qt,{content:e,onFileClick:t,enableFileLinks:!1})}),a.jsx(Zt,{timestamp:u,copyText:e,onEdit:n,editDisabled:o,editIcon:a.jsx(Ue,{size:14})}),s&&a.jsx("div",{className:"mt-1",children:a.jsx("button",{type:"button",className:"inline-flex items-center py-0 pr-2 gap-1 rounded-sm cursor-pointer relative opacity-50 bg-transparent border-none",onClick:()=>r&&(t==null?void 0:t(r.filePath)),disabled:!t,children:a.jsx("span",{title:s,style:{fontSize:"12px",color:"var(--app-secondary-foreground)"},children:s})})})]})};Vt.displayName="UserMessage";const Ut=C.memo(Vt);/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * File and document related icons\n */const ta=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M9 2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7l-5-5zm3 7V3.5L10.5 2H10v3a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V2H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1zM6 3h3v2H6V3z"})}),ra=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M5 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Z"})}),na=({size:e=16,className:u,...t})=>a.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round",width:e,height:e,className:u,"aria-hidden":"true",...t,children:[a.jsx("path",{d:"M2.66663 2.66663H10.6666L13.3333 5.33329V13.3333H2.66663V2.66663Z"}),a.jsx("path",{d:"M8 10.6666V8M8 8V5.33329M8 8H10.6666M8 8H5.33329"})]}),oa=({size:e=16,className:u,...t})=>a.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 16 16",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:a.jsx("path",{d:"M1.5 3A1.5 1.5 0 0 1 3 1.5h3.086a1.5 1.5 0 0 1 1.06.44L8.5 3H13A1.5 1.5 0 0 1 14.5 4.5v7A1.5 1.5 0 0 1 13 13H3A1.5 1.5 0 0 1 1.5 11.5v-8Z"})});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Special UI icons\n */const aa=({size:e=16,className:u,enabled:t=!1,style:r,...n})=>a.jsx("svg",{width:e,height:e,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:u,"aria-hidden":"true",...n,children:a.jsx("path",{d:"M8.00293 1.11523L8.35059 1.12402H8.35352C11.9915 1.30834 14.8848 4.31624 14.8848 8C14.8848 11.8025 11.8025 14.8848 8 14.8848C4.19752 14.8848 1.11523 11.8025 1.11523 8C1.11523 7.67691 1.37711 7.41504 1.7002 7.41504C2.02319 7.41514 2.28516 7.67698 2.28516 8C2.28516 11.1563 4.84369 13.7148 8 13.7148C11.1563 13.7148 13.7148 11.1563 13.7148 8C13.7148 4.94263 11.3141 2.4464 8.29492 2.29297V2.29199L7.99609 2.28516H7.9873V2.28418L7.89648 2.27539L7.88281 2.27441V2.27344C7.61596 2.21897 7.41513 1.98293 7.41504 1.7002C7.41504 1.37711 7.67691 1.11523 8 1.11523H8.00293ZM8 3.81543C8.32309 3.81543 8.58496 4.0773 8.58496 4.40039V7.6377L10.9619 8.82715C11.2505 8.97169 11.3678 9.32256 11.2236 9.61133C11.0972 9.86425 10.8117 9.98544 10.5488 9.91504L10.5352 9.91211V9.91016L10.4502 9.87891L10.4385 9.87402V9.87305L7.73828 8.52344C7.54007 8.42433 7.41504 8.22155 7.41504 8V4.40039C7.41504 4.0773 7.67691 3.81543 8 3.81543ZM2.44336 5.12695C2.77573 5.19517 3.02597 5.48929 3.02637 5.8418C3.02637 6.19456 2.7761 6.49022 2.44336 6.55859L2.2959 6.57324C1.89241 6.57324 1.56543 6.24529 1.56543 5.8418C1.56588 5.43853 1.89284 5.1123 2.2959 5.1123L2.44336 5.12695ZM3.46094 2.72949C3.86418 2.72984 4.19017 3.05712 4.19043 3.45996V3.46094C4.19009 3.86393 3.86392 4.19008 3.46094 4.19043H3.45996C3.05712 4.19017 2.72983 3.86419 2.72949 3.46094V3.45996C2.72976 3.05686 3.05686 2.72976 3.45996 2.72949H3.46094ZM5.98926 1.58008C6.32235 1.64818 6.57324 1.94276 6.57324 2.2959L6.55859 2.44336C6.49022 2.7761 6.19456 3.02637 5.8418 3.02637C5.43884 3.02591 5.11251 2.69895 5.1123 2.2959L5.12695 2.14844C5.19504 1.81591 5.48906 1.56583 5.8418 1.56543L5.98926 1.58008Z",strokeWidth:"0.27",style:{stroke:t?"var(--app-qwen-ivory)":"var(--app-secondary-foreground)",fill:t?"var(--app-qwen-ivory)":"var(--app-secondary-foreground)",...r}})}),ca=({size:e=20,className:u,...t})=>a.jsxs("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor",width:e,height:e,className:u,"aria-hidden":"true",...t,children:[a.jsx("path",{fillRule:"evenodd",d:"M5.14648 7.14648C5.34175 6.95122 5.65825 6.95122 5.85352 7.14648L8.35352 9.64648C8.44728 9.74025 8.5 9.86739 8.5 10C8.5 10.0994 8.47037 10.1958 8.41602 10.2773L8.35352 10.3535L5.85352 12.8535C5.65825 13.0488 5.34175 13.0488 5.14648 12.8535C4.95122 12.6583 4.95122 12.3417 5.14648 12.1465L7.29297 10L5.14648 7.85352C4.95122 7.65825 4.95122 7.34175 5.14648 7.14648Z",clipRule:"evenodd"}),a.jsx("path",{d:"M14.5 12C14.7761 12 15 12.2239 15 12.5C15 12.7761 14.7761 13 14.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H14.5Z"}),a.jsx("path",{fillRule:"evenodd",d:"M16.5 4C17.3284 4 18 4.67157 18 5.5V14.5C18 15.3284 17.3284 16 16.5 16H3.5C2.67157 16 2 15.3284 2 14.5V5.5C2 4.67157 2.67157 4 3.5 4H16.5ZM3.5 5C3.22386 5 3 5.22386 3 5.5V14.5C3 14.7761 3.22386 15 3.5 15H16.5C16.7761 15 17 14.7761 17 14.5V5.5C17 5.22386 16.7761 5 16.5 5H3.5Z",clipRule:"evenodd"})]}),Wt=({content:e,timestamp:u,onFileClick:t,defaultExpanded:r=!1,status:n="default"})=>{const[o,c]=ne(r),s=()=>{c(!o)};return a.jsx("div",{className:`qwen-message message-item thinking-message thinking-status-${n}`,children:a.jsxs("div",{className:"thinking-content-wrapper",children:[a.jsxs("button",{type:"button",onClick:s,className:"thinking-toggle-btn","aria-expanded":o,"aria-label":o?"Collapse thinking":"Expand thinking",children:[a.jsx("span",{className:"thinking-label",children:"Thinking"}),a.jsx(jr,{size:12,direction:o?"up":"down",className:"thinking-chevron"})]}),o&&a.jsx("div",{className:"thinking-content",children:a.jsx(ie,{content:e,onFileClick:t})})]})})};Wt.displayName="ThinkingMessage";const Gt=C.memo(Wt),Xt=({content:e,timestamp:u,onFileClick:t,status:r="default",hideStatusIcon:n=!1,isFirst:o=!1,isLast:c=!1})=>{if(!e||e.trim().length===0)return null;const s=()=>{if(n)return"";switch(r){case"success":return"assistant-message-success";case"error":return"assistant-message-error";case"warning":return"assistant-message-warning";case"loading":return"assistant-message-loading";default:return"assistant-message-default"}};return a.jsx("div",{className:`qwen-message message-item assistant-message-container group ${s()}`,"data-first":o,"data-last":c,style:{width:"100%",alignItems:"flex-start",paddingLeft:"30px",userSelect:"text",position:"relative"},children:a.jsxs("span",{style:{width:"100%"},children:[a.jsx("div",{style:{margin:0,width:"100%",wordWrap:"break-word",overflowWrap:"break-word",whiteSpace:"normal"},children:a.jsx(ie,{content:e,onFileClick:t,enableFileLinks:!1})}),a.jsx(Zt,{timestamp:u,copyText:e})]})})};Xt.displayName="AssistantMessage";const Jt=C.memo(Xt);/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const sa=e=>Math.max(0,Math.min(100,Math.round(e))),la=({stage:e,progress:u,detail:t})=>{const r=sa(u);return a.jsx("div",{className:"w-full px-[30px] py-2",children:a.jsxs("div",{className:"grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1",children:[a.jsx("div",{className:"min-w-0 truncate text-sm leading-6 text-[var(--vscode-foreground)]",children:e}),a.jsxs("div",{className:"row-span-2 shrink-0 self-center text-xs leading-none tabular-nums text-[var(--vscode-descriptionForeground)]",children:[r,"%"]}),t?a.jsx("div",{className:"min-w-0 truncate text-xs leading-5 text-[var(--vscode-descriptionForeground)]",children:t}):a.jsx("div",{className:"text-xs leading-5 text-[var(--vscode-descriptionForeground)]",children:"Processing your chat history\u2026"})]})})},ia=({questions:e,onSubmit:u,onCancel:t})=>{const[r,n]=C.useState(0),[o,c]=C.useState({}),[s,l]=C.useState(!1),i=C.useRef(null),d=C.useRef(null),p=e.length>1,b=p?e.length+1:e.length,h=p&&r===b-1,f=h?null:e[r],v=(f==null?void 0:f.multiSelect)??!1,m=o[r]||{},D=C.useCallback(E=>{const A=e[E],N=o[E];if(N){if(A!=null&&A.multiSelect){const T=[...N.multiSelectedOptions||[]],L=(N.customInput||"").trim();return N.customInputChecked&&L&&T.push(L),T.length>0?T.join(", "):void 0}return N.customInput&&N.customInput.trim()&&!(A==null?void 0:A.options.some(L=>{var I;return L.label===((I=N.customInput)==null?void 0:I.trim())}))?N.customInput.trim():N.selectedOption}},[e,o]),w=C.useCallback(()=>{const E={};e.forEach((A,N)=>{const T=D(N);T!==void 0&&(E[N]=T)}),u(E)},[e,u,D]),g=C.useCallback(()=>{if(!f)return;const E=o[r]||{},A=[...E.multiSelectedOptions||[]],N=(E.customInput||"").trim();if(E.customInputChecked&&N&&A.push(N),A.length===0)return;const T=A.join(", "),L={...o,[r]:{...E,selectedOption:T}};c(L),p?r<b-1&&(n(r+1),l(!1)):u({[r]:T})},[f,o,r,p,b,u]),k=C.useCallback(E=>{if(f)if(v){const A=o[r]||{},N=A.multiSelectedOptions||[],T=f.options[E],I=N.includes(T.label)?N.filter(z=>z!==T.label):[...N,T.label];c({...o,[r]:{...A,multiSelectedOptions:I}})}else{const A=f.options[E],T={...o[r]||{},selectedOption:A.label,customInput:void 0};c({...o,[r]:T}),p?r<b-1&&(n(r+1),l(!1)):u({[r]:A.label})}},[f,v,o,r,p,b,u]),y=E=>{const A=o[r]||{};c({...o,[r]:{...A,customInput:E,customInputChecked:v&&E.trim().length>0}})},_=()=>{var A;const E=((A=m.customInput)==null?void 0:A.trim())||"";if(E)if(v){const N=o[r]||{};c({...o,[r]:{...N,customInputChecked:!N.customInputChecked}})}else{const T={...o[r]||{},selectedOption:E};c({...o,[r]:T}),p?r<b-1&&(n(r+1),l(!1)):u({[r]:E})}};C.useEffect(()=>{const E=A=>{A.key==="Escape"&&(A.preventDefault(),t())};return window.addEventListener("keydown",E),()=>window.removeEventListener("keydown",E)},[t]),C.useEffect(()=>{s&&d.current&&d.current.focus()},[s]),C.useEffect(()=>{l(!1)},[r]);const S=()=>a.jsxs("div",{className:"flex gap-2 mb-4 overflow-x-auto",children:[e.map((E,A)=>{const N=D(A)!==void 0,T=A===r;return a.jsxs("button",{className:`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors border-none ${T?"bg-[var(--app-button-background)] text-[var(--app-button-foreground)] font-bold":"bg-[var(--app-button-secondary-background)] text-[var(--app-secondary-foreground)] hover:opacity-80"}`,onClick:()=>n(A),children:[a.jsx("span",{children:E.header}),N&&a.jsx("span",{className:"text-green-500",children:"\u2713"})]},A)}),a.jsx("button",{className:`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors border-none ${h?"bg-[var(--app-button-background)] text-[var(--app-button-foreground)] font-bold":"bg-[var(--app-button-secondary-background)] text-[var(--app-secondary-foreground)] opacity-60 hover:opacity-80"}`,onClick:()=>n(b-1),children:a.jsx("span",{children:"Submit"})})]}),F={backgroundColor:"var(--app-input-secondary-background)",borderColor:"var(--app-input-border)",boxShadow:"0 4px 12px rgba(0, 0, 0, 0.15)"};return h?a.jsxs("div",{ref:i,className:"fixed inset-x-4 bottom-4 z-[1000] rounded-lg border p-4 outline-none animate-slide-up",style:F,children:[S(),a.jsxs("div",{className:"mb-4",children:[a.jsx("div",{className:"font-bold text-[var(--app-primary-foreground)] mb-2",children:"Your answers:"}),e.map((E,A)=>{const N=D(A);return a.jsxs("div",{className:"ml-2 mb-1 text-[var(--app-secondary-foreground)]",children:[a.jsxs("span",{className:"font-semibold",children:[E.header,":"]})," ",N?a.jsx("span",{style:{color:"var(--app-link-color)"},children:N}):a.jsx("span",{className:"opacity-60",children:"(not answered)"})]},A)})]}),a.jsxs("div",{className:"flex gap-2 mt-4",children:[a.jsx("button",{className:"px-4 py-2 rounded-md font-medium transition-colors cursor-pointer border-none",style:{backgroundColor:"var(--app-button-background)",color:"var(--app-button-foreground)"},onClick:w,children:"Submit"}),a.jsx("button",{className:"px-4 py-2 rounded-md font-medium transition-colors cursor-pointer border-none hover:opacity-80",style:{backgroundColor:"var(--app-button-secondary-background)",color:"var(--app-primary-foreground)"},onClick:t,children:"Cancel"})]})]}):a.jsxs("div",{ref:i,className:"fixed inset-x-4 bottom-4 z-[1000] rounded-lg border p-4 outline-none animate-slide-up",style:F,children:[p&&S(),a.jsxs("div",{className:"mb-4",children:[!p&&a.jsx("div",{className:"mb-2",children:a.jsx("span",{className:"font-bold text-lg",style:{color:"var(--app-link-color)"},children:f.header})}),a.jsx("div",{className:"text-[var(--app-primary-foreground)] text-base",children:f.question})]}),a.jsxs("div",{className:"flex flex-col gap-2 mb-3",children:[f.options.map((E,A)=>{var L;const N=!v&&m.selectedOption===E.label,T=v&&((L=m.multiSelectedOptions)==null?void 0:L.includes(E.label));return a.jsxs("div",{className:"flex flex-col",children:[a.jsxs("button",{className:`flex items-center gap-2 px-3 py-2 text-left w-full rounded-md border transition-colors duration-150 cursor-pointer ${N||T?"bg-[var(--app-list-active-background)] text-[var(--app-list-active-foreground)]":"bg-[var(--app-button-secondary-background)] text-[var(--app-primary-foreground)] hover:bg-[var(--app-list-active-background)] hover:text-[var(--app-list-active-foreground)]"}`,onClick:()=>k(A),children:[v?a.jsx("span",{className:"min-w-[18px]",children:T?"\u2611":"\u2610"}):a.jsx("span",{className:"min-w-[18px]",children:N?"\u25CF":"\u25CB"}),a.jsx("span",{className:"flex-1",children:E.label})]}),E.description&&a.jsx("div",{className:"ml-8 mt-1 text-sm opacity-70",style:{color:"var(--app-secondary-foreground)"},children:E.description})]},A)}),a.jsx("div",{className:"flex flex-col",children:s?a.jsxs("div",{className:"flex items-center gap-2",children:[v&&a.jsx("span",{className:"min-w-[18px] cursor-pointer",onClick:()=>{const E=o[r]||{};c({...o,[r]:{...E,customInputChecked:!E.customInputChecked}})},children:m.customInputChecked?"\u2611":"\u2610"}),a.jsx("input",{ref:d,type:"text",className:"flex-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-1",style:{backgroundColor:"var(--app-input-background)",borderColor:"var(--app-input-border)",color:"var(--app-primary-foreground)"},value:m.customInput||"",onChange:E=>y(E.target.value),onKeyDown:E=>{E.key==="Enter"&&(E.preventDefault(),E.stopPropagation(),_())},placeholder:"Type your answer..."})]}):a.jsxs("button",{className:`flex items-center gap-2 px-3 py-2 text-left w-full rounded-md border transition-colors duration-150 cursor-pointer\n                bg-[var(--app-button-secondary-background)] text-[var(--app-secondary-foreground)] hover:bg-[var(--app-list-active-background)] hover:text-[var(--app-list-active-foreground)]`,onClick:()=>l(!0),children:[a.jsx("span",{className:"min-w-[18px]",children:"\u270E"}),a.jsx("span",{className:"flex-1 opacity-70",children:m.customInput||"Other..."})]})})]}),a.jsxs("div",{className:"flex gap-2 mt-3",children:[v&&a.jsx("button",{className:"px-4 py-2 rounded-md font-medium transition-colors cursor-pointer border-none",style:{backgroundColor:"var(--app-button-background)",color:"var(--app-button-foreground)"},onClick:g,children:"Confirm"}),a.jsx("button",{className:"px-4 py-2 rounded-md font-medium transition-colors cursor-pointer border-none hover:opacity-80",style:{backgroundColor:"var(--app-button-secondary-background)",color:"var(--app-primary-foreground)"},onClick:t,children:"Cancel"})]})]})},da=({images:e,onRemove:u})=>e.length===0?null:a.jsx("div",{className:"image-preview-container flex gap-2 px-2 pb-2",children:e.map(t=>a.jsx("div",{className:"image-preview-item relative group",children:a.jsxs("div",{className:"relative",children:[a.jsx("img",{src:t.data,alt:t.name,className:"w-14 h-14 object-cover rounded-md border border-gray-500 dark:border-gray-600",title:t.name}),a.jsx("button",{type:"button",onClick:()=>u(t.id),className:"absolute -top-2 -right-2 w-5 h-5 bg-gray-700 dark:bg-gray-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800 dark:hover:bg-gray-500","aria-label":`Remove ${t.name}`,children:a.jsx(Au,{})})]})},t.id))}),fa=({msg:e,imageIndex:u})=>{if(e.kind!=="image"||!e.imagePath)return null;const t=`[Image #${u}]`,r=!!e.imageSrc&&!e.imageMissing;return a.jsx("div",{className:"qwen-message user-message-container flex gap-0 my-1 items-start text-left flex-col relative",children:a.jsxs("div",{className:"inline-block relative whitespace-pre-wrap rounded-md max-w-full overflow-x-auto overflow-y-hidden select-text leading-[1.5]",style:{border:"1px solid var(--app-input-border)",borderRadius:"var(--corner-radius-medium)",backgroundColor:"var(--app-input-background)",padding:"6px 8px",color:"var(--app-primary-foreground)"},children:[a.jsx("div",{style:{fontSize:"12px",color:"var(--app-secondary-foreground)",marginBottom:"4px"},children:t}),r?a.jsx("img",{src:e.imageSrc,alt:e.imagePath,className:"max-w-full rounded-md border border-gray-600"}):a.jsxs("div",{style:{fontSize:"12px",color:"var(--app-secondary-foreground)"},children:["@",e.imagePath]})]})})},O=({label:e,status:u="success",children:t,toolCallId:r,labelSuffix:n,className:o,isFirst:c=!1,isLast:s=!1})=>a.jsx("div",{className:`qwen-message message-item ${o||""} relative pl-[30px] py-2 select-text toolcall-container toolcall-status-${u}`,"data-first":c,"data-last":s,children:a.jsxs("div",{className:"toolcall-content-wrapper flex flex-col min-w-0 max-w-full",children:[a.jsxs("div",{className:"flex items-baseline gap-1.5 relative min-w-0",children:[a.jsx("span",{className:"text-[14px] leading-none font-bold text-[var(--app-primary-foreground)]",children:e}),a.jsx("span",{className:"text-[11px] text-[var(--app-secondary-foreground)]",children:n})]}),t&&a.jsx("div",{className:"text-[var(--app-secondary-foreground)]",children:t})]})}),Ee=({icon:e,children:u})=>a.jsx("div",{className:"grid grid-cols-[auto_1fr] gap-medium bg-[var(--app-input-background)] border border-[var(--app-input-border)] rounded-medium p-large my-medium items-start animate-[fadeIn_0.2s_ease-in] toolcall-card",children:a.jsx("div",{className:"flex flex-col gap-medium min-w-0",children:u})}),W=({label:e,children:u})=>a.jsxs("div",{className:"grid grid-cols-[80px_1fr] gap-medium min-w-0",children:[a.jsx("div",{className:"text-xs text-[var(--app-secondary-foreground)] font-medium pt-[2px]",children:e}),a.jsx("div",{className:"text-[var(--app-primary-foreground)] min-w-0 break-words",children:u})]}),pa=e=>{switch(e){case"pending":return"bg-[#ffc107]";case"in_progress":return"bg-[#2196f3]";case"completed":return"bg-[#4caf50]";case"failed":return"bg-[#f44336]";default:return"bg-gray-500"}},ha=({status:e,text:u})=>a.jsxs("div",{className:"inline-block font-medium relative",title:e,children:[a.jsx("span",{className:`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${pa(e)}`}),u]}),ba=({children:e})=>a.jsx("pre",{className:"font-mono text-[var(--app-monospace-font-size)] bg-[var(--app-primary-background)] border border-[var(--app-input-border)] rounded-small p-medium overflow-x-auto mt-1 whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto",children:e}),Kt=({locations:e})=>a.jsx("div",{className:"toolcall-locations-list flex flex-col gap-1 max-w-full",children:e.map((u,t)=>a.jsx(j,{path:u.path,line:u.line,showFullPath:!0},t))}),hu=({children:e,isCollapsible:u,collapsedHeight:t=200,fadeStart:r=140,className:n=""})=>{const[o,c]=ne(!1);return a.jsxs("div",{className:"flex flex-col gap-[3px]",children:[a.jsx("div",{className:`toolcall-collapsible-output-content overflow-hidden ${n}`,style:!o&&u?{maxHeight:`${t}px`,maskImage:`linear-gradient(to bottom, var(--app-primary-background) ${r}px, transparent ${t}px)`,WebkitMaskImage:`linear-gradient(to bottom, var(--app-primary-background) ${r}px, transparent ${t}px)`}:void 0,children:e}),u&&a.jsx("div",{className:"flex justify-center border-t border-[var(--app-input-border)] pt-1",children:a.jsx("button",{type:"button",onClick:s=>{s.stopPropagation(),c(l=>!l)},"aria-expanded":o,"aria-label":o?"Collapse output":"Expand output",className:"text-[var(--app-secondary-foreground)] text-[0.8em] hover:text-[var(--app-primary-foreground)] cursor-pointer bg-transparent border-none px-2 py-1 rounded hover:bg-[var(--app-input-background)] transition-colors",children:o?"\u25B2 Collapse":"\u25BC Show more"})})]})},Qt=async(e,u,t)=>{u.stopPropagation();try{t?await t(e):await navigator.clipboard.writeText(e)}catch(r){console.error("Failed to copy text:",r)}},bu=({text:e})=>{var c;const[u,t]=C.useState(!1),r=re(),n=C.useCallback(async s=>{await Qt(e,s,r.copyToClipboard),t(!0),setTimeout(()=>t(!1),1e3)},[e,r.copyToClipboard]);return((c=r.features)==null?void 0:c.canCopy)!==!1?a.jsxs("button",{className:"col-start-3 bg-transparent border-none px-2 py-1.5 cursor-pointer text-[var(--app-secondary-foreground)] opacity-0 transition-opacity duration-200 ease-out flex items-center justify-center rounded relative group-hover:opacity-70 hover:!opacity-100 hover:bg-[var(--app-input-border)] active:scale-95",onClick:n,title:"Copy","aria-label":"Copy to clipboard",type:"button",children:[a.jsx("svg",{width:"14",height:"14",viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:a.jsx("path",{d:"M4 4V3C4 2.44772 4.44772 2 5 2H13C13.5523 2 14 2.44772 14 3V11C14 11.5523 13.5523 12 13 12H12M3 6H11C11.5523 6 12 6.44772 12 7V13C12 13.5523 11.5523 14 11 14H3C2.44772 14 2 13.5523 2 13V7C2 6.44772 2.44772 6 3 6Z",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})}),u&&a.jsx("span",{className:"absolute -top-7 right-0 bg-[var(--app-tool-background)] text-[var(--app-primary-foreground)] px-2 py-1 rounded text-xs whitespace-nowrap border border-[var(--app-input-border)] pointer-events-none",children:"Copied!"})]}):null};/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Shared utility functions for tool call components\n * Platform-agnostic utilities that can be used across different platforms\n */const Yt=e=>{try{const t=JSON.parse(e),r=t.output??t.Output;if(r!=null)return typeof r=="string"?r:JSON.stringify(r,null,2)}catch{}const u=e.match(/Output:[ \\t]{0,20}(.{0,1000}?)(?=\\nError:|$)/i);if(u&&u[1]){const t=u[1].trim();if(t&&t!=="(none)"&&t.length>0)return t}if(e.match(/^Command:/)){const t=e.split(`\n`),r=[];let n=!1;for(const o of t){if(o.startsWith("Error:")||o.startsWith("Exit Code:")||o.startsWith("Signal:")||o.startsWith("Background PIDs:")||o.startsWith("Process Group PGID:"))break;if(!(o.startsWith("Command:")||o.startsWith("Directory:"))){if(o.startsWith("Output:")){n=!0;const c=o.substring(7).trim();c&&c!=="(none)"&&r.push(c);continue}(n||!o.startsWith("Command:")&&!o.startsWith("Directory:"))&&r.push(o)}}if(r.length>0){const o=r.join(`\n`).trim();if(o&&o!=="(none)")return o}}return e},qe=e=>{if(e==null)return"";if(typeof e=="string")return Yt(e);if(e instanceof Error)return e.message||e.toString();if(typeof e=="object"&&e!==null&&"message"in e)return e.message||String(e);if(typeof e=="object")try{return JSON.stringify(e,null,2)}catch{return String(e)}return String(e)},te=e=>{if(typeof e=="string"&&e.trim())return e;if(e&&typeof e=="object")try{return JSON.stringify(e)}catch{return String(e)}return""},Rt=e=>!e.includes("internal"),G=e=>{const u=[],t=[],r=[],n=[];return e==null||e.forEach(o=>{if(o.type==="diff")r.push(o);else if(o.content){const c=o.content,s=c.error!=null,l=c.type==="error"&&(c.text!=null||c.error!=null);if(s||l){let d="";typeof c.error=="string"?d=c.error:c.error&&typeof c.error=="object"&&"message"in c.error?d=c.error.message:c.text?d=qe(c.text):c.error?d=qe(c.error):d="An error occurred",t.push(d)}else c.text?u.push(qe(c.text)):n.push(c)}}),{textOutputs:u,errors:t,diffs:r,otherData:n}},xa=e=>{if(e.status==="failed")return!0;const u=e.kind.toLowerCase();if((u==="execute"||u==="bash"||u==="command")&&e.title&&typeof e.title=="string"&&e.title.trim()||e.locations&&e.locations.length>0)return!0;if(e.content&&e.content.length>0){const t=G(e.content);if(t.textOutputs.length>0||t.errors.length>0||t.diffs.length>0||t.otherData.length>0)return!0}return!!(e.title&&typeof e.title=="string"&&e.title.trim())},Z=e=>{switch(e){case"pending":case"in_progress":return"loading";case"failed":return"error";case"cancelled":return"warning";case"completed":return"success";default:return"default"}},er=({toolCall:e,isFirst:u,isLast:t})=>{const{content:r}=e,{textOutputs:n,errors:o}=G(r);if(o.length>0)return a.jsx(O,{label:"Think",status:"error",isFirst:u,isLast:t,children:o.join(`\n`)});if(n.length>0){const c=n.join(`\n\n`);if(c.length>200){const i=c.length>500;return a.jsx(Ee,{icon:"\u{1F4AD}",children:a.jsx(W,{label:"Think",children:i?a.jsx(hu,{isCollapsible:!0,className:"italic opacity-90 leading-relaxed",children:c}):a.jsx("div",{className:"italic opacity-90 leading-relaxed",children:c})})})}const l=e.status==="pending"||e.status==="in_progress"?"loading":e.status==="failed"?"error":e.status==="cancelled"?"warning":"default";return a.jsx(O,{label:"Think",status:l,isFirst:u,isLast:t,children:a.jsx("span",{className:"italic opacity-90",children:c})})}return null};/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const ur=e=>typeof e=="string"?e.trim().toLowerCase():"",He=(e,u)=>u.some(t=>e.startsWith(t)),ga=e=>{const u=ur(e);return He(u,["readmanyfiles","read many files"])?"ReadManyFiles":He(u,["listfiles","list files","list directory"])?"ListFiles":He(u,["readfile","read file"])?"ReadFile":He(u,["skill"])?"Skill":null},de=({kind:e,title:u})=>{switch(ur(e)){case"execute":case"bash":case"command":case"shell":case"run_shell_command":return"Shell";case"todo_write":case"todowrite":case"update_todos":case"updated_plan":case"updatedplan":return"TodoList";case"web_fetch":case"webfetch":case"fetch":return"WebFetch";case"grep":case"grep_search":return"Grep";case"glob":return"Glob";case"search":case"find":return"Search";case"write":case"write_file":case"writefile":return"WriteFile";case"read_many_files":case"readmanyfiles":return"ReadManyFiles";case"list_directory":case"listfiles":case"ls":return"ListFiles";case"read_file":case"readfile":return"ReadFile";case"save_memory":case"savememory":case"memory":return"SaveMemory";case"enter_plan_mode":return"EnterPlanMode";case"exit_plan_mode":case"switch_mode":{const r=typeof u=="string"?u.toLowerCase():"";return r.includes("enterplanmode")||r.includes("enter plan")?"EnterPlanMode":"ExitPlanMode"}case"task":return"Task";case"skill":return"Skill";case"think":case"thinking":return"Think";case"read":return ga(u)??"Read";default:return e}},ma=400,tr=({toolCall:e,isFirst:u,isLast:t})=>{const{kind:r,title:n,content:o,locations:c,toolCallId:s}=e,l=te(n),i=de({kind:r,title:n}),{textOutputs:d,errors:p}=G(o);if(p.length>0)return a.jsxs(Ee,{icon:"\u{1F527}",children:[a.jsx(W,{label:i,children:a.jsx("div",{children:l})}),a.jsx(W,{label:"Error",children:a.jsx("div",{className:"text-[#c74e39] font-medium",children:p.join(`\n`)})})]});if(d.length>0){const b=d.join(`\n`);if(b.length>150)return a.jsxs(Ee,{icon:"\u{1F527}",children:[a.jsx(W,{label:i,children:a.jsx("div",{children:l})}),a.jsx(W,{label:"Output",children:a.jsx(hu,{isCollapsible:b.length>ma,className:"text-[13px] opacity-90",children:a.jsx(Ce,{content:b,enableFileLinks:!1})})})]});const f=Z(e.status);return a.jsx(O,{label:i,status:f,toolCallId:s,isFirst:u,isLast:t,children:l||b})}if(c&&c.length>0){const b=Z(e.status);return a.jsx(O,{label:i,status:b,toolCallId:s,isFirst:u,isLast:t,children:a.jsx(Kt,{locations:c})})}if(l){const b=Z(e.status);return a.jsx(O,{label:i,status:b,toolCallId:s,isFirst:u,isLast:t,children:l})}return null},rr=e=>!!(e&&typeof e=="object"&&"type"in e&&e.type==="task_execution"&&"taskDescription"in e&&"status"in e),xu=e=>rr(e.rawOutput),ya={running:"Running",completed:"Completed",failed:"Failed",cancelled:"Cancelled"},va={executing:"Running",awaiting_approval:"Awaiting approval",success:"Completed",failed:"Failed"},ka=e=>{if(e<1e3)return`${e}ms`;if(e<6e4)return`${(e/1e3).toFixed(e%1e3===0?0:1)}s`;const u=Math.floor(e/6e4),t=Math.round(e%6e4/1e3);return`${u}m ${t}s`},wa=(e,u)=>e.taskDescription||te(u)||"Agent Task",nr=({toolCall:e})=>{var n,o;if(!xu(e))return null;const u=e.rawOutput,t=((n=u.toolCalls)==null?void 0:n.slice(-5))??[],r=Math.max(0,(((o=u.toolCalls)==null?void 0:o.length)??0)-t.length);return a.jsxs(Ee,{icon:"\u{1F916}",children:[a.jsx(W,{label:"Agent",children:a.jsx("div",{className:"font-medium text-[var(--app-primary-foreground)]",children:wa(u,e.title)})}),a.jsx(W,{label:"Status",children:a.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[a.jsx("span",{className:"font-medium",children:u.subagentName}),a.jsx("span",{className:"text-[var(--app-secondary-foreground)]",children:ya[u.status]})]})}),t.length>0&&a.jsx(W,{label:u.status==="running"?"Progress":"Tools",children:a.jsxs("div",{className:"flex flex-col gap-1",children:[t.map(c=>a.jsxs("div",{className:"flex flex-wrap items-center gap-2",children:[a.jsx("span",{className:"font-mono text-[12px] text-[var(--app-primary-foreground)]",children:c.name}),a.jsx("span",{className:"text-[var(--app-secondary-foreground)]",children:va[c.status]}),c.description&&a.jsx("span",{className:"text-[var(--app-secondary-foreground)]",children:c.description}),c.error&&a.jsx("span",{className:"text-[#c74e39]",children:c.error})]},c.callId)),r>0&&a.jsxs("div",{className:"text-[var(--app-secondary-foreground)]",children:["+",r," more tool calls"]})]})}),u.executionSummary&&a.jsx(W,{label:"Summary",children:a.jsxs("div",{className:"flex flex-wrap gap-x-4 gap-y-1",children:[a.jsxs("span",{children:[u.executionSummary.totalToolCalls," tool calls"]}),a.jsxs("span",{children:[(u.executionSummary.outputTokens??u.executionSummary.totalTokens).toLocaleString()," ","tokens"]}),a.jsx("span",{children:ka(u.executionSummary.totalDurationMs)})]})}),(u.status==="failed"||u.status==="cancelled")&&u.terminateReason&&a.jsx(W,{label:"Reason",children:a.jsx("div",{className:"text-[#c74e39] font-medium",children:u.terminateReason})})]})},or=({label:e,status:u="success",children:t,toolCallId:r,labelSuffix:n,className:o,isFirst:c=!1,isLast:s=!1})=>a.jsx("div",{className:`qwen-message message-item ${o||""} relative pl-[30px] py-2 select-text toolcall-container toolcall-status-${u}`,"data-first":c,"data-last":s,children:a.jsxs("div",{className:"EditToolCall toolcall-content-wrapper flex flex-col gap-1 min-w-0 max-w-full",children:[a.jsxs("div",{className:"flex items-baseline gap-1.5 relative min-w-0",children:[a.jsx("span",{className:"text-[14px] leading-none font-bold text-[var(--app-primary-foreground)]",children:e}),a.jsx("span",{className:"text-[11px] text-[var(--app-secondary-foreground)]",children:n})]}),t&&a.jsx("div",{className:"text-[var(--app-secondary-foreground)]",children:t})]})}),_a=(e,u)=>{const t=e?e.split(`\n`).length:0,n=(u?u.split(`\n`).length:0)-t;return n>0?`+${n} lines`:n<0?`${n} lines`:"Modified"},ar=({toolCall:e,isFirst:u,isLast:t})=>{var l,i,d,p;const{content:r,locations:n,toolCallId:o}=e,{errors:c,diffs:s}=C.useMemo(()=>G(r),[r]);if(e.status==="failed"){const b=s[0],h=(b==null?void 0:b.path)||((l=n==null?void 0:n[0])==null?void 0:l.path)||"",f=Z(e.status);return a.jsx("div",{className:`qwen-message message-item relative py-2 select-text toolcall-container toolcall-status-${f}`,"data-first":u,"data-last":t,children:a.jsxs("div",{className:"toolcall-edit-content flex flex-col gap-1 min-w-0 max-w-full",children:[a.jsx("div",{className:"flex items-center justify-between min-w-0",children:a.jsxs("div",{className:"flex items-baseline gap-2 min-w-0",children:[a.jsx("span",{className:"text-[13px] leading-none font-bold text-[var(--app-primary-foreground)]",children:"Edit"}),h&&a.jsx(j,{path:h,showFullPath:!1,className:"font-mono text-[var(--app-secondary-foreground)] hover:underline"})]})}),a.jsx("div",{className:"inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 flex-row items-start w-full gap-1 flex items-center",children:a.jsx("span",{className:"flex-shrink-0 w-full",children:"edit failed"})})]})})}if(c.length>0){const b=((i=s[0])==null?void 0:i.path)||((d=n==null?void 0:n[0])==null?void 0:d.path)||"";return a.jsx(or,{label:"Edit",status:"error",toolCallId:o,isFirst:u,isLast:t,labelSuffix:b?a.jsx(j,{path:b,showFullPath:!1,className:"text-xs font-mono hover:underline"}):void 0,children:c.join(`\n`)})}if(s.length>0){const b=s[0],h=b.path||n&&((p=n[0])==null?void 0:p.path)||"",f=_a(b.oldText,b.newText),v=Z(e.status);return a.jsx("div",{className:`qwen-message message-item relative py-2 select-text toolcall-container toolcall-status-${v}`,"data-first":u,"data-last":t,children:a.jsxs("div",{className:"toolcall-edit-content flex flex-col gap-1 min-w-0 max-w-full",children:[a.jsx("div",{className:"flex items-center justify-between min-w-0",children:a.jsxs("div",{className:"flex items-baseline gap-1.5 min-w-0",children:[a.jsx("span",{className:"text-[13px] leading-none font-bold text-[var(--app-primary-foreground)]",children:"Edit"}),h&&a.jsx(j,{path:h,showFullPath:!1,className:"font-mono text-[var(--app-secondary-foreground)] hover:underline"})]})}),a.jsxs("div",{className:"inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 flex-row items-start w-full gap-1 flex items-baseline",children:[a.jsx("span",{className:"flex-shrink-0 relative top-[-0.1em]",children:"\u23BF"}),a.jsx("span",{className:"flex-shrink-0 w-full",children:f})]})]})})}if(n&&n.length>0){const b=Z(e.status);return a.jsx(or,{label:"Edit",status:b,toolCallId:o,isFirst:u,isLast:t,labelSuffix:a.jsx(j,{path:n[0].path,showFullPath:!1,className:"text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"}),children:a.jsxs("div",{className:"inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 flex-row items-start w-full gap-1 flex items-center",children:[a.jsx("span",{className:"flex-shrink-0 relative top-[-0.1em]",children:"\u23BF"}),a.jsx(j,{path:n[0].path,line:n[0].line,showFullPath:!0})]})})}return null},cr=({toolCall:e,isFirst:u,isLast:t})=>{var d;const{content:r,locations:n,rawInput:o,toolCallId:c}=e,{errors:s,textOutputs:l}=G(r);let i="";if(o&&typeof o=="object"?i=o.content||"":typeof o=="string"&&(i=o),s.length>0){const p=((d=n==null?void 0:n[0])==null?void 0:d.path)||"",b=s.join(`\n`),h=i.length>200?i.substring(0,200)+"...":i;return a.jsxs(O,{label:"WriteFile",status:"error",toolCallId:c,isFirst:u,isLast:t,labelSuffix:p?a.jsx(j,{path:p,showFullPath:!1,className:"text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"}):void 0,children:[a.jsxs("div",{className:"inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 mt-[2px] mb-[2px] flex-row items-start w-full gap-1",children:[a.jsx("span",{className:"flex-shrink-0 relative top-[-0.1em]",children:"\u23BF"}),a.jsx("span",{className:"flex-shrink-0 w-full",children:b})]}),h&&a.jsx("div",{className:"bg-[var(--app-input-background)] border border-[var(--app-input-border)] rounded-md p-3 mt-1",children:a.jsx("pre",{className:"font-mono text-[13px] whitespace-pre-wrap break-words text-[var(--app-primary-foreground)] opacity-90",children:h})})]})}if(n&&n.length>0){const p=n[0].path,b=i.split(`\n`).length,h=Z(e.status);return a.jsx(O,{label:"WriteFile",status:h,toolCallId:c,isFirst:u,isLast:t,labelSuffix:p?a.jsx(j,{path:p,showFullPath:!1,className:"text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"}):void 0,children:a.jsxs("div",{className:"inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 flex-row items-start w-full gap-1 flex items-center",children:[a.jsx("span",{className:"flex-shrink-0 relative top-[-0.1em]",children:"\u23BF"}),a.jsxs("span",{className:"flex-shrink-0 w-full",children:[b," lines"]})]})})}if(l.length>0){const p=Z(e.status);return a.jsx(O,{label:"WriteFile",status:p,toolCallId:c,isFirst:u,isLast:t,children:l.join(`\n`)})}return null},sr=({summary:e,children:u,defaultExpanded:t=!1})=>{const[r,n]=ne(t);return a.jsxs("div",{className:"flex flex-col",children:[a.jsxs("div",{className:"inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 mt-[2px] mb-[2px] flex-row items-start w-full gap-1 cursor-pointer hover:opacity-100 transition-opacity",role:"button",tabIndex:0,"aria-expanded":r,"aria-label":r?"Collapse output":"Expand output",onClick:()=>n(!r),onKeyDown:o=>{(o.key==="Enter"||o.key===" ")&&(o.preventDefault(),n(!r))},children:[a.jsx("span",{className:"flex-shrink-0 relative top-[-0.1em]",children:"\u23BF"}),a.jsx("span",{className:"flex-shrink-0",children:e})]}),r&&a.jsx("div",{className:"ml-4 mt-1 text-[var(--app-secondary-foreground)] text-[0.85em]",children:u})]})},lr=({label:e,children:u})=>a.jsxs("div",{className:"grid grid-cols-[80px_1fr] gap-medium min-w-0",children:[a.jsx("div",{className:"text-xs text-[var(--app-secondary-foreground)] font-medium pt-[2px]",children:e}),a.jsx("div",{className:"text-[var(--app-primary-foreground)] min-w-0 break-words",children:u})]}),Ca=({children:e})=>a.jsx("div",{className:"bg-[var(--app-input-background)] border border-[var(--app-input-border)] rounded-md p-3 mt-1",children:a.jsx("div",{className:"flex flex-col gap-3 min-w-0",children:e})}),Ea=({locations:e})=>a.jsx("div",{className:"flex flex-col gap-1 max-w-full",children:e.map((u,t)=>a.jsx(j,{path:u.path,line:u.line,showFullPath:!0},t))}),ir=({toolCall:e,isFirst:u,isLast:t})=>{const{kind:r,title:n,content:o,locations:c}=e,s=te(n),l=de({kind:r,title:n}),i=Z(e.status),{errors:d,textOutputs:p}=G(o);if(d.length>0)return a.jsx(O,{label:l,labelSuffix:s,status:"error",isFirst:u,isLast:t,children:a.jsxs(Ca,{children:[a.jsx(lr,{label:"Query",children:a.jsx("div",{className:"font-mono",children:s})}),a.jsx(lr,{label:"Error",children:a.jsx("div",{className:"text-[#c74e39] font-medium",children:d.join(`\n`)})})]})});if(c&&c.length>0){const b=`${c.length} ${c.length===1?"file":"files"} found`;return a.jsx(O,{label:l,labelSuffix:s,status:i,isFirst:u,isLast:t,children:a.jsx(sr,{summary:b,children:a.jsx(Ea,{locations:c})})})}if(p.length>0){const b=p.reduce((f,v)=>f+v.split(`\n`).length,0),h=`${b} ${b===1?"line":"lines"} of output`;return a.jsx(O,{label:l,labelSuffix:s||void 0,status:i,isFirst:u,isLast:t,children:a.jsx(sr,{summary:h,children:a.jsx("div",{className:"flex flex-col gap-1 font-mono text-[0.85em] whitespace-pre-wrap break-all",children:p.map((f,v)=>a.jsx("div",{children:f},v))})})})}return s?a.jsx(O,{label:l,labelSuffix:s,status:i,isFirst:u,isLast:t}):null};/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Display-only checkbox component for plan entries\n */const dr=({checked:e=!1,indeterminate:u=!1,disabled:t=!0,className:r="",style:n,title:o})=>{const c=!!e&&!u,s=!!u;return a.jsxs("span",{role:"checkbox","aria-checked":u?"mixed":!!e,"aria-disabled":t||void 0,title:o,style:n,className:["q m-[2px] shrink-0 w-4 h-4 relative rounded-[2px] box-border","border border-[var(--app-input-border)] bg-[var(--app-input-background)]","inline-flex items-center justify-center",c?"opacity-70":"",r].join(" "),children:[c?a.jsx("span",{"aria-hidden":!0,className:["absolute block","left-[3px] top-[3px]","w-2.5 h-1.5","border-l-2 border-b-2","border-[#74c991]","-rotate-45"].join(" ")}):null,s?a.jsx("span",{"aria-hidden":!0,className:["absolute inline-block","left-1/2 top-[10px] -translate-x-1/2 -translate-y-1/2","text-[16px] leading-none text-[#e1c08d] select-none"].join(" "),children:"*"}):null]})},fr=({label:e,status:u="success",children:t,toolCallId:r,labelSuffix:n,className:o,isFirst:c=!1,isLast:s=!1})=>a.jsx("div",{className:`qwen-message message-item ${o||""} relative pl-[30px] py-2 select-text toolcall-container toolcall-status-${u}`,"data-first":c,"data-last":s,children:a.jsxs("div",{className:"UpdatedPlanToolCall toolcall-content-wrapper flex flex-col gap-2 min-w-0 max-w-full",children:[a.jsxs("div",{className:"flex items-baseline gap-1 relative min-w-0",children:[a.jsx("span",{className:"text-[14px] leading-none font-bold text-[var(--app-primary-foreground)]",children:e}),a.jsx("span",{className:"text-[11px] text-[var(--app-secondary-foreground)]",children:n})]}),t&&a.jsx("div",{className:"text-[var(--app-secondary-foreground)] py-1",children:t})]})}),Da=e=>{switch(e){case"completed":return"success";case"failed":return"error";case"in_progress":case"cancelled":return"warning";case"pending":return"loading";default:return"default"}},Aa=e=>{const t=e.join(`\n`).split(/\\r?\\n/),r=[],n=/^(?:\\s{0,10}(?:[-*]|\\d{1,3}[.)])\\s{0,10})?\\[( |x|X|-|\\*)\\]\\s+(.{0,500})$/;for(const o of t){const c=o.match(n);if(c){const s=c[1],l=c[2].trim(),i=s==="x"||s==="X"?"completed":s==="-"||s==="*"?"in_progress":"pending";l&&r.push({content:l,status:i})}}if(r.length===0)for(const o of t){const c=o.trim();c&&r.push({content:c,status:"pending"})}return r},pr=({toolCall:e,isFirst:u,isLast:t})=>{const{content:r,status:n}=e,{errors:o,textOutputs:c}=G(r);if(o.length>0)return a.jsx(fr,{label:"TodoList",status:"error",isFirst:u,isLast:t,children:o.join(`\n`)});const s=Aa(c),l=de({kind:e.kind,title:te(e.title)});return a.jsx(fr,{label:l,status:Da(n),className:"update-plan-toolcall",isFirst:u,isLast:t,children:a.jsx("ul",{className:"Fr list-none p-0 m-0 flex flex-col gap-1",children:s.map((i,d)=>{const p=i.status==="completed",b=i.status==="in_progress";return a.jsxs("li",{className:["Hr flex items-start gap-2 p-0 rounded text-[var(--app-primary-foreground)]",p?"fo opacity-70":""].join(" "),children:[a.jsx("label",{className:"flex items-start gap-2",children:a.jsx(dr,{checked:p,indeterminate:b})}),a.jsx("div",{className:["vo flex-1 text-xs leading-[1.5] text-[var(--app-primary-foreground)]",p?"line-through text-[var(--app-secondary-foreground)] opacity-70":"opacity-85"].join(" "),children:i.content})]},d)})})})},Fa=({label:e,status:u="success",children:t,toolCallId:r,labelSuffix:n,className:o,isFirst:c=!1,isLast:s=!1})=>a.jsx("div",{className:`ExecuteToolCall qwen-message message-item ${o||""} relative pl-[30px] py-2 select-text toolcall-container toolcall-status-${u}`,"data-first":c,"data-last":s,children:a.jsxs("div",{className:"toolcall-content-wrapper flex flex-col min-w-0 max-w-full",children:[a.jsxs("div",{className:"flex items-baseline gap-1.5 relative min-w-0",children:[a.jsx("span",{className:"text-[14px] leading-none font-bold text-[var(--app-primary-foreground)]",children:e}),a.jsx("span",{className:"text-[11px] text-[var(--app-secondary-foreground)]",children:n})]}),t&&a.jsx("div",{className:"text-[var(--app-secondary-foreground)]",children:t})]})}),Na=(e,u,t)=>{if(e==="execute"&&t&&typeof t=="object"){const r=t.description,n=te(r);if(n)return n}return te(u)},Sa=(e,u)=>u&&typeof u=="object"?u.command||e:typeof u=="string"?u:e,Ta=({toolCall:e,variant:u,isFirst:t,isLast:r})=>{const{title:n,content:o,rawInput:c,toolCallId:s}=e,l=u,i=re(),d=(k,y)=>{if(i.openTempFile){i.openTempFile(k,y);return}i.postMessage({type:"createAndOpenTempFile",data:{content:k,fileName:y}})},p=Na(u,n,c),b=Sa(p,c),h=u==="execute"?Fa:O,f=de({kind:e.kind,title:n}),{textOutputs:v,errors:m}=G(o),D=()=>{d(b,`${l}-input-${s}`)},w=()=>{if(v.length>0){const k=v.join(`\n`);d(k,`${l}-output-${s}`)}},g=m.length>0||u==="execute"&&e.status==="failed"?"error":Z(e.status);if(m.length>0)return a.jsxs(h,{label:f,status:g,toolCallId:s,isFirst:t,isLast:r,children:[a.jsxs("div",{className:"inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 mt-[2px] mb-[2px] flex-row items-start w-full gap-1",children:[a.jsx("span",{className:"flex-shrink-0 relative top-[-0.1em]",children:"\u23BF"}),a.jsx("span",{className:"flex-shrink-0 w-full",children:p})]}),a.jsx("div",{className:`${l}-toolcall-card`,children:a.jsxs("div",{className:`${l}-toolcall-content`,children:[a.jsxs("div",{className:`${l}-toolcall-row ${l}-toolcall-row-with-copy group`,onClick:D,style:{cursor:"pointer"},children:[a.jsx("div",{className:`${l}-toolcall-label`,children:"IN"}),a.jsx("div",{className:`${l}-toolcall-row-content`,children:a.jsx("pre",{className:`${l}-toolcall-pre`,children:b})}),a.jsx(bu,{text:b})]}),a.jsxs("div",{className:`${l}-toolcall-row`,children:[a.jsx("div",{className:`${l}-toolcall-label`,children:"Error"}),a.jsx("div",{className:`${l}-toolcall-row-content`,children:a.jsx("pre",{className:`${l}-toolcall-pre ${l}-toolcall-error-content`,children:m.join(`\n`)})})]})]})})]});if(v.length>0){const k=v.join(`\n`),y=k.length>500,_=a.jsx("div",{className:`${l}-toolcall-output-subtle`,children:a.jsx("pre",{className:`${l}-toolcall-pre`,children:k})});return a.jsxs(h,{label:f,status:g,toolCallId:s,isFirst:t,isLast:r,children:[a.jsxs("div",{className:"inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 mt-[2px] mb-[2px] flex-row items-start w-full gap-1",children:[a.jsx("span",{className:"flex-shrink-0 relative top-[-0.1em]",children:"\u23BF"}),a.jsx("span",{className:"flex-shrink-0 w-full",children:p})]}),a.jsx("div",{className:`${l}-toolcall-card`,children:a.jsxs("div",{className:`${l}-toolcall-content`,children:[a.jsxs("div",{className:`${l}-toolcall-row ${l}-toolcall-row-with-copy group`,onClick:D,style:{cursor:"pointer"},children:[a.jsx("div",{className:`${l}-toolcall-label`,children:"IN"}),a.jsx("div",{className:`${l}-toolcall-row-content`,children:a.jsx("pre",{className:`${l}-toolcall-pre`,children:b})}),a.jsx(bu,{text:b})]}),a.jsxs("div",{className:`${l}-toolcall-row`,onClick:w,style:{cursor:"pointer"},children:[a.jsx("div",{className:`${l}-toolcall-label`,children:"OUT"}),a.jsx("div",{className:`${l}-toolcall-row-content ${y?`${l}-toolcall-full`:""}`,children:y?a.jsx(hu,{isCollapsible:!0,collapsedHeight:60,fadeStart:40,children:_}):_})]})]})})]})}return a.jsx(h,{label:f,status:g,toolCallId:s,isFirst:t,isLast:r,children:a.jsxs("div",{className:"inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 mt-[2px] mb-[2px] flex-row items-start w-full gap-1",onClick:D,style:{cursor:"pointer"},children:[a.jsx("span",{className:"flex-shrink-0 relative top-[-0.1em]",children:"\u23BF"}),a.jsx("span",{className:"flex-shrink-0 w-full",children:p})]})})},hr=e=>{const t=e.toolCall.kind.toLowerCase()==="execute"?"execute":"bash";return a.jsx(Ta,{...e,variant:t})},De=({label:e,status:u="success",children:t,toolCallId:r,labelSuffix:n,className:o,isFirst:c=!1,isLast:s=!1})=>a.jsx("div",{className:`ReadToolCall qwen-message message-item ${o||""} relative pl-[30px] py-2 select-text toolcall-container toolcall-status-${u}`,"data-first":c,"data-last":s,children:a.jsxs("div",{className:"toolcall-content-wrapper flex flex-col gap-1 min-w-0 max-w-full",children:[a.jsxs("div",{className:"flex items-baseline gap-1.5 relative min-w-0",children:[a.jsx("span",{className:"text-[14px] leading-none font-bold text-[var(--app-primary-foreground)]",children:e}),a.jsx("span",{className:"text-[11px] text-[var(--app-secondary-foreground)]",children:n})]}),t&&a.jsx("div",{className:"text-[var(--app-secondary-foreground)] py-0.5",children:t})]})}),br=({toolCall:e,isFirst:u,isLast:t})=>{var w,g,k,y;const{kind:r,title:n,content:o,locations:c,toolCallId:s}=e,l=re(),i=C.useRef(new Map),[d,p]=ne(!1),{errors:b,diffs:h,textOutputs:f}=C.useMemo(()=>G(o),[o]),v=C.useCallback((_,S,F)=>{if(_){if(l.openDiff){l.openDiff(_,S,F);return}l.postMessage({type:"openDiff",data:{path:_,oldText:S??"",newText:F??""}})}},[l]);C.useEffect(()=>{var N;if(h.length===0)return;const _=h[0],S=_.path||((N=c==null?void 0:c[0])==null?void 0:N.path)||"";if(!S||_.oldText===void 0||_.newText===void 0)return;const F=`${S}:${_.oldText??""}:${_.newText??""}`;if(i.current.get(s)===F)return;i.current.set(s,F);const A=setTimeout(()=>{v(S,_.oldText,_.newText)},100);return()=>clearTimeout(A)},[h,v,c,s]);const m=Z(e.status),D=de({kind:r,title:n});if(b.length>0){const _=((w=c==null?void 0:c[0])==null?void 0:w.path)||"";return a.jsx(De,{label:D,className:"read-tool-call-error",status:"error",toolCallId:s,isFirst:u,isLast:t,labelSuffix:_?a.jsx(j,{path:_,showFullPath:!1,className:"text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"}):void 0,children:b.join(`\n`)})}if(e.status==="failed"){const _=((g=c==null?void 0:c[0])==null?void 0:g.path)||"",S=f.length>0?f.join(`\n`):"Read operation failed";return a.jsx(De,{label:D,className:"read-tool-call-error",status:"error",toolCallId:s,isFirst:u,isLast:t,labelSuffix:_?a.jsx(j,{path:_,showFullPath:!1,className:"text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"}):void 0,children:S})}if(h.length>0){const _=((k=h[0])==null?void 0:k.path)||((y=c==null?void 0:c[0])==null?void 0:y.path)||"";return a.jsx(De,{label:D,className:"read-tool-call-success",status:m,toolCallId:s,isFirst:u,isLast:t,labelSuffix:_?a.jsx(j,{path:_,showFullPath:!1,className:"text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"}):void 0,children:null})}if(c&&c.length>0){const _=c[0].path,S=f.length>0?f.join(`\n`):"",E=S.length>300;return a.jsx(De,{label:D,className:"read-tool-call-success",status:m,toolCallId:s,isFirst:u,isLast:t,labelSuffix:_?a.jsx(j,{path:_,showFullPath:!1,className:"text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"}):void 0,children:S?a.jsxs("div",{className:"border border-[var(--app-input-border)] rounded-[5px] bg-[var(--app-tool-background)] overflow-hidden",children:[a.jsx("div",{className:`p-2 ${!d&&E?"max-h-[100px] overflow-hidden":""}`,style:!d&&E?{maskImage:"linear-gradient(to bottom, var(--app-primary-background) 60px, transparent 100px)"}:void 0,children:a.jsx("pre",{className:"whitespace-pre-wrap break-words text-xs font-mono m-0",children:S})}),E&&a.jsx("button",{onClick:()=>p(!d),"aria-expanded":d,"aria-label":d?"Collapse output":"Expand output",className:"flex items-center justify-center w-full py-1 px-2 border-t border-[var(--app-input-border)] cursor-pointer text-[var(--app-secondary-foreground)] text-[0.75em] opacity-70 hover:opacity-100 hover:bg-[var(--app-code-background)] transition-opacity bg-transparent",children:d?"\u25B2 Collapse":"\u25BC Show more"})]}):null})}if(f.length>0){const _=f.join(`\n`),F=_.length>300;return a.jsx(De,{label:D,className:"read-tool-call-success",status:m,toolCallId:s,isFirst:u,isLast:t,children:a.jsxs("div",{className:"border border-[var(--app-input-border)] rounded-[5px] bg-[var(--app-tool-background)] overflow-hidden",children:[a.jsx("div",{className:`p-2 ${!d&&F?"max-h-[100px] overflow-hidden":""}`,style:!d&&F?{maskImage:"linear-gradient(to bottom, var(--app-primary-background) 60px, transparent 100px)"}:void 0,children:a.jsx("pre",{className:"whitespace-pre-wrap break-words text-xs font-mono m-0",children:_})}),F&&a.jsx("button",{onClick:()=>p(!d),"aria-expanded":d,"aria-label":d?"Collapse output":"Expand output",className:"flex items-center justify-center w-full py-1 px-2 border-t border-[var(--app-input-border)] cursor-pointer text-[var(--app-secondary-foreground)] text-[0.75em] opacity-70 hover:opacity-100 hover:bg-[var(--app-code-background)] transition-opacity bg-transparent",children:d?"\u25B2 Collapse":"\u25BC Show more"})]})})}return null},gu=120,Ia=300,Ma=(e,u,t)=>{if(t&&typeof t=="object"){const r=t;if(e==="fetch"&&r.url)return String(r.url);if(e==="search"&&r.query)return String(r.query)}return te(u)},xr=({content:e,isError:u=!1})=>{const[t,r]=ne(!1),n=e.length>Ia;return a.jsx("div",{className:"border-[0.5px] border-[var(--app-input-border)] rounded-[5px] bg-[var(--app-tool-background)] my-2 max-w-full text-[1em] items-start",children:a.jsxs("div",{className:"flex flex-col gap-[3px] p-1",children:[a.jsxs("div",{className:"grid grid-cols-[max-content_1fr] p-1",children:[a.jsx("div",{className:"text-[var(--app-secondary-foreground)] text-left opacity-50 py-1 px-2 pl-1 font-mono text-[0.85em]",children:"OUT"}),a.jsx("div",{className:`webfetch-output-content break-words m-0 p-1 overflow-hidden ${u?"whitespace-pre-wrap":""}`,style:!t&&n?{maxHeight:`${gu}px`,maskImage:`linear-gradient(to bottom, var(--app-primary-background) 80px, transparent ${gu}px)`,WebkitMaskImage:`linear-gradient(to bottom, var(--app-primary-background) 80px, transparent ${gu}px)`}:void 0,children:u?a.jsx("pre",{className:"m-0 overflow-hidden font-mono text-[0.85em] text-[#c74e39]",children:e}):a.jsx("div",{className:"text-[0.85em]",children:a.jsx(Ce,{content:e,enableFileLinks:!1})})})]}),n&&a.jsx("div",{className:"flex justify-center border-t border-[var(--app-input-border)] pt-1",children:a.jsx("button",{type:"button",onClick:o=>{o.stopPropagation(),r(!t)},"aria-expanded":t,"aria-label":t?"Collapse output":"Expand output",className:"text-[var(--app-secondary-foreground)] text-[0.8em] hover:text-[var(--app-primary-foreground)] cursor-pointer bg-transparent border-none px-2 py-1 rounded hover:bg-[var(--app-input-background)] transition-colors",children:t?"\u25B2 Collapse":"\u25BC Show more"})})]})})},La=({toolCall:e,variant:u,isFirst:t,isLast:r})=>{const{title:n,content:o,rawInput:c,toolCallId:s}=e,l=Ma(u,n,c),i=de({kind:e.kind,title:n}),{textOutputs:d,errors:p}=G(o),b=p.length>0?"error":Z(e.status);if(p.length>0)return a.jsx(O,{label:i,status:b,toolCallId:s,isFirst:t,isLast:r,labelSuffix:l,children:a.jsx(xr,{content:p.join(`\n`),isError:!0})});if(d.length>0){const h=d.join(`\n`);return a.jsx(O,{label:i,status:b,toolCallId:s,isFirst:t,isLast:r,labelSuffix:l,children:a.jsx(xr,{content:h})})}return a.jsx(O,{label:i,status:b,toolCallId:s,isFirst:t,isLast:r,labelSuffix:l})},gr=e=>a.jsx(La,{...e,variant:"fetch"});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Shared tool-call routing \u2014 maps ToolCallData to the appropriate\n * specialized component. Used by both ChatViewer and VSCode IDE.\n */function mr(e){if(xu(e))return nr;switch(e.kind.toLowerCase()){case"read":case"read_file":case"read_many_files":case"readmanyfiles":case"list_directory":case"listfiles":return br;case"write":return cr;case"edit":return ar;case"execute":case"bash":case"command":return hr;case"updated_plan":case"updatedplan":case"todo_write":case"update_todos":case"todowrite":return pr;case"search":case"grep":case"glob":case"find":return ir;case"think":case"thinking":return er;case"fetch":case"web_fetch":case"webfetch":case"web_search":return gr;default:return tr}}/**\n * @license\n * Copyright 2026 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const yr="<qwen:user-prompt-submit-context>",vr="</qwen:user-prompt-submit-context>";function mu(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function $a(e){if(!mu(e)||typeof e.text!="string")return!1;const u=e.text.trim(),t=`${yr}\n`,r=`\n${vr}`;if(!u.startsWith(t)||!u.endsWith(r))return!1;const n=u.slice(t.length,-r.length);return!n.includes(yr)&&!n.includes(vr)}function kr(e){var o;if(e.type!=="user")return;const u=Array.isArray((o=e.message)==null?void 0:o.parts)?e.message.parts:[],t=u.length>1&&$a(u[u.length-1]),r=mu(e.systemPayload)?e.systemPayload:void 0;return r&&typeof r.displayText=="string"&&(typeof r.hookContext=="string"||t)?r.displayText:u.length===0?void 0:(r===void 0&&t?u.slice(0,-1):u).map(c=>mu(c)&&typeof c.text=="string"?c.text:"").join("")}function Pa(e){return e?e.parts&&Array.isArray(e.parts)?e.parts.map(u=>u.text||"").join(""):typeof e.content=="string"?e.content:Array.isArray(e.content)?e.content.filter(u=>u.type==="text"&&u.text).map(u=>u.text||"").join(""):"":""}function yu(e){const u=new Date(e);return isNaN(u.getTime())?Date.now():u.getTime()}const vu=C.forwardRef(({messages:e,className:u="",onFileClick:t,emptyMessage:r="No messages to display",autoScroll:n=!0,theme:o="auto",showEmptyIcon:c=!0,showExpandControl:s=!1},l)=>{const i=C.useRef(null),d=C.useRef(null),p=C.useRef(0),[b,h]=C.useState({signal:0,expanded:!1}),f=y=>{h(_=>({signal:_.signal+1,expanded:y}))},v=C.useMemo(()=>e.filter(y=>y.type==="system"?!1:y.type==="tool_call"&&y.toolCall?Rt(y.toolCall.kind):!0).sort((y,_)=>yu(y.timestamp)-yu(_.timestamp)),[e]);C.useImperativeHandle(l,()=>({scrollToBottom:(y="smooth")=>{const _=i.current;_&&_.scrollTo({top:_.scrollHeight,behavior:y})},scrollToTop:(y="smooth")=>{const _=i.current;_&&_.scrollTo({top:0,behavior:y})},getScrollContainer:()=>i.current}),[]),C.useEffect(()=>{if(!n)return;const y=v.length,_=p.current;y>_&&d.current&&d.current.scrollIntoView({behavior:"smooth"}),p.current=y},[v.length,n]);const m=y=>!y||y.type==="user",D=(y,_,S)=>{var z;const F=y.uuid||`msg-${_}`,E=S[_-1],A=S[_+1],N=m(E),T=m(A);if(y.type==="tool_call"&&y.toolCall){const pe=mr(y.toolCall);return pe?a.jsx(pe,{toolCall:y.toolCall,isFirst:N,isLast:T},F):null}const L=kr(y)??Pa(y.message),I=yu(y.timestamp);if(!L.trim())return null;switch(y.type){case"user":return a.jsx(Ut,{content:L,timestamp:I,onFileClick:t},F);case"assistant":return((z=y.message)==null?void 0:z.role)==="thinking"?a.jsx(Gt,{content:L,timestamp:I,onFileClick:t},F):a.jsx(Jt,{content:L,timestamp:I,onFileClick:t,isFirst:N,isLast:T},F);default:return null}},w=["chat-viewer-container",o==="light"?"light-theme":"",o==="auto"?"auto-theme":"",u].filter(Boolean).join(" "),g=s&&v.length>0,k=a.jsx("div",{ref:i,className:"chat-viewer-messages chat-messages",children:v.length===0?a.jsxs("div",{className:"chat-viewer-empty",children:[c&&a.jsx("div",{className:"chat-viewer-empty-icon","aria-hidden":"true",children:"\u{1F4AC}"}),a.jsx("div",{className:"chat-viewer-empty-text",children:r})]}):a.jsxs(a.Fragment,{children:[v.map((y,_)=>D(y,_,v)),a.jsx("div",{ref:d,className:"chat-viewer-scroll-anchor"})]})});return a.jsxs("div",{className:w,children:[g&&a.jsxs("div",{className:"chat-viewer-expand-control",role:"toolbar","aria-label":"Expand or collapse all sections",children:[a.jsx("button",{type:"button",className:"chat-viewer-expand-control-button","aria-label":"Expand all sections",onClick:()=>f(!0),children:"Expand all"}),a.jsx("button",{type:"button",className:"chat-viewer-expand-control-button","aria-label":"Collapse all sections",onClick:()=>f(!1),children:"Collapse all"})]}),s?a.jsx(Ne.Provider,{value:b,children:k}):k]})});vu.displayName="ChatViewer";const wr=C.forwardRef(({children:e,variant:u="primary",size:t="md",disabled:r=!1,loading:n=!1,leftIcon:o,rightIcon:c,fullWidth:s=!1,className:l="",type:i="button",...d},p)=>{const b=r||n,h="inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",f={primary:"bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",secondary:"bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",danger:"bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",ghost:"bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400",outline:"bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400"},v={sm:"px-2 py-1 text-sm gap-1",md:"px-4 py-2 gap-2",lg:"px-6 py-3 text-lg gap-2"},m=b?"opacity-50 cursor-not-allowed pointer-events-none":"",D=s?"w-full":"";return a.jsxs("button",{ref:p,type:i,className:`${h} ${f[u]} ${v[t]} ${m} ${D} ${l}`.trim(),disabled:b,"aria-disabled":b,"aria-busy":n,...d,children:[n&&a.jsxs("svg",{className:"animate-spin h-4 w-4",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","aria-hidden":"true",children:[a.jsx("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),a.jsx("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"})]}),!n&&o,e,!n&&c]})});wr.displayName="Button";const _r=C.forwardRef(({size:e="md",error:u=!1,errorMessage:t,label:r,helperText:n,leftElement:o,rightElement:c,fullWidth:s=!1,className:l="",id:i,disabled:d,...p},b)=>{const h=i||`input-${Math.random().toString(36).substr(2,9)}`,f="border rounded transition-colors focus:outline-none focus:ring-2",v={sm:"px-2 py-1 text-sm",md:"px-3 py-2",lg:"px-4 py-3 text-lg"},m=u?"border-red-500 focus:ring-red-500 focus:border-red-500":"border-gray-300 focus:ring-blue-500 focus:border-blue-500",D=d?"bg-gray-100 cursor-not-allowed opacity-60":"bg-white",w=s?"w-full":"",g=[o?"pl-10":"",c?"pr-10":""].join(" ");return a.jsxs("div",{className:`${s?"w-full":"inline-block"}`,children:[r&&a.jsx("label",{htmlFor:h,className:"block text-sm font-medium text-gray-700 mb-1",children:r}),a.jsxs("div",{className:"relative",children:[o&&a.jsx("div",{className:"absolute left-3 top-1/2 -translate-y-1/2 text-gray-500",children:o}),a.jsx("input",{ref:b,id:h,disabled:d,"aria-invalid":u,"aria-describedby":t?`${h}-error`:n?`${h}-helper`:void 0,className:`${f} ${v[e]} ${m} ${D} ${w} ${g} ${l}`.trim(),...p}),c&&a.jsx("div",{className:"absolute right-3 top-1/2 -translate-y-1/2 text-gray-500",children:c})]}),t&&u&&a.jsx("p",{id:`${h}-error`,className:"mt-1 text-sm text-red-600",children:t}),n&&!u&&a.jsx("p",{id:`${h}-helper`,className:"mt-1 text-sm text-gray-500",children:n})]})});_r.displayName="Input";/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const Ba="agent";function Cr(e){return e===Ba}const Oa=({isOpen:e,options:u,toolCall:t,onResponse:r,onClose:n})=>{const[o,c]=C.useState(0),s=C.useRef(null),l=()=>{var v,m,D;const h=(m=(v=t.locations)==null?void 0:v[0])==null?void 0:m.path;if(h)return h.split("/").pop()||h;const f=Array.isArray(t.content)?(D=t.content.find(w=>typeof w=="object"&&w!==null&&"path"in w))==null?void 0:D.path:void 0;return typeof f=="string"&&f.length>0?f.split("/").pop()||f:"file"},i=()=>{if(Cr(t.toolName))return"Launch this agent?";if(t.kind==="edit"||t.kind==="write"){const h=l();return a.jsxs(a.Fragment,{children:["Make this edit to"," ",a.jsx("span",{className:"font-mono text-[var(--app-primary-foreground)]",children:h}),"?"]})}if(t.kind==="execute"||t.kind==="bash")return"Allow this bash command?";if(t.kind==="read"){const h=l();return a.jsxs(a.Fragment,{children:["Allow read from"," ",a.jsx("span",{className:"font-mono text-[var(--app-primary-foreground)]",children:h}),"?"]})}return t.kind==="switch_mode"?"Would you like to proceed?":t.title||"Permission Required"};C.useEffect(()=>{const h=f=>{var m,D;if(!e)return;if(f.key.match(/^[1-9]$/)){const w=parseInt(f.key,10)-1;w<u.length&&(f.preventDefault(),r(u[w].optionId));return}if(f.key==="ArrowDown"||f.key==="ArrowUp"){if(f.preventDefault(),u.length===0)return;const w=u.length;f.key==="ArrowDown"?c(g=>(g+1)%w):c(g=>(g-1+w)%w)}if(f.key==="Enter"&&(f.preventDefault(),o<u.length&&r(u[o].optionId)),f.key==="Escape"){f.preventDefault();const w=((m=u.find(g=>g.kind.includes("reject")))==null?void 0:m.optionId)||((D=u.find(g=>g.optionId==="cancel"))==null?void 0:D.optionId)||"cancel";r(w),n&&n()}};return window.addEventListener("keydown",h),()=>window.removeEventListener("keydown",h)},[e,u,r,n,o]),C.useEffect(()=>{e&&s.current&&s.current.focus()},[e]),C.useEffect(()=>{e&&c(0)},[e,u.length]);const d=C.useMemo(()=>{if(!Array.isArray(t.content))return null;const h=[];for(const f of t.content){const v=f.type,m=f.content;if(v==="content"&&typeof m=="object"&&m!==null){const D=m;D.type==="text"&&typeof D.text=="string"&&h.push(D.text)}}return h.length>0?h.join(`\n\n`):null},[t.content]),p=t.kind==="switch_mode"?d:null,b=t.kind==="edit"||t.kind==="write"?d:null;return e?a.jsx("div",{className:"fixed inset-x-0 bottom-0 z-[1000] p-2",children:a.jsxs("div",{ref:s,className:`relative flex flex-col rounded-large border p-2 outline-none animate-slide-up${p||b?" max-h-[60vh]":""}`,style:{backgroundColor:"var(--app-input-secondary-background)",borderColor:"var(--app-input-border)"},tabIndex:0,"data-focused-index":o,children:[a.jsx("div",{className:"p-2 absolute inset-0 rounded-large",style:{backgroundColor:"var(--app-input-background)"}}),a.jsxs("div",{className:"relative z-[1] text-[1.1em] text-[var(--app-primary-foreground)] flex flex-col min-h-0",children:[a.jsx("div",{className:"font-bold text-[var(--app-primary-foreground)] mb-0.5",children:i()}),(t.kind==="edit"||t.kind==="write"||t.kind==="read"||t.kind==="execute"||t.kind==="bash"||Cr(t.toolName))&&t.title&&a.jsx("div",{className:"text-[13px] font-normal text-[var(--app-secondary-foreground)] opacity-90 font-mono whitespace-normal break-words q-line-clamp-3 mb-2",style:{fontSize:".9em",color:"var(--app-secondary-foreground)",marginBottom:"6px"},title:t.title,children:t.title})]}),p&&a.jsx("div",{className:"relative z-[1] overflow-y-auto mb-2 rounded-[4px] max-h-[40vh] py-2 px-3 text-[13px] leading-normal bg-[var(--app-primary-background)] border border-[var(--app-input-border)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--app-foreground-muted)]/30",children:a.jsx(Ce,{content:p})}),b&&a.jsx("pre",{className:"relative z-[1] overflow-y-auto mb-2 rounded-[4px] max-h-[40vh] py-2 px-3 text-[13px] leading-normal whitespace-pre-wrap break-words bg-[var(--app-primary-background)] border border-[var(--app-input-border)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--app-foreground-muted)]/30",children:b}),a.jsx("div",{className:"relative z-[1] flex flex-col gap-1 pb-1",children:u.map((h,f)=>{const v=o===f;return a.jsxs("button",{className:`flex items-center gap-2 px-2 py-1.5 text-left w-full box-border rounded-[4px] border-0 shadow-[inset_0_0_0_1px_var(--app-transparent-inner-border)] transition-colors duration-150 text-[var(--app-primary-foreground)] hover:bg-[var(--app-button-background)] ${v?"text-[var(--app-list-active-foreground)] bg-[var(--app-list-active-background)] hover:text-[var(--app-button-foreground)] hover:font-bold hover:relative hover:border-0":"hover:bg-[var(--app-button-background)] hover:text-[var(--app-button-foreground)] hover:font-bold hover:relative hover:border-0"}`,onClick:()=>r(h.optionId),onMouseEnter:()=>c(f),children:[a.jsx("span",{className:"inline-flex items-center justify-center min-w-[10px] h-5 font-semibold opacity-60",children:f+1}),a.jsx("span",{className:"font-semibold",children:h.name})]},h.optionId)})})]})}):null};/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const za=({name:e,size:u=24,color:t="currentColor",className:r=""})=>a.jsx("svg",{width:u,height:u,viewBox:"0 0 24 24",fill:t,className:r,children:a.jsx("text",{x:"50%",y:"50%",dominantBaseline:"middle",textAnchor:"middle",fontSize:"10",children:e})});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const ja=({size:e=24,color:u="currentColor",className:t=""})=>a.jsxs("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:u,strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:t,children:[a.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),a.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const qa=({size:e=24,color:u="currentColor",className:t=""})=>a.jsxs("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:u,strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className:t,children:[a.jsx("line",{x1:"22",y1:"2",x2:"11",y2:"13"}),a.jsx("polygon",{points:"22 2 15 22 11 13 2 9 22 2"})]});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const Ha=()=>{const[e,u]=C.useState("auto");return C.useEffect(()=>{const r=localStorage.getItem("theme");if(r)u(r);else{const n=window.matchMedia("(prefers-color-scheme: dark)").matches;u(n?"dark":"light")}},[]),{theme:e,toggleTheme:()=>{const r=e==="light"?"dark":"light";u(r),localStorage.setItem("theme",r)}}};/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const Za=(e,u)=>{const[t,r]=C.useState(()=>{try{const c=window.localStorage.getItem(e);return c?JSON.parse(c):u}catch{return u}}),n=c=>{r(s=>{try{return c instanceof Function?c(s):c}catch(l){return console.error(l),s}})},o=C.useRef(null);return C.useEffect(()=>{const c=JSON.stringify(t);if(o.current===c)return;const s=o.current===null;if(o.current=c,!s)try{window.localStorage.setItem(e,c)}catch(l){console.error(l)}},[e,t]),[t,n]};/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const fe=Object.freeze({suggestion:null,isVisible:!1,shownAt:0});/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */const Va=300,Ua=100;function Wa(e){const{enabled:u=!0,onStateChange:t,getOnAccept:r,onOutcome:n}=e;let o=fe,c=null,s=!1,l=null;function i(m){o=m,t(m)}function d(){c&&(clearTimeout(c),c=null),l&&(clearTimeout(l),l=null)}return{setSuggestion:m=>{if(c&&(clearTimeout(c),c=null),!m){i(fe);return}u&&(c=setTimeout(()=>{i({suggestion:m,isVisible:!0,shownAt:Date.now()})},Va))},accept:(m,D)=>{if(s)return;c&&(clearTimeout(c),c=null),s=!0;const w=o.suggestion,{shownAt:g}=o;if(!w){s=!1;return}try{n==null||n({outcome:"accepted",accept_method:m,time_ms:g>0?Date.now()-g:0,suggestion_length:w.length})}catch(k){console.error("[followup] onOutcome callback threw:",k)}i(fe),queueMicrotask(()=>{var k;try{D!=null&&D.skipOnAccept||(k=r==null?void 0:r())==null||k(w)}catch(y){console.error("[followup] onAccept callback threw:",y)}finally{l&&clearTimeout(l),l=setTimeout(()=>{s=!1},Ua)}})},dismiss:()=>{if(c&&(clearTimeout(c),c=null),!(!o.isVisible&&!o.suggestion)){if(o.isVisible&&o.suggestion)try{n==null||n({outcome:"ignored",time_ms:o.shownAt>0?Date.now()-o.shownAt:0,suggestion_length:o.suggestion.length})}catch(m){console.error("[followup] onOutcome callback threw:",m)}i(fe)}},clear:()=>{d(),s=!1,i(fe)},cleanup:()=>{d(),s=!1}}}function Ga(e={}){const{enabled:u=!0,onAccept:t,onOutcome:r}=e,[n,o]=C.useState(fe),c=C.useRef(t);c.current=t;const s=C.useRef(r);s.current=r;const l=C.useMemo(()=>Wa({enabled:u,onStateChange:o,getOnAccept:()=>c.current,onOutcome:d=>{var p;return(p=s.current)==null?void 0:p.call(s,d)}}),[u]);C.useEffect(()=>(u||l.clear(),()=>l.cleanup()),[l,u]);const i=C.useCallback(d=>n.isVisible&&n.suggestion?n.suggestion:d,[n.isVisible,n.suggestion]);return C.useMemo(()=>({state:n,getPlaceholder:i,setSuggestion:l.setSuggestion,accept:l.accept,dismiss:l.dismiss,clear:l.clear}),[n,i,l])}/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Adapter for JSONL format messages (used by ChatViewer)\n */function Xa(e){var u;return e?(u=e.parts)!=null&&u.length?e.parts.map(t=>t.text).join(""):typeof e.content=="string"?e.content:Array.isArray(e.content)?e.content.filter(t=>typeof t=="object"&&t!==null&&"type"in t&&t.type==="text").map(t=>t.text).join(""):"":""}function ku(e){const u=Date.parse(e);return isNaN(u)?Date.now():u}function Ja(e){var u;return e.type==="tool_call"?"tool_call":e.type==="user"?"user":((u=e.message)==null?void 0:u.role)==="thinking"?"thinking":"assistant"}function Er(e){return!e||e.type==="user"}function Ka(e){return[...e].sort((t,r)=>ku(t.timestamp)-ku(r.timestamp)).map((t,r,n)=>{const o=n[r-1],c=n[r+1],s=Er(o),l=Er(c),i=Ja(t),d=kr(t);return{id:t.uuid,type:i,timestamp:ku(t.timestamp),content:i!=="tool_call"?d??Xa(t.message):void 0,toolCall:t.toolCall,isFirst:s,isLast:l}})}function Qa(e){return e.filter(u=>u.type==="tool_call"?!0:u.content&&u.content.trim().length>0)}/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Adapter for ACP protocol messages (used by vscode-ide-companion)\n */function Dr(e){if(!e)return!0;if(e.type!=="message")return!1;const u=e.data;return(u==null?void 0:u.role)==="user"}function Ya(e){return e.map((u,t,r)=>{const n=r[t-1],o=r[t+1],c=Dr(n),s=Dr(o);switch(u.type){case"message":{const l=u.data;return{id:`msg-${t}`,type:l.role==="user"?"user":l.role==="thinking"?"thinking":"assistant",timestamp:l.timestamp||Date.now(),content:l.content,fileContext:l.fileContext,isFirst:c,isLast:s}}case"in-progress-tool-call":case"completed-tool-call":{const l=u.data;return{id:`tool-${l.toolCallId}-${u.type}`,type:"tool_call",timestamp:Date.now(),toolCall:l,isFirst:c,isLast:s}}default:return{id:`unknown-${t}`,type:"assistant",timestamp:Date.now(),content:"",isFirst:c,isLast:s}}})}function Ra(e){return typeof e=="object"&&e!==null&&"toolCallId"in e&&"kind"in e}function ec(e){return typeof e=="object"&&e!==null&&"role"in e&&"content"in e}const uc=({children:e,className:u=""})=>a.jsx("div",{className:`qwen-webui-container ${u}`,children:e});x.AgentToolCall=nr,x.ArrowUpIcon=Du,x.AskUserQuestionDialog=ia,x.AssistantMessage=Jt,x.AutoEditIcon=Lu,x.Button=wr,x.ChatHeader=Vr,x.ChatViewer=vu,x.ChatViewerDefault=vu,x.CheckboxDisplay=dr,x.ChevronDownIcon=Cu,x.CloseIcon=ja,x.CloseSmallIcon=Au,x.CloseXIcon=Hr,x.CodeBlock=ba,x.CodeBracketsIcon=Pu,x.CollapsibleFileContent=qt,x.CompletionMenu=Tu,x.Container=Mr,x.ContextIndicator=Su,x.CopyButton=bu,x.EditPencilIcon=Ue,x.EditToolCall=ar,x.EmptyState=Gr,x.ExpandControlContext=Ne,x.FileIcon=ta,x.FileLink=j,x.FileListIcon=ra,x.FolderIcon=oa,x.Footer=Br,x.GenericToolCall=tr,x.Header=Lr,x.HideContextIcon=Bu,x.Icon=za,x.ImageMessageRenderer=fa,x.ImagePreview=da,x.Input=_r,x.InputForm=Rr,x.InsightProgressCard=la,x.InterruptedMessage=cn,x.LinkIcon=zu,x.LocationsList=Kt,x.Main=Pr,x.MarkdownRenderer=Ce,x.Message=un,x.MessageContent=ie,x.MessageInput=tn,x.MessageList=rn,x.Onboarding=en,x.OpenDiffIcon=Xr,x.PermissionDrawer=Oa,x.PlanCompletedIcon=Wo,x.PlanInProgressIcon=Go,x.PlanModeIcon=$u,x.PlanPendingIcon=Xo,x.PlatformContext=Ve,x.PlatformProvider=Tr,x.PlusIcon=Eu,x.PlusSmallIcon=qr,x.ReadToolCall=br,x.RefreshIcon=Zr,x.SaveDocumentIcon=na,x.SearchIcon=Fu,x.SearchToolCall=ir,x.SelectionIcon=Yo,x.SendIcon=qa,x.SessionSelector=Wr,x.ShellToolCall=hr,x.Sidebar=$r,x.SlashCommandIcon=Ou,x.StatusIndicator=ha,x.StopIcon=ju,x.SymbolIcon=Qo,x.TerminalIcon=ca,x.ThinkToolCall=er,x.ThinkingIcon=aa,x.ThinkingMessage=Gt,x.ToolCallCard=Ee,x.ToolCallContainer=O,x.ToolCallRow=W,x.Tooltip=Nu,x.UndoIcon=Jr,x.UpdatedPlanToolCall=pr,x.UserIcon=Ko,x.UserMessage=Ut,x.WaitingMessage=an,x.WarningTriangleIcon=Jo,x.WebFetchToolCall=gr,x.WebviewContainer=uc,x.WriteToolCall=cr,x.ZERO_WIDTH_SPACE=Qr,x.adaptACPMessages=Ya,x.adaptJSONLMessages=Ka,x.extractCommandOutput=Yt,x.filterEmptyMessages=Qa,x.formatValue=qe,x.getEditModeIcon=Yr,x.getTimeAgo=Mu,x.getToolCallComponent=mr,x.groupContent=G,x.groupSessionsByDate=Iu,x.handleCopyToClipboard=Qt,x.hasToolCallOutput=xa,x.isAgentExecutionRawOutput=rr,x.isAgentExecutionToolCall=xu,x.isMessageData=ec,x.isToolCallData=Ra,x.mapToolStatusToContainerStatus=Z,x.parseContentWithFileReferences=jt,x.safeTitle=te,x.shouldShowToolCall=Rt,x.stripZeroWidthSpaces=Te,x.useControlledExpanded=ne,x.useExpandControl=Ir,x.useFollowupSuggestions=Ga,x.useLocalStorage=Za,x.usePlatform=re,x.useTheme=Ha,Object.defineProperty(x,Symbol.toStringTag,{value:"Module"})});;\n    </script>\n    <style>\n      /**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n */*,:before,:after{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x: 0;--tw-border-spacing-y: 0;--tw-translate-x: 0;--tw-translate-y: 0;--tw-rotate: 0;--tw-skew-x: 0;--tw-skew-y: 0;--tw-scale-x: 1;--tw-scale-y: 1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness: proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width: 0px;--tw-ring-offset-color: #fff;--tw-ring-color: rgb(59 130 246 / .5);--tw-ring-offset-shadow: 0 0 #0000;--tw-ring-shadow: 0 0 #0000;--tw-shadow: 0 0 #0000;--tw-shadow-colored: 0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }/*! tailwindcss v3.4.18 | MIT License | https://tailwindcss.com\n */*,:before,:after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}:before,:after{--tw-content: ""}html,:host{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:var(--app-font-sans, system-ui, sans-serif);font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var(--app-font-mono, ui-monospace, monospace);font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dl,dd,h1,h2,h3,h4,h5,h6,hr,figure,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}ol,ul,menu{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}button,[role=button]{cursor:pointer}:disabled{cursor:default}img,svg,video,canvas,audio,iframe,embed,object{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.container{width:100%}@media (min-width: 640px){.container{max-width:640px}}@media (min-width: 768px){.container{max-width:768px}}@media (min-width: 1024px){.container{max-width:1024px}}@media (min-width: 1280px){.container{max-width:1280px}}@media (min-width: 1536px){.container{max-width:1536px}}.pointer-events-none{pointer-events:none}.pointer-events-auto{pointer-events:auto}.\\!visible{visibility:visible!important}.visible{visibility:visible}.invisible{visibility:hidden}.collapse{visibility:collapse}.static{position:static}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.inset-0{top:0;right:0;bottom:0;left:0}.inset-x-0{left:0;right:0}.inset-x-4{left:1rem;right:1rem}.-right-2{right:-.5rem}.-top-2{top:-.5rem}.-top-7{top:-1.75rem}.bottom-0{bottom:0}.bottom-4{bottom:1rem}.bottom-full{bottom:100%}.left-0{left:0}.left-1\\/2{left:50%}.left-3{left:.75rem}.left-\\[3px\\]{left:3px}.left-full{left:100%}.right-0{right:0}.right-3{right:.75rem}.right-full{right:100%}.top-0{top:0}.top-1\\/2{top:50%}.top-\\[-0\\.1em\\]{top:-.1em}.top-\\[10px\\]{top:10px}.top-\\[3px\\]{top:3px}.top-full{top:100%}.z-50{z-index:50}.z-\\[1000\\]{z-index:1000}.z-\\[1\\]{z-index:1}.z-\\[999\\]{z-index:999}.col-start-3{grid-column-start:3}.row-span-2{grid-row:span 2 / span 2}.m-0{margin:0}.m-\\[2px\\]{margin:2px}.mx-1{margin-left:.25rem;margin-right:.25rem}.mx-auto{margin-left:auto;margin-right:auto}.my-1{margin-top:.25rem;margin-bottom:.25rem}.my-2{margin-top:.5rem;margin-bottom:.5rem}.mb-0\\.5{margin-bottom:.125rem}.mb-1{margin-bottom:.25rem}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.mb-4{margin-bottom:1rem}.mb-\\[2px\\]{margin-bottom:2px}.ml-2{margin-left:.5rem}.ml-4{margin-left:1rem}.ml-8{margin-left:2rem}.ml-auto{margin-left:auto}.mr-1\\.5{margin-right:.375rem}.mt-1{margin-top:.25rem}.mt-3{margin-top:.75rem}.mt-4{margin-top:1rem}.mt-\\[2px\\]{margin-top:2px}.box-border{box-sizing:border-box}.\\!block{display:block!important}.block{display:block}.inline-block{display:inline-block}.inline{display:inline}.flex{display:flex}.inline-flex{display:inline-flex}.table{display:table}.grid{display:grid}.contents{display:contents}.hidden{display:none}.h-1{height:.25rem}.h-1\\.5{height:.375rem}.h-14{height:3.5rem}.h-2{height:.5rem}.h-4{height:1rem}.h-5{height:1.25rem}.h-6{height:1.5rem}.h-\\[60px\\]{height:60px}.h-\\[80px\\]{height:80px}.h-full{height:100%}.max-h-\\[100px\\]{max-height:100px}.max-h-\\[300px\\]{max-height:300px}.max-h-\\[40vh\\]{max-height:40vh}.max-h-\\[50vh\\]{max-height:50vh}.max-h-\\[60vh\\]{max-height:60vh}.max-h-\\[min\\(500px\\,50vh\\)\\]{max-height:min(500px,50vh)}.min-h-0{min-height:0px}.min-h-6{min-height:1.5rem}.w-1\\.5{width:.375rem}.w-14{width:3.5rem}.w-2{width:.5rem}.w-2\\.5{width:.625rem}.w-4{width:1rem}.w-5{width:1.25rem}.w-6{width:1.5rem}.w-\\[60px\\]{width:60px}.w-\\[80px\\]{width:80px}.w-\\[min\\(400px\\,calc\\(100vw-32px\\)\\)\\]{width:min(400px,calc(100vw - 32px))}.w-full{width:100%}.min-w-0{min-width:0px}.min-w-\\[10px\\]{min-width:10px}.min-w-\\[18px\\]{min-width:18px}.max-w-\\[300px\\]{max-width:300px}.max-w-\\[400px\\]{max-width:400px}.max-w-\\[50\\%\\]{max-width:50%}.max-w-full{max-width:100%}.max-w-md{max-width:28rem}.max-w-sm{max-width:24rem}.max-w-xs{max-width:20rem}.flex-1{flex:1 1 0%}.flex-shrink-0,.shrink-0{flex-shrink:0}.grow{flex-grow:1}.-translate-x-1\\/2{--tw-translate-x: -50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-x-full{--tw-translate-x: -100%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-y-1{--tw-translate-y: -.25rem;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-translate-y-1\\/2{--tw-translate-y: -50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-0{--tw-translate-x: 0px;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-x-1\\/2{--tw-translate-x: 50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-y-1{--tw-translate-y: .25rem;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-y-1\\/2{--tw-translate-y: 50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.translate-y-\\[-50\\%\\]{--tw-translate-y: -50%;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.-rotate-45{--tw-rotate: -45deg;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.animate-\\[fadeIn_0\\.2s_ease-in\\]{animation:fadeIn .2s ease-in}@keyframes completion-menu-enter{0%{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.animate-completion-menu-enter{animation:completion-menu-enter .15s ease-out both}@keyframes slide-up{0%{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}.animate-slide-up{animation:slide-up .2s ease-out both}@keyframes spin{to{transform:rotate(360deg)}}.animate-spin{animation:spin 1s linear infinite}.cursor-default{cursor:default}.cursor-not-allowed{cursor:not-allowed}.cursor-pointer{cursor:pointer}.select-none{-webkit-user-select:none;-moz-user-select:none;user-select:none}.select-text{-webkit-user-select:text;-moz-user-select:text;user-select:text}.resize{resize:both}.list-none{list-style-type:none}.appearance-none{-webkit-appearance:none;-moz-appearance:none;appearance:none}.grid-cols-\\[80px_1fr\\]{grid-template-columns:80px 1fr}.grid-cols-\\[auto_1fr\\]{grid-template-columns:auto 1fr}.grid-cols-\\[max-content_1fr\\]{grid-template-columns:max-content 1fr}.grid-cols-\\[minmax\\(0\\,1fr\\)_auto\\]{grid-template-columns:minmax(0,1fr) auto}.flex-row{flex-direction:row}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-start{align-items:flex-start}.items-center{align-items:center}.items-baseline{align-items:baseline}.justify-start{justify-content:flex-start}.justify-end{justify-content:flex-end}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-0{gap:0px}.gap-0\\.5{gap:.125rem}.gap-1{gap:.25rem}.gap-1\\.5{gap:.375rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-6{gap:1.5rem}.gap-8{gap:2rem}.gap-\\[2px\\]{gap:2px}.gap-\\[3px\\]{gap:3px}.gap-\\[var\\(--app-list-gap\\)\\]{gap:var(--app-list-gap)}.gap-x-4{-moz-column-gap:1rem;column-gap:1rem}.gap-y-1{row-gap:.25rem}.self-center{align-self:center}.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}.overflow-y-auto{overflow-y:auto}.overflow-y-hidden{overflow-y:hidden}.truncate{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.text-ellipsis{text-overflow:ellipsis}.whitespace-normal{white-space:normal}.whitespace-nowrap{white-space:nowrap}.whitespace-pre-wrap{white-space:pre-wrap}.break-words{overflow-wrap:break-word}.break-all{word-break:break-all}.rounded{border-radius:.25rem}.rounded-\\[2px\\]{border-radius:2px}.rounded-\\[4px\\]{border-radius:4px}.rounded-\\[5px\\]{border-radius:5px}.rounded-\\[var\\(--app-list-border-radius\\)\\]{border-radius:var(--app-list-border-radius)}.rounded-\\[var\\(--corner-radius-small\\)\\]{border-radius:var(--corner-radius-small)}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:.5rem}.rounded-md{border-radius:.375rem}.rounded-sm{border-radius:.125rem}.border{border-width:1px}.border-0{border-width:0px}.border-2{border-width:2px}.border-\\[0\\.5px\\]{border-width:.5px}.border-b{border-bottom-width:1px}.border-b-2{border-bottom-width:2px}.border-l{border-left-width:1px}.border-l-2{border-left-width:2px}.border-t{border-top-width:1px}.border-none{border-style:none}.border-\\[\\#74c991\\]{--tw-border-opacity: 1;border-color:rgb(116 201 145 / var(--tw-border-opacity, 1))}.border-\\[var\\(--app-input-border\\)\\]{border-color:var(--app-input-border)}.border-\\[var\\(--app-input-border\\,\\#374151\\)\\]{border-color:var(--app-input-border,#374151)}.border-\\[var\\(--app-primary-border-color\\)\\]{border-color:var(--app-primary-border-color)}.border-\\[var\\(--vscode-focusBorder\\)\\]{border-color:var(--vscode-focusBorder)}.border-\\[var\\(--vscode-inputValidation-errorBorder\\,\\#be1100\\)\\]{border-color:var(--vscode-inputValidation-errorBorder,#be1100)}.border-gray-300{--tw-border-opacity: 1;border-color:rgb(209 213 219 / var(--tw-border-opacity, 1))}.border-gray-500{--tw-border-opacity: 1;border-color:rgb(107 114 128 / var(--tw-border-opacity, 1))}.border-gray-600{--tw-border-opacity: 1;border-color:rgb(75 85 99 / var(--tw-border-opacity, 1))}.border-red-500{--tw-border-opacity: 1;border-color:rgb(239 68 68 / var(--tw-border-opacity, 1))}.border-transparent{border-color:transparent}.bg-\\[\\#2196f3\\]{--tw-bg-opacity: 1;background-color:rgb(33 150 243 / var(--tw-bg-opacity, 1))}.bg-\\[\\#4caf50\\]{--tw-bg-opacity: 1;background-color:rgb(76 175 80 / var(--tw-bg-opacity, 1))}.bg-\\[\\#f44336\\]{--tw-bg-opacity: 1;background-color:rgb(244 67 54 / var(--tw-bg-opacity, 1))}.bg-\\[\\#ffc107\\]{--tw-bg-opacity: 1;background-color:rgb(255 193 7 / var(--tw-bg-opacity, 1))}.bg-\\[var\\(--app-background\\)\\]{background-color:var(--app-background)}.bg-\\[var\\(--app-button-background\\)\\]{background-color:var(--app-button-background)}.bg-\\[var\\(--app-button-secondary-background\\)\\]{background-color:var(--app-button-secondary-background)}.bg-\\[var\\(--app-header-background\\)\\]{background-color:var(--app-header-background)}.bg-\\[var\\(--app-input-background\\)\\]{background-color:var(--app-input-background)}.bg-\\[var\\(--app-list-active-background\\)\\]{background-color:var(--app-list-active-background)}.bg-\\[var\\(--app-menu-background\\)\\]{background-color:var(--app-menu-background)}.bg-\\[var\\(--app-primary\\,var\\(--app-button-background\\)\\)\\]{background-color:var(--app-primary,var(--app-button-background))}.bg-\\[var\\(--app-primary-background\\)\\]{background-color:var(--app-primary-background)}.bg-\\[var\\(--app-primary-background\\,\\#1f2937\\)\\]{background-color:var(--app-primary-background,#1f2937)}.bg-\\[var\\(--app-tool-background\\)\\]{background-color:var(--app-tool-background)}.bg-\\[var\\(--vscode-input-background\\,var\\(--app-input-background\\)\\)\\]{background-color:var(--vscode-input-background,var(--app-input-background))}.bg-\\[var\\(--vscode-inputValidation-errorBackground\\,\\#5a1d1d\\)\\]{background-color:var(--vscode-inputValidation-errorBackground,#5a1d1d)}.bg-blue-500{--tw-bg-opacity: 1;background-color:rgb(59 130 246 / var(--tw-bg-opacity, 1))}.bg-blue-600{--tw-bg-opacity: 1;background-color:rgb(37 99 235 / var(--tw-bg-opacity, 1))}.bg-gray-100{--tw-bg-opacity: 1;background-color:rgb(243 244 246 / var(--tw-bg-opacity, 1))}.bg-gray-200{--tw-bg-opacity: 1;background-color:rgb(229 231 235 / var(--tw-bg-opacity, 1))}.bg-gray-500{--tw-bg-opacity: 1;background-color:rgb(107 114 128 / var(--tw-bg-opacity, 1))}.bg-gray-700{--tw-bg-opacity: 1;background-color:rgb(55 65 81 / var(--tw-bg-opacity, 1))}.bg-red-600{--tw-bg-opacity: 1;background-color:rgb(220 38 38 / var(--tw-bg-opacity, 1))}.bg-transparent{background-color:transparent}.bg-white{--tw-bg-opacity: 1;background-color:rgb(255 255 255 / var(--tw-bg-opacity, 1))}.bg-gradient-to-b{background-image:linear-gradient(to bottom,var(--tw-gradient-stops))}.from-transparent{--tw-gradient-from: transparent var(--tw-gradient-from-position);--tw-gradient-to: rgb(0 0 0 / 0) var(--tw-gradient-to-position);--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to)}.to-\\[var\\(--app-primary-background\\)\\]{--tw-gradient-to: var(--app-primary-background) var(--tw-gradient-to-position)}.object-contain{-o-object-fit:contain;object-fit:contain}.object-cover{-o-object-fit:cover;object-fit:cover}.p-0{padding:0}.p-0\\.5{padding:.125rem}.p-1{padding:.25rem}.p-2{padding:.5rem}.p-3{padding:.75rem}.p-4{padding:1rem}.p-5{padding:1.25rem}.p-\\[var\\(--app-list-item-padding\\)\\]{padding:var(--app-list-item-padding)}.p-\\[var\\(--app-list-padding\\)\\]{padding:var(--app-list-padding)}.px-1\\.5{padding-left:.375rem;padding-right:.375rem}.px-2{padding-left:.5rem;padding-right:.5rem}.px-2\\.5{padding-left:.625rem;padding-right:.625rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-4{padding-left:1rem;padding-right:1rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.px-\\[30px\\]{padding-left:30px;padding-right:30px}.py-0{padding-top:0;padding-bottom:0}.py-0\\.5{padding-top:.125rem;padding-bottom:.125rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-1\\.5{padding-top:.375rem;padding-bottom:.375rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.pb-1{padding-bottom:.25rem}.pb-2{padding-bottom:.5rem}.pb-4{padding-bottom:1rem}.pl-1{padding-left:.25rem}.pl-10{padding-left:2.5rem}.pl-\\[30px\\]{padding-left:30px}.pr-10{padding-right:2.5rem}.pr-2{padding-right:.5rem}.pt-1{padding-top:.25rem}.pt-\\[2px\\]{padding-top:2px}.text-left{text-align:left}.text-center{text-align:center}.align-middle{vertical-align:middle}.font-mono{font-family:var(--app-font-mono, ui-monospace, monospace)}.text-2xl{font-size:1.5rem;line-height:2rem}.text-\\[0\\.75em\\]{font-size:.75em}.text-\\[0\\.85em\\]{font-size:.85em}.text-\\[0\\.8em\\]{font-size:.8em}.text-\\[0\\.9em\\]{font-size:.9em}.text-\\[1\\.1em\\]{font-size:1.1em}.text-\\[11px\\]{font-size:11px}.text-\\[12px\\]{font-size:12px}.text-\\[13px\\]{font-size:13px}.text-\\[14px\\]{font-size:14px}.text-\\[15px\\]{font-size:15px}.text-\\[16px\\]{font-size:16px}.text-\\[1em\\]{font-size:1em}.text-\\[8px\\]{font-size:8px}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xs{font-size:.75rem;line-height:1rem}.font-\\[600\\]{font-weight:600}.font-\\[var\\(--vscode-chat-font-family\\)\\]{font-weight:var(--vscode-chat-font-family)}.font-bold{font-weight:700}.font-medium{font-weight:500}.font-normal{font-weight:400}.font-semibold{font-weight:600}.uppercase{text-transform:uppercase}.capitalize{text-transform:capitalize}.italic{font-style:italic}.tabular-nums{--tw-numeric-spacing: tabular-nums;font-variant-numeric:var(--tw-ordinal) var(--tw-slashed-zero) var(--tw-numeric-figure) var(--tw-numeric-spacing) var(--tw-numeric-fraction)}.leading-5{line-height:1.25rem}.leading-6{line-height:1.5rem}.leading-\\[1\\.5\\]{line-height:1.5}.leading-none{line-height:1}.leading-normal{line-height:1.5}.leading-relaxed{line-height:1.625}.leading-tight{line-height:1.25}.tracking-wider{letter-spacing:.05em}.text-\\[\\#74c991\\]{--tw-text-opacity: 1;color:rgb(116 201 145 / var(--tw-text-opacity, 1))}.text-\\[\\#c74e39\\]{--tw-text-opacity: 1;color:rgb(199 78 57 / var(--tw-text-opacity, 1))}.text-\\[\\#e1c08d\\]{--tw-text-opacity: 1;color:rgb(225 192 141 / var(--tw-text-opacity, 1))}.text-\\[var\\(--app-button-foreground\\)\\]{color:var(--app-button-foreground)}.text-\\[var\\(--app-button-foreground\\,\\#ffffff\\)\\]{color:var(--app-button-foreground,#ffffff)}.text-\\[var\\(--app-list-active-foreground\\)\\]{color:var(--app-list-active-foreground)}.text-\\[var\\(--app-menu-foreground\\)\\]{color:var(--app-menu-foreground)}.text-\\[var\\(--app-monospace-font-size\\)\\]{color:var(--app-monospace-font-size)}.text-\\[var\\(--app-primary-foreground\\)\\]{color:var(--app-primary-foreground)}.text-\\[var\\(--app-primary-foreground\\,\\#f9fafb\\)\\]{color:var(--app-primary-foreground,#f9fafb)}.text-\\[var\\(--app-secondary-foreground\\)\\]{color:var(--app-secondary-foreground)}.text-\\[var\\(--vscode-chat-font-size\\,13px\\)\\]{color:var(--vscode-chat-font-size,13px)}.text-\\[var\\(--vscode-descriptionForeground\\)\\]{color:var(--vscode-descriptionForeground)}.text-\\[var\\(--vscode-errorForeground\\,\\#f48771\\)\\]{color:var(--vscode-errorForeground,#f48771)}.text-\\[var\\(--vscode-foreground\\)\\]{color:var(--vscode-foreground)}.text-\\[var\\(--vscode-input-foreground\\,var\\(--app-primary-foreground\\)\\)\\]{color:var(--vscode-input-foreground,var(--app-primary-foreground))}.text-\\[var\\(--vscode-symbolIcon-fileForeground\\,\\#cccccc\\)\\]{color:var(--vscode-symbolIcon-fileForeground,#cccccc)}.text-app-primary-foreground{color:var(--app-primary-foreground, #ffffff)}.text-gray-500{--tw-text-opacity: 1;color:rgb(107 114 128 / var(--tw-text-opacity, 1))}.text-gray-700{--tw-text-opacity: 1;color:rgb(55 65 81 / var(--tw-text-opacity, 1))}.text-gray-800{--tw-text-opacity: 1;color:rgb(31 41 55 / var(--tw-text-opacity, 1))}.text-green-500{--tw-text-opacity: 1;color:rgb(34 197 94 / var(--tw-text-opacity, 1))}.text-red-600{--tw-text-opacity: 1;color:rgb(220 38 38 / var(--tw-text-opacity, 1))}.text-white{--tw-text-opacity: 1;color:rgb(255 255 255 / var(--tw-text-opacity, 1))}.line-through{text-decoration-line:line-through}.no-underline{text-decoration-line:none}.opacity-0{opacity:0}.opacity-100{opacity:1}.opacity-25{opacity:.25}.opacity-50{opacity:.5}.opacity-60{opacity:.6}.opacity-70{opacity:.7}.opacity-75{opacity:.75}.opacity-85{opacity:.85}.opacity-90{opacity:.9}.shadow-\\[0_0_0_1px_var\\(--vscode-focusBorder\\)\\]{--tw-shadow: 0 0 0 1px var(--vscode-focusBorder);--tw-shadow-colored: 0 0 0 1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.shadow-\\[0_4px_16px_rgba\\(0\\,0\\,0\\,0\\.1\\)\\]{--tw-shadow: 0 4px 16px rgba(0,0,0,.1);--tw-shadow-colored: 0 4px 16px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.shadow-\\[inset_0_0_0_1px_var\\(--app-transparent-inner-border\\)\\]{--tw-shadow: inset 0 0 0 1px var(--app-transparent-inner-border);--tw-shadow-colored: inset 0 0 0 1px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.shadow-lg{--tw-shadow: 0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1);--tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.shadow-sm{--tw-shadow: 0 1px 2px 0 rgb(0 0 0 / .05);--tw-shadow-colored: 0 1px 2px 0 var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow, 0 0 #0000),var(--tw-ring-shadow, 0 0 #0000),var(--tw-shadow)}.outline-none{outline:2px solid transparent;outline-offset:2px}.outline{outline-style:solid}.ring{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-colors{transition-property:color,background-color,border-color,text-decoration-color,fill,stroke;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-opacity{transition-property:opacity;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.transition-transform{transition-property:transform;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.duration-100{transition-duration:.1s}.duration-150{transition-duration:.15s}.duration-200{transition-duration:.2s}.ease-in-out{transition-timing-function:cubic-bezier(.4,0,.2,1)}.ease-out{transition-timing-function:cubic-bezier(0,0,.2,1)}.\\[scrollbar-width\\:thin\\]{scrollbar-width:thin}:root{--app-primary: #3b82f6;--app-primary-hover: #2563eb;--app-primary-foreground: #e4e4e7;--app-secondary-foreground: #a1a1aa;--app-background: #1e1e1e;--app-primary-background: #1e1e1e;--app-background-secondary: #252526;--app-secondary-background: #252526;--app-background-tertiary: #2d2d2d;--app-foreground: #e4e4e7;--app-foreground-secondary: #a1a1aa;--app-foreground-muted: #71717a;--app-border: #3f3f46;--app-border-focus: #3b82f6;--app-primary-border-color: #3f3f46;--app-success: #10b981;--app-warning: #f59e0b;--app-error: #ef4444;--app-info: #3b82f6;--app-font-sans: system-ui, -apple-system, sans-serif;--app-font-mono: var( --app-monospace-font-family, ui-monospace, "SF Mono", monospace );--app-monospace-font-size: 13px;--font-size-xs: 11px;--app-link-foreground: #007acc;--app-link-active-foreground: #005a9e;--app-qwen-ivory: #f5f5dc;--app-radius-sm: .25rem;--app-radius-md: .375rem;--app-radius-lg: .5rem;--qwen-corner-radius-small: 6px;--qwen-corner-radius-medium: 8px;--corner-radius-small: var(--app-radius-sm, 4px);--corner-radius-medium: var(--app-radius-md, 6px);--border-radius-medium: var(--corner-radius-medium, 6px);--app-spacing-xs: .25rem;--app-spacing-sm: .5rem;--app-spacing-md: 1rem;--app-spacing-medium: 8px;--app-spacing-lg: 1.5rem;--app-spacing-xl: 2rem;--spacing-medium: var(--app-spacing-medium, 8px);--spacing-large: 12px;--app-input-background: #3c3c3c;--app-input-secondary-background: #2d2d2d;--app-input-border: #3f3f46;--app-input-foreground: #e4e4e7;--app-input-placeholder-foreground: #71717a;--app-ghost-button-hover-background: rgba(90, 93, 94, .31);--app-button-background: #3c3c3c;--app-button-foreground: #ffffff;--app-button-hover-background: var(--app-primary-hover);--app-transparent-inner-border: rgba(255, 255, 255, .1);--app-header-background: #252526;--app-list-padding: 0px;--app-list-item-padding: 4px 8px;--app-list-border-color: transparent;--app-list-border-radius: 4px;--app-list-hover-background: rgba(90, 93, 94, .31);--app-list-active-background: #094771;--app-list-active-foreground: #ffffff;--app-list-gap: 2px;--app-menu-background: #252526;--app-menu-border: #454545;--app-menu-foreground: #cccccc;--app-menu-selection-background: #094771;--app-menu-selection-foreground: #ffffff;--app-tool-background: #1e1e1e;--app-code-background: #2d2d2d;--app-warning-background: rgba(255, 204, 0, .1);--app-warning-border: #ffcc00;--app-warning-foreground: #ffcc00;--vscode-chat-font-size: 13px;--vscode-chat-font-family: var(--app-font-sans);--vscode-focusBorder: var(--app-border-focus);--vscode-symbolIcon-fileForeground: var(--app-secondary-foreground)}@media (prefers-color-scheme: light){:root.auto-theme{--app-primary-foreground: #1f2937;--app-secondary-foreground: #6b7280;--app-background: #ffffff;--app-primary-background: #ffffff;--app-background-secondary: #f3f4f6;--app-background-tertiary: #e5e7eb;--app-foreground: #1f2937;--app-foreground-secondary: #6b7280;--app-foreground-muted: #9ca3af;--app-border: #e5e7eb;--app-primary-border-color: #e5e7eb;--app-input-background: #ffffff;--app-input-border: #d1d5db;--app-input-placeholder-foreground: #9ca3af;--app-ghost-button-hover-background: rgba(0, 0, 0, .05);--app-header-background: #f9fafb;--app-list-hover-background: rgba(0, 0, 0, .05);--app-list-active-background: #3b82f6;--app-menu-background: #ffffff;--app-menu-border: #e5e7eb;--app-menu-foreground: #1f2937;--app-tool-background: #ffffff;--app-code-background: #f3f4f6}}.placeholder\\:text-\\[var\\(--app-input-placeholder-foreground\\)\\]::-moz-placeholder{color:var(--app-input-placeholder-foreground)}.placeholder\\:text-\\[var\\(--app-input-placeholder-foreground\\)\\]::placeholder{color:var(--app-input-placeholder-foreground)}.placeholder\\:opacity-60::-moz-placeholder{opacity:.6}.placeholder\\:opacity-60::placeholder{opacity:.6}.focus-within\\:opacity-100:focus-within{opacity:1}.hover\\:relative:hover{position:relative}.hover\\:border-0:hover{border-width:0px}.hover\\:bg-\\[var\\(--app-button-background\\)\\]:hover{background-color:var(--app-button-background)}.hover\\:bg-\\[var\\(--app-code-background\\)\\]:hover{background-color:var(--app-code-background)}.hover\\:bg-\\[var\\(--app-ghost-button-hover-background\\)\\]:hover{background-color:var(--app-ghost-button-hover-background)}.hover\\:bg-\\[var\\(--app-input-background\\)\\]:hover{background-color:var(--app-input-background)}.hover\\:bg-\\[var\\(--app-input-border\\)\\]:hover{background-color:var(--app-input-border)}.hover\\:bg-\\[var\\(--app-list-active-background\\)\\]:hover{background-color:var(--app-list-active-background)}.hover\\:bg-\\[var\\(--app-list-hover-background\\)\\]:hover{background-color:var(--app-list-hover-background)}.hover\\:bg-\\[var\\(--app-primary-hover\\,var\\(--app-button-hover-background\\)\\)\\]:hover{background-color:var(--app-primary-hover,var(--app-button-hover-background))}.hover\\:bg-black\\/5:hover{background-color:#0000000d}.hover\\:bg-blue-700:hover{--tw-bg-opacity: 1;background-color:rgb(29 78 216 / var(--tw-bg-opacity, 1))}.hover\\:bg-gray-100:hover{--tw-bg-opacity: 1;background-color:rgb(243 244 246 / var(--tw-bg-opacity, 1))}.hover\\:bg-gray-300:hover{--tw-bg-opacity: 1;background-color:rgb(209 213 219 / var(--tw-bg-opacity, 1))}.hover\\:bg-gray-50:hover{--tw-bg-opacity: 1;background-color:rgb(249 250 251 / var(--tw-bg-opacity, 1))}.hover\\:bg-gray-800:hover{--tw-bg-opacity: 1;background-color:rgb(31 41 55 / var(--tw-bg-opacity, 1))}.hover\\:bg-red-700:hover{--tw-bg-opacity: 1;background-color:rgb(185 28 28 / var(--tw-bg-opacity, 1))}.hover\\:font-bold:hover{font-weight:700}.hover\\:text-\\[var\\(--app-button-foreground\\)\\]:hover{color:var(--app-button-foreground)}.hover\\:text-\\[var\\(--app-list-active-foreground\\)\\]:hover{color:var(--app-list-active-foreground)}.hover\\:text-\\[var\\(--app-primary-foreground\\)\\]:hover{color:var(--app-primary-foreground)}.hover\\:underline:hover{text-decoration-line:underline}.hover\\:\\!opacity-100:hover{opacity:1!important}.hover\\:opacity-100:hover{opacity:1}.hover\\:opacity-80:hover{opacity:.8}.focus\\:rounded-\\[2px\\]:focus{border-radius:2px}.focus\\:border-blue-500:focus{--tw-border-opacity: 1;border-color:rgb(59 130 246 / var(--tw-border-opacity, 1))}.focus\\:border-red-500:focus{--tw-border-opacity: 1;border-color:rgb(239 68 68 / var(--tw-border-opacity, 1))}.focus\\:bg-\\[var\\(--app-ghost-button-hover-background\\)\\]:focus{background-color:var(--app-ghost-button-hover-background)}.focus\\:opacity-100:focus{opacity:1}.focus\\:outline-none:focus{outline:2px solid transparent;outline-offset:2px}.focus\\:outline:focus{outline-style:solid}.focus\\:outline-1:focus{outline-width:1px}.focus\\:outline-offset-2:focus{outline-offset:2px}.focus\\:outline-\\[var\\(--vscode-focusBorder\\)\\]:focus{outline-color:var(--vscode-focusBorder)}.focus\\:ring-1:focus{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)}.focus\\:ring-2:focus{--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow, 0 0 #0000)}.focus\\:ring-blue-500:focus{--tw-ring-opacity: 1;--tw-ring-color: rgb(59 130 246 / var(--tw-ring-opacity, 1))}.focus\\:ring-gray-400:focus{--tw-ring-opacity: 1;--tw-ring-color: rgb(156 163 175 / var(--tw-ring-opacity, 1))}.focus\\:ring-gray-500:focus{--tw-ring-opacity: 1;--tw-ring-color: rgb(107 114 128 / var(--tw-ring-opacity, 1))}.focus\\:ring-red-500:focus{--tw-ring-opacity: 1;--tw-ring-color: rgb(239 68 68 / var(--tw-ring-opacity, 1))}.focus\\:ring-offset-2:focus{--tw-ring-offset-width: 2px}.active\\:scale-95:active{--tw-scale-x: .95;--tw-scale-y: .95;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skew(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.active\\:opacity-80:active{opacity:.8}.disabled\\:cursor-not-allowed:disabled{cursor:not-allowed}.disabled\\:opacity-30:disabled{opacity:.3}.group:hover .group-hover\\:flex{display:flex}.group:hover .group-hover\\:opacity-100{opacity:1}.group:hover .group-hover\\:opacity-70{opacity:.7}@media (min-width: 640px){.sm\\:inline{display:inline}}@media (min-width: 768px){.md\\:max-w-md{max-width:28rem}.md\\:p-10{padding:2.5rem}}@media (min-width: 1024px){.lg\\:max-w-lg{max-width:32rem}}@media (prefers-color-scheme: dark){.dark\\:border-gray-600{--tw-border-opacity: 1;border-color:rgb(75 85 99 / var(--tw-border-opacity, 1))}.dark\\:bg-gray-600{--tw-bg-opacity: 1;background-color:rgb(75 85 99 / var(--tw-bg-opacity, 1))}.dark\\:opacity-60{opacity:.6}.dark\\:hover\\:bg-gray-500:hover{--tw-bg-opacity: 1;background-color:rgb(107 114 128 / var(--tw-bg-opacity, 1))}}.\\[\\&\\:\\:-webkit-scrollbar-thumb\\]\\:rounded-full::-webkit-scrollbar-thumb{border-radius:9999px}.\\[\\&\\:\\:-webkit-scrollbar-track\\]\\:bg-transparent::-webkit-scrollbar-track{background-color:transparent}.\\[\\&\\:\\:-webkit-scrollbar\\]\\:w-1\\.5::-webkit-scrollbar{width:.375rem}.\\[\\&\\:not\\(\\:first-child\\)\\]\\:mt-2:not(:first-child){margin-top:.5rem}.\\[\\&\\>svg\\]\\:h-5>svg{height:1.25rem}.\\[\\&\\>svg\\]\\:w-5>svg{width:1.25rem}/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Shared timeline styles - base classes only\n * Individual component styles are in their respective CSS files:\n * - LayoutComponents.css (tool calls)\n * - AssistantMessage.css (assistant messages)\n * \n * Timeline connectors are inferred from DOM order; data-first/data-last can override\n */.message-item{width:100%;align-items:flex-start;padding:8px 0 8px 30px;-webkit-user-select:text;-moz-user-select:text;user-select:text;position:relative}.user-message-container{margin-top:16px}.user-message-container:first-child{margin-top:0}.qwen-message.message-item:not(.user-message-container):first-child:after,.user-message-container+.qwen-message.message-item:not(.user-message-container):after,.chat-messages>:not(.qwen-message.message-item)+.qwen-message.message-item:not(.user-message-container):after,.chat-viewer-messages>:not(.qwen-message.message-item)+.qwen-message.message-item:not(.user-message-container):after{top:var(--timeline-center-offset, 13px)}.qwen-message.message-item:not(.user-message-container):has(+.user-message-container):after,.qwen-message.message-item:not(.user-message-container):has(+:not(.qwen-message.message-item)):after,.qwen-message.message-item:not(.user-message-container):last-child:after{bottom:calc(100% - var(--timeline-center-offset, 13px))}.qwen-message.message-item[data-first=true]:after{top:var(--timeline-center-offset, 13px)}.qwen-message.message-item[data-last=true]:after{bottom:calc(100% - var(--timeline-center-offset, 13px))}.qwen-message.message-item[data-first=true][data-last=true]:after{display:none}/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Common component styles for webui\n * These styles are shared across all platforms (vscode, web, etc.)\n */.webui-root *{margin:0;padding:0;box-sizing:border-box}@keyframes fadeIn{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,to{opacity:1}50%{opacity:.3}}@keyframes typingPulse{0%,60%,to{transform:scale(.7);opacity:.6}30%{transform:scale(1);opacity:1}}.chat-container{display:flex;flex-direction:column;height:100%;width:100%;background-color:var(--app-primary-background);color:var(--app-primary-foreground);font-family:var(--vscode-chat-font-family, var(--app-font-sans));font-size:var(--vscode-chat-font-size, 13px)}.chat-messages{flex:1;overflow-y:auto;overflow-x:hidden;padding:20px;display:flex;flex-direction:column;position:relative;min-width:0;scroll-behavior:smooth}.chat-messages>*{overflow-anchor:none}.input-form{display:flex;background-color:var(--app-primary-background);border-top:1px solid var(--app-primary-border-color)}.input-field{flex:1;padding:10px 12px;background-color:var(--app-input-background);color:var(--app-input-foreground);border:1px solid var(--app-input-border);border-radius:var(--app-radius-sm, 4px);font-size:var(--vscode-chat-font-size, 13px);font-family:var(--vscode-chat-font-family, var(--app-font-sans));outline:none;line-height:1.5}.input-field:focus{border-color:var(--app-primary, #3b82f6)}.input-field:disabled{opacity:.5;cursor:not-allowed}.input-field::-moz-placeholder{color:var(--app-input-placeholder-foreground)}.input-field::placeholder{color:var(--app-input-placeholder-foreground)}.send-button{padding:10px 20px;background-color:var(--app-primary, #3b82f6);color:var(--app-button-foreground, white);border:none;border-radius:var(--app-radius-sm, 4px);font-size:var(--vscode-chat-font-size, 13px);font-weight:500;cursor:pointer;transition:filter .15s ease;display:flex;align-items:center;justify-content:center}.send-button:hover:not(:disabled){filter:brightness(1.1)}.send-button:active:not(:disabled){filter:brightness(.9)}.send-button:disabled{opacity:.5;cursor:not-allowed}.code-block{font-family:var(--app-font-mono);font-size:var(--app-monospace-font-size, 13px);background:var(--app-primary-background);border:1px solid var(--app-input-border);border-radius:var(--app-radius-sm, 4px);padding:var(--app-spacing-medium, 8px);overflow-x:auto;margin:4px 0 0;white-space:pre-wrap;word-break:break-word;max-height:300px;overflow-y:auto}.diff-display-container{margin:8px 0;border:1px solid var(--app-input-border);border-radius:var(--app-radius-md, 6px);overflow:hidden}.diff-header{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var( --app-input-secondary-background, var(--app-background-secondary) );border-bottom:1px solid var(--app-input-border)}.diff-file-path{font-family:var(--app-font-mono);font-size:13px;color:var(--app-primary-foreground)}.open-diff-button{display:flex;align-items:center;gap:6px;padding:4px 8px;background:transparent;border:1px solid var(--app-input-border);border-radius:var(--app-radius-sm, 4px);color:var(--app-primary-foreground);cursor:pointer;font-size:12px;transition:background-color .15s}.open-diff-button:hover{background:var(--app-ghost-button-hover-background)}.open-diff-button svg{width:16px;height:16px}.diff-section{margin:0}.diff-label{padding:8px 12px;background:var(--app-primary-background);border-bottom:1px solid var(--app-input-border);font-size:11px;font-weight:600;color:var(--app-secondary-foreground);text-transform:uppercase}.diff-section .code-block{border:none;border-radius:0;margin:0;max-height:none;overflow-y:visible}.diff-section .code-content{display:block}.toolcall-card{padding-left:30px}.btn-ghost{background:transparent;border:1px solid transparent;border-radius:4px;cursor:pointer;outline:none;transition:background-color .2s;color:var(--app-primary-foreground);font-size:var(--vscode-chat-font-size, 13px)}.btn-ghost:hover,.btn-ghost:focus{background:var(--app-ghost-button-hover-background)}.btn-icon-compact{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border-radius:var(--app-radius-sm, 4px);background:transparent;border:1px solid transparent;cursor:pointer;flex-shrink:0;transition:all .15s;color:var(--app-secondary-foreground)}.btn-icon-compact:hover{background-color:var(--app-ghost-button-hover-background)}.btn-icon-compact svg{width:16px;height:16px}.btn-icon-compact--active{background-color:var(--app-primary, #3b82f6);color:#fff}.btn-text-compact{display:inline-flex;align-items:center;gap:4px;padding:2px 4px;border-radius:2px;cursor:pointer;background:transparent;border:0;min-width:0;flex-shrink:1;font-size:.85em;transition:background-color .15s;color:var(--app-secondary-foreground)}.btn-text-compact:hover{background-color:var(--app-ghost-button-hover-background)}.btn-text-compact>svg{height:1em;width:1em;flex-shrink:0}.btn-text-compact>span{display:inline-block;min-width:0;max-width:200px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;vertical-align:middle}.context-indicator{display:inline-flex;align-items:center;gap:4px;padding:2px 4px;border-radius:var(--app-radius-sm, 4px);font-size:.8em;-webkit-user-select:none;-moz-user-select:none;user-select:none;color:var(--app-secondary-foreground)}.context-indicator svg{width:20px;height:20px}.context-indicator__track,.context-indicator__progress{fill:none;stroke-width:2.5}.context-indicator__track{stroke:var(--app-secondary-foreground);opacity:.35}.context-indicator__progress{stroke:var(--app-secondary-foreground);stroke-linecap:round}.composer-root{position:absolute;bottom:16px;left:16px;right:16px;display:flex;flex-direction:column;z-index:20}.composer-form{position:relative;display:flex;flex-direction:column;max-width:680px;margin:0 auto;border-radius:var(--app-radius-lg, 8px);border:1px solid var(--app-input-border);box-shadow:0 1px 3px #0000001a;transition:border-color .2s;z-index:1;background:var( --app-input-secondary-background, var(--app-background-secondary) );color:var(--app-input-foreground)}.composer-form:focus-within{border-color:var(--app-primary, #3b82f6);box-shadow:0 1px 2px #3b82f633}.composer-input{flex:1;align-self:stretch;padding:10px 14px;outline:none;overflow-y:auto;position:relative;-webkit-user-select:text;-moz-user-select:text;user-select:text;min-height:1.5em;max-height:200px;background:transparent;border:0;border-radius:0;overflow-x:hidden;word-break:break-word;white-space:pre-wrap;font-family:inherit;font-size:var(--vscode-chat-font-size, 13px);color:var(--app-input-foreground)}.composer-input:empty:before,.composer-input[data-empty=true]:before{content:attr(data-placeholder);color:var(--app-input-placeholder-foreground);pointer-events:none;position:absolute;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100% - 28px)}.composer-input[data-has-suggestion=true]:empty:before,.composer-input[data-has-suggestion=true][data-empty=true]:before{color:var(--app-primary, #3b82f6);opacity:.7;font-style:italic}.composer-input[data-has-suggestion=true]:hover:empty:before,.composer-input[data-has-suggestion=true]:hover[data-empty=true]:before{opacity:.9;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:2px}.composer-input:focus{outline:none}.composer-input:disabled,.composer-input[contenteditable=false]{color:#999;cursor:not-allowed}.composer-actions{display:flex;align-items:center;gap:4px;min-width:0;z-index:1;padding:5px;color:var(--app-secondary-foreground);border-top:.5px solid var(--app-input-border)}.composer-overlay{position:absolute;top:0;right:0;bottom:0;left:0;border-radius:var(--app-radius-lg, 8px);z-index:0;background:var(--app-input-background)}.btn-send-compact{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;margin-left:auto;border-radius:var(--app-radius-sm, 4px);background-color:var(--app-primary, #3b82f6);color:#fff;border:none;cursor:pointer}.btn-send-compact:hover:not(:disabled){filter:brightness(1.1)}.btn-send-compact:disabled{opacity:.4;cursor:not-allowed}.toolcall-content-wrapper .file-link-path{font-size:.85em;padding-top:1px;word-break:break-all;min-width:0;font-family:var(--app-font-mono);overflow-wrap:anywhere}.icon-svg{display:block}.line-clamp-3{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Styles for MarkdownRenderer component\n */.markdown-content{line-height:1.6;color:var(--app-primary-foreground)}.markdown-content h1,.markdown-content h2,.markdown-content h3,.markdown-content h4,.markdown-content h5,.markdown-content h6{margin-top:1.5em;margin-bottom:.5em;font-weight:600}.markdown-content h1{font-size:1.75em;border-bottom:1px solid var(--app-primary-border-color);padding-bottom:.3em}.markdown-content h2{font-size:1.5em;border-bottom:1px solid var(--app-primary-border-color);padding-bottom:.3em}.markdown-content h3{font-size:1.25em}.markdown-content h4{font-size:1.1em}.markdown-content h5,.markdown-content h6{font-size:1em}.markdown-content p{margin-top:0}.markdown-content ul,.markdown-content ol{margin-top:1em;margin-bottom:1em;padding-left:2em}.markdown-content ul{list-style-type:disc;list-style-position:outside}.markdown-content ol{list-style-type:decimal;list-style-position:outside}.markdown-content ul ul{list-style-type:circle}.markdown-content ul ul ul{list-style-type:square}.markdown-content ol ol{list-style-type:lower-alpha}.markdown-content ol ol ol{list-style-type:lower-roman}.markdown-content li::marker{color:var(--app-secondary-foreground)}.markdown-content li{margin-bottom:.25em}.markdown-content li>p{margin-top:.5em;margin-bottom:.5em}.markdown-content blockquote{margin:0 0 1em;padding:0 1em;border-left:.25em solid var(--app-primary-border-color);color:var(--app-secondary-foreground)}.markdown-content a{color:var(--app-link-foreground, #007acc);text-decoration:none}.markdown-content a:hover{color:var(--app-link-active-foreground, #005a9e);text-decoration:underline}.markdown-content code{font-family:var( --app-monospace-font-family, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace );font-size:.9em;background-color:var(--app-code-background, rgba(0, 0, 0, .05));border:1px solid var(--app-primary-border-color);border-radius:var(--corner-radius-small, 4px);padding:.2em .4em;white-space:pre-wrap;word-break:break-word}.markdown-content pre{margin:1em 0;padding:1em;overflow-x:auto;background-color:var(--app-code-background, rgba(0, 0, 0, .05));border:1px solid var(--app-primary-border-color);border-radius:var(--corner-radius-small, 4px);font-family:var( --app-monospace-font-family, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace );font-size:.9em;line-height:1.5}.markdown-content pre code{background:none;border:none;padding:0;white-space:pre-wrap;word-break:break-word}.markdown-content .file-path-link{background:transparent;border:none;padding:0;font-family:var( --app-monospace-font-family, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace );font-size:.95em;color:inherit;text-decoration:none;cursor:pointer}.markdown-content hr{border:none;border-top:1px solid var(--app-primary-border-color);margin:1.5em 0}.markdown-content img{max-width:100%;height:auto}.markdown-content table{width:100%;border-collapse:collapse;margin:1em 0}.markdown-content th,.markdown-content td{padding:.5em 1em;border:1px solid var(--app-primary-border-color);text-align:left}.markdown-content th{background-color:var(--app-secondary-background);font-weight:600}/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * ThinkingMessage.css - Thinking message styles with timeline support\n */.thinking-message{position:relative;--timeline-center-offset: 15px;padding-left:30px;padding-top:8px;padding-bottom:8px;-webkit-user-select:text;-moz-user-select:text;user-select:text;align-items:flex-start;border-radius:6px;animation:fadeIn .2s ease-in}.thinking-message:after{content:"";position:absolute;left:12px;top:0;bottom:0;width:1px;background-color:var(--app-primary-border-color, rgba(255, 255, 255, .15))}.thinking-message:first-child:after{top:var(--timeline-center-offset, 15px)}.thinking-message:last-child:after{bottom:calc(100% - var(--timeline-center-offset, 15px))}.thinking-message:first-child:last-child:after{display:none}.thinking-message.thinking-status-default:before,.thinking-message.thinking-status-loading:before{content:"\u25CF";position:absolute;left:8px;top:8px;font-size:10px;line-height:1.5;z-index:1}.thinking-message.thinking-status-default:before{color:var(--app-secondary-foreground);opacity:.6}.thinking-message.thinking-status-loading:before{color:var(--app-secondary-foreground);animation:thinkingPulse 1s linear infinite}@keyframes thinkingPulse{0%,to{opacity:1}50%{opacity:.4}}.thinking-content-wrapper{flex:1;display:flex;flex-direction:column;gap:8px;min-width:0;max-width:100%}.thinking-toggle-btn{display:inline-flex;align-items:center;gap:4px;background:transparent;border:none;cursor:pointer;padding:0;text-align:left;color:var(--app-secondary-foreground);line-height:1;height:15px}.thinking-toggle-btn:hover{opacity:.8}.thinking-label{font-size:14px;font-style:italic;color:var(--app-secondary-foreground);opacity:.8;line-height:1}.thinking-chevron{color:var(--app-tertiary-foreground, #666);opacity:.7}.thinking-content{font-size:13px;line-height:1.5;color:var(--app-secondary-foreground);opacity:.8;white-space:pre-wrap;word-break:break-word;padding-left:8px;margin-top:4px}@keyframes fadeIn{0%{opacity:0}to{opacity:1}}/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * AssistantMessage Component Styles\n * Pseudo-elements (::before) for bullet points and (::after) for timeline connectors\n */.assistant-message-container{position:relative;--timeline-center-offset: 13px;padding-left:30px;padding-top:8px;padding-bottom:8px;border-radius:6px}.assistant-message-container.assistant-message-default:before,.assistant-message-container.assistant-message-success:before,.assistant-message-container.assistant-message-error:before,.assistant-message-container.assistant-message-warning:before,.assistant-message-container.assistant-message-loading:before{content:"\u25CF";position:absolute;left:8px;top:8px;font-size:10px;line-height:20px;z-index:1}.assistant-message-container.assistant-message-default:before{color:var(--app-secondary-foreground)}.assistant-message-container.assistant-message-success:before{color:#74c991}.assistant-message-container.assistant-message-error:before{color:#c74e39}.assistant-message-container.assistant-message-warning:before{color:#e1c08d}.assistant-message-container.assistant-message-loading:before{color:var(--app-secondary-foreground);animation:assistantPulse 1s linear infinite}@keyframes assistantPulse{0%,to{opacity:1}50%{opacity:.5}}.assistant-message-container:after{content:"";position:absolute;left:12px;top:0;bottom:0;width:1px;background-color:var(--app-primary-border-color, rgba(255, 255, 255, .15))}.assistant-message-container:first-child:after{top:var(--timeline-center-offset, 13px)}.assistant-message-container:last-child:after{bottom:calc(100% - var(--timeline-center-offset, 13px))}.assistant-message-container:first-child:last-child:after{display:none}.assistant-message-container.assistant-message-loading:after{display:none}/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * LayoutComponents.css - Tool call layout styles with timeline support\n */.toolcall-container{position:relative;--timeline-center-offset: 15px;padding-left:30px;padding-top:8px;padding-bottom:8px;-webkit-user-select:text;-moz-user-select:text;user-select:text;align-items:flex-start;border-radius:6px}.toolcall-container:after{content:"";position:absolute;left:12px;top:0;bottom:0;width:1px;background-color:var(--app-primary-border-color, rgba(255, 255, 255, .15))}.toolcall-container:first-child:after{top:var(--timeline-center-offset, 15px)}.toolcall-container:last-child:after{bottom:calc(100% - var(--timeline-center-offset, 15px))}.toolcall-container:first-child:last-child:after{display:none}.toolcall-container.toolcall-status-default:before,.toolcall-container.toolcall-status-success:before,.toolcall-container.toolcall-status-error:before,.toolcall-container.toolcall-status-warning:before,.toolcall-container.toolcall-status-loading:before{content:"\u25CF";position:absolute;left:8px;top:8px;font-size:10px;line-height:1.5;z-index:1}.toolcall-container.toolcall-status-default:before{color:var(--app-secondary-foreground)}.toolcall-container.toolcall-status-success:before{color:#74c991}.toolcall-container.toolcall-status-error:before{color:#c74e39}.toolcall-container.toolcall-status-warning:before{color:#e1c08d}.toolcall-container.toolcall-status-loading:before{color:var(--app-secondary-foreground);animation:toolcallPulse 1s linear infinite}@keyframes toolcallPulse{0%,to{opacity:1}50%{opacity:.5}}.toolcall-content-wrapper{flex:1;display:flex;flex-direction:column;gap:6px;min-width:0;max-width:100%}.toolcall-card{grid-template-columns:auto 1fr;gap:var(--spacing-medium);background:var(--app-input-background);border:1px solid var(--app-input-border);border-radius:var(--border-radius-medium);padding:var(--spacing-large);margin:var(--spacing-medium) 0;align-items:start;animation:fadeIn .2s ease-in}.toolcall-row{grid-template-columns:80px 1fr;gap:var(--spacing-medium);min-width:0}.toolcall-row-label{font-size:var(--font-size-xs);color:var(--app-secondary-foreground);font-weight:500;padding-top:2px}.toolcall-row-content{color:var(--app-primary-foreground);min-width:0;word-break:break-word}.toolcall-locations-list{display:flex;flex-direction:column;gap:4px;max-width:100%}.toolcall-header{position:relative}.toolcall-header:before{content:"\u25CF";position:absolute;left:-22px;top:50%;transform:translateY(-50%);font-size:10px;line-height:1;z-index:1;color:#e1c08d;animation:toolcallHeaderPulse 1.5s ease-in-out infinite}@keyframes toolcallHeaderPulse{0%,to{opacity:1}50%{opacity:.5}}.in-progress-toolcall .toolcall-content-wrapper{display:flex;flex-direction:column;gap:1;min-width:0;max-width:100%}.in-progress-toolcall .toolcall-header{display:flex;align-items:center;gap:2;position:relative;min-width:0}.in-progress-toolcall .toolcall-content-text{word-break:break-word;white-space:pre-wrap;width:100%}/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * Shell tool call styles - shared styles for bash/execute variants\n */.bash-toolcall-card{border:.5px solid var(--app-input-border);border-radius:5px;background:var(--app-tool-background);margin:8px 0;max-width:100%;font-size:1em;align-items:start}.bash-toolcall-content{display:flex;flex-direction:column;gap:3px;padding:4px}.bash-toolcall-row{display:grid;grid-template-columns:max-content 1fr;border-top:.5px solid var(--app-input-border);padding:4px}.bash-toolcall-row:first-child{border-top:none}.bash-toolcall-label{grid-column:1;color:var(--app-secondary-foreground);text-align:left;opacity:50%;padding:4px 8px 4px 4px;font-family:var(--app-font-mono);font-size:.85em}.bash-toolcall-row-content{grid-column:2;white-space:pre-wrap;word-break:break-word;margin:0;padding:4px}.bash-toolcall-row-content:not(.bash-toolcall-full){max-height:60px;-webkit-mask-image:linear-gradient(to bottom,var(--app-primary-background) 40px,transparent 60px);mask-image:linear-gradient(to bottom,var(--app-primary-background) 40px,transparent 60px);overflow:hidden}.bash-toolcall-row-content.bash-toolcall-full{min-width:0}.bash-toolcall-pre{margin-block:0;overflow:hidden;font-family:var(--app-font-mono);font-size:.85em}.bash-toolcall-code{margin:0;padding:0;font-family:var(--app-font-mono);font-size:.85em}.bash-toolcall-output-subtle{background-color:var(--app-code-background);white-space:pre;overflow-x:auto;max-width:100%;min-width:0;width:100%;box-sizing:border-box}.bash-toolcall-output-subtle .bash-toolcall-pre{overflow:visible}.bash-toolcall-error-content{color:#c74e39}.bash-toolcall-row-with-copy{position:relative;grid-template-columns:max-content 1fr max-content}.execute-toolcall-card{border:.5px solid var(--app-input-border);border-radius:5px;background:var(--app-tool-background);margin:8px 0;max-width:100%;font-size:1em;align-items:start}.execute-toolcall-content{display:flex;flex-direction:column;gap:3px;padding:4px}.execute-toolcall-row{display:grid;grid-template-columns:max-content 1fr;border-top:.5px solid var(--app-input-border);padding:4px}.execute-toolcall-row:first-child{border-top:none}.execute-toolcall-label{grid-column:1;color:var(--app-secondary-foreground);text-align:left;opacity:50%;padding:4px 8px 4px 4px;font-family:var(--app-font-mono);font-size:.85em}.execute-toolcall-row-content{grid-column:2;white-space:pre-wrap;word-break:break-word;margin:0;padding:4px}.execute-toolcall-row-content:not(.execute-toolcall-full){max-height:60px;-webkit-mask-image:linear-gradient(to bottom,var(--app-primary-background) 40px,transparent 60px);mask-image:linear-gradient(to bottom,var(--app-primary-background) 40px,transparent 60px);overflow:hidden}.execute-toolcall-row-content.execute-toolcall-full{min-width:0}.execute-toolcall-pre{margin-block:0;overflow:hidden;font-family:var(--app-font-mono);font-size:.85em}.execute-toolcall-code{margin:0;padding:0;font-family:var(--app-font-mono);font-size:.85em}.execute-toolcall-output-subtle{white-space:pre;overflow-x:auto;max-width:100%;min-width:0;width:100%;box-sizing:border-box}.execute-toolcall-output-subtle .execute-toolcall-pre{overflow:visible}.execute-toolcall-error-content{color:#c74e39}.execute-toolcall-row-with-copy{position:relative;grid-template-columns:max-content 1fr max-content}/**\n * @license\n * Copyright 2025 Qwen Team\n * SPDX-License-Identifier: Apache-2.0\n *\n * ChatViewer component styles - matching vscode-ide-companion visual appearance\n * Note: Timeline styles are inherited from shared styles/timeline.css\n */.chat-viewer-container{display:flex;flex-direction:column;width:100%;height:100%;background-color:var( --app-background, var(--app-primary-background, #1e1e1e) );color:var(--app-primary-foreground, #cccccc);font-family:var( --vscode-chat-font-family, var( --vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif ) );font-size:var(--vscode-chat-font-size, 13px);overflow:hidden}.chat-viewer-messages{flex:1;overflow-y:auto;overflow-x:hidden;padding:20px;display:flex;flex-direction:column;position:relative;min-width:0;scroll-behavior:smooth}.chat-viewer-expand-control{display:flex;justify-content:flex-end;gap:8px;padding:10px 20px 0;flex-shrink:0}.chat-viewer-expand-control-button{background:transparent;border:1px solid var(--app-input-border, rgba(255, 255, 255, .2));border-radius:4px;color:var(--app-secondary-foreground, rgba(255, 255, 255, .6));cursor:pointer;font-size:11px;line-height:1.4;padding:3px 10px;transition:color .15s ease,border-color .15s ease,background-color .15s ease}.chat-viewer-expand-control-button:hover{color:var(--app-primary-foreground, #cccccc);border-color:var(--app-primary-foreground, #cccccc);background-color:var(--app-input-background, rgba(255, 255, 255, .06))}@media (max-width: 600px){.chat-viewer-expand-control{padding:8px 12px 0}}.chat-viewer-messages::-webkit-scrollbar{width:8px}.chat-viewer-messages::-webkit-scrollbar-track{background:transparent}.chat-viewer-messages::-webkit-scrollbar-thumb{background:#fff3;border-radius:4px}.chat-viewer-messages::-webkit-scrollbar-thumb:hover{background:#ffffff4d}@media (prefers-color-scheme: light){.chat-viewer-container.auto-theme .chat-viewer-messages::-webkit-scrollbar-thumb{background:#0003}.chat-viewer-container.auto-theme .chat-viewer-messages::-webkit-scrollbar-thumb:hover{background:#0000004d}}.chat-viewer-container.light-theme .chat-viewer-messages::-webkit-scrollbar-thumb{background:#0003}.chat-viewer-container.light-theme .chat-viewer-messages::-webkit-scrollbar-thumb:hover{background:#0000004d}.chat-viewer-messages>*{display:flex;gap:0;align-items:flex-start;text-align:left;padding-top:8px;padding-bottom:8px;flex-direction:column;position:relative;animation:chatViewerFadeIn .2s ease-in}.chat-viewer-messages>.chat-viewer-scroll-anchor{padding:0;display:block}.chat-viewer-messages>*{overflow-anchor:none}.chat-viewer-messages .user-message-container:first-child{margin-top:0}@keyframes chatViewerFadeIn{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.chat-viewer-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:200px;color:var(--app-secondary-foreground, rgba(255, 255, 255, .6));font-size:14px;text-align:center;padding:20px}.chat-viewer-empty-icon{font-size:48px;margin-bottom:16px;opacity:.5}.chat-viewer-empty-text{max-width:300px;line-height:1.5}.chat-viewer-scroll-anchor{height:1px;overflow-anchor:auto}.chat-viewer-messages .user-message-container{margin-top:16px}.chat-viewer-messages>*{isolation:isolate}@media (max-width: 600px){.chat-viewer-messages{padding:12px}}\n    </style>\n    <title>Qwen Code Chat Export</title>\n    <script>\n      // Pre-hydrate FOUC guard: must run before <style> below applies layout.\n      // The storage key \'qwen-export-theme\' is duplicated here verbatim and\n      // MUST stay in sync with EXPORT_THEME_STORAGE_KEY in\n      // src/components/useExportTheme.ts.\n      (function () {\n        try {\n          var stored = window.localStorage.getItem(\'qwen-export-theme\');\n          var theme = stored === \'light\' || stored === \'dark\' ? stored : \'dark\';\n          var root = document.documentElement;\n          // Toggle-style writes mirror the React hook\'s effect, so the two\n          // code paths converge on identical class state.\n          root.classList.toggle(\'light\', theme === \'light\');\n          root.classList.toggle(\'dark\', theme === \'dark\');\n        } catch (e) {\n          // localStorage may be unavailable (private mode, file:// sandbox);\n          // the static class="dark" attribute on <html> remains the default.\n        }\n      })();\n    </script>\n    <style>\n      @font-face {\n        font-family: "Press Start 2P";\n        font-style: normal;\n        font-weight: 400;\n        font-display: swap;\n        src: url("data:font/woff2;base64,d09GMgABAAAAAALQAAwAAAAABfwAAAKBAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHCgGYABUEQgKgkSCDAsOAAE2AiQDDgQgBYRKByAb4QTIBB76Oev9JKW02x5ClpELSxHm1M0JQ+OBJAtDpAAVUQ7i///V+A/YgLVswlGo/7a+lmW3sfnUvoBFcUKzUFEnKo08S0F2T8TiAAJQieDvSGUVdW3smBv2LuCGjSpG3jQTD/m9OI5lTDomdQG1hkoMkCJu1ZYsmL42dEu7W8q5gUan/J6yyO+FX5NO5qQPxaqGnEINZ2q7kDf0+i4UigAXdiQUNMppoJnOzcxnDMwX5lXzinnJPDtkzhQFwjTx0DGrx1zkoNhIYr5LTKHjclcs+z3Frrh2ue3Kvk6bxzoRJLsIQpWcQhW27bgJwoUHYXNi2WWnVRUWaVNS0XMJ1eIUHlSX0l3l7BZOOos1ySk7NUWl6+eobG3Nfpj96g8EvukB3Qjouo4+O6svG9/0b8ZyKmfoZj9gzBqq8I2MS7Pf2JquL9vZwHJ51djyD01vbVHRDxSslvFBZwMHjQvexMxIvz3oyftul2+k9yBS+xGM+l+d+Pvo/zH5fVXMRvsHhG4u9/dRsgQyF67l9+jYgZuy+Ath2O6EUzU7E6BxF41nQk2cgkN8IIlOPKecMgWccSrE4XdaOECf00oUaeTm34EpvHhZIodEEllllBWmWcJLyQmsPjNHAousMEkijVRQR5OgNc4qq7TiZZg89pJCE/G0MM4kPuYqqIOKrQw3WmQBjVQSSLLm1H1NiGmCN21uwK/JpZRuWignd/klmbWXFEtZZIn1o8cmkaDqX5JIJgWNNqYYR9s0GsRFZhhntKJSjI+KTaFDZ+MoRllkjHWK2ADCxilLQGTkJZo4NAJMDwhAiK0CJD+jjKFRwWBapYFh5rdzfogQC/m1XLplXiEFEwAA") format("woff2");\n      }\n      :root{--bg-primary: #18181b;--bg-secondary: #27272a;--text-primary: #f4f4f5;--text-secondary: #a1a1aa;--border-color: #3f3f46;--accent-color: #3b82f6;--header-bg: rgba(24, 24, 27, .95);--scrollbar-thumb-hover: #52525b}:root.light{--bg-primary: #ffffff;--bg-secondary: #f3f4f6;--text-primary: #1f2937;--text-secondary: #6b7280;--border-color: #e5e7eb;--accent-color: #2563eb;--header-bg: rgba(249, 250, 251, .95);--scrollbar-thumb-hover: #d1d5db;--app-primary-foreground: #1f2937;--app-secondary-foreground: #6b7280;--app-background: #ffffff;--app-primary-background: #ffffff;--app-background-secondary: #f3f4f6;--app-background-tertiary: #e5e7eb;--app-foreground: #1f2937;--app-foreground-secondary: #6b7280;--app-foreground-muted: #9ca3af;--app-border: #e5e7eb;--app-primary-border-color: #e5e7eb;--app-input-background: #ffffff;--app-input-border: #d1d5db;--app-input-placeholder-foreground: #9ca3af;--app-ghost-button-hover-background: rgba(0, 0, 0, .05);--app-header-background: #f9fafb;--app-list-hover-background: rgba(0, 0, 0, .05);--app-list-active-background: #3b82f6;--app-menu-background: #ffffff;--app-menu-border: #e5e7eb;--app-menu-foreground: #1f2937;--app-tool-background: #ffffff;--app-code-background: #f3f4f6;--app-secondary-background: #f3f4f6;--app-input-secondary-background: #f3f4f6;--app-input-foreground: #1f2937;--app-button-background: #e5e7eb;--app-button-secondary-background: #f3f4f6;--app-button-foreground: #1f2937;--app-transparent-inner-border: rgba(0, 0, 0, .1);--app-warning-foreground: #b45309}body{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;margin:0;padding:0;background-color:var(--bg-primary);color:var(--text-primary);line-height:1.6;-webkit-font-smoothing:antialiased}.page-wrapper{min-height:100vh;display:flex;flex-direction:column;align-items:center}.header{width:100%;padding:16px 24px;border-bottom:1px solid var(--border-color);background-color:var(--header-bg);backdrop-filter:blur(8px);position:sticky;top:0;z-index:100;display:flex;justify-content:space-between;align-items:center;box-sizing:border-box}.header-left{display:flex;align-items:center;gap:12px}.header-right{display:flex;align-items:center;gap:8px}.theme-toggle{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;background:transparent;border:1px solid var(--border-color);border-radius:999px;color:var(--text-secondary);cursor:pointer;transition:background-color .15s ease,color .15s ease,border-color .15s ease}.theme-toggle:hover{background-color:var(--bg-secondary);color:var(--text-primary)}.theme-toggle:focus-visible{outline:2px solid var(--accent-color);outline-offset:2px}.theme-toggle:active{transform:scale(.95)}.logo-icon{width:24px;height:24px;flex-shrink:0;display:flex;align-items:center;justify-content:center}.logo-icon svg{width:100%;height:100%}.logo{display:flex;flex-direction:column;line-height:1}.logo-text{font-family:"Press Start 2P",cursive;font-weight:400;font-size:24px;letter-spacing:-.05em;position:relative;color:#fff}.logo-text-inner{background:linear-gradient(to right,#60a5fa,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;position:relative;z-index:2}.logo-text:before,.logo-text:after{content:attr(data-text);position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;background:none;-webkit-text-fill-color:transparent;-webkit-text-stroke:1px rgba(96,165,250,.3)}.logo-text:before{transform:translate(2px,2px);-webkit-text-stroke:1px rgba(168,85,247,.3)}.logo-text:after{transform:translate(4px,4px);opacity:.4}.logo-sub{font-size:11px;font-weight:600;color:var(--text-secondary);letter-spacing:.05em;text-transform:uppercase;margin-top:4px}.badge{font-size:11px;padding:2px 8px;border-radius:999px;background-color:var(--bg-secondary);color:var(--text-secondary);border:1px solid var(--border-color);font-weight:500}.meta{display:flex;gap:24px;font-size:13px;color:var(--text-secondary)}.meta-item{display:flex;align-items:center;gap:8px}.meta-label{color:var(--text-secondary)}::-webkit-scrollbar{width:10px;height:10px}::-webkit-scrollbar-track{background:var(--bg-primary)}::-webkit-scrollbar-thumb{background:var(--bg-secondary);border-radius:5px;border:2px solid var(--bg-primary)}::-webkit-scrollbar-thumb:hover{background:var(--scrollbar-thumb-hover)}@media (max-width: 768px){.chat-container{max-width:100%;padding:20px 16px}.header{padding:12px 16px}.meta{width:100%;flex-direction:column;gap:6px}}@media (max-width: 480px){.chat-container{padding:16px 12px}}.content-wrapper{display:flex;width:100%;max-width:1600px;height:calc(100vh - 73px)}.chat-container{flex:1;min-width:0;overflow-y:auto;padding:24px;box-sizing:border-box}.metadata-sidebar{width:320px;min-width:320px;padding:12px;border-right:1px solid var(--border-color);background-color:var(--bg-secondary);display:flex;flex-direction:column;gap:12px;overflow-y:auto;height:100%;box-sizing:border-box}.metadata-section{display:flex;flex-direction:column;gap:8px}.metadata-section-title{font-size:10px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.05em;margin:0;padding-bottom:4px;border-bottom:1px solid var(--border-color)}.metadata-section-small{margin-top:auto;padding-top:12px;border-top:1px solid var(--border-color)}.metadata-item{display:flex;flex-direction:column;gap:2px}.metadata-item-empty{font-size:12px;color:var(--text-secondary);margin:0;padding:4px 0}.metadata-content{display:flex;flex-direction:column;gap:2px;min-width:0}.metadata-content .metadata-label{font-size:10px;color:var(--text-secondary)}.metadata-content .metadata-value{font-size:12px;color:var(--text-primary);word-break:break-all;line-height:1.3;cursor:pointer}.metadata-content .metadata-value.multiline{white-space:pre-wrap}.metadata-content .metadata-value.text-green{color:#22c55e}.metadata-content .metadata-value.text-red{color:#ef4444}.metadata-value-with-copy{display:flex;align-items:center;gap:8px}.metadata-value-with-copy .metadata-value{flex:1;min-width:0}.copy-button{display:inline-flex;align-items:center;justify-content:center;padding:4px;background:transparent;border:1px solid var(--border-color, #3f3f46);border-radius:4px;color:var(--text-secondary, #a1a1aa);cursor:pointer;transition:all .15s ease;flex-shrink:0}.copy-button:hover{background:var(--bg-hover, #27272a);color:var(--text-primary, #f4f4f5);border-color:var(--border-hover, #52525b)}.copy-button:active{transform:scale(.95)}@media (max-width: 1024px){.metadata-sidebar{width:320px;min-width:320px;padding:10px}}@media (max-width: 768px){.content-wrapper{flex-direction:column;height:auto}.chat-container{height:auto;min-height:50vh}.metadata-sidebar{width:100%;min-width:100%;height:auto;max-height:none;border-right:none;border-top:1px solid var(--border-color);padding:12px;gap:12px}.metadata-section{flex-direction:row;flex-wrap:wrap;gap:12px}.metadata-section-title{width:100%;border-bottom:none;padding-bottom:0}.metadata-item{flex:1;min-width:140px}.metadata-section-small{margin-top:0;padding-top:0;border-top:none}}.modal-overlay{position:fixed;inset:0;z-index:1000;background-color:#0009;display:flex;align-items:center;justify-content:center;padding:24px}.modal-container{background-color:var(--bg-secondary);border:1px solid var(--border-color);border-radius:12px;width:100%;max-width:800px;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px #00000080}.modal-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border-color);flex-shrink:0}.modal-title{font-size:13px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.modal-close{background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:16px;padding:4px 8px;border-radius:6px;line-height:1;transition:background-color .15s,color .15s}.modal-close:hover{background-color:var(--border-color);color:var(--text-primary)}.modal-content{margin:0;padding:16px;overflow:auto;font-size:13px;line-height:1.6;color:var(--text-primary);white-space:pre-wrap;word-break:break-word}\n    </style>\n  </head>\n  <body>\n    <div id="app"></div>\n\n    <script id="chat-data" type="application/json"></script>\n    <script>\n      (()=>{var f=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 141.38 140">\n  <path\n    fill="#000000"\n    d="m140.93 85-16.35-28.33-1.93-3.34 8.66-15a3.323 3.323 0 0 0 0-3.34l-9.62-16.67c-.3-.51-.72-.93-1.22-1.22s-1.07-.45-1.67-.45H82.23l-8.66-15a3.33 3.33 0 0 0-2.89-1.67H51.43c-.59 0-1.17.16-1.66.45-.5.29-.92.71-1.22 1.22L32.19 29.98l-1.92 3.33H12.96c-.59 0-1.17.16-1.66.45-.5.29-.93.71-1.22 1.22L.45 51.66a3.323 3.323 0 0 0 0 3.34l18.28 31.67-8.66 15a3.32 3.32 0 0 0 0 3.34l9.62 16.67c.3.51.72.93 1.22 1.22s1.07.45 1.67.45h36.56l8.66 15a3.35 3.35 0 0 0 2.89 1.67h19.25a3.34 3.34 0 0 0 2.89-1.67l18.28-31.67h17.32c.6 0 1.17-.16 1.67-.45s.92-.71 1.22-1.22l9.62-16.67a3.323 3.323 0 0 0 0-3.34ZM51.44 3.33 61.07 20l-9.63 16.66h76.98l-9.62 16.66H45.67l-11.54-20zM57.21 120H22.58l9.63-16.67h19.25l-38.5-66.67h19.25l9.62 16.67L68.78 100l-11.55 20Zm61.59-33.34-9.62-16.67-38.49 66.67-9.63-16.67 9.63-16.66 26.94-46.67h23.1l17.32 30z"\n  />\n</svg>\n`;var l=window.React,h=({state:e,onClose:t})=>(l.useEffect(()=>{if(e.visible){let o=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=o}}},[e.visible]),e.visible?l.createElement("div",{className:"modal-overlay",onClick:t},l.createElement("div",{className:"modal-container",onClick:o=>o.stopPropagation()},l.createElement("div",{className:"modal-header"},l.createElement("span",{className:"modal-title font-mono"},e.fileName),l.createElement("button",{className:"modal-close",onClick:t,"aria-label":"Close"},"\\u2715")),l.createElement("pre",{className:"modal-content"},e.content))):null),x=()=>{let[e,t]=l.useState({visible:!1,content:"",fileName:""}),o=l.useCallback((n,p="temp")=>{t({visible:!0,content:n,fileName:p})},[]),i=l.useCallback(()=>{t(n=>({...n,visible:!1}))},[]);return{modalState:e,openModal:o,closeModal:i}};var z=window.React,b=()=>{let{modalState:e,openModal:t,closeModal:o}=x();return{platformContext:z.useMemo(()=>({platform:"web",postMessage:n=>{console.log("Posted message:",n)},onMessage:n=>(window.addEventListener("message",n),()=>window.removeEventListener("message",n)),openFile:n=>{console.log("Opening file:",n)},openTempFile:t,getResourceUrl:()=>{},features:{canOpenFile:!1,canOpenTempFile:!0,canCopy:!0}}),[t]),modalState:e,closeModal:o}};var a=({label:e,value:t,valueClass:o})=>t==null||t===""?null:React.createElement("div",{className:"metadata-item"},React.createElement("div",{className:"metadata-content"},React.createElement("span",{className:"metadata-label"},e),React.createElement("span",{className:`metadata-value ${o||""}`,title:typeof t=="string"?t:void 0},t)));var v=e=>!!e&&typeof e=="object",w=()=>{let e=document.getElementById("chat-data");if(!(e!=null&&e.textContent))return{};try{let t=JSON.parse(e.textContent);return t&&typeof t=="object"?t:{}}catch(t){return console.error("Failed to parse chat data.",t),{}}};var y=e=>{if(!e)return"-";try{return new Date(e).toLocaleString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch(t){return e}},k=e=>{if(!e)return"-";try{let o=new Date(e).getTime();if(Number.isNaN(o))return"-";let n=Math.max(0,new Date().getTime()-o),p=Math.floor(n/1e3),c=Math.floor(p/60),d=Math.floor(c/60),s=Math.floor(d/24),m=Math.floor(s/7),g=Math.floor(s/30),u=Math.floor(s/365);return p<60?"just now":c<60?`${c} minute${c===1?"":"s"} ago`:d<24?`${d} hour${d===1?"":"s"} ago`:s<7?`${s} day${s===1?"":"s"} ago`:m<4?`${m} week${m===1?"":"s"} ago`:g<12?`${g} month${g===1?"":"s"} ago`:`${u} year${u===1?"":"s"} ago`}catch(t){return"-"}};var M=e=>{if(e!=null)return e>=1e6?`${(e/1e6).toFixed(e%1e6===0?0:1)}m`:e>=1e3?`${(e/1e3).toFixed(e%1e3===0?0:1)}k`:e.toString()};var T=({metadata:e})=>React.createElement("aside",{className:"metadata-sidebar"},React.createElement("div",{className:"metadata-section"},React.createElement("h3",{className:"metadata-section-title"},"Session Info"),React.createElement(a,{label:"Session created",value:k(e.startTime)}),React.createElement(a,{label:"Project",value:e.cwd,valueClass:"multiline"}),e.gitRepo&&React.createElement(a,{label:"Repository",value:e.gitRepo}),e.gitBranch&&React.createElement(a,{label:"Branch",value:e.gitBranch}),e.model&&React.createElement(a,{label:"Model",value:e.model}),e.channel&&React.createElement(a,{label:"Channel",value:e.channel})),React.createElement("div",{className:"metadata-section"},React.createElement("h3",{className:"metadata-section-title"},"Statistics"),React.createElement(a,{label:"Prompts",value:e.promptCount}),e.contextUsagePercent!==void 0&&e.contextWindowSize!==void 0&&React.createElement(a,{label:"Context",value:`${e.contextUsagePercent>100?">100":e.contextUsagePercent}% of ${M(e.contextWindowSize)}`,valueClass:e.contextUsagePercent>100?"text-red":void 0}),e.totalTokens!==void 0&&React.createElement(a,{label:"Tokens",value:e.totalTokens.toLocaleString()})),React.createElement("div",{className:"metadata-section"},React.createElement("h3",{className:"metadata-section-title"},"File Operations"),e.filesWritten!==void 0&&e.filesWritten>0&&React.createElement(a,{label:"Files modified",value:e.filesWritten}),e.linesAdded!==void 0&&e.linesAdded>0&&React.createElement(a,{label:"Added",value:`+${e.linesAdded}`,valueClass:"text-green"}),e.linesRemoved!==void 0&&e.linesRemoved>0&&React.createElement(a,{label:"Removed",value:`-${e.linesRemoved}`,valueClass:"text-red"}),(e.filesWritten===void 0||e.filesWritten===0)&&(e.linesAdded===void 0||e.linesAdded===0)&&(e.linesRemoved===void 0||e.linesRemoved===0)&&React.createElement("p",{className:"metadata-item metadata-item-empty"},"No file changes")),React.createElement("div",{className:"metadata-section metadata-section-small"},React.createElement(a,{label:"Session ID",value:e.sessionId,valueClass:"font-mono"}),React.createElement(a,{label:"Export Time",value:y(e.exportTime)})));var $=()=>React.createElement("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},React.createElement("circle",{cx:"12",cy:"12",r:"4"}),React.createElement("path",{d:"M12 2v2"}),React.createElement("path",{d:"M12 20v2"}),React.createElement("path",{d:"m4.93 4.93 1.41 1.41"}),React.createElement("path",{d:"m17.66 17.66 1.41 1.41"}),React.createElement("path",{d:"M2 12h2"}),React.createElement("path",{d:"M20 12h2"}),React.createElement("path",{d:"m6.34 17.66-1.41 1.41"}),React.createElement("path",{d:"m19.07 4.93-1.41 1.41"})),D=()=>React.createElement("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},React.createElement("path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"})),C=({theme:e,onToggle:t})=>{let o=e==="light",i=o?"Switch to dark theme":"Switch to light theme";return React.createElement("button",{type:"button",className:"theme-toggle","aria-label":i,"aria-pressed":o,title:i,onClick:t},React.createElement(o?D:$,null))};var L=window.React,{useCallback:j,useEffect:I,useState:W}=L,N="qwen-export-theme",R=e=>e==="light"||e==="dark",F=()=>{try{let e=window.localStorage.getItem(N);if(R(e))return e}catch(e){}return"dark"},O=e=>{let t=document.documentElement;t.classList.toggle("light",e==="light"),t.classList.toggle("dark",e==="dark")},S=()=>{let[e,t]=W(F);I(()=>{O(e);try{window.localStorage.setItem(N,e)}catch(i){}},[e]);let o=j(()=>{t(i=>i==="light"?"dark":"light")},[]);return{theme:e,toggleTheme:o}};var A=window.ReactDOM,r=window.React,{ChatViewer:U,PlatformProvider:V}=QwenCodeWebUI,B=f?f.replace(/<svg([^>]*)>/,\'<svg$1><defs><linearGradient id="qwen-logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#60a5fa" /><stop offset="100%" stop-color="#a855f7" /></linearGradient></defs>\').replace(/fill="[^"]*"/,\'fill="url(#qwen-logo-gradient)"\'):f,H=()=>{let e=w(),o=(Array.isArray(e.messages)?e.messages:[]).filter(v).filter(m=>m.type!=="system"),i=e.metadata,{platformContext:n,modalState:p,closeModal:c}=b(),{theme:d,toggleTheme:s}=S();return r.createElement("div",{className:"page-wrapper"},r.createElement("header",{className:"header"},r.createElement("div",{className:"header-left"},r.createElement("div",{className:"logo-icon","aria-hidden":"true",dangerouslySetInnerHTML:{__html:B}}),r.createElement("div",{className:"logo"},r.createElement("div",{className:"logo-text","data-text":"QWEN"},r.createElement("span",{className:"logo-text-inner"},"QWEN")))),r.createElement("div",{className:"header-right"},r.createElement(C,{theme:d,onToggle:s}))),r.createElement("div",{className:"content-wrapper"},r.createElement("div",{className:"chat-container"},r.createElement(V,{value:n},r.createElement(U,{messages:o,autoScroll:!1,theme:d,showExpandControl:!0}))),i&&r.createElement(T,{metadata:i})),r.createElement(h,{state:p,onClose:c}))},E=document.getElementById("app");E?A.createRoot(E).render(r.createElement(H,null)):console.error("App container not found.");})();;\n    </script>\n  </body>\n</html>\n';

// packages/cli/src/ui/utils/export/formatters/html.ts
function escapeJsonForHtml(json) {
  return json.replace(/<\/script/gi, "<\\/script").replace(/&/g, "\\u0026").replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
__name(escapeJsonForHtml, "escapeJsonForHtml");
function loadHtmlTemplate() {
  return HTML_TEMPLATE;
}
__name(loadHtmlTemplate, "loadHtmlTemplate");
function injectDataIntoHtmlTemplate(template, data) {
  const jsonData = JSON.stringify(data, null, 2);
  const escapedJsonData = escapeJsonForHtml(jsonData);
  const idAttribute = 'id="chat-data"';
  const idIndex = template.indexOf(idAttribute);
  if (idIndex === -1) {
    return template;
  }
  const openTagStart = template.lastIndexOf("<script", idIndex);
  if (openTagStart === -1) {
    return template;
  }
  const openTagEnd = template.indexOf(">", idIndex);
  if (openTagEnd === -1) {
    return template;
  }
  const closeTagStart = template.indexOf("</script>", openTagEnd);
  if (closeTagStart === -1) {
    return template;
  }
  const lineStart = template.lastIndexOf("\n", openTagStart);
  const lineIndent = lineStart === -1 ? "" : template.slice(lineStart + 1, openTagStart);
  const indentedJson = escapedJsonData.split("\n").map((line) => `${lineIndent}${line}`).join("\n");
  const before = template.slice(0, openTagEnd + 1);
  const after = template.slice(closeTagStart);
  return `${before}
${indentedJson}
${after}`;
}
__name(injectDataIntoHtmlTemplate, "injectDataIntoHtmlTemplate");
function toHtml(sessionData) {
  const template = loadHtmlTemplate();
  return injectDataIntoHtmlTemplate(template, sessionData);
}
__name(toHtml, "toHtml");

// packages/cli/src/ui/utils/export/formatters/json.ts
init_esbuild_shims();
function toJson(sessionData) {
  return JSON.stringify(sessionData, null, 2);
}
__name(toJson, "toJson");

// packages/cli/src/ui/utils/export/formatters/jsonl.ts
init_esbuild_shims();
function toJsonl(sessionData) {
  const lines = [];
  const sourceMetadata = sessionData.metadata;
  const metadata = {
    type: "session_metadata",
    sessionId: sessionData.sessionId,
    startTime: sessionData.startTime
  };
  if (sourceMetadata?.exportTime) {
    metadata["exportTime"] = sourceMetadata.exportTime;
  }
  if (sourceMetadata?.cwd) {
    metadata["cwd"] = sourceMetadata.cwd;
  }
  if (sourceMetadata?.gitRepo) {
    metadata["gitRepo"] = sourceMetadata.gitRepo;
  }
  if (sourceMetadata?.gitBranch) {
    metadata["gitBranch"] = sourceMetadata.gitBranch;
  }
  if (sourceMetadata?.model) {
    metadata["model"] = sourceMetadata.model;
  }
  if (sourceMetadata?.channel) {
    metadata["channel"] = sourceMetadata.channel;
  }
  if (sourceMetadata?.promptCount !== void 0) {
    metadata["promptCount"] = sourceMetadata.promptCount;
  }
  if (sourceMetadata?.contextUsagePercent !== void 0) {
    metadata["contextUsagePercent"] = sourceMetadata.contextUsagePercent;
  }
  if (sourceMetadata?.contextWindowSize !== void 0) {
    metadata["contextWindowSize"] = sourceMetadata.contextWindowSize;
  }
  if (sourceMetadata?.totalTokens !== void 0) {
    metadata["totalTokens"] = sourceMetadata.totalTokens;
  }
  if (sourceMetadata?.filesWritten !== void 0) {
    metadata["filesWritten"] = sourceMetadata.filesWritten;
  }
  if (sourceMetadata?.linesAdded !== void 0) {
    metadata["linesAdded"] = sourceMetadata.linesAdded;
  }
  if (sourceMetadata?.linesRemoved !== void 0) {
    metadata["linesRemoved"] = sourceMetadata.linesRemoved;
  }
  if (sourceMetadata?.uniqueFiles && sourceMetadata.uniqueFiles.length > 0) {
    metadata["uniqueFiles"] = sourceMetadata.uniqueFiles;
  }
  lines.push(JSON.stringify(metadata));
  for (const message of sessionData.messages) {
    lines.push(JSON.stringify(message));
  }
  return lines.join("\n");
}
__name(toJsonl, "toJsonl");

// packages/cli/src/ui/utils/export/utils.ts
init_esbuild_shims();
function generateExportFilename(extension) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
  return `qwen-code-export-${timestamp}.${extension}`;
}
__name(generateExportFilename, "generateExportFilename");

// packages/cli/src/ui/utils/export/index.ts
init_esbuild_shims();

// packages/cli/src/utils/json-string-byte-projection.ts
init_esbuild_shims();
import { Buffer as Buffer2 } from "node:buffer";
var JSON_STRING_DELIMITER_BYTES = 2;
function jsonPayloadBytesAt(value, index) {
  const code = value.charCodeAt(index);
  if (code === 34 || code === 92) return 2;
  if (code <= 31) {
    return code === 8 || code === 9 || code === 10 || code === 12 || code === 13 ? 2 : 6;
  }
  if (code <= 127) return 1;
  if (code <= 2047) return 2;
  if (code >= 55296 && code <= 56319) {
    const next = value.charCodeAt(index + 1);
    return next >= 56320 && next <= 57343 ? 4 : 6;
  }
  if (code >= 56320 && code <= 57343) return 6;
  return 3;
}
__name(jsonPayloadBytesAt, "jsonPayloadBytesAt");
function jsonPayloadWidthAt(value, index) {
  const code = value.charCodeAt(index);
  if (code < 55296 || code > 56319) return 1;
  const next = value.charCodeAt(index + 1);
  return next >= 56320 && next <= 57343 ? 2 : 1;
}
__name(jsonPayloadWidthAt, "jsonPayloadWidthAt");
function jsonStringPayloadByteLength(value, stopAfterBytes = Number.POSITIVE_INFINITY) {
  let bytes = 0;
  for (let index = 0; index < value.length; ) {
    bytes += jsonPayloadBytesAt(value, index);
    if (bytes > stopAfterBytes) return bytes;
    index += jsonPayloadWidthAt(value, index);
  }
  return bytes;
}
__name(jsonStringPayloadByteLength, "jsonStringPayloadByteLength");
function jsonStringJsonByteLength(value) {
  return JSON_STRING_DELIMITER_BYTES + jsonStringPayloadByteLength(value);
}
__name(jsonStringJsonByteLength, "jsonStringJsonByteLength");
function jsonPayloadWidthBefore(value, end) {
  const last = value.charCodeAt(end - 1);
  if (last >= 56320 && last <= 57343 && end >= 2) {
    const previous = value.charCodeAt(end - 2);
    if (previous >= 55296 && previous <= 56319) return 2;
  }
  return 1;
}
__name(jsonPayloadWidthBefore, "jsonPayloadWidthBefore");
function selectPrefix(value, budget) {
  let end = 0;
  let bytes = 0;
  while (end < value.length) {
    const partBytes = jsonPayloadBytesAt(value, end);
    if (bytes + partBytes > budget) break;
    bytes += partBytes;
    end += jsonPayloadWidthAt(value, end);
  }
  return end;
}
__name(selectPrefix, "selectPrefix");
function selectSuffix(value, budget) {
  let start = value.length;
  let bytes = 0;
  while (start > 0) {
    const partWidth = jsonPayloadWidthBefore(value, start);
    const partBytes = jsonPayloadBytesAt(value, start - partWidth);
    if (bytes + partBytes > budget) break;
    bytes += partBytes;
    start -= partWidth;
  }
  return start;
}
__name(selectSuffix, "selectSuffix");
function copyString(value) {
  return value.split("").join("");
}
__name(copyString, "copyString");
function truncateJsonStringPayload(value, originalPayloadBytes, payloadBudget, marker) {
  if (originalPayloadBytes <= payloadBudget) return value;
  const markerPayloadBytes = jsonStringPayloadByteLength(marker);
  if (payloadBudget < markerPayloadBytes) {
    return copyString(value.slice(0, selectPrefix(value, payloadBudget)));
  }
  const sourceBudget = payloadBudget - markerPayloadBytes;
  const headBudget = Math.floor(sourceBudget * 0.2);
  const tailBudget = sourceBudget - headBudget;
  const headEnd = selectPrefix(value, headBudget);
  const tailStart = selectSuffix(value, tailBudget);
  return copyString(value.slice(0, headEnd)) + marker + copyString(value.slice(tailStart));
}
__name(truncateJsonStringPayload, "truncateJsonStringPayload");
function projectJsonStringToByteBudget(value, jsonByteBudget, marker) {
  const payloadBudget = Math.max(
    0,
    jsonByteBudget - JSON_STRING_DELIMITER_BYTES
  );
  const payloadBytes = jsonStringPayloadByteLength(value, payloadBudget);
  if (payloadBytes <= payloadBudget) return value;
  const projected = truncateJsonStringPayload(
    value,
    payloadBytes,
    payloadBudget,
    marker
  );
  if (Buffer2.byteLength(JSON.stringify(projected), "utf8") <= jsonByteBudget) {
    return projected;
  }
  const fallback = copyString(
    marker.slice(0, selectPrefix(marker, payloadBudget))
  );
  return Buffer2.byteLength(JSON.stringify(fallback), "utf8") <= jsonByteBudget ? fallback : "";
}
__name(projectJsonStringToByteBudget, "projectJsonStringToByteBudget");

export {
  GITHUB_WORKFLOW_PATHS,
  SetupGithubError,
  setupGithub,
  createTranscriptMessageUpdate,
  createTranscriptUsageUpdate,
  BaseEmitter,
  PlanEmitter,
  hasFullSessionContext,
  observeAcpToolResultProjection,
  observeAcpToolResultWire,
  observeHeadlessToolResultProjection,
  observeHeadlessToolResultWire,
  observeHeadlessJsonToolResultWire,
  ToolCallEmitter,
  HistoryReplayer,
  collectSessionData,
  normalizeSessionData,
  toMarkdown,
  INSIGHT_JS,
  INSIGHT_CSS,
  toHtml,
  toJson,
  toJsonl,
  generateExportFilename,
  JSON_STRING_DELIMITER_BYTES,
  jsonStringPayloadByteLength,
  jsonStringJsonByteLength,
  truncateJsonStringPayload,
  projectJsonStringToByteBudget
};
/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * This file is code-generated; do not edit manually.
 */
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * This HTML template is code-generated; do not edit manually.
 */
