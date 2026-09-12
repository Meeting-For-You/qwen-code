#!/usr/bin/env node
// Force strict mode and setup for ESM
"use strict";
import {
  handleUncaughtException,
  isExpectedPtyRaceError
} from "./chunks/chunk-BRVWYMKV.js";
import {
  initCpuProfiler
} from "./chunks/chunk-NLYH3VYW.js";
import "./chunks/chunk-4EBBX5PD.js";
import {
  initStartupProfiler
} from "./chunks/chunk-QILD6R27.js";
import {
  normalizeServeFastPathArgv
} from "./chunks/chunk-JVEGA3MM.js";
import "./chunks/chunk-KGJGEEVR.js";
import {
  init_esbuild_shims
} from "./chunks/chunk-5O2XNYP6.js";
import {
  __name
} from "./chunks/chunk-J2S4EL5Y.js";

// packages/cli/src/cli.ts
init_esbuild_shims();
import {
  accessSync,
  chmodSync,
  constants,
  existsSync,
  realpathSync,
  statSync
} from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
initStartupProfiler();
initCpuProfiler();
var TOP_LEVEL_COMMANDS = [
  ["auth", "Configure authentication (removed)"],
  ["channel <command>", "Manage messaging channels (Telegram, Discord, etc.)"],
  ["extensions <command>", "Manage Qwen Code extensions."],
  ["hooks", "Manage Qwen Code hooks (use /hooks in interactive mode)."],
  ["mcp", "Manage MCP servers"],
  [
    "review <command>",
    "Run a review non-interactively (`run`), plus the internal helpers used by the /review skill (PR worktree setup, context fetch, rules loading, presubmit checks, cleanup)"
  ],
  [
    "serve",
    "Run Qwen Code as a local HTTP daemon (Stage 1 experimental: --http-bridge)"
  ],
  ["sessions <command>", "Manage Qwen Code sessions"],
  ["update", "Check for Qwen Code updates and install if available"]
];
var MCP_COMMANDS = [
  ["add <name> <commandOrUrl> [args...]", "Add a server"],
  ["remove <name>", "Remove a server"],
  ["list", "List all configured MCP servers"],
  ["reconnect [server-name]", "Reconnect to MCP servers"],
  ["approve [name]", "Approve a pending MCP server"],
  ["reject [name]", "Reject a pending MCP server"]
];
var TOP_LEVEL_HELP_OPTIONS = [
  ["model", { alias: "m", type: "string", description: "Model" }],
  [
    "fallback-model",
    {
      type: "array",
      description: "Fallback model(s) for capacity errors, repeatable or comma-separated (max 3)"
    }
  ],
  [
    "prompt",
    {
      alias: "p",
      type: "string",
      description: "Prompt. Appended to input on stdin (if any)."
    }
  ],
  [
    "prompt-interactive",
    {
      alias: "i",
      type: "string",
      description: "Execute the provided prompt and continue in interactive mode"
    }
  ],
  [
    "safe-mode",
    {
      type: "boolean",
      description: "Disable all customizations (context files, hooks, extensions, skills, MCP servers) for troubleshooting."
    }
  ],
  [
    "sandbox",
    {
      alias: "s",
      type: "boolean",
      description: "Run in sandbox?"
    }
  ],
  [
    "output-format",
    {
      alias: "o",
      type: "string",
      choices: ["text", "json", "stream-json"],
      description: "The format of the CLI output."
    }
  ],
  [
    "continue",
    {
      alias: "c",
      type: "boolean",
      description: "Resume the most recent session for the current project."
    }
  ],
  [
    "resume",
    {
      alias: "r",
      type: "string",
      description: "Resume a specific session by its ID. Use without an ID to show session picker."
    }
  ]
];
var VALUE_FLAGS = /* @__PURE__ */ new Set([
  "--model",
  "-m",
  "--fallback-model",
  "--prompt",
  "-p",
  "--prompt-interactive",
  "-i",
  "--output-format",
  "-o",
  "--resume",
  "-r"
]);
function writeStdoutLine(line) {
  process.stdout.write(line.endsWith("\n") ? line : `${line}
`);
}
__name(writeStdoutLine, "writeStdoutLine");
function hasFlag(argv, long, short) {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") {
      return false;
    }
    if (VALUE_FLAGS.has(arg)) {
      i++;
      continue;
    }
    if (arg === long || arg === short) {
      return true;
    }
  }
  return false;
}
__name(hasFlag, "hasFlag");
async function buildTopLevelHelpParser() {
  const { default: yargs } = await import("./chunks/yargs-6H2AUULL.js");
  const parser = yargs([]).scriptName("qwen").usage(
    "Usage: qwen [options] [command]\n\nQwen Code - Launch an interactive CLI, use -p/--prompt for non-interactive mode"
  ).version("0.22.2").alias("v", "version").help().alias("h", "help").strict().demandCommand(0, 0);
  for (const [option, config] of TOP_LEVEL_HELP_OPTIONS) {
    parser.option(option, config);
  }
  for (const [command, description] of TOP_LEVEL_COMMANDS) {
    parser.command(command, description);
  }
  return parser;
}
__name(buildTopLevelHelpParser, "buildTopLevelHelpParser");
function firstPositionalArg(argv) {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--") {
      return void 0;
    }
    if (VALUE_FLAGS.has(arg)) {
      i++;
      continue;
    }
    if (!arg.startsWith("-")) {
      return arg;
    }
  }
  return void 0;
}
__name(firstPositionalArg, "firstPositionalArg");
function normalizeMcpFastPathArgv(argv) {
  if (argv[0] === "mcp" && argv[1] === "--") {
    return [argv[0], ...argv.slice(2)];
  }
  return argv;
}
__name(normalizeMcpFastPathArgv, "normalizeMcpFastPathArgv");
function resolveBootstrapRoute(rawArgv) {
  const argv = normalizeServeFastPathArgv(rawArgv);
  if (hasFlag(argv, "--version", "-v")) {
    return "version";
  }
  const firstArg = argv[0];
  if (firstArg === "serve") {
    return "serve";
  }
  if (firstArg === "mcp") {
    return "mcp";
  }
  const firstPositional = firstPositionalArg(argv);
  if (hasFlag(argv, "--help", "-h") && firstPositional === void 0) {
    return "help";
  }
  return "default";
}
__name(resolveBootstrapRoute, "resolveBootstrapRoute");
async function printTopLevelHelp() {
  const help = await (await buildTopLevelHelpParser()).getHelp();
  writeStdoutLine(help);
}
__name(printTopLevelHelp, "printTopLevelHelp");
function printMcpHelp() {
  const lines = [
    "Usage: qwen mcp <command>",
    "",
    "Manage MCP servers",
    "",
    "Commands:",
    ...MCP_COMMANDS.map(
      ([command, description]) => `  qwen mcp ${command}  ${description}`
    )
  ];
  writeStdoutLine(lines.join("\n"));
}
__name(printMcpHelp, "printMcpHelp");
async function printBootstrapVersion() {
  if ("0.22.2") {
    writeStdoutLine("0.22.2");
    return;
  }
  const { getCliVersion } = await import("./chunks/version-ANP4TS6O.js");
  writeStdoutLine(await getCliVersion());
}
__name(printBootstrapVersion, "printBootstrapVersion");
async function runMcpFastPath(rawArgv) {
  const argv = normalizeMcpFastPathArgv(normalizeServeFastPathArgv(rawArgv));
  const hasSubcommand = argv.length > 1 && !argv[1].startsWith("-");
  if (!hasSubcommand) {
    printMcpHelp();
    return;
  }
  const [{ default: yargsInstance }, { mcpCommand }] = await Promise.all([
    import("./chunks/yargs-6H2AUULL.js"),
    import("./chunks/mcp-LMUUJM2N.js")
  ]);
  const parser = yargsInstance([]).scriptName("qwen").command(mcpCommand).version(false).help().alias("h", "help").strict().strictCommands().demandCommand(1, "You need at least one command before continuing.").fail((message, error, yargs) => {
    writeStderrLine(message || error?.message || "Unknown argument error");
    yargs.showHelp();
    process.exitCode = 1;
  }).exitProcess(false);
  if (hasFlag(argv.slice(2), "--help", "-h")) {
    await parseYargsHelp(parser, argv);
    return;
  }
  await parseYargsCommand(parser, argv);
}
__name(runMcpFastPath, "runMcpFastPath");
async function parseYargsHelp(parser, argv) {
  await new Promise((resolve, reject) => {
    parser.parse(
      argv,
      (error, _argv, output) => {
        if (output) {
          writeStdoutLine(output);
        }
        if (error) {
          reject(error);
          return;
        }
        resolve();
      }
    );
  });
}
__name(parseYargsHelp, "parseYargsHelp");
async function parseYargsCommand(parser, argv) {
  await new Promise((resolve) => {
    parser.parse(
      argv,
      (error, _argv, output) => {
        if (output) {
          writeStdoutLine(output);
        }
        if (error) {
          writeStderrLine(error.message);
          process.exitCode = 1;
        }
        resolve();
      }
    );
  });
}
__name(parseYargsCommand, "parseYargsCommand");
async function runCliEntry(rawArgv = process.argv.slice(2)) {
  const managedUpdateVersion = process.env["QWEN_CODE_MANAGED_NPM_UPDATE_VERSION"];
  if (managedUpdateVersion) {
    delete process.env["QWEN_CODE_MANAGED_NPM_UPDATE_VERSION"];
    delete process.env["QWEN_CODE_EXTERNAL_TOOL_GUARD_TOKEN"];
    const { installManagedNpmUpdate } = await import("./chunks/managed-npm-update-4GF5FSL4.js");
    await installManagedNpmUpdate(managedUpdateVersion);
    return;
  }
  const argv = normalizeServeFastPathArgv(rawArgv);
  const route = resolveBootstrapRoute(argv);
  if (route !== "serve") {
    delete process.env["QWEN_CODE_EXTERNAL_TOOL_GUARD_TOKEN"];
  }
  if (route === "version") {
    await printBootstrapVersion();
    return;
  }
  if (route === "serve") {
    const { tryRunServeFastPath } = await import("./chunks/fast-path-JIJO5XUB.js");
    if (await tryRunServeFastPath(argv)) {
      return;
    }
  } else if (route === "mcp") {
    await runMcpFastPath(argv);
    return;
  } else if (route === "help") {
    await printTopLevelHelp();
    return;
  }
  const acpStartupProfiler = rawArgv.some(
    (arg) => arg === "--acp" || arg === "--experimental-acp"
  ) ? await import("./chunks/acp-startup-profiler-GNYAL6LI.js") : void 0;
  acpStartupProfiler?.initializeAcpStartupProfiler();
  acpStartupProfiler?.markAcpStartup("geminiImportStart");
  const { main } = await import("./chunks/gemini-YIW5TITX.js");
  acpStartupProfiler?.markAcpStartup("geminiImportEnd");
  await main();
}
__name(runCliEntry, "runCliEntry");
async function handleCriticalError(error) {
  const [{ FatalError }, { AlreadyReportedError }] = await Promise.all([
    import("./chunks/deferred-core-runtime-V3IR2YMV.js"),
    import("./chunks/errors-TOG7PKSH.js")
  ]);
  if (error instanceof FatalError) {
    let errorMessage = error.message;
    if (!process.env["NO_COLOR"]) {
      errorMessage = `\x1B[31m${errorMessage}\x1B[0m`;
    }
    writeStderrLine(errorMessage);
    process.exit(error.exitCode);
  }
  if (error instanceof AlreadyReportedError) {
    process.exit(error.exitCode);
  }
  writeStderrLine("An unexpected critical error occurred:");
  if (error instanceof Error) {
    writeStderrLine(error.stack ?? error.message);
  } else {
    writeStderrLine(String(error));
  }
  process.exit(1);
}
__name(handleCriticalError, "handleCriticalError");
function writeStderrLine(line) {
  process.stderr.write(line.endsWith("\n") ? line : `${line}
`);
}
__name(writeStderrLine, "writeStderrLine");
function stampCliEntryEnv(entryPath) {
  if (process.env["QWEN_CODE_CLI"]) {
    return;
  }
  let entry = entryPath;
  if (entry === void 0) {
    const entryUrl = new URL("../index.js", import.meta.url);
    if (entryUrl.protocol !== "file:") {
      return;
    }
    entry = fileURLToPath(entryUrl);
  }
  if (existsSync(entry)) {
    try {
      accessSync(entry, constants.X_OK);
    } catch {
      try {
        chmodSync(entry, statSync(entry).mode | 73);
      } catch {
      }
    }
    process.env["QWEN_CODE_CLI"] = entry;
  }
}
__name(stampCliEntryEnv, "stampCliEntryEnv");
async function runCliEntryPoint(run = runCliEntry, handleError = handleCriticalError) {
  stampCliEntryEnv();
  process.on("uncaughtException", handleUncaughtException);
  try {
    await run();
  } catch (error) {
    try {
      await handleError(error);
    } catch (handlerError) {
      writeStderrLine("An unexpected critical error occurred:");
      writeStderrLine("Original error:");
      if (error instanceof Error) {
        writeStderrLine(error.stack ?? error.message);
      } else {
        writeStderrLine(String(error));
      }
      writeStderrLine("Error handler failed:");
      if (handlerError instanceof Error) {
        writeStderrLine(handlerError.stack ?? handlerError.message);
      } else {
        writeStderrLine(String(handlerError));
      }
      process.exit(1);
    }
  }
}
__name(runCliEntryPoint, "runCliEntryPoint");
var isMain = false;
if (process.argv[1] !== void 0) {
  try {
    const argvRealHref = pathToFileURL(realpathSync(process.argv[1])).href;
    const argvHref = pathToFileURL(process.argv[1]).href;
    isMain = import.meta.url === argvHref || import.meta.url === argvRealHref;
  } catch {
    isMain = import.meta.url === pathToFileURL(process.argv[1]).href;
  }
}
if (isMain) {
  void runCliEntryPoint();
}
export {
  MCP_COMMANDS,
  TOP_LEVEL_COMMANDS,
  handleCriticalError,
  handleUncaughtException,
  isExpectedPtyRaceError,
  resolveBootstrapRoute,
  runCliEntry,
  runCliEntryPoint,
  stampCliEntryEnv
};
/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
