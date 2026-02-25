'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace('/dashboard');
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Child Safety QR
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Keep your children safe with QR-based tracking. Get instant alerts when someone scans your child&apos;s QR code.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl border-2 border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/30 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
