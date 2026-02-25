'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, Child } from '@/services/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { QrCode, MapPin, User } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DashboardPage() {
  const pathname = usePathname();
  const { token } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api.children
      .list(token)
      .then((r) => setChildren(r.children))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, pathname]);

  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Dashboard</h1>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : children.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
            <User className="mx-auto text-slate-400 mb-4" size={48} />
            <p className="text-slate-600 dark:text-slate-400 mb-4">No children added yet.</p>
            <Link
              href="/children/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
            >
              Add your first child
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {children.map((child) => (
              <div
                key={child._id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 flex items-center gap-4 shadow-sm"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                  {child.photoUrl ? (
                    <Image
                      src={child.photoUrl.startsWith('http') ? child.photoUrl : `${API_URL}${child.photoUrl}`}
                      alt={child.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <User size={28} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {child.name}
                  </h2>
                  <p className="text-sm text-slate-500">Age {child.age}</p>
                  <div className="flex gap-2 mt-2">
                    <Link
                      href={`/children/${child._id}`}
                      className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <QrCode size={14} /> QR & History
                    </Link>
                    <Link
                      href={`/children/${child._id}/map`}
                      className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      <MapPin size={14} /> Map
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            <Link
              href="/children/new"
              className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center p-6 text-slate-500 hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition"
            >
              + Add another child
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
