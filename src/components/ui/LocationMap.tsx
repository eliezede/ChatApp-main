import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { withAPIKey } from '@aws/amazon-location-utilities-auth-helper';

const API_KEY = import.meta.env.VITE_AWS_MAP_API_KEY;
const REGION = import.meta.env.VITE_AWS_LOCATION_REGION;
const MAP_NAME = import.meta.env.VITE_AWS_MAP_NAME;

interface LocationMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: { lat: number; lng: number; label?: string; color?: string }[];
  className?: string;
  height?: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  center,
  zoom = 13,
  markers = [],
  className = "",
  height = "300px"
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initMap = async () => {
      // Clear existing map if any
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      try {
        const map = new maplibregl.Map({
          container: mapContainerRef.current!,
          style: `https://maps.geo.${REGION}.amazonaws.com/maps/v0/maps/${MAP_NAME}/style-descriptor?key=${API_KEY}`,
          center: [center.lng, center.lat],
          zoom: zoom,
        });

        // Add navigation controls
        map.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Add markers
        markers.forEach(marker => {
          new maplibregl.Marker({
            color: marker.color || "#3b82f6"
          })
            .setLngLat([marker.lng, marker.lat])
            .setPopup(marker.label ? new maplibregl.Popup().setHTML(`<p class="text-xs font-bold">${marker.label}</p>`) : undefined)
            .addTo(map);
        });

        mapRef.current = map;
      } catch (error) {
        console.error("Error initializing AWS Map:", error);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center.lat, center.lng, markers, zoom]);

  return (
    <div 
      ref={mapContainerRef} 
      className={`rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner ${className}`}
      style={{ width: '100%', height }}
    />
  );
};
