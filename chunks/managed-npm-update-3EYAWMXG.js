// Force strict mode and setup for ESM
"use strict";
import {
  require_semver
} from "./chunk-2AUM35J5.js";
import {
  getNpmCliPath
} from "./chunk-V2NDP3I4.js";
import "./chunk-6ZWR4VPS.js";
import "./chunk-4RKOX6KV.js";
import "./chunk-NF5J2WFA.js";
import "./chunk-CQH5KTKC.js";
import "./chunk-LJZSMWOH.js";
import "./chunk-VFU5HERL.js";
import "./chunk-PKAYJDB3.js";
import "./chunk-6IUNAPLR.js";
import "./chunk-OIVXBW3W.js";
import "./chunk-MXFA6OME.js";
import "./chunk-XQFT3QUF.js";
import "./chunk-VTHREBQM.js";
import "./chunk-ZPJWUGCS.js";
import "./chunk-H2WDGQ6D.js";
import "./chunk-BZVBWMZG.js";
import "./chunk-E4A5G5YB.js";
import "./chunk-GOFAQQZA.js";
import "./chunk-5M6IDOMF.js";
import "./chunk-TWPJO254.js";
import "./chunk-CQ35AJ4Z.js";
import "./chunk-EKSCLBBF.js";
import "./chunk-P2SU6ZTI.js";
import "./chunk-IZIVM7LZ.js";
import "./chunk-SFPGAQUL.js";
import "./chunk-6PVPNMXU.js";
import "./chunk-JB4JIVTJ.js";
import "./chunk-IRH27ZC2.js";
import "./chunk-QHWCP53L.js";
import "./chunk-D5LUXLUH.js";
import "./chunk-O6GEWCJA.js";
import "./chunk-T26EAKDL.js";
import "./chunk-EOGELB3H.js";
import "./chunk-CPBF7KYF.js";
import "./chunk-EFUM7RVY.js";
import "./chunk-TTX2JUE6.js";
import "./chunk-43GGFFLY.js";
import "./chunk-SMPR7SPO.js";
import "./chunk-JWALNCLT.js";
import "./chunk-NIFYWDYN.js";
import "./chunk-3AFMQUTI.js";
import "./chunk-WKK5BQNP.js";
import "./chunk-V5J4J5TP.js";
import {
  require_proper_lockfile
} from "./chunk-MLXTMF7H.js";
import "./chunk-NAVJD2PQ.js";
import "./chunk-3JGZSIDA.js";
import "./chunk-VVW4ZNFY.js";
import "./chunk-QHMLYMMS.js";
import "./chunk-7DJCPZE3.js";
import "./chunk-P3QQPMQA.js";
import "./chunk-HVEYF6VT.js";
import "./chunk-VNOVK4I7.js";
import "./chunk-SAH4BD2J.js";
import "./chunk-PDMJ3KGS.js";
import "./chunk-CMHFCLBU.js";
import "./chunk-S6LOFUVP.js";
import "./chunk-2LD5U7Q3.js";
import "./chunk-DJ2GSRLV.js";
import "./chunk-J2OSJFP3.js";
import "./chunk-K2OJUPOE.js";
import "./chunk-CFKIH3D3.js";
import "./chunk-4FTKQNWJ.js";
import "./chunk-Y3QL45LS.js";
import "./chunk-7RHAVFGI.js";
import "./chunk-YRLW2MSX.js";
import "./chunk-VGC4I5JJ.js";
import "./chunk-3I6UTTDX.js";
import "./chunk-6PJOTWAN.js";
import "./chunk-BWORX6FA.js";
import "./chunk-WZAD4ZNJ.js";
import "./chunk-FPGTNKCP.js";
import "./chunk-6DIGWMGT.js";
import "./chunk-IVI3S6LL.js";
import "./chunk-XZA32HII.js";
import "./chunk-23RFD54N.js";
import "./chunk-PPKZ7JOE.js";
import "./chunk-HHJLM3WQ.js";
import "./chunk-L6BZRIUL.js";
import "./chunk-74TONY4F.js";
import "./chunk-XF63PKEN.js";
import "./chunk-CAJTKR6W.js";
import "./chunk-ZU4UDIWX.js";
import "./chunk-AQ37AY7B.js";
import "./chunk-PDQGMSZK.js";
import "./chunk-UTLCH2FK.js";
import {
  Storage,
  createDebugLogger
} from "./chunk-UHQFIS7N.js";
import "./chunk-75DOP5OR.js";
import "./chunk-DMTGGOSA.js";
import "./chunk-YQ3U5MUC.js";
import "./chunk-AMDSOFFV.js";
import "./chunk-TBWQLLFO.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name,
  __toESM
} from "./chunk-J2S4EL5Y.js";

