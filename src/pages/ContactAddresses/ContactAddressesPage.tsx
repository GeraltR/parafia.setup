import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { contactAddressApi } from "@/api/contactAddress"
import { socialApi } from "@/api/social"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/useAuth"
import { cn } from "@/lib/utils"
import type { ContactAddresses, SocialLinks, SocialVisibility } from "@/types/config"

import { SocialNetworkRow } from "./SocialNetworkRow"
import { NETWORK_KEYS, NETWORK_LABELS, contactAddressSchema, type ContactAddressFormValues } from "./schema"

function toFormValues(contact: ContactAddresses, links: SocialLinks): ContactAddressFormValues {
  return {
    street: contact.street,
    city: contact.city,
    postCode: contact.postCode,
    phone: contact.phone,
    social: NETWORK_KEYS.map((network) => ({
      network,
      link: links[network],
      visibility: contact.social[network],
    })),
  }
}

export function ContactAddressesPage() {
  const { user } = useAuth()
  const canWrite = user?.canWrite.site ?? false
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [saveError, setSaveError] = useState<string | null>(null)

  const form = useForm<ContactAddressFormValues>({
    resolver: zodResolver(contactAddressSchema),
    defaultValues: {
      street: "",
      city: "",
      postCode: "",
      phone: "",
      social: NETWORK_KEYS.map((network) => ({ network, link: "", visibility: false })),
    },
  })

  useEffect(() => {
    Promise.all([contactAddressApi.get(), socialApi.get()])
      .then(([contact, links]) => {
        form.reset(toFormValues(contact, links))
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: ContactAddressFormValues) {
    setSaveError(null)
    try {
      const visibility = values.social.reduce(
        (acc, row) => ({ ...acc, [row.network]: row.visibility }),
        {} as SocialVisibility
      )
      const links = values.social.reduce(
        (acc, row) => ({ ...acc, [row.network]: row.link }),
        {} as SocialLinks
      )

      const [contact, savedLinks] = await Promise.all([
        contactAddressApi.update({
          street: values.street,
          city: values.city,
          postCode: values.postCode,
          phone: values.phone,
          social: visibility,
        }),
        socialApi.update(links),
      ])

      form.reset(toFormValues(contact, savedLinks))
    } catch {
      setSaveError("Nie udało się zapisać zmian.")
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-muted-foreground">Ładowanie…</p>
  }

  if (status === "error") {
    return <p className="text-sm text-destructive">Nie udało się wczytać danych kontaktowych.</p>
  }

  return (
    <Card className="max-w-3xl overflow-visible">
      <CardHeader>
        <CardTitle>Dane kontaktowe</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className={cn("grid gap-6", !canWrite && "opacity-60")}>
          <fieldset disabled={!canWrite} className={cn("contents", !canWrite && "pointer-events-none")}>
            <div className="grid gap-4">
              <p className="text-sm font-medium">Adres i telefon</p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ulica i numer</FormLabel>
                      <FormControl>
                        <Input placeholder="ul. Jana III Sobieskiego 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="+48 (32) 617 72 11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kod pocztowy</FormLabel>
                      <FormControl>
                        <Input placeholder="43-602" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Miasto</FormLabel>
                      <FormControl>
                        <Input placeholder="Jaworzno" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-3">
              <p className="text-sm font-medium">Social media</p>
              {NETWORK_KEYS.map((network, index) => (
                <SocialNetworkRow
                  key={network}
                  control={form.control}
                  index={index}
                  label={NETWORK_LABELS[network]}
                />
              ))}
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
