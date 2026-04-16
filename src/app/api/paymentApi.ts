// API service for payment-related endpoints
const BASE_URL = 'http://localhost:5000';

// ============================================
// PAYMENT DASHBOARD TYPES
// ============================================

export interface DashboardStatsDto {
  totalTenants: number;
  paidTenants: number;
  overdueCount: number;
  totalCollected: number;
  boardingHouseName: string;
}

export interface RoomTenantDto {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface RoomOverviewDto {
  id: string;
  roomNumber: string;
  name: string;
  price: number;
  bedCount: number;
  occupancyStatus: 'OCCUPIED' | 'AVAILABLE';
  currentTenant: RoomTenantDto | null;
  location: string;
  facilities: string[];
}

export interface PaymentLedgerEntryDto {
  id: string;
  cycleNumber: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  roomNumber: string;
  roomName: string;
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'rejected';
  startDate: string;
  dueDate: string;
  paidDate: string | null;
  isActive: boolean;
}

// ============================================
// EXISTING PAYMENT INTERFACES
// ============================================

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

/**
 * REAL API: Fetch all pending payment slips for the authenticated owner
 * This calls the payment module backend endpoint
 * Returns real data from MongoDB - NO MOCK DATA
 */
export const getPendingPayments = async (): Promise<PaymentSlip[]> => {
  try {
    const token = localStorage.getItem('bb_access_token');
    const response = await fetch(`${BASE_URL}/api/payments/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch pending payments');
    }

    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    throw error;
  }
};

/**
 * REAL API: Fetch all boarding places for the authenticated owner
 * This calls the payment module backend endpoint
 * Returns real data from MongoDB - NO MOCK DATA
 */
export const getOwnerBoardingPlaces = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('bb_access_token');
    
    // DEBUG: Log token info
    console.log('🔑 PaymentAPI Debug:');
    console.log('   Token exists:', !!token);
    console.log('   Token length:', token?.length);
    console.log('   Token preview:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    console.log('   Full URL:', `${BASE_URL}/api/payments/boarding-places`);
    console.log('   Headers:', {
      'Authorization': `Bearer ${token ? `${token.substring(0, 20)}...` : 'NO TOKEN'}`,
    });
    
    const response = await fetch(`${BASE_URL}/api/payments/boarding-places`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('   Response Status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('   Error Response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch boarding places');
    }
    
    const data = await response.json();
    console.log('   Success Response:', data);
    
    // ✅ SUCCESS - Return the data array
    if (data.success && Array.isArray(data.data)) {
      console.log('   Data is array, returning:', data.data.length, 'houses');
      return data.data;
    }
    
    // ✅ SUCCESS but data might be wrapped differently
    if (data.success && data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      console.log('   Data is object (not array), checking structure:', Object.keys(data.data));
      // If it's an object but not an array, extract the houses array if present
      if (data.data.houses && Array.isArray(data.data.houses)) {
        return data.data.houses;
      }
      if (data.data.boardingPlaces && Array.isArray(data.data.boardingPlaces)) {
        return data.data.boardingPlaces;
      }
      // If it's a single object, wrap it in an array
      return [data.data];
    }
    
    // If no data but success, return empty array (triggers "No boarding places" message)
    if (data.success && !data.data) {
      console.log('   No data in response');
      return [];
    }
    
    throw new Error(data.message || 'Failed to fetch boarding places');
  } catch (error) {
    console.error('Error fetching boarding places:', error);
    throw error;
  }
};

// Fetch pending payment slips (new slips to review)
export const getPendingPaymentSlips = async (): Promise<PaymentSlip[]> => {
  try {
    console.log('🔍 Fetching pending payment slips from:', `${BASE_URL}/roommates/payments/pending`);
    const token = localStorage.getItem('bb_access_token');
    console.log('🔑 Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

    const response = await fetch(`${BASE_URL}/payments/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('📊 Response status:', response.status);
    const data = await response.json();
    console.log('📋 Response data:', data);

    if (!response.ok) {
      console.error('❌ API Error:', data.message);
      throw new Error(data.message || 'Failed to fetch payment slips');
    }

    const slips = data.data || [];
    console.log('✅ Pending slips count:', slips.length);
    return slips;
  } catch (error: any) {
    console.error('❌ Error fetching payment slips:', error);
    return [];
  }
};

// Fetch all payment history for the logged-in student
export const getStudentPaymentHistory = async (): Promise<any[]> => {
  try {
    const token = localStorage.getItem('bb_access_token');
    const response = await fetch(`${BASE_URL}/payments/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch student payment history');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching student payment history:', error);
    return []; // Return empty array on error
  }
};

// Fetch all payment history with optional filtering for an owner
export const getOwnerPaymentHistory = async (filters?: {
  boardingHouseId?: string;
  status?: string;
  daysOverdue?: number;
}): Promise<PaymentData[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.boardingHouseId) params.append('houseId', filters.boardingHouseId);
    if (filters?.status) params.append('status', filters.status);

    const response = await fetch(`${BASE_URL}/payments/owner-history?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('bb_access_token')}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch payment history');
    return response.json();
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

// Get financial overview metrics - calculates from boarding places data
export const getFinancialOverview = async (): Promise<FinancialOverview> => {
  try {
    // Fetch boarding houses to calculate overview
    const houses = await getOwnerBoardingPlaces();
    
    if (!houses || houses.length === 0) {
      return {
        totalExpected: 0,
        totalCollected: 0,
        totalDeficit: 0,
        collectionPercentage: 0,
        overdueCount: 0,
      };
    }

    // Calculate totals from houses and their rooms/tenants
    let totalExpected = 0;
    let totalCollected = 0;
    let overdueCount = 0;

    houses.forEach((house: any) => {
      if (house.rooms && Array.isArray(house.rooms)) {
        house.rooms.forEach((room: any) => {
          if (room.tenants && Array.isArray(room.tenants)) {
            room.tenants.forEach((tenant: any) => {
              if (tenant.monthlyRent) {
                totalExpected += tenant.monthlyRent;
                if (tenant.paymentStatus === 'paid') {
                  totalCollected += tenant.monthlyRent;
                } else if (tenant.paymentStatus === 'overdue') {
                  overdueCount += 1;
                }
              }
            });
          }
        });
      }
    });

    const collectionPercentage = totalExpected > 0 
      ? Math.round((totalCollected / totalExpected) * 100) 
      : 0;

    return {
      totalExpected,
      totalCollected,
      totalDeficit: totalExpected - totalCollected,
      collectionPercentage,
      overdueCount,
    };
  } catch (error) {
    console.error('Error calculating financial overview:', error);
    return {
      totalExpected: 0,
      totalCollected: 0,
      totalDeficit: 0,
      collectionPercentage: 0,
      overdueCount: 0,
    };
  }
};

// Approve a payment slip
export const approvePaymentSlip = async (slipId: string): Promise<any> => {
  try {
    const response = await fetch(`${BASE_URL}/api/payments/approve/${slipId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('bb_access_token')}`,
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
    const response = await fetch(`${BASE_URL}/api/payments/reject/${slipId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('bb_access_token')}`,
      },
      body: JSON.stringify({ rejectionReason: reason }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Error response body:', errorBody);
      throw new Error('Failed to reject payment slip');
    }
    return response.json();
  } catch (error) {
    console.error('Error rejecting payment slip:', error);
    throw error;
  }
};

// Download payment slip (gets the file URL)
export const downloadPaymentSlip = async (slipId: string): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/api/payments/download/${slipId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('bb_access_token')}`,
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

// ============================================
// OWNER PAYMENT DASHBOARD FUNCTIONS
// ============================================

/**
 * Fetch dashboard stats for a boarding house
 * Returns: totalTenants, paidTenants, overdueCount, totalCollected
 */
export const fetchDashboardStats = async (boardingHouseId: string): Promise<DashboardStatsDto> => {
  try {
    const token = localStorage.getItem('bb_access_token');
    console.log('📊 Fetching dashboard stats for:', boardingHouseId);

    const response = await fetch(`${BASE_URL}/owner/boarding-houses/${boardingHouseId}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch dashboard stats');
    }

    const data = await response.json();
    console.log('✅ Stats loaded:', data.data);
    return data.data as DashboardStatsDto;
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Fetch rooms overview for a boarding house with occupancy status
 * Returns: Array of rooms with current tenant info
 */
export const fetchRoomsOverview = async (boardingHouseId: string): Promise<RoomOverviewDto[]> => {
  try {
    const token = localStorage.getItem('bb_access_token');
    const url = `${BASE_URL}/owner/boarding-houses/${boardingHouseId}/rooms-overview`;
    
    console.log('🏠 Fetching rooms overview:');
    console.log('   URL:', url);
    console.log('   Boarding House ID:', boardingHouseId);
    console.log('   Token present:', !!token);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('   Response status:', response.status);
    console.log('   Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('   Error response:', errorData);
      throw new Error(errorData.message || `API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Rooms loaded:', data.data?.length || 0, 'rooms');
    console.log('   Room data:', data.data);
    return data.data as RoomOverviewDto[];
  } catch (error) {
    console.error('❌ Error fetching rooms overview:', error);
    throw error;
  }
};

/**
 * Fetch payment ledger for a boarding house
 * Returns: Array of payment history sorted by due date (or custom sort)
 */
export const fetchPaymentLedger = async (
  boardingHouseId: string,
  sortBy: 'dueDate' | 'status' | 'studentName' = 'dueDate'
): Promise<PaymentLedgerEntryDto[]> => {
  try {
    const token = localStorage.getItem('bb_access_token');
    console.log('💳 Fetching payment ledger for:', boardingHouseId, 'sortBy:', sortBy);

    const response = await fetch(
      `${BASE_URL}/owner/boarding-houses/${boardingHouseId}/payment-ledger?sortBy=${sortBy}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch payment ledger');
    }

    const data = await response.json();
    console.log('✅ Payment ledger loaded:', data.data?.length || 0, 'entries');
    return data.data as PaymentLedgerEntryDto[];
  } catch (error) {
    console.error('❌ Error fetching payment ledger:', error);
    throw error;
  }
};
