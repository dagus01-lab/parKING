import { Request, Response } from "express";
import { Coordinate, ParkingLot } from "../model/model.parKING.types";
import {
  GetParkingLotsRequest,
  PutParkingLotsRequest,
} from "../api/api.parkingLots.types";
import { from } from "ix/iterable";
import { filter, take } from "ix/iterable/operators";

const DEFAULT_MAX_RESULTS = 10;

const parkingLots = new Map<number, ParkingLot>([
  [
    1,
    new ParkingLot(
      1,
      "Riva Reno",
      { latitude: 44.504422, longitude: 11.346514 },
      470,
      470,
      1732451330349
    ),
  ],
]);

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(p1: Coordinate, p2: Coordinate) {
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
  return d;
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
        return calcCrow(boundary.center, pl.coordinate) < boundary.radius;
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
