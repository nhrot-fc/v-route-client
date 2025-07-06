"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Divider } from "@/components/ui/divider";

interface SectionContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: "default" | "card" | "bordered" | "ghost";
  size?: "sm" | "default" | "lg";
  divider?: boolean;
}

export function SectionContainer({
  title,
  description,
  icon,
  action,
  collapsible = false,
  defaultCollapsed = false,
  className,
  headerClassName,
  contentClassName,
  children,
  variant = "default",
  size = "default",
  divider = true,
  ...props
}: SectionContainerProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const variants = {
    default: "",
    card: "bg-white dark:bg-card rounded-lg shadow-sm",
    bordered: "border rounded-lg p-4",
    ghost: "bg-muted/40 rounded-lg",
  };

  const sizes = {
    sm: "space-y-2",
    default: "space-y-4",
    lg: "space-y-6",
  };

  const handleToggle = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div
      className={cn(
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div
          className={cn(
            "flex items-center justify-between",
            collapsible && "cursor-pointer",
            headerClassName
          )}
          onClick={handleToggle}
        >
          <div className="flex items-center gap-2">
            {icon && (
              <div className="text-primary shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-medium leading-6">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {action}
            {collapsible && (
              <button
                type="button"
                className="rounded-full p-1 hover:bg-muted text-muted-foreground"
                aria-label={isCollapsed ? "Expand" : "Collapse"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={cn(
                    "h-5 w-5 transition-transform",
                    isCollapsed ? "rotate-180" : "rotate-0"
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {divider && title && <Divider className="my-2" />}

      {(!collapsible || !isCollapsed) && (
        <div className={cn(contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
} 