import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Trash2, AlertCircle, Eye, CheckCircle, XCircle, ArrowRight, Navigation, Loader2 } from 'lucide-react';
import { generatePaymentReceiptPDF } from '../../helpers/generateReceipt';

// Types
interface BoardingHouse {
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
  houseId: string;
  roomNumber: string;
  floor: number;
  bedCount: number;
  occupiedBeds: number;
  price: number;
  facilities: string[];
  status: 'available' | 'partial' | 'full';
  images: string[];
  tenants: Tenant[];
}

interface Tenant {
  id: string;
  name: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  monthlyRent: number;
  phone?: string;
  email?: string;
}

interface Facility {
  id: string;
  name: string;
  icon: React.ReactNode;
}

// Mock Data
const mockHouses: BoardingHouse[] = [
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
  {
    id: '201',
    houseId: '2',
    roomNumber: '201',
    floor: 2,
    bedCount: 1,
    occupiedBeds: 0,
    price: 25000,
    facilities: ['wifi', 'ac', 'bathroom', 'meals', 'parking'],
    status: 'available',
    images: [
      'https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    tenants: []
  }
];

const facilitiesList: Facility[] = [
  { id: 'wifi', name: 'Wi-Fi', icon: <Wifi size={14} /> },
  { id: 'ac', name: 'AC', icon: <Wind size={14} /> },
  { id: 'bathroom', name: 'Attached Bathroom', icon: <Bath size={14} /> },
  { id: 'meals', name: 'Meals Included', icon: <Coffee size={14} /> },
  { id: 'parking', name: 'Parking', icon: <Building size={14} /> },
  { id: 'laundry', name: 'Laundry', icon: <Wind size={14} /> },
  { id: 'study', name: 'Study Area', icon: <Building size={14} /> },
  { id: 'security', name: 'Security', icon: <Eye size={14} /> }
];

// Stats Card Component (Desktop)
const StatsCard = ({ title, value, icon, trend, color }: any) => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-cyan-400/30 transition-all">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg ${color}`}>
        {icon}
      </div>
      <span className={`text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
        <TrendingUp size={12} className={trend >= 0 ? '' : 'rotate-180'} />
        {Math.abs(trend)}%
      </span>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-gray-400">{title}</p>
  </div>
);

// Mobile Stats Card Component
const MobileStatsCard = ({ title, value, icon, trend, color }: any) => (
  <div className="bg-white/5 rounded-xl p-3 border border-white/10 active:bg-white/10 transition-colors touch-manipulation">
    <div className="flex items-center justify-between mb-1">
      <div className={`p-1.5 rounded-lg ${color}`}>
        {icon}
      </div>
      <span className={`text-[10px] ${trend >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center gap-0.5`}>
        <TrendingUp size={10} className={trend >= 0 ? '' : 'rotate-180'} />
        {Math.abs(trend)}%
      </span>
    </div>
    <p className="text-lg font-bold text-white">{value}</p>
    <p className="text-[9px] text-gray-400 mt-0.5">{title}</p>
  </div>
);

// House Card Component (Desktop)
const HouseCard = ({ house, onEdit, onDelete, onSelect, onViewRating }: any) => (
  <div 
    className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-cyan-400/30 transition-all cursor-pointer group"
    onClick={() => onSelect(house)}
  >
    <div className="relative h-32 overflow-hidden">
      <img src={house.image} alt={house.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
        <span className="text-white font-bold text-sm">{house.name}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${house.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {house.status}
        </span>
      </div>
    </div>
    <div className="p-3">
      <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
        <Building size={12} />
        {house.address}
      </p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-cyan-400">{house.occupiedRooms}/{house.totalRooms} rooms</span>
        <div className="flex items-center gap-1">
          <Star size={12} className="text-yellow-400" />
          <span className="text-white">{house.rating}</span>
          <span className="text-gray-400">({house.totalReviews})</span>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/10">
        <button onClick={(e) => { e.stopPropagation(); onViewRating(house); }} className="text-yellow-400 hover:text-yellow-300 text-xs flex items-center gap-1">
          <Star size={12} /> Rating
        </button>
        <button onClick={(e) => { e.stopPropagation(); onEdit(house); }} className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1">
          <Edit size={12} /> Edit
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(house); }} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  </div>
);

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
          ) : null;
        })}
        {room.facilities.length > 3 && (
          <span className="bg-white/10 text-gray-400 px-1 py-0.5 rounded-full text-[6px]">
            +{room.facilities.length - 3}
          </span>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-1.5 pt-1.5 border-t border-white/10">
        <button onClick={() => onViewTenants(room)} className="text-blue-400 active:text-blue-300 text-[8px] flex items-center gap-0.5 px-2 py-1 min-h-[32px]">
          <Users size={10} /> {room.tenants.length}
        </button>
        <button onClick={() => onEdit(room)} className="text-cyan-400 active:text-cyan-300 text-[8px] flex items-center gap-0.5 px-2 py-1 min-h-[32px]">
          <Edit size={10} /> Edit
        </button>
        <button onClick={() => onDelete(room)} className="text-red-400 active:text-red-300 text-[8px] flex items-center gap-0.5 px-2 py-1 min-h-[32px]">
          <Trash2 size={10} /> Del
        </button>
      </div>
    </div>
  );
};

// Tenant Table Component (Desktop)
const TenantTable = ({ tenants, rooms, onDownload }: { tenants: Tenant[], rooms: Room[], onDownload?: (tenant: Tenant) => void }) => {
  const getRoomNumber = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.roomNumber : 'N/A';
  };

  const paymentColors = {
    paid: 'text-green-400 bg-green-500/20',
    pending: 'text-yellow-400 bg-yellow-500/20',
    overdue: 'text-red-400 bg-red-500/20'
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-cyan-900/30">
            <th className="px-3 py-2 text-left text-cyan-300 font-medium">Room</th>
            <th className="px-3 py-2 text-left text-cyan-300 font-medium">Tenant</th>
            <th className="px-3 py-2 text-left text-cyan-300 font-medium">Check In</th>
            <th className="px-3 py-2 text-left text-cyan-300 font-medium">Check Out</th>
            <th className="px-3 py-2 text-left text-cyan-300 font-medium">Rent</th>
            <th className="px-3 py-2 text-left text-cyan-300 font-medium">Status</th>
            <th className="px-3 py-2 text-left text-cyan-300 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <tr key={tenant.id} className="border-b border-white/10 hover:bg-white/5">
              <td className="px-3 py-2 text-white">{getRoomNumber(tenant.roomId)}</td>
              <td className="px-3 py-2 text-white">{tenant.name}</td>
              <td className="px-3 py-2 text-gray-300">{new Date(tenant.checkInDate).toLocaleDateString()}</td>
              <td className="px-3 py-2 text-gray-300">{new Date(tenant.checkOutDate).toLocaleDateString()}</td>
              <td className="px-3 py-2 text-white">Rs.{tenant.monthlyRent.toLocaleString()}</td>
              <td className="px-3 py-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${paymentColors[tenant.paymentStatus]}`}>
                  {tenant.paymentStatus}
                </span>
              </td>
              <td className="px-3 py-2">
                <button
                  onClick={() => onDownload && onDownload(tenant)}
                  className="text-cyan-400 hover:text-cyan-300 mr-2">
                  <Download size={12} />
                </button>
                <button className="text-blue-400 hover:text-blue-300">
                  <Eye size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Mobile Tenant List Component
const MobileTenantList = ({ tenants, rooms }: { tenants: Tenant[], rooms: Room[] }) => {
  const getRoomNumber = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.roomNumber : 'N/A';
  };

  const paymentColors = {
    paid: 'text-green-400 bg-green-500/20',
    pending: 'text-yellow-400 bg-yellow-500/20',
    overdue: 'text-red-400 bg-red-500/20'
  };

  return (
    <div className="space-y-2">
      {tenants.map((tenant) => (
        <div key={tenant.id} className="bg-white/5 rounded-lg p-2.5 border border-white/10">
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className="text-xs font-medium text-white">{tenant.name}</p>
              <p className="text-[8px] text-gray-400">Room {getRoomNumber(tenant.roomId)}</p>
            </div>
            <span className={`text-[7px] px-1.5 py-0.5 rounded-full ${paymentColors[tenant.paymentStatus]}`}>
              {tenant.paymentStatus}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-[8px] text-gray-400 mb-1.5">
            <Calendar size={8} />
            <span>{new Date(tenant.checkInDate).toLocaleDateString()} - {new Date(tenant.checkOutDate).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[9px] text-white">Rs.{tenant.monthlyRent.toLocaleString()}/mo</span>
            <div className="flex gap-2">
              {tenant.phone && (
                <a href={`tel:${tenant.phone}`} className="text-cyan-400 active:text-cyan-300 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center">
                  <Phone size={12} />
                </a>
              )}
              {tenant.email && (
                <a href={`mailto:${tenant.email}`} className="text-purple-400 active:text-purple-300 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center">
                  <Mail size={12} />
                </a>
              )}
              <button className="text-green-400 active:text-green-300 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center">
                <Download size={12} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Main Component
export default function OwnerDashboard() {
  const [houses, setHouses] = useState(mockHouses);
  const [rooms, setRooms] = useState(mockRooms);
  const [selectedHouse, setSelectedHouse] = useState<BoardingHouse | null>(null);
  const [showAddHouse, setShowAddHouse] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedRoomForTenants, setSelectedRoomForTenants] = useState<Room | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'houses' | 'rooms' | 'tenants' | 'payments' | 'notices'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHouse, setFilterHouse] = useState('all');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  // notices state
  const [notices, setNotices] = useState<{id:string; type:string; message:string; date:string; recipients:string;}[]>([]);
  const [housePhotos, setHousePhotos] = useState<string[]>([]);
  const [roomPhotos, setRoomPhotos] = useState<string[]>([]);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeType, setNoticeType] = useState('general');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeRecipients, setNoticeRecipients] = useState('all');
  const [selectedRoomHouse, setSelectedRoomHouse] = useState<string>('');
  const [newRoomNumber, setNewRoomNumber] = useState<string>('');
  const [newRoomFloor, setNewRoomFloor] = useState<number>(1);
  const [newRoomBeds, setNewRoomBeds] = useState<number>(1);
  const [newRoomPrice, setNewRoomPrice] = useState<number>(0);
  const [newRoomFacilities, setNewRoomFacilities] = useState<string[]>([]);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [houseName, setHouseName] = useState<string>('');
  const [houseAddress, setHouseAddress] = useState<string>('');
  const [editingHouse, setEditingHouse] = useState<BoardingHouse | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedHouseForRating, setSelectedHouseForRating] = useState<BoardingHouse | null>(null);
  const [houseErrors, setHouseErrors] = useState<{[key: string]: string}>({});
  const [roomErrors, setRoomErrors] = useState<{[key: string]: string}>({});
  const houseUploadRef = React.useRef<HTMLInputElement>(null);
  const roomUploadRef = React.useRef<HTMLInputElement>(null);
  
  const handleSendNotice = () => {
    if (!noticeMessage.trim()) {
      alert('Please enter a message');
      return;
    }
    
    const recipientText = noticeRecipients === 'all' ? 'All Tenants' : noticeRecipients === 'unpaid' ? 'Unpaid Tenants' : 'Paid Tenants';
    
    setNotices(prev => [{
      id: Date.now().toString(),
      type: noticeType,
      message: noticeMessage.trim(),
      date: new Date().toLocaleString(),
      recipients: recipientText
    }, ...prev]);
    
    alert('Notice sent successfully!');
    setShowNoticeForm(false);
    setNoticeMessage('');
    setNoticeType('general');
    setNoticeRecipients('all');
  };
  
  const handleHousePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setHousePhotos(prev => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
      alert(`${files.length} house photo(s) uploaded`);
    }
  };
  
  const handleRoomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setRoomPhotos(prev => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
      alert(`${files.length} room photo(s) uploaded`);
    }
  };
  
  const validateHouse = () => {
    const errors: {[key: string]: string} = {};
    
    if (!houseName.trim()) {
      errors.name = 'House name is required';
    } else if (houseName.trim().length < 3) {
      errors.name = 'House name must be at least 3 characters';
    }
    
    if (!houseAddress.trim()) {
      errors.address = 'Address is required';
    } else if (houseAddress.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters';
    }
    
    if (!editingHouse && housePhotos.length === 0) {
      errors.photos = 'At least one photo is required for new houses';
    }
    
    setHouseErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRoom = () => {
    const errors: {[key: string]: string} = {};
    
    if (!selectedRoomHouse) {
      errors.house = 'Please select a house';
    }
    
    if (!newRoomNumber.trim()) {
      errors.roomNumber = 'Room number is required';
    }
    
    if (newRoomFloor < 1) {
      errors.floor = 'Floor must be at least 1';
    }
    
    if (newRoomBeds < 1) {
      errors.beds = 'Number of beds must be at least 1';
    }
    
    if (newRoomPrice <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    if (!editingRoom && roomPhotos.length === 0) {
      errors.photos = 'At least one photo is required for new rooms';
    }
    
    setRoomErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSaveHouse = () => {
    if (!validateHouse()) {
      return;
    }
    
    if (editingHouse) {
      // Update existing house
      setHouses(prev => prev.map(h => 
        h.id === editingHouse.id
          ? {
              ...h,
              name: houseName,
              address: houseAddress,
              image: housePhotos.length > 0 ? housePhotos[0] : h.image
            }
          : h
      ));
      alert('House updated successfully!');
      setEditingHouse(null);
    } else {
      // Create new house
      const newHouse: BoardingHouse = {
        id: Date.now().toString(),
        name: houseName,
        address: houseAddress,
        image: housePhotos[0],
        status: 'active',
        totalRooms: 0,
        occupiedRooms: 0,
        rating: 5,
        totalReviews: 0
      };
      
      setHouses(prev => [...prev, newHouse]);
      alert('House saved successfully!');
    }
    
    setShowAddHouse(false);
    setHouseErrors({});
    
    // Clear form fields
    setHousePhotos([]);
    setHouseName('');
    setHouseAddress('');
  };
  
  const handleEditHouse = (house: BoardingHouse) => {
    setEditingHouse(house);
    setHouseName(house.name);
    setHouseAddress(house.address);
    setHousePhotos(house.image ? [house.image] : []);
    setShowAddHouse(true);
  };
  
  const handleDeleteHouse = (house: BoardingHouse) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${house.name}?`);
    if (confirmed) {
      setHouses(prev => prev.filter(h => h.id !== house.id));
      alert('House deleted successfully!');
      if (selectedHouse?.id === house.id) {
        setSelectedHouse(null);
      }
    }
  };

  const handleViewRating = (house: BoardingHouse) => {
    setSelectedHouseForRating(house);
    setShowRatingModal(true);
  };
  
  const handleSaveRoom = () => {
    if (!validateRoom()) {
      return;
    }
    
    if (editingRoom) {
      // Update existing room
      setRooms(prev => prev.map(r => 
        r.id === editingRoom.id 
          ? {
              ...r,
              houseId: selectedRoomHouse,
              roomNumber: newRoomNumber,
              floor: newRoomFloor,
              bedCount: newRoomBeds,
              price: newRoomPrice,
              facilities: newRoomFacilities,
              images: roomPhotos.length > 0 ? roomPhotos : r.images
            }
          : r
      ));
      alert('Room updated successfully!');
      setEditingRoom(null);
    } else {
      // Create new room
      const newRoom: Room = {
        id: Date.now().toString(),
        houseId: selectedRoomHouse,
        roomNumber: newRoomNumber,
        floor: newRoomFloor,
        bedCount: newRoomBeds,
        occupiedBeds: 0,
        price: newRoomPrice,
        facilities: newRoomFacilities,
        status: 'available',
        images: roomPhotos,
        tenants: []
      };
      
      setRooms(prev => [...prev, newRoom]);
      alert('Room saved successfully!');
    }
    
    setShowAddRoom(false);
    setRoomErrors({});
    
    // Clear form fields
    setRoomPhotos([]);
    setSelectedRoomHouse('');
    setNewRoomNumber('');
    setNewRoomFloor(1);
    setNewRoomBeds(1);
    setNewRoomPrice(0);
    setNewRoomFacilities([]);
  };
  
  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    setSelectedRoomHouse(room.houseId);
    setNewRoomNumber(room.roomNumber);
    setNewRoomFloor(room.floor);
    setNewRoomBeds(room.bedCount);
    setNewRoomPrice(room.price);
    setNewRoomFacilities(room.facilities);
    setRoomPhotos(room.images);
    setShowAddRoom(true);
  };
  
  const handleDeleteRoom = (room: Room) => {
    const confirmed = window.confirm(`Are you sure you want to delete Room ${room.roomNumber}?`);
    if (confirmed) {
      setRooms(prev => prev.filter(r => r.id !== room.id));
      alert('Room deleted successfully!');
    }
  };

  // --- download handlers ---
  const handleDownloadPaymentReport = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Payment Report</title></head><body><h1>Payment Report</h1><p>Total Revenue: Rs.${monthlyRevenue.toLocaleString()}</p><p>Pending Payments: ${pendingPayments}</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-report.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleDownloadReceipts = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>All Receipts</title></head><body><h1>All Receipts</h1>${allTenants.map(t=>`<div><h2>${t.name}</h2><p>Room: ${rooms.find(r=>r.id===t.roomId)?.roomNumber}</p></div>`).join('')}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleDownloadTenantReceipt = (tenant: Tenant) => {
    const roomNumber = rooms.find(r=>r.id===tenant.roomId)?.roomNumber || '';
    const amount = tenant.monthlyRent;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt-${tenant.name}</title></head><body><h1>Receipt for ${tenant.name}</h1><p>Room: ${roomNumber}</p><p>Amount: Rs.${amount.toLocaleString()}</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${tenant.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleDownloadTenantOverview = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tenant Overview</title></head><body><h1>Tenant Overview</h1>${allTenants.map(t=>`<div>${t.name} - Room ${rooms.find(r=>r.id===t.roomId)?.roomNumber}</div>`).join('')}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenant-overview.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redmi Note 13 specific (360-400px width)
  const isRedmiNote13 = windowWidth >= 360 && windowWidth <= 400;
  const isMobile = windowWidth < 768;

  // Stats calculations
  const totalHouses = houses.length;
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((acc, room) => acc + room.bedCount, 0);
  const occupiedBeds = rooms.reduce((acc, room) => acc + room.occupiedBeds, 0);
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100) || 0;
  const totalTenants = rooms.reduce((acc, room) => acc + room.tenants.length, 0);
  const monthlyRevenue = rooms.reduce((acc, room) => {
    return acc + room.tenants.reduce((sum, tenant) => sum + tenant.monthlyRent, 0);
  }, 0);
  const pendingPayments = rooms.reduce((acc, room) => {
    return acc + room.tenants.filter(t => t.paymentStatus !== 'paid').length;
  }, 0);

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
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                {notices.length === 0 ? (
                  <p className="text-gray-400 text-sm">No notices have been sent yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {notices.map(n => (
                      <li key={n.id} className="flex justify-between items-start p-3 bg-white/10 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] px-2 py-0.5 bg-cyan-500/30 text-cyan-300 rounded-full">{n.type}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full">{n.recipients}</span>
                            <span className="text-xs text-gray-400 ml-auto">{n.date}</span>
                          </div>
                          <p className="text-sm text-white">{n.message}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button onClick={() => {
                            const updated = window.prompt('Edit message', n.message);
                            if (updated != null) {
                              setNotices(prev => prev.map(x => x.id === n.id ? {...x, message: updated} : x));
                            }
                          }} className="text-yellow-300 hover:text-yellow-200 p-1">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => setNotices(prev => prev.filter(x => x.id !== n.id))} className="text-red-400 hover:text-red-300 p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Notice Form Modal - Desktop */}
          {showNoticeForm && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl max-w-md w-full p-6 border border-white/10 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-4">Create New Notice</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-cyan-300 block mb-1">Notice Type</label>
                    <select 
                      value={noticeType}
                      onChange={(e) => setNoticeType(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                      <option value="general">General Announcement</option>
                      <option value="maintenance">Maintenance Notice</option>
                      <option value="payment">Payment Reminder</option>
                      <option value="policy">Policy Update</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-cyan-300 block mb-1">Send To</label>
                    <select 
                      value={noticeRecipients}
                      onChange={(e) => setNoticeRecipients(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                      <option value="all">All Tenants</option>
                      <option value="unpaid">Unpaid Tenants</option>
                      <option value="paid">Paid Tenants</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-cyan-300 block mb-1">Message</label>
                    <textarea 
                      value={noticeMessage}
                      onChange={(e) => setNoticeMessage(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm min-h-[120px] resize-none"
                      placeholder="Write your notice message here..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={handleSendNotice}
                      className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg">
                      Send Notice
                    </button>
                    <button 
                      onClick={() => {
                        setShowNoticeForm(false);
                        setNoticeMessage('');
                        setNoticeType('general');
                        setNoticeRecipients('all');
                      }}
                      className="px-4 py-2 bg-white/5 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Tenant Overview</h2>
                <div className="flex gap-2">
                  <button onClick={handleDownloadTenantOverview} className="py-1 px-3 bg-cyan-500 hover:bg-cyan-600 text-white text-xs rounded-md">
                    Download
                  </button>
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                {notices.length > 0 && (
                  <div className="mb-4 p-3 bg-cyan-900/20 rounded">
                    <h4 className="text-xs font-semibold text-cyan-300">Recent Notices</h4>
                    <ul className="text-[10px] text-cyan-100 list-disc list-inside mt-1">
                      {notices.map(n => (
                        <li key={n.id}>{n.date}: {n.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <TenantTable tenants={allTenants} rooms={rooms} onDownload={handleDownloadTenantReceipt} />
              </div>
            </div>
          )}

          {/* Payments Tab - Desktop */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Payments & Receipts</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 col-span-2">
                  <h3 className="text-sm font-medium text-cyan-300 mb-3">Recent Payments</h3>
                  <div className="space-y-2">
                    {allTenants.filter(t => t.paymentStatus === 'paid').slice(0, 5).map(tenant => (
                      <div key={tenant.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-xs text-white">{tenant.name}</p>
                          <p className="text-[10px] text-gray-400">Room {rooms.find(r => r.id === tenant.roomId)?.roomNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white">Rs.{tenant.monthlyRent.toLocaleString()}</p>
                          <p className="text-[10px] text-green-400">Paid</p>
                        </div>
                        <button onClick={() => handleDownloadTenantReceipt(tenant)} className="p-1 hover:bg-white/10 rounded">
                          <Download size={14} className="text-cyan-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-cyan-300 mb-3">Summary</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-400">Total Collected</p>
                      <p className="text-lg font-bold text-white">Rs.{monthlyRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Pending</p>
                      <p className="text-sm text-yellow-400">Rs.{(pendingPayments * 15000).toLocaleString()}</p>
                    </div>
                    <div className="pt-2 border-t border-white/10">
                      <button onClick={handleDownloadReceipts} className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all">
                        Download All Receipts
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add House Modal - Desktop */}
          {showAddHouse && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl max-w-md w-full p-6 border border-white/10 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-4">{editingHouse ? `Edit ${editingHouse.name}` : 'Add New Boarding House'}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-cyan-300 block mb-1">House Name</label>
                    <input 
                      type="text"
                      value={houseName}
                      onChange={(e) => setHouseName(e.target.value)}
                      className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm ${houseErrors.name ? 'border-red-500' : 'border-white/10'}`}
                      placeholder="Sunrise Boarding" 
                    />
                    {houseErrors.name && <p className="text-red-400 text-xs mt-1">{houseErrors.name}</p>}
                  </div>
                  
                  <div>
                    <label className="text-xs text-cyan-300 block mb-1">Address</label>
                    <input 
                      type="text"
                      value={houseAddress}
                      onChange={(e) => setHouseAddress(e.target.value)}
                      className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm ${houseErrors.address ? 'border-red-500' : 'border-white/10'}`}
                      placeholder="123 Main St, Malabe" 
                    />
                    {houseErrors.address && <p className="text-red-400 text-xs mt-1">{houseErrors.address}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-cyan-300 block mb-1">Upload Photos</label>
                    <div onClick={() => houseUploadRef.current?.click()} className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-cyan-400/30 transition-all cursor-pointer bg-white/5 ${houseErrors.photos ? 'border-red-500' : 'border-white/10'}`}>
                      <Camera className="mx-auto text-gray-400 mb-2" size={24} />
                      <p className="text-xs text-gray-400">Click to upload or drag and drop</p>
                      <p className="text-[10px] text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                      {housePhotos.length > 0 && <p className="text-[9px] text-cyan-300 mt-2">{housePhotos.length} photo(s) uploaded</p>}
                    </div>
                    {houseErrors.photos && <p className="text-red-400 text-xs mt-1">{houseErrors.photos}</p>}
                    <input
                      ref={houseUploadRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleHousePhotoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveHouse} className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg">
                      Save House
                    </button>
                    <button 
                      onClick={() => setShowAddHouse(false)}
                      className="px-4 py-2 bg-white/5 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Room Modal - Desktop */}
          {showAddRoom && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl max-w-md w-full p-6 border border-white/10 max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-4">{editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add New Room'}</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-cyan-300 block mb-1">Select House</label>
                    <select 
                      value={selectedRoomHouse}
                      onChange={(e) => setSelectedRoomHouse(e.target.value)}
                      className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm ${roomErrors.house ? 'border-red-500' : 'border-white/10'}`}>
                      <option value="">Choose a house</option>
                      {houses.map(house => (
                        <option key={house.id} value={house.id}>{house.name}</option>
                      ))}
                    </select>
                    {roomErrors.house && <p className="text-red-400 text-xs mt-1">{roomErrors.house}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-cyan-300 block mb-1">Room Number</label>
                      <input 
                        type="text"
                        value={newRoomNumber}
                        onChange={(e) => setNewRoomNumber(e.target.value)}
                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm ${roomErrors.roomNumber ? 'border-red-500' : 'border-white/10'}`}
                        placeholder="101" 
                      />
                      {roomErrors.roomNumber && <p className="text-red-400 text-xs mt-1">{roomErrors.roomNumber}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-cyan-300 block mb-1">Floor</label>
                      <input 
                        type="number"
                        value={newRoomFloor}
                        onChange={(e) => setNewRoomFloor(parseInt(e.target.value) || 1)}
                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm ${roomErrors.floor ? 'border-red-500' : 'border-white/10'}`}
                        placeholder="1" 
                      />
                      {roomErrors.floor && <p className="text-red-400 text-xs mt-1">{roomErrors.floor}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-cyan-300 block mb-1">Number of Beds</label>
                      <input 
                        type="number"
                        value={newRoomBeds}
                        onChange={(e) => setNewRoomBeds(parseInt(e.target.value) || 1)}
                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm ${roomErrors.beds ? 'border-red-500' : 'border-white/10'}`}
                        placeholder="3" 
                      />
                      {roomErrors.beds && <p className="text-red-400 text-xs mt-1">{roomErrors.beds}</p>}
                    </div>
                    <div>
                      <label className="text-xs text-cyan-300 block mb-1">Price (Rs.)</label>
                      <input 
                        type="number"
                        value={newRoomPrice}
                        onChange={(e) => setNewRoomPrice(parseInt(e.target.value) || 0)}
                        className={`w-full px-3 py-2 bg-white/5 border rounded-lg text-white text-sm ${roomErrors.price ? 'border-red-500' : 'border-white/10'}`}
                        placeholder="15000" 
                      />
                      {roomErrors.price && <p className="text-red-400 text-xs mt-1">{roomErrors.price}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-cyan-300 block mb-2">Facilities</label>
                    <div className="grid grid-cols-2 gap-2">
                      {facilitiesList.map(facility => (
                        <label key={facility.id} className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={newRoomFacilities.includes(facility.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewRoomFacilities(prev => [...prev, facility.id]);
                              } else {
                                setNewRoomFacilities(prev => prev.filter(f => f !== facility.id));
                              }
                            }}
                            className="rounded border-white/10 bg-white/5" 
                          />
                          <span className="text-xs text-gray-300 flex items-center gap-1">
                            {facility.icon}
                            {facility.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-cyan-300 block mb-1">Upload Room Photos</label>
                    <div onClick={() => roomUploadRef.current?.click()} className={`border-2 border-dashed rounded-lg p-3 text-center hover:border-purple-400/30 transition-all cursor-pointer bg-white/5 ${roomErrors.photos ? 'border-red-500' : 'border-white/10'}`}>
                      <Upload className="mx-auto text-gray-400 mb-1" size={20} />
                      <p className="text-[10px] text-gray-400">Click to upload photos</p>
                      {roomPhotos.length > 0 && <p className="text-[9px] text-purple-300 mt-2">{roomPhotos.length} photo(s) uploaded</p>}
                    </div>
                    {roomErrors.photos && <p className="text-red-400 text-xs mt-1">{roomErrors.photos}</p>}
                    <input
                      ref={roomUploadRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleRoomPhotoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSaveRoom} className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg">
                      Save Room
                    </button>
                    <button 
                      onClick={() => setShowAddRoom(false)}
                      className="px-4 py-2 bg-white/5 text-white rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tenant Details Modal - Desktop */}
          {showTenantModal && selectedRoomForTenants && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl max-w-md w-full p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">
                  Room {selectedRoomForTenants.roomNumber} - Tenants
                </h3>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {selectedRoomForTenants.tenants.map(tenant => (
                    <div key={tenant.id} className="bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-medium text-white">{tenant.name}</p>
                          <p className="text-xs text-gray-400">Check in: {new Date(tenant.checkInDate).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          tenant.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                          tenant.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {tenant.paymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Rent: Rs.{tenant.monthlyRent.toLocaleString()}</span>
                        <button className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                          <Download size={12} />
                          Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowTenantModal(false)}
                  className="w-full mt-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Rating Details Modal */}
          {showRatingModal && selectedHouseForRating && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl max-w-sm w-full p-6 border border-white/10">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-white mb-2">{selectedHouseForRating.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Star size={24} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-3xl font-bold text-white">{selectedHouseForRating.rating}</span>
                    <span className="text-gray-400 text-sm">/5.0</span>
                  </div>
                  <p className="text-gray-400 text-sm">{selectedHouseForRating.totalReviews} reviews</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-12 flex justify-center">
                        <span className="text-yellow-400">5★</span>
                      </div>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{width: '60%'}}></div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">60%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-12 flex justify-center">
                        <span className="text-yellow-400">4★</span>
                      </div>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{width: '25%'}}></div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">25%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-12 flex justify-center">
                        <span className="text-yellow-400">3★</span>
                      </div>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{width: '10%'}}></div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">10%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-12 flex justify-center">
                        <span className="text-yellow-400">2★</span>
                      </div>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{width: '5%'}}></div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">5%</span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowRatingModal(false)}
                  className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg"
                >
                  Close
                </button>
              </div>
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
    );
  }

  // Mobile view (Redmi Note 13 optimized)
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
      {/* Header - Mobile Optimized */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building className="text-cyan-400" size={isRedmiNote13 ? 20 : 24} />
              <h1 className="text-base font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Owner Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 active:text-white touch-manipulation"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="mt-2 p-2 bg-white/10 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                  JD
                </div>
                <div>
                  <p className="text-xs text-white font-medium">John Doe</p>
                  <p className="text-[8px] text-gray-400">john.doe@boarding.com</p>
                </div>
              </div>
              <div className="space-y-1">
                <button className="w-full text-left px-2 py-2 text-xs text-gray-300 active:bg-white/10 rounded-lg min-h-[44px]">
                  Profile Settings
                </button>
                <button className="w-full text-left px-2 py-2 text-xs text-gray-300 active:bg-white/10 rounded-lg min-h-[44px]">
                  Notifications
                </button>
                <button className="w-full text-left px-2 py-2 text-xs text-red-400 active:bg-white/10 rounded-lg min-h-[44px]">
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tabs - Scrollable */}
          <div className="flex gap-1 mt-2 overflow-x-auto pb-1 scrollbar-hide touch-pan-x">
            {[
              { id: 'overview', label: 'Overview', icon: <BarChart size={12} /> },
              { id: 'houses', label: 'Houses', icon: <Building size={12} /> },
              { id: 'rooms', label: 'Rooms', icon: <Bed size={12} /> },
              { id: 'tenants', label: 'Tenants', icon: <Users size={12} /> },
              { id: 'payments', label: 'Payments', icon: <CreditCard size={12} /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-medium transition-all whitespace-nowrap min-h-[36px] touch-manipulation ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-400 active:text-white active:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 py-3 max-w-7xl mx-auto">
        {/* Search Bar - Mobile Optimized */}
        {(activeTab === 'tenants' || activeTab === 'rooms') && (
          <div className="mb-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:border-cyan-400/50 min-h-[44px]"
              />
            </div>
          </div>
        )}

        {/* Overview Tab - Mobile */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Grid - 2 columns for mobile */}
            <div className="grid grid-cols-2 gap-2">
              <MobileStatsCard 
                title="Houses" 
                value={totalHouses} 
                icon={<Building size={14} />} 
                trend={12}
                color="bg-cyan-500/20 text-cyan-400"
              />
              <MobileStatsCard 
                title="Rooms" 
                value={totalRooms} 
                icon={<Bed size={14} />} 
                trend={8}
                color="bg-purple-500/20 text-purple-400"
              />
              <MobileStatsCard 
                title="Tenants" 
                value={totalTenants} 
                icon={<Users size={14} />} 
                trend={15}
                color="bg-green-500/20 text-green-400"
              />
              <MobileStatsCard 
                title="Occupancy" 
                value={`${occupancyRate}%`} 
                icon={<TrendingUp size={14} />} 
                trend={5}
                color="bg-yellow-500/20 text-yellow-400"
              />
            </div>

            {/* Revenue Card */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <h3 className="text-xs font-medium text-cyan-300 mb-2 flex items-center gap-1">
                <DollarSign size={12} />
                Monthly Revenue
              </h3>
              <p className="text-xl font-bold text-white">Rs.{monthlyRevenue.toLocaleString()}</p>
              <p className="text-[9px] text-gray-400 mt-0.5">from {totalTenants} tenants</p>
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
              </div>
            </div>

            {/* Recent Tenants */}
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <h3 className="text-xs font-medium text-cyan-300 mb-2 flex items-center gap-1">
                <Users size={12} />
                Recent Tenants
              </h3>
              <MobileTenantList tenants={allTenants.slice(0, 3)} rooms={rooms} />
              {allTenants.length > 3 && (
                <button 
                  onClick={() => setActiveTab('tenants')}
                  className="w-full mt-2 py-2 text-[9px] text-cyan-400 active:text-cyan-300 border-t border-white/10 pt-2 min-h-[44px]"
                >
                  View All Tenants
                </button>
              )}
            </div>
          </div>
        )}

        {/* Houses Tab - Mobile */}
        {activeTab === 'houses' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-white">My Houses</h2>
              <button 
                onClick={() => setShowAddHouse(true)}
                className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-xs font-medium min-h-[44px] flex items-center gap-1 touch-manipulation"
              >
                <Plus size={14} />
                Add
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {houses.map(house => (
                <MobileHouseCard 
                  key={house.id}
                  house={house}
                  onSelect={setSelectedHouse}
                  onEdit={handleEditHouse}
                  onDelete={handleDeleteHouse}
                  onViewRating={handleViewRating}
                />
              ))}
            </div>
          </div>
        )}

        {/* Rooms Tab - Mobile */}
        {activeTab === 'rooms' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-white">Rooms</h2>
              <div className="flex gap-1">
                <select 
                  value={filterHouse}
                  onChange={(e) => setFilterHouse(e.target.value)}
                  className="px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] text-white min-h-[44px]"
                >
                  <option value="all">All Houses</option>
                  {houses.map(house => (
                    <option key={house.id} value={house.id}>{house.name}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setShowAddRoom(true)}
                  className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-xs font-medium min-h-[44px] flex items-center gap-1 touch-manipulation"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {filteredRooms
                .filter(room => 
                  room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  room.tenants.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map(room => (
                  <MobileRoomCard 
                    key={room.id}
                    room={room}
                    onEdit={handleEditRoom}
                    onDelete={handleDeleteRoom}
                    onViewTenants={handleViewTenants}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Tenants Tab - Mobile */}
        {activeTab === 'tenants' && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white">All Tenants</h2>
            <MobileTenantList tenants={filteredTenants} rooms={rooms} />
          </div>
        )}

        {/* Payments Tab - Mobile */}
        {activeTab === 'payments' && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white">Payments</h2>
            
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <h3 className="text-xs font-medium text-cyan-300 mb-2">Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400">Total Collected</span>
                  <span className="text-sm font-bold text-white">Rs.{monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-400">Pending</span>
                  <span className="text-xs text-yellow-400">Rs.{(pendingPayments * 15000).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <h3 className="text-xs font-medium text-cyan-300 mb-2">Recent Payments</h3>
              <div className="space-y-2">
                {allTenants.filter(t => t.paymentStatus === 'paid').slice(0, 5).map(tenant => {
                  const room = rooms.find(r => r.id === tenant.roomId);
                  return (
                    <div key={tenant.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                      <div>
                        <p className="text-[9px] text-white">{tenant.name}</p>
                        <p className="text-[7px] text-gray-400">Room {room?.roomNumber}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-white">Rs.{tenant.monthlyRent.toLocaleString()}</span>
                        <button onClick={() => handleDownloadTenantReceipt(tenant)} className="p-1.5 active:bg-white/10 rounded min-h-[32px] min-w-[32px] flex items-center justify-center">
                          <Download size={10} className="text-cyan-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={handleDownloadReceipts} className="w-full mt-2 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-[9px] font-medium min-h-[44px]">
                Download All Receipts
              </button>
            </div>
          </div>
        )}

        {/* Add House Modal - Mobile Optimized */}
        {showAddHouse && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end md:items-center">
            <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-t-xl md:rounded-xl w-full max-w-md mx-auto p-4 border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white">{editingHouse ? `Edit ${editingHouse.name}` : 'Add New House'}</h3>
                <button 
                  onClick={() => setShowAddHouse(false)}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 active:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] text-cyan-300 block mb-1">House Name</label>
                  <input 
                    type="text"
                    value={houseName}
                    onChange={(e) => setHouseName(e.target.value)}
                    className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white text-xs min-h-[44px] ${houseErrors.name ? 'border-red-500' : 'border-white/10'}`}
                    placeholder="Sunrise Boarding" 
                  />
                  {houseErrors.name && <p className="text-red-400 text-[8px] mt-1">{houseErrors.name}</p>}
                </div>
                
                <div>
                  <label className="text-[9px] text-cyan-300 block mb-1">Address</label>
                  <input 
                    type="text"
                    value={houseAddress}
                    onChange={(e) => setHouseAddress(e.target.value)}
                    className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white text-xs min-h-[44px] ${houseErrors.address ? 'border-red-500' : 'border-white/10'}`}
                    placeholder="123 Main St, Malabe" 
                  />
                  {houseErrors.address && <p className="text-red-400 text-[8px] mt-1">{houseErrors.address}</p>}
                </div>

                <div>
                  <label className="text-[9px] text-cyan-300 block mb-1">Photos</label>
                  <div 
                    onClick={() => houseUploadRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-3 text-center active:border-cyan-400/30 transition-colors min-h-[80px] flex flex-col items-center justify-center ${houseErrors.photos ? 'border-red-500' : 'border-white/10'}`}>
                    <Camera className="text-gray-400 mb-1" size={20} />
                    <p className="text-[8px] text-gray-400">Tap to upload</p>
                    {housePhotos.length > 0 && <p className="text-[8px] text-cyan-300 mt-1">{housePhotos.length} photo(s)</p>}
                  </div>
                  {houseErrors.photos && <p className="text-red-400 text-[8px] mt-1">{houseErrors.photos}</p>}
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={handleSaveHouse} className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-xs font-medium min-h-[44px]">
                    Save
                  </button>
                  <button 
                    onClick={() => setShowAddHouse(false)}
                    className="px-4 py-2.5 bg-white/5 text-white rounded-lg text-xs font-medium min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Room Modal - Mobile Optimized */}
        {showAddRoom && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end md:items-center">
            <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-t-xl md:rounded-xl w-full max-w-md mx-auto p-4 border border-white/10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white">{editingRoom ? `Edit Room ${editingRoom.roomNumber}` : 'Add New Room'}</h3>
                <button 
                  onClick={() => setShowAddRoom(false)}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 active:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] text-cyan-300 block mb-1">House</label>
                  <select 
                    value={selectedRoomHouse}
                    onChange={(e) => setSelectedRoomHouse(e.target.value)}
                    className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white text-xs min-h-[44px] ${roomErrors.house ? 'border-red-500' : 'border-white/10'}`}>
                    <option value="">Choose a house</option>
                    {houses.map(house => (
                      <option key={house.id} value={house.id}>{house.name}</option>
                    ))}
                  </select>
                  {roomErrors.house && <p className="text-red-400 text-[8px] mt-1">{roomErrors.house}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-cyan-300 block mb-1">Room No.</label>
                    <input 
                      type="text"
                      value={newRoomNumber}
                      onChange={(e) => setNewRoomNumber(e.target.value)}
                      className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white text-xs min-h-[44px] ${roomErrors.roomNumber ? 'border-red-500' : 'border-white/10'}`}
                      placeholder="101" 
                    />
                    {roomErrors.roomNumber && <p className="text-red-400 text-[8px] mt-1">{roomErrors.roomNumber}</p>}
                  </div>
                  <div>
                    <label className="text-[9px] text-cyan-300 block mb-1">Floor</label>
                    <input 
                      type="number"
                      value={newRoomFloor}
                      onChange={(e) => setNewRoomFloor(parseInt(e.target.value) || 1)}
                      className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white text-xs min-h-[44px] ${roomErrors.floor ? 'border-red-500' : 'border-white/10'}`}
                      placeholder="1" 
                    />
                    {roomErrors.floor && <p className="text-red-400 text-[8px] mt-1\">{roomErrors.floor}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-cyan-300 block mb-1">Beds</label>
                    <input 
                      type="number"
                      value={newRoomBeds}
                      onChange={(e) => setNewRoomBeds(parseInt(e.target.value) || 1)}
                      className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white text-xs min-h-[44px] ${roomErrors.beds ? 'border-red-500' : 'border-white/10'}`}
                      placeholder="3" 
                    />
                    {roomErrors.beds && <p className="text-red-400 text-[8px] mt-1">{roomErrors.beds}</p>}
                  </div>
                  <div>
                    <label className="text-[9px] text-cyan-300 block mb-1">Price</label>
                    <input 
                      type="number"
                      value={newRoomPrice}
                      onChange={(e) => setNewRoomPrice(parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2.5 bg-white/5 border rounded-lg text-white text-xs min-h-[44px] ${roomErrors.price ? 'border-red-500' : 'border-white/10'}`}
                      placeholder="15000" 
                    />
                    {roomErrors.price && <p className="text-red-400 text-[8px] mt-1">{roomErrors.price}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-cyan-300 block mb-2">Facilities</label>
                  <div className="grid grid-cols-2 gap-2">
                    {facilitiesList.map(facility => (
                      <label key={facility.id} className="flex items-center gap-1 p-2 bg-white/5 rounded-lg active:bg-white/10 min-h-[44px]">
                        <input 
                          type="checkbox"
                          checked={newRoomFacilities.includes(facility.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRoomFacilities(prev => [...prev, facility.id]);
                            } else {
                              setNewRoomFacilities(prev => prev.filter(f => f !== facility.id));
                            }
                          }}
                          className="rounded border-white/10" 
                        />
                        <span className="text-[8px] text-gray-300 flex items-center gap-1">
                          {facility.icon}
                          {facility.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={handleSaveRoom} className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-xs font-medium min-h-[44px]">
                    Save Room
                  </button>
                  <button 
                    onClick={() => setShowAddRoom(false)}
                    className="px-4 py-2.5 bg-white/5 text-white rounded-lg text-xs font-medium min-h-[44px]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tenant Details Modal - Mobile Optimized */}
        {showTenantModal && selectedRoomForTenants && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-end md:items-center">
            <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-t-xl md:rounded-xl w-full max-w-md mx-auto p-4 border border-white/10 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-white">
                  Room {selectedRoomForTenants.roomNumber} Tenants
                </h3>
                <button 
                  onClick={() => setShowTenantModal(false)}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 active:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              
              <div className="space-y-2">
                {selectedRoomForTenants.tenants.map(tenant => (
                  <div key={tenant.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-xs font-medium text-white">{tenant.name}</p>
                        <p className="text-[8px] text-gray-400">Check in: {new Date(tenant.checkInDate).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[7px] px-2 py-1 rounded-full ${
                        tenant.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' :
                        tenant.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {tenant.paymentStatus}
                      </span>
                    </div>
                    
                    {tenant.phone && (
                      <div className="flex items-center gap-1 text-[8px] text-gray-400 mb-1">
                        <Phone size={8} />
                        <a href={`tel:${tenant.phone}`} className="text-cyan-400 active:text-cyan-300">{tenant.phone}</a>
                      </div>
                    )}
                    
                    {tenant.email && (
                      <div className="flex items-center gap-1 text-[8px] text-gray-400 mb-2">
                        <Mail size={8} />
                        <a href={`mailto:${tenant.email}`} className="text-purple-400 active:text-purple-300">{tenant.email}</a>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                      <span className="text-[9px] text-white">Rs.{tenant.monthlyRent.toLocaleString()}/mo</span>
                      <button className="text-cyan-400 active:text-cyan-300 flex items-center gap-1 px-3 py-1.5 min-h-[36px]">
                        <Download size={10} />
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
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