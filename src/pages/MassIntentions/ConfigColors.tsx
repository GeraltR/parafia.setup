import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { ColorField } from "@/components/ColorField"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import type { MassIntentionsConfig } from "@/types/config"

import { configSchema, type ConfigFormValues } from "./schema"

export function ConfigColors({
  config,
  canWrite,
  onSave,
}: {
  config: MassIntentionsConfig
  canWrite: boolean
  onSave: (values: ConfigFormValues) => Promise<void>
}) {
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: config,
  })

  async function onSubmit(values: ConfigFormValues) {
    await onSave(values)
    form.reset(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 rounded-lg border p-4">
        <p className="text-sm font-medium">Kolory dni</p>
        <div className="grid grid-cols-3 gap-4">
          <ColorField
            control={form.control}
            name="holidayDescribedColor"
            label="Niedziela/święto z opisem"
            fallback="#7bdcb5"
            allowClear={false}
          />
          <ColorField
            control={form.control}
            name="holidayPlainColor"
            label="Niedziela/święto bez opisu"
            fallback="#f78da7"
            allowClear={false}
          />
          <ColorField
            control={form.control}
            name="weekdayColor"
            label="Dzień zwykły"
            fallback="#8ed1fc"
            allowClear={false}
          />
        </div>
        {canWrite && (
          <Button
            type="submit"
            size="sm"
            className="justify-self-start"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Zapisywanie…" : "Zapisz kolory"}
          </Button>
        )}
      </form>
    </Form>
  )
}
