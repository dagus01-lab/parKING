import { ParkingLot } from "../model/model.parKING.types";
import { Request } from "express";

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

export type PutParkingLotsRequest = Request<
  {},
  {},
  ParkingLot,
  {
    id: string;
  }
>;
