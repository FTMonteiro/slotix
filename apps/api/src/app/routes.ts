import { Router, type Request, type Response } from "express";
import { authRoutes } from "../modules/auth";
import { usersRoutes } from "../modules/users";
import { businessesRoutes } from "../modules/businesses";
import { clientsRoutes } from "../modules/clients";
import { professionalsRoutes, professionalsService } from "../modules/professionals";
import { servicesRoutes, servicesService } from "../modules/services";
import { appointmentsRoutes } from "../modules/appointments";
import { paymentsRoutes } from "../modules/payments";
import { notificationsRoutes } from "../modules/notifications";
import { favoritesRoutes } from "../modules/favorites";
import { reviewsRoutes, reviewsService } from "../modules/reviews";
import { galleryRoutes } from "../modules/gallery";
import { authenticate } from "../shared/middleware/authenticate";
import { authorize } from "../shared/middleware/authorize";
import { validate } from "../shared/middleware/validate";
import { sendSuccess } from "../shared/utils/apiResponse";
import { createReviewSchema } from "@slotix/validation";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/users", usersRoutes);
routes.use("/businesses", businessesRoutes);
routes.use("/clients", clientsRoutes);
routes.use("/professionals", professionalsRoutes);
routes.use("/services", servicesRoutes);
routes.use("/appointments", appointmentsRoutes);
routes.use("/payments", paymentsRoutes);
routes.use("/notifications", notificationsRoutes);
routes.use("/favorites", favoritesRoutes);
routes.use("/reviews", reviewsRoutes);
routes.use("/gallery", galleryRoutes);

// Convenience nested routes composed at the top level (rather than importing across
// businesses/services/professionals/reviews) to avoid circular module imports — those
// modules already depend on `businesses` for ownership checks, so `businesses` can't
// depend back on them.
routes.get("/businesses/:id/services", async (req: Request<{ id: string }>, res: Response) => {
  const services = await servicesService.listByBusiness(req.params.id);
  sendSuccess(res, services);
});

routes.get("/businesses/:id/professionals", async (req: Request<{ id: string }>, res: Response) => {
  const professionals = await professionalsService.listByBusiness(req.params.id);
  sendSuccess(res, professionals);
});

routes.get("/businesses/:id/reviews", async (req: Request<{ id: string }>, res: Response) => {
  const reviews = await reviewsService.listByBusiness(req.params.id);
  sendSuccess(res, reviews);
});

routes.post(
  "/businesses/:id/reviews",
  authenticate,
  authorize("CUSTOMER"),
  validate(createReviewSchema),
  async (req: Request<{ id: string }>, res: Response) => {
    const review = await reviewsService.create(req.user!.id, req.body, req.params.id);
    sendSuccess(res, review, 201);
  },
);
