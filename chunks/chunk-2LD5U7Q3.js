// Force strict mode and setup for ESM
"use strict";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/core/openaiContentGenerator/constants.ts
init_esbuild_shims();
var DEFAULT_TIMEOUT = 12e4;
var DISABLED_REQUEST_TIMEOUT_MS = 2147483647;
function resolveRequestTimeout(timeout) {
  if (timeout === void 0 || timeout === null) {
    return DEFAULT_TIMEOUT;
  }
  return timeout <= 0 ? DISABLED_REQUEST_TIMEOUT_MS : timeout;
}
__name(resolveRequestTimeout, "resolveRequestTimeout");
var DEFAULT_STREAM_IDLE_TIMEOUT_MS = 24e4;
var QWEN_STREAM_IDLE_TIMEOUT_MS_ENV = "QWEN_STREAM_IDLE_TIMEOUT_MS";
var MAX_STREAM_GUARD_TIMEOUT_MS = 2147483647;
var DEFAULT_STREAM_MAX_LIFETIME_MS = 9e5;
var QWEN_STREAM_MAX_LIFETIME_MS_ENV = "QWEN_STREAM_MAX_LIFETIME_MS";
var DEFAULT_MAX_RETRIES = 3;
var DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
var DEFAULT_DASHSCOPE_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
var DASHSCOPE_PROXY_BASE_URL = process.env["DASHSCOPE_PROXY_BASE_URL"];

// packages/core/src/core/reasoning-effort.ts
init_esbuild_shims();
var REASONING_EFFORT_TIERS = [
  "low",
  "medium",
  "high",
  "xhigh",
  "max"
];
var REASONING_EFFORT_RANKS = {
  low: 20,
  medium: 30,
  high: 40,
  xhigh: 60,
  max: 70
};
function normalizeReasoningEffort(raw) {
  if (!raw || typeof raw !== "string") {
    return void 0;
  }
  const key = raw.trim().toLowerCase().replace(/[\s_-]+/g, "");
  switch (key) {
    case "low":
      return "low";
    case "medium":
    case "med":
      return "medium";
    case "high":
      return "high";
    case "xhigh":
    case "extrahigh":
      return "xhigh";
    case "max":
    case "maximum":
      return "max";
    default:
      return void 0;
  }
}
__name(normalizeReasoningEffort, "normalizeReasoningEffort");
function clampReasoningEffort(requested, supported) {
  const set = supported && supported.length > 0 ? supported : REASONING_EFFORT_TIERS;
  if (set.includes(requested)) {
    return requested;
  }
  const requestedRank = REASONING_EFFORT_RANKS[requested];
  const ranked = [...set].sort(
    (a, b) => REASONING_EFFORT_RANKS[a] - REASONING_EFFORT_RANKS[b]
  );
  for (const tier of ranked) {
    if (REASONING_EFFORT_RANKS[tier] >= requestedRank) {
      return tier;
    }
  }
  return ranked[ranked.length - 1];
}
__name(clampReasoningEffort, "clampReasoningEffort");
function applyReasoningEffort(config, effort) {
  config.setReasoningEffort(effort);
  return config.getReasoningEffort() === effort;
}
__name(applyReasoningEffort, "applyReasoningEffort");

export {
  resolveRequestTimeout,
  DEFAULT_STREAM_IDLE_TIMEOUT_MS,
  QWEN_STREAM_IDLE_TIMEOUT_MS_ENV,
  MAX_STREAM_GUARD_TIMEOUT_MS,
  DEFAULT_STREAM_MAX_LIFETIME_MS,
  QWEN_STREAM_MAX_LIFETIME_MS_ENV,
  DEFAULT_MAX_RETRIES,
  DEFAULT_OPENAI_BASE_URL,
  DEFAULT_DASHSCOPE_BASE_URL,
  DASHSCOPE_PROXY_BASE_URL,
  REASONING_EFFORT_TIERS,
  normalizeReasoningEffort,
  clampReasoningEffort,
  applyReasoningEffort
};
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
