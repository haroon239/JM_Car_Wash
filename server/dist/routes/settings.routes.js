import { Router } from "express";
import { getSettings, saveSettings } from "../controllers/settings.controller.js";
export const settingsRouter = Router().get("/", getSettings).put("/", saveSettings);
