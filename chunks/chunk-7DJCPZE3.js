// Force strict mode and setup for ESM
"use strict";
import {
  stringifyGenAiJson
} from "./chunk-Y3QL45LS.js";
import {
  DEFAULT_SENSITIVE_SPAN_ATTRIBUTE_MAX_LENGTH,
  SENSITIVE_SPAN_ATTRIBUTE_MAX_LENGTH_LIMIT,
  SERVICE_NAME,
  getMeter,
  isTelemetrySdkInitialized,
  isValidSensitiveSpanAttributeMaxLength
} from "./chunk-L6BZRIUL.js";
import {
  FatalConfigError,
  createDebugLogger
} from "./chunk-UHQFIS7N.js";
import {
  ValueType,
  diag,
  init_esm
} from "./chunk-TBWQLLFO.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/telemetry/config.ts
init_esbuild_shims();

// packages/core/src/telemetry/index.ts
init_esbuild_shims();

// packages/core/src/telemetry/daemon-metrics.ts
init_esbuild_shims();
init_esm();
var DAEMON_HTTP_REQUEST_COUNT = `${SERVICE_NAME}.daemon.http.request.count`;
var DAEMON_HTTP_REQUEST_DURATION = `${SERVICE_NAME}.daemon.http.request.duration`;
var DAEMON_SESSION_ACTIVE = `${SERVICE_NAME}.daemon.session.active`;
var DAEMON_SESSION_LIFECYCLE = `${SERVICE_NAME}.daemon.session.lifecycle`;
var DAEMON_CHANNEL_LIFECYCLE = `${SERVICE_NAME}.daemon.channel.lifecycle`;
var DAEMON_PROMPT_QUEUE_WAIT = `${SERVICE_NAME}.daemon.prompt.queue_wait`;
var DAEMON_PROMPT_DURATION = `${SERVICE_NAME}.daemon.prompt.duration`;
var DAEMON_BRIDGE_ERROR_COUNT = `${SERVICE_NAME}.daemon.bridge.error.count`;
var DAEMON_CANCEL_COUNT = `${SERVICE_NAME}.daemon.cancel.count`;
var DAEMON_PIPE_MESSAGE_BYTES = `${SERVICE_NAME}.daemon.pipe.message_bytes`;
var DAEMON_SSE_ACTIVE = `${SERVICE_NAME}.daemon.sse.active`;
var DAEMON_PROCESS_HEAP_USED = `${SERVICE_NAME}.daemon.process.heap_used`;
var KNOWN_ERROR_TYPES = /* @__PURE__ */ new Set([
  "SessionNotFoundError",
  "WorkspaceMismatchError",
  "InvalidClientIdError",
  "SessionLimitExceededError",
  "RestoreInProgressError",
  "InvalidSessionScopeError",
  "TrustGateError",
  "WorkspaceInitConflictError",
  "WorkspaceInitPathEscapeError",
  "WorkspaceInitSymlinkError",
  "WorkspaceInitRaceError",
  "McpServerNotFoundError",
  "McpServerRestartFailedError",
  "PromptDeadlineExceededError",
  "InvalidSessionMetadataError",
  "SubscriberLimitExceededError",
  "BridgeChannelClosedError",
  "BridgeTimeoutError",
  "SessionRestoreTimeoutError",
  "BridgeChannelQuarantinedError",
  "PermissionForbiddenError"
]);
var initialized = false;
var httpRequestCounter;
var httpRequestDurationHistogram;
var sessionLifecycleCounter;
var channelLifecycleCounter;
var promptQueueWaitHistogram;
var promptDurationHistogram;
var bridgeErrorCounter;
var cancelCounter;
var pipeMessageBytesHistogram;
function normalizeErrorType(err) {
  const name = err instanceof Error ? err.name : typeof err;
  return KNOWN_ERROR_TYPES.has(name) ? name : "unknown";
}
__name(normalizeErrorType, "normalizeErrorType");
function initializeDaemonMetrics() {
  if (initialized) return;
  const meter = getMeter();
  if (!meter) return;
  httpRequestCounter = meter.createCounter(DAEMON_HTTP_REQUEST_COUNT, {
    description: "Daemon HTTP request count by route and status class.",
    valueType: ValueType.INT
  });
  httpRequestDurationHistogram = meter.createHistogram(
    DAEMON_HTTP_REQUEST_DURATION,
    {
      description: "Daemon HTTP request duration in milliseconds.",
      unit: "ms",
      valueType: ValueType.DOUBLE,
      advice: {
        explicitBucketBoundaries: [
          1,
          2,
          5,
          10,
          25,
          50,
          100,
          250,
          500,
          1e3,
          2500,
          5e3,
          1e4,
          3e4
        ]
      }
    }
  );
  sessionLifecycleCounter = meter.createCounter(DAEMON_SESSION_LIFECYCLE, {
    description: "Daemon session lifecycle events (spawn, close, die).",
    valueType: ValueType.INT
  });
  channelLifecycleCounter = meter.createCounter(DAEMON_CHANNEL_LIFECYCLE, {
    description: "Daemon ACP channel lifecycle events (spawn, exit).",
    valueType: ValueType.INT
  });
  promptQueueWaitHistogram = meter.createHistogram(DAEMON_PROMPT_QUEUE_WAIT, {
    description: "Time a prompt waited in the per-session FIFO queue.",
    unit: "ms",
    valueType: ValueType.DOUBLE,
    advice: {
      explicitBucketBoundaries: [
        1,
        5,
        10,
        50,
        100,
        500,
        1e3,
        5e3,
        1e4,
        3e4,
        6e4
      ]
    }
  });
  promptDurationHistogram = meter.createHistogram(DAEMON_PROMPT_DURATION, {
    description: "End-to-end prompt duration from dispatch to completion.",
    unit: "ms",
    valueType: ValueType.DOUBLE,
    advice: {
      explicitBucketBoundaries: [
        100,
        500,
        1e3,
        2500,
        5e3,
        1e4,
        3e4,
        6e4,
        12e4,
        3e5,
        6e5
      ]
    }
  });
  bridgeErrorCounter = meter.createCounter(DAEMON_BRIDGE_ERROR_COUNT, {
    description: "Daemon bridge error count by normalized error type.",
    valueType: ValueType.INT
  });
  cancelCounter = meter.createCounter(DAEMON_CANCEL_COUNT, {
    description: "Daemon cancel request count.",
    valueType: ValueType.INT
  });
  pipeMessageBytesHistogram = meter.createHistogram(DAEMON_PIPE_MESSAGE_BYTES, {
    description: "Daemon ACP child pipe message payload size in bytes.",
    unit: "By",
    valueType: ValueType.INT,
    advice: {
      explicitBucketBoundaries: [
        256,
        1024,
        4096,
        16384,
        65536,
        262144,
        1048576,
        4194304,
        16777216
      ]
    }
  });
  initialized = true;
}
__name(initializeDaemonMetrics, "initializeDaemonMetrics");
var gaugesRegistered = false;
function registerDaemonGaugeCallbacks(callbacks) {
  if (gaugesRegistered) return;
  const meter = getMeter();
  if (!meter) return;
  meter.createObservableGauge(DAEMON_SESSION_ACTIVE, {
    description: "Current number of active daemon sessions.",
    valueType: ValueType.INT
  }).addCallback((result) => {
    try {
      result.observe(callbacks.sessionCount());
    } catch {
    }
  });
  meter.createObservableGauge(DAEMON_SSE_ACTIVE, {
    description: "Current number of active SSE connections.",
    valueType: ValueType.INT
  }).addCallback((result) => {
    try {
      result.observe(callbacks.sseCount());
    } catch {
    }
  });
  meter.createObservableGauge(DAEMON_PROCESS_HEAP_USED, {
    description: "Daemon process heap memory usage in bytes.",
    unit: "bytes",
    valueType: ValueType.INT
  }).addCallback((result) => {
    try {
      result.observe(callbacks.heapUsed());
    } catch {
    }
  });
  gaugesRegistered = true;
}
__name(registerDaemonGaugeCallbacks, "registerDaemonGaugeCallbacks");
function recordDaemonHttpRequest(durationMs, route, statusCode, deferredRuntimePath) {
  if (!initialized) return;
  const statusClass = `${Math.floor(statusCode / 100)}xx`;
  httpRequestCounter?.add(1, { route, status_class: statusClass });
  httpRequestDurationHistogram?.record(durationMs, {
    route,
    runtime_path: deferredRuntimePath ?? "none"
  });
}
__name(recordDaemonHttpRequest, "recordDaemonHttpRequest");
function recordDaemonSessionLifecycle(action) {
  if (!initialized) return;
  sessionLifecycleCounter?.add(1, { action });
}
__name(recordDaemonSessionLifecycle, "recordDaemonSessionLifecycle");
function recordDaemonChannelLifecycle(action, expected) {
  if (!initialized) return;
  channelLifecycleCounter?.add(1, {
    action,
    ...expected != null ? { expected } : {}
  });
}
__name(recordDaemonChannelLifecycle, "recordDaemonChannelLifecycle");
function recordDaemonPromptQueueWait(durationMs) {
  if (!initialized) return;
  promptQueueWaitHistogram?.record(durationMs);
}
__name(recordDaemonPromptQueueWait, "recordDaemonPromptQueueWait");
function recordDaemonPromptDuration(durationMs) {
  if (!initialized) return;
  promptDurationHistogram?.record(durationMs);
}
__name(recordDaemonPromptDuration, "recordDaemonPromptDuration");
function recordDaemonBridgeError(err) {
  if (!initialized) return;
  bridgeErrorCounter?.add(1, { error_type: normalizeErrorType(err) });
}
__name(recordDaemonBridgeError, "recordDaemonBridgeError");
function recordDaemonCancel() {
  if (!initialized) return;
  cancelCounter?.add(1);
}
__name(recordDaemonCancel, "recordDaemonCancel");
function recordDaemonPipeMessage(direction, bytes) {
  if (!initialized) return;
  pipeMessageBytesHistogram?.record(bytes, { direction });
}
__name(recordDaemonPipeMessage, "recordDaemonPipeMessage");

