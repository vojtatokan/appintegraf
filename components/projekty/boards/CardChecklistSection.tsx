"use client";

import { useState } from "react";
import { Button } from "@/components/projekty/ui/button";
import { ConfirmDialog } from "@/components/projekty/ui/confirm-dialog";
import { Input } from "@/components/projekty/ui/input";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { canAddAnotherChecklist, summarizeChecklists } from "@/lib/projekty/checklist-summary";
import { ChecklistItemAddInline } from "./ChecklistItemAddInline";
import { ChecklistItemRow, type ChecklistItem } from "./ChecklistItemRow";

export type Checklist = {
  id: string;
  cardId: string;
  name: string;
  position: number;
  items: ChecklistItem[];
};

type UserLite = { id: number; email: string | null; name: string | null; image: string | null };

export function CardChecklistSection({
  cardId,
  checklists: initial,
  boardMembers,
}: {
  cardId: string;
  checklists: Checklist[];
  boardMembers: UserLite[];
}) {
  const [checklists, setChecklists] = useState<Checklist[]>(initial);
  const [addingTitle, setAddingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  async function ensureChecklist(): Promise<Checklist | null> {
    if (checklists[0]) return checklists[0];
    const res = await fetch(`/api/projekty/cards/${cardId}/checklists`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Checklist" }),
    });
    if (!res.ok) {
      toast.error("Vytvoření checklistu selhalo.");
      return null;
    }
    const { checklist } = (await res.json()) as { checklist: Checklist };
    const created = { ...checklist, items: checklist.items ?? [] };
    setChecklists((prev) => [...prev, created]);
    return created;
  }

  async function handleAddChecklist() {
    const trimmed = newTitle.trim();
    if (!trimmed) {
      setAddingTitle(false);
      setNewTitle("");
      return;
    }
    const res = await fetch(`/api/projekty/cards/${cardId}/checklists`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    if (!res.ok) {
      toast.error("Vytvoření selhalo.");
      return;
    }
    const { checklist } = (await res.json()) as { checklist: Checklist };
    setChecklists((prev) => [...prev, { ...checklist, items: checklist.items ?? [] }]);
    setNewTitle("");
    setAddingTitle(false);
  }

  async function handleDeleteChecklist(id: string) {
    const res = await fetch(`/api/projekty/checklists/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Smazání selhalo.");
      return;
    }
    setChecklists((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleAddItem(checklistId: string, text: string) {
    const res = await fetch(`/api/projekty/checklists/${checklistId}/items`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      toast.error("Přidání položky selhalo.");
      return;
    }
    const { item } = (await res.json()) as { item: ChecklistItem };
    setChecklists((prev) =>
      prev.map((c) => (c.id === checklistId ? { ...c, items: [...c.items, item] } : c)),
    );
  }

  const summary = summarizeChecklists(checklists);
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Checklist</h3>
        {summary.total > 0 ? <span className="text-xs tabular-nums text-muted-foreground">{summary.done}/{summary.total}</span> : null}
      </div>
      {summary.total > 0 ? (
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full border border-border bg-muted/40">
            <div className="h-full bg-emerald-600 transition-[width] duration-200 motion-reduce:transition-none dark:bg-emerald-500" style={{ width: `${summary.pct}%` }} />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">{summary.pct} %</span>
        </div>
      ) : null}

      {checklists.map((cl) => (
        <div key={cl.id} className="space-y-0.5">
          {checklists.length > 1 ? (
            <div className="flex items-center justify-between pt-2">
              <h4 className="text-[13px] font-medium">{cl.name}</h4>
              <ConfirmDialog
                trigger={<Button size="icon-xs" variant="ghost" aria-label="Smazat seznam" className="text-muted-foreground"><Trash2 className="size-3.5" /></Button>}
                title={`Smazat seznam „${cl.name}“?`}
                description="Smaže seznam včetně všech položek."
                destructive
                confirmLabel="Smazat"
                onConfirm={() => handleDeleteChecklist(cl.id)}
              />
            </div>
          ) : null}
          {cl.items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              boardMembers={boardMembers}
              onUpdate={(updated) =>
                setChecklists((prev) =>
                  prev.map((c) =>
                    c.id === cl.id
                      ? { ...c, items: c.items.map((i) => (i.id === updated.id ? updated : i)) }
                      : c,
                  ),
                )
              }
              onDelete={() =>
                setChecklists((prev) =>
                  prev.map((c) =>
                    c.id === cl.id ? { ...c, items: c.items.filter((i) => i.id !== item.id) } : c,
                  ),
                )
              }
            />
          ))}
          <ChecklistItemAddInline checklistId={cl.id} onAdd={(_id, text) => handleAddItem(cl.id, text)} />
        </div>
      ))}

      {checklists.length === 0 ? (
        <ChecklistItemAddInline
          checklistId={null}
          onAdd={async (_id, text) => {
            const cl = await ensureChecklist();
            if (cl) await handleAddItem(cl.id, text);
          }}
        />
      ) : null}

      {canAddAnotherChecklist(checklists) ? (
        !addingTitle ? (
          <button type="button" onClick={() => setAddingTitle(true)} className="text-xs text-muted-foreground hover:text-foreground">
            + Přidat další seznam
          </button>
        ) : (
          <div className="flex gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleAddChecklist();
                if (e.key === "Escape") {
                  setAddingTitle(false);
                  setNewTitle("");
                }
              }}
              placeholder="Název checklistu…"
              autoFocus
              className="h-7 text-[13px]"
            />
            <Button size="sm" onClick={() => void handleAddChecklist()}>
              Přidat
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setAddingTitle(false);
                setNewTitle("");
              }}
            >
              Zrušit
            </Button>
          </div>
        )
      ) : null}
    </div>
  );
}
