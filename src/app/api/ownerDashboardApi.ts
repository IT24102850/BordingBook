// Notice DTO
export type NoticeDto = {
  _id: string;
  ownerId: string;
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

// Notice API
async function getNotices(): Promise<NoticeDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/owner/notices`, {
    headers: getAuthHeaders(),
  });
  return ensureSuccess<NoticeDto[]>(response);
}

async function createNotice(payload: { title: string; message: string }): Promise<NoticeDto> {
  const response = await fetch(`${API_BASE_URL}/api/owner/notices`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return ensureSuccess<NoticeDto>(response);
}

async function updateNotice(noticeId: string, payload: { title?: string; message?: string }): Promise<NoticeDto> {
  const response = await fetch(`${API_BASE_URL}/api/owner/notices/${noticeId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return ensureSuccess<NoticeDto>(response);
}

async function deleteNotice(noticeId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/owner/notices/${noticeId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const body = await parse<unknown>(response);
  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Failed to delete notice');
  }
}
// Strip /api suffix from VITE_API_URL if present, since endpoints already include /api prefix
const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string)?.replace(/\/api\/?$/, '') || 'http://localhost:5001';


type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type OwnerHouseDto = {
  _id: string;
  name: string;
  address: string;
  totalRooms: number;
  monthlyPrice?: number;
  roomType?: string;
  availableFrom?: string;
  deposit?: number;
  roommateCount?: string;
  description?: string;
  features?: string[];
  occupiedRooms: number;
  rating: number;
  totalReviews: number;
  image: string;
  images?: string[];
  status: 'active' | 'inactive';
  genderPreference?: 'any' | 'girls' | 'boys';
};

export type OwnerRoomDto = {
  _id: string;
  houseId?: string;
  roomNumber?: string;
  floor?: number;
  bedCount?: number;
  totalSpots?: number;
  occupancy?: number;
  price: number;
  facilities?: string[];
  images?: string[];
  location: string;
  roomType?: string;
  genderPreference?: string;
  availableFrom?: string;
  deposit?: number;
  roommateCount?: string;
  description?: string;
};

function getAuthHeaders() {
  const token = localStorage.getItem('bb_access_token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token || ''}`,
  };
}

async function parse<T>(response: Response): Promise<ApiEnvelope<T>> {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    return { success: false, message: 'Invalid server response' };
  }
}

async function ensureSuccess<T>(response: Response): Promise<T> {
  const data = await parse<T>(response);
  if (!response.ok || !data.success || data.data === undefined) {
    throw new Error(data.message || 'Request failed');
  }
  return data.data;
}

async function getHouses(): Promise<OwnerHouseDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/owner/houses`, {
    headers: getAuthHeaders(),
  });
  return ensureSuccess<OwnerHouseDto[]>(response);
}

async function createHouse(payload: {
  name: string;
  address: string;
  totalRooms: number;
  monthlyPrice?: number;
  roomType?: string;
  availableFrom?: string;
  deposit?: number;
  roommateCount?: string;
  description?: string;
  features?: string[];
  image?: string;
  images?: string[];
  status?: 'active' | 'inactive';
  genderPreference?: 'any' | 'girls' | 'boys';
}): Promise<OwnerHouseDto> {
  const response = await fetch(`${API_BASE_URL}/api/owner/houses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return ensureSuccess<OwnerHouseDto>(response);
}

async function updateHouse(houseId: string, payload: Partial<OwnerHouseDto>): Promise<OwnerHouseDto> {
  const response = await fetch(`${API_BASE_URL}/api/owner/houses/${houseId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return ensureSuccess<OwnerHouseDto>(response);
}

async function deleteHouse(houseId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/owner/houses/${houseId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const body = await parse<unknown>(response);
  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Failed to delete house');
  }
}

async function getRooms(): Promise<OwnerRoomDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/owner/rooms`, {
    headers: getAuthHeaders(),
  });
  return ensureSuccess<OwnerRoomDto[]>(response);
}

async function createRoom(payload: {
  name?: string;
  houseId: string;
  roomNumber: string;
  floor: number;
  bedCount: number;
  price: number;
  facilities: string[];
  images: string[];
  location: string;
  roomType: string;
  genderPreference: string;
  availableFrom: string;
  deposit: number;
  roommateCount: string;
  description: string;
  owner?: string;
  ownerPhone?: string;
  ownerEmail?: string;
}): Promise<OwnerRoomDto> {
  const response = await fetch(`${API_BASE_URL}/api/owner/rooms`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return ensureSuccess<OwnerRoomDto>(response);
}

async function updateRoom(roomId: string, payload: Partial<OwnerRoomDto>): Promise<OwnerRoomDto> {
  const response = await fetch(`${API_BASE_URL}/api/owner/rooms/${roomId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return ensureSuccess<OwnerRoomDto>(response);
}

async function deleteRoom(roomId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/owner/rooms/${roomId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const body = await parse<unknown>(response);
  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Failed to delete room');
  }
}


async function getNextPaymentCycleDate(tenantId: string): Promise<{ nextPaymentCycleStartDate: string | null }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/owner/tenants/${tenantId}/next-cycle`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) return { nextPaymentCycleStartDate: null };
    const data = await parse<{ nextPaymentCycleStartDate: string }>(response);
    return { nextPaymentCycleStartDate: data.data?.nextPaymentCycleStartDate ?? null };
  } catch {
    return { nextPaymentCycleStartDate: null };
  }
}

