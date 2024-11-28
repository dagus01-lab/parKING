import { API } from "../types/apiTypes";
import tokens from "./tokens";

const APIs = {
  "geocode/search": new API(
    "GET",
    "https://api.openrouteservice.org",
    "geocode/search",
    tokens.OPEN_ROUTE_SERVICE_TOKEN
  ),
  "parkingLots/search": new API(
    "GET",
    "http:localhost:3000",
    "api/parkingLots"
  )
};


export default APIs;