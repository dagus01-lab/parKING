import { API } from "../types/apiTypes";
import tokens from "./tokens";

const apis = {
  "geocode/search": new API(
    "GET",
    "https://api.openrouteservice.org",
    "geocode/search",
    tokens.OPEN_ROUTE_SERVICE_TOKEN
  ),
};

export default apis;