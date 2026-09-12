import type { Message } from '../adapters/types';
export interface CopyCommandResult {
    status: 'info' | 'error';
    message: string;
}
export declare const COPY_MESSAGES: {
    readonly NO_OUTPUT: "No output in history";
    readonly NO_TEXT: "Last AI output contains no text to copy.";
    readonly CODE_MISSING: "No matching code block found in the last AI output.";
    readonly LATEX_MISSING: "No matching LaTeX block found in the last AI output.";
    readonly INLINE_LATEX_MISSING: "No matching inline LaTeX expression found in the last AI output.";
    readonly OUTPUT_COPIED: "Last output copied to the clipboard";
    readonly CLIPBOARD_PREFIX: "Failed to copy to the clipboard. ";
    readonly COPIED_SUFFIX: " copied to the clipboard";
};
type ClipboardWriter = (text: string) => Promise<void>;
export declare function copyFromLastAssistantMessage(messages: readonly Message[], args: string, writeText?: ClipboardWriter): Promise<CopyCommandResult>;
export {};
