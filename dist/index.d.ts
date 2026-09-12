import { Context } from 'react';
import { default as default_2 } from 'react';
import { Dispatch } from 'react';
import { FC } from 'react';
import { ForwardRefExoticComponent } from 'react';
import { JSX } from 'react/jsx-runtime';
import { NamedExoticComponent } from 'react';
import { PropsWithChildren } from 'react';
import { ReactNode } from 'react';
import { RefAttributes } from 'react';
import { SetStateAction } from 'react';
import { SVGProps } from 'react';

/**
 * ACP message format (vscode-ide-companion input)
 */
export declare interface ACPMessage {
    type: 'message' | 'in-progress-tool-call' | 'completed-tool-call';
    data: ACPMessageData | ToolCallData;
}

/**
 * ACP text message data
 */
export declare interface ACPMessageData {
    role: 'user' | 'assistant' | 'thinking';
    content: string;
    timestamp?: number;
    fileContext?: FileContext[];
}

/**
 * Adapt ACP messages to unified format
 *
 * @param messages - Array of ACP messages from vscode-ide-companion
 * @returns Array of unified messages with timeline positions calculated
 */
export declare function adaptACPMessages(messages: ACPMessage[]): UnifiedMessage[];

/**
 * Adapt JSONL messages to unified format
 *
 * @param messages - Array of JSONL messages
 * @returns Array of unified messages with timeline positions calculated
 */
export declare function adaptJSONLMessages(messages: JSONLMessage[]): UnifiedMessage[];

export declare interface AgentExecutionRawOutput {
    type: 'task_execution';
    subagentName: string;
    subagentColor?: string;
    taskDescription: string;
    taskPrompt: string;
    status: AgentExecutionStatus;
    terminateReason?: string;
    result?: string;
    executionSummary?: AgentExecutionSummary;
    toolCalls?: AgentExecutionToolCall[];
}

export declare type AgentExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled';

export declare interface AgentExecutionSummary {
    totalToolCalls: number;
    totalTokens: number;
    outputTokens?: number;
    totalDurationMs: number;
    successfulToolCalls?: number;
    failedToolCalls?: number;
    successRate?: number;
}

export declare interface AgentExecutionToolCall {
    callId: string;
    name: string;
    status: AgentToolCallStatus;
    error?: string;
    description?: string;
}

export declare const AgentToolCall: FC<BaseToolCallProps>;

export declare type AgentToolCallStatus = 'executing' | 'awaiting_approval' | 'success' | 'failed';

/**
 * Arrow up icon (20x20)
 * Used for send message button
 */
export declare const ArrowUpIcon: FC<IconProps_2>;

export declare const AskUserQuestionDialog: FC<AskUserQuestionDialogProps>;

export declare interface AskUserQuestionDialogProps {
    questions: Question[];
    onSubmit: (answers: Record<string, string>) => void;
    onCancel: () => void;
}

export declare const AssistantMessage: NamedExoticComponent<AssistantMessageProps>;

export declare interface AssistantMessageProps {
    content: string;
    timestamp?: number;
    onFileClick?: (path: string) => void;
    status?: AssistantMessageStatus;
    /** When true, render without the left status bullet (no ::before dot) */
    hideStatusIcon?: boolean;
    /** Whether this is the first item in an AI response sequence (for timeline) */
    isFirst?: boolean;
    /** Whether this is the last item in an AI response sequence (for timeline) */
    isLast?: boolean;
}

export declare type AssistantMessageStatus = 'default' | 'success' | 'error' | 'warning' | 'loading';

/**
 * Auto/fast-forward icon (16x16)
 * Used for "Edit automatically" mode
 */
export declare const AutoEditIcon: FC<IconProps_2>;

/**
 * Base props for all tool call components
 */
export declare interface BaseToolCallProps {
    toolCall: ToolCallData;
    isFirst?: boolean;
    isLast?: boolean;
}

/**
 * Button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click me
 * </Button>
 * ```
 */
export declare const Button: ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement>>;

/**
 * Button component props interface
 */
declare interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Button content */
    children: ReactNode;
    /** Visual style variant */
    variant?: ButtonVariant;
    /** Button size */
    size?: ButtonSize;
    /** Loading state - shows spinner and disables button */
    loading?: boolean;
    /** Icon to display before children */
    leftIcon?: ReactNode;
    /** Icon to display after children */
    rightIcon?: ReactNode;
    /** Full width button */
    fullWidth?: boolean;
}

/**
 * Button size types
 */
declare type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button variant types
 */
declare type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

/**
 * ChatHeader component
 *
 * Features:
 * - Displays current session title with dropdown indicator
 * - Button to view past conversations
 * - Button to create new session
 *
 * @example
 * ```tsx
 * <ChatHeader
 *   currentSessionTitle="My Chat"
 *   onLoadSessions={() => console.log('Load sessions')}
 *   onNewSession={() => console.log('New session')}
 * />
 * ```
 */
export declare const ChatHeader: FC<ChatHeaderProps>;

/**
 * Props for ChatHeader component
 */
export declare interface ChatHeaderProps {
    /** Current session title to display */
    currentSessionTitle: string;
    /** Callback when user clicks to load session list */
    onLoadSessions: () => void;
    /** Callback when user clicks to create new session */
    onNewSession: () => void;
}

/**
 * Basic chat message structure
 */
export declare interface ChatMessage {
    role: MessageRole;
    content: string;
    timestamp: number;
}

/**
 * Single chat message from JSONL format
 * Supports both Qwen format and Claude format
 */
export declare interface ChatMessageData {
    uuid: string;
    parentUuid?: string | null;
    sessionId?: string;
    timestamp: string;
    type: 'user' | 'assistant' | 'system' | 'tool_call';
    message?: {
        role?: string;
        parts?: MessagePart[];
        content?: string | ClaudeContentItem[];
    };
    model?: string;
    toolCall?: ChatViewerToolCallData;
    systemPayload?: unknown;
    cwd?: string;
    gitBranch?: string;
}

