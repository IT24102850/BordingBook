import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, Home, Bed, Users, Star, Download, Edit, Trash2, 
  Plus, Wifi, Coffee, Bath, Wind, Upload, 
  Calendar, AlertCircle, DollarSign,
  Camera, Eye, Settings,
  BarChart, CreditCard, Award, TrendingUp, Menu, X,
  Search, Phone, Mail, MapPin, Bell, FileText, ArrowRight
} from 'lucide-react';
import BookingManagementSystem from './booking/BookingManagementSystem';

// ============================================
// TYPES
// ============================================

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

interface Facility {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  color: string;
}

interface MobileStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  color: string;
}

interface HouseCardProps {
  house: BoardingHouse;
  onEdit: (house: BoardingHouse) => void;
  onDelete: (house: BoardingHouse) => void;
  onSelect: (house: BoardingHouse) => void;
}

interface MobileHouseCardProps {
  house: BoardingHouse;
  onEdit: (house: BoardingHouse) => void;
  onDelete: (house: BoardingHouse) => void;
  onSelect: (house: BoardingHouse) => void;
}

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onViewTenants: (room: Room) => void;
}

interface MobileRoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onViewTenants: (room: Room) => void;
}

interface TenantTableProps {
  tenants: Tenant[];
  rooms: Room[];
}

interface MobileTenantListProps {
  tenants: Tenant[];
  rooms: Room[];
}

interface SparklineProps {
  data: number[];
  color: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  color: string;
}

interface MobileStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: number;
  color: string;
}

interface HouseCardProps {
  house: BoardingHouse;
  onEdit: (house: BoardingHouse) => void;
  onDelete: (house: BoardingHouse) => void;
  onSelect: (house: BoardingHouse) => void;
}

interface MobileHouseCardProps {
  house: BoardingHouse;
  onEdit: (house: BoardingHouse) => void;
  onDelete: (house: BoardingHouse) => void;
  onSelect: (house: BoardingHouse) => void;
}

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onViewTenants: (room: Room) => void;
}

interface MobileRoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onDelete: (room: Room) => void;
  onViewTenants: (room: Room) => void;
}

interface TenantTableProps {
  tenants: Tenant[];
  rooms: Room[];
}

interface MobileTenantListProps {
  tenants: Tenant[];
  rooms: Room[];
}

// ============================================
// MOCK DATA
// ============================================

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

// ============================================
// HELPER FUNCTIONS
// ============================================

