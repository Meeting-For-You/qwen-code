export interface InsightProgressData {
    stage: string;
    progress: number;
    detail?: string;
    isComplete?: boolean;
    error?: string;
}
interface InsightProgressProps {
    progress: InsightProgressData;
}
export declare function InsightProgress({ progress }: InsightProgressProps): import("react/jsx-runtime").JSX.Element;
export {};
