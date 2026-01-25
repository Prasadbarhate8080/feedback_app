import { z } from "zod";

export const userNameValidation = z
    .string()
    .min(2,"username must be at least 2 characters")
    .max(20,"username must not be more than 20 characters")
    .regex(/^[a-zA-Z0-9]+$/,"username must not  contain special characters")

export const signUpSchma = z.object({
    userName: userNameValidation,
    email: z.string().email({message:"invalid email address"}),
    password: z.string().min(6,{message:"password must be at least "})
})