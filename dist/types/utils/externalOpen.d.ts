/**
 * External-URL opening helper shared by markdown links and `external_url`
 * link artifacts.
 *
 * Inside the packaged desktop shell, external clicks use Tauri's opener
 * plugin. Plain browsers keep native anchor behavior at the call sites.
 */
/** True when the Web Shell runs inside the packaged Tauri desktop window. */
export declare function isDesktopShell(): boolean;
export declare function isExternalOpenUrl(url: string | undefined): boolean;
/**
 * Opens `url` in the OS default browser. Rejects when the open fails so
 * callers can surface a visible error instead of swallowing the click.
 */
export declare function openExternalUrl(url: string): Promise<void>;
