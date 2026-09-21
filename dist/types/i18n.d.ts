import { type PropsWithChildren } from 'react';
export declare const WEB_SHELL_LANGUAGES: readonly ["en", "zh-CN"];
export type WebShellLanguage = (typeof WEB_SHELL_LANGUAGES)[number];
export declare function normalizeLanguage(value: string | undefined | null): WebShellLanguage;
export declare function languageSettingToWebShellLanguage(value: unknown): WebShellLanguage | undefined;
export declare function languageLabel(language: WebShellLanguage): string;
export declare function getTranslator(language: WebShellLanguage): (key: string, vars?: Record<string, string | number>) => string;
export declare function I18nProvider({ language, children, }: PropsWithChildren<{
    language: WebShellLanguage;
}>): import("react/jsx-runtime").JSX.Element;
export declare function useI18n(): {
    language: WebShellLanguage;
    t: (key: string, vars?: Record<string, string | number>) => string;
};