/**
 * ChatViewer - A standalone component for displaying chat conversations
 *
 * Renders a conversation flow from JSONL-formatted data using existing
 * message components (UserMessage, AssistantMessage, ThinkingMessage).
 * This is a pure UI component without VSCode or external dependencies.
 *
 * @example
 * ```tsx
 * const messages = [
 *   { uuid: '1', type: 'user', message: { role: 'user', parts: [{ text: 'Hello!' }] }, ... },
 *   { uuid: '2', type: 'assistant', message: { role: 'model', parts: [{ text: 'Hi there!' }] }, ... },
 * ];
 *
 * <ChatViewer messages={messages} onFileClick={(path) => console.log(path)} />
 * ```
 *
 * @example With ref for programmatic control
 * ```tsx
 * const chatRef = useRef<ChatViewerHandle>(null);
 *
 * // Scroll to bottom programmatically
 * chatRef.current?.scrollToBottom('smooth');
 *
 * <ChatViewer ref={chatRef} messages={messages} />
 * ```
 */
declare const ChatViewer: ForwardRefExoticComponent<ChatViewerProps & RefAttributes<ChatViewerHandle>>;
export { ChatViewer }
export { ChatViewer as ChatViewerDefault }

/**
 * ChatViewer ref handle for programmatic control
 */
export declare interface ChatViewerHandle {
    /** Scroll to the bottom of the messages */
    scrollToBottom: (behavior?: ScrollBehavior) => void;
    /** Scroll to the top of the messages */
    scrollToTop: (behavior?: ScrollBehavior) => void;
    /** Get the scroll container element */
    getScrollContainer: () => HTMLDivElement | null;
}

/**
 * ChatViewer component props
 */
export declare interface ChatViewerProps {
    /** Array of chat messages in JSONL format */
    messages: ChatMessageData[];
    /** Optional additional CSS class name */
    className?: string;
    /** Optional callback when a file path is clicked */
    onFileClick?: (path: string) => void;
    /** Optional empty state message */
    emptyMessage?: string;
    /** Whether to auto-scroll to bottom when new messages arrive (default: true) */
    autoScroll?: boolean;
    /** Theme variant: 'dark' | 'light' | 'auto' (default: 'auto') */
    theme?: 'dark' | 'light' | 'auto';
    /** Show empty state icon (default: true) */
    showEmptyIcon?: boolean;
    /**
     * Show a global "Expand all / Collapse all" control above the messages
     * (default: false). When enabled, the control broadcasts expand/collapse
     * signals to every collapsible section (thinking blocks, tool outputs,
     * file references) via {@link ExpandControlContext}; individual toggles
     * keep working between global commands.
     */
    showExpandControl?: boolean;
}

/**
 * Tool call data for rendering tool call UI
 */
export declare type ChatViewerToolCallData = ToolCallData;

/**
 * Display-only checkbox styled via Tailwind classes.
 * - Renders a custom-looking checkbox using appearance-none and pseudo-elements.
 * - Supports indeterminate (middle) state using a data- attribute.
 * - Intended for read-only display (disabled by default).
 */
export declare const CheckboxDisplay: FC<CheckboxDisplayProps>;

export declare interface CheckboxDisplayProps {
    checked?: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    title?: string;
}

/**
 * Chevron down icon (20x20)
 * Used for dropdown arrows
 */
export declare const ChevronDownIcon: FC<IconProps_2>;

/**
 * Claude format content item
 */
export declare interface ClaudeContentItem {
    type: 'text' | 'tool_use' | 'tool_result';
    text?: string;
    name?: string;
    input?: unknown;
}

export declare const CloseIcon: FC<CloseIconProps>;

declare interface CloseIconProps {
    size?: number;
    color?: string;
    className?: string;
}

export declare const CloseSmallIcon: FC<IconProps_2>;

/**
 * Close X icon (14x14)
 * Used for close buttons in banners and dialogs
 */
export declare const CloseXIcon: FC<IconProps_2>;

/**
 * CodeBlock - Code block for displaying formatted code or output
 */
export declare const CodeBlock: FC<CodeBlockProps>;

/**
 * Props for CodeBlock
 */
declare interface CodeBlockProps {
    children: string;
}

/**
 * Code brackets icon (20x20)
 * Used for active file indicator
 */
export declare const CodeBracketsIcon: FC<IconProps_2>;

/**
 * CollapsibleFileContent - Renders content with collapsible file references
 *
 * Detects file reference patterns in user messages and renders them as
 * collapsible blocks to improve readability.
 */
export declare const CollapsibleFileContent: FC<CollapsibleFileContentProps>;

/**
 * Props for CollapsibleFileContent
 */
export declare interface CollapsibleFileContentProps {
    content: string;
    onFileClick?: (path: string) => void;
    enableFileLinks?: boolean;
}

/**
 * Completion item for autocomplete menus
 */
export declare interface CompletionItem {
    /** Unique identifier */
    id: string;
    /** Display label */
    label: string;
    /** Optional description shown below label */
    description?: string;
    /** Optional icon to display */
    icon?: ReactNode;
    /** Type of completion item */
    type: CompletionItemType;
    /** Value inserted into the input when selected (e.g., filename or command) */
    value?: string;
    /** Optional full path for files (used to build @filename -> full path mapping) */
    path?: string;
    /** Optional group name for grouping items in the completion menu */
    group?: string;
}

/**
 * Completion item type categories
 */
export declare type CompletionItemType = 'file' | 'folder' | 'symbol' | 'command' | 'variable' | 'info';

/**
 * CompletionMenu component
 *
 * Features:
 * - Keyboard navigation (Arrow Up/Down, Enter, Escape)
 * - Mouse hover selection
 * - Click outside to close
 * - Auto-scroll to selected item
 * - Smooth enter animation
 * - Item grouping support
 *
 * @example
 * ```tsx
 * <CompletionMenu
 *   items={[
 *     { id: '1', label: 'file.ts', type: 'file' },
 *     { id: '2', label: 'folder', type: 'folder', group: 'Folders' }
 *   ]}
 *   onSelect={(item) => console.log('Selected:', item)}
 *   onClose={() => console.log('Closed')}
 * />
 * ```
 */
export declare const CompletionMenu: FC<CompletionMenuProps>;

/**
 * Props for CompletionMenu component
 */
export declare interface CompletionMenuProps {
    /** List of completion items to display */
    items: CompletionItem[];
    /** Callback when an item is selected (Enter / click) */
    onSelect: (item: CompletionItem) => void;
    /** Optional callback for Tab selection (fill without executing). Falls back to onSelect. */
    onFill?: (item: CompletionItem) => void;
    /** Callback when menu should close */
    onClose: () => void;
    /** Optional section title */
    title?: string;
    /** Initial selected index */
    selectedIndex?: number;
}

