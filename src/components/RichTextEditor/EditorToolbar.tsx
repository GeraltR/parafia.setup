import { useState } from "react"
import type { Editor } from "@tiptap/react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  Images,
  Italic,
  Link2,
  List,
  ListOrdered,
  Palette,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Underline as UnderlineIcon,
} from "lucide-react"
import { HexColorPicker } from "react-colorful"

import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useFonts } from "@/lib/fonts"

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "40px"]
const DEFAULT_FONT_LABEL = "Domyślna"
const DEFAULT_SIZE_LABEL = "Domyślny"

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      title={title}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function LinkPopover({ editor }: { editor: Editor }) {
  const [url, setUrl] = useState("")

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          setUrl(editor.getAttributes("link").href ?? "")
        }
      }}
    >
      <PopoverTrigger
        type="button"
        title="Link"
        className={buttonVariants({
          variant: editor.isActive("link") ? "secondary" : "ghost",
          size: "icon-sm",
        })}
      >
        <Link2 />
      </PopoverTrigger>
      <PopoverContent className="grid w-72 gap-2">
        <Input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          {editor.isActive("link") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().unsetLink().run()}
            >
              Usuń link
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            disabled={!url}
            onClick={() => editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()}
          >
            Wstaw
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ColorPopover({ editor }: { editor: Editor }) {
  const color = editor.getAttributes("textStyle").color ?? "#000000"

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        title="Kolor czcionki"
        className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
      >
        <Palette />
      </PopoverTrigger>
      <PopoverContent className="grid w-56 gap-3">
        <HexColorPicker
          color={color}
          onChange={(value) => editor.chain().focus().setColor(value).run()}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().unsetColor().run()}
        >
          Domyślny kolor
        </Button>
      </PopoverContent>
    </Popover>
  )
}

export function EditorToolbar({
  editor,
  onImageUpload,
  onOpenGallery,
}: {
  editor: Editor
  onImageUpload: (file: File) => void
  onOpenGallery: () => void
}) {
  const fonts = useFonts()

  function handleImageInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      onImageUpload(file)
    }
    event.target.value = ""
  }

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border-b bg-muted/40 p-1.5">
      <Select
        value={editor.getAttributes("textStyle").fontFamily ?? ""}
        onValueChange={(value) =>
          value
            ? editor.chain().focus().setFontFamily(value).run()
            : editor.chain().focus().unsetFontFamily().run()
        }
      >
        <SelectTrigger size="sm" className="w-36">
          <SelectValue>{(v: string) => (v === "" ? DEFAULT_FONT_LABEL : v)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{DEFAULT_FONT_LABEL}</SelectItem>
          {fonts.map((font) => (
            <SelectItem key={font.family} value={font.family} style={{ fontFamily: font.family }}>
              {font.family}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={editor.getAttributes("textStyle").fontSize ?? ""}
        onValueChange={(value) =>
          value
            ? editor.chain().focus().setFontSize(value).run()
            : editor.chain().focus().unsetFontSize().run()
        }
      >
        <SelectTrigger size="sm" className="w-24">
          <SelectValue>{(v: string) => (v === "" ? DEFAULT_SIZE_LABEL : v)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">{DEFAULT_SIZE_LABEL}</SelectItem>
          {FONT_SIZES.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        active={editor.isActive("bold")}
        title="Pogrubienie"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        title="Kursywa"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("underline")}
        title="Podkreślenie"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("strike")}
        title="Przekreślenie"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("subscript")}
        title="Indeks dolny"
        onClick={() => editor.chain().focus().toggleSubscript().run()}
      >
        <SubscriptIcon />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("superscript")}
        title="Indeks górny"
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
      >
        <SuperscriptIcon />
      </ToolbarButton>
      <ColorPopover editor={editor} />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        active={editor.isActive({ textAlign: "left" })}
        title="Wyrównaj do lewej"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <AlignLeft />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: "center" })}
        title="Wyśrodkuj"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <AlignCenter />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: "right" })}
        title="Wyrównaj do prawej"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <AlignRight />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton
        active={editor.isActive("orderedList")}
        title="Lista numerowana"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered />
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("bulletList")}
        title="Lista wypunktowana"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List />
      </ToolbarButton>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <LinkPopover editor={editor} />

      <label
        title="Wstaw obraz"
        className={buttonVariants({ variant: "ghost", size: "icon-sm", className: "cursor-pointer" })}
      >
        <ImagePlus />
        <input type="file" accept="image/*" className="hidden" onChange={handleImageInputChange} />
      </label>

      <ToolbarButton title="Wstaw obraz z galerii" onClick={onOpenGallery}>
        <Images />
      </ToolbarButton>

      <ToolbarButton
        title="Wstaw tabelę"
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        <TableIcon />
      </ToolbarButton>
    </div>
  )
}