// packages/core/src/telemetry/event-loop-lag.ts
init_esbuild_shims();
import { monitorEventLoopDelay } from "node:perf_hooks";
var DEFAULT_RESOLUTION_MS = 20;
var DEFAULT_STALL_THRESHOLD_MS = 1e3;
var DEFAULT_EVENT_LOOP_SUSPEND_THRESHOLD_MS = 5 * 60 * 1e3;
var DEFAULT_SUSPEND_CPU_RATIO = 0.01;
var NS_PER_MS = 1e6;
function startEventLoopLagMonitor(options = {}) {
  const resolutionMs = positiveFiniteOrDefault(
    options.resolutionMs,
    DEFAULT_RESOLUTION_MS
  );
  const stallThresholdMs = positiveFiniteOrDefault(
    options.stallThresholdMs,
    DEFAULT_STALL_THRESHOLD_MS
  );
  const suspendThresholdMs = positiveFiniteOrDefault(
    options.suspendThresholdMs,
    DEFAULT_EVENT_LOOP_SUSPEND_THRESHOLD_MS
  );
  const suspendCpuRatio = fractionOrDefault(
    options.suspendCpuRatio,
    DEFAULT_SUSPEND_CPU_RATIO
  );
  const histogram = monitorEventLoopDelay({ resolution: resolutionMs });
  histogram.enable();
  let disposed = false;
  let lastReportedMaxMs = 0;
  let lastObservedMaxMs = 0;
  let lastCheckTimeMs = Date.now();
  let lastCpuUsage = safeCpuUsage();
  let pendingSuspendGapMs = 0;
  const readMaxMs = /* @__PURE__ */ __name(() => nsToMs(histogram.max), "readMaxMs");
  const checkHistogram = /* @__PURE__ */ __name(() => {
    if (disposed) return;
    const nowMs = Date.now();
    const cpuUsage = safeCpuUsage();
    const elapsedMs = Math.max(0, nowMs - lastCheckTimeMs);
    const maxMs = readMaxMs();
    const newMaxMs = maxMs > lastObservedMaxMs ? maxMs : 0;
    const cpuRatio = calculateCpuRatio(lastCpuUsage, cpuUsage, elapsedMs);
    lastCheckTimeMs = nowMs;
    if (cpuUsage) lastCpuUsage = cpuUsage;
    lastObservedMaxMs = maxMs;
    const isLowCpuGap = elapsedMs >= suspendThresholdMs && cpuRatio !== void 0 && cpuRatio <= suspendCpuRatio;
    const suspendGapMs = isLowCpuGap ? elapsedMs : pendingSuspendGapMs;
    pendingSuspendGapMs = isLowCpuGap ? elapsedMs : 0;
    if (newMaxMs >= suspendThresholdMs && suspendGapMs >= suspendThresholdMs && newMaxMs <= suspendGapMs * 1.5) {
      histogram.reset();
      lastObservedMaxMs = 0;
      lastReportedMaxMs = 0;
      pendingSuspendGapMs = 0;
      return;
    }
    if (options.onNewMaxStall && maxMs >= stallThresholdMs && maxMs > lastReportedMaxMs) {
      lastReportedMaxMs = maxMs;
      try {
        options.onNewMaxStall(maxMs);
      } catch {
      }
    }
  }, "checkHistogram");
  const interval = setInterval(checkHistogram, resolutionMs);
  interval.unref();
  return {
    snapshot() {
      return {
        meanMs: nsToMs(histogram.mean),
        p50Ms: nsToMs(histogram.percentile(50)),
        p99Ms: nsToMs(histogram.percentile(99)),
        maxMs: readMaxMs()
      };
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      clearInterval(interval);
      histogram.disable();
    }
  };
}
__name(startEventLoopLagMonitor, "startEventLoopLagMonitor");
function safeCpuUsage() {
  try {
    return process.cpuUsage();
  } catch {
    return void 0;
  }
}
__name(safeCpuUsage, "safeCpuUsage");
function calculateCpuRatio(previous, current, elapsedMs) {
  if (!previous || !current || elapsedMs <= 0) return void 0;
  const cpuMicroseconds = current.user - previous.user + (current.system - previous.system);
  return Math.max(0, cpuMicroseconds / (elapsedMs * 1e3));
}
__name(calculateCpuRatio, "calculateCpuRatio");
function nsToMs(value) {
  return Number.isFinite(value) ? value / NS_PER_MS : 0;
}
__name(nsToMs, "nsToMs");
function positiveFiniteOrDefault(value, fallback) {
  return value !== void 0 && Number.isFinite(value) && value > 0 ? value : fallback;
}
__name(positiveFiniteOrDefault, "positiveFiniteOrDefault");
function fractionOrDefault(value, fallback) {
  return value !== void 0 && Number.isFinite(value) && value >= 0 && value <= 1 ? value : fallback;
}
__name(fractionOrDefault, "fractionOrDefault");

