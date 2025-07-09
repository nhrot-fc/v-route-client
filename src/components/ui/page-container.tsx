

import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const pageContainerVariants = cva(
  "flex-1 space-y-4 p-4 md:p-8 pt-6 transition-all",
  {
    variants: {
      spacing: {
        default: "space-y-4",
        compact: "space-y-3",
        relaxed: "space-y-6",
      },
      padding: {
        default: "p-4 md:p-8 pt-6",
        none: "p-0",
        sm: "p-2 md:p-4",
        lg: "p-6 md:p-10",
      },
    },
    defaultVariants: {
      spacing: "default",
      padding: "default",
    },
  },
);

interface PageContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageContainerVariants> {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function PageContainer({
  children,
  spacing,
  padding,
  className,
  contentClassName,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(pageContainerVariants({ spacing, padding }), className)}
      {...props}
    >
      <div className={cn("h-full", contentClassName)}>{children}</div>
    </div>
  );
}
