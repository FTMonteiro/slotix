import type { Request, Response } from "express";
import { ValidationError } from "../../shared/errors";
import { sendSuccess } from "../../shared/utils/apiResponse";
import { clientsService } from "./clients.service";

export const clientsController = {
  async listByBusiness(req: Request, res: Response) {
    const businessId = req.query.businessId as string | undefined;
    if (!businessId) throw new ValidationError("O parâmetro businessId é obrigatório.");

    const clients = await clientsService.listByBusiness(businessId, req.user!.id);
    sendSuccess(res, clients);
  },

  async getOne(req: Request<{ userId: string }>, res: Response) {
    const businessId = req.query.businessId as string | undefined;
    if (!businessId) throw new ValidationError("O parâmetro businessId é obrigatório.");

    const client = await clientsService.getByBusinessAndUser(businessId, req.user!.id, req.params.userId);
    sendSuccess(res, client);
  },
};
