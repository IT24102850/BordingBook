import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Download, UploadCloud, AlertCircle, Info } from 'lucide-react';

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

function formatMonthLabel(m: string) {
  return m;
}

export default function StudentPayment(): JSX.Element {
  const [payments] = useState<PaymentRecord[]>(initialPayments);
  const [notification, setNotification] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

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
      setNotification('Slip uploaded successfully (UI only)');
    }
  };

  const renderCalendar = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows: JSX.Element[] = [];
    let day = 1 - firstDay;
    while (day <= daysInMonth) {
      const cols: JSX.Element[] = [];
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
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <th key={d} className="py-1 w-[14%] whitespace-nowrap text-center">{d}</th>)}
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
            {notification && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-600/20 text-yellow-200 flex items-center gap-3">
                <AlertCircle size={18} />
                <div className="text-sm">{notification}</div>
              </div>
            )}

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Payment History</h2>
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
                <h3 className="text-lg font-semibold mb-3">Upload Payment Slip</h3>
                <label className="block border-2 border-dashed border-white/10 rounded-lg p-6 text-center cursor-pointer hover:border-white/20">
                  <div className="flex items-center justify-center gap-3 text-sm text-gray-200">
                    <UploadCloud />
                    <div>
                      <div className="font-medium">Drag & drop a slip, or click to select</div>
                      <div className="text-xs text-gray-400">Accepted: jpg, png, pdf — UI only</div>
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
      </div>
    </div>
  );
}
