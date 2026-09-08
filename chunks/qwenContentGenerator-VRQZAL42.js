// Force strict mode and setup for ESM
"use strict";
import {
  SharedTokenManager
} from "./chunk-H2WDGQ6D.js";
import "./chunk-E4A5G5YB.js";
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
import {
  OpenAIContentGenerator
} from "./chunk-XEFMVEXN.js";
import "./chunk-ZYNTSXWK.js";
import "./chunk-4J657AJR.js";
import "./chunk-ABS25QER.js";
import "./chunk-VNOVK4I7.js";
import "./chunk-B7CDU2SL.js";
import "./chunk-SAH4BD2J.js";
import {
  DashScopeOpenAICompatibleProvider
} from "./chunk-PDMJ3KGS.js";
import "./chunk-CMHFCLBU.js";
import "./chunk-S6LOFUVP.js";
import {
  DEFAULT_DASHSCOPE_BASE_URL
} from "./chunk-2LD5U7Q3.js";
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
import {
  createDebugLogger
} from "./chunk-UHQFIS7N.js";
import "./chunk-75DOP5OR.js";
import "./chunk-DMTGGOSA.js";
import "./chunk-YQ3U5MUC.js";
import "./chunk-64REQJJ2.js";
import "./chunk-J3NNHTV6.js";
import "./chunk-RVIGZBIT.js";
import "./chunk-AMDSOFFV.js";
import "./chunk-TBWQLLFO.js";
import {
  init_esbuild_shims
} from "./chunk-5O2XNYP6.js";
import {
  __name
} from "./chunk-J2S4EL5Y.js";

// packages/core/src/qwen/qwenContentGenerator.ts
init_esbuild_shims();
var QwenContentGenerator = class extends OpenAIContentGenerator {
  static {
    __name(this, "QwenContentGenerator");
  }
  debugLogger = createDebugLogger("QWEN");
  qwenClient;
  sharedManager;
  currentToken;
  constructor(qwenClient, contentGeneratorConfig, cliConfig) {
    const dashscopeProvider = new DashScopeOpenAICompatibleProvider(
      contentGeneratorConfig,
      cliConfig
    );
    super(contentGeneratorConfig, cliConfig, dashscopeProvider);
    this.qwenClient = qwenClient;
    this.sharedManager = SharedTokenManager.getInstance();
    if (contentGeneratorConfig?.baseUrl && contentGeneratorConfig?.apiKey) {
      this.pipeline.client.baseURL = contentGeneratorConfig?.baseUrl;
      this.pipeline.client.apiKey = contentGeneratorConfig?.apiKey;
    }
  }
  /**
   * Get the current endpoint URL with proper protocol and /v1 suffix
   */
  getCurrentEndpoint(resourceUrl) {
    const baseEndpoint = resourceUrl || DEFAULT_DASHSCOPE_BASE_URL;
    const suffix = "/v1";
    const normalizedUrl = /^https?:\/\//i.test(baseEndpoint) ? baseEndpoint : `https://${baseEndpoint}`;
    return normalizedUrl.endsWith(suffix) ? normalizedUrl : `${normalizedUrl}${suffix}`;
  }
  /**
   * Override error logging behavior to suppress auth errors during token refresh
   */
  shouldSuppressErrorLogging(error, _request) {
    return this.isAuthError(error);
  }
  /**
   * Get valid token and endpoint using the shared token manager
   */
  async getValidToken() {
    try {
      const credentials = await this.sharedManager.getValidCredentials(
        this.qwenClient
      );
      if (!credentials.access_token) {
        throw new Error("No access token available");
      }
      return {
        token: credentials.access_token,
        endpoint: this.getCurrentEndpoint(credentials.resource_url)
      };
    } catch (error) {
      if (this.isAuthError(error)) {
        throw error;
      }
      this.debugLogger.warn("Failed to get token from shared manager:", error);
      throw new Error(
        "Failed to obtain valid Qwen access token. Please re-authenticate."
      );
    }
  }
  /**
   * Execute an operation with automatic credential management and retry logic.
   * This method handles:
   * - Dynamic token and endpoint retrieval
   * - Client configuration updates
   * - Retry logic on authentication errors with token refresh
   *
   * @param operation - The operation to execute with updated client configuration
   * @returns The result of the operation
   */
  async executeWithCredentialManagement(operation) {
    const attemptOperation = /* @__PURE__ */ __name(async () => {
      const { token, endpoint } = await this.getValidToken();
      this.pipeline.client.apiKey = token;
      this.pipeline.client.baseURL = endpoint;
      return await operation();
    }, "attemptOperation");
    try {
      return await attemptOperation();
    } catch (error) {
      if (this.isAuthError(error)) {
        await this.sharedManager.getValidCredentials(this.qwenClient, true);
        return await attemptOperation();
      }
      throw error;
    }
  }
  /**
   * Override to use dynamic token and endpoint with automatic retry
   */
  async generateContent(request, userPromptId) {
    return this.executeWithCredentialManagement(
      () => super.generateContent(request, userPromptId)
    );
  }
  /**
   * Override to use dynamic token and endpoint with automatic retry
   */
  async generateContentStream(request, userPromptId) {
    return this.executeWithCredentialManagement(
      () => super.generateContentStream(request, userPromptId)
    );
  }
  /**
   * Override to use dynamic token and endpoint with automatic retry
   */
  async embedContent(request) {
    return this.executeWithCredentialManagement(
      () => super.embedContent(request)
    );
  }
  /**
   * Check if an error is related to authentication/authorization
   */
  isAuthError(error) {
    if (!error) return false;
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    const errorWithCode = error;
    const errorCode = errorWithCode?.status || errorWithCode?.code;
    return errorCode === 401 || errorCode === 403 || errorCode === "401" || errorCode === "403" || errorMessage.includes("unauthorized") || errorMessage.includes("forbidden") || errorMessage.includes("invalid api key") || errorMessage.includes("invalid access token") || errorMessage.includes("token expired") || errorMessage.includes("authentication") || errorMessage.includes("access denied") || errorMessage.includes("token") && errorMessage.includes("expired");
  }
  /**
   * Get the current cached token (may be expired)
   */
  getCurrentToken() {
    if (this.currentToken) {
      return this.currentToken;
    }
    const credentials = this.sharedManager.getCurrentCredentials();
    return credentials?.access_token || null;
  }
  /**
   * Clear the cached token
   */
  clearToken() {
    this.currentToken = void 0;
    this.sharedManager.clearCache();
  }
};
export {
  QwenContentGenerator
};
/**
 * @license
 * Copyright 2025 Qwen
 * SPDX-License-Identifier: Apache-2.0
 */
