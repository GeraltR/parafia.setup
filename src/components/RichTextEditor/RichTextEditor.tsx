import { useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import StarterKit from "@tiptap/starter-kit"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import { Table } from "@tiptap/extension-table"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableRow } from "@tiptap/extension-table-row"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyleKit } from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"

import { contentImagesApi } from "@/api/contentImages"

import { EditorToolbar } from "./EditorToolbar"
import "./content.css"

export function RichTextEditor({
  initialContent,
  onChange,
  editable = true,
}: {
  initialContent: string
  onChange: (html: string) => void
  editable?: boolean
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Subscript,
      Superscript,
      TextStyleKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialContent,
    editable,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  useEffect(() => {
    if (editor && editor.isEditable !== editable) {
      editor.setEditable(editable)
    }
  }, [editable, editor])

  async function handleImageUpload(file: File) {
    try {
      const { url } = await contentImagesApi.uploadImage(file)
      editor?.chain().focus().setImage({ src: url }).run()
    } catch {
      // Upload failures are surfaced by leaving the image out; the user can retry.
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="rounded-lg border">
      {editable && <EditorToolbar editor={editor} onImageUpload={handleImageUpload} />}
      <EditorContent editor={editor} className="content-editor min-h-48 p-4 focus:outline-none" />
    </div>
  )
}
