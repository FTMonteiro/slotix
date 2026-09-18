import { loginSchema, refreshSchema, registerSchema } from "@slotix/validation";
import { z } from "zod";
import { commonErrors, registry, successResponse, bearerAuth, authErrors } from "../registry";
import { authTokensSchema, loginResponseSchema, userSchema } from "../schemas";

registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  summary: "Criar conta (cliente)",
  request: { body: { content: { "application/json": { schema: registerSchema } } } },
  responses: {
    201: successResponse(loginResponseSchema, "Conta criada, sessão iniciada"),
    ...commonErrors,
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  summary: "Autenticar com email e senha",
  request: { body: { content: { "application/json": { schema: loginSchema } } } },
  responses: {
    200: successResponse(loginResponseSchema, "Autenticado"),
    ...commonErrors,
    401: authErrors[401],
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/refresh",
  tags: ["Auth"],
  summary: "Trocar um refresh token válido por um novo par de tokens",
  request: { body: { content: { "application/json": { schema: refreshSchema } } } },
  responses: {
    200: successResponse(authTokensSchema, "Novo par de tokens"),
    ...commonErrors,
    401: authErrors[401],
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["Auth"],
  summary: "Terminar sessão",
  security: bearerAuth,
  responses: {
    200: successResponse(z.object({}).openapi({ description: "Vazio" })),
    ...authErrors,
  },
});

registry.registerPath({
  method: "get",
  path: "/auth/me",
  tags: ["Auth"],
  summary: "Dados do utilizador autenticado",
  security: bearerAuth,
  responses: {
    200: successResponse(userSchema),
    ...authErrors,
  },
});
