import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, User, Home, Calendar, Phone, Mail, Users, AlertCircle } from 'lucide-react';

interface BookingRequest {
  id: string;
  studentName: string;
  groupName?: string;
  type: 'individual' | 'group';
  roomTitle: string;
  requestDate: string;
  moveInDate: string;
  monthlyRent: number;
  totalAmount: number;
  studentEmail: string;
  studentPhone: string;
  status: 'pending' | 'approved' | 'rejected';
  members?: number;
}

const mockRequests: BookingRequest[] = [
  {
    id: 'BR001',
    studentName: 'Kasun Perera',
    type: 'individual',
    roomTitle: 'Single Room - AC',
    requestDate: '2026-02-28',
    moveInDate: '2026-03-15',
    monthlyRent: 18000,
    totalAmount: 36000,
    studentEmail: 'kasun@email.com',
    studentPhone: '+94 77 123 4567',
    status: 'pending'
  },
  {
    id: 'BR002',
    studentName: 'SLIIT Friends Group',
    groupName: 'SLIIT Friends',
    type: 'group',
    roomTitle: 'Suite - 3 Beds',
    requestDate: '2026-02-25',
    moveInDate: '2026-04-01',
    monthlyRent: 54000,
    totalAmount: 108000,
    studentEmail: 'group@email.com',
    studentPhone: '+94 77 234 5678',
    status: 'pending',
    members: 3
  }
];

export default function OwnerApprovalPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BookingRequest[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<BookingRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const handleApprove = (id: string) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: 'approved' as const } : req
      )
    );
    setSelectedRequest(null);
  };

  const handleReject = (id: string) => {
    setRequests(
      requests.map((req) =>
        req.id === id ? { ...req, status: 'rejected' as const } : req
      )
    );
    setSelectedRequest(null);
  };

  const filteredRequests = requests.filter((req) =>
    filterStatus === 'all' ? true : req.status === filterStatus
  );

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-[#0a1124] to-[#131d3a] border-b border-white/10 p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Booking Requests</h1>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full px-3 py-1">
            <AlertCircle size={16} className="text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">{pendingCount} pending</span>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filterStatus === status
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className={`bg-white/5 rounded-lg p-4 border-2 cursor-pointer transition ${
                  selectedRequest?.id === request.id
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold text-lg">{request.studentName}</h3>
                    <p className="text-gray-400 text-sm">{request.roomTitle}</p>
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
                    <span className="text-gray-400">Request Date</span>
                    <p className="text-white font-semibold">{request.requestDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Move-in Date</span>
                    <p className="text-white font-semibold">{request.moveInDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Monthly Rent</span>
                    <p className="text-cyan-400 font-bold">Rs. {request.monthlyRent.toLocaleString()}</p>
                  </div>
                </div>

                {request.type === 'group' && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-gray-400 text-xs mb-1">Group</p>
                    <p className="text-white font-semibold flex items-center gap-2">
                      <Users size={16} />
                      {request.groupName} ({request.members} members)
                    </p>
                  </div>
                )}
              </div>
            ))}

            {filteredRequests.length === 0 && (
              <div className="bg-white/5 rounded-lg p-8 border border-white/10 text-center">
                <p className="text-gray-400">No {filterStatus !== 'all' ? filterStatus : 'booking'} requests</p>
              </div>
            )}
          </div>

          {/* Request Details */}
          {selectedRequest && (
            <div className="bg-white/5 rounded-lg p-6 border border-white/10 h-fit sticky top-20">
              <h3 className="text-white font-bold text-lg mb-4">Request Details</h3>

              <div className="space-y-4 mb-6">
                {/* Student Info */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="text-cyan-400" size={20} />
                    <span className="text-gray-400 text-sm">Student</span>
                  </div>
                  <p className="text-white font-semibold">{selectedRequest.studentName}</p>
                  {selectedRequest.type === 'group' && selectedRequest.groupName && (
                    <p className="text-gray-400 text-sm">Group: {selectedRequest.groupName}</p>
                  )}
                  <a href={`tel:${selectedRequest.studentPhone}`} className="text-cyan-400 text-sm hover:underline block mt-1">
                    {selectedRequest.studentPhone}
                  </a>
                  <a href={`mailto:${selectedRequest.studentEmail}`} className="text-cyan-400 text-sm hover:underline">
                    {selectedRequest.studentEmail}
                  </a>
                </div>

                {/* Booking Info */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Home className="text-cyan-400" size={20} />
                    <span className="text-gray-400 text-sm">Booking Details</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Room Type:</span>
                      <p className="text-white font-semibold">{selectedRequest.roomTitle}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Monthly Rent:</span>
                      <p className="text-cyan-400 font-bold">Rs. {selectedRequest.monthlyRent.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Amount (2 months + deposit):</span>
                      <p className="text-cyan-400 font-bold text-lg">Rs. {selectedRequest.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="text-cyan-400" size={20} />
                    <span className="text-gray-400 text-sm">Dates</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Requested:</span>
                      <p className="text-white font-semibold">{selectedRequest.requestDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Move-in:</span>
                      <p className="text-white font-semibold">{selectedRequest.moveInDate}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {selectedRequest.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Approve Booking
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest.id)}
                      className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject Request
                    </button>
                  </>
                ) : (
                  <div className={`text-center py-3 rounded-lg ${
                    selectedRequest.status === 'approved'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    <p className="font-bold">
                      {selectedRequest.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
