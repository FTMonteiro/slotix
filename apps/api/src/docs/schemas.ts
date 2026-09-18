import { z } from "zod";
import { registry } from "./registry";

// Response-shape schemas mirroring the DTOs in packages/types/src/index.ts. These
// describe what controllers actually serialize back, so they're kept separate from the
// request-validation schemas in @slotix/validation and each module's *.schema.ts.

export const roleSchema = z.enum(["CUSTOMER", "OWNER", "EMPLOYEE", "ADMIN"]);
export const appointmentStatusSchema = z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]);
export const paymentStatusSchema = z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]);
export const paymentMethodSchema = z.enum(["CASH", "CARD", "MULTICAIXA", "BANK_TRANSFER", "OTHER"]);

export const userSchema = registry.register(
  "User",
  z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    name: z.string(),
    phone: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    role: roleSchema,
    createdAt: z.string().datetime(),
  }),
);

export const authTokensSchema = registry.register(
  "AuthTokens",
  z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
);

export const loginResponseSchema = registry.register(
  "LoginResponse",
  authTokensSchema.extend({ user: userSchema }),
);

export const businessSchema = registry.register(
  "Business",
  z.object({
    id: z.string().uuid(),
    ownerId: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    address: z.string().nullable(),
    phone: z.string().nullable(),
    category: z.string().nullable(),
    imageUrl: z.string().nullable(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    ratingAvg: z.number().nullable(),
    ratingCount: z.number().int(),
    distanceKm: z.number().nullable().openapi({
      description: "Só presente quando a requisição incluiu latitude/longitude do cliente.",
    }),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

export const businessHoursEntrySchema = registry.register(
  "BusinessHoursEntry",
  z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(1).max(1440),
  }),
);

export const professionalBlockSchema = registry.register(
  "ProfessionalBlock",
  z.object({
    id: z.string().uuid(),
    professionalId: z.string().uuid(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    reason: z.string().nullable(),
  }),
);

export const availabilitySlotSchema = registry.register(
  "AvailabilitySlot",
  z.object({
    time: z.string().openapi({ example: "2026-09-20T09:00:00.000Z" }),
  }),
);

export const serviceSchema = registry.register(
  "Service",
  z.object({
    id: z.string().uuid(),
    businessId: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.number(),
    duration: z.number().int(),
    category: z.string().nullable(),
    imageUrl: z.string().nullable(),
    active: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

export const professionalSchema = registry.register(
  "Professional",
  z.object({
    id: z.string().uuid(),
    businessId: z.string().uuid(),
    userId: z.string().uuid(),
    name: z.string(),
    bio: z.string().nullable(),
    specialty: z.string().nullable(),
    imageUrl: z.string().nullable(),
    ratingAvg: z.number().nullable(),
    ratingCount: z.number().int(),
    active: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

export const clientSchema = registry.register(
  "Client",
  z.object({
    userId: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable(),
    visits: z.number().int(),
    totalSpent: z.number(),
    lastVisit: z.string().datetime().nullable(),
    status: z.enum(["active", "vip", "inactive"]),
  }),
);

export const appointmentSchema = registry.register(
  "Appointment",
  z.object({
    id: z.string().uuid(),
    businessId: z.string().uuid(),
    clientId: z.string().uuid(),
    serviceId: z.string().uuid(),
    professionalId: z.string().uuid(),
    scheduledAt: z.string().datetime(),
    price: z.number(),
    status: appointmentStatusSchema,
    notes: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

export const favoriteSchema = registry.register(
  "Favorite",
  z.object({
    id: z.string().uuid(),
    businessId: z.string().uuid(),
    business: businessSchema,
    createdAt: z.string().datetime(),
  }),
);

export const reviewSchema = registry.register(
  "Review",
  z.object({
    id: z.string().uuid(),
    businessId: z.string().uuid(),
    clientId: z.string().uuid(),
    clientName: z.string(),
    appointmentId: z.string().uuid(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

export const notificationSchema = registry.register(
  "Notification",
  z.object({
    id: z.string().uuid(),
    type: z.string(),
    title: z.string(),
    message: z.string(),
    read: z.boolean(),
    createdAt: z.string().datetime(),
  }),
);

export const paymentSchema = registry.register(
  "Payment",
  z.object({
    id: z.string().uuid(),
    appointmentId: z.string().uuid(),
    userId: z.string().uuid(),
    businessId: z.string().uuid(),
    amount: z.number(),
    currency: z.string(),
    method: paymentMethodSchema,
    status: paymentStatusSchema,
    paidAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

export const galleryImageSchema = registry.register(
  "GalleryImage",
  z.object({
    id: z.string().uuid(),
    businessId: z.string().uuid(),
    url: z.string().url(),
    position: z.number().int(),
    caption: z.string().nullable(),
    createdAt: z.string().datetime(),
  }),
);

export const matchedServiceSchema = registry.register(
  "MatchedService",
  z.object({
    id: z.string().uuid(),
    name: z.string(),
    price: z.number(),
  }),
);

export const searchResultSchema = registry.register(
  "SearchResult",
  z.object({
    business: businessSchema,
    matchedService: matchedServiceSchema.nullable(),
  }),
);
