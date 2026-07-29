import type { Request, Response } from "express";
import * as locationModel from "../models/location.model.js";
import { areaSchema, buildingSchema } from "../validators/location.schema.js";

export async function listLocations(_request: Request, response: Response) {
  response.json(await locationModel.findLocations());
}

export async function createArea(request: Request, response: Response) {
  const input = areaSchema.parse(request.body);
  response.status(201).json(await locationModel.createArea(input.propertyId, input.name));
}

export async function createBuilding(request: Request, response: Response) {
  const input = buildingSchema.parse(request.body);
  response.status(201).json(await locationModel.createBuilding(input.areaId, input.name));
}