// packages/core/src/telemetry/event-loop-lag-metrics.ts
init_esbuild_shims();
init_esm();
var DAEMON_EVENT_LOOP_LAG = `${SERVICE_NAME}.daemon.event_loop.lag`;
var ACP_EVENT_LOOP_LAG = `${SERVICE_NAME}.acp.event_loop.lag`;
var daemonGaugeRegistered = false;
var acpGaugeRegistered = false;
function registerDaemonEventLoopLagGauge(read) {
  if (daemonGaugeRegistered) return;
  daemonGaugeRegistered = registerEventLoopLagGauge(
    DAEMON_EVENT_LOOP_LAG,
    read
  );
}
__name(registerDaemonEventLoopLagGauge, "registerDaemonEventLoopLagGauge");
function registerAcpEventLoopLagGauge(read) {
  if (acpGaugeRegistered) return;
  acpGaugeRegistered = registerEventLoopLagGauge(ACP_EVENT_LOOP_LAG, read);
}
__name(registerAcpEventLoopLagGauge, "registerAcpEventLoopLagGauge");
function registerEventLoopLagGauge(name, read) {
  const meter = getMeter();
  if (!meter) return false;
  meter.createObservableGauge(name, {
    description: "Event loop lag in milliseconds.",
    unit: "ms",
    valueType: ValueType.DOUBLE
  }).addCallback((result) => {
    try {
      const snapshot = read();
      result.observe(snapshot.meanMs, { stat: "mean" });
      result.observe(snapshot.p50Ms, { stat: "p50" });
      result.observe(snapshot.p99Ms, { stat: "p99" });
      result.observe(snapshot.maxMs, { stat: "max" });
    } catch {
    }
  });
  return true;
}
__name(registerEventLoopLagGauge, "registerEventLoopLagGauge");

