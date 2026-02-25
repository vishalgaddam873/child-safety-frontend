'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { api, Child, ScanLog } from '@/services/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { QRCodeSVG } from 'qrcode.react';
import { Download, MapPin, ArrowLeft } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ChildDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { token } = useAuth();
  const { lastScan } = useSocket();
  const [child, setChild] = useState<Child | null>(null);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prevLastScanId = useRef<string | null>(null);

  const fetchData = () => {
    if (!token || !id) return;
    Promise.all([
      api.children.get(token, id),
      api.scan.history(token, id, { limit: 20 }),
    ])
      .then(([childRes, scanRes]) => {
        setChild(childRes.child);
        setLogs(scanRes.logs);
        setTotal(scanRes.total);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!token || !id) return;
    setLoading(true);
    fetchData();
  }, [token, id]);

  // Refetch scan history when a new scan arrives for this child (real-time update)
  useEffect(() => {
    if (!lastScan || lastScan.childId !== id) return;
    if (prevLastScanId.current === lastScan.log._id) return;
    prevLastScanId.current = lastScan.log._id;
    if (!token) return;
    api.scan.history(token, id, { limit: 20 }).then((r) => {
      setLogs(r.logs);
      setTotal(r.total);
    });
  }, [lastScan, id, token]);

  const scanPageUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/scan/${child?.secureId}`
      : '';

  const downloadQR = () => {
    const svg = document.getElementById('child-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = document.createElement('img');
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const png = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = png;
      a.download = `child-safety-qr-${child?.name || id}.png`;
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading || !child) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center py-12">
          {loading ? (
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
          ) : (
            <p className="text-slate-500">Child not found.</p>
          )}
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:underline mb-4"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
              {child.photoUrl ? (
                <Image
                  src={child.photoUrl.startsWith('http') ? child.photoUrl : `${API_URL}${child.photoUrl}`}
                  alt={child.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-2xl font-bold">
                  {child.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{child.name}</h1>
              <p className="text-slate-500">Age {child.age}</p>
              {child.emergencyContacts?.length > 0 && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Emergency: {child.emergencyContacts.map((e) => e.name).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 mb-6">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">QR Code</h2>
          <p className="text-sm text-slate-500 mb-4">
            Share or print this QR. When someone scans it, you&apos;ll get an instant alert and location.
          </p>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <QRCodeSVG
                id="child-qr-svg"
                value={scanPageUrl || child.secureId}
                size={200}
                level="M"
                includeMargin
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={downloadQR}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700"
              >
                <Download size={18} /> Download QR
              </button>
              <Link
                href={`/scan/${child.secureId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                Open scan page (for testing)
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Scan history</h2>
            <Link
              href={`/children/${id}/map`}
              className="inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              <MapPin size={14} /> View on map
            </Link>
          </div>
          <div className="overflow-x-auto">
            {logs.length === 0 ? (
              <p className="p-6 text-slate-500 text-sm">No scans yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50">
                    <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Time</th>
                    <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Message</th>
                    <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Location</th>
                    <th className="text-left p-3 font-medium text-slate-700 dark:text-slate-300">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log._id}
                      className={`border-t border-slate-200 dark:border-slate-700 ${log.message?.toLowerCase().includes('danger') ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
                    >
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3">
                        {log.message ? (
                          <span
                            className={
                              log.message.toLowerCase().includes('danger')
                                ? 'font-semibold text-red-600 dark:text-red-400'
                                : 'text-slate-600 dark:text-slate-400'
                            }
                          >
                            {log.message}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3">
                        <a
                          href={`https://www.google.com/maps?q=${log.latitude},${log.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          {log.latitude.toFixed(5)}, {log.longitude.toFixed(5)}
                        </a>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 truncate max-w-[180px]">
                        {log.deviceInfo?.userAgent || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {total > logs.length && (
            <p className="p-3 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-700">
              Showing latest {logs.length} of {total} scans.
            </p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
