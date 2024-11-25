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
export class ValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ValidationError";  
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, ValidationError);
      }
    }
  }
export const sanitize_search_info = (info: SearchInfo): SearchInfo => {
      if(info.distance<0){
        throw new ValidationError("Distance must be a positive number!")
      }
      else if(info.latitude<0){
        throw new ValidationError("Latitude must be a positive number!")
      }
      else if(info.longitude<0){
        throw new ValidationError("Longitude must be a positive number!")
      }
      else if(info.limit<0){
        throw new ValidationError("Limit must be a positive number!")
      }
      else{
        return info
      }
  }
