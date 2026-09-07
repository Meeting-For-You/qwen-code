// Force strict mode and setup for ESM
"use strict";
import {
  INBOXES_DIR,
  LEADER_NAME,
  TASKS_DIR,
  TEAMMATE_COLORS,
  TEAMS_DIR,
  TEAM_CONFIG_FILENAME
} from "./chunk-CPBF7KYF.js";
import {
  atomicWriteJSON
} from "./chunk-23RFD54N.js";
import {
  Storage,
  isNodeError
} from "./chunk-UHQFIS7N.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/agents/team/teamHelpers.ts
init_esbuild_shims();
import * as fs2 from "node:fs/promises";
import * as path from "node:path";

// packages/core/src/utils/process-liveness.ts
init_esbuild_shims();
import * as fs from "node:fs";
function isPidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return !isZombie(pid);
  } catch (err) {
    return isNodeError(err) && (err.code === "EPERM" || err.code === "EACCES") && !isZombie(pid);
  }
}
__name(isPidAlive, "isPidAlive");
function isZombie(pid) {
  if (process.platform !== "linux") return false;
  let raw;
  try {
    raw = fs.readFileSync(`/proc/${pid}/stat`, "utf8");
  } catch {
    return false;
  }
  const commEnd = raw.lastIndexOf(")");
  if (commEnd === -1) return false;
  return raw.slice(commEnd + 1).trimStart().startsWith("Z");
}
__name(isZombie, "isZombie");
function readProcStartToken(pid) {
  if (process.platform !== "linux") return null;
  if (!Number.isInteger(pid) || pid <= 0) return null;
  const bootId = readLocalBootId();
  if (bootId === null) return null;
  let raw;
  try {
    raw = fs.readFileSync(`/proc/${pid}/stat`, "utf8");
  } catch {
    return null;
  }
  const commEnd = raw.lastIndexOf(")");
  if (commEnd === -1) return null;
  const fields = raw.slice(commEnd + 1).trim().split(/\s+/);
  const startTime = fields[19];
  return startTime !== void 0 && /^\d+$/.test(startTime) ? `${bootId}:${startTime}` : null;
}
__name(readProcStartToken, "readProcStartToken");
var cachedBootId;
function readLocalBootId() {
  if (cachedBootId !== void 0) return cachedBootId;
  try {
    const value = fs.readFileSync("/proc/sys/kernel/random/boot_id", "utf8").trim();
    if (/^[0-9a-f-]+$/i.test(value)) {
      cachedBootId = value;
      return value;
    }
  } catch {
  }
  return null;
}
__name(readLocalBootId, "readLocalBootId");
function readPidNamespaceId() {
  if (process.platform !== "linux") return null;
  try {
    return fs.statSync("/proc/self/ns/pid").ino;
  } catch {
    return null;
  }
}
__name(readPidNamespaceId, "readPidNamespaceId");
function isSameProcess(pid, procStart) {
  if (!isPidAlive(pid)) return false;
  if (procStart == null) return true;
  const current = readProcStartToken(pid);
  if (current === null) return true;
  return current === procStart;
}
__name(isSameProcess, "isSameProcess");

