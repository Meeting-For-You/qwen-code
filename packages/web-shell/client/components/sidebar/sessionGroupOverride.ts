import type { DaemonSessionSummary } from '@qwen-code/sdk/daemon';

/** One host-defined sidebar group. Sessions sharing an `id` share a section. */
export interface SessionGroupOverrideEntry {
  id: string;
  label: string;
}

/**
 * Host-supplied `sessionId -> group` mapping that replaces the sidebar's own
 * session grouping. Sessions without an entry fall into a trailing
 * "ungrouped" section.
 */
export type SessionGroupOverride = Readonly<
  Record<string, SessionGroupOverrideEntry>
>;

export interface SessionGroupOverrideSection {
  id: string;
  label: string;
  sessions: DaemonSessionSummary[];
}

const SECTION_ID_PREFIX = 'session-group-override:';
const FALLBACK_SECTION_ID = 'session-group-override-fallback';

/**
 * Buckets `sessions` by the host mapping, keeping the input order inside every
 * section and ordering sections by first-seen session. Returns `[]` when no
 * session resolves to a mapped group, so callers fall back to the sidebar's
 * built-in presentation instead of rendering a lone "ungrouped" section.
 */
export function groupSessionsByOverride(
  sessions: readonly DaemonSessionSummary[],
  override: SessionGroupOverride | undefined,
  otherLabel: string,
): SessionGroupOverrideSection[] {
  if (!override) return [];
  const sections = new Map<string, SessionGroupOverrideSection>();
  const unmapped: DaemonSessionSummary[] = [];

  for (const session of sessions) {
    // Object.hasOwn: a sessionId like 'constructor' would otherwise resolve
    // through Object.prototype on a plain record.
    const entry = Object.hasOwn(override, session.sessionId)
      ? override[session.sessionId]
      : undefined;
    if (!entry) {
      unmapped.push(session);
      continue;
    }
    const id = `${SECTION_ID_PREFIX}${entry.id}`;
    const existing = sections.get(id);
    if (existing) {
      existing.sessions.push(session);
      continue;
    }
    sections.set(id, { id, label: entry.label, sessions: [session] });
  }

  if (sections.size === 0) return [];
  const ordered = [...sections.values()];
  return unmapped.length === 0
    ? ordered
    : [
        ...ordered,
        { id: FALLBACK_SECTION_ID, label: otherLabel, sessions: unmapped },
      ];
}
