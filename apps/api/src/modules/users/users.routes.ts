import { Router } from "express";
import { authenticate } from "../../shared/middleware/authenticate";
import { validate } from "../../shared/middleware/validate";
import { usersController } from "./users.controller";
import { changePasswordSchema, updateProfileSchema } from "./users.schema";

export const usersRoutes = Router();

usersRoutes.use(authenticate);
usersRoutes.get("/me", usersController.me);
usersRoutes.patch("/me", validate(updateProfileSchema), usersController.updateMe);
usersRoutes.post("/me/password", validate(changePasswordSchema), usersController.changePassword);
