// Force strict mode and setup for ESM
"use strict";
import {
  InProcessBackend,
  TeamManager
} from "./chunk-TR4Z64H2.js";
import "./chunk-GOFAQQZA.js";
import "./chunk-5M6IDOMF.js";
import "./chunk-TWPJO254.js";
import "./chunk-CQ35AJ4Z.js";
import "./chunk-EKSCLBBF.js";
import {
  clearAllInboxes
} from "./chunk-P2SU6ZTI.js";
import {
  resetTaskList
} from "./chunk-IZIVM7LZ.js";
import {
  createTeamFile,
  formatAgentId,
  getTasksDir,
  getTeamDir,
  sanitizeName,
  tryReclaimStaleTeam
} from "./chunk-SFPGAQUL.js";
import "./chunk-6PVPNMXU.js";
import "./chunk-JB4JIVTJ.js";
import "./chunk-IRH27ZC2.js";
import "./chunk-QHWCP53L.js";
import "./chunk-D5LUXLUH.js";
import "./chunk-O6GEWCJA.js";
import "./chunk-T26EAKDL.js";
import "./chunk-EOGELB3H.js";
import {
  LEADER_NAME,
  MAX_TEAMMATES
} from "./chunk-CPBF7KYF.js";
import "./chunk-EFUM7RVY.js";
import "./chunk-TTX2JUE6.js";
import "./chunk-43GGFFLY.js";
import "./chunk-SMPR7SPO.js";
import "./chunk-JWALNCLT.js";
import "./chunk-NIFYWDYN.js";
import "./chunk-3AFMQUTI.js";
import "./chunk-WKK5BQNP.js";
import "./chunk-V5J4J5TP.js";
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
import "./chunk-M6PIAXHA.js";
import "./chunk-YRLW2MSX.js";
import "./chunk-VGC4I5JJ.js";
import "./chunk-3I6UTTDX.js";
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
  isNodeError
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

