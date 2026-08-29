import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { usersApi } from "@/api/users"
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
import type { AuthUser } from "@/types/auth"
import type { MassIntention } from "@/types/config"

import { intentionSchema, type IntentionFormValues } from "./schema"

export function IntentionEditor({
  intention,
  onPublish,
  onCancel,
}: {
  intention: MassIntention | null
  onPublish: (values: IntentionFormValues) => Promise<void>
  onCancel: () => void
}) {
  const { user } = useAuth()
  const [users, setUsers] = useState<AuthUser[]>([])
  const [error, setError] = useState<string | null>(null)

  const form = useForm<IntentionFormValues>({
    resolver: zodResolver(intentionSchema),
    defaultValues: {
      date: intention?.date ?? "",
      time: intention?.time ?? "",
      intention: intention?.intention ?? "",
      isHoliday: intention?.isHoliday ?? false,
      dayDescription: intention?.dayDescription ?? null,
      authorId: intention?.author?.id ?? user?.id ?? null,
    },
  })

  useEffect(() => {
    usersApi
      .list()
      .then(setUsers)
      .catch(() => setUsers([]))
  }, [])

  async function onSubmit(values: IntentionFormValues) {
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
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Godzina</FormLabel>
                  <FormControl>
                    <Input placeholder="7:00" {...field} />
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
                    value={String(field.value ?? "")}
                    onValueChange={(value) => field.onChange(value ? Number(value) : null)}
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
            name="intention"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treść intencji</FormLabel>
                <FormControl>
                  <Textarea placeholder="Za zmarłych z rodziny..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-3 rounded-lg border p-3">
            <FormField
              control={form.control}
              name="isHoliday"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                  <FormLabel className="!mt-0">Niedziela / święto</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dayDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opis dnia (np. nazwa uroczystości)</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="Uroczystość Wszystkich Świętych"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <p className="text-xs text-muted-foreground">
              To ustawienie zostanie zastosowane do wszystkich intencji tego samego dnia.
            </p>
          </div>
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
