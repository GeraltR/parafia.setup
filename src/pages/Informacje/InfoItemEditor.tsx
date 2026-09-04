import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Images, X } from "lucide-react"

import { informacjeApi } from "@/api/informacje"
import { fontsApi, type FontFamily } from "@/api/fonts"
import { usersApi } from "@/api/users"
import { ColorField } from "@/components/ColorField"
import { DatePicker } from "@/components/DatePicker"
import { ImageCropModal } from "@/components/ImageCropModal"
import { MediaPickerModal } from "@/components/MediaPickerModal"
import { NullableFontSelect } from "@/components/NullableFontSelect"
import { RichTextEditor } from "@/components/RichTextEditor/RichTextEditor"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/useAuth"
import { useImageCropUpload } from "@/hooks/useImageCropUpload"
import type { AuthUser } from "@/types/auth"
import type { InfoItem } from "@/types/config"

import { infoItemSchema, type InfoItemFormValues } from "./schema"

export function InfoItemEditor({
  infoItem,
  onPublish,
  onCancel,
}: {
  infoItem: InfoItem | null
  onPublish: (values: InfoItemFormValues) => Promise<void>
  onCancel: () => void
}) {
  const { user } = useAuth()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [fonts, setFonts] = useState<FontFamily[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<InfoItemFormValues>({
    resolver: zodResolver(infoItemSchema),
    defaultValues: {
      validFrom: infoItem?.validFrom ?? "",
      validTo: infoItem?.validTo ?? "",
      title: infoItem?.title ?? "",
      shortInfo: infoItem?.shortInfo ?? "",
      description: infoItem?.description ?? "",
      image: infoItem?.image ?? null,
      progressValue: infoItem?.progressValue ?? null,
      progressDescription: infoItem?.progressDescription ?? null,
      information: infoItem?.information ?? null,
      bannerText: infoItem?.bannerText ?? null,
      bannerFont: infoItem?.bannerFont ?? null,
      bannerTextColor: infoItem?.bannerTextColor ?? null,
      bannerBgColor: infoItem?.bannerBgColor ?? null,
      bannerDurationSeconds: infoItem?.bannerDurationSeconds ?? 0,
      authorId: infoItem?.author?.id ?? user?.id ?? 0,
    },
  })

  const {
    imageSrc,
    selectFile,
    cancel: cancelCrop,
    confirm: confirmCrop,
    uploading,
    uploadError,
  } = useImageCropUpload(informacjeApi.uploadImage)

  function handleCropSave(blob: Blob) {
    confirmCrop(blob, (url) => form.setValue("image", url, { shouldDirty: true, shouldValidate: true }))
  }

  useEffect(() => {
    usersApi
      .list()
      .then(setUsers)
      .catch(() => setUsers([]))
    fontsApi
      .list()
      .then(setFonts)
      .catch(() => setFonts([]))
  }, [])

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      selectFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function onSubmit(values: InfoItemFormValues) {
    setError(null)
    try {
      await onPublish(values)
    } catch {
      setError("Nie udało się zapisać zmian.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="validFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Widoczna od</FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="validTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Widoczna do</FormLabel>
                  <FormControl>
                    <DatePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) => users.find((u) => String(u.id) === value)?.name ?? ""}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tytuł</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shortInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Skrócona informacja</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opis</FormLabel>
                <RichTextEditor initialContent={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Obrazek (opcjonalnie)</FormLabel>
                <div className="flex items-center gap-3">
                  <div
                    className="h-16 w-24 shrink-0 rounded-md border bg-muted bg-cover bg-center"
                    style={field.value ? { backgroundImage: `url(${field.value})` } : undefined}
                  />
                  <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={uploading}
                        className="text-sm file:mr-3 file:h-8 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-2.5 file:text-sm file:font-medium file:text-primary-foreground"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPickerOpen(true)}
                      >
                        <Images /> Galeria
                      </Button>
                      {field.value && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => field.onChange(null)}
                        >
                          <X /> Usuń
                        </Button>
                      )}
                    </div>
                    {uploading && (
                      <span className="text-sm text-muted-foreground">Przesyłanie…</span>
                    )}
                    {uploadError && <span className="text-sm text-destructive">{uploadError}</span>}
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="progressValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postęp (0-100, opcjonalnie)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? null : e.target.valueAsNumber)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="progressDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis postępu (opcjonalnie)</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="Postęp prac renowacyjnych"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Pasek postępu pokaże się na stronie tylko, gdy wypełnione są oba pola: wartość i opis
            postępu.
          </p>
          <FormField
            control={form.control}
            name="information"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Informacja (opcjonalnie)</FormLabel>
                <RichTextEditor initialContent={field.value ?? ""} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-3 rounded-lg border p-3">
            <p className="text-sm font-medium">Baner (opcjonalnie)</p>
            <FormField
              control={form.control}
              name="bannerText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tekst baneru</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="Ważny komunikat parafialny"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bannerFont"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Czcionka</FormLabel>
                    <NullableFontSelect value={field.value} onChange={field.onChange} fonts={fonts} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ColorField
                control={form.control}
                name="bannerTextColor"
                label="Kolor tekstu"
                fallback="#ffffff"
              />
              <ColorField
                control={form.control}
                name="bannerBgColor"
                label="Kolor tła"
                fallback="#0d1e35"
              />
            </div>
            <FormField
              control={form.control}
              name="bannerDurationSeconds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Czas animacji (sekundy)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={300}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-muted-foreground">
              Przy wartości 0 tekst baneru stoi wyśrodkowany bez animacji. Przy wartości większej
              niż 0 tekst przewija się od prawej do lewej w podanym czasie (w sekundach).
            </p>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="sticky bottom-0 flex items-center gap-3 bg-muted shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
          <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
            {form.formState.isSubmitting ? "Publikowanie…" : "Publikuj"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
        </CardFooter>
      </form>
      <ImageCropModal
        imageSrc={imageSrc}
        onCancel={cancelCrop}
        onSave={handleCropSave}
        saving={uploading}
      />
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => form.setValue("image", url, { shouldDirty: true, shouldValidate: true })}
      />
    </Form>
  )
}
