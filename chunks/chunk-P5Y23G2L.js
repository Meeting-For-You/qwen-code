// Force strict mode and setup for ESM
"use strict";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/cli/src/hooks/session-delete-hook.ts
init_esbuild_shims();
function fireSessionDeleteHook(config, sessionId, logger = config.getDebugLogger()) {
  void config.getHookSystem()?.fireSessionDeleteEvent(sessionId).catch((error) => {
    logger.warn(
      `SessionDelete hook failed for ${sessionId}: ${error instanceof Error ? error.message : String(error)}`
    );
  });
}
__name(fireSessionDeleteHook, "fireSessionDeleteHook");

// packages/cli/src/utils/classify-api-error.ts
init_esbuild_shims();
function classifyApiError(error) {
  const status = error.status;
  const message = error.message?.toLowerCase() ?? "";
  if (status === 429 || message.includes("rate limit")) {
    return "rate_limit";
  }
  if (status === 401 || message.includes("unauthorized")) {
    return "authentication_failed";
  }
  if (status === 402 || status === 403 || message.includes("billing") || message.includes("quota")) {
    return "billing_error";
  }
  if (status === 400 || message.includes("invalid")) {
    return "invalid_request";
  }
  if (status !== void 0 && status >= 500) {
    return "server_error";
  }
  if (message.includes("max_tokens") || message.includes("token limit")) {
    return "max_output_tokens";
  }
  return "unknown";
}
__name(classifyApiError, "classifyApiError");

export {
  classifyApiError,
  fireSessionDeleteHook
};
/**
 * @license
 * Copyright 2025 Qwen Code
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