export declare const Container: FC<ContainerProps>;

declare interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Container status type for styling
 */
export declare type ContainerStatus = 'success' | 'error' | 'warning' | 'loading' | 'default';

/**
 * Parsed segment of user message content
 */
export declare interface ContentSegment {
    type: 'text' | 'file_reference';
    content: string;
    /** File path for file_reference type */
    filePath?: string;
    /** File name extracted from path */
    fileName?: string;
}

/**
 * ContextIndicator component
 *
 * Features:
 * - Circular progress indicator showing context usage
 * - Tooltip with detailed usage information
 * - Accessible with proper ARIA labels
 *
 * @example
 * ```tsx
 * <ContextIndicator
 *   contextUsage={{
 *     percentLeft: 75,
 *     usedTokens: 25000,
 *     tokenLimit: 100000
 *   }}
 * />
 * ```
 */
export declare const ContextIndicator: FC<ContextIndicatorProps>;

/**
 * Props for ContextIndicator component
 */
export declare interface ContextIndicatorProps {
    /** Context usage data, null to hide indicator */
    contextUsage: ContextUsage | null;
}

/**
 * Context usage information
 */
export declare interface ContextUsage {
    /** Percentage of context remaining (0-100) */
    percentLeft: number;
    /** Number of tokens used */
    usedTokens: number;
    /** Maximum token limit */
    tokenLimit: number;
}

/**
 * CopyButton - Shared copy button component with Tailwind styles
 * Uses PlatformContext for platform-specific clipboard access with fallback
 * Note: Parent element should have 'group' class for hover effect
 */
export declare const CopyButton: FC<CopyButtonProps>;

/**
 * Copy button component props
 */
declare interface CopyButtonProps {
    text: string;
}

/**
 * Built-in icon types for edit modes
 */
export declare type EditModeIconType = 'edit' | 'auto' | 'plan' | 'yolo';

/**
 * Edit mode display information
 */
export declare interface EditModeInfo {
    /** Display label */
    label: string;
    /** Tooltip text */
    title: string;
    /** Icon to display */
    icon: ReactNode;
}

/**
 * Edit pencil icon (16x16)
 * Used for "Ask before edits" mode
 */
export declare const EditPencilIcon: FC<IconProps_2>;

/**
 * Specialized component for Edit tool calls
 * Optimized for displaying file editing operations with diffs
 */
export declare const EditToolCall: React.FC<BaseToolCallProps>;

/**
 * EmptyState component
 *
 * Features:
 * - Displays app logo (from platform resources or custom URL)
 * - Shows contextual welcome message based on auth state
 * - Loading state support
 * - Graceful fallback if logo fails to load
 *
 * @example
 * ```tsx
 * <EmptyState
 *   isAuthenticated={true}
 *   appName="Qwen Code"
 * />
 * ```
 */
export declare const EmptyState: FC<EmptyStateProps>;

/**
 * Props for EmptyState component
 */
export declare interface EmptyStateProps {
    /** Whether user is authenticated */
    isAuthenticated?: boolean;
    /** Optional loading message to display */
    loadingMessage?: string;
    /** Optional custom logo URL (overrides platform resource) */
    logoUrl?: string;
    /** App name for welcome message */
    appName?: string;
}

/**
 * Context used to broadcast global expand/collapse commands.
 * Null when no ancestor provides the control — collapsible components
 * then behave exactly as before (purely local state).
 */
export declare const ExpandControlContext: Context<ExpandControlContextValue | null>;

/**
 * Value published by a container (e.g. ChatViewer) that wants to issue
 * global "expand all" / "collapse all" commands to the collapsible
 * sections it renders.
 */
export declare interface ExpandControlContextValue {
    /**
     * Monotonic counter bumped every time a global expand/collapse command
     * is issued. Components sync to `expanded` only when this changes, so
     * unrelated re-renders never disturb their local toggle state.
     */
    signal: number;
    /** Target expanded state carried by the latest signal. */
    expanded: boolean;
}

/**
 * Extract output from command execution result text
 * Handles both JSON format and structured text format
 *
 * Example structured text:
 * ```
 * Command: lsof -i :5173
 * Directory: (root)
 * Output: COMMAND   PID    USER...
 * Error: (none)
 * Exit Code: 0
 * ```
 */
export declare const extractCommandOutput: (text: string) => string;

/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
export declare interface FileContext {
    fileName: string;
    filePath: string;
    startLine?: number;
    endLine?: number;
}

/**
 * File document icon (16x16)
 * Used for file completion menu
 */
export declare const FileIcon: FC<IconProps_2>;

/**
 * FileLink component - Clickable file link
 *
 * Features:
 * - Click to open file using platform-specific handler
 * - Support line and column number navigation
 * - Hover to show full path
 * - Optional display mode (full path vs filename only)
 * - Full keyboard accessibility (Enter and Space keys)
 *
 * @example
 * ```tsx
 * <FileLink path="/src/App.tsx" line={42} />
 * <FileLink path="/src/components/Button.tsx" line={10} column={5} showFullPath={true} />
 * ```
 */
export declare const FileLink: FC<FileLinkProps>;

/**
 * Props for FileLink component
 */
export declare interface FileLinkProps {
    /** File path */
    path: string;
    /** Optional line number (starting from 1) */
    line?: number | null;
    /** Optional column number (starting from 1) */
    column?: number | null;
    /** Whether to show full path, default false (show filename only) */
    showFullPath?: boolean;
    /** Optional custom class name */
    className?: string;
    /** Whether to disable click behavior (use when parent element handles clicks) */
    disableClick?: boolean;
}

export declare const FileListIcon: FC<IconProps_2>;

/**
 * Filter out empty messages (except tool calls)
 */
export declare function filterEmptyMessages(messages: UnifiedMessage[]): UnifiedMessage[];

/**
 * Folder icon (16x16)
 * Useful for directory entries in completion lists
 */
export declare const FolderIcon: FC<IconProps_2>;

/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
export declare interface FollowupState {
    /** Current suggestion text */
    suggestion: string | null;
    /** Whether to show suggestion */
    isVisible: boolean;
    /** Timestamp when suggestion was shown (for telemetry) */
    shownAt: number;
}

