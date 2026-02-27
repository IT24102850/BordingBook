import React, { useState, useEffect } from 'react';
import { 
  Building, Home, Bed, Users, Star, Download, Edit, Trash2, 
  Plus, Image, Wifi, Coffee, Bath, Wind, Zap, Upload, 
  Calendar, CheckCircle, XCircle, AlertCircle, DollarSign,
  Camera, Eye, EyeOff, ChevronDown, ChevronUp, Settings,
  BarChart, CreditCard, Award, TrendingUp, Menu, X,
  Filter, Search, MoreVertical, Phone, Mail, MapPin
} from 'lucide-react';

// Types
interface BoardingHouse {
  id: string;
  name: string;
  address: string;
  totalRooms: number;
  occupiedRooms: number;
  rating: number;
  totalReviews: number;
  image: string;
  status: 'active' | 'inactive';
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
    totalRooms: 12,
    occupiedRooms: 8,
    rating: 4.5,
    totalReviews: 23,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'active'
  },
  {
    id: '2',
    name: 'Green Villa Boarding',
    address: '45 Kaduwela, Colombo',
    totalRooms: 8,
    occupiedRooms: 5,
    rating: 4.2,
    totalReviews: 15,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    status: 'active'
  }
];

const mockRooms: Room[] = [
  {
    id: '101',
    houseId: '1',
    roomNumber: '101',
    floor: 1,
    bedCount: 3,
    occupiedBeds: 2,
    price: 15000,
    facilities: ['wifi', 'ac', 'bathroom'],
    status: 'partial',
    images: [
      'https://images.unsplash.com/photo-1598928506911-5c200b0e2f4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    tenants: [
      { id: 't1', name: 'Alice Perera', roomId: '101', checkInDate: '2024-01-15', checkOutDate: '2024-12-15', paymentStatus: 'paid', monthlyRent: 15000, phone: '+94 77 123 4567', email: 'alice@email.com' },
      { id: 't2', name: 'Bob Silva', roomId: '101', checkInDate: '2024-02-01', checkOutDate: '2024-12-01', paymentStatus: 'paid', monthlyRent: 15000, phone: '+94 77 234 5678', email: 'bob@email.com' }
    ]
  },
  {
    id: '102',
    houseId: '1',
    roomNumber: '102',
    floor: 1,
    bedCount: 2,
    occupiedBeds: 2,
    price: 18000,
    facilities: ['wifi', 'ac', 'bathroom', 'meals'],
    status: 'full',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    tenants: [
      { id: 't3', name: 'Charlie Weerasinghe', roomId: '102', checkInDate: '2024-01-10', checkOutDate: '2024-12-10', paymentStatus: 'paid', monthlyRent: 18000, phone: '+94 77 345 6789', email: 'charlie@email.com' },
      { id: 't4', name: 'Diana Fernando', roomId: '102', checkInDate: '2024-01-10', checkOutDate: '2024-12-10', paymentStatus: 'pending', monthlyRent: 18000, phone: '+94 77 456 7890', email: 'diana@email.com' }
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
const HouseCard = ({ house, onEdit, onDelete, onSelect }: any) => (
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

// Mobile House Card Component
const MobileHouseCard = ({ house, onEdit, onDelete, onSelect }: any) => (
  <div 
    className="bg-white/5 rounded-xl overflow-hidden border border-white/10 active:border-cyan-400/30 transition-colors touch-manipulation"
    onClick={() => onSelect(house)}
  >
    <div className="relative h-28 overflow-hidden">
      <img src={house.image} alt={house.name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
        <span className="text-white font-bold text-xs truncate max-w-[60%]">{house.name}</span>
        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${house.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {house.status}
        </span>
      </div>
    </div>
    <div className="p-2">
      <p className="text-[9px] text-gray-400 mb-1 flex items-center gap-1 truncate">
        <MapPin size={8} />
        {house.address}
      </p>
      <div className="flex items-center justify-between text-[9px]">
        <span className="text-cyan-400">{house.occupiedRooms}/{house.totalRooms} rooms</span>
        <div className="flex items-center gap-1">
          <Star size={8} className="text-yellow-400" />
          <span className="text-white">{house.rating}</span>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-1.5 pt-1.5 border-t border-white/10">
        <button onClick={(e) => { e.stopPropagation(); onEdit(house); }} className="text-cyan-400 active:text-cyan-300 text-[8px] flex items-center gap-0.5 px-2 py-1 min-h-[32px]">
          <Edit size={10} /> Edit
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(house); }} className="text-red-400 active:text-red-300 text-[8px] flex items-center gap-0.5 px-2 py-1 min-h-[32px]">
          <Trash2 size={10} /> Delete
        </button>
      </div>
    </div>
  </div>
);

// Room Card Component (Desktop)
const RoomCard = ({ room, onEdit, onDelete, onViewTenants }: any) => {
  const statusColors = {
    available: 'text-green-400 bg-green-500/20',
    partial: 'text-yellow-400 bg-yellow-500/20',
    full: 'text-red-400 bg-red-500/20'
  };

  return (
    <div className="bg-white/5 rounded-lg p-3 border border-white/10 hover:border-purple-400/30 transition-all">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-white font-medium text-sm">Room {room.roomNumber}</h4>
          <p className="text-xs text-gray-400">Floor {room.floor}</p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColors[room.status as keyof typeof statusColors]}`}>
          {room.status === 'available' ? 'Available' : room.status === 'partial' ? 'Partial' : 'Full'}
        </span>
      </div>
      
      <div className="flex items-center gap-2 mb-2">
        <Bed size={12} className="text-cyan-400" />
        <span className="text-xs text-white">{room.occupiedBeds}/{room.bedCount} beds</span>
        <DollarSign size={12} className="text-green-400 ml-2" />
        <span className="text-xs text-white">Rs.{room.price.toLocaleString()}</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {room.facilities.map((fac: string) => {
          const facility = facilitiesList.find(f => f.id === fac);
          return facility ? (
            <span key={fac} className="bg-cyan-900/30 text-cyan-300 px-1.5 py-0.5 rounded-full text-[8px] flex items-center gap-1">
              {facility.icon}
              {facility.name}
            </span>
          ) : null;
        })}
      </div>

      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/10">
        <button onClick={() => onViewTenants(room)} className="text-blue-400 hover:text-blue-300 text-[10px] flex items-center gap-1">
          <Users size={10} /> Tenants ({room.tenants.length})
        </button>
        <button onClick={() => onEdit(room)} className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-1">
          <Edit size={10} /> Edit
        </button>
        <button onClick={() => onDelete(room)} className="text-red-400 hover:text-red-300 text-[10px] flex items-center gap-1">
          <Trash2 size={10} /> Delete
        </button>
      </div>
    </div>
  );
};

// Mobile Room Card Component
const MobileRoomCard = ({ room, onEdit, onDelete, onViewTenants }: any) => {
  const statusColors = {
    available: 'text-green-400 bg-green-500/20',
    partial: 'text-yellow-400 bg-yellow-500/20',
    full: 'text-red-400 bg-red-500/20'
  };

  return (
    <div className="bg-white/5 rounded-lg p-2.5 border border-white/10 active:border-purple-400/30 transition-colors touch-manipulation">
      <div className="flex justify-between items-start mb-1.5">
        <div>
          <h4 className="text-white font-medium text-xs">Room {room.roomNumber}</h4>
          <p className="text-[9px] text-gray-400">Floor {room.floor}</p>
        </div>
        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${statusColors[room.status as keyof typeof statusColors]}`}>
          {room.status === 'available' ? 'Available' : room.status === 'partial' ? 'Partial' : 'Full'}
        </span>
      </div>
      
      <div className="flex items-center gap-2 mb-1.5">
        <Bed size={10} className="text-cyan-400" />
        <span className="text-[9px] text-white">{room.occupiedBeds}/{room.bedCount} beds</span>
        <DollarSign size={10} className="text-green-400 ml-1" />
        <span className="text-[9px] text-white">Rs.{room.price.toLocaleString()}</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-1.5">
        {room.facilities.slice(0, 3).map((fac: string) => {
          const facility = facilitiesList.find(f => f.id === fac);
          return facility ? (
            <span key={fac} className="bg-cyan-900/30 text-cyan-300 px-1 py-0.5 rounded-full text-[6px] flex items-center gap-0.5">
              {facility.icon}
              {facility.name}
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
const TenantTable = ({ tenants, rooms }: { tenants: Tenant[], rooms: Room[] }) => {
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
                <button className="text-cyan-400 hover:text-cyan-300 mr-2">
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
  const [activeTab, setActiveTab] = useState<'overview' | 'houses' | 'rooms' | 'tenants' | 'payments'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHouse, setFilterHouse] = useState('all');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

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

  // Get all tenants
  const allTenants = rooms.flatMap(room => room.tenants);

  // Filter rooms by house
  const filteredRooms = filterHouse === 'all' 
    ? rooms 
    : rooms.filter(room => room.houseId === filterHouse);

  // Filter tenants by search
  const filteredTenants = allTenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rooms.find(r => r.id === tenant.roomId)?.roomNumber.includes(searchQuery)
  );

  const handleViewTenants = (room: Room) => {
    setSelectedRoomForTenants(room);
    setShowTenantModal(true);
  };

  // Desktop view (unchanged)
  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
        {/* Header - Desktop */}
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="text-cyan-400" size={28} />
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Owner Dashboard
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Welcome back,</span>
                <span className="text-sm text-white font-medium">John Doe</span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  JD
                </div>
              </div>
            </div>

            {/* Navigation Tabs - Desktop */}
            <div className="flex gap-1 mt-4 overflow-x-auto pb-1 scrollbar-hide">
              {[
                { id: 'overview', label: 'Overview', icon: <BarChart size={14} /> },
                { id: 'houses', label: 'Houses', icon: <Building size={14} /> },
                { id: 'rooms', label: 'Rooms', icon: <Bed size={14} /> },
                { id: 'tenants', label: 'Tenants', icon: <Users size={14} /> },
                { id: 'payments', label: 'Payments', icon: <CreditCard size={14} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Overview Tab - Desktop */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatsCard 
                  title="Total Houses" 
                  value={totalHouses} 
                  icon={<Building size={18} />} 
                  trend={12}
                  color="bg-cyan-500/20 text-cyan-400"
                />
                <StatsCard 
                  title="Total Rooms" 
                  value={totalRooms} 
                  icon={<Bed size={18} />} 
                  trend={8}
                  color="bg-purple-500/20 text-purple-400"
                />
                <StatsCard 
                  title="Total Tenants" 
                  value={totalTenants} 
                  icon={<Users size={18} />} 
                  trend={15}
                  color="bg-green-500/20 text-green-400"
                />
                <StatsCard 
                  title="Occupancy Rate" 
                  value={`${occupancyRate}%`} 
                  icon={<TrendingUp size={18} />} 
                  trend={5}
                  color="bg-yellow-500/20 text-yellow-400"
                />
              </div>

              {/* Revenue & Payments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2">
                    <DollarSign size={16} />
                    Monthly Revenue
                  </h3>
                  <p className="text-2xl font-bold text-white">Rs.{monthlyRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">from {totalTenants} tenants</p>
                  <div className="mt-3 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2">
                    <AlertCircle size={16} />
                    Payment Status
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">Pending Payments</span>
                    <span className="text-sm font-bold text-yellow-400">{pendingPayments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Overdue</span>
                    <span className="text-sm font-bold text-red-400">0</span>
                  </div>
                  <button className="w-full mt-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all">
                    Download Payment Report
                  </button>
                </div>
              </div>

              {/* Recent Tenants */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2">
                  <Users size={16} />
                  Recent Tenants
                </h3>
                <TenantTable tenants={allTenants.slice(0, 5)} rooms={rooms} />
              </div>

              {/* Top Rated Houses */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2">
                  <Award size={16} />
                  Top Rated Houses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {houses.sort((a, b) => b.rating - a.rating).slice(0, 2).map(house => (
                    <div key={house.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                      <img src={house.image} alt={house.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-sm font-bold text-white">{house.name}</h4>
                        <div className="flex items-center gap-2 text-xs">
                          <Star size={10} className="text-yellow-400" />
                          <span className="text-white">{house.rating}</span>
                          <span className="text-gray-400">({house.totalReviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Houses Tab - Desktop */}
          {activeTab === 'houses' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">My Boarding Houses</h2>
                <button 
                  onClick={() => setShowAddHouse(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add House
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {houses.map(house => (
                  <HouseCard 
                    key={house.id}
                    house={house}
                    onSelect={setSelectedHouse}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rooms Tab - Desktop */}
          {activeTab === 'rooms' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Rooms Management</h2>
                <div className="flex gap-2">
                  <select className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white">
                    <option>All Houses</option>
                    {houses.map(house => (
                      <option key={house.id}>{house.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => setShowAddRoom(true)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Room
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {rooms.map(room => (
                  <RoomCard 
                    key={room.id}
                    room={room}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onViewTenants={handleViewTenants}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tenants Tab - Desktop */}
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Tenant Overview</h2>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <TenantTable tenants={allTenants} rooms={rooms} />
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
                        <button className="p-1 hover:bg-white/10 rounded">
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
                      <button className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all">
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
              <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl max-w-md w-full p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Add New Boarding House</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-cyan-300 block mb-1">House Name</label>
                    <input type="text" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" placeholder="Sunrise Boarding" />
                  </div>
                  
                  <div>
                    <label className="text-xs text-cyan-300 block mb-1">Address</label>
                    <input type="text" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" placeholder="123 Main St, Malabe" />
                  </div>

                  <div>
                    <label className="text-xs text-cyan-300 block mb-1">Upload Photos</label>
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-4 text-center hover:border-cyan-400/30 transition-all cursor-pointer">
                      <Camera className="mx-auto text-gray-400 mb-2" size={24} />
                      <p className="text-xs text-gray-400">Click to upload or drag and drop</p>
                      <p className="text-[10px] text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium">
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
              <div className="bg-gradient-to-br from-[#181f36] to-[#0f172a] rounded-xl max-w-md w-full p-6 border border-white/10 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-white mb-4">Add New Room</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-cyan-300 block mb-1">Select House</label>
                    <select className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                      {houses.map(house => (
                        <option key={house.id}>{house.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-cyan-300 block mb-1">Room Number</label>
                      <input type="text" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" placeholder="101" />
                    </div>
                    <div>
                      <label className="text-xs text-cyan-300 block mb-1">Floor</label>
                      <input type="number" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" placeholder="1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-cyan-300 block mb-1">Number of Beds</label>
                      <input type="number" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" placeholder="3" />
                    </div>
                    <div>
                      <label className="text-xs text-cyan-300 block mb-1">Price (Rs.)</label>
                      <input type="number" className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm" placeholder="15000" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-cyan-300 block mb-2">Facilities</label>
                    <div className="grid grid-cols-2 gap-2">
                      {facilitiesList.map(facility => (
                        <label key={facility.id} className="flex items-center gap-2">
                          <input type="checkbox" className="rounded border-white/10 bg-white/5" />
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
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-3 text-center hover:border-purple-400/30 transition-all cursor-pointer">
                      <Upload className="mx-auto text-gray-400 mb-1" size={20} />
                      <p className="text-[10px] text-gray-400">Click to upload photos</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium">
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
        </div>
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
                  onEdit={() => {}}
                  onDelete={() => {}}
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
                    onEdit={() => {}}
                    onDelete={() => {}}
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
                        <button className="p-1.5 active:bg-white/10 rounded min-h-[32px] min-w-[32px] flex items-center justify-center">
                          <Download size={10} className="text-cyan-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="w-full mt-2 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-[9px] font-medium min-h-[44px]">
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
                <h3 className="text-sm font-bold text-white">Add New House</h3>
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
                  <input type="text" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs min-h-[44px]" placeholder="Sunrise Boarding" />
                </div>
                
                <div>
                  <label className="text-[9px] text-cyan-300 block mb-1">Address</label>
                  <input type="text" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs min-h-[44px]" placeholder="123 Main St, Malabe" />
                </div>

                <div>
                  <label className="text-[9px] text-cyan-300 block mb-1">Photos</label>
                  <div className="border-2 border-dashed border-white/10 rounded-lg p-3 text-center active:border-cyan-400/30 transition-colors min-h-[80px] flex flex-col items-center justify-center">
                    <Camera className="text-gray-400 mb-1" size={20} />
                    <p className="text-[8px] text-gray-400">Tap to upload</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-xs font-medium min-h-[44px]">
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
                <h3 className="text-sm font-bold text-white">Add New Room</h3>
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
                  <select className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs min-h-[44px]">
                    {houses.map(house => (
                      <option key={house.id}>{house.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-cyan-300 block mb-1">Room No.</label>
                    <input type="text" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs min-h-[44px]" placeholder="101" />
                  </div>
                  <div>
                    <label className="text-[9px] text-cyan-300 block mb-1">Floor</label>
                    <input type="number" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs min-h-[44px]" placeholder="1" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-cyan-300 block mb-1">Beds</label>
                    <input type="number" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs min-h-[44px]" placeholder="3" />
                  </div>
                  <div>
                    <label className="text-[9px] text-cyan-300 block mb-1">Price</label>
                    <input type="number" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs min-h-[44px]" placeholder="15000" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-cyan-300 block mb-2">Facilities</label>
                  <div className="grid grid-cols-2 gap-2">
                    {facilitiesList.map(facility => (
                      <label key={facility.id} className="flex items-center gap-1 p-2 bg-white/5 rounded-lg active:bg-white/10 min-h-[44px]">
                        <input type="checkbox" className="rounded border-white/10" />
                        <span className="text-[8px] text-gray-300 flex items-center gap-1">
                          {facility.icon}
                          {facility.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-xs font-medium min-h-[44px]">
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

      {/* Global Styles */}
      <style>{`
        /* Redmi Note 13 specific optimizations */
        @media (max-width: 400px) {
          .min-h-[44px] {
            min-height: 44px;
          }
          .text-xs {
            font-size: 11px;
          }
          .text-[9px] {
            font-size: 10px;
          }
          .text-[8px] {
            font-size: 9px;
          }
          .gap-1 {
            gap: 0.25rem;
          }
          .p-2 {
            padding: 0.5rem;
          }
        }
        
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Touch optimization */
        .touch-manipulation {
          touch-action: manipulation;
        }
        
        /* Active states for touch */
        .active\\:bg-white\\/10:active {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .active\\:border-cyan-400\\/30:active {
          border-color: rgba(34, 211, 238, 0.3);
        }
      `}</style>
    </div>
  );
}