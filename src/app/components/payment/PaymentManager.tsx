import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, CheckCircle, XCircle, Loader2, Download, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { generatePaymentReceiptPDF } from '../../helpers/generateReceipt';
import * as paymentApi from '../../api/paymentApi';

interface Tenant {
  id: string;
  name: string;
  roomId: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  monthlyRent: number;
  outstandingBalance?: number;
  dueDate: string;
  checkInDate: string;
  trustScore?: 'high' | 'medium' | 'low';
}

interface Room {
  id: string;
  roomNumber: string;
  bedCount: number;
  tenants: Tenant[];
}

interface BoardingHouse {
  _id?: string;
  id?: string;
  name: string;
  address: string;
  city?: string;
  monthlyPrice?: number;
  roomCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  ownerId?: string;
  totalRooms?: number;
  totalTenants?: number;
  availableRooms?: number;
  rooms?: Room[];
}

interface PaymentSlip {
  id: string;
  tenantName: string;
  roomNumber: string;
  placeId: string;
  placeName: string;
  amount: number;
  originalRent: number;
  date: string;
  trustScore?: 'high' | 'medium' | 'low';
  slipUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function PaymentManager() {
  const navigate = useNavigate();

  // State management
  const [boardingHouses, setBoardingHouses] = useState<BoardingHouse[]>([]);
  const [pendingSlips, setPendingSlips] = useState<PaymentSlip[]>([]);
  const [financialOverview, setFinancialOverview] = useState({
    totalExpected: 0,
    totalCollected: 0,
    totalDeficit: 0,
    collectionPercentage: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingSlipId, setProcessingSlipId] = useState<string | null>(null);
  const [rejectingSlip, setRejectingSlip] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<PaymentSlip | null>(null);
  const [downloadingSlipId, setDownloadingSlipId] = useState<string | null>(null);

  // Fetch data from API - ONLY REAL DATA FROM DATABASE
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch boarding houses from REAL API (no mock data fallback)
      const housesData = await paymentApi.getOwnerBoardingPlaces();
      const pendingSlipsData = await paymentApi.getPendingPayments();
      setPendingSlips(pendingSlipsData);
      
      // If no boarding places, show error message and empty state
      if (!housesData || housesData.length === 0) {
        setError('No boarding places found');
        setBoardingHouses([]);
        setPendingSlips([]);
        setFinancialOverview({
          totalExpected: 0,
          totalCollected: 0,
          totalDeficit: 0,
          collectionPercentage: 0,
          overdueCount: 0,
        });
        return;
      }

      // DEDUPLICATION: Remove duplicates based on ID
      const uniqueHouses = Array.from(
        new Map(
          housesData.map((house: any) => [
            house._id || house.id,
            house
          ])
        ).values()
      );

      console.log('📊 Boarding Houses - Before dedup:', housesData.length, 'After dedup:', uniqueHouses.length);
      if (housesData.length !== uniqueHouses.length) {
        console.warn('⚠️ Duplicates removed:', housesData.length - uniqueHouses.length);
      }

      setBoardingHouses(uniqueHouses || []);

      // Fetch financial overview
      const overviewData = await paymentApi.getFinancialOverview();
      setFinancialOverview(overviewData || {
        totalExpected: 0,
        totalCollected: 0,
        totalDeficit: 0,
        collectionPercentage: 0,
      });
    } catch (err: any) {
      console.error('Error fetching payment data:', err);
      setError(err?.message || 'Failed to load payment data. Please try again.');
      // NO FALLBACK TO MOCK DATA - Show actual error to user
      setBoardingHouses([]);
      setPendingSlips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApproveSlip = async (slip: PaymentSlip) => {
    if (!window.confirm(`Approve Rs.${(slip.amount || 0).toLocaleString()} payment from ${slip.tenantName}?\n\nThis will generate an official receipt and notify the tenant.`)) {
      return;
    }

    setProcessingSlipId(slip.id);
    try {
      // Call API to approve slip
      await paymentApi.approvePaymentSlip(slip.id);

      // Generate receipt PDF
      const doc = generatePaymentReceiptPDF({
        tenantName: slip.tenantName,
        roomNumber: slip.roomNumber,
        placeName: slip.placeName,
        amount: slip.amount,
        date: slip.date,
        receiptNumber: `REC-${Math.floor(Math.random() * 100000)}`,
        paymentMethod: 'Bank Transfer'
      });
      doc.save(`receipt_${slip.tenantName.replace(/\s+/g, '_')}_${slip.date}.pdf`);

      // Remove slip from pending list
      setPendingSlips(prev => prev.filter(s => s.id !== slip.id));
    } catch (err) {
      console.error('Error approving slip:', err);
      alert('Failed to approve payment slip. Please try again.');
    } finally {
      setProcessingSlipId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (rejectReason.trim().length < 10) {
      setRejectError('Please provide a reason of at least 10 characters so the student knows why their slip was rejected.');
      return;
    }

    setProcessingSlipId(rejectingSlip.id);
    try {
      // Call API to reject slip
      await paymentApi.rejectPaymentSlip(rejectingSlip.id, rejectReason);

      // Remove slip from pending list
      setPendingSlips(prev => prev.filter(s => s.id !== rejectingSlip.id));
      setRejectingSlip(null);
      setRejectReason('');
      setRejectError('');
    } catch (err) {
      console.error('Error rejecting slip:', err);
      alert('Failed to reject payment slip. Please try again.');
    } finally {
      setProcessingSlipId(null);
    }
  };

  const handleDownloadSlip = async (slip: PaymentSlip) => {
    if (!slip.slipUrl) {
      alert('Payment slip image is not available for download.');
      return;
    }

    setDownloadingSlipId(slip.id);
    try {
      const url = await paymentApi.downloadPaymentSlip(slip.id);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-slip-${slip.tenantName}-${slip.date}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading slip:', err);
      alert('Failed to download payment slip. Please try again.');
    } finally {
      setDownloadingSlipId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="animate-spin text-cyan-400 mb-3" size={32} />
        <p className="text-white text-sm font-medium">Loading payment data...</p>
        <p className="text-gray-400 text-xs mt-1">This may take a moment</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Owner Payment Dashboard</h2>
        <button
          onClick={() => fetchData()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 text-xs font-medium transition-all border border-white/10"
          title="Refresh data"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-300">{error}</p>
            <p className="text-xs text-rose-300/60 mt-1">Please contact support if this persists.</p>
            <button 
              onClick={() => fetchData()}
              className="text-xs text-rose-400 hover:text-rose-300 mt-2 font-medium underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Financial Overview Analytics - HIDDEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 hidden">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <p className="text-sm font-medium text-gray-400 mb-1">Expected Revenue</p>
          <p className="text-3xl font-bold text-white tracking-tight">Rs. {(financialOverview?.totalExpected || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Total rent for occupied rooms</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <p className="text-sm font-medium text-emerald-400/80 mb-1">Total Collected</p>
          <p className="text-3xl font-bold text-emerald-400 tracking-tight">Rs. {(financialOverview?.totalCollected || 0).toLocaleString()}</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Collection Rate</span>
              <span className="text-emerald-400 font-medium">{financialOverview?.collectionPercentage || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${financialOverview?.collectionPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-900/40 to-slate-900 border border-rose-500/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <p className="text-sm font-medium text-rose-400/80 mb-1">Outstanding Deficit</p>
          <p className="text-3xl font-bold text-rose-400 tracking-tight">Rs. {(financialOverview?.totalDeficit || 0).toLocaleString()}</p>
          <p className="text-xs text-rose-400/60 mt-2 flex items-center gap-1">
            <AlertCircle size={12} /> Needs follow-up
          </p>
        </div>
      </div>

      {/* Review Payment Slips Section */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg relative mb-6">
        <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
          <ImageIcon size={18} /> Payment Slip Review Gallery
          {pendingSlips.length > 0 && (
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-xs">
              {pendingSlips.length}
            </span>
          )}
        </h3>

        {/* Detailed List View */}
        <div className="space-y-3">
          {pendingSlips.length > 0 ? (
            pendingSlips.map((slip, index) => (
              <div key={`slip-detail-${slip.id}-${index}`} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 border border-amber-500/20 rounded-xl hover:bg-white/10 transition-colors">
                <div className="mb-3 md:mb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm text-white font-semibold">{slip.tenantName}</p>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">{slip.placeName}</span>
                    {slip.trustScore === 'high' && <span title="Excellent Trust Score" className="flex items-center text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"><CheckCircle size={10} className="mr-0.5" /> Reliable</span>}
                    {slip.trustScore === 'medium' && <span title="Moderate Risk - Review Carefully" className="flex items-center text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"><AlertCircle size={10} className="mr-0.5" /> Moderate Risk</span>}
                    {slip.trustScore === 'low' && <span title="High Risk - History of late payments" className="flex items-center text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20"><AlertCircle size={10} className="mr-0.5" /> High Risk</span>}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-3">
                    <span>Room {slip.roomNumber}</span>
                    <span>•</span>
                    <span>Paid on {slip.date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">Rs. {(slip.amount || 0).toLocaleString()}</p>
                    {(slip.amount || 0) < (slip.originalRent || 0) ? (
                      <p className="text-[10px] text-amber-400 font-medium">Partial (Owes Rs. {((slip.originalRent || 0) - (slip.amount || 0)).toLocaleString()})</p>
                    ) : (
                      <p className="text-[10px] text-gray-500">Full Rent Uploaded</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadSlip(slip)}
                      disabled={downloadingSlipId === slip.id}
                      className="flex items-center justify-center p-2 bg-white/5 hover:bg-white/10 rounded-lg text-cyan-400 transition-colors border border-white/10"
                      title="Download payment slip"
                    >
                      {downloadingSlipId === slip.id ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    </button>
                    <button
                      onClick={() => setSelectedSlip(slip)}
                      className="flex items-center justify-center p-2 bg-white/5 hover:bg-white/10 rounded-lg text-indigo-400 transition-colors border border-white/10 disabled:opacity-50"
                      title="View slip details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleApproveSlip(slip)}
                      disabled={processingSlipId === slip.id}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-lg text-emerald-400 transition-all border border-emerald-500/20 disabled:opacity-50"
                      title={slip.amount < slip.originalRent ? "Approve as Partial Payment" : "Approve Full Payment"}
                    >
                      {processingSlipId === slip.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      <span className="text-xs font-semibold hidden sm:inline">{slip.amount < slip.originalRent ? "Approve Partial" : "Approve"}</span>
                    </button>
                    <button
                      onClick={() => { setRejectingSlip(slip); setRejectReason(''); setRejectError(''); }}
                      disabled={processingSlipId === slip.id}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-rose-500/20 hover:bg-rose-500/40 rounded-lg text-rose-400 transition-all border border-rose-500/20 disabled:opacity-50"
                      title="Reject Payment"
                    >
                      <XCircle size={16} />
                      <span className="text-xs font-semibold hidden sm:inline">Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-white/5 rounded-xl">
              <CheckCircle size={32} className="mb-3 text-white/20" />
              <p className="text-sm font-medium">You're all caught up!</p>
              <p className="text-xs mt-1 opacity-60">No pending payment slips to review at the moment.</p>
            </div>
          )}
        </div>

        {/* Global Processing Overlay */}
        {processingSlipId && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 transition-all">
            <div className="bg-slate-800 border border-cyan-500/30 p-4 rounded-xl shadow-2xl flex items-center gap-3">
              <Loader2 className="animate-spin text-cyan-400" size={20} />
              <span className="text-sm font-medium text-cyan-50">Processing payment slip...</span>
            </div>
          </div>
        )}
      </div>

      {/* Select Boarding Place Section */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Manage Boarding Places</h3>
        <p className="text-xs text-gray-400 mb-6">Select a boarding place to view detailed payment status, overdue tenants, and management options.</p>

        {boardingHouses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {boardingHouses.map((place, idx) => {
              // DEBUG: Log what we actually got from the API
              if (idx === 0) {
                console.log('🏠 First Boarding Place Structure:', place);
                console.log('   Keys:', Object.keys(place));
                console.log('   Has rooms?', !!place.rooms);
                console.log('   Has totalRooms?', !!place.totalRooms);
                console.log('   Has totalTenants?', !!place.totalTenants);
              }

              // Safely calculate tenant counts from the API response
              // The API might return totalTenants directly instead of nested rooms/tenants
              const allTenantsInPlace = place.rooms 
                ? place.rooms.flatMap(r => r.tenants || []) 
                : [];
              
              const totalTenantCount = place.totalTenants || allTenantsInPlace.length || 0;
              const overdueCount = allTenantsInPlace.filter(t => t.paymentStatus === 'overdue').length;

              return (
                <div
                  key={`house-${place.id || place._id}-${idx}`}
                  onClick={() => navigate(`/payment-rental/${place.id || place._id}`)}
                  className="group p-5 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/50 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full -mr-8 -mt-8 blur-xl group-hover:bg-cyan-500/20 transition-all"></div>
                  <div className="relative z-10">
                    <h4 className="text-sm font-semibold text-white mb-2">{place.name}</h4>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="text-center">
                        <p className="text-gray-400 mb-1">TENANTS</p>
                        <p className="text-white font-bold text-lg">{totalTenantCount}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 mb-1">OVERDUE</p>
                        <p className={`font-bold text-lg ${overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{overdueCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No boarding houses found. Please add one first.</p>
          </div>
        )}
      </div>

      {/* Payment Slip Review Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSlip(null)}>
          <div className="bg-slate-800 border border-cyan-500/30 rounded-2xl shadow-2xl w-full max-w-lg p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedSlip(null)} className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors">
              <XCircle size={20} />
            </button>
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Payment Slip Review</h3>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-400">Room • Paid on</p>
                <p className="text-white font-medium">{selectedSlip.roomNumber} - {selectedSlip.date}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">Rs. {selectedSlip.amount.toLocaleString()}</p>
                <p className="text-xs text-emerald-400 flex items-center justify-end gap-1"><CheckCircle size={12} /> Full Slip Uploaded</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg text-center">
              <p className="text-sm font-medium text-white mb-2">Payment Slip - {selectedSlip.tenantName}</p>
              {/* Display payment receipt template */}
              <div className="w-full flex justify-center">
                <embed 
                  src="/payment-receipt.pdf" 
                  type="application/pdf" 
                  width="100%" 
                  height="500px"
                  className="rounded-lg border border-white/10"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button 
                onClick={() => handleDownloadSlip(selectedSlip)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-lg text-indigo-300 transition-all border border-indigo-500/30"
              >
                <Download size={16} /> Download
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    handleApproveSlip(selectedSlip);
                    setSelectedSlip(null);
                  }}
                  className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-lg text-emerald-300 transition-all border border-emerald-500/30"
                >
                  Approve
                </button>
                <button 
                  onClick={() => {
                    setRejectingSlip(selectedSlip);
                    setSelectedSlip(null);
                  }}
                  className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/40 rounded-lg text-rose-300 transition-all border border-rose-500/30"
                >
                  Reject
                </button>
                <button onClick={() => setSelectedSlip(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 ring-1 ring-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-rose-500/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle size={18} className="text-rose-400" /> Reject Payment Slip
              </h3>
              <button onClick={() => setRejectingSlip(null)} className="text-gray-500 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all">
                <XCircle size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-sm text-white font-semibold">{rejectingSlip.tenantName}</p>
                <p className="text-xs text-gray-400 mt-0.5">{rejectingSlip.placeName} · Room {rejectingSlip.roomNumber} · Rs.{rejectingSlip.amount.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2">Reason for Rejection (Required)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => { setRejectReason(e.target.value); setRejectError(''); }}
                  rows={3}
                  className={`w-full bg-white/5 border rounded-xl py-2.5 px-4 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 transition-all resize-none outline-none ${rejectError ? 'border-rose-500/70 focus:ring-rose-500/30' : 'border-white/10 focus:ring-rose-500/40 focus:border-rose-500/50'}`}
                  placeholder="e.g. The amount on the slip doesn't match the uploaded amount..."
                />
                {rejectError && <p className="text-[10px] text-rose-400 mt-1 font-medium">{rejectError}</p>}
                <p className="text-[10px] text-gray-500 mt-1">Minimum 10 characters required</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRejectingSlip(null)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 text-sm font-semibold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="flex-1 px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/40 rounded-lg text-rose-400 text-sm font-semibold transition-all border border-rose-500/30"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
