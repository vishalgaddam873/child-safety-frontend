'use client';

import dynamic from 'next/dynamic';
import type { ScanLog } from '@/services/api';

const MapViewClient = dynamic(() => import('./MapViewClient').then((m) => m.MapViewClient), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500">
      Loading map…
    </div>
  ),
});

export function MapView({ logs }: { logs: ScanLog[] }) {
  return (
    <div className="w-full h-full">
      <MapViewClient logs={logs} />
    </div>
  );
}
