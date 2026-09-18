import { z } from "zod";
import { changePasswordSchema, updateProfileSchema } from "../../modules/users/users.schema";
import { authErrors, bearerAuth, commonErrors, registry, successResponse } from "../registry";
import { userSchema } from "../schemas";

registry.registerPath({
  method: "get",
  path: "/users/me",
  tags: ["Users"],
  summary: "Perfil do utilizador autenticado",
  security: bearerAuth,
  responses: {
    200: successResponse(userSchema),
    ...authErrors,
  },
});

registry.registerPath({
  method: "patch",
  path: "/users/me",
  tags: ["Users"],
  summary: "Atualizar perfil (nome, telefone, avatar)",
  security: bearerAuth,
  request: { body: { content: { "application/json": { schema: updateProfileSchema } } } },
  responses: {
    200: successResponse(userSchema),
    ...commonErrors,
    ...authErrors,
  },
});

registry.registerPath({
  method: "post",
  path: "/users/me/password",
  tags: ["Users"],
  summary: "Alterar a própria senha",
  security: bearerAuth,
  request: { body: { content: { "application/json": { schema: changePasswordSchema } } } },
  responses: {
    200: successResponse(z.object({})),
    ...commonErrors,
    ...authErrors,
  },
});

registry.registerPath({
  method: "delete",
  path: "/users/me",
  tags: ["Users"],
  summary: "Apagar a própria conta",
  security: bearerAuth,
  responses: {
    200: successResponse(z.object({})),
    ...authErrors,
  },
});
