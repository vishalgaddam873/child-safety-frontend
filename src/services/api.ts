/**
 * API client for Child Safety backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || res.statusText || 'Request failed');
  }
  return data as T;
}

export const api = {
  auth: {
    register: (body: { email: string; password: string; name?: string; phone?: string }) =>
      request<{ user: User; token: string }>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (email: string, password: string) =>
      request<{ user: User; token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: (token: string) =>
      request<{ user: User }>('/api/auth/me', { token }),
    updateProfile: (token: string, body: { name?: string; phone?: string }) =>
      request<{ user: User }>('/api/auth/profile', { method: 'PATCH', body: JSON.stringify(body), token }),
  },
  children: {
    list: (token: string) =>
      request<{ children: Child[] }>('/api/children', { token }),
    get: (token: string, childId: string) =>
      request<{ child: Child }>(`/api/children/${childId}`, { token }),
    create: (token: string, body: CreateChildBody) =>
      request<{ child: Child }>('/api/children', { method: 'POST', body: JSON.stringify(body), token }),
    update: (token: string, childId: string, body: Partial<CreateChildBody>) =>
      request<{ child: Child }>(`/api/children/${childId}`, { method: 'PATCH', body: JSON.stringify(body), token }),
    delete: (token: string, childId: string) =>
      request<{ message: string }>(`/api/children/${childId}`, { method: 'DELETE', token }),
    uploadPhoto: (token: string, childId: string, file: File) => {
      const form = new FormData();
      form.append('photo', file);
      return fetch(`${API_URL}/api/children/${childId}/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');
        return data as { child: Child; photoUrl: string };
      });
    },
  },
  scan: {
    submit: (secureId: string, body: ScanBody) =>
      request<{ success: boolean; message: string }>(`/api/scan/${secureId}`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    history: (token: string, childId: string, params?: { limit?: number; skip?: number }) => {
      const q = new URLSearchParams();
      if (params?.limit != null) q.set('limit', String(params.limit));
      if (params?.skip != null) q.set('skip', String(params.skip));
      const query = q.toString();
      return request<{ logs: ScanLog[]; total: number }>(
        `/api/scan/child/${childId}/history${query ? `?${query}` : ''}`,
        { token }
      );
    },
    lastLocation: (token: string, childId: string) =>
      request<{ lastLocation: ScanLog | null }>(`/api/scan/child/${childId}/last`, { token }),
  },
};

export interface User {
  _id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation?: string;
}

export interface Child {
  _id: string;
  parentId: string;
  name: string;
  age: number;
  photoUrl?: string | null;
  emergencyContacts: EmergencyContact[];
  secureId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateChildBody {
  name: string;
  age: number;
  emergencyContacts?: EmergencyContact[];
}

export interface ScanBody {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  message?: string;
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    language?: string;
    screenResolution?: string;
  };
}

export interface ScanLog {
  _id: string;
  childId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  message?: string | null;
  deviceInfo?: Record<string, string>;
}
