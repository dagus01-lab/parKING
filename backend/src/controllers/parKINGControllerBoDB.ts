import { create } from 'domain';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
const api_base_url = 'https://opendata.comune.bologna.it/api/explore/v2.1/catalog/datasets/disponibilita-parcheggi-vigente/records?'
var distance_filter = 'where=within_distance(FIELD%2C%20geom%27POINT(LONGITUDE%20LATITUDE)%27%2C%20DISTANCEkm)&limit=LIMIT'
const field = 'coordinate'
const default_distance = 5
const default_limit = 20

type SearchInfo = {
    distance: number,
    longitude: number,
    latitude: number,
    limit: number
}
type ApiResponse = {
    total_count: number,
    results: Map<number, Parking>
}
type Parking = {
    parcheggio: string,
    data: string,
    posti_liberi: number,
    posti_occupati: number,
    posti_totali: number,
    occupazione:  number,
    guid: string,
    coordinate: Coordinate
}
type Coordinate = {
    lon: number,
    lat: number
}

export const build_api_url = (info: SearchInfo): string => {
    return api_base_url+distance_filter.replace("FIELD", field)
            .replace("DISTANCE", String(info.distance))
            .replace("LIMIT", String(info.limit))
            .replace("LONGITUDE", String(info.longitude))
            .replace("LATITUDE", String(info.latitude));
        
}
export const create_search_info_from_body = (body: string): SearchInfo => {
    return JSON.parse(body);
}   
export const fetch_api =  async (api_url: string) : Promise<string | ApiResponse> => {
    try {
        // 👇️ const response: Response
        const response = await fetch(api_url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
        });

        if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
        }

        const result = (await response.json()) as ApiResponse;
        
        console.log('result is: ', JSON.stringify(result, null, 4));

        return result;
    } catch (error) {
        if (error instanceof Error) {
        console.log('error message: ', error.message);
        return error.message;
        } else {
        console.log('unexpected error: ', error);
        return 'An unexpected error occurred';
        }
    }
}
export const getAllParkingSpots = (req: Request, res: Response): void => {
  var info = req.body;
  var api_url = build_api_url(info);
  console.log(api_url)
  fetch_api(api_url).then(
    (response)=>{
        if(typeof(response) == "string"){
            res.status(502).send(response)
        } else /*if(typeof(response) == "ApiResponse")*/{
            res.status(200).json(response);
        }
    }
  );
};