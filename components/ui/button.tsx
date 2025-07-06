import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-status-success text-white hover:bg-status-success/90 shadow-sm hover:shadow",
        soft: "bg-primary-50 text-primary-800 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 [&_svg]:size-3.5",
        "icon-lg": "h-12 w-12 [&_svg]:size-5",
      },
      iconPosition: {
        left: "[&_svg]:order-first",
        right: "[&_svg]:order-last",
      },
      isLoading: {
        true: "relative text-transparent transition-none hover:text-transparent [&_svg]:invisible",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      iconPosition: "left",
      isLoading: false,
    },
    compoundVariants: [
      {
        isLoading: true,
        className: "relative cursor-wait [&_svg]:invisible [&_span]:invisible",
      }
    ]
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, iconPosition, isLoading, loadingText, leftIcon, rightIcon, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // If specific icons are provided, use those over the iconPosition prop
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon;
    
    // Determine effective icon position for styling
    const effectiveIconPosition = hasLeftIcon && !hasRightIcon ? "left" 
                                : !hasLeftIcon && hasRightIcon ? "right" 
                                : iconPosition;
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, iconPosition: effectiveIconPosition, isLoading, className }))}
        ref={ref}
        disabled={props.disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {loadingText && <span className="text-current">{loadingText}</span>}
          </span>
        )}
        {hasLeftIcon && leftIcon}
        {children}
        {hasRightIcon && rightIcon}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
