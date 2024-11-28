import express, { Application } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { getParkingLots, putParkingLots } from './controller/parKINGMapController.func';


const app: Application = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// app.use('/api/parkings', parkingRoutes);

app.get("/api/parkingLots/",getParkingLots)
app.put("/api/parkingLots/",putParkingLots)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
