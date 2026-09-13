import { Router } from "express";
import { validateQuery } from "../../shared/middleware/validate";
import { searchController } from "./search.controller";
import { searchQuerySchema } from "./search.schema";

export const searchRoutes = Router();

// Public — the same endpoint Web and Mobile both call, no separate mobile route.
searchRoutes.get("/", validateQuery(searchQuerySchema), searchController.search);
