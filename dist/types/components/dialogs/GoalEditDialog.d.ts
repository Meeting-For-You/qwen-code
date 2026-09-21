interface GoalEditDialogProps {
    objective: string;
    saving: boolean;
    error?: string | null;
    onSave: (objective: string) => void;
    onClose: () => void;
}
export declare function GoalEditDialog({ objective, saving, error, onSave, onClose, }: GoalEditDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
