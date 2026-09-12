import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/utils/apiResponse";
import { usersService } from "./users.service";
import type { ChangePasswordInput, UpdateProfileInput } from "./users.schema";

export const usersController = {
  async me(req: Request, res: Response) {
    const profile = await usersService.getProfile(req.user!.id);
    sendSuccess(res, profile);
  },

  async updateMe(req: Request, res: Response) {
    const profile = await usersService.updateProfile(req.user!.id, req.body as UpdateProfileInput);
    sendSuccess(res, profile);
  },

  async changePassword(req: Request, res: Response) {
    await usersService.changePassword(req.user!.id, req.body as ChangePasswordInput);
    sendSuccess(res, { changed: true });
  },
};
