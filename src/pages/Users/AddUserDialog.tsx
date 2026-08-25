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
  FormDescription,
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
import { PASSWORD_REQUIREMENTS_HINT } from "@/lib/passwordValidation"
import { PERMISSION_LEVEL_OPTIONS } from "@/lib/permissionLevels"
import type { AuthUser } from "@/types/auth"

import { createUserSchema, type CreateUserFormValues } from "./schema"

export function AddUserDialog({
  onOpenChange,
  onSuccess,
}: {
  onOpenChange: (open: boolean) => void
  onSuccess: (user: AuthUser) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
      permissionLevel: 0,
    },
  })

  async function onSubmit(values: CreateUserFormValues) {
    setError(null)
    try {
      const user = await usersApi.create(values)
      onSuccess(user)
    } catch {
      setError("Nie udało się dodać użytkownika.")
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj nowego użytkownika</DialogTitle>
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hasło</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormDescription>{PASSWORD_REQUIREMENTS_HINT}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potwierdź hasło</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
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
                {form.formState.isSubmitting ? "Dodawanie…" : "Dodaj użytkownika"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
