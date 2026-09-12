import type { DaemonTranscriptBlock } from '@qwen-code/webui/daemon-react-sdk';
import type { PermissionRequest } from './types';
export declare function extractPendingPermission(blocks: readonly DaemonTranscriptBlock[]): PermissionRequest | null;
