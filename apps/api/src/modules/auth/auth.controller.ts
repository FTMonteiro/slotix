import type { Request, Response } from "express";
import type { LoginInput, RefreshInput, RegisterInput } from "@slotix/validation";
import { sendSuccess } from "../../shared/utils/apiResponse";
import { authService } from "./auth.service";

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body as RegisterInput);
    sendSuccess(res, result, 201);
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body as LoginInput);
    sendSuccess(res, result);
  },

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body as RefreshInput;
    const result = await authService.refresh(refreshToken);
    sendSuccess(res, result);
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.user!.id);
    sendSuccess(res, { loggedOut: true });
  },
};
