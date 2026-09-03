import { useRef } from "react"
import { Trash2 } from "lucide-react"
import { useController, type Control } from "react-hook-form"

import { associationsApi } from "@/api/associations"
import { ImageCropModal } from "@/components/ImageCropModal"
import { OrderSelect } from "@/components/OrderSelect"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useImageCropUpload } from "@/hooks/useImageCropUpload"

import type { AssociationsFormValues } from "./schema"

export function AssociationRow({
  control,
  index,
  total,
  onRemove,
  onMove,
}: {
  control: Control<AssociationsFormValues>
  index: number
  total: number
  onRemove: () => void
  onMove: (position: number) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { field: imageField } = useController({ control, name: `items.${index}.imageUrl` })
  const { imageSrc, selectFile, cancel: cancelCrop, confirm: confirmCrop, uploading, uploadError } =
    useImageCropUpload(associationsApi.uploadImage)

  return (
    <div className={`grid gap-4 rounded-lg border p-4 ${index % 2 === 1 ? "bg-muted/40" : ""}`}>
      <div className="flex items-start gap-4">
        <div className="grid gap-2">
          <Label>Obrazek</Label>
          <div
            className="size-14 shrink-0 rounded-full border bg-muted bg-cover bg-center"
            style={imageField.value ? { backgroundImage: `url(${imageField.value})` } : undefined}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) selectFile(file)
              if (fileInputRef.current) fileInputRef.current.value = ""
            }}
            className="text-xs file:mr-2 file:h-7 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-2 file:text-xs file:font-medium file:text-primary-foreground"
          />
          {uploading && <span className="text-xs text-muted-foreground">Przesyłanie…</span>}
          {uploadError && <span className="text-xs text-destructive">{uploadError}</span>}
          <ImageCropModal
            imageSrc={imageSrc}
            onCancel={cancelCrop}
            onSave={(blob) => confirmCrop(blob, imageField.onChange)}
            saving={uploading}
          />
        </div>

        <div className="grid flex-1 grid-cols-2 gap-4">
          <FormField
            control={control}
            name={`items.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`items.${index}.link`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link do strony</FormLabel>
                <FormControl>
                  <Input placeholder="https://…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-2">
          <Label>Kolejność</Label>
          <OrderSelect value={index + 1} max={total} onChange={(position) => onMove(position - 1)} />
        </div>

        <Button type="button" variant="destructive" size="icon" onClick={onRemove}>
          <Trash2 />
        </Button>
      </div>
    </div>
  )
}
