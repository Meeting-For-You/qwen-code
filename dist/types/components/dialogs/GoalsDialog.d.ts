/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
interface GoalsDialogProps {
    /** Create a canonical Goal in a brand-new session and switch to it.
     * Return `false` when session setup failed and the error was already shown;
     * throw to render the control failure inline. */
    onCreateGoal: (condition: string) => boolean | void | Promise<boolean | void>;
    /** Open the session driving a goal — its transcript IS the goal's history. */
    onOpenSession: (sessionId: string) => void;
    onError: (error: unknown, fallback: string) => void;
}
export declare function GoalsDialog({ onCreateGoal, onOpenSession, onError, }: GoalsDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
