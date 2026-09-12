import type { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../errors";
import { verifyAccessToken } from "../utils/jwt";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    next(new AuthenticationError("Token de acesso em falta."));
    return;
  }

  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length));
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new AuthenticationError("Token de acesso inválido ou expirado."));
  }
}
