import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"

import { useAuth } from "@/context/useAuth"
import { Button } from "@/components/ui/button"
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

const loginSchema = z.object({
  email: z.string().min(1, "Wymagane").email("Nieprawidłowy adres e-mail"),
  password: z.string().min(1, "Wymagane"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { status, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loginError, setLoginError] = useState<string | null>(null)
  const [showForgotPasswordHint, setShowForgotPasswordHint] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  if (status === "authenticated") {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/"
    return <Navigate to={redirectTo} replace />
  }

  async function onSubmit(values: LoginFormValues) {
    setLoginError(null)
    try {
      await login(values.email, values.password)
      navigate("/", { replace: true })
    } catch {
      setLoginError("Nieprawidłowy adres e-mail lub hasło.")
    }
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/30 p-6">
      <img
        src="/img/elzbieta_czysta.jpg"
        alt="Święta Elżbieta Węgierska"
        className="w-full max-w-sm rounded-xl shadow-md"
      />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Logowanie do panelu</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hasło</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {loginError && <p className="text-sm text-destructive">{loginError}</p>}
            </CardContent>
            <CardFooter className="mt-8 flex flex-col items-stretch gap-2 border-t-0 bg-transparent">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Logowanie…" : "Zaloguj"}
              </Button>
              <Button
                type="button"
                variant="link"
                className="justify-center"
                onClick={() => setShowForgotPasswordHint(true)}
              >
                Zapomniałem hasła
              </Button>
              {showForgotPasswordHint && (
                <p className="text-center text-sm text-muted-foreground">
                  Skontaktuj się z administratorem, aby zresetować hasło.
                </p>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