// packages/core/src/tools/team-create.ts
init_esbuild_shims();
var TeamCreateInvocation = class extends BaseToolInvocation {
  constructor(config, params) {
    super(params);
    this.config = config;
  }
  static {
    __name(this, "TeamCreateInvocation");
  }
  getDescription() {
    return `Create team "${this.params.team_name}"`;
  }
  async execute() {
    const teamName = sanitizeName(this.params.team_name);
    if (!teamName) {
      const msg = "Team name is required.";
      return {
        llmContent: msg,
        returnDisplay: msg,
        error: { message: msg }
      };
    }
    if (this.config.getArenaManager()) {
      const msg = "Cannot create a team while an Arena session is active. End the Arena session first.";
      return {
        llmContent: msg,
        returnDisplay: msg,
        error: { message: msg }
      };
    }
    if (this.config.getTeamManager()) {
      const msg = "A team is already active. Delete it before creating a new one.";
      return {
        llmContent: msg,
        returnDisplay: msg,
        error: { message: msg }
      };
    }
    const leadAgentId = formatAgentId(LEADER_NAME, teamName);
    const teamFile = {
      name: teamName,
      description: this.params.description,
      createdAt: Date.now(),
      leadAgentId,
      leadSessionId: this.config.getSessionId(),
      leadPid: process.pid,
      members: []
    };
    try {
      await createTeamFile(teamName, teamFile);
    } catch (err) {
      if (isNodeError(err) && err.code === "EEXIST") {
        const reclaimed = await tryReclaimStaleTeam(teamName);
        if (!reclaimed) {
          const msg = `Team "${teamName}" already exists and appears to be owned by a live qwen-code session. Pick a different name, or \u2014 if you're sure no other session is using it \u2014 remove the on-disk artifacts manually:
  rm -rf "${getTeamDir(teamName)}" "${getTasksDir(teamName)}"`;
          return {
            llmContent: msg,
            returnDisplay: msg,
            error: { message: msg }
          };
        }
        await createTeamFile(teamName, teamFile);
      } else {
        throw err;
      }
    }
    await resetTaskList(teamName);
    await clearAllInboxes(teamName);
    const backend = new InProcessBackend(this.config);
    await backend.init();
    const manager = new TeamManager(
      backend,
      teamFile,
      this.config.getSubagentManager(),
      {
        maxTeammates: this.config.getAgentsSettings().team?.maxTeammates
      }
    );
    this.config.setTeamManager(manager);
    const ctx = {
      teamName,
      leadAgentId,
      teammates: {}
    };
    this.config.setTeamContext(ctx);
    const display = {
      type: "team_result",
      teamName,
      action: "created"
    };
    const llmContent = `Team "${teamName}" created.` + (this.params.description ? ` Description: ${this.params.description}` : "");
    return { llmContent, returnDisplay: display };
  }
};
var TeamCreateTool = class _TeamCreateTool extends BaseDeclarativeTool {
  constructor(config) {
    super(
      _TeamCreateTool.Name,
      ToolDisplayNames.TEAM_CREATE,
      `# TeamCreate

## When to Use

Use this tool proactively whenever:
- The user explicitly asks to use a team, swarm, or group of agents
- The user mentions wanting agents to work together, coordinate, or collaborate
- A task is complex enough that it would benefit from parallel work by multiple agents (e.g., building a full-stack feature with frontend and backend work, refactoring a codebase while keeping tests passing, implementing a multi-step project with research, planning, and coding phases)

When in doubt about whether a task warrants a team, prefer spawning a team.

## Choosing Agent Types for Teammates

When spawning teammates via the Agent tool, choose the \`subagent_type\` based on what tools the agent needs for its task. Each agent type has a different set of available tools \u2014 match the agent to the work:

- **Enforced read-only teammates** use the Agent tool's read_only option. This replaces the selected agent's tool surface with inspection and team-coordination tools, so shell and file writes are unavailable. Use them for research, search, review, or planning tasks.
- **Full-capability agents** (e.g., general-purpose) have access to all tools including file editing, writing, and bash. Use these for tasks that require making changes.
- **Custom agents** defined in \`.qwen/agents/\` may have their own tool restrictions. Check their descriptions to understand what they can and cannot do.

Always review the agent type descriptions and their available tools listed in the Agent tool prompt before selecting a \`subagent_type\` for a teammate.

Create a new team to coordinate multiple agents working on a project. Teams have a 1:1 correspondence with task lists (Team = TaskList).

\`\`\`
{
  "team_name": "my-project",
  "description": "Working on feature X"
}
\`\`\`

This creates:
- A team file at \`~/.qwen/teams/{team-name}/config.json\`
- A corresponding task list directory at \`~/.qwen/tasks/{team-name}/\`

## Team Workflow

1. **Create a team** with TeamCreate - this creates both the team and its task list
2. **Create tasks** using the Task tools (TaskCreate, TaskList, etc.) - they automatically use the team's task list
3. **Spawn teammates** using the Agent tool with explicit \`name\` and \`subagent_type\` parameters to create teammates that join the active team (max ${config.getAgentsSettings().team?.maxTeammates ?? MAX_TEAMMATES} teammates per team). Set \`read_only: true\` for investigation workers; pin a single writer to a leader-owned worktree with \`working_dir\` when code changes are required, then shut it down before removing that worktree.
4. **Assign tasks** using TaskUpdate with \`owner\` to give tasks to idle teammates
5. **Teammates work on assigned tasks** and mark them completed via TaskUpdate
6. **Teammates go idle between turns** - after each turn, teammates automatically go idle and send a notification. IMPORTANT: Be patient with idle teammates! Don't comment on their idleness until it actually impacts your work.
7. **Shutdown your team** - when the task is completed, gracefully shut down each teammate with ${ToolNames.REQUEST_SHUTDOWN} (\`to\`: the teammate name). ${ToolNames.SEND_MESSAGE} carries ordinary text only.

## Task Ownership

Tasks are assigned using TaskUpdate with the \`owner\` parameter. Any agent can set or change task ownership via TaskUpdate.

## Automatic Message Delivery

**IMPORTANT**: Messages from teammates are automatically delivered to you. You do NOT need to manually check your inbox.

When you spawn teammates:
- They will send you messages when they complete tasks or need help
- These messages appear automatically as new conversation turns (like user messages)
- If you're busy (mid-turn), messages are queued and delivered when your turn ends
- The UI shows a brief notification with the sender's name when messages are waiting

Messages will be delivered automatically.

When reporting on teammate messages, you do NOT need to quote the original message\u2014it's already rendered to the user.

## Teammate Idle State

Teammates go idle after every turn\u2014this is completely normal and expected. A teammate going idle immediately after sending you a message does NOT mean they are done or unavailable. Idle simply means they are waiting for input.

- **Idle teammates can receive messages.** Sending a message to an idle teammate wakes them up and they will process it normally.
- **Idle notifications are automatic.** The system sends an idle notification whenever a teammate's turn ends. You do not need to react to idle notifications unless you want to assign new work or send a follow-up message.
- **Do not treat idle as an error.** A teammate sending a message and then going idle is the normal flow\u2014they sent their message and are now waiting for a response. When a teammate's turn ends, the runtime forwards that teammate's final text output of the turn to you automatically; if they also called send_message earlier, that earlier report is delivered too. There is no summary of teammate-to-teammate messages; ask the teammate directly when you need peer-collaboration detail.

## Discovering Team Members

Teammates can read the team config file to discover other team members:
- **Team config location**: \`~/.qwen/teams/{team-name}/config.json\`

The config file contains a \`members\` array with each teammate's:
- \`name\`: Human-readable name (**always use this** for messaging and task assignment)
- \`agentId\`: Unique identifier (for reference only - do not use for communication)
- \`agentType\`: Role/type of the agent

**IMPORTANT**: Always refer to teammates by their NAME (e.g., "team-lead", "researcher", "tester"). Names are used for:
- \`to\` when sending messages
- Identifying task owners

Example of reading team config:
\`\`\`
Use the Read tool to read ~/.qwen/teams/{team-name}/config.json
\`\`\`

## Task List Coordination

Teams share a task list that all teammates can access at \`~/.qwen/tasks/{team-name}/\`.

Teammates should:
1. Check TaskList periodically, **especially after completing each task**, to find available work or see newly unblocked tasks
2. Claim unassigned, unblocked tasks with TaskUpdate (set \`owner\` to your name). **Prefer tasks in ID order** (lowest ID first) when multiple tasks are available, as earlier tasks often set up context for later ones
3. Create new tasks with \`TaskCreate\` when identifying additional work
4. Mark tasks as completed with \`TaskUpdate\` when done, then check TaskList for next work
5. Coordinate with other teammates by reading the task list status
6. If all available tasks are blocked, notify the team lead or help resolve blocking tasks

**IMPORTANT notes for communication with your team**:
- Do not use terminal tools to view your team's activity; always send a message to your teammates (and remember, refer to them by name).
- Your team cannot hear you if you do not use the SendMessage tool. Always send a message to your teammates if you are responding to them.
- Do NOT send structured JSON status messages like \`{"type":"idle",...}\` or \`{"type":"task_completed",...}\`. Just communicate in plain text when you need to message teammates.
- Use TaskUpdate to mark tasks completed.
- If you are an agent in the team, the system will automatically send idle notifications to the team lead when you stop.`,
      "other" /* Other */,
      {
        type: "object",
        properties: {
          team_name: {
            type: "string",
            description: "Name for the team (alphanumeric and hyphens)."
          },
          description: {
            type: "string",
            description: "Optional description of the team."
          }
        },
        required: ["team_name"],
        additionalProperties: false
      }
    );
    this.config = config;
  }
  static {
    __name(this, "TeamCreateTool");
  }
  static Name = ToolNames.TEAM_CREATE;
  createInvocation(params) {
    return new TeamCreateInvocation(this.config, params);
  }
};
export {
  TeamCreateTool
};
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
