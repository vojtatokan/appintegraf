"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Bold, Italic, ImagePlus, List, ListChecks } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { LinkPopover } from "./LinkPopover";
import { Callout } from "./extensions/Callout";
import { Toggle, ToggleSummary, ToggleBody } from "./extensions/Toggle";
import { ImageUpload, uploadAndInsert } from "./extensions/ImageUpload";

/**
 * Editor popisu se šesti tlačítky (D11): tučně, kurzíva, odrážky, checklist, odkaz, obrázek.
 * Callout a Toggle zůstávají registrované, aby se starý obsah vykreslil; nová tlačítka pro ně nejsou.
 * StarterKit beze `configure` — heading/blockquote/codeBlock/horizontalRule zůstávají zapnuté
 * (bez tlačítka), aby starý obsah s těmito bloky nepřišel při editaci o data.
 */
export function TiptapEditor({
  value,
  onChange,
  placeholder = "",
  className = "",
  cardId,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  /** Bez cardId (osobní úkol) není kam nahrát obrázek → tlačítko se skryje. */
  cardId?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: false }),
      Callout,
      Toggle,
      ToggleSummary,
      ToggleBody,
      ...(cardId ? [Image, ImageUpload.configure({ cardId })] : []),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    immediatelyRender: false,
  });

  async function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor || !cardId) return;
    await uploadAndInsert(editor.view, file, cardId);
    e.target.value = "";
  }

  if (!editor) return null;

  const tool = (active: boolean) => ({
    type: "button" as const,
    size: "icon-sm" as const,
    variant: "ghost" as const,
    className: active ? "size-9 sm:size-7 bg-muted text-foreground" : "size-9 sm:size-7 text-muted-foreground",
  });

  return (
    <div className={`rounded-lg border border-border bg-card ${className}`}>
      <div className="flex items-center gap-0.5 border-b border-border px-1.5 py-1">
        <Button {...tool(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Tučně" title="Tučně (Ctrl B)">
          <Bold className="size-3.5" />
        </Button>
        <Button {...tool(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Kurzíva" title="Kurzíva (Ctrl I)">
          <Italic className="size-3.5" />
        </Button>
        <Button {...tool(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Odrážky">
          <List className="size-3.5" />
        </Button>
        <Button {...tool(editor.isActive("taskList"))} onClick={() => editor.chain().focus().toggleTaskList().run()} aria-label="Checklist">
          <ListChecks className="size-3.5" />
        </Button>
        <LinkPopover editor={editor} />
        {cardId ? (
          <Button {...tool(false)} onClick={() => fileInputRef.current?.click()} aria-label="Vložit obrázek">
            <ImagePlus className="size-3.5" />
          </Button>
        ) : null}
      </div>
      {cardId ? (
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFilePick} />
      ) : null}
      <EditorContent
        editor={editor}
        className="min-h-20 p-3 text-sm focus:outline-none [&_*:focus]:outline-none [&_p]:my-1 [&_ul]:ml-4 [&_ul]:list-disc [&_ol]:ml-4 [&_ol]:list-decimal [&_ul[data-type=taskList]]:ml-0 [&_ul[data-type=taskList]]:list-none [&_a]:text-projekty-accent [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_img]:max-w-full [&_img]:rounded [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:text-xs"
      />
    </div>
  );
}
