"use client";

import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LogLevel } from "@/lib/types";

interface LogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  level: LogLevel | "all";
  onLevelChange: (value: LogLevel | "all") => void;
  onExport: () => void;
}

export function LogFilters({
  search,
  onSearchChange,
  level,
  onLevelChange,
  onExport,
}: LogFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={level} onValueChange={(v) => onLevelChange(v as LogLevel | "all")}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Log level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All levels</SelectItem>
          <SelectItem value="info">Info</SelectItem>
          <SelectItem value="warning">Warning</SelectItem>
          <SelectItem value="error">Error</SelectItem>
          <SelectItem value="debug">Debug</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="mr-2 size-4" />
        Export
      </Button>
    </div>
  );
}
