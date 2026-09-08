// Force strict mode and setup for ESM
"use strict";
import {
  readDaemonTrustPolicySnapshot
} from "./chunk-MQJCROWY.js";
import "./chunk-AA7XPRCI.js";
import "./chunk-RKUWKYED.js";
import "./chunk-H7NNKSOR.js";
import "./chunk-GOXKNSDZ.js";
import "./chunk-IDS7MSUP.js";
import "./chunk-LDP5OD6N.js";
import "./chunk-5EJZE3FP.js";
import "./chunk-MICXJAKU.js";
import "./chunk-5PA6UEYA.js";
import {
  onTrustedFoldersChanged
} from "./chunk-YP3NBNIZ.js";
import "./chunk-NPQ5ZKRP.js";
import "./chunk-MR3PXB6E.js";
import "./chunk-6ZWR4VPS.js";
import "./chunk-4RKOX6KV.js";
import "./chunk-CQH5KTKC.js";
import "./chunk-LJZSMWOH.js";
import "./chunk-VFU5HERL.js";
import "./chunk-PKAYJDB3.js";
import "./chunk-6IUNAPLR.js";
import "./chunk-OIVXBW3W.js";
import "./chunk-MXFA6OME.js";
import "./chunk-XQFT3QUF.js";
import "./chunk-VTHREBQM.js";
import "./chunk-ZPJWUGCS.js";
import "./chunk-H2WDGQ6D.js";
import "./chunk-BZVBWMZG.js";
import {
  ideContextStore
} from "./chunk-E4A5G5YB.js";
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
import "./chunk-7RHAVFGI.js";
import "./chunk-YRLW2MSX.js";
import "./chunk-VGC4I5JJ.js";
import "./chunk-3I6UTTDX.js";
import "./chunk-6PJOTWAN.js";
import "./chunk-BWORX6FA.js";
import "./chunk-WZAD4ZNJ.js";
import "./chunk-FPGTNKCP.js";
import "./chunk-6DIGWMGT.js";
import "./chunk-IVI3S6LL.js";
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

// packages/cli/src/config/daemon-trust-policy-monitor.ts
init_esbuild_shims();
function createDaemonTrustPolicyMonitor(options) {
  const readSnapshot = options.readSnapshot ?? readDaemonTrustPolicySnapshot;
  const pollIntervalMs = options.pollIntervalMs ?? 1e3;
  const pendingReasons = /* @__PURE__ */ new Set();
  let started = false;
  let stopped = false;
  let lastRevision;
  let timer;
  let unsubscribeIde;
  let unsubscribeTrustedFolders;
  let running;
  const drain = /* @__PURE__ */ __name(async () => {
    while (!stopped && pendingReasons.size > 0) {
      const reasons = new Set(pendingReasons);
      pendingReasons.clear();
      try {
        const snapshot = await readSnapshot();
        if (stopped) return;
        if (snapshot.revision !== lastRevision || reasons.has("manual")) {
          await options.onSnapshot(snapshot, reasons);
          lastRevision = snapshot.revision;
        }
      } catch (error) {
        options.onError?.(error);
      }
    }
  }, "drain");
  const startDrain = /* @__PURE__ */ __name(() => {
    running = drain().finally(() => {
      running = void 0;
      if (!stopped && pendingReasons.size > 0) {
        return startDrain();
      }
      return void 0;
    });
    return running;
  }, "startDrain");
  const requestReconcile = /* @__PURE__ */ __name((reason = "manual") => {
    if (stopped) return Promise.resolve();
    pendingReasons.add(reason);
    return running ?? startDrain();
  }, "requestReconcile");
  return {
    async start() {
      if (started) {
        await running;
        return;
      }
      started = true;
      unsubscribeIde = ideContextStore.subscribe(() => {
        void requestReconcile("ide");
      });
      unsubscribeTrustedFolders = onTrustedFoldersChanged(() => {
        void requestReconcile("trusted_folders");
      });
      timer = setInterval(() => {
        void requestReconcile("poll");
      }, pollIntervalMs);
      timer.unref?.();
      await requestReconcile("initial");
    },
    requestReconcile,
    stop() {
      if (stopped) return;
      stopped = true;
      pendingReasons.clear();
      if (timer) clearInterval(timer);
      unsubscribeIde?.();
      unsubscribeTrustedFolders?.();
    }
  };
}
__name(createDaemonTrustPolicyMonitor, "createDaemonTrustPolicyMonitor");
export {
  createDaemonTrustPolicyMonitor
};
/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
