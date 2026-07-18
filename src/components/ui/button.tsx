import * as React from "react";

const variantClasses = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  destructive:
    "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
  outline:
    "border bg-background text-slate-700 hover:bg-slate-50 dark:bg-input/30 dark:border-input",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50",
  link: "text-primary underline-offset-4 hover:underline",
  primary:
    "border border-green-600 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50",
  danger:
    "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50",
} as const;

const sizeClasses = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md gap-1.5 px-3",
  lg: "h-10 rounded-md px-6",
  icon: "size-9 rounded-md",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  icon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "ghost", size = "default", icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {icon && <span className="inline-flex items-center justify-center shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export const buttonVariants = (_args?: any) => "";
