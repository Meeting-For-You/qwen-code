// Force strict mode and setup for ESM
"use strict";
import {
  getRateLimitErrorDetails,
  isQwenQuotaExceededError,
  isRateLimitError
} from "./chunk-4FTKQNWJ.js";
import {
  isAbortError
} from "./chunk-UHQFIS7N.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/utils/retryErrorClassification.ts
init_esbuild_shims();
function classifyRetryError(error, context = {}) {
  if (isRetryAbortError(error)) {
    return {
      kind: "abort",
      diagnosis: "fail-fast",
      reason: "aborted"
    };
  }
  const details = getRateLimitErrorDetails(error);
  const statusCode = details.statusCode;
  const providerFields = getProviderFields(error);
  const providerCode = details.providerCode ?? providerFields.providerCode;
  const providerMessage = details.providerMessage ?? providerFields.providerMessage;
  const requestId = details.requestId ?? providerFields.requestId;
  const common = {
    ...statusCode !== void 0 ? { statusCode } : {},
    ...providerCode !== void 0 ? { providerCode } : {},
    ...providerMessage !== void 0 ? { providerMessage } : {},
    ...requestId !== void 0 ? { requestId } : {}
  };
  if (context.authType === "qwen-oauth" /* QWEN_OAUTH */ && isQwenQuotaExceededError(error)) {
    return {
      kind: "provider-business",
      diagnosis: "fail-fast",
      reason: "qwen-oauth-free-tier-quota",
      ...common
    };
  }
  if (isAllocatedQuotaExceeded(providerCode)) {
    return {
      kind: "provider-business",
      diagnosis: "fail-fast",
      reason: "allocated-quota-exceeded",
      ...common
    };
  }
  if (isRateLimitError(error, context.extraRetryErrorCodes)) {
    const kind = details.transport === "sse" ? "sse-provider" : statusCode !== void 0 ? "http" : "provider";
    return {
      kind,
      diagnosis: "retryable",
      reason: "rate-limit",
      ...common
    };
  }
  const transportCode = getTransportCode(error);
  if (transportCode !== void 0 && (statusCode === void 0 || statusCode >= 500)) {
    return {
      kind: "transport",
      diagnosis: "retryable",
      reason: "transport-error",
      transportCode,
      ...statusCode !== void 0 ? { statusCode } : {}
    };
  }
  if (statusCode !== void 0) {
    const kind = details.transport === "sse" ? "sse-provider" : "http";
    if (statusCode === 529) {
      return {
        kind,
        diagnosis: "retryable",
        reason: "capacity-overload",
        ...common
      };
    }
    if (statusCode === 401 || statusCode === 403) {
      return {
        kind,
        diagnosis: "fail-fast",
        reason: "auth-error",
        ...common
      };
    }
    if (statusCode >= 400 && statusCode < 500) {
      return {
        kind,
        diagnosis: "fail-fast",
        reason: "client-error",
        ...common
      };
    }
    if (statusCode >= 500 && statusCode < 600) {
      return {
        kind,
        diagnosis: "retryable",
        reason: "server-error",
        ...common
      };
    }
    return {
      kind,
      diagnosis: "unknown",
      reason: "http-status",
      ...common
    };
  }
  return {
    kind: "unknown",
    diagnosis: "unknown",
    reason: "unclassified",
    ...common
  };
}
__name(classifyRetryError, "classifyRetryError");
function isRetryAbortError(error) {
  if (isAbortError(error)) {
    return true;
  }
  return error instanceof Error && error.name === "CanceledError";
}
__name(isRetryAbortError, "isRetryAbortError");
var MAX_TRANSPORT_CAUSE_DEPTH = 4;
function getTransportCode(error) {
  let current = error;
  for (let depth = 0; depth <= MAX_TRANSPORT_CAUSE_DEPTH; depth++) {
    if (typeof current !== "object" || current === null) {
      return void 0;
    }
    const code = current.code;
    if (typeof code === "string" && isTransportCode(code)) {
      return code;
    }
    current = current instanceof Error ? current.cause : void 0;
  }
  return void 0;
}
__name(getTransportCode, "getTransportCode");
function isTransportCode(code) {
  return TRANSPORT_ERROR_CODES.has(code);
}
__name(isTransportCode, "isTransportCode");
var TRANSPORT_ERROR_CODES = /* @__PURE__ */ new Set([
  "EAI_AGAIN",
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "ENOTFOUND",
  "EPIPE",
  "ETIMEDOUT",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET"
]);
function isAllocatedQuotaExceeded(providerCode) {
  return providerCode === "Throttling.AllocationQuota";
}
__name(isAllocatedQuotaExceeded, "isAllocatedQuotaExceeded");
function getProviderFields(error) {
  if (typeof error !== "object" || error === null) {
    return {};
  }
  const source = error;
  const rawCode = typeof source.code === "string" || typeof source.code === "number" ? String(source.code) : void 0;
  const isHttpStatusEcho = typeof source.code === "number" && source.code >= 100 && source.code < 600;
  const providerCode = error instanceof Error && rawCode?.startsWith("ERR_") || isHttpStatusEcho ? void 0 : rawCode;
  const requestId = typeof source.request_id === "string" ? source.request_id : typeof source.requestId === "string" ? source.requestId : void 0;
  const providerMessage = typeof source.message === "string" && (!(error instanceof Error) || providerCode !== void 0 || requestId !== void 0) ? source.message : void 0;
  return {
    ...providerCode !== void 0 ? { providerCode } : {},
    ...providerMessage !== void 0 ? { providerMessage } : {},
    ...requestId !== void 0 ? { requestId } : {}
  };
}
__name(getProviderFields, "getProviderFields");
var FALLBACK_ELIGIBLE_STATUS_CODES = /* @__PURE__ */ new Set([429, 503, 529]);
function isFallbackEligible(classification) {
  return classification.kind !== "transport" && classification.statusCode !== void 0 && FALLBACK_ELIGIBLE_STATUS_CODES.has(classification.statusCode) && classification.diagnosis !== "fail-fast" && classification.diagnosis !== "unknown";
}
__name(isFallbackEligible, "isFallbackEligible");

export {
  classifyRetryError,
  getTransportCode,
  isFallbackEligible
};
/**
 * @license
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
