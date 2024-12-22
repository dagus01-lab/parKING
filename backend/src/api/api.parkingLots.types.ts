/**
 * @fileoverview This file contains type definitions for requests related to parking lots in the parKING backend API.
 * It includes types for requests to get parking lots with specific parameters and to update a parking lot.
 */

import { ParkingLot } from "../model/model.parKING.types";
import { Request } from "express";

/**
 * Represents a request to get parking lots with specific parameters.
 *
 * @typedef {Request} GetParkingLotsRequest
 * @property {string} boundary.center.latitude - The latitude of the center point of the boundary.
 * @property {string} boundary.center.longitude - The longitude of the center point of the boundary.
 * @property {string} boundary.radius - The radius of the boundary.
 * @property {string} maxResults - The maximum number of results to return.
 */

export type GetParkingLotsRequest = Request<
  {},
  {},
  {},
  {
    "boundary.center.latitude": string;
    "boundary.center.longitude": string;
    "boundary.radius": string;
    maxResults: string;
  }
>;

/**
 * Represents a request to update a parking lot.
 *
 * @typedef {PutParkingLotsRequest}
 * @property {Object} params - The route parameters.
 * @property {string} params.id - The ID of the parking lot to update.
 * @property {ParkingLot} body - The parking lot data to update.
 */
export type PutParkingLotsRequest = Request<
  {},
  {},
  ParkingLot,
  {
    id: string;
  }
>;
