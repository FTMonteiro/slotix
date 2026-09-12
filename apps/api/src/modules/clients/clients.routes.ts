import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { clientsController } from "./clients.controller";

export const clientsRoutes = Router();

clientsRoutes.use(authenticate, authorize("OWNER"));
clientsRoutes.get("/", clientsController.listByBusiness);
clientsRoutes.get("/:userId", clientsController.getOne);
