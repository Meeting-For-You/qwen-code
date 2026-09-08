// Force strict mode and setup for ESM
"use strict";
import {
  isTerminalWorkflowStatus
} from "./chunk-ECPD3WSG.js";
import {
  Storage,
  createDebugLogger
} from "./chunk-UHQFIS7N.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/agents/runtime/workflow-saved.ts
init_esbuild_shims();
import { promises as fs } from "node:fs";
import * as path from "node:path";
var debugLogger = createDebugLogger("WORKFLOW_SAVED");
var WORKFLOW_NAME_PATTERN = /^[a-z][a-z0-9-]{0,40}$/;
function validateWorkflowName(name) {
  if (!name) return "Workflow name is required.";
  if (!WORKFLOW_NAME_PATTERN.test(name)) {
    return `Invalid workflow name "${name}". Use lower-case letters, digits, and hyphens only (must start with a letter, max 41 chars).`;
  }
  return null;
}
__name(validateWorkflowName, "validateWorkflowName");
function getSavedWorkflowDirs(config) {
  return [
    { dir: config.storage.getProjectWorkflowsDir(), source: "project" },
    { dir: Storage.getUserWorkflowsDir(), source: "user" }
  ];
}
__name(getSavedWorkflowDirs, "getSavedWorkflowDirs");
function getWorkflowScriptRoots(config) {
  return [
    ...getSavedWorkflowDirs(config).map(({ dir }) => dir),
    config.storage.getGeneratedWorkflowsDir()
  ];
}
__name(getWorkflowScriptRoots, "getWorkflowScriptRoots");
async function isSymlinkedRoot(dir) {
  return fs.lstat(dir).then((st) => st.isSymbolicLink()).catch(() => false);
}
__name(isSymlinkedRoot, "isSymlinkedRoot");
async function listJsFiles(dir) {
  if (await isSymlinkedRoot(dir)) {
    debugLogger.warn(`refusing symlinked saved-workflow dir: ${dir}`);
    return [];
  }
  try {
    const names = await fs.readdir(dir);
    const out = [];
    for (const n of names) {
      if (!n.endsWith(".js")) continue;
      const st = await fs.lstat(path.join(dir, n)).catch(() => null);
      if (!st || st.isSymbolicLink()) continue;
      out.push(n);
    }
    return out;
  } catch (e) {
    const code = e?.code;
    if (code !== "ENOENT") {
      debugLogger.warn(`listJsFiles failed for ${dir}: ${e}`);
    }
    return [];
  }
}
__name(listJsFiles, "listJsFiles");
async function readWorkflowFileSecurely(filePath, config) {
  const real = await fs.realpath(filePath);
  const roots = await Promise.all(
    getWorkflowScriptRoots(config).map(async (dir) => {
      if (await isSymlinkedRoot(dir)) return { dir, real: null };
      try {
        return { dir, real: await fs.realpath(dir) };
      } catch {
        return { dir, real: path.resolve(dir) };
      }
    })
  );
  const dirs = roots.flatMap((r) => r.real === null ? [] : [r.real]);
  const inside = dirs.some((d) => real === d || real.startsWith(d + path.sep));
  if (!inside) {
    const refused = roots.flatMap((r) => r.real === null ? [r.dir] : []);
    const refusedNote = refused.length > 0 ? `; refused symlinked ${refused.length === 1 ? "root" : "roots"}: ${refused.join(", ")}` : "";
    throw new Error(
      `refusing to load a workflow file outside the workflow script roots (checked: ${dirs.join(", ")}${refusedNote}): '${filePath}'.`
    );
  }
  return fs.readFile(real, "utf8");
}
__name(readWorkflowFileSecurely, "readWorkflowFileSecurely");
async function listSavedWorkflows(config) {
  const byName = /* @__PURE__ */ new Map();
  for (const { dir, source } of [...getSavedWorkflowDirs(config)].reverse()) {
    for (const file of await listJsFiles(dir)) {
      const name = file.slice(0, -".js".length);
      if (!WORKFLOW_NAME_PATTERN.test(name)) continue;
      byName.set(name, { name, scriptPath: path.join(dir, file), source });
    }
  }
  return Array.from(byName.values()).sort(
    (a, b) => a.name.localeCompare(b.name)
  );
}
__name(listSavedWorkflows, "listSavedWorkflows");
async function resolveSavedWorkflowScript(nameOrRef, config) {
  if (typeof nameOrRef === "object" && nameOrRef !== null) {
    const scriptPath = nameOrRef.scriptPath;
    if (typeof scriptPath !== "string" || scriptPath.length === 0) {
      throw new Error(
        "workflow() expects a workflow name (string) or {scriptPath: string}."
      );
    }
    let script;
    try {
      script = await readWorkflowFileSecurely(scriptPath, config);
    } catch (e) {
      throw new Error(
        `workflow({scriptPath: '${scriptPath}'}): ${e instanceof Error ? e.message : String(e)}`
      );
    }
    const name2 = path.basename(scriptPath).replace(/\.js$/, "");
    return { name: name2, scriptPath, script };
  }
  if (typeof nameOrRef !== "string") {
    throw new Error(
      "workflow() expects a workflow name (string) or {scriptPath: string}."
    );
  }
  const name = nameOrRef;
  const nameError = validateWorkflowName(name);
  if (nameError) {
    throw new Error(`workflow('${name}'): ${nameError}`);
  }
  for (const { dir } of getSavedWorkflowDirs(config)) {
    const scriptPath = path.join(dir, `${name}.js`);
    try {
      const script = await readWorkflowFileSecurely(scriptPath, config);
      return { name, scriptPath, script };
    } catch {
    }
  }
  const available = (await listSavedWorkflows(config)).map((e) => e.name);
  throw new Error(
    `workflow('${name}'): no workflow with that name. Available: ${available.length > 0 ? available.join(", ") : "(none)"}.`
  );
}
__name(resolveSavedWorkflowScript, "resolveSavedWorkflowScript");
async function saveWorkflowScript(config, opts) {
  const { name, scope, script, overwrite = false } = opts;
  const nameError = validateWorkflowName(name);
  if (nameError) return { status: "invalid-name", error: nameError };
  if (!script || script.trim().length === 0) {
    return {
      status: "empty-script",
      error: "This run has no script source to save."
    };
  }
  const dir = scope === "project" ? config.storage.getProjectWorkflowsDir() : Storage.getUserWorkflowsDir();
  if (await isSymlinkedRoot(dir)) {
    throw new Error(
      `refusing to save into a symlinked saved-workflow directory: '${dir}'.`
    );
  }
  const filePath = path.join(dir, `${name}.js`);
  if (!overwrite) {
    try {
      await fs.access(filePath);
      return { status: "exists", name, scope, path: filePath };
    } catch {
    }
  }
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, script, "utf8");
  return { status: "saved", name, scope, path: filePath };
}
__name(saveWorkflowScript, "saveWorkflowScript");

