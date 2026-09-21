/**
 * Measures the title inside `row` and refreshes the hover-scroll CSS
 * variables plus the overflow flag that gates the right-edge fade mask.
 * Rows call this on every pointer entry so a renamed or resized label never
 * animates with a stale distance.
 */
export declare function measureSessionTitleScroll(row: HTMLElement): void;
