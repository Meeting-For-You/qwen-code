// Force strict mode and setup for ESM
"use strict";
import {
  SERVE_CONTROL_EXT_METHODS
} from "./chunk-JHS74YAB.js";
import {
  ACTIVE_WORK_HEARTBEAT_VERSION,
  ACTIVE_WORK_HOLD_CATEGORIES,
  ACTIVE_WORK_MAX_SESSION_HOLDS,
  ACTIVE_WORK_MAX_SNAPSHOT_SESSIONS,
  ACTIVE_WORK_NOTIFICATION_METHOD,
  DAEMON_PERMISSION_CANCEL_REASON_META_KEY,
  MID_TURN_QUEUE_DRAIN_METHOD,
  MID_TURN_RECONCILIATION_RING_SIZE,
  TODO_STOP_GUARD_CONTINUATION_CLAIM_METHOD
} from "./chunk-OZ6KS6KW.js";
import {
  CancelSentinelCollisionError,
  InvalidPermissionOptionError
} from "./chunk-ERFDKH32.js";
import {
  CHANNEL_DELIVERY_ERROR_CODES,
  LIVE_TASK_TOOL_NAMES,
  MAX_LIVE_SCREEN_CONTEXT_TEXT_CHARS,
  MAX_LIVE_SPEAK_TO_USER_MESSAGE_CHARS,
  MAX_SUB_SESSION_NAME_CHARS
} from "./chunk-UDG5EZJI.js";
import {
  isValidExternalToolGuardDenialReason
} from "./chunk-3VUENPWF.js";
import {
  RequestError
} from "./chunk-IW6RQPQB.js";
import {
  MAX_SUB_SESSION_PROMPT_CHARS
} from "./chunk-LJZSMWOH.js";
import {
  APPROVAL_MODES
} from "./chunk-V5J4J5TP.js";
import {
  getSpecificMimeType
} from "./chunk-3I6UTTDX.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/acp-bridge/src/permissionMediator.ts
init_esbuild_shims();

// packages/acp-bridge/src/permission.ts
init_esbuild_shims();

// packages/acp-bridge/src/permissionMediator.ts
var CANCEL_VOTE_SENTINEL = "__cancelled__";
var MAX_RESOLVED_PERMISSION_RECORDS = 512;
function stringifyError(err) {
  try {
    if (err instanceof Error) return `${err.name}: ${err.message}`;
    return String(err);
  } catch {
    return "[unstringifiable error]";
  }
}
__name(stringifyError, "stringifyError");
function createNoOpPermissionAuditPublisher() {
  return {
    recordRequested() {
    },
    recordVoted() {
    },
    recordForbidden() {
    },
    recordResolved() {
    },
    recordTimeout() {
    }
  };
}
__name(createNoOpPermissionAuditPublisher, "createNoOpPermissionAuditPublisher");
var MultiClientPermissionMediator = class {
  static {
    __name(this, "MultiClientPermissionMediator");
  }
  policy;
  deps;
  pending = /* @__PURE__ */ new Map();
  resolved = /* @__PURE__ */ new Map();
  resolvedOrder = [];
  /**
   * Dedup flag for the
   * unanimity-required stderr breadcrumb. Without this, every
   * permission request on a 2-client consensus session would emit
   * an identical line (the unanimity condition is the NORMAL
   * operating mode for M=2, not a rare edge); a busy session with
   * many tool calls would produce dozens of duplicate stderr lines
   * within seconds. One emit per mediator (= per bridge/runtime lifetime
   * since each bridge constructs one) is enough to make the
   * configuration visible without spam.
   */
  unanimityBreadcrumbEmitted = false;
  constructor(policy, deps) {
    this.policy = policy;
    this.deps = deps;
  }
  /**
   * Register a fresh permission request from the agent.
   *
   * **Promise contract — once the Promise is returned, it never
   * rejects.** All runtime failure modes (timeout, session closure,
   * voter cancel, emit/audit publisher exceptions) are encoded as
   * `PermissionResolution { kind:'cancelled', reason:... }`.
   * Consumers can `await` the returned Promise and forward the
   * result without a `.catch()` block.
   *
   * **Synchronous-throw exception**:
   * when the agent's `allowedOptionIds` contains the
   * cancel-vote sentinel string, this method throws
   * `CancelSentinelCollisionError` synchronously BEFORE constructing
   * the Promise. The synchronous shape is intentional — a
   * never-settling Promise alongside a thrown error would be worse
   * than a clean fail-fast — but callers must wrap this method
   * itself in `try/catch` (or call it from an `async` function so
   * the throw bubbles via the function's own Promise machinery).
   * `bridgeClient.ts` currently has its own pre-check at the bridge
   * layer; embedded callers must do the same. See `@throws` below.
   *
   * **Synchronous-register invariant**: pending entry, audit
   * record, and timer setup all happen inside the Promise executor
   * without `await`. The bridge's `publish → mediator.request → await`
   * sequence relies on this — a `forgetSession` between publish and
   * await would otherwise miss the new pending and leak it until
   * timeout.
   *
   * @throws `CancelSentinelCollisionError` SYNCHRONOUSLY (not as a
   *   Promise rejection) if `record.allowedOptionIds` contains the
   *   cancel-vote sentinel string. This is a contract violation
   *   between agent and daemon and fails loudly at issue time
   *   rather than silently miscounting votes downstream. Callers
   *   inside an `async` function get the thrown error through the
   *   function's own Promise; synchronous callers must use
   *   `try/catch`.
   */
  request(record, timeoutMs) {
    if (record.allowedOptionIds.has(CANCEL_VOTE_SENTINEL)) {
      throw new CancelSentinelCollisionError(
        record.requestId,
        CANCEL_VOTE_SENTINEL
      );
    }
    return new Promise((resolve2) => {
      const policy = this.policy;
      const votersAtIssue = this.deps.votersForSession(record.sessionId);
      const pending = {
        requestId: record.requestId,
        sessionId: record.sessionId,
        promptId: record.promptId,
        policy,
        originatorClientId: record.originatorClientId,
        allowedOptionIds: record.allowedOptionIds,
        issuedAtMs: record.issuedAtMs,
        timeoutMs,
        resolve: resolve2,
        tallies: /* @__PURE__ */ new Map(),
        votersAtIssue,
        timer: void 0,
        consensusQuorumCapNoted: false
      };
      this.pending.set(record.requestId, pending);
      this.safeAudit(
        () => this.deps.audit.recordRequested(record, policy, votersAtIssue)
      );
      const unresolvedWithoutDecision = timeoutMs > 0 ? `voter cancellation, session cancellation, or permissionTimeoutMs (${timeoutMs}ms)` : "voter or session cancellation because permissionTimeoutMs is disabled";
      if (policy === "consensus" && votersAtIssue.size === 0) {
        try {
          process.stderr.write(
            `permissionMediator: consensus request ${record.requestId} for session ${record.sessionId} issued with empty votersAtIssue; can only resolve via ${unresolvedWithoutDecision}
`
          );
        } catch {
        }
      }
      if (policy === "consensus" && this.deps.consensusQuorum === void 0 && votersAtIssue.size >= 2 && Math.floor(votersAtIssue.size / 2) + 1 === votersAtIssue.size && !this.unanimityBreadcrumbEmitted) {
        this.unanimityBreadcrumbEmitted = true;
        try {
          process.stderr.write(
            `permissionMediator: consensus request ${record.requestId} for session ${record.sessionId} requires unanimity (votersAtIssue.size=${votersAtIssue.size}, default quorum=floor(M/2)+1=${votersAtIssue.size}); split votes will only resolve via ${unresolvedWithoutDecision}. This breadcrumb fires once per mediator lifetime; subsequent unanimity-required requests are silent.
`
          );
        } catch {
        }
      }
      if (timeoutMs > 0) {
        pending.timer = setTimeout(() => {
          if (this.pending.get(record.requestId) !== pending) return;
          const firedAtMs = this.deps.now();
          try {
            process.stderr.write(
              `qwen serve: permission ${record.requestId} (session ${record.sessionId}) timed out after ${timeoutMs}ms
`
            );
          } catch {
          }
          this.safeAudit(() => this.deps.audit.recordTimeout(record));
          this.resolveEntry(
            pending,
            { kind: "cancelled", reason: "timeout" },
            {
              type: "timeout",
              issuedAtMs: pending.issuedAtMs,
              timeoutMs: pending.timeoutMs,
              firedAtMs
            },
            void 0
          );
        }, timeoutMs);
        const t = pending.timer;
        if (t && typeof t === "object" && "unref" in t) {
          t.unref();
        }
      }
    });
  }
  vote(vote) {
    const pending = this.pending.get(vote.requestId);
    if (!pending) {
      const prior = this.resolved.get(vote.requestId);
      if (prior && prior.sessionId === vote.sessionId) {
        const optionId = prior.resolution.kind === "option" ? prior.resolution.optionId : CANCEL_VOTE_SENTINEL;
        this.safeEmit(prior.sessionId, {
          type: "permission_already_resolved",
          ...prior.promptId ? { promptId: prior.promptId } : {},
          data: {
            requestId: prior.requestId,
            sessionId: prior.sessionId,
            outcome: this.toAcpOutcome(prior.resolution)
          }
        });
        return { kind: "already_resolved", resolvedOptionId: optionId };
      }
      return { kind: "unknown_request" };
    }
    if (pending.sessionId !== vote.sessionId) {
      return { kind: "unknown_request" };
    }
    if (vote.optionId === CANCEL_VOTE_SENTINEL) {
      const outcome = {
        kind: "resolved",
        resolvedOptionId: CANCEL_VOTE_SENTINEL
      };
      this.safeAudit(
        () => this.deps.audit.recordVoted(this.toRecord(pending), vote, outcome)
      );
      this.resolveEntry(
        pending,
        { kind: "cancelled", reason: "agent_cancelled" },
        {
          type: "voter-cancelled",
          resolverClientId: vote.clientId
        },
        vote.clientId
      );
      return outcome;
    }
    if (!pending.allowedOptionIds.has(vote.optionId)) {
      throw new InvalidPermissionOptionError(vote.requestId, vote.optionId);
    }
    switch (pending.policy) {
      case "first-responder":
        return this.voteFirstResponder(pending, vote);
      case "designated":
        return this.voteDesignated(pending, vote);
      case "consensus":
        return this.voteConsensus(pending, vote);
      case "local-only":
        return this.voteLocalOnly(pending, vote);
      default: {
        const _exhaustive = pending.policy;
        void _exhaustive;
        throw new Error(`Unknown permission policy "${pending.policy}"`);
      }
    }
  }
  forgetSession(sessionId) {
    const requestIds = [];
    for (const [id, pending] of this.pending) {
      if (pending.sessionId === sessionId) requestIds.push(id);
    }
    for (const id of requestIds) {
      const pending = this.pending.get(id);
      if (!pending) continue;
      this.resolveEntry(
        pending,
        { kind: "cancelled", reason: "session_closed" },
        { type: "session-closed" },
        void 0
      );
    }
  }
  /**
   * Lookup the sessionId for a given requestId. Used by the legacy
   * `bridge.respondToPermission(requestId, ...)` route which doesn't
   * carry a sessionId in the URL. NOT part of the
   * `PermissionMediator` interface contract — bridge holds the
   * concrete class reference and calls this directly.
   */
  peekSessionFor(requestId) {
    const pending = this.pending.get(requestId);
    if (pending) return pending.sessionId;
    const prior = this.resolved.get(requestId);
    return prior?.sessionId;
  }
  /**
   * Daemon-wide in-flight pending count for diagnostics. The bridge
   * exposes this through its `pendingPermissionCount` getter so
   * operators can spot stuck FIFOs without reaching into mediator
   * internals. NOT part of the `PermissionMediator` interface
   * contract.
   */
  get pendingCount() {
    return this.pending.size;
  }
  // ===========================================================
  // Per-policy vote handlers
  // ===========================================================
  voteFirstResponder(pending, vote) {
    return this.resolveWithVote(pending, vote, {
      type: "first-responder",
      resolverClientId: vote.clientId
    });
  }
  voteDesignated(pending, vote) {
    if (pending.originatorClientId === void 0) {
      return this.voteFirstResponder(pending, vote);
    }
    if (vote.clientId !== pending.originatorClientId) {
      return this.rejectForbidden(
        pending,
        vote,
        "designated_mismatch",
        "designated_mismatch (voter is not the prompt originator)"
      );
    }
    return this.resolveWithVote(pending, vote, {
      type: "designated-originator",
      originatorClientId: pending.originatorClientId
    });
  }
  voteConsensus(pending, vote) {
    if (vote.clientId === void 0 || !pending.votersAtIssue.has(vote.clientId)) {
      return this.rejectForbidden(
        pending,
        vote,
        "designated_mismatch",
        "designated_mismatch (voter not in consensus votersAtIssue snapshot)"
      );
    }
    for (const [originalOptionId, set] of pending.tallies.entries()) {
      if (vote.clientId !== void 0 && set.has(vote.clientId)) {
        const outcome2 = {
          kind: "recorded",
          votesNeeded: this.votesNeededFor(pending)
        };
        this.safeAudit(
          () => this.deps.audit.recordVoted(
            this.toRecord(pending),
            { ...vote, optionId: originalOptionId },
            outcome2
          )
        );
        return outcome2;
      }
    }
    let bucket = pending.tallies.get(vote.optionId);
    if (!bucket) {
      bucket = /* @__PURE__ */ new Set();
      pending.tallies.set(vote.optionId, bucket);
    }
    bucket.add(vote.clientId);
    const quorum = this.consensusQuorumFor(pending);
    if (bucket.size >= quorum) {
      return this.resolveWithVote(pending, vote, {
        type: "consensus-quorum",
        resolvedOptionId: vote.optionId,
        quorum,
        tally: bucket.size
      });
    }
    const outcome = {
      kind: "recorded",
      votesNeeded: this.votesNeededFor(pending)
    };
    this.safeAudit(
      () => this.deps.audit.recordVoted(this.toRecord(pending), vote, outcome)
    );
    this.safeEmit(pending.sessionId, {
      type: "permission_partial_vote",
      ...pending.promptId ? { promptId: pending.promptId } : {},
      data: {
        requestId: pending.requestId,
        sessionId: pending.sessionId,
        votesReceived: this.totalTalliedFor(pending),
        votesNeeded: outcome.votesNeeded,
        quorum,
        optionTallies: this.optionTalliesFor(pending)
      },
      ...pending.originatorClientId !== void 0 ? { originatorClientId: pending.originatorClientId } : {}
    });
    return outcome;
  }
  /**
   * Vote dispatch for `local-only` policy: only `fromLoopback: true`
   * voters can resolve a permission.
   *
   * **Cancel-sentinel asymmetry** (cancel-sentinel note).
   * `vote()` recognizes the cancel sentinel BEFORE calling this
   * method (cross-policy escape hatch — see the
   * `CANCEL_VOTE_SENTINEL` JSDoc for the rationale), so a remote
   * voter under `local-only` CAN abort a pending permission via
   * `{outcome:'cancelled'}` even though they cannot RESOLVE one. The
   * settings-side description for `local-only` and the design doc call
   * out this gap explicitly. Operators who want strict-cancel-too
   * semantics must (a) deploy a dedicated daemon process at
   * loopback bind, OR (b) wait for the follow-up PR that lifts
   * cancel into per-policy gating; This version keeps the current
   * cross-policy cancel for consistency with first-responder /
   * designated / consensus.
   */
  voteLocalOnly(pending, vote) {
    if (!vote.fromLoopback) {
      return this.rejectForbidden(
        pending,
        vote,
        "remote_not_allowed",
        "remote_not_allowed (local-only policy; vote not from loopback)"
      );
    }
    return this.resolveWithVote(pending, vote, {
      type: "local-only-loopback",
      resolverClientId: vote.clientId
    });
  }
  // ===========================================================
  // Shared vote-resolution helpers
  // ===========================================================
  resolveWithVote(pending, vote, decisionReason) {
    const outcome = {
      kind: "resolved",
      resolvedOptionId: vote.optionId
    };
    this.safeAudit(
      () => this.deps.audit.recordVoted(this.toRecord(pending), vote, outcome)
    );
    this.resolveEntry(
      pending,
      {
        kind: "option",
        optionId: vote.optionId,
        ...vote.metadata ? { metadata: vote.metadata } : {}
      },
      decisionReason,
      vote.clientId
    );
    return outcome;
  }
  rejectForbidden(pending, vote, reason, stderrDetail) {
    this.safeAudit(
      () => this.deps.audit.recordForbidden(this.toRecord(pending), vote, reason)
    );
    this.safeEmit(pending.sessionId, {
      type: "permission_forbidden",
      ...pending.promptId ? { promptId: pending.promptId } : {},
      data: {
        requestId: pending.requestId,
        sessionId: pending.sessionId,
        ...vote.clientId !== void 0 ? { clientId: vote.clientId } : {},
        reason
      },
      ...pending.originatorClientId !== void 0 ? { originatorClientId: pending.originatorClientId } : {}
    });
    this.writeForbiddenStderr(pending, vote, stderrDetail);
    return { kind: "forbidden", reason };
  }
  // ===========================================================
  // Consensus tally helpers
  // ===========================================================
  /**
   * Compute the quorum size for a `consensus` request. Default
   * `floor(M/2) + 1` of `votersAtIssue.size`; overridden by
   * `deps.consensusQuorum` when set, capped to `M` so an operator
   * misconfig (N > M) can't deadlock.
   *
   * When the cap fires, write
   * a one-time stderr breadcrumb per request so operators don't
   * have to diff their `policy.consensusQuorum` against
   * `votersAtIssue.size` manually to understand why a quorum
   * resolved sooner than configured. Tracked on `MediatorPending`
   * so the breadcrumb fires once even though `consensusQuorumFor`
   * may be called multiple times per request (vote tally + final
   * resolution).
   */
  consensusQuorumFor(pending) {
    const m = pending.votersAtIssue.size;
    const override = this.deps.consensusQuorum;
    if (override !== void 0) {
      const capped = Math.min(override, Math.max(m, 1));
      if (capped < override && !pending.consensusQuorumCapNoted) {
        pending.consensusQuorumCapNoted = true;
        try {
          process.stderr.write(
            `permissionMediator: consensusQuorum override ${override} capped to ${capped} (votersAtIssue.size=${m}) for request ${pending.requestId} session ${pending.sessionId}
`
          );
        } catch {
        }
      }
      return capped;
    }
    return Math.max(1, Math.floor(m / 2) + 1);
  }
  totalTalliedFor(pending) {
    let total = 0;
    for (const set of pending.tallies.values()) total += set.size;
    return total;
  }
  /**
   * `votesNeeded` = `quorum - max(tally per option)`. When no
   * option has any votes (degenerate; `permission_partial_vote`
   * is only emitted AFTER the first vote, so this should never
   * appear on the wire), returns `quorum` itself. Always ≥ 1
   * because the resolved-on-quorum path returns before this
   * helper runs.
   */
  votesNeededFor(pending) {
    const quorum = this.consensusQuorumFor(pending);
    let max = 0;
    for (const set of pending.tallies.values()) {
      if (set.size > max) max = set.size;
    }
    return Math.max(quorum - max, 1);
  }
  optionTalliesFor(pending) {
    const out = {};
    for (const [optionId, set] of pending.tallies) {
      out[optionId] = set.size;
    }
    return out;
  }
  // ===========================================================
  // Resolution + cleanup
  // ===========================================================
  /**
   * Settle a pending entry. Cleanup order is hardened (cleanup-order invariant):
   *   1. clearTimeout (so a timer can never fire on a half-cleaned entry).
   *   2. Delete from `pending` (state-first half — entry no longer
   *      reachable for new votes).
   *   3. emit wire `permission_resolved` (best-effort — emit failures
   *      do not block the Promise settle). MUST come before step 4
   *      so a re-entrant subscriber synchronously casting another
   *      vote during emit sees `pending === undefined && resolved
   *      === undefined` (silent false), matching the previous ordering.
   *
   *   4. write to `resolved` (the second half of state move — late
   *      voters arriving after this see `permission_already_resolved`).
   *   5. audit.recordResolved (best-effort, same).
   *   6. Settle the Promise (LAST — callbacks running re-entrantly
   *      see consistent state).
   *
   * Previously the spec bundled
   * "delete pending + write resolved" into step 2 ahead of emit,
   * which contradicted the code. The fix
   * splits the two halves of the state move around the emit so
   * the spec faithfully describes the ordering invariant.
   *
   * @param resolverClientId  wire compat: the
   *   `permission_resolved` SSE frame stamps this as
   *   `originatorClientId`. The previous `resolvePending` in
   *   `httpAcpBridge.ts:1518-1523` filled it from the voter's
   *   trusted clientId. We preserve byte-for-byte; vote-driven
   *   paths pass `vote.clientId` (which may be undefined for
   *   loopback no-header voters); timer + session-closed paths
   *   pass undefined (no voter).
   */
  resolveEntry(pending, resolution, decisionReason, resolverClientId) {
    if (this.pending.get(pending.requestId) !== pending) {
      return;
    }
    if (pending.timer !== void 0) {
      clearTimeout(pending.timer);
      pending.timer = void 0;
    }
    this.pending.delete(pending.requestId);
    this.safeEmit(pending.sessionId, {
      type: "permission_resolved",
      ...pending.promptId ? { promptId: pending.promptId } : {},
      data: {
        requestId: pending.requestId,
        outcome: this.toAcpOutcome(resolution),
        // Note: `voterClientId` is the canonical,
        // unambiguous name for "who cast the resolving vote". The envelope
        // `originatorClientId` below carries the SAME value for wire
        // compat (it is semantically the voter on `permission_resolved`,
        // unlike on `permission_request` where it is the prompt originator).
        // Both are optional and omitted together for no-voter resolutions
        // (timer expiry / session-closed / loopback voter with no clientId).
        ...resolverClientId !== void 0 ? { voterClientId: resolverClientId } : {}
      },
      // Preserve pre-extraction behavior: voter's clientId is stamped
      // here (not the prompt originator's). Documented inconsistency
      // with `permission_request.originatorClientId` (which IS the
      // prompt originator); we do not fix the inconsistency to
      // avoid breaking the wire shape. A4 keeps it as a deprecated
      // alias of `data.voterClientId`.
      ...resolverClientId !== void 0 ? { originatorClientId: resolverClientId } : {}
    });
    this.rememberResolved({
      requestId: pending.requestId,
      sessionId: pending.sessionId,
      promptId: pending.promptId,
      resolution,
      resolverClientId
    });
    if (decisionReason !== void 0) {
      this.safeAudit(
        () => this.deps.audit.recordResolved(
          this.toRecord(pending),
          resolution,
          decisionReason
        )
      );
    }
    pending.resolve(resolution);
  }
  rememberResolved(record) {
    if (!this.resolved.has(record.requestId)) {
      this.resolvedOrder.push(record.requestId);
    }
    this.resolved.set(record.requestId, record);
    while (this.resolvedOrder.length > MAX_RESOLVED_PERMISSION_RECORDS) {
      const oldest = this.resolvedOrder.shift();
      if (oldest !== void 0) this.resolved.delete(oldest);
    }
  }
  safeEmit(sessionId, event) {
    try {
      this.deps.emit(sessionId, event);
    } catch (err) {
      try {
        process.stderr.write(
          `permissionMediator: emit failed for session=${JSON.stringify(sessionId)} type=${JSON.stringify(event.type)}: ${stringifyError(err)}
`
        );
      } catch {
      }
    }
  }
  /**
   * Emit a stderr breadcrumb
   * for every vote rejection (the three forbidden paths in
   * voteDesignated / voteConsensus / voteLocalOnly). Mirrors the
   * timeout breadcrumb pattern: audit ring + SSE event are
   * transient observability surfaces (no v1 query route, SSE drops
   * on disconnect), so an operator tailing daemon stderr would see
   * zero indication of permission rejections without this.
   *
   * Wrapped in `try/catch` because `process.stderr.write` can
   * synchronously throw on EPIPE during shutdown — a stderr
   * unavailability must not propagate up through `safeEmit` /
   * `safeAudit` and break the resolveEntry cleanup ladder. Mirrors
   * the safeEmit/safeAudit defensive posture (see the
   * matching hang scenario in safeEmit).
   */
  writeForbiddenStderr(pending, vote, reasonDetail) {
    try {
      const voterDescriptor = vote.clientId === void 0 ? "<anonymous>" : JSON.stringify(vote.clientId);
      process.stderr.write(
        `qwen serve: permission ${pending.requestId} (session ${pending.sessionId}): vote rejected (${reasonDetail}) by client ${voterDescriptor}
`
      );
    } catch {
    }
  }
  /**
   * Run an audit-publisher call defensively. The audit ring is
   * best-effort observability — a publisher exception (ring full,
   * host bug, transient I/O) MUST NOT throw out of `request()`,
   * `vote()`, or the timer callback. Without this guard, the
   * Promise the agent is awaiting would be left unsettled and the
   * pending entry would leak.
   *
   * Single helper used at all five audit call sites so the
   * "audit is best-effort" invariant is uniformly enforced (the
   * pre-fix asymmetric `try/catch` at 2 of 5 sites was a real
   * silent-failure hole.
   *
   * doc placement — JSDoc was previously
   * stacked above `writeForbiddenStderr` so IDE hover and API
   * doc generation showed the wrong attribution. Moved adjacent
   * to its actual definition.
   */
  safeAudit(fn) {
    try {
      fn();
    } catch (err) {
      try {
        process.stderr.write(
          `permissionMediator: audit publisher threw: ${stringifyError(err)}
`
        );
      } catch {
      }
    }
  }
  toRecord(pending) {
    return {
      requestId: pending.requestId,
      sessionId: pending.sessionId,
      ...pending.promptId ? { promptId: pending.promptId } : {},
      originatorClientId: pending.originatorClientId,
      allowedOptionIds: pending.allowedOptionIds,
      issuedAtMs: pending.issuedAtMs
    };
  }
  toAcpOutcome(resolution) {
    if (resolution.kind === "option") {
      return { outcome: "selected", optionId: resolution.optionId };
    }
    return { outcome: "cancelled" };
  }
};

