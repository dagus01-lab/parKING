import { Request, Response } from 'express';
import {SearchInfo, ApiResponse, ValidationError} from '../types/search';
import {build_api_url} from '../utils/unibodbinteraction';
import fetch from 'node-fetch';

export const create_search_info_from_body = (body: string): SearchInfo => {
    return JSON.parse(body);
}   
export const fetch_api =  async (api_url: string) : Promise<string | ApiResponse> => {
    try {
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
        throw error
    }
}
export const getAllParkingSpots = async (req: Request, res: Response): Promise<void> => {
  var info = req.body;
  try{
    var api_url = build_api_url(info);
    console.log(api_url)
    let response = await fetch_api(api_url)
    res.status(200).json(response);

  }catch(error){
    if (error instanceof ValidationError) {
        console.log('error message: ', error.message);
        res.status(502).send(error.message);
    } else {
        console.log('unexpected error: ', error);
        res.status(500).send('An unexpected error occurred');
    }
  }
};