/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it, vi } from 'vitest';
import type { DurableTurnCommitRequestV1 } from '@qwen-code/acp-bridge/bridgeOptions';
import {
  createDurableTurnCommitHandler,
  QWEN_DURABLE_TURN_COMMIT_URL_ENV,
} from './durable-turn-commit.js';

const request: DurableTurnCommitRequestV1 = {
  v: 1,
  commitId: `sha256:${'a'.repeat(64)}`,
  sessionId: 'session-1',
  promptId: 'prompt-1',
  completedAt: '2026-09-17T10:00:00.000Z',
  stopReason: 'end_turn',
  transcriptTailUuid: '11111111-1111-4111-8111-111111111111',
};

function receipt(overrides: Record<string, unknown> = {}): Response {
  return Response.json({
    v: 1,
    commitId: request.commitId,
    sessionId: request.sessionId,
    promptId: request.promptId,
    completedAt: request.completedAt,
    snapshotHash: 'b'.repeat(64),
    workspaceRevision: 7,
    ...overrides,
  });
}

describe('durable turn commit HTTP hook', () => {
  it('is disabled without explicit environment configuration', () => {
    expect(createDurableTurnCommitHandler(undefined)).toBeUndefined();
    expect(createDurableTurnCommitHandler('  ')).toBeUndefined();
  });

  it.each([
    'https://127.0.0.1/commit',
    'http://example.com/commit',
    'http://user:secret@127.0.0.1/commit',
    'http://127.0.0.1/commit#fragment',
  ])('rejects a non-loopback-safe URL: %s', (url) => {
    expect(() => createDurableTurnCommitHandler(url)).toThrow(
      QWEN_DURABLE_TURN_COMMIT_URL_ENV,
    );
  });

  it('accepts only an exact authoritative receipt', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => receipt());
    const handler = createDurableTurnCommitHandler(
      'http://127.0.0.1:9071/v1/turn-commits',
      { fetchImpl },
    );
    await expect(handler!(request)).resolves.toBeUndefined();
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(fetchImpl.mock.calls[0]?.[1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify(request),
      headers: { 'content-type': 'application/json' },
    });
  });

  it.each([
    { snapshotHash: 'not-a-hash' },
    { workspaceRevision: -1 },
    { workspaceRevision: 0 },
    { workspaceRevision: 1.5 },
    { completedAt: '2026-09-17T10:00:01.000Z' },
    { extra: true },
  ])('rejects a malformed or mismatched receipt %#', async (overrides) => {
    const handler = createDurableTurnCommitHandler('http://[::1]:9071/commit', {
      fetchImpl: async () => receipt(overrides),
      attemptLimit: 1,
    });
    await expect(handler!(request)).rejects.toThrow(
      'Durable turn commit failed after 1 attempts',
    );
  });

  it('retries a lost response with the identical request body', async () => {
    const bodies: string[] = [];
    const fetchImpl = vi.fn(async (_url: URL, init?: RequestInit) => {
      bodies.push(String(init?.body));
      if (bodies.length === 1) throw new Error('connection reset');
      return receipt();
    });
    const handler = createDurableTurnCommitHandler(
      'http://127.0.0.1:9071/commit',
      { fetchImpl: fetchImpl as typeof fetch, retryDelayMs: 0 },
    );
    await handler!(request);
    expect(bodies).toEqual([JSON.stringify(request), JSON.stringify(request)]);
  });
});
