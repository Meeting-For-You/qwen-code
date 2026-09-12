interface AuthMessageProps {
    onMessage: (text: string, type?: 'status' | 'error') => void;
    onClose: () => void;
}
export declare function AuthMessage({ onMessage, onClose }: AuthMessageProps): import("react/jsx-runtime").JSX.Element;
export {};
