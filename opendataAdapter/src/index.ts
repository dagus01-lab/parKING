import { ParkingLot } from "./model/model.types";
import { OpendataApiResponse } from "./model/model.opendata.types";
import { WebSocket } from "ws";

const opendataApiUrl = "https://opendata.comune.bologna.it/api/explore/v2.1/catalog/datasets/disponibilita-parcheggi-vigente/records?/api/explore/v2.1/catalog/datasets/disponibilita-parcheggi-vigente/records?where=parcheggio%3D%22Riva%20Reno%22&limit=20"
const parKingApiUrl = "http:localhost:3000/api/parkingLots"
const parkingLotId = 1;

var updateFrequency = 5000;

setInterval(() => {
  console.log(`getting updated data from opendata`)
  fetch(opendataApiUrl).then((res) => res.json()).then((json: OpendataApiResponse) => {
    const p = json.results[0];
    console.log(`updated data from opendata: ${JSON.stringify(p)}`)
    console.log(`forwarding updated data to parKING`)
    fetch(parKingApiUrl + "?id=" + parkingLotId, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(new ParkingLot(parkingLotId, p.parcheggio, { latitude: p.coordinate.lat, longitude: p.coordinate.lon }, p.posti_totali, p.posti_liberi, Date.parse(p.data)))
    }
    ).then(()=>console.log(`updated data forwarded to parKING`))
  })
}, updateFrequency);