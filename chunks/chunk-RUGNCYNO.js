// Force strict mode and setup for ESM
"use strict";
import {
  NdJsonQueueLimitError,
  ndJsonStream,
  validateNdJsonStreamLimits
} from "./chunk-H72BQNM3.js";
import {
  MissingCliEntryError
} from "./chunk-JHS74YAB.js";
import {
  EXTERNAL_TOOL_GUARD_TOKEN_ENV
} from "./chunk-3VUENPWF.js";
import {
  redactLogCredentials
} from "./chunk-M5GB774H.js";
import {
  CLIENT_METHODS,
  zCreateTerminalRequest,
  zKillTerminalCommandRequest,
  zReadTextFileRequest,
  zReleaseTerminalRequest,
  zRequestPermissionRequest,
  zSessionNotification,
  zTerminalOutputRequest,
  zWaitForTerminalExitRequest,
  zWriteTextFileRequest
} from "./chunk-IW6RQPQB.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/acp-bridge/src/spawnChannel.ts
init_esbuild_shims();
import { spawn } from "node:child_process";
import * as os from "node:os";
import { Readable, Writable } from "node:stream";
import { getHeapStatistics } from "node:v8";

// packages/acp-bridge/src/process-registry.ts
init_esbuild_shims();
var TERM_GRACE_MS = 5e3;
var EXIT_DEADLINE_MS = 1e4;
var ProcessRegistry = class {
  static {
    __name(this, "ProcessRegistry");
  }
  reservations = /* @__PURE__ */ new Set();
  children = /* @__PURE__ */ new Set();
  draining = false;
  shutdownPromise;
  reserve() {
    if (this.draining) {
      throw new Error("ACP process registry is draining");
    }
    const token = Symbol("acp-child");
    this.reservations.add(token);
    let settled = false;
    return {
      attach: /* @__PURE__ */ __name((child) => {
        if (settled || !this.reservations.delete(token)) {
          throw new Error("ACP process reservation is no longer active");
        }
        settled = true;
        const tracked = new TrackedChild(child, () => {
          this.children.delete(tracked);
        });
        this.children.add(tracked);
        if (this.draining) void tracked.terminate().catch(() => {
        });
        return tracked;
      }, "attach"),
      cancel: /* @__PURE__ */ __name(() => {
        if (settled) return;
        settled = true;
        this.reservations.delete(token);
      }, "cancel")
    };
  }
  shutdown() {
    if (this.shutdownPromise) return this.shutdownPromise;
    this.draining = true;
    this.shutdownPromise = Promise.allSettled(
      [...this.children].map((child) => child.terminate())
    ).then((results) => {
      const failures = results.flatMap(
        (result) => result.status === "rejected" ? [result.reason] : []
      );
      if (failures.length > 0) {
        throw new AggregateError(failures, "ACP child process shutdown failed");
      }
    });
    return this.shutdownPromise;
  }
  killAllSync() {
    this.draining = true;
    for (const child of this.children) child.killSync();
  }
  get activeProcessCount() {
    return this.children.size;
  }
  /**
   * Children this registry has committed to: attached ones plus reservations
   * that have not attached yet. Larger than {@link activeProcessCount}, and
   * the right figure for admission — `reserve()` inserts its token
   * synchronously before `spawn()`, so two racing spawns each see the other
   * here, while neither is visible in `activeProcessCount` until its child is
   * attached.
   *
   * A child leaves this count when it *exits*, not when `terminate()` starts,
   * so a channel swap is counted twice while the old process is still winding
   * down. That is deliberate: its memory is still resident.
   */
  get committedProcessCount() {
    return this.children.size + this.reservations.size;
  }
};
var TrackedChild = class {
  constructor(child, onExit) {
    this.child = child;
    this.onExit = onExit;
    this.exited = new Promise((resolve) => {
      const finish = /* @__PURE__ */ __name((info) => {
        if (this.exitedSettled) return;
        this.exitedSettled = true;
        this.onExit();
        resolve(info);
      }, "finish");
      child.once("exit", (exitCode, signalCode) => {
        finish({ exitCode, signalCode });
      });
      child.once("spawn", () => {
        this.spawnConfirmed = true;
      });
      child.once("error", () => {
        if (!this.spawnConfirmed) finish(void 0);
      });
    });
  }
  static {
    __name(this, "TrackedChild");
  }
  exited;
  exitedSettled = false;
  spawnConfirmed = false;
  terminatePromise;
  terminate() {
    this.terminatePromise ??= this.terminateOnce();
    return this.terminatePromise;
  }
  killSync() {
    if (this.exitedSettled) return;
    try {
      this.child.kill("SIGKILL");
    } catch {
    }
  }
  async terminateOnce() {
    if (this.exitedSettled) return;
    try {
      this.child.kill("SIGTERM");
    } catch {
      if (this.exitedSettled) return;
    }
    let hardKillTimer;
    let deadlineTimer;
    const deadline = new Promise((_, reject) => {
      hardKillTimer = setTimeout(() => this.killSync(), TERM_GRACE_MS);
      hardKillTimer.unref();
      deadlineTimer = setTimeout(() => {
        reject(
          new Error(
            `ACP child pid=${this.child.pid ?? "unknown"} did not exit within ${EXIT_DEADLINE_MS}ms`
          )
        );
      }, EXIT_DEADLINE_MS);
      deadlineTimer.unref();
    });
    try {
      const exitInfo = await Promise.race([this.exited, deadline]);
      if (exitInfo && (exitInfo.exitCode !== 0 || exitInfo.signalCode !== null)) {
        throw new Error(
          `ACP child pid=${this.child.pid ?? "unknown"} exited uncleanly during shutdown (code=${exitInfo.exitCode ?? "none"}, signal=${exitInfo.signalCode ?? "none"})`
        );
      }
    } finally {
      if (hardKillTimer) clearTimeout(hardKillTimer);
      if (deadlineTimer) clearTimeout(deadlineTimer);
    }
  }
};

