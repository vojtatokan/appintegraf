"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/projekty/UserAvatar";
import { DueDateBadge } from "@/components/projekty/DueDateBadge";
import { toast } from "sonner";
import { ChecklistItemMenu } from "./ChecklistItemMenu";

type UserLite = { id: number; email: string | null; name: string | null; image: string | null };

export type ChecklistItem = {
  id: string;
  checklistId: string;
  text: string;
  done: boolean;
  position: number;
  assigneeId: number | null;
  dueDate: string | null;
};

export function ChecklistItemRow({
  item,
  boardMembers,
  onUpdate,
  onDelete,
}: {
  item: ChecklistItem;
  boardMembers: UserLite[];
  onUpdate: (item: ChecklistItem) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const [busy, setBusy] = useState(false);

  async function patch(payload: Record<string, unknown>) {
    const res = await fetch(`/api/projekty/checklist-items/${item.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      toast.error("Uložení selhalo.");
      return null;
    }
    const { item: updated } = (await res.json()) as { item: ChecklistItem };
    onUpdate(updated);
    return updated;
  }

  async function handleToggle(done: boolean) {
    setBusy(true);
    await patch({ done });
    setBusy(false);
  }

  async function handleTextSave() {
    if (text.trim() === item.text || !text.trim()) {
      setText(item.text);
      setEditing(false);
      return;
    }
    setBusy(true);
    await patch({ text: text.trim() });
    setBusy(false);
    setEditing(false);
  }

  async function handleDelete() {
    setBusy(true);
    const res = await fetch(`/api/projekty/checklist-items/${item.id}`, { method: "DELETE" });
    setBusy(false);
    if (!res.ok) {
      toast.error("Smazání selhalo.");
      return;
    }
    onDelete();
  }

  const assignee = item.assigneeId
    ? boardMembers.find((u) => u.id === item.assigneeId) ?? null
    : null;
  const due = item.dueDate ? new Date(item.dueDate) : null;

  return (
    <div className="group flex min-h-8 items-center gap-2 rounded-md px-1 hover:bg-muted/40">
      <Checkbox checked={item.done} disabled={busy} onCheckedChange={(v) => void handleToggle(Boolean(v))} className="size-4 rounded" />
      {editing ? (
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => void handleTextSave()}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleTextSave();
            if (e.key === "Escape") {
              setText(item.text);
              setEditing(false);
            }
          }}
          autoFocus
          className="h-7 text-[13px]"
          disabled={busy}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`flex-1 truncate text-left text-[13px] ${item.done ? "text-muted-foreground line-through" : ""}`}
        >
          {item.text}
        </button>
      )}
      {assignee ? (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title={assignee.name ?? undefined}>
          <UserAvatar user={assignee} className="size-4" />
        </span>
      ) : null}
      {due ? <DueDateBadge due={due} completed={item.done} className="text-xs" /> : null}
      <span className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100 motion-reduce:transition-none [@media(pointer:coarse)]:opacity-100">
        <ChecklistItemMenu item={item} boardMembers={boardMembers} onPatch={patch} onDelete={handleDelete} />
      </span>
    </div>
  );
}
