import React, { useEffect, useState } from 'react';
import { Bell, FileText, Clock, AlertCircle, Loader } from 'lucide-react';
import {
  getStudentNotifications,
  markNotificationAsRead,
  signAgreement,
  downloadAgreement,
  type NotificationDto,
  type BookingAgreementDto,
} from '../api/bookingAgreementApi';

export default function StudentNotificationsCenter() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signingAgreement, setSigningAgreement] = useState<Record<string, boolean>>({});
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [agreementDetails, setAgreementDetails] = useState<BookingAgreementDto | null>(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getStudentNotifications();
      setNotifications(data);
    } catch (err) {
      setError((err as Error).message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();
    const interval = setInterval(() => void loadNotifications(), 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleSignAgreement = async (agreementId: string, action: 'sign' | 'reject') => {
    setSigningAgreement(prev => ({ ...prev, [agreementId]: true }));
    try {
      await signAgreement(agreementId, action);
      setError('');
      await loadNotifications();
      setShowAgreementModal(false);
      setSelectedAgreementId(null);
    } catch (err) {
      setError((err as Error).message || `Failed to ${action} agreement`);
    } finally {
      setSigningAgreement(prev => ({ ...prev, [agreementId]: false }));
    }
  };

  const handleDownload = async (agreementId: string) => {
    try {
      downloadAgreement(agreementId);
    } catch (err) {
      setError((err as Error).message || 'Failed to download agreement');
    }
  };

  const agreementNotifications = notifications.filter(n => 
    ['agreement_pending', 'agreement_signed', 'agreement_reminder'].includes(n.type)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell size={32} className="text-cyan-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Notifications</h1>
          </div>
          <p className="text-gray-400">Manage your agreement notifications and signatures</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <AlertCircle size={20} className="text-red-400" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader size={40} className="text-cyan-400 animate-spin" />
              <p className="text-gray-400">Loading notifications...</p>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {!loading && (
          <>
            {agreementNotifications.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-400 text-lg">No agreement notifications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {agreementNotifications.map(notification => (
                  <div
                    key={notification._id}
                    className={`rounded-lg border transition-all ${
                      notification.read
                        ? 'bg-white/5 border-white/10'
                        : 'bg-cyan-500/10 border-cyan-500/30'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <FileText
                            size={20}
                            className={notification.read ? 'text-gray-400' : 'text-cyan-400'}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white mb-1">{notification.title}</h3>
                            <p className="text-sm text-gray-400">{notification.message}</p>
                            {notification.data?.expirationDate && (
                              <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-2">
                                <Clock size={12} />
                                Expires: {new Date(notification.data.expirationDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        {!notification.read && (
                          <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full mt-1 flex-shrink-0" />
                        )}
                      </div>

                      {/* Action Buttons */}
                      {notification.type === 'agreement_pending' && (
                        <div className="flex gap-2 mt-4 flex-wrap">
                          <button
                            onClick={() => {
                              setSelectedAgreementId(notification.data?.agreementId || null);
                              setShowAgreementModal(true);
                              handleMarkAsRead(notification._id);
                            }}
                            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold transition-colors"
                          >
                            View Agreement
                          </button>
                          <button
                            onClick={() => {
                              if (notification.data?.agreementId) {
                                handleDownload(notification.data.agreementId);
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors"
                          >
                            Download
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Other Notifications */}
        {!loading && notifications.length > agreementNotifications.length && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">Other Notifications</h2>
            <div className="space-y-3">
              {notifications
                .filter(n => !['agreement_pending', 'agreement_signed', 'agreement_reminder'].includes(n.type))
                .map(notification => (
                  <div
                    key={notification._id}
                    className={`p-3 rounded-lg border ${
                      notification.read
                        ? 'bg-white/5 border-white/10'
                        : 'bg-cyan-500/10 border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-white text-sm">{notification.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Agreement Signing Modal */}
      {showAgreementModal && selectedAgreementId && (
        <AgreementSigningModal
          agreementId={selectedAgreementId}
          onClose={() => {
            setShowAgreementModal(false);
            setSelectedAgreementId(null);
          }}
          onSign={(action) => handleSignAgreement(selectedAgreementId, action)}
          isSigning={signingAgreement[selectedAgreementId] || false}
        />
      )}
    </div>
  );
}

interface AgreementSigningModalProps {
  agreementId: string;
  onClose: () => void;
  onSign: (action: 'sign' | 'reject') => Promise<void>;
  isSigning: boolean;
}

function AgreementSigningModal({ agreementId, onClose, onSign, isSigning }: AgreementSigningModalProps) {
  const [agreement, setAgreement] = useState<BookingAgreementDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    // In a real app, we would fetch the agreement details
    // For now, we'll just load from localStorage or the notification data
    // This is a simplified version - in production you'd fetch the full agreement
    setTimeout(() => setLoading(false), 500);
  }, [agreementId]);

  const handleSign = async () => {
    if (!agreed) {
      setError('Please tick the box to confirm you agree to the terms');
      return;
    }
    await onSign('sign');
  };

  const handleReject = async () => {
    await onSign('reject');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-[#0f172e] to-[#1a1f3a] rounded-lg border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[#0f172e] to-[#1a1f3a]">
          <h2 className="text-2xl font-bold text-white">Agreement To Sign</h2>
          <button
            onClick={onClose}
            disabled={isSigning}
            className="text-gray-400 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader size={40} className="text-cyan-400 animate-spin" />
          </div>
        ) : (
          <>
            {/* Agreement Content */}
            <div className="p-6">
              <div className="mb-6 pb-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-cyan-300 mb-4">BOARDING HOUSE RENTAL AGREEMENT</h3>

                <div className="space-y-3 text-sm text-gray-300">
                  <p>
                    <span className="text-gray-400">Agreement ID:</span>{' '}
                    <span className="font-mono text-cyan-300">AGR-{agreementId.slice(-8).toUpperCase()}</span>
                  </p>
                  <p>
                    <span className="text-gray-400">Move-in Date:</span> {' '}
                    {new Date().toLocaleDateString()}
                  </p>
                  <p>
                    <span className="text-gray-400">Duration:</span> 6 months
                  </p>
                  <p>
                    <span className="text-gray-400">Monthly Rent:</span>{' '}
                    <span className="font-semibold">Rs. 18,000</span>
                  </p>
                </div>
              </div>

              {/* Terms Section */}
              <div className="mb-6">
                <h4 className="font-semibold text-white mb-3">TERMS AND CONDITIONS</h4>
                <div className="bg-white/5 rounded p-4 text-sm text-gray-300 space-y-2 max-h-64 overflow-y-auto">
                  <p>1. Monthly rent must be paid on or before the 5th of each month.</p>
                  <p>2. Deposit will be refunded at checkout after deductions for damages.</p>
                  <p>3. Quiet hours are from 10:00 PM to 6:00 AM.</p>
                  <p>4. Property damage caused by tenant is tenant's responsibility.</p>
                  <p>5. 30 days written notice is required for early termination.</p>
                  <p className="text-xs text-gray-500 mt-4">
                    Additional terms and conditions as per the rental agreement provided by the property owner.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded p-3">
                  <AlertCircle size={16} className="text-red-400" />
                  <span className="text-xs text-red-300">{error}</span>
                </div>
              )}

              {/* Checkbox */}
              <div className="mb-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">
                    I agree to the{' '}
                    <a href="#" className="text-cyan-400 hover:underline">
                      Terms and Conditions
                    </a>
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={handleSign}
                  disabled={!agreed || isSigning}
                  className="flex-1 min-w-[150px] px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isSigning ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <FileText size={16} />
                      Accept Agreement
                    </>
                  )}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isSigning}
                  className="flex-1 min-w-[150px] px-6 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
