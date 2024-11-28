import { Coordinate, ParkingLot } from "../model/model.types"
import { Request, Response } from "express"


export type GetParkingLotsRequest = Request<{}, {}, {}, {
    "boundary.center.latitude":string,
    "boundary.center.longitude":string,
    "boundary.radius":string,
    "maxResults":string
}>




export type PostParkingLotsRequest = Request<{}, {}, ParkingLot, {
    "id": string
}>