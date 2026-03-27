const BASE = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5001'}/api/admin`;

const token = () => localStorage.getItem('adminToken') ?? '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token()}`,
});

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Request failed');
  return data;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const loginAdmin = (email: string, password: string) =>
  req<{ success: boolean; data: { token: string; admin: { id: string; name: string; email: string } } }>(
    `${BASE}/login`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) }
  );

export const getMe = () =>
  req<{ success: boolean; data: { id: string; name: string; email: string; lastLogin: string } }>(
    `${BASE}/me`, { headers: authHeaders() }
  );

// ── Stats ─────────────────────────────────────────────────────────────────────
export const getStats = () =>
  req<{ success: boolean; data: { totalStudents: number; totalOwners: number; pendingKyc: number; bannedUsers: number } }>(
    `${BASE}/stats`, { headers: authHeaders() }
  );

export const getSignupChart = (days: number) =>
  req<{ success: boolean; data: { date: string; students: number; owners: number }[] }>(
    `${BASE}/signup-chart?days=${days}`, { headers: authHeaders() }
  );

export const getTicketStats = () =>
  req<{ success: boolean; data: { open: number; in_progress: number; resolved: number; closed: number } }>(
    `${BASE}/tickets/stats`, { headers: authHeaders() }
  );

export const getReviewStats = () =>
  req<{ success: boolean; data: { total: number; flagged: number; hidden: number } }>(
    `${BASE}/reviews/stats`, { headers: authHeaders() }
  );

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = (params: { role?: string; search?: string; page?: number } = {}) => {
  const q = new URLSearchParams();
  if (params.role)   q.set('role', params.role);
  if (params.search) q.set('search', params.search);
  if (params.page)   q.set('page', String(params.page));
  return req<{ success: boolean; data: { users: User[]; total: number } }>(
    `${BASE}/users?${q}`, { headers: authHeaders() }
  );
};

export const banUser   = (id: string) => req(`${BASE}/users/${id}/ban`,   { method: 'PATCH', headers: authHeaders() });
export const unbanUser = (id: string) => req(`${BASE}/users/${id}/unban`, { method: 'PATCH', headers: authHeaders() });
export const getUserActivity = (id: string) =>
  req<{ success: boolean; data: { lastLogin: string | null; loginHistory: { loginAt: string }[] } }>(
    `${BASE}/users/${id}/activity`, { headers: authHeaders() }
  );

// ── KYC ───────────────────────────────────────────────────────────────────────
export const getKyc     = (status: string) => req<{ success: boolean; data: User[] }>(`${BASE}/kyc?status=${status}`, { headers: authHeaders() });
export const approveKyc = (id: string) => req(`${BASE}/kyc/${id}/approve`, { method: 'PATCH', headers: authHeaders() });
export const rejectKyc  = (id: string, reason?: string) =>
  req(`${BASE}/kyc/${id}/reject`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ reason }) });

// ── Tickets ───────────────────────────────────────────────────────────────────
export const getTickets = (status?: string) => {
  const q = status && status !== 'All' ? `?status=${status.toLowerCase().replace(' ', '_')}` : '';
  return req<{ success: boolean; data: { tickets: Ticket[] } }>(`${BASE}/tickets${q}`, { headers: authHeaders() });
};

export const getTicketById = (id: string) =>
  req<{ success: boolean; data: Ticket }>(`${BASE}/tickets/${id}`, { headers: authHeaders() });

export const updateTicketStatus = (id: string, status: string) =>
  req<{ success: boolean; data: Ticket }>(`${BASE}/tickets/${id}/status`, {
    method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }),
  });

export const replyToTicket = (id: string, content: string) =>
  req<{ success: boolean; data: Ticket }>(`${BASE}/tickets/${id}/reply`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify({ content }),
  });

// ── Reviews ───────────────────────────────────────────────────────────────────
export const getReviews = (isFlagged?: boolean) => {
  const q = isFlagged !== undefined ? `?isFlagged=${isFlagged}` : '';
  return req<{ success: boolean; data: { reviews: Review[] } }>(`${BASE}/reviews${q}`, { headers: authHeaders() });
};

export const flagReview   = (id: string, reason?: string) =>
  req(`${BASE}/reviews/${id}/flag`,   { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ reason }) });
export const unflagReview = (id: string) =>
  req(`${BASE}/reviews/${id}/unflag`, { method: 'PATCH', headers: authHeaders() });
export const deleteReview = (id: string) =>
  req(`${BASE}/reviews/${id}`,        { method: 'DELETE', headers: authHeaders() });

// ── Shared types ──────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role: 'student' | 'owner';
  isBanned: boolean;
  isVerified: boolean;
  kycStatus?: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  kycDocuments?: { nicFront: string; nicBack: string; selfie: string };
  kycSubmittedAt?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface TicketMessage {
  _id: string;
  sender: 'user' | 'admin';
  content: string;
  createdAt: string;
}

export interface Ticket {
  _id: string;
  userId: { _id: string; email: string; fullName?: string; firstName?: string; role: string };
  subject: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: TicketMessage[];
  createdAt: string;
}

export interface Review {
  _id: string;
  userId: { _id: string; email: string; fullName?: string; firstName?: string; role: string };
  rating: number;
  comment: string;
  isFlagged: boolean;
  isVisible: boolean;
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
export const displayName = (u: { fullName?: string; firstName?: string; lastName?: string; email: string }) =>
  u.fullName || [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email.split('@')[0];

export const initials = (name: string) =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const statusLabel: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};
