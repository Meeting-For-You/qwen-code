interface PreflightCell {
    kind: string;
    detail?: Record<string, unknown>;
}
interface EnvCell {
    kind: string;
    name: string;
    present?: boolean;
    value?: string;
}
export interface SystemInfo {
    nodeVersion: string;
    npmVersion: string;
    authSource: string;
    platform: string;
    arch: string;
    sandbox: string;
    proxy: string;
    memoryUsage: string;
}
export declare function collectSystemInfo(preflight: {
    cells: PreflightCell[];
} | null, env: {
    cells: EnvCell[];
} | null): SystemInfo;
export {};
