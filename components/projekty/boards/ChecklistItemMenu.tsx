"use client";

import { useState } from "react";
import { Calendar, MoreHorizontal, Trash2, User as UserIcon, X } from "lucide-react";
import { cs } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { UserAvatar } from "@/components/projekty/UserAvatar";
import type { ChecklistItem } from "./ChecklistItemRow";

type UserLite = { id: number; email: string | null; name: string | null; image: string | null };

/**
 * ⋯ menu položky checklistu (D12): Přiřadit osobu · Termín · Smazat. Max 5 položek (C8).
 *
 * Jeden `Popover` kotvený přes `PopoverAnchor` na wrapper kolem ⋯ tlačítka (`DropdownMenu`) —
 * `PopoverContent` uvnitř nemá vlastní `PopoverTrigger`, takže bez explicitního anchoru by se
 * ukotvil na `null` a picker by se vykreslil na náhodné pozici. Obsah pickeru se přepíná podle
 * `sub`, takže je vždy jen jeden `PopoverContent` (žádné vnořené `Popover` root komponenty).
 */
export function ChecklistItemMenu({
  item,
  boardMembers,
  onPatch,
  onDelete,
}: {
  item: ChecklistItem;
  boardMembers: UserLite[];
  onPatch: (payload: Record<string, unknown>) => Promise<unknown>;
  onDelete: () => Promise<void>;
}) {
  const [sub, setSub] = useState<"who" | "when" | null>(null);

  return (
    <Popover open={sub !== null} onOpenChange={(o) => !o && setSub(null)}>
      <PopoverAnchor asChild>
        <span className="inline-flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-xs" variant="ghost" aria-label="Akce položky" className="text-muted-foreground">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => setSub("who")}><UserIcon className="size-4" /> Přiřadit osobu</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSub("when")}><Calendar className="size-4" /> Termín položky</DropdownMenuItem>
              {item.assigneeId || item.dueDate ? (
                <DropdownMenuItem onSelect={() => void onPatch({ assigneeId: null, dueDate: null })}><X className="size-4" /> Odebrat osobu a termín</DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <ConfirmDialog
                trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-700 focus:text-red-700 dark:text-red-400"><Trash2 className="size-4" /> Smazat</DropdownMenuItem>}
                title={`Smazat „${item.text}“?`}
                destructive
                confirmLabel="Smazat"
                onConfirm={onDelete}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </PopoverAnchor>

      {sub === "who" ? (
        <PopoverContent className="w-56 p-1" align="end">
          {boardMembers.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => {
                void onPatch({ assigneeId: u.id });
                setSub(null);
              }}
              className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[13px] hover:bg-muted"
            >
              <UserAvatar user={u} className="size-5" />
              <span className="truncate">{u.name ?? u.email ?? "—"}</span>
            </button>
          ))}
        </PopoverContent>
      ) : null}

      {sub === "when" ? (
        <PopoverContent className="w-auto p-0" align="end">
          <CalendarPicker
            mode="single"
            selected={item.dueDate ? new Date(item.dueDate) : undefined}
            onSelect={(date) => {
              void onPatch({ dueDate: date ? date.toISOString() : null });
              setSub(null);
            }}
            locale={cs}
            weekStartsOn={1}
          />
        </PopoverContent>
      ) : null}
    </Popover>
  );
}
