import { z } from 'zod';

export const signInSchema = z.object({
  identifier: z.string().trim(), // username
  password: z.string().trim(),
});
