'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { LayoutDashboard, UserPlus, LogOut, Wifi, WifiOff } from 'lucide-react';
import clsx from 'clsx';

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { connected, lastScan, clearLastScan } = useSocket();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-slate-800 dark:text-slate-100">
            Child Safety QR
          </Link>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-sm text-slate-500" title={connected ? 'Connected' : 'Disconnected'}>
              {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
            </span>
            <nav className="flex gap-2">
              <Link
                href="/dashboard"
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition',
                  pathname === '/dashboard'
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
              >
                <LayoutDashboard className="inline mr-1" size={16} />
                Dashboard
              </Link>
              <Link
                href="/children/new"
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm font-medium transition',
                  pathname === '/children/new'
                    ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
              >
                <UserPlus className="inline mr-1" size={16} />
                Add Child
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
        {lastScan && (() => {
          const msg = lastScan.log?.message != null ? String(lastScan.log.message).trim() : '';
          const isDanger = msg.toLowerCase().includes('danger');
          return (
          <div
            className={
              isDanger
                ? 'bg-red-100 dark:bg-red-900/40 border-b border-red-200 dark:border-red-800 px-4 py-2 flex items-center justify-between'
                : 'bg-amber-100 dark:bg-amber-900/40 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between'
            }
            role="alert"
          >
            <span
              className={
                isDanger
                  ? 'text-sm text-red-800 dark:text-red-200 font-medium'
                  : 'text-sm text-amber-800 dark:text-amber-200'
              }
            >
              <strong>QR scanned:</strong> {lastScan.childName}
              {msg ? <> – <strong>{msg}</strong></> : null}
              {' – '}location at {new Date(lastScan.log.timestamp).toLocaleString()}
            </span>
            <button
              onClick={clearLastScan}
              className={isDanger ? 'text-red-700 dark:text-red-300 hover:underline text-sm' : 'text-amber-700 dark:text-amber-300 hover:underline text-sm'}
            >
              Dismiss
            </button>
          </div>
          );
        })()}
      </header>
      <main className="flex-1 max-w-4xl w-full mx-auto p-4">{children}</main>
    </div>
  );
}
