import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Trash2, AlertCircle, Eye, CheckCircle, XCircle, ArrowRight, Navigation, Loader2 } from 'lucide-react';
import { generatePaymentReceiptPDF } from '../../helpers/generateReceipt';

interface Tenant {
  id: string;
  name: string;
  roomId: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  monthlyRent: number;
  outstandingBalance?: number;
  dueDate: string; // YYYY-MM-DD
  checkInDate: string;
  trustScore?: 'high' | 'medium' | 'low'; // Custom field for Risk Profiling
}

interface Room {
  id: string;
  roomNumber: string;
  bedCount: number;
  tenants: Tenant[];
}

interface BoardingHouse {
  id: string;
  name: string;
  address: string;
  rooms: Room[];
}

// Utility function to calculate days overdue
const getDaysOverdue = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

// Utility function to check if overdue 10+ days
const isOverdue10Plus = (dueDate: string) => getDaysOverdue(dueDate) >= 10;

// Mock boarding places with rooms and tenants
const mockBoardingPlaces: BoardingHouse[] = [
  {
    id: '1',
    name: 'Sunrise Boarding House',
    address: '123 Malabe, Colombo',
    rooms: [
      {
        id: '101',
        roomNumber: '101',
        bedCount: 2,
        tenants: [
          { id: 't1', name: 'Alice Perera', roomId: '101', paymentStatus: 'paid', monthlyRent: 15000, outstandingBalance: 0, dueDate: '2026-02-28', checkInDate: '2024-01-15', trustScore: 'high' },
          { id: 't2', name: 'Bob Silva', roomId: '101', paymentStatus: 'overdue', monthlyRent: 15000, outstandingBalance: 15000, dueDate: '2026-02-05', checkInDate: '2024-02-01', trustScore: 'low' },
        ]
      },
      {
        id: '102',
        roomNumber: '102',
        bedCount: 3,
        tenants: [
          { id: 't3', name: 'Charlie Brown', roomId: '102', paymentStatus: 'overdue', monthlyRent: 18000, outstandingBalance: 18000, dueDate: '2026-01-15', checkInDate: '2024-01-10', trustScore: 'low' },
          { id: 't4', name: 'Dana White', roomId: '102', paymentStatus: 'pending', monthlyRent: 18000, outstandingBalance: 18000, dueDate: '2026-03-05', checkInDate: '2024-03-01', trustScore: 'high' },
        ]
      },
    ]
  },
  {
    id: '2',
    name: 'Green Villa Boarding',
    address: '45 Kaduwela, Colombo',
    rooms: [
      {
        id: '201',
        roomNumber: '201',
        bedCount: 2,
        tenants: [
          { id: 't5', name: 'Eve Johnson', roomId: '201', paymentStatus: 'paid', monthlyRent: 12000, outstandingBalance: 0, dueDate: '2026-02-25', checkInDate: '2024-02-01', trustScore: 'high' },
          { id: 't6', name: 'Frank Miller', roomId: '201', paymentStatus: 'paid', monthlyRent: 12000, outstandingBalance: 0, dueDate: '2026-03-10', checkInDate: '2024-03-10', trustScore: 'high' },
        ]
      },
      {
        id: '202',
        roomNumber: '202',
        bedCount: 2,
        tenants: [
          { id: 't7', name: 'Grace Lee', roomId: '202', paymentStatus: 'overdue', monthlyRent: 12000, outstandingBalance: 12000, dueDate: '2026-01-10', checkInDate: '2024-01-10', trustScore: 'medium' },
        ]
      },
    ]
  },
];

