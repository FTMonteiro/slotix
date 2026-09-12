import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { validate } from "../../shared/middleware/validate";
import { professionalsController } from "./professionals.controller";
import { createProfessionalSchema, updateProfessionalSchema } from "./professionals.schema";

export const professionalsRoutes = Router();

professionalsRoutes.get("/", professionalsController.listByBusiness);
professionalsRoutes.get("/:id", professionalsController.getById);

professionalsRoutes.post("/", authenticate, authorize("OWNER"), validate(createProfessionalSchema), professionalsController.create);
professionalsRoutes.patch("/:id", authenticate, authorize("OWNER"), validate(updateProfessionalSchema), professionalsController.update);
professionalsRoutes.delete("/:id", authenticate, authorize("OWNER"), professionalsController.remove);
