import type { CommandInfo } from '../adapters/types';
export type CommandDisplayCategory = 'custom' | 'skill' | 'system';
export type CommandDisplayCategoryOrder = readonly CommandDisplayCategory[];
export declare const DEFAULT_COMMAND_CATEGORY_ORDER: CommandDisplayCategoryOrder;
export declare function getCommandDisplayCategory(command: CommandInfo): CommandDisplayCategory;
export declare function compareCommandsByCategory(a: CommandInfo, b: CommandInfo, order?: CommandDisplayCategoryOrder): number;
export declare function getCategoryRank(category: CommandDisplayCategory, order?: CommandDisplayCategoryOrder): number;
