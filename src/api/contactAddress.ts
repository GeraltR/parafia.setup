import { apiClient } from "@/lib/api-client"
import type { ContactAddresses } from "@/types/config"

export type ContactAddressUpdatePayload = Omit<ContactAddresses, "id" | "address">

export const contactAddressApi = {
  get: () => apiClient.get<ContactAddresses>("/contact-addresses"),
  update: (payload: ContactAddressUpdatePayload) =>
    apiClient.put<ContactAddresses>("/contact-addresses", payload),
}
