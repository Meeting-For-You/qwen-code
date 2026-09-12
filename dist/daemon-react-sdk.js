import { A, i } from "./toolNames-kewwpc1v.js";
import { DaemonHttpError, isStaleBranchPointError, isDaemonTurnError, DaemonTransportClosedError, DaemonPendingPromptLimitError, asKnownDaemonEvent, EXTENSION_ARCHIVE_UPLOAD_TIMEOUT_MS, DaemonClient, MID_TURN_MESSAGE_INJECTED_EVENT, PENDING_PROMPT_ADDED_EVENT, PENDING_PROMPT_STARTED_EVENT, PENDING_PROMPT_COMPLETED_EVENT, createDaemonTranscriptStore, DaemonSessionClient, isUnrecognizedDiagnosticReason, normalizeDaemonEvent, estimateDaemonTranscriptBlockBytes, isTrimmedToolBlockId, isTrimmedPermissionBlockId, UNRECOGNIZED_DIAGNOSTICS_LIMIT, extractServerTimestamp, matchTurnEvent } from "@qwen-code/sdk/daemon";
import { DAEMON_APPROVAL_MODES } from "@qwen-code/sdk/daemon";
import { jsx } from "react/jsx-runtime";
import { createContext, useMemo, useRef, useState, useCallback, useEffect, useContext, useSyncExternalStore } from "react";
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function extractHttpStatus(error) {
  if (error instanceof DaemonHttpError) return error.status;
  if (isRecord(error) && typeof error["status"] === "number") {
    return error["status"];
  }
  return void 0;
}
function isInvalidClientIdError(error) {
  return error instanceof DaemonHttpError && error.status === 400 && isRecord(error.body) && error.body["code"] === "invalid_client_id";
}
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function mapProviderStatus(status, preferredCurrentModel) {
  var _a;
  if (!status) return { models: [] };
  const seen = /* @__PURE__ */ new Set();
  const models = [];
  let currentModel = preferredCurrentModel ?? ((_a = status.current) == null ? void 0 : _a.modelId);
  const currentMode = status.approvalMode;
  let contextWindow;
  for (const provider of status.providers) {
    for (const model of provider.models) {
      if (!currentModel && model.isCurrent) currentModel = model.modelId;
      if (contextWindow === void 0 && (currentModel ? model.modelId === currentModel : model.isCurrent)) {
        contextWindow = model.contextLimit;
      }
      const modelKey = [
        provider.authType,
        model.modelId,
        model.baseUrl ?? "",
        model.envKey ?? ""
      ].join("\0");
      if (seen.has(modelKey)) continue;
      seen.add(modelKey);
      const reasoningPreview = mapReasoningControls(model.configOptions);
      models.push({
        id: model.modelId,
        baseModelId: model.baseModelId,
        label: model.name || model.modelId,
        authType: provider.authType,
        ...model.contextLimit !== void 0 ? { contextWindow: model.contextLimit } : {},
        ...model.modalities !== void 0 ? { modalities: model.modalities } : {},
        ...model.baseUrl !== void 0 ? { baseUrl: model.baseUrl } : {},
        ...model.envKey !== void 0 ? { envKey: model.envKey } : {},
        ...model.isRuntime ? { isRuntime: true } : {},
        ...reasoningPreview ? { reasoningPreview } : {}
      });
    }
  }
  return { models, currentModel, currentMode, contextWindow };
}
function mapSessionContextModels(status) {
  var _a;
  const modelState = getRecord$1((_a = status == null ? void 0 : status.state) == null ? void 0 : _a.models);
  if (!modelState) return void 0;
  const currentModel = getString$2(modelState, "currentModelId") ?? getString$2(modelState, "currentModel");
  const availableModels = modelState["availableModels"];
  const models = [];
  let contextWindow;
  if (Array.isArray(availableModels)) {
    for (const rawModel of availableModels) {
      const model = getRecord$1(rawModel);
      const modelId = getString$2(model, "modelId") ?? getString$2(model, "id") ?? getString$2(model, "value");
      if (!modelId) continue;
      const meta = getRecord$1(model == null ? void 0 : model["_meta"]);
      const modelContextWindow = getNumber$1(meta, "contextLimit") ?? getNumber$1(meta, "contextWindow") ?? getNumber$1(model, "contextLimit") ?? getNumber$1(model, "contextWindow");
      if (contextWindow === void 0 && currentModel !== void 0 && modelId === currentModel) {
        contextWindow = modelContextWindow;
      }
      models.push({
        id: modelId,
        baseModelId: getString$2(model, "baseModelId") ?? stripAcpAuthSuffix(modelId),
        label: getString$2(model, "name") ?? getString$2(model, "label") ?? modelId,
        ...modelContextWindow !== void 0 ? { contextWindow: modelContextWindow } : {}
      });
    }
  }
  if (!currentModel && models.length === 0) return void 0;
  return { models, currentModel, contextWindow };
}
function mapReasoningControls(configOptions, fallbackEffort) {
  if (!Array.isArray(configOptions)) return void 0;
  const option = configOptions.map(getRecord$1).find((item) => getString$2(item, "id") === "reasoning_effort");
  const rawOptions = option == null ? void 0 : option["options"];
  if (!option || !Array.isArray(rawOptions)) return void 0;
  const values = rawOptions.flatMap((item) => {
    const value = getString$2(getRecord$1(item), "value");
    return value ? [value] : [];
  });
  if (!values.includes("none")) return void 0;
  const currentValue = getString$2(option, "currentValue");
  if (!currentValue || !values.includes(currentValue)) return void 0;
  const meta = getRecord$1(option["_meta"]);
  const reasoningMeta = getRecord$1(meta == null ? void 0 : meta["qwenCode/reasoning"]);
  const selectableValues = values.filter((value) => value !== "none");
  if (selectableValues.length === 0) return void 0;
  if ((reasoningMeta == null ? void 0 : reasoningMeta["toggleOnly"]) === true) {
    return {
      enabled: currentValue !== "none",
      effort: selectableValues[0],
      efforts: []
    };
  }
  const efforts = selectableValues;
  const defaultEffort = getString$2(reasoningMeta, "defaultEffort");
  const effort = [currentValue, fallbackEffort, defaultEffort].find(
    (value) => typeof value === "string" && efforts.includes(value)
  ) ?? efforts[0];
  return { enabled: currentValue !== "none", effort, efforts };
}
function mapSessionContextReasoning(status, fallbackEffort) {
  var _a;
  return mapReasoningControls((_a = status == null ? void 0 : status.state) == null ? void 0 : _a.configOptions, fallbackEffort);
}
function mapSupportedCommands(status) {
  if (!status) return { commands: [], skills: [] };
  const commands = status.availableCommands.map((command) => {
    var _a;
    return {
      name: command.name,
      description: command.description || "",
      ...((_a = command.input) == null ? void 0 : _a.hint) ? { argumentHint: command.input.hint } : {},
      ...mapCommandMeta(command._meta),
      raw: command
    };
  });
  const skillCommands = status.availableSkills.map((skill) => ({
    name: skill,
    description: "",
    raw: {
      name: skill,
      description: "",
      input: null,
      _meta: { source: "skill" }
    }
  }));
  return {
    commands: mergeCommands(commands, skillCommands),
    skills: status.availableSkills
  };
}
function mapWorkspaceSkills(status) {
  if (!status) return { commands: [], skills: [] };
  const availableSkills = status.skills.filter(
    (skill) => skill.status === "ok"
  );
  const commands = availableSkills.map((skill) => ({
    name: skill.name,
    description: skill.description || "",
    ...skill.argumentHint ? { argumentHint: skill.argumentHint } : {},
    raw: {
      name: skill.name,
      description: skill.description || "",
      input: skill.argumentHint ? { hint: skill.argumentHint } : null,
      _meta: { source: "skill" }
    }
  }));
  return {
    commands,
    skills: availableSkills.map((skill) => skill.name)
  };
}
function mergeCommands(...groups) {
  const byName = /* @__PURE__ */ new Map();
  for (const group of groups) {
    for (const command of group) {
      const existing = byName.get(command.name);
      if (existing) {
        byName.set(command.name, {
          ...existing,
          ...command,
          description: command.description || existing.description,
          argumentHint: command.argumentHint ?? existing.argumentHint,
          raw: command.raw
        });
      } else {
        byName.set(command.name, command);
      }
    }
  }
  return [...byName.values()];
}
function updateConnectionFromDaemonEvent(event, setConnection) {
  var _a;
  if (event.type === "session_update") {
    const update = getRecord$1((_a = getRecord$1(event.data)) == null ? void 0 : _a["update"]);
    const tokenUsage = getUsageTokenUsage(update);
    if (tokenUsage) {
      setConnection((current) => ({
        ...current,
        tokenUsage,
        tokenCount: getTokenCountFromUsage(tokenUsage)
      }));
    }
    const goalState = getGoalState(update);
    if (goalState) {
      setConnection((current) => ({
        ...current,
        goalState: selectGoalState(current.goalState, goalState)
      }));
    }
    if (getString$2(update, "sessionUpdate") === "available_commands_update") {
      const { commands, skills } = mapAvailableCommandsUpdate(update);
      setConnection((current) => ({
        ...current,
        commands,
        skills
      }));
    }
    return;
  }
  switch (event.type) {
    case "git_branch_changed": {
      const data = getRecord$1(event.data);
      const workspaceCwd = getString$2(data, "workspaceCwd");
      const branch = getString$2(data, "branch");
      setConnection(
        (current) => workspaceCwd && workspaceCwd !== current.workspaceCwd ? current : { ...current, gitBranch: branch }
      );
      break;
    }
    case "git_status_changed": {
      const data = getRecord$1(event.data);
      const workspaceCwd = getString$2(data, "workspaceCwd");
      setConnection(
        (current) => workspaceCwd && workspaceCwd !== current.workspaceCwd ? current : {
          ...current,
          gitStatus: data
        }
      );
      break;
    }
    case "session_metadata_updated": {
      const data = getRecord$1(event.data);
      if (Object.prototype.hasOwnProperty.call(data ?? {}, "displayName")) {
        setConnection((current) => ({
          ...current,
          displayName: getString$2(data, "displayName")
        }));
      }
      break;
    }
    case "model_switched": {
      const modelId = getString$2(getRecord$1(event.data), "modelId");
      if (modelId) {
        setConnection((current) => ({
          ...current,
          currentModel: modelId,
          reasoning: current.currentModel === modelId ? current.reasoning : void 0
        }));
      }
      break;
    }
    case "approval_mode_changed": {
      const data = getRecord$1(event.data);
      const mode = getString$2(data, "next") ?? getString$2(data, "mode");
      if (mode) {
        setConnection((current) => ({ ...current, currentMode: mode }));
      }
      break;
    }
  }
}
function selectGoalStateFromRead(current, incoming, observedGoalId) {
  if (incoming.goal === null && !incoming.clearedGoal && (current == null ? void 0 : current.goal) && current.goal.goalId !== observedGoalId) {
    return current;
  }
  return selectGoalState(current, incoming);
}
function selectGoalState(current, incoming) {
  const supersededByCurrent = current ? supersededGoals.get(current) : void 0;
  let displacedGoal;
  if (incoming.goal === null) {
    const clearedGoal = incoming.clearedGoal ?? (current == null ? void 0 : current.goal) ?? (current ? clearedGoalOrder.get(current) : void 0);
    if (clearedGoal) {
      if ((current == null ? void 0 : current.goal) && (current.goal.goalId !== clearedGoal.goalId || current.goal.revision > clearedGoal.revision || current.goal.revision === clearedGoal.revision && current.goal.updatedAt > clearedGoal.updatedAt)) {
        return current;
      }
      displacedGoal = {
        goalId: clearedGoal.goalId,
        revision: clearedGoal.revision,
        updatedAt: clearedGoal.updatedAt
      };
      clearedGoalOrder.set(incoming, displacedGoal);
    }
  }
  if ((current == null ? void 0 : current.goal) === null && incoming.goal) {
    const clearedGoal = clearedGoalOrder.get(current);
    if ((clearedGoal == null ? void 0 : clearedGoal.goalId) === incoming.goal.goalId && isSupersededGoalFrame(clearedGoal, incoming.goal)) {
      return current;
    }
  }
  if (current && incoming.goal) {
    const superseded = supersededByCurrent == null ? void 0 : supersededByCurrent.get(incoming.goal.goalId);
    if (superseded && isSupersededGoalFrame(superseded, incoming.goal)) {
      return current;
    }
  }
  if ((current == null ? void 0 : current.goal) && incoming.goal && current.goal.goalId === incoming.goal.goalId && (incoming.goal.revision < current.goal.revision || incoming.goal.revision === current.goal.revision && incoming.goal.updatedAt < current.goal.updatedAt)) {
    return current;
  }
  if ((current == null ? void 0 : current.goal) && incoming.goal && current.goal.goalId !== incoming.goal.goalId) {
    displacedGoal = {
      goalId: current.goal.goalId,
      revision: current.goal.revision,
      updatedAt: current.goal.updatedAt
    };
  }
  rememberSupersededGoals(incoming, supersededByCurrent, displacedGoal);
  return incoming;
}
function isSupersededGoalFrame(superseded, goal) {
  return goal.revision < superseded.revision || goal.revision === superseded.revision && goal.updatedAt <= superseded.updatedAt;
}
function rememberSupersededGoals(snapshot, inherited, displaced) {
  if (!inherited && !displaced) return;
  const next = new Map(inherited ?? []);
  if (snapshot.goal) next.delete(snapshot.goal.goalId);
  if (displaced) {
    next.delete(displaced.goalId);
    next.set(displaced.goalId, displaced);
  }
  while (next.size > MAX_SUPERSEDED_GOALS) {
    const oldest = next.keys().next();
    if (oldest.done) break;
    next.delete(oldest.value);
  }
  if (next.size === 0) return;
  supersededGoals.set(snapshot, next);
}
const MAX_SUPERSEDED_GOALS = 8;
const clearedGoalOrder = /* @__PURE__ */ new WeakMap();
const supersededGoals = /* @__PURE__ */ new WeakMap();
function getGoalState(update) {
  var _a;
  const raw = getRecord$1((_a = getRecord$1(update == null ? void 0 : update["_meta"])) == null ? void 0 : _a["goalState"]);
  if (getNumber$1(raw, "v") !== 2) return void 0;
  const activity = getString$2(raw, "activity");
  if (activity !== "idle" && activity !== "running" && activity !== "verifying") {
    return void 0;
  }
  if ((raw == null ? void 0 : raw["goal"]) === null) {
    const clearedGoal = getRecord$1(raw["clearedGoal"]);
    const clearedGoalId = getString$2(clearedGoal, "goalId");
    const clearedRevision = getNumber$1(clearedGoal, "revision");
    const clearedUpdatedAt = getNumber$1(clearedGoal, "updatedAt");
    if (raw["clearedGoal"] !== void 0 && (!clearedGoalId || clearedRevision === void 0 || clearedRevision <= 0 || clearedUpdatedAt === void 0)) {
      return void 0;
    }
    return {
      v: 2,
      goal: null,
      activity,
      ...clearedGoalId && clearedRevision !== void 0 && clearedUpdatedAt !== void 0 ? {
        clearedGoal: {
          goalId: clearedGoalId,
          revision: clearedRevision,
          updatedAt: clearedUpdatedAt
        }
      } : {}
    };
  }
  const source = getRecord$1(raw == null ? void 0 : raw["goal"]);
  const goalId = getString$2(source, "goalId");
  const revision = getNumber$1(source, "revision");
  const objective = getString$2(source, "objective");
  const status = getString$2(source, "status");
  const evidenceCursor = getRecord$1(source == null ? void 0 : source["evidenceCursor"]);
  const recordId = evidenceCursor == null ? void 0 : evidenceCursor["recordId"];
  const turnCount = getNumber$1(source, "turnCount");
  const activeTimeMs = getNumber$1(source, "activeTimeMs");
  const createdAt = getNumber$1(source, "createdAt");
  const updatedAt = getNumber$1(source, "updatedAt");
  if (!goalId || revision === void 0 || !objective || status !== "active" && status !== "paused" && status !== "blocked" && status !== "usage_limited" && status !== "complete" || recordId !== null && typeof recordId !== "string" || turnCount === void 0 || activeTimeMs === void 0 || createdAt === void 0 || updatedAt === void 0) {
    return void 0;
  }
  const lastReason = getString$2(source, "lastReason");
  const limitKindRaw = getString$2(source, "limitKind");
  const limitKind = limitKindRaw === "evidence_catalog" || limitKindRaw === "checkpoint_request" || limitKindRaw === "token_budget" ? limitKindRaw : void 0;
  return {
    v: 2,
    activity,
    goal: {
      goalId,
      revision,
      objective,
      status,
      evidenceCursor: { recordId },
      turnCount,
      activeTimeMs,
      createdAt,
      updatedAt,
      ...lastReason ? { lastReason } : {},
      ...limitKind ? { limitKind } : {}
    }
  };
}
function getSessionDisplayName(state) {
  const displayName = getString$2(state, "displayName");
  return (displayName == null ? void 0 : displayName.trim()) ? displayName : void 0;
}
function getCurrentMode(status) {
  var _a;
  const modes = getRecord$1((_a = status == null ? void 0 : status.state) == null ? void 0 : _a.modes);
  return getString$2(modes, "currentModeId") ?? getString$2(modes, "currentMode");
}
function getTokenCountFromUsage(usage) {
  const preferred = (usage == null ? void 0 : usage.inputTokens) ?? (usage == null ? void 0 : usage.totalTokens);
  if (preferred !== void 0 && preferred > 0) return preferred;
  if (!usage) return void 0;
  const total = Object.values(usage).reduce(
    (sum, value) => sum + (typeof value === "number" ? value : 0),
    0
  );
  return total > 0 ? total : void 0;
}
function getReplayTokenUsage(events2) {
  var _a;
  for (let i2 = events2.length - 1; i2 >= 0; i2--) {
    try {
      const event = events2[i2];
      if (event.type !== "session_update") continue;
      const update = getRecord$1((_a = getRecord$1(event.data)) == null ? void 0 : _a["update"]);
      const tokenUsage = getUsageTokenUsage(update);
      if (tokenUsage) return tokenUsage;
    } catch {
    }
  }
  return void 0;
}
function getUsageTokenUsage(update) {
  const meta = getRecord$1(update == null ? void 0 : update["_meta"]);
  if ((meta == null ? void 0 : meta["parentToolCallId"]) !== void 0) return void 0;
  const usage = getRecord$1(meta == null ? void 0 : meta["usage"]);
  const tokenUsage = {
    ...mapTokenUsageNumber(usage, "inputTokens"),
    ...mapTokenUsageNumber(usage, "outputTokens"),
    ...mapTokenUsageNumber(usage, "totalTokens"),
    ...mapTokenUsageNumber(usage, "thoughtTokens"),
    ...mapTokenUsageNumber(usage, "cachedReadTokens")
  };
  return getTokenCountFromUsage(tokenUsage) !== void 0 ? tokenUsage : void 0;
}
function mapTokenUsageNumber(usage, key) {
  const value = getNumber$1(usage, key);
  return value !== void 0 && value >= 0 ? { [key]: value } : {};
}
function mapAvailableCommandsUpdate(update) {
  var _a;
  if (!update) return { commands: [], skills: [] };
  const commandRecords = Array.isArray(update["availableCommands"]) ? update["availableCommands"] : [];
  const commands = commandRecords.flatMap((raw) => {
    var _a2;
    const command = getRecord$1(raw);
    const name = getString$2(command, "name");
    if (!name) return [];
    const input = getRecord$1(command == null ? void 0 : command["input"]);
    const daemonCommand = {
      name,
      description: getString$2(command, "description") ?? "",
      input: input ? { hint: getString$2(input, "hint") ?? "" } : null,
      _meta: getRecord$1(command == null ? void 0 : command["_meta"]) ?? null
    };
    return [
      {
        name,
        description: daemonCommand.description ?? "",
        ...((_a2 = daemonCommand.input) == null ? void 0 : _a2.hint) ? { argumentHint: daemonCommand.input.hint } : {},
        ...mapCommandMeta(daemonCommand._meta),
        raw: daemonCommand
      }
    ];
  });
  const nestedSkills = (_a = getRecord$1(update["_meta"])) == null ? void 0 : _a["availableSkills"];
  const rawSkills = Array.isArray(update["availableSkills"]) ? update["availableSkills"] : Array.isArray(nestedSkills) ? nestedSkills : [];
  const skills = rawSkills.filter(
    (skill) => typeof skill === "string"
  );
  const skillCommands = skills.map((skill) => ({
    name: skill,
    description: "",
    raw: {
      name: skill,
      description: "",
      input: null,
      _meta: { source: "skill" }
    }
  }));
  return {
    commands: mergeCommands(commands, skillCommands),
    skills
  };
}
function mapCommandMeta(meta) {
  const record = meta ?? void 0;
  const source = getString$2(record, "source");
  return {
    ...source ? { source } : {}
  };
}
function getRecord$1(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  return value;
}
function getString$2(record, key) {
  const value = record == null ? void 0 : record[key];
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function getNumber$1(record, key) {
  const value = record == null ? void 0 : record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function stripAcpAuthSuffix(modelId) {
  const closeIdx = modelId.lastIndexOf(")");
  const openIdx = modelId.lastIndexOf("(");
  if (openIdx >= 0 && closeIdx === modelId.length - 1 && openIdx < closeIdx) {
    return modelId.slice(0, openIdx);
  }
  return modelId;
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function attachmentUriForName(name) {
  return `attachment:///${encodeURIComponent(name)}`;
}
function withAttachmentTokens(text, attachmentUris) {
  if (attachmentUris.length === 0 || text.trimStart().startsWith("/")) {
    return text;
  }
  const tokenText = attachmentUris.map((uri) => `@${uri}`).join("\n");
  return text.trim().length > 0 ? `${text.trimEnd()}

${tokenText}` : tokenText;
}
function daemonPromptImageToBlob(image) {
  const comma = image.data.indexOf(",");
  const encoded = image.data.startsWith("data:") && comma >= 0 ? image.data.slice(comma + 1) : image.data;
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i2 = 0; i2 < binary.length; i2 += 1) bytes[i2] = binary.charCodeAt(i2);
  return new Blob([bytes], {
    type: image.mimeType ?? image.mediaType ?? image.media_type ?? "image/*"
  });
}
function toDaemonPromptContent(text, images = [], files = []) {
  const withTokens = withAttachmentTokens(
    text,
    files.map((file) => attachmentUriForName(file.name))
  );
  const prompt = [{ type: "text", text: withTokens }];
  for (const image of images) {
    const mimeType = image.mimeType ?? image.mediaType ?? image.media_type;
    if (mimeType && mimeType !== "image/*") {
      prompt.push({
        type: "image",
        data: image.data,
        mimeType
      });
    } else {
      prompt.push({
        type: "image",
        data: image.data
      });
    }
  }
  for (const file of files) {
    if (file.text === void 0) {
      throw new TypeError(
        `File attachment content is unavailable: ${file.name}`
      );
    }
    const mimeType = file.mimeType ?? file.mediaType ?? file.media_type;
    prompt.push({
      type: "resource",
      resource: {
        uri: attachmentUriForName(file.name),
        ...mimeType ? { mimeType } : {},
        text: file.text
      }
    });
  }
  return prompt;
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const DEFAULT_ACTION_TIMEOUT_MS = 3e4;
function getReconnectDelayMs(attempt, reconnectDelayMs, maxReconnectDelayMs) {
  const base = Number.isFinite(reconnectDelayMs) && reconnectDelayMs > 0 ? reconnectDelayMs : 1e3;
  const max = Number.isFinite(maxReconnectDelayMs) && maxReconnectDelayMs > 0 ? Math.max(base, maxReconnectDelayMs) : base;
  const exponential = base * 2 ** Math.max(0, attempt - 1);
  const capped = Math.min(exponential, max);
  const jitter = 0.8 + Math.random() * 0.4;
  return Math.min(max, Math.max(1, Math.round(capped * jitter)));
}
async function withActionTimeout(promise, message, timeoutMs = DEFAULT_ACTION_TIMEOUT_MS) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_resolve, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${message} after ${timeoutMs}ms`));
        }, timeoutMs);
      })
    ]);
  } finally {
    if (timer !== void 0) clearTimeout(timer);
  }
}
function delay(delayMs, signal) {
  if (delayMs <= 0) return Promise.resolve();
  if (signal.aborted) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = setTimeout(finish, delayMs);
    function finish() {
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    }
    signal.addEventListener("abort", finish, { once: true });
  });
}
function clearPassiveAssistantDoneTimer(timerRef) {
  if (timerRef.current === void 0) return;
  clearTimeout(timerRef.current);
  timerRef.current = void 0;
}
function schedulePassiveAssistantDone(store, timerRef, reason = "replay", delayMs = 80, onDone) {
  clearPassiveAssistantDoneTimer(timerRef);
  timerRef.current = setTimeout(() => {
    timerRef.current = void 0;
    if (!store.getSnapshot().activeAssistantBlockId) return;
    store.dispatch({ type: "assistant.done", reason });
    onDone == null ? void 0 : onDone();
  }, delayMs);
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const WEBUI_SESSION_CLIENT_ID_PREFIX = "qwen-code-webui-client-id:session:";
function getStableClientId(clientId, sessionId) {
  if (clientId) return clientId;
  if (typeof window === "undefined") return createWebuiClientId();
  try {
    if (sessionId) {
      const existingSessionClientId = window.sessionStorage.getItem(
        sessionClientIdKey(sessionId)
      );
      if (existingSessionClientId) return existingSessionClientId;
    }
    return createWebuiClientId();
  } catch {
    return createWebuiClientId();
  }
}
function getPersistedClientId(sessionId) {
  if (typeof window === "undefined") return void 0;
  try {
    return window.sessionStorage.getItem(sessionClientIdKey(sessionId)) ?? void 0;
  } catch {
    return void 0;
  }
}
function persistStableClientId(clientId, sessionId) {
  if (!clientId || !sessionId || typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(sessionClientIdKey(sessionId), clientId);
  } catch {
  }
}
async function detachDaemonClient(opts) {
  if (!opts.clientId) return;
  const headers = {
    "X-Qwen-Client-Id": opts.clientId
  };
  if (opts.token) headers["Authorization"] = `Bearer ${opts.token}`;
  const url = `${stripTrailingSlashes$1(opts.baseUrl)}/session/${encodeURIComponent(
    opts.sessionId
  )}/detach`;
  const res = await fetch(url, { method: "POST", headers, keepalive: true });
  if (res.status === 204 || res.status === 404) return;
  throw new Error(`Detach client failed (${res.status})`);
}
function createWebuiClientId() {
  const random = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  return `webui_${random}`;
}
function sessionClientIdKey(sessionId) {
  return `${WEBUI_SESSION_CLIENT_ID_PREFIX}${encodeURIComponent(sessionId)}`;
}
function stripTrailingSlashes$1(url) {
  let end = url.length;
  while (end > 0 && url.charCodeAt(end - 1) === 47) {
    end -= 1;
  }
  return end === url.length ? url : url.slice(0, end);
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function isDaemonSessionDisconnectedError(error) {
  return error instanceof DaemonTransportClosedError || error instanceof TypeError && /(?:fetch failed|failed to fetch|networkerror|load failed)/i.test(
    error.message
  );
}
function normalizePromptFiles(files) {
  return (files ?? []).map((file) => ({
    name: file.name,
    data: file.data ?? new Blob([file.text ?? ""]),
    ...file.text !== void 0 ? { text: file.text } : {},
    mimeType: file.mimeType || file.mediaType || file.media_type || "text/plain"
  }));
}
function imageAttachmentMimeType(mimeType) {
  var _a;
  return ((_a = mimeType.split(";", 1)[0]) == null ? void 0 : _a.trim().toLowerCase()) || mimeType;
}
function imageAttachmentName(mimeType) {
  const extension = imageAttachmentMimeType(mimeType).slice("image/".length).split("+", 1)[0];
  return `image.${extension === "jpg" ? "jpeg" : extension || "img"}`;
}
function promptFilesForTranscript(files, fileReferences, includeData = false) {
  return files.map((file, index) => {
    var _a;
    return {
      name: ((_a = fileReferences[index]) == null ? void 0 : _a.attachmentId) ?? file.name,
      mimeType: file.mimeType,
      ...file.text !== void 0 ? { text: file.text } : {},
      ...includeData ? { data: file.data } : {},
      ...fileReferences[index] ? { attachmentId: fileReferences[index].attachmentId } : {}
    };
  });
}
class AttachmentUploadError extends Error {
  constructor(reason) {
    super(reason instanceof Error ? reason.message : String(reason));
    this.reason = reason;
  }
}
const DEFAULT_RESTORE_SERVER_TIMEOUT_MS = 6e4;
const RESTORE_REQUEST_HEADROOM_MS = 1e4;
const RESTORE_WATCHDOG_HEADROOM_MS = 15e3;
const ATTACH_WATCHDOG_TIMEOUT_MS = 3e4;
const MAX_TIMER_DELAY_MS = 2147483647;
function resolveSessionRestoreTimeouts(capabilities) {
  var _a;
  const advertised = (_a = capabilities == null ? void 0 : capabilities.limits) == null ? void 0 : _a.sessionRestoreTimeoutMs;
  const serverTimeoutMs = typeof advertised === "number" && Number.isInteger(advertised) && advertised > 0 ? advertised : DEFAULT_RESTORE_SERVER_TIMEOUT_MS;
  const requestTimeoutMs = serverTimeoutMs + RESTORE_REQUEST_HEADROOM_MS;
  const watchdogTimeoutMs = serverTimeoutMs + RESTORE_WATCHDOG_HEADROOM_MS;
  return {
    requestTimeoutMs: requestTimeoutMs > MAX_TIMER_DELAY_MS ? 0 : requestTimeoutMs,
    watchdogTimeoutMs: watchdogTimeoutMs > MAX_TIMER_DELAY_MS ? void 0 : watchdogTimeoutMs
  };
}
function clearPendingLoadTimeout(load) {
  if (load.timeout !== void 0) clearTimeout(load.timeout);
}
function normalizeWorkspaceIdentity(value) {
  return value ? value.replace(/\\/g, "/").replace(/\/+$/, "") || "/" : "";
}
function getWorkspaceModelsAfterSessionClear(current) {
  return current.providers ? mapProviderStatus(current.providers).models : current.models;
}
function getConnectionAfterSessionClear(current, clearedSessionId) {
  const next = { ...current };
  if (!clearedSessionId || current.sessionId === clearedSessionId) {
    delete next.sessionId;
    delete next.clientId;
    delete next.displayName;
    delete next.tokenUsage;
    delete next.tokenCount;
    delete next.goalState;
    delete next.supportedCommands;
    delete next.context;
    delete next.reasoning;
    next.models = getWorkspaceModelsAfterSessionClear(current);
  }
  return {
    ...next,
    status: "connected",
    loadingTranscript: void 0,
    catchingUp: void 0,
    error: void 0,
    errorStatus: void 0,
    missingSession: false
  };
}
function createDaemonSessionActions({
  store,
  sessionRef,
  activePromptsRef,
  settledPromptsRef,
  pendingSessionLoadRef,
  pendingSessionLoadIdRef,
  sessionConfigGeneration,
  heartbeatSupportedRef,
  manualSessionClearRef,
  skipNextCleanupDetachSessionRef,
  passiveAssistantDoneTimerRef,
  getCreateSessionRequest,
  createDetachedSession,
  getConnection,
  hasSessionActivePrompt,
  resetCurrentSessionActivePrompt,
  restartEventStream,
  addNotice,
  setConnection,
  setPromptStatus,
  setRestoreSessionId,
  setRestoreWorkspaceCwd,
  setRestoreMode,
  setRestoreSessionNonce,
  setAttachSessionNonce,
  setNewSessionNonce,
  clearLiveJournalRepair = () => void 0
}) {
  var _a, _b, _c;
  const silentHardFailureNoticeKeys = /* @__PURE__ */ new Set();
  let noticeOwner = sessionRef.current;
  let reasoningActionToken = 0;
  let appliedReasoningActionToken = 0;
  let modelMutationGeneration = 0;
  let branchInFlight = false;
  let attachmentClient = (_a = sessionRef.current) == null ? void 0 : _a.client;
  let attachmentSessionId = (_b = sessionRef.current) == null ? void 0 : _b.sessionId;
  let attachmentClientId = (_c = sessionRef.current) == null ? void 0 : _c.clientId;
  function trackSessionConfigMutation(session, operation) {
    sessionConfigGeneration.set(
      session,
      (sessionConfigGeneration.get(session) ?? 0) + 1
    );
    void operation.then(
      () => finishSessionConfigMutation(session),
      () => finishSessionConfigMutation(session)
    );
    return operation;
  }
  function finishSessionConfigMutation(session) {
    sessionConfigGeneration.set(
      session,
      (sessionConfigGeneration.get(session) ?? 0) + 1
    );
  }
  async function promptContentWithUploadedAttachments(session, text, images, files, signal) {
    var _a2;
    if (text.trimStart().startsWith("/")) {
      return {
        content: toDaemonPromptContent(text),
        references: [],
        fileReferences: []
      };
    }
    const supportsAttachmentUpload = ((_a2 = getConnection().capabilities) == null ? void 0 : _a2.features.includes("session_attachments")) === true;
    const canUploadAttachments = supportsAttachmentUpload && typeof session.uploadAttachment === "function";
    if (files.length > 0 && !canUploadAttachments) {
      throw new Error("File attachment upload is not supported");
    }
    const uploadableImages = canUploadAttachments ? images.filter((image) => image.mimeType !== "image/*") : [];
    const inlineImages = images.filter(
      (image) => !uploadableImages.includes(image)
    );
    const uploadableFiles = canUploadAttachments ? files : [];
    const inlineFiles = files.filter((file) => !uploadableFiles.includes(file));
    if (uploadableImages.length === 0 && uploadableFiles.length === 0) {
      return {
        content: toDaemonPromptContent(text, images, files),
        references: [],
        fileReferences: []
      };
    }
    const results = await Promise.allSettled([
      ...uploadableImages.map(
        async (image) => await session.uploadAttachment(
          daemonPromptImageToBlob(image),
          imageAttachmentName(image.mimeType),
          imageAttachmentMimeType(image.mimeType),
          signal
        )
      ),
      ...uploadableFiles.map(
        async (file) => await session.uploadAttachment(
          file.data,
          file.name,
          file.mimeType,
          signal
        )
      )
    ]);
    const references = results.flatMap(
      (result) => result.status === "fulfilled" ? [result.value] : []
    );
    const failure = results.find(
      (result) => result.status === "rejected"
    );
    if (!failure) {
      const content = toDaemonPromptContent(text, inlineImages, inlineFiles);
      const fileReferences = references.slice(uploadableImages.length);
      content[0] = {
        type: "text",
        text: withAttachmentTokens(
          text,
          files.map(
            (file, index) => {
              var _a3;
              return attachmentUriForName(
                ((_a3 = fileReferences[index]) == null ? void 0 : _a3.attachmentId) ?? file.name
              );
            }
          )
        )
      };
      content.splice(1, 0, ...references);
      return {
        content,
        references,
        fileReferences
      };
    }
    await removeUploadedAttachments(session, references);
    if (extractHttpStatus(failure.reason) === 404) {
      if (uploadableFiles.length > 0) {
        throw new AttachmentUploadError(failure.reason);
      }
      return {
        content: toDaemonPromptContent(text, images, files),
        references: [],
        fileReferences: []
      };
    }
    throw new AttachmentUploadError(failure.reason);
  }
  async function removeUploadedAttachments(session, references) {
    await Promise.allSettled(
      references.map(
        (reference) => session.removeAttachment(reference.attachmentId)
      )
    );
  }
  function isDefinitePromptAdmissionRejection(error) {
    return error instanceof DaemonHttpError || error instanceof DaemonPendingPromptLimitError;
  }
  const ignoreStaleNotice = (notice) => ({
    ...notice,
    id: notice.id ?? "stale-session-notice",
    createdAt: notice.createdAt ?? 0
  });
  const noticeForSession = (session) => {
    if (sessionRef.current !== session) return ignoreStaleNotice;
    if (noticeOwner !== session) silentHardFailureNoticeKeys.clear();
    noticeOwner = session;
    return addNotice;
  };
  function clearActiveSessionState() {
    var _a2;
    clearLiveJournalRepair();
    silentHardFailureNoticeKeys.clear();
    for (const [, active] of activePromptsRef.current) {
      active.controller.abort();
    }
    activePromptsRef.current.clear();
    settledPromptsRef.current.clear();
    setPromptStatus("idle");
    clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
    if (pendingSessionLoadRef.current) {
      if (((_a2 = skipNextCleanupDetachSessionRef.current) == null ? void 0 : _a2.sessionId) === pendingSessionLoadRef.current.sessionId) {
        skipNextCleanupDetachSessionRef.current = void 0;
      }
      clearPendingLoadTimeout(pendingSessionLoadRef.current);
      pendingSessionLoadRef.current.reject(
        new DOMException("Session cleared", "AbortError")
      );
      pendingSessionLoadRef.current = void 0;
    }
    store.reset();
    setRestoreSessionId(void 0);
    setRestoreWorkspaceCwd(void 0);
  }
  function startPendingSessionLoad(sessionId, mode, signal, replaySource) {
    const loadId = pendingSessionLoadIdRef.current + 1;
    pendingSessionLoadIdRef.current = loadId;
    if (pendingSessionLoadRef.current) {
      clearPendingLoadTimeout(pendingSessionLoadRef.current);
      pendingSessionLoadRef.current.reject(
        new DOMException(
          `Session ${mode} superseded by a newer request`,
          "AbortError"
        )
      );
    }
    const loadPromise = new Promise((resolve, reject) => {
      const restoreTimeouts = resolveSessionRestoreTimeouts(
        getConnection().capabilities
      );
      const watchdogTimeoutMs = mode === "attach" ? ATTACH_WATCHDOG_TIMEOUT_MS : restoreTimeouts.watchdogTimeoutMs;
      const timeout = watchdogTimeoutMs === void 0 ? void 0 : setTimeout(() => {
        var _a2, _b2;
        if (((_a2 = pendingSessionLoadRef.current) == null ? void 0 : _a2.id) === loadId) {
          pendingSessionLoadRef.current = void 0;
          if (((_b2 = sessionRef.current) == null ? void 0 : _b2.sessionId) !== sessionId) {
            manualSessionClearRef.current = true;
            setRestoreSessionId(void 0);
            setRestoreWorkspaceCwd(void 0);
            setConnection((current) => {
              if (current.status !== "connecting" || current.sessionId !== sessionId) {
                return current;
              }
              return {
                ...getConnectionAfterSessionClear(current, sessionId),
                status: "disconnected",
                sessionId: void 0
              };
            });
          }
          reject(
            dispatchActionError(
              addNotice,
              `${capitalize(mode)} session failed`,
              new Error(`Session ${mode} timed out`),
              getSessionLoadNoticeOperation(mode)
            )
          );
        }
      }, watchdogTimeoutMs);
      pendingSessionLoadRef.current = {
        id: loadId,
        sessionId,
        mode,
        timeout,
        ...mode !== "attach" ? { requestTimeoutMs: restoreTimeouts.requestTimeoutMs } : {},
        resolve,
        reject,
        ...signal ? { signal } : {},
        ...replaySource ? { replaySource } : {}
      };
    });
    return loadPromise;
  }
  function startSessionSwitch(sessionId, mode, workspaceCwd, signal, replaySource) {
    var _a2;
    if (replaySource !== "memory") {
      clearLiveJournalRepair();
    }
    if (signal == null ? void 0 : signal.aborted) {
      return Promise.reject(
        new DOMException("Session load cancelled", "AbortError")
      );
    }
    manualSessionClearRef.current = false;
    const loadPromise = startPendingSessionLoad(
      sessionId,
      mode,
      signal,
      replaySource
    );
    const pendingLoad = pendingSessionLoadRef.current;
    const currentSession = sessionRef.current;
    const currentSessionId = currentSession == null ? void 0 : currentSession.sessionId;
    const activePrompt = currentSessionId ? activePromptsRef.current.get(currentSessionId) : void 0;
    (_a2 = activePrompt == null ? void 0 : activePrompt.reject) == null ? void 0 : _a2.call(
      activePrompt,
      new DOMException("Session switch interrupted prompt wait", "AbortError")
    );
    if (currentSessionId) {
      activePromptsRef.current.delete(currentSessionId);
    }
    resetCurrentSessionActivePrompt();
    const targetWorkspaceCwd = workspaceCwd ?? (currentSession == null ? void 0 : currentSession.workspaceCwd) ?? // A failed switch leaves the target's workspace on the connection for
    // error rendering; never let the next workspace-less load inherit it.
    (getConnection().error ? void 0 : getConnection().workspaceCwd);
    const reloadingCurrentSession = mode === "load" && currentSessionId === sessionId && normalizeWorkspaceIdentity(currentSession == null ? void 0 : currentSession.workspaceCwd) === normalizeWorkspaceIdentity(targetWorkspaceCwd);
    if (currentSession) {
      const detachCurrentSession = () => currentSession.detach().catch((error) => {
        console.warn(
          "[DaemonSessionActions] detach before session switch failed:",
          error
        );
      });
      if (reloadingCurrentSession) {
        skipNextCleanupDetachSessionRef.current = currentSession;
        void loadPromise.then(detachCurrentSession, () => void 0).finally(() => {
          if (skipNextCleanupDetachSessionRef.current === currentSession) {
            skipNextCleanupDetachSessionRef.current = void 0;
          }
        });
      } else {
        void detachCurrentSession();
      }
    }
    if (!reloadingCurrentSession) sessionRef.current = void 0;
    if (!reloadingCurrentSession) {
      setConnection((current) => ({
        ...current,
        status: "connecting",
        sessionId,
        workspaceCwd: targetWorkspaceCwd,
        clientId: void 0,
        displayName: void 0,
        goalState: void 0,
        error: void 0,
        errorStatus: void 0,
        missingSession: false,
        loadingTranscript: true,
        catchingUp: void 0
      }));
    }
    setPromptStatus("idle");
    settledPromptsRef.current.clear();
    clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
    if (!reloadingCurrentSession) store.reset();
    setRestoreMode(mode);
    setRestoreSessionId(sessionId);
    setRestoreWorkspaceCwd(targetWorkspaceCwd);
    setRestoreSessionNonce((nonce) => nonce + 1);
    return loadPromise.catch((error) => {
      if (!isAbortError(error) && (pendingSessionLoadRef.current === void 0 || pendingSessionLoadRef.current === pendingLoad)) {
        setConnection((current) => ({
          ...current,
          error: error instanceof Error ? error.message : String(error),
          errorStatus: extractHttpStatus(error),
          loadingTranscript: void 0,
          catchingUp: void 0
        }));
      }
      throw error;
    });
  }
  return {
    async sendPrompt(text, options) {
      var _a2, _b2, _c2, _d, _e, _f;
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Prompt failed",
        "send_prompt"
      );
      const sessionId = session.sessionId;
      if (activePromptsRef.current.has(sessionId)) {
        throw dispatchActionError(
          addNotice,
          "Prompt failed",
          "A prompt is already in progress",
          "send_prompt"
        );
      }
      clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
      setPromptStatus("waiting");
      const ctrl = new AbortController();
      activePromptsRef.current.set(sessionId, { controller: ctrl });
      try {
        const normalizedImages = ((options == null ? void 0 : options.images) ?? []).map((img) => ({
          data: img.data,
          mimeType: img.mimeType || img.mediaType || img.media_type || "image/*"
        }));
        const normalizedFiles = normalizePromptFiles(options == null ? void 0 : options.files);
        const slashCommand = text.trimStart().startsWith("/");
        const displayedImages = slashCommand ? [] : normalizedImages;
        const displayedFiles = slashCommand ? [] : normalizedFiles;
        const inputAnnotations = (options == null ? void 0 : options.inputAnnotations) && options.inputAnnotations.length > 0 ? options.inputAnnotations : void 0;
        const shouldAppendOptimisticMessage = (options == null ? void 0 : options.optimisticUserMessage) !== false;
        const optimisticMessageAppended = shouldAppendOptimisticMessage && displayedImages.length === 0 && displayedFiles.length === 0;
        if (optimisticMessageAppended) {
          store.appendLocalUserMessage(
            text,
            displayedImages,
            inputAnnotations ? { inputAnnotations } : void 0,
            []
          );
        }
        let uploaded;
        try {
          uploaded = await promptContentWithUploadedAttachments(
            session,
            text,
            normalizedImages,
            normalizedFiles,
            ctrl.signal
          );
        } catch (error) {
          if (shouldAppendOptimisticMessage && !optimisticMessageAppended) {
            store.appendLocalUserMessage(
              text,
              displayedImages,
              inputAnnotations ? { inputAnnotations } : void 0,
              promptFilesForTranscript(displayedFiles, [], true)
            );
          }
          throw error instanceof AttachmentUploadError ? error.reason : error;
        }
        if (ctrl.signal.aborted) {
          await removeUploadedAttachments(session, uploaded.references);
          if (shouldAppendOptimisticMessage && !optimisticMessageAppended) {
            store.appendLocalUserMessage(
              text,
              displayedImages,
              inputAnnotations ? { inputAnnotations } : void 0,
              promptFilesForTranscript(displayedFiles, [], true)
            );
          }
          ctrl.signal.throwIfAborted();
        }
        const promptRequest = {
          prompt: uploaded.content
        };
        (_a2 = options == null ? void 0 : options.onAdmissionStarted) == null ? void 0 : _a2.call(options);
        if (inputAnnotations) {
          promptRequest["_meta"] = { inputAnnotations };
        }
        if (options == null ? void 0 : options.retry) {
          promptRequest["retry"] = true;
        }
        let accepted;
        try {
          accepted = await session.submitPrompt(
            promptRequest,
            ctrl.signal
          );
        } catch (error) {
          const definiteRejection = isDefinitePromptAdmissionRejection(error);
          if (definiteRejection) {
            await removeUploadedAttachments(session, uploaded.references);
          }
          if (shouldAppendOptimisticMessage && !optimisticMessageAppended) {
            store.appendLocalUserMessage(
              text,
              displayedImages,
              inputAnnotations ? { inputAnnotations } : void 0,
              promptFilesForTranscript(
                displayedFiles,
                definiteRejection ? [] : uploaded.fileReferences,
                definiteRejection
              )
            );
          }
          throw error;
        }
        if (shouldAppendOptimisticMessage && !optimisticMessageAppended) {
          store.appendLocalUserMessage(
            text,
            displayedImages,
            inputAnnotations ? { inputAnnotations } : void 0,
            promptFilesForTranscript(displayedFiles, uploaded.fileReferences)
          );
        }
        if (((_b2 = activePromptsRef.current.get(sessionId)) == null ? void 0 : _b2.controller) === ctrl) {
          restartEventStream(sessionId);
        }
        (_c2 = options == null ? void 0 : options.onAdmitted) == null ? void 0 : _c2.call(options);
        return await waitForAcceptedPromptCompletion(
          activePromptsRef.current,
          settledPromptsRef.current,
          sessionId,
          ctrl,
          accepted.promptId
        );
      } catch (error) {
        if (isAbortError(error)) {
          if (((_d = sessionRef.current) == null ? void 0 : _d.sessionId) === sessionId) {
            store.dispatch({ type: "assistant.done", reason: "cancelled" });
          }
          return { stopReason: "cancelled" };
        }
        if (isDaemonTurnError(error)) {
          throw error;
        }
        if (((_e = sessionRef.current) == null ? void 0 : _e.sessionId) === sessionId) {
          store.dispatch({ type: "assistant.done", reason: "error" });
        }
        throw dispatchActionError(
          addNotice,
          "Prompt failed",
          error,
          "send_prompt"
        );
      } finally {
        const active = activePromptsRef.current.get(sessionId);
        if ((active == null ? void 0 : active.controller) === ctrl) {
          activePromptsRef.current.delete(sessionId);
        }
        if (((_f = sessionRef.current) == null ? void 0 : _f.sessionId) === sessionId && !hasSessionActivePrompt()) {
          setPromptStatus("idle");
        }
      }
    },
    async submitPrompt(text, options) {
      var _a2, _b2;
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Prompt failed",
        "send_prompt"
      );
      if ((options == null ? void 0 : options.sessionId) && session.sessionId !== options.sessionId) {
        throw new Error("Session changed before prompt submission");
      }
      const normalizedImages = ((options == null ? void 0 : options.images) ?? []).map((img) => ({
        data: img.data,
        mimeType: img.mimeType || img.mediaType || img.media_type || "image/*"
      }));
      const normalizedFiles = normalizePromptFiles(options == null ? void 0 : options.files);
      const slashCommand = text.trimStart().startsWith("/");
      const displayedImages = slashCommand ? [] : normalizedImages;
      const displayedFiles = slashCommand ? [] : normalizedFiles;
      const inputAnnotations = (options == null ? void 0 : options.inputAnnotations) && options.inputAnnotations.length > 0 ? options.inputAnnotations : void 0;
      const shouldAppendOptimisticMessage = (options == null ? void 0 : options.optimisticUserMessage) !== false;
      const optimisticMessageAppended = shouldAppendOptimisticMessage && displayedImages.length === 0 && displayedFiles.length === 0;
      if (optimisticMessageAppended) {
        store.appendLocalUserMessage(
          text,
          displayedImages,
          inputAnnotations ? { inputAnnotations } : void 0,
          []
        );
      }
      let uploaded;
      try {
        uploaded = await promptContentWithUploadedAttachments(
          session,
          text,
          normalizedImages,
          normalizedFiles,
          options == null ? void 0 : options.signal
        );
      } catch (error) {
        if (shouldAppendOptimisticMessage && !optimisticMessageAppended) {
          store.appendLocalUserMessage(
            text,
            displayedImages,
            inputAnnotations ? { inputAnnotations } : void 0,
            promptFilesForTranscript(displayedFiles, [], true)
          );
        }
        throw error instanceof AttachmentUploadError ? error.reason : error;
      }
      const promptRequest = {
        prompt: uploaded.content
      };
      if (inputAnnotations) {
        promptRequest["_meta"] = { inputAnnotations };
      }
      if (options == null ? void 0 : options.retry) {
        promptRequest["retry"] = true;
      }
      (_a2 = options == null ? void 0 : options.onAdmissionStarted) == null ? void 0 : _a2.call(options);
      let accepted;
      try {
        accepted = await session.submitPrompt(
          promptRequest
        );
      } catch (error) {
        const definiteRejection = isDefinitePromptAdmissionRejection(error);
        if (definiteRejection) {
          await removeUploadedAttachments(session, uploaded.references);
        }
        if (shouldAppendOptimisticMessage && !optimisticMessageAppended) {
          store.appendLocalUserMessage(
            text,
            displayedImages,
            inputAnnotations ? { inputAnnotations } : void 0,
            promptFilesForTranscript(
              displayedFiles,
              definiteRejection ? [] : uploaded.fileReferences,
              definiteRejection
            )
          );
        }
        throw error;
      }
      if (shouldAppendOptimisticMessage && !optimisticMessageAppended) {
        store.appendLocalUserMessage(
          text,
          displayedImages,
          inputAnnotations ? { inputAnnotations } : void 0,
          promptFilesForTranscript(displayedFiles, uploaded.fileReferences)
        );
      }
      if ((_b2 = options == null ? void 0 : options.signal) == null ? void 0 : _b2.aborted) {
        try {
          const removal = await session.removePendingPrompt(accepted.promptId);
          if (removal.removed) {
            await removeUploadedAttachments(session, uploaded.references);
            return { promptId: accepted.promptId, removedAfterAbort: true };
          }
        } catch (err) {
          console.warn(
            "[submitPrompt] removePendingPrompt failed after abort",
            err
          );
          addNotice({
            severity: "error",
            category: "user_action",
            operation: "send_prompt",
            code: "daemon.send_prompt.pending_cleanup_failed",
            message: "Prompt was accepted after cancellation but could not be removed from the queue.",
            debugMessage: err instanceof Error ? err.message : String(err),
            recoverable: true
          });
        }
        throw options.signal.reason ?? new DOMException("Aborted", "AbortError");
      }
      return { promptId: accepted.promptId };
    },
    async cancel() {
      var _a2, _b2;
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Cancel failed",
        "cancel_prompt"
      );
      const active = activePromptsRef.current.get(session.sessionId);
      active == null ? void 0 : active.controller.abort();
      clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
      const cancelGuard = active ? new AbortController() : void 0;
      if (cancelGuard) {
        activePromptsRef.current.set(session.sessionId, {
          controller: cancelGuard
        });
      }
      try {
        await withActionTimeout(session.cancel(), "Cancel timed out");
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Cancel failed",
          error,
          "cancel_prompt"
        );
      } finally {
        if (cancelGuard && ((_a2 = activePromptsRef.current.get(session.sessionId)) == null ? void 0 : _a2.controller) === cancelGuard) {
          activePromptsRef.current.delete(session.sessionId);
        }
        if (((_b2 = sessionRef.current) == null ? void 0 : _b2.sessionId) === session.sessionId && !hasSessionActivePrompt()) {
          setPromptStatus("idle");
        }
      }
    },
    async setModel(modelId) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Set model failed",
        "switch_model"
      );
      try {
        const modelRequest = session.setModel(modelId);
        const contextRequest = trackSessionConfigMutation(
          session,
          modelRequest.then(() => session.context())
        );
        const result = await withActionTimeout(
          modelRequest,
          "Set model timed out"
        );
        const modelGeneration = sessionRef.current === session ? ++modelMutationGeneration : void 0;
        if (modelGeneration !== void 0) {
          setConnection((current) => {
            if (sessionRef.current !== session || modelGeneration !== modelMutationGeneration) {
              return current;
            }
            return { ...current, currentModel: modelId, reasoning: void 0 };
          });
        }
        const context = await withActionTimeout(
          contextRequest,
          "Refresh model context timed out"
        ).catch(() => void 0);
        if (modelGeneration !== void 0 && sessionRef.current === session && modelGeneration === modelMutationGeneration) {
          setConnection((current) => {
            if (sessionRef.current !== session || modelGeneration !== modelMutationGeneration || current.currentModel !== modelId) {
              return current;
            }
            return {
              ...current,
              context: context ?? current.context,
              reasoning: context ? mapSessionContextReasoning(context) : void 0
            };
          });
        }
        return result;
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Set model failed",
          error,
          "switch_model"
        );
      }
    },
    async setReasoningEffort(value) {
      var _a2;
      const actionToken = ++reasoningActionToken;
      const sourceModel = getConnection().currentModel;
      const sourceModelGeneration = modelMutationGeneration;
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Set reasoning effort failed",
        "set_reasoning_effort"
      );
      try {
        const result = await withActionTimeout(
          trackSessionConfigMutation(
            session,
            session.setConfigOption("reasoning_effort", value)
          ),
          "Set reasoning effort timed out"
        );
        const nextReasoning = mapReasoningControls(
          result.configOptions,
          (_a2 = getConnection().reasoning) == null ? void 0 : _a2.effort
        );
        const confirmed = value === "none" ? (nextReasoning == null ? void 0 : nextReasoning.enabled) === false : (nextReasoning == null ? void 0 : nextReasoning.enabled) === true && nextReasoning.effort === value;
        if (!confirmed) {
          throw new Error(
            `Daemon did not confirm reasoning effort ${JSON.stringify(value)}`
          );
        }
        const current = getConnection();
        if (sessionRef.current === session && sourceModelGeneration === modelMutationGeneration && current.currentModel === sourceModel && actionToken > appliedReasoningActionToken) {
          appliedReasoningActionToken = actionToken;
          setConnection((current2) => {
            if (sessionRef.current !== session || sourceModelGeneration !== modelMutationGeneration || current2.currentModel !== sourceModel) {
              return current2;
            }
            const configOptions = result.configOptions;
            return {
              ...current2,
              reasoning: nextReasoning,
              context: current2.context ? {
                ...current2.context,
                state: { ...current2.context.state, configOptions }
              } : current2.context
            };
          });
        }
      } catch (error) {
        throw dispatchActionError(
          noticeForSession(session),
          "Set reasoning effort failed",
          error,
          "set_reasoning_effort"
        );
      }
    },
    async setApprovalMode(mode, opts) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Set approval mode failed",
        "set_approval_mode"
      );
      try {
        const result = await withActionTimeout(
          session.client.setSessionApprovalMode(session.sessionId, mode, {
            persist: opts == null ? void 0 : opts.persist,
            clientId: session.clientId
          }),
          "Set approval mode timed out"
        );
        if (sessionRef.current === session) {
          setConnection((current) => ({
            ...current,
            currentMode: result.mode || mode
          }));
        }
        return result;
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Set approval mode failed",
          error,
          "set_approval_mode"
        );
      }
    },
    async respondToPermission(requestId, response) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Permission response failed",
        "submit_permission"
      );
      try {
        return await withActionTimeout(
          session.respondToSessionPermission(requestId, response),
          "Permission response timed out"
        );
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Permission response failed",
          error,
          "submit_permission"
        );
      }
    },
    async submitPermission(requestId, optionId, answers) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Permission response failed",
        "submit_permission"
      );
      const response = optionId !== void 0 && optionId.length > 0 ? {
        outcome: { outcome: "selected", optionId },
        ...answers ? { answers } : {}
      } : {
        outcome: { outcome: "cancelled" },
        ...answers ? { answers } : {}
      };
      try {
        return await withActionTimeout(
          session.respondToSessionPermission(requestId, response),
          "Permission response timed out"
        );
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Permission response failed",
          error,
          "submit_permission"
        );
      }
    },
    async heartbeat() {
      const session = sessionRef.current;
      if (!session || !heartbeatSupportedRef.current) return void 0;
      return withActionTimeout(session.heartbeat(), "Heartbeat timed out");
    },
    async listSessions(options) {
      const session = sessionRef.current;
      if (!session) return [];
      try {
        return await withActionTimeout(
          session.client.listWorkspaceSessions(session.workspaceCwd, options),
          "List sessions timed out"
        );
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "List sessions failed",
          error,
          "list_sessions"
        );
      }
    },
    async loadSession(sessionId, options) {
      return startSessionSwitch(sessionId, "load", options == null ? void 0 : options.workspaceCwd);
    },
    async reloadSession(signal, options) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Reload session failed",
        "load_session"
      );
      return startSessionSwitch(
        session.sessionId,
        "load",
        session.workspaceCwd,
        signal,
        options == null ? void 0 : options.replaySource
      );
    },
    async resumeSession(sessionId, options) {
      return startSessionSwitch(sessionId, "resume", options == null ? void 0 : options.workspaceCwd);
    },
    async createSession(options) {
      let rawCreateStarted = false;
      let rawCreateSettled = false;
      let retireLateResult = false;
      const trackCreate = (request, retire) => {
        rawCreateStarted = true;
        void request.then(
          (created) => {
            rawCreateSettled = true;
            if (retireLateResult) {
              void retire(created).catch((error) => {
                console.warn(
                  "[DaemonSessionActions] detach after timed-out create failed:",
                  error
                );
              });
            }
          },
          () => {
            rawCreateSettled = true;
          }
        );
        return request;
      };
      try {
        manualSessionClearRef.current = false;
        const requestOverrides = {
          ...(options == null ? void 0 : options.approvalMode) !== void 0 ? { approvalMode: options.approvalMode } : {},
          ...(options == null ? void 0 : options.sourceType) !== void 0 ? { sourceType: options.sourceType } : {},
          ...(options == null ? void 0 : options.worktree) !== void 0 ? { worktree: options.worktree } : {},
          ...(options == null ? void 0 : options.branch) !== void 0 ? { branch: options.branch } : {}
        };
        const session = sessionRef.current;
        const activeSession = session && getConnection().sessionId === session.sessionId ? session : void 0;
        if (activeSession) {
          const nextSession2 = await withActionTimeout(
            trackCreate(
              activeSession.client.createOrAttachSession({
                ...getCreateSessionRequest(),
                ...(options == null ? void 0 : options.workspaceCwd) !== void 0 ? { workspaceCwd: options.workspaceCwd } : {},
                ...requestOverrides
              }),
              (created) => activeSession.client.detachSession(
                created.sessionId,
                created.clientId
              )
            ),
            "Create session timed out"
          );
          persistStableClientId(nextSession2.clientId, nextSession2.sessionId);
          return nextSession2;
        }
        const nextSession = await withActionTimeout(
          trackCreate(
            createDetachedSession(options == null ? void 0 : options.workspaceCwd, requestOverrides),
            (created) => created.detach()
          ),
          "Create session timed out"
        );
        if (manualSessionClearRef.current) {
          try {
            await withActionTimeout(
              nextSession.detach(),
              "Detach cleared session timed out"
            );
          } catch (error) {
            console.warn(
              "[DaemonSessionActions] detach after interrupted create failed:",
              error
            );
          }
          throw new DOMException("Session creation interrupted", "AbortError");
        }
        persistStableClientId(nextSession.clientId, nextSession.sessionId);
        sessionRef.current = nextSession;
        skipNextCleanupDetachSessionRef.current = nextSession;
        setConnection((current) => ({
          ...current,
          status: "connected",
          sessionId: nextSession.sessionId,
          goalState: void 0,
          ...nextSession.clientId ? { clientId: nextSession.clientId } : {},
          workspaceCwd: nextSession.workspaceCwd,
          error: void 0,
          errorStatus: void 0,
          missingSession: false
        }));
        return nextSession;
      } catch (error) {
        if (rawCreateStarted && !rawCreateSettled) retireLateResult = true;
        throw dispatchActionError(
          addNotice,
          `Create session failed${(options == null ? void 0 : options.workspaceCwd) ? ` (workspace: ${options.workspaceCwd})` : ""}`,
          error,
          "create_session"
        );
      }
    },
    async attachSession() {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Attach session failed",
        "attach_session"
      );
      const loadPromise = startPendingSessionLoad(session.sessionId, "attach");
      setAttachSessionNonce((nonce) => nonce + 1);
      return loadPromise;
    },
    async clearSession() {
      const session = sessionRef.current;
      manualSessionClearRef.current = true;
      clearActiveSessionState();
      sessionRef.current = void 0;
      setConnection(
        (current) => getConnectionAfterSessionClear(current, session == null ? void 0 : session.sessionId)
      );
      if (session) {
        try {
          await withActionTimeout(session.detach(), "Clear session timed out");
        } catch (error) {
          console.warn("[DaemonSessionActions] detach on clear failed:", error);
        }
      }
    },
    async newSession() {
      manualSessionClearRef.current = false;
      clearActiveSessionState();
      setConnection((current) => ({
        ...current,
        goalState: void 0,
        missingSession: false,
        error: void 0,
        errorStatus: void 0
      }));
      setNewSessionNonce((nonce) => nonce + 1);
    },
    async releaseSession(sessionId) {
      try {
        const session = requireSessionForAction(
          addNotice,
          sessionRef.current,
          "Release session failed",
          "release_session"
        );
        await withActionTimeout(
          session.client.closeSession(sessionId),
          "Release session timed out"
        );
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Release session failed",
          error,
          "release_session"
        );
      }
    },
    async closeSession() {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Close session failed",
        "close_session"
      );
      try {
        await withActionTimeout(session.close(), "Close session timed out");
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Close session failed",
          error,
          "close_session"
        );
      }
    },
    async refreshCommands() {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Refresh commands failed",
        "refresh_commands"
      );
      try {
        const status = await withActionTimeout(
          session.supportedCommands(),
          "Refresh commands timed out"
        );
        if (sessionRef.current === session) {
          const { commands, skills } = mapSupportedCommands(status);
          setConnection((current) => ({
            ...current,
            commands,
            skills,
            supportedCommands: status
          }));
        }
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Refresh commands failed",
          error,
          "refresh_commands"
        );
      }
    },
    async getContext() {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Load context failed",
        "load_context"
      );
      const configGeneration = sessionConfigGeneration.get(session) ?? 0;
      try {
        const context = await withActionTimeout(
          session.context(),
          "Load context timed out"
        );
        setConnection((current) => {
          var _a2;
          if (sessionRef.current !== session || configGeneration % 2 !== 0 || (sessionConfigGeneration.get(session) ?? 0) !== configGeneration) {
            return current;
          }
          return {
            ...current,
            context,
            currentMode: getModeFromSessionContext(context) ?? current.currentMode,
            currentModel: getModelFromSessionContext(context) ?? current.currentModel,
            reasoning: mapSessionContextReasoning(
              context,
              (_a2 = current.reasoning) == null ? void 0 : _a2.effort
            )
          };
        });
        return context;
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Load context failed",
          error,
          "load_context"
        );
      }
    },
    async getContextUsage(opts) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Load context usage failed",
        "load_context_usage"
      );
      try {
        return await withActionTimeout(
          session.contextUsage(opts),
          "Load context usage timed out"
        );
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Load context usage failed",
          error,
          "load_context_usage"
        );
      }
    },
    async renameSession(displayName) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Rename session failed",
        "rename_session"
      );
      try {
        return await withActionTimeout(
          session.updateMetadata({ displayName }),
          "Rename session timed out"
        );
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Rename session failed",
          error,
          "rename_session"
        );
      }
    },
    async recapSession() {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Recap session failed",
        "recap_session"
      );
      try {
        return await withActionTimeout(
          session.recap(),
          "Recap session timed out"
        );
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Recap session failed",
          error,
          "recap_session"
        );
      }
    },
    async *generateSessionContent(prompt, opts) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Generate content failed",
        "generate_session_content"
      );
      yield* session.generateContent(prompt, opts);
    },
    async getRewindSnapshots() {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Load rewind snapshots failed",
        "rewind_snapshots"
      );
      try {
        return await withActionTimeout(
          session.getRewindSnapshots(),
          "Load rewind snapshots timed out"
        );
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Load rewind snapshots failed",
          error,
          "rewind_snapshots"
        );
      }
    },
    async rewindSession(promptId, opts) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Rewind session failed",
        "rewind_session"
      );
      try {
        return await withActionTimeout(
          session.rewind(promptId, opts),
          "Rewind session timed out"
        );
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Rewind session failed",
          error,
          "rewind_session"
        );
      }
    },
    async btwSession(question, opts) {
      var _a2;
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Side question failed",
        "btw_session"
      );
      try {
        return await withActionTimeout(
          session.btw(question, opts),
          "Side question timed out"
        );
      } catch (error) {
        if (((_a2 = opts == null ? void 0 : opts.signal) == null ? void 0 : _a2.aborted) || isAbortError(error)) {
          throw error;
        }
        throw dispatchActionError(
          addNotice,
          "Side question failed",
          error,
          "btw_session"
        );
      }
    },
    async uploadAttachment(attachment, opts) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Attachment upload failed",
        "send_prompt"
      );
      if ((opts == null ? void 0 : opts.sessionId) && opts.sessionId !== session.sessionId) {
        throw new Error("Attachment session changed");
      }
      const mimeType = attachment.mimeType ?? attachment.mediaType ?? attachment.media_type ?? ("name" in attachment ? "application/octet-stream" : "image/*");
      attachmentClient = session.client;
      attachmentSessionId = session.sessionId;
      attachmentClientId = session.clientId;
      if ("name" in attachment) {
        return await session.uploadAttachment(
          attachment.data ?? new Blob([attachment.text ?? ""], { type: mimeType }),
          attachment.name,
          mimeType,
          opts == null ? void 0 : opts.signal
        );
      }
      return await session.uploadAttachment(
        daemonPromptImageToBlob(attachment),
        imageAttachmentName(mimeType),
        imageAttachmentMimeType(mimeType),
        opts == null ? void 0 : opts.signal
      );
    },
    async readAttachment(attachmentId) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Attachment preview failed",
        "read_attachment"
      );
      return await session.readAttachment(attachmentId);
    },
    async removeAttachment(attachmentId, opts) {
      const session = sessionRef.current;
      const sessionId = (opts == null ? void 0 : opts.sessionId) ?? (session == null ? void 0 : session.sessionId);
      const client = (session == null ? void 0 : session.client) ?? attachmentClient;
      if (!sessionId || !client) {
        throw dispatchActionError(
          addNotice,
          "Attachment removal failed",
          new Error("Daemon session is not connected"),
          "remove_attachment"
        );
      }
      if (sessionId === (session == null ? void 0 : session.sessionId)) {
        return await session.removeAttachment(attachmentId);
      }
      const clientId = getPersistedClientId(sessionId) ?? (attachmentSessionId === sessionId ? attachmentClientId : void 0);
      try {
        return clientId ? await client.removeSessionAttachment(sessionId, attachmentId, {
          clientId
        }) : await client.removeSessionAttachment(sessionId, attachmentId);
      } catch (error) {
        if (!clientId || !isInvalidClientIdError(error)) throw error;
        return await client.removeSessionAttachment(sessionId, attachmentId);
      }
    },
    async enqueueMidTurnMessage(message, opts) {
      const session = sessionRef.current;
      if (!session) return { accepted: false };
      try {
        const { onAdmissionStarted, ...requestOptions } = opts ?? {};
        onAdmissionStarted == null ? void 0 : onAdmissionStarted();
        return await session.enqueueMidTurnMessage(
          message,
          opts ? requestOptions : void 0
        );
      } catch (err) {
        if (opts == null ? void 0 : opts.messageId) throw err;
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.debug(
            "[enqueueMidTurnMessage] legacy push failed; kept for next turn",
            err
          );
        }
        return { accepted: false };
      }
    },
    async removeMidTurnMessage(messageId, opts) {
      const session = sessionRef.current;
      if (!session) return { removed: false };
      if ((opts == null ? void 0 : opts.sessionId) && session.sessionId !== opts.sessionId) {
        const targetClientId = getPersistedClientId(opts.sessionId) ?? session.clientId;
        return await session.client.removeMidTurnMessage(
          opts.sessionId,
          messageId,
          {
            ...targetClientId ? { clientId: targetClientId } : {}
          }
        );
      }
      return await session.removeMidTurnMessage(messageId);
    },
    async getMidTurnMessages(opts) {
      const session = sessionRef.current;
      if (!session) return void 0;
      try {
        return await session.getMidTurnMessages(opts);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.debug(
            "[getMidTurnMessages] reconciliation query failed; keeping current state",
            err
          );
        }
        return void 0;
      }
    },
    async getPendingPrompts(opts) {
      const session = sessionRef.current;
      if (!session)
        return { pendingPrompts: [] };
      if ((opts == null ? void 0 : opts.sessionId) && session.sessionId !== opts.sessionId) {
        throw new Error("Session changed before pending prompts refresh");
      }
      return await session.getPendingPrompts();
    },
    async removePendingPrompt(promptId, opts) {
      const session = sessionRef.current;
      if (!session) return { removed: false };
      if ((opts == null ? void 0 : opts.sessionId) && session.sessionId !== opts.sessionId) {
        return await session.client.removePendingPrompt(
          opts.sessionId,
          promptId
        );
      }
      return await session.removePendingPrompt(promptId);
    },
    async sendShellCommand(command) {
      var _a2, _b2;
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Shell command failed",
        "send_shell_command"
      );
      const shellKey = `${session.sessionId}:shell`;
      setPromptStatus("waiting");
      const ctrl = new AbortController();
      activePromptsRef.current.set(shellKey, { controller: ctrl });
      try {
        return await session.shellCommand(command, ctrl.signal);
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Shell command failed",
          error,
          "send_shell_command"
        );
      } finally {
        if (((_a2 = activePromptsRef.current.get(shellKey)) == null ? void 0 : _a2.controller) === ctrl) {
          activePromptsRef.current.delete(shellKey);
        }
        if (((_b2 = sessionRef.current) == null ? void 0 : _b2.sessionId) === session.sessionId && !hasSessionActivePrompt()) {
          setPromptStatus("idle");
        }
      }
    },
    async getTasks(opts) {
      const session = sessionRef.current;
      if (!session) throw new Error("Daemon session is not connected");
      try {
        return await withActionTimeout(session.tasks(), "Get tasks timed out");
      } catch (error) {
        if (error instanceof Error && error.message === "Daemon session is not connected") {
          throw error;
        }
        if ((opts == null ? void 0 : opts.silent) && isTransientActionError(error)) {
          throw error;
        }
        throw dispatchActionError(
          addNotice,
          "Get tasks failed",
          error,
          "load_tasks",
          (opts == null ? void 0 : opts.silent) ? {
            dispatchedNoticeKeys: silentHardFailureNoticeKeys,
            noticeOnceKey: getActionErrorNoticeKey("load_tasks", error)
          } : void 0
        );
      }
    },
    async cancelTask(taskId, kind) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Cancel task failed",
        "cancel_task"
      );
      try {
        return await withActionTimeout(
          session.cancelTask(taskId, kind),
          "Cancel task timed out"
        );
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Cancel task failed",
          error,
          "cancel_task"
        );
      }
    },
    async clearGoal() {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Clear goal failed",
        "clear_goal"
      );
      try {
        return await withActionTimeout(
          session.clearGoal(),
          "Clear goal timed out"
        );
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Clear goal failed",
          error,
          "clear_goal"
        );
      }
    },
    async getGoal() {
      var _a2, _b2;
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Load goal failed",
        "load_goal"
      );
      const observedGoalId = (_b2 = (_a2 = getConnection().goalState) == null ? void 0 : _a2.goal) == null ? void 0 : _b2.goalId;
      try {
        const response = await withActionTimeout(
          session.goal(),
          "Load goal timed out"
        );
        setConnection((current) => {
          if (current.sessionId !== session.sessionId) return current;
          const goalState = selectGoalStateFromRead(
            current.goalState,
            response.snapshot,
            observedGoalId
          );
          if (goalState === current.goalState) return current;
          return { ...current, goalState };
        });
        return response;
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Load goal failed",
          error,
          "load_goal"
        );
      }
    },
    applyGoalSnapshot(sessionId, snapshot) {
      setConnection(
        (current) => current.sessionId === sessionId ? {
          ...current,
          goalState: selectGoalState(current.goalState, snapshot)
        } : current
      );
    },
    async controlGoal(request) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Control goal failed",
        "control_goal"
      );
      try {
        const response = await withActionTimeout(
          session.controlGoal(request),
          "Control goal timed out"
        );
        setConnection(
          (current) => current.sessionId === session.sessionId ? {
            ...current,
            goalState: selectGoalState(
              current.goalState,
              response.snapshot
            )
          } : current
        );
        return response;
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Control goal failed",
          error,
          "control_goal"
        );
      }
    },
    async getStats() {
      const session = sessionRef.current;
      if (!session) throw new Error("Daemon session is not connected");
      try {
        return await withActionTimeout(session.stats(), "Load stats timed out");
      } catch (error) {
        if (isDaemonSessionDisconnectedError(error)) {
          throw error;
        }
        throw dispatchActionError(
          addNotice,
          "Load stats failed",
          error,
          "load_stats"
        );
      }
    },
    async loadArtifacts() {
      const session = sessionRef.current;
      if (!session) throw new Error("Daemon session is not connected");
      return withActionTimeout(session.artifacts(), "Load artifacts timed out");
    },
    async respondToGlobalPermission(requestId, response) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Global permission response failed",
        "submit_permission"
      );
      try {
        return await withActionTimeout(
          session.client.respondToPermission(requestId, response),
          "Global permission response timed out"
        );
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Global permission response failed",
          error,
          "submit_permission"
        );
      }
    },
    async branchSession(name, atRecordId) {
      if (branchInFlight) {
        throw new DOMException(
          "A branch request is already in progress",
          "InvalidStateError"
        );
      }
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Branch session failed",
        "branch_session"
      );
      const sourceSessionId = session.sessionId;
      const loadGeneration = pendingSessionLoadIdRef.current;
      branchInFlight = true;
      try {
        const branchRequest = atRecordId === void 0 ? session.client.branchSession(
          sourceSessionId,
          { name },
          session.clientId
        ) : session.client.branchSession(
          sourceSessionId,
          { name, atRecordId },
          session.clientId
        );
        const result = await branchRequest;
        const switchStarted = sessionRef.current === session && pendingSessionLoadIdRef.current === loadGeneration;
        const restored = atRecordId === void 0 ? result : void 0;
        if (switchStarted) {
          if (restored == null ? void 0 : restored.clientId) {
            persistStableClientId(restored.clientId, restored.sessionId);
          }
          void startSessionSwitch(result.sessionId, "load").catch(
            (switchError) => {
              if (restored == null ? void 0 : restored.clientId) {
                void session.client.detachSession(restored.sessionId, restored.clientId).catch(() => void 0);
              }
              if (isAbortError(switchError)) return;
              dispatchActionError(
                addNotice,
                "Branch session failed",
                switchError,
                "branch_session"
              );
            }
          );
        } else if (restored == null ? void 0 : restored.clientId) {
          void session.client.detachSession(restored.sessionId, restored.clientId).catch(() => void 0);
        }
        return {
          sessionId: result.sessionId,
          displayName: result.displayName,
          switchStarted
        };
      } catch (error) {
        if (isStaleBranchPointError(error)) {
          throw markNoticeDispatched(error);
        }
        throw dispatchActionError(
          addNotice,
          "Branch session failed",
          error,
          "branch_session"
        );
      } finally {
        branchInFlight = false;
      }
    },
    async forkSession(directive) {
      const session = requireSessionForAction(
        addNotice,
        sessionRef.current,
        "Fork session failed",
        "fork_session"
      );
      try {
        return await withActionTimeout(
          session.fork(directive),
          "Fork session timed out"
        );
      } catch (error) {
        throw dispatchActionError(
          addNotice,
          "Fork session failed",
          error,
          "fork_session"
        );
      }
    }
  };
}
function waitForAcceptedPromptCompletion(activePrompts, settledPrompts, sessionId, controller, promptId) {
  return new Promise((resolve, reject) => {
    const settledKey = getPromptSettledKey(sessionId, promptId);
    const settled = settledPrompts.get(settledKey);
    if (settled) {
      settledPrompts.delete(settledKey);
      if (settled.status === "resolved") {
        resolve(settled.result);
      } else {
        reject(settled.error);
      }
      return;
    }
    const active = activePrompts.get(sessionId);
    if ((active == null ? void 0 : active.controller) !== controller) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    if (active.promptId !== void 0 && active.promptId !== promptId) {
      reject(new Error(`Prompt accepted with unexpected id ${promptId}`));
      return;
    }
    if (controller.signal.aborted) {
      activePrompts.delete(sessionId);
      reject(
        controller.signal.reason ?? new DOMException("Aborted", "AbortError")
      );
      return;
    }
    const cleanup = () => {
      controller.signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      const current = activePrompts.get(sessionId);
      if ((current == null ? void 0 : current.controller) === controller) {
        activePrompts.delete(sessionId);
      }
      cleanup();
      reject(
        controller.signal.reason ?? new DOMException("Aborted", "AbortError")
      );
    };
    activePrompts.set(sessionId, {
      ...active,
      promptId,
      resolve: (result) => {
        cleanup();
        resolve(result);
      },
      reject: (error) => {
        cleanup();
        reject(error);
      }
    });
    controller.signal.addEventListener("abort", onAbort, { once: true });
  });
}
function getPromptSettledKey(sessionId, promptId) {
  return JSON.stringify([sessionId, promptId]);
}
function getModeFromSessionContext(context) {
  const modes = typeof context.state.modes === "object" && context.state.modes !== null ? context.state.modes : void 0;
  const mode = (modes == null ? void 0 : modes["currentModeId"]) ?? (modes == null ? void 0 : modes["currentMode"]);
  return typeof mode === "string" ? mode : void 0;
}
function getModelFromSessionContext(context) {
  const models = typeof context.state.models === "object" && context.state.models !== null ? context.state.models : void 0;
  const model = (models == null ? void 0 : models["currentModelId"]) ?? (models == null ? void 0 : models["currentModel"]);
  return typeof model === "string" ? model : void 0;
}
function requireSessionForAction(addNotice, session, action, operation) {
  if (!session) {
    throw dispatchActionError(
      addNotice,
      action,
      "Daemon session is not connected",
      operation
    );
  }
  return session;
}
function dispatchActionError(addNotice, action, error, operation, opts) {
  if (isAbortError(error)) {
    if (error instanceof Error) return error;
    const message2 = error instanceof DOMException ? error.message : "Aborted";
    const abortError = new Error(message2);
    abortError.name = "AbortError";
    return abortError;
  }
  const message = error instanceof Error ? error.message : String(error);
  const noticeKey = opts == null ? void 0 : opts.noticeOnceKey;
  const dispatchedNoticeKeys = opts == null ? void 0 : opts.dispatchedNoticeKeys;
  if (!noticeKey || !(dispatchedNoticeKeys == null ? void 0 : dispatchedNoticeKeys.has(noticeKey))) {
    addNotice({
      severity: "error",
      category: "user_action",
      operation,
      code: `daemon.${operation}.failed`,
      message: `${action}: ${message}`,
      debugMessage: message,
      recoverable: true
    });
    if (noticeKey) {
      dispatchedNoticeKeys == null ? void 0 : dispatchedNoticeKeys.add(noticeKey);
    }
  }
  return markNoticeDispatched(
    error instanceof Error ? error : new Error(message)
  );
}
function getActionErrorNoticeKey(operation, error) {
  return `${operation}:${getActionErrorMessage(error)}`;
}
function getActionErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
function isTransientActionError(error) {
  if (isAbortError(error)) return true;
  const status = extractHttpStatus(error);
  if (status !== void 0) {
    return status >= 500 || status === 408 || status === 429;
  }
  const message = getActionErrorMessage(error).toLowerCase();
  return message.includes("timed out") || message.includes("failed to fetch") || message.includes("network error") || message.includes("networkerror");
}
function isAbortError(error) {
  return error instanceof DOMException && error.name === "AbortError" || error instanceof Error && error.name === "AbortError";
}
function markNoticeDispatched(error) {
  return Object.assign(error, {
    _alreadyDispatched: true
  });
}
function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
function getSessionLoadNoticeOperation(mode) {
  if (mode === "resume") return "resume_session";
  if (mode === "attach") return "attach_session";
  return "load_session";
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function findLiveJournalRepairTarget(sessionId, liveJournal, lastEventId, replayDegraded) {
  if (replayDegraded) return void 0;
  const marker = liveJournal.find(isRecoverableLiveJournalMarker);
  if (!marker) return void 0;
  const promptId = nonEmptyString(marker.promptId) ?? uniqueRetainedPromptId(liveJournal);
  if (!promptId) return void 0;
  const truncatedEvents = isRecord(marker.data) ? marker.data["truncatedEvents"] : void 0;
  return {
    marker,
    promptId,
    signature: [
      sessionId,
      promptId,
      lastEventId ?? "unknown",
      typeof truncatedEvents === "number" ? truncatedEvents : "unknown"
    ].join(":")
  };
}
function findLiveJournalRepairSuffix(replayEvents, promptId) {
  const start = replayEvents.findIndex(
    (event) => eventPromptId(event) === promptId && isUserMessageChunk(event)
  );
  if (start < 0) return void 0;
  const terminal = replayEvents.find(
    (event, index) => index >= start && eventPromptId(event) === promptId && (event.type === "turn_complete" || event.type === "turn_error")
  );
  if (!terminal) return void 0;
  return { events: replayEvents.slice(start), terminal };
}
function eventPromptId(event) {
  const envelopePromptId = nonEmptyString(event.promptId);
  if (envelopePromptId) return envelopePromptId;
  return isRecord(event.data) ? nonEmptyString(event.data["promptId"]) : void 0;
}
function isLiveJournalMarker(event) {
  return event.type === "history_truncated" && isRecord(event.data) && event.data["scope"] === "live_journal";
}
function isRecoverableLiveJournalMarker(event) {
  const knownEvent = asKnownDaemonEvent(event);
  return (knownEvent == null ? void 0 : knownEvent.type) === "history_truncated" && isLiveJournalMarker(event) && isRecord(event.data) && event.data["fullTranscriptAvailable"] === true;
}
function uniqueRetainedPromptId(liveJournal) {
  const promptIds = /* @__PURE__ */ new Set();
  for (const event of liveJournal) {
    if (isLiveJournalMarker(event)) continue;
    const promptId = eventPromptId(event);
    if (promptId) promptIds.add(promptId);
    if (promptIds.size > 1) return void 0;
  }
  return promptIds.size === 1 ? [...promptIds][0] : void 0;
}
function isUserMessageChunk(event) {
  if (event.type !== "session_update" || !isRecord(event.data)) return false;
  const update = event.data["update"];
  return isRecord(update) && update["sessionUpdate"] === "user_message_chunk";
}
function nonEmptyString(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const AGENT_GENERATE_TIMEOUT_MS = 33e4;
function hasGoalSnapshot(value) {
  if (!value || typeof value !== "object") return false;
  const snapshot = value.snapshot;
  if (!snapshot || typeof snapshot !== "object") return false;
  const candidate = snapshot;
  if (candidate.v !== 2 || candidate.activity !== "idle" && candidate.activity !== "running" && candidate.activity !== "verifying") {
    return false;
  }
  return candidate.goal === null || typeof candidate.goal === "object";
}
function createDaemonWorkspaceActions({
  getClient,
  getWorkspaceCwd,
  baseUrl,
  token
}) {
  return {
    async listSessions(options) {
      const client = requireClient(getClient, "List sessions failed");
      const cwd = getWorkspaceCwd();
      if (!cwd) return [];
      return withActionTimeout(
        client.listWorkspaceSessionsPage(cwd, options).then((page) => page.sessions),
        "List sessions timed out"
      );
    },
    async listSessionsPage(options) {
      const client = requireClient(getClient, "List sessions failed");
      const cwd = getWorkspaceCwd();
      if (!cwd) return { sessions: [] };
      return withActionTimeout(
        client.listWorkspaceSessionsPage(cwd, options),
        "List sessions timed out"
      );
    },
    async listSessionGroups() {
      const client = requireClient(getClient, "List session groups failed");
      const cwd = getWorkspaceCwd();
      if (!cwd) return { groups: [], colorOptions: [] };
      return withActionTimeout(
        client.listSessionGroups(cwd),
        "List session groups timed out"
      );
    },
    async createSessionGroup(input) {
      const client = requireClient(getClient, "Create session group failed");
      const cwd = requireWorkspaceCwd(getWorkspaceCwd);
      return withActionTimeout(
        client.createSessionGroup(cwd, input),
        "Create session group timed out"
      );
    },
    async updateSessionGroup(groupId, update) {
      const client = requireClient(getClient, "Update session group failed");
      const cwd = requireWorkspaceCwd(getWorkspaceCwd);
      return withActionTimeout(
        client.updateSessionGroup(cwd, groupId, update),
        "Update session group timed out"
      );
    },
    async deleteSessionGroup(groupId) {
      const client = requireClient(getClient, "Delete session group failed");
      const cwd = requireWorkspaceCwd(getWorkspaceCwd);
      return withActionTimeout(
        client.deleteSessionGroup(cwd, groupId),
        "Delete session group timed out"
      );
    },
    async updateSessionOrganization(sessionId, update) {
      const client = requireClient(
        getClient,
        "Update session organization failed"
      );
      return withActionTimeout(
        client.updateSessionOrganization(sessionId, update),
        "Update session organization timed out"
      );
    },
    async deleteSession(sessionId) {
      const client = requireClient(getClient, "Delete session failed");
      const result = await withActionTimeout(
        client.deleteSessionsData([sessionId]),
        "Delete session timed out"
      );
      if (result.errors.length > 0) {
        throw new Error(result.errors[0].error);
      }
      return result.removed.length > 0 || result.notFound.length > 0;
    },
    async deleteSessions(sessionIds) {
      const client = requireClient(getClient, "Delete sessions failed");
      return withActionTimeout(
        client.deleteSessionsData(sessionIds),
        "Delete sessions timed out"
      );
    },
    async exportSession(sessionId, format = "html") {
      const client = requireClient(getClient, "Export session failed");
      return withActionTimeout(
        client.exportSession(sessionId, { format }),
        "Export session timed out"
      );
    },
    async archiveSession(sessionId) {
      const client = requireClient(getClient, "Archive session failed");
      const result = await withActionTimeout(
        client.archiveSessionsData([sessionId]),
        "Archive session timed out"
      );
      if (result.errors.length > 0) {
        throw new Error(result.errors[0].error);
      }
      return result.archived.length > 0 || result.alreadyArchived.length > 0;
    },
    async unarchiveSession(sessionId) {
      const client = requireClient(getClient, "Unarchive session failed");
      const result = await withActionTimeout(
        client.unarchiveSessionsData([sessionId]),
        "Unarchive session timed out"
      );
      if (result.errors.length > 0) {
        throw new Error(result.errors[0].error);
      }
      return result.unarchived.length > 0 || result.alreadyActive.length > 0;
    },
    async loadChannels() {
      const workspace = requireWorkspaceClient(
        getClient,
        getWorkspaceCwd,
        "Load channels failed"
      );
      const [catalog, snapshot] = await withActionTimeout(
        Promise.all([
          workspace.workspaceChannelTypes(),
          workspace.workspaceChannels()
        ]),
        "Load channels timed out"
      );
      return { catalog, snapshot };
    },
    async upsertChannel(name, request) {
      const workspace = requireWorkspaceClient(
        getClient,
        getWorkspaceCwd,
        "Update channel failed"
      );
      return workspace.upsertWorkspaceChannel(name, request);
    },
    async removeChannel(name, request) {
      const workspace = requireWorkspaceClient(
        getClient,
        getWorkspaceCwd,
        "Remove channel failed"
      );
      return workspace.deleteWorkspaceChannel(name, request);
    },
    async setChannelStartup(name, request) {
      const workspace = requireWorkspaceClient(
        getClient,
        getWorkspaceCwd,
        "Update channel startup failed"
      );
      return workspace.setWorkspaceChannelStartup(name, request);
    },
    async startChannel(name) {
      const workspace = requireWorkspaceClient(
        getClient,
        getWorkspaceCwd,
        "Start channel failed"
      );
      return workspace.startWorkspaceChannel(name);
    },
    async stopChannel(name) {
      const workspace = requireWorkspaceClient(
        getClient,
        getWorkspaceCwd,
        "Stop channel failed"
      );
      return workspace.stopWorkspaceChannel(name);
    },
    async restartChannel(name) {
      const workspace = requireWorkspaceClient(
        getClient,
        getWorkspaceCwd,
        "Restart channel failed"
      );
      return workspace.restartWorkspaceChannel(name);
    },
    channelPairing: {
      async list(name) {
        const workspace = requireWorkspaceClient(
          getClient,
          getWorkspaceCwd,
          "Load channel pairing requests failed"
        );
        return withActionTimeout(
          workspace.workspaceChannelPairingRequests(name),
          "Load channel pairing requests timed out"
        );
      },
      async approve(name, code) {
        const workspace = requireWorkspaceClient(
          getClient,
          getWorkspaceCwd,
          "Approve channel pairing failed"
        );
        return workspace.approveWorkspaceChannelPairing(name, { code });
      },
      async approvals(name) {
        const workspace = requireWorkspaceClient(
          getClient,
          getWorkspaceCwd,
          "Load channel pairing approvals failed"
        );
        return withActionTimeout(
          workspace.workspaceChannelPairingApprovals(name),
          "Load channel pairing approvals timed out"
        );
      },
      async revoke(name, request) {
        const workspace = requireWorkspaceClient(
          getClient,
          getWorkspaceCwd,
          "Revoke channel pairing approval failed"
        );
        return workspace.revokeWorkspaceChannelPairingApproval(name, request);
      }
    },
    async loadMcpStatus() {
      const client = requireClient(getClient, "Load MCP status failed");
      return withActionTimeout(
        client.workspaceMcp(),
        "Load MCP status timed out"
      );
    },
    async initializeMcp() {
      const client = requireClient(getClient, "Initialize MCP failed");
      return withActionTimeout(
        client.initializeWorkspaceMcp(),
        "Initialize MCP timed out"
      );
    },
    async reloadMcp() {
      const client = requireClient(getClient, "Reload MCP failed");
      return withActionTimeout(
        client.reloadWorkspaceMcp(),
        "Reload MCP timed out"
      );
    },
    async loadMcpTools(serverName) {
      const client = requireClient(getClient, "Load MCP tools failed");
      try {
        return await withActionTimeout(
          client.workspaceMcpTools(serverName),
          "Load MCP tools timed out"
        );
      } catch {
        return {
          v: 1,
          workspaceCwd: "",
          serverName,
          initialized: false,
          acpChannelLive: false,
          tools: [],
          errors: [
            {
              kind: "mcp_tools",
              status: "error",
              error: "The connected daemon does not expose MCP tool details."
            }
          ]
        };
      }
    },
    async loadMcpResources(serverName) {
      const client = requireClient(getClient, "Load MCP resources failed");
      try {
        return await withActionTimeout(
          client.workspaceMcpResources(serverName),
          "Load MCP resources timed out"
        );
      } catch {
        return {
          v: 1,
          workspaceCwd: "",
          serverName,
          initialized: false,
          acpChannelLive: false,
          resources: [],
          errors: [
            {
              kind: "mcp_resources",
              status: "error",
              error: "The connected daemon does not expose MCP resource details."
            }
          ]
        };
      }
    },
    async restartMcpServer(serverName) {
      const client = requireClient(getClient, "Restart MCP server failed");
      return withActionTimeout(
        client.restartMcpServer(serverName),
        "Restart MCP server timed out",
        5 * 6e4
      );
    },
    async manageMcpServer(serverName, action) {
      const client = requireClient(getClient, "Manage MCP server failed");
      const timeoutMs = action === "authenticate" ? 10 * 6e4 : 5 * 6e4;
      return withActionTimeout(
        client.manageMcpServer(serverName, action),
        "Manage MCP server timed out",
        timeoutMs
      );
    },
    async addRuntimeMcpServer(request) {
      const client = requireClient(getClient, "Add MCP server failed");
      return withActionTimeout(
        client.addRuntimeMcpServer(request),
        "Add MCP server timed out",
        5 * 6e4
      );
    },
    async removeRuntimeMcpServer(name) {
      const client = requireClient(getClient, "Remove MCP server failed");
      return withActionTimeout(
        client.removeRuntimeMcpServer(name),
        "Remove MCP server timed out",
        5 * 6e4
      );
    },
    async loadDaemonStatus(detail) {
      const client = requireClient(getClient, "Load daemon status failed");
      return withActionTimeout(
        client.daemonStatus(detail),
        "Load daemon status timed out"
      );
    },
    async loadUsageDashboard(opts) {
      const client = requireClient(getClient, "Load usage dashboard failed");
      return withActionTimeout(
        client.usageDashboard(opts),
        "Load usage dashboard timed out"
      );
    },
    async loadSkillsStatus() {
      const client = requireClient(getClient, "Load skills failed");
      return withActionTimeout(
        client.workspaceSkills(),
        "Load skills timed out"
      );
    },
    async setWorkspaceSkillEnabled(skillName, enabled) {
      const client = requireClient(getClient, "Set skill enabled failed");
      return withActionTimeout(
        client.setWorkspaceSkillEnabled(skillName, enabled),
        "Set skill enabled timed out"
      );
    },
    async installWorkspaceSkill(request) {
      const client = requireClient(getClient, "Install skill failed");
      return withActionTimeout(
        client.installWorkspaceSkill(request),
        "Install skill timed out"
      );
    },
    async deleteWorkspaceSkill(skillName, scope) {
      const client = requireClient(getClient, "Delete skill failed");
      return withActionTimeout(
        client.deleteWorkspaceSkill(skillName, scope),
        "Delete skill timed out"
      );
    },
    async loadExtensionsStatus() {
      const client = requireClient(getClient, "Load extensions failed");
      return withActionTimeout(
        client.workspaceExtensions(),
        "Load extensions timed out"
      );
    },
    async loadToolsStatus() {
      const client = requireClient(getClient, "Load tools failed");
      return withActionTimeout(client.workspaceTools(), "Load tools timed out");
    },
    async preheatAcp(timeoutMs) {
      const client = requireClient(getClient, "Preheat ACP failed");
      return withActionTimeout(
        client.workspaceAcpPreheat(timeoutMs),
        "Preheat ACP timed out",
        timeoutMs === void 0 ? void 0 : timeoutMs + 2e3
      );
    },
    async setWorkspaceToolEnabled(toolName, enabled) {
      const client = requireClient(getClient, "Set tool enabled failed");
      return withActionTimeout(
        client.setWorkspaceToolEnabled(toolName, enabled),
        "Set tool enabled timed out"
      );
    },
    async loadSettingsStatus() {
      const client = requireClient(getClient, "Load settings failed");
      return withActionTimeout(
        client.workspaceSettings(),
        "Load settings timed out"
      );
    },
    async setWorkspaceSetting(scope, key, value, options) {
      const client = requireClient(getClient, "Set setting failed");
      return withActionTimeout(
        client.setWorkspaceSetting(scope, key, value, options),
        "Set setting timed out"
      );
    },
    async loadMemoryStatus() {
      const client = requireClient(getClient, "Load memory failed");
      return withActionTimeout(
        client.workspaceMemory(),
        "Load memory timed out"
      );
    },
    async readWorkspaceFile(filePath) {
      const client = requireClient(getClient, "Read workspace file failed");
      return withActionTimeout(
        client.readWorkspaceFile(filePath),
        "Read workspace file timed out"
      );
    },
    async writeMemory(req) {
      const client = requireClient(getClient, "Write memory failed");
      return withActionTimeout(
        client.writeWorkspaceMemory(req),
        "Write memory timed out"
      );
    },
    async *generateContent(prompt, opts) {
      const client = requireClient(getClient, "Generate content failed");
      yield* client.generateWorkspaceContent(prompt, {
        signal: opts == null ? void 0 : opts.signal
      });
    },
    async listAgents() {
      const client = requireClient(getClient, "List agents failed");
      return withActionTimeout(
        client.listWorkspaceAgents(),
        "List agents timed out"
      );
    },
    async getAgent(agentType, scope) {
      const client = requireClient(getClient, "Get agent failed");
      return withActionTimeout(
        client.getWorkspaceAgent(agentType, scope ? { scope } : {}),
        "Get agent timed out"
      );
    },
    async createAgent(req) {
      const client = requireClient(getClient, "Create agent failed");
      return withActionTimeout(
        client.createWorkspaceAgent(req),
        "Create agent timed out"
      );
    },
    async generateAgent(description) {
      const client = requireClient(getClient, "Generate agent failed");
      return withActionTimeout(
        client.generateWorkspaceAgent(description),
        "Generate agent timed out",
        AGENT_GENERATE_TIMEOUT_MS
      );
    },
    async deleteAgent(agentType, scope) {
      const client = requireClient(getClient, "Delete agent failed");
      return withActionTimeout(
        client.deleteWorkspaceAgent(agentType, scope ? { scope } : {}),
        "Delete agent timed out"
      );
    },
    // TODO(transport-parity): globWorkspace, stat, and listDirectory
    // bypass the DaemonClient transport layer by calling global fetch()
    // directly. This means ACP transports (WS, HTTP+JSON-RPC) never
    // see these requests. DaemonClient exposes client.glob(),
    // client.fileStat(), and client.dirList() that go through the
    // transport — migrate to those once the route table covers
    // /glob, /stat, /list (see acpRouteTable.ts).
    async globWorkspace(pattern, opts) {
      requireClient(getClient, "Glob workspace failed");
      const url = createDaemonRequestUrl(baseUrl, "/glob");
      url.searchParams.set("pattern", pattern);
      if ((opts == null ? void 0 : opts.maxResults) !== void 0) {
        url.searchParams.set("maxResults", String(opts.maxResults));
      }
      if ((opts == null ? void 0 : opts.includeIgnored) !== void 0) {
        url.searchParams.set("includeIgnored", opts.includeIgnored ? "1" : "0");
      }
      if ((opts == null ? void 0 : opts.cwd) !== void 0) {
        url.searchParams.set("cwd", opts.cwd);
      }
      const res = await withActionTimeout(
        fetch(serializeDaemonRequestUrl(url, baseUrl), {
          headers: createDaemonHeaders(token)
        }),
        "Glob workspace timed out"
      );
      if (!res.ok) {
        throw new Error(await readDaemonError(res, "GET /glob"));
      }
      const data = await res.json();
      return {
        matches: Array.isArray(data.matches) ? data.matches.filter(
          (match) => typeof match === "string"
        ) : []
      };
    },
    async loadProviders() {
      const client = requireClient(getClient, "Load providers failed");
      return withActionTimeout(
        client.workspaceProviders(),
        "Load providers timed out"
      );
    },
    async readFileBytes(filePath, opts) {
      const client = requireClient(getClient, "Read file bytes failed");
      return withActionTimeout(
        client.readWorkspaceFileBytes(filePath, opts ?? {}),
        "Read file bytes timed out"
      );
    },
    async writeFile(req) {
      const client = requireClient(getClient, "Write file failed");
      return withActionTimeout(
        client.writeWorkspaceFile(req),
        "Write file timed out"
      );
    },
    async editFile(req) {
      const client = requireClient(getClient, "Edit file failed");
      return withActionTimeout(
        client.editWorkspaceFile(req),
        "Edit file timed out"
      );
    },
    async stat(filePath) {
      requireClient(getClient, "Stat file failed");
      const url = createDaemonRequestUrl(baseUrl, "/stat");
      url.searchParams.set("path", filePath);
      const res = await withActionTimeout(
        fetch(serializeDaemonRequestUrl(url, baseUrl), {
          headers: createDaemonHeaders(token)
        }),
        "Stat file timed out"
      );
      if (!res.ok) {
        throw new Error(await readDaemonError(res, "GET /stat"));
      }
      return await res.json();
    },
    async listDirectory(dirPath) {
      requireClient(getClient, "List directory failed");
      const url = createDaemonRequestUrl(baseUrl, "/list");
      url.searchParams.set("path", dirPath);
      const res = await withActionTimeout(
        fetch(serializeDaemonRequestUrl(url, baseUrl), {
          headers: createDaemonHeaders(token)
        }),
        "List directory timed out"
      );
      if (!res.ok) {
        throw new Error(await readDaemonError(res, "GET /list"));
      }
      return await res.json();
    },
    // Scheduled tasks (durable cron). Raw fetch like glob/stat/list — the
    // /scheduled-tasks routes are REST-only and not yet on the DaemonClient
    // transport, so this path only reaches the daemon over plain HTTP (the
    // web-shell's own origin), which is exactly where the page runs. A
    // `workspaceId` selects a non-primary workspace's own cron file via the
    // workspace-qualified route; omitting it hits the primary surface.
    async listScheduledTasks(workspaceId) {
      requireClient(getClient, "List scheduled tasks failed");
      const path = scheduledTasksPath(workspaceId);
      const url = createDaemonRequestUrl(baseUrl, path);
      const res = await withActionTimeout(
        fetch(serializeDaemonRequestUrl(url, baseUrl), {
          headers: createDaemonHeaders(token)
        }),
        "List scheduled tasks timed out"
      );
      if (!res.ok) {
        throw new Error(await readDaemonError(res, `GET ${path}`));
      }
      const data = await res.json();
      return Array.isArray(data.tasks) ? data.tasks : [];
    },
    async createScheduledTask(req, workspaceId) {
      requireClient(getClient, "Create scheduled task failed");
      const path = scheduledTasksPath(workspaceId);
      const url = createDaemonRequestUrl(baseUrl, path);
      const res = await withActionTimeout(
        fetch(serializeDaemonRequestUrl(url, baseUrl), {
          method: "POST",
          headers: createDaemonJsonHeaders(token),
          body: JSON.stringify(req)
        }),
        "Create scheduled task timed out"
      );
      if (!res.ok) {
        throw new Error(await readDaemonError(res, `POST ${path}`));
      }
      return await res.json();
    },
    async updateScheduledTask(id, patch, workspaceId) {
      requireClient(getClient, "Update scheduled task failed");
      const path = scheduledTasksPath(
        workspaceId,
        `/${encodeURIComponent(id)}`
      );
      const url = createDaemonRequestUrl(baseUrl, path);
      const res = await withActionTimeout(
        fetch(serializeDaemonRequestUrl(url, baseUrl), {
          method: "PATCH",
          headers: createDaemonJsonHeaders(token),
          body: JSON.stringify(patch)
        }),
        "Update scheduled task timed out"
      );
      if (!res.ok) {
        throw new Error(await readDaemonError(res, `PATCH ${path}`));
      }
      return await res.json();
    },
    async runScheduledTask(id, workspaceId) {
      requireClient(getClient, "Run scheduled task failed");
      const path = scheduledTasksPath(
        workspaceId,
        `/${encodeURIComponent(id)}/run`
      );
      const url = createDaemonRequestUrl(baseUrl, path);
      const res = await withActionTimeout(
        fetch(serializeDaemonRequestUrl(url, baseUrl), {
          method: "POST",
          headers: createDaemonJsonHeaders(token)
        }),
        "Run scheduled task timed out"
      );
      if (!res.ok) {
        throw new Error(await readDaemonError(res, `POST ${path}`));
      }
      return await res.json();
    },
    async deleteScheduledTask(id, workspaceId) {
      requireClient(getClient, "Delete scheduled task failed");
      const path = scheduledTasksPath(
        workspaceId,
        `/${encodeURIComponent(id)}`
      );
      const url = createDaemonRequestUrl(baseUrl, path);
      const res = await withActionTimeout(
        fetch(serializeDaemonRequestUrl(url, baseUrl), {
          method: "DELETE",
          headers: createDaemonHeaders(token)
        }),
        "Delete scheduled task timed out"
      );
      if (!res.ok) {
        throw new Error(await readDaemonError(res, `DELETE ${path}`));
      }
    },
    // Goals. `GET /goals` is REST-only (like /scheduled-tasks) and not on the
    // DaemonClient transport; the clear path reuses the existing per-session
    // route so a page-level clear and a `/goal clear` in chat take the same
    // code path in the daemon.
    async listGoals() {
      requireClient(getClient, "List goals failed");
      const url = createDaemonRequestUrl(baseUrl, "/goals");
      const res = await withActionTimeout(
        fetch(serializeDaemonRequestUrl(url, baseUrl), {
          headers: createDaemonHeaders(token)
        }),
        "List goals timed out"
      );
      if (!res.ok) {
        throw new Error(await readDaemonError(res, "GET /goals"));
      }
      const data = await res.json();
      const rawGoals = Array.isArray(data.goals) ? data.goals : [];
      const goals = rawGoals.filter(hasGoalSnapshot);
      const droppedCount = typeof data.droppedCount === "number" && data.droppedCount > 0 ? data.droppedCount : 0;
      return {
        goals,
        droppedCount: droppedCount + rawGoals.length - goals.length
      };
    },
    async clearGoal(sessionId) {
      requireClient(getClient, "Clear goal failed");
      const url = createDaemonRequestUrl(
        baseUrl,
        `/session/${encodeURIComponent(sessionId)}/goal/clear`
      );
      const res = await withActionTimeout(
        fetch(serializeDaemonRequestUrl(url, baseUrl), {
          method: "POST",
          headers: createDaemonJsonHeaders(token),
          body: "{}"
        }),
        "Clear goal timed out"
      );
      if (!res.ok) {
        throw new Error(
          await readDaemonError(res, `POST /session/${sessionId}/goal/clear`)
        );
      }
      return await res.json();
    },
    async controlGoal(sessionId, request) {
      requireClient(getClient, "Control goal failed");
      const path = `/session/${encodeURIComponent(sessionId)}/goal`;
      const url = createDaemonRequestUrl(baseUrl, path);
      const res = await withActionTimeout(
        fetch(serializeDaemonRequestUrl(url, baseUrl), {
          method: "POST",
          headers: createDaemonJsonHeaders(token),
          body: JSON.stringify(request)
        }),
        "Control goal timed out"
      );
      if (!res.ok) {
        throw new Error(await readDaemonError(res, `POST ${path}`));
      }
      return await res.json();
    },
    async loadEnv() {
      const client = requireClient(getClient, "Load env failed");
      return withActionTimeout(client.workspaceEnv(), "Load env timed out");
    },
    async loadPreflight() {
      const client = requireClient(getClient, "Load preflight failed");
      return withActionTimeout(
        client.workspacePreflight(),
        "Load preflight timed out"
      );
    },
    async initWorkspace(opts) {
      const client = requireClient(getClient, "Init workspace failed");
      return withActionTimeout(
        client.initWorkspace(opts),
        "Init workspace timed out"
      );
    },
    async updateAgent(agentType, req, scope) {
      const client = requireClient(getClient, "Update agent failed");
      return withActionTimeout(
        client.updateWorkspaceAgent(agentType, req, scope ? { scope } : {}),
        "Update agent timed out"
      );
    },
    async installExtension(params, clientId) {
      const client = requireClient(getClient, "Install extension failed");
      return withActionTimeout(
        client.installExtension(params, clientId),
        "Install extension timed out"
      );
    },
    async installExtensionArchive(params, clientId) {
      const client = requireClient(getClient, "Install extension failed");
      return withActionTimeout(
        client.installExtensionArchive(params, clientId),
        "Install extension timed out",
        EXTENSION_ARCHIVE_UPLOAD_TIMEOUT_MS + 1e4
      );
    },
    async extensionOperationStatus(operationId) {
      const client = requireClient(
        getClient,
        "Load extension operation failed"
      );
      return withActionTimeout(
        client.extensionOperationStatus(operationId),
        "Load extension operation timed out"
      );
    },
    async activeExtensionOperations() {
      const client = requireClient(
        getClient,
        "Load active extension operations failed"
      );
      return withActionTimeout(
        client.activeExtensionOperations(),
        "Load active extension operations timed out"
      );
    },
    async respondToExtensionInteraction(operationId, interactionId, response, clientId) {
      const client = requireClient(
        getClient,
        "Respond to extension interaction failed"
      );
      return withActionTimeout(
        client.respondToExtensionInteraction(
          operationId,
          interactionId,
          response,
          clientId
        ),
        "Respond to extension interaction timed out"
      );
    },
    async checkExtensionUpdates(clientId) {
      const client = requireClient(getClient, "Check extension updates failed");
      return withActionTimeout(
        client.checkExtensionUpdates(clientId),
        "Check extension updates timed out"
      );
    },
    async refreshExtensions(clientId) {
      const client = requireClient(getClient, "Refresh extensions failed");
      return withActionTimeout(
        client.refreshExtensions(clientId),
        "Refresh extensions timed out"
      );
    },
    async enableExtension(name, params, clientId) {
      const client = requireClient(getClient, "Enable extension failed");
      return withActionTimeout(
        client.enableExtension(name, params, clientId),
        "Enable extension timed out"
      );
    },
    async disableExtension(name, params, clientId) {
      const client = requireClient(getClient, "Disable extension failed");
      return withActionTimeout(
        client.disableExtension(name, params, clientId),
        "Disable extension timed out"
      );
    },
    async updateExtension(name, clientId) {
      const client = requireClient(getClient, "Update extension failed");
      return withActionTimeout(
        client.updateExtension(name, clientId),
        "Update extension timed out"
      );
    },
    async uninstallExtension(name, clientId) {
      const client = requireClient(getClient, "Uninstall extension failed");
      return withActionTimeout(
        client.uninstallExtension(name, clientId),
        "Uninstall extension timed out"
      );
    },
    async startDeviceFlow(providerId) {
      const client = requireClient(getClient, "Start device flow failed");
      return withActionTimeout(
        client.startDeviceFlow({ providerId }),
        "Start device flow timed out"
      );
    },
    async getDeviceFlow(deviceFlowId, opts) {
      const client = requireClient(getClient, "Get device flow failed");
      return withActionTimeout(
        client.getDeviceFlow(deviceFlowId, opts),
        "Get device flow timed out"
      );
    },
    async cancelDeviceFlow(deviceFlowId) {
      const client = requireClient(getClient, "Cancel device flow failed");
      return withActionTimeout(
        client.cancelDeviceFlow(deviceFlowId),
        "Cancel device flow timed out"
      );
    },
    async getAuthStatus() {
      const client = requireClient(getClient, "Get auth status failed");
      return withActionTimeout(
        client.getAuthStatus(),
        "Get auth status timed out"
      );
    },
    async getAuthProviders() {
      const client = requireClient(getClient, "Get auth providers failed");
      return withActionTimeout(
        client.getAuthProviders(),
        "Get auth providers timed out"
      );
    },
    async installAuthProvider(req) {
      const client = requireClient(getClient, "Install auth provider failed");
      return withActionTimeout(
        client.installAuthProvider(req),
        "Install auth provider timed out"
      );
    },
    async deleteModel(target) {
      const client = requireClient(getClient, "Delete model failed");
      return withActionTimeout(
        client.deleteModel(target),
        "Delete model timed out"
      );
    },
    async addWorkspace(cwd, options) {
      const client = requireClient(getClient, "Add workspace failed");
      return withActionTimeout(
        client.addWorkspace(cwd, options),
        "Add workspace timed out"
      );
    },
    /** Applies the standard mutation timeout without retrying the POST. */
    async addScratchWorkspace() {
      const client = requireClient(getClient, "Add scratch workspace failed");
      return withActionTimeout(
        client.addScratchWorkspace(),
        "Add scratch workspace timed out"
      );
    },
    async suggestWorkspacePaths(prefix) {
      const client = requireClient(getClient, "Suggest workspace paths failed");
      const result = await withActionTimeout(
        client.workspacePathSuggestions(prefix),
        "Suggest workspace paths timed out"
      );
      return result;
    },
    async pickWorkspaceDirectory() {
      const client = requireClient(getClient, "Open directory picker failed");
      const result = await withActionTimeout(
        client.workspaceDirectoryPicker(),
        "Open directory picker timed out",
        32e4
      );
      return result;
    },
    async updateWorkspace(workspaceSelector, update) {
      const client = requireClient(getClient, "Update workspace failed");
      return withActionTimeout(
        client.updateWorkspace(workspaceSelector, update),
        "Update workspace timed out"
      );
    },
    async removeWorkspace(workspaceId, options) {
      const client = requireClient(getClient, "Remove workspace failed");
      const removal = client.workspaceById(workspaceId).remove(options);
      if ((options == null ? void 0 : options.timeoutMs) === 0) return removal;
      return withActionTimeout(
        removal,
        "Remove workspace timed out",
        options == null ? void 0 : options.timeoutMs
      );
    }
  };
}
function requireClient(getClient, action) {
  const client = getClient();
  if (!client) {
    throw new Error(`${action}: DaemonClient is not connected`);
  }
  return client;
}
function requireWorkspaceCwd(getWorkspaceCwd) {
  const cwd = getWorkspaceCwd();
  if (!cwd) {
    throw new Error("Daemon workspace is not connected");
  }
  return cwd;
}
function requireWorkspaceClient(getClient, getWorkspaceCwd, action) {
  const client = requireClient(getClient, action);
  return client.workspaceByCwd(requireWorkspaceCwd(getWorkspaceCwd));
}
function scheduledTasksPath(workspaceId, suffix = "") {
  return workspaceId ? `/workspaces/${encodeURIComponent(workspaceId)}/scheduled-tasks${suffix}` : `/scheduled-tasks${suffix}`;
}
function createDaemonHeaders(token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}
function createDaemonJsonHeaders(token) {
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}
function createDaemonRequestUrl(baseUrl, path) {
  const normalizedBaseUrl = stripTrailingSlashes(baseUrl);
  const fallbackBase = typeof window === "undefined" ? "http://localhost" : window.location.origin;
  return new URL(`${normalizedBaseUrl}${path}`, fallbackBase);
}
function serializeDaemonRequestUrl(url, baseUrl) {
  return stripTrailingSlashes(baseUrl) ? url.toString() : `${url.pathname}${url.search}`;
}
function stripTrailingSlashes(value) {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47) end--;
  return end === value.length ? value : value.slice(0, end);
}
async function readDaemonError(res, fallback) {
  try {
    const data = await res.json();
    const message = typeof data.error === "string" ? data.error : typeof data.message === "string" ? data.message : void 0;
    return message ? `${fallback}: ${message}` : `${fallback}: HTTP ${res.status}`;
  } catch {
    return `${fallback}: HTTP ${res.status}`;
  }
}
const DaemonWorkspaceContext = createContext(void 0);
let pendingDisposeClient;
function DaemonWorkspaceProvider({
  baseUrl,
  token,
  workspaceCwd,
  autoConnect = true,
  transport,
  children
}) {
  const client = useMemo(
    () => autoConnect ? new DaemonClient({ baseUrl, token, transport }) : void 0,
    [autoConnect, baseUrl, token, transport]
  );
  const clientRef = useRef(client);
  clientRef.current = client;
  const capabilitiesClientRef = useRef(void 0);
  const capabilitiesPromiseRef = useRef(void 0);
  const capabilitiesGenerationRef = useRef(0);
  const resolvedCwdRef = useRef(workspaceCwd);
  const [capabilities, setCapabilities] = useState(void 0);
  const [status, setStatus] = useState(
    autoConnect ? "connecting" : "idle"
  );
  const [error, setError] = useState(void 0);
  const getCapabilities = useCallback(() => {
    if (!client) {
      return Promise.reject(new Error("Daemon workspace client unavailable"));
    }
    if (capabilitiesClientRef.current !== client) {
      capabilitiesClientRef.current = client;
      capabilitiesPromiseRef.current = void 0;
      capabilitiesGenerationRef.current++;
    }
    if (!capabilitiesPromiseRef.current) {
      const promise = client.capabilities().catch((error2) => {
        if (capabilitiesPromiseRef.current === promise) {
          capabilitiesPromiseRef.current = void 0;
        }
        throw error2;
      });
      capabilitiesPromiseRef.current = promise;
    }
    return capabilitiesPromiseRef.current;
  }, [client]);
  const refreshCapabilities = useCallback(() => {
    if (!client) {
      return Promise.reject(new Error("Daemon workspace client unavailable"));
    }
    if (capabilitiesClientRef.current !== client) {
      capabilitiesClientRef.current = client;
      capabilitiesGenerationRef.current++;
    }
    const generation = ++capabilitiesGenerationRef.current;
    const followAcceptedSuccessor = () => {
      const successor = capabilitiesPromiseRef.current;
      if (capabilitiesClientRef.current === client && successor && capabilitiesGenerationRef.current !== generation) {
        return successor;
      }
      return Promise.reject(
        new Error("Capabilities refresh was superseded by a client change")
      );
    };
    const acceptedPromise = client.capabilities().then(
      (caps) => {
        if (capabilitiesClientRef.current !== client || capabilitiesGenerationRef.current !== generation) {
          return followAcceptedSuccessor();
        }
        setCapabilities(caps);
        setStatus("connected");
        setError(void 0);
        return caps;
      },
      (error2) => {
        if (capabilitiesClientRef.current !== client || capabilitiesGenerationRef.current !== generation) {
          return followAcceptedSuccessor();
        }
        setError(error2 instanceof Error ? error2 : new Error(String(error2)));
        setStatus("error");
        throw error2;
      }
    );
    capabilitiesPromiseRef.current = acceptedPromise;
    return acceptedPromise;
  }, [client]);
  useEffect(() => {
    if (!client) return void 0;
    setStatus("connecting");
    setError(void 0);
    setCapabilities(void 0);
    if (pendingDisposeClient === client) {
      pendingDisposeClient = void 0;
    }
    let disposed = false;
    const initialPromise = getCapabilities();
    void initialPromise.then((caps) => {
      if (!disposed && capabilitiesClientRef.current === client && capabilitiesPromiseRef.current === initialPromise) {
        setCapabilities(caps);
        setStatus("connected");
      }
    }).catch((err) => {
      if (!disposed && capabilitiesClientRef.current === client && capabilitiesPromiseRef.current === initialPromise) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setStatus("error");
      }
    });
    return () => {
      disposed = true;
      pendingDisposeClient = client;
      queueMicrotask(() => {
        if (pendingDisposeClient === client) {
          pendingDisposeClient = void 0;
          client.dispose();
        }
      });
    };
  }, [client, getCapabilities]);
  resolvedCwdRef.current = (capabilities == null ? void 0 : capabilities.workspaceCwd) ?? workspaceCwd;
  const workspaceActions = useMemo(
    () => createDaemonWorkspaceActions({
      getClient: () => clientRef.current,
      getWorkspaceCwd: () => resolvedCwdRef.current,
      baseUrl,
      token
    }),
    [baseUrl, token]
  );
  const contextValue = useMemo(() => {
    if (!client) return void 0;
    return {
      client,
      token,
      baseUrl,
      workspaceCwd: (capabilities == null ? void 0 : capabilities.workspaceCwd) ?? workspaceCwd,
      status,
      error,
      capabilities,
      getCapabilities,
      refreshCapabilities,
      actions: workspaceActions
    };
  }, [
    client,
    token,
    baseUrl,
    workspaceCwd,
    status,
    error,
    capabilities,
    getCapabilities,
    refreshCapabilities,
    workspaceActions
  ]);
  return /* @__PURE__ */ jsx(DaemonWorkspaceContext.Provider, { value: contextValue, children });
}
function useDaemonWorkspace() {
  const context = useContext(DaemonWorkspaceContext);
  if (!context) {
    throw new Error(
      "useDaemonWorkspace must be used within DaemonWorkspaceProvider"
    );
  }
  return context;
}
function useDaemonWorkspaceActions() {
  const context = useDaemonWorkspace();
  return context.actions;
}
function useOptionalDaemonWorkspace() {
  return useContext(DaemonWorkspaceContext);
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function selectDaemonPendingPermissions(blocks) {
  return blocks.filter(
    (block) => block.kind === "permission" && block.resolved === void 0
  );
}
function selectDaemonTodoLists(blocks) {
  return blocks.flatMap((block) => {
    if (block.kind !== "tool") return [];
    const items = extractDaemonTodosFromToolBlock(block);
    if (!items) return [];
    const rawOutput = getRecord(block.rawOutput);
    const plan = getRecord(rawOutput == null ? void 0 : rawOutput["plan"]);
    const planId = getString$1(plan, "id");
    const sourceCallId = getString$1(plan, "sourceCallId");
    return [
      {
        blockId: block.id,
        toolCallId: block.toolCallId,
        title: block.title,
        status: block.status,
        ...planId ? { planId } : {},
        ...sourceCallId ? { sourceCallId } : {},
        items,
        raw: block
      }
    ];
  });
}
function selectDaemonLatestTodoList(blocks) {
  return selectDaemonTodoLists(blocks).at(-1);
}
function selectDaemonActiveTodoList(blocks) {
  const latest = selectDaemonLatestTodoList(blocks);
  return latest && hasDaemonActiveTodos(latest.items) ? latest : void 0;
}
function extractDaemonTodosFromToolBlock(block) {
  const toolName = (block.toolName ?? "").toLowerCase();
  const toolKind = (block.toolKind ?? "").toLowerCase();
  const isTodoTool = toolName === "todowrite" || toolName === "todo_write" || toolKind === "updated_plan" || toolKind === "todo";
  if (!isTodoTool && toolKind !== "other") {
    return void 0;
  }
  const rawOutput = getRecord(block.rawOutput);
  const hasPlanMetadata = getString$1(getRecord(rawOutput == null ? void 0 : rawOutput["plan"]), "id") !== void 0;
  const rawInput = getRecord(block.rawInput);
  const inputTodos = getTodoArray(rawInput);
  if (inputTodos) {
    const todos2 = parseDaemonTodoItemsFromEntries(inputTodos);
    return todos2.length > 0 || isTodoTool ? todos2 : void 0;
  }
  const outputTodos = getTodoArray(rawOutput);
  if (outputTodos) {
    const todos2 = parseDaemonTodoItemsFromEntries(outputTodos);
    return todos2.length > 0 || isTodoTool || hasPlanMetadata ? todos2 : void 0;
  }
  const entries = Array.isArray(rawOutput == null ? void 0 : rawOutput["entries"]) ? rawOutput["entries"] : void 0;
  if (!entries) return void 0;
  const todos = parseDaemonTodoItemsFromEntries(entries);
  return todos.length > 0 || isTodoTool || hasPlanMetadata ? todos : void 0;
}
function parseDaemonTodoItemsFromEntries(entries) {
  const todos = entries.flatMap((entry, index) => {
    const item = getRecord(entry);
    const content = getString$1(item, "content");
    if (!content) return [];
    const meta = getRecord(item == null ? void 0 : item["_meta"]);
    const qwenTodo = getRecord(meta == null ? void 0 : meta["qwenTodo"]);
    const id = getString$1(qwenTodo, "id") ?? getString$1(item, "id") ?? `plan-${index}`;
    const blockedBy = getStringArray$1(qwenTodo, "blockedBy");
    return [
      {
        id,
        content,
        status: getTodoStatus(getString$1(item, "status")),
        ...blockedBy ? { blockedBy } : {},
        ...(() => {
          const priority = getTodoPriority(getString$1(item, "priority"));
          return priority ? { priority } : {};
        })()
      }
    ];
  });
  return todos;
}
function hasDaemonActiveTodos(items) {
  return items.some(
    (item) => item.status === "pending" || item.status === "in_progress"
  );
}
function selectDaemonTranscriptStreamingState(blocks) {
  if (blocks.length === 0) return "idle";
  const last = blocks[blocks.length - 1];
  if ((last == null ? void 0 : last.kind) === "thought" && isStreamingTextBlock(last)) {
    return "thinking";
  }
  if ((last == null ? void 0 : last.kind) === "assistant" && isStreamingTextBlock(last)) {
    return "responding";
  }
  if ((last == null ? void 0 : last.kind) === "tool" && isRunningToolBlock(last)) {
    return "responding";
  }
  for (let i2 = blocks.length - 1; i2 >= 0; i2--) {
    const block = blocks[i2];
    if (block.kind === "user") break;
    if (block.kind === "tool" && isRunningToolBlock(block)) {
      return "responding";
    }
  }
  return "idle";
}
function selectDaemonStreamingState(blocks, promptStatus) {
  const transcriptState = selectDaemonTranscriptStreamingState(blocks);
  if (promptStatus === "idle") {
    return "idle";
  }
  if (transcriptState !== "idle") {
    return transcriptState;
  }
  if (promptStatus === void 0) {
    return transcriptState;
  }
  return promptStatus === "waiting" ? "waiting" : "responding";
}
function isStreamingTextBlock(block) {
  return block.streaming === true;
}
function isRunningToolBlock(block) {
  return block.status === "running" || block.status === "in_progress";
}
function getTodoArray(record) {
  const todos = record == null ? void 0 : record["todos"];
  return Array.isArray(todos) ? todos : void 0;
}
function getTodoStatus(value) {
  return value === "completed" || value === "in_progress" || value === "pending" ? value : "pending";
}
function getTodoPriority(value) {
  return value === "high" || value === "medium" || value === "low" ? value : void 0;
}
function getRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  return value;
}
function getString$1(record, key) {
  const value = record == null ? void 0 : record[key];
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function getStringArray$1(record, key) {
  const value = record == null ? void 0 : record[key];
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : void 0;
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const listeners$1 = /* @__PURE__ */ new Set();
let lastFollowupSuggestion;
function getSidechannelFollowupSuggestion() {
  return lastFollowupSuggestion;
}
function subscribeSidechannelFollowupSuggestion(listener) {
  listeners$1.add(listener);
  return () => {
    listeners$1.delete(listener);
  };
}
function publishSidechannelFollowupSuggestion(suggestion) {
  lastFollowupSuggestion = { ...suggestion };
  notifySidechannelFollowupListeners();
}
function clearSidechannelFollowupSuggestion() {
  if (lastFollowupSuggestion === void 0) return;
  lastFollowupSuggestion = void 0;
  notifySidechannelFollowupListeners();
}
function notifySidechannelFollowupListeners() {
  for (const listener of listeners$1) {
    listener();
  }
}
function parseSidechannelFollowupSuggestion(event) {
  if (!event || typeof event !== "object") return void 0;
  const record = event;
  if (record["type"] !== "followup_suggestion") return void 0;
  const data = record["data"];
  if (!data || typeof data !== "object") return void 0;
  const dataRecord = data;
  const sessionId = dataRecord["sessionId"];
  const suggestion = dataRecord["suggestion"];
  const promptId = dataRecord["promptId"];
  if (typeof sessionId !== "string" || typeof suggestion !== "string" || suggestion.length === 0 || typeof promptId !== "string") {
    return void 0;
  }
  return { sessionId, suggestion, promptId };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const listeners = /* @__PURE__ */ new Set();
const EMPTY = Object.freeze([]);
const MAX_PENDING_BATCHES = 64;
let pending = EMPTY;
function getSidechannelMidTurnInjected() {
  return pending;
}
function subscribeSidechannelMidTurnInjected(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function publishSidechannelMidTurnInjected(data) {
  const appended = [
    ...pending,
    {
      sessionId: data.sessionId,
      messages: [...data.messages],
      ...data.messageIds ? { messageIds: [...data.messageIds] } : {},
      ...data.originatorClientId ? { originatorClientId: data.originatorClientId } : {}
    }
  ];
  if (appended.length > MAX_PENDING_BATCHES) {
    const dropped = appended.length - MAX_PENDING_BATCHES;
    console.debug(
      `[mid-turn] sidechannel buffer over ${MAX_PENDING_BATCHES}; evicting ${dropped} oldest batch(es)`
    );
    pending = appended.slice(dropped);
  } else {
    pending = appended;
  }
  notifyMidTurnInjectedListeners();
}
function consumeSidechannelMidTurnInjected(handled) {
  if (handled.length === 0 || pending.length === 0) return;
  const handledSet = new Set(handled);
  const next = pending.filter((batch) => !handledSet.has(batch));
  if (next.length === pending.length) return;
  pending = next.length === 0 ? EMPTY : next;
  notifyMidTurnInjectedListeners();
}
function notifyMidTurnInjectedListeners() {
  for (const listener of listeners) {
    listener();
  }
}
function parseSidechannelMidTurnInjected(event) {
  if (!event || typeof event !== "object") return void 0;
  const record = event;
  if (record["type"] !== MID_TURN_MESSAGE_INJECTED_EVENT) return void 0;
  const data = record["data"];
  if (!data || typeof data !== "object") return void 0;
  const dataRecord = data;
  const sessionId = dataRecord["sessionId"];
  const messages = dataRecord["messages"];
  if (typeof sessionId !== "string" || !Array.isArray(messages)) {
    return void 0;
  }
  if (!messages.every((message) => typeof message === "string")) {
    return void 0;
  }
  const stringMessages = messages;
  const items = dataRecord["items"];
  const hasRenderableContent = Array.isArray(items) && items.some(
    (item) => !!item && typeof item === "object" && Array.isArray(item["content"]) && item["content"].some(
      (block) => !!block && typeof block === "object" && (block["type"] === "image" || block["type"] === "resource" || block["type"] === "text" && typeof block["text"] === "string" && block["text"].length > 0)
    )
  );
  if (!stringMessages.some(Boolean) && !hasRenderableContent) return void 0;
  const messageIds = dataRecord["messageIds"];
  const stringMessageIds = Array.isArray(messageIds) && messageIds.length === messages.length && messageIds.every(
    (messageId) => typeof messageId === "string" && messageId.length > 0
  ) ? messageIds : void 0;
  const originatorClientId = record["originatorClientId"];
  return {
    sessionId,
    messages: stringMessages,
    ...stringMessageIds ? { messageIds: stringMessageIds } : {},
    ...typeof originatorClientId === "string" ? { originatorClientId } : {}
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const versionListeners = /* @__PURE__ */ new Set();
const eventListeners = /* @__PURE__ */ new Set();
let version = 0;
let events = [];
function getPendingPromptVersion() {
  return version;
}
function getPendingPromptEvents() {
  return events;
}
function subscribePendingPromptVersion(listener) {
  versionListeners.add(listener);
  return () => {
    versionListeners.delete(listener);
  };
}
function subscribePendingPromptEvents(listener) {
  eventListeners.add(listener);
  return () => {
    eventListeners.delete(listener);
  };
}
function bumpPendingPromptVersion() {
  version++;
  for (const listener of versionListeners) {
    try {
      listener();
    } catch (error) {
      console.error("[pendingPromptVersion] listener error", error);
    }
  }
}
function notifyPendingPromptEvents() {
  for (const listener of eventListeners) {
    try {
      listener();
    } catch (error) {
      console.error("[pendingPromptEvents] listener error", error);
    }
  }
}
function consumePendingPromptEvents(handled) {
  if (handled.length === 0) return;
  const handledSet = new Set(handled);
  const next = events.filter((event) => !handledSet.has(event));
  if (next.length === events.length) return;
  events = next;
  notifyPendingPromptEvents();
}
function publishPendingPromptEvent(event) {
  const parsed = parsePendingPromptEvent(event);
  if (!parsed) return false;
  events = [...events, parsed].slice(-200);
  notifyPendingPromptEvents();
  if (parsed.type === PENDING_PROMPT_ADDED_EVENT || parsed.type === PENDING_PROMPT_STARTED_EVENT || parsed.type === PENDING_PROMPT_COMPLETED_EVENT) {
    bumpPendingPromptVersion();
  }
  return true;
}
function isPendingPromptEvent(event) {
  return parsePendingPromptEvent(event) !== void 0;
}
function parsePendingPromptEvent(event) {
  if (!event || typeof event !== "object") return void 0;
  const record = event;
  const type = record["type"];
  const data = record["data"];
  if (!data || typeof data !== "object") return void 0;
  const dataRecord = data;
  if (typeof dataRecord["sessionId"] !== "string") return void 0;
  if ((type === PENDING_PROMPT_ADDED_EVENT || type === PENDING_PROMPT_STARTED_EVENT || type === PENDING_PROMPT_COMPLETED_EVENT) && typeof dataRecord["promptId"] === "string") {
    return event;
  }
  if ((type === "turn_complete" || type === "turn_error") && typeof dataRecord["promptId"] === "string") {
    return event;
  }
  return void 0;
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const MISSING_SESSION_HTTP_STATUSES = [404, 410];
const MISSING_SESSION_HTTP_STATUS_SET = new Set(
  MISSING_SESSION_HTTP_STATUSES
);
function isMissingSessionHttpStatus(status) {
  return status !== void 0 && MISSING_SESSION_HTTP_STATUS_SET.has(status);
}
function resolveConnectionErrorStatus(nextStatus, currentStatus) {
  if (isMissingSessionHttpStatus(currentStatus) && !isMissingSessionHttpStatus(nextStatus)) {
    return currentStatus;
  }
  return nextStatus;
}
const SESSION_TRANSCRIPT_PAGINATION_FEATURE = "session_transcript_pagination";
const CLIENT_IDENTITY_FEATURE = "client_identity";
const WORKSPACE_ACP_PREHEAT_FEATURE = "workspace_acp_preheat";
const WORKSPACE_ACP_STATUS_FEATURE = "workspace_acp_status";
const RESTORE_IN_PROGRESS_RETRY_MAX_MS = 6e4;
const RECORD_UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function assistantDoneFromTurnEvent(event, reason) {
  const serverTimestamp = extractServerTimestamp(event);
  const data = isRecord(event.data) ? event.data : void 0;
  const rawBranchPoint = event.type === "turn_complete" && reason === "end_turn" && isRecord(data == null ? void 0 : data["branchPoint"]) ? data["branchPoint"] : void 0;
  const assistantRecordUuid = typeof (rawBranchPoint == null ? void 0 : rawBranchPoint["assistantRecordUuid"]) === "string" ? rawBranchPoint["assistantRecordUuid"] : void 0;
  const checkpointUuid = typeof (rawBranchPoint == null ? void 0 : rawBranchPoint["checkpointUuid"]) === "string" ? rawBranchPoint["checkpointUuid"] : void 0;
  const branchPointValid = assistantRecordUuid !== void 0 && RECORD_UUID_PATTERN.test(assistantRecordUuid) && checkpointUuid !== void 0 && RECORD_UUID_PATTERN.test(checkpointUuid);
  return {
    type: "assistant.done",
    reason,
    eventId: event.id,
    ...event.promptId ? { promptId: event.promptId } : {},
    ...serverTimestamp !== void 0 ? { serverTimestamp } : {},
    ...branchPointValid ? {
      sourceRecordIds: [assistantRecordUuid],
      branchRecordId: checkpointUuid
    } : {}
  };
}
function getPersistedReplayRecordId(event) {
  if (event.type === "history_truncated") {
    try {
      if (!isRecord(event.data)) return void 0;
      return getString(event.data, "recordId");
    } catch {
      return void 0;
    }
  }
  if (event.type !== "session_update") {
    return void 0;
  }
  try {
    if (!isRecord(event.data)) return void 0;
    const update = event.data["update"];
    const meta = isRecord(update) ? update["_meta"] : event.data["_meta"];
    return isRecord(meta) ? getString(meta, "qwen.session.recordId") : void 0;
  } catch {
    return void 0;
  }
}
function hasFullTranscriptBeforeReplay(event) {
  return event.type === "history_truncated" && isRecord(event.data) && event.data["fullTranscriptAvailable"] === true;
}
function isHistoricalReplayMarker(event) {
  return hasFullTranscriptBeforeReplay(event) && isRecord(event.data) && event.data["scope"] === void 0;
}
function materializeTranscriptHistory(current, events2, maxBlocks) {
  var _a;
  const displayedRecordIds = /* @__PURE__ */ new Set();
  for (const block of current.blocks) {
    for (const recordId of block.sourceRecordIds ?? []) {
      displayedRecordIds.add(recordId);
    }
  }
  for (const diagnostic of current.unrecognizedDiagnostics) {
    for (const recordId of diagnostic.sourceRecordIds ?? []) {
      displayedRecordIds.add(recordId);
    }
  }
  const userBlockBoundaryKey = (block) => {
    var _a2, _b;
    if ((block == null ? void 0 : block.kind) !== "user") return void 0;
    const text = block.text ?? "";
    const images = ((_a2 = block.images) == null ? void 0 : _a2.length) ?? 0;
    const files = ((_b = block.files) == null ? void 0 : _b.length) ?? 0;
    return `${text}\0img:${images}\0file:${files}`;
  };
  const oldestRetainedBlock = current.blocks[0];
  const boundaryEchoKey = (((_a = oldestRetainedBlock == null ? void 0 : oldestRetainedBlock.sourceRecordIds) == null ? void 0 : _a.length) ?? 0) === 0 ? userBlockBoundaryKey(oldestRetainedBlock) : void 0;
  const freshEvents = displayedRecordIds.size === 0 ? events2 : events2.filter(
    (event) => {
      var _a2;
      return !((_a2 = event.sourceRecordIds) == null ? void 0 : _a2.some(
        (recordId) => displayedRecordIds.has(recordId)
      ));
    }
  );
  const historyStore = createDaemonTranscriptStore({
    maxBlocks: Number.MAX_SAFE_INTEGER,
    // Trim-free by intent: a media-heavy page would otherwise cross the
    // default byte budget mid-build and evict the page's oldest records,
    // which the exclusive pagination anchor can never re-fetch.
    maxRetainedBytes: Number.POSITIVE_INFINITY,
    nextOrdinal: current.nextOrdinal,
    retainSubagentBlocks: current.retainSubagentBlocks
  });
  historyStore.dispatch(freshEvents);
  const history = historyStore.getSnapshot();
  let pageBlockList = history.blocks;
  if (boundaryEchoKey !== void 0) {
    for (let i2 = history.blocks.length - 1; i2 >= 0; i2 -= 1) {
      const block = history.blocks[i2];
      if ((block == null ? void 0 : block.kind) !== "user") continue;
      if (userBlockBoundaryKey(block) === boundaryEchoKey) {
        pageBlockList = [
          ...history.blocks.slice(0, i2),
          ...history.blocks.slice(i2 + 1)
        ];
      }
      break;
    }
  }
  let pageBytes = 0;
  for (const block of pageBlockList) {
    pageBytes += estimateDaemonTranscriptBlockBytes(block);
  }
  const pageBlocks = pageBlockList.length;
  const impossible = pageBlocks >= maxBlocks || pageBytes >= current.maxRetainedBytes;
  if (pageBlocks + current.blocks.length > maxBlocks) {
    return {
      admitted: false,
      reason: "count",
      pageBlocks,
      pageBytes,
      impossible
    };
  }
  if (current.retainedBytes + pageBytes > current.maxRetainedBytes) {
    return {
      admitted: false,
      reason: "bytes",
      pageBlocks,
      pageBytes,
      impossible
    };
  }
  return {
    admitted: true,
    materialization: {
      blocks: pageBlockList,
      nextOrdinal: history.nextOrdinal,
      retainedBytes: pageBytes,
      toolBlockByCallId: history.toolBlockByCallId,
      permissionBlockByRequestId: history.permissionBlockByRequestId,
      // History pages can carry frames recorded by newer daemon versions, exactly
      // forward-compat case the sidechannel exists for (#8823); keep them
      // instead of dropping the throwaway store's diagnostics.
      unrecognizedDiagnostics: history.unrecognizedDiagnostics
    }
  };
}
function applyTranscriptHistory(current, history) {
  const toolBlockByCallId = {
    ...history.toolBlockByCallId
  };
  for (const [callId, blockId] of Object.entries(current.toolBlockByCallId)) {
    if (isTrimmedToolBlockId(blockId) && toolBlockByCallId[callId] !== void 0) {
      continue;
    }
    toolBlockByCallId[callId] = blockId;
  }
  const trimmedToolNotificationByCallId = {
    ...current.trimmedToolNotificationByCallId
  };
  for (const callId of Object.keys(history.toolBlockByCallId)) {
    delete trimmedToolNotificationByCallId[callId];
  }
  const permissionBlockByRequestId = {
    ...history.permissionBlockByRequestId
  };
  for (const [requestId, blockId] of Object.entries(
    current.permissionBlockByRequestId
  )) {
    if (isTrimmedPermissionBlockId(blockId) && permissionBlockByRequestId[requestId] !== void 0) {
      continue;
    }
    permissionBlockByRequestId[requestId] = blockId;
  }
  return {
    ...current,
    blocks: [...history.blocks, ...current.blocks],
    retainedBytes: current.retainedBytes + history.retainedBytes,
    nextOrdinal: history.nextOrdinal,
    toolBlockByCallId,
    trimmedToolNotificationByCallId,
    permissionBlockByRequestId,
    // History entries are older than anything received live, so they go
    // first; the slice keeps the newest entries within the sidechannel cap.
    unrecognizedDiagnostics: [
      ...history.unrecognizedDiagnostics,
      ...current.unrecognizedDiagnostics
    ].slice(-UNRECOGNIZED_DIAGNOSTICS_LIMIT)
  };
}
function boundedString(value, maxLength) {
  if (typeof value !== "string" || value.length === 0) return void 0;
  return value.length <= maxLength ? value : `${value.slice(0, maxLength)}…`;
}
function projectSubagentToolUpdate(event) {
  var _a;
  const rawInput = isRecord(event.rawInput) ? event.rawInput : void 0;
  const rawOutput = isRecord(event.rawOutput) ? event.rawOutput : void 0;
  const name = (_a = event.toolName) == null ? void 0 : _a.toLowerCase();
  const isSubagent = name === "agent" || name === "task" || typeof (rawInput == null ? void 0 : rawInput["subagent_type"]) === "string" || (rawOutput == null ? void 0 : rawOutput["type"]) === "task_execution";
  if (!isSubagent) return event;
  const executionSummary = isRecord(rawOutput == null ? void 0 : rawOutput["executionSummary"]) ? rawOutput["executionSummary"] : void 0;
  const subagentType = boundedString(rawInput == null ? void 0 : rawInput["subagent_type"], 120);
  const prompt = boundedString(rawInput == null ? void 0 : rawInput["prompt"], 240);
  const description = boundedString(rawInput == null ? void 0 : rawInput["description"], 240);
  const workingDir = boundedString(rawInput == null ? void 0 : rawInput["working_dir"], 240);
  const agentName = boundedString(rawInput == null ? void 0 : rawInput["name"], 120);
  const todoId = typeof (rawInput == null ? void 0 : rawInput["todo_id"]) === "string" ? rawInput["todo_id"] : void 0;
  const subagentName = boundedString(rawOutput == null ? void 0 : rawOutput["subagentName"], 120);
  const subagentColor = boundedString(rawOutput == null ? void 0 : rawOutput["subagentColor"], 80);
  const taskDescription = boundedString(rawOutput == null ? void 0 : rawOutput["taskDescription"], 240);
  const status = boundedString(rawOutput == null ? void 0 : rawOutput["status"], 80);
  const terminateReason = boundedString(rawOutput == null ? void 0 : rawOutput["terminateReason"], 240);
  const projectedInput = rawInput ? {
    ...subagentType ? { subagent_type: subagentType } : {},
    ...prompt ? { prompt } : {},
    ...description ? { description } : {},
    ...todoId ? { todo_id: todoId } : {},
    ...typeof rawInput["run_in_background"] === "boolean" ? { run_in_background: rawInput["run_in_background"] } : {},
    ...workingDir ? { working_dir: workingDir } : {},
    ...agentName ? { name: agentName } : {}
  } : void 0;
  const projectedOutput = rawOutput ? {
    ...rawOutput["type"] === "task_execution" ? { type: "task_execution" } : {},
    ...subagentName ? { subagentName } : {},
    ...subagentColor ? { subagentColor } : {},
    ...taskDescription ? { taskDescription } : {},
    ...status ? { status } : {},
    ...terminateReason ? { terminateReason } : {},
    ...typeof rawOutput["tokenCount"] === "number" ? { tokenCount: rawOutput["tokenCount"] } : {},
    ...executionSummary ? {
      executionSummary: {
        ...typeof executionSummary["totalToolCalls"] === "number" ? { totalToolCalls: executionSummary["totalToolCalls"] } : {},
        ...typeof executionSummary["totalDurationMs"] === "number" ? { totalDurationMs: executionSummary["totalDurationMs"] } : {},
        ...typeof executionSummary["outputTokens"] === "number" ? { outputTokens: executionSummary["outputTokens"] } : {},
        ...typeof executionSummary["inputTokens"] === "number" ? { inputTokens: executionSummary["inputTokens"] } : {},
        ...typeof executionSummary["cachedTokens"] === "number" ? { cachedTokens: executionSummary["cachedTokens"] } : {},
        ...typeof executionSummary["totalTokens"] === "number" ? { totalTokens: executionSummary["totalTokens"] } : {}
      }
    } : {}
  } : void 0;
  return {
    ...event,
    ...projectedInput && Object.keys(projectedInput).length > 0 ? { rawInput: projectedInput } : { rawInput: void 0 },
    ...projectedOutput && Object.keys(projectedOutput).length > 0 ? { rawOutput: projectedOutput } : { rawOutput: void 0 },
    content: void 0,
    details: void 0
  };
}
function projectMainTranscriptEvents(events2) {
  const projected = [];
  for (const event of events2) {
    if ("parentToolCallId" in event && event.parentToolCallId && event.type !== "assistant.usage") {
      continue;
    }
    projected.push(
      event.type === "tool.update" ? projectSubagentToolUpdate(event) : event
    );
  }
  return projected;
}
const DaemonStoreContext = createContext(
  void 0
);
const DaemonConnectionContext = createContext(void 0);
const DaemonActionsContext = createContext(
  void 0
);
const DaemonTranscriptHistoryContext = createContext(void 0);
const DaemonPromptStatusContext = createContext(
  void 0
);
const DaemonSessionNoticesContext = createContext(void 0);
const DaemonWorkspaceEventSignalsContext = createContext(void 0);
const DaemonSessionOwnerGuardContext = createContext(void 0);
const AUTH_FAILURE_HTTP_STATUSES = /* @__PURE__ */ new Set([401, 403]);
const TERMINAL_SESSION_HTTP_STATUSES = /* @__PURE__ */ new Set([
  ...AUTH_FAILURE_HTTP_STATUSES,
  ...MISSING_SESSION_HTTP_STATUSES
]);
const DEFAULT_MAX_BLOCKS = 5e4;
const TRANSCRIPT_DISPATCH_BATCH_MS = 16;
const INITIAL_WORKSPACE_EVENT_SIGNALS = {
  memoryVersion: 0,
  agentsVersion: 0,
  toolsVersion: 0,
  settingsVersion: 0,
  skillsVersion: 0,
  mcpVersion: 0,
  extensionsVersion: 0,
  artifactsVersion: 0,
  initVersion: 0,
  authVersion: 0
};
const UNHANDLED_SESSION = Symbol("unhandled session");
function DaemonSessionProvider(props) {
  const {
    baseUrl,
    token,
    workspaceCwd,
    sessionId,
    clientId,
    createSessionRequest,
    maxQueued = 1024,
    maxBlocks = DEFAULT_MAX_BLOCKS,
    maxRetainedBytes,
    historyPageSize,
    subagentTranscriptMode = "full",
    suppressOwnUserEcho = true,
    includeRawEvent = false,
    autoConnect = true,
    autoReconnect = true,
    restartEventStreamOnPrompt = false,
    reconnectDelayMs = 1e3,
    maxReconnectDelayMs = 1e4,
    heartbeatIntervalMs = 3e4,
    heartbeatFailureThreshold = 3,
    loadWarnings,
    children
  } = props;
  const workspace = useOptionalDaemonWorkspace();
  const resolvedBaseUrl = baseUrl ?? (workspace == null ? void 0 : workspace.baseUrl);
  const resolvedToken = token ?? (workspace == null ? void 0 : workspace.token);
  const resolvedWorkspaceCwd = workspaceCwd ?? (workspace == null ? void 0 : workspace.workspaceCwd);
  const sessionCapabilitiesRef = useRef(
    workspace == null ? void 0 : workspace.capabilities
  );
  const workspaceClientRef = useRef(workspace == null ? void 0 : workspace.client);
  workspaceClientRef.current = workspace == null ? void 0 : workspace.client;
  const workspaceCapabilitiesRef = useRef(workspace == null ? void 0 : workspace.capabilities);
  workspaceCapabilitiesRef.current = workspace == null ? void 0 : workspace.capabilities;
  const workspaceGetCapabilitiesRef = useRef(workspace == null ? void 0 : workspace.getCapabilities);
  workspaceGetCapabilitiesRef.current = workspace == null ? void 0 : workspace.getCapabilities;
  const workspaceAcpPreheatInFlightRef = useRef(false);
  const initialRestoreSessionIdRef = useRef(sessionId);
  const initialRestoreSessionId = initialRestoreSessionIdRef.current;
  const shouldDeferInitialSessionCreation = initialRestoreSessionId === void 0;
  const resolvedWorkspaceCwdRef = useRef(resolvedWorkspaceCwd);
  resolvedWorkspaceCwdRef.current = resolvedWorkspaceCwd;
  const activeWorkspaceCwdRef = useRef(resolvedWorkspaceCwd);
  if (resolvedWorkspaceCwd) {
    activeWorkspaceCwdRef.current = resolvedWorkspaceCwd;
  }
  const sessionRef = useRef(void 0);
  const sessionConfigGenerationRef = useRef(
    /* @__PURE__ */ new WeakMap()
  );
  const transcriptHistoryRef = useRef({
    hasMore: false,
    loading: false,
    capacityReached: false,
    paginationError: false
  });
  const [transcriptHistoryState, setTranscriptHistoryState] = useState({
    hasMore: false,
    loading: false,
    capacityReached: false,
    paginationError: false
  });
  const paginationGenerationRef = useRef(0);
  const store = useMemo(
    () => createDaemonTranscriptStore({
      maxBlocks,
      ...maxRetainedBytes !== void 0 ? { maxRetainedBytes } : {},
      retainSubagentBlocks: subagentTranscriptMode === "full",
      onTruncation: (detail) => {
        var _a, _b;
        if (detail.kind !== "blocks") return;
        const history = transcriptHistoryRef.current;
        const activeSession = sessionRef.current;
        if (!activeSession || history.sessionId !== activeSession.sessionId) {
          return;
        }
        if (detail.evictedOldest !== false) {
          if (detail.oldestRetainedRecordId !== void 0) {
            history.beforeRecordId = detail.oldestRetainedRecordId;
            history.cursor = void 0;
            if (history.rejectedPage) {
              const preTrim = store.getSnapshot();
              const postTrimBlockCount = detail.blockCount ?? preTrim.blocks.length;
              const postTrimRetainedBytes = detail.retainedBytes ?? preTrim.retainedBytes;
              history.rejectedPage = {
                blocks: history.rejectedPage.blocks + Math.max(0, preTrim.blocks.length - postTrimBlockCount),
                bytes: history.rejectedPage.bytes + Math.max(0, preTrim.retainedBytes - postTrimRetainedBytes)
              };
            }
            if (!history.capacityReached && !history.hasMore) {
              const features = (_a = sessionCapabilitiesRef.current) == null ? void 0 : _a.features;
              const windowCaps = store.getSnapshot();
              const postTrimRetainedBytes = detail.retainedBytes ?? windowCaps.retainedBytes;
              const byteCap = detail.maxRetainedBytes ?? windowCaps.maxRetainedBytes;
              const olderHistoryReachable = Array.isArray(features) && features.includes(SESSION_TRANSCRIPT_PAGINATION_FEATURE) && postTrimRetainedBytes < byteCap;
              if (olderHistoryReachable) {
                history.hasMore = true;
                setTranscriptHistoryState({
                  hasMore: true,
                  loading: false,
                  capacityReached: false,
                  paginationError: history.paginationError
                });
              }
            }
          } else {
            history.beforeRecordId = void 0;
            history.cursor = void 0;
            if (history.hasMore) {
              history.hasMore = false;
              setTranscriptHistoryState({
                hasMore: false,
                loading: history.loading,
                capacityReached: history.capacityReached,
                paginationError: history.paginationError
              });
            }
          }
        }
        if (detail.evictedOldest !== false) {
          paginationGenerationRef.current += 1;
        }
        if (history.capacityReached) {
          const features = (_b = sessionCapabilitiesRef.current) == null ? void 0 : _b.features;
          const paginationSupported = Array.isArray(features) && features.includes(SESSION_TRANSCRIPT_PAGINATION_FEATURE);
          const anchored = history.beforeRecordId !== void 0 || history.cursor !== void 0;
          if (!paginationSupported || !anchored) {
            return;
          }
          const windowCaps = store.getSnapshot();
          const postTrimBlockCount = detail.blockCount ?? windowCaps.blocks.length;
          const postTrimRetainedBytes = detail.retainedBytes ?? windowCaps.retainedBytes;
          const blockCap = detail.maxBlocks ?? windowCaps.maxBlocks;
          const byteCap = detail.maxRetainedBytes ?? windowCaps.maxRetainedBytes;
          const rejected = history.rejectedPage;
          const admissionHeadroom = rejected ? rejected.blocks + postTrimBlockCount <= blockCap && rejected.bytes + postTrimRetainedBytes <= byteCap : postTrimBlockCount < blockCap;
          if (!admissionHeadroom) {
            return;
          }
          history.rejectedPage = void 0;
          history.hasMore = true;
          history.capacityReached = false;
          setTranscriptHistoryState({
            hasMore: true,
            loading: false,
            capacityReached: false,
            paginationError: history.paginationError
          });
        }
      }
    }),
    [maxBlocks, maxRetainedBytes, subagentTranscriptMode]
  );
  const eventStreamRef = useRef(void 0);
  const lastSessionIdRef = useRef(void 0);
  const activePromptsRef = useRef(/* @__PURE__ */ new Map());
  const settledPromptsRef = useRef(/* @__PURE__ */ new Map());
  const pendingSessionLoadRef = useRef(
    void 0
  );
  const pendingSessionLoadIdRef = useRef(0);
  const liveJournalRepairRef = useRef(
    void 0
  );
  const repairReloadRef = useRef(void 0);
  const tryLiveJournalRepairRef = useRef(void 0);
  const passiveAssistantDoneTimerRef = useRef(void 0);
  const heartbeatSupportedRef = useRef(false);
  const heartbeatFailureStateRef = useRef({
    consecutiveFailures: 0
  });
  const manualSessionClearRef = useRef(false);
  const skipNextCleanupDetachSessionRef = useRef(void 0);
  const settledRestoredActivePromptSessionsRef = useRef(/* @__PURE__ */ new WeakSet());
  const eventOptionsRef = useRef({ suppressOwnUserEcho, includeRawEvent });
  const reconnectConfigRef = useRef({ reconnectDelayMs, maxReconnectDelayMs });
  const reconnectAbortRef = useRef(void 0);
  const loadWarningsRef = useRef(loadWarnings);
  const historyPageSizeRef = useRef(historyPageSize);
  const subagentTranscriptModeRef = useRef(subagentTranscriptMode);
  const clientIdRef = useRef(getStableClientId(clientId));
  eventOptionsRef.current = { suppressOwnUserEcho, includeRawEvent };
  reconnectConfigRef.current = { reconnectDelayMs, maxReconnectDelayMs };
  loadWarningsRef.current = loadWarnings;
  historyPageSizeRef.current = historyPageSize;
  subagentTranscriptModeRef.current = subagentTranscriptMode;
  const modelServiceId = createSessionRequest == null ? void 0 : createSessionRequest.modelServiceId;
  const sessionScope = createSessionRequest == null ? void 0 : createSessionRequest.sessionScope;
  const createSessionRequestRef = useRef(createSessionRequest);
  createSessionRequestRef.current = createSessionRequest;
  const [promptStatus, setPromptStatus] = useState("idle");
  const [restoreSessionId, setRestoreSessionId] = useState(
    initialRestoreSessionId
  );
  const [restoreWorkspaceCwd, setRestoreWorkspaceCwd] = useState(void 0);
  const [restoreMode, setRestoreMode] = useState("load");
  const [restoreSessionNonce, setRestoreSessionNonce] = useState(0);
  const [attachSessionNonce, setAttachSessionNonce] = useState(0);
  const [newSessionNonce, setNewSessionNonce] = useState(0);
  const [connection, setConnection] = useState({
    status: autoConnect ? "connecting" : "idle",
    ...initialRestoreSessionId ? { sessionId: initialRestoreSessionId } : {},
    ...resolvedWorkspaceCwd ? { workspaceCwd: resolvedWorkspaceCwd } : {}
  });
  const connectionRef = useRef(connection);
  connectionRef.current = connection;
  const initialClientIdDependencyRef = useRef(clientId);
  const knownCapabilities = (workspace == null ? void 0 : workspace.capabilities) ?? sessionCapabilitiesRef.current ?? connection.capabilities;
  const legacyClientIdDependency = knownCapabilities && !knownCapabilities.features.includes(CLIENT_IDENTITY_FEATURE) ? clientId : initialClientIdDependencyRef.current;
  if (knownCapabilities && !knownCapabilities.features.includes(CLIENT_IDENTITY_FEATURE) && legacyClientIdDependency) {
    clientIdRef.current = getStableClientId(legacyClientIdDependency);
  }
  const setConnectionSynchronous = useCallback(
    (update) => {
      const next = typeof update === "function" ? update(connectionRef.current) : update;
      connectionRef.current = next;
      setConnection(update);
    },
    []
  );
  useEffect(() => {
    if (!(workspace == null ? void 0 : workspace.capabilities)) return;
    setConnection(
      (current) => current.capabilities === workspace.capabilities ? current : { ...current, capabilities: workspace.capabilities }
    );
  }, [workspace == null ? void 0 : workspace.capabilities]);
  const noticeIdRef = useRef(0);
  const [notices, setNotices] = useState([]);
  const addNotice = useCallback((input) => {
    const notice = {
      ...input,
      id: input.id ?? `daemon-notice-${Date.now()}-${++noticeIdRef.current}`,
      createdAt: input.createdAt ?? Date.now()
    };
    setNotices(
      (current) => current.some((existing) => existing.id === notice.id) ? current : [...current.slice(-49), notice]
    );
    return notice;
  }, []);
  const dismissNotice = useCallback((id) => {
    setNotices((current) => current.filter((notice) => notice.id !== id));
  }, []);
  const clearNotices = useCallback(() => {
    setNotices([]);
  }, []);
  const noticesValue = useMemo(
    () => ({
      notices,
      dismissNotice,
      clearNotices
    }),
    [clearNotices, dismissNotice, notices]
  );
  const [workspaceEventSignals, setWorkspaceEventSignals] = useState(INITIAL_WORKSPACE_EVENT_SIGNALS);
  const hasCurrentSessionActivePromptRef = useRef(() => false);
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      var _a, _b;
      mountedRef.current = false;
      (_b = (_a = liveJournalRepairRef.current) == null ? void 0 : _a.controller) == null ? void 0 : _b.abort();
      liveJournalRepairRef.current = void 0;
      tryLiveJournalRepairRef.current = void 0;
    };
  }, []);
  const sessionEffectWorkspaceCwd = restoreWorkspaceCwd ?? workspaceCwd;
  useEffect(() => {
    var _a;
    if (!autoConnect) return void 0;
    if (!workspaceClientRef.current && !resolvedBaseUrl) {
      setConnection({
        status: "error",
        error: "DaemonSessionProvider requires a baseUrl prop or an ancestor DaemonWorkspaceProvider."
      });
      return void 0;
    }
    const abort = new AbortController();
    let disposed = false;
    const preservingTranscriptDuringLoad = restoreMode === "load" && restoreSessionId !== void 0 && restoreSessionId === ((_a = sessionRef.current) == null ? void 0 : _a.sessionId) && sessionRef.current === skipNextCleanupDetachSessionRef.current;
    const effectPendingSessionLoad = pendingSessionLoadRef.current;
    let runnerSession = sessionRef.current;
    let pendingTranscriptEvents = [];
    let transcriptFlushTimer;
    const runTranscriptFlush = (force = false) => {
      transcriptFlushTimer = void 0;
      if (pendingTranscriptEvents.length === 0) return;
      if (!force && runnerSession !== void 0 && sessionRef.current !== runnerSession) {
        pendingTranscriptEvents = [];
        return;
      }
      const batch = pendingTranscriptEvents;
      pendingTranscriptEvents = [];
      try {
        store.dispatch(batch);
      } catch (error) {
        console.error(
          "[DaemonSessionProvider] batched transcript dispatch failed",
          { eventCount: batch.length, error }
        );
      }
    };
    const cancelTranscriptFlush = () => {
      if (transcriptFlushTimer === void 0) return;
      clearTimeout(transcriptFlushTimer);
      transcriptFlushTimer = void 0;
    };
    const enqueueTranscriptEvents = (events2) => {
      if (events2.length === 0) return;
      for (const event of events2) pendingTranscriptEvents.push(event);
      if (transcriptFlushTimer === void 0) {
        transcriptFlushTimer = setTimeout(
          runTranscriptFlush,
          TRANSCRIPT_DISPATCH_BATCH_MS
        );
      }
    };
    const flushTranscriptSync = () => {
      cancelTranscriptFlush();
      runTranscriptFlush(true);
    };
    const dispatchTranscriptNow = (events2) => {
      flushTranscriptSync();
      store.dispatch(events2);
    };
    const clearPendingTranscriptEvents = () => {
      cancelTranscriptFlush();
      pendingTranscriptEvents = [];
    };
    const tryLiveJournalRepair = () => {
      var _a2;
      if (disposed || abort.signal.aborted) return;
      const repair = liveJournalRepairRef.current;
      if (!repair || repair.attempted || !repair.terminalSeen || pendingSessionLoadRef.current || transcriptHistoryRef.current.loading || ((_a2 = sessionRef.current) == null ? void 0 : _a2.sessionId) !== repair.sessionId || hasCurrentSessionActivePromptRef.current()) {
        return;
      }
      const reload = repairReloadRef.current;
      if (!reload) return;
      repair.attempted = true;
      const controller = new AbortController();
      repair.controller = controller;
      void reload(controller.signal, { replaySource: "memory" }).catch(
        (error) => {
          if (liveJournalRepairRef.current !== repair) return;
          addNotice({
            id: `daemon.live_journal_repair.failed:${repair.target.signature}`,
            severity: "warning",
            category: "connection",
            operation: "load_session",
            code: "daemon.live_journal_repair.failed",
            message: "Could not restore the complete turn. The retained replay remains visible.",
            debugMessage: error instanceof Error ? error.message : String(error),
            recoverable: true
          });
          liveJournalRepairRef.current = void 0;
        }
      );
    };
    tryLiveJournalRepairRef.current = tryLiveJournalRepair;
    const run = async () => {
      var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
      const client = workspaceClientRef.current ?? new DaemonClient({ baseUrl: resolvedBaseUrl, token: resolvedToken });
      let session;
      let capabilities;
      let reconnectSessionId = restoreSessionId;
      let shouldCreateFreshSession = !manualSessionClearRef.current && !restoreSessionId && newSessionNonce > 0;
      let reconnectAttempt = 0;
      let nextSseConnectReason;
      let skipMetadataRefresh = false;
      let hasCurrentSessionActivePrompt = () => false;
      let userDeletedSession = false;
      while (!disposed && !abort.signal.aborted) {
        const skipMetadataRefreshThisIteration = skipMetadataRefresh;
        skipMetadataRefresh = false;
        let loadingRequestedSession = false;
        let eventStream;
        let removeProviderAbortListener;
        const clearEventStream = () => {
          removeProviderAbortListener == null ? void 0 : removeProviderAbortListener();
          removeProviderAbortListener = void 0;
          if (eventStreamRef.current === eventStream) {
            eventStreamRef.current = void 0;
          }
        };
        try {
          let isSameSessionReconnect = false;
          let shouldInjectReplaySnapshot = false;
          let needsStoreReset = false;
          let attachedExistingSession = false;
          let replayTokenUsage;
          let replayTokenCount;
          let repairingEpisode;
          let repairSuffix;
          if (!session) {
            const existingSession = sessionRef.current;
            if (existingSession && !restoreSessionId && !reconnectSessionId && !shouldCreateFreshSession) {
              session = existingSession;
              reconnectSessionId = existingSession.sessionId;
              lastSessionIdRef.current = existingSession.sessionId;
              attachedExistingSession = true;
            }
          }
          if (!session) {
            if (!preservingTranscriptDuringLoad) {
              setConnection((current) => ({
                ...current,
                status: "connecting",
                error: void 0,
                errorStatus: resolveConnectionErrorStatus(
                  void 0,
                  current.errorStatus
                )
              }));
            }
            const getWorkspaceCapabilities = workspaceGetCapabilitiesRef.current;
            const caps = workspaceCapabilitiesRef.current ?? (getWorkspaceCapabilities ? await getWorkspaceCapabilities() : await client.capabilities());
            if (disposed || abort.signal.aborted) return;
            capabilities = caps;
            sessionCapabilitiesRef.current = caps;
            const historyPaginationSupported = Array.isArray(caps.features) && caps.features.includes(SESSION_TRANSCRIPT_PAGINATION_FEATURE);
            heartbeatSupportedRef.current = Array.isArray(caps.features) && caps.features.includes("client_heartbeat");
            const effectWorkspaceCwd = restoreWorkspaceCwd ?? resolvedWorkspaceCwdRef.current ?? caps.workspaceCwd;
            activeWorkspaceCwdRef.current = effectWorkspaceCwd;
            const capabilityFeatures = Array.isArray(caps.features) ? caps.features : [];
            const canPreheatPrimaryWorkspace = effectWorkspaceCwd === caps.workspaceCwd && capabilityFeatures.includes(WORKSPACE_ACP_PREHEAT_FEATURE);
            const canReadPrimaryAcpStatus = canPreheatPrimaryWorkspace && capabilityFeatures.includes(WORKSPACE_ACP_STATUS_FEATURE);
            if ((shouldDeferInitialSessionCreation || manualSessionClearRef.current) && !restoreSessionId && !reconnectSessionId && !shouldCreateFreshSession) {
              const [providerResult2, skillsResult, acpStatusResult, gitResult2] = await Promise.allSettled([
                client.workspaceProviders(),
                client.workspaceSkills(),
                canReadPrimaryAcpStatus ? client.workspaceAcpStatus() : Promise.resolve(void 0),
                effectWorkspaceCwd ? client.workspaceByCwd(effectWorkspaceCwd).workspaceGit() : client.workspaceGit()
              ]);
              if (providerResult2.status === "rejected") {
                console.warn(
                  "[DaemonSessionProvider] workspaceProviders failed in deferred connect:",
                  providerResult2.reason
                );
              }
              if (skillsResult.status === "rejected") {
                console.warn(
                  "[DaemonSessionProvider] workspaceSkills failed in deferred connect:",
                  skillsResult.reason
                );
              }
              if (canReadPrimaryAcpStatus && acpStatusResult.status === "rejected") {
                console.warn(
                  "[DaemonSessionProvider] workspaceAcpStatus failed in deferred connect:",
                  acpStatusResult.reason
                );
              }
              const providers2 = providerResult2.status === "fulfilled" ? providerResult2.value : void 0;
              const providerModelStatus2 = mapProviderStatus(providers2);
              const {
                commands: deferredSkillCommands,
                skills: deferredSkills
              } = mapWorkspaceSkills(
                skillsResult.status === "fulfilled" ? skillsResult.value : void 0
              );
              const preserveClearedSessionCommands = skillsResult.status === "rejected" || manualSessionClearRef.current && deferredSkillCommands.length === 0;
              setConnection((current) => ({
                ...current,
                status: "connected",
                workspaceCwd: effectWorkspaceCwd,
                gitBranch: gitResult2.status === "fulfilled" ? gitResult2.value.branch ?? void 0 : void 0,
                models: providerModelStatus2.models,
                currentModel: providerModelStatus2.currentModel,
                currentMode: providerModelStatus2.currentMode,
                contextWindow: providerModelStatus2.contextWindow,
                providers: providers2,
                capabilities: caps,
                commands: preserveClearedSessionCommands ? current.commands : deferredSkillCommands,
                skills: preserveClearedSessionCommands ? current.skills : deferredSkills
              }));
              if (canPreheatPrimaryWorkspace && !(acpStatusResult.status === "fulfilled" && ((_a2 = acpStatusResult.value) == null ? void 0 : _a2.channelLive) === true) && !workspaceAcpPreheatInFlightRef.current) {
                workspaceAcpPreheatInFlightRef.current = true;
                void (async () => {
                  try {
                    const preheat = await client.workspaceAcpPreheat(5e3);
                    if (disposed || abort.signal.aborted || !preheat.ready || connectionRef.current.sessionId) {
                      return;
                    }
                    const refreshed = await client.workspaceSkills();
                    if (disposed || abort.signal.aborted || connectionRef.current.sessionId) {
                      return;
                    }
                    const { commands: commands2, skills: skills2 } = mapWorkspaceSkills(refreshed);
                    setConnection(
                      (current) => current.sessionId ? current : { ...current, commands: commands2, skills: skills2 }
                    );
                  } catch (error) {
                    console.warn(
                      "[DaemonSessionProvider] ACP preheat for workspace skills failed:",
                      error
                    );
                  } finally {
                    workspaceAcpPreheatInFlightRef.current = false;
                  }
                })();
              }
              return;
            }
            const targetSessionId = restoreSessionId ?? reconnectSessionId;
            const requestClientId = legacyClientIdDependency ? clientIdRef.current : getStableClientId(void 0, targetSessionId);
            const legacyClientRebind = targetSessionId !== void 0 && targetSessionId === connectionRef.current.sessionId && connectionRef.current.clientId !== void 0 && requestClientId !== connectionRef.current.clientId;
            const restoreMethod = restoreSessionId && restoreMode === "resume" && !legacyClientRebind ? DaemonSessionClient.resume : DaemonSessionClient.load;
            loadingRequestedSession = Boolean(restoreSessionId);
            if (targetSessionId && !preservingTranscriptDuringLoad) {
              setConnection((current) => ({
                ...current,
                sessionId: targetSessionId,
                error: void 0,
                errorStatus: void 0,
                missingSession: false,
                loadingTranscript: true
              }));
            }
            const attemptedLoad = ((_b = pendingSessionLoadRef.current) == null ? void 0 : _b.sessionId) === targetSessionId ? pendingSessionLoadRef.current : void 0;
            const restoreRequestTimeoutMs = (attemptedLoad == null ? void 0 : attemptedLoad.requestTimeoutMs) ?? resolveSessionRestoreTimeouts(capabilities).requestTimeoutMs;
            const nextSession = restoreSessionId ? await restoreMethod(
              client,
              restoreSessionId,
              {
                workspaceCwd: effectWorkspaceCwd,
                timeoutMs: restoreRequestTimeoutMs,
                ...restoreMethod === DaemonSessionClient.load && subagentTranscriptModeRef.current === "summary" ? { liveReplayMode: "summary" } : {},
                ...historyPaginationSupported && restoreMode === "load" && (attemptedLoad == null ? void 0 : attemptedLoad.replaySource) !== "memory" && historyPageSizeRef.current !== void 0 ? { historyPageSize: historyPageSizeRef.current } : {}
              },
              requestClientId
            ) : reconnectSessionId ? await DaemonSessionClient.load(
              client,
              reconnectSessionId,
              {
                workspaceCwd: effectWorkspaceCwd,
                timeoutMs: restoreRequestTimeoutMs,
                ...subagentTranscriptModeRef.current === "summary" ? { liveReplayMode: "summary" } : {},
                ...historyPaginationSupported && historyPageSizeRef.current !== void 0 ? { historyPageSize: historyPageSizeRef.current } : {}
              },
              requestClientId
            ) : await DaemonSessionClient.createOrAttach(
              client,
              {
                ...modelServiceId !== void 0 ? { modelServiceId } : {},
                ...shouldCreateFreshSession ? { sessionScope: "thread" } : sessionScope !== void 0 ? { sessionScope } : {},
                workspaceCwd: effectWorkspaceCwd
              },
              requestClientId
            );
            loadingRequestedSession = false;
            if (!legacyClientIdDependency && nextSession.clientId) {
              clientIdRef.current = nextSession.clientId;
              persistStableClientId(
                nextSession.clientId,
                nextSession.sessionId
              );
            }
            if (disposed || abort.signal.aborted) {
              void detachDaemonClient({
                baseUrl: resolvedBaseUrl,
                token: resolvedToken,
                sessionId: nextSession.sessionId,
                clientId: nextSession.clientId
              }).catch(
                (err) => console.warn("[DaemonSessionProvider] detach failed:", err)
              );
              return;
            }
            if (preservingTranscriptDuringLoad && (attemptedLoad == null ? void 0 : attemptedLoad.sessionId) === nextSession.sessionId && (((_c = attemptedLoad.signal) == null ? void 0 : _c.aborted) || pendingSessionLoadRef.current !== attemptedLoad)) {
              const previousSession = sessionRef.current;
              if (nextSession !== previousSession) {
                await nextSession.detach().catch((error) => {
                  console.warn(
                    "[DaemonSessionProvider] detach cancelled reload failed:",
                    error
                  );
                });
              }
              if (pendingSessionLoadRef.current === attemptedLoad) {
                pendingSessionLoadRef.current = void 0;
                if (attemptedLoad.timeout !== void 0) {
                  clearTimeout(attemptedLoad.timeout);
                }
                attemptedLoad.reject(
                  new DOMException("Session load cancelled", "AbortError")
                );
              }
              if (skipNextCleanupDetachSessionRef.current === previousSession) {
                skipNextCleanupDetachSessionRef.current = void 0;
              }
              loadingRequestedSession = false;
              if ((previousSession == null ? void 0 : previousSession.sessionId) === nextSession.sessionId) {
                session = previousSession;
                reconnectSessionId = previousSession.sessionId;
                reconnectAttempt = 0;
                skipMetadataRefresh = true;
                continue;
              }
              return;
            }
            if ((attemptedLoad == null ? void 0 : attemptedLoad.replaySource) === "memory") {
              const episode = liveJournalRepairRef.current;
              const freshReplayEvents = [
                ...nextSession.replaySnapshot.compactedReplay,
                ...nextSession.replaySnapshot.liveJournal
              ];
              const suffix = episode ? findLiveJournalRepairSuffix(
                freshReplayEvents,
                episode.target.promptId
              ) : void 0;
              if (!episode || episode.sessionId !== nextSession.sessionId || nextSession.replayDegraded === true || !suffix) {
                const previousSession = sessionRef.current;
                if (nextSession !== previousSession) {
                  await nextSession.detach().catch((error) => {
                    console.warn(
                      "[DaemonSessionProvider] detach rejected repair load failed:",
                      error
                    );
                  });
                }
                if (pendingSessionLoadRef.current === attemptedLoad) {
                  pendingSessionLoadRef.current = void 0;
                  if (attemptedLoad.timeout !== void 0) {
                    clearTimeout(attemptedLoad.timeout);
                  }
                  attemptedLoad.reject(
                    new Error(
                      nextSession.replayDegraded === true ? "Fresh replay is degraded" : "Fresh replay does not contain the complete target turn"
                    )
                  );
                }
                if (skipNextCleanupDetachSessionRef.current === previousSession) {
                  skipNextCleanupDetachSessionRef.current = void 0;
                }
                if ((previousSession == null ? void 0 : previousSession.sessionId) === nextSession.sessionId) {
                  session = previousSession;
                  reconnectSessionId = previousSession.sessionId;
                  reconnectAttempt = 0;
                  skipMetadataRefresh = true;
                  continue;
                }
                return;
              }
              repairingEpisode = episode;
              repairSuffix = suffix;
            }
            const previousSessionId = lastSessionIdRef.current;
            if (previousSessionId !== nextSession.sessionId) {
              clearNotices();
            }
            if (previousSessionId !== void 0 && nextSession.sessionId !== previousSessionId) {
              setPromptStatus("idle");
              clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
              needsStoreReset = true;
            } else if (previousSessionId !== void 0) {
              const replaySnapshotEventCount = nextSession.replaySnapshot.compactedReplay.length + nextSession.replaySnapshot.liveJournal.length;
              if (replaySnapshotEventCount > 0) {
                setPromptStatus("idle");
                clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
                needsStoreReset = true;
              } else {
                store.dispatch({
                  type: "assistant.done",
                  reason: "reconnected"
                });
                if (store.getSnapshot().awaitingResync) {
                  store.clearAwaitingResync();
                }
              }
            }
            isSameSessionReconnect = previousSessionId !== void 0 && previousSessionId === nextSession.sessionId;
            shouldInjectReplaySnapshot = nextSession.replaySnapshot.compactedReplay.length > 0 || nextSession.replaySnapshot.liveJournal.length > 0;
            const replayEvents2 = [
              ...nextSession.replaySnapshot.compactedReplay,
              ...nextSession.replaySnapshot.liveJournal
            ];
            replayTokenUsage = getReplayTokenUsage(replayEvents2);
            replayTokenCount = getTokenCountFromUsage(replayTokenUsage);
            session = nextSession;
            reconnectSessionId = session.sessionId;
            shouldCreateFreshSession = false;
            lastSessionIdRef.current = session.sessionId;
            sessionRef.current = session;
          }
          const activeSession = session;
          runnerSession = activeSession;
          const restoredActivePromptSettled = settledRestoredActivePromptSessionsRef.current.has(activeSession);
          let restoredActivePrompt = activeSession.hasActivePrompt === true && !restoredActivePromptSettled;
          const settleRestoredActivePrompt = () => {
            settledRestoredActivePromptSessionsRef.current.add(activeSession);
            restoredActivePrompt = false;
          };
          const hasSessionActivePrompt = () => restoredActivePrompt || activePromptsRef.current.has(activeSession.sessionId) || activePromptsRef.current.has(`${activeSession.sessionId}:shell`);
          hasCurrentSessionActivePrompt = hasSessionActivePrompt;
          hasCurrentSessionActivePromptRef.current = hasSessionActivePrompt;
          setPromptStatus(hasSessionActivePrompt() ? "streaming" : "idle");
          const pendingLoad = pendingSessionLoadRef.current;
          const pendingLoadToResolve = (pendingLoad == null ? void 0 : pendingLoad.sessionId) === activeSession.sessionId ? pendingLoad : void 0;
          const { compactedReplay, liveJournal } = activeSession.replaySnapshot;
          const replayEvents = [...compactedReplay, ...liveJournal];
          const markerStillVisible = (repairingEpisode == null ? void 0 : repairingEpisode.markerBlockId) !== void 0 && store.getSnapshot().blocks.some(
            (block) => block.id === (repairingEpisode == null ? void 0 : repairingEpisode.markerBlockId)
          );
          const firstPersistedRecordId = replayEvents.filter((e) => e.type === "session_update").map(getPersistedReplayRecordId).find((recordId) => recordId !== void 0) ?? replayEvents.filter((e) => e.type === "history_truncated").map(getPersistedReplayRecordId).find((recordId) => recordId !== void 0) ?? activeSession.historyAnchorRecordId;
          const replayHistoryWasTruncated = replayEvents.some(
            hasFullTranscriptBeforeReplay
          );
          const historyHasMore = repairingEpisode ? transcriptHistoryRef.current.hasMore : Array.isArray(capabilities == null ? void 0 : capabilities.features) && capabilities.features.includes(
            SESSION_TRANSCRIPT_PAGINATION_FEATURE
          ) && (activeSession.historyHasMore || replayHistoryWasTruncated) && firstPersistedRecordId !== void 0;
          const replayInjected = shouldInjectReplaySnapshot && replayEvents.length > 0;
          if (!repairingEpisode && (replayInjected || transcriptHistoryRef.current.sessionId !== activeSession.sessionId)) {
            transcriptHistoryRef.current = {
              sessionId: activeSession.sessionId,
              ...firstPersistedRecordId !== void 0 ? { beforeRecordId: firstPersistedRecordId } : {},
              hasMore: historyHasMore,
              loading: false,
              capacityReached: false,
              paginationError: false
            };
            setTranscriptHistoryState({
              hasMore: historyHasMore,
              loading: false,
              capacityReached: false,
              paginationError: false
            });
          } else if (repairingEpisode && !markerStillVisible && firstPersistedRecordId !== void 0) {
            transcriptHistoryRef.current.beforeRecordId = firstPersistedRecordId;
            transcriptHistoryRef.current.cursor = void 0;
          }
          if (needsStoreReset && !replayInjected) {
            store.reset();
          }
          if (replayInjected) {
            const replayOpts = {
              ...eventOptionsRef.current,
              suppressOwnUserEcho: false
            };
            const sourceEvents = repairingEpisode && repairSuffix && markerStillVisible ? repairSuffix.events : replayEvents;
            const replayTarget = findLiveJournalRepairTarget(
              activeSession.sessionId,
              liveJournal,
              activeSession.lastEventId,
              activeSession.replayDegraded
            );
            const markerIndex = replayTarget ? sourceEvents.indexOf(replayTarget.marker) : -1;
            const eventGroups = [];
            for (const replayEvent of sourceEvents) {
              const isNewRepairEvent = repairingEpisode !== void 0 && replayEvent.id !== void 0 && !repairingEpisode.observedSnapshotEventIds.has(
                replayEvent.id
              ) && !(replayEvent.id > repairingEpisode.snapshotLastEventId && replayEvent.id <= repairingEpisode.lastObservedEventId);
              try {
                const replayUiEvents = normalizeAndFilterEvent(
                  replayEvent,
                  activeSession.clientId,
                  replayOpts,
                  setConnection,
                  {
                    updateConnection: repairingEpisode !== void 0 && isNewRepairEvent,
                    suppressLog: repairingEpisode !== void 0 && !isNewRepairEvent
                  }
                );
                const transcriptEvents = filterDaemonUiEventsForTranscript(
                  replayEvent,
                  replayUiEvents,
                  addNotice,
                  dismissNotice,
                  {
                    hideHistoryTruncation: historyHasMore,
                    suppressSideEffects: repairingEpisode !== void 0 && !isNewRepairEvent
                  }
                );
                const projectedEvents = subagentTranscriptModeRef.current === "summary" ? projectMainTranscriptEvents(transcriptEvents) : transcriptEvents;
                const groupEvents = [...projectedEvents];
                if (replayEvent.type === "turn_complete") {
                  const stopReason = ((_d = replayEvent.data) == null ? void 0 : _d.stopReason) ?? "end_turn";
                  groupEvents.push(
                    assistantDoneFromTurnEvent(replayEvent, stopReason)
                  );
                } else if (replayEvent.type === "turn_error") {
                  groupEvents.push(
                    assistantDoneFromTurnEvent(replayEvent, "error")
                  );
                }
                eventGroups.push({
                  transcript: groupEvents,
                  sideEffects: repairingEpisode === void 0 ? projectedEvents : isNewRepairEvent ? replayUiEvents : []
                });
                if (isNewRepairEvent) {
                  const followupSuggestion = parseSidechannelFollowupSuggestion(replayEvent);
                  if (followupSuggestion) {
                    publishSidechannelFollowupSuggestion(followupSuggestion);
                  }
                  const midTurnInjected = parseSidechannelMidTurnInjected(replayEvent);
                  if (midTurnInjected) {
                    publishSidechannelMidTurnInjected(midTurnInjected);
                  }
                  if (isPendingPromptEvent(replayEvent)) {
                    publishPendingPromptEvent(replayEvent);
                  }
                }
              } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (repairingEpisode === void 0 || isNewRepairEvent) {
                  addNotice({
                    severity: "warning",
                    category: "protocol",
                    operation: "normalize_event",
                    code: "daemon.replay_event_malformed",
                    message: "Skipped malformed replay event",
                    debugMessage: message,
                    recoverable: true
                  });
                  console.warn(
                    "[DaemonSessionProvider] skipped malformed replay event:",
                    error
                  );
                }
                eventGroups.push({ transcript: [], sideEffects: [] });
              }
            }
            const allUiEvents = eventGroups.flatMap(
              (group) => group.transcript
            );
            let replayExceededCapacity = false;
            let replayTrimmed = false;
            let replayTrimmedAnchor;
            const rebuildReplay = repairingEpisode !== void 0 || replayTarget !== void 0 || needsStoreReset || store.getSnapshot().blocks.length === 0;
            if (rebuildReplay) {
              const replayMaxBlocks = repairingEpisode && markerStillVisible ? repairingEpisode.checkpoint.maxBlocks : maxBlocks;
              const observeReplayTrim = (detail) => {
                if (detail.kind === "blocks" && detail.evictedOldest !== false)
                  replayTrimmed = true;
              };
              const replayStore = createDaemonTranscriptStore(
                repairingEpisode && markerStillVisible ? {
                  ...repairingEpisode.checkpoint,
                  maxBlocks: replayMaxBlocks,
                  onTruncation: observeReplayTrim
                } : {
                  maxBlocks: replayMaxBlocks,
                  retainSubagentBlocks: subagentTranscriptModeRef.current === "full",
                  // Rebuild under the same byte budget as the live store
                  // so an oversized replay is trimmed to the same ceiling.
                  ...maxRetainedBytes !== void 0 ? { maxRetainedBytes } : {},
                  // The count cap and the default byte budget can both
                  // evict mid-rebuild; observe either so the pagination
                  // anchor and capacity indicator reconcile below.
                  onTruncation: observeReplayTrim
                }
              );
              let nextCheckpoint;
              if (markerIndex < 0 && repairingEpisode === void 0) {
                replayStore.dispatch(allUiEvents);
              } else {
                for (const [index, group] of eventGroups.entries()) {
                  if (index === markerIndex) {
                    nextCheckpoint = replayStore.getSnapshot();
                  }
                  replayStore.dispatch(group.transcript);
                }
              }
              const replayState = replayStore.getSnapshot();
              replayExceededCapacity = replayTrimmed || replayState.blocks.length >= replayMaxBlocks;
              if (replayExceededCapacity) {
                replayTrimmedAnchor = (_f = (_e = replayState.blocks.find(
                  (block) => {
                    var _a3;
                    return (((_a3 = block.sourceRecordIds) == null ? void 0 : _a3.length) ?? 0) > 0;
                  }
                )) == null ? void 0 : _e.sourceRecordIds) == null ? void 0 : _f[0];
              }
              const committedMaxBlocks = replayMaxBlocks;
              store.reset({
                ...replayState,
                maxBlocks: committedMaxBlocks
              });
              if (replayTarget && nextCheckpoint) {
                const markerBlock = store.getSnapshot().blocks.find(
                  (block) => block.kind === "status" && block.source === "history_truncated" && isRecord(block.data) && block.data["scope"] === "live_journal"
                );
                const existingRepair = liveJournalRepairRef.current;
                liveJournalRepairRef.current = (existingRepair == null ? void 0 : existingRepair.target.signature) === replayTarget.signature && existingRepair.attempted ? existingRepair : {
                  sessionId: activeSession.sessionId,
                  target: replayTarget,
                  checkpoint: {
                    ...nextCheckpoint,
                    maxBlocks: committedMaxBlocks
                  },
                  ...markerBlock ? { markerBlockId: markerBlock.id } : {},
                  observedSnapshotEventIds: new Set(
                    liveJournal.flatMap(
                      (event) => event.id === void 0 ? [] : [event.id]
                    )
                  ),
                  snapshotLastEventId: activeSession.lastEventId ?? 0,
                  lastObservedEventId: activeSession.lastEventId ?? 0,
                  terminalSeen: false,
                  attempted: false
                };
              } else if (repairingEpisode) {
                liveJournalRepairRef.current = void 0;
              }
            } else if (allUiEvents.length > 0) {
              store.dispatch(allUiEvents);
            }
            const sideEffectEvents = eventGroups.flatMap(
              (group) => group.sideEffects
            );
            if (sideEffectEvents.length > 0) {
              bumpWorkspaceEventSignals(
                sideEffectEvents,
                setWorkspaceEventSignals,
                activeSession.workspaceCwd
              );
            }
            if (replayExceededCapacity) {
              if (replayTrimmed) {
                if (replayTrimmedAnchor !== void 0) {
                  transcriptHistoryRef.current.beforeRecordId = replayTrimmedAnchor;
                } else {
                  transcriptHistoryRef.current.beforeRecordId = void 0;
                }
                transcriptHistoryRef.current.cursor = void 0;
              }
              const postRebuild = store.getSnapshot();
              const olderHistoryReachable = Array.isArray(capabilities == null ? void 0 : capabilities.features) && capabilities.features.includes(
                SESSION_TRANSCRIPT_PAGINATION_FEATURE
              ) && transcriptHistoryRef.current.beforeRecordId !== void 0 && postRebuild.retainedBytes < postRebuild.maxRetainedBytes;
              transcriptHistoryRef.current.hasMore = olderHistoryReachable;
              transcriptHistoryRef.current.capacityReached = true;
              setTranscriptHistoryState({
                hasMore: olderHistoryReachable,
                loading: false,
                capacityReached: true,
                paginationError: false
              });
            }
            for (const replayEvent of replayEvents) {
              settleActivePromptFromTurnEvent(
                activePromptsRef.current,
                settledPromptsRef.current,
                activeSession.sessionId,
                replayEvent,
                store,
                setPromptStatus,
                passiveAssistantDoneTimerRef,
                { requireBoundPromptId: true }
              );
            }
            setConnection((c) => ({ ...c, catchingUp: void 0 }));
            activeSession.consumeReplaySnapshot();
          }
          setConnection((current) => ({
            ...current,
            status: "connected",
            sessionId: activeSession.sessionId,
            ...activeSession.clientId ? { clientId: activeSession.clientId } : {},
            workspaceCwd: activeSession.workspaceCwd,
            displayName: getSessionDisplayName(activeSession.state) ?? (current.sessionId === activeSession.sessionId ? current.displayName : void 0),
            tokenUsage: replayTokenUsage !== void 0 ? replayTokenUsage : current.sessionId === activeSession.sessionId ? current.tokenUsage : void 0,
            tokenCount: replayTokenCount !== void 0 ? replayTokenCount : current.sessionId === activeSession.sessionId ? current.tokenCount ?? 0 : 0,
            goalState: current.sessionId === activeSession.sessionId ? current.goalState : void 0,
            loadingTranscript: void 0,
            catchingUp: replayInjected ? current.catchingUp : isSameSessionReconnect || activeSession.lastEventId != null || void 0
          }));
          if (pendingLoadToResolve) {
            lastHandledSessionIdRef.current = activeSession.sessionId;
            lastHandledWorkspaceRef.current = activeSession.workspaceCwd;
            lastHandledClientIdRef.current = void 0;
            pendingSessionLoadRef.current = void 0;
            if (pendingLoadToResolve.timeout !== void 0) {
              clearTimeout(pendingLoadToResolve.timeout);
            }
            if (skipNextCleanupDetachSessionRef.current === activeSession) {
              skipNextCleanupDetachSessionRef.current = void 0;
            }
            pendingLoadToResolve.resolve();
          }
          const canReuseSessionMetadata = skipMetadataRefreshThisIteration || attachedExistingSession && connectionRef.current.commands !== void 0 && connectionRef.current.skills !== void 0 && connectionRef.current.supportedCommands !== void 0 && connectionRef.current.context !== void 0;
          const configGeneration = sessionConfigGenerationRef.current.get(activeSession) ?? 0;
          const goalStateAtLoadStart = connectionRef.current.sessionId === activeSession.sessionId ? connectionRef.current.goalState : void 0;
          const gitPromise = skipMetadataRefreshThisIteration ? Promise.resolve({ branch: connectionRef.current.gitBranch }) : activeSession.workspaceCwd ? client.workspaceByCwd(activeSession.workspaceCwd).workspaceGit() : client.workspaceGit();
          const metadataPromise = Promise.allSettled([
            canReuseSessionMetadata ? Promise.resolve(void 0) : client.workspaceProviders(),
            canReuseSessionMetadata ? Promise.resolve(void 0) : activeSession.supportedCommands(),
            canReuseSessionMetadata ? Promise.resolve(void 0) : activeSession.context(),
            gitPromise
          ]);
          const goalPromise = activeSession.goal().then(
            (response) => response.snapshot,
            () => void 0
          ).then((goalState2) => {
            if (disposed || abort.signal.aborted || sessionRef.current !== activeSession) {
              return goalState2;
            }
            setConnection((current) => {
              var _a3;
              if (sessionRef.current !== activeSession || current.sessionId !== activeSession.sessionId) {
                return current;
              }
              if (!goalState2 && goalStateAtLoadStart !== void 0) {
                return current;
              }
              return {
                ...current,
                goalState: goalState2 ? selectGoalStateFromRead(
                  current.goalState,
                  goalState2,
                  (_a3 = goalStateAtLoadStart == null ? void 0 : goalStateAtLoadStart.goal) == null ? void 0 : _a3.goalId
                ) : current.goalState ?? {
                  v: 2,
                  goal: null,
                  activity: "idle"
                }
              };
            });
            return goalState2;
          });
          const [
            [providerResult, commandResult, contextResult, gitResult],
            goalState
          ] = await Promise.all([metadataPromise, goalPromise]);
          if (disposed || abort.signal.aborted || sessionRef.current !== activeSession) {
            return;
          }
          const providers = (providerResult == null ? void 0 : providerResult.status) === "fulfilled" ? providerResult.value : void 0;
          const supportedCommands = (commandResult == null ? void 0 : commandResult.status) === "fulfilled" ? commandResult.value : void 0;
          const context = (contextResult == null ? void 0 : contextResult.status) === "fulfilled" ? contextResult.value : void 0;
          const gitBranch = (gitResult == null ? void 0 : gitResult.status) === "fulfilled" ? gitResult.value.branch ?? void 0 : void 0;
          const goalStateFallback = goalState === void 0 && goalStateAtLoadStart === void 0 ? { v: 2, goal: null, activity: "idle" } : void 0;
          const loadWarningTexts = [
            (providerResult == null ? void 0 : providerResult.status) === "rejected" ? (_g = loadWarningsRef.current) == null ? void 0 : _g.models : void 0,
            (commandResult == null ? void 0 : commandResult.status) === "rejected" ? (_h = loadWarningsRef.current) == null ? void 0 : _h.commands : void 0,
            (contextResult == null ? void 0 : contextResult.status) === "rejected" ? (_i = loadWarningsRef.current) == null ? void 0 : _i.context : void 0
          ].filter((warning) => Boolean(warning));
          const providerModelStatus = mapProviderStatus(providers);
          const contextModelStatus = mapSessionContextModels(context);
          const sessionModels = contextModelStatus && contextModelStatus.models.length > 0 ? contextModelStatus.models : providerModelStatus.models;
          const sessionCurrentModel = (contextModelStatus == null ? void 0 : contextModelStatus.currentModel) ?? providerModelStatus.currentModel;
          const providerContextWindow = sessionCurrentModel === providerModelStatus.currentModel ? providerModelStatus.contextWindow : (_j = providerModelStatus.models.find(
            (model) => model.id === sessionCurrentModel
          )) == null ? void 0 : _j.contextWindow;
          const sessionContextWindow = (contextModelStatus == null ? void 0 : contextModelStatus.contextWindow) ?? ((_k = sessionModels.find((model) => model.id === sessionCurrentModel)) == null ? void 0 : _k.contextWindow) ?? providerContextWindow;
          const { commands, skills } = mapSupportedCommands(supportedCommands);
          const currentMode = getCurrentMode(context) ?? providerModelStatus.currentMode;
          setConnection((current) => {
            var _a3, _b2;
            if (abort.signal.aborted || sessionRef.current !== void 0 && sessionRef.current !== activeSession || current.sessionId !== activeSession.sessionId) {
              return current;
            }
            const configSnapshotCurrent = configGeneration % 2 === 0 && (sessionConfigGenerationRef.current.get(activeSession) ?? 0) === configGeneration;
            return {
              ...current,
              status: "connected",
              sessionId: activeSession.sessionId,
              // Surface the bound client id for consumers of legacy
              // originator-stamped frames.
              ...activeSession.clientId ? { clientId: activeSession.clientId } : {},
              workspaceCwd: activeSession.workspaceCwd,
              // A fulfilled supported-commands fetch is authoritative even when
              // it returns an empty list: fall back to the preserved
              // `current.commands` only when the fetch was skipped or failed
              // (supportedCommands === undefined). Keying on length instead
              // would let a genuinely-empty snapshot leave a stale command list
              // in place (see getConnectionAfterSessionClear, which now
              // preserves commands across a clear).
              commands: supportedCommands !== void 0 ? commands : current.commands,
              skills: supportedCommands !== void 0 ? skills : current.skills,
              models: sessionModels.length > 0 ? sessionModels : current.models,
              currentModel: configSnapshotCurrent ? sessionCurrentModel ?? current.currentModel : current.currentModel,
              currentMode: currentMode ?? current.currentMode,
              reasoning: configSnapshotCurrent && context !== void 0 ? mapSessionContextReasoning(
                context,
                (_a3 = current.reasoning) == null ? void 0 : _a3.effort
              ) : current.reasoning,
              displayName: getSessionDisplayName(activeSession.state) ?? current.displayName,
              contextWindow: configSnapshotCurrent ? sessionContextWindow ?? current.contextWindow : current.contextWindow,
              providers: providers ?? current.providers,
              supportedCommands: supportedCommands ?? current.supportedCommands,
              context: configSnapshotCurrent ? context ?? current.context : current.context,
              // Reconcile rather than reference-compare: the load response and
              // any frame that arrived during the load window share a revision
              // domain, and routing through `selectGoalState` is what registers
              // the cleared-goal tombstone that keeps a later stale frame from
              // resurrecting a cleared goal. The read is stamped with the goal
              // observed when it was issued (`goalStateAtLoadStart`) — a create
              // that lands inside the load window must not be wiped, and
              // tombstoned, by a bare-null answer that predates it.
              goalState: goalState ? selectGoalStateFromRead(
                current.goalState,
                goalState,
                (_b2 = goalStateAtLoadStart == null ? void 0 : goalStateAtLoadStart.goal) == null ? void 0 : _b2.goalId
              ) : current.goalState ?? goalStateFallback,
              gitBranch: gitResult.status === "fulfilled" ? gitBranch : current.gitBranch,
              capabilities: capabilities ?? current.capabilities,
              loadingTranscript: void 0,
              catchingUp: (
                // Replay already injected above — keep the cleared flag rather
                // than re-arming it (nothing before SSE would clear it again).
                replayInjected ? current.catchingUp : isSameSessionReconnect || activeSession.lastEventId != null || void 0
              )
            };
          });
          if (loadWarningTexts.length > 0) {
            const existingWarningTexts = repairingEpisode ? new Set(
              store.getSnapshot().blocks.flatMap(
                (block) => block.kind === "status" ? [block.text] : []
              )
            ) : void 0;
            const warningEvents = loadWarningTexts.filter((text) => !(existingWarningTexts == null ? void 0 : existingWarningTexts.has(text))).map((text) => ({
              type: "status",
              text
            }));
            if (warningEvents.length > 0) {
              store.dispatch(warningEvents);
            }
            const repair = liveJournalRepairRef.current;
            if (warningEvents.length > 0 && (repair == null ? void 0 : repair.sessionId) === activeSession.sessionId) {
              const checkpointStore = createDaemonTranscriptStore({
                ...repair.checkpoint,
                maxBlocks: repair.checkpoint.maxBlocks
              });
              checkpointStore.dispatch(warningEvents);
              repair.checkpoint = checkpointStore.getSnapshot();
            }
          }
          let sawEvent = false;
          let resyncRequested = false;
          const requestEpochResetReload = () => {
            const active = activePromptsRef.current.get(
              activeSession.sessionId
            );
            active == null ? void 0 : active.controller.abort();
            activePromptsRef.current.delete(activeSession.sessionId);
            if (restoredActivePrompt) {
              settleRestoredActivePrompt();
            }
            clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
            setPromptStatus("idle");
            clearPendingTranscriptEvents();
            store.reset();
            activeSession.setLastEventId(0);
            reconnectSessionId = activeSession.sessionId;
            resyncRequested = true;
            nextSseConnectReason = "state_resync";
            session = void 0;
            sessionRef.current = void 0;
            hasCurrentSessionActivePromptRef.current = () => false;
            setConnection((current) => ({
              ...current,
              status: "connecting",
              error: void 0,
              errorStatus: resolveConnectionErrorStatus(
                void 0,
                current.errorStatus
              )
            }));
          };
          const eventStreamController = new AbortController();
          eventStream = {
            sessionId: activeSession.sessionId,
            controller: eventStreamController,
            restartRequested: false
          };
          eventStreamRef.current = eventStream;
          const abortEventStream = () => eventStreamController.abort(abort.signal.reason);
          abort.signal.addEventListener("abort", abortEventStream, {
            once: true
          });
          removeProviderAbortListener = () => abort.signal.removeEventListener("abort", abortEventStream);
          const sseConnectReason = nextSseConnectReason;
          nextSseConnectReason = void 0;
          for await (const event of activeSession.events({
            signal: eventStreamController.signal,
            maxQueued,
            ...sseConnectReason ? { sseConnectReason } : {}
          })) {
            if (sessionRef.current !== activeSession) {
              break;
            }
            if (!sawEvent) {
              sawEvent = true;
              reconnectAttempt = 0;
            }
            const currentRepair = liveJournalRepairRef.current;
            if ((currentRepair == null ? void 0 : currentRepair.sessionId) === activeSession.sessionId && event.id !== void 0) {
              currentRepair.lastObservedEventId = Math.max(
                currentRepair.lastObservedEventId,
                event.id
              );
            }
            try {
              const followupSuggestion = parseSidechannelFollowupSuggestion(event);
              if (followupSuggestion) {
                publishSidechannelFollowupSuggestion(followupSuggestion);
                continue;
              }
              const midTurnInjected = parseSidechannelMidTurnInjected(event);
              if (midTurnInjected) {
                publishSidechannelMidTurnInjected(midTurnInjected);
                if (sessionRef.current !== activeSession) break;
              }
              if (isPendingPromptEvent(event)) {
                publishPendingPromptEvent(event);
                if (sessionRef.current !== activeSession) break;
                if (event.type === "pending_prompt_started") {
                  clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
                  setPromptStatus("waiting");
                }
              }
              const normalizedUiEvents = normalizeAndFilterEvent(
                event,
                activeSession.clientId,
                eventOptionsRef.current,
                (update) => {
                  if (sessionRef.current !== activeSession) return;
                  setConnectionSynchronous(update);
                }
              );
              const uiEvents = filterDaemonUiEventsForTranscript(
                event,
                normalizedUiEvents,
                addNotice,
                dismissNotice
              );
              const transcriptUiEvents = subagentTranscriptModeRef.current === "summary" ? projectMainTranscriptEvents(uiEvents) : uiEvents;
              if (event.type === "state_resync_required") {
                const reason = typeof event.data === "object" && event.data !== null ? event.data.reason : void 0;
                if (reason === "epoch_reset") {
                  requestEpochResetReload();
                  break;
                }
              }
              bumpWorkspaceEventSignals(
                uiEvents,
                setWorkspaceEventSignals,
                activeSession.workspaceCwd
              );
              if (uiEvents.length > 0) {
                const hasGenerationSignal = hasActiveGenerationSignal(uiEvents);
                setPromptStatus(
                  (current) => current === "waiting" || current === "idle" && hasGenerationSignal ? "streaming" : current
                );
              }
              if (event.type === "turn_complete" || event.type === "turn_error") {
                flushTranscriptSync();
              }
              const activePromptSettled = settleActivePromptFromTurnEvent(
                activePromptsRef.current,
                settledPromptsRef.current,
                activeSession.sessionId,
                event,
                store,
                setPromptStatus,
                passiveAssistantDoneTimerRef
              );
              let restoredPromptSettled = false;
              if (!activePromptSettled && restoredActivePrompt && (event.type === "turn_complete" || event.type === "turn_error")) {
                settleRestoredActivePrompt();
                restoredPromptSettled = true;
                clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
                const stopReason = event.type === "turn_complete" ? ((_l = event.data) == null ? void 0 : _l.stopReason) ?? "end_turn" : "error";
                dispatchTranscriptNow(
                  assistantDoneFromTurnEvent(event, stopReason)
                );
                if (!hasSessionActivePrompt()) {
                  setPromptStatus("idle");
                }
              }
              const hasBlockPathDebugEvent = uiEvents.some(
                (e) => e.type === "debug" && !isUnrecognizedDiagnosticReason(e.debugReason)
              );
              if (!hasSessionActivePrompt() && hasBlockPathDebugEvent) {
                flushTranscriptSync();
              }
              const shouldGuardAssistant = !hasSessionActivePrompt() && store.getSnapshot().activeAssistantBlockId != null;
              const eventsToDispatch = shouldGuardAssistant ? transcriptUiEvents.filter(
                (e) => e.type !== "debug" || isUnrecognizedDiagnosticReason(e.debugReason)
              ) : transcriptUiEvents;
              enqueueTranscriptEvents(eventsToDispatch);
              for (const uiEvent of uiEvents) {
                if (uiEvent.type === "prompt.cancelled" && (restoredActivePrompt || uiEvent.originatorClientId !== activeSession.clientId)) {
                  dispatchTranscriptNow(
                    assistantDoneFromTurnEvent(event, "cancelled")
                  );
                  const cancellingRestoredPrompt = restoredActivePrompt;
                  settleRestoredActivePrompt();
                  restoredPromptSettled = true;
                  clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
                  if (!cancellingRestoredPrompt) {
                    activePromptsRef.current.delete(activeSession.sessionId);
                  }
                  if (!hasSessionActivePrompt()) {
                    setPromptStatus("idle");
                  }
                } else if (uiEvent.type === "session.replay_complete") {
                  flushTranscriptSync();
                  setConnection((c) => ({ ...c, catchingUp: void 0 }));
                  if (store.getSnapshot().awaitingResync) {
                    store.clearAwaitingResync();
                  }
                  if (!hasSessionActivePrompt()) {
                    clearPassiveAssistantDoneTimer(
                      passiveAssistantDoneTimerRef
                    );
                    dispatchTranscriptNow({
                      type: "assistant.done",
                      reason: "replay_complete"
                    });
                    setPromptStatus("idle");
                  }
                }
              }
              const isObserver = !activePromptSettled && !restoredPromptSettled && !hasSessionActivePrompt();
              if (isObserver) {
                const hasUserMsg = uiEvents.some(
                  (e) => e.type === "user.text.delta"
                );
                if (hasUserMsg) {
                  setPromptStatus("waiting");
                } else if (hasActiveGenerationSignal(uiEvents)) {
                  setPromptStatus(
                    (current) => current === "idle" ? "streaming" : current
                  );
                }
              }
              if (isObserver && event.type === "turn_complete") {
                clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
                const stopReason = ((_m = event.data) == null ? void 0 : _m.stopReason) ?? "end_turn";
                dispatchTranscriptNow(
                  assistantDoneFromTurnEvent(event, stopReason)
                );
                setPromptStatus("idle");
              } else if (isObserver && event.type === "turn_error") {
                clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
                dispatchTranscriptNow(
                  assistantDoneFromTurnEvent(event, "error")
                );
                setPromptStatus("idle");
              } else if (isObserver && hasActiveGenerationSignal(uiEvents)) {
                schedulePassiveAssistantDone(
                  store,
                  passiveAssistantDoneTimerRef,
                  "passive_observer",
                  3e3,
                  () => setPromptStatus("idle")
                );
              }
              const pendingRepair = liveJournalRepairRef.current;
              if ((pendingRepair == null ? void 0 : pendingRepair.sessionId) === activeSession.sessionId && (event.type === "turn_complete" || event.type === "turn_error") && eventPromptId(event) === pendingRepair.target.promptId) {
                pendingRepair.terminalSeen = true;
                queueMicrotask(tryLiveJournalRepair);
              } else if (pendingRepair == null ? void 0 : pendingRepair.terminalSeen) {
                queueMicrotask(tryLiveJournalRepair);
              }
              if (event.type === "state_resync_required") {
                const reason = typeof event.data === "object" && event.data !== null ? event.data.reason : void 0;
                if (reason !== "epoch_reset") {
                  if (!hasSessionActivePrompt()) {
                    setPromptStatus("idle");
                    clearPassiveAssistantDoneTimer(
                      passiveAssistantDoneTimerRef
                    );
                  }
                  clearPendingTranscriptEvents();
                  store.reset();
                  console.warn(
                    "[DaemonSessionProvider] ring eviction detected, reloading session (sessionId=%s)",
                    activeSession.sessionId
                  );
                  resyncRequested = true;
                  nextSseConnectReason = "state_resync";
                  session = void 0;
                  sessionRef.current = void 0;
                  hasCurrentSessionActivePromptRef.current = () => false;
                  setConnection((current) => ({
                    ...current,
                    status: "connecting",
                    error: void 0,
                    errorStatus: resolveConnectionErrorStatus(
                      void 0,
                      current.errorStatus
                    )
                  }));
                  break;
                }
              }
              if (event.type === "session_closed" && ((_n = event.data) == null ? void 0 : _n.reason) === "client_close") {
                userDeletedSession = true;
                const closedSessionId = activeSession.sessionId;
                const active = activePromptsRef.current.get(closedSessionId);
                active == null ? void 0 : active.controller.abort();
                activePromptsRef.current.delete(closedSessionId);
                session = void 0;
                sessionRef.current = void 0;
                break;
              }
            } catch (error) {
              if (sessionRef.current !== activeSession) break;
              const message = error instanceof Error ? error.message : String(error);
              addNotice({
                severity: "warning",
                category: "protocol",
                operation: "normalize_event",
                code: "daemon.event_malformed",
                message: "Skipped malformed daemon event",
                debugMessage: message,
                recoverable: true
              });
              console.warn(
                "[DaemonSessionProvider] skipped malformed daemon event:",
                error
              );
            }
          }
          if (sessionRef.current !== activeSession && !resyncRequested && !userDeletedSession) {
            clearPendingTranscriptEvents();
            clearEventStream();
            return;
          }
          flushTranscriptSync();
          const restartRequested = eventStream.restartRequested;
          clearEventStream();
          if (restartRequested) {
            nextSseConnectReason = "prompt_restart";
            reconnectAttempt = 0;
            skipMetadataRefresh = true;
            continue;
          }
          if (userDeletedSession) {
            dispatchTranscriptNow({
              type: "assistant.done",
              reason: "cancelled"
            });
            setPromptStatus("idle");
            clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
            setConnection((current) => ({
              ...current,
              status: "disconnected",
              sessionId: void 0,
              context: void 0,
              reasoning: void 0,
              models: getWorkspaceModelsAfterSessionClear(current),
              goalState: void 0,
              error: void 0,
              errorStatus: void 0,
              missingSession: false
            }));
            return;
          }
          if (manualSessionClearRef.current) {
            session = void 0;
            sessionRef.current = void 0;
            hasCurrentSessionActivePromptRef.current = () => false;
            return;
          }
          if (!disposed && !abort.signal.aborted && !resyncRequested) {
            nextSseConnectReason = "stream_end";
            if (sessionRef.current === activeSession) {
              console.debug("[DaemonSessionProvider] SSE stream ended");
              if (!hasSessionActivePrompt()) {
                clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
                setPromptStatus("idle");
                dispatchTranscriptNow({
                  type: "assistant.done",
                  reason: "stream_ended"
                });
              }
            }
            setConnection((current) => ({
              ...current,
              status: current.status === "error" ? "error" : "disconnected",
              error: current.status === "error" ? current.error : void 0,
              errorStatus: resolveConnectionErrorStatus(
                void 0,
                current.errorStatus
              )
            }));
          }
        } catch (error) {
          const restartRequested = (eventStream == null ? void 0 : eventStream.restartRequested) === true;
          clearEventStream();
          if (session && sessionRef.current !== session) {
            clearPendingTranscriptEvents();
            return;
          }
          if (restartRequested && !disposed && !abort.signal.aborted) {
            flushTranscriptSync();
            nextSseConnectReason = "prompt_restart";
            reconnectAttempt = 0;
            skipMetadataRefresh = true;
            continue;
          }
          if (disposed || abort.signal.aborted) return;
          flushTranscriptSync();
          const message = error instanceof Error ? error.message : String(error);
          const errorStatus = extractHttpStatus(error);
          const pendingLoad = pendingSessionLoadRef.current;
          const restoreRetryDelayMs = getRestoreInProgressRetryDelayMs(error);
          const pendingLoadMatches = pendingLoad === void 0 || pendingLoad.sessionId === restoreSessionId;
          if (autoReconnect && loadingRequestedSession && (restoreRetryDelayMs !== void 0 && pendingLoadMatches || (pendingLoad == null ? void 0 : pendingLoad.sessionId) === restoreSessionId && isClosingSessionLoadError(
            error,
            !(capabilities == null ? void 0 : capabilities.features.includes(CLIENT_IDENTITY_FEATURE))
          ))) {
            reconnectAttempt += 1;
            const reconnectConfig2 = reconnectConfigRef.current;
            await delay(
              restoreRetryDelayMs ?? getReconnectDelayMs(
                reconnectAttempt,
                reconnectConfig2.reconnectDelayMs,
                reconnectConfig2.maxReconnectDelayMs
              ),
              abort.signal
            );
            if (pendingLoad !== void 0 && pendingSessionLoadRef.current !== pendingLoad) {
              return;
            }
            continue;
          }
          const failedSessionId = session == null ? void 0 : session.sessionId;
          const isAuthFailure = isAuthFailureHttpError(error);
          const isTerminal = isTerminalSessionHttpError(error);
          if (failedSessionId && (isAuthFailure || isTerminal)) {
            const active = activePromptsRef.current.get(failedSessionId);
            active == null ? void 0 : active.controller.abort();
            activePromptsRef.current.delete(failedSessionId);
          }
          if (isAuthFailure || isTerminal || !hasCurrentSessionActivePrompt()) {
            clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
            setPromptStatus("idle");
          }
          if (pendingLoad && (pendingLoad.sessionId === restoreSessionId || pendingLoad.sessionId === reconnectSessionId)) {
            if (((_o = skipNextCleanupDetachSessionRef.current) == null ? void 0 : _o.sessionId) === pendingLoad.sessionId) {
              skipNextCleanupDetachSessionRef.current = void 0;
            }
            pendingSessionLoadRef.current = void 0;
            if (pendingLoad.timeout !== void 0) {
              clearTimeout(pendingLoad.timeout);
            }
            pendingLoad.reject(error);
          }
          if (isAuthFailure || isTerminal) {
            session = void 0;
            sessionRef.current = void 0;
            if (isAuthFailure) {
              setConnection((current) => ({
                ...current,
                status: "error",
                sessionId: void 0,
                context: void 0,
                reasoning: void 0,
                models: getWorkspaceModelsAfterSessionClear(current),
                goalState: void 0,
                error: message,
                errorStatus: resolveConnectionErrorStatus(
                  errorStatus,
                  current.errorStatus
                ),
                missingSession: false,
                capabilities: capabilities ?? current.capabilities,
                loadingTranscript: void 0,
                catchingUp: void 0
              }));
              return;
            }
            const missingLoadedSession = loadingRequestedSession && isMissingSessionHttpStatus(errorStatus);
            console.warn(
              "[DaemonSessionProvider] terminal session error (sessionId=%s, status=%d, message=%s)",
              failedSessionId,
              errorStatus,
              message
            );
            setConnection((current) => ({
              ...current,
              status: "disconnected",
              sessionId: void 0,
              context: void 0,
              reasoning: void 0,
              models: getWorkspaceModelsAfterSessionClear(current),
              goalState: void 0,
              error: message,
              errorStatus: resolveConnectionErrorStatus(
                errorStatus,
                current.errorStatus
              ),
              // SSE errors should not create the missing-session empty state,
              // but they also must not clear one confirmed by load/heartbeat.
              missingSession: missingLoadedSession || current.missingSession === true,
              capabilities: capabilities ?? current.capabilities,
              loadingTranscript: void 0,
              catchingUp: void 0
            }));
            return;
          } else if (preservingTranscriptDuringLoad && session === void 0 && (pendingLoad == null ? void 0 : pendingLoad.sessionId) === restoreSessionId && ((_p = sessionRef.current) == null ? void 0 : _p.sessionId) === restoreSessionId) {
            session = sessionRef.current;
            reconnectSessionId = session.sessionId;
            reconnectAttempt = 0;
            skipMetadataRefresh = true;
            continue;
          } else if (isRestoreInProgressLoadError(error)) {
            setConnection((current) => ({
              ...current,
              status: "error",
              error: message,
              errorStatus: resolveConnectionErrorStatus(
                errorStatus,
                current.errorStatus
              ),
              missingSession: false,
              loadingTranscript: void 0,
              catchingUp: void 0
            }));
            return;
          } else {
            console.debug(
              "[DaemonSessionProvider] retriable SSE error, preserving session for delta resume (sessionId=%s)",
              session == null ? void 0 : session.sessionId
            );
            if (eventStream) {
              nextSseConnectReason = "transport_error";
            }
          }
          if (!autoReconnect) {
            session = void 0;
            sessionRef.current = void 0;
            setConnection((current) => ({
              ...current,
              status: "error",
              error: message,
              errorStatus: resolveConnectionErrorStatus(
                errorStatus,
                current.errorStatus
              ),
              missingSession: false
            }));
            return;
          }
          setConnection((current) => ({
            ...current,
            status: "disconnected",
            errorStatus: resolveConnectionErrorStatus(
              errorStatus,
              current.errorStatus
            ),
            missingSession: false,
            loadingTranscript: void 0
          }));
        }
        if (!autoReconnect) {
          sessionRef.current = void 0;
          setConnection((current) => ({
            ...current,
            status: "disconnected",
            loadingTranscript: void 0,
            catchingUp: void 0
          }));
          return;
        }
        reconnectAttempt += 1;
        const reconnectConfig = reconnectConfigRef.current;
        const delayMs = getReconnectDelayMs(
          reconnectAttempt,
          reconnectConfig.reconnectDelayMs,
          reconnectConfig.maxReconnectDelayMs
        );
        setConnection((current) => ({
          ...current,
          status: "disconnected",
          error: void 0
        }));
        (_q = reconnectAbortRef.current) == null ? void 0 : _q.abort();
        const reconnectAbort = new AbortController();
        reconnectAbortRef.current = reconnectAbort;
        const onEffectAbort = () => reconnectAbort.abort();
        abort.signal.addEventListener("abort", onEffectAbort, { once: true });
        await delay(delayMs, reconnectAbort.signal);
        abort.signal.removeEventListener("abort", onEffectAbort);
      }
    };
    void run();
    return () => {
      const session = runnerSession;
      disposed = true;
      abort.abort();
      const ownsCurrentSession = session !== void 0 && sessionRef.current === session;
      const ownsEmptyState = session === void 0 && sessionRef.current === void 0;
      const keepSessionForNextEffect = ownsCurrentSession && session === skipNextCleanupDetachSessionRef.current;
      const isUnmounting = !mountedRef.current;
      if (ownsCurrentSession || ownsEmptyState) {
        flushTranscriptSync();
      } else {
        clearPendingTranscriptEvents();
      }
      if (ownsCurrentSession && (!keepSessionForNextEffect || isUnmounting)) {
        hasCurrentSessionActivePromptRef.current = () => false;
        setPromptStatus("idle");
        clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
      }
      if (effectPendingSessionLoad !== void 0 && pendingSessionLoadRef.current === effectPendingSessionLoad && (ownsCurrentSession || ownsEmptyState) && (!keepSessionForNextEffect || isUnmounting)) {
        if (pendingSessionLoadRef.current.timeout !== void 0) {
          clearTimeout(pendingSessionLoadRef.current.timeout);
        }
        pendingSessionLoadRef.current.reject(
          new DOMException("Session load interrupted by cleanup", "AbortError")
        );
        pendingSessionLoadRef.current = void 0;
      }
      if (ownsCurrentSession && (!keepSessionForNextEffect || isUnmounting) && session.clientId) {
        void detachDaemonClient({
          baseUrl: resolvedBaseUrl,
          token: resolvedToken,
          sessionId: session.sessionId,
          clientId: session.clientId
        }).catch(
          (err) => console.warn("[DaemonSessionProvider] detach failed:", err)
        );
      }
      if (ownsCurrentSession && (!keepSessionForNextEffect || isUnmounting)) {
        sessionRef.current = void 0;
      }
    };
  }, [
    autoConnect,
    autoReconnect,
    resolvedBaseUrl,
    resolvedToken,
    sessionEffectWorkspaceCwd,
    modelServiceId,
    sessionScope,
    maxQueued,
    maxBlocks,
    maxRetainedBytes,
    store,
    restoreSessionId,
    restoreWorkspaceCwd,
    restoreMode,
    restoreSessionNonce,
    attachSessionNonce,
    newSessionNonce,
    legacyClientIdDependency,
    shouldDeferInitialSessionCreation,
    clearNotices,
    addNotice,
    dismissNotice,
    setConnectionSynchronous
  ]);
  useEffect(() => {
    if (!heartbeatSupportedRef.current || connection.status !== "connected" || heartbeatIntervalMs <= 0 || heartbeatFailureThreshold <= 0 || !connection.sessionId) {
      return void 0;
    }
    let disposed = false;
    const timer = setInterval(() => {
      const session = sessionRef.current;
      if (!session) return;
      if (heartbeatFailureStateRef.current.session !== session) {
        heartbeatFailureStateRef.current = {
          session,
          consecutiveFailures: 0
        };
      }
      const heartbeatFailureState = heartbeatFailureStateRef.current;
      session.heartbeat().then(() => {
        if (disposed || sessionRef.current !== session || heartbeatFailureStateRef.current !== heartbeatFailureState) {
          return;
        }
        if (heartbeatFailureState.consecutiveFailures >= heartbeatFailureThreshold) {
          setConnection(
            (current) => current.sessionId === session.sessionId ? {
              ...current,
              status: "connected",
              error: void 0,
              errorStatus: void 0
            } : current
          );
        }
        heartbeatFailureState.consecutiveFailures = 0;
        heartbeatFailureState.lastHttpError = void 0;
      }).catch((error) => {
        var _a, _b, _c, _d;
        if (disposed || sessionRef.current !== session || heartbeatFailureStateRef.current !== heartbeatFailureState) {
          return;
        }
        heartbeatFailureState.consecutiveFailures += 1;
        const message = error instanceof Error ? error.message : "Session heartbeat failed";
        const thisErrorStatus = extractHttpStatus(error);
        if (thisErrorStatus !== void 0) {
          const lastStatus = (_a = heartbeatFailureState.lastHttpError) == null ? void 0 : _a.status;
          heartbeatFailureState.lastHttpError = {
            status: resolveConnectionErrorStatus(thisErrorStatus, lastStatus) ?? thisErrorStatus,
            message: isMissingSessionHttpStatus(lastStatus) ? ((_b = heartbeatFailureState.lastHttpError) == null ? void 0 : _b.message) ?? message : message
          };
        }
        if (heartbeatFailureState.consecutiveFailures < heartbeatFailureThreshold) {
          return;
        }
        const errorStatus = (_c = heartbeatFailureState.lastHttpError) == null ? void 0 : _c.status;
        const effectiveMessage = ((_d = heartbeatFailureState.lastHttpError) == null ? void 0 : _d.message) ?? message;
        const authFailure = errorStatus !== void 0 && AUTH_FAILURE_HTTP_STATUSES.has(errorStatus);
        const missingSession = isMissingSessionHttpStatus(errorStatus);
        if (authFailure || missingSession) {
          const deadSessionId = session.sessionId;
          if (missingSession) {
            console.warn(
              "[DaemonSessionProvider] heartbeat detected missing session (sessionId=%s, status=%d)",
              deadSessionId,
              errorStatus
            );
          } else {
            console.warn(
              "[DaemonSessionProvider] heartbeat auth failure (sessionId=%s, status=%d)",
              deadSessionId,
              errorStatus
            );
          }
          const active = activePromptsRef.current.get(deadSessionId);
          active == null ? void 0 : active.controller.abort();
          activePromptsRef.current.delete(deadSessionId);
          clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
          setPromptStatus("idle");
          if (sessionRef.current === session) {
            if (missingSession) {
              manualSessionClearRef.current = true;
            }
            sessionRef.current = void 0;
          }
        }
        setConnection(
          (current) => current.sessionId === session.sessionId ? {
            ...current,
            status: authFailure ? "error" : "disconnected",
            error: effectiveMessage,
            errorStatus: resolveConnectionErrorStatus(
              errorStatus,
              current.errorStatus
            ),
            missingSession,
            ...authFailure || missingSession ? {
              sessionId: void 0,
              context: void 0,
              reasoning: void 0,
              models: getWorkspaceModelsAfterSessionClear(current),
              goalState: void 0,
              loadingTranscript: void 0,
              catchingUp: void 0
            } : {}
          } : current
        );
      });
    }, heartbeatIntervalMs);
    return () => {
      disposed = true;
      clearInterval(timer);
    };
  }, [
    connection.sessionId,
    connection.status,
    heartbeatFailureThreshold,
    heartbeatIntervalMs
  ]);
  const actions = useMemo(
    () => createDaemonSessionActions({
      store,
      sessionRef,
      activePromptsRef,
      settledPromptsRef,
      pendingSessionLoadRef,
      pendingSessionLoadIdRef,
      sessionConfigGeneration: sessionConfigGenerationRef.current,
      heartbeatSupportedRef,
      manualSessionClearRef,
      skipNextCleanupDetachSessionRef,
      passiveAssistantDoneTimerRef,
      hasSessionActivePrompt: () => hasCurrentSessionActivePromptRef.current(),
      resetCurrentSessionActivePrompt: () => {
        hasCurrentSessionActivePromptRef.current = () => false;
      },
      restartEventStream: (sessionId2) => {
        var _a, _b;
        const eventStream = eventStreamRef.current;
        if ((eventStream == null ? void 0 : eventStream.sessionId) === sessionId2) {
          if (!restartEventStreamOnPrompt) return;
          eventStream.restartRequested = true;
          eventStream.controller.abort();
          return;
        }
        if (((_a = sessionRef.current) == null ? void 0 : _a.sessionId) === sessionId2) {
          (_b = reconnectAbortRef.current) == null ? void 0 : _b.abort();
        }
      },
      getCreateSessionRequest: () => {
        var _a;
        return {
          ...createSessionRequestRef.current,
          sessionScope: "thread",
          workspaceCwd: activeWorkspaceCwdRef.current ?? ((_a = sessionRef.current) == null ? void 0 : _a.workspaceCwd)
        };
      },
      createDetachedSession: (workspaceCwd2, overrides) => {
        var _a;
        const client = workspaceClientRef.current ?? new DaemonClient({
          baseUrl: resolvedBaseUrl,
          token: resolvedToken
        });
        const request = {
          ...createSessionRequestRef.current,
          sessionScope: "thread",
          workspaceCwd: workspaceCwd2 ?? activeWorkspaceCwdRef.current ?? ((_a = sessionRef.current) == null ? void 0 : _a.workspaceCwd),
          ...(overrides == null ? void 0 : overrides.approvalMode) !== void 0 ? { approvalMode: overrides.approvalMode } : {},
          ...(overrides == null ? void 0 : overrides.sourceType) !== void 0 ? { sourceType: overrides.sourceType } : {},
          ...(overrides == null ? void 0 : overrides.worktree) !== void 0 ? { worktree: overrides.worktree } : {},
          ...(overrides == null ? void 0 : overrides.branch) !== void 0 ? { branch: overrides.branch } : {}
        };
        const requestClientId = clientId ? clientIdRef.current : getStableClientId(void 0);
        return DaemonSessionClient.createOrAttach(
          client,
          request,
          requestClientId
        );
      },
      getConnection: () => connectionRef.current,
      addNotice,
      setConnection,
      setPromptStatus: (update) => {
        setPromptStatus(update);
      },
      setRestoreSessionId,
      setRestoreWorkspaceCwd,
      setRestoreMode,
      setRestoreSessionNonce,
      setAttachSessionNonce,
      setNewSessionNonce,
      clearLiveJournalRepair: () => {
        var _a, _b;
        (_b = (_a = liveJournalRepairRef.current) == null ? void 0 : _a.controller) == null ? void 0 : _b.abort();
        liveJournalRepairRef.current = void 0;
      }
    }),
    [
      addNotice,
      clientId,
      resolvedBaseUrl,
      resolvedToken,
      restartEventStreamOnPrompt,
      store
    ]
  );
  repairReloadRef.current = actions.reloadSession;
  useEffect(() => {
    if (promptStatus !== "idle") return;
    queueMicrotask(() => {
      var _a;
      return (_a = tryLiveJournalRepairRef.current) == null ? void 0 : _a.call(tryLiveJournalRepairRef);
    });
  }, [promptStatus]);
  const loadMoreTranscript = useCallback(
    async (options) => {
      var _a;
      const history = transcriptHistoryRef.current;
      const activeSession = sessionRef.current;
      if (history.loading || !activeSession || activeSession.sessionId !== history.sessionId) {
        return;
      }
      if (history.paginationError) {
        if ((options == null ? void 0 : options.force) !== true) {
          return;
        }
        if (history.beforeRecordId === void 0 && history.cursor === void 0) {
          return;
        }
        history.paginationError = false;
        history.hasMore = true;
      } else if (!history.hasMore) {
        return;
      }
      history.loading = true;
      setTranscriptHistoryState({
        hasMore: true,
        loading: true,
        capacityReached: false,
        paginationError: false
      });
      const fetchPaginationGeneration = paginationGenerationRef.current;
      let terminalFailure = false;
      try {
        const page = await activeSession.getTranscriptPage({
          ...history.cursor !== void 0 ? { cursor: history.cursor } : history.beforeRecordId !== void 0 ? { beforeRecordId: history.beforeRecordId } : {},
          limit: historyPageSizeRef.current ?? 100,
          clientId: activeSession.clientId
        });
        if (sessionRef.current !== activeSession || transcriptHistoryRef.current !== history) {
          return;
        }
        if (paginationGenerationRef.current !== fetchPaginationGeneration) {
          history.loading = false;
          setTranscriptHistoryState({
            hasMore: history.hasMore,
            loading: false,
            capacityReached: history.capacityReached,
            paginationError: history.paginationError
          });
          return;
        }
        if (page.partial || page.replayError) {
          terminalFailure = true;
          throw new Error(
            page.replayError ?? "Earlier session history was only partially read"
          );
        }
        const replayOpts = {
          ...eventOptionsRef.current,
          suppressOwnUserEcho: false
        };
        const nextBeforeRecordId = page.events.map(getPersistedReplayRecordId).find((recordId) => recordId !== void 0);
        const uiEvents = [];
        for (const replayEvent of page.events) {
          try {
            const transcriptEvents = filterDaemonUiEventsForTranscript(
              replayEvent,
              normalizeAndFilterEvent(
                replayEvent,
                activeSession.clientId,
                replayOpts,
                setConnection,
                { updateConnection: false }
              ),
              addNotice,
              dismissNotice
            );
            uiEvents.push(
              ...subagentTranscriptModeRef.current === "summary" ? projectMainTranscriptEvents(transcriptEvents) : transcriptEvents
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            addNotice({
              severity: "warning",
              category: "protocol",
              operation: "normalize_event",
              code: "daemon.replay_event_malformed",
              message: "Skipped malformed history event",
              debugMessage: message,
              recoverable: true
            });
            console.warn(
              "[DaemonSessionProvider] skipped malformed history event:",
              error
            );
          }
        }
        const admission = uiEvents.length > 0 ? materializeTranscriptHistory(
          store.getSnapshot(),
          uiEvents,
          maxBlocks
        ) : void 0;
        if (admission && !admission.admitted) {
          if (admission.impossible) {
            history.rejectedPage = void 0;
            terminalFailure = true;
            throw new Error(
              "Earlier history page exceeds the transcript retention window"
            );
          }
          history.hasMore = false;
          history.loading = false;
          history.capacityReached = true;
          history.rejectedPage = {
            blocks: admission.pageBlocks,
            bytes: admission.pageBytes
          };
          setTranscriptHistoryState({
            hasMore: false,
            loading: false,
            capacityReached: true,
            paginationError: false
          });
          return;
        }
        const historyMaterialization = (admission == null ? void 0 : admission.admitted) ? admission.materialization : void 0;
        if (historyMaterialization) {
          history.rejectedPage = void 0;
          store.reset(
            applyTranscriptHistory(store.getSnapshot(), historyMaterialization)
          );
          const repair = liveJournalRepairRef.current;
          if ((repair == null ? void 0 : repair.sessionId) === activeSession.sessionId) {
            repair.checkpoint = applyTranscriptHistory(
              repair.checkpoint,
              historyMaterialization
            );
          }
        }
        const hasCapacity = store.getSnapshot().blocks.length < maxBlocks;
        history.capacityReached = page.hasMore && !hasCapacity;
        history.cursor = nextBeforeRecordId === void 0 ? page.nextCursor : void 0;
        history.beforeRecordId = nextBeforeRecordId;
        history.hasMore = page.hasMore && hasCapacity;
        history.loading = false;
        setTranscriptHistoryState({
          hasMore: history.hasMore,
          loading: false,
          capacityReached: history.capacityReached,
          paginationError: false
        });
      } catch (error) {
        if (sessionRef.current !== activeSession || transcriptHistoryRef.current !== history) {
          return;
        }
        if (paginationGenerationRef.current !== fetchPaginationGeneration) {
          history.loading = false;
          setTranscriptHistoryState({
            hasMore: history.hasMore,
            loading: false,
            capacityReached: history.capacityReached,
            paginationError: history.paginationError
          });
          return;
        }
        const retryable = !terminalFailure && (!(error instanceof DaemonHttpError) || error.status >= 500 || error.status === 408 || error.status === 429);
        history.hasMore = retryable;
        history.loading = false;
        history.capacityReached = false;
        history.paginationError = !retryable;
        setTranscriptHistoryState({
          hasMore: retryable,
          loading: false,
          capacityReached: false,
          paginationError: !retryable
        });
        if (retryable) {
          addNotice({
            severity: "warning",
            category: "user_action",
            operation: "load_session",
            code: "daemon.transcript_history.failed",
            message: "Failed to load earlier session history",
            debugMessage: error instanceof Error ? error.message : String(error),
            recoverable: retryable
          });
        }
        throw error;
      } finally {
        (_a = tryLiveJournalRepairRef.current) == null ? void 0 : _a.call(tryLiveJournalRepairRef);
      }
    },
    [addNotice, dismissNotice, maxBlocks, store]
  );
  const transcriptHistoryValue = useMemo(() => {
    var _a;
    const active = connection.sessionId === transcriptHistoryRef.current.sessionId && ((_a = sessionRef.current) == null ? void 0 : _a.sessionId) === transcriptHistoryRef.current.sessionId;
    return {
      hasMore: active && transcriptHistoryState.hasMore,
      loading: active && transcriptHistoryState.loading,
      capacityReached: active && transcriptHistoryState.capacityReached,
      paginationError: active && transcriptHistoryState.paginationError,
      loadMore: loadMoreTranscript
    };
  }, [connection.sessionId, loadMoreTranscript, transcriptHistoryState]);
  const lastHandledSessionIdRef = useRef(UNHANDLED_SESSION);
  const lastHandledWorkspaceRef = useRef(void 0);
  const lastHandledClientIdRef = useRef(void 0);
  useEffect(() => {
    const targetWorkspaceCwd = resolvedWorkspaceCwd ?? // A failed controlled load leaves the target's workspace on the
    // connection for error rendering; never feed it back into the next
    // workspace-less switch.
    (connectionRef.current.error ? void 0 : connectionRef.current.workspaceCwd);
    if (lastHandledSessionIdRef.current === sessionId && normalizeWorkspaceIdentity(lastHandledWorkspaceRef.current) === normalizeWorkspaceIdentity(targetWorkspaceCwd) && lastHandledClientIdRef.current === clientId) {
      return;
    }
    lastHandledSessionIdRef.current = sessionId;
    lastHandledWorkspaceRef.current = targetWorkspaceCwd;
    lastHandledClientIdRef.current = clientId;
    const currentSessionId = connectionRef.current.sessionId;
    const currentWorkspaceCwd = connectionRef.current.workspaceCwd;
    if (sessionId === currentSessionId && normalizeWorkspaceIdentity(targetWorkspaceCwd) === normalizeWorkspaceIdentity(currentWorkspaceCwd)) {
      return;
    }
    const request = sessionId ? actions.loadSession(sessionId, {
      ...targetWorkspaceCwd !== void 0 ? { workspaceCwd: targetWorkspaceCwd } : {}
    }) : currentSessionId ? actions.clearSession() : void 0;
    if (!request) return;
    void request.catch((error) => {
      console.warn(
        "[DaemonSessionProvider] controlled session transition failed:",
        error
      );
    });
  }, [actions, clientId, resolvedWorkspaceCwd, sessionId]);
  const ownerGuardValue = useMemo(
    () => ({
      capture: () => {
        const session = sessionRef.current;
        return { isCurrent: () => sessionRef.current === session };
      }
    }),
    []
  );
  return /* @__PURE__ */ jsx(DaemonStoreContext.Provider, { value: store, children: /* @__PURE__ */ jsx(DaemonConnectionContext.Provider, { value: connection, children: /* @__PURE__ */ jsx(DaemonPromptStatusContext.Provider, { value: promptStatus, children: /* @__PURE__ */ jsx(DaemonSessionNoticesContext.Provider, { value: noticesValue, children: /* @__PURE__ */ jsx(
    DaemonWorkspaceEventSignalsContext.Provider,
    {
      value: workspaceEventSignals,
      children: /* @__PURE__ */ jsx(DaemonActionsContext.Provider, { value: actions, children: /* @__PURE__ */ jsx(
        DaemonSessionOwnerGuardContext.Provider,
        {
          value: ownerGuardValue,
          children: /* @__PURE__ */ jsx(
            DaemonTranscriptHistoryContext.Provider,
            {
              value: transcriptHistoryValue,
              children
            }
          )
        }
      ) })
    }
  ) }) }) }) });
}
function settleActivePromptFromTurnEvent(activePrompts, settledPrompts, sessionId, event, store, setPromptStatus, passiveAssistantDoneTimerRef, opts = {}) {
  var _a;
  if (event.type !== "turn_complete" && event.type !== "turn_error") {
    return false;
  }
  const promptId = (_a = event.data) == null ? void 0 : _a.promptId;
  if (!promptId) return false;
  const active = activePrompts.get(sessionId);
  if (!active) return false;
  if (opts.requireBoundPromptId && active.promptId === void 0) {
    return false;
  }
  if (active.promptId !== void 0 && active.promptId !== promptId) {
    return false;
  }
  clearPassiveAssistantDoneTimer(passiveAssistantDoneTimerRef);
  try {
    const result = matchTurnEvent(event, promptId);
    if (!result) return false;
    store.dispatch(assistantDoneFromTurnEvent(event, result.stopReason));
    setPromptStatus("idle");
    if (active.resolve) {
      activePrompts.delete(sessionId);
      active.resolve(result);
    } else {
      activePrompts.delete(sessionId);
      settledPrompts.set(getPromptSettledKey(sessionId, promptId), {
        status: "resolved",
        result
      });
    }
  } catch (error) {
    store.dispatch(assistantDoneFromTurnEvent(event, "error"));
    setPromptStatus("idle");
    if (active.reject) {
      activePrompts.delete(sessionId);
      active.reject(error);
    } else {
      activePrompts.delete(sessionId);
      settledPrompts.set(getPromptSettledKey(sessionId, promptId), {
        status: "rejected",
        error
      });
    }
  }
  return true;
}
function isPromptLifecycleTurnEvent(event) {
  return event.type === "turn_complete";
}
function normalizeAndFilterEvent(event, clientId, opts, setConnection, behavior = {}) {
  if (!behavior.suppressLog) {
    logSettingsReloadEvent(event);
  }
  if (behavior.updateConnection !== false) {
    updateConnectionFromDaemonEvent(event, setConnection);
  }
  const normalized = normalizeDaemonEvent(event, {
    clientId,
    suppressOwnUserEcho: opts.suppressOwnUserEcho,
    includeRawEvent: opts.includeRawEvent
  });
  const goalStatusEvent = normalizeGoalStatusEvent(event);
  if (isPromptLifecycleTurnEvent(event)) {
    return goalStatusEvent ? [goalStatusEvent] : [];
  }
  return goalStatusEvent ? [...normalized, goalStatusEvent] : normalized;
}
function logSettingsReloadEvent(event) {
  if (event.type !== "settings_reloaded") return;
  console.debug(
    "[DaemonSessionProvider] settings reloaded:",
    getSettingsReloadLogData(event)
  );
}
function getSettingsReloadLogData(event) {
  const log = {};
  if (event.id !== void 0) log["eventId"] = event.id;
  if (!isRecord(event.data)) {
    log["payload"] = "non-object";
    return log;
  }
  const env = getSettingsReloadEnvLog(event.data["env"]);
  const changedKeys = getStringArray(event.data["changedKeys"]);
  const sessionsRefreshed = getStringArray(event.data["sessionsRefreshed"]);
  const sessionsSkipped = getStringArray(event.data["sessionsSkipped"]);
  const childReloaded = event.data["childReloaded"];
  const childError = getString(event.data, "childError");
  if (env) log["env"] = env;
  if (changedKeys) log["changedKeys"] = changedKeys;
  if (typeof childReloaded === "boolean") log["childReloaded"] = childReloaded;
  if (sessionsRefreshed) log["sessionsRefreshed"] = sessionsRefreshed;
  if (sessionsSkipped) log["sessionsSkipped"] = sessionsSkipped;
  if (childError) log["childError"] = childError;
  return log;
}
function getSettingsReloadEnvLog(value) {
  if (!isRecord(value)) return void 0;
  return {
    updatedKeys: getStringArray(value["updatedKeys"]) ?? [],
    removedKeys: getStringArray(value["removedKeys"]) ?? []
  };
}
function getStringArray(value) {
  if (!Array.isArray(value)) return void 0;
  return value.filter((item) => typeof item === "string");
}
function filterDaemonUiEventsForTranscript(sourceEvent, events2, addNotice, dismissNotice, behavior = {}) {
  if (behavior.hideHistoryTruncation && isHistoricalReplayMarker(sourceEvent)) {
    return [];
  }
  if (!behavior.suppressSideEffects && sourceEvent.type === "session_snapshot" && isRecord(sourceEvent.data) && sourceEvent.data["recordingDegraded"] === false) {
    const sessionId = getString(sourceEvent.data, "sessionId");
    if (sessionId) {
      dismissNotice(`daemon.session_recording_degraded:${sessionId}`);
    }
  }
  const filtered = [];
  for (const event of events2) {
    if (event.type !== "error") {
      filtered.push(event);
      continue;
    }
    if (sourceEvent.type === "turn_error") {
      filtered.push(event);
      continue;
    }
    if (behavior.suppressSideEffects) continue;
    const notice = addNotice(
      daemonErrorEventToNotice(sourceEvent, event)
    );
    if (notice.category === "protocol" || notice.category === "connection") {
      console.warn("[DaemonSessionProvider] daemon notice:", notice);
    }
  }
  return filtered;
}
function daemonErrorEventToNotice(sourceEvent, event) {
  const base = {
    message: event.text,
    debugMessage: event.text,
    recoverable: event.recoverable
  };
  switch (sourceEvent.type) {
    case "session_recording_degraded":
    case "session_snapshot": {
      const sessionId = isRecord(sourceEvent.data) ? getString(sourceEvent.data, "sessionId") : void 0;
      return {
        ...base,
        ...sessionId ? { id: `daemon.session_recording_degraded:${sessionId}` } : {},
        severity: "warning",
        category: "system",
        operation: "record_session",
        code: "daemon.session_recording_degraded"
      };
    }
    case "model_switch_failed":
      return {
        ...base,
        severity: "error",
        category: "user_action",
        operation: "switch_model",
        code: "daemon.switch_model.failed"
      };
    case "session_died":
      return {
        ...base,
        severity: "error",
        category: "connection",
        operation: "stream",
        code: event.errorKind ?? "daemon.session_died"
      };
    case "client_evicted":
      return {
        ...base,
        severity: "warning",
        category: "connection",
        operation: "stream",
        code: "daemon.client_evicted"
      };
    case "stream_error":
      return {
        ...base,
        severity: "warning",
        category: "connection",
        operation: "stream",
        code: event.errorKind ?? "daemon.stream_error"
      };
    default:
      return {
        ...base,
        severity: "warning",
        category: "protocol",
        operation: "normalize_event",
        code: event.code ?? "daemon.protocol.error"
      };
  }
}
function useDaemonSession() {
  return {
    store: useDaemonTranscriptStore(),
    connection: useDaemonConnection(),
    promptStatus: useDaemonPromptStatus(),
    actions: useDaemonActions()
  };
}
function useDaemonTranscriptStore() {
  const store = useContext(DaemonStoreContext);
  if (!store) {
    throw new Error(
      "useDaemonTranscriptStore must be used within DaemonSessionProvider"
    );
  }
  return store;
}
function useDaemonTranscriptHistory() {
  const history = useContext(DaemonTranscriptHistoryContext);
  if (!history) {
    throw new Error(
      "useDaemonTranscriptHistory must be used within DaemonSessionProvider"
    );
  }
  return history;
}
function useDaemonTranscriptState() {
  const store = useDaemonTranscriptStore();
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
}
function useDaemonTranscriptBlocks() {
  const store = useDaemonTranscriptStore();
  const getBlocks = useCallback(() => store.getSnapshot().blocks, [store]);
  return useSyncExternalStore(store.subscribe, getBlocks, getBlocks);
}
function useDaemonPendingPermissions() {
  const blocks = useDaemonTranscriptBlocks();
  return useMemo(() => selectDaemonPendingPermissions(blocks), [blocks]);
}
function useDaemonActiveTodoList() {
  const blocks = useDaemonTranscriptBlocks();
  return useMemo(() => selectDaemonActiveTodoList(blocks), [blocks]);
}
function useDaemonStreamingState() {
  const store = useDaemonTranscriptStore();
  const promptStatus = useDaemonPromptStatus();
  const getStreamingState = useCallback(
    () => selectDaemonStreamingState(store.getSnapshot().blocks, promptStatus),
    [promptStatus, store]
  );
  return useSyncExternalStore(
    store.subscribe,
    getStreamingState,
    getStreamingState
  );
}
function useDaemonActions() {
  const actions = useContext(DaemonActionsContext);
  if (!actions) {
    throw new Error(
      "useDaemonActions must be used within DaemonSessionProvider"
    );
  }
  return actions;
}
function useOptionalDaemonActions() {
  return useContext(DaemonActionsContext);
}
function useDaemonSessionOwnerGuard() {
  const guard = useContext(DaemonSessionOwnerGuardContext);
  if (!guard) {
    throw new Error(
      "useDaemonSessionOwnerGuard must be used within DaemonSessionProvider"
    );
  }
  return guard;
}
function useDaemonWorkspaceEventSignals() {
  return useContext(DaemonWorkspaceEventSignalsContext);
}
function useDaemonPromptStatus() {
  const promptStatus = useContext(DaemonPromptStatusContext);
  if (!promptStatus) {
    throw new Error(
      "useDaemonPromptStatus must be used within DaemonSessionProvider"
    );
  }
  return promptStatus;
}
function useDaemonConnection() {
  const connection = useContext(DaemonConnectionContext);
  if (!connection) {
    throw new Error(
      "useDaemonConnection must be used within DaemonSessionProvider"
    );
  }
  return connection;
}
function useDaemonSessionNotices() {
  const value = useContext(DaemonSessionNoticesContext);
  if (!value) {
    throw new Error(
      "useDaemonSessionNotices must be used within DaemonSessionProvider"
    );
  }
  return value;
}
function hasActiveGenerationSignal(events2) {
  return events2.some(
    (event) => event.type === "assistant.text.delta" || event.type === "thought.text.delta" || event.type === "tool.update"
  );
}
function normalizeGoalStatusEvent(event) {
  if (event.type !== "session_update") return null;
  const data = isRecord(event.data) ? event.data : void 0;
  const update = isRecord(data == null ? void 0 : data["update"]) ? data["update"] : isRecord(event.data) ? event.data : void 0;
  if (!update || update["sessionUpdate"] !== "agent_message_chunk") {
    return null;
  }
  const meta = update["_meta"];
  if (!isRecord(meta)) return null;
  const status = normalizeGoalStatus(meta["goalStatus"]);
  if (status) {
    return createGoalStatusUiEvent(event, status);
  }
  const terminal = normalizeGoalTerminal(meta["goalTerminal"]);
  if (terminal) {
    return createGoalStatusUiEvent(event, terminal);
  }
  const loop = meta["stopHookLoop"];
  if (!isRecord(loop)) return null;
  const goal = loop["goal"];
  if (!isRecord(goal)) return null;
  const condition = getString(goal, "condition");
  if (!condition) return null;
  return null;
}
function createGoalStatusUiEvent(event, status) {
  return {
    type: "status",
    ...event.id !== void 0 ? { eventId: event.id } : {},
    ...event.originatorClientId ? { originatorClientId: event.originatorClientId } : {},
    text: "",
    source: "goal",
    data: status
  };
}
function normalizeGoalStatus(value) {
  if (!isRecord(value)) return null;
  const kind = getString(value, "kind");
  if (kind !== "set" && kind !== "cleared" && kind !== "achieved" && kind !== "failed" && kind !== "aborted" && // Rejecting 'paused' made every surface keep showing a paused goal as
  // actively running: the card never rendered and the active-goal
  // derivation fell back to the previous 'set' card.
  kind !== "paused") {
    return null;
  }
  const condition = getString(value, "condition");
  if (!condition) return null;
  const iterations = getNumber(value, "iterations");
  const durationMs = getNumber(value, "durationMs");
  const setAt = getNumber(value, "setAt");
  const lastReason = getString(value, "lastReason");
  return {
    kind,
    condition,
    ...iterations !== void 0 ? { iterations } : {},
    ...durationMs !== void 0 ? { durationMs } : {},
    ...setAt !== void 0 ? { setAt } : {},
    ...lastReason ? { lastReason } : {}
  };
}
function normalizeGoalTerminal(value) {
  if (!isRecord(value)) return null;
  const kind = getString(value, "kind");
  if (kind !== "achieved" && kind !== "failed" && kind !== "aborted") {
    return null;
  }
  const condition = getString(value, "condition");
  if (!condition) return null;
  const iterations = getNumber(value, "iterations");
  const durationMs = getNumber(value, "durationMs");
  const lastReason = getString(value, "lastReason");
  return {
    kind,
    condition,
    ...iterations !== void 0 ? { iterations } : {},
    ...durationMs !== void 0 ? { durationMs } : {},
    ...lastReason ? { lastReason } : {}
  };
}
function getString(value, key) {
  const raw = value[key];
  return typeof raw === "string" ? raw : void 0;
}
function getNumber(value, key) {
  const raw = value[key];
  return typeof raw === "number" && Number.isFinite(raw) ? raw : void 0;
}
function bumpWorkspaceEventSignals(events2, setSignals, workspaceCwd) {
  var _a;
  let memory = 0;
  let agents = 0;
  let tools = 0;
  let settings = 0;
  const skillMutations = [];
  const seenSkillMutationIds = /* @__PURE__ */ new Set();
  let mcp = 0;
  let extensions = 0;
  let artifacts = 0;
  let lastExtensionChange;
  let init = 0;
  let auth = 0;
  for (const event of events2) {
    switch (event.type) {
      case "workspace.memory.changed":
        memory += 1;
        break;
      case "workspace.agent.changed":
        agents += 1;
        break;
      case "workspace.tool.toggled":
        tools += 1;
        break;
      case "workspace.settings.changed":
        if (((_a = event.mutation) == null ? void 0 : _a.kind) === "skill_toggle") {
          if (!seenSkillMutationIds.has(event.mutation.id)) {
            seenSkillMutationIds.add(event.mutation.id);
            skillMutations.push(event.mutation);
          }
        } else {
          settings += 1;
        }
        break;
      case "workspace.mcp.budget_warning":
      case "workspace.mcp.child_refused":
      case "workspace.mcp.server_restarted":
      case "workspace.mcp.server_restart_refused":
      case "workspace.mcp.server_changed":
        mcp += 1;
        break;
      case "workspace.extensions.changed":
        extensions += 1;
        lastExtensionChange = {
          ...event.status ? { status: event.status } : {},
          ...event.source ? { source: event.source } : {},
          ...event.name ? { name: event.name } : {},
          ...event.version ? { version: event.version } : {},
          ...event.error ? { error: event.error } : {},
          refreshed: event.refreshed,
          failed: event.failed
        };
        break;
      case "session.artifact.changed":
        artifacts += 1;
        break;
      case "workspace.initialized":
        init += 1;
        break;
      case "auth.device_flow.started":
      case "auth.device_flow.throttled":
      case "auth.device_flow.authorized":
      case "auth.device_flow.failed":
      case "auth.device_flow.cancelled":
        auth += 1;
        break;
    }
  }
  if (memory + agents + tools + settings + mcp + extensions + artifacts + init + auth === 0 && skillMutations.length === 0)
    return;
  setSignals((current) => {
    var _a2;
    const existing = ((_a2 = current.skillMutationsByCwd) == null ? void 0 : _a2[workspaceCwd]) ?? [];
    const existingIds = new Set(existing.map((mutation) => mutation.id));
    const newSkillMutations = skillMutations.filter(
      (mutation) => !existingIds.has(mutation.id)
    );
    if (memory + agents + tools + settings + mcp + extensions + artifacts + init + auth === 0 && newSkillMutations.length === 0) {
      return current;
    }
    return {
      memoryVersion: current.memoryVersion + memory,
      agentsVersion: current.agentsVersion + agents,
      toolsVersion: current.toolsVersion + tools,
      settingsVersion: current.settingsVersion + settings,
      skillsVersion: current.skillsVersion + newSkillMutations.length,
      mcpVersion: current.mcpVersion + mcp,
      extensionsVersion: current.extensionsVersion + extensions,
      artifactsVersion: current.artifactsVersion + artifacts,
      ...newSkillMutations.length > 0 ? { lastSkillMutation: newSkillMutations.at(-1) } : current.lastSkillMutation ? { lastSkillMutation: current.lastSkillMutation } : {},
      ...newSkillMutations.length > 0 ? {
        skillMutationsByCwd: {
          ...current.skillMutationsByCwd,
          [workspaceCwd]: [...existing, ...newSkillMutations]
        }
      } : current.skillMutationsByCwd ? { skillMutationsByCwd: current.skillMutationsByCwd } : {},
      ...lastExtensionChange ? { lastExtensionChange } : {},
      initVersion: current.initVersion + init,
      authVersion: current.authVersion + auth
    };
  });
}
function isTerminalSessionHttpError(error) {
  const status = extractHttpStatus(error);
  return status !== void 0 && TERMINAL_SESSION_HTTP_STATUSES.has(status);
}
function isAuthFailureHttpError(error) {
  const status = extractHttpStatus(error);
  return status !== void 0 && AUTH_FAILURE_HTTP_STATUSES.has(status);
}
function isClosingSessionLoadError(error, allowLegacyMessage = false) {
  if (!(error instanceof DaemonHttpError) || error.status !== 404) return false;
  const body = isRecord(error.body) ? error.body : void 0;
  return (body == null ? void 0 : body["code"]) === "session_closing" || allowLegacyMessage && typeof (body == null ? void 0 : body["error"]) === "string" && body["error"].endsWith(
    "The session is closing; retry after close completes"
  );
}
function isRestoreInProgressLoadError(error) {
  if (!(error instanceof DaemonHttpError) || error.status !== 409) return false;
  const body = isRecord(error.body) ? error.body : void 0;
  return (body == null ? void 0 : body["code"]) === "restore_in_progress";
}
function getRestoreInProgressRetryDelayMs(error) {
  if (!isRestoreInProgressLoadError(error)) return void 0;
  const body = isRecord(error.body) ? error.body : void 0;
  if ((body == null ? void 0 : body["retryable"]) !== true || body["reason"] === "awaiting_abandoned_cleanup") {
    return void 0;
  }
  const retryAfterSeconds = body["retryAfterSeconds"];
  return typeof retryAfterSeconds === "number" && Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? Math.min(
    Math.ceil(retryAfterSeconds * 1e3),
    RESTORE_IN_PROGRESS_RETRY_MAX_MS
  ) : 5e3;
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonResource(load, options) {
  const { autoLoad = false, enabled = true } = options;
  const [state, setState] = useState({
    data: void 0,
    loading: false,
    error: void 0
  });
  const requestSeqRef = useRef(0);
  const reload = useCallback(async () => {
    if (!enabled) return void 0;
    const seq = ++requestSeqRef.current;
    setState((current) => ({
      ...current,
      loading: true,
      error: void 0
    }));
    try {
      const data = await load();
      if (seq !== requestSeqRef.current) return void 0;
      setState({ data, loading: false, error: void 0 });
      return data;
    } catch (error) {
      if (seq !== requestSeqRef.current) return void 0;
      const normalized = error instanceof Error ? error : new Error(String(error));
      setState((current) => ({
        ...current,
        loading: false,
        error: normalized
      }));
      return void 0;
    }
  }, [enabled, load]);
  useEffect(() => {
    if (!autoLoad || !enabled) return;
    void reload();
  }, [autoLoad, enabled, reload]);
  return {
    ...state,
    reload
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useWorkspaceEventReload(version2, reload, active) {
  const hasMountedRef = useRef(false);
  useEffect(() => {
    if (version2 === void 0 || !active) return;
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    void reload();
  }, [active, reload, version2]);
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonAgents(options = {}) {
  var _a;
  const workspaceActions = useDaemonWorkspaceActions();
  const load = useCallback(
    () => workspaceActions.listAgents(),
    [workspaceActions]
  );
  const result = useDaemonResource(load, options);
  const signals = useDaemonWorkspaceEventSignals();
  useWorkspaceEventReload(
    signals == null ? void 0 : signals.agentsVersion,
    result.reload,
    options.autoLoad === true || result.data !== void 0
  );
  return {
    ...result,
    status: result.data,
    agents: ((_a = result.data) == null ? void 0 : _a.agents) ?? [],
    getAgent: workspaceActions.getAgent,
    createAgent: workspaceActions.createAgent,
    generateAgent: workspaceActions.generateAgent,
    generateContent: workspaceActions.generateContent,
    deleteAgent: workspaceActions.deleteAgent,
    updateAgent: workspaceActions.updateAgent
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonAuth(options = {}) {
  var _a, _b;
  const workspaceActions = useDaemonWorkspaceActions();
  const load = useCallback(
    () => workspaceActions.getAuthStatus(),
    [workspaceActions]
  );
  const result = useDaemonResource(load, options);
  const signals = useDaemonWorkspaceEventSignals();
  useWorkspaceEventReload(
    signals == null ? void 0 : signals.authVersion,
    result.reload,
    options.autoLoad === true || result.data !== void 0
  );
  return {
    ...result,
    status: result.data,
    providers: ((_a = result.data) == null ? void 0 : _a.providers) ?? [],
    pendingDeviceFlows: ((_b = result.data) == null ? void 0 : _b.pendingDeviceFlows) ?? [],
    startDeviceFlow: workspaceActions.startDeviceFlow,
    getDeviceFlow: workspaceActions.getDeviceFlow,
    cancelDeviceFlow: workspaceActions.cancelDeviceFlow
  };
}
/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonChannels(options = {}) {
  var _a;
  const {
    actions,
    client,
    workspaceCwd: providerWorkspaceCwd
  } = useDaemonWorkspace();
  const { workspaceCwd: requestedWorkspaceCwd, ...resourceOptions } = options;
  const workspaceCwd = requestedWorkspaceCwd ?? providerWorkspaceCwd;
  const usesProviderWorkspace = workspaceCwd === providerWorkspaceCwd;
  const workspaceClient = useMemo(
    () => workspaceCwd && !usesProviderWorkspace ? client.workspaceByCwd(workspaceCwd) : void 0,
    [client, usesProviderWorkspace, workspaceCwd]
  );
  const enabled = resourceOptions.enabled !== false && workspaceCwd !== void 0;
  const load = useCallback(async () => {
    if (!workspaceCwd) {
      throw new Error("Channel management requires a workspace.");
    }
    const data = workspaceClient ? await Promise.all([
      workspaceClient.workspaceChannelTypes(),
      workspaceClient.workspaceChannels()
    ]).then(([catalog, snapshot]) => ({ catalog, snapshot })) : await actions.loadChannels();
    return {
      ...data,
      workspaceCwd
    };
  }, [actions, workspaceClient, workspaceCwd]);
  const resource = useDaemonResource(load, {
    ...resourceOptions,
    autoLoad: false,
    enabled
  });
  const resourceReload = resource.reload;
  const requestedRef = useRef(false);
  const previousWorkspaceRef = useRef(workspaceCwd);
  const reload = useCallback(async () => {
    requestedRef.current = true;
    return resourceReload();
  }, [resourceReload]);
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  useEffect(() => {
    const workspaceChanged = previousWorkspaceRef.current !== workspaceCwd;
    if (!enabled || resourceOptions.autoLoad !== true && !(workspaceChanged && requestedRef.current)) {
      return;
    }
    previousWorkspaceRef.current = workspaceCwd;
    void reload();
  }, [enabled, reload, resourceOptions.autoLoad, workspaceCwd]);
  const mutate = useCallback(
    async (operation) => {
      const result = await operation();
      await reloadRef.current();
      return result;
    },
    []
  );
  const createOrUpdate = useCallback(
    (name, request) => mutate(
      () => workspaceClient ? workspaceClient.upsertWorkspaceChannel(name, request) : actions.upsertChannel(name, request)
    ),
    [actions, mutate, workspaceClient]
  );
  const remove = useCallback(
    (name, request) => mutate(
      () => workspaceClient ? workspaceClient.deleteWorkspaceChannel(name, request) : actions.removeChannel(name, request)
    ),
    [actions, mutate, workspaceClient]
  );
  const setStartup = useCallback(
    (name, request) => mutate(
      () => workspaceClient ? workspaceClient.setWorkspaceChannelStartup(name, request) : actions.setChannelStartup(name, request)
    ),
    [actions, mutate, workspaceClient]
  );
  const start = useCallback(
    (name) => mutate(
      () => workspaceClient ? workspaceClient.startWorkspaceChannel(name) : actions.startChannel(name)
    ),
    [actions, mutate, workspaceClient]
  );
  const stop = useCallback(
    (name) => mutate(
      () => workspaceClient ? workspaceClient.stopWorkspaceChannel(name) : actions.stopChannel(name)
    ),
    [actions, mutate, workspaceClient]
  );
  const restart = useCallback(
    (name) => mutate(
      () => workspaceClient ? workspaceClient.restartWorkspaceChannel(name) : actions.restartChannel(name)
    ),
    [actions, mutate, workspaceClient]
  );
  const current = ((_a = resource.data) == null ? void 0 : _a.workspaceCwd) === workspaceCwd ? resource.data : void 0;
  const pairing = useMemo(
    () => workspaceClient ? {
      list: (name) => workspaceClient.workspaceChannelPairingRequests(name),
      approve: (name, code) => workspaceClient.approveWorkspaceChannelPairing(name, { code }),
      approvals: (name) => workspaceClient.workspaceChannelPairingApprovals(name),
      revoke: (name, request) => workspaceClient.revokeWorkspaceChannelPairingApproval(
        name,
        request
      )
    } : actions.channelPairing,
    [actions.channelPairing, workspaceClient]
  );
  return {
    data: current ? { catalog: current.catalog, snapshot: current.snapshot } : void 0,
    loading: resource.loading,
    error: resource.error,
    reload,
    catalog: (current == null ? void 0 : current.catalog) ?? [],
    snapshot: current == null ? void 0 : current.snapshot,
    channels: (current == null ? void 0 : current.snapshot.instances) ?? {},
    createOrUpdate,
    remove,
    setStartup,
    start,
    stop,
    restart,
    pairing
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonDiagnostics(options = {}) {
  const workspaceActions = useDaemonWorkspaceActions();
  const loadEnv = useCallback(
    () => workspaceActions.loadEnv(),
    [workspaceActions]
  );
  const loadPreflight = useCallback(
    () => workspaceActions.loadPreflight(),
    [workspaceActions]
  );
  const env = useDaemonResource(loadEnv, options);
  const preflight = useDaemonResource(loadPreflight, options);
  const signals = useDaemonWorkspaceEventSignals();
  useWorkspaceEventReload(
    signals == null ? void 0 : signals.initVersion,
    env.reload,
    options.autoLoad === true || env.data !== void 0
  );
  useWorkspaceEventReload(
    signals == null ? void 0 : signals.initVersion,
    preflight.reload,
    options.autoLoad === true || preflight.data !== void 0
  );
  return { env, preflight };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonFiles() {
  const actions = useDaemonWorkspaceActions();
  return {
    glob: actions.globWorkspace,
    globWorkspace: actions.globWorkspace,
    readFileBytes: actions.readFileBytes,
    writeFile: actions.writeFile,
    editFile: actions.editFile,
    stat: actions.stat,
    listDirectory: actions.listDirectory
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonGlob() {
  const workspaceActions = useDaemonWorkspaceActions();
  return {
    globWorkspace: workspaceActions.globWorkspace
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonMcp(options = {}) {
  const workspaceActions = useDaemonWorkspaceActions();
  const load = useCallback(
    () => workspaceActions.loadMcpStatus(),
    [workspaceActions]
  );
  const result = useDaemonResource(load, options);
  const signals = useDaemonWorkspaceEventSignals();
  useWorkspaceEventReload(
    signals == null ? void 0 : signals.mcpVersion,
    result.reload,
    options.autoLoad === true || result.data !== void 0
  );
  return {
    ...result,
    status: result.data,
    initialize: workspaceActions.initializeMcp,
    reloadConfig: workspaceActions.reloadMcp,
    loadTools: workspaceActions.loadMcpTools,
    loadResources: workspaceActions.loadMcpResources,
    restartServer: workspaceActions.restartMcpServer,
    manageServer: workspaceActions.manageMcpServer,
    addServer: workspaceActions.addRuntimeMcpServer,
    removeServer: workspaceActions.removeRuntimeMcpServer
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonMemory(options = {}) {
  var _a;
  const workspaceActions = useDaemonWorkspaceActions();
  const load = useCallback(
    () => workspaceActions.loadMemoryStatus(),
    [workspaceActions]
  );
  const result = useDaemonResource(load, options);
  const signals = useDaemonWorkspaceEventSignals();
  useWorkspaceEventReload(
    signals == null ? void 0 : signals.memoryVersion,
    result.reload,
    options.autoLoad === true || result.data !== void 0
  );
  return {
    ...result,
    status: result.data,
    files: ((_a = result.data) == null ? void 0 : _a.files) ?? [],
    readFile: workspaceActions.readWorkspaceFile,
    writeMemory: workspaceActions.writeMemory
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonSessions(options = {}) {
  const {
    pageSize,
    cursor,
    archiveState,
    view,
    group,
    sourceType,
    ...resourceOptions
  } = options;
  const workspace = useDaemonWorkspace();
  const sessionActions = useOptionalDaemonActions();
  const load = useCallback(() => {
    const listOptions = {
      ...pageSize !== void 0 ? { pageSize } : {},
      ...cursor !== void 0 ? { cursor } : {},
      ...archiveState !== void 0 ? { archiveState } : {},
      ...view !== void 0 ? { view } : {},
      ...group !== void 0 ? { group } : {},
      ...sourceType !== void 0 ? { sourceType } : {}
    };
    return workspace.actions.listSessionsPage(listOptions);
  }, [
    archiveState,
    cursor,
    group,
    pageSize,
    sourceType,
    view,
    workspace.actions
  ]);
  const workspaceReady = !!workspace.workspaceCwd;
  const result = useDaemonResource(load, {
    ...resourceOptions,
    enabled: (resourceOptions.enabled ?? true) && workspaceReady
  });
  const reloadPage = result.reload;
  const reload = useCallback(async () => {
    const reloaded = await reloadPage();
    return reloaded == null ? void 0 : reloaded.sessions;
  }, [reloadPage]);
  const page = result.data;
  const sessions = (page == null ? void 0 : page.sessions) ?? [];
  const deleteSession = useCallback(
    async (sessionId) => {
      const removed = await workspace.actions.deleteSession(sessionId);
      if (removed) reload();
      return removed;
    },
    [workspace.actions, reload]
  );
  const deleteSessions = useCallback(
    async (sessionIds) => {
      const res = await workspace.actions.deleteSessions(sessionIds);
      if (res.removed.length > 0 || res.notFound.length > 0) reload();
      return res;
    },
    [workspace.actions, reload]
  );
  const exportSession = useCallback(
    (sessionId, format = "html") => workspace.actions.exportSession(sessionId, format),
    [workspace.actions]
  );
  const archiveSession = useCallback(
    async (sessionId) => {
      const archived = await workspace.actions.archiveSession(sessionId);
      if (archived) reload();
      return archived;
    },
    [workspace.actions, reload]
  );
  const unarchiveSession = useCallback(
    async (sessionId) => {
      const unarchived = await workspace.actions.unarchiveSession(sessionId);
      if (unarchived) reload();
      return unarchived;
    },
    [workspace.actions, reload]
  );
  return {
    ...result,
    data: page !== void 0 ? sessions : void 0,
    reload,
    sessions,
    nextCursor: page == null ? void 0 : page.nextCursor,
    liveMergeFailed: (page == null ? void 0 : page.liveMergeFailed) === true,
    truncated: (page == null ? void 0 : page.truncated) === true,
    loadSession: sessionActions == null ? void 0 : sessionActions.loadSession,
    resumeSession: sessionActions == null ? void 0 : sessionActions.resumeSession,
    newSession: sessionActions == null ? void 0 : sessionActions.newSession,
    releaseSession: sessionActions == null ? void 0 : sessionActions.releaseSession,
    deleteSession,
    deleteSessions,
    exportSession,
    archiveSession,
    unarchiveSession
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonSkills(options = {}) {
  var _a;
  const workspaceActions = useDaemonWorkspaceActions();
  const load = useCallback(
    () => workspaceActions.loadSkillsStatus(),
    [workspaceActions]
  );
  const result = useDaemonResource(load, options);
  return {
    ...result,
    status: result.data,
    skills: ((_a = result.data) == null ? void 0 : _a.skills) ?? [],
    setEnabled: workspaceActions.setWorkspaceSkillEnabled,
    install: workspaceActions.installWorkspaceSkill,
    remove: workspaceActions.deleteWorkspaceSkill
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonStatusReport(options = {}) {
  const { detail = "summary", ...resourceOptions } = options;
  const workspaceActions = useDaemonWorkspaceActions();
  const load = useCallback(
    () => workspaceActions.loadDaemonStatus(detail),
    [workspaceActions, detail]
  );
  const result = useDaemonResource(load, resourceOptions);
  return {
    ...result,
    report: result.data
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonUsageDashboard(options = {}) {
  const { range, heatmapDays, ...resourceOptions } = options;
  const workspaceActions = useDaemonWorkspaceActions();
  const load = useCallback(
    () => workspaceActions.loadUsageDashboard({ range, heatmapDays }),
    [workspaceActions, range, heatmapDays]
  );
  const result = useDaemonResource(load, resourceOptions);
  return {
    ...result,
    dashboard: result.data
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonTools(options = {}) {
  var _a;
  const workspaceActions = useDaemonWorkspaceActions();
  const load = useCallback(
    () => workspaceActions.loadToolsStatus(),
    [workspaceActions]
  );
  const result = useDaemonResource(load, options);
  const signals = useDaemonWorkspaceEventSignals();
  useWorkspaceEventReload(
    signals == null ? void 0 : signals.toolsVersion,
    result.reload,
    options.autoLoad === true || result.data !== void 0
  );
  return {
    ...result,
    status: result.data,
    tools: ((_a = result.data) == null ? void 0 : _a.tools) ?? [],
    preheat: workspaceActions.preheatAcp,
    setEnabled: workspaceActions.setWorkspaceToolEnabled
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonSettings(options = {}) {
  var _a;
  const workspaceActions = useDaemonWorkspaceActions();
  const load = useCallback(
    () => workspaceActions.loadSettingsStatus(),
    [workspaceActions]
  );
  const result = useDaemonResource(load, options);
  const signals = useDaemonWorkspaceEventSignals();
  useWorkspaceEventReload(
    signals == null ? void 0 : signals.settingsVersion,
    result.reload,
    options.autoLoad === true || result.data !== void 0
  );
  return {
    ...result,
    status: result.data,
    settings: ((_a = result.data) == null ? void 0 : _a.settings) ?? [],
    setValue: workspaceActions.setWorkspaceSetting
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonProviders(options = {}) {
  var _a, _b;
  const workspaceActions = useDaemonWorkspaceActions();
  const load = useCallback(
    () => workspaceActions.loadProviders(),
    [workspaceActions]
  );
  const result = useDaemonResource(load, options);
  const signals = useDaemonWorkspaceEventSignals();
  useWorkspaceEventReload(
    signals == null ? void 0 : signals.settingsVersion,
    result.reload,
    options.autoLoad === true || result.data !== void 0
  );
  return {
    ...result,
    status: result.data,
    providers: ((_a = result.data) == null ? void 0 : _a.providers) ?? [],
    current: (_b = result.data) == null ? void 0 : _b.current
  };
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const SUGGESTION_DELAY_MS = 300;
const ACCEPT_DEBOUNCE_MS = 100;
const INITIAL_FOLLOWUP_STATE = Object.freeze({
  suggestion: null,
  isVisible: false,
  shownAt: 0
});
function clearStoreFollowupSuggestion(store) {
  var _a;
  const maybeStore = store;
  (_a = maybeStore.clearFollowupSuggestion) == null ? void 0 : _a.call(maybeStore);
}
function createDaemonFollowupController(options) {
  const { enabled = true, onStateChange, getOnAccept, getOnOutcome } = options;
  let currentState = INITIAL_FOLLOWUP_STATE;
  let timeoutId = null;
  let accepting = false;
  let acceptTimeoutId = null;
  function applyState(next) {
    currentState = next;
    onStateChange(next);
  }
  function clearTimers() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (acceptTimeoutId) {
      clearTimeout(acceptTimeoutId);
      acceptTimeoutId = null;
    }
  }
  const setSuggestion = (text) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (!text) {
      applyState(INITIAL_FOLLOWUP_STATE);
      return;
    }
    if (!enabled) return;
    timeoutId = setTimeout(() => {
      applyState({ suggestion: text, isVisible: true, shownAt: Date.now() });
    }, SUGGESTION_DELAY_MS);
  };
  const accept = (method, options2) => {
    var _a;
    if (accepting) return;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    accepting = true;
    const text = currentState.suggestion;
    const { shownAt } = currentState;
    if (!text) {
      accepting = false;
      return;
    }
    try {
      (_a = getOnOutcome()) == null ? void 0 : _a({
        outcome: "accepted",
        accept_method: method,
        time_ms: shownAt > 0 ? Date.now() - shownAt : 0,
        suggestion_length: text.length
      });
    } catch (error) {
      console.error("[followup] onOutcome callback threw:", error);
    }
    applyState(INITIAL_FOLLOWUP_STATE);
    queueMicrotask(() => {
      var _a2;
      try {
        if (!(options2 == null ? void 0 : options2.skipOnAccept)) {
          (_a2 = getOnAccept()) == null ? void 0 : _a2(text);
        }
      } catch (error) {
        console.error("[followup] onAccept callback threw:", error);
      } finally {
        if (acceptTimeoutId) {
          clearTimeout(acceptTimeoutId);
        }
        acceptTimeoutId = setTimeout(() => {
          accepting = false;
        }, ACCEPT_DEBOUNCE_MS);
      }
    });
  };
  const dismiss = () => {
    var _a;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (!currentState.isVisible && !currentState.suggestion) return;
    if (currentState.isVisible && currentState.suggestion) {
      try {
        (_a = getOnOutcome()) == null ? void 0 : _a({
          outcome: "ignored",
          time_ms: currentState.shownAt > 0 ? Date.now() - currentState.shownAt : 0,
          suggestion_length: currentState.suggestion.length
        });
      } catch (error) {
        console.error("[followup] onOutcome callback threw:", error);
      }
    }
    applyState(INITIAL_FOLLOWUP_STATE);
  };
  const clear = () => {
    clearTimers();
    accepting = false;
    applyState(INITIAL_FOLLOWUP_STATE);
  };
  const cleanup = () => {
    clearTimers();
    accepting = false;
  };
  return { setSuggestion, accept, dismiss, clear, cleanup };
}
function useDaemonFollowupSuggestion(opts = {}) {
  const { enabled = true, onAccept, onOutcome } = opts;
  const store = useDaemonTranscriptStore();
  const sessionId = useDaemonConnection().sessionId;
  const [state, setState] = useState(INITIAL_FOLLOWUP_STATE);
  const onAcceptRef = useRef(onAccept);
  onAcceptRef.current = onAccept;
  const onOutcomeRef = useRef(onOutcome);
  onOutcomeRef.current = onOutcome;
  const lastFollowupSuggestion2 = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().lastFollowupSuggestion,
    () => store.getSnapshot().lastFollowupSuggestion
  );
  const sidechannelFollowupSuggestion = useSyncExternalStore(
    subscribeSidechannelFollowupSuggestion,
    getSidechannelFollowupSuggestion,
    getSidechannelFollowupSuggestion
  );
  const activeFollowupSuggestion = (sidechannelFollowupSuggestion == null ? void 0 : sidechannelFollowupSuggestion.sessionId) === sessionId ? sidechannelFollowupSuggestion : lastFollowupSuggestion2;
  const controller = useMemo(
    () => createDaemonFollowupController({
      enabled,
      onStateChange: setState,
      getOnAccept: () => onAcceptRef.current,
      getOnOutcome: () => onOutcomeRef.current
    }),
    [enabled]
  );
  const { setSuggestion } = controller;
  useEffect(() => {
    if (!enabled) {
      controller.clear();
    }
    return () => controller.cleanup();
  }, [controller, enabled]);
  const lastPushedPromptIdRef = useRef(void 0);
  const previousSessionIdRef = useRef(sessionId);
  useEffect(() => {
    const previousSessionId = previousSessionIdRef.current;
    previousSessionIdRef.current = sessionId;
    const sessionChanged = previousSessionId !== void 0 && sessionId !== void 0 && previousSessionId !== sessionId;
    if (!sessionChanged) return;
    controller.clear();
    clearSidechannelFollowupSuggestion();
    lastPushedPromptIdRef.current = void 0;
  }, [controller, sessionId]);
  useEffect(() => {
    const nextPromptId = activeFollowupSuggestion == null ? void 0 : activeFollowupSuggestion.promptId;
    if (nextPromptId === lastPushedPromptIdRef.current) return;
    lastPushedPromptIdRef.current = nextPromptId;
    setSuggestion((activeFollowupSuggestion == null ? void 0 : activeFollowupSuggestion.suggestion) ?? null);
  }, [activeFollowupSuggestion, setSuggestion]);
  const clear = useCallback(() => {
    controller.clear();
    clearStoreFollowupSuggestion(store);
    clearSidechannelFollowupSuggestion();
    lastPushedPromptIdRef.current = void 0;
  }, [controller, store]);
  const onAcceptFollowup = useCallback(
    (method, options) => {
      controller.accept(method, options);
      clearStoreFollowupSuggestion(store);
      clearSidechannelFollowupSuggestion();
      lastPushedPromptIdRef.current = void 0;
    },
    [controller, store]
  );
  const onDismissFollowup = useCallback(() => {
    controller.dismiss();
    clearStoreFollowupSuggestion(store);
    clearSidechannelFollowupSuggestion();
    lastPushedPromptIdRef.current = void 0;
  }, [controller, store]);
  return useMemo(
    () => ({
      followupState: state,
      onAcceptFollowup,
      onDismissFollowup,
      clear
    }),
    [state, onAcceptFollowup, onDismissFollowup, clear]
  );
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
function useDaemonMidTurnInjected() {
  const batches = useSyncExternalStore(
    subscribeSidechannelMidTurnInjected,
    getSidechannelMidTurnInjected,
    getSidechannelMidTurnInjected
  );
  const consume = useCallback(
    (handled) => consumeSidechannelMidTurnInjected(handled),
    []
  );
  return { batches, consume };
}
export {
  A as AGENT_TOOL_NAME,
  DAEMON_APPROVAL_MODES,
  DEFAULT_MAX_BLOCKS as DAEMON_SESSION_DEFAULT_MAX_BLOCKS,
  DaemonSessionProvider,
  DaemonWorkspaceProvider,
  consumePendingPromptEvents,
  getPendingPromptEvents,
  getPendingPromptVersion,
  i as isAgentTool,
  isMissingSessionHttpStatus,
  subscribePendingPromptEvents,
  subscribePendingPromptVersion,
  useDaemonActions as useActions,
  useDaemonActiveTodoList as useActiveTodoList,
  useDaemonAgents as useAgents,
  useDaemonAuth as useAuth,
  useDaemonChannels as useChannels,
  useDaemonConnection as useConnection,
  useDaemonFollowupSuggestion,
  useDaemonMidTurnInjected,
  useDaemonSessionOwnerGuard,
  useDaemonDiagnostics as useDiagnostics,
  useDaemonFiles as useFiles,
  useDaemonGlob as useGlob,
  useDaemonMcp as useMcp,
  useDaemonMemory as useMemory,
  useOptionalDaemonWorkspace as useOptionalWorkspace,
  useDaemonPendingPermissions as usePendingPermissions,
  useDaemonPromptStatus as usePromptStatus,
  useDaemonProviders as useProviders,
  useDaemonResource as useResource,
  useDaemonSession as useSession,
  useDaemonSessionNotices as useSessionNotices,
  useDaemonSessions as useSessions,
  useDaemonSettings as useSettings,
  useDaemonSkills as useSkills,
  useDaemonStatusReport as useStatusReport,
  useDaemonStreamingState as useStreamingState,
  useDaemonTools as useTools,
  useDaemonTranscriptBlocks as useTranscriptBlocks,
  useDaemonTranscriptHistory as useTranscriptHistory,
  useDaemonTranscriptState as useTranscriptState,
  useDaemonTranscriptStore as useTranscriptStore,
  useDaemonUsageDashboard as useUsageDashboard,
  useDaemonWorkspace as useWorkspace,
  useDaemonWorkspaceActions as useWorkspaceActions,
  useDaemonWorkspaceEventSignals as useWorkspaceEventSignals
};
//# sourceMappingURL=daemon-react-sdk.js.map
