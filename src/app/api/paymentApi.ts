// API service for payment-related endpoints
const BASE_URL = 'http://localhost:5000/api';

export interface PaymentSlip {
  id: string;
  tenantId?: string;
  tenantName: string;
  roomId?: string;
  roomNumber: string;
  boardingHouseId?: string;
  placeId: string;
  boardingHouseName?: string;
  placeName: string;
  amount: number;
  originalRent: number;
  date: string;
  slipUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  trustScore?: 'high' | 'medium' | 'low';
  uploadedAt?: string;
}

export interface PaymentData {
  id: string;
  tenantId: string;
  tenantName: string;
  roomId: string;
  roomNumber: string;
  boardingHouseId: string;
  boardingHouseName: string;
  monthlyRent: number;
  outstandingBalance: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  lastPaidDate?: string;
  trustScore?: 'high' | 'medium' | 'low';
  checkInDate: string;
}

export interface FinancialOverview {
  totalExpected: number;
  totalCollected: number;
  totalDeficit: number;
  collectionPercentage: number;
  overdueCount: number;
}

// Fetch all boarding houses for the logged-in owner
export const getBoardingHouses = async (ownerId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/owner/houses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch boarding houses');
    return response.json();
  } catch (error) {
    console.error('Error fetching boarding houses:', error);
    throw error;
  }
};

// Fetch all rooms for a boarding house
export const getRoomsForHouse = async (houseId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${BASE_URL}/owner/rooms?houseId=${houseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch rooms');
    return response.json();
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

// Fetch pending payment slips (new slips to review)
export const getPendingPaymentSlips = async (): Promise<PaymentSlip[]> => {
  try {
    const response = await fetch(`${BASE_URL}/owner/payment-slips?status=pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch payment slips');
    return response.json();
  } catch (error) {
    console.error('Error fetching payment slips:', error);
    throw error;
  }
};

// Fetch all payment history with optional filtering
export const getPaymentHistory = async (filters?: {
  boardingHouseId?: string;
  status?: string;
  daysOverdue?: number;
}): Promise<PaymentData[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.boardingHouseId) params.append('houseId', filters.boardingHouseId);
    if (filters?.status) params.append('status', filters.status);

    const response = await fetch(`${BASE_URL}/owner/payment-history?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch payment history');
    return response.json();
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

// Get financial overview metrics
export const getFinancialOverview = async (): Promise<FinancialOverview> => {
  try {
    const response = await fetch(`${BASE_URL}/owner/financial-overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch financial overview');
    return response.json();
  } catch (error) {
    console.error('Error fetching financial overview:', error);
    throw error;
  }
};

// Approve a payment slip
export const approvePaymentSlip = async (slipId: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/owner/payment-slips/${slipId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to approve payment slip');
    return response.json();
  } catch (error) {
    console.error('Error approving payment slip:', error);
    throw error;
  }
};

// Reject a payment slip
export const rejectPaymentSlip = async (slipId: string, reason: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/owner/payment-slips/${slipId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) throw new Error('Failed to reject payment slip');
    return response.json();
  } catch (error) {
    console.error('Error rejecting payment slip:', error);
    throw error;
  }
};

// Download payment slip (gets the file URL)
export const downloadPaymentSlip = async (slipId: string): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/owner/payment-slips/${slipId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to download payment slip');
    
    // Get blob and create download link
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    return url;
  } catch (error) {
    console.error('Error downloading payment slip:', error);
    throw error;
  }
};
