import { z } from "zod";

export const createProfessionalSchema = z.object({
  businessId: z.string().uuid(),
  userId: z.string().uuid(),
  bio: z.string().optional(),
});

export const updateProfessionalSchema = z.object({
  bio: z.string().optional(),
  active: z.boolean().optional(),
});

export type CreateProfessionalInput = z.infer<typeof createProfessionalSchema>;
export type UpdateProfessionalInput = z.infer<typeof updateProfessionalSchema>;
