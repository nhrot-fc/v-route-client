"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, Clock, Loader2 } from "lucide-react";

export interface StatusBadgeProps {
  status: "success" | "error" | "warning" | "pending" | "loading" | "info";
  size?: "sm" | "default" | "lg";
  text?: string;
  showIcon?: boolean;
  className?: string;
  animated?: boolean;
}

export function StatusBadge({ 
  status, 
  size = "default", 
  text, 
  showIcon = true, 
  className,
  animated = false
}: StatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          variant: "success" as const,
          icon: <CheckCircle className="h-3 w-3" />,
          defaultText: "Completado"
        };
      case "error":
        return {
          variant: "error" as const,
          icon: <XCircle className="h-3 w-3" />,
          defaultText: "Error"
        };
      case "warning":
        return {
          variant: "warning" as const,
          icon: <AlertCircle className="h-3 w-3" />,
          defaultText: "Advertencia"
        };
      case "pending":
        return {
          variant: "info" as const,
          icon: <Clock className="h-3 w-3" />,
          defaultText: "Pendiente"
        };
      case "loading":
        return {
          variant: "info" as const,
          icon: <Loader2 className={`h-3 w-3 ${animated ? "animate-spin" : ""}`} />,
          defaultText: "Cargando"
        };
      case "info":
      default:
        return {
          variant: "info" as const,
          icon: <AlertCircle className="h-3 w-3" />,
          defaultText: "Info"
        };
    }
  };

  const { variant, icon, defaultText } = getStatusConfig();
  const displayText = text || defaultText;

  return (
    <Badge 
      variant={variant}
      size={size} 
      icon={showIcon ? icon : undefined}
      className={className}
    >
      {displayText}
    </Badge>
  );
} 