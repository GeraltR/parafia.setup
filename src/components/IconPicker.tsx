import { useRef, useState } from "react"
import { Images } from "lucide-react"

import { Icon, ICON_KEYS, type IconKey } from "@/components/Icon/icons"
import { ImageCropModal } from "@/components/ImageCropModal"
import { MediaPickerModal } from "@/components/MediaPickerModal"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useImageCropUpload } from "@/hooks/useImageCropUpload"

export function IconPicker({
  icon,
  iconUrl,
  defaultIcon,
  onChange,
  onUpload,
}: {
  icon: string | null
  iconUrl: string | null
  defaultIcon: IconKey
  onChange: (icon: string | null, iconUrl: string | null) => void
  onUpload: (file: File) => Promise<string>
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const activeKey = (icon as IconKey | null) ?? defaultIcon
  const { imageSrc, selectFile, cancel: cancelCrop, confirm: confirmCrop, uploading } =
    useImageCropUpload((file) => onUpload(file).then((url) => ({ url })))

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      selectFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted"
      >
        {iconUrl ? (
          <img src={iconUrl} alt="" className="size-8 object-contain" />
        ) : (
          <Icon icon={activeKey} className="size-7 text-muted-foreground" />
        )}
      </PopoverTrigger>
      <PopoverContent className="grid w-64 gap-3">
        <div className="grid grid-cols-6 gap-1.5">
          {ICON_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key, null)}
              className={`flex size-8 items-center justify-center rounded-md border hover:bg-muted ${
                !iconUrl && activeKey === key ? "border-primary bg-muted" : "border-input"
              }`}
            >
              <Icon icon={key} className="size-5" />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t pt-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="text-xs file:mr-2 file:h-7 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-2 file:text-xs file:font-medium file:text-primary-foreground"
          />
          {uploading && <span className="text-xs text-muted-foreground">Przesyłanie…</span>}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
          <Images /> Galeria
        </Button>
        {(icon !== null || iconUrl !== null) && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null, null)}>
            Domyślna
          </Button>
        )}
      </PopoverContent>
      <ImageCropModal
        imageSrc={imageSrc}
        onCancel={cancelCrop}
        onSave={(blob) => confirmCrop(blob, (url) => onChange(null, url))}
        saving={uploading}
      />
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => onChange(null, url)}
      />
    </Popover>
  )
}
