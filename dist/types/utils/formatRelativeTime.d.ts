import type { useI18n } from '../i18n';
type Translate = ReturnType<typeof useI18n>['t'];
export declare function formatRelativeTime(iso: string, t: Translate): string;
export {};
