// Force strict mode and setup for ESM
"use strict";
import {
  getErrorStatus
} from "./chunk-UHQFIS7N.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/utils/quotaErrorDetection.ts
init_esbuild_shims();
function isApiError(error) {
  return typeof error === "object" && error !== null && "error" in error && typeof error.error === "object" && error.error !== null && "message" in error.error;
}
__name(isApiError, "isApiError");
function isStructuredError(error) {
  return typeof error === "object" && error !== null && "message" in error && typeof error.message === "string";
}
__name(isStructuredError, "isStructuredError");
function isQwenQuotaExceededError(error) {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const { status, code, message } = error;
  return status === 429 && code === "insufficient_quota" && typeof message === "string" && message.toLowerCase().includes("free allocated quota exceeded");
}
__name(isQwenQuotaExceededError, "isQwenQuotaExceededError");
var QUOTA_EXHAUSTED_PREFIX = "Quota exhausted: ";
function getQuotaMessage(error) {
  let message = null;
  if (typeof error === "string") message = error;
  else if (isStructuredError(error)) message = error.message;
  else if (isApiError(error)) message = error.error.message;
  if (message === null) return null;
  const start = message.indexOf("{");
  if (start !== -1) {
    try {
      const parsed = JSON.parse(message.substring(start));
      if (isApiError(parsed)) return parsed.error.message;
    } catch {
    }
  }
  return message;
}
__name(getQuotaMessage, "getQuotaMessage");
function isQuotaExhaustedError(error) {
  const message = getQuotaMessage(error);
  if (!message) return false;
  const lower = message.toLowerCase();
  return lower.includes("quota") && (lower.includes("exhausted") || lower.includes("exceeded")) && (lower.includes("will reset") || lower.includes("reset at"));
}
__name(isQuotaExhaustedError, "isQuotaExhaustedError");
function formatQuotaExhaustedMessage(error) {
  const raw = getQuotaMessage(error) ?? "";
  if (raw.startsWith(QUOTA_EXHAUSTED_PREFIX)) return raw;
  const stripped = raw.replace(/^\d{3}\s+/, "").trim() || "quota has been exhausted";
  return `${QUOTA_EXHAUSTED_PREFIX}${stripped}

Please retry after the reset time, or switch to another API key / auth method.`;
}
__name(formatQuotaExhaustedMessage, "formatQuotaExhaustedMessage");

// packages/core/src/utils/retryPolicy.ts
init_esbuild_shims();
var MAX_TIMEOUT_MS = 2147483647;
function getRetryDelayMs(options) {
  const normalizedAttempt = Math.max(1, options.attempt);
  const delayCeilingMs = Math.min(options.maxDelayMs, MAX_TIMEOUT_MS);
  const exponent = Math.min(normalizedAttempt - 1, 31);
  const cappedExponentialDelayMs = Math.min(
    options.initialDelayMs * Math.pow(2, exponent),
    delayCeilingMs
  );
  const retryAfterMode = options.retryAfterMode ?? "ignore";
  const retryAfterMs = retryAfterMode === "ignore" ? null : getRetryAfterDelayMs(options.error);
  if (retryAfterMs !== null && retryAfterMs > 0) {
    const retryAfterCapMs = Math.min(
      options.retryAfterMaxDelayMs ?? options.maxDelayMs,
      MAX_TIMEOUT_MS
    );
    const cappedRetryAfterMs = Math.min(retryAfterMs, retryAfterCapMs);
    return Math.max(cappedExponentialDelayMs, cappedRetryAfterMs);
  }
  const jitterRatio = options.jitterRatio ?? 0;
  if (jitterRatio <= 0) return cappedExponentialDelayMs;
  const random = options.random ?? Math.random;
  const jitter = cappedExponentialDelayMs * jitterRatio * (random() * 2 - 1);
  return Math.min(
    Math.max(0, cappedExponentialDelayMs + jitter),
    delayCeilingMs
  );
}
__name(getRetryDelayMs, "getRetryDelayMs");
function getRetryAfterDelayMs(error) {
  const value = getHeaderValue(error, "retry-after") ?? getResponseHeaderValue(error, "retry-after");
  if (value === null) return null;
  const trimmed = value.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const seconds = Number(trimmed);
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1e3, MAX_TIMEOUT_MS);
    }
  }
  const retryAtMs = Date.parse(trimmed);
  if (!Number.isFinite(retryAtMs)) return null;
  const delayMs = retryAtMs - Date.now();
  return delayMs > 0 ? Math.min(delayMs, MAX_TIMEOUT_MS) : 0;
}
__name(getRetryAfterDelayMs, "getRetryAfterDelayMs");
function getHeaderValue(error, headerName) {
  if (!hasHeaders(error)) return null;
  const { headers } = error;
  if (typeof headers.get === "function") {
    const value = headers.get(headerName);
    return typeof value === "string" ? value : null;
  }
  if (typeof headers !== "object" || headers === null) return null;
  const lowerHeaderName = headerName.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() !== lowerHeaderName) continue;
    return typeof value === "string" ? value : null;
  }
  return null;
}
__name(getHeaderValue, "getHeaderValue");
function getResponseHeaderValue(error, headerName) {
  if (!hasResponseHeaders(error)) return null;
  return getHeaderValue(error.response, headerName);
}
__name(getResponseHeaderValue, "getResponseHeaderValue");
function hasHeaders(error) {
  return typeof error === "object" && error !== null && "headers" in error && error.headers != null;
}
__name(hasHeaders, "hasHeaders");
function hasResponseHeaders(error) {
  return typeof error === "object" && error !== null && "response" in error && typeof error.response === "object" && error.response !== null && "headers" in error.response && error.response.headers != null;
}
__name(hasResponseHeaders, "hasResponseHeaders");

