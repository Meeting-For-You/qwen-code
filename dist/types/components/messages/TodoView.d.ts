import type { TodoItem } from '../../adapters/types';
import { type TodoEvent } from '../../utils/todos';
/**
 * Collapsed view: the change a single snapshot introduced — items that just
 * completed and items that just started. With no tracked change (an unchanged
 * re-emit, or a snapshot rendered without a timeline) it falls back to the
 * current focus item so the row is never empty.
 */
export declare function TodoEventSummary({ todos, events, }: {
    todos: TodoItem[];
    events: readonly TodoEvent[];
}): import("react/jsx-runtime").JSX.Element | null;
/** Expanded view: the full list. `numbered` adds the 1. 2. 3. index column. */
export declare function TodoFullList({ todos, numbered, }: {
    todos: TodoItem[];
    numbered?: boolean;
}): import("react/jsx-runtime").JSX.Element;
