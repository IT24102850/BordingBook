import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, AlertCircle, Trash2, Star, MapPin, Home, Users as UsersIcon, CreditCard } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  roomId: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  monthlyRent: number;
  dueDate: string;
  checkInDate: string;
  phone?: string;
  email?: string;
}

interface Room {
  id: string;
  roomNumber: string;
  bedCount: number;
  occupiedBeds: number;
  price: number;
  status: 'available' | 'partial' | 'full';
  tenants: Tenant[];
}

interface BoardingHouse {
  id: string;
  name: string;
  address: string;
  image: string;
  rating: number;
  totalReviews: number;
  totalRooms: number;
  occupiedRooms: number;
  rooms: Room[];
}

// Utility function to calculate days overdue
const getDaysOverdue = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const isOverdue10Plus = (dueDate: string) => getDaysOverdue(dueDate) >= 10;

// Mock boarding places
const mockBoardingPlaces: BoardingHouse[] = [
  {
    id: '1',
    name: 'Sunrise Boarding House',
    address: '123 Malabe, Colombo',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    totalReviews: 23,
    totalRooms: 12,
    occupiedRooms: 8,
    rooms: [
      {
        id: '101',
        roomNumber: '101',
        bedCount: 2,
        occupiedBeds: 2,
        price: 15000,
        status: 'full',
        tenants: [
          { id: 't1', name: 'Alice Perera', roomId: '101', paymentStatus: 'paid', monthlyRent: 15000, dueDate: '2026-02-28', checkInDate: '2024-01-15', phone: '+94 77 123 4567', email: 'alice@email.com' },
          { id: 't2', name: 'Bob Silva', roomId: '101', paymentStatus: 'overdue', monthlyRent: 15000, dueDate: '2026-02-05', checkInDate: '2024-02-01', phone: '+94 77 234 5678', email: 'bob@email.com' },
        ]
      },
      {
        id: '102',
        roomNumber: '102',
        bedCount: 3,
        occupiedBeds: 2,
        price: 18000,
        status: 'partial',
        tenants: [
          { id: 't3', name: 'Charlie Brown', roomId: '102', paymentStatus: 'overdue', monthlyRent: 18000, dueDate: '2026-01-15', checkInDate: '2024-01-10', phone: '+94 77 345 6789', email: 'charlie@email.com' },
          { id: 't4', name: 'Dana White', roomId: '102', paymentStatus: 'pending', monthlyRent: 18000, dueDate: '2026-03-05', checkInDate: '2024-03-01', phone: '+94 77 456 7890', email: 'dana@email.com' },
        ]
      },
      {
        id: '103',
        roomNumber: '103',
        bedCount: 2,
        occupiedBeds: 0,
        price: 14000,
        status: 'available',
        tenants: []
      },
    ]
  },
  {
    id: '2',
    name: 'Green Villa Boarding',
    address: '45 Kaduwela, Colombo',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    rating: 4.2,
    totalReviews: 15,
    totalRooms: 8,
    occupiedRooms: 5,
    rooms: [
      {
        id: '201',
        roomNumber: '201',
        bedCount: 2,
        occupiedBeds: 2,
        price: 12000,
        status: 'full',
        tenants: [
          { id: 't5', name: 'Eve Johnson', roomId: '201', paymentStatus: 'paid', monthlyRent: 12000, dueDate: '2026-02-25', checkInDate: '2024-02-01', phone: '+94 77 567 8901', email: 'eve@email.com' },
          { id: 't6', name: 'Frank Miller', roomId: '201', paymentStatus: 'paid', monthlyRent: 12000, dueDate: '2026-03-10', checkInDate: '2024-03-10', phone: '+94 77 678 9012', email: 'frank@email.com' },
        ]
      },
      {
        id: '202',
        roomNumber: '202',
        bedCount: 2,
        occupiedBeds: 1,
        price: 12000,
        status: 'partial',
        tenants: [
          { id: 't7', name: 'Grace Lee', roomId: '202', paymentStatus: 'overdue', monthlyRent: 12000, dueDate: '2026-01-10', checkInDate: '2024-01-10', phone: '+94 77 789 0123', email: 'grace@email.com' },
        ]
      },
    ]
  },
];

