import React from "react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader, type PageAction } from "@/components/ui/page-header";
import { cva, type VariantProps } from "class-variance-authority";

// Define props interfaces based on the actual component props
interface PageContainerProps {
  spacing?: "default" | "compact" | "relaxed";
  padding?: "default" | "none" | "sm" | "lg";
}

const pageLayoutVariants = cva("", {
  variants: {
    spacing: {
      default: "space-y-6",
      compact: "space-y-4",
      relaxed: "space-y-8",
    },
  },
  defaultVariants: {
    spacing: "default",
  },
});

interface PageLayoutProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pageLayoutVariants> {
  title: string;
  description?: string;
  actions?: PageAction[];
  containerProps?: PageContainerProps;
  headerClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

export function PageLayout({
  title,
  description,
  actions,
  spacing,
  containerProps,
  headerClassName,
  contentClassName,
  children,
  className,
  ...props
}: PageLayoutProps) {
  return (
    <PageContainer
      spacing={containerProps?.spacing}
      padding={containerProps?.padding}
      className={className || ""}
      {...props}
    >
      <PageHeader
        title={title}
        description={description || ""}
        actions={actions || []}
        className={headerClassName || ""}
      />
      <div className={cn(pageLayoutVariants({ spacing }), contentClassName)}>
        {children}
      </div>
    </PageContainer>
  );
}