// packages/core/src/telemetry/detailed-span-attributes.ts
init_esbuild_shims();
var SHORT_TRUNCATION_SUFFIX = "...[TRUNCATED]";
var debugLogger = createDebugLogger("GEN_AI_CONTENT");
function areSensitiveSpanAttributesEnabled(config) {
  return isTelemetrySdkInitialized() && config.getTelemetryIncludeSensitiveSpanAttributes();
}
__name(areSensitiveSpanAttributesEnabled, "areSensitiveSpanAttributesEnabled");
function truncateContent(content, maxSize = DEFAULT_SENSITIVE_SPAN_ATTRIBUTE_MAX_LENGTH, originalLength = content.length) {
  if (!Number.isSafeInteger(maxSize) || maxSize < 1) {
    throw new TypeError(
      `maxSize must be a positive safe integer, got ${String(maxSize)}`
    );
  }
  if (!Number.isSafeInteger(originalLength) || originalLength < 0) {
    throw new TypeError(
      `originalLength must be a non-negative safe integer, got ${String(
        originalLength
      )}`
    );
  }
  if (originalLength < content.length) {
    throw new TypeError(
      `originalLength must be greater than or equal to content length, got ${originalLength} for content length ${content.length}`
    );
  }
  if (originalLength <= maxSize && content.length <= maxSize) {
    return { content, truncated: false };
  }
  if (originalLength > content.length && content.length <= maxSize) {
    return { content, truncated: true };
  }
  const suffix = `

[TRUNCATED - Content exceeds configured limit of ${maxSize} characters]`;
  if (suffix.length >= maxSize) {
    if (SHORT_TRUNCATION_SUFFIX.length >= maxSize) {
      return {
        content: SHORT_TRUNCATION_SUFFIX.slice(0, maxSize),
        truncated: true
      };
    }
    return {
      content: content.slice(0, maxSize - SHORT_TRUNCATION_SUFFIX.length) + SHORT_TRUNCATION_SUFFIX,
      truncated: true
    };
  }
  return {
    content: content.slice(0, maxSize - suffix.length) + suffix,
    truncated: true
  };
}
__name(truncateContent, "truncateContent");
function getMaxContentSize(config) {
  return config.getTelemetrySensitiveSpanAttributeMaxLength();
}
__name(getMaxContentSize, "getMaxContentSize");
function truncatePrefixedContent(prefix, content, maxSize) {
  const prefixedContent = `${prefix}${content}`;
  const result = truncateContent(prefixedContent, maxSize);
  return {
    ...result,
    originalLength: content.length
  };
}
__name(truncatePrefixedContent, "truncatePrefixedContent");
function addAgentInputMessageAttributes(config, span, promptText) {
  if (!areSensitiveSpanAttributesEnabled(config) || promptText.trim().length === 0) {
    return;
  }
  writeJsonAttribute(config, span, "gen_ai.input.messages", [
    {
      role: "user",
      parts: [{ type: "text", content: promptText }]
    }
  ]);
}
__name(addAgentInputMessageAttributes, "addAgentInputMessageAttributes");
function addAgentOutputMessageAttributes(config, span, responseText, finishReason) {
  if (!areSensitiveSpanAttributesEnabled(config) || responseText.trim().length === 0) {
    return;
  }
  const reason = normalizeAgentFinishReason(finishReason);
  if (!reason) return;
  writeJsonAttribute(config, span, "gen_ai.output.messages", [
    {
      role: "assistant",
      parts: [{ type: "text", content: responseText }],
      finish_reason: reason
    }
  ]);
}
__name(addAgentOutputMessageAttributes, "addAgentOutputMessageAttributes");
function normalizeAgentFinishReason(finishReason) {
  const reason = finishReason?.trim().toLowerCase();
  if (!reason || reason === "finish_reason_unspecified") return void 0;
  if (reason === "stop") return "stop";
  if (reason === "max_tokens") return "length";
  if (reason === "tool_calls" || reason === "function_call" || reason === "tool_call") {
    return "tool_call";
  }
  if (reason === "safety" || reason === "recitation" || reason === "language" || reason === "blocklist" || reason === "prohibited_content" || reason === "spii" || reason === "image_safety" || reason === "image_prohibited_content" || reason === "image_recitation" || reason === "image_other") {
    return "content_filter";
  }
  return reason;
}
__name(normalizeAgentFinishReason, "normalizeAgentFinishReason");
var AgentOutputMessageCapture = class {
  constructor(config) {
    this.config = config;
    this.enabled = areSensitiveSpanAttributesEnabled(config);
    this.maxLength = this.enabled ? config.getTelemetrySensitiveSpanAttributeMaxLength() : 0;
  }
  static {
    __name(this, "AgentOutputMessageCapture");
  }
  enabled;
  maxLength;
  responseText = "";
  finishReason;
  overflow = false;
  committed;
  beginResponse() {
    if (!this.enabled) return;
    this.clearResponse();
    this.committed = void 0;
  }
  appendText(text) {
    if (!this.enabled || !text || this.overflow) return;
    const remaining = this.maxLength - this.responseText.length;
    if (text.length > remaining) {
      this.responseText = "";
      this.overflow = true;
      this.committed = void 0;
      return;
    }
    this.responseText += text;
  }
  observeFinishReason(finishReason) {
    if (!this.enabled) return;
    const normalized = normalizeAgentFinishReason(finishReason);
    if (normalized) this.finishReason = normalized;
  }
  restartAttempt(preserveText) {
    if (!this.enabled) return;
    if (!preserveText) {
      this.clearResponse();
    } else {
      this.finishReason = void 0;
    }
    this.committed = void 0;
  }
  commitResponse(hasToolCalls) {
    if (!this.enabled || hasToolCalls || this.overflow || this.responseText.trim().length === 0 || !this.finishReason) {
      this.committed = void 0;
      return;
    }
    this.committed = {
      responseText: this.responseText,
      finishReason: this.finishReason
    };
  }
  writeToSpan(span) {
    if (!span || !this.committed) return;
    addAgentOutputMessageAttributes(
      this.config,
      span,
      this.committed.responseText,
      this.committed.finishReason
    );
  }
  clearResponse() {
    this.responseText = "";
    this.finishReason = void 0;
    this.overflow = false;
  }
};
function addUserPromptAttributes(config, span, promptText) {
  if (!areSensitiveSpanAttributesEnabled(config) || !promptText) return;
  const { content, truncated, originalLength } = truncatePrefixedContent(
    `[USER PROMPT]
`,
    promptText,
    getMaxContentSize(config)
  );
  span.setAttributes({
    new_context: content,
    ...truncated && {
      new_context_truncated: true,
      new_context_original_length: originalLength
    }
  });
}
__name(addUserPromptAttributes, "addUserPromptAttributes");
function addToolArgumentsAttributes(config, span, argumentsValue) {
  if (!areSensitiveSpanAttributesEnabled(config)) return;
  writeJsonAttribute(
    config,
    span,
    "gen_ai.tool.call.arguments",
    argumentsValue,
    true
  );
}
__name(addToolArgumentsAttributes, "addToolArgumentsAttributes");
function addToolCallResultAttributes(config, span, result) {
  if (!areSensitiveSpanAttributesEnabled(config)) return;
  writeJsonAttribute(config, span, "gen_ai.tool.call.result", result, true);
}
__name(addToolCallResultAttributes, "addToolCallResultAttributes");
function writeJsonAttribute(config, span, key, value, requireObject = false) {
  let serialized;
  try {
    serialized = stringifyGenAiJson(
      value,
      getMaxContentSize(config),
      requireObject
    );
  } catch {
    debugLogger.debug(`Failed to serialize ${key} span attribute`);
    return;
  }
  if (serialized === void 0) return;
  try {
    span.setAttribute(key, serialized);
  } catch {
    debugLogger.debug(`Failed to set ${key} span attribute`);
  }
}
__name(writeJsonAttribute, "writeJsonAttribute");

