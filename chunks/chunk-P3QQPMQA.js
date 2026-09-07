// Force strict mode and setup for ESM
"use strict";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";

// packages/core/src/utils/retryContext.ts
init_esbuild_shims();
import { AsyncLocalStorage } from "node:async_hooks";
var retryContext = new AsyncLocalStorage();

export {
  retryContext
};
/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
