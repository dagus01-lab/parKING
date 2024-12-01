import { APIParameter } from "../apis/api.types";
import APIs from "../apis/APIs.data";
import searchZone from "../data/searchZone.const";
import { PointOfInterest } from "../model/model.parKING.types";

export async function searchLocationMarkers(
  searchText: string
): Promise<PointOfInterest[]> {
  const apiParameters = [
    new APIParameter("text", searchText),
    new APIParameter(
      "boundary.circle.lat",
      searchZone.center.latitude.toString()
    ),
    new APIParameter(
      "boundary.circle.lon",
      searchZone.center.longitude.toString()
    ),
    new APIParameter(
      "boundary.circle.radius",
      (searchZone.radius / 1000).toString()
    ),
  ];
  return APIs["geocode/search"]
    .fetch(apiParameters)
    ?.then((res) => res.json())
    .then((json) => {
      return json.features.map(
        (f: {
          geometry: { coordinates: number[] };
          properties: { name: string };
        }) => {
          return {
            name: f.properties.name,
            coordinate: {
              latitude: f.geometry.coordinates[1],
              longitude: f.geometry.coordinates[0],
            },
          };
        }
      );
    });
}
