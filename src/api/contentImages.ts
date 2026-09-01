import { apiClient } from "@/lib/api-client"

export const contentImagesApi = {
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append("image", file)
    return apiClient.upload<{ url: string }>("/content-images", formData)
  },
}
