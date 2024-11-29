export type Coordinate = {
    latitude: number,
    longitude: number
}

export class ParkingLot {
    id:number;
    name: string;
    updateDateTime: number;
    totalParkings: number;
    availableParkings: number;
    coordinate: Coordinate;

    constructor(id:number,name: string, coordinate: Coordinate, totalParkingLots: number, availableParkingLots: number, updateDateTime: number) {
        this.id=id;
        this.name = name;
        this.coordinate = coordinate;
        this.totalParkings = totalParkingLots;
        this.availableParkings = availableParkingLots;
        this.updateDateTime = updateDateTime;
    }
}