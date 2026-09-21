import { AppBridge } from '@modelcontextprotocol/ext-apps/app-bridge';
type SandboxResource = Parameters<AppBridge['sendSandboxResourceReady']>[0];
type AppToolResult = Parameters<AppBridge['sendToolResult']>[0];
export interface McpAppDisplay {
    type: 'mcp_app';
    serverName: string;
    resourceUri: string;
    html: string;
    toolResult: AppToolResult;
    toolArguments: Record<string, unknown>;
    fallbackText: string;
    csp?: SandboxResource['csp'];
    permissions?: SandboxResource['permissions'];
}
export declare function getMcpAppDisplay(value: unknown): McpAppDisplay | undefined;
export declare function resolveMcpAppSandboxUrl(daemonBaseUrl: string, hostUrl: string): string | undefined;
export declare function applySandboxCspQuery(sandboxUrl: string, cspJson: string): string;
export declare function McpApp({ display }: {
    display: McpAppDisplay;
}): import("react/jsx-runtime").JSX.Element;
export {};
