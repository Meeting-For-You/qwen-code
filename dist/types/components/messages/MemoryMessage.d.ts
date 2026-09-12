import { type DaemonContextFileScope } from '@qwen-code/webui/daemon-react-sdk';
interface MemoryMessageProps {
    refreshSignal?: number;
    addSignal?: number;
    addScope?: DaemonContextFileScope;
    onMessage?: (message: string, type?: 'status' | 'error') => void;
}
export declare function MemoryMessage({ refreshSignal, addSignal, addScope, onMessage, }: MemoryMessageProps): import("react/jsx-runtime").JSX.Element;
export {};
