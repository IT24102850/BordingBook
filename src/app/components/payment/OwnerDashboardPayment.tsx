import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ChevronDown, Trash2, AlertCircle, Eye } from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  roomId: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  monthlyRent: number;
  dueDate: string; // YYYY-MM-DD
  checkInDate: string;
}

interface Room {
  id: string;
  roomNumber: string;
  bedCount: number;
  tenants: Tenant[];
}

interface BoardingHouse {
  id: string;
  name: string;
  address: string;
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

// Utility function to check if overdue 10+ days
const isOverdue10Plus = (dueDate: string) => getDaysOverdue(dueDate) >= 10;

// Mock boarding places with rooms and tenants
const mockBoardingPlaces: BoardingHouse[] = [
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
          { id: 't1', name: 'Alice Perera', roomId: '101', paymentStatus: 'paid', monthlyRent: 15000, dueDate: '2026-02-28', checkInDate: '2024-01-15' },
          { id: 't2', name: 'Bob Silva', roomId: '101', paymentStatus: 'overdue', monthlyRent: 15000, dueDate: '2026-02-05', checkInDate: '2024-02-01' },
        ]
      },
      {
        id: '102',
        roomNumber: '102',
        bedCount: 3,
        tenants: [
          { id: 't3', name: 'Charlie Brown', roomId: '102', paymentStatus: 'overdue', monthlyRent: 18000, dueDate: '2026-01-15', checkInDate: '2024-01-10' },
          { id: 't4', name: 'Dana White', roomId: '102', paymentStatus: 'pending', monthlyRent: 18000, dueDate: '2026-03-05', checkInDate: '2024-03-01' },
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
          { id: 't5', name: 'Eve Johnson', roomId: '201', paymentStatus: 'paid', monthlyRent: 12000, dueDate: '2026-02-25', checkInDate: '2024-02-01' },
          { id: 't6', name: 'Frank Miller', roomId: '201', paymentStatus: 'paid', monthlyRent: 12000, dueDate: '2026-03-10', checkInDate: '2024-03-10' },
        ]
      },
      {
        id: '202',
        roomNumber: '202',
        bedCount: 2,
        tenants: [
          { id: 't7', name: 'Grace Lee', roomId: '202', paymentStatus: 'overdue', monthlyRent: 12000, dueDate: '2026-01-10', checkInDate: '2024-01-10' },
        ]
      },
    ]
  },
];

