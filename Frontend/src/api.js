export const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const EP = {
  login: '/auth/login',
  register: '/auth/register',
  me: '/auth/me',
  inventory: '/inventory',
  donations: '/donations',
  myDonations: '/donations/mine',
  requests: '/requests',
  myRequests: '/requests/mine',
  requestStatus: (id) => `/requests/${id}/review`,
  requestReview: (id) => `/requests/${id}/review`,
  stats: '/stats',
};
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token && token !== 'undefined') {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && !path.includes('/auth/')) {
      // Clear expired credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw new Error(data.message || data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const toList = (d) => {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.donations)) return d.donations;
  if (Array.isArray(d?.requests)) return d.requests;
  if (Array.isArray(d?.inventory)) return d.inventory;
  const first = Object.values(d || {}).find(Array.isArray);
  return first || [];
};
