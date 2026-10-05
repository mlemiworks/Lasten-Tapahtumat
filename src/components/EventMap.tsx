'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PIN_ICON = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Disables all interaction after the map mounts — this is a display-only component.
// react-leaflet doesn't expose these as props on <MapContainer>, so we reach into
// the map instance directly via useMap().
function DisableInteraction() {
  const map = useMap();
  useEffect(() => {
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.scrollWheelZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
  }, [map]);
  return null;
}

export default function EventMap({
  lat,
  lng,
  locationName,
}: {
  lat: number;
  lng: number;
  locationName: string;
}) {
  return (
    <div
      data-testid="event-map"
      className="h-48 rounded-lg overflow-hidden border border-border"
    >
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <DisableInteraction />
        <Marker position={[lat, lng]} icon={PIN_ICON}>
          <Popup>{locationName}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
