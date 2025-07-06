"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const inputContainerVariants = cva("relative w-full", {
  variants: {
    hasIcon: {
      left: "",
      right: "",
      both: "",
      none: "",
    },
  },
  defaultVariants: {
    hasIcon: "none",
  },
});

export interface InputWithIconProps extends Omit<React.ComponentProps<"input">, "prefix" | "suffix"> {
  id?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  hint?: string;
  tooltip?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputWrapperClassName?: string;
  isRequired?: boolean;
  isLoading?: boolean;
}

export function InputWithIcon({
  id,
  label,
  leftIcon,
  rightIcon,
  error,
  hint,
  tooltip,
  className,
  containerClassName,
  labelClassName,
  inputWrapperClassName,
  isRequired,
  isLoading = false,
  disabled,
  ...props
}: InputWithIconProps) {
  // Determine what icons are present
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon || isLoading;
  
  // Determine the input padding based on icon presence
  const getInputClassName = () => {
    if (hasLeftIcon && hasRightIcon) {
      return "pl-10 pr-10";
    } else if (hasLeftIcon) {
      return "pl-10";
    } else if (hasRightIcon) {
      return "pr-10";
    }
    return "";
  };
  
  // Generate a unique ID for the input if not provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <div className="flex items-center gap-1">
          <Label 
            htmlFor={inputId} 
            className={cn("text-sm font-medium", labelClassName)}
          >
            {label}
            {isRequired && <span className="text-red-500 ml-0.5">*</span>}
          </Label>
          
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
      
      <div
        className={cn(
          inputContainerVariants({
            hasIcon: hasLeftIcon && hasRightIcon 
              ? "both" 
              : hasLeftIcon 
                ? "left" 
                : hasRightIcon 
                  ? "right" 
                  : "none"
          }),
          inputWrapperClassName
        )}
      >
        <Input
          id={inputId}
          className={cn(getInputClassName(), 
            error ? "border-red-300 focus-visible:ring-red-300" : "", 
            className
          )}
          disabled={disabled || isLoading}
          {...props}
        />
        
        {hasLeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        
        {hasRightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {isLoading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>
      
      {(error || hint) && (
        <p className={cn(
          "text-xs",
          error ? "text-red-500" : "text-muted-foreground"
        )}>
          {error || hint}
        </p>
      )}
    </div>
  );
} 