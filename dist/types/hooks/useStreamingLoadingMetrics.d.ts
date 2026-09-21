interface LoadingMetrics {
    estimatedOutputTokens: number;
    isReceivingContent: boolean;
}
/**
 * CLI-aligned streaming loading metrics derived from transcript blocks.
 *
 * CLI source (useGeminiStream.ts + LoadingIndicator.tsx):
 * - streamingChars: accumulated from text_delta (+text.length) and
 *   ToolCallRequest (+JSON.stringify(args).length). Reset only on new
 *   user queries, NOT on tool-result continuations.
 * - isReceivingContent: false at submitQuery start, true on first
 *   content event. Never changed elsewhere (tool calls don't flip it).
 * - outputTokens = agentTokens + round(animatedChars / 4)
 *   where agentTokens = sum of subagent task_execution.tokenCount
 * - Animation: 100ms interval, gap<70→+3, 70-200→+20%, >200→+50
 */
export declare function useStreamingLoadingMetrics(): LoadingMetrics;
export {};
