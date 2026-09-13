import type { Request, Response } from "express";
import { sendListSuccess, sendSuccess } from "../../shared/utils/apiResponse";
import { businessesService } from "./businesses.service";
import type { CreateBusinessInput, ListBusinessesQuery, SetBusinessHoursInput, UpdateBusinessInput } from "./businesses.schema";

export const businessesController = {
  async create(req: Request, res: Response) {
    const business = await businessesService.create(req.user!.id, req.body as CreateBusinessInput);
    sendSuccess(res, business, 201);
  },

  async list(req: Request, res: Response) {
    const query = req.validatedQuery as unknown as ListBusinessesQuery;
    const { data, meta } = await businessesService.list(query);
    sendListSuccess(res, data, meta);
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

  async getHours(req: Request<{ id: string }>, res: Response) {
    const hours = await businessesService.getHours(req.params.id);
    sendSuccess(res, hours);
  },

  async setHours(req: Request<{ id: string }>, res: Response) {
    const hours = await businessesService.setHours(req.params.id, req.user!.id, req.body as SetBusinessHoursInput);
    sendSuccess(res, hours);
  },
};
