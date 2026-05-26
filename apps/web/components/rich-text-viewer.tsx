"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { cn } from "@identis/ui";
import { CopyBlockExtension } from "./copy-block-node";

type Props = {
  content: string;
  className?: string;
};

export function RichTextViewer({ content, className }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        link: {
          openOnClick: true,
          HTMLAttributes: {
            class: "text-primary underline cursor-pointer",
            target: "_blank",
            rel: "noopener noreferrer",
          },
        },
      }),
      CopyBlockExtension,
    ],
    content,
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, content]);

  if (!editor) return null;

  return (
    <div className={cn("rt-content text-sm", className)}>
      <EditorContent editor={editor} />
    </div>
  );
}
