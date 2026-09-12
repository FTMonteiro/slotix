import type { Request, Response } from "express";
import type { CreateFavoriteInput } from "@slotix/validation";
import { sendSuccess } from "../../shared/utils/apiResponse";
import { favoritesService } from "./favorites.service";

export const favoritesController = {
  async add(req: Request, res: Response) {
    const { businessId } = req.body as CreateFavoriteInput;
    const favorite = await favoritesService.add(req.user!.id, businessId);
    sendSuccess(res, favorite, 201);
  },

  async listMine(req: Request, res: Response) {
    const favorites = await favoritesService.listMine(req.user!.id);
    sendSuccess(res, favorites);
  },

  async remove(req: Request<{ businessId: string }>, res: Response) {
    await favoritesService.remove(req.user!.id, req.params.businessId);
    sendSuccess(res, { deleted: true });
  },
};
