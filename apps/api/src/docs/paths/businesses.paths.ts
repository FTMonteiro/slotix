import { z } from "zod";
import {
  createBusinessSchema,
  listBusinessesQuerySchema,
  setBusinessHoursSchema,
  updateBusinessSchema,
} from "../../modules/businesses/businesses.schema";
import { authErrors, bearerAuth, commonErrors, forbiddenError, registry, successResponse, listSuccessResponse } from "../registry";
import { businessHoursEntrySchema, businessSchema, professionalSchema, serviceSchema } from "../schemas";

const idParam = z.object({ id: z.string().uuid() });

registry.registerPath({
  method: "get",
  path: "/businesses",
  tags: ["Businesses"],
  summary: "Listar negócios (público, com filtros e ordenação)",
  request: { query: listBusinessesQuerySchema },
  responses: {
    200: listSuccessResponse(businessSchema),
    ...commonErrors,
  },
});

registry.registerPath({
  method: "get",
  path: "/businesses/{id}",
  tags: ["Businesses"],
  summary: "Detalhe de um negócio",
  request: { params: idParam },
  responses: {
    200: successResponse(businessSchema),
    ...commonErrors,
  },
});

registry.registerPath({
  method: "get",
  path: "/businesses/{id}/hours",
  tags: ["Businesses"],
  summary: "Horário de funcionamento do negócio",
  request: { params: idParam },
  responses: {
    200: listSuccessResponse(businessHoursEntrySchema),
    ...commonErrors,
  },
});

registry.registerPath({
  method: "post",
  path: "/businesses",
  tags: ["Businesses"],
  summary: "Criar negócio (dono)",
  security: bearerAuth,
  request: { body: { content: { "application/json": { schema: createBusinessSchema } } } },
  responses: {
    201: successResponse(businessSchema),
    ...commonErrors,
    ...authErrors,
    ...forbiddenError,
  },
});

registry.registerPath({
  method: "patch",
  path: "/businesses/{id}",
  tags: ["Businesses"],
  summary: "Atualizar negócio (dono)",
  security: bearerAuth,
  request: { params: idParam, body: { content: { "application/json": { schema: updateBusinessSchema } } } },
  responses: {
    200: successResponse(businessSchema),
    ...commonErrors,
    ...authErrors,
    ...forbiddenError,
  },
});

registry.registerPath({
  method: "put",
  path: "/businesses/{id}/hours",
  tags: ["Businesses"],
  summary: "Substituir o horário de funcionamento (dono)",
  security: bearerAuth,
  request: { params: idParam, body: { content: { "application/json": { schema: setBusinessHoursSchema } } } },
  responses: {
    200: listSuccessResponse(businessHoursEntrySchema),
    ...commonErrors,
    ...authErrors,
    ...forbiddenError,
  },
});

registry.registerPath({
  method: "delete",
  path: "/businesses/{id}",
  tags: ["Businesses"],
  summary: "Remover negócio (dono)",
  security: bearerAuth,
  request: { params: idParam },
  responses: {
    200: successResponse(z.object({})),
    ...commonErrors,
    ...authErrors,
    ...forbiddenError,
  },
});

// Convenience nested reads, composed at the top level in routes.ts but reachable at
// these same /businesses/{id}/... URLs.
registry.registerPath({
  method: "get",
  path: "/businesses/{id}/services",
  tags: ["Businesses"],
  summary: "Serviços de um negócio",
  request: { params: idParam },
  responses: {
    200: successResponse(z.array(serviceSchema)),
    ...commonErrors,
  },
});

registry.registerPath({
  method: "get",
  path: "/businesses/{id}/professionals",
  tags: ["Businesses"],
  summary: "Profissionais de um negócio",
  request: { params: idParam },
  responses: {
    200: successResponse(z.array(professionalSchema)),
    ...commonErrors,
  },
});
