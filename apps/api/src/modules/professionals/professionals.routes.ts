import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { validate } from "../../shared/middleware/validate";
import { professionalsController } from "./professionals.controller";
import { createBlockSchema, createProfessionalSchema, updateProfessionalSchema } from "./professionals.schema";

export const professionalsRoutes = Router();

professionalsRoutes.get("/", professionalsController.listByBusiness);
professionalsRoutes.get("/:id", professionalsController.getById);

professionalsRoutes.post("/", authenticate, authorize("OWNER"), validate(createProfessionalSchema), professionalsController.create);
professionalsRoutes.patch("/:id", authenticate, authorize("OWNER"), validate(updateProfessionalSchema), professionalsController.update);
professionalsRoutes.delete("/:id", authenticate, authorize("OWNER"), professionalsController.remove);

// Blocks (time off): listing/managing is restricted to the owner or the professional
// themselves (assertCanManageBlocks) since a block's `reason` can be sensitive; public
// availability is exposed only as computed free/busy slots via /availability.
professionalsRoutes.get("/:id/blocks", authenticate, professionalsController.listBlocks);
professionalsRoutes.post("/:id/blocks", authenticate, validate(createBlockSchema), professionalsController.addBlock);
professionalsRoutes.delete("/:id/blocks/:blockId", authenticate, professionalsController.removeBlock);
