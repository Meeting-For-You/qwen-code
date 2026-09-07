// Force strict mode and setup for ESM
"use strict";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/utils/xml.ts
init_esbuild_shims();
function escapeXml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
__name(escapeXml, "escapeXml");
var XML_TAG_CANDIDATE_RE = /<[^<>]*>/g;
function isXmlWhitespace(char) {
  return char !== void 0 && /\s/.test(char);
}
__name(isXmlWhitespace, "isXmlWhitespace");
function isSystemReminderTagIgnorable(char) {
  const codePoint = char.codePointAt(0);
  if (codePoint === void 0) return false;
  return codePoint === 173 || codePoint === 1564 || codePoint === 12644 || codePoint === 65279 || codePoint === 65440 || codePoint >= 0 && codePoint <= 31 || codePoint >= 127 && codePoint <= 159 || codePoint >= 4447 && codePoint <= 4448 || codePoint >= 6068 && codePoint <= 6069 || codePoint >= 6155 && codePoint <= 6159 || codePoint >= 8203 && codePoint <= 8207 || codePoint >= 8234 && codePoint <= 8238 || codePoint >= 8288 && codePoint <= 8303 || codePoint >= 65024 && codePoint <= 65039 || codePoint >= 65520 && codePoint <= 65528 || codePoint >= 113824 && codePoint <= 113827 || codePoint >= 119155 && codePoint <= 119162 || codePoint >= 917504 && codePoint <= 921599;
}
__name(isSystemReminderTagIgnorable, "isSystemReminderTagIgnorable");
function normalizeSystemReminderCandidateTag(tag) {
  let normalized = "";
  for (const char of tag) {
    if (!isSystemReminderTagIgnorable(char)) {
      normalized += char;
    }
  }
  return normalized.toLowerCase();
}
__name(normalizeSystemReminderCandidateTag, "normalizeSystemReminderCandidateTag");
function getSystemReminderTagKind(tag) {
  const normalized = normalizeSystemReminderCandidateTag(tag);
  const len = normalized.length;
  if (len < 2 || normalized[0] !== "<" || normalized[len - 1] !== ">") {
    return void 0;
  }
  let i = 1;
  while (i < len && isXmlWhitespace(normalized[i])) i++;
  let closing = false;
  if (normalized[i] === "/") {
    closing = true;
    i++;
  }
  while (i < len && isXmlWhitespace(normalized[i])) i++;
  const TAG_NAME = "system-reminder";
  if (normalized.slice(i, i + TAG_NAME.length) !== TAG_NAME) {
    return void 0;
  }
  i += TAG_NAME.length;
  if (i < len - 1 && isXmlWhitespace(normalized[i])) {
    while (i < len && isXmlWhitespace(normalized[i])) i++;
    while (i < len && normalized[i] !== ">") i++;
  }
  while (i < len && isXmlWhitespace(normalized[i])) i++;
  if (normalized[i] === "/") i++;
  while (i < len && isXmlWhitespace(normalized[i])) i++;
  if (i !== len - 1 || normalized[i] !== ">") {
    return void 0;
  }
  return closing ? "closing" : "other";
}
__name(getSystemReminderTagKind, "getSystemReminderTagKind");
function escapeSystemReminderTag(tag) {
  const tagKind = getSystemReminderTagKind(tag);
  if (tagKind === "closing") {
    return "<\\/system-reminder>";
  }
  if (tagKind === "other") {
    return escapeXml(tag);
  }
  return tag;
}
__name(escapeSystemReminderTag, "escapeSystemReminderTag");
function escapeSystemReminderTags(text) {
  return text.replace(XML_TAG_CANDIDATE_RE, escapeSystemReminderTag);
}
__name(escapeSystemReminderTags, "escapeSystemReminderTags");

export {
  escapeXml,
  escapeSystemReminderTags
};
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
