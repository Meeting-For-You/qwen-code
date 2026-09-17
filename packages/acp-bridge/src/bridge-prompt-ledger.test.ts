/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it, vi } from 'vitest';
import { makeBridge, makeChannel, WS_A } from './internal/testUtils.js';
import type {
  DurableTurnCommitRequestV1,
  PromptLedgerSink,
} from './bridgeOptions.js';
import type { BridgeEvent } from './eventBus.js';
import type { PromptLedgerRecord } from './prompt-ledger.js';

function recordingLedger(): {
  records: PromptLedgerRecord[];
  sink: PromptLedgerSink;
} {
  const records: PromptLedgerRecord[] = [];
  return {
    records,
    sink: {
      appendSync: (_sessionId, record) => {
        records.push(record);
      },
    },
  };
}

function terminalRecords(records: readonly PromptLedgerRecord[]) {
  return records.filter(
    (record): record is Extract<PromptLedgerRecord, { terminal: string }> =>
      'terminal' in record,
  );
}

describe('bridge prompt terminal ledger writes', () => {
  it('appends in_flight at admission and completed at settle', async () => {
    const handle = makeChannel();
    const ledger = recordingLedger();
    const bridge = makeBridge({
      channelFactory: async () => handle.channel,
      promptLedger: ledger.sink,
    });
    try {
      const session = await bridge.spawnOrAttach({ workspaceCwd: WS_A });
      const running = bridge.sendPrompt(
        session.sessionId,
        {
          sessionId: session.sessionId,
          prompt: [{ type: 'text', text: 'hello' }],
        },
        undefined,
        { promptId: 'p-ledger-1' },
      );
      const inFlight = ledger.records.filter(
        (record) => !('terminal' in record),
      );
      expect(inFlight).toHaveLength(1);
      expect(inFlight[0]?.promptId).toBe('p-ledger-1');

      const result = await running;
      expect(result.stopReason).toBe('end_turn');
      expect(terminalRecords(ledger.records)).toEqual([
        {
          v: 1,
          promptId: 'p-ledger-1',
          terminal: 'completed',
          stopReason: 'end_turn',
          at: expect.any(Number),
        },
      ]);
    } finally {
      await bridge.shutdown();
    }
  });

  it('stamps the dispatch marker from the sink into the in_flight record', async () => {
    const handle = makeChannel();
    const records: PromptLedgerRecord[] = [];
    const bridge = makeBridge({
      channelFactory: async () => handle.channel,
      promptLedger: {
        appendSync: (_sessionId, record) => {
          records.push(record);
        },
        transcriptTailUuid: () => 'tail-at-admission',
      },
    });
    try {
      const session = await bridge.spawnOrAttach({ workspaceCwd: WS_A });
      await bridge.sendPrompt(
        session.sessionId,
        {
          sessionId: session.sessionId,
          prompt: [{ type: 'text', text: 'hello' }],
        },
        undefined,
        { promptId: 'p-marker' },
      );
      expect(records).toContainEqual({
        v: 1,
        promptId: 'p-marker',
        state: 'in_flight',
        tailUuid: 'tail-at-admission',
        at: expect.any(Number),
      });
    } finally {
      await bridge.shutdown();
    }
  });

  it('keeps admitting when the dispatch marker lookup fails', async () => {
    const handle = makeChannel();
    const records: PromptLedgerRecord[] = [];
    const bridge = makeBridge({
      channelFactory: async () => handle.channel,
      promptLedger: {
        appendSync: (_sessionId, record) => {
          records.push(record);
        },
        transcriptTailUuid: () => {
          throw new Error('transcript unreadable');
        },
      },
    });
    try {
      const session = await bridge.spawnOrAttach({ workspaceCwd: WS_A });
      const result = await bridge.sendPrompt(
        session.sessionId,
        {
          sessionId: session.sessionId,
          prompt: [{ type: 'text', text: 'hello' }],
        },
        undefined,
        { promptId: 'p-no-marker' },
      );
      expect(result.stopReason).toBe('end_turn');
      expect(records).toContainEqual({
        v: 1,
        promptId: 'p-no-marker',
        state: 'in_flight',
        at: expect.any(Number),
      });
    } finally {
      await bridge.shutdown();
    }
  });

  it('persists the daemon_shutdown error terminal when shutdown flushes a pending prompt', async () => {
    const handle = makeChannel({
      promptImpl: () => new Promise(() => {}),
    });
    const ledger = recordingLedger();
    const bridge = makeBridge({
      channelFactory: async () => handle.channel,
      promptLedger: ledger.sink,
    });
    const session = await bridge.spawnOrAttach({ workspaceCwd: WS_A });
    const running = bridge.sendPrompt(
      session.sessionId,
      {
        sessionId: session.sessionId,
        prompt: [{ type: 'text', text: 'long work' }],
      },
      undefined,
      { promptId: 'p-ledger-2' },
    );
    void running.catch(() => undefined);
    await bridge.shutdown();
    await running.catch(() => undefined);
    expect(terminalRecords(ledger.records)).toEqual([
      {
        v: 1,
        promptId: 'p-ledger-2',
        terminal: 'error',
        code: 'daemon_shutdown',
        at: expect.any(Number),
      },
    ]);
  });

  it('records in_flight for queued admissions and flushes both on shutdown', async () => {
    const handle = makeChannel({
      promptImpl: () => new Promise(() => {}),
    });
    const ledger = recordingLedger();
    const bridge = makeBridge({
      channelFactory: async () => handle.channel,
      promptLedger: ledger.sink,
    });
    const session = await bridge.spawnOrAttach({ workspaceCwd: WS_A });
    const first = bridge.sendPrompt(
      session.sessionId,
      {
        sessionId: session.sessionId,
        prompt: [{ type: 'text', text: 'never resolves' }],
      },
      undefined,
      { promptId: 'p-queued-a' },
    );
    void first.catch(() => undefined);
    const second = bridge.sendPrompt(
      session.sessionId,
      {
        sessionId: session.sessionId,
        prompt: [{ type: 'text', text: 'queued behind' }],
      },
      undefined,
      { promptId: 'p-queued-b' },
    );
    void second.catch(() => undefined);

    // Admission is synchronous (write-ahead): both in_flight records are
    // on the ledger before either prompt settles — the queued one included.
    const inFlight = ledger.records.filter((record) => !('terminal' in record));
    expect(inFlight).toHaveLength(2);
    expect(inFlight.map((record) => record.promptId)).toEqual([
      'p-queued-a',
      'p-queued-b',
    ]);

    await bridge.shutdown();
    await first.catch(() => undefined);
    await second.catch(() => undefined);

    const terminals = terminalRecords(ledger.records);
    expect(terminals.map((record) => record.promptId).sort()).toEqual([
      'p-queued-a',
      'p-queued-b',
    ]);
    for (const terminal of terminals) {
      expect(terminal.terminal).toBe('error');
      expect(terminal.code).toBe('daemon_shutdown');
    }
  });

  it('maps a cancelled stopReason to a cancelled terminal record', async () => {
    const handle = makeChannel({
      promptImpl: () => ({ stopReason: 'cancelled' }),
    });
    const ledger = recordingLedger();
    const bridge = makeBridge({
      channelFactory: async () => handle.channel,
      promptLedger: ledger.sink,
    });
    try {
      const session = await bridge.spawnOrAttach({ workspaceCwd: WS_A });
      await bridge.sendPrompt(
        session.sessionId,
        {
          sessionId: session.sessionId,
          prompt: [{ type: 'text', text: 'stop early' }],
        },
        undefined,
        { promptId: 'p-ledger-3' },
      );
      expect(terminalRecords(ledger.records)).toEqual([
        {
          v: 1,
          promptId: 'p-ledger-3',
          terminal: 'cancelled',
          at: expect.any(Number),
        },
      ]);
    } finally {
      await bridge.shutdown();
    }
  });

  it('keeps prompt execution working when the ledger sink throws', async () => {
    const handle = makeChannel();
    const bridge = makeBridge({
      channelFactory: async () => handle.channel,
      promptLedger: {
        appendSync: () => {
          throw new Error('disk full');
        },
      },
    });
    try {
      const session = await bridge.spawnOrAttach({ workspaceCwd: WS_A });
      const result = await bridge.sendPrompt(session.sessionId, {
        sessionId: session.sessionId,
        prompt: [{ type: 'text', text: 'hello' }],
      });
      expect(result.stopReason).toBe('end_turn');
    } finally {
      await bridge.shutdown();
    }
  });

  it('writes nothing when no ledger sink is configured', async () => {
    const handle = makeChannel();
    const bridge = makeBridge({
      channelFactory: async () => handle.channel,
    });
    try {
      const session = await bridge.spawnOrAttach({ workspaceCwd: WS_A });
      await bridge.sendPrompt(session.sessionId, {
        sessionId: session.sessionId,
        prompt: [{ type: 'text', text: 'hello' }],
      });
      // No assertion target beyond "does not throw"; the interesting
      // guarantee is that omitting the sink is valid, exercised by every
      // other bridge test that never configures one.
      expect(bridge.sessionCount).toBe(1);
    } finally {
      await bridge.shutdown();
    }
  });
});

