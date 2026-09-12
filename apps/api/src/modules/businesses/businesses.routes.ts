import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { validate } from "../../shared/middleware/validate";
import { businessesController } from "./businesses.controller";
import { createBusinessSchema, updateBusinessSchema } from "./businesses.schema";

export const businessesRoutes = Router();

businessesRoutes.get("/", businessesController.list);
businessesRoutes.get("/:id", businessesController.getById);

businessesRoutes.post("/", authenticate, authorize("OWNER"), validate(createBusinessSchema), businessesController.create);
businessesRoutes.patch("/:id", authenticate, authorize("OWNER"), validate(updateBusinessSchema), businessesController.update);
businessesRoutes.delete("/:id", authenticate, authorize("OWNER"), businessesController.remove);
