import { z } from "zod";
import { authErrors, bearerAuth, commonErrors, forbiddenError, listSuccessResponse, registry, successResponse } from "../registry";
import { clientSchema } from "../schemas";

const userIdParam = z.object({ userId: z.string().uuid() });

registry.registerPath({
  method: "get",
  path: "/clients",
  tags: ["Clients"],
  summary: "Listar clientes do negócio do dono autenticado",
  security: bearerAuth,
  responses: { 200: listSuccessResponse(clientSchema), ...authErrors, ...forbiddenError },
});

registry.registerPath({
  method: "get",
  path: "/clients/{userId}",
  tags: ["Clients"],
  summary: "Detalhe de um cliente do negócio",
  security: bearerAuth,
  request: { params: userIdParam },
  responses: { 200: successResponse(clientSchema), ...commonErrors, ...authErrors, ...forbiddenError },
});
