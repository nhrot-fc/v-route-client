import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface TableFilterTabsProps<T> {
  filterTabs: {
    id: string;
    label: string;
    icon?: React.ReactNode;
    count?: number;
    filter: (item: T) => boolean;
  }[];
  data: T[];
  activeFilter: string;
  onFilterChange: (id: string) => void;
  showAllTab?: boolean;
}

export function TableFilterTabs<T>({
  filterTabs,
  data,
  activeFilter = "all",
  onFilterChange,
  showAllTab = true,
}: TableFilterTabsProps<T>) {
  return (
    <Tabs
      value={activeFilter}
      onValueChange={onFilterChange}
      className="w-full"
    >
      <TabsList className="w-full sm:w-auto">
        {showAllTab && (
          <TabsTrigger value="all" className="flex gap-1.5">
            Todos
            <Badge variant="outline" className="ml-1">
              {data.length}
            </Badge>
          </TabsTrigger>
        )}

        {filterTabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} className="flex gap-1.5">
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
            {tab.label}
            <Badge variant="outline" className="ml-1">
              {tab.count !== undefined
                ? tab.count
                : data.filter(tab.filter).length}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
