# Durable Turn Completion Barrier

## Problem

An ACP prompt response currently releases the session FIFO and publishes
`turn_complete` immediately. The local transcript and prompt ledger may be
readable at that point, but an external owner has no opportunity to commit
those files to durable storage before clients observe success or the next
prompt starts mutating the session.

## Boundary

`BridgeOptions.onDurableTurnCommit` is the only bridge-level seam. It runs for
a successful, non-cancelled prompt after the ACP response and transcript tail
are available. Before invoking it, the bridge synchronously appends the
`completed` prompt-ledger record. The request therefore names both immutable
pieces of local commit evidence: the completed ledger record and the current
transcript tail UUID.

The bridge awaits the handler before it:

- publishes `turn_complete`;
- resolves `sendPrompt`; or
- releases the per-session prompt FIFO.

A handler rejection appends an `error` ledger terminal and publishes exactly
one `turn_error` with code `durable_turn_commit_failed`. It never publishes a
successful terminal. Cancellation and an ACP error bypass the handler.

## Version 1 Contract

The request is JSON with exact camel-case fields:

```json
{
  "v": 1,
  "commitId": "sha256:<64 lowercase hex characters>",
  "sessionId": "...",
  "promptId": "...",
  "completedAt": "2026-09-17T10:00:00.000Z",
  "stopReason": "end_turn",
  "transcriptTailUuid": "...",
  "branchPoint": {
    "assistantRecordUuid": "...",
    "checkpointUuid": "..."
  }
}
```

`branchPoint` is omitted unless the validated ACP result contains it.
`commitId` is `sha256:` plus the lowercase SHA-256 of the UTF-8 bytes produced
by `JSON.stringify` over an object whose insertion order is exactly `v`,
`sessionId`, `promptId`, `completedAt`, `stopReason`, `transcriptTailUuid`, and
then optional `branchPoint`; the branch-point field order is
`assistantRecordUuid`, `checkpointUuid`. A changed file boundary therefore
cannot reuse an older commit identity. Every transport retry reuses the
initially constructed body and commit ID. The handler returns this exact
receipt, with no additional fields:

```json
{
  "v": 1,
  "commitId": "sha256:<64 lowercase hex characters>",
  "sessionId": "...",
  "promptId": "...",
  "completedAt": "2026-09-17T10:00:00.000Z",
  "snapshotHash": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "workspaceRevision": 4
}
```

`snapshotHash` is exactly 64 lowercase hexadecimal characters and
`workspaceRevision` is a positive safe integer because revision zero is not a
committed workspace version. They are authoritative Gateway commit evidence
even though Qwen does not know their values in advance. The CLI transport
validates and consumes this receipt; the generic bridge handler depends only
on its resolved/rejected result.

Production `qwen serve` enables the handler only when
`QWEN_DURABLE_TURN_COMMIT_URL` is set to an `http:` loopback URL. It retries a
lost response with the unchanged request and commit ID up to three times, with
a 120-second deadline per end-to-end commit attempt. A non-matching or
malformed receipt is a failed commit, never success.

## Ownership

The bridge owns prompt serialization and terminal visibility. The CLI owns
HTTP transport and environment validation. The hook server owns durable
snapshot creation, read-back verification, and the final database CAS before
returning the receipt.