export declare const Footer: FC;

/**
 * Format any value to a string for display
 */
export declare const formatValue: (value: unknown) => string;

/**
 * Generic tool call component that can display any tool call type
 * Used as fallback for unknown tool call kinds
 * Minimal display: show description and outcome
 */
export declare const GenericToolCall: FC<BaseToolCallProps>;

/**
 * Get icon component for edit mode type
 */
export declare const getEditModeIcon: (iconType: EditModeIconType) => ReactNode;

/**
 * Format timestamp as relative time string
 *
 * @param timestamp - ISO timestamp string
 * @returns Formatted relative time (e.g., "now", "5m", "2h", "Yesterday", "3d", or date)
 *
 * @example
 * ```ts
 * getTimeAgo(new Date().toISOString()) // "now"
 * getTimeAgo(thirtyMinutesAgo.toISOString()) // "30m"
 * getTimeAgo(twoHoursAgo.toISOString()) // "2h"
 * ```
 */
export declare const getTimeAgo: (timestamp: string) => string;

/**
 * Returns the appropriate tool-call component for the given tool call data.
 *
 * Checks for structured agent execution output first, then falls back to
 * kind-based routing.
 */
export declare function getToolCallComponent(toolCall: ToolCallData): FC<BaseToolCallProps>;

/**
 * Group tool call content by type to avoid duplicate labels
 * Error detection logic:
 * - If contentObj.error is set (not null/undefined), treat as error
 * - If contentObj.type === 'error' AND has content (text or error), treat as error
 * This avoids false positives from empty error markers while not missing real errors
 */
export declare const groupContent: (content?: ToolCallContent[]) => GroupedContent;

/**
 * Grouped content structure for rendering
 */
export declare interface GroupedContent {
    textOutputs: string[];
    errors: string[];
    diffs: ToolCallContent[];
    otherData: unknown[];
}

/**
 * Group sessions by date
 *
 * Categories:
 * - Today: Sessions from today
 * - Yesterday: Sessions from yesterday
 * - This Week: Sessions from the last 7 days (excluding today/yesterday)
 * - Older: Sessions older than a week
 *
 * @param sessions - Array of session objects (must have lastUpdated or startTime)
 * @returns Array of grouped sessions, only includes non-empty groups
 *
 * @example
 * ```ts
 * const grouped = groupSessionsByDate(sessions);
 * // [{ label: 'Today', sessions: [...] }, { label: 'Older', sessions: [...] }]
 * ```
 */
export declare const groupSessionsByDate: (sessions: Array<Record<string, unknown>>) => SessionGroup[];

/**
 * Handle copy to clipboard using platform-specific API with fallback
 * @param text Text to copy
 * @param event Mouse event to stop propagation
 * @param platformCopy Optional platform-specific copy function
 */
export declare const handleCopyToClipboard: (text: string, event: React.MouseEvent, platformCopy?: (text: string) => Promise<void>) => Promise<void>;

/**
 * Check if a tool call has actual output to display
 * Returns false for tool calls that completed successfully but have no visible output
 */
export declare const hasToolCallOutput: (toolCall: ToolCallData) => boolean;

export declare const Header: FC;

/**
 * Hide context (eye slash) icon (20x20)
 * Used to indicate the active selection will NOT be auto-loaded into context
 */
export declare const HideContextIcon: FC<IconProps_2>;

export declare const Icon: FC<IconProps>;

declare interface IconProps {
    name: string;
    size?: number;
    color?: string;
    className?: string;
}

declare interface IconProps_2 extends SVGProps<SVGSVGElement> {
    /**
     * Icon size (width and height)
     * @default 16
     */
    size?: number;
    /**
     * Additional CSS classes
     */
    className?: string;
}

export declare interface ImageMessageLike {
    kind: 'image';
    imagePath: string;
    imageSrc?: string;
    imageMissing?: boolean;
}

export declare const ImageMessageRenderer: FC<ImageMessageRendererProps>;

export declare interface ImageMessageRendererProps {
    msg: ImageMessageLike;
    imageIndex: number;
}

export declare const ImagePreview: FC<ImagePreviewProps>;

export declare interface ImagePreviewItem {
    id: string;
    name: string;
    data: string;
}

export declare interface ImagePreviewProps {
    images: ImagePreviewItem[];
    onRemove: (id: string) => void;
}

/**
 * Input component with multiple sizes and states
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   placeholder="Enter your email"
 *   error={!!errors.email}
 *   errorMessage={errors.email}
 * />
 * ```
 */
export declare const Input: ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>;

/**
 * InputForm component
 *
 * Features:
 * - ContentEditable input with placeholder
 * - Edit mode toggle with customizable icons
 * - Active file/selection indicator
 * - Context usage display
 * - Command and attach buttons
 * - Send/Stop button based on state
 * - Completion menu integration
 *
 * @example
 * ```tsx
 * <InputForm
 *   inputText={text}
 *   inputFieldRef={inputRef}
 *   isStreaming={false}
 *   isWaitingForResponse={false}
 *   isComposing={false}
 *   editModeInfo={{ label: 'Auto', title: 'Auto mode', icon: <AutoEditIcon /> }}
 *   // ... other props
 * />
 * ```
 */
export declare const InputForm: FC<InputFormProps>;

/**
 * Props for InputForm component
 */
