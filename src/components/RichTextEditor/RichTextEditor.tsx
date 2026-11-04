import { useEffect, useState } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
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
import { ImageCropModal } from "@/components/ImageCropModal"
import { MediaPickerModal } from "@/components/MediaPickerModal"
import { useImageCropUpload } from "@/hooks/useImageCropUpload"

import { ContentImage } from "./ContentImage"
import { EditorStatusBar } from "./EditorStatusBar"
import { EditorToolbar } from "./EditorToolbar"
import { editorUploads } from "./editorUploads"
import { PasteImages } from "./PasteImages"
import type { ExtractProgress } from "./pdfImport/extractPages"
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
  const [pendingUploads, setPendingUploads] = useState(0)
  const [failedImages, setFailedImages] = useState(0)
  const [pdfProgress, setPdfProgress] = useState<ExtractProgress | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Subscript,
      Superscript,
      TextStyleKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      ContentImage,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      PasteImages.configure({
        upload: contentImagesApi.uploadImage,
        onUploadStart: () => {
          editorUploads.begin()
          setPendingUploads((count) => count + 1)
        },
        onUploadSettled: (success) => {
          editorUploads.end()
          setPendingUploads((count) => count - 1)
          if (!success) setFailedImages((count) => count + 1)
        },
        onImagesLost: (count) => setFailedImages((failed) => failed + count),
      }),
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

  const [pickerOpen, setPickerOpen] = useState(false)
  const { imageSrc, selectFile, cancel: cancelCrop, confirm: confirmCrop, uploading } =
    useImageCropUpload(contentImagesApi.uploadImage)

  function handleCropSave(blob: Blob) {
    confirmCrop(blob, (url) => editor?.chain().focus().setImage({ src: url }).run())
  }

  async function handlePdfImport(file: File) {
    if (!editor || pdfProgress) return
    setPdfError(null)
    setPdfProgress({ page: 0, pageCount: 0, ocr: false })
    editorUploads.begin()
    try {
      // Loaded on demand: pdf.js and OCR are large and only needed here.
      const { importPdf } = await import("./pdfImport/importPdf")
      const html = await importPdf(file, setPdfProgress)
      editor.chain().focus().insertHtmlWithImages(html).run()
    } catch {
      setPdfError("Nie udało się zaimportować pliku PDF.")
    } finally {
      editorUploads.end()
      setPdfProgress(null)
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="rounded-lg border">
      {editable && (
        <EditorToolbar
          editor={editor}
          onImageUpload={selectFile}
          onOpenGallery={() => setPickerOpen(true)}
          onPdfImport={handlePdfImport}
          pdfImporting={pdfProgress !== null}
        />
      )}
      <EditorContent editor={editor} className="content-editor min-h-48 p-4 focus:outline-none" />
      <EditorStatusBar
        pdfProgress={pdfProgress}
        pendingUploads={pendingUploads}
        failedImages={failedImages}
        error={pdfError}
        onDismiss={() => {
          setFailedImages(0)
          setPdfError(null)
        }}
      />
      <ImageCropModal
        imageSrc={imageSrc}
        onCancel={cancelCrop}
        onSave={handleCropSave}
        saving={uploading}
      />
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => editor.chain().focus().setImage({ src: url }).run()}
      />
    </div>
  )
}
