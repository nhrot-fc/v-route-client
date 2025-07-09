

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const dividerVariants = cva("shrink-0", {
  variants: {
    orientation: {
      horizontal: "w-full border-t",
      vertical: "h-full border-l",
    },
    variant: {
      default: "border-border",
      muted: "border-muted",
      primary: "border-primary/20",
    },
    thickness: {
      thin: "border-[0.5px]",
      default: "border-[1px]",
      thick: "border-[2px]",
    },
    spacing: {
      none: "",
      small: "my-2",
      default: "my-4",
      large: "my-6",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    variant: "default",
    thickness: "default",
    spacing: "default",
  },
});

interface DividerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> {
  label?: string;
  labelPosition?: "left" | "center" | "right";
  labelClassName?: string;
}

export function Divider({
  className,
  orientation = "horizontal",
  variant,
  thickness,
  spacing,
  label,
  labelPosition = "center",
  labelClassName,
  ...props
}: DividerProps) {
  if (label && orientation === "horizontal") {
    const labelPositionClasses = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    };

    return (
      <div
        className={cn(
          "flex items-center w-full",
          orientation === "horizontal" &&
            spacing !== "none" &&
            dividerVariants({ spacing }),
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "w-full flex items-center",
            labelPositionClasses[labelPosition],
          )}
        >
          {labelPosition !== "left" && (
            <div
              className={cn(
                dividerVariants({
                  orientation,
                  variant,
                  thickness,
                  spacing: "none",
                }),
                "flex-grow",
              )}
            ></div>
          )}
          <span
            className={cn(
              "text-xs text-muted-foreground px-2 flex-shrink-0",
              labelClassName,
            )}
          >
            {label}
          </span>
          {labelPosition !== "right" && (
            <div
              className={cn(
                dividerVariants({
                  orientation,
                  variant,
                  thickness,
                  spacing: "none",
                }),
                "flex-grow",
              )}
            ></div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        dividerVariants({ orientation, variant, thickness, spacing }),
        className,
      )}
      {...props}
    />
  );
}
