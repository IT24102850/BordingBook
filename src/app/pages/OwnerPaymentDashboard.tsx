import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Loader } from 'lucide-react';
import {
  fetchDashboardStats,
  fetchRoomsOverview,
  fetchPaymentLedger,
  DashboardStatsDto,
  RoomOverviewDto,
  PaymentLedgerEntryDto,
} from '../api/paymentApi';

/**
 * Owner Payment Dashboard Page
 * Displays: Metrics Cards, Rooms Overview, Payment Ledger for a boarding house
 */
export default function OwnerPaymentDashboard() {
  const { boardingHouseId } = useParams<{ boardingHouseId: string }>();
  const navigate = useNavigate();

  // State Management
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [rooms, setRooms] = useState<RoomOverviewDto[]>([]);
  const [ledger, setLedger] = useState<PaymentLedgerEntryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data in parallel when component mounts
  useEffect(() => {
    if (!boardingHouseId) {
      setError('Boarding house ID not found');
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🚀 Starting to fetch dashboard data for boarding house:', boardingHouseId);
        console.log('   Component mounted, fetching stats, rooms, and ledger...');

        // Fetch all 3 data sets in parallel
        const [statsData, roomsData, ledgerData] = await Promise.all([
          fetchDashboardStats(boardingHouseId),
          fetchRoomsOverview(boardingHouseId),
          fetchPaymentLedger(boardingHouseId, 'dueDate'),
        ]);

        // Update state
        console.log('📊 Stats:', statsData);
        console.log('🏠 Rooms:', roomsData);
        console.log('💳 Ledger:', ledgerData);

        setStats(statsData);
        setRooms(roomsData);
        setLedger(ledgerData);

        console.log('✅ Dashboard data loaded successfully');
        console.log('   Total rooms:', roomsData?.length || 0);
        console.log('   Total ledger entries:', ledgerData?.length || 0);
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to load dashboard data';
        console.error('❌ Error loading dashboard:', errorMsg);
        console.error('   Full error:', err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [boardingHouseId]);

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="mb-8 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          {/* Loading Skeleton */}
          <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="h-24 bg-slate-800 rounded-lg animate-pulse" />

            {/* Metrics Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>

            {/* Rooms Skeleton */}
            <div className="h-64 bg-slate-800 rounded-lg animate-pulse" />

            {/* Ledger Skeleton */}
            <div className="h-96 bg-slate-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="mb-8 flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>

          {/* Error Message */}
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle size={24} className="text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Failed to Load Dashboard</h3>
              <p className="text-red-400/80">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // SUCCESS STATE
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/30 rounded-lg p-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{stats?.boardingHouseName || 'Loading...'}</h1>
              <p className="text-slate-400 flex items-center gap-2">
                <span>📍 {rooms.length > 0 ? rooms[0].location : 'Location'}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-cyan-400">{rooms.length}</div>
              <div className="text-sm text-slate-400">TOTAL ROOMS</div>
            </div>
          </div>
        </div>

        {/* Metrics Cards - 4 stat boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Tenants */}
          <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/30 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-2">TOTAL TENANTS</div>
                <div className="text-3xl font-bold text-white">{stats?.totalTenants || 0}</div>
              </div>
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          {/* Paid Tenants - HIDDEN */}
          <div className="bg-slate-800/50 backdrop-blur border border-green-500/30 rounded-lg p-6 hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-2">PAID TENANTS</div>
                <div className="text-3xl font-bold text-green-400">{stats?.paidTenants || 0}</div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          {/* Overdue Count - HIDDEN */}
          <div className="bg-slate-800/50 backdrop-blur border border-red-500/30 rounded-lg p-6 hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-2">OVERDUE</div>
                <div className="text-3xl font-bold text-red-400">{stats?.overdueCount || 0}</div>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>

          {/* Total Collected - HIDDEN */}
          <div className="bg-slate-800/50 backdrop-blur border border-blue-500/30 rounded-lg p-6 hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-2">TOTAL COLLECTED</div>
                <div className="text-3xl font-bold text-blue-400">
                  Rs. {(stats?.totalCollected || 0).toLocaleString()}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Overview */}
        <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🏠</span> Rooms Overview
            <span className="ml-auto text-sm text-cyan-400 bg-cyan-500/20 px-3 py-1 rounded">
              {rooms.length} TOTAL ROOMS
            </span>
          </h2>

          {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <p className="text-lg font-semibold text-slate-300 mb-2">No Rooms Available</p>
              <p className="text-sm text-slate-400 max-w-md mb-4">
                No rooms have been added to this boarding house yet. Please add rooms first through the admin panel.
              </p>
              <p className="text-xs text-slate-500">
                If you believe this is an error, please contact support. Boarding House ID: {boardingHouseId}
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <p className="text-sm text-slate-400">Displaying all {rooms.length} rooms in this boarding house</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`rounded-lg p-5 border-2 transition-all hover:shadow-lg ${
                      room.occupancyStatus === 'AVAILABLE'
                        ? 'bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/50 hover:border-emerald-400/80 hover:shadow-emerald-500/20'
                        : 'bg-slate-700/50 border-slate-600 hover:border-blue-500/50 hover:shadow-blue-500/20'
                    }`}
                  >
                    {/* Room Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className={`text-sm font-medium ${room.occupancyStatus === 'AVAILABLE' ? 'text-emerald-400' : 'text-slate-400'}`}>
                          Room {room.roomNumber}
                        </div>
                        <div className="text-lg font-semibold text-white">{room.name}</div>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                          room.occupancyStatus === 'AVAILABLE'
                            ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }`}
                      >
                        {room.occupancyStatus === 'AVAILABLE' ? 'AVAILABLE ✓' : 'OCCUPIED'}
                      </span>
                    </div>

                    {/* Room Details */}
                    <div className="space-y-2 text-sm mb-4 bg-slate-800/40 rounded p-3">
                      <div className="flex justify-between text-slate-300">
                        <span>Price:</span>
                        <span className={`font-semibold ${room.occupancyStatus === 'AVAILABLE' ? 'text-emerald-400' : 'text-white'}`}>
                          Rs. {room.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Beds:</span>
                        <span className="text-white">{room.bedCount}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Location:</span>
                        <span className="text-white text-xs">{room.location}</span>
                      </div>
                      {room.facilities && room.facilities.length > 0 && (
                        <div className="pt-2 border-t border-slate-700">
                          <div className="text-xs text-slate-400 mb-2">Facilities:</div>
                          <div className="flex flex-wrap gap-1">
                            {room.facilities.map((facility, idx) => (
                              <span key={idx} className="text-xs bg-slate-700/50 px-2 py-1 rounded text-slate-300">
                                {facility}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    {room.occupancyStatus === 'AVAILABLE' ? (
                      <div className="text-center py-3 bg-emerald-500/20 rounded border border-emerald-500/30">
                        <div className="text-sm font-semibold text-emerald-300">Ready for Booking</div>
                        <div className="text-xs text-emerald-400/70">No current tenant</div>
                      </div>
                    ) : (
                      <div>
                        {room.currentTenant ? (
                          <div className="bg-blue-600/20 rounded p-3 border border-blue-500/30">
                            <div className="text-xs text-blue-400 mb-1 font-medium">Current Tenant</div>
                            <div className="font-medium text-white text-sm">{room.currentTenant.name}</div>
                            <div className="text-xs text-blue-300/70 mt-1">{room.currentTenant.email}</div>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-slate-400 text-sm">No tenant info</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Payment Ledger */}
        <div className="bg-slate-800/50 backdrop-blur border border-cyan-500/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>💳</span> Tenant Payment Ledger
            <span className="ml-auto text-sm text-cyan-400 bg-cyan-500/20 px-3 py-1 rounded">
              SORTED BY DUE DATE
            </span>
          </h2>

          {ledger.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <p>No payment records</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Student Name</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Room</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Due Date</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Paid Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-4 text-white">
                        <div className="font-medium">{entry.studentName}</div>
                        <div className="text-xs text-slate-400">{entry.studentEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="font-medium">
                          {entry.roomNumber && entry.roomNumber !== 'N/A' ? `Room ${entry.roomNumber}` : 'Room N/A'}
                        </span>
                        {entry.roomName && entry.roomName !== 'N/A' && (
                          <div className="text-xs text-slate-500 mt-1">{entry.roomName}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-white font-semibold">
                        Rs. {entry.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            entry.paymentStatus === 'paid'
                              ? 'bg-green-500/20 text-green-400'
                              : entry.paymentStatus === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {entry.paymentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {new Date(entry.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {entry.paidDate
                          ? new Date(entry.paidDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
