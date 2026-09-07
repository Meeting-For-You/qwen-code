// Force strict mode and setup for ESM
"use strict";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/acp-bridge/dist/process-registry.js
init_esbuild_shims();
var TERM_GRACE_MS = 5e3;
var EXIT_DEADLINE_MS = 1e4;
var ProcessRegistry = class {
  static {
    __name(this, "ProcessRegistry");
  }
  reservations = /* @__PURE__ */ new Set();
  children = /* @__PURE__ */ new Set();
  draining = false;
  shutdownPromise;
  reserve() {
    if (this.draining) {
      throw new Error("ACP process registry is draining");
    }
    const token = Symbol("acp-child");
    this.reservations.add(token);
    let settled = false;
    return {
      attach: /* @__PURE__ */ __name((child) => {
        if (settled || !this.reservations.delete(token)) {
          throw new Error("ACP process reservation is no longer active");
        }
        settled = true;
        const tracked = new TrackedChild(child, () => {
          this.children.delete(tracked);
        });
        this.children.add(tracked);
        if (this.draining)
          void tracked.terminate().catch(() => {
          });
        return tracked;
      }, "attach"),
      cancel: /* @__PURE__ */ __name(() => {
        if (settled)
          return;
        settled = true;
        this.reservations.delete(token);
      }, "cancel")
    };
  }
  shutdown() {
    if (this.shutdownPromise)
      return this.shutdownPromise;
    this.draining = true;
    this.shutdownPromise = Promise.allSettled([...this.children].map((child) => child.terminate())).then((results) => {
      const failures = results.flatMap((result) => result.status === "rejected" ? [result.reason] : []);
      if (failures.length > 0) {
        throw new AggregateError(failures, "ACP child process shutdown failed");
      }
    });
    return this.shutdownPromise;
  }
  killAllSync() {
    this.draining = true;
    for (const child of this.children)
      child.killSync();
  }
  get activeProcessCount() {
    return this.children.size;
  }
  /**
   * Children this registry has committed to: attached ones plus reservations
   * that have not attached yet. Larger than {@link activeProcessCount}, and
   * the right figure for admission — `reserve()` inserts its token
   * synchronously before `spawn()`, so two racing spawns each see the other
   * here, while neither is visible in `activeProcessCount` until its child is
   * attached.
   *
   * A child leaves this count when it *exits*, not when `terminate()` starts,
   * so a channel swap is counted twice while the old process is still winding
   * down. That is deliberate: its memory is still resident.
   */
  get committedProcessCount() {
    return this.children.size + this.reservations.size;
  }
};
var TrackedChild = class {
  static {
    __name(this, "TrackedChild");
  }
  child;
  onExit;
  exited;
  exitedSettled = false;
  spawnConfirmed = false;
  terminatePromise;
  constructor(child, onExit) {
    this.child = child;
    this.onExit = onExit;
    this.exited = new Promise((resolve) => {
      const finish = /* @__PURE__ */ __name((info) => {
        if (this.exitedSettled)
          return;
        this.exitedSettled = true;
        this.onExit();
        resolve(info);
      }, "finish");
      child.once("exit", (exitCode, signalCode) => {
        finish({ exitCode, signalCode });
      });
      child.once("spawn", () => {
        this.spawnConfirmed = true;
      });
      child.once("error", () => {
        if (!this.spawnConfirmed)
          finish(void 0);
      });
    });
  }
  terminate() {
    this.terminatePromise ??= this.terminateOnce();
    return this.terminatePromise;
  }
  killSync() {
    if (this.exitedSettled)
      return;
    try {
      this.child.kill("SIGKILL");
    } catch {
    }
  }
  async terminateOnce() {
    if (this.exitedSettled)
      return;
    try {
      this.child.kill("SIGTERM");
    } catch {
      if (this.exitedSettled)
        return;
    }
    let hardKillTimer;
    let deadlineTimer;
    const deadline = new Promise((_, reject) => {
      hardKillTimer = setTimeout(() => this.killSync(), TERM_GRACE_MS);
      hardKillTimer.unref();
      deadlineTimer = setTimeout(() => {
        reject(new Error(`ACP child pid=${this.child.pid ?? "unknown"} did not exit within ${EXIT_DEADLINE_MS}ms`));
      }, EXIT_DEADLINE_MS);
      deadlineTimer.unref();
    });
    try {
      const exitInfo = await Promise.race([this.exited, deadline]);
      if (exitInfo && (exitInfo.exitCode !== 0 || exitInfo.signalCode !== null)) {
        throw new Error(`ACP child pid=${this.child.pid ?? "unknown"} exited uncleanly during shutdown (code=${exitInfo.exitCode ?? "none"}, signal=${exitInfo.signalCode ?? "none"})`);
      }
    } finally {
      if (hardKillTimer)
        clearTimeout(hardKillTimer);
      if (deadlineTimer)
        clearTimeout(deadlineTimer);
    }
  }
};
export {
  ProcessRegistry
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