// packages/acp-bridge/src/internal/stderrLine.ts
init_esbuild_shims();
function writeStderrLine(message) {
  process.stderr.write(message.endsWith("\n") ? message : `${message}
`);
}
__name(writeStderrLine, "writeStderrLine");

// packages/acp-bridge/src/sessionAttachments.ts
init_esbuild_shims();
import { randomUUID } from "node:crypto";
import { promises as fs, statSync } from "node:fs";
import { tmpdir } from "node:os";
import * as path from "node:path";
var SESSION_ATTACHMENT_MAX_ITEM_BYTES = 8 * 1024 * 1024;
var SESSION_ATTACHMENT_MAX_NAME_BYTES = 255;
var SUPPORTED_IMAGE_MIME_TYPES = /* @__PURE__ */ new Set([
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp"
]);
var SESSION_ATTACHMENT_UNAVAILABLE_TEXT = "[Attachment is no longer available]";
var SessionAttachmentReferenceError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "SessionAttachmentReferenceError";
  }
  static {
    __name(this, "SessionAttachmentReferenceError");
  }
};
function isSessionAttachmentReference(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value;
  return (record["type"] === "image" || record["type"] === "resource") && typeof record["attachmentId"] === "string" && record["attachmentId"].length > 0 && typeof record["mimeType"] === "string" && record["mimeType"].length > 0 && (record["type"] !== "image" || record["mimeType"].startsWith("image/")) && typeof record["size"] === "number" && Number.isSafeInteger(record["size"]) && record["size"] >= 0 && (record["type"] !== "image" || record["size"] > 0);
}
__name(isSessionAttachmentReference, "isSessionAttachmentReference");
function safeAttachmentName(name) {
  const safeName = path.basename(name.replaceAll("\\", "/")).trim();
  const isWindowsReserved = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(safeName);
  const hasInvalidCharacter = Array.from(safeName).some((character) => {
    const codePoint = character.codePointAt(0);
    return codePoint !== void 0 && (codePoint <= 31 || codePoint === 127 || codePoint >= 55296 && codePoint <= 57343);
  });
  return !safeName || safeName === "." || safeName === ".." || safeName.endsWith(".") || isWindowsReserved || /[<>:"|?*]/.test(safeName) || hasInvalidCharacter || Buffer.byteLength(safeName) > SESSION_ATTACHMENT_MAX_NAME_BYTES ? void 0 : safeName;
}
__name(safeAttachmentName, "safeAttachmentName");
function truncateUtf8(value, maxBytes) {
  let bytes = 0;
  let result = "";
  for (const character of value) {
    const characterBytes = Buffer.byteLength(character);
    if (bytes + characterBytes > maxBytes) break;
    result += character;
    bytes += characterBytes;
  }
  return result;
}
__name(truncateUtf8, "truncateUtf8");
function deduplicatedName(name, suffix) {
  if (suffix === 0) return name;
  const extension = path.extname(name);
  const suffixText = ` (${suffix})`;
  const stem = name.slice(0, -extension.length || void 0);
  const extensionBudget = SESSION_ATTACHMENT_MAX_NAME_BYTES - Buffer.byteLength(suffixText) - 1;
  const safeExtension = truncateUtf8(extension, extensionBudget).replace(
    /[. ]+$/u,
    ""
  );
  const stemBudget = SESSION_ATTACHMENT_MAX_NAME_BYTES - Buffer.byteLength(suffixText) - Buffer.byteLength(safeExtension);
  return `${truncateUtf8(stem, stemBudget)}${suffixText}${safeExtension}`;
}
__name(deduplicatedName, "deduplicatedName");
function imageName(mimeType) {
  const extension = mimeType.slice("image/".length).split(/[;+]/, 1)[0];
  return `image.${extension === "jpg" ? "jpeg" : extension || "img"}`;
}
__name(imageName, "imageName");
function mimeTypeForName(name) {
  if ([".ts", ".mts", ".cts", ".tsx"].includes(path.extname(name).toLowerCase())) {
    return "text/plain";
  }
  return getSpecificMimeType(name) ?? "application/octet-stream";
}
__name(mimeTypeForName, "mimeTypeForName");
function isSupportedImageMimeType(mimeType) {
  return SUPPORTED_IMAGE_MIME_TYPES.has(mimeType);
}
__name(isSupportedImageMimeType, "isSupportedImageMimeType");
function isTextMimeType(mimeType) {
  return mimeType.startsWith("text/") || mimeType === "application/json" || mimeType.endsWith("+json") || mimeType === "application/xml" || mimeType.endsWith("+xml") || mimeType === "application/javascript" || mimeType === "application/typescript" || mimeType === "application/yaml" || mimeType === "application/x-yaml" || mimeType === "application/toml";
}
__name(isTextMimeType, "isTextMimeType");
function isTextAttachment(data, mimeType) {
  if (isTextMimeType(mimeType)) return true;
  if (mimeType.startsWith("image/") || mimeType.startsWith("audio/") || mimeType.startsWith("video/") || mimeType.startsWith("font/") || mimeType === "application/pdf" || data.includes(0)) {
    return false;
  }
  return Buffer.from(data.toString("utf8"), "utf8").equals(data);
}
__name(isTextAttachment, "isTextAttachment");
function withAttachmentDegradationMarker(blocks) {
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];
    if (block.type === "text") {
      if (block.text.endsWith(SESSION_ATTACHMENT_UNAVAILABLE_TEXT)) {
        return [...blocks];
      }
      const next = [...blocks];
      next[i] = {
        type: "text",
        text: `${block.text}
${SESSION_ATTACHMENT_UNAVAILABLE_TEXT}`
      };
      return next;
    }
  }
  return [
    ...blocks,
    { type: "text", text: SESSION_ATTACHMENT_UNAVAILABLE_TEXT }
  ];
}
__name(withAttachmentDegradationMarker, "withAttachmentDegradationMarker");
var SessionAttachmentStore = class {
  constructor(directoryRoot, sessionId) {
    this.directoryRoot = directoryRoot;
    if (!directoryRoot || !sessionId) return;
    this.persistentDirectory = path.join(
      directoryRoot,
      `session-${encodeURIComponent(sessionId)}`
    );
  }
  static {
    __name(this, "SessionAttachmentStore");
  }
  directoryPromise;
  persistentDirectory;
  activeDirectory;
  pendingItems = 0;
  pendingNames = /* @__PURE__ */ new Map();
  pendingDrainWaiters = [];
  copyDrainWaiters = [];
  copying = false;
  closing = false;
  closed = false;
  async putAttachment(data, mimeType, name) {
    const isImage = isSupportedImageMimeType(mimeType);
    const safeName = safeAttachmentName(
      name ?? (isImage ? imageName(mimeType) : "")
    );
    if (!safeName) {
      throw new TypeError("Session attachment name is invalid");
    }
    const storedMimeType = mimeTypeForName(safeName);
    if (isImage && storedMimeType !== mimeType || isSupportedImageMimeType(storedMimeType) && !isImage) {
      throw new TypeError("Attachment name and Content-Type do not match");
    }
    if (this.closed || this.closing) {
      throw new Error("Session attachment store is closed");
    }
    if (this.copying) throw new Error("Session attachments are being copied");
    if (isImage && data.byteLength === 0 || data.byteLength > SESSION_ATTACHMENT_MAX_ITEM_BYTES) {
      throw new RangeError(
        `Session attachment must be at most ${SESSION_ATTACHMENT_MAX_ITEM_BYTES} bytes and images cannot be empty`
      );
    }
    let filePath;
    let pendingName = safeName;
    let removeFileOnFailure = false;
    this.pendingItems += 1;
    this.reservePendingName(safeName);
    try {
      const directory = await this.directory();
      let suffix = 0;
      for (; ; ) {
        const candidateName = deduplicatedName(safeName, suffix);
        if (safeAttachmentName(candidateName) !== candidateName) {
          throw new TypeError("Session attachment name is invalid");
        }
        if (pendingName !== candidateName) {
          if (pendingName) this.releasePendingName(pendingName);
          this.reservePendingName(candidateName);
          pendingName = candidateName;
        }
        filePath = path.join(directory, candidateName);
        removeFileOnFailure = true;
        try {
          await fs.writeFile(filePath, data, { flag: "wx" });
          break;
        } catch (error) {
          if (error.code !== "EEXIST") throw error;
          removeFileOnFailure = false;
          this.releasePendingName(candidateName);
          pendingName = void 0;
          filePath = void 0;
          suffix += 1;
        }
      }
      if (this.closed || this.closing) {
        throw new Error("Session attachment store is closed");
      }
      const name2 = path.basename(filePath);
      const storedMimeType2 = mimeTypeForName(name2);
      const reference = {
        type: isSupportedImageMimeType(storedMimeType2) ? "image" : "resource",
        attachmentId: name2,
        mimeType: storedMimeType2,
        size: data.byteLength
      };
      return reference;
    } catch (error) {
      if (removeFileOnFailure && filePath) {
        await fs.rm(filePath, { force: true }).catch(() => {
        });
      }
      throw error;
    } finally {
      if (pendingName) this.releasePendingName(pendingName);
      if (!this.closed) {
        this.pendingItems -= 1;
        if (this.pendingItems === 0) {
          this.resolvePendingDrainWaiters();
        }
      }
    }
  }
  // Validate one block against the store. Ordinary ACP content passes through
  // untouched, matching `assertReferences`.
  assertReference(block) {
    if (!block || typeof block !== "object" || Array.isArray(block) || !("attachmentId" in block)) {
      return;
    }
    if (!isSessionAttachmentReference(block)) {
      throw new SessionAttachmentReferenceError(
        "Invalid session attachment reference",
        "invalid_session_attachment_reference"
      );
    }
    this.assertStored(block);
  }
  assertReferences(content) {
    const seenIds = /* @__PURE__ */ new Set();
    for (const block of content) {
      if (!block || typeof block !== "object" || Array.isArray(block) || !("attachmentId" in block)) {
        continue;
      }
      if (!isSessionAttachmentReference(block)) {
        throw new SessionAttachmentReferenceError(
          "Invalid session attachment reference",
          "invalid_session_attachment_reference"
        );
      }
      const id = block.attachmentId;
      if (seenIds.has(id)) {
        throw new SessionAttachmentReferenceError(
          `Session attachment referenced more than once: ${id}`,
          "invalid_session_attachment_reference"
        );
      }
      seenIds.add(id);
      this.assertStored(block);
    }
  }
  async resolveContent(content, memo) {
    const pendingById = memo ?? /* @__PURE__ */ new Map();
    return await Promise.all(
      content.map(async (block) => {
        if (!isSessionAttachmentReference(block)) return block;
        const id = block.attachmentId;
        let pending = pendingById.get(id);
        if (!pending) {
          const created = this.resolve(block);
          pendingById.set(id, created);
          void created.catch(() => {
            if (pendingById.get(id) === created) {
              pendingById.delete(id);
            }
          });
          pending = created;
        }
        return await pending;
      })
    );
  }
  // Per-block variant of `resolveContent` for degrade paths: one unresolvable
  // reference drops only itself, keeping the sibling blocks a wholesale
  // fallback would discard. Other errors still propagate.
  async resolveContentDegrading(content, memo) {
    const retainedBlocks = [];
    const resolvedBlocks = [];
    let degraded = 0;
    for (const block of content) {
      if (!isSessionAttachmentReference(block)) {
        retainedBlocks.push(block);
        resolvedBlocks.push(block);
        continue;
      }
      try {
        const [resolved] = await this.resolveContent([block], memo);
        if (resolved) resolvedBlocks.push(resolved);
        retainedBlocks.push(block);
      } catch (error) {
        if (!(error instanceof SessionAttachmentReferenceError)) throw error;
        degraded += 1;
      }
    }
    return { retainedBlocks, resolvedBlocks, degraded };
  }
  async read(attachmentId) {
    const name = safeAttachmentName(attachmentId);
    if (!name || name !== attachmentId) return void 0;
    const filePath = path.join(await this.directory(), name);
    try {
      return {
        data: await fs.readFile(filePath),
        mimeType: mimeTypeForName(name)
      };
    } catch (error) {
      if (error.code === "ENOENT") {
        return void 0;
      }
      throw error;
    }
  }
  async copyFrom(source) {
    if (source === this) return;
    if (this.closed || this.closing) {
      throw new Error("Session attachment store is closed");
    }
    if (this.copying) throw new Error("Session attachments are being copied");
    if (source.closed || source.closing) {
      throw new Error("Session attachment store is closed");
    }
    if (source.copying) {
      throw new Error("Session attachments are being copied");
    }
    this.copying = true;
    source.copying = true;
    try {
      if (this.pendingItems > 0) {
        await new Promise(
          (resolve2) => this.pendingDrainWaiters.push(resolve2)
        );
      }
      if (source.pendingItems > 0) {
        await new Promise(
          (resolve2) => source.pendingDrainWaiters.push(resolve2)
        );
      }
      if (this.closed) throw new Error("Session attachment store is closed");
      const sourceDirectory = source.persistentDirectory ?? source.activeDirectory;
      if (!sourceDirectory) return;
      let entries;
      try {
        entries = await fs.readdir(sourceDirectory, { withFileTypes: true });
      } catch (error) {
        if (error.code === "ENOENT") return;
        throw error;
      }
      const targetDirectory = await this.directory();
      await Promise.all(
        entries.filter(
          (entry) => entry.isFile() && !source.pendingNames.has(entry.name)
        ).map(async (entry) => {
          const sourcePath = path.join(sourceDirectory, entry.name);
          try {
            await fs.copyFile(
              sourcePath,
              path.join(targetDirectory, entry.name)
            );
          } catch (error) {
            if (error.code === "ENOENT") {
              try {
                await fs.stat(sourcePath);
              } catch (sourceError) {
                if (sourceError.code === "ENOENT") {
                  return;
                }
              }
            }
            throw error;
          }
        })
      );
    } finally {
      source.copying = false;
      this.copying = false;
      source.resolveCopyDrainWaiters();
      this.resolveCopyDrainWaiters();
    }
  }
  async remove(attachmentId) {
    const name = safeAttachmentName(attachmentId);
    if (!name || name !== attachmentId || this.copying || this.pendingNames.has(name)) {
      return false;
    }
    const directory = await this.directory();
    const filePath = path.join(directory, name);
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === "ENOENT") {
        return false;
      }
      throw error;
    }
  }
  async close() {
    this.closing = true;
    await this.waitForCopy();
    if (this.closed) return;
    this.closed = true;
    this.pendingItems = 0;
    this.pendingNames.clear();
    this.resolvePendingDrainWaiters();
    if (this.persistentDirectory || !this.directoryPromise) return;
    const directory = await this.directoryPromise.catch(() => void 0);
    if (!directory) return;
    await fs.rm(directory, { recursive: true, force: true });
  }
  async delete(options = {}) {
    options.assertCanCommit?.();
    this.closing = true;
    await this.waitForCopy();
    options.assertCanCommit?.();
    if (!this.closed) {
      this.closed = true;
      this.pendingItems = 0;
      this.pendingNames.clear();
      this.resolvePendingDrainWaiters();
    }
    const directory = this.persistentDirectory ?? await this.directoryPromise?.catch(() => void 0);
    if (directory) {
      options.assertCanCommit?.();
      const tombstone = path.join(
        path.dirname(directory),
        `.${path.basename(directory)}.deleting-${randomUUID()}`
      );
      try {
        await fs.rename(directory, tombstone);
      } catch (error) {
        if (error.code === "ENOENT") return;
        throw error;
      }
      await fs.rm(tombstone, { recursive: true, force: true });
    }
  }
  assertStored(reference) {
    const id = reference.attachmentId;
    const name = safeAttachmentName(id);
    let size;
    const directory = this.persistentDirectory ?? this.activeDirectory;
    if (name && name === id && directory) {
      try {
        size = statSync(path.join(directory, name)).size;
      } catch {
        size = void 0;
      }
    }
    const storedMimeType = name ? mimeTypeForName(name) : void 0;
    const storedType = storedMimeType ? isSupportedImageMimeType(storedMimeType) ? "image" : "resource" : void 0;
    if (size !== reference.size || storedMimeType !== reference.mimeType || storedType !== reference.type) {
      throw new SessionAttachmentReferenceError(
        `Unknown or unavailable session attachment: ${id}`,
        "session_attachment_gone"
      );
    }
  }
  releasePendingName(name) {
    const count = this.pendingNames.get(name) ?? 0;
    if (count <= 1) this.pendingNames.delete(name);
    else this.pendingNames.set(name, count - 1);
  }
  reservePendingName(name) {
    this.pendingNames.set(name, (this.pendingNames.get(name) ?? 0) + 1);
  }
  async waitForCopy() {
    while (this.copying) {
      await new Promise((resolve2) => this.copyDrainWaiters.push(resolve2));
    }
  }
  resolveCopyDrainWaiters() {
    for (const resolve2 of this.copyDrainWaiters.splice(0)) resolve2();
  }
  resolvePendingDrainWaiters() {
    for (const resolve2 of this.pendingDrainWaiters.splice(0)) resolve2();
  }
  async resolve(reference) {
    const id = reference.attachmentId;
    const attachment = await this.read(id);
    if (!attachment) {
      throw new SessionAttachmentReferenceError(
        `Unknown or unavailable session attachment: ${id}`,
        "session_attachment_gone"
      );
    }
    if (reference.type === "resource") {
      const resource = {
        uri: `attachment:///${encodeURIComponent(reference.attachmentId)}`,
        mimeType: attachment.mimeType,
        ...isTextAttachment(attachment.data, attachment.mimeType) ? { text: attachment.data.toString("utf8") } : { blob: attachment.data.toString("base64") }
      };
      return {
        type: "resource",
        resource
      };
    }
    return {
      type: "image",
      data: attachment.data.toString("base64"),
      mimeType: attachment.mimeType
    };
  }
  async directory() {
    if (!this.directoryPromise) {
      const pending = this.persistentDirectory ? fs.mkdir(this.persistentDirectory, {
        recursive: true,
        mode: 448
      }).then(() => this.persistentDirectory) : this.directoryRoot ? fs.mkdir(this.directoryRoot, { recursive: true, mode: 448 }).then(
        () => fs.mkdtemp(
          path.join(this.directoryRoot, "session-attachment-")
        )
      ) : fs.mkdtemp(path.join(tmpdir(), "qwen-session-attachment-"));
      const directoryPromise = pending.then((directory) => {
        this.activeDirectory = directory;
        return directory;
      });
      this.directoryPromise = directoryPromise;
      void directoryPromise.catch(() => {
        if (this.directoryPromise === directoryPromise)
          this.directoryPromise = void 0;
      });
    }
    return await this.directoryPromise;
  }
};

