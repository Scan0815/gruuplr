import { z } from 'zod';

export const TokenSchema = z.object({
  userId: z.string(),
});