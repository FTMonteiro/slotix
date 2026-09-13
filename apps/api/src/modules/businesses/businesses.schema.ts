import { z } from "zod";

export const createBusinessSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const updateBusinessSchema = createBusinessSchema.partial();

export const listBusinessesQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

const businessHoursEntrySchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(1).max(1440),
  })
  .refine((entry) => entry.endMinute > entry.startMinute, {
    message: "endMinute tem de ser maior do que startMinute",
  });

export const setBusinessHoursSchema = z.object({
  hours: z.array(businessHoursEntrySchema).max(50),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;
export type ListBusinessesQuery = z.infer<typeof listBusinessesQuerySchema>;
export type SetBusinessHoursInput = z.infer<typeof setBusinessHoursSchema>;
export type BusinessHoursEntry = z.infer<typeof businessHoursEntrySchema>;
