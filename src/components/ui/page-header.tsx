

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const pageHeaderVariants = cva(
  "flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6",
  {
    variants: {
      size: {
        default: "",
        sm: "mb-4",
        lg: "mb-8",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface PageAction {
  icon?: React.ReactNode;
  label: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  onClick?: () => void;
}

interface PageHeaderProps extends VariantProps<typeof pageHeaderVariants> {
  title: string;
  description?: string;
  actions?: PageAction[];
  className?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  size,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn(pageHeaderVariants({ size }), className)}>
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm md:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {actions.map((action, index) => (
            <Button
              key={`action-${index}`}
              variant={action.variant || "outline"}
              onClick={action.onClick}
              className="flex items-center gap-2"
            >
              {action.icon && <span className="h-4 w-4">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
