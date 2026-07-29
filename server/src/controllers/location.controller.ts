import type { Request, Response } from "express";
import * as locationModel from "../models/location.model.js";
import { areaSchema, buildingIdSchema, buildingSchema } from "../validators/location.schema.js";

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

export async function updateBuilding(request: Request, response: Response) {
  const id = buildingIdSchema.parse(request.params.id);
  const input = buildingSchema.parse(request.body);
  const building = await locationModel.updateBuilding(id, input.areaId, input.name);
  if (!building) return response.status(404).json({ message: "Building not found" });
  response.json(building);
}

export async function archiveBuilding(request: Request, response: Response) {
  const id = buildingIdSchema.parse(request.params.id);
  const building = await locationModel.archiveBuilding(id);
  if (!building) return response.status(404).json({ message: "Building not found" });
  response.status(204).end();
}
