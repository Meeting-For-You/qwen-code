/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
import { type ReactNode } from 'react';
import type { TodoDetail, TodoSnapshotDiff } from './utils/todos';
export declare const CompactModeContext: import("react").Context<boolean>;
/**
 * Per-snapshot status diffs (keyed by tool callId or plan message id), so a
 * history row can render what changed in that snapshot without re-deriving it
 * from the whole transcript. Empty by default so a row rendered outside the
 * provider still falls back gracefully.
 */
export declare const TodoTimelineContext: import("react").Context<Map<string, TodoSnapshotDiff>>;
/**
 * Per-todo timing and resource detail keyed by todoStateKey, consumed by the
 * expanded todo list so a finished task can reveal when it ran and what it
 * spent. Empty by default so a row rendered outside the provider (or in tests)
 * simply shows no expander.
 */
export declare const TodoDetailContext: import("react").Context<Map<string, TodoDetail>>;
/**
 * Provides both todo contexts in one wrapper so the message list stays at a
 * single nesting level (one provider in the tree, not two).
 */
export declare function TodoContextsProvider({ timeline, details, children, }: {
    timeline: Map<string, TodoSnapshotDiff>;
    details: Map<string, TodoDetail>;
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
