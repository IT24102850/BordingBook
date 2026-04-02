import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, XCircle, Clock, User, Home, Calendar, 
  Phone, Mail, FileText, AlertCircle, ArrowRight,
  Download, Upload, Eye, MessageSquare, Loader
} from 'lucide-react';
import {
  getOwnerBookingRequests,
  updateOwnerBookingRequestStatus,
  getOwnerAgreementTemplates,
  sendAgreementFromTemplate,
  type BookingRequestDto,
  type AgreementTemplateDto,
} from '../../api/bookingAgreementApi';

// Types
interface BookingRequest {
  id: string;
  sourceId: string;
  studentName: string;
  contact: string;
  email: string;
  roomTitle: string;
  roomPrice: number;
  moveInDate: string;
  duration: number;
  bookingType: 'individual' | 'group';
  groupName?: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  paymentStatus?: 'not_uploaded' | 'uploaded' | 'verified' | 'rejected';
  paymentSlipUrl?: string;
  receiptUrl?: string;
}

function extractContactFromMessage(message?: string): string {
  if (!message) return '';
  const match = message.match(/Contact:\s*([^|]+)/i);
  return match ? match[1].trim() : '';
}

function extractNotesFromMessage(message?: string): string {
  if (!message) return '';
  const match = message.match(/Notes:\s*(.*)$/i);
  if (match) return match[1].trim();
  if (message.startsWith('Contact:')) return '';
  return message;
}

function toUiBooking(request: BookingRequestDto, index: number): BookingRequest {
  const contact = request.contactNumber || extractContactFromMessage(request.message);
  return {
    id: `BK${String(index + 1).padStart(3, '0')}`,
    sourceId: request._id,
    studentName: request.studentId?.fullName || request.studentId?.email || 'Student',
    contact: contact || 'N/A',
    email: request.studentId?.email || 'N/A',
    roomTitle:
      request.roomId?.name || request.roomId?.roomNumber || request.houseId?.name || 'Boarding Request',
    roomPrice: Number(request.roomId?.price || request.houseId?.monthlyPrice || 0),
    moveInDate: request.moveInDate,
    duration: Number(request.durationMonths || 0),
    bookingType: request.bookingType,
    groupName: request.groupName || '',
    notes: extractNotesFromMessage(request.message),
    status: request.status,
    submittedDate: request.createdAt,
  };
}

