"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  className?: string
  initialDateFrom?: Date
  initialDateTo?: Date
  onUpdate?: (date: { from: Date; to: Date }) => void
  align?: "center" | "start" | "end"
}

export function DateRangePicker({
  className,
  initialDateFrom,
  initialDateTo,
  onUpdate,
  align = "center",
}: DateRangePickerProps) {
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(initialDateFrom || new Date())
  const [dateTo, setDateTo] = React.useState<Date | undefined>(initialDateTo || new Date())
  const [isOpen, setIsOpen] = React.useState(false)

  // Format the date as YYYY-MM-DD for the input
  const formatDate = (date: Date | undefined): string => {
    return date ? date.toISOString().split('T')[0] : '';
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setDateFrom(undefined);
      return;
    }
    
    const newDate = new Date(value);
    if (!isNaN(newDate.getTime())) {
      setDateFrom(newDate);
      if (dateTo && onUpdate) {
        onUpdate({ from: newDate, to: dateTo });
      }
    }
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setDateTo(undefined);
      return;
    }
    
    const newDate = new Date(value);
    if (!isNaN(newDate.getTime())) {
      setDateTo(newDate);
      if (dateFrom && onUpdate) {
        onUpdate({ from: dateFrom, to: newDate });
      }
    }
  };

  React.useEffect(() => {
    if (dateFrom && dateTo && onUpdate) {
      onUpdate({ from: dateFrom, to: dateTo });
    }
  }, [dateFrom, dateTo, onUpdate]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateFrom && !dateTo && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateFrom ? (
              dateTo ? (
                <>
                  {format(dateFrom, "dd/MM/yyyy")} -{" "}
                  {format(dateTo, "dd/MM/yyyy")}
                </>
              ) : (
                format(dateFrom, "dd/MM/yyyy")
              )
            ) : (
              <span>Seleccione un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 space-y-3" align={align}>
          <div className="space-y-2">
            <label htmlFor="date-from" className="text-sm font-medium">
              Fecha de inicio
            </label>
            <Input
              id="date-from"
              type="date"
              value={formatDate(dateFrom)}
              onChange={handleFromChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="date-to" className="text-sm font-medium">
              Fecha de fin
            </label>
            <Input
              id="date-to"
              type="date"
              value={formatDate(dateTo)}
              onChange={handleToChange}
            />
          </div>
          <div className="flex justify-end">
            <Button 
              size="sm" 
              onClick={() => setIsOpen(false)}
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 