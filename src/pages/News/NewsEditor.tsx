import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Eye } from "lucide-react"

import { newsApi } from "@/api/news"
import { usersApi } from "@/api/users"
import { DatePicker } from "@/components/DatePicker"
import { ImageCropModal } from "@/components/ImageCropModal"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/context/useAuth"
import { useImageCropUpload } from "@/hooks/useImageCropUpload"
import type { AuthUser } from "@/types/auth"
import type { NewsItem } from "@/types/config"

import { NewsPreviewModal } from "./NewsPreviewModal"
import { newsSchema, type NewsFormValues } from "./schema"

export function NewsEditor({
  news,
  onPublish,
  onCancel,
}: {
  news: NewsItem | null
  onPublish: (values: NewsFormValues) => Promise<void>
  onCancel: () => void
}) {
  const { user } = useAuth()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [error, setError] = useState<string | null>(null)
  const [previewValues, setPreviewValues] = useState<NewsFormValues | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      date: news?.date ?? "",
      title: news?.title ?? "",
      excerpt: news?.excerpt ?? "",
      image: news?.image ?? null,
      body: news?.body ?? "",
      showImageOnFullContent: news?.showImageOnFullContent ?? true,
      authorId: news?.author?.id ?? user?.id ?? 0,
    },
  })

  const {
    imageSrc,
    selectFile,
    cancel: cancelCrop,
    confirm: confirmCrop,
    uploading,
    uploadError,
  } = useImageCropUpload(newsApi.uploadImage)

  function handleCropSave(blob: Blob) {
    confirmCrop(blob, (url) => form.setValue("image", url, { shouldDirty: true, shouldValidate: true }))
  }

  useEffect(() => {
    usersApi
      .list()
      .then(setUsers)
      .catch(() => setUsers([]))
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

  async function onSubmit(values: NewsFormValues) {
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
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
                <FormItem className="col-span-2">
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
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Obraz (opcjonalnie)</FormLabel>
                <div className="flex items-center gap-3">
                  <div
                    className="h-16 w-24 shrink-0 rounded-md border bg-muted bg-cover bg-center"
                    style={field.value ? { backgroundImage: `url(${field.value})` } : undefined}
                  />
                  <div className="grid gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploading}
                      className="text-sm file:mr-3 file:h-8 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-2.5 file:text-sm file:font-medium file:text-primary-foreground"
                    />
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
          <FormField
            control={form.control}
            name="showImageOnFullContent"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <Switch checked={field.value} onCheckedChange={field.onChange} />
                <FormLabel className="!mt-0">Pokaż obraz w pełnej treści</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Krótki opis (widoczny na liście)</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pełna treść (widoczna po kliknięciu)</FormLabel>
                <RichTextEditor initialContent={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="sticky bottom-0 flex items-center gap-3 bg-muted shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
          <Button type="submit" disabled={form.formState.isSubmitting || uploading}>
            {form.formState.isSubmitting ? "Publikowanie…" : "Publikuj"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
          <Button
            type="button"
            variant="outline"
            className="ml-auto"
            onClick={() => setPreviewValues(form.getValues())}
          >
            <Eye /> Podgląd
          </Button>
        </CardFooter>
      </form>
      <ImageCropModal
        imageSrc={imageSrc}
        onCancel={cancelCrop}
        onSave={handleCropSave}
        saving={uploading}
      />
      <NewsPreviewModal
        values={previewValues}
        authorName={
          users.find((u) => u.id === previewValues?.authorId)?.name ?? user?.name ?? null
        }
        onClose={() => setPreviewValues(null)}
      />
    </Form>
  )
}
