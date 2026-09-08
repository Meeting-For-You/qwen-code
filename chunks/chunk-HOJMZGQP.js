// Force strict mode and setup for ESM
"use strict";
import {
  mapSkillConfigToStatus
} from "./chunk-BGXZBI5B.js";
import {
  resolveSkillSettings
} from "./chunk-Z4X5MTRT.js";
import {
  STATUS_SCHEMA_VERSION
} from "./chunk-JHS74YAB.js";
import {
  loadSettings
} from "./chunk-AAV6TMZN.js";
import {
  SkillManager,
  isSafeModeEnv
} from "./chunk-CAUDTPEJ.js";
import {
  writeStderrLine
} from "./chunk-KGJGEEVR.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/cli/src/serve/workspace-skills-status.ts
init_esbuild_shims();
var VALID_SKILL_LEVELS = /* @__PURE__ */ new Set([
  "project",
  "user",
  "extension",
  "bundled"
]);
function createWorkspaceSkillsStatusProvider(options = {}) {
  const managers = /* @__PURE__ */ new Map();
  const provider = /* @__PURE__ */ __name((workspaceCwd) => buildWorkspaceSkillsStatus(
    workspaceCwd,
    managers,
    options.workspaceTrusted ?? true
  ), "provider");
  provider.invalidate = (workspaceCwd) => managers.delete(workspaceCwd);
  return provider;
}
__name(createWorkspaceSkillsStatusProvider, "createWorkspaceSkillsStatusProvider");
async function buildWorkspaceSkillsStatus(workspaceCwd, managers, workspaceTrusted) {
  try {
    const settings = loadSettings(workspaceCwd, {
      consumeCorruptionEnvVars: false,
      skipLoadEnvironment: !workspaceTrusted,
      skipWorkspaceSettings: !workspaceTrusted,
      workspaceTrusted
    });
    let skillManager = managers.get(workspaceCwd);
    if (!skillManager) {
      const rawLevels = !workspaceTrusted || isSafeModeEnv() ? void 0 : settings.merged.skills?.disabledLevels;
      const disabledLevels = new Set(
        Array.isArray(rawLevels) ? rawLevels.filter(
          (v) => typeof v === "string" && VALID_SKILL_LEVELS.has(v)
        ) : []
      );
      const shim = {
        // Honor the safe-mode env the same way `Config` does when no explicit
        // flag is passed, so an operator running in safe mode gets the same
        // bundled-only listing the child would produce.
        isSafeMode: /* @__PURE__ */ __name(() => !workspaceTrusted || isSafeModeEnv(), "isSafeMode"),
        // Bare mode is the interactive `--bare` CLI flag; the daemon never runs
        // bare, so it is always off here.
        getBareMode: /* @__PURE__ */ __name(() => false, "getBareMode"),
        getProjectRoot: /* @__PURE__ */ __name(() => workspaceCwd, "getProjectRoot"),
        // Extension skills need active-extension context that only the child
        // has; omit them here and let the session snapshot surface them.
        getActiveExtensions: /* @__PURE__ */ __name(() => [], "getActiveExtensions"),
        getDisabledSkillLevels: /* @__PURE__ */ __name(() => disabledLevels, "getDisabledSkillLevels")
      };
      skillManager = new SkillManager(shim);
      managers.set(workspaceCwd, skillManager);
    }
    const disablements = resolveSkillSettings(settings).disablements;
    const skills = await skillManager.listSkills();
    return {
      v: STATUS_SCHEMA_VERSION,
      workspaceCwd,
      initialized: true,
      skills: skills.map(
        (skill) => mapSkillConfigToStatus(skill, disablements)
      )
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeStderrLine(
      `qwen serve: daemon-local skills enumeration failed for ${workspaceCwd}: ${message}`
    );
    return {
      v: STATUS_SCHEMA_VERSION,
      workspaceCwd,
      initialized: false,
      skills: [],
      errors: [
        {
          kind: "skills",
          status: "error",
          error: message
        }
      ]
    };
  }
}
__name(buildWorkspaceSkillsStatus, "buildWorkspaceSkillsStatus");

export {
  createWorkspaceSkillsStatusProvider
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
