import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { informacjeApi } from "@/api/informacje"
import { usersApi } from "@/api/users"
import { DatePicker } from "@/components/DatePicker"
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
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<InfoItemFormValues>({
    resolver: zodResolver(infoItemSchema),
    defaultValues: {
      validFrom: infoItem?.validFrom ?? "",
      validTo: infoItem?.validTo ?? "",
      title: infoItem?.title ?? "",
      shortInfo: infoItem?.shortInfo ?? "",
      description: infoItem?.description ?? "",
      image: infoItem?.image ?? "",
      progressValue: infoItem?.progressValue ?? 0,
      progressDescription: infoItem?.progressDescription ?? "",
      information: infoItem?.information ?? null,
      authorId: infoItem?.author?.id ?? user?.id ?? 0,
    },
  })

  useEffect(() => {
    usersApi
      .list()
      .then(setUsers)
      .catch(() => setUsers([]))
  }, [])

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploading(true)
    setUploadError(null)
    try {
      const { url } = await informacjeApi.uploadImage(file)
      onChange(url)
    } catch {
      setUploadError("Nie udało się przesłać obrazu.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
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
                <FormLabel>Obrazek</FormLabel>
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
                      onChange={(e) => handleImageChange(e, field.onChange)}
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
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="progressValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postęp (0-100)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
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
                  <FormLabel>Opis postępu</FormLabel>
                  <FormControl>
                    <Input placeholder="Postęp prac renowacyjnych" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
    </Form>
  )
}