// packages/core/src/utils/rateLimit.ts
init_esbuild_shims();
var RATE_LIMIT_ERROR_CODES = /* @__PURE__ */ new Set([429, 503, 1302, 1305]);
function isRateLimitError(error, extraCodes) {
  const code = getErrorCode(error);
  if (code === null) return false;
  if (RATE_LIMIT_ERROR_CODES.has(code)) return true;
  if (extraCodes && extraCodes.includes(code)) return true;
  return false;
}
__name(isRateLimitError, "isRateLimitError");
function getRateLimitErrorDetails(error) {
  const statusCode = getErrorStatus(error);
  const payload = getProviderErrorPayload(error);
  const message = getRawErrorMessage(error);
  const transport = message?.includes("event:error") || message?.includes("HTTP_STATUS/") ? "sse" : statusCode !== void 0 ? "http" : "unknown";
  return {
    ...statusCode !== void 0 ? { statusCode } : {},
    ...payload?.code !== void 0 ? { providerCode: String(payload.code) } : {},
    ...payload?.message !== void 0 ? { providerMessage: payload.message } : {},
    ...payload?.requestId !== void 0 ? { requestId: payload.requestId } : {},
    transport
  };
}
__name(getRateLimitErrorDetails, "getRateLimitErrorDetails");
function getRateLimitRetryDelayMs(attempt, options) {
  return getRetryDelayMs({
    attempt,
    initialDelayMs: options.initialDelayMs,
    maxDelayMs: options.maxDelayMs,
    retryAfterMode: "minimum",
    retryAfterMaxDelayMs: options.maxDelayMs,
    error: options.error
  });
}
__name(getRateLimitRetryDelayMs, "getRateLimitRetryDelayMs");
function getErrorCode(error) {
  if (isApiError(error)) {
    const n = Number(error.error.code);
    if (Number.isFinite(n) && n > 0) return n;
  }
  const msg = error instanceof Error ? error.message : typeof error === "string" ? error : null;
  if (msg) {
    const i = msg.indexOf("{");
    if (i !== -1) {
      try {
        const p = JSON.parse(msg.substring(i));
        if (isApiError(p)) {
          const n = Number(p.error.code);
          if (Number.isFinite(n) && n > 0) return n;
        }
      } catch {
      }
    }
  }
  if (isStructuredError(error) && typeof error.status === "number") {
    return error.status;
  }
  if (error instanceof Error && "status" in error) {
    const s = error.status;
    if (typeof s === "number") return s;
  }
  return getErrorStatus(error) ?? null;
}
__name(getErrorCode, "getErrorCode");
function getProviderErrorPayload(error) {
  for (const payload of getJsonPayloads(error)) {
    if (typeof payload !== "object" || payload === null) continue;
    const direct = payload;
    const nestedError = payload.error;
    const nested = typeof nestedError === "object" && nestedError !== null ? nestedError : void 0;
    const source = nested ?? direct;
    const code = typeof source.code === "string" || typeof source.code === "number" ? source.code : void 0;
    const message = typeof source.message === "string" ? source.message : void 0;
    const requestId = typeof source.request_id === "string" ? source.request_id : typeof source.requestId === "string" ? source.requestId : typeof direct.request_id === "string" ? direct.request_id : typeof direct.requestId === "string" ? direct.requestId : void 0;
    if (code !== void 0 || message !== void 0 || requestId !== void 0) {
      return { code, message, requestId };
    }
  }
  if (isApiError(error)) {
    return {
      code: error.error.code,
      message: error.error.message
    };
  }
  return null;
}
__name(getProviderErrorPayload, "getProviderErrorPayload");
function getJsonPayloads(error) {
  const message = getRawErrorMessage(error);
  if (!message) return [];
  const payloads = [];
  for (const line of message.split(/\r?\n/)) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice("data:".length).trim();
    if (!data || data === "[DONE]") continue;
    try {
      payloads.push(JSON.parse(data));
    } catch {
    }
  }
  if (payloads.length > 0) return payloads;
  const jsonStart = message.indexOf("{");
  const jsonEnd = message.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd > jsonStart) {
    try {
      payloads.push(
        JSON.parse(message.slice(jsonStart, jsonEnd + 1))
      );
    } catch {
    }
  }
  return payloads;
}
__name(getJsonPayloads, "getJsonPayloads");
function getRawErrorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return null;
}
__name(getRawErrorMessage, "getRawErrorMessage");

export {
  isApiError,
  isStructuredError,
  isQwenQuotaExceededError,
  QUOTA_EXHAUSTED_PREFIX,
  isQuotaExhaustedError,
  formatQuotaExhaustedMessage,
  getRetryDelayMs,
  getRetryAfterDelayMs,
  isRateLimitError,
  getRateLimitErrorDetails,
  getRateLimitRetryDelayMs
};
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
