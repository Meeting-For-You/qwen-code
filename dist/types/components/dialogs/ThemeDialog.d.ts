import { type WebShellTheme } from '../../themeContext';
interface ThemeDialogProps {
    currentTheme: WebShellTheme;
    onSelect: (theme: WebShellTheme) => void;
    onClose: () => void;
}
export declare function ThemeDialog({ currentTheme, onSelect, onClose, }: ThemeDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
