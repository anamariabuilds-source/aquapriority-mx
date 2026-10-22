"use client";

import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Polygon, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FICTIONAL_SERVICE_ZONES } from "@/data/zones";
import type { Incident } from "@/types/domain";

function FocusSelected({ incident }: { incident: Incident }) {
  const map = useMap();
  useEffect(() => { map.flyTo([...incident.coordinates], 13, { duration: 0.6 }); }, [incident, map]);
  return null;
}

export default function IncidentMap({ incidents, selectedId, onSelect }: { incidents: readonly Incident[]; selectedId: string; onSelect: (id: string) => void }) {
  const [tileFailed, setTileFailed] = useState(false);
  const selected = incidents.find((incident) => incident.id === selectedId) ?? incidents[0];
  return <section className="map-panel" aria-label="Mapa interactivo de incidentes ficticios">
    <div className="map-heading"><div><strong>Mapa interactivo</strong><small>Coordenadas y zonas completamente ficticias</small></div><span>{incidents.length} marcadores</span></div>
    {tileFailed && <div className="map-fallback" role="alert">El mapa base no está disponible. La lista accesible permanece funcional.</div>}
    <div className="map-frame" data-testid="incident-map">
      <MapContainer center={[...selected.coordinates]} zoom={12} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{ tileerror: () => setTileFailed(true), load: () => setTileFailed(false) }} />
        {FICTIONAL_SERVICE_ZONES.map((zone) => <Polygon key={zone.name} positions={zone.positions} pathOptions={{ color: zone.color, fillOpacity: 0.09, weight: 2 }}><Popup>{zone.name}<br />No representa cobertura real.</Popup></Polygon>)}
        {incidents.map((incident) => <CircleMarker key={incident.id} center={[...incident.coordinates]} radius={incident.id === selectedId ? 11 : 8} pathOptions={{ color: incident.id === selectedId ? "#082642" : "#087fa5", fillColor: incident.id === selectedId ? "#29c7df" : "#ffffff", fillOpacity: 1, weight: 3 }} eventHandlers={{ click: () => onSelect(incident.id) }}><Popup><strong>{incident.id}</strong><br />{incident.locationLabel}<br />CASO FICTICIO</Popup></CircleMarker>)}
        <FocusSelected incident={selected} />
      </MapContainer>
    </div>
    <div className="map-accessible-list" aria-label="Selección accesible sin mapa">{incidents.map((incident) => <button type="button" key={incident.id} aria-pressed={incident.id === selectedId} onClick={() => onSelect(incident.id)}>{incident.sheetRow}. {incident.id}</button>)}</div>
  </section>;
}
