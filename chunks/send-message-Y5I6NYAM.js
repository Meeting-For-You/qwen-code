// Force strict mode and setup for ESM
"use strict";
import {
  LEADER_NAME
} from "./chunk-CPBF7KYF.js";
import {
  getPlanRequiredTeammatePreApprovalMessage,
  isPlanRequiredTeammateAwaitingApproval
} from "./chunk-V5J4J5TP.js";
import "./chunk-CMHFCLBU.js";
import {
  getAgentName
} from "./chunk-S6LOFUVP.js";
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
import "./chunk-TBWQLLFO.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/tools/send-message.ts
init_esbuild_shims();
var SendMessageInvocation = class extends BaseToolInvocation {
  constructor(config, params) {
    super(params);
    this.config = config;
  }
  static {
    __name(this, "SendMessageInvocation");
  }
  getDescription() {
    if (this.params.task_id) {
      return `Send message to task ${this.params.task_id}`;
    }
    const preview = this.params.summary ?? this.params.message.slice(0, 50);
    return `Send to ${this.params.to}: ${preview}`;
  }
  /**
   * Send-message routes free-form text into a running background task or a
   * teammate, which will then execute it as a new instruction with full
   * tool access. Treat it as a privileged sink — the L4 default must not be
   * 'allow', because that would let the scheduler auto-approve in
   * AUTO mode (where 'allow' short-circuits the classifier). 'ask' lets
   * AUTO route through the classifier so the destination and message text
   * can be inspected.
   */
  async getDefaultPermission() {
    return "ask";
  }
  async execute(signal) {
    if (isPlanRequiredTeammateAwaitingApproval(this.config)) {
      const msg = getPlanRequiredTeammatePreApprovalMessage(
        ToolNames.SEND_MESSAGE
      );
      return {
        llmContent: msg,
        returnDisplay: msg,
        error: { message: msg }
      };
    }
    if (this.params.task_id) {
      const registry = this.config.getBackgroundTaskRegistry();
      const entry = registry.get(this.params.task_id);
      if (!entry) {
        return {
          llmContent: `Error: No background task found with ID "${this.params.task_id}".`,
          returnDisplay: "Task not found.",
          error: {
            message: `Task not found: ${this.params.task_id}`,
            type: "send_message_not_found" /* SEND_MESSAGE_NOT_FOUND */
          }
        };
      }
      if (entry.resumeBlockedReason) {
        return {
          llmContent: `Error: Background task "${this.params.task_id}" cannot be continued: ${entry.resumeBlockedReason}`,
          returnDisplay: "Task cannot be continued.",
          error: {
            message: `Task cannot be continued: ${this.params.task_id}`,
            type: "send_message_not_running" /* SEND_MESSAGE_NOT_RUNNING */
          }
        };
      }
      if (entry.status === "paused") {
        const resumed = await this.config.resumeBackgroundAgent(
          this.params.task_id,
          this.params.message
        );
        if (!resumed) {
          return {
            llmContent: `Error: Background task "${this.params.task_id}" could not be resumed.`,
            returnDisplay: "Task could not be resumed.",
            error: {
              message: `Task could not be resumed: ${this.params.task_id}`,
              type: "send_message_not_running" /* SEND_MESSAGE_NOT_RUNNING */
            }
          };
        }
        return {
          llmContent: `Background task "${this.params.task_id}" resumed with your message as the first continuation instruction.`,
          returnDisplay: `Resumed ${entry.description}`
        };
      }
      if (entry.status === "completed") {
        const continued = registry.continueResidentAgent(
          this.params.task_id,
          this.params.message
        );
        if (continued) {
          return {
            llmContent: `Background task "${this.params.task_id}" continued on its existing runtime with your message as the next instruction.`,
            returnDisplay: `Continued ${entry.description}`
          };
        }
        const revived = await this.config.reviveCompletedBackgroundAgent(
          this.params.task_id,
          this.params.message
        );
        if (!revived) {
          return {
            llmContent: `Error: Background task "${this.params.task_id}" could not be revived.`,
            returnDisplay: "Task could not be revived.",
            error: {
              message: `Task could not be revived: ${this.params.task_id}`,
              type: "send_message_not_running" /* SEND_MESSAGE_NOT_RUNNING */
            }
          };
        }
        return {
          llmContent: `Background task "${this.params.task_id}" had completed; revived it with your message as the next instruction.`,
          returnDisplay: `Revived ${entry.description}`
        };
      }
      if (entry.status !== "running") {
        return {
          llmContent: `Error: Background task "${this.params.task_id}" is not running (status: ${entry.status}). Cannot send messages to stopped tasks.`,
          returnDisplay: `Task not running (${entry.status}).`,
          error: {
            message: `Task is ${entry.status}: ${this.params.task_id}`,
            type: "send_message_not_running" /* SEND_MESSAGE_NOT_RUNNING */
          }
        };
      }
      if (registry.isFinishing(this.params.task_id) || !registry.queueMessage(this.params.task_id, this.params.message)) {
        const settled = await registry.waitForFinishing(
          this.params.task_id,
          signal
        );
        if (!settled) {
          const message = `Message delivery to background task "${this.params.task_id}" was cancelled.`;
          return {
            llmContent: `Error: ${message}`,
            returnDisplay: message,
            error: {
              message,
              type: "send_message_not_running" /* SEND_MESSAGE_NOT_RUNNING */
            }
          };
        }
        return this.execute(signal);
      }
      return {
        llmContent: `Message queued for delivery to background task "${this.params.task_id}". The task will receive it at the next tool-round boundary.`,
        returnDisplay: `Message queued for ${entry.description}`
      };
    }
    const teamManager = this.config.getTeamManager();
    if (!teamManager) {
      const msg = "No active team and no task_id provided. Either create a team first, or pass `task_id` to message a background task.";
      return {
        llmContent: msg,
        returnDisplay: msg,
        error: { message: msg }
      };
    }
    const to = this.params.to;
    if (!to) {
      const msg = 'Recipient "to" is required.';
      return {
        llmContent: msg,
        returnDisplay: msg,
        error: { message: msg }
      };
    }
    try {
      if (to === "*") {
        const sender = getAgentName() ?? LEADER_NAME;
        await teamManager.broadcast(this.params.message, sender);
        const msg2 = "Message broadcast to all teammates.";
        return { llmContent: msg2, returnDisplay: msg2 };
      }
      await teamManager.sendMessage(
        to,
        this.params.message,
        getAgentName() ?? LEADER_NAME,
        this.params.summary
      );
      const msg = `Message sent to "${to}".`;
      return { llmContent: msg, returnDisplay: msg };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        llmContent: `Failed to send message: ${errMsg}`,
        returnDisplay: `Failed to send message: ${errMsg}`,
        error: { message: errMsg }
      };
    }
  }
};
var SendMessageTool = class _SendMessageTool extends BaseDeclarativeTool {
  constructor(config) {
    super(
      _SendMessageTool.Name,
      ToolDisplayNames.SEND_MESSAGE,
      'Send a message to a teammate (use "to") or to a running, paused, or completed background task (use "task_id"); completed tasks are revived. For teams, set "to" to a bare teammate name (no @) or "*" to broadcast. For background tasks, set "task_id" to the id from the launch response or list_agents. Running tasks receive it at the next tool-round boundary; paused recovered tasks resume with the message as their first continuation instruction; completed tasks continue on their resident runtime when available and otherwise revive from their transcript and continue with your message. Your text output is NOT visible to peer teammates \u2014 use this tool to communicate.',
      "other" /* Other */,
      {
        type: "object",
        properties: {
          to: {
            type: "string",
            description: 'Recipient teammate name, or "*" for broadcast.'
          },
          task_id: {
            type: "string",
            description: "The ID of the background task (from the launch response, a recovered paused task, or a completed task to continue)."
          },
          message: {
            type: "string",
            description: "Message text to send.",
            // Cap message size so a teammate can't grow the
            // recipient's inbox file unboundedly with a single send.
            maxLength: 65536
          },
          summary: {
            type: "string",
            description: "Optional 5-10 word summary for UI display."
          }
        },
        required: ["message"],
        additionalProperties: false
      },
      true,
      // isOutputMarkdown
      false,
      // canUpdateOutput
      true,
      // shouldDefer — sending messages is infrequent
      false,
      // alwaysLoad
      "send message task teammate team communicate notify"
    );
    this.config = config;
  }
  static {
    __name(this, "SendMessageTool");
  }
  static Name = ToolNames.SEND_MESSAGE;
  createInvocation(params) {
    return new SendMessageInvocation(this.config, params);
  }
  /**
   * Forward the routing fields and the message verbatim to the classifier —
   * `to`/`task_id` identify the privileged sink and the `message` itself is
   * the new instruction the recipient will execute, so the classifier needs
   * the full text to evaluate the action's safety.
   */
  toAutoClassifierInput(params) {
    return {
      to: params.to,
      task_id: params.task_id,
      message: params.message
    };
  }
};
export {
  SendMessageTool
};
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
