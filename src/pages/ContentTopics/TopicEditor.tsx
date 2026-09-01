import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type { TopicsApi } from "@/api/contentTopics"
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
import { useAuth } from "@/context/useAuth"
import type { AuthUser } from "@/types/auth"
import type { ContentTopic } from "@/types/config"

import {
  datetimeLocalToIso,
  isoToDatetimeLocal,
  topicSchema,
  type TopicFormValues,
} from "./schema"

export function TopicEditor({
  api,
  showScheduling,
  topic,
  onPublish,
  onCancel,
}: {
  api: TopicsApi
  showScheduling: boolean
  topic: ContentTopic | null
  onPublish: (values: TopicFormValues) => Promise<void>
  onCancel: () => void
}) {
  const { user } = useAuth()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [iconUploadError, setIconUploadError] = useState<string | null>(null)
  const iconInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      iconUrl: topic?.iconUrl ?? null,
      title: topic?.title ?? "",
      content: topic?.content ?? "",
      visibleFrom: topic?.visibleFrom ?? (showScheduling ? new Date().toISOString() : null),
      authorId: topic?.author?.id ?? user?.id ?? 0,
    },
  })

  useEffect(() => {
    usersApi
      .list()
      .then(setUsers)
      .catch(() => setUsers([]))
  }, [])

  async function handleIconChange(
    event: React.ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    setUploadingIcon(true)
    setIconUploadError(null)
    try {
      const { url } = await api.uploadImage(file)
      onChange(url)
    } catch {
      setIconUploadError("Nie udało się przesłać ikony.")
    } finally {
      setUploadingIcon(false)
      if (iconInputRef.current) {
        iconInputRef.current.value = ""
      }
    }
  }

  async function onSubmit(values: TopicFormValues) {
    setError(null)
    try {
      await onPublish(values)
    } catch {
      setError("Nie udało się opublikować zmian.")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
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
              name="iconUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ikona</FormLabel>
                  <div className="flex items-center gap-3">
                    <div
                      className="size-12 shrink-0 rounded-md border bg-muted bg-cover bg-center"
                      style={field.value ? { backgroundImage: `url(${field.value})` } : undefined}
                    />
                    <div className="grid gap-1">
                      <input
                        ref={iconInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleIconChange(e, field.onChange)}
                        disabled={uploadingIcon}
                        className="text-sm file:mr-3 file:h-8 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-2.5 file:text-sm file:font-medium file:text-primary-foreground"
                      />
                      {uploadingIcon && (
                        <span className="text-sm text-muted-foreground">Przesyłanie…</span>
                      )}
                      {iconUploadError && (
                        <span className="text-sm text-destructive">{iconUploadError}</span>
                      )}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {showScheduling && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="visibleFrom"
                render={({ field }) => {
                  const datetimeLocal = isoToDatetimeLocal(field.value)
                  const [datePart, timePart] = datetimeLocal
                    ? datetimeLocal.split("T")
                    : ["", ""]
                  return (
                    <FormItem>
                      <FormLabel>Widoczna od</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <DatePicker
                            value={datePart}
                            onChange={(newDate) =>
                              field.onChange(
                                datetimeLocalToIso(`${newDate}T${timePart || "00:00"}`)
                              )
                            }
                          />
                          <Input
                            type="time"
                            className="w-28"
                            value={timePart}
                            onChange={(e) =>
                              field.onChange(
                                datetimeLocalToIso(
                                  `${datePart || new Date().toISOString().slice(0, 10)}T${e.target.value}`
                                )
                              )
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
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
          )}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treść</FormLabel>
                <RichTextEditor initialContent={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter className="sticky bottom-0 flex items-center gap-3 bg-muted shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
          <Button type="submit" disabled={form.formState.isSubmitting}>
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
