import * as model from "../models/settings.model.js";
import { settingsSchema } from "../validators/settings.schema.js";
export async function getSettings(_request, response) { response.json(await model.getSettings()); }
export async function saveSettings(request, response) { response.json(await model.saveSettings(settingsSchema.parse(request.body))); }
