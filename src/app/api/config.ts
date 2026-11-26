// Single source of truth for the backend address.
// Set VITE_API_URL to the backend origin (e.g. https://boardingbook-api.onrender.com).
// A trailing "/api" or "/" is tolerated and stripped.
const raw = ((import.meta as any).env?.VITE_API_URL as string | undefined) || 'http://localhost:5001';

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
