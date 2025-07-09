

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export interface CalendarProps {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | { from: Date; to: Date } | undefined;
  onSelect?: (date: Date | { from: Date; to: Date } | undefined) => void;
  defaultMonth?: Date;
  numberOfMonths?: number;
  disabled?: boolean;
  initialFocus?: boolean;
}

function Calendar({
  className,
  selected,
  onSelect,
  disabled = false,
  mode = "single",
}: CalendarProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelect) return;

    const value = e.target.value;
    if (!value) {
      onSelect(undefined);
      return;
    }

    const newDate = new Date(value);
    if (!isNaN(newDate.getTime())) {
      if (mode === "single") {
        onSelect(newDate);
      } else if (
        mode === "range" &&
        selected &&
        typeof selected === "object" &&
        "from" in selected
      ) {
        // If we have a from date already, set the to date
        if (selected.from && !selected.to) {
          onSelect({ from: selected.from, to: newDate });
        } else {
          // Otherwise set the from date
          onSelect({ from: newDate, to: undefined as unknown as Date });
        }
      }
    }
  };

  // Format the date as YYYY-MM-DD for the input
  const getFormattedDate = (date: Date | undefined): string => {
    return date ? date.toISOString().split("T")[0] : "";
  };

  let formattedDate = "";

  if (selected) {
    if (mode === "single" && selected instanceof Date) {
      formattedDate = getFormattedDate(selected);
    }
  }

  return (
    <div className={cn("p-3 space-y-4", className)}>
      {mode === "single" && (
        <Input
          type="date"
          value={formattedDate}
          onChange={handleDateChange}
          className={cn("w-full")}
          disabled={disabled}
        />
      )}
      {mode === "range" && (
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="mr-2 text-sm">Desde:</span>
            <Input
              type="date"
              value={
                selected && typeof selected === "object" && "from" in selected
                  ? getFormattedDate(selected.from)
                  : ""
              }
              onChange={(e) => {
                if (!onSelect) return;
                const value = e.target.value;
                if (!value) return;

                const newDate = new Date(value);
                if (!isNaN(newDate.getTime())) {
                  if (
                    selected &&
                    typeof selected === "object" &&
                    "from" in selected &&
                    selected.to
                  ) {
                    onSelect({ from: newDate, to: selected.to });
                  } else {
                    onSelect({
                      from: newDate,
                      to: undefined as unknown as Date,
                    });
                  }
                }
              }}
              className={cn("w-full")}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-sm">Hasta:</span>
            <Input
              type="date"
              value={
                selected &&
                typeof selected === "object" &&
                "from" in selected &&
                selected.to
                  ? getFormattedDate(selected.to)
                  : ""
              }
              onChange={(e) => {
                if (!onSelect) return;
                const value = e.target.value;
                if (!value) return;

                const newDate = new Date(value);
                if (!isNaN(newDate.getTime())) {
                  if (
                    selected &&
                    typeof selected === "object" &&
                    "from" in selected
                  ) {
                    onSelect({
                      from: selected.from || new Date(),
                      to: newDate,
                    });
                  }
                }
              }}
              className={cn("w-full")}
              disabled={disabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
