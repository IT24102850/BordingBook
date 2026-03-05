import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Download, UploadCloud, AlertCircle, Info, Bell, BellOff, Home, MapPin, Calendar, DollarSign, User, FileText, CheckCircle2 } from 'lucide-react';

// Booking Payment Interface
interface BookingPayment {
  bookingId: string;
  roomTitle: string;
  roomImage: string;
  roomPrice: number;
  location: string;
  moveInDate: string;
  duration: number;
  totalAmount: number;
  status: 'not_uploaded' | 'uploaded' | 'verified' | 'rejected';
  uploadedSlipUrl?: string;
  receiptUrl?: string;
  ownerName: string;
  approvedDate: string;
}

// Monthly Payment Interface
interface PaymentRecord {
  month: string;
  dueDate: string; // ISO string
  status: 'paid' | 'pending' | 'overdue';
  receiptUrl?: string;
}

const initialPayments: PaymentRecord[] = [
  { month: 'Jan 2026', dueDate: '2026-01-20', status: 'paid', receiptUrl: '/receipts/jan2026.pdf' },
  { month: 'Feb 2026', dueDate: '2026-02-20', status: 'paid', receiptUrl: '/receipts/feb2026.pdf' },
  { month: 'Mar 2026', dueDate: '2026-03-20', status: 'pending' },
];

// Mock approved booking data - In production, this would come from API/state management
const mockApprovedBooking: BookingPayment = {
  bookingId: 'BK002',
  roomTitle: 'Modern Boarding House near SLIIT',
  roomImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  roomPrice: 18000,
  location: 'Malabe, Colombo',
  moveInDate: '2026-04-01',
  duration: 6,
  totalAmount: 108000, // 18000 * 6 months
  status: 'not_uploaded', // Change to test different states: not_uploaded, uploaded, verified, rejected
  ownerName: 'Mr. Perera',
  approvedDate: '2026-03-04'
};

function formatMonthLabel(m: string) {
  return m;
}

