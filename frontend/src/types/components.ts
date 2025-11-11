// Common component types and props

import { ReactNode } from "react";

// Button variants
export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
export type ButtonSize = "default" | "sm" | "lg" | "icon";

// Input types
export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search";

// Card components
export interface CardProps {
  className?: string;
  children?: ReactNode;
}

export interface CardHeaderProps {
  className?: string;
  children?: ReactNode;
}

export interface CardTitleProps {
  className?: string;
  children?: ReactNode;
}

export interface CardDescriptionProps {
  className?: string;
  children?: ReactNode;
}

export interface CardContentProps {
  className?: string;
  children?: ReactNode;
}

export interface CardFooterProps {
  className?: string;
  children?: ReactNode;
}

// Dialog components
export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

export interface DialogContentProps {
  className?: string;
  children?: ReactNode;
}

export interface DialogHeaderProps {
  className?: string;
  children?: ReactNode;
}

export interface DialogTitleProps {
  className?: string;
  children?: ReactNode;
}

export interface DialogDescriptionProps {
  className?: string;
  children?: ReactNode;
}

export interface DialogFooterProps {
  className?: string;
  children?: ReactNode;
}

// Select components
export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options?: SelectOption[];
  children?: ReactNode;
}

// Skeleton loading
export interface SkeletonProps {
  className?: string;
}

// Badge component
export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
export type BadgeSize = "default" | "sm" | "lg";

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  children?: ReactNode;
}

// Form field
export interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  children?: ReactNode;
}

// Tabs
export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
  className?: string;
}

export interface TabsListProps {
  children?: ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface TabsContentProps {
  value: string;
  children?: ReactNode;
  className?: string;
}

// Accordion
export interface AccordionItemProps {
  value: string;
  children?: ReactNode;
}

export interface AccordionTriggerProps {
  children?: ReactNode;
  className?: string;
}

export interface AccordionContentProps {
  children?: ReactNode;
  className?: string;
}

// Navigation menu
export interface NavigationMenuProps {
  children?: ReactNode;
}

export interface NavigationMenuItemProps {
  children?: ReactNode;
}

export interface NavigationMenuTriggerProps {
  children?: ReactNode;
  className?: string;
}

export interface NavigationMenuContentProps {
  children?: ReactNode;
  className?: string;
}

export interface NavigationMenuLinkProps {
  href?: string;
  children?: ReactNode;
  className?: string;
}
