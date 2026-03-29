/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GETADDRESS_API_KEY: string;
  readonly VITE_AWS_LOCATION_API_KEY: string;
  readonly VITE_AWS_MAP_API_KEY: string;
  readonly VITE_AWS_LOCATION_REGION: string;
  readonly VITE_AWS_PLACE_INDEX: string;
  readonly VITE_AWS_MAP_NAME: string;
  readonly VITE_AWS_ROUTE_CALCULATOR: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
