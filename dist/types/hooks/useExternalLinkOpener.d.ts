import type { MouseEvent } from 'react';
/**
 * Opens external link clicks through the shell's explicit desktop opener.
 *
 * The desktop webview's implicit `target="_blank"` handling can silently
 * drop new-window requests, so anchored external URLs should be routed
 * through this handler in the packaged shell; failures surface as error
 * toasts. Plain browsers keep native anchor behavior (the handler is a
 * no-op there).
 */
export declare function useExternalLinkOpener(): (event: MouseEvent<HTMLAnchorElement>, url: string | undefined) => void;
