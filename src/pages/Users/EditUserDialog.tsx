import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { usersApi } from "@/api/users"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { PERMISSION_LEVEL_OPTIONS } from "@/lib/permissionLevels"
import type { AuthUser } from "@/types/auth"

import { editUserSchema, type EditUserFormValues } from "./schema"

export function EditUserDialog({
  user,
  onOpenChange,
  onSuccess,
}: {
  user: AuthUser
  onOpenChange: (open: boolean) => void
  onSuccess: (user: AuthUser) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email ?? "",
      permissionLevel: user.permissionLevel,
    },
  })

  async function onSubmit(values: EditUserFormValues) {
    setError(null)
    try {
      const updated = await usersApi.update(user.id, values)
      onSuccess(updated)
    } catch {
      setError("Nie udało się zapisać zmian.")
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edytuj użytkownika</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
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
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="permissionLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uprawnienia</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(v: string) =>
                          PERMISSION_LEVEL_OPTIONS.find((option) => String(option.value) === v)
                            ?.label
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PERMISSION_LEVEL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Zapisywanie…" : "Zapisz zmiany"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