export default function OwnerDashboardPayment() {
  const navigate = useNavigate();
  const [selectedPlace, setSelectedPlace] = useState<string>(mockBoardingPlaces[0].id);
  const [showDropdown, setShowDropdown] = useState(false);
  const [removedTenants, setRemovedTenants] = useState<Set<string>>(new Set());

  // Get selected boarding place and its data
  const currentPlace = mockBoardingPlaces.find(p => p.id === selectedPlace)!;
  const allTenantsInPlace = currentPlace.rooms.flatMap(r => r.tenants).filter(t => !removedTenants.has(t.id));
  const paidTenants = allTenantsInPlace.filter(t => t.paymentStatus === 'paid');
  const overdueTenants = allTenantsInPlace.filter(t => t.paymentStatus === 'overdue');
  const pendingTenants = allTenantsInPlace.filter(t => t.paymentStatus === 'pending');

  const totalCollected = paidTenants.reduce((sum, t) => sum + t.monthlyRent, 0);
  const totalPending = overdueTenants.length + pendingTenants.length;

  const handleRemoveTenant = (tenantId: string) => {
    const newRemoved = new Set(removedTenants);
    newRemoved.add(tenantId);
    setRemovedTenants(newRemoved);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Payments & Receipts</h2>
        
        {/* Boarding Place Selector & View Details Button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white hover:bg-white/10 transition-all"
            >
              {currentPlace.name}
              <ChevronDown size={14} />
            </button>
            
            {showDropdown && (
              <div className="absolute top-full right-0 mt-1 bg-[#181f36] border border-white/10 rounded-lg shadow-lg z-10">
                {mockBoardingPlaces.map(place => (
                  <button
                    key={place.id}
                    onClick={() => {
                      setSelectedPlace(place.id);
                      setShowDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-xs hover:bg-white/10 ${
                      place.id === selectedPlace ? 'text-cyan-300 font-semibold' : 'text-gray-300'
                    }`}
                  >
                    {place.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => navigate(`/payment-rental/${selectedPlace}`)}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg text-xs font-medium hover:shadow-lg transition-all"
          >
            <Eye size={14} />
            View Details
          </button>
        </div>
      </div>

      {/* Calendar with Due Dates */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
        <h3 className="text-sm font-medium text-cyan-300 mb-3">Payment Due Dates Calendar</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {allTenantsInPlace
            .slice()
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .map(tenant => {
              const daysOverdue = getDaysOverdue(tenant.dueDate);
              const isOverdue10 = isOverdue10Plus(tenant.dueDate);
              const room = currentPlace.rooms.find(r => r.id === tenant.roomId);
              const dueDateObj = new Date(tenant.dueDate);
              const formattedDate = dueDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div
                  key={tenant.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
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
                    <p className="text-xs text-white font-semibold">{tenant.name}</p>
                    <p className="text-[10px] text-gray-400">Room {room?.roomNumber} • Rs.{tenant.monthlyRent.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
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
                      <p className="text-[10px] text-red-400">{daysOverdue} days overdue</p>
                    )}
                  </div>
                  {isOverdue10 && (
                    <button
                      onClick={() => handleRemoveTenant(tenant.id)}
                      className="ml-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
                      title="Remove tenant (10+ days overdue)"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  )}
                  {daysOverdue > 0 && daysOverdue < 10 && (
                    <div className="ml-2 p-2 bg-yellow-600/30 rounded-lg">
                      <AlertCircle size={14} className="text-yellow-300" />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Rooms & Roommates Section */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
        <h3 className="text-sm font-medium text-cyan-300 mb-3">Rooms & Roommates</h3>
        <div className="space-y-3">
          {currentPlace.rooms.map(room => {
            const activeTenantsInRoom = room.tenants.filter(t => !removedTenants.has(t.id));
            if (activeTenantsInRoom.length === 0) return null;
            return (
              <div key={room.id} className="bg-white/5 rounded-lg p-3">
                <p className="text-xs font-semibold text-white mb-2">Room {room.roomNumber} ({activeTenantsInRoom.length} tenants)</p>
                <div className="space-y-1">
                  {activeTenantsInRoom.map(tenant => (
                    <div key={tenant.id} className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-300">{tenant.name}</span>
                      <span className={`px-2 py-1 rounded ${
                        tenant.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-300' :
                        tenant.paymentStatus === 'overdue' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {tenant.paymentStatus.charAt(0).toUpperCase() + tenant.paymentStatus.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 col-span-2">
          <h3 className="text-sm font-medium text-cyan-300 mb-3">All Tenant Payments</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allTenantsInPlace.length > 0 ? (
              allTenantsInPlace.map(tenant => {
                const room = currentPlace.rooms.find(r => r.id === tenant.roomId);
                const daysOverdue = getDaysOverdue(tenant.dueDate);
                return (
                  <div key={tenant.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-xs text-white">{tenant.name}</p>
                      <p className="text-[10px] text-gray-400">Room {room?.roomNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white">Rs.{tenant.monthlyRent.toLocaleString()}</p>
                      <p className={`text-[10px] ${
                        tenant.paymentStatus === 'paid' ? 'text-green-400' :
                        tenant.paymentStatus === 'overdue' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {tenant.paymentStatus.charAt(0).toUpperCase() + tenant.paymentStatus.slice(1)}
                        {daysOverdue > 0 && ` (${daysOverdue}d)`}
                      </p>
                    </div>
                    <button className="p-1 hover:bg-white/10 rounded">
                      <Download size={14} className="text-cyan-400" />
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-gray-400">No active tenants in this boarding place</p>
            )}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-sm font-medium text-cyan-300 mb-3">Summary</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-400">Total Collected</p>
              <p className="text-lg font-bold text-white">Rs.{totalCollected.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Pending/Overdue</p>
              <p className="text-lg font-bold text-yellow-400">{totalPending}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Tenants</p>
              <p className="text-lg font-bold text-white">{allTenantsInPlace.length}</p>
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
  );
}
