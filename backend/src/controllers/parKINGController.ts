import { Request, Response } from 'express';

//Mock data
const parkingSpots = [
  { id: '1', name: 'Ranzani', lat:44.5020087, lng: 11.3558283, availableSlots: 10 },
  { id: '2', name: 'Saragozza', lat: 44.4908458, lng: 11.3276411, availableSlots: 5 },
  { id: '3', name: 'Meloncello', lat: 44.4909507, lng: 11.3072836, availableSlots: 20 },
];

export const getAllParkingSpots = (req: Request, res: Response): void => {
  res.status(200).json(parkingSpots);
};
