// Force strict mode and setup for ESM
"use strict";
import {
  BaseDeclarativeTool,
  BaseToolInvocation,
  ToolDisplayNames,
  ToolNames
} from "./chunk-UTLCH2FK.js";
import "./chunk-UHQFIS7N.js";
import "./chunk-TBWQLLFO.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/tools/list-agents.ts
init_esbuild_shims();
var ListAgentsInvocation = class extends BaseToolInvocation {
  constructor(config, params) {
    super(params);
    this.config = config;
  }
  static {
    __name(this, "ListAgentsInvocation");
  }
  getDescription() {
    return "List ordinary background subagents";
  }
  async execute() {
    const agents = this.config.getBackgroundTaskRegistry().getAll().filter((entry) => entry.isBackgrounded).map((entry) => ({
      task_id: entry.agentId,
      ...entry.subagentType ? { subagent_type: entry.subagentType } : {},
      description: entry.description,
      status: entry.status,
      can_message: !entry.resumeBlockedReason && (entry.status === "running" || entry.status === "paused" || entry.status === "completed"),
      ...entry.resumeBlockedReason ? { resume_blocked_reason: entry.resumeBlockedReason } : {}
    }));
    if (agents.length === 0) {
      const message = "No ordinary background subagents are available in this session. Named Agent Team teammates are not listed here; their results are delivered automatically through team messaging, so do not use list_agents to wait for a teammate.";
      return { llmContent: message, returnDisplay: message };
    }
    return {
      llmContent: JSON.stringify({ agents }),
      returnDisplay: `Listed ${agents.length} background agent${agents.length === 1 ? "" : "s"}.`
    };
  }
};
var ListAgentsTool = class _ListAgentsTool extends BaseDeclarativeTool {
  constructor(config) {
    super(
      _ListAgentsTool.Name,
      ToolDisplayNames.LIST_AGENTS,
      "List addressable ordinary background subagents in the current session, including agents restored from a prior session run. Named Agent Team teammates are NOT listed here: they have their own team lifecycle and deliver their final reports automatically, so do not use list_agents (or poll task_list) to wait for a teammate. Use the returned task_id with send_message to continue a running, paused, or completed agent.",
      "read" /* Read */,
      {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    );
    this.config = config;
  }
  static {
    __name(this, "ListAgentsTool");
  }
  static Name = ToolNames.LIST_AGENTS;
  createInvocation(params) {
    return new ListAgentsInvocation(this.config, params);
  }
};
export {
  ListAgentsTool
};
/**
 * @license
 * Copyright 2026 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
