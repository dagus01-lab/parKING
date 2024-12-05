import { Request, Response } from "express";
import {
  CircularBoundary,
  Coordinate,
  ParkingLot,
} from "../model/model.parKING.types";
import {
  GetParkingLotsRequest,
  PutParkingLotsRequest,
} from "../api/api.parkingLots.types";
import { from } from "ix/iterable";
import { filter, take } from "ix/iterable/operators";
import { computeDistanceBetween } from "spherical-geometry-js";
import { LatLng } from "spherical-geometry-js";
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
      availableParkings: 152,
      occupiedParkings: 113,
      updateDateTime: 1733413140000,
    },
  ],
  [
    1,
    {
      id: 1,
      name: "Riva Reno",
      coordinate: { latitude: 44.501153, longitude: 11.336062 },
      totalParkings: 470,
      availableParkings: 253,
      occupiedParkings: 217,
      updateDateTime: 1733413140000,
    },
  ],
  [
    2,
    {
      id: 2,
      name: "VIII Agosto",
      coordinate: { latitude: 44.500297, longitude: 11.345368 },
      totalParkings: 625,
      availableParkings: 129,
      occupiedParkings: 496,
      updateDateTime: 1733413140000,
    },
  ],
]);

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in m)
function calcCrowMeters(p1: Coordinate, p2: Coordinate) {
  var R = 6371; // km
  var dLat = toRad(p2.latitude - p1.latitude);
  var dLon = toRad(p2.longitude - p1.longitude);
  var lat1 = toRad(p1.latitude);
  var lat2 = toRad(p2.latitude);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d * 1000;
}

function isInBoundary(point: Coordinate, boundary: CircularBoundary) {
  var km = boundary.radius / 1000;
  var kx = Math.cos((Math.PI * boundary.center.latitude) / 180) * 111;
  var dx = Math.abs(boundary.center.longitude - point.longitude) * kx;
  var dy = Math.abs(boundary.center.latitude - point.latitude) * 111;
  console.log("distance: " + Math.sqrt(dx * dx + dy * dy).toString());
  return Math.sqrt(dx * dx + dy * dy) <= km;
}

// Converts numeric degrees to radians
function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function min(n1: number, n2: number) {
  return n1 < n2 ? n1 : n2;
}

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

export function putParkingLots(req: PutParkingLotsRequest, res: Response) {
  const id = Number.parseInt(req.query["id"]);
  const oldValue = parkingLots.get(id);
  parkingLots.set(id, req.body);
  console.log(
    `put request for parking lot with id:${id}\nold value:${JSON.stringify(
      oldValue
    )}\nnew value:${JSON.stringify(req.body)}`
  );
  res.json(req.body);
}
