'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, EmergencyContact } from '@/services/api';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Plus, Trash2 } from 'lucide-react';

export default function NewChildPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addContact = () => {
    setEmergencyContacts((prev) => [...prev, { name: '', phone: '', relation: '' }]);
  };

  const updateContact = (i: number, field: keyof EmergencyContact, value: string) => {
    setEmergencyContacts((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const removeContact = (i: number) => {
    setEmergencyContacts((prev) => prev.filter((_, idx) => idx !== i));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!token) return;
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 25) {
      setError('Age must be between 0 and 25');
      return;
    }
    setLoading(true);
    try {
      const { child } = await api.children.create(token, {
        name: name.trim(),
        age: ageNum,
        emergencyContacts: emergencyContacts.filter((c) => c.name.trim() || c.phone.trim()),
      });
      if (photoFile) {
        await api.children.uploadPhoto(token, child._id, photoFile);
      }
      router.push(`/children/${child._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create child');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Add Child</h1>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Age * (0–25)
            </label>
            <input
              type="number"
              min={0}
              max={25}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 dark:file:bg-primary-900/40 dark:file:text-primary-300"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Emergency contacts (optional)
              </label>
              <button
                type="button"
                onClick={addContact}
                className="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                <Plus size={14} /> Add
              </button>
            </div>
            {emergencyContacts.map((c, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={c.name}
                  onChange={(e) => updateContact(i, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={c.phone}
                  onChange={(e) => updateContact(i, 'phone', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
                />
                <input
                  type="text"
                  placeholder="Relation"
                  value={c.relation || ''}
                  onChange={(e) => updateContact(i, 'relation', e.target.value)}
                  className="w-24 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeContact(i)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create child'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
