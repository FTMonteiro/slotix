import { Router } from "express";
import { authRoutes } from "../modules/auth";
import { usersRoutes } from "../modules/users";
import { businessesRoutes } from "../modules/businesses";
import { clientsRoutes } from "../modules/clients";
import { professionalsRoutes } from "../modules/professionals";
import { servicesRoutes } from "../modules/services";
import { appointmentsRoutes } from "../modules/appointments";
import { paymentsRoutes } from "../modules/payments";
import { notificationsRoutes } from "../modules/notifications";
import { favoritesRoutes } from "../modules/favorites";
import { reviewsRoutes } from "../modules/reviews";
import { galleryRoutes } from "../modules/gallery";

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
