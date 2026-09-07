// Force strict mode and setup for ESM
"use strict";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/core/openaiContentGenerator/prefix-caching.ts
init_esbuild_shims();
var CACHE_KEY_PREFIX = "qwen-code:";
var EXPLICIT_BREAKPOINT_COUNT = 2;
function supportsOpenAIPrefixCaching(contentGeneratorConfig) {
  return contentGeneratorConfig.authType === "openai" /* USE_OPENAI */ || contentGeneratorConfig.authType === "qwen-oauth" /* QWEN_OAUTH */;
}
__name(supportsOpenAIPrefixCaching, "supportsOpenAIPrefixCaching");
function isOfficialOpenAIEndpoint(contentGeneratorConfig) {
  if (contentGeneratorConfig.authType !== "openai" /* USE_OPENAI */) return false;
  const { baseUrl } = contentGeneratorConfig;
  if (!baseUrl) return false;
  try {
    return new URL(baseUrl).hostname.toLowerCase() === "api.openai.com";
  } catch {
    return false;
  }
}
__name(isOfficialOpenAIEndpoint, "isOfficialOpenAIEndpoint");
function supportsExplicitOpenAIPromptCaching(model) {
  const match = /^gpt-(\d+)(?:\.(\d+))?(?:[-.]|$)/i.exec(model);
  if (!match) return false;
  const major = Number(match[1]);
  const minor = Number(match[2] ?? 0);
  return major > 5 || major === 5 && minor >= 6;
}
__name(supportsExplicitOpenAIPromptCaching, "supportsExplicitOpenAIPromptCaching");
function withCacheBreakpoint(message) {
  if (message.role !== "user" && message.role !== "tool") return void 0;
  const marker = { prompt_cache_breakpoint: { mode: "explicit" } };
  if (typeof message.content === "string") {
    return {
      ...message,
      content: [{ type: "text", text: message.content, ...marker }]
    };
  }
  if (!Array.isArray(message.content) || message.content.length === 0) {
    return void 0;
  }
  const content = [...message.content];
  const lastIndex = content.length - 1;
  content[lastIndex] = { ...content[lastIndex], ...marker };
  return { ...message, content };
}
__name(withCacheBreakpoint, "withCacheBreakpoint");
function applyOfficialOpenAIPromptCaching(request, sessionId, cacheSharing, cacheKeyPartition) {
  const result = { ...request };
  if (sessionId && !result.prompt_cache_key) {
    const partition = cacheKeyPartition ? `:${cacheKeyPartition}` : "";
    result.prompt_cache_key = `${CACHE_KEY_PREFIX}${sessionId}${partition}`;
  }
  if (!cacheSharing || !supportsExplicitOpenAIPromptCaching(request.model)) {
    return result;
  }
  const messages = [...request.messages];
  let marked = 0;
  for (let index = messages.length - 2; index >= 0 && marked < EXPLICIT_BREAKPOINT_COUNT; index -= 1) {
    const message = messages[index];
    const updated = message ? withCacheBreakpoint(message) : void 0;
    if (!updated) continue;
    messages[index] = updated;
    marked += 1;
  }
  if (marked === 0) return result;
  result.messages = messages;
  result.prompt_cache_options = {
    ...result.prompt_cache_options,
    mode: "explicit"
  };
  return result;
}
__name(applyOfficialOpenAIPromptCaching, "applyOfficialOpenAIPromptCaching");

export {
  supportsOpenAIPrefixCaching,
  isOfficialOpenAIEndpoint,
  applyOfficialOpenAIPromptCaching
};
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