// packages/core/src/telemetry/index.ts
var DEFAULT_TELEMETRY_TARGET = "local" /* LOCAL */;
var DEFAULT_OTLP_ENDPOINT = "http://localhost:4317";

// packages/core/src/telemetry/resource-attributes.ts
init_esbuild_shims();
init_esm();
var RESERVED_RESOURCE_ATTRIBUTE_KEYS = /* @__PURE__ */ new Set([
  "service.version",
  "session.id"
]);
function warn(msg, warnings) {
  diag.warn(msg);
  warnings?.push(msg);
}
__name(warn, "warn");
function parseOtelResourceAttributes(raw, warnings) {
  if (!raw) return {};
  const out = {};
  for (const pair of raw.split(",")) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) {
      warn(
        `Skipping malformed OTEL_RESOURCE_ATTRIBUTES entry: "${trimmed}" (hint: percent-encode literal commas as %2C)`,
        warnings
      );
      continue;
    }
    const rawKey = trimmed.slice(0, idx).trim();
    if (!rawKey) continue;
    const valueRaw = trimmed.slice(idx + 1).trim();
    let key;
    try {
      key = decodeURIComponent(rawKey);
    } catch {
      warn(
        `Invalid percent-encoding in OTEL_RESOURCE_ATTRIBUTES key "${rawKey}", using raw key`,
        warnings
      );
      key = rawKey;
    }
    let value;
    try {
      value = decodeURIComponent(valueRaw);
    } catch {
      warn(
        `Invalid percent-encoding in OTEL_RESOURCE_ATTRIBUTES for key "${key}", using raw value`,
        warnings
      );
      value = valueRaw;
    }
    out[key] = value;
  }
  return out;
}
__name(parseOtelResourceAttributes, "parseOtelResourceAttributes");
function stripReservedResourceAttributes(attrs, source, warnings) {
  for (const k of RESERVED_RESOURCE_ATTRIBUTE_KEYS) {
    if (k in attrs) {
      warn(`${source} cannot override reserved key "${k}"; ignoring`, warnings);
      delete attrs[k];
    }
  }
  return attrs;
}
__name(stripReservedResourceAttributes, "stripReservedResourceAttributes");
function coerceStringResourceAttributes(raw, warnings) {
  if (raw === null || raw === void 0) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) {
    warn(
      "settings.telemetry.resourceAttributes must be an object; ignoring",
      warnings
    );
    return {};
  }
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = k.trim();
    if (!key) {
      warn(
        "settings.telemetry.resourceAttributes has an empty or whitespace-only key; ignoring",
        warnings
      );
      continue;
    }
    if (typeof v === "string") {
      out[key] = v;
    } else {
      warn(
        `settings.telemetry.resourceAttributes value for "${key}" must be a string (got ${typeof v}); ignoring`,
        warnings
      );
    }
  }
  return out;
}
__name(coerceStringResourceAttributes, "coerceStringResourceAttributes");

