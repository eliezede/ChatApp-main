import { LocationClient, SearchPlaceIndexForTextCommand, SearchPlaceIndexForSuggestionsCommand, GetPlaceCommand } from "@aws-sdk/client-location";
import { withAPIKey } from "@aws/amazon-location-utilities-auth-helper";

const API_KEY = import.meta.env.VITE_AWS_LOCATION_API_KEY;
const REGION = import.meta.env.VITE_AWS_LOCATION_REGION;
const INDEX_NAME = import.meta.env.VITE_AWS_PLACE_INDEX;

export interface UkAddress {
  line1: string;
  line2: string;
  townOrCity: string;
  county: string;
  postcode: string;
  lat: number;
  lng: number;
  formattedAddress: string;
  street?: string;
  houseNumber?: string;
}

// Cache the client configuration to avoid re-generating auth headers
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

export const AddressService = {
  findAddresses: async (text: string): Promise<UkAddress[]> => {
    if (!text || text.trim().length < 3) return [];

    try {
      const client = await getClient();
      const command = new SearchPlaceIndexForTextCommand({
        IndexName: INDEX_NAME,
        Text: text,
        FilterCountries: ["GBR"], 
        MaxResults: 10,
      });

      const response = await client.send(command);
      
      return (response.Results || []).map((result: any) => mapAwsPlaceToUkAddress(result.Place));
    } catch (error) {
      console.error('AWS Address Lookup Error:', error);
      throw error;
    }
  },

  findSuggestions: async (text: string): Promise<{ text: string; placeId: string }[]> => {
    if (!text || text.trim().length < 3) return [];

    try {
      const client = await getClient();
      const command = new SearchPlaceIndexForSuggestionsCommand({
        IndexName: INDEX_NAME,
        Text: text,
        FilterCountries: ["GBR"],
        MaxResults: 10,
      });

      const response = await client.send(command);
      return (response.Results || []).map((res: any) => ({
        text: res.Text,
        placeId: res.PlaceId
      }));
    } catch (error) {
      console.error('AWS Suggestions Error:', error);
      return [];
    }
  },

  getPlaceDetails: async (placeId: string): Promise<UkAddress> => {
    try {
      const client = await getClient();
      const command = new GetPlaceCommand({
        IndexName: INDEX_NAME,
        PlaceId: placeId,
      });

      const response = await client.send(command);
      if (!response.Place) throw new Error('Place not found');
      
      return mapAwsPlaceToUkAddress(response.Place);
    } catch (error) {
      console.error('AWS GetPlace Error:', error);
      throw error;
    }
  }
};

function mapAwsPlaceToUkAddress(place: any): UkAddress {
  const [lng, lat] = place.Geometry.Point;
  
  // AWS provides address parts in different fields depending on the data provider
  return {
    line1: place.AddressNumber ? `${place.AddressNumber} ${place.Street || ''}` : (place.Street || place.Label.split(',')[0]),
    line2: place.Neighborhood || place.SubRegion || '',
    townOrCity: place.Municipality || '',
    county: place.Region || '',
    postcode: place.PostalCode || '',
    lat,
    lng,
    formattedAddress: place.Label || '',
    street: place.Street || '',
    houseNumber: place.AddressNumber || ''
  };
}
