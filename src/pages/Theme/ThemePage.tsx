import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { themeApi } from "@/api/theme"
import { ColorField } from "@/components/ColorField"
import { FontSelect } from "@/components/FontSelect"
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
import { useAuth } from "@/context/useAuth"
import { useFonts } from "@/lib/fonts"

const themeSchema = z.object({
  id: z.number(),
  primaryColor: z.string().min(1, "Wymagane"),
  secondaryColor: z.string().min(1, "Wymagane"),
  fontHeading: z.string().min(1, "Wymagane"),
  fontBody: z.string().min(1, "Wymagane"),
  title: z.string().min(1, "Wymagane"),
  subtitle: z.string().min(1, "Wymagane"),
})

type ThemeFormValues = z.infer<typeof themeSchema>

export function ThemePage() {
  const { user } = useAuth()
  const canWrite = user?.canWrite ?? false
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [saveError, setSaveError] = useState<string | null>(null)
  const fonts = useFonts()

  const form = useForm<ThemeFormValues>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      id: 0,
      primaryColor: "",
      secondaryColor: "",
      fontHeading: "",
      fontBody: "",
      title: "",
      subtitle: "",
    },
  })

  useEffect(() => {
    themeApi
      .get()
      .then((theme) => {
        form.reset(theme)
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: ThemeFormValues) {
    setSaveError(null)
    try {
      await themeApi.update(values)
    } catch {
      setSaveError("Nie udało się zapisać zmian.")
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać danych motywu.</p>
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Motyw strony</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="grid gap-4">
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
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Podtytuł</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <ColorField
                control={form.control}
                name="primaryColor"
                label="Kolor podstawowy"
                fallback="#1a365d"
                allowClear={false}
              />
              <ColorField
                control={form.control}
                name="secondaryColor"
                label="Kolor dodatkowy"
                fallback="#c9a84c"
                allowClear={false}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fontHeading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font nagłówków</FormLabel>
                    <FontSelect value={field.value} onChange={field.onChange} fonts={fonts} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fontBody"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font treści</FormLabel>
                    <FontSelect value={field.value} onChange={field.onChange} fonts={fonts} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex items-center gap-3">
            <Button type="submit" disabled={!canWrite || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Zapisywanie…" : "Zapisz"}
            </Button>
            {!canWrite && (
              <span className="text-sm text-muted-foreground">
                Brak uprawnień do zapisywania zmian.
              </span>
            )}
            {saveError && <span className="text-sm text-destructive">{saveError}</span>}
            {form.formState.isSubmitSuccessful && !saveError && (
              <span className="text-sm text-muted-foreground">Zapisano.</span>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
