// Force strict mode and setup for ESM
"use strict";
import {
  createWorkspaceGenerationGuard
} from "./chunk-MQM5PJML.js";
import "./chunk-NYWWQ437.js";
import "./chunk-OIBUG24X.js";
import "./chunk-4JRM2BSM.js";
import "./chunk-T2RMV42T.js";
import "./chunk-ZGXYO7DY.js";
import "./chunk-7U5G6JXI.js";
import "./chunk-WCCLLK7X.js";
import "./chunk-OCPBI7J5.js";
import {
  evaluateDaemonWorkspaceTrust
} from "./chunk-HYZRZ3Q5.js";
import "./chunk-RUGNCYNO.js";
import "./chunk-H72BQNM3.js";
import "./chunk-JHS74YAB.js";
import "./chunk-OZ6KS6KW.js";
import "./chunk-ERFDKH32.js";
import "./chunk-6PLDPT2C.js";
import "./chunk-UDG5EZJI.js";
import "./chunk-3VUENPWF.js";
import "./chunk-M5GB774H.js";
import "./chunk-IW6RQPQB.js";
import "./chunk-M3RWE6QP.js";
import "./chunk-RKUWKYED.js";
import "./chunk-2EXB2P43.js";
import "./chunk-GOXKNSDZ.js";
import "./chunk-IDS7MSUP.js";
import "./chunk-LDP5OD6N.js";
import "./chunk-5EJZE3FP.js";
import "./chunk-OO7I6WQO.js";
import "./chunk-5PA6UEYA.js";
import "./chunk-WCJI2GQG.js";
import "./chunk-NPQ5ZKRP.js";
import "./chunk-MR3PXB6E.js";
import "./chunk-KGMACVGR.js";
import "./chunk-OIF3GVDP.js";
import "./chunk-CQH5KTKC.js";
import "./chunk-LJZSMWOH.js";
import "./chunk-WRUIP7SX.js";
import "./chunk-PKAYJDB3.js";
import "./chunk-6IUNAPLR.js";
import "./chunk-OIVXBW3W.js";
import "./chunk-SCYOROEL.js";
import "./chunk-XQFT3QUF.js";
import "./chunk-VTHREBQM.js";
import "./chunk-ZPJWUGCS.js";
import "./chunk-H2WDGQ6D.js";
import "./chunk-TEWZQAGF.js";
import "./chunk-ECPD3WSG.js";
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
import "./chunk-V5J4J5TP.js";
import "./chunk-MLXTMF7H.js";
import "./chunk-NAVJD2PQ.js";
import "./chunk-3JGZSIDA.js";
import "./chunk-VVW4ZNFY.js";
import "./chunk-QHMLYMMS.js";
import "./chunk-7DJCPZE3.js";
import "./chunk-P3QQPMQA.js";
import "./chunk-HVEYF6VT.js";
import "./chunk-VNOVK4I7.js";
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
import "./chunk-ZSFE5RWX.js";
import "./chunk-YRLW2MSX.js";
import "./chunk-VGC4I5JJ.js";
import "./chunk-3I6UTTDX.js";
import "./chunk-6PJOTWAN.js";
import "./chunk-BWORX6FA.js";
import "./chunk-WZAD4ZNJ.js";
import "./chunk-FPGTNKCP.js";
import "./chunk-6DIGWMGT.js";
import "./chunk-E6AL43NP.js";
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
import "./chunk-UTLCH2FK.js";
import "./chunk-UHQFIS7N.js";
import "./chunk-KGJGEEVR.js";
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

