// Force strict mode and setup for ESM
"use strict";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/core/tool-call-arguments.ts
init_esbuild_shims();
function parseToolCallArguments(json) {
  try {
    const value = JSON.parse(json);
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return { ok: false, reason: "NON_OBJECT" };
    }
    return { ok: true, value };
  } catch {
    return { ok: false, reason: "MALFORMED_JSON" };
  }
}
__name(parseToolCallArguments, "parseToolCallArguments");

export {
  parseToolCallArguments
};
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