const getBookingStatus = (checkOutDate: string): { label: string; color: string } => {
  const today = new Date();
  const checkOut = new Date(checkOutDate);
  const daysLeft = Math.floor((checkOut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysLeft < 0) return { label: 'Expired', color: 'bg-red-500/20 text-red-400' };
  if (daysLeft <= 14) return { label: 'Ending Soon', color: 'bg-yellow-500/20 text-yellow-400' };
  return { label: 'Active', color: 'bg-green-500/20 text-green-400' };
};

// Sparkline component
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const width = 100;
  const height = 30;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width="100%" height="30" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ============================================
// COMPONENTS
// ============================================

// Stats Card Component (Desktop)
const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, color }) => (
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
const MobileStatsCard: React.FC<MobileStatsCardProps> = ({ title, value, icon, trend, color }) => (
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
const HouseCard: React.FC<HouseCardProps> = ({ house, onEdit, onDelete, onSelect }) => (
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
const MobileHouseCard: React.FC<MobileHouseCardProps> = ({ house, onEdit, onDelete, onSelect }) => (
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
const RoomCard: React.FC<RoomCardProps> = ({ room, onEdit, onDelete, onViewTenants }) => {
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
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[room.status]}`}>
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
        <button 
          onClick={() => onViewTenants(room)} 
          className="text-blue-400 hover:text-blue-300 text-[10px] flex items-center gap-1"
          title="View Tenants"
        >
          <Users size={10} /> Tenants ({room.tenants.length})
        </button>
        <button 
          onClick={() => onEdit(room)} 
          className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-1"
          title="Edit Room"
        >
          <Edit size={10} /> Edit
        </button>
        <button 
          onClick={() => onDelete(room)} 
          className="text-red-400 hover:text-red-300 text-[10px] flex items-center gap-1"
          title="Delete Room"
        >
          <Trash2 size={10} /> Delete
        </button>
      </div>
    </div>
  );
};

// Mobile Room Card Component
const MobileRoomCard: React.FC<MobileRoomCardProps> = ({ room, onEdit, onDelete, onViewTenants }) => {
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
        <span className={`text-[9px] px-2 py-1 rounded-full ${statusColors[room.status]}`}>
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
        <button 
          onClick={() => onViewTenants(room)} 
          className="text-blue-400 active:text-blue-300 text-[8px] flex items-center gap-0.5 px-2 py-1 min-h-[32px]"
          title="View Tenants"
        >
          <Users size={10} /> {room.tenants.length}
        </button>
        <button 
          onClick={() => onEdit(room)} 
          className="text-cyan-400 active:text-cyan-300 text-[8px] flex items-center gap-0.5 px-2 py-1 min-h-[32px]"
          title="Edit Room"
        >
          <Edit size={10} /> Edit
        </button>
        <button 
          onClick={() => onDelete(room)} 
          className="text-red-400 active:text-red-300 text-[8px] flex items-center gap-0.5 px-2 py-1 min-h-[32px]"
          title="Delete Room"
        >
          <Trash2 size={10} /> Del
        </button>
      </div>
    </div>
  );
};

// Tenant Table Component (Desktop)
const TenantTable: React.FC<TenantTableProps> = ({ tenants, rooms }) => {
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
    <div className="overflow-x-auto rounded-lg border border-white/10">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-cyan-900/30 border-b border-white/10">
            <th className="px-4 py-3 text-left text-cyan-300 font-semibold">Room</th>
            <th className="px-4 py-3 text-left text-cyan-300 font-semibold">Tenant Name</th>
            <th className="px-4 py-3 text-left text-cyan-300 font-semibold">Check In</th>
            <th className="px-4 py-3 text-left text-cyan-300 font-semibold">Check Out</th>
            <th className="px-4 py-3 text-left text-cyan-300 font-semibold">Monthly Rent</th>
            <th className="px-4 py-3 text-left text-cyan-300 font-semibold">Booking</th>
            <th className="px-4 py-3 text-left text-cyan-300 font-semibold">Payment</th>
            <th className="px-4 py-3 text-center text-cyan-300 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => {
            const bookingStatus = getBookingStatus(tenant.checkOutDate);
            return (
              <tr key={tenant.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                <td className="px-4 py-3 text-white font-medium">#{getRoomNumber(tenant.roomId)}</td>
                <td className="px-4 py-3 text-white">{tenant.name}</td>
                <td className="px-4 py-3 text-gray-300">{new Date(tenant.checkInDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-gray-300">{new Date(tenant.checkOutDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-white font-semibold">Rs.{tenant.monthlyRent.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${bookingStatus.color}`}>
                    {bookingStatus.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${paymentColors[tenant.paymentStatus]}`}>
                    {tenant.paymentStatus.charAt(0).toUpperCase() + tenant.paymentStatus.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button 
                      className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 p-1.5 rounded transition-colors"
                      title="View Tenant"
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/10 p-1.5 rounded transition-colors"
                      title="Download Receipt"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Mobile Tenant List Component
const MobileTenantList: React.FC<MobileTenantListProps> = ({ tenants, rooms }) => {
  const getRoomNumber = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? room.roomNumber : 'N/A';
  };

  const paymentColors = {
    paid: 'text-green-400 bg-green-500/20',
    pending: 'text-yellow-400 bg-yellow-500/20',
    overdue: 'text-red-400 bg-red-500/20'
  };

  const bookingStatus = getBookingStatus;

  return (
    <div className="space-y-2">
      {tenants.map((tenant) => {
        const status = bookingStatus(tenant.checkOutDate);
        return (
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
              <div className="flex items-center gap-2">
                <span className={`text-[7px] px-1.5 py-0.5 rounded-full ${status.color}`}>
                  {status.label}
                </span>
                <span className="text-[9px] text-white">Rs.{tenant.monthlyRent.toLocaleString()}/mo</span>
              </div>
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
        );
      })}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [houses, setHouses] = useState<BoardingHouse[]>(mockHouses);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [selectedHouse, setSelectedHouse] = useState<BoardingHouse | null>(null);
  const [showAddHouse, setShowAddHouse] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [selectedRoomForTenants, setSelectedRoomForTenants] = useState<Room | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'houses' | 'rooms' | 'tenants' | 'payments' | 'bookings' | 'notifications' | 'notices'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHouse, setFilterHouse] = useState('all');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
  const [uploadedRoomImages, setUploadedRoomImages] = useState<string[]>([]);
  const [uploadedHouseImages, setUploadedHouseImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const houseFileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state for new room
  const [newRoom, setNewRoom] = useState({
    houseId: '',
    roomNumber: '',
    floor: 1,
    bedCount: 1,
    price: 0,
    facilities: [] as string[]
  });
  
  // Form state for new house
  const [newHouse, setNewHouse] = useState({
    name: '',
    address: '',
    totalRooms: 0
  });

  // Notice states
  const [notices, setNotices] = useState<{id:string; type:string; message:string; date:string; recipients:string;}[]>([
    {
      id: '1',
      type: 'general',
      message: 'powercut from 8 - 5',
      date: '3/4/2026, 11:21:46 PM',
      recipients: 'All Tenants'
    }
  ]);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeType, setNoticeType] = useState('general');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeRecipients, setNoticeRecipients] = useState('all');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redmi Note 13 specific (360-400px width)
  const isRedmiNote13 = windowWidth >= 360 && windowWidth <= 400;
  const isMobile = windowWidth < 768;

  // ============================================
  // STATS CALCULATIONS
  // ============================================

  const totalHouses = houses.length;
  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((acc, room) => acc + room.bedCount, 0);
  const occupiedBeds = rooms.reduce((acc, room) => acc + room.occupiedBeds, 0);
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100) || 0;
  const vacantBeds = totalBeds - occupiedBeds;
  const vacantRoomsCount = rooms.filter(r => r.occupiedBeds < r.bedCount).length;
  const totalTenants = rooms.reduce((acc, room) => acc + room.tenants.length, 0);
  const monthlyRevenue = rooms.reduce((acc, room) => {
    return acc + room.tenants.reduce((sum, tenant) => sum + tenant.monthlyRent, 0);
  }, 0);
  
  // Payment calculations
  const pendingPayments = rooms.reduce((acc, room) => {
    return acc + room.tenants.filter(t => t.paymentStatus === 'pending').length;
  }, 0);
  
  const overdueCount = rooms.reduce((acc, room) => {
    return acc + room.tenants.filter(t => t.paymentStatus === 'overdue').length;
  }, 0);
  
  const pendingAmount = rooms.reduce((acc, room) => {
    return acc + room.tenants
      .filter(t => t.paymentStatus !== 'paid')
      .reduce((sum, tenant) => sum + tenant.monthlyRent, 0);
  }, 0);
  
  const overdueAmount = rooms.reduce((acc, room) => {
    return acc + room.tenants
      .filter(t => t.paymentStatus === 'overdue')
      .reduce((sum, tenant) => sum + tenant.monthlyRent, 0);
  }, 0);

  // Booking ending soon count
  const endingSoonCount = rooms.reduce((acc, room) => {
    return acc + room.tenants.filter(t => {
      const status = getBookingStatus(t.checkOutDate);
      return status.label === 'Ending Soon';
    }).length;
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

  // ============================================
  // HANDLERS
  // ============================================

  const handleViewTenants = (room: Room) => {
    setSelectedRoomForTenants(room);
    setShowTenantModal(true);
  };

  const handleEditHouse = (house: BoardingHouse) => {
    // Implement edit functionality
    console.log('Edit house:', house);
  };

  const handleDeleteHouse = (house: BoardingHouse) => {
    // Implement delete functionality
    console.log('Delete house:', house);
  };

  const handleEditRoom = (room: Room) => {
    // Implement edit functionality
    console.log('Edit room:', room);
  };

  const handleDeleteRoom = (room: Room) => {
    // Implement delete functionality
    console.log('Delete room:', room);
  };

  // Handle file upload for room photos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const imageUrls: string[] = [];
      
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          imageUrls.push(reader.result as string);
          if (imageUrls.length === fileArray.length) {
            setUploadedRoomImages(prev => [...prev, ...imageUrls]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle file upload for house photos
  const handleHouseFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const imageUrls: string[] = [];
      
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          imageUrls.push(reader.result as string);
          if (imageUrls.length === fileArray.length) {
            setUploadedHouseImages(prev => [...prev, ...imageUrls]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setUploadedRoomImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeHouseImage = (index: number) => {
    setUploadedHouseImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle send notice
  const handleSendNotice = () => {
    if (!noticeMessage.trim()) { 
      alert('Please enter a message'); 
      return; 
    }

    const recipientText =
      noticeRecipients === 'all' ? 'All Tenants'
      : noticeRecipients === 'unpaid' ? 'Unpaid Tenants'
      : 'Paid Tenants';

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

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleOpenHouseFileDialog = () => {
    houseFileInputRef.current?.click();
  };

  // Handle facility toggle
  const handleFacilityToggle = (facilityId: string) => {
    setNewRoom(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facilityId)
        ? prev.facilities.filter(f => f !== facilityId)
        : [...prev.facilities, facilityId]
    }));
  };

  // Handle save room
  const handleSaveRoom = () => {
    if (!newRoom.roomNumber || !newRoom.houseId) {
      alert('Please fill in all required fields');
      return;
    }

    const newRoomData: Room = {
      id: `${Date.now()}`,
      houseId: newRoom.houseId || houses[0]?.id || '1',
      roomNumber: newRoom.roomNumber,
      floor: newRoom.floor,
      bedCount: newRoom.bedCount,
      occupiedBeds: 0,
      price: newRoom.price,
      facilities: newRoom.facilities,
      status: 'available',
      images: uploadedRoomImages.length > 0 ? uploadedRoomImages : [
        'https://images.unsplash.com/photo-1598928506911-5c200b0e2f4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      tenants: []
    };

    setRooms(prev => [...prev, newRoomData]);
    setShowAddRoom(false);
    
    // Reset form
    setNewRoom({
      houseId: '',
      roomNumber: '',
      floor: 1,
      bedCount: 1,
      price: 0,
      facilities: []
    });
    setUploadedRoomImages([]);
    
    alert(`Room ${newRoom.roomNumber} added successfully!`);
  };

  // Handle save house
  const handleSaveHouse = () => {
    if (!newHouse.name || !newHouse.address) {
      alert('Please fill in House Name and Address');
      return;
    }

    const newHouseData: BoardingHouse = {
      id: `${Date.now()}`,
      name: newHouse.name,
      address: newHouse.address,
      totalRooms: newHouse.totalRooms || 0,
      occupiedRooms: 0,
      rating: 0,
      totalReviews: 0,
      image: uploadedHouseImages.length > 0 ? uploadedHouseImages[0] : 
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      status: 'active'
    };

    setHouses(prev => [...prev, newHouseData]);
    setShowAddHouse(false);
    
    // Reset form
    setNewHouse({
      name: '',
      address: '',
      totalRooms: 0
    });
    setUploadedHouseImages([]);
    
    alert(`Boarding House "${newHouse.name}" added successfully!`);
  };

  // ============================================
  // DESKTOP VIEW
  // ============================================

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
        {/* Header - Desktop */}
        <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                  <Building className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    Owner Dashboard
                  </h1>
                  <p className="text-xs text-gray-400">Manage your boarding houses</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 text-white shadow-md hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  onClick={() => navigate('/payment-rental')}
                >
                  Manage Payments
                </button>
                <button className="p-2 hover:bg-white/5 rounded-lg transition-colors relative">
                  <Bell className="text-gray-400 hover:text-white transition-colors" size={20} />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                  <div className="text-right">
                    <p className="text-sm text-white font-medium">John Doe</p>
                    <p className="text-xs text-gray-400">Owner</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">
                    JD
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs - Desktop */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 pt-1 px-1 scrollbar-hide">
              {[
                { id: 'overview', label: 'Dashboard', icon: <BarChart size={16} /> },
                { id: 'houses', label: 'Houses', icon: <Building size={16} /> },
                { id: 'rooms', label: 'Rooms', icon: <Bed size={16} /> },
                { id: 'tenants', label: 'Tenants', icon: <Users size={16} /> },
                { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
                { id: 'bookings', label: 'Bookings', icon: <FileText size={16} /> },
                { id: 'notices', label: 'Notices', icon: <Mail size={16} /> },
                { id: 'notifications', label: 'Alerts', icon: <Bell size={16} />, badge: unreadNotifications }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-1.5 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Dashboard Tab - Desktop */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                <button 
                  onClick={() => setShowAddHouse(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> Add Boarding House
                </button>
                <button 
                  onClick={() => setShowAddRoom(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> Add Room
                </button>
                <button 
                  onClick={() => setActiveTab('bookings')}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <FileText size={16} /> View Bookings
                </button>
                <button 
                  onClick={() => setShowNoticeForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Mail size={16} /> Send Notice
                </button>
              </div>

              {/* Alerts Section */}
              {(overdueCount > 0 || vacantBeds > 0 || endingSoonCount > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {overdueCount > 0 && (
                    <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/30">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <AlertCircle size={18} className="text-red-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">Overdue Payments</h4>
                          <p className="text-xs text-gray-400">{overdueCount} tenants • Rs.{overdueAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('payments')}
                        className="w-full mt-2 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  )}

                  {vacantBeds > 0 && (
                    <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/30">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <Bed size={18} className="text-green-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">Vacant Beds</h4>
                          <p className="text-xs text-gray-400">{vacantBeds} beds available • {vacantRoomsCount} rooms</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('rooms')}
                        className="w-full mt-2 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/30 transition-colors"
                      >
                        View Rooms
                      </button>
                    </div>
                  )}

                  {endingSoonCount > 0 && (
                    <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-500/30">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                          <Calendar size={18} className="text-yellow-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white">Leases Ending Soon</h4>
                          <p className="text-xs text-gray-400">{endingSoonCount} tenants • Next 14 days</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('tenants')}
                        className="w-full mt-2 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium hover:bg-yellow-500/30 transition-colors"
                      >
                        View Tenants
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard 
                  title="Boarding Houses" 
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
                <StatsCard 
                  title="Vacant Beds" 
                  value={vacantBeds} 
                  icon={<Bed size={18} />} 
                  trend={-3}
                  color="bg-indigo-500/20 text-indigo-400"
                />
                <StatsCard 
                  title="Pending Amount" 
                  value={`Rs.${(pendingAmount / 1000).toFixed(0)}K`} 
                  icon={<AlertCircle size={18} />} 
                  trend={-2}
                  color="bg-orange-500/20 text-orange-400"
                />
                <StatsCard 
                  title="Vacant Rooms" 
                  value={vacantRoomsCount} 
                  icon={<Home size={18} />} 
                  trend={-3}
                  color="bg-red-500/20 text-red-400"
                />
                <StatsCard 
                  title="Pending Rent" 
                  value={`Rs.${(pendingAmount / 1000).toFixed(0)}K`} 
                  icon={<DollarSign size={18} />} 
                  trend={-2}
                  color="bg-orange-500/20 text-orange-400"
                />
              </div>

              {/* Revenue & Payments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Month Revenue */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2">
                    <DollarSign size={16} />
                    Current Month Revenue
                  </h3>
                  <p className="text-3xl font-bold text-white">Rs.{monthlyRevenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-2">From {totalTenants} paying tenants</p>
                  
                  {/* Sparkline */}
                  <div className="mt-4 mb-2">
                    <Sparkline data={[45, 52, 48, 60, 66, 58, 72]} color="#22d3ee" />
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Collections Progress</span>
                      <span className="text-cyan-400 font-semibold">85%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="text-[10px] px-2 py-1 bg-green-500/20 text-green-400 rounded">↑ 12% vs last month</span>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2">
                    <CreditCard size={16} />
                    Payment Status
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                        <span className="text-xs text-gray-300 block">Pending</span>
                        <span className="text-lg font-bold text-yellow-400">{pendingPayments}</span>
                      </div>
                      <div className="p-2.5 bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                        <span className="text-xs text-gray-300 block">Amount</span>
                        <span className="text-sm font-bold text-yellow-400">Rs.{pendingAmount.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 bg-red-900/20 rounded-lg border border-red-500/20">
                        <span className="text-xs text-gray-300 block">Overdue</span>
                        <span className="text-lg font-bold text-red-400">{overdueCount}</span>
                      </div>
                      <div className="p-2.5 bg-red-900/20 rounded-lg border border-red-500/20">
                        <span className="text-xs text-gray-300 block">Amount</span>
                        <span className="text-sm font-bold text-red-400">Rs.{overdueAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <button className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-[11px] font-medium hover:shadow-lg transition-all">
                      Download Payment Report
                    </button>
                  </div>
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

              {/* Top Rated Boarding Houses */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2">
                  <Award size={16} />
                  Top Rated Boarding Houses
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
                    onEdit={handleEditHouse}
                    onDelete={handleDeleteHouse}
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
                  <select 
                    value={filterHouse}
                    onChange={(e) => setFilterHouse(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white"
                  >
                    <option value="all">All Houses</option>
                    {houses.map(house => (
                      <option key={house.id} value={house.id}>{house.name}</option>
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
                {filteredRooms.map(room => (
                  <RoomCard 
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
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Payments & Receipts</h2>
                <button
                  onClick={() => navigate('/payment-rental')}
                  className="px-6 py-2 rounded-xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 text-white shadow-md hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  View Rental Payments
                </button>
              </div>
              
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
                      <p className="text-sm text-yellow-400">Rs.{pendingAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Overdue</p>
                      <p className="text-sm text-red-400">Rs.{overdueAmount.toLocaleString()}</p>
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

          {/* Bookings Tab - Desktop */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Booking Requests Management</h2>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <FileText size={14} />
                  <span>Manage student booking requests</span>
                </div>
              </div>
              <BookingManagementSystem />
            </div>
          )}

          {/* Notices Tab - Desktop */}
          {activeTab === 'notices' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-white">Notices</h2>
                <button
                  onClick={() => setShowNoticeForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={16} />
                  New Notice
                </button>
              </div>
              <span className="text-xs text-gray-400">Sent: {notices.length}</span>
              
              {notices.length === 0 ? (
                <div className="bg-white/5 rounded-xl p-8 border border-white/10 text-center">
                  <Mail size={40} className="mx-auto text-gray-500 mb-3" />
                  <p className="text-gray-400">No notices have been sent yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notices.map(notice => (
                    <div key={notice.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-cyan-400/30 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="text-sm text-gray-300 mb-1">{notice.date}</p>
                          <p className="text-white font-medium text-base">{notice.message}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button className="text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users size={14} />
                        <span>{notice.recipients}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab - Desktop */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Notifications</h2>
                <button 
                  onClick={() => setUnreadNotifications(0)}
                  className="text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-3">
                {/* New Booking Notifications */}
                <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-xl p-4 border border-cyan-500/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-white">New Booking Request</h4>
                        <span className="text-xs text-gray-400">2 hours ago</span>
                      </div>
                      <p className="text-xs text-gray-300">
                        Kasun Perera submitted a booking request for "Modern Boarding House near SLIIT"
                      </p>
                      <button 
                        onClick={() => setActiveTab('bookings')}
                        className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        View Request <ArrowRight size={12} />
                      </button>
                    </div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Payment Uploaded Notification */}
                <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Upload size={20} className="text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-white">Payment Slip Uploaded</h4>
                        <span className="text-xs text-gray-400">5 hours ago</span>
                      </div>
                      <p className="text-xs text-gray-300">
                        Nimal Fernando uploaded payment slip for booking #BK003
                      </p>
                      <button 
                        onClick={() => setActiveTab('bookings')}
                        className="mt-2 text-xs text-green-400 hover:text-green-300 flex items-center gap-1"
                      >
                        <span>Verify Payment</span> <ArrowRight size={12} />
                      </button>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Payment Reminder Notification */}
                <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl p-4 border border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle size={20} className="text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-white">Payment Reminder</h4>
                        <span className="text-xs text-gray-400">1 day ago</span>
                      </div>
                      <p className="text-xs text-gray-300">
                        {overdueCount} tenants have overdue payments totaling Rs.{overdueAmount.toLocaleString()}
                      </p>
                      <button 
                        onClick={() => setActiveTab('payments')}
                        className="mt-2 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        <span>View Payments</span> <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Review Notification */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star size={20} className="text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-white">New Review</h4>
                        <span className="text-xs text-gray-400">2 days ago</span>
                      </div>
                      <p className="text-xs text-gray-300">
                        Alice Perera left a 5-star review for Sunrise Boarding House
                      </p>
                      <div className="mt-2 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Notification */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Settings size={20} className="text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-white">System Update</h4>
                        <span className="text-xs text-gray-400">3 days ago</span>
                      </div>
                      <p className="text-xs text-gray-300">
                        New features added: Automated receipt generation and payment tracking
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Mobile view continues from here  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
      {/* Header - Mobile */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building className="text-cyan-400" size={24} />
              <h1 className="text-lg font-bold text-white">Owner Dashboard</h1>
            </div>
            <button className="p-2 hover:bg-white/5 rounded-lg relative">
              <Bell className="text-gray-400 hover:text-white" size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
          
          {/* Payment Button - Mobile */}
          <button
            className="w-full px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-indigo-500 text-white shadow-md hover:scale-105 transition text-sm"
            onClick={() => navigate('/payment-rental')}
          >
            Manage Payments
          </button>
        </div>
      </div>
      
      <div className="text-center py-20 text-white">
        <p>Mobile view - Work in progress</p>
      </div>
    </div>
  );
}