export default function StudentPayment(): React.JSX.Element {
  const [payments] = useState<PaymentRecord[]>(initialPayments);
  const [bookingPayment, setBookingPayment] = useState<BookingPayment>(mockApprovedBooking);
  const [notification, setNotification] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [bookingSlipFile, setBookingSlipFile] = useState<File | null>(null);

  const nextPending = useMemo(() => payments.find(p => p.status === 'pending'), [payments]);
  const highlightDate = nextPending ? new Date(nextPending.dueDate) : null;

  const today = new Date();
  const calendarYear = today.getFullYear();
  const calendarMonth = today.getMonth();

  useEffect(() => {
    const now = new Date();
    if (nextPending) {
      const due = new Date(nextPending.dueDate);
      const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 5) setNotification('Reminder: payment due in 5 days');
      else if (diff > 0 && diff < 5) setNotification('Payment due soon');
      else if (diff <= 0 && diff >= -5) setNotification('Warning: payment within short overdue window');
      else if (diff < -5) setNotification('Payment overdue!');
    }
  }, [nextPending]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setNotification('Monthly payment slip uploaded successfully (UI only)');
    }
  };

  const handleBookingSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setBookingSlipFile(file);
    }
  };

  const handleSubmitBookingPayment = () => {
    if (!bookingSlipFile) {
      alert('Please select a payment slip to upload');
      return;
    }
    // Simulate upload
    setBookingPayment(prev => ({
      ...prev,
      status: 'uploaded',
      uploadedSlipUrl: URL.createObjectURL(bookingSlipFile)
    }));
    setNotification('✓ Booking payment slip uploaded successfully! Owner will verify it soon.');
    setBookingSlipFile(null);
  };

  const downloadReceipt = () => {
    // Simulate receipt download
    alert('Receipt download started (UI only)');
  };

  const renderCalendar = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows: React.JSX.Element[] = [];
    let day = 1 - firstDay;
    while (day <= daysInMonth) {
      const cols: React.JSX.Element[] = [];
      for (let i = 0; i < 7; i++, day++) {
        if (day < 1 || day > daysInMonth) cols.push(<td key={i} className="p-1" />);
        else {
          const d = new Date(year, month, day);
          const isToday = d.toDateString() === new Date().toDateString();
          const isHighlight = highlightDate && d.toDateString() === highlightDate.toDateString();
          cols.push(
            <td key={i} className="p-1 text-center align-middle overflow-hidden">
              <div className={`w-8 h-8 leading-8 mx-auto ${isHighlight ? 'bg-emerald-500 text-white rounded-full' : isToday ? 'bg-white/10 rounded' : ''}`}>{day}</div>
            </td>
          );
        }
      }
      rows.push(<tr key={day}>{cols}</tr>);
    }
    return rows;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Approved Booking Payment Section */}
      <div className="bg-gradient-to-br from-cyan-900/40 via-purple-900/30 to-indigo-900/40 rounded-2xl p-6 mb-6 text-white shadow-xl border border-cyan-500/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <CheckCircle2 size={28} className="text-emerald-400" />
              Approved Booking Payment
            </h2>
            <p className="text-sm text-gray-300 mt-1">Booking ID: {bookingPayment.bookingId}</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
              bookingPayment.status === 'not_uploaded' ? 'bg-amber-900/40 text-amber-300 border border-amber-500/30' :
              bookingPayment.status === 'uploaded' ? 'bg-blue-900/40 text-blue-300 border border-blue-500/30' :
              bookingPayment.status === 'verified' ? 'bg-green-900/40 text-green-300 border border-green-500/30' :
              'bg-red-900/40 text-red-300 border border-red-500/30'
            }`}>
              {bookingPayment.status === 'not_uploaded' && '⏳ Payment Pending'}
              {bookingPayment.status === 'uploaded' && '🔍 Under Review'}
              {bookingPayment.status === 'verified' && '✓ Payment Verified'}
              {bookingPayment.status === 'rejected' && '✗ Payment Rejected'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Room Details Card */}
          <div className="md:col-span-2 bg-white/5 rounded-lg p-5 backdrop-blur-sm">
            <div className="flex gap-4">
              <img 
                src={bookingPayment.roomImage} 
                alt={bookingPayment.roomTitle}
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{bookingPayment.roomTitle}</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-cyan-400" />
                    <span>{bookingPayment.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-purple-400" />
                    <span>Move-in: {new Date(bookingPayment.moveInDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-400" />
                    <span>LKR {bookingPayment.roomPrice.toLocaleString()}/month × {bookingPayment.duration} months</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-amber-400" />
                    <span>Owner: {bookingPayment.ownerName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Action Card */}
          <div className="bg-white/5 rounded-lg p-5 backdrop-blur-sm">
            <div className="text-center mb-4">
              <div className="text-sm text-gray-400 mb-1">Total Amount</div>
              <div className="text-3xl font-bold text-emerald-400">
                LKR {bookingPayment.totalAmount.toLocaleString()}
              </div>
            </div>

            {bookingPayment.status === 'not_uploaded' && (
              <div className="space-y-3">
                <div className="text-sm text-amber-300 bg-amber-900/20 p-3 rounded-lg border border-amber-500/20">
                  ⚠️ Please upload your payment slip to proceed
                </div>
                <label className="block">
                  <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-cyan-400/50 hover:bg-white/5 transition-all">
                    <UploadCloud size={32} className="mx-auto mb-2 text-cyan-400" />
                    <div className="text-sm text-gray-300">
                      {bookingSlipFile ? (
                        <span className="text-emerald-400">✓ {bookingSlipFile.name}</span>
                      ) : (
                        'Click to upload slip'
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">JPG, PNG, PDF (Max 5MB)</div>
                  </div>
                  <input 
                    type="file" 
                    onChange={handleBookingSlipUpload}
                    accept="image/*,.pdf"
                    className="sr-only" 
                  />
                </label>
                <button
                  onClick={handleSubmitBookingPayment}
                  disabled={!bookingSlipFile}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Submit Payment Slip
                </button>
              </div>
            )}

            {bookingPayment.status === 'uploaded' && (
              <div className="space-y-3">
                <div className="text-sm text-blue-300 bg-blue-900/20 p-3 rounded-lg border border-blue-500/20 text-center">
                  🔍 Your payment is being verified by the owner
                </div>
                <div className="text-xs text-gray-400 text-center">
                  This usually takes 1-2 business days
                </div>
              </div>
            )}

            {bookingPayment.status === 'verified' && (
              <div className="space-y-3">
                <div className="text-sm text-green-300 bg-green-900/20 p-4 rounded-lg border border-green-500/20 text-center">
                  ✓ Payment Verified
                </div>
                <button
                  onClick={downloadReceipt}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Download Receipt
                </button>
              </div>
            )}

            {bookingPayment.status === 'rejected' && (
              <div className="space-y-3">
                <div className="text-sm text-red-300 bg-red-900/20 p-3 rounded-lg border border-red-500/20">
                  ✗ Payment rejected. Please upload a clear payment slip.
                </div>
                <label className="block">
                  <div className="border-2 border-dashed border-red-400/30 rounded-lg p-4 text-center cursor-pointer hover:border-red-400/50 hover:bg-white/5 transition-all">
                    <UploadCloud size={32} className="mx-auto mb-2 text-red-400" />
                    <div className="text-sm text-gray-300">
                      {bookingSlipFile ? (
                        <span className="text-emerald-400">✓ {bookingSlipFile.name}</span>
                      ) : (
                        'Re-upload payment slip'
                      )}
                    </div>
                  </div>
                  <input 
                    type="file" 
                    onChange={handleBookingSlipUpload}
                    accept="image/*,.pdf"
                    className="sr-only" 
                  />
                </label>
                <button
                  onClick={handleSubmitBookingPayment}
                  disabled={!bookingSlipFile}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Re-submit Payment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Rental Payments Section */}
      <div className="bg-gradient-to-b from-slate-900/60 to-slate-900/95 rounded-2xl p-6 text-white shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Sidebar calendar */}
          <aside className="md:col-span-3 bg-white/5 rounded-lg p-4 relative z-10 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Next Due Date</h3>
              <span className="text-xs text-gray-300">{today.toLocaleString('default', { month: 'long' })} {calendarYear}</span>
            </div>
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="text-xs text-gray-300">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <th key={d} className="py-1 w-[14%] whitespace-nowrap text-center">{d}</th>)}
                </tr>
              </thead>
              <tbody className="text-gray-200">{renderCalendar(calendarYear, calendarMonth)}</tbody>
            </table>

            <div className="mt-4 text-xs text-gray-300 flex items-center gap-2">
              <span className="inline-flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded-full" /> Next Due</span>
            </div>
          </aside>

          {/* Main content */}
          <main className="md:col-span-9">
            <div className="mb-4 flex items-center gap-3">
              <Home size={20} className="text-cyan-400" />
              <h2 className="text-xl font-semibold">Monthly Rental Payments</h2>
            </div>

            {notification && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-600/20 text-yellow-200 flex items-center gap-3">
                <AlertCircle size={18} />
                <div className="text-sm">{notification}</div>
              </div>
            )}

            <section className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Payment History</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {payments.map(p => (
                  <div key={p.month} className="min-w-[140px] bg-white/3 rounded-lg p-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle size={28} className={p.status === 'paid' ? 'text-emerald-400' : p.status === 'pending' ? 'text-yellow-300' : 'text-rose-400'} />
                        <div>
                          <div className="font-medium">{formatMonthLabel(p.month)}</div>
                          <div className="text-xs text-gray-300">Due {new Date(p.dueDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-white/5">{p.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/3 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Upload Monthly Payment Slip</h3>
                <label className="block border-2 border-dashed border-white/10 rounded-lg p-6 text-center cursor-pointer hover:border-white/20">
                  <div className="flex items-center justify-center gap-3 text-sm text-gray-200">
                    <UploadCloud />
                    <div>
                      <div className="font-medium">Drag & drop a slip, or click to select</div>
                      <div className="text-xs text-gray-400">Accepted: jpg, png, pdf — For monthly rent</div>
                    </div>
                  </div>
                  <input type="file" onChange={handleUpload} className="sr-only" />
                </label>
                {uploadedFile && <div className="mt-3 text-sm text-emerald-300">{uploadedFile.name} ready to submit</div>}
              </div>

              <div className="bg-white/3 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Download Receipts</h3>
                <div className="space-y-3">
                  {payments.filter(p => p.status === 'paid' && p.receiptUrl).map(p => (
                    <div key={p.month} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Download size={16} className="text-cyan-300" />
                        <div className="text-sm text-cyan-200">{p.month}</div>
                      </div>
                      <a href={p.receiptUrl} download className="text-xs text-white/80 bg-white/5 px-3 py-1 rounded">Download</a>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </main>
        </div>

        {/* System Reminders Section */}
        <section className="bg-white/3 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Bell size={20} className="text-amber-400" />
            System Reminders
          </h3>
          <div className="flex flex-col items-center justify-center py-10 border border-dashed border-white/10 rounded-lg text-gray-400">
            <BellOff size={32} className="mb-3 opacity-30" />
            <p className="text-sm">No reminders</p>
          </div>
        </section>
      </div>
    </div>
  );
}
