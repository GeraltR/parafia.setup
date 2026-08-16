const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api"

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      ...(init?.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    ...init,
  })

  if (!response.ok) {
    throw new ApiError(`Request to "${path}" failed (HTTP ${response.status})`, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const json = await response.json()
  return (Object.prototype.hasOwnProperty.call(json, "data") ? json.data : json) as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", body: formData }),
}