export declare interface InputFormProps {
    /** Current input text */
    inputText: string;
    /** Ref for the input field */
    inputFieldRef: React.RefObject<HTMLDivElement | null>;
    /** Whether AI is currently generating */
    isStreaming: boolean;
    /** Whether waiting for response */
    isWaitingForResponse: boolean;
    /** Whether IME composition is in progress */
    isComposing: boolean;
    /** Edit mode display information */
    editModeInfo: EditModeInfo;
    /** Whether thinking mode is enabled */
    thinkingEnabled: boolean;
    /** Active file name (from editor) */
    activeFileName: string | null;
    /** Active selection range */
    activeSelection: {
        startLine: number;
        endLine: number;
    } | null;
    /** Whether to skip auto-loading active context */
    skipAutoActiveContext: boolean;
    /** Context usage information */
    contextUsage: ContextUsage | null;
    /** Input change callback */
    onInputChange: (text: string) => void;
    /** Composition start callback */
    onCompositionStart: () => void;
    /** Composition end callback */
    onCompositionEnd: () => void;
    /** Key down callback */
    onKeyDown: (e: React.KeyboardEvent) => void;
    /** Submit callback. When explicitText is provided, submit that value instead of reading from input state. */
    onSubmit(e: React.FormEvent | React.KeyboardEvent, explicitText?: string): void;
    /** Cancel callback */
    onCancel: () => void;
    /** Toggle edit mode callback */
    onToggleEditMode: () => void;
    /** Toggle thinking callback */
    onToggleThinking: () => void;
    /** Focus active editor callback */
    onFocusActiveEditor?: () => void;
    /** Toggle skip auto context callback */
    onToggleSkipAutoActiveContext: () => void;
    /** Show command menu callback */
    onShowCommandMenu: () => void;
    /** Attach context callback */
    onAttachContext: () => void;
    /** Whether completion menu is open */
    completionIsOpen: boolean;
    /** Completion items */
    completionItems?: CompletionItem[];
    /** Completion select callback (Enter / click) */
    onCompletionSelect?: (item: CompletionItem) => void;
    /** Completion fill callback (Tab — fill without executing). Falls back to onCompletionSelect. */
    onCompletionFill?: (item: CompletionItem) => void;
    /** Completion close callback */
    onCompletionClose?: () => void;
    /** Optional paste handler for the contentEditable input */
    onPaste?: (e: React.ClipboardEvent) => void;
    /** Optional content rendered between the input and actions */
    extraContent?: ReactNode;
    /** Placeholder text */
    placeholder?: string;
    /** Whether the current draft is eligible to submit */
    canSubmit?: boolean;
    /** Prompt suggestion state */
    followupState?: FollowupState;
    /** Callback to accept prompt suggestion */
    onAcceptFollowup?: (method?: 'tab' | 'enter' | 'right', options?: {
        skipOnAccept?: boolean;
    }) => void;
    /** Callback to dismiss prompt suggestion */
    onDismissFollowup?: () => void;
}

/**
 * Input component props interface
 */
declare interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /** Input size */
    size?: InputSize;
    /** Error state */
    error?: boolean;
    /** Error message to display */
    errorMessage?: string;
    /** Label for the input */
    label?: string;
    /** Helper text below input */
    helperText?: string;
    /** Left icon/element */
    leftElement?: ReactNode;
    /** Right icon/element */
    rightElement?: ReactNode;
    /** Full width input */
    fullWidth?: boolean;
}

/**
 * Input size types
 */
declare type InputSize = 'sm' | 'md' | 'lg';

export declare const InsightProgressCard: FC<InsightProgressCardProps>;

export declare interface InsightProgressCardProps {
    stage: string;
    progress: number;
    detail?: string;
}

export declare const InterruptedMessage: FC<InterruptedMessageProps>;

declare interface InterruptedMessageProps {
    text?: string;
}

export declare const isAgentExecutionRawOutput: (value: unknown) => value is AgentExecutionRawOutput;

export declare const isAgentExecutionToolCall: (toolCall: ToolCallData) => toolCall is ToolCallData & {
    rawOutput: AgentExecutionRawOutput;
};

/**
 * Type guard to check if data is a message
 */
export declare function isMessageData(data: unknown): data is ACPMessageData;

/**
 * Type guard to check if data is a tool call
 */
export declare function isToolCallData(data: unknown): data is ToolCallData;

/**
 * JSONL chat message format (ChatViewer input)
 */
export declare interface JSONLMessage {
    uuid: string;
    parentUuid?: string | null;
    sessionId?: string;
    timestamp: string;
    type: 'user' | 'assistant' | 'system' | 'tool_call';
    message?: {
        role?: string;
        parts?: Array<{
            text: string;
        }>;
        content?: string | unknown[];
    };
    systemPayload?: unknown;
    model?: string;
    toolCall?: ToolCallData;
}

/**
 * Link/attachment icon (20x20)
 * Used for attach context button
 */
export declare const LinkIcon: FC<IconProps_2>;

/**
 * LocationsList - List of file locations with clickable links
 */
export declare const LocationsList: FC<LocationsListProps>;

/**
 * Props for LocationsList
 */
declare interface LocationsListProps {
    locations: Array<{
        path: string;
        line?: number | null;
    }>;
}

export declare const Main: FC;

/**
 * Map a tool call status to a ToolCallContainer status (bullet color)
 * - pending/in_progress -> loading
 * - completed -> success
 * - cancelled -> warning
 * - failed -> error
 * - default fallback
 */
export declare const mapToolStatusToContainerStatus: (status: ToolCallStatus) => ContainerStatus;

/**
 * MarkdownRenderer component - renders markdown content with enhanced features
 */
export declare const MarkdownRenderer: FC<MarkdownRendererProps>;

export declare interface MarkdownRendererProps {
    content: string;
    onFileClick?: (filePath: string) => void;
    /** When false, do not convert file paths into clickable links. Default: true */
    enableFileLinks?: boolean;
}

export declare const Message: FC<MessageProps_2>;

export declare const MessageContent: NamedExoticComponent<MessageContentProps>;

/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
export declare interface MessageContentProps {
    content: string;
    onFileClick?: (filePath: string) => void;
    enableFileLinks?: boolean;
}

export declare const MessageInput: FC;

export declare const MessageList: FC;

/**
 * Message part containing text content (Qwen format)
 */
export declare interface MessagePart {
    text: string;
}

/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
export declare interface MessageProps {
    id: string;
    content: string;
    sender: 'user' | 'system' | 'assistant';
    timestamp?: Date;
    className?: string;
}

declare interface MessageProps_2 {
    id: string;
    content: string;
    sender: 'user' | 'system' | 'assistant';
    timestamp?: Date;
    className?: string;
}

/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Chat message role types
 */
export declare type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Onboarding - Welcome screen for new users
 * Pure presentational component
 */
export declare const Onboarding: FC<OnboardingProps>;

export declare interface OnboardingProps {
    /** URL of the application icon */
    iconUrl?: string;
    /** Callback when user clicks the get started button */
    onGetStarted: () => void;
    /** Application name (defaults to "Qwen Code") */
    appName?: string;
    /** Welcome message subtitle */
    subtitle?: string;
    /** Button text (defaults to "Get Started with Qwen Code") */
    buttonText?: string;
}

/**
 * Open diff icon (16x16)
 * Used for opening diff in VS Code
 */
