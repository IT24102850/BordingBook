// Single source of truth for the backend address.
// VITE_BACKEND_URL (set in .env.production for the deployed site) wins over the older
// VITE_API_URL variable. A trailing "/api" or "/" is tolerated and stripped.
const env = (import.meta as any).env || {};
const raw = (env.VITE_BACKEND_URL as string | undefined) || (env.VITE_API_URL as string | undefined) || 'http://localhost:5001';

/** Backend origin, without a trailing slash or /api — e.g. https://api.example.com */
export const API_BASE_URL = raw.trim().replace(/\/+$/, '').replace(/\/api$/, '');

/** REST root — e.g. https://api.example.com/api */
export const API_URL = `${API_BASE_URL}/api`;

/** Turn a server-relative file path ("/uploads/...", "/agreements/...") into a full URL. */
export const fileUrl = (p?: string | null): string => {
  if (!p) return '';
  if (/^(https?:|data:|blob:)/i.test(p)) return p;
  return `${API_BASE_URL}${p.startsWith('/') ? '' : '/'}${p}`;
};
