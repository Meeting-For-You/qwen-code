type ComposerConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
export type ComposerPlaceholderState = 'idle' | 'processing';
export declare function shouldDisableComposerInput({ pendingApproval, isPreparingPrompt, }: {
    pendingApproval: boolean;
    isPreparingPrompt: boolean;
}): boolean;
export declare function getComposerPlaceholderState({ isPreparingPrompt, isStreaming, }: {
    isPreparingPrompt: boolean;
    isStreaming: boolean;
}): ComposerPlaceholderState;
export declare function getComposerPlaceholderKey(input: {
    isPreparingPrompt: boolean;
    isStreaming: boolean;
}): 'editor.processing' | 'editor.placeholder';
export declare function shouldBlockComposerSubmit({ connectionStatus, hasSession, }: {
    connectionStatus: ComposerConnectionStatus;
    hasSession: boolean;
}): boolean;
export {};
