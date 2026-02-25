'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';

export default function PublicScanPage() {
  const params = useParams();
  const secureId = params.secureId as string;
  const [status, setStatus] = useState<'idle' | 'getting_location' | 'sending' | 'done' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [scanMessage, setScanMessage] = useState<string>('');
  const [continuous, setContinuous] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  function getDeviceInfo() {
    if (typeof navigator === 'undefined') return {};
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    };
  }

  async function sendLocation(lat: number, lng: number, accuracy?: number) {
    try {
      await api.scan.submit(secureId, {
        latitude: lat,
        longitude: lng,
        accuracy: accuracy ?? undefined,
        timestamp: new Date().toISOString(),
        message: scanMessage.trim() || undefined,
        deviceInfo: getDeviceInfo(),
      });
      if (!continuous) {
        setStatus('done');
        setFeedbackMessage('Location shared. Parent has been notified.');
      }
    } catch (err) {
      setStatus('error');
      setFeedbackMessage(err instanceof Error ? err.message : 'Failed to send location.');
    }
  }

  function handlePosition(position: GeolocationPosition) {
    const { latitude, longitude, accuracy } = position.coords;
    setStatus('sending');
    sendLocation(latitude, longitude, accuracy);
  }

  function handleError(err: GeolocationPositionError) {
    setStatus('error');
    if (err.code === 1) setFeedbackMessage('Location permission denied.');
    else if (err.code === 2) setFeedbackMessage('Location unavailable.');
    else setFeedbackMessage('Could not get location.');
  }

  function requestAndSend() {
    setFeedbackMessage('');
    setStatus('getting_location');
    if (!navigator.geolocation) {
      setStatus('error');
      setFeedbackMessage('Geolocation is not supported by this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  }

  useEffect(() => {
    if (!continuous || !secureId) return;
    setStatus('getting_location');
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setStatus('sending');
        sendLocation(latitude, longitude, accuracy);
      },
      handleError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
    setWatchId(id);
    return () => {
      if (id != null) navigator.geolocation.clearWatch(id);
      setWatchId(null);
    };
  }, [continuous, secureId]);

  if (!secureId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100 dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400">Invalid scan link.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-slate-900">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-lg text-center">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Child Safety – Share location
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This will send your current location to the child&apos;s parent. Allow location when prompted.
        </p>

        {status === 'idle' && (
          <>
            <div className="mb-4 text-left">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Add a message (optional)
              </label>
              <select
                value={scanMessage}
                onChange={(e) => setScanMessage(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
              >
                <option value="">I am safe</option>
                <option value="I am in Danger">I am in Danger</option>
                <option value="Need help">Need help</option>
                <option value="Call me back">Call me back</option>
              </select>
            </div>
            <button
              onClick={requestAndSend}
              className="w-full py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700"
            >
              Share my location
            </button>
            <label className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={continuous}
                onChange={(e) => setContinuous(e.target.checked)}
                className="rounded"
              />
              Continuous tracking (updates every few seconds)
            </label>
          </>
        )}

        {(status === 'getting_location' || status === 'sending') && (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
            <p className="text-slate-600 dark:text-slate-400">
              {status === 'getting_location' ? 'Getting location…' : 'Sending…'}
            </p>
          </div>
        )}

        {status === 'done' && (
          <div className="text-emerald-600 dark:text-emerald-400 font-medium">
            {feedbackMessage}
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-600 dark:text-red-400 text-sm mb-4">
            {feedbackMessage}
          </div>
        )}

        {(status === 'done' || status === 'error') && !continuous && (
          <button
            onClick={() => { setStatus('idle'); setFeedbackMessage(''); }}
            className="mt-4 w-full py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
          >
            Try again
          </button>
        )}
      </div>
    </main>
  );
}
