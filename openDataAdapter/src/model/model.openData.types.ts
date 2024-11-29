export type OpenDataApiResponse = {
    total_count: number,
    results: OpenDataAPIParking[]
}

export type OpenDataAPIParking = {
    parcheggio: string,
    data: string,
    posti_liberi: number,
    posti_occupati: number,
    posti_totali: number,
    occupazione: number,
    guid: string,
    coordinate: OpenDataAPICoordinate
}

export type OpenDataAPICoordinate = {
    lon: number,
    lat: number
}