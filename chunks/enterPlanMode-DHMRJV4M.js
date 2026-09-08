// Force strict mode and setup for ESM
"use strict";
import {
  getPlanModeSystemReminder
} from "./chunk-CAUDTPEJ.js";
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
import {
  buildSubagentPlanToolBlockedResult,
  isPlanLifecycleToolUnavailableInSubagent
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
import "./chunk-CMHFCLBU.js";
import "./chunk-S6LOFUVP.js";
import "./chunk-2LD5U7Q3.js";
import "./chunk-DJ2GSRLV.js";
import "./chunk-J2OSJFP3.js";
import "./chunk-K2OJUPOE.js";
import "./chunk-CFKIH3D3.js";
import "./chunk-4FTKQNWJ.js";
import "./chunk-Y3QL45LS.js";
import "./chunk-PYYYZTFK.js";
import "./chunk-YRLW2MSX.js";
import "./chunk-VGC4I5JJ.js";
import "./chunk-3I6UTTDX.js";
import "./chunk-6PJOTWAN.js";
import "./chunk-BWORX6FA.js";
import "./chunk-WZAD4ZNJ.js";
import "./chunk-FPGTNKCP.js";
import "./chunk-6DIGWMGT.js";
import "./chunk-TDRR52AF.js";
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

// packages/core/src/tools/enterPlanMode.ts
init_esbuild_shims();
var debugLogger = createDebugLogger("ENTER_PLAN_MODE");
var enterPlanModeToolDescription = `Use this tool only after the user explicitly asks to switch into plan mode or confirms they want plan mode. Entering plan mode is a privilege reduction, so it does not require user confirmation at execution time.

## When to Use This Tool
Use this tool when the user has opted into plan mode for a task that should be read-only while the plan is formed, such as multi-file changes, design choices, or ambiguous requirements.

## When NOT to Use This Tool
Do not use this tool just because a task involves planning, is complex, or requires investigation. In the current mode, you can still think, inspect files, ask clarifying questions, and present a plan without switching modes.

## Important
If plan mode seems helpful but the user has not asked for it, ask first. Do NOT use this tool if the user has explicitly asked you not to use plan mode.`;
var enterPlanModeToolSchemaData = {
  name: "enter_plan_mode",
  description: enterPlanModeToolDescription,
  parametersJsonSchema: {
    type: "object",
    properties: {
      userRequested: {
        type: "boolean",
        description: "Set to true ONLY when the user explicitly asked for plan mode in this turn, or explicitly confirmed they want it. Leave unset (or false) when you are deciding to plan on your own without the user asking. In YOLO mode, an explicit user request will not take effect unless this is true."
      }
    },
    additionalProperties: false,
    $schema: "http://json-schema.org/draft-07/schema#"
  }
};
var EnterPlanModeToolInvocation = class extends BaseToolInvocation {
  constructor(config, params) {
    super(params);
    this.config = config;
  }
  static {
    __name(this, "EnterPlanModeToolInvocation");
  }
  getDescription() {
    return "Enter plan mode";
  }
  /**
   * Entering plan mode lowers privileges, so it is always allowed without a
   * confirmation prompt.
   */
  async getDefaultPermission() {
    return "allow";
  }
  async execute(_signal) {
    if (isPlanLifecycleToolUnavailableInSubagent(ToolNames.ENTER_PLAN_MODE)) {
      return buildSubagentPlanToolBlockedResult(
        ToolNames.ENTER_PLAN_MODE,
        "EnterPlanModeTool",
        debugLogger
      );
    }
    if (this.config.getApprovalMode() === "yolo" /* YOLO */ && !this.params.userRequested) {
      debugLogger.info(
        "Blocked model-initiated plan entry from YOLO (userRequested=%s)",
        this.params.userRequested
      );
      return {
        llmContent: "Plan mode was not entered: the session is in YOLO mode, which the user explicitly chose for low-friction execution. Continue investigating and presenting your plan in the current mode without switching. If the user explicitly asked for plan mode in this turn, retry this tool call with userRequested: true.",
        returnDisplay: "Stayed in YOLO mode (plan mode not entered)."
      };
    }
    const isAcpMode = this.config.getExperimentalZedIntegration?.() || this.config.getInputFormat?.() === "stream-json" /* STREAM_JSON */;
    if (!this.config.isInteractive() && !isAcpMode) {
      return {
        llmContent: "Cannot enter plan mode in non-interactive mode without ACP support. The gate exit paths require user interaction.",
        returnDisplay: "Plan mode unavailable in non-interactive mode."
      };
    }
    try {
      if (this.config.getApprovalMode() !== "plan" /* PLAN */) {
        this.config.setApprovalMode("plan" /* PLAN */);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      debugLogger.error(
        `[EnterPlanModeTool] Failed to set approval mode to plan: ${errorMessage}`
      );
      return {
        llmContent: `Failed to enter plan mode: ${errorMessage}`,
        returnDisplay: `Error entering plan mode: ${errorMessage}`
      };
    }
    try {
      const registry = this.config.getToolRegistry();
      const exitPlanModeName = ToolNames.EXIT_PLAN_MODE;
      const revealedBefore = registry.isDeferredToolRevealed(exitPlanModeName);
      if (!revealedBefore) {
        registry.revealDeferredTool(exitPlanModeName);
        const geminiClient = this.config.getGeminiClient();
        if (geminiClient) {
          try {
            await geminiClient.setTools();
          } catch (setErr) {
            registry.unrevealDeferredTool(exitPlanModeName);
            debugLogger.error(
              `[EnterPlanModeTool] Failed to sync exit_plan_mode tool declaration: ${setErr instanceof Error ? setErr.message : String(setErr)}`
            );
          }
        }
      }
    } catch (error) {
      debugLogger.warn(
        `[EnterPlanModeTool] Failed to reveal exit_plan_mode: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    return {
      llmContent: getPlanModeSystemReminder(this.config.getSdkMode()),
      returnDisplay: "Entered plan mode."
    };
  }
};
var EnterPlanModeTool = class _EnterPlanModeTool extends BaseDeclarativeTool {
  constructor(config) {
    super(
      _EnterPlanModeTool.Name,
      ToolDisplayNames.ENTER_PLAN_MODE,
      enterPlanModeToolDescription,
      "think" /* Think */,
      enterPlanModeToolSchemaData.parametersJsonSchema,
      true,
      // isOutputMarkdown
      false,
      // canUpdateOutput
      false,
      // shouldDefer — always visible so explicit plan-mode requests work
      false,
      // alwaysLoad
      "plan mode enter start"
    );
    this.config = config;
  }
  static {
    __name(this, "EnterPlanModeTool");
  }
  static Name = ToolNames.ENTER_PLAN_MODE;
  get maxOutputChars() {
    return Number.POSITIVE_INFINITY;
  }
  createInvocation(params) {
    return new EnterPlanModeToolInvocation(this.config, params);
  }
};
export {
  EnterPlanModeTool
};
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
