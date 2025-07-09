

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  date,
  setDate,
  className,
  placeholder = "YYYY-MM-DD",
  disabled = false,
}: DatePickerProps) {
  // Format the date as YYYY-MM-DD for the input
  const formattedDate = date ? date.toISOString().split("T")[0] : "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setDate(undefined);
      return;
    }

    const newDate = new Date(value);
    if (!isNaN(newDate.getTime())) {
      setDate(newDate);
    }
  };

  return (
    <Input
      type="date"
      value={formattedDate}
      onChange={handleChange}
      className={cn("w-full", className)}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}
