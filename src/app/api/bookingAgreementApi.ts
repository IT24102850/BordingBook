const API_BASE_URL = (((import.meta as any).env?.VITE_API_URL as string) || '').replace(/\/$/, '');

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type BookingRequestDto = {
  _id: string;
  contactNumber?: string;
  bookingType: 'individual' | 'group';
  groupName?: string;
  groupSize?: number;
  moveInDate: string;
  durationMonths: number;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  roomId?: {
    _id: string;
    name?: string;
    roomNumber?: string;
    price?: number;
    location?: string;
  };
  houseId?: {
    _id: string;
    name?: string;
    monthlyPrice?: number;
    address?: string;
  };
  studentId?: {
    _id: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    mobileNumber?: string;
  };
  agreementId?: {
    _id: string;
    title?: string;
    status?: 'sent' | 'accepted' | 'rejected';
    sentAt?: string;
  };
};

export type BookingAgreementDto = {
  _id: string;
  title: string;
  terms: string;
  rentAmount: number;
  depositAmount: number;
  periodStart: string;
  periodEnd: string;
  additionalClauses: string[];
  status: 'pending' | 'signed' | 'expired' | 'partially_signed' | 'rejected';
  sentAt: string;
  signedAt?: string;
  expirationDate: string;
  groupMemberSignatures?: Array<{
    memberId: string;
    memberName: string;
    memberEmail: string;
    status: 'pending' | 'signed' | 'rejected';
    signedAt?: string;
  }>;
  bookingRequestId?: {
    _id: string;
    status: 'pending' | 'approved' | 'rejected';
    moveInDate: string;
    durationMonths: number;
    bookingType: 'individual' | 'group';
    groupName?: string;
    groupSize?: number;
  };
  studentId?: {
    _id: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    mobileNumber?: string;
  };
  roomId?: {
    _id: string;
    name?: string;
    roomNumber?: string;
    price?: number;
    location?: string;
  };
};

export type AgreementTemplateVersionDto = {
  version: number;
  title: string;
  content: string;
  createdAt: string;
};

export type AgreementTemplateDto = {
  _id: string;
  ownerId: string;
  title: string;
  currentVersion: number;
  currentContent: string;
  versions: AgreementTemplateVersionDto[];
  createdAt: string;
  updatedAt: string;
};

export type RoomListDto = {
  _id: string;
  name: string;
  location: string;
  price: number;
  totalSpots: number;
  occupancy: number;
  roomType?: string;
  images?: string[];
  deposit?: number;
};

function getHeaders() {
  const token = localStorage.getItem('bb_access_token') || '';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function parseResponse<T>(response: Response): Promise<ApiEnvelope<T>> {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    return { success: false, message: 'Invalid server response' };
  }
}

async function ensureSuccess<T>(response: Response): Promise<T> {
  const body = await parseResponse<T>(response);
  if (!response.ok || !body.success || body.data === undefined) {
    throw new Error(body.message || 'Request failed');
  }
  return body.data;
}

export async function getOwnerBookingRequests(status?: 'pending' | 'approved' | 'rejected') {
  const params = new URLSearchParams();
  if (status) {
    params.set('status', status);
  }
  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/owner/booking-requests${query ? `?${query}` : ''}`, {
    headers: getHeaders(),
  });
  return ensureSuccess<BookingRequestDto[]>(response);
}

export async function updateOwnerBookingRequestStatus(
  requestId: string,
  payload: { status: 'approved' | 'rejected'; rejectionReason?: string }
) {
  const response = await fetch(`${API_BASE_URL}/api/owner/booking-requests/${requestId}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return ensureSuccess<BookingRequestDto>(response);
}

