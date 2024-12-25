# ParKING backend
App that helps users find available parking slots in the city centre.
## Deployment
### Prerequisites
1. Ensure you have [Node.js](https://nodejs.org/) installed and up-to-date.
2. Install dependencies: ```npm install```
### Run the application
The backend is built using Node.js and can be run in different modes:
- Development Mode: Start the application with live reload for easier development: ```npm run dev```
- Production Mode: Build and start the application for production:
```
npm run build
npm run start
```
## Structure
The backend exposes two REST API endpoints:

- **[GET] /api/parkingLots**: this API is used by the frontend to retrieve a list of parking lots within a specified boundary. The following query parameters must be provided:

  - `boundary.center.latitude` (string): The latitude of the center of the boundary.
  - `boundary.center.longitude` (string): The longitude of the center of the boundary.
  - `boundary.radius` (string): The radius of the boundary in meters.
  - `maxResults` (string): The maximum number of parking lots to return.

  It returns a JSON answer containg a list of ParkingLots, where each ParkingLot has the following format:

  ```ts
  type ParkingLot = {
    id: number;
    name: string;
    updateDateTime: number;
    totalParkings: number;
    availableParkings: number;
    occupiedParkings: number;
    coordinate: Coordinate;
  };

  type Coordinate = {
    latitude: number;
    longitude: number;
  };
  ```

- **[PUT] /api/parkingLots**: Update the information for a specific parking lot. This endpoint is used by sensors and adapters. The following query parameter must be provided:

  - `id` (string): The id of the parking lot to update.

  The request body must contain the ParkingLot updated info in the following JSON format:

  ```ts
  type ParkingLot = {
    id: number;
    name: string;
    updateDateTime: number;
    totalParkings: number;
    availableParkings: number;
    occupiedParkings: number;
    coordinate: Coordinate;
  };
  type Coordinate = {
    latitude: number;
    longitude: number;
  };
  ```