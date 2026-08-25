import { z } from "zod"

export const PASSWORD_MIN_LENGTH = 12

export const PASSWORD_REQUIREMENTS_HINT =
  "Co najmniej 12 znaków, zawierające małe i duże litery, co najmniej jedną cyfrę i znak specjalny."

export const passwordComplexitySchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Hasło musi mieć co najmniej ${PASSWORD_MIN_LENGTH} znaków`)
  .regex(/[a-z]/, "Hasło musi zawierać małą literę")
  .regex(/[A-Z]/, "Hasło musi zawierać wielką literę")
  .regex(/[0-9]/, "Hasło musi zawierać cyfrę")
  .regex(/[^a-zA-Z0-9]/, "Hasło musi zawierać znak specjalny")
