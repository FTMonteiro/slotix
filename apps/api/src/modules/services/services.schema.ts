import { z } from "zod";

export const createServiceSchema = z.object({
  businessId: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  duration: z.number().int().positive(),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  duration: z.number().int().positive().optional(),
  active: z.boolean().optional(),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
