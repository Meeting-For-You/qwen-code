export type ToastTone = 'info' | 'warning' | 'error' | 'success';
/** Window event that asks the app-level toast host to show a toast. Lets
 * deeply nested components (markdown links, artifact actions) report failures
 * without prop-drilling the toast callback. */
export declare const TOAST_REQUEST_EVENT = "qwen:toast-request";
export interface ToastRequestDetail {
    tone: ToastTone;
    message: string;
}
export declare function requestToast(tone: ToastTone, message: string): void;
export interface WebShellToast {
    id: string;
    tone: ToastTone;
    message: string;
    /** Epoch ms when the toast auto-dismisses; survives host remounts. */
    dismissAt: number;
}
interface ToastHostProps {
    toasts: readonly WebShellToast[];
    onDismiss: (id: string) => void;
    /** Paint above dialog-backdrop-tier surfaces (fullscreen artifact panel). */
    elevated?: boolean;
}
export declare function ToastHost({ toasts, onDismiss, elevated, }: ToastHostProps): import("react/jsx-runtime").JSX.Element | null;
export {};
