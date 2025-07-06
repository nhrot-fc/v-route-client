"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { cva, type VariantProps } from "class-variance-authority";

const iconCardVariants = cva("flex items-start", {
  variants: {
    size: {
      sm: "p-3 gap-2",
      md: "p-4 gap-3",
      lg: "p-5 gap-4",
    },
    variant: {
      default: "",
      bordered: "border rounded-lg",
      raised: "border rounded-lg shadow-sm",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "raised",
  },
});

const iconContainerVariants = cva("flex items-center justify-center rounded-md", {
  variants: {
    size: {
      sm: "p-2",
      md: "p-3",
      lg: "p-4",
    },
    colorScheme: {
      primary: "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      green: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      red: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
      amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      gray: "bg-gray-50 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400",
    },
  },
  defaultVariants: {
    size: "md",
    colorScheme: "primary",
  },
});

export interface IconCardProps extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof iconCardVariants> {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  footer?: React.ReactNode;
  colorScheme?: "primary" | "blue" | "green" | "red" | "amber" | "purple" | "gray";
  iconContainerClassName?: string;
  contentClassName?: string;
  valueClassName?: string;
  titleClassName?: string;
  iconClassName?: string;
  bg?: string;
}

export function IconCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  footer,
  colorScheme = "primary",
  size,
  variant,
  className,
  iconContainerClassName,
  contentClassName,
  valueClassName,
  titleClassName,
  iconClassName,
  bg = "bg-white dark:bg-card",
  ...props
}: IconCardProps) {
  return (
    <Card className={cn(bg, iconCardVariants({ size, variant }), className)} {...props}>
      <div className={cn(iconContainerVariants({ size, colorScheme }), iconContainerClassName)}>
        <span className={cn("shrink-0", iconClassName)}>
          {icon}
        </span>
      </div>
      
      <div className={cn("flex flex-col justify-center", contentClassName)}>
        <div className={cn("text-sm text-muted-foreground", titleClassName)}>
          {title}
        </div>
        
        <div className={cn("text-2xl font-semibold mt-0.5", valueClassName)}>
          {value}
        </div>
        
        {subtitle && (
          <div className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </div>
        )}
        
        {trend && (
          <div className={cn(
            "flex items-center text-xs mt-1",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? (
              <svg 
                className="w-3 h-3 mr-1" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg 
                className="w-3 h-3 mr-1" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span>
              {Math.abs(trend.value)}% {trend.label || (trend.isPositive ? "aumento" : "descenso")}
            </span>
          </div>
        )}
        
        {footer && (
          <div className="mt-2">
            {footer}
          </div>
        )}
      </div>
    </Card>
  );
} 