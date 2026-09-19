import type { SkillInfo } from '../../completions/slashCompletion';
import type { WebShellComposerTag } from '../../customization';
import type { AtMentionWorkspaceActions } from '../../hooks/useAtMentionSources';
export interface AddMenuProps {
    disabled?: boolean;
    availabilityKey: string;
    addFileAvailable: boolean;
    uploadAvailable: boolean;
    onAddFiles: (files: File[], destination: 'attach' | 'upload') => void;
    onFilePickerCancel: () => void;
    onInsertReference: (tag: WebShellComposerTag) => void;
    onPrependSkill: (invocation: string) => void;
    getWorkspaceActions: () => AtMentionWorkspaceActions | undefined;
    skills: readonly SkillInfo[];
}
export declare function AddMenu({ disabled, availabilityKey, addFileAvailable, uploadAvailable, onAddFiles, onFilePickerCancel, onInsertReference, onPrependSkill, getWorkspaceActions, skills, }: AddMenuProps): import("react/jsx-runtime").JSX.Element;
