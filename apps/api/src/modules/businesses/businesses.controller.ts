import type { Request, Response } from "express";
import { sendSuccess } from "../../shared/utils/apiResponse";
import { businessesService } from "./businesses.service";
import type { CreateBusinessInput, UpdateBusinessInput } from "./businesses.schema";

export const businessesController = {
  async create(req: Request, res: Response) {
    const business = await businessesService.create(req.user!.id, req.body as CreateBusinessInput);
    sendSuccess(res, business, 201);
  },

  async list(_req: Request, res: Response) {
    const businesses = await businessesService.list();
    sendSuccess(res, businesses);
  },

  async getById(req: Request<{ id: string }>, res: Response) {
    const business = await businessesService.getById(req.params.id);
    sendSuccess(res, business);
  },

  async update(req: Request<{ id: string }>, res: Response) {
    const business = await businessesService.update(req.params.id, req.user!.id, req.body as UpdateBusinessInput);
    sendSuccess(res, business);
  },

  async remove(req: Request<{ id: string }>, res: Response) {
    await businessesService.remove(req.params.id, req.user!.id);
    sendSuccess(res, { deleted: true });
  },
};
