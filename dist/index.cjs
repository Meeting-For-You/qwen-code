"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const react = require("react");
const toolNames = require("./toolNames-C9pS8yq9.cjs");
const defaultContext = {
  platform: "web",
  postMessage: () => {
  },
  onMessage: () => () => {
  }
};
const PlatformContext = react.createContext(defaultContext);
function usePlatform() {
  return react.useContext(PlatformContext);
}
function PlatformProvider({ children, value }) {
  return /* @__PURE__ */ jsxRuntime.jsx(PlatformContext.Provider, { value, children });
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const ExpandControlContext = react.createContext(null);
function useExpandControl() {
  return react.useContext(ExpandControlContext);
}
function useControlledExpanded(defaultExpanded = false) {
  const control = react.useContext(ExpandControlContext);
  const signal = (control == null ? void 0 : control.signal) ?? 0;
  const [isExpanded, setIsExpanded] = react.useState(
    () => control && signal > 0 ? control.expanded : defaultExpanded
  );
  const [lastSignal, setLastSignal] = react.useState(signal);
  if (signal !== lastSignal) {
    setLastSignal(signal);
    if (control && signal > 0) {
      setIsExpanded(control.expanded);
    }
  }
  return [isExpanded, setIsExpanded];
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const Container = ({ children, className = "" }) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: `container mx-auto px-4 ${className}`, children });
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const Header = () => /* @__PURE__ */ jsxRuntime.jsx("header", { children: "Header Component Placeholder" });
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const Sidebar = () => /* @__PURE__ */ jsxRuntime.jsx("aside", { children: "Sidebar Component Placeholder" });
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const Main = () => /* @__PURE__ */ jsxRuntime.jsx("main", { children: "Main Component Placeholder" });
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const Footer = () => /* @__PURE__ */ jsxRuntime.jsx("footer", { children: "Footer Component Placeholder" });
function getFileName(path) {
  const segments = path.split(/[/\\]/);
  return segments[segments.length - 1] || path;
}
function buildFullPath(path, line, column) {
  let fullPath = path;
  if (line !== null && line !== void 0) {
    fullPath += `:${line}`;
    if (column !== null && column !== void 0) {
      fullPath += `:${column}`;
    }
  }
  return fullPath;
}
const FileLink = ({
  path,
  line,
  column,
  showFullPath = false,
  className = "",
  disableClick = false
}) => {
  var _a2;
  const platform = usePlatform();
  const canOpenFile = ((_a2 = platform.features) == null ? void 0 : _a2.canOpenFile) !== false;
  const isDisabled = disableClick || !canOpenFile;
  const openFile = () => {
    if (isDisabled) {
      return;
    }
    const fullPath = buildFullPath(path, line, column);
    if (platform.openFile) {
      platform.openFile(fullPath);
    } else {
      platform.postMessage({
        type: "openFile",
        data: { path: fullPath }
      });
    }
  };
  const handleClick = (e) => {
    e.preventDefault();
    if (!isDisabled) {
      e.stopPropagation();
      openFile();
    }
  };
  const handleKeyDown = (e) => {
    if (isDisabled) {
      return;
    }
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      openFile();
    }
  };
  const displayPath = showFullPath ? path : getFileName(path);
  const fullDisplayText = buildFullPath(path, line, column);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      type: "button",
      className: [
        "file-link",
        // Reset button styles
        "bg-transparent border-none p-0 m-0 font-inherit",
        // Layout + interaction
        "inline-flex items-center leading-none",
        isDisabled ? "cursor-default opacity-60" : "cursor-pointer hover:underline",
        // Typography + color: match theme body text and fixed size
        "text-[11px] no-underline",
        "text-[var(--app-primary-foreground)]",
        // Transitions
        "transition-colors duration-100 ease-in-out",
        // Focus ring (keyboard nav)
        "focus:outline focus:outline-1 focus:outline-[var(--vscode-focusBorder)] focus:outline-offset-2 focus:rounded-[2px]",
        // Active state
        !isDisabled && "active:opacity-80",
        className
      ].filter(Boolean).join(" "),
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      title: fullDisplayText,
      "aria-label": `Open file: ${fullDisplayText}`,
      "aria-disabled": isDisabled,
      disabled: isDisabled,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "file-link-path", children: displayPath }),
        line !== null && line !== void 0 && /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "file-link-location opacity-70 text-[0.9em] font-normal dark:opacity-60", children: [
          ":",
          line,
          column !== null && column !== void 0 && /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
            ":",
            column
          ] })
        ] })
      ]
    }
  );
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Navigation and action icons
 */
const ChevronDownIcon = ({
  size = 20,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        fillRule: "evenodd",
        d: "M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z",
        clipRule: "evenodd"
      }
    )
  }
);
const getRotation = (direction) => {
  switch (direction) {
    case "up":
      return 180;
    case "down":
      return 0;
    case "left":
      return 90;
    case "right":
      return -90;
    default:
      return 0;
  }
};
const ChevronIcon = ({
  size = 12,
  className,
  direction = "down",
  style,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    style: {
      ...style,
      transform: `rotate(${getRotation(direction)}deg)`,
      transition: "transform 0.15s ease-in-out"
    },
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M3 4.5L6 7.5L9 4.5" })
  }
);
const PlusIcon = ({ size = 20, className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" })
  }
);
const PlusSmallIcon = ({
  size = 16,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M8 2a.5.5 0 0 1 .5.5V5h2.5a.5.5 0 0 1 0 1H8.5v2.5a.5.5 0 0 1-1 0V6H5a.5.5 0 0 1 0-1h2.5V2.5A.5.5 0 0 1 8 2Z" })
  }
);
const ArrowUpIcon = ({
  size = 20,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        fillRule: "evenodd",
        d: "M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z",
        clipRule: "evenodd"
      }
    )
  }
);
const CloseIcon$1 = ({
  size = 14,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 14 14",
    fill: "none",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M1 1L13 13M1 13L13 1",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round"
      }
    )
  }
);
const CloseSmallIcon = ({
  size = 16,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708Z" })
  }
);
const SearchIcon = ({
  size = 20,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        fillRule: "evenodd",
        d: "M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z",
        clipRule: "evenodd"
      }
    )
  }
);
const RefreshIcon = ({
  size = 16,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsxs(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M13.3333 8C13.3333 10.9455 10.9455 13.3333 8 13.3333C5.05451 13.3333 2.66663 10.9455 2.66663 8C2.66663 5.05451 5.05451 2.66663 8 2.66663" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M10.6666 8L13.3333 8M13.3333 8L13.3333 5.33333M13.3333 8L10.6666 10.6667" })
    ]
  }
);
const ChatHeader = ({
  currentSessionTitle,
  onLoadSessions,
  onNewSession
}) => /* @__PURE__ */ jsxRuntime.jsxs(
  "div",
  {
    className: "chat-header flex items-center select-none w-full border-b border-[var(--app-primary-border-color)] bg-[var(--app-header-background)] py-1.5 px-2.5",
    style: { borderBottom: "1px solid var(--app-primary-border-color)" },
    children: [
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          className: "flex items-center gap-1.5 py-0.5 px-2 bg-transparent border-none rounded cursor-pointer outline-none min-w-0 max-w-[300px] overflow-hidden text-[var(--vscode-chat-font-size,13px)] font-[var(--vscode-chat-font-family)] text-[var(--app-primary-foreground)] hover:bg-[var(--app-ghost-button-hover-background)] focus:bg-[var(--app-ghost-button-hover-background)]",
          onClick: onLoadSessions,
          title: "Past conversations",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "whitespace-nowrap overflow-hidden text-ellipsis min-w-0 font-medium text-[var(--app-primary-foreground)]", children: currentSessionTitle }),
            /* @__PURE__ */ jsxRuntime.jsx(ChevronDownIcon, { className: "w-4 h-4 flex-shrink-0 text-[var(--app-primary-foreground)]" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1 min-w-0" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          className: "flex items-center justify-center p-1 bg-transparent border-none rounded cursor-pointer outline-none text-[var(--app-primary-foreground)] hover:bg-[var(--app-ghost-button-hover-background)]",
          onClick: onNewSession,
          title: "New Session",
          "aria-label": "New session",
          style: { padding: "4px" },
          children: /* @__PURE__ */ jsxRuntime.jsx(PlusIcon, { className: "w-4 h-4 text-[var(--app-primary-foreground)]" })
        }
      )
    ]
  }
);
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const Tooltip = ({
  children,
  content,
  position = "top"
}) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "relative inline-block", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "group relative", children: [
  children,
  /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: `
          absolute z-50 px-2 py-1 text-xs rounded-md shadow-lg
          bg-[var(--app-primary-background,#1f2937)] border border-[var(--app-input-border,#374151)]
          text-[var(--app-primary-foreground,#f9fafb)] whitespace-nowrap
          opacity-0 group-hover:opacity-100 transition-opacity duration-150
          -translate-x-1/2 left-1/2
          ${position === "top" ? "-translate-y-1 bottom-full mb-1" : position === "bottom" ? "translate-y-1 top-full mt-1" : position === "left" ? "-translate-x-full left-0 translate-y-[-50%] top-1/2" : "translate-x-0 right-0 translate-y-[-50%] top-1/2"}
          pointer-events-none
        `,
      children: [
        content,
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: `
            absolute w-2 h-2 bg-[var(--app-primary-background,#1f2937)] border-l border-b border-[var(--app-input-border,#374151)]
            -rotate-45
            ${position === "top" ? "top-full left-1/2 -translate-x-1/2 -translate-y-1/2" : position === "bottom" ? "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2" : position === "left" ? "right-full top-1/2 translate-x-1/2 -translate-y-1/2" : "left-full top-1/2 -translate-x-1/2 -translate-y-1/2"}
          `
          }
        )
      ]
    }
  )
] }) });
const formatNumber = (value) => {
  if (value >= 1e3) {
    return `${(Math.round(value / 1e3 * 10) / 10).toFixed(1)}k`;
  }
  return Math.round(value).toLocaleString();
};
const ContextIndicator = ({
  contextUsage
}) => {
  if (!contextUsage) {
    return null;
  }
  const percentUsed = Math.max(
    0,
    Math.min(100, 100 - contextUsage.percentLeft)
  );
  const percentFormatted = Math.round(percentUsed);
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = (100 - percentUsed) / 100 * circumference;
  const tooltipContent = /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-1", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "font-medium", children: [
    percentFormatted,
    "% • ",
    formatNumber(contextUsage.usedTokens),
    " /",
    " ",
    formatNumber(contextUsage.tokenLimit),
    " context used"
  ] }) });
  const ariaLabel = `${percentFormatted}% • ${formatNumber(contextUsage.usedTokens)} / ${formatNumber(contextUsage.tokenLimit)} context used`;
  return /* @__PURE__ */ jsxRuntime.jsx(Tooltip, { content: tooltipContent, position: "top", children: /* @__PURE__ */ jsxRuntime.jsx("button", { type: "button", className: "btn-icon-compact", "aria-label": ariaLabel, children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { viewBox: "0 0 24 24", "aria-hidden": "true", role: "presentation", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "circle",
      {
        className: "context-indicator__track",
        cx: "12",
        cy: "12",
        r: radius,
        fill: "none",
        stroke: "currentColor",
        opacity: "0.2"
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "circle",
      {
        className: "context-indicator__progress",
        cx: "12",
        cy: "12",
        r: radius,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeDasharray: circumference,
        strokeDashoffset: dashOffset,
        style: {
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%"
        }
      }
    )
  ] }) }) });
};
const groupItems = (items) => {
  const groups = /* @__PURE__ */ new Map();
  for (const item of items) {
    const groupKey = item.group || null;
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey).push(item);
  }
  return Array.from(groups.entries()).map(([group, groupItems2]) => ({
    group,
    items: groupItems2
  }));
};
const CompletionMenu = ({
  items,
  onSelect,
  onFill,
  onClose,
  title,
  selectedIndex = 0
}) => {
  const containerRef = react.useRef(null);
  const listRef = react.useRef(null);
  const [selected, setSelected] = react.useState(selectedIndex);
  const [mounted, setMounted] = react.useState(false);
  const isKeyboardNavigation = react.useRef(false);
  const groupedItems = react.useMemo(() => groupItems(items), [items]);
  const hasGroups = groupedItems.some((g) => g.group !== null);
  react.useEffect(() => {
    if (!items.length) {
      return;
    }
    const nextIndex = Math.min(Math.max(selectedIndex, 0), items.length - 1);
    setSelected(nextIndex);
  }, [items.length, selectedIndex]);
  react.useEffect(() => setMounted(true), []);
  react.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        onClose();
      }
    };
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          isKeyboardNavigation.current = true;
          setSelected((prev) => Math.min(prev + 1, items.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          isKeyboardNavigation.current = true;
          setSelected((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          event.preventDefault();
          if (items[selected]) {
            onSelect(items[selected]);
          }
          break;
        case "Tab":
          event.preventDefault();
          if (items[selected]) {
            (onFill ?? onSelect)(items[selected]);
          }
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [items, selected, onSelect, onFill, onClose]);
  react.useEffect(() => {
    var _a2;
    if (!isKeyboardNavigation.current) {
      return;
    }
    isKeyboardNavigation.current = false;
    const selectedEl = (_a2 = listRef.current) == null ? void 0 : _a2.querySelector(
      `[data-index="${selected}"]`
    );
    if (selectedEl && listRef.current) {
      const listRect = listRef.current.getBoundingClientRect();
      const elRect = selectedEl.getBoundingClientRect();
      if (elRect.top < listRect.top) {
        selectedEl.scrollIntoView({ block: "start", behavior: "instant" });
      } else if (elRect.bottom > listRect.bottom) {
        selectedEl.scrollIntoView({ block: "end", behavior: "instant" });
      }
    }
  }, [selected]);
  if (!items.length) {
    return null;
  }
  let globalIndex = 0;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      ref: containerRef,
      role: "listbox",
      "aria-label": title ? `${title} suggestions` : "Suggestions",
      className: [
        "completion-menu",
        // Positioning and container styling
        "absolute bottom-full left-0 right-0 mb-2 flex flex-col overflow-hidden",
        "rounded-large border bg-[var(--app-menu-background)]",
        "border-[var(--app-input-border)] max-h-[50vh] z-[1000]",
        // Mount animation (fade + slight slide up) via keyframes
        mounted ? "animate-completion-menu-enter" : ""
      ].join(" "),
      children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "h-1" }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            ref: listRef,
            className: [
              // Semantic
              "completion-menu-list",
              // Scroll area
              "flex max-h-[300px] flex-col overflow-y-auto",
              // Spacing driven by theme vars
              "p-[var(--app-list-padding)] pb-2"
            ].join(" "),
            children: [
              title && !hasGroups && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "completion-menu-section-label px-3 py-1 text-[var(--app-primary-foreground)] opacity-50 text-[0.9em]", children: title }),
              groupedItems.map((group, groupIdx) => /* @__PURE__ */ jsxRuntime.jsxs(
                "div",
                {
                  className: "completion-menu-group",
                  children: [
                    hasGroups && group.group && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "completion-menu-section-label px-3 py-1.5 text-[var(--app-secondary-foreground)] text-[0.8em] uppercase tracking-wider", children: group.group }),
                    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-[var(--app-list-gap)]", children: group.items.map((item) => {
                      const currentIndex = globalIndex++;
                      const isActive = currentIndex === selected;
                      return /* @__PURE__ */ jsxRuntime.jsx(
                        "div",
                        {
                          "data-index": currentIndex,
                          role: "option",
                          "aria-selected": isActive,
                          onClick: () => onSelect(item),
                          onMouseEnter: () => setSelected(currentIndex),
                          className: [
                            // Semantic
                            "completion-menu-item",
                            // Hit area
                            "mx-1 cursor-pointer rounded-[var(--app-list-border-radius)]",
                            "p-[var(--app-list-item-padding)]",
                            // Active background
                            isActive ? "bg-[var(--app-list-active-background)]" : ""
                          ].join(" "),
                          children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "completion-menu-item-row flex items-center justify-between gap-2", children: [
                            item.icon && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "completion-menu-item-icon inline-flex h-4 w-4 items-center justify-center text-[var(--vscode-symbolIcon-fileForeground,#cccccc)]", children: item.icon }),
                            /* @__PURE__ */ jsxRuntime.jsx(
                              "span",
                              {
                                className: [
                                  "completion-menu-item-label flex-1 truncate",
                                  isActive ? "text-[var(--app-list-active-foreground)]" : "text-[var(--app-primary-foreground)]"
                                ].join(" "),
                                children: item.label
                              }
                            ),
                            item.description && /* @__PURE__ */ jsxRuntime.jsx(
                              "span",
                              {
                                className: "completion-menu-item-desc max-w-[50%] truncate text-[0.9em] text-[var(--app-secondary-foreground)] opacity-70",
                                title: item.description,
                                children: item.description
                              }
                            )
                          ] })
                        },
                        item.id
                      );
                    }) })
                  ]
                },
                group.group || `ungrouped-${groupIdx}`
              ))
            ]
          }
        )
      ]
    }
  );
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Session grouping utilities
 * Functions for organizing sessions by date and formatting time ago
 */
const groupSessionsByDate = (sessions) => {
  const now = /* @__PURE__ */ new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const groups = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Older: []
  };
  sessions.forEach((session) => {
    const timestamp = session.lastUpdated || session.startTime || "";
    if (!timestamp) {
      groups["Older"].push(session);
      return;
    }
    const sessionDate = new Date(timestamp);
    const sessionDay = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate()
    );
    if (sessionDay.getTime() === today.getTime()) {
      groups["Today"].push(session);
    } else if (sessionDay.getTime() === yesterday.getTime()) {
      groups["Yesterday"].push(session);
    } else if (sessionDay.getTime() > today.getTime() - 7 * 864e5) {
      groups["This Week"].push(session);
    } else {
      groups["Older"].push(session);
    }
  });
  return Object.entries(groups).filter(([, sessions2]) => sessions2.length > 0).map(([label, sessions2]) => ({ label, sessions: sessions2 }));
};
const getTimeAgo = (timestamp) => {
  if (!timestamp) {
    return "";
  }
  const now = (/* @__PURE__ */ new Date()).getTime();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 6e4);
  const diffHours = Math.floor(diffMs / 36e5);
  const diffDays = Math.floor(diffMs / 864e5);
  if (diffMins < 1) {
    return "now";
  }
  if (diffMins < 60) {
    return `${diffMins}m`;
  }
  if (diffHours < 24) {
    return `${diffHours}h`;
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays}d`;
  }
  return new Date(timestamp).toLocaleDateString();
};
const SessionSelector = ({
  visible,
  sessions,
  currentSessionId,
  searchQuery,
  onSearchChange,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
  onClose,
  hasMore = false,
  isLoading = false,
  onLoadMore
}) => {
  const [renamingSessionId, setRenamingSessionId] = react.useState(
    null
  );
  const [renameValue, setRenameValue] = react.useState("");
  const [originalRenameValue, setOriginalRenameValue] = react.useState("");
  const [confirmDeleteId, setConfirmDeleteId] = react.useState(null);
  const renameInputRef = react.useRef(null);
  const isCancelingRenameRef = react.useRef(false);
  react.useEffect(() => {
    if (renamingSessionId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingSessionId]);
  const handleRenameSubmit = (sessionId) => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== originalRenameValue && onRenameSession) {
      onRenameSession(sessionId, trimmed);
    }
    setRenamingSessionId(null);
    setRenameValue("");
    setOriginalRenameValue("");
  };
  if (!visible) {
    return null;
  }
  const hasNoSessions = sessions.length === 0;
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: "session-selector-backdrop fixed top-0 left-0 right-0 bottom-0 z-[999] bg-transparent",
        onClick: onClose
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "session-dropdown fixed bg-[var(--app-menu-background)] rounded-[var(--corner-radius-small)] w-[min(400px,calc(100vw-32px))] max-h-[min(500px,50vh)] flex flex-col shadow-[0_4px_16px_rgba(0,0,0,0.1)] z-[1000] outline-none text-[var(--vscode-chat-font-size,13px)] font-[var(--vscode-chat-font-family)]",
        tabIndex: -1,
        style: {
          top: "30px",
          left: "10px"
        },
        onClick: (e) => e.stopPropagation(),
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "session-search p-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(SearchIcon, { className: "session-search-icon w-4 h-4 opacity-50 flex-shrink-0 text-[var(--app-primary-foreground)]" }),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                type: "text",
                className: "session-search-input flex-1 bg-transparent border-none outline-none text-[var(--app-menu-foreground)] text-[var(--vscode-chat-font-size,13px)] font-[var(--vscode-chat-font-family)] p-0 placeholder:text-[var(--app-input-placeholder-foreground)] placeholder:opacity-60",
                placeholder: "Search sessions…",
                "aria-label": "Search sessions",
                value: searchQuery,
                onChange: (e) => onSearchChange(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "div",
            {
              className: "session-list-content overflow-y-auto flex-1 select-none p-2",
              onScroll: (e) => {
                const el = e.currentTarget;
                const distanceToBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
                if (distanceToBottom < 48 && hasMore && !isLoading) {
                  onLoadMore == null ? void 0 : onLoadMore();
                }
              },
              children: [
                hasNoSessions ? /* @__PURE__ */ jsxRuntime.jsx(
                  "div",
                  {
                    className: "p-5 text-center text-[var(--app-secondary-foreground)]",
                    style: {
                      padding: "20px",
                      textAlign: "center",
                      color: "var(--app-secondary-foreground)"
                    },
                    children: searchQuery ? "No matching sessions" : "No sessions available"
                  }
                ) : groupSessionsByDate(sessions).map((group) => /* @__PURE__ */ jsxRuntime.jsxs(react.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "session-group-label p-1 px-2 text-[var(--app-primary-foreground)] opacity-50 text-[0.9em] font-medium [&:not(:first-child)]:mt-2", children: group.label }),
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "session-group flex flex-col gap-[2px]", children: group.sessions.map((session) => {
                    const sessionId = session.id || session.sessionId || "";
                    const title = session.title || session.name || "Untitled";
                    const lastUpdated = session.lastUpdated || session.startTime || "";
                    const isActive = sessionId === currentSessionId;
                    if (renamingSessionId === sessionId) {
                      return /* @__PURE__ */ jsxRuntime.jsx(
                        "div",
                        {
                          className: "session-item flex items-center py-1.5 px-2 rounded-md",
                          children: /* @__PURE__ */ jsxRuntime.jsx(
                            "input",
                            {
                              ref: renameInputRef,
                              type: "text",
                              maxLength: 200,
                              className: "flex-1 bg-[var(--vscode-input-background,var(--app-input-background))] text-[var(--vscode-input-foreground,var(--app-primary-foreground))] border-2 border-[var(--vscode-focusBorder)] rounded px-2 py-1 text-[var(--vscode-chat-font-size,13px)] font-[var(--vscode-chat-font-family)] outline-none min-w-0 shadow-[0_0_0_1px_var(--vscode-focusBorder)]",
                              value: renameValue,
                              onChange: (e) => setRenameValue(e.target.value),
                              onKeyDown: (e) => {
                                if (e.key === "Enter") {
                                  handleRenameSubmit(sessionId);
                                } else if (e.key === "Escape") {
                                  isCancelingRenameRef.current = true;
                                  setRenamingSessionId(null);
                                  setRenameValue("");
                                  setOriginalRenameValue("");
                                }
                              },
                              onBlur: () => {
                                if (isCancelingRenameRef.current) {
                                  isCancelingRenameRef.current = false;
                                  return;
                                }
                                handleRenameSubmit(sessionId);
                              }
                            }
                          )
                        },
                        sessionId
                      );
                    }
                    return /* @__PURE__ */ jsxRuntime.jsxs(
                      "div",
                      {
                        className: `session-item group flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer transition-colors duration-100 hover:bg-[var(--app-list-hover-background)] ${isActive ? "active bg-[var(--app-list-active-background)] text-[var(--app-list-active-foreground)] font-[600]" : "text-[var(--app-primary-foreground)]"}`,
                        onClick: () => {
                          onSelectSession(sessionId);
                          onClose();
                        },
                        children: [
                          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "session-item-title flex-1 overflow-hidden text-ellipsis whitespace-nowrap min-w-0 text-[var(--vscode-chat-font-size,13px)] font-[var(--vscode-chat-font-family)]", children: title }),
                          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex items-center gap-1 flex-shrink-0 ml-2", children: [
                            (onRenameSession || onDeleteSession) && /* @__PURE__ */ jsxRuntime.jsxs(
                              "span",
                              {
                                className: `items-center gap-0.5 ${confirmDeleteId === sessionId ? "flex" : "hidden group-hover:flex"}`,
                                children: [
                                  onRenameSession && /* @__PURE__ */ jsxRuntime.jsx(
                                    "button",
                                    {
                                      type: "button",
                                      className: "p-0.5 bg-transparent border-none cursor-pointer opacity-50 hover:opacity-100 text-[var(--app-primary-foreground)] rounded",
                                      title: "Rename",
                                      onClick: (e) => {
                                        e.stopPropagation();
                                        setRenamingSessionId(sessionId);
                                        setRenameValue(title);
                                        setOriginalRenameValue(title);
                                      },
                                      children: /* @__PURE__ */ jsxRuntime.jsx(
                                        "svg",
                                        {
                                          width: "14",
                                          height: "14",
                                          viewBox: "0 0 16 16",
                                          fill: "currentColor",
                                          children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z" })
                                        }
                                      )
                                    }
                                  ),
                                  onDeleteSession && !isActive && (confirmDeleteId === sessionId ? /* @__PURE__ */ jsxRuntime.jsx(
                                    "button",
                                    {
                                      type: "button",
                                      className: "px-1.5 py-0.5 bg-[var(--vscode-inputValidation-errorBackground,#5a1d1d)] border border-[var(--vscode-inputValidation-errorBorder,#be1100)] cursor-pointer text-[var(--vscode-errorForeground,#f48771)] rounded text-[11px] leading-tight",
                                      title: "Click to confirm delete",
                                      onClick: (e) => {
                                        e.stopPropagation();
                                        setConfirmDeleteId(null);
                                        onDeleteSession(sessionId);
                                      },
                                      onBlur: () => setConfirmDeleteId(null),
                                      children: "Delete?"
                                    }
                                  ) : /* @__PURE__ */ jsxRuntime.jsx(
                                    "button",
                                    {
                                      type: "button",
                                      className: "p-0.5 bg-transparent border-none cursor-pointer opacity-50 hover:opacity-100 text-[var(--app-primary-foreground)] rounded",
                                      title: "Delete",
                                      onClick: (e) => {
                                        e.stopPropagation();
                                        setConfirmDeleteId(sessionId);
                                      },
                                      children: /* @__PURE__ */ jsxRuntime.jsx(
                                        "svg",
                                        {
                                          width: "14",
                                          height: "14",
                                          viewBox: "0 0 16 16",
                                          fill: "currentColor",
                                          children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M10 3h3v1h-1v9l-1 1H5l-1-1V4H3V3h3V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1zM9 2H7v1h2V2zM5 4v9h6V4H5zm2 2h1v5H7V6zm3 0h-1v5h1V6z" })
                                        }
                                      )
                                    }
                                  ))
                                ]
                              }
                            ),
                            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "session-item-time opacity-60 text-[0.9em]", children: getTimeAgo(lastUpdated) })
                          ] })
                        ]
                      },
                      sessionId
                    );
                  }) })
                ] }, group.label)),
                hasMore && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-2 text-center opacity-60 text-[0.9em]", children: isLoading ? "Loading…" : "" })
              ]
            }
          )
        ]
      }
    )
  ] });
};
const EmptyState = ({
  isAuthenticated = false,
  loadingMessage,
  logoUrl,
  appName = "Qwen Code"
}) => {
  var _a2;
  const platform = usePlatform();
  const iconUri = logoUrl ?? ((_a2 = platform.getResourceUrl) == null ? void 0 : _a2.call(platform, "icon.png"));
  const description = loadingMessage ? `Preparing ${appName}…` : isAuthenticated ? "What would you like to do? Ask about this codebase or we can start writing code." : `Welcome! Please log in to start using ${appName}.`;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col items-center justify-center h-full p-5 md:p-10", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col items-center gap-8 w-full", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center gap-6", children: [
    iconUri ? /* @__PURE__ */ jsxRuntime.jsx(
      "img",
      {
        src: iconUri,
        alt: `${appName} Logo`,
        className: "w-[60px] h-[60px] object-contain",
        onError: (e) => {
          const target = e.target;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            const fallback = document.createElement("div");
            fallback.className = "w-[60px] h-[60px] flex items-center justify-center text-2xl font-bold";
            fallback.textContent = appName.charAt(0).toUpperCase();
            parent.appendChild(fallback);
          }
        }
      }
    ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-[60px] h-[60px] flex items-center justify-center text-2xl font-bold bg-gray-200 rounded", children: appName.charAt(0).toUpperCase() }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[15px] text-app-primary-foreground leading-normal font-normal max-w-[400px]", children: description }) })
  ] }) }) });
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Edit mode related icons
 */
const EditPencilIcon = ({
  size = 16,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        fillRule: "evenodd",
        d: "M11.013 2.513a1.75 1.75 0 0 1 2.475 2.474L6.226 12.25a2.751 2.751 0 0 1-.892.596l-2.047.848a.75.75 0 0 1-.98-.98l.848-2.047a2.75 2.75 0 0 1 .596-.892l7.262-7.261Z",
        clipRule: "evenodd"
      }
    )
  }
);
const AutoEditIcon = ({
  size = 16,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M2.53 3.956A1 1 0 0 0 1 4.804v6.392a1 1 0 0 0 1.53.848l5.113-3.196c.16-.1.279-.233.357-.383v2.73a1 1 0 0 0 1.53.849l5.113-3.196a1 1 0 0 0 0-1.696L9.53 3.956A1 1 0 0 0 8 4.804v2.731a.992.992 0 0 0-.357-.383L2.53 3.956Z" })
  }
);
const PlanModeIcon = ({
  size = 16,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M4.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-1ZM10.5 2a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-1Z" })
  }
);
const CodeBracketsIcon = ({
  size = 20,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        fillRule: "evenodd",
        d: "M6.28 5.22a.75.75 0 0 1 0 1.06L2.56 10l3.72 3.72a.75.75 0 0 1-1.06 1.06L.97 10.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Zm7.44 0a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L17.44 10l-3.72-3.72a.75.75 0 0 1 0-1.06ZM11.377 2.011a.75.75 0 0 1 .612.867l-2.5 14.5a.75.75 0 0 1-1.478-.255l2.5-14.5a.75.75 0 0 1 .866-.612Z",
        clipRule: "evenodd"
      }
    )
  }
);
const HideContextIcon = ({
  size = 20,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsxs(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "path",
        {
          fillRule: "evenodd",
          d: "M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z",
          clipRule: "evenodd"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "m10.748 13.93 2.523 2.523a9.987 9.987 0 0 1-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 0 1 0-1.186A10.007 10.007 0 0 1 2.839 6.02L6.07 9.252a4 4 0 0 0 4.678 4.678Z" })
    ]
  }
);
const SlashCommandIcon = ({
  size = 20,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        fillRule: "evenodd",
        d: "M12.528 3.047a.75.75 0 0 1 .449.961L8.433 16.504a.75.75 0 1 1-1.41-.512l4.544-12.496a.75.75 0 0 1 .961-.449Z",
        clipRule: "evenodd"
      }
    )
  }
);
const LinkIcon = ({ size = 20, className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        fillRule: "evenodd",
        d: "M15.621 4.379a3 3 0 0 0-4.242 0l-7 7a3 3 0 0 0 4.241 4.243h.001l.497-.5a.75.75 0 0 1 1.064 1.057l-.498.501-.002.002a4.5 4.5 0 0 1-6.364-6.364l7-7a4.5 4.5 0 0 1 6.368 6.36l-3.455 3.553A2.625 2.625 0 1 1 9.52 9.52l3.45-3.451a.75.75 0 1 1 1.061 1.06l-3.45 3.451a1.125 1.125 0 0 0 1.587 1.595l3.454-3.553a3 3 0 0 0 0-4.242Z",
        clipRule: "evenodd"
      }
    )
  }
);
const OpenDiffIcon = ({
  size = 16,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M13.5 7l-4-4v3h-6v2h6v3l4-4z" })
  }
);
const UndoIcon = ({ size = 16, className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "none",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M9 10.6667L12.3333 14L9 17.3333M12.3333 14H4.66667C3.56112 14 2.66667 13.1056 2.66667 12V4.66667C2.66667 3.56112 3.56112 2.66667 4.66667 2.66667H13.3333C14.4389 2.66667 15.3333 3.56112 15.3333 4.66667V8.66667",
        stroke: "currentColor",
        strokeWidth: "1.33333",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    )
  }
);
const CopyIcon = ({ size = 16, className, ...props }) => /* @__PURE__ */ jsxRuntime.jsxs(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "none",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "rect",
        {
          x: "4.6665",
          y: "4",
          width: "8",
          height: "8",
          rx: "1.33333",
          stroke: "currentColor",
          strokeWidth: "1.33333"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "path",
        {
          d: "M6 6H5.33333C4.04767 6 3 7.04767 3 8.33333V10.6667C3 11.9523 4.04767 13 5.33333 13H7.66667C8.95233 13 10 11.9523 10 10.6667V10",
          stroke: "currentColor",
          strokeWidth: "1.33333",
          strokeLinecap: "round"
        }
      )
    ]
  }
);
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Stop icon for canceling operations
 */
const StopIcon = ({ size = 16, className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("rect", { x: "4", y: "4", width: "8", height: "8", rx: "1" })
  }
);
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const ZERO_WIDTH_SPACE = "​";
function stripZeroWidthSpaces(text2) {
  return text2.replace(/\u200B/g, "");
}
const getEditModeIcon = (iconType) => {
  switch (iconType) {
    case "edit":
      return /* @__PURE__ */ jsxRuntime.jsx(EditPencilIcon, {});
    case "auto":
    case "yolo":
      return /* @__PURE__ */ jsxRuntime.jsx(AutoEditIcon, {});
    case "plan":
      return /* @__PURE__ */ jsxRuntime.jsx(PlanModeIcon, {});
    default:
      return null;
  }
};
const InputForm = ({
  inputText,
  inputFieldRef,
  isStreaming,
  isWaitingForResponse,
  isComposing,
  editModeInfo,
  // thinkingEnabled,  // Temporarily disabled
  activeFileName,
  activeSelection,
  skipAutoActiveContext,
  contextUsage,
  onInputChange,
  onCompositionStart,
  onCompositionEnd,
  onKeyDown,
  onSubmit,
  onCancel,
  onToggleEditMode,
  // onToggleThinking,  // Temporarily disabled
  onToggleSkipAutoActiveContext,
  onShowCommandMenu,
  onAttachContext,
  completionIsOpen,
  completionItems,
  onCompletionSelect,
  onCompletionFill,
  onCompletionClose,
  onPaste,
  extraContent,
  placeholder = "Ask Qwen Code …",
  canSubmit,
  followupState,
  onAcceptFollowup,
  onDismissFollowup
}) => {
  const composerDisabled = isStreaming || isWaitingForResponse;
  const hasDraftContent = canSubmit ?? stripZeroWidthSpaces(inputText).trim().length > 0;
  const completionItemsResolved = completionItems ?? [];
  const completionActive = completionIsOpen && completionItemsResolved.length > 0 && !!onCompletionSelect && !!onCompletionClose;
  const followupSuggestion = (followupState == null ? void 0 : followupState.isVisible) && followupState.suggestion ? followupState.suggestion : null;
  const hasFollowup = !!followupSuggestion;
  const actualPlaceholder = hasFollowup && !inputText ? followupSuggestion : placeholder;
  const handleKeyDown = (e) => {
    if (completionActive && e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onCompletionClose == null ? void 0 : onCompletionClose();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
      return;
    }
    if (e.key === "Tab" && hasFollowup && onAcceptFollowup && !inputText && !completionActive) {
      e.preventDefault();
      e.stopPropagation();
      onAcceptFollowup("tab");
      return;
    }
    if (e.key === "ArrowRight" && hasFollowup && onAcceptFollowup && !inputText && !completionActive) {
      e.preventDefault();
      onAcceptFollowup == null ? void 0 : onAcceptFollowup("right");
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      if (completionActive) {
        return;
      }
      if (hasFollowup && !inputText && followupSuggestion) {
        e.preventDefault();
        onAcceptFollowup == null ? void 0 : onAcceptFollowup("enter", { skipOnAccept: true });
        onSubmit(e, followupSuggestion);
        return;
      }
      e.preventDefault();
      onSubmit(e);
    }
    onKeyDown(e);
  };
  const selectedLinesCount = activeSelection ? Math.max(1, activeSelection.endLine - activeSelection.startLine + 1) : 0;
  const selectedLinesText = selectedLinesCount > 0 ? `${selectedLinesCount} ${selectedLinesCount === 1 ? "line" : "lines"} selected` : "";
  const activeFileTitle = activeFileName ? skipAutoActiveContext ? selectedLinesText ? `Active selection will NOT be auto-loaded into context: ${selectedLinesText}` : `Active file will NOT be auto-loaded into context: ${activeFileName}` : selectedLinesText ? `Showing your current selection: ${selectedLinesText}` : `Showing your current file: ${activeFileName}` : "";
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "p-1 px-4 pb-4 absolute bottom-0 left-0 right-0 bg-gradient-to-b from-transparent to-[var(--app-primary-background)] pointer-events-none", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "block pointer-events-auto", children: /* @__PURE__ */ jsxRuntime.jsxs("form", { className: "composer-form", onSubmit, children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "composer-overlay" }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "input-banner" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative flex z-[1]", children: [
      completionActive && onCompletionSelect && onCompletionClose && /* @__PURE__ */ jsxRuntime.jsx(
        CompletionMenu,
        {
          items: completionItemsResolved,
          onSelect: onCompletionSelect,
          onFill: onCompletionFill,
          onClose: onCompletionClose,
          title: void 0
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          ref: inputFieldRef,
          contentEditable: "plaintext-only",
          className: "composer-input",
          role: "textbox",
          "aria-label": "Message input",
          "aria-multiline": "true",
          "data-placeholder": actualPlaceholder,
          "data-has-suggestion": hasFollowup ? "true" : "false",
          "data-empty": stripZeroWidthSpaces(inputText).trim().length === 0 ? "true" : "false",
          onInput: (e) => {
            const target = e.target;
            const text2 = stripZeroWidthSpaces(target.textContent ?? "");
            onInputChange(text2);
            if (hasFollowup && !inputText && text2) {
              onDismissFollowup == null ? void 0 : onDismissFollowup();
            }
          },
          onCompositionStart,
          onCompositionEnd,
          onKeyDown: handleKeyDown,
          onPaste,
          suppressContentEditableWarning: true
        }
      )
    ] }),
    extraContent ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "relative z-[1]", children: extraContent }) : null,
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "composer-actions", children: [
      /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          className: "btn-text-compact btn-text-compact--primary",
          title: editModeInfo.title,
          "aria-label": editModeInfo.label,
          onClick: onToggleEditMode,
          children: [
            editModeInfo.icon,
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "hidden sm:inline", children: editModeInfo.label })
          ]
        }
      ),
      activeFileName && /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          type: "button",
          className: "btn-text-compact btn-text-compact--primary",
          title: activeFileTitle,
          "aria-label": activeFileTitle,
          onClick: onToggleSkipAutoActiveContext,
          children: [
            skipAutoActiveContext ? /* @__PURE__ */ jsxRuntime.jsx(HideContextIcon, {}) : /* @__PURE__ */ jsxRuntime.jsx(CodeBracketsIcon, {}),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "hidden sm:inline", children: selectedLinesText || activeFileName })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1 min-w-0" }),
      /* @__PURE__ */ jsxRuntime.jsx(ContextIndicator, { contextUsage }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          className: "btn-icon-compact hover:text-[var(--app-primary-foreground)]",
          title: "Show command menu (/)",
          "aria-label": "Show command menu",
          onClick: onShowCommandMenu,
          children: /* @__PURE__ */ jsxRuntime.jsx(SlashCommandIcon, {})
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          className: "btn-icon-compact hover:text-[var(--app-primary-foreground)]",
          title: "Attach context (Cmd/Ctrl + /)",
          "aria-label": "Attach context",
          onClick: onAttachContext,
          children: /* @__PURE__ */ jsxRuntime.jsx(LinkIcon, {})
        }
      ),
      isStreaming || isWaitingForResponse ? /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "button",
          className: "btn-send-compact [&>svg]:w-5 [&>svg]:h-5",
          onClick: onCancel,
          title: "Stop generation",
          "aria-label": "Stop generation",
          children: /* @__PURE__ */ jsxRuntime.jsx(StopIcon, {})
        }
      ) : /* @__PURE__ */ jsxRuntime.jsx(
        "button",
        {
          type: "submit",
          className: "btn-send-compact [&>svg]:w-5 [&>svg]:h-5",
          disabled: composerDisabled || !hasDraftContent,
          "aria-label": "Send message",
          children: /* @__PURE__ */ jsxRuntime.jsx(ArrowUpIcon, {})
        }
      )
    ] })
  ] }) }) });
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Onboarding component - Pure UI welcome screen
 * Platform-specific logic (icon URL) passed via props
 */
const Onboarding = ({
  iconUrl,
  onGetStarted,
  appName = "Qwen Code",
  subtitle = "Unlock the power of AI to understand, navigate, and transform your codebase faster than ever before.",
  buttonText = "Get Started with Qwen Code"
}) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col items-center justify-center h-full p-5 md:p-10", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col items-center gap-8 w-full max-w-md mx-auto", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col items-center gap-6", children: [
  iconUrl && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntime.jsx(
    "img",
    {
      src: iconUrl,
      alt: `${appName} Logo`,
      className: "w-[80px] h-[80px] object-contain"
    }
  ) }),
  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("h1", { className: "text-2xl font-bold text-[var(--app-primary-foreground)] mb-2", children: [
      "Welcome to ",
      appName
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx("p", { className: "text-[var(--app-secondary-foreground)] max-w-sm", children: subtitle })
  ] }),
  /* @__PURE__ */ jsxRuntime.jsx(
    "button",
    {
      onClick: onGetStarted,
      className: "w-full px-4 py-3 bg-[var(--app-primary,var(--app-button-background))] text-[var(--app-button-foreground,#ffffff)] font-medium rounded-lg shadow-sm hover:bg-[var(--app-primary-hover,var(--app-button-hover-background))] transition-colors duration-200",
      children: buttonText
    }
  )
] }) }) });
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const Message = ({
  content,
  sender,
  timestamp,
  className = ""
}) => {
  const alignment = sender === "user" ? "justify-end" : "justify-start";
  const bgColor = sender === "user" ? "bg-blue-500" : "bg-gray-200";
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: `flex ${alignment} mb-4 ${className}`, children: /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: `${bgColor} text-white rounded-lg px-4 py-2 max-w-xs md:max-w-md lg:max-w-lg`,
      children: [
        content,
        timestamp && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-xs opacity-70 mt-1", children: timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        }) })
      ]
    }
  ) });
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const MessageInput = () => /* @__PURE__ */ jsxRuntime.jsx("div", { children: "MessageInput Component Placeholder" });
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const MessageList = () => /* @__PURE__ */ jsxRuntime.jsx("div", { children: "MessageList Component Placeholder" });
const ROTATE_INTERVAL_MS = 3e3;
const DEFAULT_LOADING_PHRASES = [
  "Processing...",
  "Working on it...",
  "Just a moment...",
  "Loading...",
  "Hold tight...",
  "Almost there..."
];
const WaitingMessage = ({ loadingMessage }) => {
  const phrases = react.useMemo(() => {
    const set2 = /* @__PURE__ */ new Set();
    const list2 = [];
    if (loadingMessage && loadingMessage.trim()) {
      list2.push(loadingMessage);
      set2.add(loadingMessage);
    }
    for (const p of DEFAULT_LOADING_PHRASES) {
      if (!set2.has(p)) {
        list2.push(p);
      }
    }
    return list2;
  }, [loadingMessage]);
  const [index, setIndex] = react.useState(0);
  react.useEffect(() => {
    setIndex(0);
  }, [phrases]);
  react.useEffect(() => {
    if (phrases.length <= 1) {
      return;
    }
    const id = setInterval(() => {
      setIndex((prev) => {
        let next = Math.floor(Math.random() * phrases.length);
        if (phrases.length > 1) {
          let guard = 0;
          while (next === prev && guard < 5) {
            next = Math.floor(Math.random() * phrases.length);
            guard++;
          }
        }
        return next;
      });
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [phrases]);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "waiting-message-outer flex gap-0 items-start text-left py-2 flex-col opacity-85", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "assistant-message-container assistant-message-loading waiting-message-inner w-full items-start pl-[30px] relative", children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "waiting-message-text opacity-70 italic loading-text-shimmer", children: phrases[index] }) }) });
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const InterruptedMessage = ({
  text: text2 = "Interrupted"
}) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex gap-0 items-start text-left py-2 flex-col opacity-85", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "interrupted-item w-full relative", children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "opacity-70 italic", children: text2 }) }) });
const decodeCache = {};
function getDecodeCache(exclude) {
  let cache = decodeCache[exclude];
  if (cache) {
    return cache;
  }
  cache = decodeCache[exclude] = [];
  for (let i = 0; i < 128; i++) {
    const ch = String.fromCharCode(i);
    cache.push(ch);
  }
  for (let i = 0; i < exclude.length; i++) {
    const ch = exclude.charCodeAt(i);
    cache[ch] = "%" + ("0" + ch.toString(16).toUpperCase()).slice(-2);
  }
  return cache;
}
function decode$1(string, exclude) {
  if (typeof exclude !== "string") {
    exclude = decode$1.defaultChars;
  }
  const cache = getDecodeCache(exclude);
  return string.replace(/(%[a-f0-9]{2})+/gi, function(seq) {
    let result = "";
    for (let i = 0, l = seq.length; i < l; i += 3) {
      const b1 = parseInt(seq.slice(i + 1, i + 3), 16);
      if (b1 < 128) {
        result += cache[b1];
        continue;
      }
      if ((b1 & 224) === 192 && i + 3 < l) {
        const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        if ((b2 & 192) === 128) {
          const chr = b1 << 6 & 1984 | b2 & 63;
          if (chr < 128) {
            result += "��";
          } else {
            result += String.fromCharCode(chr);
          }
          i += 3;
          continue;
        }
      }
      if ((b1 & 240) === 224 && i + 6 < l) {
        const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        const b3 = parseInt(seq.slice(i + 7, i + 9), 16);
        if ((b2 & 192) === 128 && (b3 & 192) === 128) {
          const chr = b1 << 12 & 61440 | b2 << 6 & 4032 | b3 & 63;
          if (chr < 2048 || chr >= 55296 && chr <= 57343) {
            result += "���";
          } else {
            result += String.fromCharCode(chr);
          }
          i += 6;
          continue;
        }
      }
      if ((b1 & 248) === 240 && i + 9 < l) {
        const b2 = parseInt(seq.slice(i + 4, i + 6), 16);
        const b3 = parseInt(seq.slice(i + 7, i + 9), 16);
        const b4 = parseInt(seq.slice(i + 10, i + 12), 16);
        if ((b2 & 192) === 128 && (b3 & 192) === 128 && (b4 & 192) === 128) {
          let chr = b1 << 18 & 1835008 | b2 << 12 & 258048 | b3 << 6 & 4032 | b4 & 63;
          if (chr < 65536 || chr > 1114111) {
            result += "����";
          } else {
            chr -= 65536;
            result += String.fromCharCode(55296 + (chr >> 10), 56320 + (chr & 1023));
          }
          i += 9;
          continue;
        }
      }
      result += "�";
    }
    return result;
  });
}
decode$1.defaultChars = ";/?:@&=+$,#";
decode$1.componentChars = "";
const encodeCache = {};
function getEncodeCache(exclude) {
  let cache = encodeCache[exclude];
  if (cache) {
    return cache;
  }
  cache = encodeCache[exclude] = [];
  for (let i = 0; i < 128; i++) {
    const ch = String.fromCharCode(i);
    if (/^[0-9a-z]$/i.test(ch)) {
      cache.push(ch);
    } else {
      cache.push("%" + ("0" + i.toString(16).toUpperCase()).slice(-2));
    }
  }
  for (let i = 0; i < exclude.length; i++) {
    cache[exclude.charCodeAt(i)] = exclude[i];
  }
  return cache;
}
function encode$1(string, exclude, keepEscaped) {
  if (typeof exclude !== "string") {
    keepEscaped = exclude;
    exclude = encode$1.defaultChars;
  }
  if (typeof keepEscaped === "undefined") {
    keepEscaped = true;
  }
  const cache = getEncodeCache(exclude);
  let result = "";
  for (let i = 0, l = string.length; i < l; i++) {
    const code2 = string.charCodeAt(i);
    if (keepEscaped && code2 === 37 && i + 2 < l) {
      if (/^[0-9a-f]{2}$/i.test(string.slice(i + 1, i + 3))) {
        result += string.slice(i, i + 3);
        i += 2;
        continue;
      }
    }
    if (code2 < 128) {
      result += cache[code2];
      continue;
    }
    if (code2 >= 55296 && code2 <= 57343) {
      if (code2 >= 55296 && code2 <= 56319 && i + 1 < l) {
        const nextCode = string.charCodeAt(i + 1);
        if (nextCode >= 56320 && nextCode <= 57343) {
          result += encodeURIComponent(string[i] + string[i + 1]);
          i++;
          continue;
        }
      }
      result += "%EF%BF%BD";
      continue;
    }
    result += encodeURIComponent(string[i]);
  }
  return result;
}
encode$1.defaultChars = ";/?:@&=+$,-_.!~*'()#";
encode$1.componentChars = "-_.!~*'()";
function format(url) {
  let result = "";
  result += url.protocol || "";
  result += url.slashes ? "//" : "";
  result += url.auth ? url.auth + "@" : "";
  if (url.hostname && url.hostname.indexOf(":") !== -1) {
    result += "[" + url.hostname + "]";
  } else {
    result += url.hostname || "";
  }
  result += url.port ? ":" + url.port : "";
  result += url.pathname || "";
  result += url.search || "";
  result += url.hash || "";
  return result;
}
function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.pathname = null;
}
const protocolPattern = /^([a-z0-9.+-]+:)/i;
const portPattern = /:[0-9]*$/;
const simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;
const delims = ["<", ">", '"', "`", " ", "\r", "\n", "	"];
const unwise = ["{", "}", "|", "\\", "^", "`"].concat(delims);
const autoEscape = ["'"].concat(unwise);
const nonHostChars = ["%", "/", "?", ";", "#"].concat(autoEscape);
const hostEndingChars = ["/", "?", "#"];
const hostnameMaxLen = 255;
const hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/;
const hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/;
const hostlessProtocol = {
  javascript: true,
  "javascript:": true
};
const slashedProtocol = {
  http: true,
  https: true,
  ftp: true,
  gopher: true,
  file: true,
  "http:": true,
  "https:": true,
  "ftp:": true,
  "gopher:": true,
  "file:": true
};
function urlParse(url, slashesDenoteHost) {
  if (url && url instanceof Url) return url;
  const u = new Url();
  u.parse(url, slashesDenoteHost);
  return u;
}
Url.prototype.parse = function(url, slashesDenoteHost) {
  let lowerProto, hec, slashes;
  let rest = url;
  rest = rest.trim();
  if (!slashesDenoteHost && url.split("#").length === 1) {
    const simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
      }
      return this;
    }
  }
  let proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    lowerProto = proto.toLowerCase();
    this.protocol = proto;
    rest = rest.substr(proto.length);
  }
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    slashes = rest.substr(0, 2) === "//";
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }
  if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {
    let hostEnd = -1;
    for (let i = 0; i < hostEndingChars.length; i++) {
      hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }
    let auth, atSign;
    if (hostEnd === -1) {
      atSign = rest.lastIndexOf("@");
    } else {
      atSign = rest.lastIndexOf("@", hostEnd);
    }
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = auth;
    }
    hostEnd = -1;
    for (let i = 0; i < nonHostChars.length; i++) {
      hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) {
        hostEnd = hec;
      }
    }
    if (hostEnd === -1) {
      hostEnd = rest.length;
    }
    if (rest[hostEnd - 1] === ":") {
      hostEnd--;
    }
    const host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);
    this.parseHost(host);
    this.hostname = this.hostname || "";
    const ipv6Hostname = this.hostname[0] === "[" && this.hostname[this.hostname.length - 1] === "]";
    if (!ipv6Hostname) {
      const hostparts = this.hostname.split(/\./);
      for (let i = 0, l = hostparts.length; i < l; i++) {
        const part = hostparts[i];
        if (!part) {
          continue;
        }
        if (!part.match(hostnamePartPattern)) {
          let newpart = "";
          for (let j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              newpart += "x";
            } else {
              newpart += part[j];
            }
          }
          if (!newpart.match(hostnamePartPattern)) {
            const validParts = hostparts.slice(0, i);
            const notHost = hostparts.slice(i + 1);
            const bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = notHost.join(".") + rest;
            }
            this.hostname = validParts.join(".");
            break;
          }
        }
      }
    }
    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = "";
    }
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
    }
  }
  const hash = rest.indexOf("#");
  if (hash !== -1) {
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  const qm = rest.indexOf("?");
  if (qm !== -1) {
    this.search = rest.substr(qm);
    rest = rest.slice(0, qm);
  }
  if (rest) {
    this.pathname = rest;
  }
  if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
    this.pathname = "";
  }
  return this;
};
Url.prototype.parseHost = function(host) {
  let port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ":") {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) {
    this.hostname = host;
  }
};
const mdurl = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  decode: decode$1,
  encode: encode$1,
  format,
  parse: urlParse
}, Symbol.toStringTag, { value: "Module" }));
const Any = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
const Cc = /[\0-\x1F\x7F-\x9F]/;
const regex$1 = /[\xAD\u0600-\u0605\u061C\u06DD\u070F\u0890\u0891\u08E2\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF\uFFF9-\uFFFB]|\uD804[\uDCBD\uDCCD]|\uD80D[\uDC30-\uDC3F]|\uD82F[\uDCA0-\uDCA3]|\uD834[\uDD73-\uDD7A]|\uDB40[\uDC01\uDC20-\uDC7F]/;
const P = /[!-#%-\*,-\/:;\?@\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061D-\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u09FD\u0A76\u0AF0\u0C77\u0C84\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1B7D\u1B7E\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E4F\u2E52-\u2E5D\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD803[\uDEAD\uDF55-\uDF59\uDF86-\uDF89]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC8\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDC4B-\uDC4F\uDC5A\uDC5B\uDC5D\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDE60-\uDE6C\uDEB9\uDF3C-\uDF3E]|\uD806[\uDC3B\uDD44-\uDD46\uDDE2\uDE3F-\uDE46\uDE9A-\uDE9C\uDE9E-\uDEA2\uDF00-\uDF09]|\uD807[\uDC41-\uDC45\uDC70\uDC71\uDEF7\uDEF8\uDF43-\uDF4F\uDFFF]|\uD809[\uDC70-\uDC74]|\uD80B[\uDFF1\uDFF2]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD81B[\uDE97-\uDE9A\uDFE2]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]|\uD83A[\uDD5E\uDD5F]/;
const regex = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u0888\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20C0\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFF\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u31EF\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC2\uFD40-\uFD4F\uFDCF\uFDFC-\uFDFF\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD833[\uDF50-\uDFC3]|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDEA\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEDC-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF76\uDF7B-\uDFD9\uDFE0-\uDFEB\uDFF0]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDE53\uDE60-\uDE6D\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC5\uDECE-\uDEDB\uDEE0-\uDEE8\uDEF0-\uDEF8\uDF00-\uDF92\uDF94-\uDFCA]/;
const Z = /[ \xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;
const ucmicro = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Any,
  Cc,
  Cf: regex$1,
  P,
  S: regex,
  Z
}, Symbol.toStringTag, { value: "Module" }));
const htmlDecodeTree = new Uint16Array(
  // prettier-ignore
  'ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻 ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌'.split("").map((c) => c.charCodeAt(0))
);
const xmlDecodeTree = new Uint16Array(
  // prettier-ignore
  "Ȁaglq	\x1Bɭ\0\0p;䀦os;䀧t;䀾t;䀼uot;䀢".split("").map((c) => c.charCodeAt(0))
);
var _a;
const decodeMap = /* @__PURE__ */ new Map([
  [0, 65533],
  // C1 Unicode control character reference replacements
  [128, 8364],
  [130, 8218],
  [131, 402],
  [132, 8222],
  [133, 8230],
  [134, 8224],
  [135, 8225],
  [136, 710],
  [137, 8240],
  [138, 352],
  [139, 8249],
  [140, 338],
  [142, 381],
  [145, 8216],
  [146, 8217],
  [147, 8220],
  [148, 8221],
  [149, 8226],
  [150, 8211],
  [151, 8212],
  [152, 732],
  [153, 8482],
  [154, 353],
  [155, 8250],
  [156, 339],
  [158, 382],
  [159, 376]
]);
const fromCodePoint$1 = (
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, node/no-unsupported-features/es-builtins
  (_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : function(codePoint) {
    let output = "";
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  }
);
function replaceCodePoint(codePoint) {
  var _a2;
  if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
    return 65533;
  }
  return (_a2 = decodeMap.get(codePoint)) !== null && _a2 !== void 0 ? _a2 : codePoint;
}
var CharCodes;
(function(CharCodes2) {
  CharCodes2[CharCodes2["NUM"] = 35] = "NUM";
  CharCodes2[CharCodes2["SEMI"] = 59] = "SEMI";
  CharCodes2[CharCodes2["EQUALS"] = 61] = "EQUALS";
  CharCodes2[CharCodes2["ZERO"] = 48] = "ZERO";
  CharCodes2[CharCodes2["NINE"] = 57] = "NINE";
  CharCodes2[CharCodes2["LOWER_A"] = 97] = "LOWER_A";
  CharCodes2[CharCodes2["LOWER_F"] = 102] = "LOWER_F";
  CharCodes2[CharCodes2["LOWER_X"] = 120] = "LOWER_X";
  CharCodes2[CharCodes2["LOWER_Z"] = 122] = "LOWER_Z";
  CharCodes2[CharCodes2["UPPER_A"] = 65] = "UPPER_A";
  CharCodes2[CharCodes2["UPPER_F"] = 70] = "UPPER_F";
  CharCodes2[CharCodes2["UPPER_Z"] = 90] = "UPPER_Z";
})(CharCodes || (CharCodes = {}));
const TO_LOWER_BIT = 32;
var BinTrieFlags;
(function(BinTrieFlags2) {
  BinTrieFlags2[BinTrieFlags2["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
  BinTrieFlags2[BinTrieFlags2["BRANCH_LENGTH"] = 16256] = "BRANCH_LENGTH";
  BinTrieFlags2[BinTrieFlags2["JUMP_TABLE"] = 127] = "JUMP_TABLE";
})(BinTrieFlags || (BinTrieFlags = {}));
function isNumber(code2) {
  return code2 >= CharCodes.ZERO && code2 <= CharCodes.NINE;
}
function isHexadecimalCharacter(code2) {
  return code2 >= CharCodes.UPPER_A && code2 <= CharCodes.UPPER_F || code2 >= CharCodes.LOWER_A && code2 <= CharCodes.LOWER_F;
}
function isAsciiAlphaNumeric(code2) {
  return code2 >= CharCodes.UPPER_A && code2 <= CharCodes.UPPER_Z || code2 >= CharCodes.LOWER_A && code2 <= CharCodes.LOWER_Z || isNumber(code2);
}
function isEntityInAttributeInvalidEnd(code2) {
  return code2 === CharCodes.EQUALS || isAsciiAlphaNumeric(code2);
}
var EntityDecoderState;
(function(EntityDecoderState2) {
  EntityDecoderState2[EntityDecoderState2["EntityStart"] = 0] = "EntityStart";
  EntityDecoderState2[EntityDecoderState2["NumericStart"] = 1] = "NumericStart";
  EntityDecoderState2[EntityDecoderState2["NumericDecimal"] = 2] = "NumericDecimal";
  EntityDecoderState2[EntityDecoderState2["NumericHex"] = 3] = "NumericHex";
  EntityDecoderState2[EntityDecoderState2["NamedEntity"] = 4] = "NamedEntity";
})(EntityDecoderState || (EntityDecoderState = {}));
var DecodingMode;
(function(DecodingMode2) {
  DecodingMode2[DecodingMode2["Legacy"] = 0] = "Legacy";
  DecodingMode2[DecodingMode2["Strict"] = 1] = "Strict";
  DecodingMode2[DecodingMode2["Attribute"] = 2] = "Attribute";
})(DecodingMode || (DecodingMode = {}));
class EntityDecoder {
  constructor(decodeTree, emitCodePoint, errors2) {
    this.decodeTree = decodeTree;
    this.emitCodePoint = emitCodePoint;
    this.errors = errors2;
    this.state = EntityDecoderState.EntityStart;
    this.consumed = 1;
    this.result = 0;
    this.treeIndex = 0;
    this.excess = 1;
    this.decodeMode = DecodingMode.Strict;
  }
  /** Resets the instance to make it reusable. */
  startEntity(decodeMode) {
    this.decodeMode = decodeMode;
    this.state = EntityDecoderState.EntityStart;
    this.result = 0;
    this.treeIndex = 0;
    this.excess = 1;
    this.consumed = 1;
  }
  /**
   * Write an entity to the decoder. This can be called multiple times with partial entities.
   * If the entity is incomplete, the decoder will return -1.
   *
   * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
   * entity is incomplete, and resume when the next string is written.
   *
   * @param string The string containing the entity (or a continuation of the entity).
   * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  write(str, offset) {
    switch (this.state) {
      case EntityDecoderState.EntityStart: {
        if (str.charCodeAt(offset) === CharCodes.NUM) {
          this.state = EntityDecoderState.NumericStart;
          this.consumed += 1;
          return this.stateNumericStart(str, offset + 1);
        }
        this.state = EntityDecoderState.NamedEntity;
        return this.stateNamedEntity(str, offset);
      }
      case EntityDecoderState.NumericStart: {
        return this.stateNumericStart(str, offset);
      }
      case EntityDecoderState.NumericDecimal: {
        return this.stateNumericDecimal(str, offset);
      }
      case EntityDecoderState.NumericHex: {
        return this.stateNumericHex(str, offset);
      }
      case EntityDecoderState.NamedEntity: {
        return this.stateNamedEntity(str, offset);
      }
    }
  }
  /**
   * Switches between the numeric decimal and hexadecimal states.
   *
   * Equivalent to the `Numeric character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericStart(str, offset) {
    if (offset >= str.length) {
      return -1;
    }
    if ((str.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
      this.state = EntityDecoderState.NumericHex;
      this.consumed += 1;
      return this.stateNumericHex(str, offset + 1);
    }
    this.state = EntityDecoderState.NumericDecimal;
    return this.stateNumericDecimal(str, offset);
  }
  addToNumericResult(str, start, end, base2) {
    if (start !== end) {
      const digitCount = end - start;
      this.result = this.result * Math.pow(base2, digitCount) + parseInt(str.substr(start, digitCount), base2);
      this.consumed += digitCount;
    }
  }
  /**
   * Parses a hexadecimal numeric entity.
   *
   * Equivalent to the `Hexademical character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericHex(str, offset) {
    const startIdx = offset;
    while (offset < str.length) {
      const char = str.charCodeAt(offset);
      if (isNumber(char) || isHexadecimalCharacter(char)) {
        offset += 1;
      } else {
        this.addToNumericResult(str, startIdx, offset, 16);
        return this.emitNumericEntity(char, 3);
      }
    }
    this.addToNumericResult(str, startIdx, offset, 16);
    return -1;
  }
  /**
   * Parses a decimal numeric entity.
   *
   * Equivalent to the `Decimal character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericDecimal(str, offset) {
    const startIdx = offset;
    while (offset < str.length) {
      const char = str.charCodeAt(offset);
      if (isNumber(char)) {
        offset += 1;
      } else {
        this.addToNumericResult(str, startIdx, offset, 10);
        return this.emitNumericEntity(char, 2);
      }
    }
    this.addToNumericResult(str, startIdx, offset, 10);
    return -1;
  }
  /**
   * Validate and emit a numeric entity.
   *
   * Implements the logic from the `Hexademical character reference start
   * state` and `Numeric character reference end state` in the HTML spec.
   *
   * @param lastCp The last code point of the entity. Used to see if the
   *               entity was terminated with a semicolon.
   * @param expectedLength The minimum number of characters that should be
   *                       consumed. Used to validate that at least one digit
   *                       was consumed.
   * @returns The number of characters that were consumed.
   */
  emitNumericEntity(lastCp, expectedLength) {
    var _a2;
    if (this.consumed <= expectedLength) {
      (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
      return 0;
    }
    if (lastCp === CharCodes.SEMI) {
      this.consumed += 1;
    } else if (this.decodeMode === DecodingMode.Strict) {
      return 0;
    }
    this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
    if (this.errors) {
      if (lastCp !== CharCodes.SEMI) {
        this.errors.missingSemicolonAfterCharacterReference();
      }
      this.errors.validateNumericCharacterReference(this.result);
    }
    return this.consumed;
  }
  /**
   * Parses a named entity.
   *
   * Equivalent to the `Named character reference state` in the HTML spec.
   *
   * @param str The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNamedEntity(str, offset) {
    const { decodeTree } = this;
    let current = decodeTree[this.treeIndex];
    let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
    for (; offset < str.length; offset++, this.excess++) {
      const char = str.charCodeAt(offset);
      this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
      if (this.treeIndex < 0) {
        return this.result === 0 || // If we are parsing an attribute
        this.decodeMode === DecodingMode.Attribute && // We shouldn't have consumed any characters after the entity,
        (valueLength === 0 || // And there should be no invalid characters.
        isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
      }
      current = decodeTree[this.treeIndex];
      valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
      if (valueLength !== 0) {
        if (char === CharCodes.SEMI) {
          return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
        }
        if (this.decodeMode !== DecodingMode.Strict) {
          this.result = this.treeIndex;
          this.consumed += this.excess;
          this.excess = 0;
        }
      }
    }
    return -1;
  }
  /**
   * Emit a named entity that was not terminated with a semicolon.
   *
   * @returns The number of characters consumed.
   */
  emitNotTerminatedNamedEntity() {
    var _a2;
    const { result, decodeTree } = this;
    const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
    this.emitNamedEntityData(result, valueLength, this.consumed);
    (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.missingSemicolonAfterCharacterReference();
    return this.consumed;
  }
  /**
   * Emit a named entity.
   *
   * @param result The index of the entity in the decode tree.
   * @param valueLength The number of bytes in the entity.
   * @param consumed The number of characters consumed.
   *
   * @returns The number of characters consumed.
   */
  emitNamedEntityData(result, valueLength, consumed) {
    const { decodeTree } = this;
    this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~BinTrieFlags.VALUE_LENGTH : decodeTree[result + 1], consumed);
    if (valueLength === 3) {
      this.emitCodePoint(decodeTree[result + 2], consumed);
    }
    return consumed;
  }
  /**
   * Signal to the parser that the end of the input was reached.
   *
   * Remaining data will be emitted and relevant errors will be produced.
   *
   * @returns The number of characters consumed.
   */
  end() {
    var _a2;
    switch (this.state) {
      case EntityDecoderState.NamedEntity: {
        return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
      }
      case EntityDecoderState.NumericDecimal: {
        return this.emitNumericEntity(0, 2);
      }
      case EntityDecoderState.NumericHex: {
        return this.emitNumericEntity(0, 3);
      }
      case EntityDecoderState.NumericStart: {
        (_a2 = this.errors) === null || _a2 === void 0 ? void 0 : _a2.absenceOfDigitsInNumericCharacterReference(this.consumed);
        return 0;
      }
      case EntityDecoderState.EntityStart: {
        return 0;
      }
    }
  }
}
function getDecoder(decodeTree) {
  let ret = "";
  const decoder = new EntityDecoder(decodeTree, (str) => ret += fromCodePoint$1(str));
  return function decodeWithTrie(str, decodeMode) {
    let lastIndex = 0;
    let offset = 0;
    while ((offset = str.indexOf("&", offset)) >= 0) {
      ret += str.slice(lastIndex, offset);
      decoder.startEntity(decodeMode);
      const len = decoder.write(
        str,
        // Skip the "&"
        offset + 1
      );
      if (len < 0) {
        lastIndex = offset + decoder.end();
        break;
      }
      lastIndex = offset + len;
      offset = len === 0 ? lastIndex + 1 : lastIndex;
    }
    const result = ret + str.slice(lastIndex);
    ret = "";
    return result;
  };
}
function determineBranch(decodeTree, current, nodeIdx, char) {
  const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
  const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
  if (branchCount === 0) {
    return jumpOffset !== 0 && char === jumpOffset ? nodeIdx : -1;
  }
  if (jumpOffset) {
    const value = char - jumpOffset;
    return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIdx + value] - 1;
  }
  let lo = nodeIdx;
  let hi = lo + branchCount - 1;
  while (lo <= hi) {
    const mid = lo + hi >>> 1;
    const midVal = decodeTree[mid];
    if (midVal < char) {
      lo = mid + 1;
    } else if (midVal > char) {
      hi = mid - 1;
    } else {
      return decodeTree[mid + branchCount];
    }
  }
  return -1;
}
const htmlDecoder = getDecoder(htmlDecodeTree);
getDecoder(xmlDecodeTree);
function decodeHTML(str, mode = DecodingMode.Legacy) {
  return htmlDecoder(str, mode);
}
function decodeHTMLStrict(str) {
  return htmlDecoder(str, DecodingMode.Strict);
}
function _class$1(obj) {
  return Object.prototype.toString.call(obj);
}
function isString$1(obj) {
  return _class$1(obj) === "[object String]";
}
const _hasOwnProperty = Object.prototype.hasOwnProperty;
function has(object, key) {
  return _hasOwnProperty.call(object, key);
}
function assign$1(obj) {
  const sources = Array.prototype.slice.call(arguments, 1);
  sources.forEach(function(source) {
    if (!source) {
      return;
    }
    if (typeof source !== "object") {
      throw new TypeError(source + "must be object");
    }
    Object.keys(source).forEach(function(key) {
      obj[key] = source[key];
    });
  });
  return obj;
}
function arrayReplaceAt(src, pos, newElements) {
  return [].concat(src.slice(0, pos), newElements, src.slice(pos + 1));
}
function isValidEntityCode(c) {
  if (c >= 55296 && c <= 57343) {
    return false;
  }
  if (c >= 64976 && c <= 65007) {
    return false;
  }
  if ((c & 65535) === 65535 || (c & 65535) === 65534) {
    return false;
  }
  if (c >= 0 && c <= 8) {
    return false;
  }
  if (c === 11) {
    return false;
  }
  if (c >= 14 && c <= 31) {
    return false;
  }
  if (c >= 127 && c <= 159) {
    return false;
  }
  if (c > 1114111) {
    return false;
  }
  return true;
}
function fromCodePoint(c) {
  if (c > 65535) {
    c -= 65536;
    const surrogate1 = 55296 + (c >> 10);
    const surrogate2 = 56320 + (c & 1023);
    return String.fromCharCode(surrogate1, surrogate2);
  }
  return String.fromCharCode(c);
}
const UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g;
const ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi;
const UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + "|" + ENTITY_RE.source, "gi");
const DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))$/i;
function replaceEntityPattern(match2, name) {
  if (name.charCodeAt(0) === 35 && DIGITAL_ENTITY_TEST_RE.test(name)) {
    const code2 = name[1].toLowerCase() === "x" ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10);
    if (isValidEntityCode(code2)) {
      return fromCodePoint(code2);
    }
    return match2;
  }
  const decoded = decodeHTML(match2);
  if (decoded !== match2) {
    return decoded;
  }
  return match2;
}
function unescapeMd(str) {
  if (str.indexOf("\\") < 0) {
    return str;
  }
  return str.replace(UNESCAPE_MD_RE, "$1");
}
function unescapeAll(str) {
  if (str.indexOf("\\") < 0 && str.indexOf("&") < 0) {
    return str;
  }
  return str.replace(UNESCAPE_ALL_RE, function(match2, escaped, entity2) {
    if (escaped) {
      return escaped;
    }
    return replaceEntityPattern(match2, entity2);
  });
}
const HTML_ESCAPE_TEST_RE = /[&<>"]/;
const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
const HTML_REPLACEMENTS = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function replaceUnsafeChar(ch) {
  return HTML_REPLACEMENTS[ch];
}
function escapeHtml$1(str) {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
}
const REGEXP_ESCAPE_RE = /[.?*+^$[\]\\(){}|-]/g;
function escapeRE$1(str) {
  return str.replace(REGEXP_ESCAPE_RE, "\\$&");
}
function isSpace(code2) {
  switch (code2) {
    case 9:
    case 32:
      return true;
  }
  return false;
}
function isWhiteSpace(code2) {
  if (code2 >= 8192 && code2 <= 8202) {
    return true;
  }
  switch (code2) {
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 32:
    case 160:
    case 5760:
    case 8239:
    case 8287:
    case 12288:
      return true;
  }
  return false;
}
function isPunctChar(ch) {
  return P.test(ch) || regex.test(ch);
}
function isPunctCharCode(code2) {
  return isPunctChar(fromCodePoint(code2));
}
function isMdAsciiPunct(ch) {
  switch (ch) {
    case 33:
    case 34:
    case 35:
    case 36:
    case 37:
    case 38:
    case 39:
    case 40:
    case 41:
    case 42:
    case 43:
    case 44:
    case 45:
    case 46:
    case 47:
    case 58:
    case 59:
    case 60:
    case 61:
    case 62:
    case 63:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 124:
    case 125:
    case 126:
      return true;
    default:
      return false;
  }
}
function normalizeReference(str) {
  str = str.trim().replace(/\s+/g, " ");
  if ("ẞ".toLowerCase() === "Ṿ") {
    str = str.replace(/ẞ/g, "ß");
  }
  return str.toLowerCase().toUpperCase();
}
function isAsciiTrimmable(c) {
  return c === 32 || c === 9 || c === 10 || c === 13;
}
function asciiTrim(str) {
  let start = 0;
  for (; start < str.length; start++) {
    if (!isAsciiTrimmable(str.charCodeAt(start))) {
      break;
    }
  }
  let end = str.length - 1;
  for (; end >= start; end--) {
    if (!isAsciiTrimmable(str.charCodeAt(end))) {
      break;
    }
  }
  return str.slice(start, end + 1);
}
const lib = { mdurl, ucmicro };
const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  arrayReplaceAt,
  asciiTrim,
  assign: assign$1,
  escapeHtml: escapeHtml$1,
  escapeRE: escapeRE$1,
  fromCodePoint,
  has,
  isMdAsciiPunct,
  isPunctChar,
  isPunctCharCode,
  isSpace,
  isString: isString$1,
  isValidEntityCode,
  isWhiteSpace,
  lib,
  normalizeReference,
  unescapeAll,
  unescapeMd
}, Symbol.toStringTag, { value: "Module" }));
function parseLinkLabel(state, start, disableNested) {
  let level, found, marker, prevPos;
  const max = state.posMax;
  const oldPos = state.pos;
  state.pos = start + 1;
  level = 1;
  while (state.pos < max) {
    marker = state.src.charCodeAt(state.pos);
    if (marker === 93) {
      level--;
      if (level === 0) {
        found = true;
        break;
      }
    }
    prevPos = state.pos;
    state.md.inline.skipToken(state);
    if (marker === 91) {
      if (prevPos === state.pos - 1) {
        level++;
      } else if (disableNested) {
        state.pos = oldPos;
        return -1;
      }
    }
  }
  let labelEnd = -1;
  if (found) {
    labelEnd = state.pos;
  }
  state.pos = oldPos;
  return labelEnd;
}
function parseLinkDestination(str, start, max) {
  let code2;
  let pos = start;
  const result = {
    ok: false,
    pos: 0,
    str: ""
  };
  if (str.charCodeAt(pos) === 60) {
    pos++;
    while (pos < max) {
      code2 = str.charCodeAt(pos);
      if (code2 === 10) {
        return result;
      }
      if (code2 === 60) {
        return result;
      }
      if (code2 === 62) {
        result.pos = pos + 1;
        result.str = unescapeAll(str.slice(start + 1, pos));
        result.ok = true;
        return result;
      }
      if (code2 === 92 && pos + 1 < max) {
        pos += 2;
        continue;
      }
      pos++;
    }
    return result;
  }
  let level = 0;
  while (pos < max) {
    code2 = str.charCodeAt(pos);
    if (code2 === 32) {
      break;
    }
    if (code2 < 32 || code2 === 127) {
      break;
    }
    if (code2 === 92 && pos + 1 < max) {
      if (str.charCodeAt(pos + 1) === 32) {
        break;
      }
      pos += 2;
      continue;
    }
    if (code2 === 40) {
      level++;
      if (level > 32) {
        return result;
      }
    }
    if (code2 === 41) {
      if (level === 0) {
        break;
      }
      level--;
    }
    pos++;
  }
  if (start === pos) {
    return result;
  }
  if (level !== 0) {
    return result;
  }
  result.str = unescapeAll(str.slice(start, pos));
  result.pos = pos;
  result.ok = true;
  return result;
}
function parseLinkTitle(str, start, max, prev_state) {
  let code2;
  let pos = start;
  const state = {
    // if `true`, this is a valid link title
    ok: false,
    // if `true`, this link can be continued on the next line
    can_continue: false,
    // if `ok`, it's the position of the first character after the closing marker
    pos: 0,
    // if `ok`, it's the unescaped title
    str: "",
    // expected closing marker character code
    marker: 0
  };
  if (prev_state) {
    state.str = prev_state.str;
    state.marker = prev_state.marker;
  } else {
    if (pos >= max) {
      return state;
    }
    let marker = str.charCodeAt(pos);
    if (marker !== 34 && marker !== 39 && marker !== 40) {
      return state;
    }
    start++;
    pos++;
    if (marker === 40) {
      marker = 41;
    }
    state.marker = marker;
  }
  while (pos < max) {
    code2 = str.charCodeAt(pos);
    if (code2 === state.marker) {
      state.pos = pos + 1;
      state.str += unescapeAll(str.slice(start, pos));
      state.ok = true;
      return state;
    } else if (code2 === 40 && state.marker === 41) {
      return state;
    } else if (code2 === 92 && pos + 1 < max) {
      pos++;
    }
    pos++;
  }
  state.can_continue = true;
  state.str += unescapeAll(str.slice(start, pos));
  return state;
}
const helpers = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  parseLinkDestination,
  parseLinkLabel,
  parseLinkTitle
}, Symbol.toStringTag, { value: "Module" }));
const default_rules = {};
default_rules.code_inline = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  return "<code" + slf.renderAttrs(token) + ">" + escapeHtml$1(token.content) + "</code>";
};
default_rules.code_block = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  return "<pre" + slf.renderAttrs(token) + "><code>" + escapeHtml$1(tokens[idx].content) + "</code></pre>\n";
};
default_rules.fence = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  const info = token.info ? unescapeAll(token.info).trim() : "";
  let langName = "";
  let langAttrs = "";
  if (info) {
    const arr = info.split(/(\s+)/g);
    langName = arr[0];
    langAttrs = arr.slice(2).join("");
  }
  let highlighted;
  if (options.highlight) {
    highlighted = options.highlight(token.content, langName, langAttrs) || escapeHtml$1(token.content);
  } else {
    highlighted = escapeHtml$1(token.content);
  }
  if (highlighted.indexOf("<pre") === 0) {
    return highlighted + "\n";
  }
  if (info) {
    const i = token.attrIndex("class");
    const tmpAttrs = token.attrs ? token.attrs.slice() : [];
    if (i < 0) {
      tmpAttrs.push(["class", options.langPrefix + langName]);
    } else {
      tmpAttrs[i] = tmpAttrs[i].slice();
      tmpAttrs[i][1] += " " + options.langPrefix + langName;
    }
    const tmpToken = {
      attrs: tmpAttrs
    };
    return `<pre><code${slf.renderAttrs(tmpToken)}>${highlighted}</code></pre>
`;
  }
  return `<pre><code${slf.renderAttrs(token)}>${highlighted}</code></pre>
`;
};
default_rules.image = function(tokens, idx, options, env, slf) {
  const token = tokens[idx];
  token.attrs[token.attrIndex("alt")][1] = slf.renderInlineAsText(token.children, options, env);
  return slf.renderToken(tokens, idx, options);
};
default_rules.hardbreak = function(tokens, idx, options) {
  return options.xhtmlOut ? "<br />\n" : "<br>\n";
};
default_rules.softbreak = function(tokens, idx, options) {
  return options.breaks ? options.xhtmlOut ? "<br />\n" : "<br>\n" : "\n";
};
default_rules.text = function(tokens, idx) {
  return escapeHtml$1(tokens[idx].content);
};
default_rules.html_block = function(tokens, idx) {
  return tokens[idx].content;
};
default_rules.html_inline = function(tokens, idx) {
  return tokens[idx].content;
};
function Renderer() {
  this.rules = assign$1({}, default_rules);
}
Renderer.prototype.renderAttrs = function renderAttrs(token) {
  let i, l, result;
  if (!token.attrs) {
    return "";
  }
  result = "";
  for (i = 0, l = token.attrs.length; i < l; i++) {
    result += " " + escapeHtml$1(token.attrs[i][0]) + '="' + escapeHtml$1(token.attrs[i][1]) + '"';
  }
  return result;
};
Renderer.prototype.renderToken = function renderToken(tokens, idx, options) {
  const token = tokens[idx];
  let result = "";
  if (token.hidden) {
    return "";
  }
  if (token.block && token.nesting !== -1 && idx && tokens[idx - 1].hidden) {
    result += "\n";
  }
  result += (token.nesting === -1 ? "</" : "<") + token.tag;
  result += this.renderAttrs(token);
  if (token.nesting === 0 && options.xhtmlOut) {
    result += " /";
  }
  let needLf = false;
  if (token.block) {
    needLf = true;
    if (token.nesting === 1) {
      if (idx + 1 < tokens.length) {
        const nextToken = tokens[idx + 1];
        if (nextToken.type === "inline" || nextToken.hidden) {
          needLf = false;
        } else if (nextToken.nesting === -1 && nextToken.tag === token.tag) {
          needLf = false;
        }
      }
    }
  }
  result += needLf ? ">\n" : ">";
  return result;
};
Renderer.prototype.renderInline = function(tokens, options, env) {
  let result = "";
  const rules = this.rules;
  for (let i = 0, len = tokens.length; i < len; i++) {
    const type = tokens[i].type;
    if (typeof rules[type] !== "undefined") {
      result += rules[type](tokens, i, options, env, this);
    } else {
      result += this.renderToken(tokens, i, options);
    }
  }
  return result;
};
Renderer.prototype.renderInlineAsText = function(tokens, options, env) {
  let result = "";
  for (let i = 0, len = tokens.length; i < len; i++) {
    switch (tokens[i].type) {
      case "text":
        result += tokens[i].content;
        break;
      case "image":
        result += this.renderInlineAsText(tokens[i].children, options, env);
        break;
      case "html_inline":
      case "html_block":
        result += tokens[i].content;
        break;
      case "softbreak":
      case "hardbreak":
        result += "\n";
        break;
    }
  }
  return result;
};
Renderer.prototype.render = function(tokens, options, env) {
  let result = "";
  const rules = this.rules;
  for (let i = 0, len = tokens.length; i < len; i++) {
    const type = tokens[i].type;
    if (type === "inline") {
      result += this.renderInline(tokens[i].children, options, env);
    } else if (typeof rules[type] !== "undefined") {
      result += rules[type](tokens, i, options, env, this);
    } else {
      result += this.renderToken(tokens, i, options, env);
    }
  }
  return result;
};
function Ruler() {
  this.__rules__ = [];
  this.__cache__ = null;
}
Ruler.prototype.__find__ = function(name) {
  for (let i = 0; i < this.__rules__.length; i++) {
    if (this.__rules__[i].name === name) {
      return i;
    }
  }
  return -1;
};
Ruler.prototype.__compile__ = function() {
  const self = this;
  const chains = [""];
  self.__rules__.forEach(function(rule) {
    if (!rule.enabled) {
      return;
    }
    rule.alt.forEach(function(altName) {
      if (chains.indexOf(altName) < 0) {
        chains.push(altName);
      }
    });
  });
  self.__cache__ = {};
  chains.forEach(function(chain) {
    self.__cache__[chain] = [];
    self.__rules__.forEach(function(rule) {
      if (!rule.enabled) {
        return;
      }
      if (chain && rule.alt.indexOf(chain) < 0) {
        return;
      }
      self.__cache__[chain].push(rule.fn);
    });
  });
};
Ruler.prototype.at = function(name, fn, options) {
  const index = this.__find__(name);
  const opt = options || {};
  if (index === -1) {
    throw new Error("Parser rule not found: " + name);
  }
  this.__rules__[index].fn = fn;
  this.__rules__[index].alt = opt.alt || [];
  this.__cache__ = null;
};
Ruler.prototype.before = function(beforeName, ruleName, fn, options) {
  const index = this.__find__(beforeName);
  const opt = options || {};
  if (index === -1) {
    throw new Error("Parser rule not found: " + beforeName);
  }
  this.__rules__.splice(index, 0, {
    name: ruleName,
    enabled: true,
    fn,
    alt: opt.alt || []
  });
  this.__cache__ = null;
};
Ruler.prototype.after = function(afterName, ruleName, fn, options) {
  const index = this.__find__(afterName);
  const opt = options || {};
  if (index === -1) {
    throw new Error("Parser rule not found: " + afterName);
  }
  this.__rules__.splice(index + 1, 0, {
    name: ruleName,
    enabled: true,
    fn,
    alt: opt.alt || []
  });
  this.__cache__ = null;
};
Ruler.prototype.push = function(ruleName, fn, options) {
  const opt = options || {};
  this.__rules__.push({
    name: ruleName,
    enabled: true,
    fn,
    alt: opt.alt || []
  });
  this.__cache__ = null;
};
Ruler.prototype.enable = function(list2, ignoreInvalid) {
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  const result = [];
  list2.forEach(function(name) {
    const idx = this.__find__(name);
    if (idx < 0) {
      if (ignoreInvalid) {
        return;
      }
      throw new Error("Rules manager: invalid rule name " + name);
    }
    this.__rules__[idx].enabled = true;
    result.push(name);
  }, this);
  this.__cache__ = null;
  return result;
};
Ruler.prototype.enableOnly = function(list2, ignoreInvalid) {
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  this.__rules__.forEach(function(rule) {
    rule.enabled = false;
  });
  this.enable(list2, ignoreInvalid);
};
Ruler.prototype.disable = function(list2, ignoreInvalid) {
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  const result = [];
  list2.forEach(function(name) {
    const idx = this.__find__(name);
    if (idx < 0) {
      if (ignoreInvalid) {
        return;
      }
      throw new Error("Rules manager: invalid rule name " + name);
    }
    this.__rules__[idx].enabled = false;
    result.push(name);
  }, this);
  this.__cache__ = null;
  return result;
};
Ruler.prototype.getRules = function(chainName) {
  if (this.__cache__ === null) {
    this.__compile__();
  }
  return this.__cache__[chainName] || [];
};
function Token(type, tag, nesting) {
  this.type = type;
  this.tag = tag;
  this.attrs = null;
  this.map = null;
  this.nesting = nesting;
  this.level = 0;
  this.children = null;
  this.content = "";
  this.markup = "";
  this.info = "";
  this.meta = null;
  this.block = false;
  this.hidden = false;
}
Token.prototype.attrIndex = function attrIndex(name) {
  if (!this.attrs) {
    return -1;
  }
  const attrs = this.attrs;
  for (let i = 0, len = attrs.length; i < len; i++) {
    if (attrs[i][0] === name) {
      return i;
    }
  }
  return -1;
};
Token.prototype.attrPush = function attrPush(attrData) {
  if (this.attrs) {
    this.attrs.push(attrData);
  } else {
    this.attrs = [attrData];
  }
};
Token.prototype.attrSet = function attrSet(name, value) {
  const idx = this.attrIndex(name);
  const attrData = [name, value];
  if (idx < 0) {
    this.attrPush(attrData);
  } else {
    this.attrs[idx] = attrData;
  }
};
Token.prototype.attrGet = function attrGet(name) {
  const idx = this.attrIndex(name);
  let value = null;
  if (idx >= 0) {
    value = this.attrs[idx][1];
  }
  return value;
};
Token.prototype.attrJoin = function attrJoin(name, value) {
  const idx = this.attrIndex(name);
  if (idx < 0) {
    this.attrPush([name, value]);
  } else {
    this.attrs[idx][1] = this.attrs[idx][1] + " " + value;
  }
};
function StateCore(src, md, env) {
  this.src = src;
  this.env = env;
  this.tokens = [];
  this.inlineMode = false;
  this.md = md;
}
StateCore.prototype.Token = Token;
const NEWLINES_RE = /\r\n?|\n/g;
const NULL_RE = /\0/g;
function normalize(state) {
  let str;
  str = state.src.replace(NEWLINES_RE, "\n");
  str = str.replace(NULL_RE, "�");
  state.src = str;
}
function block(state) {
  let token;
  if (state.inlineMode) {
    token = new state.Token("inline", "", 0);
    token.content = state.src;
    token.map = [0, 1];
    token.children = [];
    state.tokens.push(token);
  } else {
    state.md.block.parse(state.src, state.md, state.env, state.tokens);
  }
}
function inline(state) {
  const tokens = state.tokens;
  for (let i = 0, l = tokens.length; i < l; i++) {
    const tok = tokens[i];
    if (tok.type === "inline") {
      state.md.inline.parse(tok.content, state.md, state.env, tok.children);
    }
  }
}
function isLinkOpen$1(str) {
  return /^<a[>\s]/i.test(str);
}
function isLinkClose$1(str) {
  return /^<\/a\s*>/i.test(str);
}
function linkify$1(state) {
  const blockTokens = state.tokens;
  if (!state.md.options.linkify) {
    return;
  }
  for (let j = 0, l = blockTokens.length; j < l; j++) {
    if (blockTokens[j].type !== "inline" || !state.md.linkify.pretest(blockTokens[j].content)) {
      continue;
    }
    let tokens = blockTokens[j].children;
    let htmlLinkLevel = 0;
    for (let i = tokens.length - 1; i >= 0; i--) {
      const currentToken = tokens[i];
      if (currentToken.type === "link_close") {
        i--;
        while (tokens[i].level !== currentToken.level && tokens[i].type !== "link_open") {
          i--;
        }
        continue;
      }
      if (currentToken.type === "html_inline") {
        if (isLinkOpen$1(currentToken.content) && htmlLinkLevel > 0) {
          htmlLinkLevel--;
        }
        if (isLinkClose$1(currentToken.content)) {
          htmlLinkLevel++;
        }
      }
      if (htmlLinkLevel > 0) {
        continue;
      }
      if (currentToken.type === "text" && state.md.linkify.test(currentToken.content)) {
        const text2 = currentToken.content;
        let links = state.md.linkify.match(text2);
        const nodes = [];
        let level = currentToken.level;
        let lastPos = 0;
        if (links.length > 0 && links[0].index === 0 && i > 0 && tokens[i - 1].type === "text_special") {
          links = links.slice(1);
        }
        for (let ln = 0; ln < links.length; ln++) {
          const url = links[ln].url;
          const fullUrl = state.md.normalizeLink(url);
          if (!state.md.validateLink(fullUrl)) {
            continue;
          }
          let urlText = links[ln].text;
          if (!links[ln].schema) {
            urlText = state.md.normalizeLinkText("http://" + urlText).replace(/^http:\/\//, "");
          } else if (links[ln].schema === "mailto:" && !/^mailto:/i.test(urlText)) {
            urlText = state.md.normalizeLinkText("mailto:" + urlText).replace(/^mailto:/, "");
          } else {
            urlText = state.md.normalizeLinkText(urlText);
          }
          const pos = links[ln].index;
          if (pos > lastPos) {
            const token = new state.Token("text", "", 0);
            token.content = text2.slice(lastPos, pos);
            token.level = level;
            nodes.push(token);
          }
          const token_o = new state.Token("link_open", "a", 1);
          token_o.attrs = [["href", fullUrl]];
          token_o.level = level++;
          token_o.markup = "linkify";
          token_o.info = "auto";
          nodes.push(token_o);
          const token_t = new state.Token("text", "", 0);
          token_t.content = urlText;
          token_t.level = level;
          nodes.push(token_t);
          const token_c = new state.Token("link_close", "a", -1);
          token_c.level = --level;
          token_c.markup = "linkify";
          token_c.info = "auto";
          nodes.push(token_c);
          lastPos = links[ln].lastIndex;
        }
        if (lastPos < text2.length) {
          const token = new state.Token("text", "", 0);
          token.content = text2.slice(lastPos);
          token.level = level;
          nodes.push(token);
        }
        blockTokens[j].children = tokens = arrayReplaceAt(tokens, i, nodes);
      }
    }
  }
}
const RARE_RE = /\+-|\.\.|\?\?\?\?|!!!!|,,|--/;
const SCOPED_ABBR_TEST_RE = /\((c|tm|r)\)/i;
const SCOPED_ABBR_RE = /\((c|tm|r)\)/ig;
const SCOPED_ABBR = {
  c: "©",
  r: "®",
  tm: "™"
};
function replaceFn(match2, name) {
  return SCOPED_ABBR[name.toLowerCase()];
}
function replace_scoped(inlineTokens) {
  let inside_autolink = 0;
  for (let i = inlineTokens.length - 1; i >= 0; i--) {
    const token = inlineTokens[i];
    if (token.type === "text" && !inside_autolink) {
      token.content = token.content.replace(SCOPED_ABBR_RE, replaceFn);
    }
    if (token.type === "link_open" && token.info === "auto") {
      inside_autolink--;
    }
    if (token.type === "link_close" && token.info === "auto") {
      inside_autolink++;
    }
  }
}
function replace_rare(inlineTokens) {
  let inside_autolink = 0;
  for (let i = inlineTokens.length - 1; i >= 0; i--) {
    const token = inlineTokens[i];
    if (token.type === "text" && !inside_autolink) {
      if (RARE_RE.test(token.content)) {
        token.content = token.content.replace(/\+-/g, "±").replace(/\.{2,}/g, "…").replace(/([?!])…/g, "$1..").replace(/([?!]){4,}/g, "$1$1$1").replace(/,{2,}/g, ",").replace(/(^|[^-])---(?=[^-]|$)/mg, "$1—").replace(/(^|\s)--(?=\s|$)/mg, "$1–").replace(/(^|[^-\s])--(?=[^-\s]|$)/mg, "$1–");
      }
    }
    if (token.type === "link_open" && token.info === "auto") {
      inside_autolink--;
    }
    if (token.type === "link_close" && token.info === "auto") {
      inside_autolink++;
    }
  }
}
function replace(state) {
  let blkIdx;
  if (!state.md.options.typographer) {
    return;
  }
  for (blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== "inline") {
      continue;
    }
    if (SCOPED_ABBR_TEST_RE.test(state.tokens[blkIdx].content)) {
      replace_scoped(state.tokens[blkIdx].children);
    }
    if (RARE_RE.test(state.tokens[blkIdx].content)) {
      replace_rare(state.tokens[blkIdx].children);
    }
  }
}
const QUOTE_TEST_RE = /['"]/;
const QUOTE_RE = /['"]/g;
const APOSTROPHE = "’";
function addReplacement(replacements, tokenIdx, pos, ch) {
  if (!replacements[tokenIdx]) {
    replacements[tokenIdx] = [];
  }
  replacements[tokenIdx].push({ pos, ch });
}
function applyReplacements(str, replacements) {
  let result = "";
  let lastPos = 0;
  replacements.sort((a, b) => a.pos - b.pos);
  for (let i = 0; i < replacements.length; i++) {
    const replacement = replacements[i];
    result += str.slice(lastPos, replacement.pos) + replacement.ch;
    lastPos = replacement.pos + 1;
  }
  return result + str.slice(lastPos);
}
function process_inlines(tokens, state) {
  let j;
  const stack = [];
  const replacements = {};
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const thisLevel = tokens[i].level;
    for (j = stack.length - 1; j >= 0; j--) {
      if (stack[j].level <= thisLevel) {
        break;
      }
    }
    stack.length = j + 1;
    if (token.type !== "text") {
      continue;
    }
    const text2 = token.content;
    let pos = 0;
    const max = text2.length;
    OUTER:
      while (pos < max) {
        QUOTE_RE.lastIndex = pos;
        const t = QUOTE_RE.exec(text2);
        if (!t) {
          break;
        }
        let canOpen = true;
        let canClose = true;
        pos = t.index + 1;
        const isSingle = t[0] === "'";
        let lastChar = 32;
        if (t.index - 1 >= 0) {
          lastChar = text2.charCodeAt(t.index - 1);
        } else {
          for (j = i - 1; j >= 0; j--) {
            if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break;
            if (!tokens[j].content) continue;
            lastChar = tokens[j].content.charCodeAt(tokens[j].content.length - 1);
            break;
          }
        }
        let nextChar = 32;
        if (pos < max) {
          nextChar = text2.charCodeAt(pos);
        } else {
          for (j = i + 1; j < tokens.length; j++) {
            if (tokens[j].type === "softbreak" || tokens[j].type === "hardbreak") break;
            if (!tokens[j].content) continue;
            nextChar = tokens[j].content.charCodeAt(0);
            break;
          }
        }
        const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctCharCode(lastChar);
        const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctCharCode(nextChar);
        const isLastWhiteSpace = isWhiteSpace(lastChar);
        const isNextWhiteSpace = isWhiteSpace(nextChar);
        if (isNextWhiteSpace) {
          canOpen = false;
        } else if (isNextPunctChar) {
          if (!(isLastWhiteSpace || isLastPunctChar)) {
            canOpen = false;
          }
        }
        if (isLastWhiteSpace) {
          canClose = false;
        } else if (isLastPunctChar) {
          if (!(isNextWhiteSpace || isNextPunctChar)) {
            canClose = false;
          }
        }
        if (nextChar === 34 && t[0] === '"') {
          if (lastChar >= 48 && lastChar <= 57) {
            canClose = canOpen = false;
          }
        }
        if (canOpen && canClose) {
          canOpen = isLastPunctChar;
          canClose = isNextPunctChar;
        }
        if (!canOpen && !canClose) {
          if (isSingle) {
            addReplacement(replacements, i, t.index, APOSTROPHE);
          }
          continue;
        }
        if (canClose) {
          for (j = stack.length - 1; j >= 0; j--) {
            let item = stack[j];
            if (stack[j].level < thisLevel) {
              break;
            }
            if (item.single === isSingle && stack[j].level === thisLevel) {
              item = stack[j];
              let openQuote;
              let closeQuote;
              if (isSingle) {
                openQuote = state.md.options.quotes[2];
                closeQuote = state.md.options.quotes[3];
              } else {
                openQuote = state.md.options.quotes[0];
                closeQuote = state.md.options.quotes[1];
              }
              addReplacement(replacements, i, t.index, closeQuote);
              addReplacement(replacements, item.token, item.pos, openQuote);
              stack.length = j;
              continue OUTER;
            }
          }
        }
        if (canOpen) {
          stack.push({
            token: i,
            pos: t.index,
            single: isSingle,
            level: thisLevel
          });
        } else if (canClose && isSingle) {
          addReplacement(replacements, i, t.index, APOSTROPHE);
        }
      }
  }
  Object.keys(replacements).forEach(function(tokenIdx) {
    tokens[tokenIdx].content = applyReplacements(tokens[tokenIdx].content, replacements[tokenIdx]);
  });
}
function smartquotes(state) {
  if (!state.md.options.typographer) {
    return;
  }
  for (let blkIdx = state.tokens.length - 1; blkIdx >= 0; blkIdx--) {
    if (state.tokens[blkIdx].type !== "inline" || !QUOTE_TEST_RE.test(state.tokens[blkIdx].content)) {
      continue;
    }
    process_inlines(state.tokens[blkIdx].children, state);
  }
}
function text_join(state) {
  let curr, last;
  const blockTokens = state.tokens;
  const l = blockTokens.length;
  for (let j = 0; j < l; j++) {
    if (blockTokens[j].type !== "inline") continue;
    const tokens = blockTokens[j].children;
    const max = tokens.length;
    for (curr = 0; curr < max; curr++) {
      if (tokens[curr].type === "text_special") {
        tokens[curr].type = "text";
      }
    }
    for (curr = last = 0; curr < max; curr++) {
      if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") {
        tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
      } else {
        if (curr !== last) {
          tokens[last] = tokens[curr];
        }
        last++;
      }
    }
    if (curr !== last) {
      tokens.length = last;
    }
  }
}
const _rules$2 = [
  ["normalize", normalize],
  ["block", block],
  ["inline", inline],
  ["linkify", linkify$1],
  ["replacements", replace],
  ["smartquotes", smartquotes],
  // `text_join` finds `text_special` tokens (for escape sequences)
  // and joins them with the rest of the text
  ["text_join", text_join]
];
function Core() {
  this.ruler = new Ruler();
  for (let i = 0; i < _rules$2.length; i++) {
    this.ruler.push(_rules$2[i][0], _rules$2[i][1]);
  }
}
Core.prototype.process = function(state) {
  const rules = this.ruler.getRules("");
  for (let i = 0, l = rules.length; i < l; i++) {
    rules[i](state);
  }
};
Core.prototype.State = StateCore;
function StateBlock(src, md, env, tokens) {
  this.src = src;
  this.md = md;
  this.env = env;
  this.tokens = tokens;
  this.bMarks = [];
  this.eMarks = [];
  this.tShift = [];
  this.sCount = [];
  this.bsCount = [];
  this.blkIndent = 0;
  this.line = 0;
  this.lineMax = 0;
  this.tight = false;
  this.ddIndent = -1;
  this.listIndent = -1;
  this.parentType = "root";
  this.level = 0;
  const s = this.src;
  for (let start = 0, pos = 0, indent = 0, offset = 0, len = s.length, indent_found = false; pos < len; pos++) {
    const ch = s.charCodeAt(pos);
    if (!indent_found) {
      if (isSpace(ch)) {
        indent++;
        if (ch === 9) {
          offset += 4 - offset % 4;
        } else {
          offset++;
        }
        continue;
      } else {
        indent_found = true;
      }
    }
    if (ch === 10 || pos === len - 1) {
      if (ch !== 10) {
        pos++;
      }
      this.bMarks.push(start);
      this.eMarks.push(pos);
      this.tShift.push(indent);
      this.sCount.push(offset);
      this.bsCount.push(0);
      indent_found = false;
      indent = 0;
      offset = 0;
      start = pos + 1;
    }
  }
  this.bMarks.push(s.length);
  this.eMarks.push(s.length);
  this.tShift.push(0);
  this.sCount.push(0);
  this.bsCount.push(0);
  this.lineMax = this.bMarks.length - 1;
}
StateBlock.prototype.push = function(type, tag, nesting) {
  const token = new Token(type, tag, nesting);
  token.block = true;
  if (nesting < 0) this.level--;
  token.level = this.level;
  if (nesting > 0) this.level++;
  this.tokens.push(token);
  return token;
};
StateBlock.prototype.isEmpty = function isEmpty(line) {
  return this.bMarks[line] + this.tShift[line] >= this.eMarks[line];
};
StateBlock.prototype.skipEmptyLines = function skipEmptyLines(from) {
  for (let max = this.lineMax; from < max; from++) {
    if (this.bMarks[from] + this.tShift[from] < this.eMarks[from]) {
      break;
    }
  }
  return from;
};
StateBlock.prototype.skipSpaces = function skipSpaces(pos) {
  for (let max = this.src.length; pos < max; pos++) {
    const ch = this.src.charCodeAt(pos);
    if (!isSpace(ch)) {
      break;
    }
  }
  return pos;
};
StateBlock.prototype.skipSpacesBack = function skipSpacesBack(pos, min) {
  if (pos <= min) {
    return pos;
  }
  while (pos > min) {
    if (!isSpace(this.src.charCodeAt(--pos))) {
      return pos + 1;
    }
  }
  return pos;
};
StateBlock.prototype.skipChars = function skipChars(pos, code2) {
  for (let max = this.src.length; pos < max; pos++) {
    if (this.src.charCodeAt(pos) !== code2) {
      break;
    }
  }
  return pos;
};
StateBlock.prototype.skipCharsBack = function skipCharsBack(pos, code2, min) {
  if (pos <= min) {
    return pos;
  }
  while (pos > min) {
    if (code2 !== this.src.charCodeAt(--pos)) {
      return pos + 1;
    }
  }
  return pos;
};
StateBlock.prototype.getLines = function getLines(begin, end, indent, keepLastLF) {
  if (begin >= end) {
    return "";
  }
  const queue = new Array(end - begin);
  for (let i = 0, line = begin; line < end; line++, i++) {
    let lineIndent = 0;
    const lineStart = this.bMarks[line];
    let first = lineStart;
    let last;
    if (line + 1 < end || keepLastLF) {
      last = this.eMarks[line] + 1;
    } else {
      last = this.eMarks[line];
    }
    while (first < last && lineIndent < indent) {
      const ch = this.src.charCodeAt(first);
      if (isSpace(ch)) {
        if (ch === 9) {
          lineIndent += 4 - (lineIndent + this.bsCount[line]) % 4;
        } else {
          lineIndent++;
        }
      } else if (first - lineStart < this.tShift[line]) {
        lineIndent++;
      } else {
        break;
      }
      first++;
    }
    if (lineIndent > indent) {
      queue[i] = new Array(lineIndent - indent + 1).join(" ") + this.src.slice(first, last);
    } else {
      queue[i] = this.src.slice(first, last);
    }
  }
  return queue.join("");
};
StateBlock.prototype.Token = Token;
const MAX_AUTOCOMPLETED_CELLS = 65536;
function getLine(state, line) {
  const pos = state.bMarks[line] + state.tShift[line];
  const max = state.eMarks[line];
  return state.src.slice(pos, max);
}
function escapedSplit(str) {
  const result = [];
  const max = str.length;
  let pos = 0;
  let ch = str.charCodeAt(pos);
  let isEscaped = false;
  let lastPos = 0;
  let current = "";
  while (pos < max) {
    if (ch === 124) {
      if (!isEscaped) {
        result.push(current + str.substring(lastPos, pos));
        current = "";
        lastPos = pos + 1;
      } else {
        current += str.substring(lastPos, pos - 1);
        lastPos = pos;
      }
    }
    isEscaped = ch === 92;
    pos++;
    ch = str.charCodeAt(pos);
  }
  result.push(current + str.substring(lastPos));
  return result;
}
function table(state, startLine, endLine, silent) {
  if (startLine + 2 > endLine) {
    return false;
  }
  let nextLine = startLine + 1;
  if (state.sCount[nextLine] < state.blkIndent) {
    return false;
  }
  if (state.sCount[nextLine] - state.blkIndent >= 4) {
    return false;
  }
  let pos = state.bMarks[nextLine] + state.tShift[nextLine];
  if (pos >= state.eMarks[nextLine]) {
    return false;
  }
  const firstCh = state.src.charCodeAt(pos++);
  if (firstCh !== 124 && firstCh !== 45 && firstCh !== 58) {
    return false;
  }
  if (pos >= state.eMarks[nextLine]) {
    return false;
  }
  const secondCh = state.src.charCodeAt(pos++);
  if (secondCh !== 124 && secondCh !== 45 && secondCh !== 58 && !isSpace(secondCh)) {
    return false;
  }
  if (firstCh === 45 && isSpace(secondCh)) {
    return false;
  }
  while (pos < state.eMarks[nextLine]) {
    const ch = state.src.charCodeAt(pos);
    if (ch !== 124 && ch !== 45 && ch !== 58 && !isSpace(ch)) {
      return false;
    }
    pos++;
  }
  let lineText = getLine(state, startLine + 1);
  let columns = lineText.split("|");
  const aligns = [];
  for (let i = 0; i < columns.length; i++) {
    const t = columns[i].trim();
    if (!t) {
      if (i === 0 || i === columns.length - 1) {
        continue;
      } else {
        return false;
      }
    }
    if (!/^:?-+:?$/.test(t)) {
      return false;
    }
    if (t.charCodeAt(t.length - 1) === 58) {
      aligns.push(t.charCodeAt(0) === 58 ? "center" : "right");
    } else if (t.charCodeAt(0) === 58) {
      aligns.push("left");
    } else {
      aligns.push("");
    }
  }
  lineText = getLine(state, startLine).trim();
  if (lineText.indexOf("|") === -1) {
    return false;
  }
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  columns = escapedSplit(lineText);
  if (columns.length && columns[0] === "") columns.shift();
  if (columns.length && columns[columns.length - 1] === "") columns.pop();
  const columnCount = columns.length;
  if (columnCount === 0 || columnCount !== aligns.length) {
    return false;
  }
  if (silent) {
    return true;
  }
  const oldParentType = state.parentType;
  state.parentType = "table";
  const terminatorRules = state.md.block.ruler.getRules("blockquote");
  const token_to = state.push("table_open", "table", 1);
  const tableLines = [startLine, 0];
  token_to.map = tableLines;
  const token_tho = state.push("thead_open", "thead", 1);
  token_tho.map = [startLine, startLine + 1];
  const token_htro = state.push("tr_open", "tr", 1);
  token_htro.map = [startLine, startLine + 1];
  for (let i = 0; i < columns.length; i++) {
    const token_ho = state.push("th_open", "th", 1);
    if (aligns[i]) {
      token_ho.attrs = [["style", "text-align:" + aligns[i]]];
    }
    const token_il = state.push("inline", "", 0);
    token_il.content = columns[i].trim();
    token_il.children = [];
    state.push("th_close", "th", -1);
  }
  state.push("tr_close", "tr", -1);
  state.push("thead_close", "thead", -1);
  let tbodyLines;
  let autocompletedCells = 0;
  for (nextLine = startLine + 2; nextLine < endLine; nextLine++) {
    if (state.sCount[nextLine] < state.blkIndent) {
      break;
    }
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
    lineText = getLine(state, nextLine).trim();
    if (!lineText) {
      break;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      break;
    }
    columns = escapedSplit(lineText);
    if (columns.length && columns[0] === "") columns.shift();
    if (columns.length && columns[columns.length - 1] === "") columns.pop();
    autocompletedCells += columnCount - columns.length;
    if (autocompletedCells > MAX_AUTOCOMPLETED_CELLS) {
      break;
    }
    if (nextLine === startLine + 2) {
      const token_tbo = state.push("tbody_open", "tbody", 1);
      token_tbo.map = tbodyLines = [startLine + 2, 0];
    }
    const token_tro = state.push("tr_open", "tr", 1);
    token_tro.map = [nextLine, nextLine + 1];
    for (let i = 0; i < columnCount; i++) {
      const token_tdo = state.push("td_open", "td", 1);
      if (aligns[i]) {
        token_tdo.attrs = [["style", "text-align:" + aligns[i]]];
      }
      const token_il = state.push("inline", "", 0);
      token_il.content = columns[i] ? columns[i].trim() : "";
      token_il.children = [];
      state.push("td_close", "td", -1);
    }
    state.push("tr_close", "tr", -1);
  }
  if (tbodyLines) {
    state.push("tbody_close", "tbody", -1);
    tbodyLines[1] = nextLine;
  }
  state.push("table_close", "table", -1);
  tableLines[1] = nextLine;
  state.parentType = oldParentType;
  state.line = nextLine;
  return true;
}
function code(state, startLine, endLine) {
  if (state.sCount[startLine] - state.blkIndent < 4) {
    return false;
  }
  let nextLine = startLine + 1;
  let last = nextLine;
  while (nextLine < endLine) {
    if (state.isEmpty(nextLine)) {
      nextLine++;
      continue;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      nextLine++;
      last = nextLine;
      continue;
    }
    break;
  }
  state.line = last;
  const token = state.push("code_block", "code", 0);
  token.content = state.getLines(startLine, last, 4 + state.blkIndent, false) + "\n";
  token.map = [startLine, state.line];
  return true;
}
function fence(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  if (pos + 3 > max) {
    return false;
  }
  const marker = state.src.charCodeAt(pos);
  if (marker !== 126 && marker !== 96) {
    return false;
  }
  let mem = pos;
  pos = state.skipChars(pos, marker);
  let len = pos - mem;
  if (len < 3) {
    return false;
  }
  const markup = state.src.slice(mem, pos);
  const params = state.src.slice(pos, max);
  if (marker === 96) {
    if (params.indexOf(String.fromCharCode(marker)) >= 0) {
      return false;
    }
  }
  if (silent) {
    return true;
  }
  let nextLine = startLine;
  let haveEndMarker = false;
  for (; ; ) {
    nextLine++;
    if (nextLine >= endLine) {
      break;
    }
    pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    if (pos < max && state.sCount[nextLine] < state.blkIndent) {
      break;
    }
    if (state.src.charCodeAt(pos) !== marker) {
      continue;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      continue;
    }
    pos = state.skipChars(pos, marker);
    if (pos - mem < len) {
      continue;
    }
    pos = state.skipSpaces(pos);
    if (pos < max) {
      continue;
    }
    haveEndMarker = true;
    break;
  }
  len = state.sCount[startLine];
  state.line = nextLine + (haveEndMarker ? 1 : 0);
  const token = state.push("fence", "code", 0);
  token.info = params;
  token.content = state.getLines(startLine + 1, nextLine, len, true);
  token.markup = markup;
  token.map = [startLine, state.line];
  return true;
}
function blockquote(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  const oldLineMax = state.lineMax;
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  if (state.src.charCodeAt(pos) !== 62) {
    return false;
  }
  if (silent) {
    return true;
  }
  const oldBMarks = [];
  const oldBSCount = [];
  const oldSCount = [];
  const oldTShift = [];
  const terminatorRules = state.md.block.ruler.getRules("blockquote");
  const oldParentType = state.parentType;
  state.parentType = "blockquote";
  let lastLineEmpty = false;
  let nextLine;
  for (nextLine = startLine; nextLine < endLine; nextLine++) {
    const isOutdented = state.sCount[nextLine] < state.blkIndent;
    pos = state.bMarks[nextLine] + state.tShift[nextLine];
    max = state.eMarks[nextLine];
    if (pos >= max) {
      break;
    }
    if (state.src.charCodeAt(pos++) === 62 && !isOutdented) {
      let initial = state.sCount[nextLine] + 1;
      let spaceAfterMarker;
      let adjustTab;
      if (state.src.charCodeAt(pos) === 32) {
        pos++;
        initial++;
        adjustTab = false;
        spaceAfterMarker = true;
      } else if (state.src.charCodeAt(pos) === 9) {
        spaceAfterMarker = true;
        if ((state.bsCount[nextLine] + initial) % 4 === 3) {
          pos++;
          initial++;
          adjustTab = false;
        } else {
          adjustTab = true;
        }
      } else {
        spaceAfterMarker = false;
      }
      let offset = initial;
      oldBMarks.push(state.bMarks[nextLine]);
      state.bMarks[nextLine] = pos;
      while (pos < max) {
        const ch = state.src.charCodeAt(pos);
        if (isSpace(ch)) {
          if (ch === 9) {
            offset += 4 - (offset + state.bsCount[nextLine] + (adjustTab ? 1 : 0)) % 4;
          } else {
            offset++;
          }
        } else {
          break;
        }
        pos++;
      }
      lastLineEmpty = pos >= max;
      oldBSCount.push(state.bsCount[nextLine]);
      state.bsCount[nextLine] = state.sCount[nextLine] + 1 + (spaceAfterMarker ? 1 : 0);
      oldSCount.push(state.sCount[nextLine]);
      state.sCount[nextLine] = offset - initial;
      oldTShift.push(state.tShift[nextLine]);
      state.tShift[nextLine] = pos - state.bMarks[nextLine];
      continue;
    }
    if (lastLineEmpty) {
      break;
    }
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      state.lineMax = nextLine;
      if (state.blkIndent !== 0) {
        oldBMarks.push(state.bMarks[nextLine]);
        oldBSCount.push(state.bsCount[nextLine]);
        oldTShift.push(state.tShift[nextLine]);
        oldSCount.push(state.sCount[nextLine]);
        state.sCount[nextLine] -= state.blkIndent;
      }
      break;
    }
    oldBMarks.push(state.bMarks[nextLine]);
    oldBSCount.push(state.bsCount[nextLine]);
    oldTShift.push(state.tShift[nextLine]);
    oldSCount.push(state.sCount[nextLine]);
    state.sCount[nextLine] = -1;
  }
  const oldIndent = state.blkIndent;
  state.blkIndent = 0;
  const token_o = state.push("blockquote_open", "blockquote", 1);
  token_o.markup = ">";
  const lines = [startLine, 0];
  token_o.map = lines;
  state.md.block.tokenize(state, startLine, nextLine);
  const token_c = state.push("blockquote_close", "blockquote", -1);
  token_c.markup = ">";
  state.lineMax = oldLineMax;
  state.parentType = oldParentType;
  lines[1] = state.line;
  for (let i = 0; i < oldTShift.length; i++) {
    state.bMarks[i + startLine] = oldBMarks[i];
    state.tShift[i + startLine] = oldTShift[i];
    state.sCount[i + startLine] = oldSCount[i];
    state.bsCount[i + startLine] = oldBSCount[i];
  }
  state.blkIndent = oldIndent;
  return true;
}
function hr(state, startLine, endLine, silent) {
  const max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const marker = state.src.charCodeAt(pos++);
  if (marker !== 42 && marker !== 45 && marker !== 95) {
    return false;
  }
  let cnt = 1;
  while (pos < max) {
    const ch = state.src.charCodeAt(pos++);
    if (ch !== marker && !isSpace(ch)) {
      return false;
    }
    if (ch === marker) {
      cnt++;
    }
  }
  if (cnt < 3) {
    return false;
  }
  if (silent) {
    return true;
  }
  state.line = startLine + 1;
  const token = state.push("hr", "hr", 0);
  token.map = [startLine, state.line];
  token.markup = Array(cnt + 1).join(String.fromCharCode(marker));
  return true;
}
function skipBulletListMarker(state, startLine) {
  const max = state.eMarks[startLine];
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  const marker = state.src.charCodeAt(pos++);
  if (marker !== 42 && marker !== 45 && marker !== 43) {
    return -1;
  }
  if (pos < max) {
    const ch = state.src.charCodeAt(pos);
    if (!isSpace(ch)) {
      return -1;
    }
  }
  return pos;
}
function skipOrderedListMarker(state, startLine) {
  const start = state.bMarks[startLine] + state.tShift[startLine];
  const max = state.eMarks[startLine];
  let pos = start;
  if (pos + 1 >= max) {
    return -1;
  }
  let ch = state.src.charCodeAt(pos++);
  if (ch < 48 || ch > 57) {
    return -1;
  }
  for (; ; ) {
    if (pos >= max) {
      return -1;
    }
    ch = state.src.charCodeAt(pos++);
    if (ch >= 48 && ch <= 57) {
      if (pos - start >= 10) {
        return -1;
      }
      continue;
    }
    if (ch === 41 || ch === 46) {
      break;
    }
    return -1;
  }
  if (pos < max) {
    ch = state.src.charCodeAt(pos);
    if (!isSpace(ch)) {
      return -1;
    }
  }
  return pos;
}
function markTightParagraphs(state, idx) {
  const level = state.level + 2;
  for (let i = idx + 2, l = state.tokens.length - 2; i < l; i++) {
    if (state.tokens[i].level === level && state.tokens[i].type === "paragraph_open") {
      state.tokens[i + 2].hidden = true;
      state.tokens[i].hidden = true;
      i += 2;
    }
  }
}
function list(state, startLine, endLine, silent) {
  let max, pos, start, token;
  let nextLine = startLine;
  let tight = true;
  if (state.sCount[nextLine] - state.blkIndent >= 4) {
    return false;
  }
  if (state.listIndent >= 0 && state.sCount[nextLine] - state.listIndent >= 4 && state.sCount[nextLine] < state.blkIndent) {
    return false;
  }
  let isTerminatingParagraph = false;
  if (silent && state.parentType === "paragraph") {
    if (state.sCount[nextLine] >= state.blkIndent) {
      isTerminatingParagraph = true;
    }
  }
  let isOrdered;
  let markerValue;
  let posAfterMarker;
  if ((posAfterMarker = skipOrderedListMarker(state, nextLine)) >= 0) {
    isOrdered = true;
    start = state.bMarks[nextLine] + state.tShift[nextLine];
    markerValue = Number(state.src.slice(start, posAfterMarker - 1));
    if (isTerminatingParagraph && markerValue !== 1) return false;
  } else if ((posAfterMarker = skipBulletListMarker(state, nextLine)) >= 0) {
    isOrdered = false;
  } else {
    return false;
  }
  if (isTerminatingParagraph) {
    if (state.skipSpaces(posAfterMarker) >= state.eMarks[nextLine]) return false;
  }
  if (silent) {
    return true;
  }
  const markerCharCode = state.src.charCodeAt(posAfterMarker - 1);
  const listTokIdx = state.tokens.length;
  if (isOrdered) {
    token = state.push("ordered_list_open", "ol", 1);
    if (markerValue !== 1) {
      token.attrs = [["start", markerValue]];
    }
  } else {
    token = state.push("bullet_list_open", "ul", 1);
  }
  const listLines = [nextLine, 0];
  token.map = listLines;
  token.markup = String.fromCharCode(markerCharCode);
  let prevEmptyEnd = false;
  const terminatorRules = state.md.block.ruler.getRules("list");
  const oldParentType = state.parentType;
  state.parentType = "list";
  while (nextLine < endLine) {
    pos = posAfterMarker;
    max = state.eMarks[nextLine];
    const initial = state.sCount[nextLine] + posAfterMarker - (state.bMarks[nextLine] + state.tShift[nextLine]);
    let offset = initial;
    while (pos < max) {
      const ch = state.src.charCodeAt(pos);
      if (ch === 9) {
        offset += 4 - (offset + state.bsCount[nextLine]) % 4;
      } else if (ch === 32) {
        offset++;
      } else {
        break;
      }
      pos++;
    }
    const contentStart = pos;
    let indentAfterMarker;
    if (contentStart >= max) {
      indentAfterMarker = 1;
    } else {
      indentAfterMarker = offset - initial;
    }
    if (indentAfterMarker > 4) {
      indentAfterMarker = 1;
    }
    const indent = initial + indentAfterMarker;
    token = state.push("list_item_open", "li", 1);
    token.markup = String.fromCharCode(markerCharCode);
    const itemLines = [nextLine, 0];
    token.map = itemLines;
    if (isOrdered) {
      token.info = state.src.slice(start, posAfterMarker - 1);
    }
    const oldTight = state.tight;
    const oldTShift = state.tShift[nextLine];
    const oldSCount = state.sCount[nextLine];
    const oldListIndent = state.listIndent;
    state.listIndent = state.blkIndent;
    state.blkIndent = indent;
    state.tight = true;
    state.tShift[nextLine] = contentStart - state.bMarks[nextLine];
    state.sCount[nextLine] = offset;
    if (contentStart >= max && state.isEmpty(nextLine + 1)) {
      state.line = Math.min(state.line + 2, endLine);
    } else {
      state.md.block.tokenize(state, nextLine, endLine, true);
    }
    if (!state.tight || prevEmptyEnd) {
      tight = false;
    }
    prevEmptyEnd = state.line - nextLine > 1 && state.isEmpty(state.line - 1);
    state.blkIndent = state.listIndent;
    state.listIndent = oldListIndent;
    state.tShift[nextLine] = oldTShift;
    state.sCount[nextLine] = oldSCount;
    state.tight = oldTight;
    token = state.push("list_item_close", "li", -1);
    token.markup = String.fromCharCode(markerCharCode);
    nextLine = state.line;
    itemLines[1] = nextLine;
    if (nextLine >= endLine) {
      break;
    }
    if (state.sCount[nextLine] < state.blkIndent) {
      break;
    }
    if (state.sCount[nextLine] - state.blkIndent >= 4) {
      break;
    }
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
    if (isOrdered) {
      posAfterMarker = skipOrderedListMarker(state, nextLine);
      if (posAfterMarker < 0) {
        break;
      }
      start = state.bMarks[nextLine] + state.tShift[nextLine];
    } else {
      posAfterMarker = skipBulletListMarker(state, nextLine);
      if (posAfterMarker < 0) {
        break;
      }
    }
    if (markerCharCode !== state.src.charCodeAt(posAfterMarker - 1)) {
      break;
    }
  }
  if (isOrdered) {
    token = state.push("ordered_list_close", "ol", -1);
  } else {
    token = state.push("bullet_list_close", "ul", -1);
  }
  token.markup = String.fromCharCode(markerCharCode);
  listLines[1] = nextLine;
  state.line = nextLine;
  state.parentType = oldParentType;
  if (tight) {
    markTightParagraphs(state, listTokIdx);
  }
  return true;
}
function reference(state, startLine, _endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  let nextLine = startLine + 1;
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  if (state.src.charCodeAt(pos) !== 91) {
    return false;
  }
  function getNextLine(nextLine2) {
    const endLine = state.lineMax;
    if (nextLine2 >= endLine || state.isEmpty(nextLine2)) {
      return null;
    }
    let isContinuation = false;
    if (state.sCount[nextLine2] - state.blkIndent > 3) {
      isContinuation = true;
    }
    if (state.sCount[nextLine2] < 0) {
      isContinuation = true;
    }
    if (!isContinuation) {
      const terminatorRules = state.md.block.ruler.getRules("reference");
      const oldParentType = state.parentType;
      state.parentType = "reference";
      let terminate = false;
      for (let i = 0, l = terminatorRules.length; i < l; i++) {
        if (terminatorRules[i](state, nextLine2, endLine, true)) {
          terminate = true;
          break;
        }
      }
      state.parentType = oldParentType;
      if (terminate) {
        return null;
      }
    }
    const pos2 = state.bMarks[nextLine2] + state.tShift[nextLine2];
    const max2 = state.eMarks[nextLine2];
    return state.src.slice(pos2, max2 + 1);
  }
  let str = state.src.slice(pos, max + 1);
  max = str.length;
  let labelEnd = -1;
  for (pos = 1; pos < max; pos++) {
    const ch = str.charCodeAt(pos);
    if (ch === 91) {
      return false;
    } else if (ch === 93) {
      labelEnd = pos;
      break;
    } else if (ch === 10) {
      const lineContent = getNextLine(nextLine);
      if (lineContent !== null) {
        str += lineContent;
        max = str.length;
        nextLine++;
      }
    } else if (ch === 92) {
      pos++;
      if (pos < max && str.charCodeAt(pos) === 10) {
        const lineContent = getNextLine(nextLine);
        if (lineContent !== null) {
          str += lineContent;
          max = str.length;
          nextLine++;
        }
      }
    }
  }
  if (labelEnd < 0 || str.charCodeAt(labelEnd + 1) !== 58) {
    return false;
  }
  for (pos = labelEnd + 2; pos < max; pos++) {
    const ch = str.charCodeAt(pos);
    if (ch === 10) {
      const lineContent = getNextLine(nextLine);
      if (lineContent !== null) {
        str += lineContent;
        max = str.length;
        nextLine++;
      }
    } else if (isSpace(ch)) ;
    else {
      break;
    }
  }
  const destRes = state.md.helpers.parseLinkDestination(str, pos, max);
  if (!destRes.ok) {
    return false;
  }
  const href = state.md.normalizeLink(destRes.str);
  if (!state.md.validateLink(href)) {
    return false;
  }
  pos = destRes.pos;
  const destEndPos = pos;
  const destEndLineNo = nextLine;
  const start = pos;
  for (; pos < max; pos++) {
    const ch = str.charCodeAt(pos);
    if (ch === 10) {
      const lineContent = getNextLine(nextLine);
      if (lineContent !== null) {
        str += lineContent;
        max = str.length;
        nextLine++;
      }
    } else if (isSpace(ch)) ;
    else {
      break;
    }
  }
  let titleRes = state.md.helpers.parseLinkTitle(str, pos, max);
  while (titleRes.can_continue) {
    const lineContent = getNextLine(nextLine);
    if (lineContent === null) break;
    str += lineContent;
    pos = max;
    max = str.length;
    nextLine++;
    titleRes = state.md.helpers.parseLinkTitle(str, pos, max, titleRes);
  }
  let title;
  if (pos < max && start !== pos && titleRes.ok) {
    title = titleRes.str;
    pos = titleRes.pos;
  } else {
    title = "";
    pos = destEndPos;
    nextLine = destEndLineNo;
  }
  while (pos < max) {
    const ch = str.charCodeAt(pos);
    if (!isSpace(ch)) {
      break;
    }
    pos++;
  }
  if (pos < max && str.charCodeAt(pos) !== 10) {
    if (title) {
      title = "";
      pos = destEndPos;
      nextLine = destEndLineNo;
      while (pos < max) {
        const ch = str.charCodeAt(pos);
        if (!isSpace(ch)) {
          break;
        }
        pos++;
      }
    }
  }
  if (pos < max && str.charCodeAt(pos) !== 10) {
    return false;
  }
  const label = normalizeReference(str.slice(1, labelEnd));
  if (!label) {
    return false;
  }
  if (silent) {
    return true;
  }
  if (typeof state.env.references === "undefined") {
    state.env.references = {};
  }
  if (typeof state.env.references[label] === "undefined") {
    state.env.references[label] = { title, href };
  }
  state.line = nextLine;
  return true;
}
const block_names = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
];
const attr_name = "[a-zA-Z_:][a-zA-Z0-9:._-]*";
const unquoted = "[^\"'=<>`\\x00-\\x20]+";
const single_quoted = "'[^']*'";
const double_quoted = '"[^"]*"';
const attr_value = "(?:" + unquoted + "|" + single_quoted + "|" + double_quoted + ")";
const attribute = "(?:\\s+" + attr_name + "(?:\\s*=\\s*" + attr_value + ")?)";
const open_tag = "<[A-Za-z][A-Za-z0-9\\-]*" + attribute + "*\\s*\\/?>";
const close_tag = "<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>";
const comment = "<!---?>|<!--(?:[^-]|-[^-]|--[^>])*-->";
const processing = "<[?][\\s\\S]*?[?]>";
const declaration = "<![A-Za-z][^>]*>";
const cdata = "<!\\[CDATA\\[[\\s\\S]*?\\]\\]>";
const HTML_TAG_RE = new RegExp("^(?:" + open_tag + "|" + close_tag + "|" + comment + "|" + processing + "|" + declaration + "|" + cdata + ")");
const HTML_OPEN_CLOSE_TAG_RE = new RegExp("^(?:" + open_tag + "|" + close_tag + ")");
const HTML_SEQUENCES = [
  [/^<(script|pre|style|textarea)(?=(\s|>|$))/i, /<\/(script|pre|style|textarea)>/i, true],
  [/^<!--/, /-->/, true],
  [/^<\?/, /\?>/, true],
  [/^<![A-Z]/, />/, true],
  [/^<!\[CDATA\[/, /\]\]>/, true],
  [new RegExp("^</?(" + block_names.join("|") + ")(?=(\\s|/?>|$))", "i"), /^$/, true],
  [new RegExp(HTML_OPEN_CLOSE_TAG_RE.source + "\\s*$"), /^$/, false]
];
function html_block(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  if (!state.md.options.html) {
    return false;
  }
  if (state.src.charCodeAt(pos) !== 60) {
    return false;
  }
  let lineText = state.src.slice(pos, max);
  let i = 0;
  for (; i < HTML_SEQUENCES.length; i++) {
    if (HTML_SEQUENCES[i][0].test(lineText)) {
      break;
    }
  }
  if (i === HTML_SEQUENCES.length) {
    return false;
  }
  if (silent) {
    return HTML_SEQUENCES[i][2];
  }
  let nextLine = startLine + 1;
  const endsOnBlankLine = HTML_SEQUENCES[i][1].test("");
  if (!HTML_SEQUENCES[i][1].test(lineText)) {
    for (; nextLine < endLine; nextLine++) {
      if (state.sCount[nextLine] < state.blkIndent) {
        if (endsOnBlankLine || !state.isEmpty(nextLine)) {
          break;
        }
      }
      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];
      lineText = state.src.slice(pos, max);
      if (HTML_SEQUENCES[i][1].test(lineText)) {
        if (lineText.length !== 0) {
          nextLine++;
        }
        break;
      }
    }
  }
  state.line = nextLine;
  const token = state.push("html_block", "", 0);
  token.map = [startLine, nextLine];
  token.content = state.getLines(startLine, nextLine, state.blkIndent, true);
  return true;
}
function heading(state, startLine, endLine, silent) {
  let pos = state.bMarks[startLine] + state.tShift[startLine];
  let max = state.eMarks[startLine];
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  let ch = state.src.charCodeAt(pos);
  if (ch !== 35 || pos >= max) {
    return false;
  }
  let level = 1;
  ch = state.src.charCodeAt(++pos);
  while (ch === 35 && pos < max && level <= 6) {
    level++;
    ch = state.src.charCodeAt(++pos);
  }
  if (level > 6 || pos < max && !isSpace(ch)) {
    return false;
  }
  if (silent) {
    return true;
  }
  max = state.skipSpacesBack(max, pos);
  const tmp = state.skipCharsBack(max, 35, pos);
  if (tmp > pos && isSpace(state.src.charCodeAt(tmp - 1))) {
    max = tmp;
  }
  state.line = startLine + 1;
  const token_o = state.push("heading_open", "h" + String(level), 1);
  token_o.markup = "########".slice(0, level);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = asciiTrim(state.src.slice(pos, max));
  token_i.map = [startLine, state.line];
  token_i.children = [];
  const token_c = state.push("heading_close", "h" + String(level), -1);
  token_c.markup = "########".slice(0, level);
  return true;
}
function lheading(state, startLine, endLine) {
  const terminatorRules = state.md.block.ruler.getRules("paragraph");
  if (state.sCount[startLine] - state.blkIndent >= 4) {
    return false;
  }
  const oldParentType = state.parentType;
  state.parentType = "paragraph";
  let level = 0;
  let marker;
  let nextLine = startLine + 1;
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    if (state.sCount[nextLine] - state.blkIndent > 3) {
      continue;
    }
    if (state.sCount[nextLine] >= state.blkIndent) {
      let pos = state.bMarks[nextLine] + state.tShift[nextLine];
      const max = state.eMarks[nextLine];
      if (pos < max) {
        marker = state.src.charCodeAt(pos);
        if (marker === 45 || marker === 61) {
          pos = state.skipChars(pos, marker);
          pos = state.skipSpaces(pos);
          if (pos >= max) {
            level = marker === 61 ? 1 : 2;
            break;
          }
        }
      }
    }
    if (state.sCount[nextLine] < 0) {
      continue;
    }
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
  }
  if (!level) {
    state.parentType = oldParentType;
    return false;
  }
  const content = asciiTrim(state.getLines(startLine, nextLine, state.blkIndent, false));
  state.line = nextLine + 1;
  const token_o = state.push("heading_open", "h" + String(level), 1);
  token_o.markup = String.fromCharCode(marker);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = content;
  token_i.map = [startLine, state.line - 1];
  token_i.children = [];
  const token_c = state.push("heading_close", "h" + String(level), -1);
  token_c.markup = String.fromCharCode(marker);
  state.parentType = oldParentType;
  return true;
}
function paragraph(state, startLine, endLine) {
  const terminatorRules = state.md.block.ruler.getRules("paragraph");
  const oldParentType = state.parentType;
  let nextLine = startLine + 1;
  state.parentType = "paragraph";
  for (; nextLine < endLine && !state.isEmpty(nextLine); nextLine++) {
    if (state.sCount[nextLine] - state.blkIndent > 3) {
      continue;
    }
    if (state.sCount[nextLine] < 0) {
      continue;
    }
    let terminate = false;
    for (let i = 0, l = terminatorRules.length; i < l; i++) {
      if (terminatorRules[i](state, nextLine, endLine, true)) {
        terminate = true;
        break;
      }
    }
    if (terminate) {
      break;
    }
  }
  const content = asciiTrim(state.getLines(startLine, nextLine, state.blkIndent, false));
  state.line = nextLine;
  const token_o = state.push("paragraph_open", "p", 1);
  token_o.map = [startLine, state.line];
  const token_i = state.push("inline", "", 0);
  token_i.content = content;
  token_i.map = [startLine, state.line];
  token_i.children = [];
  state.push("paragraph_close", "p", -1);
  state.parentType = oldParentType;
  return true;
}
const _rules$1 = [
  // First 2 params - rule name & source. Secondary array - list of rules,
  // which can be terminated by this one.
  ["table", table, ["paragraph", "reference"]],
  ["code", code],
  ["fence", fence, ["paragraph", "reference", "blockquote", "list"]],
  ["blockquote", blockquote, ["paragraph", "reference", "blockquote", "list"]],
  ["hr", hr, ["paragraph", "reference", "blockquote", "list"]],
  ["list", list, ["paragraph", "reference", "blockquote"]],
  ["reference", reference],
  ["html_block", html_block, ["paragraph", "reference", "blockquote"]],
  ["heading", heading, ["paragraph", "reference", "blockquote"]],
  ["lheading", lheading],
  ["paragraph", paragraph]
];
function ParserBlock() {
  this.ruler = new Ruler();
  for (let i = 0; i < _rules$1.length; i++) {
    this.ruler.push(_rules$1[i][0], _rules$1[i][1], { alt: (_rules$1[i][2] || []).slice() });
  }
}
ParserBlock.prototype.tokenize = function(state, startLine, endLine) {
  const rules = this.ruler.getRules("");
  const len = rules.length;
  const maxNesting = state.md.options.maxNesting;
  let line = startLine;
  let hasEmptyLines = false;
  while (line < endLine) {
    state.line = line = state.skipEmptyLines(line);
    if (line >= endLine) {
      break;
    }
    if (state.sCount[line] < state.blkIndent) {
      break;
    }
    if (state.level >= maxNesting) {
      state.line = endLine;
      break;
    }
    const prevLine = state.line;
    let ok = false;
    for (let i = 0; i < len; i++) {
      ok = rules[i](state, line, endLine, false);
      if (ok) {
        if (prevLine >= state.line) {
          throw new Error("block rule didn't increment state.line");
        }
        break;
      }
    }
    if (!ok) throw new Error("none of the block rules matched");
    state.tight = !hasEmptyLines;
    if (state.isEmpty(state.line - 1)) {
      hasEmptyLines = true;
    }
    line = state.line;
    if (line < endLine && state.isEmpty(line)) {
      hasEmptyLines = true;
      line++;
      state.line = line;
    }
  }
};
ParserBlock.prototype.parse = function(src, md, env, outTokens) {
  if (!src) {
    return;
  }
  const state = new this.State(src, md, env, outTokens);
  this.tokenize(state, state.line, state.lineMax);
};
ParserBlock.prototype.State = StateBlock;
function StateInline(src, md, env, outTokens) {
  this.src = src;
  this.env = env;
  this.md = md;
  this.tokens = outTokens;
  this.tokens_meta = Array(outTokens.length);
  this.pos = 0;
  this.posMax = this.src.length;
  this.level = 0;
  this.pending = "";
  this.pendingLevel = 0;
  this.cache = {};
  this.delimiters = [];
  this._prev_delimiters = [];
  this.backticks = {};
  this.backticksScanned = false;
  this.linkLevel = 0;
}
StateInline.prototype.pushPending = function() {
  const token = new Token("text", "", 0);
  token.content = this.pending;
  token.level = this.pendingLevel;
  this.tokens.push(token);
  this.pending = "";
  return token;
};
StateInline.prototype.push = function(type, tag, nesting) {
  if (this.pending) {
    this.pushPending();
  }
  const token = new Token(type, tag, nesting);
  let token_meta = null;
  if (nesting < 0) {
    this.level--;
    this.delimiters = this._prev_delimiters.pop();
  }
  token.level = this.level;
  if (nesting > 0) {
    this.level++;
    this._prev_delimiters.push(this.delimiters);
    this.delimiters = [];
    token_meta = { delimiters: this.delimiters };
  }
  this.pendingLevel = this.level;
  this.tokens.push(token);
  this.tokens_meta.push(token_meta);
  return token;
};
StateInline.prototype.scanDelims = function(start, canSplitWord) {
  const max = this.posMax;
  const marker = this.src.charCodeAt(start);
  let lastChar;
  if (start === 0) {
    lastChar = 32;
  } else if (start === 1) {
    lastChar = this.src.charCodeAt(0);
    if ((lastChar & 63488) === 55296) {
      lastChar = 65533;
    }
  } else {
    lastChar = this.src.charCodeAt(start - 1);
    if ((lastChar & 64512) === 56320) {
      const highSurr = this.src.charCodeAt(start - 2);
      lastChar = (highSurr & 64512) === 55296 ? 65536 + (highSurr - 55296 << 10) + (lastChar - 56320) : 65533;
    } else if ((lastChar & 64512) === 55296) {
      lastChar = 65533;
    }
  }
  let pos = start;
  while (pos < max && this.src.charCodeAt(pos) === marker) {
    pos++;
  }
  const count = pos - start;
  let nextChar = pos < max ? this.src.charCodeAt(pos) : 32;
  if ((nextChar & 64512) === 55296) {
    const lowSurr = this.src.charCodeAt(pos + 1);
    nextChar = (lowSurr & 64512) === 56320 ? 65536 + (nextChar - 55296 << 10) + (lowSurr - 56320) : 65533;
  } else if ((nextChar & 64512) === 56320) {
    nextChar = 65533;
  }
  const isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctCharCode(lastChar);
  const isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctCharCode(nextChar);
  const isLastWhiteSpace = isWhiteSpace(lastChar);
  const isNextWhiteSpace = isWhiteSpace(nextChar);
  const left_flanking = !isNextWhiteSpace && (!isNextPunctChar || isLastWhiteSpace || isLastPunctChar);
  const right_flanking = !isLastWhiteSpace && (!isLastPunctChar || isNextWhiteSpace || isNextPunctChar);
  const can_open = left_flanking && (canSplitWord || !right_flanking || isLastPunctChar);
  const can_close = right_flanking && (canSplitWord || !left_flanking || isNextPunctChar);
  return { can_open, can_close, length: count };
};
StateInline.prototype.Token = Token;
function isTerminatorChar(ch) {
  switch (ch) {
    case 10:
    case 33:
    case 35:
    case 36:
    case 37:
    case 38:
    case 42:
    case 43:
    case 45:
    case 58:
    case 60:
    case 61:
    case 62:
    case 64:
    case 91:
    case 92:
    case 93:
    case 94:
    case 95:
    case 96:
    case 123:
    case 125:
    case 126:
      return true;
    default:
      return false;
  }
}
function text(state, silent) {
  let pos = state.pos;
  while (pos < state.posMax && !isTerminatorChar(state.src.charCodeAt(pos))) {
    pos++;
  }
  if (pos === state.pos) {
    return false;
  }
  if (!silent) {
    state.pending += state.src.slice(state.pos, pos);
  }
  state.pos = pos;
  return true;
}
const SCHEME_RE = /(?:^|[^a-z0-9.+-])([a-z][a-z0-9.+-]*)$/i;
function linkify(state, silent) {
  if (!state.md.options.linkify) return false;
  if (state.linkLevel > 0) return false;
  const pos = state.pos;
  const max = state.posMax;
  if (pos + 3 > max) return false;
  if (state.src.charCodeAt(pos) !== 58) return false;
  if (state.src.charCodeAt(pos + 1) !== 47) return false;
  if (state.src.charCodeAt(pos + 2) !== 47) return false;
  const match2 = state.pending.match(SCHEME_RE);
  if (!match2) return false;
  const proto = match2[1];
  const link2 = state.md.linkify.matchAtStart(state.src.slice(pos - proto.length));
  if (!link2) return false;
  let url = link2.url;
  if (url.length <= proto.length) return false;
  let urlEnd = url.length;
  while (urlEnd > 0 && url.charCodeAt(urlEnd - 1) === 42) {
    urlEnd--;
  }
  if (urlEnd !== url.length) {
    url = url.slice(0, urlEnd);
  }
  const fullUrl = state.md.normalizeLink(url);
  if (!state.md.validateLink(fullUrl)) return false;
  if (!silent) {
    state.pending = state.pending.slice(0, -proto.length);
    const token_o = state.push("link_open", "a", 1);
    token_o.attrs = [["href", fullUrl]];
    token_o.markup = "linkify";
    token_o.info = "auto";
    const token_t = state.push("text", "", 0);
    token_t.content = state.md.normalizeLinkText(url);
    const token_c = state.push("link_close", "a", -1);
    token_c.markup = "linkify";
    token_c.info = "auto";
  }
  state.pos += url.length - proto.length;
  return true;
}
function newline(state, silent) {
  let pos = state.pos;
  if (state.src.charCodeAt(pos) !== 10) {
    return false;
  }
  const pmax = state.pending.length - 1;
  const max = state.posMax;
  if (!silent) {
    if (pmax >= 0 && state.pending.charCodeAt(pmax) === 32) {
      if (pmax >= 1 && state.pending.charCodeAt(pmax - 1) === 32) {
        let ws = pmax - 1;
        while (ws >= 1 && state.pending.charCodeAt(ws - 1) === 32) ws--;
        state.pending = state.pending.slice(0, ws);
        state.push("hardbreak", "br", 0);
      } else {
        state.pending = state.pending.slice(0, -1);
        state.push("softbreak", "br", 0);
      }
    } else {
      state.push("softbreak", "br", 0);
    }
  }
  pos++;
  while (pos < max && isSpace(state.src.charCodeAt(pos))) {
    pos++;
  }
  state.pos = pos;
  return true;
}
const ESCAPED = [];
for (let i = 0; i < 256; i++) {
  ESCAPED.push(0);
}
"\\!\"#$%&'()*+,./:;<=>?@[]^_`{|}~-".split("").forEach(function(ch) {
  ESCAPED[ch.charCodeAt(0)] = 1;
});
function escape(state, silent) {
  let pos = state.pos;
  const max = state.posMax;
  if (state.src.charCodeAt(pos) !== 92) return false;
  pos++;
  if (pos >= max) return false;
  let ch1 = state.src.charCodeAt(pos);
  if (ch1 === 10) {
    if (!silent) {
      state.push("hardbreak", "br", 0);
    }
    pos++;
    while (pos < max) {
      ch1 = state.src.charCodeAt(pos);
      if (!isSpace(ch1)) break;
      pos++;
    }
    state.pos = pos;
    return true;
  }
  let escapedStr = state.src[pos];
  if (ch1 >= 55296 && ch1 <= 56319 && pos + 1 < max) {
    const ch2 = state.src.charCodeAt(pos + 1);
    if (ch2 >= 56320 && ch2 <= 57343) {
      escapedStr += state.src[pos + 1];
      pos++;
    }
  }
  const origStr = "\\" + escapedStr;
  if (!silent) {
    const token = state.push("text_special", "", 0);
    if (ch1 < 256 && ESCAPED[ch1] !== 0) {
      token.content = escapedStr;
    } else {
      token.content = origStr;
    }
    token.markup = origStr;
    token.info = "escape";
  }
  state.pos = pos + 1;
  return true;
}
function backtick(state, silent) {
  let pos = state.pos;
  const ch = state.src.charCodeAt(pos);
  if (ch !== 96) {
    return false;
  }
  const start = pos;
  pos++;
  const max = state.posMax;
  while (pos < max && state.src.charCodeAt(pos) === 96) {
    pos++;
  }
  const marker = state.src.slice(start, pos);
  const openerLength = marker.length;
  if (state.backticksScanned && (state.backticks[openerLength] || 0) <= start) {
    if (!silent) state.pending += marker;
    state.pos += openerLength;
    return true;
  }
  let matchEnd = pos;
  let matchStart;
  while ((matchStart = state.src.indexOf("`", matchEnd)) !== -1) {
    matchEnd = matchStart + 1;
    while (matchEnd < max && state.src.charCodeAt(matchEnd) === 96) {
      matchEnd++;
    }
    const closerLength = matchEnd - matchStart;
    if (closerLength === openerLength) {
      if (!silent) {
        const token = state.push("code_inline", "code", 0);
        token.markup = marker;
        token.content = state.src.slice(pos, matchStart).replace(/\n/g, " ").replace(/^ (.+) $/, "$1");
      }
      state.pos = matchEnd;
      return true;
    }
    state.backticks[closerLength] = matchStart;
  }
  state.backticksScanned = true;
  if (!silent) state.pending += marker;
  state.pos += openerLength;
  return true;
}
function strikethrough_tokenize(state, silent) {
  const start = state.pos;
  const marker = state.src.charCodeAt(start);
  if (silent) {
    return false;
  }
  if (marker !== 126) {
    return false;
  }
  const scanned = state.scanDelims(state.pos, true);
  let len = scanned.length;
  const ch = String.fromCharCode(marker);
  if (len < 2) {
    return false;
  }
  let token;
  if (len % 2) {
    token = state.push("text", "", 0);
    token.content = ch;
    len--;
  }
  for (let i = 0; i < len; i += 2) {
    token = state.push("text", "", 0);
    token.content = ch + ch;
    state.delimiters.push({
      marker,
      length: 0,
      // disable "rule of 3" length checks meant for emphasis
      token: state.tokens.length - 1,
      end: -1,
      open: scanned.can_open,
      close: scanned.can_close
    });
  }
  state.pos += scanned.length;
  return true;
}
function postProcess$1(state, delimiters) {
  let token;
  const loneMarkers = [];
  const max = delimiters.length;
  for (let i = 0; i < max; i++) {
    const startDelim = delimiters[i];
    if (startDelim.marker !== 126) {
      continue;
    }
    if (startDelim.end === -1) {
      continue;
    }
    const endDelim = delimiters[startDelim.end];
    token = state.tokens[startDelim.token];
    token.type = "s_open";
    token.tag = "s";
    token.nesting = 1;
    token.markup = "~~";
    token.content = "";
    token = state.tokens[endDelim.token];
    token.type = "s_close";
    token.tag = "s";
    token.nesting = -1;
    token.markup = "~~";
    token.content = "";
    if (state.tokens[endDelim.token - 1].type === "text" && state.tokens[endDelim.token - 1].content === "~") {
      loneMarkers.push(endDelim.token - 1);
    }
  }
  while (loneMarkers.length) {
    const i = loneMarkers.pop();
    let j = i + 1;
    while (j < state.tokens.length && state.tokens[j].type === "s_close") {
      j++;
    }
    j--;
    if (i !== j) {
      token = state.tokens[j];
      state.tokens[j] = state.tokens[i];
      state.tokens[i] = token;
    }
  }
}
function strikethrough_postProcess(state) {
  const tokens_meta = state.tokens_meta;
  const max = state.tokens_meta.length;
  postProcess$1(state, state.delimiters);
  for (let curr = 0; curr < max; curr++) {
    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
      postProcess$1(state, tokens_meta[curr].delimiters);
    }
  }
}
const r_strikethrough = {
  tokenize: strikethrough_tokenize,
  postProcess: strikethrough_postProcess
};
function emphasis_tokenize(state, silent) {
  const start = state.pos;
  const marker = state.src.charCodeAt(start);
  if (silent) {
    return false;
  }
  if (marker !== 95 && marker !== 42) {
    return false;
  }
  const scanned = state.scanDelims(state.pos, marker === 42);
  for (let i = 0; i < scanned.length; i++) {
    const token = state.push("text", "", 0);
    token.content = String.fromCharCode(marker);
    state.delimiters.push({
      // Char code of the starting marker (number).
      //
      marker,
      // Total length of these series of delimiters.
      //
      length: scanned.length,
      // A position of the token this delimiter corresponds to.
      //
      token: state.tokens.length - 1,
      // If this delimiter is matched as a valid opener, `end` will be
      // equal to its position, otherwise it's `-1`.
      //
      end: -1,
      // Boolean flags that determine if this delimiter could open or close
      // an emphasis.
      //
      open: scanned.can_open,
      close: scanned.can_close
    });
  }
  state.pos += scanned.length;
  return true;
}
function postProcess(state, delimiters) {
  const max = delimiters.length;
  for (let i = max - 1; i >= 0; i--) {
    const startDelim = delimiters[i];
    if (startDelim.marker !== 95 && startDelim.marker !== 42) {
      continue;
    }
    if (startDelim.end === -1) {
      continue;
    }
    const endDelim = delimiters[startDelim.end];
    const isStrong = i > 0 && delimiters[i - 1].end === startDelim.end + 1 && // check that first two markers match and adjacent
    delimiters[i - 1].marker === startDelim.marker && delimiters[i - 1].token === startDelim.token - 1 && // check that last two markers are adjacent (we can safely assume they match)
    delimiters[startDelim.end + 1].token === endDelim.token + 1;
    const ch = String.fromCharCode(startDelim.marker);
    const token_o = state.tokens[startDelim.token];
    token_o.type = isStrong ? "strong_open" : "em_open";
    token_o.tag = isStrong ? "strong" : "em";
    token_o.nesting = 1;
    token_o.markup = isStrong ? ch + ch : ch;
    token_o.content = "";
    const token_c = state.tokens[endDelim.token];
    token_c.type = isStrong ? "strong_close" : "em_close";
    token_c.tag = isStrong ? "strong" : "em";
    token_c.nesting = -1;
    token_c.markup = isStrong ? ch + ch : ch;
    token_c.content = "";
    if (isStrong) {
      state.tokens[delimiters[i - 1].token].content = "";
      state.tokens[delimiters[startDelim.end + 1].token].content = "";
      i--;
    }
  }
}
function emphasis_post_process(state) {
  const tokens_meta = state.tokens_meta;
  const max = state.tokens_meta.length;
  postProcess(state, state.delimiters);
  for (let curr = 0; curr < max; curr++) {
    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
      postProcess(state, tokens_meta[curr].delimiters);
    }
  }
}
const r_emphasis = {
  tokenize: emphasis_tokenize,
  postProcess: emphasis_post_process
};
function link(state, silent) {
  let code2, label, res, ref;
  let href = "";
  let title = "";
  let start = state.pos;
  let parseReference = true;
  if (state.src.charCodeAt(state.pos) !== 91) {
    return false;
  }
  const oldPos = state.pos;
  const max = state.posMax;
  const labelStart = state.pos + 1;
  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos, true);
  if (labelEnd < 0) {
    return false;
  }
  let pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 40) {
    parseReference = false;
    pos++;
    for (; pos < max; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) {
        break;
      }
    }
    if (pos >= max) {
      return false;
    }
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) {
        pos = res.pos;
      } else {
        href = "";
      }
      start = pos;
      for (; pos < max; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (!isSpace(code2) && code2 !== 10) {
          break;
        }
      }
      res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
      if (pos < max && start !== pos && res.ok) {
        title = res.str;
        pos = res.pos;
        for (; pos < max; pos++) {
          code2 = state.src.charCodeAt(pos);
          if (!isSpace(code2) && code2 !== 10) {
            break;
          }
        }
      }
    }
    if (pos >= max || state.src.charCodeAt(pos) !== 41) {
      parseReference = true;
    }
    pos++;
  }
  if (parseReference) {
    if (typeof state.env.references === "undefined") {
      return false;
    }
    if (pos < max && state.src.charCodeAt(pos) === 91) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }
    if (!label) {
      label = state.src.slice(labelStart, labelEnd);
    }
    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }
  if (!silent) {
    state.pos = labelStart;
    state.posMax = labelEnd;
    const token_o = state.push("link_open", "a", 1);
    const attrs = [["href", href]];
    token_o.attrs = attrs;
    if (title) {
      attrs.push(["title", title]);
    }
    state.linkLevel++;
    state.md.inline.tokenize(state);
    state.linkLevel--;
    state.push("link_close", "a", -1);
  }
  state.pos = pos;
  state.posMax = max;
  return true;
}
function image(state, silent) {
  let code2, content, label, pos, ref, res, title, start;
  let href = "";
  const oldPos = state.pos;
  const max = state.posMax;
  if (state.src.charCodeAt(state.pos) !== 33) {
    return false;
  }
  if (state.src.charCodeAt(state.pos + 1) !== 91) {
    return false;
  }
  const labelStart = state.pos + 2;
  const labelEnd = state.md.helpers.parseLinkLabel(state, state.pos + 1, false);
  if (labelEnd < 0) {
    return false;
  }
  pos = labelEnd + 1;
  if (pos < max && state.src.charCodeAt(pos) === 40) {
    pos++;
    for (; pos < max; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) {
        break;
      }
    }
    if (pos >= max) {
      return false;
    }
    start = pos;
    res = state.md.helpers.parseLinkDestination(state.src, pos, state.posMax);
    if (res.ok) {
      href = state.md.normalizeLink(res.str);
      if (state.md.validateLink(href)) {
        pos = res.pos;
      } else {
        href = "";
      }
    }
    start = pos;
    for (; pos < max; pos++) {
      code2 = state.src.charCodeAt(pos);
      if (!isSpace(code2) && code2 !== 10) {
        break;
      }
    }
    res = state.md.helpers.parseLinkTitle(state.src, pos, state.posMax);
    if (pos < max && start !== pos && res.ok) {
      title = res.str;
      pos = res.pos;
      for (; pos < max; pos++) {
        code2 = state.src.charCodeAt(pos);
        if (!isSpace(code2) && code2 !== 10) {
          break;
        }
      }
    } else {
      title = "";
    }
    if (pos >= max || state.src.charCodeAt(pos) !== 41) {
      state.pos = oldPos;
      return false;
    }
    pos++;
  } else {
    if (typeof state.env.references === "undefined") {
      return false;
    }
    if (pos < max && state.src.charCodeAt(pos) === 91) {
      start = pos + 1;
      pos = state.md.helpers.parseLinkLabel(state, pos);
      if (pos >= 0) {
        label = state.src.slice(start, pos++);
      } else {
        pos = labelEnd + 1;
      }
    } else {
      pos = labelEnd + 1;
    }
    if (!label) {
      label = state.src.slice(labelStart, labelEnd);
    }
    ref = state.env.references[normalizeReference(label)];
    if (!ref) {
      state.pos = oldPos;
      return false;
    }
    href = ref.href;
    title = ref.title;
  }
  if (!silent) {
    content = state.src.slice(labelStart, labelEnd);
    const tokens = [];
    state.md.inline.parse(
      content,
      state.md,
      state.env,
      tokens
    );
    const token = state.push("image", "img", 0);
    const attrs = [["src", href], ["alt", ""]];
    token.attrs = attrs;
    token.children = tokens;
    token.content = content;
    if (title) {
      attrs.push(["title", title]);
    }
  }
  state.pos = pos;
  state.posMax = max;
  return true;
}
const EMAIL_RE = /^([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/;
const AUTOLINK_RE = /^([a-zA-Z][a-zA-Z0-9+.-]{1,31}):([^<>\x00-\x20]*)$/;
function autolink(state, silent) {
  let pos = state.pos;
  if (state.src.charCodeAt(pos) !== 60) {
    return false;
  }
  const start = state.pos;
  const max = state.posMax;
  for (; ; ) {
    if (++pos >= max) return false;
    const ch = state.src.charCodeAt(pos);
    if (ch === 60) return false;
    if (ch === 62) break;
  }
  const url = state.src.slice(start + 1, pos);
  if (AUTOLINK_RE.test(url)) {
    const fullUrl = state.md.normalizeLink(url);
    if (!state.md.validateLink(fullUrl)) {
      return false;
    }
    if (!silent) {
      const token_o = state.push("link_open", "a", 1);
      token_o.attrs = [["href", fullUrl]];
      token_o.markup = "autolink";
      token_o.info = "auto";
      const token_t = state.push("text", "", 0);
      token_t.content = state.md.normalizeLinkText(url);
      const token_c = state.push("link_close", "a", -1);
      token_c.markup = "autolink";
      token_c.info = "auto";
    }
    state.pos += url.length + 2;
    return true;
  }
  if (EMAIL_RE.test(url)) {
    const fullUrl = state.md.normalizeLink("mailto:" + url);
    if (!state.md.validateLink(fullUrl)) {
      return false;
    }
    if (!silent) {
      const token_o = state.push("link_open", "a", 1);
      token_o.attrs = [["href", fullUrl]];
      token_o.markup = "autolink";
      token_o.info = "auto";
      const token_t = state.push("text", "", 0);
      token_t.content = state.md.normalizeLinkText(url);
      const token_c = state.push("link_close", "a", -1);
      token_c.markup = "autolink";
      token_c.info = "auto";
    }
    state.pos += url.length + 2;
    return true;
  }
  return false;
}
function isLinkOpen(str) {
  return /^<a[>\s]/i.test(str);
}
function isLinkClose(str) {
  return /^<\/a\s*>/i.test(str);
}
function isLetter(ch) {
  const lc = ch | 32;
  return lc >= 97 && lc <= 122;
}
function html_inline(state, silent) {
  if (!state.md.options.html) {
    return false;
  }
  const max = state.posMax;
  const pos = state.pos;
  if (state.src.charCodeAt(pos) !== 60 || pos + 2 >= max) {
    return false;
  }
  const ch = state.src.charCodeAt(pos + 1);
  if (ch !== 33 && ch !== 63 && ch !== 47 && !isLetter(ch)) {
    return false;
  }
  const match2 = state.src.slice(pos).match(HTML_TAG_RE);
  if (!match2) {
    return false;
  }
  if (!silent) {
    const token = state.push("html_inline", "", 0);
    token.content = match2[0];
    if (isLinkOpen(token.content)) state.linkLevel++;
    if (isLinkClose(token.content)) state.linkLevel--;
  }
  state.pos += match2[0].length;
  return true;
}
const DIGITAL_RE = /^&#((?:x[a-f0-9]{1,6}|[0-9]{1,7}));/i;
const NAMED_RE = /^&([a-z][a-z0-9]{1,31});/i;
function entity(state, silent) {
  const pos = state.pos;
  const max = state.posMax;
  if (state.src.charCodeAt(pos) !== 38) return false;
  if (pos + 1 >= max) return false;
  const ch = state.src.charCodeAt(pos + 1);
  if (ch === 35) {
    const match2 = state.src.slice(pos).match(DIGITAL_RE);
    if (match2) {
      if (!silent) {
        const code2 = match2[1][0].toLowerCase() === "x" ? parseInt(match2[1].slice(1), 16) : parseInt(match2[1], 10);
        const token = state.push("text_special", "", 0);
        token.content = isValidEntityCode(code2) ? fromCodePoint(code2) : fromCodePoint(65533);
        token.markup = match2[0];
        token.info = "entity";
      }
      state.pos += match2[0].length;
      return true;
    }
  } else {
    const match2 = state.src.slice(pos).match(NAMED_RE);
    if (match2) {
      const decoded = decodeHTMLStrict(match2[0]);
      if (decoded !== match2[0]) {
        if (!silent) {
          const token = state.push("text_special", "", 0);
          token.content = decoded;
          token.markup = match2[0];
          token.info = "entity";
        }
        state.pos += match2[0].length;
        return true;
      }
    }
  }
  return false;
}
function processDelimiters(delimiters) {
  const openersBottom = {};
  const max = delimiters.length;
  if (!max) return;
  let headerIdx = 0;
  let lastTokenIdx = -2;
  const jumps = [];
  for (let closerIdx = 0; closerIdx < max; closerIdx++) {
    const closer = delimiters[closerIdx];
    jumps.push(0);
    if (delimiters[headerIdx].marker !== closer.marker || lastTokenIdx !== closer.token - 1) {
      headerIdx = closerIdx;
    }
    lastTokenIdx = closer.token;
    closer.length = closer.length || 0;
    if (!closer.close) continue;
    if (!openersBottom.hasOwnProperty(closer.marker)) {
      openersBottom[closer.marker] = [-1, -1, -1, -1, -1, -1];
    }
    const minOpenerIdx = openersBottom[closer.marker][(closer.open ? 3 : 0) + closer.length % 3];
    let openerIdx = headerIdx - jumps[headerIdx] - 1;
    let newMinOpenerIdx = openerIdx;
    for (; openerIdx > minOpenerIdx; openerIdx -= jumps[openerIdx] + 1) {
      const opener = delimiters[openerIdx];
      if (opener.marker !== closer.marker) continue;
      if (opener.open && opener.end < 0) {
        let isOddMatch = false;
        if (opener.close || closer.open) {
          if ((opener.length + closer.length) % 3 === 0) {
            if (opener.length % 3 !== 0 || closer.length % 3 !== 0) {
              isOddMatch = true;
            }
          }
        }
        if (!isOddMatch) {
          const lastJump = openerIdx > 0 && !delimiters[openerIdx - 1].open ? jumps[openerIdx - 1] + 1 : 0;
          jumps[closerIdx] = closerIdx - openerIdx + lastJump;
          jumps[openerIdx] = lastJump;
          closer.open = false;
          opener.end = closerIdx;
          opener.close = false;
          newMinOpenerIdx = -1;
          lastTokenIdx = -2;
          break;
        }
      }
    }
    if (newMinOpenerIdx !== -1) {
      openersBottom[closer.marker][(closer.open ? 3 : 0) + (closer.length || 0) % 3] = newMinOpenerIdx;
    }
  }
}
function link_pairs(state) {
  const tokens_meta = state.tokens_meta;
  const max = state.tokens_meta.length;
  processDelimiters(state.delimiters);
  for (let curr = 0; curr < max; curr++) {
    if (tokens_meta[curr] && tokens_meta[curr].delimiters) {
      processDelimiters(tokens_meta[curr].delimiters);
    }
  }
}
function fragments_join(state) {
  let curr, last;
  let level = 0;
  const tokens = state.tokens;
  const max = state.tokens.length;
  for (curr = last = 0; curr < max; curr++) {
    if (tokens[curr].nesting < 0) level--;
    tokens[curr].level = level;
    if (tokens[curr].nesting > 0) level++;
    if (tokens[curr].type === "text" && curr + 1 < max && tokens[curr + 1].type === "text") {
      tokens[curr + 1].content = tokens[curr].content + tokens[curr + 1].content;
    } else {
      if (curr !== last) {
        tokens[last] = tokens[curr];
      }
      last++;
    }
  }
  if (curr !== last) {
    tokens.length = last;
  }
}
const _rules = [
  ["text", text],
  ["linkify", linkify],
  ["newline", newline],
  ["escape", escape],
  ["backticks", backtick],
  ["strikethrough", r_strikethrough.tokenize],
  ["emphasis", r_emphasis.tokenize],
  ["link", link],
  ["image", image],
  ["autolink", autolink],
  ["html_inline", html_inline],
  ["entity", entity]
];
const _rules2 = [
  ["balance_pairs", link_pairs],
  ["strikethrough", r_strikethrough.postProcess],
  ["emphasis", r_emphasis.postProcess],
  // rules for pairs separate '**' into its own text tokens, which may be left unused,
  // rule below merges unused segments back with the rest of the text
  ["fragments_join", fragments_join]
];
function ParserInline() {
  this.ruler = new Ruler();
  for (let i = 0; i < _rules.length; i++) {
    this.ruler.push(_rules[i][0], _rules[i][1]);
  }
  this.ruler2 = new Ruler();
  for (let i = 0; i < _rules2.length; i++) {
    this.ruler2.push(_rules2[i][0], _rules2[i][1]);
  }
}
ParserInline.prototype.skipToken = function(state) {
  const pos = state.pos;
  const rules = this.ruler.getRules("");
  const len = rules.length;
  const maxNesting = state.md.options.maxNesting;
  const cache = state.cache;
  if (typeof cache[pos] !== "undefined") {
    state.pos = cache[pos];
    return;
  }
  let ok = false;
  if (state.level < maxNesting) {
    for (let i = 0; i < len; i++) {
      state.level++;
      ok = rules[i](state, true);
      state.level--;
      if (ok) {
        if (pos >= state.pos) {
          throw new Error("inline rule didn't increment state.pos");
        }
        break;
      }
    }
  } else {
    state.pos = state.posMax;
  }
  if (!ok) {
    state.pos++;
  }
  cache[pos] = state.pos;
};
ParserInline.prototype.tokenize = function(state) {
  const rules = this.ruler.getRules("");
  const len = rules.length;
  const end = state.posMax;
  const maxNesting = state.md.options.maxNesting;
  while (state.pos < end) {
    const prevPos = state.pos;
    let ok = false;
    if (state.level < maxNesting) {
      for (let i = 0; i < len; i++) {
        ok = rules[i](state, false);
        if (ok) {
          if (prevPos >= state.pos) {
            throw new Error("inline rule didn't increment state.pos");
          }
          break;
        }
      }
    }
    if (ok) {
      if (state.pos >= end) {
        break;
      }
      continue;
    }
    state.pending += state.src[state.pos++];
  }
  if (state.pending) {
    state.pushPending();
  }
};
ParserInline.prototype.parse = function(str, md, env, outTokens) {
  const state = new this.State(str, md, env, outTokens);
  this.tokenize(state);
  const rules = this.ruler2.getRules("");
  const len = rules.length;
  for (let i = 0; i < len; i++) {
    rules[i](state);
  }
};
ParserInline.prototype.State = StateInline;
function reFactory(opts) {
  const re = {};
  opts = opts || {};
  re.src_Any = Any.source;
  re.src_Cc = Cc.source;
  re.src_Z = Z.source;
  re.src_P = P.source;
  re.src_ZPCc = [re.src_Z, re.src_P, re.src_Cc].join("|");
  re.src_ZCc = [re.src_Z, re.src_Cc].join("|");
  const text_separators = "[><｜]";
  re.src_pseudo_letter = `(?:(?!${text_separators}|${re.src_ZPCc})${re.src_Any})`;
  re.src_ip4 = "(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
  re.src_auth = `(?:(?:(?!${re.src_ZCc}|[@/\\[\\]()]).){1,50}@)?`;
  re.src_port = "(?::(?:6(?:[0-4]\\d{3}|5(?:[0-4]\\d{2}|5(?:[0-2]\\d|3[0-5])))|[1-5]?\\d{1,4}))?";
  re.src_host_terminator = `(?=$|${text_separators}|${re.src_ZPCc})(?!${opts["---"] ? "-(?!--)|" : "-|"}_|:\\d|\\.-|\\.(?!$|${re.src_ZPCc}))`;
  re.src_path = `(?:[/?#](?:(?!${re.src_ZCc}|${text_separators}|[()[\\]{}.,"'?!\\-;]).|\\[(?:(?!${re.src_ZCc}|\\]).)*\\]|\\((?:(?!${re.src_ZCc}|[)]).)*\\)|\\{(?:(?!${re.src_ZCc}|[}]).)*\\}|\\"(?:(?!${re.src_ZCc}|["]).)+\\"|\\'(?:(?!${re.src_ZCc}|[']).)+\\'|\\'(?=${re.src_pseudo_letter}|[-])|\\.{2,}[a-zA-Z0-9%/&]|\\.(?!${re.src_ZCc}|[.]|$)|` + (opts["---"] ? "\\-(?!--(?:[^-]|$))(?:-*)|" : "\\-+|") + // allow `,,,` in paths
  `,(?!${re.src_ZCc}|$)|;(?!${re.src_ZCc}|$)|\\!+(?!${re.src_ZCc}|[!]|$)|\\?(?!${re.src_ZCc}|[?]|$))+|\\/)?`;
  re.src_email_name = '[\\-;:&=\\+\\$,\\.a-zA-Z0-9_][\\-;:&=\\+\\$,\\"\\.a-zA-Z0-9_]{0,63}';
  re.src_xn = "xn--[a-z0-9\\-]{1,59}";
  re.src_domain_root = // Allow letters & digits (http://test1)
  "(?:" + re.src_xn + `|${re.src_pseudo_letter}{1,63})`;
  re.src_domain = "(?:" + re.src_xn + `|(?:${re.src_pseudo_letter})|(?:${re.src_pseudo_letter}(?:-|${re.src_pseudo_letter}){0,61}${re.src_pseudo_letter}))`;
  re.src_host = `(?:(?:(?:(?:${re.src_domain})\\.)*${re.src_domain}))`;
  re.tpl_host_fuzzy = "(?:" + re.src_ip4 + `|(?:(?:(?:${re.src_domain})\\.)+(?:%TLDS%)))`;
  re.tpl_host_no_ip_fuzzy = `(?:(?:(?:${re.src_domain})\\.)+(?:%TLDS%))`;
  re.src_host_strict = re.src_host + re.src_host_terminator;
  re.tpl_host_fuzzy_strict = re.tpl_host_fuzzy + re.src_host_terminator;
  re.src_host_port_strict = re.src_host + re.src_port + re.src_host_terminator;
  re.tpl_host_port_fuzzy_strict = re.tpl_host_fuzzy + re.src_port + re.src_host_terminator;
  re.tpl_host_port_no_ip_fuzzy_strict = re.tpl_host_no_ip_fuzzy + re.src_port + re.src_host_terminator;
  re.tpl_host_fuzzy_test = `localhost|www\\.|\\.\\d{1,3}\\.|(?:\\.(?:%TLDS%)(?:${re.src_ZPCc}|>|$))`;
  re.tpl_email_fuzzy = `(^|${text_separators}|"|\\(|${re.src_ZCc})(${re.src_email_name}@${re.tpl_host_fuzzy_strict})`;
  re.tpl_link_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
  // but can start with > (markdown blockquote)
  `(^|(?![.:/\\-_@])(?:[$+<=>^\`|｜]|${re.src_ZPCc}))((?![$+<=>^\`|｜])${re.tpl_host_port_fuzzy_strict}${re.src_path})`;
  re.tpl_link_no_ip_fuzzy = // Fuzzy link can't be prepended with .:/\- and non punctuation.
  // but can start with > (markdown blockquote)
  `(^|(?![.:/\\-_@])(?:[$+<=>^\`|｜]|${re.src_ZPCc}))((?![$+<=>^\`|｜])${re.tpl_host_port_no_ip_fuzzy_strict}${re.src_path})`;
  return re;
}
function assign(obj) {
  const sources = Array.prototype.slice.call(arguments, 1);
  sources.forEach(function(source) {
    if (!source) {
      return;
    }
    Object.keys(source).forEach(function(key) {
      obj[key] = source[key];
    });
  });
  return obj;
}
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function isString(obj) {
  return _class(obj) === "[object String]";
}
function isObject(obj) {
  return _class(obj) === "[object Object]";
}
function isRegExp(obj) {
  return _class(obj) === "[object RegExp]";
}
function isFunction(obj) {
  return _class(obj) === "[object Function]";
}
function escapeRE(str) {
  return str.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
}
const defaultOptions = {
  fuzzyLink: true,
  fuzzyEmail: true,
  fuzzyIP: false
};
function isOptionsObj(obj) {
  return Object.keys(obj || {}).reduce(function(acc, k) {
    return acc || defaultOptions.hasOwnProperty(k);
  }, false);
}
const defaultSchemas = {
  "http:": {
    validate: function(text2, pos, self) {
      const tail = text2.slice(pos);
      if (!self.re.http) {
        self.re.http = new RegExp(
          `^\\/\\/${self.re.src_auth}${self.re.src_host_port_strict}${self.re.src_path}`,
          "i"
        );
      }
      if (self.re.http.test(tail)) {
        return tail.match(self.re.http)[0].length;
      }
      return 0;
    }
  },
  "https:": "http:",
  "ftp:": "http:",
  "//": {
    validate: function(text2, pos, self) {
      const tail = text2.slice(pos);
      if (!self.re.no_http) {
        self.re.no_http = new RegExp(
          "^" + self.re.src_auth + // Don't allow single-level domains, because of false positives like '//test'
          // with code comments
          `(?:localhost|(?:(?:${self.re.src_domain})\\.)+${self.re.src_domain_root})` + self.re.src_port + self.re.src_host_terminator + self.re.src_path,
          "i"
        );
      }
      if (self.re.no_http.test(tail)) {
        if (pos >= 3 && text2[pos - 3] === ":") {
          return 0;
        }
        if (pos >= 3 && text2[pos - 3] === "/") {
          return 0;
        }
        return tail.match(self.re.no_http)[0].length;
      }
      return 0;
    }
  },
  "mailto:": {
    validate: function(text2, pos, self) {
      const tail = text2.slice(pos);
      if (!self.re.mailto) {
        self.re.mailto = new RegExp(
          `^${self.re.src_email_name}@${self.re.src_host_strict}`,
          "i"
        );
      }
      if (self.re.mailto.test(tail)) {
        return tail.match(self.re.mailto)[0].length;
      }
      return 0;
    }
  }
};
const tlds_2ch_src_re = "a[cdefgilmnoqrstuwxz]|b[abdefghijmnorstvwyz]|c[acdfghiklmnoruvwxyz]|d[ejkmoz]|e[cegrstu]|f[ijkmor]|g[abdefghilmnpqrstuwy]|h[kmnrtu]|i[delmnoqrst]|j[emop]|k[eghimnprwyz]|l[abcikrstuvy]|m[acdeghklmnopqrstuvwxyz]|n[acefgilopruz]|om|p[aefghklmnrstwy]|qa|r[eosuw]|s[abcdeghijklmnortuvxyz]|t[cdfghjklmnortvwz]|u[agksyz]|v[aceginu]|w[fs]|y[et]|z[amw]";
const tlds_default = "biz|com|edu|gov|net|org|pro|web|xxx|aero|asia|coop|info|museum|name|shop|рф".split("|");
function createValidator(re) {
  return function(text2, pos) {
    const tail = text2.slice(pos);
    if (re.test(tail)) {
      return tail.match(re)[0].length;
    }
    return 0;
  };
}
function createNormalizer() {
  return function(match2, self) {
    self.normalize(match2);
  };
}
function compile(self) {
  const re = self.re = reFactory(self.__opts__);
  const tlds2 = self.__tlds__.slice();
  self.onCompile();
  if (!self.__tlds_replaced__) {
    tlds2.push(tlds_2ch_src_re);
  }
  tlds2.push(re.src_xn);
  re.src_tlds = tlds2.join("|");
  function untpl(tpl) {
    return tpl.replace("%TLDS%", re.src_tlds);
  }
  re.email_fuzzy = RegExp(untpl(re.tpl_email_fuzzy), "i");
  re.email_fuzzy_global = RegExp(untpl(re.tpl_email_fuzzy), "ig");
  re.link_fuzzy = RegExp(untpl(re.tpl_link_fuzzy), "i");
  re.link_fuzzy_global = RegExp(untpl(re.tpl_link_fuzzy), "ig");
  re.link_no_ip_fuzzy = RegExp(untpl(re.tpl_link_no_ip_fuzzy), "i");
  re.link_no_ip_fuzzy_global = RegExp(untpl(re.tpl_link_no_ip_fuzzy), "ig");
  re.host_fuzzy_test = RegExp(untpl(re.tpl_host_fuzzy_test), "i");
  const aliases = [];
  self.__compiled__ = {};
  function schemaError(name, val) {
    throw new Error(`(LinkifyIt) Invalid schema "${name}": ${val}`);
  }
  Object.keys(self.__schemas__).forEach(function(name) {
    const val = self.__schemas__[name];
    if (val === null) {
      return;
    }
    const compiled = { validate: null, link: null };
    self.__compiled__[name] = compiled;
    if (isObject(val)) {
      if (isRegExp(val.validate)) {
        compiled.validate = createValidator(val.validate);
      } else if (isFunction(val.validate)) {
        compiled.validate = val.validate;
      } else {
        schemaError(name, val);
      }
      if (isFunction(val.normalize)) {
        compiled.normalize = val.normalize;
      } else if (!val.normalize) {
        compiled.normalize = createNormalizer();
      } else {
        schemaError(name, val);
      }
      return;
    }
    if (isString(val)) {
      aliases.push(name);
      return;
    }
    schemaError(name, val);
  });
  aliases.forEach(function(alias) {
    if (!self.__compiled__[self.__schemas__[alias]]) {
      return;
    }
    self.__compiled__[alias].validate = self.__compiled__[self.__schemas__[alias]].validate;
    self.__compiled__[alias].normalize = self.__compiled__[self.__schemas__[alias]].normalize;
  });
  self.__compiled__[""] = { validate: null, normalize: createNormalizer() };
  const slist = Object.keys(self.__compiled__).filter(function(name) {
    return name.length > 0 && self.__compiled__[name];
  }).map(escapeRE).join("|");
  self.re.schema_test = RegExp(`(^|(?!_)(?:[><｜]|${re.src_ZPCc}))(${slist})`, "i");
  self.re.schema_search = RegExp(`(^|(?!_)(?:[><｜]|${re.src_ZPCc}))(${slist})`, "ig");
  self.re.schema_at_start = RegExp(`^${self.re.schema_search.source}`, "i");
  self.re.pretest = RegExp(
    `(${self.re.schema_test.source})|(${self.re.host_fuzzy_test.source})|@`,
    "i"
  );
}
function Match(text2, schema, index, lastIndex) {
  const raw = text2.slice(index, lastIndex);
  this.schema = schema.toLowerCase();
  this.index = index;
  this.lastIndex = lastIndex;
  this.raw = raw;
  this.text = raw;
  this.url = raw;
}
function LinkifyIt(schemas, options) {
  if (!(this instanceof LinkifyIt)) {
    return new LinkifyIt(schemas, options);
  }
  if (!options) {
    if (isOptionsObj(schemas)) {
      options = schemas;
      schemas = {};
    }
  }
  this.__opts__ = assign({}, defaultOptions, options);
  this.__schemas__ = assign({}, defaultSchemas, schemas);
  this.__compiled__ = {};
  this.__tlds__ = tlds_default;
  this.__tlds_replaced__ = false;
  this.re = {};
  compile(this);
}
LinkifyIt.prototype.add = function add(schema, definition) {
  this.__schemas__[schema] = definition;
  compile(this);
  return this;
};
LinkifyIt.prototype.set = function set(options) {
  this.__opts__ = assign(this.__opts__, options);
  return this;
};
LinkifyIt.prototype.test = function test(text2) {
  if (!text2.length) {
    return false;
  }
  let m, re;
  if (this.re.schema_test.test(text2)) {
    re = this.re.schema_search;
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) {
      if (this.testSchemaAt(text2, m[2], re.lastIndex)) {
        return true;
      }
    }
  }
  if (this.__opts__.fuzzyLink && this.__compiled__["http:"]) {
    if (text2.search(this.re.host_fuzzy_test) >= 0) {
      if (text2.match(this.__opts__.fuzzyIP ? this.re.link_fuzzy : this.re.link_no_ip_fuzzy) !== null) {
        return true;
      }
    }
  }
  if (this.__opts__.fuzzyEmail && this.__compiled__["mailto:"]) {
    if (text2.indexOf("@") >= 0) {
      if (text2.match(this.re.email_fuzzy) !== null) {
        return true;
      }
    }
  }
  return false;
};
LinkifyIt.prototype.pretest = function pretest(text2) {
  return this.re.pretest.test(text2);
};
LinkifyIt.prototype.testSchemaAt = function testSchemaAt(text2, schema, pos) {
  if (!this.__compiled__[schema.toLowerCase()]) {
    return 0;
  }
  return this.__compiled__[schema.toLowerCase()].validate(text2, pos, this);
};
LinkifyIt.prototype.match = function match(text2) {
  const result = [];
  const type_schemed = [];
  const type_fuzzy_link = [];
  const type_fuzzy_email = [];
  let m, len, re;
  function choose(a, b) {
    if (!a) {
      return b;
    }
    if (!b) {
      return a;
    }
    if (a.index !== b.index) {
      return a.index < b.index ? a : b;
    }
    return a.lastIndex >= b.lastIndex ? a : b;
  }
  if (!text2.length) {
    return null;
  }
  if (this.re.schema_test.test(text2)) {
    re = this.re.schema_search;
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) {
      len = this.testSchemaAt(text2, m[2], re.lastIndex);
      if (len) {
        type_schemed.push({
          schema: m[2],
          index: m.index + m[1].length,
          lastIndex: m.index + m[0].length + len
        });
      }
    }
  }
  if (this.__opts__.fuzzyLink && this.__compiled__["http:"]) {
    re = this.__opts__.fuzzyIP ? this.re.link_fuzzy_global : this.re.link_no_ip_fuzzy_global;
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) {
      type_fuzzy_link.push({
        schema: "",
        index: m.index + m[1].length,
        lastIndex: m.index + m[0].length
      });
    }
  }
  if (this.__opts__.fuzzyEmail && this.__compiled__["mailto:"]) {
    re = this.re.email_fuzzy_global;
    re.lastIndex = 0;
    while ((m = re.exec(text2)) !== null) {
      type_fuzzy_email.push({
        schema: "mailto:",
        index: m.index + m[1].length,
        lastIndex: m.index + m[0].length
      });
    }
  }
  const indexes = [0, 0, 0];
  let lastIndex = 0;
  for (; ; ) {
    const candidates = [
      type_schemed[indexes[0]],
      type_fuzzy_email[indexes[1]],
      type_fuzzy_link[indexes[2]]
    ];
    const candidate = choose(choose(candidates[0], candidates[1]), candidates[2]);
    if (!candidate) {
      break;
    }
    if (candidate === candidates[0]) {
      indexes[0]++;
    } else if (candidate === candidates[1]) {
      indexes[1]++;
    } else {
      indexes[2]++;
    }
    if (candidate.index < lastIndex) {
      continue;
    }
    const match2 = new Match(text2, candidate.schema, candidate.index, candidate.lastIndex);
    this.__compiled__[match2.schema].normalize(match2, this);
    result.push(match2);
    lastIndex = candidate.lastIndex;
  }
  if (result.length) {
    return result;
  }
  return null;
};
LinkifyIt.prototype.matchAtStart = function matchAtStart(text2) {
  if (!text2.length) return null;
  const m = this.re.schema_at_start.exec(text2);
  if (!m) return null;
  const len = this.testSchemaAt(text2, m[2], m[0].length);
  if (!len) return null;
  const match2 = new Match(text2, m[2], m.index + m[1].length, m.index + m[0].length + len);
  this.__compiled__[match2.schema].normalize(match2, this);
  return match2;
};
LinkifyIt.prototype.tlds = function tlds(list2, keepOld) {
  list2 = Array.isArray(list2) ? list2 : [list2];
  if (!keepOld) {
    this.__tlds__ = list2.slice();
    this.__tlds_replaced__ = true;
    compile(this);
    return this;
  }
  this.__tlds__ = this.__tlds__.concat(list2).sort().filter(function(el, idx, arr) {
    return el !== arr[idx - 1];
  }).reverse();
  compile(this);
  return this;
};
LinkifyIt.prototype.normalize = function normalize2(match2) {
  if (!match2.schema) {
    match2.url = `http://${match2.url}`;
  }
  if (match2.schema === "mailto:" && !/^mailto:/i.test(match2.url)) {
    match2.url = `mailto:${match2.url}`;
  }
};
LinkifyIt.prototype.onCompile = function onCompile() {
};
const maxInt = 2147483647;
const base = 36;
const tMin = 1;
const tMax = 26;
const skew = 38;
const damp = 700;
const initialBias = 72;
const initialN = 128;
const delimiter = "-";
const regexPunycode = /^xn--/;
const regexNonASCII = /[^\0-\x7F]/;
const regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
const errors = {
  "overflow": "Overflow: input needs wider integers to process",
  "not-basic": "Illegal input >= 0x80 (not a basic code point)",
  "invalid-input": "Invalid input"
};
const baseMinusTMin = base - tMin;
const floor = Math.floor;
const stringFromCharCode = String.fromCharCode;
function error(type) {
  throw new RangeError(errors[type]);
}
function map(array, callback) {
  const result = [];
  let length = array.length;
  while (length--) {
    result[length] = callback(array[length]);
  }
  return result;
}
function mapDomain(domain, callback) {
  const parts = domain.split("@");
  let result = "";
  if (parts.length > 1) {
    result = parts[0] + "@";
    domain = parts[1];
  }
  domain = domain.replace(regexSeparators, ".");
  const labels = domain.split(".");
  const encoded = map(labels, callback).join(".");
  return result + encoded;
}
function ucs2decode(string) {
  const output = [];
  let counter = 0;
  const length = string.length;
  while (counter < length) {
    const value = string.charCodeAt(counter++);
    if (value >= 55296 && value <= 56319 && counter < length) {
      const extra = string.charCodeAt(counter++);
      if ((extra & 64512) == 56320) {
        output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
      } else {
        output.push(value);
        counter--;
      }
    } else {
      output.push(value);
    }
  }
  return output;
}
const ucs2encode = (codePoints) => String.fromCodePoint(...codePoints);
const basicToDigit = function(codePoint) {
  if (codePoint >= 48 && codePoint < 58) {
    return 26 + (codePoint - 48);
  }
  if (codePoint >= 65 && codePoint < 91) {
    return codePoint - 65;
  }
  if (codePoint >= 97 && codePoint < 123) {
    return codePoint - 97;
  }
  return base;
};
const digitToBasic = function(digit, flag) {
  return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
};
const adapt = function(delta, numPoints, firstTime) {
  let k = 0;
  delta = firstTime ? floor(delta / damp) : delta >> 1;
  delta += floor(delta / numPoints);
  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
    delta = floor(delta / baseMinusTMin);
  }
  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};
const decode = function(input) {
  const output = [];
  const inputLength = input.length;
  let i = 0;
  let n = initialN;
  let bias = initialBias;
  let basic = input.lastIndexOf(delimiter);
  if (basic < 0) {
    basic = 0;
  }
  for (let j = 0; j < basic; ++j) {
    if (input.charCodeAt(j) >= 128) {
      error("not-basic");
    }
    output.push(input.charCodeAt(j));
  }
  for (let index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
    const oldi = i;
    for (let w = 1, k = base; ; k += base) {
      if (index >= inputLength) {
        error("invalid-input");
      }
      const digit = basicToDigit(input.charCodeAt(index++));
      if (digit >= base) {
        error("invalid-input");
      }
      if (digit > floor((maxInt - i) / w)) {
        error("overflow");
      }
      i += digit * w;
      const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
      if (digit < t) {
        break;
      }
      const baseMinusT = base - t;
      if (w > floor(maxInt / baseMinusT)) {
        error("overflow");
      }
      w *= baseMinusT;
    }
    const out = output.length + 1;
    bias = adapt(i - oldi, out, oldi == 0);
    if (floor(i / out) > maxInt - n) {
      error("overflow");
    }
    n += floor(i / out);
    i %= out;
    output.splice(i++, 0, n);
  }
  return String.fromCodePoint(...output);
};
const encode = function(input) {
  const output = [];
  input = ucs2decode(input);
  const inputLength = input.length;
  let n = initialN;
  let delta = 0;
  let bias = initialBias;
  for (const currentValue of input) {
    if (currentValue < 128) {
      output.push(stringFromCharCode(currentValue));
    }
  }
  const basicLength = output.length;
  let handledCPCount = basicLength;
  if (basicLength) {
    output.push(delimiter);
  }
  while (handledCPCount < inputLength) {
    let m = maxInt;
    for (const currentValue of input) {
      if (currentValue >= n && currentValue < m) {
        m = currentValue;
      }
    }
    const handledCPCountPlusOne = handledCPCount + 1;
    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
      error("overflow");
    }
    delta += (m - n) * handledCPCountPlusOne;
    n = m;
    for (const currentValue of input) {
      if (currentValue < n && ++delta > maxInt) {
        error("overflow");
      }
      if (currentValue === n) {
        let q = delta;
        for (let k = base; ; k += base) {
          const t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
          if (q < t) {
            break;
          }
          const qMinusT = q - t;
          const baseMinusT = base - t;
          output.push(
            stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
          );
          q = floor(qMinusT / baseMinusT);
        }
        output.push(stringFromCharCode(digitToBasic(q, 0)));
        bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
        delta = 0;
        ++handledCPCount;
      }
    }
    ++delta;
    ++n;
  }
  return output.join("");
};
const toUnicode = function(input) {
  return mapDomain(input, function(string) {
    return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
  });
};
const toASCII = function(input) {
  return mapDomain(input, function(string) {
    return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
  });
};
const punycode = {
  /**
   * A string representing the current Punycode.js version number.
   * @memberOf punycode
   * @type String
   */
  "version": "2.3.1",
  /**
   * An object of methods to convert from JavaScript's internal character
   * representation (UCS-2) to Unicode code points, and back.
   * @see <https://mathiasbynens.be/notes/javascript-encoding>
   * @memberOf punycode
   * @type Object
   */
  "ucs2": {
    "decode": ucs2decode,
    "encode": ucs2encode
  },
  "decode": decode,
  "encode": encode,
  "toASCII": toASCII,
  "toUnicode": toUnicode
};
const cfg_default = {
  options: {
    // Enable HTML tags in source
    html: false,
    // Use '/' to close single tags (<br />)
    xhtmlOut: false,
    // Convert '\n' in paragraphs into <br>
    breaks: false,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: false,
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "“”‘’",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 100
  },
  components: {
    core: {},
    block: {},
    inline: {}
  }
};
const cfg_zero = {
  options: {
    // Enable HTML tags in source
    html: false,
    // Use '/' to close single tags (<br />)
    xhtmlOut: false,
    // Convert '\n' in paragraphs into <br>
    breaks: false,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: false,
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "“”‘’",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 20
  },
  components: {
    core: {
      rules: [
        "normalize",
        "block",
        "inline",
        "text_join"
      ]
    },
    block: {
      rules: [
        "paragraph"
      ]
    },
    inline: {
      rules: [
        "text"
      ],
      rules2: [
        "balance_pairs",
        "fragments_join"
      ]
    }
  }
};
const cfg_commonmark = {
  options: {
    // Enable HTML tags in source
    html: true,
    // Use '/' to close single tags (<br />)
    xhtmlOut: true,
    // Convert '\n' in paragraphs into <br>
    breaks: false,
    // CSS language prefix for fenced blocks
    langPrefix: "language-",
    // autoconvert URL-like texts to links
    linkify: false,
    // Enable some language-neutral replacements + quotes beautification
    typographer: false,
    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes: "“”‘’",
    /* “”‘’ */
    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //
    // function (/*str, lang*/) { return ''; }
    //
    highlight: null,
    // Internal protection, recursion limit
    maxNesting: 20
  },
  components: {
    core: {
      rules: [
        "normalize",
        "block",
        "inline",
        "text_join"
      ]
    },
    block: {
      rules: [
        "blockquote",
        "code",
        "fence",
        "heading",
        "hr",
        "html_block",
        "lheading",
        "list",
        "reference",
        "paragraph"
      ]
    },
    inline: {
      rules: [
        "autolink",
        "backticks",
        "emphasis",
        "entity",
        "escape",
        "html_inline",
        "image",
        "link",
        "newline",
        "text"
      ],
      rules2: [
        "balance_pairs",
        "emphasis",
        "fragments_join"
      ]
    }
  }
};
const config = {
  default: cfg_default,
  zero: cfg_zero,
  commonmark: cfg_commonmark
};
const BAD_PROTO_RE = /^(vbscript|javascript|file|data):/;
const GOOD_DATA_RE = /^data:image\/(gif|png|jpeg|webp);/;
function validateLink(url) {
  const str = url.trim().toLowerCase();
  return BAD_PROTO_RE.test(str) ? GOOD_DATA_RE.test(str) : true;
}
const RECODE_HOSTNAME_FOR = ["http:", "https:", "mailto:"];
function normalizeLink(url) {
  const parsed = urlParse(url, true);
  if (parsed.hostname) {
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toASCII(parsed.hostname);
      } catch (er) {
      }
    }
  }
  return encode$1(format(parsed));
}
function normalizeLinkText(url) {
  const parsed = urlParse(url, true);
  if (parsed.hostname) {
    if (!parsed.protocol || RECODE_HOSTNAME_FOR.indexOf(parsed.protocol) >= 0) {
      try {
        parsed.hostname = punycode.toUnicode(parsed.hostname);
      } catch (er) {
      }
    }
  }
  return decode$1(format(parsed), decode$1.defaultChars + "%");
}
function MarkdownIt(presetName, options) {
  if (!(this instanceof MarkdownIt)) {
    return new MarkdownIt(presetName, options);
  }
  if (!options) {
    if (!isString$1(presetName)) {
      options = presetName || {};
      presetName = "default";
    }
  }
  this.inline = new ParserInline();
  this.block = new ParserBlock();
  this.core = new Core();
  this.renderer = new Renderer();
  this.linkify = new LinkifyIt();
  this.validateLink = validateLink;
  this.normalizeLink = normalizeLink;
  this.normalizeLinkText = normalizeLinkText;
  this.utils = utils;
  this.helpers = assign$1({}, helpers);
  this.options = {};
  this.configure(presetName);
  if (options) {
    this.set(options);
  }
}
MarkdownIt.prototype.set = function(options) {
  assign$1(this.options, options);
  return this;
};
MarkdownIt.prototype.configure = function(presets) {
  const self = this;
  if (isString$1(presets)) {
    const presetName = presets;
    presets = config[presetName];
    if (!presets) {
      throw new Error('Wrong `markdown-it` preset "' + presetName + '", check name');
    }
  }
  if (!presets) {
    throw new Error("Wrong `markdown-it` preset, can't be empty");
  }
  if (presets.options) {
    self.set(presets.options);
  }
  if (presets.components) {
    Object.keys(presets.components).forEach(function(name) {
      if (presets.components[name].rules) {
        self[name].ruler.enableOnly(presets.components[name].rules);
      }
      if (presets.components[name].rules2) {
        self[name].ruler2.enableOnly(presets.components[name].rules2);
      }
    });
  }
  return this;
};
MarkdownIt.prototype.enable = function(list2, ignoreInvalid) {
  let result = [];
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  ["core", "block", "inline"].forEach(function(chain) {
    result = result.concat(this[chain].ruler.enable(list2, true));
  }, this);
  result = result.concat(this.inline.ruler2.enable(list2, true));
  const missed = list2.filter(function(name) {
    return result.indexOf(name) < 0;
  });
  if (missed.length && !ignoreInvalid) {
    throw new Error("MarkdownIt. Failed to enable unknown rule(s): " + missed);
  }
  return this;
};
MarkdownIt.prototype.disable = function(list2, ignoreInvalid) {
  let result = [];
  if (!Array.isArray(list2)) {
    list2 = [list2];
  }
  ["core", "block", "inline"].forEach(function(chain) {
    result = result.concat(this[chain].ruler.disable(list2, true));
  }, this);
  result = result.concat(this.inline.ruler2.disable(list2, true));
  const missed = list2.filter(function(name) {
    return result.indexOf(name) < 0;
  });
  if (missed.length && !ignoreInvalid) {
    throw new Error("MarkdownIt. Failed to disable unknown rule(s): " + missed);
  }
  return this;
};
MarkdownIt.prototype.use = function(plugin) {
  const args = [this].concat(Array.prototype.slice.call(arguments, 1));
  plugin.apply(plugin, args);
  return this;
};
MarkdownIt.prototype.parse = function(src, env) {
  if (typeof src !== "string") {
    throw new Error("Input data should be a String");
  }
  const state = new this.core.State(src, this, env);
  this.core.process(state);
  return state.tokens;
};
MarkdownIt.prototype.render = function(src, env) {
  env = env || {};
  return this.renderer.render(this.parse(src, env), this.options, env);
};
MarkdownIt.prototype.parseInline = function(src, env) {
  const state = new this.core.State(src, this, env);
  state.inlineMode = true;
  this.core.process(state);
  return state.tokens;
};
MarkdownIt.prototype.renderInline = function(src, env) {
  env = env || {};
  return this.renderer.render(this.parseInline(src, env), this.options, env);
};
const FILE_PATH_REGEX = /(?:[a-zA-Z]:)?[/\\](?:[\w\-. ]+[/\\])+[\w\-. ]+\.(tsx?|jsx?|css|scss|json|md|py|java|go|rs|c|cpp|h|hpp|sh|yaml|yml|toml|xml|html|vue|svelte)/gi;
const FILE_PATH_WITH_LINES_REGEX = /(?:[a-zA-Z]:)?[/\\](?:[\w\-. ]+[/\\])+[\w\-. ]+\.(tsx?|jsx?|css|scss|json|md|py|java|go|rs|c|cpp|h|hpp|sh|yaml|yml|toml|xml|html|vue|svelte)#(\d+)(?:-(\d+))?/gi;
const KNOWN_FILE_EXTENSIONS = /\.(tsx?|jsx?|css|scss|json|md|py|java|go|rs|c|cpp|h|hpp|sh|ya?ml|toml|xml|html|vue|svelte)$/i;
const FILE_URI_PATTERN = /^file:\/\//i;
const FILE_URI_TEXT_PATTERN = /file:\/\//i;
const EXTERNAL_LINK_PATTERN = /^(?:https?|mailto|ftp|data):/i;
const splitLineFragment = (raw) => {
  const hashIndex = raw.indexOf("#");
  if (hashIndex < 0) {
    return { filePath: raw };
  }
  const fragment = raw.slice(hashIndex + 1);
  const lineMatch = fragment.match(/^L?(\d+)(?:-\d+)?$/i);
  return {
    filePath: raw.slice(0, hashIndex),
    line: lineMatch ? parseInt(lineMatch[1], 10) : void 0
  };
};
const appendLineNumber = (filePath, line) => line === void 0 ? filePath : filePath + ":" + line;
const safeDecodePath = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};
const parseAllowedLocalFileUri = (raw) => {
  if (!FILE_URI_PATTERN.test(raw)) {
    return void 0;
  }
  const { filePath: rawUri, line } = splitLineFragment(raw);
  let uri;
  try {
    uri = new URL(rawUri);
  } catch {
    return void 0;
  }
  if (uri.protocol.toLowerCase() !== "file:") {
    return void 0;
  }
  const hostname = uri.hostname.toLowerCase();
  if (hostname !== "" && hostname !== "localhost") {
    return void 0;
  }
  const decodedPath = safeDecodePath(uri.pathname).replace(/\\/g, "/");
  const encodedNetworkPath = uri.pathname.replace(/%2f/gi, "/").replace(/%5c/gi, "\\").replace(/\\/g, "/");
  if (decodedPath.startsWith("//") || encodedNetworkPath.startsWith("//")) {
    return void 0;
  }
  const filePath = decodedPath.length > 1 && /^[a-zA-Z]:\//.test(decodedPath.slice(1)) ? decodedPath.slice(1) : decodedPath;
  return { filePath, line };
};
const isAllowedLocalFileUri = (url) => parseAllowedLocalFileUri(url) !== void 0;
const shouldSkipFilePathUpgrade = (href) => EXTERNAL_LINK_PATTERN.test(href) || FILE_URI_PATTERN.test(href);
const normalizeExplicitFileLink = (raw) => {
  const parsed = parseAllowedLocalFileUri(raw);
  if (parsed) {
    return appendLineNumber(parsed.filePath, parsed.line);
  }
  const { filePath: rawPath, line } = splitLineFragment(raw);
  const decodedPath = safeDecodePath(rawPath).replace(/\\/g, "/");
  return appendLineNumber(decodedPath, line);
};
const escapeHtml = (unsafe) => unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const createMarkdownInstance = () => {
  const md = new MarkdownIt({
    html: false,
    // Disable HTML for security
    xhtmlOut: false,
    breaks: true,
    linkify: true,
    typographer: true
  });
  const defaultValidateLink = md.validateLink;
  md.validateLink = (url) => FILE_URI_PATTERN.test(url) ? isAllowedLocalFileUri(url) : defaultValidateLink(url);
  return md;
};
const MarkdownRenderer = ({
  content,
  onFileClick,
  enableFileLinks = true
}) => {
  const md = react.useMemo(() => createMarkdownInstance(), []);
  const processFilePaths = (html) => {
    if (typeof document === "undefined") {
      return html;
    }
    const FILE_PATH_NO_G = new RegExp(
      FILE_PATH_REGEX.source,
      FILE_PATH_REGEX.flags.replace("g", "")
    );
    const FILE_PATH_WITH_LINES_NO_G = new RegExp(
      FILE_PATH_WITH_LINES_REGEX.source,
      FILE_PATH_WITH_LINES_REGEX.flags.replace("g", "")
    );
    const BARE_FILE_REGEX = /[\w\-. ]+\.(tsx?|jsx?|css|scss|json|md|py|java|go|rs|c|cpp|h|hpp|sh|ya?ml|toml|xml|html|vue|svelte)/i;
    const container = document.createElement("div");
    container.innerHTML = html;
    const union = new RegExp(
      `${FILE_PATH_WITH_LINES_REGEX.source}|${FILE_PATH_REGEX.source}|${BARE_FILE_REGEX.source}`,
      "gi"
    );
    const normalizePathAndLine = (raw) => {
      const { filePath, line } = splitLineFragment(raw);
      return {
        displayText: raw,
        dataPath: line === void 0 ? raw : appendLineNumber(filePath, line)
      };
    };
    const makeLink = (text2) => {
      const link2 = document.createElement("a");
      const { dataPath } = normalizePathAndLine(text2);
      link2.className = "file-path-link";
      link2.textContent = text2;
      link2.setAttribute("href", "#");
      link2.setAttribute("title", `Open ${text2}`);
      link2.setAttribute("data-file-path", dataPath);
      return link2;
    };
    const isCodeReference = (str) => {
      if (BARE_FILE_REGEX.test(str)) {
        return false;
      }
      if (/[/\\]/.test(str)) {
        return false;
      }
      const codeRefPattern = /^[a-zA-Z_$][\w$]*(\.[a-zA-Z_$][\w$]*)+$/;
      return codeRefPattern.test(str);
    };
    const upgradeAnchorIfFilePath = (a) => {
      const href = a.getAttribute("href") || "";
      const text2 = (a.textContent || "").trim();
      const httpMatch = href.match(/^https?:\/\/(.+)$/i);
      if (httpMatch) {
        try {
          const url = new URL(href);
          const host = url.hostname || "";
          const pathname = url.pathname || "";
          const noPath = pathname === "" || pathname === "/";
          if (noPath && BARE_FILE_REGEX.test(text2) && host.toLowerCase() === text2.toLowerCase()) {
            const { dataPath } = normalizePathAndLine(text2);
            a.classList.add("file-path-link");
            a.setAttribute("href", "#");
            a.setAttribute("title", `Open ${text2}`);
            a.setAttribute("data-file-path", dataPath);
            return;
          }
          if (noPath && BARE_FILE_REGEX.test(host)) {
            const { dataPath } = normalizePathAndLine(host);
            a.classList.add("file-path-link");
            a.setAttribute("href", "#");
            a.setAttribute("title", `Open ${text2 || host}`);
            a.setAttribute("data-file-path", dataPath);
            return;
          }
        } catch {
        }
      }
      if (shouldSkipFilePathUpgrade(href)) {
        return;
      }
      const candidate = href || text2;
      if (isCodeReference(candidate)) {
        return;
      }
      if (FILE_PATH_WITH_LINES_NO_G.test(candidate) || FILE_PATH_NO_G.test(candidate)) {
        const { dataPath } = normalizePathAndLine(candidate);
        a.classList.add("file-path-link");
        a.setAttribute("href", "#");
        a.setAttribute("title", `Open ${text2 || href}`);
        a.setAttribute("data-file-path", dataPath);
        return;
      }
      if (BARE_FILE_REGEX.test(candidate)) {
        const { dataPath } = normalizePathAndLine(candidate);
        a.classList.add("file-path-link");
        a.setAttribute("href", "#");
        a.setAttribute("title", `Open ${text2 || href}`);
        a.setAttribute("data-file-path", dataPath);
      }
    };
    const walk = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node;
        if (el.tagName.toLowerCase() === "a") {
          upgradeAnchorIfFilePath(el);
          return;
        }
        const tag = el.tagName.toLowerCase();
        if (tag === "code" || tag === "pre") {
          return;
        }
      }
      for (let child = node.firstChild; child; ) {
        const next = child.nextSibling;
        if (child.nodeType === Node.TEXT_NODE) {
          const text2 = child.nodeValue || "";
          if (FILE_URI_TEXT_PATTERN.test(text2)) {
            child = next;
            continue;
          }
          union.lastIndex = 0;
          const hasMatch = union.test(text2);
          union.lastIndex = 0;
          if (hasMatch) {
            const frag = document.createDocumentFragment();
            let lastIndex = 0;
            let m;
            while (m = union.exec(text2)) {
              const matchText = m[0];
              const idx = m.index;
              if (isCodeReference(matchText)) {
                if (idx > lastIndex) {
                  frag.appendChild(
                    document.createTextNode(text2.slice(lastIndex, idx))
                  );
                }
                frag.appendChild(document.createTextNode(matchText));
                lastIndex = idx + matchText.length;
                continue;
              }
              if (idx > lastIndex) {
                frag.appendChild(
                  document.createTextNode(text2.slice(lastIndex, idx))
                );
              }
              frag.appendChild(makeLink(matchText));
              lastIndex = idx + matchText.length;
            }
            if (lastIndex < text2.length) {
              frag.appendChild(document.createTextNode(text2.slice(lastIndex)));
            }
            node.replaceChild(frag, child);
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          walk(child);
        }
        child = next;
      }
    };
    walk(container);
    return container.innerHTML;
  };
  const removeFileUriImages = (html) => {
    if (typeof document === "undefined" || !html.toLowerCase().includes("file:")) {
      return html;
    }
    const container = document.createElement("div");
    container.innerHTML = html;
    for (const image2 of Array.from(container.querySelectorAll("img"))) {
      if (FILE_URI_PATTERN.test(image2.getAttribute("src") || "")) {
        image2.replaceWith(document.createTextNode(image2.alt));
      }
    }
    return container.innerHTML;
  };
  const renderedHtml = react.useMemo(() => {
    try {
      let html = removeFileUriImages(md.render(content));
      if (enableFileLinks) {
        html = processFilePaths(html);
      }
      return html;
    } catch (error2) {
      console.error("Error rendering markdown:", error2);
      return escapeHtml(content);
    }
  }, [content, enableFileLinks, md]);
  const handleContainerClick = react.useCallback(
    (e) => {
      const target = e.target;
      if (!target) {
        return;
      }
      const anchor = target.closest && target.closest("a.file-path-link");
      if (anchor) {
        const filePath = anchor.getAttribute("data-file-path");
        if (!filePath) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        onFileClick == null ? void 0 : onFileClick(filePath);
        return;
      }
      const anyAnchor = target.closest && target.closest("a");
      if (!anyAnchor) {
        return;
      }
      const href = anyAnchor.getAttribute("href") || "";
      if (FILE_URI_PATTERN.test(href)) {
        e.preventDefault();
        e.stopPropagation();
        if (isAllowedLocalFileUri(href)) {
          onFileClick == null ? void 0 : onFileClick(normalizeExplicitFileLink(href));
        }
        return;
      }
      if (shouldSkipFilePathUpgrade(href)) {
        return;
      }
      const text2 = (anyAnchor.textContent || "").trim();
      const candidate = normalizeExplicitFileLink(href || text2);
      const isAbsolutePath = /^(?:[a-zA-Z]:[/\\]|[/\\])/i.test(candidate);
      const isRelativeFile = !isAbsolutePath && KNOWN_FILE_EXTENSIONS.test(candidate.replace(/:\d+(?::\d+)?$/, ""));
      if ((isAbsolutePath || isRelativeFile) && onFileClick) {
        e.preventDefault();
        e.stopPropagation();
        onFileClick(candidate);
      }
    },
    [onFileClick]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: "markdown-content",
      onClick: handleContainerClick,
      dangerouslySetInnerHTML: { __html: renderedHtml },
      style: {
        wordWrap: "break-word",
        overflowWrap: "break-word",
        whiteSpace: "normal"
      }
    }
  );
};
const MessageContentBase = ({
  content,
  onFileClick,
  enableFileLinks
}) => /* @__PURE__ */ jsxRuntime.jsx(
  MarkdownRenderer,
  {
    content,
    onFileClick,
    enableFileLinks
  }
);
MessageContentBase.displayName = "MessageContent";
const MessageContent = react.memo(MessageContentBase);
const FILE_REFERENCE_START = "--- Content from referenced files ---";
const FILE_REFERENCE_END = "--- End of content ---";
const FILE_CONTENT_PREFIX = /^Content from @([^\n:]+):\n?/m;
function parseContentWithFileReferences(content) {
  const segments = [];
  const startIndex = content.indexOf(FILE_REFERENCE_START);
  const endIndex = content.indexOf(FILE_REFERENCE_END);
  if (startIndex === -1) {
    return [{ type: "text", content }];
  }
  const textBefore = content.substring(0, startIndex).trim();
  if (textBefore) {
    segments.push({ type: "text", content: textBefore });
  }
  const fileRefSection = endIndex !== -1 ? content.substring(startIndex + FILE_REFERENCE_START.length, endIndex) : content.substring(startIndex + FILE_REFERENCE_START.length);
  const fileRefParts = fileRefSection.split(/(?=\nContent from @)/);
  for (const part of fileRefParts) {
    const trimmedPart = part.trim();
    if (!trimmedPart) continue;
    const match2 = trimmedPart.match(FILE_CONTENT_PREFIX);
    if (match2) {
      const filePath = match2[1].trim();
      const fileName = filePath.split("/").pop() || filePath;
      const fileContent = trimmedPart.substring(match2[0].length);
      segments.push({
        type: "file_reference",
        content: fileContent.trim(),
        filePath,
        fileName
      });
    } else if (trimmedPart && !trimmedPart.startsWith("Content from @")) {
      segments.push({
        type: "file_reference",
        content: trimmedPart
      });
    }
  }
  if (endIndex !== -1) {
    const textAfter = content.substring(endIndex + FILE_REFERENCE_END.length).trim();
    if (textAfter) {
      segments.push({ type: "text", content: textAfter });
    }
  }
  return segments;
}
const CollapsibleFileReference = ({
  segment,
  onFileClick,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useControlledExpanded(defaultExpanded);
  const lineCount = react.useMemo(
    () => segment.content.split("\n").length,
    [segment.content]
  );
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };
  const handleFileClick = () => {
    if (segment.filePath && onFileClick) {
      onFileClick(segment.filePath);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: "rounded-md overflow-hidden",
      style: {
        border: "1px solid var(--app-input-border)",
        backgroundColor: "var(--app-secondary-background)"
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            className: "flex items-center gap-1.5 w-full py-1.5 px-2.5 bg-transparent border-none cursor-pointer text-left text-xs transition-colors duration-150 hover:bg-black/5",
            style: { color: "var(--app-secondary-foreground)" },
            onClick: handleToggle,
            "aria-expanded": isExpanded,
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                "span",
                {
                  className: "text-[8px] flex-shrink-0 transition-transform duration-200",
                  style: {
                    color: "var(--app-secondary-foreground)",
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)"
                  },
                  children: "▶"
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-sm flex-shrink-0", children: "📄" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                "span",
                {
                  className: "font-medium cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0 hover:underline",
                  style: { color: "var(--app-link-color, #0066cc)" },
                  onClick: (e) => {
                    e.stopPropagation();
                    handleFileClick();
                  },
                  title: segment.filePath,
                  children: segment.fileName || "Referenced file"
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsxs(
                "span",
                {
                  className: "text-[11px] flex-shrink-0 ml-auto",
                  style: { color: "var(--app-tertiary-foreground, #999)" },
                  children: [
                    lineCount,
                    " ",
                    lineCount === 1 ? "line" : "lines"
                  ]
                }
              )
            ]
          }
        ),
        isExpanded && /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: "py-2 px-2.5 max-h-[300px] overflow-y-auto text-xs leading-normal",
            style: {
              borderTop: "1px solid var(--app-input-border)",
              backgroundColor: "var(--app-primary-background)"
            },
            children: /* @__PURE__ */ jsxRuntime.jsx(
              MessageContent,
              {
                content: segment.content,
                onFileClick,
                enableFileLinks: true
              }
            )
          }
        )
      ]
    }
  );
};
const CollapsibleFileContent = ({
  content,
  onFileClick,
  enableFileLinks = false
}) => {
  const segments = react.useMemo(
    () => parseContentWithFileReferences(content),
    [content]
  );
  if (segments.length === 1 && segments[0].type === "text") {
    return /* @__PURE__ */ jsxRuntime.jsx(
      MessageContent,
      {
        content,
        onFileClick,
        enableFileLinks
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-2", children: segments.map((segment, index) => {
    if (segment.type === "text") {
      return /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(
        MessageContent,
        {
          content: segment.content,
          onFileClick,
          enableFileLinks
        }
      ) }, index);
    }
    return /* @__PURE__ */ jsxRuntime.jsx(
      CollapsibleFileReference,
      {
        segment,
        onFileClick,
        defaultExpanded: false
      },
      index
    );
  }) });
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Status and state related icons
 */
const PlanCompletedIcon = ({
  size = 14,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsxs(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 14 14",
    fill: "none",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("circle", { cx: "7", cy: "7", r: "6", fill: "currentColor", opacity: "0.2" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "path",
        {
          d: "M4 7.5L6 9.5L10 4.5",
          stroke: "currentColor",
          strokeWidth: "1.5",
          strokeLinecap: "round",
          strokeLinejoin: "round"
        }
      )
    ]
  }
);
const PlanInProgressIcon = ({
  size = 14,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 14 14",
    fill: "none",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "circle",
      {
        cx: "7",
        cy: "7",
        r: "5",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2.5"
      }
    )
  }
);
const PlanPendingIcon = ({
  size = 14,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 14 14",
    fill: "none",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "circle",
      {
        cx: "7",
        cy: "7",
        r: "5.5",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "1"
      }
    )
  }
);
const WarningTriangleIcon = ({
  size = 20,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        fillRule: "evenodd",
        d: "M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
        clipRule: "evenodd"
      }
    )
  }
);
const UserIcon = ({ size = 16, className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" })
  }
);
const SymbolIcon = ({
  size = 16,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M8 1a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 7.293V1.5A.5.5 0 0 1 8 1Z" })
  }
);
const SelectionIcon = ({
  size = 16,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M2 3.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5Z" })
  }
);
const CheckIcon = ({
  size = 16,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        fillRule: "evenodd",
        d: "M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z",
        clipRule: "evenodd"
      }
    )
  }
);
function getMessageDate(timestamp) {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp) || timestamp <= 0) {
    return null;
  }
  return new Date(timestamp);
}
function formatMessageTime(timestamp) {
  const date = getMessageDate(timestamp);
  if (!date) {
    return null;
  }
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
function formatMessageDateTime(timestamp) {
  const date = getMessageDate(timestamp);
  if (!date) {
    return void 0;
  }
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
const MessageMeta = ({
  timestamp,
  copyText,
  onEdit,
  editDisabled = false,
  editIcon
}) => {
  var _a2;
  const platform = usePlatform();
  const platformCopyToClipboard = platform.copyToClipboard;
  const [copied, setCopied] = react.useState(false);
  const resetTimerRef = react.useRef(null);
  const formattedTime = formatMessageTime(timestamp);
  const canCopy = ((_a2 = platform.features) == null ? void 0 : _a2.canCopy) !== false && copyText.length > 0;
  const dateTime = formatMessageDateTime(timestamp);
  react.useEffect(
    () => () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    },
    []
  );
  const handleCopy = react.useCallback(
    async (event) => {
      event.stopPropagation();
      if (!canCopy) {
        return;
      }
      try {
        if (platformCopyToClipboard) {
          await platformCopyToClipboard(copyText);
        } else {
          await navigator.clipboard.writeText(copyText);
        }
        setCopied(true);
        if (resetTimerRef.current !== null) {
          window.clearTimeout(resetTimerRef.current);
        }
        resetTimerRef.current = window.setTimeout(() => {
          setCopied(false);
          resetTimerRef.current = null;
        }, 1400);
      } catch (error2) {
        console.error("Failed to copy message:", error2);
      }
    },
    [canCopy, copyText, platformCopyToClipboard]
  );
  if (!formattedTime && !canCopy && !onEdit) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mt-1 flex min-h-6 items-center gap-1 text-xs text-[var(--app-secondary-foreground)]", children: [
    formattedTime && /* @__PURE__ */ jsxRuntime.jsx("time", { className: "select-none opacity-60", dateTime, children: formattedTime }),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: `flex items-center gap-0.5 transition-opacity focus-within:opacity-100 ${copied ? "opacity-100" : "opacity-0 group-hover:opacity-70"}`,
        children: [
          canCopy && /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              className: `inline-flex h-6 w-6 items-center justify-center rounded-sm border border-transparent bg-transparent transition-colors hover:bg-[var(--app-ghost-button-hover-background)] hover:opacity-100 focus:opacity-100 ${copied ? "text-[#74c991] opacity-100" : ""}`,
              title: copied ? "Copied" : "Copy message",
              "aria-label": copied ? "Copied" : "Copy message",
              onClick: handleCopy,
              children: copied ? /* @__PURE__ */ jsxRuntime.jsx(CheckIcon, { size: 14 }) : /* @__PURE__ */ jsxRuntime.jsx(CopyIcon, { size: 14 })
            }
          ),
          onEdit && /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              type: "button",
              className: "inline-flex h-6 w-6 items-center justify-center rounded-sm border border-transparent bg-transparent transition-colors hover:bg-[var(--app-ghost-button-hover-background)] hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-30",
              title: "Edit message",
              "aria-label": "Edit message",
              onClick: onEdit,
              disabled: editDisabled,
              children: editIcon
            }
          )
        ]
      }
    )
  ] });
};
const UserMessageBase = ({
  content,
  timestamp,
  onFileClick,
  fileContext,
  onEdit,
  editDisabled = false
}) => {
  const getFileContextDisplay = () => {
    if (!fileContext) {
      return null;
    }
    const { fileName, startLine, endLine } = fileContext;
    if (startLine != null) {
      if (endLine != null && endLine !== startLine) {
        return `${fileName}#${startLine}-${endLine}`;
      }
      return `${fileName}#${startLine}`;
    }
    return fileName;
  };
  const fileContextDisplay = getFileContextDisplay();
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: "qwen-message user-message-container group flex gap-0 my-1 items-start text-left flex-col relative",
      style: { position: "relative" },
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: "inline-block relative whitespace-pre-wrap rounded-md max-w-full overflow-x-auto overflow-y-hidden select-text leading-[1.5]",
            style: {
              border: "1px solid var(--app-input-border)",
              borderRadius: "var(--corner-radius-medium)",
              backgroundColor: "var(--app-input-background)",
              padding: "4px 6px",
              color: "var(--app-primary-foreground)"
            },
            children: /* @__PURE__ */ jsxRuntime.jsx(
              CollapsibleFileContent,
              {
                content,
                onFileClick,
                enableFileLinks: false
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          MessageMeta,
          {
            timestamp,
            copyText: content,
            onEdit,
            editDisabled,
            editIcon: /* @__PURE__ */ jsxRuntime.jsx(EditPencilIcon, { size: 14 })
          }
        ),
        fileContextDisplay && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mt-1", children: /* @__PURE__ */ jsxRuntime.jsx(
          "button",
          {
            type: "button",
            className: "inline-flex items-center py-0 pr-2 gap-1 rounded-sm cursor-pointer relative opacity-50 bg-transparent border-none",
            onClick: () => fileContext && (onFileClick == null ? void 0 : onFileClick(fileContext.filePath)),
            disabled: !onFileClick,
            children: /* @__PURE__ */ jsxRuntime.jsx(
              "span",
              {
                title: fileContextDisplay,
                style: {
                  fontSize: "12px",
                  color: "var(--app-secondary-foreground)"
                },
                children: fileContextDisplay
              }
            )
          }
        ) })
      ]
    }
  );
};
UserMessageBase.displayName = "UserMessage";
const UserMessage = react.memo(UserMessageBase);
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * File and document related icons
 */
const FileIcon = ({ size = 16, className, ...props }) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M9 2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7l-5-5zm3 7V3.5L10.5 2H10v3a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V2H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1zM6 3h3v2H6V3z" })
  }
);
const FileListIcon = ({
  size = 16,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M5 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5Z" })
  }
);
const SaveDocumentIcon = ({
  size = 16,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsxs(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M2.66663 2.66663H10.6666L13.3333 5.33329V13.3333H2.66663V2.66663Z" }),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M8 10.6666V8M8 8V5.33329M8 8H10.6666M8 8H5.33329" })
    ]
  }
);
const FolderIcon = ({
  size = 16,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 16 16",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M1.5 3A1.5 1.5 0 0 1 3 1.5h3.086a1.5 1.5 0 0 1 1.06.44L8.5 3H13A1.5 1.5 0 0 1 14.5 4.5v7A1.5 1.5 0 0 1 13 13H3A1.5 1.5 0 0 1 1.5 11.5v-8Z" })
  }
);
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Special UI icons
 */
const ThinkingIcon = ({
  size = 16,
  className,
  enabled = false,
  style,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    "aria-hidden": "true",
    ...props,
    children: /* @__PURE__ */ jsxRuntime.jsx(
      "path",
      {
        d: "M8.00293 1.11523L8.35059 1.12402H8.35352C11.9915 1.30834 14.8848 4.31624 14.8848 8C14.8848 11.8025 11.8025 14.8848 8 14.8848C4.19752 14.8848 1.11523 11.8025 1.11523 8C1.11523 7.67691 1.37711 7.41504 1.7002 7.41504C2.02319 7.41514 2.28516 7.67698 2.28516 8C2.28516 11.1563 4.84369 13.7148 8 13.7148C11.1563 13.7148 13.7148 11.1563 13.7148 8C13.7148 4.94263 11.3141 2.4464 8.29492 2.29297V2.29199L7.99609 2.28516H7.9873V2.28418L7.89648 2.27539L7.88281 2.27441V2.27344C7.61596 2.21897 7.41513 1.98293 7.41504 1.7002C7.41504 1.37711 7.67691 1.11523 8 1.11523H8.00293ZM8 3.81543C8.32309 3.81543 8.58496 4.0773 8.58496 4.40039V7.6377L10.9619 8.82715C11.2505 8.97169 11.3678 9.32256 11.2236 9.61133C11.0972 9.86425 10.8117 9.98544 10.5488 9.91504L10.5352 9.91211V9.91016L10.4502 9.87891L10.4385 9.87402V9.87305L7.73828 8.52344C7.54007 8.42433 7.41504 8.22155 7.41504 8V4.40039C7.41504 4.0773 7.67691 3.81543 8 3.81543ZM2.44336 5.12695C2.77573 5.19517 3.02597 5.48929 3.02637 5.8418C3.02637 6.19456 2.7761 6.49022 2.44336 6.55859L2.2959 6.57324C1.89241 6.57324 1.56543 6.24529 1.56543 5.8418C1.56588 5.43853 1.89284 5.1123 2.2959 5.1123L2.44336 5.12695ZM3.46094 2.72949C3.86418 2.72984 4.19017 3.05712 4.19043 3.45996V3.46094C4.19009 3.86393 3.86392 4.19008 3.46094 4.19043H3.45996C3.05712 4.19017 2.72983 3.86419 2.72949 3.46094V3.45996C2.72976 3.05686 3.05686 2.72976 3.45996 2.72949H3.46094ZM5.98926 1.58008C6.32235 1.64818 6.57324 1.94276 6.57324 2.2959L6.55859 2.44336C6.49022 2.7761 6.19456 3.02637 5.8418 3.02637C5.43884 3.02591 5.11251 2.69895 5.1123 2.2959L5.12695 2.14844C5.19504 1.81591 5.48906 1.56583 5.8418 1.56543L5.98926 1.58008Z",
        strokeWidth: "0.27",
        style: {
          stroke: enabled ? "var(--app-qwen-ivory)" : "var(--app-secondary-foreground)",
          fill: enabled ? "var(--app-qwen-ivory)" : "var(--app-secondary-foreground)",
          ...style
        }
      }
    )
  }
);
const TerminalIcon = ({
  size = 20,
  className,
  ...props
}) => /* @__PURE__ */ jsxRuntime.jsxs(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    width: size,
    height: size,
    className,
    "aria-hidden": "true",
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        "path",
        {
          fillRule: "evenodd",
          d: "M5.14648 7.14648C5.34175 6.95122 5.65825 6.95122 5.85352 7.14648L8.35352 9.64648C8.44728 9.74025 8.5 9.86739 8.5 10C8.5 10.0994 8.47037 10.1958 8.41602 10.2773L8.35352 10.3535L5.85352 12.8535C5.65825 13.0488 5.34175 13.0488 5.14648 12.8535C4.95122 12.6583 4.95122 12.3417 5.14648 12.1465L7.29297 10L5.14648 7.85352C4.95122 7.65825 4.95122 7.34175 5.14648 7.14648Z",
          clipRule: "evenodd"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M14.5 12C14.7761 12 15 12.2239 15 12.5C15 12.7761 14.7761 13 14.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H14.5Z" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "path",
        {
          fillRule: "evenodd",
          d: "M16.5 4C17.3284 4 18 4.67157 18 5.5V14.5C18 15.3284 17.3284 16 16.5 16H3.5C2.67157 16 2 15.3284 2 14.5V5.5C2 4.67157 2.67157 4 3.5 4H16.5ZM3.5 5C3.22386 5 3 5.22386 3 5.5V14.5C3 14.7761 3.22386 15 3.5 15H16.5C16.7761 15 17 14.7761 17 14.5V5.5C17 5.22386 16.7761 5 16.5 5H3.5Z",
          clipRule: "evenodd"
        }
      )
    ]
  }
);
const ThinkingMessageBase = ({
  content,
  timestamp: _timestamp,
  onFileClick,
  defaultExpanded = false,
  status = "default"
}) => {
  const [isExpanded, setIsExpanded] = useControlledExpanded(defaultExpanded);
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: `qwen-message message-item thinking-message thinking-status-${status}`,
      children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "thinking-content-wrapper", children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          "button",
          {
            type: "button",
            onClick: handleToggle,
            className: "thinking-toggle-btn",
            "aria-expanded": isExpanded,
            "aria-label": isExpanded ? "Collapse thinking" : "Expand thinking",
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "thinking-label", children: "Thinking" }),
              /* @__PURE__ */ jsxRuntime.jsx(
                ChevronIcon,
                {
                  size: 12,
                  direction: isExpanded ? "up" : "down",
                  className: "thinking-chevron"
                }
              )
            ]
          }
        ),
        isExpanded && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "thinking-content", children: /* @__PURE__ */ jsxRuntime.jsx(MessageContent, { content, onFileClick }) })
      ] })
    }
  );
};
ThinkingMessageBase.displayName = "ThinkingMessage";
const ThinkingMessage = react.memo(ThinkingMessageBase);
const AssistantMessageBase = ({
  content,
  timestamp,
  onFileClick,
  status = "default",
  hideStatusIcon = false,
  isFirst = false,
  isLast = false
}) => {
  if (!content || content.trim().length === 0) {
    return null;
  }
  const getStatusClass = () => {
    if (hideStatusIcon) {
      return "";
    }
    switch (status) {
      case "success":
        return "assistant-message-success";
      case "error":
        return "assistant-message-error";
      case "warning":
        return "assistant-message-warning";
      case "loading":
        return "assistant-message-loading";
      default:
        return "assistant-message-default";
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: `qwen-message message-item assistant-message-container group ${getStatusClass()}`,
      "data-first": isFirst,
      "data-last": isLast,
      style: {
        width: "100%",
        alignItems: "flex-start",
        paddingLeft: "30px",
        userSelect: "text",
        position: "relative"
      },
      children: /* @__PURE__ */ jsxRuntime.jsxs("span", { style: { width: "100%" }, children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            style: {
              margin: 0,
              width: "100%",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "normal"
            },
            children: /* @__PURE__ */ jsxRuntime.jsx(
              MessageContent,
              {
                content,
                onFileClick,
                enableFileLinks: false
              }
            )
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(MessageMeta, { timestamp, copyText: content })
      ] })
    }
  );
};
AssistantMessageBase.displayName = "AssistantMessage";
const AssistantMessage = react.memo(AssistantMessageBase);
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));
const InsightProgressCard = ({
  stage,
  progress,
  detail
}) => {
  const percent = clamp(progress);
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full px-[30px] py-2", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "min-w-0 truncate text-sm leading-6 text-[var(--vscode-foreground)]", children: stage }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "row-span-2 shrink-0 self-center text-xs leading-none tabular-nums text-[var(--vscode-descriptionForeground)]", children: [
      percent,
      "%"
    ] }),
    detail ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "min-w-0 truncate text-xs leading-5 text-[var(--vscode-descriptionForeground)]", children: detail }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-xs leading-5 text-[var(--vscode-descriptionForeground)]", children: "Processing your chat history…" })
  ] }) });
};
const AskUserQuestionDialog = ({
  questions,
  onSubmit,
  onCancel
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = react.useState(0);
  const [answers, setAnswers] = react.useState({});
  const [showCustomInput, setShowCustomInput] = react.useState(false);
  const containerRef = react.useRef(null);
  const customInputRef = react.useRef(null);
  const hasMultipleQuestions = questions.length > 1;
  const totalTabs = hasMultipleQuestions ? questions.length + 1 : questions.length;
  const isSubmitTab = hasMultipleQuestions && currentQuestionIndex === totalTabs - 1;
  const currentQuestion = isSubmitTab ? null : questions[currentQuestionIndex];
  const isMultiSelect = (currentQuestion == null ? void 0 : currentQuestion.multiSelect) ?? false;
  const currentAnswer = answers[currentQuestionIndex] || {};
  const getAnswerForQuestion = react.useCallback(
    (idx) => {
      const q = questions[idx];
      const answerState = answers[idx];
      if (!answerState) {
        return void 0;
      }
      if (q == null ? void 0 : q.multiSelect) {
        const selections = [...answerState.multiSelectedOptions || []];
        const customValue = (answerState.customInput || "").trim();
        if (answerState.customInputChecked && customValue) {
          selections.push(customValue);
        }
        return selections.length > 0 ? selections.join(", ") : void 0;
      }
      if (answerState.customInput && answerState.customInput.trim()) {
        const matchesOption = q == null ? void 0 : q.options.some(
          (opt) => {
            var _a2;
            return opt.label === ((_a2 = answerState.customInput) == null ? void 0 : _a2.trim());
          }
        );
        if (!matchesOption) {
          return answerState.customInput.trim();
        }
      }
      return answerState.selectedOption;
    },
    [questions, answers]
  );
  const handleSubmit = react.useCallback(() => {
    const answersRecord = {};
    questions.forEach((_, idx) => {
      const answer = getAnswerForQuestion(idx);
      if (answer !== void 0) {
        answersRecord[idx] = answer;
      }
    });
    onSubmit(answersRecord);
  }, [questions, onSubmit, getAnswerForQuestion]);
  const handleMultiSelectConfirm = react.useCallback(() => {
    if (!currentQuestion) {
      return;
    }
    const answerState = answers[currentQuestionIndex] || {};
    const selections = [...answerState.multiSelectedOptions || []];
    const customValue = (answerState.customInput || "").trim();
    if (answerState.customInputChecked && customValue) {
      selections.push(customValue);
    }
    if (selections.length === 0) {
      return;
    }
    const value = selections.join(", ");
    const updatedAnswers = {
      ...answers,
      [currentQuestionIndex]: {
        ...answerState,
        selectedOption: value
      }
    };
    setAnswers(updatedAnswers);
    if (!hasMultipleQuestions) {
      onSubmit({ [currentQuestionIndex]: value });
    } else if (currentQuestionIndex < totalTabs - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowCustomInput(false);
    }
  }, [
    currentQuestion,
    answers,
    currentQuestionIndex,
    hasMultipleQuestions,
    totalTabs,
    onSubmit
  ]);
  const handleOptionSelect = react.useCallback(
    (optionIndex) => {
      if (!currentQuestion) {
        return;
      }
      if (isMultiSelect) {
        const answerState = answers[currentQuestionIndex] || {};
        const current = answerState.multiSelectedOptions || [];
        const option = currentQuestion.options[optionIndex];
        const isChecked = current.includes(option.label);
        const updated = isChecked ? current.filter((l) => l !== option.label) : [...current, option.label];
        setAnswers({
          ...answers,
          [currentQuestionIndex]: {
            ...answerState,
            multiSelectedOptions: updated
          }
        });
      } else {
        const option = currentQuestion.options[optionIndex];
        const answerState = answers[currentQuestionIndex] || {};
        const updated = {
          ...answerState,
          selectedOption: option.label,
          customInput: void 0
        };
        setAnswers({ ...answers, [currentQuestionIndex]: updated });
        if (!hasMultipleQuestions) {
          onSubmit({ [currentQuestionIndex]: option.label });
        } else if (currentQuestionIndex < totalTabs - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setShowCustomInput(false);
        }
      }
    },
    [
      currentQuestion,
      isMultiSelect,
      answers,
      currentQuestionIndex,
      hasMultipleQuestions,
      totalTabs,
      onSubmit
    ]
  );
  const handleCustomInputChange = (value) => {
    const answerState = answers[currentQuestionIndex] || {};
    setAnswers({
      ...answers,
      [currentQuestionIndex]: {
        ...answerState,
        customInput: value,
        customInputChecked: isMultiSelect && value.trim().length > 0
      }
    });
  };
  const handleCustomInputSubmit = () => {
    var _a2;
    const value = ((_a2 = currentAnswer.customInput) == null ? void 0 : _a2.trim()) || "";
    if (!value) {
      return;
    }
    if (isMultiSelect) {
      const answerState = answers[currentQuestionIndex] || {};
      setAnswers({
        ...answers,
        [currentQuestionIndex]: {
          ...answerState,
          customInputChecked: !answerState.customInputChecked
        }
      });
    } else {
      const answerState = answers[currentQuestionIndex] || {};
      const updated = {
        ...answerState,
        selectedOption: value
      };
      setAnswers({ ...answers, [currentQuestionIndex]: updated });
      if (!hasMultipleQuestions) {
        onSubmit({ [currentQuestionIndex]: value });
      } else if (currentQuestionIndex < totalTabs - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowCustomInput(false);
      }
    }
  };
  react.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);
  react.useEffect(() => {
    if (showCustomInput && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [showCustomInput]);
  react.useEffect(() => {
    setShowCustomInput(false);
  }, [currentQuestionIndex]);
  const renderTabs = () => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-2 mb-4 overflow-x-auto", children: [
    questions.map((q, idx) => {
      const isAnswered = getAnswerForQuestion(idx) !== void 0;
      const isActive = idx === currentQuestionIndex;
      return /* @__PURE__ */ jsxRuntime.jsxs(
        "button",
        {
          className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors border-none ${isActive ? "bg-[var(--app-button-background)] text-[var(--app-button-foreground)] font-bold" : "bg-[var(--app-button-secondary-background)] text-[var(--app-secondary-foreground)] hover:opacity-80"}`,
          onClick: () => setCurrentQuestionIndex(idx),
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: q.header }),
            isAnswered && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-green-500", children: "✓" })
          ]
        },
        idx
      );
    }),
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap cursor-pointer transition-colors border-none ${isSubmitTab ? "bg-[var(--app-button-background)] text-[var(--app-button-foreground)] font-bold" : "bg-[var(--app-button-secondary-background)] text-[var(--app-secondary-foreground)] opacity-60 hover:opacity-80"}`,
        onClick: () => setCurrentQuestionIndex(totalTabs - 1),
        children: /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Submit" })
      }
    )
  ] });
  const containerStyle = {
    backgroundColor: "var(--app-input-secondary-background)",
    borderColor: "var(--app-input-border)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
  };
  if (isSubmitTab) {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        ref: containerRef,
        className: "fixed inset-x-4 bottom-4 z-[1000] rounded-lg border p-4 outline-none animate-slide-up",
        style: containerStyle,
        children: [
          renderTabs(),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "font-bold text-[var(--app-primary-foreground)] mb-2", children: "Your answers:" }),
            questions.map((q, idx) => {
              const answer = getAnswerForQuestion(idx);
              return /* @__PURE__ */ jsxRuntime.jsxs(
                "div",
                {
                  className: "ml-2 mb-1 text-[var(--app-secondary-foreground)]",
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "font-semibold", children: [
                      q.header,
                      ":"
                    ] }),
                    " ",
                    answer ? /* @__PURE__ */ jsxRuntime.jsx("span", { style: { color: "var(--app-link-color)" }, children: answer }) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: "opacity-60", children: "(not answered)" })
                  ]
                },
                idx
              );
            })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-2 mt-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                className: "px-4 py-2 rounded-md font-medium transition-colors cursor-pointer border-none",
                style: {
                  backgroundColor: "var(--app-button-background)",
                  color: "var(--app-button-foreground)"
                },
                onClick: handleSubmit,
                children: "Submit"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                className: "px-4 py-2 rounded-md font-medium transition-colors cursor-pointer border-none hover:opacity-80",
                style: {
                  backgroundColor: "var(--app-button-secondary-background)",
                  color: "var(--app-primary-foreground)"
                },
                onClick: onCancel,
                children: "Cancel"
              }
            )
          ] })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      ref: containerRef,
      className: "fixed inset-x-4 bottom-4 z-[1000] rounded-lg border p-4 outline-none animate-slide-up",
      style: containerStyle,
      children: [
        hasMultipleQuestions && renderTabs(),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "mb-4", children: [
          !hasMultipleQuestions && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsxRuntime.jsx(
            "span",
            {
              className: "font-bold text-lg",
              style: { color: "var(--app-link-color)" },
              children: currentQuestion.header
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[var(--app-primary-foreground)] text-base", children: currentQuestion.question })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-2 mb-3", children: [
          currentQuestion.options.map((opt, index) => {
            var _a2;
            const isSelected = !isMultiSelect && currentAnswer.selectedOption === opt.label;
            const isMultiChecked = isMultiSelect && ((_a2 = currentAnswer.multiSelectedOptions) == null ? void 0 : _a2.includes(opt.label));
            return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntime.jsxs(
                "button",
                {
                  className: `flex items-center gap-2 px-3 py-2 text-left w-full rounded-md border transition-colors duration-150 cursor-pointer ${isSelected || isMultiChecked ? "bg-[var(--app-list-active-background)] text-[var(--app-list-active-foreground)]" : "bg-[var(--app-button-secondary-background)] text-[var(--app-primary-foreground)] hover:bg-[var(--app-list-active-background)] hover:text-[var(--app-list-active-foreground)]"}`,
                  onClick: () => handleOptionSelect(index),
                  children: [
                    isMultiSelect ? /* @__PURE__ */ jsxRuntime.jsx("span", { className: "min-w-[18px]", children: isMultiChecked ? "☑" : "☐" }) : /* @__PURE__ */ jsxRuntime.jsx("span", { className: "min-w-[18px]", children: isSelected ? "●" : "○" }),
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-1", children: opt.label })
                  ]
                }
              ),
              opt.description && /* @__PURE__ */ jsxRuntime.jsx(
                "div",
                {
                  className: "ml-8 mt-1 text-sm opacity-70",
                  style: { color: "var(--app-secondary-foreground)" },
                  children: opt.description
                }
              )
            ] }, index);
          }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col", children: showCustomInput ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
            isMultiSelect && /* @__PURE__ */ jsxRuntime.jsx(
              "span",
              {
                className: "min-w-[18px] cursor-pointer",
                onClick: () => {
                  const answerState = answers[currentQuestionIndex] || {};
                  setAnswers({
                    ...answers,
                    [currentQuestionIndex]: {
                      ...answerState,
                      customInputChecked: !answerState.customInputChecked
                    }
                  });
                },
                children: currentAnswer.customInputChecked ? "☑" : "☐"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "input",
              {
                ref: customInputRef,
                type: "text",
                className: "flex-1 px-3 py-2 rounded-md border focus:outline-none focus:ring-1",
                style: {
                  backgroundColor: "var(--app-input-background)",
                  borderColor: "var(--app-input-border)",
                  color: "var(--app-primary-foreground)"
                },
                value: currentAnswer.customInput || "",
                onChange: (e) => handleCustomInputChange(e.target.value),
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCustomInputSubmit();
                  }
                },
                placeholder: "Type your answer..."
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntime.jsxs(
            "button",
            {
              className: "flex items-center gap-2 px-3 py-2 text-left w-full rounded-md border transition-colors duration-150 cursor-pointer\n                bg-[var(--app-button-secondary-background)] text-[var(--app-secondary-foreground)] hover:bg-[var(--app-list-active-background)] hover:text-[var(--app-list-active-foreground)]",
              onClick: () => setShowCustomInput(true),
              children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "min-w-[18px]", children: "✎" }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-1 opacity-70", children: currentAnswer.customInput || "Other..." })
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex gap-2 mt-3", children: [
          isMultiSelect && /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              className: "px-4 py-2 rounded-md font-medium transition-colors cursor-pointer border-none",
              style: {
                backgroundColor: "var(--app-button-background)",
                color: "var(--app-button-foreground)"
              },
              onClick: handleMultiSelectConfirm,
              children: "Confirm"
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              className: "px-4 py-2 rounded-md font-medium transition-colors cursor-pointer border-none hover:opacity-80",
              style: {
                backgroundColor: "var(--app-button-secondary-background)",
                color: "var(--app-primary-foreground)"
              },
              onClick: onCancel,
              children: "Cancel"
            }
          )
        ] })
      ]
    }
  );
};
const ImagePreview = ({ images, onRemove }) => {
  if (images.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "image-preview-container flex gap-2 px-2 pb-2", children: images.map((image2) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "image-preview-item relative group", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "img",
      {
        src: image2.data,
        alt: image2.name,
        className: "w-14 h-14 object-cover rounded-md border border-gray-500 dark:border-gray-600",
        title: image2.name
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        type: "button",
        onClick: () => onRemove(image2.id),
        className: "absolute -top-2 -right-2 w-5 h-5 bg-gray-700 dark:bg-gray-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800 dark:hover:bg-gray-500",
        "aria-label": `Remove ${image2.name}`,
        children: /* @__PURE__ */ jsxRuntime.jsx(CloseSmallIcon, {})
      }
    )
  ] }) }, image2.id)) });
};
const ImageMessageRenderer = ({
  msg,
  imageIndex
}) => {
  if (msg.kind !== "image" || !msg.imagePath) {
    return null;
  }
  const label = `[Image #${imageIndex}]`;
  const showImage = Boolean(msg.imageSrc) && !msg.imageMissing;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "qwen-message user-message-container flex gap-0 my-1 items-start text-left flex-col relative", children: /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: "inline-block relative whitespace-pre-wrap rounded-md max-w-full overflow-x-auto overflow-y-hidden select-text leading-[1.5]",
      style: {
        border: "1px solid var(--app-input-border)",
        borderRadius: "var(--corner-radius-medium)",
        backgroundColor: "var(--app-input-background)",
        padding: "6px 8px",
        color: "var(--app-primary-foreground)"
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            style: {
              fontSize: "12px",
              color: "var(--app-secondary-foreground)",
              marginBottom: "4px"
            },
            children: label
          }
        ),
        showImage ? /* @__PURE__ */ jsxRuntime.jsx(
          "img",
          {
            src: msg.imageSrc,
            alt: msg.imagePath,
            className: "max-w-full rounded-md border border-gray-600"
          }
        ) : /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            style: {
              fontSize: "12px",
              color: "var(--app-secondary-foreground)"
            },
            children: [
              "@",
              msg.imagePath
            ]
          }
        )
      ]
    }
  ) });
};
const ToolCallContainer = ({
  label,
  status = "success",
  children,
  toolCallId: _toolCallId,
  labelSuffix,
  className: _className,
  isFirst = false,
  isLast = false
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "div",
  {
    className: `qwen-message message-item ${_className || ""} relative pl-[30px] py-2 select-text toolcall-container toolcall-status-${status}`,
    "data-first": isFirst,
    "data-last": isLast,
    children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "toolcall-content-wrapper flex flex-col min-w-0 max-w-full", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-baseline gap-1.5 relative min-w-0", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[14px] leading-none font-bold text-[var(--app-primary-foreground)]", children: label }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] text-[var(--app-secondary-foreground)]", children: labelSuffix })
      ] }),
      children && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[var(--app-secondary-foreground)]", children })
    ] })
  }
);
const ToolCallCard = ({
  icon: _icon,
  children
}) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-[auto_1fr] gap-medium bg-[var(--app-input-background)] border border-[var(--app-input-border)] rounded-medium p-large my-medium items-start animate-[fadeIn_0.2s_ease-in] toolcall-card", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-medium min-w-0", children }) });
const ToolCallRow = ({ label, children }) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-[80px_1fr] gap-medium min-w-0", children: [
  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-xs text-[var(--app-secondary-foreground)] font-medium pt-[2px]", children: label }),
  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[var(--app-primary-foreground)] min-w-0 break-words", children })
] });
const getStatusColorClass = (status) => {
  switch (status) {
    case "pending":
      return "bg-[#ffc107]";
    case "in_progress":
      return "bg-[#2196f3]";
    case "completed":
      return "bg-[#4caf50]";
    case "failed":
      return "bg-[#f44336]";
    default:
      return "bg-gray-500";
  }
};
const StatusIndicator = ({ status, text: text2 }) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "inline-block font-medium relative", title: status, children: [
  /* @__PURE__ */ jsxRuntime.jsx(
    "span",
    {
      className: `inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${getStatusColorClass(status)}`
    }
  ),
  text2
] });
const CodeBlock = ({ children }) => /* @__PURE__ */ jsxRuntime.jsx("pre", { className: "font-mono text-[var(--app-monospace-font-size)] bg-[var(--app-primary-background)] border border-[var(--app-input-border)] rounded-small p-medium overflow-x-auto mt-1 whitespace-pre-wrap break-words max-h-[300px] overflow-y-auto", children });
const LocationsList = ({ locations }) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "toolcall-locations-list flex flex-col gap-1 max-w-full", children: locations.map((loc, idx) => /* @__PURE__ */ jsxRuntime.jsx(FileLink, { path: loc.path, line: loc.line, showFullPath: true }, idx)) });
const CollapsibleOutput$1 = ({
  children,
  isCollapsible,
  collapsedHeight = 200,
  fadeStart = 140,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useControlledExpanded(false);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-[3px]", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: `toolcall-collapsible-output-content overflow-hidden ${className}`,
        style: !isExpanded && isCollapsible ? {
          maxHeight: `${collapsedHeight}px`,
          maskImage: `linear-gradient(to bottom, var(--app-primary-background) ${fadeStart}px, transparent ${collapsedHeight}px)`,
          WebkitMaskImage: `linear-gradient(to bottom, var(--app-primary-background) ${fadeStart}px, transparent ${collapsedHeight}px)`
        } : void 0,
        children
      }
    ),
    isCollapsible && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-center border-t border-[var(--app-input-border)] pt-1", children: /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        type: "button",
        onClick: (event) => {
          event.stopPropagation();
          setIsExpanded((expanded) => !expanded);
        },
        "aria-expanded": isExpanded,
        "aria-label": isExpanded ? "Collapse output" : "Expand output",
        className: "text-[var(--app-secondary-foreground)] text-[0.8em] hover:text-[var(--app-primary-foreground)] cursor-pointer bg-transparent border-none px-2 py-1 rounded hover:bg-[var(--app-input-background)] transition-colors",
        children: isExpanded ? "▲ Collapse" : "▼ Show more"
      }
    ) })
  ] });
};
const handleCopyToClipboard = async (text2, event, platformCopy) => {
  event.stopPropagation();
  try {
    if (platformCopy) {
      await platformCopy(text2);
    } else {
      await navigator.clipboard.writeText(text2);
    }
  } catch (err) {
    console.error("Failed to copy text:", err);
  }
};
const CopyButton = ({ text: text2 }) => {
  var _a2;
  const [showTooltip, setShowTooltip] = react.useState(false);
  const platform = usePlatform();
  const handleClick = react.useCallback(
    async (e) => {
      await handleCopyToClipboard(text2, e, platform.copyToClipboard);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 1e3);
    },
    [text2, platform.copyToClipboard]
  );
  const canCopy = ((_a2 = platform.features) == null ? void 0 : _a2.canCopy) !== false;
  if (!canCopy) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "button",
    {
      className: "col-start-3 bg-transparent border-none px-2 py-1.5 cursor-pointer text-[var(--app-secondary-foreground)] opacity-0 transition-opacity duration-200 ease-out flex items-center justify-center rounded relative group-hover:opacity-70 hover:!opacity-100 hover:bg-[var(--app-input-border)] active:scale-95",
      onClick: handleClick,
      title: "Copy",
      "aria-label": "Copy to clipboard",
      type: "button",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "svg",
          {
            width: "14",
            height: "14",
            viewBox: "0 0 16 16",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            children: /* @__PURE__ */ jsxRuntime.jsx(
              "path",
              {
                d: "M4 4V3C4 2.44772 4.44772 2 5 2H13C13.5523 2 14 2.44772 14 3V11C14 11.5523 13.5523 12 13 12H12M3 6H11C11.5523 6 12 6.44772 12 7V13C12 13.5523 11.5523 14 11 14H3C2.44772 14 2 13.5523 2 13V7C2 6.44772 2.44772 6 3 6Z",
                stroke: "currentColor",
                strokeWidth: "1.5",
                strokeLinecap: "round",
                strokeLinejoin: "round"
              }
            )
          }
        ),
        showTooltip && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "absolute -top-7 right-0 bg-[var(--app-tool-background)] text-[var(--app-primary-foreground)] px-2 py-1 rounded text-xs whitespace-nowrap border border-[var(--app-input-border)] pointer-events-none", children: "Copied!" })
      ]
    }
  );
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared utility functions for tool call components
 * Platform-agnostic utilities that can be used across different platforms
 */
const extractCommandOutput = (text2) => {
  try {
    const parsed = JSON.parse(text2);
    const output = parsed.output ?? parsed.Output;
    if (output !== void 0 && output !== null) {
      return typeof output === "string" ? output : JSON.stringify(output, null, 2);
    }
  } catch (_error) {
  }
  const outputMatch = text2.match(
    /Output:[ \t]{0,20}(.{0,1000}?)(?=\nError:|$)/i
  );
  if (outputMatch && outputMatch[1]) {
    const output = outputMatch[1].trim();
    if (output && output !== "(none)" && output.length > 0) {
      return output;
    }
  }
  if (text2.match(/^Command:/)) {
    const lines = text2.split("\n");
    const outputLines = [];
    let inOutput = false;
    for (const line of lines) {
      if (line.startsWith("Error:") || line.startsWith("Exit Code:") || line.startsWith("Signal:") || line.startsWith("Background PIDs:") || line.startsWith("Process Group PGID:")) {
        break;
      }
      if (line.startsWith("Command:") || line.startsWith("Directory:")) {
        continue;
      }
      if (line.startsWith("Output:")) {
        inOutput = true;
        const content = line.substring("Output:".length).trim();
        if (content && content !== "(none)") {
          outputLines.push(content);
        }
        continue;
      }
      if (inOutput || !line.startsWith("Command:") && !line.startsWith("Directory:")) {
        outputLines.push(line);
      }
    }
    if (outputLines.length > 0) {
      const result = outputLines.join("\n").trim();
      if (result && result !== "(none)") {
        return result;
      }
    }
  }
  return text2;
};
const formatValue = (value) => {
  if (value === null || value === void 0) {
    return "";
  }
  if (typeof value === "string") {
    return extractCommandOutput(value);
  }
  if (value instanceof Error) {
    return value.message || value.toString();
  }
  if (typeof value === "object" && value !== null && "message" in value) {
    const errorObj = value;
    return errorObj.message || String(value);
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch (_e) {
      return String(value);
    }
  }
  return String(value);
};
const safeTitle = (title) => {
  if (typeof title === "string" && title.trim()) {
    return title;
  }
  if (title && typeof title === "object") {
    try {
      return JSON.stringify(title);
    } catch (_e) {
      return String(title);
    }
  }
  return "";
};
const shouldShowToolCall = (kind) => !kind.includes("internal");
const groupContent = (content) => {
  const textOutputs = [];
  const errors2 = [];
  const diffs = [];
  const otherData = [];
  content == null ? void 0 : content.forEach((item) => {
    if (item.type === "diff") {
      diffs.push(item);
    } else if (item.content) {
      const contentObj = item.content;
      const hasErrorField = contentObj.error != null;
      const isErrorType = contentObj.type === "error" && (contentObj.text != null || contentObj.error != null);
      const hasError = hasErrorField || isErrorType;
      if (hasError) {
        let errorMsg = "";
        if (typeof contentObj.error === "string") {
          errorMsg = contentObj.error;
        } else if (contentObj.error && typeof contentObj.error === "object" && "message" in contentObj.error) {
          errorMsg = contentObj.error.message;
        } else if (contentObj.text) {
          errorMsg = formatValue(contentObj.text);
        } else if (contentObj.error) {
          errorMsg = formatValue(contentObj.error);
        } else {
          errorMsg = "An error occurred";
        }
        errors2.push(errorMsg);
      } else if (contentObj.text) {
        textOutputs.push(formatValue(contentObj.text));
      } else {
        otherData.push(contentObj);
      }
    }
  });
  return { textOutputs, errors: errors2, diffs, otherData };
};
const hasToolCallOutput = (toolCall) => {
  if (toolCall.status === "failed") {
    return true;
  }
  const kind = toolCall.kind.toLowerCase();
  if (kind === "execute" || kind === "bash" || kind === "command") {
    if (toolCall.title && typeof toolCall.title === "string" && toolCall.title.trim()) {
      return true;
    }
  }
  if (toolCall.locations && toolCall.locations.length > 0) {
    return true;
  }
  if (toolCall.content && toolCall.content.length > 0) {
    const grouped = groupContent(toolCall.content);
    if (grouped.textOutputs.length > 0 || grouped.errors.length > 0 || grouped.diffs.length > 0 || grouped.otherData.length > 0) {
      return true;
    }
  }
  if (toolCall.title && typeof toolCall.title === "string" && toolCall.title.trim()) {
    return true;
  }
  return false;
};
const mapToolStatusToContainerStatus = (status) => {
  switch (status) {
    case "pending":
    case "in_progress":
      return "loading";
    case "failed":
      return "error";
    case "cancelled":
      return "warning";
    case "completed":
      return "success";
    default:
      return "default";
  }
};
const ThinkToolCall = ({
  toolCall,
  isFirst,
  isLast
}) => {
  const { content } = toolCall;
  const { textOutputs, errors: errors2 } = groupContent(content);
  if (errors2.length > 0) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolCallContainer,
      {
        label: "Think",
        status: "error",
        isFirst,
        isLast,
        children: errors2.join("\n")
      }
    );
  }
  if (textOutputs.length > 0) {
    const thoughts = textOutputs.join("\n\n");
    const isLong = thoughts.length > 200;
    if (isLong) {
      const isCollapsible = thoughts.length > 500;
      return /* @__PURE__ */ jsxRuntime.jsx(ToolCallCard, { icon: "💭", children: /* @__PURE__ */ jsxRuntime.jsx(ToolCallRow, { label: "Think", children: isCollapsible ? /* @__PURE__ */ jsxRuntime.jsx(
        CollapsibleOutput$1,
        {
          isCollapsible: true,
          className: "italic opacity-90 leading-relaxed",
          children: thoughts
        }
      ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "italic opacity-90 leading-relaxed", children: thoughts }) }) });
    }
    const status = toolCall.status === "pending" || toolCall.status === "in_progress" ? "loading" : toolCall.status === "failed" ? "error" : toolCall.status === "cancelled" ? "warning" : "default";
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolCallContainer,
      {
        label: "Think",
        status,
        isFirst,
        isLast,
        children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "italic opacity-90", children: thoughts })
      }
    );
  }
  return null;
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const normalizeValue = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";
const startsWithAny = (value, prefixes) => prefixes.some((prefix) => value.startsWith(prefix));
const getReadLikeLabelFromTitle = (title) => {
  const normalizedTitle = normalizeValue(title);
  if (startsWithAny(normalizedTitle, ["readmanyfiles", "read many files"])) {
    return "ReadManyFiles";
  }
  if (startsWithAny(normalizedTitle, [
    "listfiles",
    "list files",
    "list directory"
  ])) {
    return "ListFiles";
  }
  if (startsWithAny(normalizedTitle, ["readfile", "read file"])) {
    return "ReadFile";
  }
  if (startsWithAny(normalizedTitle, ["skill"])) {
    return "Skill";
  }
  return null;
};
const getToolDisplayLabel = ({
  kind,
  title
}) => {
  const normalizedKind = normalizeValue(kind);
  switch (normalizedKind) {
    case "execute":
    case "bash":
    case "command":
    case "shell":
    case "run_shell_command":
      return "Shell";
    case "todo_write":
    case "todowrite":
    case "update_todos":
    case "updated_plan":
    case "updatedplan":
      return "TodoList";
    case "web_fetch":
    case "webfetch":
    case "fetch":
      return "WebFetch";
    case "grep":
    case "grep_search":
      return "Grep";
    case "glob":
      return "Glob";
    case "search":
    case "find":
      return "Search";
    case "write":
    case "write_file":
    case "writefile":
      return "WriteFile";
    case "read_many_files":
    case "readmanyfiles":
      return "ReadManyFiles";
    case "list_directory":
    case "listfiles":
    case "ls":
      return "ListFiles";
    case "read_file":
    case "readfile":
      return "ReadFile";
    case "save_memory":
    case "savememory":
    case "memory":
      return "SaveMemory";
    case "enter_plan_mode":
      return "EnterPlanMode";
    case "exit_plan_mode":
    case "switch_mode": {
      const titleStr = typeof title === "string" ? title.toLowerCase() : "";
      if (titleStr.includes("enterplanmode") || titleStr.includes("enter plan")) {
        return "EnterPlanMode";
      }
      return "ExitPlanMode";
    }
    case "task":
      return "Task";
    case "skill":
      return "Skill";
    case "think":
    case "thinking":
      return "Think";
    case "read":
      return getReadLikeLabelFromTitle(title) ?? "Read";
    default:
      return kind;
  }
};
const EXPAND_THRESHOLD$1 = 400;
const GenericToolCall = ({
  toolCall,
  isFirst,
  isLast
}) => {
  const { kind, title, content, locations, toolCallId } = toolCall;
  const operationText = safeTitle(title);
  const displayLabel = getToolDisplayLabel({ kind, title });
  const { textOutputs, errors: errors2 } = groupContent(content);
  if (errors2.length > 0) {
    return /* @__PURE__ */ jsxRuntime.jsxs(ToolCallCard, { icon: "🔧", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ToolCallRow, { label: displayLabel, children: /* @__PURE__ */ jsxRuntime.jsx("div", { children: operationText }) }),
      /* @__PURE__ */ jsxRuntime.jsx(ToolCallRow, { label: "Error", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[#c74e39] font-medium", children: errors2.join("\n") }) })
    ] });
  }
  if (textOutputs.length > 0) {
    const output = textOutputs.join("\n");
    const isLong = output.length > 150;
    if (isLong) {
      return /* @__PURE__ */ jsxRuntime.jsxs(ToolCallCard, { icon: "🔧", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ToolCallRow, { label: displayLabel, children: /* @__PURE__ */ jsxRuntime.jsx("div", { children: operationText }) }),
        /* @__PURE__ */ jsxRuntime.jsx(ToolCallRow, { label: "Output", children: /* @__PURE__ */ jsxRuntime.jsx(
          CollapsibleOutput$1,
          {
            isCollapsible: output.length > EXPAND_THRESHOLD$1,
            className: "text-[13px] opacity-90",
            children: /* @__PURE__ */ jsxRuntime.jsx(MarkdownRenderer, { content: output, enableFileLinks: false })
          }
        ) })
      ] });
    }
    const statusFlag = mapToolStatusToContainerStatus(toolCall.status);
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolCallContainer,
      {
        label: displayLabel,
        status: statusFlag,
        toolCallId,
        isFirst,
        isLast,
        children: operationText || output
      }
    );
  }
  if (locations && locations.length > 0) {
    const statusFlag = mapToolStatusToContainerStatus(toolCall.status);
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolCallContainer,
      {
        label: displayLabel,
        status: statusFlag,
        toolCallId,
        isFirst,
        isLast,
        children: /* @__PURE__ */ jsxRuntime.jsx(LocationsList, { locations })
      }
    );
  }
  if (operationText) {
    const statusFlag = mapToolStatusToContainerStatus(toolCall.status);
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolCallContainer,
      {
        label: displayLabel,
        status: statusFlag,
        toolCallId,
        isFirst,
        isLast,
        children: operationText
      }
    );
  }
  return null;
};
const isAgentExecutionRawOutput = (value) => Boolean(
  value && typeof value === "object" && "type" in value && value.type === "task_execution" && "taskDescription" in value && "status" in value
);
const isAgentExecutionToolCall = (toolCall) => isAgentExecutionRawOutput(toolCall.rawOutput);
const STATUS_LABELS = {
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled"
};
const CHILD_STATUS_LABELS = {
  executing: "Running",
  awaiting_approval: "Awaiting approval",
  success: "Completed",
  failed: "Failed"
};
const formatDuration = (durationMs) => {
  if (durationMs < 1e3) {
    return `${durationMs}ms`;
  }
  if (durationMs < 6e4) {
    return `${(durationMs / 1e3).toFixed(durationMs % 1e3 === 0 ? 0 : 1)}s`;
  }
  const minutes = Math.floor(durationMs / 6e4);
  const seconds = Math.round(durationMs % 6e4 / 1e3);
  return `${minutes}m ${seconds}s`;
};
const getHeaderTitle = (data, fallbackTitle) => data.taskDescription || safeTitle(fallbackTitle) || "Agent Task";
const AgentToolCall = ({ toolCall }) => {
  var _a2, _b;
  if (!isAgentExecutionToolCall(toolCall)) {
    return null;
  }
  const data = toolCall.rawOutput;
  const visibleToolCalls = ((_a2 = data.toolCalls) == null ? void 0 : _a2.slice(-5)) ?? [];
  const hiddenToolCallCount = Math.max(
    0,
    (((_b = data.toolCalls) == null ? void 0 : _b.length) ?? 0) - visibleToolCalls.length
  );
  return /* @__PURE__ */ jsxRuntime.jsxs(ToolCallCard, { icon: "🤖", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ToolCallRow, { label: "Agent", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "font-medium text-[var(--app-primary-foreground)]", children: getHeaderTitle(data, toolCall.title) }) }),
    /* @__PURE__ */ jsxRuntime.jsx(ToolCallRow, { label: "Status", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-medium", children: data.subagentName }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[var(--app-secondary-foreground)]", children: STATUS_LABELS[data.status] })
    ] }) }),
    visibleToolCalls.length > 0 && /* @__PURE__ */ jsxRuntime.jsx(ToolCallRow, { label: data.status === "running" ? "Progress" : "Tools", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-1", children: [
      visibleToolCalls.map((childToolCall) => /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: "flex flex-wrap items-center gap-2",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-[12px] text-[var(--app-primary-foreground)]", children: childToolCall.name }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[var(--app-secondary-foreground)]", children: CHILD_STATUS_LABELS[childToolCall.status] }),
            childToolCall.description && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[var(--app-secondary-foreground)]", children: childToolCall.description }),
            childToolCall.error && /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[#c74e39]", children: childToolCall.error })
          ]
        },
        childToolCall.callId
      )),
      hiddenToolCallCount > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-[var(--app-secondary-foreground)]", children: [
        "+",
        hiddenToolCallCount,
        " more tool calls"
      ] })
    ] }) }),
    data.executionSummary && /* @__PURE__ */ jsxRuntime.jsx(ToolCallRow, { label: "Summary", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
        data.executionSummary.totalToolCalls,
        " tool calls"
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
        (data.executionSummary.outputTokens ?? data.executionSummary.totalTokens).toLocaleString(),
        " ",
        "tokens"
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("span", { children: formatDuration(data.executionSummary.totalDurationMs) })
    ] }) }),
    (data.status === "failed" || data.status === "cancelled") && data.terminateReason && /* @__PURE__ */ jsxRuntime.jsx(ToolCallRow, { label: "Reason", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[#c74e39] font-medium", children: data.terminateReason }) })
  ] });
};
const EditToolCallContainer = ({
  label,
  status = "success",
  children,
  toolCallId: _toolCallId,
  labelSuffix,
  className: _className,
  isFirst = false,
  isLast = false
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "div",
  {
    className: `qwen-message message-item ${_className || ""} relative pl-[30px] py-2 select-text toolcall-container toolcall-status-${status}`,
    "data-first": isFirst,
    "data-last": isLast,
    children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "EditToolCall toolcall-content-wrapper flex flex-col gap-1 min-w-0 max-w-full", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-baseline gap-1.5 relative min-w-0", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[14px] leading-none font-bold text-[var(--app-primary-foreground)]", children: label }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] text-[var(--app-secondary-foreground)]", children: labelSuffix })
      ] }),
      children && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[var(--app-secondary-foreground)]", children })
    ] })
  }
);
const getDiffSummary = (oldText, newText) => {
  const oldLines = oldText ? oldText.split("\n").length : 0;
  const newLines = newText ? newText.split("\n").length : 0;
  const diff = newLines - oldLines;
  if (diff > 0) {
    return `+${diff} lines`;
  } else if (diff < 0) {
    return `${diff} lines`;
  } else {
    return "Modified";
  }
};
const EditToolCall = ({
  toolCall,
  isFirst,
  isLast
}) => {
  var _a2, _b, _c, _d;
  const { content, locations, toolCallId } = toolCall;
  const { errors: errors2, diffs } = react.useMemo(() => groupContent(content), [content]);
  if (toolCall.status === "failed") {
    const firstDiff = diffs[0];
    const path = (firstDiff == null ? void 0 : firstDiff.path) || ((_a2 = locations == null ? void 0 : locations[0]) == null ? void 0 : _a2.path) || "";
    const containerStatus = mapToolStatusToContainerStatus(toolCall.status);
    return /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: `qwen-message message-item relative py-2 select-text toolcall-container toolcall-status-${containerStatus}`,
        "data-first": isFirst,
        "data-last": isLast,
        children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "toolcall-edit-content flex flex-col gap-1 min-w-0 max-w-full", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-between min-w-0", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-baseline gap-2 min-w-0", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[13px] leading-none font-bold text-[var(--app-primary-foreground)]", children: "Edit" }),
            path && /* @__PURE__ */ jsxRuntime.jsx(
              FileLink,
              {
                path,
                showFullPath: false,
                className: "font-mono text-[var(--app-secondary-foreground)] hover:underline"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 flex-row items-start w-full gap-1 flex items-center", children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 w-full", children: "edit failed" }) })
        ] })
      }
    );
  }
  if (errors2.length > 0) {
    const path = ((_b = diffs[0]) == null ? void 0 : _b.path) || ((_c = locations == null ? void 0 : locations[0]) == null ? void 0 : _c.path) || "";
    return /* @__PURE__ */ jsxRuntime.jsx(
      EditToolCallContainer,
      {
        label: "Edit",
        status: "error",
        toolCallId,
        isFirst,
        isLast,
        labelSuffix: path ? /* @__PURE__ */ jsxRuntime.jsx(
          FileLink,
          {
            path,
            showFullPath: false,
            className: "text-xs font-mono hover:underline"
          }
        ) : void 0,
        children: errors2.join("\n")
      }
    );
  }
  if (diffs.length > 0) {
    const firstDiff = diffs[0];
    const path = firstDiff.path || locations && ((_d = locations[0]) == null ? void 0 : _d.path) || "";
    const summary = getDiffSummary(firstDiff.oldText, firstDiff.newText);
    const containerStatus = mapToolStatusToContainerStatus(toolCall.status);
    return /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        className: `qwen-message message-item relative py-2 select-text toolcall-container toolcall-status-${containerStatus}`,
        "data-first": isFirst,
        "data-last": isLast,
        children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "toolcall-edit-content flex flex-col gap-1 min-w-0 max-w-full", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-between min-w-0", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-baseline gap-1.5 min-w-0", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[13px] leading-none font-bold text-[var(--app-primary-foreground)]", children: "Edit" }),
            path && /* @__PURE__ */ jsxRuntime.jsx(
              FileLink,
              {
                path,
                showFullPath: false,
                className: "font-mono text-[var(--app-secondary-foreground)] hover:underline"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 flex-row items-start w-full gap-1 flex items-baseline", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 relative top-[-0.1em]", children: "⎿" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 w-full", children: summary })
          ] })
        ] })
      }
    );
  }
  if (locations && locations.length > 0) {
    const containerStatus = mapToolStatusToContainerStatus(toolCall.status);
    return /* @__PURE__ */ jsxRuntime.jsx(
      EditToolCallContainer,
      {
        label: `Edit`,
        status: containerStatus,
        toolCallId,
        isFirst,
        isLast,
        labelSuffix: /* @__PURE__ */ jsxRuntime.jsx(
          FileLink,
          {
            path: locations[0].path,
            showFullPath: false,
            className: "text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"
          }
        ),
        children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 flex-row items-start w-full gap-1 flex items-center", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 relative top-[-0.1em]", children: "⎿" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            FileLink,
            {
              path: locations[0].path,
              line: locations[0].line,
              showFullPath: true
            }
          )
        ] })
      }
    );
  }
  return null;
};
const WriteToolCall = ({
  toolCall,
  isFirst,
  isLast
}) => {
  var _a2;
  const { content, locations, rawInput, toolCallId } = toolCall;
  const { errors: errors2, textOutputs } = groupContent(content);
  let writeContent = "";
  if (rawInput && typeof rawInput === "object") {
    const inputObj = rawInput;
    writeContent = inputObj.content || "";
  } else if (typeof rawInput === "string") {
    writeContent = rawInput;
  }
  if (errors2.length > 0) {
    const path = ((_a2 = locations == null ? void 0 : locations[0]) == null ? void 0 : _a2.path) || "";
    const errorMessage = errors2.join("\n");
    const truncatedContent = writeContent.length > 200 ? writeContent.substring(0, 200) + "..." : writeContent;
    return /* @__PURE__ */ jsxRuntime.jsxs(
      ToolCallContainer,
      {
        label: "WriteFile",
        status: "error",
        toolCallId,
        isFirst,
        isLast,
        labelSuffix: path ? /* @__PURE__ */ jsxRuntime.jsx(
          FileLink,
          {
            path,
            showFullPath: false,
            className: "text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"
          }
        ) : void 0,
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 mt-[2px] mb-[2px] flex-row items-start w-full gap-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 relative top-[-0.1em]", children: "⎿" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 w-full", children: errorMessage })
          ] }),
          truncatedContent && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-[var(--app-input-background)] border border-[var(--app-input-border)] rounded-md p-3 mt-1", children: /* @__PURE__ */ jsxRuntime.jsx("pre", { className: "font-mono text-[13px] whitespace-pre-wrap break-words text-[var(--app-primary-foreground)] opacity-90", children: truncatedContent }) })
        ]
      }
    );
  }
  if (locations && locations.length > 0) {
    const path = locations[0].path;
    const lineCount = writeContent.split("\n").length;
    const containerStatus = mapToolStatusToContainerStatus(toolCall.status);
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolCallContainer,
      {
        label: "WriteFile",
        status: containerStatus,
        toolCallId,
        isFirst,
        isLast,
        labelSuffix: path ? /* @__PURE__ */ jsxRuntime.jsx(
          FileLink,
          {
            path,
            showFullPath: false,
            className: "text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"
          }
        ) : void 0,
        children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 flex-row items-start w-full gap-1 flex items-center", children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 relative top-[-0.1em]", children: "⎿" }),
          /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "flex-shrink-0 w-full", children: [
            lineCount,
            " lines"
          ] })
        ] })
      }
    );
  }
  if (textOutputs.length > 0) {
    const containerStatus = mapToolStatusToContainerStatus(toolCall.status);
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolCallContainer,
      {
        label: "WriteFile",
        status: containerStatus,
        toolCallId,
        isFirst,
        isLast,
        children: textOutputs.join("\n")
      }
    );
  }
  return null;
};
const CollapsibleOutput = ({ summary, children, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useControlledExpanded(defaultExpanded);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: "inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 mt-[2px] mb-[2px] flex-row items-start w-full gap-1 cursor-pointer hover:opacity-100 transition-opacity",
        role: "button",
        tabIndex: 0,
        "aria-expanded": isExpanded,
        "aria-label": isExpanded ? "Collapse output" : "Expand output",
        onClick: () => setIsExpanded(!isExpanded),
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsExpanded(!isExpanded);
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 relative top-[-0.1em]", children: "⎿" }),
          /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0", children: summary })
        ]
      }
    ),
    isExpanded && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "ml-4 mt-1 text-[var(--app-secondary-foreground)] text-[0.85em]", children })
  ] });
};
const SearchRow = ({
  label,
  children
}) => /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-[80px_1fr] gap-medium min-w-0", children: [
  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-xs text-[var(--app-secondary-foreground)] font-medium pt-[2px]", children: label }),
  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[var(--app-primary-foreground)] min-w-0 break-words", children })
] });
const SearchCardContent = ({ children }) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-[var(--app-input-background)] border border-[var(--app-input-border)] rounded-md p-3 mt-1", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-3 min-w-0", children }) });
const LocationsListLocal = ({ locations }) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-1 max-w-full", children: locations.map((loc, idx) => /* @__PURE__ */ jsxRuntime.jsx(FileLink, { path: loc.path, line: loc.line, showFullPath: true }, idx)) });
const SearchToolCall = ({
  toolCall,
  isFirst,
  isLast
}) => {
  const { kind, title, content, locations } = toolCall;
  const queryText = safeTitle(title);
  const displayLabel = getToolDisplayLabel({ kind, title });
  const containerStatus = mapToolStatusToContainerStatus(
    toolCall.status
  );
  const { errors: errors2, textOutputs } = groupContent(content);
  if (errors2.length > 0) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolCallContainer,
      {
        label: displayLabel,
        labelSuffix: queryText,
        status: "error",
        isFirst,
        isLast,
        children: /* @__PURE__ */ jsxRuntime.jsxs(SearchCardContent, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(SearchRow, { label: "Query", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "font-mono", children: queryText }) }),
          /* @__PURE__ */ jsxRuntime.jsx(SearchRow, { label: "Error", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[#c74e39] font-medium", children: errors2.join("\n") }) })
        ] })
      }
    );
  }
  if (locations && locations.length > 0) {
    const summaryText = `${locations.length} ${locations.length === 1 ? "file" : "files"} found`;
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolCallContainer,
      {
        label: displayLabel,
        labelSuffix: queryText,
        status: containerStatus,
        isFirst,
        isLast,
        children: /* @__PURE__ */ jsxRuntime.jsx(CollapsibleOutput, { summary: summaryText, children: /* @__PURE__ */ jsxRuntime.jsx(LocationsListLocal, { locations }) })
      }
    );
  }
  if (textOutputs.length > 0) {
    const totalLines = textOutputs.reduce(
      (acc, text2) => acc + text2.split("\n").length,
      0
    );
    const summaryText = `${totalLines} ${totalLines === 1 ? "line" : "lines"} of output`;
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolCallContainer,
      {
        label: displayLabel,
        labelSuffix: queryText || void 0,
        status: containerStatus,
        isFirst,
        isLast,
        children: /* @__PURE__ */ jsxRuntime.jsx(CollapsibleOutput, { summary: summaryText, children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-1 font-mono text-[0.85em] whitespace-pre-wrap break-all", children: textOutputs.map((text2, index) => /* @__PURE__ */ jsxRuntime.jsx("div", { children: text2 }, index)) }) })
      }
    );
  }
  if (queryText) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolCallContainer,
      {
        label: displayLabel,
        labelSuffix: queryText,
        status: containerStatus,
        isFirst,
        isLast
      }
    );
  }
  return null;
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Display-only checkbox component for plan entries
 */
const CheckboxDisplay = ({
  checked = false,
  indeterminate = false,
  disabled = true,
  className = "",
  style,
  title
}) => {
  const showCheck = !!checked && !indeterminate;
  const showInProgress = !!indeterminate;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "span",
    {
      role: "checkbox",
      "aria-checked": indeterminate ? "mixed" : !!checked,
      "aria-disabled": disabled || void 0,
      title,
      style,
      className: [
        "q m-[2px] shrink-0 w-4 h-4 relative rounded-[2px] box-border",
        "border border-[var(--app-input-border)] bg-[var(--app-input-background)]",
        "inline-flex items-center justify-center",
        showCheck ? "opacity-70" : "",
        className
      ].join(" "),
      children: [
        showCheck ? /* @__PURE__ */ jsxRuntime.jsx(
          "span",
          {
            "aria-hidden": true,
            className: [
              "absolute block",
              "left-[3px] top-[3px]",
              "w-2.5 h-1.5",
              "border-l-2 border-b-2",
              "border-[#74c991]",
              "-rotate-45"
            ].join(" ")
          }
        ) : null,
        showInProgress ? /* @__PURE__ */ jsxRuntime.jsx(
          "span",
          {
            "aria-hidden": true,
            className: [
              "absolute inline-block",
              "left-1/2 top-[10px] -translate-x-1/2 -translate-y-1/2",
              "text-[16px] leading-none text-[#e1c08d] select-none"
            ].join(" "),
            children: "*"
          }
        ) : null
      ]
    }
  );
};
const PlanToolCallContainer = ({
  label,
  status = "success",
  children,
  toolCallId: _toolCallId,
  labelSuffix,
  className: _className,
  isFirst = false,
  isLast = false
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "div",
  {
    className: `qwen-message message-item ${_className || ""} relative pl-[30px] py-2 select-text toolcall-container toolcall-status-${status}`,
    "data-first": isFirst,
    "data-last": isLast,
    children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "UpdatedPlanToolCall toolcall-content-wrapper flex flex-col gap-2 min-w-0 max-w-full", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-baseline gap-1 relative min-w-0", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[14px] leading-none font-bold text-[var(--app-primary-foreground)]", children: label }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] text-[var(--app-secondary-foreground)]", children: labelSuffix })
      ] }),
      children && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[var(--app-secondary-foreground)] py-1", children })
    ] })
  }
);
const mapToolStatusToBullet = (status) => {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "error";
    case "in_progress":
    case "cancelled":
      return "warning";
    case "pending":
      return "loading";
    default:
      return "default";
  }
};
const parsePlanEntries = (textOutputs) => {
  const text2 = textOutputs.join("\n");
  const lines = text2.split(/\r?\n/);
  const entries = [];
  const todoRe = /^(?:\s{0,10}(?:[-*]|\d{1,3}[.)])\s{0,10})?\[( |x|X|-|\*)\]\s+(.{0,500})$/;
  for (const line of lines) {
    const m = line.match(todoRe);
    if (m) {
      const mark = m[1];
      const title = m[2].trim();
      const status = mark === "x" || mark === "X" ? "completed" : mark === "-" || mark === "*" ? "in_progress" : "pending";
      if (title) {
        entries.push({ content: title, status });
      }
    }
  }
  if (entries.length === 0) {
    for (const line of lines) {
      const title = line.trim();
      if (title) {
        entries.push({ content: title, status: "pending" });
      }
    }
  }
  return entries;
};
const UpdatedPlanToolCall = ({
  toolCall,
  isFirst,
  isLast
}) => {
  const { content, status } = toolCall;
  const { errors: errors2, textOutputs } = groupContent(content);
  if (errors2.length > 0) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      PlanToolCallContainer,
      {
        label: "TodoList",
        status: "error",
        isFirst,
        isLast,
        children: errors2.join("\n")
      }
    );
  }
  const entries = parsePlanEntries(textOutputs);
  const label = getToolDisplayLabel({
    kind: toolCall.kind,
    title: safeTitle(toolCall.title)
  });
  return /* @__PURE__ */ jsxRuntime.jsx(
    PlanToolCallContainer,
    {
      label,
      status: mapToolStatusToBullet(status),
      className: "update-plan-toolcall",
      isFirst,
      isLast,
      children: /* @__PURE__ */ jsxRuntime.jsx("ul", { className: "Fr list-none p-0 m-0 flex flex-col gap-1", children: entries.map((entry, idx) => {
        const isDone = entry.status === "completed";
        const isIndeterminate = entry.status === "in_progress";
        return /* @__PURE__ */ jsxRuntime.jsxs(
          "li",
          {
            className: [
              "Hr flex items-start gap-2 p-0 rounded text-[var(--app-primary-foreground)]",
              isDone ? "fo opacity-70" : ""
            ].join(" "),
            children: [
              /* @__PURE__ */ jsxRuntime.jsx("label", { className: "flex items-start gap-2", children: /* @__PURE__ */ jsxRuntime.jsx(
                CheckboxDisplay,
                {
                  checked: isDone,
                  indeterminate: isIndeterminate
                }
              ) }),
              /* @__PURE__ */ jsxRuntime.jsx(
                "div",
                {
                  className: [
                    "vo flex-1 text-xs leading-[1.5] text-[var(--app-primary-foreground)]",
                    isDone ? "line-through text-[var(--app-secondary-foreground)] opacity-70" : "opacity-85"
                  ].join(" "),
                  children: entry.content
                }
              )
            ]
          },
          idx
        );
      }) })
    }
  );
};
const ExecuteToolCallContainer = ({
  label,
  status = "success",
  children,
  toolCallId: _toolCallId,
  labelSuffix,
  className: _className,
  isFirst = false,
  isLast = false
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "div",
  {
    className: `ExecuteToolCall qwen-message message-item ${_className || ""} relative pl-[30px] py-2 select-text toolcall-container toolcall-status-${status}`,
    "data-first": isFirst,
    "data-last": isLast,
    children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "toolcall-content-wrapper flex flex-col min-w-0 max-w-full", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-baseline gap-1.5 relative min-w-0", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[14px] leading-none font-bold text-[var(--app-primary-foreground)]", children: label }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] text-[var(--app-secondary-foreground)]", children: labelSuffix })
      ] }),
      children && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[var(--app-secondary-foreground)]", children })
    ] })
  }
);
const getCommandText = (variant, title, rawInput) => {
  if (variant === "execute" && rawInput && typeof rawInput === "object") {
    const description = rawInput.description;
    const describedTitle = safeTitle(description);
    if (describedTitle) {
      return describedTitle;
    }
  }
  return safeTitle(title);
};
const getInputCommand = (commandText, rawInput) => {
  if (rawInput && typeof rawInput === "object") {
    const inputObj = rawInput;
    return inputObj.command || commandText;
  }
  if (typeof rawInput === "string") {
    return rawInput;
  }
  return commandText;
};
const ShellToolCallImpl = ({
  toolCall,
  variant,
  isFirst,
  isLast
}) => {
  const { title, content, rawInput, toolCallId } = toolCall;
  const classPrefix = variant;
  const platform = usePlatform();
  const openTempFile = (content2, fileName) => {
    if (platform.openTempFile) {
      platform.openTempFile(content2, fileName);
      return;
    }
    platform.postMessage({
      type: "createAndOpenTempFile",
      data: {
        content: content2,
        fileName
      }
    });
  };
  const commandText = getCommandText(variant, title, rawInput);
  const inputCommand = getInputCommand(commandText, rawInput);
  const Container2 = variant === "execute" ? ExecuteToolCallContainer : ToolCallContainer;
  const label = getToolDisplayLabel({ kind: toolCall.kind, title });
  const { textOutputs, errors: errors2 } = groupContent(content);
  const handleInClick = () => {
    openTempFile(inputCommand, `${classPrefix}-input-${toolCallId}`);
  };
  const handleOutClick = () => {
    if (textOutputs.length > 0) {
      const output = textOutputs.join("\n");
      openTempFile(output, `${classPrefix}-output-${toolCallId}`);
    }
  };
  const containerStatus = errors2.length > 0 || variant === "execute" && toolCall.status === "failed" ? "error" : mapToolStatusToContainerStatus(toolCall.status);
  if (errors2.length > 0) {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      Container2,
      {
        label,
        status: containerStatus,
        toolCallId,
        isFirst,
        isLast,
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 mt-[2px] mb-[2px] flex-row items-start w-full gap-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 relative top-[-0.1em]", children: "⎿" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 w-full", children: commandText })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: `${classPrefix}-toolcall-card`, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `${classPrefix}-toolcall-content`, children: [
            /* @__PURE__ */ jsxRuntime.jsxs(
              "div",
              {
                className: `${classPrefix}-toolcall-row ${classPrefix}-toolcall-row-with-copy group`,
                onClick: handleInClick,
                style: { cursor: "pointer" },
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: `${classPrefix}-toolcall-label`, children: "IN" }),
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: `${classPrefix}-toolcall-row-content`, children: /* @__PURE__ */ jsxRuntime.jsx("pre", { className: `${classPrefix}-toolcall-pre`, children: inputCommand }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(CopyButton, { text: inputCommand })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `${classPrefix}-toolcall-row`, children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: `${classPrefix}-toolcall-label`, children: "Error" }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: `${classPrefix}-toolcall-row-content`, children: /* @__PURE__ */ jsxRuntime.jsx(
                "pre",
                {
                  className: `${classPrefix}-toolcall-pre ${classPrefix}-toolcall-error-content`,
                  children: errors2.join("\n")
                }
              ) })
            ] })
          ] }) })
        ]
      }
    );
  }
  if (textOutputs.length > 0) {
    const output = textOutputs.join("\n");
    const isCollapsible = output.length > 500;
    const outputContent = /* @__PURE__ */ jsxRuntime.jsx("div", { className: `${classPrefix}-toolcall-output-subtle`, children: /* @__PURE__ */ jsxRuntime.jsx("pre", { className: `${classPrefix}-toolcall-pre`, children: output }) });
    return /* @__PURE__ */ jsxRuntime.jsxs(
      Container2,
      {
        label,
        status: containerStatus,
        toolCallId,
        isFirst,
        isLast,
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 mt-[2px] mb-[2px] flex-row items-start w-full gap-1", children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 relative top-[-0.1em]", children: "⎿" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 w-full", children: commandText })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: `${classPrefix}-toolcall-card`, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `${classPrefix}-toolcall-content`, children: [
            /* @__PURE__ */ jsxRuntime.jsxs(
              "div",
              {
                className: `${classPrefix}-toolcall-row ${classPrefix}-toolcall-row-with-copy group`,
                onClick: handleInClick,
                style: { cursor: "pointer" },
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: `${classPrefix}-toolcall-label`, children: "IN" }),
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: `${classPrefix}-toolcall-row-content`, children: /* @__PURE__ */ jsxRuntime.jsx("pre", { className: `${classPrefix}-toolcall-pre`, children: inputCommand }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(CopyButton, { text: inputCommand })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs(
              "div",
              {
                className: `${classPrefix}-toolcall-row`,
                onClick: handleOutClick,
                style: { cursor: "pointer" },
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: `${classPrefix}-toolcall-label`, children: "OUT" }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    "div",
                    {
                      className: `${classPrefix}-toolcall-row-content ${isCollapsible ? `${classPrefix}-toolcall-full` : ""}`,
                      children: isCollapsible ? /* @__PURE__ */ jsxRuntime.jsx(
                        CollapsibleOutput$1,
                        {
                          isCollapsible: true,
                          collapsedHeight: 60,
                          fadeStart: 40,
                          children: outputContent
                        }
                      ) : outputContent
                    }
                  )
                ]
              }
            )
          ] }) })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    Container2,
    {
      label,
      status: containerStatus,
      toolCallId,
      isFirst,
      isLast,
      children: /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: "inline-flex text-[var(--app-secondary-foreground)] text-[0.85em] opacity-70 mt-[2px] mb-[2px] flex-row items-start w-full gap-1",
          onClick: handleInClick,
          style: { cursor: "pointer" },
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 relative top-[-0.1em]", children: "⎿" }),
            /* @__PURE__ */ jsxRuntime.jsx("span", { className: "flex-shrink-0 w-full", children: commandText })
          ]
        }
      )
    }
  );
};
const ShellToolCall = (props) => {
  const normalizedKind = props.toolCall.kind.toLowerCase();
  const variant = normalizedKind === "execute" ? "execute" : "bash";
  return /* @__PURE__ */ jsxRuntime.jsx(ShellToolCallImpl, { ...props, variant });
};
const ReadToolCallContainer = ({
  label,
  status = "success",
  children,
  toolCallId: _toolCallId,
  labelSuffix,
  className: _className,
  isFirst = false,
  isLast = false
}) => /* @__PURE__ */ jsxRuntime.jsx(
  "div",
  {
    className: `ReadToolCall qwen-message message-item ${_className || ""} relative pl-[30px] py-2 select-text toolcall-container toolcall-status-${status}`,
    "data-first": isFirst,
    "data-last": isLast,
    children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "toolcall-content-wrapper flex flex-col gap-1 min-w-0 max-w-full", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-baseline gap-1.5 relative min-w-0", children: [
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[14px] leading-none font-bold text-[var(--app-primary-foreground)]", children: label }),
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-[11px] text-[var(--app-secondary-foreground)]", children: labelSuffix })
      ] }),
      children && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[var(--app-secondary-foreground)] py-0.5", children })
    ] })
  }
);
const ReadToolCall = ({
  toolCall,
  isFirst,
  isLast
}) => {
  var _a2, _b, _c, _d;
  const { kind, title, content, locations, toolCallId } = toolCall;
  const platform = usePlatform();
  const openedDiffsRef = react.useRef(/* @__PURE__ */ new Map());
  const [isExpanded, setIsExpanded] = useControlledExpanded(false);
  const { errors: errors2, diffs, textOutputs } = react.useMemo(
    () => groupContent(content),
    [content]
  );
  const handleOpenDiff = react.useCallback(
    (path, oldText, newText) => {
      if (!path) {
        return;
      }
      if (platform.openDiff) {
        platform.openDiff(path, oldText, newText);
        return;
      }
      platform.postMessage({
        type: "openDiff",
        data: {
          path,
          oldText: oldText ?? "",
          newText: newText ?? ""
        }
      });
    },
    [platform]
  );
  react.useEffect(() => {
    var _a3;
    if (diffs.length === 0) {
      return;
    }
    const firstDiff = diffs[0];
    const path = firstDiff.path || ((_a3 = locations == null ? void 0 : locations[0]) == null ? void 0 : _a3.path) || "";
    if (!path) {
      return;
    }
    if (firstDiff.oldText === void 0 || firstDiff.newText === void 0) {
      return;
    }
    const signature = `${path}:${firstDiff.oldText ?? ""}:${firstDiff.newText ?? ""}`;
    const lastSignature = openedDiffsRef.current.get(toolCallId);
    if (lastSignature === signature) {
      return;
    }
    openedDiffsRef.current.set(toolCallId, signature);
    const timer = setTimeout(() => {
      handleOpenDiff(path, firstDiff.oldText, firstDiff.newText);
    }, 100);
    return () => clearTimeout(timer);
  }, [diffs, handleOpenDiff, locations, toolCallId]);
  const containerStatus = mapToolStatusToContainerStatus(toolCall.status);
  const displayLabel = getToolDisplayLabel({ kind, title });
  if (errors2.length > 0) {
    const path = ((_a2 = locations == null ? void 0 : locations[0]) == null ? void 0 : _a2.path) || "";
    return /* @__PURE__ */ jsxRuntime.jsx(
      ReadToolCallContainer,
      {
        label: displayLabel,
        className: "read-tool-call-error",
        status: "error",
        toolCallId,
        isFirst,
        isLast,
        labelSuffix: path ? /* @__PURE__ */ jsxRuntime.jsx(
          FileLink,
          {
            path,
            showFullPath: false,
            className: "text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"
          }
        ) : void 0,
        children: errors2.join("\n")
      }
    );
  }
  if (toolCall.status === "failed") {
    const path = ((_b = locations == null ? void 0 : locations[0]) == null ? void 0 : _b.path) || "";
    const failureMessage = textOutputs.length > 0 ? textOutputs.join("\n") : "Read operation failed";
    return /* @__PURE__ */ jsxRuntime.jsx(
      ReadToolCallContainer,
      {
        label: displayLabel,
        className: "read-tool-call-error",
        status: "error",
        toolCallId,
        isFirst,
        isLast,
        labelSuffix: path ? /* @__PURE__ */ jsxRuntime.jsx(
          FileLink,
          {
            path,
            showFullPath: false,
            className: "text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"
          }
        ) : void 0,
        children: failureMessage
      }
    );
  }
  if (diffs.length > 0) {
    const path = ((_c = diffs[0]) == null ? void 0 : _c.path) || ((_d = locations == null ? void 0 : locations[0]) == null ? void 0 : _d.path) || "";
    return /* @__PURE__ */ jsxRuntime.jsx(
      ReadToolCallContainer,
      {
        label: displayLabel,
        className: "read-tool-call-success",
        status: containerStatus,
        toolCallId,
        isFirst,
        isLast,
        labelSuffix: path ? /* @__PURE__ */ jsxRuntime.jsx(
          FileLink,
          {
            path,
            showFullPath: false,
            className: "text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"
          }
        ) : void 0,
        children: null
      }
    );
  }
  if (locations && locations.length > 0) {
    const path = locations[0].path;
    const textContent = textOutputs.length > 0 ? textOutputs.join("\n") : "";
    const EXPAND_THRESHOLD2 = 300;
    const isLongContent = textContent.length > EXPAND_THRESHOLD2;
    return /* @__PURE__ */ jsxRuntime.jsx(
      ReadToolCallContainer,
      {
        label: displayLabel,
        className: "read-tool-call-success",
        status: containerStatus,
        toolCallId,
        isFirst,
        isLast,
        labelSuffix: path ? /* @__PURE__ */ jsxRuntime.jsx(
          FileLink,
          {
            path,
            showFullPath: false,
            className: "text-xs font-mono text-[var(--app-secondary-foreground)] hover:underline"
          }
        ) : void 0,
        children: textContent ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "border border-[var(--app-input-border)] rounded-[5px] bg-[var(--app-tool-background)] overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: `p-2 ${!isExpanded && isLongContent ? "max-h-[100px] overflow-hidden" : ""}`,
              style: !isExpanded && isLongContent ? {
                maskImage: "linear-gradient(to bottom, var(--app-primary-background) 60px, transparent 100px)"
              } : void 0,
              children: /* @__PURE__ */ jsxRuntime.jsx("pre", { className: "whitespace-pre-wrap break-words text-xs font-mono m-0", children: textContent })
            }
          ),
          isLongContent && /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              onClick: () => setIsExpanded(!isExpanded),
              "aria-expanded": isExpanded,
              "aria-label": isExpanded ? "Collapse output" : "Expand output",
              className: "flex items-center justify-center w-full py-1 px-2 border-t border-[var(--app-input-border)] cursor-pointer text-[var(--app-secondary-foreground)] text-[0.75em] opacity-70 hover:opacity-100 hover:bg-[var(--app-code-background)] transition-opacity bg-transparent",
              children: isExpanded ? "▲ Collapse" : "▼ Show more"
            }
          )
        ] }) : null
      }
    );
  }
  if (textOutputs.length > 0) {
    const textContent = textOutputs.join("\n");
    const EXPAND_THRESHOLD2 = 300;
    const isLongContent = textContent.length > EXPAND_THRESHOLD2;
    return /* @__PURE__ */ jsxRuntime.jsx(
      ReadToolCallContainer,
      {
        label: displayLabel,
        className: "read-tool-call-success",
        status: containerStatus,
        toolCallId,
        isFirst,
        isLast,
        children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "border border-[var(--app-input-border)] rounded-[5px] bg-[var(--app-tool-background)] overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: `p-2 ${!isExpanded && isLongContent ? "max-h-[100px] overflow-hidden" : ""}`,
              style: !isExpanded && isLongContent ? {
                maskImage: "linear-gradient(to bottom, var(--app-primary-background) 60px, transparent 100px)"
              } : void 0,
              children: /* @__PURE__ */ jsxRuntime.jsx("pre", { className: "whitespace-pre-wrap break-words text-xs font-mono m-0", children: textContent })
            }
          ),
          isLongContent && /* @__PURE__ */ jsxRuntime.jsx(
            "button",
            {
              onClick: () => setIsExpanded(!isExpanded),
              "aria-expanded": isExpanded,
              "aria-label": isExpanded ? "Collapse output" : "Expand output",
              className: "flex items-center justify-center w-full py-1 px-2 border-t border-[var(--app-input-border)] cursor-pointer text-[var(--app-secondary-foreground)] text-[0.75em] opacity-70 hover:opacity-100 hover:bg-[var(--app-code-background)] transition-opacity bg-transparent",
              children: isExpanded ? "▲ Collapse" : "▼ Show more"
            }
          )
        ] })
      }
    );
  }
  return null;
};
const COLLAPSED_HEIGHT = 120;
const EXPAND_THRESHOLD = 300;
const getWebTarget = (variant, title, rawInput) => {
  if (rawInput && typeof rawInput === "object") {
    const input = rawInput;
    if (variant === "fetch" && input["url"]) {
      return String(input["url"]);
    }
    if (variant === "search" && input["query"]) {
      return String(input["query"]);
    }
  }
  return safeTitle(title);
};
const OutputCard = ({ content, isError = false }) => {
  const [isExpanded, setIsExpanded] = useControlledExpanded(false);
  const isLongContent = content.length > EXPAND_THRESHOLD;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-[0.5px] border-[var(--app-input-border)] rounded-[5px] bg-[var(--app-tool-background)] my-2 max-w-full text-[1em] items-start", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-[3px] p-1", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-[max-content_1fr] p-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[var(--app-secondary-foreground)] text-left opacity-50 py-1 px-2 pl-1 font-mono text-[0.85em]", children: "OUT" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        "div",
        {
          className: `webfetch-output-content break-words m-0 p-1 overflow-hidden ${isError ? "whitespace-pre-wrap" : ""}`,
          style: !isExpanded && isLongContent ? {
            maxHeight: `${COLLAPSED_HEIGHT}px`,
            maskImage: `linear-gradient(to bottom, var(--app-primary-background) 80px, transparent ${COLLAPSED_HEIGHT}px)`,
            WebkitMaskImage: `linear-gradient(to bottom, var(--app-primary-background) 80px, transparent ${COLLAPSED_HEIGHT}px)`
          } : void 0,
          children: isError ? /* @__PURE__ */ jsxRuntime.jsx("pre", { className: "m-0 overflow-hidden font-mono text-[0.85em] text-[#c74e39]", children: content }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-[0.85em]", children: /* @__PURE__ */ jsxRuntime.jsx(MarkdownRenderer, { content, enableFileLinks: false }) })
        }
      )
    ] }),
    isLongContent && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-center border-t border-[var(--app-input-border)] pt-1", children: /* @__PURE__ */ jsxRuntime.jsx(
      "button",
      {
        type: "button",
        onClick: (event) => {
          event.stopPropagation();
          setIsExpanded(!isExpanded);
        },
        "aria-expanded": isExpanded,
        "aria-label": isExpanded ? "Collapse output" : "Expand output",
        className: "text-[var(--app-secondary-foreground)] text-[0.8em] hover:text-[var(--app-primary-foreground)] cursor-pointer bg-transparent border-none px-2 py-1 rounded hover:bg-[var(--app-input-background)] transition-colors",
        children: isExpanded ? "▲ Collapse" : "▼ Show more"
      }
    ) })
  ] }) });
};
const WebFetchToolCallImpl = ({
  toolCall,
  variant,
  isFirst,
  isLast
}) => {
  const { title, content, rawInput, toolCallId } = toolCall;
  const webTarget = getWebTarget(variant, title, rawInput);
  const label = getToolDisplayLabel({ kind: toolCall.kind, title });
  const { textOutputs, errors: errors2 } = groupContent(content);
  const containerStatus = errors2.length > 0 ? "error" : mapToolStatusToContainerStatus(toolCall.status);
  if (errors2.length > 0) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolCallContainer,
      {
        label,
        status: containerStatus,
        toolCallId,
        isFirst,
        isLast,
        labelSuffix: webTarget,
        children: /* @__PURE__ */ jsxRuntime.jsx(OutputCard, { content: errors2.join("\n"), isError: true })
      }
    );
  }
  if (textOutputs.length > 0) {
    const output = textOutputs.join("\n");
    return /* @__PURE__ */ jsxRuntime.jsx(
      ToolCallContainer,
      {
        label,
        status: containerStatus,
        toolCallId,
        isFirst,
        isLast,
        labelSuffix: webTarget,
        children: /* @__PURE__ */ jsxRuntime.jsx(OutputCard, { content: output })
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    ToolCallContainer,
    {
      label,
      status: containerStatus,
      toolCallId,
      isFirst,
      isLast,
      labelSuffix: webTarget
    }
  );
};
const WebFetchToolCall = (props) => /* @__PURE__ */ jsxRuntime.jsx(WebFetchToolCallImpl, { ...props, variant: "fetch" });
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared tool-call routing — maps ToolCallData to the appropriate
 * specialized component. Used by both ChatViewer and VSCode IDE.
 */
function getToolCallComponent(toolCall) {
  if (isAgentExecutionToolCall(toolCall)) {
    return AgentToolCall;
  }
  const normalizedKind = toolCall.kind.toLowerCase();
  switch (normalizedKind) {
    case "read":
    case "read_file":
    case "read_many_files":
    case "readmanyfiles":
    case "list_directory":
    case "listfiles":
      return ReadToolCall;
    case "write":
      return WriteToolCall;
    case "edit":
      return EditToolCall;
    case "execute":
    case "bash":
    case "command":
      return ShellToolCall;
    case "updated_plan":
    case "updatedplan":
    case "todo_write":
    case "update_todos":
    case "todowrite":
      return UpdatedPlanToolCall;
    case "search":
    case "grep":
    case "glob":
    case "find":
      return SearchToolCall;
    case "think":
    case "thinking":
      return ThinkToolCall;
    case "fetch":
    case "web_fetch":
    case "webfetch":
    case "web_search":
      return WebFetchToolCall;
    default:
      return GenericToolCall;
  }
}
/**
 * @license
 * Copyright 2026 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const USER_PROMPT_CONTEXT_OPEN = "<qwen:user-prompt-submit-context>";
const USER_PROMPT_CONTEXT_CLOSE = "</qwen:user-prompt-submit-context>";
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isHookContextPart(part) {
  if (!isRecord(part) || typeof part.text !== "string") return false;
  const text2 = part.text.trim();
  const prefix = `${USER_PROMPT_CONTEXT_OPEN}
`;
  const suffix = `
${USER_PROMPT_CONTEXT_CLOSE}`;
  if (!text2.startsWith(prefix) || !text2.endsWith(suffix)) {
    return false;
  }
  const body = text2.slice(prefix.length, -suffix.length);
  return !body.includes(USER_PROMPT_CONTEXT_OPEN) && !body.includes(USER_PROMPT_CONTEXT_CLOSE);
}
function getUserTranscriptDisplayText(record) {
  var _a2;
  if (record.type !== "user") return void 0;
  const parts = Array.isArray((_a2 = record.message) == null ? void 0 : _a2.parts) ? record.message.parts : [];
  const hasFinalHookContextPart = parts.length > 1 && isHookContextPart(parts[parts.length - 1]);
  const payload = isRecord(record.systemPayload) ? record.systemPayload : void 0;
  if (payload && typeof payload.displayText === "string" && (typeof payload.hookContext === "string" || hasFinalHookContextPart)) {
    return payload.displayText;
  }
  if (parts.length === 0) return void 0;
  const visibleParts = payload === void 0 && hasFinalHookContextPart ? parts.slice(0, -1) : parts;
  return visibleParts.map(
    (part) => isRecord(part) && typeof part.text === "string" ? part.text : ""
  ).join("");
}
function extractContent$1(message) {
  if (!message) return "";
  if (message.parts && Array.isArray(message.parts)) {
    return message.parts.map((part) => part.text || "").join("");
  }
  if (typeof message.content === "string") {
    return message.content;
  }
  if (Array.isArray(message.content)) {
    return message.content.filter((item) => item.type === "text" && item.text).map((item) => item.text || "").join("");
  }
  return "";
}
function parseTimestamp$1(isoString) {
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? Date.now() : date.getTime();
}
const ChatViewer = react.forwardRef(
  ({
    messages,
    className = "",
    onFileClick,
    emptyMessage = "No messages to display",
    autoScroll = true,
    theme = "auto",
    showEmptyIcon = true,
    showExpandControl = false
  }, ref) => {
    const scrollContainerRef = react.useRef(null);
    const scrollAnchorRef = react.useRef(null);
    const prevMessageCountRef = react.useRef(0);
    const [expandControl, setExpandControl] = react.useState({ signal: 0, expanded: false });
    const issueExpandControl = (expanded) => {
      setExpandControl((current) => ({
        signal: current.signal + 1,
        expanded
      }));
    };
    const sortedMessages = react.useMemo(
      () => messages.filter((msg) => {
        if (msg.type === "system") return false;
        if (msg.type === "tool_call" && msg.toolCall) {
          return shouldShowToolCall(msg.toolCall.kind);
        }
        return true;
      }).sort(
        (a, b) => parseTimestamp$1(a.timestamp) - parseTimestamp$1(b.timestamp)
      ),
      [messages]
    );
    react.useImperativeHandle(
      ref,
      () => ({
        scrollToBottom: (behavior = "smooth") => {
          const container = scrollContainerRef.current;
          if (container) {
            container.scrollTo({
              top: container.scrollHeight,
              behavior
            });
          }
        },
        scrollToTop: (behavior = "smooth") => {
          const container = scrollContainerRef.current;
          if (container) {
            container.scrollTo({
              top: 0,
              behavior
            });
          }
        },
        getScrollContainer: () => scrollContainerRef.current
      }),
      []
    );
    react.useEffect(() => {
      if (!autoScroll) return;
      const currentCount = sortedMessages.length;
      const prevCount = prevMessageCountRef.current;
      if (currentCount > prevCount && scrollAnchorRef.current) {
        scrollAnchorRef.current.scrollIntoView({ behavior: "smooth" });
      }
      prevMessageCountRef.current = currentCount;
    }, [sortedMessages.length, autoScroll]);
    const isUserType2 = (msg) => !msg || msg.type === "user";
    const renderMessage = (msg, index, allMsgs) => {
      var _a2;
      const key = msg.uuid || `msg-${index}`;
      const prev = allMsgs[index - 1];
      const next = allMsgs[index + 1];
      const isFirst = isUserType2(prev);
      const isLast = isUserType2(next);
      if (msg.type === "tool_call" && msg.toolCall) {
        const ToolCallComponent = getToolCallComponent(msg.toolCall);
        if (!ToolCallComponent) {
          return null;
        }
        return /* @__PURE__ */ jsxRuntime.jsx(
          ToolCallComponent,
          {
            toolCall: msg.toolCall,
            isFirst,
            isLast
          },
          key
        );
      }
      const content = getUserTranscriptDisplayText(msg) ?? extractContent$1(msg.message);
      const timestamp = parseTimestamp$1(msg.timestamp);
      if (!content.trim()) {
        return null;
      }
      switch (msg.type) {
        case "user":
          return /* @__PURE__ */ jsxRuntime.jsx(
            UserMessage,
            {
              content,
              timestamp,
              onFileClick
            },
            key
          );
        case "assistant":
          if (((_a2 = msg.message) == null ? void 0 : _a2.role) === "thinking") {
            return /* @__PURE__ */ jsxRuntime.jsx(
              ThinkingMessage,
              {
                content,
                timestamp,
                onFileClick
              },
              key
            );
          }
          return /* @__PURE__ */ jsxRuntime.jsx(
            AssistantMessage,
            {
              content,
              timestamp,
              onFileClick,
              isFirst,
              isLast
            },
            key
          );
        default:
          return null;
      }
    };
    const containerClasses = [
      "chat-viewer-container",
      theme === "light" ? "light-theme" : "",
      theme === "auto" ? "auto-theme" : "",
      className
    ].filter(Boolean).join(" ");
    const showExpandToolbar = showExpandControl && sortedMessages.length > 0;
    const messagesRegion = /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        ref: scrollContainerRef,
        className: "chat-viewer-messages chat-messages",
        children: sortedMessages.length === 0 ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "chat-viewer-empty", children: [
          showEmptyIcon && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "chat-viewer-empty-icon", "aria-hidden": "true", children: "💬" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "chat-viewer-empty-text", children: emptyMessage })
        ] }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          sortedMessages.map(
            (msg, index) => renderMessage(msg, index, sortedMessages)
          ),
          /* @__PURE__ */ jsxRuntime.jsx("div", { ref: scrollAnchorRef, className: "chat-viewer-scroll-anchor" })
        ] })
      }
    );
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: containerClasses, children: [
      showExpandToolbar && /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: "chat-viewer-expand-control",
          role: "toolbar",
          "aria-label": "Expand or collapse all sections",
          children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                className: "chat-viewer-expand-control-button",
                "aria-label": "Expand all sections",
                onClick: () => issueExpandControl(true),
                children: "Expand all"
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              "button",
              {
                type: "button",
                className: "chat-viewer-expand-control-button",
                "aria-label": "Collapse all sections",
                onClick: () => issueExpandControl(false),
                children: "Collapse all"
              }
            )
          ]
        }
      ),
      showExpandControl ? /* @__PURE__ */ jsxRuntime.jsx(ExpandControlContext.Provider, { value: expandControl, children: messagesRegion }) : messagesRegion
    ] });
  }
);
ChatViewer.displayName = "ChatViewer";
const Button = react.forwardRef(
  ({
    children,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = "",
    type = "button",
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    const baseClasses = "inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
    const variantClasses = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
      outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-400"
    };
    const sizeClasses = {
      sm: "px-2 py-1 text-sm gap-1",
      md: "px-4 py-2 gap-2",
      lg: "px-6 py-3 text-lg gap-2"
    };
    const disabledClass = isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "";
    const widthClass = fullWidth ? "w-full" : "";
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "button",
      {
        ref,
        type,
        className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClass} ${widthClass} ${className}`.trim(),
        disabled: isDisabled,
        "aria-disabled": isDisabled,
        "aria-busy": loading,
        ...props,
        children: [
          loading && /* @__PURE__ */ jsxRuntime.jsxs(
            "svg",
            {
              className: "animate-spin h-4 w-4",
              xmlns: "http://www.w3.org/2000/svg",
              fill: "none",
              viewBox: "0 0 24 24",
              "aria-hidden": "true",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(
                  "circle",
                  {
                    className: "opacity-25",
                    cx: "12",
                    cy: "12",
                    r: "10",
                    stroke: "currentColor",
                    strokeWidth: "4"
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(
                  "path",
                  {
                    className: "opacity-75",
                    fill: "currentColor",
                    d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  }
                )
              ]
            }
          ),
          !loading && leftIcon,
          children,
          !loading && rightIcon
        ]
      }
    );
  }
);
Button.displayName = "Button";
const Input = react.forwardRef(
  ({
    size = "md",
    error: error2 = false,
    errorMessage,
    label,
    helperText,
    leftElement,
    rightElement,
    fullWidth = false,
    className = "",
    id,
    disabled,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const baseClasses = "border rounded transition-colors focus:outline-none focus:ring-2";
    const sizeClasses = {
      sm: "px-2 py-1 text-sm",
      md: "px-3 py-2",
      lg: "px-4 py-3 text-lg"
    };
    const stateClasses = error2 ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
    const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "bg-white";
    const widthClass = fullWidth ? "w-full" : "";
    const paddingClasses = [
      leftElement ? "pl-10" : "",
      rightElement ? "pr-10" : ""
    ].join(" ");
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: `${fullWidth ? "w-full" : "inline-block"}`, children: [
      label && /* @__PURE__ */ jsxRuntime.jsx(
        "label",
        {
          htmlFor: inputId,
          className: "block text-sm font-medium text-gray-700 mb-1",
          children: label
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
        leftElement && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-500", children: leftElement }),
        /* @__PURE__ */ jsxRuntime.jsx(
          "input",
          {
            ref,
            id: inputId,
            disabled,
            "aria-invalid": error2,
            "aria-describedby": errorMessage ? `${inputId}-error` : helperText ? `${inputId}-helper` : void 0,
            className: `${baseClasses} ${sizeClasses[size]} ${stateClasses} ${disabledClasses} ${widthClass} ${paddingClasses} ${className}`.trim(),
            ...props
          }
        ),
        rightElement && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-500", children: rightElement })
      ] }),
      errorMessage && error2 && /* @__PURE__ */ jsxRuntime.jsx("p", { id: `${inputId}-error`, className: "mt-1 text-sm text-red-600", children: errorMessage }),
      helperText && !error2 && /* @__PURE__ */ jsxRuntime.jsx("p", { id: `${inputId}-helper`, className: "mt-1 text-sm text-gray-500", children: helperText })
    ] });
  }
);
Input.displayName = "Input";
const PermissionDrawer = ({
  isOpen,
  options,
  toolCall,
  onResponse,
  onClose
}) => {
  const [focusedIndex, setFocusedIndex] = react.useState(0);
  const containerRef = react.useRef(null);
  const getAffectedFileName = () => {
    var _a2, _b, _c;
    const fromLocations = (_b = (_a2 = toolCall.locations) == null ? void 0 : _a2[0]) == null ? void 0 : _b.path;
    if (fromLocations) {
      return fromLocations.split("/").pop() || fromLocations;
    }
    const fromContent = Array.isArray(toolCall.content) ? (_c = toolCall.content.find(
      (c) => typeof c === "object" && c !== null && "path" in c
    )) == null ? void 0 : _c.path : void 0;
    if (typeof fromContent === "string" && fromContent.length > 0) {
      return fromContent.split("/").pop() || fromContent;
    }
    return "file";
  };
  const getTitle = () => {
    if (toolNames.isAgentTool(toolCall.toolName)) {
      return "Launch this agent?";
    }
    if (toolCall.kind === "edit" || toolCall.kind === "write") {
      const fileName = getAffectedFileName();
      return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        "Make this edit to",
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-[var(--app-primary-foreground)]", children: fileName }),
        "?"
      ] });
    }
    if (toolCall.kind === "execute" || toolCall.kind === "bash") {
      return "Allow this bash command?";
    }
    if (toolCall.kind === "read") {
      const fileName = getAffectedFileName();
      return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
        "Allow read from",
        " ",
        /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-mono text-[var(--app-primary-foreground)]", children: fileName }),
        "?"
      ] });
    }
    if (toolCall.kind === "switch_mode") {
      return "Would you like to proceed?";
    }
    return toolCall.title || "Permission Required";
  };
  react.useEffect(() => {
    const handleKeyDown = (e) => {
      var _a2, _b;
      if (!isOpen) {
        return;
      }
      const numMatch = e.key.match(/^[1-9]$/);
      if (numMatch) {
        const index = parseInt(e.key, 10) - 1;
        if (index < options.length) {
          e.preventDefault();
          onResponse(options[index].optionId);
        }
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        if (options.length === 0) {
          return;
        }
        const totalItems = options.length;
        if (e.key === "ArrowDown") {
          setFocusedIndex((prev) => (prev + 1) % totalItems);
        } else {
          setFocusedIndex((prev) => (prev - 1 + totalItems) % totalItems);
        }
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (focusedIndex < options.length) {
          onResponse(options[focusedIndex].optionId);
        }
      }
      if (e.key === "Escape") {
        e.preventDefault();
        const rejectOptionId = ((_a2 = options.find((o) => o.kind.includes("reject"))) == null ? void 0 : _a2.optionId) || ((_b = options.find((o) => o.optionId === "cancel")) == null ? void 0 : _b.optionId) || "cancel";
        onResponse(rejectOptionId);
        if (onClose) {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, options, onResponse, onClose, focusedIndex]);
  react.useEffect(() => {
    if (isOpen && containerRef.current) {
      containerRef.current.focus();
    }
  }, [isOpen]);
  react.useEffect(() => {
    if (isOpen) {
      setFocusedIndex(0);
    }
  }, [isOpen, options.length]);
  const contentText = react.useMemo(() => {
    if (!Array.isArray(toolCall.content)) return null;
    const texts = [];
    for (const item of toolCall.content) {
      const itemType = item["type"];
      const itemContent = item["content"];
      if (itemType === "content" && typeof itemContent === "object" && itemContent !== null) {
        const inner = itemContent;
        if (inner["type"] === "text" && typeof inner["text"] === "string") {
          texts.push(inner["text"]);
        }
      }
    }
    return texts.length > 0 ? texts.join("\n\n") : null;
  }, [toolCall.content]);
  const planText = toolCall.kind === "switch_mode" ? contentText : null;
  const editReviewText = toolCall.kind === "edit" || toolCall.kind === "write" ? contentText : null;
  if (!isOpen) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "fixed inset-x-0 bottom-0 z-[1000] p-2", children: /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      ref: containerRef,
      className: `relative flex flex-col rounded-large border p-2 outline-none animate-slide-up${planText || editReviewText ? " max-h-[60vh]" : ""}`,
      style: {
        backgroundColor: "var(--app-input-secondary-background)",
        borderColor: "var(--app-input-border)"
      },
      tabIndex: 0,
      "data-focused-index": focusedIndex,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "div",
          {
            className: "p-2 absolute inset-0 rounded-large",
            style: { backgroundColor: "var(--app-input-background)" }
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative z-[1] text-[1.1em] text-[var(--app-primary-foreground)] flex flex-col min-h-0", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "font-bold text-[var(--app-primary-foreground)] mb-0.5", children: getTitle() }),
          (toolCall.kind === "edit" || toolCall.kind === "write" || toolCall.kind === "read" || toolCall.kind === "execute" || toolCall.kind === "bash" || toolNames.isAgentTool(toolCall.toolName)) && toolCall.title && /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              className: "text-[13px] font-normal text-[var(--app-secondary-foreground)] opacity-90 font-mono whitespace-normal break-words q-line-clamp-3 mb-2",
              style: {
                fontSize: ".9em",
                color: "var(--app-secondary-foreground)",
                marginBottom: "6px"
              },
              title: toolCall.title,
              children: toolCall.title
            }
          )
        ] }),
        planText && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "relative z-[1] overflow-y-auto mb-2 rounded-[4px] max-h-[40vh] py-2 px-3 text-[13px] leading-normal bg-[var(--app-primary-background)] border border-[var(--app-input-border)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--app-foreground-muted)]/30", children: /* @__PURE__ */ jsxRuntime.jsx(MarkdownRenderer, { content: planText }) }),
        editReviewText && /* @__PURE__ */ jsxRuntime.jsx("pre", { className: "relative z-[1] overflow-y-auto mb-2 rounded-[4px] max-h-[40vh] py-2 px-3 text-[13px] leading-normal whitespace-pre-wrap break-words bg-[var(--app-primary-background)] border border-[var(--app-input-border)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--app-foreground-muted)]/30", children: editReviewText }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "relative z-[1] flex flex-col gap-1 pb-1", children: options.map((option, index) => {
          const isFocused = focusedIndex === index;
          return /* @__PURE__ */ jsxRuntime.jsxs(
            "button",
            {
              className: `flex items-center gap-2 px-2 py-1.5 text-left w-full box-border rounded-[4px] border-0 shadow-[inset_0_0_0_1px_var(--app-transparent-inner-border)] transition-colors duration-150 text-[var(--app-primary-foreground)] hover:bg-[var(--app-button-background)] ${isFocused ? "text-[var(--app-list-active-foreground)] bg-[var(--app-list-active-background)] hover:text-[var(--app-button-foreground)] hover:font-bold hover:relative hover:border-0" : "hover:bg-[var(--app-button-background)] hover:text-[var(--app-button-foreground)] hover:font-bold hover:relative hover:border-0"}`,
              onClick: () => onResponse(option.optionId),
              onMouseEnter: () => setFocusedIndex(index),
              children: [
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "inline-flex items-center justify-center min-w-[10px] h-5 font-semibold opacity-60", children: index + 1 }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "font-semibold", children: option.name })
              ]
            },
            option.optionId
          );
        }) })
      ]
    }
  ) });
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const Icon = ({
  name,
  size = 24,
  color = "currentColor",
  className = ""
}) => (
  // This is a placeholder - in a real implementation you might use an icon library
  /* @__PURE__ */ jsxRuntime.jsx(
    "svg",
    {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: color,
      className,
      children: /* @__PURE__ */ jsxRuntime.jsx(
        "text",
        {
          x: "50%",
          y: "50%",
          dominantBaseline: "middle",
          textAnchor: "middle",
          fontSize: "10",
          children: name
        }
      )
    }
  )
);
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const CloseIcon = ({
  size = 24,
  color = "currentColor",
  className = ""
}) => /* @__PURE__ */ jsxRuntime.jsxs(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
      /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
    ]
  }
);
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const SendIcon = ({
  size = 24,
  color = "currentColor",
  className = ""
}) => /* @__PURE__ */ jsxRuntime.jsxs(
  "svg",
  {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className,
    children: [
      /* @__PURE__ */ jsxRuntime.jsx("line", { x1: "22", y1: "2", x2: "11", y2: "13" }),
      /* @__PURE__ */ jsxRuntime.jsx("polygon", { points: "22 2 15 22 11 13 2 9 22 2" })
    ]
  }
);
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const useTheme = () => {
  const [theme, setTheme] = react.useState("auto");
  react.useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };
  return { theme, toggleTheme };
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = react.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (_error) {
      return initialValue;
    }
  });
  const setValue = (value) => {
    setStoredValue((prev) => {
      try {
        return value instanceof Function ? value(prev) : value;
      } catch (error2) {
        console.error(error2);
        return prev;
      }
    });
  };
  const persistedRef = react.useRef(null);
  react.useEffect(() => {
    const serialized = JSON.stringify(storedValue);
    if (persistedRef.current === serialized) {
      return;
    }
    const isBaseline = persistedRef.current === null;
    persistedRef.current = serialized;
    if (isBaseline) {
      return;
    }
    try {
      window.localStorage.setItem(key, serialized);
    } catch (error2) {
      console.error(error2);
    }
  }, [key, storedValue]);
  return [storedValue, setValue];
};
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const INITIAL_FOLLOWUP_STATE = Object.freeze({
  suggestion: null,
  isVisible: false,
  shownAt: 0
});
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 */
const SUGGESTION_DELAY_MS = 300;
const ACCEPT_DEBOUNCE_MS = 100;
function createFollowupController(options) {
  const { enabled = true, onStateChange, getOnAccept, onOutcome } = options;
  let currentState = INITIAL_FOLLOWUP_STATE;
  let timeoutId = null;
  let accepting = false;
  let acceptTimeoutId = null;
  function applyState(next) {
    currentState = next;
    onStateChange(next);
  }
  function clearTimers() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (acceptTimeoutId) {
      clearTimeout(acceptTimeoutId);
      acceptTimeoutId = null;
    }
  }
  const setSuggestion = (text2) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (!text2) {
      applyState(INITIAL_FOLLOWUP_STATE);
      return;
    }
    if (!enabled) {
      return;
    }
    timeoutId = setTimeout(() => {
      applyState({ suggestion: text2, isVisible: true, shownAt: Date.now() });
    }, SUGGESTION_DELAY_MS);
  };
  const accept = (method, options2) => {
    if (accepting) {
      return;
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    accepting = true;
    const text2 = currentState.suggestion;
    const { shownAt } = currentState;
    if (!text2) {
      accepting = false;
      return;
    }
    try {
      onOutcome == null ? void 0 : onOutcome({
        outcome: "accepted",
        accept_method: method,
        time_ms: shownAt > 0 ? Date.now() - shownAt : 0,
        suggestion_length: text2.length
      });
    } catch (e) {
      console.error("[followup] onOutcome callback threw:", e);
    }
    applyState(INITIAL_FOLLOWUP_STATE);
    queueMicrotask(() => {
      var _a2;
      try {
        if (!(options2 == null ? void 0 : options2.skipOnAccept)) {
          (_a2 = getOnAccept == null ? void 0 : getOnAccept()) == null ? void 0 : _a2(text2);
        }
      } catch (error2) {
        console.error("[followup] onAccept callback threw:", error2);
      } finally {
        if (acceptTimeoutId) {
          clearTimeout(acceptTimeoutId);
        }
        acceptTimeoutId = setTimeout(() => {
          accepting = false;
        }, ACCEPT_DEBOUNCE_MS);
      }
    });
  };
  const dismiss = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (!currentState.isVisible && !currentState.suggestion) {
      return;
    }
    if (currentState.isVisible && currentState.suggestion) {
      try {
        onOutcome == null ? void 0 : onOutcome({
          outcome: "ignored",
          time_ms: currentState.shownAt > 0 ? Date.now() - currentState.shownAt : 0,
          suggestion_length: currentState.suggestion.length
        });
      } catch (e) {
        console.error("[followup] onOutcome callback threw:", e);
      }
    }
    applyState(INITIAL_FOLLOWUP_STATE);
  };
  const clear = () => {
    clearTimers();
    accepting = false;
    applyState(INITIAL_FOLLOWUP_STATE);
  };
  const cleanup = () => {
    clearTimers();
    accepting = false;
  };
  return { setSuggestion, accept, dismiss, clear, cleanup };
}
function useFollowupSuggestions(options = {}) {
  const { enabled = true, onAccept, onOutcome } = options;
  const [state, setState] = react.useState(INITIAL_FOLLOWUP_STATE);
  const onAcceptRef = react.useRef(onAccept);
  onAcceptRef.current = onAccept;
  const onOutcomeRef = react.useRef(onOutcome);
  onOutcomeRef.current = onOutcome;
  const controller = react.useMemo(
    () => createFollowupController({
      enabled,
      onStateChange: setState,
      getOnAccept: () => onAcceptRef.current,
      onOutcome: (params) => {
        var _a2;
        return (_a2 = onOutcomeRef.current) == null ? void 0 : _a2.call(onOutcomeRef, params);
      }
    }),
    [enabled]
  );
  react.useEffect(() => {
    if (!enabled) {
      controller.clear();
    }
    return () => controller.cleanup();
  }, [controller, enabled]);
  const getPlaceholder = react.useCallback(
    (defaultPlaceholder) => {
      if (state.isVisible && state.suggestion) {
        return state.suggestion;
      }
      return defaultPlaceholder;
    },
    [state.isVisible, state.suggestion]
  );
  return react.useMemo(
    () => ({
      state,
      getPlaceholder,
      setSuggestion: controller.setSuggestion,
      accept: controller.accept,
      dismiss: controller.dismiss,
      clear: controller.clear
    }),
    [state, getPlaceholder, controller]
  );
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Adapter for JSONL format messages (used by ChatViewer)
 */
function extractContent(message) {
  var _a2;
  if (!message) return "";
  if ((_a2 = message.parts) == null ? void 0 : _a2.length) {
    return message.parts.map((p) => p.text).join("");
  }
  if (typeof message.content === "string") {
    return message.content;
  }
  if (Array.isArray(message.content)) {
    return message.content.filter(
      (item) => typeof item === "object" && item !== null && "type" in item && item.type === "text"
    ).map((item) => item.text).join("");
  }
  return "";
}
function parseTimestamp(timestamp) {
  const parsed = Date.parse(timestamp);
  return isNaN(parsed) ? Date.now() : parsed;
}
function getMessageType(msg) {
  var _a2;
  if (msg.type === "tool_call") {
    return "tool_call";
  }
  if (msg.type === "user") {
    return "user";
  }
  if (((_a2 = msg.message) == null ? void 0 : _a2.role) === "thinking") {
    return "thinking";
  }
  return "assistant";
}
function isUserType(msg) {
  return !msg || msg.type === "user";
}
function adaptJSONLMessages(messages) {
  const sorted = [...messages].sort(
    (a, b) => parseTimestamp(a.timestamp) - parseTimestamp(b.timestamp)
  );
  return sorted.map((msg, index, arr) => {
    const prev = arr[index - 1];
    const next = arr[index + 1];
    const isFirst = isUserType(prev);
    const isLast = isUserType(next);
    const type = getMessageType(msg);
    const userContent = getUserTranscriptDisplayText(msg);
    return {
      id: msg.uuid,
      type,
      timestamp: parseTimestamp(msg.timestamp),
      content: type !== "tool_call" ? userContent ?? extractContent(msg.message) : void 0,
      toolCall: msg.toolCall,
      isFirst,
      isLast
    };
  });
}
function filterEmptyMessages(messages) {
  return messages.filter((msg) => {
    if (msg.type === "tool_call") return true;
    return msg.content && msg.content.trim().length > 0;
  });
}
/**
 * @license
 * Copyright 2025 Qwen Team
 * SPDX-License-Identifier: Apache-2.0
 *
 * Adapter for ACP protocol messages (used by vscode-ide-companion)
 */
function isUserMessage(msg) {
  if (!msg) return true;
  if (msg.type !== "message") return false;
  const data = msg.data;
  return (data == null ? void 0 : data.role) === "user";
}
function adaptACPMessages(messages) {
  return messages.map((item, index, arr) => {
    const prev = arr[index - 1];
    const next = arr[index + 1];
    const isFirst = isUserMessage(prev);
    const isLast = isUserMessage(next);
    switch (item.type) {
      case "message": {
        const msg = item.data;
        return {
          id: `msg-${index}`,
          type: msg.role === "user" ? "user" : msg.role === "thinking" ? "thinking" : "assistant",
          timestamp: msg.timestamp || Date.now(),
          content: msg.content,
          fileContext: msg.fileContext,
          isFirst,
          isLast
        };
      }
      case "in-progress-tool-call":
      case "completed-tool-call": {
        const toolCall = item.data;
        return {
          id: `tool-${toolCall.toolCallId}-${item.type}`,
          type: "tool_call",
          timestamp: Date.now(),
          toolCall,
          isFirst,
          isLast
        };
      }
      default:
        return {
          id: `unknown-${index}`,
          type: "assistant",
          timestamp: Date.now(),
          content: "",
          isFirst,
          isLast
        };
    }
  });
}
function isToolCallData(data) {
  return typeof data === "object" && data !== null && "toolCallId" in data && "kind" in data;
}
function isMessageData(data) {
  return typeof data === "object" && data !== null && "role" in data && "content" in data;
}
const WebviewContainer = ({
  children,
  className = ""
}) => /* @__PURE__ */ jsxRuntime.jsx("div", { className: `qwen-webui-container ${className}`, children });
exports.AgentToolCall = AgentToolCall;
exports.ArrowUpIcon = ArrowUpIcon;
exports.AskUserQuestionDialog = AskUserQuestionDialog;
exports.AssistantMessage = AssistantMessage;
exports.AutoEditIcon = AutoEditIcon;
exports.Button = Button;
exports.ChatHeader = ChatHeader;
exports.ChatViewer = ChatViewer;
exports.ChatViewerDefault = ChatViewer;
exports.CheckboxDisplay = CheckboxDisplay;
exports.ChevronDownIcon = ChevronDownIcon;
exports.CloseIcon = CloseIcon;
exports.CloseSmallIcon = CloseSmallIcon;
exports.CloseXIcon = CloseIcon$1;
exports.CodeBlock = CodeBlock;
exports.CodeBracketsIcon = CodeBracketsIcon;
exports.CollapsibleFileContent = CollapsibleFileContent;
exports.CompletionMenu = CompletionMenu;
exports.Container = Container;
exports.ContextIndicator = ContextIndicator;
exports.CopyButton = CopyButton;
exports.EditPencilIcon = EditPencilIcon;
exports.EditToolCall = EditToolCall;
exports.EmptyState = EmptyState;
exports.ExpandControlContext = ExpandControlContext;
exports.FileIcon = FileIcon;
exports.FileLink = FileLink;
exports.FileListIcon = FileListIcon;
exports.FolderIcon = FolderIcon;
exports.Footer = Footer;
exports.GenericToolCall = GenericToolCall;
exports.Header = Header;
exports.HideContextIcon = HideContextIcon;
exports.Icon = Icon;
exports.ImageMessageRenderer = ImageMessageRenderer;
exports.ImagePreview = ImagePreview;
exports.Input = Input;
exports.InputForm = InputForm;
exports.InsightProgressCard = InsightProgressCard;
exports.InterruptedMessage = InterruptedMessage;
exports.LinkIcon = LinkIcon;
exports.LocationsList = LocationsList;
exports.Main = Main;
exports.MarkdownRenderer = MarkdownRenderer;
exports.Message = Message;
exports.MessageContent = MessageContent;
exports.MessageInput = MessageInput;
exports.MessageList = MessageList;
exports.Onboarding = Onboarding;
exports.OpenDiffIcon = OpenDiffIcon;
exports.PermissionDrawer = PermissionDrawer;
exports.PlanCompletedIcon = PlanCompletedIcon;
exports.PlanInProgressIcon = PlanInProgressIcon;
exports.PlanModeIcon = PlanModeIcon;
exports.PlanPendingIcon = PlanPendingIcon;
exports.PlatformContext = PlatformContext;
exports.PlatformProvider = PlatformProvider;
exports.PlusIcon = PlusIcon;
exports.PlusSmallIcon = PlusSmallIcon;
exports.ReadToolCall = ReadToolCall;
exports.RefreshIcon = RefreshIcon;
exports.SaveDocumentIcon = SaveDocumentIcon;
exports.SearchIcon = SearchIcon;
exports.SearchToolCall = SearchToolCall;
exports.SelectionIcon = SelectionIcon;
exports.SendIcon = SendIcon;
exports.SessionSelector = SessionSelector;
exports.ShellToolCall = ShellToolCall;
exports.Sidebar = Sidebar;
exports.SlashCommandIcon = SlashCommandIcon;
exports.StatusIndicator = StatusIndicator;
exports.StopIcon = StopIcon;
exports.SymbolIcon = SymbolIcon;
exports.TerminalIcon = TerminalIcon;
exports.ThinkToolCall = ThinkToolCall;
exports.ThinkingIcon = ThinkingIcon;
exports.ThinkingMessage = ThinkingMessage;
exports.ToolCallCard = ToolCallCard;
exports.ToolCallContainer = ToolCallContainer;
exports.ToolCallRow = ToolCallRow;
exports.Tooltip = Tooltip;
exports.UndoIcon = UndoIcon;
exports.UpdatedPlanToolCall = UpdatedPlanToolCall;
exports.UserIcon = UserIcon;
exports.UserMessage = UserMessage;
exports.WaitingMessage = WaitingMessage;
exports.WarningTriangleIcon = WarningTriangleIcon;
exports.WebFetchToolCall = WebFetchToolCall;
exports.WebviewContainer = WebviewContainer;
exports.WriteToolCall = WriteToolCall;
exports.ZERO_WIDTH_SPACE = ZERO_WIDTH_SPACE;
exports.adaptACPMessages = adaptACPMessages;
exports.adaptJSONLMessages = adaptJSONLMessages;
exports.extractCommandOutput = extractCommandOutput;
exports.filterEmptyMessages = filterEmptyMessages;
exports.formatValue = formatValue;
exports.getEditModeIcon = getEditModeIcon;
exports.getTimeAgo = getTimeAgo;
exports.getToolCallComponent = getToolCallComponent;
exports.groupContent = groupContent;
exports.groupSessionsByDate = groupSessionsByDate;
exports.handleCopyToClipboard = handleCopyToClipboard;
exports.hasToolCallOutput = hasToolCallOutput;
exports.isAgentExecutionRawOutput = isAgentExecutionRawOutput;
exports.isAgentExecutionToolCall = isAgentExecutionToolCall;
exports.isMessageData = isMessageData;
exports.isToolCallData = isToolCallData;
exports.mapToolStatusToContainerStatus = mapToolStatusToContainerStatus;
exports.parseContentWithFileReferences = parseContentWithFileReferences;
exports.safeTitle = safeTitle;
exports.shouldShowToolCall = shouldShowToolCall;
exports.stripZeroWidthSpaces = stripZeroWidthSpaces;
exports.useControlledExpanded = useControlledExpanded;
exports.useExpandControl = useExpandControl;
exports.useFollowupSuggestions = useFollowupSuggestions;
exports.useLocalStorage = useLocalStorage;
exports.usePlatform = usePlatform;
exports.useTheme = useTheme;
//# sourceMappingURL=index.cjs.map