// packages/core/src/telemetry/config.ts
function parseBooleanEnvFlag(value) {
  if (value === void 0) return void 0;
  return value === "true" || value === "1";
}
__name(parseBooleanEnvFlag, "parseBooleanEnvFlag");
function parseTelemetryTargetValue(value) {
  if (value === void 0) return void 0;
  if (value === "local" /* LOCAL */ || value === "local") {
    return "local" /* LOCAL */;
  }
  if (value === "gcp" /* GCP */ || value === "gcp") {
    return "gcp" /* GCP */;
  }
  return void 0;
}
__name(parseTelemetryTargetValue, "parseTelemetryTargetValue");
function parseSensitiveSpanAttributeMaxLengthEnvValue(envName, value) {
  if (value === void 0) return void 0;
  const trimmed = value.trim();
  const parsed = Number(trimmed);
  if (!/^\d+$/.test(trimmed) || !isValidSensitiveSpanAttributeMaxLength(parsed)) {
    throw new FatalConfigError(
      `Invalid ${envName}: must be a positive integer no greater than ${SENSITIVE_SPAN_ATTRIBUTE_MAX_LENGTH_LIMIT}, got '${value}'`
    );
  }
  return parsed;
}
__name(parseSensitiveSpanAttributeMaxLengthEnvValue, "parseSensitiveSpanAttributeMaxLengthEnvValue");
function parseSensitiveSpanAttributeMaxLengthSetting(settingName, value) {
  if (value === void 0) return void 0;
  if (typeof value !== "number" || !isValidSensitiveSpanAttributeMaxLength(value)) {
    throw new FatalConfigError(
      `Invalid ${settingName}: must be a positive integer no greater than ${SENSITIVE_SPAN_ATTRIBUTE_MAX_LENGTH_LIMIT}, got ${String(
        value
      )}`
    );
  }
  return value;
}
__name(parseSensitiveSpanAttributeMaxLengthSetting, "parseSensitiveSpanAttributeMaxLengthSetting");
function parseTelemetryUserId(source, value) {
  if (value === void 0) return void 0;
  if (typeof value !== "string") {
    throw new FatalConfigError(
      `Invalid ${source}: must be a string, got ${typeof value}`
    );
  }
  return value.trim() || void 0;
}
__name(parseTelemetryUserId, "parseTelemetryUserId");
async function resolveTelemetrySettings(options) {
  const argv = options.argv ?? {};
  const env = options.env ?? {};
  const settings = options.settings ?? {};
  const enabled = argv.telemetry ?? parseBooleanEnvFlag(env["QWEN_TELEMETRY_ENABLED"]) ?? settings.enabled;
  const rawTarget = argv.telemetryTarget ?? env["QWEN_TELEMETRY_TARGET"] ?? settings.target;
  const target = parseTelemetryTargetValue(rawTarget);
  if (rawTarget !== void 0 && target === void 0) {
    throw new FatalConfigError(
      `Invalid telemetry target: ${String(
        rawTarget
      )}. Valid values are: local, gcp`
    );
  }
  const otlpEndpoint = argv.telemetryOtlpEndpoint ?? env["QWEN_TELEMETRY_OTLP_ENDPOINT"] ?? env["OTEL_EXPORTER_OTLP_ENDPOINT"] ?? settings.otlpEndpoint;
  const rawProtocol = argv.telemetryOtlpProtocol ?? env["QWEN_TELEMETRY_OTLP_PROTOCOL"] ?? settings.otlpProtocol;
  const otlpProtocol = ["grpc", "http"].find(
    (p) => p === rawProtocol
  );
  if (rawProtocol !== void 0 && otlpProtocol === void 0) {
    throw new FatalConfigError(
      `Invalid telemetry OTLP protocol: ${String(
        rawProtocol
      )}. Valid values are: grpc, http`
    );
  }
  const logPrompts = argv.telemetryLogPrompts ?? parseBooleanEnvFlag(env["QWEN_TELEMETRY_LOG_PROMPTS"]) ?? settings.logPrompts;
  const userId = parseTelemetryUserId(
    "QWEN_TELEMETRY_USER_ID",
    env["QWEN_TELEMETRY_USER_ID"]
  ) ?? parseTelemetryUserId("telemetry.userId", settings.userId);
  const includeSensitiveSpanAttributes = parseBooleanEnvFlag(
    env["QWEN_TELEMETRY_INCLUDE_SENSITIVE_SPAN_ATTRIBUTES"]
  ) ?? settings.includeSensitiveSpanAttributes ?? false;
  const sensitiveSpanAttributeMaxLength = parseSensitiveSpanAttributeMaxLengthEnvValue(
    "QWEN_TELEMETRY_SENSITIVE_SPAN_ATTRIBUTE_MAX_LENGTH",
    env["QWEN_TELEMETRY_SENSITIVE_SPAN_ATTRIBUTE_MAX_LENGTH"]
  ) ?? parseSensitiveSpanAttributeMaxLengthSetting(
    "telemetry.sensitiveSpanAttributeMaxLength",
    settings.sensitiveSpanAttributeMaxLength
  ) ?? DEFAULT_SENSITIVE_SPAN_ATTRIBUTE_MAX_LENGTH;
  const outfile = argv.telemetryOutfile ?? env["QWEN_TELEMETRY_OUTFILE"] ?? settings.outfile;
  const otlpTracesEndpoint = env["QWEN_TELEMETRY_OTLP_TRACES_ENDPOINT"] ?? env["OTEL_EXPORTER_OTLP_TRACES_ENDPOINT"] ?? settings.otlpTracesEndpoint;
  const otlpLogsEndpoint = env["QWEN_TELEMETRY_OTLP_LOGS_ENDPOINT"] ?? env["OTEL_EXPORTER_OTLP_LOGS_ENDPOINT"] ?? settings.otlpLogsEndpoint;
  const otlpMetricsEndpoint = env["QWEN_TELEMETRY_OTLP_METRICS_ENDPOINT"] ?? env["OTEL_EXPORTER_OTLP_METRICS_ENDPOINT"] ?? settings.otlpMetricsEndpoint;
  const resourceAttributeWarnings = [];
  const envResourceAttrs = stripReservedResourceAttributes(
    parseOtelResourceAttributes(
      env["OTEL_RESOURCE_ATTRIBUTES"],
      resourceAttributeWarnings
    ),
    "OTEL_RESOURCE_ATTRIBUTES",
    resourceAttributeWarnings
  );
  const settingsResourceAttrs = stripReservedResourceAttributes(
    coerceStringResourceAttributes(
      settings.resourceAttributes,
      resourceAttributeWarnings
    ),
    "settings.telemetry.resourceAttributes",
    resourceAttributeWarnings
  );
  const mergedResourceAttrs = {
    ...envResourceAttrs,
    ...settingsResourceAttrs
  };
  const otelServiceName = env["OTEL_SERVICE_NAME"]?.trim();
  if (otelServiceName) {
    mergedResourceAttrs["service.name"] = otelServiceName;
  }
  const resourceAttributes = Object.keys(mergedResourceAttrs).length ? mergedResourceAttrs : void 0;
  const metricsIncludeSessionId = parseBooleanEnvFlag(env["QWEN_TELEMETRY_METRICS_INCLUDE_SESSION_ID"]) ?? settings.metrics?.includeSessionId ?? false;
  return {
    enabled,
    target,
    otlpEndpoint,
    otlpProtocol,
    otlpTracesEndpoint,
    otlpLogsEndpoint,
    otlpMetricsEndpoint,
    logPrompts,
    userId,
    includeSensitiveSpanAttributes,
    sensitiveSpanAttributeMaxLength,
    outfile,
    resourceAttributes,
    metrics: { includeSessionId: metricsIncludeSessionId },
    resourceAttributeWarnings: resourceAttributeWarnings.length ? resourceAttributeWarnings : void 0
  };
}
__name(resolveTelemetrySettings, "resolveTelemetrySettings");

export {
  parseBooleanEnvFlag,
  resolveTelemetrySettings,
  initializeDaemonMetrics,
  registerDaemonGaugeCallbacks,
  recordDaemonHttpRequest,
  recordDaemonSessionLifecycle,
  recordDaemonChannelLifecycle,
  recordDaemonPromptQueueWait,
  recordDaemonPromptDuration,
  recordDaemonBridgeError,
  recordDaemonCancel,
  recordDaemonPipeMessage,
  startEventLoopLagMonitor,
  registerDaemonEventLoopLagGauge,
  registerAcpEventLoopLagGauge,
  areSensitiveSpanAttributesEnabled,
  addAgentInputMessageAttributes,
  addAgentOutputMessageAttributes,
  AgentOutputMessageCapture,
  addUserPromptAttributes,
  addToolArgumentsAttributes,
  addToolCallResultAttributes,
  DEFAULT_TELEMETRY_TARGET,
  DEFAULT_OTLP_ENDPOINT
};
/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
