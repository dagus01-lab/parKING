/**
 * @fileoverview This module provides controller functions for handling parking lot data.
 * It includes functions to retrieve a list of parking lots within a specified boundary
 * and to update parking lot information. The parking lot data is stored in a Map and
 * includes details such as coordinates, total parkings, available parkings, and occupied parkings.
 * The module uses the `geolib` library to determine if a point is within a specified radius.
 */

import { Response } from "express";
import { ParkingLot } from "../model/model.parKING.types";
import {
  GetParkingLotsRequest,
  PutParkingLotsRequest,
} from "../api/api.parkingLots.types";
import { from } from "ix/iterable";
import { filter, take } from "ix/iterable/operators";
import { isPointWithinRadius } from "geolib";

const DEFAULT_MAX_RESULTS = 10;

const parkingLots = new Map<number, ParkingLot>([
  [
    0,
    {
      id: 0,
      name: "Autostazione",
      coordinate: { latitude: 44.504422, longitude: 11.346514 },
      totalParkings: 265,
      availableParkings: 256,
      occupiedParkings: 0,
      updateDateTime: 0,
    },
  ],
  [
    1,
    {
      id: 1,
      name: "Riva Reno",
      coordinate: { latitude: 44.501153, longitude: 11.336062 },
      totalParkings: 470,
      availableParkings: 470,
      occupiedParkings: 0,
      updateDateTime: 0,
    },
  ],
  [
    2,
    {
      id: 2,
      name: "VIII Agosto",
      coordinate: { latitude: 44.500297, longitude: 11.345368 },
      totalParkings: 625,
      availableParkings: 625,
      occupiedParkings: 0,
      updateDateTime: 0,
    },
  ],
  [
    10,
    {
      id: 10,
      name: "photoResistorSensor_test",
      coordinate: { latitude: 44.500297, longitude: 11.345368 },
      totalParkings: 2,
      availableParkings: 2,
      occupiedParkings: 0,
      updateDateTime: 0,
    },
  ],
  [
    11,
    {
      id: 11,
      name: "cameraSenor_test",
      coordinate: { latitude: 44.500297, longitude: 11.345368 },
      totalParkings: 6,
      availableParkings: 6,
      occupiedParkings: 0,
      updateDateTime: 0,
    },
  ],
]);

/**
 * Returns the smaller of two numbers.
 *
 * @param n1 - The first number to compare.
 * @param n2 - The second number to compare.
 * @returns The smaller of the two numbers.
 */
function min(n1: number, n2: number) {
  return n1 < n2 ? n1 : n2;
}

/**
 * Retrieves a list of parking lots within a specified boundary and returns them as a JSON response.
 *
 * @param req - The request object containing query parameters:
 *   - `boundary.center.latitude` (string): The latitude of the center of the boundary.
 *   - `boundary.center.longitude` (string): The longitude of the center of the boundary.
 *   - `boundary.radius` (string): The radius of the boundary in meters.
 *   - `maxResults` (string): The maximum number of parking lots to return.
 * @param res - The response object used to send the JSON result.
 *
 * @returns A JSON response containing an array of parking lots within the specified boundary.
 */
export function getParkingLots(req: GetParkingLotsRequest, res: Response) {
  const boundary = {
    center: {
      latitude: Number.parseFloat(req.query["boundary.center.latitude"]),
      longitude: Number.parseFloat(req.query["boundary.center.longitude"]),
    },
    radius: Number.parseInt(req.query["boundary.radius"]),
  };
  const maxResults = Number.parseInt(req.query["maxResults"]);
  const result: ParkingLot[] = [];
  from(parkingLots.values())
    .pipe(
      filter((pl) => {
        return isPointWithinRadius(
          pl.coordinate,
          boundary.center,
          boundary.radius
        );
      }),
      take(min(maxResults, DEFAULT_MAX_RESULTS))
    )
    .forEach((pl) => result.push(pl));
  console.log(
    `get request for at most ${maxResults} parking lots in boundary: ${JSON.stringify(
      boundary
    )}\nresults:${JSON.stringify(result)}`
  );
  res.json(result);
}

/**
 * Handles the PUT request to update a parking lot.
 * The function extracts the parking lot ID from the query parameters, retrieves the old value,
 * updates the parking lot with the new data from the request body, logs the old and new values,
 * and sends the updated data as a JSON response.
 *
 * @param req - The request object containing query parameters:
 *   - `id` (integer): The numeric identifier of the parking lot to update
 *   The request body contains the new parking lot data.
 * @param res - The response object to send the updated parking lot data.
 *
 * @returns A JSON response containg the new stored data for the parking lot to update.
 */
export function putParkingLots(req: PutParkingLotsRequest, res: Response) {
  const id = Number.parseInt(req.query["id"]);
  const oldValue = parkingLots.get(id);
  parkingLots.set(id, req.body);
  console.log(
    `put request for parking lot with id:${id}\nold value:${JSON.stringify(
      oldValue
    )}\nnew value:${JSON.stringify(req.body)}`
  );
  res.json(parkingLots.get(id));
}
