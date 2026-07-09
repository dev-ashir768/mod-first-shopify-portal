"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateRangePicker({
  value,
  onChange,
  className,
}: {
  value?: DateRange;
  onChange: (range?: DateRange) => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  const label = value?.from
    ? value.to
      ? `${format(value.from, "MMM d, yyyy")} – ${format(value.to, "MMM d, yyyy")}`
      : format(value.from, "MMM d, yyyy")
    : "Date range";

  return (
    <div className={cn("flex items-center", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              className={cn(
                "justify-start font-normal",
                !value?.from && "text-muted-foreground",
                value?.from && "rounded-r-none border-r-0"
              )}
            >
              <CalendarIcon className="size-4" />
              {label}
            </Button>
          }
        />
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            numberOfMonths={2}
            defaultMonth={value?.from ?? new Date()}
            selected={value}
            onSelect={onChange}
            disabled={{ after: new Date() }}
          />
          <div className="flex items-center justify-end gap-2 border-t p-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              Clear
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      {value?.from && (
        <Button
          variant="outline"
          size="icon"
          className="rounded-l-none"
          aria-label="Clear date range"
          onClick={() => onChange(undefined)}
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
}
