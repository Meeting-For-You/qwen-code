/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  DurableTurnCommitHandler,
  DurableTurnCommitReceiptV1,
  DurableTurnCommitRequestV1,
} from '@qwen-code/acp-bridge/bridgeOptions';
import { isLoopbackBind } from './loopback-binds.js';

export const QWEN_DURABLE_TURN_COMMIT_URL_ENV = 'QWEN_DURABLE_TURN_COMMIT_URL';

const ATTEMPT_LIMIT = 3;
const ATTEMPT_TIMEOUT_MS = 120_000;
const RETRY_DELAY_MS = 100;
const MAX_RECEIPT_BYTES = 64 * 1024;

export interface DurableTurnCommitHttpOptions {
  fetchImpl?: typeof fetch;
  attemptLimit?: number;
  attemptTimeoutMs?: number;
  retryDelayMs?: number;
}

export function createDurableTurnCommitHandler(
  rawUrl: string | undefined,
  options: DurableTurnCommitHttpOptions = {},
): DurableTurnCommitHandler | undefined {
  if (rawUrl === undefined || rawUrl.trim() === '') return undefined;
  const endpoint = parseLoopbackCommitUrl(rawUrl);
  const fetchImpl = options.fetchImpl ?? fetch;
  const attemptLimit = options.attemptLimit ?? ATTEMPT_LIMIT;
  const attemptTimeoutMs = options.attemptTimeoutMs ?? ATTEMPT_TIMEOUT_MS;
  const retryDelayMs = options.retryDelayMs ?? RETRY_DELAY_MS;
  assertPositiveInteger(attemptLimit, 'attemptLimit');
  assertPositiveInteger(attemptTimeoutMs, 'attemptTimeoutMs');
  assertNonNegativeInteger(retryDelayMs, 'retryDelayMs');

  return async (request) => {
    const body = JSON.stringify(request);
    let lastError: unknown;
    for (let attempt = 1; attempt <= attemptLimit; attempt += 1) {
      try {
        const response = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body,
          signal: AbortSignal.timeout(attemptTimeoutMs),
        });
        if (!response.ok) {
          throw new Error(
            `Durable turn commit returned HTTP ${response.status}`,
          );
        }
        const contentLength = response.headers.get('content-length');
        if (
          contentLength !== null &&
          Number.parseInt(contentLength, 10) > MAX_RECEIPT_BYTES
        ) {
          throw new Error('Durable turn commit receipt is too large');
        }
        const receiptText = await response.text();
        if (Buffer.byteLength(receiptText, 'utf8') > MAX_RECEIPT_BYTES) {
          throw new Error('Durable turn commit receipt is too large');
        }
        assertExactReceipt(parseReceipt(receiptText), request);
        return;
      } catch (error) {
        lastError = error;
        if (attempt < attemptLimit && retryDelayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        }
      }
    }
    throw new Error(
      `Durable turn commit failed after ${attemptLimit} attempts`,
      { cause: lastError },
    );
  };
}

function parseLoopbackCommitUrl(rawUrl: string): URL {
  let endpoint: URL;
  try {
    endpoint = new URL(rawUrl);
  } catch {
    throw new Error(`${QWEN_DURABLE_TURN_COMMIT_URL_ENV} must be a valid URL`);
  }
  if (
    endpoint.protocol !== 'http:' ||
    !isLoopbackBind(endpoint.hostname) ||
    endpoint.username !== '' ||
    endpoint.password !== '' ||
    endpoint.hash !== ''
  ) {
    throw new Error(
      `${QWEN_DURABLE_TURN_COMMIT_URL_ENV} must be an http loopback URL without credentials or a fragment`,
    );
  }
  return endpoint;
}

function parseReceipt(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Durable turn commit returned malformed JSON');
  }
}

function assertExactReceipt(
  value: unknown,
  request: DurableTurnCommitRequestV1,
): asserts value is DurableTurnCommitReceiptV1 {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Durable turn commit returned a malformed receipt');
  }
  const receipt = value as Record<string, unknown>;
  const expectedKeys = [
    'commitId',
    'completedAt',
    'promptId',
    'sessionId',
    'snapshotHash',
    'v',
    'workspaceRevision',
  ];
  if (
    Object.keys(receipt).sort().join('\0') !== expectedKeys.join('\0') ||
    receipt['v'] !== 1 ||
    receipt['commitId'] !== request.commitId ||
    receipt['sessionId'] !== request.sessionId ||
    receipt['promptId'] !== request.promptId ||
    receipt['completedAt'] !== request.completedAt ||
    typeof receipt['snapshotHash'] !== 'string' ||
    !/^[a-f0-9]{64}$/.test(receipt['snapshotHash']) ||
    typeof receipt['workspaceRevision'] !== 'number' ||
    !Number.isSafeInteger(receipt['workspaceRevision']) ||
    receipt['workspaceRevision'] < 1
  ) {
    throw new Error('Durable turn commit returned a mismatched receipt');
  }
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive safe integer`);
  }
}

function assertNonNegativeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative safe integer`);
  }
}
