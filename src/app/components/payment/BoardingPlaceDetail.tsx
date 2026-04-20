import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, AlertCircle, Trash2, Star, MapPin, Home, Users as UsersIcon, CreditCard, ChevronRight, X, CheckCircle, Navigation, TrendingUp, TrendingDown, Clock, ShieldAlert, Bell } from 'lucide-react';

interface Tenant {
  id: string;
  studentId: string;
  name: string;
  roomId: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  monthlyRent: number;
  outstandingBalance?: number;
  dueDate: string;
  checkInDate: string;
  nextPaymentCycleStartDate?: string;
  phone?: string;
  email?: string;
  trustScore?: 'high' | 'medium' | 'low';
}

interface Room {
  id: string;
  roomNumber: string;
  bedCount: number;
  occupiedBeds: number;
  price: number;
  status: 'available' | 'partial' | 'full';
  tenants: Tenant[];
}

interface BoardingHouse {
  _id?: string;
  id?: string;
  name: string;
  address: string;
  city?: string;
  image?: string;
  rating?: number;
  totalReviews?: number;
  totalRooms?: number;
  occupiedRooms?: number;
  monthlyPrice?: number;
  roomCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  totalTenants?: number;
  availableRooms?: number;
  rooms: Room[];
}

interface PaymentReceipt {
  _id: string;
  paymentId: string;
  amount: number;
  uploadDate: string;
  approvalDate?: string;
  status: 'pending' | 'approved' | 'rejected';
  fileName: string;
  month?: string;
  paidDate?: string;
}

// Utility function to calculate days overdue
const getDaysOverdue = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const isOverdue10Plus = (dueDate: string) => getDaysOverdue(dueDate) >= 10;

