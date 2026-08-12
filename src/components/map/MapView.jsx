import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

export default function MapView({ markers = [], center = [18.5204, 73.8567], zoom = 12 }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersGroupRef = useRef(null);
  const navigate = useNavigate();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false, // Custom positioning or default top-right
      attributionControl: true
    }).setView(center, zoom);

    mapRef.current = map;

    // CartoDB Positron tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Zoom control at top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);

    // Create marker group
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    // Clear existing markers
    markersGroupRef.current.clearLayers();

    // Add new markers
    markers.forEach(m => {
      if (!m.coordinates || m.coordinates.length !== 2) return;

      const [lat, lng] = m.coordinates;
      let className = '';
      let popupContent = '';

      if (m.type === 'agency') {
        // Status: AVAILABLE, LIMITED, DEPLOYED, OFFLINE
        const status = m.status || 'AVAILABLE';
        if (status === 'AVAILABLE') className = 'marker-available';
        else if (status === 'LIMITED') className = 'marker-limited';
        else className = 'marker-deployed';

        popupContent = `
          <div class="p-2 min-w-[200px]">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-semibold text-stone-500 uppercase">${m.agencyType || m.type}</span>
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-${status === 'AVAILABLE' ? 'available' : status === 'LIMITED' ? 'limited' : 'deployed'}"></span>
            </div>
            <h4 class="text-sm font-bold text-stone-900 mb-1">${m.name}</h4>
            <p class="text-xs text-stone-600 mb-2">${m.district}, ${m.state}</p>
            <div class="grid grid-cols-2 gap-1 mb-3 text-[10px] text-stone-500">
              <div>Boats: <span class="text-stone-900 font-medium">${m.resources?.boats?.available || 0}</span></div>
              <div>Personnel: <span class="text-stone-900 font-medium">${m.resources?.personnel?.available || 0}</span></div>
              <div>Vehicles: <span class="text-stone-900 font-medium">${m.resources?.rescueVehicles?.available || 0}</span></div>
              <div>Drones: <span class="text-stone-900 font-medium">${m.resources?.drones?.available || 0}</span></div>
            </div>
            <button 
              id="btn-map-agency-${m.id}"
              class="w-full text-center bg-white hover:bg-stone-50 border border-stone-300 hover:border-teal-500 text-teal-700 text-xs font-semibold py-1.5 px-3 rounded transition-colors"
            >
              View Agency Profile
            </button>
          </div>
        `;
      } else if (m.type === 'incident') {
        // Severity: CRITICAL, HIGH, MEDIUM, LOW
        const severity = m.severity || 'HIGH';
        className = 'marker-incident';
        if (severity === 'CRITICAL') className += ' pulse-critical';

        const severityColors = {
          CRITICAL: 'text-critical',
          HIGH: 'text-high',
          MEDIUM: 'text-medium',
          LOW: 'text-low'
        };

        popupContent = `
          <div class="p-2 min-w-[200px]">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-semibold ${severityColors[severity] || 'text-stone-500'} uppercase font-mono">${severity}</span>
              <span class="text-[10px] text-stone-500">${m.time || 'Active'}</span>
            </div>
            <h4 class="text-sm font-bold text-stone-900 mb-1">${m.incidentType || m.name} — ${m.location}</h4>
            <p class="text-xs text-stone-600 mb-3">${m.description || ''}</p>
            <button 
              id="btn-map-incident-${m.id}"
              class="w-full text-center bg-white hover:bg-stone-50 border border-stone-300 hover:border-teal-500 text-teal-700 text-xs font-semibold py-1.5 px-3 rounded transition-colors"
            >
              Incident Command Centre
            </button>
          </div>
        `;
      }

      // Create Custom Marker Icon
      const icon = L.divIcon({
        className: 'custom-marker-icon',
        html: `<div class="${className}"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      // Add to group
      const marker = L.marker([lat, lng], { icon }).addTo(markersGroupRef.current);
      marker.bindPopup(popupContent);

      // Handle popup open to bind navigation click handlers
      marker.on('popupopen', () => {
        const agencyBtn = document.getElementById(`btn-map-agency-${m.id}`);
        const incidentBtn = document.getElementById(`btn-map-incident-${m.id}`);
        
        if (agencyBtn) {
          agencyBtn.onclick = () => {
            map.closePopup();
            navigate(`/agencies/${m.id}`);
          };
        }
        if (incidentBtn) {
          incidentBtn.onclick = () => {
            map.closePopup();
            navigate(`/incidents/${m.id}`);
          };
        }
      });
    });
  }, [markers]);

  return (
    <div className="w-full h-full relative border border-stone-200 rounded-lg overflow-hidden bg-stone-100">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
