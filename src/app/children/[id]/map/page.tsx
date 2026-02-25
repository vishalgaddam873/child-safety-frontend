'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api, Child, ScanLog } from '@/services/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MapView } from '@/components/MapView';
import { ArrowLeft } from 'lucide-react';

export default function ChildMapPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useAuth();
  const [child, setChild] = useState<Child | null>(null);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !id) return;
    api.children
      .get(token, id)
      .then((r) => setChild(r.child))
      .catch((e) => setError(e.message));
    api.scan
      .history(token, id, { limit: 100 })
      .then((r) => setLogs(r.logs))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [token, id]);

  return (
    <ProtectedRoute>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <Link
            href={`/children/${id}`}
            className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:underline"
          >
            <ArrowLeft size={16} /> Back to {child?.name || 'child'}
          </Link>
        </div>
        {error && (
          <div className="mb-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 min-h-[300px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
            </div>
          ) : (
            <MapView logs={logs} />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
