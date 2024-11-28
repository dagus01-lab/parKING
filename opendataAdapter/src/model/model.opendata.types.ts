export type OpendataApiResponse = {
    total_count: number,
    results: OpendataAPIParking[]
}

export type OpendataAPIParking = {
    parcheggio: string,
    data: string,
    posti_liberi: number,
    posti_occupati: number,
    posti_totali: number,
    occupazione: number,
    guid: string,
    coordinate: OpendataAPICoordinate
}

export type OpendataAPICoordinate = {
    lon: number,
    lat: number
}