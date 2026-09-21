interface Segment {
    text: string;
    color?: string;
    bold?: boolean;
    dim?: boolean;
}
export declare function parseAnsi(input: string): Segment[];
export declare function hasAnsi(input: string): boolean;
export {};