export default function OwnerDashboardPayment() {
  const navigate = useNavigate();

  const [processingSlipId, setProcessingSlipId] = useState<string | null>(null);
  const [rejectingSlip, setRejectingSlip] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  // Calculate Financial Overview Metrics
  const totalExpected = mockBoardingPlaces.reduce((sum, place) =>
    sum + place.rooms.reduce((rSum, room) =>
      rSum + room.tenants.reduce((tSum, t) => tSum + t.monthlyRent, 0), 0), 0);

  const totalCollected = mockBoardingPlaces.reduce((sum, place) =>
    sum + place.rooms.reduce((rSum, room) =>
      rSum + room.tenants.reduce((tSum, t) => tSum + (t.monthlyRent - (t.outstandingBalance || 0)), 0), 0), 0);

  const totalDeficit = totalExpected - totalCollected;
  const collectionPercentage = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  // Mock pending slips for demo
  const [pendingSlips, setPendingSlips] = useState([
    { id: 'ps1', tenantName: 'Dana White', roomNumber: '102', placeId: '1', placeName: 'Sunrise Boarding House', amount: 9000, originalRent: 18000, date: '2026-03-05', trustScore: 'high' }, // 9000 uploaded, true rent 18000
    { id: 'ps2', tenantName: 'Grace Lee', roomNumber: '202', placeId: '2', placeName: 'Green Villa Boarding', amount: 12000, originalRent: 12000, date: '2026-01-10', trustScore: 'medium' }
  ]);

  const handleApproveSlip = (slip: any) => {
    if (!window.confirm(`Approve Rs.${slip.amount.toLocaleString()} payment from ${slip.tenantName}?\n\nThis will generate an official receipt and notify the tenant.`)) {
      return;
    }
    setProcessingSlipId(slip.id);
    setTimeout(() => {
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
      setPendingSlips(prev => prev.filter(s => s.id !== slip.id));
      setProcessingSlipId(null);
    }, 1500);
  };

  const handleConfirmReject = () => {
    if (rejectReason.trim().length < 10) {
      setRejectError('Please provide a reason of at least 10 characters so the student knows why their slip was rejected.');
      return;
    }
    setRejectError('');
    setPendingSlips(prev => prev.filter(s => s.id !== rejectingSlip.id));
    setRejectingSlip(null);
    setRejectReason('');
  };

  return (
    <>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Owner Payment Dashboard</h2>
      </div>

      {/* Financial Overview Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <p className="text-sm font-medium text-gray-400 mb-1">Expected Revenue</p>
          <p className="text-3xl font-bold text-white tracking-tight">Rs. {totalExpected.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Total rent for occupied rooms</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <p className="text-sm font-medium text-emerald-400/80 mb-1">Total Collected</p>
          <p className="text-3xl font-bold text-emerald-400 tracking-tight">Rs. {totalCollected.toLocaleString()}</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Collection Rate</span>
              <span className="text-emerald-400 font-medium">{collectionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${collectionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-900/40 to-slate-900 border border-rose-500/20 rounded-2xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
          <p className="text-sm font-medium text-rose-400/80 mb-1">Outstanding Deficit</p>
          <p className="text-3xl font-bold text-rose-400 tracking-tight">Rs. {totalDeficit.toLocaleString()}</p>
          <p className="text-xs text-rose-400/60 mt-2 flex items-center gap-1">
            <AlertCircle size={12} /> Needs follow-up
          </p>
        </div>
      </div>

      {/* Review Payment Slips Section */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg relative">
        <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
          New Payment Slips to Review
          {pendingSlips.length > 0 && (
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full text-xs">
              {pendingSlips.length}
            </span>
          )}
        </h3>

        <div className="space-y-3">
          {pendingSlips.length > 0 ? (
            pendingSlips.map(slip => (
              <div key={slip.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 border border-amber-500/20 rounded-xl hover:bg-white/10 transition-colors">
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
                    <p className="text-sm font-bold text-white">Rs. {slip.amount.toLocaleString()}</p>
                    {slip.amount < slip.originalRent ? (
                      <p className="text-[10px] text-amber-400 font-medium">Partial (Owes Rs. {(slip.originalRent - slip.amount).toLocaleString()})</p>
                    ) : (
                      <p className="text-[10px] text-gray-500">Full Rent Uploaded</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button className="flex items-center justify-center p-2 bg-white/5 hover:bg-white/10 rounded-lg text-cyan-400 transition-colors border border-white/10" title="View Uploaded Slip">
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

        {/* Global Processing Overlay indicating Server Save Simulation */}
        {processingSlipId && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 transition-all">
            <div className="bg-slate-800 border border-cyan-500/30 p-4 rounded-xl shadow-2xl flex items-center gap-3">
              <Loader2 className="animate-spin text-cyan-400" size={20} />
              <span className="text-sm font-medium text-cyan-50">Saving to payment_receipts server folder...</span>
            </div>
          </div>
        )}
      </div>

      {/* Select Boarding Place Section */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10 shadow-lg mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Manage Boarding Places</h3>
        <p className="text-xs text-gray-400 mb-6">Select a boarding place to view detailed payment status, overdue tenants, and management options.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockBoardingPlaces.map(place => {
            const allTenantsInPlace = place.rooms.flatMap(r => r.tenants);
            const overdueCount = allTenantsInPlace.filter(t => t.paymentStatus === 'overdue').length;

            return (
              <div
                key={place.id}
                onClick={() => navigate(`/payment-rental/${place.id}`)}
                className="group p-5 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/50 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                  <ArrowRight size={20} className="text-cyan-400" />
                </div>

                <h4 className="text-base font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors">{place.name}</h4>
                <p className="text-xs text-gray-400 mb-4">{place.address}</p>

                <div className="flex items-center gap-4 border-t border-white/10 pt-4 mt-2">
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Tenants</p>
                    <p className="text-sm font-bold text-white">{allTenantsInPlace.length}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Overdue</p>
                    <p className={`text-sm font-bold ${overdueCount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {overdueCount}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2">Reason for Rejection <span className="text-rose-400">*</span></label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => { setRejectReason(e.target.value); setRejectError(''); }}
                  rows={3}
                  className={`w-full bg-white/5 border rounded-xl py-2.5 px-4 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 transition-all resize-none outline-none ${rejectError ? 'border-rose-500/70 focus:ring-rose-500/30' : 'border-white/10 focus:ring-rose-500/40 focus:border-rose-500/50'}`}
                  placeholder="e.g. The amount on the slip doesn't match the uploaded amount..."
                />
                <div className="flex justify-between items-center mt-1.5">
                  {rejectError ? (
                    <p className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                      <AlertCircle size={12} /> {rejectError}
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-500">Min. 10 characters. This will be sent to the student.</p>
                  )}
                  <p className={`text-[10px] ml-2 flex-shrink-0 ${rejectReason.length < 10 ? 'text-gray-500' : 'text-emerald-500'}`}>{rejectReason.length}/10+</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRejectingSlip(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-white text-sm font-bold transition-all hover:shadow-lg hover:shadow-rose-500/25"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
