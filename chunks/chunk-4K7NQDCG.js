// Force strict mode and setup for ESM
"use strict";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/cli/src/acp-integration/model-configuration.ts
init_esbuild_shims();
var MODEL_CONFIGURATIONS = {
  "qwen3.5-plus": {
    reasoning: { thinking: true, toggleOnly: true }
  },
  "qwen3.6-plus": {
    reasoning: { thinking: true, toggleOnly: true }
  },
  "qwen3.6-flash": {
    reasoning: { thinking: true, toggleOnly: true }
  },
  "qwen3.7-plus": {
    reasoning: { thinking: true, toggleOnly: true }
  },
  "qwen3.7-max": {
    reasoning: { thinking: true, toggleOnly: true }
  },
  "qwen3.8-max": {
    reasoning: {
      thinking: true,
      efforts: ["low", "medium", "xhigh"],
      defaultEffort: "xhigh"
    }
  }
};
var REASONING_EFFORT_DEFAULT = "default";
var REASONING_EFFORT_NONE = "none";
var REASONING_EFFORT_NAMES = {
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "Extra high",
  max: "Max"
};
function getModelConfiguration(modelId) {
  return modelId ? MODEL_CONFIGURATIONS[modelId] : void 0;
}
__name(getModelConfiguration, "getModelConfiguration");
function buildModelReasoningConfigOption(modelId, state = {}) {
  const reasoning = getModelConfiguration(modelId)?.reasoning;
  if (!reasoning?.thinking) return void 0;
  const currentValue = state.enabled === false ? REASONING_EFFORT_NONE : reasoning.toggleOnly ? REASONING_EFFORT_DEFAULT : reasoning.efforts.find((effort) => effort === state.effort) ?? reasoning.defaultEffort;
  return {
    id: "reasoning_effort",
    name: "Reasoning effort",
    description: `Thinking and reasoning effort for ${modelId}`,
    category: "thought_level",
    type: "select",
    currentValue,
    options: [
      {
        value: REASONING_EFFORT_NONE,
        name: "Thinking off",
        description: "Disable thinking for this session"
      },
      ...reasoning.toggleOnly ? [
        {
          value: REASONING_EFFORT_DEFAULT,
          name: "Thinking on",
          description: "Use the model or provider thinking default"
        }
      ] : reasoning.efforts.map((effort) => ({
        value: effort,
        name: REASONING_EFFORT_NAMES[effort],
        description: "Apply this effort to the next request"
      }))
    ],
    _meta: {
      "qwenCode/reasoning": reasoning.toggleOnly ? { toggleOnly: true } : { defaultEffort: reasoning.defaultEffort }
    }
  };
}
__name(buildModelReasoningConfigOption, "buildModelReasoningConfigOption");
function buildModelReasoningConfigPreview(modelId) {
  const reasoning = getModelConfiguration(modelId)?.reasoning;
  if (!reasoning?.thinking || reasoning.toggleOnly) return void 0;
  const option = buildModelReasoningConfigOption(modelId);
  return option ? [option] : void 0;
}
__name(buildModelReasoningConfigPreview, "buildModelReasoningConfigPreview");

export {
  REASONING_EFFORT_DEFAULT,
  REASONING_EFFORT_NONE,
  REASONING_EFFORT_NAMES,
  getModelConfiguration,
  buildModelReasoningConfigOption,
  buildModelReasoningConfigPreview
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