export declare const OpenDiffIcon: FC<IconProps_2>;

/**
 * Parse content to identify file references and regular text
 * @param content - The raw content string
 * @returns Array of content segments
 */
export declare function parseContentWithFileReferences(content: string): ContentSegment[];

export declare const PermissionDrawer: FC<PermissionDrawerProps>;

export declare interface PermissionDrawerProps {
    isOpen: boolean;
    options: PermissionOption[];
    toolCall: PermissionToolCall;
    onResponse: (optionId: string) => void;
    onClose?: () => void;
}

export declare interface PermissionOption {
    name: string;
    kind: string;
    optionId: string;
}

export declare interface PermissionToolCall {
    title?: string;
    kind?: string;
    /**
     * Canonical tool name (from the ACP frame's `_meta.toolName`). Lets the
     * drawer give specific tools dedicated UI (e.g. the Agent tool) without
     * depending on a protocol `kind` ACP can't carry.
     */
    toolName?: string;
    toolCallId?: string;
    rawInput?: {
        command?: string;
        description?: string;
        [key: string]: unknown;
    };
    content?: Array<{
        type: string;
        [key: string]: unknown;
    }>;
    locations?: Array<{
        path: string;
        line?: number | null;
    }>;
    status?: string;
}

/**
 * Plan completed icon (14x14)
 * Used for completed plan items
 */
export declare const PlanCompletedIcon: FC<IconProps_2>;

/**
 * Plan entry for task tracking
 */
export declare interface PlanEntry {
    content: string;
    priority?: 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed';
}

/**
 * Plan entry status type
 */
export declare type PlanEntryStatus = 'pending' | 'in_progress' | 'completed';

/**
 * Plan in progress icon (14x14)
 * Used for in-progress plan items
 */
export declare const PlanInProgressIcon: FC<IconProps_2>;

/**
 * Plan mode/bars icon (16x16)
 * Used for "Plan mode"
 */
export declare const PlanModeIcon: FC<IconProps_2>;

/**
 * Plan pending icon (14x14)
 * Used for pending plan items
 */
export declare const PlanPendingIcon: FC<IconProps_2>;

/**
 * Platform context for accessing platform-specific capabilities
 */
export declare const PlatformContext: Context<PlatformContextValue>;

/**
 * Platform context interface for cross-platform component reuse.
 * Each platform adapter implements this interface.
 */
export declare interface PlatformContextValue {
    /** Current platform identifier */
    platform: PlatformType;
    /** Send message to platform host */
    postMessage: (message: unknown) => void;
    /** Subscribe to messages from platform host */
    onMessage: (handler: (message: unknown) => void) => () => void;
    /** Open a file in the platform's editor (optional) */
    openFile?: (path: string) => void;
    /** Open a diff view for a file (optional) */
    openDiff?: (path: string, oldText: string | null | undefined, newText: string | undefined) => void;
    /** Open a temporary file with given content (optional) */
    openTempFile?: (content: string, fileName?: string) => void;
    /** Trigger file attachment dialog (optional) */
    attachFile?: () => void;
    /** Trigger platform login flow (optional) */
    login?: () => void;
    /** Copy text to clipboard */
    copyToClipboard?: (text: string) => Promise<void>;
    /** Get resource URL for platform-specific assets (e.g., icons) */
    getResourceUrl?: (resourceName: string) => string | undefined;
    /** Platform-specific feature flags */
    features?: {
        canOpenFile?: boolean;
        canOpenDiff?: boolean;
        canOpenTempFile?: boolean;
        canAttachFile?: boolean;
        canLogin?: boolean;
        canCopy?: boolean;
    };
}

/**
 * Platform context provider component
 */
export declare function PlatformProvider({ children, value }: PlatformProviderProps): JSX.Element;

/**
 * Provider component props
 */
export declare interface PlatformProviderProps {
    children: ReactNode;
    value: PlatformContextValue;
}

/**
 * Platform types supported by the webui library
 */
export declare type PlatformType = 'vscode' | 'chrome' | 'web' | 'share';

/**
 * Plus icon (20x20)
 * Used for new session button
 */
export declare const PlusIcon: FC<IconProps_2>;

/**
 * Small plus icon (16x16)
 * Used for default attachment type
 */
export declare const PlusSmallIcon: FC<IconProps_2>;

export declare interface Question {
    question: string;
    header: string;
    options: QuestionOption[];
    multiSelect: boolean;
}

export declare interface QuestionOption {
    label: string;
    description: string;
}

/**
 * ReadToolCall - displays file reading operations
 * Shows: Read filename (no content preview)
 */
export declare const ReadToolCall: FC<BaseToolCallProps>;

/**
 * Refresh/reload icon (16x16)
 * Used for refresh session list
 */
export declare const RefreshIcon: FC<IconProps_2>;

/**
 * Safely convert title to string, handling object types
 * Returns empty string if no meaningful title
 * Uses try/catch to handle circular references safely
 */
export declare const safeTitle: (title: unknown) => string;

/**
 * Save document icon (16x16)
 * Used for save session button
 */
export declare const SaveDocumentIcon: FC<IconProps_2>;

/**
 * Search/magnifying glass icon (20x20)
 * Used for search input
 */
export declare const SearchIcon: FC<IconProps_2>;

/**
 * Specialized component for Search tool calls
 * Optimized for displaying search operations and results
 */
export declare const SearchToolCall: FC<BaseToolCallProps>;

export declare const SelectionIcon: FC<IconProps_2>;

export declare const SendIcon: FC<SendIconProps>;

declare interface SendIconProps {
    size?: number;
    color?: string;
    className?: string;
}

/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Session grouping utilities
 * Functions for organizing sessions by date and formatting time ago
 */
/**
 * Session group structure
 */
export declare interface SessionGroup {
    /** Group label (e.g., "Today", "Yesterday") */
    label: string;
    /** Sessions in this group */
    sessions: Array<Record<string, unknown>>;
}

/**
 * SessionSelector component
 *
 * Features:
 * - Sessions grouped by date (Today, Yesterday, This Week, Older)
 * - Search filtering
 * - Infinite scroll to load more sessions
 * - Click outside to close
 * - Active session highlighting
 *
 * @example
 * ```tsx
 * <SessionSelector
 *   visible={true}
 *   sessions={sessions}
 *   currentSessionId="abc123"
 *   searchQuery=""
 *   onSearchChange={(q) => setQuery(q)}
 *   onSelectSession={(id) => loadSession(id)}
 *   onClose={() => setVisible(false)}
 * />
 * ```
 */
