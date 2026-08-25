import { z } from "zod"

import { passwordComplexitySchema } from "@/lib/passwordValidation"

export const changePasswordSchema = z
  .object({
    newPassword: passwordComplexitySchema,
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
    password: passwordComplexitySchema,
    passwordConfirmation: z.string().min(1, "Wymagane"),
    permissionLevel: z.union([z.literal(0), z.literal(1), z.literal(3), z.literal(7)]),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Hasła muszą być identyczne",
    path: ["passwordConfirmation"],
  })

export type CreateUserFormValues = z.infer<typeof createUserSchema>
