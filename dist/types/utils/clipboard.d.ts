/**
 * Clipboard write helper with a fallback for non-secure contexts.
 *
 * The async Clipboard API (`navigator.clipboard`) is only exposed in secure
 * contexts (HTTPS or loopback). The daemon serves the Web Shell over plain
 * HTTP, so opening it through a non-loopback address (e.g.
 * `http://10.x.x.x:4170`) leaves `navigator.clipboard` undefined and every
 * copy entry point used to fail. Fall back to the legacy
 * `document.execCommand('copy')` path so copying keeps working there.
 * See https://github.com/QwenLM/qwen-code/issues/9485.
 *
 * Known edge: in a secure context where clipboard-write permission has never
 * been decided, `writeText` only settles when the user answers the permission
 * prompt. If they block it after several seconds, the transient user
 * activation that `execCommand('copy')` needs may already have expired, so
 * the fallback can still fail. The common repeat-visit case (permission
 * already `denied`) is covered because `writeText` rejects promptly and the
 * fallback runs while the gesture is still active.
 *
 * `writeText` is invoked synchronously in the caller's tick (no permission
 * pre-query) so gesture-bound tests and click handlers observe the call
 * immediately; the rejection is the fallback trigger.
 */
export declare function writeClipboardText(text: string): Promise<void>;
/**
 * Single reporter for clipboard write failures. Call sites that only want to
 * log a failed copy (no user-visible error surface) attach
 * `.catch(warnClipboardWriteFailure)` so the prefix/format lives in one place;
 * callers that surface the failure in the UI keep their own handling.
 */
export declare function warnClipboardWriteFailure(error: unknown): void;