export default function BookingManagementSystem() {
  const navigate = useNavigate();
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [agreementTemplates, setAgreementTemplates] = useState<AgreementTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingAgreement, setSendingAgreement] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedTemplateVersionByBooking, setSelectedTemplateVersionByBooking] = useState<Record<string, string>>({});

  const loadBookingRequests = async () => {
    setError('');
    setLoading(true);
    try {
      const [pending, approved, rejected] = await Promise.all([
        getOwnerBookingRequests('pending'),
        getOwnerBookingRequests('approved'),
        getOwnerBookingRequests('rejected'),
      ]);
      const merged = [...pending, ...approved, ...rejected].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setBookingRequests(merged.map(toUiBooking));
    } catch (err) {
      setError((err as Error).message || 'Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  };

  const loadAgreementTemplates = async () => {
    try {
      const templates = await getOwnerAgreementTemplates();
      setAgreementTemplates(templates);
    } catch (err) {
      console.error('Failed to load agreement templates:', err);
    }
  };

  const handleSendAgreement = async (booking: BookingRequest) => {
    const selectedVersionKey = selectedTemplateVersionByBooking[booking.id];
    if (!selectedVersionKey) {
      setError('Please select a template version');
      return;
    }

    // Parse the selected template version ID (format: "templateId-versionIndex")
    const [templateId, versionIndexStr] = selectedVersionKey.split('-');
    const versionIndex = parseInt(versionIndexStr, 10);

    const template = agreementTemplates.find(t => t._id === templateId);
    if (!template || !template.versions[versionIndex]) {
      setError('Selected template version not found');
      return;
    }

    setSendingAgreement(prev => ({ ...prev, [booking.id]: true }));
    try {
      await sendAgreementFromTemplate({
        bookingRequestId: booking.sourceId,
        templateVersionId: template._id,
        expirationDays: 7,
      });
      setError('');
      setSelectedTemplateVersionByBooking(prev => ({ ...prev, [booking.id]: '' }));
      await loadBookingRequests();
    } catch (err) {
      setError((err as Error).message || 'Failed to send agreement');
    } finally {
      setSendingAgreement(prev => ({ ...prev, [booking.id]: false }));
    }
  };

  useEffect(() => {
    void loadBookingRequests();
    void loadAgreementTemplates();
  }, []);

  // Filter bookings
  const filteredBookings = useMemo(
    () => bookingRequests.filter((booking) => filterStatus === 'all' || booking.status === filterStatus),
    [bookingRequests, filterStatus]
  );

  // Count statistics
  const stats = {
    pending: bookingRequests.filter(b => b.status === 'pending').length,
    approved: bookingRequests.filter(b => b.status === 'approved').length,
    rejected: bookingRequests.filter(b => b.status === 'rejected').length,
    total: bookingRequests.length
  };

  // Handle approval
  const handleApprove = async (booking: BookingRequest) => {
    try {
      await updateOwnerBookingRequestStatus(booking.sourceId, { status: 'approved' });
      await loadBookingRequests();
    } catch (err) {
      setError((err as Error).message || 'Failed to approve booking');
    }
    setSelectedBooking(null);
  };

  // Handle rejection
  const handleReject = async (booking: BookingRequest) => {
    try {
      const reason = rejectReason.trim() || 'Rejected by owner';
      await updateOwnerBookingRequestStatus(booking.sourceId, {
        status: 'rejected',
        rejectionReason: reason,
      });
      await loadBookingRequests();
    } catch (err) {
      setError((err as Error).message || 'Failed to reject booking');
    }
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedBooking(null);
  };

  // Get payment status badge
  const getPaymentBadge = (booking: BookingRequest) => {
    if (booking.status !== 'approved') return null;

    switch (booking.paymentStatus) {
      case 'not_uploaded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-900/30 text-amber-400 rounded-full text-xs font-semibold border border-amber-500/30">
            <Clock size={12} />
            Awaiting Payment Upload
          </span>
        );
      case 'uploaded':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/30">
            <Upload size={12} />
            Payment Slip Uploaded
          </span>
        );
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-semibold border border-green-500/30">
            <CheckCircle size={12} />
            Payment Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-xs font-semibold border border-red-500/30">
            <XCircle size={12} />
            Payment Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            Booking Management System
          </h1>
          <p className="text-gray-400">Review and manage incoming booking requests</p>
          {error && (
            <div className="mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <AlertCircle size={16} className="text-red-400" />
              <span className="text-sm text-red-300">{error}</span>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-400 text-sm font-medium">Total Requests</span>
              <FileText size={20} className="text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 text-sm font-medium">Pending</span>
              <Clock size={20} className="text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.pending}</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 text-sm font-medium">Approved</span>
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.approved}</p>
          </div>

          <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-400 text-sm font-medium">Rejected</span>
              <XCircle size={20} className="text-red-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Booking Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <Clock size={48} className="text-gray-500 mx-auto mb-4 animate-pulse" />
              <p className="text-gray-400">Loading booking requests...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
              <AlertCircle size={48} className="text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No booking requests found</p>
            </div>
          ) : (
            filteredBookings.map(booking => (
              <div
                key={booking.id}
                className="bg-gradient-to-br from-[#181f36] to-[#0f172a] border border-white/10 rounded-xl p-4 md:p-6 hover:border-cyan-400/50 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-400 text-sm">Booking ID:</span>
                      <span className="text-white font-bold">{booking.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          booking.status === 'pending'
                            ? 'bg-amber-900/30 text-amber-400'
                            : booking.status === 'approved'
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-red-900/30 text-red-400'
                        }`}
                      >
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{booking.roomTitle}</h3>
                    <p className="text-gray-400 text-sm">
                      Submitted: {new Date(booking.submittedDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      Rs. {booking.roomPrice.toLocaleString()}/mo
                    </div>
                    <div className="text-gray-400 text-sm">{booking.duration} months</div>
                  </div>
                </div>

                {/* Student Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-white/5 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User size={16} className="text-cyan-400" />
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white font-semibold">{booking.studentName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-green-400" />
                      <span className="text-gray-400">Contact:</span>
                      <span className="text-white">{booking.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-purple-400" />
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{booking.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-orange-400" />
                      <span className="text-gray-400">Move-in:</span>
                      <span className="text-white">{new Date(booking.moveInDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Home size={16} className="text-blue-400" />
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white capitalize">{booking.bookingType}</span>
                      {booking.bookingType === 'group' && booking.groupName && (
                        <span className="text-cyan-400">({booking.groupName})</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="mb-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare size={16} className="text-blue-400 mt-0.5" />
                      <div>
                        <span className="text-blue-400 text-xs font-semibold">Student Notes:</span>
                        <p className="text-gray-300 text-sm mt-1">{booking.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Status Badge */}
                {getPaymentBadge(booking)}

                {booking.status === 'approved' && (
                  <div className="mt-4 rounded-lg border border-white/10 bg-white/5">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-xs font-semibold text-gray-300">Send Agreement</p>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                      <select
                        value={selectedTemplateVersionByBooking[booking.id] || ''}
                        onChange={(e) => {
                          setSelectedTemplateVersionByBooking((prev) => ({
                            ...prev,
                            [booking.id]: e.target.value,
                          }));
                        }}
                        className="px-3 py-2 rounded-lg bg-white/5 border border-white/20 text-sm text-white"
                      >
                        <option value="" className="text-black">Select a template...</option>
                        {agreementTemplates.map((template) =>
                          template.versions.map((version, index) => (
                            <option
                              key={`${template._id}-${index}`}
                              value={`${template._id}-${index}`}
                              className="text-black"
                            >
                              {template.title} - v{version.version} {index === template.versions.length - 1 ? '(Active)' : ''}
                            </option>
                          ))
                        )}
                      </select>

                      <button
                        onClick={() => handleSendAgreement(booking)}
                        disabled={!selectedTemplateVersionByBooking[booking.id] || sendingAgreement[booking.id]}
                        className="px-5 py-2 rounded-lg bg-cyan-900/50 border border-cyan-700/40 text-cyan-300 text-sm font-semibold hover:bg-cyan-900/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {sendingAgreement[booking.id] ? (
                          <>
                            <Loader size={16} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail size={16} />
                            Send Agreement
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(booking)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                      >
                        <CheckCircle size={16} />
                        Approve Booking
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowRejectModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                      >
                        <XCircle size={16} />
                        Reject Booking
                      </button>
                    </>
                  )}

                  {booking.status === 'approved' && booking.paymentStatus === 'uploaded' && (
                    <button
                      onClick={() => navigate('/payment-rental')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                    >
                      <Eye size={16} />
                      Review Payment Slip
                      <ArrowRight size={16} />
                    </button>
                  )}

                  {booking.status === 'approved' && booking.paymentStatus === 'verified' && (
                    <button
                      onClick={() => window.open(booking.receiptUrl, '_blank')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                    >
                      <Download size={16} />
                      Download Receipt
                    </button>
                  )}

                  {booking.status === 'approved' && booking.paymentStatus === 'not_uploaded' && (
                    <div className="flex-1 bg-amber-900/20 border border-amber-500/30 rounded-lg p-3 text-center">
                      <p className="text-amber-400 text-sm">
                        Waiting for student to upload payment slip
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reject Modal */}
        {showRejectModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-2xl max-w-md w-full border border-red-500/30 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Reject Booking Request</h3>
              <p className="text-gray-400 mb-4">
                Are you sure you want to reject booking request {selectedBooking.id} from {selectedBooking.studentName}?
              </p>
              
              <div className="mb-6">
                <label className="text-sm text-gray-300 mb-2 block">Rejection Reason (Optional)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-red-400 focus:outline-none transition-all text-sm resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                    setSelectedBooking(null);
                  }}
                  className="flex-1 py-2 bg-white/10 text-gray-300 rounded-lg font-semibold hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedBooking)}
                  className="flex-1 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
