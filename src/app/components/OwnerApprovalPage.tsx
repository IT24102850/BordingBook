import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, Home, User, XCircle } from 'lucide-react';
import {
  BookingRequestDto,
  AgreementTemplateDto,
  createOwnerAgreement,
  getAgreementTemplates,
  getOwnerBookingRequests,
  updateOwnerBookingRequestStatus,
} from '../api/bookingAgreementApi';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function OwnerApprovalPage() {
    const [showNotifyPopup, setShowNotifyPopup] = useState(false);
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BookingRequestDto[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [templates, setTemplates] = useState<AgreementTemplateDto[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [agreementTitle, setAgreementTitle] = useState('Boarding House Rental Agreement');
  const [agreementTerms, setAgreementTerms] = useState('');
  const [agreementDeposit, setAgreementDeposit] = useState('0');
  const [agreementStart, setAgreementStart] = useState('');
  const [agreementEnd, setAgreementEnd] = useState('');
  const [sendingAgreementId, setSendingAgreementId] = useState('');

  const selectedRequest = useMemo(
    () => requests.find((item) => item._id === selectedId) || null,
    [requests, selectedId]
  );

  useEffect(() => {
    const template = templates.find((item) => item._id === selectedTemplateId);
    if (template) {
      setAgreementTitle(template.title);
      setAgreementTerms(template.content);
      return;
    }

    if (!selectedTemplateId) {
      setAgreementTitle('Boarding House Rental Agreement');
      setAgreementTerms('');
    }
  }, [selectedTemplateId, templates]);

  const pendingCount = useMemo(
    () => requests.filter((item) => item.status === 'pending').length,
    [requests]
  );

  async function loadRequests() {
    setLoading(true);
    setError('');
    try {
      const [data, templateData] = await Promise.all([
        getOwnerBookingRequests(filterStatus === 'all' ? undefined : filterStatus),
        getAgreementTemplates(),
      ]);
      setRequests(data);
      setTemplates(templateData);
      if (data.length > 0 && !data.some((item) => item._id === selectedId)) {
        setSelectedId(data[0]._id);
      }
      if (data.length === 0) {
        setSelectedId('');
      }
    } catch (apiError: any) {
      setError(apiError?.message || 'Failed to load booking requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  async function handleApprove(requestId: string) {
    setActionLoadingId(requestId);
    setError('');
    try {
      // 1. Approve booking
      const updated = await updateOwnerBookingRequestStatus(requestId, { status: 'approved' });
      setRequests((prev) => prev.map((item) => (item._id === requestId ? updated : item)));

      // 2. Create/send agreement immediately after approval
      await createOwnerAgreement({
        bookingRequestId: requestId,
        title: agreementTitle.trim() || 'Boarding House Rental Agreement',
        terms: agreementTerms.trim(),
        rentAmount: Number(selectedRequest?.roomId?.price || 0),
        depositAmount: Number(agreementDeposit || 0),
        periodStart: agreementStart || new Date().toISOString().slice(0, 10),
        periodEnd: agreementEnd || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6).toISOString().slice(0, 10),
        additionalClauses: [],
      });

      // 3. Show notification popup to owner
      setShowNotifyPopup(true);
    } catch (apiError: any) {
      setError(apiError?.message || 'Failed to approve booking and send agreement');
    } finally {
      setActionLoadingId('');
    }
  }

  async function handleReject(requestId: string) {
    const reason = window.prompt('Enter rejection reason (minimum 5 characters):', 'Not eligible for this room');
    if (reason === null) {
      return;
    }

    setActionLoadingId(requestId);
    setError('');
    try {
      const updated = await updateOwnerBookingRequestStatus(requestId, {
        status: 'rejected',
        rejectionReason: reason,
      });
      setRequests((prev) => prev.map((item) => (item._id === requestId ? updated : item)));
    } catch (apiError: any) {
      setError(apiError?.message || 'Failed to reject booking request');
    } finally {
      setActionLoadingId('');
    }
  }

  async function handleSendAgreement() {
    if (!selectedRequest) return;
    if (!agreementTerms.trim()) {
      setError('Select a template or enter agreement terms before sending.');
      return;
    }

    setSendingAgreementId(selectedRequest._id);
    setError('');
    try {
      await createOwnerAgreement({
        bookingRequestId: selectedRequest._id,
        title: agreementTitle.trim() || 'Boarding House Rental Agreement',
        terms: agreementTerms.trim(),
        rentAmount: Number(selectedRequest.roomId?.price || 0),
        depositAmount: Number(agreementDeposit || 0),
        periodStart: agreementStart || new Date().toISOString().slice(0, 10),
        periodEnd: agreementEnd || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 * 6).toISOString().slice(0, 10),
        additionalClauses: [],
      });
      await loadRequests();
      setAgreementTerms('');
      setSelectedTemplateId('');
      setAgreementDeposit('0');
      setAgreementStart('');
      setAgreementEnd('');
    } catch (apiError: any) {
      setError(apiError?.message || 'Failed to send agreement');
    } finally {
      setSendingAgreementId('');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
      {/* Notification Popup */}
      {showNotifyPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-lg font-bold mb-2 text-cyan-700">Student Notified</h2>
            <p className="text-gray-700 mb-4">The student has been notified to accept the agreement. You will be updated once the student responds.</p>
            <button
              className="mt-2 px-4 py-2 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 transition"
              onClick={() => setShowNotifyPopup(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-[#0a1124] to-[#131d3a] border-b border-white/10 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Owner Booking Requests</h1>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-1">
            <AlertCircle size={16} className="text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">{pendingCount} pending</span>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === status
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
          <button
            onClick={loadRequests}
            className="ml-auto px-4 py-2 rounded-lg bg-white/10 text-gray-200 hover:bg-white/20 transition"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {loading && (
              <div className="bg-white/5 rounded-lg p-8 border border-white/10 text-center text-gray-300">Loading booking requests...</div>
            )}

            {!loading && requests.map((request) => {
              const studentName = request.studentId?.fullName || request.studentId?.email || 'Student';
              const roomName = request.roomId?.name || request.roomId?.roomNumber || 'Room';
              return (
                <div
                  key={request._id}
                  onClick={() => setSelectedId(request._id)}
                  className={`bg-white/5 rounded-lg p-4 border-2 cursor-pointer transition ${
                    selectedId === request._id
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold text-lg">{studentName}</h3>
                      <p className="text-gray-400 text-sm">{roomName}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                        request.status === 'pending'
                          ? 'bg-yellow-500/30 text-yellow-300'
                          : request.status === 'approved'
                          ? 'bg-green-500/30 text-green-300'
                          : 'bg-red-500/30 text-red-300'
                      }`}
                    >
                      {request.status === 'pending' && <Clock size={14} />}
                      {request.status === 'approved' && <CheckCircle size={14} />}
                      {request.status === 'rejected' && <XCircle size={14} />}
                      {request.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Requested</span>
                      <p className="text-white font-semibold">{new Date(request.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Move-in</span>
                      <p className="text-white font-semibold">{new Date(request.moveInDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Monthly Rent</span>
                      <p className="text-cyan-400 font-bold">Rs. {(request.roomId?.price || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {!loading && requests.length === 0 && (
              <div className="bg-white/5 rounded-lg p-8 border border-white/10 text-center">
                <p className="text-gray-400">No booking requests for this filter</p>
              </div>
            )}
          </div>

          {selectedRequest && (
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 h-fit sticky top-20">
              <h3 className="text-white font-bold text-lg mb-4">Request Details</h3>

              <div className="space-y-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="text-cyan-400" size={20} />
                    <span className="text-gray-400 text-sm">Student</span>
                  </div>
                  <p className="text-white font-semibold">{selectedRequest.studentId?.fullName || selectedRequest.studentId?.email || 'Student'}</p>
                  <p className="text-cyan-400 text-sm mt-1">{selectedRequest.studentId?.email || 'No email'}</p>
                  <p className="text-cyan-400 text-sm">{selectedRequest.studentId?.phoneNumber || selectedRequest.studentId?.mobileNumber || 'No phone'}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="text-cyan-400" size={20} />
                    <span className="text-gray-400 text-sm">Booking</span>
                  </div>
                  <p className="text-white font-semibold">{selectedRequest.roomId?.name || selectedRequest.roomId?.roomNumber || 'Room'}</p>
                  <p className="text-gray-300 text-sm">Type: {selectedRequest.bookingType}</p>
                  <p className="text-gray-300 text-sm">Duration: {selectedRequest.durationMonths} months</p>
                  {selectedRequest.bookingType === 'group' && (
                    <p className="text-gray-300 text-sm">
                      Group: {selectedRequest.groupName || 'Unnamed'} ({selectedRequest.groupSize || 1})
                    </p>
                  )}
                  {selectedRequest.message && (
                    <p className="text-gray-300 text-sm mt-2">Message: {selectedRequest.message}</p>
                  )}
                </div>
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="space-y-2">
                  <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Agreement Template</label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm"
                      >
                        <option value="">Select template</option>
                        {templates.map((template) => (
                          <option key={template._id} value={template._id} className="text-black">
                            v{template.version} - {template.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Agreement Title</label>
                      <input
                        value={agreementTitle}
                        onChange={(e) => setAgreementTitle(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Agreement Terms</label>
                      <textarea
                        rows={6}
                        value={agreementTerms}
                        onChange={(e) => setAgreementTerms(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm"
                        placeholder="Select a template or write the agreement terms"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Deposit</label>
                        <input
                          type="number"
                          min="0"
                          value={agreementDeposit}
                          onChange={(e) => setAgreementDeposit(e.target.value)}
                          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={agreementStart}
                          onChange={(e) => setAgreementStart(e.target.value)}
                          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">End Date</label>
                      <input
                        type="date"
                        value={agreementEnd}
                        onChange={(e) => setAgreementEnd(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>
                  <button
                    disabled={
                      actionLoadingId === selectedRequest._id ||
                      !selectedTemplateId ||
                      !agreementTerms.trim()
                    }
                    onClick={() => handleApprove(selectedRequest._id)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 disabled:opacity-60 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve Booking
                  </button>
                  <button
                    disabled={actionLoadingId === selectedRequest._id}
                    onClick={() => handleReject(selectedRequest._id)}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 disabled:opacity-60 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject Request
                  </button>
                </div>
              )}

              {selectedRequest.status === 'approved' && (
                <div className="space-y-2">
                  <div className="text-center py-3 rounded-lg bg-green-500/20 text-green-300 font-bold">Approved</div>
                  <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Agreement Template</label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm"
                      >
                        <option value="">Select template</option>
                        {templates.map((template) => (
                          <option key={template._id} value={template._id} className="text-black">
                            v{template.version} - {template.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Agreement Title</label>
                      <input
                        value={agreementTitle}
                        onChange={(e) => setAgreementTitle(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Agreement Terms</label>
                      <textarea
                        rows={6}
                        value={agreementTerms}
                        onChange={(e) => setAgreementTerms(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm"
                        placeholder="Select a template or write the agreement terms"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Deposit</label>
                        <input
                          type="number"
                          min="0"
                          value={agreementDeposit}
                          onChange={(e) => setAgreementDeposit(e.target.value)}
                          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={agreementStart}
                          onChange={(e) => setAgreementStart(e.target.value)}
                          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">End Date</label>
                      <input
                        type="date"
                        value={agreementEnd}
                        onChange={(e) => setAgreementEnd(e.target.value)}
                        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <button
                      onClick={handleSendAgreement}
                      disabled={sendingAgreementId === selectedRequest._id}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 disabled:opacity-60 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                      {selectedRequest.agreementId?._id ? 'Resend Agreement' : 'Create & Send Agreement'}
                    </button>
                  </div>
                </div>
              )}

              {selectedRequest.status === 'rejected' && (
                <div className="text-center py-3 rounded-lg bg-red-500/20 text-red-300">
                  <p className="font-bold">Rejected</p>
                  {selectedRequest.rejectionReason && (
                    <p className="text-xs text-red-200 mt-1">{selectedRequest.rejectionReason}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