export declare const SessionSelector: FC<SessionSelectorProps>;

/**
 * Props for SessionSelector component
 */
export declare interface SessionSelectorProps {
    /** Whether the selector is visible */
    visible: boolean;
    /** List of session objects */
    sessions: Array<Record<string, unknown>>;
    /** Currently selected session ID */
    currentSessionId: string | null;
    /** Current search query */
    searchQuery: string;
    /** Callback when search query changes */
    onSearchChange: (query: string) => void;
    /** Callback when a session is selected */
    onSelectSession: (sessionId: string) => void;
    /** Callback when a session is renamed */
    onRenameSession?: (sessionId: string, newTitle: string) => void;
    /** Callback when a session is deleted */
    onDeleteSession?: (sessionId: string) => void;
    /** Callback when selector should close */
    onClose: () => void;
    /** Whether there are more sessions to load */
    hasMore?: boolean;
    /** Whether loading is in progress */
    isLoading?: boolean;
    /** Callback to load more sessions */
    onLoadMore?: () => void;
}

/**
 * ShellToolCall - displays bash/execute command tool calls
 * Shows command input and output with IN/OUT cards
 */
export declare const ShellToolCall: FC<BaseToolCallProps>;

/**
 * Check if a tool call should be displayed
 * Hides internal tool calls
 */
export declare const shouldShowToolCall: (kind: string) => boolean;

export declare const Sidebar: FC;

/**
 * Slash command icon (20x20)
 * Used for command menu button
 */
export declare const SlashCommandIcon: FC<IconProps_2>;

/**
 * StatusIndicator - Status indicator with colored dot
 */
export declare const StatusIndicator: FC<StatusIndicatorProps>;

/**
 * Props for StatusIndicator
 */
declare interface StatusIndicatorProps {
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    text: string;
}

/**
 * Stop/square icon (16x16)
 * Used for stop/cancel operations
 */
export declare const StopIcon: FC<IconProps_2>;

/**
 * Strip {@link ZERO_WIDTH_SPACE} placeholders from text.
 *
 * @param text - raw text that may contain zero-width spaces
 * @returns text with all zero-width spaces removed
 */
export declare function stripZeroWidthSpaces(text: string): string;

export declare const SymbolIcon: FC<IconProps_2>;

export declare const TerminalIcon: FC<IconProps_2>;

/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
export declare type Theme = 'light' | 'dark' | 'auto';

export declare const ThinkingIcon: FC<ThinkingIconProps>;

declare interface ThinkingIconProps extends IconProps_2 {
    /**
     * Whether thinking is enabled (affects styling)
     */
    enabled?: boolean;
}

export declare const ThinkingMessage: NamedExoticComponent<ThinkingMessageProps>;

/**
 * ThinkingMessage component props interface
 */
export declare interface ThinkingMessageProps {
    /** Thinking content */
    content: string;
    /** Message timestamp */
    timestamp: number;
    /** File click callback */
    onFileClick?: (path: string) => void;
    /** Whether to expand by default, defaults to false */
    defaultExpanded?: boolean;
    /** Status: 'loading' means thinking in progress, 'default' means thinking complete */
    status?: 'loading' | 'default';
}

/**
 * Specialized component for Think tool calls
 * Optimized for displaying AI reasoning and thought processes
 * Minimal display: just show the thoughts (no context)
 */
export declare const ThinkToolCall: FC<BaseToolCallProps>;

/**
 * ToolCallCard - Legacy card wrapper for complex layouts like diffs
 */
export declare const ToolCallCard: FC<ToolCallCardProps>;

/**
 * Props for ToolCallCard
 */
declare interface ToolCallCardProps {
    icon: string;
    children: React.ReactNode;
}

/**
 * ToolCallContainer - Main container for tool call displays
 * Features timeline connector line and status bullet
 */
export declare const ToolCallContainer: FC<ToolCallContainerProps>;

/**
 * Props for ToolCallContainer
 */
export declare interface ToolCallContainerProps {
    /** Operation label (e.g., "Read", "Write", "Search") */
    label: string;
    /** Status for bullet color: 'success' | 'error' | 'warning' | 'loading' | 'default' */
    status?: 'success' | 'error' | 'warning' | 'loading' | 'default';
    /** Main content to display (optional - some tool calls only show title) */
    children?: React.ReactNode;
    /** Tool call ID for debugging */
    toolCallId?: string;
    /** Optional trailing content rendered next to label (e.g., clickable filename) */
    labelSuffix?: React.ReactNode;
    /** Optional custom class name */
    className?: string;
    /** Whether this is the first item in an AI response sequence (for timeline) */
    isFirst?: boolean;
    /** Whether this is the last item in an AI response sequence (for timeline) */
    isLast?: boolean;
}

/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared types for tool call components
 */
/**
 * Tool call content types
 */
export declare interface ToolCallContent {
    type: 'content' | 'diff';
    content?: {
        type: string;
        text?: string;
        error?: unknown;
        [key: string]: unknown;
    };
    path?: string;
    oldText?: string | null;
    newText?: string;
}

/**
 * Tool call content item
 */
export declare interface ToolCallContentItem {
    type: 'content' | 'diff';
    content?: {
        type: string;
        text?: string;
        [key: string]: unknown;
    };
    path?: string;
    oldText?: string | null;
    newText?: string;
    [key: string]: unknown;
}

/**
 * Base tool call data interface
 */
export declare interface ToolCallData {
    toolCallId: string;
    kind: string;
    title: string | object;
    status: ToolCallStatus;
    rawInput?: string | object;
    rawOutput?: unknown;
    content?: ToolCallContent[];
    locations?: ToolCallLocation[];
    timestamp?: number;
    /**
     * Optional markdown summary projection of the tool's preview (file
     * diff, MCP invocation, tabular, etc.) — populated by
     * `daemonTranscriptToUnifiedMessages` when
     * `enrichToolDetailsWithPreview: true`. Renderers can show it
     * alongside `rawOutput` (which is now preserved verbatim, addressing
     * a code review).
     */
    previewMarkdown?: string;
}

