// Force strict mode and setup for ESM
"use strict";
import "./chunk-CAUDTPEJ.js";
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
  isSubagentLikeExecutionContext
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
import "./chunk-UHQFIS7N.js";
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

// packages/core/src/tools/team-plan-approval.ts
init_esbuild_shims();
var TeamPlanApprovalInvocation = class extends BaseToolInvocation {
  constructor(config, params) {
    super(params);
    this.config = config;
  }
  static {
    __name(this, "TeamPlanApprovalInvocation");
  }
  getDescription() {
    return `${this.params.action} teammate plan ${this.params.request_id}`;
  }
  async getDefaultPermission() {
    return "allow";
  }
  async execute(_signal) {
    if (isSubagentLikeExecutionContext()) {
      const msg = "Only the team leader can approve teammate plans.";
      return {
        llmContent: msg,
        returnDisplay: msg,
        error: { message: msg }
      };
    }
    const manager = this.config.getTeamManager();
    if (!manager) {
      const msg = "No active team. Create a team first.";
      return {
        llmContent: msg,
        returnDisplay: msg,
        error: { message: msg }
      };
    }
    try {
      if (this.params.action === "approve") {
        const targetMode = this.getApprovalTargetMode();
        if (targetMode === "plan" /* PLAN */) {
          const msg3 = "Cannot approve teammate plan while the leader is still in plan mode. Exit the leader plan mode first; the request remains pending.";
          return {
            llmContent: msg3,
            returnDisplay: msg3,
            error: { message: msg3 }
          };
        }
        manager.resolvePlanApprovalRequest(this.params.request_id, {
          action: "approve",
          targetMode,
          message: this.params.message
        });
        const msg2 = `Teammate plan request "${this.params.request_id}" approved.`;
        return { llmContent: msg2, returnDisplay: msg2 };
      }
      manager.resolvePlanApprovalRequest(this.params.request_id, {
        action: "reject",
        message: this.params.message
      });
      const msg = `Teammate plan request "${this.params.request_id}" rejected.`;
      return { llmContent: msg, returnDisplay: msg };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        llmContent: `Failed to resolve teammate plan approval: ${message}`,
        returnDisplay: `Plan approval failed: ${message}`,
        error: { message }
      };
    }
  }
  getApprovalTargetMode() {
    const current = this.config.getApprovalMode();
    if (current === "auto" /* AUTO */) {
      return "default" /* DEFAULT */;
    }
    if (!this.config.isTrustedFolder() && (current === "auto-edit" /* AUTO_EDIT */ || current === "yolo" /* YOLO */)) {
      return "default" /* DEFAULT */;
    }
    return current;
  }
};
var TeamPlanApprovalTool = class _TeamPlanApprovalTool extends BaseDeclarativeTool {
  constructor(config) {
    super(
      _TeamPlanApprovalTool.Name,
      ToolDisplayNames.TEAM_PLAN_APPROVAL,
      "Approve or reject a plan submitted by a plan-required teammate. Only the team leader can use this tool.",
      "think" /* Think */,
      {
        type: "object",
        properties: {
          request_id: {
            type: "string",
            description: "The request id from the team plan approval request."
          },
          action: {
            type: "string",
            enum: ["approve", "reject"],
            description: "Approve or reject the teammate plan."
          },
          message: {
            type: "string",
            description: "Optional feedback for the teammate, especially when rejecting."
          }
        },
        required: ["request_id", "action"],
        additionalProperties: false
      }
    );
    this.config = config;
  }
  static {
    __name(this, "TeamPlanApprovalTool");
  }
  static Name = ToolNames.TEAM_PLAN_APPROVAL;
  validateToolParams(params) {
    if (!params.request_id || typeof params.request_id !== "string" || params.request_id.trim() === "") {
      return 'Parameter "request_id" must be a non-empty string.';
    }
    if (params.action !== "approve" && params.action !== "reject") {
      return 'Parameter "action" must be "approve" or "reject".';
    }
    if (params.message !== void 0 && typeof params.message !== "string") {
      return 'Parameter "message" must be a string when set.';
    }
    return null;
  }
  createInvocation(params) {
    return new TeamPlanApprovalInvocation(this.config, params);
  }
};
export {
  TeamPlanApprovalTool
};
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
