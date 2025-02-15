export type Coordinate = {
  latitude: number;
  longitude: number;
};

export type PointOfInterest = {
  coordinate: Coordinate;
  name: string;
};

export type ParkingLot = {
  id: number;
  name: string;
  updateDateTime: number;
  totalParkings: number;
  availableParkings: number;
  occupiedParkings:number;
  coordinate: Coordinate;
};

export type CircularBoundary = {
  center: Coordinate,
  radius: number
}
