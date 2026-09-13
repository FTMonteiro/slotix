import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { validate, validateQuery } from "../../shared/middleware/validate";
import { businessesController } from "./businesses.controller";
import { createBusinessSchema, listBusinessesQuerySchema, setBusinessHoursSchema, updateBusinessSchema } from "./businesses.schema";

export const businessesRoutes = Router();

businessesRoutes.get("/", validateQuery(listBusinessesQuerySchema), businessesController.list);
businessesRoutes.get("/:id", businessesController.getById);
businessesRoutes.get("/:id/hours", businessesController.getHours);

businessesRoutes.post("/", authenticate, authorize("OWNER"), validate(createBusinessSchema), businessesController.create);
businessesRoutes.patch("/:id", authenticate, authorize("OWNER"), validate(updateBusinessSchema), businessesController.update);
businessesRoutes.put("/:id/hours", authenticate, authorize("OWNER"), validate(setBusinessHoursSchema), businessesController.setHours);
businessesRoutes.delete("/:id", authenticate, authorize("OWNER"), businessesController.remove);
