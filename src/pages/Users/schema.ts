import { z } from "zod"

const PASSWORD_MIN_LENGTH = 12

const passwordComplexity = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Hasło musi mieć co najmniej ${PASSWORD_MIN_LENGTH} znaków`)
  .regex(/[a-z]/, "Hasło musi zawierać małą literę")
  .regex(/[A-Z]/, "Hasło musi zawierać wielką literę")
  .regex(/[0-9]/, "Hasło musi zawierać cyfrę")
  .regex(/[^a-zA-Z0-9]/, "Hasło musi zawierać znak specjalny")

export const changePasswordSchema = z
  .object({
    newPassword: passwordComplexity,
    newPasswordConfirmation: z.string().min(1, "Wymagane"),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: "Hasła muszą być identyczne",
    path: ["newPasswordConfirmation"],
  })

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export const createUserSchema = z
  .object({
    name: z.string().min(1, "Wymagane"),
    email: z.string().min(1, "Wymagane").email("Nieprawidłowy adres e-mail"),
    password: passwordComplexity,
    passwordConfirmation: z.string().min(1, "Wymagane"),
    permissionLevel: z.union([z.literal(0), z.literal(1), z.literal(3), z.literal(7)]),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Hasła muszą być identyczne",
    path: ["passwordConfirmation"],
  })

export type CreateUserFormValues = z.infer<typeof createUserSchema>
