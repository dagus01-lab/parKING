/**
 * @fileoverview This module defines TypeScript types for the parKING application.
 * It includes types for geographical coordinates, points of interest,
 * parking lots, and circular boundaries.
 */

/**
 * Represents a geographical coordinate with latitude and longitude.
 *
 * @property {number} latitude - The latitude of the coordinate.
 * @property {number} longitude - The longitude of the coordinate.
 */
export type Coordinate = {
  latitude: number;
  longitude: number;
};

/**
 * Represents a point of interest with a specific coordinate and name.
 *
 * @property {Coordinate} coordinate - The geographical coordinate of the point of interest.
 * @property {string} name - The name of the point of interest.
 */
export type PointOfInterest = {
  coordinate: Coordinate;
  name: string;
};

/**
 * Represents a parking lot with various attributes.
 *
 * @property {number} id - The unique identifier for the parking lot.
 * @property {string} name - The name of the parking lot.
 * @property {number} updateDateTime - The timestamp of the last update.
 * @property {number} totalParkings - The total number of parking spaces in the lot.
 * @property {number} availableParkings - The number of available parking spaces.
 * @property {number} occupiedParkings - The number of occupied parking spaces.
 * @property {Coordinate} coordinate - The geographical coordinates of the parking lot.
 */
export type ParkingLot = {
  id: number;
  name: string;
  updateDateTime: number;
  totalParkings: number;
  availableParkings: number;
  occupiedParkings: number;
  coordinate: Coordinate;
};

/**
 * Represents a circular boundary with a center coordinate and a radius.
 *
 * @property {Coordinate} center - The center point of the circular boundary.
 * @property {number} radius - The radius of the circular boundary.
 */
export type CircularBoundary = {
  center: Coordinate;
  radius: number;
};
