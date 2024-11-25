import { SearchInfo, sanitize_search_info, ValidationError } from "../types/search"
export const api_base_url = 'https://opendata.comune.bologna.it/api/explore/v2.1/catalog/datasets/disponibilita-parcheggi-vigente/records?'
export const field = 'coordinate'
const default_distance = 5
const default_limit = 20
const distance_limit = 400

const build_distance_filter = (info: SearchInfo): string => {
    try{
      let info_sanitized = sanitize_search_info(info)
      return `within_distance(${field}, geom'POINT(${info_sanitized.longitude} ${info_sanitized.latitude})', ${info_sanitized.distance}km)`;
    } catch(e){
      if (e instanceof ValidationError){
        throw e
      } else{
        throw new Error("Unexpected error: "+String(e));
      }
      
    }
};
export const build_api_url = (info: SearchInfo): string => {
  try{
      const params = new URLSearchParams({
          where: build_distance_filter(info),
          limit: String(info.limit),
        });
        return `${api_base_url}${params.toString()}`;
  }
  catch(e){
    if (e instanceof ValidationError){
      throw e
    } else{
      throw new Error("Unexpected error: "+String(e));
    }
  }  
}