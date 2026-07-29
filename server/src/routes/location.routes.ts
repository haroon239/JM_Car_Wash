import { Router } from "express";
import * as controller from "../controllers/location.controller.js";

export const locationRouter = Router();
locationRouter.get("/", controller.listLocations);
locationRouter.post("/areas", controller.createArea);
locationRouter.post("/buildings", controller.createBuilding);