// packages/acp-bridge/src/json-string-bytes.ts
init_esbuild_shims();
function estimateJsonStringBytes(value, limitBytes) {
  const unescapedBytes = Buffer.byteLength(value, "utf8") + 2;
  if (unescapedBytes > limitBytes) return limitBytes + 1;
  if (!/["\\]|[^ -\ud7ff\ue000-\uffff]/u.test(value)) {
    return unescapedBytes;
  }
  let bytes = 2;
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code === 34 || code === 92) {
      bytes += 2;
    } else if (code <= 31) {
      bytes += code === 8 || code === 9 || code === 10 || code === 12 || code === 13 ? 2 : 6;
    } else if (code >= 55296 && code <= 56319) {
      const next = value.charCodeAt(index + 1);
      if (next >= 56320 && next <= 57343) {
        bytes += 4;
        index++;
      } else {
        bytes += 6;
      }
    } else if (code >= 56320 && code <= 57343) {
      bytes += 6;
    } else if (code <= 127) {
      bytes++;
    } else if (code <= 2047) {
      bytes += 2;
    } else {
      bytes += 3;
    }
    if (bytes > limitBytes) return limitBytes + 1;
  }
  return bytes;
}
__name(estimateJsonStringBytes, "estimateJsonStringBytes");

// packages/acp-bridge/src/spawnChannel.ts
var cachedMemoryArgs;
var DAEMON_ACP_NDJSON_LIMITS = Object.freeze({
  maxFrameBytes: 64 * 1024 * 1024,
  maxQueuedMessages: 256,
  maxQueuedBytes: 64 * 1024 * 1024
});
var daemonClientParamValidators = /* @__PURE__ */ new Map([
  [CLIENT_METHODS.fs_read_text_file, zReadTextFileRequest],
  [CLIENT_METHODS.fs_write_text_file, zWriteTextFileRequest],
  [CLIENT_METHODS.session_request_permission, zRequestPermissionRequest],
  [CLIENT_METHODS.session_update, zSessionNotification],
  [CLIENT_METHODS.terminal_create, zCreateTerminalRequest],
  [CLIENT_METHODS.terminal_kill, zKillTerminalCommandRequest],
  [CLIENT_METHODS.terminal_output, zTerminalOutputRequest],
  [CLIENT_METHODS.terminal_release, zReleaseTerminalRequest],
  [CLIENT_METHODS.terminal_wait_for_exit, zWaitForTerminalExitRequest]
]);
function validateDaemonInboundMessage(message) {
  if (!("method" in message)) return true;
  const validator = daemonClientParamValidators.get(message.method);
  return !validator || validator.safeParse(message.params).success;
}
__name(validateDaemonInboundMessage, "validateDaemonInboundMessage");
var PreparedResponseBudget = class {
  constructor(limits) {
    this.limits = limits;
  }
  static {
    __name(this, "PreparedResponseBudget");
  }
  objectCharges = /* @__PURE__ */ new WeakMap();
  primitiveCharges = /* @__PURE__ */ new Map();
  retainedCount = 0;
  retainedBytes = 0;
  closed = false;
  reserve(value) {
    if (this.closed) return;
    const availableBytes = Math.max(
      0,
      this.limits.maxQueuedBytes - this.retainedBytes
    );
    const envelopeBytes = Math.min(2048, this.limits.maxQueuedBytes);
    const charge = envelopeBytes + estimatePreparedResponseBytes(
      value,
      Math.max(0, availableBytes - envelopeBytes)
    );
    if (this.retainedCount >= this.limits.maxQueuedMessages || charge > availableBytes) {
      throw new NdJsonQueueLimitError(
        this.limits.maxQueuedMessages,
        this.limits.maxQueuedBytes,
        charge,
        availableBytes
      );
    }
    const charges = this.getCharges(value, true);
    charges.push(charge);
    this.retainedCount++;
    this.retainedBytes += charge;
  }
  releaseMessage(message) {
    if (!isPlainRecord(message) || Object.hasOwn(message, "method") || !Object.hasOwn(message, "id")) {
      return;
    }
    const value = Object.hasOwn(message, "result") ? message["result"] : message["error"];
    const charges = this.getCharges(value, false);
    if (!charges) return;
    const charge = charges.shift();
    if (charge === void 0) return;
    if (charges.length === 0 && !isObjectValue(value)) {
      this.primitiveCharges.delete(value);
    }
    this.retainedCount--;
    this.retainedBytes -= charge;
  }
  close() {
    this.closed = true;
    this.objectCharges = /* @__PURE__ */ new WeakMap();
    this.primitiveCharges.clear();
    this.retainedCount = 0;
    this.retainedBytes = 0;
  }
  getCharges(value, create) {
    const charges = isObjectValue(value) ? this.objectCharges.get(value) : this.primitiveCharges.get(value);
    if (charges || !create) return charges;
    const created = [];
    if (isObjectValue(value)) {
      this.objectCharges.set(value, created);
    } else {
      this.primitiveCharges.set(value, created);
    }
    return created;
  }
};
var OutboundOperationBudget = class {
  constructor(limits) {
    this.limits = limits;
  }
  static {
    __name(this, "OutboundOperationBudget");
  }
  retainedCount = 0;
  retainedBytes = 0;
  generation = 0;
  closed = false;
  reserve(value) {
    if (this.closed) return () => {
    };
    const availableBytes = Math.max(
      0,
      this.limits.maxQueuedBytes - this.retainedBytes
    );
    const envelopeBytes = Math.min(2048, this.limits.maxQueuedBytes);
    const charge = envelopeBytes + estimatePreparedResponseBytes(
      value,
      Math.max(0, availableBytes - envelopeBytes)
    );
    if (this.retainedCount >= this.limits.maxQueuedMessages || charge > availableBytes) {
      throw new NdJsonQueueLimitError(
        this.limits.maxQueuedMessages,
        this.limits.maxQueuedBytes,
        charge,
        availableBytes
      );
    }
    this.retainedCount++;
    this.retainedBytes += charge;
    const generation = this.generation;
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      if (this.closed || this.generation !== generation) return;
      this.retainedCount--;
      this.retainedBytes -= charge;
    };
  }
  close() {
    this.closed = true;
    this.generation++;
    this.retainedCount = 0;
    this.retainedBytes = 0;
  }
};
function* enumerableOwnKeys(value) {
  for (const key in value) {
    if (Object.hasOwn(value, key)) yield key;
  }
}
__name(enumerableOwnKeys, "enumerableOwnKeys");
function estimatePreparedResponseBytes(value, limitBytes) {
  let bytes = 0;
  const stack = [{ kind: "value", value }];
  const seen = /* @__PURE__ */ new WeakSet();
  while (stack.length > 0) {
    const frame = stack.pop();
    if (frame.kind === "array") {
      if (frame.index >= frame.value.length) continue;
      if (frame.index > 0) bytes++;
      if (bytes > limitBytes) return limitBytes + 1;
      const descriptor = Object.getOwnPropertyDescriptor(
        frame.value,
        String(frame.index)
      );
      if (descriptor?.get || descriptor?.set) return limitBytes + 1;
      stack.push({ ...frame, index: frame.index + 1 });
      stack.push({ kind: "value", value: descriptor?.value });
      continue;
    }
    if (frame.kind === "record") {
      const next = frame.keys.next();
      if (next.done) continue;
      const descriptor = Object.getOwnPropertyDescriptor(
        frame.value,
        next.value
      );
      if (!descriptor || descriptor.get || descriptor.set) {
        return limitBytes + 1;
      }
      bytes += (frame.first ? 0 : 1) + estimateJsonStringBytes(next.value, Math.max(0, limitBytes - bytes)) + 1;
      if (bytes > limitBytes) return limitBytes + 1;
      stack.push({ ...frame, first: false });
      stack.push({ kind: "value", value: descriptor.value });
      continue;
    }
    const current = frame.value;
    if (current === null) {
      bytes += 4;
    } else if (current === void 0) {
      bytes += 4;
    } else if (typeof current === "string") {
      bytes += estimateJsonStringBytes(
        current,
        Math.max(0, limitBytes - bytes)
      );
    } else if (typeof current === "number") {
      bytes += 24;
    } else if (typeof current === "boolean") {
      bytes += 5;
    } else if (Array.isArray(current)) {
      if (seen.has(current) || Object.hasOwn(current, "toJSON")) {
        return limitBytes + 1;
      }
      seen.add(current);
      bytes += 2;
      stack.push({ kind: "array", value: current, index: 0 });
    } else if (isPlainRecord(current)) {
      if (seen.has(current) || Object.hasOwn(current, "toJSON")) {
        return limitBytes + 1;
      }
      seen.add(current);
      bytes += 2;
      stack.push({
        kind: "record",
        value: current,
        keys: enumerableOwnKeys(current),
        first: true
      });
    } else {
      return limitBytes + 1;
    }
    if (bytes > limitBytes) return limitBytes + 1;
  }
  return Math.max(1, bytes);
}
__name(estimatePreparedResponseBytes, "estimatePreparedResponseBytes");
function isObjectValue(value) {
  return typeof value === "object" && value !== null;
}
__name(isObjectValue, "isObjectValue");
function isPlainRecord(value) {
  if (!isObjectValue(value) || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
__name(isPlainRecord, "isPlainRecord");
function getAcpMemoryArgs() {
  if (cachedMemoryArgs) return cachedMemoryArgs;
  const constrainedMemory = process.constrainedMemory;
  const constrained = typeof constrainedMemory === "function" ? constrainedMemory() : 0;
  const totalBytes = constrained && constrained > 0 ? constrained : os.totalmem();
  const totalMB = Math.floor(totalBytes / (1024 * 1024));
  const targetMB = Math.min(Math.floor(totalMB * 0.5), 16384);
  const currentLimitMB = Math.floor(
    getHeapStatistics().heap_size_limit / (1024 * 1024)
  );
  cachedMemoryArgs = [
    ...targetMB > currentLimitMB ? [`--max-old-space-size=${targetMB}`] : [],
    "--expose-gc"
  ];
  return cachedMemoryArgs;
}
__name(getAcpMemoryArgs, "getAcpMemoryArgs");
function createStderrForwarder(opts) {
  const { prefix, onDiagnosticLine } = opts;
  const STDERR_LINE_CAP_CHARS = 64 * 1024;
  let buf = "";
  const flush = /* @__PURE__ */ __name((line) => {
    if (line.length > 0) {
      const safe = redactLogCredentials(line);
      process.stderr.write(prefix + safe + "\n");
      if (onDiagnosticLine) onDiagnosticLine(prefix + safe, "warn");
    }
  }, "flush");
  return {
    onData(chunk) {
      buf += chunk;
      let nl = buf.indexOf("\n");
      while (nl !== -1) {
        flush(buf.slice(0, nl));
        buf = buf.slice(nl + 1);
        nl = buf.indexOf("\n");
      }
      while (buf.length > STDERR_LINE_CAP_CHARS) {
        const truncated = redactLogCredentials(buf.slice(0, STDERR_LINE_CAP_CHARS)) + " [truncated]";
        process.stderr.write(prefix + truncated + "\n");
        if (onDiagnosticLine) onDiagnosticLine(prefix + truncated, "warn");
        buf = buf.slice(STDERR_LINE_CAP_CHARS);
      }
    },
    onEnd() {
      if (buf.length > 0) flush(buf);
    }
  };
}
__name(createStderrForwarder, "createStderrForwarder");
function createSpawnChannelFactory(options = {}) {
  if (options.pipeLimits) validateNdJsonStreamLimits(options.pipeLimits);
  const processRegistry = options.processRegistry ?? new ProcessRegistry();
  return async (workspaceCwd, childEnvOverrides) => {
    const sourceEnv = options.sourceEnv ?? process.env;
    const cliEntry = sourceEnv["QWEN_CLI_ENTRY"] || process.argv[1];
    if (!cliEntry) {
      throw new MissingCliEntryError();
    }
    const childEnv = scrubChildEnv(
      sourceEnv,
      SCRUBBED_CHILD_ENV_KEYS,
      childEnvOverrides
    );
    childEnv["QWEN_CODE_NO_RELAUNCH"] = "true";
    childEnv["QWEN_CODE_SERVE"] = "1";
    const execArgs = process.execArgv.filter(
      (a) => !/^--inspect(-brk)?($|=)/.test(a)
    );
    const reservation = processRegistry.reserve();
    let child;
    try {
      options.childHeapPolicy?.decide(processRegistry.committedProcessCount);
      const memoryArgs = getAcpMemoryArgs();
      child = spawn(
        process.execPath,
        [
          ...execArgs,
          ...memoryArgs,
          cliEntry,
          "--acp",
          ...options.extraArgs ?? []
        ],
        {
          cwd: workspaceCwd,
          stdio: ["pipe", "pipe", "pipe"],
          windowsHide: true,
          env: childEnv
        }
      );
    } catch (error) {
      reservation.cancel();
      throw error;
    }
    const trackedChild = reservation.attach(child);
    if (child.stderr) {
      const prefix = `[serve pid=${child.pid} cwd=${workspaceCwd}] `;
      const forwarder = createStderrForwarder({
        prefix,
        onDiagnosticLine: options.onDiagnosticLine
      });
      child.stderr.setEncoding("utf8");
      child.stderr.on("data", forwarder.onData);
      child.stderr.on("end", forwarder.onEnd);
      child.stderr.on("error", () => {
      });
    }
    if (!child.stdin || !child.stdout) {
      trackedChild.killSync();
      throw new Error(
        "Spawned ACP child has no stdin/stdout \u2014 cannot establish NDJSON channel."
      );
    }
    const writable = Writable.toWeb(child.stdin);
    const readable = Readable.toWeb(child.stdout);
    const preparedResponses = options.pipeLimits ? new PreparedResponseBudget(options.pipeLimits) : void 0;
    const outboundOperations = options.pipeLimits ? new OutboundOperationBudget(options.pipeLimits) : void 0;
    let reportTransportFailure;
    let transportFailureReported = false;
    const transportFailed = options.pipeLimits ? new Promise((resolve) => {
      reportTransportFailure = resolve;
    }) : void 0;
    const failTransport = options.pipeLimits ? (error) => {
      if (transportFailureReported) return;
      transportFailureReported = true;
      reportTransportFailure?.(error);
      reportTransportFailure = void 0;
      preparedResponses?.close();
      outboundOperations?.close();
      child.stdout?.destroy();
      child.stdin?.destroy();
      void trackedChild.terminate().catch(() => {
      });
      options.pipeHooks?.onTransportError?.(error);
    } : void 0;
    const pipeHooks = options.pipeLimits ? {
      ...options.pipeHooks,
      onMessageObserved: /* @__PURE__ */ __name((observation) => {
        if (observation.direction === "sent") {
          preparedResponses?.releaseMessage(observation.message);
        }
        options.pipeHooks?.onMessageObserved?.(observation);
      }, "onMessageObserved"),
      onTransportError: failTransport
    } : options.pipeHooks;
    const stream = ndJsonStream(
      writable,
      readable,
      pipeHooks,
      options.pipeLimits,
      options.pipeLimits ? validateDaemonInboundMessage : void 0,
      options.pipeLimits !== void 0
    );
    return {
      stream,
      ...transportFailed ? { transportFailed } : {},
      ...failTransport && options.pipeLimits ? {
        transportGuard: {
          maxActiveHandlers: options.pipeLimits.maxQueuedMessages,
          maxActiveHandlerBytes: options.pipeLimits.maxQueuedBytes,
          reserveOutboundOperation: /* @__PURE__ */ __name((value) => {
            try {
              return outboundOperations?.reserve(value) ?? (() => {
              });
            } catch (error) {
              failTransport(error);
              throw error;
            }
          }, "reserveOutboundOperation"),
          reservePreparedResponse: /* @__PURE__ */ __name((value) => {
            try {
              preparedResponses?.reserve(value);
            } catch (error) {
              failTransport(error);
              throw error;
            }
          }, "reservePreparedResponse"),
          fail: failTransport
        }
      } : {},
      kill: /* @__PURE__ */ __name(() => trackedChild.terminate(), "kill"),
      killSync: /* @__PURE__ */ __name(() => trackedChild.killSync(), "killSync"),
      exited: trackedChild.exited
    };
  };
}
__name(createSpawnChannelFactory, "createSpawnChannelFactory");
var defaultSpawnChannelFactory = createSpawnChannelFactory();
var SCRUBBED_CHILD_ENV_KEYS = /* @__PURE__ */ new Set([
  "QWEN_SERVER_TOKEN",
  "QWEN_CODE_SIMPLE",
  EXTERNAL_TOOL_GUARD_TOKEN_ENV
]);
function scrubChildEnv(source, scrubbed, overrides) {
  const childEnv = { ...source };
  for (const key of scrubbed) {
    delete childEnv[key];
  }
  if (overrides) {
    for (const [key, value] of Object.entries(overrides)) {
      if (scrubbed.has(key)) continue;
      if (value === void 0) {
        delete childEnv[key];
      } else {
        childEnv[key] = value;
      }
    }
  }
  return childEnv;
}
__name(scrubChildEnv, "scrubChildEnv");

export {
  DAEMON_ACP_NDJSON_LIMITS,
  getAcpMemoryArgs,
  createStderrForwarder,
  createSpawnChannelFactory,
  defaultSpawnChannelFactory,
  scrubChildEnv
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
