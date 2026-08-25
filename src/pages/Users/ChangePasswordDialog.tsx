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
import { PASSWORD_REQUIREMENTS_HINT } from "@/lib/passwordValidation"
import type { AuthUser } from "@/types/auth"

import { changePasswordSchema, type ChangePasswordFormValues } from "./schema"

export function ChangePasswordDialog({
  user,
  onOpenChange,
  onSuccess,
}: {
  user: AuthUser
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPassword: "", newPasswordConfirmation: "" },
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    setError(null)
    try {
      await usersApi.updatePassword(user.id, values)
      onSuccess()
    } catch {
      setError("Nie udało się zmienić hasła.")
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Zmiana hasła — {user.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nowe hasło</FormLabel>
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
              name="newPasswordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Potwierdź nowe hasło</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Zapisywanie…" : "Zmień hasło"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