export default function BoardingPlaceDetail() {
  const navigate = useNavigate();
  const { placeId } = useParams<{ placeId: string }>();
  const [place, setPlace] = useState<BoardingHouse | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [paymentReceipts, setPaymentReceipts] = useState<Map<string, PaymentReceipt[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removedTenants, setRemovedTenants] = useState<Set<string>>(new Set());
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [confirmRemoveTenant, setConfirmRemoveTenant] = useState<Tenant | null>(null);
  const [remindedTenants, setRemindedTenants] = useState<Set<string>>(new Set());
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [confirmReminderModal, setConfirmReminderModal] = useState(false);
  const [tenantForReminder, setTenantForReminder] = useState<Tenant | null>(null);
  const [sendingReminder, setSendingReminder] = useState(false);

  // Fetch accepted booking agreements as tenants
  const fetchPlace = useCallback(async () => {
    if (!placeId) {
      setError('No boarding place ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';
      
      // Fetch boarding house details
      const placeResponse = await fetch(
        `${apiUrl}/payments/boarding-places`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('bb_access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!placeResponse.ok) throw new Error('Failed to fetch boarding places');
      
      const placeData = await placeResponse.json();
      const allPlaces = placeData.data || [];
      const foundPlace = allPlaces.find((p: any) => 
        p._id === placeId || p.id === placeId
      );

      if (!foundPlace) {
        setError('Boarding place not found');
        setPlace(null);
        setTenants([]);
      } else {
        setPlace({
          ...foundPlace,
          id: foundPlace._id || foundPlace.id,
          rooms: foundPlace.rooms || []
        });

        // Fetch accepted booking agreements for this boarding house
        const agreementsResponse = await fetch(
          `${apiUrl}/owner/agreements?status=accepted`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('bb_access_token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!agreementsResponse.ok) throw new Error('Failed to fetch agreements');
        
        const agreementsData = await agreementsResponse.json();
        const agreements = agreementsData.data || [];

        // Filter agreements for this boarding house and transform to tenant format
        const boardingHouseId = foundPlace._id || foundPlace.id;
        const tenantsList: Tenant[] = agreements
          .filter((agr: any) => agr.boardingHouseId === boardingHouseId || agr.boardingHouseId._id === boardingHouseId)
          .map((agr: any) => {
            const extractedStudentId = agr.studentId?._id || agr.studentId;
            console.log('📝 Tenant Mapping - StudentId:', extractedStudentId, 'Name:', agr.studentId?.fullName);
            return ({
            id: agr._id,
            studentId: extractedStudentId,
            name: agr.studentId?.fullName || 'Unknown',
            roomId: agr.roomId?._id || '',
            monthlyRent: agr.rentAmount,
            paymentStatus: 'pending' as const,
            dueDate: agr.periodEnd,
            checkInDate: agr.periodStart,
            phone: agr.studentId?.mobileNumber || agr.studentId?.phoneNumber,
            email: agr.studentId?.email,
          });
          });

        // Fetch next payment cycle start dates for each tenant
        const enhancedTenants = await Promise.all(
          tenantsList.map(async (tenant) => {
            try {
              const cycleResponse = await fetch(
                `${apiUrl}/owner/tenants/${tenant.studentId}/next-payment-cycle`,
                { headers: { 'Authorization': `Bearer ${localStorage.getItem('bb_access_token')}` } }
              );
              
              if (cycleResponse.ok) {
                const cycleData = await cycleResponse.json();
                return {
                  ...tenant,
                  nextPaymentCycleStartDate: cycleData.data?.nextPaymentCycleStartDate,
                };
              }
              return tenant;
            } catch (error) {
              console.warn(`Failed to fetch next cycle for student ${tenant.studentId}`);
              return tenant;
            }
          })
        );

        setTenants(enhancedTenants);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
      setPlace(null);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  // Fetch payment receipts for a specific tenant
  const fetchTenantReceipts = useCallback(async (studentId: string) => {
    try {
      setLoadingReceipts(true);
      const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';
      
      const response = await fetch(
        `${apiUrl}/owner/students/${studentId}/receipts`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('bb_access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch receipts');
      
      const data = await response.json();
      const receipts = data.data || [];
      
      setPaymentReceipts(prev => new Map(prev).set(studentId, receipts));
    } catch (err: any) {
      console.error('Error fetching receipts:', err);
    } finally {
      setLoadingReceipts(false);
    }
  }, []);

  useEffect(() => {
    fetchPlace();
  }, [fetchPlace]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
        <div className="text-cyan-400 mb-3">Loading...</div>
        <p className="text-gray-400 text-sm">Fetching boarding place details</p>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
        <div className="text-center p-6 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <div className="text-rose-400 font-bold mb-2">Error</div>
          <p className="text-gray-300 mb-4">{error || 'Boarding place not found'}</p>
          <button
            onClick={() => navigate('/payment-rental')}
            className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 rounded-lg text-cyan-400 transition-all border border-cyan-500/30"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Continue with the rest of the component logic using the fetched 'place'

  const allTenants = tenants.filter(t => !removedTenants.has(t.id));
  const paidCount = allTenants.filter(t => t.paymentStatus === 'paid').length;
  const overdueCount = allTenants.filter(t => t.paymentStatus === 'overdue').length;
  const totalCollected = allTenants.filter(t => t.paymentStatus === 'paid').reduce((sum, t) => sum + t.monthlyRent, 0);

  const handleRemoveTenant = async (tenant: Tenant) => {
    try {
      // Calculate days since next payment cycle started
      if (!tenant.nextPaymentCycleStartDate) {
        alert('Payment cycle start date not available. Cannot remove tenant.');
        return;
      }

      const cycleStartDate = new Date(tenant.nextPaymentCycleStartDate);
      cycleStartDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const timeDiff = today.getTime() - cycleStartDate.getTime();
      const daysSinceCycleStart = Math.floor(timeDiff / (1000 * 3600 * 24));

      console.log(`🗑️  Attempting to remove tenant ${tenant.name}`);
      console.log(`   Cycle start date: ${cycleStartDate.toDateString()}`);
      console.log(`   Today: ${today.toDateString()}`);
      console.log(`   Days since cycle start: ${daysSinceCycleStart}`);

      // Check if at least 5 days have passed since cycle start
      if (daysSinceCycleStart < 5) {
        const daysRemaining = 5 - daysSinceCycleStart;
        alert(`Cannot remove tenant yet. Please wait ${daysRemaining} more day${daysRemaining !== 1 ? 's' : ''} after the payment cycle starts.`);
        setConfirmRemoveTenant(null);
        return;
      }

      // Call backend to cancel agreement
      const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(
        `${apiUrl}/owner/agreements/${tenant.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('bb_access_token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel agreement');
      }

      const data = await response.json();
      console.log(`✅ Agreement cancelled successfully:`, data);

      // Remove from UI
      const newRemoved = new Set(removedTenants);
      newRemoved.add(tenant.id);
      setRemovedTenants(newRemoved);

      alert(`${tenant.name}'s agreement has been cancelled.`);
      setConfirmRemoveTenant(null);
    } catch (error) {
      console.error('Error removing tenant:', error);
      alert('Failed to remove tenant. Please try again.');
    }
  };

  const handleSendReminder = (tenant: Tenant) => {
    setTenantForReminder(tenant);
    setConfirmReminderModal(true);
  };

  const handleConfirmReminder = async (tenant: Tenant) => {
    try {
      setSendingReminder(true);
      const updated = new Set(remindedTenants);
      updated.add(tenant.id);
      setRemindedTenants(updated);
      
      // Calculate days until next payment cycle
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let reminderMessage = '';
      let daysLeft = 0;

      if (tenant.nextPaymentCycleStartDate) {
        const nextCycleDate = new Date(tenant.nextPaymentCycleStartDate);
        nextCycleDate.setHours(0, 0, 0, 0);

        const timeDiff = nextCycleDate.getTime() - today.getTime();
        daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

        if (daysLeft > 0) {
          reminderMessage = `💰 Payment Reminder: Next payment cycle starts on ${nextCycleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. You have ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left to submit your payment.`;
        } else if (daysLeft === 0) {
          reminderMessage = `💰 Payment Reminder: Today is the payment cycle start date (${nextCycleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}). Please submit your payment now!`;
        } else {
          reminderMessage = `💰 Payment Reminder: The payment cycle started on ${nextCycleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} ago). Please submit your payment immediately.`;
        }
      } else {
        reminderMessage = `💰 Payment Reminder: Please submit your payment as soon as possible.`;
      }

      console.log(`✅ Payment reminder sent to ${tenant.name}: ${reminderMessage}`);

      // Send reminder to backend API
      const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(
        `${apiUrl}/owner/tenants/${tenant.studentId}/send-reminder`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('bb_access_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            reminderMessage,
            daysLeft
          })
        }
      );

      if (response.ok) {
        console.log(`✅ Reminder saved to backend successfully`);
      } else {
        console.error('Failed to save reminder to backend');
      }

      setConfirmReminderModal(false);
      setTenantForReminder(null);
    } catch (error) {
      console.error('Error sending reminder:', error);
    } finally {
      setSendingReminder(false);
    }
  };

  const handleTenantClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    if (tenant.studentId) {
      fetchTenantReceipts(tenant.studentId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">

      {/* Hero Header with Blurred Background */}
      <div className="relative fixed top-12 left-0 right-0 z-40 overflow-hidden border-b border-white/10 shadow-2xl">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 blur-xl scale-110"
          style={{ backgroundImage: `url(${place.image})` }}
        ></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/80"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate('/payment-rental')}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all mb-6 text-sm backdrop-blur-md w-fit"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2 tracking-tight">{place.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-inner">
                  <MapPin size={14} className="text-cyan-400" />
                  {place.address}
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-inner">
                  <Star size={14} className="text-amber-400 fill-amber-400" />
                  <span className="text-gray-300 font-medium">{place.rating}</span> ({place.totalReviews} reviews)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md shadow-lg">
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <Home size={24} className="text-cyan-400" />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white leading-none">{place.occupiedRooms}<span className="text-base text-gray-500 font-normal">/{place.totalRooms}</span></p>
                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1 font-semibold">Rooms Filled</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 pt-[200px] pb-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="absolute -right-4 -bottom-4 bg-indigo-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-widest font-semibold text-gray-400 mb-1">Total Tenants</p>
                <p className="text-3xl font-black text-white">{allTenants.length}</p>
              </div>
              <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/20 shadow-inner">
                <UsersIcon size={20} className="text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-emerald-500/30 hover:bg-emerald-900/10 transition-all hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-black text-emerald-400">{paidCount}</p>
              </div>
              <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/20 shadow-inner">
                <CheckCircle size={20} className="text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-rose-500/30 hover:bg-rose-900/10 transition-all hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-black text-rose-400">{overdueCount}</p>
              </div>
              <div className="p-2.5 bg-rose-500/20 rounded-xl border border-rose-500/20 shadow-inner">
                <Clock size={20} className="text-rose-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-5 shadow-xl relative overflow-hidden group hover:border-cyan-500/40 hover:bg-cyan-900/10 transition-all hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-black text-cyan-400 tracking-tight">Rs.{totalCollected.toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-cyan-500/20 rounded-xl border border-cyan-500/30 shadow-inner">
                <TrendingUp size={20} className="text-cyan-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Section */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/20 shadow-inner">
                <Home size={20} className="text-cyan-400" />
              </div>
              Rooms Overview
            </h2>
            <span className="text-xs font-semibold text-cyan-500/80 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 tracking-wider uppercase">
              {place.rooms?.length || 0} Total Rooms
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(place.rooms || []).length === 0 ? (
              <div className="col-span-1 md:col-span-3 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={32} className="text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-red-400 mb-2">No Rooms Found</h3>
                <p className="text-gray-400 text-sm max-w-sm">This boarding place has no rooms in the database. Please add rooms first before managing tenants.</p>
              </div>
            ) : (
              (place.rooms || []).map(room => {
                const activeTenantsInRoom = room.tenants.filter(t => !removedTenants.has(t.id));
                const isFull = activeTenantsInRoom.length >= room.bedCount;
                return (
                  <div key={room.id} className="bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 rounded-2xl p-5 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                        Room {room.roomNumber}
                      </h3>
                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border shadow-sm ${room.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        room.status === 'partial' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                        {room.status}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Occupancy</span>
                        <span className="text-white font-medium">
                          <span className={isFull ? 'text-emerald-400' : 'text-amber-400'}>{activeTenantsInRoom.length}</span> / {room.bedCount} beds
                        </span>
                      </div>

                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-white/5">
                        <div
                          className={`h-1.5 rounded-full ${isFull ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}
                          style={{ width: `${(activeTenantsInRoom.length / room.bedCount) * 100}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-gray-400 text-sm">Monthly Rate</span>
                        <span className="text-cyan-400 font-bold">Rs.{room.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Payment Calendar / Tenant Table */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4 relative z-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 rounded-xl border border-cyan-500/20 shadow-inner">
                <CreditCard size={20} className="text-cyan-400" />
              </div>
              Tenant Payment Ledger
            </h2>
            <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
              Sorted by Due Date
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {allTenants && allTenants.length > 0 ? (
              allTenants
                .slice()
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map(tenant => {
                  const daysOverdue = getDaysOverdue(tenant.dueDate);
                  const isOverdue10 = isOverdue10Plus(tenant.dueDate);
                  const dueDateObj = new Date(tenant.dueDate);
                  const formattedDate = dueDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  
                  // Use next payment cycle start date if available, otherwise display nothing
                  const displayedDate = tenant.nextPaymentCycleStartDate 
                    ? new Date(tenant.nextPaymentCycleStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '';

                  // Dynamic Status Borders & Backgrounds
                  let statusClasses = "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] border-l-4 border-l-gray-500";
                  if (tenant.paymentStatus === 'paid') {
                    statusClasses = "bg-emerald-900/10 border-emerald-500/10 hover:bg-emerald-900/20 border-l-4 border-l-emerald-500";
                  } else if (isOverdue10) {
                    statusClasses = "bg-rose-900/10 border-rose-500/10 hover:bg-rose-900/20 border-l-4 border-l-rose-500";
                  } else if (daysOverdue > 0) {
                    statusClasses = "bg-amber-900/10 border-amber-500/10 hover:bg-amber-900/20 border-l-4 border-l-amber-500";
                  }

                  return (
                    <div
                      key={tenant.id}
                      onClick={() => handleTenantClick(tenant)}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between cursor-pointer transition-all group ${statusClasses}`}
                    >
                    {/* Column 1: Tenant Info */}
                    <div className="flex-1 min-w-[200px] mb-3 md:mb-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
                          {tenant.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm text-white font-bold tracking-wide">{tenant.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {tenant.trustScore === 'high' && <span title="Excellent Trust Score" className="text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 w-fit"><CheckCircle size={8} />Reliable</span>}
                            {tenant.trustScore === 'medium' && <span title="Moderate Risk" className="text-[9px] uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1 w-fit"><AlertCircle size={8} />Watch</span>}
                            {tenant.trustScore === 'low' && <span title="High Risk" className="text-[9px] uppercase tracking-wider text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 flex items-center gap-1 w-fit"><ShieldAlert size={8} />High Risk</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Room & Contact */}
                    <div className="flex-1 min-w-[150px] mb-3 md:mb-0">
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-1"><Home size={12} /> Room {tenant.roomId || 'N/A'}</p>
                      {tenant.phone && <p className="text-xs text-gray-500 flex items-center gap-1.5"><Navigation size={12} /> {tenant.phone}</p>}
                    </div>

                    {/* Column 3: Financials */}
                    <div className="flex-1 text-left md:text-right mb-3 md:mb-0">
                      <p className="text-sm font-black text-white">Rs.{tenant.monthlyRent.toLocaleString()}</p>
                      {tenant.outstandingBalance !== undefined && tenant.outstandingBalance < tenant.monthlyRent && tenant.outstandingBalance > 0 ? (
                        <p className="text-[11px] font-bold text-amber-400 mt-0.5 bg-amber-500/10 inline-block px-1.5 rounded border border-amber-500/20">Owes Balance: Rs.{tenant.outstandingBalance.toLocaleString()}</p>
                      ) : (
                        <p className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wider">Monthly Rent</p>
                      )}
                    </div>

                    {/* Column 4: Status & Actions */}
                    <div className="flex-1 flex items-center justify-between md:justify-end gap-2 border-t border-white/5 pt-3 md:pt-0 md:border-t-0 mt-3 md:mt-0 flex-wrap">
                      <div className="text-right">
                        <p className={`text-xs font-bold uppercase tracking-wider ${tenant.paymentStatus === 'paid' ? 'text-emerald-400' : daysOverdue > 0 ? 'text-rose-400' : 'text-cyan-400'}`}>
                          {tenant.paymentStatus === 'paid' ? 'Paid' : displayedDate}
                        </p>
                        {daysOverdue > 0 && (
                          <p className="text-[10px] text-rose-400 mt-0.5 flex items-center justify-end gap-1"><Clock size={10} /> {daysOverdue} days late</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Send Reminder Button */}
                        <button
                          onClick={(e) => { 
                            e.stopPropagation();
                            handleSendReminder(tenant);
                          }}
                          className="p-2 bg-amber-500/10 hover:bg-amber-500/80 rounded-lg transition-all border border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/25 group-hover:opacity-100 opacity-70"
                          title="Send payment reminder"
                        >
                          <AlertCircle size={16} className="text-amber-400 group-hover:text-white" />
                        </button>

                        {/* Remove User Button */}
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setConfirmRemoveTenant(tenant);
                          }}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/80 rounded-lg transition-all border border-rose-500/20 hover:shadow-lg hover:shadow-rose-500/25 group-hover:opacity-100 opacity-70"
                          title="Remove user"
                        >
                          <Trash2 size={16} className="text-rose-400 group-hover:text-white" />
                        </button>

                        <ChevronRight size={18} className="text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle size={32} className="text-amber-400 mb-3" />
                <p className="text-sm text-gray-300 font-medium">No Tenants Found</p>
                <p className="text-xs text-gray-400 mt-1">No accepted booking agreements yet. Accepted tenants will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tenant Details Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#131d3a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h3 className="text-lg font-bold text-white">Payment History & Receipts</h3>
              <button onClick={() => setSelectedTenant(null)} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300 font-bold text-xl">
                  {selectedTenant.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">{selectedTenant.name}</h4>
                  <p className="text-xs text-gray-400">Room {selectedTenant.roomId} • Rent: Rs.{selectedTenant.monthlyRent.toLocaleString()}</p>
                </div>
              </div>

              <h5 className="text-sm font-semibold text-cyan-300 mb-4">Payment Receipts</h5>
              <div className="space-y-3">
                {loadingReceipts ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-cyan-400 text-sm">Loading receipts...</div>
                  </div>
                ) : (paymentReceipts.get(selectedTenant.studentId || '') || []).length > 0 ? (
                  (paymentReceipts.get(selectedTenant.studentId || '') || [])
                    .map((receipt: any) => (
                      <div key={receipt._id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/20">
                            <CheckCircle size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{receipt.cycleNumber ? `Cycle ${receipt.cycleNumber}` : 'Payment Receipt'}</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {receipt.receiptDate ? `Submitted on ${new Date(receipt.receiptDate).toLocaleDateString()}` : `Submitted on ${new Date(receipt.generatedAt || receipt.createdAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-emerald-400">Rs.{receipt.paymentAmount?.toLocaleString() || '0'}</span>
                          <button
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('bb_access_token');
                                const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';
                                const response = await fetch(`${apiUrl}/owner/students/${selectedTenant.studentId}/receipts/${receipt.receiptNumber}/download`, {
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                });
                                
                                if (!response.ok) throw new Error('Failed to download receipt');
                                
                                const blob = await response.blob();
                                const url = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.download = `${receipt.receiptNumber}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(url);
                              } catch (error) {
                                console.error('Download error:', error);
                                alert('Failed to download receipt');
                              }
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500 border border-cyan-500/30 hover:border-cyan-500 rounded-lg text-xs text-cyan-300 hover:text-white transition-all font-semibold shadow-sm hover:shadow-cyan-500/25 cursor-pointer"
                            title="Download receipt"
                          >
                            <Download size={14} />
                            Download
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <AlertCircle size={32} className="text-gray-400 mb-3" />
                    <p className="text-sm text-gray-300 font-medium">No Receipts Found</p>
                    <p className="text-xs text-gray-400 mt-1">No payment receipts available yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Remove Tenant Confirmation Modal */}
      {confirmRemoveTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 ring-1 ring-rose-500/20 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-rose-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Remove Tenant & Cancel Agreement?</h3>
              <p className="text-sm text-gray-400 mb-1">
                You are about to remove <span className="text-white font-semibold">{confirmRemoveTenant.name}</span> from the property.
              </p>
              
              {confirmRemoveTenant.nextPaymentCycleStartDate && (() => {
                const cycleStartDate = new Date(confirmRemoveTenant.nextPaymentCycleStartDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                cycleStartDate.setHours(0, 0, 0, 0);
                const daysSinceCycleStart = Math.floor((today.getTime() - cycleStartDate.getTime()) / (1000 * 3600 * 24));
                const canRemove = daysSinceCycleStart >= 5;
                const daysRemaining = canRemove ? 0 : 5 - daysSinceCycleStart;

                return (
                  <div className={`rounded-lg p-3 mt-3 ${canRemove ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                    <p className={`text-xs font-bold mb-1 ${canRemove ? 'text-emerald-300' : 'text-amber-300'}`}>
                      Next Payment Cycle: {cycleStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    {!canRemove && (
                      <p className="text-xs text-amber-200">
                        ⏳ Can remove after <strong>{daysRemaining}</strong> day{daysRemaining !== 1 ? 's' : ''} from cycle start
                      </p>
                    )}
                    {canRemove && (
                      <p className="text-xs text-emerald-200">
                        ✅ Ready to remove ({daysSinceCycleStart} days elapsed)
                      </p>
                    )}
                  </div>
                );
              })()}

              <p className="text-xs text-rose-400/80 bg-rose-500/5 border border-rose-500/10 rounded-lg p-2 mt-3">
                ⚠ This action will cancel the booking agreement and cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setConfirmRemoveTenant(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRemoveTenant(confirmRemoveTenant)}
                disabled={confirmRemoveTenant.nextPaymentCycleStartDate ? (() => {
                  const cycleStartDate = new Date(confirmRemoveTenant.nextPaymentCycleStartDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  cycleStartDate.setHours(0, 0, 0, 0);
                  const daysSinceCycleStart = Math.floor((today.getTime() - cycleStartDate.getTime()) / (1000 * 3600 * 24));
                  return daysSinceCycleStart < 5;
                })() : true}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold transition-all shadow-lg shadow-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Payment Reminder Confirmation Modal */}
      {confirmReminderModal && tenantForReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 ring-1 ring-amber-500/20 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={24} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Send Payment Reminder?</h3>
              <p className="text-sm text-gray-400 mb-3">
                Send a payment reminder to <span className="text-white font-semibold">{tenantForReminder.name}</span>
              </p>
              {tenantForReminder.nextPaymentCycleStartDate && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                  <p className="text-xs text-amber-200">
                    Next payment cycle: <span className="font-bold">{new Date(tenantForReminder.nextPaymentCycleStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </p>
                  <p className="text-xs text-amber-200 mt-1">
                    Days left: <span className="font-bold">{Math.ceil((new Date(tenantForReminder.nextPaymentCycleStartDate).getTime() - new Date().setHours(0,0,0,0)) / (1000 * 3600 * 24))}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  setConfirmReminderModal(false);
                  setTenantForReminder(null);
                }}
                disabled={sendingReminder}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmReminder(tenantForReminder)}
                disabled={sendingReminder}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sendingReminder ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  'Send Reminder'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