// packages/core/src/agents/team/teamHelpers.ts
function getTeamsRootDir() {
  return path.join(Storage.getGlobalQwenDir(), TEAMS_DIR);
}
__name(getTeamsRootDir, "getTeamsRootDir");
function getTeamDir(teamName) {
  return path.join(getTeamsRootDir(), teamName);
}
__name(getTeamDir, "getTeamDir");
function getTeamFilePath(teamName) {
  return path.join(getTeamDir(teamName), TEAM_CONFIG_FILENAME);
}
__name(getTeamFilePath, "getTeamFilePath");
function getInboxesDir(teamName) {
  return path.join(getTeamDir(teamName), INBOXES_DIR);
}
__name(getInboxesDir, "getInboxesDir");
function getTasksDir(teamName) {
  return path.join(Storage.getGlobalQwenDir(), TASKS_DIR, teamName);
}
__name(getTasksDir, "getTasksDir");
function sanitizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
__name(sanitizeName, "sanitizeName");
function formatAgentId(name, teamName) {
  return `${sanitizeName(name)}@${sanitizeName(teamName)}`;
}
__name(formatAgentId, "formatAgentId");
function generateUniqueTeammateName(baseName, existingMembers) {
  const sanitized = sanitizeName(baseName);
  if (!sanitized) {
    throw new Error(
      `Teammate name "${baseName}" sanitizes to an empty string. Choose a name with at least one alphanumeric character.`
    );
  }
  if (sanitized === LEADER_NAME) {
    throw new Error(
      `"${LEADER_NAME}" is reserved for the team leader. Choose a different teammate name.`
    );
  }
  const existingNames = new Set(existingMembers.map((m) => m.name));
  if (existingNames.has(sanitized)) {
    const existingList = [...existingNames].join(", ") || "<none>";
    throw new Error(
      `A teammate named "${sanitized}" already exists in this team (existing: ${existingList}). Choose a different name.`
    );
  }
  return sanitized;
}
__name(generateUniqueTeammateName, "generateUniqueTeammateName");
function assignTeammateColor(existingMembers) {
  const usedColors = new Set(
    existingMembers.map((m) => m.color).filter((c) => c !== void 0)
  );
  for (const color of TEAMMATE_COLORS) {
    if (!usedColors.has(color)) {
      return color;
    }
  }
  return TEAMMATE_COLORS[existingMembers.length % TEAMMATE_COLORS.length];
}
__name(assignTeammateColor, "assignTeammateColor");
function findMemberByName(members, name) {
  const sanitized = sanitizeName(name);
  return members.find((m) => m.name === sanitized);
}
__name(findMemberByName, "findMemberByName");
function classifyShutdownResponse(message) {
  const trimmed = message.trimStart();
  if (/^shutdown_approved\b/i.test(trimmed)) return "shutdown_approved";
  if (/^shutdown_rejected\b/i.test(trimmed)) return "shutdown_rejected";
  return void 0;
}
__name(classifyShutdownResponse, "classifyShutdownResponse");
async function readTeamFile(teamName) {
  const filePath = getTeamFilePath(teamName);
  try {
    const raw = await fs2.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (isNodeError(err) && err.code === "ENOENT") {
      return void 0;
    }
    throw err;
  }
}
__name(readTeamFile, "readTeamFile");
async function writeTeamFile(teamName, teamFile) {
  const filePath = getTeamFilePath(teamName);
  await fs2.mkdir(path.dirname(filePath), { recursive: true });
  await atomicWriteJSON(filePath, teamFile);
}
__name(writeTeamFile, "writeTeamFile");
async function createTeamFile(teamName, teamFile) {
  const filePath = getTeamFilePath(teamName);
  await fs2.mkdir(path.dirname(filePath), { recursive: true });
  await fs2.writeFile(filePath, JSON.stringify(teamFile, null, 2) + "\n", {
    encoding: "utf-8",
    flag: "wx"
  });
}
__name(createTeamFile, "createTeamFile");
async function tryReclaimStaleTeam(teamName) {
  let existing;
  try {
    existing = await readTeamFile(teamName);
  } catch {
    return false;
  }
  if (!existing) {
    await deleteTeamDirs(teamName);
    return true;
  }
  if (typeof existing.leadPid !== "number" || existing.leadPid <= 0) {
    return false;
  }
  if (existing.leadPid !== process.pid && isPidAlive(existing.leadPid)) {
    return false;
  }
  await deleteTeamDirs(teamName);
  return true;
}
__name(tryReclaimStaleTeam, "tryReclaimStaleTeam");
async function deleteTeamDirs(teamName) {
  const teamDir = getTeamDir(teamName);
  const tasksDir = getTasksDir(teamName);
  await Promise.allSettled([
    fs2.rm(teamDir, { recursive: true, force: true }),
    fs2.rm(tasksDir, { recursive: true, force: true })
  ]);
}
__name(deleteTeamDirs, "deleteTeamDirs");

export {
  readProcStartToken,
  readLocalBootId,
  readPidNamespaceId,
  isSameProcess,
  getTeamDir,
  getInboxesDir,
  getTasksDir,
  sanitizeName,
  formatAgentId,
  generateUniqueTeammateName,
  assignTeammateColor,
  findMemberByName,
  classifyShutdownResponse,
  writeTeamFile,
  createTeamFile,
  tryReclaimStaleTeam,
  deleteTeamDirs
};
/**
 * @license
 * Copyright 2026 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
