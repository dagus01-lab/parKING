/**
 * @fileoverview Entry point for the parKING backend application.
 * Initializes and configures the Express application, sets up middleware,
 * and defines the routes for handling parking lot operations.
 */

import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import {
  getParkingLots,
  putParkingLots,
} from "./controller/controller.parKING.func";

const app: Application = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/api/parkingLots/", getParkingLots);
app.put("/api/parkingLots/", putParkingLots);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