// packages/cli/src/utils/managed-npm-update.ts
init_esbuild_shims();
var import_proper_lockfile = __toESM(require_proper_lockfile(), 1);
var import_semver = __toESM(require_semver(), 1);
import { execFile, execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import * as path from "node:path";
import { promisify } from "node:util";
var PACKAGE_NAME = "@qwen-code/qwen-code";
var debugLogger = createDebugLogger("MANAGED_NPM_UPDATE");
var execFileAsync = promisify(execFile);
function assertVersion(version) {
  if (import_semver.default.valid(version) !== version) {
    throw new Error(`Invalid update version: ${version}`);
  }
}
__name(assertVersion, "assertVersion");
function packageDir(prefix) {
  return path.join(prefix, "node_modules", "@qwen-code", "qwen-code");
}
__name(packageDir, "packageDir");
function resolveBootstrapPath(bootstrapPath) {
  if (!bootstrapPath) {
    throw new Error("Unable to identify the Qwen Code npm launcher");
  }
  return fs.realpathSync(bootstrapPath);
}
__name(resolveBootstrapPath, "resolveBootstrapPath");
function launcherId(bootstrapPath) {
  return createHash("sha256").update(bootstrapPath).digest("hex").slice(0, 16);
}
__name(launcherId, "launcherId");
function processDoesNotExist(pidText) {
  const pid = Number(pidText);
  if (!Number.isSafeInteger(pid)) return false;
  try {
    process.kill(pid, 0);
    return false;
  } catch (error) {
    return error.code === "ESRCH";
  }
}
__name(processDoesNotExist, "processDoesNotExist");
function readDirectoryEntries(directory) {
  try {
    return fs.readdirSync(directory, { withFileTypes: true });
  } catch {
    return [];
  }
}
__name(readDirectoryEntries, "readDirectoryEntries");
function cleanupOrphanedManagedNpmUpdateArtifacts(launcherRoot, versionsDir) {
  for (const entry of readDirectoryEntries(versionsDir)) {
    const match = /^\.(.+)-([1-9]\d*)-[A-Za-z0-9]{6}$/.exec(entry.name);
    if (!entry.isDirectory() || entry.isSymbolicLink() || !match || import_semver.default.valid(match[1]) !== match[1] || !processDoesNotExist(match[2])) {
      continue;
    }
    try {
      fs.rmSync(path.join(versionsDir, entry.name), {
        recursive: true,
        force: true
      });
    } catch {
      continue;
    }
  }
  for (const entry of readDirectoryEntries(launcherRoot)) {
    const match = /^active\.json\.([1-9]\d*)$/.exec(entry.name);
    if (!entry.isFile() || entry.isSymbolicLink() || !match || !processDoesNotExist(match[1])) {
      continue;
    }
    try {
      fs.rmSync(path.join(launcherRoot, entry.name), { force: true });
    } catch {
      continue;
    }
  }
}
__name(cleanupOrphanedManagedNpmUpdateArtifacts, "cleanupOrphanedManagedNpmUpdateArtifacts");
function resolveNpmGlobalConfigPath() {
  const configured = process.env["NPM_CONFIG_GLOBALCONFIG"];
  if (configured) return path.resolve(configured);
  const output = execFileSync(
    process.execPath,
    [
      getNpmCliPath(process.execPath, process.platform),
      "config",
      "get",
      "globalconfig",
      "--global"
    ],
    { encoding: "utf8", timeout: 1e4 }
  ).trim();
  if (!output || output === "null" || output === "undefined") {
    throw new Error("Unable to resolve the global npm configuration");
  }
  return output;
}
__name(resolveNpmGlobalConfigPath, "resolveNpmGlobalConfigPath");
function readBaseInstallation(bootstrapPath) {
  const manifest = JSON.parse(
    fs.readFileSync(
      path.join(path.dirname(bootstrapPath), "package.json"),
      "utf8"
    )
  );
  if (manifest.name !== PACKAGE_NAME || typeof manifest.version !== "string") {
    throw new Error("Unable to identify the base Qwen Code npm installation");
  }
  return {
    version: manifest.version,
    ctimeMs: fs.statSync(bootstrapPath).ctimeMs
  };
}
__name(readBaseInstallation, "readBaseInstallation");
async function validateInstallation(prefix, version) {
  const root = packageDir(prefix);
  const manifest = JSON.parse(
    await fsPromises.readFile(path.join(root, "package.json"), "utf8")
  );
  if (manifest.name !== PACKAGE_NAME || manifest.version !== version) {
    throw new Error(
      `Installed package did not match ${PACKAGE_NAME}@${version}`
    );
  }
  await fsPromises.access(path.join(root, "cli.js"));
}
__name(validateInstallation, "validateInstallation");
async function smokeTest(prefix) {
  const env = { ...process.env };
  delete env["CLI_VERSION"];
  delete env["QWEN_CODE_RELAUNCH_ARGS"];
  await execFileAsync(
    process.execPath,
    [path.join(packageDir(prefix), "cli-entry.js"), "--help"],
    { encoding: "utf8", env, timeout: 1e4 }
  );
}
__name(smokeTest, "smokeTest");
async function readActiveVersion(activeFile, expected) {
  try {
    const active = JSON.parse(
      await fsPromises.readFile(activeFile, "utf8")
    );
    return typeof active.version === "string" && import_semver.default.valid(active.version) !== null && active.bootstrap === expected.bootstrap && active.baseVersion === expected.baseVersion && active.bootstrapCtimeMs === expected.bootstrapCtimeMs ? active.version : null;
  } catch {
    return null;
  }
}
__name(readActiveVersion, "readActiveVersion");
function prepareManagedNpmUpdate(version, bootstrapPath = process.env["QWEN_CODE_CLI"], updateRoot = process.env["QWEN_CODE_MANAGED_NPM_ROOT"] ?? path.join(Storage.getGlobalQwenDir(), "updates", "npm")) {
  assertVersion(version);
  const resolvedBootstrapPath = resolveBootstrapPath(bootstrapPath);
  const base = readBaseInstallation(resolvedBootstrapPath);
  const npmGlobalConfigPath = resolveNpmGlobalConfigPath();
  const launcherRoot = path.join(updateRoot, launcherId(resolvedBootstrapPath));
  const versionsDir = path.join(launcherRoot, "versions");
  fs.mkdirSync(versionsDir, { recursive: true });
  cleanupOrphanedManagedNpmUpdateArtifacts(launcherRoot, versionsDir);
  const stagingDir = fs.mkdtempSync(
    path.join(versionsDir, `.${version}-${process.pid}-`)
  );
  return {
    stagingDir,
    versionDir: path.join(versionsDir, version),
    launcherRoot,
    baseVersion: base.version,
    bootstrapCtimeMs: base.ctimeMs,
    installArgs: [
      "install",
      "--globalconfig",
      npmGlobalConfigPath,
      "--prefix",
      stagingDir,
      "--global=false",
      "--no-save",
      "--package-lock=false",
      "--no-audit",
      "--no-fund",
      `${PACKAGE_NAME}@${version}`
    ]
  };
}
__name(prepareManagedNpmUpdate, "prepareManagedNpmUpdate");
async function installManagedNpmUpdate(version, bootstrapPath = process.env["QWEN_CODE_CLI"], updateRoot = process.env["QWEN_CODE_MANAGED_NPM_ROOT"] ?? path.join(Storage.getGlobalQwenDir(), "updates", "npm"), spawnFn = spawn) {
  const update = prepareManagedNpmUpdate(version, bootstrapPath, updateRoot);
  const env = { ...process.env };
  for (const key of ["NPM_CONFIG_USERCONFIG", "npm_config_userconfig"]) {
    const configured = env[key];
    if (configured) env[key] = path.resolve(configured);
  }
  try {
    await new Promise((resolve2, reject) => {
      const child = spawnFn(
        process.execPath,
        [
          getNpmCliPath(process.execPath, process.platform),
          ...update.installArgs
        ],
        {
          cwd: update.stagingDir,
          env,
          stdio: ["ignore", "ignore", "inherit"],
          timeout: 10 * 6e4,
          windowsHide: true
        }
      );
      child.once("error", reject);
      child.once("close", (code) => {
        if (code === 0) resolve2();
        else reject(new Error(`npm install exited with code ${code}`));
      });
    });
    await activateManagedNpmUpdate(update, version, bootstrapPath);
  } catch (error) {
    await cleanupManagedNpmUpdate(update);
    throw error;
  }
}
__name(installManagedNpmUpdate, "installManagedNpmUpdate");
async function activateManagedNpmUpdate(update, version, bootstrapPath = process.env["QWEN_CODE_CLI"]) {
  assertVersion(version);
  const resolvedBootstrapPath = resolveBootstrapPath(bootstrapPath);
  if (path.join(
    path.dirname(update.launcherRoot),
    launcherId(resolvedBootstrapPath)
  ) !== update.launcherRoot) {
    throw new Error("The npm update does not match the active launcher");
  }
  await validateInstallation(update.stagingDir, version);
  await smokeTest(update.stagingDir);
  const activeFile = path.join(update.launcherRoot, "active.json");
  const release = await import_proper_lockfile.default.lock(activeFile, {
    realpath: false,
    stale: 3e4,
    retries: { retries: 50, minTimeout: 20, maxTimeout: 100 },
    onCompromised: /* @__PURE__ */ __name((err) => {
      debugLogger.warn("managed npm update lock compromised:", err);
    }, "onCompromised")
  });
  try {
    const base = readBaseInstallation(resolvedBootstrapPath);
    if (base.version !== update.baseVersion || base.ctimeMs !== update.bootstrapCtimeMs) {
      throw new Error(
        "The base Qwen Code npm installation changed during update"
      );
    }
    const activeVersion = await readActiveVersion(activeFile, {
      bootstrap: resolvedBootstrapPath,
      baseVersion: base.version,
      bootstrapCtimeMs: base.ctimeMs
    });
    if (activeVersion && import_semver.default.gt(activeVersion, version)) {
      try {
        await validateInstallation(
          path.join(update.launcherRoot, "versions", activeVersion),
          activeVersion
        );
        await cleanupManagedNpmUpdate(update);
        return;
      } catch {
      }
    }
    try {
      await fsPromises.rename(update.stagingDir, update.versionDir);
    } catch (error) {
      if (!fs.existsSync(update.versionDir)) throw error;
      await validateInstallation(update.versionDir, version);
      await cleanupManagedNpmUpdate(update);
    }
    const temporaryActivePath = `${activeFile}.${process.pid}`;
    try {
      await fsPromises.writeFile(
        temporaryActivePath,
        JSON.stringify({
          version,
          bootstrap: resolvedBootstrapPath,
          baseVersion: base.version,
          bootstrapCtimeMs: base.ctimeMs
        }),
        { mode: 384 }
      );
      await fsPromises.rename(temporaryActivePath, activeFile);
    } finally {
      await fsPromises.rm(temporaryActivePath, { force: true });
    }
  } finally {
    try {
      await release();
    } catch (error) {
      debugLogger.warn("Failed to release managed npm update lock:", error);
    }
  }
}
__name(activateManagedNpmUpdate, "activateManagedNpmUpdate");
async function cleanupManagedNpmUpdate(update) {
  await fsPromises.rm(update.stagingDir, { recursive: true, force: true }).catch(() => {
  });
}
__name(cleanupManagedNpmUpdate, "cleanupManagedNpmUpdate");
export {
  activateManagedNpmUpdate,
  cleanupManagedNpmUpdate,
  installManagedNpmUpdate,
  prepareManagedNpmUpdate
};
/**
 * @license
 * Copyright 2026 Qwen Code
 * SPDX-License-Identifier: Apache-2.0
 */