export async function createOwnerAgreement(payload: {
  bookingRequestId: string;
  title: string;
  terms: string;
  rentAmount: number;
  depositAmount?: number;
  periodStart: string;
  periodEnd: string;
  additionalClauses?: string[];
}) {
  const response = await fetch(`${API_BASE_URL}/api/owner/agreements`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return ensureSuccess<BookingAgreementDto>(response);
}

export async function getOwnerAgreements(status?: 'sent' | 'accepted' | 'rejected') {
  const params = new URLSearchParams();
  if (status) {
    params.set('status', status);
  }
  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/owner/agreements${query ? `?${query}` : ''}`, {
    headers: getHeaders(),
  });
  return ensureSuccess<BookingAgreementDto[]>(response);
}

export async function getAvailableRooms() {
  const response = await fetch(`${API_BASE_URL}/api/roommates/rooms`, {
    headers: getHeaders(),
  });
  return ensureSuccess<RoomListDto[]>(response);
}

export async function createStudentBookingRequest(payload: {
  roomId?: string;
  houseId?: string;
  bookingType: 'individual' | 'group';
  groupName?: string;
  groupSize?: number;
  contactNumber?: string;
  moveInDate: string;
  durationMonths: number;
  message?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/roommates/booking-request`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return ensureSuccess<BookingRequestDto>(response);
}

export async function getOwnerAgreementTemplates() {
  const response = await fetch(`${API_BASE_URL}/api/owner/agreement-templates`, {
    headers: getHeaders(),
  });
  return ensureSuccess<AgreementTemplateDto[]>(response);
}

export async function createOwnerAgreementTemplate(payload: { title: string; content: string }) {
  const response = await fetch(`${API_BASE_URL}/api/owner/agreement-templates`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return ensureSuccess<AgreementTemplateDto>(response);
}

export async function getMyBookingRequests() {
  const response = await fetch(`${API_BASE_URL}/api/roommates/booking-requests`, {
    headers: getHeaders(),
  });
  return ensureSuccess<BookingRequestDto[]>(response);
}

export async function getMyAgreements() {
  const response = await fetch(`${API_BASE_URL}/api/roommates/agreements`, {
    headers: getHeaders(),
  });
  return ensureSuccess<BookingAgreementDto[]>(response);
}

export async function respondToMyAgreement(agreementId: string, status: 'accepted' | 'rejected') {
  const response = await fetch(`${API_BASE_URL}/api/roommates/agreements/${agreementId}/respond`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  return ensureSuccess<BookingAgreementDto>(response);
}

export async function sendAgreementFromTemplate(payload: {
  bookingRequestId: string;
  templateVersionId: string;
  expirationDays?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/api/owner/agreements/send-from-template`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return ensureSuccess<BookingAgreementDto>(response);
}

export async function getOwnerSignedAgreements(status?: 'pending' | 'signed' | 'partially_signed' | 'expired') {
  const params = new URLSearchParams();
  if (status) {
    params.set('status', status);
  }
  const query = params.toString();
  const response = await fetch(`${API_BASE_URL}/api/owner/agreements/signed${query ? `?${query}` : ''}`, {
    headers: getHeaders(),
  });
  return ensureSuccess<BookingAgreementDto[]>(response);
}

export async function signAgreement(agreementId: string, action: 'sign' | 'reject') {
  const response = await fetch(`${API_BASE_URL}/api/student/agreements/${agreementId}/sign`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ action }),
  });
  return ensureSuccess<BookingAgreementDto>(response);
}

export async function downloadAgreement(agreementId: string) {
  const token = localStorage.getItem('bb_access_token') || '';
  window.location.href = `${API_BASE_URL}/api/student/agreements/${agreementId}/download?token=${token}`;
}

export async function downloadAgreementAsOwner(agreementId: string) {
  const token = localStorage.getItem('bb_access_token') || '';
  window.location.href = `${API_BASE_URL}/api/owner/agreements/${agreementId}/download?token=${token}`;
}

export type NotificationDto = {
  _id: string;
  user: string;
  type: 'group_invite' | 'group_invite_accepted' | 'group_invite_rejected' | 'group_message' | 'agreement_pending' | 'agreement_signed' | 'agreement_reminder' | 'system' | 'other';
  title: string;
  message: string;
  data: {
    agreementId?: string;
    bookingRequestId?: string;
    expirationDate?: string;
    pdfUrl?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: string;
};

export async function getStudentNotifications() {
  const response = await fetch(`${API_BASE_URL}/api/student/notifications`, {
    headers: getHeaders(),
  });
  return ensureSuccess<NotificationDto[]>(response);
}

export async function markNotificationAsRead(notificationId: string) {
  const response = await fetch(`${API_BASE_URL}/api/student/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return ensureSuccess<NotificationDto>(response);
}

export async function markAllNotificationsAsRead() {
  const response = await fetch(`${API_BASE_URL}/api/student/notifications/mark-all-read`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  return ensureSuccess<{ message: string }>(response);
}
