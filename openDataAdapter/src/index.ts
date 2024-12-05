import { ParkingLot } from "./model/model.parKING.types";
import { OpenDataApiResponse } from "./model/model.openData.types";

const opendataApiUrl =
  "https://opendata.comune.bologna.it/api/explore/v2.1/catalog/datasets/disponibilita-parcheggi-vigente/records?limit=20";
const parKingApiUrl = "http:localhost:3000/api/parkingLots";
const parkingLotIds = 1;

var updateFrequency = 5 * 60000;

function loadAndUpdateData() {
  console.log(`getting updated data from openData`);
  fetch(opendataApiUrl)
    .then((res) => res.json())
    .then((json: OpenDataApiResponse) => {
      json.results
        .sort((p1, p2) => {
          return p1.parcheggio.localeCompare(p2.parcheggio);
        })
        .forEach((p, i) => {
          console.log(`updated data from openData: ${JSON.stringify(p)}`);
          console.log(`forwarding updated data to parKING`);
          fetch(parKingApiUrl + "?id=" + i, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: i,
              name: p.parcheggio,
              updateDateTime: Date.parse(p.data),
              totalParkings: p.posti_totali,
              availableParkings: p.posti_liberi,
              occupiedParkings: p.posti_occupati,
              coordinate: {
                latitude: p.coordinate.lat,
                longitude: p.coordinate.lon,
              },
            }),
          }).then(() => console.log(`updated data forwarded to parKING`));
        });
    });
}

loadAndUpdateData();
setInterval(loadAndUpdateData, updateFrequency);
