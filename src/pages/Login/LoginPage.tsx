import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"

import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from "@/context/useAuth"
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
  const [showPassword, setShowPassword] = useState(false)

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
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className="pr-9"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
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
              <Link
                to="/forgot-password"
                className={buttonVariants({ variant: "link", className: "justify-center" })}
              >
                Zapomniałem hasła
              </Link>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
