// Shared centralized API base URL to ensure paths are uniformly handled.
export const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:5001')
  .replace(/\/api\/?$/, '') // Removes trailing /api or /api/
  .replace(/\/$/, '');      // Removes any remaining trailing slash