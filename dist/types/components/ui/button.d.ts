import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
declare const buttonVariants: (props?: ({
    variant?: "link" | "destructive" | "default" | "secondary" | "outline" | "ghost" | null | undefined;
    size?: "default" | "icon" | "xs" | "sm" | "lg" | "icon-xs" | "icon-sm" | "icon-lg" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
};
declare const Button: React.ForwardRefExoticComponent<Omit<ButtonProps, "ref"> & React.RefAttributes<HTMLButtonElement>>;
export { Button, buttonVariants };
