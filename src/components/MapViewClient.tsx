'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { ScanLog } from '@/services/api';

// Fix default marker icons in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function MapViewClient({ logs }: { logs: ScanLog[] }) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const map = L.map(containerRef.current).setView([20.5937, 78.9629], 5); // India center
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !logs.length) return;

    const group = L.layerGroup().addTo(map);
    const bounds = new L.LatLngBounds(
      logs.map((l) => [l.latitude, l.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });

    logs.forEach((log) => {
      L.marker([log.latitude, log.longitude], { icon })
        .addTo(group)
        .bindPopup(
          `<div class="text-sm">
            <strong>${new Date(log.timestamp).toLocaleString()}</strong><br/>
            ${log.message ? `<span class="${log.message.toLowerCase().includes('danger') ? 'font-bold text-red-600' : ''}">${log.message}</span><br/>` : ''}
            Accuracy: ${log.accuracy != null ? log.accuracy + ' m' : '—'}
          </div>`
        );
    });

    const sorted = [...logs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const path = sorted.map((l) => [l.latitude, l.longitude] as [number, number]);
    if (path.length >= 2) {
      L.polyline(path, { color: '#0ea5e9', weight: 3, opacity: 0.7 }).addTo(group);
    }

    return () => {
      map.removeLayer(group);
    };
  }, [logs]);

  return <div ref={containerRef} className="w-full h-full" />;
}
