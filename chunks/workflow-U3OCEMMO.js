// Force strict mode and setup for ESM
"use strict";
import {
  isSymlinkedRoot,
  resolveSavedWorkflowScript,
  writeWorkflowSnapshot
} from "./chunk-UUYA6KRB.js";
import {
  AgentEventEmitter,
  FileDiscoveryService,
  attachJsonlTranscriptWriter,
  buildAgentTranscriptAttach,
  getRuleDisplayName,
  isTerminalWorkflowStatus,
  rebuildToolRegistryOnOverride,
  resolveExternalWorktreeDir,
  resolveToolName,
  toModelVisibleSubagentResult
} from "./chunk-TR4Z64H2.js";
import "./chunk-GOFAQQZA.js";
import "./chunk-5M6IDOMF.js";
import "./chunk-TWPJO254.js";
import "./chunk-CQ35AJ4Z.js";
import "./chunk-EKSCLBBF.js";
import "./chunk-P2SU6ZTI.js";
import "./chunk-IZIVM7LZ.js";
import "./chunk-SFPGAQUL.js";
import {
  parsePositiveIntegerEnv
} from "./chunk-6PVPNMXU.js";
import "./chunk-JB4JIVTJ.js";
import "./chunk-IRH27ZC2.js";
import "./chunk-QHWCP53L.js";
import "./chunk-D5LUXLUH.js";
import "./chunk-O6GEWCJA.js";
import "./chunk-T26EAKDL.js";
import {
  GitWorktreeService,
  generateAgentWorktreeSlug,
  writeWorktreeSessionMarker
} from "./chunk-EOGELB3H.js";
import "./chunk-CPBF7KYF.js";
import "./chunk-EFUM7RVY.js";
import "./chunk-TTX2JUE6.js";
import "./chunk-43GGFFLY.js";
import "./chunk-SMPR7SPO.js";
import "./chunk-JWALNCLT.js";
import "./chunk-NIFYWDYN.js";
import "./chunk-3AFMQUTI.js";
import "./chunk-WKK5BQNP.js";
import {
  SUBAGENT_PLAN_LIFECYCLE_TOOLS
} from "./chunk-V5J4J5TP.js";
import "./chunk-MLXTMF7H.js";
import "./chunk-NAVJD2PQ.js";
import "./chunk-3JGZSIDA.js";
import "./chunk-VVW4ZNFY.js";
import "./chunk-QHMLYMMS.js";
import "./chunk-7DJCPZE3.js";
import "./chunk-P3QQPMQA.js";
import "./chunk-HVEYF6VT.js";
import "./chunk-SAH4BD2J.js";
import "./chunk-PDMJ3KGS.js";
import {
  runWithAgentContext
} from "./chunk-CMHFCLBU.js";
import "./chunk-S6LOFUVP.js";
import "./chunk-2LD5U7Q3.js";
import {
  createAbortController,
  createChildAbortController
} from "./chunk-DJ2GSRLV.js";
import "./chunk-J2OSJFP3.js";
import "./chunk-K2OJUPOE.js";
import "./chunk-CFKIH3D3.js";
import "./chunk-4FTKQNWJ.js";
import "./chunk-Y3QL45LS.js";
import {
  WorkflowRunEvent,
  logWorkflowRun,
  read,
  writeLine
} from "./chunk-M6PIAXHA.js";
import "./chunk-YRLW2MSX.js";
import "./chunk-VGC4I5JJ.js";
import {
  isWithinRoot
} from "./chunk-3I6UTTDX.js";
import "./chunk-6PJOTWAN.js";
import "./chunk-BWORX6FA.js";
import "./chunk-WZAD4ZNJ.js";
import "./chunk-FPGTNKCP.js";
import "./chunk-6DIGWMGT.js";
import "./chunk-AKMTC2QO.js";
import "./chunk-XZA32HII.js";
import "./chunk-23RFD54N.js";
import "./chunk-PPKZ7JOE.js";
import "./chunk-HHJLM3WQ.js";
import {
  stripAnsiAndControl
} from "./chunk-L6BZRIUL.js";
import "./chunk-74TONY4F.js";
import {
  SyntheticOutputTool
} from "./chunk-XF63PKEN.js";
import "./chunk-CAJTKR6W.js";
import "./chunk-ZU4UDIWX.js";
import "./chunk-AQ37AY7B.js";
import {
  WorkspaceContext
} from "./chunk-PDQGMSZK.js";
import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  ToolDisplayNames,
  ToolNames
} from "./chunk-UTLCH2FK.js";
import {
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
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/tools/workflow/workflow.ts
init_esbuild_shims();

// packages/core/src/agents/runtime/workflow-sandbox.ts
init_esbuild_shims();
import * as vm from "node:vm";

// packages/core/src/agents/runtime/workflow-meta-literal.ts
init_esbuild_shims();
var WorkflowMetaSyntaxError = class extends Error {
  static {
    __name(this, "WorkflowMetaSyntaxError");
  }
  index;
  constructor(message, index) {
    super(message);
    this.name = "WorkflowMetaSyntaxError";
    this.index = index;
  }
};
function parseWorkflowMetaLiteral(source) {
  const parser = new MetaLiteralParser(source);
  parser.skipTrivia();
  const value = parser.parseValue(0);
  parser.skipTrivia();
  if (parser.index < source.length) {
    throw parser.fail("unexpected trailing content");
  }
  return value;
}
__name(parseWorkflowMetaLiteral, "parseWorkflowMetaLiteral");
var MAX_DEPTH = 32;
var WHITESPACE = /* @__PURE__ */ new Set([" ", "	", "\n", "\r", "\f", "\v", "\xA0", "\uFEFF"]);
var ID_START = /[A-Za-z_$]/;
var ID_PART = /[A-Za-z0-9_$]/;
var MetaLiteralParser = class {
  constructor(src) {
    this.src = src;
  }
  static {
    __name(this, "MetaLiteralParser");
  }
  index = 0;
  fail(message) {
    const from = Math.max(0, this.index - 24);
    const snippet = this.src.slice(from, this.index + 24).replace(/\s+/g, " ").trim();
    return new WorkflowMetaSyntaxError(
      `${message} at position ${this.index} (near "${snippet}"). meta must be a plain object literal \u2014 strings, numbers, booleans, null, arrays and objects only, with no variables, function calls, spreads, accessors or template substitutions.`,
      this.index
    );
  }
  skipTrivia() {
    for (; ; ) {
      while (this.index < this.src.length && WHITESPACE.has(this.src[this.index])) {
        this.index++;
      }
      if (this.src.startsWith("//", this.index)) {
        let end = this.index + 2;
        while (end < this.src.length && !"\n\r\u2028\u2029".includes(this.src[end])) {
          end++;
        }
        if (this.src[end] === "\r" && this.src[end + 1] === "\n") end++;
        this.index = end < this.src.length ? end + 1 : this.src.length;
        continue;
      }
      if (this.src.startsWith("/*", this.index)) {
        const end = this.src.indexOf("*/", this.index + 2);
        if (end === -1) throw this.fail("unterminated comment");
        this.index = end + 2;
        continue;
      }
      return;
    }
  }
  parseValue(depth) {
    if (depth > MAX_DEPTH) throw this.fail("meta literal is nested too deeply");
    this.skipTrivia();
    const c = this.src[this.index];
    if (c === void 0) throw this.fail("unexpected end of meta literal");
    if (c === "{") return this.parseObject(depth);
    if (c === "[") return this.parseArray(depth);
    if (c === '"' || c === "'" || c === "`") return this.parseString();
    if (c === "-" || c >= "0" && c <= "9") return this.parseNumber();
    if (this.src.startsWith("true", this.index)) return this.word("true", true);
    if (this.src.startsWith("false", this.index)) {
      return this.word("false", false);
    }
    if (this.src.startsWith("null", this.index)) return this.word("null", null);
    if (c === "/")
      throw this.fail("regular expressions are not allowed in meta");
    throw this.fail("unsupported value");
  }
  word(literal, value) {
    const after = this.src[this.index + literal.length];
    if (after !== void 0 && ID_PART.test(after)) {
      throw this.fail("unsupported value");
    }
    this.index += literal.length;
    return value;
  }
  parseObject(depth) {
    this.index++;
    const out = /* @__PURE__ */ Object.create(null);
    for (; ; ) {
      this.skipTrivia();
      const c = this.src[this.index];
      if (c === "}") {
        this.index++;
        return out;
      }
      if (c === void 0) throw this.fail("unterminated object");
      if (this.src.startsWith("...", this.index)) {
        throw this.fail("spread is not allowed in meta");
      }
      if (c === "[") throw this.fail("computed keys are not allowed in meta");
      const key = this.parseKey();
      this.skipTrivia();
      if (this.src[this.index] === "(") {
        throw this.fail("methods are not allowed in meta");
      }
      if (this.src[this.index] !== ":")
        throw this.fail('expected ":" after key');
      this.index++;
      out[key] = this.parseValue(depth + 1);
      this.skipTrivia();
      if (this.src[this.index] === ",") {
        this.index++;
        continue;
      }
      if (this.src[this.index] === "}") {
        this.index++;
        return out;
      }
      throw this.fail('expected "," or "}"');
    }
  }
  parseKey() {
    const c = this.src[this.index];
    if (c === '"' || c === "'" || c === "`") return this.parseString();
    if (c !== void 0 && ID_START.test(c)) {
      const start = this.index;
      while (this.index < this.src.length && ID_PART.test(this.src[this.index])) {
        this.index++;
      }
      const word = this.src.slice(start, this.index);
      if (word === "get" || word === "set" || word === "async") {
        const save = this.index;
        this.skipTrivia();
        const next = this.src[this.index];
        const startsPropertyName = next !== void 0 && (ID_START.test(next) || next === '"' || next === "'" || next === "[");
        this.index = save;
        if (startsPropertyName) {
          throw this.fail(
            word === "async" ? "async members are not allowed in meta" : `${word}ters are not allowed in meta`
          );
        }
      }
      return word;
    }
    throw this.fail("expected a property name");
  }
  parseArray(depth) {
    this.index++;
    const out = [];
    for (; ; ) {
      this.skipTrivia();
      const c = this.src[this.index];
      if (c === "]") {
        this.index++;
        return out;
      }
      if (c === void 0) throw this.fail("unterminated array");
      if (this.src.startsWith("...", this.index)) {
        throw this.fail("spread is not allowed in meta");
      }
      if (c === ",") throw this.fail("missing array element");
      out.push(this.parseValue(depth + 1));
      this.skipTrivia();
      if (this.src[this.index] === ",") {
        this.index++;
        continue;
      }
      if (this.src[this.index] === "]") {
        this.index++;
        return out;
      }
      throw this.fail('expected "," or "]"');
    }
  }
  parseString() {
    const quote = this.src[this.index++];
    let out = "";
    for (; ; ) {
      const c = this.src[this.index];
      if (c === void 0) throw this.fail("unterminated string");
      if (c === quote) {
        this.index++;
        return out;
      }
      if (c === "\n" || c === "\r") {
        if (quote !== "`") throw this.fail("unterminated string");
        if (c === "\r") {
          this.index++;
          if (this.src[this.index] === "\n") this.index++;
          out += "\n";
          continue;
        }
      }
      if (quote === "`" && c === "$" && this.src[this.index + 1] === "{") {
        throw this.fail("template substitutions are not allowed in meta");
      }
      if (c === "\\") {
        out += this.parseEscape();
        continue;
      }
      out += c;
      this.index++;
    }
  }
  parseEscape() {
    this.index++;
    const c = this.src[this.index++];
    switch (c) {
      case "n":
        return "\n";
      case "t":
        return "	";
      case "r":
        return "\r";
      case "b":
        return "\b";
      case "f":
        return "\f";
      case "v":
        return "\v";
      case "0":
        if (/[0-9]/.test(this.src[this.index] ?? "")) {
          throw this.fail("octal escapes are not allowed in meta");
        }
        return "\0";
      case "x": {
        const hex = this.src.slice(this.index, this.index + 2);
        if (!/^[0-9a-fA-F]{2}$/.test(hex)) {
          throw this.fail("invalid \\x escape");
        }
        this.index += 2;
        return String.fromCharCode(parseInt(hex, 16));
      }
      case "u": {
        if (this.src[this.index] === "{") {
          const end = this.src.indexOf("}", this.index);
          const hex2 = end === -1 ? "" : this.src.slice(this.index + 1, end);
          if (!/^[0-9a-fA-F]{1,6}$/.test(hex2)) {
            throw this.fail("invalid \\u{...} escape");
          }
          const code = parseInt(hex2, 16);
          if (code > 1114111) throw this.fail("invalid \\u{...} escape");
          this.index = end + 1;
          return String.fromCodePoint(code);
        }
        const hex = this.src.slice(this.index, this.index + 4);
        if (!/^[0-9a-fA-F]{4}$/.test(hex)) {
          throw this.fail("invalid \\u escape");
        }
        this.index += 4;
        return String.fromCharCode(parseInt(hex, 16));
      }
      case "\n":
        return "";
      // line continuation
      case "\r":
        if (this.src[this.index] === "\n") this.index++;
        return "";
      case "\u2028":
      case "\u2029":
        return "";
      case void 0:
        throw this.fail("unterminated escape sequence");
      default:
        return c;
    }
  }
  parseNumber() {
    const start = this.index;
    if (this.src[this.index] === "-") this.index++;
    while (this.index < this.src.length && /[0-9]/.test(this.src[this.index])) {
      this.index++;
    }
    if (this.src[this.index] === ".") {
      this.index++;
      while (this.index < this.src.length && /[0-9]/.test(this.src[this.index])) {
        this.index++;
      }
    }
    if (this.src[this.index] === "e" || this.src[this.index] === "E") {
      this.index++;
      if (this.src[this.index] === "+" || this.src[this.index] === "-") {
        this.index++;
      }
      while (this.index < this.src.length && /[0-9]/.test(this.src[this.index])) {
        this.index++;
      }
    }
    const after = this.src[this.index];
    if (after !== void 0 && ID_PART.test(after)) {
      throw this.fail("unsupported numeric literal");
    }
    const text = this.src.slice(start, this.index);
    const value = Number(text);
    if (text.length === 0 || !Number.isFinite(value)) {
      throw this.fail("unsupported numeric literal");
    }
    return value;
  }
};

// packages/core/src/agents/runtime/workflow-sandbox.ts
function findMetaBlockBounds(source) {
  const re = /^\s*export\s+const\s+meta\s*=\s*\{/;
  const match = re.exec(source);
  if (!match) return null;
  const exportIdx = match.index;
  const startBrace = source.indexOf("{", exportIdx);
  let depth = 1;
  let i = startBrace + 1;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    const next = source[i + 1];
    if (ch === "/" && next === "/") {
      i += 2;
      while (i < source.length && source[i] !== "\n") i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < source.length && !(source[i] === "*" && source[i + 1] === "/"))
        i++;
      i += 2;
      continue;
    }
    if (ch === "/" && isRegexContext(source, i)) {
      i++;
      let inClass = false;
      while (i < source.length && (inClass || source[i] !== "/") && source[i] !== "\n") {
        if (source[i] === "\\") i += 2;
        else if (source[i] === "[") {
          inClass = true;
          i++;
        } else if (source[i] === "]") {
          inClass = false;
          i++;
        } else {
          i++;
        }
      }
      i++;
      while (i < source.length && /[gimsuy]/.test(source[i])) i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch;
      i++;
      while (i < source.length && source[i] !== q) {
        if (source[i] === "\\") i++;
        i++;
      }
      i++;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    i++;
  }
  if (depth !== 0) {
    throw new Error(
      "unbalanced braces in export const meta declaration \u2014 the workflow script cannot be safely stripped. Check the meta block syntax."
    );
  }
  const endBraceIncl = i - 1;
  while (i < source.length && /[\s;]/.test(source[i])) i++;
  return { exportIdx, startBrace, endBraceIncl, afterMeta: i };
}
__name(findMetaBlockBounds, "findMetaBlockBounds");
function extractAndStripMeta(source) {
  const bounds = findMetaBlockBounds(source);
  if (!bounds) return { stripped: source, meta: null };
  const metaSource = source.slice(bounds.startBrace, bounds.endBraceIncl + 1);
  const stripped = source.slice(0, bounds.exportIdx) + source.slice(bounds.afterMeta);
  let raw;
  try {
    raw = parseWorkflowMetaLiteral(metaSource);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`invalid meta object literal: ${msg}`);
  }
  const meta = validateMeta(raw);
  return { stripped, meta };
}
__name(extractAndStripMeta, "extractAndStripMeta");
var WORKFLOW_SCRIPT_FILENAME = "workflow.js";
function wrapWorkflowBody(strippedSource) {
  return `(async () => {'use strict';
${strippedSource}
})()`;
}
__name(wrapWorkflowBody, "wrapWorkflowBody");
function compileWorkflowScript(scriptSource) {
  const { stripped, meta } = extractAndStripMeta(scriptSource);
  const bounds = findMetaBlockBounds(scriptSource);
  const compilable = bounds ? scriptSource.slice(0, bounds.exportIdx) + scriptSource.slice(bounds.exportIdx, bounds.afterMeta).replace(/[^\r\n\u2028\u2029]/g, " ") + scriptSource.slice(bounds.afterMeta) : stripped;
  const script = new vm.Script(wrapWorkflowBody(compilable), {
    filename: WORKFLOW_SCRIPT_FILENAME
  });
  return { script, meta };
}
__name(compileWorkflowScript, "compileWorkflowScript");
var COMPILE_ERROR_LINE_WIDTH = 80;
function describeWorkflowCompileError(error, authorLineCount) {
  const err = error instanceof Error ? error : new Error(String(error));
  const stack = typeof err.stack === "string" ? err.stack : "";
  const frame = [];
  for (const line of stack.split("\n")) {
    if (frame.length >= 3 && /^\s+at\s/.test(line)) break;
    frame.push(line);
  }
  const header = frame[0] ?? "";
  const match = /^.*?:(\d+)$/.exec(header);
  if (frame.length < 3 || !match) {
    return err.message;
  }
  const bodyLine = Number(match[1]) - 1;
  if (bodyLine < 1) return err.message;
  if (bodyLine > authorLineCount) {
    return "The script ends with unmatched or incomplete syntax. Check parentheses, brackets, braces, quotes, and template literals near the end.";
  }
  const rendered = clampSourceFrame(frame[1] ?? "", frame[2] ?? "");
  const tail = frame.slice(3).filter((l) => l.trim().length > 0).join("\n");
  return [`line ${bodyLine}`, rendered, tail].filter(Boolean).join("\n");
}
__name(describeWorkflowCompileError, "describeWorkflowCompileError");
function clampSourceFrame(sourceLine, caretLine) {
  if (sourceLine.length <= COMPILE_ERROR_LINE_WIDTH) {
    return `${sourceLine}
${caretLine}`;
  }
  const caret = /\^+/.exec(caretLine);
  if (!caret) return "";
  const caretCol = caret.index;
  const start = Math.max(
    0,
    Math.min(
      caretCol - Math.floor(COMPILE_ERROR_LINE_WIDTH / 2),
      sourceLine.length - COMPILE_ERROR_LINE_WIDTH
    )
  );
  const prefix = start > 0 ? "\u2026" : "";
  const window = sourceLine.slice(start, start + COMPILE_ERROR_LINE_WIDTH);
  const suffix = start + COMPILE_ERROR_LINE_WIDTH < sourceLine.length ? "\u2026" : "";
  const visibleCaretStart = Math.max(caretCol, start);
  const visibleCaretEnd = Math.min(
    caretCol + caret[0].length,
    start + COMPILE_ERROR_LINE_WIDTH
  );
  const shiftedCaret = " ".repeat(prefix.length + visibleCaretStart - start) + "^".repeat(visibleCaretEnd - visibleCaretStart);
  return `${prefix}${window}${suffix}
${shiftedCaret}`;
}
__name(clampSourceFrame, "clampSourceFrame");
function validateMeta(value) {
  if (value === null || typeof value !== "object") {
    throw new Error("meta must be an object");
  }
  const obj = value;
  if (typeof obj["name"] !== "string" || obj["name"].length === 0) {
    throw new Error("meta.name must be a non-empty string");
  }
  if (typeof obj["description"] !== "string" || obj["description"].length === 0) {
    throw new Error("meta.description must be a non-empty string");
  }
  if (obj["whenToUse"] !== void 0 && typeof obj["whenToUse"] !== "string") {
    throw new Error("meta.whenToUse must be a string");
  }
  let phases;
  if (obj["phases"] !== void 0) {
    if (!Array.isArray(obj["phases"])) {
      throw new Error("meta.phases must be an array");
    }
    phases = [];
    for (const p of obj["phases"]) {
      if (p === null || typeof p !== "object") {
        throw new Error("meta.phases entries must be objects");
      }
      const ph = p;
      if (typeof ph["title"] !== "string" || ph["title"].length === 0) {
        throw new Error("meta.phases[].title must be a non-empty string");
      }
      const phase = {
        title: ph["title"]
      };
      if (ph["detail"] !== void 0) {
        if (typeof ph["detail"] !== "string") {
          throw new Error("meta.phases[].detail must be a string");
        }
        phase.detail = ph["detail"];
      }
      if (ph["model"] !== void 0) {
        if (typeof ph["model"] !== "string") {
          throw new Error("meta.phases[].model must be a string");
        }
        phase.model = ph["model"];
      }
      phases.push(phase);
    }
  }
  const out = {
    name: obj["name"],
    description: obj["description"]
  };
  if (obj["whenToUse"] !== void 0) {
    out.whenToUse = obj["whenToUse"];
  }
  if (phases !== void 0) {
    out.phases = phases;
  }
  return out;
}
__name(validateMeta, "validateMeta");
function isRegexContext(source, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(source[j])) j--;
  if (j < 0) return true;
  const prev = source[j];
  return /[{[(,;:=!&|?+\-*/%^~<>]/.test(prev);
}
__name(isRegexContext, "isRegexContext");
var debugLogger = createDebugLogger("WORKFLOW");
var MAX_LOG_LINES = 1e4;
var MAX_PHASE_ENTRIES = 1e4;
var ARGS_MAX_DEPTH = 64;
var DEFAULT_MAX_WALL_CLOCK_MS = 30 * 60 * 1e3;
function resolveMaxWallClockMs(opts) {
  if (typeof opts.maxWallClockMs === "number" && opts.maxWallClockMs > 0) {
    return opts.maxWallClockMs;
  }
  const envSec = Number(process.env["QWEN_CODE_MAX_WORKFLOW_SECONDS"]);
  if (Number.isFinite(envSec) && envSec > 0) return envSec * 1e3;
  return DEFAULT_MAX_WALL_CLOCK_MS;
}
__name(resolveMaxWallClockMs, "resolveMaxWallClockMs");
var WallClockWatchdog = class {
  constructor(budgetMs, onFire) {
    this.onFire = onFire;
    this.remainingMs = budgetMs;
    this.arm();
  }
  static {
    __name(this, "WallClockWatchdog");
  }
  timer;
  remainingMs;
  armedAt = 0;
  paused = false;
  stopped = false;
  pause() {
    if (this.stopped || this.paused || this.timer === void 0) return;
    this.paused = true;
    clearTimeout(this.timer);
    this.timer = void 0;
    this.remainingMs = Math.max(
      0,
      this.remainingMs - (performance.now() - this.armedAt)
    );
  }
  resume() {
    if (this.stopped || !this.paused) return;
    this.paused = false;
    this.arm();
  }
  stop() {
    this.stopped = true;
    if (this.timer !== void 0) clearTimeout(this.timer);
    this.timer = void 0;
  }
  arm() {
    this.armedAt = performance.now();
    this.timer = setTimeout(() => {
      this.stopped = true;
      this.timer = void 0;
      this.onFire();
    }, this.remainingMs);
    this.timer.unref?.();
  }
};
function validateArgs(val, depth = 0, seen = /* @__PURE__ */ new WeakSet()) {
  if (depth > ARGS_MAX_DEPTH) {
    throw new Error(
      `WorkflowSandbox: args exceeded max nesting depth of ${ARGS_MAX_DEPTH}`
    );
  }
  if (val === null) return;
  const t = typeof val;
  if (t === "function") {
    throw new Error(
      "WorkflowSandbox: args must be JSON-serializable (functions are not allowed)."
    );
  }
  if (t === "bigint") {
    throw new Error(
      "WorkflowSandbox: args must be JSON-serializable (BigInt is not allowed \u2014 pass as string)."
    );
  }
  if (t !== "object") return;
  const obj = val;
  if (seen.has(obj)) {
    throw new Error(
      "WorkflowSandbox: args must be JSON-serializable (circular reference detected)."
    );
  }
  seen.add(obj);
  if (Array.isArray(val)) {
    for (const item of val) validateArgs(item, depth + 1, seen);
  } else {
    for (const v of Object.values(val)) {
      validateArgs(v, depth + 1, seen);
    }
  }
}
__name(validateArgs, "validateArgs");
function createWorkflowSandbox(opts) {
  const phases = [];
  const logs = [];
  const emitLog = /* @__PURE__ */ __name((line) => {
    try {
      opts.emitter?.logAppended?.(line);
    } catch (e) {
      debugLogger.warn("emitter.logAppended threw:", e);
    }
  }, "emitLog");
  const safeLog = /* @__PURE__ */ __name((msg, notify = true) => {
    if (logs.length < MAX_LOG_LINES) {
      const line = String(msg);
      logs.push(line);
      if (notify) emitLog(line);
    } else if (logs.length === MAX_LOG_LINES) {
      const line = `[workflow log truncated at ${MAX_LOG_LINES} lines]`;
      logs.push(line);
      if (notify) emitLog(line);
    }
  }, "safeLog");
  const safePhase = /* @__PURE__ */ __name((title) => {
    if (phases.length < MAX_PHASE_ENTRIES) {
      const t = stripAnsiAndControl(String(title)).slice(0, 200) || "phase";
      if (phases[phases.length - 1] === t) return;
      phases.push(t);
      try {
        opts.emitter?.phaseStarted?.(t);
      } catch (e) {
        debugLogger.warn("emitter.phaseStarted threw:", e);
      }
    } else if (phases.length === MAX_PHASE_ENTRIES) {
      phases.push(
        `[workflow phases truncated at ${MAX_PHASE_ENTRIES} entries]`
      );
    }
  }, "safePhase");
  if (opts.args !== void 0) validateArgs(opts.args);
  const argsJson = opts.args === void 0 ? null : JSON.stringify(opts.args);
  const unconsumedRoots = /* @__PURE__ */ new Map();
  const unconsumedRejections = /* @__PURE__ */ new Map();
  let nextUnconsumedId = 1;
  let unconsumedSettled = false;
  let mirroredEscapeKeys = /* @__PURE__ */ new Set();
  const unconsumedRejectionLine = /* @__PURE__ */ __name((rec) => {
    if (rec.dispatchFailed) {
      return rec.isRoot ? "dispatch failed (result not consumed): " + rec.msg : "dispatch failed (rejection not handled): " + rec.msg;
    }
    return "script handler failed (rejection not handled): " + rec.msg;
  }, "unconsumedRejectionLine");
  const bridge = {
    argsJson,
    pushPhase: safePhase,
    pushLog: safeLog,
    lastPhase: /* @__PURE__ */ __name(() => phases[phases.length - 1], "lastPhase"),
    hostAgent: opts.dispatch,
    // PR #4947 R2 T7 (qwen-code-ci-bot): host-side log hook for reviveInRealm's
    // catch path. Mirrors the rejection-logging in settleToNullArray so an
    // operator running with debug logging can distinguish "thunk rejected"
    // (settleToNullArray.warn) from "thunk resolved to a non-JSON-serializable
    // value" (this warn). Receives only primitive strings/numbers — the bridge
    // contract forbids host objects crossing back to the script.
    logRevivalFailure: /* @__PURE__ */ __name((idx, reason) => {
      debugLogger.warn(
        `Workflow result revival failed at index ${idx}: ${reason}; slot set to null (non-JSON-serializable thunk return).`
      );
    }, "logRevivalFailure"),
    // --- Unconsumed-rejection mirror bookkeeping ---
    wfRegisterRoot: /* @__PURE__ */ __name(() => {
      const id = nextUnconsumedId++;
      unconsumedRoots.set(id, { rejectionHandled: false, adoptedOut: false });
      return id;
    }, "wfRegisterRoot"),
    wfMarkRejectionHandled: /* @__PURE__ */ __name((rootId) => {
      const root = unconsumedRoots.get(rootId);
      if (root) root.rejectionHandled = true;
    }, "wfMarkRejectionHandled"),
    wfIsRootHandled: /* @__PURE__ */ __name((rootId) => unconsumedRoots.get(rootId)?.rejectionHandled === true, "wfIsRootHandled"),
    wfMarkAdopted: /* @__PURE__ */ __name((rootId) => {
      const root = unconsumedRoots.get(rootId);
      if (root) root.adoptedOut = true;
    }, "wfMarkAdopted"),
    runId: opts.runId ?? "",
    wfReportUnconsumed: /* @__PURE__ */ __name((rootId, isRoot, dispatchFailed, msg) => {
      if (unconsumedSettled) {
        const rec = {
          rootId,
          isRoot,
          dispatchFailed,
          msg
        };
        const rootState = unconsumedRoots.get(rootId);
        if (!rootState?.rejectionHandled && !(dispatchFailed && rootState?.adoptedOut)) {
          safeLog(unconsumedRejectionLine(rec));
        }
        return 0;
      }
      const id = nextUnconsumedId++;
      unconsumedRejections.set(id, { rootId, isRoot, dispatchFailed, msg });
      return id;
    }, "wfReportUnconsumed"),
    wfClearUnconsumed: /* @__PURE__ */ __name((id) => {
      unconsumedRejections.delete(id);
    }, "wfClearUnconsumed"),
    // R10-1: teardown discrimination cannot key on the error name alone.
    // The dominant in-flight cancellation path (controller.abort() →
    // subagent returns terminateMode=CANCELLED → runSingleDispatch throws
    // a PLAIN Error) never produces an 'AbortError', so the mirror would
    // log a spurious dispatch failure for a correctly-cancelled run. Once
    // the run's abort signal has fired, the run is already settling as
    // cancelled / timed-out — every rejection still crossing the boundary
    // is teardown noise regardless of its shape.
    isRunAborted: /* @__PURE__ */ __name(() => opts.abortOnTimeout?.signal.aborted === true, "isRunAborted"),
    // The truthy flags distinguish "injected" from "default stub" inside the
    // init script without leaking the host function itself when not used.
    hasParallel: !!opts.parallel,
    hasPipeline: !!opts.pipeline,
    hasWorkflow: !!opts.workflow,
    hasBudget: !!opts.budget,
    hostParallel: opts.parallel,
    hostPipeline: opts.pipeline,
    hostWorkflow: opts.workflow,
    budgetTotal: opts.budget ? opts.budget.total : null,
    hostBudgetSpent: opts.budget ? opts.budget.spent.bind(opts.budget) : null,
    hostBudgetRemaining: opts.budget ? opts.budget.remaining.bind(opts.budget) : null
  };
  Object.setPrototypeOf(bridge, null);
  const sandboxGlobals = Object.assign(
    /* @__PURE__ */ Object.create(null),
    { __workflowBridge: bridge }
  );
  const ctx = vm.createContext(sandboxGlobals);
  vm.runInContext(
    `(() => {
      const __b = globalThis.__workflowBridge;
      delete globalThis.__workflowBridge;

      // --- Math (vm-realm, random throws) ---
      const realMath = Math;
      const safeMath = Object.create(null);
      for (const k of Object.getOwnPropertyNames(realMath)) {
        if (k === 'random' || k === 'constructor') continue;
        safeMath[k] = realMath[k];
      }
      safeMath.random = () => {
        throw new Error(
          'Math.random() is unavailable in workflow scripts (breaks resume). ' +
          'For N independent samples, include the index in the agent label or prompt.'
        );
      };
      globalThis.Math = safeMath;

      // --- Date (vm-realm function that throws on any access) ---
      const dateMsg = 'Date.now() / new Date() are unavailable in workflow ' +
        'scripts (breaks resume). Stamp results after the workflow returns, ' +
        'or pass timestamps via args.';
      const safeDate = function Date() { throw new Error(dateMsg); };
      safeDate.now = () => { throw new Error(dateMsg); };
      safeDate.UTC = () => { throw new Error(dateMsg); };
      safeDate.parse = () => { throw new Error(dateMsg); };
      Object.setPrototypeOf(safeDate, null);
      Object.defineProperty(safeDate, 'constructor', {
        value: undefined, writable: false, configurable: false,
      });
      globalThis.Date = safeDate;

      // --- args (parsed via vm-realm JSON \u2192 vm-realm objects/arrays) ---
      // FIX-Round1-T2: vm-realm arrays keep their vm-realm Array.prototype,
      // so for...of, .map, .forEach, spread, destructuring all work \u2014 and
      // their inherited methods' constructors are vm-realm Function, which
      // cannot reach host process.
      globalThis.args = __b.argsJson === null ? undefined : JSON.parse(__b.argsJson);

      // --- Wrap a host async function so it returns a vm-realm Promise ---
      // FIX-Round1-T1/T8/T14: success and failure both cross the boundary
      // as vm-realm values: resolve with the host's value (a primitive
      // string for dispatch; vm-realm arrays for parallel/pipeline because
      // those wrappers will produce vm-realm results); reject with a
      // freshly-constructed vm-realm Error so e.constructor.constructor
      // stays in the vm realm.
      // Dispatch promises are ObservedPromise instances (a vm-realm
      // Promise subclass). Its then override marks the result consumed
      // and re-attaches the teardown observer to the derived promise, so
      // script-derived chains (agent(...).then(...), await, and the
      // ELEMENTS of static-combinator aggregates \u2014 everything that
      // funnels through then) stay observed at every depth. The
      // AGGREGATES of Promise.all/race/any are built by the native
      // statics and never pass through the observed then, so those
      // statics are wrapped explicitly below (observeAggregate).
      // Without this, a correctly-cancelled run holding a pending derived
      // chain fired a process-level unhandledRejection even though the
      // bare dispatch promise was observed.
      //
      // Unconsumed rejections of an observed node are recorded through
      // the bridge and mirrored into the run log at run settlement (a
      // later consumption clears the record first) \u2014 a dispatch refused
      // at the entry gate (budget / agent cap) or failing mid-run reaches
      // no other surface, so without the mirror the failure leaves no
      // log, alarm, or telemetry.
      function mapDispatchError(hostErr) {
        var msg;
        try {
          msg = (hostErr && hostErr.message != null)
            ? String(hostErr.message)
            : String(hostErr);
        } catch (e) {
          msg = '[unserializable rejection value]';
        }
        const vmErr = new Error(msg);
        // Teardown discrimination at the host boundary \u2014 before the error
        // is flattened into a vm-realm Error. Two shapes count as
        // teardown: an error NAMED 'AbortError' (the scheduler's
        // abortError() DOMException), and ANY rejection that crosses
        // after the run's abort signal has fired \u2014 the dominant
        // cancellation path rejects with a plain Error ('did not complete
        // (terminate mode: CANCELLED).'), which a name-only match would
        // mirror as a spurious dispatch failure on a correctly-cancelled
        // run. Matching the name here (rather than the message text)
        // still suppresses teardown noise without swallowing genuine
        // failures whose message merely contains 'aborted' (e.g. a
        // network-layer 'connection aborted by peer').
        var isAbort = false;
        try {
          isAbort = !!(hostErr && hostErr.name === 'AbortError');
        } catch (e) {
          isAbort = false;
        }
        if (isAbort || __b.isRunAborted()) vmErr.__wfAbort = true;
        vmErr.__wfDispatchFailed = true;
        return vmErr;
      }
      function readFlag(value, name) {
        try {
          return !!(value && value[name]);
        } catch (e) {
          return false;
        }
      }
      function observeDispatch(promise) {
        // Direct native-then call: routing through ObservedPromise.then
        // would mark the promise consumed and recurse the observer. The
        // observer body must be exception-safe on ANY rejection value:
        // a script handler can throw an exotic value (a message getter
        // that throws, a Proxy with throwing traps), and an observer
        // killed mid-body would turn the very rejection it watches into
        // a process-level unhandledRejection \u2014 the exact failure class
        // the observer exists to remove.
        Promise.prototype.then.call(promise, undefined, function (err) {
          if (promise.__wfConsumed) return;
          // R11-30: also suppress on the run-level abort state, not just
          // the rejection's own marker \u2014 a wrapped Promise.any aggregate
          // rejects with a natively built AggregateError that carries
          // neither marker, so teardown rejections of a correctly-
          // cancelled run would still be mirrored when it is unconsumed.
          if (readFlag(err, '__wfAbort') || __b.isRunAborted()) return;
          var dispatchFailed = readFlag(err, '__wfDispatchFailed');
          var errors = null;
          try {
            if (err && Array.isArray(err.errors)) errors = err.errors;
          } catch (e) {
            errors = null;
          }
          if (!dispatchFailed && errors) {
            // R11-4: Promise.any rejects with a fresh vm-realm
            // AggregateError carrying no flags; the element errors are
            // reachable on .errors with their markers preserved. Derive
            // the attribution from the causes instead of blaming the
            // script for a dispatch failure.
            for (var i = 0; i < errors.length; i++) {
              if (readFlag(errors[i], '__wfDispatchFailed')) {
                dispatchFailed = true;
                break;
              }
            }
          }
          // R11-15: cross-root suppression \u2014 aggregate roots track
          // rejectionHandled independently of their elements' roots, so
          // a forwarded dispatch failure whose originating element root
          // the script already handled must not mirror from the
          // aggregate. The element rootId is stamped in vmAsync;
          // Promise.all/race forward the element's own reason,
          // Promise.any surfaces them on .errors.
          try {
            var sourceIds = [];
            if (err && err.__wfRootId) {
              sourceIds.push(err.__wfRootId);
            } else if (errors) {
              for (var j = 0; j < errors.length; j++) {
                if (errors[j] && errors[j].__wfRootId) {
                  sourceIds.push(errors[j].__wfRootId);
                }
              }
            }
            for (var k = 0; k < sourceIds.length; k++) {
              if (
                sourceIds[k] !== promise.__wfRootId &&
                __b.wfIsRootHandled(sourceIds[k])
              ) {
                return;
              }
            }
          } catch (e) {
            // A throwing exotic value must not kill the observer; fall
            // through and mirror conservatively.
          }
          var msg;
          try {
            msg = String(err && err.message != null ? err.message : err);
          } catch (e) {
            msg = '[unserializable rejection value]';
          }
          promise.__wfUnconsumedId = __b.wfReportUnconsumed(
            promise.__wfRootId,
            promise.__wfIsRoot === true,
            dispatchFailed,
            msg,
          );
        });
      }
      // R11-3: await / Promise.resolve / returning a thenable from a
      // handler adopts an ObservedPromise through this then with the
      // adopting promise's capability (resolve, reject) pair \u2014 native
      // functions, indistinguishable from real handlers by arity. They
      // are detected by the native toString signature. Adoption
      // CONSUMES the result (a delayed adoption clears a recorded
      // verdict exactly like a delayed await) but is NOT a rejection
      // handler: the rejection transfers into the adopting promise \u2014
      // typically an async wrapper's implicit promise, which is a plain
      // vm-realm Promise the mirror cannot observe. Marking adoption as
      // handling would silently disarm the mirror for the forgotten-
      // await failure class; the run-level escape hook in the host
      // surfaces those escapes instead. Bound script functions also
      // stringify as native code; misreading one as adoption only
      // forgoes the rejectionHandled marking, never native semantics.
      function isAdoptionAttach(handler) {
        try {
          return (
            typeof handler === 'function' &&
            Function.prototype.toString
              .call(handler)
              .indexOf('[native code]') !== -1
          );
        } catch (e) {
          return false;
        }
      }
      class ObservedPromise extends Promise {
        then(onFulfilled, onRejected) {
          // R11-26: introspect the handler BEFORE any state mutation.
          // The read is guarded because a script-supplied handler can
          // be exotic (a revoked Proxy wrapping a function, a throwing
          // accessor) \u2014 an unguarded read made .then() throw
          // synchronously, something native then never does, leaving
          // the promise marked consumed with no handler attached.
          var rethrows = false;
          try {
            rethrows = !!(onRejected && onRejected.__wfRethrows);
          } catch (e) {
            rethrows = false;
          }
          this.__wfConsumed = true;
          // An attached rejection handler means the script can surface the
          // root rejection itself; the mirror stays silent for it. The
          // finally override below routes through this then with marked
          // rethrow combinators \u2014 those re-raise the rejection instead of
          // handling it, so they must NOT set the flag (marking them
          // handled would silently drop a fire-and-forget
          // agent(...).finally(...) failure). Adoption attaches count
          // as consumption only, never handling (see isAdoptionAttach):
          // they mark adoptedOut so forwarded sibling entries defer to
          // the adopting chain / escape hook instead of mirroring.
          if (isAdoptionAttach(onRejected)) {
            __b.wfMarkAdopted(this.__wfRootId);
          } else if (typeof onRejected === 'function' && !rethrows) {
            __b.wfMarkRejectionHandled(this.__wfRootId);
          }
          // A delayed consumption clears a verdict recorded at
          // rejection-settlement time, so a late-but-real await is not
          // misreported as unconsumed.
          if (this.__wfUnconsumedId !== undefined) {
            __b.wfClearUnconsumed(this.__wfUnconsumedId);
            this.__wfUnconsumedId = undefined;
          }
          const derived = super.then(onFulfilled, onRejected);
          derived.__wfRootId = this.__wfRootId;
          observeDispatch(derived);
          return derived;
        }
        finally(onFinally) {
          // Native Promise.prototype.finally calls the observed then with
          // two function combinators, indistinguishable there from a real
          // then(f, g) \u2014 which would mark the root rejection handled even
          // though finally rethrows it. Implement finally through the
          // observed then with an explicitly-marked rethrow combinator so
          // the mirror stays armed for finally-only chains.
          if (typeof onFinally !== 'function') {
            return this.then(undefined, undefined);
          }
          const onRethrow = function (err) {
            return Promise.resolve(onFinally()).then(function () {
              throw err;
            });
          };
          onRethrow.__wfRethrows = true;
          return this.then(
            function (value) {
              return Promise.resolve(onFinally()).then(function () {
                return value;
              });
            },
            onRethrow,
          );
        }
      }
      // --- Static combinators: observe the aggregate promise ---
      // Promise.all/race/any build their aggregate via the native static;
      // it never passes through the observed then, so a fire-and-forget
      // aggregate holding a failed dispatch would escape the run-log
      // mirror. While the run is live the host's adoption-escape hook
      // (R11-3) still catches and mirrors the process-level
      // unhandledRejection \u2014 a round-14 A/B confirmed that hook, not
      // this wrap, is the live-run backstop \u2014 but only with the coarse
      // '(rejection not handled)' wording, and once the run's hook is
      // detached nothing in the sandbox catches the escape. R14-A:
      // wrapping the statics gives each aggregate its own observer, so
      // consumption tracking works through the aggregate's own observed
      // then (await / .catch / .then marks it handled) and the mirror
      // itself classifies the rejection; the elements still funnel
      // through the then override via the native static's internal
      // attach, so they stay marked consumed.
      function observeAggregate(nativeAggregate) {
        const rootId = __b.wfRegisterRoot();
        const observed = new ObservedPromise(function (resolve, reject) {
          Promise.prototype.then.call(nativeAggregate, resolve, reject);
        });
        observed.__wfRootId = rootId;
        observed.__wfIsRoot = true;
        observeDispatch(observed);
        return observed;
      }
      const nativePromiseAll = Promise.all;
      const nativePromiseRace = Promise.race;
      const nativePromiseAny = Promise.any;
      // R11-16: a static called on a script-defined Promise subclass
      // must honor the species contract and return a subclass instance,
      // so non-default receivers bypass observation (their elements
      // still funnel through the observed then, and a fire-and-forget
      // dispatch failure escaping such an aggregate is still caught by
      // the host's adoption-escape hook via its stamped markers).
      Promise.all = function (items) {
        if (this !== Promise) return nativePromiseAll.call(this, items);
        return observeAggregate(nativePromiseAll.call(this, items));
      };
      Promise.race = function (items) {
        if (this !== Promise) return nativePromiseRace.call(this, items);
        return observeAggregate(nativePromiseRace.call(this, items));
      };
      Promise.any = function (items) {
        if (this !== Promise) return nativePromiseAny.call(this, items);
        return observeAggregate(nativePromiseAny.call(this, items));
      };
      function vmAsync(hostFn) {
        return function (...vmArgs) {
          const rootId = __b.wfRegisterRoot();
          const p = new ObservedPromise(function (resolve, reject) {
            function rejectMapped(hostErr) {
              const vmErr = mapDispatchError(hostErr);
              // Stamp the originating root and run BEFORE the error can
              // be forwarded into aggregate promises: the observer's
              // cross-root suppression (R11-15) reads __wfRootId and
              // the host's adoption-escape hook (R11-3) attributes by
              // __wfRunId.
              try {
                vmErr.__wfRootId = rootId;
                vmErr.__wfRunId = __b.runId;
              } catch (e) {}
              reject(vmErr);
            }
            try {
              const hostPromise = hostFn.apply(null, vmArgs);
              hostPromise.then(
                function (value) { resolve(value); },
                rejectMapped
              );
            } catch (hostErr) {
              rejectMapped(hostErr);
            }
          });
          p.__wfRootId = rootId;
          p.__wfIsRoot = true;
          observeDispatch(p);
          return p;
        };
      }

      // --- phase / log ---
      globalThis.phase = function phase(title) {
        __b.pushPhase(String(title));
      };
      globalThis.log = function log(msg) {
        __b.pushLog(msg);
      };

      // --- console (object with hardened methods, all in vm-realm) ---
      const safeConsole = Object.create(null);
      safeConsole.log = function () {
        const parts = [];
        for (let i = 0; i < arguments.length; i++) parts.push(String(arguments[i]));
        __b.pushLog(parts.join(' '));
      };
      safeConsole.warn = safeConsole.log;
      safeConsole.error = safeConsole.log;
      globalThis.console = safeConsole;

      // --- agent (with runtime allowlist + named throws, all vm-realm) ---
      // FIX-Round1-T13: throw on any opts key not in the allowlist \u2014 catches
      // typos like { scema: ... } that previously slipped through the
      // [key:string]: unknown index signature.
      const KNOWN_AGENT_OPTS = ['label', 'phase', 'schema', 'model', 'isolation', 'agentType', 'stallMs', 'workingDir'];
      globalThis.agent = vmAsync(function (prompt, agentOpts) {
        agentOpts = agentOpts || {};
        const keys = Object.keys(agentOpts);
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i];
          if (KNOWN_AGENT_OPTS.indexOf(k) === -1) {
            throw new Error(
              "agent({" + k + "}): unknown option. " +
              "Known options are: " + KNOWN_AGENT_OPTS.join(', ') + "."
            );
          }
        }
        // P3: schema + model + agentType + isolation are all wired through
        // createProductionDispatch \u2192 SubagentManager.createAgentHeadless.
        // The dispatch surfaces descriptive errors for "agent type not found",
        // "isolation:'remote' is not available in this build", parent-dirty
        // refuse, worktree creation failures, and StructuredOutput contract
        // violations ("completed without calling StructuredOutput after 2
        // in-conversation nudges").
        if (
          agentOpts.isolation !== undefined &&
          agentOpts.isolation !== 'worktree' &&
          agentOpts.isolation !== 'remote'
        ) {
          throw new Error(
            "agent({isolation: '" + agentOpts.isolation + "'}): unknown isolation mode. " +
            "Known modes are: 'worktree', 'remote'."
          );
        }
        // NOTE: this init script is a host-side template literal \u2014 no
        // backticks anywhere below, in code or comments.
        //
        // A non-number stallMs is silently dropped downstream and the
        // default watchdog applies, contradicting "0 disables the watchdog"
        // \u2014 refuse it loudly like the other option gates.
        if (agentOpts.stallMs !== undefined && (typeof agentOpts.stallMs !== 'number' || !Number.isFinite(agentOpts.stallMs))) {
          throw new Error("agent({stallMs}): must be a finite number of milliseconds (0 disables the watchdog).");
        }
        // workingDir pins the agent to a worktree the CALLER already owns;
        // isolation creates and reaps one. Asking for both is a contradiction
        // about who owns the directory's lifetime, so name it here rather than
        // silently letting one win.
        if (agentOpts.workingDir !== undefined) {
          if (typeof agentOpts.workingDir !== 'string' || agentOpts.workingDir.trim().length === 0) {
            throw new Error(
              "agent({workingDir}): must be a non-empty string naming an existing " +
              "git worktree of this repository."
            );
          }
          if (agentOpts.isolation !== undefined) {
            throw new Error(
              "agent({workingDir, isolation}): incompatible options. workingDir " +
              "pins the agent to a worktree you already own; isolation creates " +
              "a fresh one and removes it afterwards. Pass one."
            );
          }
        }
        if (typeof agentOpts.phase === 'string' && agentOpts.phase.length > 0) {
          if (__b.lastPhase() !== agentOpts.phase) {
            __b.pushPhase(agentOpts.phase);
          }
        }
        // SECURITY (P3 R2 self-review): user-script-controlled agentOpts
        // cross the vm/host boundary verbatim via vmAsync's hostFn.apply.
        // A Proxy / inherited-getter / non-plain object in agentOpts.schema
        // would let host-side code (SyntheticOutputTool constructor + AJV
        // compile) trigger user-controlled trap handlers that execute with
        // the host realm's full surface. Revive agentOpts through JSON
        // round-trip BEFORE crossing so the host only ever sees vm-realm
        // plain objects with vm-realm prototypes. Same mechanism that
        // makes args + parallel/pipeline results safe.
        var safeOpts;
        try {
          safeOpts = JSON.parse(JSON.stringify(agentOpts));
        } catch (e) {
          throw new Error(
            "agent() opts contain a non-JSON-serializable value: " +
            String(e && e.message != null ? e.message : e)
          );
        }
        // SECURITY (PR #4947 R1 wenshao, extended for P3): vmAsync's resolve
        // path is verbatim (no re-wrap of resolved values). Host-realm
        // strings cross the boundary harmlessly because primitives have no
        // prototype identity. But P3's schema-mode dispatch returns the
        // validated structured_output args as a host-realm OBJECT --
        // handing that to the script reopens the T1/T8/T14 escape:
        // result.constructor.constructor("return process")() would walk
        // the host Object.prototype chain to the host Function
        // constructor. Per-call JSON revival inside this vm runInContext
        // block makes the returned object carry vm-realm prototypes (same
        // mechanism as parallel/pipeline reviveInRealm and the args
        // global revival). The fallback to null on a non-serializable
        // resolve mirrors the errors-as-data convention parallel/pipeline
        // already use for individual slot failures.
        // R3 review (wenshao T3 [Suggestion]): the null fallback below is
        // a SECURITY backstop, not a contract path. In schema mode the
        // host return is the validated args of a structured_output tool
        // call -- LLM tool_call payloads are always JSON-serializable
        // (the model sends them through the OpenAI tool-call protocol
        // which serializes through JSON itself) and SyntheticOutputTool's
        // AJV validation runs over the parsed JSON, so a non-serializable
        // host return is unreachable in production schema mode. The
        // sentinel preserves the errors-as-data convention parallel /
        // pipeline already use for individual slot failures, and stays as
        // residual defense for any future dispatch path whose return
        // value isn't a tool_call payload. logRevivalFailure surfaces
        // the actionable detail (slot 0 + the error string) to operators
        // so a real trigger in production isn't silent.
        return __b.hostAgent(prompt, safeOpts).then(function (value) {
          if (value === null || typeof value !== 'object') {
            return value;
          }
          try {
            return JSON.parse(JSON.stringify(value));
          } catch (e) {
            __b.logRevivalFailure(0, String(e && e.message != null ? e.message : e));
            return null;
          }
        });
      });

      // --- parallel / pipeline ---
      // SECURITY (PR #4732 P2): the host impl resolves with a HOST-realm array.
      // vmAsync's resolve path is verbatim (it does NOT re-wrap resolved
      // values), so handing that host array to the script would reopen the
      // T1/T8/T14 escape: result.constructor.constructor('return process')()
      // walks the host Array.prototype chain to the host Function constructor.
      // We revive the array INSIDE the vm realm with JSON.parse(JSON.stringify)
      // -- the same mechanism that makes the args global safe (see the args
      // revival above) -- so the value the script sees has vm-realm prototypes
      // whose constructors can't reach host process. Agent results are JSON
      // strings (and null slots), so the round-trip is lossless for P2.
      //
      // EAD-1 (P2 self-review): revive PER-ELEMENT, not the whole array in one
      // JSON.stringify. A single slot whose VALUE is non-serializable (a thunk
      // that returns a BigInt or a circular object) must become null at its
      // index -- it must NOT throw on the whole array and destroy every sibling
      // result, which would defeat errors-as-data for return values. The outer
      // [] is built in-realm here, so the result keeps vm-realm prototypes.
      //
      // SECURITY (PR #4947 R1 wenshao): reviveInRealm MUST remain inside this
      // vm init runInContext block. JSON, Array, Object here are vm-realm
      // globals; extracting this function to a host-side utility (e.g. a
      // shared utils/jsonRevive.ts) would resolve those references against
      // the HOST realm, silently reopening the T1/T8/T14 escape that the
      // revival is designed to prevent. The textual identity to a host-side
      // util is exactly the trap.
      function reviveInRealm(hostArr) {
        const out = [];
        for (let i = 0; i < hostArr.length; i++) {
          try {
            out[i] = JSON.parse(JSON.stringify(hostArr[i]));
          } catch (e) {
            // Cross to host realm for debug logging. The bridge function
            // accepts only primitive strings/numbers; the error message is
            // coerced to a String here so no vm-realm Error object crosses.
            __b.logRevivalFailure(i, String(e?.message ?? e));
            out[i] = null;
          }
        }
        return out;
      }
      if (__b.hasParallel) {
        const callParallel = vmAsync(function (thunks) {
          return __b.hostParallel(thunks);
        });
        globalThis.parallel = function parallel(thunks) {
          return callParallel(thunks).then(reviveInRealm);
        };
      } else {
        globalThis.parallel = function parallel() {
          return new Promise(function (_, reject) {
            reject(new Error(
              'parallel() is unavailable: this sandbox was created without a ' +
              'parallel implementation. The orchestrator injects one; a bare ' +
              'sandbox has no concurrent-dispatch capability.'
            ));
          });
        };
      }
      if (__b.hasPipeline) {
        const callPipeline = vmAsync(function (items) {
          const stages = [];
          for (let i = 1; i < arguments.length; i++) stages.push(arguments[i]);
          return __b.hostPipeline.apply(null, [items].concat(stages));
        });
        globalThis.pipeline = function pipeline() {
          return callPipeline.apply(null, arguments).then(reviveInRealm);
        };
      } else {
        globalThis.pipeline = function pipeline() {
          return new Promise(function (_, reject) {
            reject(new Error(
              'pipeline() is unavailable: this sandbox was created without a ' +
              'pipeline implementation. The orchestrator injects one; a bare ' +
              'sandbox has no staggered multi-stage capability.'
            ));
          });
        };
      }
      // --- workflow (nested, single-level) ---
      // Mirrors agent(): args cross vm\u2192host verbatim (safe direction), the
      // single result is revived back into the vm realm via JSON round-trip
      // (same T1/T8/T14 escape defense as agent / parallel / pipeline). The
      // host impl resolves a saved workflow and runs it sharing this run's
      // agent-count cap + token budget. When __b.hasWorkflow is false, the
      // sandbox is either bare (no resolver wired) OR is itself a nested
      // workflow \u2014 in both cases workflow() must throw, which is how the
      // single-level nesting limit is enforced (a nested sandbox is created
      // without a workflow impl, so its workflow() lands in the else branch).
      if (__b.hasWorkflow) {
        const callWorkflow = vmAsync(function (nameOrRef, wfArgs) {
          // Sanitize args through a JSON round-trip BEFORE crossing so the
          // host only ever sees vm-realm plain objects (same defense as
          // agent()'s safeOpts). nameOrRef may be a string or {scriptPath}.
          var safeRef;
          var safeArgs;
          try {
            safeRef = nameOrRef === undefined
              ? undefined
              : JSON.parse(JSON.stringify(nameOrRef));
            safeArgs = wfArgs === undefined
              ? undefined
              : JSON.parse(JSON.stringify(wfArgs));
          } catch (e) {
            throw new Error(
              'workflow() received a non-JSON-serializable argument: ' +
              String(e && e.message != null ? e.message : e)
            );
          }
          return __b.hostWorkflow(safeRef, safeArgs).then(function (value) {
            if (value === null || typeof value !== 'object') {
              return value;
            }
            try {
              return JSON.parse(JSON.stringify(value));
            } catch (e) {
              __b.logRevivalFailure(0, String(e && e.message != null ? e.message : e));
              return null;
            }
          });
        });
        globalThis.workflow = function workflow(nameOrRef, wfArgs) {
          return callWorkflow(nameOrRef, wfArgs);
        };
      } else {
        globalThis.workflow = function workflow() {
          return new Promise(function (_, reject) {
            reject(new Error(
              "workflow() is unavailable here. Either this sandbox was created " +
              "without a saved-workflow resolver, or this script is already " +
              "running as a nested workflow \u2014 workflow() nesting is limited to " +
              "a single level (a workflow cannot call another workflow that " +
              "itself calls workflow())."
            ));
          });
        };
      }

      // --- budget ---
      const safeBudget = Object.create(null);
      Object.defineProperty(safeBudget, 'total', {
        value: __b.budgetTotal,
        writable: false, configurable: false,
      });
      if (__b.hasBudget) {
        Object.defineProperty(safeBudget, 'spent', {
          value: function spent() { return __b.hostBudgetSpent(); },
          writable: false, configurable: false,
        });
        Object.defineProperty(safeBudget, 'remaining', {
          value: function remaining() { return __b.hostBudgetRemaining(); },
          writable: false, configurable: false,
        });
      } else {
        Object.defineProperty(safeBudget, 'spent', {
          value: function spent() {
            throw new Error(
              'budget.spent() is not supported in P1. Token tracking is scheduled for P5.'
            );
          },
          writable: false, configurable: false,
        });
        Object.defineProperty(safeBudget, 'remaining', {
          value: function remaining() {
            throw new Error(
              'budget.remaining() is not supported in P1. Token tracking is scheduled for P5.'
            );
          },
          writable: false, configurable: false,
        });
      }
      globalThis.budget = safeBudget;
    })();`,
    ctx,
    { filename: "workflow-sandbox-init.js" }
  );
  const maxWallClockMs = resolveMaxWallClockMs(opts);
  const flushUnconsumedRejections = /* @__PURE__ */ __name(async () => {
    unconsumedSettled = true;
    if (nextUnconsumedId === 1) return;
    await new Promise((resolve2) => {
      setImmediate(resolve2);
    });
    for (const rec of unconsumedRejections.values()) {
      const rootState = unconsumedRoots.get(rec.rootId);
      if (rootState?.rejectionHandled) {
        continue;
      }
      if (rec.dispatchFailed && rootState?.adoptedOut) {
        continue;
      }
      const key = rec.rootId + "\0" + rec.msg;
      if (mirroredEscapeKeys.has(key)) continue;
      mirroredEscapeKeys.add(key);
      safeLog(unconsumedRejectionLine(rec));
    }
    unconsumedRejections.clear();
  }, "flushUnconsumedRejections");
  const hookRunId = opts.runId ?? "";
  const adoptionEscapeHook = /* @__PURE__ */ __name((reason, _promise) => {
    try {
      if (!reason || typeof reason !== "object") return;
      const marked = reason;
      if (marked.__wfDispatchFailed !== true) return;
      if (String(marked.__wfRunId ?? "") !== hookRunId) return;
      const rootId = typeof marked.__wfRootId === "number" ? marked.__wfRootId : void 0;
      if (rootId !== void 0 && unconsumedRoots.get(rootId)?.rejectionHandled) {
        return;
      }
      let msg;
      try {
        msg = marked.message != null ? String(marked.message) : String(reason);
      } catch {
        msg = "[unserializable rejection value]";
      }
      const key = String(rootId ?? "") + "\0" + msg;
      if (mirroredEscapeKeys.has(key)) return;
      mirroredEscapeKeys.add(key);
      safeLog("dispatch failed (rejection not handled): " + msg);
    } catch (e) {
      debugLogger.warn("adoptionEscapeHook failed:", e);
    }
  }, "adoptionEscapeHook");
  let extractedMeta = null;
  return {
    async run(scriptSource) {
      unconsumedSettled = false;
      unconsumedRoots.clear();
      unconsumedRejections.clear();
      nextUnconsumedId = 1;
      mirroredEscapeKeys = /* @__PURE__ */ new Set();
      let watchdog;
      let stopWatchingState;
      let rearmWatchdogOnAbort;
      process.on("unhandledRejection", adoptionEscapeHook);
      try {
        const { script, meta } = compileWorkflowScript(scriptSource);
        extractedMeta = meta;
        const runOpts = {
          timeout: 3e4
        };
        const result = script.runInContext(ctx, runOpts);
        const timeoutPromise = new Promise((_, reject) => {
          watchdog = new WallClockWatchdog(maxWallClockMs, () => {
            opts.abortOnTimeout?.abort();
            reject(
              new Error(
                `Workflow execution exceeded ${maxWallClockMs} ms of active time (paused time is not counted). Override via SandboxOptions.maxWallClockMs or QWEN_CODE_MAX_WORKFLOW_SECONDS env var.`
              )
            );
          });
        });
        const aborted = /* @__PURE__ */ __name(() => opts.abortOnTimeout?.signal.aborted === true, "aborted");
        stopWatchingState = opts.scheduler?.onStateChange(({ state }) => {
          if (state === "paused" && !aborted()) watchdog?.pause();
          else watchdog?.resume();
        });
        if (opts.scheduler?.snapshot().state === "paused" && !aborted()) {
          watchdog?.pause();
        }
        rearmWatchdogOnAbort = /* @__PURE__ */ __name(() => watchdog?.resume(), "rearmWatchdogOnAbort");
        opts.abortOnTimeout?.signal.addEventListener(
          "abort",
          rearmWatchdogOnAbort,
          { once: true }
        );
        return await Promise.race([result, timeoutPromise]);
      } finally {
        if (rearmWatchdogOnAbort) {
          opts.abortOnTimeout?.signal.removeEventListener(
            "abort",
            rearmWatchdogOnAbort
          );
        }
        stopWatchingState?.();
        watchdog?.stop();
        await flushUnconsumedRejections();
        process.off("unhandledRejection", adoptionEscapeHook);
      }
    },
    getPhases: /* @__PURE__ */ __name(() => [...phases], "getPhases"),
    getLogs: /* @__PURE__ */ __name(() => [...logs], "getLogs"),
    appendLog: /* @__PURE__ */ __name((line) => safeLog(line, false), "appendLog"),
    getMeta: /* @__PURE__ */ __name(() => extractedMeta, "getMeta")
  };
}
__name(createWorkflowSandbox, "createWorkflowSandbox");

// packages/core/src/agents/runtime/workflow-orchestrator.ts
init_esbuild_shims();
import { randomBytes } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";
import * as os from "node:os";

// packages/core/src/agents/runtime/workflow-budget.ts
init_esbuild_shims();
var debugLogger2 = createDebugLogger("WORKFLOW_BUDGET");
var MAX_TOKENS_PER_WORKFLOW_ENV = "QWEN_CODE_MAX_TOKENS_PER_WORKFLOW";
var HARD_MAX_TOKENS_CEILING = 1e8;
function resolveMaxTokensPerWorkflow(env = process.env) {
  const raw = env[MAX_TOKENS_PER_WORKFLOW_ENV];
  if (raw === void 0 || raw.trim() === "") {
    return null;
  }
  const parsed = parsePositiveIntegerEnv(raw, 0);
  if (parsed < 1) {
    debugLogger2.warn(
      `Invalid ${MAX_TOKENS_PER_WORKFLOW_ENV}=${JSON.stringify(raw)}, treating as unset (no cap)`
    );
    return null;
  }
  if (parsed > HARD_MAX_TOKENS_CEILING) {
    debugLogger2.warn(
      `${MAX_TOKENS_PER_WORKFLOW_ENV}=${parsed} exceeds hard ceiling (${HARD_MAX_TOKENS_CEILING}); clamping.`
    );
    return HARD_MAX_TOKENS_CEILING;
  }
  return parsed;
}
__name(resolveMaxTokensPerWorkflow, "resolveMaxTokensPerWorkflow");
var WorkflowBudgetImpl = class _WorkflowBudgetImpl {
  static {
    __name(this, "WorkflowBudgetImpl");
  }
  total;
  _spent;
  constructor(total) {
    this.total = total;
    this._spent = 0;
  }
  spent() {
    return this._spent;
  }
  remaining() {
    if (this.total === null) return Infinity;
    return Math.max(0, this.total - this._spent);
  }
  /**
   * Host-side increment. NOT exposed to the script — the
   * `WorkflowBudget` interface deliberately omits any setter so a
   * malicious workflow cannot inflate / deflate the budget. Only the
   * orchestrator (in `countedDispatch`) calls this after a dispatch
   * resolves with the agent's output token count.
   *
   * Non-positive deltas are silently dropped (some dispatches return
   * `output_tokens: 0` on early failures); negative deltas would be a
   * caller bug and are also dropped rather than silently rewinding
   * the counter.
   */
  recordSpent(deltaTokens) {
    if (!Number.isFinite(deltaTokens) || deltaTokens <= 0) return;
    this._spent += deltaTokens;
  }
  /**
   * Factory: build a budget from the current environment. Convenience
   * over `new WorkflowBudgetImpl(resolveMaxTokensPerWorkflow(env))`.
   */
  static fromEnv(env = process.env) {
    return new _WorkflowBudgetImpl(resolveMaxTokensPerWorkflow(env));
  }
};
var WorkflowBudgetExceededError = class extends Error {
  static {
    __name(this, "WorkflowBudgetExceededError");
  }
  name = "WorkflowBudgetExceededError";
  runId;
  budgetTotal;
  spent;
  constructor(runId, budgetTotal, spent) {
    super(
      `Workflow ${runId} exceeded the token budget (${spent} / ${budgetTotal} output tokens spent).`
    );
    this.runId = runId;
    this.budgetTotal = budgetTotal;
    this.spent = spent;
  }
};

// packages/core/src/agents/runtime/workflow-stall.ts
init_esbuild_shims();
var DEFAULT_STALL_MS = 18e4;
var MAX_STALL_ATTEMPTS = 3;
var MAX_WORKFLOW_STALL_MS_ENV = "QWEN_CODE_WORKFLOW_STALL_SECONDS";
function resolveStallMs(perCall, env = process.env) {
  if (typeof perCall === "number" && Number.isFinite(perCall)) {
    if (perCall === 0) return 0;
    if (perCall > 0) return perCall;
  }
  const raw = env[MAX_WORKFLOW_STALL_MS_ENV];
  const trimmed = raw?.trim();
  if (trimmed) {
    if (trimmed === "0") return 0;
    const sec = parsePositiveIntegerEnv(trimmed, 0);
    if (sec > 0) return sec * 1e3;
  }
  return DEFAULT_STALL_MS;
}
__name(resolveStallMs, "resolveStallMs");
var debugLogger3 = createDebugLogger("WORKFLOW_STALL");
function attachStallWatchdog(emitter, controller, stallMs) {
  if (stallMs <= 0) {
    return { stalled: /* @__PURE__ */ __name(() => false, "stalled"), dispose: /* @__PURE__ */ __name(() => {
    }, "dispose") };
  }
  let inFlightTools = 0;
  let fired = false;
  let timer;
  let disposed = false;
  const clear = /* @__PURE__ */ __name(() => {
    if (timer) {
      clearTimeout(timer);
      timer = void 0;
    }
  }, "clear");
  const arm = /* @__PURE__ */ __name(() => {
    clear();
    if (disposed || fired) return;
    if (inFlightTools > 0) return;
    timer = setTimeout(() => {
      if (disposed || fired) return;
      fired = true;
      debugLogger3.warn(
        `[Workflow] agent dispatch stalled \u2014 no progress for ${stallMs}ms; aborting.`
      );
      try {
        controller.abort("stalled");
      } catch (e) {
        debugLogger3.warn("stall watchdog abort threw:", e);
      }
    }, stallMs);
    if (typeof timer.unref === "function") {
      timer.unref();
    }
  }, "arm");
  const onActivity = /* @__PURE__ */ __name(() => arm(), "onActivity");
  const onToolCall = /* @__PURE__ */ __name(() => {
    inFlightTools += 1;
    clear();
  }, "onToolCall");
  const onToolResult = /* @__PURE__ */ __name(() => {
    inFlightTools = Math.max(0, inFlightTools - 1);
    arm();
  }, "onToolResult");
  emitter.on("round_start" /* ROUND_START */, onActivity);
  emitter.on("round_end" /* ROUND_END */, onActivity);
  emitter.on("stream_text" /* STREAM_TEXT */, onActivity);
  emitter.on("usage_metadata" /* USAGE_METADATA */, onActivity);
  emitter.on("tool_call" /* TOOL_CALL */, onToolCall);
  emitter.on("tool_result" /* TOOL_RESULT */, onToolResult);
  return {
    stalled: /* @__PURE__ */ __name(() => fired, "stalled"),
    dispose: /* @__PURE__ */ __name(() => {
      if (disposed) return;
      disposed = true;
      clear();
      emitter.off("round_start" /* ROUND_START */, onActivity);
      emitter.off("round_end" /* ROUND_END */, onActivity);
      emitter.off("stream_text" /* STREAM_TEXT */, onActivity);
      emitter.off("usage_metadata" /* USAGE_METADATA */, onActivity);
      emitter.off("tool_call" /* TOOL_CALL */, onToolCall);
      emitter.off("tool_result" /* TOOL_RESULT */, onToolResult);
    }, "dispose")
  };
}
__name(attachStallWatchdog, "attachStallWatchdog");
async function runStallResilient(attemptFn, opts) {
  const { stallMs, signal, label } = opts;
  if (stallMs <= 0) {
    const emitter = new AgentEventEmitter();
    return attemptFn(signal ?? new AbortController().signal, emitter);
  }
  let attempt = 0;
  for (; ; ) {
    attempt += 1;
    const controller = new AbortController();
    let onParentAbort;
    if (signal) {
      if (signal.aborted) {
        controller.abort(signal.reason);
      } else {
        onParentAbort = /* @__PURE__ */ __name(() => controller.abort(signal.reason), "onParentAbort");
        signal.addEventListener("abort", onParentAbort);
      }
    }
    const emitter = new AgentEventEmitter();
    const watchdog = attachStallWatchdog(emitter, controller, stallMs);
    try {
      return await attemptFn(controller.signal, emitter);
    } catch (err) {
      if (signal?.aborted) throw err;
      if (watchdog.stalled() && attempt < MAX_STALL_ATTEMPTS) {
        debugLogger3.warn(
          `[Workflow] agent "${label ?? "workflow-agent"}" stalled (attempt ${attempt}/${MAX_STALL_ATTEMPTS}) \u2014 retrying.`
        );
        continue;
      }
      if (watchdog.stalled()) {
        throw new Error(
          `agent "${label ?? "workflow-agent"}" stalled on all ${MAX_STALL_ATTEMPTS} attempts (no progress for ${stallMs}ms each).`
        );
      }
      throw err;
    } finally {
      watchdog.dispose();
      if (onParentAbort && signal) {
        signal.removeEventListener("abort", onParentAbort);
      }
    }
  }
}
__name(runStallResilient, "runStallResilient");

// packages/core/src/agents/runtime/workflow-journal.ts
init_esbuild_shims();
import { createHash } from "node:crypto";
var debugLogger4 = createDebugLogger("WORKFLOW_JOURNAL");
var JOURNAL_KEY_VERSION = "v2";
function canonicalizeAgentOpts(opts) {
  const projected = {};
  for (const k of [
    "schema",
    "model",
    "isolation",
    "agentType",
    "workingDir"
  ]) {
    const v = opts[k];
    if (v === void 0 || typeof v === "function") continue;
    projected[k] = v;
  }
  const sortDeep = /* @__PURE__ */ __name((val) => {
    if (typeof val === "function") return void 0;
    if (Array.isArray(val)) return val.map(sortDeep);
    if (val && typeof val === "object") {
      const out = {};
      for (const key of Object.keys(val).sort()) {
        if (key === "__proto__") continue;
        out[key] = sortDeep(val[key]);
      }
      return out;
    }
    return val;
  }, "sortDeep");
  try {
    return JSON.stringify(sortDeep(projected));
  } catch {
    return "{}";
  }
}
__name(canonicalizeAgentOpts, "canonicalizeAgentOpts");
function deriveAgentKey(prefixHash, prompt, opts) {
  const hash = createHash("sha256");
  hash.update(prefixHash);
  hash.update("\0");
  hash.update(prompt);
  hash.update("\0");
  hash.update(canonicalizeAgentOpts(opts));
  return `${JOURNAL_KEY_VERSION}:${hash.digest("hex")}`;
}
__name(deriveAgentKey, "deriveAgentKey");
function deriveArgsSeed(args) {
  const hash = createHash("sha256");
  let serialized;
  try {
    serialized = JSON.stringify(args ?? null) ?? "null";
  } catch {
    serialized = "non-serializable-args";
  }
  hash.update(serialized);
  return `${JOURNAL_KEY_VERSION}:${hash.digest("hex")}`;
}
__name(deriveArgsSeed, "deriveArgsSeed");
function buildReplay(entries) {
  const results = /* @__PURE__ */ new Map();
  const started = /* @__PURE__ */ new Map();
  for (const e of entries) {
    if (e.type === "result") {
      results.set(e.key, e);
    } else if (e.type === "started") {
      const list = started.get(e.key);
      if (list) list.push(e);
      else started.set(e.key, [e]);
    }
  }
  return { results, started };
}
__name(buildReplay, "buildReplay");
var WorkflowJournal = class {
  constructor(path2) {
    this.path = path2;
  }
  static {
    __name(this, "WorkflowJournal");
  }
  pending = Promise.resolve();
  /** Load + parse all entries into replay maps. Empty maps if no file. */
  async load() {
    try {
      const entries = await read(this.path);
      return buildReplay(entries);
    } catch (e) {
      debugLogger4.warn(`WorkflowJournal.load failed for ${this.path}: ${e}`);
      return { results: /* @__PURE__ */ new Map(), started: /* @__PURE__ */ new Map() };
    }
  }
  /** Append one entry. Rejects only on I/O error (callers `.catch`). */
  append(entry) {
    const operation = this.pending.then(() => writeLine(this.path, entry));
    this.pending = operation.catch(() => void 0);
    return operation;
  }
  /** Wait until every append issued so far has settled. */
  drain() {
    return this.pending;
  }
};

// packages/core/src/agents/runtime/workflow-prompts.ts
init_esbuild_shims();
var WORKFLOW_SUBAGENT_SYSTEM_PROMPT = 'You are a subagent spawned by a workflow orchestration script. Use the tools available to complete the task.\nCRITICAL: Your final text response is returned **verbatim** as a string to the calling script \u2014 it is your return value, not a message to a human.\n- Output the literal result (data, JSON, text). Do NOT output confirmations like "Done." or "Sent."\n- If asked for JSON, return ONLY the raw JSON \u2014 no code fences, no prose, no markdown.\n- Do NOT use SendUserMessage to deliver your answer. Put your answer in your final text response.\n- Be concise. The script will parse your output.';
var WORKFLOW_SUBAGENT_SYSTEM_PROMPT_WITH_SCHEMA = "You are a subagent spawned by a workflow orchestration script. Use the tools available to complete the task.\nCRITICAL: You MUST deliver your final answer by calling the `structured_output` tool with arguments that conform to its parameter schema. Plain-text final answers are DISCARDED \u2014 only a valid `structured_output` call returns a result to the calling script.\n- Use other tools (Read, Grep, etc.) to gather information first.\n- When ready, call `structured_output` ONCE with the conforming JSON object.\n- If validation fails, the error tells you what to fix. Try again with corrected fields.\n- After two failed attempts, the run terminates \u2014 get the arguments right.\n- Do NOT use SendUserMessage to deliver your answer.\n- Be concise; the script reads only the structured payload, not your prose.";

// packages/core/src/agents/runtime/workflow-dispatch-scheduler.ts
init_esbuild_shims();
function abortError() {
  return new DOMException("Workflow dispatch scheduler aborted.", "AbortError");
}
__name(abortError, "abortError");
var WorkflowDispatchScheduler = class {
  constructor(limit, signal, onStateChange) {
    this.limit = limit;
    this.signal = signal;
    if (!Number.isInteger(limit) || limit < 1) {
      throw new Error(
        `Workflow dispatch limit must be a positive integer, got ${String(limit)}.`
      );
    }
    if (onStateChange) this.stateListeners.add(onStateChange);
    if (signal && !signal.aborted) {
      signal.addEventListener("abort", () => this.abortPending(), {
        once: true
      });
    }
  }
  static {
    __name(this, "WorkflowDispatchScheduler");
  }
  state = "running";
  inFlight = 0;
  queue = [];
  gateWaiters = [];
  stateListeners = /* @__PURE__ */ new Set();
  /**
   * Subscribe to state transitions. Returns an unsubscribe function.
   * The constructor callback (when given) is registered as the first
   * listener; this method lets additional observers — e.g. the sandbox's
   * pause-aware wall-clock watchdog — hook the same transitions.
   */
  onStateChange(listener) {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }
  run(thunk) {
    return new Promise((resolve2, reject) => {
      if (this.signal?.aborted) {
        reject(abortError());
        return;
      }
      this.queue.push({
        thunk,
        resolve: resolve2,
        reject
      });
      this.pump();
    });
  }
  pause() {
    if (this.state !== "running" || this.signal?.aborted) return false;
    this.setState("pausing");
    if (this.inFlight === 0) this.setState("paused");
    return true;
  }
  resume() {
    if (this.state !== "paused" || this.signal?.aborted) return false;
    this.setState("running");
    while (this.gateWaiters.length > 0) {
      this.gateWaiters.shift().resolve();
    }
    this.pump();
    return true;
  }
  waitUntilRunning() {
    if (this.signal?.aborted) return Promise.reject(abortError());
    if (this.state === "running") return Promise.resolve();
    return new Promise((resolve2, reject) => {
      this.gateWaiters.push({ resolve: resolve2, reject });
    });
  }
  snapshot() {
    return {
      state: this.state,
      queued: this.queue.length,
      inFlight: this.inFlight
    };
  }
  pump() {
    while (this.state === "running" && this.inFlight < this.limit && this.queue.length > 0) {
      const job = this.queue.shift();
      if (this.signal?.aborted) {
        job.reject(abortError());
        continue;
      }
      this.inFlight++;
      Promise.resolve().then(job.thunk).then(job.resolve, job.reject).finally(() => {
        this.inFlight--;
        if (this.state === "pausing" && this.inFlight === 0) {
          this.setState("paused");
        }
        this.pump();
      });
    }
  }
  setState(state) {
    if (this.state === state) return;
    this.state = state;
    const snapshot = this.snapshot();
    for (const listener of [...this.stateListeners]) listener(snapshot);
  }
  abortPending() {
    const error = abortError();
    while (this.queue.length > 0) this.queue.shift().reject(error);
    while (this.gateWaiters.length > 0) {
      this.gateWaiters.shift().reject(error);
    }
  }
};

// packages/core/src/agents/runtime/workflow-orchestrator.ts
var DEFAULT_MAX_AGENTS_PER_RUN = 1e3;
var MAX_WORKFLOW_AGENTS_ENV = "QWEN_CODE_MAX_WORKFLOW_AGENTS";
var HARD_MAX_AGENTS_PER_RUN_CEILING = 1e4;
function resolveMaxAgentsPerRun(env = process.env) {
  const raw = env[MAX_WORKFLOW_AGENTS_ENV];
  if (raw === void 0 || raw.trim() === "") {
    return DEFAULT_MAX_AGENTS_PER_RUN;
  }
  const parsed = parsePositiveIntegerEnv(raw, 0);
  if (parsed < 1) {
    debugLogger.warn(
      `Invalid ${MAX_WORKFLOW_AGENTS_ENV}=${JSON.stringify(raw)}, using default (${DEFAULT_MAX_AGENTS_PER_RUN})`
    );
    return DEFAULT_MAX_AGENTS_PER_RUN;
  }
  if (parsed > HARD_MAX_AGENTS_PER_RUN_CEILING) {
    debugLogger.warn(
      `${MAX_WORKFLOW_AGENTS_ENV}=${parsed} exceeds hard ceiling (${HARD_MAX_AGENTS_PER_RUN_CEILING}); clamping.`
    );
    return HARD_MAX_AGENTS_PER_RUN_CEILING;
  }
  return parsed;
}
__name(resolveMaxAgentsPerRun, "resolveMaxAgentsPerRun");
var MAX_WORKFLOW_CONCURRENCY_ENV = "QWEN_CODE_MAX_WORKFLOW_CONCURRENCY";
var HARD_MAX_CONCURRENCY_CEILING = 64;
function resolveConcurrencyLimit(env = process.env) {
  const raw = env[MAX_WORKFLOW_CONCURRENCY_ENV];
  if (raw !== void 0 && raw.trim() !== "") {
    const parsed = parsePositiveIntegerEnv(raw, 0);
    if (parsed >= 1) {
      if (parsed > HARD_MAX_CONCURRENCY_CEILING) {
        debugLogger.warn(
          `${MAX_WORKFLOW_CONCURRENCY_ENV}=${parsed} exceeds hard ceiling (${HARD_MAX_CONCURRENCY_CEILING}); clamping.`
        );
        return HARD_MAX_CONCURRENCY_CEILING;
      }
      return parsed;
    }
    debugLogger.warn(
      `Invalid ${MAX_WORKFLOW_CONCURRENCY_ENV}=${JSON.stringify(raw)}, using cpu-derived default`
    );
  }
  return Math.max(1, Math.min(16, os.cpus().length - 2));
}
__name(resolveConcurrencyLimit, "resolveConcurrencyLimit");
var DEFAULT_WORKFLOW_SUBAGENT_MAX_TURNS = 50;
var DEFAULT_WORKFLOW_SUBAGENT_MAX_TIME_MINUTES = 10;
var WORKFLOW_SUBAGENT_MAX_TURNS_ENV = "QWEN_CODE_WORKFLOW_AGENT_MAX_TURNS";
var WORKFLOW_SUBAGENT_MAX_MINUTES_ENV = "QWEN_CODE_WORKFLOW_AGENT_MAX_MINUTES";
var HARD_WORKFLOW_SUBAGENT_MAX_TURNS_CEILING = 500;
var HARD_WORKFLOW_SUBAGENT_MAX_MINUTES_CEILING = 100;
function resolveSubagentBound(envName, defaultValue, ceiling, env) {
  const raw = env[envName];
  if (raw === void 0 || raw.trim() === "") return defaultValue;
  const parsed = parsePositiveIntegerEnv(raw, 0);
  if (parsed < 1) {
    debugLogger.warn(
      `Invalid ${envName}=${JSON.stringify(raw)}, using default (${defaultValue})`
    );
    return defaultValue;
  }
  if (parsed > ceiling) {
    debugLogger.warn(
      `${envName}=${parsed} exceeds hard ceiling (${ceiling}); clamping.`
    );
    return ceiling;
  }
  return parsed;
}
__name(resolveSubagentBound, "resolveSubagentBound");
function resolveSubagentMaxTurns(env = process.env) {
  return resolveSubagentBound(
    WORKFLOW_SUBAGENT_MAX_TURNS_ENV,
    DEFAULT_WORKFLOW_SUBAGENT_MAX_TURNS,
    HARD_WORKFLOW_SUBAGENT_MAX_TURNS_CEILING,
    env
  );
}
__name(resolveSubagentMaxTurns, "resolveSubagentMaxTurns");
function resolveSubagentMaxTimeMinutes(env = process.env) {
  return resolveSubagentBound(
    WORKFLOW_SUBAGENT_MAX_MINUTES_ENV,
    DEFAULT_WORKFLOW_SUBAGENT_MAX_TIME_MINUTES,
    HARD_WORKFLOW_SUBAGENT_MAX_MINUTES_CEILING,
    env
  );
}
__name(resolveSubagentMaxTimeMinutes, "resolveSubagentMaxTimeMinutes");
var WORKFLOW_SUBAGENT_DISALLOWED_TOOLS = [
  ToolNames.ASK_USER_QUESTION,
  ToolNames.SEND_MESSAGE,
  ToolNames.MONITOR,
  ...SUBAGENT_PLAN_LIFECYCLE_TOOLS,
  // AgentTool: workflow subagents must not spawn sub-agents even where
  // maxSubagentDepth would permit nesting — a leaf-spawned agent would run
  // outside the orchestrator's concurrency cap, agent counter, and token
  // budget, and its result would bypass the script's return-value contract.
  // The WorkflowTool itself is already excluded from every subagent; this
  // closes the same loop for plain `agent` calls (review #6189).
  ToolNames.AGENT
];
var WorkflowExecutionError = class extends Error {
  constructor(message, phases, logs, meta = null) {
    super(message);
    this.phases = phases;
    this.logs = logs;
    this.meta = meta;
  }
  static {
    __name(this, "WorkflowExecutionError");
  }
  name = "WorkflowExecutionError";
};
function generateRunId() {
  return `wf_${randomBytes(8).toString("hex")}`;
}
__name(generateRunId, "generateRunId");
function sanitizeForErrorMessage(value) {
  return stripAnsiAndControl(value);
}
__name(sanitizeForErrorMessage, "sanitizeForErrorMessage");
function createProductionDispatch(config, signal, onTokens, bridgeApprovalEvents) {
  return async (prompt, opts, dispatchId) => {
    if (typeof prompt !== "string" || prompt.length === 0) {
      throw new Error("agent() requires a non-empty string prompt.");
    }
    const stallMs = resolveStallMs(
      typeof opts.stallMs === "number" ? opts.stallMs : void 0
    );
    const workflowAgentId = `workflow-agent-${randomBytes(8).toString("hex")}`;
    const agentIdentity = await resolveWorkflowAgentIdentity(config, opts);
    let attempt = 0;
    return runStallResilient(
      async (attemptSignal, emitter) => {
        attempt += 1;
        const cleanupApprovalBridge = bridgeApprovalEvents?.(
          emitter,
          dispatchId
        );
        const cleanupTranscript = attachDispatchTranscript(
          config,
          workflowAgentId,
          prompt,
          agentIdentity.name,
          emitter,
          attempt
        );
        try {
          return await runSingleDispatch(
            config,
            prompt,
            opts,
            attemptSignal,
            emitter,
            workflowAgentId,
            agentIdentity,
            onTokens
          );
        } finally {
          cleanupTranscript();
          cleanupApprovalBridge?.();
        }
      },
      {
        stallMs,
        signal,
        // The name can carry a model-authored agentType spelling — keep
        // the stall log / abandoned error single-line the same way the
        // "not found" throw site sanitizes it.
        label: sanitizeForErrorMessage(agentIdentity.name)
      }
    );
  };
}
__name(createProductionDispatch, "createProductionDispatch");
async function resolveWorkflowAgentIdentity(config, opts) {
  if (opts.agentType) {
    const resolved = await config.getSubagentManager().findSubagentByName(opts.agentType);
    if (resolved) {
      return { name: resolved.name, resolvedAgentType: resolved };
    }
  }
  if (typeof opts.label === "string" && opts.label) {
    return { name: opts.label };
  }
  return { name: opts.agentType || "workflow-agent" };
}
__name(resolveWorkflowAgentIdentity, "resolveWorkflowAgentIdentity");
function attachDispatchTranscript(config, agentId, prompt, agentName, emitter, attempt) {
  const append = attempt > 1;
  try {
    const { jsonlPath, options } = buildAgentTranscriptAttach(config, agentId, {
      agentName,
      // The prompt the SCRIPT dispatched, seeded as the transcript's first
      // user record — the same shape AgentTool writes, so a reader that
      // recovers a launch prompt from a transcript needs no workflow-
      // specific branch. A retry re-uses the first attempt's record rather
      // than seeding a second one.
      initialUserPrompt: append ? void 0 : prompt,
      appendToExisting: append,
      retryAttempt: append ? attempt : void 0
    });
    return attachJsonlTranscriptWriter(emitter, jsonlPath, options).cleanup;
  } catch (error) {
    debugLogger.warn(
      `[Workflow] failed to attach transcript for ${agentId}: ${error}`
    );
    return () => {
    };
  }
}
__name(attachDispatchTranscript, "attachDispatchTranscript");
async function runSingleDispatch(config, prompt, opts, attemptSignal, emitter, workflowAgentId, agentIdentity, onTokens) {
  const { AgentHeadless, ContextState } = await import("./agent-headless-VOJ57DCY.js");
  const ctx = new ContextState();
  ctx.set("task_prompt", prompt);
  debugLogger.debug(`[workflow] Dispatch ${workflowAgentId}`);
  if (opts.agentType === void 0 && opts.model === void 0 && opts.isolation === void 0 && opts.schema === void 0 && opts.workingDir === void 0) {
    const subagent = await AgentHeadless.create(
      agentIdentity.name,
      config,
      {
        systemPrompt: WORKFLOW_SUBAGENT_SYSTEM_PROMPT
      },
      {},
      // T11 (PR #4732 R1): bound resource ceiling so a single agent() call
      // cannot loop the model indefinitely. Without this, runConfig was {}
      // and the loop guards never tripped — combined with the cancellation
      // bug below, workflows were effectively unkillable.
      {
        max_turns: resolveSubagentMaxTurns(),
        max_time_minutes: resolveSubagentMaxTimeMinutes()
      },
      // T11 (PR #4732 R1): disallow SendMessage / ExitPlanMode to align with
      // upstream Tg8 — closes the back-channel that would let a subagent
      // deliver its answer via user message instead of the script's read.
      { tools: ["*"], disallowedTools: WORKFLOW_SUBAGENT_DISALLOWED_TOOLS },
      // P-stall: the stall-watchdog emitter observes reasoning-loop events
      // (round/tool/usage) to detect a hang and abort `attemptSignal`.
      emitter,
      void 0,
      void 0,
      prompt,
      workflowAgentId
    );
    try {
      await runWithAgentContext(
        workflowAgentId,
        () => subagent.execute(ctx, attemptSignal)
      );
    } finally {
      reportTokens(subagent, opts, onTokens);
    }
    const mode = subagent.getTerminateMode();
    if (mode !== "GOAL" /* GOAL */) {
      throw new Error(
        `Workflow subagent ${workflowAgentId} did not complete (terminate mode: ${mode}).`
      );
    }
    return toModelVisibleSubagentResult(subagent.getFinalText(), mode);
  }
  return runOverridePath(
    config,
    ctx,
    opts,
    attemptSignal,
    workflowAgentId,
    agentIdentity,
    onTokens,
    emitter
  );
}
__name(runSingleDispatch, "runSingleDispatch");
function reportTokens(subagent, opts, onTokens) {
  if (!onTokens) return;
  try {
    const summary = subagent.getExecutionSummary();
    onTokens(summary.outputTokens, opts);
  } catch (e) {
    debugLogger.warn("onTokens callback threw:", e);
  }
}
__name(reportTokens, "reportTokens");
async function runOverridePath(config, ctx, opts, signal, workflowAgentId, agentIdentity, onTokens, emitter) {
  if (opts.isolation === "remote") {
    throw new Error(
      "agent({isolation:'remote'}) is not available in this build."
    );
  }
  const subagentMgr = config.getSubagentManager();
  let baseConfig;
  if (opts.agentType !== void 0) {
    const resolved = agentIdentity.resolvedAgentType;
    if (!resolved) {
      const safeAgentType = sanitizeForErrorMessage(opts.agentType);
      throw new Error(
        `agent({agentType}): agent type '${safeAgentType}' not found.`
      );
    }
    baseConfig = resolved;
  } else {
    baseConfig = {
      name: agentIdentity.name,
      description: "Default workflow subagent (per-call overrides).",
      systemPrompt: WORKFLOW_SUBAGENT_SYSTEM_PROMPT,
      level: "session",
      isBuiltin: false
    };
  }
  let schemaSystemPrompt;
  if (opts.schema !== void 0) {
    schemaSystemPrompt = opts.agentType !== void 0 && baseConfig.systemPrompt ? `${baseConfig.systemPrompt}

${WORKFLOW_SUBAGENT_SYSTEM_PROMPT_WITH_SCHEMA}` : WORKFLOW_SUBAGENT_SYSTEM_PROMPT_WITH_SCHEMA;
  }
  let schemaTools;
  if (opts.schema !== void 0 && baseConfig.tools && baseConfig.tools.length > 0 && !baseConfig.tools.includes("*") && !baseConfig.tools.includes(ToolNames.STRUCTURED_OUTPUT)) {
    schemaTools = [...baseConfig.tools, ToolNames.STRUCTURED_OUTPUT];
  }
  const augmented = {
    ...baseConfig,
    ...opts.model !== void 0 ? { model: opts.model } : {},
    ...schemaSystemPrompt !== void 0 ? { systemPrompt: schemaSystemPrompt } : {},
    ...schemaTools !== void 0 ? { tools: schemaTools } : {},
    disallowedTools: Array.from(
      /* @__PURE__ */ new Set([
        ...baseConfig.disallowedTools ?? [],
        ...WORKFLOW_SUBAGENT_DISALLOWED_TOOLS
      ])
    )
  };
  let worktreeIsolation = null;
  let effectiveContext = config;
  if (opts.isolation !== void 0 && opts.workingDir !== void 0) {
    throw new Error(
      "agent({workingDir, isolation}): incompatible options. workingDir pins the agent to a worktree you already own; isolation creates a fresh one and removes it afterwards. Pass one."
    );
  }
  if (opts.isolation === "worktree") {
    worktreeIsolation = await provisionWorkflowWorktree(config);
    effectiveContext = createDirScopedConfigOverride(
      config,
      worktreeIsolation.path
    );
  } else if (opts.workingDir !== void 0) {
    if (typeof opts.workingDir !== "string" || opts.workingDir.trim().length === 0) {
      throw new Error(
        "agent({workingDir}): must be a non-empty string naming an existing git worktree of this repository."
      );
    }
    const resolved = await resolveExternalWorktreeDir(
      config,
      opts.workingDir,
      "workingDir"
    );
    if ("error" in resolved) {
      throw new Error(
        `agent({workingDir: ${sanitizeForErrorMessage(JSON.stringify(opts.workingDir))}}): ${sanitizeForErrorMessage(resolved.error)}`
      );
    }
    effectiveContext = createDirScopedConfigOverride(config, resolved.path);
  }
  let onParentAbort;
  try {
    let schemaState = null;
    if (opts.schema !== void 0) {
      effectiveContext = await createSchemaConfigOverride(
        effectiveContext,
        opts.schema
      );
      schemaState = createSchemaModeState();
    }
    let dispatchSignal = signal;
    if (schemaState) {
      const child = new AbortController();
      if (signal) {
        if (signal.aborted) {
          child.abort(signal.reason);
        } else {
          onParentAbort = /* @__PURE__ */ __name(() => child.abort(signal.reason), "onParentAbort");
          signal.addEventListener("abort", onParentAbort);
        }
      }
      schemaState.abortController = child;
      dispatchSignal = child.signal;
    }
    const eventEmitter = emitter ?? (schemaState ? new AgentEventEmitter() : void 0);
    if (schemaState && eventEmitter) {
      attachSchemaListeners(eventEmitter, schemaState);
    }
    const { subagent, dispose } = await subagentMgr.createAgentHeadless(
      augmented,
      effectiveContext,
      {
        // Workflow always bounds resource ceiling regardless of agentType's
        // own runConfig / maxTurns — these are workflow-level safety bounds,
        // not subagent-level preferences. P5 will refine via budget.
        runConfigOverrides: {
          max_turns: resolveSubagentMaxTurns(),
          max_time_minutes: resolveSubagentMaxTimeMinutes()
        },
        eventEmitter,
        taskName: String(ctx.get("task_prompt")),
        subagentId: workflowAgentId
      }
    );
    try {
      try {
        await runWithAgentContext(
          workflowAgentId,
          () => subagent.execute(ctx, dispatchSignal)
        );
      } finally {
        reportTokens(subagent, opts, onTokens);
      }
      if (schemaState) {
        if (schemaState.result !== null) {
          if (worktreeIsolation) {
            const isolation = worktreeIsolation;
            worktreeIsolation = null;
            const preserved = await cleanupWorkflowWorktree(isolation);
            if (preserved) {
              debugLogger.info(
                `[Workflow] Schema-mode subagent preserved worktree at ${preserved.path ?? "(directory removed)"} on branch ${preserved.branch}. The structured payload is returned verbatim; recover the work from the preserved path / branch.`
              );
            }
          }
          return schemaState.result;
        }
        if (signal?.aborted) {
          throw new DOMException("Workflow aborted.", "AbortError");
        }
        const mode2 = subagent.getTerminateMode();
        if (mode2 !== "GOAL" /* GOAL */ && mode2 !== "CANCELLED" /* CANCELLED */) {
          throw new Error(
            `Workflow subagent ${workflowAgentId} did not complete (terminate mode: ${mode2}).`
          );
        }
        if (schemaState.attempts > 2) {
          throw new Error(
            "subagent completed without calling StructuredOutput (after 2 in-conversation nudges)."
          );
        }
        throw new Error(
          "subagent completed without calling structured_output (no validation attempt \u2014 model produced plain-text content)."
        );
      }
      const mode = subagent.getTerminateMode();
      if (mode !== "GOAL" /* GOAL */) {
        throw new Error(
          `Workflow subagent ${workflowAgentId} did not complete (terminate mode: ${mode}).`
        );
      }
      let finalText = toModelVisibleSubagentResult(
        subagent.getFinalText(),
        mode
      );
      if (worktreeIsolation) {
        const isolation = worktreeIsolation;
        worktreeIsolation = null;
        const preserved = await cleanupWorkflowWorktree(isolation);
        if (preserved && typeof finalText === "string") {
          finalText = appendWorktreePreservedSuffix(finalText, preserved);
        }
      }
      return finalText;
    } finally {
      await dispose();
    }
  } finally {
    if (onParentAbort && signal) {
      signal.removeEventListener("abort", onParentAbort);
    }
    if (worktreeIsolation) {
      try {
        await cleanupWorkflowWorktree(worktreeIsolation);
      } catch (error) {
        debugLogger.warn(
          `Workflow worktree cleanup in fallback finally failed for ${worktreeIsolation.path}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }
}
__name(runOverridePath, "runOverridePath");
async function provisionWorkflowWorktree(config) {
  const cwd = config.getTargetDir();
  if (/\.qwen[\\/]worktrees[\\/]/.test(cwd)) {
    throw new Error(
      `agent({isolation:'worktree'}): parent is already inside a worktree (${cwd}). Nested isolation worktrees are not supported \u2014 the subagent's inherited paths would still reference the outer worktree.`
    );
  }
  const probe = new GitWorktreeService(cwd);
  const gitCheck = await probe.checkGitAvailable();
  if (!gitCheck.available) {
    throw new Error(
      `agent({isolation:'worktree'}): ${gitCheck.error ?? "git is not available"}.`
    );
  }
  if (!await probe.isGitRepository()) {
    throw new Error(
      `agent({isolation:'worktree'}): ${cwd} is not a git repository.`
    );
  }
  const projectRoot = await probe.getRepoTopLevel() ?? cwd;
  const wtService = projectRoot === cwd ? probe : new GitWorktreeService(projectRoot);
  let parentDirty = false;
  try {
    parentDirty = await wtService.hasWorktreeChanges(projectRoot);
  } catch (error) {
    debugLogger.warn(
      `[Workflow] hasWorktreeChanges failed at ${projectRoot}: ${error}`
    );
    parentDirty = true;
  }
  if (parentDirty) {
    throw new Error(
      `agent({isolation:'worktree'}): parent working tree at ${projectRoot} has uncommitted changes that would not propagate into the isolated worktree. The subagent would see the prior HEAD instead of the current state. Commit or stash the changes, then re-run.`
    );
  }
  const slug = generateAgentWorktreeSlug();
  let parentBranch;
  try {
    parentBranch = await wtService.getCurrentBranch();
  } catch (error) {
    debugLogger.warn(
      `[Workflow] getCurrentBranch failed at ${projectRoot}: ${error}`
    );
  }
  const created = await wtService.createUserWorktree(slug, parentBranch, {
    symlinkDirectories: config.getWorktreeSymlinkDirectories()
  });
  if (!created.success || !created.worktree) {
    throw new Error(
      `agent({isolation:'worktree'}): failed to create worktree: ${created.error ?? "unknown error"}.`
    );
  }
  try {
    await writeWorktreeSessionMarker(
      created.worktree.path,
      config.getSessionId()
    );
  } catch (error) {
    debugLogger.warn(
      `[Workflow] failed to write session marker at ${created.worktree.path}: ${error}`
    );
  }
  return {
    slug,
    path: created.worktree.path,
    branch: created.worktree.branch,
    repoRoot: projectRoot
  };
}
__name(provisionWorkflowWorktree, "provisionWorkflowWorktree");
function createDirScopedConfigOverride(base, wtPath) {
  const ov = Object.create(base);
  ov.targetDir = wtPath;
  ov.cwd = wtPath;
  ov.getTargetDir = () => wtPath;
  ov.getCwd = () => wtPath;
  ov.getWorkingDir = () => wtPath;
  ov.getProjectRoot = () => wtPath;
  const wtFileService = new FileDiscoveryService(
    wtPath,
    base.getFileFilteringOptions().customIgnoreFiles
  );
  ov.fileDiscoveryService = wtFileService;
  ov.getFileService = () => wtFileService;
  const wtWorkspace = new WorkspaceContext(wtPath);
  ov.workspaceContext = wtWorkspace;
  ov.getWorkspaceContext = () => wtWorkspace;
  return ov;
}
__name(createDirScopedConfigOverride, "createDirScopedConfigOverride");
async function cleanupWorkflowWorktree(isolation) {
  const wtService = new GitWorktreeService(isolation.repoRoot);
  const [hasChanges, hasUnmerged] = await Promise.all([
    wtService.hasWorktreeChanges(isolation.path).catch((error) => {
      debugLogger.warn(
        `[Workflow] hasWorktreeChanges failed for ${isolation.path}: ${error}`
      );
      return true;
    }),
    wtService.hasUnmergedWorktreeCommits(isolation.slug).catch((error) => {
      debugLogger.warn(
        `[Workflow] hasUnmergedWorktreeCommits failed for ${isolation.slug}: ${error}`
      );
      return true;
    })
  ]);
  if (hasChanges || hasUnmerged) {
    debugLogger.info(
      `[Workflow] Preserving isolation worktree ${isolation.path} (branch ${isolation.branch}, hasChanges=${hasChanges}, hasUnmerged=${hasUnmerged})`
    );
    return { path: isolation.path, branch: isolation.branch };
  }
  try {
    const result = await wtService.removeUserWorktree(isolation.slug, {
      deleteBranch: true
    });
    if (!result.success) {
      debugLogger.warn(
        `[Workflow] Failed to remove ephemeral worktree ${isolation.path}: ${result.error}`
      );
      return { path: isolation.path, branch: isolation.branch };
    }
    if (result.branchPreserved) {
      debugLogger.warn(
        `[Workflow] Removed worktree directory ${isolation.path} but kept branch ${isolation.branch} (unmerged commits at delete time)`
      );
      return { branch: isolation.branch };
    }
  } catch (error) {
    debugLogger.warn(
      `[Workflow] Failed to remove ephemeral worktree ${isolation.path}: ${error}`
    );
    return { path: isolation.path, branch: isolation.branch };
  }
  return null;
}
__name(cleanupWorkflowWorktree, "cleanupWorkflowWorktree");
function appendWorktreePreservedSuffix(finalText, preserved) {
  const sep = finalText.endsWith("\n") ? "\n" : "\n\n";
  if (preserved.path) {
    return `${finalText}${sep}[worktree preserved: ${preserved.path} (branch ${preserved.branch})]`;
  }
  return `${finalText}${sep}[worktree directory removed; branch ${preserved.branch} preserved \u2014 recover with \`git worktree add <path> ${preserved.branch}\`]`;
}
__name(appendWorktreePreservedSuffix, "appendWorktreePreservedSuffix");
function createSchemaModeState() {
  return {
    result: null,
    attempts: 0,
    pendingArgs: /* @__PURE__ */ new Map(),
    abortController: new AbortController()
  };
}
__name(createSchemaModeState, "createSchemaModeState");
function attachSchemaListeners(emitter, state) {
  const targetTool = ToolNames.STRUCTURED_OUTPUT;
  emitter.on("tool_call" /* TOOL_CALL */, (evt) => {
    if (evt.name !== targetTool) return;
    state.pendingArgs.set(evt.callId, evt.args);
  });
  emitter.on("tool_result" /* TOOL_RESULT */, (evt) => {
    if (evt.name !== targetTool) return;
    const args = state.pendingArgs.get(evt.callId);
    state.pendingArgs.delete(evt.callId);
    if (evt.success) {
      if (args !== void 0 && state.result === null) {
        state.result = args;
        state.abortController.abort();
      }
      return;
    }
    state.attempts += 1;
    if (state.attempts > 2 && state.result === null) {
      state.abortController.abort();
    }
  });
}
__name(attachSchemaListeners, "attachSchemaListeners");
async function createSchemaConfigOverride(base, schema) {
  const override = Object.create(base);
  await rebuildToolRegistryOnOverride(override, base);
  const registry = override.getToolRegistry();
  registry.registerTool(new SyntheticOutputTool(schema));
  return override;
}
__name(createSchemaConfigOverride, "createSchemaConfigOverride");
var WorkflowOrchestrator = class {
  constructor(dispatch) {
    this.dispatch = dispatch;
  }
  static {
    __name(this, "WorkflowOrchestrator");
  }
  async run(req) {
    const runId = req.runId ?? generateRunId();
    const maxAgents = resolveMaxAgentsPerRun();
    const signal = req.abortOnTimeout?.signal;
    const scheduler = req.scheduler ?? new WorkflowDispatchScheduler(resolveConcurrencyLimit(), signal);
    const rejectThroughPauseGate = /* @__PURE__ */ __name((error) => scheduler.waitUntilRunning().then(
      () => {
        throw error;
      },
      () => {
        throw error;
      }
    ), "rejectThroughPauseGate");
    let agentCount = 0;
    let dispatchTraceCount = 0;
    const emitter = req.emitter;
    const budget = req.budget;
    const dependencyContext = new AsyncLocalStorage();
    const issueDispatchTrace = /* @__PURE__ */ __name((prompt, opts, cached = false) => {
      const id = `dispatch-${dispatchTraceCount += 1}`;
      const store = dependencyContext.getStore();
      const dependsOn = Array.from(new Set(store?.tails ?? []));
      if (store) store.tails = [id];
      try {
        emitter?.dispatchQueued?.({
          id,
          ...typeof opts.label === "string" ? { label: opts.label } : {},
          prompt,
          dependsOn,
          queuedAt: Date.now(),
          ...cached ? { cached: true } : {}
        });
      } catch (e) {
        debugLogger.warn("emitter.dispatchQueued threw:", e);
      }
      return id;
    }, "issueDispatchTrace");
    const journal = req.journal;
    const replay = req.resumeReplay;
    let prefixHash = deriveArgsSeed(req.args);
    let hadMiss = false;
    let journalAgentId = 0;
    const countedDispatch = /* @__PURE__ */ __name((prompt, opts) => {
      if (typeof prompt !== "string" || prompt.length === 0) {
        return rejectThroughPauseGate(
          new Error("agent() requires a non-empty string prompt.")
        );
      }
      let journalKey;
      let journalEntryId;
      if (journal) {
        journalKey = deriveAgentKey(prefixHash, prompt, opts);
        prefixHash = journalKey;
        if (!hadMiss && replay) {
          const cached = replay.results.get(journalKey);
          if (cached !== void 0) {
            const respawns = replay.started.get(journalKey);
            if (respawns && respawns.length > 0) {
              debugLogger.info(
                `[Workflow] resume cache hit after ${respawns.length} prior respawn(s) for runId=${runId}.`
              );
            }
            const label2 = typeof opts.label === "string" ? opts.label : void 0;
            const dispatchId2 = issueDispatchTrace(prompt, opts, true);
            try {
              emitter?.agentDispatched?.(label2);
            } catch (e) {
              debugLogger.warn("emitter.agentDispatched threw:", e);
            }
            try {
              emitter?.agentCompleted?.(label2);
            } catch (e) {
              debugLogger.warn("emitter.agentCompleted threw:", e);
            }
            try {
              emitter?.dispatchSettled?.(dispatchId2, void 0, Date.now());
            } catch (e) {
              debugLogger.warn("emitter.dispatchSettled threw:", e);
            }
            return scheduler.waitUntilRunning().then(
              () => cached.result,
              () => cached.result
            );
          }
        }
        hadMiss = true;
        journalEntryId = String(journalAgentId += 1);
        journal.append({ type: "started", key: journalKey, agentId: journalEntryId }).catch(
          (e) => debugLogger.warn(`journal started-append failed: ${e}`)
        );
      }
      if (budget && budget.total !== null && budget.remaining() <= 0) {
        debugLogger.warn(
          `[Workflow] budget gate refused dispatch at entry: runId=${runId} spent=${budget.spent()} total=${budget.total}`
        );
        return rejectThroughPauseGate(
          new WorkflowBudgetExceededError(runId, budget.total, budget.spent())
        );
      }
      agentCount += 1;
      if (agentCount > maxAgents) {
        return rejectThroughPauseGate(
          new Error(
            `Workflow exceeded the maximum of ${maxAgents} agent() calls per run.`
          )
        );
      }
      const label = typeof opts.label === "string" ? opts.label : void 0;
      const dispatchId = issueDispatchTrace(prompt, opts);
      try {
        emitter?.agentDispatched?.(label);
      } catch (e) {
        debugLogger.warn("emitter.agentDispatched threw:", e);
      }
      let completionEmitted = false;
      const emitCompletion = /* @__PURE__ */ __name((error) => {
        if (completionEmitted) return;
        completionEmitted = true;
        const message = error === void 0 ? void 0 : error instanceof Error ? error.message : String(error);
        try {
          emitter?.agentCompleted?.(label, message);
        } catch (e) {
          debugLogger.warn("emitter.agentCompleted threw:", e);
        }
        try {
          emitter?.dispatchSettled?.(dispatchId, message, Date.now());
        } catch (e) {
          debugLogger.warn("emitter.dispatchSettled threw:", e);
        }
      }, "emitCompletion");
      return scheduler.run(async () => {
        try {
          try {
            emitter?.dispatchStarted?.(dispatchId, Date.now());
          } catch (e) {
            debugLogger.warn("emitter.dispatchStarted threw:", e);
          }
          if (budget && budget.total !== null && budget.remaining() <= 0) {
            debugLogger.warn(
              `[Workflow] budget gate refused dispatch at slot-acquire: runId=${runId} spent=${budget.spent()} total=${budget.total}`
            );
            throw new WorkflowBudgetExceededError(
              runId,
              budget.total,
              budget.spent()
            );
          }
          const result = await this.dispatch(prompt, opts, dispatchId);
          emitCompletion();
          if (journal && journalKey !== void 0) {
            journal.append({
              type: "result",
              key: journalKey,
              agentId: journalEntryId ?? "",
              result
            }).catch(
              (e) => debugLogger.warn(`journal result-append failed: ${e}`)
            );
          }
          if (budget) {
            try {
              emitter?.budgetUpdated?.(budget.spent(), budget.total);
            } catch (e) {
              debugLogger.warn("emitter.budgetUpdated threw:", e);
            }
          }
          return result;
        } catch (err) {
          emitCompletion(err);
          if (budget) {
            try {
              emitter?.budgetUpdated?.(budget.spent(), budget.total);
            } catch (e) {
              debugLogger.warn("emitter.budgetUpdated threw:", e);
            }
          }
          throw err;
        }
      }).then(
        // Resolve even if the gate aborts: a successful dispatch must not
        // turn into a teardown rejection — for a fire-and-forget call the
        // script never attached a handler, so the rejection would surface
        // as a spurious process-level unhandledRejection alarm on a
        // correctly-cancelled run.
        (result) => scheduler.waitUntilRunning().then(
          () => result,
          () => result
        ),
        (error) => {
          emitCompletion(error);
          return scheduler.waitUntilRunning().then(
            () => {
              throw error;
            },
            () => {
              throw error;
            }
          );
        }
      );
    }, "countedDispatch");
    const parallelImpl = makeParallelImpl(signal, dependencyContext);
    const pipelineImpl = makePipelineImpl(signal, dependencyContext);
    const resolveSavedWorkflow = req.resolveSavedWorkflow;
    const parentSandboxRef = {
      current: void 0
    };
    const workflowImpl = resolveSavedWorkflow ? async (nameOrRef, nestedArgs) => {
      const resolved = await resolveSavedWorkflow(nameOrRef);
      const nestedSandbox = createWorkflowSandbox({
        args: nestedArgs,
        runId,
        dispatch: countedDispatch,
        parallel: parallelImpl,
        pipeline: pipelineImpl,
        abortOnTimeout: req.abortOnTimeout,
        emitter,
        budget,
        scheduler
        // No `workflow` — single-level nesting limit.
      });
      try {
        return await nestedSandbox.run(resolved.script);
      } finally {
        for (const line of nestedSandbox.getLogs()) {
          parentSandboxRef.current?.appendLog(line);
        }
      }
    } : void 0;
    const sandbox = createWorkflowSandbox({
      args: req.args,
      runId,
      dispatch: countedDispatch,
      parallel: parallelImpl,
      pipeline: pipelineImpl,
      workflow: workflowImpl,
      abortOnTimeout: req.abortOnTimeout,
      emitter,
      budget,
      scheduler
    });
    parentSandboxRef.current = sandbox;
    try {
      const result = await dependencyContext.run(
        { tails: [] },
        () => sandbox.run(req.script)
      );
      return {
        runId,
        result,
        phases: sandbox.getPhases(),
        logs: sandbox.getLogs(),
        meta: sandbox.getMeta()
      };
    } catch (err) {
      throw new WorkflowExecutionError(
        extractErrorMessage(err),
        sandbox.getPhases(),
        sandbox.getLogs(),
        sandbox.getMeta()
      );
    }
  }
};
async function settleToNullArray(thunks, signal, kind = "parallel") {
  const settled = await Promise.allSettled(
    thunks.map((t) => Promise.resolve().then(t))
  );
  if (signal?.aborted)
    throw new DOMException("Workflow run aborted.", "AbortError");
  let budgetDropped = 0;
  const result = settled.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    const reason = r.reason;
    if (reason?.name === "WorkflowBudgetExceededError") {
      budgetDropped += 1;
    } else {
      debugLogger.warn(
        `Workflow thunk at index ${i} rejected: ${String(reason?.message ?? r.reason)}`
      );
    }
    return null;
  });
  if (budgetDropped > 0) {
    debugLogger.warn(
      `${kind}: ${budgetDropped} slot${budgetDropped === 1 ? "" : "s"} dropped \u2014 token budget exceeded.`
    );
  }
  return result;
}
__name(settleToNullArray, "settleToNullArray");
function makeParallelImpl(signal, dependencyContext) {
  return (thunks) => {
    if (!Array.isArray(thunks)) {
      return Promise.reject(
        new Error(
          "parallel() expects an array of thunks (functions returning promises)."
        )
      );
    }
    for (const t of thunks) {
      if (typeof t !== "function") {
        return Promise.reject(
          new Error(
            "parallel() expects an array of functions, not values \u2014 wrap each call: parallel([() => agent(...), () => agent(...)])."
          )
        );
      }
    }
    const parent = dependencyContext.getStore();
    const inheritedTails = parent?.tails ?? [];
    const branches = thunks.map((thunk) => {
      const store = { tails: [...inheritedTails] };
      return {
        store,
        thunk: /* @__PURE__ */ __name(() => dependencyContext.run(store, thunk), "thunk")
      };
    });
    return settleToNullArray(
      branches.map(({ thunk }) => thunk),
      signal
    ).then((result) => {
      if (parent && branches.length > 0) {
        parent.tails = mergeFanoutTails(
          parent.tails,
          inheritedTails,
          branches.flatMap(({ store }) => store.tails)
        );
      }
      return result;
    });
  };
}
__name(makeParallelImpl, "makeParallelImpl");
function makePipelineImpl(signal, dependencyContext) {
  return (items, ...stages) => {
    if (!Array.isArray(items)) {
      return Promise.reject(
        new Error(
          "pipeline() expects an array of items as its first argument."
        )
      );
    }
    for (const s of stages) {
      if (typeof s !== "function") {
        return Promise.reject(
          new Error(
            "pipeline() stages must be functions: pipeline(items, item => ..., result => ...)."
          )
        );
      }
    }
    const parent = dependencyContext.getStore();
    const inheritedTails = parent?.tails ?? [];
    const branches = items.map((item, idx) => {
      const store = { tails: [...inheritedTails] };
      return {
        store,
        thunk: /* @__PURE__ */ __name(() => dependencyContext.run(
          store,
          () => runPipelineChain(item, idx, stages)
        ), "thunk")
      };
    });
    return settleToNullArray(
      branches.map(({ thunk }) => thunk),
      signal,
      "pipeline"
    ).then((result) => {
      if (parent && branches.length > 0) {
        parent.tails = mergeFanoutTails(
          parent.tails,
          inheritedTails,
          branches.flatMap(({ store }) => store.tails)
        );
      }
      return result;
    });
  };
}
__name(makePipelineImpl, "makePipelineImpl");
function mergeFanoutTails(currentParentTails, inheritedTails, branchTails) {
  const inherited = new Set(inheritedTails);
  const newBranchTails = branchTails.filter((tail) => !inherited.has(tail));
  const merged = newBranchTails.length > 0 ? [
    ...newBranchTails,
    ...currentParentTails.filter((tail) => !inherited.has(tail))
  ] : currentParentTails;
  return Array.from(new Set(merged));
}
__name(mergeFanoutTails, "mergeFanoutTails");
async function runPipelineChain(item, idx, stages) {
  let prev = item;
  for (const stage of stages) {
    if (prev === null) break;
    prev = await stage(prev, item, idx);
  }
  return prev;
}
__name(runPipelineChain, "runPipelineChain");
function extractErrorMessage(err) {
  if (err && typeof err === "object" && "message" in err) {
    const m = err.message;
    if (typeof m === "string") return m;
    return String(m);
  }
  return String(err);
}
__name(extractErrorMessage, "extractErrorMessage");

// packages/core/src/agents/runtime/workflow-runner.ts
init_esbuild_shims();
import { randomBytes as randomBytes2 } from "node:crypto";
var WorkflowRunHandle = class {
  constructor(runId, budget, registry, controller, scheduler, start) {
    this.runId = runId;
    this.budget = budget;
    this.registry = registry;
    this.controller = controller;
    this.scheduler = scheduler;
    this.completion = Promise.resolve().then(start);
  }
  static {
    __name(this, "WorkflowRunHandle");
  }
  completion;
  abort() {
    this.controller.abort();
  }
  pause() {
    return this.scheduler.pause();
  }
  resume() {
    return this.scheduler.resume();
  }
};
var WorkflowScriptNotLaunchedError = class extends Error {
  constructor(detail) {
    super(
      `Workflow script is invalid and was not launched:
${detail}

Workflow scripts must be plain JavaScript \u2014 the usual causes are TypeScript syntax (type annotations, interfaces, generics) and broken string quoting or escaping. Metadata must use literal values.`
    );
    this.detail = detail;
    this.name = "WorkflowScriptNotLaunchedError";
  }
  static {
    __name(this, "WorkflowScriptNotLaunchedError");
  }
};
var WorkflowRunner = class {
  static {
    __name(this, "WorkflowRunner");
  }
  static async start(options) {
    const config = options.config;
    const runInBackground = options.runInBackground === true;
    const budget = WorkflowBudgetImpl.fromEnv();
    const loaded = options.scriptPath && options.script === void 0 ? await resolveSavedWorkflowScript(
      { scriptPath: options.scriptPath },
      config
    ) : void 0;
    const script = loaded?.script ?? options.script ?? "";
    const scriptPath = loaded?.scriptPath ?? options.scriptPath;
    try {
      compileWorkflowScript(script);
    } catch (error) {
      throw new WorkflowScriptNotLaunchedError(
        describeWorkflowCompileError(
          error,
          script.split(/\r\n|[\n\r\u2028\u2029]/).length
        )
      );
    }
    const runId = options.resumeFromRunId ?? `wf_${randomBytes2(8).toString("hex")}`;
    const storage = config.storage;
    const journal = storage ? new WorkflowJournal(storage.getWorkflowRunJournalPath(runId)) : void 0;
    const resumeReplay = options.resumeFromRunId ? await journal?.load() : void 0;
    if (runInBackground && options.signal.aborted) {
      throw new Error("Background workflow start was cancelled.");
    }
    const callerWasAbortedBeforeStart = options.signal.aborted;
    const registry = config.getWorkflowRunRegistry?.();
    let entry;
    const isCurrentEntry = /* @__PURE__ */ __name(() => registry === void 0 || entry !== void 0 && registry.get(runId) === entry, "isCurrentEntry");
    const controller = runInBackground ? createAbortController() : createChildAbortController(options.signal);
    const dispatch = options.dispatch ?? createProductionDispatch(
      config,
      controller.signal,
      (outputTokens) => budget.recordSpent(outputTokens),
      registry ? (emitter2, dispatchId) => isCurrentEntry() ? registry.bridgeApprovalEvents(
        runId,
        emitter2,
        dispatchId,
        entry
      ) : () => void 0 : void 0
    );
    const orchestrator = new WorkflowOrchestrator(dispatch);
    try {
      entry = registry?.register({
        runId,
        toolUseId: options.toolUseId,
        meta: null,
        status: "running",
        startTime: Date.now(),
        outputFile: "",
        abortController: controller,
        tokenBudgetTotal: budget.total,
        script,
        scriptPath,
        args: options.args,
        ...options.resumeFromRunId ? {
          sourceRunId: options.resumeFromRunId,
          startMode: "retry"
        } : {},
        isBackgrounded: runInBackground
      });
    } catch (error) {
      controller.abort();
      throw error;
    }
    const emitUpdate = /* @__PURE__ */ __name(() => {
      if (!entry || !options.onUpdate || !isCurrentEntry()) return;
      try {
        options.onUpdate(entry);
      } catch {
      }
    }, "emitUpdate");
    const emitter = {
      phaseStarted: /* @__PURE__ */ __name((title) => {
        if (!isCurrentEntry()) return;
        registry?.onPhaseStarted(runId, title);
        emitUpdate();
      }, "phaseStarted"),
      agentDispatched: /* @__PURE__ */ __name(() => {
        if (!isCurrentEntry()) return;
        registry?.onAgentDispatched(runId);
        emitUpdate();
      }, "agentDispatched"),
      agentCompleted: /* @__PURE__ */ __name(() => {
        if (!isCurrentEntry()) return;
        registry?.onAgentCompleted(runId);
      }, "agentCompleted"),
      dispatchQueued: /* @__PURE__ */ __name((event) => {
        if (!isCurrentEntry()) return;
        registry?.onDispatchQueued(runId, event);
        emitUpdate();
      }, "dispatchQueued"),
      dispatchStarted: /* @__PURE__ */ __name((dispatchId, startedAt) => {
        if (!isCurrentEntry()) return;
        registry?.onDispatchStarted(runId, dispatchId, startedAt);
        emitUpdate();
      }, "dispatchStarted"),
      dispatchSettled: /* @__PURE__ */ __name((dispatchId, error, endedAt) => {
        if (!isCurrentEntry()) return;
        registry?.onDispatchSettled(
          runId,
          dispatchId,
          error,
          endedAt,
          !runInBackground && options.signal.aborted
        );
        emitUpdate();
      }, "dispatchSettled"),
      // The registry records this without firing a status update, avoiding a
      // TUI redraw per line while retaining the real replay timestamp.
      logAppended: /* @__PURE__ */ __name((line) => {
        if (!isCurrentEntry()) return;
        registry?.onLogAppended(runId, line);
      }, "logAppended"),
      budgetUpdated: /* @__PURE__ */ __name((spent, total) => {
        if (!isCurrentEntry()) return;
        registry?.onBudgetUpdated(runId, spent, total);
        emitUpdate();
      }, "budgetUpdated")
    };
    const scheduler = new WorkflowDispatchScheduler(
      resolveConcurrencyLimit(),
      controller.signal,
      ({ state }) => {
        if (!isCurrentEntry()) return;
        registry?.onDispatchStateChange(runId, state);
      }
    );
    const handle = new WorkflowRunHandle(
      runId,
      budget,
      registry,
      controller,
      scheduler,
      async () => {
        try {
          const outcome = await orchestrator.run({
            script,
            args: options.args,
            abortOnTimeout: controller,
            runId,
            emitter,
            budget,
            resolveSavedWorkflow: /* @__PURE__ */ __name((ref) => resolveSavedWorkflowScript(ref, config), "resolveSavedWorkflow"),
            journal,
            resumeReplay,
            scheduler
          });
          if (entry) {
            entry.meta = outcome.meta;
            if (outcome.meta?.name && entry.description === runId) {
              entry.description = outcome.meta.name;
            }
          }
          registry?.setRecentLogs(runId, outcome.logs);
          if (entry && isTerminalWorkflowStatus(entry.status)) {
            return {
              ok: false,
              message: entry.status === "cancelled" ? "Workflow run cancelled." : entry.error ?? "Workflow run failed."
            };
          }
          registry?.complete(runId, outcome.result, Date.now());
          return { ok: true, outcome };
        } catch (error) {
          const details = error instanceof WorkflowExecutionError ? error : void 0;
          const message = extractErrorMessage2(error);
          if (entry && details?.meta && !entry.meta) entry.meta = details.meta;
          if (details?.logs) registry?.setRecentLogs(runId, details.logs);
          if (callerWasAbortedBeforeStart || !runInBackground && options.signal.aborted || entry?.status === "cancelled") {
            registry?.cancel(runId, Date.now());
          } else {
            registry?.fail(runId, message, Date.now());
          }
          return { ok: false, message, details };
        } finally {
          controller.abort();
          if (entry && isTerminalWorkflowStatus(entry.status)) {
            const telemetryEvent = new WorkflowRunEvent({
              status: entry.status,
              agents_dispatched: entry.agentsDispatched,
              agents_completed: entry.agentsCompleted,
              phase_count: entry.phases.length,
              tokens_spent: entry.tokensSpent,
              duration_ms: (entry.endTime ?? entry.startTime) - entry.startTime
            });
            await writeWorkflowSnapshot(config, entry);
            await journal?.drain();
            try {
              logWorkflowRun(config, telemetryEvent);
            } catch {
            }
          }
          registry?.releaseHandle(runId, handle);
        }
      }
    );
    registry?.attachHandle(handle);
    return handle;
  }
};
function extractErrorMessage2(error) {
  if (error && typeof error === "object" && "message" in error) {
    const message = error.message;
    if (typeof message === "string") return message;
    return String(message);
  }
  return String(error);
}
__name(extractErrorMessage2, "extractErrorMessage");

// packages/core/src/tools/workflow/workflow.ts
import { promises as fs } from "node:fs";
import * as path from "node:path";
var WORKFLOW_PARAM_SCHEMA = {
  type: "object",
  properties: {
    script: {
      type: "string",
      description: `JavaScript source of the workflow. Wrapped as an async IIFE. May call the injected globals \`phase(title)\`, \`log(msg)\`, \`agent(prompt, opts?)\`, and read \`args\`. agent() opts: \`{ label?, phase?, schema?, model?, agentType?, isolation?, workingDir?, stallMs? }\`. \`schema\` (JSON Schema object): the subagent must deliver its result by calling \`structured_output\` with arguments matching the schema; agent() resolves to the validated object. Two failed attempts produce a terminal error "subagent completed without calling StructuredOutput (after 2 in-conversation nudges)". \`agentType\` (string): resolves against the declarative-agents registry (\`.qwen/agents/<name>.md\`, project then user then built-in). Unresolved names throw "agent({agentType}): agent type 'X' not found". \`model\` (string): per-call model override; routes provider correctly via the subagent runtime view. \`isolation\`: \`'worktree'\` provisions a fresh git worktree under \`<projectRoot>/.qwen/worktrees/agent-<7hex>\`; the worktree is auto-removed if no changes, otherwise the path and branch are returned alongside the result. \`'remote'\` throws "agent({isolation:'remote'}) is not available in this build" (parity with upstream). isolation=worktree refuses to run when the parent working tree has uncommitted changes (the subagent would see a stale HEAD). \`workingDir\` (string): pin the subagent to an EXISTING git worktree of this repository that the caller owns \u2014 nothing is created and nothing is removed. Use it when the directory the agent must work in already exists and its uncommitted state is the point (a review worktree, a checkout a previous step provisioned) \u2014 exactly the case isolation cannot serve. Mutually exclusive with \`isolation\`. The path must be a linked worktree of this repository registered via \`git worktree add\` (it may live anywhere on disk) \u2014 the main checkout is not eligible. \`stallMs\` (number, ms): a no-progress watchdog, not a wall-clock cap. The dispatch is aborted and retried (up to ${MAX_STALL_ATTEMPTS} attempts total) after this many milliseconds with no observable subagent progress \u2014 including before the first response arrives; the timer is suspended while a tool is in flight, so a legitimately slow tool is not a stall. Default ${DEFAULT_STALL_MS} (override via \`${MAX_WORKFLOW_STALL_MS_ENV}\`, whole seconds); \`0\` disables the watchdog. Wall time per attempt is bounded separately. Workflow subagents always have SendMessage / Monitor / EnterPlanMode / ExitPlanMode in their disallowed-tool floor regardless of agentType. Concurrency: \`parallel([() => agent(...), ...])\` runs thunks through a shared per-run window (default \`max(1, min(16, cpus-2))\` agents in flight; override via \`${MAX_WORKFLOW_CONCURRENCY_ENV}\`) and resolves to a position-aligned array \u2014 a thunk that throws, or resolves to a non-JSON-serializable value, becomes \`null\` at its index (errors-as-data); parallel() itself rejects only on invalid arguments or abort. \`pipeline(items, ...stages)\` runs each item through the stages (staggered, no inter-stage barrier); a stage that throws, returns \`null\`, or returns a non-JSON-serializable value drops that item to \`null\`. Pass THUNKS to parallel, not eager calls: \`parallel([() => agent(...)])\`, not \`parallel([agent(...)])\`. At most ${DEFAULT_MAX_AGENTS_PER_RUN} agent() calls per run (override via \`${MAX_WORKFLOW_AGENTS_ENV}\`). \`Date.now()\` and \`Math.random()\` both throw \u2014 workflow scripts must be deterministic for resume. \`export const meta = {...}\` declarations are stripped before execution.`
    },
    scriptPath: {
      type: "string",
      description: "Optional. Absolute path to a workflow `.js` file to load and run instead of inline `script`. Primarily set by the `/<name>` saved-workflow slash command; a tool that generated a script for this run hands you its path the same way. The file must resolve inside a saved-workflow directory (`.qwen/workflows`, `~/.qwen/workflows`) or the generated-scripts root (`$QWEN_CODE_PROJECT_DIR/workflows/generated` \u2014 the per-project runtime dir, not the project tree) \u2014 any other path is refused. Provide exactly ONE of `script` or `scriptPath`. The file is read at execution time, so edits to a saved workflow take effect on the next run."
    },
    args: {
      description: "Optional structured value bound to the `args` global. Pass actual JSON, not a stringified value."
    },
    resumeFromRunId: {
      type: "string",
      description: "Optional. Resume a prior workflow run by id (e.g. wf_abc123\u2026). Re-runs the SAME script; agent() calls whose rolling prefix-hash (prompt + opts, chained in call order) matches a journaled result are served from cache for the longest unchanged prefix, and the first changed/missing call onward runs live. Pass the same script and args as the original run for the cache to apply."
    },
    run_in_background: {
      type: "boolean",
      default: false,
      description: "Optional. When true, start the workflow under the interactive session and return a run handle immediately. The Background Tasks view can observe, cooperatively pause/resume, or stop it, and completion is delivered to the conversation when the run settles. Interactive TUI only. Defaults to false."
    }
  }
  // `script` is required UNLESS `scriptPath` is supplied; this XOR can't be
  // expressed as a plain `required` list, so it's enforced in
  // `validateToolParamValues`. Inline authoring (the LLM path) should always
  // pass `script`; the `scriptPath` property description states the XOR.
};
var WorkflowToolInvocation = class extends BaseToolInvocation {
  constructor(config, toolOptions, params) {
    super(params);
    this.config = config;
    this.toolOptions = toolOptions;
  }
  static {
    __name(this, "WorkflowToolInvocation");
  }
  callId;
  setCallId(callId) {
    this.callId = callId;
  }
  /**
   * Cache so the transcript header and the approval dialog cannot disagree,
   * and so an oversized script is scanned once per invocation rather than
   * once per surface that asks.
   */
  metaCache;
  resolveMeta() {
    if (this.metaCache === void 0) {
      this.metaCache = this.params.script ? readMetaForConfirmation(this.params.script) : null;
    }
    return this.metaCache;
  }
  getDescription() {
    const meta = this.resolveMeta();
    if (meta) {
      return `Run workflow: ${sanitizeLine(meta.name)}`;
    }
    if (this.params.scriptPath && this.params.script === void 0) {
      const kind = isGeneratedWorkflowScriptPath(
        this.config,
        this.params.scriptPath
      ) ? "generated workflow script" : "saved workflow";
      return `Run ${kind} (${path.basename(this.params.scriptPath)})`;
    }
    return `Run a workflow script (${this.params.script?.length ?? 0} chars)`;
  }
  toolLocations() {
    return [];
  }
  getDefaultPermission() {
    return Promise.resolve("ask");
  }
  /**
   * Show what is about to run, and scope the grant that approves it.
   *
   * Without this override the base class renders `Confirm WorkflowTool` over
   * `Run a workflow script (4127 chars)` — a character count standing in for
   * arbitrary model-authored JavaScript that may fan out to
   * `DEFAULT_MAX_AGENTS_PER_RUN` subagents, provision git worktrees and spend
   * an uncapped token budget. The asymmetry is visible within one run: the
   * subagent approvals this workflow bubbles up each get a full dialog.
   *
   * Two properties of the grant matter as much as the disclosure:
   *
   *   - An inline `script` can never be pre-approved. It is fresh
   *     model-authored source every time, so a blanket "always allow" would
   *     transfer consent from the script the user read to every script the
   *     model writes afterwards. `hideAlwaysAllow` removes the option and the
   *     empty `permissionRules` stops `injectPermissionRulesIfMissing` from
   *     supplying the bare-tool-name rule, which `buildPermissionRules`
   *     documents as matching *all* invocations.
   *   - A `scriptPath` names a file on disk that the user chose, so it can be
   *     pre-approved — but scoped to that path. The rule is built with the
   *     same helpers the matcher uses so a tool rename moves both sides.
   */
  async getConfirmationDetails(_abortSignal) {
    const meta = this.resolveMeta();
    const isGeneratedScriptPath = this.params.scriptPath !== void 0 && await isGeneratedWorkflowScriptPathCanonical(
      this.config,
      this.params.scriptPath
    );
    const body = buildConfirmationPrompt(
      this.params,
      meta,
      isGeneratedScriptPath
    );
    const banner = resolveUsageBanner(
      this.config,
      this.config.getWorkflowRunRegistry?.(),
      resolveMaxTokensPerWorkflow()
    );
    const isInlineScript = this.params.script !== void 0;
    const details = {
      type: "info",
      title: "Run a dynamic workflow?",
      prompt: banner ? `${banner}${body}` : body,
      // The body is a script excerpt and a phase list: rendering it as
      // Markdown would swallow the very characters the reader needs to see.
      renderPromptAsPlainText: true,
      hideAlwaysAllow: isInlineScript,
      permissionRules: isInlineScript ? [] : [
        `${getRuleDisplayName(resolveToolName(ToolNames.WORKFLOW))}(scriptPath:${this.params.scriptPath})`
      ],
      onConfirm: /* @__PURE__ */ __name(async (_outcome, _payload) => {
      }, "onConfirm")
    };
    return details;
  }
  async execute(signal, updateOutput, _shellExecutionConfig) {
    const runInBackground = this.params.run_in_background === true;
    if (runInBackground && signal.aborted) {
      return backgroundStartCancelledResult();
    }
    let handle;
    try {
      handle = await WorkflowRunner.start({
        config: this.config,
        signal,
        toolUseId: this.callId,
        script: this.params.script,
        scriptPath: this.params.scriptPath,
        args: this.params.args,
        resumeFromRunId: this.params.resumeFromRunId,
        dispatch: this.toolOptions.dispatch,
        runInBackground,
        onUpdate: !runInBackground && updateOutput ? (entry) => safeEmitUpdate(updateOutput, entry) : void 0
      });
    } catch (error) {
      if (runInBackground && signal.aborted) {
        return backgroundStartCancelledResult();
      }
      if (error instanceof WorkflowScriptNotLaunchedError) {
        return {
          llmContent: [{ text: error.message }],
          returnDisplay: error.message,
          error: {
            message: error.message,
            type: "invalid_tool_params" /* INVALID_TOOL_PARAMS */
          }
        };
      }
      throw error;
    }
    if (runInBackground) {
      const status = handle.registry?.get(handle.runId)?.status ?? "running";
      const usageBanner = resolveUsageBanner(
        this.config,
        handle.registry,
        handle.budget.total
      );
      return {
        workflowRunId: handle.runId,
        llmContent: [
          {
            text: `Workflow started in background.
Run ID: ${handle.runId}
Status: ${status}`
          }
        ],
        returnDisplay: usageBanner + `Workflow ${handle.runId} started in the background (status: ${status}). Use Background Tasks to observe, cooperatively pause/resume, or stop it.`
      };
    }
    const settlement = await handle.completion;
    if (settlement.ok) {
      const { outcome } = settlement;
      const usageBanner = resolveUsageBanner(
        this.config,
        handle.registry,
        handle.budget.total
      );
      const llmText = safeStringifyResult(outcome.result);
      const displayJson = safeStringifyDisplayPayload({
        runId: outcome.runId,
        ...outcome.meta ? { meta: outcome.meta } : {},
        phases: outcome.phases,
        logs: outcome.logs,
        result: outcome.result,
        // P5: surface the per-run token total in the terminal display so
        // the user sees actual usage even without opening the dialog.
        // P5 R1 (#11): align with `buildLivePhaseTreeDisplay` — include
        // tokens whenever ANY usage is reported OR a cap is set, not
        // only when spend > 0. A capped-but-zero-spend run still wants
        // the cap visible so the user sees the gate engaged.
        ...handle.budget.spent() > 0 || handle.budget.total !== null ? {
          tokens: {
            spent: handle.budget.spent(),
            total: handle.budget.total
          }
        } : {}
      });
      return {
        llmContent: [{ text: llmText }],
        returnDisplay: usageBanner + "```json\n" + displayJson + "\n```"
      };
    } else {
      const { message, details } = settlement;
      const { phases, logs, meta } = details ?? {};
      const display = phases || logs || meta ? `Workflow failed: ${message}

${safeStringifyDisplayPayload({
        ...meta ? { meta } : {},
        phases: phases ?? [],
        logs: logs ?? []
      })}` : `Workflow failed: ${message}`;
      return {
        llmContent: [{ text: `Workflow failed: ${message}` }],
        returnDisplay: display,
        // FIX-10 (REUSE-I1): use the standard ToolErrorType.EXECUTION_FAILED
        // code so error routing / dashboards can classify workflow failures
        // the same way as other execution-time tool errors.
        error: { message, type: "execution_failed" /* EXECUTION_FAILED */ }
      };
    }
  }
};
function backgroundStartCancelledResult() {
  return {
    llmContent: "Workflow was cancelled before it could start.",
    returnDisplay: "Workflow cancelled."
  };
}
__name(backgroundStartCancelledResult, "backgroundStartCancelledResult");
function buildLivePhaseTreeDisplay(entry) {
  const payload = {
    runId: entry.runId,
    ...entry.meta ? { meta: entry.meta } : {},
    status: entry.status,
    currentPhase: entry.currentPhase,
    phases: entry.phases,
    agentsDispatched: entry.agentsDispatched,
    agentsCompleted: entry.agentsCompleted
  };
  if (entry.tokensSpent > 0 || entry.tokenBudgetTotal !== null) {
    payload["tokens"] = {
      spent: entry.tokensSpent,
      total: entry.tokenBudgetTotal
    };
  }
  try {
    return "```json\n" + JSON.stringify(payload, null, 2) + "\n```";
  } catch {
    return `Workflow ${entry.runId} \u2014 ${entry.status} \u2014 ${entry.phases.length} phase(s)`;
  }
}
__name(buildLivePhaseTreeDisplay, "buildLivePhaseTreeDisplay");
function resolveUsageBanner(config, registry, budgetTotal) {
  if (!registry) return "";
  if (config.getSkipWorkflowUsageWarning?.()) return "";
  if (!registry.shouldShowUsageWarning()) return "";
  return buildUsageBanner(budgetTotal);
}
__name(resolveUsageBanner, "resolveUsageBanner");
var CONFIRM_SCRIPT_EXCERPT_CHARS = 1200;
var CONFIRM_ARGS_CHARS = 300;
var CONFIRM_MAX_PHASES = 12;
function sanitizeLine(text) {
  return stripAnsiAndControl(text);
}
__name(sanitizeLine, "sanitizeLine");
function sanitizeBlock(text) {
  return text.replace(/\t/g, "  ").split("\n").map((line) => stripAnsiAndControl(line)).join("\n");
}
__name(sanitizeBlock, "sanitizeBlock");
function clampForDisplay(text, max) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}
\u2026 (${text.length - max} more characters)`;
}
__name(clampForDisplay, "clampForDisplay");
function readMetaForConfirmation(script) {
  try {
    return extractAndStripMeta(script).meta;
  } catch {
    return null;
  }
}
__name(readMetaForConfirmation, "readMetaForConfirmation");
function isGeneratedWorkflowScriptPath(config, scriptPath) {
  return isWithinRoot(scriptPath, config.storage.getGeneratedWorkflowsDir());
}
__name(isGeneratedWorkflowScriptPath, "isGeneratedWorkflowScriptPath");
async function isGeneratedWorkflowScriptPathCanonical(config, scriptPath) {
  const root = config.storage.getGeneratedWorkflowsDir();
  if (await isSymlinkedRoot(root)) return false;
  let realScriptPath;
  try {
    realScriptPath = await fs.realpath(scriptPath);
  } catch {
    return isWithinRoot(scriptPath, root);
  }
  let realRoot;
  try {
    realRoot = await fs.realpath(root);
  } catch {
    realRoot = path.resolve(root);
  }
  return isWithinRoot(realScriptPath, realRoot);
}
__name(isGeneratedWorkflowScriptPathCanonical, "isGeneratedWorkflowScriptPathCanonical");
function buildConfirmationPrompt(params, meta, isGeneratedScriptPath) {
  const lines = [];
  if (meta) {
    lines.push(`Workflow: ${sanitizeLine(meta.name)}`);
    lines.push(sanitizeLine(meta.description));
  } else if (params.scriptPath) {
    const label = isGeneratedScriptPath ? "Generated workflow script" : "Saved workflow";
    lines.push(`${label}: ${sanitizeLine(params.scriptPath)}`);
  } else {
    lines.push("Workflow: (the script declares no meta block)");
  }
  if (meta?.phases?.length) {
    const shown = meta.phases.slice(0, CONFIRM_MAX_PHASES);
    lines.push("", `Phases (${meta.phases.length}):`);
    shown.forEach((phase, i) => {
      const detail = phase.detail ? ` \u2014 ${sanitizeLine(phase.detail)}` : "";
      lines.push(`  ${i + 1}. ${sanitizeLine(phase.title)}${detail}`);
    });
    if (meta.phases.length > shown.length) {
      lines.push(`  \u2026 and ${meta.phases.length - shown.length} more`);
    }
  }
  if (params.scriptPath && meta) {
    lines.push("", `Loaded from: ${sanitizeLine(params.scriptPath)}`);
  }
  if (params.resumeFromRunId) {
    lines.push("", `Resuming run: ${sanitizeLine(params.resumeFromRunId)}`);
  }
  if (params.args !== void 0) {
    let rendered;
    try {
      rendered = JSON.stringify(params.args) ?? String(params.args);
    } catch {
      rendered = "(args are not JSON-serializable)";
    }
    lines.push(
      "",
      `Args: ${clampForDisplay(sanitizeLine(rendered), CONFIRM_ARGS_CHARS)}`
    );
  }
  if (params.script) {
    lines.push(
      "",
      "Script:",
      clampForDisplay(
        sanitizeBlock(params.script),
        CONFIRM_SCRIPT_EXCERPT_CHARS
      )
    );
  }
  return lines.join("\n");
}
__name(buildConfirmationPrompt, "buildConfirmationPrompt");
function buildUsageBanner(total) {
  if (total === null) {
    return `> Workflows have no per-run token cap. Set \`${MAX_TOKENS_PER_WORKFLOW_ENV}=<n>\` (env) for a soft cap. Suppress this notice with \`skipWorkflowUsageWarning: true\` in settings.

`;
  }
  return `> Workflow token cap is ${total} (per \`${MAX_TOKENS_PER_WORKFLOW_ENV}\`). Suppress this notice with \`skipWorkflowUsageWarning: true\` in settings.

`;
}
__name(buildUsageBanner, "buildUsageBanner");
function safeEmitUpdate(updateOutput, entry) {
  if (!updateOutput || !entry) return;
  try {
    updateOutput(buildLivePhaseTreeDisplay(entry));
  } catch {
  }
}
__name(safeEmitUpdate, "safeEmitUpdate");
function safeStringifyResult(result) {
  if (result === void 0) return "(workflow returned no value)";
  if (typeof result === "string") return result;
  try {
    return JSON.stringify(result, null, 2);
  } catch {
    return `(workflow returned a non-JSON-serializable value of type ${typeof result})`;
  }
}
__name(safeStringifyResult, "safeStringifyResult");
function safeStringifyDisplayPayload(payload) {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    if (payload && typeof payload === "object") {
      const sanitized = {};
      for (const [key, value] of Object.entries(payload)) {
        try {
          JSON.stringify(value);
          sanitized[key] = value;
        } catch {
          sanitized[key] = `(non-JSON-serializable value of type ${typeof value})`;
        }
      }
      try {
        return JSON.stringify(sanitized, null, 2);
      } catch {
      }
    }
    return "(display payload not JSON-serializable)";
  }
}
__name(safeStringifyDisplayPayload, "safeStringifyDisplayPayload");
var WORKFLOW_TOOL_DESCRIPTION = `Execute a workflow script that orchestrates subagents deterministically.

**Only on an explicit request**

Do not call this tool unless the user has asked for multi-agent orchestration. A run can dispatch up to ${DEFAULT_MAX_AGENTS_PER_RUN} subagents and spend tokens accordingly, so that scale has to be requested rather than inferred. It counts as requested when any of these holds:

- The user's message contains the word \`workflow\`; a system reminder confirms it when it does.
- The user asked for orchestration in their own words \u2014 run a workflow, fan out agents, orchestrate this with subagents.
- A skill or slash command the user invoked instructs you to use this tool.
- The user named a saved workflow to run, reached through \`workflow('<name>')\` or \`scriptPath\`.
- The user asked to resume or continue an earlier run, which is \`resumeFromRunId\`.

Otherwise do not call it, however well the task would parallelize. Do the work in the main loop, or spawn a single subagent for one self-contained piece. When a workflow would genuinely be the better tool, say in one sentence what it would fan out over and roughly how many agents that is, then let the user decide \u2014 and mention that including the word \`workflow\` next time skips the ask.

**What a workflow is for**

Reach for one to be comprehensive (decompose the work and cover every part in parallel), to be confident (independent perspectives and adversarial checks before an answer is committed to), or to take on scale a single context cannot hold \u2014 migrations, audits, broad sweeps. The script is where that structure is encoded: what fans out, what verifies, what synthesizes. Parallelism on its own is not a reason; work that is already one short sequence of edits belongs in the main loop.

**Runtime** \u2014 see the \`script\` parameter for the detailed authoring contract.

\`phase(title)\`, \`log(msg)\`, \`agent(prompt, opts?)\`, \`parallel(thunks)\`, \`pipeline(items, ...stages)\`, \`workflow(nameOrRef, args?)\`, plus the \`args\` and \`budget\` globals. \`workflow()\` runs a saved workflow inline under this run's caps and nests one level only \u2014 a workflow reached through \`workflow()\` cannot call \`workflow()\` itself, and doing so throws. Saved workflows are \`<name>.js\` files under \`<projectRoot>/.qwen/workflows\` (project scope, also surfaced as \`/<name>\` slash commands) or \`~/.qwen/workflows\` (user scope, lower precedence when both define the same name); \`workflow('<name>')\` resolves against those two directories, while \`scriptPath\` takes an absolute path to a script inside either of them or inside the generated-scripts root (\`$QWEN_CODE_PROJECT_DIR/workflows/generated\` \u2014 the per-project runtime dir, not the project tree \u2014 where a tool emitting a one-run script writes it; never a slash command, never resolvable by name); a path outside those roots is refused. Default \`max(1, min(16, cpus-2))\` agents in flight per run (\`${MAX_WORKFLOW_CONCURRENCY_ENV}\`), up to ${DEFAULT_MAX_AGENTS_PER_RUN} agents total (\`${MAX_WORKFLOW_AGENTS_ENV}\`), under a 30-minute wall-clock cap per run (\`QWEN_CODE_MAX_WORKFLOW_SECONDS\`) \u2014 a fan-out near the agent cap will not fit inside the default cap. Each subagent attempt is separately capped at ${DEFAULT_WORKFLOW_SUBAGENT_MAX_TURNS} turns (\`${WORKFLOW_SUBAGENT_MAX_TURNS_ENV}\`) and ${DEFAULT_WORKFLOW_SUBAGENT_MAX_TIME_MINUTES} minutes (\`${WORKFLOW_SUBAGENT_MAX_MINUTES_ENV}\`) \u2014 an attempt that hits either becomes \`null\` in \`parallel()\`/\`pipeline()\`, indistinguishable from a missing agent, so raise them for legitimately long work. A per-run output-token cap may also be in effect: read \`budget.total\` (\`null\` = uncapped) before committing to a large fan-out, because once the cap is reached every further \`agent()\` call is refused \u2014 a bare sequential \`await agent()\` sees the rejection, while inside \`parallel()\`/\`pipeline()\` the refused slot becomes \`null\` and the script keeps running on partial results. Per-call \`agent({ schema, agentType, model, isolation: 'worktree', workingDir, stallMs })\` covers structured-output contracts, declarative-agent selection, model override, git-worktree-isolated subagents, pinning an agent to a caller-owned worktree, and the no-progress stall watchdog (\`stallMs: 0\` disables it). \`resumeFromRunId\` resumes a prior run \u2014 agent() calls whose rolling prefix-hash matches the journal are served from cache for the longest unchanged prefix. Runs appear in the background-tasks view and the \`/workflows\` dialog (live phase tree, token usage, cooperative pause/resume, cancel); \`run_in_background: true\` returns a run handle immediately in the interactive TUI and delivers completion through the conversation. Scripts run in a node:vm sandbox with no filesystem or shell access \u2014 all I/O happens through the spawned agents.

**Scout first, then orchestrate**

The strongest pattern is hybrid: discover the work list in the main loop (list the files, scope the diff, read the failing test), then hand that list to a workflow. You do not need to know the shape of the work before the task \u2014 only before the orchestration step. When the work has distinct phases, run several small workflows across turns and read each result before choosing the next, rather than authoring one large script that runs unattended.

Common single-phase shapes: understand (parallel readers over subsystems, merged into one map), design (independent approaches, judged, then synthesized), review (dimensions, find, verify each finding), research (broad sweep, deep read, synthesis), migrate (discover sites, transform each under \`isolation: 'worktree'\`, verify).

**Default to \`pipeline()\`**

\`pipeline()\` runs each item through every stage independently \u2014 item A can be in stage 3 while item B is still in stage 1 \u2014 so wall-clock is the slowest single chain. \`parallel()\` is a barrier: it waits for every thunk before anything moves on, so it costs the slowest item of every stage.

A barrier is right only when a stage genuinely needs cross-item context: deduplicating or merging across the full result set before expensive downstream work, exiting early when the total count is zero, or a prompt that compares one finding against all the others. It is not justified by needing to flatten, map, or filter between stages (do that inside a pipeline stage), by two stages being conceptually separate, or by the code reading more tidily. Smell test: \`parallel()\` \u2192 a pure transform \u2192 \`parallel()\` is a pipeline someone wrote with an unnecessary barrier. When in doubt, \`pipeline()\`.

**Verify before believing**

A subagent's answer is a claim, not a result. For findings that matter, spawn independent verifiers prompted to *refute*, and drop what a majority refutes. When a claim can be wrong in several different ways, give each verifier a distinct lens (correctness, security, performance, does it actually reproduce) \u2014 diversity catches what repetition cannot. For a wide solution space, generate several independent attempts, judge them in parallel, and synthesize from the winner while grafting the best ideas from the rest.

**Converge deliberately**

For discovery of unknown size, keep running finders until some number of consecutive rounds turn up nothing new; a fixed round count stops partway into the tail. Deduplicate each round against everything already seen, never against only what survived judging \u2014 otherwise rejected findings reappear every round and the loop never terminates. A closing pass that asks what is still missing (a search angle never run, a claim never verified, a file never read) usually produces the next round of real work.

**Report honestly**

Scale the fleet to what was actually asked: a quick check gets a few agents and one verification pass; an explicit request to be thorough or exhaustive earns a larger pool and a multi-vote adversarial round. Whenever a run bounds its own coverage \u2014 top-N, sampling, no retry \u2014 \`log()\` what was dropped. Silent truncation reads as full coverage, which is worse than a smaller honest result.

These shapes are a starting point, not a menu; compose the harness the task actually needs.`;
var WorkflowTool = class extends BaseDeclarativeTool {
  constructor(config, toolOptions = {}) {
    super(
      ToolNames.WORKFLOW,
      ToolDisplayNames.WORKFLOW,
      WORKFLOW_TOOL_DESCRIPTION,
      "other" /* Other */,
      WORKFLOW_PARAM_SCHEMA,
      /* isOutputMarkdown */
      true,
      /* canUpdateOutput */
      true
    );
    this.config = config;
    this.toolOptions = toolOptions;
  }
  static {
    __name(this, "WorkflowTool");
  }
  validateToolParamValues(params) {
    const hasScript = typeof params.script === "string" && params.script.length > 0;
    const hasPath = typeof params.scriptPath === "string" && params.scriptPath.length > 0;
    if (!hasScript && !hasPath) {
      return "WorkflowTool: provide `script` (inline source) or `scriptPath` (a workflow script file).";
    }
    if (hasScript && hasPath) {
      return "WorkflowTool: provide exactly one of `script` or `scriptPath`, not both.";
    }
    if (params.resumeFromRunId !== void 0 && !/^wf_[0-9a-f]+$/.test(params.resumeFromRunId)) {
      return "WorkflowTool: `resumeFromRunId` must match the generated id format `wf_<hex>`.";
    }
    if (params.run_in_background === true) {
      if (!this.config.isInteractive() || this.config.getExperimentalZedIntegration?.() === true) {
        return "WorkflowTool: `run_in_background` is available only in the interactive TUI.";
      }
      if (!this.config.getWorkflowRunRegistry().hasCompletionCallback()) {
        return "WorkflowTool: `run_in_background` requires an active workflow completion channel.";
      }
    }
    return null;
  }
  createInvocation(params) {
    return new WorkflowToolInvocation(this.config, this.toolOptions, params);
  }
};
export {
  WorkflowTool
};
/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
