import React, { useEffect, useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Loader,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import {
  getOwnerSignedAgreements,
  downloadAgreementAsOwner,
  type BookingAgreementDto,
} from '../api/bookingAgreementApi';

export default function SignedAgreementsTab() {
  const [agreements, setAgreements] = useState<BookingAgreementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'signed' | 'partially_signed' | 'expired'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadAgreements = async () => {
    setLoading(true);
    setError('');
    try {
      const status = filterStatus === 'all' ? undefined : filterStatus;
      const data = await getOwnerSignedAgreements(status);
      setAgreements(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAgreements();
  }, [filterStatus]);

  const handleDownload = async (agreementId: string) => {
    setDownloadingId(agreementId);
    try {
      downloadAgreementAsOwner(agreementId);
    } catch (err) {
      setError((err as Error).message || 'Failed to download agreement');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (agreement: BookingAgreementDto) => {
    const status = agreement.status || 'pending';

    if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-900/30 text-amber-300 rounded-full text-xs font-semibold border border-amber-500/30">
          <Clock size={12} />
          Pending Signature
        </span>
      );
    }

    if (status === 'partially_signed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs font-semibold border border-blue-500/30">
          <Users size={12} />
          Partially Signed
        </span>
      );
    }

    if (status === 'signed') {
      // Check if agreement has expired
      const periodEnd = new Date(agreement.periodEnd);
      const now = new Date();
      if (periodEnd < now) {
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-900/30 text-gray-300 rounded-full text-xs font-semibold border border-gray-500/30">
            <AlertCircle size={12} />
            Expired
          </span>
        );
      }

      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-xs font-semibold border border-green-500/30">
          <CheckCircle size={12} />
          Signed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-xs font-semibold border border-red-500/30">
        <AlertCircle size={12} />
        Rejected
      </span>
    );
  };

  const getProgressParty = (agreement: BookingAgreementDto) => {
    if (agreement.bookingRequestId?.bookingType !== 'group') {
      return null;
    }

    const total = agreement.groupMemberSignatures?.length || 0;
    const signed = agreement.groupMemberSignatures?.filter((m: any) => m.status === 'signed').length || 0;

    return (
      <div className="text-xs text-gray-400 mt-2">
        {signed}/{total} members signed
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'signed', 'partially_signed', 'expired'] as const).map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              filterStatus === status
                ? 'bg-cyan-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {status === 'all' ? 'All Agreements' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <AlertCircle size={20} className="text-red-400" />
          <span className="text-sm text-red-300">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader size={40} className="text-cyan-400 animate-spin" />
            <p className="text-gray-400">Loading agreements...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && agreements.length === 0 && (
        <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-400 text-lg">No agreements found</p>
        </div>
      )}

      {/* Agreements Grid */}
      {!loading && agreements.length > 0 && (
        <div className="grid gap-4">
          {agreements.map(agreement => (
            <div
              key={agreement._id}
              className="rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Left Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-4">
                    <FileText size={24} className="text-cyan-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{agreement.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {agreement.studentId?.fullName || 'Student'} · {agreement.roomId?.name || 'Room'}
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-white/5 rounded p-3">
                      <p className="text-gray-400 text-xs mb-1">Move-in</p>
                      <p className="text-white font-semibold">
                        {new Date(agreement.periodStart).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded p-3">
                      <p className="text-gray-400 text-xs mb-1">Duration</p>
                      <p className="text-white font-semibold">
                        {agreement.bookingRequestId?.durationMonths} months
                      </p>
                    </div>
                    <div className="bg-white/5 rounded p-3">
                      <p className="text-gray-400 text-xs mb-1 flex items-center gap-1">
                        <DollarSign size={12} /> Rent
                      </p>
                      <p className="text-white font-semibold">Rs. {agreement.rentAmount}</p>
                    </div>
                    <div className="bg-white/5 rounded p-3">
                      <p className="text-gray-400 text-xs mb-1">Expires</p>
                      <p className="text-white font-semibold">
                        {new Date(agreement.expirationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Group Status */}
                  {getProgressParty(agreement)}

                  {/* Status Badge */}
                  <div className="mt-4">
                    {getStatusBadge(agreement)}
                  </div>

                  {/* Student Email */}
                  {agreement.studentId?.email && (
                    <p className="text-xs text-gray-500 mt-3">
                      Student Email: {agreement.studentId.email}
                    </p>
                  )}
                </div>

                {/* Right Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDownload(agreement._id)}
                    disabled={downloadingId === agreement._id}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    {downloadingId === agreement._id ? (
                      <>
                        <Loader size={14} className="animate-spin" />
                        <span className="hidden sm:inline">Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span className="hidden sm:inline">Download</span>
                      </>
                    )}
                  </button>

                  {/* View Details Button */}
                  <button
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
                    title="View full agreement details"
                  >
                    View
                  </button>
                </div>
              </div>

              {/* Group Members Signatures */}
              {agreement.bookingRequestId?.bookingType === 'group' && agreement.groupMemberSignatures && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs font-semibold text-gray-400 mb-2">GROUP MEMBER SIGNATURES:</p>
                  <div className="space-y-2">
                    {agreement.groupMemberSignatures.map((member: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div>
                          <p className="text-gray-300">{member.memberName}</p>
                          <p className="text-xs text-gray-500">{member.memberEmail}</p>
                        </div>
                        {member.status === 'signed' ? (
                          <span className="flex items-center gap-1 text-green-300 text-xs">
                            <CheckCircle size={12} />
                            Signed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-300 text-xs">
                            <Clock size={12} />
                            Pending
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
