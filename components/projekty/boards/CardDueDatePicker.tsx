"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cs } from "date-fns/locale";
import { cn } from "@/lib/projekty/utils";
import { formatDue, getDueStatus } from "@/lib/projekty/due-date";

export function CardDueDatePicker({
  value,
  onChange,
  disabled,
  completed = false,
}: {
  value: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
  completed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const status = getDueStatus(value, completed);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className={cn(
              "h-7 -ml-2 px-2 font-normal",
              status === "overdue" && "text-rose-700 dark:text-rose-400",
              status === "today" && "text-amber-700 dark:text-amber-400",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {value ? formatDue(value, "withYear") : "Přidat termín"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(date) => {
              onChange(date ?? null);
              setOpen(false);
            }}
            locale={cs}
            weekStartsOn={1}
          />
        </PopoverContent>
      </Popover>
      {value ? (
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          onClick={() => onChange(null)}
          aria-label="Smazat termín"
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
