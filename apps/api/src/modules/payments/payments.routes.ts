import { Router } from "express";
import { createPaymentSchema } from "@slotix/validation";
import { authenticate } from "../../shared/middleware/authenticate";
import { authorize } from "../../shared/middleware/authorize";
import { validate } from "../../shared/middleware/validate";
import { paymentsController } from "./payments.controller";

export const paymentsRoutes = Router();

paymentsRoutes.use(authenticate);

paymentsRoutes.post("/", authorize("CUSTOMER", "ADMIN"), validate(createPaymentSchema), paymentsController.create);
paymentsRoutes.get("/", paymentsController.list);
paymentsRoutes.get("/:id", paymentsController.getById);
paymentsRoutes.patch("/:id/pay", authorize("OWNER", "ADMIN"), paymentsController.markAsPaid);
paymentsRoutes.patch("/:id/fail", authorize("OWNER", "ADMIN"), paymentsController.markAsFailed);
paymentsRoutes.patch("/:id/refund", authorize("OWNER", "ADMIN"), paymentsController.refund);
