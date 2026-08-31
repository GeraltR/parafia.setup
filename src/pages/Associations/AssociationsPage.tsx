import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { useFieldArray, useForm } from "react-hook-form"

import { associationsApi } from "@/api/associations"
import { NullableFontSelect } from "@/components/NullableFontSelect"
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
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/useAuth"
import { useFonts } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import type { AssociationsData } from "@/types/config"

import { AssociationRow } from "./AssociationRow"
import { associationsSchema, type AssociationsFormValues } from "./schema"

function toFormValues(data: AssociationsData): AssociationsFormValues {
  return {
    config: data.config,
    items: data.items.map((item) => ({
      id: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      link: item.link,
    })),
  }
}

export function AssociationsPage() {
  const { user } = useAuth()
  const canWrite = user?.canWrite.content ?? false
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [saveError, setSaveError] = useState<string | null>(null)
  const fonts = useFonts()

  const form = useForm<AssociationsFormValues>({
    resolver: zodResolver(associationsSchema),
    defaultValues: {
      config: { nameFont: null, nameSize: null },
      items: [],
    },
  })

  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: "items" })

  useEffect(() => {
    associationsApi
      .get()
      .then((data) => {
        form.reset(toFormValues(data))
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: AssociationsFormValues) {
    setSaveError(null)
    try {
      const saved = await associationsApi.update(values)
      form.reset(toFormValues(saved))
    } catch {
      setSaveError("Nie udało się zapisać zmian.")
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać danych.</p>
  }

  return (
    <Card className="max-w-4xl overflow-visible">
      <CardHeader>
        <CardTitle>Stowarzyszenia</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className={cn("grid gap-6", !canWrite && "opacity-60")}>
          <fieldset disabled={!canWrite} className={cn("contents", !canWrite && "pointer-events-none")}>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="config.nameFont"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Czcionka nazwy</FormLabel>
                    <NullableFontSelect value={field.value} onChange={field.onChange} fonts={fonts} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="config.nameSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wielkość nazwy</FormLabel>
                    <FormControl>
                      <Input
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        placeholder="0.9rem"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid gap-4">
              {fields.map((field, index) => (
                <AssociationRow
                  key={field.id}
                  control={form.control}
                  index={index}
                  total={fields.length}
                  onRemove={() => remove(index)}
                  onMove={(position) => move(index, position)}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="justify-self-start"
                onClick={() => append({ name: "", imageUrl: null, link: "" })}
              >
                <Plus /> Dodaj stowarzyszenie
              </Button>
            </div>
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
