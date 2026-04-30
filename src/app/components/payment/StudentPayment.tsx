import React, { useEffect, useState } from 'react';
import { CheckCircle, Download, UploadCloud, AlertCircle, Info, Bell, BellOff, Navigation, XCircle, Loader2, Trash2, Check } from 'lucide-react';
import { generatePaymentReceiptPDF } from '../../helpers/generateReceipt';
import { getMyAgreements, BookingAgreementDto, respondToMyAgreement } from '../../api/bookingAgreementApi';

// ========================================
// MOCK DATA FOR DEVELOPMENT & TESTING
// Remove or conditionally show in production
// ========================================

// Define the structure for a payment record from the backend
interface PaymentRecord {
  _id: string;
  status: 'approved' | 'submitted' | 'pending' | 'overdue' | 'rejected' | 'paid';
  paymentAmount: number;
  uploadedAt: string; // ISO string
  dueDate?: string; // ISO string
  rejectionReason?: string;
  receiptId?: {
    _id: string;
    receiptNumber?: string;
    receiptUrl?: string;
  };
  receiptNumber?: string; // Added for direct access
}

// Mock data is removed, we will use live data


function formatMonthLabel(m: string) {
  return m;
}

export default function StudentPayment() {
  // Booking & Agreement State
  const [bookings, setBookings] = useState<BookingAgreementDto[]>([]);
  const [acceptedBookings, setAcceptedBookings] = useState<BookingAgreementDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Payment & Modal State
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'warn'>('warn');
  
  // Notifications (Rejection reminders) State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [respondingAgreementId, setRespondingAgreementId] = useState('');

  // Receipts State
  const [receipts, setReceipts] = useState<any[]>([]);
  const [isLoadingReceipts, setIsLoadingReceipts] = useState(false);

  // Next Due Date State
  const [nextDueDate, setNextDueDate] = useState<Date | null>(null);
  const [nextStartDate, setNextStartDate] = useState<Date | null>(null);

  // Room & Payment Type State
  const [roomType, setRoomType] = useState<'single' | 'shared' | null>(null);
  const [bedCount, setBedCount] = useState<number>(1);
  const [roomPrice, setRoomPrice] = useState<number>(0);
  const [roomName, setRoomName] = useState<string>('');
  const [fullRoomAmount, setFullRoomAmount] = useState<number>(0);
  const [splitRoomAmount, setSplitRoomAmount] = useState<number>(0);

  // Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentRemark, setPaymentRemark] = useState<string>('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [hasSubmittedPayment, setHasSubmittedPayment] = useState(false);

  // Validation Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Payment button state
  const [paymentButtonStatus, setPaymentButtonStatus] = useState<{
    disabled: boolean;
    message: string;
  }>({
    disabled: false,
    message: 'Click to enter details and attach slip',
  });

  // Calendar Navigation State
  const [displayMonth, setDisplayMonth] = useState<number>(new Date().getMonth());
  const [displayYear, setDisplayYear] = useState<number>(new Date().getFullYear());

  const MAX_REMARK_CHARS = 250;

  const today = new Date();
  const calendarYear = today.getFullYear();
  const calendarMonth = today.getMonth();

  // Navigate to previous month
  const handlePrevMonth = () => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  // Navigate to next month
  const handleNextMonth = () => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  // Render calendar for month view
  const renderCalendar = (year: number, month: number, dateToHighlight?: Date | null) => {
    console.log('📅 renderCalendar called with:');
    console.log('   Year:', year, 'Month:', month);
    console.log('   dateToHighlight:', dateToHighlight);
    if (dateToHighlight) {
      console.log('   Date - Year:', dateToHighlight.getUTCFullYear(), 'Month:', dateToHighlight.getUTCMonth() + 1, 'Day:', dateToHighlight.getUTCDate());
    }
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows: React.ReactNode[] = [];
    let day = 1 - firstDay;
    let rowKey = 0;
    
    while (day <= daysInMonth) {
      const cols: React.ReactNode[] = [];
      for (let i = 0; i < 7; i++, day++) {
        if (day < 1 || day > daysInMonth) {
          cols.push(<td key={`empty-${i}`} className="p-1" />);
        } else {
          // Create date in UTC to match dueDateToHighlight which is also in UTC
          const d = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
          const todayUTC = new Date();
          const todayMidnightUTC = new Date(Date.UTC(
            todayUTC.getUTCFullYear(),
            todayUTC.getUTCMonth(),
            todayUTC.getUTCDate(),
            0, 0, 0, 0
          ));
          const isToday = d.getTime() === todayMidnightUTC.getTime();
          
          // Compare using UTC date values directly
          let isHighlightedDate = false;
          if (dateToHighlight) {
            const highlightYear = dateToHighlight.getUTCFullYear();
            const highlightMonth = dateToHighlight.getUTCMonth();
            const highlightDay = dateToHighlight.getUTCDate();
            
            isHighlightedDate = (d.getUTCFullYear() === highlightYear && 
                        d.getUTCMonth() === highlightMonth && 
                        d.getUTCDate() === highlightDay);
            
            if (day === 29 && month === 3) { // April = month 3
              console.log('🔍 Day 29 check:');
              console.log('   Calendar date UTC:', d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
              console.log('   Highlight date:', highlightYear, highlightMonth + 1, highlightDay);
              console.log('   Match?', isHighlightedDate);
            }
          }
          
          cols.push(
            <td key={`day-${day}`} className="p-1 text-center align-middle">
              <div className={`w-8 h-8 flex items-center justify-center mx-auto text-xs rounded-full font-bold ${
                isToday 
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' 
                  : isHighlightedDate 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 relative' 
                  : ''
              }`}>
                {day}
                {isHighlightedDate && <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
              </div>
            </td>
          );
        }
      }
      rows.push(<tr key={`row-${rowKey}`}>{cols}</tr>);
      rowKey++;
    }
    return rows;
  };

  // Fetch student booking agreements
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const agr = await getMyAgreements();
        console.log('📋 Full agreements data:', agr);
        setBookings(agr);
        
        // Filter to only accepted agreements for payment display
        const accepted = agr.filter(agreement => agreement.status === 'accepted');
        console.log('✅ Accepted agreements:', accepted);
        setAcceptedBookings(accepted);

        // Determine room type from the first accepted booking
        if (accepted.length > 0) {
          const firstBooking = accepted[0];
          console.log('🏠 First booking:', firstBooking);
          console.log('   roomId:', firstBooking.roomId);
          console.log('   roomId?.price:', firstBooking.roomId?.price);
          console.log('   roomId?.bedCount:', firstBooking.roomId?.bedCount);
          console.log('   roomId?.name:', firstBooking.roomId?.name);
          
          // FALLBACK: If roomId is null, extract from agreement data
          let roomBedCount = firstBooking.roomId?.bedCount;
          let roomPrice = firstBooking.roomId?.price;
          let roomTitle = firstBooking.roomId?.name;
          
          // If roomId is null, try to extract bed count from terms text
          if (!roomBedCount && firstBooking.terms) {
            const bedCountMatch = firstBooking.terms.match(/Bed Count:\s*(\d+)/);
            roomBedCount = bedCountMatch ? parseInt(bedCountMatch[1]) : 1;
          }
          
          // If price is null, use rentAmount from agreement
          if (!roomPrice && firstBooking.rentAmount) {
            roomPrice = firstBooking.rentAmount;
          }
          
          // If name is null, extract from terms
          if (!roomTitle && firstBooking.terms) {
            const roomMatch = firstBooking.terms.match(/Room:\s*([^\n]+)/);
            roomTitle = roomMatch ? roomMatch[1].trim() : 'Room';
          }
          
          roomBedCount = roomBedCount || 1;
          roomPrice = roomPrice || 0;
          roomTitle = roomTitle || 'Room';

          console.log('💰 Extracted values:', { roomBedCount, roomPrice, roomTitle });

          setBedCount(roomBedCount);
          setRoomPrice(roomPrice);
          setRoomName(roomTitle);
          
          // Calculate amounts
          setFullRoomAmount(roomPrice);
          setSplitRoomAmount(roomPrice / roomBedCount);

          // Determine room type
          if (roomBedCount === 1) {
            setRoomType('single');
          } else {
            setRoomType('shared');
          }
        } else {
          console.log('⚠️ No accepted agreements found');
        }
      } catch (error) {
        console.error('❌ Error fetching bookings:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to fetch bookings');
        setBookings([]);
        setAcceptedBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Fetch payment history from backend
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setIsLoadingPayments(true);
        const token = localStorage.getItem('bb_access_token');
        
        if (!token) {
          setLoadError('Authentication token not found. Please log in again.');
          setIsLoading(false);
          return;
        }

        const fetchPayments = async () => {
          setIsLoadingPayments(true);
          try {
            const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';
            const response = await fetch(`${apiUrl}/payments/history`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (!response.ok) {
              throw new Error('Failed to fetch payment history');
            }
            const data = await response.json();
            // Add receiptNumber directly to the payment object
            const processedPayments = data.data.map((p: any) => ({
              ...p,
              receiptNumber: p.receiptId?.receiptNumber,
            }));
            setPayments(processedPayments);

            // Get the most recent payment to check its status
            const mostRecentPayment = processedPayments.length > 0 ? processedPayments[0] : null;

            if (mostRecentPayment) {
              if (mostRecentPayment.status === 'approved' || mostRecentPayment.status === 'paid') {
                // Payment approved - button disabled until next cycle starts
                const nextCycleStart = new Date(mostRecentPayment.dueDate || mostRecentPayment.uploadedAt);
                nextCycleStart.setDate(nextCycleStart.getDate() + 1);
                
                const today = new Date();
                const isNextCycleActive = today >= nextCycleStart;
                
                if (isNextCycleActive) {
                  // Next cycle has started - enable button
                  setPaymentButtonStatus({
                    disabled: false,
                    message: 'New cycle started - submit next payment',
                  });
                } else {
                  // Still waiting for next cycle - disable button
                  setPaymentButtonStatus({
                    disabled: true,
                    message: `Payment approved! ✓ Next cycle opens on ${nextCycleStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
                  });
                }
                setNextStartDate(nextCycleStart);
              } else if (mostRecentPayment.status === 'submitted' || mostRecentPayment.status === 'pending') {
                // Payment under review - disable button to prevent duplicate submissions
                setPaymentButtonStatus({
                  disabled: true,
                  message: '⏳ Your payment is under owner review - please wait',
                });
              } else if (mostRecentPayment.status === 'rejected') {
                // Payment rejected - allow resubmission
                setPaymentButtonStatus({
                  disabled: false,
                  message: '🔄 Payment rejected - please resubmit',
                });
              } else {
                // Other status - enable button
                setPaymentButtonStatus({
                  disabled: false,
                  message: 'Click to enter details and attach slip',
                });
              }
            } else {
              // No payment yet - button enabled
              setPaymentButtonStatus({
                disabled: false,
                message: 'Click to enter details and attach slip',
              });
            }
          } catch (error) {
            console.error('Error fetching payments:', error);
            setPaymentButtonStatus({
              disabled: false,
              message: 'Click to enter details and attach slip',
            });
          } finally {
            setIsLoadingPayments(false);
          }
        };

        // Only fetch if we have accepted bookings
        if (acceptedBookings.length > 0) {
          fetchPayments();
        }
      } catch (error) {
        console.error('Failed to fetch payment history:', error);
        setPayments([]); // Empty state on error
        setHasSubmittedPayment(false);
      } finally {
        setIsLoadingPayments(false);
      }
    };

    // Only fetch if we have accepted bookings
    if (acceptedBookings.length > 0) {
      fetchPaymentHistory();
      
      // Auto-refresh every 30 seconds to update button status and notifications
      const refreshInterval = setInterval(() => {
        fetchPaymentHistory();
      }, 30000);

      // Cleanup interval on component unmount
      return () => clearInterval(refreshInterval);
    }
  }, [acceptedBookings]);

  // Fetch rejection notifications (single source of truth for all notifications)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoadingNotifications(true);
        const token = localStorage.getItem('bb_access_token');
        const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';
        
        const response = await fetch(`${apiUrl}/notifications`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Show all notifications (rejection + payment reminders)
          const allNotifications = (data.data || [])
            .filter((notif: any) => 
              notif.type === 'payment_rejected' ||
              notif.type === 'payment_pre_payment' ||
              (notif.type === 'system' && String(notif.title || '').toLowerCase().includes('agreement'))
            )
            .map((notif: any) => ({
              ...notif,
              id: notif._id,
              isRead: notif.read,
            }));
          setNotifications(allNotifications);
        } else {
          setNotifications([]);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchNotifications();
    
    // Refresh notifications every 60 seconds instead of 30 for better performance
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch receipts for Download Receipts section
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setIsLoadingReceipts(true);
        const token = localStorage.getItem('bb_access_token');
        const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';
        
        const response = await fetch(`${apiUrl}/payments/receipts`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setReceipts(data.data || []);
        } else {
          setReceipts([]);
        }
      } catch (error) {
        console.error('Failed to fetch receipts:', error);
        setReceipts([]);
      } finally {
        setIsLoadingReceipts(false);
      }
    };

    fetchReceipts();
    
    // Auto-refresh receipts every 30 seconds to show newly approved payments
    const refreshInterval = setInterval(() => {
      fetchReceipts();
    }, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Delete a notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('bb_access_token');
      const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';
      
      const response = await fetch(`${apiUrl}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove the notification from the local state to update the UI
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        setNotificationType('success');
        setNotification('Reminder deleted.');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      setNotificationType('error');
      setNotification(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  const handleDownloadReceipt = async (receiptNumber: string) => {
    try {
      const token = localStorage.getItem('bb_access_token');
      if (!token) {
        setNotificationType('error');
        setNotification('Authentication error. Please log in again.');
        return;
      }

      const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/payments/receipt/download/${receiptNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download receipt.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Receipt download error:', error);
      setNotificationType('error');
      setNotification(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  const handleAgreementResponseFromNotification = async (agreementId: string, status: 'accepted' | 'rejected') => {
    setRespondingAgreementId(agreementId);
    try {
      await respondToMyAgreement(agreementId, status);
      setNotificationType('success');
      setNotification(`Agreement ${status} successfully.`);
      setNotifications((prev) => prev.filter((item) => item.data?.agreementId !== agreementId));
    } catch (error) {
      setNotificationType('error');
      setNotification(error instanceof Error ? error.message : 'Failed to respond to agreement');
    } finally {
      setRespondingAgreementId('');
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, file: 'Invalid file type. Please upload PNG, JPG, or PDF only.' }));
      return;
    }
    if (file.size > maxSizeBytes) {
      setFormErrors(prev => ({ ...prev, file: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max size is 5 MB.` }));
      return;
    }
    setFormErrors(prev => { const n = { ...prev }; delete n.file; return n; });
    setUploadedFile(file);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date();
    minDate.setDate(today.getDate() - 90);

    // Determine max allowed payment amount based on room type
    const maxAllowedAmount = roomType === 'single' ? fullRoomAmount * 2 : splitRoomAmount * 2;

    // Amount validation
    const amountNum = parseFloat(paymentAmount);
    if (!paymentAmount || isNaN(amountNum)) {
      errors.amount = 'Payment amount is required.';
    } else if (amountNum <= 0) {
      errors.amount = 'Amount must be greater than Rs. 0.';
    } else if (amountNum > maxAllowedAmount) {
      errors.amount = `Amount cannot exceed Rs. ${maxAllowedAmount.toLocaleString()} (2x monthly rent).`;
    }

    // Date validation
    const dateVal = new Date(paymentDate);
    dateVal.setHours(0, 0, 0, 0);
    if (!paymentDate) {
      errors.date = 'Payment date is required.';
    } else if (dateVal > today) {
      errors.date = 'Payment date cannot be in the future.';
    } else if (dateVal < minDate) {
      errors.date = 'Payment date cannot be older than 90 days.';
    }

    // Remarks validation
    if (paymentRemark.length > MAX_REMARK_CHARS) {
      errors.remarks = `Remarks must be ${MAX_REMARK_CHARS} characters or fewer.`;
    }

    // File validation
    if (!uploadedFile) {
      errors.file = 'You must attach a payment slip (PNG, JPG, or PDF).';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Validate we have an active booking agreement
    if (!acceptedBookings || acceptedBookings.length === 0 || !acceptedBookings[0]?._id) {
      setFormErrors({ agreement: 'No active booking agreement found. Please ensure you have an accepted booking agreement.' });
      return;
    }

    // All validation passed - submit to backend
    setIsSubmittingPayment(true);
    try {
      const formData = new FormData();
      formData.append('paymentSlip', uploadedFile as File);
      formData.append('bookingAgreementId', acceptedBookings[0]._id);
      formData.append('paymentAmount', paymentAmount);
      formData.append('remarks', paymentRemark);

      const token = localStorage.getItem('bb_access_token');
      const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/payments/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit payment');
      }

      setFormErrors({});
      setNotificationType('success');
      setNotification('✓ Payment slip submitted successfully! Owner will review it shortly.');
      setHasSubmittedPayment(true); // Disable payment button after successful submission
      
      // Close modal and reset form after 2 seconds
      setTimeout(() => {
        setShowUploadModal(false);
        setUploadedFile(null);
        setPaymentAmount('');
        setPaymentRemark('');
      }, 2000);
    } catch (error) {
      console.error('Payment submission error:', error);
      setNotificationType('error');
      setNotification(`Error: ${error instanceof Error ? error.message : 'Failed to submit payment'}`);
    } finally {
      setIsSubmittingPayment(false);
    }
  };



  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-gray-400">Loading your bookings...</p>
        </div>
      )}

      {/* Error State */}
      {loadError && !isLoading && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center">
          <AlertCircle className="inline mb-2" size={32} color="#ff6b6b" />
          <p className="text-red-400 text-lg">{loadError}</p>
        </div>
      )}

      {/* No Bookings Yet */}
      {!isLoading && !loadError && acceptedBookings.length === 0 && (
        <div className="bg-gradient-to-br from-slate-900/60 to-slate-900/95 rounded-2xl p-12 text-white shadow-lg text-center">
          <div className="mb-4">
            <AlertCircle size={64} className="mx-auto text-amber-400 mb-4" />
          </div>
          <h2 className="text-3xl font-bold mb-3">No Active Agreements</h2>
          <p className="text-gray-400 text-lg mb-6">
            You don't have any accepted boarding agreements yet. Once an owner approves your booking request and you accept the agreement, you'll be able to manage your payments here.
          </p>
          <button
            onClick={() => window.location.href = '/find'}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Browse Available Rooms
          </button>
        </div>
      )}

      {/* Show Payment Dashboard Only If Accepted Agreements Exist */}
      {!isLoading && !loadError && acceptedBookings.length > 0 && (
      <div className="bg-gradient-to-b from-slate-900/60 to-slate-900/95 rounded-2xl p-6 text-white shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Sidebar calendar */}
          <aside className="md:col-span-3 bg-white/5 rounded-lg p-4 relative z-10 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <button onClick={handlePrevMonth} className="p-1 text-gray-400 hover:text-white">&lt;</button>
              <h4 className="text-sm font-semibold">{new Date(displayYear, displayMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
              <button onClick={handleNextMonth} className="p-1 text-gray-400 hover:text-white">&gt;</button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <th key={i} className="p-1 font-normal text-gray-500">{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {renderCalendar(displayYear, displayMonth, nextDueDate)}
              </tbody>
            </table>
            {nextDueDate && (
              <div className="mt-4 text-center border-t border-white/10 pt-3">
                <p className="text-xs text-emerald-400 font-semibold">Next Payment Due</p>
                <p className="text-sm font-bold text-white">{nextDueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="md:col-span-9">
            {notification && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${notificationType === 'success' ? 'bg-emerald-600/20 text-emerald-200' : 'bg-yellow-600/20 text-yellow-200'}`}>
                <AlertCircle size={18} />
                <div className="text-sm">{notification}</div>
              </div>
            )}

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Payment History</h2>
              {isLoadingPayments ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="animate-spin text-cyan-400" size={24} />
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {payments.map(p => (
                    <div key={p._id} className="min-w-[220px] bg-white/5 rounded-lg p-4 flex-shrink-0 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle size={28} className={
                            p.status === 'approved' || p.status === 'paid' ? 'text-emerald-400' :
                            p.status === 'submitted' ? 'text-yellow-400' :
                            p.status === 'rejected' ? 'text-rose-400' : 'text-gray-500'
                          } />
                          <div>
                            <div className="font-medium text-sm">Rs. {p.paymentAmount.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(p.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-center mt-3 px-2 py-1 rounded-full bg-white/5 font-semibold capitalize">
                        {p.status}
                      </div>
                      {p.status === 'approved' && p.receiptNumber && (
                        <div className="mt-3 text-center border-t border-white/10 pt-2">
                          <button
                            onClick={() => handleDownloadReceipt(p.receiptNumber!)}
                            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                          >
                            Download PDF
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {payments.length === 0 && !isLoadingPayments && (
                    <div className="text-center py-8 text-gray-400 w-full">
                      <p className="text-sm">No payment history found.</p>
                    </div>
                  )}
                </div>
              )}
            </section>
            
            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Bell size={20} className="text-amber-400" />
                Rejection Reminders
              </h3>
              {isLoadingNotifications ? (
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="animate-spin text-cyan-400" size={24} />
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map(notif => {
                    const isRejection = notif.type === 'payment_rejected';
                    const isReminder = notif.type === 'payment_pre_payment';
                    const isAgreement = notif.type === 'system' && String(notif.title || '').toLowerCase().includes('agreement');
                    const agreementId = notif.data?.agreementId || '';
                    
                    return (
                    <div key={notif.id} className={`p-4 rounded-lg border flex items-start gap-4 transition-all ${notif.isRead ? (isRejection ? 'bg-slate-800/50 border-white/5' : isAgreement ? 'bg-cyan-900/20 border-white/5' : 'bg-amber-900/30 border-white/5') : (isRejection ? 'bg-rose-500/10 border-rose-500/20' : isAgreement ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-amber-500/10 border-amber-500/20')}`}>
                      <div className={`mt-1 flex-shrink-0 p-1.5 rounded-full ${notif.isRead ? 'bg-white/10' : (isRejection ? 'bg-rose-500/20' : isAgreement ? 'bg-cyan-500/20' : 'bg-amber-500/20')}`}>
                        <AlertCircle size={18} className={notif.isRead ? 'text-gray-400' : (isRejection ? 'text-rose-400' : isAgreement ? 'text-cyan-400' : 'text-amber-400')} />
                      </div>
                      <div className="flex-grow">
                        <p className={`text-sm font-semibold ${notif.isRead ? 'text-gray-300' : 'text-white'}`}>
                          {isRejection ? 'Payment Slip Rejected' : isAgreement ? 'New Agreement Received' : '💰 Payment Reminder'}
                        </p>
                        <p className={`text-xs mt-1 ${notif.isRead ? 'text-gray-400' : (isRejection ? 'text-rose-200' : 'text-amber-200')}`}>
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          {isAgreement && agreementId && (
                            <>
                              <button
                                disabled={respondingAgreementId === agreementId}
                                onClick={() => handleAgreementResponseFromNotification(agreementId, 'accepted')}
                                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 disabled:opacity-60"
                              >
                                <Check size={14} /> Accept
                              </button>
                              <button
                                disabled={respondingAgreementId === agreementId}
                                onClick={() => handleAgreementResponseFromNotification(agreementId, 'rejected')}
                                className="text-xs font-medium text-rose-400 hover:text-rose-300 flex items-center gap-1 disabled:opacity-60"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDeleteNotification(notif.id)} className="text-xs font-medium text-gray-500 hover:text-rose-400 flex items-center gap-1">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-500 flex-shrink-0">{new Date(notif.createdAt).toLocaleDateString()}</span>
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-white/10 rounded-lg text-gray-400">
                  <BellOff size={32} className="mb-3 opacity-30" />
                  <p className="text-sm">No rejection reminders</p>
                </div>
              )}
            </section>
            
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Details & Split Module */}
              {acceptedBookings.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Current Dues</h3>
                      <p className="text-sm text-gray-400">{roomName}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-5 border border-white/5 mb-6">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Your Share To Pay</p>
                        <p className="text-3xl font-bold tracking-tight text-white">
                          Rs. {splitRoomAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-medium mb-3">Upload Payment Slip</h4>
                    <button
                      onClick={() => {
                        setPaymentAmount(splitRoomAmount.toString());
                        setShowUploadModal(true);
                      }}
                      disabled={paymentButtonStatus.disabled}
                      className={`w-full relative group overflow-hidden text-white rounded-xl p-4 shadow-lg transition-all duration-300 transform ${
                        paymentButtonStatus.disabled
                          ? 'bg-slate-800/50 cursor-not-allowed opacity-60'
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                      <div className="relative flex items-center justify-center gap-3">
                        <UploadCloud size={24} />
                        <span className="font-semibold text-lg">Make a Payment</span>
                      </div>
                    </button>
                    <p className={`text-xs text-center mt-3 ${paymentButtonStatus.disabled ? 'text-emerald-400 font-medium' : 'text-gray-400'}`}>
                      {paymentButtonStatus.message}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-3">Download Receipts</h3>
                {isLoadingReceipts ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 className="animate-spin text-cyan-400" size={24} />
                  </div>
                ) : receipts.length > 0 ? (
                  <div className="space-y-3">
                    {receipts.map(p => (
                      <div key={p._id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-500/10 rounded-full">
                            <Download size={16} className="text-cyan-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{new Date(p.receiptDate || p.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Receipt</div>
                            <div className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={10} /> Approved</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadReceipt(p.receiptNumber)}
                          className="flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                        >
                          <Download size={14} />
                          PDF
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 border border-dashed border-white/10 rounded-lg text-gray-400">
                    <Download size={32} className="mb-3 opacity-30" />
                    <p className="text-sm">No receipts available</p>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
      )}

      {/* Upload Slip Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
          <div className="bg-slate-900/80 backdrop-blur-2xl ring-1 ring-white/10 w-full max-w-md rounded-3xl shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/20">
                  <UploadCloud size={18} className="text-cyan-400" />
                </div>
                Submit Payment
              </h3>
              <button
                onClick={() => { setShowUploadModal(false); setFormErrors({}); }}
                className="text-gray-500 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"
              >
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-5" noValidate>

              {/* Amount */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2">Payment Amount</label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm group-focus-within:text-cyan-400 transition-colors">Rs.</span>
                  <input
                    type="number"
                    value={paymentAmount}
                    readOnly
                    className={`w-full bg-white/5 border rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 transition-all outline-none cursor-not-allowed opacity-75 ${formErrors.amount ? 'border-rose-500/70 focus:ring-rose-500/30' : 'border-white/10 focus:ring-cyan-500/40 focus:border-cyan-500/50'
                      }`}
                    placeholder="e.g. 15000"
                  />
                </div>
                {formErrors.amount && (
                  <p className="flex items-center gap-1.5 text-[11px] text-rose-400 mt-1.5 font-medium">
                    <AlertCircle size={12} /> {formErrors.amount}
                  </p>
                )}
                {!formErrors.amount && <p className="text-[10px] text-cyan-500/70 mt-1.5 font-medium">Entering less than full rent automatically marks it as partial.</p>}
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2">Date of Transfer</label>
                <input
                  type="date"
                  value={paymentDate}
                  readOnly
                  className={`w-full bg-white/5 border rounded-xl py-2.5 px-4 text-white focus:bg-white/10 focus:ring-2 transition-all outline-none [color-scheme:dark] cursor-not-allowed opacity-75 ${formErrors.date ? 'border-rose-500/70 focus:ring-rose-500/30' : 'border-white/10 focus:ring-cyan-500/40 focus:border-cyan-500/50'
                    }`}
                />
                {formErrors.date && (
                  <p className="flex items-center gap-1.5 text-[11px] text-rose-400 mt-1.5 font-medium">
                    <AlertCircle size={12} /> {formErrors.date}
                  </p>
                )}
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2">Add a Note (Optional)</label>
                <textarea
                  value={paymentRemark}
                  onChange={(e) => { setPaymentRemark(e.target.value); setFormErrors(prev => { const n = { ...prev }; delete n.remarks; return n; }); }}
                  className={`w-full bg-white/5 border rounded-xl py-2.5 px-4 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 transition-all resize-none outline-none h-20 ${formErrors.remarks ? 'border-rose-500/70 focus:ring-rose-500/30' : 'border-white/10 focus:ring-cyan-500/40 focus:border-cyan-500/50'
                    }`}
                  placeholder="e.g. Add any additional notes here..."
                />
                <div className="flex justify-between items-center mt-1">
                  {formErrors.remarks ? (
                    <p className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
                      <AlertCircle size={12} /> {formErrors.remarks}
                    </p>
                  ) : <span />}
                  <p className={`text-[10px] ml-auto ${paymentRemark.length > MAX_REMARK_CHARS ? 'text-rose-400' : 'text-gray-500'}`}>
                    {paymentRemark.length}/{MAX_REMARK_CHARS}
                  </p>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2">Attach Slip</label>
                <label className={`block border border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.01] ${formErrors.file ? 'border-rose-500/50 bg-rose-500/5' :
                    uploadedFile ? 'border-emerald-500/50 bg-emerald-500/5' :
                      'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-400/50 hover:bg-cyan-500/10'
                  }`}>
                  <div className="flex flex-col items-center justify-center p-6 text-sm text-center">
                    {uploadedFile ? (
                      <>
                        <div className="p-2 bg-emerald-500/20 rounded-full mb-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          <CheckCircle size={28} className="text-emerald-400" />
                        </div>
                        <span className="font-semibold text-emerald-300">{uploadedFile.name}</span>
                        <span className="text-[10px] text-gray-500 mt-1">Click to replace file</span>
                      </>
                    ) : (
                      <>
                        <div className={`p-2 rounded-full mb-3 ${formErrors.file ? 'bg-rose-500/10' : 'bg-cyan-500/10'}`}>
                          <UploadCloud size={28} className={formErrors.file ? 'text-rose-400' : 'text-cyan-400'} />
                        </div>
                        <span className={`font-semibold ${formErrors.file ? 'text-rose-300' : 'text-cyan-200'}`}>Upload Image or PDF</span>
                        <span className="text-[10px] text-gray-500 mt-1">PNG, JPG, PDF up to 5MB</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/png,image/jpeg,image/jpg,application/pdf" onChange={handleUpload} className="sr-only" />
                </label>
                {formErrors.file && (
                  <p className="flex items-center gap-1.5 text-[11px] text-rose-400 mt-1.5 font-medium">
                    <AlertCircle size={12} /> {formErrors.file}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className={`w-full font-bold tracking-wide py-3.5 rounded-xl transition-all shadow-lg transform active:translate-y-0 ${
                    isSubmittingPayment
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white hover:shadow-cyan-500/40 shadow-cyan-500/25 hover:-translate-y-0.5'
                  }`}
                >
                  {isSubmittingPayment ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Payment'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

