import { LocationClient, CalculateRouteCommand, CalculateRouteMatrixCommand } from "@aws-sdk/client-location";
import { withAPIKey } from "@aws/amazon-location-utilities-auth-helper";

const API_KEY = import.meta.env.VITE_AWS_LOCATION_API_KEY;
const REGION = import.meta.env.VITE_AWS_LOCATION_REGION;
const CALCULATOR_NAME = import.meta.env.VITE_AWS_ROUTE_CALCULATOR;

let cachedClient: LocationClient | null = null;

async function getClient() {
  if (cachedClient) return cachedClient;

  const authHelper = await withAPIKey(API_KEY, REGION);
  cachedClient = new LocationClient({
    region: REGION,
    ...authHelper.getLocationClientConfig(),
  });
  return cachedClient;
}

export const LocationService = {
  /**
   * Calculates driving distance and duration between two coordinates
   */
  calculateRoute: async (
    origin: { lat: number, lng: number },
    destination: { lat: number, lng: number }
  ) => {
    try {
      const client = await getClient();
      const command = new CalculateRouteCommand({
        CalculatorName: CALCULATOR_NAME,
        DeparturePosition: [origin.lng, origin.lat],
        DestinationPosition: [destination.lng, destination.lat],
        TravelMode: "Car",
        DistanceUnit: "Miles", // Use Miles for UK
      });

      const response = await client.send(command);
      
      if (response.Summary) {
        return {
          distance: response.Summary.Distance || 0,
          duration: response.Summary.DurationSeconds || 0,
          unit: "Miles"
        };
      }
      return null;
    } catch (error) {
      console.error('AWS Route Calculation Error:', error);
      throw error;
    }
  },

  /**
   * Calculates distance matrix between multiple origins and one destination
   */
  calculateMatrix: async (
    origins: { id: string, lat: number, lng: number }[],
    destination: { lat: number, lng: number }
  ) => {
    if (origins.length === 0) return {};
    
    try {
      const client = await getClient();
      const command = new CalculateRouteMatrixCommand({
        CalculatorName: CALCULATOR_NAME,
        DeparturePositions: origins.map(o => [o.lng, o.lat]),
        DestinationPositions: [[destination.lng, destination.lat]],
        TravelMode: "Car",
        DistanceUnit: "Miles",
      });

      const response = await client.send(command);
      const distances: Record<string, { distance: number, duration: number }> = {};
      
      if (response.RouteMatrix && response.RouteMatrix[0]) {
          // Note: DestinationPositions is an array, so RouteMatrix[i][j] where i is origin and j is destination
          response.RouteMatrix.forEach((rows, originIndex) => {
              const result = rows[0]; // Since we only have one destination
              if (result && result.Distance !== undefined) {
                  distances[origins[originIndex].id] = {
                      distance: result.Distance,
                      duration: result.DurationSeconds || 0
                  };
              }
          });
      }
      
      return distances;
    } catch (error) {
      console.error('AWS Matrix Calculation Error:', error);
      return {};
    }
  }
};
