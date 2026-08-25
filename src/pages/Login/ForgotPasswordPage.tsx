import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"
import { z } from "zod"

import { authApi } from "@/api/auth"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Wymagane").email("Nieprawidłowy adres e-mail"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: ForgotPasswordFormValues) {
    setSubmitError(null)
    try {
      const { message } = await authApi.forgotPassword(values.email)
      setSuccessMessage(message)
    } catch {
      setSubmitError("Nie udało się wysłać linku resetującego. Spróbuj ponownie później.")
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
          <CardTitle>Zapomniałem hasła</CardTitle>
        </CardHeader>
        {successMessage ? (
          <CardContent className="grid gap-4">
            <p className="text-sm text-muted-foreground">{successMessage}</p>
            <Link to="/login" className={buttonVariants({ variant: "link", className: "justify-start px-0" })}>
              Wróć do logowania
            </Link>
          </CardContent>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="grid gap-4">
                <p className="text-sm text-muted-foreground">
                  Podaj adres e-mail konta, a wyślemy link do zresetowania hasła.
                </p>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {submitError && <p className="text-sm text-destructive">{submitError}</p>}
              </CardContent>
              <CardFooter className="mt-8 flex flex-col items-stretch gap-2 border-t-0 bg-transparent">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Wysyłanie…" : "Wyślij link resetujący"}
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