// packages/acp-bridge/src/bridgeClient.ts
init_esbuild_shims();
import { randomUUID as randomUUID2 } from "node:crypto";
import { promises as fs2 } from "node:fs";
import * as path2 from "node:path";

// packages/acp-bridge/src/daemonEventTypes.ts
init_esbuild_shims();
var MID_TURN_MESSAGE_INJECTED_EVENT = "mid_turn_message_injected";

// packages/acp-bridge/src/bridgeClient.ts
var MAX_SCHEDULED_TASK_CRON_CHARS = 200;
var MAX_SCHEDULED_TASK_PROMPT_CHARS = 1e5;
function parseActiveWorkSnapshot(params) {
  const seq = params["seq"];
  const sessions = params["sessions"];
  if (params["v"] !== ACTIVE_WORK_HEARTBEAT_VERSION || typeof seq !== "number" || !Number.isSafeInteger(seq) || seq <= 0 || !Array.isArray(sessions) || sessions.length > ACTIVE_WORK_MAX_SNAPSHOT_SESSIONS) {
    return void 0;
  }
  const parsed = [];
  for (const raw of sessions) {
    if (typeof raw !== "object" || raw === null) return void 0;
    const entry = raw;
    const sessionId = entry["sessionId"];
    const holds = entry["holds"];
    if (typeof sessionId !== "string" || !Array.isArray(holds) || holds.length > ACTIVE_WORK_MAX_SESSION_HOLDS) {
      return void 0;
    }
    const parsedHolds = [];
    for (const rawHold of holds) {
      if (typeof rawHold !== "object" || rawHold === null) return void 0;
      const hold = rawHold;
      const category = hold["category"];
      const id = hold["id"];
      if (typeof id !== "string" || typeof category !== "string" || !ACTIVE_WORK_HOLD_CATEGORIES.includes(
        category
      )) {
        return void 0;
      }
      parsedHolds.push({
        category,
        id
      });
    }
    parsed.push({ sessionId, holds: parsedHolds });
  }
  return { v: ACTIVE_WORK_HEARTBEAT_VERSION, seq, sessions: parsed };
}
__name(parseActiveWorkSnapshot, "parseActiveWorkSnapshot");
var PUBLISH_ARTIFACT_TOOL_NAME = "artifact";
var MAX_CHANNEL_DELIVERY_TEXT_CHARS = 1e5;
var MAX_CHANNEL_DELIVERY_FIELD_CHARS = 2048;
var MAX_CHANNEL_DELIVERY_ERROR_CHARS = 500;
function isFsErrorShape(err) {
  return err instanceof Error && err.name === "FsError" && typeof err.kind === "string";
}
__name(isFsErrorShape, "isFsErrorShape");
function isExistingSessionScheduledTaskCreateErrorShape(err) {
  if (!(err instanceof Error)) return false;
  const status = err.status;
  const code = err.code;
  return err.name === "ExistingSessionScheduledTaskCreateError" && typeof status === "number" && Number.isFinite(status) && typeof code === "string" && code.length > 0;
}
__name(isExistingSessionScheduledTaskCreateErrorShape, "isExistingSessionScheduledTaskCreateErrorShape");
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
__name(isRecord, "isRecord");
function normalizeExternalToolGuardResult(value) {
  if (!isRecord(value)) {
    throw new Error("External tool guard handler returned an invalid result.");
  }
  const keys = Object.keys(value);
  if (value["allowed"] === true && keys.length === 1 && keys[0] === "allowed") {
    return { allowed: true };
  }
  if (value["allowed"] !== false || keys.some((key) => key !== "allowed" && key !== "reason")) {
    throw new Error("External tool guard handler returned an invalid result.");
  }
  if (!Object.hasOwn(value, "reason")) return { allowed: false };
  const reason = value["reason"];
  if (!isValidExternalToolGuardDenialReason(reason)) {
    throw new Error("External tool guard handler returned an invalid result.");
  }
  return { allowed: false, reason };
}
__name(normalizeExternalToolGuardResult, "normalizeExternalToolGuardResult");
function isBoundedChannelDeliveryString(value) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= MAX_CHANNEL_DELIVERY_FIELD_CHARS;
}
__name(isBoundedChannelDeliveryString, "isBoundedChannelDeliveryString");
function isChannelDeliveryTarget(value) {
  if (!isRecord(value)) return false;
  return isBoundedChannelDeliveryString(value["channelName"]) && (value["type"] === "user" || value["type"] === "chat") && isBoundedChannelDeliveryString(value["id"]) && Object.keys(value).every(
    (key) => key === "channelName" || key === "type" || key === "id"
  );
}
__name(isChannelDeliveryTarget, "isChannelDeliveryTarget");
function normalizeChannelDeliveryHostResult(value) {
  if (value.status === "delivered") return { status: "delivered" };
  if (value.status === "skipped") return { status: "skipped" };
  const code = CHANNEL_DELIVERY_ERROR_CODES.has(value.code) ? value.code : "channel_delivery_failed";
  const error = typeof value.error === "string" && value.error.length > 0 ? value.error.slice(0, MAX_CHANNEL_DELIVERY_ERROR_CHARS) : "Channel delivery failed.";
  return { status: "failed", code, error };
}
__name(normalizeChannelDeliveryHostResult, "normalizeChannelDeliveryHostResult");
function pendingInteractionOptions(options) {
  return options.map((option) => ({
    optionId: String(option.optionId ?? ""),
    ...typeof option.name === "string" ? { label: option.name } : {},
    ...typeof option.kind === "string" ? { kind: option.kind } : {}
  }));
}
__name(pendingInteractionOptions, "pendingInteractionOptions");
function pendingInteractionFromRequest(requestId, params) {
  const toolCall = params.toolCall;
  const meta = isRecord(toolCall["_meta"]) ? toolCall["_meta"] : void 0;
  const rawInput = toolCall["rawInput"];
  const options = pendingInteractionOptions(
    Array.isArray(params.options) ? params.options : []
  );
  const isUserQuestion = meta?.["qwenInteractionKind"] === "user_question";
  if (isUserQuestion) {
    const rawQuestions = Array.isArray(meta?.["qwenQuestions"]) ? meta["qwenQuestions"] : isRecord(rawInput) && Array.isArray(rawInput["questions"]) ? rawInput["questions"] : [];
    return {
      requestId,
      kind: "user_question",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      ...typeof toolCall["title"] === "string" ? { title: toolCall["title"] } : {},
      questions: rawQuestions.flatMap(
        (question, index) => isRecord(question) ? [{ ...question, answerKey: String(index) }] : []
      ),
      options
    };
  }
  return {
    requestId,
    kind: "permission",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    action: {
      ...typeof toolCall["kind"] === "string" ? { type: toolCall["kind"] } : {},
      ...typeof toolCall["title"] === "string" ? { title: toolCall["title"] } : {},
      ...toolCall["content"] !== void 0 ? { content: toolCall["content"] } : {},
      ...toolCall["locations"] !== void 0 ? { locations: toolCall["locations"] } : {},
      ...rawInput !== void 0 ? { input: rawInput } : {}
    },
    options
  };
}
__name(pendingInteractionFromRequest, "pendingInteractionFromRequest");
function fallbackPendingPermissionInteraction(requestId, options) {
  return {
    requestId,
    kind: "permission",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    action: {},
    options: pendingInteractionOptions(options)
  };
}
__name(fallbackPendingPermissionInteraction, "fallbackPendingPermissionInteraction");
function artifactPayloadFields(artifact) {
  return {
    title: artifact["title"],
    kind: artifact["kind"],
    storage: artifact["storage"],
    description: artifact["description"],
    workspacePath: artifact["workspacePath"],
    managedId: artifact["managedId"],
    url: artifact["url"],
    mimeType: artifact["mimeType"],
    sizeBytes: artifact["sizeBytes"],
    metadata: artifact["metadata"],
    retention: artifact["retention"]
  };
}
__name(artifactPayloadFields, "artifactPayloadFields");
function extractCappedArtifactInputs(rawArtifacts, limit, sessionId, source, toInput) {
  const artifacts = [];
  for (let index = 0; index < rawArtifacts.length; index++) {
    const artifact = rawArtifacts[index];
    if (!isRecord(artifact)) {
      writeStderrLine(
        `[artifacts] session=${sessionId} action=dropped reason=malformed source=${source} index=${index}`
      );
      continue;
    }
    if (artifacts.length >= limit) {
      writeStderrLine(
        `[artifacts] session=${sessionId} action=dropped reason="artifact batch limit exceeded" source=${source} dropped=${rawArtifacts.length - index}`
      );
      break;
    }
    artifacts.push(toInput(artifact));
  }
  return artifacts;
}
__name(extractCappedArtifactInputs, "extractCappedArtifactInputs");
function artifactIngestionErrorReason(error) {
  if (!(error instanceof Error)) {
    return String(error);
  }
  return {
    name: error.name,
    message: error.message,
    stack: error.stack?.split("\n").slice(0, 4).join("\n")
  };
}
__name(artifactIngestionErrorReason, "artifactIngestionErrorReason");
function extractSessionUpdateArtifacts(params, updateMeta, limit, sessionId) {
  const rawArtifacts = updateMeta?.["artifacts"];
  if (!Array.isArray(rawArtifacts)) {
    return [];
  }
  const update = params.update;
  if (update.sessionUpdate !== "tool_call_update" || update.status !== "completed" && update.status !== "failed" && update.status !== "cancelled") {
    return [];
  }
  const toolCallId = typeof update.toolCallId === "string" ? update.toolCallId : void 0;
  const toolName = typeof updateMeta?.["toolName"] === "string" ? updateMeta["toolName"] : void 0;
  return extractCappedArtifactInputs(
    rawArtifacts,
    limit,
    sessionId,
    "tool",
    (artifact) => ({
      ...artifactPayloadFields(artifact),
      source: "tool",
      toolCallId,
      toolName
    })
  );
}
__name(extractSessionUpdateArtifacts, "extractSessionUpdateArtifacts");
function sanitizeSessionUpdateArtifacts(params, updateMeta) {
  if (!Array.isArray(updateMeta?.["artifacts"])) {
    return params;
  }
  const sanitizedMeta = { ...updateMeta };
  delete sanitizedMeta["artifacts"];
  const update = {
    ...params.update,
    _meta: sanitizedMeta
  };
  return {
    ...params,
    update
  };
}
__name(sanitizeSessionUpdateArtifacts, "sanitizeSessionUpdateArtifacts");
function isTrustedArtifactToolUpdate(params, updateMeta) {
  const update = params.update;
  return update.sessionUpdate === "tool_call_update" && update.status === "completed" && updateMeta?.["toolName"] === PUBLISH_ARTIFACT_TOOL_NAME;
}
__name(isTrustedArtifactToolUpdate, "isTrustedArtifactToolUpdate");
function preserveFsErrorOverAcp(err) {
  if (isFsErrorShape(err)) {
    const code = err.kind === "parse_error" ? -32602 : -32603;
    throw new RequestError(code, err.message, {
      errorKind: err.kind,
      ...err.hint !== void 0 ? { hint: err.hint } : {},
      ...err.status !== void 0 ? { status: err.status } : {}
    });
  }
  throw err;
}
__name(preserveFsErrorOverAcp, "preserveFsErrorOverAcp");
function preserveScheduledTaskCreateErrorOverAcp(err) {
  if (isExistingSessionScheduledTaskCreateErrorShape(err)) {
    throw new RequestError(err.status >= 500 ? -32603 : -32602, err.message, {
      errorKind: err.code,
      status: err.status,
      hint: err.message
    });
  }
  throw err;
}
__name(preserveScheduledTaskCreateErrorOverAcp, "preserveScheduledTaskCreateErrorOverAcp");
function resolutionToAcpResponse(resolution) {
  if (resolution.kind === "option") {
    return {
      outcome: { outcome: "selected", optionId: resolution.optionId },
      ...resolution.metadata ?? {}
    };
  }
  return {
    outcome: { outcome: "cancelled" },
    _meta: {
      [DAEMON_PERMISSION_CANCEL_REASON_META_KEY]: resolution.reason
    }
  };
}
__name(resolutionToAcpResponse, "resolutionToAcpResponse");
var MAX_EARLY_EVENT_SESSIONS = 64;
var MAX_EARLY_EVENTS_PER_SESSION = 32;
var MAX_SUGGESTION_LENGTH = 500;
var EARLY_EVENT_TTL_MS = 6e4;
var KNOWN_APPROVAL_MODES = new Set(
  APPROVAL_MODES
);
function describeStatKind(stats) {
  if (stats.isDirectory()) return "directory";
  if (stats.isSymbolicLink()) return "symlink";
  if (stats.isCharacterDevice()) return "character device";
  if (stats.isBlockDevice()) return "block device";
  if (stats.isFIFO()) return "named pipe (FIFO)";
  if (stats.isSocket()) return "socket";
  return "non-regular file";
}
__name(describeStatKind, "describeStatKind");
function sliceLineRange(content, startLine, endLine) {
  let offset = 0;
  for (let i = 0; i < startLine; i++) {
    const nl = content.indexOf("\n", offset);
    if (nl === -1) return "";
    offset = nl + 1;
  }
  if (endLine === void 0) return content.slice(offset);
  let end = offset;
  const want = endLine - startLine;
  for (let i = 0; i < want; i++) {
    const nl = content.indexOf("\n", end);
    if (nl === -1) return content.slice(offset);
    end = nl + 1;
  }
  return content.slice(offset, end > offset ? end - 1 : end);
}
__name(sliceLineRange, "sliceLineRange");
var BridgeClient = class {
  constructor(resolveEntry, resolvePendingRestoreEvents, mediator, permissionTimeoutMs, maxPendingPerSession, fileSystem, onModelPromoted, onModePromoted, clientMcpSender, ownsSession = () => true, onTokenUsage, onCreateSubSession, onGenerationEvent, onWorkspaceGenerationEvent, onChannelDelivery, hasSessionSpawnInFlight = () => false, getLiveScreenContextCaptureHandler = () => void 0, getLiveTaskToolRequestHandler = () => void 0, getLiveSpeakToUserHandler = () => void 0, externalToolGuard, onActiveWork, onSessionCatalogChanged, onGoalTurnEnded, onCreateCurrentSessionScheduledTask) {
    this.resolveEntry = resolveEntry;
    this.resolvePendingRestoreEvents = resolvePendingRestoreEvents;
    this.mediator = mediator;
    this.permissionTimeoutMs = permissionTimeoutMs;
    this.maxPendingPerSession = maxPendingPerSession;
    this.fileSystem = fileSystem;
    this.onModelPromoted = onModelPromoted;
    this.onModePromoted = onModePromoted;
    this.clientMcpSender = clientMcpSender;
    this.ownsSession = ownsSession;
    this.onTokenUsage = onTokenUsage;
    this.onCreateSubSession = onCreateSubSession;
    this.onGenerationEvent = onGenerationEvent;
    this.onWorkspaceGenerationEvent = onWorkspaceGenerationEvent;
    this.onChannelDelivery = onChannelDelivery;
    this.hasSessionSpawnInFlight = hasSessionSpawnInFlight;
    this.getLiveScreenContextCaptureHandler = getLiveScreenContextCaptureHandler;
    this.getLiveTaskToolRequestHandler = getLiveTaskToolRequestHandler;
    this.getLiveSpeakToUserHandler = getLiveSpeakToUserHandler;
    this.externalToolGuard = externalToolGuard;
    this.onActiveWork = onActiveWork;
    this.onSessionCatalogChanged = onSessionCatalogChanged;
    this.onGoalTurnEnded = onGoalTurnEnded;
    this.onCreateCurrentSessionScheduledTask = onCreateCurrentSessionScheduledTask;
  }
  static {
    __name(this, "BridgeClient");
  }
  async requestPermission(params) {
    const entry = this.resolveEntry(params.sessionId);
    if (!entry) return { outcome: { outcome: "cancelled" } };
    if (entry.pendingPermissionIds.size >= this.maxPendingPerSession) {
      writeStderrLine(
        `qwen serve: session ${entry.sessionId} exceeded maxPendingPermissionsPerSession (${this.maxPendingPerSession}) \u2014 resolving new permission as cancelled.`
      );
      return { outcome: { outcome: "cancelled" } };
    }
    const options = Array.isArray(params.options) ? params.options : [];
    const allowedOptionIds = new Set(
      options.map((o) => String(o.optionId ?? ""))
    );
    allowedOptionIds.delete("");
    const requestId = randomUUID2();
    if (allowedOptionIds.has(CANCEL_VOTE_SENTINEL)) {
      throw new CancelSentinelCollisionError(requestId, CANCEL_VOTE_SENTINEL);
    }
    const published = entry.events.publish({
      type: "permission_request",
      ...entry.activePromptId ? { promptId: entry.activePromptId } : {},
      data: {
        requestId,
        sessionId: entry.sessionId,
        toolCall: params.toolCall,
        options
      },
      ...entry.activePromptOriginatorClientId ? { originatorClientId: entry.activePromptOriginatorClientId } : {}
    });
    if (!published) return { outcome: { outcome: "cancelled" } };
    let interaction;
    try {
      interaction = pendingInteractionFromRequest(requestId, {
        ...params,
        options
      });
    } catch (error) {
      writeStderrLine(
        `qwen serve: failed to snapshot pending interaction ${requestId}: ${error instanceof Error ? error.message : String(error)}`
      );
      interaction = fallbackPendingPermissionInteraction(requestId, options);
    }
    entry.pendingPermissionIds.add(requestId);
    if (interaction) entry.pendingInteractions.set(requestId, interaction);
    try {
      const record = {
        requestId,
        sessionId: entry.sessionId,
        promptId: entry.activePromptId,
        originatorClientId: entry.activePromptOriginatorClientId,
        allowedOptionIds,
        issuedAtMs: Date.now()
      };
      const resolution = await this.mediator.request(
        record,
        this.permissionTimeoutMs
      );
      return resolutionToAcpResponse(resolution);
    } finally {
      entry.pendingPermissionIds.delete(requestId);
      entry.pendingInteractions.delete(requestId);
    }
  }
  async sessionUpdate(params) {
    if (this.abandonedRestoreIds.has(params.sessionId)) {
      return;
    }
    if (!this.ownsSession(params.sessionId) && !this.inFlightRestoreIds.has(params.sessionId)) {
      writeStderrLine(
        `[demux] session=${params.sessionId} type=session_update action=dropped reason=session_not_owned`
      );
      return;
    }
    const entry = this.resolveEntry(params.sessionId);
    const events = entry?.events ?? this.resolvePendingRestoreEvents(params.sessionId);
    if (!events) return;
    const prepared = this.prepareSessionUpdateFrames(params, entry);
    for (const frame of prepared.frames) {
      events.publish(frame);
    }
    try {
      this.recordLiveTokenUsage(params, entry);
    } catch {
    }
    if (entry && prepared.artifacts.length > 0) {
      await this.upsertAndPublishArtifacts(
        entry,
        prepared.artifacts,
        {
          trustedPublisher: prepared.trustedPublisher
        },
        prepared.turn
      );
    }
  }
  prepareSessionUpdateFrames(params, entry) {
    const turn = {
      ...entry?.activePromptId ? { promptId: entry.activePromptId } : {},
      ...entry?.activePromptOriginatorClientId ? { originatorClientId: entry.activePromptOriginatorClientId } : {}
    };
    const frames = [];
    const a2ui = extractA2uiToolUpdate(params);
    if (a2ui) {
      for (const surface of a2ui.surfaces) {
        frames.push({
          type: "session_update",
          data: {
            sessionId: params.sessionId,
            update: {
              sessionUpdate: "a2ui",
              a2ui: {
                surfaceId: surface.surfaceId,
                callId: a2ui.callId,
                commands: surface.commands
              },
              _meta: { serverTimestamp: Date.now(), source: "a2ui-bridge" }
            }
          },
          ...turn
        });
      }
      params = a2ui.sanitizedParams;
    }
    const updateMeta = params.update._meta;
    const originalTs = updateMeta?.["serverTimestamp"] ?? updateMeta?.["timestamp"];
    const serverTimestamp = typeof originalTs === "number" && Number.isFinite(originalTs) ? originalTs : void 0;
    const artifacts = entry?.artifacts ? extractSessionUpdateArtifacts(
      params,
      updateMeta,
      entry.artifacts.inputBatchLimit(),
      entry.sessionId
    ) : [];
    const publishParams = sanitizeSessionUpdateArtifacts(params, updateMeta);
    frames.push({
      type: "session_update",
      data: publishParams,
      ...turn,
      ...serverTimestamp !== void 0 ? { _meta: { serverTimestamp } } : {}
    });
    return {
      frames,
      artifacts,
      trustedPublisher: isTrustedArtifactToolUpdate(params, updateMeta),
      turn
    };
  }
  async seedSessionUpdates(entry, updates, options = {}) {
    const frames = [];
    const artifactBatches = [];
    for (const update of updates) {
      const prepared = this.prepareSessionUpdateFrames(
        { sessionId: entry.sessionId, update },
        entry
      );
      frames.push(...prepared.frames);
      if (options.ingestArtifacts !== false && prepared.artifacts.length > 0) {
        artifactBatches.push({
          artifacts: prepared.artifacts,
          trustedPublisher: prepared.trustedPublisher,
          turn: prepared.turn
        });
      }
    }
    entry.events.seedReplayEvents(frames);
    for (const batch of artifactBatches) {
      await this.upsertAndPublishArtifacts(
        entry,
        batch.artifacts,
        {
          trustedPublisher: batch.trustedPublisher
        },
        batch.turn
      );
    }
  }
  async ingestSessionUpdateArtifactsReady(entry, updates) {
    for (const update of updates) {
      const prepared = this.prepareSessionUpdateFrames(
        { sessionId: entry.sessionId, update },
        entry
      );
      if (prepared.artifacts.length === 0) continue;
      const ingested = await this.upsertAndPublishArtifactsReady(
        entry,
        prepared.artifacts,
        { trustedPublisher: prepared.trustedPublisher },
        prepared.turn
      );
      if (!ingested) throw new Error("Artifact ingestion failed.");
    }
  }
  async drainDeferredSessionArtifacts(entry) {
    while (entry.deferredArtifactBatches.length > 0) {
      const batch = entry.deferredArtifactBatches[0];
      const ingested = await this.upsertAndPublishArtifactsReady(
        entry,
        batch.artifacts,
        batch.options,
        batch.turn
      );
      if (!ingested) throw new Error("Deferred artifact ingestion failed.");
      entry.deferredArtifactBatches.shift();
      entry.deferredArtifactInputCount -= batch.artifacts.length;
    }
  }
  /**
   * Daemon token-burn accounting for LIVE model turns. Called only from
   * `sessionUpdate` (the live session/update fan-in), never from
   * `seedSessionUpdates` — so batch load-replay never lands historical usage in
   * the current metrics window. Additionally guarded on a live `entry`: a stray
   * pending-restore frame (entry not yet registered) is skipped too, so replayed
   * history can't post a phantom burn spike with no model call.
   *
   * Usage rides an otherwise-empty `agent_message_chunk` as `update._meta.usage`
   * with per-round camelCase increments; subagent frames carry their own usage
   * (tagged `parentToolCallId`) and are independent turns, so counting each
   * frame once is the correct total. `_meta`/`usage` are optional and untyped.
   */
  recordLiveTokenUsage(params, entry) {
    if (!this.onTokenUsage || !entry) return;
    const updateMeta = params.update._meta;
    const usage = updateMeta?.["usage"];
    if (usage === null || typeof usage !== "object") return;
    const inputTokens = usage.inputTokens;
    const outputTokens = usage.outputTokens;
    if (typeof inputTokens !== "number" && typeof outputTokens !== "number") {
      return;
    }
    const durationMs = updateMeta?.["durationMs"];
    const apiErrors = updateMeta?.["apiErrors"];
    const apiRetries = updateMeta?.["apiRetries"];
    this.onTokenUsage(
      typeof inputTokens === "number" ? inputTokens : 0,
      typeof outputTokens === "number" ? outputTokens : 0,
      typeof durationMs === "number" ? durationMs : void 0,
      typeof apiErrors === "number" ? apiErrors : 0,
      typeof apiRetries === "number" ? apiRetries : 0
    );
  }
  /**
   * Bounded early-event buffer. The map is scoped to this BridgeClient and
   * therefore to one channel; a stale channel cannot seed a fresh channel's
   * future session. Frames are keyed by sessionId; each entry tracks its
   * `expiresAt` for lazy TTL-based eviction in `bufferEarlyEvent`. Drained by
   * `drainEarlyEvents` whenever the bridge registers a session with a matching
   * id. See MAX_EARLY_EVENT_* constants for capacity bounds.
   */
  earlyEvents = /* @__PURE__ */ new Map();
  /**
   * Tombstone for closed/killed session ids. Prevents late
   * `extNotification` from a dying child from leaking into the
   * early-event buffer and being replayed onto a future session
   * that reuses the same id via `session/load` or `session/resume`.
   *
   * Tombstone semantics:
   * - Marked when the bridge removes a sessionId from `byId` (kill
   *   path, channel.exited handler, closeSession).
   * - Concurrently purges any in-flight `earlyEvents[id]`.
   * - `bufferEarlyEvent` rejects tombstoned ids.
   * - `drainEarlyEvents` clears the tombstone — a fresh
   *   `createSessionEntry` for the same id is a legitimate
   *   "load/resume of a persisted session id" case.
   * - TTL = `EARLY_EVENT_TTL_MS` (60s) — same as the early-event
   *   buffer, so by the time a tombstone expires there can be no
   *   stale frame for that id anywhere in the system.
   */
  tombstonedSessionIds = /* @__PURE__ */ new Map();
  /** Restore ownership for `sessionUpdate` and artifact demultiplexing. */
  inFlightRestoreIds = /* @__PURE__ */ new Set();
  /**
   * Registrations allowed to buffer early extended notifications through an
   * ordinary close tombstone. This includes restores and caller-supplied-id
   * spawns, and lasts only until their ACP registration attempt settles.
   */
  inFlightSessionRegistrationIds = /* @__PURE__ */ new Set();
  /**
   * Restore ids whose caller timed out while the non-cancellable ACP request
   * continues.
   */
  abandonedRestoreIds = /* @__PURE__ */ new Set();
  /**
   * Handle child->bridge ACP `extMethod` requests (calls that expect a
   * response, unlike `extNotification`). Served methods:
   * `qwen/control/client_mcp/message` (reverse tool channel),
   * `qwen/control/create-sub-session` (the `create_sub_session` tool → daemon
   * spawns a sub-session and, for `'first-turn'`, returns its first-turn
   * result), and `craft/drainMidTurnQueue`: the ACP child calls the last one
   * between tool batches to pull any messages the browser queued mid-turn. We splice the per-session
   * queue, return them to the child as the response, and — when non-empty —
   * publish a `mid_turn_message_injected` SSE frame so the browser can move
   * those messages out of its pending queue and render the immediate echo.
   * Unknown methods reject with ACP `methodNotFound` (-32601), matching
   * the SDK's
   * default for an unimplemented client surface; the child's drain caller
   * treats that as "drain unsupported" and stops asking.
   */
  async extMethod(method, params) {
    if (method === SERVE_CONTROL_EXT_METHODS.clientMcpMessage) {
      return this.handleClientMcpMessage(params);
    }
    if (method === SERVE_CONTROL_EXT_METHODS.createSubSession) {
      return this.handleCreateSubSession(params);
    }
    if (method === SERVE_CONTROL_EXT_METHODS.createCurrentSessionScheduledTask) {
      return this.handleCreateCurrentSessionScheduledTask(params);
    }
    if (method === SERVE_CONTROL_EXT_METHODS.liveCaptureScreenContext) {
      return this.handleLiveScreenContextCapture(params);
    }
    if (method === SERVE_CONTROL_EXT_METHODS.liveTaskTool) {
      return this.handleLiveTaskTool(params);
    }
    if (method === SERVE_CONTROL_EXT_METHODS.liveSpeakToUser) {
      return this.handleLiveSpeakToUser(params);
    }
    if (method === SERVE_CONTROL_EXT_METHODS.channelDelivery) {
      return this.handleChannelDelivery(params);
    }
    if (method === SERVE_CONTROL_EXT_METHODS.externalToolGuardPrepare) {
      return this.handleExternalToolGuardPrepare(params);
    }
    if (method === TODO_STOP_GUARD_CONTINUATION_CLAIM_METHOD) {
      return this.handleTodoStopGuardContinuationClaim(params);
    }
    if (method !== MID_TURN_QUEUE_DRAIN_METHOD) {
      throw RequestError.methodNotFound(method);
    }
    const sessionId = typeof params["sessionId"] === "string" ? params["sessionId"] : void 0;
    if (!sessionId) return { messages: [], items: [], hasQueuedPrompt: false };
    if (!this.ownsSession(sessionId)) {
      return { messages: [], items: [], hasQueuedPrompt: false };
    }
    const entry = this.resolveEntry(sessionId);
    if (!entry) return { messages: [], items: [], hasQueuedPrompt: false };
    const drained = entry.midTurnMessageQueue.splice(0);
    if (drained.length > 0) {
      for (const item of drained) {
        entry.settledMidTurnMessageIds.push(item.messageId);
      }
      if (entry.settledMidTurnMessageIds.length > MID_TURN_RECONCILIATION_RING_SIZE) {
        entry.settledMidTurnMessageIds.splice(
          0,
          entry.settledMidTurnMessageIds.length - MID_TURN_RECONCILIATION_RING_SIZE
        );
      }
    }
    const attachmentMemo = /* @__PURE__ */ new Map();
    const serializedAttachmentIds = /* @__PURE__ */ new Set();
    const items = [];
    try {
      for (const item of drained) {
        let degraded = 0;
        const planned = (item.content ?? []).filter((block) => {
          if (!isSessionAttachmentReference(block)) return true;
          if (serializedAttachmentIds.has(block.attachmentId)) {
            degraded += 1;
            return false;
          }
          serializedAttachmentIds.add(block.attachmentId);
          return true;
        });
        let resolvedBlocks;
        let attachmentReferences;
        try {
          resolvedBlocks = await entry.attachments.resolveContent(
            planned,
            attachmentMemo
          );
          attachmentReferences = planned.filter(isSessionAttachmentReference);
        } catch (error) {
          if (!(error instanceof SessionAttachmentReferenceError)) throw error;
          writeStderrLine(
            `[mid-turn] session=${JSON.stringify(entry.sessionId)} degraded attachment for message ${JSON.stringify(item.messageId)}: ${JSON.stringify(error instanceof Error ? error.message : String(error))}`
          );
          const perBlock = await entry.attachments.resolveContentDegrading(
            planned,
            attachmentMemo
          );
          resolvedBlocks = perBlock.resolvedBlocks;
          attachmentReferences = perBlock.retainedBlocks.filter(
            isSessionAttachmentReference
          );
          degraded += perBlock.degraded;
        }
        let content = [
          ...item.text ? [{ type: "text", text: item.text }] : [],
          ...resolvedBlocks
        ];
        if (degraded > 0) content = withAttachmentDegradationMarker(content);
        items.push({
          messageId: item.messageId,
          displayText: item.text,
          content,
          ...attachmentReferences.length > 0 ? { attachmentReferences } : {}
        });
      }
    } catch (error) {
      const requeued = new Set(drained.map((queued) => queued.messageId));
      const ring = entry.settledMidTurnMessageIds;
      const kept = ring.filter((id) => !requeued.has(id));
      ring.splice(0, ring.length, ...kept);
      entry.midTurnMessageQueue.unshift(...drained);
      writeStderrLine(
        `[mid-turn] session=${JSON.stringify(entry.sessionId)} drain failed, requeued ${drained.length} message(s): ${JSON.stringify(error instanceof Error ? error.message : String(error))}`
      );
      throw error;
    }
    const echoed = drained.filter((item) => !item.queueOnly);
    const messages = drained.map((item) => item.text);
    const hasQueuedPrompt = entry.pendingPromptList.some(
      (prompt) => prompt.state === "queued" && !prompt.abortController.signal.aborted
    );
    if (echoed.length > 0) {
      const published = entry.events.publish({
        type: MID_TURN_MESSAGE_INJECTED_EVENT,
        ...entry.activePromptId ? { promptId: entry.activePromptId } : {},
        data: {
          sessionId: entry.sessionId,
          messages: echoed.map((item) => item.text),
          messageIds: echoed.map((item) => item.messageId),
          // Carry the structured `items` twin (content blocks per message) so
          // the browser-side echo renderer can show attached images alongside
          // the message text. Older consumers that don't read this field keep
          // working unchanged.
          items: echoed.map((item) => ({
            ...item.content && item.content.length > 0 ? { content: item.content } : {}
          }))
        }
      });
      writeStderrLine(
        published ? `[mid-turn] session=${entry.sessionId} drained=${messages.length} echoed=${echoed.length} injected into running turn` : `[mid-turn] session=${entry.sessionId} drained=${messages.length} echoed=${echoed.length} echo frame dropped (bus closed); reconciliation required`
      );
    }
    return { messages, items, hasQueuedPrompt };
  }
  async handleExternalToolGuardPrepare(params) {
    if (!this.externalToolGuard) {
      throw RequestError.methodNotFound(
        SERVE_CONTROL_EXT_METHODS.externalToolGuardPrepare
      );
    }
    const sessionId = params["sessionId"];
    const promptId = params["promptId"];
    const toolCallId = params["toolCallId"];
    const toolName = params["toolName"];
    const args = params["arguments"];
    if (typeof sessionId !== "string" || sessionId.length === 0 || promptId !== void 0 && (typeof promptId !== "string" || promptId.length === 0) || typeof toolCallId !== "string" || toolCallId.length === 0 || typeof toolName !== "string" || toolName.length === 0 || !isRecord(args)) {
      throw RequestError.invalidParams(
        void 0,
        "Invalid external tool guard request"
      );
    }
    const promptScoped = promptId !== void 0;
    if (!this.ownsSession(sessionId)) {
      throw RequestError.invalidParams(
        void 0,
        "External tool guard session is not owned by this connection"
      );
    }
    const entry = this.resolveEntry(sessionId);
    if (!entry || promptScoped && (!entry.promptActive || entry.activePromptId !== promptId)) {
      throw RequestError.invalidParams(
        void 0,
        "External tool guard prompt is not the active prompt"
      );
    }
    const invocationCwd = params["invocationCwd"];
    const decision = await this.externalToolGuard({
      sessionId: entry.sessionId,
      ...promptScoped ? { promptId } : {},
      toolCallId,
      toolName,
      arguments: args,
      effectiveCwd: entry.effectiveCwd,
      // Forwarded verbatim and explicitly untrusted: the host policy decides
      // whether it can establish this scope from state it owns.
      ...typeof invocationCwd === "string" && invocationCwd.length > 0 ? { invocationCwd } : {}
    });
    const currentEntry = this.resolveEntry(sessionId);
    if (!this.ownsSession(sessionId) || currentEntry !== entry || promptScoped && (!currentEntry.promptActive || currentEntry.activePromptId !== promptId)) {
      throw RequestError.invalidParams(
        void 0,
        "External tool guard prompt is no longer active"
      );
    }
    return normalizeExternalToolGuardResult(decision);
  }
  handleTodoStopGuardContinuationClaim(params) {
    const sessionId = typeof params["sessionId"] === "string" && params["sessionId"].length > 0 ? params["sessionId"] : void 0;
    if (!sessionId) return { claimed: false, hasQueuedPrompt: false };
    if (!this.ownsSession(sessionId)) {
      return { claimed: false, hasQueuedPrompt: false };
    }
    const entry = this.resolveEntry(sessionId);
    if (!entry) return { claimed: false, hasQueuedPrompt: false };
    const livePrompts = entry.pendingPromptList.filter(
      (prompt) => !prompt.abortController.signal.aborted
    );
    const promptId = typeof params["promptId"] === "string" && params["promptId"].length > 0 ? params["promptId"] : void 0;
    if (promptId) {
      const ownsRunningPrompt = entry.activePromptId === promptId && livePrompts.some(
        (prompt) => prompt.promptId === promptId && prompt.state === "running"
      );
      const hasCompetingRunningPrompt = livePrompts.some(
        (prompt) => prompt.promptId !== promptId && prompt.state === "running"
      );
      if (!ownsRunningPrompt || hasCompetingRunningPrompt) {
        return { claimed: false, hasQueuedPrompt: false };
      }
      const hasQueuedPrompt = livePrompts.some(
        (prompt) => prompt.state === "queued"
      );
      if (hasQueuedPrompt) {
        entry.todoStopGuardAwaitingQueuedPromptOwnerPromptId = promptId;
        return { claimed: false, hasQueuedPrompt: true };
      }
      if (entry.todoStopGuardAwaitingQueuedPromptOwnerPromptId === promptId) {
        delete entry.todoStopGuardAwaitingQueuedPromptOwnerPromptId;
      }
      return { claimed: true, hasQueuedPrompt: false };
    }
    if (entry.promptActive || livePrompts.length > 0) {
      return { claimed: false, hasQueuedPrompt: false };
    }
    return { claimed: true, hasQueuedPrompt: false };
  }
  async handleChannelDelivery(params) {
    if (!this.onChannelDelivery) {
      throw RequestError.methodNotFound(
        SERVE_CONTROL_EXT_METHODS.channelDelivery
      );
    }
    const sessionId = params["sessionId"];
    if (typeof sessionId !== "string" || sessionId.length === 0 || !this.ownsSession(sessionId)) {
      throw RequestError.invalidParams(
        void 0,
        "`sessionId` must name a session owned by this connection"
      );
    }
    const entry = this.resolveEntry(sessionId);
    if (!entry) {
      throw RequestError.invalidParams(void 0, "Unknown `sessionId`");
    }
    const deliveryId = params["deliveryId"];
    const source = params["source"];
    const text = params["text"];
    const rawTarget = params["target"];
    if (!isBoundedChannelDeliveryString(deliveryId) || source !== "prompt" && source !== "scheduled" || typeof text !== "string" || text.length > MAX_CHANNEL_DELIVERY_TEXT_CHARS || !isChannelDeliveryTarget(rawTarget)) {
      throw RequestError.invalidParams(
        void 0,
        "Invalid channel delivery request"
      );
    }
    const promptId = params["promptId"];
    const taskId = params["taskId"];
    const firedAt = params["firedAt"];
    const allowedKeys = source === "prompt" ? /* @__PURE__ */ new Set([
      "sessionId",
      "deliveryId",
      "source",
      "target",
      "text",
      "promptId"
    ]) : /* @__PURE__ */ new Set([
      "sessionId",
      "deliveryId",
      "source",
      "target",
      "text",
      "taskId",
      "firedAt"
    ]);
    const correlationValid = source === "prompt" ? isBoundedChannelDeliveryString(promptId) && promptId === deliveryId : isBoundedChannelDeliveryString(taskId) && typeof firedAt === "number" && Number.isFinite(firedAt) && deliveryId === `${taskId}:${firedAt}`;
    if (!correlationValid || !Object.keys(params).every((key) => allowedKeys.has(key))) {
      throw RequestError.invalidParams(
        void 0,
        "Invalid channel delivery correlation"
      );
    }
    const info = {
      sessionId,
      deliveryId,
      source,
      target: rawTarget,
      text,
      ...source === "prompt" ? { promptId } : {},
      ...source === "scheduled" ? { taskId, firedAt } : {}
    };
    let result;
    try {
      result = normalizeChannelDeliveryHostResult(
        await this.onChannelDelivery(info)
      );
    } catch {
      result = {
        status: "failed",
        code: "channel_delivery_failed",
        error: "Channel delivery failed."
      };
    }
    try {
      entry.events.publish({
        type: "channel_delivery_result",
        ...source === "prompt" ? { promptId } : {},
        data: {
          sessionId,
          deliveryId,
          source,
          status: result.status,
          ...source === "prompt" ? { promptId } : {},
          ...source === "scheduled" ? { taskId, firedAt } : {},
          ...result.status === "failed" ? { code: result.code, error: result.error } : {}
        }
      });
    } catch {
    }
    return result;
  }
  /**
   * Reverse tool channel (issue #5626, Phase 2) — answer the child's
   * `qwen/control/client_mcp/message` ext-method. The child's session
   * `McpClientManager` calls this when its agent drives a client-hosted
   * (extension) MCP server: `params` carries the advertised `server` name and
   * the JSON-RPC `payload` (initialize / tools/list / tools/call / a
   * notification). We resolve the per-WS-connection sender via the injected
   * `clientMcpSender` lookup, deliver the payload over the daemon WS, and
   * return the correlated response as `{ payload }`.
   *
   * Rejects with ACP `methodNotFound` when no `clientMcpSender` is wired (Mode
   * A / tests can't host a client MCP server), and `invalidParams` when the
   * frame is malformed or the named server is no longer hosted (e.g. the
   * extension disconnected mid-turn) — the agent's `SdkControlClientTransport`
   * surfaces that as a transport error rather than hanging.
   */
  async handleClientMcpMessage(params) {
    if (!this.clientMcpSender) {
      throw RequestError.methodNotFound(
        SERVE_CONTROL_EXT_METHODS.clientMcpMessage
      );
    }
    const server = params["server"];
    if (typeof server !== "string" || server.length === 0) {
      throw RequestError.invalidParams(
        void 0,
        "`server` must be a non-empty string"
      );
    }
    const payload = params["payload"];
    if (payload === null || typeof payload !== "object") {
      throw RequestError.invalidParams(
        void 0,
        "`payload` must be a JSON-RPC message object"
      );
    }
    const send = this.clientMcpSender(server);
    if (!send) {
      throw RequestError.invalidParams(
        void 0,
        `client-hosted MCP server '${server}' is not currently connected`
      );
    }
    const sessionId = params["sessionId"];
    if (sessionId !== void 0 && (typeof sessionId !== "string" || sessionId.length === 0)) {
      throw RequestError.invalidParams(
        void 0,
        "`sessionId` must be a non-empty string when provided"
      );
    }
    const ownsSession = typeof sessionId === "string" && this.ownsSession(sessionId);
    if (typeof sessionId === "string" && !ownsSession && !this.hasSessionSpawnInFlight()) {
      throw RequestError.invalidParams(
        void 0,
        `Session not owned by this channel: ${sessionId}`
      );
    }
    if (typeof sessionId === "string" && !ownsSession) {
      writeStderrLine(
        `[demux] session=${sessionId} type=client_mcp_message action=forwarded_without_session reason=session_registration_pending`
      );
    }
    const response = await send(
      payload,
      typeof sessionId === "string" && ownsSession ? { sessionId } : void 0
    );
    return { payload: response };
  }
  /**
   * Handle the `create_sub_session` tool's request: validate, then forward to
   * the daemon-host `onCreateSubSession` callback (which spawns a fresh
   * top-level sub-session and, for `'first-turn'`, waits for its first turn and
   * returns the result). No host wired → `methodNotFound`, which the tool
   * surfaces as "daemon-only".
   */
  async handleCreateSubSession(params) {
    if (!this.onCreateSubSession) {
      throw RequestError.methodNotFound(
        SERVE_CONTROL_EXT_METHODS.createSubSession
      );
    }
    const prompt = params["prompt"];
    if (typeof prompt !== "string" || prompt.length === 0) {
      throw RequestError.invalidParams(
        void 0,
        "`prompt` must be a non-empty string"
      );
    }
    if (prompt.length > MAX_SUB_SESSION_PROMPT_CHARS) {
      throw RequestError.invalidParams(
        void 0,
        `\`prompt\` exceeds the ${MAX_SUB_SESSION_PROMPT_CHARS}-character limit`
      );
    }
    const completion = params["completion"];
    if (completion !== "sent" && completion !== "first-turn") {
      throw RequestError.invalidParams(
        void 0,
        "`completion` must be 'sent' or 'first-turn'"
      );
    }
    const name = params["name"];
    if (typeof name === "string" && name.length > MAX_SUB_SESSION_NAME_CHARS) {
      throw RequestError.invalidParams(
        void 0,
        `\`name\` exceeds the ${MAX_SUB_SESSION_NAME_CHARS}-character limit`
      );
    }
    const callerSessionId = params["callerSessionId"];
    if (typeof callerSessionId !== "string" || callerSessionId.length === 0 || !this.ownsSession(callerSessionId)) {
      throw RequestError.invalidParams(
        void 0,
        "`callerSessionId` is required and must name a session owned by this connection"
      );
    }
    const model = params["model"];
    const result = await this.onCreateSubSession({
      prompt,
      completion,
      ...typeof model === "string" && model.length > 0 && model.length <= 128 ? { model } : {},
      ...typeof name === "string" && name.length > 0 ? { name } : {},
      callerSessionId
    });
    return {
      sessionId: result.sessionId,
      ...result.result !== void 0 ? { result: result.result } : {},
      ...result.stopReason !== void 0 ? { stopReason: result.stopReason } : {},
      ...result.parentSessionPersisted !== void 0 ? { parentSessionPersisted: result.parentSessionPersisted } : {}
    };
  }
  async handleCreateCurrentSessionScheduledTask(params) {
    if (!this.onCreateCurrentSessionScheduledTask) {
      throw RequestError.methodNotFound(
        SERVE_CONTROL_EXT_METHODS.createCurrentSessionScheduledTask
      );
    }
    const callerSessionId = params["callerSessionId"];
    const promptId = params["promptId"];
    const cron = params["cron"];
    const prompt = params["prompt"];
    const recurring = params["recurring"];
    if (typeof callerSessionId !== "string" || callerSessionId.length === 0 || !this.ownsSession(callerSessionId)) {
      throw RequestError.invalidParams(
        void 0,
        "`callerSessionId` must name a session owned by this connection"
      );
    }
    if (typeof promptId !== "string" || promptId.length === 0) {
      throw RequestError.invalidParams(
        void 0,
        "`promptId` must be a non-empty string"
      );
    }
    if (typeof cron !== "string" || cron.length === 0 || cron.length > MAX_SCHEDULED_TASK_CRON_CHARS) {
      throw RequestError.invalidParams(
        void 0,
        `\`cron\` must be a non-empty string within the ${MAX_SCHEDULED_TASK_CRON_CHARS}-character limit`
      );
    }
    if (typeof prompt !== "string" || prompt.length === 0 || prompt.length > MAX_SCHEDULED_TASK_PROMPT_CHARS) {
      throw RequestError.invalidParams(
        void 0,
        `\`prompt\` must be non-empty and within the ${MAX_SCHEDULED_TASK_PROMPT_CHARS}-character limit`
      );
    }
    if (typeof recurring !== "boolean") {
      throw RequestError.invalidParams(
        void 0,
        "`recurring` must be a boolean"
      );
    }
    const entry = this.resolveEntry(callerSessionId);
    if (!entry || entry.sessionId !== callerSessionId || entry.promptActive !== true || entry.activePromptId !== promptId) {
      throw RequestError.invalidParams(
        void 0,
        "The caller session does not own the active prompt"
      );
    }
    if (entry.parentSessionId !== void 0 || entry.sourceId !== void 0 || entry.sourceType !== void 0 && entry.sourceType !== "default") {
      throw RequestError.invalidParams(
        void 0,
        "The caller session source cannot own a scheduled task"
      );
    }
    const result = await this.onCreateCurrentSessionScheduledTask({
      callerSessionId,
      promptId,
      cron,
      prompt,
      recurring,
      assertCallerPromptActive: /* @__PURE__ */ __name(() => {
        const currentEntry = this.resolveEntry(callerSessionId);
        if (currentEntry !== entry || currentEntry.promptActive !== true || currentEntry.activePromptId !== promptId) {
          throw RequestError.invalidParams(
            void 0,
            "The caller session no longer owns the active prompt"
          );
        }
      }, "assertCallerPromptActive")
    }).catch(
      (error) => preserveScheduledTaskCreateErrorOverAcp(error)
    );
    if (typeof result.id !== "string" || result.id.length === 0 || typeof result.cron !== "string" || result.cron.length === 0) {
      throw RequestError.internalError(
        void 0,
        "Scheduled-task host returned an invalid result"
      );
    }
    return { id: result.id, cron: result.cron };
  }
  async handleLiveScreenContextCapture(params) {
    const handler = this.getLiveScreenContextCaptureHandler();
    if (!handler) {
      throw RequestError.methodNotFound(
        SERVE_CONTROL_EXT_METHODS.liveCaptureScreenContext
      );
    }
    const callerSessionId = params["callerSessionId"];
    if (typeof callerSessionId !== "string" || callerSessionId.length === 0 || !this.ownsSession(callerSessionId)) {
      throw RequestError.invalidParams(
        void 0,
        "`callerSessionId` is required and must name a session owned by this connection"
      );
    }
    const result = await handler({ callerSessionId });
    if (result.appName.length === 0 || result.appName.length > 512 || result.windowTitle !== void 0 && result.windowTitle.length > 2048 || result.accessibilityText.length > MAX_LIVE_SCREEN_CONTEXT_TEXT_CHARS || result.screenshotPath.length === 0 || result.screenshotPath.length > 4096) {
      throw RequestError.internalError(void 0, "Invalid Appshot result.");
    }
    return {
      appName: result.appName,
      ...result.windowTitle ? { windowTitle: result.windowTitle } : {},
      accessibilityText: result.accessibilityText,
      screenshotPath: result.screenshotPath
    };
  }
  async handleLiveTaskTool(params) {
    const handler = this.getLiveTaskToolRequestHandler();
    if (!handler) {
      throw RequestError.methodNotFound(SERVE_CONTROL_EXT_METHODS.liveTaskTool);
    }
    const callerSessionId = params["callerSessionId"];
    const name = params["name"];
    const args = params["arguments"];
    if (typeof callerSessionId !== "string" || callerSessionId.length === 0 || !this.ownsSession(callerSessionId) || typeof name !== "string" || !LIVE_TASK_TOOL_NAMES.includes(
      name
    ) || typeof args !== "object" || args === null || Array.isArray(args)) {
      throw RequestError.invalidParams(
        void 0,
        "Invalid Live task-tool request."
      );
    }
    return handler({
      callerSessionId,
      name,
      arguments: args
    });
  }
  async handleLiveSpeakToUser(params) {
    const handler = this.getLiveSpeakToUserHandler();
    if (!handler) {
      throw RequestError.methodNotFound(
        SERVE_CONTROL_EXT_METHODS.liveSpeakToUser
      );
    }
    const callerSessionId = params["callerSessionId"];
    const message = params["message"];
    if (typeof callerSessionId !== "string" || callerSessionId.length === 0 || !this.ownsSession(callerSessionId) || typeof message !== "string" || message.trim().length === 0 || message.length > MAX_LIVE_SPEAK_TO_USER_MESSAGE_CHARS) {
      throw RequestError.invalidParams(
        void 0,
        "Invalid Live speak-to-user request."
      );
    }
    await handler({ callerSessionId, message });
    return { accepted: true };
  }
  /**
   * Handle child->bridge ACP `extNotification` calls. Recognized methods are
   * `qwen/notify/session/model-update`,
   * `qwen/notify/session/mode-update`,
   * `qwen/notify/session/title-update` (auto/in-process session titles),
   * `qwen/notify/session/recording-degraded`,
   * `qwen/notify/session/prompt-suggestion` (followup assist),
   * `qwen/notify/session/artifact-event` (hook artifacts),
   * `qwen/notify/session/terminal-sequence`, and
   * `_qwencode/end_turn` (background-notification and goal turns), and
   * `qwen/notify/session/mcp-budget-event` — each translated into a
   * session-scoped SSE frame. Unknown methods are dropped silently for
   * forward-compat.
   */
  async extNotification(method, params) {
    const notificationSessionId = params["sessionId"];
    if (typeof notificationSessionId === "string" && this.abandonedRestoreIds.has(notificationSessionId)) {
      return;
    }
    if (method === ACTIVE_WORK_NOTIFICATION_METHOD) {
      const snapshot = parseActiveWorkSnapshot(params);
      if (snapshot) {
        this.onActiveWork?.({
          v: ACTIVE_WORK_HEARTBEAT_VERSION,
          seq: snapshot.seq,
          sessions: snapshot.sessions.filter(
            (session) => this.ownsSession(session.sessionId)
          )
        });
      }
      return;
    }
    if (method === "_qwencode/start_turn") {
      const sessionId2 = params["sessionId"];
      if (typeof sessionId2 !== "string" || sessionId2.length === 0 || params["source"] !== "goal") {
        return;
      }
      const entry = this.resolveEntry(sessionId2);
      if (!entry || !this.ownsSession(sessionId2)) return;
      entry.goalTurnActive = true;
      return;
    }
    if (method === "_qwencode/end_turn") {
      const sessionId2 = params["sessionId"];
      const reason = params["reason"];
      const source = params["source"];
      if (typeof sessionId2 !== "string" || sessionId2.length === 0 || typeof reason !== "string" || reason.length === 0 || reason.length > 128 || source !== "background_notification" && source !== "goal") {
        return;
      }
      const entry = this.resolveEntry(sessionId2);
      if (!entry || !this.ownsSession(sessionId2)) return;
      if (source === "goal") {
        entry.goalTurnActive = false;
        this.onGoalTurnEnded?.(sessionId2);
        const promptId = params["promptId"];
        if (typeof promptId !== "string" || promptId.length === 0 || promptId.length > 256) {
          return;
        }
        entry.events.publish({
          type: "turn_complete",
          promptId,
          data: { sessionId: sessionId2, stopReason: reason, promptId }
        });
        return;
      }
      entry.events.publish({
        type: "background_notification_turn_complete",
        data: { sessionId: sessionId2, reason }
      });
      return;
    }
    if (method === "qwen/notify/session/generation/event") {
      const sessionId2 = params["sessionId"];
      const requestId = params["requestId"];
      const event = params["event"];
      if (params["v"] !== 1 || typeof sessionId2 !== "string" || typeof requestId !== "string" || !event || typeof event !== "object" || Array.isArray(event)) {
        return;
      }
      const record = event;
      if (record["type"] === "started") {
        const model = record["model"];
        const modelSource = record["modelSource"];
        if (typeof model !== "string" || modelSource !== "fast" && modelSource !== "main") {
          return;
        }
        this.onGenerationEvent?.(sessionId2, {
          type: "started",
          requestId,
          model,
          modelSource
        });
        return;
      }
      if (record["type"] === "thinking") {
        this.onGenerationEvent?.(sessionId2, {
          type: "thinking",
          requestId
        });
        return;
      }
      if (record["type"] === "delta") {
        const seq = record["seq"];
        const text = record["text"];
        if (typeof seq !== "number" || !Number.isSafeInteger(seq) || seq < 0 || typeof text !== "string" || text.length === 0) {
          return;
        }
        this.onGenerationEvent?.(sessionId2, {
          type: "delta",
          requestId,
          seq,
          text
        });
        return;
      }
      return;
    }
    if (method === "qwen/notify/workspace/generation/event") {
      const requestId = params["requestId"];
      const event = params["event"];
      if (params["v"] !== 1 || typeof requestId !== "string" || !event || typeof event !== "object" || Array.isArray(event)) {
        return;
      }
      const record = event;
      if (record["type"] === "started") {
        const model = record["model"];
        const modelSource = record["modelSource"];
        if (typeof model !== "string" || modelSource !== "fast" && modelSource !== "main") {
          return;
        }
        this.onWorkspaceGenerationEvent?.({
          type: "started",
          requestId,
          model,
          modelSource
        });
        return;
      }
      if (record["type"] === "thinking") {
        this.onWorkspaceGenerationEvent?.({ type: "thinking", requestId });
        return;
      }
      if (record["type"] === "delta") {
        const seq = record["seq"];
        const text = record["text"];
        if (typeof seq !== "number" || !Number.isSafeInteger(seq) || seq < 0 || typeof text !== "string" || text.length === 0) {
          return;
        }
        this.onWorkspaceGenerationEvent?.({
          type: "delta",
          requestId,
          seq,
          text
        });
        return;
      }
      return;
    }
    if (method === "qwen/notify/session/model-update") {
      this.handleInSessionModelUpdate(params);
      return;
    }
    if (method === "qwen/notify/session/mode-update") {
      this.handleInSessionModeUpdate(params);
      return;
    }
    if (method === "qwen/notify/session/title-update") {
      const sessionId2 = params["sessionId"];
      const title = params["title"];
      if (typeof sessionId2 !== "string" || typeof title !== "string" || !title)
        return;
      const entry = this.resolveEntry(sessionId2);
      if (!entry) return;
      this.onSessionCatalogChanged?.();
      try {
        entry.events.publish({
          type: "session_metadata_updated",
          data: {
            sessionId: sessionId2,
            displayName: title,
            ...typeof params["titleSource"] === "string" ? { titleSource: params["titleSource"] } : {}
          }
        });
      } catch {
      }
      return;
    }
    if (method === "qwen/notify/session/recording-degraded") {
      const sessionId2 = params["sessionId"];
      if (params["v"] !== 1 || typeof sessionId2 !== "string" || sessionId2.length === 0 || params["reason"] !== "write_failed") {
        writeStderrLine(
          `[demux] session=${typeof sessionId2 === "string" ? sessionId2 : "<missing>"} type=session_recording_degraded action=dropped reason=malformed`
        );
        return;
      }
      const entry = this.resolveEntry(sessionId2);
      if (entry && !this.ownsSession(sessionId2)) {
        writeStderrLine(
          `[demux] session=${sessionId2} type=session_recording_degraded action=dropped reason=session_not_owned`
        );
        return;
      }
      if (entry) entry.recordingDegraded = true;
      this.publishExtNotification(sessionId2, "session_recording_degraded", {
        sessionId: sessionId2,
        reason: "write_failed"
      });
      return;
    }
    if (method === "qwen/notify/session/prompt-suggestion") {
      const sessionId2 = params["sessionId"];
      const suggestion = params["suggestion"];
      const promptId = params["promptId"];
      if (typeof sessionId2 !== "string" || typeof suggestion !== "string" || suggestion.length === 0 || suggestion.length > MAX_SUGGESTION_LENGTH || typeof promptId !== "string") {
        writeStderrLine(
          `[demux] session=${typeof sessionId2 === "string" ? sessionId2 : "<missing>"} type=prompt_suggestion action=dropped reason=malformed`
        );
        return;
      }
      const entry = this.resolveEntry(sessionId2);
      if (!entry) return;
      entry.events.publish({
        type: "followup_suggestion",
        data: { sessionId: sessionId2, suggestion, promptId }
      });
      return;
    }
    if (method === "qwen/notify/session/terminal-sequence") {
      const sessionId2 = params["sessionId"];
      if (typeof sessionId2 !== "string") return;
      const { v: _v2, sessionId: _sid2, ...rest2 } = params;
      void _v2;
      void _sid2;
      this.publishExtNotification(sessionId2, "terminal_sequence", rest2, true);
      return;
    }
    if (method === "qwen/notify/session/artifact-event") {
      await this.handleArtifactEvent(params);
      return;
    }
    if (method !== "qwen/notify/session/mcp-budget-event") return;
    const sessionId = params["sessionId"];
    if (typeof sessionId !== "string") return;
    const kind = params["kind"];
    let type;
    if (kind === "budget_warning") {
      type = "mcp_budget_warning";
    } else if (kind === "refused_batch") {
      type = "mcp_child_refused_batch";
    } else {
      return;
    }
    const { v: _v, sessionId: _sid, kind: _kind, ...rest } = params;
    void _v;
    void _sid;
    void _kind;
    this.publishExtNotification(sessionId, type, rest);
  }
  async handleArtifactEvent(params) {
    const sessionId = params["sessionId"];
    const rawArtifacts = params["artifacts"];
    if (typeof sessionId !== "string" || !Array.isArray(rawArtifacts)) {
      writeStderrLine(
        `[demux] session=${typeof sessionId === "string" ? sessionId : "<missing>"} type=artifact_event action=dropped reason=malformed`
      );
      return;
    }
    if (!this.ownsSession(sessionId) && !this.inFlightRestoreIds.has(sessionId)) {
      writeStderrLine(
        `[demux] session=${sessionId} type=artifact_event action=dropped reason=session_not_owned`
      );
      return;
    }
    const entry = this.resolveEntry(sessionId);
    if (!entry) {
      writeStderrLine(
        `[demux] session=${sessionId} type=artifact_event action=dropped reason=session_not_found`
      );
      return;
    }
    const hookEventName = typeof params["hookEventName"] === "string" ? params["hookEventName"] : void 0;
    const toolName = typeof params["toolName"] === "string" ? params["toolName"] : void 0;
    const toolCallId = typeof params["toolCallId"] === "string" ? params["toolCallId"] : void 0;
    const artifacts = extractCappedArtifactInputs(
      rawArtifacts,
      entry.artifacts.inputBatchLimit(),
      entry.sessionId,
      "hook",
      (artifact) => ({
        ...artifactPayloadFields(artifact),
        source: "hook",
        hookEventName,
        toolName,
        toolCallId
      })
    );
    const turn = {
      ...entry.activePromptId ? { promptId: entry.activePromptId } : {},
      ...entry.activePromptOriginatorClientId ? { originatorClientId: entry.activePromptOriginatorClientId } : {}
    };
    await this.upsertAndPublishArtifacts(entry, artifacts, void 0, turn);
  }
  async upsertAndPublishArtifacts(entry, artifacts, options, turn = {}) {
    if (!entry.artifactWorkspaceReady) {
      this.deferArtifactBatch(entry, artifacts, options, turn);
      writeStderrLine(
        `[artifacts] session=${entry.sessionId} action=deferred reason=workspace_not_bound`
      );
      return;
    }
    try {
      await entry.prepareArtifactWorkspace?.();
    } catch {
      this.deferArtifactBatch(entry, artifacts, options, turn);
      writeStderrLine(
        `[artifacts] session=${entry.sessionId} action=deferred reason=workspace_prepare_failed`
      );
      return;
    }
    await this.upsertAndPublishArtifactsReady(entry, artifacts, options, turn);
  }
  deferArtifactBatch(entry, artifacts, options, turn) {
    if (artifacts.length === 0) return;
    entry.deferredArtifactBatches.push({ artifacts, options, turn });
    entry.deferredArtifactInputCount += artifacts.length;
    const limit = entry.artifacts.inputBatchLimit();
    let truncated = false;
    while (entry.deferredArtifactInputCount > limit) {
      const first = entry.deferredArtifactBatches[0];
      if (!first) break;
      const overflow = entry.deferredArtifactInputCount - limit;
      if (first.artifacts.length <= overflow) {
        entry.deferredArtifactBatches.shift();
        entry.deferredArtifactInputCount -= first.artifacts.length;
      } else {
        first.artifacts = first.artifacts.slice(overflow);
        entry.deferredArtifactInputCount -= overflow;
      }
      truncated = true;
    }
    if (truncated) {
      writeStderrLine(
        `[artifacts] session=${entry.sessionId} action=deferred_truncated reason=workspace_not_bound`
      );
    }
  }
  async upsertAndPublishArtifactsReady(entry, artifacts, options, turn = {}) {
    try {
      const result = await entry.artifacts.upsertMany(artifacts, options);
      for (const warning of result.warnings ?? []) {
        writeStderrLine(
          `[artifacts] session=${entry.sessionId} action=warning reason=${JSON.stringify(
            warning
          )}`
        );
      }
      this.publishArtifactChanges(entry, result.changes, turn);
      return true;
    } catch (error) {
      writeStderrLine(
        `[artifacts] session=${entry.sessionId} action=dropped reason=${JSON.stringify(
          artifactIngestionErrorReason(error)
        )}`
      );
      return false;
    }
  }
  publishArtifactChanges(entry, changes, turn) {
    for (const change of changes) {
      entry.events.publish({
        type: "artifact_changed",
        data: { sessionId: entry.sessionId, change },
        ...turn
      });
    }
  }
  publishExtNotification(sessionId, type, data, turnScoped = false) {
    if (this.abandonedRestoreIds.has(sessionId)) {
      return;
    }
    const entry = this.resolveEntry(sessionId);
    const frame = {
      type,
      data,
      ...turnScoped && entry?.activePromptId ? { promptId: entry.activePromptId } : {},
      ...entry?.activePromptOriginatorClientId ? { originatorClientId: entry.activePromptOriginatorClientId } : {}
    };
    if (entry) {
      entry.events.publish(frame);
      return;
    }
    this.bufferEarlyEvent(sessionId, frame);
  }
  /**
   * Promote an in-session `current_model_update` extNotification to a
   * `model_switched` bus event. Suppressed while the bridge is driving
   * its own model roundtrip (`entry.modelRoundtripInFlight`) — there the
   * bridge publishes the authoritative `model_switched`, so promoting
   * here too would double-publish. A structured log records the decision
   * so the `dropped` case is observable.
   */
  handleInSessionModelUpdate(params) {
    const sessionId = params["sessionId"];
    const currentModelId = params["currentModelId"];
    if (typeof sessionId !== "string" || typeof currentModelId !== "string") {
      return;
    }
    const entry = this.resolveEntry(sessionId);
    if (!entry) {
      writeStderrLine(
        `[demux] session=${sessionId} type=current_model_update action=dropped reason=no_entry`
      );
      return;
    }
    if (entry.modelRoundtripInFlight) {
      writeStderrLine(
        `[demux] session=${sessionId} type=current_model_update action=suppressed reason=bridge_roundtrip_in_flight`
      );
      return;
    }
    if (this.onModelPromoted) {
      this.onModelPromoted(
        entry,
        currentModelId,
        entry.activePromptOriginatorClientId
      );
    } else {
      entry.events.publish({
        type: "model_switched",
        ...entry.activePromptId ? { promptId: entry.activePromptId } : {},
        data: { sessionId, modelId: currentModelId },
        ...entry.activePromptOriginatorClientId ? { originatorClientId: entry.activePromptOriginatorClientId } : {}
      });
    }
    writeStderrLine(
      `[demux] session=${sessionId} type=current_model_update action=promoted model=${currentModelId}`
    );
  }
  /**
   * A2: promote an in-session `current_mode_update` extNotification to
   * `approval_mode_changed`. Uses the same suppression pattern as
   * `handleInSessionModelUpdate` — suppressed while the bridge is driving
   * its own approval-mode roundtrip (`entry.approvalModeRoundtripInFlight`)
   * — but diverges with two additions the model handler lacks: enum
   * validation against `KNOWN_APPROVAL_MODES`, and a legacy
   * `session_update{current_mode_update}` dual-emit for IDE companion
   * compat (transition — see §6 of the design doc), itself deduped via the
   * `legacyFrameSent` flag.
   */
  handleInSessionModeUpdate(params) {
    const sessionId = params["sessionId"];
    const currentModeId = params["currentModeId"];
    if (typeof sessionId !== "string" || typeof currentModeId !== "string") {
      return;
    }
    if (!KNOWN_APPROVAL_MODES.has(currentModeId)) {
      writeStderrLine(
        `[demux] session=${sessionId} type=current_mode_update action=dropped reason=unknown_mode mode=${currentModeId}`
      );
      return;
    }
    const entry = this.resolveEntry(sessionId);
    if (!entry) {
      writeStderrLine(
        `[demux] session=${sessionId} type=current_mode_update action=dropped reason=no_entry`
      );
      return;
    }
    if (entry.approvalModeRoundtripInFlight) {
      writeStderrLine(
        `[demux] session=${sessionId} type=current_mode_update action=suppressed reason=bridge_roundtrip_in_flight`
      );
      return;
    }
    if (this.onModePromoted) {
      this.onModePromoted(
        entry,
        currentModeId,
        entry.activePromptOriginatorClientId
      );
    } else {
      entry.events.publish({
        type: "approval_mode_changed",
        ...entry.activePromptId ? { promptId: entry.activePromptId } : {},
        data: {
          sessionId,
          previous: "default",
          next: currentModeId,
          persisted: false
        },
        ...entry.activePromptOriginatorClientId ? { originatorClientId: entry.activePromptOriginatorClientId } : {}
      });
    }
    if (params["legacyFrameSent"] === true) {
      writeStderrLine(
        `[demux] session=${sessionId} type=current_mode_update action=promoted mode=${currentModeId} legacy_frame=skipped`
      );
      return;
    }
    entry.events.publish({
      type: "session_update",
      ...entry.activePromptId ? { promptId: entry.activePromptId } : {},
      data: {
        sessionId,
        update: {
          sessionUpdate: "current_mode_update",
          currentModeId
        }
      },
      ...entry.activePromptOriginatorClientId ? { originatorClientId: entry.activePromptOriginatorClientId } : {}
    });
    writeStderrLine(
      `[demux] session=${sessionId} type=current_mode_update action=promoted mode=${currentModeId}`
    );
  }
  /**
   * Enqueue `frame` for `sessionId`. Lazy TTL sweep runs first so
   * caller doesn't pay for stale entries before deciding whether
   * the session-cap is reached. New sessionIds past
   * `MAX_EARLY_EVENT_SESSIONS` are dropped (defense against a
   * malicious / buggy child fanning out fake sessionIds); same-
   * sessionId frames past `MAX_EARLY_EVENTS_PER_SESSION` are
   * dropped to bound per-session memory.
   */
  bufferEarlyEvent(sessionId, frame) {
    if (this.abandonedRestoreIds.has(sessionId)) {
      return;
    }
    const now = Date.now();
    this.sweepExpiredTombstones(now);
    if (this.tombstonedSessionIds.has(sessionId) && !this.inFlightSessionRegistrationIds.has(sessionId)) {
      writeStderrLine(
        `qwen serve: dropping early extNotification for tombstoned session ${JSON.stringify(sessionId)} (post-close stale event)`
      );
      return;
    }
    this.sweepExpiredEarlyEvents(now);
    let buf = this.earlyEvents.get(sessionId);
    if (!buf) {
      if (this.earlyEvents.size >= MAX_EARLY_EVENT_SESSIONS) {
        writeStderrLine(
          `qwen serve: dropping early extNotification \u2014 early-event buffer at MAX_EARLY_EVENT_SESSIONS (${MAX_EARLY_EVENT_SESSIONS}); possible session-id fanout abuse`
        );
        return;
      }
      buf = { frames: [], expiresAt: now + EARLY_EVENT_TTL_MS };
      this.earlyEvents.set(sessionId, buf);
    }
    if (buf.frames.length >= MAX_EARLY_EVENTS_PER_SESSION) {
      writeStderrLine(
        `qwen serve: dropping early extNotification for session ${JSON.stringify(sessionId)} \u2014 per-session cap (${MAX_EARLY_EVENTS_PER_SESSION}) reached`
      );
      return;
    }
    buf.frames.push(frame);
  }
  sweepExpiredEarlyEvents(now) {
    for (const [sid, buf] of this.earlyEvents) {
      if (buf.expiresAt <= now) this.earlyEvents.delete(sid);
    }
  }
  sweepExpiredTombstones(now) {
    for (const [sid, expiresAt] of this.tombstonedSessionIds) {
      if (expiresAt <= now) this.tombstonedSessionIds.delete(sid);
    }
  }
  /**
   * Mark a sessionId as closed so a late `extNotification` from the
   * dying child can't leak into the early-event buffer. Bridge factory
   * calls this from every `byId.delete(sid)` site (kill path,
   * channel.exited handler, closeSession). Idempotent on already-
   * tombstoned ids — refreshes the TTL so a recently-killed id stays
   * dead long enough for any in-flight stale frames to expire.
   */
  markSessionClosed(sessionId) {
    const now = Date.now();
    this.sweepExpiredTombstones(now);
    this.tombstonedSessionIds.set(sessionId, now + EARLY_EVENT_TTL_MS);
    this.earlyEvents.delete(sessionId);
  }
  /**
   * Mark a sessionId as currently being restored via `session/load` /
   * `session/resume`. While in this set, `bufferEarlyEvent` accepts
   * frames for the id even if it's tombstoned — so restore-time
   * early events from the freshly-restored child reach
   * `drainEarlyEvents` instead of being rejected by the tombstone.
   *
   * Bridge factory calls this BEFORE awaiting the ACP restore call.
   * `clearRestoreInFlight` is paired in the matching `finally` so a
   * failed restore doesn't leave a dangling allow-list entry.
   */
  markRestoreInFlight(sessionId) {
    this.markSessionRegistrationInFlight(sessionId);
    this.inFlightRestoreIds.add(sessionId);
  }
  /**
   * Transfer an id from closed/abandoned ownership to a new registration
   * attempt before its ACP call starts. The in-flight allow-list is what lets
   * legitimate early notifications bypass the ordinary close tombstone until
   * `createSessionEntry` can drain them.
   */
  markSessionRegistrationInFlight(sessionId) {
    this.clearAbandonedRestoreFence(sessionId);
    this.inFlightSessionRegistrationIds.add(sessionId);
  }
  /**
   * Drop the abandoned-restore fence for `sessionId`.
   *
   * The fence has no TTL and suppresses session updates, guardrail events,
   * and child notifications, so it must not outlive the abandoned attempt it
   * was raised for. The bridge clears it whenever a legitimate owner takes
   * the id — a new restore, or `createSessionEntry` registering a session
   * from any other route.
   */
  clearAbandonedRestoreFence(sessionId) {
    this.abandonedRestoreIds.delete(sessionId);
  }
  /**
   * Companion to `markRestoreInFlight`. Bridge factory calls this when
   * the restore IIFE settles — after `createSessionEntry` runs
   * (success) or after the ACP restore call fails (error). Cleared to
   * prevent the Set from growing forever under high restore churn.
   */
  clearRestoreInFlight(sessionId) {
    this.inFlightRestoreIds.delete(sessionId);
    this.clearSessionRegistrationInFlight(sessionId);
  }
  clearSessionRegistrationInFlight(sessionId) {
    this.inFlightSessionRegistrationIds.delete(sessionId);
  }
  markRestoreAbandoned(sessionId) {
    this.inFlightRestoreIds.delete(sessionId);
    this.inFlightSessionRegistrationIds.delete(sessionId);
    this.abandonedRestoreIds.add(sessionId);
    this.earlyEvents.delete(sessionId);
  }
  /**
   * Drain any frames buffered for `sessionId` onto `entry.events`.
   * Bridge calls this immediately after `byId.set(sessionId, entry)`
   * in `createSessionEntry`. The frames were captured before the
   * entry existed (e.g. MCP discovery during the child's `newSession`
   * handler), so draining them now lands them in the replay ring as
   * the FIRST events of this session.
   *
   * Public so the bridge factory can call it directly. Idempotent on
   * unknown sessionIds.
   */
  drainEarlyEvents(sessionId, entry) {
    this.tombstonedSessionIds.delete(sessionId);
    const buf = this.earlyEvents.get(sessionId);
    if (!buf) return;
    for (const frame of buf.frames) {
      if (frame.type === "session_recording_degraded") {
        entry.recordingDegraded = true;
      }
      entry.events.publish(frame);
    }
    this.earlyEvents.delete(sessionId);
  }
  async writeTextFile(params) {
    if (this.fileSystem) {
      try {
        return await this.fileSystem.writeText(params);
      } catch (err) {
        preserveFsErrorOverAcp(err);
      }
    }
    let realTarget = params.path;
    try {
      realTarget = await fs2.realpath(params.path);
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? err.code : void 0;
      if (code !== "ENOENT") throw err;
      try {
        const linkTarget = await fs2.readlink(params.path);
        realTarget = path2.resolve(path2.dirname(params.path), linkTarget);
      } catch {
      }
    }
    const tmp = `${realTarget}.${process.pid}.${Date.now()}.${randomUUID2()}.tmp`;
    let preserveMode;
    try {
      const targetStat = await fs2.stat(realTarget);
      preserveMode = {
        mode: targetStat.mode & 4095,
        uid: targetStat.uid,
        gid: targetStat.gid
      };
    } catch (err) {
      const code = err && typeof err === "object" && "code" in err ? err.code : void 0;
      if (code !== "ENOENT") throw err;
    }
    try {
      await fs2.writeFile(tmp, params.content, {
        encoding: "utf8",
        flag: "wx",
        mode: preserveMode?.mode ?? 384
      });
      if (preserveMode) {
        await fs2.chmod(tmp, preserveMode.mode).catch(() => {
        });
        await fs2.chown(tmp, preserveMode.uid, preserveMode.gid).catch(() => {
        });
      }
      await fs2.rename(tmp, realTarget);
    } catch (err) {
      await fs2.unlink(tmp).catch(() => {
      });
      throw err;
    }
    return {};
  }
  async readTextFile(params) {
    if (this.fileSystem) {
      try {
        return await this.fileSystem.readText(params);
      } catch (err) {
        preserveFsErrorOverAcp(err);
      }
    }
    if (typeof params.limit === "number" && params.limit <= 0) {
      return { content: "" };
    }
    if (typeof params.limit === "number" && params.limit > 0 && !Number.isSafeInteger(params.limit)) {
      throw RequestError.invalidParams(
        void 0,
        `\`limit\` must be a positive integer, got ${params.limit}`
      );
    }
    if (typeof params.line === "number" && params.line > 0 && !Number.isSafeInteger(params.line)) {
      throw RequestError.invalidParams(
        void 0,
        `\`line\` must be a positive integer, got ${params.line}`
      );
    }
    const READ_FILE_SIZE_CAP = 100 * 1024 * 1024;
    const stats = await fs2.stat(params.path);
    if (!stats.isFile()) {
      throw new Error(
        `readTextFile: ${params.path} is not a regular file (reported as ${describeStatKind(stats)}). Pipe / device / proc-like inputs can produce unbounded data and aren't supported by the bridge fs proxy.`
      );
    }
    if (stats.size > READ_FILE_SIZE_CAP) {
      throw new Error(
        `readTextFile: ${params.path} is ${stats.size} bytes, exceeds the ${READ_FILE_SIZE_CAP}-byte daemon cap. Tail/grep externally and feed the relevant slice instead.`
      );
    }
    const content = await fs2.readFile(params.path, "utf8");
    if (typeof params.line === "number" || typeof params.limit === "number") {
      const startLine = params.line ?? 1;
      const start = startLine > 0 ? startLine - 1 : 0;
      const end = params.limit != null ? start + params.limit : void 0;
      return { content: sliceLineRange(content, start, end) };
    }
    return { content };
  }
};
var A2UI_TOOL_RE = /(^|__)(present_ui|present_choices|a2ui_action)$/;
function isA2uiToolMeta(meta) {
  if (!meta) return false;
  if (typeof meta.serverId === "string" && meta.serverId.toLowerCase().includes("a2ui"))
    return true;
  return typeof meta.toolName === "string" && A2UI_TOOL_RE.test(meta.toolName);
}
__name(isA2uiToolMeta, "isA2uiToolMeta");
function splitA2uiText(raw) {
  const s = raw.replace(/^\s+/, "");
  if (s[0] !== "[") return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  let end = -1;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end < 0) return null;
  try {
    const arr = JSON.parse(s.slice(0, end));
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return [arr, s.slice(end).trim()];
  } catch {
    return null;
  }
}
__name(splitA2uiText, "splitA2uiText");
function surfaceIdOf(c) {
  const cmd = c;
  return cmd?.createSurface?.surfaceId ?? cmd?.updateComponents?.surfaceId ?? cmd?.updateDataModel?.surfaceId ?? cmd?.deleteSurface?.surfaceId;
}
__name(surfaceIdOf, "surfaceIdOf");
function extractA2uiToolUpdate(params) {
  const update = params.update;
  if (!update || update["sessionUpdate"] !== "tool_call_update") return null;
  const meta = update["_meta"];
  if (!isA2uiToolMeta(meta)) return null;
  const content = update["content"];
  if (!Array.isArray(content)) return null;
  let split = null;
  let hitIndex = -1;
  for (let i = 0; i < content.length; i++) {
    const inner = content[i]?.content;
    if (typeof inner?.text === "string") {
      split = splitA2uiText(inner.text);
      if (split) {
        hitIndex = i;
        break;
      }
    }
  }
  if (!split) return null;
  const [commands, fallback] = split;
  const order = [];
  const grouped = /* @__PURE__ */ new Map();
  for (const c of commands) {
    const sid = surfaceIdOf(c);
    if (!sid) {
      const shape = c && typeof c === "object" ? Object.keys(c).join(",") || "empty object" : typeof c;
      writeStderrLine(
        `a2ui: dropping command with unrecognized shape (${shape})`
      );
      continue;
    }
    if (!grouped.has(sid)) {
      grouped.set(sid, []);
      order.push(sid);
    }
    grouped.get(sid).push(c);
  }
  const surfaces = order.map((sid) => ({
    surfaceId: sid,
    commands: grouped.get(sid)
  }));
  const sanitizedText = fallback || "[A2UI surface rendered]";
  const sanitizedContent = content.map(
    (block, i) => i === hitIndex ? {
      ...block,
      content: {
        ...block.content ?? {},
        text: sanitizedText
      }
    } : block
  );
  const sanitizedUpdate = {
    ...update,
    content: sanitizedContent
  };
  if (typeof update["rawOutput"] === "string") {
    sanitizedUpdate["rawOutput"] = sanitizedText;
  }
  return {
    surfaces,
    callId: typeof update["toolCallId"] === "string" ? update["toolCallId"] : void 0,
    sanitizedParams: {
      ...params,
      update: sanitizedUpdate
    }
  };
}
__name(extractA2uiToolUpdate, "extractA2uiToolUpdate");

export {
  CANCEL_VOTE_SENTINEL,
  createNoOpPermissionAuditPublisher,
  MultiClientPermissionMediator,
  writeStderrLine,
  SessionAttachmentReferenceError,
  isSessionAttachmentReference,
  withAttachmentDegradationMarker,
  SessionAttachmentStore,
  KNOWN_APPROVAL_MODES,
  BridgeClient,
  isA2uiToolMeta
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
