interface StreamingStatusProps {
    startedAt?: number;
    /**
     * When false, hide the rotating "witty" loading phrase and skip its rotation
     * timer entirely — the spinner, elapsed time, token count, and cancel hint
     * still render. Split-view panes pass false to keep each pane's composer
     * status compact. Defaults to true (the main chat shows the phrase).
     */
    showPhrase?: boolean;
    /**
     * When true, the daemon reports the session has an in-flight prompt. The
     * indicator stays visible even while streamingState is idle, so long tool
     * calls that produce >3s silent gaps do not hide the loading state mid-turn
     * (#9487). The daemon's session live state is the authoritative source.
     */
    hasActivePrompt?: boolean;
}
export declare function StreamingStatus({ startedAt, showPhrase, hasActivePrompt, }: StreamingStatusProps): import("react/jsx-runtime").JSX.Element | null;
export {};
