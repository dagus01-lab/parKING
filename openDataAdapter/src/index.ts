import { ParkingLot } from "./model/model.parKING.types";
import { OpenDataApiResponse } from "./model/model.openData.types";

const opendataApiUrl =
  "https://opendata.comune.bologna.it/api/explore/v2.1/catalog/datasets/disponibilita-parcheggi-vigente/records?where=parcheggio%3D%22Riva%20Reno%22&limit=20";
const parKingApiUrl = "http:localhost:3000/api/parkingLots";
const parkingLotId = 1;

var updateFrequency = 5 * 60000;

function loadAndUpdateData() {
  console.log(`getting updated data from openData`);
  fetch(opendataApiUrl)
    .then((res) => res.json())
    .then((json: OpenDataApiResponse) => {
      const p = json.results[0];
      console.log(`updated data from openData: ${JSON.stringify(p)}`);
      console.log(`forwarding updated data to parKING`);
      fetch(parKingApiUrl + "?id=" + parkingLotId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: parkingLotId,
          name: p.parcheggio,
          coordinate: {
            latitude: p.coordinate.lat,
            longitude: p.coordinate.lon,
          },
          totalParkings: p.posti_totali,
          availableParkings: p.posti_liberi,
          date: Date.parse(p.data),
        }),
      }).then(() => console.log(`updated data forwarded to parKING`));
    });
}

loadAndUpdateData();
setInterval(loadAndUpdateData, updateFrequency);
