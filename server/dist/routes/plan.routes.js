import { Router } from "express";
import * as controller from "../controllers/plan.controller.js";
export const planRouter = Router();
planRouter.get("/", controller.listPlans).post("/", controller.createPlan);
planRouter.put("/:id", controller.updatePlan).delete("/:id", controller.deactivatePlan);
