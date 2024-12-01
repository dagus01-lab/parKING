import { APIParameter } from "../apis/api.types";
import APIs from "../apis/APIs.data";
import {
  ParkingLot,
  CircularBoundary,
} from "../model/model.parKING.types";

export async function searchParkingLots(
  boundary: CircularBoundary,
  maxResults: number
): Promise<ParkingLot[]> {
  const apiParameters = [
    new APIParameter(
      "boundary.center.latitude",
      boundary.center.latitude.toString()
    ),
    new APIParameter(
      "boundary.center.longitude",
      boundary.center.longitude.toString()
    ),
    new APIParameter("boundary.radius", boundary.radius.toString()),
    new APIParameter("maxResults", maxResults.toString()),
  ];

  return APIs["parkingLots/search"]
    .fetch(apiParameters)
    ?.then((res) => res.json());
}