// Booking Requests API
export type BookingRequestDto = {
  _id: string;
  studentId: string;
  ownerId: string;
  roomId: string;
  bookingType: 'individual' | 'group';
  groupName?: string;
  groupSize?: number;
  moveInDate: string;
  durationMonths: number;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  agreementId?: string;
  processedAt?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
  room?: any;
  student?: any;
};

async function getBookingRequests(status?: string): Promise<BookingRequestDto[]> {
  const url = status
    ? `${API_BASE_URL}/api/owner/booking-requests?status=${status}`
    : `${API_BASE_URL}/api/owner/booking-requests`;
  const response = await fetch(url, { headers: getAuthHeaders() });
  return ensureSuccess<BookingRequestDto[]>(response);
}

async function updateBookingRequestStatus(requestId: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<BookingRequestDto> {
  const response = await fetch(`${API_BASE_URL}/api/owner/booking-requests/${requestId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, rejectionReason }),
  });
  return ensureSuccess<BookingRequestDto>(response);
}

export type AgreementTemplateDto = {
  _id: string;
  ownerId: string;
  title: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};

// Agreement functions
export type AgreementDto = {
  _id: string;
  ownerId: string;
  pdfUrl?: string | null;
  studentId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    mobileNumber?: string;
  };
  roomId: {
    _id: string;
    name: string;
    roomNumber?: string;
    price: number;
    location: string;
  };
  bookingRequestId: {
    _id: string;
    status: string;
    moveInDate: string;
    durationMonths: number;
    bookingType: 'individual' | 'group';
    groupName?: string;
    groupSize?: number;
  };
  title: string;
  terms: string;
  rentAmount: number;
  depositAmount: number;
  periodStart: string;
  periodEnd: string;
  additionalClauses: string[];
  status: 'sent' | 'accepted' | 'rejected';
  sentAt: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
};

async function createAgreementTemplate(payload: {
  title: string;
  content: string;
}): Promise<AgreementTemplateDto> {
  const response = await fetch(`${API_BASE_URL}/api/owner/agreement-templates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  // Parse response and return richer errors to the UI
  const data = await parse<AgreementTemplateDto>(response);
  if (!response.ok || !data.success || data.data === undefined) {
    // If server provides structured validation errors, include them
    if (Array.isArray((data as any).errors) && (data as any).errors.length > 0) {
      const details = (data as any).errors.map((e: any) => `${e.field}: ${e.message}`).join('; ');
      throw new Error(`${data.message || 'Request failed'} - ${details}`);
    }
    throw new Error(data.message || 'Request failed');
  }
  return data.data as AgreementTemplateDto;
}

async function getAgreementTemplates(): Promise<AgreementTemplateDto[]> {
  const response = await fetch(`${API_BASE_URL}/api/owner/agreement-templates`, {
    headers: getAuthHeaders(),
  });
  return ensureSuccess<AgreementTemplateDto[]>(response);
}

async function createAgreementForRequest(payload: {
  bookingRequestId: string;
  title: string;
  terms: string;
  rentAmount: number;
  depositAmount?: number;
  periodStart: string;
  periodEnd: string;
  additionalClauses?: string[];
}): Promise<AgreementDto> {
  const response = await fetch(`${API_BASE_URL}/api/owner/agreements`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return ensureSuccess<AgreementDto>(response);
}

async function getOwnerAgreements(status?: string): Promise<AgreementDto[]> {
  const url = status
    ? `${API_BASE_URL}/api/owner/agreements?status=${status}`
    : `${API_BASE_URL}/api/owner/agreements`;
  const response = await fetch(url, { headers: getAuthHeaders() });
  return ensureSuccess<AgreementDto[]>(response);
}

async function cancelAgreement(agreementId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/owner/agreements/${agreementId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const body = await parse<unknown>(response);
  if (!response.ok || !body.success) {
    throw new Error(body.message || 'Failed to cancel agreement');
  }
}

export const ownerDashboardApi = {
  getHouses,
  createHouse,
  updateHouse,
  deleteHouse,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getBookingRequests,
  updateBookingRequestStatus,
  getNextPaymentCycleDate,
  createAgreementTemplate,
  getAgreementTemplates,
  createAgreementForRequest,
  getOwnerAgreements,
  cancelAgreement,
  // Notice API
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
};
