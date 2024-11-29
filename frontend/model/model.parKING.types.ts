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
  coordinate: Coordinate;
};

export type Boundary={
  center:Coordinate,
  radius:number
}