export default function BoardingPlaceDetail() {
  const navigate = useNavigate();
  const { placeId } = useParams<{ placeId: string }>();
  const [removedTenants, setRemovedTenants] = useState<Set<string>>(new Set());

  const place = mockBoardingPlaces.find(p => p.id === (placeId || '1'));
  if (!place) return <div className="text-white p-4">Boarding place not found</div>;

  const allTenants = place.rooms.flatMap(r => r.tenants).filter(t => !removedTenants.has(t.id));
  const paidCount = allTenants.filter(t => t.paymentStatus === 'paid').length;
  const overdueCount = allTenants.filter(t => t.paymentStatus === 'overdue').length;
  const totalCollected = allTenants.filter(t => t.paymentStatus === 'paid').reduce((sum, t) => sum + t.monthlyRent, 0);

  const handleRemoveTenant = (tenantId: string) => {
    const newRemoved = new Set(removedTenants);
    newRemoved.add(tenantId);
    setRemovedTenants(newRemoved);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1124] via-[#131d3a] to-[#0b132b]">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/payment-rental')}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{place.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-cyan-400" />
                  {place.address}
                </div>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  {place.rating} ({place.totalReviews} reviews)
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{place.occupiedRooms}/{place.totalRooms}</p>
              <p className="text-xs text-gray-400">Rooms Occupied</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Total Tenants</p>
            <p className="text-2xl font-bold text-white">{allTenants.length}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Paid</p>
            <p className="text-2xl font-bold text-green-400">{paidCount}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Overdue</p>
            <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
            <p className="text-xs text-gray-400 mb-1">Total Collected</p>
            <p className="text-2xl font-bold text-cyan-400">Rs.{totalCollected.toLocaleString()}</p>
          </div>
        </div>

        {/* Rooms Section */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Home size={20} className="text-cyan-400" />
            Rooms Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {place.rooms.map(room => {
              const activeTenantsInRoom = room.tenants.filter(t => !removedTenants.has(t.id));
              return (
                <div key={room.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Room {room.roomNumber}</h3>
                  <div className="space-y-2 text-xs text-gray-300">
                    <p>Capacity: <span className="text-white">{room.bedCount} bed(s)</span></p>
                    <p>Occupied: <span className="text-white">{activeTenantsInRoom.length}/{room.bedCount}</span></p>
                    <p>Price: <span className="text-white">Rs.{room.price.toLocaleString()}</span></p>
                    <p className={`inline-block px-2 py-1 rounded text-[10px] ${
                      room.status === 'available' ? 'bg-green-500/20 text-green-300' :
                      room.status === 'partial' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Calendar */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-cyan-400" />
            Payment Schedule & Overdue Tracking
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allTenants
              .slice()
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map(tenant => {
                const daysOverdue = getDaysOverdue(tenant.dueDate);
                const isOverdue10 = isOverdue10Plus(tenant.dueDate);
                const room = place.rooms.find(r => r.id === tenant.roomId);
                const dueDateObj = new Date(tenant.dueDate);
                const formattedDate = dueDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                return (
                  <div
                    key={tenant.id}
                    className={`p-3 rounded-lg border flex items-center justify-between ${
                      tenant.paymentStatus === 'paid'
                        ? 'bg-green-500/10 border-green-500/20'
                        : daysOverdue > 0 && daysOverdue < 10
                        ? 'bg-yellow-500/10 border-yellow-500/20'
                        : isOverdue10
                        ? 'bg-red-500/10 border-red-500/20'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm text-white font-semibold">{tenant.name}</p>
                      <p className="text-xs text-gray-400">Room {room?.roomNumber} • Rs.{tenant.monthlyRent.toLocaleString()}</p>
                      {tenant.phone && <p className="text-xs text-gray-500">{tenant.phone}</p>}
                    </div>
                    <div className="text-right mr-3">
                      <p className={`text-xs font-semibold ${
                        tenant.paymentStatus === 'paid'
                          ? 'text-green-300'
                          : daysOverdue > 0
                          ? 'text-red-300'
                          : 'text-cyan-300'
                      }`}>
                        {formattedDate}
                      </p>
                      {daysOverdue > 0 && (
                        <p className="text-[10px] text-red-400 font-semibold">{daysOverdue} days overdue</p>
                      )}
                    </div>
                    {isOverdue10 && (
                      <button
                        onClick={() => handleRemoveTenant(tenant.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
                        title="Remove tenant (10+ days overdue)"
                      >
                        <Trash2 size={14} className="text-white" />
                      </button>
                    )}
                    {daysOverdue > 0 && daysOverdue < 10 && (
                      <div className="p-2 bg-yellow-600/30 rounded-lg">
                        <AlertCircle size={14} className="text-yellow-300" />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

