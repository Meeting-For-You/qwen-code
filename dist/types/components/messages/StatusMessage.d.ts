export interface StatusInfo {
    cliVersion: string;
    runtime: string;
    platform: string;
    auth: string;
    baseUrl: string;
    model: string;
    fastModel: string;
    sessionId: string;
    sandbox: string;
    proxy: string;
    memoryUsage: string;
}
declare const serializeStatusMessage: (data: StatusInfo) => string, parseStatusMessage: (content: string) => StatusInfo | null;
export { serializeStatusMessage, parseStatusMessage };
export declare function StatusMessage({ info }: {
    info: StatusInfo;
}): import("react/jsx-runtime").JSX.Element;