describe('durable turn completion barrier', () => {
  it('withholds success and the next prompt until durable commit succeeds', async () => {
    let releaseCommit: (() => void) | undefined;
    const commitGate = new Promise<void>((resolve) => {
      releaseCommit = resolve;
    });
    const requests: DurableTurnCommitRequestV1[] = [];
    const events: BridgeEvent[] = [];
    const branchPoint = {
      assistantRecordUuid: '22222222-2222-4222-8222-222222222222',
      checkpointUuid: '33333333-3333-4333-8333-333333333333',
    };
    const handle = makeChannel({
      promptImpl: () => ({
        stopReason: 'end_turn',
        _meta: { 'qwen.branchPoint': branchPoint },
      }),
    });
    const ledger = recordingLedger();
    ledger.sink.transcriptTailUuid = () =>
      '11111111-1111-4111-8111-111111111111';
    const bridge = makeBridge({
      channelFactory: async () => handle.channel,
      promptLedger: ledger.sink,
      onDurableTurnCommit: async (request) => {
        requests.push(request);
        await commitGate;
      },
    });
    try {
      const session = await bridge.spawnOrAttach({ workspaceCwd: WS_A });
      const subscription = (async () => {
        for await (const event of bridge.subscribeEvents(session.sessionId)) {
          events.push(event);
        }
      })();
      void subscription.catch(() => undefined);
      let firstResolved = false;
      const first = bridge
        .sendPrompt(
          session.sessionId,
          {
            sessionId: session.sessionId,
            prompt: [{ type: 'text', text: 'first' }],
          },
          undefined,
          { promptId: 'prompt-first' },
        )
        .then((result) => {
          firstResolved = true;
          return result;
        });
      const second = bridge.sendPrompt(
        session.sessionId,
        {
          sessionId: session.sessionId,
          prompt: [{ type: 'text', text: 'second' }],
        },
        undefined,
        { promptId: 'prompt-second' },
      );

      await vi.waitFor(() => expect(requests).toHaveLength(1));
      expect(handle.agent.promptCalls).toHaveLength(1);
      expect(firstResolved).toBe(false);
      expect(bridge.getSessionSummary(session.sessionId).hasActivePrompt).toBe(
        true,
      );
      expect(events.some((event) => event.type === 'turn_complete')).toBe(
        false,
      );
      expect(terminalRecords(ledger.records)).toEqual([
        expect.objectContaining({
          promptId: 'prompt-first',
          terminal: 'completed',
        }),
      ]);

      releaseCommit!();
      await first;
      await vi.waitFor(() => expect(handle.agent.promptCalls).toHaveLength(2));
      await second;
      await vi.waitFor(() =>
        expect(
          events.filter((event) => event.type === 'turn_complete'),
        ).toHaveLength(2),
      );
      expect(bridge.getSessionSummary(session.sessionId).hasActivePrompt).toBe(
        false,
      );
      expect(requests[0]).toMatchObject({
        v: 1,
        commitId: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
        sessionId: session.sessionId,
        promptId: 'prompt-first',
        stopReason: 'end_turn',
        transcriptTailUuid: '11111111-1111-4111-8111-111111111111',
        branchPoint,
      });
      expect(requests[0]?.completedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
      expect(requests).toHaveLength(2);
      expect(requests[1]?.commitId).not.toBe(requests[0]?.commitId);
    } finally {
      releaseCommit?.();
      await bridge.shutdown();
    }
  });

  it('publishes only turn_error when durable commit fails', async () => {
    const events: BridgeEvent[] = [];
    const handle = makeChannel();
    const ledger = recordingLedger();
    ledger.sink.transcriptTailUuid = () =>
      '11111111-1111-4111-8111-111111111111';
    const bridge = makeBridge({
      channelFactory: async () => handle.channel,
      promptLedger: ledger.sink,
      onDurableTurnCommit: async () => {
        throw new Error('snapshot unavailable');
      },
    });
    try {
      const session = await bridge.spawnOrAttach({ workspaceCwd: WS_A });
      const subscription = (async () => {
        for await (const event of bridge.subscribeEvents(session.sessionId)) {
          events.push(event);
        }
      })();
      void subscription.catch(() => undefined);

      await expect(
        bridge.sendPrompt(
          session.sessionId,
          {
            sessionId: session.sessionId,
            prompt: [{ type: 'text', text: 'commit me' }],
          },
          undefined,
          { promptId: 'prompt-failed-commit' },
        ),
      ).rejects.toMatchObject({ code: 'durable_turn_commit_failed' });
      await vi.waitFor(() =>
        expect(events.some((event) => event.type === 'turn_error')).toBe(true),
      );
      expect(events.some((event) => event.type === 'turn_complete')).toBe(
        false,
      );
      expect(events.find((event) => event.type === 'turn_error')).toMatchObject(
        {
          promptId: 'prompt-failed-commit',
          data: { code: 'durable_turn_commit_failed' },
        },
      );
      expect(terminalRecords(ledger.records).at(-1)).toMatchObject({
        promptId: 'prompt-failed-commit',
        terminal: 'error',
        code: 'durable_turn_commit_failed',
      });
    } finally {
      await bridge.shutdown();
    }
  });

  it('fails closed when transcript boundary evidence is unavailable', async () => {
    const onDurableTurnCommit = vi.fn(async () => undefined);
    const handle = makeChannel();
    const ledger = recordingLedger();
    const bridge = makeBridge({
      channelFactory: async () => handle.channel,
      promptLedger: ledger.sink,
      onDurableTurnCommit,
    });
    try {
      const session = await bridge.spawnOrAttach({ workspaceCwd: WS_A });
      await expect(
        bridge.sendPrompt(session.sessionId, {
          sessionId: session.sessionId,
          prompt: [{ type: 'text', text: 'missing transcript tail' }],
        }),
      ).rejects.toMatchObject({ code: 'durable_turn_commit_failed' });
      expect(onDurableTurnCommit).not.toHaveBeenCalled();
      expect(terminalRecords(ledger.records).at(-1)).toMatchObject({
        terminal: 'error',
        code: 'durable_turn_commit_failed',
      });
    } finally {
      await bridge.shutdown();
    }
  });

  it.each([
    {
      name: 'cancelled completion',
      promptImpl: () => ({ stopReason: 'cancelled' as const }),
      rejects: false,
    },
    {
      name: 'ACP error',
      promptImpl: () => {
        throw new Error('provider failed');
      },
      rejects: true,
    },
  ])('does not commit a $name', async ({ promptImpl, rejects }) => {
    const onDurableTurnCommit = vi.fn(async () => undefined);
    const handle = makeChannel({ promptImpl });
    const ledger = recordingLedger();
    ledger.sink.transcriptTailUuid = () =>
      '11111111-1111-4111-8111-111111111111';
    const bridge = makeBridge({
      channelFactory: async () => handle.channel,
      promptLedger: ledger.sink,
      onDurableTurnCommit,
    });
    try {
      const session = await bridge.spawnOrAttach({ workspaceCwd: WS_A });
      const prompt = bridge.sendPrompt(session.sessionId, {
        sessionId: session.sessionId,
        prompt: [{ type: 'text', text: 'do not commit' }],
      });
      if (rejects) await expect(prompt).rejects.toThrow();
      else
        await expect(prompt).resolves.toMatchObject({
          stopReason: 'cancelled',
        });
      expect(onDurableTurnCommit).not.toHaveBeenCalled();
    } finally {
      await bridge.shutdown();
    }
  });
});
