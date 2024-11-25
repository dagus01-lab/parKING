export type SearchInfo = {
    distance: number,
    longitude: number,
    latitude: number,
    limit: number
}
export type ApiResponse = {
    total_count: number,
    results: Map<number, Parking>
}
export type Parking = {
    parcheggio: string,
    data: string,
    posti_liberi: number,
    posti_occupati: number,
    posti_totali: number,
    occupazione:  number,
    guid: string,
    coordinate: Coordinate
}
export type Coordinate = {
    lon: number,
    lat: number
}
