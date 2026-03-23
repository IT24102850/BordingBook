const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  needsVerification?: boolean;
}

interface SignInPayload {
  email: string;
  password: string;
}

interface SignUpPayload {
  email: string;
  password: string;
  role: 'student' | 'owner';
  fullName?: string;
  phoneNumber?: string;
  companyName?: string;
  propertyCount?: number;
}

interface SignInResult {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'student' | 'owner' | 'admin';
    fullName?: string;
    isVerified: boolean;
  };
}

export class AuthApiError extends Error {
  status: number;
  needsVerification: boolean;

  constructor(message: string, status = 500, needsVerification = false) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.needsVerification = needsVerification;
  }
}

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return { success: false, message: 'Invalid server response' };
  }
}

async function signIn(payload: SignInPayload): Promise<SignInResult> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await parseJson<SignInResult>(response);

  if (!response.ok || !result.success || !result.data) {
    throw new AuthApiError(
      result.message || 'Sign in failed',
      response.status,
      Boolean(result.needsVerification)
    );
  }

  return result.data;
}

async function signUp(payload: SignUpPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await parseJson(response);

  if (!response.ok || !result.success) {
    throw new AuthApiError(result.message || 'Sign up failed', response.status);
  }
}

export const authApi = {
  signIn,
  signUp,
};
