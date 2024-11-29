import { API } from "./api.types";
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
    "http:192.168.1.2:3000",
    "api/parkingLots"
  )
};


export default APIs;