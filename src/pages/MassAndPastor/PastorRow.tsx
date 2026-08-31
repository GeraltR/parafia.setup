import { useRef, useState } from "react"
import { Trash2 } from "lucide-react"
import type { Control } from "react-hook-form"

import { massAndPastorApi } from "@/api/massAndPastor"
import { RichTextEditor } from "@/components/RichTextEditor/RichTextEditor"
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
import { Switch } from "@/components/ui/switch"

import type { MassAndPastorFormValues } from "./schema"

export function PastorRow({
  control,
  index,
  onRemove,
  canWrite,
}: {
  control: Control<MassAndPastorFormValues>
  index: number
  onRemove: () => void
  canWrite: boolean
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className={`grid gap-4 rounded-lg border p-4 ${index % 2 === 1 ? "bg-muted/40" : ""}`}>
      <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-4">
        <FormField
          control={control}
          name={`pastors.${index}.position`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stanowisko</FormLabel>
              <FormControl>
                <Input placeholder="Proboszcz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`pastors.${index}.fullName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imię i nazwisko</FormLabel>
              <FormControl>
                <Input placeholder="ks. Jan Kowalski" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`pastors.${index}.isActive`}
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0 pb-2">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              <FormLabel className="!mt-0">Aktywny</FormLabel>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={`pastors.${index}.photoUrl`}
        render={({ field }) => (
          <div className="grid gap-2">
            <Label>Zdjęcie</Label>
            <div className="flex items-center gap-3">
              <div
                className="size-14 shrink-0 rounded-full border bg-muted bg-cover bg-center"
                style={field.value ? { backgroundImage: `url(${field.value})` } : undefined}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploading(true)
                  setUploadError(null)
                  try {
                    const { url } = await massAndPastorApi.uploadPhoto(file)
                    field.onChange(url)
                  } catch {
                    setUploadError("Nie udało się przesłać zdjęcia.")
                  } finally {
                    setUploading(false)
                    if (fileInputRef.current) fileInputRef.current.value = ""
                  }
                }}
                className="text-sm file:mr-3 file:h-8 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-2.5 file:text-sm file:font-medium file:text-primary-foreground"
              />
              {uploading && <span className="text-sm text-muted-foreground">Przesyłanie…</span>}
            </div>
            {uploadError && <span className="text-sm text-destructive">{uploadError}</span>}
          </div>
        )}
      />

      <FormField
        control={control}
        name={`pastors.${index}.duties`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Zadania w parafii</FormLabel>
            <RichTextEditor initialContent={field.value} onChange={field.onChange} editable={canWrite} />
            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="justify-self-start"
        onClick={onRemove}
      >
        <Trash2 /> Usuń duszpasterza
      </Button>
    </div>
  )
}
