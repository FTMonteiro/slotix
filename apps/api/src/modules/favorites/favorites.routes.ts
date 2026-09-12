import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { validate } from "../../shared/middleware/validate";
import { favoritesController } from "./favorites.controller";
import { createFavoriteSchema } from "@slotix/validation";

export const favoritesRoutes = Router();

favoritesRoutes.use(authenticate);
favoritesRoutes.get("/", favoritesController.listMine);
favoritesRoutes.post("/", validate(createFavoriteSchema), favoritesController.add);
favoritesRoutes.delete("/:businessId", favoritesController.remove);
