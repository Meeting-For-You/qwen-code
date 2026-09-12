/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DaemonSessionPrInfo } from '@qwen-code/sdk/daemon';
interface SessionPrBadgeProps {
    /** Bound PRs in binding order (last = latest). */
    prs: DaemonSessionPrInfo[];
    /**
     * Override when the badge sits inside a listbox `role="option"` row that
     * owns roving-tabindex keyboard navigation (e.g. picker dialogs).
     */
    tabIndex?: number;
}
/**
 * The `#N (+M)` pull-request badge shared by the sidebar session row, the
 * session overview card, and the picker dialogs. Renders the latest bound
 * PR with an overflow count and opens it through the desktop-aware
 * external-link opener. Non-http(s) bindings are filtered out as a
 * defense-in-depth measure on top of the daemon-side validators.
 */
export declare function SessionPrBadge({ prs, tabIndex }: SessionPrBadgeProps): import("react/jsx-runtime").JSX.Element | null;
export {};
