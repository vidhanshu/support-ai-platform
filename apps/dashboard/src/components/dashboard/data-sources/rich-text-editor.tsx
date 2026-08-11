"use client";

import { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  ChevronDown,
  Italic,
  Link2,
  List,
  ListOrdered,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Separator } from "@repo/ui/components/separator";
import { cn } from "@repo/ui/lib/utils";
import { formatBytes } from "@/lib/knowledge/constants";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  maxBytes: number;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

type BlockStyle = "paragraph" | 1 | 2 | 3;

/** TipTap empty docs are still `<p></p>` (7 bytes) — treat those as empty. */
function isEmptyHtml(html: string) {
  return (
    html
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim().length === 0
  );
}

function htmlByteLength(html: string) {
  if (!html || isEmptyHtml(html)) return 0;
  return new TextEncoder().encode(html).length;
}

const BLOCK_STYLES: {
  value: BlockStyle;
  label: string;
  icon: string;
  labelClassName: string;
}[] = [
  {
    value: "paragraph",
    label: "Normal text",
    icon: "T",
    labelClassName: "text-sm font-normal",
  },
  {
    value: 1,
    label: "Heading 1",
    icon: "H₁",
    labelClassName: "text-lg font-bold",
  },
  {
    value: 2,
    label: "Heading 2",
    icon: "H₂",
    labelClassName: "text-base font-semibold",
  },
  {
    value: 3,
    label: "Heading 3",
    icon: "H₃",
    labelClassName: "text-sm font-semibold",
  },
];

function getActiveBlockStyle(editor: Editor | null): BlockStyle {
  if (!editor) return "paragraph";
  if (editor.isActive("heading", { level: 1 })) return 1;
  if (editor.isActive("heading", { level: 2 })) return 2;
  if (editor.isActive("heading", { level: 3 })) return 3;
  return "paragraph";
}

function applyBlockStyle(editor: Editor, style: BlockStyle) {
  const chain = editor.chain().focus();
  if (style === "paragraph") {
    chain.setParagraph().run();
    return;
  }
  chain.setHeading({ level: style }).run();
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(active && "bg-muted text-foreground")}
    >
      {children}
    </Button>
  );
}

function BlockStyleDropdown({
  editor,
  disabled,
}: {
  editor: Editor | null;
  disabled?: boolean;
}) {
  const active = getActiveBlockStyle(editor);
  const current = BLOCK_STYLES.find((style) => style.value === active)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled || !editor}
        render={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2 font-medium"
            disabled={disabled || !editor}
          />
        }
      >
        <span className="text-xs tabular-nums">{current.icon}</span>
        <ChevronDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[11rem]">
        {BLOCK_STYLES.map((style) => {
          const isActive = style.value === active;
          return (
            <DropdownMenuItem
              key={style.label}
              onClick={() => {
                if (!editor) return;
                applyBlockStyle(editor, style.value);
              }}
              className={cn(isActive && "bg-muted")}
            >
              <span className="flex size-5 shrink-0 items-center justify-center text-[11px] font-medium text-muted-foreground">
                {style.value === "paragraph" ? (
                  <Type className="size-3.5" />
                ) : (
                  style.icon
                )}
              </span>
              <span className={style.labelClassName}>{style.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RichTextEditor({
  value,
  onChange,
  maxBytes,
  placeholder = "Enter your text",
  className,
  disabled,
}: RichTextEditorProps) {
  const [, setToolbarTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-48 px-3 py-2 text-sm leading-relaxed focus:outline-none [&_h1]:mb-2 [&_h1]:mt-3 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-primary [&_a]:underline",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
      setToolbarTick((tick) => tick + 1);
    },
    onSelectionUpdate: () => {
      setToolbarTick((tick) => tick + 1);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && !(value === "" && current === "<p></p>")) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  const byteLength = htmlByteLength(value || "");
  const overLimit = byteLength > maxBytes;

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const next = window.prompt("Link URL", previous ?? "https://");
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmed })
      .run();
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-background",
        overLimit && "border-destructive",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-1.5 py-1">
        <BlockStyleDropdown editor={editor} disabled={disabled} />
        <Separator orientation="vertical" className="mx-1 h-5" />
        <ToolbarButton
          label="Bold"
          disabled={disabled || !editor}
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          disabled={disabled || !editor}
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          disabled={disabled || !editor}
          active={editor?.isActive("underline")}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          disabled={disabled || !editor}
          active={editor?.isActive("strike")}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          disabled={disabled || !editor}
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          disabled={disabled || !editor}
          active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Link"
          disabled={disabled || !editor}
          active={editor?.isActive("link")}
          onClick={setLink}
        >
          <Link2 className="size-4" />
        </ToolbarButton>
        <span
          className={cn(
            "ml-auto pr-2 text-[11px] tabular-nums text-muted-foreground",
            overLimit && "text-destructive",
          )}
        >
          {formatBytes(byteLength)} / {formatBytes(maxBytes)}
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
