import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useSearchParams } from "react-router-dom"
import { z } from "zod"

import { authApi } from "@/api/auth"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { PASSWORD_REQUIREMENTS_HINT, passwordComplexitySchema } from "@/lib/passwordValidation"

const resetPasswordSchema = z
  .object({
    password: passwordComplexitySchema,
    passwordConfirmation: z.string().min(1, "Wymagane"),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Hasła muszą być identyczne",
    path: ["passwordConfirmation"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", passwordConfirmation: "" },
  })

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token || !email) {
      return
    }

    setSubmitError(null)
    try {
      const { message } = await authApi.resetPassword({ token, email, ...values })
      setSuccessMessage(message)
    } catch {
      setSubmitError("Link do resetu hasła jest nieprawidłowy lub wygasł.")
    }
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <img
        src="/img/elzbieta_czysta.jpg"
        alt="Święta Elżbieta Węgierska"
        className="w-full max-w-sm rounded-xl shadow-md"
      />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Ustaw nowe hasło</CardTitle>
        </CardHeader>
        {!token || !email ? (
          <CardContent className="grid gap-4">
            <p className="text-sm text-destructive">Nieprawidłowy link do resetu hasła.</p>
            <Link to="/forgot-password" className={buttonVariants({ variant: "link", className: "justify-start px-0" })}>
              Wyślij link ponownie
            </Link>
          </CardContent>
        ) : successMessage ? (
          <CardContent className="grid gap-4">
            <p className="text-sm text-muted-foreground">{successMessage}</p>
            <Link to="/login" className={buttonVariants({ variant: "link", className: "justify-start px-0" })}>
              Przejdź do logowania
            </Link>
          </CardContent>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="password"
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
                  name="passwordConfirmation"
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
                {submitError && <p className="text-sm text-destructive">{submitError}</p>}
              </CardContent>
              <CardFooter className="mt-8 flex flex-col items-stretch gap-2 border-t-0 bg-transparent">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Zapisywanie…" : "Ustaw nowe hasło"}
                </Button>
                <Link to="/login" className={buttonVariants({ variant: "link", className: "justify-center" })}>
                  Wróć do logowania
                </Link>
              </CardFooter>
            </form>
          </Form>
        )}
      </Card>
    </div>
  )
}