// packages/cli/src/serve/workspace-trust-reconciler.ts
init_esbuild_shims();
function errorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}
__name(errorMessage, "errorMessage");
function createWorkspaceTrustReconciler(options) {
  let pendingSnapshot;
  let running;
  const materializationKey = /* @__PURE__ */ __name((entry, snapshot, decision) => options.materializationKey?.({ entry, snapshot, decision }) ?? String(decision.targetTrusted), "materializationKey");
  const drainRuntime = /* @__PURE__ */ __name(async (runtime) => {
    try {
      await options.drainRuntime(runtime, "trust_reconfigured");
      return void 0;
    } catch (error) {
      return error;
    }
  }, "drainRuntime");
  const replace = /* @__PURE__ */ __name(async (planned, snapshot) => {
    const { entry, previous } = planned;
    if (planned.decrease) {
      if (entry.state !== "transitioning" || entry.current?.runtime !== previous) {
        return;
      }
    } else {
      if (!options.registry.beginReplacement(entry, snapshot.revision)) return;
    }
    let contained = previous === void 0;
    try {
      if (previous) {
        const drainError = await (planned.drainResult ?? drainRuntime(previous));
        await options.disposeRuntime(previous, "trust_reconfigured");
        contained = true;
        if (drainError) options.onError?.(entry, drainError);
      }
      let desiredSnapshot = snapshot;
      let desiredDecision = planned.decision;
      for (; ; ) {
        const generationGuard = createWorkspaceGenerationGuard();
        let candidate;
        let candidateActivated = false;
        try {
          candidate = await options.buildRuntime({
            entry,
            trusted: desiredDecision.targetTrusted,
            snapshot: desiredSnapshot,
            decision: desiredDecision,
            generationGuard
          });
        } catch (error) {
          generationGuard.close();
          if (!desiredDecision.targetTrusted) throw error;
          const fallbackGuard = createWorkspaceGenerationGuard();
          let fallback;
          let fallbackActivated = false;
          try {
            fallback = await options.buildRuntime({
              entry,
              trusted: false,
              snapshot: desiredSnapshot,
              decision: { ...desiredDecision, targetTrusted: false },
              generationGuard: fallbackGuard
            });
            const latest = await options.readLatestSnapshot();
            if (latest.revision !== desiredSnapshot.revision) {
              pendingSnapshot = latest;
              desiredSnapshot = latest;
              desiredDecision = evaluateDaemonWorkspaceTrust(
                latest,
                entry.workspaceCwd
              );
              entry.configuredRevision = latest.revision;
              continue;
            }
            options.registry.activateReplacement(
              entry,
              fallback,
              desiredSnapshot.revision
            );
            fallbackActivated = true;
            entry.appliedRevision = null;
            entry.applyError = errorMessage(error);
            try {
              await options.runtimeActivated?.(fallback, previous);
            } catch (activationError) {
              options.onError?.(entry, activationError);
            }
            options.onError?.(entry, error);
            return;
          } catch (fallbackError) {
            throw new AggregateError(
              [error, fallbackError],
              "Trusted runtime and untrusted fallback both failed to build."
            );
          } finally {
            if (!fallbackActivated) {
              fallbackGuard.close();
              if (fallback) {
                await options.disposeRuntime(fallback, "trust_reconfigured");
              }
            }
          }
        }
        try {
          const latest = await options.readLatestSnapshot();
          if (latest.revision !== desiredSnapshot.revision) {
            pendingSnapshot = latest;
            desiredSnapshot = latest;
            desiredDecision = evaluateDaemonWorkspaceTrust(
              latest,
              entry.workspaceCwd
            );
            entry.configuredRevision = latest.revision;
            continue;
          }
          options.registry.activateReplacement(
            entry,
            candidate,
            desiredSnapshot.revision
          );
          candidateActivated = true;
          try {
            await options.runtimeActivated?.(candidate, previous);
          } catch (activationError) {
            options.onError?.(entry, activationError);
          }
          return;
        } finally {
          if (!candidateActivated) {
            generationGuard.close();
            await options.disposeRuntime(candidate, "trust_reconfigured");
          }
        }
      }
    } catch (error) {
      if (contained) {
        entry.current = void 0;
        options.registry.blockReplacement(entry, errorMessage(error));
      } else {
        options.registry.blockReplacement(
          entry,
          `Runtime containment failed: ${errorMessage(error)}`
        );
      }
      options.onError?.(entry, error);
    }
  }, "replace");
  const applySnapshot = /* @__PURE__ */ __name(async (snapshot) => {
    const planned = [];
    for (const entry of options.registry.listAllEntries()) {
      const current = entry.current;
      if (entry.state === "active" && (current?.runtime.provenance === "managed-scratch" || current?.runtime.provenance === "live-conversation")) {
        options.registry.advancePolicyRevision(entry, snapshot.revision);
        continue;
      }
      if (entry.state === "blocked") {
        const decision2 = evaluateDaemonWorkspaceTrust(
          snapshot,
          entry.workspaceCwd
        );
        planned.push({
          entry,
          previous: current?.runtime,
          decision: decision2,
          materialization: materializationKey(entry, snapshot, decision2),
          decrease: false
        });
        continue;
      }
      if (!current || entry.state !== "active") {
        entry.configuredRevision = snapshot.revision;
        continue;
      }
      const decision = evaluateDaemonWorkspaceTrust(
        snapshot,
        entry.workspaceCwd
      );
      const materialization = materializationKey(entry, snapshot, decision);
      if (current.runtime.trusted === decision.targetTrusted && current.runtime.trustMaterialization === materialization) {
        options.registry.advancePolicyRevision(entry, snapshot.revision);
        continue;
      }
      const decrease = options.isTrustDecrease?.({
        entry,
        runtime: current.runtime,
        nextMaterialization: materialization,
        decision
      }) ?? (current.runtime.trusted && !decision.targetTrusted);
      planned.push({
        entry,
        previous: current.runtime,
        decision,
        materialization,
        decrease
      });
    }
    for (const item of planned) {
      if (item.decrease) {
        if (!options.registry.beginReplacement(item.entry, snapshot.revision)) {
          continue;
        }
      }
    }
    for (const item of planned) {
      if (item.decrease && item.previous) {
        item.drainResult = drainRuntime(item.previous);
      }
    }
    for (const item of planned) {
      await replace(item, snapshot);
    }
  }, "applySnapshot");
  const drain = /* @__PURE__ */ __name(async () => {
    while (pendingSnapshot) {
      const snapshot = pendingSnapshot;
      pendingSnapshot = void 0;
      await applySnapshot(snapshot);
    }
  }, "drain");
  const ensureRunning = /* @__PURE__ */ __name(() => {
    if (!running) {
      running = drain().finally(() => {
        running = void 0;
        if (pendingSnapshot) return ensureRunning();
        return void 0;
      });
    }
    return running;
  }, "ensureRunning");
  return {
    reconcile(snapshot) {
      pendingSnapshot = snapshot;
      return ensureRunning();
    }
  };
}
__name(createWorkspaceTrustReconciler, "createWorkspaceTrustReconciler");
export {
  createWorkspaceTrustReconciler
};
/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
