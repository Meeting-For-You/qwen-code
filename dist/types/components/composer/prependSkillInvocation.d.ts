export interface PrependSkillTransaction {
    changes: {
        from: 0;
        to: 0;
        insert: string;
    };
    selection: {
        anchor: number;
    };
    scrollIntoView: true;
}
export declare function computePrependSkillTransaction(currentDoc: string, invocation: string): PrependSkillTransaction | null;
