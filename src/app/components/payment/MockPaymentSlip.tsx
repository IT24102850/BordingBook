import React from 'react';
import { CheckCircle, Calendar, Hash, Home, User, UtensilsCrossed } from 'lucide-react';

interface MockPaymentSlipProps {
  studentName?: string;
  amount?: number;
  dueDate?: string;
  submitDate?: string;
  roomNumber?: string;
  boardingHouseName?: string;
  receiptNumber?: string;
  status?: 'submitted' | 'approved' | 'pending';
}

/**
 * MockPaymentSlip Component
 * Displays a professional-looking payment receipt as a fallback
 * when actual payment slip image is not available
 */
export const MockPaymentSlip: React.FC<MockPaymentSlipProps> = ({
  studentName = 'Student',
  amount = 0,
  dueDate = new Date().toISOString(),
  submitDate = new Date().toISOString(),
  roomNumber = 'N/A',
  boardingHouseName = 'Boarding House',
  receiptNumber = 'RCP-' + Date.now(),
  status = 'submitted',
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const statusBgColor = {
    submitted: 'bg-amber-100',
    approved: 'bg-emerald-100',
    pending: 'bg-cyan-100',
  };

  const statusTextColor = {
    submitted: 'text-amber-700',
    approved: 'text-emerald-700',
    pending: 'text-cyan-700',
  };

  const statusBorderColor = {
    submitted: 'border-amber-300',
    approved: 'border-emerald-300',
    pending: 'border-cyan-300',
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-xl border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="text-center mb-6 pb-4 border-b border-white/10">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mb-2">
          <UtensilsCrossed className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-white mb-0.5">Payment Receipt</h2>
        <p className="text-[11px] text-gray-400 uppercase tracking-widest">Boarding Management</p>
      </div>

      {/* Receipt Number */}
      <div className="mb-4 p-2 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center gap-1.5 text-gray-400 text-[11px] mb-0.5">
          <Hash className="w-3 h-3" />
          <span>Receipt ID</span>
        </div>
        <p className="text-white font-mono font-semibold text-xs">{receiptNumber}</p>
      </div>

      {/* Student Information */}
      <div className="space-y-3 mb-4">
        {/* Student Name */}
        <div>
          <div className="flex items-center gap-1.5 text-gray-400 text-[11px] mb-0.5">
            <User className="w-3 h-3" />
            <span>Student Name</span>
          </div>
          <p className="text-white font-semibold text-sm">{studentName}</p>
        </div>

        {/* Boarding House & Room */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mb-0.5">
              <Home className="w-3 h-3" />
              <span>Boarding</span>
            </div>
            <p className="text-white font-medium text-[11px] truncate">{boardingHouseName}</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mb-0.5">
              <Home className="w-3 h-3" />
              <span>Room</span>
            </div>
            <p className="text-white font-semibold text-[11px]">#{roomNumber}</p>
          </div>
        </div>
      </div>

      {/* Payment Amount - Highlighted */}
      <div className="mb-4 p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/30">
        <p className="text-gray-400 text-[10px] mb-1">Amount Submitted</p>
        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          Rs. {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Dates */}
      <div className="mb-4 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mb-0.5">
            <Calendar className="w-3 h-3" />
            <span>Submitted</span>
          </div>
          <p className="text-white font-medium text-[11px]">{formatDate(submitDate)}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className={`p-2 rounded-lg border ${statusBgColor[status]} ${statusBorderColor[status]} mb-3`}>
        <div className="flex items-center gap-2">
          <CheckCircle className={`w-4 h-4 ${statusTextColor[status]}`} />
          <span className={`font-semibold capitalize text-xs ${statusTextColor[status]}`}>
            {status === 'submitted' ? 'Submitted' : status === 'approved' ? 'Approved' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-white/10 text-center text-[10px] text-gray-500">
        <p>Generated: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default MockPaymentSlip;
