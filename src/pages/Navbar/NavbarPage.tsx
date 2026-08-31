import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"

import { navbarApi, type NavbarUpdatePayload } from "@/api/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form } from "@/components/ui/form"
import { useAuth } from "@/context/useAuth"
import { cn } from "@/lib/utils"
import type { Navbar } from "@/types/config"

import { NavItemRow } from "./NavItemRow"
import { navbarSchema, type NavbarFormValues } from "./schema"

function toFormValues(navbar: Navbar): NavbarFormValues {
  return {
    items: navbar.items.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      isLocked: item.isLocked,
      children: (item.children ?? []).map((child) => ({
        id: child.id,
        label: child.label,
        href: child.href,
      })),
    })),
  }
}

function toPayload(values: NavbarFormValues): NavbarUpdatePayload {
  return {
    items: values.items.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      children: item.children.map((child) => ({
        id: child.id,
        label: child.label,
        href: child.href,
      })),
    })),
  }
}

export function NavbarPage() {
  const { user } = useAuth()
  const canWrite = user?.canWrite.site ?? false
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [saveError, setSaveError] = useState<string | null>(null)

  const form = useForm<NavbarFormValues>({
    resolver: zodResolver(navbarSchema),
    defaultValues: { items: [] },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "items",
  })

  useEffect(() => {
    navbarApi
      .get()
      .then((navbar) => {
        form.reset(toFormValues(navbar))
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: NavbarFormValues) {
    setSaveError(null)
    try {
      const saved = await navbarApi.update(toPayload(values))
      form.reset(toFormValues(saved))
    } catch {
      setSaveError("Nie udało się zapisać zmian.")
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać nawigacji.</p>
  }

  return (
    <Card className="max-w-3xl overflow-visible">
      <CardHeader>
        <CardTitle>Nawigacja</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className={cn("grid gap-4", !canWrite && "opacity-60")}>
          <fieldset disabled={!canWrite} className={cn("contents", !canWrite && "pointer-events-none")}>
            {fields.map((field, index) => (
              <NavItemRow
                key={field.id}
                control={form.control}
                index={index}
                total={fields.length}
                isLocked={field.isLocked ?? false}
                onRemove={() => remove(index)}
                onMove={(position) => move(index, position)}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-self-start"
              onClick={() => append({ label: "", href: "", children: [] })}
            >
              <Plus /> Dodaj pozycję
            </Button>
          </fieldset>
          </CardContent>
          <CardFooter className="sticky bottom-0 flex items-center gap-3 bg-muted shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
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
