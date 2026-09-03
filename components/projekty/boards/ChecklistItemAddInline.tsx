"use client";

import { useState } from "react";
import { Button } from "@/components/projekty/ui/button";
import { Input } from "@/components/projekty/ui/input";
import { Plus } from "lucide-react";

/** Inline „Přidat položku“ řádek pod checklistem. `checklistId=null` = ještě neexistuje první checklist (D12). */
export function ChecklistItemAddInline({
  checklistId,
  onAdd,
}: {
  checklistId: string | null;
  onAdd: (checklistId: string | null, text: string) => void | Promise<void>;
}) {
  const [active, setActive] = useState(false);
  const [text, setText] = useState("");

  async function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) {
      setActive(false);
      setText("");
      return;
    }
    await onAdd(checklistId, trimmed);
    setText("");
  }

  if (!active) {
    return (
      <button
        type="button"
        onClick={() => setActive(true)}
        className="flex h-8 w-full items-center gap-2 rounded-md px-1 text-[13px] text-muted-foreground hover:bg-muted/40"
      >
        <Plus className="size-3.5" /> Přidat položku
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void handleAdd();
          if (e.key === "Escape") {
            setActive(false);
            setText("");
          }
        }}
        placeholder="Položka…"
        autoFocus
        className="h-7 text-[13px]"
      />
      <Button size="sm" onClick={() => void handleAdd()}>
        Přidat
      </Button>
    </div>
  );
}
