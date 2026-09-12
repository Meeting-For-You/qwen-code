export declare function createSentinelSerializer<T>(sentinel: string): {
    serialize(data: T): string;
    parse(content: string): T | null;
};
