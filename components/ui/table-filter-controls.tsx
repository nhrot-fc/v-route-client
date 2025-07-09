"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, X } from "lucide-react";

interface TableFilterControlsProps {
  filters: {
    id: string;
    label: string;
    type: "text" | "number" | "select";
    options?: { value: string; label: string }[];
    value: string | number | undefined;
    onChange: (value: string | number | undefined) => void;
  }[];
  onReset: () => void;
}

export function TableFilterControls({
  filters,
  onReset,
}: TableFilterControlsProps) {
  const hasActiveFilters = filters.some(
    (filter) =>
      filter.value !== undefined &&
      filter.value !== "" &&
      filter.value !== null,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtros</span>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onReset}
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filters.map((filter) => (
          <div key={filter.id} className="space-y-1">
            <label
              htmlFor={filter.id}
              className="text-xs text-muted-foreground"
            >
              {filter.label}
            </label>

            {filter.type === "select" && (
              <Select
                value={filter.value?.toString() || "all"}
                onValueChange={(value) =>
                  filter.onChange(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger id={filter.id} className="h-8">
                  <SelectValue
                    placeholder={`Seleccionar ${filter.label.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {filter.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filter.type === "text" && (
              <Input
                id={filter.id}
                type="text"
                className="h-8"
                value={filter.value?.toString() || ""}
                onChange={(e) => filter.onChange(e.target.value || undefined)}
                placeholder={`Filtrar por ${filter.label.toLowerCase()}`}
              />
            )}

            {filter.type === "number" && (
              <Input
                id={filter.id}
                type="number"
                className="h-8"
                value={filter.value?.toString() || ""}
                onChange={(e) =>
                  filter.onChange(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                placeholder={`Mínimo ${filter.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