/**
 * Tool call location type
 */
export declare interface ToolCallLocation {
    path: string;
    line?: number | null;
}

/**
 * Tool call location reference
 */
declare interface ToolCallLocation_2 {
    path: string;
    line?: number | null;
}

/**
 * ToolCallRow - A single row in the tool call grid (legacy - for complex layouts)
 */
export declare const ToolCallRow: FC<ToolCallRowProps>;

/**
 * Props for ToolCallRow
 */
declare interface ToolCallRowProps {
    label: string;
    children: React.ReactNode;
}

/**
 * Tool call status type
 */
export declare type ToolCallStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Tool call status
 */
declare type ToolCallStatus_2 = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';

/**
 * Tool call update data
 */
export declare interface ToolCallUpdate {
    toolCallId: string;
    kind?: string;
    title?: string;
    status?: ToolCallStatus_2;
    rawInput?: unknown;
    content?: ToolCallContentItem[];
    locations?: ToolCallLocation_2[];
    timestamp?: number;
}

/**
 * Tooltip component using CSS group-hover for display
 * Supports CSS variables for theming
 */
export declare const Tooltip: FC<TooltipProps>;

/**
 * Tooltip component props
 */
export declare interface TooltipProps {
    /** Content to wrap with tooltip */
    children: React.ReactNode;
    /** Tooltip content (can be string or ReactNode) */
    content: React.ReactNode;
    /** Tooltip position relative to children */
    position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Undo edit icon (16x16)
 * Used for undoing edits in diff views
 */
export declare const UndoIcon: FC<IconProps_2>;

/**
 * Unified message format - normalized from ACP or JSONL sources
 */
export declare interface UnifiedMessage {
    /** Unique identifier */
    id: string;
    /** Message type */
    type: UnifiedMessageType;
    /** Timestamp in milliseconds */
    timestamp: number;
    /** Text content (for user/assistant/thinking messages) */
    content?: string;
    /** Tool call data (for tool_call type) */
    toolCall?: ToolCallData;
    /** Whether this is the first item in an AI response sequence */
    isFirst: boolean;
    /** Whether this is the last item in an AI response sequence */
    isLast: boolean;
    /** File context for user messages */
    fileContext?: FileContext[];
}

/**
 * Unified message type used by all webui components
 */
export declare type UnifiedMessageType = 'user' | 'assistant' | 'tool_call' | 'thinking';

/**
 * Specialized component for UpdatedPlan tool calls
 * Optimized for displaying plan update operations
 */
export declare const UpdatedPlanToolCall: FC<BaseToolCallProps>;

/**
 * Local expanded state for a collapsible UI element that also obeys
 * global expand/collapse signals from the nearest
 * {@link ExpandControlContext}.
 *
 * - Without a provider: identical to `useState(defaultExpanded)`.
 * - With a provider: when a new global signal fires the local state is
 *   synced to the signal's target; individual toggles keep working and
 *   are not overridden until the next global signal.
 * - Mounting after a global signal inherits the latest target instead of
 *   falling back to the component default.
 */
export declare function useControlledExpanded(defaultExpanded?: boolean): [boolean, Dispatch<SetStateAction<boolean>>];

/**
 * Read the nearest global expand control, if any.
 */
export declare function useExpandControl(): ExpandControlContextValue | null;

export declare function useFollowupSuggestions(options?: UseFollowupSuggestionsOptions): UseFollowupSuggestionsReturn;

export declare interface UseFollowupSuggestionsOptions {
    enabled?: boolean;
    onAccept?: (suggestion: string) => void;
    onOutcome?: (params: {
        outcome: 'accepted' | 'ignored';
        accept_method?: 'tab' | 'enter' | 'right';
        time_ms: number;
        suggestion_length: number;
    }) => void;
}

export declare interface UseFollowupSuggestionsReturn {
    state: FollowupState;
    getPlaceholder: (defaultPlaceholder: string) => string;
    setSuggestion: (text: string | null) => void;
    /** Accept the current suggestion */
    accept: (method?: 'tab' | 'enter' | 'right', options?: {
        skipOnAccept?: boolean;
    }) => void;
    /** Dismiss the current suggestion */
    dismiss: () => void;
    clear: () => void;
}

/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
export declare const useLocalStorage: <T>(key: string, initialValue: T) => readonly [T, (value: T | ((val: T) => T)) => void];

/**
 * Hook to access platform context
 */
export declare function usePlatform(): PlatformContextValue;

/**
 * User profile icon (16x16)
 * Used for login command
 */
export declare const UserIcon: FC<IconProps_2>;

export declare const UserMessage: NamedExoticComponent<UserMessageProps>;

export declare interface UserMessageProps {
    content: string;
    timestamp: number;
    onFileClick?: (path: string) => void;
    fileContext?: FileContext;
    onEdit?: () => void;
    editDisabled?: boolean;
}

/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
export declare const useTheme: () => {
    theme: "auto" | "dark" | "light";
    toggleTheme: () => void;
};

export declare const WaitingMessage: FC<WaitingMessageProps>;

declare interface WaitingMessageProps {
    loadingMessage: string;
}

/**
 * Warning triangle icon (20x20)
 * Used for warning messages
 */
export declare const WarningTriangleIcon: FC<IconProps_2>;

/**
 * WebFetchToolCall - displays web fetch/search tool calls
 * Shows URL/query and output with OUT card
 * @param props - Component props
 * @returns JSX element
 */
export declare const WebFetchToolCall: FC<BaseToolCallProps>;

/**
 * A container component that provides style isolation for VSCode webviews
 * This component wraps content in a namespace to prevent style conflicts
 */
export declare const WebviewContainer: default_2.FC<WebviewContainerProps>;

declare interface WebviewContainerProps extends PropsWithChildren {
    className?: string;
}

/**
 * Specialized component for Write tool calls
 * Shows: Write filename + error message + content preview
 */
export declare const WriteToolCall: FC<BaseToolCallProps>;

/**
 * Zero-width space used as a height placeholder in contentEditable inputs.
 *
 * After clearing a contentEditable element (e.g. on message submit), setting
 * its textContent to this character keeps the element at its normal line height
 * instead of collapsing to zero height. All downstream consumers must strip
 * this character before treating the text as real user input.
 */
export declare const ZERO_WIDTH_SPACE = "\u200B";

export { }
