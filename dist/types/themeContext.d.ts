export declare const WebShellThemeId: {
    readonly Dark: "dark";
    readonly Light: "light";
};
export type WebShellTheme = (typeof WebShellThemeId)[keyof typeof WebShellThemeId];
export declare const WEB_SHELL_THEMES: readonly WebShellTheme[];
export declare const ThemeProvider: import("react").Provider<WebShellTheme>;
export declare function useTheme(): WebShellTheme;
export declare const THEME_SETTING_KEY = "ui.theme";
export declare const LANGUAGE_SETTING_KEY = "general.language";
export declare function themeSettingToWebShellTheme(value: unknown, fallback?: WebShellTheme): WebShellTheme | undefined;
export declare function webShellThemeToSettingValue(theme: WebShellTheme): string;
