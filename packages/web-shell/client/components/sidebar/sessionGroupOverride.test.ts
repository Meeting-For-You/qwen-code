import { describe, expect, it } from 'vitest';
import type { DaemonSessionSummary } from '@qwen-code/sdk/daemon';
import {
  groupSessionsByOverride,
  type SessionGroupOverride,
} from './sessionGroupOverride';

function session(sessionId: string): DaemonSessionSummary {
  return { sessionId, workspaceCwd: '/workspace' };
}

function summarize(groups: ReturnType<typeof groupSessionsByOverride>) {
  return groups.map(({ id, label, sessions }) => ({
    id,
    label,
    sessions: sessions.map((item) => item.sessionId),
  }));
}

const override: SessionGroupOverride = {
  a1: { id: 'alpha', label: 'Alpha' },
  a2: { id: 'alpha', label: 'Alpha' },
  b1: { id: 'beta', label: 'Beta' },
};

describe('groupSessionsByOverride', () => {
  it('returns no sections when the override is missing or empty', () => {
    const sessions = [session('a1'), session('x')];
    expect(groupSessionsByOverride(sessions, undefined, 'Other')).toEqual([]);
    expect(groupSessionsByOverride(sessions, {}, 'Other')).toEqual([]);
  });

  it('combines sessions of the same group in first-seen order', () => {
    const groups = groupSessionsByOverride(
      [session('b1'), session('a1'), session('a2')],
      override,
      'Other',
    );

    expect(summarize(groups)).toEqual([
      {
        id: 'session-group-override:beta',
        label: 'Beta',
        sessions: ['b1'],
      },
      {
        id: 'session-group-override:alpha',
        label: 'Alpha',
        sessions: ['a1', 'a2'],
      },
    ]);
  });

  it('keeps the incoming session order inside each section', () => {
    const groups = groupSessionsByOverride(
      [session('a2'), session('b1'), session('a1')],
      override,
      'Other',
    );

    expect(summarize(groups)[0]?.sessions).toEqual(['a2', 'a1']);
  });

  it('pins unmapped sessions into a trailing fallback section', () => {
    const groups = groupSessionsByOverride(
      [session('x'), session('a1'), session('y'), session('b1')],
      override,
      'Other',
    );

    expect(summarize(groups)).toEqual([
      {
        id: 'session-group-override:alpha',
        label: 'Alpha',
        sessions: ['a1'],
      },
      {
        id: 'session-group-override:beta',
        label: 'Beta',
        sessions: ['b1'],
      },
      {
        id: 'session-group-override-fallback',
        label: 'Other',
        sessions: ['x', 'y'],
      },
    ]);
  });

  it('omits mapped groups that have no visible session', () => {
    const groups = groupSessionsByOverride([session('b1')], override, 'Other');

    expect(summarize(groups).map((group) => group.label)).toEqual(['Beta']);
  });

  it('returns no sections when no session resolves to a mapped group', () => {
    expect(
      groupSessionsByOverride([session('x'), session('y')], override, 'Other'),
    ).toEqual([]);
  });

  it('treats prototype-member sessionIds as unmapped instead of crashing', () => {
    const groups = groupSessionsByOverride(
      [session('constructor'), session('__proto__'), session('a1')],
      override,
      'Other',
    );

    expect(summarize(groups)).toEqual([
      {
        id: 'session-group-override:alpha',
        label: 'Alpha',
        sessions: ['a1'],
      },
      {
        id: 'session-group-override-fallback',
        label: 'Other',
        sessions: ['constructor', '__proto__'],
      },
    ]);
  });

  it('cannot collide with built-in section ids for arbitrary host group ids', () => {
    const groups = groupSessionsByOverride(
      [session('r'), session('g'), session('c')],
      {
        r: { id: 'recent', label: 'R' },
        g: { id: 'group:1', label: 'G' },
        c: { id: 'color:red', label: 'C' },
      },
      'Other',
    );

    expect(groups.map((group) => group.id)).toEqual([
      'session-group-override:recent',
      'session-group-override:group:1',
      'session-group-override:color:red',
    ]);
  });
});
