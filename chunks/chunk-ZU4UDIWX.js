// Force strict mode and setup for ESM
"use strict";
import {
  escapeXml
} from "./chunk-AQ37AY7B.js";
import {
  ToolNames
} from "./chunk-UTLCH2FK.js";
import {
  createDebugLogger
} from "./chunk-UHQFIS7N.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/tools/skill-utils.ts
init_esbuild_shims();
var debugLogger = createDebugLogger("SKILL");
function buildSkillLlmContent(baseDir, body) {
  return `Base directory for this skill: ${baseDir}
Important: ALWAYS resolve absolute paths from this base directory when working with skills.

${body}
`;
}
__name(buildSkillLlmContent, "buildSkillLlmContent");
var collectCache = /* @__PURE__ */ new WeakMap();
var COLLECT_CACHE_TTL_MS = 2e3;
function clearCollectedSkillEntriesCache(skillManager) {
  if (skillManager) {
    collectCache.delete(skillManager);
  } else {
    collectCache = /* @__PURE__ */ new WeakMap();
  }
}
__name(clearCollectedSkillEntriesCache, "clearCollectedSkillEntriesCache");
async function collectAvailableSkillEntries(skillManager, config) {
  const cached = collectCache.get(skillManager);
  if (cached && Date.now() - cached.ts < COLLECT_CACHE_TTL_MS) {
    return cached.promise;
  }
  const promise = collectAvailableSkillEntriesUncached(skillManager, config);
  collectCache.set(skillManager, { promise, ts: Date.now() });
  promise.catch(() => {
    const entry = collectCache.get(skillManager);
    if (entry?.promise === promise) {
      collectCache.delete(skillManager);
    }
  });
  return promise;
}
__name(collectAvailableSkillEntries, "collectAvailableSkillEntries");
async function collectAvailableSkillEntriesUncached(skillManager, config) {
  const allSkills = await skillManager.listSkills();
  const disabledNames = config.getDisabledSkillNames();
  const isDisabled = /* @__PURE__ */ __name((name) => disabledNames.has(name.toLowerCase()), "isDisabled");
  const availableSkills = allSkills.filter(
    (s) => !s.disableModelInvocation && skillManager.isSkillActive(s) && !isDisabled(s.name)
  );
  const hiddenSkillNames = new Set(
    allSkills.filter((s) => s.disableModelInvocation).map((s) => s.name)
  );
  const pendingConditionalSkillNames = new Set(
    allSkills.filter(
      (s) => !s.disableModelInvocation && s.paths && s.paths.length > 0 && !skillManager.isSkillActive(s) && !isDisabled(s.name)
    ).map((s) => s.name)
  );
  const provider = config.getModelInvocableCommandsProvider();
  const allCommands = provider ? provider() : [];
  const fileBasedSkillNames = new Set(
    allSkills.filter((s) => !s.disableModelInvocation && !isDisabled(s.name)).map((s) => s.name)
  );
  const modelInvocableCommands = allCommands.filter(
    (cmd) => !fileBasedSkillNames.has(cmd.name)
  );
  const entries = [
    ...availableSkills.map((s) => ({
      name: s.name,
      description: s.description,
      whenToUse: s.whenToUse,
      level: s.level
    })),
    ...modelInvocableCommands.map((c) => ({
      name: c.name,
      description: c.description
    }))
  ];
  return {
    availableSkills,
    pendingConditionalSkillNames,
    modelInvocableCommands,
    hiddenSkillNames,
    entries
  };
}
__name(collectAvailableSkillEntriesUncached, "collectAvailableSkillEntriesUncached");
function compareSkillEntries(a, b) {
  const aGroup = a.level !== void 0 ? 0 : 1;
  const bGroup = b.level !== void 0 ? 0 : 1;
  if (aGroup !== bGroup) return aGroup - bGroup;
  return a.name.localeCompare(b.name);
}
__name(compareSkillEntries, "compareSkillEntries");
function renderAvailableSkillsBlock(entries) {
  return [...entries].sort(compareSkillEntries).map((entry) => {
    if (entry.level !== void 0) {
      const descText = `${escapeXml(entry.description)}${entry.whenToUse ? ` \u2014 ${escapeXml(entry.whenToUse)}` : ""} (${entry.level})`;
      return `<skill>
<name>
${escapeXml(entry.name)}
</name>
<description>
${descText}
</description>
<location>
${entry.level}
</location>
</skill>`;
    }
    return `<skill>
<name>
${escapeXml(entry.name)}
</name>
<description>
${escapeXml(entry.description)}
</description>
</skill>`;
  }).join("\n");
}
__name(renderAvailableSkillsBlock, "renderAvailableSkillsBlock");
function applySkillAllowedTools(permissionManager, allowedTools) {
  if (!permissionManager || !allowedTools?.length) {
    return;
  }
  for (const rule of allowedTools) {
    permissionManager.addSessionAllowRule(rule);
  }
}
__name(applySkillAllowedTools, "applySkillAllowedTools");
function clearLoadedSkillTracking(toolRegistry, logTag) {
  const tool = toolRegistry?.getTool(ToolNames.SKILL);
  if (tool && "clearLoadedSkills" in tool) {
    tool.clearLoadedSkills();
    debugLogger.debug(
      `[SKILL_TRACKING] conservatively cleared loaded-skill tracking after ${logTag}`
    );
  }
}
__name(clearLoadedSkillTracking, "clearLoadedSkillTracking");

export {
  buildSkillLlmContent,
  clearCollectedSkillEntriesCache,
  collectAvailableSkillEntries,
  renderAvailableSkillsBlock,
  applySkillAllowedTools,
  clearLoadedSkillTracking
};
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