// packages/core/src/agents/workflow-snapshot.ts
init_esbuild_shims();
import { promises as fs2 } from "node:fs";
var debugLogger2 = createDebugLogger("WORKFLOW_SNAPSHOT");
var MAX_RETAINED_SNAPSHOTS = 30;
function toSnapshot(task) {
  if (!isTerminalWorkflowStatus(task.status)) {
    throw new Error(`Cannot snapshot active workflow ${task.runId}.`);
  }
  return {
    runId: task.runId,
    description: task.description,
    sourceRunId: task.sourceRunId,
    startMode: task.startMode,
    meta: task.meta,
    status: task.status,
    script: task.script ?? "",
    scriptPath: task.scriptPath,
    phases: [...task.phases],
    phaseVisits: task.phaseVisits.map((visit) => ({ ...visit })),
    dispatches: task.dispatches.map((dispatch) => ({
      ...dispatch,
      dependsOn: [...dispatch.dependsOn]
    })),
    agentsDispatched: task.agentsDispatched,
    agentsCompleted: task.agentsCompleted,
    tokensSpent: task.tokensSpent,
    tokenBudgetTotal: task.tokenBudgetTotal,
    perPhaseTokens: Array.from(task.perPhaseTokens.entries()),
    recentLogs: [...task.recentLogs],
    events: task.events.map((event) => ({ ...event })),
    startTime: task.startTime,
    endTime: task.endTime,
    result: safeResult(task.result),
    error: task.error
  };
}
__name(toSnapshot, "toSnapshot");
function safeResult(result) {
  if (result === void 0) return void 0;
  try {
    JSON.stringify(result);
    return result;
  } catch {
    return `(non-JSON-serializable ${typeof result})`;
  }
}
__name(safeResult, "safeResult");
async function writeWorkflowSnapshot(config, task) {
  const storage = config.storage;
  if (!storage) return;
  try {
    const snapshot = toSnapshot(task);
    const dir = storage.getWorkflowRunsDir();
    await fs2.mkdir(dir, { recursive: true });
    await fs2.writeFile(
      storage.getWorkflowRunSnapshotPath(task.runId),
      JSON.stringify(snapshot, null, 2),
      "utf8"
    );
    await pruneSnapshots(dir);
  } catch (e) {
    debugLogger2.warn(`writeWorkflowSnapshot failed for ${task.runId}: ${e}`);
  }
}
__name(writeWorkflowSnapshot, "writeWorkflowSnapshot");
async function listWorkflowSnapshots(config) {
  const storage = config.storage;
  if (!storage) return [];
  const dir = storage.getWorkflowRunsDir();
  let files;
  try {
    files = (await fs2.readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const snapshots = [];
  for (const file of files) {
    try {
      const raw = await fs2.readFile(`${dir}/${file}`, "utf8");
      const parsed = JSON.parse(raw);
      if (!isWorkflowSnapshot(parsed)) {
        debugLogger2.warn(`skipping invalid workflow snapshot ${file}`);
        continue;
      }
      snapshots.push(parsed);
    } catch (e) {
      debugLogger2.warn(`skipping unparseable snapshot ${file}: ${e}`);
    }
  }
  snapshots.sort((a, b) => (b.startTime ?? 0) - (a.startTime ?? 0));
  return snapshots;
}
__name(listWorkflowSnapshots, "listWorkflowSnapshots");
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
__name(isRecord, "isRecord");
function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}
__name(isFiniteNumber, "isFiniteNumber");
function isOptionalString(value) {
  return value === void 0 || typeof value === "string";
}
__name(isOptionalString, "isOptionalString");
function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
__name(isStringArray, "isStringArray");
function isWorkflowMeta(value) {
  if (value === null) return true;
  if (!isRecord(value)) return false;
  if (typeof value["name"] !== "string" || typeof value["description"] !== "string" || !isOptionalString(value["whenToUse"])) {
    return false;
  }
  const phases = value["phases"];
  return phases === void 0 || Array.isArray(phases) && phases.every(
    (phase) => isRecord(phase) && typeof phase["title"] === "string" && isOptionalString(phase["detail"]) && isOptionalString(phase["model"])
  );
}
__name(isWorkflowMeta, "isWorkflowMeta");
function isWorkflowPhaseVisit(value) {
  return isRecord(value) && typeof value["id"] === "string" && isFiniteNumber(value["index"]) && typeof value["title"] === "string" && isFiniteNumber(value["startedAt"]) && (value["endedAt"] === void 0 || isFiniteNumber(value["endedAt"]));
}
__name(isWorkflowPhaseVisit, "isWorkflowPhaseVisit");
function isWorkflowDispatch(value) {
  if (!isRecord(value)) return false;
  const status = value["status"];
  return typeof value["id"] === "string" && (value["phaseVisitId"] === null || typeof value["phaseVisitId"] === "string") && typeof value["label"] === "string" && typeof value["prompt"] === "string" && isOptionalString(value["subagentId"]) && (status === "queued" || status === "running" || status === "completed" || status === "failed" || status === "cancelled" || status === "cached") && isStringArray(value["dependsOn"]) && isFiniteNumber(value["queuedAt"]) && (value["startedAt"] === void 0 || isFiniteNumber(value["startedAt"])) && (value["endedAt"] === void 0 || isFiniteNumber(value["endedAt"])) && isOptionalString(value["error"]);
}
__name(isWorkflowDispatch, "isWorkflowDispatch");
function hasOnlyKeys(value, keys) {
  const allowed = new Set(keys);
  return Object.keys(value).every((key) => allowed.has(key));
}
__name(hasOnlyKeys, "hasOnlyKeys");
function isWorkflowEvent(value) {
  if (!isRecord(value) || typeof value["id"] !== "string" || !isFiniteNumber(value["at"]) || typeof value["type"] !== "string") {
    return false;
  }
  const base = ["id", "type", "at"];
  switch (value["type"]) {
    case "phase-started":
      return hasOnlyKeys(value, [...base, "phaseVisitId", "title"]) && typeof value["phaseVisitId"] === "string" && typeof value["title"] === "string";
    case "phase-completed":
      return hasOnlyKeys(value, [...base, "phaseVisitId"]) && typeof value["phaseVisitId"] === "string";
    case "dispatch-queued":
    case "dispatch-started":
    case "dispatch-completed":
    case "dispatch-cancelled":
    case "dispatch-cached":
      return hasOnlyKeys(value, [...base, "dispatchId"]) && typeof value["dispatchId"] === "string";
    case "dispatch-failed":
      return hasOnlyKeys(value, [...base, "dispatchId", "error"]) && typeof value["dispatchId"] === "string" && typeof value["error"] === "string";
    case "log":
      return hasOnlyKeys(value, [...base, "message"]) && typeof value["message"] === "string";
    case "approval-requested":
    case "approval-settled":
      return hasOnlyKeys(value, [...base, "name", "dispatchId"]) && typeof value["name"] === "string" && isOptionalString(value["dispatchId"]);
    case "workflow-completed":
    case "workflow-cancelled":
      return hasOnlyKeys(value, base);
    case "workflow-failed":
      return hasOnlyKeys(value, [...base, "error"]) && typeof value["error"] === "string";
    default:
      return false;
  }
}
__name(isWorkflowEvent, "isWorkflowEvent");
function isWorkflowSnapshot(value) {
  if (!isRecord(value)) return false;
  const status = value["status"];
  const phaseVisits = value["phaseVisits"];
  const dispatches = value["dispatches"];
  const events = value["events"];
  const perPhaseTokens = value["perPhaseTokens"];
  return typeof value["runId"] === "string" && value["runId"].length > 0 && isOptionalString(value["description"]) && isOptionalString(value["sourceRunId"]) && (value["startMode"] === void 0 || value["startMode"] === "retry" || value["startMode"] === "rerun") && isWorkflowMeta(value["meta"]) && (status === "completed" || status === "failed" || status === "cancelled") && typeof value["script"] === "string" && isOptionalString(value["scriptPath"]) && isStringArray(value["phases"]) && (phaseVisits === void 0 || Array.isArray(phaseVisits) && phaseVisits.every(isWorkflowPhaseVisit)) && (dispatches === void 0 || Array.isArray(dispatches) && dispatches.every(isWorkflowDispatch)) && (events === void 0 || Array.isArray(events) && events.every(isWorkflowEvent)) && isFiniteNumber(value["agentsDispatched"]) && isFiniteNumber(value["agentsCompleted"]) && isFiniteNumber(value["tokensSpent"]) && (value["tokenBudgetTotal"] === null || isFiniteNumber(value["tokenBudgetTotal"])) && Array.isArray(perPhaseTokens) && perPhaseTokens.every(
    (entry) => Array.isArray(entry) && entry.length === 2 && (entry[0] === null || typeof entry[0] === "string") && isFiniteNumber(entry[1])
  ) && isStringArray(value["recentLogs"]) && isFiniteNumber(value["startTime"]) && (value["endTime"] === void 0 || isFiniteNumber(value["endTime"])) && isOptionalString(value["error"]);
}
__name(isWorkflowSnapshot, "isWorkflowSnapshot");
async function pruneSnapshots(dir) {
  let files;
  try {
    files = (await fs2.readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return;
  }
  if (files.length <= MAX_RETAINED_SNAPSHOTS) return;
  const stats = await Promise.all(
    files.map(async (f) => {
      try {
        const s = await fs2.stat(`${dir}/${f}`);
        return { f, mtime: s.mtimeMs };
      } catch {
        return { f, mtime: 0 };
      }
    })
  );
  stats.sort((a, b) => a.mtime - b.mtime);
  const toPrune = stats.slice(0, stats.length - MAX_RETAINED_SNAPSHOTS);
  await Promise.all(
    toPrune.map((s) => {
      const runId = s.f.replace(/\.json$/, "");
      const isRunDir = /^wf_[0-9a-f]+$/.test(runId);
      return Promise.all([
        fs2.unlink(`${dir}/${s.f}`).catch(
          (e) => debugLogger2.warn(`prune unlink failed for ${s.f}: ${e}`)
        ),
        ...isRunDir ? [
          fs2.rm(`${dir}/${runId}`, { recursive: true, force: true }).catch(
            (e) => debugLogger2.warn(
              `prune journal dir failed for ${runId}: ${e}`
            )
          )
        ] : []
      ]);
    })
  );
}
__name(pruneSnapshots, "pruneSnapshots");

export {
  writeWorkflowSnapshot,
  listWorkflowSnapshots,
  validateWorkflowName,
  isSymlinkedRoot,
  listSavedWorkflows,
  resolveSavedWorkflowScript,
  saveWorkflowScript
};
/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
